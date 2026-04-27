import { App, Button, Card, Descriptions, Drawer, List, Space, Table, Typography, theme } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
import { getMsArtifacts, type MsArtifactRow } from '../../../mocks/modelSupportMocks';
import { useLocale } from '../../../shared/i18n/LocaleProvider';
import '../../dev/dev-data-foundry-page.css';
import '../support-definition-cards-page.css';
import { ModelSupportPageHeader } from './ModelSupportPageHeader';
import './model-support-pages.css';

export function ModelSupportArtifactsPage() {
  const { token } = theme.useToken();
  const { t } = useLocale();
  const { message } = App.useApp();
  const rows = useMemo(() => getMsArtifacts(), []);
  const [drawerRow, setDrawerRow] = useState<MsArtifactRow | null>(null);

  const columns: ColumnsType<MsArtifactRow> = [
    { title: t('support.ms.artifacts.col.model'), dataIndex: 'modelName', key: 'm' },
    { title: t('support.ms.artifacts.col.checkpoints'), dataIndex: 'checkpointCount', width: 140 },
    { title: t('support.ms.common.updated'), dataIndex: 'updatedAt', width: 120 },
    {
      title: t('support.ms.common.actions'),
      key: 'a',
      width: 160,
      render: (_, row) => (
        <Space>
          <Button type="link" size="small" onClick={() => setDrawerRow(row)}>{t('support.ms.common.view')}</Button>
          <Button type="link" size="small" onClick={() => message.info(t('support.ms.artifacts.drawer.replace'))}>{t('support.ms.artifacts.drawer.replace')}</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="support-definition-page support-workspace-page dev-data-foundry model-support-page">
      <div className="support-definition-page__stack">
        <ModelSupportPageHeader
          titleT={t('support.ms.artifacts.title')}
          leadT={t('support.ms.artifacts.lead')}
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

      <Drawer title={t('support.ms.artifacts.drawer.title')} open={!!drawerRow} onClose={() => setDrawerRow(null)} width={560} destroyOnClose>
        {drawerRow ? (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label={t('support.ms.artifacts.col.model')}>{drawerRow.modelName}</Descriptions.Item>
              <Descriptions.Item label={t('support.ms.common.updated')}>{drawerRow.updatedAt}</Descriptions.Item>
            </Descriptions>
            <div>
              <Typography.Title level={5}>{t('support.ms.artifacts.drawer.checkpoints')}</Typography.Title>
              <List size="small" bordered dataSource={drawerRow.checkpoints} renderItem={(item) => <List.Item actions={[<Button type="link" size="small" key="d">{t('support.ms.training.drawer.download')}</Button>]}>{item}</List.Item>} />
            </div>
            <div>
              <Typography.Title level={5}>{t('support.ms.artifacts.drawer.configs')}</Typography.Title>
              <List size="small" bordered dataSource={drawerRow.configFiles} renderItem={(item) => <List.Item>{item}</List.Item>} />
            </div>
          </Space>
        ) : null}
      </Drawer>
      </div>
    </div>
  );
}
