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
  /** Mount / logical role (e.g. right hand, head camera). */
  deviceRole?: string;
}

export interface SupportCompositionDto {
  id: string;
  /** Human-readable bundle name. */
  name: string;
  subtitle: string;
  projectName: string;
  updatedAt: string;
  model: CompositionModelRef;
  /** Robot Device Model slots (optional). */
  devices: CompositionDeviceRef[];
  /** Plain-language compatibility / deployment constraints (demo). */
  compatibilitySummary: string;
  /** Use catalog model URDF as-is vs register robot-level applied URDF. */
  urdfCompositionMode?: 'model' | 'applied';
  /** Action config key names (dataset / control plane). */
  actionConfigKeys?: string[];
  /** Modality schema identifiers selected for this robot. */
  modalitySchemasSelected?: string[];
  /** Free-text modality ↔ URDF joint mapping notes. */
  modalityUrdfMappingNotes?: string;
}

const COMPOSITIONS_SEED: SupportCompositionDto[] = [
  {
    id: 'cp-amr-nav-stack',
    name: 'Urban AMR — Perception Stack',
    subtitle: 'RFM policy v3 with Velodyne and RealSense.',
    projectName: 'Forge Core',
    updatedAt: '2026-04-14',
    model: { id: 'mdl-rfm-v3', name: 'RFM_Action_Policy_v3' },
    devices: [
      { id: 'dev-lidar-velo', shortName: 'Velodyne VLP-16' },
      { id: 'dev-realsense', shortName: 'RealSense D455' },
    ],
    compatibilitySummary: '',
    urdfCompositionMode: 'model',
    actionConfigKeys: ['pick', 'move_joints', 'gripper_command'],
    modalitySchemasSelected: ['joint_state', 'rgb', 'depth', 'lidar_scan', 'odom'],
    modalityUrdfMappingNotes:
      'rgb → camera_optical_frame; depth aligned to rgb; lidar_scan → velodyne/velodyne; joint_state ↔ arm + base chain.',
  },
  {
    id: 'cp-warehouse-pick',
    name: 'Warehouse Pick Cell — Arm + Grip',
    subtitle: 'Grip classifier head with Schunk gripper.',
    projectName: 'Warehouse Bot',
    updatedAt: '2026-04-13',
    model: { id: 'mdl-grip-pro', name: 'Grip_Classifier_Pro' },
    devices: [{ id: 'dev-gripper-schunk', shortName: 'Schunk EGP-40' }],
    compatibilitySummary: '',
    urdfCompositionMode: 'applied',
    actionConfigKeys: ['pick', 'place', 'gripper_command'],
    modalitySchemasSelected: ['joint_state', 'rgb', 'wrench'],
    modalityUrdfMappingNotes:
      'Applied URDF registers tool0 + gripper_jaw; wrench on ATI FT frame; rgb on wrist_cam_link.',
  },
  {
    id: 'cp-night-drive',
    name: 'Night Drive — Fusion',
    subtitle: 'YOLO detector with RGB-D head.',
    projectName: 'Autonomous Driving',
    updatedAt: '2026-04-12',
    model: { id: 'mdl-yolo', name: 'YOLOv8_Object_Detector' },
    devices: [{ id: 'dev-realsense', shortName: 'RealSense D455' }],
    compatibilitySummary: '',
    urdfCompositionMode: 'model',
    actionConfigKeys: ['move_joints'],
    modalitySchemasSelected: ['rgb', 'depth', 'point_cloud'],
    modalityUrdfMappingNotes: 'rgb/depth on head_cam_link; point_cloud fused in odom frame for night driving stack.',
  },
  {
    id: 'cp-sim-bridge',
    name: 'Sim2Real Bridge — Logistics',
    subtitle: 'Sim2Real bundle with LiDAR and RGB-D.',
    projectName: 'Logistics Bot',
    updatedAt: '2026-04-11',
    model: { id: 'mdl-s2r', name: 'Sim2Real_Bridge_v1' },
    devices: [
      { id: 'dev-lidar-velo', shortName: 'Velodyne VLP-16' },
      { id: 'dev-realsense', shortName: 'RGB-D head' },
    ],
    compatibilitySummary: '',
    urdfCompositionMode: 'model',
    actionConfigKeys: ['pick', 'place', 'move_joints'],
    modalitySchemasSelected: ['joint_state', 'lidar_scan', 'rgb', 'depth', 'cmd_vel'],
    modalityUrdfMappingNotes:
      'Sim bridge: cmd_vel → diff_drive_controller; lidar_scan + rgb/depth bridged to Isaac namespaced topics.',
  },
  {
    id: 'cp-nav-graph',
    name: 'Smart City — Graph Nav',
    subtitle: 'Nav graph transformer with front LiDAR only.',
    projectName: 'Smart City',
    updatedAt: '2026-04-10',
    model: { id: 'mdl-nav-graph', name: 'Nav_Graph_Transformer' },
    devices: [{ id: 'dev-lidar-velo', shortName: 'Velodyne VLP-16' }],
    compatibilitySummary: '',
    urdfCompositionMode: 'model',
    actionConfigKeys: ['move_joints'],
    modalitySchemasSelected: ['lidar_scan', 'odom'],
    modalityUrdfMappingNotes: 'Front LiDAR only: lidar_scan on base_scan; odom from wheel encoders fused in robot_localization.',
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
    compatibilitySummary: '',
    urdfCompositionMode: 'model',
    actionConfigKeys: ['pick', 'place', 'move_joints', 'gripper_command'],
    modalitySchemasSelected: ['joint_state', 'rgb', 'depth', 'tactile'],
    modalityUrdfMappingNotes:
      'Dex teleop: tactile patches mapped to tactile/array_0; rgb on hand_cam; gripper_command → parallel_jaw position.',
  },
  {
    id: 'cp-tactile-stack',
    name: 'Forge Core — Tactile Stack',
    subtitle: 'Tactile encoder with gripper and RGB-D.',
    projectName: 'Forge Core',
    updatedAt: '2026-04-08',
    model: { id: 'mdl-tactile', name: 'Tactile_Encoder_S' },
    devices: [
      { id: 'dev-gripper-schunk', shortName: 'Parallel Gripper' },
      { id: 'dev-realsense', shortName: 'RealSense D455' },
    ],
    compatibilitySummary: '',
    urdfCompositionMode: 'model',
    actionConfigKeys: ['pick', 'gripper_command'],
    modalitySchemasSelected: ['joint_state', 'rgb', 'tactile', 'wrench'],
    modalityUrdfMappingNotes:
      'Tactile encoder streams on /tactile/raw; wrench on wrist_ft; rgb for slip detection overlay on tactile patches.',
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

export function patchSupportComposition(id: string, patch: Partial<Pick<SupportCompositionDto, 'name' | 'subtitle' | 'projectName' | 'compatibilitySummary' | 'updatedAt'>>): void {
  const i = compositionsStore.findIndex((c) => c.id === id);
  if (i < 0) return;
  const today = new Date().toISOString().slice(0, 10);
  compositionsStore[i] = {
    ...compositionsStore[i],
    ...patch,
    updatedAt: patch.updatedAt ?? today,
  };
}
