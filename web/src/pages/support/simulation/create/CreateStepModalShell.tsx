import { Button, Card, Modal } from 'antd';
import { Fragment, type ReactNode } from 'react';
import { useLocale } from '../../../../shared/i18n/LocaleProvider';
import './simulation-create-modals.css';

export interface StepDef {
  title: string;
}

export interface CreateStepModalShellProps {
  /** `modal` (default): Ant Design dialog. `page`: inline drill-in body (no overlay). */
  layout?: 'modal' | 'page';
  /** Required when `layout` is `modal` (default). Ignored for `page` (always shown). */
  open?: boolean;
  title: ReactNode;
  onCancel: () => void;
  onSubmit: () => void;
  submitLoading?: boolean;
  /** Label for the primary button on the last step (default: `support.sim.create.submit`). */
  submitLabel?: string;
  modalWidth?: number;
  steps: StepDef[];
  currentStep: number;
  onPrev: () => void;
  onNext: () => void | Promise<void>;
  /** Block next when true (e.g. duplicate error). */
  nextDisabled?: boolean;
  /** Extra content rendered above the step box. */
  topContent?: ReactNode;
  /** Page layout: fixed footer left (e.g. Save Draft). */
  footerStart?: ReactNode;
  /** Page layout: omit Cancel in the trailing action group. */
  hideFooterCancel?: boolean;
  children: ReactNode;
}

export function CreateStepModalShell({
  layout = 'modal',
  open = true,
  title,
  onCancel,
  onSubmit,
  submitLoading = false,
  submitLabel,
  modalWidth = 640,
  steps,
  currentStep,
  onPrev,
  onNext,
  nextDisabled = false,
  topContent,
  footerStart,
  hideFooterCancel = false,
  children,
}: CreateStepModalShellProps) {
  const { t } = useLocale();
  const isLast = currentStep === steps.length - 1;
  const stepNavAriaLabel = 'Data Foundry job steps';

  const stepBox = (
    <div className="sim-create-modal__step-box">
      {steps.map((step, idx) => {
        const status = idx < currentStep ? 'finish' : idx === currentStep ? 'process' : 'wait';
        return (
          <div className="sim-step-row" key={idx}>
            {idx > 0 && <div className={`sim-step-connector sim-step-connector--${idx <= currentStep ? 'done' : 'pending'}`} />}
            <div className={`sim-step-item sim-step-item--${status}`}>
              <span className="sim-step-item__icon">{idx < currentStep ? '✓' : idx + 1}</span>
              <span className="sim-step-item__title">{step.title}</span>
            </div>
          </div>
        );
      })}
    </div>
  );

  const pageStepStrip = (
    <div className="domain-job-step-strip-box">
      <div className="domain-job-step-strip-center">
        <nav className="domain-job-step-strip-indicator" aria-label={stepNavAriaLabel}>
          <div className="domain-job-step-strip-indicator-list" role="list">
            {steps.map((step, idx) => {
              const status = idx < currentStep ? 'is-done' : idx === currentStep ? 'is-active' : 'is-upcoming';
              const labelClassName = [
                'domain-job-step-strip-indicator-label',
                'ant-typography',
                status === 'is-upcoming' ? 'ant-typography-secondary' : '',
              ]
                .filter(Boolean)
                .join(' ');
              return (
                <Fragment key={`step-frag-${idx}`}>
                  <button type="button" role="listitem" className={`domain-job-step-strip-indicator-item ${status}`}>
                    <span className="domain-job-step-strip-indicator-badge">{idx < currentStep ? '✓' : idx + 1}</span>
                    <span className={labelClassName}>
                      {idx === currentStep ? <strong>{step.title}</strong> : step.title}
                    </span>
                  </button>
                  {idx < steps.length - 1 ? (
                    <span className="domain-job-step-strip-indicator-connector" aria-hidden="true" />
                  ) : null}
                </Fragment>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );

  const prevButton = currentStep > 0 ? (
    <Button onClick={onPrev}>
      {t('support.robot.create.model.prev')}
    </Button>
  ) : null;

  const submitText = submitLabel ?? t('support.sim.create.submit');

  const cancelButton = hideFooterCancel ? null : <Button onClick={onCancel}>{t('support.sim.create.cancel')}</Button>;

  const nextOrSubmitButton = isLast ? (
    <Button type="primary" loading={submitLoading} onClick={onSubmit}>
      {submitText}
    </Button>
  ) : (
    <Button type="primary" onClick={() => void onNext()} disabled={nextDisabled}>
      {t('support.robot.create.model.next')}
    </Button>
  );

  const trailingActions = (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {cancelButton}
      {nextOrSubmitButton}
    </div>
  );

  const footer =
    layout === 'page' ? (
      <div className="foundry-create-footer-bar">
        <div
          className={`foundry-create-footer-bar__inner${footerStart ? ' foundry-create-footer-bar__inner--with-leading' : ''}`}
        >
          {footerStart ? <div className="foundry-create-footer-bar__leading">{footerStart}</div> : null}
          <div className="foundry-create-footer-bar__trailing" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {prevButton}
            {trailingActions}
          </div>
        </div>
      </div>
    ) : (
      <div className="sim-create-modal__footer">
        <div>{prevButton}</div>
        {trailingActions}
      </div>
    );

  const pageInner = (
    <>
      {topContent}
      <div className="foundry-create-step-band">{pageStepStrip}</div>
      <div className="foundry-create-main">
        <Card bordered className="foundry-create-param-card" title={steps[currentStep]?.title}>
          <div className="foundry-create-card-scroll sim-create-modal__body">{children}</div>
        </Card>
      </div>
      {footer}
    </>
  );

  const modalInner = (
    <>
      {topContent}
      {stepBox}
      <div className="sim-create-modal__body">{children}</div>
      {footer}
    </>
  );

  if (layout === 'page') {
    return (
      <div className="sim-create-modal sim-create-modal--page foundry-create-step-shell">
        {pageInner}
      </div>
    );
  }

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
      {modalInner}
    </Modal>
  );
}
