import React, { useState, useEffect, useRef } from "react";
import { CircularProgress, TextField, Alert } from "@mui/material";
import { getFeatureCodes, updateFeatureCodes } from "../api/apiService";
import {
  FEATURE_CODE_SECTIONS,
  FEATURE_CODE_INITIAL_FORM,
  FORM_TO_API,
  API_TO_FORM,
  NUMERIC_KEYS,
} from "../constants/FeatureCodeConstants";

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
const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
}) => {
  const variants = {
    default: {
      background: "#1e2d42",
      color: "#fff",
      border: "1px solid #162233",
    },
    outline: {
      background: C.cardBg,
      color: C.labelText,
      border: `0.5px solid ${C.cardBorder}`,
    },
    danger: {
      background: "#fef2f2",
      color: C.errorRed,
      border: `0.5px solid #fecaca`,
    },
    accent: {
      background: C.cardBg,
      color: C.accent,
      border: `0.5px solid ${C.accent}`,
    },
  };
  const s = variants[variant] || variants.default;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        ...s,
        fontSize: 13,
        fontWeight: 600,
        padding: "8px 24px",
        borderRadius: 6,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        transition: "opacity 0.15s ease",
        whiteSpace: "nowrap",
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.opacity = "0.82";
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.opacity = "1";
      }}
    >
      {children}
    </button>
  );
};

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

const FieldRow = ({ label, children, required, align = "center" }) => (
  <div style={{ display: "flex", alignItems: align, gap: 12, minHeight: 32 }}>
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: 220,
        flexShrink: 0,
        paddingTop: align === "flex-start" ? 8 : 0,
      }}
    >
      {label} {required && <span style={{ color: C.errorRed }}>*</span>}
    </label>
    <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
  </div>
);

// ── Data Transformation Helpers ──────────────────────────────────────────────
const apiToForm = (apiData) => {
  const form = { ...FEATURE_CODE_INITIAL_FORM };
  Object.entries(apiData).forEach(([apiKey, val]) => {
    const formKey = API_TO_FORM[apiKey];
    if (formKey !== undefined && val !== null && val !== undefined) {
      form[formKey] = String(val);
    }
  });
  return form;
};

const formToApi = (form) => {
  const data = {};
  Object.entries(FORM_TO_API).forEach(([formKey, apiKey]) => {
    const val = form[formKey];
    if (val === "" || val === null || val === undefined) {
      data[apiKey] = apiKey === "agent_free_busy_ivr" ? null : val;
    } else {
      data[apiKey] = NUMERIC_KEYS.has(formKey) ? Number(val) : val;
    }
  });
  return data;
};

// ─────────────────────────────────────────────────────────────────────────────

const FeatureCodePage = () => {
  const [form, setForm] = useState({ ...FEATURE_CODE_INITIAL_FORM });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const hasLoaded = useRef(false);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleChange = (key, val) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getFeatureCodes();
      if (res?.response && res?.message && typeof res.message === "object") {
        setForm(apiToForm(res.message));
        setLastUpdated(new Date());
      } else {
        showMessage("error", "Failed to load feature codes.");
      }
    } catch (e) {
      showMessage("error", "Failed to load feature codes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      loadData();
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateFeatureCodes(formToApi(form));
      if (res?.response) {
        showMessage("success", "Feature codes saved successfully.");
        if (res.message && typeof res.message === "object") {
          setForm(apiToForm(res.message));
        }
        setLastUpdated(new Date());
      } else {
        showMessage(
          "error",
          typeof res?.message === "string" ? res.message : "Save failed.",
        );
      }
    } catch (e) {
      showMessage("error", e.message || "Save failed.");
    } finally {
      setSaving(false);
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
            severity={message.type}
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

        {/* Breadcrumb + Last Updated */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 11, color: C.mutedText }}>
            PBX &rsaquo; Feature Codes &rsaquo;{" "}
            <span style={{ color: "#1e293b", fontWeight: 600 }}>
              Feature Codes
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
          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: 60,
              }}
            >
              <CircularProgress size={30} style={{ color: C.accent }} />
            </div>
          ) : (
            <div style={{ padding: "20px 24px" }}>
              {FEATURE_CODE_SECTIONS.map((section, sIdx) => (
                <div
                  key={section.title}
                  style={{
                    marginBottom:
                      sIdx === FEATURE_CODE_SECTIONS.length - 1 ? 0 : 24,
                  }}
                >
                  <SectionHeading title={section.title} />
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "16px 40px",
                    }}
                  >
                    {/* Process fields into two columns to maintain Top-to-Bottom flow */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                      }}
                    >
                      {section.fields.map((row) => {
                        // Assuming your original logic groups fields by rows. We flatten them into columns.
                        // Here we take the left field of the row.
                        const field = row[0];
                        if (field && !field.colRight) {
                          return (
                            <FieldRow key={field.key} label={field.label}>
                              <TextField
                                size="small"
                                fullWidth
                                type={
                                  field.type === "number" ? "number" : "text"
                                }
                                value={form[field.key] ?? ""}
                                onChange={(e) =>
                                  handleChange(field.key, e.target.value)
                                }
                                inputProps={{
                                  style: { fontSize: 13, padding: "6px 8px" },
                                }}
                              />
                            </FieldRow>
                          );
                        }
                        return null;
                      })}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                      }}
                    >
                      {section.fields.map((row) => {
                        // Take the right field of the row (or if colRight flag is set).
                        const field =
                          row[1] || (row[0]?.colRight ? row[0] : null);
                        if (field) {
                          return (
                            <FieldRow key={field.key} label={field.label}>
                              <TextField
                                size="small"
                                fullWidth
                                type={
                                  field.type === "number" ? "number" : "text"
                                }
                                value={form[field.key] ?? ""}
                                onChange={(e) =>
                                  handleChange(field.key, e.target.value)
                                }
                                inputProps={{
                                  style: { fontSize: 13, padding: "6px 8px" },
                                }}
                              />
                            </FieldRow>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer Actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "16px 24px",
              borderTop: `1px solid ${C.cardBorder}`,
              background: "#f8fafc",
            }}
          >
            <Btn
              onClick={handleSave}
              disabled={loading || saving}
              variant="default"
            >
              {saving ? (
                <CircularProgress size={14} style={{ color: "#fff" }} />
              ) : null}
              {saving ? "Saving..." : "SAVE"}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureCodePage;
