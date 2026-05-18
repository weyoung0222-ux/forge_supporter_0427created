import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { App, Button, Form, Input, Radio, Select, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useMemo, useState } from 'react';
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
import { CreateStepModalShell } from '../simulation/create/CreateStepModalShell';
import '../simulation/create/simulation-create-modals.css';
import { ROBOT_CREATE_MODAL_WIDTH } from './robotCreateModalUtils';

function shortDeviceLabel(name: string): string {
  return name.replace(/_/g, ' ').split(' ').slice(-3).join(' ');
}

/** Demo extract: robot URDF file rows + joint metadata (prototype). */
const DEMO_ROBOT_URDF_JOINT_ROWS: {
  key: string;
  sourceFile: string;
  joint: string;
  jointType: string;
  movable: boolean;
}[] = [
  { key: 'j1', sourceFile: 'robot.urdf.xacro', joint: 'base_link → shoulder_link', jointType: 'revolute', movable: false },
  { key: 'j2', sourceFile: 'robot.urdf.xacro', joint: 'shoulder_link → upper_arm_link', jointType: 'revolute', movable: true },
  { key: 'j3', sourceFile: 'robot.urdf.xacro', joint: 'upper_arm_link → forearm_link', jointType: 'revolute', movable: true },
  { key: 'j4', sourceFile: 'robot.urdf.xacro', joint: 'forearm_link → wrist_1_link', jointType: 'revolute', movable: true },
  { key: 'j5', sourceFile: 'robot.urdf.xacro', joint: 'wrist_1_link → wrist_2_link', jointType: 'revolute', movable: true },
  { key: 'j6', sourceFile: 'robot.urdf.xacro', joint: 'wrist_2_link → wrist_3_link', jointType: 'revolute', movable: true },
];

const TOTAL_STEPS = 4;

export interface CreateRobotCompositionModalProps {
  open?: boolean;
  onClose: () => void;
  onCreated: () => void;
  layout?: 'modal' | 'page';
}

export function CreateRobotCompositionModal({ open = true, onClose, onCreated, layout = 'modal' }: CreateRobotCompositionModalProps) {
  const { t } = useLocale();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);

  const modelOptions = useMemo(() => getSupportDefinitionModelsMock().map((m) => ({ value: m.id, label: m.name })), []);
  const deviceOpts = useMemo(() => getSupportDefinitionDevicesMock().map((d) => ({ value: d.id, label: d.name })), []);

  const modelId = Form.useWatch('modelId', form);
  const selectedModel = useMemo(() => (modelId ? getSupportDefinitionModelById(String(modelId)) : null), [modelId]);

  const modalitySuggestions = useMemo(() => {
    const fromModel = selectedModel?.modalitySchemas ?? [];
    const extra = ['joint_state', 'wrench', 'rgb', 'depth', 'point_cloud', 'odom', 'cmd_vel', 'lidar_scan', 'tactile'];
    return [...new Set([...fromModel, ...extra])].map((x) => ({ value: x, label: x }));
  }, [selectedModel]);

  const actionKeyOptions = useMemo(
    () =>
      (['pick', 'place', 'move_joints', 'gripper'] as const).map((k) => ({
        value: t(`support.robot.create.composition.actionKey.${k}`),
        label: t(`support.robot.create.composition.actionKey.${k}`),
      })),
    [t],
  );

  const jointTableColumns: ColumnsType<(typeof DEMO_ROBOT_URDF_JOINT_ROWS)[number]> = useMemo(
    () => [
      { title: t('support.robot.create.composition.step3.col.file'), dataIndex: 'sourceFile', key: 'sourceFile', width: 140 },
      { title: t('support.robot.create.composition.step3.col.joint'), dataIndex: 'joint', key: 'joint' },
      { title: t('support.robot.create.composition.step3.col.type'), dataIndex: 'jointType', key: 'jointType', width: 100 },
      {
        title: t('support.robot.create.composition.step3.col.movable'),
        dataIndex: 'movable',
        key: 'movable',
        width: 100,
        render: (v: boolean) => (v ? t('support.robot.create.composition.step3.movable.yes') : t('support.robot.create.composition.step3.movable.no')),
      },
    ],
    [t],
  );

  useEffect(() => {
    if (layout === 'modal' && !open) return;
    const models = getSupportDefinitionModelsMock();
    const first = models[0];
    form.resetFields();
    form.setFieldsValue({
      modelId: first?.id,
      deviceBindings: [],
      urdfMode: 'model',
      actionConfigKeys: [],
      modalitySchemas: [],
      modalityUrdfMapping: '',
    });
    setCurrentStep(0);
  }, [open, layout, form]);

  const steps = useMemo(
    () => [
      { title: t('support.robot.create.composition.section.step1') },
      { title: t('support.robot.create.composition.section.step2') },
      { title: t('support.robot.create.composition.section.step3') },
      { title: t('support.robot.create.composition.section.step4') },
    ],
    [t],
  );

  const fieldsForStep: Record<number, string[]> = {
    0: ['modelId', 'displayName', 'description'],
    1: [],
    2: ['urdfMode'],
    3: ['actionConfigKeys', 'modalitySchemas', 'modalityUrdfMapping'],
  };

  const goNext = async () => {
    try {
      if (currentStep === 1) {
        const bindings: { deviceId?: string; role?: string }[] = form.getFieldValue('deviceBindings') ?? [];
        const bad = bindings.some((b) => String(b?.role ?? '').trim() && !String(b?.deviceId ?? '').trim());
        if (bad) {
          message.error(t('support.robot.create.composition.step2.errorRoleWithoutDevice'));
          return;
        }
      }
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
      const modelId = String(values.modelId);
      const meta = getSupportDefinitionModelById(modelId);
      const bindings: { deviceId?: string; role?: string }[] = values.deviceBindings ?? [];
      const devices = bindings
        .filter((b) => String(b?.deviceId ?? '').trim())
        .map((b) => {
          const id = String(b.deviceId);
          const d = getSupportDefinitionDeviceById(id);
          const role = String(b.role ?? '').trim();
          return {
            id,
            shortName: d ? shortDeviceLabel(d.name) : id,
            deviceRole: role || undefined,
          };
        });

      const today = new Date().toISOString().slice(0, 10);
      const row: SupportCompositionDto = {
        id: `cp-rfm-${Date.now()}`,
        name: String(values.displayName).trim(),
        subtitle: String(values.description ?? '').trim().slice(0, 220) || 'Robot',
        projectName: 'RFM Platform',
        updatedAt: today,
        model: { id: modelId, name: meta?.name ?? modelId },
        devices,
        compatibilitySummary: '',
        urdfCompositionMode: values.urdfMode === 'applied' ? 'applied' : 'model',
        actionConfigKeys: (values.actionConfigKeys as string[]) ?? [],
        modalitySchemasSelected: (values.modalitySchemas as string[]) ?? [],
        modalityUrdfMappingNotes: String(values.modalityUrdfMapping ?? '').trim(),
      };
      prependSupportComposition(row);
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
      title={t('support.robot.create.composition.title')}
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
              {t('support.robot.create.composition.section.step1')}
            </Typography.Title>
            <SimFormField
              name="modelId"
              label={t('support.robot.create.composition.field.model')}
              rules={[{ required: true, message: t('support.sim.create.validation.minSelect') }]}
            >
              <Select showSearch optionFilterProp="label" options={modelOptions} />
            </SimFormField>
            {selectedModel ? (
              <Space direction="vertical" size={10} style={{ width: '100%' }}>
                <div>
                  <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
                    {t('support.robot.create.composition.modelCatalog.modality')}
                  </Typography.Text>
                  {(selectedModel.modalitySchemas?.length ?? 0) > 0 ? (
                    <Space wrap size={[6, 6]}>
                      {selectedModel.modalitySchemas!.map((s) => (
                        <Tag key={s}>{s}</Tag>
                      ))}
                    </Space>
                  ) : (
                    <Typography.Text type="secondary">{t('support.robot.create.composition.modelCatalog.empty')}</Typography.Text>
                  )}
                </div>
                <div>
                  <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
                    {t('support.robot.create.composition.modelCatalog.control')}
                  </Typography.Text>
                  {(selectedModel.controlMethods?.length ?? 0) > 0 ? (
                    <Space wrap size={[6, 6]}>
                      {selectedModel.controlMethods!.map((s) => (
                        <Tag key={s} color="blue">
                          {s}
                        </Tag>
                      ))}
                    </Space>
                  ) : (
                    <Typography.Text type="secondary">{t('support.robot.create.composition.modelCatalog.empty')}</Typography.Text>
                  )}
                </div>
              </Space>
            ) : null}
            <SimFormField
              name="displayName"
              label={t('support.robot.create.composition.field.displayName')}
              rules={[{ required: true, message: t('support.sim.create.validation.name') }]}
            >
              <Input allowClear autoComplete="off" />
            </SimFormField>
            <SimFormField name="description" label={t('support.robot.create.composition.field.description')}>
              <Input.TextArea rows={3} allowClear />
            </SimFormField>
          </div>
        </div>

        <div style={{ display: currentStep === 1 ? undefined : 'none' }}>
          <div className="sim-create-modal__section">
            <Typography.Title level={5} className="sim-create-modal__section-title">
              {t('support.robot.create.composition.section.step2')}
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
              {t('support.robot.create.composition.step2.lead')}
            </Typography.Paragraph>
            <Form.List name="deviceBindings">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field) => (
                    <Space key={field.key} align="baseline" wrap style={{ display: 'flex', marginBottom: 8 }}>
                      <Form.Item name={[field.name, 'deviceId']} style={{ minWidth: 220, marginBottom: 0 }}>
                        <Select allowClear options={deviceOpts} optionFilterProp="label" placeholder={t('support.robot.create.composition.field.device')} />
                      </Form.Item>
                      <Form.Item name={[field.name, 'role']} style={{ flex: 1, minWidth: 180, marginBottom: 0 }}>
                        <Input allowClear placeholder={t('support.robot.create.composition.deviceRole.placeholder')} />
                      </Form.Item>
                      <Button type="text" danger icon={<MinusCircleOutlined aria-hidden />} onClick={() => remove(field.name)}>
                        {t('support.robot.create.composition.step2.removeRow')}
                      </Button>
                    </Space>
                  ))}
                  <Button type="dashed" onClick={() => add()} icon={<PlusOutlined aria-hidden />} block>
                    {t('support.robot.create.composition.step2.addRow')}
                  </Button>
                </>
              )}
            </Form.List>
          </div>
        </div>

        <div style={{ display: currentStep === 2 ? undefined : 'none' }}>
          <div className="sim-create-modal__section">
            <Typography.Title level={5} className="sim-create-modal__section-title">
              {t('support.robot.create.composition.section.step3')}
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
              {t('support.robot.create.composition.step3.lead')}
            </Typography.Paragraph>
            <SimFormField
              name="urdfMode"
              label={t('support.robot.create.composition.field.urdfMode')}
              rules={[{ required: true, message: t('support.sim.create.validation.minSelect') }]}
            >
              <Radio.Group>
                <Space direction="vertical">
                  <Radio value="model">{t('support.robot.create.composition.urdfMode.model')}</Radio>
                  <Radio value="applied">{t('support.robot.create.composition.urdfMode.applied')}</Radio>
                </Space>
              </Radio.Group>
            </SimFormField>
            <Typography.Title level={5} className="sim-create-modal__section-title" style={{ marginTop: 16 }}>
              {t('support.robot.create.composition.step3.jointRefTitle')}
            </Typography.Title>
            <Table size="small" pagination={false} rowKey="key" dataSource={DEMO_ROBOT_URDF_JOINT_ROWS} columns={jointTableColumns} />
          </div>
        </div>

        <div style={{ display: currentStep === 3 ? undefined : 'none' }}>
          <div className="sim-create-modal__section">
            <Typography.Title level={5} className="sim-create-modal__section-title">
              {t('support.robot.create.composition.section.step4')}
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
              {t('support.robot.create.composition.step4.lead')}
            </Typography.Paragraph>
            <SimFormField
              name="actionConfigKeys"
              label={t('support.robot.create.composition.field.actionConfigKeys')}
              rules={[
                { type: 'array', min: 1, required: true, message: t('support.sim.create.validation.minSelect') },
              ]}
            >
              <Select mode="tags" style={{ width: '100%' }} options={actionKeyOptions} tokenSeparators={[',']} />
            </SimFormField>
            <SimFormField
              name="modalitySchemas"
              label={t('support.robot.create.composition.field.modalitySchemas')}
              rules={[
                { type: 'array', min: 1, required: true, message: t('support.sim.create.validation.minSelect') },
              ]}
            >
              <Select mode="tags" style={{ width: '100%' }} options={modalitySuggestions} tokenSeparators={[',']} />
            </SimFormField>
            <SimFormField
              name="modalityUrdfMapping"
              label={t('support.robot.create.composition.field.modalityUrdfMapping')}
              rules={[
                { required: true, message: t('support.robot.create.composition.validation.mappingMin') },
                { min: 8, message: t('support.robot.create.composition.validation.mappingMin') },
              ]}
            >
              <Input.TextArea rows={5} allowClear placeholder={t('support.robot.create.composition.field.modalityUrdfMapping')} />
            </SimFormField>
          </div>
        </div>
      </Form>
    </CreateStepModalShell>
  );
}
