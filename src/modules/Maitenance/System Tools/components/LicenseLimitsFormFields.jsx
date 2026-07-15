import React from "react";
import Tooltip from "@mui/material/Tooltip";
import {
  LICENSE_LIMITS_BREADCRUMB,
  LICENSE_LIMITS_CARD_TITLE,
  LICENSE_LIMITS_FIELDS,
  LICENSE_LIMITS_TOOLTIPS,
  LICENSE_LIMITS_BUTTON_LABELS,
  LICENSE_LIMITS_BUTTON_VARIANTS,
  LICENSE_LIMITS_BUTTON_STYLE,
  LICENSE_LIMITS_NOTE,
} from "../../../../constants/LicenseLimitsConstants";
import {
  C,
  OUTLINED_BORDER,
  OUTLINED_HOVER,
  OUTLINED_FOCUS,
  FOCUS_RING_SHADOW,
} from "../../../../theme/pbxTokens";
import { Btn, ExtensionBreadcrumb } from "../../../../components/common";
import {
  FIELD_RADIUS,
  licenseLimitsPageWrapStyle,
  licenseLimitsPageInnerStyle,
  licenseLimitsTableContainerStyle,
  licenseLimitsHeaderStyle,
  licenseLimitsFixedAlertSx,
} from "./LicenseLimitsTableHelpers";

export { licenseLimitsFixedAlertSx };

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
    if (e.target.disabled) return;
    setFieldFocus(e.target);
  },
  onBlur: (e) => setFieldDefault(e.target),
  onMouseEnter: (e) => {
    if (e.target.disabled) return;
    if (document.activeElement === e.target) setFieldFocus(e.target);
    else setFieldHover(e.target);
  },
  onMouseLeave: (e) => {
    if (document.activeElement === e.target) setFieldFocus(e.target);
    else setFieldDefault(e.target);
  },
};

export const inputStyle = {
  padding: "6px 12px",
  borderRadius: FIELD_RADIUS,
  border: `1px solid ${OUTLINED_BORDER}`,
  fontSize: 14,
  width: "100%",
  backgroundColor: "#ffffff",
  outline: "none",
  color: "#3E5475",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
  boxShadow: "none",
};

export const labelStyle = {
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
        bgcolor: "#fff",
        color: "#334155",
        border: "1px solid #d1d5db",
        fontSize: 12,
        maxWidth: 500,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      },
    },
    arrow: { sx: { color: "#fff" } },
  },
};

export const LicenseLimitsPageShell = ({ children }) => (
  <div style={licenseLimitsPageWrapStyle} data-native-scroll>
    <div style={licenseLimitsPageInnerStyle}>{children}</div>
  </div>
);

export const LicenseLimitsBreadcrumb = () => (
  <ExtensionBreadcrumb
    root={LICENSE_LIMITS_BREADCRUMB[0]}
    section={LICENSE_LIMITS_BREADCRUMB[1]}
    current={LICENSE_LIMITS_BREADCRUMB[2]}
  />
);

export const LicenseLimitsCard = ({ form, loading, onChange, onSave }) => (
  <div style={licenseLimitsTableContainerStyle}>
    <div style={licenseLimitsHeaderStyle}>
      <span>{LICENSE_LIMITS_CARD_TITLE}</span>
    </div>

    <div className="w-full pt-3 flex flex-col items-center">
      <form
        onSubmit={onSave}
        className="w-full max-w-2xl px-5 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 items-center"
      >
        {LICENSE_LIMITS_FIELDS.map(({ key, label }) => (
          <React.Fragment key={key}>
            <Tooltip title={LICENSE_LIMITS_TOOLTIPS[key]} {...tooltipProps}>
              <label style={labelStyle}>{label}</label>
            </Tooltip>
            <input
              type="number"
              min={0}
              value={form[key]}
              onChange={(e) => onChange(key, e.target.value)}
              style={inputStyle}
              onFocus={inputInteraction.onFocus}
              onBlur={inputInteraction.onBlur}
              onMouseEnter={inputInteraction.onMouseEnter}
              onMouseLeave={inputInteraction.onMouseLeave}
            />
          </React.Fragment>
        ))}
      </form>

      <div
        className="w-full mt-3 flex flex-col items-center"
        style={{ borderTop: `1px solid ${C.divider}` }}
      >
        <div
          className="w-full flex flex-col items-center justify-center"
          style={{ minHeight: 53, padding: "9px 20px" }}
        >
          <Btn
            variant={LICENSE_LIMITS_BUTTON_VARIANTS.SAVE}
            type="button"
            disabled={loading}
            onClick={onSave}
            style={LICENSE_LIMITS_BUTTON_STYLE}
          >
            {loading
              ? LICENSE_LIMITS_BUTTON_LABELS.SAVING
              : LICENSE_LIMITS_BUTTON_LABELS.SAVE}
          </Btn>
        </div>
      </div>
    </div>
  </div>
);

export const LicenseLimitsNote = () => (
  <div
    style={{
      marginTop: 16,
      textAlign: "center",
      fontSize: 12,
      color: C.accent,
      width: "100%",
      lineHeight: 1.5,
      boxSizing: "border-box",
    }}
  >
    {LICENSE_LIMITS_NOTE}
  </div>
);
