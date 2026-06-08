import React from "react";
import {
  C,
  Btn,
  TH,
  tdStyle,
  CARD_RADIUS,
  numManipulateCardStyle,
  numManipulateToolbarStyle,
  numManipulatePaginationStyle,
} from "../numManipulate/numManipulateSharedUi";
import {
  OUTLINED_BORDER,
  OUTLINED_HOVER,
  OUTLINED_FOCUS,
  muiSelectSx,
  nativeFieldInteraction,
} from "../shared/outlinedFieldUi";
import { systemToolsFieldInputStyleSmall } from "../systemTools/systemToolsSharedUi";

export {
  C,
  Btn,
  TH,
  tdStyle,
  CARD_RADIUS,
};

/** Table/list card — matches E1-PRI PCM pages (10px radius) */
const SIP_PCM_TABLE_CARD_RADIUS = 10;

export const sipPcmCardStyle = {
  background: "#ffffff",
  borderRadius: SIP_PCM_TABLE_CARD_RADIUS,
  overflow: "hidden",
  border: `1.5px solid ${C.cardBorder}`,
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
};

export const sipPcmToolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.cardBorder}`,
  background: "#ffffff",
  flexWrap: "wrap",
  gap: 12,
  borderTopLeftRadius: SIP_PCM_TABLE_CARD_RADIUS,
  borderTopRightRadius: SIP_PCM_TABLE_CARD_RADIUS,
};

export const sipPcmPaginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.cardBorder}`,
  borderBottomLeftRadius: SIP_PCM_TABLE_CARD_RADIUS,
  borderBottomRightRadius: SIP_PCM_TABLE_CARD_RADIUS,
  overflow: "hidden",
};

/** MUI checkbox — matches PcmNumReceivingRulePage */
export const sipPcmCheckboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

/** Table pages — full width (SIP To SIP Account, SIP Trunk Group) */
export const sipPcmPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
};

export const sipPcmInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

/** Form pages only — SIP Settings & Media (matches Authorization width) */
export const sipPcmFormPageWrapStyle = {
  ...sipPcmPageWrapStyle,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

export const sipPcmFormPageInnerStyle = {
  width: "100%",
  maxWidth: 1000,
  margin: "0 auto",
};

export const SipPcmBreadcrumb = ({ current }) => (
  <div
    style={{
      fontSize: 12,
      color: C.mutedText,
      marginBottom: 16,
      fontWeight: 400,
      display: "flex",
      alignItems: "center",
      gap: 4,
      flexWrap: "wrap",
    }}
  >
    <span>E1-PRI</span>
    <span>&gt;</span>
    <span>SIP</span>
    <span>&gt;</span>
    <span style={{ color: C.strongText, fontWeight: 600 }}>{current}</span>
  </div>
);

export const sipPcmSelectedBadgeStyle = {
  background: "#eff6ff",
  color: C.accent,
  fontSize: 11,
  fontWeight: 700,
  padding: "5px 12px",
  borderRadius: 999,
  border: `1px solid ${C.accent}`,
};

export const sipPcmCancelBtnStyle = {
  height: 30,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

export const sipPcmPrimaryBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
};

/** Form settings card — matches PcmReceptionTimeoutPage */
export const sipPcmFormCardStyle = {
  background: "#ffffff",
  borderRadius: 10,
  overflow: "hidden",
  border: `1.5px solid ${C.cardBorder}`,
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
};

export const sipPcmFormHeaderStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: CARD_RADIUS,
  borderTopRightRadius: CARD_RADIUS,
  display: "flex",
  alignItems: "center",
  padding: "7px 14px",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  borderBottom: `1px solid ${C.cardBorder}`,
};

export const SIP_PCM_AUTH_FIELD_WIDTH = 200;

/** Authorization-style centered form body */
export const SIP_PCM_AUTH_FORM_BODY_CLASS =
  "w-full px-5 pt-3 pb-0 flex flex-col items-center";

/** Narrow control column + wider label-to-field gap (56px) */
export const SIP_PCM_AUTH_FORM_GRID_CLASS =
  `w-full max-w-2xl grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_${SIP_PCM_AUTH_FIELD_WIDTH}px] gap-x-14 gap-y-4 items-center`;

export const sipPcmAuthLabelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: C.labelText,
  textAlign: "left",
};

export const sipPcmAuthControlWrapStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  minWidth: 0,
  width: SIP_PCM_AUTH_FIELD_WIDTH,
  maxWidth: SIP_PCM_AUTH_FIELD_WIDTH,
};

/** Text / number inputs — same size as Certificate Management fill boxes */
export const sipPcmAuthInputStyle = {
  ...systemToolsFieldInputStyleSmall,
  width: SIP_PCM_AUTH_FIELD_WIDTH,
  maxWidth: SIP_PCM_AUTH_FIELD_WIDTH,
  textAlign: "left",
};

/** Hover / focus — same as Certificate Management (`inputInteraction`) */
export const sipPcmAuthInputInteraction = {
  onFocus: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onFocus(e);
  },
  onBlur: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onBlur(e);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onMouseEnter(e);
  },
  onMouseLeave: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onMouseLeave(e);
  },
};

/** MUI Select — Certificate Manage colors + same padding height as native inputs */
export const sipPcmAuthMuiSelectSx = {
  ...muiSelectSx,
  fontSize: 12,
  width: SIP_PCM_AUTH_FIELD_WIDTH,
  maxWidth: SIP_PCM_AUTH_FIELD_WIDTH,
  backgroundColor: "#f8fafc",
  borderRadius: "6px",
  "& .MuiOutlinedInput-root": {
    minHeight: "unset",
    height: "auto",
    backgroundColor: "#f8fafc",
    transition: "border-color 0.2s ease",
    "& fieldset": {
      borderColor: OUTLINED_BORDER,
      transition: "border-color 0.2s ease",
    },
    "&:hover fieldset": {
      borderColor: OUTLINED_HOVER,
    },
    "&.Mui-focused fieldset": {
      borderColor: OUTLINED_FOCUS,
      borderWidth: 2,
    },
    "&.Mui-focused:hover fieldset": {
      borderColor: OUTLINED_FOCUS,
      borderWidth: 2,
    },
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: 2,
  },
  "& .MuiSelect-select": {
    padding: "6px 32px 6px 12px !important",
    fontSize: 12,
    lineHeight: 1.35,
    textAlign: "left",
    display: "flex",
    alignItems: "center",
    boxSizing: "border-box",
  },
};

/** Form pages only — matches Authorization footer button bar */
export const sipPcmAuthFormFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "100%",
  padding: "10px 20px",
  borderTop: `1px solid ${C.cardBorder}`,
  boxSizing: "border-box",
};

export const sipPcmAuthFormBtnStyle = {
  minWidth: 110,
  height: 34,
  fontSize: 13,
  margin: 0,
  padding: "0 28px",
  lineHeight: "34px",
  boxSizing: "border-box",
};

/** Full-width section divider — spans card, not the narrow field grid */
export const sipPcmAuthSectionFullWidthStyle = {
  width: "100%",
  margin: "16px 0 20px",
  boxSizing: "border-box",
};

export const SipPcmSectionHeading = ({ title, isFirst = false }) => (
  <div
    style={{
      margin: isFirst ? "0 0 20px 0" : "0",
      position: "relative",
      width: "100%",
    }}
  >
    <div style={{ borderTop: `1px solid ${C.cardBorder}` }} />
    <span
      style={{
        position: "absolute",
        top: -10,
        left: 0,
        background: "#fff",
        paddingRight: 8,
        fontSize: 13,
        fontWeight: 600,
        color: C.mutedText,
      }}
    >
      {title}
    </span>
  </div>
);

export const sipPcmFieldRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 36,
};

export const sipPcmFieldLabelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: C.labelText,
  width: 320,
  marginRight: 10,
  lineHeight: 1.4,
  textAlign: "left",
  flexShrink: 0,
};

export const sipPcmNativeInputStyle = {
  width: 200,
  height: 32,
  padding: "4px 10px",
  fontSize: 13,
  borderRadius: 8,
  border: `1px solid ${C.cardBorder}`,
  outline: "none",
  background: "#fff",
  color: C.valueText,
  boxSizing: "border-box",
};

export const sipPcmNativeCheckboxStyle = {
  width: 16,
  height: 16,
  accentColor: "#0284c7",
  cursor: "pointer",
};

export const sipPcmMuiSelectSx = {
  fontSize: 13,
  height: 32,
  backgroundColor: "#ffffff",
  "& .MuiOutlinedInput-root": {
    height: 32,
    backgroundColor: "#ffffff",
    "& fieldset": {
      borderColor: C.cardBorder,
    },
    "&:hover fieldset": {
      borderColor: "#64748b",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#0284c7",
      borderWidth: 1,
    },
  },
  "& .MuiSelect-select": {
    padding: "4px 10px",
    lineHeight: "22px",
    fontSize: 13,
    display: "flex",
    alignItems: "center",
  },
};

export const sipPcmNoteStyle = {
  color: C.amber,
  textAlign: "center",
  marginTop: 24,
  fontSize: 13,
  lineHeight: 1.45,
};

export const sipPcmPageBadgeStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: C.accent,
  background: "#e0f2fe",
  padding: "5px 14px",
  borderRadius: 6,
  border: `1px solid ${C.cardBorder}`,
};

/** PCM table footer — Prev / Page X of Y / Next only */
export const SipPcmPagination = ({
  page,
  totalPages,
  recordCount,
  onPageChange,
  recordLabel = "record",
}) => (
  <div style={sipPcmPaginationStyle}>
    <span style={{ fontSize: 11, color: C.mutedText }}>
      Showing {recordCount} {recordLabel}
      {recordCount !== 1 ? "s" : ""} on page {page}
    </span>
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Btn
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        variant="outline"
      >
        ← Prev
      </Btn>
      <span style={sipPcmPageBadgeStyle}>
        Page {page} of {totalPages}
      </span>
      <Btn
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        variant="outline"
      >
        Next →
      </Btn>
    </div>
  </div>
);
