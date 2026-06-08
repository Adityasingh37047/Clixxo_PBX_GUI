/**
 * Maintenance › System Tools — fill-box borders match PBX Extension Group › Group Name.
 */
import { C } from "../numManipulate/numManipulateSharedUi";
import {
  OUTLINED_BORDER,
  OUTLINED_HOVER,
  OUTLINED_FOCUS,
  muiTextFieldSx,
  muiSelectSx,
  modalTextFieldSx,
  modalSelectSx,
  nativeFieldInteraction,
  getNativeFieldInteraction,
} from "../shared/outlinedFieldUi";

export {
  C,
  OUTLINED_BORDER,
  OUTLINED_HOVER,
  OUTLINED_FOCUS,
  muiTextFieldSx,
  muiSelectSx,
  modalTextFieldSx,
  modalSelectSx,
  getNativeFieldInteraction,
};

/** Standard form text input (14px — DDOSS, IDS, Radius, SIP Account Generator, etc.) */
export const systemToolsFieldInputStyle = {
  padding: "6px 12px",
  borderRadius: 6,
  border: `1px solid ${OUTLINED_BORDER}`,
  fontSize: 14,
  width: "100%",
  backgroundColor: "#f8fafc",
  outline: "none",
  color: "#3E5475",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
  boxShadow: "none",
};

/** 12px inputs — Authorization, Certificate Manage (do not change shared 14px kit) */
export const systemToolsFieldInputStyleSmall = {
  ...systemToolsFieldInputStyle,
  fontSize: 12,
};

/** Smaller threshold / number fields */
export const systemToolsFieldInputStyleCompact = {
  ...systemToolsFieldInputStyle,
  padding: "4px 10px",
};

/** White-background variant (SignalingCapture, Licence) */
export const systemToolsFieldInputStyleWhite = {
  ...systemToolsFieldInputStyle,
  backgroundColor: "#ffffff",
  borderRadius: 8,
  color: "#3E5475",
};

/** Native select — same height as sibling text inputs on the page */
export const systemToolsFieldSelectStyle = {
  ...systemToolsFieldInputStyle,
  appearance: "auto",
};

export const systemToolsFieldSelectStyleWhite = {
  ...systemToolsFieldInputStyleWhite,
  appearance: "auto",
};

/** Modal / dialog native inputs */
export const systemToolsModalInputStyle = {
  fontSize: 13,
  padding: "0 8px",
  borderRadius: 4,
  border: `1px solid ${OUTLINED_BORDER}`,
  background: "#ffffff",
  color: "#1e293b",
  outline: "none",
  width: "100%",
  height: 32,
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

/** Legacy table-layout pages (TR069, DNS Test, System Monitor) */
export const systemToolsLegacyFieldStyle = {
  fontSize: 13,
  backgroundColor: "#ffffff",
  border: `1px solid ${OUTLINED_BORDER}`,
  padding: "3px 6px",
  width: 200,
  height: 28,
  outline: "none",
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

export const systemToolsLegacySelectStyle = {
  ...systemToolsLegacyFieldStyle,
  width: 155,
  appearance: "auto",
};

/** MUI TextField — 32px height (Device Lock passwords) */
export const systemToolsMuiTextFieldSx = {
  ...muiTextFieldSx,
  "& .MuiOutlinedInput-root": {
    ...muiTextFieldSx["& .MuiOutlinedInput-root"],
    height: 32,
    fontSize: 13,
    backgroundColor: "#fff",
  },
  "& .MuiInputBase-input": {
    fontSize: 13,
    padding: "4px 10px",
  },
};

/** MUI Select on form pages (#f8fafc background) */
export const systemToolsMuiSelectSx = {
  ...muiSelectSx,
  backgroundColor: "#f8fafc",
  borderRadius: "6px",
  fontSize: 14,
};

/** Change Password fill-box backgrounds — IDS, DDOS, Certificate, Radius, etc. */
export const SYSTEM_TOOLS_FILL_BG_EDITABLE = "#ffffff";
export const SYSTEM_TOOLS_FILL_BG_READ_ONLY = "#f1f5f9";

export const systemToolsEditableFieldInputStyle = {
  ...systemToolsFieldInputStyle,
  backgroundColor: SYSTEM_TOOLS_FILL_BG_EDITABLE,
};

export const systemToolsEditableFieldInputStyleSmall = {
  ...systemToolsFieldInputStyleSmall,
  backgroundColor: SYSTEM_TOOLS_FILL_BG_EDITABLE,
};

export const systemToolsEditableFieldInputStyleCompact = {
  ...systemToolsFieldInputStyleCompact,
  backgroundColor: SYSTEM_TOOLS_FILL_BG_EDITABLE,
};

export const systemToolsEditableFieldSelectStyle = {
  ...systemToolsFieldSelectStyle,
  backgroundColor: SYSTEM_TOOLS_FILL_BG_EDITABLE,
};

export const systemToolsReadOnlyFieldInputStyle = {
  ...systemToolsFieldInputStyleSmall,
  backgroundColor: SYSTEM_TOOLS_FILL_BG_READ_ONLY,
};

export const systemToolsReadOnlyFieldTextAreaStyle = {
  fontSize: 13,
  padding: "12px",
  backgroundColor: SYSTEM_TOOLS_FILL_BG_READ_ONLY,
  border: `1px solid ${OUTLINED_BORDER}`,
  color: "#3E5475",
  outline: "none",
  fontFamily: "monospace",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
  boxShadow: "none",
  borderRadius: 6,
  width: "100%",
};

/** MUI Select — white background (Radius, etc.) */
export const systemToolsEditableMuiSelectSx = {
  ...muiSelectSx,
  backgroundColor: SYSTEM_TOOLS_FILL_BG_EDITABLE,
  borderRadius: "6px",
  fontSize: 14,
  "& .MuiOutlinedInput-root": {
    minHeight: 36,
    backgroundColor: SYSTEM_TOOLS_FILL_BG_EDITABLE,
  },
};

export const inputInteraction = {
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

/** Validation error — keeps red border; hover/focus use standard when no error */
export const getSystemToolsInputInteraction = (hasError, errorColor = "#dc2626") => {
  if (!hasError) return inputInteraction;
  const ring = (el, focused) => {
    el.style.borderColor = errorColor;
    el.style.borderWidth = "1px";
    el.style.boxShadow = focused ? `0 0 0 1px ${errorColor}` : "none";
  };
  return {
    onFocus: (e) => ring(e.target, true),
    onBlur: (e) => ring(e.target, false),
    onMouseEnter: (e) => ring(e.target, document.activeElement === e.target),
    onMouseLeave: (e) => ring(e.target, document.activeElement === e.target),
  };
};
