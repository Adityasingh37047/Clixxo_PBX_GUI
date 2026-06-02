import React, { useState } from "react";
import {
  FUNCTION_KEY_FIELDS,
  getInitialFormState,
} from "../../../sections/advanced/constants/FunctionKeyConstants";
import { Alert, Checkbox, TextField } from "@mui/material";
import {
  Btn,
  C,
  checkboxSx,
  muiTextFieldSx,
  AdvancedBreadcrumb,
  AdvancedPageShell,
  AdvancedFormCard,
  advancedFormBtnStyle,
} from "../../../sections/advanced/advancedSharedUi";

const labelCellStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: C.labelText,
  textAlign: "left",
  verticalAlign: "middle",
};

const FUNCTION_KEY_SECTION_HEADING_COLOR = "#30415A";

const FunctionKeySectionHeading = ({ title }) => (
  <div style={{ margin: "16px 0 24px 0", position: "relative" }}>
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
          <div style={{ width: "100%", maxWidth: 700, margin: "0 auto" }}>
            <div style={{ width: "100%" }}>
              <table
                style={{ tableLayout: "fixed", width: "100%" }}
              >
                <colgroup>
                  <col style={{ width: "50%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "19%" }} />
                  <col style={{ width: "19%" }} />
                </colgroup>
                <tbody>
                  {/* Table Headers */}
                  <tr>
                    <td style={{ ...labelCellStyle, paddingLeft: 0 }}>
                      Function
                    </td>
                    <td style={{ ...labelCellStyle, textAlign: "center" }}>
                      Enable
                    </td>
                    <td style={labelCellStyle}>Function Key</td>
                    <td style={labelCellStyle}>Mode</td>
                  </tr>
                  <tr>
                    <td colSpan={4} style={{ height: "8px" }}></td>
                  </tr>

                  {/* Sections */}
                  {Object.entries(groupedFields).map(
                    ([sectionName, fields]) => (
                      <React.Fragment key={sectionName}>
                        {/* Section Header */}
                        <tr>
                          <td colSpan={4} style={{ padding: "12px 0 4px" }}>
                            <FunctionKeySectionHeading title={sectionName} />
                          </td>
                        </tr>

                        {/* Fields */}
                        {fields.map((field) => {
                          const enabled = formData[field.enableKey];
                          const mode = formData[field.modeKey];
                          const functionKey = formData[field.functionKeyKey];
                          const isDefaultMode = mode === "0";
                          const maxLength = field.isReboot ? 12 : 7;

                          return (
                            <tr key={field.id} style={{ height: "26px" }}>
                              <td style={{ ...labelCellStyle, paddingLeft: 0 }}>
                                {field.name}
                              </td>
                              <td style={{ textAlign: "center" }}>
                                <Checkbox
                                  size="small"
                                  checked={enabled}
                                  onChange={() => handleEnableChange(field)}
                                  sx={checkboxSx}
                                />
                              </td>
                              <td
                                style={{ paddingLeft: "0px", textAlign: "center" }}
                              >
                                <TextField
                                  id={field.functionKeyKey}
                                  value={functionKey}
                                  onChange={(e) =>
                                    handleFunctionKeyChange(
                                      field,
                                      e.target.value,
                                    )
                                  }
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
                              <td
                                style={{ paddingLeft: "0px", textAlign: "center" }}
                              >
                                <select
                                  value={mode}
                                  onChange={(e) =>
                                    handleModeChange(field, e.target.value)
                                  }
                                  disabled={!enabled}
                                  style={selectStyle(enabled)}
                                >
                                  <option value="0">Default</option>
                                  <option value="1">User-defined</option>
                                </select>
                              </td>
                            </tr>
                          );
                        })}
                        <tr>
                          <td colSpan={4} style={{ height: "8px" }}></td>
                        </tr>
                      </React.Fragment>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </div>
      </AdvancedFormCard>
    </AdvancedPageShell>
  );
};

export default FunctionKeyPage;
