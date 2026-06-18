import React, { useState } from "react";
import {
  FUNCTION_KEY_FIELDS,
  getInitialFormState,
} from "../../../constants/FunctionKeyConstants";
import { Alert, Checkbox, TextField } from "@mui/material";

// ── Local page UI (inlined from fxsSharedUi) ──
const C = {
  cardBg: "#ffffff",
  cardBorder: "#9CA3AF",
  labelText: "#3E5475",
  valueText: "#0f172a",
  mutedText: "#94a3b8",
};

const FUNCTION_KEY_PAGE_WRAP =
  "bg-[#f8fafc] min-h-[calc(100vh-80px)] p-[16px] box-border flex flex-col items-center";
const FUNCTION_KEY_PAGE_INNER = "w-full max-w-[1000px] mx-auto";
const FUNCTION_KEY_TABLE_CONTAINER =
  "w-full max-w-full mx-auto overflow-hidden rounded-[10px] border-[1.5px] border-[#9CA3AF] bg-white shadow-[0_4px_20px_rgba(15,23,42,0.06)] mb-[24px]";
const FUNCTION_KEY_BLUE_BAR =
  "flex w-full min-h-[44px] flex-wrap items-center justify-start gap-[12px] rounded-t-[10px] border-b border-[#9CA3AF] bg-white px-[14px] py-[7px] text-[13px] font-bold text-[#3E5475]";
const FUNCTION_KEY_FORM_BODY = "px-[20px] pt-[12px]";
const FUNCTION_KEY_FORM_FOOTER =
  "flex flex-wrap items-center justify-center gap-[12px] w-[calc(100%+40px)] -ml-[20px] -mr-[20px] mt-0 mb-0 border-t border-[#9CA3AF] box-border px-[20px] py-[10px]";

const BTN_FORM_PRIMARY =
  "inline-flex items-center justify-center box-border m-0 min-w-[110px] h-[34px] gap-[6px] px-[28px] py-0 rounded-[10px] text-[13px] font-semibold leading-[34px] whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)] disabled:cursor-not-allowed disabled:opacity-60";

const Btn = ({ children, onClick, disabled, variant = "formPrimary", type }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={BTN_FORM_PRIMARY}
  >
    {children}
  </button>
);

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

const checkboxSx = {
  padding: "4px",
  color: "#64748b",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
  "& .MuiSvgIcon-root": { fontSize: 18 },
};

const FunctionKeyBreadcrumb = ({ current }) => (
  <div className="mb-[16px] flex flex-wrap items-center gap-[4px] text-[12px] font-normal text-[#94a3b8]">
    <span>FXS</span>
    <span>&gt;</span>
    <span>Advanced</span>
    <span>&gt;</span>
    <span className="font-semibold text-[#1e293b]">{current}</span>
  </div>
);

const FunctionKeyPageShell = ({ children, fullWidth = false }) => (
  <div className={FUNCTION_KEY_PAGE_WRAP}>
    <div
      className={fullWidth ? "w-full max-w-full mx-auto" : FUNCTION_KEY_PAGE_INNER}
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

const FunctionKeyFormCard = ({
  title,
  children,
  footer,
  fullWidthContent = false,
}) => (
  <div className={FUNCTION_KEY_TABLE_CONTAINER}>
    <div className={FUNCTION_KEY_BLUE_BAR}>
      <span>{title}</span>
    </div>
    <div
      className={footer ? FUNCTION_KEY_FORM_BODY : `${FUNCTION_KEY_FORM_BODY} pb-[12px]`}
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
      {footer ? <div className={FUNCTION_KEY_FORM_FOOTER}>{footer}</div> : null}
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
          <td style={{ ...labelCellStyle, paddingLeft: 0 }}>{field.name}</td>
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
    <FunctionKeyPageShell>
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
      <FunctionKeyBreadcrumb current="Function Key" />
      <FunctionKeyFormCard
        title="Function Key"
        fullWidthContent
        footer={
          <Btn type="button" onClick={handleSave} variant="formPrimary">
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
      </FunctionKeyFormCard>
    </FunctionKeyPageShell>
  );
};

export default FunctionKeyPage;
