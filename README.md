# Year Planner (Google Calendar)

A local-first yearly planner that pulls **all-day events** from Google Calendar and renders them in a dense “year-at-a-glance” view (useful for school holidays, vacations, etc).

<img width="4108" height="2412" alt="CleanShot 2026-01-02 at 5  09 01@2x" src="https://github.com/user-attachments/assets/efc8e3e5-740b-458b-bce5-f641eaa00981" />


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

## Legacy

The original printable PHP calendar is preserved in `legacy/`.
Inspired by [Neatnik Calendar](https://source.tube/neatnik/calendar)
