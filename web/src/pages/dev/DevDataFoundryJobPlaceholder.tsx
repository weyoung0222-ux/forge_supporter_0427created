import { Typography } from 'antd';
import { useLocale } from '../../shared/i18n/LocaleProvider';
import './dev-data-foundry-job-placeholder.css';

export type DevDataFoundryJobPlaceholderKind = 'collect' | 'curate';

export interface DevDataFoundryJobPlaceholderProps {
  kind: DevDataFoundryJobPlaceholderKind;
}

export function DevDataFoundryJobPlaceholder({ kind }: DevDataFoundryJobPlaceholderProps) {
  const { t } = useLocale();
  const key = kind === 'collect' ? 'collectJob.placeholder' : 'curateJob.placeholder';
  return (
    <div className="dev-df-job-placeholder domain-workspace-route-root">
      <Typography.Paragraph type="secondary" className="dev-df-job-placeholder-text">
        {t(key)}
      </Typography.Paragraph>
    </div>
  );
}
