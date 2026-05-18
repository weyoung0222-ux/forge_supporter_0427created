import { AppstoreOutlined, BarsOutlined, DeleteOutlined, EditOutlined, MoreOutlined, SaveOutlined } from '@ant-design/icons';
import { App, Button, Card, Col, Dropdown, Empty, Input, Row, Segmented, Select, Space, Tag, Typography, theme } from 'antd';
import type { MenuProps } from 'antd';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSimulationScenesMock, previewUrl, type SceneOrigin, type SimulationSceneDto } from '../../../mocks/simulationSupportMocks';
import {
  SUPPORT_SIM_SCENE_AUTO_COMPOSE_PATH,
  supportSimulationSceneDetailPath,
  supportSimulationSceneEditorPath,
  supportSimulationWorkspaceCreatePath,
} from '../../../shared/config/supportPaths';
import { useLocale } from '../../../shared/i18n/LocaleProvider';
import { matchesSearchQuery } from '../../../shared/lib/listQuery';
import '../../dev/dev-data-foundry-page.css';
import '../support-definition-cards-page.css';
import '../support-compositions-page.css';
import { SimulationScenePreviewModal } from './SimulationScenePreviewModal';
import { buildDraftFromSimulationSceneRow } from './simulationSceneListDraft';
import './simulation-support-pages.css';

type ViewMode = 'grid' | 'list';
type OriginFilter = 'all' | SceneOrigin;

export function SimulationScenesPage() {
  const { token } = theme.useToken();
  const { t } = useLocale();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [previewScene, setPreviewScene] = useState<SimulationSceneDto | null>(null);
  const items = getSimulationScenesMock();
  const previewDraft = useMemo(() => (previewScene ? buildDraftFromSimulationSceneRow(previewScene) : null), [previewScene]);
  const [search, setSearch] = useState('');
  const [originFilter, setOriginFilter] = useState<OriginFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const filtered = (() => {
    let list = items.filter((row) => matchesSearchQuery(row.name, search));
    if (originFilter !== 'all') {
      list = list.filter((r) => r.origin === originFilter);
    }
    return list;
  })();

  const originLabel = (o: SceneOrigin) => (o === 'ai' ? t('support.sim.scenes.origin.ai') : t('support.sim.scenes.origin.manual'));

  const originColor = (o: SceneOrigin) => (o === 'ai' ? 'purple' : 'default');

  const menuForScene = (row: SimulationSceneDto): MenuProps => ({
    items: [
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: t('support.sim.scenes.hover.edit'),
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation();
          navigate(supportSimulationSceneEditorPath(row.id));
        },
      },
      {
        key: 'save',
        icon: <SaveOutlined />,
        label: t('support.sim.scenes.hover.saveAsset'),
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation();
          message.success(`${t('support.sim.scenes.hoverDemo')}: ${t('support.sim.scenes.hover.saveAsset')}`);
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

  const sceneCardMenuTrigger = (row: SimulationSceneDto) => (
    <Dropdown menu={menuForScene(row)} trigger={['hover']} placement="bottomRight">
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
    <div className="support-composition-page support-workspace-page dev-data-foundry sim-support-page">
      <div className="sim-support-page__stack">
        <div className="dev-data-foundry-header" style={{ marginBottom: 12 }}>
          <div>
            <Typography.Title level={3} className="dev-data-foundry-title domain-content-title" style={{ margin: 0 }}>
              {t('support.sim.scenes.title')}
            </Typography.Title>
            <Typography.Paragraph type="secondary" className="domain-1depth-page-lead">
              {t('support.sim.scenes.lead')}
            </Typography.Paragraph>
          </div>
          <Space wrap>
            <Button onClick={() => navigate(SUPPORT_SIM_SCENE_AUTO_COMPOSE_PATH)}>{t('support.sim.scenes.autoCompose')}</Button>
            <Button type="primary" onClick={() => navigate(supportSimulationWorkspaceCreatePath('sim-scenes'))}>
              {t('support.sim.create.button')}
            </Button>
          </Space>
        </div>

        <div className="dev-data-foundry-toolbar-sticky" style={{ position: 'static', paddingTop: 0, marginBottom: 12 }}>
          <div className="dev-data-foundry-toolbar">
            <Input
              allowClear
              className="dev-data-foundry-search forge-search-input"
              placeholder={t('support.sim.scenes.search.placeholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select<OriginFilter>
              value={originFilter}
              onChange={setOriginFilter}
              options={[
                { value: 'all', label: t('support.sim.scenes.filter.all') },
                { value: 'manual', label: t('support.sim.scenes.filter.manual') },
                { value: 'ai', label: t('support.sim.scenes.filter.ai') },
              ]}
              style={{ minWidth: 160 }}
              popupMatchSelectWidth={false}
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
            </div>
          </div>
        </div>

        <div className="support-composition-body">
          {filtered.length === 0 ? (
            <Empty description={t('support.sim.scenes.empty')} />
          ) : viewMode === 'grid' ? (
            <Row gutter={[12, 12]} className="support-composition-card-grid">
              {filtered.map((row) => (
                <Col xs={24} sm={12} md={8} key={row.id}>
                  <div className="sim-scene-card-wrap">
                    <Card
                      size="small"
                      bordered
                      className="sim-scene-card support-composition-card"
                      styles={{ body: { padding: 0 } }}
                      style={{ borderColor: token.colorBorderSecondary }}
                    >
                      <div className="sim-scene-card__media">
                        <img src={previewUrl(`sim-scene-${row.id}`, 640, 400)} alt="" loading="lazy" decoding="async" />
                        <div className="support-definition-card__actions sim-scene-card__actions-menu">{sceneCardMenuTrigger(row)}</div>
                        <div className="sim-scene-card__hover">
                          <div className="sim-scene-card__hover-inner">
                            <Button
                              size="small"
                              type="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewScene(row);
                              }}
                            >
                              {t('support.sim.scenes.hover.preview')}
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div
                        className="sim-scene-card__body"
                        role="link"
                        tabIndex={0}
                        aria-label={row.name}
                        onClick={() => navigate(supportSimulationSceneDetailPath(row.id))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            navigate(supportSimulationSceneDetailPath(row.id));
                          }
                        }}
                      >
                        <Typography.Title level={5} style={{ marginTop: 0, marginBottom: 8 }}>
                          {row.name}
                        </Typography.Title>
                        <Space size={6} wrap>
                          <Typography.Text type="secondary">
                            {t('support.sim.scenes.assetsCount').replace('{n}', String(row.assetCount))}
                          </Typography.Text>
                          <Tag color={originColor(row.origin)}>{originLabel(row.origin)}</Tag>
                        </Space>
                        <Typography.Paragraph type="secondary" style={{ marginBottom: 0, marginTop: 8, fontSize: 12 }}>
                          {t('support.sim.scenes.updated')}: {row.updatedAt}
                        </Typography.Paragraph>
                      </div>
                    </Card>
                  </div>
                </Col>
              ))}
            </Row>
          ) : (
            <div className="support-composition-list">
              {filtered.map((row) => (
                <div key={row.id} className="support-composition-list-row sim-scene-list-row" style={{ borderColor: token.colorBorderSecondary }}>
                  <div className="support-composition-list-row__visual sim-scene-list-thumb">
                    <img src={previewUrl(`sim-scene-${row.id}`, 280, 180)} alt="" style={{ width: '100%', borderRadius: 8 }} />
                    <div className="support-definition-card__actions sim-scene-card__actions-menu">{sceneCardMenuTrigger(row)}</div>
                    <div className="sim-scene-card__hover">
                      <div className="sim-scene-card__hover-inner">
                        <Button
                          size="small"
                          type="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewScene(row);
                          }}
                        >
                          {t('support.sim.scenes.hover.preview')}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div
                    className="support-composition-list-row__main"
                    role="link"
                    tabIndex={0}
                    aria-label={row.name}
                    onClick={() => navigate(supportSimulationSceneDetailPath(row.id))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate(supportSimulationSceneDetailPath(row.id));
                      }
                    }}
                  >
                    <Typography.Title level={5} style={{ marginTop: 0, marginBottom: 8 }}>
                      {row.name}
                    </Typography.Title>
                    <Space wrap>
                      <Typography.Text type="secondary">
                        {t('support.sim.scenes.assetsCount').replace('{n}', String(row.assetCount))}
                      </Typography.Text>
                      <Tag color={originColor(row.origin)}>{originLabel(row.origin)}</Tag>
                    </Space>
                    <Typography.Paragraph type="secondary" style={{ marginBottom: 0, marginTop: 8, fontSize: 12 }}>
                      {t('support.sim.scenes.updated')}: {row.updatedAt}
                    </Typography.Paragraph>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <SimulationScenePreviewModal
        open={!!previewScene}
        draft={previewDraft}
        hideRegenerate
        onClose={() => setPreviewScene(null)}
        onEditScene={() => {
          if (previewScene) navigate(supportSimulationSceneEditorPath(previewScene.id));
          setPreviewScene(null);
        }}
        onSaveAsAsset={() => {
          message.success(`${t('support.sim.scenes.hoverDemo')}: ${t('support.sim.scenes.hover.saveAsset')}`);
        }}
        onRegenerate={() => {}}
      />
    </div>
  );
}
