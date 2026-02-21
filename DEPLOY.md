# Deployment Checklist

Everything in this repository is ready. This file lists every action
you need to take **outside the repo** before merging to `main`.

---

## Overview — the API keys

This project uses these API keys:

| # | Key name | Where it lives | What it controls |
|---|---|---|---|
| 1 | `VITE_FIREBASE_API_KEY` | GitHub repo secret | Firebase Auth, Firestore, Storage |
| 2 | `GEMINI_API_KEY` | GitHub repo secret + Cloud Secret Manager | Gemini AI — primary key (required) |
| 3 | `GEMINI_API_KEY_2` | GitHub repo secret + Cloud Secret Manager | Gemini AI — second key (optional, rotation) |
| 4 | `GEMINI_API_KEY_3` | GitHub repo secret + Cloud Secret Manager | Gemini AI — third key (optional, rotation) |

**Key rule:** `VITE_FIREBASE_API_KEY` and `GEMINI_API_KEY` must both be present as
**GitHub Secrets** so the GitHub Actions build can inject them.  The two extra Gemini
keys (`GEMINI_API_KEY_2`, `GEMINI_API_KEY_3`) are **optional** but recommended —
the app rotates round-robin across all provided keys and falls back to the next key
automatically whenever one hits a quota or rate-limit error, keeping AI features
running continuously.

---

## Step 1 — GitHub Repository Secret: Firebase API key

The app reads `VITE_FIREBASE_API_KEY` at **build time** via GitHub Actions.

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

---

## Step 2 — GitHub Repository Secret: Gemini API key(s)

The chat widget and AI Design Studio need `VITE_GEMINI_API_KEY` at **build time**.
The GitHub Actions workflow reads it from a GitHub secret named `GEMINI_API_KEY`.
You can optionally add two more keys (`GEMINI_API_KEY_2`, `GEMINI_API_KEY_3`) — the
app will rotate across all provided keys and fall back automatically on rate-limit errors.

1. Get your Gemini API key(s) from https://aistudio.google.com/app/apikey
2. Add them as GitHub repository secrets (**Settings → Secrets and variables → Actions**):

   | Secret name | Value | Required? |
   |---|---|---|
   | `GEMINI_API_KEY` | First Gemini API key | ✅ Required |
   | `GEMINI_API_KEY_2` | Second Gemini API key | Optional |
   | `GEMINI_API_KEY_3` | Third Gemini API key | Optional |

> **Note:** These are the same keys you create in Step 3 for Secret Manager. Each key
> must be in **both** places: GitHub Secrets (for the static Hosting build via GitHub
> Actions) and Secret Manager (for Firebase App Hosting, if used).

---

## Step 3 — Secret Manager: Create the Gemini API key secret(s)

`apphosting.yaml` references Secret Manager secrets for Firebase App Hosting deployments.

1. Open [Google Cloud Console → Secret Manager](https://console.cloud.google.com/security/secret-manager)
   (make sure project `gen-lang-client-0068569341` is selected)
2. Create the following secrets:

   | Secret name | Value | Required? |
   |---|---|---|
   | `GEMINI_API_KEY` | First Gemini API key | ✅ Required |
   | `GEMINI_API_KEY_2` | Second Gemini API key | Optional |
   | `GEMINI_API_KEY_3` | Third Gemini API key | Optional |
   | `FIREBASE_API_KEY` | Firebase Web API key (Step 1) | ✅ Required |

3. For each secret, grant the App Hosting service account **Secret Manager Secret Accessor** role:
   - Principal: `service-<PROJECT_NUMBER>@gcp-sa-firebaseapphosting.iam.gserviceaccount.com`

---

## Step 4 — GitHub Secrets: Set CI/CD credentials

| Secret name | Value |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase Web API key — see Step 1 |
| `GEMINI_API_KEY` | Gemini AI API key — see Step 2 |
| `GEMINI_API_KEY_2` | Second Gemini API key (optional) |
| `GEMINI_API_KEY_3` | Third Gemini API key (optional) |
| `WIF_PROVIDER` | Workload Identity Provider resource name |
| `WIF_SERVICE_ACCOUNT` | Service account email |

---

## Step 5 (Optional) — Staging environment

1. Firebase Console → **App Hosting** → staging backend → **Settings** → **Environment**
2. Set **Environment name** to: `staging`
3. In Secret Manager, create the staging key secrets and grant service account access:

   | Secret name | Value |
   |---|---|
   | `GEMINI_API_KEY_STAGING` | First Gemini key for staging |
   | `GEMINI_API_KEY_2_STAGING` | Second Gemini key for staging (optional) |
   | `GEMINI_API_KEY_3_STAGING` | Third Gemini key for staging (optional) |

---

## Step 6 — Merge and deploy

Once Steps 1–4 are complete, merge this PR into `main`. The GitHub Action will:
- Build the app with both `VITE_FIREBASE_API_KEY` and `VITE_GEMINI_API_KEY` inlined
- Deploy to Firebase Hosting at `https://creativelandscapingsolutions.com` ✅

---

## Troubleshooting — `auth/api-key-expired` in diagnostics

**Symptom:** `Anonymous sign-in failed. Firebase: Error (auth/api-key-expired…)`

**Cause:** The Firebase Web API key in the `VITE_FIREBASE_API_KEY` GitHub secret is expired or restricted.

**Fix:**
1. Go to [Firebase Console](https://console.firebase.google.com) → Project settings → Your apps → copy `apiKey`
2. Check [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials) — ensure **Identity Toolkit API** is allowed on the key (or remove all restrictions)
3. Update GitHub secret `VITE_FIREBASE_API_KEY` with the correct value
4. Re-run the deploy workflow

---

## Troubleshooting — `auth/configuration-not-found` in diagnostics

**Symptom:** `Firebase Auth: Anonymous sign-in provider is not enabled. … Firebase: Error (auth/configuration-not-found…)`

**Cause:** Firebase Authentication is initialized but the **Anonymous** sign-in provider has not been enabled in the Firebase console.

**Fix:**
1. Go to [Firebase Console](https://console.firebase.google.com) → select project **`gen-lang-client-0068569341`**
2. In the left-hand menu click **Authentication** → **Sign-in method**
3. Find **Anonymous** in the list, click it, toggle **Enable**, and save
4. The app will sign in anonymously on the next page load — no redeployment needed

---

## Troubleshooting — Chat / AI Studio not working

**Symptom:** Chat falls back to phone number; Design Studio shows an error.

**Cause:** `VITE_GEMINI_API_KEY` was not available at build time (missing GitHub secret `GEMINI_API_KEY`).

**Fix:** Add `GEMINI_API_KEY` as a GitHub repository secret (Step 2), then re-run the deploy workflow.

---

## Quick reference — what's already done in the repo

| ✅ | What | File |
|---|---|---|
| ✅ | Both API keys injected at build time | `.github/workflows/firebase-hosting-merge.yml` |
| ✅ | Firebase API key in App Hosting config | `apphosting.yaml` |
| ✅ | Gallery falls back to defaults when empty/offline | `context/GalleryContext.tsx` |
| ✅ | Chat uses googleSearch grounding (no restricted Maps tool) | `services/geminiService.ts` |
| ✅ | AI Studio uses correct model names | `services/geminiService.ts` |
| ✅ | Fast image upload (blob URL, no base64 round-trip) | `components/ImagePickerModal.tsx` |
| ✅ | SPA routing (no 404 on direct URLs) | `firebase.json` |
| ✅ | Production App Hosting config | `apphosting.yaml` |
| ✅ | Staging App Hosting config | `apphosting.staging.yaml` |
| ✅ | Local dev instructions | `.env.example` |
