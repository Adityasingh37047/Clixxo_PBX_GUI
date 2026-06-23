import React, { useState } from "react";
import { Alert, TextField } from "@mui/material";
import { ACTION_URL_INITIAL_FORM } from "../../../constants/ActionUrlConstants";

// ── Local page UI (inlined from fxsSharedUi) ──
const C = {
  labelText: "var(--text-primary)",
};

const ACTION_URL_PAGE_WRAP =
  "bg-[var(--bg-main)] min-h-[calc(100vh-80px)] p-[16px] box-border flex flex-col items-center";
const ACTION_URL_PAGE_INNER = "w-full max-w-[1000px] mx-auto";
const ACTION_URL_TABLE_CONTAINER =
  "w-full max-w-full mx-auto mb-[24px] overflow-hidden rounded-[10px] border-[1.5px] border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-[0_4px_20px_rgba(15,23,42,0.06)]";
const ACTION_URL_BLUE_BAR =
  "flex w-full min-h-[44px] flex-wrap items-center justify-start gap-[12px] rounded-t-[10px] border-b border-[var(--border-strong)] bg-[var(--bg-surface)] px-[14px] py-[7px] text-[13px] font-bold text-[var(--text-label)]";
const ACTION_URL_FORM_BODY = "px-[20px] pt-[12px]";
const ACTION_URL_FORM_FOOTER =
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

const ActionUrlBreadcrumb = ({ current }) => (
  <div className="mb-[16px] flex flex-wrap items-center gap-[4px] text-[12px] font-normal text-[#94a3b8]">
    <span>FXS</span>
    <span>&gt;</span>
    <span>Advanced</span>
    <span>&gt;</span>
    <span className="font-semibold text-[#1e293b]">{current}</span>
  </div>
);

const ActionUrlPageShell = ({ children, fullWidth = false }) => (
  <div className={ACTION_URL_PAGE_WRAP}>
    <div className={fullWidth ? "w-full max-w-full mx-auto" : ACTION_URL_PAGE_INNER}>
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

const ActionUrlFormCard = ({
  title,
  children,
  footer,
  fullWidthContent = false,
}) => (
  <div className={ACTION_URL_TABLE_CONTAINER}>
    <div className={ACTION_URL_BLUE_BAR}>
      <span>{title}</span>
    </div>
    <div className={footer ? `${ACTION_URL_FORM_BODY} pb-0` : `${ACTION_URL_FORM_BODY} pb-[12px]`}>
      <div
        className={`flex flex-col gap-[14px] ${
          fullWidthContent ? "w-full max-w-full m-0" : "max-w-[560px] mx-auto"
        }`}
      >
        {children}
      </div>
      {footer ? (
        <div className={ACTION_URL_FORM_FOOTER}>{footer}</div>
      ) : null}
    </div>
  </div>
);

const ActionUrlPage = () => {
  const [formData, setFormData] = useState(ACTION_URL_INITIAL_FORM);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    showToast("Settings saved successfully!");
  };

  const handleReset = () => {
    setFormData(ACTION_URL_INITIAL_FORM);
  };

  return (
    <ActionUrlPageShell>
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
      <ActionUrlBreadcrumb current="Action URL" />
      <ActionUrlFormCard
        title="Channel State Report Settings"
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
            flexDirection: "column",
            gap: 14,
            width: "100%",
            maxWidth: 560,
            margin: "0 auto",
            paddingBottom: 16,
          }}
        >
          <FieldRow label="Channel Pick up">
            <TextField
              fullWidth
              size="small"
              value={formData.chPickUpActionUrl || ""}
              onChange={(e) =>
                handleInputChange("chPickUpActionUrl", e.target.value)
              }
              placeholder="Enter URL to report pick up state"
              sx={muiTextFieldSx}
              inputProps={{
                style: { fontSize: 13, padding: "6px 8px" },
                maxLength: 256,
              }}
            />
          </FieldRow>
          <FieldRow label="Channel Hang up">
            <TextField
              fullWidth
              size="small"
              value={formData.chHangUpActionUrl || ""}
              onChange={(e) =>
                handleInputChange("chHangUpActionUrl", e.target.value)
              }
              placeholder="Enter URL to report hang up state"
              sx={muiTextFieldSx}
              inputProps={{
                style: { fontSize: 13, padding: "6px 8px" },
                maxLength: 256,
              }}
            />
          </FieldRow>
        </div>
      </ActionUrlFormCard>
    </ActionUrlPageShell>
  );
};

export default ActionUrlPage;
