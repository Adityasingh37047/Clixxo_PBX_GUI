import { execSync } from "child_process";
import fs from "fs";

const show = (p) =>
  execSync(`git show "HEAD:${p}"`, {
    encoding: "utf8",
    maxBuffer: 20e6,
    shell: true,
  });

function around(src, needle, before = 120, after = 700) {
  const i = src.indexOf(needle);
  if (i < 0) return `NOT FOUND: ${needle}`;
  return src.slice(Math.max(0, i - before), i + after).replace(/\r/g, "");
}

function extractKeysFromObjectLiteral(src, anchor) {
  const idx = typeof anchor === "number" ? anchor : src.search(anchor);
  if (idx < 0) return [];
  let i = idx;
  while (i < src.length && src[i] !== "{") i++;
  if (src[i] !== "{") return [];
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
        return [...new Set(keys)];
      }
    }
  }
  return [];
}

const out = [];

// Advanced form keys
{
  const h = show("src/modules/FXS/Port/PortFxsAdvancedPage.jsx");
  const c = fs.readFileSync(
    "src/modules/FXS/Port/utils/PortFxsAdvancedTransformers.js",
    "utf8"
  );
  // find getInitialBatchForm in HEAD
  let hKeys = extractKeysFromObjectLiteral(h, /getInitialBatchForm\s*=\s*\(\)\s*=>\s*\(/);
  if (!hKeys.length)
    hKeys = extractKeysFromObjectLiteral(h, /const getInitialBatchForm/);
  // try function body return
  if (!hKeys.length) {
    const m = h.match(/getInitialBatchForm[\s\S]{0,80}?\{/);
    if (m) hKeys = extractKeysFromObjectLiteral(h, h.indexOf(m[0]) + m[0].length - 1);
  }
  // look for forbidOutgoingCall object initializer
  if (!hKeys.length) {
    const i = h.indexOf("forbidOutgoingCall:");
    if (i > 0) {
      // walk back to {
      let j = i;
      while (j > 0 && !(h[j] === "{" && h.slice(j, j + 80).includes("forbidOutgoingCall"))) j--;
      hKeys = extractKeysFromObjectLiteral(h, j);
    }
  }
  const cKeys = extractKeysFromObjectLiteral(
    c,
    /getInitialPortFxsAdvancedBatchForm\s*=\s*\(\)\s*=>\s*\{/
  );
  // return object inside function
  let cKeys2 = cKeys;
  if (!cKeys2.length || cKeys2.length < 3) {
    const i = c.indexOf("getInitialPortFxsAdvancedBatchForm");
    const r = c.indexOf("return", i);
    cKeys2 = extractKeysFromObjectLiteral(c, r >= 0 ? r : i);
  }
  out.push("\n## Advanced form keys");
  out.push("HEAD: " + hKeys.join(", "));
  out.push("CUR:  " + cKeys2.join(", "));
  out.push(
    "MISSING: " +
      hKeys.filter((k) => !cKeys2.includes(k)).join(", ")
  );
  out.push(
    "EXTRA: " + cKeys2.filter((k) => !hKeys.includes(k)).join(", ")
  );
  out.push("HEAD SNIP:\n" + around(h, "forbidOutgoingCall", 300, 900));
}

// VoIP SIP — save passes form; compare default form / field names from constants usage
{
  const h = show("src/modules/FXS/VoIP/FxsVoipSipPage.jsx");
  const c =
    fs.readFileSync("src/modules/FXS/VoIP/hooks/useFxsVoipSipPage.js", "utf8") +
    fs.readFileSync("src/modules/FXS/VoIP/utils/FxsVoipSipTransformers.js", "utf8");
  out.push("\n## VoipSip save");
  out.push(around(h, "saveFxsSipSettings(", 100, 200));
  out.push("CUR:\n" + around(c, "saveFxsSipSettings(", 100, 200));
  // form state init
  const hForm = extractKeysFromObjectLiteral(h, /setForm\w*\([^)]*\{/) ||
    extractKeysFromObjectLiteral(h, /useState\(\{/);
  // Find largest useState({
  let best = [];
  const re = /useState\(\s*\{/g;
  let m;
  while ((m = re.exec(h))) {
    const keys = extractKeysFromObjectLiteral(h, m.index + m[0].length - 1);
    if (keys.length > best.length) best = keys;
  }
  out.push("HEAD form-ish keys: " + best.join(", "));
  // current getInitial
  let cBest = extractKeysFromObjectLiteral(c, /getFxsVoipSipInitialForm|DEFAULT_FORM|FXS_VOIP_SIP/);
  const re2 = /(?:DEFAULT_FORM|INITIAL_FORM|getFxsVoipSipInitialForm)[\s\S]{0,40}?\{/g;
  while ((m = re2.exec(c))) {
    const keys = extractKeysFromObjectLiteral(c, m.index + m[0].length - 1);
    if (keys.length > cBest.length) cBest = keys;
  }
  // Also check constants file used by HEAD
  out.push("Need SIP_SETTINGS_FIELDS from constants — checking HEAD form hydration");
  out.push(around(h, "setForm(", 50, 400));
  out.push(around(h, "form[", 50, 200));
}

// Route IpToTel row build in HEAD
{
  const h = show("src/modules/FXS/Route/RouteIpToTelPage.jsx");
  const c = fs.readFileSync(
    "src/modules/FXS/Route/utils/RouteIpToTelTransformers.js",
    "utf8"
  ) + fs.readFileSync("src/modules/FXS/Route/hooks/useRouteIpToTelPage.js", "utf8");
  out.push("\n## RouteIpToTel");
  // find object with callerIdPrefix in save handler
  const i = h.indexOf("callerIdPrefix:");
  let j = i;
  while (j > 0 && h[j] !== "{") j--;
  // walk further back to outermost object for the rule
  let depth = 0;
  for (let k = i; k >= 0; k--) {
    if (h[k] === "}") depth++;
    if (h[k] === "{") {
      if (depth === 0) {
        j = k;
        break;
      }
      depth--;
    }
  }
  const hKeys = extractKeysFromObjectLiteral(h, j);
  out.push("HEAD row keys: " + hKeys.join(", "));
  out.push(around(h, "callerIdPrefix:", 200, 400));

  // current — look in hook for same field assignment
  const ci = c.indexOf("callerIdPrefix");
  out.push("CUR around callerIdPrefix:\n" + around(c, "callerIdPrefix", 200, 500));
  // find rule object construction
  let cKeys = [];
  const re = /(?:const|let)\s+\w+\s*=\s*\{/g;
  let m;
  while ((m = re.exec(c))) {
    const keys = extractKeysFromObjectLiteral(c, m.index + m[0].length - 1);
    if (keys.includes("callerIdPrefix") || keys.includes("sourceIP")) {
      if (keys.length > cKeys.length) cKeys = keys;
    }
  }
  out.push("CUR row keys: " + cKeys.join(", "));
  out.push(
    "MISSING: " + hKeys.filter((k) => !cKeys.includes(k)).join(", ")
  );
}

// Route TelToIp
{
  const h = show("src/modules/FXS/Route/RouteTelToIPpage.jsx");
  const c =
    fs.readFileSync("src/modules/FXS/Route/utils/RouteTelToIpTransformers.js", "utf8") +
    fs.readFileSync("src/modules/FXS/Route/hooks/useRouteTelToIpPage.js", "utf8");
  const i = h.indexOf("destinationAddress:");
  let j = i;
  let depth = 0;
  for (let k = i; k >= 0; k--) {
    if (h[k] === "}") depth++;
    if (h[k] === "{") {
      if (depth === 0) {
        j = k;
        break;
      }
      depth--;
    }
  }
  const hKeys = extractKeysFromObjectLiteral(h, j);
  let cKeys = [];
  const re = /(?:const|let)\s+\w+\s*=\s*\{/g;
  let m;
  while ((m = re.exec(c))) {
    const keys = extractKeysFromObjectLiteral(c, m.index + m[0].length - 1);
    if (keys.includes("destinationAddress") || keys.includes("sourcePortGroup")) {
      if (keys.length > cKeys.length) cKeys = keys;
    }
  }
  out.push("\n## RouteTelToIp");
  out.push("HEAD: " + hKeys.join(", "));
  out.push("CUR:  " + cKeys.join(", "));
  out.push("MISSING: " + hKeys.filter((k) => !cKeys.includes(k)).join(", "));
}

// RouteRoutingParameter
{
  const h = show("src/modules/FXS/Route/RouteRoutingParameterPage.jsx");
  const c =
    fs.readFileSync(
      "src/modules/FXS/Route/utils/RouteRoutingParameterTransformers.js",
      "utf8"
    ) +
    fs.readFileSync(
      "src/modules/FXS/Route/hooks/useRouteRoutingParameterPage.js",
      "utf8"
    );
  out.push("\n## RouteRoutingParameter HEAD size " + h.length + " CUR " + c.length);
  out.push(around(h, "handleSave", 50, 500));
  out.push(around(c, "handleSave", 50, 500));
  // form keys
  let hBest = [],
    cBest = [];
  const re = /useState\(\s*\{/g;
  let m;
  while ((m = re.exec(h))) {
    const keys = extractKeysFromObjectLiteral(h, m.index + m[0].length - 1);
    if (keys.length > hBest.length) hBest = keys;
  }
  while ((m = re.exec(c))) {
    const keys = extractKeysFromObjectLiteral(c, m.index + m[0].length - 1);
    if (keys.length > cBest.length) cBest = keys;
  }
  // also DEFAULT
  const re2 = /(?:DEFAULT|INITIAL|formData)\w*\s*=\s*\{/g;
  while ((m = re2.exec(c))) {
    const keys = extractKeysFromObjectLiteral(c, m.index + m[0].length - 1);
    if (keys.length > cBest.length) cBest = keys;
  }
  while ((m = re2.exec(h))) {
    const keys = extractKeysFromObjectLiteral(h, m.index + m[0].length - 1);
    if (keys.length > hBest.length) hBest = keys;
  }
  out.push("HEAD form: " + hBest.join(", "));
  out.push("CUR form: " + cBest.join(", "));
  out.push("MISSING: " + hBest.filter((k) => !cBest.includes(k)).join(", "));
}

// Num Manipulate — find actual payload fields in HEAD (may use formData spread)
{
  for (const [name, path, curFiles] of [
    [
      "IPCaller",
      "src/modules/FXS/Num Manipulate/FxsIPCallInCallerID.jsx",
      [
        "src/modules/FXS/Num Manipulate/utils/IPCallInCallerIDTransformers.js",
        "src/modules/FXS/Num Manipulate/hooks/useIPCallInCallerIDPage.js",
      ],
    ],
    [
      "IPCallee",
      "src/modules/FXS/Num Manipulate/FxsIPCallInCalleeID.jsx",
      [
        "src/modules/FXS/Num Manipulate/utils/IPCallInCalleeIDTransformers.js",
        "src/modules/FXS/Num Manipulate/hooks/useIPCallInCalleeIDPage.js",
      ],
    ],
    [
      "PSTNCaller",
      "src/modules/FXS/Num Manipulate/FxsPSTNCallInCallerID.jsx",
      [
        "src/modules/FXS/Num Manipulate/utils/PSTNCallInCallerIDTransformers.js",
        "src/modules/FXS/Num Manipulate/hooks/usePSTNCallInCallerIDPage.js",
      ],
    ],
    [
      "PSTNCallee",
      "src/modules/FXS/Num Manipulate/FxsPSTNCallInCalleeID.jsx",
      [
        "src/modules/FXS/Num Manipulate/utils/PSTNCallInCalleeIDTransformers.js",
        "src/modules/FXS/Num Manipulate/hooks/usePSTNCallInCalleeIDPage.js",
      ],
    ],
  ]) {
    const h = show(path);
    const c = curFiles.map((f) => fs.readFileSync(f, "utf8")).join("\n");
    out.push("\n## " + name);
    // Search for payload construction - may be inline object with call_initiator
    const i = h.search(/call_initiator\s*:/);
    if (i >= 0) {
      let depth = 0,
        j = i;
      for (let k = i; k >= 0; k--) {
        if (h[k] === "}") depth++;
        if (h[k] === "{") {
          if (depth === 0) {
            j = k;
            break;
          }
          depth--;
        }
      }
      const hKeys = extractKeysFromObjectLiteral(h, j);
      out.push("HEAD payload keys: " + hKeys.join(", "));
      out.push(around(h, "call_initiator:", 150, 450));
    } else {
      out.push("HEAD: no call_initiator: literal — checking formData usage");
      out.push(around(h, "createNumberManipulation", 200, 300));
      // maybe uses ...formData
      const m = h.match(/createNumberManipulation\([^)]{0,200}\)/);
      out.push("call: " + (m ? m[0] : "n/a"));
      const m2 = h.match(/updateNumberManipulation\([^)]{0,200}\)/);
      out.push("update: " + (m2 ? m2[0] : "n/a"));
    }
    // current payloads
    const createPay = extractKeysFromObjectLiteral(
      c,
      /build\w+(?:Create|Update)?Payload\s*=\s*\([^)]*\)\s*=>/
    );
    let cKeys = createPay;
    const re = /build\w+Payload\s*=\s*\([^)]*\)\s*=>\s*\(/g;
    let m;
    while ((m = re.exec(c))) {
      const keys = extractKeysFromObjectLiteral(c, m.index + m[0].length - 1);
      if (keys.length > cKeys.length) cKeys = keys;
    }
    // also without paren wrap
    const re2 = /export const build\w+Payload[\s\S]{0,60}?=>\s*\{/g;
    while ((m = re2.exec(c))) {
      const keys = extractKeysFromObjectLiteral(c, m.index + m[0].length - 1);
      if (keys.length > cKeys.length) cKeys = keys;
    }
    out.push("CUR payload keys: " + cKeys.join(", "));
    // features
    out.push(
      "FEATS head/cur: delete=" +
        h.includes("deleteNumberManipulation") +
        "/" +
        c.includes("deleteNumberManipulation") +
        " clearAll=" +
        /clearAll|Clear All|handleClearAll/i.test(h) +
        "/" +
        /clearAll|Clear All|handleClearAll/i.test(c) +
        " pager=" +
        /rowsPerPage|TablePagination|handleChangePage/i.test(h) +
        "/" +
        /rowsPerPage|TablePagination|handleChangePage/i.test(c) +
        " listPstn=" +
        h.includes("listPstnGroups") +
        "/" +
        c.includes("listPstnGroups")
    );
  }
}

// Nat / SipCompat form fields from HEAD vs CUR transformers
{
  for (const [name, headPath, curPath, needle] of [
    [
      "Nat",
      "src/modules/FXS/VoIP/NatSettingsPage.jsx",
      "src/modules/FXS/VoIP/utils/NatSettingsTransformers.js",
      "stun",
    ],
    [
      "SipCompat",
      "src/modules/FXS/VoIP/SipCompatibilityPage.jsx",
      "src/modules/FXS/VoIP/utils/SipCompatibilityTransformers.js",
      "prack",
    ],
  ]) {
    const h = show(headPath);
    const c = fs.readFileSync(curPath, "utf8");
    out.push("\n## " + name + " form");
    let hBest = [];
    const re = /useState\(\s*\{/g;
    let m;
    while ((m = re.exec(h))) {
      const keys = extractKeysFromObjectLiteral(h, m.index + m[0].length - 1);
      if (keys.length > hBest.length) hBest = keys;
    }
    let cBest = [];
    const re2 = /(?:DEFAULT_FORM|INITIAL_FORM|get\w+Initial\w*)[\s\S]{0,40}?[=:]\s*\{/g;
    while ((m = re2.exec(c))) {
      const keys = extractKeysFromObjectLiteral(c, m.index + m[0].length - 1);
      if (keys.length > cBest.length) cBest = keys;
    }
    // also plain export const X = {
    const re3 = /export const \w+\s*=\s*\{/g;
    while ((m = re3.exec(c))) {
      const keys = extractKeysFromObjectLiteral(c, m.index + m[0].length - 1);
      if (keys.length > 3 && keys.length > cBest.length) cBest = keys;
    }
    out.push("HEAD: " + hBest.join(", "));
    out.push("CUR:  " + cBest.join(", "));
    out.push("MISSING: " + hBest.filter((k) => !cBest.includes(k)).join(", "));
    out.push(around(h, needle, 80, 300));
  }
}

fs.writeFileSync("scripts/audit-fxs-deep.txt", out.join("\n"));
console.log(out.join("\n"));
