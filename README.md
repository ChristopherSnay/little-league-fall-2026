# JC Bombers 10U — Fall 2026 stats

A local-first stats site for the JC Bombers 10U Fall 2026 season. It turns
`JCBombers10UStatsFall2026.csv` into a typed JSON data file, then visualizes the
season with React, Vite, TypeScript, MUI, and MUI X Charts.

## Quick start

```bash
npm install
npm run dev
```

`npm run dev` regenerates `src/data/team.json` from the CSV before starting Vite.

Production build:

```bash
npm run build
npm run preview
```

The Vite config uses `base: '/'` because the site is served from the custom domain
root. The dev server runs at `http://localhost:5173/` and `npm run preview` serves
the production build at `http://localhost:4173/`.

## Deployment (GitHub Pages)

The site publishes to <https://littleleague2026.christophersnay.com> with the
`gh-pages` package, using the same setup as the `lisbon-recycling` project:

```bash
npm run deploy
```

`predeploy` regenerates the data and builds `dist/`; `postbuild` runs
`scripts/postbuild.mjs`, which copies `dist/index.html` to `dist/404.html`; then
`gh-pages` publishes `dist/` to the `gh-pages` branch. The repository's Pages
settings must point at the `gh-pages` branch and use
`littleleague2026.christophersnay.com` as the custom domain, with a DNS `CNAME`
record for that subdomain pointing at `christophersnay.github.io`.

The root `CNAME` and `.nojekyll` files are copied into `dist/` by
`vite-plugin-static-copy`. The generated `404.html` lets GitHub Pages serve the
app for deep links such as `/batting`; React Router then renders the matching
page.

## Routing

Navigation uses `react-router-dom` with `createBrowserRouter`. Routes are
`/overview`, `/batting`, `/pitching`, `/fielding`, `/players`, and `/glossary`;
`/` redirects to `/overview` and unknown paths render the in-app 404 page.

## Commands

| Command | What it does |
| --- | --- |
| `npm run data` | Parses the CSV and writes `src/data/team.json` |
| `npm run dev` | Regenerates data and starts the Vite dev server |
| `npm run build` | Regenerates data, type-checks, and builds `dist/` |
| `npm run lint` | Runs ESLint |
| `npm run preview` | Serves the production build locally |
| `npm run deploy` | Builds and publishes `dist/` to the `gh-pages` branch |

## Pages

- **Overview** — season headline stats, generated insight cards, plate-appearance
  outcome donuts, and runs scored by player.
- **Batting** — walk/strikeout quadrant chart, OPS leaders, runs + RBI leaders, and
  a sortable table with Core / Discipline / Batted ball / Situational stat groups.
- **Pitching** — command vs. swing-and-miss quadrant chart, workload chart, and the
  full exported pitching table.
- **Fielding** — position-innings heatmap (including catcher and short field),
  errors by player, catcher workload, and the full fielding table.
- **Players** — searchable/filterable roster cards, full player drawer, and a
  two-player percentile radar comparison.
- **Glossary** — every abbreviation from the CSV's Glossary row, searchable by
  section.

Clicking a row in the batting, pitching, or fielding tables opens that player's
full stat sheet in a right-side drawer.

## Data pipeline

`scripts/build-data.mjs`:

1. Parses the CSV with `csv-parse`, preserving empty cells as `null`.
2. Validates the 17-row × 180-column shape, the 13 player rows, the Team row, and
   the Glossary row.
3. Splits the CSV into batting, pitching, and fielding blocks using the section
   header row.
4. Converts fielding/pitching innings from baseball notation (`11.1` = 11⅓) into
   decimal innings for calculations.
5. Adds derived pitching and fielding fields, including innings by position.
6. Normalizes the source spelling `MCCoy` to `McCoy` for display.
7. Writes `src/data/team.json`, then spot-checks known values (Bazinet AVG, Adams
   OPS, team walks, pitcher count, column counts) so a parser regression fails
   loudly.

The generated JSON is included in `src/data` so the app has a typed data source
without any runtime CSV parsing. Every `dev`/`build` regenerates it first.

## Data notes and caveats

- The source contains **season totals only**. There are no dates, opponents, game
  logs, or win/loss record, so none are invented here.
- Pitching W/L/SV and pitch-type/velocity columns are empty or zero in this export,
  so they are hidden from the main tables and omitted from the player drawer.
  The source still defines them in the glossary.
- Innings use baseball notation: `11.1` means 11⅓ innings.
- ERA uses 6-inning games, matching the source values.
- Fielding covers **ten** positions: pitcher, catcher, four infield spots, three
  outfield spots, and short field (SF).
- The official Team row differs slightly from the sum of player rows in a few
  counting stats. Headline team stats use the Team row. The Overview's Data notes
  panel lists every discrepancy: R, TC, PO, DP, SB allowed, CS, and LOB.
- The source spells a player's last name `MCCoy`; the app displays `McCoy`.

## Project structure

```text
JCBombers10UStatsFall2026.csv   source data
scripts/build-data.mjs          CSV parser and validator
src/data/team.json              generated typed data
src/lib/                        types, formatting, columns, insights
src/components/                 charts, tables, heatmap, drawer, compare
src/sections/                   Overview, Batting, Pitching, Fielding,
                                Players, Glossary, NotFound
src/router.tsx                  react-router route table
src/App.tsx                     AppBar, tabs, drawer wiring, footer
CNAME                            custom domain published with the build
```
