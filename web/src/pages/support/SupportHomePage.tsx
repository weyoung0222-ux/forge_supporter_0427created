import { Navigate, useLocation } from 'react-router-dom';
import { DomainHomeLayout } from '../../shared/ui/layout/DomainHomeLayout';

export function SupportHomePage() {
  const { pathname } = useLocation();
  if (pathname === '/support' || pathname === '/support/') {
    return <Navigate to="/support/home" replace />;
  }
  return <DomainHomeLayout domain="support" />;
}
