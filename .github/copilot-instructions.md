# Copilot Instructions

## Project Overview

This is the **CLS website** — a React + TypeScript single-page application built with Vite, styled with Tailwind CSS, and backed by Firebase (Firestore, Storage, Hosting).

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build tool**: Vite
- **Styling**: Tailwind CSS (utility-first; no CSS modules)
- **Routing**: React Router v6 with `HashRouter` (required for Firebase Hosting and framed preview environments)
- **Backend**: Firebase (Firestore for data, Firebase Storage for images, Firebase Hosting for deployment)
- **AI**: Google Generative AI (`@google/generative-ai`) via `services/geminiService.ts`
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Linting**: ESLint with TypeScript, React, and jsx-a11y plugins
- **Formatting**: Prettier

## Directory Structure

```
/
├── components/      # Shared/reusable UI components
├── context/         # React context providers (Content, Gallery, Community)
├── pages/           # Top-level route components
├── services/        # Firebase, Gemini AI, and diagnostics service modules
├── types.ts         # Shared TypeScript types
├── App.tsx          # Root component with routing and error boundary
├── index.tsx        # Entry point
└── firebaseConfig.ts # Firebase initialization (in context/)
```

## Common Commands

```bash
npm run dev      # Start local dev server (Vite)
npm run build    # Type-check and build for production
npm run start    # Serve the production build locally
```

> There is currently no test suite. Do not add a test framework unless explicitly asked.

## Coding Conventions

- **TypeScript**: Always use explicit types; avoid `any` (ESLint warns on it). Prefer interfaces over type aliases for object shapes.
- **React**: Use functional components and hooks. The `GlobalErrorBoundary` class component in `App.tsx` is the only class component.
- **Imports**: Group imports — React first, then third-party libraries, then local components/pages/services/context/types.
- **Styling**: Use Tailwind utility classes directly on JSX elements. Custom brand colors (`brand-cream`, `brand-dark`, `brand-green`, `brand-light`, `brand-accent`) are defined in the Tailwind config.
- **State management**: Use React Context (see `context/`) for shared state; keep local state local with `useState`/`useReducer`.
- **Firebase**: All Firebase interactions go through service modules in `services/` or context providers in `context/`. Do not import Firebase directly in page or component files.
- **Routing**: Always use `HashRouter`-compatible paths (relative hash paths). Do not switch to `BrowserRouter`.
- **Diagnostics**: Use `diagnostics.log()` from `services/diagnostics.ts` instead of `console.log` for app-level logging.
- **Accessibility**: The ESLint jsx-a11y plugin is enabled. Keep all interactive elements accessible.
- **No unused variables**: ESLint warns on unused vars; prefix intentionally unused parameters with `_`.

## Firebase / Deployment Notes

- Firebase Hosting is configured in `firebase.json`; deployment is handled via GitHub Actions workflows in `.github/workflows/`.
- Firestore security rules are in `firestore.rules`; Storage rules are in `storage.rules`. Update these carefully when changing data access patterns.
- Environment-sensitive Firebase config is in `context/firebaseConfig.ts` / `firebaseConfig.ts` at the root.
