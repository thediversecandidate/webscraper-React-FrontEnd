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
npm install --legacy-peer-deps  # required: react-wordcloud's peer dep only declares React 16 support
npm run start-manual             # plain react-app-rewired start (port 3000)
npm start                        # -> node start-smart.js: auto-detects a free port
npm test                         # react-app-rewired test (Jest + Testing Library)
npm run build                    # production build
```

`npm run dev` / `npm run backend` also exist (see below) but start a local
*experimental* Python backend, not the production one.

Verified working (2026-08): fresh install, `npm test` (1/1 passing, plus
`TimelineComponent`'s suite deliberately excluded — see below), and
`npm run build` (compiles cleanly, ~217 kB gzipped JS).

## Jest config lives in `config-overrides.js`, not `jest.config.js`

`react-app-rewired test` (which `npm test` runs) does **not** read a
top-level `jest.config.js` — react-scripts builds its Jest config
programmatically, and react-app-rewired only lets you touch it through
`config-overrides.js`'s `jest` export. A `jest.config.js` used to sit at
the repo root doing nothing: its `transformIgnorePatterns` override for
ESM-only `d3-*` packages (needed because `react-wordcloud` pulls in
`d3-transition`, which nests its own ESM-only copy of `d3-interpolate`)
never actually took effect, so `npm test` failed outright with
`SyntaxError: Unexpected token 'export'`. `SECURITY-VERIFICATION.md`
claimed this had already been fixed via that file — it hadn't. Fixed by
moving the override into `config-overrides.js`'s `jest` hook (the only
place react-app-rewired actually reads), and the dead `jest.config.js` was
deleted rather than left around to mislead the next edit.

That same `jest` hook also excludes
`TimelineComponent.test.tsx` (`testPathIgnorePatterns`) — that suite
renders the real, unmocked `react-chrono` library in jsdom, which doesn't
implement the layout APIs (`ResizeObserver`, real `getBoundingClientRect`)
react-chrono needs, and it spins consuming multiple GB of RAM instead of
failing cleanly. `SECURITY-VERIFICATION.md` also claimed this exclusion
already existed "due to memory constraints" — it didn't, anywhere. If
react-chrono gets mocked in that test in the future, remove the exclusion
rather than leaving it stale.

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

## Dependency vulnerabilities

A fresh `npm install --legacy-peer-deps && npm audit` found 57 known
vulnerabilities (4 critical, 28 high) — `SECURITY-VERIFICATION.md`'s "0
vulnerabilities" claim (October 2025) had gone stale as new CVEs landed in
transitive dependencies over the following ~10 months, not from any change
made in this repo. `npm audit fix` (non-breaking) closed 32 of them, down
to 25 remaining — every one of those 25 is inside `react-scripts`' own
build/dev toolchain (`jest`, `webpack-dev-server`, `svgo`/`@svgr/*`,
`workbox-build`) and doesn't ship in the production bundle from
`npm run build`. Full closure requires migrating off Create React App
(unmaintained upstream) to a maintained build tool — Vite is the standard
replacement for a React 18 app like this one — which is a real migration
(env var prefix changes, config rewrite, full smoke test), not a dependency
bump; flagged as the top modernization recommendation for this repo, not
attempted here. See `SECURITY-VERIFICATION.md`'s "2026-08-05 re-audit"
section for the full breakdown, and re-run `npm audit` before trusting any
"zero vulnerabilities" claim in that file again.

## Structure

- `src/Components/` — one folder per feature area: `SearchComponent`,
  `ArticlesComponent`, `WordCloudComponent`, `TimelineComponent`,
  `BackendStatusIndicator`, `PleaseWaitComponent`, `Helpers`.
- `src/Services/Api.ts` — all HTTP calls (`getArticles`, `getArticlesCount`).
- `src/Models/` — `Constants.ts` (pagination/text-length limits),
  `Model.d.ts` (response shapes).
- `src/Context/Context.ts` — shared React context.
