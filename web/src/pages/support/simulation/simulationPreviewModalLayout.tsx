import { CompassOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Checkbox, Modal, theme } from 'antd';
import { useCallback, useRef, useState, type ReactNode } from 'react';
import { previewUrl } from '../../../mocks/simulationSupportMocks';
import { useLocale } from '../../../shared/i18n/LocaleProvider';
import './simulation-support-pages.css';

export interface SimulationPreviewModalShellProps {
  open: boolean;
  onClose: () => void;
  /** Narrow column (info + footer actions). */
  side: ReactNode;
  /** Wide preview column. */
  main: ReactNode;
  /** `wide` = 1200px centered (default). `fullscreen` = legacy full-viewport shell. */
  layout?: 'wide' | 'fullscreen';
  /** When `left`, info column renders before the preview (LTR: panel on the left). */
  sidePlacement?: 'left' | 'right';
  /** Optional modal header row: title (typically left) and actions (right), plain layout. */
  topBarTitle?: ReactNode;
  topBarActions?: ReactNode;
}

/** Shared preview frame for Asset / Scene modals. */
export function SimulationPreviewModalShell({
  open,
  onClose,
  main,
  side,
  layout = 'wide',
  sidePlacement = 'right',
  topBarTitle,
  topBarActions,
}: SimulationPreviewModalShellProps) {
  const { token } = theme.useToken();
  const isWide = layout === 'wide';
  const sideLeft = sidePlacement === 'left';
  const showTopBar = topBarTitle != null || topBarActions != null;
  const rootClass = ['sim-asset-preview-modal', sideLeft ? 'sim-asset-preview-modal--side-left' : ''].filter(Boolean).join(' ');

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={!showTopBar}
      destroyOnClose
      width={isWide ? 1200 : '100%'}
      centered={isWide}
      style={
        isWide
          ? { top: 0, paddingBottom: 0 }
          : { top: 0, maxWidth: '100vw', paddingBottom: 0, margin: 0 }
      }
      styles={{
        content: isWide
          ? {
              padding: 0,
              borderRadius: 12,
              height: 720,
              display: 'flex',
              flexDirection: 'column',
            }
          : { padding: 0, borderRadius: 0, height: '100vh', maxHeight: '100vh', display: 'flex', flexDirection: 'column' },
        body: { flex: 1, padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
      }}
      wrapClassName={isWide ? 'sim-asset-preview-modal-wrap sim-asset-preview-modal-wrap--wide' : 'sim-asset-preview-modal-wrap'}
    >
      <div className={rootClass}>
        {showTopBar ? (
          <div className="sim-asset-preview-modal__top-bar">
            <div className="sim-asset-preview-modal__top-bar-title">{topBarTitle}</div>
            <div className="sim-asset-preview-modal__top-bar-actions">{topBarActions}</div>
          </div>
        ) : null}
        <div className="sim-asset-preview-modal__row">
          {sideLeft ? (
            <>
              <aside className="sim-asset-preview-modal__side" style={{ background: token.colorBgContainer }}>
                {side}
              </aside>
              <div className="sim-asset-preview-modal__main">{main}</div>
            </>
          ) : (
            <>
              <div className="sim-asset-preview-modal__main">{main}</div>
              <aside className="sim-asset-preview-modal__side" style={{ background: token.colorBgContainer }}>
                {side}
              </aside>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}

export type Preview3DViewportMode = 'asset' | 'scene';

export interface Preview3DViewportProps {
  /** Used for texture / interaction identity. */
  seed: string;
  mode?: Preview3DViewportMode;
}

const DEFAULT_ROT = { x: -12, y: 24 };

/**
 * Lightweight 3D stand-in: drag orbit, Shift+drag pan, wheel zoom.
 * Scene mode adds grid overlay + camera reset (same interaction rules).
 */
export function Preview3DViewport({ seed, mode = 'asset' }: Preview3DViewportProps) {
  const { t } = useLocale();
  const [rot, setRot] = useState(DEFAULT_ROT);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const drag = useRef<{ mode: 'orbit' | 'pan'; sx: number; sy: number; rx: number; ry: number; px: number; py: number } | null>(null);

  const resetCamera = useCallback(() => {
    setRot({ ...DEFAULT_ROT });
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      const panMode: 'orbit' | 'pan' = e.shiftKey || e.button === 1 ? 'pan' : 'orbit';
      drag.current = {
        mode: panMode,
        sx: e.clientX,
        sy: e.clientY,
        rx: rot.x,
        ry: rot.y,
        px: pan.x,
        py: pan.y,
      };
    },
    [rot.x, rot.y, pan.x, pan.y],
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (d.mode === 'pan') {
      setPan({ x: d.px + dx, y: d.py + dy });
    } else {
      setRot({ x: d.rx - dy * 0.35, y: d.ry + dx * 0.35 });
    }
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    drag.current = null;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
  }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.min(2.4, Math.max(0.45, z - e.deltaY * 0.0015)));
  }, []);

  const isScene = mode === 'scene';

  return (
    <div
      className={`sim-asset-preview-3d${showGrid && isScene ? ' sim-asset-preview-3d--scene-grid' : ''}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onWheel={onWheel}
    >
      {isScene ? (
        <div className="sim-asset-preview-modal__main-toolbar">
          <Checkbox checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)}>
            {t('support.sim.scenePreview.grid')}
          </Checkbox>
          <Button type="default" size="small" icon={<CompassOutlined />} onClick={resetCamera}>
            {t('support.sim.scenePreview.resetCamera')}
          </Button>
        </div>
      ) : null}
      <div
        className="sim-asset-preview-3d__stage"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) perspective(900px) rotateX(${rot.x}deg) rotateY(${rot.y}deg) scale3d(${zoom}, ${zoom}, ${zoom})`,
        }}
      >
        <div className="sim-asset-preview-3d__mesh" style={{ backgroundImage: `url(${previewUrl(`3d-${seed}`, 720, 720)})` }} />
      </div>
      <div className="sim-asset-preview-3d__hint">
        <span style={{ fontSize: 12, color: 'var(--ant-color-text-secondary)' }}>
          <EyeOutlined aria-hidden /> {t('support.sim.preview.controls3d')}
        </span>
      </div>
    </div>
  );
}
