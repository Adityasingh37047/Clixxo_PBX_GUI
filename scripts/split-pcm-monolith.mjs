/**
 * Splits a PCM monolith into hook (logic) + thin Page (JSX), plus chrome stubs.
 * Usage: node scripts/split-pcm-monolith.mjs PcmTrunkPage
 */
import fs from "fs";
import path from "path";

const ROOT = path.resolve(".");
const PCM = path.join(ROOT, "src/modules/E1-PRI/PCM");
const HEAD = path.join(ROOT, "scripts/_head_pcm");

const name = process.argv[2];
if (!name) {
  console.error("Usage: node scripts/split-pcm-monolith.mjs <PageName>");
  process.exit(1);
}

const src = fs.readFileSync(path.join(HEAD, `${name}.jsx`), "utf8");
const componentName = name; // e.g. PcmTrunkPage
const hookName = `use${name.replace(/Page$/, "")}Page`; // usePcmTrunkPage
const prefix = name.replace(/Page$/, ""); // PcmTrunk
const camel = prefix.charAt(0).toLowerCase() + prefix.slice(1);

const compRe = new RegExp(
  `const ${componentName}\\s*=\\s*\\(\\)\\s*=>\\s*\\{`,
);
const compMatch = src.match(compRe);
if (!compMatch) {
  console.error("Could not find component", componentName);
  process.exit(1);
}

const bodyStart = compMatch.index + compMatch[0].length;

// Find the top-level return ( of the component by brace depth from bodyStart
let depth = 1;
let returnIdx = -1;
for (let i = bodyStart; i < src.length; i++) {
  const c = src[i];
  if (c === "{") depth++;
  else if (c === "}") {
    depth--;
    if (depth === 0) break;
  } else if (c === "r" && depth === 1 && src.slice(i, i + 7) === "return ") {
    // check it's start of return statement
    const prev = src[i - 1];
    if (!prev || /[\s;{}]/.test(prev)) {
      returnIdx = i;
      break;
    }
  }
}

if (returnIdx < 0) {
  console.error("Could not find top-level return");
  process.exit(1);
}

const logicBody = src.slice(bodyStart, returnIdx).trim();

// Extract JSX return including semicolon
let j = returnIdx + "return".length;
while (j < src.length && /\s/.test(src[j])) j++;
if (src[j] !== "(") {
  console.error("Expected return (");
  process.exit(1);
}
let pDepth = 0;
let jsxEnd = -1;
for (let i = j; i < src.length; i++) {
  if (src[i] === "(") pDepth++;
  else if (src[i] === ")") {
    pDepth--;
    if (pDepth === 0) {
      jsxEnd = i + 1;
      if (src[jsxEnd] === ";") jsxEnd++;
      break;
    }
  }
}
const jsxReturn = src.slice(returnIdx, jsxEnd).trim();

// Collect identifiers assigned in logic for return object
const returned = new Set();
const stateRe = /const\s*\[\s*([A-Za-z_][\w]*)\s*,\s*([A-Za-z_][\w]*)\s*\]/g;
let m;
while ((m = stateRe.exec(logicBody))) {
  returned.add(m[1]);
  returned.add(m[2]);
}
const constRe =
  /(?:const|let|function)\s+([A-Za-z_][\w]*)\s*(?:=|\()/g;
while ((m = constRe.exec(logicBody))) {
  const id = m[1];
  if (!["showMessage", "showToast", "displayToast"].includes(id)) {
    // include handlers and derived
  }
  returned.add(id);
}
// always include common setters used in JSX
["setMessage", "setToast", "setFormData", "setForm", "setSelected"].forEach(
  (x) => {
    if (logicBody.includes(x)) returned.add(x);
  },
);

const returnList = [...returned].filter(
  (id) =>
    !["useState", "useEffect", "useRef", "useMemo", "useCallback"].includes(id),
);

// Detect imports from original needed by hook
const importLines = src
  .split("\n")
  .filter((l) => l.startsWith("import "))
  .join("\n");

console.log("logic chars", logicBody.length, "jsx chars", jsxReturn.length);
console.log("return keys", returnList.length);

// Write diagnostic split files for review (not final)
fs.mkdirSync(path.join(PCM, "_split_tmp"), { recursive: true });
fs.writeFileSync(
  path.join(PCM, "_split_tmp", `${prefix}-logic.js`),
  logicBody,
);
fs.writeFileSync(
  path.join(PCM, "_split_tmp", `${prefix}-jsx.jsx`),
  jsxReturn,
);
fs.writeFileSync(
  path.join(PCM, "_split_tmp", `${prefix}-returns.json`),
  JSON.stringify(returnList, null, 2),
);
console.log("Wrote _split_tmp diagnostics for", prefix);
