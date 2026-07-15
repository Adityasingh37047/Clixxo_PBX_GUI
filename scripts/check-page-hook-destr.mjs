import fs from "fs";
import path from "path";

const base = "src/modules/Maitenance/System Tools";
const pages = fs.readdirSync(base).filter((f) => f.endsWith(".jsx"));
const bad = [];

for (const f of pages) {
  const name = f.replace(".jsx", "");
  const page = fs.readFileSync(path.join(base, f), "utf8");
  const hookP = path.join(base, "hooks", `use${name}Page.js`);
  if (!fs.existsSync(hookP)) continue;
  const hook = fs.readFileSync(hookP, "utf8");
  const formP = path.join(base, "components", `${name}FormFields.jsx`);
  const form = fs.existsSync(formP) ? fs.readFileSync(formP, "utf8") : "";

  if (/MainView/.test(form) && hook.split("\n").length < 20) continue;

  const m = page.match(/const\s*\{([\s\S]*?)\}\s*=\s*vm/);
  if (!m) continue;

  const keys = m[1]
    .split(",")
    .map((s) =>
      s
        .trim()
        .replace(/\/\/.*$/, "")
        .split("=")[0]
        .trim()
        .split(":")[0]
        .trim(),
    )
    .filter((s) => /^[A-Za-z_]/.test(s));

  const ret = hook.slice(hook.lastIndexOf("return {"));
  const miss = keys.filter((k) => !new RegExp(`\\b${k}\\b`).test(ret));
  if (miss.length) bad.push(`${name}: ${miss.join(",")}`);
}

console.log(
  bad.length
    ? `BROKEN DESTRUCTURE\n${bad.join("\n")}`
    : "ALL page↔hook destructures OK (complete-factor pages)",
);
