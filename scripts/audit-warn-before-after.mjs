/**
 * Classify each WARN: PRE-EXISTING (before factor) vs INTRODUCED (after factor) vs INCOMPLETE (factor not finished).
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const root = process.cwd();
const report = JSON.parse(
  fs.readFileSync("scripts/audit-project-connectivity-report.json", "utf8"),
);

function gitShow(rel) {
  try {
    return execSync(`git show "HEAD:${rel.replace(/\\/g, "/")}"`, {
      encoding: "utf8",
      maxBuffer: 40e6,
      shell: true,
      cwd: root,
      stdio: ["ignore", "pipe", "ignore"],
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
    for (const part of m[1].split(",")) {
      const t = part.trim();
      if (!t) continue;
      const asM = t.match(/^(.+?)\s+as\s+(.+)$/);
      const name = asM ? asM[2].trim() : t;
      if (new RegExp(`\\b${name}\\s*\\(`).test(src)) names.add(name);
    }
  }
  if (/axiosInstance\.(get|post|put|delete)\s*\(/.test(src)) names.add("axiosInstance");
  return [...names].sort();
}

function handlers(src) {
  const names = new Set();
  for (const m of src.matchAll(
    /(?:const|function)\s+(handle[A-Z]\w*|load[A-Z]\w*|fetch[A-Z]\w*|configure[A-Z]\w*|execute[A-Z]\w*)\s*=/g,
  )) {
    names.add(m[1]);
  }
  return [...names].sort();
}

function usedInUi(name, ui) {
  return new RegExp(`\\b${name}\\b`).test(ui);
}

const warns = report.results.filter((x) => x.status === "WARN");
const rows = [];

for (const w of warns) {
  const signal = w.issues.filter(
    (i) => !i.startsWith("MISSING_") && !i.startsWith("NO_HEAD"),
  );
  if (!signal.length) continue;

  const file = w.file; // modules/...
  const head = gitShow(`src/${file}`);
  const curPage = fs.readFileSync(path.join(root, "src", file), "utf8");

  // locate current hook if any
  const hookImp = curPage.match(/from\s+["']\.\/hooks\/(use\w+)["']/);
  let curHook = "";
  let headHook = null;
  if (hookImp) {
    const hp = path.join(path.dirname(path.join(root, "src", file)), "hooks", `${hookImp[1]}.js`);
    const hp2 = hp.replace(/\.js$/, ".jsx");
    const hookPath = fs.existsSync(hp) ? hp : fs.existsSync(hp2) ? hp2 : null;
    if (hookPath) {
      curHook = fs.readFileSync(hookPath, "utf8");
      const rel = path.relative(root, hookPath).replace(/\\/g, "/");
      headHook = gitShow(rel);
    }
  }

  const formImp = curPage.match(/from\s+["']\.\/components\/([^"']+)["']/g);
  // gather UI for handler checks
  const dir = path.dirname(path.join(root, "src", file));
  let curForm = "";
  let headForm = null;
  const formFields = [
    ...curPage.matchAll(/from\s+["']\.\/components\/(\w+FormFields)["']/g),
  ];
  for (const m of formFields) {
    for (const ext of [".jsx", ".js"]) {
      const p = path.join(dir, "components", m[1] + ext);
      if (fs.existsSync(p)) {
        curForm += fs.readFileSync(p, "utf8");
        headForm = (headForm || "") + (gitShow(path.relative(root, p).replace(/\\/g, "/")) || "");
      }
    }
  }

  const verdicts = [];

  for (const iss of signal) {
    if (iss.startsWith("INCOMPLETE_FACTOR") || iss.startsWith("MONOLITH_API")) {
      // Page still has APIs — was it always a monolith at HEAD?
      const headHadHook =
        head && /use\w+Page\s*\(/.test(head) && /from\s+["']\.\/hooks\//.test(head);
      const headHadApis = apiCalls(head || "").length > 0;
      if (!head) {
        verdicts.push({
          issue: iss.split(":")[0],
          when: "UNKNOWN",
          why: "no HEAD file",
        });
      } else if (!headHadHook && headHadApis) {
        verdicts.push({
          issue: iss.split(":")[0],
          when: "PRE-EXISTING",
          why: "HEAD already monolith with APIs in page; chrome-only migrate, factor incomplete",
        });
      } else if (headHadHook) {
        verdicts.push({
          issue: iss.split(":")[0],
          when: "INTRODUCED",
          why: "HEAD had hook usage; current lost hook / put APIs back in page",
        });
      } else {
        verdicts.push({
          issue: iss.split(":")[0],
          when: "PRE-EXISTING",
          why: "HEAD was already unfactored",
        });
      }
    } else if (iss.startsWith("HALF_FACTOR") || iss.startsWith("API_IN_FORMFIELDS")) {
      const headMainView = head && /MainView\s*=/.test(head);
      const headApiInPage = apiCalls(head || "").length > 0;
      // Half factor means we extracted MainView but left logic in form — INTRODUCED as incomplete factor pattern
      if (head && !/from\s+["']\.\/hooks\//.test(head) && headApiInPage) {
        verdicts.push({
          issue: iss.split(":")[0],
          when: "INTRODUCED_BY_PARTIAL_FACTOR",
          why: "HEAD was monolith; partial factor left APIs in FormFields/MainView (not a behavior regression)",
        });
      } else {
        verdicts.push({
          issue: iss.split(":")[0],
          when: "INTRODUCED_BY_PARTIAL_FACTOR",
          why: "half-factor pattern after migration",
        });
      }
    } else if (iss.startsWith("API_ADDED") || iss.startsWith("API_REFACTORED")) {
      verdicts.push({
        issue: iss.split(":")[0],
        when: "INTRODUCED_AFTER_FACTOR",
        why: "API surface changed during/after factor (usually named wrappers replacing inline/axios) — not a lost API",
      });
    } else if (iss.startsWith("HANDLERS_NOT_IN_UI")) {
      const names = iss.replace("HANDLERS_NOT_IN_UI: ", "").split(",");
      for (const h of names) {
        const inHead = head && (handlers(head).includes(h) || new RegExp(`\\b${h}\\b`).test(head));
        const wiredHead = head && usedInUi(h, head);
        const inCurHook = curHook && new RegExp(`\\b${h}\\b`).test(curHook);
        const wiredCur = usedInUi(h, curPage + "\n" + curForm);
        if (inHead && !wiredHead) {
          verdicts.push({
            issue: h,
            when: "PRE-EXISTING",
            why: "handler existed at HEAD but was already unused in JSX",
          });
        } else if (inHead && wiredHead && !wiredCur) {
          verdicts.push({
            issue: h,
            when: "INTRODUCED_AFTER_FACTOR",
            why: "wired at HEAD, returned from hook now but not passed to UI",
          });
        } else if (!inHead && inCurHook && !wiredCur) {
          verdicts.push({
            issue: h,
            when: "INTRODUCED_AFTER_FACTOR",
            why: "new/exported after factor but never wired to UI",
          });
        } else {
          verdicts.push({
            issue: h,
            when: "CHECK",
            why: `headHas=${!!inHead} headWired=${!!wiredHead} curWired=${wiredCur}`,
          });
        }
      }
    } else {
      verdicts.push({ issue: iss.slice(0, 40), when: "OTHER", why: iss });
    }
  }

  rows.push({
    n: w.n,
    title: `${w.section} > ${w.title}`,
    comp: w.compName,
    signal,
    verdicts,
  });
}

console.log("=== WARN: BEFORE vs AFTER FACTOR ===\n");

const summary = {
  PRE_EXISTING: 0,
  INTRODUCED_AFTER_FACTOR: 0,
  INTRODUCED_BY_PARTIAL_FACTOR: 0,
  OTHER: 0,
};

for (const r of rows) {
  console.log(`${r.n}. ${r.title} (${r.comp})`);
  for (const v of r.verdicts) {
    summary[v.when] = (summary[v.when] || 0) + 1;
    console.log(`   [${v.when}] ${v.issue}`);
    console.log(`      → ${v.why}`);
  }
  console.log("");
}

console.log("=== COUNTS (verdict tags) ===");
Object.entries(summary).forEach(([k, v]) => console.log(`${k}: ${v}`));

fs.writeFileSync(
  "scripts/audit-warn-before-after.json",
  JSON.stringify({ rows, summary }, null, 2),
);
console.log("\nWrote scripts/audit-warn-before-after.json");
