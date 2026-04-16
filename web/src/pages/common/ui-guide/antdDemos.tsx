import {
  Alert,
  App,
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Drawer,
  Dropdown,
  Empty,
  Flex,
  Form,
  Input,
  InputNumber,
  Layout,
  List,
  Menu,
  Progress,
  Radio,
  Row,
  Segmented,
  Select,
  Slider,
  Space,
  Spin,
  Statistic,
  Steps,
  Table,
  Tabs,
  Tag,
  Timeline,
  Tooltip,
  Typography,
  Upload,
  theme,
} from 'antd';
import { useMemo, useState, type ReactNode } from 'react';

const { Header, Content } = Layout;

/** Live Ant Design samples for UI Guide (variants: size / type / state). */
export function AntdComponentDemo({ name }: { name: string }): ReactNode {
  switch (name) {
    case 'Alert':
      return (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Alert type="info" message="Info" showIcon />
          <Alert type="success" message="Success" showIcon />
          <Alert type="warning" message="Warning" showIcon />
          <Alert type="error" message="Error" showIcon />
        </Space>
      );
    case 'App':
      return (
        <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
          Use <Typography.Text code>App</Typography.Text> from antd to enable static methods context (message, Modal,
          notification). Forge wraps the tree in <Typography.Text code>ThemeProvider</Typography.Text> with{' '}
          <Typography.Text code>AntdApp</Typography.Text>.
        </Typography.Paragraph>
      );
    case 'Button':
      return (
        <Space wrap size="middle">
          <Space wrap>
            <Button type="primary">Primary</Button>
            <Button>Default</Button>
            <Button type="dashed">Dashed</Button>
            <Button type="link">Link</Button>
            <Button type="text">Text</Button>
          </Space>
          <Divider type="vertical" style={{ height: 32 }} />
          <Space wrap>
            <Button size="large">Large</Button>
            <Button size="middle">Middle</Button>
            <Button size="small">Small</Button>
          </Space>
          <Divider type="vertical" style={{ height: 32 }} />
          <Space wrap>
            <Button disabled>
              Disabled
            </Button>
            <Button type="primary" danger>
              Danger
            </Button>
            <Button type="primary" loading>
              Loading
            </Button>
          </Space>
        </Space>
      );
    case 'Card':
      return (
        <Row gutter={16}>
          <Col span={12}>
            <Card title="Default" size="small">
              Content
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Hoverable" hoverable size="small">
              Content
            </Card>
          </Col>
        </Row>
      );
    case 'Checkbox':
      return (
        <Space>
          <Checkbox defaultChecked>Checked</Checkbox>
          <Checkbox>Unchecked</Checkbox>
          <Checkbox indeterminate>Indeterminate</Checkbox>
          <Checkbox disabled>Disabled</Checkbox>
        </Space>
      );
    case 'Col':
    case 'Row':
      return (
        <div>
          <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
            Row gutter 16, Col span 12 / 12
          </Typography.Text>
          <Row gutter={16}>
            <Col span={12}>
              <Card size="small">Col 12</Card>
            </Col>
            <Col span={12}>
              <Card size="small">Col 12</Card>
            </Col>
          </Row>
        </div>
      );
    case 'ConfigProvider':
      return (
        <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
          Forge applies <Typography.Text code>ConfigProvider</Typography.Text> in <Typography.Text code>ThemeProvider</Typography.Text>{' '}
          with locale (ko/en) and theme algorithm (light/dark).
        </Typography.Paragraph>
      );
    case 'Divider':
      return (
        <Space direction="vertical" style={{ width: '100%' }}>
          <span>
            Before <Divider type="vertical" /> After
          </span>
          <Divider plain>Plain</Divider>
        </Space>
      );
    case 'Drawer':
      return <DrawerDemo />;
    case 'Dropdown':
      return (
        <Dropdown
          menu={{
            items: [
              { key: '1', label: 'Item 1' },
              { key: '2', label: 'Item 2' },
            ],
          }}
        >
          <Button>Dropdown</Button>
        </Dropdown>
      );
    case 'Empty':
      return <Empty description="No data" />;
    case 'Flex':
      return (
        <Flex gap="small" wrap="wrap">
          <Button type="primary">A</Button>
          <Button>B</Button>
          <Button>C</Button>
        </Flex>
      );
    case 'Form':
      return (
        <Form layout="vertical" style={{ maxWidth: 320 }} onFinish={() => undefined}>
          <Form.Item label="Field" name="a" rules={[{ required: true }]}>
            <Input placeholder="Required" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      );
    case 'Input':
      return (
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Input placeholder="Default" />
          <Input size="large" placeholder="Large" />
          <Input.Password placeholder="Password" />
          <Input.TextArea placeholder="TextArea" rows={2} />
        </Space>
      );
    case 'InputNumber':
      return (
        <Space>
          <InputNumber min={0} max={10} defaultValue={3} />
          <InputNumber size="small" defaultValue={1} />
        </Space>
      );
    case 'Layout':
      return (
        <Layout style={{ border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
          <Header style={{ height: 40, lineHeight: '40px', paddingInline: 16, background: 'rgba(0,0,0,0.06)' }}>
            Header
          </Header>
          <Content style={{ padding: 16, minHeight: 60 }}>Content</Content>
        </Layout>
      );
    case 'List':
      return (
        <List
          size="small"
          bordered
          dataSource={['Alpha', 'Bravo', 'Charlie']}
          renderItem={(item) => <List.Item>{item}</List.Item>}
        />
      );
    case 'Menu':
      return (
        <Menu
          style={{ maxWidth: 280, border: '1px solid var(--color-border)', borderRadius: 8 }}
          mode="inline"
          defaultSelectedKeys={['1']}
          items={[
            { key: '1', label: 'Nav item 1' },
            { key: '2', label: 'Nav item 2' },
            { key: 'sub', label: 'Submenu', children: [{ key: '3', label: 'Child' }] },
          ]}
        />
      );
    case 'message':
      return <MessageDemo />;
    case 'Progress':
      return (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Progress percent={30} />
          <Progress percent={50} status="active" />
          <Progress percent={100} />
          <Progress percent={50} status="exception" />
        </Space>
      );
    case 'Radio':
      return (
        <Radio.Group defaultValue="a">
          <Radio value="a">A</Radio>
          <Radio value="b">B</Radio>
          <Radio value="c" disabled>
            Disabled
          </Radio>
        </Radio.Group>
      );
    case 'Segmented':
      return <Segmented options={['List', 'Kanban', 'Timeline']} />;
    case 'Select':
      return (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Select
            style={{ width: '100%' }}
            placeholder="Select"
            options={[
              { value: 'a', label: 'Option A' },
              { value: 'b', label: 'Option B' },
            ]}
          />
          <Select mode="multiple" style={{ width: '100%' }} placeholder="Multiple" options={[{ value: 'x', label: 'X' }]} />
        </Space>
      );
    case 'Slider':
      return <Slider defaultValue={40} style={{ maxWidth: 360 }} />;
    case 'Space':
      return (
        <Space size={[8, 16]} wrap>
          {Array.from({ length: 6 }, (_, i) => (
            <Button key={i}>Item {i + 1}</Button>
          ))}
        </Space>
      );
    case 'Spin':
      return (
        <Space size="large">
          <Spin />
          <Spin size="small" />
          <Spin tip="Loading…">
            <Card style={{ width: 200, height: 100 }} />
          </Spin>
        </Space>
      );
    case 'Statistic':
      return (
        <Row gutter={24}>
          <Col>
            <Statistic title="Active" value={11} />
          </Col>
          <Col>
            <Statistic title="Rate" value={93.5} suffix="%" />
          </Col>
        </Row>
      );
    case 'Steps':
      return <Steps size="small" current={1} items={[{ title: 'One' }, { title: 'Two' }, { title: 'Three' }]} />;
    case 'Table':
      return (
        <Table
          size="small"
          pagination={false}
          dataSource={[
            { key: '1', name: 'Row A', v: 10 },
            { key: '2', name: 'Row B', v: 20 },
          ]}
          columns={[
            { title: 'Name', dataIndex: 'name' },
            { title: 'Value', dataIndex: 'v' },
          ]}
        />
      );
    case 'Tabs':
      return (
        <Tabs
          items={[
            { key: '1', label: 'Tab 1', children: 'Content 1' },
            { key: '2', label: 'Tab 2', children: 'Content 2' },
          ]}
        />
      );
    case 'Tag':
      return (
        <Space wrap>
          <Tag>Default</Tag>
          <Tag color="processing">Processing</Tag>
          <Tag color="success">Success</Tag>
          <Tag color="error">Error</Tag>
          <Tag closable>Closable</Tag>
        </Space>
      );
    case 'theme':
      return <ThemeTokenDemo />;
    case 'Timeline':
      return (
        <Timeline
          items={[
            { children: 'Step 1' },
            { children: 'Step 2', color: 'blue' },
            { children: 'Step 3', color: 'gray' },
          ]}
        />
      );
    case 'Tooltip':
      return (
        <Space>
          <Tooltip title="Tooltip text">
            <Button>Hover</Button>
          </Tooltip>
          <Tooltip title="Disabled" open>
            <span>
              <Button disabled>Forced open</Button>
            </span>
          </Tooltip>
        </Space>
      );
    case 'Typography':
      return (
        <Space direction="vertical" size={0}>
          <Typography.Title level={4}>Title level 4</Typography.Title>
          <Typography.Text>Body text</Typography.Text>
          <Typography.Text type="secondary">Secondary</Typography.Text>
          <Typography.Text type="danger">Danger</Typography.Text>
        </Space>
      );
    case 'Upload':
      return (
        <Upload beforeUpload={() => false}>
          <Button>Upload</Button>
        </Upload>
      );
    default:
      return (
        <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
          No dedicated preview for <Typography.Text code>{name}</Typography.Text>. Use <b>Open code</b> to inspect
          source usage in the repository.
        </Typography.Paragraph>
      );
  }
}

function DrawerDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        Open drawer
      </Button>
      <Drawer title="Title" placement="right" open={open} onClose={() => setOpen(false)} width={320}>
        <p>Drawer content</p>
      </Drawer>
    </>
  );
}

function MessageDemo() {
  const { message } = App.useApp();
  return (
    <Space wrap>
      <Button onClick={() => message.info('Info')}>message.info</Button>
      <Button onClick={() => message.success('Saved')}>message.success</Button>
      <Button onClick={() => message.error('Failed')}>message.error</Button>
    </Space>
  );
}

function ThemeTokenDemo() {
  const { token } = theme.useToken();
  const rows = useMemo(
    () => [
      { k: 'colorPrimary', v: token.colorPrimary },
      { k: 'colorSuccess', v: token.colorSuccess },
      { k: 'colorWarning', v: token.colorWarning },
      { k: 'colorError', v: token.colorError },
      { k: 'colorInfo', v: token.colorInfo },
      { k: 'colorBgLayout', v: token.colorBgLayout },
      { k: 'colorText', v: token.colorText },
    ],
    [token],
  );
  return (
    <Row gutter={[12, 12]}>
      {rows.map((r) => (
        <Col key={r.k} xs={24} sm={12} md={8}>
          <Card size="small" styles={{ body: { padding: 12 } }}>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {r.k}
            </Typography.Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <span style={{ width: 28, height: 28, borderRadius: 4, background: r.v, border: '1px solid rgba(0,0,0,0.08)' }} />
              <Typography.Text code style={{ fontSize: 11 }}>
                {r.v}
              </Typography.Text>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
