import { FileOutlined, PartitionOutlined } from '@ant-design/icons';
import { App, Button, Card, Col, Form, Input, InputNumber, Modal, Row, Select, Tabs, Typography, Upload } from 'antd';
import type { UploadFile } from 'antd';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import type { SupportDefinitionModelDto } from '../../../mocks/supportDefinitionMock';
import { isDuplicateRobotModel, prependSupportDefinitionModel } from '../../../mocks/supportDefinitionMock';
import { useLocale } from '../../../shared/i18n/LocaleProvider';
import { SimFormField } from '../simulation/create/SimFormField';
import '../simulation/create/simulation-create-modals.css';
import { normFile, normImageUpload, ROBOT_CREATE_MODAL_WIDTH } from './robotCreateModalUtils';

const SENSOR_SUGGESTIONS = ['Force/Torque', 'IMU', 'Encoder', 'RGB Camera', 'RGB-D Camera', 'LiDAR', 'GPS', 'Proximity', 'Tactile'];
const MODALITY_SUGGESTIONS = ['joint_state', 'wrench', 'imu', 'rgb', 'depth', 'point_cloud', 'odom', 'cmd_vel', 'lidar_scan', 'tactile'];
const CONTROL_METHOD_SUGGESTIONS = ['position', 'velocity', 'torque', 'impedance', 'admittance', 'trajectory', 'force'];

const DEMO_JOINTS = [
  { name: 'base_link → shoulder_link', type: 'revolute' },
  { name: 'shoulder_link → upper_arm_link', type: 'revolute' },
  { name: 'upper_arm_link → forearm_link', type: 'revolute' },
  { name: 'forearm_link → wrist_1_link', type: 'revolute' },
  { name: 'wrist_1_link → wrist_2_link', type: 'revolute' },
  { name: 'wrist_2_link → wrist_3_link', type: 'revolute' },
];

const TOTAL_STEPS = 3;

function mapFormFactorToSource(ff: string): SupportDefinitionModelDto['source'] {
  if (ff === 'mobileManipulator' || ff === 'legged') return 'Simulation';
  if (ff === 'humanoid') return 'Registry';
  return 'Training';
}

export interface CreateRobotModelModalProps {
  open?: boolean;
  onClose: () => void;
  onCreated: () => void;
  /** Inline drill-in page (no dialog). */
  layout?: 'modal' | 'page';
}

export function CreateRobotModelModal({ open = true, onClose, onCreated, layout = 'modal' }: CreateRobotModelModalProps) {
  const { t } = useLocale();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [duplicateError, setDuplicateError] = useState(false);
  const [urdfFiles, setUrdfFiles] = useState<UploadFile[]>([]);

  const previewImageList = Form.useWatch('previewImage', form) as UploadFile[] | undefined;
  const hasPreviewImage = (previewImageList?.length ?? 0) > 0;

  useEffect(() => {
    if (layout === 'modal' && !open) return;
    form.resetFields();
    form.setFieldsValue({
      formFactor: 'singleArm',
      locomotionType: 'fixedBase',
      manipulatorStructure: 'serial',
      dof: 6,
      defaultSensors: [],
      modalitySchemas: [],
      controlMethods: [],
    });
    setCurrentStep(0);
    setDuplicateError(false);
    setUrdfFiles([]);
  }, [open, layout, form]);

  const stepItems = useMemo(
    () => [
      { title: t('support.robot.create.model.step.basic') },
      { title: t('support.robot.create.model.step.classify') },
      { title: t('support.robot.create.model.step.refAsset') },
    ],
    [t],
  );

  const fieldsForStep: Record<number, string[]> = {
    0: ['manufacturer', 'modelName', 'modelVariant', 'name', 'description', 'previewImage'],
    1: ['formFactor', 'locomotionType', 'manipulatorStructure', 'dof', 'payloadKg', 'reachMm', 'weightKg', 'repeatabilityMm', 'defaultSensors'],
    2: [],
  };

  const checkDuplicate = useCallback(() => {
    const mfr = String(form.getFieldValue('manufacturer') ?? '').trim();
    const mn = String(form.getFieldValue('modelName') ?? '').trim();
    const mv = String(form.getFieldValue('modelVariant') ?? '').trim();
    if (mfr && mn && mv) {
      setDuplicateError(isDuplicateRobotModel(mfr, mn, mv));
    } else {
      setDuplicateError(false);
    }
  }, [form]);

  const goNext = async () => {
    try {
      await form.validateFields(fieldsForStep[currentStep]);
      if (currentStep === 0 && duplicateError) return;
      setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
    } catch {
      /* validation errors shown inline */
    }
  };

  const goPrev = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    try {
      const values = await form.validateFields();
      const today = new Date().toISOString().slice(0, 10);
      const ff = String(values.formFactor);
      const row: SupportDefinitionModelDto = {
        kind: 'model',
        id: `mdl-rfm-${Date.now()}`,
        name: String(values.name).trim(),
        manufacturer: String(values.manufacturer).trim(),
        modelName: String(values.modelName).trim(),
        modelVariant: String(values.modelVariant ?? '').trim(),
        displayName: String(values.name).trim(),
        description: String(values.description ?? '').trim(),
        version: 'v0.1.0',
        source: mapFormFactorToSource(ff),
        projectName: 'RFM Platform',
        subtitle: String(values.description ?? '').trim().slice(0, 200) || `Robot model (${ff})`,
        updatedAt: today,
        formFactor: values.formFactor,
        locomotionType: values.locomotionType,
        manipulatorStructure: values.manipulatorStructure,
        dof: values.dof,
        payloadKg: values.payloadKg,
        reachMm: values.reachMm,
        weightKg: values.weightKg,
        repeatabilityMm: values.repeatabilityMm,
        defaultSensors: values.defaultSensors,
        modalitySchemas: values.modalitySchemas,
        controlMethods: values.controlMethods,
      };
      prependSupportDefinitionModel(row);
      message.success(t('support.sim.create.success'));
      onCreated();
      onClose();
    } catch {
      /* validation */
    }
  };

  const isLast = currentStep === TOTAL_STEPS - 1;
  const stepNavAriaLabel = 'Data Foundry job steps';

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
                <span><FileOutlined style={{ marginRight: 4 }} />{t('support.robot.create.model.urdfPreview.files')}</span>
              ),
              children: (
                <ul className="urdf-preview__list">
                  {urdfFiles.map((f) => (
                    <li key={f.uid} className="urdf-preview__list-item">{f.name}</li>
                  ))}
                </ul>
              ),
            },
            {
              key: 'joints',
              label: (
                <span><PartitionOutlined style={{ marginRight: 4 }} />{t('support.robot.create.model.urdfPreview.joints')}</span>
              ),
              children: (
                <ul className="urdf-preview__list">
                  {DEMO_JOINTS.map((j) => (
                    <li key={j.name} className="urdf-preview__list-item">
                      <span>{j.name}</span>
                      <Typography.Text type="secondary" style={{ fontSize: 11 }}>{j.type}</Typography.Text>
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

  const stepBox = (
    <div className="sim-create-modal__step-box">
      {stepItems.map((item, idx) => {
        const status = idx < currentStep ? 'finish' : idx === currentStep ? 'process' : 'wait';
        return (
          <div className="sim-step-row" key={idx}>
            {idx > 0 && <div className={`sim-step-connector sim-step-connector--${idx <= currentStep ? 'done' : 'pending'}`} />}
            <div className={`sim-step-item sim-step-item--${status}`}>
              <span className="sim-step-item__icon">{idx < currentStep ? '✓' : idx + 1}</span>
              <span className="sim-step-item__title">{item.title}</span>
            </div>
          </div>
        );
      })}
    </div>
  );

  const pageStepStrip = (
    <div className="domain-job-step-strip-box">
      <div className="domain-job-step-strip-center">
        <nav className="domain-job-step-strip-indicator" aria-label={stepNavAriaLabel}>
          <div className="domain-job-step-strip-indicator-list" role="list">
            {stepItems.map((item, idx) => {
              const status = idx < currentStep ? 'is-done' : idx === currentStep ? 'is-active' : 'is-upcoming';
              const labelClassName = [
                'domain-job-step-strip-indicator-label',
                'ant-typography',
                status === 'is-upcoming' ? 'ant-typography-secondary' : '',
              ]
                .filter(Boolean)
                .join(' ');
              return (
                <Fragment key={`step-frag-${idx}`}>
                  <button type="button" role="listitem" className={`domain-job-step-strip-indicator-item ${status}`}>
                    <span className="domain-job-step-strip-indicator-badge">{idx < currentStep ? '✓' : idx + 1}</span>
                    <span className={labelClassName}>
                      {idx === currentStep ? <strong>{item.title}</strong> : item.title}
                    </span>
                  </button>
                  {idx < stepItems.length - 1 ? (
                    <span className="domain-job-step-strip-indicator-connector" aria-hidden="true" />
                  ) : null}
                </Fragment>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );

  const wizardForm = (
    <Form form={form} layout="vertical" requiredMark>
          {/* Step 1: Basic Information */}
          <div style={{ display: currentStep === 0 ? undefined : 'none' }}>
            <div className="sim-create-modal__section">
              {duplicateError && (
                <Typography.Paragraph type="danger" style={{ fontSize: 13, marginBottom: 12 }}>
                  {t('support.robot.create.model.duplicateError')}
                </Typography.Paragraph>
              )}

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
              <SimFormField
                name="name"
                label={t('support.robot.create.model.field.name')}
                rules={[{ required: true, message: t('support.sim.create.validation.name') }]}
              >
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
                  openFileDialogOnClick={!hasPreviewImage}
                  beforeUpload={() => {
                    const list = (form.getFieldValue('previewImage') as UploadFile[] | undefined) ?? [];
                    if (list.length >= 1) {
                      return Upload.LIST_IGNORE;
                    }
                    return false;
                  }}
                  accept="image/*"
                >
                  {!hasPreviewImage ? (
                    <Typography.Paragraph style={{ marginBottom: 0 }}>{t('support.robot.create.model.field.previewImageHint')}</Typography.Paragraph>
                  ) : null}
                </Upload.Dragger>
              </SimFormField>
            </div>
          </div>

          {/* Step 2: Classification & Specs — two-panel layout (Data Register parity) */}
          <div style={{ display: currentStep === 1 ? undefined : 'none' }}>
            <Row gutter={[24, 24]} className="robot-create-classify-split-row">
              <Col xs={24} lg={9}>
                <Card bordered size="small" className="robot-create-classify-split-panel" title={t('support.robot.create.model.section.classify')}>
              <SimFormField name="formFactor" label={t('support.robot.create.model.field.formFactor')} rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: 'singleArm', label: t('support.robot.create.model.formFactor.singleArm') },
                    { value: 'dualArm', label: t('support.robot.create.model.formFactor.dualArm') },
                    { value: 'mobileManipulator', label: t('support.robot.create.model.formFactor.mobileManipulator') },
                    { value: 'legged', label: t('support.robot.create.model.formFactor.legged') },
                    { value: 'humanoid', label: t('support.robot.create.model.formFactor.humanoid') },
                  ]}
                />
              </SimFormField>
              <SimFormField name="locomotionType" label={t('support.robot.create.model.field.locomotionType')} rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: 'fixedBase', label: t('support.robot.create.model.locomotionType.fixedBase') },
                    { value: 'wheeled', label: t('support.robot.create.model.locomotionType.wheeled') },
                    { value: 'tracked', label: t('support.robot.create.model.locomotionType.tracked') },
                    { value: 'legged', label: t('support.robot.create.model.locomotionType.legged') },
                    { value: 'flying', label: t('support.robot.create.model.locomotionType.flying') },
                  ]}
                />
              </SimFormField>
              <SimFormField name="manipulatorStructure" label={t('support.robot.create.model.field.manipulatorStructure')}>
                <Select
                  allowClear
                  options={[
                    { value: 'serial', label: t('support.robot.create.model.manipulatorStructure.serial') },
                    { value: 'parallel', label: t('support.robot.create.model.manipulatorStructure.parallel') },
                    { value: 'scara', label: t('support.robot.create.model.manipulatorStructure.scara') },
                    { value: 'delta', label: t('support.robot.create.model.manipulatorStructure.delta') },
                    { value: 'cableDriven', label: t('support.robot.create.model.manipulatorStructure.cableDriven') },
                  ]}
                />
              </SimFormField>
                </Card>
              </Col>
              <Col xs={24} lg={15}>
                <Card bordered size="small" className="robot-create-classify-split-panel" title={t('support.robot.create.model.section.specs')}>
                  <SimFormField name="dof" label={t('support.robot.create.model.field.dof')} rules={[{ required: true }]}>
                    <InputNumber min={0} max={128} style={{ width: '100%' }} />
                  </SimFormField>
                  <SimFormField name="payloadKg" label={t('support.robot.create.model.field.payloadKg')}>
                    <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
                  </SimFormField>
                  <SimFormField name="reachMm" label={t('support.robot.create.model.field.reachMm')}>
                    <InputNumber min={0} step={1} style={{ width: '100%' }} />
                  </SimFormField>
                  <SimFormField name="weightKg" label={t('support.robot.create.model.field.weightKg')}>
                    <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
                  </SimFormField>
                  <SimFormField name="repeatabilityMm" label={t('support.robot.create.model.field.repeatabilityMm')}>
                    <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
                  </SimFormField>
                  <Typography.Title level={5} className="robot-create-classify-split-panel__subheading">
                    {t('support.robot.create.model.section.sensors')}
                  </Typography.Title>
                  <SimFormField name="defaultSensors" label={t('support.robot.create.model.field.defaultSensors')}>
                    <Select
                      mode="tags"
                      style={{ width: '100%' }}
                      placeholder={t('support.robot.create.model.field.defaultSensorsPh')}
                      tokenSeparators={[',']}
                      options={SENSOR_SUGGESTIONS.map((x) => ({ value: x, label: x }))}
                    />
                  </SimFormField>
                </Card>
              </Col>
            </Row>
          </div>

          {/* Step 3: Reference Asset / Schema Candidates */}
          <div style={{ display: currentStep === 2 ? undefined : 'none' }}>
            <div className="sim-create-modal__section">
              <Typography.Title level={5} className="sim-create-modal__section-title">
                {t('support.robot.create.model.section.urdfPackage')}
              </Typography.Title>
              <SimFormField name="urdfFile" label={t('support.robot.create.model.field.urdfFile')} valuePropName="fileList" getValueFromEvent={normFile}>
                <Upload.Dragger
                  maxCount={5}
                  multiple
                  beforeUpload={() => false}
                  accept=".urdf,.xacro,.usd,.usda,.stl,.dae"
                  onChange={(info) => setUrdfFiles(info.fileList)}
                >
                  <Typography.Paragraph style={{ marginBottom: 0 }}>
                    {t('support.robot.create.model.field.urdfUploadHint')}
                  </Typography.Paragraph>
                </Upload.Dragger>
              </SimFormField>
              {urdfPreviewContent}
            </div>

            <div className="sim-create-modal__section">
              <Typography.Title level={5} className="sim-create-modal__section-title">
                {t('support.robot.create.model.section.modalitySchema')}
              </Typography.Title>
              <SimFormField name="modalitySchemas" label={t('support.robot.create.model.field.modalitySchema')}>
                <Select
                  mode="tags"
                  style={{ width: '100%' }}
                  placeholder={t('support.robot.create.model.field.modalitySchemaPh')}
                  tokenSeparators={[',']}
                  options={MODALITY_SUGGESTIONS.map((x) => ({ value: x, label: x }))}
                />
              </SimFormField>
            </div>

            <div className="sim-create-modal__section">
              <Typography.Title level={5} className="sim-create-modal__section-title">
                {t('support.robot.create.model.section.controlMethod')}
              </Typography.Title>
              <SimFormField name="controlMethods" label={t('support.robot.create.model.field.controlMethod')}>
                <Select
                  mode="tags"
                  style={{ width: '100%' }}
                  placeholder={t('support.robot.create.model.field.controlMethodPh')}
                  tokenSeparators={[',']}
                  options={CONTROL_METHOD_SUGGESTIONS.map((x) => ({ value: x, label: x }))}
                />
              </SimFormField>
            </div>
          </div>
        </Form>
  );

  const prevButton = currentStep > 0 ? <Button onClick={goPrev}>{t('support.robot.create.model.prev')}</Button> : null;
  const primaryActions = (
    <div style={{ display: 'flex', gap: 8 }}>
      <Button onClick={onClose}>{t('support.sim.create.cancel')}</Button>
      {isLast ? (
        <Button type="primary" onClick={() => void submit()}>
          {t('support.sim.create.submit')}
        </Button>
      ) : (
        <Button type="primary" onClick={() => void goNext()} disabled={currentStep === 0 && duplicateError}>
          {t('support.robot.create.model.next')}
        </Button>
      )}
    </div>
  );
  const wizardFooter =
    layout === 'page' ? (
      <div className="foundry-create-footer-bar">
        <div className="foundry-create-footer-bar__inner">
          <div>{prevButton}</div>
          {primaryActions}
        </div>
      </div>
    ) : (
      <div className="sim-create-modal__footer">
        <div>{prevButton}</div>
        {primaryActions}
      </div>
    );

  const modalWizardBody = (
    <>
      {stepBox}
      <div className="sim-create-modal__body">{wizardForm}</div>
      {wizardFooter}
    </>
  );

  if (layout === 'page') {
    return (
      <div className="sim-create-modal sim-create-modal--page foundry-create-step-shell">
        <div className="foundry-create-step-band">{pageStepStrip}</div>
        <div className="foundry-create-main">
          <Card bordered className="foundry-create-param-card" title={stepItems[currentStep]?.title}>
            <div className="foundry-create-card-scroll sim-create-modal__body">{wizardForm}</div>
          </Card>
        </div>
        {wizardFooter}
      </div>
    );
  }

  return (
    <Modal
      open={open}
      title={t('support.robot.create.model.title')}
      onCancel={onClose}
      footer={null}
      width={ROBOT_CREATE_MODAL_WIDTH}
      destroyOnClose
      maskClosable={false}
      className="sim-create-modal"
      styles={{
        body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', paddingTop: 4 },
      }}
    >
      {modalWizardBody}
    </Modal>
  );
}
