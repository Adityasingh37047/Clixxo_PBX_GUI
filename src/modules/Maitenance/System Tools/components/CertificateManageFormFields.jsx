import React from "react";
import { Tooltip } from "@mui/material";
import {
  CERTIFICATE_FIELDS,
  CERTIFICATE_BUTTON_CONFIG,
  CERTIFICATE_BUTTON_VARIANTS,
  CERTIFICATE_BUTTON_STYLE,
  CERTIFICATE_CANCEL_BUTTON_STYLE,
  CERTIFICATE_NOTE,
  CERTIFICATE_BREADCRUMB,
  CERTIFICATE_CARD_TITLE,
  CERTIFICATE_TOOLTIPS,
} from "../../../../constants/CertificateManageConstants";
import {
  C,
  OUTLINED_BORDER,
  OUTLINED_HOVER,
  OUTLINED_FOCUS,
  FOCUS_RING_SHADOW,
} from "../../../../theme/pbxTokens";
import { Btn, ExtensionBreadcrumb } from "../../../../components/common";
import {
  certificatePageWrapStyle,
  certificatePageInnerStyle,
  certificateTableContainerStyle,
  certificateHeaderStyle,
  certificateFixedAlertSx,
  FIELD_RADIUS,
} from "./CertificateManageTableHelpers";

export const CERTIFICATE_COMPACT_MQ = "(max-width: 768px)";

export {
  certificateFixedAlertSx,
  certificateTableContainerStyle,
  certificateHeaderStyle,
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

export const certificateFieldInputStyle = {
  padding: "6px 12px",
  borderRadius: FIELD_RADIUS,
  border: `1px solid ${OUTLINED_BORDER}`,
  fontSize: 12,
  width: "100%",
  backgroundColor: "#ffffff",
  outline: "none",
  color: C.labelText,
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
  boxShadow: "none",
  textAlign: "center",
};

const labelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: C.labelText,
  textAlign: "left",
};

const tooltipProps = {
  arrow: true,
  placement: "top",
  slotProps: {
    tooltip: {
      sx: {
        backgroundColor: "#fff",
        color: "#333",
        border: "1px solid #d1d5db",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        fontSize: 12,
        lineHeight: 1.45,
        maxWidth: 500,
        padding: "10px 12px",
      },
    },
    arrow: {
      sx: {
        color: "#fff",
      },
    },
  },
};

export const certificateFormFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "100%",
  marginLeft: 0,
  marginRight: 0,
  marginTop: 0,
  marginBottom: 0,
  padding: "10px 20px 10px",
  borderTop: `1px solid ${C.cardBorder}`,
  boxSizing: "border-box",
};

export const certificateFormBodyStyle = {
  borderBottomLeftRadius: 10,
  borderBottomRightRadius: 10,
};

export const CertificateManagePageShell = ({ children, isCompact }) => (
  <div
    style={{
      ...certificatePageWrapStyle,
      ...(isCompact ? { padding: 8 } : {}),
    }}
    data-native-scroll
  >
    <div style={certificatePageInnerStyle}>{children}</div>
  </div>
);

export const CertificateManageBreadcrumb = () => (
  <ExtensionBreadcrumb
    root={CERTIFICATE_BREADCRUMB[0]}
    section={CERTIFICATE_BREADCRUMB[1]}
    current={CERTIFICATE_BREADCRUMB[2]}
  />
);

export const CertificateFieldLabel = ({ tooltipKey, children }) => {
  const tooltip = CERTIFICATE_TOOLTIPS[tooltipKey];
  const labelNode = (
    <span
      style={{
        ...labelStyle,
        display: "inline-flex",
        width: "fit-content",
        cursor: tooltip ? "help" : "default",
      }}
    >
      {children}
    </span>
  );

  if (!tooltip) return labelNode;

  return (
    <Tooltip title={tooltip} {...tooltipProps}>
      {labelNode}
    </Tooltip>
  );
};

export const CertificateFormPanel = ({ form, onChange }) => (
  <div
    className="w-full px-5 pt-3 pb-0 flex flex-col items-center"
    style={certificateFormBodyStyle}
  >
    <form
      className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 items-center"
      style={{ marginBottom: 12 }}
    >
      {CERTIFICATE_FIELDS.map((field) => (
        <React.Fragment key={field.name}>
          <div style={{ justifySelf: "start", width: "fit-content" }}>
            <CertificateFieldLabel tooltipKey={field.name}>
              {field.label}:
            </CertificateFieldLabel>
          </div>
          <div className="flex items-center min-w-0 w-full">
            <input
              type="text"
              name={field.name}
              value={form[field.name] || ""}
              onChange={onChange}
              style={certificateFieldInputStyle}
              {...inputInteraction}
            />
          </div>
        </React.Fragment>
      ))}
    </form>
  </div>
);

export const CertificateActionFooter = ({ onAction }) => (
  <div style={certificateFormFooterStyle}>
    {CERTIFICATE_BUTTON_CONFIG.map((btn) => (
      <Btn
        key={btn.name}
        type="button"
        variant={btn.variant}
        onClick={() => onAction(btn.label)}
        style={
          btn.variant === CERTIFICATE_BUTTON_VARIANTS.PRIMARY
            ? CERTIFICATE_BUTTON_STYLE
            : CERTIFICATE_CANCEL_BUTTON_STYLE
        }
      >
        {btn.label}
      </Btn>
    ))}
  </div>
);

export const CertificateNote = () => (
  <p
    style={{
      margin: "16px 0 0",
      textAlign: "center",
      fontSize: 12,
      color: C.accent,
      width: "100%",
      whiteSpace: "nowrap",
      overflowX: "auto",
      lineHeight: 1.45,
    }}
  >
    {CERTIFICATE_NOTE}
  </p>
);
