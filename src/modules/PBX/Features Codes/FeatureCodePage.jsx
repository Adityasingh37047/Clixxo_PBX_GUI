import React, { useState, useEffect, useRef } from "react";
import { Alert, CircularProgress } from "@mui/material";
import { getFeatureCodes, updateFeatureCodes } from "../../../api/apiService";
import {
  FEATURE_CODE_SECTIONS,
  FEATURE_CODE_INITIAL_FORM,
  FORM_TO_API,
  API_TO_FORM,
  NUMERIC_KEYS,
} from "../../../constants/FeatureCodeConstants";
import {
  C,
  Btn,
  sipPcmFormPageWrapStyle,
  sipPcmFormPageInnerStyle,
  sipPcmFormCardStyle,
  sipPcmFormHeaderStyle,
  sipPcmAuthFormFooterStyle,
  sipPcmAuthFormBtnStyle,
  SipPcmSectionHeading,
  sipPcmFormLabelStyle,
  sipPcmAuthInputStyle,
  sipPcmAuthInputInteraction,
  TableListLoading,
  PbxBreadcrumb,
} from "../../../sections/sip/sipPcmSharedUi";

const LABEL_W = 220;
const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  title,
  type,
  hoverBehavior = "background",
}) => {
  const variants = {
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
    },
    danger: {
      background: C.errorRed,
      color: C.cardBg,
      border: `0.5px solid ${C.errorRed}`,
    },
   cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
    },
    outline: {
      background: C.cardBg,
      color: C.valueText,
      border: "1px solid #9ca3af",
    },
    accent: {
      background:
        "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
      color: "#fff",
      border: "1px solid #5A6F8F",
    },
  };

  const s = variants[variant] || variants.default;
  const hoverBg = (() => {
    switch (variant) {
      case "primary":
      case "accent":
        return "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)";
      case "danger":
        return "#b91c1c";
      case "cancel":
        return "#e2e8f0";
      case "outline":
      case "default":
      default:
        return "#e2e8f0";
    }
  })();

  const baseBg = extraStyle?.background || s.background;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
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
        if (!disabled) {
          if (hoverBehavior === "opacity") {
            e.currentTarget.style.opacity = "0.82";
          } else {
            e.currentTarget.style.background = hoverBg;
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          if (hoverBehavior === "opacity") {
            e.currentTarget.style.opacity = "1";
          } else {
            e.currentTarget.style.background = baseBg;
          }
        }
      }}
    >
      {children}
    </button>
  );
};




const GRID_LABEL_STYLE = {
  ...sipPcmFormLabelStyle,
  width: LABEL_W,
};

const GRID_INPUT_STYLE = {
  ...sipPcmAuthInputStyle,
  width: "100%",
  maxWidth: "100%",
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
  const [form, setForm] = useState({ ...FEATURE_CODE_INITIAL_FORM });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const hasLoaded = useRef(false);

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

  return (
    <div style={sipPcmFormPageWrapStyle}>
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
                                  <input
                                    type={
                                      field.type === "number"
                                        ? "number"
                                        : "text"
                                    }
                                    value={form[field.key] ?? ""}
                                    onChange={(e) =>
                                      handleChange(field.key, e.target.value)
                                    }
                                    style={GRID_INPUT_STYLE}
                                    {...sipPcmAuthInputInteraction}
                                  />
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
                                  <input
                                    type={
                                      field.type === "number"
                                        ? "number"
                                        : "text"
                                    }
                                    value={form[field.key] ?? ""}
                                    onChange={(e) =>
                                      handleChange(field.key, e.target.value)
                                    }
                                    style={GRID_INPUT_STYLE}
                                    {...sipPcmAuthInputInteraction}
                                  />
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
<<<<<<< HEAD
=======
        <div className="flex justify-center mt-6">
          <Button
           
            onClick={handleSave}
            disabled={saving}
            variant="primary"
            sx={{
              background:
                "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 100%)",
              color: "#fff",
              fontWeight: 600,
              fontSize: "16px",
              borderRadius: 1.5,
              minWidth: 120,
              minHeight: 40,
             
              "&:hover": {
                background:
                  "linear-gradient(to bottom, #3E5475 0%, #2f405c 100%)",
                color: "#fff",
              },

              "&:disabled": {
                background: "#cbd5e1",
                color: "#64748b",
              },
            }}
          >
            {saving ? <CircularProgress size={18} color="inherit" /> : "Save"}
          </Button>
        </div>
>>>>>>> 4e8c2c6fec6b0d285407ea9ed8b74ea6662b39c8
      </div>
    </div>
  );
};

export default FeatureCodePage;
