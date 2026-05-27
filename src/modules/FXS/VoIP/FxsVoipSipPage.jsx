import React, { useState } from "react";
import {
  Alert,
  Button,
  FormControl,
  MenuItem,
  Select as MuiSelect,
  Checkbox,
  TextField,
} from "@mui/material";
import {
  SIP_SETTINGS_FIELDS,
  SIP_SETTINGS_NOTE,
} from "../../../sections/voip/constants/SipSipConstants"; // Update path if needed

// ── Color Palette (CDR / PBX Admin Theme) ───────────────────────────────────
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#e2e8f0",
  labelText: "#64748b",
  valueText: "#0f172a",
  mutedText: "#94a3b8",
  accent: "#2563eb",
  successGreen: "#22c55e",
  errorRed: "#ef4444",
  purple: "#8b5cf6",
};


// ── Shared UI Components ──────────────────────────────────────────────────────
const FieldRow = ({ label, children, required, align = "center" }) => (
  <div style={{ display: "flex", alignItems: align, gap: 12, minHeight: 32 }}>
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: 220, // Slightly wider for SIP setting labels
        flexShrink: 0,
        paddingTop: align === "flex-start" ? 8 : 0,
      }}
    >
      {label} {required && <span style={{ color: C.errorRed }}>*</span>}
    </label>
    <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
  </div>
);

const SectionHeading = ({ title }) => (
  <div style={{ margin: "16px 0 24px 0", position: "relative" }}>
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

const getInitialState = () => {
  const state = {};
  SIP_SETTINGS_FIELDS.forEach((f) => {
    if (f.type === "select") {
      state[f.key] = f.options[0] || f.default || "";
    } else if (f.type === "checkbox") {
      state[f.key] = f.default || false;
    } else if (f.type === "readonly") {
      state[f.key] = f.default || "";
    } else {
      state[f.key] = f.default || "";
    }
  });
  return state;
};

const FxsVoipSipPage = () => {
  const [form, setForm] = useState(getInitialState());
  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleChange = (key, value) => {
    const fieldDef = SIP_SETTINGS_FIELDS.find((f) => f.key === key);
    if (fieldDef && fieldDef.validation === "integer") {
      if (value === "" || /^\d+$/.test(value)) {
        setForm((prev) => ({ ...prev, [key]: value }));
      }
    } else {
      setForm((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleCheckbox = (key) => {
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    // API Call goes here
    showMessage("success", "Settings saved successfully!");
  };

  const handleReset = () => {
    setForm(getInitialState());
  };

  // Check if field should be shown based on conditional logic
  const shouldShowField = (field) => {
    if (!field.conditional) return true;

    const conditionalValue = form[field.conditional];

    if (field.conditionalValues) {
      return field.conditionalValues.includes(conditionalValue);
    } else if (field.conditionalValue !== undefined) {
      return conditionalValue === field.conditionalValue;
    } else {
      return !!conditionalValue;
    }
  };

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
          <Alert
            severity={message.type === "error" ? "error" : message.type === "success" ? "success" : "info"}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={{
              position: "fixed",
              top: 20,
              right: 20,
              zIndex: 9999,
              minWidth: 300,
              boxShadow: 3,
            }}
          >
            {message.text}
          </Alert>
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
            FXS &rsaquo; VoIP &rsaquo;{" "}
            <span style={{ color: C.valueText, fontWeight: 600 }}>
              SIP
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
            <SectionHeading title="SIP Settings" />

            {SIP_SETTINGS_NOTE && (
              <div
                style={{ fontSize: 12, color: C.mutedText, marginBottom: 20 }}
              >
                {SIP_SETTINGS_NOTE}
              </div>
            )}

            {/* 2-Column Grid Layout for Form Fields */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px 40px",
              }}
            >
              {SIP_SETTINGS_FIELDS.map((field) => {
                if (!shouldShowField(field)) return null;

                return (
                  <div
                    key={field.key}
                    style={{ display: "flex", flexDirection: "column" }}
                  >
                    <FieldRow
                      label={field.label}
                      align={
                        field.type === "checkbox" ? "center" : "flex-start"
                      }
                    >
                      {/* Readonly Field */}
                      {field.type === "readonly" && (
                        <TextField
                          size="small"
                          fullWidth
                          disabled
                          value={form[field.key] || ""}
                          inputProps={{
                            style: {
                              fontSize: 13,
                              padding: "6px 8px",
                              background: "#f1f5f9",
                              color: C.valueText,
                            },
                          }}
                        />
                      )}

                      {/* Text / Number Input */}
                      {field.type === "text" && (
                        <TextField
                          size="small"
                          fullWidth
                          value={form[field.key] || ""}
                          onChange={(e) =>
                            handleChange(field.key, e.target.value)
                          }
                          inputProps={{
                            style: { fontSize: 13, padding: "6px 8px" },
                          }}
                        />
                      )}

                      {/* Select Dropdown */}
                      {field.type === "select" && (
                        <FormControl size="small" fullWidth>
                          <MuiSelect
                            value={form[field.key] || ""}
                            onChange={(e) =>
                              handleChange(field.key, e.target.value)
                            }
                            sx={{ fontSize: 13 }}
                          >
                            {field.options.map((opt) => (
                              <MenuItem
                                key={opt}
                                value={opt}
                                sx={{ fontSize: 13 }}
                              >
                                {opt}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </FormControl>
                      )}

                     {/* Checkbox */}
{field.type === "checkbox" && (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
    }}
  >
    <Checkbox
      checked={!!form[field.key]}
      onChange={() => handleCheckbox(field.key)}
      size="small"
      sx={{
        padding: "1px",
        color: "#64748b",
        "&.Mui-checked": { color: "#0284c7" },
        "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
      }}
    />

    <span
      style={{
        fontSize: 13,
        color: C.valueText,
        cursor: "pointer",
        userSelect: "none",
      }}
      onClick={() => handleCheckbox(field.key)}
    >
      Enable
    </span>
  </div>
)}

                      {/* Helper Text */}
                      {field.helper && (
                        <div
                          style={{
                            fontSize: 11,
                            color: C.errorRed,
                            marginTop: 6,
                            lineHeight: 1.4,
                          }}
                        >
                          {field.helper}
                        </div>
                      )}
                    </FieldRow>
                  </div>
                );
              })}
            </div>
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
    minWidth: 120,
    borderRadius: "6px",
    "&:hover": {
      background:
        "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
      opacity: 0.85,
    },
  }}
>
  Save Settings
</Button>
          <Button
  variant="outlined"
  onClick={handleReset}
  sx={{
    background: "#cbd5e1",
    color: "#374151",
    border: "1px solid #cbd5e1",
    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
    fontWeight: 600,
    fontSize: 13,
    textTransform: "none",
    padding: "8px 28px",
    minWidth: 110,
    borderRadius: "6px",
    "&:hover": {
      background: "#cbd5e1",
      border: "1px solid #cbd5e1",
      opacity: 0.85,
    },
  }}
>
  Reset
</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FxsVoipSipPage;
