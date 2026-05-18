/** Support portal URL segments and validation (under `/support`). */

export const SUPPORT_HOME_PATH = '/support/home';

/** Active robot-support LNB segment keys (URL `.../ws/{key}`). */
export const ROBOT_LNB_KEYS = ['definition-robot', 'definition-devices', 'compositions', 'task', 'instances-endpoints'] as const;

export const MODEL_SUPPORT_LNB_KEYS = [
  'ms-registry',
  'ms-validation-presets',
  'ms-param-presets',
  'ms-ft-configs',
  'ms-ft-scripts',
  'ms-ft-presets',
  'ms-training-jobs',
  'ms-pretrained-registry',
  'ms-pretrained-artifacts',
] as const;

export const SIMULATION_SUPPORT_LNB_KEYS = [
  'sim-assets',
  'sim-configurations',
  'sim-presets',
  'sim-scenes',
] as const;

const ROBOT_SET = new Set<string>(ROBOT_LNB_KEYS);
const MODEL_SET = new Set<string>(MODEL_SUPPORT_LNB_KEYS);
const SIM_SET = new Set<string>(SIMULATION_SUPPORT_LNB_KEYS);

/** Legacy URL segments → current `ROBOT_LNB_KEYS` value. */
export function normalizeRobotLnbKey(raw: string): string {
  if (raw === 'definition-models') return 'definition-robot';
  if (raw === 'connections-endpoints' || raw === 'connections-status') return 'instances-endpoints';
  return raw;
}

/** LNB keys that support `/detail/{entityId}` under robot-support workspace. */
const ROBOT_DETAIL_LNB = new Set<string>(['definition-robot', 'definition-devices', 'compositions', 'task', 'instances-endpoints']);

const SIM_ROUTE_EMPTY = {
  simAssetDetailId: null as string | null,
  simConfigDetailId: null as string | null,
  simPresetDetailId: null as string | null,
  simSceneDetailId: null as string | null,
  simSceneEditorId: null as string | null,
  simSceneAutoCompose: false,
};

export type SupportGnbKey = 'home' | 'robot-support' | 'model-support' | 'simulation-support';

/** Dispatched on `support-drill-action` from `PortalDrillInGnb` (toolbar). */
export type SupportDrillToolbarAction = 'edit' | 'delete' | 'preview' | 'run' | 'apply' | 'duplicate';

/** Which toolbar buttons the drill-in GNB shows for the current Support route. */
export type SupportPortalDrillActionSet =
  | 'none'
  | 'robot'
  | 'sim-asset'
  | 'sim-scene'
  | 'sim-config'
  | 'sim-preset';

export function supportPortalDrillInActionSet(s: SupportPathState): SupportPortalDrillActionSet {
  if (s.supportWorkspaceDataRegister) return 'none';
  if (s.supportWorkspaceCreate) return 'none';
  if (s.supportEditEntityId) return 'none';
  if (s.supportDetailEntityId) return 'robot';
  if (s.simAssetDetailId) return 'sim-asset';
  if (s.simSceneDetailId) return 'sim-scene';
  if (s.simConfigDetailId) return 'sim-config';
  if (s.simPresetDetailId) return 'sim-preset';
  return 'none';
}

export interface SupportPathState {
  gnbKey: SupportGnbKey;
  /** `true` for Robot / Model / Simulation Support (LNB visible). Home only is `false`. */
  inProject: boolean;
  lnbKey: string;
  /** `/support/robot-support/ws/{lnb}/detail/{id}` — only for detail-capable robot LNB keys. */
  supportDetailEntityId: string | null;
  /** `/support/robot-support/ws/{lnb}/edit/{id}` — settings editor (same LNB scope as detail). */
  supportEditEntityId: string | null;
  /** `/support/robot-support/ws/{lnb}/create` or `/support/simulation-support/ws/{lnb}/create` — full-page create wizard. */
  supportWorkspaceCreate: boolean;
  /** `/support/robot-support/ws/definition-robot/register` — Data Register job (DV-DF-RG-001) from Robot Models. */
  supportWorkspaceDataRegister: boolean;
  /** `/support/simulation-support/ws/sim-assets/detail/{id}` */
  simAssetDetailId: string | null;
  /** `/support/simulation-support/ws/sim-configurations/detail/{id}` */
  simConfigDetailId: string | null;
  /** `/support/simulation-support/ws/sim-presets/detail/{id}` */
  simPresetDetailId: string | null;
  /** `/support/simulation-support/ws/sim-scenes/detail/{id}` */
  simSceneDetailId: string | null;
  /** `/support/simulation-support/ws/sim-scenes/editor/{id}` */
  simSceneEditorId: string | null;
  /** `/support/simulation-support/ws/sim-scenes/auto-compose` */
  simSceneAutoCompose: boolean;
}

const DEFAULT_ROBOT_LNB = 'definition-robot';
const DEFAULT_MODEL_LNB = 'ms-registry';
const DEFAULT_SIM_LNB = 'sim-assets';

export function parseSupportPath(pathname: string): SupportPathState {
  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] !== 'support') {
    return {
      gnbKey: 'home',
      inProject: false,
      lnbKey: DEFAULT_ROBOT_LNB,
      supportDetailEntityId: null,
      supportEditEntityId: null,
      supportWorkspaceCreate: false,
      supportWorkspaceDataRegister: false,
      ...SIM_ROUTE_EMPTY,
    };
  }

  if (segments.length === 1) {
    return {
      gnbKey: 'home',
      inProject: false,
      lnbKey: DEFAULT_ROBOT_LNB,
      supportDetailEntityId: null,
      supportEditEntityId: null,
      supportWorkspaceCreate: false,
      supportWorkspaceDataRegister: false,
      ...SIM_ROUTE_EMPTY,
    };
  }

  const section = segments[1];
  if (section === 'home') {
    return {
      gnbKey: 'home',
      inProject: false,
      lnbKey: DEFAULT_ROBOT_LNB,
      supportDetailEntityId: null,
      supportEditEntityId: null,
      supportWorkspaceCreate: false,
      supportWorkspaceDataRegister: false,
      ...SIM_ROUTE_EMPTY,
    };
  }

  if (section === 'robot-support') {
    let lnbKey = DEFAULT_ROBOT_LNB;
    let supportDetailEntityId: string | null = null;
    let supportEditEntityId: string | null = null;
    let supportWorkspaceCreate = false;
    let supportWorkspaceDataRegister = false;
    if (segments[2] === 'ws' && segments[3]) {
      const raw = segments[3];
      const normalized = normalizeRobotLnbKey(raw);
      lnbKey = ROBOT_SET.has(normalized) ? normalized : DEFAULT_ROBOT_LNB;
      if (ROBOT_DETAIL_LNB.has(lnbKey) && segments[4] === 'edit' && segments[5]) {
        supportEditEntityId = decodeURIComponent(segments[5]);
      } else if (ROBOT_DETAIL_LNB.has(lnbKey) && segments[4] === 'detail' && segments[5]) {
        supportDetailEntityId = decodeURIComponent(segments[5]);
      } else if (ROBOT_DETAIL_LNB.has(lnbKey) && segments[4] === 'create' && !segments[5]) {
        supportWorkspaceCreate = true;
      } else if (lnbKey === 'definition-robot' && segments[4] === 'register' && !segments[5]) {
        supportWorkspaceDataRegister = true;
      }
    }
    return {
      gnbKey: 'robot-support',
      inProject: true,
      lnbKey,
      ...SIM_ROUTE_EMPTY,
      supportDetailEntityId,
      supportEditEntityId,
      supportWorkspaceCreate,
      supportWorkspaceDataRegister,
    };
  }

  if (section === 'model-support') {
    let lnbKey = DEFAULT_MODEL_LNB;
    if (segments[2] === 'ws' && segments[3]) {
      const raw = segments[3];
      lnbKey = MODEL_SET.has(raw) ? raw : DEFAULT_MODEL_LNB;
    }
    return {
      gnbKey: 'model-support',
      inProject: true,
      lnbKey,
      supportDetailEntityId: null,
      supportEditEntityId: null,
      supportWorkspaceCreate: false,
      supportWorkspaceDataRegister: false,
      ...SIM_ROUTE_EMPTY,
    };
  }

  if (section === 'simulation-support') {
    const SIM_CREATE_LNB = new Set<string>(['sim-assets', 'sim-configurations', 'sim-presets', 'sim-scenes']);
    let lnbKey = DEFAULT_SIM_LNB;
    let simAssetDetailId: string | null = null;
    let simConfigDetailId: string | null = null;
    let simPresetDetailId: string | null = null;
    let simSceneDetailId: string | null = null;
    let simSceneEditorId: string | null = null;
    let simSceneAutoCompose = false;
    let supportWorkspaceCreate = false;
    if (segments[2] === 'ws' && segments[3]) {
      const raw = segments[3];
      if (raw === 'scenarios') {
        lnbKey = 'sim-scenes';
      } else if (raw === 'dashboard') {
        lnbKey = 'sim-assets';
      } else {
        lnbKey = SIM_SET.has(raw) ? raw : DEFAULT_SIM_LNB;
      }
      if (lnbKey === 'sim-assets' && segments[4] === 'detail' && segments[5]) {
        simAssetDetailId = decodeURIComponent(segments[5]);
      }
      if (lnbKey === 'sim-configurations' && segments[4] === 'detail' && segments[5]) {
        simConfigDetailId = decodeURIComponent(segments[5]);
      }
      if (lnbKey === 'sim-presets' && segments[4] === 'detail' && segments[5]) {
        simPresetDetailId = decodeURIComponent(segments[5]);
      }
      if (lnbKey === 'sim-scenes') {
        if (segments[4] === 'detail' && segments[5]) {
          simSceneDetailId = decodeURIComponent(segments[5]);
        } else if (segments[4] === 'editor' && segments[5]) {
          simSceneEditorId = decodeURIComponent(segments[5]);
        } else if (segments[4] === 'auto-compose') {
          simSceneAutoCompose = true;
        }
      }
      if (SIM_CREATE_LNB.has(lnbKey) && segments[4] === 'create' && !segments[5]) {
        supportWorkspaceCreate = true;
      }
    }
    return {
      gnbKey: 'simulation-support',
      inProject: true,
      lnbKey,
      supportDetailEntityId: null,
      supportEditEntityId: null,
      supportWorkspaceCreate,
      supportWorkspaceDataRegister: false,
      simAssetDetailId,
      simConfigDetailId,
      simPresetDetailId,
      simSceneDetailId,
      simSceneEditorId,
      simSceneAutoCompose,
    };
  }

  return {
    gnbKey: 'home',
    inProject: false,
    lnbKey: DEFAULT_ROBOT_LNB,
    supportDetailEntityId: null,
    supportEditEntityId: null,
    supportWorkspaceCreate: false,
    supportWorkspaceDataRegister: false,
    ...SIM_ROUTE_EMPTY,
  };
}

export function supportWorkspacePath(gnbKey: Exclude<SupportGnbKey, 'home'>, lnbKey: string): string {
  const key = gnbKey === 'robot-support' ? normalizeRobotLnbKey(lnbKey) : lnbKey;
  return `/support/${gnbKey}/ws/${key}`;
}

/**
 * **Workspace drill-in**: 카드/목록에서 한 단계 들어간 Support 전용 화면.
 * Dev Data Foundry register와 같은 포커스 레이아웃 — `PortalDrillInGnb` + LNB 숨김 + `domain-portal-drill-in-shell`.
 */
export function isSupportWorkspaceDrillIn(pathState: SupportPathState | null): boolean {
  if (!pathState?.inProject) return false;
  return Boolean(
    pathState.supportWorkspaceCreate ||
      pathState.supportWorkspaceDataRegister ||
      pathState.supportDetailEntityId ||
      pathState.supportEditEntityId ||
      pathState.simAssetDetailId ||
      pathState.simConfigDetailId ||
      pathState.simPresetDetailId ||
      pathState.simSceneDetailId ||
      pathState.simSceneEditorId ||
      pathState.simSceneAutoCompose,
  );
}

/** List/workspace URL for the active support drill-in route. */
export function supportDrillInListHref(s: SupportPathState): string {
  if (!s.inProject) return SUPPORT_HOME_PATH;
  if (s.supportWorkspaceDataRegister) {
    return '/support/robot-support/ws/definition-robot';
  }
  if (s.supportWorkspaceCreate) {
    if (s.gnbKey === 'robot-support') {
      const lnb = normalizeRobotLnbKey(s.lnbKey);
      return `/support/robot-support/ws/${encodeURIComponent(lnb)}`;
    }
    if (s.gnbKey === 'simulation-support') {
      return `/support/simulation-support/ws/${encodeURIComponent(s.lnbKey)}`;
    }
  }
  if (s.supportDetailEntityId || s.supportEditEntityId) {
    const lnb = s.gnbKey === 'robot-support' ? normalizeRobotLnbKey(s.lnbKey) : s.lnbKey;
    return `/support/${s.gnbKey}/ws/${encodeURIComponent(lnb)}`;
  }
  if (s.simAssetDetailId) return '/support/simulation-support/ws/sim-assets';
  if (s.simConfigDetailId) return '/support/simulation-support/ws/sim-configurations';
  if (s.simPresetDetailId) return '/support/simulation-support/ws/sim-presets';
  if (s.simSceneDetailId || s.simSceneEditorId || s.simSceneAutoCompose) return '/support/simulation-support/ws/sim-scenes';
  return SUPPORT_HOME_PATH;
}

/** i18n key for the centered detail screen title in `PortalDrillInGnb`. */
export function supportDrillInChromeTitleKey(s: SupportPathState): string {
  if (s.supportEditEntityId) {
    return 'support.detail.chrome.editSettings';
  }
  if (s.supportWorkspaceDataRegister) {
    return 'dataRegister.pageTitle';
  }
  if (s.supportWorkspaceCreate && s.gnbKey === 'robot-support') {
    const lnb = normalizeRobotLnbKey(s.lnbKey);
    const m: Record<string, string> = {
      'definition-robot': 'support.detail.chrome.createDefinitionModel',
      'definition-devices': 'support.detail.chrome.createDefinitionDevice',
      compositions: 'support.detail.chrome.createComposition',
      task: 'support.detail.chrome.createTaskType',
      'instances-endpoints': 'support.detail.chrome.createEndpoint',
    };
    return m[lnb] ?? 'support.detail.chrome.default';
  }
  if (s.supportWorkspaceCreate && s.gnbKey === 'simulation-support') {
    const m: Record<string, string> = {
      'sim-assets': 'support.detail.chrome.createSimAsset',
      'sim-configurations': 'support.detail.chrome.createSimConfiguration',
      'sim-presets': 'support.detail.chrome.createSimPreset',
      'sim-scenes': 'support.detail.chrome.createSimScene',
    };
    return m[s.lnbKey] ?? 'support.detail.chrome.default';
  }
  if (s.supportDetailEntityId) {
    const lnb = normalizeRobotLnbKey(s.lnbKey);
    const m: Record<string, string> = {
      'definition-robot': 'support.detail.chrome.definitionModel',
      'definition-devices': 'support.detail.chrome.definitionDevice',
      compositions: 'support.detail.chrome.composition',
      task: 'support.detail.chrome.task',
      'instances-endpoints': 'support.detail.chrome.endpointInstance',
    };
    return m[lnb] ?? 'support.detail.chrome.default';
  }
  if (s.simAssetDetailId) return 'support.detail.chrome.simAsset';
  if (s.simConfigDetailId) return 'support.detail.chrome.simConfiguration';
  if (s.simPresetDetailId) return 'support.detail.chrome.simPreset';
  if (s.simSceneDetailId) return 'support.detail.chrome.simScene';
  if (s.simSceneEditorId) return 'support.detail.chrome.simSceneEditor';
  if (s.simSceneAutoCompose) return 'support.detail.chrome.simSceneAutoCompose';
  return 'support.detail.chrome.default';
}

/** Robot support — full-page create wizard (same LNB as list). */
export function supportRobotWorkspaceCreatePath(lnbKey: string): string {
  const key = normalizeRobotLnbKey(lnbKey);
  return `/support/robot-support/ws/${encodeURIComponent(key)}/create`;
}

/** Robot models list — Data Register job (DV-DF-RG-001), same chrome as Dev Data Foundry register. */
export function supportRobotWorkspaceDataRegisterPath(): string {
  return '/support/robot-support/ws/definition-robot/register';
}

/** Simulation support — full-page create wizard under the active simulation LNB. */
export function supportSimulationWorkspaceCreatePath(lnbKey: string): string {
  return `/support/simulation-support/ws/${encodeURIComponent(lnbKey)}/create`;
}

/** Robot support asset detail: keeps LNB context for back navigation and menu highlight. */
export function supportRobotWorkspaceDetailPath(lnbKey: string, entityId: string): string {
  const key = normalizeRobotLnbKey(lnbKey);
  return `/support/robot-support/ws/${key}/detail/${encodeURIComponent(entityId)}`;
}

/** Robot support — full-page settings editor (same LNB as list/detail). */
export function supportRobotWorkspaceEditPath(lnbKey: string, entityId: string): string {
  const key = normalizeRobotLnbKey(lnbKey);
  return `/support/robot-support/ws/${key}/edit/${encodeURIComponent(entityId)}`;
}

/** Simulation asset detail (drill-down from Assets). */
export function supportSimulationAssetDetailPath(assetId: string): string {
  return `/support/simulation-support/ws/sim-assets/detail/${encodeURIComponent(assetId)}`;
}

export function supportSimulationConfigDetailPath(configId: string): string {
  return `/support/simulation-support/ws/sim-configurations/detail/${encodeURIComponent(configId)}`;
}

export function supportSimulationPresetDetailPath(presetId: string): string {
  return `/support/simulation-support/ws/sim-presets/detail/${encodeURIComponent(presetId)}`;
}

/** Scene read-only / actions detail (from Scenes list). */
export function supportSimulationSceneDetailPath(sceneId: string): string {
  return `/support/simulation-support/ws/sim-scenes/detail/${encodeURIComponent(sceneId)}`;
}

/** Scene editor (full workspace under Scenes). */
export function supportSimulationSceneEditorPath(sceneId: string): string {
  return `/support/simulation-support/ws/sim-scenes/editor/${encodeURIComponent(sceneId)}`;
}

/** AI auto-compose flow (under Scenes). */
export const SUPPORT_SIM_SCENE_AUTO_COMPOSE_PATH = '/support/simulation-support/ws/sim-scenes/auto-compose';

export function defaultWorkspacePathForGnb(gnbKey: Exclude<SupportGnbKey, 'home'>): string {
  switch (gnbKey) {
    case 'robot-support':
      return supportWorkspacePath('robot-support', DEFAULT_ROBOT_LNB);
    case 'model-support':
      return supportWorkspacePath('model-support', DEFAULT_MODEL_LNB);
    case 'simulation-support':
      return supportWorkspacePath('simulation-support', DEFAULT_SIM_LNB);
    default:
      return supportWorkspacePath('robot-support', DEFAULT_ROBOT_LNB);
  }
}
