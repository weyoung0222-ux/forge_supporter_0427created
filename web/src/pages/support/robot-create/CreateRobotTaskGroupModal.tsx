import { App, Form, Input, Select, Typography } from 'antd';
import { useEffect, useMemo } from 'react';
import { getSupportTasksMock, prependSupportTask } from '../../../mocks/supportTasksMock';
import { useLocale } from '../../../shared/i18n/LocaleProvider';
import { SimFormField } from '../simulation/create/SimFormField';
import { SimulationCreateModalShell } from '../simulation/create/SimulationCreateModalShell';
import '../simulation/create/simulation-create-modals.css';
import { ROBOT_CREATE_MODAL_WIDTH } from './robotCreateModalUtils';

export interface CreateRobotTaskGroupModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateRobotTaskGroupModal({ open, onClose, onCreated }: CreateRobotTaskGroupModalProps) {
  const { t } = useLocale();
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const taskTypeOptions = useMemo(() => getSupportTasksMock().map((x) => ({ value: x.id, label: x.title })), []);

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    form.setFieldsValue({ taskRefs: [] });
  }, [open, form]);

  const submit = async () => {
    try {
      const values = await form.validateFields();
      const refs: string[] = values.taskRefs ?? [];
      if (refs.length < 1) {
        message.error(t('support.sim.create.validation.minSelect'));
        return;
      }
      const all = getSupportTasksMock();
      const selected = all.filter((x) => refs.includes(x.id));
      const kind = selected[0]!.taskGroup.kind;
      const today = new Date().toISOString().slice(0, 10);
      const groupName = String(values.groupName).trim();
      const groupId = `tg-rfm-${Date.now()}`;
      prependSupportTask({
        id: `tsk-grp-${Date.now()}`,
        title: `${groupName} — workspace`,
        subtitle: String(values.description ?? '').trim().slice(0, 200) || `Tasks: ${selected.map((s) => s.title).join(' · ').slice(0, 180)}`,
        projectName: 'RFM Platform',
        updatedAt: today,
        status: 'draft',
        taskGroup: {
          id: groupId,
          name: groupName,
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
      title={t('support.robot.create.taskGroup.title')}
      onCancel={onClose}
      onPrimaryClick={() => void submit()}
    >
      <Form form={form} layout="vertical" requiredMark="optional">
        <div className="sim-create-modal__section">
          <Typography.Title level={5} className="sim-create-modal__section-title">
            {t('support.robot.create.taskGroup.section.basic')}
          </Typography.Title>
          <SimFormField name="groupName" label={t('support.robot.create.taskGroup.field.groupName')} rules={[{ required: true, message: t('support.sim.create.validation.name') }]}>
            <Input allowClear />
          </SimFormField>
          <SimFormField name="description" label={t('support.sim.create.asset.field.description')}>
            <Input.TextArea rows={2} allowClear />
          </SimFormField>
        </div>

        <div className="sim-create-modal__section">
          <Typography.Title level={5} className="sim-create-modal__section-title">
            {t('support.robot.create.taskGroup.section.tasks')}
          </Typography.Title>
          <SimFormField
            name="taskRefs"
            label={t('support.robot.create.taskGroup.field.taskTypes')}
            rules={[{ type: 'array', min: 1, required: true, message: t('support.sim.create.validation.minSelect') }]}
          >
            <Select mode="multiple" options={taskTypeOptions} optionFilterProp="label" placeholder={t('support.sim.create.config.placeholder.multi')} />
          </SimFormField>
        </div>
      </Form>
    </SimulationCreateModalShell>
  );
}
