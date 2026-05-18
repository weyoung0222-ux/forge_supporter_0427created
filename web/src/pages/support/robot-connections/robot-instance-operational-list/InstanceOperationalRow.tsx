import { MoreOutlined } from '@ant-design/icons';
import { Button, Dropdown, Tag, Typography } from 'antd';
import type { MenuProps } from 'antd';
import type { RobotEndpointDto, RobotEndpointProtocol } from '../../../../mocks/robotConnectionsMocks';
import { HealthIndicator } from './HealthIndicator';
import { StatusBadge } from './StatusBadge';
import type { OperationalListContext } from './types';

const STATUS_BAR_CLASS: Record<RobotEndpointDto['status'], string> = {
  connected: 'robot-op-row__bar--connected',
  disconnected: 'robot-op-row__bar--disconnected',
  reconnecting: 'robot-op-row__bar--reconnecting',
  error: 'robot-op-row__bar--error',
};

function protocolTagClass(p: RobotEndpointProtocol) {
  if (p === 'ROS') return 'robot-op-row__protocol--ros';
  if (p === 'TCP') return 'robot-op-row__protocol--tcp';
  return 'robot-op-row__protocol--http';
}

type PrimaryAction =
  | { kind: 'connect'; label: string }
  | { kind: 'disconnect'; label: string }
  | { kind: 'reconnect'; label: string };

function primaryActionForStatus(
  status: RobotEndpointDto['status'],
  labels: { connect: string; disconnect: string; reconnect: string },
): PrimaryAction {
  if (status === 'connected') return { kind: 'disconnect', label: labels.disconnect };
  if (status === 'error' || status === 'reconnecting') return { kind: 'reconnect', label: labels.reconnect };
  return { kind: 'connect', label: labels.connect };
}

export interface InstanceOperationalRowProps extends OperationalListContext {
  instance: RobotEndpointDto;
  statusLabel: (s: RobotEndpointDto['status']) => string;
  colStatus: string;
  colEndpoint: string;
  colProtocol: string;
  colLatency: string;
  colHealth: string;
  colLastCheck: string;
  connectLabel: string;
  disconnectLabel: string;
  reconnectLabel: string;
  menuAria: string;
  onOpen: () => void;
  onConnect: () => void;
  onDisconnect: () => void;
  onReconnect: () => void;
  menu: MenuProps;
}

export function InstanceOperationalRow({
  instance,
  statusByEndpointId,
  statusLabel,
  colStatus,
  colEndpoint,
  colProtocol,
  colLatency,
  colHealth,
  colLastCheck,
  connectLabel,
  disconnectLabel,
  reconnectLabel,
  menuAria,
  onOpen,
  onConnect,
  onDisconnect,
  onReconnect,
  menu,
}: InstanceOperationalRowProps) {
  const sr = statusByEndpointId.get(instance.id);
  const latencyMs = sr?.latencyMs ?? instance.latencyMs;
  const lastCheck = sr?.lastCheckAt ?? instance.lastSeenAt;
  const primary = primaryActionForStatus(instance.status, {
    connect: connectLabel,
    disconnect: disconnectLabel,
    reconnect: reconnectLabel,
  });

  const onPrimaryClick = () => {
    if (primary.kind === 'connect') onConnect();
    else if (primary.kind === 'disconnect') onDisconnect();
    else onReconnect();
  };

  const primaryButtonType = primary.kind === 'connect' ? 'primary' : 'default';

  return (
    <div
      className={`robot-op-row robot-op-row--${instance.status}`}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      <div className="robot-op-row__primary">
        <span className={`robot-op-row__bar ${STATUS_BAR_CLASS[instance.status]}`} aria-hidden />
        <div className="robot-op-row__identity">
          <Typography.Text strong className="robot-op-row__name" ellipsis>
            {instance.name}
          </Typography.Text>
        </div>
      </div>

      <div className="robot-op-row__metrics" aria-label={instance.name}>
        <div className="robot-op-row__metric" data-label={colStatus}>
          <span className="robot-op-row__metric-label">{colStatus}</span>
          <StatusBadge status={instance.status} label={statusLabel(instance.status)} />
        </div>
        <div className="robot-op-row__metric" data-label={colEndpoint}>
          <span className="robot-op-row__metric-label">{colEndpoint}</span>
          <Typography.Text code className="robot-op-row__endpoint" title={`${instance.ipAddress}:${instance.port}`}>
            {instance.ipAddress}:{instance.port}
          </Typography.Text>
        </div>
        <div className="robot-op-row__metric" data-label={colProtocol}>
          <span className="robot-op-row__metric-label">{colProtocol}</span>
          <Tag bordered={false} className={`robot-op-row__protocol ${protocolTagClass(instance.protocol)}`}>
            {instance.protocol}
          </Tag>
        </div>
        <div className="robot-op-row__metric" data-label={colLatency}>
          <span className="robot-op-row__metric-label">{colLatency}</span>
          <Typography.Text type="secondary" className="robot-op-row__metric-value">
            {latencyMs > 0 ? `${latencyMs} ms` : '—'}
          </Typography.Text>
        </div>
        <div className="robot-op-row__metric" data-label={colHealth}>
          <span className="robot-op-row__metric-label">{colHealth}</span>
          <HealthIndicator score={sr?.healthScore} />
        </div>
        <div className="robot-op-row__metric robot-op-row__metric--wide" data-label={colLastCheck}>
          <span className="robot-op-row__metric-label">{colLastCheck}</span>
          <Typography.Text type="secondary" className="robot-op-row__metric-value" title={lastCheck}>
            {lastCheck}
          </Typography.Text>
        </div>
      </div>

      <div className="robot-op-row__actions" onClick={(e) => e.stopPropagation()} role="presentation">
        <Button
          size="small"
          type={primaryButtonType}
          className="robot-op-row__action-primary"
          onClick={onPrimaryClick}
        >
          {primary.label}
        </Button>
        <Dropdown menu={menu} trigger={['click']} placement="bottomRight">
          <Button type="text" size="small" icon={<MoreOutlined />} className="robot-op-row__menu" aria-label={menuAria} />
        </Dropdown>
      </div>
    </div>
  );
}
