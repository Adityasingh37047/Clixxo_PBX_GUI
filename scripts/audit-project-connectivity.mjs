/**
 * Full-project API / wiring connectivity audit.
 * Walks every sidebar leaf (same order as common-UI audit) and checks:
 * - router → page file
 * - factored files (hook / FormFields / TableHelpers)
 * - HEAD vs current apiService usage (module-wide)
 * - page destructure keys vs hook return
 * - returned handlers appear in page/FormFields UI
 * - APIs not left in page when hook owns them
 * - linux cmd strings retained when postLinuxCmd is used
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function read(f) {
  const p = path.isAbsolute(f) ? f : path.join(root, f);
  if (!fs.existsSync(p)) {
    const alt = p.replace(/\.js$/, ".jsx");
    if (alt !== p && fs.existsSync(alt)) return fs.readFileSync(alt, "utf8");
    const alt2 = p.replace(/\.jsx$/, ".js");
    if (alt2 !== p && fs.existsSync(alt2)) return fs.readFileSync(alt2, "utf8");
    return "";
  }
  return fs.readFileSync(p, "utf8");
}

function existsRel(rel) {
  const p = path.join(root, rel);
  if (fs.existsSync(p)) return rel;
  const alt = rel.replace(/\.js$/, ".jsx");
  if (alt !== rel && fs.existsSync(path.join(root, alt))) return alt;
  const alt2 = rel.replace(/\.jsx$/, ".js");
  if (alt2 !== rel && fs.existsSync(path.join(root, alt2))) return alt2;
  return null;
}

const gitCache = new Map();
function gitShow(rel) {
  const key = rel.replace(/\\/g, "/");
  if (gitCache.has(key)) return gitCache.get(key);
  try {
    const out = execSync(`git show "HEAD:${key}"`, {
      encoding: "utf8",
      maxBuffer: 40e6,
      shell: true,
      cwd: root,
    });
    gitCache.set(key, out);
    return out;
  } catch {
    gitCache.set(key, null);
    return null;
  }
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
  for (const m of routerSrc.matchAll(
    /import\s+(\w+)\s+from\s+["']\.\/([^"']+)["']/g,
  )) {
    imports[m[1]] = m[2].replace(/\\/g, "/");
  }
  const routes = {};
  const re =
    /\{\s*path:\s*(?:ROUTE_PATHS\.(\w+)|"([^"]+)")[\s\S]*?element:\s*<(\w+)/g;
  let m;
  while ((m = re.exec(routerSrc))) {
    const p = m[2] || routeMap[m[1]];
    if (p) routes[p] = m[3];
  }
  return { imports, routes };
}

function collectModuleFiles(pageRel) {
  const files = [];
  const rel = pageRel.startsWith("src/") ? pageRel : `src/${pageRel}`;
  const pagePath = path.join(root, rel);
  if (!fs.existsSync(pagePath)) return [];
  files.push(rel);

  const dir = path.dirname(pagePath);
  const dirRel = path.dirname(rel).replace(/\\/g, "/");
  const pageBase = path.basename(rel).replace(/\.(jsx|js)$/, "");
  const stem = pageBase.replace(/Page$/i, "");
  const stemNoPrefix = stem
    .replace(/^Fxs/i, "")
    .replace(/^E1Pri/i, "")
    .replace(/^Pcm/i, "")
    .replace(/^SystemTools/i, "");

  const pageSrc = read(rel);
  const imported = new Set();
  for (const m of pageSrc.matchAll(
    /from\s+["']\.\/(hooks|components|utils)\/([^"']+)["']/g,
  )) {
    imported.add(`${m[1]}/${m[2]}`.replace(/\\/g, "/"));
  }

  for (const sub of ["hooks", "components", "utils"]) {
    const d = path.join(dir, sub);
    if (!fs.existsSync(d)) continue;
    for (const f of fs.readdirSync(d)) {
      if (!/\.(jsx?|tsx?)$/.test(f)) continue;
      const name = f.replace(/\.(jsx|js|tsx|ts)$/, "");
      const relSub = `${sub}/${name}`;
      const own =
        imported.has(relSub) ||
        imported.has(`${relSub}.js`) ||
        imported.has(`${relSub}.jsx`) ||
        name.includes(pageBase) ||
        name.includes(stem) ||
        (stemNoPrefix.length > 4 && name.includes(stemNoPrefix)) ||
        (stemNoPrefix.length > 6 &&
          name.includes(stemNoPrefix.slice(0, Math.min(stemNoPrefix.length, 16))));
      if (!own) continue;
      files.push(`${dirRel}/${sub}/${f}`.replace(/\\/g, "/"));
    }
  }
  return [...new Set(files)];
}

function apiCalls(src) {
  const names = new Set();
  if (!src) return [];
  for (const m of src.matchAll(
    /import\s*\{([^}]+)\}\s*from\s*["'][^"']*apiService["']/g,
  )) {
    for (const part of m[1].split(",")) {
      const t = part.trim();
      if (!t) continue;
      const asM = t.match(/^(.+?)\s+as\s+(.+)$/);
      const name = asM ? asM[2].trim() : t;
      if (new RegExp(`\\b${name}\\s*\\(`).test(src)) names.add(name);
    }
  }
  if (/axiosInstance\.(get|post|put|delete)\s*\(/.test(src)) {
    names.add("axiosInstance");
  }
  return [...names].sort();
}

function linuxCmds(src) {
  const cmds = new Set();
  for (const m of src.matchAll(/cmd:\s*[`'"]([^`'"]+)[`'"]/g)) {
    cmds.add(m[1].slice(0, 100));
  }
  return [...cmds].sort();
}

function handlers(src) {
  const names = new Set();
  for (const m of src.matchAll(
    /(?:const|function)\s+(handle[A-Z]\w*|load[A-Z]\w*|fetch[A-Z]\w*|open[A-Z]\w*|close[A-Z]\w*|clear[A-Z]\w*|refresh[A-Z]\w*|start[A-Z]\w*|stop[A-Z]\w*|execute[A-Z]\w*|configure[A-Z]\w*|begin[A-Z]\w*|initiate[A-Z]\w*)\s*=/g,
  )) {
    if (m[1] === "applyPressStyle" || m[1] === "clearPressStyle") continue;
    names.add(m[1]);
  }
  return [...names].sort();
}

function pageDestructure(pageSrc) {
  const m =
    pageSrc.match(/const\s*\{([\s\S]*?)\}\s*=\s*vm\b/) ||
    pageSrc.match(/const\s*\{([\s\S]*?)\}\s*=\s*use[A-Za-z0-9_]+Page\s*\(/);
  if (!m) {
    if (/\{\.\.\.vm\}/.test(pageSrc) || /<\w+[^>]*\{\.\.\.vm\}/.test(pageSrc)) {
      return ["__SPREAD_VM__"];
    }
    // const page = useXPage(); ... <Foo {...page} />
    const asVar = pageSrc.match(
      /const\s+(\w+)\s*=\s*use[A-Za-z0-9_]+Page\s*\(/,
    );
    if (asVar && new RegExp(`\\{\\.\\.\\.${asVar[1]}\\}`).test(pageSrc)) {
      return ["__SPREAD_HOOK_VAR__"];
    }
    if (/MainView\s*\/>/.test(pageSrc) && !/=\s*vm/.test(pageSrc)) {
      return ["__MAINVIEW_ONLY__"];
    }
    return [];
  }
  return m[1]
    .split(",")
    .map((s) =>
      s
        .trim()
        .replace(/\/\/.*$/, "")
        .split("=")[0]
        .trim()
        .split(":")[0]
        .trim(),
    )
    .filter((s) => s && /^[A-Za-z_]/.test(s));
}

function returnBody(hookSrc) {
  const idx = hookSrc.lastIndexOf("return {");
  if (idx < 0) return "";
  return hookSrc.slice(idx);
}

function findHookFile(moduleFiles, pageBase, pageSrc) {
  const fromImport = pageSrc.match(
    /from\s+["']\.\/hooks\/(use\w+Page)["']/,
  );
  if (fromImport) {
    const hit = moduleFiles.find(
      (f) =>
        f.endsWith(`/hooks/${fromImport[1]}.js`) ||
        f.endsWith(`/hooks/${fromImport[1]}.jsx`),
    );
    if (hit) return hit;
  }
  const bases = [
    pageBase,
    pageBase.replace(/Page$/, ""),
    pageBase.replace(/^SystemTools/, ""),
  ];
  for (const b of bases) {
    const names = [`use${b}Page`, `use${b}`];
    for (const name of names) {
      const hit = moduleFiles.find((f) =>
        f.match(new RegExp(`/hooks/${name}\\.(js|jsx)$`)),
      );
      if (hit) return hit;
    }
  }
  // Do NOT fall back to an unrelated shared sibling hook in the same folder
  return null;
}

function findSibling(moduleFiles, pageBase, kind) {
  const folder =
    kind === "FormFields" || kind === "TableHelpers" ? "components" : "utils";
  const bases = [
    pageBase,
    pageBase.replace(/Page$/, ""),
    pageBase.replace(/^SystemTools/, ""),
    pageBase.replace(/^Fxs/, ""),
    pageBase.replace(/^E1Pri/, ""),
    pageBase.replace(/^Pcm/, ""),
  ];
  for (const b of bases) {
    const hit = moduleFiles.find((f) =>
      f.match(new RegExp(`/${folder}/${b}${kind}\\.(js|jsx)$`)),
    );
    if (hit) return hit;
  }
  return null;
}

function classifyIssues(issues) {
  const failish = issues.some(
    (i) =>
      i.startsWith("API_DIFF") ||
      i.startsWith("API_CALL_MISSING") ||
      i.startsWith("API_STILL_IN_PAGE") ||
      i.startsWith("PAGE_KEYS") ||
      i.startsWith("HANDLERS_MISSING") ||
      i.startsWith("ROUTER_") ||
      i.startsWith("LINUX_CMDS_MISSING") ||
      i.startsWith("LINUX_CMDS_LOST") ||
      i === "MISSING_PAGE" ||
      i === "MISSING_HOOK",
  );
  const warnish = issues.some(
    (i) =>
      i.startsWith("HALF_") ||
      i.startsWith("LOCAL_") ||
      i.startsWith("MISSING_FORM") ||
      i.startsWith("MISSING_HELPERS") ||
      i.startsWith("MISSING_TRANSFORMERS") ||
      i.startsWith("MISSING_VALIDATORS") ||
      i.startsWith("API_IN_FORMFIELDS") ||
      i.startsWith("API_ADDED") ||
      i.startsWith("API_REFACTORED") ||
      i.startsWith("NO_HEAD") ||
      i.startsWith("PAGE_NO_HOOK") ||
      i.startsWith("INCOMPLETE_FACTOR") ||
      i.startsWith("MONOLITH_API") ||
      i.startsWith("HANDLERS_NOT_IN_UI"),
  );
  if (failish) return "FAIL";
  if (warnish || issues.length) return "WARN";
  return "OK";
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
  const issues = [];
  let comp = routes[item.path];
  let imp = comp ? imports[comp] : null;
  let file = imp ? `src/${imp}.jsx` : null;
  if (file && !fs.existsSync(path.join(root, file))) {
    const alt = `src/${imp}.js`;
    file = fs.existsSync(path.join(root, alt)) ? alt : null;
  }

  if (!comp || !file) {
    results.push({
      n: i + 1,
      ...item,
      status: "FAIL",
      issues: ["ROUTER_MISSING"],
      curApi: [],
      headApi: [],
      apiSame: false,
      factored: false,
      pageLines: 0,
      hookLines: 0,
      file: null,
      compName: comp || "?",
    });
    continue;
  }

  // Follow auth/route gates to the real page module
  const gateSrc = read(file);
  const pageImport = gateSrc.match(
    /import\s+(\w+)\s+from\s+["']\.\.\/modules\/([^"']+)["']/,
  );
  if (pageImport && /RouteGate|Gate$/.test(comp)) {
    const pageRel = `modules/${pageImport[2]}`.replace(/\\/g, "/");
    const pageFile =
      existsRel(`src/${pageRel}.jsx`) || existsRel(`src/${pageRel}.js`);
    if (pageFile) {
      file = pageFile;
      comp = pageImport[1];
    }
  }

  const rel = file.replace(/^src\//, "").replace(/\\/g, "/");
  const pageBase = path.basename(rel).replace(/\.(jsx|js)$/, "");
  const moduleFiles = collectModuleFiles(rel);
  const page = read(file);
  const hookRel = findHookFile(moduleFiles, pageBase, page);
  const hookSrc = hookRel ? read(hookRel) : "";
  const formRel = findSibling(moduleFiles, pageBase, "FormFields");
  const helpersRel = findSibling(moduleFiles, pageBase, "TableHelpers");
  const xformRel = findSibling(moduleFiles, pageBase, "Transformers");
  const valRel = findSibling(moduleFiles, pageBase, "Validators");
  const form = formRel ? read(formRel) : "";
  const helpers = helpersRel ? read(helpersRel) : "";
  const xform = xformRel ? read(xformRel) : "";
  const val = valRel ? read(valRel) : "";
  // API scan: entire module folder (sibling hooks like *StatsPage share APIs)
  const allModuleSrc = moduleFiles.map((f) => read(f)).join("\n");
  const allCur = [page, hookSrc, form, helpers, xform, val].join("\n");
  // Handlers may be wired in FormFields OR TableHelpers (checkboxes, toolbar)
  const ui = page + "\n" + form + "\n" + helpers;

  if (!page) issues.push("MISSING_PAGE");
  if (!hookSrc) {
    if (apiCalls(page).length || /\buseState\b/.test(page)) {
      issues.push("INCOMPLETE_FACTOR_NO_HOOK");
    } else {
      issues.push("MISSING_HOOK");
    }
  }
  if (!form) issues.push("MISSING_FORMFIELDS");
  if (!helpers) issues.push("MISSING_HELPERS");
  if (!xform) issues.push("MISSING_TRANSFORMERS");
  if (!val) issues.push("MISSING_VALIDATORS");

  // HEAD: prefer page file; if empty, skip parity
  const headPage = gitShow(`src/${rel}`);
  let headApi = [];
  let curApi = apiCalls(allModuleSrc);
  let apiSame = true;
  if (headPage == null) {
    // Newly added file — compare nothing
    issues.push("NO_HEAD_BASELINE");
  } else {
    // Include HEAD siblings if they existed (hooks etc may have been empty at HEAD)
    const headAll = [headPage];
    // Prefer HEAD of hooks (and this page's exact form/helpers) — skip foreign
    // shared siblings that belong to other pages in the same folder.
    const headTargets = new Set();
    for (const f of moduleFiles) {
      const norm = f.replace(/^src\//, "");
      if (norm === rel) continue;
      const base = path.basename(norm).replace(/\.(jsx|js)$/, "");
      const isHook = /\/hooks\//.test(norm);
      const own =
        base.includes(pageBase) ||
        pageBase.includes(base.replace(/^use/, "").replace(/Page$/, "")) ||
        (hookRel && norm === hookRel.replace(/^src\//, "")) ||
        (formRel && norm === formRel.replace(/^src\//, "")) ||
        (helpersRel && norm === helpersRel.replace(/^src\//, "")) ||
        (xformRel && norm === xformRel.replace(/^src\//, "")) ||
        (valRel && norm === valRel.replace(/^src\//, ""));
      // Always include sibling hooks that share the page stem (e.g. ActiveCallQueueStats)
      const relatedHook =
        isHook &&
        (base.includes(pageBase.replace(/Page$/, "")) ||
          pageBase.replace(/Page$/, "").length > 4 &&
            base.includes(pageBase.replace(/Page$/, "").slice(0, 12)));
      if (own || relatedHook) headTargets.add(f.startsWith("src/") ? f : `src/${f}`);
    }
    for (const f of headTargets) {
      const h = gitShow(f);
      if (h) headAll.push(h);
    }
    headApi = apiCalls(headAll.join("\n"));
    // If HEAD was monolithic, APIs only in page; current in hook — sets should match
    apiSame = JSON.stringify(headApi) === JSON.stringify(curApi);
    if (!apiSame) {
      const lost = headApi.filter((a) => !curApi.includes(a));
      const added = curApi.filter((a) => !headApi.includes(a));
      // Additions alone (wrappers → named APIs, extra postLinuxCmd) are not regressions
      const lostReal = lost.filter((a) => a !== "axiosInstance");
      const axiosOnly =
        lost.includes("axiosInstance") &&
        lostReal.length === 0 &&
        added.length > 0;
      if (axiosOnly) {
        issues.push(
          `API_REFACTORED axios→named: added=[${added.join(",")}]`,
        );
      } else if (lostReal.length) {
        issues.push(
          `API_DIFF lost=[${lostReal.join(",")}] added=[${added.join(",")}]`,
        );
      } else if (added.length) {
        issues.push(`API_ADDED: ${added.join(",")}`);
      }
    }

    if (headApi.includes("postLinuxCmd")) {
      const headCmds = linuxCmds(headAll.join("\n"));
      const curCmds = linuxCmds(allCur);
      if (headCmds.length && curCmds.length === 0) {
        issues.push("LINUX_CMDS_MISSING");
      } else {
        const lostCmds = headCmds.filter((c) => !curCmds.includes(c));
        if (lostCmds.length) {
          issues.push(`LINUX_CMDS_LOST: ${lostCmds.slice(0, 5).join(" | ")}`);
        }
      }
    }
  }

  const mainView = /MainView\s*=/.test(form) || /MainView\s*\/>/.test(page);
  const hookBridge =
    !!hookSrc &&
    hookSrc.includes("ready") &&
    !/\buseState\b/.test(hookSrc) &&
    hookSrc.split("\n").length < 30;
  const formHasApi = apiCalls(form).length > 0;
  const hookHasState = /\buseState\b/.test(hookSrc);
  const localBtn =
    /\bconst Btn\s*=/.test(page + form) || /\bfunction Btn\s*\(/.test(page + form);
  const localC = /\bconst C\s*=\s*\{/.test(page + form);

  if (localBtn) issues.push("LOCAL_BTN");
  if (localC) issues.push("LOCAL_C");
  if (mainView || hookBridge) issues.push("HALF_FACTOR_MAINVIEW_OR_STUB_HOOK");
  if (formHasApi && !hookHasState) issues.push("API_IN_FORMFIELDS_NOT_HOOK");

  const pageApis = apiCalls(page);
  if (pageApis.length && hookHasState) {
    issues.push(`API_STILL_IN_PAGE: ${pageApis.join(",")}`);
  } else if (pageApis.length && !hookSrc) {
    issues.push(`MONOLITH_API_IN_PAGE: ${pageApis.join(",")}`);
  }

  const destr = pageDestructure(page);
  const ret = returnBody(hookSrc);
  if (
    destr.includes("__MAINVIEW_ONLY__") ||
    destr.includes("__SPREAD_VM__") ||
    destr.includes("__SPREAD_HOOK_VAR__")
  ) {
    // MainView / spread owns wiring
  } else if (destr.length && hookSrc) {
    const missing = destr.filter(
      (k) => k !== "ready" && !new RegExp(`\\b${k}\\b`).test(ret),
    );
    if (missing.length) {
      issues.push(`PAGE_KEYS_NOT_IN_HOOK_RETURN: ${missing.join(",")}`);
    }
  } else if (hookHasState && !mainView) {
    issues.push("PAGE_NO_HOOK_DESTRUCTURE");
  }

  const headH = handlers(headPage || "");
  const curH = handlers(hookSrc + "\n" + form + "\n" + page + "\n" + helpers);
  const isNoiseHandler = (h) =>
    /Hover$|IconHover$|^handleNext$|^handlePrev$|^handleCheckAll$|^handleUncheckAll$|^handleInverse$|^handleClearAll$|^handleSelectRow$|^handleToggleAll$|^handleToggleRow$|^handleCheckAllRows$|^handleUncheckAllRows$/.test(
      h,
    );
  if (headPage) {
    const missingH = headH.filter(
      (h) => !curH.includes(h) && !isNoiseHandler(h),
    );
    if (missingH.length >= 3) {
      issues.push(`HANDLERS_MISSING: ${missingH.slice(0, 8).join(",")}`);
    }
  }

  if (hookHasState && !mainView && ret) {
    const handleFromHook = handlers(hookSrc).filter((h) =>
      new RegExp(`\\b${h}\\b`).test(ret),
    );
    // Spread to FormFields: <Foo {...vm} /> or props bag — treat as wired
    const spreadWired =
      /\{\.\.\.vm\}/.test(ui) ||
      /\{\.\.\.props\}/.test(ui) ||
      new RegExp(
        `<\\w+[\\s\\S]{0,200}\\{\\.\\.\\.(?:vm|${pageBase.replace(/Page$/, "")}\\w*)\\}`,
      ).test(ui);

    const userFacing = handleFromHook.filter(
      (h) =>
        /^(handle|open|close|load|refresh|start|stop|execute|configure)/.test(
          h,
        ) &&
        !isNoiseHandler(h) &&
        !new RegExp(`\\b${h}\\b`).test(ui),
    );
    const reallyUnwired = userFacing.filter((h) => {
      if (spreadWired) return false;
      // Internal helpers invoked from the hook itself (effects / other handlers)
      if (/^load|^fetch|^configure|^execute|^handleSe|^handleRemove/.test(h)) {
        const calls = (
          hookSrc.match(new RegExp(`\\b${h}\\s*\\(`, "g")) || []
        ).length;
        if (calls >= 1) return false;
      }
      // Returned but also invoked from another returned handler in the same hook
      const calls = (
        hookSrc.match(new RegExp(`\\b${h}\\s*\\(`, "g")) || []
      ).length;
      if (calls >= 1 && /^(handleReset|handleRefresh|handlePcm0|configure|execute)/.test(h)) {
        return false;
      }
      return true;
    });
    if (reallyUnwired.length) {
      issues.push(`HANDLERS_NOT_IN_UI: ${reallyUnwired.join(",")}`);
    }
  }

  // IGNORE_AFTER_FACTOR_NOISE: API additions/refactors are not regressions
  const issuesOut = issues.filter(
    (i) => !i.startsWith("API_ADDED") && !i.startsWith("API_REFACTORED"),
  );
  const status = classifyIssues(issuesOut);
  results.push({
    n: i + 1,
    ...item,
    compName: comp,
    file: rel,
    status,
    issues: issuesOut,
    apiSame,
    headApi,
    curApi,
    factored: !!hookSrc,
    pageLines: page ? page.split("\n").length : 0,
    hookLines: hookSrc ? hookSrc.split("\n").length : 0,
    mainView: !!mainView,
    hookBridge: !!hookBridge,
  });
}

const counts = { ok: 0, warn: 0, fail: 0 };
const bySection = {};
for (const r of results) {
  counts[r.status.toLowerCase()]++;
  if (!bySection[r.section]) {
    bySection[r.section] = { total: 0, ok: 0, warn: 0, fail: 0 };
  }
  bySection[r.section].total++;
  bySection[r.section][r.status.toLowerCase()]++;
}

const issueFreq = {};
for (const r of results) {
  for (const i of r.issues) {
    const key = i.split(":")[0].split(" ")[0];
    issueFreq[key] = (issueFreq[key] || 0) + 1;
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  counts,
  bySection,
  issueFreq,
  results,
};

fs.writeFileSync(
  path.join(root, "scripts/audit-project-connectivity-report.json"),
  JSON.stringify(report, null, 2),
);

console.log("=== FULL PROJECT API / WIRING CONNECTIVITY AUDIT ===\n");

for (const r of results) {
  const tag =
    r.status === "OK" ? "OK  " : r.status === "WARN" ? "WARN" : "FAIL";
  const api =
    r.headApi.length || r.curApi.length
      ? r.apiSame
        ? "API=SAME"
        : "API=DIFF"
      : "API=none";
  console.log(
    `${String(r.n).padStart(3)}. [${tag}] ${r.section} > ${r.group} > ${r.title}`,
  );
  console.log(
    `     ${r.compName} | ${r.pageLines}L page / ${r.hookLines}L hook | ${api} | APIs: ${r.curApi.join(", ") || "(none)"}`,
  );
  if (r.issues.length) {
    for (const iss of r.issues.slice(0, 8)) console.log(`     - ${iss}`);
    if (r.issues.length > 8) console.log(`     - … +${r.issues.length - 8} more`);
  }
}

console.log("\n=== SECTION SUMMARY ===");
for (const [s, c] of Object.entries(bySection)) {
  console.log(
    `${s.padEnd(14)} total=${c.total}  OK=${c.ok}  WARN=${c.warn}  FAIL=${c.fail}`,
  );
}

console.log("\n=== GRAND TOTAL ===");
console.log(`Pages audited: ${results.length}`);
console.log(`OK:   ${counts.ok}`);
console.log(`WARN: ${counts.warn}`);
console.log(`FAIL: ${counts.fail}`);
console.log(
  `API parity (SAME): ${results.filter((r) => r.apiSame && !r.issues.includes("NO_HEAD_BASELINE")).length}`,
);

console.log("\n=== TOP ISSUE KEYS ===");
Object.entries(issueFreq)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 15)
  .forEach(([k, v]) => console.log(`  ${String(v).padStart(3)}x  ${k}`));

console.log("\nReport: scripts/audit-project-connectivity-report.json");
process.exit(counts.fail ? 1 : 0);
