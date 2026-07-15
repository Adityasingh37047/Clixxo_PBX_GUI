import fs from "fs";
import { execSync } from "child_process";

function gitShow(filePath) {
  // Quote path for spaces (e.g. "Num Manipulate")
  return execSync(`git show "HEAD:${filePath}"`, {
    encoding: "utf8",
    maxBuffer: 20e6,
    shell: true,
  });
}

function readFile(p) {
  if (!fs.existsSync(p)) return "";
  const buf = fs.readFileSync(p);
  if ((buf[0] === 0xff && buf[1] === 0xfe) || (buf.length > 4 && buf[1] === 0 && buf[3] === 0)) {
    return buf.toString("utf16le").replace(/^\uFEFF/, "");
  }
  return buf.toString("utf8").replace(/^\uFEFF/, "");
}

function extractObjectKeys(src, anchorRegex) {
  const results = [];
  const re = new RegExp(anchorRegex.source, "g");
  let m;
  while ((m = re.exec(src))) {
    let i = m.index + m[0].length;
    while (i < src.length && /[\s(]/.test(src[i])) i++;
    if (src[i] !== "{") continue;
    const start = i;
    let depth = 0;
    let inStr = null;
    for (; i < src.length; i++) {
      const ch = src[i];
      if (inStr) {
        if (ch === "\\") {
          i++;
          continue;
        }
        if (ch === inStr) inStr = null;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === "`") {
        inStr = ch;
        continue;
      }
      if (ch === "{" || ch === "[" || ch === "(") depth++;
      else if (ch === "}" || ch === "]" || ch === ")") {
        depth--;
        if (depth === 0 && ch === "}") {
          const block = src.slice(start, i + 1);
          const keys = [];
          let d = 0;
          let j = 1;
          let s = null;
          while (j < block.length) {
            const c = block[j];
            if (s) {
              if (c === "\\") {
                j += 2;
                continue;
              }
              if (c === s) s = null;
              j++;
              continue;
            }
            if (c === '"' || c === "'" || c === "`") {
              s = c;
              j++;
              continue;
            }
            if (c === "{" || c === "[" || c === "(") {
              d++;
              j++;
              continue;
            }
            if (c === "}" || c === "]" || c === ")") {
              d--;
              j++;
              continue;
            }
            if (d === 0) {
              const rest = block.slice(j);
              const km = rest.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*:/);
              if (km) {
                keys.push(km[1]);
                j += km[0].length;
                continue;
              }
            }
            j++;
          }
          results.push({ keys, block: block.slice(0, 300) });
          break;
        }
      }
    }
  }
  return results;
}

function allStringLiteralsMatching(src, pred) {
  const out = new Set();
  const re = /["'`]([^"'`]{6,200})["'`]/g;
  let m;
  while ((m = re.exec(src))) {
    if (pred(m[1])) out.add(m[1].replace(/\$\{[^}]+\}/g, "${...}"));
  }
  return [...out];
}

function isBlockMsg(s) {
  return /please|required|range|cannot|choose|select|enter|input|invalid|must|already exists|no less|must be|difference between|sip port/i.test(
    s
  );
}

function apiNames(src) {
  const set = new Set();
  const imp = /import\s*\{([^}]+)\}\s*from\s*["'][^"']*apiService["']/g;
  let m;
  while ((m = imp.exec(src))) {
    m[1].split(",").forEach((p) => {
      const n = p.trim().split(/\s+as\s+/)[0].trim();
      if (n) set.add(n);
    });
  }
  const call =
    /(?:await\s+)?(fetch\w+|save\w+|list\w+|delete\w+|clear\w+|reset\w+|create\w+|update\w+|status\w+)\s*\(/g;
  while ((m = call.exec(src))) set.add(m[1]);
  return [...set].sort();
}

function hookReturns(src) {
  const m = src.match(/return\s*\{([\s\S]*?)\n\s*\};?\s*$/m);
  // better: last return { in hook file
  const idx = src.lastIndexOf("return {");
  if (idx < 0) return [];
  const objs = extractObjectKeys(src.slice(idx), /return\s*/);
  return objs[0]?.keys || [];
}

function pageHookUsage(pageSrc, hookName) {
  const re = new RegExp(
    `const\\s*\\{([^}]+)\\}\\s*=\\s*${hookName}\\s*\\(`
  );
  const m = pageSrc.match(re);
  if (!m) return null;
  return m[1]
    .split(",")
    .map((s) => s.trim().split(/\s*=\s*/)[0].trim())
    .filter(Boolean);
}

function diff(a, b) {
  const A = new Set(a);
  const B = new Set(b);
  return {
    missing: [...A].filter((x) => !B.has(x)),
    extra: [...B].filter((x) => !A.has(x)),
  };
}

function combine(files) {
  return files.map((f) => readFile(f)).join("\n");
}

const cases = [
  {
    folder: "Port",
    name: "PortFxsPage",
    head: "src/modules/FXS/Port/PortFxsPage.jsx",
    cur: [
      "src/modules/FXS/Port/PortFxsPage.jsx",
      "src/modules/FXS/Port/hooks/usePortFxsPage.js",
      "src/modules/FXS/Port/utils/PortFxsTransformers.js",
      "src/modules/FXS/Port/utils/PortFxsValidators.js",
    ],
    hook: "usePortFxsPage",
    payloadAnchors: [/(?:const|let)\s+payload\s*=/],
  },
  {
    folder: "Port",
    name: "PortFxsModify",
    head: "src/modules/FXS/Port/PortFxsModifyPage.jsx",
    cur: [
      "src/modules/FXS/Port/PortFxsModifyPage.jsx",
      "src/modules/FXS/Port/hooks/usePortFxsModifyPage.js",
      "src/modules/FXS/Port/utils/PortFxsModifyTransformers.js",
      "src/modules/FXS/Port/utils/PortFxsModifyValidators.js",
    ],
    hook: "usePortFxsModifyPage",
    payloadAnchors: [
      /(?:const|let)\s+payload\s*=/,
      /buildPortFxsModifySavePayload\s*=\s*\([^)]*\)\s*=>/,
    ],
  },
  {
    folder: "Port",
    name: "PortFxsBatchModify",
    head: "src/modules/FXS/Port/PortFxsBatchModifyPage.jsx",
    cur: [
      "src/modules/FXS/Port/PortFxsBatchModifyPage.jsx",
      "src/modules/FXS/Port/hooks/usePortFxsBatchModifyPage.js",
      "src/modules/FXS/Port/utils/PortFxsBatchModifyTransformers.js",
      "src/modules/FXS/Port/utils/PortFxsBatchModifyValidators.js",
    ],
    hook: "usePortFxsBatchModifyPage",
    payloadAnchors: [
      /(?:const|let)\s+payload\s*=/,
      /buildPortFxsBatchSavePayload\s*=\s*\([^)]*\)\s*=>/,
    ],
  },
  {
    folder: "Port",
    name: "PortFxsAdvanced",
    head: "src/modules/FXS/Port/PortFxsAdvancedPage.jsx",
    cur: [
      "src/modules/FXS/Port/PortFxsAdvancedPage.jsx",
      "src/modules/FXS/Port/hooks/usePortFxsAdvancedPage.js",
      "src/modules/FXS/Port/utils/PortFxsAdvancedTransformers.js",
      "src/modules/FXS/Port/utils/PortFxsAdvancedValidators.js",
    ],
    hook: "usePortFxsAdvancedPage",
    payloadAnchors: [
      /(?:const|let)\s+payload\s*=/,
      /getInitialBatchForm\s*=/,
      /setBatchForm\s*\(\s*\{/,
      /batchForm[\s\S]{0,40}=\s*\{/,
    ],
    formAnchors: [/getInitialBatchForm\s*=\s*\(\)\s*=>\s*\(/],
  },
  {
    folder: "Port",
    name: "PortGroup",
    head: "src/modules/FXS/Port/PortGroupPage.jsx",
    cur: [
      "src/modules/FXS/Port/PortGroupPage.jsx",
      "src/modules/FXS/Port/hooks/usePortGroupPage.js",
      "src/modules/FXS/Port/utils/PortGroupTransformers.js",
      "src/modules/FXS/Port/utils/PortGroupValidators.js",
    ],
    hook: "usePortGroupPage",
    payloadAnchors: [
      /(?:const|let)\s+newGroup\s*=/,
      /buildPortGroupRow\s*=\s*\([^)]*\)\s*=>/,
      /export const buildPortGroupRow[\s\S]{0,200}?return\s*/,
    ],
  },
  {
    folder: "VoIP",
    name: "FxsVoipSip",
    head: "src/modules/FXS/VoIP/FxsVoipSipPage.jsx",
    cur: [
      "src/modules/FXS/VoIP/FxsVoipSipPage.jsx",
      "src/modules/FXS/VoIP/hooks/useFxsVoipSipPage.js",
      "src/modules/FXS/VoIP/utils/FxsVoipSipTransformers.js",
      "src/modules/FXS/VoIP/utils/FxsVoipSipValidators.js",
    ],
    hook: "useFxsVoipSipPage",
    payloadAnchors: [
      /(?:const|let)\s+payload\s*=/,
      /saveFxsSipSettings\s*\(\s*/,
      /build\w*Save\w*\s*=\s*\([^)]*\)\s*=>/,
      /export const build\w+\s*=\s*\([^)]*\)\s*=>/,
    ],
  },
  {
    folder: "VoIP",
    name: "FxsVoipMedia",
    head: "src/modules/FXS/VoIP/FxsVoipMediaPage.jsx",
    cur: [
      "src/modules/FXS/VoIP/FxsVoipMediaPage.jsx",
      "src/modules/FXS/VoIP/hooks/useFxsVoipMediaPage.js",
      "src/modules/FXS/VoIP/utils/FxsVoipMediaTransformers.js",
      "src/modules/FXS/VoIP/utils/FxsVoipMediaValidators.js",
    ],
    hook: "useFxsVoipMediaPage",
    payloadAnchors: [
      /(?:const|let)\s+payload\s*=/,
      /save\w+\s*\(\s*/,
      /build\w+\s*=\s*\([^)]*\)\s*=>/,
      /selectedCodecs/,
    ],
  },
  {
    folder: "VoIP",
    name: "NatSettings",
    head: "src/modules/FXS/VoIP/NatSettingsPage.jsx",
    cur: [
      "src/modules/FXS/VoIP/NatSettingsPage.jsx",
      "src/modules/FXS/VoIP/hooks/useNatSettingsPage.js",
      "src/modules/FXS/VoIP/utils/NatSettingsTransformers.js",
      "src/modules/FXS/VoIP/utils/NatSettingsValidators.js",
    ],
    hook: "useNatSettingsPage",
    payloadAnchors: [
      /(?:const|let)\s+payload\s*=/,
      /save\w+\s*\(\s*/,
      /build\w+\s*=\s*\([^)]*\)\s*=>/,
    ],
  },
  {
    folder: "VoIP",
    name: "SipCompatibility",
    head: "src/modules/FXS/VoIP/SipCompatibilityPage.jsx",
    cur: [
      "src/modules/FXS/VoIP/SipCompatibilityPage.jsx",
      "src/modules/FXS/VoIP/hooks/useSipCompatibilityPage.js",
      "src/modules/FXS/VoIP/utils/SipCompatibilityTransformers.js",
      "src/modules/FXS/VoIP/utils/SipCompatibilityValidators.js",
    ],
    hook: "useSipCompatibilityPage",
    payloadAnchors: [
      /(?:const|let)\s+payload\s*=/,
      /save\w+\s*\(\s*/,
      /build\w+\s*=\s*\([^)]*\)\s*=>/,
    ],
  },
  {
    folder: "Route",
    name: "RouteIpToTel",
    head: "src/modules/FXS/Route/RouteIpToTelPage.jsx",
    cur: [
      "src/modules/FXS/Route/RouteIpToTelPage.jsx",
      "src/modules/FXS/Route/hooks/useRouteIpToTelPage.js",
      "src/modules/FXS/Route/utils/RouteIpToTelTransformers.js",
      "src/modules/FXS/Route/utils/RouteIpToTelValidators.js",
    ],
    hook: "useRouteIpToTelPage",
    payloadAnchors: [
      /(?:const|let)\s+(?:newRule|rule|payload)\s*=/,
      /build\w+\s*=\s*\([^)]*\)\s*=>/,
      /export const build\w+[\s\S]{0,120}?return\s*/,
    ],
  },
  {
    folder: "Route",
    name: "RouteTelToIp",
    head: "src/modules/FXS/Route/RouteTelToIPpage.jsx",
    cur: [
      "src/modules/FXS/Route/RouteTelToIPpage.jsx",
      "src/modules/FXS/Route/hooks/useRouteTelToIpPage.js",
      "src/modules/FXS/Route/utils/RouteTelToIpTransformers.js",
      "src/modules/FXS/Route/utils/RouteTelToIpValidators.js",
    ],
    hook: "useRouteTelToIpPage",
    payloadAnchors: [
      /(?:const|let)\s+(?:newRule|rule|payload)\s*=/,
      /build\w+\s*=\s*\([^)]*\)\s*=>/,
      /export const build\w+[\s\S]{0,120}?return\s*/,
    ],
  },
  {
    folder: "Route",
    name: "RouteRoutingParameter",
    head: "src/modules/FXS/Route/RouteRoutingParameterPage.jsx",
    cur: [
      "src/modules/FXS/Route/RouteRoutingParameterPage.jsx",
      "src/modules/FXS/Route/hooks/useRouteRoutingParameterPage.js",
      "src/modules/FXS/Route/utils/RouteRoutingParameterTransformers.js",
      "src/modules/FXS/Route/utils/RouteRoutingParameterValidators.js",
    ],
    hook: "useRouteRoutingParameterPage",
    payloadAnchors: [
      /(?:const|let)\s+(?:newRule|rule|payload|param)\s*=/,
      /build\w+\s*=\s*\([^)]*\)\s*=>/,
    ],
  },
  {
    folder: "NumManipulate",
    name: "IPCallInCallerID",
    head: "src/modules/FXS/Num Manipulate/FxsIPCallInCallerID.jsx",
    cur: [
      "src/modules/FXS/Num Manipulate/FxsIPCallInCallerID.jsx",
      "src/modules/FXS/Num Manipulate/hooks/useIPCallInCallerIDPage.js",
      "src/modules/FXS/Num Manipulate/utils/IPCallInCallerIDTransformers.js",
      "src/modules/FXS/Num Manipulate/utils/IPCallInCallerIDValidators.js",
    ],
    hook: "useIPCallInCallerIDPage",
    payloadAnchors: [
      /(?:const|let)\s+payload\s*=/,
      /createNumberManipulation\s*\(\s*/,
      /updateNumberManipulation\s*\(\s*/,
      /build\w+\s*=\s*\([^)]*\)\s*=>/,
    ],
  },
  {
    folder: "NumManipulate",
    name: "IPCallInCalleeID",
    head: "src/modules/FXS/Num Manipulate/FxsIPCallInCalleeID.jsx",
    cur: [
      "src/modules/FXS/Num Manipulate/FxsIPCallInCalleeID.jsx",
      "src/modules/FXS/Num Manipulate/hooks/useIPCallInCalleeIDPage.js",
      "src/modules/FXS/Num Manipulate/utils/IPCallInCalleeIDTransformers.js",
      "src/modules/FXS/Num Manipulate/utils/IPCallInCalleeIDValidators.js",
    ],
    hook: "useIPCallInCalleeIDPage",
    payloadAnchors: [
      /(?:const|let)\s+payload\s*=/,
      /createNumberManipulation\s*\(\s*/,
      /updateNumberManipulation\s*\(\s*/,
      /build\w+\s*=\s*\([^)]*\)\s*=>/,
    ],
  },
  {
    folder: "NumManipulate",
    name: "PSTNCallInCallerID",
    head: "src/modules/FXS/Num Manipulate/FxsPSTNCallInCallerID.jsx",
    cur: [
      "src/modules/FXS/Num Manipulate/FxsPSTNCallInCallerID.jsx",
      "src/modules/FXS/Num Manipulate/hooks/usePSTNCallInCallerIDPage.js",
      "src/modules/FXS/Num Manipulate/utils/PSTNCallInCallerIDTransformers.js",
      "src/modules/FXS/Num Manipulate/utils/PSTNCallInCallerIDValidators.js",
    ],
    hook: "usePSTNCallInCallerIDPage",
    payloadAnchors: [
      /(?:const|let)\s+payload\s*=/,
      /createNumberManipulation\s*\(\s*/,
      /updateNumberManipulation\s*\(\s*/,
      /build\w+\s*=\s*\([^)]*\)\s*=>/,
      /listPstnGroups/,
    ],
  },
  {
    folder: "NumManipulate",
    name: "PSTNCallInCalleeID",
    head: "src/modules/FXS/Num Manipulate/FxsPSTNCallInCalleeID.jsx",
    cur: [
      "src/modules/FXS/Num Manipulate/FxsPSTNCallInCalleeID.jsx",
      "src/modules/FXS/Num Manipulate/hooks/usePSTNCallInCalleeIDPage.js",
      "src/modules/FXS/Num Manipulate/utils/PSTNCallInCalleeIDTransformers.js",
      "src/modules/FXS/Num Manipulate/utils/PSTNCallInCalleeIDValidators.js",
    ],
    hook: "usePSTNCallInCalleeIDPage",
    payloadAnchors: [
      /(?:const|let)\s+payload\s*=/,
      /createNumberManipulation\s*\(\s*/,
      /updateNumberManipulation\s*\(\s*/,
      /build\w+\s*=\s*\([^)]*\)\s*=>/,
      /listPstnGroups/,
    ],
  },
];

const lines = [];
const issues = [];

for (const c of cases) {
  const head = gitShow(c.head);
  const cur = combine(c.cur);
  const pageCur = readFile(c.head); // current page path same as head path

  let headKeys = [];
  let curKeys = [];
  for (const a of c.payloadAnchors) {
    for (const o of extractObjectKeys(head, a)) {
      if (o.keys.length > headKeys.length) headKeys = o.keys;
    }
    for (const o of extractObjectKeys(cur, a)) {
      if (o.keys.length > curKeys.length) curKeys = o.keys;
    }
  }

  // For VoIP SIP/media often save formData / {...form} — capture assigned save object near save call
  if (headKeys.length === 0) {
    const nearSave = extractObjectKeys(
      head,
      /(?:body|data|settings|formToSave|saveData|requestBody)\s*=/
    );
    if (nearSave.length)
      headKeys = nearSave.sort((a, b) => b.keys.length - a.keys.length)[0].keys;
  }
  if (curKeys.length === 0) {
    const nearSave = extractObjectKeys(
      cur,
      /(?:body|data|settings|formToSave|saveData|requestBody)\s*=/
    );
    if (nearSave.length)
      curKeys = nearSave.sort((a, b) => b.keys.length - a.keys.length)[0].keys;
  }

  const keyDiff = diff(headKeys, curKeys);
  const headMsgs = allStringLiteralsMatching(head, isBlockMsg);
  const curMsgs = allStringLiteralsMatching(cur, isBlockMsg);
  const msgDiff = diff(headMsgs, curMsgs);

  // Filter success/toast noise from missing msgs
  const missingBlock = msgDiff.missing.filter(
    (m) =>
      !/successfully|created successfully|updated successfully|deleted successfully|saved successfully|cleared successfully|network error/i.test(
        m
      )
  );

  const headApi = apiNames(head);
  const curApi = apiNames(cur);
  const apiDiff = diff(headApi, curApi);

  // Hook return vs page destructure
  const hookFile = c.cur.find((f) => f.includes(`/hooks/${c.hook}`));
  let hookCut = [];
  if (hookFile) {
    const hSrc = readFile(hookFile);
    const ret = hookReturns(hSrc);
    const used = pageHookUsage(pageCur, c.hook);
    if (used && ret.length) {
      // page may not use all returns — only flag if page tries to use something not returned
      // Also flag handlers that HEAD had used in JSX that current page lacks
      const unusedButExported = ret.filter((k) => !used.includes(k));
      // not necessarily a cut
      const missingFromHook = used.filter((k) => !ret.includes(k));
      hookCut = missingFromHook;
    }
  }

  // Feature presence checks for NumManipulate
  const features = {};
  if (c.folder === "NumManipulate") {
    for (const feat of [
      "deleteNumberManipulation",
      "listNumberManipulations",
      "createNumberManipulation",
      "updateNumberManipulation",
      "listPstnGroups",
      "Clear All",
      "clearAll",
      "handleClearAll",
      "rowsPerPage",
      "page",
      "pagination",
    ]) {
      features[feat] = {
        head: head.includes(feat) || head.toLowerCase().includes(feat.toLowerCase()),
        cur: cur.includes(feat) || cur.toLowerCase().includes(feat.toLowerCase()),
      };
    }
  }

  lines.push(`\n===== ${c.folder}/${c.name} =====`);
  lines.push(`HEAD_KEYS(${headKeys.length}): ${headKeys.join(", ") || "(none found)"}`);
  lines.push(`CUR_KEYS(${curKeys.length}): ${curKeys.join(", ") || "(none found)"}`);
  lines.push(`MISSING_KEYS: ${keyDiff.missing.join(", ") || "(none)"}`);
  lines.push(`EXTRA_KEYS: ${keyDiff.extra.join(", ") || "(none)"}`);
  lines.push(`MISSING_BLOCK_MSGS: ${missingBlock.join(" || ") || "(none)"}`);
  lines.push(`MISSING_API: ${apiDiff.missing.join(", ") || "(none)"}`);
  lines.push(`EXTRA_API: ${apiDiff.extra.join(", ") || "(none)"}`);
  if (hookCut.length) lines.push(`HOOK_PAGE_CUT: ${hookCut.join(", ")}`);
  if (Object.keys(features).length) {
    const featMissing = Object.entries(features)
      .filter(([, v]) => v.head && !v.cur)
      .map(([k]) => k);
    lines.push(`FEATURE_CUTS: ${featMissing.join(", ") || "(none)"}`);
  }

  if (keyDiff.missing.length) {
    issues.push({
      folder: c.folder,
      page: c.name,
      type: "SAVE_PAYLOAD_KEY_CUT",
      detail: keyDiff.missing.join(", "),
    });
  }
  if (missingBlock.length) {
    issues.push({
      folder: c.folder,
      page: c.name,
      type: "VALIDATION_MSG_CUT",
      detail: missingBlock.join(" | "),
    });
  }
  if (apiDiff.missing.length) {
    issues.push({
      folder: c.folder,
      page: c.name,
      type: "API_CUT",
      detail: apiDiff.missing.join(", "),
    });
  }
  if (hookCut.length) {
    issues.push({
      folder: c.folder,
      page: c.name,
      type: "HOOK_RETURN_MISSING",
      detail: hookCut.join(", "),
    });
  }
  if (Object.keys(features).length) {
    const featMissing = Object.entries(features)
      .filter(([, v]) => v.head && !v.cur)
      .map(([k]) => k);
    if (featMissing.length) {
      issues.push({
        folder: c.folder,
        page: c.name,
        type: "FEATURE_CUT",
        detail: featMissing.join(", "),
      });
    }
  }
}

lines.push("\n\n==== ISSUE TABLE ====");
if (!issues.length) lines.push("ALL CLEAR — no real cuts detected by automated key/msg/api/feature scan.");
else {
  lines.push("| Folder | Page | Type | Detail |");
  lines.push("|---|---|---|---|");
  for (const i of issues) {
    lines.push(`| ${i.folder} | ${i.page} | ${i.type} | ${i.detail.replace(/\|/g, "/")} |`);
  }
}

const out = lines.join("\n");
fs.writeFileSync("scripts/audit-fxs-report.txt", out);
console.log(out);
