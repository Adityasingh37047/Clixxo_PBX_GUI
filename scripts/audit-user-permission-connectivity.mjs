/**
 * Full connectivity audit for User Permission pages:
 * - HEAD vs current API usage
 * - page destructure vs hook return
 * - handlers wired to JSX
 * - factor completeness
 * - router wiring
 * - API payload shape vs HEAD
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const base = path.join("src", "modules", "UserManage", "User Permission");

const PAGES = [
  { name: "UserManage", hook: "useUserManagePage" },
  { name: "AccountManage", hook: "useAccountManagePage" },
  { name: "ChangePassword", hook: "useChangePasswordPage" },
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
  if (!fs.existsSync(p)) {
    // try .jsx for TableHelpers
    const alt = p.replace(/\.js$/, ".jsx");
    if (fs.existsSync(alt)) return fs.readFileSync(alt, "utf8");
    return "";
  }
  return fs.readFileSync(p, "utf8");
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
  const m = pageSrc.match(/const\s*\{([\s\S]*?)\}\s*=\s*use[A-Za-z]+Page\s*\(/);
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

function extractApiCallBodies(src, apiName) {
  const bodies = [];
  const re = new RegExp(`\\b${apiName}\\s*\\(`, "g");
  let m;
  while ((m = re.exec(src))) {
    let i = m.index + m[0].length;
    let depth = 1;
    let start = i;
    while (i < src.length && depth > 0) {
      const ch = src[i];
      if (ch === "(") depth++;
      else if (ch === ")") depth--;
      i++;
    }
    bodies.push(src.slice(start, i - 1).replace(/\s+/g, " ").trim());
  }
  return bodies;
}

function normalizePayloadShape(body) {
  // extract object keys from first-arg object literal when present
  const keys = new Set();
  for (const m of body.matchAll(
    /(?:^|[{\s,])([a-zA-Z_][\w]*)\s*:/g,
  )) {
    keys.add(m[1]);
  }
  return [...keys].sort().join("|");
}

const router = fs.readFileSync("src/router.jsx", "utf8");
const results = [];

console.log("=== USER PERMISSION FULL CONNECTIVITY AUDIT ===\n");

for (const { name, hook } of PAGES) {
  const headRel = `src/modules/UserManage/User Permission/${name}.jsx`;
  const head = gitShow(headRel);
  const page = read(`${name}.jsx`);
  const hookSrc = read(`hooks/${hook}.js`);
  const form = read(`components/${name}FormFields.jsx`);
  const helpers =
    read(`components/${name}TableHelpers.jsx`) ||
    read(`components/${name}TableHelpers.js`);
  const xform = read(`utils/${name}Transformers.js`);
  const val = read(`utils/${name}Validators.js`);
  const allCur = [page, hookSrc, form, helpers, xform, val].join("\n");
  const ui = page + "\n" + form;
  const issues = [];

  for (const [label, content] of [
    ["page", page],
    ["hook", hookSrc],
    ["form", form],
    ["helpers", helpers],
    ["transformers", xform],
    ["validators", val],
  ]) {
    if (!content) issues.push(`MISSING_${label.toUpperCase()}`);
  }

  const headApi = apiCalls(head || "");
  const curApi = apiCalls(allCur);
  const apiSame = JSON.stringify(headApi) === JSON.stringify(curApi);
  if (!apiSame) {
    issues.push(
      `API_DIFF HEAD=[${headApi.join(",")}] CUR=[${curApi.join(",")}]`,
    );
  }

  // Payload key parity per API (HEAD vs hook)
  for (const api of headApi) {
    const headBodies = extractApiCallBodies(head || "", api);
    const curBodies = extractApiCallBodies(allCur, api);
    if (headBodies.length && !curBodies.length) {
      issues.push(`API_CALL_MISSING: ${api}`);
      continue;
    }
    for (let i = 0; i < Math.min(headBodies.length, curBodies.length); i++) {
      const hk = normalizePayloadShape(headBodies[i]);
      const ck = normalizePayloadShape(curBodies[i]);
      // Only compare when both look like object payloads
      if (hk && ck && hk !== ck) {
        // allow arg rename wrappers (userData etc) if keys differ but call exists
        // flag only when HEAD has named keys and CUR lost them
        const headKeys = new Set(hk.split("|").filter(Boolean));
        const curKeys = new Set(ck.split("|").filter(Boolean));
        const lost = [...headKeys].filter((k) => !curKeys.has(k));
        // ignore very generic single-arg wrappers
        if (lost.length && headKeys.size >= 2) {
          issues.push(
            `PAYLOAD_KEYS_DIFF ${api}: lost=[${lost.join(",")}] HEAD=${hk} CUR=${ck}`,
          );
        }
      }
    }
  }

  const localBtn = /const Btn\s*=|function Btn\s*\(/.test(page + form);
  const localC = /const C\s*=\s*\{/.test(page + form);
  if (localBtn) issues.push("LOCAL_BTN");
  if (localC) issues.push("LOCAL_C");

  const formHasApi = apiCalls(form).length > 0;
  const formHasState = /\buseState\b/.test(form);
  const hookHasState = /\buseState\b/.test(hookSrc);
  const mainView = /MainView\s*=/.test(form);
  if (formHasApi && !hookHasState) issues.push("API_IN_FORMFIELDS_NOT_HOOK");
  if (mainView) issues.push("HALF_FACTOR_MAINVIEW");

  const destr = pageDestructure(page);
  const ret = returnBody(hookSrc);
  if (destr.length) {
    const missing = destr.filter((k) => !new RegExp(`\\b${k}\\b`).test(ret));
    if (missing.length) {
      issues.push(`PAGE_KEYS_NOT_IN_HOOK_RETURN: ${missing.join(",")}`);
    }
  } else if (hookHasState) {
    issues.push("PAGE_NO_HOOK_DESTRUCTURE");
  }

  const headH = handlers(head || "");
  const curH = handlers(hookSrc + "\n" + form);
  const missingH = headH.filter((h) => !curH.includes(h));
  if (missingH.length) {
    issues.push(`HANDLERS_MISSING: ${missingH.join(",")}`);
  }

  // handlers returned by hook must appear in UI (page or form)
  const handleFromHook = handlers(hookSrc).filter((h) =>
    new RegExp(`\\b${h}\\b`).test(ret),
  );
  const unwired = handleFromHook.filter((h) => !new RegExp(`\\b${h}\\b`).test(ui));
  // Internal helpers that are returned but only called from other handlers in hook — still OK if not in UI
  // Flag only user-facing handlers (handle*, open*, close*, load*) when in return AND not in UI
  const userFacing = unwired.filter((h) =>
    /^(handle|open|close|load)/.test(h),
  );
  if (userFacing.length) {
    issues.push(`HANDLERS_NOT_IN_UI: ${userFacing.join(",")}`);
  }

  // Internal showToast / showFormError often only used inside hook — OK if returned unused? UserManage returns clearToast etc.
  // showToast is used from page for admin edit block in AccountManage — check separately

  const importOk = new RegExp(
    `import\\s+${name}\\s+from\\s+["'].*${name}["']`,
  ).test(router);
  const routeOk =
    new RegExp(`<${name}\\s*/>`).test(router) ||
    new RegExp(`element:\\s*<${name}`).test(router);
  if (!importOk) issues.push("ROUTER_IMPORT_MISSING");
  if (!routeOk) issues.push("ROUTER_ELEMENT_MISSING");

  // common/theme usage
  if (!/theme\/pbxTokens/.test(allCur) && !/from ["'].*pbxTokens/.test(allCur)) {
    issues.push("NO_PBX_TOKENS");
  }
  if (!/from ["'][^"']*components\/common/.test(allCur)) {
    issues.push("NO_COMMON_BTN");
  }

  // Critical: page must not still import APIs itself if hook owns them
  const pageApis = apiCalls(page);
  if (pageApis.length) {
    issues.push(`API_STILL_IN_PAGE: ${pageApis.join(",")}`);
  }

  // Btn size / variant usage sanity — primary handlers attached
  const btnClicks = [...ui.matchAll(/<Btn[\s\S]*?onClick=\{([^}]+)\}/g)].map(
    (m) => m[1].trim().slice(0, 80),
  );

  const failish = issues.some(
    (i) =>
      i.startsWith("API_") ||
      i.startsWith("PAGE_KEYS") ||
      i.startsWith("HANDLERS_") ||
      i.startsWith("ROUTER_") ||
      i.startsWith("PAYLOAD_") ||
      i.startsWith("MISSING_"),
  );
  const warnish = issues.some(
    (i) => i.startsWith("HALF_") || i.startsWith("LOCAL_") || i.startsWith("NO_"),
  );
  const status = failish ? "FAIL" : warnish ? "WARN" : "OK";

  results.push({
    page: name,
    status,
    apiSame,
    headApi,
    curApi,
    issues,
    pageLines: page.split("\n").length,
    hookLines: hookSrc.split("\n").length,
    btnClicks: btnClicks.length,
    handlersReturned: handleFromHook,
  });
}

let ok = 0,
  warn = 0,
  fail = 0;

for (const r of results) {
  if (r.status === "OK") ok++;
  else if (r.status === "WARN") warn++;
  else fail++;

  console.log(
    `${r.page.padEnd(18)} ${r.status.padEnd(5)} API=${r.apiSame ? "SAME" : "DIFF"} page=${r.pageLines}L hook=${r.hookLines}L Btns=${r.btnClicks}`,
  );
  console.log(`  APIs: ${r.curApi.join(", ") || "(none)"}`);
  console.log(`  Handlers in return: ${r.handlersReturned.join(", ") || "(none)"}`);
  if (r.issues.length) {
    for (const i of r.issues) console.log(`  - ${i}`);
  } else {
    console.log("  - no issues");
  }
  console.log("");
}

console.log("--- SUMMARY ---");
console.log(`OK:   ${ok}/3`);
console.log(`WARN: ${warn}/3`);
console.log(`FAIL: ${fail}/3`);
console.log(`API parity: ${results.filter((r) => r.apiSame).length}/3`);

process.exit(fail ? 1 : 0);
