import { DeleteOutlined, RedoOutlined, UndoOutlined } from '@ant-design/icons';
import { App, Button, Card, Checkbox, Empty, Input, InputNumber, Select, Space, Tag, Typography, theme } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getSimulationAssetById, getSimulationAssetsMock, previewUrl } from '../../../../mocks/simulationSupportMocks';
import { useLocale } from '../../../../shared/i18n/LocaleProvider';
import type { PlacedEntity } from './simulationComposeFlow.types';
import { clonePlacedEntities } from './simulationComposeFlow.types';
import './simulation-compose-flow.css';

const GRID = 20;

export interface SceneEditorWorkspaceProps {
  title: string;
  subtitle?: string;
  initialPlaced: PlacedEntity[];
  onCancel: () => void;
  onSaveScene: (placed: PlacedEntity[]) => void;
  onSaveAsAsset: (placed: PlacedEntity[]) => void;
}

export function SceneEditorWorkspace({
  title,
  subtitle,
  initialPlaced,
  onCancel,
  onSaveScene,
  onSaveAsAsset,
}: SceneEditorWorkspaceProps) {
  const { token } = theme.useToken();
  const { t } = useLocale();
  const { message } = App.useApp();

  const placedRef = useRef<PlacedEntity[]>(clonePlacedEntities(initialPlaced));
  const [placed, setPlaced] = useState<PlacedEntity[]>(() => clonePlacedEntities(initialPlaced));
  const syncPlaced = useCallback((next: PlacedEntity[]) => {
    const c = clonePlacedEntities(next);
    placedRef.current = c;
    setPlaced(c);
  }, []);

  const undoStack = useRef<PlacedEntity[][]>([]);
  const redoStack = useRef<PlacedEntity[][]>([]);
  const [stackRev, setStackRev] = useState(0);

  const bumpStacks = useCallback(() => setStackRev((n) => n + 1), []);

  const commit = useCallback(
    (next: PlacedEntity[]) => {
      undoStack.current.push(clonePlacedEntities(placedRef.current));
      if (undoStack.current.length > 100) undoStack.current.shift();
      redoStack.current = [];
      syncPlaced(next);
      bumpStacks();
    },
    [syncPlaced, bumpStacks],
  );

  const undo = useCallback(() => {
    const prev = undoStack.current.pop();
    if (!prev) return;
    redoStack.current.push(clonePlacedEntities(placedRef.current));
    syncPlaced(prev);
    bumpStacks();
  }, [syncPlaced, bumpStacks]);

  const redo = useCallback(() => {
    const nxt = redoStack.current.pop();
    if (!nxt) return;
    undoStack.current.push(clonePlacedEntities(placedRef.current));
    syncPlaced(nxt);
    bumpStacks();
  }, [syncPlaced, bumpStacks]);

  const canUndo = undoStack.current.length > 0;
  const canRedo = redoStack.current.length > 0;
  void stackRev;

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [libSearch, setLibSearch] = useState('');
  const [libType, setLibType] = useState<'all' | 'robot' | 'object' | 'environment'>('all');
  const [snap, setSnap] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [viewScale, setViewScale] = useState(1);
  const snapRef = useRef(snap);
  const viewScaleRef = useRef(viewScale);
  snapRef.current = snap;
  viewScaleRef.current = viewScale;

  const dragRef = useRef<{
    ids: string[];
    startMouse: { x: number; y: number };
    startEntities: Map<string, { x: number; y: number }>;
    snapshot: PlacedEntity[];
  } | null>(null);

  const snapVal = (v: number) => (snapRef.current ? Math.round(v / GRID) * GRID : v);

  useEffect(() => {
    const c = clonePlacedEntities(initialPlaced);
    placedRef.current = c;
    setPlaced(c);
    undoStack.current = [];
    redoStack.current = [];
    setSelectedIds(new Set());
    setStackRev(0);
  }, [initialPlaced]);

  const library = getSimulationAssetsMock().filter((a) => {
    const q = libSearch.trim().toLowerCase();
    const okSearch = !q || a.name.toLowerCase().includes(q) || a.tags.some((tg) => tg.toLowerCase().includes(q));
    const okType = libType === 'all' || a.type === libType;
    return okSearch && okType;
  });

  const selectEntity = (instanceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.shiftKey) {
      setSelectedIds((prev) => {
        const n = new Set(prev);
        if (n.has(instanceId)) n.delete(instanceId);
        else n.add(instanceId);
        return n;
      });
    } else {
      setSelectedIds(new Set([instanceId]));
    }
  };

  const addAsset = (assetId: string) => {
    const meta = getSimulationAssetById(assetId);
    if (!meta) return;
    let next = [...placedRef.current];

    if (meta.type === 'environment') {
      next = next.filter((p) => p.type !== 'environment');
      const row: PlacedEntity = {
        instanceId: `inst-env-${Date.now()}`,
        assetId: meta.id,
        name: meta.name,
        type: meta.type,
        x: 0,
        y: 0,
        z: 0,
        rotX: 0,
        rotY: 0,
        rotZ: 0,
        scale: 1,
        mass: Number(meta.massKg) || 1,
        friction: Number.parseFloat(String(meta.friction).replace(/[^\d.-]/g, '')) || 0.5,
      };
      commit([...next, row]);
      setSelectedIds(new Set([row.instanceId]));
      return;
    }

    if (meta.type === 'robot') {
      const hadRobot = next.some((p) => p.type === 'robot');
      next = next.filter((p) => p.type !== 'robot');
      const row: PlacedEntity = {
        instanceId: `inst-robot-${Date.now()}`,
        assetId: meta.id,
        name: meta.name,
        type: meta.type,
        x: snapVal(360),
        y: snapVal(220),
        z: 0,
        rotX: 0,
        rotY: 0,
        rotZ: 0,
        scale: 1,
        mass: Number(meta.massKg) || 1,
        friction: Number.parseFloat(String(meta.friction).replace(/[^\d.-]/g, '')) || 0.5,
      };
      commit([...next, row]);
      setSelectedIds(new Set([row.instanceId]));
      if (hadRobot) message.info(t('support.sim.compose.editor.robotReplaced'));
      return;
    }

    const objCount = next.filter((p) => p.type === 'object').length;
    const row: PlacedEntity = {
      instanceId: `inst-${assetId}-${Date.now()}`,
      assetId: meta.id,
      name: meta.name,
      type: meta.type,
      x: snapVal(96 + (objCount % 6) * 72),
      y: snapVal(288 + Math.floor(objCount / 6) * 80),
      z: 0,
      rotX: 0,
      rotY: 0,
      rotZ: 0,
      scale: 1,
      mass: Number(meta.massKg) || 1,
      friction: Number.parseFloat(String(meta.friction).replace(/[^\d.-]/g, '')) || 0.5,
    };
    commit([...next, row]);
    setSelectedIds(new Set([row.instanceId]));
  };

  const onCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/sim-asset-id');
    if (id) addAsset(id);
  };

  const selectedList = placed.filter((p) => selectedIds.has(p.instanceId));
  const primary = selectedList.length === 1 ? selectedList[0]! : selectedList[0] ?? null;

  const patchPrimaryNumbers = (field: keyof PlacedEntity, value: number | null) => {
    if (value == null || Number.isNaN(value)) return;
    if (selectedIds.size === 0) return;
    const next = placedRef.current.map((p) => (selectedIds.has(p.instanceId) ? { ...p, [field]: value } : p));
    commit(next);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el?.closest?.('input, textarea, .ant-input-number, [contenteditable]')) return;
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.size > 0) {
        e.preventDefault();
        const next = placedRef.current.filter((p) => !selectedIds.has(p.instanceId));
        commit(next);
        setSelectedIds(new Set());
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedIds, commit, undo, redo]);

  const startDrag = (instanceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const ent = placedRef.current.find((p) => p.instanceId === instanceId);
    if (ent?.type === 'environment') return;
    let ids = Array.from(selectedIds);
    if (!selectedIds.has(instanceId)) {
      if (e.shiftKey) {
        const n = new Set(selectedIds);
        n.add(instanceId);
        ids = Array.from(n);
        setSelectedIds(n);
      } else {
        ids = [instanceId];
        setSelectedIds(new Set([instanceId]));
      }
    }
    const startEntities = new Map<string, { x: number; y: number }>();
    placedRef.current.forEach((p) => {
      if (ids.includes(p.instanceId)) startEntities.set(p.instanceId, { x: p.x, y: p.y });
    });
    const snapshot = clonePlacedEntities(placedRef.current);
    dragRef.current = { ids, startMouse: { x: e.clientX, y: e.clientY }, startEntities, snapshot };

    const onMove = (ev: MouseEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = (ev.clientX - d.startMouse.x) / viewScaleRef.current;
      const dy = (ev.clientY - d.startMouse.y) / viewScaleRef.current;
      const moved = placedRef.current.map((p) => {
        if (!d.ids.includes(p.instanceId)) return p;
        const o = d.startEntities.get(p.instanceId);
        if (!o) return p;
        return { ...p, x: snapVal(o.x + dx), y: snapVal(o.y + dy) };
      });
      syncPlaced(moved);
    };

    const onUp = () => {
      const d = dragRef.current;
      dragRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      if (!d) return;
      const changed = JSON.stringify(d.snapshot) !== JSON.stringify(placedRef.current);
      if (changed) {
        undoStack.current.push(d.snapshot);
        redoStack.current = [];
        setStackRev((n) => n + 1);
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const onWheelCanvas = (e: React.WheelEvent) => {
    e.preventDefault();
    setViewScale((s) => Math.min(2.2, Math.max(0.45, s - e.deltaY * 0.001)));
  };

  return (
    <div className="sim-compose-editor">
      <header className="sim-compose-editor__header">
        <div>
          <Typography.Title level={4} className="domain-content-title" style={{ margin: 0 }}>
            {title}
          </Typography.Title>
          {subtitle ? (
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0, marginTop: 4 }}>
              {subtitle}
            </Typography.Paragraph>
          ) : null}
        </div>
        <Space wrap>
          <Button icon={<UndoOutlined />} disabled={!canUndo} onClick={undo}>
            {t('support.sim.compose.editor.undo')}
          </Button>
          <Button icon={<RedoOutlined />} disabled={!canRedo} onClick={redo}>
            {t('support.sim.compose.editor.redo')}
          </Button>
        </Space>
      </header>

      <div className="sim-compose-editor__grid">
        <Card size="small" className="sim-compose-editor__panel" title={t('support.sim.editor.library')}>
          <Space direction="vertical" style={{ width: '100%' }} size={10}>
            <Input allowClear placeholder={t('support.sim.compose.editor.libSearch')} value={libSearch} onChange={(e) => setLibSearch(e.target.value)} />
            <Select
              value={libType}
              onChange={setLibType}
              style={{ width: '100%' }}
              options={[
                { value: 'all', label: t('support.sim.assets.filter.all') },
                { value: 'robot', label: t('support.sim.assets.type.robot') },
                { value: 'object', label: t('support.sim.assets.type.object') },
                { value: 'environment', label: t('support.sim.assets.type.environment') },
              ]}
            />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {t('support.sim.editor.dragHint')}
            </Typography.Text>
            <Typography.Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 0 }}>
              {t('support.sim.compose.editor.layerRules')}
            </Typography.Paragraph>
            <div className="sim-compose-editor__lib-list">
              {library.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className="sim-compose-editor__lib-item"
                  draggable
                  onDragStart={(ev) => {
                    ev.dataTransfer.setData('text/sim-asset-id', a.id);
                    ev.dataTransfer.effectAllowed = 'copy';
                  }}
                  onClick={() => addAsset(a.id)}
                >
                  <img src={previewUrl(`sim-asset-${a.id}`, 72, 72)} alt="" />
                  <div className="sim-compose-editor__lib-meta">
                    <Typography.Text strong ellipsis>
                      {a.name}
                    </Typography.Text>
                    <Tag>{a.type}</Tag>
                  </div>
                </button>
              ))}
            </div>
          </Space>
        </Card>

        <Card
          size="small"
          className="sim-compose-editor__panel sim-compose-editor__panel--canvas"
          title={
            <Space wrap>
              <span>{t('support.sim.editor.canvas')}</span>
              <Checkbox checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)}>
                {t('support.sim.compose.editor.grid')}
              </Checkbox>
              <Checkbox checked={snap} onChange={(e) => setSnap(e.target.checked)}>
                {t('support.sim.compose.editor.snap')}
              </Checkbox>
            </Space>
          }
        >
          <div
            className={`sim-compose-editor__canvas-viewport${showGrid ? ' sim-compose-editor__canvas-viewport--grid' : ''}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={onCanvasDrop}
            onClick={() => setSelectedIds(new Set())}
            onWheel={onWheelCanvas}
          >
            <div className="sim-compose-editor__canvas-inner" style={{ transform: `scale(${viewScale})`, transformOrigin: '0 0' }}>
              {placed.length === 0 ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('support.sim.editor.emptyCanvas')} />
              ) : (
                (() => {
                  const envs = placed.filter((p) => p.type === 'environment');
                  const foreground = placed
                    .filter((p) => p.type !== 'environment')
                    .sort((a, b) => {
                      const z = (ty: string) => (ty === 'robot' ? 2 : 1);
                      return z(a.type) - z(b.type);
                    });
                  const nodes = [
                    ...envs.map((p) => ({ p, layer: 'env' as const })),
                    ...foreground.map((p) => ({ p, layer: 'fg' as const })),
                  ];
                  return nodes.map(({ p, layer }) => {
                    const isEnv = layer === 'env';
                    return (
                      <button
                        key={p.instanceId}
                        type="button"
                        className={`sim-compose-editor__entity${isEnv ? ' sim-compose-editor__entity--environment' : ''}${
                          selectedIds.has(p.instanceId) ? ' sim-compose-editor__entity--selected' : ''
                        }`}
                        style={
                          isEnv
                            ? { left: 0, top: 0, width: '100%', height: '100%', transform: 'none' }
                            : {
                                left: p.x,
                                top: p.y,
                                transform: `rotate(${p.rotZ}deg) scale(${p.scale})`,
                              }
                        }
                        onClick={(e) => selectEntity(p.instanceId, e)}
                        onMouseDown={(e) => startDrag(p.instanceId, e)}
                      >
                        <img src={previewUrl(`placed-${p.assetId}`, 128, 128)} alt="" draggable={false} />
                        <span className="sim-compose-editor__entity-label">{p.name}</span>
                      </button>
                    );
                  });
                })()
              )}
            </div>
          </div>
        </Card>

        <Card size="small" className="sim-compose-editor__panel" title={t('support.sim.editor.properties')}>
          {selectedIds.size === 0 ? (
            <Typography.Paragraph type="secondary">{t('support.sim.compose.editor.selectHint')}</Typography.Paragraph>
          ) : (
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <Typography.Text type="secondary">
                {selectedIds.size > 1
                  ? t('support.sim.compose.editor.multiSelect').replace('{n}', String(selectedIds.size))
                  : primary?.name}
              </Typography.Text>
              {primary ? (
                <>
                  <Typography.Text type="secondary">{t('support.sim.compose.editor.position')}</Typography.Text>
                  <Space wrap>
                    <InputNumber size="small" addonBefore="X" value={primary.x} onChange={(v) => patchPrimaryNumbers('x', v)} />
                    <InputNumber size="small" addonBefore="Y" value={primary.y} onChange={(v) => patchPrimaryNumbers('y', v)} />
                    <InputNumber size="small" addonBefore="Z" value={primary.z} onChange={(v) => patchPrimaryNumbers('z', v)} />
                  </Space>
                  <Typography.Text type="secondary">{t('support.sim.compose.editor.rotation')}</Typography.Text>
                  <Space wrap>
                    <InputNumber size="small" addonBefore="X" value={primary.rotX} onChange={(v) => patchPrimaryNumbers('rotX', v)} />
                    <InputNumber size="small" addonBefore="Y" value={primary.rotY} onChange={(v) => patchPrimaryNumbers('rotY', v)} />
                    <InputNumber size="small" addonBefore="Z" value={primary.rotZ} onChange={(v) => patchPrimaryNumbers('rotZ', v)} />
                  </Space>
                  <Typography.Text type="secondary">{t('support.sim.compose.editor.scale')}</Typography.Text>
                  <InputNumber min={0.1} step={0.05} style={{ width: '100%' }} value={primary.scale} onChange={(v) => patchPrimaryNumbers('scale', v)} />
                  <Typography.Text type="secondary">{t('support.sim.compose.editor.physics')}</Typography.Text>
                  <Space wrap>
                    <InputNumber size="small" addonBefore={t('support.sim.assetDetail.mass')} value={primary.mass} onChange={(v) => patchPrimaryNumbers('mass', v)} />
                    <InputNumber
                      size="small"
                      addonBefore={t('support.sim.assetDetail.friction')}
                      value={primary.friction}
                      onChange={(v) => patchPrimaryNumbers('friction', v)}
                    />
                  </Space>
                </>
              ) : null}
            </Space>
          )}
        </Card>
      </div>

      <footer className="sim-compose-editor__footer" style={{ borderTopColor: token.colorBorderSecondary, background: token.colorBgContainer }}>
        <Button onClick={onCancel}>{t('support.sim.create.cancel')}</Button>
        <Space wrap>
          <Button
            type="default"
            icon={<DeleteOutlined />}
            onClick={() => onSaveAsAsset(clonePlacedEntities(placedRef.current))}
          >
            {t('support.sim.compose.footer.saveAsAsset')}
          </Button>
          <Button type="primary" onClick={() => onSaveScene(clonePlacedEntities(placedRef.current))}>
            {t('support.sim.compose.footer.saveScene')}
          </Button>
        </Space>
      </footer>
    </div>
  );
}
