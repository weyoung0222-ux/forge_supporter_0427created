import { App, Alert, Button, Form, Input, InputNumber, Select, Space, Typography } from 'antd';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { RobotAuthType, RobotEndpointDto, RobotEndpointProtocol } from '../../../mocks/robotConnectionsMocks';
import { getRobotEndpointById, prependRobotEndpoint, upsertRobotEndpoint } from '../../../mocks/robotConnectionsMocks';
import { getSupportCompositionsMock } from '../../../mocks/supportCompositionsMock';
import { useLocale } from '../../../shared/i18n/LocaleProvider';
import { SimFormField } from '../simulation/create/SimFormField';
import { CreateStepModalShell } from '../simulation/create/CreateStepModalShell';
import '../simulation/create/simulation-create-modals.css';

export interface CreateRobotEndpointModalProps {
  open?: boolean;
  onClose: () => void;
  onSaved: () => void;
  mode: 'create' | 'edit';
  endpoint: RobotEndpointDto | null;
  layout?: 'modal' | 'page';
}

export function CreateRobotEndpointModal({ open = true, onClose, onSaved, mode, endpoint, layout = 'modal' }: CreateRobotEndpointModalProps) {
  const { t } = useLocale();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const authTypeWatch = Form.useWatch('authType', form);
  const compositionOptions = useMemo(() => getSupportCompositionsMock().map((c) => ({ value: c.id, label: c.name })), []);
  const [submitting, setSubmitting] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'success' | 'fail'>('idle');
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (layout === 'modal' && !open) return;
    setTestResult('idle');
    setCurrentStep(0);
    if (mode === 'edit' && endpoint) {
      form.setFieldsValue({
        name: endpoint.name,
        compositionId: endpoint.compositionId,
        robotModelName: endpoint.robotModelName,
        serialNumber: endpoint.serialNumber,
        description: endpoint.description,
        ipAddress: endpoint.ipAddress,
        port: endpoint.port,
        protocol: endpoint.protocol,
        authType: endpoint.authType,
        tokenOrKey: endpoint.authType === 'none' ? '' : endpoint.tokenOrKey,
        allowedIps: endpoint.allowedIps,
        timeoutSec: endpoint.timeoutSec,
      });
    } else {
      form.resetFields();
      const first = compositionOptions[0];
      form.setFieldsValue({
        compositionId: first?.value,
        robotModelName: '',
        serialNumber: '',
        port: 11311,
        protocol: 'ROS' as RobotEndpointProtocol,
        authType: 'none' as RobotAuthType,
        timeoutSec: 30,
      });
    }
  }, [open, layout, mode, endpoint, form, compositionOptions]);

  const steps = useMemo(
    () => [
      { title: t('support.robot.connections.endpoint.section.basic') },
      { title: t('support.robot.connections.endpoint.section.connection') },
      { title: t('support.robot.connections.endpoint.section.auth') },
    ],
    [t],
  );

  const fieldsForStep: Record<number, string[]> = {
    0: ['compositionId', 'name', 'robotModelName', 'serialNumber', 'description'],
    1: ['ipAddress', 'port', 'protocol', 'timeoutSec'],
    2: ['authType'],
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

  const protocolOptions: { value: RobotEndpointProtocol; label: string }[] = [
    { value: 'ROS', label: 'ROS' },
    { value: 'TCP', label: 'TCP' },
    { value: 'HTTP', label: 'HTTP' },
  ];

  const authOptions: { value: RobotAuthType; label: string }[] = [
    { value: 'none', label: t('support.robot.connections.auth.none') },
    { value: 'token', label: t('support.robot.connections.auth.token') },
    { value: 'key', label: t('support.robot.connections.auth.key') },
  ];

  const runTestConnection = async () => {
    try {
      await form.validateFields(['ipAddress', 'port', 'protocol', 'timeoutSec', ...(authTypeWatch === 'token' || authTypeWatch === 'key' ? (['tokenOrKey'] as const) : [])]);
    } catch {
      message.warning(t('support.robot.connections.endpoint.test.validation'));
      return;
    }
    setTesting(true);
    setTestResult('idle');
    window.setTimeout(() => {
      const ok = Math.random() > 0.25;
      setTestResult(ok ? 'success' : 'fail');
      if (ok) {
        message.success(t('support.robot.connections.endpoint.test.success'));
        if (mode === 'edit' && endpoint) {
          const latest = getRobotEndpointById(endpoint.id);
          if (latest) {
            upsertRobotEndpoint({
              ...latest,
              latencyMs: Math.floor(Math.random() * 35) + 8,
              updatedAt: new Date().toISOString().slice(0, 10),
            });
            onSaved();
          }
        }
      } else {
        message.error(t('support.robot.connections.endpoint.test.fail'));
      }
      setTesting(false);
    }, 900);
  };

  const submit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const today = new Date().toISOString().slice(0, 10);
      const authType = values.authType as RobotAuthType;
      const compositionId = String(values.compositionId ?? '').trim();
      const comp = getSupportCompositionsMock().find((c) => c.id === compositionId);
      const compositionName = comp?.name ?? compositionId;
      const base: Omit<RobotEndpointDto, 'id' | 'createdAt'> = {
        name: String(values.name).trim(),
        compositionId,
        compositionName,
        robotModelName: String(values.robotModelName ?? '').trim(),
        serialNumber: String(values.serialNumber ?? '').trim(),
        description: String(values.description ?? '').trim(),
        ipAddress: String(values.ipAddress).trim(),
        port: Number(values.port),
        protocol: values.protocol as RobotEndpointProtocol,
        status: 'disconnected',
        latencyMs: 0,
        updatedAt: today,
        authType,
        tokenOrKey: authType === 'none' ? '' : String(values.tokenOrKey ?? '').trim(),
        allowedIps: String(values.allowedIps ?? '').trim(),
        timeoutSec: Number(values.timeoutSec ?? 30),
        lastSeenAt: '—',
      };

      if (mode === 'edit' && endpoint) {
        upsertRobotEndpoint({
          ...endpoint,
          ...base,
          id: endpoint.id,
          createdAt: endpoint.createdAt,
          status: endpoint.status,
          latencyMs: endpoint.latencyMs,
          lastSeenAt: endpoint.lastSeenAt,
        });
        message.success(t('support.robot.connections.endpoint.updated'));
      } else {
        const id = `rb-ep-${Date.now()}`;
        prependRobotEndpoint({
          ...base,
          id,
          createdAt: today,
        });
        message.success(t('support.robot.connections.endpoint.created'));
      }
      onSaved();
      onClose();
    } catch {
      /* validation */
    } finally {
      setSubmitting(false);
    }
  };

  const titleText = mode === 'edit' ? t('support.robot.connections.endpoint.modalEditTitle') : t('support.robot.connections.endpoint.modalCreateTitle');
  const modalTitle: ReactNode = (
    <div>
      <div>{titleText}</div>
      {mode === 'edit' && endpoint ? (
        <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4, fontWeight: 400 }}>
          {t('support.robot.connections.endpoint.modalEditHint')}
        </Typography.Text>
      ) : null}
    </div>
  );

  return (
    <CreateStepModalShell
      layout={layout}
      open={open}
      title={modalTitle}
      onCancel={onClose}
      onSubmit={() => void submit()}
      submitLoading={submitting}
      modalWidth={720}
      steps={steps}
      currentStep={currentStep}
      onPrev={goPrev}
      onNext={goNext}
    >
      <Form form={form} layout="vertical" requiredMark>
        <div style={{ display: currentStep === 0 ? undefined : 'none' }}>
          <div className="sim-create-modal__section">
            <Typography.Title level={5} className="sim-create-modal__section-title">
              {t('support.robot.connections.endpoint.section.definition')}
            </Typography.Title>
            <SimFormField
              name="compositionId"
              label={t('support.robot.connections.endpoint.field.composition')}
              rules={[{ required: true, message: t('support.robot.connections.endpoint.field.compositionRequired') }]}
            >
              <Select
                options={compositionOptions}
                showSearch
                optionFilterProp="label"
                disabled={mode === 'edit'}
                placeholder={t('support.robot.connections.endpoint.field.composition')}
              />
            </SimFormField>
          </div>
          <div className="sim-create-modal__section">
            <Typography.Title level={5} className="sim-create-modal__section-title">
              {t('support.robot.connections.endpoint.section.basic')}
            </Typography.Title>
            <SimFormField name="name" label={t('support.robot.connections.endpoint.field.name')} rules={[{ required: true }]}>
              <Input allowClear autoComplete="off" />
            </SimFormField>
            <SimFormField
              name="robotModelName"
              label={t('support.robot.connections.endpoint.field.robotModelName')}
              rules={[{ required: true, message: t('support.robot.connections.endpoint.field.robotModelNameRequired') }]}
            >
              <Input allowClear autoComplete="off" placeholder={t('support.robot.connections.endpoint.field.robotModelNamePh')} />
            </SimFormField>
            <SimFormField
              name="serialNumber"
              label={t('support.robot.connections.endpoint.field.serialNumber')}
              rules={[{ required: true, message: t('support.robot.connections.endpoint.field.serialNumberRequired') }]}
            >
              <Input allowClear autoComplete="off" placeholder={t('support.robot.connections.endpoint.field.serialNumberPh')} />
            </SimFormField>
            <SimFormField name="description" label={t('support.robot.connections.endpoint.field.description')}>
              <Input.TextArea rows={2} allowClear />
            </SimFormField>
          </div>
        </div>

        <div style={{ display: currentStep === 1 ? undefined : 'none' }}>
          <div className="sim-create-modal__section">
            <Typography.Title level={5} className="sim-create-modal__section-title">
              {t('support.robot.connections.endpoint.section.connection')}
            </Typography.Title>
            <SimFormField name="ipAddress" label={t('support.robot.connections.endpoint.field.ip')} rules={[{ required: true }]}>
              <Input allowClear autoComplete="off" />
            </SimFormField>
            <SimFormField name="port" label={t('support.robot.connections.endpoint.field.port')} rules={[{ required: true }]}>
              <InputNumber min={1} max={65535} style={{ width: '100%' }} />
            </SimFormField>
            <SimFormField name="protocol" label={t('support.robot.connections.endpoint.field.protocol')} rules={[{ required: true }]}>
              <Select options={protocolOptions} />
            </SimFormField>
            <SimFormField
              name="timeoutSec"
              label={`${t('support.robot.connections.endpoint.field.timeout')} (s)`}
              rules={[{ required: true }]}
            >
              <InputNumber min={1} max={600} style={{ width: '100%' }} />
            </SimFormField>
            <Space wrap style={{ marginBottom: testResult === 'idle' ? 0 : 12 }}>
              <Button onClick={() => void runTestConnection()} loading={testing}>
                {t('support.robot.connections.endpoint.test.button')}
              </Button>
            </Space>
            {testResult === 'success' ? (
              <Alert type="success" showIcon message={t('support.robot.connections.endpoint.test.resultOk')} style={{ marginBottom: 0 }} />
            ) : null}
            {testResult === 'fail' ? (
              <Alert type="error" showIcon message={t('support.robot.connections.endpoint.test.resultFail')} style={{ marginBottom: 0 }} />
            ) : null}
          </div>
        </div>

        <div style={{ display: currentStep === 2 ? undefined : 'none' }}>
          <div className="sim-create-modal__section">
            <Typography.Title level={5} className="sim-create-modal__section-title">
              {t('support.robot.connections.endpoint.section.auth')}
            </Typography.Title>
            <SimFormField name="authType" label={t('support.robot.connections.endpoint.field.authType')} rules={[{ required: true }]}>
              <Select options={authOptions} />
            </SimFormField>
            {authTypeWatch === 'token' || authTypeWatch === 'key' ? (
              <SimFormField name="tokenOrKey" label={t('support.robot.connections.endpoint.field.secret')} rules={[{ required: true }]}>
                <Input.Password allowClear autoComplete="new-password" />
              </SimFormField>
            ) : null}
          </div>
          <div className="sim-create-modal__section">
            <Typography.Title level={5} className="sim-create-modal__section-title">
              {t('support.robot.connections.endpoint.section.network')}
            </Typography.Title>
            <SimFormField name="allowedIps" label={t('support.robot.connections.endpoint.field.allowedIps')}>
              <Input.TextArea rows={3} placeholder={t('support.robot.connections.endpoint.field.allowedIpsPh')} allowClear />
            </SimFormField>
          </div>
        </div>
      </Form>
    </CreateStepModalShell>
  );
}
