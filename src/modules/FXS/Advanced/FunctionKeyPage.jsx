import React, { useState } from "react";
import {
  FUNCTION_KEY_FIELDS,
  getInitialFormState,
  FUNCTION_KEY_FIELD_TOOLTIPS,
} from "../../../constants/FunctionKeyConstants";
import { Alert, Checkbox, TextField, Tooltip } from "@mui/material";
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


const checkboxSx = {
  padding: "4px",
  color: "#64748b",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
  "& .MuiSvgIcon-root": { fontSize: 18 },
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

const labelCellStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: C.labelText,
  textAlign: "left",
  verticalAlign: "middle",
};

/** Media Parameters header look; column alignment matches original layout */
const functionKeyTableHeaderBase = {
  fontSize: 12,
  fontWeight: 700,
  color: C.labelText,
  padding: "8px 8px 12px",
  boxSizing: "border-box",
  verticalAlign: "middle",
};

const FUNCTION_KEY_SECTION_HEADING_COLOR = "#30415A";

const FunctionKeySectionHeading = ({ title, isFirst = false }) => (
  <div
    style={{
      margin: isFirst ? "0 0 24px 0" : "16px 0 24px 0",
      position: "relative",
      width: "100%",
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
        color: FUNCTION_KEY_SECTION_HEADING_COLOR,
      }}
    >
      {title}
    </span>
  </div>
);

const centeredTableWrapStyle = {
  width: "100%",
  maxWidth: 700,
  margin: "0 auto",
};

const FunctionKeyPage = () => {
  const [formData, setFormData] = useState(getInitialFormState());
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const alert = (msg) => {
    const isSuccess = /successfully/i.test(String(msg));
    showToast(msg, isSuccess ? "success" : "error");
  };

  const handleEnableChange = (field) => {
    setFormData((prev) => {
      const newData = { ...prev };
      const enabled = !prev[field.enableKey];
      newData[field.enableKey] = enabled;

      if (!enabled) {
        // When disabled, mode should also be disabled (but keep value)
        // Function key field will be disabled
      } else if (prev[field.modeKey] === "0") {
        // If enabled and mode is Default, set default value
        newData[field.functionKeyKey] = field.defaultValue;
      }
      return newData;
    });
  };

  const handleModeChange = (field, value) => {
    setFormData((prev) => {
      const newData = { ...prev };
      newData[field.modeKey] = value;

      if (value === "0") {
        // Default mode: set to default value (input will be disabled)
        newData[field.functionKeyKey] = field.defaultValue;
      }
      // If User-defined, input will be enabled and user can edit
      return newData;
    });
  };

  const handleFunctionKeyChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field.functionKeyKey]: value }));
  };

  const handleKeyPress = (e) => {
    const key = e.keyCode || e.which;
    // Allow: backspace (8), delete (127), numbers (48-57), * (42), # (35)
    if (
      !(
        key === 8 ||
        key === 127 ||
        (key >= 48 && key <= 57) ||
        key === 42 ||
        key === 35
      )
    ) {
      e.preventDefault();
    }
  };

  const validateForm = () => {
    const pattern1 = /^\*\d{0,9}\*{0,1}$/; // Standard pattern: *123* or *123
    const pattern2 = /^\*#\d{0,9}\*#$/; // Reboot pattern: *#123*#

    const funkeyArr = [];

    for (const field of FUNCTION_KEY_FIELDS) {
      const enabled = formData[field.enableKey];
      const functionKey = formData[field.functionKeyKey];
      const mode = formData[field.modeKey];

      if (!enabled) continue;

      // Check pattern
      const pattern = field.isReboot ? pattern2 : pattern1;
      if (mode === "1" && !pattern.test(functionKey)) {
        const errorMsg = field.isReboot
          ? `Please input the function key for '${field.name}' in the right format, like *#88921532*#`
          : `Please input the function key for '${field.name}', in the right format, like ${field.defaultValue}`;
        alert(errorMsg);
        document.getElementById(field.functionKeyKey)?.focus();
        return false;
      }

      // Check for duplicates
      if (functionKey && funkeyArr.includes(functionKey)) {
        alert("Function key repeated!");
        document.getElementById(field.functionKeyKey)?.focus();
        return false;
      }
      if (functionKey) {
        funkeyArr.push(functionKey);
      }
    }

    return true;
  };

  const handleSave = () => {
    if (validateForm()) {
      alert("Settings saved successfully!");
    }
  };

  const handleReset = () => {
    setFormData(getInitialFormState());
  };

  const groupedFields = FUNCTION_KEY_FIELDS.reduce((acc, field) => {
    if (!acc[field.section]) {
      acc[field.section] = [];
    }
    acc[field.section].push(field);
    return acc;
  }, {});

  const sectionEntries = Object.entries(groupedFields);

  const selectStyle = (enabled) => ({
    height: 32,
    width: "100%",
    maxWidth: 130,
    fontSize: 13,
    borderRadius: 4,
    border: `1px solid ${C.cardBorder}`,
    backgroundColor: enabled ? "#fff" : "#f8fafc",
    color: enabled ? C.valueText : C.mutedText,
    padding: "0 8px",
    boxSizing: "border-box",
  });

  const tableColgroup = (
    <colgroup>
      <col style={{ width: "50%" }} />
      <col style={{ width: "12%" }} />
      <col style={{ width: "19%" }} />
      <col style={{ width: "19%" }} />
    </colgroup>
  );

  const renderFieldRows = (fields) =>
    fields.map((field) => {
      const enabled = formData[field.enableKey];
      const mode = formData[field.modeKey];
      const functionKey = formData[field.functionKeyKey];
      const isDefaultMode = mode === "0";
      const maxLength = field.isReboot ? 12 : 7;

      return (
        <tr key={field.id} style={{ height: "26px" }}>
          <td style={{ ...labelCellStyle, paddingLeft: 0 }}>
            <FxsFieldLabel
              tooltipKey={field.functionKeyKey}
              tooltips={FUNCTION_KEY_FIELD_TOOLTIPS}
            >
              {field.name}
            </FxsFieldLabel>
          </td>
          <td style={{ textAlign: "center" }}>
            <Checkbox
              size="small"
              checked={enabled}
              onChange={() => handleEnableChange(field)}
              sx={checkboxSx}
            />
          </td>
          <td style={{ paddingLeft: "0px", textAlign: "center" }}>
            <TextField
              id={field.functionKeyKey}
              value={functionKey}
              onChange={(e) => handleFunctionKeyChange(field, e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={!enabled || isDefaultMode}
              inputProps={{
                maxLength,
                style: { fontSize: 14, padding: "4px 8px" },
              }}
              sx={{
                width: "100%",
                maxWidth: 145,
                ...muiTextFieldSx,
              }}
              variant="outlined"
              size="small"
            />
          </td>
          <td style={{ paddingLeft: "0px", textAlign: "center" }}>
            <select
              value={mode}
              onChange={(e) => handleModeChange(field, e.target.value)}
              disabled={!enabled}
              style={selectStyle(enabled)}
            >
              <option value="0">Default</option>
              <option value="1">User-defined</option>
            </select>
          </td>
        </tr>
      );
    });

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
      <AdvancedBreadcrumb current="Function Key" />
      <AdvancedFormCard
        title="Function Key"
        fullWidthContent
        footer={
          <Btn
            variant="primary"
            onClick={handleSave}
            style={advancedFormBtnStyle}
          >
            Save
          </Btn>
        }
      >
        <div style={{ width: "100%", paddingBottom: 16 }}>
          <div style={centeredTableWrapStyle}>
            <table style={{ tableLayout: "fixed", width: "100%" }}>
              {tableColgroup}
              <tbody>
                <tr>
                  <td
                    style={{
                      ...functionKeyTableHeaderBase,
                      textAlign: "left",
                      paddingLeft: 0,
                    }}
                  >
                    Function
                  </td>
                  <td
                    style={{
                      ...functionKeyTableHeaderBase,
                      textAlign: "center",
                    }}
                  >
                    Enable
                  </td>
                  <td
                    style={{
                      ...functionKeyTableHeaderBase,
                      textAlign: "left",
                    }}
                  >
                    Function Key
                  </td>
                  <td
                    style={{
                      ...functionKeyTableHeaderBase,
                      textAlign: "left",
                    }}
                  >
                    Mode
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {sectionEntries.map(([sectionName, fields], sectionIdx) => {
            const isLastSection = sectionIdx === sectionEntries.length - 1;
            return (
              <React.Fragment key={sectionName}>
                <FunctionKeySectionHeading
                  title={sectionName}
                  isFirst={sectionIdx === 0}
                />
                <div style={centeredTableWrapStyle}>
                  <table style={{ tableLayout: "fixed", width: "100%" }}>
                    {tableColgroup}
                    <tbody>
                      {renderFieldRows(fields)}
                      {!isLastSection && (
                        <tr>
                          <td colSpan={4} style={{ height: "8px" }}></td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </AdvancedFormCard>
    </AdvancedPageShell>
  );
};

export default FunctionKeyPage;
