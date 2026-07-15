import { execSync } from "child_process";
import fs from "fs";

const gitShow = (p) =>
  execSync(`git show "HEAD:${p}"`, { encoding: "utf8", maxBuffer: 20e6, shell: true });

const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "");

function objectKeysAt(src, startHint) {
  const idx = typeof startHint === "number" ? startHint : src.search(startHint);
  if (idx < 0) return null;
  let i = idx;
  // advance to {
  while (i < src.length && src[i] !== "{") i++;
  if (src[i] !== "{") return null;
  const start = i;
  let depth = 0,
    inStr = null;
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
        let d = 0,
          j = 1,
          s = null;
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
            const km = block.slice(j).match(/^([A-Za-z_][A-Za-z0-9_]*)\s*:/);
            if (km) {
              keys.push(km[1]);
              j += km[0].length;
              continue;
            }
          }
          j++;
        }
        return { keys, block };
      }
    }
  }
  return null;
}

function extractErrorMsgs(src) {
  const msgs = new Set();
  const patterns = [
    /showMessage\(\s*["']error["']\s*,\s*["']([^"']+)["']\s*\)/g,
    /showMessage\(\s*["']error["']\s*,\s*`([^`]+)`\s*\)/g,
    /alert\(\s*["']([^"']+)["']\s*\)/g,
    /alert\(\s*`([^`]+)`\s*\)/g,
    /message:\s*["']([^"']+)["']/g,
    /return\s+["']([^"']+)["']\s*;/g,
    /return\s+`([^`]+)`\s*;/g,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(src))) {
      const t = m[1].replace(/\$\{[^}]+\}/g, "${...}");
      if (
        /please|required|range|cannot|choose|select|enter|input|invalid|must|already exists|no less|difference|sip port|forward|password|batch step|auto dial|jitter|codec|rfc2833|rtp|destination|caller|callee|index|description|port group|time threshold|period/i.test(
          t
        )
      ) {
        msgs.add(t);
      }
    }
  }
  return [...msgs].sort();
}

function extractApi(src) {
  const set = new Set();
  const re = /import\s*\{([^}]+)\}\s*from\s*["'][^"']*apiService["']/g;
  let m;
  while ((m = re.exec(src))) {
    m[1].split(",").forEach((p) => {
      const n = p.trim().split(/\s+as\s+/)[0].trim();
      if (n) set.add(n);
    });
  }
  return [...set].sort();
}

function diff(a, b) {
  const A = new Set(a),
    B = new Set(b);
  return {
    missing: a.filter((x) => !B.has(x)),
    extra: b.filter((x) => !A.has(x)),
  };
}

function unique(arr) {
  return [...new Set(arr)];
}

function comparePayload(name, headSrc, curSrc, headAnchor, curAnchor) {
  const h = objectKeysAt(headSrc, headAnchor);
  const c = objectKeysAt(curSrc, curAnchor || headAnchor);
  const hk = unique(h?.keys || []);
  const ck = unique(c?.keys || []);
  const d = diff(hk, ck);
  return {
    name,
    headKeys: hk,
    curKeys: ck,
    missing: d.missing,
    extra: d.extra,
    headFound: !!h,
    curFound: !!c,
  };
}

const report = [];
const issues = [];

function note(folder, page, type, detail) {
  issues.push({ folder, page, type, detail });
}

// ─── PORT MODIFY ───
{
  const head = gitShow("src/modules/FXS/Port/PortFxsModifyPage.jsx");
  const cur =
    read("src/modules/FXS/Port/utils/PortFxsModifyTransformers.js") +
    read("src/modules/FXS/Port/utils/PortFxsModifyValidators.js") +
    read("src/modules/FXS/Port/hooks/usePortFxsModifyPage.js");
  const p = comparePayload(
    "PortFxsModify",
    head,
    cur,
    /const payload\s*=/,
    /buildPortFxsModifySavePayload\s*=\s*\([^)]*\)\s*=>/
  );
  report.push(p);
  const md = diff(extractErrorMsgs(head), extractErrorMsgs(cur));
  if (p.missing.length)
    note("Port", "PortFxsModify", "SAVE_KEY_CUT", p.missing.join(", "));
  if (md.missing.length)
    note("Port", "PortFxsModify", "VALIDATION_CUT", md.missing.join(" | "));
}

// ─── PORT BATCH ───
{
  const head = gitShow("src/modules/FXS/Port/PortFxsBatchModifyPage.jsx");
  const cur =
    read("src/modules/FXS/Port/utils/PortFxsBatchModifyTransformers.js") +
    read("src/modules/FXS/Port/utils/PortFxsBatchModifyValidators.js") +
    read("src/modules/FXS/Port/hooks/usePortFxsBatchModifyPage.js");
  const p = comparePayload(
    "PortFxsBatchModify",
    head,
    cur,
    /const payload\s*=/,
    /buildPortFxsBatchSavePayload\s*=\s*\([^)]*\)\s*=>/
  );
  report.push(p);
  const md = diff(extractErrorMsgs(head), extractErrorMsgs(cur));
  if (p.missing.length)
    note("Port", "PortFxsBatchModify", "SAVE_KEY_CUT", p.missing.join(", "));
  if (md.missing.length)
    note("Port", "PortFxsBatchModify", "VALIDATION_CUT", md.missing.join(" | "));
}

// ─── PORT ADVANCED — form field keys from getInitialBatchForm / batchForm saves ───
{
  const head = gitShow("src/modules/FXS/Port/PortFxsAdvancedPage.jsx");
  const cur =
    read("src/modules/FXS/Port/utils/PortFxsAdvancedTransformers.js") +
    read("src/modules/FXS/Port/utils/PortFxsAdvancedValidators.js") +
    read("src/modules/FXS/Port/hooks/usePortFxsAdvancedPage.js") +
    read("src/modules/FXS/Port/PortFxsAdvancedPage.jsx");
  // extract getInitialBatchForm object
  const hInit = objectKeysAt(head, /getInitialBatchForm\s*=\s*\(\)\s*=>\s*\(/) ||
    objectKeysAt(head, /function getInitialBatchForm/) ||
    objectKeysAt(head, /const getInitialBatchForm/);
  const cInit =
    objectKeysAt(cur, /getInitialBatchForm\s*=\s*\(\)\s*=>\s*\(/) ||
    objectKeysAt(cur, /export const getInitialBatchForm/) ||
    objectKeysAt(cur, /INITIAL_BATCH_FORM\s*=/) ||
    objectKeysAt(cur, /getPortFxsAdvancedInitial/);
  const hk = unique(hInit?.keys || []);
  const ck = unique(cInit?.keys || []);
  const kd = diff(hk, ck);
  report.push({
    name: "PortFxsAdvanced_form",
    headKeys: hk,
    curKeys: ck,
    missing: kd.missing,
    extra: kd.extra,
  });
  const md = diff(extractErrorMsgs(head), extractErrorMsgs(cur));
  if (kd.missing.length)
    note("Port", "PortFxsAdvanced", "FORM_KEY_CUT", kd.missing.join(", "));
  if (md.missing.length)
    note("Port", "PortFxsAdvanced", "VALIDATION_CUT", md.missing.join(" | "));
}

// ─── PORT GROUP ───
{
  const head = gitShow("src/modules/FXS/Port/PortGroupPage.jsx");
  const cur =
    read("src/modules/FXS/Port/utils/PortGroupTransformers.js") +
    read("src/modules/FXS/Port/utils/PortGroupValidators.js") +
    read("src/modules/FXS/Port/hooks/usePortGroupPage.js");
  const hRow = objectKeysAt(head, /const newGroup\s*=/);
  const cRow =
    objectKeysAt(cur, /export const buildPortGroupRow[\s\S]{0,300}?return\s*/) ||
    objectKeysAt(cur, /buildPortGroupRow\s*=/);
  // better: find return { after buildPortGroupRow
  const cIdx = cur.indexOf("buildPortGroupRow");
  const cRow2 = cIdx >= 0 ? objectKeysAt(cur.slice(cIdx), /return\s*/) : null;
  const hk = unique((hRow || {}).keys || []);
  const ck = unique((cRow2 || cRow || {}).keys || []);
  const kd = diff(hk, ck);
  report.push({ name: "PortGroup", headKeys: hk, curKeys: ck, missing: kd.missing, extra: kd.extra });
  const md = diff(extractErrorMsgs(head), extractErrorMsgs(cur));
  // Filter non-blocking success alerts from validation cuts for save
  const saveBlockMissing = md.missing.filter((m) =>
    /please|choose|required|invalid|must|cannot|select at least/i.test(m)
  );
  if (kd.missing.length)
    note("Port", "PortGroup", "SAVE_KEY_CUT", kd.missing.join(", "));
  if (saveBlockMissing.length)
    note("Port", "PortGroup", "VALIDATION_CUT", saveBlockMissing.join(" | "));
}

// ─── PORT FXS PAGE wiring ───
{
  const head = gitShow("src/modules/FXS/Port/PortFxsPage.jsx");
  const cur =
    read("src/modules/FXS/Port/PortFxsPage.jsx") +
    read("src/modules/FXS/Port/hooks/usePortFxsPage.js");
  const checks = [
    ["fetchFxsPorts", head.includes("fetchFxsPorts"), cur.includes("fetchFxsPorts")],
    ["showBatchModify", head.includes("showBatchModify"), cur.includes("showBatchModify") || cur.includes("BatchModify")],
    ["showSingleModify", head.includes("showSingleModify"), cur.includes("showSingleModify") || cur.includes("SingleModify") || cur.includes("PortFxsModify")],
    ["PortFxsModifyPage", head.includes("PortFxsModifyPage"), cur.includes("PortFxsModify")],
    ["PortFxsBatchModifyPage", head.includes("PortFxsBatchModifyPage"), cur.includes("PortFxsBatchModify")],
    ["modifyFormRef", head.includes("modifyFormRef"), cur.includes("modifyFormRef")],
    ["batchFormRef", head.includes("batchFormRef"), cur.includes("batchFormRef")],
    ["loadPorts", /loadPorts|fetchPorts|reload/.test(head), /loadPorts|fetchPorts|reload|refresh/.test(cur)],
  ];
  for (const [n, h, c] of checks) {
    if (h && !c) note("Port", "PortFxsPage", "WIRING_CUT", n);
  }
  report.push({
    name: "PortFxsPage_wiring",
    checks: checks.map(([n, h, c]) => `${n}: head=${h} cur=${c}`),
  });
}

// ─── VoIP SIP ───
{
  const head = gitShow("src/modules/FXS/VoIP/FxsVoipSipPage.jsx");
  const cur =
    read("src/modules/FXS/VoIP/hooks/useFxsVoipSipPage.js") +
    read("src/modules/FXS/VoIP/utils/FxsVoipSipTransformers.js") +
    read("src/modules/FXS/VoIP/utils/FxsVoipSipValidators.js") +
    read("src/modules/FXS/VoIP/FxsVoipSipPage.jsx");
  const ad = diff(extractApi(head), extractApi(cur));
  // form default keys
  const hForm =
    objectKeysAt(head, /useState\(\s*\{/) ||
    objectKeysAt(head, /DEFAULT_FORM\s*=/) ||
    objectKeysAt(head, /initialForm\s*=/) ||
    objectKeysAt(head, /getInitialForm/);
  const cForm =
    objectKeysAt(cur, /FXS_VOIP_SIP_DEFAULT_FORM\s*=/) ||
    objectKeysAt(cur, /DEFAULT_FORM\s*=/) ||
    objectKeysAt(cur, /getFxsVoipSipInitialForm/) ||
    objectKeysAt(cur, /getInitialForm/);
  // save call payload: look for saveFxsSipSettings(
  const hSaveIdx = head.indexOf("saveFxsSipSettings");
  const cSaveIdx = cur.indexOf("saveFxsSipSettings");
  // try to find object arg or variable assignment nearby
  const hNear = head.slice(Math.max(0, hSaveIdx - 800), hSaveIdx + 200);
  const cNear = cur.slice(Math.max(0, cSaveIdx - 800), cSaveIdx + 200);
  const hPayload =
    objectKeysAt(hNear, /(?:payload|body|data|settings)\s*=/) ||
    objectKeysAt(hNear, /saveFxsSipSettings\s*\(/);
  const cPayload =
    objectKeysAt(cNear, /(?:payload|body|data|settings)\s*=/) ||
    objectKeysAt(cNear, /saveFxsSipSettings\s*\(/) ||
    objectKeysAt(cur, /buildFxsVoipSipSavePayload/) ||
    objectKeysAt(cur, /build\w*Sip\w*Payload/);

  const hk = unique((hPayload || hForm || {}).keys || []);
  const ck = unique((cPayload || cForm || {}).keys || []);
  const kd = diff(hk, ck);
  report.push({
    name: "FxsVoipSip",
    headKeys: hk,
    curKeys: ck,
    missing: kd.missing,
    extra: kd.extra,
    headApi: extractApi(head),
    curApi: extractApi(cur),
    hSaveSnippet: hNear.replace(/\s+/g, " ").slice(0, 350),
    cSaveSnippet: cNear.replace(/\s+/g, " ").slice(0, 350),
  });
  if (kd.missing.length)
    note("VoIP", "FxsVoipSip", "SAVE_KEY_CUT", kd.missing.join(", "));
  if (ad.missing.length)
    note("VoIP", "FxsVoipSip", "API_CUT", ad.missing.join(", "));
  // handlers
  for (const fn of ["listFxsSipSettings", "saveFxsSipSettings", "resetFxsSipSettings", "statusFxsSipSettings"]) {
    if (head.includes(fn) && !cur.includes(fn))
      note("VoIP", "FxsVoipSip", "HANDLER_CUT", fn);
  }
}

// ─── VoIP Media ───
{
  const head = gitShow("src/modules/FXS/VoIP/FxsVoipMediaPage.jsx");
  const cur =
    read("src/modules/FXS/VoIP/hooks/useFxsVoipMediaPage.js") +
    read("src/modules/FXS/VoIP/utils/FxsVoipMediaTransformers.js") +
    read("src/modules/FXS/VoIP/utils/FxsVoipMediaValidators.js") +
    read("src/modules/FXS/VoIP/FxsVoipMediaPage.jsx");
  const hForm =
    objectKeysAt(head, /DEFAULT_FORM\s*=/) ||
    objectKeysAt(head, /useState\(\s*\{/);
  const cForm =
    objectKeysAt(cur, /FXS_VOIP_MEDIA_DEFAULT_FORM\s*=/) ||
    objectKeysAt(cur, /DEFAULT_FORM\s*=/);
  // codec list presence
  const hd = head.match(/DEFAULT_SELECTED_CODECS\s*=\s*\[([^\]]+)\]/);
  const cd = cur.match(/DEFAULT_SELECTED_CODECS\s*=\s*\[([^\]]+)\]/) ||
    cur.match(/FXS_VOIP_MEDIA_DEFAULT_SELECTED_CODECS\s*=\s*\[([^\]]+)\]/);
  const hk = unique((hForm || {}).keys || []);
  const ck = unique((cForm || {}).keys || []);
  const kd = diff(hk, ck);
  const md = diff(extractErrorMsgs(head), extractErrorMsgs(cur));
  report.push({
    name: "FxsVoipMedia",
    headKeys: hk,
    curKeys: ck,
    missing: kd.missing,
    extra: kd.extra,
    headCodecs: hd?.[1],
    curCodecs: cd?.[1],
    missingMsgs: md.missing,
  });
  if (kd.missing.length)
    note("VoIP", "FxsVoipMedia", "SAVE_KEY_CUT", kd.missing.join(", "));
  if (md.missing.length)
    note("VoIP", "FxsVoipMedia", "VALIDATION_CUT", md.missing.join(" | "));
}

// ─── Nat Settings ───
{
  const head = gitShow("src/modules/FXS/VoIP/NatSettingsPage.jsx");
  const cur =
    read("src/modules/FXS/VoIP/hooks/useNatSettingsPage.js") +
    read("src/modules/FXS/VoIP/utils/NatSettingsTransformers.js") +
    read("src/modules/FXS/VoIP/utils/NatSettingsValidators.js") +
    read("src/modules/FXS/VoIP/NatSettingsPage.jsx");
  const hForm =
    objectKeysAt(head, /DEFAULT_FORM\s*=/) ||
    objectKeysAt(head, /useState\(\s*\{/) ||
    objectKeysAt(head, /initialForm\s*=/);
  const cForm =
    objectKeysAt(cur, /NAT_SETTINGS_DEFAULT_FORM\s*=/) ||
    objectKeysAt(cur, /DEFAULT_FORM\s*=/) ||
    objectKeysAt(cur, /getNatSettingsInitial/);
  const hk = unique((hForm || {}).keys || []);
  const ck = unique((cForm || {}).keys || []);
  const kd = diff(hk, ck);
  const md = diff(extractErrorMsgs(head), extractErrorMsgs(cur));
  report.push({
    name: "NatSettings",
    headKeys: hk,
    curKeys: ck,
    missing: kd.missing,
    extra: kd.extra,
    missingMsgs: md.missing,
  });
  if (kd.missing.length)
    note("VoIP", "NatSettings", "SAVE_KEY_CUT", kd.missing.join(", "));
  if (md.missing.length)
    note("VoIP", "NatSettings", "VALIDATION_CUT", md.missing.join(" | "));
}

// ─── Sip Compatibility ───
{
  const head = gitShow("src/modules/FXS/VoIP/SipCompatibilityPage.jsx");
  const cur =
    read("src/modules/FXS/VoIP/hooks/useSipCompatibilityPage.js") +
    read("src/modules/FXS/VoIP/utils/SipCompatibilityTransformers.js") +
    read("src/modules/FXS/VoIP/utils/SipCompatibilityValidators.js") +
    read("src/modules/FXS/VoIP/SipCompatibilityPage.jsx");
  const hForm =
    objectKeysAt(head, /DEFAULT_FORM\s*=/) ||
    objectKeysAt(head, /useState\(\s*\{/);
  const cForm =
    objectKeysAt(cur, /SIP_COMPATIBILITY_DEFAULT_FORM\s*=/) ||
    objectKeysAt(cur, /DEFAULT_FORM\s*=/) ||
    objectKeysAt(cur, /getSipCompatibilityInitial/);
  const hk = unique((hForm || {}).keys || []);
  const ck = unique((cForm || {}).keys || []);
  const kd = diff(hk, ck);
  const md = diff(extractErrorMsgs(head), extractErrorMsgs(cur));
  report.push({
    name: "SipCompatibility",
    headKeys: hk,
    curKeys: ck,
    missing: kd.missing,
    extra: kd.extra,
    missingMsgs: md.missing,
  });
  if (kd.missing.length)
    note("VoIP", "SipCompatibility", "SAVE_KEY_CUT", kd.missing.join(", "));
  if (md.missing.length)
    note("VoIP", "SipCompatibility", "VALIDATION_CUT", md.missing.join(" | "));
}

// ─── Route pages ───
for (const cfg of [
  {
    folder: "Route",
    name: "RouteIpToTel",
    head: "src/modules/FXS/Route/RouteIpToTelPage.jsx",
    cur: [
      "src/modules/FXS/Route/hooks/useRouteIpToTelPage.js",
      "src/modules/FXS/Route/utils/RouteIpToTelTransformers.js",
      "src/modules/FXS/Route/utils/RouteIpToTelValidators.js",
    ],
    headRow: /const (?:newRule|rulePayload|rule)\s*=/,
    curRow: /buildRouteIpToTelRow|buildIpToTel/,
  },
  {
    folder: "Route",
    name: "RouteTelToIp",
    head: "src/modules/FXS/Route/RouteTelToIPpage.jsx",
    cur: [
      "src/modules/FXS/Route/hooks/useRouteTelToIpPage.js",
      "src/modules/FXS/Route/utils/RouteTelToIpTransformers.js",
      "src/modules/FXS/Route/utils/RouteTelToIpValidators.js",
    ],
    headRow: /const (?:newRule|rulePayload|rule)\s*=/,
    curRow: /buildRouteTelToIpRow|buildTelToIp/,
  },
  {
    folder: "Route",
    name: "RouteRoutingParameter",
    head: "src/modules/FXS/Route/RouteRoutingParameterPage.jsx",
    cur: [
      "src/modules/FXS/Route/hooks/useRouteRoutingParameterPage.js",
      "src/modules/FXS/Route/utils/RouteRoutingParameterTransformers.js",
      "src/modules/FXS/Route/utils/RouteRoutingParameterValidators.js",
    ],
    headRow: /const (?:newRule|rulePayload|rule|param)\s*=/,
    curRow: /buildRouteRouting|buildRouting/,
  },
]) {
  const head = gitShow(cfg.head);
  const cur = cfg.cur.map(read).join("\n");
  // find handleSave / handleSubmit block for row construction
  let hRow = objectKeysAt(head, cfg.headRow);
  if (!hRow) {
    // try after "setRules" nearby object
    const idx = head.search(/setRules\s*\(|rules\.map|\[\.\.\.rules/);
    if (idx >= 0) {
      const slice = head.slice(Math.max(0, idx - 600), idx + 50);
      hRow = objectKeysAt(slice, /\{/);
    }
  }
  let cRow = null;
  const cIdx = cur.search(cfg.curRow);
  if (cIdx >= 0) {
    cRow =
      objectKeysAt(cur.slice(cIdx), /=>\s*/) ||
      objectKeysAt(cur.slice(cIdx), /return\s*/);
  }
  if (!cRow) cRow = objectKeysAt(cur, /export const build\w+[\s\S]{0,80}?=>/);
  if (!cRow) {
    const ri = cur.search(/return\s*\{/);
    // find largest return in transformers
    const returns = [];
    const re = /return\s*/g;
    let m;
    while ((m = re.exec(cur))) {
      const o = objectKeysAt(cur, m.index);
      if (o && o.keys.length >= 4) returns.push(o);
    }
    if (returns.length)
      cRow = returns.sort((a, b) => b.keys.length - a.keys.length)[0];
  }
  // also search HEAD for object with route fields
  if (!hRow || hRow.keys.length < 3) {
    const returns = [];
    const re = /(?:const|let)\s+\w+\s*=\s*/g;
    let m;
    while ((m = re.exec(head))) {
      const o = objectKeysAt(head, m.index + m[0].length - 1);
      if (
        o &&
        o.keys.some((k) =>
          /callerIdPrefix|calleeIdPrefix|destination|sourceIP|sourcePortGroup|routeByNumber|routeSelf/i.test(
            k
          )
        )
      )
        returns.push(o);
    }
    if (returns.length)
      hRow = returns.sort((a, b) => b.keys.length - a.keys.length)[0];
  }

  const hk = unique((hRow || {}).keys || []);
  const ck = unique((cRow || {}).keys || []);
  const kd = diff(hk, ck);
  const md = diff(extractErrorMsgs(head), extractErrorMsgs(cur));
  report.push({
    name: cfg.name,
    headKeys: hk,
    curKeys: ck,
    missing: kd.missing,
    extra: kd.extra,
    missingMsgs: md.missing,
  });
  if (kd.missing.length)
    note(cfg.folder, cfg.name, "SAVE_KEY_CUT", kd.missing.join(", "));
  if (md.missing.length)
    note(cfg.folder, cfg.name, "VALIDATION_CUT", md.missing.join(" | "));
}

// ─── Num Manipulate ───
for (const cfg of [
  {
    name: "IPCallInCallerID",
    head: "src/modules/FXS/Num Manipulate/FxsIPCallInCallerID.jsx",
    cur: [
      "src/modules/FXS/Num Manipulate/hooks/useIPCallInCallerIDPage.js",
      "src/modules/FXS/Num Manipulate/utils/IPCallInCallerIDTransformers.js",
      "src/modules/FXS/Num Manipulate/utils/IPCallInCallerIDValidators.js",
      "src/modules/FXS/Num Manipulate/FxsIPCallInCallerID.jsx",
    ],
    pstn: false,
  },
  {
    name: "IPCallInCalleeID",
    head: "src/modules/FXS/Num Manipulate/FxsIPCallInCalleeID.jsx",
    cur: [
      "src/modules/FXS/Num Manipulate/hooks/useIPCallInCalleeIDPage.js",
      "src/modules/FXS/Num Manipulate/utils/IPCallInCalleeIDTransformers.js",
      "src/modules/FXS/Num Manipulate/utils/IPCallInCalleeIDValidators.js",
      "src/modules/FXS/Num Manipulate/FxsIPCallInCalleeID.jsx",
    ],
    pstn: false,
  },
  {
    name: "PSTNCallInCallerID",
    head: "src/modules/FXS/Num Manipulate/FxsPSTNCallInCallerID.jsx",
    cur: [
      "src/modules/FXS/Num Manipulate/hooks/usePSTNCallInCallerIDPage.js",
      "src/modules/FXS/Num Manipulate/utils/PSTNCallInCallerIDTransformers.js",
      "src/modules/FXS/Num Manipulate/utils/PSTNCallInCallerIDValidators.js",
      "src/modules/FXS/Num Manipulate/FxsPSTNCallInCallerID.jsx",
    ],
    pstn: true,
  },
  {
    name: "PSTNCallInCalleeID",
    head: "src/modules/FXS/Num Manipulate/FxsPSTNCallInCalleeID.jsx",
    cur: [
      "src/modules/FXS/Num Manipulate/hooks/usePSTNCallInCalleeIDPage.js",
      "src/modules/FXS/Num Manipulate/utils/PSTNCallInCalleeIDTransformers.js",
      "src/modules/FXS/Num Manipulate/utils/PSTNCallInCalleeIDValidators.js",
      "src/modules/FXS/Num Manipulate/FxsPSTNCallInCalleeID.jsx",
    ],
    pstn: true,
  },
]) {
  const head = gitShow(cfg.head);
  const cur = cfg.cur.map(read).join("\n");
  // payload near createNumberManipulation
  const hCreate = head.indexOf("createNumberManipulation");
  const cCreate = cur.indexOf("createNumberManipulation");
  const hPay =
    objectKeysAt(head.slice(Math.max(0, hCreate - 900), hCreate + 100), /(?:payload|body|data)\s*=/) ||
    objectKeysAt(head.slice(Math.max(0, hCreate - 900), hCreate + 100), /createNumberManipulation\s*\(/);
  const cPay =
    objectKeysAt(cur, /build\w*Payload\s*=/) ||
    objectKeysAt(cur.slice(Math.max(0, cCreate - 900), cCreate + 100), /(?:payload|body|data)\s*=/) ||
    objectKeysAt(cur.slice(Math.max(0, cCreate - 900), cCreate + 100), /createNumberManipulation\s*\(/);

  // also try update
  const hUpd = head.indexOf("updateNumberManipulation");
  const hPay2 =
    hUpd >= 0
      ? objectKeysAt(head.slice(Math.max(0, hUpd - 900), hUpd + 100), /(?:payload|body|data)\s*=/)
      : null;

  const hk = unique((hPay || hPay2 || {}).keys || []);
  const ck = unique((cPay || {}).keys || []);
  const kd = diff(hk, ck);
  const md = diff(extractErrorMsgs(head), extractErrorMsgs(cur));
  const ad = diff(extractApi(head), extractApi(cur));

  const feats = {
    delete: head.includes("deleteNumberManipulation") && cur.includes("deleteNumberManipulation"),
    create: head.includes("createNumberManipulation") && cur.includes("createNumberManipulation"),
    update: head.includes("updateNumberManipulation") && cur.includes("updateNumberManipulation"),
    list: (head.includes("listNumberManipulations") || head.includes("fetchNumberManipulations")) &&
      (cur.includes("listNumberManipulations") || cur.includes("fetchNumberManipulations")),
    clearAll:
      (/clearAll|Clear All|handleClearAll/i.test(head)) ===
        (/clearAll|Clear All|handleClearAll/i.test(cur)) ||
      (/clearAll|Clear All|handleClearAll/i.test(cur) && /clearAll|Clear All|handleClearAll/i.test(head)),
    pagination:
      (/rowsPerPage|TablePagination|pageSize|handleChangePage/i.test(head) &&
        /rowsPerPage|TablePagination|pageSize|handleChangePage/i.test(cur)) ||
      !/rowsPerPage|TablePagination|pageSize|handleChangePage/i.test(head),
    listPstn: !cfg.pstn || (head.includes("listPstnGroups") && cur.includes("listPstnGroups")),
  };
  // real cuts
  if (head.includes("deleteNumberManipulation") && !cur.includes("deleteNumberManipulation"))
    note("NumManipulate", cfg.name, "FEATURE_CUT", "deleteNumberManipulation");
  if (/clearAll|Clear All|handleClearAll/i.test(head) && !/clearAll|Clear All|handleClearAll/i.test(cur))
    note("NumManipulate", cfg.name, "FEATURE_CUT", "clearAll/Clear All/handleClearAll");
  if (/rowsPerPage|TablePagination|handleChangePage/i.test(head) && !/rowsPerPage|TablePagination|handleChangePage/i.test(cur))
    note("NumManipulate", cfg.name, "FEATURE_CUT", "pagination");
  if (cfg.pstn && head.includes("listPstnGroups") && !cur.includes("listPstnGroups"))
    note("NumManipulate", cfg.name, "FEATURE_CUT", "listPstnGroups");

  report.push({
    name: cfg.name,
    headKeys: hk,
    curKeys: ck,
    missing: kd.missing,
    extra: kd.extra,
    missingMsgs: md.missing,
    apiMissing: ad.missing,
    feats,
    hSaveSnippet: head
      .slice(Math.max(0, hCreate - 400), hCreate + 80)
      .replace(/\s+/g, " ")
      .slice(0, 400),
    cSaveSnippet: cur
      .slice(Math.max(0, cCreate - 400), cCreate + 80)
      .replace(/\s+/g, " ")
      .slice(0, 400),
  });
  if (kd.missing.length)
    note("NumManipulate", cfg.name, "SAVE_KEY_CUT", kd.missing.join(", "));
  if (md.missing.length)
    note("NumManipulate", cfg.name, "VALIDATION_CUT", md.missing.join(" | "));
  if (ad.missing.length)
    note("NumManipulate", cfg.name, "API_CUT", ad.missing.join(", "));
}

// Hook return vs page usage quick check
for (const [page, hookPath, hookName] of [
  ["src/modules/FXS/Port/PortFxsPage.jsx", "src/modules/FXS/Port/hooks/usePortFxsPage.js", "usePortFxsPage"],
  ["src/modules/FXS/Port/PortGroupPage.jsx", "src/modules/FXS/Port/hooks/usePortGroupPage.js", "usePortGroupPage"],
  ["src/modules/FXS/VoIP/FxsVoipSipPage.jsx", "src/modules/FXS/VoIP/hooks/useFxsVoipSipPage.js", "useFxsVoipSipPage"],
  ["src/modules/FXS/VoIP/FxsVoipMediaPage.jsx", "src/modules/FXS/VoIP/hooks/useFxsVoipMediaPage.js", "useFxsVoipMediaPage"],
  ["src/modules/FXS/Route/RouteIpToTelPage.jsx", "src/modules/FXS/Route/hooks/useRouteIpToTelPage.js", "useRouteIpToTelPage"],
  ["src/modules/FXS/Num Manipulate/FxsIPCallInCallerID.jsx", "src/modules/FXS/Num Manipulate/hooks/useIPCallInCallerIDPage.js", "useIPCallInCallerIDPage"],
  ["src/modules/FXS/Num Manipulate/FxsPSTNCallInCallerID.jsx", "src/modules/FXS/Num Manipulate/hooks/usePSTNCallInCallerIDPage.js", "usePSTNCallInCallerIDPage"],
]) {
  const pageSrc = read(page);
  const hookSrc = read(hookPath);
  const dm = pageSrc.match(new RegExp(`const\\s*\\{([^}]+)\\}\\s*=\\s*${hookName}\\s*\\(`));
  if (!dm) {
    note("Wiring", page.split("/").pop(), "PAGE_HOOK_DESTRUCTURE_MISSING", hookName);
    continue;
  }
  const used = dm[1]
    .split(",")
    .map((s) => s.trim().replace(/\/\/.*$/, "").split(":")[0].split("=")[0].trim())
    .filter(Boolean);
  // get return keys from last return {
  const ri = hookSrc.lastIndexOf("return {");
  if (ri < 0) continue;
  const ret = objectKeysAt(hookSrc, ri);
  if (!ret) continue;
  const missing = used.filter((u) => !ret.keys.includes(u));
  if (missing.length)
    note("Wiring", page.split("/").pop(), "HOOK_MISSING_RETURN", missing.join(", "));
}

let out = "PAYLOAD COMPARISONS\n";
for (const r of report) {
  out += `\n## ${r.name}\n`;
  if (r.headKeys) out += `HEAD: ${r.headKeys.join(", ") || "(none)"}\nCUR:  ${r.curKeys.join(", ") || "(none)"}\nMISSING: ${r.missing?.join(", ") || "(none)"}\nEXTRA: ${r.extra?.join(", ") || "(none)"}\n`;
  if (r.missingMsgs) out += `MISSING_MSGS: ${r.missingMsgs.join(" | ") || "(none)"}\n`;
  if (r.checks) out += r.checks.join("\n") + "\n";
  if (r.headApi) out += `HEAD_API: ${r.headApi.join(", ")}\nCUR_API: ${r.curApi.join(", ")}\n`;
  if (r.hSaveSnippet) out += `H_SAVE: ${r.hSaveSnippet}\n`;
  if (r.cSaveSnippet) out += `C_SAVE: ${r.cSaveSnippet}\n`;
  if (r.headCodecs) out += `H_CODECS: ${r.headCodecs}\nC_CODECS: ${r.curCodecs}\n`;
  if (r.feats) out += `FEATS: ${JSON.stringify(r.feats)}\n`;
}

out += "\n\nISSUES (real cuts only after filter)\n";
if (!issues.length) out += "ALL CLEAR\n";
else {
  out += "| Folder | Page | Type | Detail |\n|---|---|---|---|\n";
  for (const i of issues) {
    out += `| ${i.folder} | ${i.page} | ${i.type} | ${String(i.detail).replace(/\|/g, "/")} |\n`;
  }
}

fs.writeFileSync("scripts/audit-fxs-report.txt", out);
console.log(out);
