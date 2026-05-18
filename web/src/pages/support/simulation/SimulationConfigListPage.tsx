import { DeleteOutlined, EditOutlined, MoreOutlined } from '@ant-design/icons';
import { App, Button, Card, Dropdown, Empty, Input, Select, Space, Tag, Typography, theme } from 'antd';
import type { MenuProps } from 'antd';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getSimulationConfigurationsMock,
  getSimulationPresetsMock,
  type SimulationConfigDto,
  type SimulationPresetDto,
} from '../../../mocks/simulationSupportMocks';
import { useLocale } from '../../../shared/i18n/LocaleProvider';
import { supportSimulationConfigDetailPath, supportSimulationPresetDetailPath, supportSimulationWorkspaceCreatePath } from '../../../shared/config/supportPaths';
import { matchesSearchQuery } from '../../../shared/lib/listQuery';
import '../../dev/dev-data-foundry-page.css';
import '../support-definition-cards-page.css';
import '../support-tasks-page.css';
import './simulation-support-pages.css';

export type SimulationConfigListVariant = 'configuration' | 'preset';

export interface SimulationConfigListPageProps {
  variant: SimulationConfigListVariant;
}

type FacetFilter = 'all' | 'default' | 'stress' | 'regression';

function configHaystack(c: SimulationConfigDto): string {
  return `${c.name} ${c.description}`;
}

function presetHaystack(p: SimulationPresetDto): string {
  return `${p.name} ${p.description} ${p.boundConfigName}`;
}

export function SimulationConfigListPage({ variant }: SimulationConfigListPageProps) {
  const { token } = theme.useToken();
  const { t } = useLocale();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const configs = getSimulationConfigurationsMock();
  const presets = getSimulationPresetsMock();
  const [search, setSearch] = useState('');
  const [facet, setFacet] = useState<FacetFilter>('all');

  const filteredConfigs = useMemo(() => {
    let list = configs.filter((c) => matchesSearchQuery(configHaystack(c), search));
    if (facet !== 'all') {
      list = list.filter((c) => c.facet === facet);
    }
    return list;
  }, [configs, search, facet]);

  const filteredPresets = useMemo(() => {
    let list = presets.filter((p) => matchesSearchQuery(presetHaystack(p), search));
    if (facet !== 'all') {
      list = list.filter((p) => p.facet === facet);
    }
    return list;
  }, [presets, search, facet]);

  const isPreset = variant === 'preset';
  const titleKey = isPreset ? 'support.sim.presets.title' : 'support.sim.configs.title';
  const leadKey = isPreset ? 'support.sim.presets.lead' : 'support.sim.configs.lead';
  const searchPh = isPreset ? 'support.sim.presets.search.placeholder' : 'support.sim.configs.search.placeholder';
  const emptyLabel = isPreset ? 'support.sim.presets.empty' : 'support.sim.configs.empty';
  const list = isPreset ? filteredPresets : filteredConfigs;

  const facetOptions: { value: FacetFilter; label: string }[] = [
    { value: 'all', label: t('support.sim.configs.filter.all') },
    { value: 'default', label: t('support.sim.configs.filter.default') },
    { value: 'stress', label: t('support.sim.configs.filter.stress') },
    { value: 'regression', label: t('support.sim.configs.filter.regression') },
  ];

  const menuForPreset = (row: SimulationPresetDto): MenuProps => ({
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

  const menuForConfig = (row: SimulationConfigDto): MenuProps => ({
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

  const cardMenuTrigger = (menu: MenuProps) => (
    <Dropdown menu={menu} trigger={['hover']} placement="bottomRight">
      <Button
        type="text"
        icon={<MoreOutlined />}
        className="support-definition-card__taco"
        aria-label={t('support.robot.definition.card.menuAria')}
        onClick={(e) => e.stopPropagation()}
      />
    </Dropdown>
  );

  return (
    <div className="support-task-page support-workspace-page dev-data-foundry sim-support-page">
      <div className="sim-support-page__stack">
        <div className="dev-data-foundry-header" style={{ marginBottom: 12 }}>
          <div>
            <Typography.Title level={3} className="dev-data-foundry-title domain-content-title" style={{ margin: 0 }}>
              {t(titleKey)}
            </Typography.Title>
            <Typography.Paragraph type="secondary" className="domain-1depth-page-lead">
              {t(leadKey)}
            </Typography.Paragraph>
          </div>
          <Button
            type="primary"
            onClick={() =>
              navigate(
                supportSimulationWorkspaceCreatePath(variant === 'configuration' ? 'sim-configurations' : 'sim-presets'),
              )
            }
          >
            {t('support.sim.create.button')}
          </Button>
        </div>

        <div className="dev-data-foundry-toolbar-sticky" style={{ position: 'static', paddingTop: 0, marginBottom: 12 }}>
          <div className="dev-data-foundry-toolbar">
            <Input
              allowClear
              className="dev-data-foundry-search forge-search-input"
              placeholder={t(searchPh)}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select<FacetFilter>
              value={facet}
              onChange={setFacet}
              options={facetOptions}
              style={{ minWidth: 160 }}
              popupMatchSelectWidth={false}
            />
          </div>
        </div>

        <div className="support-task-list">
          {list.length === 0 ? (
            <Empty description={t(emptyLabel)} />
          ) : isPreset ? (
            (filteredPresets as SimulationPresetDto[]).map((row) => (
              <Card
                key={row.id}
                size="small"
                bordered
                className="sim-config-card sim-config-card--clickable sim-config-card--with-actions"
                style={{ marginBottom: 10, borderColor: token.colorBorderSecondary }}
                role="button"
                tabIndex={0}
                onClick={() => navigate(supportSimulationPresetDetailPath(row.id))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(supportSimulationPresetDetailPath(row.id));
                  }
                }}
              >
                <div className="support-definition-card__actions sim-config-card__actions-menu">{cardMenuTrigger(menuForPreset(row))}</div>
                <Space direction="vertical" size={6} style={{ width: '100%' }}>
                  <Space wrap align="center">
                    <Typography.Title level={5} style={{ margin: 0 }}>
                      {row.name}
                    </Typography.Title>
                    <Tag color="purple">{t('support.sim.presets.badge')}</Tag>
                    <Tag>{row.facet}</Tag>
                  </Space>
                  <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                    {row.description}
                  </Typography.Paragraph>
                  <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                    {t('support.sim.presets.boundConfig')}: {row.boundConfigName} · {t('support.sim.presets.boundAssets')}: {row.boundAssetCount}
                  </Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {t('support.sim.common.updatedPrefix')}
                    {row.updatedAt}
                  </Typography.Text>
                </Space>
              </Card>
            ))
          ) : (
            filteredConfigs.map((row) => (
              <Card
                key={row.id}
                size="small"
                bordered
                className="sim-config-card sim-config-card--clickable sim-config-card--with-actions"
                style={{ marginBottom: 10, borderColor: token.colorBorderSecondary }}
                role="button"
                tabIndex={0}
                onClick={() => navigate(supportSimulationConfigDetailPath(row.id))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(supportSimulationConfigDetailPath(row.id));
                  }
                }}
              >
                <div className="support-definition-card__actions sim-config-card__actions-menu">{cardMenuTrigger(menuForConfig(row))}</div>
                <Space direction="vertical" size={6} style={{ width: '100%' }}>
                  <Space wrap align="center">
                    <Typography.Title level={5} style={{ margin: 0 }}>
                      {row.name}
                    </Typography.Title>
                    <Tag>{row.facet}</Tag>
                  </Space>
                  <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                    {row.description}
                  </Typography.Paragraph>
                  <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                    {t('support.sim.create.config.field.scene')}: {row.sceneName} · {row.assetsCount} {t('support.sim.configs.assets')} · {row.eventsCount}{' '}
                    {t('support.sim.configs.events')}
                  </Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {t('support.sim.common.updatedPrefix')}
                    {row.updatedAt}
                  </Typography.Text>
                </Space>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
