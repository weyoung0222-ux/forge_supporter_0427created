import { useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { App } from 'antd';
import { getSimulationAssetsMock, getSimulationSceneById } from '../../../mocks/simulationSupportMocks';
import { supportWorkspacePath } from '../../../shared/config/supportPaths';
import { useLocale } from '../../../shared/i18n/LocaleProvider';
import { SupportWorkspaceDrillFrame } from '../SupportWorkspaceDrillFrame';
import { SceneEditorWorkspace } from './compose-flow/SceneEditorWorkspace';
import { buildPlacedFromDraftAssets } from './compose-flow/simulationComposeFlow.types';
import '../../dev/dev-data-foundry-page.css';

const SCENES_LIST = supportWorkspacePath('simulation-support', 'sim-scenes');

export interface SimulationSceneEditorPageProps {
  sceneId: string;
  embedDrillChrome?: boolean;
}

export function SimulationSceneEditorPage({ sceneId, embedDrillChrome = false }: SimulationSceneEditorPageProps) {
  const { t } = useLocale();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const scene = getSimulationSceneById(sceneId);
  const draftFromAi = sceneId.startsWith('composed-');

  const initialPlaced = useMemo(() => {
    if (!scene) return [];
    const all = getSimulationAssetsMock();
    if (all.length === 0) return [];
    const count = Math.min(Math.max(scene.assetCount, 1), all.length);
    const picks = all.slice(0, count);
    return buildPlacedFromDraftAssets(picks.map((a) => ({ id: a.id, name: a.name, type: a.type })));
  }, [scene]);

  if (!scene && !draftFromAi) {
    return <Navigate to={SCENES_LIST} replace />;
  }

  const title = scene?.name ?? sceneId;

  return (
    <SupportWorkspaceDrillFrame
      backLabel={t('support.sim.compose.backToScenes')}
      onBack={() => navigate(SCENES_LIST)}
      shellClassName="sim-compose-flow sim-compose-flow--immersive sim-support-page"
      embedInPortalHeader={embedDrillChrome}
    >
      <SceneEditorWorkspace
        title={title}
        subtitle={t('support.sim.compose.editor.manualSubtitle')}
        initialPlaced={initialPlaced}
        onCancel={() => navigate(SCENES_LIST)}
        onSaveScene={(_placed) => {
          message.success(t('support.sim.editor.saveDemo'));
          navigate(SCENES_LIST);
        }}
        onSaveAsAsset={(_placed) => {
          message.info(t('support.sim.compose.saveAsAssetDemo'));
        }}
      />
    </SupportWorkspaceDrillFrame>
  );
}
