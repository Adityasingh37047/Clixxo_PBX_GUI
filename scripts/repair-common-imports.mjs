import fs from "fs";

const FILES = [
  "src/modules/FXS/Advanced/components/ColorRingFormFields.jsx",
  "src/modules/FXS/Advanced/components/DialingRuleFormFields.jsx",
  "src/modules/FXS/Advanced/components/DialingTimeoutFormFields.jsx",
  "src/modules/FXS/Advanced/components/FxsFormFields.jsx",
  "src/modules/FXS/Advanced/components/ToneDetecterFormFields.jsx",
  "src/modules/FXS/Port/components/PortFxsAdvancedFormFields.jsx",
  "src/modules/FXS/Port/components/PortFxsBatchModifyFormFields.jsx",
  "src/modules/FXS/Port/components/PortGroupFormFields.jsx",
  "src/modules/FXS/Route/components/RouteIpToTelFormFields.jsx",
  "src/modules/FXS/Route/components/RouteRoutingParameterFormFields.jsx",
  "src/modules/FXS/VoIP/components/FxsVoipMediaFormFields.jsx",
  "src/modules/FXS/VoIP/components/FxsVoipSipFormFields.jsx",
  "src/modules/FXS/VoIP/components/NatSettingsFormFields.jsx",
  "src/modules/FXS/VoIP/components/SipCompatibilityFormFields.jsx",
  "src/modules/E1-PRI/Route/components/RouteRoutingParameterFormFields.jsx",
];

const ALIASES = [
  ["Btn", "Btn"],
  ["TH", "TH"],
  ["tdStyle", "tdStyle"],
  ["FxsBreadcrumb", "ExtensionBreadcrumb", "FxsBreadcrumb"],
  ["FxsChromeBreadcrumb", "ExtensionBreadcrumb", "FxsChromeBreadcrumb"],
  ["fxsCardStyle", "extensionCardStyle", "fxsCardStyle"],
  ["fxsToolbarStyle", "extensionToolbarStyle", "fxsToolbarStyle"],
  ["fxsToolbarBtnStyle", "addNewModalFooterBtnStyle", "fxsToolbarBtnStyle"],
  ["fxsAddNewModalFooterStyle", "addNewModalFooterStyle", "fxsAddNewModalFooterStyle"],
  [
    "fxsAddNewModalFooterBtnStyle",
    "addNewModalFooterBtnStyle",
    "fxsAddNewModalFooterBtnStyle",
  ],
  [
    "fxsAddNewModalFooterCancelBtnStyle",
    "addNewModalFooterCancelBtnStyle",
    "fxsAddNewModalFooterCancelBtnStyle",
  ],
  ["fxsPageWrapStyle", "extensionPageWrapStyle", "fxsPageWrapStyle"],
  ["fxsPageInnerStyle", "extensionPageInnerStyle", "fxsPageInnerStyle"],
  ["e1PriPageWrapStyle", "extensionPageWrapStyle", "e1PriPageWrapStyle"],
  ["e1PriPageInnerStyle", "extensionPageInnerStyle", "e1PriPageInnerStyle"],
  ["e1PriCardStyle", "extensionCardStyle", "e1PriCardStyle"],
  ["e1PriToolbarStyle", "extensionToolbarStyle", "e1PriToolbarStyle"],
  ["e1PriToolbarBtnStyle", "addNewModalFooterBtnStyle", "e1PriToolbarBtnStyle"],
  ["E1PriBreadcrumb", "ExtensionBreadcrumb", "E1PriBreadcrumb"],
];

function buildImport(src) {
  const items = [];
  for (const [needle, common, alias] of ALIASES) {
    if (!src.includes(needle)) continue;
    const part = alias === common ? common : `${common} as ${alias}`;
    if (!items.includes(part)) items.push(part);
  }
  if (!items.length) return null;
  return `import { ${items.join(", ")} } from "../../../../components/common";`;
}

for (const file of FILES) {
  let src = fs.readFileSync(file, "utf8");
  if (src.includes("components/common")) continue;
  const imp = buildImport(src);
  if (!imp) {
    console.warn("skip (no symbols):", file);
    continue;
  }
  const tokenEnd = src.indexOf("from \"../../../../theme/pbxTokens\";");
  if (tokenEnd === -1) {
    console.warn("skip (no tokens):", file);
    continue;
  }
  const insertAt = tokenEnd + "from \"../../../../theme/pbxTokens\";".length;
  src = src.slice(0, insertAt) + "\n" + imp + src.slice(insertAt);
  fs.writeFileSync(file, src);
  console.log("fixed:", file);
}
