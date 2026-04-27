import type { MenuProps } from 'antd';

export type DomainKey = 'customer' | 'dev' | 'support' | 'admin';

export interface DomainNavigationConfig {
  title: string;
  gnbItems: MenuProps['items'];
  lnbItems: MenuProps['items'];
  /** When set (e.g. Support portal), LNB items depend on the active GNB section. */
  lnbItemsByGnb?: Partial<Record<string, MenuProps['items']>>;
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
      { key: 'robot-support', label: 'Robot Support' },
      { key: 'model-support', label: 'Model Support' },
      { key: 'simulation-support', label: 'Simulation Support' },
    ],
    lnbItems: [],
    lnbItemsByGnb: {
      'robot-support': [
        {
          key: 'definition',
          label: 'Definition',
          children: [
            { key: 'definition-models', label: 'Models' },
            { key: 'definition-devices', label: 'Devices' },
          ],
        },
        { key: 'compositions', label: 'Compositions' },
        { key: 'task', label: 'Task' },
        {
          key: 'connections',
          label: 'Connections',
          children: [
            { key: 'connections-endpoints', label: 'Endpoints' },
            { key: 'connections-status', label: 'Connection Status' },
          ],
        },
      ],
      'model-support': [
        {
          key: 'ms-cat-registry',
          label: 'Model Registry',
          children: [{ key: 'ms-registry', label: 'WFM / IDM Models' }],
        },
        {
          key: 'ms-cat-param-presets',
          label: 'Parameter Presets',
          children: [{ key: 'ms-param-presets', label: 'Parameter Presets' }],
        },
        {
          key: 'ms-cat-ft',
          label: 'Fine-tuning',
          children: [
            { key: 'ms-ft-configs', label: 'Fine-tuning Configs' },
            { key: 'ms-ft-scripts', label: 'Fine-tuning Scripts' },
            { key: 'ms-ft-presets', label: 'Fine-tuning Presets' },
          ],
        },
        {
          key: 'ms-cat-training',
          label: 'Training',
          children: [{ key: 'ms-training-jobs', label: 'Training Jobs' }],
        },
        {
          key: 'ms-cat-pretrained',
          label: 'Pre-trained Models',
          children: [
            { key: 'ms-pretrained-registry', label: 'Pre-trained Registry' },
            { key: 'ms-pretrained-artifacts', label: 'Artifacts' },
          ],
        },
      ],
      'simulation-support': [
        { key: 'sim-assets', label: 'Assets' },
        { key: 'sim-configurations', label: 'Configurations' },
        { key: 'sim-presets', label: 'Presets' },
        { key: 'sim-scenes', label: 'Scenes' },
      ],
    },
    selectedGnbKey: 'home',
    selectedLnbKey: 'definition-models',
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
