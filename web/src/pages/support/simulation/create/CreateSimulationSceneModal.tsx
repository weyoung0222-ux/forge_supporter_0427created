import { App, Form, Input, Select, Typography } from 'antd';
import { useEffect } from 'react';
import type { SceneOrigin, SimulationSceneDto } from '../../../../mocks/simulationSupportMocks';
import { getSimulationAssetsMock, prependSimulationScene } from '../../../../mocks/simulationSupportMocks';
import { useLocale } from '../../../../shared/i18n/LocaleProvider';
import { SimFormField } from './SimFormField';
import { SimulationCreateModalShell } from './SimulationCreateModalShell';
import './simulation-create-modals.css';

export interface CreateSimulationSceneModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateSimulationSceneModal({ open, onClose, onCreated }: CreateSimulationSceneModalProps) {
  const { t } = useLocale();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const assetOptions = getSimulationAssetsMock().map((a) => ({ value: a.id, label: a.name }));

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    form.setFieldsValue({
      origin: 'manual' as SceneOrigin,
      seedAssets: [],
    });
  }, [open, form]);

  const submit = async () => {
    try {
      const values = await form.validateFields();
      const today = new Date().toISOString().slice(0, 10);
      const seed: string[] = values.seedAssets ?? [];
      const row: SimulationSceneDto = {
        id: `sim-scene-${Date.now()}`,
        name: String(values.name).trim(),
        assetCount: Math.max(1, seed.length),
        origin: values.origin as SceneOrigin,
        updatedAt: today,
      };
      prependSimulationScene(row);
      message.success(t('support.sim.create.success'));
      onCreated();
      onClose();
    } catch {
      /* validation */
    }
  };

  return (
    <SimulationCreateModalShell open={open} title={t('support.sim.create.scene.title')} onCancel={onClose} onPrimaryClick={() => void submit()}>
      <Form form={form} layout="vertical" requiredMark="optional">
        <div className="sim-create-modal__section">
          <Typography.Title level={5} className="sim-create-modal__section-title">
            {t('support.sim.create.scene.section.basic')}
          </Typography.Title>
          <SimFormField name="name" label={t('support.sim.create.asset.field.name')} rules={[{ required: true, message: t('support.sim.create.validation.name') }]}>
            <Input allowClear />
          </SimFormField>
          <SimFormField name="description" label={t('support.sim.create.asset.field.description')}>
            <Input.TextArea rows={2} allowClear />
          </SimFormField>
          <SimFormField name="origin" label={t('support.sim.create.scene.field.origin')} rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'manual', label: t('support.sim.scenes.origin.manual') },
                { value: 'ai', label: t('support.sim.scenes.origin.ai') },
              ]}
            />
          </SimFormField>
        </div>
        <div className="sim-create-modal__section">
          <Typography.Title level={5} className="sim-create-modal__section-title">
            {t('support.sim.create.scene.section.seed')}
          </Typography.Title>
          <SimFormField
            name="seedAssets"
            label={t('support.sim.create.scene.field.seedAssets')}
            rules={[{ type: 'array', min: 1, required: true, message: t('support.sim.create.validation.minSelect') }]}
          >
            <Select mode="multiple" options={assetOptions} optionFilterProp="label" placeholder={t('support.sim.create.config.placeholder.multi')} />
          </SimFormField>
        </div>
      </Form>
    </SimulationCreateModalShell>
  );
}
