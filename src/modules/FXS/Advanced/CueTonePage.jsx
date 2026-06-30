import React, { useState, useRef } from "react";
import { Alert, Tooltip } from "@mui/material";
import {
  CUE_TONE_FILE_TYPES,
  CUE_TONE_INITIAL_FORM,
  CUE_TONE_FIELD_TOOLTIPS,
  CUE_TONE_PAGE_BREADCRUMB_ROOT,
  CUE_TONE_PAGE_BREADCRUMB_SECTION,
  CUE_TONE_PAGE_TITLE,
  CUE_TONE_CARD_TITLE,
  CUE_TONE_NOTE_TEXT,
} from "../../../constants/CueToneConstants";

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

const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  cardShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
  divider: "#e2e6ec",
  labelText: "#3E5475",
  valueText: "#1f2937",
  mutedText: "#6b7280",
  strongText: "#1f2937",
  accent: "#3E5475",
  amber: "#dc2626",
  fieldBg: "#ffffff",
};

const CARD_RADIUS = 10;
const FIELD_RADIUS = 8;
const FIELD_CONTROL_HEIGHT = 36;

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
  form,
  component,
  title,
}) => {
  const styles = {
    default: {
      background: C.cardBg,
      color: C.valueText,
      border: "1px solid #9ca3af",
    },
    primary: {
      background:
        "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
      color: "#fff",
      border: "1px solid #5A6F8F",
      fontWeight: 600,
      fontSize: 15,
      textTransform: "none",
      padding: "6px 28px",
    },
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15,23,42,0.08)",
    },
    danger: {
      background: "#fef2f2",
      color: C.amber,
      border: "0.5px solid #fecaca",
    },
    outline: {
      background: C.cardBg,
      color: C.labelText,
      border: `1px solid ${C.cardBorder}`,
    },
  };
  const s = styles[variant] || styles.default;
  const hoverBg =
    {
      primary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      cancel: "#b6c2d3",
      danger: "#fca5a5",
      outline: "#e2e8f0",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const baseBg = extraStyle?.background ?? s.background;
  const baseShadow = extraStyle?.boxShadow ?? s.boxShadow ?? "none";
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      cancel: "#a3b1c2",
      danger: "#f87171",
      outline: "#d1d9e6",
      default: "#d1d5db",
    }[variant] || "#d1d5db";

  const clearPressStyle = (el) => {
    el.style.transform = "";
    el.style.boxShadow = baseShadow;
  };

  const applyPressStyle = (el) => {
    el.style.background = activeBg;
    el.style.transform = "translateY(1px) scale(0.98)";
    el.style.boxShadow =
      variant === "primary"
        ? "inset 0 2px 4px rgba(0, 0, 0, 0.25)"
        : variant === "cancel"
          ? "inset 0 2px 4px rgba(15, 23, 42, 0.15)"
          : "inset 0 1px 3px rgba(15, 23, 42, 0.12)";
  };

  const Component = component || "button";
  return (
    <Component
      type={type}
      form={form}
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 14px",
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition:
          "background 0.15s ease, transform 0.1s ease, box-shadow 0.1s ease",
        height: 30,
        gap: 6,
        whiteSpace: "nowrap",
        userSelect: "none",
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = baseBg;
        clearPressStyle(e.currentTarget);
      }}
      onMouseDown={(e) => {
        if (disabled) return;
        applyPressStyle(e.currentTarget);
      }}
      onMouseUp={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = hoverBg;
        clearPressStyle(e.currentTarget);
      }}
    >
      {children}
    </Component>
  );
};

const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";

const FOCUS_RING_SHADOW = () => `0 0 0 2px rgba(62, 84, 117, 0.15)`;

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
  el.style.boxShadow = FOCUS_RING_SHADOW();
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

const CUE_TONE_LABEL_WIDTH = 170;
const CUE_TONE_FIELD_WIDTH = 320;

const nativeFieldSelectStyle = {
  width: "100%",
  maxWidth: CUE_TONE_FIELD_WIDTH,
  height: FIELD_CONTROL_HEIGHT,
  minHeight: FIELD_CONTROL_HEIGHT,
  padding: "0 28px 0 12px",
  fontSize: 13,
  lineHeight: `${FIELD_CONTROL_HEIGHT - 2}px`,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: FIELD_RADIUS,
  outline: "none",
  backgroundColor: C.fieldBg,
  color: C.valueText,
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  appearance: "auto",
  cursor: "pointer",
};

const CueToneFieldRow = ({ label, tooltipKey, children, align = "center" }) => {
  const tooltip = tooltipKey ? CUE_TONE_FIELD_TOOLTIPS[tooltipKey] || "" : "";
  const labelNode = (
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: FIELD_LABEL_COLOR,
        width: CUE_TONE_LABEL_WIDTH,
        flexShrink: 0,
        textAlign: "left",
        lineHeight: 1.45,
        cursor: tooltip ? "help" : undefined,
        whiteSpace: "normal",
        paddingTop: align === "flex-start" ? 8 : 0,
      }}
    >
      {label}
    </label>
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: align,
        justifyContent: "center",
        gap: 100,
        width: "fit-content",
        maxWidth: "100%",
        minHeight: align === "flex-start" ? undefined : 32,
      }}
    >
      {tooltip ? (
        <Tooltip
          title={formatFieldTooltipTitle(tooltip)}
          {...FIELD_TOOLTIP_PROPS}
        >
          {labelNode}
        </Tooltip>
      ) : (
        labelNode
      )}
      <div
        style={{
          width: CUE_TONE_FIELD_WIDTH,
          maxWidth: "100%",
          flexShrink: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
};

const cueTonePageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  width: "100%",
  maxWidth: "100%",
  padding: 16,
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  boxSizing: "border-box",
};

const cueTonePageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
};

const cueToneCardStyle = {
  width: "100%",
  background: C.cardBg,
  borderRadius: CARD_RADIUS,
  overflow: "hidden",
  border: `1px solid ${C.cardBorder}`,
  boxShadow: C.cardShadow,
};

const advancedCardTitleBarStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: CARD_RADIUS,
  borderTopRightRadius: CARD_RADIUS,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  padding: "10px 28px",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  borderBottom: `1px solid ${C.divider}`,
  boxSizing: "border-box",
};

const cueToneFormBodyStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "24px 36px 28px",
  width: "100%",
  boxSizing: "border-box",
};

const cueToneFieldsColStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 20,
  width: "fit-content",
  maxWidth: "100%",
};

const cueToneNoteStyle = {
  fontSize: 12,
  color: C.amber,
  margin: 0,
  lineHeight: 1.45,
  whiteSpace: "normal",
  overflowWrap: "break-word",
  textAlign: "center",
  width: "100%",
};

const cueToneFileBtnStyle = { height: 30, fontSize: 12, minWidth: 100 };

const CueToneBreadcrumb = () => (
  <div
    style={{
      fontSize: 12,
      color: "#94a3b8",
      marginBottom: 16,
      fontWeight: 400,
      display: "flex",
      alignItems: "center",
      gap: 4,
      flexWrap: "wrap",
    }}
  >
    <span>{CUE_TONE_PAGE_BREADCRUMB_ROOT}</span>
    <span>&gt;</span>
    <span>{CUE_TONE_PAGE_BREADCRUMB_SECTION}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>
      {CUE_TONE_PAGE_TITLE}
    </span>
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    <div style={cueTonePageWrapStyle}>
      <div style={cueTonePageInnerStyle}>
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

        <CueToneBreadcrumb />

        <div style={cueToneCardStyle}>
          <div style={advancedCardTitleBarStyle}>
            <span>{CUE_TONE_CARD_TITLE}</span>
          </div>

          <div style={cueToneFormBodyStyle}>
            <div style={cueToneFieldsColStyle}>
              <CueToneFieldRow
                label="Upload a file of cue tone"
                tooltipKey="fileType"
              >
                <select
                  name="fileType"
                  value={formData.fileType}
                  onChange={handleInputChange}
                  style={nativeFieldSelectStyle}
                  {...nativeFieldInteraction}
                >
                  {CUE_TONE_FILE_TYPES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </CueToneFieldRow>

              <CueToneFieldRow
                label="File"
                align="flex-start"
                tooltipKey="file"
              >
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
                    style={cueToneFileBtnStyle}
                  >
                    Choose file
                  </Btn>
                  <span style={{ fontSize: 13, color: C.mutedText }}>
                    {fileName}
                  </span>
                  <Btn
                    variant="primary"
                    onClick={handleUpload}
                    style={cueToneFileBtnStyle}
                  >
                    Upload
                  </Btn>
                </div>
              </CueToneFieldRow>

              <p style={cueToneNoteStyle}>{CUE_TONE_NOTE_TEXT}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CueTonePage;
