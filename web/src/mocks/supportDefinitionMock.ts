/**
 * Support — Robot Definition (Models / Devices) mock list.
 * Naming and fields follow the Dev Library / MODEL_ITEMS wireframe style (Forge catalog).
 */

export interface SupportDefinitionModelDto {
  kind: 'model';
  id: string;
  name: string;
  version: string;
  /** Same vocabulary as Dev Library model cards (filter label). */
  source: 'Local' | 'Upload' | 'Simulation' | 'Training' | 'Registry';
  projectName: string;
  subtitle: string;
  updatedAt: string;
}

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
}

export type SupportDefinitionCardDto = SupportDefinitionModelDto | SupportDefinitionDeviceDto;

const MODELS_SEED: SupportDefinitionModelDto[] = [
  {
    kind: 'model',
    id: 'mdl-rfm-v3',
    name: 'RFM_Action_Policy_v3',
    version: 'checkpoint r3.2',
    source: 'Registry',
    projectName: 'Forge Core',
    subtitle: 'Residual foundation policy — Urban Navigation Pilot',
    updatedAt: '2026-04-14',
  },
  {
    kind: 'model',
    id: 'mdl-wm-sm',
    name: 'World_Model_Small',
    version: 'latent-256',
    source: 'Training',
    projectName: 'Sim Lab',
    subtitle: 'WM rollout predictor for simulation bundles',
    updatedAt: '2026-04-13',
  },
  {
    kind: 'model',
    id: 'mdl-yolo',
    name: 'YOLOv8_Object_Detector',
    version: 'export onnx',
    source: 'Training',
    projectName: 'Autonomous Driving',
    subtitle: 'Real-time detection head — Night Drive Corpus',
    updatedAt: '2026-04-12',
  },
  {
    kind: 'model',
    id: 'mdl-grip-pro',
    name: 'Grip_Classifier_Pro',
    version: 'v1.4.0',
    source: 'Upload',
    projectName: 'Warehouse Bot',
    subtitle: 'Multi-class grasp quality — Warehouse Pick v2',
    updatedAt: '2026-04-11',
  },
  {
    kind: 'model',
    id: 'mdl-dex-ft',
    name: 'Dex_Policy_FT',
    version: 'teleop-ft-02',
    source: 'Local',
    projectName: 'Dev Sandbox',
    subtitle: 'Fine-tuned dexterous policy from human demos',
    updatedAt: '2026-04-10',
  },
  {
    kind: 'model',
    id: 'mdl-nav-graph',
    name: 'Nav_Graph_Transformer',
    version: 'v0.8.1',
    source: 'Simulation',
    projectName: 'Smart City',
    subtitle: 'Topology-aware routing — Traffic Sign Dataset lineage',
    updatedAt: '2026-04-09',
  },
  {
    kind: 'model',
    id: 'mdl-s2r',
    name: 'Sim2Real_Bridge_v1',
    version: 'calib bundle',
    source: 'Simulation',
    projectName: 'Logistics Bot',
    subtitle: 'Domain bridge for RGB-D assembly cells',
    updatedAt: '2026-04-08',
  },
  {
    kind: 'model',
    id: 'mdl-tactile',
    name: 'Tactile_Encoder_S',
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
    version: 'SN-LDR-77821',
    deviceClass: 'Sensing',
    equipmentKind: 'LiDAR',
    equipmentSummary: '360° spinning LiDAR · roof mount · perception stack ingress on RFM topic `/scan_front`',
    projectName: 'Urban Navigation Pilot',
    subtitle: 'Roof mount · 360° scan · AMR-200 fleet',
    updatedAt: '2026-04-14',
  },
  {
    kind: 'device',
    id: 'dev-gripper-schunk',
    name: 'Schunk_EGP-40_Parallel',
    version: 'SKU-GRP-11',
    deviceClass: 'Manipulation',
    equipmentKind: 'Gripper / handle',
    equipmentSummary: 'Parallel-jaw end effector · TCP on tool0 · EtherCAT tool bus · used as manipulation handle in teleop bundles',
    projectName: 'Warehouse Pick v2',
    subtitle: 'Bay 3 line — pick-place station',
    updatedAt: '2026-04-13',
  },
  {
    kind: 'device',
    id: 'dev-imu-lord',
    name: 'Lord_MicroStrain_IMU',
    version: 'MS-3DM-GX5-25',
    deviceClass: 'Sensing',
    equipmentKind: 'IMU',
    equipmentSummary: '6-axis IMU + attitude reference · chassis-mounted · fused in RFM state estimator (dummy)',
    projectName: 'Autonomous Driving',
    subtitle: 'Chassis frame · ego-motion fusion',
    updatedAt: '2026-04-12',
  },
  {
    kind: 'device',
    id: 'dev-amr-base',
    name: 'AMR-200_Diff_Drive_Base',
    version: 'hw rev C',
    deviceClass: 'Locomotion',
    equipmentKind: 'Mobile base',
    equipmentSummary: 'Differential drive platform · motor controllers + BMS · odometry frame `base_footprint` in RFM graph',
    projectName: 'Logistics Bot',
    subtitle: 'Differential drive · LiFePO4 pack',
    updatedAt: '2026-04-11',
  },
  {
    kind: 'device',
    id: 'dev-realsense',
    name: 'Intel_RealSense_D455_Head',
    version: 'SKU-CAM-04',
    deviceClass: 'Sensing',
    equipmentKind: 'RGB-D camera',
    equipmentSummary: 'Stereo depth + RGB head camera · USB3 · extrinsics to tool0 published in RFM calibration bundle',
    projectName: 'Dev Sandbox',
    subtitle: 'RGB-D head mount · calibration 2026-Q1',
    updatedAt: '2026-04-10',
  },
  {
    kind: 'device',
    id: 'dev-edge-orin',
    name: 'NVIDIA_Jetson_ORIN_NX',
    version: '8GB · JetPack 6',
    deviceClass: 'Compute',
    equipmentKind: 'Edge compute',
    equipmentSummary: 'On-robot GPU runtime · hosts perception + policy containers · RFM edge profile `orin-nx-8g`',
    projectName: 'Forge Core',
    subtitle: 'On-robot perception + policy runtime',
    updatedAt: '2026-04-09',
  },
  {
    kind: 'device',
    id: 'dev-six-axis',
    name: 'UR5e_Arm_Controller',
    version: 'CB3 · polyscope 5.14',
    deviceClass: 'Manipulation',
    equipmentKind: 'Arm controller',
    equipmentSummary: '6-axis cobot controller box · safety planes + reduced mode · RFM driver exposes joint_states + trajectory topics',
    projectName: 'Warehouse Bot',
    subtitle: 'Cobot station — safety plane configured',
    updatedAt: '2026-04-08',
  },
  {
    kind: 'device',
    id: 'dev-wheel-encoder',
    name: 'Wheel_Encoder_Hub_FL',
    version: 'mag-2048',
    deviceClass: 'Locomotion',
    equipmentKind: 'Wheel encoder',
    equipmentSummary: 'Quadrature encoder hub · front-left wheel · CAN id 0x31 · feeds RFM odometry fusion node',
    projectName: 'Smart City',
    subtitle: 'Front-left odometry — CAN bus',
    updatedAt: '2026-04-07',
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

export function getSupportDefinitionDeviceById(id: string): SupportDefinitionDeviceDto | null {
  return devicesStore.find((d) => d.id === id) ?? null;
}
