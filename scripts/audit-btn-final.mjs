import { execSync } from "child_process";
import fs from "fs";

function gitShow(p) {
  try {
    return execSync(`git show "HEAD:${p}"`, {
      encoding: "utf8",
      maxBuffer: 30e6,
      shell: true,
    });
  } catch {
    return null;
  }
}

/** Match <Btn ...> including multiline props until > */
function findBtns(src) {
  const re = /<Btn\b([\s\S]*?)>/g;
  const hits = [];
  let m;
  while ((m = re.exec(src))) {
    const attrs = m[1];
    // skip closing-only weirdness
    if (attrs.includes("</")) continue;
    const variant =
      (attrs.match(/variant\s*=\s*\{?\s*["']([^"']+)["']/) ||
        attrs.match(/variant\s*=\s*\{([^}]+)\}/) ||
        [])[1] || "default";
    const styleM = attrs.match(/style\s*=\s*\{([\s\S]*?)\}(?:\s|\/|$)/);
    const style = styleM ? styleM[1].replace(/\s+/g, " ").trim().slice(0, 120) : "(none)";
    const hasSizeOverride =
      /advancedFormBtnStyle|storageFormBtnStyle|storageHeader|storageBackup|routingHeader|vpnSave|vpnToolbar|minWidth\s*:|height\s*:/.test(
        attrs,
      );
    hits.push({
      variant: String(variant).replace(/['"`]/g, ""),
      style,
      hasSizeOverride,
    });
  }
  return hits;
}

function extractObject(src, name) {
  const re = new RegExp(
    `(?:export\\s+)?const\\s+${name}\\s*=\\s*\\{([\\s\\S]*?)\\n\\};`,
  );
  const m = src.match(re);
  if (!m) return null;
  const body = m[1];
  const get = (k) => {
    const mm = body.match(new RegExp(`${k}\\s*:\\s*([^,\\n]+)`));
    return mm ? mm[1].trim().replace(/['"]/g, "") : null;
  };
  return {
    height: get("height"),
    padding: get("padding"),
    fontSize: get("fontSize"),
    minWidth: get("minWidth"),
    borderRadius: get("borderRadius"),
  };
}

const pages = [
  {
    name: "Network",
    route: "/system-tools/network",
    head: "src/modules/System/System Settings/Network.jsx",
    cur: [
      "src/modules/System/System Settings/Network.jsx",
      "src/modules/System/System Settings/components/NetworkFormFields.jsx",
    ],
    styles: ["advancedFormBtnStyle"],
  },
  {
    name: "Storage",
    route: "/system-tools/storage",
    head: "src/modules/System/System Settings/Storage.jsx",
    cur: [
      "src/modules/System/System Settings/Storage.jsx",
      "src/modules/System/System Settings/components/StorageFormFields.jsx",
    ],
    styles: [
      "storageFormBtnStyle",
      "storageHeaderBtnStyle",
      "storageHeaderTabBtnStyle",
      "storageBackupActionBtnStyle",
    ],
  },
  {
    name: "Routing",
    route: "/system-tools/routing-interface",
    head: "src/modules/System/System Settings/RoutingInterface.jsx",
    cur: [
      "src/modules/System/System Settings/RoutingInterface.jsx",
      "src/modules/System/System Settings/components/RoutingInterfaceFormFields.jsx",
    ],
    styles: ["advancedFormBtnStyle", "routingHeaderBtnStyle"],
  },
  {
    name: "VPN",
    route: "/system-tools/vpn",
    head: "src/modules/System/System Settings/SystemToolsVPN.jsx",
    headExtra: "src/modules/System/System Settings/SystemToolsVPNFormFields.jsx",
    cur: [
      "src/modules/System/System Settings/SystemToolsVPN.jsx",
      "src/modules/System/System Settings/components/SystemToolsVPNFormFields.jsx",
    ],
    styles: ["vpnSaveBtnStyle", "vpnToolbarBtnStyle"],
    alwaysCommonBtn: true,
  },
];

const common = fs.readFileSync("src/components/common/modalKit.jsx", "utf8");
const commonFooter = extractObject(common, "addNewModalFooterBtnStyle");
console.log("common addNewModalFooterBtnStyle:", commonFooter);

let anyDiff = false;

for (const p of pages) {
  let beforeSrc = gitShow(p.head) || "";
  if (p.headExtra) beforeSrc += "\n" + (gitShow(p.headExtra) || "");
  const afterSrc = p.cur.map((f) => fs.readFileSync(f, "utf8")).join("\n");

  console.log(`\n######## ${p.name} ${p.route} ########`);

  // Style object compare
  for (const s of p.styles) {
    const b = extractObject(beforeSrc, s);
    let a = extractObject(afterSrc, s);
    // aliases
    if (!a) {
      if (s === "advancedFormBtnStyle" || s === "storageFormBtnStyle" || s === "vpnSaveBtnStyle") {
        a = { ...commonFooter, note: "via common addNewModalFooterBtnStyle" };
      }
      if (s === "vpnToolbarBtnStyle") {
        a = {
          height: commonFooter.height,
          padding: commonFooter.padding,
          fontSize: commonFooter.fontSize,
          minWidth: null,
          borderRadius: commonFooter.borderRadius,
          note: "via common + minWidth cleared",
        };
      }
    }
    const norm = (v) =>
      String(v ?? "")
        .replace(/px$/, "")
        .replace(/['"]/g, "");
    const same =
      b &&
      a &&
      norm(b.height) === norm(a.height) &&
      norm(b.padding) === norm(a.padding) &&
      norm(b.fontSize) === norm(a.fontSize) &&
      norm(b.minWidth) === norm(a.minWidth);
    console.log(
      `${same ? "SAME" : "DIFF"} style ${s}: before=${JSON.stringify(b)} after=${JSON.stringify(a)}`,
    );
    if (!same) anyDiff = true;
  }

  const bBtns = findBtns(beforeSrc);
  const aBtns = findBtns(afterSrc);
  console.log(`Btn tags before=${bBtns.length} after=${aBtns.length}`);

  // Check if before used local Btn (const Btn =)
  const hadLocalBtn = /const Btn\s*=/.test(beforeSrc);
  const usesCommonBtn = /from ["'].*components\/common/.test(
    afterSrc.split("export default")[0] || afterSrc.slice(0, 2000),
  );
  console.log(`hadLocalBtnBefore=${hadLocalBtn} alwaysCommon=${!!p.alwaysCommonBtn}`);

  if (hadLocalBtn) {
    // find primary/cancel without size style — those would change 38→30
    const riskB = bBtns.filter(
      (x) =>
        !x.hasSizeOverride &&
        (x.variant === "primary" || x.variant === "cancel"),
    );
    const riskA = aBtns.filter(
      (x) =>
        !x.hasSizeOverride &&
        (x.variant === "primary" || x.variant === "cancel"),
    );
    if (riskB.length || riskA.length) {
      console.log(
        `⚠ SIZE RISK: local Btn primary/cancel default was h=38/pad=8px 32px/fs=14; common is h=30/pad=6px 14px/fs=12`,
      );
      console.log(`  unsized before=${riskB.length} after=${riskA.length}`);
      anyDiff = true;
    } else {
      console.log(
        `OK: all primary/cancel had explicit size styles; final metrics match (style objects SAME).`,
      );
    }
  } else {
    console.log(`OK: page already used shared/common Btn pattern (or no local Btn).`);
  }
}

console.log("\n=== FINAL ===");
console.log(
  anyDiff
    ? "Found potential size diffs — see details above."
    : "No button size changes detected on Network/Storage/Routing/VPN.",
);
