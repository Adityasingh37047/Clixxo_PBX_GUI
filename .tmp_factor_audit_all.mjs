import fs from "fs";
import path from "path";

const PAIRS = [
  ["OutboundRoutes", "src/modules/PBX/CallControl/OutboundRoutesPage.jsx", "src/modules/PBX/CallControl/hooks/useOutboundRoutesPage.js"],
  ["IVR", "src/modules/PBX/CallFeatures/IVRPage.jsx", "src/modules/PBX/CallFeatures/hooks/useIVRPage.js"],
  ["CallQueue", "src/modules/PBX/CallFeatures/CallQueue.jsx", "src/modules/PBX/CallFeatures/hooks/useCallQueuePage.js"],
  ["Conference", "src/modules/PBX/CallFeatures/ConferencePage.jsx", "src/modules/PBX/CallFeatures/hooks/useConferencePage.js"],
  ["SipRegister", "src/modules/PBX/Trunks/SipRegisterPage.jsx", "src/modules/PBX/Trunks/hooks/useSipRegisterPage.js"],
  ["SystemToolsVPN", "src/modules/System/System Settings/SystemToolsVPN.jsx", "src/modules/System/System Settings/hooks/useSystemToolsVPNPage.js"],
  ["Extensions", "src/modules/PBX/Extensions/Extensions.jsx", "src/modules/PBX/Extensions/hooks/useExtensionsPage.js"],
];

function resolveFile(fromFile, rel) {
  const dir = path.dirname(fromFile);
  for (const c of [rel, rel + ".js", rel + ".jsx", path.join(rel, "index.js"), path.join(rel, "index.jsx")]) {
    const full = path.resolve(dir, c);
    if (fs.existsSync(full) && fs.statSync(full).isFile()) return full;
  }
  return null;
}

function parseReturnKeys(hook) {
  const last = hook.lastIndexOf("return {");
  if (last < 0) return new Set();
  let depth = 0, start = last + "return ".length, i = start;
  for (; i < hook.length; i++) {
    if (hook[i] === "{") depth++;
    else if (hook[i] === "}") { depth--; if (depth === 0) break; }
  }
  const returned = new Set();
  hook.slice(start + 1, i).split(",").forEach((part) => {
    const key = part.trim().split(":")[0].trim();
    if (/^[A-Za-z_][\w]*$/.test(key)) returned.add(key);
  });
  return returned;
}

function parseDest(page) {
  const dest = new Set();
  for (const re of [/const \{([\s\S]*?)\} = vm\b/g, /const \{([\s\S]*?)\} = use[A-Za-z]+\(\)/g]) {
    for (const m of page.matchAll(re)) {
      m[1].split(",").forEach((s) => {
        const t = s.trim().split("=")[0].trim();
        if (/^[A-Za-z_][\w]*$/.test(t)) dest.add(t);
      });
    }
  }
  return dest;
}

function parseImported(page) {
  const imported = new Set();
  for (const im of page.matchAll(/import\s+(?:([A-Za-z_][\w]*)\s*,?\s*)?(?:\{([^}]*)\})?\s*from/g)) {
    if (im[1]) imported.add(im[1]);
    if (im[2]) im[2].split(",").forEach((p) => {
      const parts = p.trim().split(/\s+as\s+/);
      const name = (parts[1] || parts[0] || "").trim();
      if (name) imported.add(name);
    });
  }
  return imported;
}

function localConsts(page) {
  const names = new Set();
  for (const m of page.matchAll(/(?:^|\n)(?:export\s+)?(?:const|function)\s+([A-Za-z_][\w]*)/g)) {
    names.add(m[1]);
  }
  return names;
}

function getExportedNames(filePath) {
  const src = fs.readFileSync(filePath, "utf8");
  const names = new Set();
  for (const m of src.matchAll(/export\s+(?:const|function|class|let|var)\s+([A-Za-z_][\w]*)/g)) names.add(m[1]);
  for (const m of src.matchAll(/export\s*\{([\s\S]*?)\}/g)) {
    m[1].split(",").forEach((p) => {
      const parts = p.trim().split(/\s+as\s+/);
      if (parts[0].trim()) names.add(parts[0].trim());
      if ((parts[1] || "").trim()) names.add(parts[1].trim());
    });
  }
  return names;
}

function audit(name, pagePath, hookPath) {
  const page = fs.readFileSync(pagePath, "utf8");
  const hook = fs.readFileSync(hookPath, "utf8");
  const returned = parseReturnKeys(hook);
  const dest = parseDest(page);
  const imported = parseImported(page);
  const locals = localConsts(page);
  const defined = new Set([...imported, ...dest, ...locals]);

  // Prefer main page component return: last "return (" that is likely the page
  const jsx = page.slice(page.lastIndexOf("return ("));

  // 1) Hook returned + used in JSX but not destructured
  const missingDestructure = [...returned].filter((r) => {
    if (dest.has(r)) return false;
    // SipRegister: isCompact may be used in local toolbar props before page return
    return new RegExp(`\\b${r}\\b`).test(jsx) || new RegExp(`\\b${r}\\b`).test(page);
  }).filter((r) => !dest.has(r)).sort();

  // For SipRegister special-case: if isCompact is in ANY vm destructure in file, remove
  // (already handled by parseDest scanning all vm blocks)

  // Re-check: only flag if used in page AFTER the page-level vm destructure
  // Simpler truth: used as free identifier and not defined
  const missingDestReal = missingDestructure.filter((r) => !defined.has(r));

  // 2) ALL_CAPS constants used in JSX/page body but not imported/defined
  const allCapsUsed = [...new Set([...page.matchAll(/\b([A-Z][A-Z0-9_]{2,})\b/g)].map((m) => m[1]))]
    .filter((u) => !defined.has(u))
    // ignore HTML-ish / common acronyms in strings? still in code tokens
    .filter((u) => !["HTTP", "HTTPS", "UDP", "TCP", "TLS", "JSON", "HTML", "CSS", "API", "URL", "URI", "DOM", "JSX", "MUI", "TODO", "FIXME", "NOTE"].includes(u))
    .filter((u) => new RegExp(`(?:borderRadius|style|sx|className|const|\\{|\\(|,|=)\\s*:?\\s*${u}\\b|\\b${u}\\b`).test(page))
    // only if appears as value/expression not only inside string/comment - rough: appears outside quotes hard; keep if used like CARD_RADIUS or FOO_BAR in style
    .filter((u) => {
      // must appear in an expression context: `: CARD_RADIUS` or `{CARD_RADIUS}` or `= CARD_RADIUS`
      return new RegExp(`(?::|\\{|\\(|\\+|\\?|,|=)\\s*${u}\\b`).test(page) || new RegExp(`\\b${u}\\s*[,;\\}]`).test(page);
    })
    .sort();

  // 3) Local relative imports broken (only ./* helpers)
  const broken = [];
  for (const im of page.matchAll(/from\s+["'](\.[^"']+)["']/g)) {
    const dir = path.dirname(pagePath);
    const rel = im[1];
    const ok = [rel, rel + ".js", rel + ".jsx", path.join(rel, "index.js"), path.join(rel, "index.jsx")]
      .some((c) => fs.existsSync(path.resolve(dir, c)));
    if (!ok) broken.push(rel);
  }
  for (const im of hook.matchAll(/from\s+["'](\.[^"']+)["']/g)) {
    const dir = path.dirname(hookPath);
    const rel = im[1];
    const ok = [rel, rel + ".js", rel + ".jsx", path.join(rel, "index.js"), path.join(rel, "index.jsx")]
      .some((c) => fs.existsSync(path.resolve(dir, c)));
    if (!ok) broken.push("hook:" + rel);
  }

  // 4) Named imports from local FormFields/TableHelpers/utils must be exported
  const missingExports = [];
  for (const im of page.matchAll(/import\s*\{([^}]+)\}\s*from\s*["'](\.\/[^"']+)["']/g)) {
    const full = resolveFile(pagePath, im[2]);
    if (!full) continue;
    // only audit our factor helper files
    if (!/(FormFields|TableHelpers|Transformers|Validators|hooks\/)/.test(im[2]) && !/^\.\/(IVR|CallQueue|Conference|Outbound|SipRegister|SystemTools)/.test(im[2])) {
      // still check FormFields/TableHelpers naming
      if (!/(FormFields|TableHelpers|Transformers|Validators)/.test(path.basename(full))) continue;
    }
    const exported = getExportedNames(full);
    im[1].split(",").forEach((p) => {
      const orig = p.trim().split(/\s+as\s+/)[0].trim();
      if (orig && !exported.has(orig)) missingExports.push(`${orig} <- ${im[2]}`);
    });
  }
  for (const im of hook.matchAll(/import\s*\{([^}]+)\}\s*from\s*["'](\.\.?\/[^"']+)["']/g)) {
    const full = resolveFile(hookPath, im[2]);
    if (!full) continue;
    if (!/(FormFields|TableHelpers|Transformers|Validators)/.test(path.basename(full)) && !/utils\//.test(im[2])) continue;
    const exported = getExportedNames(full);
    im[1].split(",").forEach((p) => {
      const orig = p.trim().split(/\s+as\s+/)[0].trim();
      if (orig && !exported.has(orig)) missingExports.push(`hook:${orig} <- ${im[2]}`);
    });
  }

  return { name, missingDestReal, allCapsUsed, broken, missingExports, destHas: Object.fromEntries(
    ["itemsPerPage", "ringBackOptions", "isCompact", "CARD_RADIUS"].map((k) => [k, { dest: dest.has(k), imported: imported.has(k), returned: returned.has(k) }])
  )};
}

let fail = 0;
for (const [name, page, hook] of PAIRS) {
  const r = audit(name, page, hook);
  const problems = [];
  if (r.missingDestReal.length) problems.push("missing vm destructure (used): " + r.missingDestReal.join(", "));
  if (r.allCapsUsed.length) problems.push("ALL_CAPS used but not imported: " + r.allCapsUsed.join(", "));
  if (r.broken.length) problems.push("broken relative imports: " + r.broken.join(", "));
  if (r.missingExports.length) problems.push("import not exported: " + r.missingExports.join(", "));

  if (problems.length) {
    fail++;
    console.log("\n❌ " + r.name);
    problems.forEach((p) => console.log("   - " + p));
  } else {
    console.log("✅ " + r.name);
  }
}
console.log(`\nResult: ${PAIRS.length - fail}/${PAIRS.length} clean`);
process.exit(fail ? 1 : 0);
