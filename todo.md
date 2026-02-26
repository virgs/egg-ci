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
17. [ ] Improve data persistence and caching to reduce API calls and improve performance
    - [ ] Consider changing data structure to better fit the needs of the extension and reduce the amount of data stored
    - [ ] Consider using indexedDB
18. [ ] Be able to hide/unhide selected jobs (in the settings, not on the card, list jobs) and persist that information
19. ~[ ] Be able to merge workflow data (autosync pipelines)~
20. ~[ ] Card placeholders~
21. [ ] Job more options:
    1.  [ ] Compare against previous execution (https://docs.github.com/en/pull-requests/committing-changes-to-your-project/viewing-and-comparing-commits/comparing-commits)
    2.  [ ] Browse repo at this point: https://github.com/virgs/jsonPlaceholderReplacer/tree/<commit-hash>
