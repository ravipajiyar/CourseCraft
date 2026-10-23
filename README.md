# 🎓 CourseCraft

[![Built with React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://expressjs.com/)
[![Flask](https://img.shields.io/badge/Flask-3.1-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> **CourseCraft** — an AI-powered learning platform that diagnoses your knowledge gaps and generates a personalised, structured course around exactly what you don't know yet.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Pages & Routes](#-pages--routes)
- [Components](#-components)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [Google Gemini & Model Fallback](#-google-gemini--model-fallback)
- [Design System](#-design-system)
- [Verification Scripts](#-verification-scripts)
- [Deployment](#-deployment)
- [Future Improvements](#-future-improvements)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

---

## 📖 Overview

CourseCraft replaces the generic syllabus with an assessment-first learning loop:

1. **You name a topic** — anything from `golang` to *Machine Learning*.
2. **The AI probes your level** — six questions, two each at **basic**, **intermediate**, and **advanced** difficulty.
3. **You answer in a chat-style flow** — one question at a time with progress tracking.
4. **The AI grades your answers** against expert expectations and decides your real level.
5. **You get a custom course** — modules and topics ordered from fundamentals up to advanced, with on-demand AI notes for every topic.

The result is a short, focused curriculum that closes your specific gaps instead of replaying what you already know.

---

## ✨ Features

### 🏠 Landing Page
- **Hero** — animated headline, live topic input, and trust markers ("No credit card needed", "Works for any topic")
- **Stats strip** — diagnostic questions, difficulty tiers, topics, personalisation
- **How it works** — three-step explanation of the assessment → generation loop
- **Feature grid** — six value cards (personalised, AI-curated, clear path, gap analysis, deep-dive notes, instant delivery)
- **Final CTA** — jump straight back to the topic input

### 🧠 AI Assessment (`/genchat`)
- **Six-question diagnostic** generated live for the chosen topic
- **Chat-style UI** — one question per screen, previous/next navigation, progress counter
- **Session-safe** — questions, topic, and answers survive a page refresh via `sessionStorage`
- **Graceful failure** — quota, timeout, and unreachable-service errors are shown inline instead of failing silently

### 📚 Course Generation
- **Answer grading** — user answers are compared against AI-generated expected answers
- **Incremental structure** — modules are ordered basics → advanced
- **Persisted** — the generated course is saved to MongoDB through `POST /api/user/generate-module`
- **Loading experience** — branded AI loader while the course is crafted

### 📖 Course Page (`/course`)
- **Course overview** — title, assessed understanding level, module accordion
- **Topic drill-down** — select any topic to fetch AI-generated notes
- **Markdown rendering** — notes render as rich Markdown (headings, lists, tables, code)
- **Module navigation** — jump into the full player

### 🎬 Course Player (`/coursecontent`)
- **Module sidebar** — every module and its topics
- **Focus view** — read a topic's notes without leaving the course
- **Consistent loading/error states** across every notes request

### 🗂 Course Library (`/courselist`)
- **Your latest course** — the course generated in the current session, badged *Generated now*
- **Sample courses** — three example paths (AI, ML fundamentals, deep learning) for orientation

### 🔐 Accounts
- **Login / signup modal** with validation
- **JWT authentication** — bcrypt-hashed passwords, token stored client-side
- Signing in is optional for generating a course; it is there to keep a session identity

### 🎨 User Experience
- **Midnight Aurora design system** — bespoke dark Tailwind theme, no component-library overrides
- **Motion** — fade-up reveals, animated gradients, glass panels
- **Fully responsive** — mobile-first layouts and tap targets ≥ 32 px
- **Cold-start aware client** — retries transient `502/503` responses while a free-tier host wakes up
- **Accessible contrast** — every text/background pair meets WCAG AA on the dark base

---

## 🗺 Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Hero, topic input, how-it-works, features, CTA |
| `/about` | About | Mission, values, and what makes CourseCraft different |
| `/features` | Features | Deep dive into the platform's capabilities |
| `/course` | Course Page | Generated course, module accordion, topic notes |
| `/genchat` | Assessment | Six-question AI diagnostic chat |
| `/courselist` | Course Library | Current course plus sample courses |
| `/coursecontent` | Course Player | Module sidebar and focused topic reading |
| `*` | Not Found | Friendly 404 with a route back home |

---

## 🧩 Components

### Layout
| Component | Description |
|-----------|-------------|
| `Navbar` | Sticky navigation, logo, links, and login entry point |
| `Footer` | Brand block, navigation, and project links |
| `BackgroundFX` | Ambient gradient/grid background layers |
| `ScrollToTop` | Resets scroll position on route change |

### Feature Components
| Component | Description |
|-----------|-------------|
| `CourseSelector` | Topic input that kicks off question generation |
| `ChatAI` | One-question-at-a-time assessment UI with progress and submission |
| `Login` | Sign-in / sign-up modal with validation and JWT handling |

### UI Primitives
| Component | Description |
|-----------|-------------|
| `Logo` | CourseCraft mark |
| `SectionHeader` | Eyebrow + title + subtitle block used across sections |
| `FeatureCard` | Accent-aware icon/description card |
| `StepCard` | Numbered step card for the how-it-works section |
| `AiLoader` | Branded full-container loading state with label and hint |

### State & Config
| Module | Description |
|--------|-------------|
| `Questioncontext` | Topic, generated questions, and answers (`sessionStorage`) |
| `courseContext` | The generated course, shared across pages (`sessionStorage`) |
| `Usercontext` | Authenticated user and token (`sessionStorage`) |
| `config/api.js` | Single source of truth for API URLs, timeouts, and cold-start retries |

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | Component-based UI |
| **Vite 5** | Dev server and production build |
| **Tailwind CSS 3.4** | Bespoke design system (no DaisyUI) |
| **React Router 6** | Client-side routing |
| **react-icons (fa6)** | Inline SVG icon set — no icon webfont request |
| **Axios** | HTTP client with timeouts and cold-start retries |
| **marked** | Markdown rendering for AI notes |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js + Express 4** | REST API |
| **Mongoose 8** | MongoDB models and persistence |
| **JWT + bcryptjs** | Authentication and password hashing |
| **Axios** | Proxying requests to the NLP service |
| **dotenv** | Environment configuration |

### NLP Service
| Technology | Purpose |
|------------|---------|
| **Python 3.13 + Flask 3.1** | LLM microservice |
| **google-generativeai** | Google Gemini client |
| **gunicorn** | Production WSGI server |
| **python-dotenv** | Local configuration |

### Deployment
| Service | Purpose |
|---------|---------|
| **Vercel** | Frontend hosting and CI/CD |
| **Render** | API + NLP service in one container |
| **MongoDB Atlas** | Managed free-tier database |

---

## 🏗 Architecture

CourseCraft is three services designed to run independently in development and together in production:

```
CourseCraft/
├── client/vite-project/   → React SPA (Vite + Tailwind)
├── server/                → Express API (MongoDB + JWT)
├── NLP/                   → Flask LLM service (Google Gemini)
├── render.yaml            → Render Blueprint
├── start-local.sh         → One-command local stack
└── README.md
```

**Request flow**

```
Browser → Express API → Flask NLP service → Google Gemini
                ↓
           MongoDB Atlas
```

The browser never talks to the NLP service or Gemini directly. Express owns auth, validation, persistence, and error translation; Flask owns prompts and the Gemini fallback chain.

> **Production packaging.** The free Render tier allows 750 service-hours per month *per project*; two always-on services would need ~1440. `server/scripts/start-production.sh` therefore runs Express and gunicorn inside one container — Flask binds to `127.0.0.1`, only the API is public.

---

## 📁 Project Structure

```bash
CourseCraft/
├── client/
│   └── vite-project/
│       ├── src/
│       │   ├── components/
│       │   │   ├── ChatAI/          # Assessment chat
│       │   │   ├── CourseSelector/  # Topic input
│       │   │   ├── Login/           # Auth modal
│       │   │   ├── Navbar/
│       │   │   └── ui/              # Logo, cards, loader, footer…
│       │   ├── config/api.js        # API routes, timeouts, retries
│       │   ├── contexts/            # Questions, course, user
│       │   ├── pages/               # Landing, About, Features, Course…
│       │   ├── App.jsx              # Router + providers
│       │   ├── index.css            # Design tokens & component classes
│       │   └── main.jsx
│       ├── scripts/                 # Mock API + headless verification
│       ├── public/
│       ├── index.html
│       ├── tailwind.config.js
│       ├── vite.config.js
│       └── vercel.json              # SPA rewrites for deep links
│
├── server/
│   ├── controller/
│   │   ├── authController.js        # Auth + NLP proxy
│   │   └── errorController.js       # Central error handling
│   ├── models/
│   │   ├── userModel.js
│   │   └── courseModel.js
│   ├── router/
│   │   └── userRouter.js
│   ├── scripts/
│   │   ├── dev-mongo.mjs            # Local mongod
│   │   └── start-production.sh      # Render entry point
│   ├── utils/
│   ├── app.js
│   ├── server.js
│   └── config.env                   # Local-only configuration
│
├── NLP/
│   ├── api.py                       # Flask routes
│   ├── gemini_client.py             # Model fallback + shared client
│   ├── question_generator_gemini.py
│   ├── expected_answer_generator.py
│   ├── generate_module.py
│   ├── get_notes_on.py
│   ├── requirements.txt
│   └── .env                         # GOOGLE_API_KEY (local only)
│
├── .python-version                  # Pins Python 3.13 for Render
├── render.yaml
├── start-local.sh
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** and npm
- **Python 3.13**
- **MongoDB** (local `mongod`, or a free Atlas cluster)
- A **Google Gemini API key** — [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

### The One-Liner

```bash
./start-local.sh
```

It installs missing pieces, starts all four services, waits for each to become ready, and prints the URLs. Stop everything with `./start-local.sh stop`.

| Service | Port | Config |
|---------|------|--------|
| MongoDB | `27017` | data in `server/.mongo-data` |
| NLP (Flask + Gemini) | `3011` | `NLP/.env` |
| API (Express) | `3010` | `server/config.env` |
| Frontend (Vite) | `5173` | `client/vite-project/.env` |

> Ports `3000` and `3001` are deliberately avoided because other local projects commonly occupy them. Override with `MONGO_PORT`, `NLP_PORT`, `API_PORT`, `WEB_PORT`.

**Test account:** `testuser@example.com` / `Test@12345`

### Manual Setup

```bash
# 0. Environment files
printf 'GOOGLE_API_KEY=your_gemini_key\n' > NLP/.env
printf 'VITE_API_URL=http://127.0.0.1:3010\n' > client/vite-project/.env

# 1. MongoDB
cd server && npm install && npm run mongo:dev

# 2. NLP service
cd NLP && pip install -r requirements.txt
NLP_PORT=3011 venv/bin/python api.py

# 3. API
cd server
PORT=3010 NLP_URL=http://127.0.0.1:3011 \
  DATABASE=mongodb://127.0.0.1:27017/CourseCraft \
  JWT_SECRET=change_me node server.js

# 4. Frontend
cd client/vite-project && npm install && npm run dev
```

Open the Vite URL, enter a topic, answer the six questions, and browse your generated course.

### Environment Variables

**Frontend** (`client/vite-project/.env`, build-time)

| Key | Example | Notes |
|-----|---------|-------|
| `VITE_API_URL` | `http://127.0.0.1:3010` | Must be set **before** `npm run build` |

**API** (`server/config.env` locally, real env vars in production)

| Key | Example | Notes |
|-----|---------|-------|
| `PORT` | `3010` | Render injects its own |
| `NLP_URL` | `http://127.0.0.1:3011` | Where Flask listens |
| `DATABASE` | `mongodb+srv://…` | Accepts a `<PASSWORD>` placeholder |
| `DATABASE_PASSWORD` | `…` | Substituted into `DATABASE` |
| `JWT_SECRET` | `…` | Use a strong random value |
| `JWT_EXPRIES_IN` | `10d` | Token lifetime |

**NLP** (`NLP/.env` locally, Render env vars in production)

| Key | Example | Notes |
|-----|---------|-------|
| `GOOGLE_API_KEY` | `AIza…` | Never commit this |
| `GEMINI_MODEL` | `gemini-3.8-flash` | Optional first model to try |
| `NLP_PORT` / `PORT` | `3011` / `3001` | Flask bind port |

### Running Without a Backend

A mock of the full API ships with the frontend so the UI can be exercised without MongoDB, Flask, or a Gemini key:

```bash
cd client/vite-project
npm run mock:api                                  # mock API on :3100
VITE_API_URL=http://127.0.0.1:3100 npm run dev    # app against the mock
```

---

## 🔌 API Reference

All API routes are mounted under `/api/user` and return JSON.

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `POST` | `/api/user/signup` | `{ name, email, password, confirmPassword }` | Create an account, returns a JWT |
| `POST` | `/api/user/login` | `{ email, password }` | Authenticate, returns `{ status, token, data: { user } }` |
| `POST` | `/api/user/generate-questions` | `{ topic }` | Six questions grouped by difficulty |
| `POST` | `/api/user/generate-module` | `{ topic, questions, answers }` | Grades answers, builds and stores the course |
| `POST` | `/api/user/get-notes` | `{ topic }` | Markdown study notes for a topic |
| `GET` | `/health` | — | `{ status: "ok", service: "coursecraft-api" }` |

**NLP service (internal only)**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/generate-questions` | Basic/intermediate/advanced questions |
| `POST` | `/generate-module` | Expected answers + course structure |
| `POST` | `/get-notes` | Topic notes |
| `GET` | `/health` | Liveness probe |

Error translation in `server/controller/authController.js`:

| Upstream condition | API response |
|--------------------|--------------|
| Gemini quota / rate limit | `429` — "The AI service is rate limited right now…" |
| NLP took longer than 95 s | `504` — "The AI service took too long to answer…" |
| NLP unreachable | `503` — "Could not reach the AI service…" |
| Database unreachable | `503` — "The database is not reachable right now…" |

---

## 🤖 Google Gemini & Model Fallback

`NLP/gemini_client.py` is the only place that talks to Gemini. It exists because Google retires models often and the free tier enforces a **per-model** quota.

- **Ordered fallbacks:** `gemini-3.8-flash` → `gemini-3.5-flash` → `gemini-3.5-flash-lite` → `gemini-3.1-flash-lite`
- **Retired or rate-limited models** (`404`, `429`, `ResourceExhausted`, quota messages) are skipped automatically
- **SDK retries are disabled** (`request_options={"retry": None}`) so an exhausted model fails in milliseconds instead of burning ~40 s of exponential backoff before the chain moves on
- **Pin the first model** with `GEMINI_MODEL`; the remaining entries stay as fallbacks

> **Free-tier reality.** Gemini allows roughly 20 requests per model per day and a full flow uses 3–4. Once every model is exhausted the API answers `429` with a readable message. For anything public, use a paid key.

---

## 🎨 Design System

The frontend uses a bespoke Tailwind system — **DaisyUI was removed** because DaisyUI 5 targets Tailwind v4 and, when loaded into a v3 project, ships colliding utilities that silently override custom classes.

- **Palette** — near-black navy base (`#05050A` / `#0B0B15`) with a violet → indigo → cyan brand ramp, plus amber / mint / rose accents
- **Type** — *Plus Jakarta Sans* for UI, *JetBrains Mono* for code and numeric accents
- **Tokens** — `tailwind.config.js` defines `ink`, `chalk`, `brand`, `iris`, `aqua`, `mint`, `amber`, `rose` scales plus custom spacing, radii, shadows, animations
- **Component classes** — `src/index.css` defines `.glass`, `.glass-strong`, `.btn-brand`, `.btn-ghost`, `.field`, `.ring-gradient`, `.text-gradient(-animated)`, `.bg-grid`, `.bg-dots`, `.markdown-body`, and animation utilities
- **Accessibility** — WCAG AA contrast on the dark base; interactive targets ≥ 32 px on mobile

---

## ✅ Verification Scripts

Headless-Chrome (CDP) checks used during development — they are dev-only helpers, not part of the bundle:

| Script | What it checks |
|--------|----------------|
| `npm run verify:ui` | Every route renders, fonts/glass/gradients applied, no console errors, no horizontal overflow |
| `npm run verify:flow` | Topic → assessment → course → module expand → notes → player → library |
| `npm run verify:flow2` | Same flow plus refresh persistence and navigation into the player |
| `npm run verify:accordion` | Module accordion and notes rendering |
| `npm run verify:live` | Full end-to-end run against the real API + NLP stack |
| `npm run audit:tap` | Mobile tap-target audit (flags elements under 32 px) |
| `npm run audit:design` | Design-token and contrast audit |
| `npm run screenshot` | Captures screenshots of all routes |
| `npm run probe` | One-off DOM/style probe |

Run them with the dev server up: `npm run dev` in one terminal, then the script in another.

---

## 🌐 Deployment

Three pieces, three free tiers — no credit card required.

| Piece | Host | Free tier |
|-------|------|-----------|
| Frontend (Vite SPA) | **Vercel** | Hobby — unlimited static builds |
| API + NLP service | **Render** | 750 service-hours/month, 512 MB RAM, sleeps after 15 min idle |
| Database | **MongoDB Atlas** | M0 cluster, 512 MB shared |

### 1. MongoDB Atlas

1. Create a **free M0** cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. **Database Access** → add a user with a password.
3. **Network Access** → allow `0.0.0.0/0` (Render IPs are dynamic).
4. Copy the connection string: `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/CourseDB`.
   URL-encode special characters in the password (`@` → `%40`, `:` → `%3A`).

### 2. Render (API + NLP)

`render.yaml` is a [Blueprint](https://render.com/docs/blueprint-spec) describing the whole service.

1. Push the repository to GitHub.
2. On Render: **New → Blueprint**, pick the repo, apply.
3. Provide the two values it cannot invent:
   - `DATABASE` — the Atlas connection string
   - `GOOGLE_API_KEY` — your Gemini key
4. Wait for the build. A healthy log ends with `NLP service is up.` and `Listening on port <port>`.

The service URL looks like `https://coursecraft-api.onrender.com` — the frontend needs this value.

**Optional environment variables:** `GEMINI_MODEL`, `JWT_SECRET`, `JWT_EXPRIES_IN`, `NLP_URL`.
**Health check:** `GET /health` → `{"status":"ok","service":"coursecraft-api"}`.

> **Python is pinned to 3.13** via `.python-version`. `grpcio` and `MarkupSafe` publish no `cp314` wheels, so Python 3.14 would force a source build and fail.

### 3. Vercel (Frontend)

1. Import the repository at [vercel.com/new](https://vercel.com/new).
2. Set **Root Directory** to `client/vite-project`.
3. Framework **Vite**, build `npm run build`, output `dist` — `vercel.json` already sets these plus the SPA rewrite so `/course` and `/genchat` survive a refresh.
4. Add `VITE_API_URL=https://coursecraft-api.onrender.com` (no trailing slash).
5. Deploy.

> `VITE_API_URL` is **build-time** — changing it requires a redeploy, not a restart.

### Free-Tier Behaviour

- **The service sleeps** after ~15 min of inactivity. Waking takes 30–60 s; the client retries transient `502/503` responses, so the first visitor waits instead of seeing an error.
- **Gemini is the real limit** — ~20 requests per model per day. The fallback chain buys time, but heavy testing exhausts it; use a paid key for public use.
- **Long generations** are capped by the API at 95 s with a readable timeout message.

### Troubleshooting

| Symptom | Fix |
|---------|-----|
| Deploys but every request 500s | `DATABASE` unset, or Atlas IP allow-list blocks Render |
| "Could not reach the AI service" | The NLP process died — check Render logs for gunicorn output |
| "The AI service is rate limited" | Gemini quota exhausted — wait for reset or use a paid key |
| "The AI service took too long" | A model was retrying/quota-throttled — check `NLP/gemini_client.py` fallback order |
| Frontend calls the wrong URL | `VITE_API_URL` is build-time — redeploy on Vercel |
| API talks to the wrong service | `NLP_URL` must match where Flask listens (`http://127.0.0.1:3001` on Render) |
| `/course` 404s on refresh | Vercel rewrite missing — check `client/vite-project/vercel.json` |

---

## 🔮 Future Improvements

- Persisted per-user course library (currently the library shows the live session course + samples)
- Backend `GET /courses` endpoint and course history
- Email verification and password reset
- Streaming AI responses for notes and modules
- Export a course as PDF / Markdown
- Spaced-repetition review and quiz mode per topic
- Multi-language support
- Usage dashboard and Gemini quota visibility

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please keep the existing code style, run `npm run lint` in `client/vite-project`, and never commit `.env` files or API keys.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Ravi Pajiyar**

- GitHub: [@ravipajiyar](https://github.com/ravipajiyar)
- LinkedIn: [Ravi Pajiyar](https://www.linkedin.com/in/ravi-pajiyar-a4a5512ba/)
- Portfolio: [pajiyarravi.com.np](https://pajiyarravi.com.np)

---

Built with ❤️ to make learning start exactly where you are.
