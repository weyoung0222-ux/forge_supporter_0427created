import { createContext, useMemo, useState, type ReactNode } from 'react';
import { App as AntdApp, ConfigProvider, theme, type ThemeConfig } from 'antd';
import koKR from 'antd/locale/ko_KR';
import enUS from 'antd/locale/en_US';
import { useLocale } from '../../shared/i18n/LocaleProvider';

type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;
  toggleMode: () => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
  mode: 'light',
  toggleMode: () => undefined,
});

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { locale } = useLocale();
  const [mode, setMode] = useState<ThemeMode>('light');

  const toggleMode = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const themeConfig: ThemeConfig = useMemo(
    () => ({
      algorithm: mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
      components: {
        Menu: {
          activeBarHeight: 2,
          activeBarBorderWidth: 0,
          horizontalItemSelectedBg: 'transparent',
          horizontalItemBorderRadius: 0,
          horizontalItemSelectedColor: '#1677ff',
          itemSelectedBg: 'transparent',
          itemActiveBg: 'transparent',
        },
      },
    }),
    [mode],
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleMode }}>
      <ConfigProvider locale={locale === 'ko' ? koKR : enUS} theme={themeConfig}>
        <AntdApp>
          <div data-theme={mode} className="app-shell">
            {children}
          </div>
        </AntdApp>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}
