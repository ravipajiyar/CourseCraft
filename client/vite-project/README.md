# CourseCraft Frontend

Vite + React 18 client for the CourseCraft app.

```bash
npm install
cp .env.example .env    # VITE_API_URL=http://127.0.0.1:3000
npm run dev
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server on :5173 |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |
| `npm run format` | Prettier over `src/` |
| `npm run mock:api` | Local mock of the backend API on :3100 |
| `npm run verify:ui` | Headless-Chrome route/render audit |
| `npm run verify:flow` | End-to-end assessment → course → notes flow |
| `npm run verify:flow2` | Flow + refresh-persistence checks |
| `npm run verify:accordion` | Module accordion + player notes checks |
| `npm run audit:tap` | Mobile tap-target audit |
| `npm run probe` | One-off DOM/style probe |

## Structure

```
src/
├── config/api.js        # single source of truth for backend URLs
├── contexts/            # Question / Course / User (sessionStorage-backed)
├── components/
│   ├── ui/              # shared primitives (Logo, Footer, BackgroundFX, …)
│   ├── ChatAI/          # assessment Q&A
│   ├── CourseSelector/  # topic search
│   ├── Login/           # auth modal
│   └── Navbar/
├── pages/               # one file per route
├── index.css            # design-system tokens + component classes
└── tailwind.config.js   # palette, animations, spacing
```

Styling is a bespoke Tailwind design system — DaisyUI is **not** used. See the root `README.md` for the full palette and component-class reference.
