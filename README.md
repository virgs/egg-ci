# 🥚 EggCi

> A dashboard monitor for CircleCI workflows.

![EggCi](./public/logo.png)
---

[//]: # (homepage placeholder)

## The Problem

You're using [CircleCI](https://circleci.com). You have pipelines. You have workflows. You have jobs inside those workflows. And you want to answer a few completely reasonable questions:

> 1. *"When was the last successful execution of each environment deploy job deploy-production*
> 2. *"Which job is currently failing in the deploy-staging workflow?"*
> 3. *"How do I promote the last job that reached pre-production approval to production?"*
> 4. *"What's the last time any workflow run?*
> 5. *Which jobs are currently failing across all my projects?"*

So you open CircleCI, navigate to your project, pick a branch, scroll through a list of pipeline runs sorted by time, click into one, hope that's the right workflow, find the job, note the status, and realise you need to do this again for the previous run. And the one before that.

Congratulations. You've just spent 40 minutes doing what should take 4 seconds.

CircleCI's UI is an amazing tool for triggering pipelines and getting email notifications. But I feel the tool failed a bit at *watching* your CI.

---

## The Solution

**EggCi** gives you a single-page dashboard showing all your tracked CircleCI projects, their workflows, each job within them, and a color-coded execution history — at a glance, all at once, without clicking through multiple levels of navigation.

Inspired by [GoCD](https://www.gocd.org/)'s pipeline dashboard and nevergreen, EggCi reunites the "what's going on with my CI?" use case with the "what a pipeline dashboard should look like" design, which has been sadly missing from CircleCI for years.

EggCi brings that same at-a-glance visibility to CircleCI: one card per job, colored history dots for the last runs, and no archaeological expedition required to find out when something broke.

---

## Features

- **Multi-project dashboard** — track as many CircleCI projects as you like in one view
- **Per-job execution history** — see the last N runs of each job, color-coded by status
- **Auto-sync** — the dashboard refreshes automatically, so you can leave it open on a second monitor and feel productive
- **Job actions** — approve hold jobs, rerun, or cancel directly from the dashboard
- **Configurable** — adjust the projects, number of pipelines to scan, and whether to show build jobs alongside approval gates
- **No backend** — runs entirely in the browser; your CircleCI API token stays local

---

## Setup

1. Open **[EggCi](https://virgs.github.io/egg-ci)**
2. Go to **Settings**
3. Paste your [CircleCI personal API token](https://app.circleci.com/settings/user/tokens)
4. Go to **Projects** and add the projects you want to track
5. Enable them and wait for the first sync
6. Go to **Workflows** and have fun watching your CI in real time!

That's it. No install, no account, no "sign in with GitHub" OAuth dance.

---

## Tech Stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) — build tool
- [Bootstrap 5](https://getbootstrap.com/) / [Bootswatch](https://bootswatch.com/) — styling
- [CircleCI API v2](https://circleci.com/docs/api/v2/) (and a pinch of [v1.1](https://circleci.com/docs/api/v1/) for the bits they haven't migrated yet)
- Deployed on [GitHub Pages](https://pages.github.com/)

---

## Why "egg"?

It's a circle plus "something" (get it? Circle + something = egg? No? Just me?).
And it's a bit of a joke about how long it took to build this thing, which was supposed to be a weekend project but turned into a months-long labor of love. Plus, you know, eggs are delicious.

---

### FAQ

Q: How often do the projects get synced? I recently pushed a new commit, I see the pipeline is running in CircleCI but I don't see its status reflected in the workflow page
A: Sync frequency: autoSyncInterval × number of enabled projects — the default is 20 seconds × N. So with 3 projects you wait up to 60 seconds between syncs. Crucially, setInterval doesn't fire immediately on page load — the first tick only happens after the full delay has elapsed. Why the running pipeline isn't visible yet — there are two compounding reasons:

    1. The sync interval hasn't fired yet since you loaded the page
    2. Even when it does fire, WorkflowFetcher filters out jobs that have no started_at:

    // src/project/WorkflowFetcher.ts:173
    .filter((job) => job.started_at)
    
    A freshly-triggered pipeline has its downstream jobs in queued/blocked state with no started_at yet — they're invisible until they actually begin executing. So right after a
    push you'd only see the first job (install) once it starts running, and the rest gradually appear as they pick up.
    
    In short: wait up to 20s × N for the next sync, and jobs will appear as they transition from queued to running. If you want an immediate refresh you can trigger a manual sync
    via the Projects page sync button.

---

## License

Do whatever you want with it. If CircleCI somehow improves their dashboard to make this obsolete, that's a win too.
