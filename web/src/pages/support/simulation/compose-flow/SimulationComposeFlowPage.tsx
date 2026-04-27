import { App, Button, Input, Select, Skeleton, Space, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSimulationAssetsMock, prependSimulationScene } from '../../../../mocks/simulationSupportMocks';
import { supportWorkspacePath } from '../../../../shared/config/supportPaths';
import { useLocale } from '../../../../shared/i18n/LocaleProvider';
import '../../../dev/dev-data-foundry-page.css';
import { SupportWorkspaceDrillFrame } from '../../SupportWorkspaceDrillFrame';
import { SimulationScenePreviewModal } from '../SimulationScenePreviewModal';
import { SceneEditorWorkspace } from './SceneEditorWorkspace';
import type { ComposeFlowStep, DensityOption, DraftScene, DraftAssetRef, PlacedEntity, SceneTypeOption } from './simulationComposeFlow.types';
import { buildPlacedFromDraftAssets } from './simulationComposeFlow.types';
import './simulation-compose-flow.css';

const SCENES_LIST = supportWorkspacePath('simulation-support', 'sim-scenes');

function pickDraftAssets(preferenceIds: string[], density: DensityOption): DraftAssetRef[] {
  const all = getSimulationAssetsMock();
  let pool = preferenceIds.length ? all.filter((a) => preferenceIds.includes(a.id)) : all;
  if (pool.length === 0) pool = all;
  const n = density === 'low' ? 3 : density === 'high' ? 6 : 4;
  return pool.slice(0, n).map((a) => ({ id: a.id, name: a.name, type: a.type }));
}

function draftTitleFromPrompt(prompt: string): string {
  const line = prompt.trim().split('\n')[0] ?? '';
  const short = line.slice(0, 48);
  return short ? `Draft · ${short}` : 'AI draft scene';
}

export interface SimulationComposeFlowPageProps {
  embedDrillChrome?: boolean;
}

export function SimulationComposeFlowPage({ embedDrillChrome = false }: SimulationComposeFlowPageProps) {
  const { t } = useLocale();
  const { message } = App.useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState<ComposeFlowStep>('request');
  const [prompt, setPrompt] = useState('');
  const [sceneType, setSceneType] = useState<SceneTypeOption>('warehouse');
  const [assetPrefs, setAssetPrefs] = useState<string[]>([]);
  const [density, setDensity] = useState<DensityOption>('medium');
  const [draft, setDraft] = useState<DraftScene | null>(null);
  const [editorPlaced, setEditorPlaced] = useState<PlacedEntity[]>([]);

  const assetOptions = useMemo(() => getSimulationAssetsMock().map((a) => ({ value: a.id, label: a.name })), []);

  const runGenerate = () => {
    setStep('generating');
    window.setTimeout(() => {
      const assets = pickDraftAssets(assetPrefs, density);
      const id = `compose-draft-${Date.now()}`;
      const today = new Date().toISOString().slice(0, 10);
      const descLine = prompt.trim().split('\n').filter(Boolean)[0] ?? '';
      const d: DraftScene = {
        id,
        name: draftTitleFromPrompt(prompt),
        sceneType,
        density,
        prompt,
        previewSeed: `ai-compose-${id}`,
        assets,
        description: descLine.slice(0, 400) || prompt.trim().slice(0, 400),
        updatedAt: today,
        createdBy: 'ai',
      };
      setDraft(d);
      setStep('preview');
    }, 1200);
  };

  const enterEditorFromDraft = () => {
    if (!draft) return;
    const placed = buildPlacedFromDraftAssets(draft.assets);
    setEditorPlaced(placed);
    setStep('editor');
  };

  const regenerate = () => {
    setDraft(null);
    setStep('request');
  };

  const saveSceneAndExit = (placed: PlacedEntity[]) => {
    if (!draft) return;
    const today = new Date().toISOString().slice(0, 10);
    prependSimulationScene({
      id: `sim-scene-${Date.now()}`,
      name: draft.name,
      assetCount: placed.length,
      origin: 'ai',
      updatedAt: today,
    });
    message.success(t('support.sim.compose.savedScene'));
    navigate(SCENES_LIST);
  };

  if (step === 'editor' && draft) {
    return (
      <SupportWorkspaceDrillFrame
        backLabel={t('support.sim.compose.backToScenes')}
        onBack={() => navigate(SCENES_LIST)}
        shellClassName="sim-compose-flow sim-compose-flow--immersive sim-support-page"
        embedInPortalHeader={embedDrillChrome}
      >
        <SceneEditorWorkspace
          title={draft.name}
          subtitle={t('support.sim.compose.editor.subtitle')}
          initialPlaced={editorPlaced}
          onCancel={() => navigate(SCENES_LIST)}
          onSaveScene={saveSceneAndExit}
          onSaveAsAsset={(_placed) => {
            message.info(t('support.sim.compose.saveAsAssetDemo'));
          }}
        />
      </SupportWorkspaceDrillFrame>
    );
  }

  return (
    <SupportWorkspaceDrillFrame
      backLabel={t('support.sim.compose.backToScenes')}
      onBack={() => navigate(SCENES_LIST)}
      shellClassName="support-workspace-page dev-data-foundry sim-compose-flow sim-compose-flow--immersive sim-support-page"
      embedInPortalHeader={embedDrillChrome}
    >
      {step === 'request' ? (
        <>
          <div className="sim-compose-flow__hero">
            <Typography.Title level={3} className="domain-content-title" style={{ marginBottom: 8 }}>
              {t('support.sim.compose.requestTitle')}
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0, maxWidth: 640, margin: '0 auto' }}>
              {t('support.sim.compose.requestLead')}
            </Typography.Paragraph>
          </div>

          <div className="sim-compose-flow__prompt">
            <Typography.Text type="secondary">{t('support.sim.compose.promptLabel')}</Typography.Text>
            <Input.TextArea
              style={{ marginTop: 8 }}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t('support.sim.compose.promptPlaceholder')}
              autoSize={{ minRows: 6, maxRows: 14 }}
            />
          </div>

          <div className="sim-compose-flow__options">
            <Space direction="vertical" size={14} style={{ width: '100%' }}>
              <div>
                <Typography.Text type="secondary">{t('support.sim.compose.sceneType')}</Typography.Text>
                <Select<SceneTypeOption>
                  style={{ width: '100%', marginTop: 6 }}
                  value={sceneType}
                  onChange={setSceneType}
                  options={[
                    { value: 'warehouse', label: t('support.sim.compose.type.warehouse') },
                    { value: 'outdoor', label: t('support.sim.compose.type.outdoor') },
                    { value: 'factory', label: t('support.sim.compose.type.factory') },
                    { value: 'lab', label: t('support.sim.compose.type.lab') },
                    { value: 'custom', label: t('support.sim.compose.type.custom') },
                  ]}
                />
              </div>
              <div>
                <Typography.Text type="secondary">{t('support.sim.compose.assetPref')}</Typography.Text>
                <Select<string[]>
                  mode="multiple"
                  style={{ width: '100%', marginTop: 6 }}
                  value={assetPrefs}
                  onChange={setAssetPrefs}
                  options={assetOptions}
                  optionFilterProp="label"
                  placeholder={t('support.sim.compose.assetPrefPh')}
                />
              </div>
              <div>
                <Typography.Text type="secondary">{t('support.sim.compose.density')}</Typography.Text>
                <Select<DensityOption>
                  style={{ width: '100%', marginTop: 6 }}
                  value={density}
                  onChange={setDensity}
                  options={[
                    { value: 'low', label: t('support.sim.compose.density.low') },
                    { value: 'medium', label: t('support.sim.compose.density.medium') },
                    { value: 'high', label: t('support.sim.compose.density.high') },
                  ]}
                />
              </div>
            </Space>
          </div>

          <div className="sim-compose-flow__generate-wrap">
            <Button type="primary" size="large" onClick={runGenerate} disabled={!prompt.trim()}>
              {t('support.sim.auto.generate')}
            </Button>
          </div>
        </>
      ) : null}

      {step === 'generating' ? (
        <div className="sim-compose-flow__generating">
          <Skeleton.Image active style={{ width: '100%', maxWidth: 480, height: 260 }} />
          <Typography.Title level={4} style={{ marginTop: 24 }}>
            {t('support.sim.compose.generating')}
          </Typography.Title>
        </div>
      ) : null}

      <SimulationScenePreviewModal
        open={step === 'preview' && Boolean(draft)}
        draft={draft}
        onClose={() => navigate(SCENES_LIST)}
        onEditScene={enterEditorFromDraft}
        onSaveAsAsset={() => message.info(t('support.sim.compose.saveAsAssetDemo'))}
        onRegenerate={regenerate}
      />
    </SupportWorkspaceDrillFrame>
  );
}
