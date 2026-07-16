import {
  EXTENSION_TABLE_CARD_RADIUS as CARD_RADIUS,
  extensionPageWrapStyle as hostsPageWrapStyle,
  extensionPageInnerStyle as hostsPageInnerStyle,
  extensionCardStyle as hostsCardStyle,
  extensionToolbarStyle as hostsToolbarStyle,
  extensionFixedAlertSx as hostsFixedAlertSxBase,
  extensionCancelBtnStyle as hostsCancelBtnStyle,
  extensionPrimaryBtnStyle as hostsPrimaryBtnStyle,
  addNewModalFooterBtnStyle as hostsFooterBtnStyle,
  tdStyle,
  TH,
  extensionTableCheckboxSx,
} from "../../../../components/common";
import { C } from "../../../../theme/pbxTokens";

export const HOSTS_FORM_PAD_X = 28;

export const hostsFixedAlertSx = {
  ...hostsFixedAlertSxBase,
  maxWidth: 500,
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
  fontWeight: 500,
};

export const hostsTableContainerStyle = {
  ...hostsCardStyle,
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
};

export const hostsHeaderStyle = {
  ...hostsToolbarStyle,
  justifyContent: "space-between",
};

export const hostsHeaderTitleStyle = {
  fontSize: 13,
  fontWeight: 700,
  color: C.labelText,
  lineHeight: 1.35,
};

export const hostsHeaderActionsStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
  marginLeft: "auto",
};

export const hostsFooterStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: `7px ${HOSTS_FORM_PAD_X}px`,
  background: C.cardBg,
  borderTop: `1px solid ${C.divider}`,
  borderBottomLeftRadius: CARD_RADIUS,
  borderBottomRightRadius: CARD_RADIUS,
};

export const hostsCheckboxSx = {
  ...extensionTableCheckboxSx,
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

export const getHostsRowBg = (isSelected, idx) =>
  isSelected ? "#f0f9ff" : idx % 2 === 1 ? "#f8fafc" : "#ffffff";

export const getHostsTdStyle = (rowBg, lastRowCellStyle, extra = {}) => ({
  ...tdStyle,
  background: rowBg,
  ...lastRowCellStyle,
  ...extra,
});

export {
  CARD_RADIUS,
  hostsPageWrapStyle,
  hostsPageInnerStyle,
  hostsCardStyle,
  hostsToolbarStyle,
  hostsCancelBtnStyle,
  hostsPrimaryBtnStyle,
  hostsFooterBtnStyle,
  tdStyle,
  TH,
};
