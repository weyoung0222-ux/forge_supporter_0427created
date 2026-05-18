/** Simulation Support workspace — demo lists with in-memory mutations for optimistic UI. */

export type SimAssetType = 'robot' | 'object' | 'environment';

/** `viewer3d` uses interactive rotate / zoom / pan in the preview modal. */
export type SimAssetPreviewKind = 'image' | 'viewer3d';

export interface SimulationAssetDto {
  id: string;
  name: string;
  type: SimAssetType;
  tags: string[];
  description: string;
  updatedAt: string;
  massKg: string;
  friction: string;
  collision: string;
  previewKind: SimAssetPreviewKind;
}

export type SimulationConfigStatus = 'active' | 'draft' | 'deprecated';

export interface SimulationConfigDto {
  id: string;
  name: string;
  description: string;
  sceneId: string;
  sceneName: string;
  physicsSetting: string;
  cameraSetting: string;
  randomizationEnabled: boolean;
  assetsCount: number;
  eventsCount: number;
  updatedAt: string;
  facet: 'default' | 'stress' | 'regression';
  status: SimulationConfigStatus;
  actionType: string;
  terminationCondition: string;
  targetAssetIds: string[];
  observationTargets: string[];
  eventConditions: string[];
}

export interface SimulationPresetDto {
  id: string;
  name: string;
  description: string;
  boundConfigName: string;
  boundConfigId: string;
  boundAssetCount: number;
  assetIds: string[];
  parameters: { key: string; value: string }[];
  updatedAt: string;
  facet: 'default' | 'stress' | 'regression';
}

export type SceneOrigin = 'manual' | 'ai';

export interface SimulationSceneDto {
  id: string;
  name: string;
  assetCount: number;
  origin: SceneOrigin;
  updatedAt: string;
}

function cloneAsset(a: SimulationAssetDto): SimulationAssetDto {
  return { ...a, tags: [...a.tags] };
}

const ASSETS_SEED: SimulationAssetDto[] = [
  {
    id: 'sim-asset-panda',
    name: 'Franka Panda URDF',
    type: 'robot',
    tags: ['urdf', 'manipulator', 'warehouse'],
    description: '7-DOF arm with gripper — tuned collision meshes for Isaac-style sims.',
    updatedAt: '2026-04-12',
    massKg: '18.2',
    friction: '0.62 (composite)',
    collision: 'Mesh-accurate (SDF-ready)',
    previewKind: 'viewer3d',
  },
  {
    id: 'sim-asset-shelf',
    name: 'Industrial shelf module',
    type: 'object',
    tags: ['usd', 'static', 'storage'],
    description: 'Modular shelving unit with LOD0/LOD1 variants.',
    updatedAt: '2026-04-10',
    massKg: '120',
    friction: '0.45',
    collision: 'Convex decomposition (static)',
    previewKind: 'image',
  },
  {
    id: 'sim-asset-warehouse',
    name: 'Warehouse shell USD',
    type: 'environment',
    tags: ['usd', 'lighting', 'hdr'],
    description: 'Large interior with baked probes and semantic regions.',
    updatedAt: '2026-04-08',
    massKg: '—',
    friction: '0.50',
    collision: 'Semantic regions + simplified hull',
    previewKind: 'viewer3d',
  },
  {
    id: 'sim-asset-amr',
    name: 'AMR differential base',
    type: 'robot',
    tags: ['urdf', 'mobile', 'lidar'],
    description: 'Two-wheel + caster base with IMU and 2D lidar mounts.',
    updatedAt: '2026-04-06',
    massKg: '42',
    friction: '0.55',
    collision: 'Cylinder primitives + lidar occluders',
    previewKind: 'viewer3d',
  },
  {
    id: 'sim-asset-pallet',
    name: 'EUR pallet stack',
    type: 'object',
    tags: ['physics', 'stackable'],
    description: 'Parameterized stack height; friction per slat.',
    updatedAt: '2026-04-04',
    massKg: '25',
    friction: '0.38',
    collision: 'Per-slat boxes (stackable)',
    previewKind: 'image',
  },
  {
    id: 'sim-asset-yard',
    name: 'Outdoor yard scene',
    type: 'environment',
    tags: ['usd', 'terrain'],
    description: 'Heightfield + scattered props for logistics rehearsal.',
    updatedAt: '2026-04-01',
    massKg: '—',
    friction: 'varies',
    collision: 'Heightfield + instanced props',
    previewKind: 'viewer3d',
  },
];

const CONFIGS_SEED: SimulationConfigDto[] = [
  {
    id: 'sim-cfg-default',
    name: 'Default physics + 250Hz',
    description: 'Baseline integrator, contact stiffness for manipulation QA.',
    sceneId: 'sim-scene-aisle',
    sceneName: 'Aisle pick rehearsal',
    physicsSetting: 'solver=PGS, hz=250',
    cameraSetting: 'top-down + wrist rgb',
    randomizationEnabled: true,
    assetsCount: 4,
    eventsCount: 6,
    updatedAt: '2026-04-11',
    facet: 'default',
    status: 'active',
    actionType: 'step',
    terminationCondition: 'max_steps',
    targetAssetIds: ['sim-asset-panda', 'sim-asset-shelf', 'sim-asset-warehouse', 'sim-asset-pallet'],
    observationTargets: ['tcp_pose', 'joint_torques', 'contact_forces', 'rgb_stack'],
    eventConditions: [
      'episode_start → reset_joint_noise(seed)',
      'contact_force > 120N → log_peak',
      'success_flag → terminate_episode(success)',
    ],
  },
  {
    id: 'sim-cfg-stress',
    name: 'Stress — concurrent agents',
    description: 'Spawns 12 agents, collision broadphase stress markers.',
    sceneId: 'sim-scene-ai-warehouse',
    sceneName: 'AI — warehouse with shelves',
    physicsSetting: 'solver=TGS, hz=500',
    cameraSetting: 'multi-view + lidar replay',
    randomizationEnabled: true,
    assetsCount: 18,
    eventsCount: 22,
    updatedAt: '2026-04-09',
    facet: 'stress',
    status: 'active',
    actionType: 'episode',
    terminationCondition: 'timeout',
    targetAssetIds: ['sim-asset-amr', 'sim-asset-yard', 'sim-asset-pallet', 'sim-asset-shelf'],
    observationTargets: ['lidar_scan', 'agent_positions', 'collision_pairs'],
    eventConditions: [
      'spawn_count == 12 → enable_stress_metrics',
      'broadphase_ms > 8 → emit_warning',
      'any_agent_stuck(30s) → reset_agent',
    ],
  },
  {
    id: 'sim-cfg-reg',
    name: 'Regression pack v3',
    description: 'Golden trajectories + event hooks for CI replay.',
    sceneId: 'sim-scene-minimal',
    sceneName: 'Minimal physics lab',
    physicsSetting: 'solver=PGS, hz=120',
    cameraSetting: 'fixed benchmark camera',
    randomizationEnabled: false,
    assetsCount: 9,
    eventsCount: 14,
    updatedAt: '2026-04-05',
    facet: 'regression',
    status: 'draft',
    actionType: 'reset',
    terminationCondition: 'success',
    targetAssetIds: ['sim-asset-panda', 'sim-asset-amr', 'sim-asset-warehouse'],
    observationTargets: ['trajectory_error', 'event_log', 'determinism_hash'],
    eventConditions: [
      'golden_pose_delta < 1mm → checkpoint_pass',
      'hash_mismatch → fail_run',
    ],
  },
];

const PRESETS_SEED: SimulationPresetDto[] = [
  {
    id: 'sim-pre-warehouse',
    name: 'Warehouse pick preset',
    description: 'Config + shelf + AMR bundle for aisle rehearsal.',
    boundConfigName: 'Default physics + 250Hz',
    boundConfigId: 'sim-cfg-default',
    boundAssetCount: 5,
    assetIds: ['sim-asset-panda', 'sim-asset-shelf', 'sim-asset-warehouse', 'sim-asset-amr', 'sim-asset-pallet'],
    parameters: [
      { key: 'physics_hz', value: '250' },
      { key: 'max_episode_s', value: '180' },
      { key: 'randomize_shelves', value: 'true' },
    ],
    updatedAt: '2026-04-10',
    facet: 'default',
  },
  {
    id: 'sim-pre-yard',
    name: 'Outdoor patrol preset',
    description: 'Terrain friction table + AMR + weathered props.',
    boundConfigName: 'Stress — concurrent agents',
    boundConfigId: 'sim-cfg-stress',
    boundAssetCount: 7,
    assetIds: ['sim-asset-amr', 'sim-asset-yard', 'sim-asset-pallet', 'sim-asset-shelf'],
    parameters: [
      { key: 'patrol_waypoints', value: '12' },
      { key: 'weathering', value: 'medium' },
    ],
    updatedAt: '2026-04-07',
    facet: 'stress',
  },
  {
    id: 'sim-pre-ci',
    name: 'CI smoke preset',
    description: 'Minimal asset set for regression pack v3.',
    boundConfigName: 'Regression pack v3',
    boundConfigId: 'sim-cfg-reg',
    boundAssetCount: 3,
    assetIds: ['sim-asset-panda', 'sim-asset-warehouse', 'sim-asset-amr'],
    parameters: [
      { key: 'deterministic_seed', value: '42' },
      { key: 'max_steps', value: '500' },
    ],
    updatedAt: '2026-04-03',
    facet: 'regression',
  },
];

const SCENES_SEED: SimulationSceneDto[] = [
  {
    id: 'sim-scene-aisle',
    name: 'Aisle pick rehearsal',
    assetCount: 6,
    origin: 'manual',
    updatedAt: '2026-04-12',
  },
  {
    id: 'sim-scene-ai-warehouse',
    name: 'AI — warehouse with shelves',
    assetCount: 11,
    origin: 'ai',
    updatedAt: '2026-04-11',
  },
  {
    id: 'sim-scene-yard',
    name: 'Yard patrol loop',
    assetCount: 4,
    origin: 'manual',
    updatedAt: '2026-04-09',
  },
  {
    id: 'sim-scene-ai-yard',
    name: 'AI — yard + robot',
    assetCount: 5,
    origin: 'ai',
    updatedAt: '2026-04-08',
  },
  {
    id: 'sim-scene-minimal',
    name: 'Minimal physics lab',
    assetCount: 2,
    origin: 'manual',
    updatedAt: '2026-04-06',
  },
];

let assetsStore: SimulationAssetDto[] = ASSETS_SEED.map(cloneAsset);
let configsStore: SimulationConfigDto[] = CONFIGS_SEED.map((c) => ({
  ...c,
  targetAssetIds: [...c.targetAssetIds],
  observationTargets: [...c.observationTargets],
  eventConditions: [...c.eventConditions],
}));
let presetsStore: SimulationPresetDto[] = PRESETS_SEED.map((p) => ({
  ...p,
  assetIds: [...p.assetIds],
  parameters: p.parameters.map((x) => ({ ...x })),
}));
let scenesStore: SimulationSceneDto[] = SCENES_SEED.map((s) => ({ ...s }));

export function getSimulationAssetsMock(): SimulationAssetDto[] {
  return assetsStore;
}

export function prependSimulationAsset(row: SimulationAssetDto): void {
  assetsStore = [cloneAsset(row), ...assetsStore];
}

export function getSimulationAssetById(id: string): SimulationAssetDto | null {
  return assetsStore.find((a) => a.id === id) ?? null;
}

export function getSimulationConfigurationsMock(): SimulationConfigDto[] {
  return configsStore;
}

export function prependSimulationConfiguration(row: SimulationConfigDto): void {
  configsStore = [{ ...row, targetAssetIds: [...row.targetAssetIds], observationTargets: [...row.observationTargets], eventConditions: [...row.eventConditions] }, ...configsStore];
}

export function removeSimulationConfiguration(id: string): boolean {
  const next = configsStore.filter((c) => c.id !== id);
  if (next.length === configsStore.length) return false;
  configsStore = next;
  return true;
}

export function duplicateSimulationConfiguration(id: string): SimulationConfigDto | null {
  const src = getSimulationConfigurationById(id);
  if (!src) return null;
  const today = new Date().toISOString().slice(0, 10);
  const copy: SimulationConfigDto = {
    ...src,
    id: `sim-cfg-${Date.now()}`,
    name: `${src.name} (copy)`,
    updatedAt: today,
    status: 'draft',
    targetAssetIds: [...src.targetAssetIds],
    observationTargets: [...src.observationTargets],
    eventConditions: [...src.eventConditions],
  };
  prependSimulationConfiguration(copy);
  return copy;
}

export function getSimulationConfigurationById(id: string): SimulationConfigDto | null {
  return configsStore.find((c) => c.id === id) ?? null;
}

export function getSimulationPresetsMock(): SimulationPresetDto[] {
  return presetsStore;
}

export function prependSimulationPreset(row: SimulationPresetDto): void {
  presetsStore = [
    {
      ...row,
      assetIds: [...row.assetIds],
      parameters: row.parameters.map((p) => ({ ...p })),
    },
    ...presetsStore,
  ];
}

export function removeSimulationPreset(id: string): boolean {
  const next = presetsStore.filter((p) => p.id !== id);
  if (next.length === presetsStore.length) return false;
  presetsStore = next;
  return true;
}

export function duplicateSimulationPreset(id: string): SimulationPresetDto | null {
  const src = getSimulationPresetById(id);
  if (!src) return null;
  const today = new Date().toISOString().slice(0, 10);
  const copy: SimulationPresetDto = {
    ...src,
    id: `sim-pre-${Date.now()}`,
    name: `${src.name} (copy)`,
    updatedAt: today,
    assetIds: [...src.assetIds],
    parameters: src.parameters.map((p) => ({ ...p })),
  };
  prependSimulationPreset(copy);
  return copy;
}

export function getSimulationPresetById(id: string): SimulationPresetDto | null {
  return presetsStore.find((p) => p.id === id) ?? null;
}

export function getSimulationScenesMock(): SimulationSceneDto[] {
  return scenesStore;
}

export function prependSimulationScene(row: SimulationSceneDto): void {
  scenesStore = [{ ...row }, ...scenesStore];
}

export function getSimulationSceneById(id: string): SimulationSceneDto | null {
  return scenesStore.find((s) => s.id === id) ?? null;
}

export function previewUrl(seed: string, w = 640, h = 360): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}
