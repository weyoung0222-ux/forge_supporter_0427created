import {
  CloudUploadOutlined,
  DeploymentUnitOutlined,
  ExperimentOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Card,
  Col,
  Progress,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  theme,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo } from 'react';
import { getProjectDashboardMock } from '../../mocks/dashboardData';
import type { ProjectLifecycleStatus, TrainingJobRowDto, TrainingJobStatus } from '../../mocks/dashboardData';
import { useLocale } from '../../shared/i18n/LocaleProvider';
import { GpuHoursByCategoryChart } from '../../shared/ui/charts/GpuHoursByCategoryChart';
import { RolloutStackedBarChart } from '../../shared/ui/charts/RolloutStackedBarChart';
import { TrainingMetricsLineChart } from '../../shared/ui/charts/TrainingMetricsLineChart';
import { useDescriptionScreen } from '../../shared/ui/common/DescriptionModeProvider';
import './dev-project-dashboard-page.css';

function StatusTagProject({
  status,
  t,
}: {
  status: ProjectLifecycleStatus;
  t: (key: string) => string;
}) {
  const colorMap: Record<ProjectLifecycleStatus, string> = {
    active: 'processing',
    on_hold: 'warning',
    archived: 'default',
  };
  const labelKey: Record<ProjectLifecycleStatus, string> = {
    active: 'status.active',
    on_hold: 'status.on_hold',
    archived: 'status.archived',
  };
  return <Tag color={colorMap[status]}>{t(labelKey[status])}</Tag>;
}

function StatusTagJob({
  status,
  t,
}: {
  status: TrainingJobStatus;
  t: (key: string) => string;
}) {
  const colorMap: Record<TrainingJobStatus, string> = {
    running: 'processing',
    queued: 'default',
    succeeded: 'success',
    failed: 'error',
    cancelled: 'default',
  };
  const labelKey: Record<TrainingJobStatus, string> = {
    running: 'job.running',
    queued: 'job.queued',
    succeeded: 'job.succeeded',
    failed: 'job.failed',
    cancelled: 'job.cancelled',
  };
  return <Tag color={colorMap[status]}>{t(labelKey[status])}</Tag>;
}

export function DevProjectDashboardPage() {
  const { token } = theme.useToken();
  const { t } = useLocale();
  const data = useMemo(() => getProjectDashboardMock(), []);

  const descriptionMeta = useMemo(
    () => ({
      screenName: '프로젝트 Dashboard',
      screenId: 'DV-PJ-DB-001',
      screenDescription:
        '선택한 프로젝트의 학습·시뮬레이션·작업 상태를 보여 줍니다. Dev 홈(포트폴리오 요약)과 달리 단일 프로젝트의 지표·차트에 초점을 둡니다.',
      areas: [
        {
          id: 'dash-header',
          name: '대시보드 헤더',
          role: '프로젝트명·상태·릴리스 마일스톤 진행률 표시',
          userAction: '이름·상태·진행률 확인',
          linkedScreen: '프로젝트 설정(예정)',
        },
        {
          id: 'dash-kpi',
          name: 'KPI 요약',
          role: '데이터셋·모델·실행 중 작업·스토리지 소비 표시',
          userAction: '수치와 할당량 대비 상태 확인',
          linkedScreen: 'Library·인프라 상세(예정)',
        },
        {
          id: 'dash-training-chart',
          name: '학습 지표 차트',
          role: '에폭별 보상·평가 성공률 추이',
          userAction: '학습 안정성·수렴 여부 확인',
          linkedScreen: 'Model Institute — 학습 작업 상세',
        },
        {
          id: 'dash-rollout-chart',
          name: '시뮬레이션 롤아웃 차트',
          role: '일별 성공·실패 에피소드 비교',
          userAction: '롤아웃량·실패율 추이 비교',
          linkedScreen: 'Data Foundry — 시뮬 배치',
        },
        {
          id: 'dash-gpu-chart',
          name: 'GPU-hours(업무별)',
          role: '파이프라인 단계별 연산 사용량 분해',
          userAction: '비용이 큰 단계 파악',
          linkedScreen: 'Usage·과금(예정)',
        },
        {
          id: 'dash-jobs-table',
          name: '최근 학습 작업',
          role: '최신 작업 목록·상태·진행률',
          userAction: '작업 선택·대기열 확인',
          linkedScreen: 'Model Institute — 작업 화면',
        },
      ],
    }),
    [],
  );

  const { bindArea } = useDescriptionScreen(descriptionMeta);
  const { summary, trainingCurve, gpuHoursByCategory, recentJobs, rolloutStats } = data;

  const jobColumns: ColumnsType<TrainingJobRowDto> = useMemo(
    () => [
      { title: t('dashboard.jobs.col.job'), dataIndex: 'name', key: 'name', ellipsis: true },
      {
        title: t('dashboard.jobs.col.status'),
        dataIndex: 'status',
        key: 'status',
        width: 120,
        render: (s: TrainingJobStatus) => <StatusTagJob status={s} t={t} />,
      },
      {
        title: t('dashboard.jobs.col.progress'),
        dataIndex: 'progressPct',
        key: 'progressPct',
        width: 160,
        render: (pct: number, row) =>
          row.status === 'succeeded' || row.status === 'failed' || row.status === 'cancelled' ? (
            <Progress percent={pct} size="small" showInfo status={row.status === 'failed' ? 'exception' : 'normal'} />
          ) : (
            <Progress percent={pct} size="small" status={row.status === 'running' ? 'active' : 'normal'} />
          ),
      },
      { title: t('dashboard.jobs.col.framework'), dataIndex: 'framework', key: 'framework', ellipsis: true, width: 200 },
      { title: t('dashboard.jobs.col.updated'), dataIndex: 'updatedAt', key: 'updatedAt', width: 200 },
    ],
    [t],
  );

  const storagePct = Math.round((summary.storageUsedTb / summary.storageQuotaTb) * 100);

  return (
    <div className="dev-project-dashboard">
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <div {...bindArea('dash-header')}>
          <Row justify="space-between" align="middle" gutter={[16, 8]}>
            <Col flex="auto">
              <Typography.Title level={3} className="dev-project-dashboard-title" style={{ margin: 0 }}>
                {t('dashboard.title')}
              </Typography.Title>
              <Space size={12} wrap align="center" style={{ marginTop: 8 }}>
                <Typography.Text strong style={{ fontSize: 16 }}>
                  {summary.projectName}
                </Typography.Text>
                <StatusTagProject status={summary.status} t={t} />
                <Typography.Text type="secondary">{summary.targetRobotFleet}</Typography.Text>
              </Space>
            </Col>
            <Col>
              <Typography.Text type="secondary" className="dev-project-dashboard-meta">
                {t('dashboard.lastDeploy')}: {summary.lastDeploymentAt.replace('T', ' ').replace('Z', '')}
              </Typography.Text>
            </Col>
          </Row>
          <Card size="small" className="dev-project-dashboard-progress-card" style={{ marginTop: 12 }}>
            <Space direction="vertical" style={{ width: '100%' }} size={4}>
              <Space align="center" style={{ justifyContent: 'space-between', width: '100%' }}>
                <Typography.Text type="secondary">{t('dashboard.milestone')}</Typography.Text>
                <Typography.Text strong>{summary.overallProgressPct}%</Typography.Text>
              </Space>
              <Progress percent={summary.overallProgressPct} strokeColor={{ from: token.colorInfo, to: token.colorPrimary }} />
            </Space>
          </Card>
        </div>

        <Alert type="info" showIcon message={t('dashboard.alert')} className="dev-project-dashboard-alert" />

        <Row gutter={[16, 16]} {...bindArea('dash-kpi')}>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small" className="dev-project-dashboard-kpi-card">
              <Statistic title={t('dashboard.kpi.datasets')} value={summary.datasetCount} prefix={<CloudUploadOutlined />} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small" className="dev-project-dashboard-kpi-card">
              <Statistic title={t('dashboard.kpi.models')} value={summary.modelRegistryCount} prefix={<ExperimentOutlined />} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small" className="dev-project-dashboard-kpi-card">
              <Statistic title={t('dashboard.kpi.jobs')} value={summary.activeTrainingJobs} prefix={<ThunderboltOutlined />} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small" className="dev-project-dashboard-kpi-card">
              <Statistic
                title={t('dashboard.kpi.storage')}
                value={summary.storageUsedTb}
                suffix={`/ ${summary.storageQuotaTb} TB`}
                prefix={<DeploymentUnitOutlined />}
              />
              <Progress percent={storagePct} size="small" showInfo={false} style={{ marginTop: 8 }} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} xl={14}>
            <Card title={t('dashboard.chart.train')} size="small" {...bindArea('dash-training-chart')}>
              <TrainingMetricsLineChart data={trainingCurve} height={300} />
            </Card>
          </Col>
          <Col xs={24} xl={10}>
            <Card title={t('dashboard.chart.rollout')} size="small" {...bindArea('dash-rollout-chart')}>
              <RolloutStackedBarChart data={rolloutStats} height={300} />
            </Card>
          </Col>
        </Row>

        <Card title={t('dashboard.chart.gpu')} size="small" {...bindArea('dash-gpu-chart')}>
          <GpuHoursByCategoryChart data={gpuHoursByCategory} height={300} />
        </Card>

        <Card title={t('dashboard.jobs.title')} size="small" {...bindArea('dash-jobs-table')}>
          <Table<TrainingJobRowDto>
            size="small"
            rowKey="jobId"
            columns={jobColumns}
            dataSource={recentJobs}
            pagination={false}
            scroll={{ x: 720 }}
          />
        </Card>
      </Space>
    </div>
  );
}
