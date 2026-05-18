import {
  AppstoreOutlined,
  BarsOutlined,
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { App, Button, Card, Col, Dropdown, Empty, Input, Row, Segmented, Select, Space, Tag, Typography, theme } from 'antd';
import type { MenuProps } from 'antd';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supportRobotWorkspaceCreatePath, supportRobotWorkspaceDetailPath, supportRobotWorkspaceEditPath } from '../../shared/config/supportPaths';
import { getSupportCompositionsMock, type SupportCompositionDto } from '../../mocks/supportCompositionsMock';
import { useLocale } from '../../shared/i18n/LocaleProvider';
import { matchesSearchQuery } from '../../shared/lib/listQuery';
import { useDescriptionScreen } from '../../shared/ui/common/DescriptionModeProvider';
import '../dev/dev-data-foundry-page.css';
import './support-definition-cards-page.css';
import './support-compositions-page.css';

type ViewMode = 'grid' | 'list';
type SortKey = 'recent' | 'oldest' | 'nameAsc' | 'nameDesc';

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

function CompositionCardMedia({ row }: { row: SupportCompositionDto }) {
  return (
    <div className="support-definition-card__media">
      <img src={modelImageUrl(row)} alt="" loading="lazy" decoding="async" />
    </div>
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
  const items = useMemo(() => getSupportCompositionsMock(), []);

  const [search, setSearch] = useState('');
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
      screenName: 'Robot Support — Robot Devices',
      screenId,
      screenDescription:
        '지원 워크스페이스 Robot Device 화면입니다. 카드 상단에 1개 Robot과 1개 이상 Robot Device Model 조합이 표시됩니다.',
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
          role: 'Robot + Robot Device Model 비주얼 스트립 + 제목·설명·메타',
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
          navigate(supportRobotWorkspaceEditPath('compositions', row.id));
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
          <Button type="primary" onClick={() => navigate(supportRobotWorkspaceCreatePath('compositions'))}>
            {t('support.robot.ui.createPlus')}
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
                      <CompositionCardMedia row={row} />
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
                        <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                          {modelLabel}: {row.model.name} · {devicesLabel}: {row.devices.length}
                        </Typography.Paragraph>
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
                  <div className="support-definition-list-row__thumb">
                    <img src={modelImageUrl(row)} alt="" loading="lazy" decoding="async" />
                  </div>
                  <div className="support-composition-list-row__main">
                    <Typography.Title level={5} style={{ marginTop: 0, marginBottom: 8 }}>
                      {row.name}
                    </Typography.Title>
                    <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }} ellipsis={{ rows: 2 }}>
                      {row.subtitle}
                    </Typography.Paragraph>
                    <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                      {modelLabel}: {row.model.name} · {devicesLabel}: {row.devices.length}
                    </Typography.Paragraph>
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

    </div>
  );
}
