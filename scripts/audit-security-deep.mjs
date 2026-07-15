/**
 * Deep completeness + before/after audit for AccessControl & SipAccessControl.
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

function countLines(s) {
  return (s.match(/\n/g) || []).length + 1;
}

function extractApiImportCalls(src) {
  const set = new Set();
  for (const m of src.matchAll(
    /import\s*\{([^}]+)\}\s*from\s*["']([^"']+)["']/g,
  )) {
    const from = m[2];
    if (!/apiService|axiosInstance/.test(from) && !from.endsWith("/apiService") && !from.endsWith("/axiosInstance"))
      continue;
    if (from.includes("axiosInstance")) {
      set.add("axiosInstance(imported)");
      continue;
    }
    for (const p of m[1].split(",")) {
      const t = p.trim();
      if (!t) continue;
      const asM = t.match(/^(.+?)\s+as\s+(.+)$/);
      const name = asM ? asM[2].trim() : t;
      const used = new RegExp(`\\b${name}\\s*\\(`).test(src);
      set.add(`${name}${used ? "" : " (imported unused)"}`);
    }
  }
  for (const m of src.matchAll(
    /axiosInstance\.(get|post|put|delete)\s*\(\s*["'`]([^"'`]+)["'`]/g,
  )) {
    set.add(`axios.${m[1]} ${m[2]}`);
  }
  for (const m of src.matchAll(/postLinuxCmd\s*\(\s*\{[^}]*cmd:\s*["'`]([^"'`]+)["'`]/g)) {
    set.add(`postLinuxCmd cmd="${m[1]}"`);
  }
  // broader postLinuxCmd with template/cmd var
  if (/postLinuxCmd\s*\(/.test(src)) set.add("postLinuxCmd(called)");
  return [...set].sort();
}

function extractHandlers(src) {
  const set = new Set();
  for (const m of src.matchAll(
    /(?:const|function|async function)\s+(handle\w+|load\w+|fetch\w+|apply\w+|open\w+|close\w+|save\w+)\s*[=(]/g,
  )) {
    set.add(m[1]);
  }
  return [...set].sort();
}

function extractUseState(src) {
  const keys = [];
  for (const m of src.matchAll(
    /const\s*\[\s*([A-Za-z_]\w*)\s*,\s*([A-Za-z_]\w*)\s*\]\s*=\s*useState/g,
  )) {
    keys.push(m[1]);
  }
  return keys.sort();
}

function pageDestructure(pageSrc) {
  const m =
    pageSrc.match(/const\s*\{([\s\S]*?)\}\s*=\s*vm\b/) ||
    pageSrc.match(/const\s*\{([\s\S]*?)\}\s*=\s*use\w+Page\s*\(/);
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
    .filter((s) => /^[A-Za-z_]/.test(s));
}

function returnContains(hookSrc, keys) {
  const idx = hookSrc.lastIndexOf("return {");
  const body = idx >= 0 ? hookSrc.slice(idx) : "";
  return keys.filter((k) => !new RegExp(`\\b${k}\\b`).test(body));
}

function completenessChecks(cfg, afterJoined, pageSrc, hookSrc, formSrc, helpersSrc) {
  const issues = [];
  // Page should be relatively thin and import hook + components
  if (!pageSrc.includes(`use${cfg.hookExport}`)) {
    issues.push(`page missing hook import/use ${cfg.hookExport}`);
  }
  if (!/from\s+["']\.\/hooks\//.test(pageSrc) && !pageSrc.includes("./hooks/")) {
    issues.push("page does not import from ./hooks/");
  }
  if (!/from\s+["']\.\/components\//.test(pageSrc) && !pageSrc.includes("./components/")) {
    issues.push("page does not import from ./components/");
  }
  // Residual monolith smells in page: local Btn, local C palette, huge useState blocks
  if (/const\s+Btn\s*=/.test(pageSrc)) issues.push("page still defines local Btn (incomplete)");
  if (/const\s+C\s*=\s*\{/.test(pageSrc)) issues.push("page still has local C palette (incomplete)");
  if (/const\s+OUTLINED_BORDER/.test(pageSrc))
    issues.push("page still has local OUTLINED_* (incomplete)");
  const pageStates = extractUseState(pageSrc);
  if (pageStates.length > 2)
    issues.push(
      `page still has ${pageStates.length} useState — likely half-factored: [${pageStates.join(", ")}]`,
    );
  // Helpers should alias common
  for (const need of [
    "extensionPageWrapStyle",
    "extensionPageInnerStyle",
    "extensionCardStyle",
  ]) {
    if (!(helpersSrc + formSrc).includes(need))
      issues.push(`missing common alias source ${need}`);
  }
  if (!(helpersSrc + formSrc).includes("ExtensionBreadcrumb") && !formSrc.includes("ExtensionBreadcrumb"))
    issues.push("missing ExtensionBreadcrumb");
  // Utils existence
  for (const u of cfg.utils) {
    if (!fs.existsSync(u)) issues.push(`missing util file ${u}`);
    else if (fs.statSync(u).size < 40) issues.push(`util looks empty: ${u}`);
  }
  // Hook should own API
  if (cfg.expectApi && !hookSrc.includes(cfg.expectApi))
    issues.push(`hook missing expected API usage ${cfg.expectApi}`);
  return issues;
}

function diff(a, b) {
  const A = new Set(a);
  const B = new Set(b);
  return {
    onlyBefore: a.filter((x) => !B.has(x)),
    onlyAfter: b.filter((x) => !A.has(x)),
  };
}

const PAGES = [
  {
    key: "access",
    name: "Access Control",
    route: "/system-tools/access-control",
    head: "src/modules/System/System Settings/AccessControl.jsx",
    page: "src/modules/System/System Settings/AccessControl.jsx",
    hook: "src/modules/System/System Settings/hooks/useAccessControlPage.js",
    hookExport: "AccessControlPage",
    form: "src/modules/System/System Settings/components/AccessControlFormFields.jsx",
    helpers:
      "src/modules/System/System Settings/components/AccessControlTableHelpers.js",
    utils: [
      "src/modules/System/System Settings/utils/AccessControlValidators.js",
      "src/modules/System/System Settings/utils/AccessControlTransformers.js",
    ],
    expectApi: "postLinuxCmd",
  },
  {
    key: "sip",
    name: "SIP Access Control",
    route: "/system-tools/sip-access-control",
    head: "src/modules/System/System Settings/SipAccessControl.jsx",
    page: "src/modules/System/System Settings/SipAccessControl.jsx",
    hook: "src/modules/System/System Settings/hooks/useSipAccessControlPage.js",
    hookExport: "SipAccessControlPage",
    form: "src/modules/System/System Settings/components/SipAccessControlFormFields.jsx",
    helpers:
      "src/modules/System/System Settings/components/SipAccessControlTableHelpers.js",
    utils: [
      "src/modules/System/System Settings/utils/SipAccessControlValidators.js",
      "src/modules/System/System Settings/utils/SipAccessControlTransformers.js",
    ],
    expectApi: null, // local-state only
  },
];

let overallOk = true;

for (const cfg of PAGES) {
  console.log(`\n############ ${cfg.name} (${cfg.route}) ############`);
  const before = gitShow(cfg.head) || "";
  const pageSrc = fs.readFileSync(cfg.page, "utf8");
  const hookSrc = fs.readFileSync(cfg.hook, "utf8");
  const formSrc = fs.readFileSync(cfg.form, "utf8");
  const helpersSrc = fs.readFileSync(cfg.helpers, "utf8");
  const utilsSrc = cfg.utils
    .filter((u) => fs.existsSync(u))
    .map((u) => fs.readFileSync(u, "utf8"))
    .join("\n");
  const after = [pageSrc, hookSrc, formSrc, helpersSrc, utilsSrc].join("\n");

  console.log("\n-- Size --");
  console.log(
    `HEAD monolith: ${countLines(before)} lines | NOW page=${countLines(pageSrc)} hook=${countLines(hookSrc)} form=${countLines(formSrc)} helpers=${countLines(helpersSrc)}`,
  );

  console.log("\n-- Completeness --");
  const issues = completenessChecks(
    cfg,
    after,
    pageSrc,
    hookSrc,
    formSrc,
    helpersSrc,
  );
  if (!issues.length) console.log("COMPLETE factor (no leftover monolith smells on page)");
  else {
    overallOk = false;
    for (const i of issues) console.log("INCOMPLETE:", i);
  }

  console.log("\n-- API / IO --");
  const bApi = extractApiImportCalls(before);
  const aApi = extractApiImportCalls(after);
  console.log("BEFORE:", bApi.join(" | ") || "(none)");
  console.log("AFTER: ", aApi.join(" | ") || "(none)");
  const ad = diff(
    bApi.filter((x) => !x.includes("unused")),
    aApi.filter((x) => !x.includes("unused")),
  );
  // normalize postLinuxCmd variants
  const norm = (arr) =>
    arr
      .map((x) =>
        x.startsWith("postLinuxCmd") ? "postLinuxCmd" : x,
      )
      .filter((x, i, a) => a.indexOf(x) === i);
  const bn = norm(bApi.filter((x) => !x.includes("unused")));
  const an = norm(aApi.filter((x) => !x.includes("unused")));
  const nd = diff(bn, an);
  console.log(
    nd.onlyBefore.length || nd.onlyAfter.length
      ? `DIFF onlyBefore=[${nd.onlyBefore}] onlyAfter=[${nd.onlyAfter}]`
      : "SAME (called APIs)",
  );
  if (nd.onlyBefore.length || nd.onlyAfter.length) overallOk = false;

  console.log("\n-- Handlers --");
  const bH = extractHandlers(before).filter(
    (h) => !/^(applyPressStyle|clearPressStyle)$/.test(h),
  );
  const aH = extractHandlers(after).filter(
    (h) => !/^(applyPressStyle|clearPressStyle)$/.test(h),
  );
  console.log("BEFORE:", bH.join(", "));
  console.log("AFTER: ", aH.join(", "));
  const hd = diff(bH, aH);
  // Allow new helpers from extraction if old inline became named
  console.log(
    hd.onlyBefore.length
      ? `REMOVED handlers: [${hd.onlyBefore}]`
      : "No handlers removed",
  );
  console.log(
    hd.onlyAfter.length ? `ADDED handlers: [${hd.onlyAfter}]` : "No handlers added",
  );
  if (hd.onlyBefore.length) overallOk = false;

  console.log("\n-- useState --");
  const bS = extractUseState(before);
  const aS = extractUseState(hookSrc);
  console.log("BEFORE page states:", bS.join(", "));
  console.log("AFTER  hook states:", aS.join(", "));
  const sd = diff(bS, aS);
  console.log(
    sd.onlyBefore.length || sd.onlyAfter.length
      ? `DIFF onlyBefore=[${sd.onlyBefore}] onlyAfter=[${sd.onlyAfter}]`
      : "SAME state names",
  );

  console.log("\n-- Page↔Hook --");
  const dest = pageDestructure(pageSrc);
  const missing = returnContains(hookSrc, dest);
  console.log(`page destructures ${dest.length} keys`);
  console.log(
    missing.length ? `FAIL missing from return: ${missing}` : "OK return covers page",
  );
  if (missing.length) overallOk = false;

  // Key behavior strings
  console.log("\n-- Key behavior strings --");
  const needles =
    cfg.key === "access"
      ? [
          "iptables -L -n -v",
          "postLinuxCmd",
          "IPTABLES_INFO",
          "handleApply",
          "handleSave",
          "handleDelete",
          "handleClearAll",
        ]
      : [
          "SIP_ACCESS_CONTROL",
          "handleSave",
          "handleDelete",
          "handleClearAll",
          "checkedRows",
          "openModal",
          "closeModal",
        ];
  for (const n of needles) {
    const b = before.includes(n);
    const a = after.includes(n);
    const status = b === a ? (b ? "SAME present" : "SAME absent") : `CHANGED b=${b} a=${a}`;
    if (b !== a) overallOk = false;
    console.log(`  ${n}: ${status}`);
  }
}

console.log("\n============ OVERALL ============");
console.log(overallOk ? "PASS — same wiring, factor complete" : "REVIEW — see issues above");
process.exit(overallOk ? 0 : 2);
