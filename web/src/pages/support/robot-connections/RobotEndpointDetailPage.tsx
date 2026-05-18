import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { App, Button, Card, Col, Descriptions, Divider, Modal, Row, Space, Tag, Typography, theme } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  deleteRobotEndpoint,
  formatDemoDateTime,
  getRobotConnectionStatusTableMock,
  getRobotEndpointById,
  runHealthCheckForEndpointDemo,
  syncConnectionStatusFromEndpoint,
  upsertRobotEndpoint,
  type RobotEndpointDto,
} from '../../../mocks/robotConnectionsMocks';
import { getSupportCompositionsMock } from '../../../mocks/supportCompositionsMock';
import { supportRobotWorkspaceEditPath, supportWorkspacePath, type SupportDrillToolbarAction } from '../../../shared/config/supportPaths';
import { useLocale } from '../../../shared/i18n/LocaleProvider';
import { SupportWorkspaceDrillFrame } from '../SupportWorkspaceDrillFrame';
import '../support-workspace-detail-page.css';
import './robot-connections-pages.css';

function statusTagForEndpoint(t: (k: string) => string, s: RobotEndpointDto['status']) {
  if (s === 'connected') return <Tag color="success">{t('support.robot.connections.status.connected')}</Tag>;
  if (s === 'error') return <Tag color="error">{t('support.robot.connections.status.error')}</Tag>;
  if (s === 'reconnecting') return <Tag color="warning">{t('support.robot.connections.sessions.status.reconnecting')}</Tag>;
  return <Tag color="default">{t('support.robot.connections.status.disconnected')}</Tag>;
}

export interface RobotEndpointDetailPageProps {
  endpointId: string;
  embedDrillChrome?: boolean;
}

export function RobotEndpointDetailPage({ endpointId, embedDrillChrome = false }: RobotEndpointDetailPageProps) {
  const { token } = theme.useToken();
  const { t } = useLocale();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const returnLnb =
    (location.state as { returnLnb?: 'instances-endpoints' } | null)?.returnLnb ?? 'instances-endpoints';
  const listPath = supportWorkspacePath('robot-support', returnLnb);

  const [tick, setTick] = useState(0);
  const [livePulse, setLivePulse] = useState(0);
  const [reconnecting, setReconnecting] = useState(false);
  const [testing, setTesting] = useState(false);
  const [healthBusy, setHealthBusy] = useState(false);

  const ep = useMemo(() => getRobotEndpointById(endpointId), [endpointId, tick]);
  const composition = useMemo(() => {
    if (!ep) return null;
    return getSupportCompositionsMock().find((c) => c.id === ep.compositionId) ?? null;
  }, [ep, tick]);

  const statusRow = useMemo(() => {
    return getRobotConnectionStatusTableMock().find((r) => r.endpointId === endpointId) ?? null;
  }, [endpointId, tick, livePulse]);

  useEffect(() => {
    const id = window.setInterval(() => setLivePulse((n) => n + 1), 2500);
    return () => window.clearInterval(id);
  }, []);

  const refresh = () => setTick((n) => n + 1);

  const setStatus = (status: RobotEndpointDto['status'], latencyMs?: number) => {
    if (!ep) return;
    const stamp = formatDemoDateTime();
    const nextLat = latencyMs ?? (status === 'connected' ? Math.max(ep.latencyMs, 10) : 0);
    upsertRobotEndpoint({
      ...ep,
      status,
      latencyMs: nextLat,
      updatedAt: new Date().toISOString().slice(0, 10),
      lastSeenAt: stamp,
    });
    syncConnectionStatusFromEndpoint(ep.id);
    refresh();
  };

  const onReconnect = () => {
    if (!ep) return;
    setReconnecting(true);
    window.setTimeout(() => {
      setStatus('connected', Math.floor(Math.random() * 28) + 10);
      setReconnecting(false);
      message.success(t('support.robot.connections.detail.reconnectDone'));
    }, 1100);
  };

  const onTestConnection = () => {
    if (!ep) return;
    setTesting(true);
    window.setTimeout(() => {
      const ok = Math.random() > 0.2;
      if (ok) {
        const stamp = formatDemoDateTime();
        upsertRobotEndpoint({
          ...ep,
          latencyMs: Math.floor(Math.random() * 40) + 6,
          updatedAt: new Date().toISOString().slice(0, 10),
          lastSeenAt: stamp,
        });
        syncConnectionStatusFromEndpoint(ep.id);
        refresh();
        message.success(t('support.robot.connections.endpoint.test.success'));
      } else {
        message.error(t('support.robot.connections.endpoint.test.fail'));
      }
      setTesting(false);
    }, 900);
  };

  const onHealthCheck = () => {
    if (!ep) return;
    setHealthBusy(true);
    window.setTimeout(() => {
      runHealthCheckForEndpointDemo(ep.id);
      refresh();
      message.success(t('support.robot.connections.endpoint.test.success'));
      setHealthBusy(false);
    }, 600);
  };

  const onDelete = () => {
    if (!ep) return;
    Modal.confirm({
      title: t('support.robot.connections.endpoint.deleteConfirmTitle'),
      content: ep.name,
      okType: 'danger',
      onOk: () => {
        deleteRobotEndpoint(ep.id);
        message.success(t('support.robot.connections.endpoint.deleted'));
        navigate(listPath);
      },
    });
  };

  useEffect(() => {
    if (!embedDrillChrome) return;
    const onAction = (evt: Event) => {
      const action = (evt as CustomEvent<SupportDrillToolbarAction>).detail;
      if (action === 'edit') {
        navigate(supportRobotWorkspaceEditPath('instances-endpoints', endpointId), { state: { returnLnb } });
      } else if (action === 'delete') {
        onDelete();
      }
    };
    window.addEventListener('support-drill-action', onAction as EventListener);
    return () => window.removeEventListener('support-drill-action', onAction as EventListener);
  }, [embedDrillChrome, endpointId, navigate, onDelete, returnLnb]);

  const protocolColor = (p: RobotEndpointDto['protocol']) => (p === 'ROS' ? 'blue' : p === 'TCP' ? 'geekblue' : 'cyan');

  if (!ep) {
    return (
      <SupportWorkspaceDrillFrame
        backLabel={t('support.robot.detail.back')}
        onBack={() => navigate(listPath)}
        embedInPortalHeader={embedDrillChrome}
      >
        <Typography.Paragraph>{t('support.robot.connections.detail.notFound')}</Typography.Paragraph>
      </SupportWorkspaceDrillFrame>
    );
  }

  const sessionId = `sess-${ep.id.replace(/[^a-z0-9]/gi, '').slice(-10)}`;
  const robotDeviceLine = composition ? `${composition.model.name} + ${composition.devices.length} Robot Device Models` : ep.robotModelName || '—';
  const catalogModelName = composition?.model.name ?? (ep.robotModelName || '—');

  return (
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
              <Typography.Title level={3} className="dev-data-foundry-title domain-content-title" style={{ margin: '0 0 6px' }}>
                {ep.compositionName}
              </Typography.Title>
              <Space align="center" wrap size={8} style={{ marginBottom: 6 }}>
                <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                  {t('support.robot.connections.detail.instanceLabel')}
                </Typography.Text>
                <Typography.Text strong style={{ fontSize: 16 }}>
                  {ep.name}
                </Typography.Text>
                {statusTagForEndpoint(t, ep.status)}
              </Space>
              <Typography.Paragraph type="secondary" className="domain-1depth-page-lead" style={{ marginBottom: 6 }}>
                {t('support.robot.connections.detail.subtitleLead')}
              </Typography.Paragraph>
              <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                {t('support.robot.instance.register.summary.catalogModel')}: {catalogModelName} · {t('support.robot.connections.endpoint.field.serialNumber')}:{' '}
                {ep.serialNumber || '—'} · {ep.ipAddress}:{ep.port} · <Tag color={protocolColor(ep.protocol)}>{ep.protocol}</Tag>
              </Typography.Paragraph>
            </div>
            {!embedDrillChrome ? (
              <Space wrap>
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() =>
                    navigate(supportRobotWorkspaceEditPath('instances-endpoints', ep.id), { state: { returnLnb } })
                  }
                >
                  {t('support.robot.definition.card.edit')}
                </Button>
                <Button size="small" danger icon={<DeleteOutlined />} onClick={onDelete}>
                  {t('support.robot.definition.card.delete')}
                </Button>
              </Space>
            ) : null}
          </div>
        </Card>

        <div className="robot-endpoint-drawer-body">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={14}>
              <Card
                size="small"
                bordered
                className="support-workspace-detail-page__model-deep"
                title={t('support.robot.connections.detail.registrationSection')}
                style={{ marginBottom: 16, borderColor: token.colorBorderSecondary }}
              >
                <Descriptions column={{ xs: 1, sm: 2 }} size="small" bordered>
                  <Descriptions.Item label={t('support.robot.connections.endpoint.field.composition')} span={2}>
                    {ep.compositionName}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('support.robot.connections.detail.field.compositionId')} span={2}>
                    <Typography.Text code>{ep.compositionId}</Typography.Text>
                  </Descriptions.Item>
                  <Descriptions.Item label={t('support.robot.instance.register.summary.catalogModel')} span={2}>
                    {catalogModelName}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('support.robot.connections.endpoint.field.robotDevices')} span={2}>
                    {robotDeviceLine}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('support.robot.connections.endpoint.field.name')} span={2}>
                    {ep.name}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('support.robot.connections.endpoint.field.serialNumber')}>
                    {ep.serialNumber || '—'}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('support.robot.connections.endpoint.field.description')} span={2}>
                    {ep.description || '—'}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('support.robot.connections.detail.field.createdAt')}>{ep.createdAt}</Descriptions.Item>
                  <Descriptions.Item label={t('support.robot.connections.detail.updated')}>{ep.updatedAt}</Descriptions.Item>
                </Descriptions>
              </Card>
              <Card
                size="small"
                bordered
                className="support-workspace-detail-page__model-deep"
                title={t('support.robot.connections.detail.card.connection')}
                style={{ marginBottom: 16, borderColor: token.colorBorderSecondary }}
              >
                <Descriptions column={{ xs: 1, sm: 2 }} size="small" bordered>
                  <Descriptions.Item label={t('support.robot.connections.endpoint.field.ip')}>{ep.ipAddress}</Descriptions.Item>
                  <Descriptions.Item label={t('support.robot.connections.endpoint.field.port')}>{ep.port}</Descriptions.Item>
                  <Descriptions.Item label={t('support.robot.connections.endpoint.field.protocol')}>
                    <Tag color={protocolColor(ep.protocol)}>{ep.protocol}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label={t('support.robot.connections.endpoint.field.timeout')}>{ep.timeoutSec}s</Descriptions.Item>
                </Descriptions>
              </Card>
              <Card
                size="small"
                bordered
                className="support-workspace-detail-page__model-deep"
                title={t('support.robot.connections.detail.card.authNetwork')}
                style={{ borderColor: token.colorBorderSecondary }}
              >
                <Descriptions column={1} size="small" bordered>
                  <Descriptions.Item label={t('support.robot.connections.endpoint.field.authType')}>
                    {t(`support.robot.connections.auth.${ep.authType}`)}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('support.robot.connections.endpoint.field.secret')}>
                    {ep.tokenOrKey || '—'}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('support.robot.connections.endpoint.field.allowedIps')}>
                    <Typography.Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{ep.allowedIps || '—'}</Typography.Paragraph>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
            <Col xs={24} lg={10}>
              <Card
                size="small"
                bordered
                className="support-workspace-detail-page__model-deep"
                title={t('support.robot.connections.detail.statusSessionTitle')}
                style={{ borderColor: token.colorBorderSecondary }}
              >
                <div className="robot-endpoint-detail__status-block" style={{ marginBottom: 16 }}>
                  <Space wrap size={8} align="center">
                    {statusTagForEndpoint(t, ep.status)}
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {t('support.robot.connections.detail.liveHint')}
                    </Typography.Text>
                  </Space>
                  <Descriptions column={1} size="small" style={{ marginTop: 12 }} bordered>
                    <Descriptions.Item label={t('support.robot.connections.endpoint.field.operatingStatus')}>
                      {statusTagForEndpoint(t, ep.status)}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('support.robot.connections.endpoint.latency')}>
                      {ep.latencyMs > 0 ? `${ep.latencyMs} ms` : '—'}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('support.robot.connections.detail.lastSeen')}>{ep.lastSeenAt}</Descriptions.Item>
                    <Descriptions.Item label={t('support.robot.connections.detail.sessionId')}>
                      <Typography.Text code>{sessionId}</Typography.Text>
                    </Descriptions.Item>
                    <Descriptions.Item label={t('support.robot.connections.detail.healthScore')}>
                      {statusRow ? `${statusRow.healthScore}` : '—'}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('support.robot.connections.status.col.lastCheck')}>
                      {statusRow?.lastCheckAt ?? '—'}
                    </Descriptions.Item>
                  </Descriptions>
                  <Typography.Paragraph type="secondary" style={{ marginTop: 12, marginBottom: 0, fontSize: 12 }}>
                    {t('support.robot.connections.detail.sessionSummary')}
                  </Typography.Paragraph>
                </div>
                <Divider style={{ margin: '12px 0' }} />
                <Space wrap size={8}>
                  <Button
                    type="primary"
                    disabled={ep.status === 'connected'}
                    onClick={() => {
                      setStatus('connected');
                      message.success(t('support.robot.connections.actions.connect'));
                    }}
                  >
                    {t('support.robot.connections.actions.connect')}
                  </Button>
                  <Button
                    type="default"
                    disabled={ep.status === 'disconnected'}
                    onClick={() => {
                      setStatus('disconnected');
                      message.info(t('support.robot.connections.actions.disconnect'));
                    }}
                  >
                    {t('support.robot.connections.actions.disconnect')}
                  </Button>
                  <Button type="default" className="robot-connections-reconnect-btn" loading={reconnecting} onClick={onReconnect}>
                    {t('support.robot.connections.actions.reconnect')}
                  </Button>
                  <Button onClick={onTestConnection} loading={testing}>
                    {t('support.robot.connections.endpoint.test.button')}
                  </Button>
                  <Button onClick={onHealthCheck} loading={healthBusy}>
                    {t('support.robot.connections.detail.healthCheck')}
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </SupportWorkspaceDrillFrame>
  );
}
