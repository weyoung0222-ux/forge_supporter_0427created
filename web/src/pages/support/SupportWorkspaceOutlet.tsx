import { useNavigate } from 'react-router-dom';
import { supportWorkspacePath } from '../../shared/config/supportPaths';
import { RobotEndpointEditPage } from './robot-connections/RobotEndpointEditPage';
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
import { SupportWorkspaceEditPage } from './SupportWorkspaceEditPage';
import { CreateRobotModelModal } from './robot-create/CreateRobotModelModal';
import { CreateRobotDeviceModal } from './robot-create/CreateRobotDeviceModal';
import { CreateRobotCompositionModal } from './robot-create/CreateRobotCompositionModal';
import { CreateRobotTaskTypeModal } from './robot-create/CreateRobotTaskTypeModal';
import { RegisterRobotInstanceWizard } from './robot-connections/RegisterRobotInstanceWizard';
import { CreateSimulationAssetModal } from './simulation/create/CreateSimulationAssetModal';
import { CreateSimulationConfigurationModal } from './simulation/create/CreateSimulationConfigurationModal';
import { CreateSimulationPresetModal } from './simulation/create/CreateSimulationPresetModal';
import { CreateSimulationSceneModal } from './simulation/create/CreateSimulationSceneModal';

interface SupportWorkspaceOutletProps {
  activeGnbKey: string;
  lnbKey: string;
  supportDetailEntityId?: string | null;
  supportEditEntityId?: string | null;
  supportWorkspaceCreate?: boolean;
  simAssetDetailId?: string | null;
  simConfigDetailId?: string | null;
  simPresetDetailId?: string | null;
  simSceneDetailId?: string | null;
  simSceneEditorId?: string | null;
  simSceneAutoCompose?: boolean;
  /** Hide in-frame back bar; `PortalDrillInGnb` in `DomainHomeLayout` handles navigation. */
  embedDrillChrome?: boolean;
}

const ROBOT_DETAIL_LNB_TO_MODE: Record<string, SupportDetailMode> = {
  'definition-robot': 'model',
  'definition-devices': 'device',
  compositions: 'composition',
  task: 'task',
};

const ROBOT_META: Record<string, { screenId: string; titleKey: string; leadKey: string }> = {
  'definition-robot': {
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
  'instances-endpoints': {
    screenId: 'SP-RB-CN-EP',
    titleKey: 'support.robot.connections.endpoints.title',
    leadKey: 'support.robot.connections.endpoints.lead',
  },
};

export function SupportWorkspaceOutlet({
  activeGnbKey,
  lnbKey,
  supportDetailEntityId = null,
  supportEditEntityId = null,
  supportWorkspaceCreate = false,
  simAssetDetailId = null,
  simConfigDetailId = null,
  simPresetDetailId = null,
  simSceneDetailId = null,
  simSceneEditorId = null,
  simSceneAutoCompose = false,
  embedDrillChrome = false,
}: SupportWorkspaceOutletProps) {
  const navigate = useNavigate();

  if (activeGnbKey === 'robot-support' && supportWorkspaceCreate) {
    const listPath = supportWorkspacePath('robot-support', lnbKey);
    const back = () => {
      navigate(listPath);
    };
    if (lnbKey === 'definition-robot') {
      return (
        <div className="domain-workspace-route-root">
          <CreateRobotModelModal layout="page" onClose={back} onCreated={back} />
        </div>
      );
    }
    if (lnbKey === 'definition-devices') {
      return (
        <div className="domain-workspace-route-root">
          <CreateRobotDeviceModal layout="page" onClose={back} onCreated={back} />
        </div>
      );
    }
    if (lnbKey === 'compositions') {
      return (
        <div className="domain-workspace-route-root">
          <CreateRobotCompositionModal layout="page" onClose={back} onCreated={back} />
        </div>
      );
    }
    if (lnbKey === 'task') {
      return (
        <div className="domain-workspace-route-root">
          <CreateRobotTaskTypeModal layout="page" onClose={back} onCreated={back} />
        </div>
      );
    }
    if (lnbKey === 'instances-endpoints') {
      return (
        <div className="domain-workspace-route-root">
          <RegisterRobotInstanceWizard onClose={back} onSaved={back} />
        </div>
      );
    }
  }

  if (activeGnbKey === 'simulation-support' && supportWorkspaceCreate) {
    const listPath = supportWorkspacePath('simulation-support', lnbKey);
    const back = () => {
      navigate(listPath);
    };
    if (lnbKey === 'sim-assets') {
      return (
        <div className="domain-workspace-route-root">
          <CreateSimulationAssetModal layout="page" onClose={back} onCreated={back} />
        </div>
      );
    }
    if (lnbKey === 'sim-configurations') {
      return (
        <div className="domain-workspace-route-root">
          <CreateSimulationConfigurationModal layout="page" onClose={back} onCreated={back} />
        </div>
      );
    }
    if (lnbKey === 'sim-presets') {
      return (
        <div className="domain-workspace-route-root">
          <CreateSimulationPresetModal layout="page" onClose={back} onCreated={back} />
        </div>
      );
    }
    if (lnbKey === 'sim-scenes') {
      return (
        <div className="domain-workspace-route-root">
          <CreateSimulationSceneModal layout="page" onClose={back} onCreated={back} />
        </div>
      );
    }
  }

  if (activeGnbKey === 'robot-support' && supportEditEntityId) {
    if (lnbKey === 'instances-endpoints') {
      return (
        <div className="domain-workspace-route-root">
          <RobotEndpointEditPage endpointId={supportEditEntityId} embedDrillChrome={embedDrillChrome} />
        </div>
      );
    }
    const editMode = ROBOT_DETAIL_LNB_TO_MODE[lnbKey];
    if (editMode) {
      return (
        <SupportWorkspaceEditPage
          entityId={supportEditEntityId}
          mode={editMode}
          listPath={supportWorkspacePath('robot-support', lnbKey)}
          embedDrillChrome={embedDrillChrome}
        />
      );
    }
  }

  if (activeGnbKey === 'robot-support' && supportDetailEntityId) {
    const detailMode = ROBOT_DETAIL_LNB_TO_MODE[lnbKey];
    if (detailMode) {
      return (
        <SupportWorkspaceDetailPage
          entityId={supportDetailEntityId}
          mode={detailMode}
          listPath={supportWorkspacePath('robot-support', lnbKey)}
          embedDrillChrome={embedDrillChrome}
        />
      );
    }
    if (lnbKey === 'instances-endpoints') {
      return (
        <div className="domain-workspace-route-root">
          <RobotEndpointDetailPage endpointId={supportDetailEntityId} embedDrillChrome={embedDrillChrome} />
        </div>
      );
    }
  }

  if (activeGnbKey === 'robot-support') {
    if (lnbKey === 'definition-robot') {
      const meta = ROBOT_META['definition-robot'];
      return (
        <div className="domain-workspace-route-root">
          <SupportDefinitionCardsPage variant="robot" screenId={meta.screenId} titleKey={meta.titleKey} leadKey={meta.leadKey} />
        </div>
      );
    }
    if (lnbKey === 'definition-devices') {
      const meta = ROBOT_META['definition-devices'];
      return (
        <div className="domain-workspace-route-root">
          <SupportDefinitionCardsPage variant="device" screenId={meta.screenId} titleKey={meta.titleKey} leadKey={meta.leadKey} />
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
    if (lnbKey === 'instances-endpoints') {
      const meta = ROBOT_META['instances-endpoints'];
      return (
        <div className="domain-workspace-route-root">
          <RobotConnectionsEndpointsPage titleKey={meta.titleKey} leadKey={meta.leadKey} />
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
        ) : lnbKey === 'ms-validation-presets' ? (
          <ModelSupportParameterPresetsPage
            titleKey="support.ms.validationPresets.title"
            leadKey="support.ms.validationPresets.lead"
          />
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
          <SimulationAssetDetailPage assetId={simAssetDetailId} embedDrillChrome={embedDrillChrome} />
        </div>
      );
    }
    if (simConfigDetailId && lnbKey === 'sim-configurations') {
      return (
        <div className="domain-workspace-route-root">
          <SimulationConfigurationDetailPage configId={simConfigDetailId} embedDrillChrome={embedDrillChrome} />
        </div>
      );
    }
    if (simPresetDetailId && lnbKey === 'sim-presets') {
      return (
        <div className="domain-workspace-route-root">
          <SimulationPresetDetailPage presetId={simPresetDetailId} embedDrillChrome={embedDrillChrome} />
        </div>
      );
    }
    if (simSceneDetailId && lnbKey === 'sim-scenes') {
      return (
        <div className="domain-workspace-route-root">
          <SimulationSceneDetailPage sceneId={simSceneDetailId} embedDrillChrome={embedDrillChrome} />
        </div>
      );
    }
    if (lnbKey === 'sim-scenes' && simSceneAutoCompose) {
      return (
        <div className="domain-workspace-route-root">
          <SimulationComposeFlowPage embedDrillChrome={embedDrillChrome} />
        </div>
      );
    }
    if (lnbKey === 'sim-scenes' && simSceneEditorId) {
      return (
        <div className="domain-workspace-route-root">
          <SimulationSceneEditorPage sceneId={simSceneEditorId} embedDrillChrome={embedDrillChrome} />
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
