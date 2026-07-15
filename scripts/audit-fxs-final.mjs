import { execSync } from "child_process";
import fs from "fs";

const show = (p) =>
  execSync(`git show "HEAD:${p}"`, {
    encoding: "utf8",
    maxBuffer: 20e6,
    shell: true,
  });

function keysOfNearestObjectContaining(src, token) {
  const i = src.indexOf(token);
  if (i < 0) return { keys: [], snip: "NOT FOUND" };
  let depth = 0;
  let j = i;
  for (let k = i; k >= 0; k--) {
    if (src[k] === "}") depth++;
    else if (src[k] === "{") {
      if (depth === 0) {
        j = k;
        break;
      }
      depth--;
    }
  }
  // extract keys
  let i2 = j;
  let d = 0,
    inStr = null;
  for (; i2 < src.length; i2++) {
    const ch = src[i2];
    if (inStr) {
      if (ch === "\\") {
        i2++;
        continue;
      }
      if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      inStr = ch;
      continue;
    }
    if (ch === "{" || ch === "[" || ch === "(") d++;
    else if (ch === "}" || ch === "]" || ch === ")") {
      d--;
      if (d === 0 && ch === "}") {
        const block = src.slice(j, i2 + 1);
        const keys = [];
        let dd = 0,
          jj = 1,
          s = null;
        while (jj < block.length) {
          const c = block[jj];
          if (s) {
            if (c === "\\") {
              jj += 2;
              continue;
            }
            if (c === s) s = null;
            jj++;
            continue;
          }
          if (c === '"' || c === "'" || c === "`") {
            s = c;
            jj++;
            continue;
          }
          if (c === "{" || c === "[" || c === "(") {
            dd++;
            jj++;
            continue;
          }
          if (c === "}" || c === "]" || c === ")") {
            dd--;
            jj++;
            continue;
          }
          if (dd === 0) {
            const km = block.slice(jj).match(/^([A-Za-z_][A-Za-z0-9_]*)\s*:/);
            if (km) {
              keys.push(km[1]);
              jj += km[0].length;
              continue;
            }
          }
          jj++;
        }
        return { keys: [...new Set(keys)], snip: block.slice(0, 500) };
      }
    }
  }
  return { keys: [], snip: "" };
}

function diff(a, b) {
  return {
    missing: a.filter((x) => !b.includes(x)),
    extra: b.filter((x) => !a.includes(x)),
  };
}

const lines = [];

// Compare create vs update payloads for num manip
for (const [name, path, curT, curH] of [
  [
    "IPCaller",
    "src/modules/FXS/Num Manipulate/FxsIPCallInCallerID.jsx",
    "src/modules/FXS/Num Manipulate/utils/IPCallInCallerIDTransformers.js",
    "src/modules/FXS/Num Manipulate/hooks/useIPCallInCallerIDPage.js",
  ],
  [
    "IPCallee",
    "src/modules/FXS/Num Manipulate/FxsIPCallInCalleeID.jsx",
    "src/modules/FXS/Num Manipulate/utils/IPCallInCalleeIDTransformers.js",
    "src/modules/FXS/Num Manipulate/hooks/useIPCallInCalleeIDPage.js",
  ],
  [
    "PSTNCaller",
    "src/modules/FXS/Num Manipulate/FxsPSTNCallInCallerID.jsx",
    "src/modules/FXS/Num Manipulate/utils/PSTNCallInCallerIDTransformers.js",
    "src/modules/FXS/Num Manipulate/hooks/usePSTNCallInCallerIDPage.js",
  ],
  [
    "PSTNCallee",
    "src/modules/FXS/Num Manipulate/FxsPSTNCallInCalleeID.jsx",
    "src/modules/FXS/Num Manipulate/utils/PSTNCallInCalleeIDTransformers.js",
    "src/modules/FXS/Num Manipulate/hooks/usePSTNCallInCalleeIDPage.js",
  ],
]) {
  const h = show(path);
  const c = fs.readFileSync(curT, "utf8") + fs.readFileSync(curH, "utf8");
  const hUpd = keysOfNearestObjectContaining(h, "stripped_digits_from_left:");
  // create: look for createNumberManipulation(normalized) or createData
  const createCall = h.match(
    /createNumberManipulation\(\s*([A-Za-z_][A-Za-z0-9_]*)\s*\)/
  );
  const updateCall = h.match(
    /updateNumberManipulation\(\s*([A-Za-z_][A-Za-z0-9_]*)\s*\)/
  );
  lines.push(`\n## ${name}`);
  lines.push(`HEAD update keys: ${hUpd.keys.join(", ")}`);
  lines.push(`HEAD create arg: ${createCall?.[1] || "?"}`);
  lines.push(`HEAD update arg: ${updateCall?.[1] || "?"}`);

  // In HEAD, is create using same normalized object?
  const createArea = h.slice(
    Math.max(0, h.search(/if \(editIndex/) - 50),
    h.search(/if \(editIndex/) + 900
  );
  lines.push("HEAD save branch:\n" + createArea.replace(/\s+/g, " ").slice(0, 700));

  // current
  const cUpd = keysOfNearestObjectContaining(c, "stripped_digits_from_left:");
  const cCreateCall = c.match(
    /createNumberManipulation\(\s*([A-Za-z_][A-Za-z0-9_.]*)\s*\)/
  );
  const cUpdateCall = c.match(
    /updateNumberManipulation\(\s*([A-Za-z_][A-Za-z0-9_.]*)\s*\)/
  );
  lines.push(`CUR update keys: ${cUpd.keys.join(", ")}`);
  lines.push(`CUR create arg: ${cCreateCall?.[1]} update arg: ${cUpdateCall?.[1]}`);
  const d = diff(hUpd.keys, cUpd.keys);
  lines.push(`KEY DIFF missing=${d.missing.join(",") || "none"} extra=${d.extra.join(",") || "none"}`);

  // check create uses update payload sans id or full normalized
  if (c.includes("build") && c.includes("CreatePayload")) {
    lines.push("Has separate CreatePayload builder");
  } else {
    lines.push(
      "Create path: " +
        (c.match(/createNumberManipulation\([\s\S]{0,120}\)/)?.[0] || "").replace(
          /\s+/g,
          " "
        )
    );
  }
}

// Media save HEAD vs CUR
{
  const h = show("src/modules/FXS/VoIP/FxsVoipMediaPage.jsx");
  const c =
    fs.readFileSync("src/modules/FXS/VoIP/hooks/useFxsVoipMediaPage.js", "utf8");
  lines.push("\n## Media handleSave HEAD");
  const hi = h.indexOf("const handleSave");
  lines.push(h.slice(hi, hi + 600).replace(/\s+/g, " "));
  lines.push("\n## Media handleSave CUR");
  const ci = c.indexOf("const handleSave");
  lines.push(c.slice(ci, ci + 600).replace(/\s+/g, " "));
}

// Nat save
{
  const h = show("src/modules/FXS/VoIP/NatSettingsPage.jsx");
  const c = fs.readFileSync("src/modules/FXS/VoIP/hooks/useNatSettingsPage.js", "utf8");
  lines.push("\n## Nat handleSave HEAD");
  lines.push(h.slice(h.indexOf("const handleSave"), h.indexOf("const handleSave") + 500).replace(/\s+/g, " "));
  lines.push("## Nat handleSave CUR");
  lines.push(c.slice(c.indexOf("const handleSave"), c.indexOf("const handleSave") + 500).replace(/\s+/g, " "));
  // form init from NAT_SETTINGS_FIELDS both?
  lines.push("HEAD uses NAT_SETTINGS_FIELDS: " + h.includes("NAT_SETTINGS_FIELDS"));
  lines.push("CUR uses getNatSettingsInitialState: " + c.includes("getNatSettingsInitialState"));
}

// SipCompat save
{
  const h = show("src/modules/FXS/VoIP/SipCompatibilityPage.jsx");
  const c = fs.readFileSync(
    "src/modules/FXS/VoIP/hooks/useSipCompatibilityPage.js",
    "utf8"
  );
  lines.push("\n## SipCompat handleSave HEAD");
  lines.push(h.slice(h.indexOf("const handleSave"), h.indexOf("const handleSave") + 500).replace(/\s+/g, " "));
  lines.push("## SipCompat handleSave CUR");
  lines.push(c.slice(c.indexOf("const handleSave"), c.indexOf("const handleSave") + 500).replace(/\s+/g, " "));
  lines.push("HEAD SIP_COMPATIBILITY_FIELDS: " + h.includes("SIP_COMPATIBILITY_FIELDS"));
}

// Advanced handleSave apply fields
{
  const h = show("src/modules/FXS/Port/PortFxsAdvancedPage.jsx");
  const c = fs.readFileSync("src/modules/FXS/Port/hooks/usePortFxsAdvancedPage.js", "utf8");
  lines.push("\n## Advanced handleSave HEAD");
  lines.push(h.slice(h.indexOf("const handleSave"), h.indexOf("const handleSave") + 800).replace(/\s+/g, " "));
  lines.push("## Advanced handleSave CUR");
  lines.push(c.slice(c.indexOf("const handleSave") >= 0 ? c.indexOf("const handleSave") : c.indexOf("handleSave"), c.length).slice(0, 800).replace(/\s+/g, " "));
}

// Route normalize HEAD vs CUR keys already known good for IpToTel; TelToIp compare HEAD save object
{
  const h = show("src/modules/FXS/Route/RouteTelToIPpage.jsx");
  const hKeys = keysOfNearestObjectContaining(h, "destinationAddress:");
  // find the SAVE object not form hydrate - look for setRules nearby
  const saveIdx = h.search(/setRules\s*\(/);
  const slice = h.slice(Math.max(0, saveIdx - 700), saveIdx);
  const i = slice.lastIndexOf("destinationAddress:");
  let saveKeys = [];
  if (i >= 0) {
    // find object start in full src
    const abs = Math.max(0, saveIdx - 700) + i;
    saveKeys = keysOfNearestObjectContaining(h.slice(abs - 200), "destinationAddress:").keys;
  }
  lines.push("\n## TelToIp HEAD save-ish keys: " + (saveKeys.join(", ") || hKeys.keys.join(", ")));
  lines.push("CUR normalize: index,description,sourcePortGroup,callerIdPrefix,calleeIdPrefix,routeSelf,destinationAddress,destinationPort,id");
}

// Routing parameter form keys from constants
{
  const h = show("src/modules/FXS/Route/RouteRoutingParameterPage.jsx");
  const c =
    fs.readFileSync(
      "src/modules/FXS/Route/hooks/useRouteRoutingParameterPage.js",
      "utf8"
    ) +
    fs.readFileSync(
      "src/modules/FXS/Route/utils/RouteRoutingParameterTransformers.js",
      "utf8"
    );
  lines.push("\n## RoutingParameter");
  lines.push("HEAD INITIAL import: " + (h.match(/ROUTE_ROUTING_PARAMETER_INITIAL_FORM/) ? "yes" : "no"));
  lines.push("CUR INITIAL: " + (c.includes("ROUTE_ROUTING_PARAMETER_INITIAL_FORM") ? "yes" : "no"));
  lines.push("HEAD fields const: " + (h.includes("ROUTE_ROUTING_PARAMETER_FIELDS") ? "yes" : "no"));
  lines.push("CUR fields: " + (c.includes("ROUTE_ROUTING_PARAMETER_FIELDS") ? "yes" : "no"));
}

// PortGroup HEAD newGroup vs CUR
{
  const h = show("src/modules/FXS/Port/PortGroupPage.jsx");
  const hKeys = keysOfNearestObjectContaining(h, "portSelectMode:");
  // prefer object with enumRule
  const h2 = keysOfNearestObjectContaining(h, "enumRule:");
  lines.push("\n## PortGroup HEAD save keys: " + h2.keys.join(", "));
  lines.push("CUR: id,index,description,sipAccount,displayName,ports,portSelectMode,enumRule,ringExpire,robKey");
  const d = diff(h2.keys.filter(k=>k!=='sipAccount'||true), ["id","index","description","sipAccount","displayName","ports","portSelectMode","enumRule","ringExpire","robKey"]);
  // Actually compare unique
  const hk = h2.keys;
  const ck = ["id","index","description","sipAccount","displayName","ports","portSelectMode","enumRule","ringExpire","robKey"];
  lines.push("missing: " + diff(hk, ck).missing.join(", "));
  lines.push("extra: " + diff(hk, ck).extra.join(", "));
}

fs.writeFileSync("scripts/audit-fxs-final.txt", lines.join("\n"));
console.log(lines.join("\n"));
