/**
 * Dev portal — Home (pre-project) mock.
 * Replace with `fetch('/api/dev/home/overview')` when APIs exist.
 */

export interface DevHomeProjectStatusCountDto {
  active: number;
  completed: number;
}

export interface DevHomeRecentProjectDto {
  id: string;
  name: string;
  /** Member role in project (e.g. project lead, model developer) */
  role: string;
  lastVisitedAt: string;
}

export type DevHomeActivityType = 'dataset' | 'model' | 'job' | 'simulation' | 'deployment' | 'annotation';

export interface DevHomeActivityItemDto {
  id: string;
  title: string;
  detail: string;
  projectName: string;
  occurredAt: string;
  type: DevHomeActivityType;
}

export interface DevHomeResourceTotalsDto {
  datasets: number;
  models: number;
  runningJobs: number;
}

export interface DevHomeAnnouncementDto {
  id: string;
  title: string;
  body: string;
  publishedAt: string;
  pinned?: boolean;
}

export interface DevPortalHomeDto {
  projectStatus: DevHomeProjectStatusCountDto;
  recentProjects: DevHomeRecentProjectDto[];
  activity: DevHomeActivityItemDto[];
  resourceTotals: DevHomeResourceTotalsDto;
  announcements: DevHomeAnnouncementDto[];
}

const ISO = (offsetHours: number) =>
  new Date(Date.now() - offsetHours * 60 * 60 * 1000).toISOString();

export const DEV_PORTAL_HOME_MOCK: DevPortalHomeDto = {
  projectStatus: {
    active: 6,
    completed: 2,
  },
  recentProjects: [
    {
      id: 'prj-urban-nav-01',
      name: 'Urban Navigation Pilot',
      role: 'Project lead',
      lastVisitedAt: ISO(1),
    },
    {
      id: 'prj-wh-pick',
      name: 'Warehouse Pick v2',
      role: 'Model developer',
      lastVisitedAt: ISO(5),
    },
    {
      id: 'prj-night-drive',
      name: 'Night Drive Corpus',
      role: 'Data engineer',
      lastVisitedAt: ISO(30),
    },
    {
      id: 'prj-sim-lab',
      name: 'Sim Lab Rollouts',
      role: 'Model developer',
      lastVisitedAt: ISO(72),
    },
  ],
  activity: [
    {
      id: 'act-1',
      title: 'Queued eval regression for nav_policy_v3_rl',
      detail: 'GPU pool eu-west — priority normal',
      projectName: 'Urban Navigation Pilot',
      occurredAt: ISO(0.25),
      type: 'job',
    },
    {
      id: 'act-2',
      title: 'Registered dataset batch urban_intersection_2026_04',
      detail: '1.2M frames, lidar aligned',
      projectName: 'Urban Navigation Pilot',
      occurredAt: ISO(1),
      type: 'dataset',
    },
    {
      id: 'act-3',
      title: 'Promoted checkpoint to staging registry',
      detail: 'nav_bc_resnet_042b',
      projectName: 'Warehouse Pick v2',
      occurredAt: ISO(3),
      type: 'model',
    },
    {
      id: 'act-4',
      title: 'Simulation batch 418 completed',
      detail: 'Success rate 84.2% vs prior week +2.1pp',
      projectName: 'Sim Lab Rollouts',
      occurredAt: ISO(8),
      type: 'simulation',
    },
    {
      id: 'act-5',
      title: 'Deployed policy bundle to fleet ring B',
      detail: 'AMR-200 shadow mode',
      projectName: 'Urban Navigation Pilot',
      occurredAt: ISO(20),
      type: 'deployment',
    },
    {
      id: 'act-6',
      title: 'Auto-labeling job finished (ViT)',
      detail: '42k segments reviewed',
      projectName: 'Night Drive Corpus',
      occurredAt: ISO(48),
      type: 'annotation',
    },
  ],
  resourceTotals: {
    datasets: 186,
    models: 47,
    runningJobs: 9,
  },
  announcements: [
    {
      id: 'ann-1',
      title: 'Scheduled maintenance: GPU pool US — Apr 18 02:00–06:00 UTC',
      body: 'Running jobs will be checkpointed and requeued automatically.',
      publishedAt: ISO(12),
      pinned: true,
    },
    {
      id: 'ann-2',
      title: 'Forge SDK 2.4 — sim replay API changes',
      body: 'See migration notes under Developer resources. Breaking: replay buffer schema v3.',
      publishedAt: ISO(96),
    },
    {
      id: 'ann-3',
      title: 'New: project-level storage quotas in Dev portal',
      body: 'Leads can view usage from Project settings after selecting a project.',
      publishedAt: ISO(168),
    },
  ],
};

export function getDevPortalHomeMock(): DevPortalHomeDto {
  return DEV_PORTAL_HOME_MOCK;
}
