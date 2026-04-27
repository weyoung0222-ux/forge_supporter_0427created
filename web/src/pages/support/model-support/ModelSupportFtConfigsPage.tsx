import { AppstoreOutlined, BarsOutlined, DeleteOutlined, EditOutlined, EyeOutlined, MoreOutlined } from '@ant-design/icons';
import { App, Button, Card, Col, Descriptions, Drawer, Dropdown, Empty, Form, Input, InputNumber, Modal, Row, Segmented, Select, Space, Tag, Typography, theme } from 'antd';
import type { MenuProps } from 'antd';
import { useMemo, useState } from 'react';
import {
  deleteMsFtConfig,
  getMsFtConfigs,
  upsertMsFtConfig,
  type MsFtConfigDto,
  type MsTrainingMethod,
} from '../../../mocks/modelSupportMocks';
import { useLocale } from '../../../shared/i18n/LocaleProvider';
import { matchesSearchQuery } from '../../../shared/lib/listQuery';
import '../../dev/dev-data-foundry-page.css';
import '../support-definition-cards-page.css';
import { ModelSupportPageHeader } from './ModelSupportPageHeader';
import './model-support-pages.css';

type ViewMode = 'grid' | 'list';
type SortKey = 'recent' | 'name';

function ftConfigThumb(id: string) {
  return `https://picsum.photos/seed/${encodeURIComponent(`ms-ftc-${id}`)}/480/480`;
}

function statusTag(t: (k: string) => string, s: MsFtConfigDto['status']) {
  if (s === 'ready') return <Tag color="success">{t('support.ms.status.done')}</Tag>;
  if (s === 'draft') return <Tag>{t('support.ms.status.draft')}</Tag>;
  return <Tag color="default">archived</Tag>;
}

export function ModelSupportFtConfigsPage() {
  const { token } = theme.useToken();
  const { t } = useLocale();
  const { message } = App.useApp();
  const [tick, setTick] = useState(0);
  const items = useMemo(() => getMsFtConfigs(), [tick]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | MsFtConfigDto['status']>('all');
  const [sortKey, setSortKey] = useState<SortKey>('recent');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRow, setEditRow] = useState<MsFtConfigDto | null>(null);
  const [form] = Form.useForm();
  const refresh = () => setTick((n) => n + 1);

  const filtered = useMemo(() => {
    let list = items.filter((row) => matchesSearchQuery(`${row.name} ${row.modelName} ${row.dataset}`, search));
    if (statusFilter !== 'all') list = list.filter((r) => r.status === statusFilter);
    const next = [...list];
    if (sortKey === 'name') next.sort((a, b) => a.name.localeCompare(b.name));
    else next.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return next;
  }, [items, search, statusFilter, sortKey]);

  const drawerRow = drawerId ? items.find((x) => x.id === drawerId) ?? null : null;

  const menuFor = (row: MsFtConfigDto): MenuProps => ({
    items: [
      { key: 'v', icon: <EyeOutlined />, label: t('support.ms.common.view'), onClick: () => setDrawerId(row.id) },
      {
        key: 'e',
        icon: <EditOutlined />,
        label: t('support.ms.common.edit'),
        onClick: () => {
          setEditRow(row);
          form.setFieldsValue(row);
          setModalOpen(true);
        },
      },
      { type: 'divider' },
      {
        key: 'd',
        danger: true,
        icon: <DeleteOutlined />,
        label: t('support.ms.common.delete'),
        onClick: () =>
          Modal.confirm({
            title: t('support.ms.common.confirmDeleteTitle'),
            content: row.name,
            okType: 'danger',
            onOk: () => {
              deleteMsFtConfig(row.id);
              message.success(t('support.ms.registry.toast.deleted'));
              setDrawerId((id) => (id === row.id ? null : id));
              refresh();
            },
          }),
      },
    ],
  });

  const onSave = async () => {
    try {
      const v = await form.validateFields();
      const id = editRow?.id ?? `ms-ftc-${Date.now()}`;
      upsertMsFtConfig({
        id,
        name: v.name,
        modelName: v.modelName,
        dataset: v.dataset,
        trainingType: v.trainingType as MsTrainingMethod,
        status: (editRow?.status ?? 'draft') as MsFtConfigDto['status'],
        learningRate: v.learningRate,
        batchSize: v.batchSize,
        epochs: v.epochs,
        updatedAt: new Date().toISOString().slice(0, 10),
      });
      message.success(t('support.ms.registry.toast.saved'));
      setModalOpen(false);
      refresh();
    } catch {
      /* */
    }
  };

  return (
    <div className="support-definition-page support-workspace-page dev-data-foundry model-support-page">
      <div className="support-definition-page__stack">
      <ModelSupportPageHeader
        titleT={t('support.ms.ftConfigs.title')}
        leadT={t('support.ms.ftConfigs.lead')}
        count={filtered.length}
        countLabelT={t('support.ms.common.count')}
        createLabel={t('support.ms.common.create')}
        onCreate={() => {
          setEditRow(null);
          form.resetFields();
          form.setFieldsValue({ trainingType: 'LoRA', learningRate: 0.0002, batchSize: 32, epochs: 10 });
          setModalOpen(true);
        }}
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
            <Select value={statusFilter} onChange={setStatusFilter} style={{ minWidth: 160 }} popupMatchSelectWidth={false} options={[
              { value: 'all', label: t('support.ms.ftConfigs.filter.all') },
              { value: 'draft', label: t('support.ms.status.draft') },
              { value: 'ready', label: t('support.ms.status.done') },
              { value: 'archived', label: 'archived' },
            ]}
            />
            <div className="dev-data-foundry-toolbar-spacer">
              <Segmented value={viewMode} onChange={setViewMode} options={[
                { value: 'list', icon: <BarsOutlined aria-hidden />, label: t('dataFoundry.viewList') },
                { value: 'grid', icon: <AppstoreOutlined aria-hidden />, label: t('dataFoundry.viewGrid') },
              ]}
              />
              <Select value={sortKey} onChange={setSortKey} style={{ minWidth: 160 }} popupMatchSelectWidth={false} options={[
                { value: 'recent', label: t('support.ms.ftConfigs.sort.recent') },
                { value: 'name', label: t('support.ms.ftConfigs.sort.name') },
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
                    <img src={ftConfigThumb(row.id)} alt="" loading="lazy" decoding="async" />
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
                    <Typography.Paragraph type="secondary" style={{ marginBottom: 8 }} ellipsis={{ rows: 2 }}>
                      {row.modelName} · {row.dataset}
                    </Typography.Paragraph>
                    <Space size={4} wrap>
                      <Tag>{row.trainingType}</Tag>
                      {statusTag(t, row.status)}
                    </Space>
                    <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
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
                <img src={ftConfigThumb(row.id)} alt="" loading="lazy" decoding="async" />
              </div>
              <div className="support-definition-list-row__main" style={{ minWidth: 0 }}>
                <Typography.Title level={5} style={{ margin: '0 0 8px' }}>
                  {row.name}
                </Typography.Title>
                <Typography.Paragraph type="secondary" style={{ marginBottom: 8 }} ellipsis={{ rows: 2 }}>
                  {row.modelName} · {row.dataset}
                </Typography.Paragraph>
                <Space wrap>
                  <Tag>{row.trainingType}</Tag>
                  {statusTag(t, row.status)}
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

      <Drawer title={t('support.ms.ftConfigs.drawer.title')} open={!!drawerRow} onClose={() => setDrawerId(null)} width={520} destroyOnClose>
        {drawerRow ? (
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label={t('support.ms.ftConfigs.field.name')}>{drawerRow.name}</Descriptions.Item>
            <Descriptions.Item label={t('support.ms.ftConfigs.field.model')}>{drawerRow.modelName}</Descriptions.Item>
            <Descriptions.Item label={t('support.ms.ftConfigs.field.dataset')}>{drawerRow.dataset}</Descriptions.Item>
            <Descriptions.Item label={t('support.ms.ftConfigs.field.method')}>{drawerRow.trainingType}</Descriptions.Item>
            <Descriptions.Item label={t('support.ms.ftConfigs.field.lr')}>{drawerRow.learningRate}</Descriptions.Item>
            <Descriptions.Item label={t('support.ms.ftConfigs.field.batch')}>{drawerRow.batchSize}</Descriptions.Item>
            <Descriptions.Item label={t('support.ms.ftConfigs.field.epochs')}>{drawerRow.epochs}</Descriptions.Item>
            <Descriptions.Item label="status">{statusTag(t, drawerRow.status)}</Descriptions.Item>
          </Descriptions>
        ) : null}
      </Drawer>

      <Modal title={editRow ? t('support.ms.common.edit') : t('support.ms.ftConfigs.modal.create')} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => void onSave()} okText={t('support.ms.common.save')} width={560} destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label={t('support.ms.ftConfigs.field.name')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="modelName" label={t('support.ms.ftConfigs.field.model')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="dataset" label={t('support.ms.ftConfigs.field.dataset')} rules={[{ required: true }]}>
            <Input placeholder="CitySim v2" />
          </Form.Item>
          <Form.Item name="trainingType" label={t('support.ms.ftConfigs.field.method')} rules={[{ required: true }]}>
            <Select options={[
              { value: 'LoRA', label: t('support.ms.method.lora') },
              { value: 'full', label: t('support.ms.method.full') },
              { value: 'freeze', label: t('support.ms.method.freeze') },
            ]}
            />
          </Form.Item>
          <Form.Item name="learningRate" label={t('support.ms.ftConfigs.field.lr')} rules={[{ required: true }]}>
            <InputNumber step={0.0001} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="batchSize" label={t('support.ms.ftConfigs.field.batch')} rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="epochs" label={t('support.ms.ftConfigs.field.epochs')} rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
      </div>
    </div>
  );
}
