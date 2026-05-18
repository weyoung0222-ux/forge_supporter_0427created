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
        { key: 'definition-robot', label: 'Robot Model' },
        { key: 'definition-devices', label: 'Robot Device Model' },
        { key: 'compositions', label: 'Robot' },
        { key: 'instances-endpoints', label: 'Robot Instance' },
        { key: 'task', label: 'Robot Task Type' },
      ],
      'model-support': [
        {
          key: 'ms-cat-registry',
          label: 'Model Registry',
          children: [{ key: 'ms-registry', label: 'WFM / IDM Models' }],
        },
        {
          key: 'ms-cat-validation-presets',
          label: 'Validation & Presets',
          children: [
            { key: 'ms-validation-presets', label: 'Validation Presets' },
            { key: 'ms-param-presets', label: 'Parameter Presets' },
            { key: 'ms-ft-presets', label: 'Fine-tuning Presets' },
          ],
        },
        {
          key: 'ms-cat-ft',
          label: 'Fine-tuning',
          children: [
            { key: 'ms-ft-configs', label: 'Fine-tuning Configs' },
            { key: 'ms-ft-scripts', label: 'Fine-tuning Scripts' },
          ],
        },
        {
          key: 'ms-cat-training',
          label: 'Training',
          children: [{ key: 'ms-training-jobs', label: 'Training Jobs' }],
        },
        {
          key: 'ms-cat-artifacts',
          label: 'Model Artifacts',
          children: [
            { key: 'ms-pretrained-registry', label: 'Pre-trained Registry' },
            { key: 'ms-pretrained-artifacts', label: 'Artifacts' },
          ],
        },
      ],
      'simulation-support': [
        { key: 'sim-assets', label: 'Simulation Asset' },
        { key: 'sim-scenes', label: 'Simulation Scene' },
        {
          key: 'augmentation-setup',
          label: 'Augmentation Setup',
          children: [
            { key: 'sim-configurations', label: 'Configuration' },
            { key: 'sim-presets', label: 'Preset' },
          ],
        },
      ],
    },
    selectedGnbKey: 'home',
    selectedLnbKey: 'definition-robot',
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
