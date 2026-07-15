/**
 * Semi-automated factor: copies HEAD monolith into FormFields shell and extracts
 * a stub thin page — used when pages are too large to rewrite by hand in one turn.
 *
 * Usage: node scripts/factor-sys-tools-page.mjs Restart
 *
 * This creates the file skeleton if missing; for full factor prefer hand/agent work.
 * Prefer: run against pages that are already partially structured.
 */
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const pageName = process.argv[2];
if (!pageName) {
  console.error("Usage: node scripts/factor-sys-tools-page.mjs <PageName>");
  process.exit(2);
}

const base = path.join("src", "modules", "Maitenance", "System Tools");
const pagePath = path.join(base, `${pageName}.jsx`);
const pfx =
  pageName === "SystemToolsSqlUpload"
    ? "sqlUpload"
    : pageName.charAt(0).toLowerCase() + pageName.slice(1);

function ensureDir(d) {
  fs.mkdirSync(d, { recursive: true });
}

const files = {
  helpers: path.join(base, "components", `${pageName}TableHelpers.js`),
  form: path.join(base, "components", `${pageName}FormFields.jsx`),
  hook: path.join(base, "hooks", `use${pageName}Page.js`),
  xform: path.join(base, "utils", `${pageName}Transformers.js`),
  val: path.join(base, "utils", `${pageName}Validators.js`),
};

if (!fs.existsSync(pagePath)) {
  console.error("Missing page", pagePath);
  process.exit(1);
}

const already =
  fs.existsSync(files.hook) &&
  fs.readFileSync(pagePath, "utf8").includes(`use${pageName}Page`);
if (already) {
  console.log(`${pageName} already looks factored.`);
  process.exit(0);
}

console.log(
  `This helper only scaffolds empty stubs. Factor ${pageName} manually — exiting.`,
);
process.exit(1);
