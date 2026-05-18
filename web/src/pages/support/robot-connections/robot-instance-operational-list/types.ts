import type { RobotConnectionStatusRow, RobotEndpointDto } from '../../../../mocks/robotConnectionsMocks';

export type EndpointGridGroup = {
  compositionId: string;
  compositionName: string;
  instances: RobotEndpointDto[];
};

export type GroupOperationalSummary = {
  instanceCount: number;
  connected: number;
  disconnected: number;
  reconnecting: number;
  error: number;
  protocols: string[];
};

export function summarizeEndpointGroup(instances: RobotEndpointDto[]): GroupOperationalSummary {
  let connected = 0;
  let disconnected = 0;
  let reconnecting = 0;
  let error = 0;
  const protocolSet = new Set<string>();
  for (const inst of instances) {
    protocolSet.add(inst.protocol);
    if (inst.status === 'connected') connected += 1;
    else if (inst.status === 'error') error += 1;
    else if (inst.status === 'reconnecting') reconnecting += 1;
    else disconnected += 1;
  }
  return {
    instanceCount: instances.length,
    connected,
    disconnected,
    reconnecting,
    error,
    protocols: [...protocolSet],
  };
}

export type OperationalListContext = {
  statusByEndpointId: Map<string, RobotConnectionStatusRow>;
};
