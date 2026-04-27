import {
  AppstoreOutlined,
  BarsOutlined,
  ClockCircleOutlined,
  CodeOutlined,
  DeleteOutlined,
  EditOutlined,
  FolderOutlined,
  MoreOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { App, Button, Card, Col, Dropdown, Empty, Input, Row, Segmented, Select, Space, Tag, Typography, theme } from 'antd';
import type { MenuProps } from 'antd';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supportRobotWorkspaceDetailPath } from '../../shared/config/supportPaths';
import { getSupportCompositionsMock, type SupportCompositionDto } from '../../mocks/supportCompositionsMock';
import { useLocale } from '../../shared/i18n/LocaleProvider';
import { matchesSearchQuery } from '../../shared/lib/listQuery';
import { useDescriptionScreen } from '../../shared/ui/common/DescriptionModeProvider';
import '../dev/dev-data-foundry-page.css';
import { CreateRobotCompositionModal } from './robot-create/CreateRobotCompositionModal';
import './support-compositions-page.css';

type ViewMode = 'grid' | 'list';
type SortKey = 'recent' | 'oldest' | 'nameAsc' | 'nameDesc';

const MAX_DEVICE_THUMBS = 4;

function haystack(row: SupportCompositionDto): string {
  const deviceBits = row.devices.map((d) => d.shortName).join(' ');
  return `${row.name} ${row.subtitle} ${row.projectName} ${row.model.name} ${deviceBits}`;
}

function filterByProject(list: SupportCompositionDto[], facet: string): SupportCompositionDto[] {
  if (facet === 'all') {
    return list;
  }
  return list.filter((r) => r.projectName === facet);
}

function sortRows(list: SupportCompositionDto[], sortKey: SortKey): SupportCompositionDto[] {
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

function modelImageUrl(row: SupportCompositionDto): string {
  return `https://picsum.photos/seed/${encodeURIComponent(`cp-${row.id}-m-${row.model.id}`)}/480/480`;
}

function deviceImageUrl(row: SupportCompositionDto, deviceId: string): string {
  return `https://picsum.photos/seed/${encodeURIComponent(`cp-${row.id}-d-${deviceId}`)}/480/480`;
}

type DeviceSlot = { kind: 'img'; id: string } | { kind: 'more'; n: number };

function buildDeviceSlots(devices: SupportCompositionDto['devices']): DeviceSlot[] {
  if (devices.length <= MAX_DEVICE_THUMBS) {
    return devices.map((d) => ({ kind: 'img' as const, id: d.id }));
  }
  const shown = MAX_DEVICE_THUMBS - 1;
  return [
    ...devices.slice(0, shown).map((d) => ({ kind: 'img' as const, id: d.id })),
    { kind: 'more' as const, n: devices.length - shown },
  ];
}

function CompositionVisual({
  row,
  modelLabel,
  devicesLabel,
}: {
  row: SupportCompositionDto;
  modelLabel: string;
  devicesLabel: string;
}) {
  const slots = buildDeviceSlots(row.devices);
  return (
    <div className="support-composition-card__visual">
      <div className="support-composition-card__model-block">
        <Typography.Text type="secondary" className="support-composition-card__block-label">
          {modelLabel}
        </Typography.Text>
        <div className="support-composition-card__model-frame">
          <img src={modelImageUrl(row)} alt="" loading="lazy" decoding="async" />
        </div>
      </div>
      <div className="support-composition-card__connector" aria-hidden>
        <PlusOutlined />
      </div>
      <div className="support-composition-card__devices-block">
        <Typography.Text type="secondary" className="support-composition-card__block-label">
          {devicesLabel}
        </Typography.Text>
        <div className="support-composition-card__device-grid">
          {slots.map((slot, i) =>
            slot.kind === 'img' ? (
              <div key={`${slot.id}-${i}`} className="support-composition-card__device-thumb" title={row.devices.find((d) => d.id === slot.id)?.shortName}>
                <img src={deviceImageUrl(row, slot.id)} alt="" loading="lazy" decoding="async" />
              </div>
            ) : (
              <div key="more" className="support-composition-card__device-more">
                +{slot.n}
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

function CompositionMetaBlock({ row, updatedLabel }: { row: SupportCompositionDto; updatedLabel: string }) {
  const { token } = theme.useToken();
  const iconProps = { style: { fontSize: 12, color: token.colorTextSecondary, flexShrink: 0 } };
  return (
    <Space direction="vertical" size={4} style={{ width: '100%' }}>
      <Space size={8} align="center">
        <CodeOutlined aria-hidden {...iconProps} />
        <Typography.Text type="secondary" ellipsis>
          {row.model.name}
        </Typography.Text>
      </Space>
      <Space size={8} align="center">
        <FolderOutlined aria-hidden {...iconProps} />
        <Typography.Text type="secondary">{row.projectName}</Typography.Text>
      </Space>
      <Space size={8} align="center">
        <ClockCircleOutlined aria-hidden {...iconProps} />
        <Typography.Text type="secondary">
          {updatedLabel}
          {row.updatedAt}
        </Typography.Text>
      </Space>
    </Space>
  );
}

export interface SupportCompositionsPageProps {
  screenId: string;
  titleKey: string;
  leadKey: string;
}

export function SupportCompositionsPage({ screenId, titleKey, leadKey }: SupportCompositionsPageProps) {
  const { token } = theme.useToken();
  const { t, locale } = useLocale();
  const { message } = App.useApp();
  const [listTick, setListTick] = useState(0);
  const items = useMemo(() => getSupportCompositionsMock(), [listTick]);

  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [facetFilter, setFacetFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('recent');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const projectNames = useMemo(() => {
    const set = new Set(items.map((r) => r.projectName));
    return [...set].sort((a, b) => a.localeCompare(b, 'en'));
  }, [items]);

  const projectOptions = useMemo(
    (): { value: string; label: string }[] => [
      { value: 'all', label: t('support.robot.compositions.filter.project.all') },
      ...projectNames.map((name) => ({ value: name, label: name })),
    ],
    [t, projectNames],
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

  const filteredItems = useMemo(() => {
    let list: SupportCompositionDto[] = [...items];
    if (search.trim()) {
      list = list.filter((row) => matchesSearchQuery(haystack(row), search));
    }
    list = filterByProject(list, facetFilter);
    return sortRows(list, sortKey);
  }, [items, search, facetFilter, sortKey]);

  const descriptionMeta = useMemo(
    () => ({
      screenName: 'Robot Support — Compositions',
      screenId,
      screenDescription:
        '지원 워크스페이스 컴포지션 화면입니다. 카드 상단에 1개 모델과 1개 이상 디바이스 조합이 시각적으로 표시됩니다.',
      areas: [
        {
          id: 'cp-list-heading',
          name: '섹션 헤더',
          role: 'Title level 4 + Tag 건수 + 등록',
          userAction: '범위 확인 또는 등록',
          linkedScreen: '등록(예정)',
        },
        {
          id: 'cp-toolbar',
          name: '툴바',
          role: '검색·프로젝트 필터·뷰·정렬',
          userAction: '검색·필터·뷰·정렬',
          linkedScreen: '—',
        },
        {
          id: 'cp-grid',
          name: '카드·리스트',
          role: '모델+디바이스 비주얼 스트립 + 제목·설명·메타',
          userAction: '항목 선택',
          linkedScreen: '상세(예정)',
        },
      ],
    }),
    [screenId],
  );

  const { bindArea } = useDescriptionScreen(descriptionMeta);
  const navigate = useNavigate();

  const handleCardActivate = (row: SupportCompositionDto) => {
    navigate(supportRobotWorkspaceDetailPath('compositions', row.id));
  };

  const menuForRow = (row: SupportCompositionDto): MenuProps => ({
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

  const countLabel = `${items.length} ${t('support.robot.compositions.unit')}`;
  const countAria = `${t('support.robot.definition.section.countAria')}: ${countLabel}`;
  const updatedPrefix = t('support.robot.definition.card.updatedPrefix');
  const modelLabel = t('support.robot.compositions.card.model');
  const devicesLabel = t('support.robot.compositions.card.devices');

  return (
    <div className="support-composition-page support-workspace-page dev-data-foundry">
      <div className="support-composition-page__stack">
        <div className="dev-data-foundry-header" {...bindArea('cp-list-heading')}>
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
          <Button type="primary" onClick={() => setCreateOpen(true)}>
            {t('support.sim.create.button')}
          </Button>
        </div>

        <div className="dev-data-foundry-toolbar-sticky" style={{ position: 'static', paddingTop: 0, marginBottom: 12 }}>
          <div className="dev-data-foundry-toolbar" {...bindArea('cp-toolbar')}>
            <Input
              allowClear
              className="dev-data-foundry-search forge-search-input"
              placeholder={t('support.robot.compositions.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label={t('support.robot.compositions.search.aria')}
            />
            <Select<string>
              value={facetFilter}
              onChange={setFacetFilter}
              options={projectOptions}
              style={{ minWidth: 180 }}
              popupMatchSelectWidth={false}
              aria-label={t('support.robot.compositions.filter.project.aria')}
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

        <div className="support-composition-body" {...bindArea('cp-grid')}>
          {filteredItems.length === 0 ? (
            <Empty description={t('support.robot.compositions.empty')} />
          ) : viewMode === 'grid' ? (
            <Row gutter={[12, 12]} className="support-composition-card-grid">
              {filteredItems.map((row) => (
                <Col xs={24} sm={12} md={8} key={row.id}>
                  <div className="support-composition-card-wrap">
                    <Card
                      size="small"
                      bordered
                      className="support-composition-card"
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
                      <CompositionVisual row={row} modelLabel={modelLabel} devicesLabel={devicesLabel} />
                      <div className="support-composition-card__actions">
                        <Dropdown menu={menuForRow(row)} trigger={['hover']} placement="bottomRight">
                          <Button
                            type="text"
                            icon={<MoreOutlined />}
                            className="support-composition-card__taco"
                            aria-label={t('support.robot.definition.card.menuAria')}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Dropdown>
                      </div>
                      <div className="support-composition-card__body">
                        <Typography.Title level={5} style={{ marginTop: 0, marginBottom: 8 }}>
                          {row.name}
                        </Typography.Title>
                        <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }} ellipsis={{ rows: 2 }}>
                          {row.subtitle}
                        </Typography.Paragraph>
                        <CompositionMetaBlock row={row} updatedLabel={updatedPrefix} />
                      </div>
                    </Card>
                  </div>
                </Col>
              ))}
            </Row>
          ) : (
            <div className="support-composition-list">
              {filteredItems.map((row) => (
                <div
                  key={row.id}
                  className="support-composition-list-row"
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
                  <div className="support-composition-list-row__visual">
                    <CompositionVisual row={row} modelLabel={modelLabel} devicesLabel={devicesLabel} />
                  </div>
                  <div className="support-composition-list-row__main">
                    <Typography.Title level={5} style={{ marginTop: 0, marginBottom: 8 }}>
                      {row.name}
                    </Typography.Title>
                    <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }} ellipsis={{ rows: 2 }}>
                      {row.subtitle}
                    </Typography.Paragraph>
                    <CompositionMetaBlock row={row} updatedLabel={updatedPrefix} />
                  </div>
                  <div className="support-composition-list-row__actions">
                    <Dropdown menu={menuForRow(row)} trigger={['hover']} placement="bottomRight">
                      <Button
                        type="text"
                        icon={<MoreOutlined />}
                        className="support-composition-card__taco"
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

      <CreateRobotCompositionModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={() => setListTick((n) => n + 1)} />
    </div>
  );
}
