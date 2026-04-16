import { Button, Card, Typography } from 'antd';
import { useLocale } from '../../shared/i18n/LocaleProvider';
import './dev-data-foundry-page.css';

/** Model Institute workspace: same shell width/header rhythm as Data Foundry to avoid layout shift between LNB routes. */
export function DevModelInstitutePage() {
  const { t } = useLocale();

  return (
    <div className="dev-data-foundry domain-workspace-route-root">
      <div className="dev-data-foundry-header">
        <div>
          <Typography.Title level={3} className="dev-data-foundry-title">
            {t('nav.model_institute')}
          </Typography.Title>
          <Typography.Paragraph type="secondary" className="domain-1depth-page-lead">
            {t('dataFoundry.modelInstitutePlaceholder')}
          </Typography.Paragraph>
        </div>
        <Button>{t('dataFoundry.jobsInProcess')}</Button>
      </div>
      <Card bordered size="small" className="dev-model-institute-placeholder-card">
        <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
          {t('modelInstitute.bodyPlaceholder')}
        </Typography.Paragraph>
      </Card>
    </div>
  );
}
