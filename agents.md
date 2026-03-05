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

1. [x] Persist workflows filters in the local storage as well rather than only changing the url. But make the url reflect the filters as well. This way users can share the url with the filters applied. Also, I want to create a new section in the settings page. Between the signed area and the data clearing buttons. I want to create a "Profile" section where users can create, delete and choose avatars. There can be only one chosen avatar at a time. The avatar will be used to create multiple "personas" for the user. Each persona will have a name. The user can switch between personas and each persona will have its own set of filters, selected project/jobs. This way users can easily switch between different contexts and workflows without having to manually change the filters every time. By default, there will be a "Default" persona that is created when the user first uses the product. The user can then create additional personas as needed. There has to exist at least one persona at all times, so the user cannot delete the last remaining persona. When a persona is deleted, all the filters and selected project/jobs associated with that persona will also be deleted. The avatar name will be displayed in the top right corner of the app, to the left of the github icon. When the user clicks on the avatar, they can see a dropdown menu with the list of personas and an option to manage personas. The manage personas option will take them to the settings page where they can create, delete and choose avatars for their personas.
2. [ ] to the right side of the github icon, add a buy me a coffee icon. When users click on it, it should open a new tab with the buy me a coffee page. The url is https://buymeacoffee.com/virgs. This will help us to get some support from the community and keep improving the product.
2. [ ] Microsoft teams integration.
