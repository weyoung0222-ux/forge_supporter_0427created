import { App, Form, Input, Select, Typography } from 'antd';
import { useEffect, useMemo } from 'react';
import { getSupportDefinitionDevicesMock } from '../../../mocks/supportDefinitionMock';
import { prependSupportTask, type SupportTaskGroupKind } from '../../../mocks/supportTasksMock';
import { useLocale } from '../../../shared/i18n/LocaleProvider';
import { SimFormField } from '../simulation/create/SimFormField';
import { SimulationCreateModalShell } from '../simulation/create/SimulationCreateModalShell';
import '../simulation/create/simulation-create-modals.css';
import { ROBOT_CREATE_MODAL_WIDTH } from './robotCreateModalUtils';

function categoryToKind(category: string): SupportTaskGroupKind {
  if (category === 'locomotion') return 'Locomotion';
  if (category === 'perception') return 'Sensing';
  return 'Manipulation';
}

export interface CreateRobotTaskTypeModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateRobotTaskTypeModal({ open, onClose, onCreated }: CreateRobotTaskTypeModalProps) {
  const { t } = useLocale();
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const deviceOptions = useMemo(() => getSupportDefinitionDevicesMock().map((d) => ({ value: d.id, label: d.name })), []);

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    form.setFieldsValue({
      category: 'manipulation',
      requiredDevices: [],
    });
  }, [open, form]);

  const submit = async () => {
    try {
      const values = await form.validateFields();
      const category = String(values.category);
      const kind = categoryToKind(category);
      const devices: string[] = values.requiredDevices ?? [];
      if (devices.length < 1) {
        message.error(t('support.sim.create.validation.minSelect'));
        return;
      }
      const today = new Date().toISOString().slice(0, 10);
      const title = String(values.taskName).trim();
      const caps = String(values.capabilities ?? '').trim();
      prependSupportTask({
        id: `tsk-rfm-${Date.now()}`,
        title,
        subtitle: `${String(values.description ?? '').slice(0, 140)} · devices: ${devices.join(', ')}${caps ? ` · caps: ${caps.slice(0, 80)}` : ''}`,
        projectName: 'RFM Platform',
        updatedAt: today,
        status: 'draft',
        taskGroup: {
          id: `tg-tt-${Date.now()}`,
          name: `${title} (task type)`,
          kind,
        },
      });
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
      title={t('support.robot.create.taskType.title')}
      onCancel={onClose}
      onPrimaryClick={() => void submit()}
    >
      <Form form={form} layout="vertical" requiredMark="optional">
        <div className="sim-create-modal__section">
          <Typography.Title level={5} className="sim-create-modal__section-title">
            {t('support.robot.create.taskType.section.basic')}
          </Typography.Title>
          <SimFormField name="taskName" label={t('support.robot.create.taskType.field.taskName')} rules={[{ required: true, message: t('support.sim.create.validation.name') }]}>
            <Input allowClear />
          </SimFormField>
          <SimFormField name="description" label={t('support.sim.create.asset.field.description')}>
            <Input.TextArea rows={2} allowClear />
          </SimFormField>
        </div>

        <div className="sim-create-modal__section">
          <Typography.Title level={5} className="sim-create-modal__section-title">
            {t('support.robot.create.taskType.section.class')}
          </Typography.Title>
          <SimFormField name="category" label={t('support.robot.create.taskType.field.category')} rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'manipulation', label: t('support.robot.create.taskType.category.manipulation') },
                { value: 'locomotion', label: t('support.robot.create.taskType.category.locomotion') },
                { value: 'perception', label: t('support.robot.create.taskType.category.perception') },
              ]}
            />
          </SimFormField>
        </div>

        <div className="sim-create-modal__section">
          <Typography.Title level={5} className="sim-create-modal__section-title">
            {t('support.robot.create.taskType.section.requirements')}
          </Typography.Title>
          <SimFormField
            name="requiredDevices"
            label={t('support.robot.create.taskType.field.requiredDevices')}
            rules={[{ type: 'array', min: 1, required: true, message: t('support.sim.create.validation.minSelect') }]}
          >
            <Select mode="multiple" options={deviceOptions} optionFilterProp="label" placeholder={t('support.sim.create.config.placeholder.multi')} />
          </SimFormField>
          <SimFormField name="capabilities" label={t('support.robot.create.taskType.field.capabilities')}>
            <Input.TextArea rows={3} allowClear placeholder={t('support.robot.create.taskType.field.capabilitiesPh')} />
          </SimFormField>
        </div>
      </Form>
    </SimulationCreateModalShell>
  );
}
