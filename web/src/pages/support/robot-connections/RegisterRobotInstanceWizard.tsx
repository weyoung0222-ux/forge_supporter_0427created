import { App, Badge, Button, Card, Col, Descriptions, Form, Input, InputNumber, Row, Select, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import type { RobotAuthType, RobotEndpointProtocol } from '../../../mocks/robotConnectionsMocks';
import { prependRobotEndpoint } from '../../../mocks/robotConnectionsMocks';
import { getSupportCompositionsMock, type SupportCompositionDto } from '../../../mocks/supportCompositionsMock';
import { getSupportDefinitionModelById, type SupportDefinitionModelDto } from '../../../mocks/supportDefinitionMock';
import { useLocale } from '../../../shared/i18n/LocaleProvider';
import { SimFormField } from '../simulation/create/SimFormField';
import { CreateStepModalShell } from '../simulation/create/CreateStepModalShell';
import '../simulation/create/simulation-create-modals.css';
import './register-robot-instance-wizard.css';

const TOTAL_STEPS = 4;

const DEVICE_OPTIONS = ['imu', 'lidar', 'rgb_camera', 'depth_camera', 'gripper'] as const;
const MODALITY_OPTIONS = ['joint_state', 'imu', 'point_cloud', 'rgb'] as const;
const ACTION_OPTIONS = ['position', 'velocity', 'impedance'] as const;

type DeviceOpt = (typeof DEVICE_OPTIONS)[number];
type ModalityOpt = (typeof MODALITY_OPTIONS)[number];
type ActionOpt = (typeof ACTION_OPTIONS)[number];

type ConnectionStatus = 'unknown' | 'connected' | 'failed';

type DiscoveryRow = {
  key: string;
  topic: string;
  msgType: string;
  suggested: string;
  confidence: 'high' | 'medium' | 'low';
  status: 'matched' | 'review';
};

const DISCOVERY_ROWS: DiscoveryRow[] = [
  {
    key: '1',
    topic: '/joint_states',
    msgType: 'sensor_msgs/JointState',
    suggested: 'joint_state',
    confidence: 'high',
    status: 'matched',
  },
  {
    key: '2',
    topic: '/imu/data',
    msgType: 'sensor_msgs/Imu',
    suggested: 'imu',
    confidence: 'high',
    status: 'matched',
  },
  {
    key: '3',
    topic: '/camera/color/image_raw',
    msgType: 'sensor_msgs/Image',
    suggested: 'rgb',
    confidence: 'medium',
    status: 'review',
  },
];

function parseAgentHostPort(raw: string): { host: string; port: number } {
  const s = raw.trim();
  if (!s) return { host: '127.0.0.1', port: 11811 };
  try {
    const u = s.includes('://') ? new URL(s) : new URL(`http://${s}`);
    const p = u.port ? parseInt(u.port, 10) : 11811;
    return { host: u.hostname || '127.0.0.1', port: Number.isFinite(p) ? p : 11811 };
  } catch {
    const idx = s.lastIndexOf(':');
    if (idx > 0) {
      const host = s.slice(0, idx).replace(/^\[|\]$/g, '');
      const port = parseInt(s.slice(idx + 1), 10);
      return { host: host || '127.0.0.1', port: Number.isFinite(port) ? port : 11811 };
    }
    return { host: s, port: 11811 };
  }
}

function formatLocomotion(m: SupportDefinitionModelDto | null): string {
  if (!m?.locomotionType) return '—';
  return String(m.locomotionType)
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

function inferDevicesFromModel(m: SupportDefinitionModelDto | null): DeviceOpt[] {
  if (!m?.defaultSensors?.length) return ['imu', 'lidar', 'rgb_camera'];
  const hay = m.defaultSensors.join(' ').toLowerCase();
  const out: DeviceOpt[] = [];
  for (const d of DEVICE_OPTIONS) {
    if (d === 'imu' && hay.includes('imu')) out.push(d);
    if (d === 'lidar' && (hay.includes('lidar') || hay.includes('velodyne') || hay.includes('vlp'))) out.push(d);
    if (d === 'rgb_camera' && (hay.includes('rgb') || hay.includes('realsense') || hay.includes('camera'))) out.push(d);
    if (d === 'depth_camera' && (hay.includes('depth') || hay.includes('rgb-d') || hay.includes('realsense'))) out.push(d);
    if (d === 'gripper' && (hay.includes('grip') || hay.includes('hand'))) out.push(d);
  }
  return out.length ? out : ['imu', 'lidar', 'rgb_camera'];
}

function inferModalitiesFromModel(m: SupportDefinitionModelDto | null): ModalityOpt[] {
  const from = m?.modalitySchemas?.length
    ? m.modalitySchemas.filter((x): x is ModalityOpt => (MODALITY_OPTIONS as readonly string[]).includes(x))
    : [];
  if (from.length) return from;
  return ['joint_state', 'rgb'];
}

function inferModalitiesFromComposition(comp: SupportCompositionDto | null, m: SupportDefinitionModelDto | null): ModalityOpt[] {
  if (comp?.modalitySchemasSelected?.length) {
    const from = comp.modalitySchemasSelected.filter((x): x is ModalityOpt => (MODALITY_OPTIONS as readonly string[]).includes(x));
    if (from.length) return from;
  }
  return inferModalitiesFromModel(m);
}

function inferActionsFromModel(m: SupportDefinitionModelDto | null): ActionOpt[] {
  const from = m?.controlMethods?.length
    ? m.controlMethods
        .map((x) => x.toLowerCase())
        .filter((x) => (ACTION_OPTIONS as readonly string[]).includes(x))
        .map((x) => x as ActionOpt)
    : [];
  if (from.length) return from;
  return ['position', 'velocity', 'impedance'];
}

export interface RegisterRobotInstanceWizardProps {
  onClose: () => void;
  onSaved: () => void;
}

export function RegisterRobotInstanceWizard({ onClose, onSaved }: RegisterRobotInstanceWizardProps) {
  const { t } = useLocale();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('unknown');
  const [testLoading, setTestLoading] = useState(false);
  const [enabledDevices, setEnabledDevices] = useState<Set<DeviceOpt>>(() => new Set());
  const [enabledModalities, setEnabledModalities] = useState<Set<ModalityOpt>>(() => new Set());
  const [enabledActions, setEnabledActions] = useState<Set<ActionOpt>>(() => new Set());

  const compositions = useMemo(() => getSupportCompositionsMock(), []);
  const compositionById = useMemo(() => new Map(compositions.map((c) => [c.id, c])), [compositions]);
  const compositionOptions = useMemo(
    () => compositions.map((c) => ({ value: c.id, label: `${c.name} · ${c.model.name}` })),
    [compositions],
  );
  const compositionId = Form.useWatch('compositionId', form);
  const selectedComposition = useMemo(
    () => (compositionId ? compositionById.get(String(compositionId)) ?? null : null),
    [compositionById, compositionId],
  );
  const selectedModel = useMemo(
    () => (selectedComposition ? getSupportDefinitionModelById(selectedComposition.model.id) : null),
    [selectedComposition],
  );

  const applyPresetFromComposition = useCallback((comp: SupportCompositionDto | null) => {
    const m = comp ? getSupportDefinitionModelById(comp.model.id) : null;
    setEnabledDevices(new Set(inferDevicesFromModel(m)));
    setEnabledModalities(new Set(inferModalitiesFromComposition(comp, m)));
    setEnabledActions(new Set(inferActionsFromModel(m)));
  }, []);

  useEffect(() => {
    form.resetFields();
    const firstId = compositions[0]?.id;
    form.setFieldsValue({
      compositionId: firstId,
      displayName: '',
      description: '',
      serialNumber: '',
      connectionName: '',
      rosDomainId: 0,
      agentEndpoint: '',
      ddsVendor: 'cyclone',
      networkInterface: 'eth0',
    });
    setCurrentStep(0);
    setConnectionStatus('unknown');
  }, [form, compositions]);

  useEffect(() => {
    if (!compositionId) return;
    applyPresetFromComposition(compositionById.get(String(compositionId)) ?? null);
  }, [compositionId, compositionById, applyPresetFromComposition]);

  const steps = useMemo(
    () => [
      { title: t('support.robot.instance.register.step.basic') },
      { title: t('support.robot.instance.register.step.configuration') },
      { title: t('support.robot.instance.register.step.connection') },
      { title: t('support.robot.instance.register.step.discovery') },
    ],
    [t],
  );

  const fieldsForStep: Record<number, string[]> = {
    0: ['compositionId', 'displayName'],
    1: ['compositionId'],
    2: ['connectionName', 'agentEndpoint', 'rosDomainId', 'ddsVendor', 'networkInterface'],
    3: [],
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

  const runTestConnection = () => {
    setTestLoading(true);
    window.setTimeout(() => {
      const ok = Math.random() > 0.2;
      setConnectionStatus(ok ? 'connected' : 'failed');
      if (ok) message.success(t('support.robot.connections.endpoint.test.success'));
      else message.error(t('support.robot.connections.endpoint.test.fail'));
      setTestLoading(false);
    }, 900);
  };

  const discoverTopics = () => {
    message.info(t('support.robot.instance.register.discover.done'));
  };

  const toggleSet = <T extends string>(setter: Dispatch<SetStateAction<Set<T>>>, key: T, checked: boolean) => {
    setter((prev: Set<T>) => {
      const n = new Set(prev);
      if (checked) n.add(key);
      else n.delete(key);
      return n;
    });
  };

  const submit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const comp = compositionById.get(String(values.compositionId));
      if (!comp) {
        message.error(t('support.robot.connections.endpoint.field.compositionRequired'));
        return;
      }
      const model = getSupportDefinitionModelById(comp.model.id);
      const { host, port } = parseAgentHostPort(String(values.agentEndpoint ?? ''));
      const today = new Date().toISOString().slice(0, 10);
      const metaBits = [
        `connection:${String(values.connectionName ?? '').trim()}`,
        `ros_domain:${values.rosDomainId}`,
        `dds:${values.ddsVendor}`,
        `iface:${String(values.networkInterface ?? '').trim()}`,
        `devices:${[...enabledDevices].join(',')}`,
        `modalities:${[...enabledModalities].join(',')}`,
        `actions:${[...enabledActions].join(',')}`,
      ].join('\n');
      const base = {
        name: String(values.displayName).trim(),
        compositionId: comp.id,
        compositionName: comp.name,
        robotModelName: model?.name ?? comp.model.name,
        serialNumber: String(values.serialNumber ?? '').trim(),
        description: [String(values.description ?? '').trim(), metaBits].filter(Boolean).join('\n\n'),
        ipAddress: host,
        port,
        protocol: 'ROS' as RobotEndpointProtocol,
        status: 'disconnected' as const,
        latencyMs: 0,
        updatedAt: today,
        createdAt: today,
        authType: 'none' as RobotAuthType,
        tokenOrKey: '',
        allowedIps: '',
        timeoutSec: 30,
        lastSeenAt: '—',
      };
      prependRobotEndpoint({
        ...base,
        id: `rb-ep-${Date.now()}`,
      });
      message.success(t('support.robot.connections.endpoint.created'));
      onSaved();
      onClose();
    } catch {
      /* validation */
    } finally {
      setSubmitting(false);
    }
  };

  const ddsOptions = useMemo(
    () => [
      { value: 'cyclone', label: t('support.robot.instance.register.dds.cyclone') },
      { value: 'fast', label: t('support.robot.instance.register.dds.fast') },
      { value: 'rti', label: t('support.robot.instance.register.dds.rti') },
    ],
    [t],
  );

  const statusBadge = useMemo(() => {
    if (connectionStatus === 'connected') {
      return <Badge status="success" text={t('support.robot.instance.register.status.connected')} />;
    }
    if (connectionStatus === 'failed') {
      return <Badge status="error" text={t('support.robot.instance.register.status.failed')} />;
    }
    return <Badge status="default" text={t('support.robot.instance.register.status.unknown')} />;
  }, [connectionStatus, t]);

  const discoveryColumns: ColumnsType<DiscoveryRow> = useMemo(
    () => [
      { title: t('support.robot.instance.register.step4.col.topic'), dataIndex: 'topic', key: 'topic', width: 220 },
      { title: t('support.robot.instance.register.step4.col.msgType'), dataIndex: 'msgType', key: 'msgType', ellipsis: true },
      { title: t('support.robot.instance.register.step4.col.suggested'), dataIndex: 'suggested', key: 'suggested', width: 140 },
      {
        title: t('support.robot.instance.register.step4.col.confidence'),
        dataIndex: 'confidence',
        key: 'confidence',
        width: 110,
        render: (c: DiscoveryRow['confidence']) => {
          const color = c === 'high' ? 'green' : c === 'medium' ? 'gold' : 'default';
          const label =
            c === 'high'
              ? t('support.robot.instance.register.step4.confidence.high')
              : c === 'medium'
                ? t('support.robot.instance.register.step4.confidence.medium')
                : t('support.robot.instance.register.step4.confidence.low');
          return <Tag color={color}>{label}</Tag>;
        },
      },
      {
        title: t('support.robot.instance.register.step4.col.status'),
        dataIndex: 'status',
        key: 'status',
        width: 120,
        render: (s: DiscoveryRow['status']) =>
          s === 'matched' ? (
            <Tag color="blue">{t('support.robot.instance.register.step4.status.matched')}</Tag>
          ) : (
            <Tag color="orange">{t('support.robot.instance.register.step4.status.review')}</Tag>
          ),
      },
      {
        title: t('support.robot.instance.register.step4.col.action'),
        key: 'action',
        width: 220,
        render: () => (
          <Space wrap size={6}>
            <Button size="small" type="primary">
              {t('support.robot.instance.register.step4.accept')}
            </Button>
            <Select
              size="small"
              style={{ minWidth: 140 }}
              placeholder={t('support.robot.instance.register.step4.override')}
              options={[
                { value: 'joint_state', label: 'joint_state' },
                { value: 'rgb', label: 'rgb' },
                { value: 'depth', label: 'depth' },
              ]}
            />
          </Space>
        ),
      },
    ],
    [t],
  );

  const summarySensors =
    selectedModel?.defaultSensors?.length && selectedModel.defaultSensors.length > 0
      ? selectedModel.defaultSensors.join(', ')
      : '—';

  return (
    <CreateStepModalShell
      layout="page"
      title={null}
      onCancel={onClose}
      onSubmit={() => void submit()}
      submitLoading={submitting}
      submitLabel={t('support.robot.instance.register.submit')}
      steps={steps}
      currentStep={currentStep}
      onPrev={goPrev}
      onNext={goNext}
      hideFooterCancel
    >
      <Form form={form} layout="vertical" requiredMark>
        <div style={{ display: currentStep === 0 ? undefined : 'none' }}>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
            {t('support.robot.instance.register.step1.lead')}
          </Typography.Paragraph>
          <Row gutter={[24, 24]} className="register-robot-instance-step1">
            <Col xs={24} lg={14}>
              <SimFormField
                name="compositionId"
                label={t('support.robot.connections.endpoint.field.composition')}
                rules={[{ required: true, message: t('support.robot.connections.endpoint.field.compositionRequired') }]}
              >
                <Select showSearch optionFilterProp="label" options={compositionOptions} popupMatchSelectWidth={false} />
              </SimFormField>
              <SimFormField
                name="displayName"
                label={t('support.robot.instance.register.field.displayName')}
                rules={[{ required: true, message: t('support.sim.create.validation.name') }]}
              >
                <Input allowClear autoComplete="off" />
              </SimFormField>
              <SimFormField name="description" label={t('support.robot.instance.register.field.description')}>
                <Input.TextArea rows={4} allowClear />
              </SimFormField>
              <SimFormField name="serialNumber" label={t('support.robot.instance.register.field.serialNumber')}>
                <Input allowClear autoComplete="off" />
              </SimFormField>
            </Col>
            <Col xs={24} lg={10}>
              <Card size="small" bordered className="register-robot-instance-step1__summary" title={t('support.robot.instance.register.summary.title')}>
                {selectedComposition ? (
                  <Descriptions column={1} size="small" layout="vertical">
                    <Descriptions.Item label={t('support.robot.connections.endpoint.field.composition')}>
                      {selectedComposition.name}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('support.robot.instance.register.summary.catalogModel')}>
                      {selectedComposition.model.name}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('support.robot.instance.register.summary.deviceSlots')}>
                      {selectedComposition.devices.length
                        ? selectedComposition.devices.map((d) => d.shortName).join(', ')
                        : '—'}
                    </Descriptions.Item>
                    {selectedModel ? (
                      <>
                        <Descriptions.Item label={t('support.robot.instance.register.summary.manufacturer')}>
                          {selectedModel.manufacturer}
                        </Descriptions.Item>
                        <Descriptions.Item label={t('support.robot.instance.register.summary.locomotion')}>
                          {formatLocomotion(selectedModel)}
                        </Descriptions.Item>
                        <Descriptions.Item label={t('support.robot.instance.register.summary.sensors')}>{summarySensors}</Descriptions.Item>
                      </>
                    ) : null}
                  </Descriptions>
                ) : (
                  <Typography.Text type="secondary">{t('support.robot.instance.register.summary.pickRobot')}</Typography.Text>
                )}
              </Card>
            </Col>
          </Row>
        </div>

        <div style={{ display: currentStep === 1 ? undefined : 'none' }}>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
            {t('support.robot.instance.register.step2.composeLead')}
          </Typography.Paragraph>
          <Form.Item
            className="sim-form-field"
            label={t('support.robot.connections.endpoint.field.composition')}
            required
            style={{ marginBottom: 16 }}
          >
            <Select
              showSearch
              optionFilterProp="label"
              options={compositionOptions}
              popupMatchSelectWidth={false}
              value={compositionId}
              onChange={(v) => form.setFieldValue('compositionId', v)}
            />
          </Form.Item>
          <div className="sim-create-modal__section">
            <Typography.Title level={5} className="sim-create-modal__section-title">
              {t('support.robot.instance.register.step2.section.urdf')}
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 8 }}>
              {t('support.robot.instance.register.step2.urdfHint')}
            </Typography.Paragraph>
            <Space wrap>
              <Tag color="blue">robot_description</Tag>
              <Tag>URDF package (catalog)</Tag>
            </Space>
          </div>
          <div className="sim-create-modal__section">
            <Space align="center" style={{ width: '100%', justifyContent: 'space-between', marginBottom: 8 }} wrap>
              <Typography.Title level={5} className="sim-create-modal__section-title" style={{ margin: 0 }}>
                {t('support.robot.instance.register.step2.section.devices')}
              </Typography.Title>
              <Button size="small" onClick={() => applyPresetFromComposition(selectedComposition)}>
                {t('support.robot.instance.register.step2.resetDefaults')}
              </Button>
            </Space>
            <div className="register-robot-instance-chip-row">
              {DEVICE_OPTIONS.map((d) => (
                <Tag.CheckableTag
                  key={d}
                  className="register-robot-instance-chip"
                  checked={enabledDevices.has(d)}
                  onChange={(checked) => toggleSet(setEnabledDevices, d, checked)}
                >
                  {d}
                </Tag.CheckableTag>
              ))}
            </div>
          </div>
          <div className="sim-create-modal__section">
            <Space align="center" style={{ width: '100%', justifyContent: 'space-between', marginBottom: 8 }} wrap>
              <Typography.Title level={5} className="sim-create-modal__section-title" style={{ margin: 0 }}>
                {t('support.robot.instance.register.step2.section.modality')}
              </Typography.Title>
              <Button size="small" onClick={() => applyPresetFromComposition(selectedComposition)}>
                {t('support.robot.instance.register.step2.resetDefaults')}
              </Button>
            </Space>
            <div className="register-robot-instance-chip-row">
              {MODALITY_OPTIONS.map((d) => (
                <Tag.CheckableTag
                  key={d}
                  className="register-robot-instance-chip"
                  checked={enabledModalities.has(d)}
                  onChange={(checked) => toggleSet(setEnabledModalities, d, checked)}
                >
                  {d}
                </Tag.CheckableTag>
              ))}
            </div>
          </div>
          <div className="sim-create-modal__section">
            <Space align="center" style={{ width: '100%', justifyContent: 'space-between', marginBottom: 8 }} wrap>
              <Typography.Title level={5} className="sim-create-modal__section-title" style={{ margin: 0 }}>
                {t('support.robot.instance.register.step2.section.actions')}
              </Typography.Title>
              <Button size="small" onClick={() => applyPresetFromComposition(selectedComposition)}>
                {t('support.robot.instance.register.step2.resetDefaults')}
              </Button>
            </Space>
            <div className="register-robot-instance-chip-row">
              {ACTION_OPTIONS.map((d) => (
                <Tag.CheckableTag
                  key={d}
                  className="register-robot-instance-chip"
                  checked={enabledActions.has(d)}
                  onChange={(checked) => toggleSet(setEnabledActions, d, checked)}
                >
                  {d}
                </Tag.CheckableTag>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: currentStep === 2 ? undefined : 'none' }}>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
            {t('support.robot.instance.register.step3.lead')}
          </Typography.Paragraph>
          <Row gutter={[24, 24]} className="register-robot-instance-step3-split">
            <Col xs={24} lg={14}>
              <SimFormField
                name="connectionName"
                label={t('support.robot.instance.register.field.connectionName')}
                rules={[{ required: true, message: t('support.sim.create.validation.name') }]}
              >
                <Input allowClear autoComplete="off" />
              </SimFormField>
              <SimFormField
                name="rosDomainId"
                label={t('support.robot.instance.register.field.rosDomainId')}
                rules={[{ required: true, message: t('support.sim.create.validation.minSelect') }]}
              >
                <InputNumber min={0} max={232} style={{ width: '100%' }} />
              </SimFormField>
              <SimFormField
                name="agentEndpoint"
                label={t('support.robot.instance.register.field.agentEndpoint')}
                rules={[{ required: true, message: t('support.sim.create.validation.name') }]}
              >
                <Input allowClear autoComplete="off" placeholder="10.0.0.12:11811" />
              </SimFormField>
              <SimFormField name="ddsVendor" label={t('support.robot.instance.register.field.ddsVendor')} rules={[{ required: true }]}>
                <Select options={ddsOptions} />
              </SimFormField>
              <SimFormField name="networkInterface" label={t('support.robot.instance.register.field.networkInterface')} rules={[{ required: true }]}>
                <Input allowClear autoComplete="off" />
              </SimFormField>
              <Space wrap>
                <Button type="default" loading={testLoading} onClick={runTestConnection}>
                  {t('support.robot.instance.register.testConnection')}
                </Button>
                <Button onClick={discoverTopics}>{t('support.robot.instance.register.discoverTopics')}</Button>
              </Space>
            </Col>
            <Col xs={24} lg={10}>
              <Card size="small" bordered className="register-robot-instance-step3__status" title={t('support.robot.instance.register.status.title')}>
                <div style={{ marginBottom: 8 }}>{statusBadge}</div>
                {connectionStatus === 'unknown' ? (
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {t('support.robot.instance.register.status.hint')}
                  </Typography.Text>
                ) : null}
              </Card>
            </Col>
          </Row>
        </div>

        <div style={{ display: currentStep === 3 ? undefined : 'none' }}>
          <Card size="small" bordered style={{ marginBottom: 16 }} title={t('support.robot.instance.register.step4.summaryTitle')}>
            <Space size="large" wrap>
              <Typography.Text>
                <strong>24</strong> {t('support.robot.instance.register.step4.summary.topics')}
              </Typography.Text>
              <Typography.Text>
                <strong>18</strong> {t('support.robot.instance.register.step4.summary.matched')}
              </Typography.Text>
              <Typography.Text>
                <strong>6</strong> {t('support.robot.instance.register.step4.summary.review')}
              </Typography.Text>
            </Space>
          </Card>
          <div className="register-robot-instance-discovery-wrap">
            <Table<DiscoveryRow>
              size="small"
              sticky
              pagination={false}
              rowKey="key"
              dataSource={DISCOVERY_ROWS}
              columns={discoveryColumns}
              scroll={{ x: 960, y: 360 }}
            />
          </div>
          <Button type="dashed" style={{ marginTop: 12 }} block>
            {t('support.robot.instance.register.step4.addTopic')}
          </Button>
        </div>
      </Form>
    </CreateStepModalShell>
  );
}
