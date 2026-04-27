import { App, Button, Card, Col, Modal, Row, Space, Switch, Table, Tag, Typography, theme } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  buildHealthCheckResults,
  getRobotConnectionStatusTableMock,
  getRobotEndpointById,
  runRobotHealthCheckMock,
  syncConnectionStatusFromEndpoint,
  tickRobotHealthAutoRefreshMock,
  upsertRobotEndpoint,
  type HealthCheckResultRow,
  type HealthCheckVerdict,
  type RobotConnectionStatusRow,
  type RobotEndpointConnectionStatus,
  type RobotEndpointDto,
  type RobotEndpointProtocol,
} from '../../../mocks/robotConnectionsMocks';
import { supportRobotWorkspaceDetailPath } from '../../../shared/config/supportPaths';
import { useLocale } from '../../../shared/i18n/LocaleProvider';
import '../../dev/dev-data-foundry-page.css';
import './robot-connections-pages.css';

function statusDotClass(s: RobotEndpointConnectionStatus) {
  if (s === 'connected') return 'robot-endpoint-status-dot robot-endpoint-status-dot--connected';
  if (s === 'error') return 'robot-endpoint-status-dot robot-endpoint-status-dot--error';
  if (s === 'reconnecting') return 'robot-endpoint-status-dot robot-endpoint-status-dot--reconnecting';
  return 'robot-endpoint-status-dot robot-endpoint-status-dot--disconnected';
}

function protocolColor(p: RobotEndpointProtocol) {
  return p === 'ROS' ? 'blue' : p === 'TCP' ? 'geekblue' : 'cyan';
}

function verdictTag(t: (k: string) => string, v: HealthCheckVerdict) {
  if (v === 'success') return <Tag color="success">{t('support.robot.connections.healthResult.verdict.success')}</Tag>;
  if (v === 'warning') return <Tag color="warning">{t('support.robot.connections.healthResult.verdict.warning')}</Tag>;
  return <Tag color="error">{t('support.robot.connections.healthResult.verdict.error')}</Tag>;
}

export interface RobotConnectionsStatusPageProps {
  titleKey: string;
  leadKey: string;
}

export function RobotConnectionsStatusPage({ titleKey, leadKey }: RobotConnectionsStatusPageProps) {
  const { token } = theme.useToken();
  const { t } = useLocale();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [tick, setTick] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [healthCheckLoading, setHealthCheckLoading] = useState(false);
  const [resultRows, setResultRows] = useState<HealthCheckResultRow[] | null>(null);

  const rows = useMemo(() => getRobotConnectionStatusTableMock(), [tick]);

  const summary = useMemo(() => {
    const total = rows.length;
    const connected = rows.filter((r) => r.status === 'connected').length;
    const disconnected = rows.filter((r) => r.status === 'disconnected' || r.status === 'reconnecting').length;
    const error = rows.filter((r) => r.status === 'error').length;
    return { total, connected, disconnected, error };
  }, [rows]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = window.setInterval(() => {
      tickRobotHealthAutoRefreshMock();
      setTick((n) => n + 1);
    }, 4000);
    return () => window.clearInterval(id);
  }, [autoRefresh]);

  const refresh = useCallback(() => setTick((n) => n + 1), []);

  const applyEndpointPatch = useCallback(
    (endpointId: string, patch: Partial<RobotEndpointDto>) => {
      const ep = getRobotEndpointById(endpointId);
      if (!ep) {
        message.warning(t('support.robot.connections.endpoint.missing'));
        return;
      }
      const today = new Date().toISOString().slice(0, 10);
      upsertRobotEndpoint({ ...ep, ...patch, updatedAt: today });
      syncConnectionStatusFromEndpoint(endpointId);
      refresh();
    },
    [message, refresh, t],
  );

  const onConnect = useCallback(
    (endpointId: string) => {
      const ep = getRobotEndpointById(endpointId);
      applyEndpointPatch(endpointId, {
        status: 'connected',
        latencyMs: Math.max(10, ep?.latencyMs || 14),
      });
      message.success(t('support.robot.connections.actions.connect'));
    },
    [applyEndpointPatch, message, t],
  );

  const onDisconnect = useCallback(
    (endpointId: string) => {
      applyEndpointPatch(endpointId, { status: 'disconnected', latencyMs: 0 });
      message.info(t('support.robot.connections.actions.disconnect'));
    },
    [applyEndpointPatch, message, t],
  );

  const onReconnect = useCallback(
    (endpointId: string) => {
      applyEndpointPatch(endpointId, { status: 'reconnecting', latencyMs: Math.max(getRobotEndpointById(endpointId)?.latencyMs ?? 0, 120) });
      window.setTimeout(() => {
        const cur = getRobotEndpointById(endpointId);
        if (!cur) return;
        applyEndpointPatch(endpointId, {
          status: 'connected',
          latencyMs: Math.floor(Math.random() * 25) + 10,
        });
        message.success(t('support.robot.connections.detail.reconnectDone'));
      }, 1000);
    },
    [applyEndpointPatch, message, t],
  );

  const onHealthCheck = useCallback(() => {
    setHealthCheckLoading(true);
    window.setTimeout(() => {
      runRobotHealthCheckMock();
      setTick((n) => n + 1);
      const latest = getRobotConnectionStatusTableMock();
      setResultRows(buildHealthCheckResults(latest));
      setHealthCheckLoading(false);
      message.success(t('support.robot.connections.status.healthDone'));
    }, 700);
  }, [message, t]);

  const statusTag = (s: RobotEndpointConnectionStatus) => {
    if (s === 'connected') return <Tag color="success">{t('support.robot.connections.status.connected')}</Tag>;
    if (s === 'error') return <Tag color="error">{t('support.robot.connections.status.error')}</Tag>;
    if (s === 'reconnecting') return <Tag color="warning">{t('support.robot.connections.sessions.status.reconnecting')}</Tag>;
    return <Tag color="default">{t('support.robot.connections.status.disconnected')}</Tag>;
  };

  const columns: ColumnsType<RobotConnectionStatusRow> = [
    {
      title: `${t('support.robot.connections.status.col.robot')} / ${t('support.robot.connections.status.col.endpoint')}`,
      key: 'robotEndpoint',
      width: 280,
      render: (_, row) => {
        const [name, addr] = row.endpointDisplay.split('\n');
        return (
          <div>
            <Typography.Text strong style={{ display: 'block' }}>
              {row.robotName}
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
              {name}
            </Typography.Text>
            {addr ? (
              <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                {addr}
              </Typography.Text>
            ) : null}
          </div>
        );
      },
    },
    {
      title: t('support.robot.connections.status.col.protocol'),
      dataIndex: 'protocol',
      width: 110,
      render: (p: RobotEndpointProtocol) => <Tag color={protocolColor(p)}>{p}</Tag>,
    },
    {
      title: t('support.robot.connections.status.col.status'),
      dataIndex: 'status',
      width: 200,
      render: (s: RobotEndpointConnectionStatus) => (
        <Space align="center" size={8} className="robot-status-table__status-cell">
          <span className={statusDotClass(s)} aria-hidden />
          {statusTag(s)}
        </Space>
      ),
    },
    {
      title: t('support.robot.connections.status.col.latency'),
      dataIndex: 'latencyMs',
      width: 120,
      render: (ms: number) => (ms > 0 ? <Typography.Text type="secondary">{ms} ms</Typography.Text> : <Typography.Text type="secondary">—</Typography.Text>),
    },
    {
      title: t('support.robot.connections.status.col.lastCheck'),
      dataIndex: 'lastCheckAt',
      width: 200,
    },
    {
      title: t('support.robot.connections.status.col.health'),
      dataIndex: 'healthScore',
      width: 120,
      render: (score: number) => (
        <Typography.Text strong style={{ color: score >= 80 ? token.colorSuccess : score >= 50 ? token.colorWarning : token.colorError }}>
          {score}
        </Typography.Text>
      ),
    },
    {
      title: t('support.robot.connections.status.col.actions'),
      key: 'actions',
      align: 'right',
      className: 'robot-status-table__actions-col',
      render: (_, row) => (
        <Space size={6} wrap={false} onClick={(e) => e.stopPropagation()}>
          <Button size="small" type="primary" onClick={() => onConnect(row.endpointId)}>
            {t('support.robot.connections.actions.connect')}
          </Button>
          <Button size="small" type="default" onClick={() => onDisconnect(row.endpointId)}>
            {t('support.robot.connections.actions.disconnect')}
          </Button>
          <Button size="small" type="default" className="robot-connections-reconnect-btn" onClick={() => onReconnect(row.endpointId)}>
            {t('support.robot.connections.actions.reconnect')}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="support-definition-page support-workspace-page dev-data-foundry">
      <div className="support-definition-page__stack">
        <div className="dev-data-foundry-header" style={{ marginBottom: 12 }}>
          <div>
            <Typography.Title level={3} className="dev-data-foundry-title domain-content-title" style={{ margin: 0 }}>
              {t(titleKey)}
            </Typography.Title>
            <Typography.Paragraph type="secondary" className="domain-1depth-page-lead">
              {t(leadKey)}
            </Typography.Paragraph>
          </div>
          <Space wrap>
            <Space align="center">
              <Typography.Text type="secondary">{t('support.robot.connections.status.autoRefresh')}</Typography.Text>
              <Switch checked={autoRefresh} onChange={setAutoRefresh} />
            </Space>
            <Button type="primary" loading={healthCheckLoading} onClick={onHealthCheck}>
              {t('support.robot.connections.status.healthCheck')}
            </Button>
          </Space>
        </div>

        <Row gutter={[12, 12]} className="robot-connections-status-summary" style={{ marginBottom: 16 }}>
          <Col xs={12} md={6}>
            <Card size="small" style={{ borderColor: token.colorBorderSecondary }}>
              <Typography.Text type="secondary">{t('support.robot.connections.status.summary.total')}</Typography.Text>
              <Typography.Title level={3} style={{ margin: '4px 0 0' }}>
                {summary.total}
              </Typography.Title>
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card size="small" style={{ borderColor: token.colorBorderSecondary }}>
              <Typography.Text type="secondary">{t('support.robot.connections.status.summary.connected')}</Typography.Text>
              <Typography.Title level={3} style={{ margin: '4px 0 0', color: token.colorSuccess }}>
                {summary.connected}
              </Typography.Title>
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card size="small" style={{ borderColor: token.colorBorderSecondary }}>
              <Typography.Text type="secondary">{t('support.robot.connections.status.summary.disconnected')}</Typography.Text>
              <Typography.Title level={3} style={{ margin: '4px 0 0', color: token.colorTextSecondary }}>
                {summary.disconnected}
              </Typography.Title>
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card size="small" style={{ borderColor: token.colorBorderSecondary }}>
              <Typography.Text type="secondary">{t('support.robot.connections.status.summary.error')}</Typography.Text>
              <Typography.Title level={3} style={{ margin: '4px 0 0', color: token.colorError }}>
                {summary.error}
              </Typography.Title>
            </Card>
          </Col>
        </Row>

        <Card size="small" styles={{ body: { padding: 0 } }} style={{ borderColor: token.colorBorderSecondary }}>
          <Table<RobotConnectionStatusRow>
            className="robot-connections-status-table"
            rowKey="id"
            pagination={false}
            columns={columns}
            dataSource={rows}
            scroll={{ x: 'max-content' }}
            rowClassName={(record) => `robot-status-row robot-status-row--${record.status}`}
            onRow={(record) => ({
              onClick: () =>
                navigate(supportRobotWorkspaceDetailPath('connections-endpoints', record.endpointId), {
                  state: { returnLnb: 'connections-status' as const },
                }),
            })}
          />
        </Card>
      </div>

      <Modal
        title={t('support.robot.connections.healthResult.title')}
        open={!!resultRows}
        onCancel={() => setResultRows(null)}
        footer={
          <Button type="primary" onClick={() => setResultRows(null)}>
            {t('support.sim.preview.close')}
          </Button>
        }
        width={560}
        destroyOnClose
      >
        <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
          {t('support.robot.connections.healthResult.lead')}
        </Typography.Paragraph>
        <div>
          {resultRows?.map((r) => (
            <div key={`${r.endpointId}-${r.robotName}`} className="robot-health-result-row">
              <div style={{ minWidth: 0 }}>
                <Space wrap size={8}>
                  {verdictTag(t, r.verdict)}
                  <Typography.Text strong>{r.robotName}</Typography.Text>
                </Space>
                <Typography.Paragraph type="secondary" style={{ marginBottom: 0, marginTop: 6, fontSize: 12 }}>
                  {r.endpointLabel}
                </Typography.Paragraph>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {t(r.detailKey)}
                </Typography.Text>
              </div>
              <Button
                type="link"
                onClick={() => {
                  setResultRows(null);
                  navigate(supportRobotWorkspaceDetailPath('connections-endpoints', r.endpointId), {
                    state: { returnLnb: 'connections-status' as const },
                  });
                }}
              >
                {t('support.robot.connections.healthResult.viewDetails')}
              </Button>
            </div>
          ))}
        </div>
      </Modal>

    </div>
  );
}
