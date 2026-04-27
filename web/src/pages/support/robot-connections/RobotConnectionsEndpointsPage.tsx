import { AppstoreOutlined, BarsOutlined } from '@ant-design/icons';
import { App, Button, Card, Col, Empty, Input, Modal, Row, Segmented, Select, Space, Tag, Typography, theme } from 'antd';
import { useMemo, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  deleteRobotEndpoint,
  getRobotEndpointsMock,
  syncConnectionStatusFromEndpoint,
  upsertRobotEndpoint,
  type RobotEndpointDto,
  type RobotEndpointProtocol,
} from '../../../mocks/robotConnectionsMocks';
import { supportRobotWorkspaceDetailPath } from '../../../shared/config/supportPaths';
import { useLocale } from '../../../shared/i18n/LocaleProvider';
import { matchesSearchQuery } from '../../../shared/lib/listQuery';
import '../../dev/dev-data-foundry-page.css';
import '../support-definition-cards-page.css';
import { CreateRobotEndpointModal } from './CreateRobotEndpointModal';
import './robot-connections-pages.css';

type ViewMode = 'grid' | 'list';
type ProtocolFilter = 'all' | RobotEndpointProtocol;
type SortKey = 'recent' | 'nameAsc';

function haystack(row: RobotEndpointDto): string {
  return `${row.name} ${row.ipAddress} ${row.description}`;
}

function sortRows(list: RobotEndpointDto[], sortKey: SortKey): RobotEndpointDto[] {
  const next = [...list];
  if (sortKey === 'nameAsc') {
    return next.sort((a, b) => a.name.localeCompare(b.name, 'en'));
  }
  return next.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function statusDotClass(s: RobotEndpointDto['status']) {
  if (s === 'connected') return 'robot-endpoint-status-dot robot-endpoint-status-dot--connected';
  if (s === 'error') return 'robot-endpoint-status-dot robot-endpoint-status-dot--error';
  if (s === 'reconnecting') return 'robot-endpoint-status-dot robot-endpoint-status-dot--reconnecting';
  return 'robot-endpoint-status-dot robot-endpoint-status-dot--disconnected';
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
  const items = useMemo(() => getRobotEndpointsMock(), [tick]);
  const [search, setSearch] = useState('');
  const [protocolFilter, setProtocolFilter] = useState<ProtocolFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('recent');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<RobotEndpointDto | null>(null);

  const refresh = () => setTick((n) => n + 1);

  const filtered = useMemo(() => {
    let list = items.filter((row) => matchesSearchQuery(haystack(row), search));
    if (protocolFilter !== 'all') {
      list = list.filter((r) => r.protocol === protocolFilter);
    }
    return sortRows(list, sortKey);
  }, [items, search, protocolFilter, sortKey]);

  const openCreate = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

  const openEdit = (row: RobotEndpointDto) => {
    setEditTarget(row);
    setModalOpen(true);
  };

  const applyEndpoint = (row: RobotEndpointDto, patch: Partial<RobotEndpointDto>) => {
    const today = new Date().toISOString().slice(0, 10);
    upsertRobotEndpoint({ ...row, ...patch, updatedAt: today });
    syncConnectionStatusFromEndpoint(row.id);
    refresh();
  };

  const onConnect = (row: RobotEndpointDto, e?: MouseEvent) => {
    e?.stopPropagation();
    applyEndpoint(row, {
      status: 'connected',
      latencyMs: Math.max(10, row.latencyMs || 14),
    });
    message.success(t('support.robot.connections.actions.connect'));
  };

  const onDisconnect = (row: RobotEndpointDto, e?: MouseEvent) => {
    e?.stopPropagation();
    applyEndpoint(row, { status: 'disconnected', latencyMs: 0 });
    message.info(t('support.robot.connections.actions.disconnect'));
  };

  const onReconnect = (row: RobotEndpointDto, e?: MouseEvent) => {
    e?.stopPropagation();
    applyEndpoint(row, { status: 'reconnecting', latencyMs: Math.max(row.latencyMs, 120) });
    window.setTimeout(() => {
      applyEndpoint(getRobotEndpointsMock().find((x) => x.id === row.id) ?? row, {
        status: 'connected',
        latencyMs: Math.floor(Math.random() * 25) + 10,
      });
      message.success(t('support.robot.connections.detail.reconnectDone'));
    }, 1000);
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

  const protocolColor = (p: RobotEndpointProtocol) => (p === 'ROS' ? 'blue' : p === 'TCP' ? 'geekblue' : 'cyan');

  const statusTag = (s: RobotEndpointDto['status']) => {
    if (s === 'connected') return <Tag color="success">{t('support.robot.connections.status.connected')}</Tag>;
    if (s === 'error') return <Tag color="error">{t('support.robot.connections.status.error')}</Tag>;
    if (s === 'reconnecting') return <Tag color="warning">{t('support.robot.connections.sessions.status.reconnecting')}</Tag>;
    return <Tag color="default">{t('support.robot.connections.status.disconnected')}</Tag>;
  };

  const goEndpointDetail = (id: string) => {
    navigate(supportRobotWorkspaceDetailPath('connections-endpoints', id), {
      state: { returnLnb: 'connections-endpoints' as const },
    });
  };

  const footerActions = (row: RobotEndpointDto) => (
    <div className="robot-endpoint-card-v2__actions-inner" onClick={(e) => e.stopPropagation()}>
      <Space wrap size={8} className="robot-endpoint-card-v2__action-buttons">
        <Button size="small" type="primary" onClick={(e) => onConnect(row, e)}>
          {t('support.robot.connections.actions.connect')}
        </Button>
        <Button size="small" type="default" onClick={(e) => onDisconnect(row, e)}>
          {t('support.robot.connections.actions.disconnect')}
        </Button>
        <Button size="small" type="default" ghost onClick={(e) => onReconnect(row, e)}>
          {t('support.robot.connections.actions.reconnect')}
        </Button>
        <Button size="small" type="link" onClick={(e) => { e.stopPropagation(); goEndpointDetail(row.id); }}>
          {t('support.robot.connections.healthResult.viewDetails')}
        </Button>
        <Button size="small" type="link" onClick={(e) => { e.stopPropagation(); openEdit(row); }}>
          {t('support.robot.definition.card.edit')}
        </Button>
        <Button size="small" type="link" danger onClick={(e) => { e.stopPropagation(); onDelete(row); }}>
          {t('support.robot.definition.card.delete')}
        </Button>
      </Space>
    </div>
  );

  const endpointCardBody = (row: RobotEndpointDto) => (
    <div
      className="robot-endpoint-card-v2"
      role="button"
      tabIndex={0}
      aria-label={row.name}
      onClick={() => goEndpointDetail(row.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          goEndpointDetail(row.id);
        }
      }}
    >
      <div className="robot-endpoint-card-v2__row robot-endpoint-card-v2__row--header">
        <div className="robot-endpoint-card-v2__left">
          <Typography.Text strong className="robot-endpoint-card-v2__name">
            {row.name}
          </Typography.Text>
          <Typography.Text type="secondary" className="robot-endpoint-card-v2__sub">
            {row.ipAddress}:{row.port}
          </Typography.Text>
        </div>
        <div className="robot-endpoint-card-v2__right robot-endpoint-card-v2__status-block">
          <span className={statusDotClass(row.status)} aria-hidden />
          {statusTag(row.status)}
        </div>
      </div>
      <div className="robot-endpoint-card-v2__row robot-endpoint-card-v2__row--meta">
        <Tag color={protocolColor(row.protocol)}>{row.protocol}</Tag>
      </div>
      <div className="robot-endpoint-card-v2__row robot-endpoint-card-v2__row--footer">
        <div className="robot-endpoint-card-v2__actions robot-endpoint-card-v2__actions--full">{footerActions(row)}</div>
      </div>
    </div>
  );

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
          <Button type="primary" onClick={openCreate}>
            {t('support.robot.connections.endpoint.create')}
          </Button>
        </div>

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
                  { value: 'list', icon: <BarsOutlined aria-hidden />, label: t('dataFoundry.viewList') },
                  { value: 'grid', icon: <AppstoreOutlined aria-hidden />, label: t('dataFoundry.viewGrid') },
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
            <Row gutter={[16, 16]} className="support-definition-card-grid">
              {filtered.map((row) => (
                <Col xs={24} sm={12} md={8} key={row.id}>
                  <div className="robot-endpoint-card-wrap">
                    <Card
                      size="small"
                      bordered
                      className="robot-endpoint-card robot-endpoint-card--v2"
                      styles={{ body: { padding: 0 } }}
                      style={{ borderColor: token.colorBorderSecondary }}
                    >
                      <div className="robot-endpoint-card__surface robot-endpoint-card__surface--v2">{endpointCardBody(row)}</div>
                    </Card>
                  </div>
                </Col>
              ))}
            </Row>
          ) : (
            <div className="support-composition-list">
              {filtered.map((row) => (
                <div key={row.id} className="support-composition-list-row robot-endpoint-list-row-v2" style={{ borderColor: token.colorBorderSecondary }}>
                  {endpointCardBody(row)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateRobotEndpointModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditTarget(null);
        }}
        onSaved={refresh}
        mode={editTarget ? 'edit' : 'create'}
        endpoint={editTarget}
      />

    </div>
  );
}
