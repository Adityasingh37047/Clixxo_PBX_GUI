/**
 * Full-project sidebar UI common/shared audit (v2).
 * Checks every sidebar page top→bottom for shared Extension-style chrome.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const src = path.join(root, "src");

function read(f) {
  const p = path.join(root, f);
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";
}

function resolveRoutePaths(text) {
  const map = {};
  for (const m of text.matchAll(/(\w+):\s*['"]([^'"]+)['"]/g)) map[m[1]] = m[2];
  return map;
}

function parseSidebarOrdered(sidebarSrc, routeMap) {
  const lines = sidebarSrc.split("\n");
  const items = [];
  let section = "";
  let group = "";
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^\s{2}\{/.test(l) && lines[i + 1]?.includes('id: "')) {
      const t = lines[i + 2]?.match(/title:\s*"([^"]+)"/);
      if (t) {
        section = t[1];
        group = "";
      }
    }
    if (/^\s{6}\{/.test(l) && lines[i + 1]?.includes('id: "')) {
      const t = lines[i + 2]?.match(/title:\s*"([^"]+)"/);
      if (t) group = t[1];
    }
    if (/^\s{10}\{/.test(l)) {
      let title = "";
      let p = "";
      // Single-line leaves already contain title+path; stop once both found
      // so the next sibling object cannot overwrite this entry.
      for (let j = i; j < i + 8 && j < lines.length; j++) {
        const tm = lines[j].match(/title:\s*"([^"]+)"/);
        if (tm && !title) title = tm[1];
        const pm = lines[j].match(/path:\s*(?:ROUTE_PATHS\.(\w+)|"([^"]+)")/);
        if (pm && !p) p = pm[2] || routeMap[pm[1]] || "";
        if (title && p) break;
        if (/^\s{10}\},?\s*$/.test(lines[j]) && j > i) break;
      }
      if (title && p) items.push({ section, group, title, path: p });
    }
  }
  const seen = new Set();
  return items.filter((x) => {
    if (seen.has(x.path)) return false;
    seen.add(x.path);
    return true;
  });
}

function parseRouter(routerSrc, routeMap) {
  const imports = {};
  for (const m of routerSrc.matchAll(/import\s+(\w+)\s+from\s+["']\.\/([^"']+)["']/g)) {
    imports[m[1]] = m[2].replace(/\\/g, "/");
  }
  const routes = {};
  const re = /\{\s*path:\s*(?:ROUTE_PATHS\.(\w+)|"([^"]+)")[\s\S]*?element:\s*<(\w+)/g;
  let m;
  while ((m = re.exec(routerSrc))) {
    const p = m[2] || routeMap[m[1]];
    if (p) routes[p] = m[3];
  }
  return { imports, routes };
}

function collectModuleFiles(pageRel) {
  const files = new Set();
  const rel = pageRel.startsWith("src/") ? pageRel : `src/${pageRel}`;
  const pagePath = path.join(root, rel);
  if (!fs.existsSync(pagePath)) return [];
  files.add(rel);

  const dir = path.dirname(pagePath);
  const base = path.basename(rel).replace(/\.(jsx|js)$/, "");
  const dirRel = path.dirname(rel);

  for (const sub of ["hooks", "components", "utils"]) {
    const d = path.join(dir, sub);
    if (!fs.existsSync(d)) continue;
    for (const f of fs.readdirSync(d)) {
      files.add(`${dirRel}/${sub}/${f}`.replace(/\\/g, "/"));
    }
  }

  return [...files];
}

function auditModule(files) {
  const sources = files.map((f) => read(f));
  const all = sources.join("\n");
  const pageOnly = sources[0] || "";

  const importsCommon = /from\s+["'][^"']*components\/common["']/.test(all);
  const importsTokens = /from\s+["'][^"']*theme\/pbxTokens["']/.test(all);

  const shared = {
    btn: importsCommon && /\bimport\s*\{[^}]*\bBtn\b/.test(all),
    tokens: importsTokens,
    breadcrumb: /ExtensionBreadcrumb/.test(all),
    pageWrap: /extensionPageWrapStyle/.test(all),
    pageInner: /extensionPageInnerStyle/.test(all),
    card: /extensionCardStyle/.test(all),
    toolbar: /extensionToolbarStyle/.test(all),
    thFromCommon:
      importsCommon &&
      (/\bimport\s*\{[^}]*\bTH\b/.test(all) || /\bTH as \w+/.test(all)),
    tdFromCommon: importsCommon && /\btdStyle\b/.test(all),
    alert: /extensionFixedAlertSx/.test(all),
  };

  const dup = {
    localC: /\bconst C\s*=\s*\{/.test(all),
    localBtn: /\bconst Btn\s*=/.test(all) || /\bfunction Btn\s*\(/.test(all),
    localBreadManual:
      /<span>\s*&gt;\s*<\/span>/.test(all) && !/ExtensionBreadcrumb/.test(all),
    localTHDefined:
      (/export const \w+TH\s*=\s*\(\{/.test(all) ||
        (/const TH\s*=\s*\(\{/.test(all) && !shared.thFromCommon)),
    localPageWrapOnly:
      /\b(?:const|export const)\s+\w*PageWrapStyle\s*=\s*\{/.test(all) &&
      !shared.pageWrap,
  };

  const factored = files.some((f) => /hooks\/use\w+Page\.js$/.test(f));
  const pageLines = pageOnly ? pageOnly.split("\n").length : 0;

  const issues = [];
  if (!shared.btn) issues.push("no-common-Btn");
  if (!shared.tokens) issues.push("no-pbxTokens");
  if (!shared.breadcrumb) issues.push("no-ExtensionBreadcrumb");
  if (!shared.pageWrap) issues.push("no-extensionPageWrapStyle");
  if (dup.localC) issues.push("local-C");
  if (dup.localBtn) issues.push("local-Btn");
  if (dup.localBreadManual) issues.push("local-breadcrumb-HTML");
  if (dup.localTHDefined) issues.push("local-TH-defined");
  if (dup.localPageWrapOnly) issues.push("local-pageWrap");

  const chromeScore =
    (shared.btn ? 1 : 0) +
    (shared.tokens ? 1 : 0) +
    (shared.breadcrumb ? 1 : 0) +
    (shared.pageWrap ? 1 : 0) +
    (shared.thFromCommon || !/\bTH\b/.test(pageOnly) ? 1 : 0);

  const dupCount =
    (dup.localC ? 1 : 0) +
    (dup.localBtn ? 1 : 0) +
    (dup.localBreadManual ? 1 : 0) +
    (dup.localTHDefined ? 1 : 0) +
    (dup.localPageWrapOnly ? 1 : 0);

  let status;
  if (chromeScore >= 4 && dupCount === 0) status = "SHARED OK";
  else if (chromeScore >= 3 && dupCount <= 1) status = "PARTIAL";
  else if (shared.btn || shared.tokens || factored) status = "PARTIAL";
  else status = "LEGACY";

  // Extensions = reference baseline
  if (files[0]?.includes("PBX/Extensions/Extensions.")) status = "REFERENCE";

  return { shared, dup, factored, pageLines, status, issues, chromeScore, dupCount };
}

// --- run ---
const routeMap = resolveRoutePaths(read("src/constants/routeConstants.jsx"));
routeMap.USER_MANAGE = "/user-manage/users";

const sidebarItems = parseSidebarOrdered(
  read("src/constants/sidebarConstants.jsx"),
  routeMap,
);
const { imports, routes } = parseRouter(read("src/router.jsx"), routeMap);

const results = [];
for (let i = 0; i < sidebarItems.length; i++) {
  const item = sidebarItems[i];
  const comp = routes[item.path];
  const imp = comp ? imports[comp] : null;
  let file = imp ? `src/${imp}.jsx` : null;
  if (file && !fs.existsSync(path.join(root, file))) {
    const alt = `src/${imp}.js`;
    file = fs.existsSync(path.join(root, alt)) ? alt : null;
  }

  if (!comp || !file) {
    results.push({
      n: i + 1,
      ...item,
      compName: comp || "?",
      status: "NO_ROUTE",
      issues: ["router-missing"],
      pageLines: 0,
      factored: false,
    });
    continue;
  }

  // Auth/route gates import the real page — audit that module instead of the gate.
  const gateSrc = read(file);
  const pageImport = gateSrc.match(
    /import\s+(\w+)\s+from\s+["']\.\.\/modules\/([^"']+)["']/,
  );
  if (pageImport && /RouteGate|Gate$/.test(comp)) {
    const pageRel = `modules/${pageImport[2]}`.replace(/\\/g, "/");
    const pageFileJsx = `src/${pageRel}.jsx`;
    const pageFileJs = `src/${pageRel}.js`;
    if (fs.existsSync(path.join(root, pageFileJsx))) file = pageFileJsx;
    else if (fs.existsSync(path.join(root, pageFileJs))) file = pageFileJs;
  }

  const rel = file.replace(/^src\//, "");
  const moduleFiles = collectModuleFiles(rel);
  const audit = auditModule(moduleFiles);

  results.push({
    n: i + 1,
    ...item,
    compName: comp,
    file: rel,
    moduleFiles: moduleFiles.length,
    ...audit,
  });
}

// Summary by section
const bySection = {};
for (const r of results) {
  if (!bySection[r.section]) bySection[r.section] = { ok: 0, partial: 0, legacy: 0, total: 0 };
  bySection[r.section].total++;
  if (r.status === "SHARED OK" || r.status === "REFERENCE") bySection[r.section].ok++;
  else if (r.status === "PARTIAL") bySection[r.section].partial++;
  else bySection[r.section].legacy++;
}

const counts = { ok: 0, partial: 0, legacy: 0, noRoute: 0 };
for (const r of results) {
  if (r.status === "SHARED OK") counts.ok++;
  else if (r.status === "REFERENCE") counts.ok++;
  else if (r.status === "PARTIAL") counts.partial++;
  else if (r.status === "NO_ROUTE") counts.noRoute++;
  else counts.legacy++;
}

console.log("=== FULL PROJECT COMMON UI AUDIT v2 ===");
console.log("Sidebar order: Status → ... → User Manage\n");
console.log(
  "Legend: SHARED OK = Btn + pbxTokens + ExtensionBreadcrumb + extensionPageWrapStyle + no dup",
);
console.log(
  "        PARTIAL = uses some shared but local dup remains",
);
console.log("        LEGACY  = mostly inline/old pattern\n");

for (const r of results) {
  const sh = [];
  if (r.shared?.btn) sh.push("Btn");
  if (r.shared?.tokens) sh.push("tokens");
  if (r.shared?.breadcrumb) sh.push("Bread");
  if (r.shared?.pageWrap) sh.push("Wrap");
  if (r.shared?.thFromCommon) sh.push("TH");
  if (r.factored) sh.push("hook");

  console.log(
    `${String(r.n).padStart(3)}. [${(r.status || "?").padEnd(10)}] ${r.section} > ${r.group} > ${r.title}`,
  );
  console.log(
    `     ${r.compName || "?"} | ${r.pageLines || "?"}L | ${r.factored ? "factored" : "monolith"} | shared: ${sh.join(", ") || "none"}`,
  );
  if (r.issues?.length) console.log(`     issues: ${r.issues.join(", ")}`);
}

console.log("\n=== SECTION SUMMARY ===");
for (const [sec, c] of Object.entries(bySection)) {
  console.log(
    `${sec.padEnd(14)} total=${c.total}  SHARED OK=${c.ok}  PARTIAL=${c.partial}  LEGACY/NO=${c.legacy}`,
  );
}

console.log("\n=== GRAND TOTAL ===");
console.log(`Pages audited:     ${results.length}`);
console.log(`SHARED OK (+REF):  ${counts.ok}`);
console.log(`PARTIAL:           ${counts.partial}`);
console.log(`LEGACY / NO_ROUTE: ${counts.legacy + counts.noRoute}`);

const topIssues = {};
for (const r of results) {
  for (const iss of r.issues || []) {
    topIssues[iss] = (topIssues[iss] || 0) + 1;
  }
}
console.log("\n=== TOP DUPLICATE ISSUES (count) ===");
for (const [k, v] of Object.entries(topIssues).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${v}x  ${k}`);
}

fs.writeFileSync(
  path.join(root, "scripts", "audit-project-common-ui-report.json"),
  JSON.stringify({ generated: new Date().toISOString(), results, counts, bySection, topIssues }, null, 2),
);

process.exit(0);
