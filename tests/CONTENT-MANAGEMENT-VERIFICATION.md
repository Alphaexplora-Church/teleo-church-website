# Content Management verification

Date: 2026-10-07

Implemented in the admin frontend only. The backend, shared header/sidebar, global CSS, and neighboring pages were not edited. Existing owner changes to church authorization, category selection, Summary, and unrelated modules were retained.

## Owner corrections

- New Journey uses its previous single-scroll form and original Part dialog. It has no editor tabs, reordered fields, or Optional details section. The prior Summary textarea, thumbnail input and five-category dropdown remain.
- The collection's category filter reads the complete global catalog, including categories with no Journeys. Catalog loading/failure has separate feedback and Retry.
- Existing-Journey editing retains the redesigned tabs, accessible dialogs, keyboard reordering and unsaved-change guard.

## Automated checks

- Production build: passed; Vite reports its existing large-bundle advisory.
- Changed production files: targeted ESLint passed.
- Behavioral tests: 8 passed (`node --test tests/content-management.test.cjs`). Covers 0/1/8/9/61 records, page overlap, retained filter parameters, later-page failure, malformed pagination, cancellation, stable sorting, actual Part counts, confirmed-ID reuse after partial saving, and uncertain create-result protection.
- Diff whitespace check: passed.
- Impeccable detector: no findings on redesigned surfaces.
- Repository-wide lint: still fails on the pre-existing unused `_payload` in `PartReorderPanel.tsx`; also retains the pre-existing Events effect dependency warning. Both were observed before implementation.

## Browser fixture evidence

The development-only `tests/content-management.html` renders actual production components with an isolated fetch fixture. It intercepts every request; it does not authenticate, read, or write church data. It is not an application route and is not included in the production entry build.

| Scenario | Evidence |
|---|---|
| Populated desktop collection | Inspected at 1280 px; 61 total, correct lifecycle counts, eight visible rows and eight pages |
| Preview | Inspected saved metadata, ordered Parts and hidden-member notice |
| Existing editor | Inspected details/builder tabs and retained Parts |
| Nested dialogs | Confirmed parent and shell inert, top dialog focused, focus returned to Add Part on close |
| Reordering/dirty guard | Moved a Part down; Cancel opened confirmation; Keep editing preserved ordering; Save persisted it in fixture |
| Mobile dialogs | Inspected at 390 × 844; Part fields and footer visible |
| Tablet collection | Checked at 768 × 1024; no document horizontal overflow |
| Multi-status and sort | Draft + Published returned 41; Title A–Z changed row ordering |
| Full category catalog | Unused Hope category available; selecting it showed no-results while all six catalog categories remained available |
| Original New Journey | Confirmed no tabs, original field order, Summary and Series Builder; visually inspected |

## Not verified

Authenticated backend/browser and real member effects remain unverified because the inspection browser redirects the application route to login. Full end-to-end thumbnail upload, actual provider validation, archive/restore, pointer drag, screen-reader speech, zoom/contrast audit, and all error-state browser scenarios were not tested. Unit tests and isolated fixture evidence do not establish these live outcomes.
