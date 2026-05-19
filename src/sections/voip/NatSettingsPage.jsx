import React, { useState } from "react";
import {
  Button,
  FormControl,
  MenuItem,
  Select as MuiSelect,
  Checkbox,
  TextField,
} from "@mui/material";
import {
  NAT_SETTINGS_FIELDS,
  NAT_SETTINGS_NOTE,
} from "./constants/NatSettingsConstants"; // Adjust path if needed

// ── Color Palette (CDR / PBX Admin Theme) ───────────────────────────────────
const C = {
  pageBg: "#eef2f7",
  cardBg: "#ffffff",
  cardBorder: "#9ca3af",
  labelText: "#1e293b",
  valueText: "#1e293b",
  mutedText: "#94a3b8",
  accent: "#1e293b",
  successGreen: "#16a34a",
  errorRed: "#dc2626",
  amber: "#d97706",
};

// ── Shared UI Components ──────────────────────────────────────────────────────
const FieldRow = ({ label, children, required, align = "center" }) => (
  <div style={{ display: "flex", alignItems: align, gap: 12, minHeight: 32 }}>
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: 220, // Sufficient width for NAT setting labels
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

const getInitialState = () => {
  const state = {};
  NAT_SETTINGS_FIELDS.forEach((f) => {
    if (f.type === "select") {
      state[f.key] = f.default || f.options[0] || "";
    } else if (f.type === "checkbox") {
      state[f.key] = f.default !== undefined ? f.default : false;
    } else if (f.type === "readonly") {
      state[f.key] = f.default || "";
    } else {
      state[f.key] = f.default || "";
    }
  });
  return state;
};

const NatSettingsPage = () => {
  const [form, setForm] = useState(getInitialState());
  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleChange = (key, value) => {
    const fieldDef = NAT_SETTINGS_FIELDS.find((f) => f.key === key);
    if (fieldDef && fieldDef.validation === "integer") {
      if (value === "" || /^\d+$/.test(value)) {
        setForm((prev) => ({ ...prev, [key]: value }));
      }
    } else {
      setForm((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleCheckbox = (key) => {
    // Prevent checking/unchecking Auto Detect NAT IP when Learn NAT is unchecked
    if (key === "autoDetectNatIp" && !form.learnNat) {
      return;
    }

    setForm((prev) => {
      const newValue = !prev[key];
      const updates = { [key]: newValue };

      // When Learn NAT is unchecked, uncheck Auto Detect NAT IP
      if (key === "learnNat" && !newValue) {
        updates.autoDetectNatIp = false;
      }

      return { ...prev, ...updates };
    });
  };

  const handleSave = () => {
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

  // Group fields by section and method
  const groupedFields = NAT_SETTINGS_FIELDS.reduce((acc, field) => {
    if (!shouldShowField(field)) return acc;

    const sectionKey = field.section;
    if (!acc[sectionKey]) {
      acc[sectionKey] = {};
    }

    const methodKey = field.method || "no-method";
    if (!acc[sectionKey][methodKey]) {
      acc[sectionKey][methodKey] = [];
    }

    acc[sectionKey][methodKey].push(field);
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
            FXS &rsaquo; VoIP &rsaquo;{" "}
            <span style={{ color: C.valueText, fontWeight: 600 }}>
              NAT Settings
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
              ([sectionName, methods], sectionIdx) => (
                <div key={sectionName} style={{ marginBottom: 32 }}>
                  {/* Line-Cut Section Heading */}
                  <SectionHeading title={sectionName} />

                  {Object.entries(methods).map(
                    ([methodName, fields], methodIdx) => (
                      <div
                        key={`${sectionName}-${methodName}`}
                        style={{
                          marginBottom: methodName !== "no-method" ? 24 : 0,
                        }}
                      >
                        {/* Method Sub-Heading (if applicable) */}
                        {methodName !== "no-method" && (
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: C.accent,
                              marginBottom: 16,
                              borderBottom: `1px dashed ${C.cardBorder}`,
                              paddingBottom: 4,
                            }}
                          >
                            {methodName}
                          </div>
                        )}

                        {/* 2-Column Grid Layout for Fields */}
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "16px 40px",
                          }}
                        >
                          {fields.map((field) => {
                            const isDisabledCheckbox =
                              field.key === "autoDetectNatIp" && !form.learnNat;

                            return (
                              <div
                                key={field.key}
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                }}
                              >
                                <FieldRow
                                  label={field.label}
                                  align={
                                    field.type === "checkbox"
                                      ? "center"
                                      : "flex-start"
                                  }
                                >
                                  {/* Readonly Field */}
                                  {field.type === "readonly" && (
                                    <TextField
                                      size="small"
                                      fullWidth
                                      disabled
                                      value={
                                        form[field.key] || field.default || ""
                                      }
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
                                        style: {
                                          fontSize: 13,
                                          padding: "6px 8px",
                                        },
                                      }}
                                    />
                                  )}

                                  {/* Select Dropdown */}
                                  {field.type === "select" && (
                                    <FormControl size="small" fullWidth>
                                      <MuiSelect
                                        value={form[field.key] || ""}
                                        onChange={(e) =>
                                          handleChange(
                                            field.key,
                                            e.target.value,
                                          )
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
                                        onChange={() =>
                                          handleCheckbox(field.key)
                                        }
                                        disabled={isDisabledCheckbox}
                                        size="small"
                                        sx={{
                                          padding: "2px",
                                          color: C.accent,
                                          "&.Mui-checked": { color: C.accent },
                                        }}
                                      />
                                      <span
                                        style={{
                                          fontSize: 13,
                                          color: C.valueText,
                                          cursor: isDisabledCheckbox
                                            ? "not-allowed"
                                            : "pointer",
                                          opacity: isDisabledCheckbox ? 0.6 : 1,
                                        }}
                                        onClick={() => {
                                          if (!isDisabledCheckbox)
                                            handleCheckbox(field.key);
                                        }}
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
                    ),
                  )}
                </div>
              ),
            )}

            {/* Note Section */}
            {NAT_SETTINGS_NOTE && (
              <div
                style={{
                  marginTop: 24,
                  fontSize: 12,
                  color: C.mutedText,
                  lineHeight: 1.6,
                  whiteSpace: "pre-line",
                  background: "#f8fafc",
                  padding: "12px 16px",
                  borderRadius: 6,
                  border: `1px solid #e2e8f0`,
                }}
              >
                <span style={{ fontWeight: 600, color: C.labelText }}>
                  Note:
                </span>
                <br />
                {NAT_SETTINGS_NOTE}
              </div>
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
                background: "#1e2d42",
                color: "#fff",
                fontWeight: 600,
                fontSize: 13,
                textTransform: "none",
                padding: "6px 32px",
                minWidth: 120,
                "&:hover": { background: "#0f172a" },
              }}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              onClick={handleReset}
              sx={{
                color: "#1e293b",
                borderColor: "#9ca3af",
                fontWeight: 600,
                fontSize: 13,
                textTransform: "none",
                padding: "6px 32px",
                minWidth: 100,
                "&:hover": { borderColor: "#1e293b", background: "#f1f5f9" },
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

export default NatSettingsPage;
