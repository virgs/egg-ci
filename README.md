![EggCi](./public/logo.png)

A dashboard monitor for CircleCI pipelines.

[//]: # (homepage placeholder)

## The Problem

You're using [CircleCI](https://circleci.com). You have pipelines. You have workflows. You have jobs inside those workflows. And you want to answer a few completely reasonable questions:

> 1. *"When was the last successful execution of each environment deploy job deploy-production*
> 2. *"Which job is currently failing in the deploy-staging workflow?"*
> 3. *"How do I promote the last job that reached pre-production approval to production?"*
> 4. *"What's the last time any workflow run?"*
> 5. *"Which jobs are currently failing across all my projects?"*

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

## FAQ

**My new pipeline isn't showing up. What gives?**
Two things compound here: the sync interval fires every 20s × number of enabled projects (so 3 projects = up to 60s), and it doesn't fire immediately on page load. On top of that, freshly-queued jobs have no **started_at** yet and are filtered out until they actually start running. Give it a minute, or hit the sync button on the Projects page to force an immediate refresh.

**I reran a job but nothing changed on the dashboard.**
EggCi detects reruns by comparing workflow IDs on each sync. If the rerun happened right after a sync, you'll see it on the next one. Again, the Projects page sync button is your friend for immediate results.

**Is my API token safe?**
Yes. It never leaves your browser — there's no backend, no server, no telemetry. It's stored in **localStorage** and only ever sent directly to CircleCI's API from your machine.

**Can I track projects from different organisations?**
Yes. The Projects page lets you add any CircleCI project your token has access to, regardless of which org owns it.

**Why can't I approve/rerun/cancel some jobs?**
Approval gates only work on **on_hold** jobs. Rerun is only available for jobs that have actually finished (**success**, **failed**, **canceled**, **timed out**, etc.). Running jobs show a cancel button instead. Jobs that are **queued**, **blocked**, or **skipped** don't have an action — there's nothing meaningful to do with them from here.

**The dashboard feels slow with many projects.**
To avoid throttling and overloading CircleCI servers, each enabled project adds ~20s to the sync cycle. Try reducing the number of enabled projects, or lower the pipeline scan depth in Settings to fetch fewer historical runs per sync.

---

## License

Do whatever you want with it. If CircleCI somehow improves their dashboard to make this obsolete, that's a win too.
