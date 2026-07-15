/**
 * HEAD vs current wiring for Security Rules AccessControl / SipAccessControl.
 */
import { execSync } from "child_process";
import fs from "fs";

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
  if (/\bfetch\s*\(/.test(src)) names.add("fetch(...)");
  if (/axiosInstance\.(get|post|put|delete)\s*\(/.test(src)) {
    for (const m of src.matchAll(
      /axiosInstance\.(get|post|put|delete)\s*\(\s*["'`]([^"'`]+)["'`]/g,
    )) {
      names.add(`axios.${m[1]}(${m[2]})`);
    }
  }
  return [...names].sort();
}

function handlers(src) {
  const names = new Set();
  for (const m of src.matchAll(
    /(?:const|function)\s+(handle[A-Z]\w*|load[A-Z]\w*|fetch[A-Z]\w*|apply[A-Z]\w*|save[A-Z]\w*)\s*=/g,
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
  return hookSrc.slice(idx, idx + 8000);
}

function hasCommonAliases(helpersSrc, formSrc) {
  const all = helpersSrc + "\n" + formSrc;
  const need = [
    "extensionPageWrapStyle",
    "extensionPageInnerStyle",
    "extensionCardStyle",
    "ExtensionBreadcrumb",
  ];
  return need.map((n) => ({ name: n, ok: all.includes(n) }));
}

function diff(a, b) {
  const A = new Set(a);
  const B = new Set(b);
  return {
    onlyBefore: a.filter((x) => !B.has(x)),
    onlyAfter: b.filter((x) => !A.has(x)),
  };
}

const which = process.argv[2] || "access";

const CFG = {
  access: {
    name: "Access Control",
    route: "/system-tools/access-control",
    head: "src/modules/System/System Settings/AccessControl.jsx",
    page: "src/modules/System/System Settings/AccessControl.jsx",
    hook: "src/modules/System/System Settings/hooks/useAccessControlPage.js",
    form: "src/modules/System/System Settings/components/AccessControlFormFields.jsx",
    helpers:
      "src/modules/System/System Settings/components/AccessControlTableHelpers.js",
    utils: [
      "src/modules/System/System Settings/utils/AccessControlValidators.js",
      "src/modules/System/System Settings/utils/AccessControlTransformers.js",
    ],
  },
  sip: {
    name: "SIP Access Control",
    route: "/system-tools/sip-access-control",
    head: "src/modules/System/System Settings/SipAccessControl.jsx",
    page: "src/modules/System/System Settings/SipAccessControl.jsx",
    hook: "src/modules/System/System Settings/hooks/useSipAccessControlPage.js",
    form: "src/modules/System/System Settings/components/SipAccessControlFormFields.jsx",
    helpers:
      "src/modules/System/System Settings/components/SipAccessControlTableHelpers.js",
    utils: [
      "src/modules/System/System Settings/utils/SipAccessControlValidators.js",
      "src/modules/System/System Settings/utils/SipAccessControlTransformers.js",
    ],
  },
};

const cfg = CFG[which];
if (!cfg) {
  console.error("Usage: node scripts/audit-security-wiring.mjs <access|sip>");
  process.exit(1);
}

const before = gitShow(cfg.head) || "";
const afterFiles = [cfg.page, cfg.hook, cfg.form, cfg.helpers, ...cfg.utils];
const after = afterFiles
  .filter((f) => fs.existsSync(f))
  .map((f) => fs.readFileSync(f, "utf8"))
  .join("\n");

const pageSrc = fs.readFileSync(cfg.page, "utf8");
const hookSrc = fs.existsSync(cfg.hook) ? fs.readFileSync(cfg.hook, "utf8") : "";
const formSrc = fs.existsSync(cfg.form) ? fs.readFileSync(cfg.form, "utf8") : "";
const helpersSrc = fs.existsSync(cfg.helpers)
  ? fs.readFileSync(cfg.helpers, "utf8")
  : "";

const beforeApis = apiCalls(before);
const afterApis = apiCalls(after);
const apiDiff = diff(beforeApis, afterApis);

const beforeH = handlers(before);
const afterH = handlers(after);
const hDiff = diff(beforeH, afterH);

const dest = pageDestructure(pageSrc);
const ret = returnBody(hookSrc);
const missing = dest.filter((k) => !new RegExp(`\\b${k}\\b`).test(ret));

const aliases = hasCommonAliases(helpersSrc, formSrc);

console.log(`=== ${cfg.name} (${cfg.route}) ===\n`);
console.log("-- API --");
console.log("BEFORE:", beforeApis.join(", ") || "(none)");
console.log("AFTER: ", afterApis.join(", ") || "(none)");
console.log(
  apiDiff.onlyBefore.length || apiDiff.onlyAfter.length
    ? `DIFF onlyBefore=[${apiDiff.onlyBefore}] onlyAfter=[${apiDiff.onlyAfter}]`
    : "SAME",
);

console.log("\n-- Handlers --");
console.log("BEFORE:", beforeH.join(", ") || "(none)");
console.log("AFTER: ", afterH.join(", ") || "(none)");
console.log(
  hDiff.onlyBefore.length || hDiff.onlyAfter.length
    ? `DIFF onlyBefore=[${hDiff.onlyBefore}] onlyAfter=[${hDiff.onlyAfter}]`
    : "SAME",
);

console.log("\n-- Page↔Hook --");
console.log(`destructure (${dest.length}):`, dest.join(", "));
console.log(
  missing.length ? `FAIL missing: [${missing}]` : "OK all keys in hook return",
);

console.log("\n-- Common aliases --");
for (const a of aliases) console.log(`  ${a.ok ? "✓" : "✗"} ${a.name}`);

// eslint
const eslintTargets = afterFiles.filter((f) => fs.existsSync(f));
try {
  execSync(
    `npx eslint ${eslintTargets.map((f) => `"${f}"`).join(" ")} -f json -o scripts/_sec-eslint.json`,
    { stdio: "pipe", shell: true },
  );
} catch (_) {}
let undef = 0;
let errors = 0;
try {
  const r = JSON.parse(fs.readFileSync("scripts/_sec-eslint.json", "utf8"));
  for (const f of r) {
    for (const msg of f.messages || []) {
      if (msg.ruleId === "no-undef") {
        undef++;
        console.log("no-undef", msg.line, msg.message);
      }
      if (msg.severity === 2 && msg.ruleId !== "no-unused-vars") {
        errors++;
        if (msg.ruleId === "no-undef") continue;
        console.log("error", msg.ruleId, msg.line, msg.message);
      }
    }
  }
} catch (_) {}
console.log(`\n-- ESLint no-undef: ${undef} other-errors(non-unused): ${errors}`);

const aliasOk = aliases.every((a) => a.ok);
const ok =
  !apiDiff.onlyBefore.length &&
  !apiDiff.onlyAfter.length &&
  !missing.length &&
  undef === 0 &&
  aliasOk;

console.log(
  `\n=== VERDICT: ${ok ? "PASS" : "REVIEW"} ===`,
);
process.exit(ok ? 0 : 2);
