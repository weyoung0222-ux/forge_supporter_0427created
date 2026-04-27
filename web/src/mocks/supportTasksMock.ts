/**
 * Support — Tasks: each task belongs to a task group (e.g. Manipulation, Locomotion).
 */

export type SupportTaskGroupKind = 'Manipulation' | 'Locomotion' | 'Sensing' | 'Compute';

export type SupportTaskStatus = 'draft' | 'active' | 'done';

export interface SupportTaskGroupRef {
  id: string;
  /** Display name of the task group (parent bucket). */
  name: string;
  kind: SupportTaskGroupKind;
}

export interface SupportTaskDto {
  id: string;
  title: string;
  subtitle: string;
  projectName: string;
  updatedAt: string;
  status: SupportTaskStatus;
  taskGroup: SupportTaskGroupRef;
}

const TASKS_SEED: SupportTaskDto[] = [
  {
    id: 'tsk-pick-calib',
    title: 'Pick cycle calibration — Cell B',
    subtitle: 'Tune grasp offsets after gripper swap; verify Schunk EGP repeatability.',
    projectName: 'Warehouse Bot',
    updatedAt: '2026-04-14',
    status: 'active',
    taskGroup: {
      id: 'tg-wh-arm',
      name: 'Arm & grip — Warehouse',
      kind: 'Manipulation',
    },
  },
  {
    id: 'tsk-place-verify',
    title: 'Place pose verification',
    subtitle: 'QC checklist for pallet drop-off; compare to teach poses.',
    projectName: 'Warehouse Bot',
    updatedAt: '2026-04-13',
    status: 'draft',
    taskGroup: {
      id: 'tg-wh-arm',
      name: 'Arm & grip — Warehouse',
      kind: 'Manipulation',
    },
  },
  {
    id: 'tsk-amr-route',
    title: 'AMR route smoke test — Lane 3',
    subtitle: 'Nav graph segment validation; stop at virtual markers.',
    projectName: 'Logistics Bot',
    updatedAt: '2026-04-14',
    status: 'active',
    taskGroup: {
      id: 'tg-log-amr',
      name: 'AMR navigation — Logistics',
      kind: 'Locomotion',
    },
  },
  {
    id: 'tsk-dock-align',
    title: 'Dock alignment regression',
    subtitle: 'Encoder + wheel slip checks after firmware bump.',
    projectName: 'Logistics Bot',
    updatedAt: '2026-04-12',
    status: 'done',
    taskGroup: {
      id: 'tg-log-amr',
      name: 'AMR navigation — Logistics',
      kind: 'Locomotion',
    },
  },
  {
    id: 'tsk-lidar-sync',
    title: 'LiDAR–camera extrinsic sync',
    subtitle: 'Target board capture; export calibration for perception stack.',
    projectName: 'Autonomous Driving',
    updatedAt: '2026-04-13',
    status: 'active',
    taskGroup: {
      id: 'tg-ad-perc',
      name: 'Perception — Autonomous Driving',
      kind: 'Sensing',
    },
  },
  {
    id: 'tsk-night-aug',
    title: 'Night drive augmentation review',
    subtitle: 'Sample low-light frames; flag blur for re-collection.',
    projectName: 'Autonomous Driving',
    updatedAt: '2026-04-11',
    status: 'draft',
    taskGroup: {
      id: 'tg-ad-perc',
      name: 'Perception — Autonomous Driving',
      kind: 'Sensing',
    },
  },
  {
    id: 'tsk-sim-bridge',
    title: 'Sim2Real bridge rollout',
    subtitle: 'Policy checkpoint on Jetson; compare latency vs sim.',
    projectName: 'Forge Core',
    updatedAt: '2026-04-10',
    status: 'active',
    taskGroup: {
      id: 'tg-core-sim',
      name: 'Sim bridge — Forge Core',
      kind: 'Compute',
    },
  },
  {
    id: 'tsk-jetson-bench',
    title: 'Edge inference benchmark',
    subtitle: 'Batch size sweep for tactile encoder on ORIN NX.',
    projectName: 'Forge Core',
    updatedAt: '2026-04-09',
    status: 'done',
    taskGroup: {
      id: 'tg-core-sim',
      name: 'Sim bridge — Forge Core',
      kind: 'Compute',
    },
  },
];

function cloneTask(t: SupportTaskDto): SupportTaskDto {
  return { ...t, taskGroup: { ...t.taskGroup } };
}

let tasksStore: SupportTaskDto[] = TASKS_SEED.map(cloneTask);

export function getSupportTasksMock(): SupportTaskDto[] {
  return tasksStore.map(cloneTask);
}

export function prependSupportTask(row: SupportTaskDto): void {
  tasksStore = [cloneTask(row), ...tasksStore];
}
