import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { App, Button, Card, Descriptions, Divider, Space, Table, Tabs, Tag, Typography, theme } from 'antd';
import { Fragment, useEffect, useMemo } from 'react';
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
import { supportRobotWorkspaceDetailPath, supportRobotWorkspaceEditPath, type SupportDrillToolbarAction } from '../../shared/config/supportPaths';
import { useLocale } from '../../shared/i18n/LocaleProvider';
import '../dev/dev-data-foundry-page.css';
import './support-workspace-detail-page.css';
import { SupportWorkspaceDrillFrame } from './SupportWorkspaceDrillFrame';

export type SupportDetailMode = 'model' | 'device' | 'composition' | 'task';

function supportDetailModeToLnb(mode: SupportDetailMode): string {
  switch (mode) {
    case 'model':
      return 'definition-robot';
    case 'device':
      return 'definition-devices';
    case 'composition':
      return 'compositions';
    case 'task':
      return 'task';
    default:
      return 'definition-robot';
  }
}

function compositionUrdfModeLabel(t: (k: string) => string, mode: SupportCompositionDto['urdfCompositionMode'] | undefined): string {
  return mode === 'applied' ? t('support.robot.create.composition.urdfMode.applied') : t('support.robot.create.composition.urdfMode.model');
}

function taskStatusTagColor(status: string): 'success' | 'processing' | 'default' {
  if (status === 'active') return 'success';
  if (status === 'done') return 'processing';
  return 'default';
}

export interface SupportWorkspaceDetailPageProps {
  entityId: string;
  mode: SupportDetailMode;
  /** Navigate here when Back or unknown id */
  listPath: string;
  embedDrillChrome?: boolean;
}

function modelImgHero(cpId: string, modelId: string) {
  return `https://picsum.photos/seed/${encodeURIComponent(`cp-${cpId}-m-${modelId}`)}/560/560`;
}

function deviceImgHero(cpId: string, deviceId: string) {
  return `https://picsum.photos/seed/${encodeURIComponent(`cp-${cpId}-d-${deviceId}`)}/320/320`;
}

/** Standalone catalog detail — deterministic preview per entity id */
function definitionModelCatalogImg(modelId: string) {
  return `https://picsum.photos/seed/${encodeURIComponent(`catalog-model-${modelId}`)}/560/560`;
}

function definitionDeviceCatalogImg(deviceId: string) {
  return `https://picsum.photos/seed/${encodeURIComponent(`catalog-device-${deviceId}`)}/480/480`;
}

function CompositionDetailHero({ row }: { row: SupportCompositionDto }) {
  const navigate = useNavigate();
  const { t } = useLocale();
  const { token } = theme.useToken();

  const goModel = () => {
    navigate(supportRobotWorkspaceDetailPath('definition-robot', row.model.id), {
      state: { returnLnb: 'compositions' as const },
    });
  };

  const goDevice = (deviceId: string) => {
    navigate(supportRobotWorkspaceDetailPath('definition-devices', deviceId), {
      state: { returnLnb: 'compositions' as const },
    });
  };

  const nodes = [{ kind: 'model' as const, id: row.model.id, name: row.model.name }, ...row.devices.map((d) => ({ kind: 'device' as const, id: d.id, name: d.shortName, role: d.deviceRole }))];

  return (
    <Card
      size="small"
      bordered
      className="support-workspace-detail-page__model-deep support-detail-composition-hero-card"
      title="Robot Configuration"
      style={{ borderColor: token.colorBorderSecondary }}
    >
      <div className="support-detail-composition-hero">
        <div className="support-detail-composition-hero__track">
          {nodes.map((node, idx) => (
            <Fragment key={node.id}>
              {idx > 0 ? (
                <div className="support-detail-composition-hero__connector" aria-hidden>
                  <PlusOutlined />
                </div>
              ) : null}
              <div
                role="button"
                tabIndex={0}
                className="support-detail-composition-hero__card support-detail-composition-hero__card--node"
                style={{ borderColor: token.colorBorderSecondary }}
                onClick={() => (node.kind === 'model' ? goModel() : goDevice(node.id))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    node.kind === 'model' ? goModel() : goDevice(node.id);
                  }
                }}
              >
                <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 6 }}>
                  {node.kind === 'model' ? t('support.robot.compositions.card.model') : t('support.robot.compositions.card.devices')}
                </Typography.Text>
                <div className="support-detail-composition-hero__img-wrap">
                  <img
                    src={node.kind === 'model' ? modelImgHero(row.id, node.id) : deviceImgHero(row.id, node.id)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <Typography.Text strong ellipsis style={{ fontSize: 13, display: 'block', marginTop: 8 }}>
                  {node.name}
                </Typography.Text>
                {node.kind === 'device' && node.role ? (
                  <Typography.Text type="secondary" ellipsis style={{ fontSize: 11, display: 'block', marginTop: 2 }}>
                    {node.role}
                  </Typography.Text>
                ) : null}
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </Card>
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
      return `${detail.assetKindLabel} · ${detail.source} · ${detail.manufacturer} ${detail.modelName}`;
    }
    if (detail.kind === 'device') {
      const typePart = detail.deviceCatalogType
        ? t(`support.robot.create.device.catalogType.${detail.deviceCatalogType}`)
        : null;
      const identity = [detail.manufacturer, detail.modelName].filter(Boolean).join(' · ');
      return [typePart, identity].filter(Boolean).join(' · ');
    }
    if (detail.kind === 'composition') {
      return `${t('support.robot.detail.composition.bundle')} · ${detail.composition.subtitle}`;
    }
    return `${detail.task.taskType.name} · ${detail.subtitle}`;
  }, [detail, t]);

  useEffect(() => {
    if (!embedDrillChrome || !detail) return;
    const onAction = (evt: Event) => {
      const action = (evt as CustomEvent<SupportDrillToolbarAction>).detail;
      if (action === 'edit') {
        navigate(supportRobotWorkspaceEditPath(supportDetailModeToLnb(mode), entityId));
      } else if (action === 'delete') {
        message.warning(`${t('support.robot.definition.card.deleteDemoPrefix')}${detail.name}`);
      }
    };
    window.addEventListener('support-drill-action', onAction as EventListener);
    return () => window.removeEventListener('support-drill-action', onAction as EventListener);
  }, [detail, embedDrillChrome, entityId, message, mode, navigate, t]);

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
        <Card
          size="small"
          bordered
          className="support-workspace-detail-page__hero-summary-card"
          style={{ borderColor: token.colorBorderSecondary }}
        >
          <div className="dev-data-foundry-header">
            <div>
              <Typography.Title level={3} className="dev-data-foundry-title domain-content-title" style={{ margin: 0 }}>
                {detail.name}
              </Typography.Title>
              <Typography.Paragraph type="secondary" className="domain-1depth-page-lead" style={{ marginBottom: 0, marginTop: 4 }}>
                {subtitleLine}
              </Typography.Paragraph>
            </div>
            {!embedDrillChrome ? (
              <Space wrap size={8}>
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => navigate(supportRobotWorkspaceEditPath(supportDetailModeToLnb(mode), entityId))}
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
            ) : null}
          </div>
        </Card>

        {detail.kind === 'device' ? (
          <>
            <Card
              size="small"
              bordered
              className="support-workspace-detail-page__device-deep support-detail-model-basic-card"
              style={{ borderColor: token.colorBorderSecondary }}
              title={t('support.robot.detail.device.basicSection')}
            >
              <div className="support-detail-model-basic">
                <div className="support-detail-model-basic__image">
                  <div className="support-detail-definition-preview__img-wrap">
                    <img src={definitionDeviceCatalogImg(detail.id)} alt="" loading="lazy" decoding="async" />
                  </div>
                </div>
                <div className="support-detail-model-basic__fields">
                  <Descriptions bordered size="small" column={{ xs: 1, sm: 2, md: 3 }}>
                    <Descriptions.Item label={t('support.robot.detail.model.manufacturer')}>{detail.manufacturer}</Descriptions.Item>
                    <Descriptions.Item label={t('support.robot.detail.model.modelName')}>{detail.modelName}</Descriptions.Item>
                    <Descriptions.Item label={t('support.robot.detail.model.modelVariant')}>{detail.modelVariant}</Descriptions.Item>
                    <Descriptions.Item label={t('support.robot.detail.model.displayName')}>{detail.displayName}</Descriptions.Item>
                    <Descriptions.Item label={t('support.robot.detail.model.description')} span={{ xs: 1, sm: 2 }}>
                      {detail.description}
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              </div>
            </Card>

            <Card
              size="small"
              bordered
              className="support-workspace-detail-page__device-deep"
              style={{ borderColor: token.colorBorderSecondary }}
              title={t('support.robot.detail.device.classifySection')}
            >
              <Descriptions bordered size="small" column={{ xs: 1, sm: 2, md: 3 }}>
                <Descriptions.Item label={t('support.robot.create.device.field.deviceCatalogType')}>
                  {detail.deviceCatalogType ? t(`support.robot.create.device.catalogType.${detail.deviceCatalogType}`) : '—'}
                </Descriptions.Item>
                <Descriptions.Item label={t('support.robot.create.device.field.deviceSubtype')}>
                  {detail.deviceSubtype ? t(`support.robot.create.device.subtype.${detail.deviceSubtype}`) : '—'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card
              size="small"
              bordered
              className="support-workspace-detail-page__device-deep"
              style={{ borderColor: token.colorBorderSecondary }}
              title={t('support.robot.detail.device.urdfSection')}
            >
              <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                {t('support.robot.detail.device.urdfPlaceholder')}
              </Typography.Paragraph>
            </Card>
          </>
        ) : null}

        {detail.kind === 'composition' ? (
          <>
            <CompositionDetailHero row={detail.composition} />
            <Card
              size="small"
              bordered
              className="support-workspace-detail-page__model-deep"
              title={t('support.robot.create.composition.section.step1')}
              style={{ borderColor: token.colorBorderSecondary }}
            >
              <Descriptions bordered size="small" column={{ xs: 1, sm: 2, md: 2 }}>
                <Descriptions.Item label={t('support.robot.create.composition.field.model')} span={2}>
                  {detail.composition.model.name}
                </Descriptions.Item>
                <Descriptions.Item label={t('support.robot.detail.composition.catalogModelId')} span={2}>
                  <Typography.Text code>{detail.composition.model.id}</Typography.Text>
                </Descriptions.Item>
                <Descriptions.Item label={t('support.robot.create.composition.field.displayName')} span={2}>
                  {detail.composition.name}
                </Descriptions.Item>
                <Descriptions.Item label={t('support.robot.create.composition.field.description')} span={2}>
                  {detail.composition.subtitle?.trim() ? detail.composition.subtitle : '—'}
                </Descriptions.Item>
                <Descriptions.Item label={t('support.robot.detail.composition.bundleId')}>
                  <Typography.Text code>{detail.composition.id}</Typography.Text>
                </Descriptions.Item>
                <Descriptions.Item label={t('support.robot.connections.detail.updated')}>{detail.composition.updatedAt}</Descriptions.Item>
              </Descriptions>
            </Card>
            <Card
              size="small"
              bordered
              className="support-workspace-detail-page__model-deep"
              title={t('support.robot.create.composition.section.step2')}
              style={{ borderColor: token.colorBorderSecondary }}
            >
              {detail.composition.devices.length === 0 ? (
                <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                  —
                </Typography.Paragraph>
              ) : (
                <Table
                  size="small"
                  pagination={false}
                  rowKey="id"
                  dataSource={detail.composition.devices}
                  columns={[
                    { title: t('support.robot.detail.composition.col.deviceLabel'), dataIndex: 'shortName', key: 'shortName' },
                    {
                      title: t('support.robot.detail.composition.col.mountRole'),
                      dataIndex: 'deviceRole',
                      key: 'deviceRole',
                      render: (v: string | undefined) => (v?.trim() ? v : '—'),
                    },
                    {
                      title: t('support.robot.detail.composition.col.deviceCatalogId'),
                      dataIndex: 'id',
                      key: 'id',
                      render: (v: string) => <Typography.Text code>{v}</Typography.Text>,
                    },
                  ]}
                />
              )}
            </Card>
            <Card
              size="small"
              bordered
              className="support-workspace-detail-page__model-deep"
              title={t('support.robot.create.composition.section.step3')}
              style={{ borderColor: token.colorBorderSecondary }}
            >
              <Descriptions bordered size="small" column={1}>
                <Descriptions.Item label={t('support.robot.create.composition.field.urdfMode')}>
                  {compositionUrdfModeLabel(t, detail.composition.urdfCompositionMode)}
                </Descriptions.Item>
              </Descriptions>
            </Card>
            <Card
              size="small"
              bordered
              className="support-workspace-detail-page__model-deep"
              title={t('support.robot.create.composition.section.step4')}
              style={{ borderColor: token.colorBorderSecondary }}
            >
              <Descriptions bordered size="small" column={1}>
                <Descriptions.Item label={t('support.robot.create.composition.field.actionConfigKeys')}>
                  {(detail.composition.actionConfigKeys?.length ?? 0) > 0 ? (
                    <Space wrap size={[6, 6]}>
                      {(detail.composition.actionConfigKeys ?? []).map((k) => (
                        <Tag key={k}>{k}</Tag>
                      ))}
                    </Space>
                  ) : (
                    '—'
                  )}
                </Descriptions.Item>
                <Descriptions.Item label={t('support.robot.create.composition.field.modalitySchemas')}>
                  {(detail.composition.modalitySchemasSelected?.length ?? 0) > 0 ? (
                    <Space wrap size={[6, 6]}>
                      {(detail.composition.modalitySchemasSelected ?? []).map((s) => (
                        <Tag key={s} color="blue">
                          {s}
                        </Tag>
                      ))}
                    </Space>
                  ) : (
                    '—'
                  )}
                </Descriptions.Item>
                <Descriptions.Item label={t('support.robot.create.composition.field.modalityUrdfMapping')}>
                  {detail.composition.modalityUrdfMappingNotes?.trim() ? (
                    <Typography.Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>
                      {detail.composition.modalityUrdfMappingNotes}
                    </Typography.Paragraph>
                  ) : (
                    '—'
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </>
        ) : null}

        {detail.kind === 'task' ? (
          <>
            <Card
              size="small"
              bordered
              className="support-workspace-detail-page__model-deep"
              title={t('support.robot.detail.task.summarySection')}
              style={{ borderColor: token.colorBorderSecondary }}
            >
              <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                <Descriptions.Item label={t('support.robot.detail.task.entityId')}>
                  <Typography.Text code>{detail.task.id}</Typography.Text>
                </Descriptions.Item>
                <Descriptions.Item label={t('support.robot.detail.task.displayTitle')}>{detail.task.title}</Descriptions.Item>
                <Descriptions.Item label={t('support.robot.edit.field.projectName')}>{detail.task.projectName}</Descriptions.Item>
                <Descriptions.Item label={t('support.robot.detail.task.statusLabel')}>
                  <Tag color={taskStatusTagColor(detail.task.status)}>{detail.task.status}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label={t('support.robot.connections.detail.updated')}>{detail.task.updatedAt}</Descriptions.Item>
                <Descriptions.Item label={t('support.robot.create.taskType.field.taskType')}>
                  {detail.task.taskType.name} ({detail.task.taskType.code})
                </Descriptions.Item>
              </Descriptions>
            </Card>
            <Card
              size="small"
              bordered
              className="support-workspace-detail-page__model-deep"
              title={t('support.robot.detail.task.subtypeSection')}
              style={{ borderColor: token.colorBorderSecondary }}
            >
              <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                <Descriptions.Item label={t('support.robot.detail.task.subtypeCode')}>{detail.task.subtypeCode}</Descriptions.Item>
                <Descriptions.Item label={t('support.robot.create.taskType.field.subtypeDisplayName')}>{detail.task.title}</Descriptions.Item>
                <Descriptions.Item label={t('support.robot.create.taskType.field.subtypeDescription')} span={2}>
                  {detail.task.taskDescription}
                </Descriptions.Item>
                {detail.task.example ? (
                  <Descriptions.Item label={t('support.robot.create.taskType.field.example')} span={2}>
                    {detail.task.example}
                  </Descriptions.Item>
                ) : null}
              </Descriptions>
            </Card>
            <Card
              size="small"
              bordered
              className="support-workspace-detail-page__model-deep"
              title={t('support.robot.detail.task.taskTypeSection')}
              style={{ borderColor: token.colorBorderSecondary }}
            >
              <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                <Descriptions.Item label={t('support.robot.detail.task.taskTypeCode')}>{detail.task.taskType.code}</Descriptions.Item>
                <Descriptions.Item label={t('support.robot.detail.task.taskTypeName')}>{detail.task.taskType.name}</Descriptions.Item>
                <Descriptions.Item label={t('support.robot.detail.task.groupKind')}>{detail.task.taskType.kind}</Descriptions.Item>
                <Descriptions.Item label={t('support.robot.detail.task.taskTypeEnabled')}>
                  {detail.task.taskType.enabled ? t('support.robot.create.composition.step3.movable.yes') : t('support.robot.create.composition.step3.movable.no')}
                </Descriptions.Item>
                {detail.task.taskType.description ? (
                  <Descriptions.Item label={t('support.robot.detail.task.taskTypeDescription')} span={2}>
                    {detail.task.taskType.description}
                  </Descriptions.Item>
                ) : null}
              </Descriptions>
            </Card>
            <Card
              size="small"
              bordered
              className="support-workspace-detail-page__model-deep"
              title={t('support.robot.detail.task.compositionSection')}
              style={{ borderColor: token.colorBorderSecondary }}
            >
              <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                <Descriptions.Item label={t('support.robot.detail.task.requiredComposition')}>{detail.task.requiredCompositionName}</Descriptions.Item>
                <Descriptions.Item label={t('support.robot.detail.task.compositionId')}>
                  <Typography.Text code>{detail.task.requiredCompositionId}</Typography.Text>
                </Descriptions.Item>
                <Descriptions.Item label={t('support.robot.detail.task.requiredModality')} span={2}>
                  {detail.task.requiredModality}
                </Descriptions.Item>
              </Descriptions>
            </Card>
            <Card
              size="small"
              bordered
              className="support-workspace-detail-page__model-deep"
              title={t('support.robot.detail.task.usageSection')}
              style={{ borderColor: token.colorBorderSecondary }}
            >
              <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                <Descriptions.Item label={t('support.robot.detail.task.runs')}>{detail.weeklyRuns}</Descriptions.Item>
                <Descriptions.Item label={t('support.robot.detail.task.blockers')}>{detail.openBlockers}</Descriptions.Item>
              </Descriptions>
              <Divider style={{ margin: '16px 0' }} />
              <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t('support.robot.detail.task.projects')}
              </Typography.Text>
              <Space direction="vertical" size={6} style={{ width: '100%' }}>
                {detail.consumingProjects.map((p) => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <Typography.Text strong>{p.name}</Typography.Text>
                    {p.role ? (
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        {p.role}
                      </Typography.Text>
                    ) : null}
                  </div>
                ))}
              </Space>
            </Card>
          </>
        ) : null}

        {detail.kind === 'model' ? (
          <>
            <Card
              size="small"
              bordered
              className="support-workspace-detail-page__model-deep support-detail-model-basic-card"
              title={t('support.robot.detail.model.basicSection')}
              style={{ borderColor: token.colorBorderSecondary }}
            >
              <div className="support-detail-model-basic">
                <div className="support-detail-model-basic__image">
                  <div className="support-detail-definition-preview__img-wrap">
                    <img src={definitionModelCatalogImg(detail.id)} alt="" loading="lazy" decoding="async" />
                  </div>
                </div>
                <div className="support-detail-model-basic__fields">
                  <Descriptions bordered size="small" column={{ xs: 1, sm: 2, md: 3 }}>
                    <Descriptions.Item label={t('support.robot.detail.model.manufacturer')}>{detail.manufacturer}</Descriptions.Item>
                    <Descriptions.Item label={t('support.robot.detail.model.modelName')}>{detail.modelName}</Descriptions.Item>
                    <Descriptions.Item label={t('support.robot.detail.model.modelVariant')}>{detail.modelVariant}</Descriptions.Item>
                    <Descriptions.Item label={t('support.robot.detail.model.displayName')}>{detail.displayName}</Descriptions.Item>
                    <Descriptions.Item label={t('support.robot.detail.model.description')} span={2}>
                      {detail.description}
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              </div>
            </Card>

            {detail.formFactor != null ||
            detail.locomotionType != null ||
            detail.manipulatorStructure != null ||
            detail.dof != null ||
            detail.payloadKg != null ||
            detail.reachMm != null ||
            detail.weightKg != null ||
            detail.repeatabilityMm != null ||
            detail.defaultSensors.length > 0 ? (
              <Card
                size="small"
                bordered
                className="support-workspace-detail-page__model-deep"
                title={t('support.robot.detail.model.classifySection')}
              >
                {detail.formFactor != null ||
                detail.locomotionType != null ||
                detail.manipulatorStructure != null ||
                detail.dof != null ||
                detail.payloadKg != null ||
                detail.reachMm != null ||
                detail.weightKg != null ||
                detail.repeatabilityMm != null ? (
                  <Descriptions bordered size="small" column={{ xs: 1, sm: 2, md: 3 }}>
                    {detail.formFactor != null ? (
                      <Descriptions.Item label={t('support.robot.detail.model.formFactor')}>{detail.formFactor}</Descriptions.Item>
                    ) : null}
                    {detail.locomotionType != null ? (
                      <Descriptions.Item label={t('support.robot.detail.model.locomotionType')}>{detail.locomotionType}</Descriptions.Item>
                    ) : null}
                    {detail.manipulatorStructure != null ? (
                      <Descriptions.Item label={t('support.robot.detail.model.manipulatorStructure')}>
                        {detail.manipulatorStructure}
                      </Descriptions.Item>
                    ) : null}
                    {detail.dof != null ? (
                      <Descriptions.Item label={t('support.robot.detail.model.dof')}>{detail.dof}</Descriptions.Item>
                    ) : null}
                    {detail.payloadKg != null ? (
                      <Descriptions.Item label={t('support.robot.detail.model.payload')}>{detail.payloadKg}</Descriptions.Item>
                    ) : null}
                    {detail.reachMm != null ? (
                      <Descriptions.Item label={t('support.robot.detail.model.reach')}>{detail.reachMm}</Descriptions.Item>
                    ) : null}
                    {detail.weightKg != null ? (
                      <Descriptions.Item label={t('support.robot.detail.model.weight')}>{detail.weightKg}</Descriptions.Item>
                    ) : null}
                    {detail.repeatabilityMm != null ? (
                      <Descriptions.Item label={t('support.robot.detail.model.repeatability')}>{detail.repeatabilityMm}</Descriptions.Item>
                    ) : null}
                  </Descriptions>
                ) : null}
                {detail.defaultSensors.length > 0 ? (
                  <>
                    <Divider style={{ margin: '16px 0' }} />
                    <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
                      {t('support.robot.detail.model.defaultSensors')}
                    </Typography.Text>
                    <Space wrap size={[6, 6]}>
                      {detail.defaultSensors.map((s) => (
                        <Tag key={s}>{s}</Tag>
                      ))}
                    </Space>
                  </>
                ) : null}
              </Card>
            ) : null}

            {detail.modalitySchemas.length > 0 ||
            detail.controlMethods.length > 0 ||
            detail.jointTable.length > 0 ||
            (detail.calibrationNote != null && detail.calibrationNote.trim() !== '') ? (
              <Card
                size="small"
                bordered
                className="support-workspace-detail-page__model-deep"
                title={t('support.robot.detail.model.refAssetSection')}
              >
                {detail.modalitySchemas.length > 0 ? (
                  <>
                    <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
                      {t('support.robot.detail.model.modalitySchemas')}
                    </Typography.Text>
                    <Space wrap size={[6, 6]} style={{ marginBottom: 16 }}>
                      {detail.modalitySchemas.map((s) => (
                        <Tag key={s} color="blue">
                          {s}
                        </Tag>
                      ))}
                    </Space>
                  </>
                ) : null}
                {detail.controlMethods.length > 0 ? (
                  <>
                    <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
                      {t('support.robot.detail.model.controlMethods')}
                    </Typography.Text>
                    <Space wrap size={[6, 6]} style={{ marginBottom: 16 }}>
                      {detail.controlMethods.map((m) => (
                        <Tag key={m} color="green">
                          {m}
                        </Tag>
                      ))}
                    </Space>
                  </>
                ) : null}
                {detail.jointTable.length > 0 ? (
                  <>
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
                  </>
                ) : null}
                {detail.calibrationNote != null && detail.calibrationNote.trim() !== '' ? (
                  <>
                    <Divider style={{ margin: '16px 0' }} />
                    <Typography.Text strong>{t('support.robot.detail.model.calibration')}</Typography.Text>
                    <Typography.Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
                      {detail.calibrationNote}
                    </Typography.Paragraph>
                  </>
                ) : null}
              </Card>
            ) : null}
          </>
        ) : null}

        {detail.kind === 'task' ? (
          <Card
            size="small"
            bordered
            className="support-workspace-detail-page__tabs-card"
            title={t('support.robot.detail.section.lineageMetricsActions')}
            style={{ marginBottom: 0, borderColor: token.colorBorderSecondary }}
          >
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
          </Card>
        ) : null}

        </div>
      </SupportWorkspaceDrillFrame>
    </div>
  );
}
