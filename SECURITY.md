# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it
by emailing **tyler@creativelandscapingsolutions.com** rather than opening a
public GitHub issue.

Please include:
- A description of the vulnerability and its potential impact
- Steps to reproduce the issue
- Any suggested fix if you have one

We will acknowledge receipt within 48 hours and aim to release a fix within
14 days for confirmed issues.

## Scope

This is a client-side web application backed by Firebase. Security is primarily
enforced by:

- **Firestore Security Rules** (`firestore.rules`) — controls read/write access to the database
- **Firebase Storage Rules** (`storage.rules`) — controls media upload/download access
- **Firebase App Check** — (recommended for production) validates that requests come from the genuine app

## API Keys

Firebase web API keys (`VITE_FIREBASE_API_KEY`) are **public identifiers** — per
[Firebase documentation](https://firebase.google.com/docs/projects/api-keys) they
are safe to embed in client code and do not need to be kept secret. Access control
is enforced by the rules files above, not by the API key.

The Gemini AI key (`VITE_GEMINI_API_KEY`) is genuinely secret and is stored in
Google Cloud Secret Manager, never committed to source control.

