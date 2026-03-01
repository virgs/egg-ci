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
