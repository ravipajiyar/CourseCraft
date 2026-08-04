# Course-Craft

An AI-powered web app that analyzes your knowledge gaps and generates a personalized, structured course for the topic you want to learn.

## What it does

1. You enter any topic (e.g. "golang", "Machine Learning").
2. The AI generates a short knowledge-gap assessment — 2 questions each at **basic**, **intermediate**, and **advanced** difficulty (6 total).
3. You answer the questions (chat-style, one at a time with progress tracking).
4. The AI compares your answers against expected answers, evaluates your understanding level, and generates a **custom course** with modules ordered from basics to advanced.
5. The generated course is saved (MongoDB) and displayed on a course page where you can browse modules, topics, and fetch detailed AI notes for any topic.

## Architecture

The project is split into 3 services:

```
Course-Craft/
├── client/         → Frontend (Vite + React + Tailwind + DaisyUI)
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
- `question_generator_gemini.py` — Gemini prompt that produces basic/intermediate/advanced questions
- `expected_answer_generator.py` — Gemini prompt that writes expected answers for the generated questions
- `generate_module.py` — Gemini prompt that compares user answers vs expected answers and builds the incremental course modules
- `get_notes_on.py` — Gemini prompt for topic notes
- Requires a `GOOGLE_API_KEY` in `.env` (uses `gemini-1.5-flash`)

### 2. Backend (`server/`) — Node/Express, runs on port 3000
- `app.js` / `server.js` — Express app + MongoDB (Mongoose) connection
- `router/userRouter.js` — routes under `/api/user`
  - `POST /login`, `POST /signup` — JWT auth (bcrypt hashed passwords)
  - `POST /generate-questions` — proxies to NLP service
  - `POST /generate-module` — proxies to NLP service, saves course to MongoDB
  - `POST /get-notes` — proxies to NLP service
- `models/` — `userModel` (email/name/password/courses) and `courseModel` (title + modules with contents)
- `controller/` — `authController` (auth + proxy logic), `errorController`
- `utils/` — `appError`, `catchAsync`
- Config in `server/config.env` (MongoDB connection string, JWT secret)

### 3. Frontend (`client/vite-project/`) — React (Vite), dev server on port 5173
- Pages: `landingPage`, `About`, `Features`, `CoursePage` (course display), `GenChat` (assessment chat), `ViewCourses` (saved course list), `CourseContent`
- Components: `CourseSelector` (topic input → triggers question generation), `ChatAI` (one-question-at-a-time answering UI), `CourseLayout`, `Navbar`, `Login`
- Contexts: `Questioncontext` (questions + topic), `courseContext` (generated course), `Usercontext` (auth user)
- Built with Tailwind CSS + DaisyUI, purple/indigo dark theme
- Uses `marked` to render Markdown notes from the AI

## How to run locally

### 1. NLP service (port 3001)
```bash
cd NLP
pip install -r requirements.txt
# create NLP/.env with: GOOGLE_API_KEY=<your gemini api key>
python api.py
```

### 2. Backend (port 3000)
```bash
cd server
npm install
# ensure server/config.env has DATABASE (MongoDB), DATABASE_PASSWORD, JWT_SECRET, etc.
npm run dev
```

### 3. Frontend (port 5173)
```bash
cd client/vite-project
npm install
npm run dev
```

Then open the Vite dev URL, enter a topic, answer the questions, and view your generated course.

## Tech stack

- **LLM:** Google Gemini (`gemini-1.5-flash`) via `google-generativeai`
- **NLP service:** Python 3 + Flask
- **Backend:** Node.js, Express, Mongoose (MongoDB), JWT, bcrypt
- **Frontend:** React 18, Vite, Tailwind CSS, DaisyUI, React Router, socket.io-client, axios
- **Deployment:** `render.yaml` (backend web service, NLP web service, frontend static site)

## Deployment

`render.yaml` defines three Render services:
- `backend-service` → `cd server && npm start`
- `nlp-service` → `cd NLP && python main.py`
- `frontend-service` → build `vite-project` and publish `dist`

> Note: API base URLs are currently hardcoded to localhost (`127.0.0.1:3000` / `localhost:3001`) in the frontend and `authController.js`, so deployment may require updating those to the deployed service URLs.
