/**
 * Full FXS + E1-PRI wiring audit:
 * - Page → hook connection
 * - Hook return keys vs page destructuring
 * - apiService usage (HEAD vs current)
 * - Missing symbol imports in FormFields/TableHelpers
 */
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const ROOT = process.cwd();

function walk(dir, acc = [], filter = /\.(jsx|js)$/) {
  if (!fs.existsSync(dir)) return acc;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc, filter);
    else if (filter.test(e.name)) acc.push(p);
  }
  return acc;
}

function gitShow(rel) {
  try {
    return execSync(`git show "HEAD:${rel}"`, {
      encoding: "utf8",
      maxBuffer: 20e6,
      shell: true,
    });
  } catch {
    return null;
  }
}

function extractApiCalls(src) {
  return [
    ...new Set(
      [...src.matchAll(/\b([a-z][a-zA-Z0-9]*(?:Fxs|E1|Port|Route|Num|PCM|Sip|Nat|Media|Trunk|Whitelist|Blacklist|Filtering|Number)[a-zA-Z0-9]*)\s*\(/g)].map(
        (m) => m[1],
      ),
    ),
  ].filter(
    (n) =>
      /^(fetch|save|list|get|update|create|delete|reset|status|load|upload|download)/i.test(
        n,
      ) || /Settings|Ports|Rules|Groups|Manipulation|Trunk|Route/i.test(n),
  );
}

function extractHookReturnKeys(hookSrc) {
  const ri = hookSrc.lastIndexOf("return {");
  if (ri < 0) return [];
  let i = ri + "return ".length;
  while (i < hookSrc.length && hookSrc[i] !== "{") i++;
  let d = 0;
  const start = i;
  for (; i < hookSrc.length; i++) {
    if (hookSrc[i] === "{") d++;
    else if (hookSrc[i] === "}") {
      d--;
      if (d === 0) {
        const block = hookSrc.slice(start, i + 1);
        return [
          ...new Set(
            [...block.matchAll(/^\s{2,6}([A-Za-z_][A-Za-z0-9_]*)\s*[,}]/gm)].map(
              (m) => m[1],
            ),
          ),
        ];
      }
    }
  }
  return [];
}

function extractPageUsedKeys(pageSrc, hookName) {
  const patterns = [
    new RegExp(`const\\s*\\{([\\s\\S]*?)\\}\\s*=\\s*${hookName}\\s*\\(`),
    new RegExp(
      `const\\s+vm\\s*=\\s*${hookName}\\s*\\([\\s\\S]*?const\\s*\\{([\\s\\S]*?)\\}\\s*=\\s*vm`,
    ),
  ];
  for (const re of patterns) {
    const m = pageSrc.match(re);
    if (m) {
      return m[1]
        .split(",")
        .map((s) =>
          s
            .trim()
            .replace(/\/\/.*$/, "")
            .split(":")[0]
            .split("=")[0]
            .trim(),
        )
        .filter((s) => s && /^[A-Za-z_]/.test(s));
    }
  }
  return [];
}

function getDefinedSymbols(src) {
  const defined = new Set(["React", "createFxsDialogPaperSx"]);
  for (const m of src.matchAll(/import\s*\{([\s\S]*?)\}\s*from/g)) {
    for (const part of m[1].split(",")) {
      const t = part.trim();
      if (!t) continue;
      const asM = t.match(/\bas\s+(\w+)$/);
      defined.add(asM ? asM[1] : t.split(/\s+/).pop());
    }
  }
  for (const m of src.matchAll(/import\s+(\w+)\s+from/g)) {
    if (!m[0].includes("{")) defined.add(m[1]);
  }
  for (const m of src.matchAll(/\bexport\s+const\s+(\w+)/g)) defined.add(m[1]);
  for (const m of src.matchAll(/\b(?:const|let|function)\s+(\w+)/g)) defined.add(m[1]);
  for (const block of src.matchAll(/export\s*\{([\s\S]*?)\}\s*from/g)) {
    for (const part of block[1].split(",")) {
      const t = part.trim();
      if (!t) continue;
      const asM = t.match(/\bas\s+(\w+)$/);
      if (asM) defined.add(asM[1]);
    }
  }
  return defined;
}

const COMMON_ALIASES = [
  ["fxsAddNewModalFooterBtnStyle", "addNewModalFooterBtnStyle as fxsAddNewModalFooterBtnStyle"],
  ["fxsPaginationStyle", "extensionPaginationStyle as fxsPaginationStyle"],
  ["FXS_CARD_RADIUS", "EXTENSION_TABLE_CARD_RADIUS as FXS_CARD_RADIUS"],
  ["fxsFixedAlertSx", "extensionFixedAlertSx as fxsFixedAlertSx"],
];

const report = {
  pageHookIssues: [],
  hookWiringIssues: [],
  apiIssues: [],
  importIssues: [],
  ok: [],
};

for (const mod of ["src/modules/FXS", "src/modules/E1-PRI"]) {
  const modDir = path.join(ROOT, mod);
  const pages = walk(modDir).filter(
    (f) =>
      /Page\.jsx$/.test(f) &&
      !f.includes("/hooks/") &&
      !f.includes("NumManipulatePage") &&
      !f.includes("NumberFilterPage"),
  );

  for (const pageFile of pages) {
    const rel = path.relative(ROOT, pageFile).replace(/\\/g, "/");
    const pageSrc = fs.readFileSync(pageFile, "utf8");
    const hookMatch = pageSrc.match(/use([A-Za-z0-9]+Page)\s*\(/);
    if (!hookMatch) {
      report.pageHookIssues.push({ file: rel, issue: "No use*Page hook call found" });
      continue;
    }
    const hookFn = `use${hookMatch[1]}`;
    const hookPathGuess = pageFile
      .replace(/[^/\\]+$/, `hooks/${hookFn}.js`)
      .replace(/hooks\/use(\w+)Page\.js$/, (_, n) => {
        const js = path.join(path.dirname(pageFile), "hooks", `${hookFn}.js`);
        const jsx = path.join(path.dirname(pageFile), "hooks", `${hookFn}.jsx`);
        if (fs.existsSync(js)) return `hooks/${hookFn}.js`;
        if (fs.existsSync(jsx)) return `hooks/${hookFn}.jsx`;
        return `hooks/${hookFn}.js`;
      });

    let hookFile = path.join(path.dirname(pageFile), "hooks", `${hookFn}.js`);
    if (!fs.existsSync(hookFile)) {
      hookFile = path.join(path.dirname(pageFile), "hooks", `${hookFn}.jsx`);
    }
    if (!fs.existsSync(hookFile)) {
      // search nearby
      const found = walk(modDir).find((f) => f.endsWith(`${hookFn}.js`) || f.endsWith(`${hookFn}.jsx`));
      if (found) hookFile = found;
    }

    if (!fs.existsSync(hookFile)) {
      report.pageHookIssues.push({ file: rel, issue: `Hook ${hookFn} file not found` });
      continue;
    }

    const hookSrc = fs.readFileSync(hookFile, "utf8");
    const used = extractPageUsedKeys(pageSrc, hookFn);
    const returned = extractHookReturnKeys(hookSrc);
    const missingFromHook = used.filter((k) => !returned.includes(k) && !hookSrc.includes(k));

    if (missingFromHook.length) {
      report.hookWiringIssues.push({
        page: rel,
        hook: path.relative(ROOT, hookFile).replace(/\\/g, "/"),
        missing: missingFromHook,
      });
    } else {
      report.ok.push(rel);
    }

    // API comparison with git HEAD
    const headSrc = gitShow(rel);
    if (headSrc) {
      const headApis = extractApiCalls(headSrc);
      const curApis = extractApiCalls(hookSrc + pageSrc);
      const missingApis = headApis.filter((a) => !curApis.some((c) => c === a || hookSrc.includes(a) || pageSrc.includes(a)));
      if (missingApis.length) {
        report.apiIssues.push({ file: rel, missingApis: missingApis, headApis, curApis });
      }
    }
  }

  // Import scan for FormFields + TableHelpers
  for (const file of walk(modDir).filter((f) => /FormFields\.jsx$|TableHelpers\.js$/.test(f))) {
    const src = fs.readFileSync(file, "utf8");
    const defined = getDefinedSymbols(src);
    for (const [sym] of COMMON_ALIASES) {
      if (src.includes(sym) && !defined.has(sym)) {
        // skip re-export-only files
        const uses = new RegExp(`[^.]\\b${sym}\\b`).test(src.replace(/export\s*\{[\s\S]*?\}\s*from/g, ""));
        if (uses) {
          report.importIssues.push({
            file: path.relative(ROOT, file).replace(/\\/g, "/"),
            symbol: sym,
          });
        }
      }
    }
  }
}

console.log("=== WIRING AUDIT REPORT ===\n");
console.log(`Pages OK (hook wiring): ${report.ok.length}`);
console.log(`Page→Hook issues: ${report.pageHookIssues.length}`);
console.log(`Hook destructuring issues: ${report.hookWiringIssues.length}`);
console.log(`API regressions (vs HEAD): ${report.apiIssues.length}`);
console.log(`Import issues: ${report.importIssues.length}\n`);

if (report.pageHookIssues.length) {
  console.log("--- Page→Hook issues ---");
  for (const i of report.pageHookIssues) console.log(`  ${i.file}: ${i.issue}`);
}

if (report.hookWiringIssues.length) {
  console.log("\n--- Hook destructuring missing keys ---");
  for (const i of report.hookWiringIssues) {
    console.log(`  ${i.page} ← ${i.hook}`);
    console.log(`    missing: ${i.missing.join(", ")}`);
  }
}

if (report.apiIssues.length) {
  console.log("\n--- API regressions vs git HEAD ---");
  for (const i of report.apiIssues) {
    console.log(`  ${i.file}: missing [${i.missingApis.join(", ")}]`);
  }
}

if (report.importIssues.length) {
  console.log("\n--- Import issues ---");
  for (const i of report.importIssues) console.log(`  ${i.file}: ${i.symbol}`);
}

fs.writeFileSync(
  path.join(ROOT, "scripts/audit-wiring-report.txt"),
  JSON.stringify(report, null, 2),
);
console.log("\nFull report: scripts/audit-wiring-report.txt");
