import { Button, Card, Modal, Space, Table, Typography } from 'antd';
import { useMemo, useState, type ReactNode } from 'react';
import { AntdComponentDemo } from './antdDemos';
import { UI_GUIDE_FILE_SNIPPETS, type UiGuideScanAntd, type UiGuideScanIcon } from './catalog.generated';
import { UiGuideManualPanel } from './UiGuideManualPanels';
import type { UiGuideSelection } from './uiGuideNavModel';

function koreanAntdDescription(name: string, row: UiGuideScanAntd | undefined): string {
  const screens = row?.usages.map((u) => u.screenLabel).filter((v, i, a) => a.indexOf(v) === i) ?? [];
  const paths = row?.usages.map((u) => u.relativePath).filter((v, i, a) => a.indexOf(v) === i) ?? [];
  return [
    `Ant Design의 \`${name}\` 컴포넌트입니다. 버튼·폼·피드백 등 UI를 구성할 때 사용합니다.`,
    screens.length ? `프로젝트에서 사용된 화면(컴포넌트) 예: ${screens.slice(0, 12).join(', ')}${screens.length > 12 ? ' …' : ''}.` : '',
    paths.length ? `참조 소스 경로: ${paths.slice(0, 6).join(', ')}${paths.length > 6 ? ' …' : ''}.` : '',
    '아래에서 Size / Role / State 변형 예시를 확인하고, Open code로 실제 import 구문이 포함된 파일을 봅니다.',
  ]
    .filter(Boolean)
    .join('\n');
}

export function UiGuideDetailPanel({
  selection,
  scannedAntdMap,
  scannedIconsList,
}: {
  selection: UiGuideSelection;
  scannedAntdMap: Map<string, UiGuideScanAntd>;
  scannedIconsList: UiGuideScanIcon[];
}): ReactNode {
  const [codeOpen, setCodeOpen] = useState(false);
  const [codeBody, setCodeBody] = useState('');
  const [codeTitle, setCodeTitle] = useState('');

  const openCodeForPath = (relativePath: string) => {
    const snippet = UI_GUIDE_FILE_SNIPPETS[relativePath];
    setCodeTitle(relativePath);
    setCodeBody(snippet ?? '/* No snippet indexed for this path. Run npm run gen:ui-guide */');
    setCodeOpen(true);
  };

  if (selection.kind === 'manual') {
    return <UiGuideManualPanel id={selection.id} scannedIcons={scannedIconsList} />;
  }

  const name = selection.componentName;
  const row = scannedAntdMap.get(name);

  const primaryPath = row?.usages[0]?.relativePath;

  return (
    <>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Typography.Title level={4} style={{ marginTop: 0 }}>
            {name}
          </Typography.Title>
          {primaryPath ? (
            <Typography.Paragraph copyable type="secondary" style={{ marginBottom: 8 }}>
              <Typography.Text code>{primaryPath}</Typography.Text>
            </Typography.Paragraph>
          ) : null}
          <Space wrap>
            <Button type="primary" disabled={!primaryPath} onClick={() => primaryPath && openCodeForPath(primaryPath)}>
              Open code
            </Button>
          </Space>
        </div>

        <div>
          <Typography.Title level={5}>Description (KO)</Typography.Title>
          <Typography.Paragraph style={{ whiteSpace: 'pre-wrap' }}>{koreanAntdDescription(name, row)}</Typography.Paragraph>
        </div>

        <div>
          <Typography.Title level={5}>Screens (auto)</Typography.Title>
          <Table
            size="small"
            pagination={{ pageSize: 8 }}
            dataSource={row?.usages ?? []}
            rowKey={(r) => `${r.relativePath}-${r.screenLabel}`}
            columns={[
              {
                title: 'Source file',
                dataIndex: 'relativePath',
                render: (t: string) => <Typography.Text code style={{ fontSize: 12 }}>{t}</Typography.Text>,
              },
              { title: 'Export / screen', dataIndex: 'screenLabel', width: 220 },
            ]}
          />
        </div>

        <div>
          <Typography.Title level={5}>Live preview</Typography.Title>
          <Card size="small" styles={{ body: { padding: 16 } }}>
            <AntdComponentDemo name={name} />
          </Card>
        </div>
      </Space>

      <Modal
        title={codeTitle}
        open={codeOpen}
        onCancel={() => setCodeOpen(false)}
        width={900}
        footer={[
          <Button key="close" onClick={() => setCodeOpen(false)}>
            Close
          </Button>,
        ]}
      >
        <pre
          style={{
            margin: 0,
            maxHeight: 'min(70vh, 560px)',
            overflow: 'auto',
            fontSize: 12,
            lineHeight: 1.45,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          }}
        >
          {codeBody}
        </pre>
      </Modal>
    </>
  );
}

export function useScannedMaps(scanned: { antd: UiGuideScanAntd[]; icons: UiGuideScanIcon[] }) {
  return useMemo(() => {
    const antdMap = new Map<string, UiGuideScanAntd>();
    scanned.antd.forEach((r) => antdMap.set(r.componentName, r));
    return { antdMap, iconsList: scanned.icons };
  }, [scanned]);
}
