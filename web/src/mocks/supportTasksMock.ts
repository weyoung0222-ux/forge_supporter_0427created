/**
 * Support — Tasks: each task row is a **task subtype** under a **task type** (e.g. Manipulation → Pick).
 */

export type SupportTaskGroupKind = 'Manipulation' | 'Locomotion' | 'Sensing' | 'Compute';

export type SupportTaskStatus = 'draft' | 'active' | 'done';

export interface SupportTaskTypeRef {
  id: string;
  /** Task type code (e.g. manipulation, perception). */
  code: string;
  /** Display name of the task type. */
  name: string;
  description?: string;
  /** Whether this task type is enabled for use. */
  enabled: boolean;
  /** Facet / coloring domain (catalog grouping). */
  kind: SupportTaskGroupKind;
}

export interface SupportTaskDto {
  id: string;
  /** Task subtype code (e.g. pick_and_place). */
  subtypeCode: string;
  /** Subtype display title (card heading). */
  title: string;
  subtitle: string;
  /** Longer operator-facing description (Definition). */
  taskDescription: string;
  /** Optional example scenario text. */
  example?: string;
  /** Composition this task is validated against (Definition). */
  requiredCompositionId: string;
  requiredCompositionName: string;
  /** e.g. vision, force, navigation */
  requiredModality: string;
  projectName: string;
  updatedAt: string;
  status: SupportTaskStatus;
  taskType: SupportTaskTypeRef;
}

const TASKS_SEED: SupportTaskDto[] = [
  {
    id: 'tsk-pick',
    subtypeCode: 'pick',
    title: 'Pick',
    subtitle: 'Pick an item from source bin.',
    taskDescription: 'Defines grasp-point selection and pickup flow.',
    example: 'Pick SKU from bin A to tote B.',
    requiredCompositionId: 'cp-generic-manipulation',
    requiredCompositionName: 'General task definition',
    requiredModality: 'general',
    projectName: 'Task Catalog',
    updatedAt: '2026-04-14',
    status: 'active',
    taskType: {
      id: 'tg-manipulation',
      code: 'manipulation',
      name: 'Manipulation',
      description: 'End-effector motion and grasp tasks.',
      enabled: true,
      kind: 'Manipulation',
    },
  },
  {
    id: 'tsk-place',
    subtypeCode: 'place',
    title: 'Place',
    subtitle: 'Place the picked item to target location.',
    taskDescription: 'Defines placement target, release timing, and completion criteria.',
    example: 'Place tote contents onto conveyor slot 3.',
    requiredCompositionId: 'cp-generic-manipulation',
    requiredCompositionName: 'General task definition',
    requiredModality: 'general',
    projectName: 'Task Catalog',
    updatedAt: '2026-04-13',
    status: 'draft',
    taskType: {
      id: 'tg-manipulation',
      code: 'manipulation',
      name: 'Manipulation',
      description: 'End-effector motion and grasp tasks.',
      enabled: true,
      kind: 'Manipulation',
    },
  },
  {
    id: 'tsk-palletize',
    subtypeCode: 'palletize',
    title: 'Palletize',
    subtitle: 'Stack items in pallet pattern.',
    taskDescription: 'Defines stacking order and placement repeat loop.',
    example: 'Build mixed-SKU pallet to height limit.',
    requiredCompositionId: 'cp-generic-manipulation',
    requiredCompositionName: 'General task definition',
    requiredModality: 'general',
    projectName: 'Task Catalog',
    updatedAt: '2026-04-14',
    status: 'active',
    taskType: {
      id: 'tg-manipulation',
      code: 'manipulation',
      name: 'Manipulation',
      description: 'End-effector motion and grasp tasks.',
      enabled: true,
      kind: 'Manipulation',
    },
  },
  {
    id: 'tsk-screw-driving',
    subtypeCode: 'screw_driving',
    title: 'Screw Driving',
    subtitle: 'Execute fastening sequence for assembly.',
    taskDescription: 'Defines approach, fastening, and torque-check steps.',
    example: 'Drive M4 screws on bracket with torque cap.',
    requiredCompositionId: 'cp-generic-manipulation',
    requiredCompositionName: 'General task definition',
    requiredModality: 'general',
    projectName: 'Task Catalog',
    updatedAt: '2026-04-12',
    status: 'done',
    taskType: {
      id: 'tg-manipulation',
      code: 'manipulation',
      name: 'Manipulation',
      description: 'End-effector motion and grasp tasks.',
      enabled: true,
      kind: 'Manipulation',
    },
  },
  {
    id: 'tsk-nav-follow-path',
    subtypeCode: 'follow_path',
    title: 'Follow Path',
    subtitle: 'Move along predefined waypoints.',
    taskDescription: 'Defines path execution and waypoint completion rules.',
    example: 'Follow spline through aisle 4 avoiding static obstacles.',
    requiredCompositionId: 'cp-generic-locomotion',
    requiredCompositionName: 'General task definition',
    requiredModality: 'general',
    projectName: 'Task Catalog',
    updatedAt: '2026-04-13',
    status: 'active',
    taskType: {
      id: 'tg-locomotion-basic',
      code: 'locomotion_basic',
      name: 'Locomotion basics',
      description: 'Base mobility and path tasks.',
      enabled: true,
      kind: 'Locomotion',
    },
  },
  {
    id: 'tsk-nav-dock',
    subtypeCode: 'dock',
    title: 'Dock',
    subtitle: 'Navigate and align to docking point.',
    taskDescription: 'Defines final approach and docking completion criteria.',
    example: 'Dock to charger bay 2 with 2 cm lateral tolerance.',
    requiredCompositionId: 'cp-generic-locomotion',
    requiredCompositionName: 'General task definition',
    requiredModality: 'general',
    projectName: 'Task Catalog',
    updatedAt: '2026-04-11',
    status: 'draft',
    taskType: {
      id: 'tg-locomotion-basic',
      code: 'locomotion_basic',
      name: 'Locomotion basics',
      description: 'Base mobility and path tasks.',
      enabled: true,
      kind: 'Locomotion',
    },
  },
  {
    id: 'tsk-detect-object',
    subtypeCode: 'object_detection',
    title: 'Detect Object',
    subtitle: 'Detect and label target objects.',
    taskDescription: 'Defines target classes and detection output schema.',
    example: 'Detect totes vs pallets in loading zone camera FOV.',
    requiredCompositionId: 'cp-generic-sensing',
    requiredCompositionName: 'General task definition',
    requiredModality: 'general',
    projectName: 'Task Catalog',
    updatedAt: '2026-04-10',
    status: 'active',
    taskType: {
      id: 'tg-sensing-vision',
      code: 'perception',
      name: 'Sensing vision',
      description: 'Vision and perception stacks.',
      enabled: true,
      kind: 'Sensing',
    },
  },
  {
    id: 'tsk-track-object',
    subtypeCode: 'object_tracking',
    title: 'Track Object',
    subtitle: 'Track object trajectory over time.',
    taskDescription: 'Defines tracking initialization and update rules.',
    example: 'Track pallet ID through merge point on roller conveyor.',
    requiredCompositionId: 'cp-generic-sensing',
    requiredCompositionName: 'General task definition',
    requiredModality: 'general',
    projectName: 'Task Catalog',
    updatedAt: '2026-04-09',
    status: 'done',
    taskType: {
      id: 'tg-sensing-vision',
      code: 'perception',
      name: 'Sensing vision',
      description: 'Vision and perception stacks.',
      enabled: true,
      kind: 'Sensing',
    },
  },
];

function cloneTask(t: SupportTaskDto): SupportTaskDto {
  return { ...t, taskType: { ...t.taskType } };
}

let tasksStore: SupportTaskDto[] = TASKS_SEED.map(cloneTask);

export function getSupportTasksMock(): SupportTaskDto[] {
  return tasksStore.map(cloneTask);
}

export function prependSupportTask(row: SupportTaskDto): void {
  orphanTaskTypesStore = orphanTaskTypesStore.filter((t) => t.id !== row.taskType.id);
  tasksStore = [cloneTask(row), ...tasksStore];
}

export function patchSupportTask(id: string, patch: Partial<Pick<SupportTaskDto, 'title' | 'subtitle' | 'taskDescription' | 'example' | 'status' | 'updatedAt'>>): void {
  const i = tasksStore.findIndex((r) => r.id === id);
  if (i < 0) return;
  const today = new Date().toISOString().slice(0, 10);
  tasksStore[i] = {
    ...tasksStore[i],
    ...patch,
    updatedAt: patch.updatedAt ?? today,
  };
}

/** Task types defined without any task row yet (demo catalog). */
let orphanTaskTypesStore: SupportTaskTypeRef[] = [];

function taskTypeKey(ref: SupportTaskTypeRef): string {
  return ref.id;
}

/** Unique task types from rows plus orphan definitions, for dropdowns. */
export function getSupportTaskTypesCatalog(): SupportTaskTypeRef[] {
  const map = new Map<string, SupportTaskTypeRef>();
  for (const row of tasksStore) {
    const k = taskTypeKey(row.taskType);
    map.set(k, { ...row.taskType });
  }
  for (const t of orphanTaskTypesStore) {
    map.set(taskTypeKey(t), { ...t });
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'en'));
}

export function getSupportTaskTypeById(id: string): SupportTaskTypeRef | undefined {
  return getSupportTaskTypesCatalog().find((t) => t.id === id);
}

/** Register a task type that has no subtypes yet, or replace the same id in the orphan list. */
export function upsertOrphanSupportTaskType(ref: SupportTaskTypeRef): void {
  const next = { ...ref };
  orphanTaskTypesStore = [next, ...orphanTaskTypesStore.filter((t) => t.id !== next.id)];
}

/** Update every row (and orphan store if present) that uses this task type id. */
export function updateSupportTaskTypeEverywhere(id: string, patch: Partial<Omit<SupportTaskTypeRef, 'id'>>): void {
  tasksStore = tasksStore.map((row) =>
    row.taskType.id === id ? { ...row, taskType: { ...row.taskType, ...patch } } : row,
  );
  const oi = orphanTaskTypesStore.findIndex((t) => t.id === id);
  if (oi >= 0) {
    orphanTaskTypesStore[oi] = { ...orphanTaskTypesStore[oi], ...patch };
  }
}
