import React, { useState } from "react";
import {
  CDR_QUERY_INITIAL_FORM,
  PORT_OPTIONS,
  CALL_DIRECTION_OPTIONS,
  CDR_QUERY_FIELD_TOOLTIPS,
} from "../../../constants/CdrQueryConstants";
import {
  Alert,
  TextField,
  Select as MuiSelect,
  MenuItem,
  FormControl,
  Tooltip,
} from "@mui/material";
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

const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#9CA3AF",
  labelText: "#3E5475",
  valueText: "#0f172a",
  mutedText: "#94a3b8",
  strongText: "#0f172a",
  accent: "#3E5475",
  amber: "#dc2626",
};

const CARD_RADIUS = 10;

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
        borderRadius: 10,
        fontSize: 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "all 0.15s ease",
        height: 30,
        gap: 6,
        whiteSpace: "nowrap",
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.background = baseBg;
      }}
    >
      {children}
    </Component>
  );
};


const OUTLINED_BORDER = "rgba(0, 0, 0, 0.23)";
const OUTLINED_HOVER = "rgba(0, 0, 0, 0.87)";
const OUTLINED_FOCUS = "#1976d2";

const muiTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#fff",
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

const muiSelectInnerSx = {
  "& .MuiOutlinedInput-root": {
    minHeight: 36,
    backgroundColor: "#fff",
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
  backgroundColor: "#fff",
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


const advancedPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  boxSizing: "border-box",
};

const advancedPageInnerStyle = {
  width: "100%",
  maxWidth: 1000,
  margin: "0 auto",
};

const advancedTableContainerStyle = {
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

const advancedBlueBarStyle = {
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

const advancedFormBodyStyle = {
  padding: "12px 20px 0",
};

const advancedFormPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: C.pageBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 8,
  padding: 20,
};

const advancedFormInlineFooterStyle = {
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

const advancedFormBtnStyle = {
  minWidth: 110,
  height: 34,
  fontSize: 13,
  margin: 0,
  padding: "0 28px",
  lineHeight: "34px",
  boxSizing: "border-box",
};

const AdvancedBreadcrumb = ({ current }) => (
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
    <span>FXS</span>
    <span>&gt;</span>
    <span>Advanced</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>{current}</span>
  </div>
);

const AdvancedPageShell = ({ children, fullWidth = false }) => (
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

const AdvancedFormCard = ({
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

const CDR_LABEL_WIDTH = 190;
const CDR_FIELD_GAP = 16;

const CdrFieldRow = ({ label, children, tooltipKey }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: CDR_FIELD_GAP,
    }}
  >
    <label
      style={{
        width: CDR_LABEL_WIDTH,
        flexShrink: 0,
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        textAlign: "left",
      }}
    >
      <FxsFieldLabel tooltipKey={tooltipKey} tooltips={CDR_QUERY_FIELD_TOOLTIPS}>
        {label}
      </FxsFieldLabel>
    </label>
    <div style={{ flexShrink: 0 }}>{children}</div>
  </div>
);

const CdrQueryPage = () => {
  const [formData, setFormData] = useState(CDR_QUERY_INITIAL_FORM);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const alert = (msg) => {
    const isSuccess = /successfully/i.test(String(msg));
    showToast(msg, isSuccess ? "success" : "error");
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateKeyPress = (e) => {
    const key = e.keyCode || e.which;
    if ((key > 47 && key < 59) || key === 45 || key === 32) {
    } else if (key !== 8) {
      e.preventDefault();
    }
  };

  const handleStringKeyPress = (e) => {
    const key = e.keyCode || e.which;
    if (
      key === 32 ||
      key === 46 ||
      key === 95 ||
      key === 8 ||
      (key >= 48 && key <= 57) ||
      (key >= 65 && key <= 90) ||
      (key >= 97 && key <= 122)
    ) {
    } else {
      e.preventDefault();
    }
  };

  const handleNumberKeyPress = (e) => {
    const key = e.keyCode || e.which;
    if (key > 47 && key < 58) {
    } else if (key !== 8) {
      e.preventDefault();
    }
  };

  const handleQuery = () => {
    if (
      formData.startdate &&
      formData.enddate &&
      formData.startdate > formData.enddate
    ) {
      alert("The Ending Date should not be earlier than the Starting Date!");
      return;
    }

    const minTalkTime = Number(formData.mintalktime);
    const maxTalkTime = Number(formData.maxtalktime);
    if (
      formData.mintalktime &&
      formData.maxtalktime &&
      minTalkTime > maxTalkTime
    ) {
      alert(
        "The max talk duration should not be smaller than the min talk duration!",
      );
      return;
    }

    alert("Query submitted successfully!");
  };

  const compactFieldSx = {
    ...muiTextFieldSx,
    width: 132,
  };

  return (
    <AdvancedPageShell>
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
      <AdvancedBreadcrumb current="CDR Query" />
      <AdvancedFormCard
        title="CDR Query"
        footer={
          <Btn
            variant="primary"
            onClick={handleQuery}
            style={advancedFormBtnStyle}
          >
            Query
          </Btn>
        }
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            paddingTop: 8,
            paddingBottom: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              width: "fit-content",
              maxWidth: "100%",
            }}
          >
            <CdrFieldRow label="Starting Date" tooltipKey="startdate">
              <TextField
                id="startdate"
                type="date"
                value={formData.startdate || ""}
                onChange={(e) => handleInputChange("startdate", e.target.value)}
                size="small"
                variant="outlined"
                sx={compactFieldSx}
                inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
              />
            </CdrFieldRow>
            <CdrFieldRow label="Ending Date" tooltipKey="enddate">
              <TextField
                id="enddate"
                type="date"
                value={formData.enddate || ""}
                onChange={(e) => handleInputChange("enddate", e.target.value)}
                size="small"
                variant="outlined"
                sx={compactFieldSx}
                inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
              />
            </CdrFieldRow>
            <CdrFieldRow label="Port" tooltipKey="port">
              <FormControl size="small" sx={{ width: 132 }}>
                <MuiSelect
                  value={formData.port}
                  onChange={(e) => handleInputChange("port", e.target.value)}
                  sx={muiSelectSx}
                >
                  {PORT_OPTIONS.map((opt) => (
                    <MenuItem
                      key={opt.value}
                      value={opt.value}
                      sx={{ fontSize: 13 }}
                    >
                      {opt.label}
                    </MenuItem>
                  ))}
                </MuiSelect>
              </FormControl>
            </CdrFieldRow>
            <CdrFieldRow label="Call Direction" tooltipKey="billtype">
              <FormControl size="small" sx={{ width: 132 }}>
                <MuiSelect
                  value={formData.billtype}
                  onChange={(e) =>
                    handleInputChange("billtype", e.target.value)
                  }
                  sx={muiSelectSx}
                >
                  {CALL_DIRECTION_OPTIONS.map((opt) => (
                    <MenuItem
                      key={opt.value}
                      value={opt.value}
                      sx={{ fontSize: 13 }}
                    >
                      {opt.label}
                    </MenuItem>
                  ))}
                </MuiSelect>
              </FormControl>
            </CdrFieldRow>
            <CdrFieldRow label="CallerID" tooltipKey="callingnum">
              <TextField
                id="callingnum"
                value={formData.callingnum || ""}
                onChange={(e) =>
                  handleInputChange("callingnum", e.target.value)
                }
                onKeyPress={handleStringKeyPress}
                size="small"
                variant="outlined"
                sx={compactFieldSx}
                inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
              />
            </CdrFieldRow>
            <CdrFieldRow label="CalleeID" tooltipKey="callednum">
              <TextField
                id="callednum"
                value={formData.callednum || ""}
                onChange={(e) => handleInputChange("callednum", e.target.value)}
                onKeyPress={handleStringKeyPress}
                size="small"
                variant="outlined"
                sx={compactFieldSx}
                inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
              />
            </CdrFieldRow>
            <CdrFieldRow label="Call Duration(s)" tooltipKey="mintalktime">
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <TextField
                  id="mintalktime"
                  value={formData.mintalktime || ""}
                  onChange={(e) =>
                    handleInputChange("mintalktime", e.target.value)
                  }
                  onKeyPress={handleNumberKeyPress}
                  size="small"
                  variant="outlined"
                  sx={{ ...muiTextFieldSx, width: 54.5 }}
                  inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
                />
                <span style={{ fontSize: 13, color: C.mutedText }}>—</span>
                <TextField
                  id="maxtalktime"
                  value={formData.maxtalktime || ""}
                  onChange={(e) =>
                    handleInputChange("maxtalktime", e.target.value)
                  }
                  onKeyPress={handleNumberKeyPress}
                  size="small"
                  variant="outlined"
                  sx={{ ...muiTextFieldSx, width: 54.5 }}
                  inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
                />
              </div>
            </CdrFieldRow>
            <CdrFieldRow label="Keyword" tooltipKey="keyword">
              <TextField
                id="keyword"
                value={formData.keyword || ""}
                onChange={(e) => handleInputChange("keyword", e.target.value)}
                onKeyPress={handleStringKeyPress}
                size="small"
                variant="outlined"
                sx={compactFieldSx}
                inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
              />
            </CdrFieldRow>
          </div>
        </div>
      </AdvancedFormCard>
    </AdvancedPageShell>
  );
};

export default CdrQueryPage;
