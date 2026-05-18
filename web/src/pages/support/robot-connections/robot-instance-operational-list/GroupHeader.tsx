import { DownOutlined, RightOutlined } from '@ant-design/icons';
import { Space, Tag, Typography } from 'antd';
import type { GroupOperationalSummary } from './types';

export interface GroupHeaderProps {
  /** Glossary: Robot (composition) display name. */
  robotName: string;
  summary: GroupOperationalSummary;
  expanded: boolean;
  onToggle: () => void;
  summaryLine: string;
  protocolLabel: string;
}

export function GroupHeader({ robotName, summary, expanded, onToggle, summaryLine, protocolLabel }: GroupHeaderProps) {
  return (
    <button
      type="button"
      className={`robot-op-group-header ${expanded ? 'robot-op-group-header--expanded' : 'robot-op-group-header--collapsed'}`}
      onClick={onToggle}
      aria-expanded={expanded}
    >
      <span className="robot-op-group-header__chevron" aria-hidden>
        {expanded ? <DownOutlined /> : <RightOutlined />}
      </span>
      <span className="robot-op-group-header__main">
        <Typography.Text strong className="robot-op-group-header__title">
          {robotName}
        </Typography.Text>
        <Typography.Text type="secondary" className="robot-op-group-header__summary">
          {summaryLine}
        </Typography.Text>
        {summary.protocols.length > 0 ? (
          <Space size={4} wrap className="robot-op-group-header__protocols">
            <Typography.Text type="secondary" className="robot-op-group-header__protocol-label">
              {protocolLabel}
            </Typography.Text>
            {summary.protocols.map((p) => (
              <Tag key={p} bordered={false} className="robot-op-group-header__protocol-tag">
                {p}
              </Tag>
            ))}
          </Space>
        ) : null}
      </span>
    </button>
  );
}
