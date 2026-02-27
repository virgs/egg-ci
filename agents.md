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
2. Dashboard e settings são navbar
3. Tirar o menu do navbar
4. Limpar dados deveria estar em uma área de risco dentro da página de settings. Perto do token
5. Limpar dados, rodar job e aprovar job devem abrir um pequeno modal solicitando confirmação. O modal deve receber uma string de mensagem.
6. Remover as configurações da página de settings. Não vai ser mais possível alterar por ali. Só via código mesmo
7. Enquanto não existir uma api key válida. Não exibir lista de projetos nem no Dashboard e nem no settings. Depois de validar uma, o input text deve ficar desabilitado e só ser possível habilitar novamente se o usuário clicar em limpar chave. Um novo botão na área de risco. Essa área de risco vai ficar no fim da área de settings
8. Fazer com que o chevron do accordion do dah lard tenha uma animação suave
9. Ajeitar o posicionamento dos botões e do filtro de pesquisa no Dashboard 