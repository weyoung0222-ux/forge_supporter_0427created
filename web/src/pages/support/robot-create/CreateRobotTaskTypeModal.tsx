import { App, Form, Input, Select, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { getSupportTaskTypeById, getSupportTaskTypesCatalog, prependSupportTask } from '../../../mocks/supportTasksMock';
import { useLocale } from '../../../shared/i18n/LocaleProvider';
import { SimFormField } from '../simulation/create/SimFormField';
import { CreateStepModalShell } from '../simulation/create/CreateStepModalShell';
import '../simulation/create/simulation-create-modals.css';
import { ROBOT_CREATE_MODAL_WIDTH } from './robotCreateModalUtils';

const TOTAL_STEPS = 2;

export interface CreateRobotTaskTypeModalProps {
  open?: boolean;
  onClose: () => void;
  onCreated: () => void;
  layout?: 'modal' | 'page';
  /** When set, skip task-group step and pre-select this group. */
  initialTaskTypeId?: string;
}

export function CreateRobotTaskTypeModal({
  open = true,
  onClose,
  onCreated,
  layout = 'modal',
  initialTaskTypeId,
}: CreateRobotTaskTypeModalProps) {
  const { t } = useLocale();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);

  const taskTypeSelectOptions = useMemo(() => {
    if (layout === 'modal' && !open) return [];
    return getSupportTaskTypesCatalog().map((row) => ({
      value: row.id,
      label: `${row.name} (${row.code})`,
    }));
  }, [open, layout]);

  useEffect(() => {
    if (layout === 'modal' && !open) return;
    form.resetFields();
    if (initialTaskTypeId) {
      form.setFieldsValue({ taskTypeId: initialTaskTypeId });
      setCurrentStep(1);
    } else {
      setCurrentStep(0);
    }
  }, [open, layout, form, initialTaskTypeId]);

  const steps = useMemo(
    () => [
      { title: t('support.robot.create.taskType.section.step1') },
      { title: t('support.robot.create.taskType.section.step2') },
    ],
    [t],
  );

  const fieldsForStep: Record<number, string[]> = {
    0: ['taskTypeId'],
    1: ['subtypeCode', 'subtypeDisplayName', 'subtypeDescription'],
  };

  const goNext = async () => {
    try {
      await form.validateFields(fieldsForStep[currentStep]);
      setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
    } catch {
      /* validation */
    }
  };

  const goPrev = () => setCurrentStep((s) => Math.max(0, s - 1));

  const submit = async () => {
    try {
      const values = await form.validateFields();
      const today = new Date().toISOString().slice(0, 10);
      const taskTypeIdVal = String(values.taskTypeId);
      const selected = getSupportTaskTypeById(taskTypeIdVal);
      if (!selected) {
        message.error(t('support.robot.create.taskType.validation.missingTaskType'));
        return;
      }
      const subtypeCode = String(values.subtypeCode).trim();
      const subtypeDisplayName = String(values.subtypeDisplayName).trim();
      const subtypeDesc = String(values.subtypeDescription ?? '').trim();
      const example = String(values.example ?? '').trim();
      prependSupportTask({
        id: `tsk-rfm-${Date.now()}`,
        subtypeCode,
        title: subtypeDisplayName,
        subtitle: example.slice(0, 160) || subtypeDesc.slice(0, 160) || subtypeDisplayName,
        taskDescription: subtypeDesc || `${subtypeDisplayName} — task subtype definition (demo).`,
        example: example || undefined,
        requiredCompositionId: 'cp-generic-task',
        requiredCompositionName: 'General task definition',
        requiredModality: 'general',
        projectName: 'Task Catalog',
        updatedAt: today,
        status: 'draft',
        taskType: { ...selected },
      });
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
      modalWidth={ROBOT_CREATE_MODAL_WIDTH}
      title={t('support.robot.create.taskType.title')}
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
              {t('support.robot.create.taskType.section.step1')}
            </Typography.Title>
            <SimFormField
              name="taskTypeId"
              label={t('support.robot.create.taskType.field.taskType')}
              rules={[{ required: true, message: t('support.robot.create.taskType.validation.selectTaskType') }]}
            >
              <Select allowClear options={taskTypeSelectOptions} showSearch optionFilterProp="label" popupMatchSelectWidth={false} />
            </SimFormField>
          </div>
        </div>

        <div style={{ display: currentStep === 1 ? undefined : 'none' }}>
          <div className="sim-create-modal__section">
            <Typography.Title level={5} className="sim-create-modal__section-title">
              {t('support.robot.create.taskType.section.step2')}
            </Typography.Title>
            <SimFormField
              name="subtypeCode"
              label={t('support.robot.create.taskType.field.subtypeCode')}
              rules={[{ required: true, message: t('support.sim.create.validation.name') }]}
            >
              <Input allowClear autoComplete="off" placeholder="pick_and_place" />
            </SimFormField>
            <SimFormField
              name="subtypeDisplayName"
              label={t('support.robot.create.taskType.field.subtypeDisplayName')}
              rules={[{ required: true, message: t('support.sim.create.validation.name') }]}
            >
              <Input allowClear autoComplete="off" />
            </SimFormField>
            <SimFormField
              name="subtypeDescription"
              label={t('support.robot.create.taskType.field.subtypeDescription')}
              rules={[{ required: true, message: t('support.sim.create.validation.name') }]}
            >
              <Input.TextArea rows={3} allowClear />
            </SimFormField>
            <SimFormField name="example" label={t('support.robot.create.taskType.field.example')}>
              <Input.TextArea rows={3} allowClear placeholder={t('support.robot.create.taskType.field.examplePh')} />
            </SimFormField>
          </div>
        </div>
      </Form>
    </CreateStepModalShell>
  );
}
