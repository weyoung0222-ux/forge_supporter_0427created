import { App, Form, Input, Select, Typography } from 'antd';
import { useEffect } from 'react';
import type { SimulationConfigDto } from '../../../../mocks/simulationSupportMocks';
import { getSimulationAssetsMock, prependSimulationConfiguration } from '../../../../mocks/simulationSupportMocks';
import { useLocale } from '../../../../shared/i18n/LocaleProvider';
import { SimFormField } from './SimFormField';
import { SimulationCreateModalShell } from './SimulationCreateModalShell';
import './simulation-create-modals.css';

const ACTION_TO_FACET: Record<string, SimulationConfigDto['facet']> = {
  step: 'default',
  episode: 'stress',
  reset: 'regression',
};

export interface CreateSimulationConfigurationModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateSimulationConfigurationModal({ open, onClose, onCreated }: CreateSimulationConfigurationModalProps) {
  const { t } = useLocale();
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const assetOptions = getSimulationAssetsMock().map((a) => ({ value: a.id, label: a.name }));

  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue({
        actionType: 'step',
        termination: 'max_steps',
        targetAssets: [],
        observationTargets: [],
      });
    }
  }, [open, form]);

  const submit = async () => {
    try {
      const values = await form.validateFields();
      const today = new Date().toISOString().slice(0, 10);
      const targets: string[] = values.targetAssets ?? [];
      const obs: string[] = values.observationTargets ?? [];
      const eventsText = String(values.eventConditions ?? '');
      const eventLines = eventsText.split('\n').map((l) => l.trim()).filter(Boolean);
      const term = String(values.termination ?? '');
      const row: SimulationConfigDto = {
        id: `sim-cfg-${Date.now()}`,
        name: String(values.name).trim(),
        description: String(values.description ?? '').trim(),
        assetsCount: targets.length,
        eventsCount: Math.max(1, eventLines.length),
        updatedAt: today,
        facet: ACTION_TO_FACET[String(values.actionType)] ?? 'default',
        status: 'draft',
        actionType: String(values.actionType),
        terminationCondition: term,
        targetAssetIds: targets,
        observationTargets: obs,
        eventConditions: eventLines.length ? eventLines : ['(no events yet)'],
      };
      prependSimulationConfiguration(row);
      message.success(t('support.sim.create.success'));
      onCreated();
      onClose();
    } catch {
      /* validation */
    }
  };

  return (
    <SimulationCreateModalShell open={open} title={t('support.sim.create.config.title')} onCancel={onClose} onPrimaryClick={() => void submit()}>
      <Form form={form} layout="vertical" requiredMark="optional">
        <div className="sim-create-modal__section">
          <Typography.Title level={5} className="sim-create-modal__section-title">
            {t('support.sim.create.config.section.basic')}
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
            {t('support.sim.create.config.section.run')}
          </Typography.Title>
          <SimFormField name="actionType" label={t('support.sim.create.config.field.actionType')} rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'step', label: t('support.sim.create.config.action.step') },
                { value: 'episode', label: t('support.sim.create.config.action.episode') },
                { value: 'reset', label: t('support.sim.create.config.action.reset') },
              ]}
            />
          </SimFormField>
          <SimFormField name="termination" label={t('support.sim.create.config.field.termination')} rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'max_steps', label: t('support.sim.create.config.term.maxSteps') },
                { value: 'success', label: t('support.sim.create.config.term.success') },
                { value: 'timeout', label: t('support.sim.create.config.term.timeout') },
              ]}
            />
          </SimFormField>
        </div>

        <div className="sim-create-modal__section">
          <Typography.Title level={5} className="sim-create-modal__section-title">
            {t('support.sim.create.config.section.targets')}
          </Typography.Title>
          <SimFormField
            name="targetAssets"
            label={t('support.sim.create.config.field.targetAssets')}
            rules={[{ type: 'array', min: 1, required: true, message: t('support.sim.create.validation.minSelect') }]}
          >
            <Select mode="multiple" options={assetOptions} optionFilterProp="label" placeholder={t('support.sim.create.config.placeholder.multi')} />
          </SimFormField>
          <SimFormField
            name="observationTargets"
            label={t('support.sim.create.config.field.observation')}
            rules={[{ type: 'array', min: 1, required: true, message: t('support.sim.create.validation.minSelect') }]}
          >
            <Select mode="multiple" options={assetOptions} optionFilterProp="label" placeholder={t('support.sim.create.config.placeholder.multi')} />
          </SimFormField>
        </div>

        <div className="sim-create-modal__section">
          <Typography.Title level={5} className="sim-create-modal__section-title">
            {t('support.sim.create.config.section.events')}
          </Typography.Title>
          <SimFormField name="eventConditions" label={t('support.sim.create.config.field.events')}>
            <Input.TextArea rows={4} placeholder={t('support.sim.create.config.placeholder.events')} allowClear />
          </SimFormField>
        </div>
      </Form>
    </SimulationCreateModalShell>
  );
}
