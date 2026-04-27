/** Model Support (RFM) — mock data for workspace screens. */

export type WfmIdm = 'WFM' | 'IDM';

export interface MsRegistryModelDto {
  id: string;
  name: string;
  modelType: WfmIdm;
  task: string;
  version: string;
  updatedAt: string;
  description: string;
  baseModel?: string;
  artifactUrl?: string;
}

export interface MsParameterPresetRow {
  id: string;
  name: string;
  modelName: string;
  paramCount: number;
  isDefault: boolean;
  updatedAt: string;
  params: Record<string, string>;
}

export type MsTrainingMethod = 'LoRA' | 'full' | 'freeze';

export interface MsFtConfigDto {
  id: string;
  name: string;
  modelName: string;
  dataset: string;
  trainingType: MsTrainingMethod;
  status: 'draft' | 'ready' | 'archived';
  updatedAt: string;
  learningRate: number;
  batchSize: number;
  epochs: number;
}

export type MsFramework = 'GROOT' | 'ACT' | 'PIO';

export interface MsFtScriptDto {
  id: string;
  name: string;
  framework: MsFramework;
  version: string;
  updatedAt: string;
  description: string;
  content: string;
}

export interface MsFtPresetRow {
  id: string;
  name: string;
  scriptName: string;
  paramPresetName: string;
  isDefault: boolean;
  updatedAt: string;
}

export type MsJobStatus = 'queued' | 'running' | 'done' | 'error';

export interface MsTrainingJobRow {
  id: string;
  name: string;
  modelName: string;
  status: MsJobStatus;
  progress: number;
  startedAt: string;
  logs: string;
  lossSeries: number[];
  accSeries: number[];
  artifactZip: string;
}

export type MsPretrainedSource = 'internal' | 'external';

export interface MsPretrainedModelDto {
  id: string;
  name: string;
  source: MsPretrainedSource;
  task: string;
  version: string;
  updatedAt: string;
  metadata: string;
  artifactUrl: string;
}

export interface MsArtifactRow {
  id: string;
  modelName: string;
  checkpointCount: number;
  updatedAt: string;
  checkpoints: string[];
  configFiles: string[];
}

const REGISTRY_SEED: MsRegistryModelDto[] = [
  {
    id: 'ms-m-rfm-nav',
    name: 'RFM_Navigation_v3',
    modelType: 'WFM',
    task: 'Urban Navigation',
    version: '3.2.1',
    updatedAt: '2026-04-18',
    description: 'RFM navigation stack for dense urban scenes.',
    baseModel: 'RFM_Base_v2',
    artifactUrl: 's3://rfm-artifacts/models/rfm_nav_v3.pt',
  },
  {
    id: 'ms-m-idm-manip',
    name: 'IDM_Manipulation_Pro',
    modelType: 'IDM',
    task: 'Manipulation',
    version: '1.4.0',
    updatedAt: '2026-04-17',
    description: 'Imitation policy for dual-arm cells.',
    artifactUrl: 'https://artifacts.rfm.internal/idm_manip_pro.zip',
  },
  {
    id: 'ms-m-wfm-loc',
    name: 'WFM_Localization_Edge',
    modelType: 'WFM',
    task: 'Localization',
    version: '0.9.3',
    updatedAt: '2026-04-12',
    description: 'Lightweight lidar–visual fusion for edge devices.',
  },
];

let registryStore = REGISTRY_SEED.map((r) => ({ ...r }));

const PRESET_SEED: MsParameterPresetRow[] = [
  {
    id: 'ms-pp-1',
    name: 'Nav default v3',
    modelName: 'RFM_Navigation_v3',
    paramCount: 12,
    isDefault: true,
    updatedAt: '2026-04-16',
    params: { lr: '2e-4', wd: '0.01', dropout: '0.1' },
  },
  {
    id: 'ms-pp-2',
    name: 'Manip low-rank',
    modelName: 'IDM_Manipulation_Pro',
    paramCount: 8,
    isDefault: false,
    updatedAt: '2026-04-10',
    params: { lr: '1e-4', rank: '32', alpha: '64' },
  },
];
let presetStore = PRESET_SEED.map((r) => ({ ...r, params: { ...r.params } }));

const FT_CFG_SEED: MsFtConfigDto[] = [
  {
    id: 'ms-ftc-1',
    name: 'CitySim LoRA sweep',
    modelName: 'RFM_Navigation_v3',
    dataset: 'CitySim v2',
    trainingType: 'LoRA',
    status: 'ready',
    updatedAt: '2026-04-19',
    learningRate: 0.0002,
    batchSize: 64,
    epochs: 20,
  },
  {
    id: 'ms-ftc-2',
    name: 'Dock pick full FT',
    modelName: 'IDM_Manipulation_Pro',
    dataset: 'WarehousePick v1',
    trainingType: 'full',
    status: 'draft',
    updatedAt: '2026-04-14',
    learningRate: 3e-5,
    batchSize: 32,
    epochs: 50,
  },
];
let ftConfigStore = FT_CFG_SEED.map((r) => ({ ...r }));

const FT_SCR_SEED: MsFtScriptDto[] = [
  {
    id: 'ms-fts-1',
    name: 'train_groot_nav',
    framework: 'GROOT',
    version: '1.0.4',
    updatedAt: '2026-04-15',
    description: 'GROOT trainer entry for navigation heads.',
    content: '#!/usr/bin/env python3\n# GROOT navigation trainer\nimport groot\n...',
  },
  {
    id: 'ms-fts-2',
    name: 'act_bimanual_loop',
    framework: 'ACT',
    version: '0.8.2',
    updatedAt: '2026-04-11',
    description: 'ACT loop for bimanual teleop datasets.',
    content: '# ACT training\nfrom act import train\n...',
  },
  {
    id: 'ms-fts-3',
    name: 'pio_latency_safe',
    framework: 'PIO',
    version: '2.1.0',
    updatedAt: '2026-04-09',
    description: 'PIO script with latency guards.',
    content: '# PIO\nimport pio\n...',
  },
];
let ftScriptStore = FT_SCR_SEED.map((r) => ({ ...r }));

const FT_PRE_SEED: MsFtPresetRow[] = [
  {
    id: 'ms-ftp-1',
    name: 'GROOT + Nav defaults',
    scriptName: 'train_groot_nav',
    paramPresetName: 'Nav default v3',
    isDefault: true,
    updatedAt: '2026-04-17',
  },
  {
    id: 'ms-ftp-2',
    name: 'ACT warehouse bundle',
    scriptName: 'act_bimanual_loop',
    paramPresetName: 'Manip low-rank',
    isDefault: false,
    updatedAt: '2026-04-13',
  },
];
let ftPresetStore = FT_PRE_SEED.map((r) => ({ ...r }));

const JOB_SEED: MsTrainingJobRow[] = [
  {
    id: 'ms-job-1',
    name: 'nav_citysim_lora_42',
    modelName: 'RFM_Navigation_v3',
    status: 'running',
    progress: 62,
    startedAt: '2026-04-20 08:12',
    logs: '[08:12:01] Allocated 4x A100\n[08:12:40] epoch 12/20 loss=0.214\n[08:13:02] val nav_score=0.91\n',
    lossSeries: [0.8, 0.55, 0.41, 0.33, 0.28, 0.24, 0.22, 0.214],
    accSeries: [0.62, 0.71, 0.78, 0.83, 0.86, 0.88, 0.9, 0.91],
    artifactZip: 's3://rfm-jobs/nav_citysim_lora_42/artifacts.zip',
  },
  {
    id: 'ms-job-2',
    name: 'manip_idm_finetune_7',
    modelName: 'IDM_Manipulation_Pro',
    status: 'queued',
    progress: 0,
    startedAt: '—',
    logs: '',
    lossSeries: [],
    accSeries: [],
    artifactZip: '',
  },
  {
    id: 'ms-job-3',
    name: 'loc_edge_wfm_done',
    modelName: 'WFM_Localization_Edge',
    status: 'done',
    progress: 100,
    startedAt: '2026-04-19 22:01',
    logs: '[22:01] done. checkpoint best.pt exported.\n',
    lossSeries: [0.9, 0.4, 0.22, 0.15, 0.11, 0.09, 0.08, 0.075],
    accSeries: [0.5, 0.72, 0.81, 0.86, 0.89, 0.91, 0.92, 0.93],
    artifactZip: 's3://rfm-jobs/loc_edge_wfm_done/out.zip',
  },
  {
    id: 'ms-job-4',
    name: 'failed_smoke_test',
    modelName: 'RFM_Navigation_v3',
    status: 'error',
    progress: 14,
    startedAt: '2026-04-18 16:44',
    logs: '[16:44] CUDA OOM on batch 128 — aborting.\n',
    lossSeries: [1.2, 0.9],
    accSeries: [0.2, 0.28],
    artifactZip: '',
  },
];
let jobStore = JOB_SEED.map((j) => ({ ...j, lossSeries: [...j.lossSeries], accSeries: [...j.accSeries] }));

const PRE_SEED: MsPretrainedModelDto[] = [
  {
    id: 'ms-pre-1',
    name: 'RFM_Navigation_v3',
    source: 'internal',
    task: 'Urban Navigation',
    version: '3.2.1',
    updatedAt: '2026-04-18',
    metadata: '{"team":"RFM","license":"internal"}',
    artifactUrl: 's3://rfm-pretrained/rfm_nav_v3.pt',
  },
  {
    id: 'ms-pre-2',
    name: 'CitySim_Baseline',
    source: 'external',
    task: 'Simulation-to-real',
    version: '1.0.0',
    updatedAt: '2026-03-22',
    metadata: '{"vendor":"CitySim","dataset":"CitySim v2"}',
    artifactUrl: 'https://partner.example/models/citysim_baseline.onnx',
  },
];
let pretrainedStore = PRE_SEED.map((r) => ({ ...r }));

const ART_SEED: MsArtifactRow[] = [
  {
    id: 'ms-art-1',
    modelName: 'RFM_Navigation_v3',
    checkpointCount: 6,
    updatedAt: '2026-04-20',
    checkpoints: ['epoch_004.ckpt', 'epoch_008.ckpt', 'epoch_012.ckpt', 'epoch_016.ckpt', 'epoch_020.ckpt', 'best.pt'],
    configFiles: ['hydra.yaml', 'dataset_citysim.yaml', 'optimizer.yaml'],
  },
  {
    id: 'ms-art-2',
    modelName: 'IDM_Manipulation_Pro',
    checkpointCount: 3,
    updatedAt: '2026-04-17',
    checkpoints: ['warmup.ckpt', 'mid.ckpt', 'best.pt'],
    configFiles: ['train_config.json', 'norm_stats.json'],
  },
];
let artifactStore = ART_SEED.map((a) => ({ ...a, checkpoints: [...a.checkpoints], configFiles: [...a.configFiles] }));

export function getMsRegistryModels(): MsRegistryModelDto[] {
  return registryStore.map((r) => ({ ...r }));
}

export function upsertMsRegistryModel(row: MsRegistryModelDto): void {
  const i = registryStore.findIndex((x) => x.id === row.id);
  if (i >= 0) registryStore = [...registryStore.slice(0, i), row, ...registryStore.slice(i + 1)];
  else registryStore = [row, ...registryStore];
}

export function deleteMsRegistryModel(id: string): void {
  registryStore = registryStore.filter((x) => x.id !== id);
}

export function getMsRegistryById(id: string): MsRegistryModelDto | null {
  const r = registryStore.find((x) => x.id === id);
  return r ? { ...r } : null;
}

export function getMsParameterPresets(): MsParameterPresetRow[] {
  return presetStore.map((r) => ({ ...r, params: { ...r.params } }));
}

export function upsertMsParameterPreset(row: MsParameterPresetRow): void {
  const i = presetStore.findIndex((x) => x.id === row.id);
  if (i >= 0) presetStore = [...presetStore.slice(0, i), row, ...presetStore.slice(i + 1)];
  else presetStore = [row, ...presetStore];
}

export function deleteMsParameterPreset(id: string): void {
  presetStore = presetStore.filter((x) => x.id !== id);
}

export function getMsFtConfigs(): MsFtConfigDto[] {
  return ftConfigStore.map((r) => ({ ...r }));
}

export function upsertMsFtConfig(row: MsFtConfigDto): void {
  const i = ftConfigStore.findIndex((x) => x.id === row.id);
  if (i >= 0) ftConfigStore = [...ftConfigStore.slice(0, i), row, ...ftConfigStore.slice(i + 1)];
  else ftConfigStore = [row, ...ftConfigStore];
}

export function deleteMsFtConfig(id: string): void {
  ftConfigStore = ftConfigStore.filter((x) => x.id !== id);
}

export function getMsFtScripts(): MsFtScriptDto[] {
  return ftScriptStore.map((r) => ({ ...r }));
}

export function upsertMsFtScript(row: MsFtScriptDto): void {
  const i = ftScriptStore.findIndex((x) => x.id === row.id);
  if (i >= 0) ftScriptStore = [...ftScriptStore.slice(0, i), row, ...ftScriptStore.slice(i + 1)];
  else ftScriptStore = [row, ...ftScriptStore];
}

export function deleteMsFtScript(id: string): void {
  ftScriptStore = ftScriptStore.filter((x) => x.id !== id);
}

export function getMsFtPresets(): MsFtPresetRow[] {
  return ftPresetStore.map((r) => ({ ...r }));
}

export function upsertMsFtPreset(row: MsFtPresetRow): void {
  const i = ftPresetStore.findIndex((x) => x.id === row.id);
  if (i >= 0) ftPresetStore = [...ftPresetStore.slice(0, i), row, ...ftPresetStore.slice(i + 1)];
  else ftPresetStore = [row, ...ftPresetStore];
}

export function deleteMsFtPreset(id: string): void {
  ftPresetStore = ftPresetStore.filter((x) => x.id !== id);
}

export function getMsTrainingJobs(): MsTrainingJobRow[] {
  return jobStore.map((j) => ({
    ...j,
    lossSeries: [...j.lossSeries],
    accSeries: [...j.accSeries],
  }));
}

export function patchMsTrainingJob(id: string, patch: Partial<MsTrainingJobRow>): void {
  jobStore = jobStore.map((j) => (j.id === id ? { ...j, ...patch } : j));
}

export function getMsPretrained(): MsPretrainedModelDto[] {
  return pretrainedStore.map((r) => ({ ...r }));
}

export function upsertMsPretrained(row: MsPretrainedModelDto): void {
  const i = pretrainedStore.findIndex((x) => x.id === row.id);
  if (i >= 0) pretrainedStore = [...pretrainedStore.slice(0, i), row, ...pretrainedStore.slice(i + 1)];
  else pretrainedStore = [row, ...pretrainedStore];
}

export function deleteMsPretrained(id: string): void {
  pretrainedStore = pretrainedStore.filter((x) => x.id !== id);
}

export function getMsArtifacts(): MsArtifactRow[] {
  return artifactStore.map((a) => ({
    ...a,
    checkpoints: [...a.checkpoints],
    configFiles: [...a.configFiles],
  }));
}
