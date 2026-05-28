import React, { useState } from "react";
import {
  FUNCTION_KEY_FIELDS,
  getInitialFormState,
} from "../../../sections/advanced/constants/FunctionKeyConstants"; // Adjust path if needed
import {
  TextField,
  Button,
  Select as MuiSelect,
  MenuItem,
  FormControl,
  Checkbox,
} from "@mui/material";

// ── Color Palette (CDR / PBX Admin Theme) ───────────────────────────────────
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#e2e8f0",

  labelText: "#64748b",
  valueText: "#0f172a",
  mutedText: "#94a3b8",

  accent: "#2e2f31",

  successGreen: "#22c55e",
  errorRed: "#ef4444",

  purple: "#8b5cf6",
};

// ── Shared UI Components ──────────────────────────────────────────────────────
const SectionHeading = ({ title }) => (
  <div style={{ margin: "24px 0 16px 0", position: "relative" }}>
    <div style={{ borderTop: `1px solid ${C.cardBorder}` }} />
    <span
      style={{
        position: "absolute",
        top: -10,
        left: 0,
        background: "#fff",
        paddingRight: 8,
        fontSize: 13,
        fontWeight: 600,
        color: C.mutedText,
      }}
    >
      {title}
    </span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────

const FunctionKeyPage = () => {
  const [formData, setFormData] = useState(getInitialFormState());
  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleEnableChange = (field) => {
    setFormData((prev) => {
      const newData = { ...prev };
      const enabled = !prev[field.enableKey];
      newData[field.enableKey] = enabled;

      if (!enabled) {
        // Keeps value, but disables fields (handled in render)
      } else if (prev[field.modeKey] === "0") {
        // If enabled and mode is Default, reset to default value
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
        // Default mode: reset to default value
        newData[field.functionKeyKey] = field.defaultValue;
      }
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
          : `Please input the function key for '${field.name}' in the right format, like ${field.defaultValue}`;
        showMessage("error", errorMsg);
        document.getElementById(field.functionKeyKey)?.focus();
        return false;
      }

      // Check for duplicates
      if (functionKey && funkeyArr.includes(functionKey)) {
        showMessage("error", `Function key repeated for '${field.name}'!`);
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
      showMessage("success", "Settings saved successfully!");
    }
  };

  const groupedFields = FUNCTION_KEY_FIELDS.reduce((acc, field) => {
    if (!acc[field.section]) {
      acc[field.section] = [];
    }
    acc[field.section].push(field);
    return acc;
  }, {});

  return (
    <div
      style={{
        backgroundColor: C.pageBg,
        minHeight: "calc(100vh - 80px)",
        padding: 16,
      }}
    >
      <div style={{ maxWidth: "100%", margin: "0 auto" }}>
        {/* Error / Success Banner */}
        {message.text && (
          <div
            style={{
              background:
                message.type === "error"
                  ? "#fef2f2"
                  : message.type === "success"
                    ? "#f0fdf4"
                    : "#eff6ff",
              borderLeft: `3px solid ${message.type === "error" ? "#f87171" : message.type === "success" ? "#4ade80" : "#60a5fa"}`,
              color:
                message.type === "error"
                  ? "#b91c1c"
                  : message.type === "success"
                    ? "#166534"
                    : "#1e40af",
              padding: "10px 14px",
              borderRadius: 6,
              marginBottom: 12,
              fontSize: 13,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>{message.text}</span>
            <span
              onClick={() => setMessage({ type: "", text: "" })}
              style={{ cursor: "pointer", fontSize: 16 }}
            >
              ✕
            </span>
          </div>
        )}

        {/* Breadcrumb */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 11, color: C.mutedText }}>
            FXS &rsaquo; Advanced &rsaquo;{" "}
            <span style={{ color: C.valueText, fontWeight: 600 }}>
              Function Key
            </span>
          </div>
        </div>

        {/* Main Card */}
        <div
          style={{
            background: C.cardBg,
            border: `1px solid ${C.cardBorder}`,
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ padding: "24px 28px" }}>
            {Object.entries(groupedFields).map(
              ([sectionName, fields], sIdx) => (
                <div
                  key={sectionName}
                  style={{
                    marginBottom:
                      sIdx === Object.entries(groupedFields).length - 1
                        ? 0
                        : 32,
                  }}
                >
                  <SectionHeading title={sectionName} />

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {/* Pseudo Table Header for visual alignment */}
                    {sIdx === 0 && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          borderBottom: `1px solid ${C.cardBorder}`,
                          paddingBottom: 8,
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 280,
                            fontSize: 12,
                            fontWeight: 700,
                            color: C.mutedText,
                          }}
                        >
                          FUNCTION
                        </div>
                        <div
                          style={{
                            width: 80,
                            fontSize: 12,
                            fontWeight: 700,
                            color: C.mutedText,
                            textAlign: "center",
                          }}
                        >
                          ENABLE
                        </div>
                        <div
                          style={{
                            width: 160,
                            fontSize: 12,
                            fontWeight: 700,
                            color: C.mutedText,
                            paddingLeft: 16,
                          }}
                        >
                          FUNCTION KEY
                        </div>
                        <div
                          style={{
                            flex: 1,
                            fontSize: 12,
                            fontWeight: 700,
                            color: C.mutedText,
                          }}
                        >
                          MODE
                        </div>
                      </div>
                    )}

                    {fields.map((field) => {
                      const enabled = formData[field.enableKey];
                      const mode = formData[field.modeKey];
                      const functionKey = formData[field.functionKeyKey];
                      const isDefaultMode = mode === "0";
                      const maxLength = field.isReboot ? 12 : 7;

                      return (
                        <div
                          key={field.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            padding: "4px 0",
                            borderBottom: "0.5px solid #edf2f7",
                          }}
                        >
                          {/* Function Name */}
                          <div
                            style={{
                              width: 280,
                              fontSize: 13,
                              fontWeight: 600,
                              color: C.labelText,
                            }}
                          >
                            {field.name}
                          </div>

                          {/* Enable Checkbox */}
                          <div
                            style={{
                              width: 80,
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                          <Checkbox
  checked={enabled}
  onChange={() => handleEnableChange(field)}
  size="small"
  sx={{
    padding: "1px",
    color: "#64748b",

    "&.Mui-checked": {
      color: "#0284c7",
    },

    "&.MuiCheckbox-indeterminate": {
      color: "#0284c7",
    },
  }}
/>
                          </div>

                          {/* Function Key Text Input */}
                          <div style={{ width: 160, paddingLeft: 16 }}>
                            <TextField
                              id={field.functionKeyKey}
                              size="small"
                              fullWidth
                              value={functionKey || ""}
                              onChange={(e) =>
                                handleFunctionKeyChange(field, e.target.value)
                              }
                              onKeyPress={handleKeyPress}
                              disabled={!enabled || isDefaultMode}
                              inputProps={{
                                maxLength,
                                style: {
                                  fontSize: 13,
                                  padding: "6px 8px",
                                  background:
                                    !enabled || isDefaultMode
                                      ? "#f1f5f9"
                                      : "#fff",
                                  color: C.valueText,
                                },
                              }}
                            />
                          </div>

                          {/* Mode Select */}
                          <div style={{ flex: 1, paddingLeft: 16 }}>
                            <FormControl size="small" sx={{ width: 160 }}>
                              <MuiSelect
                                value={mode || "0"}
                                onChange={(e) =>
                                  handleModeChange(field, e.target.value)
                                }
                                disabled={!enabled}
                                sx={{
                                  fontSize: 13,
                                  background: !enabled ? "#f1f5f9" : "#fff",
                                }}
                              >
                                <MenuItem value="0" sx={{ fontSize: 13 }}>
                                  Default
                                </MenuItem>
                                <MenuItem value="1" sx={{ fontSize: 13 }}>
                                  User-defined
                                </MenuItem>
                              </MuiSelect>
                            </FormControl>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ),
            )}
          </div>

          {/* Bottom Actions Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              padding: "16px 24px",
              borderTop: `1px solid ${C.cardBorder}`,
              background: "#f8fafc",
            }}
          >
        <Button
  variant="contained"
  onClick={handleSave}
  sx={{
    background:
      "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
    color: "#fff",
    border: "1px solid #5A6F8F",
    boxShadow: "0 2px 8px #3E5475",

    fontWeight: 600,
    fontSize: 13,
    textTransform: "none",

    padding: "8px 28px",
    borderRadius: "6px",

    "&:hover": {
      background:
        "linear-gradient(to bottom, #647A9B 0%, #4A6284 60%, #344A67 100%)",
      opacity: 0.85,
    },

    "&:disabled": {
      background: "#94a3b8",
      color: "#e2e8f0",
      border: "1px solid #94a3b8",
    },
  }}
>
  Save Settings
</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FunctionKeyPage;
