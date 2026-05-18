import { App, Button, Card, Form, Input, Select, Space, Typography, theme } from 'antd';
import { useEffect, useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { patchSupportComposition, getSupportCompositionsMock } from '../../mocks/supportCompositionsMock';
import {
  getSupportDefinitionDeviceById,
  getSupportDefinitionModelById,
  patchSupportDefinitionDevice,
  patchSupportDefinitionModel,
} from '../../mocks/supportDefinitionMock';
import { getSupportTasksMock, patchSupportTask, type SupportTaskStatus } from '../../mocks/supportTasksMock';
import { supportRobotWorkspaceDetailPath } from '../../shared/config/supportPaths';
import { useLocale } from '../../shared/i18n/LocaleProvider';
import { SimFormField } from './simulation/create/SimFormField';
import type { SupportDetailMode } from './SupportWorkspaceDetailPage';
import { SupportWorkspaceDrillFrame } from './SupportWorkspaceDrillFrame';
import '../dev/dev-data-foundry-page.css';
import './support-workspace-detail-page.css';

export interface SupportWorkspaceEditPageProps {
  entityId: string;
  mode: SupportDetailMode;
  listPath: string;
  embedDrillChrome?: boolean;
}

export function SupportWorkspaceEditPage({ entityId, mode, listPath, embedDrillChrome = false }: SupportWorkspaceEditPageProps) {
  const { token } = theme.useToken();
  const { t } = useLocale();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const detailPath = useMemo(() => {
    const lnb =
      mode === 'model'
        ? 'definition-robot'
        : mode === 'device'
          ? 'definition-devices'
          : mode === 'composition'
            ? 'compositions'
            : 'task';
    return supportRobotWorkspaceDetailPath(lnb, entityId);
  }, [entityId, mode]);

  const modelRow = mode === 'model' ? getSupportDefinitionModelById(entityId) : null;
  const deviceRow = mode === 'device' ? getSupportDefinitionDeviceById(entityId) : null;
  const compositionFromList = useMemo(() => {
    if (mode !== 'composition') return null;
    return getSupportCompositionsMock().find((c) => c.id === entityId) ?? null;
  }, [mode, entityId]);

  const taskRow = mode === 'task' ? getSupportTasksMock().find((r) => r.id === entityId) ?? null : null;

  const found =
    (mode === 'model' && modelRow) ||
    (mode === 'device' && deviceRow) ||
    (mode === 'composition' && compositionFromList) ||
    (mode === 'task' && taskRow);

  useEffect(() => {
    if (!found) return;
    if (mode === 'model' && modelRow) {
      form.setFieldsValue({
        name: modelRow.name,
        displayName: modelRow.displayName,
        subtitle: modelRow.subtitle,
        description: modelRow.description,
        manufacturer: modelRow.manufacturer,
        modelName: modelRow.modelName,
        modelVariant: modelRow.modelVariant,
        projectName: modelRow.projectName,
      });
    } else if (mode === 'device' && deviceRow) {
      form.setFieldsValue({
        name: deviceRow.name,
        displayName: deviceRow.displayName ?? '',
        subtitle: deviceRow.subtitle,
        description: deviceRow.description ?? '',
        manufacturer: deviceRow.manufacturer ?? '',
        modelName: deviceRow.modelName ?? '',
        modelVariant: deviceRow.modelVariant ?? '',
        equipmentKind: deviceRow.equipmentKind,
        equipmentSummary: deviceRow.equipmentSummary,
        projectName: deviceRow.projectName,
      });
    } else if (mode === 'composition' && compositionFromList) {
      form.setFieldsValue({
        name: compositionFromList.name,
        subtitle: compositionFromList.subtitle,
        projectName: compositionFromList.projectName,
        compatibilitySummary: compositionFromList.compatibilitySummary ?? '',
      });
    } else if (mode === 'task' && taskRow) {
      form.setFieldsValue({
        title: taskRow.title,
        subtitle: taskRow.subtitle,
        taskDescription: taskRow.taskDescription,
        example: taskRow.example ?? '',
        status: taskRow.status,
      });
    }
  }, [found, form, mode, modelRow, deviceRow, compositionFromList, taskRow]);

  if (!found) {
    return <Navigate to={listPath} replace />;
  }

  const submit = async () => {
    try {
      const v = await form.validateFields();
      if (mode === 'model' && modelRow) {
        patchSupportDefinitionModel(entityId, {
          name: String(v.name).trim(),
          displayName: String(v.displayName).trim(),
          subtitle: String(v.subtitle ?? '').trim(),
          description: String(v.description ?? '').trim(),
          manufacturer: String(v.manufacturer).trim(),
          modelName: String(v.modelName).trim(),
          modelVariant: String(v.modelVariant).trim(),
          projectName: String(v.projectName ?? '').trim(),
        });
      } else if (mode === 'device' && deviceRow) {
        patchSupportDefinitionDevice(entityId, {
          name: String(v.name).trim(),
          displayName: String(v.displayName ?? '').trim(),
          subtitle: String(v.subtitle ?? '').trim(),
          description: String(v.description ?? '').trim(),
          manufacturer: String(v.manufacturer ?? '').trim(),
          modelName: String(v.modelName ?? '').trim(),
          modelVariant: String(v.modelVariant ?? '').trim(),
          equipmentKind: String(v.equipmentKind).trim(),
          equipmentSummary: String(v.equipmentSummary ?? '').trim(),
          projectName: String(v.projectName ?? '').trim(),
        });
      } else if (mode === 'composition' && compositionFromList) {
        patchSupportComposition(entityId, {
          name: String(v.name).trim(),
          subtitle: String(v.subtitle ?? '').trim(),
          projectName: String(v.projectName ?? '').trim(),
          compatibilitySummary: String(v.compatibilitySummary ?? '').trim(),
        });
      } else if (mode === 'task' && taskRow) {
        patchSupportTask(entityId, {
          title: String(v.title).trim(),
          subtitle: String(v.subtitle ?? '').trim(),
          taskDescription: String(v.taskDescription ?? '').trim(),
          example: String(v.example ?? '').trim() || undefined,
          status: v.status as SupportTaskStatus,
        });
      }
      message.success(t('support.robot.edit.saved'));
      navigate(detailPath);
    } catch {
      /* validation */
    }
  };

  const statusOptions: { value: SupportTaskStatus; label: string }[] = [
    { value: 'draft', label: t('support.robot.task.status.draft') },
    { value: 'active', label: t('support.robot.task.status.active') },
    { value: 'done', label: t('support.robot.task.status.done') },
  ];

  return (
    <div className="domain-workspace-route-root">
      <SupportWorkspaceDrillFrame
        backLabel={t('support.robot.detail.back')}
        onBack={() => navigate(listPath)}
        embedInPortalHeader={embedDrillChrome}
      >
        <div className="support-workspace-detail-page">
          <Card
            size="small"
            bordered
            style={{ borderColor: token.colorBorderSecondary, marginBottom: 16 }}
          >
            <Typography.Title level={4} style={{ marginTop: 0 }}>
              {t('support.robot.edit.pageTitle')}
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
              {t('support.robot.edit.lead')}
            </Typography.Paragraph>
          </Card>

          <Card size="small" bordered style={{ borderColor: token.colorBorderSecondary }}>
            <Form form={form} layout="vertical" requiredMark>
              {mode === 'model' ? (
                <>
                  <SimFormField name="name" label={t('support.robot.edit.field.catalogName')} rules={[{ required: true }]}>
                    <Input allowClear />
                  </SimFormField>
                  <SimFormField name="displayName" label={t('support.robot.edit.field.displayName')} rules={[{ required: true }]}>
                    <Input allowClear />
                  </SimFormField>
                  <SimFormField name="subtitle" label={t('support.robot.edit.field.subtitle')}>
                    <Input allowClear />
                  </SimFormField>
                  <SimFormField name="description" label={t('support.robot.edit.field.description')}>
                    <Input.TextArea rows={4} allowClear />
                  </SimFormField>
                  <SimFormField name="manufacturer" label={t('support.robot.create.model.field.manufacturer')} rules={[{ required: true }]}>
                    <Input allowClear />
                  </SimFormField>
                  <SimFormField name="modelName" label={t('support.robot.create.model.field.modelName')} rules={[{ required: true }]}>
                    <Input allowClear />
                  </SimFormField>
                  <SimFormField name="modelVariant" label={t('support.robot.create.model.field.modelVariant')} rules={[{ required: true }]}>
                    <Input allowClear />
                  </SimFormField>
                  <SimFormField name="projectName" label={t('support.robot.edit.field.projectName')}>
                    <Input allowClear />
                  </SimFormField>
                </>
              ) : null}

              {mode === 'device' ? (
                <>
                  <SimFormField name="name" label={t('support.robot.edit.field.catalogName')} rules={[{ required: true }]}>
                    <Input allowClear />
                  </SimFormField>
                  <SimFormField name="displayName" label={t('support.robot.edit.field.displayName')}>
                    <Input allowClear />
                  </SimFormField>
                  <SimFormField name="subtitle" label={t('support.robot.edit.field.subtitle')}>
                    <Input allowClear />
                  </SimFormField>
                  <SimFormField name="description" label={t('support.robot.edit.field.description')}>
                    <Input.TextArea rows={4} allowClear />
                  </SimFormField>
                  <SimFormField name="manufacturer" label={t('support.robot.create.model.field.manufacturer')}>
                    <Input allowClear />
                  </SimFormField>
                  <SimFormField name="modelName" label={t('support.robot.create.model.field.modelName')}>
                    <Input allowClear />
                  </SimFormField>
                  <SimFormField name="modelVariant" label={t('support.robot.create.model.field.modelVariant')}>
                    <Input allowClear />
                  </SimFormField>
                  <SimFormField name="equipmentKind" label={t('support.robot.edit.field.equipmentKind')} rules={[{ required: true }]}>
                    <Input allowClear />
                  </SimFormField>
                  <SimFormField name="equipmentSummary" label={t('support.robot.edit.field.equipmentSummary')}>
                    <Input.TextArea rows={3} allowClear />
                  </SimFormField>
                  <SimFormField name="projectName" label={t('support.robot.edit.field.projectName')}>
                    <Input allowClear />
                  </SimFormField>
                </>
              ) : null}

              {mode === 'composition' ? (
                <>
                  <SimFormField name="name" label={t('support.robot.edit.field.bundleName')} rules={[{ required: true }]}>
                    <Input allowClear />
                  </SimFormField>
                  <SimFormField name="subtitle" label={t('support.robot.edit.field.subtitle')}>
                    <Input allowClear />
                  </SimFormField>
                  <SimFormField name="projectName" label={t('support.robot.edit.field.projectName')}>
                    <Input allowClear />
                  </SimFormField>
                  <SimFormField name="compatibilitySummary" label={t('support.robot.edit.field.compatibilitySummary')}>
                    <Input.TextArea rows={3} allowClear />
                  </SimFormField>
                </>
              ) : null}

              {mode === 'task' ? (
                <>
                  <SimFormField name="title" label={t('support.robot.edit.field.taskTitle')} rules={[{ required: true }]}>
                    <Input allowClear />
                  </SimFormField>
                  <SimFormField name="subtitle" label={t('support.robot.edit.field.subtitle')}>
                    <Input allowClear />
                  </SimFormField>
                  <SimFormField name="taskDescription" label={t('support.robot.edit.field.taskDescription')} rules={[{ required: true }]}>
                    <Input.TextArea rows={4} allowClear />
                  </SimFormField>
                  <SimFormField name="example" label={t('support.robot.create.taskType.field.example')}>
                    <Input.TextArea rows={3} allowClear />
                  </SimFormField>
                  <SimFormField name="status" label={t('support.robot.edit.field.status')} rules={[{ required: true }]}>
                    <Select options={statusOptions} />
                  </SimFormField>
                </>
              ) : null}

              <Space style={{ marginTop: 16 }}>
                <Button type="primary" onClick={() => void submit()}>
                  {t('support.robot.edit.save')}
                </Button>
                <Button onClick={() => navigate(detailPath)}>{t('support.sim.create.cancel')}</Button>
              </Space>
            </Form>
          </Card>
        </div>
      </SupportWorkspaceDrillFrame>
    </div>
  );
}
