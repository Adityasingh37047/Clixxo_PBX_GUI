import fs from "fs";
import path from "path";

function cleanHook(pageName) {
  const p = path.join(
    "src",
    "modules",
    "Maitenance",
    "System Tools",
    "hooks",
    `use${pageName}Page.js`,
  );
  let s = fs.readFileSync(p, "utf8");
  // Remove duplicate React imports that came from FormFields head
  s = s.replace(
    /import React,\s*\{[^}]+\}\s*from\s*["']react["'];?\s*\n/g,
    (m, offset) => (offset < 80 ? m : ""),
  );
  // If still two imports of hooks from react at top
  const lines = s.split("\n");
  let seenReact = false;
  const out = [];
  for (const line of lines) {
    if (/^import\s+.*from\s+["']react["']/.test(line)) {
      if (seenReact) continue;
      seenReact = true;
      // Prefer named hooks import without default React if both exist
      if (line.includes("import React")) {
        const hooks = line.match(/\{([^}]+)\}/);
        if (hooks) {
          out.push(`import { ${hooks[1].trim()} } from "react";`);
          continue;
        }
      }
    }
    out.push(line);
  }
  s = out.join("\n");
  // Remove style-only leftovers wrongly copied into hook
  s = s.replace(/const CARD_RADIUS[\s\S]*?const FIELD_RADIUS[\s\S]*?;\s*\n/g, "");
  s = s.replace(
    /import \{\s*C, OUTLINED_BORDER[\s\S]*?pbxTokens["'];?\s*\n/,
    "",
  );
  s = s.replace(
    /import \{[\s\S]*?Btn, ExtensionBreadcrumb[\s\S]*?common["'];?\s*\n/,
    "",
  );
  s = s.replace(
    /import \{[\s\S]*?TableHelpers["'];?\s*\n/,
    "",
  );
  s = s.replace(/C\.cardShadow/g, '"0 0 14px rgba(0,0,0,0.18)"');
  s = s.replace(/catch\s*\(\s*_\s*\)\s*\{\s*\}/g, "catch { /* ignore */ }");
  fs.writeFileSync(p, s);
  console.log("cleaned hook", pageName);
}

function cleanForm(pageName) {
  const p = path.join(
    "src",
    "modules",
    "Maitenance",
    "System Tools",
    "components",
    `${pageName}FormFields.jsx`,
  );
  let s = fs.readFileSync(p, "utf8");
  // Drop apiService / axios imports from FormFields (logic is in hook)
  s = s.replace(
    /import\s*\{[^}]*\}\s*from\s*["'][^"']*apiService["'];?\s*\n/g,
    "",
  );
  s = s.replace(
    /import\s+axiosInstance\s+from\s+["'][^"']+["'];?\s*\n/g,
    "",
  );
  s = s.replace(
    /import React,\s*\{[^}]*\}\s*from\s*["']react["'];?/,
    'import React from "react";',
  );
  // Keep only styles used — filter unused alias imports loosely by commenting not ideal
  // Remove helper defs that belong in hook: formatVersionValue / createInitialRows blocks if still present
  s = s.replace(
    /const formatVersionValue[\s\S]*?^const createInitialRows[\s\S]*?\};\s*\n/m,
    "",
  );
  s = s.replace(/const VERSION_FIELDS[\s\S]*?\];\s*\n/m, "");
  fs.writeFileSync(p, s);
  console.log("cleaned form", pageName);
}

cleanHook("Upgrade");
cleanHook("Licence");
cleanForm("Upgrade");
cleanForm("Licence");
