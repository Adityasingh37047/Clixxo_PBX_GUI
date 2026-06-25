import React, { useState } from "react";
import { Alert, Checkbox, TextField, Tooltip } from "@mui/material";
import { QOS_INITIAL_FORM, QOS_FIELD_TOOLTIPS } from "../../../constants/QosConstants";
// ── Page-local field label tooltip UI (not shared) ──
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

// ── Local page UI (inlined from fxsSharedUi) ──
// ── Local page UI (inlined from fxsSharedUi) ──
const C = {
  labelText: "var(--text-primary)",
  valueText: "var(--text-primary)",
};

const QOS_PAGE_WRAP =
  "bg-[var(--bg-main)] min-h-[calc(100vh-80px)] p-[16px] box-border flex flex-col items-center";
const QOS_PAGE_INNER = "w-full max-w-[1000px] mx-auto";
const QOS_TABLE_CONTAINER =
  "w-full max-w-full mx-auto mb-[24px] overflow-hidden rounded-[10px] border-[1.5px] border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-[0_4px_20px_rgba(15,23,42,0.06)]";
const QOS_BLUE_BAR =
  "flex w-full min-h-[44px] flex-wrap items-center justify-start gap-[12px] rounded-t-[10px] border-b border-[var(--border-strong)] bg-[var(--bg-surface)] px-[14px] py-[7px] text-[13px] font-bold text-[var(--text-label)]";
const QOS_FORM_BODY = "px-[20px] pt-[12px]";
const QOS_FORM_FOOTER =
  "flex w-full flex-wrap items-center justify-center gap-[12px] w-[calc(100%+40px)] -mx-[20px] border-t border-[var(--border-strong)] box-border px-[20px] py-[10px]";

const BTN_BASE =
  "inline-flex items-center justify-center gap-[6px] h-[30px] px-[14px] py-[6px] rounded-[10px] text-[12px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border disabled:cursor-not-allowed disabled:opacity-60";
const BTN_OUTLINE = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:bg-[var(--row-alt)]`;
const BTN_CANCEL = `${BTN_BASE} bg-[#cbd5e1] text-[#374151] border-[#cbd5e1] shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-[#b6c2d3]`;
const BTN_PRIMARY = `${BTN_BASE} text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)]`;
const BTN_FORM_PRIMARY =
  "inline-flex items-center justify-center box-border m-0 min-w-[110px] h-[34px] gap-[6px] px-[28px] py-0 rounded-[10px] text-[13px] font-semibold leading-[34px] whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)] disabled:cursor-not-allowed disabled:opacity-60";
const BTN_FORM_CANCEL =
  "inline-flex items-center justify-center box-border m-0 min-w-[110px] h-[34px] gap-[6px] px-[28px] py-0 rounded-[10px] text-[13px] font-semibold leading-[34px] whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border bg-[#cbd5e1] text-[#374151] border-[#cbd5e1] shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-[#b6c2d3] disabled:cursor-not-allowed disabled:opacity-60";

const btnVariantCls = {
  primary: BTN_PRIMARY,
  cancel: BTN_CANCEL,
  outline: BTN_OUTLINE,
  formPrimary: BTN_FORM_PRIMARY,
  formCancel: BTN_FORM_CANCEL,
};

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "formPrimary",
  type,
  className = "",
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`${btnVariantCls[variant] || BTN_FORM_PRIMARY} ${className}`.trim()}
  >
    {children}
  </button>
);

const OUTLINED_BORDER = "var(--border-subtle)";
const OUTLINED_HOVER = "var(--border-strong)";
const OUTLINED_FOCUS = "var(--status-primary)";

const muiTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "var(--bg-surface)",
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

const QosBreadcrumb = ({ current }) => (
  <div className="mb-[16px] flex flex-wrap items-center gap-[4px] text-[12px] font-normal text-[#94a3b8]">
    <span>FXS</span>
    <span>&gt;</span>
    <span>Advanced</span>
    <span>&gt;</span>
    <span className="font-semibold text-[#1e293b]">{current}</span>
  </div>
);

const QosPageShell = ({ children, fullWidth = false }) => (
  <div className={QOS_PAGE_WRAP}>
    <div className={fullWidth ? "w-full max-w-full mx-auto" : QOS_PAGE_INNER}>
      {children}
    </div>
  </div>
);

const QosFormCard = ({
  title,
  children,
  footer,
  fullWidthContent = false,
}) => (
  <div className={QOS_TABLE_CONTAINER}>
    <div className={QOS_BLUE_BAR}>
      <span>{title}</span>
    </div>
    <div className={footer ? `${QOS_FORM_BODY} pb-0` : `${QOS_FORM_BODY} pb-[12px]`}>
      <div
        className={`flex flex-col gap-[14px] ${
          fullWidthContent ? "w-full max-w-full m-0" : "max-w-[560px] mx-auto"
        }`}
      >
        {children}
      </div>
      {footer ? (
        <div className={QOS_FORM_FOOTER}>{footer}</div>
      ) : null}
    </div>
  </div>
);

const FIELD_LABEL_WIDTH = 170;
const FIELD_GAP = 12;
const QOS_INPUT_WIDTH = 160; // half of 320px control column

const qosInputFieldSx = {
  ...muiTextFieldSx,
  width: QOS_INPUT_WIDTH,
  maxWidth: "50%",
};

const qosLabelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: C.labelText,
  width: FIELD_LABEL_WIDTH,
  flexShrink: 0,
  textAlign: "left",
};

const qosControlColBase = {
  width: "min(100%, 320px)",
  flexShrink: 0,
  boxSizing: "border-box",
};

/** Checkbox column — Enable control starts here */
const qosCheckboxColStyle = {
  ...qosControlColBase,
  paddingLeft: 6,
};

/** Input column — left edge lines up with checkbox icon (6px col + 4px MUI checkbox padding) */
const qosInputColStyle = {
  ...qosControlColBase,
  paddingLeft: 10,
};

const QosFieldRow = ({ label, labelFor, children, inputAlign = false, tooltipKey }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      gap: FIELD_GAP,
      minHeight: 32,
    }}
  >
    <label htmlFor={labelFor} style={qosLabelStyle}>
      <FxsFieldLabel tooltipKey={tooltipKey} tooltips={QOS_FIELD_TOOLTIPS}>
        {label}
      </FxsFieldLabel>
    </label>
    <div style={inputAlign ? qosInputColStyle : qosCheckboxColStyle}>
      {children}
    </div>
  </div>
);

const QosPage = () => {
  const [formData, setFormData] = useState(QOS_INITIAL_FORM);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const alert = (msg) => {
    const isSuccess = /successfully/i.test(String(msg));
    showToast(msg, isSuccess ? "success" : "error");
  };

  const handleSave = () => {
    if (formData.qosEnabled) {
      const mediaQos = parseInt(formData.mediaPremiumQos, 10);
      if (Number.isNaN(mediaQos) || mediaQos < 0 || mediaQos > 63) {
        alert("The range of 'Media Premium QoS' is 0~63!");
        return;
      }
      const controlQos = parseInt(formData.controlPremiumQos, 10);
      if (Number.isNaN(controlQos) || controlQos < 0 || controlQos > 63) {
        alert("The range of 'Control Premium QoS' is 0~63!");
        return;
      }
    }
    alert("Settings saved successfully!");
  };

  const handleReset = () => {
    setFormData(QOS_INITIAL_FORM);
  };

  return (
    <QosPageShell>
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
      <QosBreadcrumb current="QoS" />
      <QosFormCard
        title="QoS"
        footer={
          <>
            <Btn variant="formPrimary" onClick={handleSave}>
              Save
            </Btn>
            <Btn variant="formCancel" onClick={handleReset}>
              Reset
            </Btn>
          </>
        }
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            paddingBottom: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              width: "fit-content",
              maxWidth: "100%",
            }}
          >
            <QosFieldRow label="QoS" labelFor="qosEnabled" tooltipKey="qosEnabled">
              <FormEnableCheckbox
                id="qosEnabled"
                checked={formData.qosEnabled}
                onChange={() =>
                  setFormData((prev) => ({
                    ...prev,
                    qosEnabled: !prev.qosEnabled,
                  }))
                }
              />
            </QosFieldRow>
            {formData.qosEnabled && (
              <>
                <QosFieldRow
                  label="Media Premium QoS"
                  labelFor="mediaPremiumQos"
                  inputAlign
                  tooltipKey="mediaPremiumQos"
                >
                  <TextField
                    id="mediaPremiumQos"
                    size="small"
                    value={formData.mediaPremiumQos || ""}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "");
                      setFormData((prev) => ({
                        ...prev,
                        mediaPremiumQos: v,
                      }));
                    }}
                    sx={qosInputFieldSx}
                    inputProps={{
                      style: { fontSize: 13, padding: "6px 8px" },
                      maxLength: 2,
                    }}
                  />
                </QosFieldRow>
                <QosFieldRow
                  label="Control Premium QoS"
                  labelFor="controlPremiumQos"
                  inputAlign
                  tooltipKey="controlPremiumQos"
                >
                  <TextField
                    id="controlPremiumQos"
                    size="small"
                    value={formData.controlPremiumQos || ""}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "");
                      setFormData((prev) => ({
                        ...prev,
                        controlPremiumQos: v,
                      }));
                    }}
                    sx={qosInputFieldSx}
                    inputProps={{
                      style: { fontSize: 13, padding: "6px 8px" },
                      maxLength: 2,
                    }}
                  />
                </QosFieldRow>
              </>
            )}
          </div>
        </div>
      </QosFormCard>
    </QosPageShell>
  );
};

export default QosPage;
