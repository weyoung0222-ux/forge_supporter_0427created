import screensCsv from './screens.csv?raw';

export type PortalCode = 'CO' | 'DV' | 'CS' | 'SP' | 'AD';

export type ScreenRegistryRow = {
  key: string;
  /** Original row order in screens.csv (1-based) for No. column sort */
  csvOrder: number;
  code: PortalCode;
  screenId: string;
  depth1: string;
  depth2: string;
  depth3: string;
  depth4: string;
  depth5: string;
  screenName: string;
  description: string;
  route: string;
};

const PORTAL_LABEL: Record<PortalCode, string> = {
  CO: 'Common',
  DV: 'Dev',
  CS: 'Customer',
  SP: 'Support',
  AD: 'Admin',
};

export function portalLabel(code: PortalCode): string {
  return PORTAL_LABEL[code] ?? code;
}

export const PORTAL_CODES: PortalCode[] = ['CO', 'DV', 'CS', 'SP', 'AD'];

export const PORTAL_ORDER = ['Common', 'Dev', 'Customer', 'Support', 'Admin'] as const;

/** Parse src/data/screens.csv — mirror to docs/screens.csv for documentation. */
export function loadScreenRegistry(): ScreenRegistryRow[] {
  const lines = screensCsv.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = lines[0].split(',').map((h) => h.trim());
  const idx = (name: string) => header.indexOf(name);

  const rows: ScreenRegistryRow[] = [];
  let csvOrder = 0;
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cells = parseCsvLine(line);
    if (cells.length < header.length) continue;

    const code = cells[idx('code')] as PortalCode;
    if (!PORTAL_LABEL[code]) continue;

    csvOrder += 1;
    const screenId = cells[idx('screenId')];
    rows.push({
      key: screenId,
      csvOrder,
      code,
      screenId,
      depth1: cells[idx('depth1')] || '-',
      depth2: cells[idx('depth2')] || '-',
      depth3: cells[idx('depth3')] || '-',
      depth4: cells[idx('depth4')] || '-',
      depth5: cells[idx('depth5')] || '-',
      screenName: cells[idx('screenName')],
      description: cells[idx('description')],
      route: cells[idx('route')] || '/',
    });
  }
  return rows;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let field = '';
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuote = !inQuote;
    } else if (c === ',' && !inQuote) {
      result.push(field.trim());
      field = '';
    } else {
      field += c;
    }
  }
  result.push(field.trim());
  return result;
}
