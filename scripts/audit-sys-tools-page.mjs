/**
 * Generic System Tools page wiring audit.
 * Usage: node scripts/audit-sys-tools-page.mjs <PageName>
 * Example: node scripts/audit-sys-tools-page.mjs DDOSSettings
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const pageName = process.argv[2];
if (!pageName) {
  console.error("Usage: node scripts/audit-sys-tools-page.mjs <PageName>");
  process.exit(2);
}

const alias = pageName
  .replace(/Settings$/, "")
  .replace(/Manage$/, "")
  .replace(/^DDOS/, "ddos")
  .replace(/^IDS/, "ids");

const prefixMap = {
  DDOSSettings: "ddos",
  IDSSettings: "ids",
  Authorization: "authorization",
  CertificateManage: "certificate",
  Radius: "radius",
  SIPAccountGenerator: "sipGen",
  ConfigFile: "configFile",
  Hosts: "hosts",
  SignalingCapture: "signalingCapture",
  SignalingCallTest: "signalingCallTest",
  SignalingCallTrack: "signalingCallTrack",
  ModificationRecord: "modificationRecord",
  BackupUpload: "backupUpload",
  FactoryReset: "factoryReset",
  Upgrade: "upgrade",
  DeviceLock: "deviceLock",
  Restart: "restart",
  Licence: "licence",
  SystemToolsSqlUpload: "sqlUpload",
  LicenseLimits: "licenseLimits",
};

const pfx = prefixMap[pageName] || pageName.charAt(0).toLowerCase() + pageName.slice(1);

const base = path.join("src", "modules", "Maitenance", "System Tools");
const rel = (f) => path.join(base, f);

function read(f) {
  return fs.readFileSync(rel(f), "utf8");
}

function exists(f) {
  return fs.existsSync(rel(f));
}

function gitShow(relPath) {
  try {
    return execSync(`git show "HEAD:${relPath.replace(/\\/g, "/")}"`, {
      encoding: "utf8",
      maxBuffer: 40e6,
      shell: true,
    });
  } catch {
    return null;
  }
}

function apiCalls(src) {
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
  return [...names].sort();
}

function handlers(src) {
  const names = new Set();
  for (const m of src.matchAll(
    /(?:const|function)\s+(handle[A-Z]\w*|load[A-Z]\w*|fetch[A-Z]\w*|show[A-Z]\w*|add[A-Z]\w*|execute[A-Z]\w*|configure[A-Z]\w*|remove[A-Z]\w*|simulate[A-Z]\w*|refresh[A-Z]\w*|apply[A-Z]\w*|save[A-Z]\w*)\s*=/g,
  )) {
    names.add(m[1]);
  }
  return [...names].sort();
}

function pageDestructure(pageSrc) {
  const m =
    pageSrc.match(/const\s*\{([\s\S]*?)\}\s*=\s*vm/) ||
    pageSrc.match(/const\s*\{([\s\S]*?)\}\s*=\s*use[A-Za-z]+Page\s*\(/);
  if (!m) return [];
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

const pageFile = `${pageName}.jsx`;
const hookFile = `hooks/use${pageName}Page.js`;
const formFile = `components/${pageName}FormFields.jsx`;
const helpersFile = `components/${pageName}TableHelpers.js`;
const xformFile = `utils/${pageName}Transformers.js`;
const valFile = `utils/${pageName}Validators.js`;

const missingFiles = [pageFile, hookFile, formFile, helpersFile, xformFile, valFile].filter(
  (f) => !exists(f),
);

if (missingFiles.length) {
  console.log(`--- ${pageName} wiring ---`);
  console.log("MISSING FILES:", missingFiles.join(", "));
  console.log("\nFAIL");
  process.exit(1);
}

const page = read(pageFile);
const hook = read(hookFile);
const form = read(formFile);
const helpers = read(helpersFile);
const head = gitShow(`src/modules/Maitenance/System Tools/${pageName}.jsx`);

const allCur = [page, hook, form, helpers].join("\n");
const headApi = head ? apiCalls(head) : [];
const curApi = apiCalls(allCur);
const headH = head ? handlers(head) : [];
const curH = handlers(hook);
const destr = pageDestructure(page);
const ret = returnBody(hook);
const missing = destr.filter((k) => !new RegExp(`\\b${k}\\b`).test(ret));

const aliases = {
  wrap: helpers.includes(`extensionPageWrapStyle as ${pfx}PageWrapStyle`),
  inner: helpers.includes(`extensionPageInnerStyle as ${pfx}PageInnerStyle`),
  card:
    helpers.includes(`extensionCardStyle as ${pfx}CardStyle`) ||
    helpers.includes(`extensionCardStyle as ${pfx}TableContainerStyle`) ||
    /extensionCardStyle as /.test(helpers),
  alert: helpers.includes(`extensionFixedAlertSx as ${pfx}FixedAlertSx`),
  footerBtn:
    helpers.includes(`addNewModalFooterBtnStyle as ${pfx}FooterBtnStyle`) ||
    helpers.includes(`extensionPrimaryBtnStyle as ${pfx}PrimaryBtnStyle`) ||
    /addNewModalFooterBtnStyle as /.test(helpers) ||
    /extensionPrimaryBtnStyle as /.test(helpers),
  breadcrumb: /ExtensionBreadcrumb/.test(form + page),
  pbxTokens: /theme\/pbxTokens/.test(form + helpers + page),
  commonBtn: /components\/common/.test(form + page),
};

const localBtn = /const Btn\s*=/.test(page + form);
const localC = /const C\s*=\s*\{/.test(page + form);
const pageLines = page.split("\n").length;

const apiSame = JSON.stringify(headApi) === JSON.stringify(curApi);
const pass =
  missingFiles.length === 0 &&
  apiSame &&
  missing.length === 0 &&
  aliases.wrap &&
  aliases.inner &&
  aliases.alert &&
  aliases.breadcrumb &&
  aliases.pbxTokens &&
  aliases.commonBtn &&
  !localBtn &&
  pageLines < 200;

console.log(`--- ${pageName} (pfx=${pfx}) wiring ---`);
console.log("HEAD API:", headApi.join(", ") || "(none)");
console.log("CUR  API:", curApi.join(", ") || "(none)");
console.log("API same:", apiSame);
console.log("HEAD handlers count:", headH.length, headH.slice(0, 8).join(", "));
console.log("CUR  handlers count:", curH.length, curH.slice(0, 8).join(", "));
console.log("Page destructure:", destr.join(", ") || "(none)");
console.log("Missing from hook return:", missing.join(", ") || "(none)");
console.log("Aliases:", aliases);
console.log("Local Btn:", localBtn, "Local C:", localC);
console.log("Page lines:", pageLines);
console.log(pass ? "\nPASS" : "\nFAIL");
process.exit(pass ? 0 : 1);
