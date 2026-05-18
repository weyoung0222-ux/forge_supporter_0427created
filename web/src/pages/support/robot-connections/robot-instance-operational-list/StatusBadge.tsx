import { Tag } from 'antd';
import type { RobotEndpointDto } from '../../../../mocks/robotConnectionsMocks';

export type ConnectionStatus = RobotEndpointDto['status'];

const STATUS_CLASS: Record<ConnectionStatus, string> = {
  connected: 'robot-op-status-badge--connected',
  disconnected: 'robot-op-status-badge--disconnected',
  reconnecting: 'robot-op-status-badge--reconnecting',
  error: 'robot-op-status-badge--error',
};

export interface StatusBadgeProps {
  status: ConnectionStatus;
  label: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <Tag bordered={false} className={`robot-op-status-badge ${STATUS_CLASS[status]}`}>
      {label}
    </Tag>
  );
}
