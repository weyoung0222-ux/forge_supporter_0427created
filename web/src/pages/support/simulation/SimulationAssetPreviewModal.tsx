import { Button, Descriptions, Space, Tag, Typography } from 'antd';
import type { ReactNode } from 'react';
import type { SimulationAssetDto } from '../../../mocks/simulationSupportMocks';
import { previewUrl } from '../../../mocks/simulationSupportMocks';
import { useLocale } from '../../../shared/i18n/LocaleProvider';
import { Preview3DViewport, SimulationPreviewModalShell } from './simulationPreviewModalLayout';
import './simulation-support-pages.css';

export interface SimulationAssetPreviewModalProps {
  open: boolean;
  asset: SimulationAssetDto | null;
  onClose: () => void;
  onEditAsset?: () => void;
}

export function SimulationAssetPreviewModal({ open, asset, onClose, onEditAsset }: SimulationAssetPreviewModalProps) {
  const { t } = useLocale();

  if (!asset) return null;

  const is3d = asset.previewKind === 'viewer3d';

  const main = is3d ? (
    <Preview3DViewport seed={asset.id} mode="asset" />
  ) : (
    <div className="sim-asset-preview-modal__image">
      <img src={previewUrl(`preview-modal-${asset.id}`, 1200, 900)} alt="" loading="lazy" decoding="async" />
    </div>
  );

  const topBarTitle: ReactNode = (
    <Typography.Title level={4} style={{ margin: 0 }}>
      {asset.name}
    </Typography.Title>
  );

  const topBarActions: ReactNode = (
    <Space size="small" wrap>
      <Button onClick={onClose}>{t('support.sim.preview.close')}</Button>
      <Button type="primary" onClick={() => (onEditAsset ? onEditAsset() : onClose())}>
        {t('support.sim.preview.editAsset')}
      </Button>
    </Space>
  );

  const side = (
    <>
      <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginTop: 0, marginBottom: 16 }}>
        {t('support.sim.preview.readOnly')}
      </Typography.Paragraph>
      <Descriptions column={1} size="small" style={{ marginBottom: 16 }}>
        <Descriptions.Item label={t('support.sim.assets.filter.type')}>
          <Tag>{t(`support.sim.assets.type.${asset.type}`)}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label={t('support.sim.create.asset.field.description')}>{asset.description}</Descriptions.Item>
        <Descriptions.Item label={t('support.sim.assetDetail.tags')}>
          <Space wrap size={[4, 4]}>
            {asset.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </Space>
        </Descriptions.Item>
      </Descriptions>
      <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 6 }}>
        {t('support.sim.assetDetail.physics')}
      </Typography.Text>
      <Descriptions column={1} size="small" bordered>
        <Descriptions.Item label={t('support.sim.assetDetail.mass')}>{asset.massKg}</Descriptions.Item>
        <Descriptions.Item label={t('support.sim.assetDetail.friction')}>{asset.friction}</Descriptions.Item>
        <Descriptions.Item label={t('support.sim.assetDetail.collision')}>{asset.collision}</Descriptions.Item>
      </Descriptions>
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
