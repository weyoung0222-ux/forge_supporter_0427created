import { ArrowLeftOutlined, DeleteOutlined, EditOutlined, EyeOutlined, PlayCircleOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Button, Space, Typography } from 'antd';
import type { SupportDrillToolbarAction, SupportPortalDrillActionSet } from '../../config/supportPaths';
import { useLocale } from '../../i18n/LocaleProvider';

export interface PortalDrillInGnbProps {
  /** i18n key for the centered title (same pattern as Data Foundry job GNB). */
  titleTKey: string;
  onBack: () => void;
  /** Which trailing toolbar to show; `'robot'` keeps Edit + Delete only. */
  actionSet?: SupportPortalDrillActionSet;
}

/**
 * Focus GNB for “drill-in” views (card list → detail): same rhythm as Dev Data Foundry register
 * (`DataFoundryJobGnb` top row) — back label, centered title, trailing utilities — without step strip.
 */
export function PortalDrillInGnb({ titleTKey, onBack, actionSet = 'none' }: PortalDrillInGnbProps) {
  const { t } = useLocale();
  const emit = (action: SupportDrillToolbarAction) => {
    window.dispatchEvent(new CustomEvent<SupportDrillToolbarAction>('support-drill-action', { detail: action }));
  };

  const trailing =
    actionSet === 'robot' ? (
      <>
        <Button size="small" onClick={() => emit('edit')}>
          {t('support.robot.definition.card.edit')}
        </Button>
        <Button size="small" danger onClick={() => emit('delete')}>
          {t('support.robot.definition.card.delete')}
        </Button>
      </>
    ) : actionSet === 'sim-asset' ? (
      <>
        <Button size="small" type="primary" icon={<EyeOutlined aria-hidden />} onClick={() => emit('preview')}>
          {t('support.sim.preview.open')}
        </Button>
        <Button size="small" icon={<EditOutlined aria-hidden />} onClick={() => emit('edit')}>
          {t('support.robot.definition.card.edit')}
        </Button>
        <Button size="small" danger icon={<DeleteOutlined aria-hidden />} onClick={() => emit('delete')}>
          {t('support.robot.definition.card.delete')}
        </Button>
      </>
    ) : actionSet === 'sim-scene' ? (
      <>
        <Button size="small" type="primary" icon={<EyeOutlined aria-hidden />} onClick={() => emit('preview')}>
          {t('support.sim.preview.open')}
        </Button>
        <Button size="small" icon={<EditOutlined aria-hidden />} onClick={() => emit('edit')}>
          {t('support.sim.sceneDetail.openEditor')}
        </Button>
        <Button size="small" danger icon={<DeleteOutlined aria-hidden />} onClick={() => emit('delete')}>
          {t('support.robot.definition.card.delete')}
        </Button>
      </>
    ) : actionSet === 'sim-config' ? (
      <>
        <Button size="small" type="primary" ghost icon={<PlayCircleOutlined aria-hidden />} onClick={() => emit('run')}>
          {t('support.sim.configDetail.run')}
        </Button>
        <Button size="small" icon={<EditOutlined aria-hidden />} onClick={() => emit('edit')}>
          {t('support.robot.definition.card.edit')}
        </Button>
        <Button size="small" danger icon={<DeleteOutlined aria-hidden />} onClick={() => emit('delete')}>
          {t('support.robot.definition.card.delete')}
        </Button>
      </>
    ) : actionSet === 'sim-preset' ? (
      <>
        <Button size="small" type="primary" ghost icon={<ThunderboltOutlined aria-hidden />} onClick={() => emit('apply')}>
          {t('support.sim.presetDetail.apply')}
        </Button>
        <Button size="small" icon={<EditOutlined aria-hidden />} onClick={() => emit('edit')}>
          {t('support.robot.definition.card.edit')}
        </Button>
      </>
    ) : null;

  return (
    <div className="domain-gnb-inner domain-gnb-inner--drill-in">
      <div className="domain-gnb-job-top domain-gnb-job-top--drill-in">
        <Button type="text" className="domain-gnb-workspace-back" icon={<ArrowLeftOutlined aria-hidden />} onClick={onBack}>
          {t('dataRegister.back')}
        </Button>
        <Typography.Title level={5} className="domain-gnb-job-title" ellipsis style={{ margin: 0 }}>
          {t(titleTKey)}
        </Typography.Title>
        <Space size={8} wrap align="center" className="domain-gnb-drill-in-trailing">
          {trailing}
        </Space>
      </div>
    </div>
  );
}
