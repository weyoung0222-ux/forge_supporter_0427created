import type { MenuProps } from 'antd';

const NAV_TKEY: Record<string, string> = {
  home: 'nav.home',
  project: 'nav.project',
  library: 'nav.library',
  usage: 'nav.usage',
  simulation: 'nav.simulation',
  admin: 'nav.admin',
  dashboard: 'nav.dashboard',
  workspace: 'nav.workspace',
  'data-foundry': 'nav.data_foundry',
  'model-institute': 'nav.model_institute',
  settings: 'nav.settings',
  'my-task': 'nav.my_task',
  'robot-ops': 'nav.robot_ops',
  'work-orders': 'nav.work_orders',
  'sim-lab': 'nav.sim_lab',
  'robot-assets': 'nav.robot_assets',
  'user-role': 'nav.user_role',
  infra: 'nav.infra',
};

export function localizeMenuItems(
  items: MenuProps['items'] | undefined,
  t: (key: string) => string,
): MenuProps['items'] {
  if (!items) {
    return items;
  }
  return items.map((item) => {
    if (!item || typeof item !== 'object' || !('key' in item)) {
      return item;
    }
    const raw = item as {
      key: string | number;
      label?: React.ReactNode;
      children?: MenuProps['items'];
    };
    const key = String(raw.key);
    const tkey = NAV_TKEY[key];
    const label = tkey ? t(tkey) : typeof raw.label === 'string' ? raw.label : raw.label;
    const children = raw.children ? localizeMenuItems(raw.children, t) : undefined;
    return { ...raw, label, children };
  });
}
