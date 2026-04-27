import { BookOutlined, LoginOutlined } from '@ant-design/icons';
import { Button, Input, Layout, Select, Typography, theme } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocale } from '../../shared/i18n/LocaleProvider';
import { ThemeToggle } from '../../shared/ui/common/ThemeToggle';
import {
  UI_GUIDE_CATALOG_GENERATED_AT,
  UI_GUIDE_SCANNED_ANTD,
  UI_GUIDE_SCANNED_ICONS,
} from './ui-guide/catalog.generated';
import { UiGuideDetailPanel, useScannedMaps } from './ui-guide/UiGuideDetail';
import {
  UI_GUIDE_CATEGORIES,
  type UiGuideCategory,
  type UiGuideSelection,
  buildNavEntriesForCategory,
  filterNavEntries,
  selectionKey,
} from './ui-guide/uiGuideNavModel';
import './ui-guide-page.css';

const { Sider, Content } = Layout;

const CATEGORY_LABELS_EN: Record<UiGuideCategory, string> = {
  foundation: 'Foundation',
  components: 'Components',
  patterns: 'Patterns',
  layout: 'Layout',
  feedback: 'Feedback',
};

export function UiGuidePage() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const { token } = theme.useToken();
  const [category, setCategory] = useState<UiGuideCategory>('foundation');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<UiGuideSelection>({ kind: 'manual', id: 'foundation:color' });

  const scanned = useMemo(
    () => ({ antd: UI_GUIDE_SCANNED_ANTD, icons: UI_GUIDE_SCANNED_ICONS }),
    [],
  );
  const { antdMap, iconsList } = useScannedMaps(scanned);

  const navEntries = useMemo(() => buildNavEntriesForCategory(category, scanned.antd), [category, scanned.antd]);
  const filteredNav = useMemo(() => filterNavEntries(navEntries, search), [navEntries, search]);

  const selectedKey = selectionKey(selected);

  useEffect(() => {
    const entries = filterNavEntries(buildNavEntriesForCategory(category, scanned.antd), search);
    if (entries.length === 0) return;
    const sk = selectionKey(selected);
    if (!entries.some((e) => e.key === sk)) {
      setSelected(entries[0].selection);
    }
  }, [category, search, scanned.antd, selected]);

  const onPick = useCallback(
    (key: string) => {
      const entry = filteredNav.find((e) => e.key === key);
      if (entry) setSelected(entry.selection);
    },
    [filteredNav],
  );

  return (
    <div className="ui-guide-page">
      <div className="ui-guide-page-toolbar">
        <Button type="text" icon={<BookOutlined />} onClick={() => navigate('/')}>
          {t('ui.backIntro')}
        </Button>
        <div className="ui-guide-page-toolbar-spacer" />
        <Button icon={<LoginOutlined />} onClick={() => navigate('/login')}>
          {t('intro.goForge')}
        </Button>
        <ThemeToggle />
      </div>

      <div className="ui-guide-page-shell">
        <Typography.Title level={2} className="ui-guide-page-title">
          {t('ui.title')}
        </Typography.Title>
        <Typography.Paragraph type="secondary" className="ui-guide-page-lead">
          {t('ui.lead')} — Catalog generated at {UI_GUIDE_CATALOG_GENERATED_AT.slice(0, 19)}Z ({scanned.antd.length}{' '}
          Ant components, {scanned.icons.length} icons).
        </Typography.Paragraph>

        <Layout className="ui-guide-layout" style={{ background: 'transparent' }}>
          <Sider
            width={280}
            className="ui-guide-sider"
            style={{ background: token.colorBgContainer, border: `1px solid ${token.colorBorderSecondary}` }}
          >
            <div className="ui-guide-category-row">
              <Typography.Text type="secondary" className="ui-guide-category-label">
                {t('ui.category')}
              </Typography.Text>
              <Select<UiGuideCategory>
                className="ui-guide-category-select"
                size="middle"
                value={category}
                onChange={(k) => {
                  setCategory(k);
                  setSearch('');
                }}
                options={UI_GUIDE_CATEGORIES.map((k) => ({
                  value: k,
                  label: CATEGORY_LABELS_EN[k],
                }))}
                popupMatchSelectWidth={false}
                aria-label={t('ui.category')}
              />
            </div>
            <div className="ui-guide-nav-search">
              <Input.Search
                allowClear
                placeholder="Filter…"
                className="forge-search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onSearch={setSearch}
              />
            </div>
            <div className="ui-guide-nav-list" role="navigation" aria-label="UI Guide sections">
              {filteredNav.map((e) => (
                <button
                  key={e.key}
                  type="button"
                  className={`ui-guide-nav-item ${e.key === selectedKey ? 'ui-guide-nav-item--active' : ''}`}
                  onClick={() => onPick(e.key)}
                >
                  {e.label}
                </button>
              ))}
              {filteredNav.length === 0 ? (
                <Typography.Text type="secondary" style={{ padding: '8px 12px', display: 'block' }}>
                  No matches
                </Typography.Text>
              ) : null}
            </div>
          </Sider>
          <Content className="ui-guide-main" style={{ background: token.colorBgContainer }}>
            <div className="ui-guide-main-inner">
              <UiGuideDetailPanel
                selection={selected}
                scannedAntdMap={antdMap}
                scannedIconsList={iconsList}
              />
            </div>
          </Content>
        </Layout>
      </div>
    </div>
  );
}
