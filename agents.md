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
1. [x] Navbar to have three sections: Settings, Projects, Workflows (and a GitHub icon linking to the project repo in the far right end). No Menu anymore. The sections should be on the left side of the navbar, next to each other.
   - Each section should link to a page whose title is the same as the section.
   - The settings page will have the API key input, the clear API key button and the clear all data (pretty much the top of the current settings page). Both block buttons. The buttons should only be enabled if there's a valid API key. If there's no valid API key, only the input should be enabled. The clear API key button should clear the API key and disable itself and the clear all data button. The clear all data button should clear all data and disable itself and the clear API key button. This page should be the default page when the user opens the app for the first time or when there's no valid API key.
   - The projects page will have the list of project and the "Restore deleted projects" button (pretty much the current settings page except for the API Key part). The button should be enabled only if there's at least one deleted project. Remove the others configurations options. They should only be changed via code, not via UI. 
     - The dashboard page is the default page when the user opens the app and there's a valid API key (the current dashboard page). It will have the list of projects and the workflow page will have the list of workflows.
2. [x] Minor changes to the pages
    - In the settings page, the API Token input text should be not editable when there's a valid API key. It should only be editable when there's no valid API key. When the user clicks the "Clear API Key" button, it should clear the API key and make the input text editable again. When the user clicks the "Clear All Data" button, it should clear all data and make the input text editable again.
    - In the projects page, the badge that counts the number of deleted projects should not be displayed if there are no deleted projects. When the user clicks the "Restore deleted projects" button, it should restore all deleted projects and hide the badge.
    - Improve workflow page top menu:
      - Make all the icons (search, grid, list and expand/collapse) have the same size and aligned to the right side of the page. The search input should be aligned with the icons and have a placeholder "Search by name...".
      - When the screen is wider than the xl breakpoint, the search input should be visible and the icons should be on the right side of the search input. When the screen is smaller than the xl breakpoint, the last three buttons (grid/list/expand/collapse) should be below the filter area but still in the far right..
    - Make the github icon in the navbar larger and add a hover effect (e.g., change color) to indicate it's clickable.
3. [ ] If there's a valid api key, the settings page should display the current username somewhere. This can be done by making a request to the API to get the user information and displaying the username in the settings page. This will provide feedback to the user that they are logged in and which account they are using. This was being done previously before the recent major navbar change
4. [ ] Create a confirmation modal to be reused by several components. It should receive a string as a message and two callbacks, one for confirming and another for canceling (the latter defaulting to an empty function). This modal should be used for confirming the clearing of all data, api key, and also when the JobActionButton is clicked (run, approve or others).
5. [ ] Accordion chevrons should rotate 45 degrees on hovering and 90 degrees when the accordion is open. The rotation should be animated.