# Engineering Guidelines for AI Agent

## 1. Think Before Coding

* Always reason step by step before writing code.
* Understand the problem, constraints, edge cases, and future impact.
* Design with long-term maintainability in mind.
* Plan how the feature integrates with the existing architecture.
* Prefer extensible patterns over quick fixes.

---

## 2. Code Quality Standards

All code must be:

* Clean and readable
* Modular and reusable
* Well-documented (clear naming over excessive comments)
* Secure and defensive (handle edge cases)
* Efficient and performant
* Easy to debug and test
* Following TypeScript and React best practices

Prefer:

* Strong typing (avoid `any`)
* Explicit return types where helpful
* Clear naming conventions
* Predictable data flow

---

## 3. Architecture & Size Constraints

Keep everything small and focused.

### Size Limits (Soft Constraints)

* Functions: ≤ 30 lines, ≤ 4 parameters
* Components: ≤ 150 lines
* Classes: ≤ 150 lines
* Files: ≤ 200 lines

If something grows too large:

* Extract smaller components
* Extract custom hooks
* Extract utility modules
* Apply Single Responsibility Principle

Each unit should have one clear responsibility.

---

## 4. Incremental Development

* Avoid large refactors.
* Make small, testable changes.
* Ensure each step can be validated and rolled back.
* Preserve system stability while adding features.

---

## 5. User Experience First

* Consider how users interact with the feature.
* Optimize clarity, feedback, and usability.
* Avoid unnecessary complexity in UI.
* Keep state management predictable.

---

## 6. Styling Rules

* Each component must have a matching SCSS file.

    * `ComponentName.tsx`
    * `ComponentName.scss`
* Keep styles scoped and organized.
* Maintain naming consistency.
* Update SCSS files when renaming components.

---

## 7. Async & Function Conventions

* Use `async/await` instead of `.then()`
* Prefer arrow functions over regular functions
* Handle errors explicitly with try/catch
* Avoid nested async logic

---

## 8. Testing Requirements

* Keep tests updated with every change.
* Cover:

    * New features
    * Edge cases
    * Critical flows
* Maintain strong coverage.
* Tests must reflect real usage scenarios.

---

## 9. Documentation & Project Memory

Maintain these files:

### `TODO.md`

* Track completed and pending tasks.
* Update after every step.
* Add new tasks discovered during implementation.

### `memento.md`

Store:

* Architectural decisions
* Important design choices
* Context and constraints
* Trade-offs made
* Key references or links

### `README.md`

Update when:

* Adding features
* Changing behavior
* Modifying setup or usage

---

## 10. After Completing Any Task

Always:

1. Update `TODO.md`
2. Update `memento.md` with decisions/context
3. Update `README.md` if behavior changed
4. Update/add tests
5. Review code quality
6. Refactor if needed
7. Ensure size constraints are respected

---

## 11. Long-Term Vision

* Ensure new features align with overall architecture.
* Avoid shortcuts that create technical debt.
* Think about scalability and future extensibility.
* Prefer composability over monolithic solutions.

---

# Summary Philosophy

Think long-term.
Keep everything small.
Write predictable, testable, modular code.
Prioritize clarity over cleverness.
Update documentation continuously.
Build incrementally and safely.


# TODO list
1. [x] Scroll behavior
2. [x] Select item in job execution history
3. [x] Toast event system
4. [x] Auto-sync tracked projects
5. [x] Create configuration file
6. [x] Replace the info icon with the details dropdown
7. [x] Create method in the service that checks if project has data persisted
8. [x] Fix disable -> enable progress gron project sync
9. [x] Job action buttons
10. [x] Change [project configurations](./src/config.ts) via UI
11. [x] Create README file with screenshots and instructions on how to use the extension
12. [x] Create unit tests
13. [x] Update dependencies and libraries to latest versions
14. [x] Check new circle CI API to see if some of the features can be implemented in a better way (https://circleci.com/docs/api/v2/ and https://circleci.com/docs/api/v1/)
15. [x] The "Include build jobs" should be set per project. Not global. It should default to true. There should be horizontal bar icon in each project listed in the settings. Once you click it, a menu shows up and there should be an option to check "Include build jobs" for that project. This should be persisted. Also, even projects that have no build on the dashboard should be listed there and show the following message: "This project has no build jobs. Enable "No jobs found. Enable "Include build jobs" to show build jobs on the dashboard."
16. [x] Some job titles are too long and the card add "..." at the end. Which is fine. Add the full title on hover using a tooltip.
17. [x] Improve data persistence and caching to reduce API calls and improve performance
    - [x] Consider changing data structure to better fit the needs of the extension and reduce the amount of data stored
    - [x] Consider using indexedDB (deferred: data slimmed in #17, localStorage limits not a concern for now)
18. [x] Setup CI/CD (CircleCI) for project to automate testing and deployment processes
19. [x] Be able to hide/unhide selected jobs
    - The project items should become an accordion on the settings page. When you click on a project, it expands and shows the jobs for that project.
    - Each job has a checkbox next to it. If the checkbox is checked, the job is included in the dashboard. 
    - If the checkbox is unchecked, the job is hidden from the dashboard.
    - This information should be persisted so that when the user comes back to the settings page, they can see which jobs are hidden and which are shown.
    - The "enable/disable build jobs" option should be a shortcut for hiding/showing all build jobs for that project.
    - If the user unchecks "include build jobs", all build jobs for that project are hidden. If the user checks "include build jobs", all build jobs for that project are shown.
    - It should also be possible to hide invididual jobs in the dashboard page. There should be a "hide job" option in the job card menu. If the user clicks on it, the job is hidden from the dashboard and the settings page is updated to reflect that change (the checkbox for that job is unchecked).
20. [x] In the dashboard page, each project should be collapsible.
    - By default, all projects are expanded and show their jobs. If the user clicks on the project name, it collapses the project and hides its jobs.
    - If the user clicks on the project name again, it expands the project and shows its jobs.
    - The collapsed/expanded state of each project should be persisted so that when the user comes back to the dashboard page, they can see which projects are collapsed and which are expanded.
    - There should be a chevron icon next to the project name that indicates whether the project is collapsed or expanded. The chevron should point down when the project is expanded and point right when the project is collapsed.
    - There should be a button on the top of the dashboard (with a fontawesome icon) page that allows the user to expand/collapse all projects at once. If the user clicks on it, all projects are expanded if they were previously collapsed, and all projects are collapsed if they were previously expanded.
21. [x] Move every hard coded style from the components to the CSS files. The components should only have class names and no inline styles. This will make the code cleaner and easier to maintain. It will also make it easier to change the styles in the future without having to modify the components. Reuse the existent classes whenever possible and create new classes when necessary. Avoid using inline styles as much as possible. If you need to use inline styles for some reason, try to minimize it and keep it consistent with the rest of the codebase.
22. [x] Merge every css and scss file into the scss one. Remove the empty ones. This will make the codebase cleaner and easier to maintain. It will also make it easier to find and modify styles in the future. Instead of having styles scattered across multiple files, they will all be in one place, which will make it easier to understand the overall styling of the extension. It will also reduce the number of files in the codebase, which can make it less overwhelming for new contributors. Additionally, it will make it easier to manage dependencies between styles and ensure that styles are applied consistently across the extension.
23. [x] In the settings page. Remove the chevron that expands/collapses the project items. Instead, make the whole project item clickable to expand/collapse the jobs for that project. This will make it easier for the user to expand/collapse the projects and will also make the UI cleaner. The chevron icon is not necessary and takes up space that can be used for other elements. The user can click anywhere on the project item to expand/collapse it, which is more intuitive and user-friendly. Also, instead of "Include build jobs" make 3 different options: select all, unselect all, and select build jobs. This will give the user more flexibility and control over which jobs they want to include in the dashboard. The "select all" option will check all the checkboxes for that project, the "unselect all" option will uncheck all the checkboxes for that project, and the "select build jobs" option will check only the checkboxes for the build jobs for that project. This will make it easier for the user to manage their projects and jobs in the settings page. Also, make the build jobs more identifiable in the settings page by adding a label or an icon next to them. This will make it easier for the user to identify which jobs are build jobs and will also make the UI more visually appealing. The label or icon can be a small badge that says "build" or a small icon that represents a build job (e.g. a hammer or a wrench). This will help the user to quickly identify the build jobs and manage them more efficiently in the settings page.
24. [x] Reorder projects in the settings page and have that reflected in the dashboard page. The order of the projects should be persisted so that when the user comes back to the settings page or the dashboard page, they see the projects in the order they set.
25. [x] In the settings page, add a button to the menu of disabled projects that allows the user to exclude from the list: "Exclude project". Persist that information so that the user doesn't see those projects in the settings page or the dashboard page. This will allow the user to hide projects that they don't want to see or manage in the extension, which can help to declutter the UI and make it easier for the user to focus on the projects that are important to them. Create a button in the Configuration area to "Unexclude all projects". The excluded projects will not be shown in the dashboard page. The user can click on the "exclude project" button in the menu of a disabled project This will give the user more control over which projects they want to manage and see in the extension, and it will also help to keep the UI clean and organized.
26. [x] The "Unexclude projects" button should be renamed to "Restore excluded projects" and it should have a badge telling the number of excluded projects. Also, the info icon in API token should show a tooltip when hovered. The tooltip should explain the steps to get an API token (including the current link in an anchor tag) and also explain that the token is only stored locally in the user's browser and is not shared with anyone. This will help to improve the user experience and provide clear instructions on how to get an API token, which is necessary for the extension to function properly. The tooltip should be concise and easy to understand, and it should provide all the necessary information for the user to get an API token and use the extension without any confusion or issues.
27. [x] To avoid a bad UX. Keep the vertical scroll bars always visible in the scrollable area of both pages. This will prevent the UI from shifting when the scroll bars appear and disappear, which can be jarring and confusing for the user. By keeping the scroll bars always visible, the user will have a consistent experience and will be able to easily scroll through the content without any unexpected changes in the layout. This will also make it easier for the user to navigate through the extension and find the information they need without any distractions or interruptions caused by shifting UI elements.
28. [x] In the dashboard, keep the item enumeration even when there are unselected jobs. For example, if there are 5 jobs and the user unselects job 2 and 4, the dashboard should show the jobs as 1, 3, 5 instead of 1, 2, 3. This will make it easier for the user to keep track of the jobs and their order, even when some jobs are hidden. It will also make the UI more consistent and less confusing for the user. The enumeration should be based on the original order of the jobs, not on the order of the selected jobs. This way, the user can easily identify which jobs are hidden and which are shown based on their original position in the list.
29. [x] Job more options:
    1. [x] Compare against previous execution (https://docs.github.com/en/pull-requests/committing-changes-to-your-project/viewing-and-comparing-commits/comparing-commits)
    2. [x] Browse repo at this point: https://github.com/virgs/jsonPlaceholderReplacer/tree/<commit-hash>
30. [x] In the same button toolbar, but in a different button group, add two radio buttons in the dashboard page to switch the jobs between grid and list view.
    The grid view is the current view where the jobs are displayed in cards.
    The list view is a new view where the jobs are displayed one per line. It's almost the same. The jobs are still cards, but wider (100% of the container) and shorter. The same information and buttons are displayed in the same position (except the card details that are placed side by side in the same line, rather than on top of each other). Maximize reuse wherever you can.
    The user should be able to switch between the two views by clicking on the button. The selected view should be persisted so that when the user comes back to the dashboard page, they see the jobs in the view they selected.
31. ~[ ] Be able to merge workflow data (autosync pipelines)~
32. ~[ ] Card placeholders~
