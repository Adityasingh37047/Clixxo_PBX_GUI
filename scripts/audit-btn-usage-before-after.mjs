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

function findBtns(src) {
  const re = /<Btn\b([^>]*)>/g;
  const hits = [];
  let m;
  while ((m = re.exec(src))) {
    const attrs = m[1];
    const variant = (attrs.match(/variant=["']([^"']+)["']/) || [])[1] || "default";
    const style = (attrs.match(/style=\{([^}]+)\}/) || [])[1] || "(none)";
    const hasSizeOverride =
      /advancedFormBtnStyle|storageFormBtnStyle|storageHeader|storageBackup|routingHeader|vpnSave|vpnToolbar|minWidth|height:/.test(
        attrs,
      );
    hits.push({ variant, style: style.slice(0, 100), hasSizeOverride });
  }
  return hits;
}

const pages = [
  [
    "Network",
    "/system-tools/network",
    "src/modules/System/System Settings/Network.jsx",
    "src/modules/System/System Settings/components/NetworkFormFields.jsx",
  ],
  [
    "Storage",
    "/system-tools/storage",
    "src/modules/System/System Settings/Storage.jsx",
    "src/modules/System/System Settings/components/StorageFormFields.jsx",
  ],
  [
    "Routing",
    "/system-tools/routing-interface",
    "src/modules/System/System Settings/RoutingInterface.jsx",
    "src/modules/System/System Settings/components/RoutingInterfaceFormFields.jsx",
  ],
  [
    "VPN",
    "/system-tools/vpn",
    "src/modules/System/System Settings/SystemToolsVPN.jsx",
    "src/modules/System/System Settings/components/SystemToolsVPNFormFields.jsx",
  ],
];

const report = [];

for (const [name, route, page, form] of pages) {
  const before = gitShow(page) || "";
  const afterAll =
    fs.readFileSync(page, "utf8") +
    "\n" +
    (fs.existsSync(form) ? fs.readFileSync(form, "utf8") : "");

  // VPN page at HEAD already imported Btn from common via FormFields path sometimes
  let beforeAll = before;
  if (name === "VPN") {
    const oldForm = gitShow(
      "src/modules/System/System Settings/SystemToolsVPNFormFields.jsx",
    );
    if (oldForm) beforeAll += "\n" + oldForm;
  }

  const b = findBtns(beforeAll);
  const a = findBtns(afterAll);

  console.log(`\n==== ${name} (${route}) ====`);
  console.log(`BEFORE Btn count: ${b.length}`);
  console.log(`AFTER  Btn count: ${a.length}`);

  const riskyBefore = b.filter(
    (x) =>
      !x.hasSizeOverride &&
      (x.variant === "primary" || x.variant === "cancel"),
  );
  const riskyAfter = a.filter(
    (x) =>
      !x.hasSizeOverride &&
      (x.variant === "primary" || x.variant === "cancel"),
  );

  console.log(
    `BEFORE primary/cancel WITHOUT size style: ${riskyBefore.length}`,
  );
  riskyBefore.forEach((x, i) =>
    console.log(`  B${i + 1}`, x.variant, x.style),
  );
  console.log(`AFTER  primary/cancel WITHOUT size style: ${riskyAfter.length}`);
  riskyAfter.forEach((x, i) =>
    console.log(`  A${i + 1}`, x.variant, x.style),
  );

  console.log("BEFORE all:");
  b.forEach((x, i) =>
    console.log(
      `  ${i + 1}. ${x.variant} sizeStyle=${x.hasSizeOverride} style=${x.style}`,
    ),
  );
  console.log("AFTER all:");
  a.forEach((x, i) =>
    console.log(
      `  ${i + 1}. ${x.variant} sizeStyle=${x.hasSizeOverride} style=${x.style}`,
    ),
  );

  report.push({
    name,
    route,
    beforeCount: b.length,
    afterCount: a.length,
    riskyBefore: riskyBefore.length,
    riskyAfter: riskyAfter.length,
    before: b,
    after: a,
  });
}

/**
 * Local HEAD Network Btn (primary/cancel) effective defaults WITHOUT style prop:
 * height 38, padding 8px 32px, fontSize 14
 * Common Btn defaults: height 30, padding 6px 14px, fontSize 12
 *
 * When style=advancedFormBtnStyle is applied, both settle to height 30 / 6px 14px / fs 12.
 */
console.log("\n=== VERDICT ===");
for (const r of report) {
  const unsizedAfter = r.after.filter(
    (x) =>
      !x.hasSizeOverride &&
      (x.variant === "primary" || x.variant === "cancel"),
  );
  if (unsizedAfter.length) {
    console.log(
      `⚠ ${r.route}: ${unsizedAfter.length} primary/cancel Btn(s) have NO size style — common Btn default (h30) may differ from old local Btn default (h38) if that page used local Btn before.`,
    );
  } else {
    console.log(
      `✓ ${r.route}: every primary/cancel Btn has an explicit size style — final size matches before (style object audit).`,
    );
  }
}

fs.writeFileSync(
  "scripts/audit-btn-usage-before-after.json",
  JSON.stringify(report, null, 2),
);
