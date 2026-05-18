import { InboxOutlined } from '@ant-design/icons';
import { useCallback, useEffect, useMemo, useState, type MutableRefObject } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  List,
  Modal,
  Row,
  Segmented,
  Select,
  Space,
  Table,
  Tooltip,
  Tree,
  Typography,
  Upload,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { DataNode } from 'antd/es/tree';
import type { UploadChangeParam } from 'antd/es/upload';
import type { UploadFile } from 'antd/es/upload/interface';
import { useDescriptionScreen } from '../../shared/ui/common/DescriptionModeProvider';
import { useLocale } from '../../shared/i18n/LocaleProvider';
import './dev-data-register-page.css';
import './dev-data-register-wizard-vercel.css';

export type DataRegisterWizardApi = {
  saveDraft: () => void;
  submitRegister: () => void;
};

export interface DevDataRegisterPageProps {
  wizardApiRef: MutableRefObject<DataRegisterWizardApi | null>;
  /** When set with `onStepIndexChange`, step is controlled (GNB Steps). */
  stepIndex?: number;
  onStepIndexChange?: (step: number) => void;
}

function normFile(e: UploadChangeParam | UploadFile[]) {
  if (Array.isArray(e)) return e;
  return e?.fileList ?? [];
}

const DEMO_FILES = ['meta/info.json', 'data/chunk_000.parquet', 'videos/cam_high_ep0.mp4'];

const STRUCTURE_TREE: DataNode[] = [
  {
    title: 'dataset/',
    key: 'root',
    children: [
      { title: 'meta/', key: 'meta', children: [{ title: 'info.json', key: 'meta-info', isLeaf: true }] },
      { title: 'data/', key: 'data', children: [{ title: 'chunk_000.parquet', key: 'data-chunk', isLeaf: true }] },
      { title: 'videos/', key: 'videos', children: [{ title: 'cam_high_ep0.mp4', key: 'vid-0', isLeaf: true }] },
    ],
  },
];

const FILE_TREE: DataNode[] = [
  {
    title: 'datasets/',
    key: 'ds',
    children: [
      {
        title: 'lerobot_pick_v1/',
        key: 'lr',
        children: [
          { title: 'train/', key: 'train', children: [{ title: 'episode_000/', key: 'ep0', isLeaf: true }] },
        ],
      },
    ],
  },
];

type EpisodeRow = { key: string; episode: string; status: 'ok' | 'warn' };

/**
 * DV-DF-RG-001 — Data Register (Vercel layout parity: step panels + validation table + episode modal).
 */
export function DevDataRegisterPage({ wizardApiRef, stepIndex: stepIndexProp, onStepIndexChange }: DevDataRegisterPageProps) {
  const { t } = useLocale();
  const [form] = Form.useForm();
  const [localStep, setLocalStep] = useState(0);
  const controlled = typeof stepIndexProp === 'number' && typeof onStepIndexChange === 'function';
  const step = controlled ? stepIndexProp! : localStep;
  const setStep = (n: number) => {
    if (controlled) onStepIndexChange!(n);
    else setLocalStep(n);
  };

  const [episodeModalOpen, setEpisodeModalOpen] = useState(false);
  const [activeEpisode, setActiveEpisode] = useState<EpisodeRow | null>(null);
  const [segEpisode, setSegEpisode] = useState<string | number>('ok');
  const [issueNotes, setIssueNotes] = useState('');

  const descriptionMeta = useMemo(
    () => ({
      screenName: '데이터 등록(레지스터)',
      screenId: 'DV-DF-RG-001',
      screenDescription: 'Data Foundry 데이터 등록 마법사 (데모).',
      areas: [
        { id: 'dr-intake', name: '인테이크', role: '알림·초안', userAction: '확인', linkedScreen: '동일' },
        { id: 'dr-step1', name: '1단계', role: '파라미터·파일', userAction: '입력', linkedScreen: '동일' },
        { id: 'dr-step2', name: '2단계', role: '검증', userAction: '검토', linkedScreen: '동일' },
        { id: 'dr-footer', name: '하단', role: '이전·다음', userAction: '이동', linkedScreen: '동일' },
      ],
    }),
    [],
  );
  const { bindArea } = useDescriptionScreen(descriptionMeta);

  const episodeRows: EpisodeRow[] = useMemo(
    () => [
      { key: '1', episode: 'episode_000', status: 'ok' },
      { key: '2', episode: 'episode_001', status: 'ok' },
      { key: '3', episode: 'episode_002', status: 'warn' },
      { key: '4', episode: 'episode_003', status: 'ok' },
    ],
    [],
  );

  const saveDraft = useCallback(() => {
    void form.getFieldsValue();
    message.info(t('dataRegister.saveDraftToast'));
  }, [form, t]);

  const runFinalSubmit = useCallback(() => {
    form
      .validateFields()
      .then(() => {
        message.success(t('dataRegister.registerSuccessToast'));
      })
      .catch(() => {
        message.error(t('dataRegister.registerValidationToast'));
      });
  }, [form, t]);

  const submitRegister = useCallback(() => {
    if (step < 2) {
      if (step === 0) {
        void form
          .validateFields([
            'datasetName',
            'datasetSlug',
            'requiredInput',
            'modelRequired',
          ])
          .then(() => setStep(1))
          .catch(() => message.error(t('dataRegister.registerValidationToast')));
        return;
      }
      if (step === 1) {
        setStep(2);
        return;
      }
    }
    runFinalSubmit();
  }, [form, runFinalSubmit, setStep, step, t]);

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

  const stepClass = (base: string, activeStep: number) =>
    [base, step !== activeStep ? 'dev-data-register-step--hidden' : ''].filter(Boolean).join(' ');

  const openEpisode = (row: EpisodeRow) => {
    setActiveEpisode(row);
    setSegEpisode(row.status === 'warn' ? 'failed' : 'success');
    setIssueNotes('');
    setEpisodeModalOpen(true);
  };

  const columns: ColumnsType<EpisodeRow> = useMemo(
    () => [
      {
        title: t('dataRegister.table.preview'),
        key: 'thumb',
        width: 88,
        render: () => (
          <div className="dev-data-register-episode-thumb-cell">
            <span className="dev-data-register-episode-thumb" aria-hidden />
          </div>
        ),
      },
      {
        title: t('dataRegister.table.episode'),
        dataIndex: 'episode',
        key: 'episode',
      },
      {
        title: t('dataRegister.table.status'),
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (s: EpisodeRow['status']) =>
          s === 'ok' ? (
            <Typography.Text type="success">{t('dataRegister.status.ok')}</Typography.Text>
          ) : (
            <Typography.Text type="warning">{t('dataRegister.status.warn')}</Typography.Text>
          ),
      },
      {
        title: t('dataRegister.table.actions'),
        key: 'actions',
        width: 100,
        render: (_: unknown, row: EpisodeRow) => (
          <Button type="link" size="small" onClick={() => openEpisode(row)}>
            {t('dataRegister.table.review')}
          </Button>
        ),
      },
    ],
    [t],
  );

  const draftItems = useMemo(
    () => [
      { title: 'draft_pick_place_v0.json', desc: '2h ago' },
      { title: 'draft_stack_cubes_v1.json', desc: 'Yesterday' },
    ],
    [],
  );

  return (
    <div className="dev-data-register" {...bindArea('dr-intake')}>
      <Form form={form} layout="vertical" requiredMark colon={false} scrollToFirstError className="dev-data-register-form">
        <div className={stepClass('dev-data-register-step--dataset', 0)}>
          <List
            bordered
            dataSource={draftItems}
            header={<Typography.Text strong>{t('dataRegister.draftsTitle')}</Typography.Text>}
            renderItem={(item) => (
              <List.Item className="dev-data-register-draft-row">
                <List.Item.Meta title={item.title} description={item.desc} />
              </List.Item>
            )}
            style={{ marginBottom: 12 }}
          />

          <Alert
            type="info"
            showIcon
            className="dev-data-register-intake-alert"
            message={t('dataRegister.intakeTitle')}
            description={t('dataRegister.intakeDesc')}
          />

          <Row gutter={[24, 24]} className="dev-data-register-step1-row">
            <Col xs={24} lg={9} {...bindArea('dr-step1')}>
              <Card title={t('dataRegister.card.datasetParams')} bordered className="dev-data-register-step1-card">
                <Form.Item
                  name="datasetName"
                  label={t('dataRegister.field.datasetName')}
                  rules={[{ required: true, message: t('dataRegister.validation.required') }]}
                >
                  <Input placeholder={t('dataRegister.placeholder.enterText')} allowClear />
                </Form.Item>
                <Form.Item
                  name="datasetSlug"
                  label={t('dataRegister.field.datasetSlug')}
                  rules={[{ required: true, message: t('dataRegister.validation.required') }]}
                >
                  <Input placeholder="lerobot_pick_v1" allowClear />
                </Form.Item>
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
            <Col xs={24} lg={15}>
              <Card title={t('dataRegister.card.fileSelection')} bordered className="dev-data-register-step1-card dev-data-register-file-select-card">
                <div className="dev-data-register-file-tree-scroll">
                  <Tree showLine defaultExpandAll treeData={FILE_TREE} />
                </div>
                <div className="dev-data-register-upload-pane">
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
                  <Typography.Text type="secondary" className="dev-data-register-upload-structure-label">
                    {t('dataRegister.uploadedFiles')}
                  </Typography.Text>
                  <div className="dev-data-register-files-and-folder-upload">
                    <div className="dev-data-register-upload-list">
                      {DEMO_FILES.map((name) => (
                        <div key={name} className="dev-data-register-upload-list-row">
                          <span className="dev-data-register-upload-list-name">{name}</span>
                          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                            OK
                          </Typography.Text>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Typography.Text type="secondary" className="dev-data-register-upload-structure-label">
                    {t('dataRegister.fileStructure')}
                  </Typography.Text>
                  <div className="dev-data-register-upload-structure-scroll">
                    <Tree showLine defaultExpandAll treeData={STRUCTURE_TREE} />
                  </div>
                  <Form.Item name="promptText" label={t('dataRegister.field.textPrompt')} style={{ marginBottom: 0, marginTop: 12 }}>
                    <Input.TextArea rows={4} placeholder={t('dataRegister.placeholder.description')} allowClear />
                  </Form.Item>
                </div>
              </Card>
            </Col>
          </Row>
        </div>

        <div className={stepClass('dev-data-register-step--validation', 1)} {...bindArea('dr-step2')}>
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Card title={t('dataRegister.validation.cardTitle')} bordered>
                <div className="dev-data-register-validation-summary-cards">
                  <Row gutter={[10, 10]}>
                    <Col xs={24} sm={8}>
                      <Card size="small" bordered className="dev-data-register-validation-summary-card">
                        <Typography.Text className="dev-data-register-validation-summary-card__label" type="secondary">
                          {t('dataRegister.validation.passed')}
                        </Typography.Text>
                        <Typography.Title level={3} className="dev-data-register-validation-summary-card__value">
                          142
                        </Typography.Title>
                      </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Card size="small" bordered className="dev-data-register-validation-summary-card">
                        <Typography.Text className="dev-data-register-validation-summary-card__label" type="secondary">
                          {t('dataRegister.validation.failed')}
                        </Typography.Text>
                        <Typography.Title level={3} className="dev-data-register-validation-summary-card__value">
                          1
                        </Typography.Title>
                      </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Card size="small" bordered className="dev-data-register-validation-summary-card">
                        <Typography.Text className="dev-data-register-validation-summary-card__label" type="secondary">
                          {t('dataRegister.validation.episodes')}
                        </Typography.Text>
                        <Typography.Title level={3} className="dev-data-register-validation-summary-card__value">
                          48
                        </Typography.Title>
                      </Card>
                    </Col>
                  </Row>
                </div>
                <div className="dev-data-register-validation-done">
                  <div className="dev-data-register-episode-table-wrap">
                    <Table<EpisodeRow>
                      size="small"
                      rowKey="key"
                      pagination={false}
                      columns={columns}
                      dataSource={episodeRows}
                      scroll={{ y: 280 }}
                    />
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </div>

        <div className={stepClass('dev-data-register-step--complete', 2)}>
          <Card bordered>
            <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center', padding: '24px 8px' }}>
              <Typography.Title level={4} style={{ margin: 0 }}>
                {t('dataRegister.complete.title')}
              </Typography.Title>
              <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                {t('dataRegister.complete.subtitle')}
              </Typography.Paragraph>
            </Space>
          </Card>
        </div>

        <Row justify="space-between" align="middle" className="dev-data-register-footer" {...bindArea('dr-footer')} gutter={[12, 12]}>
          <Col>
            <Space>
              <Tooltip title={step === 0 ? t('dataRegister.previousDisabledHint') : undefined}>
                <span>
                  <Button disabled={step === 0} onClick={() => setStep(Math.max(0, step - 1))}>
                    {t('dataRegister.previous')}
                  </Button>
                </span>
              </Tooltip>
              {step < 2 ? (
                <Button type="primary" onClick={() => void submitRegister()}>
                  {t('dataRegister.next')}
                </Button>
              ) : (
                <Button type="primary" onClick={() => void runFinalSubmit()}>
                  {t('dataRegister.done')}
                </Button>
              )}
            </Space>
          </Col>
          <Col flex="1" style={{ textAlign: 'end' }}>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {t('dataRegister.footer.hint')}
            </Typography.Text>
          </Col>
        </Row>
      </Form>

      <Modal
        open={episodeModalOpen}
        title={null}
        onCancel={() => setEpisodeModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setEpisodeModalOpen(false)}>
            {t('dataRegister.back')}
          </Button>,
          <Button key="save" type="primary" onClick={() => setEpisodeModalOpen(false)}>
            {t('dataRegister.episodeModal.save')}
          </Button>,
        ]}
        width={720}
        className="dev-data-register-episode-modal"
        destroyOnClose
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }} wrap>
            <Typography.Title level={4} className="dev-data-register-episode-modal-header-title">
              {t('dataRegister.episodeModal.title')}
              {activeEpisode ? ` — ${activeEpisode.episode}` : ''}
            </Typography.Title>
            <Segmented
              className="dev-data-register-episode-status-segmented"
              value={segEpisode}
              onChange={setSegEpisode}
              options={[
                { label: t('dataRegister.status.ok'), value: 'success', className: 'dev-data-register-episode-seg-success' },
                { label: t('dataRegister.status.warn'), value: 'failed', className: 'dev-data-register-episode-seg-failed' },
              ]}
            />
          </Space>
          <div className="dev-data-register-episode-cam" aria-hidden>
            <Typography.Text className="dev-data-register-episode-cam-label" type="secondary">
              cam_high · {activeEpisode?.episode ?? '—'}
            </Typography.Text>
          </div>
          <div>
            <Typography.Text strong>{t('dataRegister.episodeModal.issue')}</Typography.Text>
            <Input.TextArea rows={5} value={issueNotes} onChange={(e) => setIssueNotes(e.target.value)} maxLength={500} />
            <Typography.Text type="secondary" className="dev-data-register-episode-modal-issue-count">
              {issueNotes.length} / 500
            </Typography.Text>
          </div>
        </Space>
      </Modal>
    </div>
  );
}
