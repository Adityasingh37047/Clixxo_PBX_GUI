import {
  C } from "../../../../theme/pbxTokens";

import { extensionToolbarStyle as fxsToolbarStyle,
  extensionTableCheckboxSx as functionKeyCheckboxSx,
} from "../../../../components/common";

export { functionKeyCheckboxSx };


export const fxsFormInlineFooterStyle = {
  display: "flex",
  justifyContent: "center",
  gap: 12,
  padding: "10px 28px",
  borderTop: `1px solid ${C.divider}`,
  background: C.cardBg,
  boxSizing: "border-box",
};

export { EXTENSION_TABLE_CARD_RADIUS as FUNCTION_KEY_CARD_RADIUS, extensionPageWrapStyle as functionKeyPageWrapStyle, extensionCardStyle as functionKeyCardStyle, addNewModalFooterBtnStyle as functionKeyFormBtnStyle, extensionFixedAlertSx as functionKeyFixedAlertSx } from "../../../../components/common";

export { fxsFormInlineFooterStyle as functionKeyFooterStyle };





export const FUNCTION_KEY_SECTION_TITLE_COLOR = "#30415A";

export const functionKeyCardTitleBarStyle = {
  ...fxsToolbarStyle,
  justifyContent: "flex-start",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
};

export const functionKeyCardBodyStyle = {
  padding: "14px 28px 4px",
};

export const functionKeySectionBlockStyle = {
  marginBottom: 20,
};

export const functionKeySectionTitleStyle = {
  fontSize: 12,
  fontWeight: 700,
  color: FUNCTION_KEY_SECTION_TITLE_COLOR,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  marginBottom: 8,
};

export const FK_TH_STYLE = { padding: "8px 14px" };
export const FK_TD_STYLE = {
  padding: "6px 14px",
  lineHeight: 1.2,
  verticalAlign: "middle",
};

export const FK_CONTROL_WIDTH = 130;
export const FK_CONTROL_HEIGHT = 28;

export const functionKeyTableShellStyle = {
  border: `1px solid ${C.divider}`,
  borderRadius: 8,
  overflow: "hidden",
  background: C.cardBg,
};

export const functionKeyTableStyle = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: 0,
  tableLayout: "fixed",
};

export const functionKeyThStyle = {
  background: "#F8FAFC",
  color: C.labelText,
  fontWeight: 700,
  fontSize: 11,
  padding: "8px 14px",
  borderBottom: `1px solid ${C.divider}`,
  borderRight: `1px solid ${C.divider}`,
  whiteSpace: "nowrap",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
};



export const functionKeyRowAltBg = "#f8fafc";
export const functionKeyDisabledRowBg = "#fafbfc";

export function getFunctionKeyRowBg(enabled, idx) {
  if (!enabled) return functionKeyDisabledRowBg;
  return idx % 2 === 1 ? functionKeyRowAltBg : C.cardBg;
}

export function getFunctionKeyTdStyle(isLast) {
  return {
    borderBottom: isLast ? "none" : `1px solid ${C.divider}`,
    borderRight: `1px solid ${C.divider}`,
  };
}

export function getFunctionKeyLastTdStyle(isLast) {
  return {
    borderBottom: isLast ? "none" : `1px solid ${C.divider}`,
  };
}
