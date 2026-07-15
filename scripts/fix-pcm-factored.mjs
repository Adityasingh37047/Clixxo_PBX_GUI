/**
 * Fix PCM factored pages: clean hook imports; trim conflicting Page imports.
 * node scripts/fix-pcm-factored.mjs
 */
import fs from "fs";
import path from "path";

const PCM = path.resolve("src/modules/E1-PRI/PCM");
const HEAD = path.resolve("scripts/_head_pcm");

function extractBalanced(src, openBraceIdx) {
  let depth = 0;
  for (let i = openBraceIdx; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") {
      depth--;
      if (depth === 0)
        return { body: src.slice(openBraceIdx + 1, i), end: i };
    }
  }
  return null;
}

function splitComponent(src, componentName) {
  const compRe = new RegExp(
    `const ${componentName}\\s*=\\s*\\(\\)\\s*=>\\s*\\{`,
  );
  const compMatch = src.match(compRe);
  const bodyStart = compMatch.index + compMatch[0].length;
  let depth = 1;
  let returnIdx = -1;
  for (let i = bodyStart; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") {
      depth--;
      if (depth === 0) break;
    } else if (
      src[i] === "r" &&
      depth === 1 &&
      src.slice(i, i + 7) === "return " &&
      /[\s;{}]/.test(src[i - 1] || " ")
    ) {
      returnIdx = i;
      break;
    }
  }
  const logicBody = src.slice(bodyStart, returnIdx).trim();
  let j = returnIdx + "return".length;
  while (/\s/.test(src[j])) j++;
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
  return {
    logicBody,
    jsxReturn: src.slice(returnIdx, jsxEnd).trim(),
    preComponent: src.slice(0, compMatch.index),
  };
}

function collectReturns(logicBody) {
  const returned = new Set();
  const stateRe = /const\s*\[\s*([A-Za-z_][\w]*)\s*,\s*([A-Za-z_][\w]*)\s*\]/g;
  let m;
  while ((m = stateRe.exec(logicBody))) {
    returned.add(m[1]);
    returned.add(m[2]);
  }
  for (const line of logicBody.split("\n")) {
    const trimmed = line.trim();
    const cm = trimmed.match(
      /^(?:const|let|function)\s+([A-Za-z_][\w]*)\s*[=(]/,
    );
    if (cm) returned.add(cm[1]);
  }
  return [...returned].filter((id) => {
    if (id.startsWith("validate")) return false;
    const re = new RegExp(
      `(?:const|let|function)\\s+${id}\\b|\\[\\s*${id}\\s*,`,
    );
    return re.test(logicBody);
  });
}

function stripChromeFromPre(pre) {
  let out = pre.replace(/^import[\s\S]*?;\s*$/gm, "");
  out = out.replace(/const C = \{[\s\S]*?\n\};\n*/m, "");
  out = out.replace(/const Btn = \([\s\S]*?\n\};\n*/m, "");
  out = out.replace(/const TH = \([\s\S]*?\n\};\n*/m, "");
  out = out.replace(/const tdStyle = \{[\s\S]*?\n\};\n*/m, "");
  out = out.replace(/const checkboxSx = \{[\s\S]*?\n\};\n*/m, "");
  out = out.replace(
    /const PCM_[A-Z_]+_COMPACT_MQ = "\(max-width: 768px\)";\n*/g,
    "",
  );
  // Remove local Breadcrumb components (use shared)
  out = out.replace(
    /const Pcm\w+Breadcrumb = \(\) => \([\s\S]*?\n\);\n*/m,
    "",
  );
  // Remove local FieldLabel components (use shared)
  out = out.replace(
    /const Pcm\w+FieldLabel = \(\{[\s\S]*?\n\};\n*/m,
    "",
  );
  out = out.replace(
    /const formatFieldTooltipTitle = \([\s\S]*?\n\};\n*/m,
    "",
  );
  out = out.replace(/const FIELD_LABEL_COLOR = [^;]+;\n*/g, "");
  out = out.replace(/const FIELD_TOOLTIP_PROPS = \{[\s\S]*?\n\};\n*/m, "");
  return out.trim() + "\n";
}

// ── Rebuild Pstn + CircuitMaintenance hooks cleanly (JSX render helpers) ──
for (const cfg of [
  {
    file: "PcmPstnPage.jsx",
    prefix: "PcmPstn",
    constants: "PcmPstnConstants",
    apis: "listPstn, createPstn, deletePstn",
    extraValidator: `import { validateFormData } from "../utils/PcmPstnValidators";`,
    patchValidate: true,
  },
  {
    file: "PcmCircuitMaintenancePage.jsx",
    prefix: "PcmCircuitMaintenance",
    constants: "PcmCircuitMaintenanceConstants",
    apis: "listPstn, listChannelState",
    extraValidator: "",
    patchValidate: false,
  },
]) {
  const src = fs.readFileSync(path.join(HEAD, cfg.file), "utf8");
  const componentName = cfg.file.replace(".jsx", "");
  const { logicBody, preComponent } = splitComponent(src, componentName);
  let hookLogic = logicBody;
  if (cfg.patchValidate) {
    hookLogic = hookLogic.replace(
      /const\s+validateFormData\s*=\s*\([^)]*\)\s*=>\s*\{[\s\S]*?\n  \};\n?/,
      "",
    );
    hookLogic = hookLogic.replace(
      /validateFormData\(formData\)/g,
      "validateFormData(formData, editIndex, allData)",
    );
  }
  const pageLocal = stripChromeFromPre(preComponent);
  const returns = collectReturns(hookLogic);
  const SCREAMING = cfg.prefix
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .toUpperCase();

  // Collect unique MUI + icon imports from original
  const importLines = [];
  const seen = new Set();
  for (const block of src.match(/^import[\s\S]*?from\s+["'][^"']+["'];?\s*$/gm) || []) {
    if (block.includes("apiService")) continue;
    if (block.includes("constants/")) continue;
    if (/from\s+["']react["']/.test(block)) continue;
    if (seen.has(block)) continue;
    seen.add(block);
    importLines.push(block);
  }

  const constImport = (
    src.match(
      /import\s*\{([^}]+)\}\s*from\s*["']\.\.\/\.\.\/\.\.\/constants\/[^"']+["']/,
    ) || []
  )[1];

  const content = `import React, { useState, useEffect, useRef } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  ${constImport.trim()}
} from "../../../../constants/${cfg.constants}";
import {
  ${cfg.apis}
} from "../../../../api/apiService";
${cfg.extraValidator}
${importLines.filter((l) => !l.includes("useMediaQuery")).join("\n")}
import {
  Btn,
  TH,
  C,
  tdStyle,
  checkboxSx,
  ${cfg.prefix}Breadcrumb,
  ${cfg.prefix}FieldLabel,
  ${SCREAMING}_COMPACT_MQ,
} from "../components/${cfg.prefix}FormFields";

/* Page-local styles/helpers used by render functions */
${pageLocal}

export function use${cfg.prefix}Page() {
${hookLogic}

  return {
    ${returns.join(",\n    ")},
  };
}
`;
  fs.writeFileSync(
    path.join(PCM, `hooks/use${cfg.prefix}Page.jsx`),
    content.replace(/\r\n/g, "\n"),
  );
  console.log("rewrote hook", cfg.prefix);
}

// ── Trim conflicting imports on TrunkGroup + NumReceivingRule pages ──
for (const page of ["PcmTrunkGroupPage.jsx", "PcmNumReceivingRulePage.jsx"]) {
  let s = fs.readFileSync(path.join(PCM, page), "utf8");
  const prefix = page.replace("Page.jsx", "");
  const camel = prefix.charAt(0).toLowerCase() + prefix.slice(1);

  // Replace FormFields import with minimal set
  s = s.replace(
    /import \{\n  Btn,[\s\S]*?\} from "\.\/components\/Pcm\w+FormFields";/,
    `import {
  Btn,
  TH,
  C,
  tdStyle,
  checkboxSx,
  ${prefix}Breadcrumb,
} from "./components/${prefix}FormFields";`,
  );

  // Replace TableHelpers import with minimal set (avoid wrap/selected that are local)
  s = s.replace(
    /import \{\n  CARD_RADIUS,[\s\S]*?\} from "\.\/components\/Pcm\w+TableHelpers";/,
    `import {
  CARD_RADIUS,
  ${camel}FixedAlertSx,
  ${camel}EditIconStyle,
  handle${prefix}EditIconHover,
  get${prefix}RowBg,
} from "./components/${prefix}TableHelpers";`,
  );

  fs.writeFileSync(path.join(PCM, page), s.replace(/\r\n/g, "\n"));
  console.log("trimmed imports", page);
}

console.log("fix done");
