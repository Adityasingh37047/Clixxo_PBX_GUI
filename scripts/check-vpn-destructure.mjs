import fs from "fs";

const page = fs.readFileSync(
  "src/modules/System/System Settings/SystemToolsVPN.jsx",
  "utf8",
);
const hook = fs.readFileSync(
  "src/modules/System/System Settings/hooks/useSystemToolsVPNPage.js",
  "utf8",
);

const m =
  page.match(/const\s*\{([\s\S]*?)\}\s*=\s*vm/) ||
  page.match(/const\s*\{([\s\S]*?)\}\s*=\s*useSystemToolsVPNPage\s*\(/);

if (!m) {
  console.log("FAIL: no destructure found");
  process.exit(2);
}

const dest = m[1]
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
  .filter((s) => s && /^[A-Za-z_]/.test(s));

const retBlock = hook.slice(hook.lastIndexOf("return {"));
const end = retBlock.indexOf("};");
const body = retBlock.slice(0, end + 1);
const missing = dest.filter((k) => !new RegExp(`\\b${k}\\b`).test(body));

console.log("destructure count", dest.length);
console.log("missing", missing);
console.log(missing.length ? "FAIL" : "OK all page keys in hook return");
process.exit(missing.length ? 2 : 0);
