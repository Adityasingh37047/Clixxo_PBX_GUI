import React, { useState, useRef } from "react";
import { Alert, Select, MenuItem, FormControl, Tooltip } from "@mui/material";
import {
  CUE_TONE_FILE_TYPES,
  CUE_TONE_INITIAL_FORM,
  CUE_TONE_FIELD_TOOLTIPS,
} from "../../../constants/CueToneConstants";

/** Choose file & Upload â€” same size; gray cancel styling on file picker */
// â”€â”€ Page-local field label tooltip UI (not shared) â”€â”€
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

// â”€â”€ Local page UI (inlined from fxsSharedUi) â”€â”€
const C = {
  labelText: "var(--text-primary)",
  mutedText: "var(--text-muted)",
};

const CUE_TONE_PAGE_WRAP =
  "bg-[var(--bg-main)] min-h-[calc(100vh-80px)] p-[16px] box-border flex flex-col items-center";
const CUE_TONE_PAGE_INNER = "w-full max-w-[1000px] mx-auto";
const CUE_TONE_TABLE_CONTAINER =
  "w-full max-w-full mx-auto mb-[24px] overflow-hidden rounded-[10px] border-[1.5px] border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-[0_4px_20px_rgba(15,23,42,0.06)]";
const CUE_TONE_BLUE_BAR =
  "flex w-full min-h-[44px] flex-wrap items-center justify-start gap-[12px] rounded-t-[10px] border-b border-[var(--border-strong)] bg-[var(--bg-surface)] px-[14px] py-[7px] text-[13px] font-bold text-[var(--text-label)]";
const CUE_TONE_FORM_BODY = "px-[20px] pt-[12px]";
const CUE_TONE_FORM_FOOTER =
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

const muiSelectInnerSx = {
  "& .MuiOutlinedInput-root": {
    minHeight: 36,
    backgroundColor: "var(--bg-surface)",
  },
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    padding: "7px 32px 7px 10px !important",
    lineHeight: 1.35,
    boxSizing: "border-box",
  },
};

const muiSelectSx = {
  fontSize: 13,
  backgroundColor: "var(--bg-surface)",
  ...muiSelectInnerSx,
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: 2,
  },
};

const CueToneBreadcrumb = ({ current }) => (
  <div className="mb-[16px] flex flex-wrap items-center gap-[4px] text-[12px] font-normal text-[#94a3b8]">
    <span>FXS</span>
    <span>&gt;</span>
    <span>Advanced</span>
    <span>&gt;</span>
    <span className="font-semibold text-[#1e293b]">{current}</span>
  </div>
);

const CueTonePageShell = ({ children, fullWidth = false }) => (
  <div className={CUE_TONE_PAGE_WRAP}>
    <div className={fullWidth ? "w-full max-w-full mx-auto" : CUE_TONE_PAGE_INNER}>
      {children}
    </div>
  </div>
);

const wavFileNoteStyle = {
  fontSize: 12,
  color: C.mutedText,
  margin: 0,
  lineHeight: 1.45,
  whiteSpace: "normal",
  overflowWrap: "break-word",
  textAlign: "center",
  width: "100%",
};

const FieldRow = ({
  label,
  children,
  required,
  align = "center",
  labelWidth = 170,
  tooltipKey,
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
      <FxsFieldLabel tooltipKey={tooltipKey} tooltips={CUE_TONE_FIELD_TOOLTIPS}>
        {label}
      </FxsFieldLabel>
      {required && <span style={{ color: "#dc2626" }}> *</span>}
    </label>
    <div style={{ width: "min(100%, 320px)" }}>{children}</div>
  </div>
);

const CueToneFormCard = ({
  title,
  children,
  footer,
  fullWidthContent = false,
}) => (
  <div className={CUE_TONE_TABLE_CONTAINER}>
    <div className={CUE_TONE_BLUE_BAR}>
      <span>{title}</span>
    </div>
    <div className={footer ? `${CUE_TONE_FORM_BODY} pb-0` : `${CUE_TONE_FORM_BODY} pb-[12px]`}>
      <div
        className={`flex flex-col gap-[14px] ${
          fullWidthContent ? "w-full max-w-full m-0" : "max-w-[560px] mx-auto"
        }`}
      >
        {children}
      </div>
      {footer ? (
        <div className={CUE_TONE_FORM_FOOTER}>{footer}</div>
      ) : null}
    </div>
  </div>
);

const CueTonePage = () => {
  const [formData, setFormData] = useState(CUE_TONE_INITIAL_FORM);
  const [fileName, setFileName] = useState("No file chosen");
  const fileInputRef = useRef(null);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFormData((prev) => ({ ...prev, file }));
    } else {
      setFileName("No file chosen");
      setFormData((prev) => ({ ...prev, file: null }));
    }
  };

  const handleUpload = () => {
    if (!formData.file) {
      showToast("Please select a file to upload!", "error");
      return;
    }
    const fileExt = formData.file.name
      .substring(formData.file.name.lastIndexOf("."))
      .toLowerCase();
    if (!fileExt.match(/\.wav/i)) {
      showToast("Only wav files can be uploaded!", "error");
      return;
    }
    if (formData.file.size > 200 * 1024) {
      showToast("File size must be less than 200KB!", "error");
      return;
    }
    showToast("File uploaded successfully!");
  };

  return (
    <CueTonePageShell>
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
      <AdvancedBreadcrumb current="Cue Tone" />
      <CueToneFormCard title="Upload" fullWidthContent>
        <FieldRow label="Upload a file of cue tone" tooltipKey="fileType">          <FormControl size="small" fullWidth>
            <Select
              value={formData.fileType}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, fileType: e.target.value }))
              }
              sx={muiSelectSx}
            >
              {CUE_TONE_FILE_TYPES.map((opt) => (
                <MenuItem
                  key={opt.value}
                  value={opt.value}
                  sx={{ fontSize: 13 }}
                >
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </FieldRow>
        <FieldRow label="File" align="flex-start" tooltipKey="file">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
              width: "100%",
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".wav"
              onChange={handleFileChange}
              style={{ display: "none" }}
              id="cue-tone-file-input"
            />
            <Btn
              variant="cancel"
              onClick={() => fileInputRef.current?.click()}
              className="min-w-[100px]"
            >
              Choose file
            </Btn>
            <span style={{ fontSize: 13, color: C.mutedText }}>{fileName}</span>
            <Btn
              variant="primary"
              onClick={handleUpload}
              className="min-w-[100px]"
            >
              Upload
            </Btn>
          </div>
        </FieldRow>
        <p style={{ ...wavFileNoteStyle, color: "#dc2626" }}>
          Note: The file should be a wav file with 8000Hz sampling rate, 16-bit mono, A-law formatted, and less than 200KB in size.
        </p>
      </CueToneFormCard>
    </CueTonePageShell>
  );
};

export default CueTonePage;
