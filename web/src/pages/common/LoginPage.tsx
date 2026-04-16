import { Button, Divider, Flex, Form, Input, Space, Typography, message } from 'antd';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmailLogin } from '../../features/auth/model/useEmailLogin';
import { useLocale } from '../../shared/i18n/LocaleProvider';
import { ThemeToggle } from '../../shared/ui/common/ThemeToggle';
import { useDescriptionScreen } from '../../shared/ui/common/DescriptionModeProvider';
import './login.css';

interface LoginFormValues {
  email: string;
}

const DOMAIN_ROUTE_MAP: Record<string, '/customer' | '/dev' | '/support' | '/admin'> = {
  customer: '/customer',
  dev: '/dev',
  support: '/support',
  admin: '/admin',
};

export function LoginPage() {
  const { t } = useLocale();
  const { isLoading, submit } = useEmailLogin();
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const descriptionMeta = useMemo(
    () => ({
      screenName: 'Login',
      screenId: 'CO-AU-LG-001',
      screenDescription: '사용자가 도메인 키를 입력해 포탈에 진입하는 로그인 화면',
      areas: [
        {
          id: 'login-header',
          name: '로그인 헤더',
          role: '브랜드 및 로그인 목적을 안내',
          userAction: '로고/타이틀을 확인',
          linkedScreen: '도메인 홈 화면',
        },
        {
          id: 'login-form',
          name: '로그인 입력 폼',
          role: '도메인 값 입력 및 인증 요청',
          userAction: 'customer/dev/support/admin 값을 입력 후 로그인',
          linkedScreen: '각 도메인 Home',
        },
        {
          id: 'login-secondary',
          name: '대체 로그인 액션',
          role: '비밀번호 로그인 진입점을 제공',
          userAction: '비밀번호 로그인 버튼 선택',
          linkedScreen: '비밀번호 로그인 화면(예정)',
        },
      ],
    }),
    [],
  );
  const { bindArea } = useDescriptionScreen(descriptionMeta);

  const handleEmailLogin = async (values: LoginFormValues) => {
    const key = values.email.trim().toLowerCase();
    const route = DOMAIN_ROUTE_MAP[key];

    if (!route) {
      messageApi.error(t('login.emailInvalid'));
      return;
    }

    await submit(key);
    messageApi.success(t('login.success'));
    navigate(route);
  };

  return (
    <Flex className="login-page" align="center" justify="center">
      {contextHolder}
      <div className="theme-toggle">
        <ThemeToggle />
      </div>

      <Space direction="vertical" size={14} className="login-panel">
        <div {...bindArea('login-header')}>
          <div className="login-image-placeholder">logo</div>

          <Typography.Title level={2} className="login-title">
            {t('login.title')}
          </Typography.Title>
        </div>

        <div {...bindArea('login-form')}>
          <Form<LoginFormValues> layout="vertical" onFinish={handleEmailLogin}>
            <Form.Item
              name="email"
              rules={[{ required: true, message: t('login.emailRequired') }]}
            >
              <Input placeholder={t('login.placeholder')} size="large" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" size="large" block htmlType="submit" loading={isLoading}>
                {t('login.submit')}
              </Button>
            </Form.Item>
          </Form>
        </div>

        <div {...bindArea('login-secondary')}>
          <Divider plain className="login-divider">
            {t('login.or')}
          </Divider>

          <Button size="large" block disabled={isLoading}>
            {t('login.password')}
          </Button>
        </div>
      </Space>
    </Flex>
  );
}
