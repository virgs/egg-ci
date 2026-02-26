# 🥚 egg-ci

> A better dashboard for CircleCI. Because apparently "better" was not on CircleCI's roadmap.

**[Try it →](https://virgs.github.io/egg-ci)**

---

## The Problem

You're using [CircleCI](https://circleci.com). You have pipelines. You have workflows. You have jobs inside those workflows. And you want to answer one completely reasonable question:

> *"When did my `deploy-production` job last run, and did it succeed?"*

So you open CircleCI, navigate to your project, pick a branch, scroll through a list of pipeline runs sorted by time (not by job), click into one, hope that's the right workflow, find the job, note the status, and realise you need to do this again for the previous run. And the one before that.

Congratulations. You've just spent 4 minutes doing what should take 4 seconds.

CircleCI's UI is a great tool for triggering pipelines and getting email notifications. It is a terrible tool for *watching* your CI. It was clearly designed by people who never had to stare at it all day.

---

## The Solution

**egg-ci** gives you a single-page dashboard showing all your tracked CircleCI projects, their workflows, each job within them, and a colour-coded execution history — at a glance, all at once, without clicking through four levels of navigation.

Inspired by [GoCD](https://www.gocd.org/)'s legendary pipeline dashboard (pictured below), which has been solving this exact problem since 2010 while the rest of the industry was busy reinventing it badly.

![GoCD pipeline dashboard — the gold standard](./goal.png)
*GoCD knows what a pipeline dashboard should look like. We're just doing our best.*

egg-ci brings that same at-a-glance visibility to CircleCI: one card per job, coloured history dots for the last N runs, and no archaeological expedition required to find out when something broke.

---

## Features

- **Multi-project dashboard** — track as many CircleCI projects as you like in one view
- **Per-job execution history** — see the last N runs of each job, colour-coded by status
- **Auto-sync** — the dashboard refreshes automatically at a configurable interval, so you can leave it open on a second monitor and feel productive
- **Job actions** — approve hold jobs, rerun, or cancel directly from the dashboard
- **Configurable** — adjust sync interval, history depth, number of pipelines to scan, and whether to show build jobs alongside approval gates
- **No backend** — runs entirely in the browser; your CircleCI API token stays local

---

## Setup

1. Open **[egg-ci](https://virgs.github.io/egg-ci)**
2. Go to **Settings** (top-right)
3. Paste your [CircleCI personal API token](https://app.circleci.com/settings/user/tokens)
4. Add the projects you want to track
5. Enable them and wait for the first sync

That's it. No install, no account, no "sign in with GitHub" OAuth dance.

---

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| Pipelines to scan | 10 | How many recent pipelines to fetch per project |
| Job history depth | 10 | Max past executions shown per job |
| History columns | 5 | How many history dots fit per row |
| Auto-sync interval | 20s | How often to refresh in the background |
| Include build jobs | off | Show `build`-type jobs alongside approval gates |

---

## Tech Stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) — build tool
- [Bootstrap 5](https://getbootstrap.com/) / [Bootswatch](https://bootswatch.com/) — styling
- [CircleCI API v2](https://circleci.com/docs/api/v2/) (and a pinch of [v1.1](https://circleci.com/docs/api/v1/) for the bits they haven't migrated yet)
- Deployed on [GitHub Pages](https://pages.github.com/)

---

## Why "egg"?

It's the sound you make when you open CircleCI's native UI and try to find job history.

---

## License

Do whatever you want with it. If CircleCI somehow improves their dashboard to make this obsolete, that's a win too.
