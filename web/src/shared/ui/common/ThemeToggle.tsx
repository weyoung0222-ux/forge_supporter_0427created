import { useContext } from 'react';
import { Button } from 'antd';
import { BulbOutlined, MoonOutlined } from '@ant-design/icons';
import { ThemeContext } from '../../../app/providers/ThemeProvider';
import { useLocale } from '../../i18n/LocaleProvider';

export function ThemeToggle() {
  const { mode, toggleMode } = useContext(ThemeContext);
  const { t } = useLocale();

  return (
    <Button
      size="small"
      icon={mode === 'light' ? <MoonOutlined /> : <BulbOutlined />}
      onClick={toggleMode}
    >
      {mode === 'light' ? t('theme.dark') : t('theme.light')}
    </Button>
  );
}
