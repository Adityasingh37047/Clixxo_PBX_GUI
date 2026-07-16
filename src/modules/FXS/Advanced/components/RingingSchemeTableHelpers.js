import { C } from "../../../../theme/pbxTokens";

import { extensionToolbarStyle as fxsToolbarStyle } from "../../../../components/common";

export const fxsFormInlineFooterStyle = {
  display: "flex",
  justifyContent: "center",
  gap: 12,
  padding: "10px 28px",
  borderTop: `1px solid ${C.divider}`,
  background: C.cardBg,
  boxSizing: "border-box",
};

export { EXTENSION_TABLE_CARD_RADIUS as RINGING_SCHEME_CARD_RADIUS, extensionPageWrapStyle as ringingSchemePageWrapStyle, extensionCardStyle as ringingSchemeCardStyle, addNewModalFooterBtnStyle as ringingSchemeFormBtnStyle, extensionFixedAlertSx as ringingSchemeFixedAlertSx } from "../../../../components/common";

export { fxsFormInlineFooterStyle as ringingSchemeFooterStyle };





export const ringingSchemeFieldBg = "#ffffff";

export const ringingSchemeCardTitleBarStyle = {
  ...fxsToolbarStyle,
  justifyContent: "flex-start",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
};

export const ringingSchemeFormBodyStyle = {
  padding: "16px 28px 12px",
  display: "flex",
  flexDirection: "column",
  gap: 16,
  width: "100%",
  boxSizing: "border-box",
};

export const RS_TH_STYLE = { padding: "8px 14px" };
export const RS_TD_STYLE = {
  padding: "6px 14px",
  lineHeight: 1.2,
  verticalAlign: "middle",
};

export const ringingSchemeTableShellStyle = {
  border: `1px solid ${C.divider}`,
  borderRadius: 8,
  overflow: "hidden",
  background: C.cardBg,
  width: "100%",
};

export const ringingSchemeTableStyle = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: 0,
  tableLayout: "fixed",
};

export const ringingSchemeThStyle = {
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

export const ringingSchemeRowAltBg = "#f8fafc";

export function getRingingSchemeRowBg(idx) {
  return idx % 2 === 1 ? ringingSchemeRowAltBg : C.cardBg;
}

export function getRingingSchemeMatchTdStyle(isLast) {
  return {
    borderBottom: isLast ? "none" : `1px solid ${C.divider}`,
    borderRight: `1px solid ${C.divider}`,
  };
}

export function getRingingSchemeLastTdStyle(isLast) {
  return {
    borderBottom: isLast ? "none" : `1px solid ${C.divider}`,
  };
}
