import { CopyOutlined, DeleteOutlined, EditOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { App, Button, Card, Descriptions, Space, Tag, Typography, theme } from 'antd';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  duplicateSimulationPreset,
  getSimulationAssetById,
  getSimulationConfigurationById,
  getSimulationPresetById,
  previewUrl,
  removeSimulationPreset,
} from '../../../mocks/simulationSupportMocks';
import { supportSimulationConfigDetailPath, supportSimulationPresetDetailPath, supportWorkspacePath } from '../../../shared/config/supportPaths';
import { useLocale } from '../../../shared/i18n/LocaleProvider';
import '../support-workspace-detail-page.css';
import { SupportWorkspaceDrillFrame } from '../SupportWorkspaceDrillFrame';
import './simulation-support-pages.css';

const LIST = supportWorkspacePath('simulation-support', 'sim-presets');

export interface SimulationPresetDetailPageProps {
  presetId: string;
}

export function SimulationPresetDetailPage({ presetId }: SimulationPresetDetailPageProps) {
  const { token } = theme.useToken();
  const { t } = useLocale();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const preset = getSimulationPresetById(presetId);
  const boundCfg = preset ? getSimulationConfigurationById(preset.boundConfigId) : null;

  if (!preset) {
    return <Navigate to={LIST} replace />;
  }

  const assets = preset.assetIds.map((id) => getSimulationAssetById(id)).filter(Boolean);

  const onDuplicate = () => {
    const copy = duplicateSimulationPreset(preset.id);
    if (copy) {
      message.success(t('support.sim.detail.duplicated'));
      navigate(supportSimulationPresetDetailPath(copy.id));
    }
  };

  const onDelete = () => {
    if (removeSimulationPreset(preset.id)) {
      message.success(t('support.sim.detail.deleted'));
      navigate(LIST);
    }
  };

  return (
    <SupportWorkspaceDrillFrame backLabel={t('support.sim.presetDetail.back')} onBack={() => navigate(LIST)} shellClassName="sim-support-page sim-detail-page">
      <div className="dev-data-foundry-header" style={{ marginTop: 12, marginBottom: 16 }}>
        <div>
          <Typography.Title level={3} className="dev-data-foundry-title domain-content-title" style={{ margin: 0 }}>
            {preset.name}
          </Typography.Title>
          <Typography.Paragraph type="secondary" className="domain-1depth-page-lead" style={{ marginBottom: 0, marginTop: 6 }}>
            {preset.description}
          </Typography.Paragraph>
          <Typography.Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 6 }}>
            {t('support.sim.presetDetail.pageTitle')} · {t('support.sim.scenes.updated')}: {preset.updatedAt}
          </Typography.Text>
        </div>
        <Space wrap>
          <Button type="primary" ghost icon={<ThunderboltOutlined />} onClick={() => message.success(t('support.sim.presetDetail.applyDemo'))}>
            {t('support.sim.presetDetail.apply')}
          </Button>
          <Button icon={<EditOutlined />} onClick={() => message.info(t('support.sim.detail.editDemo'))}>
            {t('support.robot.definition.card.edit')}
          </Button>
        </Space>
      </div>

      <div className="sim-detail-page__grid">
        <div>
          <Card size="small" title={t('support.sim.presetDetail.boundConfig')} style={{ marginBottom: 16, borderColor: token.colorBorderSecondary }}>
            {boundCfg ? (
              <Space direction="vertical" size={10} style={{ width: '100%' }}>
                <div className="sim-detail-target-card" style={{ cursor: 'pointer' }} onClick={() => navigate(supportSimulationConfigDetailPath(boundCfg.id))} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(supportSimulationConfigDetailPath(boundCfg.id)); } }}>
                  <img src={previewUrl(`preset-cfg-${boundCfg.id}`, 88, 88)} alt="" />
                  <div style={{ minWidth: 0 }}>
                    <Typography.Text strong ellipsis>
                      {boundCfg.name}
                    </Typography.Text>
                    <div>
                      <Tag>{boundCfg.facet}</Tag>
                    </div>
                  </div>
                </div>
                <Button type="link" style={{ paddingLeft: 0 }} onClick={() => navigate(supportSimulationConfigDetailPath(boundCfg.id))}>
                  {t('support.sim.presetDetail.openConfig')}
                </Button>
              </Space>
            ) : (
              <Typography.Text type="secondary">{preset.boundConfigName}</Typography.Text>
            )}
          </Card>

          <Card size="small" title={t('support.sim.presetDetail.assets')} style={{ marginBottom: 16, borderColor: token.colorBorderSecondary }}>
            <Space direction="vertical" size={10} style={{ width: '100%' }}>
              {assets.length === 0 ? (
                <Typography.Text type="secondary">{t('support.sim.presetDetail.noAssets')}</Typography.Text>
              ) : (
                assets.map((a) =>
                  a ? (
                    <div key={a.id} className="sim-detail-target-card">
                      <img src={previewUrl(`preset-ast-${a.id}`, 88, 88)} alt="" />
                      <div style={{ minWidth: 0 }}>
                        <Typography.Text strong ellipsis>
                          {a.name}
                        </Typography.Text>
                        <div>
                          <Tag>{t(`support.sim.assets.type.${a.type}`)}</Tag>
                        </div>
                      </div>
                    </div>
                  ) : null,
                )
              )}
            </Space>
          </Card>

          <Card size="small" title={t('support.sim.presetDetail.params')} style={{ borderColor: token.colorBorderSecondary }}>
            <Descriptions column={1} size="small" bordered>
              {preset.parameters.map((p) => (
                <Descriptions.Item key={p.key} label={p.key}>
                  {p.value}
                </Descriptions.Item>
              ))}
            </Descriptions>
          </Card>
        </div>

        <aside>
          <Card size="small" title={t('support.sim.presetDetail.summaryTitle')} style={{ borderColor: token.colorBorderSecondary }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label={t('support.sim.presetDetail.summary.assets')}>{preset.boundAssetCount}</Descriptions.Item>
              <Descriptions.Item label={t('support.sim.presetDetail.summary.config')}>{preset.boundConfigName}</Descriptions.Item>
              <Descriptions.Item label={t('support.sim.presets.badge')}>
                <Tag color="purple">{t('support.sim.presets.badge')}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
          <Card size="small" title={t('support.sim.configDetail.quickInfo')} style={{ marginTop: 12, borderColor: token.colorBorderSecondary }}>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0, fontSize: 13 }}>
              {t('support.sim.presetDetail.quickInfoBody')}
            </Typography.Paragraph>
          </Card>
        </aside>
      </div>

      <footer className="sim-detail-page__footer">
        <Button icon={<CopyOutlined />} onClick={onDuplicate}>
          {t('support.sim.detail.duplicate')}
        </Button>
        <Button danger icon={<DeleteOutlined />} onClick={onDelete}>
          {t('support.robot.definition.card.delete')}
        </Button>
      </footer>
    </SupportWorkspaceDrillFrame>
  );
}
