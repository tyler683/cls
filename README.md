# Creative Landscaping Solutions — Website

React + TypeScript + Vite website for Creative Landscaping Solutions (Kansas City, MO), backed by Firebase Firestore & Storage and powered by Google Gemini AI.

---

## Running locally

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in the two values:

| Variable | Where to get it |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase Console → Project Settings → Your apps → Web app → `apiKey` |
| `VITE_GEMINI_API_KEY` | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) |

> **Without `VITE_FIREBASE_API_KEY`** the app runs in **Demo Mode** — all data is saved to `localStorage` instead of Firestore. Everything still works; you just won't see live cloud data.

> **Without `VITE_GEMINI_API_KEY`** the AI chat, design vision, and voice features will not respond.

### 3. Start the development server

```bash
npm run dev
```

Opens at **http://localhost:5173** with hot-reload.

### 4. Preview the production build locally

```bash
npm run preview
```

Builds the app and serves the production bundle at **http://localhost:4173** — identical to what gets deployed.

---

## Deploying to Firebase Hosting

See **[DEPLOY.md](./DEPLOY.md)** for the complete step-by-step checklist.

**Short version:** complete the three one-time setup steps in `DEPLOY.md`, then merge to `main` — the GitHub Action deploys automatically.

```bash
# Manual deploy (if you have Firebase CLI and are authenticated):
npm run build
firebase deploy
```

---

## Project structure

```
/
├── components/     Shared UI components (Navbar, Footer, ChatWidget, …)
├── context/        React context providers (Gallery, Community, Content)
├── pages/          Route-level page components (Home, Services, Gallery, …)
├── services/       Firebase, Gemini AI, and diagnostics service modules
├── App.tsx         Root component with routing
├── firebaseConfig.ts  Firebase project config
├── apphosting.yaml    Firebase App Hosting config (production)
├── apphosting.staging.yaml  Staging environment overrides
└── firebase.json   Firebase Hosting rules
```

## Data modes

| Condition | Mode | Data stored |
|---|---|---|
| `VITE_FIREBASE_API_KEY` set | **Live** | Firestore + Storage (cloud) |
| `VITE_FIREBASE_API_KEY` missing | **Demo** | `localStorage` (browser) |

In Demo mode all edits persist across page reloads in the same browser, but are not shared with other users or devices.

## Available scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start local dev server (http://localhost:5173) |
| `npm run build` | Type-check and build for production → `dist/` |
| `npm run preview` | Build + serve production bundle locally (http://localhost:4173) |
| `npm run start` | Serve an already-built `dist/` on port 8080 |

