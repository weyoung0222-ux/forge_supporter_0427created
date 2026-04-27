import { App, Form, Input, Select, Switch, Typography } from 'antd';
import { useEffect, useMemo } from 'react';
import type { SupportCompositionDto } from '../../../mocks/supportCompositionsMock';
import { prependSupportComposition } from '../../../mocks/supportCompositionsMock';
import {
  getSupportDefinitionDeviceById,
  getSupportDefinitionModelById,
  getSupportDefinitionDevicesMock,
  getSupportDefinitionModelsMock,
} from '../../../mocks/supportDefinitionMock';
import { useLocale } from '../../../shared/i18n/LocaleProvider';
import { SimFormField } from '../simulation/create/SimFormField';
import { SimulationCreateModalShell } from '../simulation/create/SimulationCreateModalShell';
import '../simulation/create/simulation-create-modals.css';
import { ROBOT_CREATE_MODAL_WIDTH } from './robotCreateModalUtils';

function shortDeviceLabel(name: string): string {
  return name.replace(/_/g, ' ').split(' ').slice(-3).join(' ');
}

export interface CreateRobotCompositionModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateRobotCompositionModal({ open, onClose, onCreated }: CreateRobotCompositionModalProps) {
  const { t } = useLocale();
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const modelOptions = useMemo(() => getSupportDefinitionModelsMock().map((m) => ({ value: m.id, label: m.name })), []);
  const deviceOpts = useMemo(() => getSupportDefinitionDevicesMock().map((d) => ({ value: d.id, label: d.name })), []);

  useEffect(() => {
    if (!open) return;
    const models = getSupportDefinitionModelsMock();
    const first = models[0];
    form.resetFields();
    form.setFieldsValue({
      modelId: first?.id,
      devices: [],
      compatibilityCheck: true,
    });
  }, [open, form]);

  const submit = async () => {
    try {
      const values = await form.validateFields();
      const modelId = String(values.modelId);
      const meta = getSupportDefinitionModelById(modelId);
      const deviceIds: string[] = values.devices ?? [];
      if (deviceIds.length < 1) {
        message.error(t('support.sim.create.validation.minSelect'));
        return;
      }
      const today = new Date().toISOString().slice(0, 10);
      const devices = deviceIds.map((id) => {
        const d = getSupportDefinitionDeviceById(id);
        return { id, shortName: d ? shortDeviceLabel(d.name) : id };
      });
      const row: SupportCompositionDto = {
        id: `cp-rfm-${Date.now()}`,
        name: String(values.name).trim(),
        subtitle: String(values.description ?? '').trim().slice(0, 220) || 'RFM composition',
        projectName: 'RFM Platform',
        updatedAt: today,
        model: { id: modelId, name: meta?.name ?? modelId },
        devices,
      };
      prependSupportComposition(row);
      if (values.compatibilityCheck) {
        message.success(t('support.robot.create.composition.compatOk'));
      }
      message.success(t('support.sim.create.success'));
      onCreated();
      onClose();
    } catch {
      /* validation */
    }
  };

  return (
    <SimulationCreateModalShell
      open={open}
      modalWidth={ROBOT_CREATE_MODAL_WIDTH}
      title={t('support.robot.create.composition.title')}
      onCancel={onClose}
      onPrimaryClick={() => void submit()}
    >
      <Form form={form} layout="vertical" requiredMark="optional">
        <div className="sim-create-modal__section">
          <Typography.Title level={5} className="sim-create-modal__section-title">
            {t('support.robot.create.composition.section.basic')}
          </Typography.Title>
          <SimFormField name="name" label={t('support.robot.create.composition.field.name')} rules={[{ required: true, message: t('support.sim.create.validation.name') }]}>
            <Input allowClear />
          </SimFormField>
          <SimFormField name="description" label={t('support.sim.create.asset.field.description')}>
            <Input.TextArea rows={2} allowClear />
          </SimFormField>
        </div>

        <div className="sim-create-modal__section">
          <Typography.Title level={5} className="sim-create-modal__section-title">
            {t('support.robot.create.composition.section.model')}
          </Typography.Title>
          <SimFormField name="modelId" label={t('support.robot.create.composition.field.model')} rules={[{ required: true, message: t('support.sim.create.validation.minSelect') }]}>
            <Select showSearch optionFilterProp="label" options={modelOptions} />
          </SimFormField>
        </div>

        <div className="sim-create-modal__section">
          <Typography.Title level={5} className="sim-create-modal__section-title">
            {t('support.robot.create.composition.section.devices')}
          </Typography.Title>
          <SimFormField
            name="devices"
            label={t('support.robot.create.composition.field.devices')}
            rules={[{ type: 'array', min: 1, required: true, message: t('support.sim.create.validation.minSelect') }]}
          >
            <Select mode="multiple" options={deviceOpts} optionFilterProp="label" placeholder={t('support.sim.create.config.placeholder.multi')} />
          </SimFormField>
        </div>

        <div className="sim-create-modal__section">
          <Typography.Title level={5} className="sim-create-modal__section-title">
            {t('support.robot.create.composition.section.compat')}
          </Typography.Title>
          <SimFormField name="compatibilityCheck" label={t('support.robot.create.composition.field.compat')} valuePropName="checked">
            <Switch />
          </SimFormField>
        </div>
      </Form>
    </SimulationCreateModalShell>
  );
}
