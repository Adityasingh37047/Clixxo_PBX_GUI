/**
 * Full connectivity audit for System Tools pages:
 * - HEAD vs current API usage
 * - page destructure vs hook return
 * - handlers wired to JSX (onClick/onChange/etc)
 * - factor completeness flags
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const base = path.join("src", "modules", "Maitenance", "System Tools");

const PAGES = [
  "Authorization",
  "IDSSettings",
  "DDOSSettings",
  "CertificateManage",
  "Radius",
  "SIPAccountGenerator",
  "ConfigFile",
  "Hosts",
  "SignalingCapture",
  "SignalingCallTest",
  "SignalingCallTrack",
  "ModificationRecord",
  "BackupUpload",
  "FactoryReset",
  "Upgrade",
  "DeviceLock",
  "Restart",
  "Licence",
  "SystemToolsSqlUpload",
  "LicenseLimits",
];

function gitShow(rel) {
  try {
    return execSync(`git show "HEAD:${rel.replace(/\\/g, "/")}"`, {
      encoding: "utf8",
      maxBuffer: 40e6,
      shell: true,
    });
  } catch {
    return null;
  }
}

function read(rel) {
  const p = path.join(base, rel);
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";
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
    cmds.add(m[1].slice(0, 80));
  }
  for (const m of src.matchAll(/cmd:\s*([A-Z_][A-Z0-9_.]*)/g)) {
    cmds.add(`CONST:${m[1]}`);
  }
  return [...cmds].sort();
}

function handlers(src) {
  const names = new Set();
  for (const m of src.matchAll(
    /(?:const|function)\s+(handle[A-Z]\w*|load[A-Z]\w*|fetch[A-Z]\w*|show[A-Z]\w*|refresh[A-Z]\w*|configure[A-Z]\w*|execute[A-Z]\w*|start[A-Z]\w*|stop[A-Z]\w*|clear[A-Z]\w*|begin[A-Z]\w*|initiate[A-Z]\w*)\s*=/g,
  )) {
    if (m[1] === "applyPressStyle" || m[1] === "clearPressStyle") continue;
    names.add(m[1]);
  }
  return [...names].sort();
}

function pageDestructure(pageSrc) {
  const m =
    pageSrc.match(/const\s*\{([\s\S]*?)\}\s*=\s*vm/) ||
    pageSrc.match(/const\s*\{([\s\S]*?)\}\s*=\s*use[A-Za-z]+Page\s*\(/);
  if (!m) {
    if (/<\{?\.\.\.vm\}?\s*\/>/.test(pageSrc) || /\{\.\.\.vm\}/.test(pageSrc)) {
      return ["__SPREAD_VM__"];
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

function handlerWiredInUi(name, uiSrc) {
  // onClick={handleX} or onClick={handleX} or onChange={handleX} or {...}
  const patterns = [
    new RegExp(`\\b${name}\\b`),
  ];
  return patterns.some((re) => re.test(uiSrc));
}

const results = [];

for (const pageName of PAGES) {
  const head = gitShow(`src/modules/Maitenance/System Tools/${pageName}.jsx`);
  const page = read(`${pageName}.jsx`);
  const hook = read(`hooks/use${pageName}Page.js`);
  const form = read(`components/${pageName}FormFields.jsx`);
  const helpers = read(`components/${pageName}TableHelpers.js`);
  const xform = read(`utils/${pageName}Transformers.js`);
  const val = read(`utils/${pageName}Validators.js`);
  const allCur = [page, hook, form, helpers, xform, val].join("\n");
  const ui = page + "\n" + form;

  const issues = [];

  // files
  for (const [label, content] of [
    ["page", page],
    ["hook", hook],
    ["form", form],
    ["helpers", helpers],
    ["transformers", xform],
    ["validators", val],
  ]) {
    if (!content) issues.push(`MISSING_${label.toUpperCase()}`);
  }

  // API
  const headApi = apiCalls(head || "");
  const curApi = apiCalls(allCur);
  const apiSame = JSON.stringify(headApi) === JSON.stringify(curApi);
  if (!apiSame) {
    issues.push(
      `API_DIFF HEAD=[${headApi.join(",")}] CUR=[${curApi.join(",")}]`,
    );
  }

  // cmds (for postLinuxCmd pages)
  const headCmds = linuxCmds(head || "");
  const curCmds = linuxCmds(allCur);
  // Only flag if HEAD had cmds and some are gone (CONST expansions may differ wording)
  if (headCmds.length && curCmds.length === 0 && headApi.includes("postLinuxCmd")) {
    issues.push("LINUX_CMDS_MISSING");
  }

  // factor shape
  const mainView = /MainView\s*=/.test(form);
  const hookBridge =
    hook.includes("ready") &&
    !/\buseState\b/.test(hook) &&
    hook.split("\n").length < 25;
  const formHasApi = apiCalls(form).length > 0;
  const formHasState = /\buseState\b/.test(form);
  const hookHasState = /\buseState\b/.test(hook);
  const localBtn = /const Btn\s*=/.test(page + form);
  const localC = /const C\s*=\s*\{/.test(page + form);

  if (localBtn) issues.push("LOCAL_BTN");
  if (localC) issues.push("LOCAL_C");
  if (mainView || hookBridge) issues.push("HALF_FACTOR_MAINVIEW_OR_STUB_HOOK");
  if (formHasApi && !hookHasState) issues.push("API_IN_FORMFIELDS_NOT_HOOK");

  // page <-> hook
  const destr = pageDestructure(page);
  const ret = returnBody(hook);
  if (destr.includes("__MAINVIEW_ONLY__") || destr.includes("__SPREAD_VM__")) {
    // MainView owns wiring — check handlers exist in form
  } else if (destr.length) {
    const missing = destr.filter(
      (k) => k !== "ready" && !new RegExp(`\\b${k}\\b`).test(ret),
    );
    if (missing.length) {
      issues.push(`PAGE_KEYS_NOT_IN_HOOK_RETURN: ${missing.join(",")}`);
    }
  } else if (!mainView && hookHasState) {
    issues.push("PAGE_NO_VM_DESTRUCTURE");
  }

  // handlers: HEAD vs current, and UI wiring
  const headH = handlers(head || "");
  const curH = handlers(hook + "\n" + form);
  const missingH = headH.filter((h) => !curH.includes(h));
  if (missingH.length) {
    issues.push(`HANDLERS_MISSING: ${missingH.join(",")}`);
  }

  // For complete pages: each returned handle* should appear in UI
  const handleFromHook = handlers(hook);
  const unwired = [];
  if (hookHasState && !mainView) {
    for (const h of handleFromHook) {
      if (!handlerWiredInUi(h, ui)) unwired.push(h);
    }
    // filter internal helpers rarely returned — only flag if in return body
    const reallyUnwired = unwired.filter((h) =>
      new RegExp(`\\b${h}\\b`).test(ret),
    );
    if (reallyUnwired.length) {
      issues.push(`HANDLERS_NOT_IN_UI: ${reallyUnwired.join(",")}`);
    }
  }

  // router still points to page
  const router = fs.readFileSync("src/router.jsx", "utf8");
  const importOk = new RegExp(
    `import\\s+${pageName}\\s+from\\s+["'].*${pageName}["']`,
  ).test(router);
  const routeOk =
    new RegExp(`<${pageName}\\s*/>`).test(router) ||
    new RegExp(`element:\\s*<${pageName}`).test(router);
  if (!importOk) issues.push("ROUTER_IMPORT_MISSING");
  if (!routeOk) issues.push("ROUTER_ELEMENT_MISSING");

  // common wiring
  if (!/extensionPageWrapStyle as /.test(helpers)) {
    issues.push("NO_COMMON_WRAP_ALIAS");
  }

  const status =
    issues.length === 0
      ? "OK"
      : issues.some((i) => i.startsWith("HALF_") || i.startsWith("API_IN_"))
        ? "WARN"
        : issues.some((i) => i.startsWith("API_DIFF") || i.startsWith("PAGE_KEYS") || i.startsWith("HANDLERS_NOT") || i.startsWith("ROUTER_"))
          ? "FAIL"
          : "WARN";

  results.push({
    page: pageName,
    status,
    apiSame,
    headApi,
    curApi,
    issues,
    mainView,
    hookBridge,
    pageLines: page.split("\n").length,
    hookLines: hook.split("\n").length,
  });
}

console.log("=== SYSTEM TOOLS CONNECTIVITY AUDIT ===\n");

let ok = 0,
  warn = 0,
  fail = 0;
for (const r of results) {
  if (r.status === "OK") ok++;
  else if (r.status === "WARN") warn++;
  else fail++;

  const api = r.apiSame ? "API_OK" : "API_BAD";
  console.log(
    `${r.page.padEnd(24)} ${r.status.padEnd(5)} ${api.padEnd(8)} api=[${r.curApi.join("|") || "none"}]`,
  );
  if (r.issues.length) {
    for (const i of r.issues) console.log(`  - ${i}`);
  }
}

console.log("\n--- SUMMARY ---");
console.log(`OK:   ${ok}`);
console.log(`WARN: ${warn}`);
console.log(`FAIL: ${fail}`);
console.log(`API same: ${results.filter((r) => r.apiSame).length}/20`);

const half = results.filter((r) =>
  r.issues.some((i) => i.includes("HALF_") || i.includes("API_IN_FORM")),
);
if (half.length) {
  console.log("\nNot fully connected via hook (logic/API still in FormFields):");
  for (const r of half) console.log(`  - ${r.page}`);
}

process.exit(fail ? 1 : 0);
