/** Robot Support — Robot instance registrations + per-instance connection status (demo store). */

export type RobotEndpointProtocol = 'ROS' | 'TCP' | 'HTTP';
export type RobotAuthType = 'none' | 'token' | 'key';
/** Per-instance link / session status (connected to a registered robot instance record). */
export type RobotEndpointConnectionStatus = 'connected' | 'disconnected' | 'error' | 'reconnecting';

export interface RobotEndpointDto {
  id: string;
  /** Display name for the robot instance (glossary: Robot Instance — operational label). */
  name: string;
  /** Deployed from this composition (Definition). Required at creation. */
  compositionId: string;
  compositionName: string;
  /** Glossary: Robot Model — catalog model this instance is based on. */
  robotModelName: string;
  /** Glossary: Robot Instance — serial or asset tag for the physical unit. */
  serialNumber: string;
  description: string;
  ipAddress: string;
  port: number;
  protocol: RobotEndpointProtocol;
  status: RobotEndpointConnectionStatus;
  /** Last observed RTT when connected / reconnecting; 0 when idle. */
  latencyMs: number;
  updatedAt: string;
  createdAt: string;
  authType: RobotAuthType;
  tokenOrKey: string;
  allowedIps: string;
  timeoutSec: number;
  /** Last time the control plane observed traffic / heartbeat (demo). */
  lastSeenAt: string;
}

/** Unified table: one row per deployed robot instance with live connection summary. */
export interface RobotConnectionStatusRow {
  id: string;
  /** Robot instance display (name / site label). */
  robotName: string;
  /** FK to `RobotEndpointDto.id` (instance registration id in demo). */
  endpointId: string;
  /** Instance + connection target (shown in status table). */
  endpointDisplay: string;
  protocol: RobotEndpointProtocol;
  status: RobotEndpointConnectionStatus;
  latencyMs: number;
  lastCheckAt: string;
  healthScore: number;
}

export type HealthCheckVerdict = 'success' | 'warning' | 'error';

export interface HealthCheckResultRow {
  robotName: string;
  endpointId: string;
  endpointLabel: string;
  verdict: HealthCheckVerdict;
  detailKey: string;
}

const ENDPOINTS_SEED: RobotEndpointDto[] = [
  {
    id: 'rb-ep-arm-a',
    name: 'Line 1 — Arm cell A',
    compositionId: 'cp-warehouse-pick',
    compositionName: 'Warehouse Pick Cell — Arm + Grip',
    /** Catalog Robot Model name (aligned with Support composition `model.name`). */
    robotModelName: 'Grip_Classifier_Pro',
    serialNumber: 'UR10e-2019-4412',
    description: 'Primary manipulation cell, ROS 2 bridge.',
    ipAddress: '10.0.12.40',
    port: 11311,
    protocol: 'ROS',
    status: 'connected',
    latencyMs: 14,
    updatedAt: '2026-04-18',
    createdAt: '2026-03-01',
    authType: 'token',
    tokenOrKey: '••••••••',
    allowedIps: '10.0.0.0/8\n192.168.1.0/24',
    timeoutSec: 30,
    lastSeenAt: '2026-04-20 09:14:22',
  },
  {
    id: 'rb-ep-amr-dock',
    name: 'Dock 2 — MiR200',
    compositionId: 'cp-amr-nav-stack',
    compositionName: 'Urban AMR — Perception Stack',
    robotModelName: 'RFM_Action_Policy_v3',
    serialNumber: 'MIR-200-DK-7781',
    description: 'Fleet charger and status stream.',
    ipAddress: '192.168.4.2',
    port: 5020,
    protocol: 'TCP',
    status: 'reconnecting',
    latencyMs: 240,
    updatedAt: '2026-04-17',
    createdAt: '2026-02-14',
    authType: 'none',
    tokenOrKey: '',
    allowedIps: '192.168.4.0/24',
    timeoutSec: 15,
    lastSeenAt: '2026-04-20 08:59:41',
  },
  {
    id: 'rb-ep-api-gateway',
    name: 'Rig C — Telemetry edge',
    compositionId: 'cp-night-drive',
    compositionName: 'Night Drive — Fusion',
    robotModelName: 'YOLOv8_Object_Detector',
    serialNumber: 'SENS-RIG-C-009',
    description: 'REST ingest for lightweight sensors.',
    ipAddress: '172.16.8.90',
    port: 8443,
    protocol: 'HTTP',
    status: 'connected',
    latencyMs: 28,
    updatedAt: '2026-04-16',
    createdAt: '2026-01-20',
    authType: 'key',
    tokenOrKey: '••••••••',
    allowedIps: '',
    timeoutSec: 60,
    lastSeenAt: '2026-04-20 08:59:56',
  },
  {
    id: 'rb-ep-lab-b',
    name: 'Lab bench B',
    compositionId: 'cp-warehouse-pick',
    compositionName: 'Warehouse Pick Cell — Arm + Grip',
    robotModelName: 'Grip_Classifier_Pro',
    serialNumber: 'FR3-LAB-003',
    description: 'Secondary test bench.',
    ipAddress: '10.0.12.55',
    port: 11312,
    protocol: 'ROS',
    status: 'error',
    latencyMs: 0,
    updatedAt: '2026-04-10',
    createdAt: '2026-04-01',
    authType: 'token',
    tokenOrKey: '••••••••',
    allowedIps: '10.0.12.0/24',
    timeoutSec: 45,
    lastSeenAt: '2026-04-19 16:02:10',
  },
];

let endpointsStore: RobotEndpointDto[] = ENDPOINTS_SEED.map((e) => ({ ...e }));

const CONNECTION_STATUS_SEED: RobotConnectionStatusRow[] = [
  {
    id: 'cs-1',
    robotName: 'Line 1 — Arm cell A',
    endpointId: 'rb-ep-arm-a',
    endpointDisplay: 'UR10e-2019-4412 · ROS\n10.0.12.40:11311',
    protocol: 'ROS',
    status: 'connected',
    latencyMs: 12,
    lastCheckAt: '2026-04-20 09:00:02',
    healthScore: 98,
  },
  {
    id: 'cs-2',
    robotName: 'Dock 2 — MiR200',
    endpointId: 'rb-ep-amr-dock',
    endpointDisplay: 'MIR-200-DK-7781 · TCP\n192.168.4.2:5020',
    protocol: 'TCP',
    status: 'reconnecting',
    latencyMs: 240,
    lastCheckAt: '2026-04-20 08:59:40',
    healthScore: 42,
  },
  {
    id: 'cs-3',
    robotName: 'Rig C — Telemetry edge',
    endpointId: 'rb-ep-api-gateway',
    endpointDisplay: 'SENS-RIG-C-009 · HTTP\n172.16.8.90:8443',
    protocol: 'HTTP',
    status: 'connected',
    latencyMs: 31,
    lastCheckAt: '2026-04-20 08:59:55',
    healthScore: 91,
  },
  {
    id: 'cs-4',
    robotName: 'Lab bench B',
    endpointId: 'rb-ep-lab-b',
    endpointDisplay: 'FR3-LAB-003 · ROS\n10.0.12.55:11312',
    protocol: 'ROS',
    status: 'error',
    latencyMs: 0,
    lastCheckAt: '2026-04-20 08:45:00',
    healthScore: 55,
  },
];

let connectionStatusStore: RobotConnectionStatusRow[] = CONNECTION_STATUS_SEED.map((r) => ({ ...r }));

export function formatDemoDateTime(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

export function getRobotEndpointsMock(): RobotEndpointDto[] {
  return endpointsStore.map((e) => ({ ...e }));
}

export function getRobotEndpointById(id: string): RobotEndpointDto | null {
  const row = endpointsStore.find((e) => e.id === id);
  return row ? { ...row } : null;
}

export function prependRobotEndpoint(row: RobotEndpointDto): void {
  endpointsStore = [row, ...endpointsStore];
  const target = `${row.serialNumber} · ${row.protocol}\n${row.ipAddress}:${row.port}`;
  connectionStatusStore = [
    {
      id: `cs-${row.id}`,
      robotName: row.name,
      endpointId: row.id,
      endpointDisplay: target,
      protocol: row.protocol,
      status: row.status,
      latencyMs: row.latencyMs,
      lastCheckAt: row.lastSeenAt,
      healthScore: 80,
    },
    ...connectionStatusStore,
  ];
}

export function upsertRobotEndpoint(row: RobotEndpointDto): void {
  const i = endpointsStore.findIndex((e) => e.id === row.id);
  if (i >= 0) {
    endpointsStore = [...endpointsStore.slice(0, i), row, ...endpointsStore.slice(i + 1)];
  } else {
    endpointsStore = [row, ...endpointsStore];
  }
}

export function deleteRobotEndpoint(id: string): void {
  endpointsStore = endpointsStore.filter((e) => e.id !== id);
  connectionStatusStore = connectionStatusStore.filter((r) => r.endpointId !== id);
}

export function getRobotConnectionStatusTableMock(): RobotConnectionStatusRow[] {
  return connectionStatusStore.map((r) => ({ ...r }));
}

export function patchConnectionStatusRow(id: string, patch: Partial<RobotConnectionStatusRow>): void {
  connectionStatusStore = connectionStatusStore.map((r) => (r.id === id ? { ...r, ...patch } : r));
}

export function patchConnectionStatusRowByEndpointId(endpointId: string, patch: Partial<RobotConnectionStatusRow>): void {
  connectionStatusStore = connectionStatusStore.map((r) => (r.endpointId === endpointId ? { ...r, ...patch } : r));
}

/** Demo: refresh health row + bump endpoint last seen for one instance. */
export function runHealthCheckForEndpointDemo(endpointId: string): void {
  const stamp = formatDemoDateTime();
  const h = connectionStatusStore.find((r) => r.endpointId === endpointId);
  if (h) {
    const nextScore = Math.min(100, Math.max(20, h.healthScore + Math.floor(Math.random() * 11) - 5));
    patchConnectionStatusRowByEndpointId(endpointId, {
      lastCheckAt: stamp,
      healthScore: nextScore,
      status: h.status,
      latencyMs: h.latencyMs > 0 ? Math.max(8, h.latencyMs + Math.floor(Math.random() * 7) - 3) : h.latencyMs,
    });
  }
  const ep = endpointsStore.find((e) => e.id === endpointId);
  if (ep) {
    upsertRobotEndpoint({ ...ep, lastSeenAt: stamp });
  }
}

/** Keep unified status table in sync with instance registration + connection fields (demo). */
export function syncConnectionStatusFromEndpoint(endpointId: string): void {
  const ep = endpointsStore.find((e) => e.id === endpointId);
  if (!ep) return;
  const target = `${ep.serialNumber} · ${ep.protocol}\n${ep.ipAddress}:${ep.port}`;
  patchConnectionStatusRowByEndpointId(endpointId, {
    robotName: ep.name,
    protocol: ep.protocol,
    status: ep.status,
    latencyMs: ep.latencyMs,
    endpointDisplay: target,
    lastCheckAt: ep.lastSeenAt,
  });
}

export function runRobotHealthCheckMock(): void {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  connectionStatusStore = connectionStatusStore.map((h) => ({
    ...h,
    lastCheckAt: stamp,
    healthScore: Math.min(100, Math.max(20, h.healthScore + Math.floor(Math.random() * 11) - 5)),
  }));
}

export function tickRobotHealthAutoRefreshMock(): void {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  connectionStatusStore = connectionStatusStore.map((h) => ({
    ...h,
    lastCheckAt: stamp,
  }));
}

/** Derive per-robot verdict for Health Check Result modal (demo). */
export function buildHealthCheckResults(rows: RobotConnectionStatusRow[]): HealthCheckResultRow[] {
  return rows.map((h) => {
    let verdict: HealthCheckVerdict = 'success';
    let detailKey = 'support.robot.connections.healthResult.detail.ok';
    if (h.status === 'error') {
      verdict = 'error';
      detailKey = 'support.robot.connections.healthResult.detail.error';
    } else if (h.status === 'disconnected' || h.status === 'reconnecting' || h.healthScore < 70) {
      verdict = 'warning';
      detailKey = 'support.robot.connections.healthResult.detail.warn';
    }
    return {
      robotName: h.robotName,
      endpointId: h.endpointId,
      endpointLabel: h.endpointDisplay.replace('\n', ' — '),
      verdict,
      detailKey,
    };
  });
}
