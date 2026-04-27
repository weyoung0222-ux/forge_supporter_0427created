import { App, Button, Card, Drawer, Form, Input, Modal, Select, Space, Switch, Table, Tag, Typography, theme } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
import {
  deleteMsFtPreset,
  getMsFtPresets,
  getMsFtScripts,
  getMsParameterPresets,
  upsertMsFtPreset,
  type MsFtPresetRow,
} from '../../../mocks/modelSupportMocks';
import { useLocale } from '../../../shared/i18n/LocaleProvider';
import { matchesSearchQuery } from '../../../shared/lib/listQuery';
import '../../dev/dev-data-foundry-page.css';
import '../support-definition-cards-page.css';
import { ModelSupportPageHeader } from './ModelSupportPageHeader';
import './model-support-pages.css';

export function ModelSupportFtPresetsPage() {
  const { token } = theme.useToken();
  const { t } = useLocale();
  const { message } = App.useApp();
  const [tick, setTick] = useState(0);
  const rows = useMemo(() => getMsFtPresets(), [tick]);
  const scripts = useMemo(() => getMsFtScripts(), [tick]);
  const paramPresets = useMemo(() => getMsParameterPresets(), [tick]);
  const [search, setSearch] = useState('');
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRow, setEditRow] = useState<MsFtPresetRow | null>(null);
  const [form] = Form.useForm();
  const refresh = () => setTick((n) => n + 1);

  const filtered = useMemo(() => rows.filter((r) => matchesSearchQuery(`${r.name} ${r.scriptName}`, search)), [rows, search]);
  const drawerRow = drawerId ? rows.find((r) => r.id === drawerId) ?? null : null;

  const onSave = async () => {
    try {
      const v = await form.validateFields();
      upsertMsFtPreset({
        id: editRow?.id ?? `ms-ftp-${Date.now()}`,
        name: v.name,
        scriptName: v.scriptName,
        paramPresetName: v.paramPresetName,
        isDefault: !!v.isDefault,
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

  const columns: ColumnsType<MsFtPresetRow> = [
    { title: t('support.ms.ftPresets.field.name'), dataIndex: 'name', key: 'name' },
    { title: t('support.ms.ftPresets.col.script'), dataIndex: 'scriptName', key: 's' },
    { title: t('support.ms.ftPresets.col.params'), dataIndex: 'paramPresetName', key: 'p' },
    { title: t('support.ms.ftPresets.col.default'), dataIndex: 'isDefault', width: 100, render: (d: boolean) => (d ? <Tag color="blue">{t('support.ms.ftPresets.col.default')}</Tag> : '—') },
    { title: t('support.ms.common.updated'), dataIndex: 'updatedAt', width: 110 },
    {
      title: t('support.ms.common.actions'),
      key: 'a',
      width: 120,
      render: (_, row) => (
        <Space>
          <Button type="link" size="small" onClick={() => setDrawerId(row.id)}>{t('support.ms.common.view')}</Button>
          <Button type="link" size="small" onClick={() => { setEditRow(row); form.setFieldsValue(row); setModalOpen(true); }}>{t('support.ms.common.edit')}</Button>
          <Button type="link" size="small" danger onClick={() => Modal.confirm({ title: t('support.ms.common.confirmDeleteTitle'), onOk: () => { deleteMsFtPreset(row.id); refresh(); } })}>{t('support.ms.common.delete')}</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="support-definition-page support-workspace-page dev-data-foundry model-support-page">
      <div className="support-definition-page__stack">
        <ModelSupportPageHeader
          titleT={t('support.ms.ftPresets.title')}
          leadT={t('support.ms.ftPresets.lead')}
          count={filtered.length}
          countLabelT={t('support.ms.common.count')}
          createLabel={t('support.ms.common.create')}
          onCreate={() => {
            setEditRow(null);
            form.resetFields();
            form.setFieldsValue({ isDefault: false });
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

      <Drawer title={drawerRow?.name} open={!!drawerRow} onClose={() => setDrawerId(null)} width={480} destroyOnClose>
        {drawerRow ? (
          <Typography.Paragraph>
            <strong>{t('support.ms.ftPresets.col.script')}:</strong> {drawerRow.scriptName}
            <br />
            <strong>{t('support.ms.ftPresets.col.params')}:</strong> {drawerRow.paramPresetName}
          </Typography.Paragraph>
        ) : null}
      </Drawer>

      <Modal title={editRow ? t('support.ms.common.edit') : t('support.ms.ftPresets.modal.create')} open={modalOpen} onCancel={() => { setEditRow(null); setModalOpen(false); }} onOk={() => void onSave()} okText={t('support.ms.common.save')} width={520} destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label={t('support.ms.ftPresets.field.name')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="scriptName" label={t('support.ms.ftPresets.field.script')} rules={[{ required: true }]}>
            <Select options={scripts.map((s) => ({ value: s.name, label: s.name }))} />
          </Form.Item>
          <Form.Item name="paramPresetName" label={t('support.ms.ftPresets.field.paramPreset')} rules={[{ required: true }]}>
            <Select options={paramPresets.map((p) => ({ value: p.name, label: p.name }))} />
          </Form.Item>
          <Form.Item name="isDefault" label={t('support.ms.ftPresets.field.default')} valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
      </div>
    </div>
  );
}
