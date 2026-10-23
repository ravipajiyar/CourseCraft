# Course-Craft

An AI-powered web app that analyzes your knowledge gaps and generates a personalized, structured course for the topic you want to learn.

## What it does

1. You enter any topic (e.g. "golang", "Machine Learning").
2. The AI generates a short knowledge-gap assessment — 2 questions each at **basic**, **intermediate**, and **advanced** difficulty (6 total).
3. You answer the questions (chat-style, one at a time with progress tracking).
4. The AI compares your answers against expected answers, evaluates your understanding level, and generates a **custom course** with modules ordered from basics to advanced.
5. The generated course is displayed on a course page where you can browse modules, topics, and fetch detailed AI notes for any topic.

## Architecture

The project is split into 3 services:

```
Course-Craft/
├── client/         → Frontend (Vite + React + Tailwind)
│   └── vite-project/
├── server/         → Backend API (Node.js + Express + MongoDB + JWT auth)
├── NLP/            → LLM service (Python + Flask + Google Gemini)
├── render.yaml     → Render.com deployment config
└── README.md
```

### 1. NLP Service (`NLP/`) — Python Flask, runs on port 3001
- `api.py` — Flask app exposing the LLM endpoints
  - `POST /generate-questions` → returns questions by difficulty
  - `POST /generate-module` → evaluates answers + generates the course
  - `POST /get-notes` → generates notes for a topic
- `gemini_client.py` — shared Gemini client with **automatic model fallback**
- `question_generator_gemini.py` — Gemini prompt that produces basic/intermediate/advanced questions
- `expected_answer_generator.py` — Gemini prompt that writes expected answers for the generated questions
- `generate_module.py` — Gemini prompt that compares user answers vs expected answers and builds the incremental course modules
- `get_notes_on.py` — Gemini prompt for topic notes
- Requires a `GOOGLE_API_KEY` in `NLP/.env`

> **Model fallback.** Google retires model versions often (`gemini-1.5-flash` and `gemini-2.5-flash` now return 404 for new accounts) and the Gemini free tier enforces a **per-model** request quota. `gemini_client.py` therefore tries an ordered list of models and moves to the next one when one is retired or rate limited. Pin a specific model with `GEMINI_MODEL` in `NLP/.env` — the rest stay as fallbacks.

### 1b. Local MongoDB (`server/scripts/dev-mongo.mjs`)
The MongoDB Atlas cluster in `server/config.env` (`cluster0.whhqiyu.mongodb.net`) no longer resolves, so `npm run mongo:dev` starts a self-contained `mongod` on `:27017` with data in `server/.mongo-data`. Point `DATABASE` at it instead of the Atlas URI.

### 2. Backend (`server/`) — Node/Express, runs on port 3000
- `app.js` / `server.js` — Express app + MongoDB (Mongoose) connection
- `router/userRouter.js` — routes under `/api/user`
  - `POST /login`, `POST /signup` — JWT auth (bcrypt hashed passwords)
  - `POST /generate-questions` — proxies to NLP service
  - `POST /generate-module` — proxies to NLP service, saves course to MongoDB
  - `POST /get-notes` — proxies to NLP service
- `models/` — `userModel` (email/name/password/courses) and `courseModel` (title + modules with contents)
- `controller/` — `authController` (auth + proxy logic, NLP URL from `NLP_URL`), `errorController`
- `utils/` — `appError`, `catchAsync`
- Config in `server/config.env` (port, `NLP_URL`, MongoDB connection string, JWT secret)

### 3. Frontend (`client/vite-project/`) — React 18 + Vite 5, dev server on port 5173
- **Pages** — `landingPage`, `About`, `Features`, `CoursePage` (course display), `GenChat` (assessment chat), `ViewCourses` (saved course list), `CourseContent` (course player), `NotFound` (404)
- **Components** — `CourseSelector` (topic input → triggers question generation), `ChatAI` (one-question-at-a-time answering UI), `Navbar`, `Login`, and the shared `ui/` primitives: `Logo`, `BackgroundFX`, `AiLoader`, `SectionHeader`, `FeatureCard`, `StepCard`, `Footer`, `ScrollToTop`
- **Contexts** — `Questioncontext` (questions + topic), `courseContext` (generated course), `Usercontext` (auth user). All three persist to `sessionStorage`, so a refresh mid-flow never loses the assessment or the generated course.
- **API config** — every backend URL comes from `src/config/api.js`, driven by `import.meta.env.VITE_API_URL`
- Icons are inline SVGs from `react-icons/fa6` (no icon webfont, no extra request)
- Uses `marked` to render Markdown notes from the AI

## Design system

The frontend uses a bespoke Tailwind design system — **DaisyUI was removed** (daisyUI 5 targets Tailwind v4 and, when loaded into a v3 project, ships colliding utility classes like `.glass` and `.btn` that silently override the custom ones).

- **Palette** — near-black navy base (`#05050A` / `#0B0B15`) with a violet → indigo → cyan brand ramp, plus amber / mint / rose accents
- **Type** — Plus Jakarta Sans for UI, JetBrains Mono for code and numeric accents
- **Tokens** — `tailwind.config.js` defines the `ink` / `chalk` / `brand` / `iris` / `aqua` / `mint` / `amber` / `rose` scales, plus custom spacing, radii, shadows, animations, and an extended opacity scale
- **Component classes** — `src/index.css` defines `.glass`, `.glass-strong`, `.btn-brand`, `.btn-ghost`, `.field`, `.ring-gradient`, `.text-gradient(-animated)`, `.bg-grid`, `.bg-dots`, `.markdown-body` and the `nice-scroll` / fade-up animation utilities
- **Accessibility** — every text/background pair meets WCAG AA (4.5:1) against the dark base, and interactive targets are at least 32 px on mobile

## How to run locally

### The one-liner

```bash
./start-local.sh
```

It starts all four services, waits for each one to be ready, and prints the URLs. Stop them with `./start-local.sh stop`.

| Service | Port | Notes |
| --- | --- | --- |
| MongoDB | 27017 | local `mongod`, data in `server/.mongo-data` |
| NLP (Flask + Gemini) | 3011 | reads `NLP/.env` for `GOOGLE_API_KEY` |
| API (Express) | 3010 | reads `server/config.env` |
| Frontend (Vite) | 5173 | reads `client/vite-project/.env` |

Ports 3000 and 3001 are deliberately avoided because they are commonly taken by other local projects — override with `MONGO_PORT`, `NLP_PORT`, `API_PORT`, `WEB_PORT` if you need to.

**Test account:** `testuser@example.com` / `Test@12345` (created in the local MongoDB).

### Running the pieces by hand

```bash
# 1. MongoDB
cd server && npm install && npm run mongo:dev

# 2. NLP service
cd NLP && pip install -r requirements.txt
# NLP/.env needs: GOOGLE_API_KEY=<your gemini api key>
NLP_PORT=3011 venv/bin/python api.py

# 3. Backend
cd server && npm install
PORT=3010 NLP_URL=http://127.0.0.1:3011 \
  DATABASE=mongodb://127.0.0.1:27017/CourseCraft node server.js

# 4. Frontend
cd client/vite-project && npm install
printf 'VITE_API_URL=http://127.0.0.1:3010\n' > .env
npm run dev
```

Then open the Vite dev URL, enter a topic, answer the questions, and view your generated course.

> **Gemini quota.** The free tier allows ~20 requests per model per day and a full flow burns 3–4 of them. When every model in the fallback list is exhausted the API answers `503` with *"The AI service is rate limited right now"*, and the UI shows that message inline.

### Running the frontend without any backend

A local mock of the whole API ships with the frontend so the UI can be exercised without MongoDB or a Gemini key:

```bash
cd client/vite-project
npm run mock:api                                  # serves the mock on :3100
VITE_API_URL=http://127.0.0.1:3100 npm run dev    # run the app against it
```

## Verification scripts

Headless-Chrome (CDP) checks used to validate the UI — they are dev-only helpers and are not part of the app bundle:

| Script | What it checks |
| --- | --- |
| `npm run verify:ui` | Every route renders, fonts/glass/gradients are applied, no console errors, no horizontal overflow |
| `npm run verify:flow` | Full flow: topic → assessment → course → module expand → notes → player → course list |
| `npm run verify:flow2` | Same flow plus refresh persistence and client-side navigation into the player |
| `npm run verify:accordion` | Module accordion expands/collapses correctly and notes render in the player |
| `npm run audit:tap` | Mobile tap-target audit (flags interactive elements under 32 px) |
| `npm run probe` | One-off DOM/style probe |

Run them with the dev server up: `npm run dev` in one terminal, `npm run verify:ui` in another.

## Tech stack

- **LLM:** Google Gemini via `google-generativeai` (model list with automatic fallback, see `NLP/gemini_client.py`)
- **NLP service:** Python 3 + Flask (gunicorn in production)
- **Backend:** Node.js, Express, Mongoose (MongoDB), JWT, bcrypt
- **Frontend:** React 18, Vite 5, Tailwind CSS 3 (custom design system), React Router 6, react-icons, marked, axios

---

# Deploying for free

Three pieces, three free tiers:

| Piece | Host | Free tier |
| --- | --- | --- |
| Frontend (Vite SPA) | **Vercel** | Hobby — unlimited static builds |
| API + NLP service | **Render** | 750 service-hours/month, 512 MB RAM, sleeps after 15 min idle |
| Database | **MongoDB Atlas** | M0 cluster, 512 MB shared |

> **Why the API and the NLP service share one Render service:** the free tier
> allows 750 service-hours per month *in total* for a project. Two
> always-on services would need ~1440 hours, so one would get evicted
> mid-day. `server/scripts/start-production.sh` runs the Express API and the
> Flask NLP service as two processes inside a single container — Flask stays
> on `127.0.0.1` and only the API is exposed.

## 1. MongoDB Atlas (the database)

Render dropped its free MongoDB offering, so use Atlas.

1. Sign up at [mongodb.com/atlas](https://www.mongodb.com/atlas) and create a
   **free M0** cluster.
2. **Database Access** → add a user with a password.
3. **Network Access** → *Allow access from anywhere* (`0.0.0.0/0`). The
   free cluster has no IP allow-list on paid plans, and Render's IPs are
   dynamic.
4. Copy the connection string — it looks like
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/CourseDB?retryWrites=true&w=majority`.
   The `<password>` is a literal placeholder; replace it with your real
   password, **URL-encoding** it (`@` → `%40`, `:` → `%3A`).

> The old cluster in `server/config.env` (`cluster0.whhqiyu.mongodb.net`) no
> longer resolves, so a new M0 cluster is required.

## 2. Render (the API + NLP service)

`render.yaml` is a [Blueprint](https://render.com/docs/blueprint-spec) and
describes the whole service.

1. Push these changes to GitHub.
2. On Render, choose **New → Blueprint**, pick the repository, and apply.
3. Render creates `coursecraft-api` and asks for the two values it cannot
   invent:
   - `DATABASE` — the Atlas connection string from step 1.
   - `GOOGLE_API_KEY` — a Gemini key from
     [aistudio.google.com/apikey](https://aistudio.google.com/apikey).
4. Wait for the build. The log should show `NLP service is up.` followed by
   `Listening on port <port>`.

The service URL looks like `https://coursecraft-api.onrender.com` — that is
the value the frontend needs.

**Optional environment variables** (Render dashboard → Environment):

| Key | Meaning |
| --- | --- |
| `GEMINI_MODEL` | Pin the first model to try (default `gemini-3.8-flash`) |
| `NLP_URL` | Only if the NLP service is moved elsewhere — defaults to `http://127.0.0.1:3001` |
| `JWT_SECRET` | Auto-generated by Render; set it yourself for a stable value |
| `JWT_EXPRIES_IN` | Token lifetime, default `10d` |

**Health check** — Render polls `GET /health`, which returns
`{"status":"ok"}`.

## 3. Vercel (the frontend)

1. Import the repository at [vercel.com/new](https://vercel.com/new).
2. Set **Root Directory** to `client/vite-project`.
3. Framework preset **Vite**, build command `npm run build`, output
   directory `dist`. `vercel.json` in that folder already configures this
   plus the SPA rewrite, so deep links like `/course` and `/genchat` do not
   404 on refresh.
4. Add the environment variable:
   - `VITE_API_URL` = `https://coursecraft-api.onrender.com`
   (no trailing slash — it is a **build-time** variable, so Vercel must
   rebuild after it changes: *Settings → Environment Variables → Save →
   Deployments → redeploy*.)
5. Deploy. Vercel prints a URL like `https://coursecraft.vercel.app`.

> **Note:** `node_modules` is no longer committed to the repository — it is
> ignored, so Render installs the dependencies for Linux during the build
> instead of cloning a 193 MB folder of macOS packages.

## Free-tier behaviour to expect

- **The service sleeps.** After ~15 minutes without traffic Render stops the
  container. The next request wakes it, which takes 30–60 seconds. The
  frontend retries fast failures (502/503) automatically, so the first
  visitor waits instead of seeing an error.
- **The Gemini free tier is the real limit.** It allows roughly 20 requests
  per model per day, and a full flow (questions → course → notes) uses 3–4.
  `NLP/gemini_client.py` falls back through four models, but once they are
  all exhausted the API answers `503` with *"The AI service is rate limited
  right now"*. Use a paid Gemini key for anything public.
- **Long generations can hit the host's request timeout.** The API gives up
  after 95 s and returns a readable error.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Service deploys but every request 500s | `DATABASE` is not set, or the Atlas IP allow-list blocks Render |
| "Could not reach the AI service" | The NLP process died — check the Render logs for the gunicorn output |
| "The AI service is rate limited" | Gemini quota exhausted — wait for the reset or use a paid key |
| Frontend shows the wrong API URL | `VITE_API_URL` is read at build time — redeploy on Vercel after changing it |
| The API talks to the wrong service | `NLP_URL` must match where Flask listens (`http://127.0.0.1:3001` in the Blueprint) |
| `/course` returns 404 on refresh | The Vercel rewrite is missing — check `client/vite-project/vercel.json` |
