import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Card, Input, Select, Space, Table, Typography, theme } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PORTAL_ORDER,
  type PortalCode,
  type ScreenRegistryRow,
  loadScreenRegistry,
  portalLabel,
  PORTAL_CODES,
} from '../../data/parseScreens';
import { useLocale } from '../../shared/i18n/LocaleProvider';
import { ThemeToggle } from '../../shared/ui/common/ThemeToggle';
import './screen-list-page.css';

const ALL_PORTALS = 'all' as const;

type SortKey = 'screenId' | 'csvOrder';

function haystack(row: ScreenRegistryRow): string {
  return [
    row.screenId,
    row.screenName,
    row.description,
    row.depth1,
    row.depth2,
    row.depth3,
    row.depth4,
    row.depth5,
    portalLabel(row.code),
  ]
    .join(' ')
    .toLowerCase();
}

export function ScreenListPage() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const { token } = theme.useToken();

  const allRows = useMemo(() => loadScreenRegistry(), []);
  const [portalFilter, setPortalFilter] = useState<typeof ALL_PORTALS | PortalCode>(ALL_PORTALS);
  const [keyword, setKeyword] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('screenId');
  const [sortDesc, setSortDesc] = useState(false);

  const cycleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDesc((d) => !d);
    } else {
      setSortKey(key);
      setSortDesc(false);
    }
  };

  const filtered = useMemo(() => {
    let list = allRows;
    if (portalFilter !== ALL_PORTALS) {
      list = list.filter((r) => r.code === portalFilter);
    }
    const q = keyword.trim().toLowerCase();
    if (q) {
      list = list.filter((r) => haystack(r).includes(q));
    }
    return list;
  }, [allRows, portalFilter, keyword]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    const mul = sortDesc ? -1 : 1;
    if (sortKey === 'csvOrder') {
      list.sort((a, b) => (a.csvOrder - b.csvOrder) * mul);
    } else {
      list.sort((a, b) => a.screenId.localeCompare(b.screenId) * mul);
    }
    return list.map((row, i) => ({ ...row, displayNo: i + 1 }));
  }, [filtered, sortKey, sortDesc]);

  const groups = useMemo(() => {
    const map = new Map<string, (ScreenRegistryRow & { displayNo: number })[]>();
    PORTAL_ORDER.forEach((p) => map.set(p, []));
    sorted.forEach((row) => {
      const label = portalLabel(row.code);
      map.get(label)?.push(row);
    });
    return PORTAL_ORDER.map((label) => ({
      label,
      rows: map.get(label) ?? [],
    })).filter((g) => g.rows.length > 0);
  }, [sorted]);

  const portalBg = (label: string): string => {
    const i = PORTAL_ORDER.indexOf(label as (typeof PORTAL_ORDER)[number]);
    const palette = [
      token.colorFillSecondary,
      token.colorFillTertiary,
      token.colorFillAlter,
      token.colorFillSecondary,
      token.colorFillTertiary,
    ];
    return palette[i % palette.length] ?? token.colorFillAlter;
  };

  const columns: ColumnsType<ScreenRegistryRow & { displayNo: number }> = [
    {
      title: (
        <button
          type="button"
          className="screen-list-th-sort"
          onClick={() => cycleSort('csvOrder')}
        >
          No.
          {sortKey === 'csvOrder' ? (sortDesc ? ' ↓' : ' ↑') : ''}
        </button>
      ),
      dataIndex: 'displayNo',
      width: 88,
    },
    {
      title: 'Code',
      dataIndex: 'code',
      width: 100,
      render: (_, row) => portalLabel(row.code),
    },
    {
      title: (
        <button
          type="button"
          className="screen-list-th-sort"
          onClick={() => cycleSort('screenId')}
        >
          Screen ID
          {sortKey === 'screenId' ? (sortDesc ? ' ↓' : ' ↑') : ''}
        </button>
      ),
      dataIndex: 'screenId',
      width: 160,
      render: (text: string) => <Typography.Text strong>{text}</Typography.Text>,
    },
    { title: 'Depth1', dataIndex: 'depth1', width: 120, ellipsis: true },
    { title: 'Depth2', dataIndex: 'depth2', width: 120, ellipsis: true },
    { title: 'Depth3', dataIndex: 'depth3', width: 120, ellipsis: true },
    { title: 'Depth4', dataIndex: 'depth4', width: 100, ellipsis: true },
    { title: 'Depth5', dataIndex: 'depth5', width: 100, ellipsis: true },
    { title: 'Screen Name', dataIndex: 'screenName', width: 200, ellipsis: true },
    { title: 'Description', dataIndex: 'description', ellipsis: true },
  ];

  return (
    <div className="screen-list-page">
      <div className="screen-list-toolbar">
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>
          {t('screenList.backIntro')}
        </Button>
        <div className="screen-list-toolbar-spacer" />
        <ThemeToggle />
      </div>

      <div className="screen-list-inner">
        <header className="screen-list-header">
          <Typography.Title level={2} className="screen-list-title">
            {t('screenList.title')}
          </Typography.Title>
          <Typography.Paragraph type="secondary" className="screen-list-subtitle">
            {t('screenList.subtitle')}
          </Typography.Paragraph>
          <Typography.Text type="secondary" className="screen-list-total">
            {t('screenList.total').replace('{n}', String(filtered.length))}
          </Typography.Text>
        </header>

        <Space wrap className="screen-list-controls" size={12}>
          <Select
            style={{ minWidth: 180 }}
            value={portalFilter}
            onChange={(v) => setPortalFilter(v)}
            options={[
              { value: ALL_PORTALS, label: t('screenList.filterAll') },
              ...PORTAL_CODES.map((code) => ({ value: code, label: portalLabel(code) })),
            ]}
          />
          <Input.Search
            allowClear
            placeholder={t('screenList.searchPlaceholder')}
            className="forge-search-input"
            onChange={(e) => setKeyword(e.target.value)}
          />
          <Typography.Text type="secondary" className="screen-list-sort-hint">
            {t('screenList.sortColumnHint')}
          </Typography.Text>
        </Space>

        <Space direction="vertical" size={16} className="screen-list-groups">
          {groups.map((g) => (
            <Card
              key={g.label}
              className="screen-list-group-card"
              styles={{
                header: {
                  background: portalBg(g.label),
                  borderBottom: `1px solid ${token.colorBorderSecondary}`,
                  fontWeight: 600,
                },
              }}
              title={g.label}
            >
              <Table<ScreenRegistryRow & { displayNo: number }>
                size="middle"
                rowKey="key"
                className="screen-list-table"
                columns={columns}
                dataSource={g.rows}
                pagination={false}
                scroll={{ x: 1400 }}
                onRow={(record) => ({
                  onClick: () => navigate(record.route),
                  style: { cursor: 'pointer' },
                })}
                rowClassName={() => 'screen-list-data-row'}
              />
            </Card>
          ))}
        </Space>
      </div>
    </div>
  );
}
