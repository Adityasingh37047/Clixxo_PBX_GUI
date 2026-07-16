import {
  EXTENSION_TABLE_CARD_RADIUS as CARD_RADIUS,
  extensionPageWrapStyle as accountManagePageWrapStyle,
  extensionPageInnerStyle as accountManagePageInnerStyle,
  extensionCardStyle as accountManageCardStyle,
  extensionToolbarStyle as accountManageToolbarStyle,
  extensionFixedAlertSx as accountManageFixedAlertSx,
  extensionSelectedBadgeStyle as accountManageSelectedBadgeStyle,
  TH as AccountManageTH,
  tdStyle as accountManageTdBase,
} from "../../../../components/common";
import {
  C,
  OUTLINED_BORDER,
  OUTLINED_HOVER,
  OUTLINED_FOCUS,
  FOCUS_RING_SHADOW,
} from "../../../../theme/pbxTokens";

export const accountManageTableContainerStyle = {
  ...accountManageCardStyle,
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
  boxShadow:
    "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
  overflow: "hidden",
  boxSizing: "border-box",
};

export const accountManageBlueBarStyle = {
  ...accountManageToolbarStyle,
  width: "100%",
  borderTopLeftRadius: CARD_RADIUS,
  borderTopRightRadius: CARD_RADIUS,
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
};

export const accountManageLoadingBannerStyle = {
  background: "#eff6ff",
  color: "#1d4ed8",
  padding: "16px",
  marginBottom: "16px",
  borderRadius: "8px",
  border: "1px solid #bfdbfe",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "16px",
};

export const accountManageFooterStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.cardBorder}`,
  borderBottomLeftRadius: CARD_RADIUS,
  borderBottomRightRadius: CARD_RADIUS,
};

export const accountManageCheckboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const setFieldDefault = (el) => {
  el.style.borderColor = OUTLINED_BORDER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const setFieldHover = (el) => {
  el.style.borderColor = OUTLINED_HOVER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const setFieldFocus = (el) => {
  el.style.borderColor = OUTLINED_FOCUS;
  el.style.borderWidth = "1px";
  el.style.boxShadow = FOCUS_RING_SHADOW;
};

export const accountManageInputInteraction = {
  onFocus: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    setFieldFocus(e.target);
  },
  onBlur: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    setFieldDefault(e.target);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldHover(e.target);
    }
  },
  onMouseLeave: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldDefault(e.target);
    }
  },
};

export const accountManageTdStyle = {
  ...accountManageTdBase,
  background: "#ffffff",
  borderBottom: `1px solid ${C.cardBorder}`,
  borderRight: `1px solid ${C.cardBorder}`,
};

export const accountManageModalOverlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.5)",
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export const accountManageModalStyle = {
  background: "#ffffff",
  border: "none",
  borderRadius: 4,
  width: 500,
  maxWidth: "95vw",
  maxHeight: "calc(100vh - 120px)",
  overflowY: "auto",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
  display: "flex",
  flexDirection: "column",
};

export const accountManageModalHeaderStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
  borderTopLeftRadius: 4,
  borderTopRightRadius: 4,
  borderBottom: `1px solid ${C.divider}`,
};

export const accountManageModalBodyStyle = {
  padding: "24px",
  display: "flex",
  flexDirection: "column",
  gap: 14,
  backgroundColor: "#ffffff",
};

export const accountManageModalRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
  marginBottom: 0,
  gap: 12,
};

export const accountManageModalLabelStyle = {
  width: 170,
  fontSize: 13,
  fontWeight: 600,
  color: C.labelText,
  textAlign: "left",
  marginRight: 0,
  whiteSpace: "nowrap",
};

export const accountManageModalFooterStyle = {
  display: "flex",
  justifyContent: "center",
  gap: 12,
  padding: "10px 16px",
  background: "#f8fafc",
  borderTop: `1px solid ${C.cardBorder}`,
  borderBottomLeftRadius: 4,
  borderBottomRightRadius: 4,
};

export const accountManageModalFormPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 4,
  padding: 20,
};

export const accountManageModalInputStyle = {
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

export const accountManageTooltipProps = {
  arrow: true,
  placement: "top",
  slotProps: {
    tooltip: {
      sx: {
        bgcolor: "#fff",
        color: "#334155",
        border: "1px solid #d1d5db",
        fontSize: 12,
        maxWidth: 500,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      },
    },
    arrow: {
      sx: {
        color: "#fff",
      },
    },
  },
};

export const accountManageDisabledFieldStyle = {
  backgroundColor: "#f1f5f9",
  color: "#94a3b8",
  cursor: "not-allowed",
};

export {
  CARD_RADIUS,
  accountManagePageWrapStyle,
  accountManagePageInnerStyle,
  accountManageFixedAlertSx,
  accountManageSelectedBadgeStyle,
  AccountManageTH,
};
