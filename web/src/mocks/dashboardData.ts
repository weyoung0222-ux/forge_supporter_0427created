/**
 * Dev portal — Project dashboard mock.
 * Replace `getProjectDashboardMock` with `fetch('/api/projects/:id/dashboard')` when wiring APIs.
 */

export type ProjectLifecycleStatus = 'active' | 'on_hold' | 'archived';

export type TrainingJobStatus = 'running' | 'queued' | 'succeeded' | 'failed' | 'cancelled';

export interface DashboardProjectSummaryDto {
  projectId: string;
  projectName: string;
  status: ProjectLifecycleStatus;
  /** 0–100: overall milestone progress for current release train */
  overallProgressPct: number;
  datasetCount: number;
  modelRegistryCount: number;
  activeTrainingJobs: number;
  storageUsedTb: number;
  storageQuotaTb: number;
  lastDeploymentAt: string;
  targetRobotFleet: string;
}

export interface TrainingEpochMetricDto {
  epoch: number;
  meanEpisodeReward: number;
  evalSuccessRatePct: number;
}

export interface GpuHoursByCategoryDto {
  category: string;
  gpuHours: number;
}

export interface TrainingJobRowDto {
  jobId: string;
  name: string;
  status: TrainingJobStatus;
  progressPct: number;
  framework: string;
  updatedAt: string;
}

export interface SimulationRolloutStatDto {
  day: string;
  successEpisodes: number;
  failureEpisodes: number;
}

/** Response shape expected from GET /api/projects/:projectId/dashboard */
export interface ProjectDashboardDto {
  summary: DashboardProjectSummaryDto;
  trainingCurve: TrainingEpochMetricDto[];
  gpuHoursByCategory: GpuHoursByCategoryDto[];
  recentJobs: TrainingJobRowDto[];
  rolloutStats: SimulationRolloutStatDto[];
}

const SUMMARY: DashboardProjectSummaryDto = {
  projectId: 'prj-urban-nav-01',
  projectName: 'Urban Navigation Pilot',
  status: 'active',
  overallProgressPct: 72,
  datasetCount: 38,
  modelRegistryCount: 11,
  activeTrainingJobs: 3,
  storageUsedTb: 14.6,
  storageQuotaTb: 40,
  lastDeploymentAt: '2026-04-14T09:22:00Z',
  targetRobotFleet: 'AMR-200 series (warehouse + last-mile)',
};

const TRAINING_CURVE: TrainingEpochMetricDto[] = Array.from({ length: 36 }, (_, i) => {
  const epoch = i + 1;
  const noise = Math.sin(epoch / 4) * 0.08;
  return {
    epoch,
    meanEpisodeReward: Math.min(0.94, 0.35 + epoch * 0.016 + noise * (epoch > 20 ? 0.5 : 1)),
    evalSuccessRatePct: Math.min(96, 42 + epoch * 1.35 + noise * 8),
  };
});

const GPU_HOURS: GpuHoursByCategoryDto[] = [
  { category: 'BC finetune (teleop)', gpuHours: 420 },
  { category: 'RL policy (PPO)', gpuHours: 1180 },
  { category: 'Sim2Real domain rand', gpuHours: 640 },
  { category: 'Eval & regression', gpuHours: 210 },
  { category: 'Auto-labeling (ViT)', gpuHours: 380 },
];

const RECENT_JOBS: TrainingJobRowDto[] = [
  {
    jobId: 'job-8f2a',
    name: 'nav_policy_v3_rl',
    status: 'running',
    progressPct: 61,
    framework: 'PyTorch 2.3 + Forge SDK',
    updatedAt: '2026-04-15T02:18:00Z',
  },
  {
    jobId: 'job-8f29',
    name: 'safety_critic_bc',
    status: 'running',
    progressPct: 88,
    framework: 'JAX',
    updatedAt: '2026-04-15T01:55:00Z',
  },
  {
    jobId: 'job-8f28',
    name: 'eval_regression_suite',
    status: 'queued',
    progressPct: 0,
    framework: 'Forge Eval Runner',
    updatedAt: '2026-04-15T00:40:00Z',
  },
  {
    jobId: 'job-8f21',
    name: 'sim_rollout_batch_412',
    status: 'succeeded',
    progressPct: 100,
    framework: 'Isaac Lab',
    updatedAt: '2026-04-14T22:10:00Z',
  },
  {
    jobId: 'job-8f1c',
    name: 'perception_finetune_rgbd',
    status: 'failed',
    progressPct: 34,
    framework: 'PyTorch 2.3',
    updatedAt: '2026-04-14T18:03:00Z',
  },
];

const ROLLOUT_STATS: SimulationRolloutStatDto[] = [
  { day: 'Apr 09', successEpisodes: 1820, failureEpisodes: 340 },
  { day: 'Apr 10', successEpisodes: 2104, failureEpisodes: 298 },
  { day: 'Apr 11', successEpisodes: 1988, failureEpisodes: 312 },
  { day: 'Apr 12', successEpisodes: 2240, failureEpisodes: 265 },
  { day: 'Apr 13', successEpisodes: 2312, failureEpisodes: 241 },
  { day: 'Apr 14', successEpisodes: 2460, failureEpisodes: 228 },
  { day: 'Apr 15', successEpisodes: 1188, failureEpisodes: 102 },
];

export const PROJECT_DASHBOARD_MOCK: ProjectDashboardDto = {
  summary: SUMMARY,
  trainingCurve: TRAINING_CURVE,
  gpuHoursByCategory: GPU_HOURS,
  recentJobs: RECENT_JOBS,
  rolloutStats: ROLLOUT_STATS,
};

/** Stand in for API client — swap implementation without changing UI types. */
export function getProjectDashboardMock(_projectId?: string): ProjectDashboardDto {
  return PROJECT_DASHBOARD_MOCK;
}
