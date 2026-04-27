import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { App, Button, Form, Input, Select, Space, Typography } from 'antd';
import { useEffect } from 'react';
import type { SimulationPresetDto } from '../../../../mocks/simulationSupportMocks';
import { getSimulationAssetsMock, getSimulationConfigurationsMock, prependSimulationPreset } from '../../../../mocks/simulationSupportMocks';
import { useLocale } from '../../../../shared/i18n/LocaleProvider';
import { SimFormField } from './SimFormField';
import { SimulationCreateModalShell } from './SimulationCreateModalShell';
import './simulation-create-modals.css';

export interface CreateSimulationPresetModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateSimulationPresetModal({ open, onClose, onCreated }: CreateSimulationPresetModalProps) {
  const { t } = useLocale();
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const configOptions = getSimulationConfigurationsMock().map((c) => ({ value: c.id, label: c.name }));
  const assetOptions = getSimulationAssetsMock().map((a) => ({ value: a.id, label: a.name }));

  useEffect(() => {
    if (!open) return;
    const cfgs = getSimulationConfigurationsMock();
    form.resetFields();
    form.setFieldsValue({
      configId: cfgs[0]?.id,
      assetIds: [],
      params: [{ key: '', value: '' }],
    });
  }, [open, form]);

  const submit = async () => {
    try {
      const values = await form.validateFields();
      const pairs = (values.params as { key?: string; value?: string }[]) ?? [];
      const filled = pairs.filter((p) => String(p?.key ?? '').trim() && String(p?.value ?? '').trim());
      if (filled.length < 1) {
        message.error(t('support.sim.create.validation.params'));
        return;
      }
      const cfg = getSimulationConfigurationsMock().find((c) => c.id === values.configId);
      const assetIds: string[] = values.assetIds ?? [];
      const today = new Date().toISOString().slice(0, 10);
      const row: SimulationPresetDto = {
        id: `sim-pre-${Date.now()}`,
        name: String(values.name).trim(),
        description: String(values.description ?? '').trim(),
        boundConfigName: cfg?.name ?? String(values.configId),
        boundConfigId: String(values.configId),
        boundAssetCount: assetIds.length,
        assetIds,
        parameters: filled.map((p) => ({ key: String(p.key).trim(), value: String(p.value).trim() })),
        updatedAt: today,
        facet: cfg?.facet ?? 'default',
      };
      prependSimulationPreset(row);
      message.success(t('support.sim.create.success'));
      onCreated();
      onClose();
    } catch {
      /* validation */
    }
  };

  return (
    <SimulationCreateModalShell open={open} title={t('support.sim.create.preset.title')} onCancel={onClose} onPrimaryClick={() => void submit()}>
      <Typography.Paragraph type="secondary" style={{ marginTop: 0, marginBottom: 16 }}>
        {t('support.sim.create.preset.intro')}
      </Typography.Paragraph>
      <Form form={form} layout="vertical" requiredMark="optional">
        <div className="sim-create-modal__section">
          <Typography.Title level={5} className="sim-create-modal__section-title">
            {t('support.sim.create.preset.section.basic')}
          </Typography.Title>
          <SimFormField name="name" label={t('support.sim.create.asset.field.name')} rules={[{ required: true, message: t('support.sim.create.validation.name') }]}>
            <Input allowClear />
          </SimFormField>
          <SimFormField name="description" label={t('support.sim.create.asset.field.description')}>
            <Input.TextArea rows={2} allowClear />
          </SimFormField>
        </div>

        <div className="sim-create-modal__section">
          <Typography.Title level={5} className="sim-create-modal__section-title">
            {t('support.sim.create.preset.section.bundle')}
          </Typography.Title>
          <SimFormField name="configId" label={t('support.sim.create.preset.field.config')} rules={[{ required: true, message: t('support.sim.create.validation.minSelect') }]}>
            <Select options={configOptions} showSearch optionFilterProp="label" />
          </SimFormField>
          <SimFormField
            name="assetIds"
            label={t('support.sim.create.preset.field.assets')}
            rules={[{ type: 'array', min: 1, required: true, message: t('support.sim.create.validation.minSelect') }]}
          >
            <Select mode="multiple" options={assetOptions} optionFilterProp="label" placeholder={t('support.sim.create.config.placeholder.multi')} />
          </SimFormField>
        </div>

        <div className="sim-create-modal__section">
          <Typography.Title level={5} className="sim-create-modal__section-title">
            {t('support.sim.create.preset.section.params')}
          </Typography.Title>
          <Form.List name="params">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <Space key={field.key} className="sim-create-modal__param-row" align="baseline" style={{ width: '100%' }}>
                    <Form.Item
                      key={`${field.key}-k`}
                      name={[field.name, 'key']}
                      label={t('support.sim.create.preset.field.paramKey')}
                      className="sim-form-field"
                      style={{ flex: 1, marginBottom: 0 }}
                    >
                      <Input placeholder="key" allowClear />
                    </Form.Item>
                    <Form.Item
                      key={`${field.key}-v`}
                      name={[field.name, 'value']}
                      label={t('support.sim.create.preset.field.paramValue')}
                      className="sim-form-field"
                      style={{ flex: 1, marginBottom: 0 }}
                    >
                      <Input placeholder="value" allowClear />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(field.name)} style={{ marginTop: 30, cursor: 'pointer' }} aria-hidden />
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  {t('support.sim.create.preset.addParam')}
                </Button>
              </>
            )}
          </Form.List>
        </div>
      </Form>
    </SimulationCreateModalShell>
  );
}
