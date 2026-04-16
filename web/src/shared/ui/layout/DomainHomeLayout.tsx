import { useContext, useMemo, useRef, useState } from 'react';
import { DeploymentUnitOutlined } from '@ant-design/icons';
import { Layout, Menu, theme } from 'antd';
import { useNavigate } from 'react-router-dom';
import { DOMAIN_NAVIGATION, type DomainKey } from '../../config/domainNavigation';
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
  const nav = DOMAIN_NAVIGATION[domain];
  const { t, locale } = useLocale();
  const { mode } = useContext(ThemeContext);
  const { token } = theme.useToken();
  const gnbItems = useMemo(() => localizeMenuItems(nav.gnbItems, t), [nav.gnbItems, t, locale]);
  const [selectedGnbKey, setSelectedGnbKey] = useState(nav.selectedGnbKey);
  const [isProjectSelected, setIsProjectSelected] = useState(false);
  const [selectedLnbKey, setSelectedLnbKey] = useState(nav.selectedLnbKey);
  const [dataFoundryJob, setDataFoundryJob] = useState<DataFoundryJob>(null);
  const [mimicProgress, setMimicProgress] = useState(0);
  const registerWizardApiRef = useRef<DataRegisterWizardApi | null>(null);
  const mimicWizardApiRef = useRef<MimicAugmentationWizardApi | null>(null);
  const isProjectMenu = selectedGnbKey === 'project';
  const isLibraryMenu = domain === 'dev' && selectedGnbKey === 'library';
  const showLnb = isProjectSelected;

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
    setSelectedLnbKey(key);
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
                setSelectedGnbKey(String(key));
                setIsProjectSelected(false);
                setSelectedLnbKey(nav.selectedLnbKey);
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
                    setSelectedLnbKey('dashboard');
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
            nav={nav}
            showLnb={showLnb}
            mode={mode}
            selectedLnbKey={selectedLnbKey}
            onSelectLnbKey={handleSelectLnbKey}
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
              setSelectedGnbKey('project');
              setIsProjectSelected(false);
              setSelectedLnbKey(nav.selectedLnbKey);
            }}
          />
        )}
      </Layout>
    </Layout>
  );
}
