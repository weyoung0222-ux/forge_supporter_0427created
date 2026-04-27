import { Button, Modal } from 'antd';
import type { ReactNode } from 'react';
import { useLocale } from '../../../../shared/i18n/LocaleProvider';
import './simulation-create-modals.css';

export interface SimulationCreateModalShellProps {
  open: boolean;
  title: ReactNode;
  onCancel: () => void;
  /** Primary action (typically `form.submit()`). */
  onPrimaryClick: () => void;
  primaryLoading?: boolean;
  /** Default 640 (Simulation). Robot create flows use 720–880. */
  modalWidth?: number;
  children: ReactNode;
}

export function SimulationCreateModalShell({
  open,
  title,
  onCancel,
  onPrimaryClick,
  primaryLoading = false,
  modalWidth = 640,
  children,
}: SimulationCreateModalShellProps) {
  const { t } = useLocale();

  return (
    <Modal
      open={open}
      title={title}
      onCancel={onCancel}
      footer={null}
      width={modalWidth}
      destroyOnClose
      maskClosable={false}
      className="sim-create-modal"
      styles={{
        body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', paddingTop: 4 },
      }}
    >
      <div className="sim-create-modal__body">{children}</div>
      <div className="sim-create-modal__footer">
        <Button onClick={onCancel}>{t('support.sim.create.cancel')}</Button>
        <Button type="primary" loading={primaryLoading} onClick={onPrimaryClick}>
          {t('support.sim.create.submit')}
        </Button>
      </div>
    </Modal>
  );
}
