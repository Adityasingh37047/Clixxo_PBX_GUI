import {
  SYSTEM_TOOLS_VPN_PAGE_BREADCRUMB_ROOT,
  SYSTEM_TOOLS_VPN_PAGE_BREADCRUMB_SECTION,
  SYSTEM_TOOLS_VPN_PAGE_TITLE,
} from "../../../../constants/SystemToolsVPNConstants";
import {
  C,
  FOCUS_RING_SHADOW,
  OUTLINED_BORDER,
  OUTLINED_FOCUS,
  OUTLINED_HOVER,
} from "../../../../theme/pbxTokens";
import {
  CARD_RADIUS,
  FIELD_RADIUS,
  vpnPageWrapStyle,
  vpnPageInnerStyle as vpnPageInnerStyleBase,
  vpnCardStyle,
  vpnToolbarStyle as vpnToolbarStyleFromCommon,
  vpnFixedAlertSx as vpnFixedAlertSxFromCommon,
  vpnFormBtnStyle,
} from "./SystemToolsVPNTableHelpers";
import { ExtensionBreadcrumb } from "../../../../components/common";

/** Keep VPN content stacking; wrap/padding come from common. */
const vpnPageInnerStyle = {
  ...vpnPageInnerStyleBase,
  margin: 0,
  display: "flex",
  flexDirection: "column",
};

export const SYSTEM_TOOLS_VPN_SCROLL_CLASS = "system-tools-vpn-scroll";

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

const nativeFieldInputStyle = {
  height: 32,
  width: 200,
  padding: "0 10px",
  fontSize: 13,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: FIELD_RADIUS,
  outline: "none",
  backgroundColor: "#fff",
  color: C.valueText,
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

export const inputInteraction = {
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

const { height: _nativeHeight, ...nativeFieldBase } = nativeFieldInputStyle;

const systemFieldInputStyle = {
  ...nativeFieldBase,
  width: "100%",
  padding: "0 10px",
  borderRadius: FIELD_RADIUS,
  background: "#fff",
  lineHeight: 1.35,
  minHeight: 32,
  height: 32,
};

const systemFieldSelectStyle = {
  ...systemFieldInputStyle,
  appearance: "auto",
  minHeight: 36,
  height: 36,
  paddingTop: 7,
  paddingBottom: 7,
  lineHeight: 1.35,
  cursor: "pointer",
};

export const inputStyle = systemFieldInputStyle;
export const selectStyle = systemFieldSelectStyle;

export const vpnTableContainerStyle = {
  ...vpnCardStyle,
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
  boxSizing: "border-box",
};

export const vpnToolbarStyle = vpnToolbarStyleFromCommon;

export const vpnContentStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  minWidth: 0,
  padding: "16px 36px 24px",
  background: C.cardBg,
};

export const vpnFixedAlertSx = vpnFixedAlertSxFromCommon;

export const vpnToolbarBtnStyle = {
  ...vpnFormBtnStyle,
  minWidth: undefined,
};

export const vpnSaveBtnStyle = vpnFormBtnStyle;

export const vpnLogTextareaStyle = {
  width: "100%",
  height: 200,
  fontSize: 12,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  backgroundColor: "#f8fafc",
  color: C.valueText,
  padding: "10px 12px",
  borderRadius: CARD_RADIUS,
  border: `1px solid ${C.cardBorder}`,
  outline: "none",
  resize: "vertical",
  lineHeight: 1.6,
  boxSizing: "border-box",
};

const vpnChooseFileLabelStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: 30,
  padding: "6px 14px",
  background: "#cbd5e1",
  border: "1px solid #cbd5e1",
  borderRadius: 4,
  fontSize: 12,
  fontWeight: 600,
  color: "#374151",
  whiteSpace: "nowrap",
  flexShrink: 0,
  cursor: "pointer",
  userSelect: "none",
  boxShadow: "0 1px 2px rgba(15,23,42,0.08)",
  boxSizing: "border-box",
  transition:
    "background 0.15s ease, transform 0.1s ease, box-shadow 0.1s ease",
};

export const vpnUploadLabelStyle = {
  ...vpnChooseFileLabelStyle,
  background: "#fff",
  border: `1px solid ${C.cardBorder}`,
  color: C.valueText,
  boxShadow: "none",
};

const VpnScrollbarStyles = () => (
  <style>{`
    .${SYSTEM_TOOLS_VPN_SCROLL_CLASS} {
      scroll-behavior: smooth;
      scrollbar-gutter: stable;
      scrollbar-width: thin;
      scrollbar-color: rgba(100, 116, 139, 0.45) transparent;
    }
    .${SYSTEM_TOOLS_VPN_SCROLL_CLASS}::-webkit-scrollbar {
      width: 8px;
      height: 8px;
      transition: width 0.2s ease, height 0.2s ease;
    }
    .${SYSTEM_TOOLS_VPN_SCROLL_CLASS}::-webkit-scrollbar:hover {
      width: 11px;
      height: 11px;
    }
    .${SYSTEM_TOOLS_VPN_SCROLL_CLASS}::-webkit-scrollbar-corner {
      background: transparent;
    }
    .${SYSTEM_TOOLS_VPN_SCROLL_CLASS}::-webkit-scrollbar-track {
      background: transparent;
    }
    .${SYSTEM_TOOLS_VPN_SCROLL_CLASS}::-webkit-scrollbar-thumb {
      background-color: rgba(100, 116, 139, 0.45);
      border-radius: 6px;
      border: 2px solid transparent;
      background-clip: padding-box;
      transition: background-color 0.2s ease;
    }
    .${SYSTEM_TOOLS_VPN_SCROLL_CLASS}::-webkit-scrollbar-thumb:hover {
      background-color: rgba(71, 85, 105, 0.65);
    }
  `}</style>
);

export const VpnPageShell = ({ children }) => (
  <>
    <VpnScrollbarStyles />
    <div
      className={SYSTEM_TOOLS_VPN_SCROLL_CLASS}
      style={vpnPageWrapStyle}
      data-native-scroll
    >
      <div style={vpnPageInnerStyle}>{children}</div>
    </div>
  </>
);

export const VpnBreadcrumb = () => (
  <ExtensionBreadcrumb
    root={SYSTEM_TOOLS_VPN_PAGE_BREADCRUMB_ROOT}
    section={SYSTEM_TOOLS_VPN_PAGE_BREADCRUMB_SECTION}
    current={SYSTEM_TOOLS_VPN_PAGE_TITLE}
  />
);


export const disabledInputStyle = {
  ...inputStyle,
  background: "#f1f5f9",
  color: "#94a3b8",
  cursor: "not-allowed",
  borderColor: "#e2e8f0",
};


export const ROW = ({ label, children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
    <label style={{ fontSize: 13, fontWeight: 600, color: C.labelText, width: "100%", maxWidth: 220, flexShrink: 0 }}>
      {label}
    </label>
    <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
  </div>
);

export const SeInput = ({ field, type = "text", seForm, handleSeChange, isProfileCreated }) => (
  <input
    type={type}
    value={seForm[field]}
    onChange={handleSeChange(field)}
    disabled={isProfileCreated}
    style={{ ...(isProfileCreated ? disabledInputStyle : inputStyle), flex: 1, minWidth: 0, width: "100%" }}
    onFocus={!isProfileCreated ? inputInteraction.onFocus : undefined}
    onBlur={!isProfileCreated ? inputInteraction.onBlur : undefined}
    onMouseEnter={!isProfileCreated ? inputInteraction.onMouseEnter : undefined}
    onMouseLeave={!isProfileCreated ? inputInteraction.onMouseLeave : undefined}
  />
);

export const getSeRowLabelStyle = (isProfileCreated) => ({
  fontSize: 12,
  fontWeight: 600,
  color: C.labelText,
  minWidth: 130,
  flexShrink: 0,
  opacity: isProfileCreated ? 0.6 : 1,
});
