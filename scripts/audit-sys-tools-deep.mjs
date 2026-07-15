/**
 * Deep audit: System Tools — API parity + factor completeness.
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
  if (!fs.existsSync(p)) return null;
  return fs.readFileSync(p, "utf8");
}

function apiCalls(src) {
  if (!src) return [];
  const names = new Set();
  for (const m of src.matchAll(
    /import\s*\{([^}]+)\}\s*from\s*["'][^"']*apiService["']/g,
  )) {
    for (const p of m[1].split(",")) {
      const t = p.trim();
      if (!t) continue;
      const asM = t.match(/^(.+?)\s+as\s+(.+)$/);
      const name = asM ? asM[2].trim() : t;
      if (new RegExp(`\\b${name}\\s*\\(`).test(src)) names.add(name);
    }
  }
  if (/axiosInstance\.(get|post|put|delete)\s*\(/.test(src)) {
    names.add("axiosInstance");
  }
  if (/\bfetch\s*\(/.test(src) && /credentials:\s*["']include["']/.test(src)) {
    names.add("fetch(ping)");
  }
  return [...names].sort();
}

function handlers(src) {
  if (!src) return [];
  const names = new Set();
  for (const m of src.matchAll(
    /(?:const|function)\s+(handle[A-Z]\w*|load[A-Z]\w*|fetch[A-Z]\w*|show[A-Z]\w*|refresh[A-Z]\w*|apply[A-Z]\w*|configure[A-Z]\w*|execute[A-Z]\w*|remove[A-Z]\w*|simulate[A-Z]\w*|start[A-Z]\w*|stop[A-Z]\w*|clear[A-Z]\w*|begin[A-Z]\w*|initiate[A-Z]\w*|check[A-Z]\w*)\s*=/g,
  )) {
    if (m[1] === "applyPressStyle") continue;
    names.add(m[1]);
  }
  return [...names].sort();
}

function factorStatus(pageName) {
  const page = read(`${pageName}.jsx`) || "";
  const hook = read(`hooks/use${pageName}Page.js`) || "";
  const form = read(`components/${pageName}FormFields.jsx`) || "";
  const helpers = read(`components/${pageName}TableHelpers.js`) || "";
  const xform = read(`utils/${pageName}Transformers.js`) || "";
  const val = read(`utils/${pageName}Validators.js`) || "";

  const files = {
    page: !!page,
    hook: !!hook,
    form: !!form,
    helpers: !!helpers,
    xform: !!xform,
    val: !!val,
  };
  const allFiles = Object.values(files).every(Boolean);

  const mainView =
    /MainView\s*=/.test(form) || /LegacyView\s*=/.test(form);
  const localBtn = /const Btn\s*=/.test(page + form);
  const localC = /const C\s*=\s*\{/.test(page + form);
  const commonBtn = /components\/common/.test(page + form);
  const pbx = /pbxTokens/.test(form + helpers);
  const aliases =
    /extensionPageWrapStyle as /.test(helpers) &&
    /extensionFixedAlertSx as /.test(helpers);

  // Hook is "real" if it has useState and handlers / API usage — not just ready bridge
  const hookBridgeOnly =
    /\bready\b/.test(hook) &&
    !/\buseState\b/.test(hook) &&
    hook.split("\n").length < 25;
  const hookHasState = /\buseState\b/.test(hook);
  const hookHasHandlers = handlers(hook).length > 0;
  const formHasState = /\buseState\b/.test(form);
  const formHasApi = apiCalls(form).length > 0;

  let completeness = "COMPLETE";
  const notes = [];
  if (!allFiles) {
    completeness = "INCOMPLETE";
    notes.push("missing split files");
  }
  if (localBtn || localC) {
    completeness = "INCOMPLETE";
    notes.push(localBtn ? "local Btn" : "local C");
  }
  if (mainView || hookBridgeOnly || (formHasState && formHasApi)) {
    completeness = "HALF";
    if (mainView) notes.push("logic still in MainView/FormFields");
    if (hookBridgeOnly) notes.push("hook is stub/bridge only");
    if (formHasState && formHasApi) notes.push("API calls still in FormFields");
  }
  if (
    completeness === "COMPLETE" &&
    (!hookHasState || !hookHasHandlers) &&
    apiCalls(page + hook + form).length === 0
  ) {
    // local-state pages may have handlers only - ok if hook has useState
    if (!hookHasState && formHasState) {
      completeness = "HALF";
      notes.push("state still in FormFields");
    }
  }
  // local-state only pages with hook useState are COMPLETE even if no API
  if (
    completeness === "COMPLETE" &&
    !hookHasState &&
    !formHasState &&
    handlers(hook).length === 0
  ) {
    // Certificate-style may be thin — check hook has something
    if (hook.split("\n").length < 15) {
      completeness = "HALF";
      notes.push("hook too thin");
    }
  }

  return {
    files,
    allFiles,
    mainView,
    localBtn,
    localC,
    commonBtn,
    pbx,
    aliases,
    hookBridgeOnly,
    hookHasState,
    hookHasHandlers,
    formHasState,
    formHasApi,
    pageLines: page.split("\n").length,
    hookLines: hook.split("\n").length,
    completeness,
    notes,
  };
}

const rows = [];

for (const pageName of PAGES) {
  const headRel = `src/modules/Maitenance/System Tools/${pageName}.jsx`;
  const head = gitShow(headRel);
  const page = read(`${pageName}.jsx`) || "";
  const hook = read(`hooks/use${pageName}Page.js`) || "";
  const form = read(`components/${pageName}FormFields.jsx`) || "";
  const helpers = read(`components/${pageName}TableHelpers.js`) || "";
  const allCur = [page, hook, form, helpers].join("\n");

  const headApi = apiCalls(head || "");
  const curApi = apiCalls(allCur);
  const apiSame = JSON.stringify(headApi) === JSON.stringify(curApi);

  const headH = handlers(head || "");
  const curH = handlers(hook + "\n" + form);
  const missingH = headH.filter((h) => !curH.includes(h));

  const factor = factorStatus(pageName);

  rows.push({
    page: pageName,
    apiSame,
    headApi,
    curApi,
    handlersMissing: missingH,
    headHandlerCount: headH.length,
    curHandlerCount: curH.length,
    factor,
  });
}

console.log("=== SYSTEM TOOLS — API + FACTOR AUDIT ===\n");

let apiOk = 0;
let complete = 0;
let half = 0;
let bad = 0;

for (const r of rows) {
  const f = r.factor.completeness;
  if (r.apiSame) apiOk++;
  if (f === "COMPLETE") complete++;
  else if (f === "HALF") half++;
  else bad++;

  const apiTag = r.apiSame ? "API_SAME" : "API_CHANGED";
  const apiDetail = r.apiSame
    ? r.headApi.join(", ") || "(none)"
    : `HEAD=[${r.headApi}] CUR=[${r.curApi}]`;
  const miss =
    r.handlersMissing.length > 0
      ? ` missingHandlers=${r.handlersMissing.join("|")}`
      : "";
  const notes = r.factor.notes.length
    ? ` (${r.factor.notes.join("; ")})`
    : "";

  console.log(
    `${r.page.padEnd(24)} ${apiTag.padEnd(12)} ${f.padEnd(10)} page=${String(r.factor.pageLines).padStart(3)} hook=${String(r.factor.hookLines).padStart(3)}${miss}${notes}`,
  );
  if (!r.apiSame) console.log(`  ${apiDetail}`);
}

console.log("\n--- SUMMARY ---");
console.log(`Pages: ${PAGES.length}`);
console.log(`API unchanged: ${apiOk}/${PAGES.length}`);
console.log(`Factor COMPLETE: ${complete}`);
console.log(`Factor HALF: ${half}`);
console.log(`Factor INCOMPLETE: ${bad}`);

const halfPages = rows
  .filter((r) => r.factor.completeness === "HALF")
  .map((r) => r.page);
const apiChanged = rows.filter((r) => !r.apiSame).map((r) => r.page);

if (halfPages.length) {
  console.log("\nHALF-FACTORED pages:");
  for (const r of rows.filter((x) => x.factor.completeness === "HALF")) {
    console.log(`  - ${r.page}: ${r.factor.notes.join("; ")}`);
  }
}
if (apiChanged.length) {
  console.log("\nAPI CHANGED pages:", apiChanged.join(", "));
}

process.exit(apiChanged.length || bad ? 1 : 0);
