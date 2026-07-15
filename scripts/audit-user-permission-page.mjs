/**
 * User Permission page wiring audit.
 * Usage: node scripts/audit-user-permission-page.mjs <PageName>
 * Pages: UserManage | AccountManage | ChangePassword
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const pageName = process.argv[2];
if (!pageName) {
  console.error("Usage: node scripts/audit-user-permission-page.mjs <PageName>");
  process.exit(2);
}

const base = path.join("src", "modules", "UserManage", "User Permission");
const hookMap = {
  UserManage: "useUserManagePage",
  AccountManage: "useAccountManagePage",
  ChangePassword: "useChangePasswordPage",
};

const hookName = hookMap[pageName];
if (!hookName) {
  console.error(`Unknown page: ${pageName}`);
  process.exit(2);
}

const rel = (f) => path.join(base, f);

function read(f) {
  return fs.existsSync(rel(f)) ? fs.readFileSync(rel(f), "utf8") : "";
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
  if (!src) return [];
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
    /(?:const|function)\s+(handle[A-Z]\w*|load[A-Z]\w*|fetch[A-Z]\w*|show[A-Z]\w*|open[A-Z]\w*|close[A-Z]\w*|clear[A-Z]\w*)\s*=/g,
  )) {
    names.add(m[1]);
  }
  return [...names].sort();
}

function pageDestructure(pageSrc) {
  const m =
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

function returnKeys(hookSrc) {
  const idx = hookSrc.lastIndexOf("return {");
  if (idx < 0) return [];
  const body = hookSrc.slice(idx);
  const keys = [];
  for (const m of body.matchAll(/^\s*(\w+)\s*,?\s*$/gm)) {
    keys.push(m[1]);
  }
  return keys;
}

const pagePath = `${base.replace(/\\/g, "/")}/${pageName}.jsx`;
const headPage = gitShow(pagePath);
const pageSrc = read(`${pageName}.jsx`);
const hookSrc = read(`hooks/${hookName}.js`);
const formSrc = read(`components/${pageName}FormFields.jsx`);
const tableSrc =
  read(`components/${pageName}TableHelpers.jsx`) ||
  read(`components/${pageName}TableHelpers.js`);
const transSrc = read(`utils/${pageName}Transformers.js`);
const validSrc = read(`utils/${pageName}Validators.js`);

const headApis = apiCalls(headPage);
const curApis = [
  ...new Set([...apiCalls(hookSrc), ...apiCalls(pageSrc), ...apiCalls(formSrc)]),
].sort();
const headHandlers = handlers(headPage);
const hookHandlers = handlers(hookSrc);
const pageKeys = pageDestructure(pageSrc);
const hookKeys = returnKeys(hookSrc);

const missingFromPage = hookKeys.filter((k) => !pageKeys.includes(k));
const missingFromHook = pageKeys.filter((k) => !hookKeys.includes(k));
const apiMissing = headApis.filter((a) => !curApis.includes(a));
const apiExtra = curApis.filter((a) => !headApis.includes(a));
const handlerMissing = headHandlers.filter((h) => !hookHandlers.includes(h));

const hasLocalC = /\bconst C = \{/.test(pageSrc);
const hasLocalBtn = /function Btn|const Btn =/.test(pageSrc);
const pageLines = pageSrc.split("\n").length;

console.log(`\n=== User Permission Wiring: ${pageName} ===\n`);
console.log(`Page lines: ${pageLines} (target: thin page < 450)`);
console.log(`Hook: hooks/${hookName}.js (${hookSrc ? "OK" : "MISSING"})`);
console.log(`FormFields: components/${pageName}FormFields.jsx (${formSrc ? "OK" : "MISSING"})`);
console.log(`TableHelpers: components/${pageName}TableHelpers.* (${tableSrc ? "OK" : "MISSING"})`);
console.log(`Transformers: utils/${pageName}Transformers.js (${transSrc ? "OK" : "MISSING"})`);
console.log(`Validators: utils/${pageName}Validators.js (${validSrc ? "OK" : "MISSING"})`);
console.log(`Local C palette: ${hasLocalC ? "FAIL" : "PASS"}`);
console.log(`Local Btn: ${hasLocalBtn ? "FAIL" : "PASS"}`);

console.log(`\n--- API parity (HEAD vs current) ---`);
console.log(`HEAD:   ${headApis.join(", ") || "(none)"}`);
console.log(`Current:${curApis.join(", ") || "(none)"}`);
console.log(`Missing:${apiMissing.length ? apiMissing.join(", ") : "none"}`);
console.log(`Extra:  ${apiExtra.length ? apiExtra.join(", ") : "none"}`);

console.log(`\n--- Handlers (HEAD vs hook) ---`);
console.log(`HEAD:   ${headHandlers.join(", ") || "(none)"}`);
console.log(`Hook:   ${hookHandlers.join(", ") || "(none)"}`);
console.log(`Missing:${handlerMissing.length ? handlerMissing.join(", ") : "none"}`);

console.log(`\n--- Page destructure vs hook return ---`);
console.log(`Page keys (${pageKeys.length}): ${pageKeys.join(", ")}`);
console.log(`Hook keys (${hookKeys.length}): ${hookKeys.join(", ")}`);
console.log(`In hook not in page: ${missingFromPage.length ? missingFromPage.join(", ") : "none"}`);
console.log(`In page not in hook: ${missingFromHook.length ? missingFromHook.join(", ") : "none"}`);

const pass =
  !hasLocalC &&
  !hasLocalBtn &&
  hookSrc &&
  formSrc &&
  tableSrc &&
  transSrc &&
  validSrc &&
  apiMissing.length === 0 &&
  missingFromHook.length === 0 &&
  pageLines < 450;

console.log(`\n=== RESULT: ${pass ? "PASS" : "FAIL"} ===\n`);
process.exit(pass ? 0 : 1);
