import fs from "fs";
import path from "path";

function extractBalancedObject(src, startIdx) {
  let i = startIdx;
  while (i < src.length && /\s/.test(src[i])) i++;
  if (src[i] !== "{") return null;
  const start = i;
  let depth = 0;
  for (; i < src.length; i++) {
    const ch = src[i];
    if (ch === "{" || ch === "(" || ch === "[") depth++;
    else if (ch === "}" || ch === ")" || ch === "]") {
      depth--;
      if (depth === 0 && ch === "}") {
        return src.slice(start, i + 1);
      }
      if (depth < 0) return null;
    } else if (ch === '"' || ch === "'" || ch === "`") {
      const q = ch;
      i++;
      while (i < src.length) {
        if (src[i] === "\\") {
          i += 2;
          continue;
        }
        if (src[i] === q) break;
        i++;
      }
    }
  }
  return null;
}

function topLevelKeys(objSrc) {
  const keys = [];
  let depth = 0;
  let i = 0;
  // skip opening {
  if (objSrc[0] === "{") i = 1;
  let buf = "";
  let inStr = null;
  while (i < objSrc.length) {
    const ch = objSrc[i];
    if (inStr) {
      if (ch === "\\") {
        i += 2;
        continue;
      }
      if (ch === inStr) inStr = null;
      i++;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      inStr = ch;
      i++;
      continue;
    }
    if (ch === "{" || ch === "(" || ch === "[") {
      depth++;
      i++;
      continue;
    }
    if (ch === "}" || ch === ")" || ch === "]") {
      depth--;
      i++;
      continue;
    }
    if (depth === 0) {
      // look for key:
      const rest = objSrc.slice(i);
      const m = rest.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*:/);
      if (m) {
        keys.push(m[1]);
        i += m[0].length;
        continue;
      }
    }
    i++;
  }
  return keys;
}

function findPayloads(src, patterns) {
  const out = [];
  for (const { name, re } of patterns) {
    let m;
    const r = new RegExp(
      re.source,
      re.flags.includes("g") ? re.flags : re.flags + "g"
    );
    while ((m = r.exec(src))) {
      let idx = m.index + m[0].length;
      while (idx < src.length && /[\s(]/.test(src[idx])) idx++;
      if (src[idx] !== "{") continue;
      const obj = extractBalancedObject(src, idx);
      if (obj && obj.length > 2) {
        const keys = topLevelKeys(obj);
        if (keys.length) out.push({ name, keys, snippet: obj.slice(0, 200) });
      }
    }
  }
  return out;
}

function findErrorMsgs(src) {
  const msgs = new Set();
  const patterns = [
    /showMessage\(\s*["']error["']\s*,\s*["']([^"']+)["']/g,
    /showMessage\(\s*["']error["']\s*,\s*`([^`]+)`/g,
    /alert\(\s*["']([^"']+)["']/g,
    /alert\(\s*`([^`]+)`/g,
    /message:\s*["']([^"']+)["']/g,
    /message:\s*`([^`]+)`/g,
    /return\s+["']((?:Please|The value|The starting|Are you sure|No port|Failed|Invalid|Must|Choose|Select|Enter|Input)[^"']+)["']/gi,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(src))) {
      const t = m[1].replace(/\$\{[^}]+\}/g, "${...}");
      if (t.length > 5) msgs.add(t);
    }
  }
  return [...msgs];
}

function findApiImports(src) {
  const out = new Set();
  const re = /import\s*\{([^}]+)\}\s*from\s*["'][^"']*apiService["']/g;
  let m;
  while ((m = re.exec(src))) {
    for (const part of m[1].split(",")) {
      const name = part.trim().split(/\s+as\s+/)[0].trim();
      if (name) out.add(name);
    }
  }
  // also bare calls matching known APIs in await
  const re2 =
    /await\s+(fetch\w+|save\w+|list\w+|delete\w+|clear\w+|reset\w+|create\w+|update\w+|get\w+)\s*\(/g;
  while ((m = re2.exec(src))) out.add(m[1]);
  return [...out].sort();
}

function read(p) {
  if (!fs.existsSync(p)) return "";
  const buf = fs.readFileSync(p);
  // PowerShell Out-File often writes UTF-16LE (BOM FF FE)
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) {
    return buf.toString("utf16le").replace(/^\uFEFF/, "");
  }
  if (buf.length >= 2 && buf[0] === 0xfe && buf[1] === 0xff) {
    // swap to LE then decode roughly - unlikely
    return buf.toString("utf16le");
  }
  // Detect UTF-16LE without BOM: null between ASCII
  if (buf.length > 4 && buf[1] === 0 && buf[3] === 0 && buf[0] !== 0) {
    return buf.toString("utf16le");
  }
  return buf.toString("utf8").replace(/^\uFEFF/, "");
}

function combine(files) {
  return files.map((f) => `\n/*${f}*/\n` + read(f)).join("\n");
}

const cases = [
  {
    name: "PortFxsModify",
    head: "scripts/_head_fxs/src_modules_FXS_Port_PortFxsModifyPage.jsx",
    cur: [
      "src/modules/FXS/Port/utils/PortFxsModifyTransformers.js",
      "src/modules/FXS/Port/utils/PortFxsModifyValidators.js",
      "src/modules/FXS/Port/hooks/usePortFxsModifyPage.js",
      "src/modules/FXS/Port/PortFxsModifyPage.jsx",
    ],
    payloadRes: [
      { name: "payload", re: /(?:const|let)\s+payload\s*=/ },
      { name: "buildPortFxsModifySavePayload", re: /buildPortFxsModifySavePayload\s*=\s*\([^)]*\)\s*=>/ },
    ],
  },
  {
    name: "PortFxsBatchModify",
    head: "scripts/_head_fxs/src_modules_FXS_Port_PortFxsBatchModifyPage.jsx",
    cur: [
      "src/modules/FXS/Port/utils/PortFxsBatchModifyTransformers.js",
      "src/modules/FXS/Port/utils/PortFxsBatchModifyValidators.js",
      "src/modules/FXS/Port/hooks/usePortFxsBatchModifyPage.js",
      "src/modules/FXS/Port/PortFxsBatchModifyPage.jsx",
    ],
    payloadRes: [
      { name: "payload", re: /(?:const|let)\s+payload\s*=/ },
      { name: "buildPortFxsBatchSavePayload", re: /buildPortFxsBatchSavePayload\s*=\s*\([^)]*\)\s*=>/ },
    ],
  },
  {
    name: "PortFxsAdvanced",
    head: "scripts/_head_fxs/src_modules_FXS_Port_PortFxsAdvancedPage.jsx",
    cur: [
      "src/modules/FXS/Port/utils/PortFxsAdvancedTransformers.js",
      "src/modules/FXS/Port/utils/PortFxsAdvancedValidators.js",
      "src/modules/FXS/Port/hooks/usePortFxsAdvancedPage.js",
      "src/modules/FXS/Port/PortFxsAdvancedPage.jsx",
    ],
    payloadRes: [
      { name: "payload", re: /(?:const|let)\s+payload\s*=/ },
      { name: "build", re: /(?:build\w+|getInitialBatchForm)\s*=/ },
    ],
  },
  {
    name: "PortGroup",
    head: "scripts/_head_fxs/src_modules_FXS_Port_PortGroupPage.jsx",
    cur: [
      "src/modules/FXS/Port/utils/PortGroupTransformers.js",
      "src/modules/FXS/Port/utils/PortGroupValidators.js",
      "src/modules/FXS/Port/hooks/usePortGroupPage.js",
      "src/modules/FXS/Port/PortGroupPage.jsx",
    ],
    payloadRes: [
      { name: "newGroup/row", re: /(?:const|let)\s+(?:newGroup|row|group)\s*=/ },
      { name: "buildPortGroupRow", re: /buildPortGroupRow\s*=\s*\([^)]*\)\s*=>/ },
      { name: "return_row", re: /export const buildPortGroupRow[\s\S]*?return\s*/ },
    ],
  },
  {
    name: "PortFxsPage",
    head: "scripts/_head_fxs/src_modules_FXS_Port_PortFxsPage.jsx",
    cur: [
      "src/modules/FXS/Port/hooks/usePortFxsPage.js",
      "src/modules/FXS/Port/utils/PortFxsTransformers.js",
      "src/modules/FXS/Port/PortFxsPage.jsx",
    ],
    payloadRes: [{ name: "payload", re: /(?:const|let)\s+payload\s*=/ }],
  },
  {
    name: "FxsVoipSip",
    head: "scripts/_head_fxs/src_modules_FXS_VoIP_FxsVoipSipPage.jsx",
    cur: [
      "src/modules/FXS/VoIP/utils/FxsVoipSipTransformers.js",
      "src/modules/FXS/VoIP/utils/FxsVoipSipValidators.js",
      "src/modules/FXS/VoIP/hooks/useFxsVoipSipPage.js",
      "src/modules/FXS/VoIP/FxsVoipSipPage.jsx",
    ],
    payloadRes: [
      { name: "payload", re: /(?:const|let)\s+payload\s*=/ },
      { name: "build", re: /export const build\w+\s*=\s*\([^)]*\)\s*=>/ },
    ],
  },
  {
    name: "FxsVoipMedia",
    head: "scripts/_head_fxs/src_modules_FXS_VoIP_FxsVoipMediaPage.jsx",
    cur: [
      "src/modules/FXS/VoIP/utils/FxsVoipMediaTransformers.js",
      "src/modules/FXS/VoIP/utils/FxsVoipMediaValidators.js",
      "src/modules/FXS/VoIP/hooks/useFxsVoipMediaPage.js",
      "src/modules/FXS/VoIP/FxsVoipMediaPage.jsx",
    ],
    payloadRes: [
      { name: "payload", re: /(?:const|let)\s+payload\s*=/ },
      { name: "build", re: /export const build\w+\s*=\s*\([^)]*\)\s*=>/ },
    ],
  },
  {
    name: "NatSettings",
    head: "scripts/_head_fxs/src_modules_FXS_VoIP_NatSettingsPage.jsx",
    cur: [
      "src/modules/FXS/VoIP/utils/NatSettingsTransformers.js",
      "src/modules/FXS/VoIP/utils/NatSettingsValidators.js",
      "src/modules/FXS/VoIP/hooks/useNatSettingsPage.js",
      "src/modules/FXS/VoIP/NatSettingsPage.jsx",
    ],
    payloadRes: [
      { name: "payload", re: /(?:const|let)\s+payload\s*=/ },
      { name: "build", re: /export const build\w+\s*=\s*\([^)]*\)\s*=>/ },
    ],
  },
  {
    name: "SipCompatibility",
    head: "scripts/_head_fxs/src_modules_FXS_VoIP_SipCompatibilityPage.jsx",
    cur: [
      "src/modules/FXS/VoIP/utils/SipCompatibilityTransformers.js",
      "src/modules/FXS/VoIP/utils/SipCompatibilityValidators.js",
      "src/modules/FXS/VoIP/hooks/useSipCompatibilityPage.js",
      "src/modules/FXS/VoIP/SipCompatibilityPage.jsx",
    ],
    payloadRes: [
      { name: "payload", re: /(?:const|let)\s+payload\s*=/ },
      { name: "build", re: /export const build\w+\s*=\s*\([^)]*\)\s*=>/ },
    ],
  },
  {
    name: "RouteIpToTel",
    head: "scripts/_head_fxs/src_modules_FXS_Route_RouteIpToTelPage.jsx",
    cur: [
      "src/modules/FXS/Route/utils/RouteIpToTelTransformers.js",
      "src/modules/FXS/Route/utils/RouteIpToTelValidators.js",
      "src/modules/FXS/Route/hooks/useRouteIpToTelPage.js",
      "src/modules/FXS/Route/RouteIpToTelPage.jsx",
    ],
    payloadRes: [
      { name: "payload", re: /(?:const|let)\s+payload\s*=/ },
      { name: "build", re: /export const build\w+\s*=\s*\([^)]*\)\s*=>/ },
      { name: "newRule", re: /(?:const|let)\s+(?:newRule|rule|row)\s*=/ },
    ],
  },
  {
    name: "RouteTelToIp",
    head: "scripts/_head_fxs/src_modules_FXS_Route_RouteTelToIPpage.jsx",
    cur: [
      "src/modules/FXS/Route/utils/RouteTelToIpTransformers.js",
      "src/modules/FXS/Route/utils/RouteTelToIpValidators.js",
      "src/modules/FXS/Route/hooks/useRouteTelToIpPage.js",
      "src/modules/FXS/Route/RouteTelToIPpage.jsx",
    ],
    payloadRes: [
      { name: "payload", re: /(?:const|let)\s+payload\s*=/ },
      { name: "build", re: /export const build\w+\s*=\s*\([^)]*\)\s*=>/ },
      { name: "newRule", re: /(?:const|let)\s+(?:newRule|rule|row)\s*=/ },
    ],
  },
  {
    name: "RouteRoutingParameter",
    head: "scripts/_head_fxs/src_modules_FXS_Route_RouteRoutingParameterPage.jsx",
    cur: [
      "src/modules/FXS/Route/utils/RouteRoutingParameterTransformers.js",
      "src/modules/FXS/Route/utils/RouteRoutingParameterValidators.js",
      "src/modules/FXS/Route/hooks/useRouteRoutingParameterPage.js",
      "src/modules/FXS/Route/RouteRoutingParameterPage.jsx",
    ],
    payloadRes: [
      { name: "payload", re: /(?:const|let)\s+payload\s*=/ },
      { name: "build", re: /export const build\w+\s*=\s*\([^)]*\)\s*=>/ },
      { name: "newRule", re: /(?:const|let)\s+(?:newRule|rule|row|param)\s*=/ },
    ],
  },
  {
    name: "IPCallInCallerID",
    head: "scripts/_head_fxs/src_modules_FXS_Num_Manipulate_FxsIPCallInCallerID.jsx",
    cur: [
      "src/modules/FXS/Num Manipulate/utils/IPCallInCallerIDTransformers.js",
      "src/modules/FXS/Num Manipulate/utils/IPCallInCallerIDValidators.js",
      "src/modules/FXS/Num Manipulate/hooks/useIPCallInCallerIDPage.js",
      "src/modules/FXS/Num Manipulate/FxsIPCallInCallerID.jsx",
      "src/modules/FXS/Num Manipulate/components/NumManipulateSharedFormFields.jsx",
    ],
    payloadRes: [
      { name: "payload", re: /(?:const|let)\s+payload\s*=/ },
      { name: "build", re: /export const build\w+\s*=\s*\([^)]*\)\s*=>/ },
      { name: "createBody", re: /(?:create|update)\w*\(/ },
    ],
  },
  {
    name: "IPCallInCalleeID",
    head: "scripts/_head_fxs/src_modules_FXS_Num_Manipulate_FxsIPCallInCalleeID.jsx",
    cur: [
      "src/modules/FXS/Num Manipulate/utils/IPCallInCalleeIDTransformers.js",
      "src/modules/FXS/Num Manipulate/utils/IPCallInCalleeIDValidators.js",
      "src/modules/FXS/Num Manipulate/hooks/useIPCallInCalleeIDPage.js",
      "src/modules/FXS/Num Manipulate/FxsIPCallInCalleeID.jsx",
    ],
    payloadRes: [
      { name: "payload", re: /(?:const|let)\s+payload\s*=/ },
      { name: "build", re: /export const build\w+\s*=\s*\([^)]*\)\s*=>/ },
    ],
  },
  {
    name: "PSTNCallInCallerID",
    head: "scripts/_head_fxs/src_modules_FXS_Num_Manipulate_FxsPSTNCallInCallerID.jsx",
    cur: [
      "src/modules/FXS/Num Manipulate/utils/PSTNCallInCallerIDTransformers.js",
      "src/modules/FXS/Num Manipulate/utils/PSTNCallInCallerIDValidators.js",
      "src/modules/FXS/Num Manipulate/hooks/usePSTNCallInCallerIDPage.js",
      "src/modules/FXS/Num Manipulate/FxsPSTNCallInCallerID.jsx",
    ],
    payloadRes: [
      { name: "payload", re: /(?:const|let)\s+payload\s*=/ },
      { name: "build", re: /export const build\w+\s*=\s*\([^)]*\)\s*=>/ },
    ],
  },
  {
    name: "PSTNCallInCalleeID",
    head: "scripts/_head_fxs/src_modules_FXS_Num_Manipulate_FxsPSTNCallInCalleeID.jsx",
    cur: [
      "src/modules/FXS/Num Manipulate/utils/PSTNCallInCalleeIDTransformers.js",
      "src/modules/FXS/Num Manipulate/utils/PSTNCallInCalleeIDValidators.js",
      "src/modules/FXS/Num Manipulate/hooks/usePSTNCallInCalleeIDPage.js",
      "src/modules/FXS/Num Manipulate/FxsPSTNCallInCalleeID.jsx",
    ],
    payloadRes: [
      { name: "payload", re: /(?:const|let)\s+payload\s*=/ },
      { name: "build", re: /export const build\w+\s*=\s*\([^)]*\)\s*=>/ },
    ],
  },
];

function bestPayload(list) {
  if (!list.length) return { keys: [], name: "(none)" };
  return list.sort((a, b) => b.keys.length - a.keys.length)[0];
}

function diff(a, b) {
  const A = new Set(a);
  const B = new Set(b);
  return {
    missing: [...A].filter((x) => !B.has(x)),
    extra: [...B].filter((x) => !A.has(x)),
  };
}

let report = "";
for (const c of cases) {
  const head = read(c.head);
  const cur = combine(c.cur);
  const headPs = findPayloads(head, c.payloadRes);
  const curPs = findPayloads(cur, c.payloadRes);
  // Also try arrow return objects in transformers: export const buildX = (form) => ({
  const arrowRes = [
    { name: "arrowObj", re: /export const \w+\s*=\s*\([^)]*\)\s*=>\s*(?=\{)/ },
    { name: "fnReturn", re: /export const \w+\s*=\s*\([^)]*\)\s*=>\s*\{[\s\S]*?return\s*(?=\{)/ },
  ];
  const headPs2 = findPayloads(head, [
    ...c.payloadRes,
    { name: "anyPayloadLike", re: /(?:const|let)\s+(?:payload|newGroup|newRule|body|data|row)\s*=/ },
  ]);
  const curPs2 = findPayloads(cur, [...c.payloadRes, ...arrowRes, { name: "any", re: /(?:const|let)\s+(?:payload|newGroup|newRule|body|data|row)\s*=/ }]);

  const hBest = bestPayload(headPs2);
  const cBest = bestPayload(curPs2);
  const kd = diff(hBest.keys, cBest.keys);

  const hMsgs = findErrorMsgs(head);
  const cMsgs = findErrorMsgs(cur);
  const md = diff(hMsgs, cMsgs);

  const hApi = findApiImports(head);
  const cApi = findApiImports(cur);
  const ad = diff(hApi, cApi);

  report += `\n======== ${c.name} ========
HEAD_PAYLOAD(${hBest.name}): ${hBest.keys.join(", ") || "(none)"}
CUR_PAYLOAD(${cBest.name}): ${cBest.keys.join(", ") || "(none)"}
MISSING_KEYS: ${kd.missing.join(", ") || "(none)"}
EXTRA_KEYS: ${kd.extra.join(", ") || "(none)"}
HEAD_ERR_COUNT: ${hMsgs.length}
MISSING_ERRS: ${md.missing.join(" || ") || "(none)"}
EXTRA_ERRS: ${md.extra.filter(e => /please|range|cannot|choose|select|enter|input|must|invalid|required/i.test(e)).join(" || ") || "(none)"}
HEAD_API: ${hApi.join(", ")}
CUR_API: ${cApi.join(", ")}
MISSING_API: ${ad.missing.join(", ") || "(none)"}
EXTRA_API: ${ad.extra.join(", ") || "(none)"}
HEAD_ALL_PAYLOADS: ${headPs2.map(p => p.name + "[" + p.keys.length + "]").join("; ")}
CUR_ALL_PAYLOADS: ${curPs2.map(p => p.name + "[" + p.keys.length + "]").join("; ")}
`;
}

fs.writeFileSync("scripts/audit-fxs-factor-out2.txt", report);
console.log(report);
console.log("WROTE scripts/audit-fxs-factor-out2.txt");
