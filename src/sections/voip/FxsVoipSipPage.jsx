import React, { useState, useEffect, useRef } from "react";
import {
  Alert,
  Button,
  FormControl,
  MenuItem,
  Select as MuiSelect,
  Checkbox,
  TextField,
  CircularProgress,
} from "@mui/material";
import {
  SIP_SETTINGS_FIELDS,
  SIP_SETTINGS_NOTE,
} from "./constants/SipSipConstants";
import {
  listFxsSipSettings,
  saveFxsSipSettings,
  resetFxsSipSettings,
  statusFxsSipSettings,
} from "../../api/apiService";

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

// ─────────────────────────────────────────────────────────────────────────────

const FxsVoipSipPage = () => {
  const [form, setForm] = useState(getInitialState());
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loadingPage, setLoadingPage] = useState(true);
  const [saving, setSaving] = useState(false);
  const [registrationMode, setRegistrationMode] = useState("local");
  const [localModeMsg, setLocalModeMsg] = useState("");
  const statusPollRef = useRef(null);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 6000);
  };

  // Apply API data object to form state
  const applyApiData = (data) => {
    if (!data) return;
    setForm((prev) => {
      const next = { ...prev };
      SIP_SETTINGS_FIELDS.forEach((f) => {
        if (data[f.key] !== undefined) next[f.key] = data[f.key];
      });
      if (data.registerStatus !== undefined) next.registerStatus = data.registerStatus;
      return next;
    });
  };

  // ── On mount: load settings ─────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const settingsRes = await listFxsSipSettings().catch((e) => {
          console.warn("Failed to load FXS SIP settings:", e);
          return null;
        });
        if (!mounted) return;
        if (settingsRes?.success) {
          const mode = settingsRes.registrationMode || "local";
          setRegistrationMode(mode);
          if (mode === "local" && settingsRes.message) setLocalModeMsg(settingsRes.message);
          applyApiData(settingsRes.data || {});
        }
      } catch (e) {
        console.warn("Error during initial load:", e);
      } finally {
        if (mounted) setLoadingPage(false);
      }
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Poll register status every 30 s in remote mode ─────────────────────────
  useEffect(() => {
    if (statusPollRef.current) clearInterval(statusPollRef.current);
    if (registrationMode === "remote") {
      statusPollRef.current = setInterval(async () => {
        try {
          const res = await statusFxsSipSettings();
          if (res?.success && res.registerStatus) {
            setForm((prev) => ({ ...prev, registerStatus: res.registerStatus }));
          }
        } catch (_) {}
      }, 30000);
    }
    return () => { if (statusPollRef.current) clearInterval(statusPollRef.current); };
  }, [registrationMode]);

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

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await saveFxsSipSettings(form);
      if (!res?.success) {
        showMessage("error", res?.message || "Failed to save settings.");
        return;
      }
      const mode = res.registrationMode || "local";
      setRegistrationMode(mode);
      setLocalModeMsg(mode === "local" && res.message ? res.message : "");
      if (res.data) applyApiData(res.data);
      if (res.registerStatus) setForm((prev) => ({ ...prev, registerStatus: res.registerStatus }));
      showMessage("success", res.message || "Settings saved successfully!");
    } catch (err) {
      showMessage("error", err?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      const res = await resetFxsSipSettings();
      if (res?.success && res.data) {
        applyApiData(res.data);
        showMessage("info", res.message || "Settings reset to defaults.");
      } else {
        setForm(getInitialState());
      }
    } catch (_) {
      setForm(getInitialState());
    }
  };

  // Check if field should be shown based on conditional logic
  const shouldShowField = (field) => {
    if (!field.conditional) return true;
    const conditionalValue = form[field.conditional];
    if (field.conditionalValues) return field.conditionalValues.includes(conditionalValue);
    if (field.conditionalValue !== undefined) return conditionalValue === field.conditionalValue;
    return !!conditionalValue;
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
              SIP Settings
            </span>
          </div>
        </div>

        {/* Local-mode info banner */}
        {registrationMode === "local" && localModeMsg && (
          <div style={{
            background: "#fffbeb",
            border: "1px solid #fcd34d",
            borderRadius: 6,
            padding: "10px 16px",
            marginBottom: 12,
            fontSize: 12,
            color: C.amber,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <span style={{ fontWeight: 700 }}>ℹ Local PBX mode:</span>
            <span>{localModeMsg}</span>
          </div>
        )}

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
          {loadingPage ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 60 }}>
              <CircularProgress size={32} />
            </div>
          ) : (
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
                            onChange={(e) => handleChange(field.key, e.target.value)}
                            sx={{ fontSize: 13 }}
                          >
                            {field.options.map((opt) => (
                              <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
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
                              padding: "2px",
                              color: C.accent,
                              "&.Mui-checked": { color: C.accent },
                            }}
                          />
                          <span
                            style={{
                              fontSize: 13,
                              color: C.valueText,
                              cursor: "pointer",
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
          )}

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
              disabled={saving || loadingPage}
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
              {saving ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <CircularProgress size={14} sx={{ color: "#fff" }} />
                  Saving…
                </span>
              ) : "Save Settings"}
            </Button>
            <Button
              variant="outlined"
              onClick={handleReset}
              disabled={saving || loadingPage}
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

export default FxsVoipSipPage;
