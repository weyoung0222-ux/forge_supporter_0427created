/**
 * Support workspace — card detail payloads (RFM-style usage + lineage placeholders).
 * Enriches list DTOs with deterministic “dummy depth” per id.
 */

import { getSupportCompositionsMock, type SupportCompositionDto } from './supportCompositionsMock';
import type { DeviceCatalogType, SupportDefinitionDeviceDto, SupportDefinitionModelDto } from './supportDefinitionMock';
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
  manufacturer: string;
  modelName: string;
  modelVariant: string;
  displayName: string;
  description: string;
  formFactor?: string;
  locomotionType?: string;
  manipulatorStructure?: string;
  dof?: number;
  payloadKg?: number;
  reachMm?: number;
  weightKg?: number;
  repeatabilityMm?: number;
  defaultSensors: string[];
  modalitySchemas: string[];
  controlMethods: string[];
  jointTable: ModelJointRow[];
  calibrationNote?: string;
}

export interface DefinitionDeviceDetail extends DefinitionAssetDetailBase {
  kind: 'device';
  assetKindLabel: string;
  deviceClass: SupportDefinitionDeviceDto['deviceClass'];
  equipmentKind: string;
  equipmentSummary: string;
  manufacturer: string;
  modelName: string;
  modelVariant: string;
  displayName: string;
  description: string;
  deviceCatalogType?: DeviceCatalogType;
  /** Subtype key aligned with create modal (e.g. rgbd, spinning_2d). */
  deviceSubtype?: string;
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

const FORM_FACTOR_LABELS: Record<string, string> = {
  singleArm: 'Single Arm',
  dualArm: 'Dual Arm',
  mobileManipulator: 'Mobile Manipulator',
  legged: 'Legged',
  humanoid: 'Humanoid',
};

const LOCOMOTION_LABELS: Record<string, string> = {
  fixedBase: 'Fixed Base',
  wheeled: 'Wheeled',
  tracked: 'Tracked',
  legged: 'Legged',
  flying: 'Flying',
};

const MANIPULATOR_LABELS: Record<string, string> = {
  serial: 'Serial',
  parallel: 'Parallel',
  scara: 'SCARA',
  delta: 'Delta',
  cableDriven: 'Cable-driven',
};

/** Only fields present on the catalog row (or produced by the create modal) — no inferred joints/calib/sensors. */
function buildModelRobotProfile(row: SupportDefinitionModelDto) {
  const ff = row.formFactor;
  const lt = row.locomotionType;
  const ms = row.manipulatorStructure;

  return {
    manufacturer: row.manufacturer,
    modelName: row.modelName,
    modelVariant: row.modelVariant,
    displayName: row.displayName,
    description: row.description,
    formFactor: ff != null ? FORM_FACTOR_LABELS[ff] ?? ff : undefined,
    locomotionType: lt != null ? LOCOMOTION_LABELS[lt] ?? lt : undefined,
    manipulatorStructure: ms != null ? MANIPULATOR_LABELS[ms] ?? ms : undefined,
    dof: row.dof,
    payloadKg: row.payloadKg,
    reachMm: row.reachMm,
    weightKg: row.weightKg,
    repeatabilityMm: row.repeatabilityMm,
    defaultSensors: row.defaultSensors ?? [],
    modalitySchemas: row.modalitySchemas ?? [],
    controlMethods: row.controlMethods ?? [],
    jointTable: [] as ModelJointRow[],
    calibrationNote: undefined as string | undefined,
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
  const profile = buildModelRobotProfile(row);
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

  const manufacturer = row.manufacturer?.trim() ?? '';
  const modelName = row.modelName?.trim() ?? '';
  const modelVariant = row.modelVariant?.trim() ?? '';
  const displayName = row.displayName?.trim() || row.name;
  const description = row.description?.trim() ?? '';

  return {
    kind: 'device',
    assetKindLabel: 'Robot Device Model',
    deviceClass: row.deviceClass,
    equipmentKind: row.equipmentKind,
    equipmentSummary: row.equipmentSummary,
    manufacturer,
    modelName,
    modelVariant,
    displayName,
    description,
    deviceCatalogType: row.deviceCatalogType,
    deviceSubtype: row.deviceSubtype,
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
    sourceActivityDescription: 'Robot + Robot Device Model bundle for runtime deployment (prototype).',
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
    sourceActivityLabel: 'Task type',
    sourceActivityBadge: row.taskType.kind,
    sourceActivityDescription: `${row.taskType.name} (${row.taskType.code}) · ${row.status}`,
    consumingProjects: consuming,
    weeklyRuns: 3 + (s % 40),
    openBlockers: s % 4,
    routePlaceholder: `/support/robot/tasks/${row.id}`,
  };
}
