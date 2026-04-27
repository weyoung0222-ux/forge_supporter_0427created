import { supportWorkspacePath } from '../../shared/config/supportPaths';
import '../dev/dev-data-foundry-page.css';
import { SimulationAssetDetailPage } from './simulation/SimulationAssetDetailPage';
import { SimulationAssetsPage } from './simulation/SimulationAssetsPage';
import { SimulationComposeFlowPage } from './simulation/compose-flow/SimulationComposeFlowPage';
import { SimulationConfigListPage } from './simulation/SimulationConfigListPage';
import { SimulationConfigurationDetailPage } from './simulation/SimulationConfigurationDetailPage';
import { SimulationPresetDetailPage } from './simulation/SimulationPresetDetailPage';
import { SimulationSceneDetailPage } from './simulation/SimulationSceneDetailPage';
import { SimulationSceneEditorPage } from './simulation/SimulationSceneEditorPage';
import { SimulationScenesPage } from './simulation/SimulationScenesPage';
import { RobotConnectionsEndpointsPage } from './robot-connections/RobotConnectionsEndpointsPage';
import { RobotConnectionsStatusPage } from './robot-connections/RobotConnectionsStatusPage';
import { RobotEndpointDetailPage } from './robot-connections/RobotEndpointDetailPage';
import { ModelSupportArtifactsPage } from './model-support/ModelSupportArtifactsPage';
import { ModelSupportFtConfigsPage } from './model-support/ModelSupportFtConfigsPage';
import { ModelSupportFtPresetsPage } from './model-support/ModelSupportFtPresetsPage';
import { ModelSupportFtScriptsPage } from './model-support/ModelSupportFtScriptsPage';
import { ModelSupportParameterPresetsPage } from './model-support/ModelSupportParameterPresetsPage';
import { ModelSupportPretrainedRegistryPage } from './model-support/ModelSupportPretrainedRegistryPage';
import { ModelRegistryPage } from './model-support/ModelRegistryPage';
import { ModelSupportTrainingJobsPage } from './model-support/ModelSupportTrainingJobsPage';
import { SupportCompositionsPage } from './SupportCompositionsPage';
import { SupportDefinitionCardsPage } from './SupportDefinitionCardsPage';
import { SupportTasksPage } from './SupportTasksPage';
import { SupportWorkspaceDetailPage, type SupportDetailMode } from './SupportWorkspaceDetailPage';

interface SupportWorkspaceOutletProps {
  activeGnbKey: string;
  lnbKey: string;
  supportDetailEntityId?: string | null;
  simAssetDetailId?: string | null;
  simConfigDetailId?: string | null;
  simPresetDetailId?: string | null;
  simSceneDetailId?: string | null;
  simSceneEditorId?: string | null;
  simSceneAutoCompose?: boolean;
}

const ROBOT_DETAIL_LNB_TO_MODE: Record<string, SupportDetailMode> = {
  'definition-models': 'model',
  'definition-devices': 'device',
  compositions: 'composition',
  task: 'task',
};

const ROBOT_META: Record<string, { screenId: string; titleKey: string; leadKey: string }> = {
  'definition-models': {
    screenId: 'SP-RB-DF-001',
    titleKey: 'support.robot.definition_models.title',
    leadKey: 'support.robot.definition_models.lead',
  },
  'definition-devices': {
    screenId: 'SP-RB-DF-002',
    titleKey: 'support.robot.definition_devices.title',
    leadKey: 'support.robot.definition_devices.lead',
  },
  compositions: {
    screenId: 'SP-RB-CP-001',
    titleKey: 'support.robot.compositions.title',
    leadKey: 'support.robot.compositions.lead',
  },
  task: {
    screenId: 'SP-RB-TK-001',
    titleKey: 'support.robot.task.title',
    leadKey: 'support.robot.task.lead',
  },
  'connections-endpoints': {
    screenId: 'SP-RB-CN-EP',
    titleKey: 'support.robot.connections.endpoints.title',
    leadKey: 'support.robot.connections.endpoints.lead',
  },
  'connections-status': {
    screenId: 'SP-RB-CN-ST',
    titleKey: 'support.robot.connections.status.title',
    leadKey: 'support.robot.connections.status.lead',
  },
};

export function SupportWorkspaceOutlet({
  activeGnbKey,
  lnbKey,
  supportDetailEntityId = null,
  simAssetDetailId = null,
  simConfigDetailId = null,
  simPresetDetailId = null,
  simSceneDetailId = null,
  simSceneEditorId = null,
  simSceneAutoCompose = false,
}: SupportWorkspaceOutletProps) {
  if (activeGnbKey === 'robot-support' && supportDetailEntityId) {
    const detailMode = ROBOT_DETAIL_LNB_TO_MODE[lnbKey];
    if (detailMode) {
      return (
        <SupportWorkspaceDetailPage
          entityId={supportDetailEntityId}
          mode={detailMode}
          listPath={supportWorkspacePath('robot-support', lnbKey)}
        />
      );
    }
    if (lnbKey === 'connections-endpoints') {
      return (
        <div className="domain-workspace-route-root">
          <RobotEndpointDetailPage endpointId={supportDetailEntityId} />
        </div>
      );
    }
  }

  if (activeGnbKey === 'robot-support') {
    if (lnbKey === 'definition-models') {
      const meta = ROBOT_META['definition-models'];
      return (
        <div className="domain-workspace-route-root">
          <SupportDefinitionCardsPage
            variant="models"
            screenId={meta.screenId}
            titleKey={meta.titleKey}
            leadKey={meta.leadKey}
          />
        </div>
      );
    }
    if (lnbKey === 'definition-devices') {
      const meta = ROBOT_META['definition-devices'];
      return (
        <div className="domain-workspace-route-root">
          <SupportDefinitionCardsPage
            variant="devices"
            screenId={meta.screenId}
            titleKey={meta.titleKey}
            leadKey={meta.leadKey}
          />
        </div>
      );
    }
    if (lnbKey === 'compositions') {
      const meta = ROBOT_META.compositions;
      return (
        <div className="domain-workspace-route-root">
          <SupportCompositionsPage screenId={meta.screenId} titleKey={meta.titleKey} leadKey={meta.leadKey} />
        </div>
      );
    }
    if (lnbKey === 'task') {
      const meta = ROBOT_META.task;
      return (
        <div className="domain-workspace-route-root">
          <SupportTasksPage screenId={meta.screenId} titleKey={meta.titleKey} leadKey={meta.leadKey} />
        </div>
      );
    }
    if (lnbKey === 'connections-endpoints') {
      const meta = ROBOT_META['connections-endpoints'];
      return (
        <div className="domain-workspace-route-root">
          <RobotConnectionsEndpointsPage titleKey={meta.titleKey} leadKey={meta.leadKey} />
        </div>
      );
    }
    if (lnbKey === 'connections-status') {
      const meta = ROBOT_META['connections-status'];
      return (
        <div className="domain-workspace-route-root">
          <RobotConnectionsStatusPage titleKey={meta.titleKey} leadKey={meta.leadKey} />
        </div>
      );
    }
    return null;
  }

  if (activeGnbKey === 'model-support') {
    return (
      <div className="domain-workspace-route-root">
        {lnbKey === 'ms-registry' ? (
          <ModelRegistryPage />
        ) : lnbKey === 'ms-param-presets' ? (
          <ModelSupportParameterPresetsPage />
        ) : lnbKey === 'ms-ft-configs' ? (
          <ModelSupportFtConfigsPage />
        ) : lnbKey === 'ms-ft-scripts' ? (
          <ModelSupportFtScriptsPage />
        ) : lnbKey === 'ms-ft-presets' ? (
          <ModelSupportFtPresetsPage />
        ) : lnbKey === 'ms-training-jobs' ? (
          <ModelSupportTrainingJobsPage />
        ) : lnbKey === 'ms-pretrained-registry' ? (
          <ModelSupportPretrainedRegistryPage />
        ) : lnbKey === 'ms-pretrained-artifacts' ? (
          <ModelSupportArtifactsPage />
        ) : (
          <ModelRegistryPage />
        )}
      </div>
    );
  }

  if (activeGnbKey === 'simulation-support') {
    if (simAssetDetailId && lnbKey === 'sim-assets') {
      return (
        <div className="domain-workspace-route-root">
          <SimulationAssetDetailPage assetId={simAssetDetailId} />
        </div>
      );
    }
    if (simConfigDetailId && lnbKey === 'sim-configurations') {
      return (
        <div className="domain-workspace-route-root">
          <SimulationConfigurationDetailPage configId={simConfigDetailId} />
        </div>
      );
    }
    if (simPresetDetailId && lnbKey === 'sim-presets') {
      return (
        <div className="domain-workspace-route-root">
          <SimulationPresetDetailPage presetId={simPresetDetailId} />
        </div>
      );
    }
    if (simSceneDetailId && lnbKey === 'sim-scenes') {
      return (
        <div className="domain-workspace-route-root">
          <SimulationSceneDetailPage sceneId={simSceneDetailId} />
        </div>
      );
    }
    if (lnbKey === 'sim-scenes' && simSceneAutoCompose) {
      return (
        <div className="domain-workspace-route-root">
          <SimulationComposeFlowPage />
        </div>
      );
    }
    if (lnbKey === 'sim-scenes' && simSceneEditorId) {
      return (
        <div className="domain-workspace-route-root">
          <SimulationSceneEditorPage sceneId={simSceneEditorId} />
        </div>
      );
    }
    if (lnbKey === 'sim-assets') {
      return (
        <div className="domain-workspace-route-root">
          <SimulationAssetsPage />
        </div>
      );
    }
    if (lnbKey === 'sim-configurations') {
      return (
        <div className="domain-workspace-route-root">
          <SimulationConfigListPage variant="configuration" />
        </div>
      );
    }
    if (lnbKey === 'sim-presets') {
      return (
        <div className="domain-workspace-route-root">
          <SimulationConfigListPage variant="preset" />
        </div>
      );
    }
    if (lnbKey === 'sim-scenes') {
      return (
        <div className="domain-workspace-route-root">
          <SimulationScenesPage />
        </div>
      );
    }
    return null;
  }

  return null;
}
