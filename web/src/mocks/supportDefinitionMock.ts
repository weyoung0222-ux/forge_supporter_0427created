/**
 * Support — Robot Definition (Models / Devices) mock list.
 * Naming and fields follow the Dev Library / MODEL_ITEMS wireframe style (Forge catalog).
 */

export type RobotFormFactor = 'singleArm' | 'dualArm' | 'mobileManipulator' | 'legged' | 'humanoid';
export type LocomotionType = 'fixedBase' | 'wheeled' | 'tracked' | 'legged' | 'flying';
export type ManipulatorStructure = 'serial' | 'parallel' | 'scara' | 'delta' | 'cableDriven';

export interface SupportDefinitionModelDto {
  kind: 'model';
  id: string;
  name: string;
  manufacturer: string;
  modelName: string;
  modelVariant: string;
  displayName: string;
  description: string;
  previewImage?: string;
  version: string;
  /** Same vocabulary as Dev Library model cards (filter label). */
  source: 'Local' | 'Upload' | 'Simulation' | 'Training' | 'Registry';
  projectName: string;
  subtitle: string;
  updatedAt: string;
  formFactor?: RobotFormFactor;
  locomotionType?: LocomotionType;
  manipulatorStructure?: ManipulatorStructure;
  dof?: number;
  payloadKg?: number;
  reachMm?: number;
  weightKg?: number;
  repeatabilityMm?: number;
  defaultSensors?: string[];
  modalitySchemas?: string[];
  controlMethods?: string[];
}

/** High-level device category in the definition catalog (create flow). */
export type DeviceCatalogType = 'camera' | 'hand' | 'gripper' | 'lidar';

export interface SupportDefinitionDeviceDto {
  kind: 'device';
  id: string;
  name: string;
  version: string;
  /** Logical group for filtering (no on-card tag). */
  deviceClass: 'Sensing' | 'Manipulation' | 'Locomotion' | 'Compute';
  /** Operator-facing hardware role (camera, gripper/handle, LiDAR, …). */
  equipmentKind: string;
  /** One-line description of modality / mount / interface (RFM catalog style). */
  equipmentSummary: string;
  projectName: string;
  subtitle: string;
  updatedAt: string;
  manufacturer?: string;
  modelName?: string;
  modelVariant?: string;
  displayName?: string;
  description?: string;
  previewImage?: string;
  deviceCatalogType?: DeviceCatalogType;
  /** e.g. rgbd, dexterous_hand, parallel_gripper */
  deviceSubtype?: string;
}

export type SupportDefinitionCardDto = SupportDefinitionModelDto | SupportDefinitionDeviceDto;

const MODELS_SEED: SupportDefinitionModelDto[] = [
  {
    kind: 'model',
    id: 'mdl-rfm-v3',
    name: 'Atlas Mobile 200',
    manufacturer: 'Boston Dynamics',
    modelName: 'Atlas',
    modelVariant: 'Mobile 200',
    displayName: 'Atlas Mobile 200',
    description: 'Residual foundation policy for urban navigation.',
    version: 'checkpoint r3.2',
    source: 'Registry',
    projectName: 'Forge Core',
    subtitle: 'Residual foundation policy — Urban Navigation Pilot',
    updatedAt: '2026-04-14',
    formFactor: 'humanoid',
    locomotionType: 'legged',
    manipulatorStructure: 'serial',
    dof: 28,
    payloadKg: 15,
    reachMm: 900,
    weightKg: 89,
    repeatabilityMm: 0.5,
    defaultSensors: ['IMU', 'LiDAR', 'RGB-D Camera', 'Force/Torque'],
    modalitySchemas: ['joint_state', 'imu', 'point_cloud', 'rgb'],
    controlMethods: ['position', 'velocity', 'impedance'],
  },
  {
    kind: 'model',
    id: 'mdl-wm-sm',
    name: 'Scout Mini AGV',
    manufacturer: 'AgileX Robotics',
    modelName: 'Scout Mini',
    modelVariant: 'AGV',
    displayName: 'Scout Mini AGV',
    description: 'WM rollout predictor for simulation bundles.',
    version: 'latent-256',
    source: 'Training',
    projectName: 'Sim Lab',
    subtitle: 'WM rollout predictor for simulation bundles',
    updatedAt: '2026-04-13',
    formFactor: 'mobileManipulator',
    locomotionType: 'wheeled',
    dof: 4,
    payloadKg: 50,
    weightKg: 62,
    defaultSensors: ['IMU', 'Encoder', 'LiDAR'],
    modalitySchemas: ['odom', 'lidar_scan', 'cmd_vel'],
    controlMethods: ['velocity', 'trajectory'],
  },
  {
    kind: 'model',
    id: 'mdl-yolo',
    name: 'Ranger Vision AMR',
    manufacturer: 'Clearpath Robotics',
    modelName: 'Ranger',
    modelVariant: 'Vision AMR',
    displayName: 'Ranger Vision AMR',
    description: 'Real-time detection head for night drive corpus.',
    version: 'export onnx',
    source: 'Training',
    projectName: 'Autonomous Driving',
    subtitle: 'Real-time detection head — Night Drive Corpus',
    updatedAt: '2026-04-12',
    formFactor: 'mobileManipulator',
    locomotionType: 'wheeled',
    dof: 0,
    weightKg: 85,
    defaultSensors: ['RGB Camera', 'LiDAR', 'IMU', 'GPS'],
    modalitySchemas: ['rgb', 'point_cloud', 'odom'],
    controlMethods: ['velocity'],
  },
  {
    kind: 'model',
    id: 'mdl-grip-pro',
    name: 'Titan PickArm 6',
    manufacturer: 'Titan Robotics',
    modelName: 'PickArm',
    modelVariant: '6-axis',
    displayName: 'Titan PickArm 6',
    description: 'Multi-class grasp quality for warehouse pick.',
    version: 'v1.4.0',
    source: 'Upload',
    projectName: 'Warehouse Bot',
    subtitle: 'Multi-class grasp quality — Warehouse Pick v2',
    updatedAt: '2026-04-11',
    formFactor: 'singleArm',
    locomotionType: 'fixedBase',
    manipulatorStructure: 'serial',
    dof: 6,
    payloadKg: 10,
    reachMm: 1200,
    weightKg: 52,
    repeatabilityMm: 0.05,
    defaultSensors: ['Encoder', 'Force/Torque'],
    modalitySchemas: ['joint_state', 'wrench'],
    controlMethods: ['position', 'velocity', 'torque'],
  },
  {
    kind: 'model',
    id: 'mdl-dex-ft',
    name: 'Nova Cobot 12',
    manufacturer: 'Nova Robotics',
    modelName: 'Cobot',
    modelVariant: '12-DOF',
    displayName: 'Nova Cobot 12',
    description: 'Fine-tuned dexterous policy from human demos.',
    version: 'teleop-ft-02',
    source: 'Local',
    projectName: 'Dev Sandbox',
    subtitle: 'Fine-tuned dexterous policy from human demos',
    updatedAt: '2026-04-10',
  },
  {
    kind: 'model',
    id: 'mdl-nav-graph',
    name: 'Pathfinder TowBot',
    manufacturer: 'Pathfinder Inc.',
    modelName: 'TowBot',
    modelVariant: 'Standard',
    displayName: 'Pathfinder TowBot',
    description: 'Topology-aware routing for traffic sign dataset.',
    version: 'v0.8.1',
    source: 'Simulation',
    projectName: 'Smart City',
    subtitle: 'Topology-aware routing — Traffic Sign Dataset lineage',
    updatedAt: '2026-04-09',
  },
  {
    kind: 'model',
    id: 'mdl-s2r',
    name: 'Carrier LiftBot X',
    manufacturer: 'Carrier Robotics',
    modelName: 'LiftBot',
    modelVariant: 'X',
    displayName: 'Carrier LiftBot X',
    description: 'Domain bridge for RGB-D assembly cells.',
    version: 'calib bundle',
    source: 'Simulation',
    projectName: 'Logistics Bot',
    subtitle: 'Domain bridge for RGB-D assembly cells',
    updatedAt: '2026-04-08',
  },
  {
    kind: 'model',
    id: 'mdl-tactile',
    name: 'Orion Inspection Rover',
    manufacturer: 'Orion Automation',
    modelName: 'Inspection Rover',
    modelVariant: 'Tactile',
    displayName: 'Orion Inspection Rover',
    description: 'Low-latency tactile embedding stack.',
    version: 'sensor-fusion',
    source: 'Registry',
    projectName: 'Forge Core',
    subtitle: 'Low-latency tactile embedding stack',
    updatedAt: '2026-04-07',
  },
];

const DEVICES_SEED: SupportDefinitionDeviceDto[] = [
  {
    kind: 'device',
    id: 'dev-lidar-velo',
    name: 'Velodyne_VLP-16_Front',
    manufacturer: 'Velodyne',
    modelName: 'VLP-16',
    modelVariant: 'Front',
    displayName: 'Velodyne VLP-16 Front',
    description: '360° spinning LiDAR for roof mount; perception ingress on RFM topic `/scan_front`.',
    deviceCatalogType: 'lidar',
    deviceSubtype: 'spinning_2d',
    version: 'SN-LDR-77821',
    deviceClass: 'Sensing',
    equipmentKind: '2D spinning LiDAR',
    equipmentSummary: '360° spinning LiDAR · roof mount · perception stack ingress on RFM topic `/scan_front`',
    projectName: 'Urban Navigation Pilot',
    subtitle: 'Roof mount · 360° scan · AMR-200 fleet',
    updatedAt: '2026-04-14',
  },
  {
    kind: 'device',
    id: 'dev-gripper-schunk',
    name: 'Schunk_EGP-40_Parallel',
    manufacturer: 'Schunk',
    modelName: 'EGP-40',
    modelVariant: 'Parallel',
    displayName: 'Schunk EGP-40 Parallel',
    description: 'Parallel-jaw end effector on TCP; EtherCAT tool bus.',
    deviceCatalogType: 'gripper',
    deviceSubtype: 'parallel_gripper',
    version: 'SKU-GRP-11',
    deviceClass: 'Manipulation',
    equipmentKind: 'Parallel gripper',
    equipmentSummary: 'Parallel-jaw end effector · TCP on tool0 · EtherCAT tool bus · used as manipulation handle in teleop bundles',
    projectName: 'Warehouse Pick v2',
    subtitle: 'Bay 3 line — pick-place station',
    updatedAt: '2026-04-13',
  },
  {
    kind: 'device',
    id: 'dev-realsense',
    name: 'Intel_RealSense_D455_Head',
    manufacturer: 'Intel',
    modelName: 'RealSense D455',
    modelVariant: 'Head',
    displayName: 'Intel RealSense D455 Head',
    description: 'Stereo depth + RGB head camera · USB3 · extrinsics to tool0 in RFM calibration bundle.',
    deviceCatalogType: 'camera',
    deviceSubtype: 'rgbd',
    version: 'SKU-CAM-04',
    deviceClass: 'Sensing',
    equipmentKind: 'RGB-D camera',
    equipmentSummary: 'Stereo depth + RGB head camera · USB3 · extrinsics to tool0 published in RFM calibration bundle',
    projectName: 'Dev Sandbox',
    subtitle: 'RGB-D head mount · calibration 2026-Q1',
    updatedAt: '2026-04-10',
  },
];

let modelsStore: SupportDefinitionModelDto[] = MODELS_SEED.map((m) => ({ ...m }));
let devicesStore: SupportDefinitionDeviceDto[] = DEVICES_SEED.map((d) => ({ ...d }));

export function getSupportDefinitionModelsMock(): SupportDefinitionModelDto[] {
  return modelsStore.map((m) => ({ ...m }));
}

export function getSupportDefinitionDevicesMock(): SupportDefinitionDeviceDto[] {
  return devicesStore.map((d) => ({ ...d }));
}

export function prependSupportDefinitionModel(row: SupportDefinitionModelDto): void {
  modelsStore = [{ ...row }, ...modelsStore];
}

export function prependSupportDefinitionDevice(row: SupportDefinitionDeviceDto): void {
  devicesStore = [{ ...row }, ...devicesStore];
}

export function getSupportDefinitionModelById(id: string): SupportDefinitionModelDto | null {
  return modelsStore.find((m) => m.id === id) ?? null;
}

/** Check if a model with same manufacturer + modelName + modelVariant already exists. */
export function isDuplicateRobotModel(manufacturer: string, modelName: string, modelVariant: string): boolean {
  const mfr = manufacturer.trim().toLowerCase();
  const mn = modelName.trim().toLowerCase();
  const mv = modelVariant.trim().toLowerCase();
  return modelsStore.some(
    (m) => m.manufacturer.trim().toLowerCase() === mfr && m.modelName.trim().toLowerCase() === mn && m.modelVariant.trim().toLowerCase() === mv,
  );
}

/** Same uniqueness rule as robot models, scoped to device catalog entries. */
export function isDuplicateRobotDevice(manufacturer: string, modelName: string, modelVariant: string): boolean {
  const mfr = manufacturer.trim().toLowerCase();
  const mn = modelName.trim().toLowerCase();
  const mv = modelVariant.trim().toLowerCase();
  return devicesStore.some((d) => {
    const dm = d.manufacturer?.trim().toLowerCase() ?? '';
    const dmn = d.modelName?.trim().toLowerCase() ?? '';
    const dmv = d.modelVariant?.trim().toLowerCase() ?? '';
    return dm === mfr && dmn === mn && dmv === mv;
  });
}

export function getSupportDefinitionDeviceById(id: string): SupportDefinitionDeviceDto | null {
  return devicesStore.find((d) => d.id === id) ?? null;
}

export function patchSupportDefinitionModel(id: string, patch: Partial<Omit<SupportDefinitionModelDto, 'kind' | 'id'>>): void {
  const i = modelsStore.findIndex((m) => m.id === id);
  if (i < 0) return;
  modelsStore[i] = { ...modelsStore[i], ...patch };
}

export function patchSupportDefinitionDevice(id: string, patch: Partial<Omit<SupportDefinitionDeviceDto, 'kind' | 'id'>>): void {
  const i = devicesStore.findIndex((d) => d.id === id);
  if (i < 0) return;
  devicesStore[i] = { ...devicesStore[i], ...patch };
}
