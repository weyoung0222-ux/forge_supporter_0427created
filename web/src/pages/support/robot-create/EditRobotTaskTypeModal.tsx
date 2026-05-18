import { App, Button, Form, Input, Modal, Select, Space } from 'antd';
import { useEffect, useMemo } from 'react';
import {
  getSupportTaskTypeById,
  getSupportTaskTypesCatalog,
  type SupportTaskTypeRef,
  updateSupportTaskTypeEverywhere,
  upsertOrphanSupportTaskType,
} from '../../../mocks/supportTasksMock';
import { useLocale } from '../../../shared/i18n/LocaleProvider';
import { SimFormField } from '../simulation/create/SimFormField';
import '../simulation/create/simulation-create-modals.css';
import { ROBOT_CREATE_MODAL_WIDTH } from './robotCreateModalUtils';

const NEW_TARGET = '__new__';

export interface EditRobotTaskTypeModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  /** Pre-select task group on open (`__new__` for create). */
  initialTargetId?: string;
}

export function EditRobotTaskTypeModal({ open, onClose, onSaved, initialTargetId }: EditRobotTaskTypeModalProps) {
  const { t } = useLocale();
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const catalog = useMemo(() => (open ? getSupportTaskTypesCatalog() : []), [open]);

  const targetOptions = useMemo(
    () => [
      { value: NEW_TARGET, label: t('support.robot.edit.taskType.optionNew') },
      ...catalog.map((row) => ({
        value: row.id,
        label: `${row.name} (${row.code})`,
      })),
    ],
    [catalog, t],
  );

  const applyTarget = (targetId: string) => {
    if (targetId === NEW_TARGET) {
      form.setFieldsValue({
        typeCode: '',
        typeDisplayName: '',
        typeDescription: '',
      });
      return;
    }
    const row = getSupportTaskTypeById(targetId);
    if (!row) return;
    form.setFieldsValue({
      typeCode: row.code,
      typeDisplayName: row.name,
      typeDescription: row.description ?? '',
    });
  };

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    const target = initialTargetId ?? NEW_TARGET;
    form.setFieldsValue({ targetId: target });
    applyTarget(target);
  }, [open, form, initialTargetId]);

  const submit = async () => {
    try {
      const v = await form.validateFields();
      const targetId = String(v.targetId);
      const code = String(v.typeCode).trim();
      const name = String(v.typeDisplayName).trim();
      const description = String(v.typeDescription ?? '').trim();

      if (targetId === NEW_TARGET) {
        const id = `tt-new-${Date.now()}`;
        const ref: SupportTaskTypeRef = {
          id,
          code,
          name,
          description: description || undefined,
          enabled: true,
          kind: 'Manipulation',
        };
        upsertOrphanSupportTaskType(ref);
        message.success(t('support.sim.create.success'));
      } else {
        updateSupportTaskTypeEverywhere(targetId, { code, name, description: description || undefined });
        message.success(t('support.sim.create.success'));
      }
      onSaved();
      onClose();
    } catch {
      /* validation */
    }
  };

  return (
    <Modal
      open={open}
      title={t('support.robot.edit.taskType.title')}
      onCancel={onClose}
      width={ROBOT_CREATE_MODAL_WIDTH}
      destroyOnClose
      maskClosable={false}
      className="sim-create-modal"
      styles={{
        body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', paddingTop: 4 },
      }}
      footer={
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={onClose}>{t('support.sim.create.cancel')}</Button>
          <Button type="primary" onClick={() => void submit()}>
            {t('support.robot.edit.taskType.save')}
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" requiredMark>
        <div className="sim-create-modal__section">
          <SimFormField name="targetId" label={t('support.robot.edit.taskType.field.target')} rules={[{ required: true }]}>
            <Select
              options={targetOptions}
              popupMatchSelectWidth={false}
              onChange={(id) => {
                applyTarget(String(id));
              }}
            />
          </SimFormField>
          <SimFormField
            name="typeCode"
            label={t('support.robot.edit.taskType.field.typeCode')}
            rules={[{ required: true, message: t('support.sim.create.validation.name') }]}
          >
            <Input allowClear autoComplete="off" placeholder="manipulation" />
          </SimFormField>
          <SimFormField
            name="typeDisplayName"
            label={t('support.robot.edit.taskType.field.typeDisplayName')}
            rules={[{ required: true, message: t('support.sim.create.validation.name') }]}
          >
            <Input allowClear autoComplete="off" />
          </SimFormField>
          <SimFormField name="typeDescription" label={t('support.robot.edit.taskType.field.typeDescription')}>
            <Input.TextArea rows={3} allowClear />
          </SimFormField>
        </div>
      </Form>
    </Modal>
  );
}
