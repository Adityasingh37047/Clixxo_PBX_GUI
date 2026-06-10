/**
 * PBX Trunks UI kit — matches FXS Num Manipulate / IP Call In CallerID.
 */
import {
  C,
  Btn,
  TH,
  tdStyle,
  checkboxSx,
  numManipulateCardStyle as baseCardStyle,
  numManipulateToolbarStyle as baseToolbarStyle,
  numManipulatePaginationStyle as basePaginationStyle,
  pbxModalCancelBtnStyle,
} from "./numManipulateSharedUi";
import {
  OUTLINED_BORDER,
  OUTLINED_HOVER,
  OUTLINED_FOCUS,
  muiTextFieldSx,
  muiSelectSx,
  nativeFieldInputStyle,
  nativeFieldInteraction,
} from "./outlinedFieldUi";

export { C, Btn, TH, tdStyle, checkboxSx };

export {
  OUTLINED_BORDER,
  OUTLINED_HOVER,
  OUTLINED_FOCUS,
  muiTextFieldSx,
  muiSelectSx,
  nativeFieldInteraction,
};

/** DOD tab — compact centered name/number inputs */
export const trunkDodCompactInputStyle = {
  ...nativeFieldInputStyle,
  width: "100%",
  height: 28,
  padding: "0 8px",
  borderRadius: 6,
  cursor: "text",
};

/** DOD tab — multi-select list boxes (border via .trunk-dod-multi-select CSS) */
export const trunkDodMultiSelectStyle = {
  width: "100%",
  padding: "4px 6px",
  fontSize: 13,
  lineHeight: 1.4,
  borderRadius: 6,
  outline: "none",
  backgroundColor: "#fff",
  color: "#0f172a",
  boxSizing: "border-box",
  overflowY: "auto",
  cursor: "pointer",
  display: "block",
};

export const TRUNK_DOD_MULTI_SELECT_CLASS = "trunk-dod-multi-select";

export const TRUNK_DOD_MULTI_SELECT_MAX_ROWS = 8;
export const TRUNK_DOD_MULTI_SELECT_ROW_PX = 20;

/** Visible rows: grows with content, scrolls after max rows */
export const getTrunkDodMultiSelectSize = (optionCount) =>
  Math.min(Math.max(optionCount, 1), TRUNK_DOD_MULTI_SELECT_MAX_ROWS);

export const getTrunkDodMultiSelectHeightPx = (optionCount) =>
  getTrunkDodMultiSelectSize(optionCount) * TRUNK_DOD_MULTI_SELECT_ROW_PX + 10;

/** DOD tab — ADD / DELETE / ENSURE / CANCEL toolbar buttons */
export const trunkDodToolbarBtnStyle = {
  height: 30,
  fontSize: 12,
  padding: "6px 14px",
  borderRadius: 10,
};

export const trunkDodTransferBtnStyle = {
  height: 32,
  width: "100%",
  border: "1px solid #cbd5e1",
  borderRadius: 6,
  backgroundColor: "#cbd5e1",
  color: "#374151",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  transition: "background-color 0.15s ease",
};

export const TRUNK_CARD_RADIUS = 10;

export const CARD_RADIUS = TRUNK_CARD_RADIUS;

export const numManipulateCardStyle = {
  ...baseCardStyle,
  borderRadius: TRUNK_CARD_RADIUS,
};

export const numManipulateToolbarStyle = {
  ...baseToolbarStyle,
  borderTopLeftRadius: TRUNK_CARD_RADIUS,
  borderTopRightRadius: TRUNK_CARD_RADIUS,
};

export const numManipulatePaginationStyle = {
  ...basePaginationStyle,
  borderBottomLeftRadius: TRUNK_CARD_RADIUS,
  borderBottomRightRadius: TRUNK_CARD_RADIUS,
};

/** Separator line left of vertical scrollbar only — see index.css `.trunk-table-scroll` */
export const TRUNK_TABLE_SCROLL_CLASS = "trunk-table-scroll";

/** Table body scroll area */
export const trunkTableScrollStyle = {
  overflowX: "auto",
  overflowY: "auto",
  maxHeight: 460,
  borderBottom: `1px solid ${C.cardBorder}`,
  boxSizing: "border-box",
};

/** Full-width line above horizontal scrollbar (below table rows) — not on table cells */
export const trunkTableInnerStyle = {
  minWidth: "100%",
  width: "max-content",
  borderBottom: `1px solid ${C.cardBorder}`,
  boxSizing: "border-box",
};

/** Add/Edit modal shell — aligned with SIP To SIP Account (900px) */
export const trunkModalPaperSx = {
  width: 900,
  maxWidth: "95vw",
  mx: "auto",
  p: 0,
  borderRadius: 2,
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

export const trunkImportModalPaperSx = {
  width: 420,
  maxWidth: "95vw",
  mx: "auto",
  p: 0,
  borderRadius: 2,
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

export const trunkModalTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
};

export const trunkModalFormPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  width: "100%",
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 8,
  paddingTop: 0,
  paddingBottom: 0,
  boxSizing: "border-box",
};

export const trunkModalActionsStyle = {
  display: "flex",
  justifyContent: "center",
  gap: 16,
  padding: "16px 24px",
  background: C.pageBg,
  borderTop: `1px solid ${C.cardBorder}`,
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
};

export const trunkModalPrimaryBtnStyle = {
  minWidth: 100,
  height: 33,
  fontSize: 13,
};

export const trunkModalCancelBtnStyle = pbxModalCancelBtnStyle;

export const trunkToolbarBtnStyle = { height: 30 };

export const trunkAddNewBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
};

/** Adapt Caller ID — compact fill boxes */
export const trunkAdaptTextFieldSx = {
  ...muiTextFieldSx,
  "& .MuiOutlinedInput-root": {
    ...muiTextFieldSx["& .MuiOutlinedInput-root"],
    height: 32,
    fontSize: 12,
  },
  "& .MuiOutlinedInput-input": {
    fontSize: 12,
    padding: "6px 8px",
    "&::placeholder": {
      fontSize: 12,
      opacity: 0.65,
    },
  },
};

/** Adapt Caller ID — + / × row action buttons */
export const trunkAdaptRowActionBtnSx = {
  border: "1px solid #cbd5e1",
  borderRadius: 1,
  width: 32,
  height: 32,
  padding: 0,
  backgroundColor: "#cbd5e1",
  color: "#374151",
  "&:hover": {
    backgroundColor: "#b6c2d3",
  },
};

export const trunkSelectionBadgeStyle = {
  background: "#eff6ff",
  color: C.accent,
  fontSize: 11,
  fontWeight: 700,
  padding: "5px 12px",
  borderRadius: 999,
  border: `1px solid ${C.accent}`,
};

export const TRUNK_SECTION_HEADING_COLOR = "#30415A";

/** Field labels — Trunk Type, Get CalledID Type, ulaw, Match Mode, etc. */
export const TRUNK_FIELD_LABEL_COLOR = "#3E5475";

/** Modal section heading — aligned with PBX Add Extension modal sections */
export { PbxModalSectionHeading as TrunkModalSectionHeading } from "./numManipulateSharedUi";
