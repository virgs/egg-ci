import { JobData } from '../../domain-models/models'

// Statuses where a completed build job can be retried via the CircleCI rerun API.
// In-progress states (running, queued, retried), approval-gate states (on_hold, blocked),
// and skipped/permission states (not_run, terminated-unknown, unauthorized) do not support rerun.
export const RERUNABLE_STATUSES = new Set<JobData['status']>([
    'success',
    'failed',
    'not_running',
    'infrastructure_fail',
    'timedout',
    'canceled',
])
