import type { SimulationSceneDto } from '../../../mocks/simulationSupportMocks';
import { getSimulationAssetsMock } from '../../../mocks/simulationSupportMocks';
import type { DraftScene } from './compose-flow/simulationComposeFlow.types';

/** List / detail preview: deterministic placeholder composition from scene row. */
export function buildDraftFromSimulationSceneRow(scene: SimulationSceneDto): DraftScene {
  const all = getSimulationAssetsMock();
  const n = Math.min(Math.max(scene.assetCount, 0), all.length);
  const picks = n === 0 ? [] : all.slice(0, n);
  return {
    id: scene.id,
    name: scene.name,
    sceneType: 'warehouse',
    density: 'medium',
    prompt: '',
    previewSeed: `scene-list-${scene.id}`,
    assets: picks.map((a) => ({ id: a.id, name: a.name, type: a.type })),
    description: scene.name,
    updatedAt: scene.updatedAt,
    createdBy: scene.origin === 'ai' ? 'ai' : 'user',
  };
}
