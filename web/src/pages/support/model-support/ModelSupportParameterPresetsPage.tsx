import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { App, Button, Card, Drawer, Form, Input, Modal, Space, Switch, Table, Tag, Typography, theme } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
import {
  deleteMsParameterPreset,
  getMsParameterPresets,
  getMsRegistryModels,
  upsertMsParameterPreset,
  type MsParameterPresetRow,
} from '../../../mocks/modelSupportMocks';
import { useLocale } from '../../../shared/i18n/LocaleProvider';
import { matchesSearchQuery } from '../../../shared/lib/listQuery';
import '../../dev/dev-data-foundry-page.css';
import '../support-definition-cards-page.css';
import { ModelSupportPageHeader } from './ModelSupportPageHeader';
import './model-support-pages.css';

export function ModelSupportParameterPresetsPage() {
  const { token } = theme.useToken();
  const { t } = useLocale();
  const { message } = App.useApp();
  const [tick, setTick] = useState(0);
  const rows = useMemo(() => getMsParameterPresets(), [tick]);
  const models = useMemo(() => getMsRegistryModels().map((m) => ({ value: m.name, label: m.name })), [tick]);
  const [search, setSearch] = useState('');
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRow, setEditRow] = useState<MsParameterPresetRow | null>(null);
  const [form] = Form.useForm();

  const refresh = () => setTick((n) => n + 1);

  const filtered = useMemo(
    () => rows.filter((r) => matchesSearchQuery(`${r.name} ${r.modelName}`, search)),
    [rows, search],
  );

  const drawerRow = drawerId ? rows.find((r) => r.id === drawerId) ?? null : null;

  const openCreate = () => {
    setEditRow(null);
    form.resetFields();
    form.setFieldsValue({ isDefault: false, params: [{ key: 'lr', value: '2e-4' }] });
    setModalOpen(true);
  };

  const openEdit = (row: MsParameterPresetRow) => {
    setEditRow(row);
    const pairs = Object.entries(row.params).map(([key, value]) => ({ key, value }));
    form.setFieldsValue({ name: row.name, modelName: row.modelName, isDefault: row.isDefault, params: pairs });
    setModalOpen(true);
  };

  const onSave = async () => {
    try {
      const v = await form.validateFields();
      const params: Record<string, string> = {};
      (v.params as { key: string; value: string }[]).forEach((p) => {
        if (p.key) params[p.key] = p.value ?? '';
      });
      const id = editRow?.id ?? `ms-pp-${Date.now()}`;
      upsertMsParameterPreset({
        id,
        name: v.name,
        modelName: v.modelName,
        paramCount: Object.keys(params).length,
        isDefault: !!v.isDefault,
        updatedAt: new Date().toISOString().slice(0, 10),
        params,
      });
      message.success(t('support.ms.registry.toast.saved'));
      setModalOpen(false);
      refresh();
    } catch {
      /* */
    }
  };

  const columns: ColumnsType<MsParameterPresetRow> = [
    { title: t('support.ms.paramPresets.field.name'), dataIndex: 'name', key: 'name' },
    { title: t('support.ms.paramPresets.col.model'), dataIndex: 'modelName', key: 'model' },
    { title: t('support.ms.paramPresets.col.count'), dataIndex: 'paramCount', width: 120 },
    {
      title: t('support.ms.paramPresets.col.default'),
      dataIndex: 'isDefault',
      width: 100,
      render: (d: boolean) => (d ? <Tag color="blue">{t('support.ms.paramPresets.col.default')}</Tag> : <Tag>—</Tag>),
    },
    { title: t('support.ms.paramPresets.col.updated'), dataIndex: 'updatedAt', width: 120 },
    {
      title: t('support.ms.common.actions'),
      key: 'actions',
      width: 200,
      render: (_, row) => (
        <Space>
          <Button type="link" size="small" onClick={() => setDrawerId(row.id)}>
            {t('support.ms.common.view')}
          </Button>
          <Button type="link" size="small" onClick={() => openEdit(row)}>
            {t('support.ms.common.edit')}
          </Button>
          <Button type="link" size="small" danger onClick={() => Modal.confirm({
            title: t('support.ms.common.confirmDeleteTitle'),
            onOk: () => { deleteMsParameterPreset(row.id); refresh(); },
          })}
          >
            {t('support.ms.common.delete')}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="support-definition-page support-workspace-page dev-data-foundry model-support-page">
      <div className="support-definition-page__stack">
        <ModelSupportPageHeader
          titleT={t('support.ms.paramPresets.title')}
          leadT={t('support.ms.paramPresets.lead')}
          count={filtered.length}
          countLabelT={t('support.ms.common.count')}
          createLabel={t('support.ms.common.create')}
          onCreate={openCreate}
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
          <Card
            size="small"
            bordered
            className="model-support-table-card"
            style={{ borderColor: token.colorBorderSecondary }}
            styles={{ body: { padding: 0 } }}
          >
            <Table rowKey="id" dataSource={filtered} columns={columns} pagination={false} size="small" />
          </Card>
        </div>

      <Drawer title={t('support.ms.paramPresets.title')} open={!!drawerRow} onClose={() => setDrawerId(null)} width={480} destroyOnClose>
        {drawerRow ? (
          <>
            <Typography.Title level={5}>{drawerRow.name}</Typography.Title>
            <Typography.Paragraph type="secondary">{drawerRow.modelName}</Typography.Paragraph>
            <pre style={{ fontSize: 12 }}>{JSON.stringify(drawerRow.params, null, 2)}</pre>
          </>
        ) : null}
      </Drawer>

      <Modal title={editRow ? t('support.ms.common.edit') : t('support.ms.paramPresets.modal.create')} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => void onSave()} okText={t('support.ms.common.save')} width={560} destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label={t('support.ms.paramPresets.field.name')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="modelName" label={t('support.ms.paramPresets.field.targetModel')} rules={[{ required: true }]}>
            <Input placeholder={models[0]?.value} />
          </Form.Item>
          <Form.Item name="isDefault" label={t('support.ms.paramPresets.field.default')} valuePropName="checked">
            <Switch />
          </Form.Item>
          <Typography.Text type="secondary">{t('support.ms.paramPresets.field.params')}</Typography.Text>
          <Form.List name="params">
            {(fields, { add, remove }) => (
              <div style={{ marginTop: 8 }}>
                {fields.map((f) => (
                  <Space key={f.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item name={[f.name, 'key']} rules={[{ required: true }]}>
                      <Input placeholder="key" />
                    </Form.Item>
                    <Form.Item name={[f.name, 'value']}>
                      <Input placeholder="value" />
                    </Form.Item>
                    <DeleteOutlined onClick={() => remove(f.name)} />
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                  {t('support.ms.paramPresets.addParam')}
                </Button>
              </div>
            )}
          </Form.List>
        </Form>
      </Modal>
      </div>
    </div>
  );
}
