import { AppstoreOutlined, BarsOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Input,
  Row,
  Segmented,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
  theme,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocale } from '../../shared/i18n/LocaleProvider';
import { matchesSearchQuery } from '../../shared/lib/listQuery';
import { useDescriptionScreen } from '../../shared/ui/common/DescriptionModeProvider';
import './dev-data-foundry-page.css';

/** Modalities that map to robot-learning–ready corpora (BC / offline RL / trajectory learning). */
export type DatasetModalityType = 'Episode' | 'movie' | 'Trajectory';

export type DatasetSource = 'Curator' | 'Generator' | 'Collector' | 'Register';

export interface DataFoundryDatasetRow {
  key: string;
  no: number;
  name: string;
  types: DatasetModalityType[];
  version: string;
  source: DatasetSource;
  time: string;
  worker: string;
  preprocessor: 'O' | 'X';
}

const TRAIN_READY_TYPES = new Set<DatasetModalityType>(['Episode', 'Trajectory']);

/** Publish only when data is preprocessed and includes at least one trajectory-style modality. */
export function canPublishDataset(row: DataFoundryDatasetRow): boolean {
  if (row.preprocessor !== 'O') return false;
  return row.types.some((t) => TRAIN_READY_TYPES.has(t));
}

const DATASET_POOL_SIZE = 240;
const PAGE_CHUNK = 36;

const TYPE_SETS: DatasetModalityType[][] = [
  ['Episode', 'Trajectory'],
  ['movie'],
  ['Episode'],
  ['Trajectory', 'movie'],
  ['movie', 'Episode'],
  ['Trajectory'],
  ['Episode', 'movie'],
];

const SOURCES: DatasetSource[] = ['Curator', 'Generator', 'Collector', 'Register'];
const WORKERS = ['Wiyoung', 'Mina', 'Alex', 'Chen', 'Jordan', 'Sam', 'Riley'];

function buildDatasetPool(total: number): DataFoundryDatasetRow[] {
  return Array.from({ length: total }, (_, i) => {
    const no = total - i;
    const types = TYPE_SETS[i % TYPE_SETS.length];
    const source = SOURCES[i % SOURCES.length];
    const worker = WORKERS[i % WORKERS.length];
    const hasTrainType = types.some((t) => TRAIN_READY_TYPES.has(t));
    const preprocessor: 'O' | 'X' = hasTrainType ? (i % 7 === 0 ? 'X' : 'O') : i % 4 === 0 ? 'O' : 'X';
    const day = 1 + (i % 28);
    const hour = String(8 + (i % 10)).padStart(2, '0');
    const min = String((i * 7) % 60).padStart(2, '0');
    const sec = String((i * 3) % 60).padStart(2, '0');
    return {
      key: `ds-${i}`,
      no,
      name: `Dataset corpus batch ${String(i + 1).padStart(3, '0')} — ${source} lane`,
      types,
      version: `v${(1 + (i % 3)).toFixed(1)}`,
      source,
      time: `2026-04-${String(day).padStart(2, '0')} ${hour}:${min}:${sec}`,
      worker,
      preprocessor,
    };
  });
}

const DATASET_POOL = buildDatasetPool(DATASET_POOL_SIZE);

type SourceFilter = 'all' | DatasetSource;
type SortKey = 'recent' | 'oldest' | 'nameAsc' | 'nameDesc';

function filterBySource(rows: DataFoundryDatasetRow[], source: SourceFilter): DataFoundryDatasetRow[] {
  if (source === 'all') return rows;
  return rows.filter((r) => r.source === source);
}

function filterBySearch(rows: DataFoundryDatasetRow[], q: string): DataFoundryDatasetRow[] {
  if (!q.trim()) return rows;
  return rows.filter((r) =>
    matchesSearchQuery(`${r.name} ${r.types.join(' ')} ${r.worker} ${r.source} ${r.version}`, q),
  );
}

function sortRows(rows: DataFoundryDatasetRow[], sortKey: SortKey): DataFoundryDatasetRow[] {
  const next = [...rows];
  switch (sortKey) {
    case 'recent':
      return next.sort((a, b) => b.time.localeCompare(a.time));
    case 'oldest':
      return next.sort((a, b) => a.time.localeCompare(b.time));
    case 'nameAsc':
      return next.sort((a, b) => a.name.localeCompare(b.name));
    case 'nameDesc':
      return next.sort((a, b) => b.name.localeCompare(a.name));
    default:
      return next;
  }
}

function renderDatasetTypeSummary(types: DatasetModalityType[]) {
  if (types.length === 0) return null;
  const cell = (
    <div className="dev-data-foundry-type-cell">
      <Tag bordered={false}>{types[0]}</Tag>
      {types.length > 1 ? (
        <Typography.Text type="secondary" className="dev-data-foundry-type-more">
          +{types.length - 1}
        </Typography.Text>
      ) : null}
    </div>
  );
  if (types.length > 1) {
    return <Tooltip title={types.join(', ')}>{cell}</Tooltip>;
  }
  return cell;
}

function getDomainContentScrollEl(): HTMLElement | null {
  return document.querySelector('.domain-layout .domain-content') as HTMLElement | null;
}

export interface DevDataFoundryPageProps {
  onOpenRegister?: () => void;
  onOpenGenerate?: () => void;
  onOpenCollect?: () => void;
  onOpenCurate?: () => void;
}

export function DevDataFoundryPage({ onOpenRegister, onOpenGenerate, onOpenCollect, onOpenCurate }: DevDataFoundryPageProps) {
  const { t } = useLocale();
  const { token } = theme.useToken();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('recent');
  const [visibleCount, setVisibleCount] = useState(PAGE_CHUNK);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadLock = useRef(false);

  const descriptionMeta = useMemo(
    () => ({
      screenName: '데이터 파운드리(저장 데이터셋)',
      screenId: 'DV-WS-DF-001',
      screenDescription:
        '워크스페이스에서 등록·수집·생성·큐레이션된 데이터셋을 조회하고, 학습에 적합한 코퍼스만 게시(Publish)할 수 있는 화면입니다.',
      areas: [
        { id: 'df-header', name: '워크스페이스 헤더', role: '제목·설명·진행 작업 버튼', userAction: '컨텍스트 확인', linkedScreen: 'Jobs(예정)' },
        { id: 'df-actions', name: '액션 카드', role: 'Register / Collect / Generate / Curate 진입', userAction: '카드 확인', linkedScreen: '각 마법사(예정)' },
        { id: 'df-table', name: '저장 데이터셋 테이블', role: '검색·필터·정렬·Publish', userAction: '행 선택·게시', linkedScreen: '데이터셋 상세(예정)' },
      ],
    }),
    [],
  );
  const { bindArea } = useDescriptionScreen(descriptionMeta);

  const sourceOptions = useMemo(
    () =>
      (['all', 'Curator', 'Generator', 'Collector', 'Register'] as const).map((v) => ({
        value: v,
        label: v === 'all' ? t('dataFoundry.sourceAll') : t(`dataFoundry.source.${v}`),
      })),
    [t],
  );

  const sortOptions = useMemo(
    () => [
      { value: 'recent' as const, label: t('dataFoundry.sort.recent') },
      { value: 'oldest' as const, label: t('dataFoundry.sort.oldest') },
      { value: 'nameAsc' as const, label: t('dataFoundry.sort.nameAsc') },
      { value: 'nameDesc' as const, label: t('dataFoundry.sort.nameDesc') },
    ],
    [t],
  );

  const filteredSorted = useMemo(() => {
    let rows = filterBySource(DATASET_POOL, sourceFilter);
    rows = filterBySearch(rows, search);
    return sortRows(rows, sortKey);
  }, [search, sourceFilter, sortKey]);

  useEffect(() => {
    setVisibleCount(PAGE_CHUNK);
  }, [search, sourceFilter, sortKey]);

  const hasMore = visibleCount < filteredSorted.length;
  const visibleRows = useMemo(() => filteredSorted.slice(0, visibleCount), [filteredSorted, visibleCount]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadLock.current) return;
    loadLock.current = true;
    setLoadingMore(true);
    window.setTimeout(() => {
      setVisibleCount((c) => Math.min(c + PAGE_CHUNK, filteredSorted.length));
      setLoadingMore(false);
      loadLock.current = false;
    }, 280);
  }, [hasMore, filteredSorted.length]);

  useEffect(() => {
    const root = getDomainContentScrollEl();
    if (!root) return undefined;
    const onScroll = () => {
      if (!hasMore || loadingMore) return;
      const { scrollTop, clientHeight, scrollHeight } = root;
      if (scrollHeight - scrollTop - clientHeight < 240) {
        loadMore();
      }
    };
    root.addEventListener('scroll', onScroll, { passive: true });
    return () => root.removeEventListener('scroll', onScroll);
  }, [hasMore, loadingMore, loadMore]);

  const columns: ColumnsType<DataFoundryDatasetRow> = useMemo(
    () => [
      { title: t('dataFoundry.col.no'), dataIndex: 'no', key: 'no', width: 56, sorter: (a, b) => a.no - b.no },
      {
        title: t('dataFoundry.col.name'),
        dataIndex: 'name',
        key: 'name',
        ellipsis: true,
        minWidth: 260,
        render: (name: string) => <Typography.Text strong>{name}</Typography.Text>,
      },
      {
        title: t('dataFoundry.col.type'),
        dataIndex: 'types',
        key: 'types',
        width: 128,
        render: (types: DatasetModalityType[]) => renderDatasetTypeSummary(types),
      },
      { title: t('dataFoundry.col.version'), dataIndex: 'version', key: 'version', width: 72 },
      {
        title: t('dataFoundry.col.source'),
        dataIndex: 'source',
        key: 'source',
        width: 96,
        render: (s: DatasetSource) => <Tag color="processing">{s}</Tag>,
      },
      { title: t('dataFoundry.col.worker'), dataIndex: 'worker', key: 'worker', width: 84, ellipsis: true },
    ],
    [t],
  );

  const stickyToolbarStyle = useMemo(
    () => ({
      background: token.colorBgLayout,
      borderBottom: `1px solid ${token.colorBorderSecondary}`,
    }),
    [token.colorBgLayout, token.colorBorderSecondary],
  );

  return (
    <div className="dev-data-foundry domain-workspace-route-root">
      <div className="dev-data-foundry-header" {...bindArea('df-header')}>
        <div>
          <Typography.Title level={3} className="dev-data-foundry-title">
            {t('dataFoundry.workspaceTitle')}
          </Typography.Title>
          <Typography.Paragraph type="secondary" className="domain-1depth-page-lead">
            {t('dataFoundry.workspaceLead')}
          </Typography.Paragraph>
        </div>
        <Button>{t('dataFoundry.jobsInProcess')}</Button>
      </div>

      <div className="dev-data-foundry-actions" {...bindArea('df-actions')}>
        <Row gutter={[16, 16]} wrap>
          <Col xs={24} sm={12} lg={6}>
            <Button
              type="default"
              size="large"
              block
              className="dev-data-foundry-action-btn"
              onClick={() => onOpenRegister?.()}
              disabled={!onOpenRegister}
            >
              {t('dataFoundry.card.register.title')}
            </Button>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Button
              type="default"
              size="large"
              block
              className="dev-data-foundry-action-btn"
              onClick={() => onOpenCollect?.()}
              disabled={!onOpenCollect}
            >
              {t('dataFoundry.card.collect.title')}
            </Button>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Button
              type="default"
              size="large"
              block
              className="dev-data-foundry-action-btn"
              onClick={() => onOpenGenerate?.()}
              disabled={!onOpenGenerate}
            >
              {t('dataFoundry.card.generate.title')}
            </Button>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Button
              type="default"
              size="large"
              block
              className="dev-data-foundry-action-btn"
              onClick={() => onOpenCurate?.()}
              disabled={!onOpenCurate}
            >
              {t('dataFoundry.card.curate.title')}
            </Button>
          </Col>
        </Row>
      </div>

      <div {...bindArea('df-table')}>
        <div className="dev-data-foundry-section-head">
          <Typography.Title level={4} style={{ margin: 0 }}>
            {t('dataFoundry.savedTitle')}
          </Typography.Title>
          <Tag bordered={false} color="default">
            {filteredSorted.length} {t('dataFoundry.datasetsUnit')}
          </Tag>
        </div>

        <div className="dev-data-foundry-toolbar-sticky" style={stickyToolbarStyle}>
          <div className="dev-data-foundry-toolbar">
            <Input
              allowClear
              className="dev-data-foundry-search forge-search-input"
              placeholder={t('dataFoundry.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select<SourceFilter>
              value={sourceFilter}
              options={sourceOptions}
              onChange={(v) => setSourceFilter((v ?? 'all') as SourceFilter)}
              style={{ minWidth: 160 }}
              popupMatchSelectWidth={false}
            />
            <div className="dev-data-foundry-toolbar-spacer">
              <Segmented
                value={viewMode}
                onChange={(v) => setViewMode(v as 'list' | 'grid')}
                options={[
                  { value: 'list', icon: <BarsOutlined aria-hidden />, label: t('dataFoundry.viewList') },
                  { value: 'grid', icon: <AppstoreOutlined aria-hidden />, label: t('dataFoundry.viewGrid') },
                ]}
              />
              <Select<SortKey>
                value={sortKey}
                options={sortOptions}
                onChange={(v) => setSortKey((v ?? 'recent') as SortKey)}
                style={{ minWidth: 200 }}
                popupMatchSelectWidth={false}
              />
            </div>
          </div>
        </div>

        {viewMode === 'list' ? (
          <>
            <Table<DataFoundryDatasetRow>
              size="small"
              rowKey="key"
              columns={columns}
              dataSource={visibleRows}
              pagination={false}
              scroll={{ x: 720 }}
            />
            {(loadingMore || hasMore) && (
              <div className="dev-data-foundry-infinite-footer">
                {loadingMore ? <Spin size="small" /> : hasMore ? <Typography.Text type="secondary">{t('dataFoundry.scrollForMore')}</Typography.Text> : null}
              </div>
            )}
          </>
        ) : (
          <>
            <Row gutter={[12, 12]}>
              {visibleRows.map((row) => (
                <Col xs={24} sm={12} md={8} key={row.key}>
                  <Card size="small" title={row.name}>
                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                      {renderDatasetTypeSummary(row.types)}
                      <Typography.Text type="secondary">
                        {row.version} · {row.source}
                      </Typography.Text>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
            {(loadingMore || hasMore) && (
              <div className="dev-data-foundry-infinite-footer">
                {loadingMore ? <Spin size="small" /> : hasMore ? <Typography.Text type="secondary">{t('dataFoundry.scrollForMore')}</Typography.Text> : null}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
