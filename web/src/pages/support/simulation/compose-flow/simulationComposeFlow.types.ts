export type ComposeFlowStep = 'request' | 'generating' | 'preview' | 'editor';

export type SceneTypeOption = 'warehouse' | 'outdoor' | 'factory' | 'lab' | 'custom';

export type DensityOption = 'low' | 'medium' | 'high';

/** Single placed instance on the 2D scene canvas (z + full rotation for panel / future 3D). */
export interface PlacedEntity {
  instanceId: string;
  assetId: string;
  name: string;
  type: string;
  x: number;
  y: number;
  z: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  scale: number;
  mass: number;
  friction: number;
}

export interface DraftAssetRef {
  id: string;
  name: string;
  type: string;
}

export type DraftSceneCreatedBy = 'ai' | 'user';

export interface DraftScene {
  id: string;
  name: string;
  sceneType: SceneTypeOption;
  density: DensityOption;
  prompt: string;
  previewSeed: string;
  assets: DraftAssetRef[];
  /** Short summary for preview panel (read-only). */
  description: string;
  updatedAt: string;
  createdBy: DraftSceneCreatedBy;
}

export function clonePlacedEntities(list: PlacedEntity[]): PlacedEntity[] {
  return list.map((p) => ({ ...p }));
}

export function buildPlacedFromDraftAssets(assets: DraftAssetRef[]): PlacedEntity[] {
  const ts = Date.now();
  const environments = assets.filter((a) => a.type === 'environment').slice(0, 1);
  const robots = assets.filter((a) => a.type === 'robot').slice(0, 1);
  const objects = assets.filter((a) => a.type === 'object');
  const out: PlacedEntity[] = [];

  for (const a of environments) {
    out.push({
      instanceId: `inst-${a.id}-env-${ts}`,
      assetId: a.id,
      name: a.name,
      type: a.type,
      x: 0,
      y: 0,
      z: 0,
      rotX: 0,
      rotY: 0,
      rotZ: 0,
      scale: 1,
      mass: 1,
      friction: 0.5,
    });
  }
  for (const a of robots) {
    out.push({
      instanceId: `inst-${a.id}-robot-${ts}`,
      assetId: a.id,
      name: a.name,
      type: a.type,
      x: 340,
      y: 224,
      z: 0,
      rotX: 0,
      rotY: 0,
      rotZ: 0,
      scale: 1,
      mass: 1,
      friction: 0.5,
    });
  }
  objects.forEach((a, j) => {
    const col = j % 6;
    const row = Math.floor(j / 6);
    out.push({
      instanceId: `inst-${a.id}-obj-${j}-${ts}`,
      assetId: a.id,
      name: a.name,
      type: a.type,
      x: 72 + col * 88,
      y: 300 + row * 76,
      z: 0,
      rotX: 0,
      rotY: 0,
      rotZ: 0,
      scale: 1,
      mass: 1,
      friction: 0.5,
    });
  });
  return out;
}
