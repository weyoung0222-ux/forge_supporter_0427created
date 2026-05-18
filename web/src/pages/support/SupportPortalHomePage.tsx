import { ArrowRightOutlined, BlockOutlined, ExperimentOutlined, RobotOutlined } from '@ant-design/icons';
import { Button, Card, Col, Row, Typography, theme } from 'antd';
import { useNavigate } from 'react-router-dom';
import { defaultWorkspacePathForGnb, supportWorkspacePath } from '../../shared/config/supportPaths';
import { useLocale } from '../../shared/i18n/LocaleProvider';
import './support-portal-home-page.css';

const STAT_VALUES = { models: 24, devices: 41, assets: 128, scenes: 16 } as const;

export function SupportPortalHomePage() {
  const { t } = useLocale();
  const navigate = useNavigate();
  const { token } = theme.useToken();

  const dividerVar = { ['--support-portal-home-divider' as string]: token.colorSplit } as React.CSSProperties;

  return (
    <div className="support-portal-home" style={dividerVar}>
      <header className="support-portal-home__hero">
        <div className="support-portal-home__hero-main">
          <Typography.Text type="secondary" className="support-portal-home__eyebrow">
            {t('support.home.eyebrow')}
          </Typography.Text>
          <Typography.Title level={2} className="support-portal-home__title">
            {t('support.home.title')}
          </Typography.Title>
          <Typography.Paragraph type="secondary" className="support-portal-home__lead">
            {t('support.home.lead')}
          </Typography.Paragraph>
        </div>
        <Button type="default" onClick={() => navigate('/login')}>
          {t('support.home.footer.login')}
        </Button>
      </header>

      <Row gutter={[16, 16]} className="support-portal-home__stat-row">
        {(
          [
            { key: 'models', value: STAT_VALUES.models },
            { key: 'devices', value: STAT_VALUES.devices },
            { key: 'assets', value: STAT_VALUES.assets },
            { key: 'scenes', value: STAT_VALUES.scenes },
          ] as const
        ).map(({ key, value }) => (
          <Col xs={12} lg={6} key={key}>
            <Card
              bordered={false}
              className="support-portal-home__stat-card"
              style={{
                background: token.colorBgContainer,
                border: `1px solid ${token.colorBorderSecondary}`,
              }}
            >
              <span className="support-portal-home__stat-label" style={{ color: token.colorTextSecondary }}>
                {t(`support.home.stat.${key}`)}
              </span>
              <div className="support-portal-home__stat-value" style={{ color: token.colorText }}>
                {value}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Typography.Title level={5} type="secondary" className="support-portal-home__section-title">
        {t('support.home.sections.workspaces')}
      </Typography.Title>

      <Row gutter={[20, 20]}>
        <Col xs={24} md={8}>
          <Card
            bordered={false}
            className="support-portal-home__pillar"
            style={{
              background: token.colorBgContainer,
              border: `1px solid ${token.colorBorderSecondary}`,
            }}
            onClick={() => navigate(defaultWorkspacePathForGnb('robot-support'))}
          >
            <div className="support-portal-home__pillar-top">
              <span
                className="support-portal-home__pillar-icon"
                style={{
                  background: `${token.colorPrimary}14`,
                  color: token.colorPrimary,
                }}
                aria-hidden
              >
                <RobotOutlined />
              </span>
              <ArrowRightOutlined style={{ color: token.colorTextQuaternary, fontSize: 14 }} />
            </div>
            <Typography.Title level={4} className="support-portal-home__pillar-title">
              {t('support.home.pillar.robot.title')}
            </Typography.Title>
            <Typography.Paragraph type="secondary" className="support-portal-home__pillar-desc">
              {t('support.home.pillar.robot.desc')}
            </Typography.Paragraph>
            <span className="support-portal-home__pillar-cta" style={{ color: token.colorPrimary }}>
              {t('support.home.cta.enter')}
              <ArrowRightOutlined style={{ fontSize: 12 }} />
            </span>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card
            bordered={false}
            className="support-portal-home__pillar"
            style={{
              background: token.colorBgContainer,
              border: `1px solid ${token.colorBorderSecondary}`,
            }}
            onClick={() => navigate(defaultWorkspacePathForGnb('model-support'))}
          >
            <div className="support-portal-home__pillar-top">
              <span
                className="support-portal-home__pillar-icon"
                style={{
                  background: `${token.colorSuccess}18`,
                  color: token.colorSuccess,
                }}
                aria-hidden
              >
                <ExperimentOutlined />
              </span>
              <ArrowRightOutlined style={{ color: token.colorTextQuaternary, fontSize: 14 }} />
            </div>
            <Typography.Title level={4} className="support-portal-home__pillar-title">
              {t('support.home.pillar.model.title')}
            </Typography.Title>
            <Typography.Paragraph type="secondary" className="support-portal-home__pillar-desc">
              {t('support.home.pillar.model.desc')}
            </Typography.Paragraph>
            <span className="support-portal-home__pillar-cta" style={{ color: token.colorSuccess }}>
              {t('support.home.cta.enter')}
              <ArrowRightOutlined style={{ fontSize: 12 }} />
            </span>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card
            bordered={false}
            className="support-portal-home__pillar"
            style={{
              background: token.colorBgContainer,
              border: `1px solid ${token.colorBorderSecondary}`,
            }}
            onClick={() => navigate(defaultWorkspacePathForGnb('simulation-support'))}
          >
            <div className="support-portal-home__pillar-top">
              <span
                className="support-portal-home__pillar-icon"
                style={{
                  background: `${token.colorWarning}22`,
                  color: token.colorWarning,
                }}
                aria-hidden
              >
                <BlockOutlined />
              </span>
              <ArrowRightOutlined style={{ color: token.colorTextQuaternary, fontSize: 14 }} />
            </div>
            <Typography.Title level={4} className="support-portal-home__pillar-title">
              {t('support.home.pillar.sim.title')}
            </Typography.Title>
            <Typography.Paragraph type="secondary" className="support-portal-home__pillar-desc">
              {t('support.home.pillar.sim.desc')}
            </Typography.Paragraph>
            <span className="support-portal-home__pillar-cta" style={{ color: token.colorWarning }}>
              {t('support.home.cta.enter')}
              <ArrowRightOutlined style={{ fontSize: 12 }} />
            </span>
          </Card>
        </Col>
      </Row>

      <div className="support-portal-home__quick">
        <div className="support-portal-home__quick-inner">
          <span className="support-portal-home__quick-label" style={{ color: token.colorTextSecondary }}>
            {t('support.home.quick.title')}
          </span>
          <Button onClick={() => navigate(supportWorkspacePath('robot-support', 'definition-robot'))}>
            {t('support.home.quick.robot_models')}
          </Button>
          <Button onClick={() => navigate(supportWorkspacePath('robot-support', 'instances-endpoints'))}>
            {t('support.home.quick.robot_endpoints')}
          </Button>
          <Button onClick={() => navigate(supportWorkspacePath('model-support', 'ms-registry'))}>
            {t('support.home.quick.model_registry')}
          </Button>
          <Button onClick={() => navigate(supportWorkspacePath('simulation-support', 'sim-assets'))}>
            {t('support.home.quick.sim_assets')}
          </Button>
          <Button onClick={() => navigate(supportWorkspacePath('simulation-support', 'sim-scenes'))}>
            {t('support.home.quick.sim_scenes')}
          </Button>
        </div>
      </div>
    </div>
  );
}
