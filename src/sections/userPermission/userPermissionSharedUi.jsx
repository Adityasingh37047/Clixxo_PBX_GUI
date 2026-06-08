/**
 * User Permission — fill-box borders match PBX Extension Group › Group Name.
 */
import { C } from "../numManipulate/numManipulateSharedUi";
import {
  OUTLINED_BORDER,
  OUTLINED_HOVER,
  OUTLINED_FOCUS,
  muiTextFieldSx,
  nativeFieldInteraction,
} from "../shared/outlinedFieldUi";

export { C, OUTLINED_BORDER, OUTLINED_HOVER, OUTLINED_FOCUS, muiTextFieldSx };

/** Account Manage modal inputs / selects */
export const userPermissionModalInputStyle = {
  width: "min(100%, 320px)",
  fontSize: 13,
  height: 32,
  padding: "0 8px",
  boxSizing: "border-box",
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 4,
  outline: "none",
  color: "#1e293b",
  background: "#ffffff",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

export const userPermissionModalSelectStyle = {
  ...userPermissionModalInputStyle,
  appearance: "auto",
};

/** User Manage page form fields */
export const userPermissionFieldInputStyle = {
  height: 30,
  padding: "0 10px",
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 6,
  fontSize: 13,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
  color: "#0f172a",
  background: "#ffffff",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

/** Change Password MUI TextField — 36px, centered text */
export const userPermissionMuiTextFieldSx = {
  ...muiTextFieldSx,
  width: "100%",
  "& .MuiOutlinedInput-root": {
    ...muiTextFieldSx["& .MuiOutlinedInput-root"],
    height: 36,
    fontSize: 13,
    backgroundColor: "#fff",
  },
  "& .MuiInputBase-input": {
    fontSize: 13,
    padding: "6px 10px",
    textAlign: "center",
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

/** MUI TextField sx with optional error / disabled / read-only username styling */
export const getUserPermissionMuiTextFieldSx = ({
  hasError = false,
  disabled = false,
  readOnlyLook = false,
} = {}) => {
  const errorColor = "#dc2626";
  const borderDefault = hasError ? errorColor : OUTLINED_BORDER;
  const borderHover =
    disabled || readOnlyLook
      ? borderDefault
      : hasError
        ? errorColor
        : OUTLINED_HOVER;
  const borderFocus = hasError ? errorColor : OUTLINED_FOCUS;

  return {
    ...userPermissionMuiTextFieldSx,
    "& .MuiOutlinedInput-root": {
      ...userPermissionMuiTextFieldSx["& .MuiOutlinedInput-root"],
      backgroundColor: readOnlyLook ? "#f1f5f9" : "#fff",
      transition: "border-color 0.2s ease",
      "& fieldset": {
        borderColor: borderDefault,
        transition: "border-color 0.2s ease",
      },
      "&:hover fieldset": {
        borderColor: borderHover,
      },
      "&.Mui-focused fieldset": {
        borderColor: borderFocus,
        borderWidth: 2,
      },
      "&.Mui-disabled fieldset": {
        borderColor: OUTLINED_BORDER,
      },
    },
    "& .MuiInputBase-input.Mui-disabled": readOnlyLook
      ? {
          color: "#94a3b8",
          WebkitTextFillColor: "#94a3b8",
        }
      : {},
  };
};
