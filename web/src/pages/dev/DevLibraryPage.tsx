import {
  AppstoreOutlined,
  BarsOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Card,
  Col,
  Empty,
  Input,
  Row,
  Segmented,
  Select,
  Space,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import { useMemo, useState } from 'react';
import { useLocale } from '../../shared/i18n/LocaleProvider';
import { useDescriptionScreen } from '../../shared/ui/common/DescriptionModeProvider';
import { matchesSearchQuery } from '../../shared/lib/listQuery';
import './dev-library-page.css';

type ViewMode = 'grid' | 'list';

interface LibraryCardItem {
  key: string;
  outputName: string;
  source: string;
  workDescription: string;
  projectName: string;
  sizeLabel: string;
  createdLabel: string;
  /** 정렬용 (최근 추가 등) */
  createdAt: number;
  /** 정렬용 바이트 */
  sizeBytes: number;
}

type SourceFilterValue = 'all' | 'Local' | 'Upload' | 'Simulation' | 'Training' | 'Registry';
type SortKey = 'recent' | 'oldest' | 'nameAsc' | 'nameDesc' | 'sizeDesc' | 'sizeAsc';

function itemSearchHaystack(item: LibraryCardItem): string {
  return `${item.outputName} ${item.source} ${item.workDescription} ${item.projectName} ${item.sizeLabel} ${item.createdLabel}`;
}

function filterBySearch(items: LibraryCardItem[], query: string): LibraryCardItem[] {
  return items.filter((item) => matchesSearchQuery(itemSearchHaystack(item), query));
}

function filterBySource(items: LibraryCardItem[], source: SourceFilterValue): LibraryCardItem[] {
  if (source === 'all') {
    return items;
  }
  return items.filter((item) => item.source === source);
}

function isSourceFilterValue(v: string): v is SourceFilterValue {
  return ['all', 'Local', 'Upload', 'Simulation', 'Training', 'Registry'].includes(v);
}

function sortItems(items: LibraryCardItem[], sortKey: SortKey): LibraryCardItem[] {
  const next = [...items];
  switch (sortKey) {
    case 'recent':
      return next.sort((a, b) => b.createdAt - a.createdAt);
    case 'oldest':
      return next.sort((a, b) => a.createdAt - b.createdAt);
    case 'nameAsc':
      return next.sort((a, b) => a.outputName.localeCompare(b.outputName));
    case 'nameDesc':
      return next.sort((a, b) => b.outputName.localeCompare(a.outputName));
    case 'sizeDesc':
      return next.sort((a, b) => b.sizeBytes - a.sizeBytes);
    case 'sizeAsc':
      return next.sort((a, b) => a.sizeBytes - b.sizeBytes);
    default:
      return next;
  }
}

const GB = 1024 ** 3;
const MB = 1024 ** 2;

const DATASET_ITEMS: LibraryCardItem[] = [
  {
    key: '1',
    outputName: 'Traffic_Sign_Dataset',
    source: 'Local',
    workDescription: 'Collected from urban intersections',
    projectName: 'Smart City',
    sizeLabel: '2.4GB',
    createdLabel: 'Created 3 hours ago',
    createdAt: Date.now() - 3 * 60 * 60 * 1000,
    sizeBytes: Math.round(2.4 * GB),
  },
  {
    key: '2',
    outputName: 'Warehouse_Pick_Place_v2',
    source: 'Upload',
    workDescription: 'RGB-D streams from assembly line cells',
    projectName: 'Logistics Bot',
    sizeLabel: '18.1GB',
    createdLabel: 'Created 1 day ago',
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    sizeBytes: Math.round(18.1 * GB),
  },
  {
    key: '3',
    outputName: 'Simulation_Rollouts_Q1',
    source: 'Simulation',
    workDescription: 'Synthetic trajectories for policy tuning',
    projectName: 'Dev Sandbox',
    sizeLabel: '920MB',
    createdLabel: 'Created 2 days ago',
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    sizeBytes: Math.round(920 * MB),
  },
  {
    key: '4',
    outputName: 'Night_Driving_Corpus',
    source: 'Local',
    workDescription: 'Low-light highway segments with lidar sync',
    projectName: 'Autonomous Driving',
    sizeLabel: '5.6GB',
    createdLabel: 'Created 4 days ago',
    createdAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
    sizeBytes: Math.round(5.6 * GB),
  },
];

const MODEL_ITEMS: LibraryCardItem[] = [
  {
    key: 'm1',
    outputName: 'YOLOv8_Object_Detector',
    source: 'Training',
    workDescription: 'Weights for real-time detection',
    projectName: 'Autonomous Driving',
    sizeLabel: '150MB',
    createdLabel: 'Created 1 day ago',
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    sizeBytes: Math.round(150 * MB),
  },
  {
    key: 'm2',
    outputName: 'RFM_Action_Policy_v3',
    source: 'Registry',
    workDescription: 'Residual foundation policy checkpoint',
    projectName: 'Forge Core',
    sizeLabel: '2.1GB',
    createdLabel: 'Created 6 hours ago',
    createdAt: Date.now() - 6 * 60 * 60 * 1000,
    sizeBytes: Math.round(2.1 * GB),
  },
  {
    key: 'm3',
    outputName: 'World_Model_Small',
    source: 'Training',
    workDescription: 'WM rollout predictor (256 latent)',
    projectName: 'Sim Lab',
    sizeLabel: '890MB',
    createdLabel: 'Created 3 days ago',
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    sizeBytes: Math.round(890 * MB),
  },
  {
    key: 'm4',
    outputName: 'Grip_Classifier_Pro',
    source: 'Upload',
    workDescription: 'Binary + multi-class grasp quality head',
    projectName: 'Warehouse Bot',
    sizeLabel: '64MB',
    createdLabel: 'Created 5 days ago',
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    sizeBytes: Math.round(64 * MB),
  },
];

function LibraryAssetCard({ item }: { item: LibraryCardItem }) {
  return (
    <Card className="dev-library-card" bordered>
      <div className="dev-library-card-head">
        <Typography.Text strong className="dev-library-card-title">
          {item.outputName}
        </Typography.Text>
        <Tag className="dev-library-card-source">{item.source}</Tag>
      </div>
      <Typography.Paragraph type="secondary" className="dev-library-card-desc" ellipsis={{ rows: 2 }}>
        {item.workDescription}
      </Typography.Paragraph>
      <div className="dev-library-card-meta">
        <Space size={4}>
          <span className="dev-library-meta-icon" aria-hidden />
          <Typography.Text type="secondary">{item.projectName}</Typography.Text>
        </Space>
        <Space size={4}>
          <span className="dev-library-meta-icon" aria-hidden />
          <Typography.Text type="secondary">{item.sizeLabel}</Typography.Text>
        </Space>
        <Space size={4}>
          <span className="dev-library-meta-icon" aria-hidden />
          <Typography.Text type="secondary">{item.createdLabel}</Typography.Text>
        </Space>
      </div>
    </Card>
  );
}

export function DevLibraryPage() {
  const { t, locale } = useLocale();
  const [activeTab, setActiveTab] = useState<'dataset' | 'model'>('dataset');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<SourceFilterValue>('all');
  const [sortKey, setSortKey] = useState<SortKey>('recent');

  const sourceOptions = useMemo(
    (): { value: SourceFilterValue; label: string }[] => [
      { value: 'all', label: t('library.source.all') },
      { value: 'Local', label: t('library.source.Local') },
      { value: 'Upload', label: t('library.source.Upload') },
      { value: 'Simulation', label: t('library.source.Simulation') },
      { value: 'Training', label: t('library.source.Training') },
      { value: 'Registry', label: t('library.source.Registry') },
    ],
    [t, locale],
  );

  const sortOptions = useMemo(
    (): { value: SortKey; label: string }[] => [
      { value: 'recent', label: t('library.sort.recent') },
      { value: 'oldest', label: t('library.sort.oldest') },
      { value: 'nameAsc', label: t('library.sort.nameAsc') },
      { value: 'nameDesc', label: t('library.sort.nameDesc') },
      { value: 'sizeDesc', label: t('library.sort.sizeDesc') },
      { value: 'sizeAsc', label: t('library.sort.sizeAsc') },
    ],
    [t, locale],
  );

  const visibleItems = useMemo(() => {
    const base = activeTab === 'dataset' ? DATASET_ITEMS : MODEL_ITEMS;
    const searched = filterBySearch(base, searchQuery);
    const filtered = filterBySource(searched, sourceFilter);
    return sortItems(filtered, sortKey);
  }, [activeTab, searchQuery, sourceFilter, sortKey]);

  const descriptionMeta = useMemo(
    () => ({
      screenName: '라이브러리',
      screenId: 'DV-LB-MN-001',
      screenDescription: '생성된 데이터셋·모델 자산을 한곳에서 검색·정렬·조회하는 라이브러리 화면',
      areas: [
        {
          id: 'library-header',
          name: '페이지 헤더',
          role: '화면 제목과 목적 안내',
          userAction: 'Library 범위를 확인',
          linkedScreen: 'Dataset / Model 상세(예정)',
        },
        {
          id: 'library-toolbar',
          name: '검색·필터·뷰 전환',
          role: '자산 검색, 출처·정렬, 그리드/리스트 표시 방식 전환',
          userAction: '검색어 입력, Source/Sort 선택, 뷰 아이콘 선택',
          linkedScreen: '필터 적용 결과 목록',
        },
        {
          id: 'library-tabs',
          name: 'Dataset / Model 탭',
          role: '자산 유형별 목록 전환',
          userAction: 'Dataset 또는 Model 탭 선택',
          linkedScreen: '동일 레이아웃의 유형별 카드 목록',
        },
        {
          id: 'library-grid',
          name: '카드 그리드',
          role: '자산 카드 목록 표시',
          userAction: '카드 선택·스크롤',
          linkedScreen: '자산 상세(예정)',
        },
      ],
    }),
    [],
  );

  const { bindArea } = useDescriptionScreen(descriptionMeta);

  return (
    <div className="dev-library-page">
      <div className="domain-1depth-page-header" {...bindArea('library-header')}>
        <Typography.Title level={2} className="domain-1depth-page-title">
          {t('library.title')}
        </Typography.Title>
        <Typography.Paragraph type="secondary" className="domain-1depth-page-lead">
          {t('library.subtitle')}
        </Typography.Paragraph>
      </div>

      <div {...bindArea('library-tabs')}>
        <Tabs
          activeKey={activeTab}
          onChange={(k) => setActiveTab(k as 'dataset' | 'model')}
          items={[
            { key: 'dataset', label: t('library.tab.dataset') },
            { key: 'model', label: t('library.tab.model') },
          ]}
          className="dev-library-tabs"
        />
      </div>

      <div className="dev-library-toolbar" {...bindArea('library-toolbar')}>
        <Input
          className="dev-library-search"
          placeholder={t('library.search')}
          suffix={<SearchOutlined />}
          allowClear
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Space wrap className="dev-library-toolbar-right">
          <Select<SourceFilterValue>
            value={sourceFilter}
            onChange={(v) => {
              if (isSourceFilterValue(v)) {
                setSourceFilter(v);
              }
            }}
            popupMatchSelectWidth={false}
            options={sourceOptions}
            className="dev-library-select"
          />
          <Select<SortKey>
            value={sortKey}
            onChange={(v) => setSortKey(v as SortKey)}
            popupMatchSelectWidth={false}
            options={sortOptions}
            className="dev-library-select"
          />
          <Segmented
            value={viewMode}
            onChange={(v) => setViewMode(v as ViewMode)}
            options={[
              { value: 'grid', icon: <AppstoreOutlined /> },
              { value: 'list', icon: <BarsOutlined /> },
            ]}
          />
        </Space>
      </div>

      <div {...bindArea('library-grid')}>
        {visibleItems.length === 0 ? (
          <Empty description={t('library.empty')} />
        ) : (
          <Row gutter={[24, 24]}>
            {visibleItems.map((item) => (
              <Col key={item.key} xs={24} md={viewMode === 'grid' ? 12 : 24}>
                <LibraryAssetCard item={item} />
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
}
