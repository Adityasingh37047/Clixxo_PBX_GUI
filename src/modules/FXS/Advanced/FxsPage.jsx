import React, { useState } from "react";
import { FXS_INITIAL_FORM, FXS_FIELD_TOOLTIPS } from "../../../constants/FxsConstants";
import { Alert, Checkbox, Tooltip } from "@mui/material";
// ── Local page UI (inlined from fxsSharedUi) ──


const FIELD_LABEL_COLOR = "#3E5475";

const FIELD_TOOLTIP_PROPS = {
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
        textTransform: "none",
        letterSpacing: "normal",
      },
    },
    arrow: { sx: { color: "#fff" } },
  },
};

const formatFieldTooltipTitle = (text) => {
  if (!text) return "";
  const normalized = text.replace(/<br\s*\/?>/gi, "\n").replace(/&quot;/g, '"');
  if (normalized.includes("\n")) {
    return (
      <span style={{ whiteSpace: "pre-line", display: "block" }}>
        {normalized}
      </span>
    );
  }
  return normalized;
};

const FxsFieldLabel = ({ tooltipKey, tooltips, children, style = {} }) => {
  const tooltip = tooltipKey ? tooltips[tooltipKey] || "" : "";
  const labelNode = (
    <span
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: FIELD_LABEL_COLOR,
        cursor: tooltip ? "help" : undefined,
        ...style,
      }}
    >
      {children}
    </span>
  );
  if (!tooltip) return labelNode;
  return (
    <Tooltip title={formatFieldTooltipTitle(tooltip)} {...FIELD_TOOLTIP_PROPS}>
      {labelNode}
    </Tooltip>
  );
};

const C = {
  cardBg: "var(--bg-surface)",
  cardBorder: "var(--border-strong)",
  labelText: "var(--text-primary)",
  valueText: "var(--text-primary)",
};

const FXS_ADVANCED_FXS_PAGE_WRAP =
  "bg-[var(--bg-main)] min-h-[calc(100vh-80px)] p-[16px] box-border flex flex-col items-center";
const FXS_ADVANCED_FXS_PAGE_INNER = "w-full max-w-[1000px] mx-auto";
const FXS_ADVANCED_FXS_TABLE_CONTAINER =
  "w-full max-w-full mx-auto overflow-hidden rounded-[10px] border-[1.5px] border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-[0_4px_20px_rgba(15,23,42,0.06)] mb-[24px]";
const FXS_ADVANCED_FXS_BLUE_BAR =
  "flex w-full min-h-[44px] flex-wrap items-center justify-start gap-[12px] rounded-t-[10px] border-b border-[var(--border-strong)] bg-[var(--bg-surface)] px-[14px] py-[7px] text-[13px] font-bold text-[var(--text-label)]";
const FXS_ADVANCED_FXS_FORM_BODY = "px-[20px] pt-[12px]";
const FXS_ADVANCED_FXS_FORM_FOOTER =
  "flex flex-wrap items-center justify-center gap-[12px] w-[calc(100%+40px)] -ml-[20px] -mr-[20px] mt-0 mb-0 border-t border-[var(--border-strong)] box-border px-[20px] py-[10px]";

const BTN_FORM_PRIMARY =
  "inline-flex items-center justify-center box-border m-0 min-w-[110px] h-[34px] gap-[6px] px-[28px] py-0 rounded-[10px] text-[13px] font-semibold leading-[34px] whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)] disabled:cursor-not-allowed disabled:opacity-60";

const BTN_FORM_CANCEL =
  "inline-flex items-center justify-center box-border m-0 min-w-[110px] h-[34px] gap-[6px] px-[28px] py-0 rounded-[10px] text-[13px] font-semibold leading-[34px] whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border bg-[#cbd5e1] text-[#374151] border-[#cbd5e1] shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-[#b6c2d3] disabled:cursor-not-allowed disabled:opacity-60";

const Btn = ({ children, onClick, disabled, variant = "formPrimary", type }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={variant === "formCancel" ? BTN_FORM_CANCEL : BTN_FORM_PRIMARY}
  >
    {children}
  </button>
);

const OUTLINED_BORDER = "var(--border-subtle)";
const OUTLINED_HOVER = "var(--border-strong)";
const OUTLINED_FOCUS = "var(--status-primary)";

const FOCUS_RING_SHADOW = (color) => `0 0 0 1px ${color}`;

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
  el.style.boxShadow = FOCUS_RING_SHADOW(OUTLINED_FOCUS);
};

const nativeFieldInteraction = {
  onFocus: (e) => {
    if (e.target.disabled) return;
    setFieldFocus(e.target);
  },
  onBlur: (e) => {
    setFieldDefault(e.target);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled) return;
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldHover(e.target);
    }
  },
  onMouseLeave: (e) => {
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldDefault(e.target);
    }
  },
};

const getNativeFieldInteraction = (disabled) =>
  disabled ? {} : nativeFieldInteraction;

const getFxsNativeFieldInteraction = getNativeFieldInteraction;

const nativeFieldInputStyle = {
  height: 28,
  width: 200,
  padding: "0 8px",
  fontSize: 13,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 4,
  outline: "none",
  backgroundColor: "var(--bg-surface)",
  color: "var(--text-primary)",
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const nativeFieldSelectStyle = {
  width: nativeFieldInputStyle.width,
  minHeight: 32,
  padding: "6px 28px 6px 8px",
  fontSize: nativeFieldInputStyle.fontSize,
  lineHeight: 1.35,
  border: nativeFieldInputStyle.border,
  borderRadius: nativeFieldInputStyle.borderRadius,
  outline: nativeFieldInputStyle.outline,
  backgroundColor: nativeFieldInputStyle.backgroundColor,
  color: nativeFieldInputStyle.color,
  boxSizing: nativeFieldInputStyle.boxSizing,
  transition: nativeFieldInputStyle.transition,
  appearance: "auto",
};


const checkboxSx = {
  padding: "4px",
  color: "#64748b",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
  "& .MuiSvgIcon-root": { fontSize: 18 },
};


const FormEnableCheckbox = ({
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


const FxsAdvancedFxsBreadcrumb = ({ current }) => (
  <div className="mb-[16px] flex flex-wrap items-center gap-[4px] text-[12px] font-normal text-[#94a3b8]">
    <span>FXS</span>
    <span>&gt;</span>
    <span>Advanced</span>
    <span>&gt;</span>
    <span className="font-semibold text-[#1e293b]">{current}</span>
  </div>
);

const FxsAdvancedFxsPageShell = ({ children, fullWidth = false }) => (
  <div className={FXS_ADVANCED_FXS_PAGE_WRAP}>
    <div
      className={fullWidth ? "w-full max-w-full mx-auto" : FXS_ADVANCED_FXS_PAGE_INNER}
    >
      {children}
    </div>
  </div>
);

const FieldRow = ({
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

const FxsAdvancedFxsFormCard = ({
  title,
  children,
  footer,
  fullWidthContent = false,
}) => (
  <div className={FXS_ADVANCED_FXS_TABLE_CONTAINER}>
    <div className={FXS_ADVANCED_FXS_BLUE_BAR}>
      <span>{title}</span>
    </div>
    <div
      className={
        footer
          ? FXS_ADVANCED_FXS_FORM_BODY
          : `${FXS_ADVANCED_FXS_FORM_BODY} pb-[12px]`
      }
    >
      <div
        className={
          fullWidthContent
            ? "flex flex-col gap-[14px] w-full max-w-full"
            : "flex flex-col gap-[14px] mx-auto max-w-[560px]"
        }
      >
        {children}
      </div>
      {footer ? (
        <div className={FXS_ADVANCED_FXS_FORM_FOOTER}>{footer}</div>
      ) : null}
    </div>
  </div>
);

const inputStyle = nativeFieldInputStyle;
const selectStyle = nativeFieldSelectStyle;
const fieldInteraction = nativeFieldInteraction;

const labelCellStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: C.labelText,
  paddingRight: 24,
  textAlign: "left",
  verticalAlign: "middle",
};

const FxsPage = () => {
  // Form state
  const [formData, setFormData] = useState(FXS_INITIAL_FORM);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  // Keep existing alert(...) calls, but render them as toast notifications.
  const alert = (msg) => {
    const isSuccess = /successfully/i.test(String(msg));
    showToast(msg, isSuccess ? "success" : "error");
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleKeyPress = (e, type) => {
    const key = e.keyCode || e.which;
    // Allow digits (48-57), comma (44), minus (45), backspace (8)
    if (type === "number") {
      if (!((key > 47 && key < 58) || key === 8)) {
        e.preventDefault();
      }
    } else if (type === "number-comma-minus") {
      // For ringMode field
      if (!((key > 47 && key < 58) || key === 44 || key === 45 || key === 8)) {
        e.preventDefault();
      }
    } else if (type === "number-minus") {
      // For fields that allow negative numbers
      if (!((key > 47 && key < 58) || key === 45 || key === 8)) {
        e.preventDefault();
      }
    }
  };

  const validateForm = () => {
    // Validate Ringing Mode if enabled
    if (formData.ringingSchemeEnabled && !formData.ringMode) {
      alert("Please input a ringing mode for Scheme!");
      return false;
    }

    if (formData.ringingSchemeEnabled && formData.ringMode) {
      const strArr = formData.ringMode.split(",");
      if (strArr[0] === "1") {
        if (strArr.length !== 3) {
          alert("Please input a ringing mode in the right format for Scheme!");
          return false;
        }
        const sum = parseInt(strArr[1]) + parseInt(strArr[2]);
        if (sum > 16000) {
          alert(
            "The sum duration at ON/OFF state for ringing scheme cannot be more than 16000ms！",
          );
          return false;
        }
        if (parseInt(strArr[1]) > 12000 || parseInt(strArr[2]) > 12000) {
          alert(
            "The duration at ON/OFF state for ringing scheme cannot be more than 12000ms！",
          );
          return false;
        }
        const minKeepTime = 50;
        if (
          parseInt(strArr[1]) < minKeepTime ||
          parseInt(strArr[2]) < minKeepTime
        ) {
          alert(
            "The duration at ON/OFF state for ringing scheme cannot be less than 50ms!",
          );
          return false;
        }
      } else if (strArr[0] === "2") {
        if (strArr.length !== 5) {
          alert("Please input a ringing mode in the right format for Scheme!");
          return false;
        }
        const sum =
          parseInt(strArr[1]) +
          parseInt(strArr[2]) +
          parseInt(strArr[3]) +
          parseInt(strArr[4]);
        if (sum > 16000) {
          alert(
            "The sum duration at ON/OFF state for ringing scheme cannot be more than 16000ms！",
          );
          return false;
        }
        if (
          parseInt(strArr[1]) > 12000 ||
          parseInt(strArr[2]) > 12000 ||
          parseInt(strArr[3]) > 12000 ||
          parseInt(strArr[4]) > 12000
        ) {
          alert(
            "The duration at ON/OFF state for ringing scheme cannot be more than 12000ms！",
          );
          return false;
        }
        const minKeepTime = 50;
        if (
          parseInt(strArr[1]) < minKeepTime ||
          parseInt(strArr[2]) < minKeepTime ||
          parseInt(strArr[3]) < minKeepTime ||
          parseInt(strArr[4]) < minKeepTime
        ) {
          alert(
            "The duration at ON/OFF state for ringing scheme cannot be less than 50ms!",
          );
          return false;
        }
      } else {
        alert("Please input a ringing mode in the right format for Scheme!");
        return false;
      }
    }

    // Validate Tone Energy
    const toneEnergy = parseInt(formData.toneEnergy);
    if (isNaN(toneEnergy) || toneEnergy < -35 || toneEnergy > 15) {
      alert("The value range of 'Tone Energy' is -35~15dB!");
      return false;
    }

    // Validate Hook-flash times if enabled
    if (formData.hookFlashDetection) {
      const hookFlashMinTime = parseInt(formData.hookFlashMinTime);
      const hookFlashMaxTime = parseInt(formData.hookFlashMaxTime);

      if (hookFlashMinTime < 80) {
        alert(
          "The minimum time for Hook-flash detection must be longer than 80ms!",
        );
        return false;
      }
      if (hookFlashMinTime > hookFlashMaxTime) {
        alert(
          "The minimum time for Hook-flash detection can not exceed the maximum time!",
        );
        return false;
      }
      if (hookFlashMaxTime < 80 || hookFlashMaxTime > 2000) {
        alert("The value range of 'Flash Signal Detection' is 80~2000ms");
        return false;
      }
    } else {
      // Validate Minimum Time Length of On-hook Detection
      const minHangupTime = parseInt(formData.minHangupTime);
      if (minHangupTime < 64 || minHangupTime > 2000) {
        alert(
          "The minimum time length of on-hook detection must be in the range of 64ms~2000ms!",
        );
        return false;
      }
    }

    // Validate Off-hook Dither Signal Duration
    const offHookDither = parseInt(formData.offHookDitherSignalDuration);
    if (offHookDither <= 0 || offHookDither % 16 !== 0) {
      alert(
        "Off-hook Dither Signal Duration must be longer than 0 and the integral times of 16!",
      );
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (validateForm()) {
      alert("Settings saved successfully!");
    }
  };

  const handleReset = () => {
    setFormData({ ...FXS_INITIAL_FORM });
  };

  const renderEnableCheckbox = (name, label = "Enable") => (
    <FormEnableCheckbox
      name={name}
      checked={!!formData[name]}
      onChange={handleInputChange}
      label={label}
    />
  );

  return (
    <FxsAdvancedFxsPageShell>
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={() => setToast({ msg: "", type: "success" })}
          sx={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            minWidth: 300,
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            fontWeight: 500,
          }}
        >
          {toast.msg}
        </Alert>
      )}
      <FxsAdvancedFxsBreadcrumb current="FXS" />
      <FxsAdvancedFxsFormCard
        title="FXS"
        footer={
          <>
            <Btn type="button" onClick={handleSave} variant="formPrimary">
              Save
            </Btn>
            <Btn type="button" onClick={handleReset} variant="formCancel">
              Reset
            </Btn>
          </>
        }
      >
            <div style={{ width: "100%", maxWidth: 750, margin: "0 auto" }}>
              <table
                className="text-sm"
                style={{ tableLayout: "fixed", width: "750px" }}
              >
                <colgroup>
                  <col style={{ width: "48%" }} />
                  <col style={{ width: "52%" }} />
                </colgroup>
                <tbody>
                  {/* Tone Energy (dB) */}
                  <tr>
                    <td style={labelCellStyle}>
                      <FxsFieldLabel tooltipKey="toneEnergy" tooltips={FXS_FIELD_TOOLTIPS}>
                        Tone Energy (dB)
                      </FxsFieldLabel>
                    </td>
                    <td style={{ textAlign: "left" }}>
                      <input
                        type="text"
                        name="toneEnergy"
                        value={formData.toneEnergy}
                        onChange={handleInputChange}
                        onKeyPress={(e) => handleKeyPress(e, "number-minus")}
                        style={inputStyle}
                        {...fieldInteraction}
                        maxLength="20"
                      />
                    </td>
                  </tr>
                  <tr className="h-3" />

                  {/* Ringing Scheme Setting */}
                  <tr>
                    <td style={labelCellStyle}>
                      <FxsFieldLabel tooltipKey="ringingSchemeEnabled" tooltips={FXS_FIELD_TOOLTIPS}>
                        Ringing Scheme Setting
                      </FxsFieldLabel>
                    </td>
                    <td className="align-middle text-left">
                      {renderEnableCheckbox("ringingSchemeEnabled")}
                    </td>
                  </tr>

                  {/* Ringing Mode - conditional */}
                  {formData.ringingSchemeEnabled && (
                    <>
                      <tr className="h-3" />
                      <tr>
                        <td style={labelCellStyle}>
                          <FxsFieldLabel tooltipKey="ringMode" tooltips={FXS_FIELD_TOOLTIPS}>
                            Ringing Mode
                          </FxsFieldLabel>
                        </td>
                        <td className="align-middle text-left">
                          <input
                            type="text"
                            name="ringMode"
                            value={formData.ringMode}
                            onChange={handleInputChange}
                            onKeyPress={(e) =>
                              handleKeyPress(e, "number-comma-minus")
                            }
                            style={inputStyle}
                        {...fieldInteraction}
                            maxLength="128"
                          />
                        </td>
                      </tr>
                    </>
                  )}
                  <tr className="h-3" />

                  {/* Hook-flash Detection */}
                  <tr>
                    <td style={labelCellStyle}>
                      <FxsFieldLabel tooltipKey="hookFlashDetection" tooltips={FXS_FIELD_TOOLTIPS}>
                        Hook-flash Detection
                      </FxsFieldLabel>
                    </td>
                    <td className="align-middle text-left">
                      {renderEnableCheckbox("hookFlashDetection")}
                    </td>
                  </tr>

                  {/* Minimum Time Length of On-hook Detection - shown when Hook-flash Detection is unchecked */}
                  {!formData.hookFlashDetection && (
                    <>
                      <tr className="h-3" />
                      <tr>
                        <td style={labelCellStyle}>
                          <FxsFieldLabel tooltipKey="minHangupTime" tooltips={FXS_FIELD_TOOLTIPS}>
                            Minimum Time Length of On-hook Detection (ms)
                          </FxsFieldLabel>
                        </td>
                        <td className="align-middle text-left">
                          <input
                            type="text"
                            name="minHangupTime"
                            value={formData.minHangupTime}
                            onChange={handleInputChange}
                            onKeyPress={(e) => handleKeyPress(e, "number")}
                            style={inputStyle}
                        {...fieldInteraction}
                            maxLength="5"
                          />
                        </td>
                      </tr>
                    </>
                  )}

                  {/* Minimum Time and Maximum Time - shown when Hook-flash Detection is checked */}
                  {formData.hookFlashDetection && (
                    <>
                      <tr className="h-3" />
                      <tr>
                        <td style={labelCellStyle}>
                          <FxsFieldLabel tooltipKey="hookFlashMinTime" tooltips={FXS_FIELD_TOOLTIPS}>
                            Minimum Time (ms)
                          </FxsFieldLabel>
                        </td>
                        <td className="align-middle text-left">
                          <input
                            type="text"
                            name="hookFlashMinTime"
                            value={formData.hookFlashMinTime}
                            onChange={handleInputChange}
                            onKeyPress={(e) => handleKeyPress(e, "number")}
                            style={inputStyle}
                        {...fieldInteraction}
                            maxLength="5"
                          />
                        </td>
                      </tr>
                      <tr className="h-3" />
                      <tr>
                        <td style={labelCellStyle}>
                          <FxsFieldLabel tooltipKey="hookFlashMaxTime" tooltips={FXS_FIELD_TOOLTIPS}>
                            Maximum Time (ms)
                          </FxsFieldLabel>
                        </td>
                        <td className="align-middle text-left">
                          <input
                            type="text"
                            name="hookFlashMaxTime"
                            value={formData.hookFlashMaxTime}
                            onChange={handleInputChange}
                            onKeyPress={(e) => handleKeyPress(e, "number")}
                            style={inputStyle}
                        {...fieldInteraction}
                            maxLength="5"
                          />
                        </td>
                      </tr>
                    </>
                  )}
                  <tr className="h-3" />

                  {/* Preferred 18x Response */}
                  <tr>
                    <td style={labelCellStyle}>
                      <FxsFieldLabel tooltipKey="preferred18xResponse" tooltips={FXS_FIELD_TOOLTIPS}>
                        Preferred 18x Response (NO valid P_Early_Media)
                      </FxsFieldLabel>
                    </td>
                    <td className="align-middle text-left">
                      <select
                        name="preferred18xResponse"
                        value={formData.preferred18xResponse}
                        onChange={handleInputChange}
                        style={selectStyle}
                        {...fieldInteraction}
                      >
                        <option value="0">IMS Ringback</option>
                        <option value="1">Local Ringback</option>
                      </select>
                    </td>
                  </tr>
                  <tr className="h-3" />

                  {/* Enable Press-Key Call-Forward */}
                  <tr>
                    <td style={labelCellStyle}>
                      <FxsFieldLabel tooltipKey="pressKeyCallForward" tooltips={FXS_FIELD_TOOLTIPS}>
                        Enable Press-Key Call-Forward
                      </FxsFieldLabel>
                    </td>
                    <td className="align-middle text-left">
                      {renderEnableCheckbox("pressKeyCallForward")}
                    </td>
                  </tr>

                  {/* Call-Forward Key - conditional */}
                  {formData.pressKeyCallForward && (
                    <>
                      <tr className="h-3" />
                      <tr>
                        <td style={labelCellStyle}>
                          <FxsFieldLabel tooltipKey="callForwardKey" tooltips={FXS_FIELD_TOOLTIPS}>
                            Call-Forward Key
                          </FxsFieldLabel>
                        </td>
                        <td className="align-middle text-left">
                          <select
                            name="callForwardKey"
                            value={formData.callForwardKey}
                            onChange={handleInputChange}
                            style={selectStyle}
                        {...fieldInteraction}
                          >
                            <option value="35">#</option>
                            <option value="42">*</option>
                          </select>
                        </td>
                      </tr>
                      <tr className="h-3" />
                      <tr>
                        <td style={labelCellStyle}>
                          <FxsFieldLabel tooltipKey="callForwardMethod" tooltips={FXS_FIELD_TOOLTIPS}>
                            Call-Forward Method
                          </FxsFieldLabel>
                        </td>
                        <td className="align-middle text-left">
                          <select
                            name="callForwardMethod"
                            value={formData.callForwardMethod}
                            onChange={handleInputChange}
                            style={selectStyle}
                        {...fieldInteraction}
                          >
                            <option value="0">
                              Call Forward with Negotiation
                            </option>
                            <option value="1">Blind Transfer</option>
                          </select>
                        </td>
                      </tr>
                    </>
                  )}
                  <tr className="h-3" />

                  {/* CID Transmit Mode */}
                  <tr>
                    <td style={labelCellStyle}>
                      <FxsFieldLabel tooltipKey="cidTransmitMode" tooltips={FXS_FIELD_TOOLTIPS}>
                        CID Transmit Mode
                      </FxsFieldLabel>
                    </td>
                    <td className="align-middle text-left">
                      <select
                        name="cidTransmitMode"
                        value={formData.cidTransmitMode}
                        onChange={handleInputChange}
                        style={selectStyle}
                        {...fieldInteraction}
                      >
                        <option value="0">DTMF</option>
                        <option value="1">FSK</option>
                      </select>
                    </td>
                  </tr>

                  {/* Occasion to Send FSK CallerID - shown when CID Transmit Mode is FSK */}
                  {formData.cidTransmitMode === "1" && (
                    <>
                      <tr className="h-3" />
                      <tr>
                        <td style={labelCellStyle}>
                          <FxsFieldLabel tooltipKey="occasionToSendFSKCallerID" tooltips={FXS_FIELD_TOOLTIPS}>
                            Occasion to Send FSK CallerID
                          </FxsFieldLabel>
                        </td>
                        <td className="align-middle text-left">
                          <select
                            name="occasionToSendFSKCallerID"
                            value={formData.occasionToSendFSKCallerID}
                            onChange={handleInputChange}
                            style={selectStyle}
                        {...fieldInteraction}
                          >
                            <option value="0">Before ring</option>
                            <option value="1">After the first ring</option>
                          </select>
                        </td>
                      </tr>
                    </>
                  )}
                  <tr className="h-3" />

                  {/* Send Polarity Reversal Signal */}
                  <tr>
                    <td style={labelCellStyle}>
                      <FxsFieldLabel tooltipKey="sendPolarityReversal" tooltips={FXS_FIELD_TOOLTIPS}>
                        Send Polarity Reversal Signal
                      </FxsFieldLabel>
                    </td>
                    <td className="align-middle text-left">
                      {renderEnableCheckbox("sendPolarityReversal")}
                    </td>
                  </tr>
                  <tr className="h-3" />

                  {/* Off-hook Dither Signal Duration */}
                  <tr>
                    <td style={labelCellStyle}>
                      <FxsFieldLabel tooltipKey="offHookDitherSignalDuration" tooltips={FXS_FIELD_TOOLTIPS}>
                        Off-hook Dither Signal Duration (ms)
                      </FxsFieldLabel>
                    </td>
                    <td className="align-middle text-left">
                      <input
                        type="text"
                        name="offHookDitherSignalDuration"
                        value={formData.offHookDitherSignalDuration}
                        onChange={handleInputChange}
                        onKeyPress={(e) => handleKeyPress(e, "number")}
                        style={inputStyle}
                        {...fieldInteraction}
                        maxLength="5"
                      />
                    </td>
                  </tr>
                  <tr className="h-3" />

                  {/* Handling of Call from Internal Station */}
                  <tr>
                    <td style={labelCellStyle}>
                      <FxsFieldLabel tooltipKey="handlingOfCallFromInternalStation" tooltips={FXS_FIELD_TOOLTIPS}>
                        Handling of Call from Internal Station
                      </FxsFieldLabel>
                    </td>
                    <td className="align-middle text-left">
                      <select
                        name="handlingOfCallFromInternalStation"
                        value={formData.handlingOfCallFromInternalStation}
                        onChange={handleInputChange}
                        style={selectStyle}
                        {...fieldInteraction}
                      >
                        <option value="0">Internal Handling</option>
                        <option value="1">Platform Handling</option>
                      </select>
                    </td>
                  </tr>
                  <tr className="h-3" />

                  {/* Light Up Mode for Voice Message */}
                  <tr>
                    <td style={labelCellStyle}>
                      <FxsFieldLabel tooltipKey="lightUpModeForVoiceMessage" tooltips={FXS_FIELD_TOOLTIPS}>
                        Light Up Mode for Voice Message
                      </FxsFieldLabel>
                    </td>
                    <td className="align-middle text-left">
                      <select
                        name="lightUpModeForVoiceMessage"
                        value={formData.lightUpModeForVoiceMessage}
                        onChange={handleInputChange}
                        style={selectStyle}
                        {...fieldInteraction}
                      >
                        <option value="0">Not Light Up</option>
                        <option value="1">FSK Light Up</option>
                      </select>
                    </td>
                  </tr>
                  <tr className="h-3" />

                  {/* Open Session In Advance */}
                  <tr>
                    <td style={labelCellStyle}>
                      <FxsFieldLabel tooltipKey="openSessionInAdvance" tooltips={FXS_FIELD_TOOLTIPS}>
                        Open Session In Advance
                      </FxsFieldLabel>
                    </td>
                    <td className="align-middle text-left">
                      {renderEnableCheckbox("openSessionInAdvance")}
                    </td>
                  </tr>
                  <tr className="h-3" />

                  {/* Report FXS Status */}
                  <tr>
                    <td style={labelCellStyle}>
                      <FxsFieldLabel tooltipKey="reportFXSStatus" tooltips={FXS_FIELD_TOOLTIPS}>
                        Report FXS Status
                      </FxsFieldLabel>
                    </td>
                    <td className="align-middle text-left">
                      {renderEnableCheckbox("reportFXSStatus")}
                    </td>
                  </tr>
                  <tr className="h-3" />

                  {/* Enable Send DTMF while receiving 183 */}
                  <tr>
                    <td style={labelCellStyle}>
                      <FxsFieldLabel tooltipKey="enableSendDTMFWhileReceiving183" tooltips={FXS_FIELD_TOOLTIPS}>
                        Enable Send DTMF while receiving 183
                      </FxsFieldLabel>
                    </td>
                    <td className="align-middle text-left">
                      {renderEnableCheckbox("enableSendDTMFWhileReceiving183")}
                    </td>
                  </tr>
                  <tr className="h-4" />
                </tbody>
              </table>
            </div>

      </FxsAdvancedFxsFormCard>
    </FxsAdvancedFxsPageShell>
  );
};

export default FxsPage;
