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
  TableListLoading,
  TableListEmptyState,
  PbxBreadcrumb,
  pbxBreadcrumbStyle,
  pbxPageWrapStyle,
  pbxPageInnerStyle,
} from "./numManipulateSharedUi";
import {
  OUTLINED_BORDER,
  OUTLINED_HOVER,
  OUTLINED_FOCUS,
  muiSelectSx,
  nativeFieldInteraction,
} from "./outlinedFieldUi";
import { systemToolsFieldInputStyleSmall } from "./systemToolsSharedUi";

export { C, Btn, TH, tdStyle, CARD_RADIUS, TableListLoading, TableListEmptyState, PbxBreadcrumb, pbxBreadcrumbStyle, pbxPageWrapStyle, pbxPageInnerStyle };

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

export const sipPcmPageWrapStyle = pbxPageWrapStyle;

export const sipPcmInnerStyle = pbxPageInnerStyle;

/** Form pages only — SIP Settings & Media (matches Authorization width) */
export const sipPcmFormPageWrapStyle = {
  ...pbxPageWrapStyle,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

export const sipPcmFormPageInnerStyle = {
  ...pbxPageInnerStyle,
  maxWidth: 1000,
};

export const SipPcmBreadcrumb = ({ current }) => (
  <PbxBreadcrumb section="SIP" current={current} />
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
/** Matches DTMF Transmit Mode select — all SIP form fill boxes use this height */
export const SIP_PCM_FORM_FIELD_HEIGHT = 32;

/** Form body — original label-left / field-right rows */
export const SIP_PCM_FORM_BODY_CLASS = "w-full px-5 pt-3 pb-0";

export const SIP_PCM_FORM_FIELDS_WRAPPER_CLASS = "flex-1 py-4 px-16";

export const SIP_PCM_FORM_STACK_CLASS = "space-y-4";

export const SIP_PCM_FORM_ROW_CLASS = "flex items-center justify-between";

export const sipPcmFormLabelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: C.labelText,
  textAlign: "left",
  width: 320,
  marginRight: 10,
  lineHeight: 1.4,
  flexShrink: 0,
  whiteSpace: "nowrap",
};

export const getSipPcmFormLabelStyle = (fieldKey) => ({
  ...sipPcmFormLabelStyle,
  width: fieldKey === "externalBound" ? 380 : 320,
  whiteSpace: fieldKey === "externalBound" ? "normal" : "nowrap",
});

export const sipPcmFormControlWrapStyle = {
  width: SIP_PCM_AUTH_FIELD_WIDTH,
  maxWidth: SIP_PCM_AUTH_FIELD_WIDTH,
  minHeight: SIP_PCM_FORM_FIELD_HEIGHT,
  flexShrink: 0,
};

const SIP_PCM_FILL_BG_EDITABLE = "#ffffff";
const SIP_PCM_FILL_BG_READ_ONLY = "#f1f5f9";

/** Text / number inputs — same height as DTMF Transmit Mode select */
export const sipPcmAuthInputStyle = {
  ...systemToolsFieldInputStyleSmall,
  width: SIP_PCM_AUTH_FIELD_WIDTH,
  maxWidth: SIP_PCM_AUTH_FIELD_WIDTH,
  height: SIP_PCM_FORM_FIELD_HEIGHT,
  minHeight: SIP_PCM_FORM_FIELD_HEIGHT,
  padding: "0 12px",
  lineHeight: `${SIP_PCM_FORM_FIELD_HEIGHT - 2}px`,
  textAlign: "left",
  backgroundColor: SIP_PCM_FILL_BG_EDITABLE,
};

export const sipPcmAuthReadOnlyInputStyle = {
  ...sipPcmAuthInputStyle,
  backgroundColor: SIP_PCM_FILL_BG_READ_ONLY,
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
  backgroundColor: SIP_PCM_FILL_BG_EDITABLE,
  borderRadius: "6px",
  "& .MuiOutlinedInput-root": {
    height: SIP_PCM_FORM_FIELD_HEIGHT,
    minHeight: SIP_PCM_FORM_FIELD_HEIGHT,
    backgroundColor: SIP_PCM_FILL_BG_EDITABLE,
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
    padding: "0 32px 0 12px !important",
    fontSize: 12,
    lineHeight: `${SIP_PCM_FORM_FIELD_HEIGHT - 2}px`,
    height: "100%",
    minHeight: "unset !important",
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

/** Matches Network page LAN 1 section heading */
export const SipPcmSectionHeading = ({ title, isFirst = false }) => (
  <div
    style={{
      margin: isFirst ? "0 0 24px 0" : "16px 0 24px 0",
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
        background: C.cardBg,
        paddingRight: 8,
        fontSize: 13,
        fontWeight: 600,
        color: "#30415A",
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
  style,
}) => (
  <div style={{ ...sipPcmPaginationStyle, ...style }}>
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
