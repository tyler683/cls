# Deployment Checklist

Everything in this repository is ready. This file lists every action
you need to take **outside the repo** before merging to `main`.

---

## Step 1 — Firebase Console: Set the Firebase API key as a build environment variable

The app reads `VITE_FIREBASE_API_KEY` at build time. This is a **public identifier**
(not a secret), so it goes in App Hosting's environment variables panel, not Secret Manager.

1. Open [Firebase Console](https://console.firebase.google.com)
2. Select your **production project** (`gen-lang-client-0068569341`)
3. **App Hosting** → select your backend → **Settings** tab → **Environment variables**
4. Add a new variable:
   - Name: `VITE_FIREBASE_API_KEY`
   - Value: your Firebase Web API key
   - Availability: `BUILD`
5. Where to find the value:
   **Project Settings** (⚙️ gear icon) → **Your apps** → Web app → `apiKey` field

---

## Step 2 — Secret Manager: Create the Gemini API key secret

`apphosting.yaml` references a Secret Manager secret named `GEMINI_API_KEY`.
This is the **real** AI API key that must stay private.

1. Open [Google Cloud Console → Secret Manager](https://console.cloud.google.com/security/secret-manager)
   (make sure the correct project `gen-lang-client-0068569341` is selected)
2. Click **+ Create Secret**
3. Name: `GEMINI_API_KEY`
4. Value: your Gemini API key (get one from https://aistudio.google.com/app/apikey)
5. Click **Create Secret**
6. Grant the App Hosting service account access:
   - On the secret detail page → **Permissions** tab → **Grant Access**
   - Principal: `service-<PROJECT_NUMBER>@gcp-sa-firebaseapphosting.iam.gserviceaccount.com`
   - Role: **Secret Manager Secret Accessor**

---

## Step 3 — GitHub Secrets: Set CI/CD credentials

The `firebase-hosting-merge.yml` workflow uses Workload Identity Federation to
authenticate to Google Cloud. These secrets must exist in your GitHub repository.

1. Go to **GitHub → Settings → Secrets and variables → Actions**
2. Add the following repository secrets:

| Secret name | Value |
|---|---|
| `WIF_PROVIDER` | Your Workload Identity Provider resource name (e.g. `projects/123/locations/global/workloadIdentityPools/my-pool/providers/my-provider`) |
| `WIF_SERVICE_ACCOUNT` | The service account email (e.g. `firebase-deploy@gen-lang-client-0068569341.iam.gserviceaccount.com`) |

> **Note:** If these were already set up when Firebase first connected to GitHub,
> they're already there — just verify they exist.

---

## Step 4 (Optional) — Staging environment

If you want a separate staging environment (lighter resources, separate AI key):

1. In Firebase Console, select your **staging project**
2. **App Hosting** → staging backend → **Settings** → **Environment**
3. Set **Environment name** to: `staging`
   (this makes App Hosting use `apphosting.staging.yaml` overrides automatically)
4. In Secret Manager for the **staging project**, create a secret named `GEMINI_API_KEY_STAGING`
5. Grant the staging project's App Hosting service account access to it (same as Step 2 above)

---

## Step 5 — Merge and deploy

Once Steps 1–3 are complete:

1. **Merge this PR into `main`**
2. The `firebase-hosting-merge.yml` GitHub Action runs automatically:
   - Installs dependencies (`npm ci`)
   - Builds the app (`npm run build`) — `VITE_FIREBASE_API_KEY` (from Step 1) and `VITE_GEMINI_API_KEY` (from the `GEMINI_API_KEY` secret in Step 2, exposed as a build env var via `apphosting.yaml availability: BUILD`) are both inlined by Vite at this point
   - Authenticates to Google Cloud
   - Deploys to Firebase Hosting
3. Visit `https://creativelandscapingsolutions.com` — the site is live ✅

---

## Troubleshooting — "Database secrets are currently deprecated" warning

If you see this warning in the Firebase Console:
> *"Database secrets are currently deprecated and use a legacy Firebase token generator.
> Update your source code with the Firebase Admin SDK."*

**What it means:** Firebase auto-creates a legacy Realtime Database token when a project is first set up.
This site **does not use Realtime Database** (it uses Firestore), and **no code in this repo uses
those legacy tokens**. The warning is safe to dismiss by deleting the unused secrets.

**How to fix it (one-time action in the console):**

1. Open [Firebase Console](https://console.firebase.google.com) → select your project
2. Click ⚙️ **Project Settings** → **Service accounts** tab
3. Scroll down to **Database secrets** (legacy section)
4. Click the **Show** button to reveal the secret, then **Delete** it
5. The warning will no longer appear

> **Note:** This site is a client-side app and cannot use the Firebase Admin SDK
> (Admin SDK is server-only). The correct client-side SDK (`firebase/app`, `firebase/firestore`,
> `firebase/storage`) is already in use.

---

## Quick reference — what's already done in the repo

| ✅ | What | File |
|---|---|---|
| ✅ | SPA routing (no 404 on direct URLs) | `firebase.json` |
| ✅ | Build before deploy in CI | `.github/workflows/firebase-hosting-merge.yml` |
| ✅ | All AI features working (correct SDK, correct env vars) | `services/geminiService.ts`, `components/ChatWidget.tsx` |
| ✅ | Trust-scroller animation | `index.html` |
| ✅ | TypeScript 0 errors | `vite-env.d.ts`, `tsconfig.json` |
| ✅ | Production App Hosting config | `apphosting.yaml` |
| ✅ | Staging App Hosting config | `apphosting.staging.yaml` |
| ✅ | Local dev instructions | `.env.example` |
