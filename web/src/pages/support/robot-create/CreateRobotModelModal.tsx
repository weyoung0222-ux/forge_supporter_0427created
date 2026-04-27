import { App, Form, Input, InputNumber, Select, Typography, Upload } from 'antd';
import { useEffect } from 'react';
import type { SupportDefinitionModelDto } from '../../../mocks/supportDefinitionMock';
import { prependSupportDefinitionModel } from '../../../mocks/supportDefinitionMock';
import { useLocale } from '../../../shared/i18n/LocaleProvider';
import { SimFormField } from '../simulation/create/SimFormField';
import { SimulationCreateModalShell } from '../simulation/create/SimulationCreateModalShell';
import '../simulation/create/simulation-create-modals.css';
import { normFile, ROBOT_CREATE_MODAL_WIDTH } from './robotCreateModalUtils';

const TAG_SUGGESTIONS = ['urdf', 'rfm', 'manipulator', 'mobile', 'humanoid', 'demo'];

function mapRobotTypeToSource(robotType: string): SupportDefinitionModelDto['source'] {
  if (robotType === 'mobile') return 'Simulation';
  if (robotType === 'humanoid') return 'Registry';
  return 'Training';
}

export interface CreateRobotModelModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateRobotModelModal({ open, onClose, onCreated }: CreateRobotModelModalProps) {
  const { t } = useLocale();
  const { message } = App.useApp();
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    form.setFieldsValue({
      robotType: 'manipulator',
      dof: 6,
      tags: [],
    });
  }, [open, form]);

  const submit = async () => {
    try {
      const values = await form.validateFields();
      const today = new Date().toISOString().slice(0, 10);
      const robotType = String(values.robotType);
      const row: SupportDefinitionModelDto = {
        kind: 'model',
        id: `mdl-rfm-${Date.now()}`,
        name: String(values.modelName).trim(),
        version: String(values.version ?? 'v0.1.0').trim(),
        source: mapRobotTypeToSource(robotType),
        projectName: 'RFM Platform',
        subtitle: String(values.description ?? '').trim().slice(0, 200) || `Robot model (${robotType})`,
        updatedAt: today,
      };
      prependSupportDefinitionModel(row);
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
      title={t('support.robot.create.model.title')}
      onCancel={onClose}
      onPrimaryClick={() => void submit()}
    >
      <Form form={form} layout="vertical" requiredMark="optional">
        <div className="sim-create-modal__section">
          <Typography.Title level={5} className="sim-create-modal__section-title">
            {t('support.robot.create.model.section.basic')}
          </Typography.Title>
          <SimFormField name="modelName" label={t('support.robot.create.model.field.name')} rules={[{ required: true, message: t('support.sim.create.validation.name') }]}>
            <Input allowClear />
          </SimFormField>
          <SimFormField name="manufacturer" label={t('support.robot.create.model.field.manufacturer')}>
            <Input allowClear />
          </SimFormField>
          <SimFormField name="description" label={t('support.sim.create.asset.field.description')}>
            <Input.TextArea rows={3} allowClear />
          </SimFormField>
        </div>

        <div className="sim-create-modal__section">
          <Typography.Title level={5} className="sim-create-modal__section-title">
            {t('support.robot.create.model.section.structure')}
          </Typography.Title>
          <SimFormField name="robotType" label={t('support.robot.create.model.field.robotType')} rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'manipulator', label: t('support.robot.create.model.robotType.manipulator') },
                { value: 'mobile', label: t('support.robot.create.model.robotType.mobile') },
                { value: 'humanoid', label: t('support.robot.create.model.robotType.humanoid') },
              ]}
            />
          </SimFormField>
          <SimFormField name="dof" label={t('support.robot.create.model.field.dof')} rules={[{ required: true }]}>
            <InputNumber min={1} max={64} style={{ width: '100%' }} />
          </SimFormField>
          <SimFormField name="jointStructure" label={t('support.robot.create.model.field.jointStructure')}>
            <Input.TextArea rows={4} placeholder={t('support.robot.create.model.field.jointStructurePh')} allowClear />
          </SimFormField>
        </div>

        <div className="sim-create-modal__section">
          <Typography.Title level={5} className="sim-create-modal__section-title">
            {t('support.robot.create.model.section.files')}
          </Typography.Title>
          <SimFormField name="urdfFile" label={t('support.sim.create.asset.field.urdf')} valuePropName="fileList" getValueFromEvent={normFile}>
            <Upload.Dragger maxCount={2} beforeUpload={() => false} accept=".urdf,.xacro,.usd,.usda">
              <Typography.Paragraph style={{ marginBottom: 0 }}>{t('support.sim.create.asset.uploadHint')}</Typography.Paragraph>
            </Upload.Dragger>
          </SimFormField>
          <SimFormField name="previewFile" label={t('support.sim.create.asset.field.preview')} valuePropName="fileList" getValueFromEvent={normFile}>
            <Upload.Dragger maxCount={1} beforeUpload={() => false} accept="image/*">
              <Typography.Paragraph style={{ marginBottom: 0 }}>{t('support.sim.create.asset.previewHint')}</Typography.Paragraph>
            </Upload.Dragger>
          </SimFormField>
        </div>

        <div className="sim-create-modal__section">
          <Typography.Title level={5} className="sim-create-modal__section-title">
            {t('support.robot.create.model.section.meta')}
          </Typography.Title>
          <SimFormField name="version" label={t('support.robot.create.model.field.version')}>
            <Input allowClear placeholder="v0.1.0" />
          </SimFormField>
          <SimFormField name="tags" label={t('support.sim.create.asset.field.tags')}>
            <Select mode="tags" style={{ width: '100%' }} tokenSeparators={[',']} options={TAG_SUGGESTIONS.map((x) => ({ value: x, label: x }))} />
          </SimFormField>
        </div>
      </Form>
    </SimulationCreateModalShell>
  );
}
