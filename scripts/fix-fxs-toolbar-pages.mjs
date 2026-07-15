/**
 * Update FXS pages to use toolbar cancel/primary btn styles (SipRegister pattern).
 */
import fs from "fs";
import path from "path";

const ROOT = process.cwd();

const PAGE_FILES = [
  "src/modules/FXS/Advanced/ColorRingPage.jsx",
  "src/modules/FXS/Advanced/DialingRulePage.jsx",
  "src/modules/FXS/Advanced/ToneDetecterPage.jsx",
  "src/modules/FXS/Route/RouteTelToIPpage.jsx",
  "src/modules/FXS/Route/RouteIpToTelPage.jsx",
  "src/modules/FXS/Num Manipulate/FxsIPCallInCallerID.jsx",
  "src/modules/FXS/Num Manipulate/FxsIPCallInCalleeID.jsx",
  "src/modules/FXS/Num Manipulate/FxsPSTNCallInCallerID.jsx",
  "src/modules/FXS/Num Manipulate/FxsPSTNCallInCalleeID.jsx",
  "src/modules/FXS/Port/PortFxsPage.jsx",
  "src/modules/FXS/Port/PortGroupPage.jsx",
  "src/modules/FXS/Port/PortFxsAdvancedPage.jsx",
];

function deriveNames(toolbarBtnStyle) {
  const prefix = toolbarBtnStyle.replace(/ToolbarBtnStyle$/, "");
  return {
    old: toolbarBtnStyle,
    cancel: `${prefix}ToolbarCancelBtnStyle`,
    primary: `${prefix}ToolbarPrimaryBtnStyle`,
  };
}

function patchPage(filePath) {
  let src = fs.readFileSync(filePath, "utf8");
  const orig = src;
  const styleMatch = src.match(/\b(\w+ToolbarBtnStyle)\b/);
  if (!styleMatch) {
    // Port pages use fxsToolbarBtnStyle
    if (!src.includes("fxsToolbarBtnStyle")) return false;
    if (!src.includes("fxsToolbarCancelBtnStyle")) {
      // add imports from FormFields - Port pages import fxsToolbarBtnStyle from FormFields
      src = src.replace(
        /(\bfxsToolbarBtnStyle\b)/,
        "fxsToolbarCancelBtnStyle,\n  fxsToolbarPrimaryBtnStyle,\n  fxsToolbarBtnStyle",
      );
      // dedupe if run twice
      src = src.replace(
        /fxsToolbarCancelBtnStyle,\s*\n\s*fxsToolbarPrimaryBtnStyle,\s*\n\s*fxsToolbarCancelBtnStyle,\s*\n\s*fxsToolbarPrimaryBtnStyle,/,
        "fxsToolbarCancelBtnStyle,\n  fxsToolbarPrimaryBtnStyle,",
      );
    }
    src = src.replace(
      /(<Btn[^>]*variant="primary"[^>]*style=\{)fxsToolbarBtnStyle(\})/g,
      "$1fxsToolbarPrimaryBtnStyle$2",
    );
    src = src.replace(
      /(<Btn[^>]*variant="cancel"[^>]*style=\{)fxsToolbarBtnStyle(\})/g,
      "$1fxsToolbarCancelBtnStyle$2",
    );
    src = src.replace(
      /(style=\{)fxsToolbarBtnStyle(\}[^>]*variant="primary")/g,
      "$1fxsToolbarPrimaryBtnStyle$2",
    );
    src = src.replace(
      /(style=\{)fxsToolbarBtnStyle(\}[^>]*variant="cancel")/g,
      "$1fxsToolbarCancelBtnStyle$2",
    );
  } else {
    const { old, cancel, primary } = deriveNames(styleMatch[1]);
    if (!src.includes(cancel)) {
      src = src.replace(
        new RegExp(`\\b${old}\\b`),
        `${cancel},\n  ${primary},\n  ${old}`,
      );
      src = src.replace(
        new RegExp(
          `${cancel},\\s*\\n\\s*${primary},\\s*\\n\\s*${cancel},\\s*\\n\\s*${primary},`,
        ),
        `${cancel},\n  ${primary},`,
      );
    }
    src = src.replace(
      new RegExp(`(<Btn[^>]*variant="primary"[^>]*style=\\{)${old}(\\})`, "g"),
      `$1${primary}$2`,
    );
    src = src.replace(
      new RegExp(`(<Btn[^>]*variant="cancel"[^>]*style=\\{)${old}(\\})`, "g"),
      `$1${cancel}$2`,
    );
    // RouteTelToIp uses RouteTelToIpBtn
    src = src.replace(
      new RegExp(`(<RouteTelToIpBtn[^>]*variant="primary"[^>]*style=\\{)${old}(\\})`, "g"),
      `$1${primary}$2`,
    );
    src = src.replace(
      new RegExp(`(<RouteTelToIpBtn[^>]*variant="cancel"[^>]*style=\\{)${old}(\\})`, "g"),
      `$1${cancel}$2`,
    );
    src = src.replace(
      new RegExp(`(<RouteIpToTelBtn[^>]*variant="primary"[^>]*style=\\{)${old}(\\})`, "g"),
      `$1${primary}$2`,
    );
    src = src.replace(
      new RegExp(`(<RouteIpToTelBtn[^>]*variant="cancel"[^>]*style=\\{)${old}(\\})`, "g"),
      `$1${cancel}$2`,
    );
  }

  if (src !== orig) {
    fs.writeFileSync(filePath, src);
    console.log("fixed:", path.relative(ROOT, filePath));
    return true;
  }
  return false;
}

let n = 0;
for (const rel of PAGE_FILES) {
  if (patchPage(path.join(ROOT, rel))) n++;
}
console.log(`Done. ${n} pages updated.`);
