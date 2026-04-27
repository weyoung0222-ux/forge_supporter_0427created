import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, theme } from 'antd';
import type { ReactNode } from 'react';
import '../dev/dev-data-foundry-page.css';
import './support-workspace-detail-page.css';

export interface SupportWorkspaceDrillFrameProps {
  backLabel: string;
  onBack: () => void;
  /** Optional extra classes on the root (e.g. `sim-support-page sim-detail-page`). */
  shellClassName?: string;
  children: ReactNode;
}

/**
 * Support drill-in body: matches Dev `DevDataFoundryJobPlaceholder` / `.../data-foundry/collect` rhythm
 * (narrow column padding inside `domain-1depth-inner`) plus a Data Foundry–style top toolbar row for Back.
 */
export function SupportWorkspaceDrillFrame({ backLabel, onBack, shellClassName, children }: SupportWorkspaceDrillFrameProps) {
  const { token } = theme.useToken();
  const rootClass = ['support-workspace-drill-root', 'domain-workspace-route-root', 'support-workspace-page', 'dev-data-foundry', shellClassName].filter(Boolean).join(' ');
  return (
    <div className={rootClass}>
      <div
        className="dev-data-foundry-toolbar-sticky support-workspace-drill-frame__nav"
        style={{
          position: 'static',
          paddingTop: 0,
          marginBottom: 0,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <div className="dev-data-foundry-toolbar">
          <Button type="link" className="support-workspace-detail-page__back" icon={<ArrowLeftOutlined />} onClick={onBack} style={{ paddingLeft: 0 }}>
            {backLabel}
          </Button>
        </div>
      </div>
      {children}
    </div>
  );
}
