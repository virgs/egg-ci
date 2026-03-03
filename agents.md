# Engineering Guidelines for AI Agent

## 1. Think Before Coding

* Always reason step by step before writing code.
* Understand the problem, constraints, edge cases, and future impact.
* Design with long-term maintainability in mind.
* Plan how the feature integrates with the existing architecture.
* Prefer extensible patterns to quick fixes.

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
* Explicit return types always
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

1. Create/Update `memento.md` with decisions/context
2. Update `README.md` if behavior changed
3. Update/add tests once any code is written
4. Review code quality
5. Refactor if needed
6. Ensure size constraints are respected

---

## 11. Long-Term Vision

* Ensure new features align with overall architecture.
* Avoid shortcuts that create technical debt.
* Think about scalability and future extensibility.
* Prefer composability over monolithic solutions.

---

# Summary Philosophy

Think long-term.
Keep everything small and the tests in sync.
Write predictable, testable, modular code.
Prioritize clarity over cleverness.
Update documentation continuously.
Build incrementally and safely.


# TODO list

1. [x] Let's get rid of the global `autoSyncInterval` variable. This will be configured per project and stored in the project configuration. We can add a field `syncFrequency` to the project configuration that specifies how often the project should be synced (e.g., every 5 minutes, every hour, etc.). The agent will then read this configuration and set up the synchronization accordingly. In the projects page to the right side of the project name in a small mute text add the remaining time until the next sync. This will give users visibility into when the next sync will occur and allow them to adjust the frequency if needed. Projects shouldn't be synced at the same time, so there has to exist a virtual queue of projects waiting to be synced. When a project is synced, it gets added back to the queue and the queue is sorted based on the next sync time. This way, we can ensure that projects are synced at their configured intervals without overwhelming the system with simultaneous syncs. Additionally, we can implement a mechanism to handle cases where a project takes longer to sync than expected, such as by allowing for a grace period or by rescheduling the next sync based on the actual completion time of the current sync. By default, the value of `syncFrequency` should be set to 30 seconds to ensure that projects are synced regularly without causing excessive load on the system. Eventually, there will be a UI for users to adjust the `syncFrequency` value for each project according to their needs and preferences. This will provide flexibility and allow users to optimize the synchronization process based on the specific requirements of their projects.
2. [ ] In the projects page, in the menu each project has, between SELECT APPROVAL JOBS and EXCLUDE PROJECT, add a new divider and a new option "Set sync frequency". When the user clicks on this option, a small modal should open with a form that allows the user to set the sync frequency for that project. The form should have a dropdown with the options (30 seconds, 1 minute, 2 minutes, 5 minutes, 10 minutes). Once the user submits the form, the new sync frequency should be saved to the project configuration and the synchronization mechanism should be updated accordingly to reflect the new frequency. This will allow users to customize how often their projects are synced based on their specific needs and preferences.