import { App, Button, Card, Drawer, Progress, Space, Table, Tabs, Tag, Typography, theme } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
import { getMsTrainingJobs, patchMsTrainingJob, type MsJobStatus, type MsTrainingJobRow } from '../../../mocks/modelSupportMocks';
import { useLocale } from '../../../shared/i18n/LocaleProvider';
import '../../dev/dev-data-foundry-page.css';
import '../support-definition-cards-page.css';
import { ModelSupportPageHeader } from './ModelSupportPageHeader';
import './model-support-pages.css';

function statusColor(s: MsJobStatus) {
  if (s === 'running') return 'blue';
  if (s === 'done') return 'success';
  if (s === 'error') return 'error';
  return 'default';
}

function statusLabel(t: (k: string) => string, s: MsJobStatus) {
  if (s === 'queued') return t('support.ms.status.queued');
  if (s === 'running') return t('support.ms.status.running');
  if (s === 'done') return t('support.ms.status.done');
  return t('support.ms.status.error');
}

export function ModelSupportTrainingJobsPage() {
  const { token } = theme.useToken();
  const { t } = useLocale();
  const { message } = App.useApp();
  const [tick, setTick] = useState(0);
  const rows = useMemo(() => getMsTrainingJobs(), [tick]);
  const [drawerRow, setDrawerRow] = useState<MsTrainingJobRow | null>(null);
  const [drawerTab, setDrawerTab] = useState('logs');
  const refresh = () => setTick((n) => n + 1);

  const columns: ColumnsType<MsTrainingJobRow> = [
    { title: t('support.ms.training.col.job'), dataIndex: 'name', key: 'name', ellipsis: true },
    { title: t('support.ms.training.col.model'), dataIndex: 'modelName', key: 'm', ellipsis: true },
    {
      title: t('support.ms.training.col.status'),
      dataIndex: 'status',
      width: 120,
      render: (s: MsJobStatus) => <Tag color={statusColor(s)}>{statusLabel(t, s)}</Tag>,
    },
    {
      title: t('support.ms.training.col.progress'),
      dataIndex: 'progress',
      width: 160,
      render: (p: number, row) => <Progress percent={p} size="small" status={row.status === 'error' ? 'exception' : undefined} />,
    },
    { title: t('support.ms.training.col.started'), dataIndex: 'startedAt', width: 160 },
    {
      title: t('support.ms.common.actions'),
      key: 'a',
      width: 280,
      render: (_, row) => (
        <Space wrap size={4}>
          <Button size="small" type="primary" disabled={row.status === 'running'} onClick={() => { patchMsTrainingJob(row.id, { status: 'running', progress: Math.max(row.progress, 5) }); refresh(); }}>
            {t('support.ms.training.action.start')}
          </Button>
          <Button size="small" disabled={row.status !== 'running'} onClick={() => { patchMsTrainingJob(row.id, { status: 'queued', progress: 0 }); refresh(); }}>
            {t('support.ms.training.action.stop')}
          </Button>
          <Button size="small" onClick={() => { setDrawerTab('logs'); setDrawerRow(row); }}>{t('support.ms.training.action.logs')}</Button>
          <Button size="small" onClick={() => { setDrawerTab('result'); setDrawerRow(row); }}>{t('support.ms.training.action.result')}</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="support-definition-page support-workspace-page dev-data-foundry model-support-page">
      <div className="support-definition-page__stack">
        <ModelSupportPageHeader
          titleT={t('support.ms.training.title')}
          leadT={t('support.ms.training.lead')}
          count={rows.length}
          countLabelT={t('support.ms.common.count')}
          createLabel={t('support.ms.common.create')}
          onCreate={() => message.info(t('support.ms.common.notWired'))}
        />
        <div className="support-definition-body">
          <Card
            size="small"
            bordered
            className="model-support-table-card"
            style={{ borderColor: token.colorBorderSecondary }}
            styles={{ body: { padding: 0 } }}
          >
            <Table rowKey="id" dataSource={rows} columns={columns} pagination={false} size="small" />
          </Card>
        </div>

      <Drawer title={drawerRow?.name} open={!!drawerRow} onClose={() => setDrawerRow(null)} width={640} destroyOnClose>
        {drawerRow ? (
          <Tabs activeKey={drawerTab} onChange={setDrawerTab} items={[
            {
              key: 'logs',
              label: t('support.ms.training.drawer.logs'),
              children: <pre className="model-support-log-pre">{drawerRow.logs || '—'}</pre>,
            },
            {
              key: 'metrics',
              label: t('support.ms.training.drawer.metrics'),
              children: (
                <div>
                  <Typography.Paragraph type="secondary">Loss / accuracy (last {drawerRow.lossSeries.length} steps)</Typography.Paragraph>
                  <div className="model-support-metric-placeholder">
                    <Typography.Text type="secondary">loss: [{drawerRow.lossSeries.map((x) => x.toFixed(3)).join(', ')}]</Typography.Text>
                  </div>
                  <div className="model-support-metric-placeholder" style={{ marginTop: 8 }}>
                    <Typography.Text type="secondary">acc: [{drawerRow.accSeries.map((x) => x.toFixed(2)).join(', ')}]</Typography.Text>
                  </div>
                </div>
              ),
            },
            {
              key: 'result',
              label: t('support.ms.training.drawer.result'),
              children: (
                <Space direction="vertical">
                  <Typography.Text>{drawerRow.artifactZip || '—'}</Typography.Text>
                  <Button type="primary" disabled={!drawerRow.artifactZip}>{t('support.ms.training.drawer.download')}</Button>
                </Space>
              ),
            },
          ]}
          />
        ) : null}
      </Drawer>
      </div>
    </div>
  );
}
