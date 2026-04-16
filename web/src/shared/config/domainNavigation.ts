import type { MenuProps } from 'antd';

export type DomainKey = 'customer' | 'dev' | 'support' | 'admin';

export interface DomainNavigationConfig {
  title: string;
  gnbItems: MenuProps['items'];
  lnbItems: MenuProps['items'];
  selectedGnbKey: string;
  selectedLnbKey: string;
}

export const DOMAIN_NAVIGATION: Record<DomainKey, DomainNavigationConfig> = {
  customer: {
    title: 'Customer',
    gnbItems: [
      { key: 'home', label: 'Home' },
      { key: 'project', label: 'Project' },
      { key: 'usage', label: 'Usage' },
    ],
    lnbItems: [
      { key: 'my-task', label: 'My Task' },
      { key: 'robot-ops', label: 'Robot Operations' },
      { key: 'work-orders', label: 'Work Orders' },
      { key: 'settings', label: 'Settings' },
    ],
    selectedGnbKey: 'home',
    selectedLnbKey: 'my-task',
  },
  dev: {
    title: 'Dev',
    gnbItems: [
      { key: 'home', label: 'Home' },
      { key: 'project', label: 'Project' },
      { key: 'library', label: 'Library' },
    ],
    lnbItems: [
      { key: 'dashboard', label: 'Dashboard' },
      {
        key: 'workspace',
        label: 'Workspace',
        children: [
          { key: 'data-foundry', label: 'Data Foundry' },
          { key: 'model-institute', label: 'Model Institute' },
        ],
      },
      { key: 'settings', label: 'Settings' },
    ],
    selectedGnbKey: 'home',
    selectedLnbKey: 'data-foundry',
  },
  support: {
    title: 'Support',
    gnbItems: [
      { key: 'home', label: 'Home' },
      { key: 'project', label: 'Project' },
      { key: 'simulation', label: 'Simulation' },
    ],
    lnbItems: [
      { key: 'dashboard', label: 'Dashboard' },
      { key: 'sim-lab', label: 'Simulation Lab' },
      { key: 'robot-assets', label: 'Robot Assets' },
      { key: 'settings', label: 'Settings' },
    ],
    selectedGnbKey: 'home',
    selectedLnbKey: 'dashboard',
  },
  admin: {
    title: 'Admin',
    gnbItems: [
      { key: 'home', label: 'Home' },
      { key: 'project', label: 'Project' },
      { key: 'admin', label: 'Admin' },
    ],
    lnbItems: [
      { key: 'dashboard', label: 'Dashboard' },
      { key: 'user-role', label: 'User & Roles' },
      { key: 'infra', label: 'Infrastructure' },
      { key: 'settings', label: 'Settings' },
    ],
    selectedGnbKey: 'home',
    selectedLnbKey: 'user-role',
  },
};
