import { useContext, useMemo, useRef, useState } from 'react';
import { DeploymentUnitOutlined } from '@ant-design/icons';
import { Layout, Menu, theme } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { DOMAIN_NAVIGATION, type DomainKey } from '../../config/domainNavigation';
import { defaultWorkspacePathForGnb, isSupportWorkspaceDrillIn, parseSupportPath } from '../../config/supportPaths';
import { ThemeContext } from '../../../app/providers/ThemeProvider';
import { ThemeToggle } from '../common/ThemeToggle';
import { ProjectMenuPage } from '../../../pages/common/ProjectMenuPage';
import type { DataRegisterWizardApi } from '../../../pages/dev/DevDataRegisterPage';
import type { MimicAugmentationWizardApi } from '../../../pages/dev/DevMimicAugmentationPage';
import { DevLibraryPage } from '../../../pages/dev/DevLibraryPage';
import { DataFoundryJobGnb } from './DataFoundryJobGnb';
import type { DataFoundryJob } from './dataFoundryJobTypes';
import { DomainPortalHomeView } from './DomainPortalHomeView';
import { useLocale } from '../../i18n/LocaleProvider';
import { localizeMenuItems } from '../../i18n/localizeMenu';
import { DomainGnbActionIcons } from '../common/DomainGnbActionIcons';
import './domain-home-layout.css';

interface DomainHomeLayoutProps {
  domain: DomainKey;
}

const { Header, Content } = Layout;

export function DomainHomeLayout({ domain }: DomainHomeLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const nav = DOMAIN_NAVIGATION[domain];
  const { t, locale } = useLocale();
  const { mode } = useContext(ThemeContext);
  const { token } = theme.useToken();
  const gnbItems = useMemo(() => localizeMenuItems(nav.gnbItems, t), [nav.gnbItems, t, locale]);
  const supportPath = useMemo(
    () => (domain === 'support' ? parseSupportPath(location.pathname) : null),
    [domain, location.pathname],
  );
  const supportWorkspaceDrillIn = useMemo(
    () => (domain === 'support' ? isSupportWorkspaceDrillIn(supportPath) : false),
    [domain, supportPath],
  );
  const [internalGnb, setInternalGnb] = useState(nav.selectedGnbKey);
  const [isProjectSelected, setIsProjectSelected] = useState(false);
  const [internalLnb, setInternalLnb] = useState(nav.selectedLnbKey);
  const selectedGnbKey =
    domain === 'support' && supportPath ? supportPath.gnbKey : internalGnb;
  const showLnb =
    domain === 'support' && supportPath ? supportPath.inProject : isProjectSelected;
  const selectedLnbKey =
    domain === 'support' && supportPath ? supportPath.lnbKey : internalLnb;
  const [dataFoundryJob, setDataFoundryJob] = useState<DataFoundryJob>(null);
  const [mimicProgress, setMimicProgress] = useState(0);
  const registerWizardApiRef = useRef<DataRegisterWizardApi | null>(null);
  const mimicWizardApiRef = useRef<MimicAugmentationWizardApi | null>(null);
  const isProjectMenu = domain !== 'support' && internalGnb === 'project';
  const isLibraryMenu = domain === 'dev' && internalGnb === 'library';
  const navForView = useMemo(() => {
    if (domain === 'support' && nav.lnbItemsByGnb?.[selectedGnbKey]) {
      return { ...nav, lnbItems: nav.lnbItemsByGnb[selectedGnbKey]! };
    }
    return nav;
  }, [domain, nav, selectedGnbKey]);

  const lnbDefaultOpenKeys = useMemo(() => {
    if (domain === 'support' && selectedGnbKey === 'robot-support') {
      return ['definition', 'connections'];
    }
    if (domain === 'support' && selectedGnbKey === 'model-support') {
      return ['ms-cat-registry', 'ms-cat-param-presets', 'ms-cat-ft', 'ms-cat-training', 'ms-cat-pretrained'];
    }
    if (domain === 'dev') {
      return ['workspace'];
    }
    return [];
  }, [domain, selectedGnbKey]);

  const showDataFoundryJobGnb =
    dataFoundryJob !== null && domain === 'dev' && showLnb && selectedLnbKey === 'data-foundry';

  const exitDataFoundryJob = () => {
    setDataFoundryJob(null);
    setMimicProgress(0);
    registerWizardApiRef.current = null;
    mimicWizardApiRef.current = null;
  };

  const handleSelectLnbKey = (key: string) => {
    exitDataFoundryJob();
    if (domain === 'support' && selectedGnbKey !== 'home') {
      navigate(`/support/${selectedGnbKey}/ws/${key}`);
      return;
    }
    setInternalLnb(key);
  };

  return (
    <Layout
      className={`domain-layout ${showDataFoundryJobGnb ? 'domain-layout--workspace-job' : ''}`}
      style={{ background: token.colorBgLayout }}
    >
      <Header
        className="domain-gnb"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          left: 0,
          zIndex: 1000,
          background: token.colorBgContainer,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        {showDataFoundryJobGnb && dataFoundryJob ? (
          <DataFoundryJobGnb
            job={dataFoundryJob}
            mimicProgress={mimicProgress}
            onBack={exitDataFoundryJob}
            onSaveDraftRegister={() => registerWizardApiRef.current?.saveDraft()}
            onSubmitRegister={() => registerWizardApiRef.current?.submitRegister()}
            onSaveDraftMimic={() => mimicWizardApiRef.current?.saveDraft()}
            onSubmitMimic={() => mimicWizardApiRef.current?.submitGenerate()}
          />
        ) : (
          <div className="domain-gnb-inner">
            <button
              type="button"
              className="domain-gnb-left domain-logo-button"
              onClick={() => {
                navigate('/');
              }}
            >
              <DeploymentUnitOutlined />
              <span>PhysicalWorks Forge</span>
            </button>
            <Menu
              mode="horizontal"
              items={gnbItems ?? []}
              selectedKeys={[selectedGnbKey]}
              onClick={({ key }) => {
                exitDataFoundryJob();
                const k = String(key);
                if (domain === 'support') {
                  if (k === 'home') {
                    navigate('/support/home');
                  } else if (k === 'robot-support') {
                    navigate(defaultWorkspacePathForGnb('robot-support'));
                  } else if (k === 'model-support') {
                    navigate(defaultWorkspacePathForGnb('model-support'));
                  } else if (k === 'simulation-support') {
                    navigate(defaultWorkspacePathForGnb('simulation-support'));
                  }
                  return;
                }
                setInternalGnb(k);
                setIsProjectSelected(false);
                setInternalLnb(nav.selectedLnbKey);
              }}
              theme={mode}
              className="domain-gnb-menu"
              style={{ background: 'transparent' }}
            />
            <div className="domain-gnb-trailing">
              <DomainGnbActionIcons />
              <div className="domain-gnb-theme">
                <ThemeToggle />
              </div>
            </div>
          </div>
        )}
      </Header>

      <Layout className="domain-body" style={{ background: token.colorBgLayout }}>
        {isProjectMenu && !isProjectSelected ? (
          <Content className="domain-content" style={{ background: token.colorBgLayout }}>
            <div className="domain-1depth-inner">
              <ProjectMenuPage
                domain={domain}
                onSelectProject={() => {
                  setIsProjectSelected(true);
                  if (domain === 'dev') {
                    setInternalLnb('dashboard');
                  }
                }}
              />
            </div>
          </Content>
        ) : isLibraryMenu ? (
          <Content className="domain-content" style={{ background: token.colorBgLayout }}>
            <div className="domain-1depth-inner">
              <DevLibraryPage />
            </div>
          </Content>
        ) : (
          <DomainPortalHomeView
            domain={domain}
            nav={navForView}
            showLnb={showLnb}
            mode={mode}
            selectedLnbKey={selectedLnbKey}
            onSelectLnbKey={handleSelectLnbKey}
            lnbDefaultOpenKeys={lnbDefaultOpenKeys}
            activeSupportGnbKey={domain === 'support' ? selectedGnbKey : undefined}
            supportDetailEntityId={domain === 'support' && supportPath ? supportPath.supportDetailEntityId : null}
            simAssetDetailId={domain === 'support' && supportPath ? supportPath.simAssetDetailId : null}
            simConfigDetailId={domain === 'support' && supportPath ? supportPath.simConfigDetailId : null}
            simPresetDetailId={domain === 'support' && supportPath ? supportPath.simPresetDetailId : null}
            simSceneDetailId={domain === 'support' && supportPath ? supportPath.simSceneDetailId : null}
            simSceneEditorId={domain === 'support' && supportPath ? supportPath.simSceneEditorId : null}
            simSceneAutoCompose={domain === 'support' && supportPath ? supportPath.simSceneAutoCompose : false}
            supportWorkspaceDrillIn={supportWorkspaceDrillIn}
            dataFoundryJob={dataFoundryJob}
            onEnterDataRegister={() => {
              setMimicProgress(0);
              mimicWizardApiRef.current = null;
              setDataFoundryJob('register');
            }}
            onEnterDataGenerate={() => {
              registerWizardApiRef.current = null;
              setMimicProgress(0);
              setDataFoundryJob('generate-pick');
            }}
            onEnterDataCollect={() => {
              registerWizardApiRef.current = null;
              mimicWizardApiRef.current = null;
              setMimicProgress(0);
              setDataFoundryJob('collect');
            }}
            onEnterDataCurate={() => {
              registerWizardApiRef.current = null;
              mimicWizardApiRef.current = null;
              setMimicProgress(0);
              setDataFoundryJob('curate');
            }}
            onOpenMimicAugmentation={() => {
              setMimicProgress(0);
              setDataFoundryJob('mimic-augmentation');
            }}
            onMimicProgressChange={setMimicProgress}
            registerWizardApiRef={registerWizardApiRef}
            mimicWizardApiRef={mimicWizardApiRef}
            onOpenProjectMenu={() => {
              exitDataFoundryJob();
              if (domain === 'support') {
                navigate(defaultWorkspacePathForGnb('robot-support'));
                return;
              }
              setInternalGnb('project');
              setIsProjectSelected(false);
              setInternalLnb(nav.selectedLnbKey);
            }}
          />
        )}
      </Layout>
    </Layout>
  );
}
