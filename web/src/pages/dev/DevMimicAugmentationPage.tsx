import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import { Button, Card, Col, Form, Input, InputNumber, Progress, Row, Slider, Typography, message, theme } from 'antd';
import { useDescriptionScreen } from '../../shared/ui/common/DescriptionModeProvider';
import { useLocale } from '../../shared/i18n/LocaleProvider';
import './dev-mimic-augmentation-page.css';

export type MimicAugmentationWizardApi = {
  saveDraft: () => void;
  submitGenerate: () => void;
};

export interface DevMimicAugmentationPageProps {
  wizardApiRef: MutableRefObject<MimicAugmentationWizardApi | null>;
  onProgressChange?: (percent: number) => void;
}

export function DevMimicAugmentationPage({ wizardApiRef, onProgressChange }: DevMimicAugmentationPageProps) {
  const { t } = useLocale();
  const { token } = theme.useToken();
  const [form] = Form.useForm<{ runName: string; seed: number; augmentCount: number; simInput: string }>();
  const [progress, setProgress] = useState(0);
  const [clones, setClones] = useState<{ id: string; index: number }[]>([]);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const descriptionMeta = useMemo(
    () => ({
      screenName: '데이터 파운드리·미믹 증강',
      screenId: 'DV-DF-MA-001',
      screenDescription:
        'Generate 경로에서 시뮬레이션 입력을 복제·증강하여 다수의 변형 시뮬레이션 썸네일을 만드는 화면입니다. 좌측 파라미터와 시뮬 입력, 상단 진행률로 작업 상태를 표현합니다.',
      areas: [
        { id: 'ma-progress', name: '진행률', role: '증강 작업 진행 표시', userAction: '상태 확인', linkedScreen: '동일' },
        { id: 'ma-form', name: '파라미터·시뮬 입력', role: '런 이름·시드·개수·시뮬 JSON', userAction: '입력·미리보기', linkedScreen: '동일' },
        { id: 'ma-preview', name: '입력·복제 미리보기', role: '원본 대형·복제 썸네일', userAction: '미리보기', linkedScreen: '동일' },
      ],
    }),
    [],
  );
  const { bindArea } = useDescriptionScreen(descriptionMeta);

  const clearProgressTimer = useCallback(() => {
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
  }, []);

  const runAugmentationPreview = useCallback(() => {
    const simInput = form.getFieldValue('simInput') ?? '';
    if (!String(simInput).trim()) {
      message.warning(t('mimicAugmentation.validationSimRequired'));
      return;
    }
    const count = Math.min(24, Math.max(2, Number(form.getFieldValue('augmentCount') ?? 6)));
    clearProgressTimer();
    setProgress(5);
    setClones(Array.from({ length: count }, (_, i) => ({ id: `aug-${i}`, index: i + 1 })));
    let p = 5;
    progressTimer.current = setInterval(() => {
      p += Math.random() * 18 + 6;
      if (p >= 100) {
        p = 100;
        clearProgressTimer();
      }
      setProgress(Math.round(p));
    }, 140);
  }, [clearProgressTimer, form, t]);

  useEffect(() => () => clearProgressTimer(), [clearProgressTimer]);

  useEffect(() => {
    onProgressChange?.(progress);
  }, [progress, onProgressChange]);

  const saveDraft = useCallback(() => {
    void form.getFieldsValue();
    message.info(t('mimicAugmentation.saveDraftToast'));
  }, [form, t]);

  const submitGenerate = useCallback(() => {
    runAugmentationPreview();
    message.success(t('mimicAugmentation.generateStartedToast'));
  }, [runAugmentationPreview, t]);

  useEffect(() => {
    wizardApiRef.current = { saveDraft, submitGenerate };
    return () => {
      wizardApiRef.current = null;
    };
  }, [wizardApiRef, saveDraft, submitGenerate]);

  const simInput = Form.useWatch('simInput', form) ?? '';

  return (
    <div className="dev-mimic-augmentation domain-workspace-route-root">
      <div className="dev-mimic-augmentation-inner">
        <div className="dev-mimic-augmentation-progress-wrap" {...bindArea('ma-progress')}>
          <Typography.Text type="secondary" className="dev-mimic-augmentation-progress-label">
            {t('mimicAugmentation.progressLabel')}
          </Typography.Text>
          <Progress percent={progress} status={progress >= 100 ? 'success' : 'active'} strokeColor={token.colorPrimary} />
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={9} {...bindArea('ma-form')}>
            <Card title={t('mimicAugmentation.panelParams')} bordered>
              <Form
                form={form}
                layout="vertical"
                colon={false}
                initialValues={{ runName: 'mimic-run-001', seed: 42, augmentCount: 6, simInput: '' }}
              >
                <Form.Item name="runName" label={t('mimicAugmentation.fieldRunName')}>
                  <Input allowClear />
                </Form.Item>
                <Form.Item name="seed" label={t('mimicAugmentation.fieldSeed')}>
                  <InputNumber style={{ width: '100%' }} min={0} max={999999} />
                </Form.Item>
                <Form.Item name="augmentCount" label={t('mimicAugmentation.fieldAugmentCount')}>
                  <Slider min={2} max={12} marks={{ 2: '2', 6: '6', 12: '12' }} />
                </Form.Item>
                <Form.Item name="simInput" label={t('mimicAugmentation.fieldSimInput')}>
                  <Input.TextArea rows={10} placeholder={t('mimicAugmentation.simPlaceholder')} spellCheck={false} />
                </Form.Item>
                <Button type="default" block onClick={runAugmentationPreview}>
                  {t('mimicAugmentation.previewButton')}
                </Button>
              </Form>
            </Card>
          </Col>
          <Col xs={24} lg={15} {...bindArea('ma-preview')}>
            <Typography.Title level={5} className="dev-mimic-augmentation-preview-heading">
              {t('mimicAugmentation.primarySimHeading')}
            </Typography.Title>
            <div
              className="dev-mimic-augmentation-primary"
              style={{ borderColor: token.colorBorder, background: token.colorFillAlter }}
            >
              {simInput.trim() ? (
                <pre className="dev-mimic-augmentation-primary-pre">{simInput}</pre>
              ) : (
                <Typography.Text type="secondary">{t('mimicAugmentation.primaryPlaceholder')}</Typography.Text>
              )}
            </div>

            {clones.length > 0 && (
              <>
                <Typography.Title level={5} className="dev-mimic-augmentation-clones-heading">
                  {t('mimicAugmentation.clonesHeading')} ({clones.length})
                </Typography.Title>
                <div className="dev-mimic-augmentation-clones">
                  {clones.map((c) => (
                    <div
                      key={c.id}
                      className="dev-mimic-augmentation-thumb"
                      style={{
                        background: `linear-gradient(135deg, ${token.colorPrimaryBg}, ${token.colorPrimary}33)`,
                        borderColor: token.colorBorderSecondary,
                      }}
                      title={`${t('mimicAugmentation.thumbTitlePrefix')} ${c.index}`}
                    >
                      <span className="dev-mimic-augmentation-thumb-label">#{c.index}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
}
