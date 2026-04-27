import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Space, Typography } from 'antd';
import { useLocale } from '../../i18n/LocaleProvider';
import { DomainGnbActionIcons } from '../common/DomainGnbActionIcons';
import { ThemeToggle } from '../common/ThemeToggle';

export interface PortalDrillInGnbProps {
  /** i18n key for the centered title (same pattern as Data Foundry job GNB). */
  titleTKey: string;
  onBack: () => void;
}

/**
 * Focus GNB for “drill-in” views (card list → detail): same rhythm as Dev Data Foundry register
 * (`DataFoundryJobGnb` top row) — back label, centered title, trailing utilities — without step strip.
 */
export function PortalDrillInGnb({ titleTKey, onBack }: PortalDrillInGnbProps) {
  const { t } = useLocale();

  return (
    <div className="domain-gnb-inner domain-gnb-inner--drill-in">
      <div className="domain-gnb-job-top domain-gnb-job-top--drill-in">
        <Button type="text" className="domain-gnb-workspace-back" icon={<ArrowLeftOutlined aria-hidden />} onClick={onBack}>
          {t('dataRegister.back')}
        </Button>
        <Typography.Title level={5} className="domain-gnb-job-title" ellipsis style={{ margin: 0 }}>
          {t(titleTKey)}
        </Typography.Title>
        <Space size={8} wrap align="center" className="domain-gnb-drill-in-trailing">
          <DomainGnbActionIcons />
          <ThemeToggle />
        </Space>
      </div>
    </div>
  );
}
