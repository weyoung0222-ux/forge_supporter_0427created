import { BellOutlined, GlobalOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Dropdown, Space } from 'antd';
import type { MenuProps } from 'antd';
import { useLocale } from '../../i18n/LocaleProvider';
import type { AppLocale } from '../../i18n/strings';

/** GNB trailing: notification → profile → language → settings */
export function DomainGnbActionIcons() {
  const { locale, setLocale, t } = useLocale();

  const items: MenuProps['items'] = [
    {
      key: 'ko',
      label: t('locale.ko'),
    },
    {
      key: 'en',
      label: t('locale.en'),
    },
  ];

  const onMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'ko' || key === 'en') {
      setLocale(key as AppLocale);
    }
  };

  return (
    <Space className="domain-gnb-icons" size={16}>
      <BellOutlined />
      <UserOutlined />
      <Dropdown
        menu={{
          items,
          selectable: true,
          selectedKeys: [locale],
          onClick: onMenuClick,
        }}
        trigger={['click']}
        placement="bottomRight"
      >
        <Button
          type="text"
          size="small"
          className="domain-gnb-locale"
          icon={<GlobalOutlined />}
          aria-label={t('locale.menuAria')}
        />
      </Dropdown>
      <SettingOutlined />
    </Space>
  );
}
