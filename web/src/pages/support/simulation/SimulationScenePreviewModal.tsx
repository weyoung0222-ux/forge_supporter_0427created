import { Button, Descriptions, Space, Tag, Typography } from 'antd';
import type { ReactNode } from 'react';
import { previewUrl } from '../../../mocks/simulationSupportMocks';
import { useLocale } from '../../../shared/i18n/LocaleProvider';
import type { DraftScene, SceneTypeOption } from './compose-flow/simulationComposeFlow.types';
import { Preview3DViewport, SimulationPreviewModalShell } from './simulationPreviewModalLayout';
import './simulation-support-pages.css';

const SCENE_LAYOUT_LABELS: Record<SceneTypeOption, string> = {
  warehouse: 'support.sim.compose.type.warehouse',
  outdoor: 'support.sim.compose.type.outdoor',
  factory: 'support.sim.compose.type.factory',
  lab: 'support.sim.compose.type.lab',
  custom: 'support.sim.compose.type.custom',
};

export interface SimulationScenePreviewModalProps {
  open: boolean;
  draft: DraftScene | null;
  onClose: () => void;
  onEditScene: () => void;
  onSaveAsAsset: () => void;
  onRegenerate: () => void;
  /** Saved scenes from Scenes list: hide compose-only “Regenerate”. */
  hideRegenerate?: boolean;
}

export function SimulationScenePreviewModal({
  open,
  draft,
  onClose,
  onEditScene,
  onSaveAsAsset,
  onRegenerate,
  hideRegenerate = false,
}: SimulationScenePreviewModalProps) {
  const { t } = useLocale();

  if (!draft) return null;

  const originManual = draft.createdBy === 'user';
  const typeLabel = originManual ? t('support.sim.scenes.origin.manual') : t('support.sim.scenes.origin.ai');
  const createdLabel = originManual ? t('support.sim.scenePreview.createdByUser') : t('support.sim.scenePreview.createdByAi');
  const layoutLabel = t(SCENE_LAYOUT_LABELS[draft.sceneType]);

  const main = <Preview3DViewport seed={draft.previewSeed} mode="scene" />;

  const topBarTitle: ReactNode = (
    <Typography.Title level={4} style={{ margin: 0 }}>
      {draft.name}
    </Typography.Title>
  );

  const topBarActions: ReactNode = (
    <Space size="small" wrap>
      <Button onClick={onClose}>{t('support.sim.preview.close')}</Button>
      <Button onClick={onSaveAsAsset}>{t('support.sim.scenePreview.saveAsAsset')}</Button>
      <Button type="primary" onClick={onEditScene}>
        {t('support.sim.scenePreview.editScene')}
      </Button>
    </Space>
  );

  const side = (
    <>
      <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginTop: 0, marginBottom: 16 }}>
        {t('support.sim.scenePreview.readOnly')}
      </Typography.Paragraph>

      <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 6 }}>
        {t('support.sim.scenePreview.sectionBasics')}
      </Typography.Text>
      <Descriptions column={1} size="small" style={{ marginBottom: 16 }}>
        <Descriptions.Item label={t('support.sim.scenePreview.typeManualAi')}>
          <Tag>{typeLabel}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label={t('support.sim.scenePreview.layoutKind')}>{layoutLabel}</Descriptions.Item>
        <Descriptions.Item label={t('support.sim.create.asset.field.description')}>{draft.description}</Descriptions.Item>
      </Descriptions>

      <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 6 }}>
        {t('support.sim.scenePreview.sectionComposition')}
      </Typography.Text>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 8, fontSize: 13 }}>
        {t('support.sim.compose.assetCount')}: <Typography.Text strong>{draft.assets.length}</Typography.Text>
      </Typography.Paragraph>
      <Space direction="vertical" size={8} style={{ width: '100%', marginBottom: 16 }}>
        {draft.assets.map((a) => (
          <div key={a.id} className="sim-detail-target-card">
            <img src={previewUrl(`scene-ast-${a.id}`, 72, 72)} alt="" width={44} height={44} style={{ borderRadius: 6, objectFit: 'cover' }} />
            <div style={{ minWidth: 0 }}>
              <Typography.Text strong ellipsis>
                {a.name}
              </Typography.Text>
              <div>
                <Tag>{a.type}</Tag>
              </div>
            </div>
          </div>
        ))}
      </Space>

      <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 6 }}>
        {t('support.sim.scenePreview.sectionMeta')}
      </Typography.Text>
      <Descriptions column={1} size="small" style={{ marginBottom: 16 }}>
        <Descriptions.Item label={t('support.sim.scenePreview.createdBy')}>{createdLabel}</Descriptions.Item>
        <Descriptions.Item label={t('support.sim.scenes.updated')}>{draft.updatedAt}</Descriptions.Item>
      </Descriptions>

      {hideRegenerate ? null : (
        <Button type="link" style={{ paddingLeft: 0, marginBottom: 8 }} onClick={onRegenerate}>
          {t('support.sim.compose.regenerate')}
        </Button>
      )}
    </>
  );

  return (
    <SimulationPreviewModalShell
      open={open}
      onClose={onClose}
      main={main}
      side={side}
      layout="wide"
      sidePlacement="left"
      topBarTitle={topBarTitle}
      topBarActions={topBarActions}
    />
  );
}
