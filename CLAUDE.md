# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A TypeScript/React (Vite) frontend for searching and browsing scraped
articles: search box, article list, word cloud, timeline view. It's the frontend counterpart to the `Webscraping`
repo's Django API (`api/` app, `Article` model) — see that repo's own
CLAUDE.md for the backend.

## Commands

```bash
npm install --legacy-peer-deps   # flag is required -- see below
npm start                         # Vite dev server (also: npm run dev)
npm run build                     # tsc --noEmit, then vite build -> build/
npm run preview                   # serve the built output to check a prod build
npm test                          # vitest run
npm run test:watch                # vitest watch mode
```

`npm run backend` also exists but starts a local *experimental* Python
backend, not the production one (see below).

**`--legacy-peer-deps` is mandatory**: `react-wordcloud@1.2.7` declares a
React 16 peer dependency while this app runs React 18. Stale declaration in
an unmaintained package, not a real incompatibility — but `npm install`
fails without the flag. Replacing `react-wordcloud` is the way to drop it.

Verified working 2026-08-07: clean `rm -rf node_modules package-lock.json &&
npm install`, then `tsc --noEmit`, `vitest run` (1/1), `vite build`
(~2.7s), and a live dev-server request check.

## Build tooling: Vite, not Create React App

Migrated off CRA + `react-app-rewired` to **Vite 7 + Vitest 4** on
2026-08-07. CRA is unmaintained upstream and its toolchain accounted for
every remaining npm CVE (25 of them, all in `jest`/`webpack-dev-server`/
`svgo`/`workbox`), which `npm audit fix` could not durably clear. Migration
results: **1494 → 258 packages, 57 → 0 `npm audit` vulnerabilities**, build
time ~30s → ~2.7s.

What that changed, and what to watch for:

- **Env vars are `VITE_*`, read via `import.meta.env`** — not `REACT_APP_*`
  via `process.env`. Vite only exposes `VITE_`-prefixed vars to client code.
  `REACT_APP_API_BASEURL` → `VITE_API_BASEURL`, `REACT_APP_API_TOKEN` →
  `VITE_API_TOKEN`. Any deploy config setting the old names silently stops
  working. (`docker-compose.yml` was in fact already setting
  `REACT_APP_API_URL` — a name the code never read — so that override had
  never worked; corrected to `VITE_API_BASEURL`.)
- **`index.html` lives at the repo root**, not `public/`, and references
  `/src/index.tsx` directly as a module. `%PUBLIC_URL%` placeholders are
  gone (Vite serves `public/` at `/`). `build/` is kept as the output dir so
  existing deploy scripts still find it.
- **Config lives in `vite.config.ts`** — including the Vitest block. The old
  `jest.config.js` / `config-overrides.js` split is gone, along with
  `babel.config.js` and the CRA-era `start-smart.js` / `dev-start.js` /
  `task-runner.js` port-hunting wrappers (Vite falls forward to a free port
  itself).
- **`src/index.tsx` uses `createRoot`**, not the legacy `ReactDOM.render`
  (which errors under React 18). Deliberately **not** wrapped in
  `<StrictMode>`: it double-invokes effects in dev and `react-wordcloud` /
  `react-chrono` aren't verified safe under that. Add it once they're checked.
- **`TimelineComponent.test.tsx` is excluded** in `vite.config.ts`'s
  `test.exclude`. It renders the real, unmocked `react-chrono` in jsdom,
  which lacks the layout APIs it needs, and spins consuming multiple GB of
  RAM rather than failing cleanly. Mock `react-chrono` there and drop the
  exclusion rather than leaving it stale.
- **`yarn.lock` was deleted.** The repo previously carried both lockfiles;
  the yarn one described the CRA tree and would now install a broken set.
  `package-lock.json` is authoritative.

## Where the frontend actually gets its data

`src/Services/Api.ts` is the single source of truth for this: it defaults
`baseUrl` to `https://api.thediversecandidate.com` (the real `Webscraping`
Django API) unless `VITE_API_BASEURL` is set in the environment. It exports
that resolved value as `apiBaseUrl` — import it rather than hardcoding a
host anywhere else. If a task involves "why isn't the frontend showing X,"
check `Api.ts` and the active `VITE_API_BASEURL` first — don't assume from `DEV-README.md` or
`LOCAL_SETUP.md` alone which backend is live, since this repo accumulated
several alternative/local backends during development (see below) whose
docs describe a different default (`localhost:8080` or `localhost:8000`)
than `Api.ts`'s actual out-of-the-box default.

## The many backend scripts in the repo root

This repo root has ten-plus standalone Python HTTP servers
(`ai_intelligent_scraper.py`, `django_backend.py`, `flask_mock_backend.py`,
`flask_semantic_engine.py`, `mock-api-server.py`, `mock_backend.py`,
`real_scraper_backend.py`, `semantic_web_mining_engine.py`,
`standalone_backend.py`) built at different points as local/experimental
stand-ins for the real Django API — some intentionally mocked, some
attempting real scraping directly (bypassing the `Webscraping` Django app
entirely). They are not a layered system; each is a self-contained
alternative you'd swap in independently by pointing `VITE_API_BASEURL`
at it. If asked to work on "the backend" here, first confirm with whoever's
asking (or check `Api.ts` / the relevant script's own header comment)
which one they mean — `mock_backend.py` and `flask_mock_backend.py` return
fabricated data, `real_scraper_backend.py` does live HTTP scraping, and
`semantic_web_mining_engine.py` (started by `npm run backend`, serving on
port 8080) is a separate "semantic source discovery" experiment, not the
production path.

Dependencies for these: `backend_requirements.txt` (Django/Flask) and
`scraper_requirements.txt` (requests/beautifulsoup4/lxml) — separate from
`Webscraping/django/derrick/requirements.txt` in the sibling repo.

## Mock vs. real: label it explicitly

`TRUST_PROTOCOL.md`, `truth_verifier.py`, and `tamper_light.py` in this repo
exist because of a past incident where an AI assistant presented mock/fake
scraping output as if it were real production functionality. Regardless of
that document's specific ritual (trust scores, mandatory check-ins), the
underlying concern is legitimate and applies to any work in this repo:
**when touching one of the backend scripts above, or writing new scraping
code, say plainly and up front whether it returns real scraped data or
mocked/synthetic data** — don't let a mock implementation read as
production-ready without saying so.

## Docker

`docker-compose.yml` wires up Postgres + Redis + Elasticsearch + the Django
backend (built from `../Webscraping/django/derrick`, expected as a sibling
checkout) + this React frontend. `Dockerfile` / `Dockerfile.backend` /
`Dockerfile.frontend` are separate images for each piece. This is the
closest thing to a "real" full local stack, as opposed to the standalone
mock/experimental Python scripts above.

**The root `Dockerfile` is not that stack, despite the name.** Its "fullstack"
runtime `CMD` starts `flask_mock_backend.py`, which serves fabricated
article data — it is a UI demo harness, not a deployable production image.
A warning to that effect is now at the top of the file; keep it there.
Both Dockerfiles were also pinned to EOL Node (17 and 18) and the frontend
one set `NODE_OPTIONS=--openssl-legacy-provider`, a webpack-4-era workaround
that Vite doesn't need; both now use Node 22 and the flag is gone.

## Dependency vulnerabilities

`npm audit` currently reports **0 vulnerabilities** (verified 2026-08-07 on
a clean install). It was 57 before the Vite migration — see "Build tooling"
above and `SECURITY-VERIFICATION.md` for the full history, including why
`npm audit fix` alone couldn't close them.

Re-run `npm audit` before repeating a "zero vulnerabilities" claim anywhere;
that number drifts, and this repo already has a history of a stale
"0 vulnerabilities" doc being trusted for ~10 months.

## Structure

- `src/Components/` — one folder per feature area: `SearchComponent`,
  `ArticlesComponent`, `WordCloudComponent`, `TimelineComponent`,
  `BackendStatusIndicator`, `PleaseWaitComponent`, `Helpers`.
- `src/Services/Api.ts` — all HTTP calls (`getArticles`, `getArticlesCount`).
- `src/Models/` — `Constants.ts` (pagination/text-length limits),
  `Model.d.ts` (response shapes).
- `src/Context/Context.ts` — shared React context.
