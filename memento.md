# Memento — egg-ci Architectural Decisions

## CircleCI CORS Strategy (GitHub Pages)

**Constraint**: CircleCI API does not allow browser CORS from GitHub Pages origins. This cannot be bypassed with query params or frontend-only request tweaks.

**Implementation**:
- `CircleCiClient` now resolves base URL with `resolveCircleCiBaseUrl(isDev, proxyUrl)`.
- Development keeps using Vite proxy via relative `/api` URLs.
- Production uses `VITE_CORS_PROXY_URL` when provided; otherwise it falls back to `https://circleci.com` (which will fail with CORS in browser deployments).

**Proxy**:
- Existing Cloudflare Worker in `cors-proxy/worker.js` is the recommended production path.
- Worker now enforces an origin allowlist and supports both GitHub Pages and local dev origins.

## Workflows Empty State (No Enabled Projects)

**Behavior change**: Navigating to `/workflows` with no enabled (and non-excluded) projects no longer redirects to `/projects`.

**UI**: Workflows page now shows an inline info alert with:
- Title: "No projects enabled yet"
- Hint text explaining to enable a project on the Projects page
- CTA button: "Enable projects" (navigates to `/projects`)

**Implementation**:
- Added `hasEnabledProjects(projects)` in `src/pages/workflowsPageUtils.ts`
- `WorkflowsPage` now computes page state (`projectPairs` + `hasEnabledProjects`) and renders an empty-state block when needed
- Added coverage in `src/pages/workflowsPageUtils.test.ts`

## CircleCI Publish Job (GitHub Pages)

**Final choices (updated)**:
- Publish target: `main` branch `/docs` (no separate deploy branch).
- Auth: GitHub fine-grained PAT with `Contents: Read and write`, stored as CircleCI `GITHUB_TOKEN`.
- Workflow dependency: `publish` waits only for `build`.

**Failure learned**: The previous `gh-pages` flow initialized a separate `.publish` git repo and failed with "Author identity unknown" when commit identity was not configured there.

**Current deploy mechanism**: Build output (`docs/`) is persisted from `build` to workspace, then `publish` commits `docs/` in the checked-out repository and pushes `HEAD:main` with `[skip ci]` to avoid pipeline loops.

## Homepage (TODO #1)

**Route**: `/home` — always accessible, default for `/*` redirect.
**Content**: Quick-link buttons (Settings always enabled; Projects/Workflows disabled when no API key) + README.md rendered via `marked` + `dompurify`.
**README import**: `import readmeContent from '../../README.md?raw'` (Vite `?raw` import; type declared in `vite-env.d.ts`).
**Reactive navbar**: `NavBarComponent` and `HomePage` both use `useState` + `useUserInformationChangedListener` + `useLoggedOutListener` to reactively enable/disable guarded links.
**Redirect guard**: `/projects` and `/workflows` both redirect to `/settings` via `useNavigate` + `useEffect` when no API key is present.
**NavBar brand**: `Navbar.Brand as={NavLink} to="/home"` — clicking the icon or name navigates home.

## Status Filter Feature (TODO #2)

**Decision**: Status filters stored as URL query params (`?statuses=success,running`) via `useSearchParams` from react-router-dom, with `replace: true` to avoid polluting browser history.

**Filter semantics**: Empty `statusFilters` array = show all jobs. Non-empty = show only jobs whose `history[0].status` is in the set.

**Architecture**:
- `statusFilterUtils.ts` — pure utility: `ALL_JOB_STATUSES` array, `parseStatusFilters`, `serializeStatusFilters`, `matchesStatusFilter`
- `WorkflowsPageContext` — extended with `statusFilters: string[]` and `handleStatusFiltersChange`
- `WorkflowsPageProvider` — reads/writes URL param `statuses` via `useSearchParams`
- `StatusFilterDropdown` — react-bootstrap `Dropdown` with `autoClose="outside"`, badge showing active count, "Clear all" option
- Filter applied in `WorkflowComponent` at render time, passed via props from `ProjectSectionComponent`

**Trade-off**: Filter applies per-job across all workflows (history[0] is the latest regardless of which workflow the job came from), as specified.

## Rerun Job Bug Fix (TODO #1)

**Root cause**: `pipeline.updated_at` does not change when CircleCI creates a new rerun workflow in the same pipeline. The skip optimization in `WorkflowFetcher` would skip the entire pipeline.

**Fix**: `listPipelineWorkflows` is now always called before the skip check. The fetcher tracks known workflow IDs (`existingWorkflowIds`) and only skips when no new workflows exist.

**New skip condition**: `unchangedTimestamp && !hasActiveJobs && !hasNewWorkflows`

## Theme Switching (TODO #1)

**Mechanism**: Vite `?url` imports (`bootswatch/dist/.../bootstrap.min.css?url`) give asset URLs at build time. `applyTheme(theme)` in `src/theme/ThemeManager.ts` inserts/updates a `<link id="app-theme">` tag at the top of `<head>`. Theme is persisted in `SettingsRepository` under key `'theme'`.

**To change themes**: Edit the two import paths at the top of `src/theme/ThemeManager.ts`. Replace `sandstone` (light) or `slate` (dark) with any Bootswatch theme name (e.g. `cosmo`, `flatly`, `darkly`). Rebuild.

**CSS structure**: `src/scss/styles.scss` contains only structural/layout CSS (no Bootstrap import). Bootswatch (which bundles Bootstrap) is loaded exclusively via the dynamic link tag.

**Init**: `applyTheme` is called in `main.tsx` before `ReactDOM.createRoot` to minimise flash of unstyled content.

**Toolbar tooltips**: `ToggleButtonGroup`/`ToggleButton` replaced with plain `btn-group` + individual `Button` components, each wrapped in `OverlayTrigger`. Filter tooltip lives inside `StatusFilterDropdown` on the `Dropdown.Toggle`.

## React-Bootstrap Migration

All vanilla Bootstrap JS imports replaced with react-bootstrap components. Key patterns:
- `Dropdown.Toggle as="span" bsPrefix="custom-class"` — custom toggle element without default button styling
- `Nav.Link as={NavLink}` — leverages react-router active state detection
- `OverlayTrigger` + `Tooltip` — replaces manual `new bootstrap.Tooltip(el)` initialization
- `autoClose="outside"` on Dropdown — keeps menu open when clicking checkboxes inside

## WorkflowsPage Context Split

Context type in `WorkflowsPageContext.tsx`, provider component in `WorkflowsPageProvider.tsx`.
Required by `react-refresh/only-export-components` ESLint rule (fast refresh).

## Job Type Tooltips

**Component**: `ProjectJobListComponent.tsx`
**Change**: Wrapped `FontAwesomeIcon` icons (`faScrewdriverWrench` / `faThumbsUp`) with `OverlayTrigger` + `Tooltip` from react-bootstrap. Build jobs show "Build job", approval jobs show "Approval job".
**Pattern**: Uses `<span>` wrapper around `FontAwesomeIcon` for proper ref forwarding to `OverlayTrigger`, consistent with existing tooltip patterns in the codebase.

## Per-Project Sync Frequency & Queue

**Removed**: Global `autoSyncInterval` from `Config` type and `defaultConfig`. Removed `useInterval`-based auto-sync from both `App.tsx` and `ProjectsPage.tsx`.

**Model change**: Added optional `syncFrequency?: number` to `TrackedProjectData` (default: `DEFAULT_SYNC_FREQUENCY_MS = 30_000` from `models.ts`). Persisted in localStorage alongside other project fields.

**SyncQueue** (`src/project/SyncQueue.ts`): Singleton queue that processes one project at a time. Uses `setTimeout`-based scheduling, not `setInterval`. Key design:
- Sorted by `nextSyncAt` ascending — earliest project syncs first.
- After sync completes (success or failure), project is re-enqueued with `nextSyncAt = now + syncFrequency`. This reschedules based on completion time, gracefully handling slow syncs.
- Re-reads `loadTrackedProjects()` after each sync to pick up any changes to `syncFrequency`, `enabled`, or `excluded`.
- Disabled/excluded projects are not re-enqueued after sync.
- `subscribe(listener)` pattern allows React hooks to react to queue changes.

**React integration**:
- `SyncQueueContext` (`src/contexts/SyncQueueContext.ts`) — provides the queue instance via React context.
- `App.tsx` creates the `SyncQueue` in `useMemo`, populates it with enabled projects in `useEffect`, wraps the app in `SyncQueueContext.Provider`.
- `useSyncCountdown` hook (`src/time/UseSyncCountdown.ts`) — combines `setInterval(5s)` + `syncQueue.subscribe()` to produce a bucketed countdown label.
- `ProjectItemComponent` shows countdown text (`"< 30s"`, `"< 1m"`, `"syncing…"`) next to the project name when enabled.
- `ProjectItemComponent.onSwitchChange` adds/removes projects from the sync queue when toggling the enable switch.

**ProjectsPage**: `useInterval` replaced with a one-time `useEffect` that fetches the project list on mount.

**Trade-off**: Queue is ephemeral — rebuilt from scratch on page load. Projects whose sync time passed while the tab was closed sync immediately in queue order.

## Sync Frequency UI & Bucketed Countdown

**Countdown display**: Replaced per-second countdown (`in 12s`) with bucketed friendly labels (`< 30s`, `< 1m`, `< 2m`, `< 5m`, `< 10m`, `> 10m`, `syncing…`). Update interval changed from 1s to 5s. Pure function `formatCountdownLabel` exported for testing.

**Sync frequency modal**: `SyncFrequencyModalComponent` — react-bootstrap `Modal` with `Form.Select` dropdown offering 30s, 1m, 2m, 5m, 10m options. Triggered from new "Set sync frequency" menu item in `ProjectMenuComponent` (placed between "Select approval jobs" and "Exclude project" with dividers).

**Job visibility extraction**: `useJobVisibility` hook (`src/components/project/useJobVisibility.ts`) — extracted from `ProjectItemComponent` to keep file under 200 lines. Manages `hiddenJobs` state and all select/unselect/toggle handlers.

**Wiring**: `ProjectItemComponent.handleSyncFrequencyChange` persists the new frequency via `ProjectService.setSyncFrequency`, updates the in-memory project, and re-adds the project to the `SyncQueue` with the new frequency.

## Sync Frequency Modal — Current Frequency Display

**Change**: Modal now shows "Current: **1 minute**" (or whichever value) above the dropdown. Resolves the label by looking up `SYNC_FREQUENCY_OPTIONS` by value. Options/types extracted to `syncFrequencyOptions.ts` to satisfy `react-refresh/only-export-components` ESLint rule.

## Status Filter Categories & Multi-Column Layout

**Categories** (`statusFilterUtils.ts`): `STATUS_CATEGORIES` array of `{ label, statuses[] }`. Categories: Successful, In progress, Scheduled, Failed, Canceled, Retried. Categories may overlap. Utility functions `selectCategory` (additive — merges into current) and `isCategorySelected` (true when all category statuses are present).

**UI** (`StatusFilterDropdown.tsx`): Category quick-select buttons use `variant="link"` (matching Select all / Clear all style) and are arranged in the same two-column CSS grid as the status checkboxes. Buttons are disabled when all their statuses are already selected. Individual status checkboxes split into two columns via CSS grid (`status-filter-grid`). Dropdown `min-width` set to 320px.

## useRelativeTime — Periodic Refresh Fix

**Bug**: "Updated X ago" text in the project menu was stale — only computed once on mount/timestamp change via `setTimeout(0)`, never refreshed.

**Fix**: `UseRelativeTime.ts` now uses `setInterval(10s)` alongside `setTimeout(0)` for the initial computation. The `computeRelativeTime` helper was extracted for reuse. The `useState` initializer also calls `computeRelativeTime` so the first render is immediate without a synchronous `setState` in the effect (which would violate `react-hooks/set-state-in-effect`).

## Profiles + Persistent Workflow Filters

**Profile model**: Added `ProfileRepository` and `src/profile/models.ts` with a guaranteed `Default` profile. Users can create, edit (name only), delete (except last profile), and switch active profile.

**UI entry points**:
- Navbar: profile name dropdown left of GitHub icon with profile list and "Manage profiles" shortcut to Settings.
- Settings: structured into sections with dividers:
  - **Token**: Signed-in status first (with "Unsigned" warning if no token), then API token input
  - **Profiles**: Flat list with slider + inline-editable name (save on blur/Enter) + delete button
  - **Danger Zone**: Clear API key and Clear all data buttons

**Profile list behavior**:
- Slider + editable name + delete button (disabled when only 1 profile)
- Click name to edit inline, auto-saves on blur or Enter press (no Save/Cancel buttons)
- Add Profile button: small, right-aligned below list, same size as other action buttons
- Auto-generates "Egg profile (X)" with lowest available number (reuses gaps)
- Only one slider ON at a time: toggling ON another profile auto-turns OFF the current one

**Persistence scope**:
- Global keys remain global: CircleCI API token and user info.
- Profile-scoped keys: tracked projects, project cached data, workflow view, workflow text filter, workflow status filters.
- Scoped key format: `<baseKey>:profile:<profileId>`.

**Workflow filter behavior**: status filters are mirrored in URL (`statuses=...`) and also persisted to profile-scoped local storage so shared links and personal defaults both work.

**Deletion cleanup**: deleting a profile removes its scoped project/filter storage entries; at least one profile must always exist.


**Unique name enforcement**: profile names are checked case-insensitively and must be unique across all profiles.

## Buy Me a Coffee Integration

**Location**: NavBar component, far right after GitHub icon.

**Icon**: FontAwesome `faMugHot` (coffee mug icon) at 2xl size.

**Link**: https://buymeacoffee.com/virgs — opens in new tab.

**Styling**: Matches GitHub link styling (white icon, hover transition to secondary color).

**Purpose**: Provides community members an easy way to support development without leaving the dashboard.

## Compact View for Workflows

**Feature**: Added compact view mode (`'compact'`) to workflows page alongside grid and list views.

**UI Entry**: Third button in the view toggle group (compress icon `faCompress`), labeled "Compact view" in tooltip.

**Behavior**:
- **Job cards**: Hides card body and footer, showing only header with job name and status
- **Project layout**: On xxl+ screens, displays 2 projects per row; on smaller screens, 1 project per row
- **Job card layout**: Always uses grid layout (4-5 per row within each project container)
- **Card width**: Job cards keep original `max-width: 250px` (grid mode) or 100% (list mode)
- **Spacing**: Tighter padding (`py-0`) between workflow sections in compact mode

**Implementation**:
- Updated `WorkflowView` type to include `'compact'`
- `WorkflowsPage` wraps projects in a grid with `row-cols-1 row-cols-xxl-2` for compact view
- `JobCardComponent` uses `WorkflowViewContext` to conditionally hide body/footer in compact mode
- `WorkflowComponent` always uses standard grid layout for jobs (4-5 per row) regardless of view mode
- Job card width remains constant; project container width changes based on view mode

**Use Case**: Ideal for dashboards with many projects or users preferring a compact view of multiple projects side-by-side on large screens, while still seeing all job statuses clearly (header-only cards).



## Props Drilling Elimination - WorkflowView Context

**Problem**: `workflowView` mode (grid/list/compact) was being passed as props down multiple component levels: `ProjectSectionComponent` → `WorkflowComponent` → `JobCardComponent`, causing props drilling and unnecessary re-renders.

**Solution**: Created `WorkflowViewContext` to provide `workflowView` mode through React Context instead of props.

**Architecture**:
- New `src/contexts/WorkflowViewContext.ts` with `WorkflowViewContext` and `useWorkflowView()` hook
- `WorkflowComponent` provides context wrapping `JobCardComponent` rendering
- `JobCardComponent` consumes context via `useWorkflowView()` instead of receiving props
- Eliminated `listView` and `compactView` boolean props from JobCardComponent Props type
- Simplified `JobCardComponent` Props: now only takes `job`, `jobOrder`, `projectUrl`, `onHideJob`

**Benefits**:
- Cleaner component interfaces (fewer props = easier to reason about)
- Reduced unnecessary prop passing through intermediate components
- Better encapsulation of view-related concerns in WorkflowComponent
- Single source of truth for workflowView mode in the context
- More maintainable and easier to extend in the future

**Refactoring Changes**:
- `ProjectSectionComponent`: Now passes `workflowView` mode (not booleans) to `renderProjectContent` and `WorkflowComponent`
- `WorkflowComponent`: Provides `WorkflowViewContext` wrapping job cards, eliminates `listView` and `compactView` props
- `JobCardComponent`: Uses `useWorkflowView()` hook to access view mode from context

## Workflow Job Menu Clipping Fix

**Issue**: In compact view, job options dropdown (`JobCardHeaderComponent`) could be clipped by the next project section.

**Root cause**: `.collapsible-grid__inner` used `overflow: hidden` even when expanded, so dropdown menus extending outside card bounds were cut off.

**Fix**:
- `src/scss/styles.scss`: set `.collapsible-grid__inner { overflow: visible; }`
- `src/scss/styles.scss`: keep clipping only in collapsed state via `.collapsible-grid--collapsed .collapsible-grid__inner { overflow: hidden; }`
- `src/components/job-card/JobCardHeaderComponent.scss`: added `.job-menu .dropdown-menu { z-index: 1080; }` for reliable stacking over adjacent sections.

**Result**: Job options menu is fully visible across views, including compact mode near section boundaries.

## README Badges

**Added**: A top-level badge row in `README.md` for quick project health visibility.

**Badges included**:
- Version (`github/package-json`)
- Build status (CircleCI main branch)
- License (GitHub license)
- Dependencies (`libraries.io`)
- Deployment target (GitHub Pages)

**Reasoning**: Improves first-glance discoverability for maintainers and contributors without changing runtime behavior.
