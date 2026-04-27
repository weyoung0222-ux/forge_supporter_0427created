import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { App, Button, Card, Col, Descriptions, Divider, Row, Space, Statistic, Table, Tabs, Tag, Typography, theme } from 'antd';
import { useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import type { SupportCompositionDto } from '../../mocks/supportCompositionsMock';
import {
  getSupportCompositionDetailById,
  getSupportDefinitionDeviceDetail,
  getSupportDefinitionModelDetail,
  getSupportTaskDetail,
  type CompositionDetail,
  type DefinitionDeviceDetail,
  type DefinitionModelDetail,
  type ModelJointRow,
  type TaskDetail,
} from '../../mocks/supportWorkspaceDetailMock';
import { useLocale } from '../../shared/i18n/LocaleProvider';
import '../dev/dev-data-foundry-page.css';
import './support-workspace-detail-page.css';
import { SupportWorkspaceDrillFrame } from './SupportWorkspaceDrillFrame';

export type SupportDetailMode = 'model' | 'device' | 'composition' | 'task';

export interface SupportWorkspaceDetailPageProps {
  entityId: string;
  mode: SupportDetailMode;
  /** Navigate here when Back or unknown id */
  listPath: string;
  embedDrillChrome?: boolean;
}

function modelImg(cpId: string, modelId: string) {
  return `https://picsum.photos/seed/${encodeURIComponent(`cp-${cpId}-m-${modelId}`)}/320/320`;
}

function deviceImg(cpId: string, deviceId: string) {
  return `https://picsum.photos/seed/${encodeURIComponent(`cp-${cpId}-d-${deviceId}`)}/160/160`;
}

function CompositionBundleVisual({ row }: { row: SupportCompositionDto }) {
  return (
    <div className="support-detail-composition-visual">
      <div className="support-detail-composition-visual__model">
        <Typography.Text type="secondary" style={{ fontSize: 11 }}>
          Model
        </Typography.Text>
        <div className="support-detail-composition-visual__model-frame">
          <img src={modelImg(row.id, row.model.id)} alt="" loading="lazy" decoding="async" />
        </div>
        <Typography.Text ellipsis style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
          {row.model.name}
        </Typography.Text>
      </div>
      <div className="support-detail-composition-visual__connector" aria-hidden>
        <PlusOutlined />
      </div>
      <div className="support-detail-composition-visual__devices">
        <Typography.Text type="secondary" style={{ fontSize: 11 }}>
          Devices ({row.devices.length})
        </Typography.Text>
        <div className="support-detail-composition-visual__device-grid">
          {row.devices.map((d) => (
            <div key={d.id} className="support-detail-composition-visual__thumb" title={d.shortName}>
              <img src={deviceImg(row.id, d.id)} alt="" loading="lazy" decoding="async" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type LoadedDetail = DefinitionModelDetail | DefinitionDeviceDetail | CompositionDetail | TaskDetail;

export function SupportWorkspaceDetailPage({ entityId, mode, listPath, embedDrillChrome = false }: SupportWorkspaceDetailPageProps) {
  const { token } = theme.useToken();
  const { t } = useLocale();
  const { message } = App.useApp();
  const navigate = useNavigate();

  const detail = useMemo((): LoadedDetail | null => {
    switch (mode) {
      case 'model':
        return getSupportDefinitionModelDetail(entityId);
      case 'device':
        return getSupportDefinitionDeviceDetail(entityId);
      case 'composition':
        return getSupportCompositionDetailById(entityId);
      case 'task':
        return getSupportTaskDetail(entityId);
      default:
        return null;
    }
  }, [entityId, mode]);

  const subtitleLine = useMemo(() => {
    if (!detail) {
      return '';
    }
    if (detail.kind === 'model') {
      return `${detail.assetKindLabel} · ${detail.source} · ${detail.subtitle}`;
    }
    if (detail.kind === 'device') {
      return `${detail.projectName} · ${detail.subtitle}`;
    }
    if (detail.kind === 'composition') {
      return `${t('support.robot.detail.composition.bundle')} · ${detail.composition.subtitle}`;
    }
    return `${detail.task.taskGroup.name} · ${detail.subtitle}`;
  }, [detail, t]);

  if (!detail) {
    return <Navigate to={listPath} replace />;
  }

  return (
    <div className="domain-workspace-route-root">
      <SupportWorkspaceDrillFrame
        backLabel={t('support.robot.detail.back')}
        onBack={() => navigate(listPath)}
        embedInPortalHeader={embedDrillChrome}
      >
        <div className="support-workspace-detail-page">
        <div className="support-detail-surface">
        <div className="dev-data-foundry-header">
          <div>
            <Typography.Title level={3} className="dev-data-foundry-title domain-content-title" style={{ margin: 0 }}>
              {detail.name}
            </Typography.Title>
            <Typography.Paragraph type="secondary" className="domain-1depth-page-lead" style={{ marginBottom: 0, marginTop: 4 }}>
              {subtitleLine}
            </Typography.Paragraph>
          </div>
          <Space wrap size={8}>
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => message.info(`${t('support.robot.definition.card.editDemoPrefix')}${detail.name}`)}
            >
              {t('support.robot.definition.card.edit')}
            </Button>
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => message.warning(`${t('support.robot.definition.card.deleteDemoPrefix')}${detail.name}`)}
            >
              {t('support.robot.definition.card.delete')}
            </Button>
          </Space>
        </div>

        {detail.kind === 'device' ? (
          <div className="support-workspace-detail-page__device-identity">
            <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 6, fontSize: 12 }}>
              {t('support.robot.detail.device.equipment')}
            </Typography.Text>
            <Space wrap align="start" size={[8, 8]}>
              <Tag color="processing" className="support-workspace-detail-page__device-identity-kind">
                {detail.equipmentKind}
              </Tag>
              <Tag>{detail.deviceClass}</Tag>
            </Space>
            <Typography.Text strong style={{ display: 'block', marginTop: 10, marginBottom: 4 }}>
              {t('support.robot.detail.device.summary')}
            </Typography.Text>
            <Typography.Paragraph className="support-workspace-detail-page__device-identity-summary" style={{ marginBottom: 0 }}>
              {detail.equipmentSummary}
            </Typography.Paragraph>
          </div>
        ) : null}

        {detail.kind === 'composition' ? <CompositionBundleVisual row={detail.composition} /> : null}

        <Row gutter={[16, 16]} className="support-workspace-detail-page__cards">
          <Col xs={24} lg={14}>
            <Card size="small" title={t('support.robot.detail.overview')} bordered>
              <div className="support-workspace-detail-page__card-section">
                <div className="support-workspace-detail-page__card-row">
                  <div>
                    <Typography.Text strong>{detail.sourceActivityLabel}</Typography.Text>
                    <div style={{ marginTop: 4 }}>
                      <Tag>{detail.sourceActivityBadge}</Tag>
                    </div>
                    <Typography.Paragraph type="secondary" style={{ marginBottom: 0, marginTop: 8 }}>
                      {detail.sourceActivityDescription}
                    </Typography.Paragraph>
                  </div>
                </div>
              </div>
              <div className="support-workspace-detail-page__card-section">
                <Typography.Text strong>{t('support.robot.detail.version')}</Typography.Text>
                <Typography.Paragraph style={{ marginBottom: 0, marginTop: 4 }}>
                  {detail.version}
                  <Typography.Text type="secondary">
                    {' · '}
                    {detail.projectName}
                  </Typography.Text>
                </Typography.Paragraph>
              </div>
              <div className="support-workspace-detail-page__card-section">
                <Typography.Text strong>{t('support.robot.detail.storage')}</Typography.Text>
                <Typography.Paragraph style={{ marginBottom: 0, marginTop: 4 }}>
                  {detail.storageSize}
                  <Typography.Text type="secondary"> · {detail.createdRelative}</Typography.Text>
                </Typography.Paragraph>
              </div>
              {detail.kind === 'task' ? (
                <div className="support-workspace-detail-page__card-section">
                  <Typography.Text strong>{t('support.robot.detail.task.projects')}</Typography.Text>
                  <div style={{ marginTop: 8 }}>
                    <Space wrap size={[4, 4]}>
                      {detail.consumingProjects.map((p) => (
                        <Tag key={`${p.id}-${p.name}`} title={p.role}>
                          {p.name}
                          {p.role ? ` (${p.role})` : ''}
                        </Tag>
                      ))}
                    </Space>
                  </div>
                </div>
              ) : null}
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            <Card size="small" title={t('support.robot.detail.usage')} bordered>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic title={t('support.robot.detail.downloads7d')} value={detail.downloads7d} />
                </Col>
                <Col span={12}>
                  <Statistic title={t('support.robot.detail.linkedProjects')} value={detail.linkedProjects.length} />
                </Col>
              </Row>
              <Typography.Text type="secondary" style={{ display: 'block', marginTop: 12, fontSize: 12 }}>
                {detail.linkedProjects.map((p) => p.id).join(', ')}
              </Typography.Text>
              <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${token.colorBorderSecondary}` }}>
                <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
                  {t('support.robot.detail.rfm')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" style={{ marginBottom: 4, fontSize: 13 }}>
                  {t('support.robot.detail.recency')}: {detail.rfm.recencyLabel}
                </Typography.Paragraph>
                <Typography.Paragraph type="secondary" style={{ marginBottom: 4, fontSize: 13 }}>
                  {t('support.robot.detail.frequency7d')}: {detail.rfm.frequency7d}
                </Typography.Paragraph>
                <Typography.Paragraph type="secondary" style={{ marginBottom: 0, fontSize: 13 }}>
                  {t('support.robot.detail.adoption')}: {detail.rfm.adoptionScore}
                </Typography.Paragraph>
              </div>
              {detail.kind === 'task' ? (
                <Row gutter={[16, 8]} style={{ marginTop: 12 }}>
                  <Col span={12}>
                    <Statistic title={t('support.robot.detail.task.runs')} value={detail.weeklyRuns} />
                  </Col>
                  <Col span={12}>
                    <Statistic title={t('support.robot.detail.task.blockers')} value={detail.openBlockers} />
                  </Col>
                </Row>
              ) : null}
            </Card>
          </Col>
        </Row>

        {detail.kind === 'model' ? (
          <Card
            size="small"
            bordered
            className="support-workspace-detail-page__model-deep"
            style={{ marginBottom: 16 }}
            title={t('support.robot.detail.model.robotSection')}
          >
            <Descriptions
              bordered
              size="small"
              column={{ xs: 1, sm: 2, md: 3 }}
              items={[
                { key: 'p', label: t('support.robot.detail.model.platform'), children: detail.robotPlatform },
                { key: 'd', label: t('support.robot.detail.model.dof'), children: detail.dof },
                { key: 'r', label: t('support.robot.detail.model.reach'), children: detail.reachMm },
                { key: 'pay', label: t('support.robot.detail.model.payload'), children: detail.payloadKg },
                { key: 'm', label: t('support.robot.detail.model.mass'), children: detail.massKg },
                {
                  key: 'bf',
                  label: t('support.robot.detail.model.baseFrame'),
                  children: <Typography.Text code>{detail.baseFrame}</Typography.Text>,
                },
                {
                  key: 'tf',
                  label: t('support.robot.detail.model.toolFrame'),
                  children: <Typography.Text code>{detail.toolFrame}</Typography.Text>,
                },
                {
                  key: 'c',
                  label: t('support.robot.detail.model.controller'),
                  span: { xs: 1, sm: 2, md: 3 },
                  children: detail.controllerRuntime,
                },
              ]}
            />
            <Divider style={{ margin: '16px 0' }} />
            <Typography.Text strong>{t('support.robot.detail.model.structure')}</Typography.Text>
            <Typography.Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
              {detail.kinematicChainSummary}
            </Typography.Paragraph>
            <Divider style={{ margin: '16px 0' }} />
            <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t('support.robot.detail.model.joints')}
            </Typography.Text>
            <Table<ModelJointRow>
              size="small"
              pagination={false}
              rowKey="key"
              dataSource={detail.jointTable}
              columns={[
                { title: t('support.robot.detail.model.col.joint'), dataIndex: 'name', key: 'name' },
                { title: t('support.robot.detail.model.col.type'), dataIndex: 'jointType', key: 'jointType' },
                { title: t('support.robot.detail.model.col.limits'), dataIndex: 'limits', key: 'limits' },
              ]}
            />
            <Divider style={{ margin: '16px 0' }} />
            <Typography.Text strong>{t('support.robot.detail.model.calibration')}</Typography.Text>
            <Typography.Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
              {detail.calibrationNote}
            </Typography.Paragraph>
          </Card>
        ) : null}

        <Tabs
          className="support-detail-tabs"
          defaultActiveKey="lineage"
          items={[
            {
              key: 'lineage',
              label: t('support.robot.detail.tabs.lineage'),
              children: (
                <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                  {t('support.robot.detail.placeholder')} <Typography.Text code>{detail.routePlaceholder}</Typography.Text>
                </Typography.Paragraph>
              ),
            },
            {
              key: 'metrics',
              label: t('support.robot.detail.tabs.metrics'),
              children: (
                <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                  Extended metrics, cohorts, and audit trails (prototype).
                </Typography.Paragraph>
              ),
            },
            {
              key: 'actions',
              label: t('support.robot.detail.tabs.actions'),
              children: (
                <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                  Promote, deprecate, clone, and ACL (prototype).
                </Typography.Paragraph>
              ),
            },
          ]}
        />

        <div className="support-workspace-detail-page__placeholder" style={{ marginTop: 16 }}>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            {t('support.robot.detail.placeholder')}
          </Typography.Paragraph>
        </div>
        </div>
        </div>
      </SupportWorkspaceDrillFrame>
    </div>
  );
}
