import { Navigate, Route, Routes } from 'react-router-dom';
import { IntroLandingPage } from '../../pages/common/IntroLandingPage';
import { LoginPage } from '../../pages/common/LoginPage';
import { ScreenListPage } from '../../pages/common/ScreenListPage';
import { UiGuidePage } from '../../pages/common/UiGuidePage';
import { CustomerHomePage } from '../../pages/customer/CustomerHomePage';
import { DevHomePage } from '../../pages/dev/DevHomePage';
import { SupportHomePage } from '../../pages/support/SupportHomePage';
import { AdminHomePage } from '../../pages/admin/AdminHomePage';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<IntroLandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/ui-guide" element={<UiGuidePage />} />
      <Route path="/screen-list" element={<ScreenListPage />} />
      <Route path="/customer" element={<CustomerHomePage />} />
      <Route path="/dev" element={<DevHomePage />} />
      <Route path="/support/*" element={<SupportHomePage />} />
      <Route path="/admin" element={<AdminHomePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
