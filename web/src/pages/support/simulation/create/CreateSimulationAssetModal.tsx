import { App, Form, Input, InputNumber, Select, Switch, Typography, Upload } from 'antd';
import type { UploadFile } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { getSupportDefinitionModelsMock } from '../../../../mocks/supportDefinitionMock';
import type { SimAssetType, SimulationAssetDto } from '../../../../mocks/simulationSupportMocks';
import { prependSimulationAsset } from '../../../../mocks/simulationSupportMocks';
import { useLocale } from '../../../../shared/i18n/LocaleProvider';
import { SimFormField } from './SimFormField';
import { CreateStepModalShell } from './CreateStepModalShell';
import { normImageUpload } from '../../robot-create/robotCreateModalUtils';
import './simulation-create-modals.css';

function normFile(e: unknown): UploadFile[] {
  if (Array.isArray(e)) {
    return e;
  }
  return (e as { fileList?: UploadFile[] })?.fileList ?? [];
}

const TAG_SUGGESTIONS = ['usd', 'urdf', 'robot', 'static', 'warehouse', 'physics', 'demo'];

export interface CreateSimulationAssetModalProps {
  open?: boolean;
  onClose: () => void;
  onCreated: () => void;
  layout?: 'modal' | 'page';
}

export function CreateSimulationAssetModal({ open = true, onClose, onCreated, layout = 'modal' }: CreateSimulationAssetModalProps) {
  const { t } = useLocale();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (layout === 'modal' && !open) return;
    form.resetFields();
    form.setFieldsValue({
      type: 'robot',
      collision: true,
      tags: [],
      mass: 1,
      friction: 0.5,
    });
    setCurrentStep(0);
  }, [open, layout, form]);

  const typeOptions: { value: SimAssetType; label: string }[] = [
    { value: 'robot', label: t('support.sim.assets.type.robot') },
    { value: 'object', label: t('support.sim.assets.type.object') },
    { value: 'environment', label: t('support.sim.assets.type.environment') },
  ];
  const robotModelOptions = getSupportDefinitionModelsMock().map((m) => ({ value: m.name, label: m.name }));

  const steps = useMemo(
    () => [
      { title: t('support.sim.create.asset.section.basic') },
      { title: t('support.sim.create.asset.section.files') + ' & ' + t('support.sim.create.asset.section.physics') },
      { title: t('support.sim.create.asset.section.tags') },
    ],
    [t],
  );

  const fieldsForStep: Record<number, string[]> = {
    0: ['name', 'type', 'description', 'robotModel'],
    1: ['urdfFile', 'previewFile', 'mass', 'friction', 'collision'],
    2: ['tags'],
  };

  const goNext = async () => {
    try {
      await form.validateFields(fieldsForStep[currentStep]);
      setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
    } catch {
      /* validation */
    }
  };

  const goPrev = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    try {
      const values = await form.validateFields();
      const today = new Date().toISOString().slice(0, 10);
      const ty = values.type as SimAssetType;
      const row: SimulationAssetDto = {
        id: `sim-asset-${Date.now()}`,
        name: String(values.name).trim(),
        type: ty,
        description: String(values.description ?? '').trim(),
        tags: (values.tags as string[]) ?? [],
        updatedAt: today,
        massKg: values.mass != null ? String(values.mass) : '—',
        friction: values.friction != null ? String(values.friction) : '—',
        collision: values.collision != null && values.collision ? 'User mesh (simplified)' : 'Convex hull (default)',
        previewKind: ty === 'robot' ? 'viewer3d' : 'image',
      };
      const linkedRobotModel = String(values.robotModel ?? '').trim();
      if (linkedRobotModel) {
        row.tags = [...row.tags, `robot-model:${linkedRobotModel}`];
      }
      prependSimulationAsset(row);
      message.success(t('support.sim.create.success'));
      onCreated();
      onClose();
    } catch {
      /* validation */
    }
  };

  return (
    <CreateStepModalShell
      layout={layout}
      open={open}
      title={t('support.sim.create.asset.title')}
      onCancel={onClose}
      onSubmit={() => void submit()}
      steps={steps}
      currentStep={currentStep}
      onPrev={goPrev}
      onNext={goNext}
    >
      <Form form={form} layout="vertical" requiredMark>
        <div style={{ display: currentStep === 0 ? undefined : 'none' }}>
          <div className="sim-create-modal__section">
            <Typography.Title level={5} className="sim-create-modal__section-title">
              {t('support.sim.create.asset.section.basic')}
            </Typography.Title>
            <SimFormField name="name" label={t('support.sim.create.asset.field.name')} rules={[{ required: true, message: t('support.sim.create.validation.name') }]}>
              <Input allowClear autoComplete="off" />
            </SimFormField>
            <SimFormField name="type" label={t('support.sim.create.asset.field.type')} rules={[{ required: true }]}>
              <Select options={typeOptions} />
            </SimFormField>
            <SimFormField name="description" label={t('support.sim.create.asset.field.description')}>
              <Input.TextArea rows={3} allowClear />
            </SimFormField>
            <SimFormField name="robotModel" label={t('support.sim.assetDetail.linkedRobotModel')}>
              <Select allowClear options={robotModelOptions} showSearch optionFilterProp="label" />
            </SimFormField>
          </div>
        </div>

        <div style={{ display: currentStep === 1 ? undefined : 'none' }}>
          <div className="sim-create-modal__section">
            <Typography.Title level={5} className="sim-create-modal__section-title">
              {t('support.sim.create.asset.section.files')}
            </Typography.Title>
            <SimFormField name="urdfFile" label={t('support.sim.create.asset.field.urdf')} valuePropName="fileList" getValueFromEvent={normFile}>
              <Upload.Dragger maxCount={2} beforeUpload={() => false} accept=".usd,.usda,.usdc,.urdf,.xacro">
                <Typography.Paragraph style={{ marginBottom: 0 }}>{t('support.sim.create.asset.uploadHint')}</Typography.Paragraph>
              </Upload.Dragger>
            </SimFormField>
            <SimFormField name="previewFile" label={t('support.sim.create.asset.field.preview')} valuePropName="fileList" getValueFromEvent={normImageUpload}>
              <Upload.Dragger
                className="sim-create-modal__image-upload"
                listType="picture"
                maxCount={1}
                beforeUpload={() => false}
                accept="image/*"
              >
                <Typography.Paragraph style={{ marginBottom: 0 }}>{t('support.sim.create.asset.previewHint')}</Typography.Paragraph>
              </Upload.Dragger>
            </SimFormField>
          </div>
          <div className="sim-create-modal__section">
            <Typography.Title level={5} className="sim-create-modal__section-title">
              {t('support.sim.create.asset.section.physics')}
            </Typography.Title>
            <SimFormField name="mass" label={t('support.sim.create.asset.field.mass')}>
              <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
            </SimFormField>
            <SimFormField name="friction" label={t('support.sim.create.asset.field.friction')}>
              <InputNumber min={0} max={2} step={0.01} style={{ width: '100%' }} />
            </SimFormField>
            <SimFormField name="collision" label={t('support.sim.create.asset.field.collision')} valuePropName="checked">
              <Switch />
            </SimFormField>
          </div>
        </div>

        <div style={{ display: currentStep === 2 ? undefined : 'none' }}>
          <div className="sim-create-modal__section">
            <Typography.Title level={5} className="sim-create-modal__section-title">
              {t('support.sim.create.asset.section.tags')}
            </Typography.Title>
            <SimFormField
              name="tags"
              label={t('support.sim.create.asset.field.tags')}
              rules={[
                { type: 'array', min: 1, required: true, message: t('support.sim.create.validation.minSelect') },
              ]}
            >
              <Select
                mode="tags"
                style={{ width: '100%' }}
                placeholder={t('support.sim.create.asset.tagsPlaceholder')}
                tokenSeparators={[',']}
                options={TAG_SUGGESTIONS.map((x) => ({ value: x, label: x }))}
              />
            </SimFormField>
          </div>
        </div>
      </Form>
    </CreateStepModalShell>
  );
}
