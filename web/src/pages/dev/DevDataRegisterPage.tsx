import { useCallback, useEffect, useMemo, type MutableRefObject } from 'react';
import { InboxOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Space,
  Tooltip,
  Upload,
  message,
} from 'antd';
import type { UploadChangeParam } from 'antd/es/upload';
import type { UploadFile } from 'antd/es/upload/interface';
import { useDescriptionScreen } from '../../shared/ui/common/DescriptionModeProvider';
import { useLocale } from '../../shared/i18n/LocaleProvider';
import './dev-data-register-page.css';

export type DataRegisterWizardApi = {
  saveDraft: () => void;
  submitRegister: () => void;
};

export interface DevDataRegisterPageProps {
  wizardApiRef: MutableRefObject<DataRegisterWizardApi | null>;
}

function normFile(e: UploadChangeParam | UploadFile[]) {
  if (Array.isArray(e)) return e;
  return e?.fileList ?? [];
}

/**
 * DV-DF-RG-001 — Data Register (Data Foundry · step 1).
 * Layout inspired by wireframe; structure uses Ant Design Form, Card, Steps, Upload.Dragger.
 * Job title and steps are shown in the GNB (DomainHomeLayout).
 */
export function DevDataRegisterPage({ wizardApiRef }: DevDataRegisterPageProps) {
  const { t } = useLocale();
  const [form] = Form.useForm();

  const descriptionMeta = useMemo(
    () => ({
      screenName: '데이터 등록(레지스터)',
      screenId: 'DV-DF-RG-001',
      screenDescription:
        '데이터 파운드리에서 기존 데이터를 플랫폼에 등록하는 마법사 1단계입니다. 메타데이터·태그·파일 업로드 후 전처리·저장 단계로 이어집니다.',
      areas: [
        { id: 'dr-params', name: '데이터셋 파라미터', role: '필수·선택 필드·태그', userAction: '입력', linkedScreen: '동일' },
        { id: 'dr-files', name: '파일 설정', role: '업로드·프롬프트', userAction: '파일 추가', linkedScreen: '동일' },
        { id: 'dr-footer', name: '하단 액션', role: '이전·등록', userAction: '등록 시도', linkedScreen: '동일' },
      ],
    }),
    [],
  );
  const { bindArea } = useDescriptionScreen(descriptionMeta);

  const saveDraft = useCallback(() => {
    void form.getFieldsValue();
    message.info(t('dataRegister.saveDraftToast'));
  }, [form, t]);

  const submitRegister = useCallback(() => {
    form
      .validateFields()
      .then(() => {
        message.success(t('dataRegister.registerSuccessToast'));
      })
      .catch(() => {
        message.error(t('dataRegister.registerValidationToast'));
      });
  }, [form, t]);

  useEffect(() => {
    wizardApiRef.current = { saveDraft, submitRegister };
    return () => {
      wizardApiRef.current = null;
    };
  }, [wizardApiRef, saveDraft, submitRegister]);

  const modelOptions = useMemo(
    () => [
      { value: 'm1', label: t('dataRegister.modelOption1') },
      { value: 'm2', label: t('dataRegister.modelOption2') },
    ],
    [t],
  );

  return (
    <div className="dev-data-register">
      <Form form={form} layout="vertical" requiredMark colon={false} scrollToFirstError className="dev-data-register-form">
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={9} {...bindArea('dr-params')}>
            <Card title={t('dataRegister.panel.params')} bordered>
              <Form.Item
                name="requiredInput"
                label={t('dataRegister.field.requiredInput')}
                rules={[{ required: true, message: t('dataRegister.validation.required') }]}
              >
                <Input placeholder={t('dataRegister.placeholder.short')} allowClear />
              </Form.Item>
              <Form.Item name="optionalInput" label={t('dataRegister.field.optionalInput')}>
                <Input placeholder={t('dataRegister.placeholder.enterText')} allowClear />
              </Form.Item>
              <Form.Item name="descriptionBig" label={t('dataRegister.field.descriptionBig')}>
                <Input.TextArea rows={4} placeholder={t('dataRegister.placeholder.description')} allowClear />
              </Form.Item>
              <Form.Item
                name="modelRequired"
                label={t('dataRegister.field.modelRequired')}
                rules={[{ required: true, message: t('dataRegister.validation.chooseModel') }]}
              >
                <Select placeholder={t('dataRegister.placeholder.chooseModel')} options={modelOptions} allowClear />
              </Form.Item>
              <Form.Item name="modelOptional" label={t('dataRegister.field.modelOptional')}>
                <Select placeholder={t('dataRegister.placeholder.chooseModel')} options={modelOptions} allowClear />
              </Form.Item>
              <Form.Item name="tags" label={t('dataRegister.field.tags')} initialValue={['tag1', 'tag2', 'tag3', 'tag4']}>
                <Select mode="tags" placeholder={t('dataRegister.placeholder.short')} tokenSeparators={[',']} />
              </Form.Item>
            </Card>
          </Col>
          <Col xs={24} lg={15} {...bindArea('dr-files')}>
            <Card title={t('dataRegister.panel.files')} bordered>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Form.Item name="files" valuePropName="fileList" getValueFromEvent={normFile} style={{ marginBottom: 0 }}>
                  <Upload.Dragger multiple beforeUpload={() => false} className="dev-data-register-upload">
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">{t('dataRegister.uploadHint')}</p>
                    <Button type="primary" htmlType="button">
                      {t('dataRegister.fileUpload')}
                    </Button>
                  </Upload.Dragger>
                </Form.Item>
                <Form.Item name="promptText" label={t('dataRegister.field.textPrompt')} style={{ marginBottom: 0 }}>
                  <Input.TextArea rows={6} placeholder={t('dataRegister.placeholder.description')} allowClear />
                </Form.Item>
              </Space>
            </Card>
          </Col>
        </Row>

        <Row justify="space-between" align="middle" className="dev-data-register-footer" {...bindArea('dr-footer')}>
          <Col>
            <Tooltip title={t('dataRegister.previousDisabledHint')}>
              <span>
                <Button disabled>{t('dataRegister.previous')}</Button>
              </span>
            </Tooltip>
          </Col>
          <Col>
            <Button type="primary" onClick={submitRegister}>
              {t('dataRegister.register')}
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
