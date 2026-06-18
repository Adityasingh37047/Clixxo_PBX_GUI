import React, { useState, useEffect, useRef } from "react";
import { Alert, CircularProgress, useMediaQuery } from "@mui/material";
import {
  getFeatureCodes,
  updateFeatureCodes,
  listIvrDestinations,
} from "../../../api/apiService";
import {
  FEATURE_CODE_SECTIONS,
  FEATURE_CODE_INITIAL_FORM,
  FORM_TO_API,
  API_TO_FORM,
  NUMERIC_KEYS,
} from "../../../constants/FeatureCodeConstants";

const PBX_COMPACT_MQ = "(max-width: 768px)";

// ── Local page UI (inlined from pbxSharedUi) ──
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
  errorRed: "#dc2626",
  successGreen: "#16a34a",
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

const pbxPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const pbxPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const PbxBreadcrumb = ({ section, current, style }) => (
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
      ...style,
    }}
  >
    <span>PBX</span>
    <span>&gt;</span>
    <span>{section}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>{current}</span>
  </div>
);
const TableListLoading = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: 48,
    }}
  >
    <CircularProgress size={28} style={{ color: C.accent }} />
  </div>
);

const sipPcmFormPageWrapStyle = {
  ...pbxPageWrapStyle,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const sipPcmFormPageInnerStyle = {
  ...pbxPageInnerStyle,
  maxWidth: 1000,
};

const sipPcmFormCardStyle = {
  background: "#ffffff",
  borderRadius: 10,
  overflow: "hidden",
  border: `1.5px solid ${C.cardBorder}`,
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
};

const sipPcmFormHeaderStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: CARD_RADIUS,
  borderTopRightRadius: CARD_RADIUS,
  display: "flex",
  alignItems: "center",
  padding: "7px 14px",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  borderBottom: `1px solid ${C.cardBorder}`,
};

const sipPcmAuthFormFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "100%",
  padding: "10px 20px",
  borderTop: `1px solid ${C.cardBorder}`,
  boxSizing: "border-box",
};

const sipPcmAuthFormBtnStyle = {
  minWidth: 110,
  height: 34,
  fontSize: 13,
  margin: 0,
  padding: "0 28px",
  lineHeight: "34px",
  boxSizing: "border-box",
};

const SipPcmSectionHeading = ({ title, isFirst = false }) => (
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
        color: "#30415A",
      }}
    >
      {title}
    </span>
  </div>
);

const sipPcmFormLabelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: C.labelText,
  textAlign: "left",
  width: 320,
  marginRight: 10,
  lineHeight: 1.4,
  flexShrink: 0,
  whiteSpace: "nowrap",
};

const OUTLINED_BORDER = "rgba(0, 0, 0, 0.23)";
const OUTLINED_HOVER = "rgba(0, 0, 0, 0.87)";
const OUTLINED_FOCUS = "#1976d2";

const FOCUS_RING_SHADOW = (color) => `0 0 0 1px ${color}`;

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
  el.style.boxShadow = FOCUS_RING_SHADOW(OUTLINED_FOCUS);
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

const SIP_PCM_AUTH_FIELD_WIDTH = 200;
const SIP_PCM_FORM_FIELD_HEIGHT = 32;

const sipPcmAuthInputStyle = {
  borderRadius: 6,
  border: `1px solid ${OUTLINED_BORDER}`,
  fontSize: 12,
  width: SIP_PCM_AUTH_FIELD_WIDTH,
  maxWidth: SIP_PCM_AUTH_FIELD_WIDTH,
  backgroundColor: "#ffffff",
  outline: "none",
  color: "#3E5475",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
  boxShadow: "none",
  height: SIP_PCM_FORM_FIELD_HEIGHT,
  minHeight: SIP_PCM_FORM_FIELD_HEIGHT,
  padding: "0 12px",
  lineHeight: `${SIP_PCM_FORM_FIELD_HEIGHT - 2}px`,
  textAlign: "left",
};

const sipPcmAuthInputInteraction = {
  onFocus: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onFocus(e);
  },
  onBlur: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onBlur(e);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onMouseEnter(e);
  },
  onMouseLeave: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onMouseLeave(e);
  },
};

const LABEL_W = 220;

const GRID_LABEL_STYLE = {
  ...sipPcmFormLabelStyle,
  width: LABEL_W,
};

const GRID_INPUT_STYLE = {
  ...sipPcmAuthInputStyle,
  width: "100%",
  maxWidth: "100%",
};

const TIMEOUT_DESTINATION_STATIC_OPTIONS = [
  { value: "hangup", label: "Hangup" },
  { value: "original_extension", label: "Original extension" },
];

const normalizeExtensionOptions = (list) => {
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => {
      if (item == null) return null;
      if (typeof item === "string" || typeof item === "number")
        return { value: String(item), label: String(item) };
      const value = String(
        item.value ?? item.id ?? item.extension ?? "",
      ).trim();
      const label = String(
        item.label ?? item.display_name ?? item.name ?? value,
      ).trim();
      if (!value) return null;
      return { value, label: label || value };
    })
    .filter(Boolean);
};

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

const FeatureCodePage = () => {
  const isCompact = useMediaQuery(PBX_COMPACT_MQ);
  const [form, setForm] = useState({ ...FEATURE_CODE_INITIAL_FORM });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [extensionOptions, setExtensionOptions] = useState([]);
  const hasLoaded = useRef(false);

  const timeoutDestinationOptions = [
    ...TIMEOUT_DESTINATION_STATIC_OPTIONS,
    ...extensionOptions,
  ];

  const loadDestinations = async () => {
    try {
      const destRes = await listIvrDestinations();
      const destMessage = destRes?.message ?? destRes?.data ?? destRes;
      const extensionsRaw =
        destMessage?.Extensions ?? destMessage?.extensions ?? [];
      setExtensionOptions(normalizeExtensionOptions(extensionsRaw));
    } catch (_) {
      setExtensionOptions([]);
    }
  };

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  const handleChange = (key, val) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getFeatureCodes();
      if (res?.response && res?.message && typeof res.message === "object") {
        setForm(apiToForm(res.message));
      }
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      loadData();
      loadDestinations();
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateFeatureCodes(formToApi(form));
      if (res?.response) {
        showMsg("success", "Feature codes saved successfully");
        if (res.message && typeof res.message === "object") {
          setForm(apiToForm(res.message));
        }
      } else {
        showMsg(
          "error",
          typeof res?.message === "string" ? res.message : "Save failed",
        );
      }
    } catch (e) {
      showMsg("error", e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const renderFieldControl = (field) => {
    if (field.type === "select") {
      const options =
        field.key === "timeout_destinations" ? timeoutDestinationOptions : [];
      return (
        <select
          value={form[field.key] ?? ""}
          onChange={(e) => handleChange(field.key, e.target.value)}
          style={GRID_INPUT_STYLE}
          {...sipPcmAuthInputInteraction}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }
    return (
      <input
        type={field.type === "number" ? "number" : "text"}
        value={form[field.key] ?? ""}
        onChange={(e) => handleChange(field.key, e.target.value)}
        style={GRID_INPUT_STYLE}
        {...sipPcmAuthInputInteraction}
      />
    );
  };

  return (
    <div
      style={{
        ...sipPcmFormPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={sipPcmFormPageInnerStyle}>
        {message.text && (
          <div
            style={{
              position: "fixed",
              top: 20,
              right: 20,
              zIndex: 9999,
              minWidth: 300,
              maxWidth: 420,
            }}
          >
            <Alert
              severity={message.type}
              onClose={() => setMessage({ type: "", text: "" })}
              sx={{ boxShadow: 3 }}
            >
              {message.text}
            </Alert>
          </div>
        )}

        <PbxBreadcrumb section="Features Codes" current="Feature Code" />

        <div style={sipPcmFormCardStyle}>
          <div style={sipPcmFormHeaderStyle}>
            <span>Feature Code</span>
          </div>

          <div style={{ padding: "12px 20px 0", boxSizing: "border-box" }}>
            {loading ? (
              <TableListLoading />
            ) : (
              <div style={{ paddingBottom: 16 }}>
                {FEATURE_CODE_SECTIONS.map((section, sectionIdx) => (
                  <div key={section.title}>
                    <SipPcmSectionHeading
                      title={section.title}
                      isFirst={sectionIdx === 0}
                    />
                    <div>
                      {section.fields.map((row, rowIdx) => {
                        if (row.length === 1) {
                          const field = row[0];
                          const isRight = !!field.colRight;
                          return (
                            <div
                              key={rowIdx}
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                ...(isCompact
                                  ? { gridTemplateColumns: "1fr" }
                                  : {}),
                              }}
                            >
                              {isRight && <div />}
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  padding: "8px 16px",
                                  gap: 12,
                                }}
                              >
                                <label style={GRID_LABEL_STYLE}>
                                  {field.label}
                                </label>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  {renderFieldControl(field)}
                                </div>
                              </div>
                              {!isRight && <div />}
                            </div>
                          );
                        }
                        return (
                          <div
                            key={rowIdx}
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              ...(isCompact
                                ? { gridTemplateColumns: "1fr" }
                                : {}),
                            }}
                          >
                            {row.map((field) => (
                              <div
                                key={field.key}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  padding: "8px 16px",
                                  gap: 12,
                                }}
                              >
                                <label style={GRID_LABEL_STYLE}>
                                  {field.label}
                                </label>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  {renderFieldControl(field)}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!loading && (
            <div style={sipPcmAuthFormFooterStyle}>
              <Btn
                variant="primary"
                onClick={handleSave}
                disabled={saving}
                style={sipPcmAuthFormBtnStyle}
              >
                {saving ? (
                  <>
                    <CircularProgress size={14} color="inherit" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeatureCodePage;
