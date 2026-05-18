import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Space, Steps, Typography } from 'antd';
import { useMemo } from 'react';
import { useLocale } from '../../i18n/LocaleProvider';
import { DomainGnbActionIcons } from '../common/DomainGnbActionIcons';
import { ThemeToggle } from '../common/ThemeToggle';
import type { DataFoundryJob } from './dataFoundryJobTypes';

export interface DataFoundryJobGnbProps {
  job: Exclude<DataFoundryJob, null>;
  mimicProgress: number;
  /** When `job === 'register'`, drives Ant Steps `current` (0 = Register, 1 = Pre-processor, 2 = Save). */
  dataRegisterStepIndex?: number;
  onBack: () => void;
  onSaveDraftRegister?: () => void;
  onSubmitRegister?: () => void;
  onSaveDraftMimic?: () => void;
  onSubmitMimic?: () => void;
}

export function DataFoundryJobGnb({
  job,
  mimicProgress,
  dataRegisterStepIndex,
  onBack,
  onSaveDraftRegister,
  onSubmitRegister,
  onSaveDraftMimic,
  onSubmitMimic,
}: DataFoundryJobGnbProps) {
  const { t } = useLocale();
  const title = useMemo(() => {
    switch (job) {
      case 'register':
        return t('dataRegister.pageTitle');
      case 'generate-pick':
        return t('dataGenerate.pageTitle');
      case 'mimic-augmentation':
        return t('mimicAugmentation.pageTitle');
      case 'collect':
        return t('dataFoundry.card.collect.title');
      case 'curate':
        return t('dataFoundry.card.curate.title');
      default:
        return '';
    }
  }, [job, t]);

  const stepItems = useMemo(() => {
    switch (job) {
      case 'register':
        return [
          { title: t('dataRegister.step.register') },
          { title: t('dataRegister.step.preprocessor') },
          { title: t('dataRegister.step.save') },
        ];
      case 'generate-pick':
        return [
          { title: t('dataGenerate.step.choose') },
          { title: t('dataGenerate.step.run') },
        ];
      case 'mimic-augmentation':
        return [
          { title: t('mimicAugmentation.step.params') },
          { title: t('mimicAugmentation.step.augment') },
          { title: t('mimicAugmentation.step.done') },
        ];
      case 'collect':
        return [
          { title: t('collectJob.step.setup') },
          { title: t('collectJob.step.session') },
          { title: t('collectJob.step.review') },
        ];
      case 'curate':
        return [
          { title: t('curateJob.step.select') },
          { title: t('curateJob.step.merge') },
          { title: t('curateJob.step.publish') },
        ];
      default:
        return [];
    }
  }, [job, t]);

  const currentStep = useMemo(() => {
    if (job === 'mimic-augmentation') {
      if (mimicProgress >= 100) return 2;
      if (mimicProgress > 0) return 1;
      return 0;
    }
    if (job === 'register' && typeof dataRegisterStepIndex === 'number') {
      return dataRegisterStepIndex;
    }
    return 0;
  }, [job, mimicProgress, dataRegisterStepIndex]);

  const trailingActions = useMemo(() => {
    if (job === 'register') {
      return (
        <Space size={8} wrap className="domain-gnb-job-actions">
          <Button onClick={onSaveDraftRegister}>{t('dataRegister.saveDraft')}</Button>
          <Button type="primary" onClick={onSubmitRegister}>
            {t('dataRegister.register')}
          </Button>
        </Space>
      );
    }
    if (job === 'mimic-augmentation') {
      return (
        <Space size={8} wrap className="domain-gnb-job-actions">
          <Button onClick={onSaveDraftMimic}>{t('dataRegister.saveDraft')}</Button>
          <Button type="primary" onClick={onSubmitMimic}>
            {t('mimicAugmentation.primaryCta')}
          </Button>
        </Space>
      );
    }
    return (
      <Space size={8} wrap className="domain-gnb-job-actions" align="center">
        <DomainGnbActionIcons />
        <ThemeToggle />
      </Space>
    );
  }, [
    job,
    onSaveDraftRegister,
    onSaveDraftMimic,
    onSubmitMimic,
    onSubmitRegister,
    t,
  ]);

  return (
    <div className="domain-gnb-inner domain-gnb-inner--workspace-job">
      <div className="domain-gnb-job-top">
        <Button
          type="text"
          className="domain-gnb-workspace-back"
          icon={<ArrowLeftOutlined aria-hidden />}
          onClick={onBack}
        >
          {t('dataRegister.back')}
        </Button>
        <Typography.Title level={5} className="domain-gnb-job-title" ellipsis>
          {title}
        </Typography.Title>
        {trailingActions}
      </div>
      <div className="domain-gnb-job-steps-scroll">
        <Steps size="small" className="domain-gnb-job-steps" current={currentStep} items={stepItems} />
      </div>
    </div>
  );
}
