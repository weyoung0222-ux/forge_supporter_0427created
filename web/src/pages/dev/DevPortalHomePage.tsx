import {
  BellOutlined,
  DatabaseOutlined,
  DeploymentUnitOutlined,
  ExperimentOutlined,
  ProjectOutlined,
  RocketOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  List,
  Row,
  Space,
  Statistic,
  Tag,
  Timeline,
  Typography,
  theme,
} from 'antd';
import { useMemo } from 'react';
import { getDevPortalHomeMock } from '../../mocks/homeData';
import type { DevHomeActivityItemDto, DevHomeActivityType } from '../../mocks/homeData';
import { useLocale } from '../../shared/i18n/LocaleProvider';
import { PortfolioResourceTotalsChart } from '../../shared/ui/charts/PortfolioResourceTotalsChart';
import { useDescriptionScreen } from '../../shared/ui/common/DescriptionModeProvider';
import './dev-portal-home-page.css';

const ACTIVITY_COLOR: Record<DevHomeActivityType, string> = {
  dataset: 'blue',
  model: 'purple',
  job: 'orange',
  simulation: 'cyan',
  deployment: 'green',
  annotation: 'geekblue',
};

const ACTIVITY_TAG_KEY: Record<DevHomeActivityType, string> = {
  dataset: 'devHome.act.dataset',
  model: 'devHome.act.model',
  job: 'devHome.act.job',
  simulation: 'devHome.act.simulation',
  deployment: 'devHome.act.deployment',
  annotation: 'devHome.act.annotation',
};

function activityIcon(type: DevHomeActivityType) {
  switch (type) {
    case 'dataset':
      return <DatabaseOutlined />;
    case 'model':
      return <ExperimentOutlined />;
    case 'job':
      return <ThunderboltOutlined />;
    case 'simulation':
      return <RocketOutlined />;
    case 'deployment':
      return <DeploymentUnitOutlined />;
    case 'annotation':
      return <DatabaseOutlined />;
    default:
      return <BellOutlined />;
  }
}

function formatRelativeTime(iso: string, t: (k: string) => string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diffMs / 60000);
  if (m < 60) {
    return t('devHome.rel.m').replace('{n}', String(Math.max(0, m)));
  }
  const h = Math.floor(m / 60);
  if (h < 48) {
    return t('devHome.rel.h').replace('{n}', String(h));
  }
  const d = Math.floor(h / 24);
  return t('devHome.rel.d').replace('{n}', String(d));
}

export interface DevPortalHomePageProps {
  onOpenProjectMenu: () => void;
}

export function DevPortalHomePage({ onOpenProjectMenu }: DevPortalHomePageProps) {
  const { token } = theme.useToken();
  const { t } = useLocale();
  const data = useMemo(() => getDevPortalHomeMock(), []);

  const sortedActivity = useMemo(
    () => [...data.activity].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()),
    [data.activity],
  );

  const descriptionMeta = useMemo(
    () => ({
      screenName: 'Dev 홈 (포트폴리오 요약)',
      screenId: 'DV-HM-OV-001',
      screenDescription:
        '프로젝트를 열기 전 단계에서, 참여 프로젝트·최근 작업·전체 자원 규모·공지를 한눈에 봅니다. 단일 프로젝트의 학습 곡선·릴리스 진행은 Dashboard와 구분됩니다.',
      areas: [
        {
          id: 'dev-home-header',
          name: '페이지 헤더',
          role: 'Dev 홈의 목적과 다른 화면(Dashboard)과의 차이를 안내',
          userAction: '제목·설명을 읽고 아래 섹션으로 스크롤',
          linkedScreen: 'GNB의 Project·Library',
        },
        {
          id: 'dev-home-project-summary',
          name: '나의 프로젝트 요약',
          role: '진행·완료 수와 최근 방문 프로젝트 카드 표시',
          userAction: 'View all·카드 선택 시 Project 목록으로 이동',
          linkedScreen: 'Project 목록',
        },
        {
          id: 'dev-home-activity',
          name: '최근 활동 피드',
          role: '사용자 작업 이력을 시간순으로 표시',
          userAction: '항목을 읽고 관련 워크스페이스로 이동(추후 연결)',
          linkedScreen: 'Data Foundry / Model Institute 등',
        },
        {
          id: 'dev-home-resources',
          name: '전체 리소스 현황',
          role: '전체 Dataset·Model·실행 중 Job 수와 막대 차트로 비교',
          userAction: '수치·차트로 포트폴리오 규모 파악',
          linkedScreen: 'Library·작업 모니터(예정)',
        },
        {
          id: 'dev-home-quick-access',
          name: '빠른 접근',
          role: '최근 방문 프로젝트로 바로가기 버튼 제공',
          userAction: '버튼 선택 시 Project 목록으로 이동',
          linkedScreen: 'Project 목록',
        },
        {
          id: 'dev-home-announcements',
          name: '공지·업데이트',
          role: '플랫폼 공지·릴리스 안내',
          userAction: '목록을 읽고 상세(예정)로 이동',
          linkedScreen: '릴리스 노트(예정)',
        },
      ],
    }),
    [],
  );

  const { bindArea } = useDescriptionScreen(descriptionMeta);

  const timelineItems = useMemo(
    () =>
      sortedActivity.map((item: DevHomeActivityItemDto) => ({
        color: 'gray',
        children: (
          <div className="dev-portal-home-activity-item">
            <Space wrap size={[4, 4]} align="center">
              {activityIcon(item.type)}
              <Typography.Text strong>{item.title}</Typography.Text>
              <Tag color={ACTIVITY_COLOR[item.type]}>{t(ACTIVITY_TAG_KEY[item.type])}</Tag>
            </Space>
            <Typography.Paragraph type="secondary" className="dev-portal-home-activity-meta" style={{ marginBottom: 4 }}>
              {item.projectName} · {formatRelativeTime(item.occurredAt, t)}
            </Typography.Paragraph>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
              {item.detail}
            </Typography.Paragraph>
          </div>
        ),
      })),
    [sortedActivity, t],
  );

  const sortedAnnouncements = useMemo(
    () =>
      [...data.announcements].sort((a, b) => {
        if (a.pinned && !b.pinned) {
          return -1;
        }
        if (!a.pinned && b.pinned) {
          return 1;
        }
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }),
    [data.announcements],
  );

  return (
    <div className="dev-portal-home">
      <div className="domain-1depth-page-header" {...bindArea('dev-home-header')}>
        <Typography.Title level={2} className="domain-1depth-page-title">
          {t('devHome.title')}
        </Typography.Title>
        <Typography.Paragraph type="secondary" className="domain-1depth-page-lead">
          {t('devHome.lead')}
        </Typography.Paragraph>
      </div>

      <div className="dev-portal-home-section">
        <Card
          title={t('devHome.myProjects')}
          size="small"
          extra={
            <Button type="link" onClick={onOpenProjectMenu}>
              {t('devHome.viewAll')}
            </Button>
          }
          {...bindArea('dev-home-project-summary')}
        >
          <Row gutter={24} style={{ marginBottom: 16 }}>
            <Col xs={12} sm={8}>
              <Statistic
                title={t('devHome.inProgress')}
                value={data.projectStatus.active}
                valueStyle={{ color: token.colorPrimary }}
              />
            </Col>
            <Col xs={12} sm={8}>
              <Statistic title={t('devHome.completed')} value={data.projectStatus.completed} />
            </Col>
          </Row>
          <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
            {t('devHome.recentVisit')}
          </Typography.Text>
          <Row gutter={[24, 24]}>
            {data.recentProjects.map((p) => (
              <Col xs={24} sm={12} lg={6} key={p.id}>
                <Card size="small" hoverable onClick={onOpenProjectMenu} className="dev-portal-home-project-card">
                  <Typography.Text strong>{p.name}</Typography.Text>
                  <div>
                    <Typography.Text type="secondary">{p.role}</Typography.Text>
                  </div>
                  <Typography.Text type="secondary" className="dev-portal-home-muted-small">
                    {t('devHome.lastOpened')} {formatRelativeTime(p.lastVisitedAt, t)}
                  </Typography.Text>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      </div>

      <Row gutter={[24, 24]} className="dev-portal-home-section">
        <Col xs={24} xl={14}>
          <Card title={t('devHome.activity')} size="small" {...bindArea('dev-home-activity')}>
            <Timeline items={timelineItems} className="dev-portal-home-timeline" />
          </Card>
        </Col>
        <Col xs={24} xl={10}>
          <Card title={t('devHome.resources')} size="small" {...bindArea('dev-home-resources')}>
            <Row gutter={[24, 24]} align="middle">
              <Col xs={24} sm={8}>
                <Statistic title={t('devHome.datasets')} value={data.resourceTotals.datasets} prefix={<DatabaseOutlined />} />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic title={t('devHome.models')} value={data.resourceTotals.models} prefix={<ExperimentOutlined />} />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic title={t('devHome.jobs')} value={data.resourceTotals.runningJobs} prefix={<ThunderboltOutlined />} />
              </Col>
            </Row>
            <div className="dev-portal-home-chart-wrap">
              <Typography.Text type="secondary" className="dev-portal-home-chart-caption">
                {t('devHome.chartCaption')}
              </Typography.Text>
              <PortfolioResourceTotalsChart totals={data.resourceTotals} height={220} />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} className="dev-portal-home-section">
        <Col xs={24} lg={10} xl={9}>
          <Card title={t('devHome.quickAccess')} size="small" {...bindArea('dev-home-quick-access')}>
            <Typography.Paragraph type="secondary" style={{ marginTop: 0 }}>
              {t('devHome.quickLead')}
            </Typography.Paragraph>
            <Space direction="vertical" style={{ width: '100%' }} size={8}>
              {data.recentProjects.map((p) => (
                <Button key={p.id} block icon={<ProjectOutlined />} onClick={onOpenProjectMenu}>
                  {p.name}
                </Button>
              ))}
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={14} xl={15}>
          <Card title={t('devHome.announcements')} size="small" {...bindArea('dev-home-announcements')}>
            <List
              itemLayout="vertical"
              dataSource={sortedAnnouncements}
              renderItem={(item) => (
                <List.Item key={item.id}>
                  <List.Item.Meta
                    title={
                      <Space wrap>
                        {item.pinned ? <Tag color="red">{t('devHome.pinned')}</Tag> : null}
                        <Typography.Text strong>{item.title}</Typography.Text>
                      </Space>
                    }
                    description={
                      <>
                        <Typography.Paragraph style={{ marginBottom: 8 }}>{item.body}</Typography.Paragraph>
                        <Typography.Text type="secondary" className="dev-portal-home-muted-small">
                          {formatRelativeTime(item.publishedAt, t)}
                        </Typography.Text>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
