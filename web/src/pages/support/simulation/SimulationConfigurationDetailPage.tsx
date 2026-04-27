import { CopyOutlined, DeleteOutlined, EditOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { App, Button, Card, Descriptions, List, Space, Tag, Typography, theme } from 'antd';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  duplicateSimulationConfiguration,
  getSimulationAssetById,
  getSimulationConfigurationById,
  previewUrl,
  removeSimulationConfiguration,
  type SimulationConfigDto,
} from '../../../mocks/simulationSupportMocks';
import { supportSimulationConfigDetailPath, supportWorkspacePath } from '../../../shared/config/supportPaths';
import { useLocale } from '../../../shared/i18n/LocaleProvider';
import '../support-workspace-detail-page.css';
import { SupportWorkspaceDrillFrame } from '../SupportWorkspaceDrillFrame';
import './simulation-support-pages.css';

const LIST = supportWorkspacePath('simulation-support', 'sim-configurations');

function actionTypeLabel(t: (k: string) => string, key: string): string {
  const m: Record<string, string> = {
    step: 'support.sim.create.config.action.step',
    episode: 'support.sim.create.config.action.episode',
    reset: 'support.sim.create.config.action.reset',
  };
  const lk = m[key];
  return lk ? t(lk) : key;
}

function terminationLabel(t: (k: string) => string, key: string): string {
  const m: Record<string, string> = {
    max_steps: 'support.sim.create.config.term.maxSteps',
    success: 'support.sim.create.config.term.success',
    timeout: 'support.sim.create.config.term.timeout',
  };
  const lk = m[key];
  return lk ? t(lk) : key;
}

function statusColor(status: SimulationConfigDto['status']): string {
  if (status === 'active') return 'green';
  if (status === 'deprecated') return 'red';
  return 'default';
}

export interface SimulationConfigurationDetailPageProps {
  configId: string;
}

export function SimulationConfigurationDetailPage({ configId }: SimulationConfigurationDetailPageProps) {
  const { token } = theme.useToken();
  const { t } = useLocale();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const cfg = getSimulationConfigurationById(configId);

  if (!cfg) {
    return <Navigate to={LIST} replace />;
  }

  const onDuplicate = () => {
    const copy = duplicateSimulationConfiguration(cfg.id);
    if (copy) {
      message.success(t('support.sim.detail.duplicated'));
      navigate(supportSimulationConfigDetailPath(copy.id));
    }
  };

  const onDelete = () => {
    if (removeSimulationConfiguration(cfg.id)) {
      message.success(t('support.sim.detail.deleted'));
      navigate(LIST);
    }
  };

  const targets = cfg.targetAssetIds.map((id) => getSimulationAssetById(id)).filter(Boolean);

  return (
    <SupportWorkspaceDrillFrame backLabel={t('support.sim.configDetail.back')} onBack={() => navigate(LIST)} shellClassName="sim-support-page sim-detail-page">
      <div className="dev-data-foundry-header" style={{ marginTop: 12, marginBottom: 16 }}>
        <div>
          <Typography.Title level={3} className="dev-data-foundry-title domain-content-title" style={{ margin: 0 }}>
            {cfg.name}
          </Typography.Title>
          <Typography.Paragraph type="secondary" className="domain-1depth-page-lead" style={{ marginBottom: 0, marginTop: 6 }}>
            <Space wrap size={8}>
              <Typography.Text type="secondary">{t('support.sim.configDetail.pageTitle')}</Typography.Text>
              <Tag color={statusColor(cfg.status)}>{t(`support.sim.detail.status.${cfg.status}`)}</Tag>
              <Tag>{cfg.facet}</Tag>
            </Space>
            <br />
            <Typography.Text type="secondary">
              {t('support.sim.scenes.updated')}: {cfg.updatedAt}
            </Typography.Text>
          </Typography.Paragraph>
        </div>
        <Space wrap>
          <Button type="primary" ghost icon={<PlayCircleOutlined />} onClick={() => message.success(t('support.sim.configDetail.runDemo'))}>
            {t('support.sim.configDetail.run')}
          </Button>
          <Button icon={<EditOutlined />} onClick={() => message.info(t('support.sim.detail.editDemo'))}>
            {t('support.robot.definition.card.edit')}
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={onDelete}>
            {t('support.robot.definition.card.delete')}
          </Button>
        </Space>
      </div>

      <div className="sim-detail-page__grid">
        <div>
          <Card size="small" title={t('support.sim.create.asset.field.description')} style={{ marginBottom: 16, borderColor: token.colorBorderSecondary }}>
            <Typography.Paragraph style={{ marginBottom: 0 }}>{cfg.description}</Typography.Paragraph>
          </Card>

          <Card size="small" title={t('support.sim.configDetail.section.execution')} style={{ marginBottom: 16, borderColor: token.colorBorderSecondary }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label={t('support.sim.create.config.field.actionType')}>
                {actionTypeLabel(t, cfg.actionType)}
              </Descriptions.Item>
              <Descriptions.Item label={t('support.sim.create.config.field.termination')}>
                {terminationLabel(t, cfg.terminationCondition)}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card size="small" title={t('support.sim.create.config.field.targetAssets')} style={{ marginBottom: 16, borderColor: token.colorBorderSecondary }}>
            <Space direction="vertical" size={10} style={{ width: '100%' }}>
              {targets.length === 0 ? (
                <Typography.Text type="secondary">{t('support.sim.configDetail.noTargets')}</Typography.Text>
              ) : (
                targets.map((a) =>
                  a ? (
                    <div key={a.id} className="sim-detail-target-card">
                      <img src={previewUrl(`cfg-tgt-${a.id}`, 88, 88)} alt="" />
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

          <Card size="small" title={t('support.sim.create.config.field.observation')} style={{ marginBottom: 16, borderColor: token.colorBorderSecondary }}>
            <List
              size="small"
              dataSource={cfg.observationTargets}
              locale={{ emptyText: t('support.sim.configDetail.emptyList') }}
              renderItem={(item) => <List.Item style={{ padding: '6px 0' }}>{item}</List.Item>}
            />
          </Card>

          <Card size="small" title={t('support.sim.create.config.field.events')} style={{ borderColor: token.colorBorderSecondary }}>
            <List
              size="small"
              dataSource={cfg.eventConditions}
              locale={{ emptyText: t('support.sim.configDetail.emptyList') }}
              renderItem={(item) => (
                <List.Item style={{ padding: '6px 0' }}>
                  <Typography.Text code style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {item}
                  </Typography.Text>
                </List.Item>
              )}
            />
          </Card>
        </div>

        <aside>
          <Card size="small" title={t('support.sim.configDetail.summaryTitle')} style={{ borderColor: token.colorBorderSecondary }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label={t('support.sim.configDetail.summary.assets')}>{cfg.assetsCount}</Descriptions.Item>
              <Descriptions.Item label={t('support.sim.configDetail.summary.events')}>{cfg.eventsCount}</Descriptions.Item>
              <Descriptions.Item label={t('support.sim.configDetail.summary.facet')}>{cfg.facet}</Descriptions.Item>
            </Descriptions>
          </Card>
          <Card size="small" title={t('support.sim.configDetail.quickInfo')} style={{ marginTop: 12, borderColor: token.colorBorderSecondary }}>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0, fontSize: 13 }}>
              {t('support.sim.configDetail.quickInfoBody')}
            </Typography.Paragraph>
          </Card>
        </aside>
      </div>

      <footer className="sim-detail-page__footer">
        <Button icon={<CopyOutlined />} onClick={onDuplicate}>
          {t('support.sim.detail.duplicate')}
        </Button>
      </footer>
    </SupportWorkspaceDrillFrame>
  );
}
