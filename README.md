# SCOAI Lab

A responsive lab website and two integrated research deadline trackers, branded with SCOAI's navy and ivory identity.

## Pages

- `/`: lab introduction, five research areas, research resources and team introduction.
- `/conference-deadlines/`: conference search, area / CORE / country filters, abstract and paper countdowns, TBA status, timezone selection and iCal export.
- `/mpc-deadlines/`: MPC venue search, domain / publication type / CORE filters, multiple rounds, expected CFPs, rebuttal notes and iCal export.

Shared English/Vietnamese UI, light/dark/automatic themes, mobile navigation, accessible form labels, reduced-motion support and persistent preferences. No backend, analytics, account system or frontend dependencies. Google Fonts is optional; system fonts remain usable offline. All data is included locally.

## Preview and validate

Node 20+ and Python 3.10+ are required for checks/builds. Browsing the deployed website requires neither.

```sh
python3 -m pip install -r scripts/requirements.txt
npm test
npm run build
npm run dev
```

Open `http://127.0.0.1:4173/`. A web server is required for JSON and ES modules; opening the HTML file directly is not supported. The build produces `dist/`, which can be hosted by any static web server.

## GitHub Pages

In repository **Settings → Pages**, select **GitHub Actions** as the build source. The included workflow validates and deploys pushes to `main`. Daily scheduled builds and manual workflow runs refresh source data before deployment. A failed refresh fails the build and leaves the previously deployed version intact. Snapshot changes from the scheduled build are deployed as an artifact, not committed back to the repo.

The canonical repository is `https://github.com/scoai-lab/scoai-lab.github.io`.

Published routes:
- `https://scoai-lab.github.io/`
- `https://scoai-lab.github.io/conference-deadlines/`
- `https://scoai-lab.github.io/mpc-deadlines/`

All three pages are served by this single organization repository. Relative links also support previews under a subdirectory.

## Data maintenance

```sh
python3 scripts/sync_data.py
```

The script snapshots the two requested upstream datasets, preserving descriptions, locations, notes and all rounds. MPC AoE values become explicit UTC−12 timestamps; PT uses the Pacific timezone for the actual date, including DST. `EXP` and `EXPCFP` entries never generate confirmed countdowns or calendar events. Conference timestamps already have offsets. CORE is distinct from CCF rankings.

Search is case-insensitive. Multiple choices within one filter group use OR; groups are combined with AND. Clearing a group includes everything. Upcoming entries sort before unannounced and past entries. Calendar export includes confirmed future paper and abstract deadlines matching the active filters, including all matching rounds. A downloaded calendar is a snapshot, not a live subscription.

For event-date sorting, only unambiguous month/day strings have a derived sort date; unknown dates go last. The original display text is retained. Unstructured MPC abstract/rebuttal dates remain source notes and are not guessed into calendar events. Always verify against official CFPs.

## Provenance and assets

- MPC source: https://github.com/mpc-deadlines/mpc-deadlines.github.io — MIT, notice in `docs/MPC-LICENSE.txt`.
- Conference snapshot: https://github.com/conference-deadlines/conference-deadlines.github.io, sourced there from the MIT https://github.com/ccfddl/ccf-deadlines dataset. This frontend is independently implemented; upstream conference frontend code is not copied. MIT notice in `docs/CCF-LICENSE.txt`.
- `assets/scoai-logo.png`: original logo supplied by the user.
- `assets/supply-chain-hero.png`: generated illustration; prompt and production details in `docs/ASSETS.md`.
- `credits.html`: public source acknowledgements.

Home copy is based on the lab description provided by the owner. No team identities, institutional affiliations or research results have been invented.
