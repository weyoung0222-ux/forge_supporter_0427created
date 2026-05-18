import {
  AppstoreOutlined,
  BarsOutlined,
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { App, Button, Card, Col, Dropdown, Empty, Input, Row, Segmented, Select, Space, Tag, Typography, theme } from 'antd';
import type { MenuProps } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  supportRobotWorkspaceCreatePath,
  supportRobotWorkspaceDetailPath,
  supportRobotWorkspaceEditPath,
} from '../../shared/config/supportPaths';
import {
  getSupportDefinitionDevicesMock,
  getSupportDefinitionModelsMock,
  type SupportDefinitionCardDto,
  type SupportDefinitionDeviceDto,
  type SupportDefinitionModelDto,
} from '../../mocks/supportDefinitionMock';
import { useLocale } from '../../shared/i18n/LocaleProvider';
import { matchesSearchQuery } from '../../shared/lib/listQuery';
import { useDescriptionScreen } from '../../shared/ui/common/DescriptionModeProvider';
import '../dev/dev-data-foundry-page.css';
import './support-definition-cards-page.css';

type ViewMode = 'grid' | 'list';
type SortKey = 'recent' | 'oldest' | 'nameAsc' | 'nameDesc';
type ModelSourceFilter = 'all' | SupportDefinitionModelDto['source'];
type DeviceClassFilter = 'all' | SupportDefinitionDeviceDto['deviceClass'];

function haystack(row: SupportDefinitionCardDto): string {
  const base = `${row.name} ${row.version} ${row.projectName} ${row.subtitle}`;
  if (row.kind === 'model') {
    return `${base} ${row.source}`;
  }
  const d = row;
  const extra = [d.manufacturer, d.modelName, d.modelVariant, d.displayName, d.deviceCatalogType, d.deviceSubtype].filter(Boolean).join(' ');
  return `${base} ${d.deviceClass} ${extra}`;
}

function filterByFacet(
  list: SupportDefinitionCardDto[],
  variant: 'robot' | 'device',
  facet: string,
): SupportDefinitionCardDto[] {
  if (facet === 'all') {
    return list;
  }
  if (variant === 'robot') {
    return list.filter((r): r is SupportDefinitionModelDto => r.kind === 'model' && r.source === facet);
  }
  return list.filter((r): r is SupportDefinitionDeviceDto => r.kind === 'device' && r.deviceClass === facet);
}

function sortRows(list: SupportDefinitionCardDto[], sortKey: SortKey): SupportDefinitionCardDto[] {
  const next = [...list];
  switch (sortKey) {
    case 'recent':
      return next.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    case 'oldest':
      return next.sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
    case 'nameAsc':
      return next.sort((a, b) => a.name.localeCompare(b.name, 'en'));
    case 'nameDesc':
      return next.sort((a, b) => b.name.localeCompare(a.name, 'en'));
    default:
      return next;
  }
}

function deviceTypeChipLabel(row: SupportDefinitionDeviceDto, t: (key: string) => string): string | null {
  if (!row.deviceCatalogType) return null;
  return t(`support.robot.definition.deviceChip.${row.deviceCatalogType}`);
}

function definitionCardIdentityLine(row: SupportDefinitionCardDto): string | null {
  if (row.kind === 'model') {
    const parts = [row.manufacturer, row.modelName, row.modelVariant].filter(Boolean);
    return parts.length ? parts.join(' · ') : null;
  }
  const d = row;
  const parts = [d.manufacturer, d.modelName, d.modelVariant].filter(Boolean);
  return parts.length ? parts.join(' · ') : null;
}

function DefinitionCatalogCardMeta({ row }: { row: SupportDefinitionCardDto }) {
  const identity = definitionCardIdentityLine(row);
  if (!identity) return null;
  return (
    <Typography.Paragraph type="secondary" style={{ marginBottom: 0, fontSize: 12 }}>
      {identity}
    </Typography.Paragraph>
  );
}

export interface SupportDefinitionCardsPageProps {
  variant: 'robot' | 'device';
  screenId: string;
  titleKey: string;
  leadKey: string;
}

export function SupportDefinitionCardsPage({ variant, screenId, titleKey, leadKey }: SupportDefinitionCardsPageProps) {
  const { token } = theme.useToken();
  const { t, locale } = useLocale();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const items = useMemo(
    () => (variant === 'robot' ? getSupportDefinitionModelsMock() : getSupportDefinitionDevicesMock()),
    [variant],
  );

  const [search, setSearch] = useState('');
  const [facetFilter, setFacetFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('recent');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const modelSourceOptions = useMemo(
    (): { value: ModelSourceFilter; label: string }[] => [
      { value: 'all', label: t('library.source.all') },
      { value: 'Local', label: t('library.source.Local') },
      { value: 'Upload', label: t('library.source.Upload') },
      { value: 'Simulation', label: t('library.source.Simulation') },
      { value: 'Training', label: t('library.source.Training') },
      { value: 'Registry', label: t('library.source.Registry') },
    ],
    [t, locale],
  );

  const deviceClassOptions = useMemo(
    (): { value: DeviceClassFilter; label: string }[] => [
      { value: 'all', label: t('support.robot.definition.filter.deviceClass.all') },
      { value: 'Sensing', label: t('support.robot.definition.filter.deviceClass.sensing') },
      { value: 'Manipulation', label: t('support.robot.definition.filter.deviceClass.manipulation') },
      { value: 'Locomotion', label: t('support.robot.definition.filter.deviceClass.locomotion') },
      { value: 'Compute', label: t('support.robot.definition.filter.deviceClass.compute') },
    ],
    [t, locale],
  );

  const sortOptions = useMemo(
    (): { value: SortKey; label: string }[] => [
      { value: 'recent', label: t('library.sort.recent') },
      { value: 'oldest', label: t('library.sort.oldest') },
      { value: 'nameAsc', label: t('library.sort.nameAsc') },
      { value: 'nameDesc', label: t('library.sort.nameDesc') },
    ],
    [t, locale],
  );

  useEffect(() => {
    setSearch('');
    setFacetFilter('all');
  }, [variant]);

  const filteredItems = useMemo(() => {
    let list: SupportDefinitionCardDto[] = [...items];
    if (search.trim()) {
      list = list.filter((row) => matchesSearchQuery(haystack(row), search));
    }
    list = filterByFacet(list, variant, facetFilter);
    return sortRows(list, sortKey);
  }, [items, search, facetFilter, sortKey, variant]);

  const descriptionMeta = useMemo(
    () => ({
      screenName: variant === 'robot' ? 'Robot Support — Definition Robot' : 'Robot Support — Definition Robot Device Models',
      screenId,
      screenDescription:
        variant === 'robot'
          ? 'Robot(기종·모델) 정의 목록입니다.'
          : '지원 워크스페이스 Robot Device Model 정의 화면입니다. Data Foundry와 동일한 섹션 헤더·툴바를 사용합니다.',
      areas: [
        {
          id: 'def-list-heading',
          name: '섹션 헤더',
          role: 'Title + count',
          userAction: '범위 확인 또는 등록',
          linkedScreen: '등록(예정)',
        },
        {
          id: 'def-toolbar',
          name: '툴바',
          role: '검색·필터·뷰·정렬',
          userAction: '검색·필터·뷰·정렬',
          linkedScreen: '—',
        },
        {
          id: 'def-grid',
          name: '카드·리스트',
          role: '썸네일 + 제목·설명·아이콘 메타',
          userAction: '항목 선택',
          linkedScreen: '상세(예정)',
        },
      ],
    }),
    [screenId, variant],
  );

  const { bindArea } = useDescriptionScreen(descriptionMeta);

  const imageUrl = (id: string) =>
    `https://picsum.photos/seed/${encodeURIComponent(`def-${variant}-${id}`)}/480/480`;

  const handleCardActivate = (row: SupportDefinitionCardDto) => {
    const lnbKey = variant === 'robot' ? 'definition-robot' : 'definition-devices';
    navigate(supportRobotWorkspaceDetailPath(lnbKey, row.id));
  };

  const menuForRow = (row: SupportDefinitionCardDto): MenuProps => ({
    items: [
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: t('support.robot.definition.card.edit'),
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation();
          const lnbKey = variant === 'robot' ? 'definition-robot' : 'definition-devices';
          navigate(supportRobotWorkspaceEditPath(lnbKey, row.id));
        },
      },
      {
        type: 'divider',
      },
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

  const unitWord =
    variant === 'robot' ? t('support.robot.definition.badge.unitModels') : t('support.robot.definition.badge.unitDevices');
  const countLabel = `${items.length} ${unitWord}`;
  const countAria = `${t('support.robot.definition.section.countAria')}: ${countLabel}`;

  const facetSelectOptions: { value: string; label: string }[] =
    variant === 'robot' ? modelSourceOptions : deviceClassOptions;

  return (
    <div className="support-definition-page support-workspace-page dev-data-foundry">
      <div className="support-definition-page__stack">
        <div className="dev-data-foundry-header" {...bindArea('def-list-heading')}>
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
          <Button
            type="primary"
            onClick={() => navigate(supportRobotWorkspaceCreatePath(variant === 'robot' ? 'definition-robot' : 'definition-devices'))}
          >
            {t('support.robot.ui.createPlus')}
          </Button>
        </div>

        <div className="dev-data-foundry-toolbar-sticky" style={{ position: 'static', paddingTop: 0, marginBottom: 12 }}>
          <div className="dev-data-foundry-toolbar" {...bindArea('def-toolbar')}>
            <Input
              allowClear
              className="dev-data-foundry-search forge-search-input"
              placeholder={t('support.robot.definition.search.placeholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label={t('support.robot.definition.search.aria')}
            />
            <Select<string>
              value={facetFilter}
              onChange={setFacetFilter}
              options={facetSelectOptions}
              style={{ minWidth: 160 }}
              popupMatchSelectWidth={false}
              aria-label={
                variant === 'robot'
                  ? t('support.robot.definition.filter.source.aria')
                  : t('support.robot.definition.filter.deviceClass.aria')
              }
            />
            <div className="dev-data-foundry-toolbar-spacer">
              <Segmented<ViewMode>
                value={viewMode}
                onChange={(v) => setViewMode(v)}
                options={[
                  { value: 'list', icon: <BarsOutlined aria-hidden />, label: t('dataFoundry.viewList') },
                  { value: 'grid', icon: <AppstoreOutlined aria-hidden />, label: t('dataFoundry.viewGrid') },
                ]}
              />
              <Select<SortKey>
                value={sortKey}
                onChange={(v) => setSortKey(v)}
                options={sortOptions}
                style={{ minWidth: 200 }}
                popupMatchSelectWidth={false}
                aria-label={t('support.robot.definition.sort.aria')}
              />
            </div>
          </div>
        </div>

        <div className="support-definition-body" {...bindArea('def-grid')}>
          {filteredItems.length === 0 ? (
            <Empty description={t('support.robot.definition.empty')} />
          ) : viewMode === 'grid' ? (
            <Row gutter={[12, 12]} className="support-definition-card-grid">
              {filteredItems.map((row) => (
                <Col xs={24} sm={12} md={8} key={row.id}>
                  <div className="support-definition-card-wrap">
                    <Card
                      size="small"
                      bordered
                      className="support-definition-card"
                      styles={{ body: { padding: 0 } }}
                      tabIndex={0}
                      role="link"
                      aria-label={row.name}
                      onClick={() => handleCardActivate(row)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleCardActivate(row);
                        }
                      }}
                      style={{ borderColor: token.colorBorderSecondary }}
                    >
                      <div className="support-definition-card__media">
                        <img src={imageUrl(row.id)} alt="" loading="lazy" decoding="async" />
                        <div className="support-definition-card__actions">
                          <Dropdown menu={menuForRow(row)} trigger={['hover']} placement="bottomRight">
                            <Button
                              type="text"
                              icon={<MoreOutlined />}
                              className="support-definition-card__taco"
                              aria-label={t('support.robot.definition.card.menuAria')}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </Dropdown>
                        </div>
                      </div>
                      <div className="support-definition-card__body">
                        <Space align="center" size={8} wrap style={{ marginBottom: 8 }}>
                          <Typography.Title level={5} style={{ margin: 0 }}>
                            {row.name}
                          </Typography.Title>
                          {row.kind === 'device' ? (
                            (() => {
                              const chip = deviceTypeChipLabel(row, t);
                              return chip ? <Tag>{chip}</Tag> : null;
                            })()
                          ) : null}
                        </Space>
                        <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }} ellipsis={{ rows: 2 }}>
                          {row.subtitle}
                        </Typography.Paragraph>
                        <DefinitionCatalogCardMeta row={row} />
                      </div>
                    </Card>
                  </div>
                </Col>
              ))}
            </Row>
          ) : (
            <div className="support-definition-list">
              {filteredItems.map((row) => (
                <div
                  key={row.id}
                  className="support-definition-list-row"
                  role="link"
                  tabIndex={0}
                  onClick={() => handleCardActivate(row)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleCardActivate(row);
                    }
                  }}
                  style={{ borderColor: token.colorBorderSecondary }}
                >
                  <div className="support-definition-list-row__thumb">
                    <img src={imageUrl(row.id)} alt="" loading="lazy" decoding="async" />
                  </div>
                  <div className="support-definition-list-row__main">
                    <Space align="center" size={8} wrap style={{ marginBottom: 8 }}>
                      <Typography.Title level={5} style={{ margin: 0 }}>
                        {row.name}
                      </Typography.Title>
                      {row.kind === 'device' ? (
                        (() => {
                          const chip = deviceTypeChipLabel(row, t);
                          return chip ? <Tag>{chip}</Tag> : null;
                        })()
                      ) : null}
                    </Space>
                    <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }} ellipsis={{ rows: 2 }}>
                      {row.subtitle}
                    </Typography.Paragraph>
                    <DefinitionCatalogCardMeta row={row} />
                  </div>
                  <div className="support-definition-list-row__actions">
                    <Dropdown menu={menuForRow(row)} trigger={['hover']} placement="bottomRight">
                      <Button
                        type="text"
                        icon={<MoreOutlined />}
                        className="support-definition-card__taco"
                        aria-label={t('support.robot.definition.card.menuAria')}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Dropdown>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
