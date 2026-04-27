import { DeleteOutlined, EditOutlined, EyeOutlined, MoreOutlined } from '@ant-design/icons';
import { App, Button, Card, Col, Descriptions, Drawer, Dropdown, Empty, Form, Input, Modal, Row, Select, Space, Tag, Typography, theme } from 'antd';
import type { MenuProps } from 'antd';
import { useMemo, useState } from 'react';
import {
  deleteMsPretrained,
  getMsPretrained,
  upsertMsPretrained,
  type MsPretrainedModelDto,
  type MsPretrainedSource,
} from '../../../mocks/modelSupportMocks';
import { useLocale } from '../../../shared/i18n/LocaleProvider';
import { matchesSearchQuery } from '../../../shared/lib/listQuery';
import '../../dev/dev-data-foundry-page.css';
import '../support-definition-cards-page.css';
import { ModelSupportPageHeader } from './ModelSupportPageHeader';
import './model-support-pages.css';

function thumb(id: string) {
  return `https://picsum.photos/seed/${encodeURIComponent(`ms-pre-${id}`)}/480/480`;
}

export function ModelSupportPretrainedRegistryPage() {
  const { token } = theme.useToken();
  const { t } = useLocale();
  const { message } = App.useApp();
  const [tick, setTick] = useState(0);
  const items = useMemo(() => getMsPretrained(), [tick]);
  const [search, setSearch] = useState('');
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRow, setEditRow] = useState<MsPretrainedModelDto | null>(null);
  const [form] = Form.useForm();
  const refresh = () => setTick((n) => n + 1);

  const filtered = useMemo(() => items.filter((r) => matchesSearchQuery(`${r.name} ${r.task} ${r.metadata}`, search)), [items, search]);
  const drawerRow = drawerId ? items.find((x) => x.id === drawerId) ?? null : null;

  const menuFor = (row: MsPretrainedModelDto): MenuProps => ({
    items: [
      { key: 'v', icon: <EyeOutlined />, label: t('support.ms.common.view'), onClick: () => setDrawerId(row.id) },
      { key: 'e', icon: <EditOutlined />, label: t('support.ms.common.edit'), onClick: () => { setEditRow(row); form.setFieldsValue(row); setModalOpen(true); } },
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
              deleteMsPretrained(row.id);
              message.success(t('support.ms.registry.toast.deleted'));
              setDrawerId(null);
              refresh();
            },
          }),
      },
    ],
  });

  const onSave = async () => {
    try {
      const v = await form.validateFields();
      upsertMsPretrained({
        id: editRow?.id ?? `ms-pre-${Date.now()}`,
        name: v.name,
        source: v.source as MsPretrainedSource,
        task: v.task,
        version: v.version,
        metadata: v.metadata ?? '{}',
        artifactUrl: v.artifactUrl,
        updatedAt: new Date().toISOString().slice(0, 10),
      });
      message.success(t('support.ms.registry.toast.saved'));
      setEditRow(null);
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
          titleT={t('support.ms.pretrained.title')}
          leadT={t('support.ms.pretrained.lead')}
          count={filtered.length}
          countLabelT={t('support.ms.common.count')}
          createLabel={t('support.ms.common.create')}
          onCreate={() => {
            setEditRow(null);
            form.resetFields();
            form.setFieldsValue({ source: 'internal', version: '1.0.0' });
            setModalOpen(true);
          }}
          toolbar={
            <Input
              allowClear
              className="dev-data-foundry-search forge-search-input"
              placeholder={t('support.ms.common.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ minWidth: 0, maxWidth: 360 }}
              aria-label={t('support.ms.common.search')}
            />
          }
        />
        <div className="support-definition-body">
          {filtered.length === 0 ? (
            <Empty description={t('support.ms.common.empty')} />
          ) : (
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
                        <img src={thumb(row.id)} alt="" loading="lazy" decoding="async" />
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
                          {row.task}
                        </Typography.Paragraph>
                        <Space size={4} wrap>
                          <Tag color={row.source === 'internal' ? 'blue' : 'orange'}>{row.source}</Tag>
                          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                            {t('support.ms.registry.col.version')}: {row.version}
                          </Typography.Text>
                        </Space>
                      </div>
                    </Card>
                  </div>
                </Col>
              ))}
            </Row>
          )}
        </div>

      <Drawer title={t('support.ms.pretrained.drawer.title')} open={!!drawerRow} onClose={() => setDrawerId(null)} width={520} destroyOnClose>
        {drawerRow ? (
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label={t('support.ms.registry.field.name')}>{drawerRow.name}</Descriptions.Item>
            <Descriptions.Item label={t('support.ms.pretrained.col.source')}>{drawerRow.source}</Descriptions.Item>
            <Descriptions.Item label={t('support.ms.pretrained.col.task')}>{drawerRow.task}</Descriptions.Item>
            <Descriptions.Item label={t('support.ms.registry.field.version')}>{drawerRow.version}</Descriptions.Item>
            <Descriptions.Item label={t('support.ms.pretrained.field.metadata')}><pre style={{ margin: 0, fontSize: 12 }}>{drawerRow.metadata}</pre></Descriptions.Item>
            <Descriptions.Item label={t('support.ms.registry.field.artifact')}><Typography.Text code>{drawerRow.artifactUrl}</Typography.Text></Descriptions.Item>
          </Descriptions>
        ) : null}
      </Drawer>

      <Modal title={editRow ? t('support.ms.common.edit') : t('support.ms.pretrained.modal.create')} open={modalOpen} onCancel={() => { setEditRow(null); setModalOpen(false); }} onOk={() => void onSave()} okText={t('support.ms.common.save')} width={560} destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label={t('support.ms.registry.field.name')} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="source" label={t('support.ms.pretrained.field.source')} rules={[{ required: true }]}>
            <Select options={[{ value: 'internal', label: 'internal' }, { value: 'external', label: 'external' }]} />
          </Form.Item>
          <Form.Item name="task" label={t('support.ms.pretrained.col.task')} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="version" label={t('support.ms.registry.field.version')} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="artifactUrl" label={t('support.ms.registry.field.artifact')} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="metadata" label={t('support.ms.pretrained.field.metadata')}><Input.TextArea rows={4} /></Form.Item>
        </Form>
      </Modal>
      </div>
    </div>
  );
}
