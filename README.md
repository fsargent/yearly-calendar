# Year Planner (Google Calendar)

A local-first yearly planner that pulls **all-day events** from Google Calendar and renders them in a dense “year-at-a-glance” view (useful for school holidays, vacations, etc).

![Screenshot](https://github.com/user-attachments/assets/efc8e3e5-740b-458b-bce5-f641eaa00981)

## Requirements

- Bun (recommended): `bun --version`

## Setup

Create a `.env` with **public** values only (safe for static hosting builds):

- `VITE_GOOGLE_CLIENT_ID`
- `VITE_GOOGLE_SCOPES` (space-separated, e.g. `https://www.googleapis.com/auth/calendar.readonly`)

In Google Cloud Console, make sure your OAuth client has an **Authorized JavaScript origin** for your site (and `http://localhost:5173` for local dev).

## Develop

```sh
bun install
bun run dev -- --open
```

## Deploy (GitHub Pages)

This repo is configured to deploy automatically via GitHub Actions to GitHub Pages.

1. In your GitHub repo, go to **Settings → Pages**.
2. Under **Build and deployment**, select **Source: GitHub Actions**.
3. Add these OAuth settings in Google Cloud Console:
   - **Authorized JavaScript origins**: `https://<your-user>.github.io`
   - **Redirect/origin**: for project pages, also include `https://<your-user>.github.io/<repo>`

The workflow builds with `BASE_PATH=/<repo>` so the app works at `https://<your-user>.github.io/<repo>/`.

## Legacy

The original printable PHP calendar is preserved in `legacy/`.
Inspired by [Neatnik Calendar](https://source.tube/neatnik/calendar)
