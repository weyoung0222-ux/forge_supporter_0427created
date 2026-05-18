import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { App, Button, Card, Descriptions, Modal, Space, Tag, Typography } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { getSimulationSceneById } from '../../../mocks/simulationSupportMocks';
import {
  supportSimulationSceneEditorPath,
  supportWorkspacePath,
  type SupportDrillToolbarAction,
} from '../../../shared/config/supportPaths';
import { useLocale } from '../../../shared/i18n/LocaleProvider';
import '../support-workspace-detail-page.css';
import { SupportWorkspaceDrillFrame } from '../SupportWorkspaceDrillFrame';
import { SimulationScenePreviewModal } from './SimulationScenePreviewModal';
import { buildDraftFromSimulationSceneRow } from './simulationSceneListDraft';
import { buildPlacedFromDraftAssets } from './compose-flow/simulationComposeFlow.types';
import './simulation-support-pages.css';

const LIST_PATH = supportWorkspacePath('simulation-support', 'sim-scenes');

export interface SimulationSceneDetailPageProps {
  sceneId: string;
  embedDrillChrome?: boolean;
}

export function SimulationSceneDetailPage({ sceneId, embedDrillChrome = false }: SimulationSceneDetailPageProps) {
  const { t } = useLocale();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const scene = getSimulationSceneById(sceneId);
  const [previewOpen, setPreviewOpen] = useState(false);
  const draft = useMemo(() => (scene ? buildDraftFromSimulationSceneRow(scene) : null), [scene]);
  const componentSummary = useMemo(() => {
    const placed = draft ? buildPlacedFromDraftAssets(draft.assets) : [];
    return {
      robots: placed.filter((x) => x.type === 'robot').length,
      objects: placed.filter((x) => x.type === 'object').length,
      environments: placed.filter((x) => x.type === 'environment').length,
      placed,
    };
  }, [draft]);

  const onDeleteScene = useCallback(() => {
    if (!scene) return;
    Modal.confirm({
      title: t('support.sim.sceneDetail.deleteConfirmTitle'),
      content: scene.name,
      okType: 'danger',
      onOk: () => {
        message.success(t('support.sim.detail.deleted'));
        navigate(LIST_PATH);
      },
    });
  }, [scene, navigate, message, t]);

  useEffect(() => {
    if (!embedDrillChrome || !scene) return;
    const onAction = (evt: Event) => {
      const action = (evt as CustomEvent<SupportDrillToolbarAction>).detail;
      if (action === 'preview') setPreviewOpen(true);
      else if (action === 'edit') navigate(supportSimulationSceneEditorPath(scene.id));
      else if (action === 'delete') onDeleteScene();
    };
    window.addEventListener('support-drill-action', onAction as EventListener);
    return () => window.removeEventListener('support-drill-action', onAction as EventListener);
  }, [embedDrillChrome, scene, navigate, onDeleteScene]);

  if (!scene) {
    return <Navigate to={LIST_PATH} replace />;
  }

  const originLabel = scene.origin === 'ai' ? t('support.sim.scenes.origin.ai') : t('support.sim.scenes.origin.manual');

  return (
    <SupportWorkspaceDrillFrame
      backLabel={t('support.sim.sceneDetail.back')}
      onBack={() => navigate(LIST_PATH)}
      shellClassName="sim-support-page sim-detail-page"
      embedInPortalHeader={embedDrillChrome}
    >
      <div className="support-detail-surface">
      <div className="dev-data-foundry-header">
        <div>
          <Typography.Title level={3} className="dev-data-foundry-title domain-content-title" style={{ margin: 0 }}>
            {scene.name}
          </Typography.Title>
          <Typography.Paragraph type="secondary" className="domain-1depth-page-lead" style={{ marginBottom: 0, marginTop: 4 }}>
            {t('support.sim.sceneDetail.lead')}
          </Typography.Paragraph>
        </div>
        {!embedDrillChrome ? (
          <Space wrap>
            <Button type="primary" icon={<EyeOutlined />} onClick={() => setPreviewOpen(true)}>
              {t('support.sim.preview.open')}
            </Button>
            <Button icon={<EditOutlined />} onClick={() => navigate(supportSimulationSceneEditorPath(scene.id))}>
              {t('support.sim.sceneDetail.openEditor')}
            </Button>
            <Button danger icon={<DeleteOutlined />} onClick={onDeleteScene}>
              {t('support.robot.definition.card.delete')}
            </Button>
          </Space>
        ) : null}
      </div>

      <Card size="small" title={t('support.sim.sceneDetail.basics')} style={{ marginBottom: 12 }}>
        <Descriptions column={1} size="small">
          <Descriptions.Item label={t('support.sim.sceneDetail.origin')}>
            <Tag color={scene.origin === 'ai' ? 'purple' : 'default'}>{originLabel}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('support.sim.sceneDetail.assetCount')}>{scene.assetCount}</Descriptions.Item>
          <Descriptions.Item label={t('support.sim.scenes.updated')}>{scene.updatedAt}</Descriptions.Item>
          <Descriptions.Item label={t('support.sim.job.used')}>
            <Tag color="processing">{t('support.sim.job.used')}</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card size="small" title={t('support.sim.sceneDetail.components')} style={{ marginBottom: 12 }}>
        <Descriptions column={1} size="small">
          <Descriptions.Item label="Robot">{componentSummary.robots}</Descriptions.Item>
          <Descriptions.Item label="Objects">{componentSummary.objects}</Descriptions.Item>
          <Descriptions.Item label="Environment">{componentSummary.environments}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card size="small" title={t('support.sim.sceneDetail.transforms')} style={{ marginBottom: 12 }}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          {componentSummary.placed.slice(0, 10).map((p) => (
            <Typography.Text key={p.instanceId} type="secondary">
              {p.name} · pos({p.x.toFixed(1)}, {p.y.toFixed(1)}, {p.z.toFixed(1)}) · rot({p.rotX}, {p.rotY}, {p.rotZ}) · scale({p.scale})
            </Typography.Text>
          ))}
        </Space>
      </Card>

      <Typography.Text type="secondary" style={{ fontSize: 13 }}>
        {t('support.sim.sceneDetail.routesHint')}
      </Typography.Text>
      </div>

      <SimulationScenePreviewModal
        open={previewOpen}
        draft={draft}
        hideRegenerate
        onClose={() => setPreviewOpen(false)}
        onEditScene={() => {
          setPreviewOpen(false);
          navigate(supportSimulationSceneEditorPath(scene.id));
        }}
        onSaveAsAsset={() => message.info(t('support.sim.compose.saveAsAssetDemo'))}
        onRegenerate={() => {}}
      />
    </SupportWorkspaceDrillFrame>
  );
}
