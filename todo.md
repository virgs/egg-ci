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
10. [ ] Create README file with screenshots and instructions on how to use the extension
11. [x] Create unit tests
12. [ ] Update dependencies and libraries to latest versions
13. [ ] Check new circle CI API to see if some of the features can be implemented in a better way (https://circleci.com/docs/api/v2/ and https://circleci.com/docs/api/v1/)
14. [ ] Improve data persistence and caching to reduce API calls and improve performance
    - [ ] Consider using indexedDB
    - [ ] Consider changing data structure to better fit the needs of the extension and reduce the amount of data stored
15. [ ] Be able to hide selected relevant jobs
16. ~[ ] Be able to merge workflow data (autosync pipelines)~
17. ~[ ] Card placeholders~
18. [ ] Job more options:
    1.  [ ] Compare against previous execution (https://docs.github.com/en/pull-requests/committing-changes-to-your-project/viewing-and-comparing-commits/comparing-commits)
    2.  [ ] Browse repo at this point: https://github.com/virgs/jsonPlaceholderReplacer/tree/<commit-hash>
19. [x] Change [project configurations](./src/config.ts) via UI
