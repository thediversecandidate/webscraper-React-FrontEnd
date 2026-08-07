# Webscraper React Frontend — Development Guide

Build tooling is **Vite** (migrated off Create React App in 2026-08 — CRA is
unmaintained upstream and its toolchain was the source of every remaining
npm CVE). Tests run on **Vitest**.

## Quick start

```bash
npm install --legacy-peer-deps   # see note below on why the flag is needed
npm start                         # Vite dev server, http://localhost:3000
```

Vite picks the next free port automatically if 3000 is taken, so there's no
port-hunting wrapper script any more (`start-smart.js` / `dev-start.js` /
`task-runner.js` were CRA-era helpers and have been removed).

## Commands

| Command | What it does |
|---------|--------------|
| `npm start` / `npm run dev` | Vite dev server with HMR |
| `npm run build` | Type-check (`tsc --noEmit`) then production build into `build/` |
| `npm run preview` | Serve the built output locally, to sanity-check a production build |
| `npm test` | Vitest, single run |
| `npm run test:watch` | Vitest in watch mode |
| `npm run backend` | Starts `semantic_web_mining_engine.py` — an *experimental* local backend, not the production API |

### Why `--legacy-peer-deps`

`react-wordcloud@1.2.7` declares a peer dependency on React 16 while this app
runs React 18. `npm install` fails without the flag. This is a stale
declaration in that package, not a real incompatibility — but it means you
cannot drop the flag until `react-wordcloud` is replaced or updated.

## Environment variables

Vite only exposes env vars prefixed `VITE_` to client code, and reads them
via `import.meta.env`, not `process.env`. The variables changed names in the
migration:

| Old (CRA) | New (Vite) |
|-----------|------------|
| `REACT_APP_API_BASEURL` | `VITE_API_BASEURL` |
| `REACT_APP_API_TOKEN` | `VITE_API_TOKEN` |

Put them in a `.env.local` (gitignored) for local development:

```
VITE_API_BASEURL=http://localhost:8000
VITE_API_TOKEN=your-token-here
```

With neither set, `src/Services/Api.ts` falls back to the remote API at
`https://api.thediversecandidate.com` — see that file, which is the single
source of truth for backend URL resolution.

## Which backend am I talking to?

This repo accumulated many standalone Python backend scripts at the root
(mock, real-scraping, and "semantic engine" variants). They are alternatives,
not layers. `src/Services/Api.ts` decides what the app actually calls —
check there and your `VITE_API_BASEURL` before assuming. See `CLAUDE.md` for
the breakdown of which script is which, and note that some return
**fabricated** data.
