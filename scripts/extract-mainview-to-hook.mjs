/**
 * Extract state/handlers from *MainView into use*Page hook.
 * Expects FormFields to contain `export const XMainView = () => { ... return (`
 */
import fs from "fs";
import path from "path";

const pageName = process.argv[2];
if (!pageName) {
  console.error("Usage: node scripts/extract-mainview-to-hook.mjs <PageName>");
  process.exit(2);
}

const base = path.join("src", "modules", "Maitenance", "System Tools");
const formPath = path.join(base, "components", `${pageName}FormFields.jsx`);
const hookPath = path.join(base, "hooks", `use${pageName}Page.js`);
const pagePath = path.join(base, `${pageName}.jsx`);

const form = fs.readFileSync(formPath, "utf8");
const marker = `export const ${pageName}MainView = (`;
const idx = form.indexOf(marker);
if (idx < 0) {
  console.error("MainView not found");
  process.exit(1);
}

const after = form.slice(idx);
// Prefer the component JSX return, not `return () =>` cleanups.
let retIdx = -1;
const reReturn = /\n\s*return\s*\(\s*\n\s*</g;
let m;
while ((m = reReturn.exec(after))) {
  retIdx = m.index;
}
if (retIdx < 0) {
  // fallback: last `return (` in the MainView
  const all = [...after.matchAll(/\n\s*return\s*\(/g)];
  if (!all.length) {
    console.error("return ( not found");
    process.exit(1);
  }
  retIdx = all[all.length - 1].index;
}

const bodyStart = after.indexOf("{") + 1;
const logic = after.slice(bodyStart, retIdx);

const importLines = form.split("\n").filter((l) => {
  if (l.includes("axiosInstance") && l.includes("import")) return true;
  if (l.includes("apiService")) return true;
  return false;
});

const utilImports = [
  `import { passthrough${pageName} } from "../utils/${pageName}Transformers";`,
  `import { ok${pageName} } from "../utils/${pageName}Validators";`,
];

const constImportBlock = form.match(
  /import\s*\{[\s\S]*?\}\s*from\s*["']\.\.\/\.\.\/\.\.\/\.\.\/constants\/[^"']+["'];?/,
);

const reactHooks = [];
if (/\buseState\b/.test(logic)) reactHooks.push("useState");
if (/\buseEffect\b/.test(logic)) reactHooks.push("useEffect");
if (/\buseRef\b/.test(logic)) reactHooks.push("useRef");
if (/\buseCallback\b/.test(logic)) reactHooks.push("useCallback");

const returnNames = new Set();
for (const m of logic.matchAll(/\[(\w+),\s*(set\w+)\]\s*=\s*useState/g)) {
  returnNames.add(m[1]);
  returnNames.add(m[2]);
}
for (const m of logic.matchAll(/const\s+(\w+Ref)\s*=\s*useRef/g)) {
  returnNames.add(m[1]);
}
for (const m of logic.matchAll(
  /(?:const|function)\s+(handle\w+|load\w+|show\w+|fetch\w+|clear\w+|begin\w+|initiate\w+|check\w+|get\w+|ping\w+)\s*=/g,
)) {
  returnNames.add(m[1]);
}

const returnList = [...returnNames].sort().join(",\n    ");

const formHead = form.slice(0, idx);
const helperChunk = formHead
  .split("\n")
  .filter((l) => {
    if (l.trim().startsWith("import ")) return false;
    if (l.includes('from "./')) return false;
    if (l.includes("theme/pbxTokens")) return false;
    if (l.includes("components/common")) return false;
    return true;
  })
  .join("\n")
  .replace(/C\.cardShadow/g, '"0 0 14px rgba(0,0,0,0.18)"');

const hookSrc = `import { ${reactHooks.join(", ")} } from "react";
${constImportBlock ? constImportBlock[0] : ""}
${importLines.join("\n")}
${utilImports.join("\n")}

${helperChunk}

export function use${pageName}Page() {
${logic}
  void passthrough${pageName};
  void ok${pageName};

  return {
    ${returnList}
  };
}
`;

fs.writeFileSync(hookPath, hookSrc);

const closeMatch = after.lastIndexOf("};");
const jsxOnly = after.slice(retIdx, closeMatch + 2);

const rebuilt =
  formHead +
  `export const ${pageName}MainView = (props) => {
  const {
    ${returnList}
  } = props;
` +
  jsxOnly +
  "\n";

fs.writeFileSync(formPath, rebuilt);

fs.writeFileSync(
  pagePath,
  `import React from "react";
import { use${pageName}Page } from "./hooks/use${pageName}Page";
import { ${pageName}MainView } from "./components/${pageName}FormFields";

const ${pageName} = () => {
  const vm = use${pageName}Page();
  return <${pageName}MainView {...vm} />;
};

export default ${pageName};
`,
);

console.log("Extracted", pageName, "keys:", [...returnNames].join(", "));
console.log("hook lines", hookSrc.split("\n").length);
