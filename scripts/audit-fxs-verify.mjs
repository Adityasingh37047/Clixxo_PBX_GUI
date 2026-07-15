import { execSync } from "child_process";
import fs from "fs";

const show = (p) =>
  execSync(`git show "HEAD:${p}"`, {
    encoding: "utf8",
    maxBuffer: 20e6,
    shell: true,
  });

const lines = [];

// Advanced full handleSave
{
  const h = show("src/modules/FXS/Port/PortFxsAdvancedPage.jsx");
  const i = h.indexOf("const handleSave");
  const j = h.indexOf("const handleReset", i);
  lines.push("## Advanced HEAD handleSave full\n" + h.slice(i, j));
}

// Num create else branch
{
  const h = show("src/modules/FXS/Num Manipulate/FxsIPCallInCallerID.jsx");
  const i = h.indexOf("} else {");
  // find the else after updateData
  const upd = h.indexOf("updateNumberManipulation(updateData");
  const elseIdx = h.indexOf("} else {", upd);
  lines.push("\n## IPCaller create else\n" + h.slice(elseIdx, elseIdx + 450));
}

// PortGroup newGroup in HEAD
{
  const h = show("src/modules/FXS/Port/PortGroupPage.jsx");
  const i = h.indexOf("const newGroup");
  lines.push("\n## PortGroup newGroup\n" + h.slice(i, i + 550));
}

// Media validateForm messages in HEAD
{
  const h = show("src/modules/FXS/VoIP/FxsVoipMediaPage.jsx");
  const i = h.indexOf("const validateForm");
  const j = h.indexOf("const handleSave", i);
  const body = h.slice(i, j);
  const msgs = [...body.matchAll(/alert\(\s*["']([^"']+)["']/g)].map((m) => m[1]);
  lines.push("\n## Media HEAD validate alerts:\n" + msgs.join("\n"));
  const c = fs.readFileSync(
    "src/modules/FXS/VoIP/utils/FxsVoipMediaValidators.js",
    "utf8"
  );
  const cms = [...c.matchAll(/return\s+["']([^"']+)["']/g)].map((m) => m[1]);
  lines.push("\n## Media CUR validate returns:\n" + cms.join("\n"));
  const missing = msgs.filter((m) => !cms.includes(m));
  lines.push("\nMISSING in CUR: " + (missing.join(" | ") || "(none)"));
}

// Route IpToTel HEAD save rule object (with id)
{
  const h = show("src/modules/FXS/Route/RouteIpToTelPage.jsx");
  const i = h.indexOf("const indexNum");
  lines.push("\n## IpToTel HEAD normalize area\n" + h.slice(i, i + 500));
}

// Voip SIP APIs + status poll
{
  const h = show("src/modules/FXS/VoIP/FxsVoipSipPage.jsx");
  const c = fs.readFileSync("src/modules/FXS/VoIP/hooks/useFxsVoipSipPage.js", "utf8");
  for (const api of [
    "listFxsSipSettings",
    "saveFxsSipSettings",
    "resetFxsSipSettings",
    "statusFxsSipSettings",
  ]) {
    lines.push(
      `${api}: HEAD=${h.includes(api)} CUR=${c.includes(api)}`
    );
  }
  lines.push(
    "status poll/interval HEAD=" +
      /setInterval|STATUS_POLL|poll/i.test(h) +
      " CUR=" +
      /setInterval|STATUS_POLL|poll/i.test(c)
  );
}

// Hook returns used by pages (vm. pattern)
{
  const checks = [
    [
      "PortFxsPage",
      "src/modules/FXS/Port/PortFxsPage.jsx",
      "src/modules/FXS/Port/hooks/usePortFxsPage.js",
      "usePortFxsPage",
    ],
    [
      "PortGroupPage",
      "src/modules/FXS/Port/PortGroupPage.jsx",
      "src/modules/FXS/Port/hooks/usePortGroupPage.js",
      "usePortGroupPage",
    ],
    [
      "FxsVoipSipPage",
      "src/modules/FXS/VoIP/FxsVoipSipPage.jsx",
      "src/modules/FXS/VoIP/hooks/useFxsVoipSipPage.js",
      "useFxsVoipSipPage",
    ],
    [
      "RouteIpToTel",
      "src/modules/FXS/Route/RouteIpToTelPage.jsx",
      "src/modules/FXS/Route/hooks/useRouteIpToTelPage.js",
      "useRouteIpToTelPage",
    ],
    [
      "IPCaller",
      "src/modules/FXS/Num Manipulate/FxsIPCallInCallerID.jsx",
      "src/modules/FXS/Num Manipulate/hooks/useIPCallInCallerIDPage.js",
      "useIPCallInCallerIDPage",
    ],
    [
      "PSTNCaller",
      "src/modules/FXS/Num Manipulate/FxsPSTNCallInCallerID.jsx",
      "src/modules/FXS/Num Manipulate/hooks/usePSTNCallInCallerIDPage.js",
      "usePSTNCallInCallerIDPage",
    ],
  ];
  for (const [name, page, hook, hookName] of checks) {
    const p = fs.readFileSync(page, "utf8");
    const h = fs.readFileSync(hook, "utf8");
    // destructure after hook call
    const call = p.indexOf(`${hookName}(`);
    const brace = p.indexOf("{", call > 0 ? call - 80 : 0);
    // find const { ... } = vm or = useX
    let used = [];
    const m1 = p.match(
      new RegExp(
        `(?:const|let)\\s+(\\{[\\s\\S]*?\\})\\s*=\\s*(?:vm|${hookName}\\()`
      )
    );
    // Prefer destructure of vm after const vm = useX
    const vmMatch = p.match(/const\s+vm\s*=\s*\w+\([\s\S]*?const\s*\{([\s\S]*?)\}\s*=\s*vm/);
    const direct = p.match(
      new RegExp(`const\\s*\\{([\\s\\S]*?)\\}\\s*=\\s*${hookName}\\s*\\(`)
    );
    const block = vmMatch?.[1] || direct?.[1] || "";
    used = block
      .split(",")
      .map((s) =>
        s
          .trim()
          .replace(/\/\/.*$/, "")
          .split("=")[0]
          .split(":")[0]
          .trim()
      )
      .filter((s) => s && /^[A-Za-z_]/.test(s));

    const ri = h.lastIndexOf("return {");
    let retKeys = [];
    if (ri >= 0) {
      let i = ri + "return ".length;
      while (i < h.length && h[i] !== "{") i++;
      let d = 0;
      const start = i;
      for (; i < h.length; i++) {
        if (h[i] === "{") d++;
        else if (h[i] === "}") {
          d--;
          if (d === 0) {
            const block2 = h.slice(start, i + 1);
            retKeys = [
              ...block2.matchAll(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*[,}]/gm),
            ].map((x) => x[1]);
            // also key:
            retKeys = [
              ...new Set([
                ...retKeys,
                ...[...block2.matchAll(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*,/gm)].map(
                  (x) => x[1]
                ),
                ...[...block2.matchAll(/([A-Za-z_][A-Za-z0-9_]*)\s*,/g)]
                  .map((x) => x[1])
                  .filter((k) => !["true", "false", "null"].includes(k)),
              ]),
            ];
            break;
          }
        }
      }
    }
    // simpler: extract identifiers at start of lines in return block
    const retBlock = h.slice(ri, h.indexOf(";", ri) > 0 ? Math.min(h.length, ri + 800) : ri + 800);
    const simpleKeys = [
      ...retBlock.matchAll(/^\s{2,4}([A-Za-z_][A-Za-z0-9_]*)\s*,?\s*$/gm),
    ].map((m) => m[1]);
    const missingFromHook = used.filter(
      (u) => !simpleKeys.includes(u) && !retBlock.includes(u)
    );
    lines.push(
      `\n## Hook wiring ${name}: used=${used.length} ret~${simpleKeys.length} missingFromHook=${missingFromHook.join(",") || "none"}`
    );
  }
}

fs.writeFileSync("scripts/audit-fxs-verify.txt", lines.join("\n"));
console.log(lines.join("\n"));
