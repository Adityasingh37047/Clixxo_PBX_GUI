import React from "react";
import { Checkbox } from "@mui/material";
import {
  DEVICE_LOCK_OPTIONS,
  DEVICE_LOCK_PAGE_TITLE,
  DEVICE_LOCK_LABELS,
  DEVICE_LOCK_BUTTON_LABELS,
  DEVICE_LOCK_BUTTON_VARIANTS,
  DEVICE_LOCK_BUTTON_STYLE,
  DEVICE_LOCK_BREADCRUMB,
} from "../../../../constants/DeviceLockConstants";
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
  deviceLockPageWrapStyle,
  deviceLockPageInnerStyle,
  deviceLockTableContainerStyle,
  deviceLockHeaderStyle,
  deviceLockFixedAlertSx,
} from "./DeviceLockTableHelpers";

export { deviceLockFixedAlertSx };

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
    if (document.activeElement === e.target) setFieldFocus(e.target);
    else setFieldHover(e.target);
  },
  onMouseLeave: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    if (document.activeElement === e.target) setFieldFocus(e.target);
    else setFieldDefault(e.target);
  },
};

export const deviceLockPasswordInputStyle = {
  width: "100%",
  maxWidth: 280,
  minWidth: 0,
  height: 32,
  padding: "0 12px",
  borderRadius: FIELD_RADIUS,
  boxSizing: "border-box",
  background: "#ffffff",
  lineHeight: 1.35,
  fontSize: 13,
  border: `1px solid ${OUTLINED_BORDER}`,
  outline: "none",
  color: C.valueText,
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

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

export const deviceLockCheckboxSx = {
  padding: "4px",
  marginRight: "4px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "& .MuiSvgIcon-root": { fontSize: 20 },
};

const labelBaseStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: C.labelText,
  whiteSpace: "nowrap",
};

export const DeviceLockPageShell = ({ children }) => (
  <div style={deviceLockPageWrapStyle} data-native-scroll>
    <div style={deviceLockPageInnerStyle}>{children}</div>
  </div>
);

export const DeviceLockBreadcrumb = () => (
  <ExtensionBreadcrumb
    root={DEVICE_LOCK_BREADCRUMB[0]}
    section={DEVICE_LOCK_BREADCRUMB[1]}
    current={DEVICE_LOCK_BREADCRUMB[2]}
  />
);

export const DeviceLockCard = ({
  selectedOptions,
  password,
  confirmPassword,
  onPasswordChange,
  onConfirmPasswordChange,
  onOptionChange,
  onLock,
  onReset,
}) => (
  <div style={deviceLockTableContainerStyle}>
    <div style={deviceLockHeaderStyle}>{DEVICE_LOCK_PAGE_TITLE}</div>
    <form onSubmit={onLock}>
      <div
        style={{
          padding: "10px 24px 0",
          maxWidth: 600,
          width: "100%",
          margin: "0 auto",
        }}
      >
        <div className="space-y-6">
          <div
            style={{
              fontSize: 14,
              color: C.valueText,
              textAlign: "center",
              lineHeight: 1.6,
              fontWeight: 500,
              marginBottom: "32px",
            }}
          >
            {DEVICE_LOCK_LABELS.instruction}
          </div>

          <div className="flex justify-center gap-8 mb-8 flex-wrap">
            {DEVICE_LOCK_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center cursor-pointer select-none"
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.labelText,
                  transition: "color 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.color = C.strongText)
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.color = C.labelText)
                }
              >
                <Checkbox
                  size="small"
                  checked={!!selectedOptions[opt.value]}
                  onChange={() => onOptionChange(opt.value)}
                  sx={deviceLockCheckboxSx}
                />
                {opt.label}
              </label>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "max-content minmax(0, 280px)",
              columnGap: 16,
              rowGap: 16,
              alignItems: "center",
              margin: "0 auto",
              width: "fit-content",
              marginBottom: 12,
            }}
          >
            <label style={{ ...labelBaseStyle, textAlign: "left" }}>
              {DEVICE_LOCK_LABELS.password}:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              style={deviceLockPasswordInputStyle}
              {...inputInteraction}
              autoComplete="new-password"
            />
            <label style={{ ...labelBaseStyle, textAlign: "right" }}>
              {DEVICE_LOCK_LABELS.confirmPassword}:
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => onConfirmPasswordChange(e.target.value)}
              style={deviceLockPasswordInputStyle}
              {...inputInteraction}
              autoComplete="new-password"
            />
          </div>
        </div>
      </div>

      <div style={advancedFormInlineFooterStyle}>
        <Btn
          variant={DEVICE_LOCK_BUTTON_VARIANTS.LOCK}
          onClick={onLock}
          type="submit"
          style={DEVICE_LOCK_BUTTON_STYLE}
        >
          {DEVICE_LOCK_BUTTON_LABELS.LOCK}
        </Btn>
        <Btn
          variant={DEVICE_LOCK_BUTTON_VARIANTS.RESET}
          onClick={onReset}
          type="button"
          style={DEVICE_LOCK_BUTTON_STYLE}
        >
          {DEVICE_LOCK_BUTTON_LABELS.RESET}
        </Btn>
      </div>
    </form>
  </div>
);
