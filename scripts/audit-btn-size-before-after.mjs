/**
 * Before/after button size audit for System Settings factored pages.
 * Compares HEAD monolith (or HEAD formfields) vs current.
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

function gitShow(rel) {
  try {
    return execSync(`git show "HEAD:${rel.replace(/\\/g, "/")}"`, {
      encoding: "utf8",
      maxBuffer: 30e6,
      shell: true,
    });
  } catch {
    return null;
  }
}

function stripComments(s) {
  return s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
}

/** Parse object literal properties at top level (brace depth 1). */
function parseStyleObject(body) {
  const props = {};
  let depth = 0;
  let i = 0;
  let key = "";
  let mode = "key"; // key | value
  let val = "";
  const flush = () => {
    const k = key.trim();
    const v = val.trim().replace(/,\s*$/, "");
    if (k && v) props[k] = v.replace(/^['"`]|['"`]$/g, "");
    key = "";
    val = "";
    mode = "key";
  };
  while (i < body.length) {
    const ch = body[i];
    if (ch === "{") depth++;
    if (ch === "}") depth--;
    if (depth === 0 && mode === "key") {
      if (/[A-Za-z_]/.test(ch)) {
        // start key
        const m = body.slice(i).match(/^([A-Za-z_][\w]*)\s*:/);
        if (m) {
          key = m[1];
          i += m[0].length;
          mode = "value";
          val = "";
          continue;
        }
      }
    }
    if (mode === "value") {
      if ((ch === "," || ch === "\n") && depth === 0) {
        flush();
        i++;
        continue;
      }
      val += ch;
    }
    i++;
  }
  if (key) flush();
  return props;
}

function extractBtnStyles(src) {
  const clean = stripComments(src);
  const results = [];
  const re =
    /(?:export\s+)?const\s+(\w+(?:Btn|Button)\w*Style|advancedFormBtnStyle|addNewModalFooterBtnStyle|extension(?:Cancel|Primary)BtnStyle|extensionModalCancelBtnStyle)\s*=\s*\{/g;
  let m;
  while ((m = re.exec(clean))) {
    const start = m.index + m[0].length - 1;
    let depth = 0;
    let end = start;
    for (let i = start; i < clean.length; i++) {
      if (clean[i] === "{") depth++;
      else if (clean[i] === "}") {
        depth--;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    const body = clean.slice(start + 1, end);
    const props = parseStyleObject(body);
    results.push({
      name: m[1],
      height: props.height || null,
      padding: props.padding || null,
      fontSize: props.fontSize || null,
      minWidth: props.minWidth || null,
      borderRadius: props.borderRadius || null,
      rawKeys: Object.keys(props).sort().join(","),
    });
  }
  return results;
}

function aliasTarget(src, name) {
  // export const foo = bar  OR  const foo = { ...bar, x }
  const re = new RegExp(
    `(?:export\\s+)?const\\s+${name}\\s*=\\s*([A-Za-z_][\\w]*)\\s*;`,
  );
  const m = src.match(re);
  return m ? m[1] : null;
}

function resolveStyle(src, name, stack = new Set()) {
  if (stack.has(name)) return { name, circular: true };
  stack.add(name);
  const styles = extractBtnStyles(src);
  const hit = styles.find((s) => s.name === name);
  if (hit) return hit;
  // maybe alias / spread
  const alias = aliasTarget(src, name);
  if (alias) {
    const resolved = resolveStyle(src, alias, stack);
    return { ...resolved, via: alias, name };
  }
  // spread pattern: export const x = { ...y, minWidth: undefined }
  const spread = src.match(
    new RegExp(
      `(?:export\\s+)?const\\s+${name}\\s*=\\s*\\{\\s*\\.\\.\\.([A-Za-z_][\\w]*)\\s*,([\\s\\S]*?)\\};`,
    ),
  );
  if (spread) {
    const base = resolveStyle(src, spread[1], stack);
    const extra = parseStyleObject(spread[2]);
    return {
      name,
      via: spread[1],
      height: extra.height || base.height || null,
      padding: extra.padding || base.padding || null,
      fontSize: extra.fontSize || base.fontSize || null,
      minWidth:
        extra.minWidth !== undefined
          ? extra.minWidth === "undefined"
            ? "(cleared)"
            : extra.minWidth
          : base.minWidth || null,
      borderRadius: extra.borderRadius || base.borderRadius || null,
    };
  }
  return { name, missing: true };
}

const COMMON = fs.readFileSync("src/components/common/modalKit.jsx", "utf8");

const PAGES = [
  {
    name: "Network",
    route: "/system-tools/network",
    headPage: "src/modules/System/System Settings/Network.jsx",
    curFiles: [
      "src/modules/System/System Settings/components/NetworkFormFields.jsx",
      "src/modules/System/System Settings/components/NetworkTableHelpers.js",
      "src/modules/System/System Settings/Network.jsx",
    ],
    keys: ["advancedFormBtnStyle"],
  },
  {
    name: "Storage",
    route: "/system-tools/storage",
    headPage: "src/modules/System/System Settings/Storage.jsx",
    curFiles: [
      "src/modules/System/System Settings/components/StorageFormFields.jsx",
      "src/modules/System/System Settings/components/StorageTableHelpers.js",
      "src/modules/System/System Settings/Storage.jsx",
    ],
    keys: [
      "storageFormBtnStyle",
      "storageHeaderBtnStyle",
      "storageHeaderTabBtnStyle",
      "storageBackupActionBtnStyle",
    ],
  },
  {
    name: "Routing Interface",
    route: "/system-tools/routing-interface",
    headPage: "src/modules/System/System Settings/RoutingInterface.jsx",
    curFiles: [
      "src/modules/System/System Settings/components/RoutingInterfaceFormFields.jsx",
      "src/modules/System/System Settings/components/RoutingInterfaceTableHelpers.js",
      "src/modules/System/System Settings/RoutingInterface.jsx",
    ],
    keys: ["advancedFormBtnStyle", "routingHeaderBtnStyle"],
  },
  {
    name: "VPN",
    route: "/system-tools/vpn",
    headPage: "src/modules/System/System Settings/SystemToolsVPN.jsx",
    headExtra: [
      "src/modules/System/System Settings/SystemToolsVPNFormFields.jsx",
      "src/modules/System/System Settings/components/SystemToolsVPNFormFields.jsx",
    ],
    curFiles: [
      "src/modules/System/System Settings/components/SystemToolsVPNFormFields.jsx",
      "src/modules/System/System Settings/components/SystemToolsVPNTableHelpers.js",
      "src/modules/System/System Settings/SystemToolsVPN.jsx",
    ],
    keys: ["vpnSaveBtnStyle", "vpnToolbarBtnStyle"],
  },
];

function loadJoin(files) {
  return files
    .map((f) => (fs.existsSync(f) ? fs.readFileSync(f, "utf8") : ""))
    .join("\n");
}

function headJoin(page, extras = []) {
  let s = gitShow(page) || "";
  for (const e of extras) {
    const x = gitShow(e);
    if (x) s += "\n" + x;
  }
  // also try without components/ path for VPN
  return s;
}

function sizeKey(s) {
  if (!s || s.missing) return "MISSING";
  return `h=${s.height}|p=${s.padding}|fs=${s.fontSize}|mw=${s.minWidth}|br=${s.borderRadius}`;
}

const commonResolved = {
  addNewModalFooterBtnStyle: resolveStyle(COMMON, "addNewModalFooterBtnStyle"),
  extensionCancelBtnStyle: resolveStyle(COMMON, "extensionCancelBtnStyle"),
  extensionPrimaryBtnStyle: resolveStyle(COMMON, "extensionPrimaryBtnStyle"),
};

console.log("=== COMMON STYLES ===");
for (const [k, v] of Object.entries(commonResolved)) {
  console.log(k, sizeKey(v), v);
}

const diffs = [];

for (const page of PAGES) {
  console.log(`\n======== ${page.name} (${page.route}) ========`);
  const beforeSrc = headJoin(page.headPage, page.headExtra || []);
  const afterSrc = loadJoin(page.curFiles) + "\n" + COMMON;

  for (const key of page.keys) {
    const before = resolveStyle(beforeSrc, key);
    let after = resolveStyle(afterSrc, key);
    // if after aliases into common names via TableHelpers import rename,
    // resolveStyle on joined file should still find addNewModalFooterBtnStyle...
    // but `export const storageFormBtnStyle = storageFormBtnStyleFromCommon` may need help
    if (after.missing || after.via) {
      // try following imports in helpers: `addNewModalFooterBtnStyle as networkFormBtnStyle`
      const helper = page.curFiles.find((f) => f.includes("TableHelpers"));
      if (helper && fs.existsSync(helper)) {
        const h = fs.readFileSync(helper, "utf8");
        const asMap = [
          ...h.matchAll(
            /(\w+)\s+as\s+(\w+)/g,
          ),
        ];
        for (const [, from, to] of asMap) {
          if (after.via === to || key.includes(to.replace(/^(network|storage|routing|vpn)/, "")) || afterSrc.includes(`${key} = ${to}`) || afterSrc.includes(`as ${to}`)) {
            if (from in commonResolved || extractBtnStyles(COMMON).some((x) => x.name === from)) {
              const c = resolveStyle(COMMON, from);
              if (!c.missing) {
                after = { ...c, name: key, via: from };
              }
            }
          }
        }
      }
    }

    // Special cases from known wiring:
    if (key === "advancedFormBtnStyle" || key === "storageFormBtnStyle" || key === "vpnSaveBtnStyle") {
      const c = commonResolved.addNewModalFooterBtnStyle;
      // check if after ultimately uses that
      if (
        afterSrc.includes("addNewModalFooterBtnStyle as") ||
        afterSrc.includes(`${key} = networkFormBtnStyle`) ||
        afterSrc.includes(`${key} = routingFormBtnStyle`) ||
        afterSrc.includes(`${key} = storageFormBtnStyleFromCommon`) ||
        afterSrc.includes(`${key} = vpnFormBtnStyle`) ||
        afterSrc.includes("advancedFormBtnStyle = networkFormBtnStyle") ||
        afterSrc.includes("advancedFormBtnStyle = routingFormBtnStyle") ||
        afterSrc.includes("vpnSaveBtnStyle = vpnFormBtnStyle")
      ) {
        after = { ...c, name: key, via: "addNewModalFooterBtnStyle" };
      }
    }
    if (key === "vpnToolbarBtnStyle") {
      // after: { ...vpnFormBtnStyle, minWidth: undefined }
      const c = commonResolved.addNewModalFooterBtnStyle;
      after = {
        name: key,
        via: "addNewModalFooterBtnStyle + minWidth cleared",
        height: c.height,
        padding: c.padding,
        fontSize: c.fontSize,
        minWidth: "(cleared)",
        borderRadius: c.borderRadius,
      };
    }

    const bKey = sizeKey(before);
    const aKey = sizeKey(after);
    const same =
      before.height == after.height &&
      before.padding == after.padding &&
      before.fontSize == after.fontSize &&
      String(before.minWidth) === String(after.minWidth) &&
      String(before.borderRadius).replace(/['"]/g, "") ===
        String(after.borderRadius).replace(/['"]/g, "");

    // normalize 4 vs "4px"
    const norm = (v) =>
      String(v || "")
        .replace(/['"]/g, "")
        .replace(/^4px$/, "4");
    const sameNorm =
      norm(before.height) === norm(after.height) &&
      norm(before.padding) === norm(after.padding) &&
      norm(before.fontSize) === norm(after.fontSize) &&
      (norm(before.minWidth) === norm(after.minWidth) ||
        (before.minWidth == null && after.minWidth === "(cleared)") ||
        (before.minWidth == null &&
          (after.minWidth == null || after.minWidth === "(cleared)"))) &&
      norm(before.borderRadius) === norm(after.borderRadius);

    const status = sameNorm ? "SAME" : "DIFF";
    console.log(`[${status}] ${key}`);
    console.log(`  BEFORE: ${bKey}`, before.missing ? "(missing)" : "");
    console.log(`  AFTER:  ${aKey}`, after.via ? `(via ${after.via})` : "");

    if (!sameNorm) {
      diffs.push({
        page: page.name,
        route: page.route,
        key,
        before,
        after,
      });
    }
  }
}

console.log("\n=== SUMMARY ===");
if (!diffs.length) {
  console.log("No button size diffs (height/padding/fontSize/minWidth/borderRadius).");
} else {
  console.log(`${diffs.length} button size DIFF(s):`);
  for (const d of diffs) {
    console.log(
      `- ${d.route} (${d.page}) :: ${d.key}`,
    );
    console.log(
      `  before mw=${d.before.minWidth} h=${d.before.height} p=${d.before.padding}`,
    );
    console.log(
      `  after  mw=${d.after.minWidth} h=${d.after.height} p=${d.after.padding}`,
    );
  }
}

fs.writeFileSync(
  "scripts/audit-btn-size-before-after.txt",
  JSON.stringify({ common: commonResolved, diffs }, null, 2),
);
