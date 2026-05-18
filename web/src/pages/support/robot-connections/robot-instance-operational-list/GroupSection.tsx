import type { MenuProps } from 'antd';
import type { RobotEndpointDto } from '../../../../mocks/robotConnectionsMocks';
import { GroupHeader } from './GroupHeader';
import { InstanceOperationalRow } from './InstanceOperationalRow';
import type { EndpointGridGroup, OperationalListContext } from './types';
import { summarizeEndpointGroup } from './types';

export interface GroupSectionProps extends OperationalListContext {
  group: EndpointGridGroup;
  expanded: boolean;
  onToggle: () => void;
  buildSummaryLine: (summary: ReturnType<typeof summarizeEndpointGroup>) => string;
  protocolLabel: string;
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
  onOpenInstance: (id: string) => void;
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
  onReconnect: (id: string) => void;
  menuForInstance: (row: RobotEndpointDto) => MenuProps;
}

export function GroupSection({
  group,
  expanded,
  onToggle,
  buildSummaryLine,
  protocolLabel,
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
  statusByEndpointId,
  onOpenInstance,
  onConnect,
  onDisconnect,
  onReconnect,
  menuForInstance,
}: GroupSectionProps) {
  const summary = summarizeEndpointGroup(group.instances);

  return (
    <section className="robot-op-group-section" aria-label={group.compositionName}>
      <div className="robot-op-group-section__header-sticky">
        <GroupHeader
          robotName={group.compositionName}
          summary={summary}
          expanded={expanded}
          onToggle={onToggle}
          summaryLine={buildSummaryLine(summary)}
          protocolLabel={protocolLabel}
        />
      </div>
      <div className={`robot-op-group-section__body ${expanded ? 'is-expanded' : 'is-collapsed'}`}>
        <div className="robot-op-group-section__body-inner">
          {group.instances.map((inst) => (
            <InstanceOperationalRow
              key={inst.id}
              instance={inst}
              statusByEndpointId={statusByEndpointId}
              statusLabel={statusLabel}
              colStatus={colStatus}
              colEndpoint={colEndpoint}
              colProtocol={colProtocol}
              colLatency={colLatency}
              colHealth={colHealth}
              colLastCheck={colLastCheck}
              connectLabel={connectLabel}
              disconnectLabel={disconnectLabel}
              reconnectLabel={reconnectLabel}
              menuAria={menuAria}
              onOpen={() => onOpenInstance(inst.id)}
              onConnect={() => onConnect(inst.id)}
              onDisconnect={() => onDisconnect(inst.id)}
              onReconnect={() => onReconnect(inst.id)}
              menu={menuForInstance(inst)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
