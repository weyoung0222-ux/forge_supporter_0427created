/** Support portal URL segments and validation (under `/support`). */

export const SUPPORT_HOME_PATH = '/support/home';

export const ROBOT_LNB_KEYS = [
  'definition-models',
  'definition-devices',
  'compositions',
  'task',
  'connections-endpoints',
  'connections-status',
] as const;

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

/** LNB keys that support `/detail/{entityId}` under robot-support workspace. */
const ROBOT_DETAIL_LNB = new Set<string>([
  'definition-models',
  'definition-devices',
  'compositions',
  'task',
  'connections-endpoints',
]);

const SIM_ROUTE_EMPTY = {
  simAssetDetailId: null as string | null,
  simConfigDetailId: null as string | null,
  simPresetDetailId: null as string | null,
  simSceneDetailId: null as string | null,
  simSceneEditorId: null as string | null,
  simSceneAutoCompose: false,
};

export type SupportGnbKey = 'home' | 'robot-support' | 'model-support' | 'simulation-support';

export interface SupportPathState {
  gnbKey: SupportGnbKey;
  /** `true` for Robot / Model / Simulation Support (LNB visible). Home only is `false`. */
  inProject: boolean;
  lnbKey: string;
  /** `/support/robot-support/ws/{lnb}/detail/{id}` — only for detail-capable robot LNB keys. */
  supportDetailEntityId: string | null;
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

const DEFAULT_ROBOT_LNB = 'definition-models';
const DEFAULT_MODEL_LNB = 'ms-registry';
const DEFAULT_SIM_LNB = 'sim-assets';

export function parseSupportPath(pathname: string): SupportPathState {
  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] !== 'support') {
    return { gnbKey: 'home', inProject: false, lnbKey: DEFAULT_ROBOT_LNB, supportDetailEntityId: null, ...SIM_ROUTE_EMPTY };
  }

  if (segments.length === 1) {
    return { gnbKey: 'home', inProject: false, lnbKey: DEFAULT_ROBOT_LNB, supportDetailEntityId: null, ...SIM_ROUTE_EMPTY };
  }

  const section = segments[1];
  if (section === 'home') {
    return { gnbKey: 'home', inProject: false, lnbKey: DEFAULT_ROBOT_LNB, supportDetailEntityId: null, ...SIM_ROUTE_EMPTY };
  }

  if (section === 'robot-support') {
    let lnbKey = DEFAULT_ROBOT_LNB;
    let supportDetailEntityId: string | null = null;
    if (segments[2] === 'ws' && segments[3]) {
      const raw = segments[3];
      lnbKey = ROBOT_SET.has(raw) ? raw : DEFAULT_ROBOT_LNB;
      if (ROBOT_DETAIL_LNB.has(lnbKey) && segments[4] === 'detail' && segments[5]) {
        supportDetailEntityId = decodeURIComponent(segments[5]);
      }
    }
    return { gnbKey: 'robot-support', inProject: true, lnbKey, supportDetailEntityId, ...SIM_ROUTE_EMPTY };
  }

  if (section === 'model-support') {
    let lnbKey = DEFAULT_MODEL_LNB;
    if (segments[2] === 'ws' && segments[3]) {
      const raw = segments[3];
      lnbKey = MODEL_SET.has(raw) ? raw : DEFAULT_MODEL_LNB;
    }
    return { gnbKey: 'model-support', inProject: true, lnbKey, supportDetailEntityId: null, ...SIM_ROUTE_EMPTY };
  }

  if (section === 'simulation-support') {
    let lnbKey = DEFAULT_SIM_LNB;
    let simAssetDetailId: string | null = null;
    let simConfigDetailId: string | null = null;
    let simPresetDetailId: string | null = null;
    let simSceneDetailId: string | null = null;
    let simSceneEditorId: string | null = null;
    let simSceneAutoCompose = false;
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
    }
    return {
      gnbKey: 'simulation-support',
      inProject: true,
      lnbKey,
      supportDetailEntityId: null,
      simAssetDetailId,
      simConfigDetailId,
      simPresetDetailId,
      simSceneDetailId,
      simSceneEditorId,
      simSceneAutoCompose,
    };
  }

  return { gnbKey: 'home', inProject: false, lnbKey: DEFAULT_ROBOT_LNB, supportDetailEntityId: null, ...SIM_ROUTE_EMPTY };
}

export function supportWorkspacePath(gnbKey: Exclude<SupportGnbKey, 'home'>, lnbKey: string): string {
  return `/support/${gnbKey}/ws/${lnbKey}`;
}

/**
 * **Workspace drill-in**: 카드/목록에서 한 단계 들어간 Support 전용 화면.
 * Dev Data Foundry register와 같은 포커스 레이아웃 — `PortalDrillInGnb` + LNB 숨김 + `domain-portal-drill-in-shell`.
 */
export function isSupportWorkspaceDrillIn(pathState: SupportPathState | null): boolean {
  if (!pathState?.inProject) return false;
  return Boolean(
    pathState.supportDetailEntityId ||
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
  if (s.supportDetailEntityId) {
    return `/support/${s.gnbKey}/ws/${encodeURIComponent(s.lnbKey)}`;
  }
  if (s.simAssetDetailId) return '/support/simulation-support/ws/sim-assets';
  if (s.simConfigDetailId) return '/support/simulation-support/ws/sim-configurations';
  if (s.simPresetDetailId) return '/support/simulation-support/ws/sim-presets';
  if (s.simSceneDetailId || s.simSceneEditorId || s.simSceneAutoCompose) return '/support/simulation-support/ws/sim-scenes';
  return SUPPORT_HOME_PATH;
}

/** i18n key for the centered detail screen title in `PortalDrillInGnb`. */
export function supportDrillInChromeTitleKey(s: SupportPathState): string {
  if (s.supportDetailEntityId) {
    const m: Record<string, string> = {
      'definition-models': 'support.detail.chrome.definitionModel',
      'definition-devices': 'support.detail.chrome.definitionDevice',
      compositions: 'support.detail.chrome.composition',
      task: 'support.detail.chrome.task',
      'connections-endpoints': 'support.detail.chrome.endpoint',
    };
    return m[s.lnbKey] ?? 'support.detail.chrome.default';
  }
  if (s.simAssetDetailId) return 'support.detail.chrome.simAsset';
  if (s.simConfigDetailId) return 'support.detail.chrome.simConfiguration';
  if (s.simPresetDetailId) return 'support.detail.chrome.simPreset';
  if (s.simSceneDetailId) return 'support.detail.chrome.simScene';
  if (s.simSceneEditorId) return 'support.detail.chrome.simSceneEditor';
  if (s.simSceneAutoCompose) return 'support.detail.chrome.simSceneAutoCompose';
  return 'support.detail.chrome.default';
}

/** Robot support asset detail: keeps LNB context for back navigation and menu highlight. */
export function supportRobotWorkspaceDetailPath(lnbKey: string, entityId: string): string {
  return `/support/robot-support/ws/${lnbKey}/detail/${encodeURIComponent(entityId)}`;
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
