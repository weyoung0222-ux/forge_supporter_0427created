import { AppstoreOutlined, BarsOutlined, DeleteOutlined, EditOutlined, EyeOutlined, MoreOutlined } from '@ant-design/icons';
import { App, Button, Card, Col, Descriptions, Drawer, Dropdown, Empty, Form, Input, Modal, Row, Segmented, Select, Space, Tag, Typography, theme } from 'antd';
import type { MenuProps } from 'antd';
import { useMemo, useState } from 'react';
import {
  deleteMsRegistryModel,
  getMsRegistryModels,
  upsertMsRegistryModel,
  type MsRegistryModelDto,
  type WfmIdm,
} from '../../../mocks/modelSupportMocks';
import { useLocale } from '../../../shared/i18n/LocaleProvider';
import { matchesSearchQuery } from '../../../shared/lib/listQuery';
import '../../dev/dev-data-foundry-page.css';
import '../support-definition-cards-page.css';
import { ModelSupportPageHeader } from './ModelSupportPageHeader';
import './model-support-pages.css';

type ViewMode = 'grid' | 'list';
type SortKey = 'recent' | 'name';

function thumbUrl(id: string) {
  return `https://picsum.photos/seed/${encodeURIComponent(`ms-reg-${id}`)}/480/480`;
}

export function ModelRegistryPage() {
  const { token } = theme.useToken();
  const { t } = useLocale();
  const { message } = App.useApp();
  const [tick, setTick] = useState(0);
  const items = useMemo(() => getMsRegistryModels(), [tick]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | WfmIdm>('all');
  const [sortKey, setSortKey] = useState<SortKey>('recent');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRow, setEditRow] = useState<MsRegistryModelDto | null>(null);
  const [form] = Form.useForm();

  const refresh = () => setTick((n) => n + 1);

  const filtered = useMemo(() => {
    let list = items.filter((row) => matchesSearchQuery(`${row.name} ${row.task} ${row.description}`, search));
    if (typeFilter !== 'all') list = list.filter((r) => r.modelType === typeFilter);
    const next = [...list];
    if (sortKey === 'name') next.sort((a, b) => a.name.localeCompare(b.name));
    else next.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return next;
  }, [items, search, typeFilter, sortKey]);

  const drawerModel = drawerId ? items.find((x) => x.id === drawerId) ?? null : null;

  const openCreate = () => {
    setEditRow(null);
    form.resetFields();
    form.setFieldsValue({ modelType: 'WFM' as WfmIdm, version: '1.0.0' });
    setModalOpen(true);
  };

  const openEdit = (row: MsRegistryModelDto) => {
    setEditRow(row);
    form.setFieldsValue({
      name: row.name,
      modelType: row.modelType,
      task: row.task,
      baseModel: row.baseModel,
      version: row.version,
      description: row.description,
      artifactUrl: row.artifactUrl,
    });
    setModalOpen(true);
  };

  const onSave = async () => {
    try {
      const v = await form.validateFields();
      const today = new Date().toISOString().slice(0, 10);
      const id = editRow?.id ?? `ms-m-${Date.now()}`;
      upsertMsRegistryModel({
        id,
        name: v.name,
        modelType: v.modelType,
        task: v.task,
        version: v.version,
        description: v.description ?? '',
        baseModel: v.baseModel,
        artifactUrl: v.artifactUrl,
        updatedAt: today,
      });
      message.success(t('support.ms.registry.toast.saved'));
      setModalOpen(false);
      refresh();
    } catch {
      /* validation */
    }
  };

  const onDelete = (row: MsRegistryModelDto) => {
    Modal.confirm({
      title: t('support.ms.common.confirmDeleteTitle'),
      content: row.name,
      okText: t('support.ms.common.yes'),
      okType: 'danger',
      onOk: () => {
        deleteMsRegistryModel(row.id);
        message.success(t('support.ms.registry.toast.deleted'));
        setDrawerId((id) => (id === row.id ? null : id));
        refresh();
      },
    });
  };

  const menuFor = (row: MsRegistryModelDto): MenuProps => ({
    items: [
      { key: 'view', icon: <EyeOutlined />, label: t('support.ms.common.view'), onClick: () => setDrawerId(row.id) },
      { key: 'edit', icon: <EditOutlined />, label: t('support.ms.common.edit'), onClick: () => openEdit(row) },
      { type: 'divider' },
      { key: 'del', danger: true, icon: <DeleteOutlined />, label: t('support.ms.common.delete'), onClick: () => onDelete(row) },
    ],
  });

  const typeColor = (ty: WfmIdm) => (ty === 'WFM' ? 'geekblue' : 'purple');

  return (
    <div className="support-definition-page support-workspace-page dev-data-foundry model-support-page">
      <div className="support-definition-page__stack">
        <ModelSupportPageHeader
          titleT={t('support.ms.registry.title')}
          leadT={t('support.ms.registry.lead')}
          count={filtered.length}
          countLabelT={t('support.ms.common.count')}
          createLabel={t('support.ms.common.create')}
          onCreate={openCreate}
          toolbar={
            <>
              <Input
                allowClear
                className="dev-data-foundry-search forge-search-input"
                placeholder={t('support.ms.common.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ minWidth: 0, maxWidth: 360 }}
                aria-label={t('support.ms.common.search')}
              />
              <Select<'all' | WfmIdm>
                value={typeFilter}
                onChange={setTypeFilter}
                style={{ minWidth: 140 }}
                options={[
                  { value: 'all', label: t('support.ms.registry.filter.all') },
                  { value: 'WFM', label: 'WFM' },
                  { value: 'IDM', label: 'IDM' },
                ]}
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
                  style={{ minWidth: 160 }}
                  options={[
                    { value: 'recent', label: t('support.ms.registry.sort.recent') },
                    { value: 'name', label: t('support.ms.registry.sort.name') },
                  ]}
                />
              </div>
            </>
          }
        />

        <div className="support-definition-body">
          {filtered.length === 0 ? (
            <Empty description={t('support.ms.common.empty')} />
          ) : viewMode === 'grid' ? (
            <Row gutter={[12, 12]} className="support-definition-card-grid">
              {filtered.map((row) => (
                <Col xs={24} sm={12} md={8} key={row.id}>
                  <div className="support-definition-card-wrap">
                    <Card
                      size="small"
                      bordered
                      className="support-definition-card"
                      styles={{ body: { padding: 0 } }}
                      style={{ borderColor: token.colorBorderSecondary }}
                      tabIndex={0}
                      role="button"
                      aria-label={row.name}
                      onClick={() => setDrawerId(row.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setDrawerId(row.id);
                        }
                      }}
                    >
                      <div className="support-definition-card__media">
                        <img src={thumbUrl(row.id)} alt="" loading="lazy" decoding="async" />
                        <div className="support-definition-card__actions">
                          <Dropdown menu={menuFor(row)} trigger={['click']} placement="bottomRight">
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
                        <Typography.Title level={5} style={{ marginTop: 0, marginBottom: 8 }}>
                          {row.name}
                        </Typography.Title>
                        <Space size={4} wrap style={{ marginBottom: 8 }}>
                          <Tag color={typeColor(row.modelType)}>{row.modelType}</Tag>
                          <Tag>{row.task}</Tag>
                        </Space>
                        <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                          {t('support.ms.registry.col.version')}: {row.version}
                        </Typography.Text>
                        <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                          {t('support.ms.common.updated')}: {row.updatedAt}
                        </Typography.Text>
                      </div>
                    </Card>
                  </div>
                </Col>
              ))}
            </Row>
          ) : (
            <div className="support-definition-list">
              {filtered.map((row) => (
                <div
                  key={row.id}
                  className="support-definition-list-row"
                  role="button"
                  tabIndex={0}
                  onClick={() => setDrawerId(row.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setDrawerId(row.id);
                    }
                  }}
                  style={{ borderColor: token.colorBorderSecondary }}
                >
                  <div className="support-definition-list-row__thumb">
                    <img src={thumbUrl(row.id)} alt="" loading="lazy" decoding="async" />
                  </div>
                  <div className="support-definition-list-row__main" style={{ minWidth: 0 }}>
                    <Typography.Title level={5} style={{ margin: '0 0 8px' }}>
                      {row.name}
                    </Typography.Title>
                    <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }} ellipsis={{ rows: 2 }}>
                      {row.task} · {row.modelType}
                    </Typography.Paragraph>
                    <Space size={8} wrap align="center">
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        {t('support.ms.registry.col.version')}: {row.version}
                      </Typography.Text>
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        {t('support.ms.common.updated')}: {row.updatedAt}
                      </Typography.Text>
                    </Space>
                  </div>
                  <div className="support-definition-list-row__actions" onClick={(e) => e.stopPropagation()}>
                    <Dropdown menu={menuFor(row)} trigger={['click']} placement="bottomRight">
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

      <Drawer
        title={t('support.ms.registry.drawer.title')}
        open={!!drawerModel}
        onClose={() => setDrawerId(null)}
        width={520}
        destroyOnClose
        extra={
          drawerModel ? (
            <Space>
              <Button size="small" onClick={() => openEdit(drawerModel)}>
                {t('support.ms.common.edit')}
              </Button>
              <Button size="small" danger onClick={() => onDelete(drawerModel)}>
                {t('support.ms.common.delete')}
              </Button>
            </Space>
          ) : null
        }
      >
        {drawerModel ? (
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label={t('support.ms.registry.field.name')}>{drawerModel.name}</Descriptions.Item>
            <Descriptions.Item label={t('support.ms.registry.field.type')}>
              <Tag color={typeColor(drawerModel.modelType)}>{drawerModel.modelType}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t('support.ms.registry.field.task')}>{drawerModel.task}</Descriptions.Item>
            <Descriptions.Item label={t('support.ms.registry.field.version')}>{drawerModel.version}</Descriptions.Item>
            <Descriptions.Item label={t('support.ms.registry.field.base')}>{drawerModel.baseModel || '—'}</Descriptions.Item>
            <Descriptions.Item label={t('support.ms.registry.field.description')}>{drawerModel.description}</Descriptions.Item>
            <Descriptions.Item label={t('support.ms.registry.field.artifact')}>
              <Typography.Text code>{drawerModel.artifactUrl || '—'}</Typography.Text>
            </Descriptions.Item>
            <Descriptions.Item label={t('support.ms.common.updated')}>{drawerModel.updatedAt}</Descriptions.Item>
          </Descriptions>
        ) : null}
      </Drawer>

      <Modal
        title={editRow ? t('support.ms.registry.modal.edit') : t('support.ms.registry.modal.create')}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => void onSave()}
        okText={t('support.ms.common.save')}
        cancelText={t('support.ms.common.cancel')}
        width={560}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label={t('support.ms.registry.field.name')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="modelType" label={t('support.ms.registry.field.type')} rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'WFM', label: 'WFM' },
                { value: 'IDM', label: 'IDM' },
              ]}
            />
          </Form.Item>
          <Form.Item name="task" label={t('support.ms.registry.field.task')} rules={[{ required: true }]}>
            <Input placeholder="navigation, manipulation, …" />
          </Form.Item>
          <Form.Item name="baseModel" label={t('support.ms.registry.field.base')}>
            <Input />
          </Form.Item>
          <Form.Item name="version" label={t('support.ms.registry.field.version')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label={t('support.ms.registry.field.description')}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="artifactUrl" label={t('support.ms.registry.field.artifact')}>
            <Input placeholder="https://… or s3://…" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
