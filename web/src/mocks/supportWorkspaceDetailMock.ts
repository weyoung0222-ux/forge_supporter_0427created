/**
 * Support workspace — card detail payloads (RFM-style usage + lineage placeholders).
 * Enriches list DTOs with deterministic “dummy depth” per id.
 */

import { getSupportCompositionsMock, type SupportCompositionDto } from './supportCompositionsMock';
import type { SupportDefinitionDeviceDto, SupportDefinitionModelDto } from './supportDefinitionMock';
import { getSupportDefinitionDevicesMock, getSupportDefinitionModelsMock } from './supportDefinitionMock';
import type { SupportTaskDto } from './supportTasksMock';
import { getSupportTasksMock } from './supportTasksMock';

export interface LinkedProjectRef {
  id: string;
  name: string;
  role?: string;
}

export interface RfmSnapshot {
  /** Recency — e.g. last pull, last run */
  recencyLabel: string;
  /** Frequency — 7d pulls / downloads */
  frequency7d: number;
  /** Adoption / “value” score 0–100 */
  adoptionScore: number;
}

function seedFromId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

const RECENCY = [
  'Last pull 2h ago',
  'Last inference 6h ago',
  'Synced 1 day ago',
  'Referenced in CI 3 days ago',
  'Last validation run 12h ago',
];

const EXTRA_PROJECTS: LinkedProjectRef[] = [
  { id: 'PJT-001', name: 'Forge Core', role: 'Primary' },
  { id: 'PJT-002', name: 'Warehouse Bot', role: 'Consumer' },
  { id: 'PJT-003', name: 'Logistics Bot', role: 'Edge deploy' },
  { id: 'PJT-004', name: 'Autonomous Driving', role: 'Calibration' },
  { id: 'PJT-005', name: 'Dev Sandbox', role: 'Experiment' },
];

export interface DefinitionAssetDetailBase {
  id: string;
  name: string;
  subtitle: string;
  version: string;
  projectName: string;
  updatedAt: string;
  storageSize: string;
  createdRelative: string;
  sourceActivityLabel: string;
  sourceActivityBadge: string;
  sourceActivityDescription: string;
  downloads7d: number;
  linkedProjects: LinkedProjectRef[];
  rfm: RfmSnapshot;
  routePlaceholder: string;
}

export interface ModelJointRow {
  key: string;
  name: string;
  jointType: string;
  limits: string;
}

export interface DefinitionModelDetail extends DefinitionAssetDetailBase {
  kind: 'model';
  assetKindLabel: string;
  source: SupportDefinitionModelDto['source'];
  /** RFM-style robot / kinematics snapshot (dummy). */
  robotPlatform: string;
  dof: number;
  reachMm: number;
  payloadKg: number;
  massKg: number;
  baseFrame: string;
  toolFrame: string;
  controllerRuntime: string;
  kinematicChainSummary: string;
  jointTable: ModelJointRow[];
  calibrationNote: string;
}

export interface DefinitionDeviceDetail extends DefinitionAssetDetailBase {
  kind: 'device';
  assetKindLabel: string;
  deviceClass: SupportDefinitionDeviceDto['deviceClass'];
  equipmentKind: string;
  equipmentSummary: string;
}

function buildRfm(seed: number): RfmSnapshot {
  return {
    recencyLabel: pick(RECENCY, seed),
    frequency7d: 20 + (seed % 180),
    adoptionScore: 42 + (seed % 55),
  };
}

function linkedProjectsForSeed(seed: number, n: number): LinkedProjectRef[] {
  const start = seed % Math.max(1, EXTRA_PROJECTS.length - n);
  return EXTRA_PROJECTS.slice(start, start + n);
}

function buildModelRobotProfile(row: SupportDefinitionModelDto, seed: number) {
  const dof = 6 + (seed % 2);
  const platforms = [
    'RFM Forge Runtime (policy + sim bridge)',
    'RFM Edge Bundle · Jetson class',
    'RFM Training export · ONNX + URDF pack',
  ];
  const controllers = [
    'ros2_control + RFM hardware interface shim',
    'Vendor SDK bridge → RFM topic adapter',
    'Sim-only: Ignition Gazebo + RFM clock sync',
  ];
  const summaries = [
    'Serial manipulator chain registered in RFM: `world` → `odom` → `base_link` → arm links → `tool0`. URDF checksum locked in registry (dummy).',
    'Mobile manipulator graph: base under `base_footprint`, arm subtree parented to `torso_link`, cameras under `head_rgbd_optical_frame` (dummy).',
    'Policy-only asset: kinematic proxy used for collision checks in RFM planner; full mesh in companion bundle (dummy).',
  ];
  const jointPool = ['base_yaw', 'shoulder_pitch', 'elbow_pitch', 'wrist_1', 'wrist_2', 'wrist_3', 'tool_rotate'];
  const jointTable: ModelJointRow[] = jointPool.slice(0, dof).map((name, i) => ({
    key: `${row.id}-j${i}`,
    name,
    jointType: pick(['Revolute', 'Revolute', 'Continuous'], seed + i),
    limits: `${-175 + ((seed + i) % 11)}° … ${175 - i * 8}°`,
  }));
  const calib = [
    'Hand-eye (dummy): last solve RMS 0.4 mm · camera_extrinsics v2026-Q1 in RFM.',
    'Factory defaults; no user field cal recorded in RFM for this revision.',
    'Sim calibration only; real-robot extrinsics pending deployment gate (dummy).',
  ];
  return {
    robotPlatform: pick(platforms, seed),
    dof,
    reachMm: 720 + (seed % 28) * 15,
    payloadKg: Number((3 + (seed % 17) / 2).toFixed(1)),
    massKg: Number((12 + (seed % 40)).toFixed(1)),
    baseFrame: pick(['base_link', 'base_footprint', 'chassis_link'], seed),
    toolFrame: pick(['tool0', 'ee_link', 'tcp_gripper'], seed + 1),
    controllerRuntime: pick(controllers, seed + 2),
    kinematicChainSummary: pick(summaries, seed + 3),
    jointTable,
    calibrationNote: pick(calib, seed + 4),
  };
}

function enrichBase(row: { id: string; name: string; subtitle: string; version: string; projectName: string; updatedAt: string }): Omit<DefinitionAssetDetailBase, never> {
  const s = seedFromId(row.id);
  const nProjects = 2 + (s % 3);
  return {
    id: row.id,
    name: row.name,
    subtitle: row.subtitle,
    version: row.version,
    projectName: row.projectName,
    updatedAt: row.updatedAt,
    storageSize: `${(1.2 + (s % 80) / 10).toFixed(1)}GB`,
    createdRelative: pick(['Created 2 days ago', 'Created 5 days ago', 'Created 1 week ago', 'Created 3 hours ago'], s),
    sourceActivityLabel: 'Source activity',
    sourceActivityBadge: pick(['Register', 'Upload', 'Training', 'Registry sync'], s),
    sourceActivityDescription: pick(
      [
        'Registered as register output (prototype)',
        'Promoted from training run artifact',
        'Uploaded via workspace bundle',
        'Pulled from registry with checksum lock',
      ],
      s,
    ),
    downloads7d: 40 + (s % 200),
    linkedProjects: linkedProjectsForSeed(s, nProjects),
    rfm: buildRfm(s),
    routePlaceholder: `/support/robot/definition/${row.id}`,
  };
}

export function getSupportDefinitionModelDetail(id: string): DefinitionModelDetail | null {
  const row = getSupportDefinitionModelsMock().find((r) => r.id === id);
  if (!row) {
    return null;
  }
  const base = enrichBase(row);
  const seed = seedFromId(row.id);
  const profile = buildModelRobotProfile(row, seed);
  return {
    kind: 'model',
    assetKindLabel: 'Model',
    source: row.source,
    ...base,
    ...profile,
  };
}

export function getSupportDefinitionDeviceDetail(id: string): DefinitionDeviceDetail | null {
  const row = getSupportDefinitionDevicesMock().find((r) => r.id === id);
  if (!row) {
    return null;
  }
  const base = enrichBase(row);
  return {
    kind: 'device',
    assetKindLabel: 'Device',
    deviceClass: row.deviceClass,
    equipmentKind: row.equipmentKind,
    equipmentSummary: row.equipmentSummary,
    ...base,
  };
}

export interface CompositionDetail extends DefinitionAssetDetailBase {
  kind: 'composition';
  composition: SupportCompositionDto;
}

export function getSupportCompositionDetail(row: SupportCompositionDto): CompositionDetail {
  const base = enrichBase({
    id: row.id,
    name: row.name,
    subtitle: row.subtitle,
    version: `bundle · ${row.updatedAt}`,
    projectName: row.projectName,
    updatedAt: row.updatedAt,
  });
  return {
    kind: 'composition',
    composition: row,
    ...base,
    sourceActivityLabel: 'Bundle origin',
    sourceActivityBadge: 'Compose',
    sourceActivityDescription: 'Model + device bundle for runtime deployment (prototype).',
    routePlaceholder: `/support/robot/compositions/${row.id}`,
  };
}

export function getSupportCompositionDetailById(id: string): CompositionDetail | null {
  const row = getSupportCompositionsMock().find((c) => c.id === id);
  if (!row) {
    return null;
  }
  return getSupportCompositionDetail(row);
}

export interface TaskDetail extends DefinitionAssetDetailBase {
  kind: 'task';
  task: SupportTaskDto;
  /** Projects where this task is referenced / consumed */
  consumingProjects: LinkedProjectRef[];
  weeklyRuns: number;
  openBlockers: number;
}

export function getSupportTaskDetail(id: string): TaskDetail | null {
  const row = getSupportTasksMock().find((r) => r.id === id);
  if (!row) {
    return null;
  }
  const base = enrichBase({
    id: row.id,
    name: row.title,
    subtitle: row.subtitle,
    version: row.status,
    projectName: row.projectName,
    updatedAt: row.updatedAt,
  });
  const s = seedFromId(row.id);
  const consuming: LinkedProjectRef[] = [
    { id: row.projectName.replace(/\s/g, '-') || 'PJT-HOME', name: row.projectName, role: 'Owner workspace' },
    ...linkedProjectsForSeed(s + 1, 2 + (s % 2)),
  ];
  return {
    kind: 'task',
    task: row,
    ...base,
    name: row.title,
    sourceActivityLabel: 'Task group',
    sourceActivityBadge: row.taskGroup.kind,
    sourceActivityDescription: `${row.taskGroup.name} · status ${row.status}`,
    consumingProjects: consuming,
    weeklyRuns: 3 + (s % 40),
    openBlockers: s % 4,
    routePlaceholder: `/support/robot/tasks/${row.id}`,
  };
}
