# Agents instructions:
1. Reason step by step. Think about the problem and how to solve it before writing the code and plan for the long term. Don't just write code without thinking about the problem and how to solve it. Always think about the problem and how to solve it before writing code. Consider even the next steps.
2. Write code that is clean, maintainable, and well-documented. Follow best practices and coding standards. Write code that is easy to understand and modify in the future. Write code that is modular and reusable. Write code that is efficient and performant. Write code that is secure and handles edge cases. Write code that is tested and has good coverage. Write code that is easy to debug and troubleshoot.
3. Always consider the user experience and how the user will interact with the extension.
4. Avoid big refactors. Instead, make small incremental changes that can be easily tested and rolled back if necessary. This will help to ensure that the extension remains stable and functional while new features are being added.
5. Always keep in mind the long-term vision for the extension and how new features will fit into that vision. Consider how new features will impact the overall user experience and how they will interact with
6. Avoid big classes and functions. Instead, break down the code into smaller, more manageable pieces that can be easily tested and maintained. This will help to improve the readability and maintainability of the codebase.
7. Always keep the tests up to date and ensure that they cover all new features and changes to the codebase. This will help to catch any bugs or issues early on and ensure that the extension remains stable and functional.
8. Since I don't have the best Calude plan, and it keeps running out of tokens: Keep track of what you're doing and what you have done in a separate file (e.g. a TODO list) to avoid losing context and to help you stay organized. This will also help you to keep track of what features have been implemented and what still needs to be done, even if the conversation is interrupted or if you need to take a break.


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
19. [ ] Be able to hide/unhide selected jobs
    - The project items should become an accordion on the settings page. When you click on a project, it expands and shows the jobs for that project.
    - Each job has a checkbox next to it. If the checkbox is checked, the job is included in the dashboard. 
    - If the checkbox is unchecked, the job is hidden from the dashboard.
    - This information should be persisted so that when the user comes back to the settings page, they can see which jobs are hidden and which are shown.
    - The "enable/disable build jobs" option should be a shortcut for hiding/showing all build jobs for that project.
    - If the user unchecks "include build jobs", all build jobs for that project are hidden. If the user checks "include build jobs", all build jobs for that project are shown.
    - It should also be possible to hide invididual jobs in the dashboard page. There should be a "hide job" option in the job card menu. If the user clicks on it, the job is hidden from the dashboard and the settings page is updated to reflect that change (the checkbox for that job is unchecked).
20. ~[ ] Be able to merge workflow data (autosync pipelines)~
21. ~[ ] Card placeholders~
22. [ ] Job more options:
    1. [ ] Compare against previous execution (https://docs.github.com/en/pull-requests/committing-changes-to-your-project/viewing-and-comparing-commits/comparing-commits)
    2. [ ] Browse repo at this point: https://github.com/virgs/jsonPlaceholderReplacer/tree/<commit-hash>
