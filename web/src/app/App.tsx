import { ThemeProvider } from './providers/ThemeProvider';
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './router/AppRouter';
import { DescriptionModeProvider } from '../shared/ui/common/DescriptionModeProvider';
import { LocaleProvider } from '../shared/i18n/LocaleProvider';

export function App() {
  return (
    <LocaleProvider>
      <ThemeProvider>
        <BrowserRouter>
          <DescriptionModeProvider>
            <AppRouter />
          </DescriptionModeProvider>
        </BrowserRouter>
      </ThemeProvider>
    </LocaleProvider>
  );
}
