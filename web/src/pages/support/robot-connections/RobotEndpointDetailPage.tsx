import { App, Button, Card, Col, Descriptions, List, Modal, Row, Space, Tag, Timeline, Typography, theme } from 'antd';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  deleteRobotEndpoint,
  getRobotEndpointById,
  syncConnectionStatusFromEndpoint,
  upsertRobotEndpoint,
  type RobotEndpointDto,
} from '../../../mocks/robotConnectionsMocks';
import { supportWorkspacePath } from '../../../shared/config/supportPaths';
import { useLocale } from '../../../shared/i18n/LocaleProvider';
import { SupportWorkspaceDrillFrame } from '../SupportWorkspaceDrillFrame';
import '../support-workspace-detail-page.css';
import { CreateRobotEndpointModal } from './CreateRobotEndpointModal';
import './robot-connections-pages.css';

function statusTagForEndpoint(t: (k: string) => string, s: RobotEndpointDto['status']) {
  if (s === 'connected') return <Tag color="success">{t('support.robot.connections.status.connected')}</Tag>;
  if (s === 'error') return <Tag color="error">{t('support.robot.connections.status.error')}</Tag>;
  if (s === 'reconnecting') return <Tag color="warning">{t('support.robot.connections.sessions.status.reconnecting')}</Tag>;
  return <Tag color="default">{t('support.robot.connections.status.disconnected')}</Tag>;
}

export interface RobotEndpointDetailPageProps {
  endpointId: string;
}

export function RobotEndpointDetailPage({ endpointId }: RobotEndpointDetailPageProps) {
  const { token } = theme.useToken();
  const { t } = useLocale();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const returnLnb =
    (location.state as { returnLnb?: 'connections-endpoints' | 'connections-status' } | null)?.returnLnb ??
    'connections-endpoints';
  const listPath = supportWorkspacePath('robot-support', returnLnb);

  const [tick, setTick] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [testing, setTesting] = useState(false);

  const ep = useMemo(() => getRobotEndpointById(endpointId), [endpointId, tick]);

  const recent = useMemo(
    () => [
      { time: '09:12', text: t('support.robot.connections.detail.activity.checkOk') },
      { time: '08:45', text: t('support.robot.connections.detail.activity.handshake') },
      { time: '08:40', text: t('support.robot.connections.detail.activity.configPulled') },
    ],
    [t],
  );

  const healthHistory = useMemo(
    () => [
      { time: '2026-04-20 08:00', s: '98', note: t('support.robot.connections.drawer.healthHistory.ok') },
      { time: '2026-04-19 08:00', s: '96', note: t('support.robot.connections.drawer.healthHistory.ok') },
      { time: '2026-04-18 08:00', s: '94', note: t('support.robot.connections.drawer.healthHistory.warn') },
    ],
    [t],
  );

  const refresh = () => setTick((n) => n + 1);

  const setStatus = (status: RobotEndpointDto['status'], latencyMs?: number) => {
    if (!ep) return;
    const nextLat = latencyMs ?? (status === 'connected' ? Math.max(ep.latencyMs, 10) : 0);
    upsertRobotEndpoint({
      ...ep,
      status,
      latencyMs: nextLat,
      updatedAt: new Date().toISOString().slice(0, 10),
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
        upsertRobotEndpoint({
          ...ep,
          latencyMs: Math.floor(Math.random() * 40) + 6,
          updatedAt: new Date().toISOString().slice(0, 10),
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

  const protocolColor = (p: RobotEndpointDto['protocol']) => (p === 'ROS' ? 'blue' : p === 'TCP' ? 'geekblue' : 'cyan');

  if (!ep) {
    return (
      <SupportWorkspaceDrillFrame backLabel={t('support.robot.detail.back')} onBack={() => navigate(listPath)}>
        <Typography.Paragraph>{t('support.robot.connections.detail.notFound')}</Typography.Paragraph>
      </SupportWorkspaceDrillFrame>
    );
  }

  return (
    <SupportWorkspaceDrillFrame backLabel={t('support.robot.detail.back')} onBack={() => navigate(listPath)}>
      <div className="support-workspace-detail-page">
        <div className="dev-data-foundry-header" style={{ marginTop: 12, marginBottom: 16 }}>
          <div>
            <Space align="center" wrap size={8} style={{ marginBottom: 4 }}>
              <Typography.Title level={3} className="dev-data-foundry-title domain-content-title" style={{ margin: 0 }}>
                {ep.name}
              </Typography.Title>
              {statusTagForEndpoint(t, ep.status)}
            </Space>
            <Typography.Paragraph type="secondary" className="domain-1depth-page-lead" style={{ marginBottom: 0 }}>
              {ep.ipAddress}:{ep.port} · {ep.protocol}
            </Typography.Paragraph>
          </div>
          <Space wrap>
            <Button size="small" onClick={() => setEditOpen(true)}>
              {t('support.robot.definition.card.edit')}
            </Button>
            <Button size="small" danger onClick={onDelete}>
              {t('support.robot.definition.card.delete')}
            </Button>
          </Space>
        </div>

      <div className="robot-endpoint-drawer-body">
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={14}>
            <Card size="small" title={t('support.robot.connections.detail.card.basics')} style={{ marginBottom: 16, borderColor: token.colorBorderSecondary }}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label={t('support.robot.connections.endpoint.field.name')}>{ep.name}</Descriptions.Item>
                <Descriptions.Item label={t('support.robot.connections.endpoint.field.description')}>{ep.description || '—'}</Descriptions.Item>
                <Descriptions.Item label={t('support.robot.connections.detail.updated')}>{ep.updatedAt}</Descriptions.Item>
              </Descriptions>
            </Card>
            <Card size="small" title={t('support.robot.connections.detail.card.connection')} style={{ borderColor: token.colorBorderSecondary }}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label={t('support.robot.connections.endpoint.field.ip')}>{ep.ipAddress}</Descriptions.Item>
                <Descriptions.Item label={t('support.robot.connections.endpoint.field.port')}>{ep.port}</Descriptions.Item>
                <Descriptions.Item label={t('support.robot.connections.endpoint.field.protocol')}>
                  <Tag color={protocolColor(ep.protocol)}>{ep.protocol}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label={t('support.robot.connections.endpoint.field.timeout')}>{ep.timeoutSec}s</Descriptions.Item>
                <Descriptions.Item label={t('support.robot.connections.endpoint.field.allowedIps')}>
                  <Typography.Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{ep.allowedIps || '—'}</Typography.Paragraph>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            <Card size="small" title={t('support.robot.connections.detail.card.status')} style={{ marginBottom: 16, borderColor: token.colorBorderSecondary }}>
              <div className="robot-endpoint-detail__status-block">
                {statusTagForEndpoint(t, ep.status)}
                <div>
                  <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                    {t('support.robot.connections.endpoint.latency')}
                  </Typography.Text>
                  <Typography.Title level={4} style={{ margin: 0 }}>
                    {ep.latencyMs > 0 ? `${ep.latencyMs} ms` : '—'}
                  </Typography.Title>
                </div>
                <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                  {t('support.robot.connections.detail.statusHint')}
                </Typography.Text>
              </div>
            </Card>
            <Card size="small" title={t('support.robot.connections.detail.card.recent')} style={{ marginBottom: 16, borderColor: token.colorBorderSecondary }}>
              <Timeline
                items={recent.map((r) => ({
                  children: (
                    <>
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        {r.time}
                      </Typography.Text>
                      <div>{r.text}</div>
                    </>
                  ),
                }))}
              />
            </Card>
            <Card size="small" title={t('support.robot.connections.drawer.healthHistoryTitle')} style={{ borderColor: token.colorBorderSecondary }}>
              <List
                size="small"
                dataSource={healthHistory}
                renderItem={(item) => (
                  <List.Item>
                    <Space direction="vertical" size={0}>
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        {item.time}
                      </Typography.Text>
                      <Typography.Text>
                        {t('support.robot.connections.status.col.health')}: {item.s} — {item.note}
                      </Typography.Text>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>

        <div className="robot-endpoint-detail__footer" style={{ borderTopColor: token.colorBorderSecondary, marginTop: 8 }}>
          <Space wrap>
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
            <Button type="default" ghost loading={reconnecting} onClick={onReconnect}>
              {t('support.robot.connections.actions.reconnect')}
            </Button>
            <Button onClick={onTestConnection} loading={testing}>
              {t('support.robot.connections.endpoint.test.button')}
            </Button>
          </Space>
        </div>
      </div>

        <CreateRobotEndpointModal open={editOpen} onClose={() => setEditOpen(false)} onSaved={refresh} mode="edit" endpoint={ep} />
      </div>
    </SupportWorkspaceDrillFrame>
  );
}
