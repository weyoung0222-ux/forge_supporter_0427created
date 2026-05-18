import type { MenuProps } from 'antd';

const NAV_TKEY: Record<string, string> = {
  home: 'nav.home',
  project: 'nav.project',
  library: 'nav.library',
  usage: 'nav.usage',
  simulation: 'nav.simulation',
  'robot-support': 'nav.robot_support',
  'model-support': 'nav.model_support',
  'simulation-support': 'nav.simulation_support',
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
  definition: 'nav.support.definition_group',
  instances: 'nav.support.instances_group',
  'definition-robot': 'nav.support.definition_robot',
  'definition-devices': 'nav.support.definition_devices',
  'instances-endpoints': 'nav.support.instances_endpoints',
  compositions: 'nav.support.compositions',
  task: 'nav.support.task',
  overview: 'nav.support.overview',
  'ms-cat-registry': 'nav.support.ms_cat_registry',
  'ms-registry': 'nav.support.ms_registry',
  'ms-cat-validation-presets': 'nav.support.ms_cat_validation_presets',
  'ms-validation-presets': 'nav.support.ms_validation_presets',
  'ms-param-presets': 'nav.support.ms_param_presets',
  'ms-cat-ft': 'nav.support.ms_cat_ft',
  'ms-ft-configs': 'nav.support.ms_ft_configs',
  'ms-ft-scripts': 'nav.support.ms_ft_scripts',
  'ms-ft-presets': 'nav.support.ms_ft_presets',
  'ms-cat-training': 'nav.support.ms_cat_training',
  'ms-training-jobs': 'nav.support.ms_training_jobs',
  'ms-cat-artifacts': 'nav.support.ms_cat_artifacts',
  'ms-pretrained-registry': 'nav.support.ms_pretrained_registry',
  'ms-pretrained-artifacts': 'nav.support.ms_pretrained_artifacts',
  'sim-assets': 'nav.support.sim_assets',
  'sim-configurations': 'nav.support.sim_configurations',
  'sim-presets': 'nav.support.sim_presets',
  'sim-scenes': 'nav.support.sim_scenes',
  'augmentation-setup': 'nav.support.augmentation_setup',
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
