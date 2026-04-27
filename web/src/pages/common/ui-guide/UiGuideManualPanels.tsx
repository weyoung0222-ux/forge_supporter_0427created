import {
  SearchOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Flex,
  Form,
  Input,
  Modal,
  Result,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  theme,
} from 'antd';
import * as AntdIcons from '@ant-design/icons';
import { useMemo, useState, type ReactNode } from 'react';
import type { UiGuideScanIcon } from './catalog.generated';

const KO: Record<string, { title: string; body: string; screens?: string }> = {
  'foundation:color': {
    title: '컬러 시스템',
    body:
      'Ant Design 토큰(`theme.useToken`)과 Forge CSS 변수(`global.css`의 `--color-*`)가 라이트/다크 모드에서 공통으로 쓰입니다. GNB 인디케이터 등 일부 요소는 프로젝트 변수로 통일합니다.',
    screens: 'ThemeProvider, DomainHomeLayout, 전 화면',
  },
  'foundation:typography': {
    title: '타이포그래피',
    body: '페이지 제목은 `Typography.Title` level 2를 기본으로 하고, 본문은 `Typography.Paragraph`·`Typography.Text`의 type(secondary 등)을 조합합니다.',
    screens: 'DevPortalHomePage, ProjectMenuPage, Library',
  },
  'foundation:spacing': {
    title: '간격',
    body: 'Ant `Space`·`Row` gutter·폼 item 간격을 조합합니다. 도메인 셸은 `--domain-page-inline`(24px)·1200px max-width를 기준으로 합니다.',
    screens: 'domain-home-layout.css, 각 페이지',
  },
  'foundation:icons': {
    title: '아이콘',
    body: '`@ant-design/icons`를 사용합니다. 아래 목록은 저장소 스캔 결과이며, 신규 아이콘 사용 시 자동으로 반영됩니다.',
  },
  'foundation:search-input': {
    title: '검색 입력 너비 (360px)',
    body:
      '전역 `--forge-search-input-width`(360px)와 `forge-search-input`. Data Foundry·Support Definition 목록은 `dev-data-foundry-search forge-search-input` 조합을 씁니다.',
    screens:
      'global.css, ProjectMenuPage, DevLibraryPage, DevDataFoundryPage, SupportDefinitionCardsPage, ScreenListPage, UiGuidePage, UiGuideManualPanels',
  },
  'pattern:project-card': {
    title: '프로젝트 카드',
    body: '프로젝트 목록에서 카드 + 우측 화살표 버튼으로 선택 흐름을 만듭니다.',
    screens: 'ProjectMenuPage (CS/DV/SP/AD — PJ-LS-001)',
  },
  'pattern:library-card': {
    title: '라이브러리 카드',
    body: '자산명·출처 태그·설명 2줄 ellipsis·메타(프로젝트/크기/시간) 패턴입니다.',
    screens: 'DevLibraryPage (DV-LB-MN-001)',
  },
  'pattern:data-table': {
    title: '데이터 테이블 + 필터',
    body: '검색은 `dev-data-foundry-search forge-search-input`(360px). `dev-data-foundry-toolbar`·`toolbar-spacer`·Segmented·정렬 Select를 Data Foundry와 동일하게 둡니다. Support Definition(SP-RB-DF)도 이 툴바를 재사용합니다.',
    screens: 'DevDataFoundryPage (DV-WS-DF-001), SupportDefinitionCardsPage (SP-RB-DF-001/002)',
  },
  'pattern:form': {
    title: '폼',
    body: '세로 레이아웃(`layout="vertical"`), 필수 규칙, 큰 입력은 `size="large"`를 사용합니다.',
    screens: 'LoginPage, DevDataRegisterPage',
  },
  'pattern:empty': {
    title: '빈 상태 (패턴)',
    body: '목록이 없을 때 `Empty`와 필터/검색 안내를 함께 씁니다.',
    screens: 'ProjectMenuPage, DevLibraryPage',
  },
  'layout:shells': {
    title: '페이지 셸',
    body:
      '· GNB only: Library, Dev home(프로젝트 미선택) 등 — `domain-1depth-inner`.\n· GNB + LNB + main: Dev 등 프로젝트 맥락 — `domain-2depth-inner` (LNB 상단에 프로젝트 선택·하단 프로필 포함).\n· Support 포털 Robot/Model/Simulation Support: 동일 2단 셸이지만 LNB는 **메뉴만**(프로젝트 박스·프로필 없음) — `DomainPortalHomeView` + `domain-lnb-card--menu-only`.\n· 풀스크린 마법사: Data Register / Mimic 등 GNB가 교체되는 모드.',
    screens: 'DomainHomeLayout, DomainPortalHomeView',
  },
  'layout:lnb-menu-only': {
    title: 'LNB — 메뉴만 (Support)',
    body:
      '지원 포털(`/support/.../ws/...`)에서는 LNB 카드에 **인라인 메뉴만** 둡니다. Dev 포털의 프로젝트명 버튼·프로필 블록은 표시하지 않습니다. 구현: `showLnbProjectChrome = domain !== \'support\'`로 상·하단 크롬을 분기합니다.',
    screens: 'DomainPortalHomeView (Support), domain-home-layout.css — .domain-lnb-card--menu-only',
  },
  'layout:grid': {
    title: '그리드',
    body: '`Row`의 `gutter={[24,24]}`와 반응형 `Col` `xs`/`sm`/`lg`로 카드·폼 열을 나눕니다.',
    screens: 'DevPortalHomePage, DevDataRegisterPage',
  },
  'layout:container': {
    title: '콘텐츠 컨테이너',
    body: 'GNB·LNB를 제외한 본문은 max-width 1200px, 중앙 정렬, 좁은 뷰포트에서는 좌우 패딩만 유지합니다.',
    screens: 'docs/uisystem.md — 전 포털',
  },
  'layout:section': {
    title: '섹션 구조',
    body: '`domain-1depth-page-header`에 제목 + 리드 문단을 두고, 아래에 카드·테이블 섹션을 이어 붙입니다.',
    screens: 'DevPortalHomePage, DevDataFoundryPage',
  },
  'feedback:modal': {
    title: '모달',
    body: '확인/취소, 폼 입력이 필요하면 `Modal` + 내부 폼 또는 `Modal.confirm` 패턴을 사용합니다.',
    screens: '(예정 화면 — UI Guide 데모)',
  },
  'feedback:toast': {
    title: '토스트 / 메시지',
    body: '`App` 하위에서 `message.success`·`message.error` 등 정적 API를 사용합니다.',
    screens: 'LoginPage, Data Foundry, Register',
  },
  'feedback:loading': {
    title: '로딩',
    body: '버튼 `loading`, 테이블·카드 위 `Spin`, 전역은 배치 작업 문구와 함께 제한적으로 사용합니다.',
    screens: 'LoginPage submit, DevDataFoundryPage',
  },
  'feedback:error': {
    title: '에러 상태',
    body: '`Alert` type="error", `Result` status="error", 폼 `validateMessages`로 필드 오류를 표시합니다.',
    screens: 'Dashboard Alert, 폼 화면',
  },
  'feedback:empty': {
    title: '빈 상태 (피드백)',
    body: '데이터 없음·권한 없음 등 맥락에 맞는 문구와 다음 액션 버튼을 제공합니다.',
    screens: 'Library, Project list',
  },
};

function ManualDescription({ id }: { id: string }) {
  const meta = KO[id];
  if (!meta) return null;
  return (
    <Space direction="vertical" size="small" style={{ width: '100%' }}>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        {meta.title}
      </Typography.Title>
      <Typography.Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>{meta.body}</Typography.Paragraph>
      {meta.screens ? (
        <Typography.Text type="secondary" style={{ fontSize: 13 }}>
          사용된 화면: {meta.screens}
        </Typography.Text>
      ) : null}
    </Space>
  );
}

function IconInventory({ icons }: { icons: UiGuideScanIcon[] }) {
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return icons;
    return icons.filter((i) => i.iconName.toLowerCase().includes(s));
  }, [icons, q]);

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      <Input
        allowClear
        placeholder="Search icons…"
        className="forge-search-input"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <Table
        size="small"
        pagination={{ pageSize: 12 }}
        rowKey="iconName"
        dataSource={filtered}
        columns={[
          {
            title: 'Icon',
            dataIndex: 'iconName',
            width: 200,
            render: (name: string) => {
              const Cmp = (AntdIcons as unknown as Record<string, React.ComponentType>)[name];
              return Cmp && typeof Cmp === 'function' && name !== 'createFromIconfontCN' && name !== 'default' ? (
                <Space>
                  <Cmp />
                  <Typography.Text code>{name}</Typography.Text>
                </Space>
              ) : (
                <Typography.Text type="secondary">{name}</Typography.Text>
              );
            },
          },
          {
            title: 'Used in (files)',
            render: (_, row) => (
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {row.usages.slice(0, 5).map((u) => (
                  <li key={u.relativePath}>
                    <Typography.Text code style={{ fontSize: 12 }}>
                      {u.relativePath}
                    </Typography.Text>
                  </li>
                ))}
                {row.usages.length > 5 ? (
                  <li>
                    <Typography.Text type="secondary">+{row.usages.length - 5} more</Typography.Text>
                  </li>
                ) : null}
              </ul>
            ),
          },
        ]}
      />
    </Space>
  );
}

export function UiGuideManualPanel({ id, scannedIcons }: { id: string; scannedIcons: UiGuideScanIcon[] }): ReactNode {
  const { token } = theme.useToken();

  const demo = (() => {
    switch (id) {
      case 'foundation:color':
        return (
          <Row gutter={[12, 12]}>
            {[
              { label: 'Primary', v: token.colorPrimary },
              { label: 'Success', v: token.colorSuccess },
              { label: 'Warning', v: token.colorWarning },
              { label: 'Error', v: token.colorError },
              { label: 'Text', v: token.colorText },
              { label: 'Border', v: token.colorBorder },
            ].map((c) => (
              <Col xs={12} sm={8} md={6} key={c.label}>
                <Card size="small" styles={{ body: { padding: 12 } }}>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {c.label}
                  </Typography.Text>
                  <div
                    style={{
                      marginTop: 8,
                      height: 40,
                      borderRadius: 6,
                      background: c.v,
                      border: `1px solid ${token.colorSplit}`,
                    }}
                  />
                  <Typography.Paragraph code copyable style={{ marginTop: 8, marginBottom: 0, fontSize: 11 }}>
                    {c.v}
                  </Typography.Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        );
      case 'foundation:typography':
        return (
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Typography.Title level={2}>Title level 2</Typography.Title>
            <Typography.Title level={3}>Title level 3</Typography.Title>
            <Typography.Title level={4}>Title level 4</Typography.Title>
            <Typography.Paragraph>Paragraph — default body.</Typography.Paragraph>
            <Typography.Text type="secondary">Secondary text</Typography.Text>
          </Space>
        );
      case 'foundation:spacing':
        return (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Typography.Text type="secondary">Space size small / middle / large</Typography.Text>
            <Space size="small">
              <div style={{ width: 24, height: 24, background: token.colorPrimary, opacity: 0.35, borderRadius: 4 }} />
              <div style={{ width: 24, height: 24, background: token.colorPrimary, opacity: 0.35, borderRadius: 4 }} />
            </Space>
            <Space size="middle">
              <div style={{ width: 24, height: 24, background: token.colorInfo, opacity: 0.4, borderRadius: 4 }} />
              <div style={{ width: 24, height: 24, background: token.colorInfo, opacity: 0.4, borderRadius: 4 }} />
            </Space>
            <Typography.Text code>Row gutter [24, 24] for responsive grids</Typography.Text>
          </Space>
        );
      case 'foundation:icons':
        return <IconInventory icons={scannedIcons} />;
      case 'foundation:search-input':
        return (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Typography.Paragraph style={{ marginBottom: 0 }}>
              <Typography.Text code>--forge-search-input-width: 360px</Typography.Text> · className{' '}
              <Typography.Text code>forge-search-input</Typography.Text>
            </Typography.Paragraph>
            <Flex gap={12} wrap="wrap" align="center">
              <Input
                className="forge-search-input"
                placeholder="Search…"
                prefix={<SearchOutlined />}
                allowClear
              />
              <Input.Search className="forge-search-input" placeholder="Search…" allowClear />
            </Flex>
          </Space>
        );
      case 'pattern:project-card':
        return (
          <Card hoverable style={{ maxWidth: 480 }}>
            <Flex align="center" justify="space-between" gap={16}>
              <Flex align="center" gap={12}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 8,
                    border: `1px solid ${token.colorBorder}`,
                    background: token.colorFillAlter,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    color: token.colorTextSecondary,
                  }}
                >
                  image
                </div>
                <Space direction="vertical" size={2}>
                  <Typography.Text strong>Sample project</Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Short description of the workspace.
                  </Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    <TeamOutlined /> 8 members
                  </Typography.Text>
                </Space>
              </Flex>
              <Button type="text" icon={<AntdIcons.ArrowRightOutlined />} aria-label="Open" />
            </Flex>
          </Card>
        );
      case 'pattern:library-card':
        return (
          <Card style={{ maxWidth: 480 }} styles={{ body: { padding: 16 } }}>
            <Flex justify="space-between" align="flex-start" gap={8} style={{ marginBottom: 8 }}>
              <Typography.Text strong style={{ fontSize: 15 }}>
                Traffic_Sign_Dataset
              </Typography.Text>
              <Tag>Local</Tag>
            </Flex>
            <Typography.Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ marginBottom: 12 }}>
              Collected from urban intersections.
            </Typography.Paragraph>
            <Space direction="vertical" size={4}>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Smart City
              </Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                2.4GB · Created 3 hours ago
              </Typography.Text>
            </Space>
          </Card>
        );
      case 'pattern:data-table':
        return (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Flex gap={8} wrap="wrap" align="center">
              <Input placeholder="Search" className="forge-search-input" prefix={<SearchOutlined />} allowClear />
              <Select
                style={{ width: 140 }}
                defaultValue="all"
                options={[
                  { value: 'all', label: 'All sources' },
                  { value: 'Register', label: 'Register' },
                ]}
              />
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                + Segmented list/grid
              </Typography.Text>
            </Flex>
            <Table
              size="small"
              pagination={false}
              dataSource={[
                { key: '1', no: 1, name: 'Dataset batch 001', src: 'Register' },
                { key: '2', no: 2, name: 'Dataset batch 002', src: 'Generator' },
              ]}
              columns={[
                { title: 'No', dataIndex: 'no', width: 48 },
                { title: 'Name', dataIndex: 'name' },
                { title: 'Source', dataIndex: 'src', width: 100 },
              ]}
            />
          </Space>
        );
      case 'pattern:form':
        return (
          <Form layout="vertical" style={{ maxWidth: 360 }}>
            <Form.Item label="Email" required>
              <Input size="large" placeholder="customer | dev | …" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" size="large" block>
                Submit
              </Button>
            </Form.Item>
          </Form>
        );
      case 'pattern:empty':
        return <Empty description="No projects match filters" />;
      case 'layout:shells':
        return (
          <Card size="small">
            <pre style={{ margin: 0, fontSize: 12, fontFamily: 'ui-monospace, monospace', whiteSpace: 'pre-wrap' }}>
              {`[ GNB  —  max-width 1200 ]
[ Intro / Login / UI Guide ]  →  full width column

[ GNB ]
[ LNB | main ]  Dev: project box + menu + profile  →  domain-2depth-inner

[ GNB ]
[ LNB | main ]  Support: menu-only (.domain-lnb-card--menu-only)

[ Alt GNB: Back | Save | Register ]  →  Data Register / Mimic`}
            </pre>
          </Card>
        );
      case 'layout:lnb-menu-only':
        return (
          <Card size="small" title="Support LNB (schematic)">
            <pre style={{ margin: 0, fontSize: 12, fontFamily: 'ui-monospace, monospace', whiteSpace: 'pre-wrap' }}>
              {`┌─────────────────┐
│  Inline Menu    │  ← no project selector
│  (submenus OK)  │     no profile footer
└─────────────────┘`}
            </pre>
          </Card>
        );
      case 'layout:grid':
        return (
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card size="small">Col md=12</Card>
            </Col>
            <Col xs={24} md={12}>
              <Card size="small">Col md=12</Card>
            </Col>
          </Row>
        );
      case 'layout:container':
        return (
          <div>
            <div
              style={{
                border: `1px dashed ${token.colorPrimary}`,
                borderRadius: 8,
                padding: 16,
                maxWidth: 1200,
                margin: '0 auto',
                background: token.colorFillAlter,
              }}
            >
              <Typography.Text>Content column — max-width 1200px, centered</Typography.Text>
            </div>
          </div>
        );
      case 'layout:section':
        return (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Typography.Title level={3} style={{ marginBottom: 4 }}>
                Section title
              </Typography.Title>
              <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                Lead copy under title (domain-1depth pattern).
              </Typography.Paragraph>
            </div>
            <Card size="small">First content block</Card>
          </div>
        );
      case 'feedback:modal':
        return <ModalFeedbackDemo />;
      case 'feedback:toast':
        return (
          <Typography.Paragraph type="secondary">
            Prefer `message` from antd static API (requires `App` wrapper). See Components → message for interactive
            buttons.
          </Typography.Paragraph>
        );
      case 'feedback:loading':
        return (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Spin tip="Loading workspace…">
              <Card style={{ minHeight: 120 }}>Content skeleton area</Card>
            </Spin>
            <Button loading>Button loading</Button>
          </Space>
        );
      case 'feedback:error':
        return (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Alert type="error" message="Request failed" description="Network timeout." showIcon />
            <Result status="error" title="Submission failed" subTitle="Please retry or contact support." />
          </Space>
        );
      case 'feedback:empty':
        return (
          <Empty description="No datasets yet">
            <Button type="primary">Create dataset</Button>
          </Empty>
        );
      default:
        return null;
    }
  })();

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <ManualDescription id={id} />
      <div>
        <Typography.Title level={5}>Examples</Typography.Title>
        {demo}
      </div>
    </Space>
  );
}

function ModalFeedbackDemo() {
  const [open, setOpen] = useState(false);
  return (
    <Space>
      <Button type="primary" onClick={() => setOpen(true)}>
        Open modal
      </Button>
      <Modal
        title="Confirm"
        open={open}
        onOk={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        okText="OK"
        cancelText="Cancel"
      >
        <p>Modal body — use for blocking confirmations or short forms.</p>
      </Modal>
    </Space>
  );
}
