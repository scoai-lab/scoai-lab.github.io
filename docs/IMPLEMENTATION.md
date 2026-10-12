# SCOAI Lab implementation

## Design and scope
Three static pages: a lab introduction, `/conference-deadlines/`, and `/mpc-deadlines/`. Shared navy (#0c354b), ivory (#f7f4ee), muted teal and copper accents; editorial typography; supplied logo; original generated supply-chain illustration. Home copy is based on the supplied lab description. No invented people, publications, affiliations or statistics.

Both trackers share navigation, cards, search, multi-select filters, timezone selection, sorting, calendar export, theme and language preferences. Conference retains abstract/paper deadlines, CORE, country, area and TBA; MPC retains domains, publication types, CORE, multiple rounds, rebuttal and expected-CFP status. OR within a filter group, AND across groups. Countdown instants never change when the display timezone changes. Expected dates never appear as confirmed. Preferences survive reload but tolerate blocked storage.

Implementation is independent browser-native HTML/CSS/JavaScript. Data snapshots are normalized at build/update time with Python and PyYAML. Preserve MPC MIT notice; credit conference-deadlines and its MIT ccfddl data source. Links and assets remain relative so project Pages and organization Pages both work.

## Execution plan
- [x] Normalize both source datasets, retaining provenance and timezone offsets. Test AoE, Pacific DST, expected CFP and multiple rounds.
- [x] Implement pure tracker model; test filtering, expired/TBA ordering, abstract cutoff, calendar UTC escaping and invalid dates.
- [x] Build shared responsive shell, homepage and both trackers with original artwork.
- [x] Run tests, inspect desktop/mobile in browser, and check direct routes and assets under a repository prefix.
- [x] Add static build, data refresh, Pages deployment workflows and operating instructions; save deliverable and push authorized repo work.

## Review focus
Ambiguous/missing dates remain unknown; no made-up deadlines. Long names and small viewports wrap. Storage and network failures are recoverable. Calendar export reflects the active filters and excludes unconfirmed deadlines. Deep routes resolve independently of SPA fallbacks. The requested scoai-lab.github.io hostname requires its GitHub owner; htkchi/scoai-website alone cannot provide it.

## Verification record

- 7 JavaScript model tests and 6 Python normalization/update tests pass.
- A fresh independent reviewer identified calendar UID collisions, metadata-only update loss, and periodic details collapse. All three fixed; calendar/metadata regressions reproduced before fixing.
- Browser: desktop 1440px and mobile 390px, English/Vietnamese, light/dark, search, combined filters, persisted filters, empty state/reset, MPC multiple rounds, TBA without countdowns, timezone changes and actual iCal download. No JavaScript console errors observed.
- Expanded MPC details remain open across more than one minute; automatic rerender now occurs only at a real deadline boundary, retaining details and focused controls.
- Static link validation passes for the production output and nested pages.
- The initial repo has no commits; implementation is the first website version. GitHub credentials report push access but not repository administration, so enabling Pages may require the owner.

Deployment result: GitHub Actions build succeeded; deploy stopped at configure-pages because Pages is not enabled. The available credential cannot create the Pages site (API returns 404, repository permission reports admin=false). Owner action: Settings → Pages → Source: GitHub Actions, then rerun the workflow.

## Organization migration

Migrated the complete website and Git history to scoai-lab/scoai-lab.github.io at the user’s request. The new repository grants admin access, allowing GitHub Pages configuration. The original htkchi repository remains unchanged. Updated the public GitHub link and deployment documentation for the organization domain.

## Typography and usability review

- Bundled Be Vietnam Pro (400/500/600/700) with its OFL license; Vietnamese uses consistent sans-serif headings and improved diacritic spacing.
- Increased body, supporting copy, filters, metadata and deadline values; small-phone research cards use one column and abstract/paper blocks stack.
- Dark-mode branding uses the original transparent logo with a reversed monochrome treatment, without a background rectangle.
- Replaced the theme select with a keyboard-accessible icon button cycling Light → Dark → Auto, with current/next labels and saved preference.
- Localized headings, filter options and supporting labels. Added mobile filter close/show-results controls with focus restoration; Escape restores navigation focus.
- Versioned CSS/JS build URLs to avoid stale UI assets after deployment.
- Browser QA: all three routes in Vietnamese at 320/768/1440px without horizontal overflow; English light and Vietnamese dark visual checks; theme cycle + reload + Enter, mobile filtering, and Escape focus tested. Existing 13 logic tests pass.
