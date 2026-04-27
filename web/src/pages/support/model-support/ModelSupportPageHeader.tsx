import { Button, Space, Tag, Typography } from 'antd';
import type { ReactNode } from 'react';

export interface ModelSupportPageHeaderProps {
  titleT: string;
  leadT: string;
  count: number;
  countLabelT: string;
  createLabel: string;
  onCreate: () => void;
  /** Search / filter / sort row (optional) */
  toolbar?: ReactNode;
}

export function ModelSupportPageHeader({ titleT, leadT, count, countLabelT, createLabel, onCreate, toolbar }: ModelSupportPageHeaderProps) {
  const countLabel = countLabelT.replace('{n}', String(count));
  return (
    <>
      <div className="dev-data-foundry-header" style={{ marginBottom: 12 }}>
        <div>
          <Space align="center" wrap className="support-workspace-title-line" size={10}>
            <Typography.Title level={3} className="dev-data-foundry-title domain-content-title" style={{ margin: 0 }}>
              {titleT}
            </Typography.Title>
            <Tag bordered={false} color="default" aria-label={countLabel}>
              {countLabel}
            </Tag>
          </Space>
          <Typography.Paragraph type="secondary" className="domain-1depth-page-lead" style={{ marginBottom: 0 }}>
            {leadT}
          </Typography.Paragraph>
        </div>
        <Button type="primary" onClick={onCreate}>
          {createLabel}
        </Button>
      </div>
      {toolbar ? (
        <div className="dev-data-foundry-toolbar-sticky" style={{ position: 'static', paddingTop: 0, marginBottom: 12 }}>
          <div className="dev-data-foundry-toolbar" role="toolbar">
            {toolbar}
          </div>
        </div>
      ) : null}
    </>
  );
}
