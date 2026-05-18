import { useCallback, useEffect, useState } from 'react';
import type { MenuProps } from 'antd';
import type { RobotEndpointDto } from '../../../../mocks/robotConnectionsMocks';
import { GroupSection } from './GroupSection';
import type { EndpointGridGroup, GroupOperationalSummary, OperationalListContext } from './types';
import './robot-instance-operational-list.css';

export interface RobotInstanceOperationalListProps extends OperationalListContext {
  groups: EndpointGridGroup[];
  labels: {
    colInstance: string;
    colStatus: string;
    colEndpoint: string;
    colProtocol: string;
    colLatency: string;
    colHealth: string;
    colLastCheck: string;
    colActions: string;
    protocolSummary: string;
    buildGroupSummary: (s: GroupOperationalSummary) => string;
    statusLabel: (status: RobotEndpointDto['status']) => string;
    connect: string;
    disconnect: string;
    reconnect: string;
    menuAria: string;
  };
  onOpenInstance: (id: string) => void;
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
  onReconnect: (id: string) => void;
  menuForInstance: (row: RobotEndpointDto) => MenuProps;
  /** When this value changes, all groups expand. */
  expandAllKey?: number;
}

export function RobotInstanceOperationalList({
  groups,
  statusByEndpointId,
  labels,
  expandAllKey = 0,
  onOpenInstance,
  onConnect,
  onDisconnect,
  onReconnect,
  menuForInstance,
}: RobotInstanceOperationalListProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  const isExpanded = useCallback((compositionId: string) => expanded.has(compositionId), [expanded]);

  const toggleGroup = useCallback((compositionId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(compositionId)) next.delete(compositionId);
      else next.add(compositionId);
      return next;
    });
  }, []);

  useEffect(() => {
    if (expandAllKey === 0) return;
    setExpanded(new Set(groups.map((g) => g.compositionId)));
  }, [expandAllKey, groups]);

  return (
    <div className="robot-instance-op-list">
      <div className="robot-instance-op-list__column-header" role="row">
        <span className="robot-instance-op-list__col robot-instance-op-list__col--primary">{labels.colInstance}</span>
        <span className="robot-instance-op-list__col">{labels.colStatus}</span>
        <span className="robot-instance-op-list__col">{labels.colEndpoint}</span>
        <span className="robot-instance-op-list__col">{labels.colProtocol}</span>
        <span className="robot-instance-op-list__col robot-instance-op-list__col--narrow">{labels.colLatency}</span>
        <span className="robot-instance-op-list__col robot-instance-op-list__col--narrow">{labels.colHealth}</span>
        <span className="robot-instance-op-list__col robot-instance-op-list__col--wide">{labels.colLastCheck}</span>
        <span className="robot-instance-op-list__col robot-instance-op-list__col--actions">{labels.colActions}</span>
      </div>

      <div className="robot-instance-op-list__scroll">
        {groups.map((group) => (
          <GroupSection
            key={group.compositionId}
            group={group}
            expanded={isExpanded(group.compositionId)}
            onToggle={() => toggleGroup(group.compositionId)}
            buildSummaryLine={labels.buildGroupSummary}
            protocolLabel={labels.protocolSummary}
            statusLabel={labels.statusLabel}
            colStatus={labels.colStatus}
            colEndpoint={labels.colEndpoint}
            colProtocol={labels.colProtocol}
            colLatency={labels.colLatency}
            colHealth={labels.colHealth}
            colLastCheck={labels.colLastCheck}
            connectLabel={labels.connect}
            disconnectLabel={labels.disconnect}
            reconnectLabel={labels.reconnect}
            menuAria={labels.menuAria}
            statusByEndpointId={statusByEndpointId}
            onOpenInstance={onOpenInstance}
            onConnect={onConnect}
            onDisconnect={onDisconnect}
            onReconnect={onReconnect}
            menuForInstance={menuForInstance}
          />
        ))}
      </div>
    </div>
  );
}
