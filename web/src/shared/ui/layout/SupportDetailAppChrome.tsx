import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Typography, theme } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useLocale } from '../../i18n/LocaleProvider';
import { ThemeToggle } from '../common/ThemeToggle';
import '../../../pages/support/support-workspace-detail-page.css';

export interface SupportDetailAppChromeProps {
  listHref: string;
  /** i18n key for centered title (e.g. `support.detail.chrome.definitionModel`). */
  titleTKey: string;
}

/**
 * Inner content for `DomainHomeLayout` Header: Back (left), screen title (center), theme (right).
 * Replaces the default portal GNB while Support drill-in routes are active.
 */
export function SupportDetailAppChrome({ listHref, titleTKey }: SupportDetailAppChromeProps) {
  const navigate = useNavigate();
  const { t } = useLocale();
  const { token } = theme.useToken();

  return (
    <div
      className="support-detail-app-chrome domain-gnb-inner"
      style={{
        height: '100%',
        maxWidth: 'var(--domain-1depth-max-width, 1200px)',
        width: '100%',
        marginLeft: 'auto',
        marginRight: 'auto',
        boxSizing: 'border-box',
      }}
    >
      <div className="support-detail-app-chrome__grid">
        <div className="support-detail-app-chrome__left">
          <Button
            type="text"
            className="support-detail-app-chrome__back"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(listHref)}
          >
            {t('support.detail.chrome.back')}
          </Button>
        </div>
        <Typography.Title level={5} className="support-detail-app-chrome__title" style={{ margin: 0, color: token.colorText }}>
          {t(titleTKey)}
        </Typography.Title>
        <div className="support-detail-app-chrome__right">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
