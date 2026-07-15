import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const base = path.join("src", "modules", "Maitenance", "System Tools");

for (const p of ["Upgrade", "Licence"]) {
  const rel = `src/modules/Maitenance/System Tools/${p}.jsx`;
  const src = execSync(`git show "HEAD:${rel}"`, {
    encoding: "utf8",
    maxBuffer: 40e6,
    shell: true,
  });
  const out = path.join(base, "components", `${p}FormFields.jsx`);
  fs.writeFileSync(out, src, "utf8");
  console.log(p, "wrote", src.length, "chars", "starts", src.slice(0, 20));
}
