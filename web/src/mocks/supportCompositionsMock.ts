/**
 * Support — Compositions: 1 model + 1..N devices per bundle (Forge catalog–style names).
 */

export interface CompositionModelRef {
  id: string;
  name: string;
}

export interface CompositionDeviceRef {
  id: string;
  shortName: string;
}

export interface SupportCompositionDto {
  id: string;
  /** Human-readable bundle name. */
  name: string;
  subtitle: string;
  projectName: string;
  updatedAt: string;
  model: CompositionModelRef;
  /** At least one device. */
  devices: CompositionDeviceRef[];
}

const COMPOSITIONS_SEED: SupportCompositionDto[] = [
  {
    id: 'cp-amr-nav-stack',
    name: 'Urban AMR — Perception Stack',
    subtitle: 'RFM policy v3 with Velodyne + RealSense + Jetson runtime.',
    projectName: 'Forge Core',
    updatedAt: '2026-04-14',
    model: { id: 'mdl-rfm-v3', name: 'RFM_Action_Policy_v3' },
    devices: [
      { id: 'dev-lidar-velo', shortName: 'Velodyne VLP-16' },
      { id: 'dev-realsense', shortName: 'RealSense D455' },
      { id: 'dev-edge-orin', shortName: 'Jetson ORIN NX' },
    ],
  },
  {
    id: 'cp-warehouse-pick',
    name: 'Warehouse Pick Cell — Arm + Grip',
    subtitle: 'Grip classifier head with Schunk gripper and UR5e controller.',
    projectName: 'Warehouse Bot',
    updatedAt: '2026-04-13',
    model: { id: 'mdl-grip-pro', name: 'Grip_Classifier_Pro' },
    devices: [
      { id: 'dev-gripper-schunk', shortName: 'Schunk EGP-40' },
      { id: 'dev-six-axis', shortName: 'UR5e Arm' },
    ],
  },
  {
    id: 'cp-night-drive',
    name: 'Night Drive — Fusion',
    subtitle: 'YOLO detector + Lord IMU for ego-motion.',
    projectName: 'Autonomous Driving',
    updatedAt: '2026-04-12',
    model: { id: 'mdl-yolo', name: 'YOLOv8_Object_Detector' },
    devices: [{ id: 'dev-imu-lord', shortName: 'Lord IMU' }],
  },
  {
    id: 'cp-sim-bridge',
    name: 'Sim2Real Bridge — Logistics',
    subtitle: 'Sim2Real bundle with AMR base and wheel encoders.',
    projectName: 'Logistics Bot',
    updatedAt: '2026-04-11',
    model: { id: 'mdl-s2r', name: 'Sim2Real_Bridge_v1' },
    devices: [
      { id: 'dev-amr-base', shortName: 'AMR-200 Base' },
      { id: 'dev-wheel-encoder', shortName: 'Wheel Encoder FL' },
      { id: 'dev-lidar-velo', shortName: 'Velodyne VLP-16' },
      { id: 'dev-realsense', shortName: 'RGB-D head' },
    ],
  },
  {
    id: 'cp-nav-graph',
    name: 'Smart City — Graph Nav',
    subtitle: 'Nav graph transformer with front LiDAR only.',
    projectName: 'Smart City',
    updatedAt: '2026-04-10',
    model: { id: 'mdl-nav-graph', name: 'Nav_Graph_Transformer' },
    devices: [{ id: 'dev-lidar-velo', shortName: 'Velodyne VLP-16' }],
  },
  {
    id: 'cp-dex-teleop',
    name: 'Dev Sandbox — Dex Teleop',
    subtitle: 'Dex policy FT with parallel gripper.',
    projectName: 'Dev Sandbox',
    updatedAt: '2026-04-09',
    model: { id: 'mdl-dex-ft', name: 'Dex_Policy_FT' },
    devices: [
      { id: 'dev-gripper-schunk', shortName: 'Parallel Gripper' },
      { id: 'dev-realsense', shortName: 'RealSense D455' },
    ],
  },
  {
    id: 'cp-tactile-stack',
    name: 'Forge Core — Tactile Stack',
    subtitle: 'Tactile encoder with compute module.',
    projectName: 'Forge Core',
    updatedAt: '2026-04-08',
    model: { id: 'mdl-tactile', name: 'Tactile_Encoder_S' },
    devices: [
      { id: 'dev-edge-orin', shortName: 'Jetson ORIN NX' },
      { id: 'dev-imu-lord', shortName: 'Lord IMU' },
    ],
  },
];

let compositionsStore: SupportCompositionDto[] = COMPOSITIONS_SEED.map((c) => ({
  ...c,
  model: { ...c.model },
  devices: c.devices.map((d) => ({ ...d })),
}));

export function getSupportCompositionsMock(): SupportCompositionDto[] {
  return compositionsStore.map((c) => ({
    ...c,
    model: { ...c.model },
    devices: c.devices.map((d) => ({ ...d })),
  }));
}

export function prependSupportComposition(row: SupportCompositionDto): void {
  compositionsStore = [
    {
      ...row,
      model: { ...row.model },
      devices: row.devices.map((d) => ({ ...d })),
    },
    ...compositionsStore,
  ];
}
