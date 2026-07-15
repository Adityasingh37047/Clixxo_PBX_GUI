/**
 * High-signal runtime ReferenceError audit for factored FXS / E1-PRI pages.
 * Finds: missing React hook imports, missing useMediaQuery, page symbols
 * used but not imported/defined, hook return keys that are block-scoped locals.
 */
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const DIRS = [
  "src/modules/FXS",
  "src/modules/E1-PRI",
  "src/modules/CDR",
  "src/modules/System",
];

const REACT_HOOKS = [
  "useState",
  "useEffect",
  "useCallback",
  "useMemo",
  "useRef",
  "useLayoutEffect",
  "useReducer",
  "useContext",
  "useId",
  "useImperativeHandle",
  "useDeferredValue",
  "useTransition",
  "useSyncExternalStore",
];

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (/\.(jsx|js)$/.test(e.name)) acc.push(p);
  }
  return acc;
}

function strip(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "")
    .replace(/"(?:\\.|[^"\\])*"/g, '""')
    .replace(/'(?:\\.|[^'\\])*'/g, "''")
    .replace(/`(?:\\.|[^`\\])*`/g, "``");
}

function namedImports(src) {
  const names = new Set();
  for (const block of src.matchAll(
    /import\s+(?:[A-Za-z_$][\w$]*\s*,\s*)?\{([\s\S]*?)\}\s*from\s*['"][^'"]+['"]/g,
  )) {
    for (const part of block[1].split(",")) {
      const t = part.trim();
      if (!t) continue;
      const asM = t.match(/^(.+?)\s+as\s+(.+)$/);
      if (asM) {
        names.add(asM[1].trim());
        names.add(asM[2].trim());
      } else names.add(t);
    }
  }
  for (const m of src.matchAll(
    /import\s+([A-Za-z_$][\w$]*)\s*(?:,|\s+from)/g,
  )) {
    names.add(m[1]);
  }
  // import React, { x } / import useMediaQuery from ...
  for (const m of src.matchAll(
    /import\s+([A-Za-z_$][\w$]*)\s+from\s*['"][^'"]+['"]/g,
  )) {
    names.add(m[1]);
  }
  return names;
}

function reactNamespaceHooks(src) {
  // React.useMemo / React.useCallback count as available
  const set = new Set();
  for (const h of REACT_HOOKS) {
    if (new RegExp(`\\bReact\\.${h}\\b`).test(src)) set.add(h);
  }
  return set;
}

function usesIdentifier(clean, name) {
  return new RegExp(`\\b${name}\\b`).test(clean);
}

function isImportedOrDeclared(src, name) {
  const imports = namedImports(src);
  if (imports.has(name)) return true;
  if (new RegExp(`\\b(?:const|let|var|function|class)\\s+${name}\\b`).test(src))
    return true;
  if (new RegExp(`\\bexport\\s+(?:async\\s+)?function\\s+${name}\\b`).test(src))
    return true;
  if (new RegExp(`\\bexport\\s+const\\s+${name}\\b`).test(src)) return true;
  // destructure from import already covered; also export { X } from
  if (
    new RegExp(
      `export\\s*\\{[^}]*\\b${name}\\b[^}]*\\}\\s*from`,
    ).test(src)
  )
    return true;
  return false;
}

const issues = [];

function add(file, kind, detail) {
  issues.push({ file: path.relative(ROOT, file).replace(/\\/g, "/"), kind, detail });
}

const files = DIRS.flatMap((d) => walk(path.join(ROOT, d)));

for (const file of files) {
  const src = fs.readFileSync(file, "utf8");
  const clean = strip(src);
  const imports = namedImports(src);
  const nsHooks = reactNamespaceHooks(src);

  // 1) React hooks used bare without import
  for (const h of REACT_HOOKS) {
    if (!usesIdentifier(clean, h)) continue;
    if (nsHooks.has(h) && !usesIdentifier(clean, h)) continue;
    // count bare uses not React.h
    const bare = [
      ...clean.matchAll(new RegExp(`(?<!React\\.)\\b${h}\\s*\\(`, "g")),
    ];
    // JS lookbehind may not work in all — fallback:
    const all = [...clean.matchAll(new RegExp(`\\b${h}\\s*\\(`, "g"))];
    const reactPrefixed = [
      ...clean.matchAll(new RegExp(`\\bReact\\.${h}\\s*\\(`, "g")),
    ];
    const bareCount = all.length - reactPrefixed.length;
    if (bareCount <= 0) continue;
    if (imports.has(h)) continue;
    // also: import { useState, useEffect } from "react"
    if (
      /from\s*['"]react['"]/.test(src) &&
      new RegExp(`\\b${h}\\b`).test(
        src.match(/import\s*\{([\s\S]*?)\}\s*from\s*['"]react['"]/)?.[1] || "",
      )
    )
      continue;
    add(file, "missing-react-hook", h);
  }

  // 2) useMediaQuery
  if (usesIdentifier(clean, "useMediaQuery") && !isImportedOrDeclared(src, "useMediaQuery")) {
    // allow: import useMediaQuery from '@mui/material/useMediaQuery'
    if (!/useMediaQuery/.test([...namedImports(src)].join(",")) && !imports.has("useMediaQuery")) {
      const muiBlock =
        src.match(/import\s*\{([\s\S]*?)\}\s*from\s*['"]@mui\/material['"]/)?.[1] ||
        "";
      if (!/\buseMediaQuery\b/.test(muiBlock) && !/from\s*['"]@mui\/material\/useMediaQuery['"]/.test(src)) {
        add(file, "missing-useMediaQuery", "useMediaQuery");
      }
    }
  }

  // 3) Page files: common style/component names used without import
  const base = path.basename(file);
  if (/Page\.jsx$/.test(base) || /Page\.js$/.test(base)) {
    const pageCandidates = [
      ...clean.matchAll(
        /\b((?:pcm|fxs|e1|sip|route|port|ha|system)[A-Za-z]+(?:Style|Sx|Class|Config)|[A-Z][A-Za-z]+(?:ScrollbarStyles|Breadcrumb|TableListLoading|TableListEmptyState|FieldLabel|FieldRow)|addNewModalFooter(?:Btn)?Style|CARD_RADIUS|PCM_[A-Z0-9_]+|FXS_[A-Z0-9_]+|SIP_[A-Z0-9_]+)\b/g,
      ),
    ].map((m) => m[1]);

    const uniq = [...new Set(pageCandidates)];
    for (const sym of uniq) {
      if (isImportedOrDeclared(src, sym)) continue;
      // destructured from hook?
      const dest =
        src.match(/const\s*\{([\s\S]*?)\}\s*=\s*(?:vm|use[A-Za-z]+Page\s*\()/)?.[1] ||
        "";
      if (new RegExp(`\\b${sym}\\b`).test(dest)) continue;
      // ignore HTML / CSS-ish false positives
      if (/^(TABLE|DIV|SPAN|STYLE)$/.test(sym)) continue;
      add(file, "page-missing-symbol", sym);
    }
  }

  // 4) Hook return: keys that aren't hook-scope bindings (simple check)
  if (/hooks[/\\]use/.test(file) || /\/use[A-Z]/.test(file.replace(/\\/g, "/"))) {
    const idx = src.lastIndexOf("return {");
    if (idx >= 0) {
      let i = idx + "return ".length;
      while (i < src.length && src[i] !== "{") i++;
      let d = 0;
      const start = i;
      for (; i < src.length; i++) {
        if (src[i] === "{") d++;
        else if (src[i] === "}") {
          d--;
          if (d === 0) break;
        }
      }
      const block = src.slice(start, i + 1);
      const keys = [
        ...block.matchAll(/^\s{2,8}([A-Za-z_][A-Za-z0-9_]*)\s*[,}]/gm),
      ].map((m) => m[1]);

      // Find the exported hook function body start
      const fnMatch = src.match(
        /export\s+function\s+(use[A-Za-z0-9_]+)\s*\([^)]*\)\s*\{/,
      );
      if (fnMatch) {
        const fnStart = fnMatch.index + fnMatch[0].length;
        const fnBody = src.slice(fnStart, start);
        for (const key of keys) {
          // shorthand property — must be defined in hook body (not only inside nested function)
          // Heuristic: declared with const/let/function at 2-space indent typically
          const declaredTop = new RegExp(
            `(?:^|\\n)\\s{0,4}(?:const|let|var|function)\\s+${key}\\b`,
          ).test(fnBody);
          const param = new RegExp(`\\b${key}\\b`).test(fnMatch[0]);
          // also setX from useState
          const fromUseState =
            new RegExp(
              `\\[\\s*[^\\],]+\\s*,\\s*${key}\\s*\\]\\s*=\\s*useState`,
            ).test(fnBody) ||
            new RegExp(`\\[\\s*${key}\\s*,`).test(fnBody);
          const isImport = imports.has(key);
          if (!declaredTop && !param && !fromUseState && !isImport) {
            // could be true shorthand for nested-only binding — flag
            // Skip common React/false positives
            if (/^(React|true|false|null|undefined)$/.test(key)) continue;
            // Check if only declared inside a nested function/block (indent > 4 after blank)
            const nestedOnly =
              new RegExp(`(?:const|let|var|function)\\s+${key}\\b`).test(
                fnBody,
              ) && !declaredTop;
            if (nestedOnly || !new RegExp(`\\b${key}\\b`).test(fnBody)) {
              add(file, "hook-return-leak", key);
            }
          }
        }
      }
    }
  }
}

// Dedupe
const seen = new Set();
const unique = [];
for (const i of issues) {
  const k = `${i.file}|${i.kind}|${i.detail}`;
  if (seen.has(k)) continue;
  seen.add(k);
  unique.push(i);
}

const byKind = {};
for (const i of unique) {
  (byKind[i.kind] ||= []).push(i);
}

const out = [];
out.push("=== RUNTIME REF AUDIT ===\n");
for (const kind of Object.keys(byKind).sort()) {
  out.push(`--- ${kind} (${byKind[kind].length}) ---`);
  for (const i of byKind[kind]) out.push(`  ${i.file}: ${i.detail}`);
  out.push("");
}
out.push(`Total: ${unique.length}`);
const text = out.join("\n");
fs.writeFileSync(path.join(ROOT, "scripts/audit-runtime-refs.txt"), text);
console.log(text);
