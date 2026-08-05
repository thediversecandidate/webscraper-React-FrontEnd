# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A TypeScript/React (Create React App + `react-app-rewired`) frontend for
searching and browsing scraped articles: search box, article list, word
cloud, timeline view. It's the frontend counterpart to the `Webscraping`
repo's Django API (`api/` app, `Article` model) — see that repo's own
CLAUDE.md for the backend.

## Commands

```bash
yarn                    # or npm install
npm run start-manual    # plain react-app-rewired start (port 3000)
npm start                # -> node start-smart.js: auto-detects a free port
npm test                 # react-app-rewired test (Jest + Testing Library)
npm run build             # production build
```

`npm run dev` / `npm run backend` also exist (see below) but start a local
*experimental* Python backend, not the production one.

## Where the frontend actually gets its data

`src/Services/Api.ts` is the single source of truth for this: it defaults
`baseUrl` to `https://api.thediversecandidate.com` (the real `Webscraping`
Django API) unless `REACT_APP_API_BASEURL` is set in the environment. If a
task involves "why isn't the frontend showing X," check `Api.ts` and the
active `REACT_APP_API_BASEURL` first — don't assume from `DEV-README.md` or
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
alternative you'd swap in independently by pointing `REACT_APP_API_BASEURL`
at it. If asked to work on "the backend" here, first confirm with whoever's
asking (or check `Api.ts` / the relevant script's own header comment)
which one they mean — `mock_backend.py` and `flask_mock_backend.py` return
fabricated data, `real_scraper_backend.py` does live HTTP scraping, and
`semantic_web_mining_engine.py` (wired up by `npm run dev` via
`dev-start.js`, serving on port 8080) is a separate "semantic source
discovery" experiment, not the production path.

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

## Structure

- `src/Components/` — one folder per feature area: `SearchComponent`,
  `ArticlesComponent`, `WordCloudComponent`, `TimelineComponent`,
  `BackendStatusIndicator`, `PleaseWaitComponent`, `Helpers`.
- `src/Services/Api.ts` — all HTTP calls (`getArticles`, `getArticlesCount`).
- `src/Models/` — `Constants.ts` (pagination/text-length limits),
  `Model.d.ts` (response shapes).
- `src/Context/Context.ts` — shared React context.
