import { AppstoreOutlined, DeleteOutlined, EditOutlined, MoreOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { App, Button, Card, Col, Dropdown, Empty, Input, Modal, Row, Segmented, Select, Space, Switch, Tag, Typography, theme } from 'antd';
import type { MenuProps } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  buildHealthCheckResults,
  deleteRobotEndpoint,
  getRobotConnectionStatusTableMock,
  getRobotEndpointById,
  getRobotEndpointsMock,
  runRobotHealthCheckMock,
  syncConnectionStatusFromEndpoint,
  tickRobotHealthAutoRefreshMock,
  upsertRobotEndpoint,
  type HealthCheckResultRow,
  type HealthCheckVerdict,
  type RobotConnectionStatusRow,
  type RobotEndpointDto,
  type RobotEndpointProtocol,
} from '../../../mocks/robotConnectionsMocks';
import { getSupportCompositionsMock } from '../../../mocks/supportCompositionsMock';
import { supportRobotWorkspaceCreatePath, supportRobotWorkspaceDetailPath, supportRobotWorkspaceEditPath } from '../../../shared/config/supportPaths';
import { useLocale } from '../../../shared/i18n/LocaleProvider';
import { matchesSearchQuery } from '../../../shared/lib/listQuery';
import '../../dev/dev-data-foundry-page.css';
import '../support-definition-cards-page.css';
import {
  RobotInstanceOperationalList,
  type EndpointGridGroup,
  type GroupOperationalSummary,
} from './robot-instance-operational-list';
import './robot-connections-pages.css';

type ViewMode = 'grid' | 'table';
type ProtocolFilter = 'all' | RobotEndpointProtocol;
type SortKey = 'recent' | 'nameAsc';
type StatusSummaryFilter = 'all' | 'connected' | 'disconnected' | 'error';

function haystack(row: RobotEndpointDto): string {
  return `${row.name} ${row.compositionId} ${row.robotModelName} ${row.ipAddress} ${row.description} ${row.compositionName}`;
}

function sortRows(list: RobotEndpointDto[], sortKey: SortKey): RobotEndpointDto[] {
  const next = [...list];
  if (sortKey === 'nameAsc') {
    return next.sort((a, b) => a.name.localeCompare(b.name, 'en'));
  }
  return next.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function robotInstanceCardThumbnailSrc(compositionId: string, modelId: string) {
  return `https://picsum.photos/seed/${encodeURIComponent(`cp-${compositionId}-m-${modelId}`)}/480/480`;
}

function statusDotClass(s: RobotEndpointDto['status']) {
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

export interface RobotConnectionsEndpointsPageProps {
  titleKey: string;
  leadKey: string;
}

export function RobotConnectionsEndpointsPage({ titleKey, leadKey }: RobotConnectionsEndpointsPageProps) {
  const { token } = theme.useToken();
  const { t } = useLocale();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [tick, setTick] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [healthCheckLoading, setHealthCheckLoading] = useState(false);
  const [resultRows, setResultRows] = useState<HealthCheckResultRow[] | null>(null);
  const [search, setSearch] = useState('');
  const [protocolFilter, setProtocolFilter] = useState<ProtocolFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('recent');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [statusSummaryFilter, setStatusSummaryFilter] = useState<StatusSummaryFilter>('all');
  const [expandAllKey, setExpandAllKey] = useState(0);

  const items = useMemo(() => getRobotEndpointsMock(), [tick]);
  const statusRows = useMemo(() => getRobotConnectionStatusTableMock(), [tick]);
  const compositionById = useMemo(() => new Map(getSupportCompositionsMock().map((c) => [c.id, c])), [tick]);

  const statusByEndpointId = useMemo(() => {
    const m = new Map<string, RobotConnectionStatusRow>();
    for (const r of statusRows) {
      m.set(r.endpointId, r);
    }
    return m;
  }, [statusRows]);

  const summary = useMemo(() => {
    const total = statusRows.length;
    const connected = statusRows.filter((r) => r.status === 'connected').length;
    const disconnected = statusRows.filter((r) => r.status === 'disconnected' || r.status === 'reconnecting').length;
    const error = statusRows.filter((r) => r.status === 'error').length;
    return { total, connected, disconnected, error };
  }, [statusRows]);

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

  const filtered = useMemo(() => {
    let list = items.filter((row) => matchesSearchQuery(haystack(row), search));
    if (protocolFilter !== 'all') {
      list = list.filter((r) => r.protocol === protocolFilter);
    }
    if (statusSummaryFilter === 'connected') {
      list = list.filter((r) => r.status === 'connected');
    } else if (statusSummaryFilter === 'error') {
      list = list.filter((r) => r.status === 'error');
    } else if (statusSummaryFilter === 'disconnected') {
      list = list.filter((r) => r.status === 'disconnected' || r.status === 'reconnecting');
    }
    return sortRows(list, sortKey);
  }, [items, search, protocolFilter, sortKey, statusSummaryFilter]);

  const onSummaryCardClick = useCallback((filter: StatusSummaryFilter) => {
    setStatusSummaryFilter((prev) => (prev === filter ? 'all' : filter));
    setExpandAllKey((k) => k + 1);
  }, []);

  /** Grid: group instances that share the same Robot (composition). Order follows `filtered`. */
  const endpointGridGroups = useMemo((): EndpointGridGroup[] => {
    const byComposition = new Map<string, RobotEndpointDto[]>();
    for (const row of filtered) {
      const list = byComposition.get(row.compositionId) ?? [];
      list.push(row);
      byComposition.set(row.compositionId, list);
    }
    const ordered: EndpointGridGroup[] = [];
    const seen = new Set<string>();
    for (const row of filtered) {
      if (seen.has(row.compositionId)) continue;
      seen.add(row.compositionId);
      const instances = byComposition.get(row.compositionId) ?? [];
      ordered.push({
        compositionId: row.compositionId,
        compositionName: row.compositionName,
        instances,
      });
    }
    return ordered;
  }, [filtered]);

  const buildGroupSummary = useCallback(
    (s: GroupOperationalSummary) => {
      const parts: string[] = [`${s.instanceCount} ${t('support.robot.connections.opList.instancesShort')}`];
      if (s.connected > 0) parts.push(`${s.connected} ${t('support.robot.connections.opList.connectedShort')}`);
      if (s.disconnected > 0) parts.push(`${s.disconnected} ${t('support.robot.connections.opList.disconnectedShort')}`);
      if (s.reconnecting > 0) parts.push(`${s.reconnecting} ${t('support.robot.connections.opList.reconnectingShort')}`);
      if (s.error > 0) parts.push(`${s.error} ${t('support.robot.connections.opList.errorShort')}`);
      return parts.join(' · ');
    },
    [t],
  );

  const statusLabel = useCallback(
    (s: RobotEndpointDto['status']) => {
      if (s === 'connected') return t('support.robot.connections.status.connected');
      if (s === 'error') return t('support.robot.connections.status.error');
      if (s === 'reconnecting') return t('support.robot.connections.sessions.status.reconnecting');
      return t('support.robot.connections.status.disconnected');
    },
    [t],
  );

  const opListLabels = useMemo(
    () => ({
      colInstance: t('support.robot.connections.opList.colInstance'),
      colStatus: t('support.robot.connections.status.col.status'),
      colEndpoint: t('support.robot.connections.endpoint.col.address'),
      colProtocol: t('support.robot.connections.status.col.protocol'),
      colLatency: t('support.robot.connections.status.col.latency'),
      colHealth: t('support.robot.connections.opList.colScore'),
      colLastCheck: t('support.robot.connections.status.col.lastCheck'),
      colActions: t('support.robot.connections.status.col.actions'),
      protocolSummary: t('support.robot.connections.opList.protocols'),
      buildGroupSummary,
      statusLabel,
      connect: t('support.robot.connections.actions.connect'),
      disconnect: t('support.robot.connections.actions.disconnect'),
      reconnect: t('support.robot.connections.actions.reconnect'),
      menuAria: t('support.robot.definition.card.menuAria'),
    }),
    [t, buildGroupSummary, statusLabel],
  );

  const openCreate = () => {
    navigate(supportRobotWorkspaceCreatePath('instances-endpoints'));
  };

  const openEdit = (row: RobotEndpointDto) => {
    navigate(supportRobotWorkspaceEditPath('instances-endpoints', row.id), {
      state: { returnLnb: 'instances-endpoints' as const },
    });
  };

  const onDelete = (row: RobotEndpointDto) => {
    Modal.confirm({
      title: t('support.robot.connections.endpoint.deleteConfirmTitle'),
      content: row.name,
      okType: 'danger',
      onOk: () => {
        deleteRobotEndpoint(row.id);
        refresh();
        message.success(t('support.robot.connections.endpoint.deleted'));
      },
    });
  };

  const statusTag = (s: RobotEndpointDto['status']) => {
    if (s === 'connected') return <Tag color="success">{t('support.robot.connections.status.connected')}</Tag>;
    if (s === 'error') return <Tag color="error">{t('support.robot.connections.status.error')}</Tag>;
    if (s === 'reconnecting') return <Tag color="warning">{t('support.robot.connections.sessions.status.reconnecting')}</Tag>;
    return <Tag color="default">{t('support.robot.connections.status.disconnected')}</Tag>;
  };

  const goEndpointDetail = (id: string) => {
    navigate(supportRobotWorkspaceDetailPath('instances-endpoints', id), {
      state: { returnLnb: 'instances-endpoints' as const },
    });
  };

  const robotDeviceSummary = (row: RobotEndpointDto) => {
    const c = compositionById.get(row.compositionId);
    if (!c) return row.robotModelName || '—';
    return `${c.model.name} + ${c.devices.length} Robot Device Models`;
  };

  const menuForEndpoint = (row: RobotEndpointDto): MenuProps => ({
    items: [
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: t('support.robot.definition.card.edit'),
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation();
          openEdit(row);
        },
      },
      { type: 'divider' },
      {
        key: 'delete',
        danger: true,
        icon: <DeleteOutlined />,
        label: t('support.robot.definition.card.delete'),
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation();
          onDelete(row);
        },
      },
    ],
  });

  const endpointMenuTrigger = (row: RobotEndpointDto) => (
    <Dropdown menu={menuForEndpoint(row)} trigger={['click']} placement="bottomRight">
      <Button
        type="text"
        icon={<MoreOutlined />}
        className="support-definition-card__taco"
        aria-label={t('support.robot.definition.card.menuAria')}
        onClick={(e) => e.stopPropagation()}
      />
    </Dropdown>
  );

  const endpointGridCard = (row: RobotEndpointDto) => {
    const sr = statusByEndpointId.get(row.id);
    const composition = compositionById.get(row.compositionId);
    const modelId = composition?.model.id ?? row.compositionId;
    const thumbSrc = robotInstanceCardThumbnailSrc(row.compositionId, modelId);
    return (
      <div className="support-definition-card-wrap">
        <Card
          size="small"
          bordered
          className="support-definition-card robot-endpoint-card--with-thumb"
          styles={{ body: { padding: 0 } }}
          tabIndex={0}
          role="link"
          aria-label={row.name}
          onClick={() => goEndpointDetail(row.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              goEndpointDetail(row.id);
            }
          }}
          style={{ borderColor: token.colorBorderSecondary }}
        >
          <div className="support-definition-card__media robot-endpoint-card__media">
            <img src={thumbSrc} alt="" loading="lazy" decoding="async" />
            <span className={`robot-endpoint-card__media-status ${statusDotClass(row.status)}`} aria-hidden />
          </div>
          <div className="support-definition-card__body robot-endpoint-card__body">
            <div className="support-definition-card__actions">{endpointMenuTrigger(row)}</div>
            <Typography.Title level={5} style={{ margin: '0 0 4px' }}>
              {row.compositionName}
            </Typography.Title>
            <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
              {row.name}
            </Typography.Text>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 4 }} ellipsis={{ rows: 1 }}>
              {robotDeviceSummary(row)}
            </Typography.Paragraph>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 8 }} ellipsis={{ rows: 1 }}>
              {row.ipAddress}:{row.port}
            </Typography.Paragraph>
            <Space size={8} wrap align="center">
              {statusTag(row.status)}
              <Tag color={protocolColor(row.protocol)}>{row.protocol}</Tag>
              {sr ? (
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {t('support.robot.connections.status.col.health')}: {sr.healthScore}
                </Typography.Text>
              ) : null}
            </Space>
            <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
              {t('support.robot.connections.endpoint.col.lastSeen')}: {row.lastSeenAt}
            </Typography.Text>
          </div>
        </Card>
      </div>
    );
  };


  const countLabel = `${items.length} ${t('support.robot.connections.endpoint.unit')}`;
  const countAria = `${t('support.robot.definition.section.countAria')}: ${countLabel}`;

  return (
    <div className="support-definition-page support-workspace-page dev-data-foundry">
      <div className="support-definition-page__stack">
        <div className="dev-data-foundry-header" style={{ marginBottom: 12 }}>
          <div>
            <Space align="center" wrap className="support-workspace-title-line" size={10}>
              <Typography.Title level={3} className="dev-data-foundry-title domain-content-title" style={{ margin: 0 }}>
                {t(titleKey)}
              </Typography.Title>
              <Tag bordered={false} color="default" aria-label={countAria}>
                {countLabel}
              </Tag>
            </Space>
            <Typography.Paragraph type="secondary" className="domain-1depth-page-lead">
              {t(leadKey)}
            </Typography.Paragraph>
          </div>
          <Space align="center" size={10} wrap={false} className="robot-connections-endpoints-header-actions">
            <Space align="center" size={6} wrap={false}>
              <Typography.Text type="secondary" style={{ whiteSpace: 'nowrap' }}>
                {t('support.robot.connections.status.autoRefresh')}
              </Typography.Text>
              <Switch checked={autoRefresh} onChange={setAutoRefresh} />
            </Space>
            <Button onClick={onHealthCheck} loading={healthCheckLoading}>
              {t('support.robot.connections.status.healthCheck')}
            </Button>
            <Button type="primary" onClick={openCreate}>
              {t('support.robot.ui.createPlus')}
            </Button>
          </Space>
        </div>

        <Row gutter={[12, 12]} className="robot-connections-status-summary" style={{ marginBottom: 16 }}>
          <Col xs={12} md={6}>
            <Card
              size="small"
              hoverable
              className={`robot-connections-summary-card ${statusSummaryFilter === 'all' ? 'robot-connections-summary-card--active' : ''}`}
              style={{ borderColor: token.colorBorderSecondary }}
              onClick={() => onSummaryCardClick('all')}
            >
              <Typography.Text type="secondary">{t('support.robot.connections.status.summary.total')}</Typography.Text>
              <Typography.Title level={3} style={{ margin: '4px 0 0' }}>
                {summary.total}
              </Typography.Title>
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card
              size="small"
              hoverable
              className={`robot-connections-summary-card ${statusSummaryFilter === 'connected' ? 'robot-connections-summary-card--active' : ''}`}
              style={{ borderColor: token.colorBorderSecondary }}
              onClick={() => onSummaryCardClick('connected')}
            >
              <Typography.Text type="secondary">{t('support.robot.connections.status.summary.connected')}</Typography.Text>
              <Typography.Title level={3} style={{ margin: '4px 0 0', color: token.colorSuccess }}>
                {summary.connected}
              </Typography.Title>
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card
              size="small"
              hoverable
              className={`robot-connections-summary-card ${statusSummaryFilter === 'disconnected' ? 'robot-connections-summary-card--active' : ''}`}
              style={{ borderColor: token.colorBorderSecondary }}
              onClick={() => onSummaryCardClick('disconnected')}
            >
              <Typography.Text type="secondary">{t('support.robot.connections.status.summary.disconnected')}</Typography.Text>
              <Typography.Title level={3} style={{ margin: '4px 0 0', color: token.colorTextSecondary }}>
                {summary.disconnected}
              </Typography.Title>
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card
              size="small"
              hoverable
              className={`robot-connections-summary-card ${statusSummaryFilter === 'error' ? 'robot-connections-summary-card--active' : ''}`}
              style={{ borderColor: token.colorBorderSecondary }}
              onClick={() => onSummaryCardClick('error')}
            >
              <Typography.Text type="secondary">{t('support.robot.connections.status.summary.error')}</Typography.Text>
              <Typography.Title level={3} style={{ margin: '4px 0 0', color: token.colorError }}>
                {summary.error}
              </Typography.Title>
            </Card>
          </Col>
        </Row>

        <div className="dev-data-foundry-toolbar-sticky" style={{ position: 'static', paddingTop: 0, marginBottom: 12 }}>
          <div className="dev-data-foundry-toolbar">
            <Input
              allowClear
              className="dev-data-foundry-search forge-search-input"
              placeholder={t('support.robot.connections.endpoint.searchPh')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label={t('support.robot.connections.endpoint.searchAria')}
            />
            <Select<ProtocolFilter>
              value={protocolFilter}
              onChange={setProtocolFilter}
              options={[
                { value: 'all', label: t('support.robot.connections.filter.protocolAll') },
                { value: 'ROS', label: 'ROS' },
                { value: 'TCP', label: 'TCP' },
                { value: 'HTTP', label: 'HTTP' },
              ]}
              style={{ minWidth: 160 }}
              popupMatchSelectWidth={false}
              aria-label={t('support.robot.connections.filter.protocolAria')}
            />
            <div className="dev-data-foundry-toolbar-spacer">
              <Segmented<ViewMode>
                value={viewMode}
                onChange={setViewMode}
                options={[
                  { value: 'table', icon: <UnorderedListOutlined aria-hidden />, label: t('support.robot.connections.view.table') },
                  { value: 'grid', icon: <AppstoreOutlined aria-hidden />, label: t('support.robot.connections.view.grid') },
                ]}
              />
              <Select<SortKey>
                value={sortKey}
                onChange={setSortKey}
                options={[
                  { value: 'recent', label: t('library.sort.recent') },
                  { value: 'nameAsc', label: t('library.sort.nameAsc') },
                ]}
                style={{ minWidth: 200 }}
                popupMatchSelectWidth={false}
                aria-label={t('support.robot.connections.sort.aria')}
              />
            </div>
          </div>
        </div>

        <div className="support-definition-body">
          {filtered.length === 0 ? (
            <Empty description={t('support.robot.connections.endpoint.empty')} />
          ) : viewMode === 'grid' ? (
            <div className="robot-endpoint-grid-groups">
              {endpointGridGroups.map((group) => (
                <section key={group.compositionId} className="robot-endpoint-grid-group" aria-label={group.compositionName}>
                  {group.instances.length > 1 ? (
                    <div className="robot-endpoint-grid-group__heading">
                      <Typography.Title level={5} style={{ margin: 0 }}>
                        {group.compositionName}{' '}
                        <Typography.Text type="secondary" style={{ fontWeight: 400, fontSize: 15 }}>
                          ({group.instances.length})
                        </Typography.Text>
                      </Typography.Title>
                    </div>
                  ) : null}
                  <Row gutter={[12, 12]} className="support-definition-card-grid">
                    {group.instances.map((row) => (
                      <Col xs={24} sm={12} md={8} key={row.id}>
                        {endpointGridCard(row)}
                      </Col>
                    ))}
                  </Row>
                </section>
              ))}
            </div>
          ) : (
            <RobotInstanceOperationalList
              groups={endpointGridGroups}
              statusByEndpointId={statusByEndpointId}
              labels={opListLabels}
              expandAllKey={expandAllKey}
              onOpenInstance={goEndpointDetail}
              onConnect={onConnect}
              onDisconnect={onDisconnect}
              onReconnect={onReconnect}
              menuForInstance={menuForEndpoint}
            />
          )}
        </div>
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
                  navigate(supportRobotWorkspaceDetailPath('instances-endpoints', r.endpointId), {
                    state: { returnLnb: 'instances-endpoints' as const },
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
