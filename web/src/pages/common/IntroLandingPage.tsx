import { ExportOutlined } from '@ant-design/icons';
import { Button, Flex, Space, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useLocale } from '../../shared/i18n/LocaleProvider';
import './intro-landing-page.css';

const LINKS = {
  revisionHistory:
    'https://docs.google.com/spreadsheets/d/15A1hQr-i9_OV-_TH83_fvx2722EUK92oAoiWxpT-rmU/edit?usp=sharing',
  requirements:
    'https://docs.google.com/spreadsheets/d/1WzIHtNd9fL_vvlPxtxD1CJDqYIqctVDAGjudxw2HUDw/edit?gid=0#gid=0',
  screenList:
    'https://docs.google.com/spreadsheets/d/1zPXJXuLMWmtzNfS8Z-QE5aEcmJVcbpORBwDZTE2lYZQ/edit?gid=1973656953#gid=1973656953',
} as const;

export function IntroLandingPage() {
  const navigate = useNavigate();
  const { t } = useLocale();

  return (
    <Flex className="intro-landing" align="center" justify="center" vertical gap="large">
      <Space direction="vertical" size={8} className="intro-landing-header">
        <Typography.Title level={1} className="intro-landing-headline">
          Physical Works Forge
        </Typography.Title>
        <Typography.Text type="secondary">{t('intro.welcome')}</Typography.Text>
      </Space>

      <Flex className="intro-landing-actions" wrap="wrap" justify="center" align="center" gap={12}>
        <Button
          href={LINKS.revisionHistory}
          target="_blank"
          rel="noopener noreferrer"
          icon={<ExportOutlined />}
        >
          {t('intro.revision')}
        </Button>
        <Button
          href={LINKS.requirements}
          target="_blank"
          rel="noopener noreferrer"
          icon={<ExportOutlined />}
        >
          {t('intro.requirements')}
        </Button>
        <Button
          href={LINKS.screenList}
          target="_blank"
          rel="noopener noreferrer"
          icon={<ExportOutlined />}
        >
          {t('intro.screensSheet')}
        </Button>
        <Button type="default" onClick={() => navigate('/screen-list')}>
          {t('intro.screenList')}
        </Button>
        <Button type="default" onClick={() => navigate('/ui-guide')}>
          {t('intro.uiGuide')}
        </Button>
        <Button type="primary" onClick={() => navigate('/login')}>
          {t('intro.goForge')}
        </Button>
      </Flex>
    </Flex>
  );
}
