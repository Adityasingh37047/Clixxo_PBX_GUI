// READ-ONLY audit script - compares HEAD monolith vs factored files
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('.');

const PAGES = [
  { name: 'CCRoutePage', page: 'src/modules/PBX/CallControl/CCRoutePage.jsx', prefix: 'CCRoute', dir: 'src/modules/PBX/CallControl' },
  { name: 'InboundRoutesPage', page: 'src/modules/PBX/CallControl/InboundRoutesPage.jsx', prefix: 'InboundRoutes', dir: 'src/modules/PBX/CallControl' },
  { name: 'OutboundRoutesPage', page: 'src/modules/PBX/CallControl/OutboundRoutesPage.jsx', prefix: 'OutboundRoutes', dir: 'src/modules/PBX/CallControl' },
  { name: 'OutboundRestrictions', page: 'src/modules/PBX/CallControl/OutboundRestrictions.jsx', prefix: 'OutboundRestrictions', dir: 'src/modules/PBX/CallControl' },
  { name: 'TimeCondition', page: 'src/modules/PBX/CallControl/TimeCondition.jsx', prefix: 'TimeCondition', dir: 'src/modules/PBX/CallControl' },
  { name: 'RecordSettings', page: 'src/modules/PBX/RecordSettings/RecordSettings.jsx', prefix: 'RecordSettings', dir: 'src/modules/PBX/RecordSettings' },
  { name: 'VoicePromptsPage', page: 'src/modules/PBX/VoicePrompts/VoicePromptsPage.jsx', prefix: 'VoicePrompts', dir: 'src/modules/PBX/VoicePrompts' },
  { name: 'FeatureCodePage', page: 'src/modules/PBX/Features Codes/FeatureCodePage.jsx', prefix: 'FeatureCode', dir: 'src/modules/PBX/Features Codes' },
  { name: 'VoicemailPage', page: 'src/modules/PBX/Voicemail/VoicemailPage.jsx', prefix: 'Voicemail', dir: 'src/modules/PBX/Voicemail' },
  { name: 'AutoProvision', page: 'src/modules/PBX/AutoProvision/AutoProvision.jsx', prefix: 'AutoProvision', dir: 'src/modules/PBX/AutoProvision' },
  { name: 'ExtensionGroupsPage', page: 'src/modules/PBX/Extensions/ExtensionGroupsPage.jsx', prefix: 'ExtensionGroups', dir: 'src/modules/PBX/Extensions' },
  { name: 'SipRegisterPage', page: 'src/modules/PBX/Trunks/SipRegisterPage.jsx', prefix: 'SipRegister', dir: 'src/modules/PBX/Trunks' },
  { name: 'CallCount', page: 'src/modules/CDR/CallCount.jsx', prefix: 'CallCount', dir: 'src/modules/CDR' },
  { name: 'SystemToolsVPN', page: 'src/modules/System/System Settings/SystemToolsVPN.jsx', prefix: 'SystemToolsVPN', dir: 'src/modules/System/System Settings' },
  { name: 'SystemInfo', page: 'src/modules/status/System Status/SystemInfo.jsx', prefix: 'SystemInfo', dir: 'src/modules/status/System Status' },
  { name: 'PbxMonitor', page: 'src/modules/status/PBX Status/PbxMonitor.jsx', prefix: 'PbxMonitor', dir: 'src/modules/status/PBX Status' },
  { name: 'ActiveCallsPage', page: 'src/modules/status/PBX Status/ActiveCallsPage.jsx', prefix: 'ActiveCalls', dir: 'src/modules/status/PBX Status' },
  { name: 'ActiveCallQueue', page: 'src/modules/status/PBX Status/ActiveCallQueue.jsx', prefix: 'ActiveCallQueue', dir: 'src/modules/status/PBX Status' },
  { name: 'ViewVoicemailPage', page: 'src/modules/status/PBX Status/ViewVoicemailPage.jsx', prefix: 'ViewVoicemail', dir: 'src/modules/status/PBX Status' },
];

function readFile(p) {
  try { return fs.readFileSync(path.join(ROOT, p), 'utf8'); } catch { return null; }
}

function headFile(p) {
  try { return execSync(`git show "HEAD:${p}"`, { cwd: ROOT, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 }); }
  catch { return null; }
}

function lineCount(s) { return s ? s.split('\n').length : 0; }

function findExtracted(dir, prefix) {
  const files = [];
  const candidates = [
    `${dir}/hooks/use${prefix}Page.js`,
    `${dir}/components/${prefix}FormFields.jsx`,
    `${dir}/components/${prefix}TableHelpers.js`,
    `${dir}/utils/${prefix}Transformers.js`,
    `${dir}/utils/${prefix}Validators.js`,
    // legacy flat layout
    `${dir}/${prefix}FormFields.jsx`,
    `${dir}/${prefix}TableHelpers.js`,
  ];
  // ActiveCallQueue stats hook
  if (prefix === 'ActiveCallQueue') candidates.push(`${dir}/hooks/useActiveCallQueueStatsPage.js`);
  for (const c of candidates) {
    const content = readFile(c);
    if (content) files.push({ path: c, content });
  }
  return files;
}

function extractSymbols(text) {
  const handlers = new Set();
  const apis = new Set();
  const labels = new Set();
  const validations = new Set();
  const imports = new Set();

  if (!text) return { handlers, apis, labels, validations, imports };

  for (const m of text.matchAll(/(?:const|function)\s+(handle[A-Za-z0-9_]+|on[A-Z][A-Za-z0-9_]+)/g)) handlers.add(m[1]);
  for (const m of text.matchAll(/(?:const|function)\s+([a-z][A-Za-z0-9_]*(?:Submit|Save|Delete|Add|Edit|Update|Fetch|Load|Validate|Reset|Cancel|Upload|Download|Export|Import)[A-Za-z0-9_]*)/g)) handlers.add(m[1]);
  for (const m of text.matchAll(/apiService\.([a-zA-Z0-9_]+)/g)) apis.add(m[1]);
  for (const m of text.matchAll(/(?:label|title|placeholder)=["'{]([^"'}]{2,60})/g)) labels.add(m[1].trim());
  for (const m of text.matchAll(/(?:validate[A-Za-z0-9_]+|is[A-Z][A-Za-z0-9_]*Valid)/g)) validations.add(m[0]);
  for (const m of text.matchAll(/from\s+['"]([^'"]+)['"]/g)) imports.add(m[1]);

  return { handlers, apis, labels, validations, imports };
}

function diffSets(head, current) {
  const missing = [...head].filter(x => !current.has(x)).sort();
  const added = [...current].filter(x => !head.has(x)).sort();
  return { missing, added };
}

for (const p of PAGES) {
  const head = headFile(p.page);
  const pageContent = readFile(p.page);
  const extracted = findExtracted(p.dir, p.prefix);
  const allCurrent = [pageContent, ...extracted.map(f => f.content)].filter(Boolean).join('\n');
  const headLines = lineCount(head);
  const pageLines = lineCount(pageContent);
  const extractedLines = extracted.reduce((s, f) => s + lineCount(f.content), 0);
  const totalLines = pageLines + extractedLines;

  const headSym = extractSymbols(head);
  const curSym = extractSymbols(allCurrent);

  const h = diffSets(headSym.handlers, curSym.handlers);
  const a = diffSets(headSym.apis, curSym.apis);
  const l = diffSets(headSym.labels, curSym.labels);
  const v = diffSets(headSym.validations, curSym.validations);

  const pct = headLines ? Math.round((totalLines / headLines) * 100) : 0;
  const missingHandlerCount = h.missing.length;
  const missingApiCount = a.missing.length;
  const missingLabelCount = l.missing.length;
  const missingValidationCount = v.missing.length;

  let status = 'PASS';
  if (!pageContent) status = 'FAIL';
  else if (missingApiCount > 0 || missingHandlerCount > 5) status = 'FAIL';
  else if (pct < 70 || missingHandlerCount > 0 || missingLabelCount > 3 || missingValidationCount > 0) status = 'WARN';
  else if (extracted.length === 0 && pageLines < headLines * 0.85) status = 'WARN';

  console.log(`\n${'='.repeat(60)}`);
  console.log(`${p.name}: ${status}`);
  console.log(`HEAD: ${headLines} | PAGE: ${pageLines} | EXTRACTED: ${extractedLines} (${extracted.length} files) | TOTAL: ${totalLines} (${pct}% of HEAD)`);
  if (extracted.length) console.log(`Extracted: ${extracted.map(f => f.path).join(', ')}`);
  if (!pageContent) console.log('FAIL: page file missing');
  if (missingApiCount) console.log(`MISSING APIs (${missingApiCount}): ${a.missing.join(', ')}`);
  if (missingHandlerCount) console.log(`MISSING handlers (${missingHandlerCount}): ${h.missing.slice(0, 20).join(', ')}${h.missing.length > 20 ? '...' : ''}`);
  if (missingValidationCount) console.log(`MISSING validations: ${v.missing.join(', ')}`);
  if (missingLabelCount > 0 && missingLabelCount <= 15) console.log(`MISSING labels (${missingLabelCount}): ${l.missing.join(', ')}`);
  else if (missingLabelCount > 15) console.log(`MISSING labels (${missingLabelCount}): ${l.missing.slice(0, 10).join(', ')}... (+${missingLabelCount - 10} more)`);

  // check imports resolve
  const importRe = /from\s+['"](\.\.?\/[^'"]+)['"]/g;
  const broken = [];
  for (const f of [{ path: p.page, content: pageContent }, ...extracted]) {
    if (!f.content) continue;
    let m;
    while ((m = importRe.exec(f.content))) {
      const base = path.dirname(path.join(ROOT, f.path));
      const targets = [m[1], m[1] + '.js', m[1] + '.jsx', path.join(m[1], 'index.js')];
      if (!targets.some(t => fs.existsSync(path.resolve(base, t)))) broken.push(`${f.path} -> ${m[1]}`);
    }
  }
  if (broken.length) {
    console.log(`BROKEN IMPORTS (${broken.length}): ${broken.slice(0, 8).join('; ')}`);
    if (status === 'PASS') status = 'FAIL';
  }
}

// broken import scan across audited module trees
import path from 'path';
const auditDirs = [...new Set(PAGES.map((p) => p.dir))];
const allBroken = [];
function scanBroken(filePath) {
  const content = readFile(filePath);
  if (!content) return;
  const base = path.dirname(path.join(ROOT, filePath));
  for (const m of content.matchAll(/from\s+['"](\.\.?\/[^'"]+)['"]/g)) {
    const rel = m[1];
    const targets = [rel, rel + '.js', rel + '.jsx', path.join(rel, 'index.js')];
    if (!targets.some((t) => fs.existsSync(path.resolve(base, t)))) {
      allBroken.push(`${filePath} -> ${rel}`);
    }
  }
}
function walk(dir) {
  if (!fs.existsSync(path.join(ROOT, dir))) return;
  for (const entry of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = `${dir}/${entry.name}`;
    if (entry.isDirectory()) walk(rel);
    else if (/\.(jsx?|tsx?)$/.test(entry.name)) scanBroken(rel);
  }
}
for (const d of auditDirs) walk(d);
console.log(`\n${'='.repeat(60)}`);
console.log(`BROKEN IMPORT SCAN: ${allBroken.length ? allBroken.join('\n') : 'none'}`);
