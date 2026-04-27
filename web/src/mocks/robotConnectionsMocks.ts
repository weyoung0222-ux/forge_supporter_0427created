/** Robot Support — Connections mock data (endpoints + unified connection status table). */

export type RobotEndpointProtocol = 'ROS' | 'TCP' | 'HTTP';
export type RobotAuthType = 'none' | 'token' | 'key';
/** Endpoint catalog + live link status (session absorbed into status vocabulary). */
export type RobotEndpointConnectionStatus = 'connected' | 'disconnected' | 'error' | 'reconnecting';

export interface RobotEndpointDto {
  id: string;
  name: string;
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
}

/** Unified Connection Status table row (replaces separate Sessions + Health lists). */
export interface RobotConnectionStatusRow {
  id: string;
  robotName: string;
  endpointId: string;
  /** Shown in Robot / Endpoint column (name + address). */
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
    name: 'Arm cell A — ROS',
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
  },
  {
    id: 'rb-ep-amr-dock',
    name: 'AMR dock TCP',
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
  },
  {
    id: 'rb-ep-api-gateway',
    name: 'HTTP telemetry gateway',
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
  },
  {
    id: 'rb-ep-lab-b',
    name: 'Lab robot B',
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
  },
];

let endpointsStore: RobotEndpointDto[] = ENDPOINTS_SEED.map((e) => ({ ...e }));

const CONNECTION_STATUS_SEED: RobotConnectionStatusRow[] = [
  {
    id: 'cs-1',
    robotName: 'UR10e — Line 1',
    endpointId: 'rb-ep-arm-a',
    endpointDisplay: 'Arm cell A — ROS\n10.0.12.40:11311',
    protocol: 'ROS',
    status: 'connected',
    latencyMs: 12,
    lastCheckAt: '2026-04-20 09:00:02',
    healthScore: 98,
  },
  {
    id: 'cs-2',
    robotName: 'MiR200 — Dock 2',
    endpointId: 'rb-ep-amr-dock',
    endpointDisplay: 'AMR dock TCP\n192.168.4.2:5020',
    protocol: 'TCP',
    status: 'reconnecting',
    latencyMs: 240,
    lastCheckAt: '2026-04-20 08:59:40',
    healthScore: 42,
  },
  {
    id: 'cs-3',
    robotName: 'Sensor rig C',
    endpointId: 'rb-ep-api-gateway',
    endpointDisplay: 'HTTP telemetry gateway\n172.16.8.90:8443',
    protocol: 'HTTP',
    status: 'connected',
    latencyMs: 31,
    lastCheckAt: '2026-04-20 08:59:55',
    healthScore: 91,
  },
  {
    id: 'cs-4',
    robotName: 'Legacy arm',
    endpointId: 'rb-ep-lab-b',
    endpointDisplay: 'Lab robot B\n10.0.12.55:11312',
    protocol: 'ROS',
    status: 'error',
    latencyMs: 0,
    lastCheckAt: '2026-04-20 08:45:00',
    healthScore: 55,
  },
];

let connectionStatusStore: RobotConnectionStatusRow[] = CONNECTION_STATUS_SEED.map((r) => ({ ...r }));

export function getRobotEndpointsMock(): RobotEndpointDto[] {
  return endpointsStore.map((e) => ({ ...e }));
}

export function getRobotEndpointById(id: string): RobotEndpointDto | null {
  const row = endpointsStore.find((e) => e.id === id);
  return row ? { ...row } : null;
}

export function prependRobotEndpoint(row: RobotEndpointDto): void {
  endpointsStore = [row, ...endpointsStore];
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

/** Keep unified status table in sync with endpoint catalog (demo). */
export function syncConnectionStatusFromEndpoint(endpointId: string): void {
  const ep = endpointsStore.find((e) => e.id === endpointId);
  if (!ep) return;
  patchConnectionStatusRowByEndpointId(endpointId, {
    protocol: ep.protocol,
    status: ep.status,
    latencyMs: ep.latencyMs,
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
