import { App, Alert, Button, Form, Input, InputNumber, Select, Space, Typography } from 'antd';
import { useEffect, useState, type ReactNode } from 'react';
import type { RobotAuthType, RobotEndpointDto, RobotEndpointProtocol } from '../../../mocks/robotConnectionsMocks';
import { getRobotEndpointById, prependRobotEndpoint, upsertRobotEndpoint } from '../../../mocks/robotConnectionsMocks';
import { useLocale } from '../../../shared/i18n/LocaleProvider';
import { SimFormField } from '../simulation/create/SimFormField';
import { SimulationCreateModalShell } from '../simulation/create/SimulationCreateModalShell';
import '../simulation/create/simulation-create-modals.css';

export interface CreateRobotEndpointModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  mode: 'create' | 'edit';
  endpoint: RobotEndpointDto | null;
}

export function CreateRobotEndpointModal({ open, onClose, onSaved, mode, endpoint }: CreateRobotEndpointModalProps) {
  const { t } = useLocale();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const authTypeWatch = Form.useWatch('authType', form);
  const [submitting, setSubmitting] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'success' | 'fail'>('idle');

  useEffect(() => {
    if (!open) return;
    setTestResult('idle');
    if (mode === 'edit' && endpoint) {
      form.setFieldsValue({
        name: endpoint.name,
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
      form.setFieldsValue({
        port: 11311,
        protocol: 'ROS' as RobotEndpointProtocol,
        authType: 'none' as RobotAuthType,
        timeoutSec: 30,
      });
    }
  }, [open, mode, endpoint, form]);

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
      await form.validateFields(['ipAddress', 'port', 'protocol', 'timeoutSec', 'authType', ...(authTypeWatch === 'token' || authTypeWatch === 'key' ? (['tokenOrKey'] as const) : [])]);
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
      const base: Omit<RobotEndpointDto, 'id' | 'createdAt'> = {
        name: String(values.name).trim(),
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
      };

      if (mode === 'edit' && endpoint) {
        upsertRobotEndpoint({
          ...endpoint,
          ...base,
          id: endpoint.id,
          createdAt: endpoint.createdAt,
          status: endpoint.status,
          latencyMs: endpoint.latencyMs,
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
    <SimulationCreateModalShell
      open={open}
      title={modalTitle}
      onCancel={onClose}
      onPrimaryClick={() => void submit()}
      primaryLoading={submitting}
      modalWidth={720}
    >
      <Form form={form} layout="vertical" requiredMark="optional">
        <div className="sim-create-modal__section">
          <Typography.Title level={5} className="sim-create-modal__section-title">
            {t('support.robot.connections.endpoint.section.basic')}
          </Typography.Title>
          <SimFormField name="name" label={t('support.robot.connections.endpoint.field.name')} rules={[{ required: true }]}>
            <Input allowClear autoComplete="off" />
          </SimFormField>
          <SimFormField name="description" label={t('support.robot.connections.endpoint.field.description')}>
            <Input.TextArea rows={2} allowClear />
          </SimFormField>
        </div>

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
      </Form>
    </SimulationCreateModalShell>
  );
}
