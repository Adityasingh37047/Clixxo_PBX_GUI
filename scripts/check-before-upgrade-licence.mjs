import { execSync } from "child_process";

function show(rel) {
  return execSync(`git show "HEAD:${rel}"`, {
    encoding: "utf8",
    maxBuffer: 40e6,
    shell: true,
  });
}

function stats(label, src) {
  const lines = src.split(/\r?\n/).length;
  const hasLocalBtn = /const Btn\s*=/.test(src);
  const hasLocalC = /const C\s*=\s*\{/.test(src);
  const hasCommonBtn =
    /components\/common/.test(src) && /import\s*\{[^}]*\bBtn\b/.test(src);
  const apis = [];
  for (const m of src.matchAll(
    /import\s*\{([^}]+)\}\s*from\s*["'][^"']*apiService["']/g,
  )) {
    for (const p of m[1].split(",")) {
      const t = p.trim();
      if (!t) continue;
      const asM = t.match(/^(.+?)\s+as\s+(.+)$/);
      const name = asM ? asM[2].trim() : t;
      if (new RegExp(`\\b${name}\\s*\\(`).test(src)) apis.push(name);
    }
  }
  if (/axiosInstance\./.test(src)) apis.push("axiosInstance");

  const handlers = [
    ...src.matchAll(
      /(?:const|function)\s+(handle[A-Z]\w*|load[A-Z]\w*|fetch[A-Z]\w*|show[A-Z]\w*|check[A-Z]\w*)\s*=/g,
    ),
  ]
    .map((m) => m[1])
    .filter((h) => h !== "applyPressStyle" && h !== "clearPressStyle");

  console.log(`=== ${label} ===`);
  console.log(`lines: ${lines}`);
  console.log(
    "structure: ONE monolith file — UI + state + API handlers all inside same .jsx",
  );
  console.log(
    `local Btn: ${hasLocalBtn} | local C palette: ${hasLocalC} | common Btn: ${hasCommonBtn}`,
  );
  console.log(`APIs: ${apis.join(", ") || "(none)"}`);
  console.log(`handlers: ${[...new Set(handlers)].join(", ")}`);
  console.log("");
}

const up = show("src/modules/Maitenance/System Tools/Upgrade.jsx");
const lic = show("src/modules/Maitenance/System Tools/Licence.jsx");
stats("Upgrade BEFORE factor (git HEAD)", up);
stats("Licence BEFORE factor (git HEAD)", lic);

for (const f of [
  "src/modules/Maitenance/System Tools/hooks/useUpgradePage.js",
  "src/modules/Maitenance/System Tools/hooks/useLicencePage.js",
  "src/modules/Maitenance/System Tools/components/UpgradeFormFields.jsx",
  "src/modules/Maitenance/System Tools/components/LicenceFormFields.jsx",
  "src/modules/Maitenance/System Tools/components/UpgradeTableHelpers.js",
  "src/modules/Maitenance/System Tools/components/LicenceTableHelpers.js",
]) {
  try {
    show(f);
    console.log("UNEXPECTED existed at HEAD:", f);
  } catch {
    console.log("OK not at HEAD:", f);
  }
}
