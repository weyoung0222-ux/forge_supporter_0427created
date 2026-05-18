import { FileOutlined, PartitionOutlined } from '@ant-design/icons';
import { App, Form, Input, Select, Tabs, Typography, Upload } from 'antd';
import type { UploadFile } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { DeviceCatalogType, SupportDefinitionDeviceDto } from '../../../mocks/supportDefinitionMock';
import { isDuplicateRobotDevice, prependSupportDefinitionDevice } from '../../../mocks/supportDefinitionMock';
import { useLocale } from '../../../shared/i18n/LocaleProvider';
import { SimFormField } from '../simulation/create/SimFormField';
import type { StepDef } from '../simulation/create/CreateStepModalShell';
import { CreateStepModalShell } from '../simulation/create/CreateStepModalShell';
import '../simulation/create/simulation-create-modals.css';
import { normFile, normImageUpload, ROBOT_CREATE_MODAL_WIDTH } from './robotCreateModalUtils';

const TOTAL_STEPS = 3;

const DEVICE_DEMO_JOINTS = [
  { name: 'device_base → link_1', type: 'fixed' },
  { name: 'link_1 → link_2', type: 'revolute' },
  { name: 'link_2 → tcp', type: 'revolute' },
];

const SUBTYPE_VALUES: Record<DeviceCatalogType, string[]> = {
  camera: ['rgbd', 'mono_rgb', 'stereo_rgb'],
  hand: ['dexterous_hand', 'underactuated_hand'],
  gripper: ['parallel_gripper', 'angular_gripper', 'vacuum_gripper'],
  lidar: ['spinning_2d', 'solid_state_flash', 'multichannel'],
};

function mapCatalogToDeviceClass(dt: DeviceCatalogType): SupportDefinitionDeviceDto['deviceClass'] {
  if (dt === 'camera' || dt === 'lidar') return 'Sensing';
  return 'Manipulation';
}

function mapSubtypeToEquipmentKind(subtype: string): string {
  const map: Record<string, string> = {
    rgbd: 'RGB-D camera',
    mono_rgb: 'RGB camera',
    stereo_rgb: 'Stereo RGB camera',
    dexterous_hand: 'Dexterous hand',
    underactuated_hand: 'Underactuated hand',
    parallel_gripper: 'Parallel gripper',
    angular_gripper: 'Angular gripper',
    vacuum_gripper: 'Vacuum gripper',
    spinning_2d: '2D spinning LiDAR',
    solid_state_flash: 'Solid-state flash LiDAR',
    multichannel: 'Multi-channel LiDAR',
  };
  return map[subtype] ?? subtype;
}

const FIELDS_PER_STEP: Record<number, string[]> = {
  0: ['manufacturer', 'modelName', 'modelVariant', 'displayName', 'description', 'previewImage'],
  1: ['deviceCatalogType', 'deviceSubtype'],
  2: [],
};

export interface CreateRobotDeviceModalProps {
  open?: boolean;
  onClose: () => void;
  onCreated: () => void;
  layout?: 'modal' | 'page';
}

export function CreateRobotDeviceModal({ open = true, onClose, onCreated, layout = 'modal' }: CreateRobotDeviceModalProps) {
  const { t } = useLocale();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [duplicateError, setDuplicateError] = useState(false);
  const [urdfFiles, setUrdfFiles] = useState<UploadFile[]>([]);

  const deviceCatalogType = Form.useWatch('deviceCatalogType', form) as DeviceCatalogType | undefined;

  useEffect(() => {
    if (layout === 'modal' && !open) return;
    form.resetFields();
    form.setFieldsValue({
      deviceCatalogType: 'gripper',
      deviceSubtype: 'parallel_gripper',
    });
    setCurrentStep(0);
    setDuplicateError(false);
    setUrdfFiles([]);
  }, [open, layout, form]);

  useEffect(() => {
    if ((layout === 'modal' && !open) || !deviceCatalogType) return;
    const allowed = SUBTYPE_VALUES[deviceCatalogType] ?? [];
    const cur = form.getFieldValue('deviceSubtype') as string | undefined;
    if (!allowed.includes(String(cur ?? ''))) {
      form.setFieldsValue({ deviceSubtype: allowed[0] });
    }
  }, [open, layout, deviceCatalogType, form]);

  const checkDuplicate = useCallback(() => {
    const mfr = String(form.getFieldValue('manufacturer') ?? '').trim();
    const mn = String(form.getFieldValue('modelName') ?? '').trim();
    const mv = String(form.getFieldValue('modelVariant') ?? '').trim();
    if (mfr && mn && mv) {
      setDuplicateError(isDuplicateRobotDevice(mfr, mn, mv));
    } else {
      setDuplicateError(false);
    }
  }, [form]);

  const subtypeOptions = useMemo(() => {
    const cat = deviceCatalogType ?? 'gripper';
    return (SUBTYPE_VALUES[cat] ?? []).map((value) => ({
      value,
      label: t(`support.robot.create.device.subtype.${value}`),
    }));
  }, [deviceCatalogType, t]);

  const catalogTypeOptions = useMemo(
    () =>
      (['camera', 'hand', 'gripper', 'lidar'] as const).map((value) => ({
        value,
        label: t(`support.robot.create.device.catalogType.${value}`),
      })),
    [t],
  );

  const steps: StepDef[] = useMemo(
    () => [
      { title: t('support.robot.create.device.step.basic') },
      { title: t('support.robot.create.device.step.classify') },
      { title: t('support.robot.create.device.step.urdf') },
    ],
    [t],
  );

  const handleNext = useCallback(async () => {
    try {
      await form.validateFields(FIELDS_PER_STEP[currentStep]);
      if (currentStep === 0 && duplicateError) return;
      setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
    } catch {
      /* validation */
    }
  }, [currentStep, duplicateError, form]);

  const handlePrev = useCallback(() => {
    setCurrentStep((s) => Math.max(0, s - 1));
  }, []);

  const submit = async () => {
    try {
      const values = await form.validateFields();
      const today = new Date().toISOString().slice(0, 10);
      const manufacturer = String(values.manufacturer).trim();
      const modelName = String(values.modelName).trim();
      const modelVariant = String(values.modelVariant ?? '').trim();
      const displayName = String(values.displayName ?? '').trim();
      const description = String(values.description ?? '').trim();
      const cat = values.deviceCatalogType as DeviceCatalogType;
      const subtype = String(values.deviceSubtype);
      const equipmentKind = mapSubtypeToEquipmentKind(subtype);
      const cardName = displayName || `${manufacturer} ${modelName}`.trim();

      const row: SupportDefinitionDeviceDto = {
        kind: 'device',
        id: `dev-rfm-${Date.now()}`,
        name: cardName,
        version: 'v0.1.0',
        deviceClass: mapCatalogToDeviceClass(cat),
        equipmentKind,
        equipmentSummary: `${equipmentKind} · ${t(`support.robot.create.device.catalogType.${cat}`)} / ${t(`support.robot.create.device.subtype.${subtype}`)} · ${description.slice(0, 120) || 'RFM device definition (prototype).'}`,
        projectName: 'RFM Platform',
        subtitle: description.slice(0, 200) || `${modelName} · ${modelVariant}`,
        updatedAt: today,
        manufacturer,
        modelName,
        modelVariant,
        displayName: displayName || cardName,
        description,
        deviceCatalogType: cat,
        deviceSubtype: subtype,
      };
      prependSupportDefinitionDevice(row);
      message.success(t('support.sim.create.success'));
      onCreated();
      onClose();
    } catch {
      /* validation */
    }
  };

  const urdfPreviewContent = useMemo(() => {
    if (urdfFiles.length === 0) return null;
    return (
      <div className="urdf-preview">
        <Tabs
          size="small"
          items={[
            {
              key: 'files',
              label: (
                <span>
                  <FileOutlined style={{ marginRight: 4 }} />
                  {t('support.robot.create.model.urdfPreview.files')}
                </span>
              ),
              children: (
                <ul className="urdf-preview__list">
                  {urdfFiles.map((f) => (
                    <li key={f.uid} className="urdf-preview__list-item">
                      {f.name}
                    </li>
                  ))}
                </ul>
              ),
            },
            {
              key: 'joints',
              label: (
                <span>
                  <PartitionOutlined style={{ marginRight: 4 }} />
                  {t('support.robot.create.model.urdfPreview.joints')}
                </span>
              ),
              children: (
                <ul className="urdf-preview__list">
                  {DEVICE_DEMO_JOINTS.map((j) => (
                    <li key={j.name} className="urdf-preview__list-item">
                      <span>{j.name}</span>
                      <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                        {j.type}
                      </Typography.Text>
                    </li>
                  ))}
                </ul>
              ),
            },
          ]}
        />
      </div>
    );
  }, [urdfFiles, t]);

  return (
    <CreateStepModalShell
      layout={layout}
      open={open}
      modalWidth={ROBOT_CREATE_MODAL_WIDTH}
      title={t('support.robot.create.device.title')}
      onCancel={onClose}
      onSubmit={() => void submit()}
      steps={steps}
      currentStep={currentStep}
      onPrev={handlePrev}
      onNext={handleNext}
      nextDisabled={currentStep === 0 && duplicateError}
    >
      <Form form={form} layout="vertical" requiredMark>
        <div style={{ display: currentStep === 0 ? undefined : 'none' }}>
          <div className="sim-create-modal__section">
            <Typography.Title level={5} className="sim-create-modal__section-title">
              {t('support.robot.create.device.section.basic')}
            </Typography.Title>

            {duplicateError ? (
              <Typography.Paragraph type="danger" style={{ fontSize: 13, marginBottom: 12 }}>
                {t('support.robot.create.device.duplicateError')}
              </Typography.Paragraph>
            ) : null}

            <SimFormField
              name="manufacturer"
              label={t('support.robot.create.model.field.manufacturer')}
              rules={[{ required: true, message: t('support.sim.create.validation.name') }]}
            >
              <Input allowClear onBlur={checkDuplicate} />
            </SimFormField>
            <SimFormField
              name="modelName"
              label={t('support.robot.create.model.field.modelName')}
              rules={[{ required: true, message: t('support.sim.create.validation.name') }]}
            >
              <Input allowClear onBlur={checkDuplicate} />
            </SimFormField>
            <SimFormField
              name="modelVariant"
              label={t('support.robot.create.model.field.modelVariant')}
              rules={[{ required: true, message: t('support.sim.create.validation.name') }]}
            >
              <Input allowClear onBlur={checkDuplicate} />
            </SimFormField>
            <SimFormField name="displayName" label={t('support.robot.create.model.field.displayName')}>
              <Input allowClear />
            </SimFormField>
            <SimFormField name="description" label={t('support.sim.create.asset.field.description')}>
              <Input.TextArea rows={3} allowClear />
            </SimFormField>
            <SimFormField name="previewImage" label={t('support.robot.create.model.field.previewImage')} valuePropName="fileList" getValueFromEvent={normImageUpload}>
              <Upload.Dragger
                className="sim-create-modal__image-upload"
                listType="picture"
                maxCount={1}
                beforeUpload={() => false}
                accept="image/*"
              >
                <Typography.Paragraph style={{ marginBottom: 0 }}>{t('support.robot.create.model.field.previewImageHint')}</Typography.Paragraph>
              </Upload.Dragger>
            </SimFormField>
          </div>
        </div>

        <div style={{ display: currentStep === 1 ? undefined : 'none' }}>
          <div className="sim-create-modal__section">
            <Typography.Title level={5} className="sim-create-modal__section-title">
              {t('support.robot.create.device.section.classify')}
            </Typography.Title>
            <SimFormField name="deviceCatalogType" label={t('support.robot.create.device.field.deviceCatalogType')} rules={[{ required: true }]}>
              <Select options={catalogTypeOptions} />
            </SimFormField>
            <SimFormField name="deviceSubtype" label={t('support.robot.create.device.field.deviceSubtype')} rules={[{ required: true }]}>
              <Select options={subtypeOptions} />
            </SimFormField>
          </div>
        </div>

        <div style={{ display: currentStep === 2 ? undefined : 'none' }}>
          <div className="sim-create-modal__section">
            <Typography.Title level={5} className="sim-create-modal__section-title">
              {t('support.robot.create.device.section.urdf')}
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 12, fontSize: 13 }}>
              {t('support.robot.create.device.urdfOptionalLead')}
            </Typography.Paragraph>
            <SimFormField name="urdfFile" label={t('support.robot.create.device.field.urdfPackage')} valuePropName="fileList" getValueFromEvent={normFile}>
              <Upload.Dragger
                maxCount={8}
                multiple
                beforeUpload={() => false}
                accept=".urdf,.xacro,.usd,.usda,.stl,.dae"
                onChange={(info) => setUrdfFiles(info.fileList)}
              >
                <Typography.Paragraph style={{ marginBottom: 0 }}>{t('support.robot.create.model.field.urdfUploadHint')}</Typography.Paragraph>
              </Upload.Dragger>
            </SimFormField>
            {urdfPreviewContent}
          </div>
        </div>
      </Form>
    </CreateStepModalShell>
  );
}
