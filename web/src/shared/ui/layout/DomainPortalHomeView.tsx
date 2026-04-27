import { useMemo, type MutableRefObject, type ReactNode } from 'react';
import {
  ApiOutlined,
  ApartmentOutlined,
  BlockOutlined,
  CarryOutOutlined,
  CheckSquareOutlined,
  CloudServerOutlined,
  ControlOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  ExperimentOutlined,
  FileProtectOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  HddOutlined,
  RightOutlined,
  RobotOutlined,
  SettingOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu, Tag, Typography, theme } from 'antd';
import type { MenuProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import type { DomainKey, DomainNavigationConfig } from '../../config/domainNavigation';
import { DevDataFoundryJobPlaceholder } from '../../../pages/dev/DevDataFoundryJobPlaceholder';
import { DevDataFoundryPage } from '../../../pages/dev/DevDataFoundryPage';
import { DevDataRegisterPage, type DataRegisterWizardApi } from '../../../pages/dev/DevDataRegisterPage';
import { DevGenerateSubtypePage } from '../../../pages/dev/DevGenerateSubtypePage';
import { DevMimicAugmentationPage, type MimicAugmentationWizardApi } from '../../../pages/dev/DevMimicAugmentationPage';
import { DevModelInstitutePage } from '../../../pages/dev/DevModelInstitutePage';
import { DevPortalHomePage } from '../../../pages/dev/DevPortalHomePage';
import { DevProjectDashboardPage } from '../../../pages/dev/DevProjectDashboardPage';
import { SupportWorkspaceOutlet } from '../../../pages/support/SupportWorkspaceOutlet';
import { useLocale } from '../../i18n/LocaleProvider';
import { localizeMenuItems } from '../../i18n/localizeMenu';
import { useDescriptionScreen } from '../common/DescriptionModeProvider';
import type { DataFoundryJob } from './dataFoundryJobTypes';

const { Content } = Layout;

const lnbLeadingIconClass = 'domain-lnb-menu-leading-icon';

function lnbIcon(node: ReactNode): ReactNode {
  return <span className={lnbLeadingIconClass}>{node}</span>;
}

/** 1-depth LNB rows only: leading icon by menu key (no chevrons on nested items). */
const LNB_TOP_LEVEL_ICONS: Record<string, ReactNode> = {
  dashboard: lnbIcon(<DashboardOutlined aria-hidden />),
  workspace: lnbIcon(<FolderOpenOutlined aria-hidden />),
  settings: lnbIcon(<SettingOutlined aria-hidden />),
  'my-task': lnbIcon(<CheckSquareOutlined aria-hidden />),
  'robot-ops': lnbIcon(<RobotOutlined aria-hidden />),
  'work-orders': lnbIcon(<FileTextOutlined aria-hidden />),
  'sim-lab': lnbIcon(<ExperimentOutlined aria-hidden />),
  'robot-assets': lnbIcon(<DatabaseOutlined aria-hidden />),
  'user-role': lnbIcon(<TeamOutlined aria-hidden />),
  infra: lnbIcon(<CloudServerOutlined aria-hidden />),
  definition: lnbIcon(<ApartmentOutlined aria-hidden />),
  compositions: lnbIcon(<BlockOutlined aria-hidden />),
  task: lnbIcon(<CarryOutOutlined aria-hidden />),
  connections: lnbIcon(<ApiOutlined aria-hidden />),
  overview: lnbIcon(<DashboardOutlined aria-hidden />),
  'ms-cat-registry': lnbIcon(<ExperimentOutlined aria-hidden />),
  'ms-cat-validation-presets': lnbIcon(<ControlOutlined aria-hidden />),
  'ms-cat-ft': lnbIcon(<ApiOutlined aria-hidden />),
  'ms-cat-training': lnbIcon(<CarryOutOutlined aria-hidden />),
  'ms-cat-artifacts': lnbIcon(<DatabaseOutlined aria-hidden />),
  'sim-assets': lnbIcon(<HddOutlined aria-hidden />),
  'sim-configurations': lnbIcon(<ControlOutlined aria-hidden />),
  'sim-presets': lnbIcon(<FileProtectOutlined aria-hidden />),
  'sim-scenes': lnbIcon(<BlockOutlined aria-hidden />),
};

function decorateLnbMenuItems(items: MenuProps['items'], depth = 0): MenuProps['items'] {
  if (!items) return items;
  return items.map((item) => {
    if (!item || typeof item !== 'object' || !('key' in item)) {
      return item;
    }
    if ('type' in item && item.type === 'divider') {
      return item;
    }
    const key = String((item as { key: string | number }).key);
    if ('children' in item && item.children) {
      return {
        ...item,
        icon: depth === 0 ? (LNB_TOP_LEVEL_ICONS[key] ?? undefined) : undefined,
        children: decorateLnbMenuItems(item.children as MenuProps['items'], depth + 1),
      };
    }
    return {
      ...item,
      icon: depth === 0 ? (LNB_TOP_LEVEL_ICONS[key] ?? undefined) : undefined,
    };
  }) as MenuProps['items'];
}

interface GenericDomainHomePlaceholderProps {
  domain: DomainKey;
  showLnb: boolean;
  selectedLnbKey: string;
}

/** 한글 화면 설명만 등록 (언어 전환과 무관). */
const DOMAIN_DESC_KO: Record<DomainKey, string> = {
  customer: '고객',
  dev: '개발',
  support: '지원',
  admin: '관리',
};

/** Default home placeholder + Description (single registration) for non–Dev-portfolio views. */
function GenericDomainHomePlaceholder({ domain, showLnb, selectedLnbKey }: GenericDomainHomePlaceholderProps) {
  const navigate = useNavigate();
  const { t } = useLocale();

  const domainCodeMap: Record<DomainKey, string> = {
    customer: 'CS',
    dev: 'DV',
    support: 'SP',
    admin: 'AD',
  };

  const homeDescription = useMemo(
    () => ({
      screenName: `${DOMAIN_DESC_KO[domain]} 홈`,
      screenId: `${domainCodeMap[domain]}-HM-MN-001`,
      screenDescription: `${DOMAIN_DESC_KO[domain]} 포탈의 기본 홈(프로젝트 미선택 또는 워크스페이스 외 구역)입니다.`,
      areas: [
        {
          id: 'home-summary',
          name: '홈 요약',
          role: '현재 포탈·섹션 제목과 안내 문구를 표시',
          userAction: '화면 목적과 위치를 확인',
          linkedScreen: '도메인 기능 화면',
        },
        {
          id: 'home-action',
          name: '홈 액션',
          role: '로그인 등 보조 이동을 제공',
          userAction: 'Back to Login 버튼 선택',
          linkedScreen: '로그인',
        },
      ],
    }),
    [domain],
  );

  const { bindArea } = useDescriptionScreen(homeDescription);

  return (
    <>
      <div className="domain-1depth-page-header" {...bindArea('home-summary')}>
        <Typography.Title level={2} className="domain-1depth-page-title domain-content-title">
          {showLnb
            ? `${t(`domain.${domain}`)} ${t('nav.project')}`
            : `${t(`domain.${domain}`)} ${t('nav.home')}`}
        </Typography.Title>
        <Typography.Paragraph type="secondary" className="domain-1depth-page-lead">
          {showLnb ? `${t('generic.sectionPrefix')}${selectedLnbKey}` : t('generic.content')}
        </Typography.Paragraph>
      </div>
      <div className="domain-content-action" {...bindArea('home-action')}>
        <Button onClick={() => navigate('/login')}>{t('generic.backLogin')}</Button>
      </div>
    </>
  );
}

export interface DomainPortalHomeViewProps {
  domain: DomainKey;
  nav: DomainNavigationConfig;
  showLnb: boolean;
  mode: 'light' | 'dark';
  selectedLnbKey: string;
  onSelectLnbKey: (key: string) => void;
  onOpenProjectMenu: () => void;
  /** Active Data Foundry job (GNB shows title + steps). */
  dataFoundryJob?: DataFoundryJob;
  onEnterDataRegister?: () => void;
  onEnterDataGenerate?: () => void;
  onEnterDataCollect?: () => void;
  onEnterDataCurate?: () => void;
  onOpenMimicAugmentation?: () => void;
  onMimicProgressChange?: (percent: number) => void;
  registerWizardApiRef?: MutableRefObject<DataRegisterWizardApi | null>;
  mimicWizardApiRef?: MutableRefObject<MimicAugmentationWizardApi | null>;
  /** Submenu open state for LNB (Support Robot Definition/Connectivity, Dev Workspace, …). */
  lnbDefaultOpenKeys?: string[];
  /** Active Support GNB section when `domain === 'support'` (for workspace body + LNB indent). */
  activeSupportGnbKey?: string;
  /** Robot support routable detail (`/support/robot-support/ws/.../detail/...`). */
  supportDetailEntityId?: string | null;
  simAssetDetailId?: string | null;
  simConfigDetailId?: string | null;
  simPresetDetailId?: string | null;
  simSceneDetailId?: string | null;
  simSceneEditorId?: string | null;
  simSceneAutoCompose?: boolean;
  /** Support card→detail: LNB hidden, `PortalDrillInGnb` + `domain-portal-drill-in-shell` (Data Foundry register rhythm). */
  supportWorkspaceDrillIn?: boolean;
}

export function DomainPortalHomeView({
  domain,
  nav,
  showLnb,
  mode,
  selectedLnbKey,
  onSelectLnbKey,
  onOpenProjectMenu,
  dataFoundryJob = null,
  onEnterDataRegister,
  onEnterDataGenerate,
  onEnterDataCollect,
  onEnterDataCurate,
  onOpenMimicAugmentation,
  onMimicProgressChange,
  registerWizardApiRef,
  mimicWizardApiRef,
  lnbDefaultOpenKeys = [],
  activeSupportGnbKey,
  supportDetailEntityId = null,
  simAssetDetailId = null,
  simConfigDetailId = null,
  simPresetDetailId = null,
  simSceneDetailId = null,
  simSceneEditorId = null,
  simSceneAutoCompose = false,
  supportWorkspaceDrillIn = false,
}: DomainPortalHomeViewProps) {
  const { token } = theme.useToken();
  const { t, locale } = useLocale();

  const lnbMenuItems = useMemo(() => {
    const localized = localizeMenuItems(nav.lnbItems ?? [], t);
    return decorateLnbMenuItems(localized);
  }, [nav.lnbItems, t, locale]);

  const lnbInlineIndent =
    domain === 'support' && activeSupportGnbKey === 'robot-support' ? 20 : 0;

  /** Dev (and other portals): project picker + menu + profile. Support: menu-only rail. */
  const showLnbProjectChrome = domain !== 'support';

  return (
    <Content className="domain-content" style={{ background: token.colorBgLayout }}>
      {domain === 'dev' && !showLnb ? (
        <div className="domain-1depth-inner">
          <DevPortalHomePage onOpenProjectMenu={onOpenProjectMenu} />
        </div>
      ) : showLnb ? (
        dataFoundryJob === 'register' && domain === 'dev' && selectedLnbKey === 'data-foundry' && registerWizardApiRef ? (
          <div className="domain-1depth-inner">
            <DevDataRegisterPage wizardApiRef={registerWizardApiRef} />
          </div>
        ) : dataFoundryJob === 'mimic-augmentation' &&
          domain === 'dev' &&
          selectedLnbKey === 'data-foundry' &&
          mimicWizardApiRef ? (
          <div className="domain-1depth-inner">
            <DevMimicAugmentationPage
              wizardApiRef={mimicWizardApiRef}
              onProgressChange={onMimicProgressChange}
            />
          </div>
        ) : dataFoundryJob === 'collect' && domain === 'dev' && selectedLnbKey === 'data-foundry' ? (
          <div className="domain-1depth-inner">
            <DevDataFoundryJobPlaceholder kind="collect" />
          </div>
        ) : dataFoundryJob === 'curate' && domain === 'dev' && selectedLnbKey === 'data-foundry' ? (
          <div className="domain-1depth-inner">
            <DevDataFoundryJobPlaceholder kind="curate" />
          </div>
        ) : domain === 'support' && supportWorkspaceDrillIn && activeSupportGnbKey ? (
          <div className="domain-1depth-inner">
            <div className="domain-portal-drill-in-shell">
              <SupportWorkspaceOutlet
                activeGnbKey={activeSupportGnbKey}
                lnbKey={selectedLnbKey}
                supportDetailEntityId={supportDetailEntityId}
                simAssetDetailId={simAssetDetailId}
                simConfigDetailId={simConfigDetailId}
                simPresetDetailId={simPresetDetailId}
                simSceneDetailId={simSceneDetailId}
                simSceneEditorId={simSceneEditorId}
                simSceneAutoCompose={simSceneAutoCompose}
                embedDrillChrome
              />
            </div>
          </div>
        ) : (
          <div className="domain-2depth-inner">
            <aside
              className={`domain-lnb-card ${showLnbProjectChrome ? '' : 'domain-lnb-card--menu-only'}`}
              aria-label={showLnbProjectChrome ? t('nav.project') : t('lnb.ariaMenu')}
            >
              {showLnbProjectChrome ? (
                <>
                  <div className="domain-lnb-top">
                    <button type="button" className="domain-lnb-project-box">
                      <span className="domain-lnb-project-box-text">{t('lnb.projectSampleName')}</span>
                      <RightOutlined className="domain-lnb-project-box-icon" aria-hidden />
                    </button>
                  </div>
                  <div className="domain-lnb-divider" aria-hidden />
                </>
              ) : null}
              <div className="domain-lnb-menu-wrap">
                <Menu
                  mode="inline"
                  inlineIndent={lnbInlineIndent}
                  items={lnbMenuItems}
                  selectedKeys={[selectedLnbKey]}
                  defaultOpenKeys={lnbDefaultOpenKeys}
                  theme={mode}
                  className="domain-lnb-menu-card"
                  style={{ background: 'transparent', border: 'none' }}
                  onClick={({ key }) => onSelectLnbKey(String(key))}
                />
              </div>
              {showLnbProjectChrome ? (
                <div className="domain-lnb-profile-block">
                  <Typography.Text className="domain-lnb-profile-name">{t('lnb.profileNameSample')}</Typography.Text>
                  <Tag className="domain-lnb-role-tag" bordered={false}>
                    {t('lnb.roleProjectOwner')}
                  </Tag>
                  <Button type="default" block className="domain-lnb-edit-profile">
                    {t('lnb.editProfile')}
                  </Button>
                </div>
              ) : null}
            </aside>
            <div className="domain-2depth-main">
              {domain === 'dev' && selectedLnbKey === 'dashboard' ? (
                <DevProjectDashboardPage />
              ) : domain === 'dev' && selectedLnbKey === 'data-foundry' ? (
                dataFoundryJob === 'generate-pick' ? (
                  <DevGenerateSubtypePage onSelectMimicAugmentation={() => onOpenMimicAugmentation?.()} />
                ) : (
                  <DevDataFoundryPage
                    onOpenRegister={onEnterDataRegister}
                    onOpenGenerate={onEnterDataGenerate}
                    onOpenCollect={onEnterDataCollect}
                    onOpenCurate={onEnterDataCurate}
                  />
                )
              ) : domain === 'dev' && selectedLnbKey === 'model-institute' ? (
                <DevModelInstitutePage />
              ) : domain === 'support' &&
                activeSupportGnbKey &&
                ['robot-support', 'model-support', 'simulation-support'].includes(activeSupportGnbKey) ? (
                <SupportWorkspaceOutlet
                  activeGnbKey={activeSupportGnbKey}
                  lnbKey={selectedLnbKey}
                  supportDetailEntityId={supportDetailEntityId}
                  simAssetDetailId={simAssetDetailId}
                  simConfigDetailId={simConfigDetailId}
                  simPresetDetailId={simPresetDetailId}
                  simSceneDetailId={simSceneDetailId}
                  simSceneEditorId={simSceneEditorId}
                  simSceneAutoCompose={simSceneAutoCompose}
                />
              ) : (
                <GenericDomainHomePlaceholder domain={domain} showLnb={showLnb} selectedLnbKey={selectedLnbKey} />
              )}
            </div>
          </div>
        )
      ) : (
        <div className="domain-1depth-inner">
          <GenericDomainHomePlaceholder domain={domain} showLnb={showLnb} selectedLnbKey={selectedLnbKey} />
        </div>
      )}
    </Content>
  );
}
