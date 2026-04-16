#!/usr/bin/env node
/**
 * Scans web/src for `antd` and `@ant-design/icons` imports; writes catalog.generated.ts.
 * Run from repo: npm run gen:ui-guide
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.join(__dirname, '..');
const SRC = path.join(WEB_ROOT, 'src');
const OUT = path.join(SRC, 'pages/common/ui-guide/catalog.generated.ts');

const SKIP_PATH_PARTS = ['node_modules', 'dist', 'catalog.generated'];

/** @param {string} name */
function categorizeAntd(name) {
  const foundation = new Set([
    'ConfigProvider',
    'App',
    'theme',
  ]);
  const layout = new Set([
    'Layout',
    'Row',
    'Col',
    'Flex',
    'Space',
    'Divider',
    'Grid',
  ]);
  const patterns = new Set([
    'Card',
    'Table',
    'Form',
    'List',
    'Upload',
    'Tabs',
    'Menu',
    'Steps',
    'Timeline',
    'Breadcrumb',
    'Dropdown',
    'Segmented',
    'Collapse',
    'Descriptions',
    'Calendar',
    'Tree',
    'Transfer',
    'AutoComplete',
    'Cascader',
    'DatePicker',
    'TimePicker',
    'InputNumber',
    'Mentions',
    'Rate',
    'Slider',
    'TreeSelect',
    'ColorPicker',
  ]);
  const feedback = new Set([
    'Modal',
    'message',
    'notification',
    'Alert',
    'Empty',
    'Drawer',
    'Spin',
    'Progress',
    'Skeleton',
    'Result',
    'Popover',
    'Tooltip',
    'FloatButton',
    'Tour',
    'Watermark',
    'QRCode',
  ]);
  if (foundation.has(name)) return 'foundation';
  if (layout.has(name)) return 'layout';
  if (patterns.has(name)) return 'patterns';
  if (feedback.has(name)) return 'feedback';
  return 'components';
}

/** @param {string} filePath */
function shouldSkipFile(filePath) {
  const rel = path.relative(SRC, filePath);
  return SKIP_PATH_PARTS.some((p) => rel.includes(p));
}

/** @param {string} content @param {string} modulePath e.g. antd */
function extractNamedImports(content, modulePath) {
  const names = new Set();
  const esc = modulePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`import\\s+(?:type\\s+)?\\{([^}]+)\\}\\s+from\\s+['"]${esc}['"]`, 'g');
  let m;
  while ((m = re.exec(content)) !== null) {
    m[1].split(',').forEach((raw) => {
      let part = raw.trim();
      if (!part || part.startsWith('//')) return;
      if (/^type\s+/.test(part)) return;
      part = part.replace(/^type\s+/, '');
      const asIdx = part.search(/\s+as\s+/);
      if (asIdx > 0) part = part.slice(0, asIdx).trim();
      const first = part.split(/\s+/)[0];
      if (first && /^[A-Za-z_][\w]*$/.test(first)) names.add(first);
    });
  }
  return names;
}

/** @param {string} content */
function extractAntdImports(content) {
  const names = extractNamedImports(content, 'antd');
  const reDefault = /import\s+(\w+)\s+from\s+['"]antd['"]/;
  const dm = content.match(reDefault);
  if (dm) names.add(dm[1]);
  return [...names];
}

/** @param {string} content */
function extractIconImports(content) {
  return [...extractNamedImports(content, '@ant-design/icons')];
}

/** @param {string} absPath */
function screenLabelFromPath(absPath) {
  const base = path.basename(absPath, path.extname(absPath));
  return base;
}

function walkTsxFiles(dir, acc = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      walkTsxFiles(p, acc);
    } else if (e.isFile() && /\.tsx?$/.test(e.name)) {
      acc.push(p);
    }
  }
  return acc;
}

/** Drop `import type { ... } from 'module'` blocks so type-only names are not counted as runtime components. */
function stripTypeOnlyImports(content) {
  return content.replace(/import\s+type\s+[^;]+;[\r\n]*/g, '');
}

function main() {
  const files = walkTsxFiles(SRC).filter((f) => !shouldSkipFile(f));

  /** @type {Map<string, { category: string, usages: { relativePath: string, screenLabel: string }[] }>} */
  const antdMap = new Map();
  /** @type {Map<string, { usages: { relativePath: string, screenLabel: string }[] }>} */
  const iconMap = new Map();

  const snippetPaths = new Set();

  for (const abs of files) {
    const rel = path.relative(WEB_ROOT, abs).split(path.sep).join('/');
    let content;
    try {
      content = fs.readFileSync(abs, 'utf8');
    } catch {
      continue;
    }

    content = stripTypeOnlyImports(content);

    const antdNames = extractAntdImports(content);
    const iconNames = extractIconImports(content);

    if (antdNames.length) snippetPaths.add(rel);
    for (const name of antdNames) {
      const category = categorizeAntd(name);
      if (!antdMap.has(name)) {
        antdMap.set(name, { category, usages: [] });
      }
      antdMap.get(name).usages.push({
        relativePath: rel,
        screenLabel: screenLabelFromPath(abs),
      });
    }

    for (const name of iconNames) {
      if (!iconMap.has(name)) iconMap.set(name, { usages: [] });
      iconMap.get(name).usages.push({
        relativePath: rel,
        screenLabel: screenLabelFromPath(abs),
      });
    }
  }

  const antdList = [...antdMap.entries()]
    .map(([componentName, v]) => ({
      componentName,
      category: v.category,
      usages: v.usages.sort((a, b) => a.relativePath.localeCompare(b.relativePath)),
    }))
    .sort((a, b) => a.componentName.localeCompare(b.componentName));

  const iconList = [...iconMap.entries()]
    .map(([iconName, v]) => ({
      iconName,
      usages: v.usages.sort((a, b) => a.relativePath.localeCompare(b.relativePath)),
    }))
    .sort((a, b) => a.iconName.localeCompare(b.iconName));

  /** @type {Record<string, string>} */
  const snippets = {};
  const MAX_SNIPPET = 14000;
  for (const rel of [...snippetPaths].sort()) {
    const abs = path.join(WEB_ROOT, rel);
    let text = fs.readFileSync(abs, 'utf8');
    if (text.length > MAX_SNIPPET) {
      text = `${text.slice(0, MAX_SNIPPET)}\n\n/* … truncated … */`;
    }
    snippets[rel] = text;
  }

  const generatedAt = new Date().toISOString();

  const lines = [];
  lines.push('/* eslint-disable */');
  lines.push('/**');
  lines.push(' * Auto-generated by scripts/generate-ui-guide-catalog.mjs — do not edit by hand.');
  lines.push(' * Re-run: npm run gen:ui-guide');
  lines.push(' */');
  lines.push(`export type UiGuideScanFileRef = {
  relativePath: string;
  screenLabel: string;
};

export type UiGuideScanAntd = {
  componentName: string;
  category: 'foundation' | 'components' | 'patterns' | 'layout' | 'feedback';
  usages: UiGuideScanFileRef[];
};

export type UiGuideScanIcon = {
  iconName: string;
  usages: UiGuideScanFileRef[];
};

export const UI_GUIDE_CATALOG_GENERATED_AT = ${JSON.stringify(generatedAt)};

/** Source excerpts keyed by path relative to web/ (one per file). */
export const UI_GUIDE_FILE_SNIPPETS: Record<string, string> = ${JSON.stringify(snippets, null, 0)};

export const UI_GUIDE_SCANNED_ANTD: UiGuideScanAntd[] = ${JSON.stringify(antdList, null, 2)};

export const UI_GUIDE_SCANNED_ICONS: UiGuideScanIcon[] = ${JSON.stringify(iconList, null, 2)};
`);

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, lines.join('\n'), 'utf8');
  console.log(`Wrote ${path.relative(WEB_ROOT, OUT)} (${antdList.length} antd, ${iconList.length} icons, ${Object.keys(snippets).length} snippets)`);
}

main();
