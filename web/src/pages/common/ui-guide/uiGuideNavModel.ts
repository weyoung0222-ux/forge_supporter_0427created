import type { UiGuideScanAntd } from './catalog.generated';

export const UI_GUIDE_CATEGORIES = ['foundation', 'components', 'patterns', 'layout', 'feedback'] as const;
export type UiGuideCategory = (typeof UI_GUIDE_CATEGORIES)[number];

export type UiGuideSelection =
  | { kind: 'manual'; id: string }
  | { kind: 'antd'; componentName: string };

export type ManualNavDef = {
  id: string;
  labelEn: string;
  category: UiGuideCategory;
};

/** Curated manual entries (English labels per forge.md). */
export const UI_GUIDE_MANUAL_NAV: ManualNavDef[] = [
  { id: 'foundation:color', category: 'foundation', labelEn: 'Color system' },
  { id: 'foundation:typography', category: 'foundation', labelEn: 'Typography' },
  { id: 'foundation:spacing', category: 'foundation', labelEn: 'Spacing' },
  { id: 'foundation:icons', category: 'foundation', labelEn: 'Icons (scan)' },
  { id: 'foundation:search-input', category: 'foundation', labelEn: 'Search input (360px)' },
  { id: 'pattern:project-card', category: 'patterns', labelEn: 'Project card' },
  { id: 'pattern:library-card', category: 'patterns', labelEn: 'Library card' },
  { id: 'pattern:data-table', category: 'patterns', labelEn: 'Data table + filters' },
  { id: 'pattern:form', category: 'patterns', labelEn: 'Form (vertical)' },
  { id: 'pattern:empty', category: 'patterns', labelEn: 'Empty state' },
  { id: 'layout:shells', category: 'layout', labelEn: 'Page shells (GNB / LNB)' },
  { id: 'layout:lnb-menu-only', category: 'layout', labelEn: 'LNB — menu-only (Support)' },
  { id: 'layout:grid', category: 'layout', labelEn: 'Grid (Row / Col)' },
  { id: 'layout:container', category: 'layout', labelEn: 'Content container (1200px)' },
  { id: 'layout:section', category: 'layout', labelEn: 'Section structure' },
  { id: 'feedback:modal', category: 'feedback', labelEn: 'Modal' },
  { id: 'feedback:toast', category: 'feedback', labelEn: 'Toast / message' },
  { id: 'feedback:loading', category: 'feedback', labelEn: 'Loading' },
  { id: 'feedback:error', category: 'feedback', labelEn: 'Error state' },
  { id: 'feedback:empty', category: 'feedback', labelEn: 'Empty (feedback)' },
];

export function selectionKey(sel: UiGuideSelection): string {
  if (sel.kind === 'manual') return `m:${sel.id}`;
  return `a:${sel.componentName}`;
}

export function parseSelectionKey(key: string): UiGuideSelection | null {
  if (key.startsWith('m:')) return { kind: 'manual', id: key.slice(2) };
  if (key.startsWith('a:')) return { kind: 'antd', componentName: key.slice(2) };
  return null;
}

export function buildNavEntriesForCategory(
  category: UiGuideCategory,
  scanned: UiGuideScanAntd[],
): { key: string; label: string; selection: UiGuideSelection }[] {
  const manual = UI_GUIDE_MANUAL_NAV.filter((m) => m.category === category).map((m) => ({
    key: selectionKey({ kind: 'manual', id: m.id }),
    label: m.labelEn,
    selection: { kind: 'manual', id: m.id } as const,
  }));

  const fromScan = scanned
    .filter((row) => row.category === category)
    .map((row) => ({
      key: selectionKey({ kind: 'antd', componentName: row.componentName }),
      label: row.componentName,
      selection: { kind: 'antd', componentName: row.componentName } as const,
    }));

  return [...manual, ...fromScan.sort((a, b) => a.label.localeCompare(b.label))];
}

export function filterNavEntries(
  entries: { key: string; label: string; selection: UiGuideSelection }[],
  q: string,
): { key: string; label: string; selection: UiGuideSelection }[] {
  const s = q.trim().toLowerCase();
  if (!s) return entries;
  return entries.filter((e) => e.label.toLowerCase().includes(s) || e.key.toLowerCase().includes(s));
}
