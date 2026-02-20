# Deployment Checklist

Everything in this repository is ready. This file lists every action
you need to take **outside the repo** before merging to `main`.

---

## Step 1 — GitHub Repository Secret: Set the Firebase API key

The app reads `VITE_FIREBASE_API_KEY` at **build time** via GitHub Actions. It must be
stored as a **GitHub repository secret** — not in App Hosting's environment panel.
(This is a public identifier, not a secret, but GitHub Secrets is the correct place
because it is injected into the GitHub Actions build step.)

1. Find your Firebase Web API key:
   - Open [Firebase Console](https://console.firebase.google.com)
   - Select project **`gen-lang-client-0068569341`**
   - Click the ⚙️ gear icon → **Project settings** → **Your apps** tab
   - Under your Web app, copy the `apiKey` value (looks like `AIzaSy…`)

2. Add it as a GitHub repository secret:
   - Open your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Name: `VITE_FIREBASE_API_KEY`
   - Value: the `apiKey` you copied above
   - Click **Add secret**

> **Why not App Hosting?** This project deploys via Firebase Hosting (static files built
> by GitHub Actions and uploaded to the Firebase CDN). The `apphosting.yaml` file is
> present for a possible App Hosting backend, but the production site at
> `creativelandscapingsolutions.com` is served by Firebase Hosting. Vite inlines the
> `VITE_*` env vars at **build time** inside the GitHub Actions runner, so the value
> must be available there as a GitHub secret.

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
| `VITE_FIREBASE_API_KEY` | Firebase Web API key — see Step 1 above |
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
   - Builds the app (`npm run build`) — `VITE_FIREBASE_API_KEY` (from the GitHub secret set in Step 1) and `VITE_GEMINI_API_KEY` (from the `GEMINI_API_KEY` secret in Step 2, exposed via `apphosting.yaml availability: BUILD`) are both inlined by Vite at this point
   - Authenticates to Google Cloud
   - Deploys to Firebase Hosting
3. Visit `https://creativelandscapingsolutions.com` — the site is live ✅

---

## Troubleshooting — "Database secrets are currently deprecated" warning

If you see this warning in the Firebase Console:
> *"Database secrets are currently deprecated and use a legacy Firebase token generator.
> Update your source code with the Firebase Admin SDK."*

**Where it lives:** Firebase Console → **Realtime Database** → **Data** tab (or the gear icon in
the Realtime Database section).

**What it means:** Firebase auto-enables a legacy Realtime Database token generator when a project
is first set up. This site **does not use Realtime Database at all** — it uses Firestore exclusively.
There is no "delete" button for these deprecated secrets; Firebase removed that UI option.

**How to permanently remove the warning:**

Since this project does not use Realtime Database, the cleanest fix is to delete the
Realtime Database instance entirely:

1. Open [Firebase Console](https://console.firebase.google.com) → select your project
2. In the left navigation, click **Realtime Database**
3. Click the ⋮ **more options** menu (three dots) in the top-right of the database panel
4. Select **Delete database**
5. Confirm the deletion — the Realtime Database instance is removed, and the warning disappears

> **This is safe.** The CLS app reads/writes exclusively to Firestore. Deleting the unused
> Realtime Database instance has no effect on the app.

> **Cannot find Realtime Database in the left nav?** It may not be enabled yet in your project.
> If you don't see it, the warning may resolve on its own as Firebase finishes deprecating the
> legacy token system — no action needed.

> **Note:** This site is a client-side browser app and cannot use the Firebase Admin SDK
> (Admin SDK is server-only). The correct client SDK (`firebase/app`, `firebase/firestore`,
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
