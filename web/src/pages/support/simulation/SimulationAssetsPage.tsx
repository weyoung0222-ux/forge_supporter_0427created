import { AppstoreOutlined, BarsOutlined, DeleteOutlined, EditOutlined, MoreOutlined } from '@ant-design/icons';
import { App, Button, Card, Col, Dropdown, Empty, Input, Row, Segmented, Select, Space, Tag, Typography, theme } from 'antd';
import type { MenuProps } from 'antd';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSimulationAssetsMock, type SimAssetType, type SimulationAssetDto } from '../../../mocks/simulationSupportMocks';
import { supportSimulationAssetDetailPath, supportSimulationWorkspaceCreatePath } from '../../../shared/config/supportPaths';
import { useLocale } from '../../../shared/i18n/LocaleProvider';
import { matchesSearchQuery } from '../../../shared/lib/listQuery';
import '../../dev/dev-data-foundry-page.css';
import '../support-definition-cards-page.css';
import './simulation-support-pages.css';
import { SimulationAssetPreviewModal } from './SimulationAssetPreviewModal';

type ViewMode = 'grid' | 'list';
type SortKey = 'recent' | 'name';

function haystack(row: SimulationAssetDto): string {
  return `${row.name} ${row.description} ${row.tags.join(' ')}`;
}

export function SimulationAssetsPage() {
  const { token } = theme.useToken();
  const { t } = useLocale();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const items = getSimulationAssetsMock();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | SimAssetType>('all');
  const [sortKey, setSortKey] = useState<SortKey>('recent');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [previewAsset, setPreviewAsset] = useState<SimulationAssetDto | null>(null);

  const filtered = useMemo(() => {
    let list = items.filter((row) => matchesSearchQuery(haystack(row), search));
    if (typeFilter !== 'all') {
      list = list.filter((r) => r.type === typeFilter);
    }
    const sorted = [...list];
    if (sortKey === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
    return sorted;
  }, [items, search, typeFilter, sortKey]);

  const countLabel = t('support.sim.assets.count').replace('{n}', String(filtered.length));
  const img = (id: string) =>
    `https://picsum.photos/seed/${encodeURIComponent(`sim-asset-${id}`)}/480/480`;

  const typeOptions = [
    { value: 'all' as const, label: t('support.sim.assets.filter.all') },
    { value: 'robot' as const, label: t('support.sim.assets.type.robot') },
    { value: 'object' as const, label: t('support.sim.assets.type.object') },
    { value: 'environment' as const, label: t('support.sim.assets.type.environment') },
  ];

  const sortOptions = [
    { value: 'recent' as const, label: t('support.sim.assets.sort.recent') },
    { value: 'name' as const, label: t('support.sim.assets.sort.name') },
  ];

  const openDetail = (row: SimulationAssetDto) => {
    navigate(supportSimulationAssetDetailPath(row.id));
  };

  const typeColor = (ty: SimAssetType) => {
    if (ty === 'robot') return 'blue';
    if (ty === 'object') return 'gold';
    return 'green';
  };

  const menuForAsset = (row: SimulationAssetDto): MenuProps => ({
    items: [
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: t('support.robot.definition.card.edit'),
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation();
          message.info(`${t('support.robot.definition.card.editDemoPrefix')}${row.name}`);
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
          message.warning(`${t('support.robot.definition.card.deleteDemoPrefix')}${row.name}`);
        },
      },
    ],
  });

  const assetMenuTrigger = (row: SimulationAssetDto) => (
    <Dropdown menu={menuForAsset(row)} trigger={['hover']} placement="bottomRight">
      <Button
        type="text"
        icon={<MoreOutlined />}
        className="support-definition-card__taco"
        aria-label={t('support.robot.definition.card.menuAria')}
        onClick={(e) => e.stopPropagation()}
      />
    </Dropdown>
  );

  const assetCardMedia = (row: SimulationAssetDto) => (
    <div className="support-definition-card__media sim-asset-card__media-host">
      <img src={img(row.id)} alt="" loading="lazy" decoding="async" />
      <div className="support-definition-card__actions">{assetMenuTrigger(row)}</div>
      <div className="sim-asset-card__hover">
        <Button
          type="primary"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            setPreviewAsset(row);
          }}
        >
          {t('support.sim.preview.open')}
        </Button>
      </div>
    </div>
  );

  const assetCardBody = (row: SimulationAssetDto) => (
    <div
      className="support-definition-card__body sim-asset-card__detail"
      role="link"
      tabIndex={0}
      aria-label={row.name}
      onClick={() => openDetail(row)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openDetail(row);
        }
      }}
    >
      <Typography.Title level={5} style={{ marginTop: 0, marginBottom: 8 }}>
        {row.name}
      </Typography.Title>
      <Space size={4} wrap style={{ marginBottom: 8 }}>
        <Tag color={typeColor(row.type)}>{t(`support.sim.assets.type.${row.type}`)}</Tag>
      </Space>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 8 }} ellipsis={{ rows: 2 }}>
        {row.description}
      </Typography.Paragraph>
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        {t('support.sim.common.createdPrefix')}
        {row.updatedAt}
      </Typography.Text>
    </div>
  );

  return (
    <div className="support-definition-page support-workspace-page dev-data-foundry sim-support-page">
      <div className="sim-support-page__stack">
        <div className="dev-data-foundry-header" style={{ marginBottom: 12 }}>
          <div>
            <Space align="center" wrap className="support-workspace-title-line" size={10}>
              <Typography.Title level={3} className="dev-data-foundry-title domain-content-title" style={{ margin: 0 }}>
                {t('support.sim.assets.title')}
              </Typography.Title>
              <Tag bordered={false} color="default">
                {countLabel}
              </Tag>
            </Space>
            <Typography.Paragraph type="secondary" className="domain-1depth-page-lead">
              {t('support.sim.assets.lead')}
            </Typography.Paragraph>
          </div>
          <Button type="primary" onClick={() => navigate(supportSimulationWorkspaceCreatePath('sim-assets'))}>
            {t('support.sim.create.button')}
          </Button>
        </div>

        <div className="dev-data-foundry-toolbar-sticky" style={{ position: 'static', paddingTop: 0, marginBottom: 12 }}>
          <div className="dev-data-foundry-toolbar">
            <Input
              allowClear
              className="dev-data-foundry-search forge-search-input"
              placeholder={t('support.sim.assets.search.placeholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label={t('support.sim.assets.search.aria')}
            />
            <Select<'all' | SimAssetType>
              value={typeFilter}
              onChange={setTypeFilter}
              options={typeOptions}
              style={{ minWidth: 160 }}
              popupMatchSelectWidth={false}
              aria-label={t('support.sim.assets.filter.type')}
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
                options={sortOptions}
                style={{ minWidth: 160 }}
                popupMatchSelectWidth={false}
              />
            </div>
          </div>
        </div>

        <div className="support-definition-body">
          {filtered.length === 0 ? (
            <Empty description={t('support.sim.assets.empty')} />
          ) : viewMode === 'grid' ? (
            <Row gutter={[12, 12]} className="support-definition-card-grid">
              {filtered.map((row) => (
                <Col xs={24} sm={12} md={8} key={row.id}>
                  <div className="support-definition-card-wrap sim-asset-card-wrap">
                    <Card size="small" bordered className="support-definition-card" styles={{ body: { padding: 0 } }} style={{ borderColor: token.colorBorderSecondary }}>
                      {assetCardMedia(row)}
                      {assetCardBody(row)}
                    </Card>
                  </div>
                </Col>
              ))}
            </Row>
          ) : (
            <div className="support-definition-list">
              {filtered.map((row) => (
                <div key={row.id} className="sim-asset-card-wrap">
                  <div className="support-definition-list-row sim-asset-list-row" style={{ borderColor: token.colorBorderSecondary }}>
                    <div className="support-definition-list-row__thumb sim-asset-list-thumb">
                      <img src={img(row.id)} alt="" loading="lazy" decoding="async" />
                      <div className="support-definition-card__actions">{assetMenuTrigger(row)}</div>
                      <div className="sim-asset-card__hover">
                        <Button
                          type="primary"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewAsset(row);
                          }}
                        >
                          {t('support.sim.preview.open')}
                        </Button>
                      </div>
                    </div>
                    <div
                      className="support-definition-list-row__main"
                      role="link"
                      tabIndex={0}
                      aria-label={row.name}
                      onClick={() => openDetail(row)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          openDetail(row);
                        }
                      }}
                    >
                      <Typography.Title level={5} style={{ marginTop: 0, marginBottom: 8 }}>
                        {row.name}
                      </Typography.Title>
                      <Tag color={typeColor(row.type)}>{t(`support.sim.assets.type.${row.type}`)}</Tag>
                      <Typography.Paragraph type="secondary" style={{ marginBottom: 8 }} ellipsis={{ rows: 2 }}>
                        {row.description}
                      </Typography.Paragraph>
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        {t('support.sim.common.createdPrefix')}
                        {row.updatedAt}
                      </Typography.Text>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <SimulationAssetPreviewModal
        open={Boolean(previewAsset)}
        asset={previewAsset}
        onClose={() => setPreviewAsset(null)}
        onEditAsset={() => {
          if (!previewAsset) return;
          setPreviewAsset(null);
          navigate(supportSimulationAssetDetailPath(previewAsset.id));
        }}
      />
    </div>
  );
}
