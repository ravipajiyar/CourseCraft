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

- **LLM:** Google Gemini (`gemini-1.5-flash`) via `google-generativeai`
- **NLP service:** Python 3 + Flask
- **Backend:** Node.js, Express, Mongoose (MongoDB), JWT, bcrypt
- **Frontend:** React 18, Vite 5, Tailwind CSS 3 (custom design system), React Router 6, react-icons, marked, axios

## Deployment

`render.yaml` defines three Render services:
- `backend-service` → `cd server && npm start`
- `nlp-service` → `cd NLP && python main.py`
- `frontend-service` → build `vite-project` and publish `dist`

> **Configuration:**
> - Frontend → set `VITE_API_URL` to the deployed backend URL (build-time variable, see `client/vite-project/.env.example`).
> - Backend → set `NLP_URL` to the deployed NLP service URL (see `server/config.env`).
> - NLP → set `GOOGLE_API_KEY` in `NLP/.env`, and optionally `GEMINI_MODEL` to pin a model.
