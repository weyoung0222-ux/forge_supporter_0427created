import { App, Button, Card, Form, Input, InputNumber, Select, Space, Typography, theme } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { RobotAuthType, RobotEndpointDto, RobotEndpointProtocol } from '../../../mocks/robotConnectionsMocks';
import { getRobotEndpointById, upsertRobotEndpoint } from '../../../mocks/robotConnectionsMocks';
import { getSupportCompositionsMock } from '../../../mocks/supportCompositionsMock';
import { supportRobotWorkspaceDetailPath, supportWorkspacePath } from '../../../shared/config/supportPaths';
import { useLocale } from '../../../shared/i18n/LocaleProvider';
import { SimFormField } from '../simulation/create/SimFormField';
import { SupportWorkspaceDrillFrame } from '../SupportWorkspaceDrillFrame';
import '../support-workspace-detail-page.css';
import './robot-connections-pages.css';

export interface RobotEndpointEditPageProps {
  endpointId: string;
  embedDrillChrome?: boolean;
}

export function RobotEndpointEditPage({ endpointId, embedDrillChrome = false }: RobotEndpointEditPageProps) {
  const { token } = theme.useToken();
  const { t } = useLocale();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const authTypeWatch = Form.useWatch('authType', form);

  const returnLnb =
    (location.state as { returnLnb?: 'instances-endpoints' } | null)?.returnLnb ?? 'instances-endpoints';
  const listPath = supportWorkspacePath('robot-support', returnLnb);
  const detailPath = supportRobotWorkspaceDetailPath('instances-endpoints', endpointId);

  const ep = useMemo(() => getRobotEndpointById(endpointId), [endpointId]);
  const compositions = useMemo(() => getSupportCompositionsMock(), []);
  const compositionOptions = useMemo(() => compositions.map((c) => ({ value: c.id, label: c.name })), [compositions]);
  const compositionIdWatch = Form.useWatch('compositionId', form);
  const selectedComposition = useMemo(
    () => compositions.find((c) => c.id === compositionIdWatch),
    [compositions, compositionIdWatch],
  );

  useEffect(() => {
    if (!ep) return;
    form.setFieldsValue({
      name: ep.name,
      compositionId: ep.compositionId,
      robotModelName: ep.robotModelName,
      serialNumber: ep.serialNumber,
      description: ep.description,
      ipAddress: ep.ipAddress,
      port: ep.port,
      protocol: ep.protocol,
      authType: ep.authType,
      tokenOrKey: ep.authType === 'none' ? '' : ep.tokenOrKey,
      allowedIps: ep.allowedIps,
      timeoutSec: ep.timeoutSec,
    });
  }, [ep, form]);

  useEffect(() => {
    if (!selectedComposition) return;
    form.setFieldValue('robotModelName', selectedComposition.model.name);
  }, [selectedComposition, form]);

  if (!ep) {
    return (
      <SupportWorkspaceDrillFrame
        backLabel={t('support.robot.detail.back')}
        onBack={() => navigate(listPath)}
        embedInPortalHeader={embedDrillChrome}
      >
        <Typography.Paragraph>{t('support.robot.connections.detail.notFound')}</Typography.Paragraph>
      </SupportWorkspaceDrillFrame>
    );
  }

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

  const submit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const today = new Date().toISOString().slice(0, 10);
      const authType = values.authType as RobotAuthType;
      const compositionId = String(values.compositionId ?? '').trim();
      const comp = compositions.find((c) => c.id === compositionId);
      const compositionName = comp?.name ?? compositionId;
      const base: Omit<RobotEndpointDto, 'id' | 'createdAt'> = {
        name: String(values.name).trim(),
        compositionId,
        compositionName,
        robotModelName: comp?.model.name ?? String(values.robotModelName ?? '').trim(),
        serialNumber: String(values.serialNumber ?? '').trim(),
        description: String(values.description ?? '').trim(),
        ipAddress: String(values.ipAddress).trim(),
        port: Number(values.port),
        protocol: values.protocol as RobotEndpointProtocol,
        status: ep.status,
        latencyMs: ep.latencyMs,
        updatedAt: today,
        authType,
        tokenOrKey: authType === 'none' ? '' : String(values.tokenOrKey ?? '').trim(),
        allowedIps: String(values.allowedIps ?? '').trim(),
        timeoutSec: Number(values.timeoutSec ?? 30),
        lastSeenAt: ep.lastSeenAt,
      };
      upsertRobotEndpoint({
        ...ep,
        ...base,
        id: ep.id,
        createdAt: ep.createdAt,
      });
      message.success(t('support.robot.connections.endpoint.updated'));
      navigate(detailPath, { state: { returnLnb } });
    } catch {
      /* validation */
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SupportWorkspaceDrillFrame
      backLabel={t('support.robot.detail.back')}
      onBack={() => navigate(listPath)}
      embedInPortalHeader={embedDrillChrome}
    >
      <div className="support-workspace-detail-page">
        <Card size="small" bordered style={{ borderColor: token.colorBorderSecondary, marginBottom: 16 }}>
          <Typography.Title level={4} style={{ marginTop: 0 }}>
            {t('support.robot.connections.endpoint.modalEditTitle')}
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            {t('support.robot.edit.lead')}
          </Typography.Paragraph>
        </Card>

        <Card size="small" bordered style={{ borderColor: token.colorBorderSecondary }}>
          <Form form={form} layout="vertical" requiredMark>
            <Typography.Title level={5} style={{ marginTop: 0 }}>
              {t('support.robot.connections.endpoint.section.definition')}
            </Typography.Title>
            <SimFormField
              name="compositionId"
              label={t('support.robot.connections.endpoint.field.composition')}
              rules={[{ required: true, message: t('support.robot.connections.endpoint.field.compositionRequired') }]}
            >
              <Select options={compositionOptions} showSearch optionFilterProp="label" popupMatchSelectWidth={false} />
            </SimFormField>
            <SimFormField name="name" label={t('support.robot.connections.endpoint.field.name')} rules={[{ required: true }]}>
              <Input allowClear autoComplete="off" />
            </SimFormField>
            <SimFormField
              name="robotModelName"
              label={t('support.robot.instance.register.summary.catalogModel')}
              rules={[{ required: true, message: t('support.robot.connections.endpoint.field.robotModelNameRequired') }]}
            >
              <Input readOnly tabIndex={-1} />
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

            <Typography.Title level={5}>{t('support.robot.connections.endpoint.section.connection')}</Typography.Title>
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

            <Typography.Title level={5}>{t('support.robot.connections.endpoint.section.auth')}</Typography.Title>
            <SimFormField name="authType" label={t('support.robot.connections.endpoint.field.authType')} rules={[{ required: true }]}>
              <Select options={authOptions} />
            </SimFormField>
            {authTypeWatch === 'token' || authTypeWatch === 'key' ? (
              <SimFormField name="tokenOrKey" label={t('support.robot.connections.endpoint.field.secret')} rules={[{ required: true }]}>
                <Input.Password allowClear autoComplete="new-password" />
              </SimFormField>
            ) : null}

            <Typography.Title level={5}>{t('support.robot.connections.endpoint.section.network')}</Typography.Title>
            <SimFormField name="allowedIps" label={t('support.robot.connections.endpoint.field.allowedIps')}>
              <Input.TextArea rows={3} placeholder={t('support.robot.connections.endpoint.field.allowedIpsPh')} allowClear />
            </SimFormField>

            <Space style={{ marginTop: 16 }}>
              <Button type="primary" loading={submitting} onClick={() => void submit()}>
                {t('support.robot.edit.save')}
              </Button>
              <Button onClick={() => navigate(detailPath, { state: { returnLnb } })}>{t('support.sim.create.cancel')}</Button>
            </Space>
          </Form>
        </Card>
      </div>
    </SupportWorkspaceDrillFrame>
  );
}
