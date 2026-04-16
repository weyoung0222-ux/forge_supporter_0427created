/** Active workspace job under Data Foundry (GNB shows title + steps). */
export type DataFoundryJob =
  | null
  | 'register'
  | 'generate-pick'
  | 'mimic-augmentation'
  | 'collect'
  | 'curate';
