import { execSync } from "child_process";
import fs from "fs";
import path from "path";

function getHead(filePath) {
  try {
    return execSync(`git show HEAD:${filePath}`, {
      encoding: "utf8",
      maxBuffer: 20e6,
    });
  } catch {
    return null;
  }
}

function readCurrent(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
}

function extractObjectAfter(src, markerRegex) {
  const results = [];
  const re = markerRegex;
  let m;
  while ((m = re.exec(src))) {
    let i = m.index + m[0].length;
    // skip whitespace
    while (i < src.length && /\s/.test(src[i])) i++;
    if (src[i] !== "{") continue;
    const start = i;
    let depth = 0;
    for (; i < src.length; i++) {
      if (src[i] === "{") depth++;
      else if (src[i] === "}") {
        depth--;
        if (depth === 0) {
          const block = src.slice(start, i + 1);
          const keys = [];
          for (const line of block.split("\n")) {
            const km = line.match(/^\s+([A-Za-z_][A-Za-z0-9_]*)\s*:/);
            if (km) keys.push(km[1]);
          }
          results.push({ label: m[0].slice(0, 60), keys, block });
          break;
        }
      }
    }
  }
  return results;
}

function extractPayloads(src) {
  return extractObjectAfter(
    src,
    /(?:const|let)\s+payload\s*=/g
  ).concat(
    extractObjectAfter(src, /return\s+(?=\{)/g).filter((r) =>
      r.keys.some((k) =>
        /port|enabled|starting|ending|codec|sip|nat|rule|caller|callee|group/i.test(
          k
        )
      )
    )
  );
}

function extractNamedBuilders(src) {
  const out = [];
  const re =
    /(?:export\s+)?(?:function\s+|const\s+)(build\w+|to\w*Payload|map\w*(?:Payload|Row)|create\w*Payload)\s*(?:=|\()/g;
  let m;
  while ((m = re.exec(src))) {
    const name = m[1];
    // find next { that looks like return object or assignment
    const after = src.slice(m.index, m.index + 4000);
    const bodies = extractObjectAfter(after, /(?:return\s+|=\s*)/);
    // get first sizable object with keys
    const best = bodies.find((b) => b.keys.length >= 3) || bodies[0];
    out.push({ name, keys: best?.keys || [], block: best?.block?.slice(0, 500) });
  }
  return out;
}

function extractErrorMessages(src) {
  const msgs = new Set();
  // showMessage("error", "...")
  const re1 =
    /showMessage\(\s*["']error["']\s*,\s*["']([^"']+)["']/g;
  let m;
  while ((m = re1.exec(src))) msgs.add(m[1]);
  // showMessage("error", `...`)
  const re2 = /showMessage\(\s*["']error["']\s*,\s*`([^`]+)`/g;
  while ((m = re2.exec(src)))
    msgs.add(m[1].replace(/\$\{[^}]+\}/g, "${...}"));
  // alert("...")
  const re3 = /alert\(\s*["']([^"']+)["']/g;
  while ((m = re3.exec(src))) msgs.add(m[1]);
  // alert(`...`)
  const re4 = /alert\(\s*`([^`]+)`/g;
  while ((m = re4.exec(src)))
    msgs.add(m[1].replace(/\$\{[^}]+\}/g, "${...}"));
  // return "message" in validators
  const re5 = /return\s+["']([^"']{10,})["']/g;
  while ((m = re5.exec(src))) {
    if (/please|range|required|cannot|choose|select|input|enter|invalid|must|no /i.test(m[1]))
      msgs.add(m[1]);
  }
  // return `message`
  const re6 = /return\s+`([^`]{10,})`/g;
  while ((m = re6.exec(src))) {
    const t = m[1].replace(/\$\{[^}]+\}/g, "${...}");
    if (/please|range|required|cannot|choose|select|input|enter|invalid|must|no /i.test(t))
      msgs.add(t);
  }
  return [...msgs];
}

function extractApiImports(src) {
  const imports = [];
  const re = /import\s*\{([^}]+)\}\s*from\s*["'][^"']*apiService["']/g;
  let m;
  while ((m = re.exec(src))) {
    imports.push(
      ...m[1]
        .split(",")
        .map((s) => s.trim().split(/\s+as\s+/)[0].trim())
        .filter(Boolean)
    );
  }
  return [...new Set(imports)];
}

function extractAwaitedCalls(src) {
  const apis = new Set();
  const re = /await\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
  let m;
  while ((m = re.exec(src))) apis.add(m[1]);
  return [...apis];
}

function diffKeys(headKeys, curKeys) {
  const h = new Set(headKeys);
  const c = new Set(curKeys);
  return {
    missingInCurrent: [...h].filter((k) => !c.has(k)),
    extraInCurrent: [...c].filter((k) => !h.has(k)),
  };
}

function diffMsgs(headMsgs, curMsgs) {
  const normalize = (s) => s.replace(/\$\{[^}]+\}/g, "${...}").trim();
  const h = new Set(headMsgs.map(normalize));
  const c = new Set(curMsgs.map(normalize));
  return {
    missingInCurrent: [...h].filter((m) => !c.has(m)),
    extraInCurrent: [...c].filter((m) => !h.has(m)),
  };
}

function combineCurrent(pageFiles, relatedGlobs) {
  let src = "";
  for (const f of pageFiles) {
    const s = readCurrent(f);
    if (s) src += `\n/* FILE ${f} */\n` + s;
  }
  for (const g of relatedGlobs || []) {
    // simple: if file exists read it
    if (fs.existsSync(g)) {
      src += `\n/* FILE ${g} */\n` + readCurrent(g);
    }
  }
  return src;
}

function listDirFiles(dir, pred) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...listDirFiles(p, pred));
    else if (!pred || pred(ent.name)) out.push(p.replace(/\\/g, "/"));
  }
  return out;
}

function analyzePage({ name, headPath, currentRoots }) {
  const head = getHead(headPath);
  if (!head) {
    console.log(`\n### ${name}: MISSING IN HEAD`);
    return;
  }

  // gather current factored files under module dirs
  const curFiles = [];
  for (const root of currentRoots) {
    if (fs.existsSync(root) && fs.statSync(root).isFile()) {
      curFiles.push(root.replace(/\\/g, "/"));
    } else if (fs.existsSync(root)) {
      curFiles.push(...listDirFiles(root, (n) => /\.(js|jsx)$/.test(n)));
    }
  }
  // also always include the page itself
  curFiles.push(headPath.replace(/\\/g, "/"));

  const unique = [...new Set(curFiles)];
  const cur = unique.map(readCurrent).filter(Boolean).join("\n");

  const headPayloads = extractPayloads(head);
  const curPayloads = extractPayloads(cur);
  const headBuilders = extractNamedBuilders(head);
  const curBuilders = extractNamedBuilders(cur);

  const headKeys = [
    ...new Set(headPayloads.flatMap((p) => p.keys).concat(headBuilders.flatMap((b) => b.keys))),
  ];
  const curKeys = [
    ...new Set(curPayloads.flatMap((p) => p.keys).concat(curBuilders.flatMap((b) => b.keys))),
  ];

  // Prefer comparing the largest payload from each side if available
  const headMain =
    [...headPayloads, ...headBuilders.map((b) => ({ keys: b.keys, label: b.name }))]
      .sort((a, b) => b.keys.length - a.keys.length)[0] || { keys: [] };
  const curMain =
    [...curPayloads, ...curBuilders.map((b) => ({ keys: b.keys, label: b.name }))]
      .sort((a, b) => b.keys.length - a.keys.length)[0] || { keys: [] };

  const keyDiff = diffKeys(headMain.keys, curMain.keys);
  const allKeyDiff = diffKeys(headKeys, curKeys);

  const headMsgs = extractErrorMessages(head);
  const curMsgs = extractErrorMessages(cur);
  const msgDiff = diffMsgs(headMsgs, curMsgs);

  const headApis = extractApiImports(head);
  const curApis = extractApiImports(cur);
  const apiDiff = diffKeys(headApis, curApis);

  const headAwaited = extractAwaitedCalls(head);
  const curAwaited = extractAwaitedCalls(cur);

  console.log(`\n======== ${name} ========`);
  console.log(`HEAD_MAIN_LABEL: ${headMain.label || "(payload)"} (${headMain.keys.length} keys)`);
  console.log(`CUR_MAIN_LABEL: ${curMain.label || "(payload)"} (${curMain.keys.length} keys)`);
  console.log(`HEAD_MAIN_KEYS: ${headMain.keys.join(", ")}`);
  console.log(`CUR_MAIN_KEYS: ${curMain.keys.join(", ")}`);
  console.log(`MISSING_KEYS_MAIN: ${keyDiff.missingInCurrent.join(", ") || "(none)"}`);
  console.log(`EXTRA_KEYS_MAIN: ${keyDiff.extraInCurrent.join(", ") || "(none)"}`);
  console.log(`MISSING_KEYS_ALL: ${allKeyDiff.missingInCurrent.join(", ") || "(none)"}`);
  console.log(`EXTRA_KEYS_ALL: ${allKeyDiff.extraInCurrent.join(", ") || "(none)"}`);
  console.log(`HEAD_ERROR_MSGS (${headMsgs.length}):`);
  for (const msg of headMsgs) console.log(`  - ${msg}`);
  console.log(`MISSING_ERROR_MSGS: ${msgDiff.missingInCurrent.join(" || ") || "(none)"}`);
  console.log(`HEAD_API_IMPORTS: ${headApis.join(", ") || "(none)"}`);
  console.log(`CUR_API_IMPORTS: ${curApis.join(", ") || "(none)"}`);
  console.log(`MISSING_API_IMPORTS: ${apiDiff.missingInCurrent.join(", ") || "(none)"}`);
  console.log(`HEAD_AWAITED: ${headAwaited.join(", ")}`);
  console.log(`CUR_AWAITED: ${curAwaited.join(", ")}`);
  console.log(`CUR_FILES: ${unique.join(" | ")}`);
}

const audits = [
  {
    name: "PortFxsPage",
    headPath: "src/modules/FXS/Port/PortFxsPage.jsx",
    currentRoots: [
      "src/modules/FXS/Port/hooks/usePortFxsPage.js",
      "src/modules/FXS/Port/utils/PortFxsTransformers.js",
      "src/modules/FXS/Port/utils/PortFxsValidators.js",
      "src/modules/FXS/Port/components/PortFxsFormFields.jsx",
      "src/modules/FXS/Port/components/PortFxsTableHelpers.js",
    ],
  },
  {
    name: "PortFxsModifyPage",
    headPath: "src/modules/FXS/Port/PortFxsModifyPage.jsx",
    currentRoots: [
      "src/modules/FXS/Port/hooks/usePortFxsModifyPage.js",
      "src/modules/FXS/Port/utils/PortFxsModifyTransformers.js",
      "src/modules/FXS/Port/utils/PortFxsModifyValidators.js",
      "src/modules/FXS/Port/components/PortFxsModifyFormFields.jsx",
      "src/modules/FXS/Port/components/PortFxsModifyTableHelpers.js",
    ],
  },
  {
    name: "PortFxsBatchModifyPage",
    headPath: "src/modules/FXS/Port/PortFxsBatchModifyPage.jsx",
    currentRoots: [
      "src/modules/FXS/Port/hooks/usePortFxsBatchModifyPage.js",
      "src/modules/FXS/Port/utils/PortFxsBatchModifyTransformers.js",
      "src/modules/FXS/Port/utils/PortFxsBatchModifyValidators.js",
      "src/modules/FXS/Port/components/PortFxsBatchModifyFormFields.jsx",
      "src/modules/FXS/Port/components/PortFxsBatchModifyTableHelpers.js",
    ],
  },
  {
    name: "PortFxsAdvancedPage",
    headPath: "src/modules/FXS/Port/PortFxsAdvancedPage.jsx",
    currentRoots: [
      "src/modules/FXS/Port/hooks/usePortFxsAdvancedPage.js",
      "src/modules/FXS/Port/utils/PortFxsAdvancedTransformers.js",
      "src/modules/FXS/Port/utils/PortFxsAdvancedValidators.js",
      "src/modules/FXS/Port/components/PortFxsAdvancedFormFields.jsx",
      "src/modules/FXS/Port/components/PortFxsAdvancedTableHelpers.js",
    ],
  },
  {
    name: "PortGroupPage",
    headPath: "src/modules/FXS/Port/PortGroupPage.jsx",
    currentRoots: [
      "src/modules/FXS/Port/hooks/usePortGroupPage.js",
      "src/modules/FXS/Port/utils/PortGroupTransformers.js",
      "src/modules/FXS/Port/utils/PortGroupValidators.js",
      "src/modules/FXS/Port/components/PortGroupFormFields.jsx",
      "src/modules/FXS/Port/components/PortGroupTableHelpers.js",
    ],
  },
  {
    name: "FxsVoipSipPage",
    headPath: "src/modules/FXS/VoIP/FxsVoipSipPage.jsx",
    currentRoots: [
      "src/modules/FXS/VoIP/hooks/useFxsVoipSipPage.js",
      "src/modules/FXS/VoIP/utils/FxsVoipSipTransformers.js",
      "src/modules/FXS/VoIP/utils/FxsVoipSipValidators.js",
      "src/modules/FXS/VoIP/components/FxsVoipSipFormFields.jsx",
      "src/modules/FXS/VoIP/components/FxsVoipSipTableHelpers.js",
    ],
  },
  {
    name: "FxsVoipMediaPage",
    headPath: "src/modules/FXS/VoIP/FxsVoipMediaPage.jsx",
    currentRoots: [
      "src/modules/FXS/VoIP/hooks/useFxsVoipMediaPage.js",
      "src/modules/FXS/VoIP/utils/FxsVoipMediaTransformers.js",
      "src/modules/FXS/VoIP/utils/FxsVoipMediaValidators.js",
      "src/modules/FXS/VoIP/components/FxsVoipMediaFormFields.jsx",
      "src/modules/FXS/VoIP/components/FxsVoipMediaTableHelpers.js",
    ],
  },
  {
    name: "NatSettingsPage",
    headPath: "src/modules/FXS/VoIP/NatSettingsPage.jsx",
    currentRoots: [
      "src/modules/FXS/VoIP/hooks/useNatSettingsPage.js",
      "src/modules/FXS/VoIP/utils/NatSettingsTransformers.js",
      "src/modules/FXS/VoIP/utils/NatSettingsValidators.js",
      "src/modules/FXS/VoIP/components/NatSettingsFormFields.jsx",
      "src/modules/FXS/VoIP/components/NatSettingsTableHelpers.js",
    ],
  },
  {
    name: "SipCompatibilityPage",
    headPath: "src/modules/FXS/VoIP/SipCompatibilityPage.jsx",
    currentRoots: [
      "src/modules/FXS/VoIP/hooks/useSipCompatibilityPage.js",
      "src/modules/FXS/VoIP/utils/SipCompatibilityTransformers.js",
      "src/modules/FXS/VoIP/utils/SipCompatibilityValidators.js",
      "src/modules/FXS/VoIP/components/SipCompatibilityFormFields.jsx",
      "src/modules/FXS/VoIP/components/SipCompatibilityTableHelpers.js",
    ],
  },
  {
    name: "RouteIpToTelPage",
    headPath: "src/modules/FXS/Route/RouteIpToTelPage.jsx",
    currentRoots: [
      "src/modules/FXS/Route/hooks/useRouteIpToTelPage.js",
      "src/modules/FXS/Route/utils/RouteIpToTelTransformers.js",
      "src/modules/FXS/Route/utils/RouteIpToTelValidators.js",
      "src/modules/FXS/Route/components/RouteIpToTelFormFields.jsx",
      "src/modules/FXS/Route/components/RouteIpToTelTableHelpers.js",
    ],
  },
  {
    name: "RouteTelToIPpage",
    headPath: "src/modules/FXS/Route/RouteTelToIPpage.jsx",
    currentRoots: [
      "src/modules/FXS/Route/hooks/useRouteTelToIpPage.js",
      "src/modules/FXS/Route/utils/RouteTelToIpTransformers.js",
      "src/modules/FXS/Route/utils/RouteTelToIpValidators.js",
      "src/modules/FXS/Route/components/RouteTelToIpFormFields.jsx",
      "src/modules/FXS/Route/components/RouteTelToIpTableHelpers.js",
    ],
  },
  {
    name: "RouteRoutingParameterPage",
    headPath: "src/modules/FXS/Route/RouteRoutingParameterPage.jsx",
    currentRoots: [
      "src/modules/FXS/Route/hooks/useRouteRoutingParameterPage.js",
      "src/modules/FXS/Route/utils/RouteRoutingParameterTransformers.js",
      "src/modules/FXS/Route/utils/RouteRoutingParameterValidators.js",
      "src/modules/FXS/Route/components/RouteRoutingParameterFormFields.jsx",
      "src/modules/FXS/Route/components/RouteRoutingParameterTableHelpers.js",
    ],
  },
  {
    name: "FxsIPCallInCallerID",
    headPath: "src/modules/FXS/Num Manipulate/FxsIPCallInCallerID.jsx",
    currentRoots: [
      "src/modules/FXS/Num Manipulate/hooks/useIPCallInCallerIDPage.js",
      "src/modules/FXS/Num Manipulate/utils/IPCallInCallerIDTransformers.js",
      "src/modules/FXS/Num Manipulate/utils/IPCallInCallerIDValidators.js",
      "src/modules/FXS/Num Manipulate/components/IPCallInCallerIDFormFields.jsx",
      "src/modules/FXS/Num Manipulate/components/IPCallInCallerIDTableHelpers.js",
      "src/modules/FXS/Num Manipulate/components/NumManipulateSharedFormFields.jsx",
      "src/modules/FXS/Num Manipulate/components/NumManipulateSharedTableHelpers.js",
    ],
  },
  {
    name: "FxsIPCallInCalleeID",
    headPath: "src/modules/FXS/Num Manipulate/FxsIPCallInCalleeID.jsx",
    currentRoots: [
      "src/modules/FXS/Num Manipulate/hooks/useIPCallInCalleeIDPage.js",
      "src/modules/FXS/Num Manipulate/utils/IPCallInCalleeIDTransformers.js",
      "src/modules/FXS/Num Manipulate/utils/IPCallInCalleeIDValidators.js",
      "src/modules/FXS/Num Manipulate/components/IPCallInCalleeIDFormFields.jsx",
      "src/modules/FXS/Num Manipulate/components/IPCallInCalleeIDTableHelpers.js",
      "src/modules/FXS/Num Manipulate/components/NumManipulateSharedFormFields.jsx",
      "src/modules/FXS/Num Manipulate/components/NumManipulateSharedTableHelpers.js",
    ],
  },
  {
    name: "FxsPSTNCallInCallerID",
    headPath: "src/modules/FXS/Num Manipulate/FxsPSTNCallInCallerID.jsx",
    currentRoots: [
      "src/modules/FXS/Num Manipulate/hooks/usePSTNCallInCallerIDPage.js",
      "src/modules/FXS/Num Manipulate/utils/PSTNCallInCallerIDTransformers.js",
      "src/modules/FXS/Num Manipulate/utils/PSTNCallInCallerIDValidators.js",
      "src/modules/FXS/Num Manipulate/components/PSTNCallInCallerIDFormFields.jsx",
      "src/modules/FXS/Num Manipulate/components/PSTNCallInCallerIDTableHelpers.js",
      "src/modules/FXS/Num Manipulate/components/NumManipulateSharedFormFields.jsx",
      "src/modules/FXS/Num Manipulate/components/NumManipulateSharedTableHelpers.js",
    ],
  },
  {
    name: "FxsPSTNCallInCalleeID",
    headPath: "src/modules/FXS/Num Manipulate/FxsPSTNCallInCalleeID.jsx",
    currentRoots: [
      "src/modules/FXS/Num Manipulate/hooks/usePSTNCallInCalleeIDPage.js",
      "src/modules/FXS/Num Manipulate/utils/PSTNCallInCalleeIDTransformers.js",
      "src/modules/FXS/Num Manipulate/utils/PSTNCallInCalleeIDValidators.js",
      "src/modules/FXS/Num Manipulate/components/PSTNCallInCalleeIDFormFields.jsx",
      "src/modules/FXS/Num Manipulate/components/PSTNCallInCalleeIDTableHelpers.js",
      "src/modules/FXS/Num Manipulate/components/NumManipulateSharedFormFields.jsx",
      "src/modules/FXS/Num Manipulate/components/NumManipulateSharedTableHelpers.js",
    ],
  },
];

for (const a of audits) analyzePage(a);
