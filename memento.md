# Memento — egg-ci Architectural Decisions

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

