import { App, Form, Input, InputNumber, Select, Typography, Upload } from 'antd';
import { useEffect } from 'react';
import type { SupportDefinitionDeviceDto } from '../../../mocks/supportDefinitionMock';
import { getSupportDefinitionModelsMock, prependSupportDefinitionDevice } from '../../../mocks/supportDefinitionMock';
import { useLocale } from '../../../shared/i18n/LocaleProvider';
import { SimFormField } from '../simulation/create/SimFormField';
import { SimulationCreateModalShell } from '../simulation/create/SimulationCreateModalShell';
import '../simulation/create/simulation-create-modals.css';
import { normFile, ROBOT_CREATE_MODAL_WIDTH } from './robotCreateModalUtils';

function mapDeviceTypeToClass(deviceType: string): SupportDefinitionDeviceDto['deviceClass'] {
  if (deviceType === 'camera' || deviceType === 'sensor') return 'Sensing';
  if (deviceType === 'tool' || deviceType === 'gripper') return 'Manipulation';
  return 'Manipulation';
}

function mapDeviceTypeToEquipment(
  deviceType: string,
  mountPosition: string,
  interfaceType: string,
): { equipmentKind: string; equipmentSummary: string } {
  const mount = mountPosition || '—';
  const iface = interfaceType || '—';
  switch (deviceType) {
    case 'camera':
      return {
        equipmentKind: 'RGB-D camera',
        equipmentSummary: `Vision sensor · mount: ${mount} · interface: ${iface} · RFM extrinsics stub on registration (dummy).`,
      };
    case 'sensor':
      return {
        equipmentKind: 'Sensor',
        equipmentSummary: `Auxiliary sensing · mount: ${mount} · interface: ${iface} · fused in RFM state topics (dummy).`,
      };
    case 'tool':
      return {
        equipmentKind: 'Tool',
        equipmentSummary: `Generic tool / adapter · mount: ${mount} · interface: ${iface} · attach under tool0 in RFM graph (dummy).`,
      };
    default:
      return {
        equipmentKind: 'Gripper / handle',
        equipmentSummary: `End effector · mount: ${mount} · interface: ${iface} · manipulation handle role for teleop bundles (dummy).`,
      };
  }
}

export interface CreateRobotDeviceModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateRobotDeviceModal({ open, onClose, onCreated }: CreateRobotDeviceModalProps) {
  const { t } = useLocale();
  const { message } = App.useApp();
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) return;
    const models = getSupportDefinitionModelsMock();
    form.resetFields();
    form.setFieldsValue({
      deviceType: 'gripper',
      compatibleModels: models.slice(0, 2).map((m) => m.id),
      mountPosition: 'flange',
      interfaceType: 'Ethernet',
    });
  }, [open, form]);

  const modelOptions = getSupportDefinitionModelsMock().map((m) => ({ value: m.id, label: m.name }));

  const submit = async () => {
    try {
      const values = await form.validateFields();
      const today = new Date().toISOString().slice(0, 10);
      const deviceType = String(values.deviceType);
      const mount = String(values.mountPosition ?? '');
      const iface = String(values.interfaceType ?? '');
      const eq = mapDeviceTypeToEquipment(deviceType, mount, iface);
      const row: SupportDefinitionDeviceDto = {
        kind: 'device',
        id: `dev-rfm-${Date.now()}`,
        name: String(values.deviceName).trim(),
        version: String(values.interfaceType ?? 'rev-a'),
        deviceClass: mapDeviceTypeToClass(deviceType),
        equipmentKind: eq.equipmentKind,
        equipmentSummary: eq.equipmentSummary,
        projectName: 'RFM Platform',
        subtitle: String(values.description ?? '').trim().slice(0, 200) || `${deviceType} · ${String(values.mountPosition ?? '')}`,
        updatedAt: today,
      };
      prependSupportDefinitionDevice(row);
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
      title={t('support.robot.create.device.title')}
      onCancel={onClose}
      onPrimaryClick={() => void submit()}
    >
      <Form form={form} layout="vertical" requiredMark="optional">
        <div className="sim-create-modal__section">
          <Typography.Title level={5} className="sim-create-modal__section-title">
            {t('support.robot.create.device.section.basic')}
          </Typography.Title>
          <SimFormField name="deviceName" label={t('support.robot.create.device.field.name')} rules={[{ required: true, message: t('support.sim.create.validation.name') }]}>
            <Input allowClear />
          </SimFormField>
          <SimFormField name="deviceType" label={t('support.robot.create.device.field.deviceType')} rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'gripper', label: t('support.robot.create.device.type.gripper') },
                { value: 'camera', label: t('support.robot.create.device.type.camera') },
                { value: 'sensor', label: t('support.robot.create.device.type.sensor') },
                { value: 'tool', label: t('support.robot.create.device.type.tool') },
              ]}
            />
          </SimFormField>
          <SimFormField name="description" label={t('support.sim.create.asset.field.description')}>
            <Input.TextArea rows={2} allowClear />
          </SimFormField>
        </div>

        <div className="sim-create-modal__section">
          <Typography.Title level={5} className="sim-create-modal__section-title">
            {t('support.robot.create.device.section.mount')}
          </Typography.Title>
          <SimFormField
            name="compatibleModels"
            label={t('support.robot.create.device.field.compatibleModels')}
            rules={[{ type: 'array', min: 1, required: true, message: t('support.sim.create.validation.minSelect') }]}
          >
            <Select mode="multiple" options={modelOptions} optionFilterProp="label" placeholder={t('support.sim.create.config.placeholder.multi')} />
          </SimFormField>
          <SimFormField name="mountPosition" label={t('support.robot.create.device.field.mountPosition')}>
            <Select
              allowClear
              options={[
                { value: 'flange', label: 'TCP flange' },
                { value: 'wrist', label: 'Wrist side' },
                { value: 'base', label: 'Base link' },
                { value: 'custom', label: t('support.sim.compose.type.custom') },
              ]}
            />
          </SimFormField>
        </div>

        <div className="sim-create-modal__section">
          <Typography.Title level={5} className="sim-create-modal__section-title">
            {t('support.robot.create.device.section.spec')}
          </Typography.Title>
          <SimFormField name="weightKg" label={t('support.robot.create.device.field.weight')}>
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} addonAfter="kg" />
          </SimFormField>
          <SimFormField name="powerW" label={t('support.robot.create.device.field.power')}>
            <InputNumber min={0} step={1} style={{ width: '100%' }} addonAfter="W" />
          </SimFormField>
          <SimFormField name="interfaceType" label={t('support.robot.create.device.field.interfaceType')} rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'USB', label: 'USB' },
                { value: 'Ethernet', label: 'Ethernet' },
                { value: 'CAN', label: 'CAN' },
                { value: 'EtherCAT', label: 'EtherCAT' },
              ]}
            />
          </SimFormField>
        </div>

        <div className="sim-create-modal__section">
          <Typography.Title level={5} className="sim-create-modal__section-title">
            {t('support.robot.create.device.section.files')}
          </Typography.Title>
          <SimFormField name="specFile" label={t('support.robot.create.device.field.specFile')} valuePropName="fileList" getValueFromEvent={normFile}>
            <Upload.Dragger maxCount={3} beforeUpload={() => false} accept=".pdf,.yaml,.json">
              <Typography.Paragraph style={{ marginBottom: 0 }}>{t('support.robot.create.device.specUploadHint')}</Typography.Paragraph>
            </Upload.Dragger>
          </SimFormField>
          <SimFormField name="imageFile" label={t('support.sim.create.asset.field.preview')} valuePropName="fileList" getValueFromEvent={normFile}>
            <Upload.Dragger maxCount={1} beforeUpload={() => false} accept="image/*">
              <Typography.Paragraph style={{ marginBottom: 0 }}>{t('support.sim.create.asset.previewHint')}</Typography.Paragraph>
            </Upload.Dragger>
          </SimFormField>
        </div>
      </Form>
    </SimulationCreateModalShell>
  );
}
