import { RobotInstanceConnectionStatusPanel } from './RobotInstanceConnectionStatusPanel';

export interface RobotConnectionsStatusPageProps {
  titleKey: string;
  leadKey: string;
}

/** Standalone connection status workspace (optional route); same UI as the embedded panel on Endpoints. */
export function RobotConnectionsStatusPage({ titleKey, leadKey }: RobotConnectionsStatusPageProps) {
  return (
    <div className="support-definition-page support-workspace-page dev-data-foundry">
      <div className="support-definition-page__stack">
        <RobotInstanceConnectionStatusPanel layout="page" titleKey={titleKey} leadKey={leadKey} />
      </div>
    </div>
  );
}
