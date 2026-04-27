import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { App, Button, Card, Descriptions, Space, Tag, Typography } from 'antd';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { getSimulationAssetById, previewUrl } from '../../../mocks/simulationSupportMocks';
import { supportWorkspacePath } from '../../../shared/config/supportPaths';
import { useLocale } from '../../../shared/i18n/LocaleProvider';
import '../support-workspace-detail-page.css';
import { SupportWorkspaceDrillFrame } from '../SupportWorkspaceDrillFrame';
import { SimulationAssetPreviewModal } from './SimulationAssetPreviewModal';
import './simulation-support-pages.css';

const LIST_PATH = supportWorkspacePath('simulation-support', 'sim-assets');

export interface SimulationAssetDetailPageProps {
  assetId: string;
  embedDrillChrome?: boolean;
}

export function SimulationAssetDetailPage({ assetId, embedDrillChrome = false }: SimulationAssetDetailPageProps) {
  const { t } = useLocale();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const asset = getSimulationAssetById(assetId);
  const [previewOpen, setPreviewOpen] = useState(false);

  if (!asset) {
    return <Navigate to={LIST_PATH} replace />;
  }

  return (
    <SupportWorkspaceDrillFrame
      backLabel={t('support.sim.assetDetail.back')}
      onBack={() => navigate(LIST_PATH)}
      shellClassName="sim-support-page sim-detail-page"
      embedInPortalHeader={embedDrillChrome}
    >
      <div className="support-detail-surface">
      <div className="dev-data-foundry-header">
        <div>
          <Typography.Title level={3} className="dev-data-foundry-title domain-content-title" style={{ margin: 0 }}>
            {asset.name}
          </Typography.Title>
          <Typography.Paragraph type="secondary" className="domain-1depth-page-lead" style={{ marginBottom: 0, marginTop: 4 }}>
            {asset.description}
          </Typography.Paragraph>
        </div>
        <Space wrap>
          <Button type="primary" icon={<EyeOutlined />} onClick={() => setPreviewOpen(true)}>
            {t('support.sim.preview.open')}
          </Button>
          <Button icon={<EditOutlined />} onClick={() => message.info(`${t('support.robot.definition.card.editDemoPrefix')}${asset.name}`)}>
            {t('support.robot.definition.card.edit')}
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => message.warning(`${t('support.robot.definition.card.deleteDemoPrefix')}${asset.name}`)}
          >
            {t('support.robot.definition.card.delete')}
          </Button>
        </Space>
      </div>

      <div className="sim-asset-detail">
        <div>
          <div className="sim-asset-detail__preview">
            <img src={previewUrl(`sim-asset-detail-${asset.id}`, 800, 600)} alt="" loading="lazy" decoding="async" />
          </div>
        </div>
        <div>
          <Card size="small" title={t('support.sim.assetDetail.basic')} style={{ marginBottom: 12 }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label={t('support.sim.assets.filter.type')}>
                <Tag>{t(`support.sim.assets.type.${asset.type}`)}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="USD / URDF">USDZ bundle (demo)</Descriptions.Item>
              <Descriptions.Item label={t('support.sim.scenes.updated')}>{asset.updatedAt}</Descriptions.Item>
            </Descriptions>
          </Card>
          <Card size="small" title={t('support.sim.assetDetail.physics')} style={{ marginBottom: 12 }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label={t('support.sim.assetDetail.mass')}>{asset.massKg}</Descriptions.Item>
              <Descriptions.Item label={t('support.sim.assetDetail.friction')}>{asset.friction}</Descriptions.Item>
              <Descriptions.Item label={t('support.sim.assetDetail.collision')}>{asset.collision}</Descriptions.Item>
            </Descriptions>
          </Card>
          <Card size="small" title={t('support.sim.assetDetail.tags')}>
            <Space wrap>
              {asset.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </Space>
          </Card>
        </div>
      </div>
      </div>

      <SimulationAssetPreviewModal
        open={previewOpen}
        asset={asset}
        onClose={() => setPreviewOpen(false)}
        onEditAsset={() => {
          setPreviewOpen(false);
          message.info(`${t('support.robot.definition.card.editDemoPrefix')}${asset.name}`);
        }}
      />
    </SupportWorkspaceDrillFrame>
  );
}
