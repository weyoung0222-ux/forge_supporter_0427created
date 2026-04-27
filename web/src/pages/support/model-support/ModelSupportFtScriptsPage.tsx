import { DeleteOutlined, EditOutlined, EyeOutlined, MoreOutlined } from '@ant-design/icons';
import { App, Button, Descriptions, Drawer, Dropdown, Empty, Form, Input, Modal, Select, Space, Typography, theme } from 'antd';
import type { MenuProps } from 'antd';
import { useMemo, useState } from 'react';
import {
  deleteMsFtScript,
  getMsFtScripts,
  upsertMsFtScript,
  type MsFtScriptDto,
  type MsFramework,
} from '../../../mocks/modelSupportMocks';
import { useLocale } from '../../../shared/i18n/LocaleProvider';
import { matchesSearchQuery } from '../../../shared/lib/listQuery';
import '../../dev/dev-data-foundry-page.css';
import '../support-definition-cards-page.css';
import { ModelSupportPageHeader } from './ModelSupportPageHeader';
import './model-support-pages.css';

function scriptThumb(id: string) {
  return `https://picsum.photos/seed/${encodeURIComponent(`ms-fts-${id}`)}/480/480`;
}

export function ModelSupportFtScriptsPage() {
  const { token } = theme.useToken();
  const { t } = useLocale();
  const { message } = App.useApp();
  const [tick, setTick] = useState(0);
  const items = useMemo(() => getMsFtScripts(), [tick]);
  const [search, setSearch] = useState('');
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRow, setEditRow] = useState<MsFtScriptDto | null>(null);
  const [form] = Form.useForm();
  const refresh = () => setTick((n) => n + 1);

  const filtered = useMemo(() => items.filter((r) => matchesSearchQuery(`${r.name} ${r.framework} ${r.description}`, search)), [items, search]);
  const drawerRow = drawerId ? items.find((x) => x.id === drawerId) ?? null : null;

  const menuFor = (row: MsFtScriptDto): MenuProps => ({
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
              deleteMsFtScript(row.id);
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
      const id = editRow?.id ?? `ms-fts-${Date.now()}`;
      upsertMsFtScript({
        id,
        name: v.name,
        framework: v.framework as MsFramework,
        version: v.version || '1.0.0',
        description: v.description ?? '',
        content: v.content,
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
          titleT={t('support.ms.ftScripts.title')}
          leadT={t('support.ms.ftScripts.lead')}
          count={filtered.length}
          countLabelT={t('support.ms.common.count')}
          createLabel={t('support.ms.common.create')}
          onCreate={() => {
            setEditRow(null);
            form.resetFields();
            form.setFieldsValue({ framework: 'GROOT', version: '1.0.0' });
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
                  <img src={scriptThumb(row.id)} alt="" loading="lazy" decoding="async" />
                </div>
                <div className="support-definition-list-row__main" style={{ minWidth: 0 }}>
                  <Typography.Title level={5} style={{ margin: '0 0 8px' }}>
                    {row.name}
                  </Typography.Title>
                  <Typography.Paragraph type="secondary" style={{ marginBottom: 8 }} ellipsis={{ rows: 2 }}>
                    {row.description || '—'}
                  </Typography.Paragraph>
                  <Space wrap size={[4, 4]} align="center">
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {t('support.ms.ftScripts.col.framework')}: {row.framework}
                    </Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {t('support.ms.ftScripts.col.version')}: {row.version}
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

        <Drawer title={drawerRow?.name ?? t('support.ms.ftScripts.title')} open={!!drawerRow} onClose={() => setDrawerId(null)} width={640} destroyOnClose>
          {drawerRow ? (
            <>
              <Descriptions column={1} size="small" bordered style={{ marginBottom: 12 }}>
                <Descriptions.Item label={t('support.ms.ftScripts.col.framework')}>{drawerRow.framework}</Descriptions.Item>
                <Descriptions.Item label={t('support.ms.ftScripts.col.version')}>{drawerRow.version}</Descriptions.Item>
                <Descriptions.Item label={t('support.ms.ftScripts.field.description')}>{drawerRow.description}</Descriptions.Item>
              </Descriptions>
              <Typography.Text strong>{t('support.ms.ftScripts.field.content')}</Typography.Text>
              <pre className="model-support-log-pre">{drawerRow.content}</pre>
            </>
          ) : null}
        </Drawer>

        <Modal
          title={editRow ? t('support.ms.common.edit') : t('support.ms.ftScripts.modal.create')}
          open={modalOpen}
          onCancel={() => {
            setEditRow(null);
            setModalOpen(false);
          }}
          onOk={() => void onSave()}
          okText={t('support.ms.common.save')}
          width={640}
          destroyOnClose
        >
          <Form form={form} layout="vertical">
            <Form.Item name="name" label={t('support.ms.ftScripts.field.name')} rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="framework" label={t('support.ms.ftScripts.field.framework')} rules={[{ required: true }]}>
              <Select options={[{ value: 'GROOT', label: 'GROOT' }, { value: 'ACT', label: 'ACT' }, { value: 'PIO', label: 'PIO' }]} />
            </Form.Item>
            <Form.Item name="version" label={t('support.ms.ftScripts.col.version')}>
              <Input />
            </Form.Item>
            <Form.Item name="description" label={t('support.ms.ftScripts.field.description')}>
              <Input.TextArea rows={2} />
            </Form.Item>
            <Form.Item name="content" label={t('support.ms.ftScripts.field.content')} rules={[{ required: true }]}>
              <Input.TextArea rows={10} style={{ fontFamily: 'monospace' }} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
