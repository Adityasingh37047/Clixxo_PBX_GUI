import React from "react";
import { Checkbox } from "@mui/material";
import {
  C,
  CARD_RADIUS,
  Btn,
  TH,
  tdStyle,
  checkboxSx,
  muiSelectSx,
  muiTextFieldSx,
  numManipulateCardStyle,
  numManipulateToolbarStyle,
  numManipulatePaginationStyle,
  routeTableMinWidthForZoom,
  getBrowserZoomPercent,
} from "../fxs/fxsSharedUi";

export {
  C,
  CARD_RADIUS,
  Btn,
  TH,
  tdStyle,
  checkboxSx,
  muiSelectSx,
  muiTextFieldSx,
  numManipulateCardStyle,
  numManipulateToolbarStyle,
  numManipulatePaginationStyle,
  routeTableMinWidthForZoom,
  getBrowserZoomPercent,
};

export const routeTdStyle = {
  ...tdStyle,
  fontSize: 12,
  padding: "7px 8px",
};

export const routeThExtra = {
  fontSize: 10.5,
  padding: "9px 8px",
  letterSpacing: "0.04em",
};

/** Page shell — matches Maintenance › System Tool pages */
export const advancedPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  boxSizing: "border-box",
};

export const advancedPageInnerStyle = {
  width: "100%",
  maxWidth: 1000,
  margin: "0 auto",
};

/** Main card — border radius 10, slate border (System Tools) */
export const advancedTableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
  background: C.cardBg,
  border: `1.5px solid ${C.cardBorder}`,
  borderRadius: CARD_RADIUS,
  boxShadow: "0 4px 20px rgba(15,23,42,0.06)",
  overflow: "hidden",
  marginBottom: 24,
};

/** Card header bar */
export const advancedBlueBarStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: CARD_RADIUS,
  borderTopRightRadius: CARD_RADIUS,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  padding: "7px 14px",
  flexWrap: "wrap",
  gap: 12,
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  borderBottom: `1px solid ${C.cardBorder}`,
};

export const advancedFormBodyStyle = {
  padding: "12px 20px 0",
};

export const advancedFormPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: C.pageBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 8,
  padding: 20,
};

export const advancedFormActionsStyle = {
  display: "flex",
  justifyContent: "center",
  gap: 12,
  padding: "16px 24px",
  borderTop: `1px solid ${C.cardBorder}`,
  background: C.cardBg,
};

/** Inline footer inside AdvancedFormCard body — border spans full card width */
export const advancedFormInlineFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "calc(100% + 40px)",
  marginLeft: -20,
  marginRight: -20,
  marginTop: 0,
  marginBottom: 0,
  padding: "10px 20px 10px",
  borderTop: `1px solid ${C.cardBorder}`,
  boxSizing: "border-box",
};

export const advancedFormBtnStyle = {
  minWidth: 110,
  height: 34,
  fontSize: 13,
  margin: 0,
  padding: "0 28px",
  lineHeight: "34px",
  boxSizing: "border-box",
};

export const advancedToolbarBtnStyle = { height: 30 };

export const advancedModalPaperSx = {
  width: 500,
  maxWidth: "95vw",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

export const advancedModalTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
};

export const advancedModalContentStyle = {
  padding: "20px 24px",
  backgroundColor: C.pageBg,
};

export const advancedModalFooterStyle = {
  padding: "16px 24px",
  background: C.pageBg,
  borderTop: `1px solid ${C.cardBorder}`,
  justifyContent: "center",
  gap: 12,
};

export const advancedPaginationBarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: C.cardBg,
  borderTop: `1px solid ${C.cardBorder}`,
  borderBottomLeftRadius: CARD_RADIUS,
  borderBottomRightRadius: CARD_RADIUS,
  flexWrap: "wrap",
  gap: 8,
};

export const advancedTableScrollStyle = {
  overflowX: "auto",
  overflowY: "auto",
  width: "100%",
  boxSizing: "border-box",
};

/** Native text input / select — same size and hover/focus as System Tools */
export const nativeFieldInputStyle = {
  height: 28,
  width: 200,
  padding: "0 8px",
  fontSize: 13,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 4,
  outline: "none",
  backgroundColor: "#fff",
  color: C.valueText,
  boxSizing: "border-box",
  transition: "border-color 0.2s ease",
};

export const nativeFieldSelectStyle = {
  ...nativeFieldInputStyle,
};

export const nativeFieldInteraction = {
  onFocus: (e) => {
    e.target.style.borderColor = "#0284c7";
  },
  onBlur: (e) => {
    e.target.style.borderColor = C.cardBorder;
  },
  onMouseEnter: (e) => {
    if (document.activeElement !== e.target) {
      e.target.style.borderColor = "#64748b";
    }
  },
  onMouseLeave: (e) => {
    if (document.activeElement !== e.target) {
      e.target.style.borderColor = C.cardBorder;
    }
  },
};

export const AdvancedBreadcrumb = ({ current }) => (
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
    <span>FXS</span>
    <span>&gt;</span>
    <span>Advanced</span>
    <span>&gt;</span>
    <span style={{ color: C.strongText, fontWeight: 600 }}>{current}</span>
  </div>
);

export const PortBreadcrumb = ({ segments = [], current }) => (
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
    {segments.map((seg) => (
      <React.Fragment key={seg}>
        <span>{seg}</span>
        <span>&gt;</span>
      </React.Fragment>
    ))}
    <span style={{ color: C.strongText, fontWeight: 600 }}>{current}</span>
  </div>
);

export const AdvancedPageShell = ({ children, fullWidth = false }) => (
  <div style={advancedPageWrapStyle}>
    <div
      style={{
        ...advancedPageInnerStyle,
        maxWidth: fullWidth ? "100%" : advancedPageInnerStyle.maxWidth,
      }}
    >
      {children}
    </div>
  </div>
);

export const wavFileNoteStyle = {
  fontSize: 12,
  color: C.mutedText,
  margin: 0,
  lineHeight: 1.45,
  whiteSpace: "normal",
  overflowWrap: "break-word",
  textAlign: "center",
  width: "100%",
};

export const AdvancedFormCard = ({
  title,
  children,
  footer,
  fullWidthContent = false,
}) => (
  <div style={advancedTableContainerStyle}>
    <div style={advancedBlueBarStyle}>
      <span>{title}</span>
    </div>
    <div
      style={{
        ...advancedFormBodyStyle,
        paddingBottom: footer ? 0 : 12,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          maxWidth: fullWidthContent ? "100%" : 560,
          width: fullWidthContent ? "100%" : undefined,
          margin: fullWidthContent ? 0 : "0 auto",
        }}
      >
        {children}
      </div>
      {footer ? (
        <div style={advancedFormInlineFooterStyle}>{footer}</div>
      ) : null}
    </div>
  </div>
);

export const AdvancedTableCard = ({
  title,
  toolbar,
  children,
  footer,
  style,
}) => (
  <div style={{ ...advancedTableContainerStyle, marginBottom: 0, ...style }}>
    {title ? (
      <div style={advancedBlueBarStyle}>
        <span>{title}</span>
      </div>
    ) : null}
    {toolbar}
    {children}
    {footer}
  </div>
);

export const FieldRow = ({
  label,
  children,
  required,
  align = "center",
  labelWidth = 170,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: align,
      justifyContent: "center",
      gap: 12,
      minHeight: align === "flex-start" ? undefined : 32,
    }}
  >
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: labelWidth,
        flexShrink: 0,
        textAlign: "left",
        paddingTop: align === "flex-start" ? 8 : 0,
      }}
    >
      {label}
      {required && <span style={{ color: "#dc2626" }}> *</span>}
    </label>
    <div style={{ width: "min(100%, 320px)" }}>{children}</div>
  </div>
);

/** Section divider heading — matches System Settings › Management */
export const SectionHeading = ({ title, isFirst = false }) => (
  <div
    style={{
      margin: isFirst ? "0 0 24px 0" : "16px 0 24px 0",
      position: "relative",
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
        color: C.mutedText,
      }}
    >
      {title}
    </span>
  </div>
);

/** Inline Enable checkbox for form tables (FXS, DTMF, etc.) */
export const FormEnableCheckbox = ({
  checked,
  onChange,
  name,
  label = "Enable",
  id,
}) => (
  <label
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      cursor: "pointer",
    }}
  >
    <Checkbox
      id={id || name}
      name={name}
      size="small"
      checked={!!checked}
      onChange={onChange}
      sx={checkboxSx}
    />
    <span style={{ fontSize: 13, color: C.valueText }}>{label}</span>
  </label>
);

export const AdvancedCheckboxRow = ({ label, checked, onChange, id }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      minHeight: 32,
    }}
  >
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: 170,
        flexShrink: 0,
      }}
    >
      {label}
    </label>
    <FormEnableCheckbox
      id={id}
      checked={checked}
      onChange={onChange}
      label="Enable"
    />
  </div>
);
