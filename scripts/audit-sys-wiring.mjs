/**
 * Compare HEAD monolith vs factored System Settings page wiring:
 * - API calls (identifiers used as call expr from apiService / fetch)
 * - Key handler names
 * - Hook return keys vs page destructure
 * - Critical string literals (confirm, reboot, endpoints)
 */
import { execSync } from "child_process";
import fs from "fs";

function gitShow(rel) {
  try {
    return execSync(`git show "HEAD:${rel.replace(/\\/g, "/")}"`, {
      encoding: "utf8",
      maxBuffer: 40e6,
      shell: true,
    });
  } catch {
    return null;
  }
}

function strip(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "")
    .replace(/`(?:\\.|[^`\\])*`/g, "``")
    .replace(/"(?:\\.|[^"\\])*"/g, '""')
    .replace(/'(?:\\.|[^'\\])*'/g, "''");
}

function apiCalls(src) {
  const names = new Set();
  // from apiService imports used as foo(
  const importBlock = [
    ...src.matchAll(
      /import\s*\{([^}]+)\}\s*from\s*["'][^"']*apiService["']/g,
    ),
  ];
  const imported = new Set();
  for (const m of importBlock) {
    for (const p of m[1].split(",")) {
      const t = p.trim();
      if (!t) continue;
      const asM = t.match(/^(.+?)\s+as\s+(.+)$/);
      imported.add(asM ? asM[2].trim() : t);
    }
  }
  const clean = src; // do not strip identifiers away
  for (const name of imported) {
    const re = new RegExp(`\\b${name}\\s*\\(`);
    if (re.test(clean)) names.add(name);
  }
  if (/\bfetch\s*\(/.test(clean)) names.add("fetch(...)");
  return [...names].sort();
}

function handlers(src) {
  const names = new Set();
  const clean = src;
  for (const m of clean.matchAll(
    /(?:const|function)\s+(handle[A-Z][A-Za-z0-9_]*|load[A-Z][A-Za-z0-9_]*|actually[A-Z][A-Za-z0-9_]*|begin[A-Z][A-Za-z0-9_]*|trigger[A-Z][A-Za-z0-9_]*|ping[A-Z][A-Za-z0-9_]*|check[A-Z][A-Za-z0-9_]*)\s*=/g,
  )) {
    names.add(m[1]);
  }
  for (const m of clean.matchAll(
    /(?:const|function)\s+(handle[A-Z][A-Za-z0-9_]*)\s*\(/g,
  )) {
    names.add(m[1]);
  }
  return [...names].sort();
}

function lastReturnKeys(src) {
  const idx = src.lastIndexOf("return {");
  if (idx < 0) return [];
  let i = src.indexOf("{", idx);
  let d = 0;
  const start = i;
  for (; i < src.length; i++) {
    if (src[i] === "{") d++;
    else if (src[i] === "}") {
      d--;
      if (d === 0) {
        const block = src.slice(start, i + 1);
        return [
          ...new Set(
            [...block.matchAll(/^\s{2,8}([A-Za-z_][\w]*)\s*[,}]/gm)].map(
              (m) => m[1],
            ),
          ),
        ].sort();
      }
    }
  }
  return [];
}

function pageDestructure(pageSrc) {
  const m =
    pageSrc.match(/const\s*\{([\s\S]*?)\}\s*=\s*vm/) ||
    pageSrc.match(
      /const\s*\{([\s\S]*?)\}\s*=\s*use[A-Za-z]+Page\s*\(/,
    );
  if (!m) return [];
  return m[1]
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
    .filter((s) => s && /^[A-Za-z_]/.test(s))
    .sort();
}

function criticalStrings(src) {
  const needles = [
    "/login",
    "window.confirm",
    "reboot",
    "vlan.cfg",
    "service-ping",
    "rec_max_usage_pct",
    "sleep 5",
    "NETWORK_CONFIRM_SAVE",
    "STORAGE_ERR_MAX_DEVICE_USAGE",
  ];
  const hit = [];
  for (const n of needles) {
    if (src.includes(n)) hit.push(n);
  }
  return hit;
}

function diffLists(a, b) {
  const A = new Set(a);
  const B = new Set(b);
  return {
    onlyBefore: a.filter((x) => !B.has(x)),
    onlyAfter: b.filter((x) => !A.has(x)),
  };
}

function loadJoined(files) {
  return files
    .filter((f) => fs.existsSync(f))
    .map((f) => fs.readFileSync(f, "utf8"))
    .join("\n");
}

const TARGET = process.argv[2] || "network";

const PAGES = {
  network: {
    name: "Network",
    route: "/system-tools/network",
    head: ["src/modules/System/System Settings/Network.jsx"],
    curr: [
      "src/modules/System/System Settings/Network.jsx",
      "src/modules/System/System Settings/hooks/useNetworkPage.js",
      "src/modules/System/System Settings/utils/NetworkValidators.js",
      "src/modules/System/System Settings/utils/NetworkTransformers.js",
    ],
    hook: "src/modules/System/System Settings/hooks/useNetworkPage.js",
    page: "src/modules/System/System Settings/Network.jsx",
  },
  storage: {
    name: "Storage",
    route: "/system-tools/storage",
    head: ["src/modules/System/System Settings/Storage.jsx"],
    curr: [
      "src/modules/System/System Settings/Storage.jsx",
      "src/modules/System/System Settings/hooks/useStoragePage.js",
      "src/modules/System/System Settings/utils/StorageValidators.js",
      "src/modules/System/System Settings/utils/StorageTransformers.js",
    ],
    hook: "src/modules/System/System Settings/hooks/useStoragePage.js",
    page: "src/modules/System/System Settings/Storage.jsx",
  },
  routing: {
    name: "Routing Interface",
    route: "/system-tools/routing-interface",
    head: ["src/modules/System/System Settings/RoutingInterface.jsx"],
    curr: [
      "src/modules/System/System Settings/RoutingInterface.jsx",
      "src/modules/System/System Settings/hooks/useRoutingInterfacePage.js",
      "src/modules/System/System Settings/utils/RoutingInterfaceValidators.js",
      "src/modules/System/System Settings/utils/RoutingInterfaceTransformers.js",
    ],
    hook: "src/modules/System/System Settings/hooks/useRoutingInterfacePage.js",
    page: "src/modules/System/System Settings/RoutingInterface.jsx",
  },
  vpn: {
    name: "VPN",
    route: "/system-tools/vpn",
    head: [
      "src/modules/System/System Settings/SystemToolsVPN.jsx",
      "src/modules/System/System Settings/SystemToolsVPNFormFields.jsx",
      "src/modules/System/System Settings/hooks/useSystemToolsVPNPage.js",
    ],
    curr: [
      "src/modules/System/System Settings/SystemToolsVPN.jsx",
      "src/modules/System/System Settings/hooks/useSystemToolsVPNPage.js",
      "src/modules/System/System Settings/utils/SystemToolsVPNValidators.js",
      "src/modules/System/System Settings/utils/SystemToolsVPNTransformers.js",
    ],
    hook: "src/modules/System/System Settings/hooks/useSystemToolsVPNPage.js",
    page: "src/modules/System/System Settings/SystemToolsVPN.jsx",
  },
};

const page = PAGES[TARGET];
if (!page) {
  console.error("Usage: node scripts/audit-sys-wiring.mjs <network|storage|routing|vpn>");
  process.exit(1);
}

const before = page.head.map((p) => gitShow(p) || "").join("\n");
const after = loadJoined(page.curr);
const hookSrc = fs.existsSync(page.hook) ? fs.readFileSync(page.hook, "utf8") : "";
const pageSrc = fs.readFileSync(page.page, "utf8");

const beforeApis = apiCalls(before);
const afterApis = apiCalls(after);
const apiDiff = diffLists(beforeApis, afterApis);

const beforeHandlers = handlers(before);
const afterHandlers = handlers(after);
const handlerDiff = diffLists(beforeHandlers, afterHandlers);

const beforeCrit = criticalStrings(before);
const afterCrit = criticalStrings(after);
const critDiff = diffLists(beforeCrit, afterCrit);

const returned = lastReturnKeys(hookSrc);
const dest = pageDestructure(pageSrc);
const destMissing = dest.filter((k) => !returned.includes(k));

console.log(`=== ${page.name} (${page.route}) WIRING VERIFY ===\n`);

console.log("-- API calls --");
console.log("BEFORE:", beforeApis.join(", ") || "(none)");
console.log("AFTER: ", afterApis.join(", ") || "(none)");
console.log(
  apiDiff.onlyBefore.length || apiDiff.onlyAfter.length
    ? `DIFF onlyBefore=[${apiDiff.onlyBefore}] onlyAfter=[${apiDiff.onlyAfter}]`
    : "SAME",
);

console.log("\n-- Handlers --");
console.log("BEFORE:", beforeHandlers.join(", ") || "(none)");
console.log("AFTER: ", afterHandlers.join(", ") || "(none)");
console.log(
  handlerDiff.onlyBefore.length || handlerDiff.onlyAfter.length
    ? `DIFF onlyBefore=[${handlerDiff.onlyBefore}] onlyAfter=[${handlerDiff.onlyAfter}]`
    : "SAME",
);

console.log("\n-- Critical strings --");
console.log("BEFORE:", beforeCrit.join(", ") || "(none)");
console.log("AFTER: ", afterCrit.join(", ") || "(none)");
console.log(
  critDiff.onlyBefore.length || critDiff.onlyAfter.length
    ? `DIFF onlyBefore=[${critDiff.onlyBefore}] onlyAfter=[${critDiff.onlyAfter}]`
    : "SAME",
);

console.log("\n-- Page↔Hook --");
console.log("destructure:", dest.join(", "));
console.log("hook return:", returned.join(", "));
console.log(
  destMissing.length
    ? `FAIL page needs missing from hook: [${destMissing}]`
    : "OK page destructure ⊆ hook return",
);

// eslint no-undef on factored files
try {
  execSync(
    `npx eslint ${page.curr
      .concat([
        page.page.replace(/Page\.jsx$/, "").includes("Network")
          ? "src/modules/System/System Settings/components/NetworkFormFields.jsx"
          : null,
      ])
      .filter(Boolean)
      .map((f) => `"${f}"`)
      .join(" ")} -f json -o scripts/_tmp-eslint.json`,
    { stdio: "pipe", shell: true },
  );
} catch (_) {
  /* eslint exits 1 on warnings/errors */
}
let undef = 0;
try {
  const r = JSON.parse(fs.readFileSync("scripts/_tmp-eslint.json", "utf8"));
  for (const f of r) {
    for (const m of f.messages || []) {
      if (m.ruleId === "no-undef") {
        undef++;
        console.log("no-undef", f.filePath, m.line, m.message);
      }
    }
  }
} catch (_) {}
console.log(`\n-- ESLint no-undef: ${undef}`);

const ok =
  !apiDiff.onlyBefore.length &&
  !apiDiff.onlyAfter.length &&
  !critDiff.onlyBefore.length &&
  !destMissing.length &&
  undef === 0;

// Handler renames can be OK if still present under new names — print note
if (handlerDiff.onlyBefore.length || handlerDiff.onlyAfter.length) {
  console.log(
    "\nNOTE: handler name set differs (may be rename/split into utils). Review onlyBefore carefully.",
  );
}

console.log(`\n=== VERDICT: ${ok ? "PASS (API+critical+wiring)" : "REVIEW NEEDED"} ===`);
process.exit(ok ? 0 : 2);
