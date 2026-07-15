/**
 * Authorization (System Tools page 1) factor + wiring audit.
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const base = path.join("src", "modules", "Maitenance", "System Tools");
const rel = (f) => path.join(base, f);

function read(f) {
  return fs.readFileSync(rel(f), "utf8");
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
    /(?:const|function)\s+(handle[A-Z]\w*|load[A-Z]\w*|fetch[A-Z]\w*|apply[A-Z]\w*|refresh[A-Z]\w*)\s*=/g,
  )) {
    names.add(m[1]);
  }
  return [...names].sort();
}

function pageDestructure(pageSrc) {
  const m = pageSrc.match(/const\s*\{([\s\S]*?)\}\s*=\s*vm/);
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

const page = read("Authorization.jsx");
const hook = read("hooks/useAuthorizationPage.js");
const form = read("components/AuthorizationFormFields.jsx");
const helpers = read("components/AuthorizationTableHelpers.js");
const xform = read("utils/AuthorizationTransformers.js");
const val = read("utils/AuthorizationValidators.js");
const head = gitShow("src/modules/Maitenance/System Tools/Authorization.jsx");

const headApi = head ? apiCalls(head) : [];
const curApi = apiCalls(hook + "\n" + page);
const headH = head ? handlers(head) : [];
const curH = handlers(hook);
const destr = pageDestructure(page);
const ret = returnBody(hook);
const missing = destr.filter((k) => !new RegExp(`\\b${k}\\b`).test(ret));

const aliases = {
  wrap: helpers.includes("extensionPageWrapStyle as authorizationPageWrapStyle"),
  inner: helpers.includes(
    "extensionPageInnerStyle as authorizationPageInnerStyle",
  ),
  card: helpers.includes("extensionCardStyle as authorizationCardStyle"),
  alert: helpers.includes(
    "extensionFixedAlertSx as authorizationFixedAlertSx",
  ),
  footerBtn: helpers.includes(
    "addNewModalFooterBtnStyle as authorizationFooterBtnStyle",
  ),
  breadcrumb: form.includes("ExtensionBreadcrumb"),
  pbxTokens: /theme\/pbxTokens/.test(form),
  commonBtn: /components\/common/.test(page),
};

const factorFiles = [
  "Authorization.jsx",
  "hooks/useAuthorizationPage.js",
  "components/AuthorizationFormFields.jsx",
  "components/AuthorizationTableHelpers.js",
  "utils/AuthorizationTransformers.js",
  "utils/AuthorizationValidators.js",
];
const factorOk = factorFiles.every((f) => fs.existsSync(rel(f)));
const localBtn = /const Btn\s*=/.test(page + form);
const pageLines = page.split("\n").length;

const headAstCmd = head && /cmd:\s*["']astlicense["']/.test(head);
const curAstCmd = /cmd:\s*["']astlicense["']/.test(hook);
const headGetLic = head && /\bgetLicenseInfo\s*\(/.test(head);
const curGetLic = /\bgetLicenseInfo\s*\(/.test(hook);
const headSys = head && /\bfetchSystemInfo\s*\(/.test(head);
const curSys = /\bfetchSystemInfo\s*\(/.test(hook);

const pass =
  JSON.stringify(headApi) === JSON.stringify(curApi) &&
  missing.length === 0 &&
  Object.values(aliases).every(Boolean) &&
  factorOk &&
  !localBtn &&
  headAstCmd === curAstCmd &&
  headGetLic === curGetLic &&
  headSys === curSys &&
  xform.includes("parseLicensePayload") &&
  pageLines < 120;

console.log("--- Authorization (System Tools #1) wiring ---");
console.log("HEAD API:", headApi.join(", ") || "(none)");
console.log("CUR  API:", curApi.join(", ") || "(none)");
console.log("API same:", JSON.stringify(headApi) === JSON.stringify(curApi));
console.log("HEAD handlers:", headH.join(", "));
console.log("CUR  handlers:", curH.join(", "));
console.log("Page destructure:", destr.join(", "));
console.log("Missing from hook return:", missing.join(", ") || "(none)");
console.log("Aliases:", aliases);
console.log("Factor files OK:", factorOk);
console.log("Local Btn:", localBtn);
console.log("Page lines:", pageLines);
console.log("astlicense preserved:", headAstCmd === curAstCmd);
console.log("getLicenseInfo preserved:", headGetLic === curGetLic);
console.log("fetchSystemInfo preserved:", headSys === curSys);
console.log(pass ? "\nPASS" : "\nFAIL");
process.exit(pass ? 0 : 1);
