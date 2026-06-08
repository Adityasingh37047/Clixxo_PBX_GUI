import React, { useState, useEffect, useRef } from "react";
import { Alert, CircularProgress, Button } from "@mui/material";
import { getFeatureCodes, updateFeatureCodes } from "../../../api/apiService";
import {
  FEATURE_CODE_SECTIONS,
  FEATURE_CODE_INITIAL_FORM,
  FORM_TO_API,
  API_TO_FORM,
  NUMERIC_KEYS,
} from "../../../constants/FeatureCodeConstants";

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




const SectionHeader = ({ title }) => (
  <div className="px-4 py-1 text-[15px] font-semibold border-b border-gray-300 text-[#333]">
    {title}
  </div>
);

const FieldInput = ({ fieldDef, value, onChange }) => (
  <input
    type={fieldDef.type === "number" ? "number" : "text"}
    value={value}
    onChange={(e) => onChange(fieldDef.key, e.target.value)}
    className="border border-gray-300 rounded px-2 py-1 text-[13px] w-full outline-none"
    style={{ height: 32 }}
  />
);

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
    <div
      className="min-h-[calc(100vh-80px)] flex flex-col items-center"
      style={{ backgroundColor: "#F1F5F9" }}
    >
      <div className="w-full max-w-5xl mx-auto">
        <div className="rounded-t-lg w-full h-8 bg-linear-to-b from-[#3E5475] via-[#3E5475] to-[#3E5475] flex items-center justify-center font-semibold text-lg text-white shadow">
          Feature Code
        </div>

        <div className="rounded-b-lg border-2 border-gray-400 border-t-0 shadow-sm bg-white px-6 py-4">
          {message.text && (
            <Alert
              severity={message.type}
              className="mb-3"
              onClose={() => setMessage({ type: "", text: "" })}
            >
              {message.text}
            </Alert>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <CircularProgress />
            </div>
          ) : (
            <>
              {FEATURE_CODE_SECTIONS.map((section) => (
                <div key={section.title} className="mb-2">
                  <SectionHeader title={section.title} />
                  <div className="border-b border-gray-200">
                    {section.fields.map((row, rowIdx) => {
                      if (row.length === 1) {
                        const field = row[0];
                        const isRight = !!field.colRight;
                        return (
                          <div
                            key={rowIdx}
                            className="grid grid-cols-2 border-t border-gray-100"
                          >
                            {isRight && <div />}
                            <div className="flex items-center px-4 py-2 gap-3">
                              <label
                                className="text-[13px] whitespace-nowrap shrink-0"
                                style={{ width: LABEL_W, color: "#3E5475" }}
                              >
                                {field.label}
                              </label>
                              <div className="flex-1 min-w-0">
                                <FieldInput
                                  fieldDef={field}
                                  value={form[field.key] ?? ""}
                                  onChange={handleChange}
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
                          className="grid grid-cols-2 border-t border-gray-100"
                        >
                          {row.map((field, colIdx) => (
                            <div
                              key={field.key}
                              className={`flex items-center px-4 py-2 gap-3 ${colIdx === 1 ? "border-l border-gray-100" : ""}`}
                            >
                              <label
                                className="text-[13px] whitespace-nowrap shrink-0"
                                style={{ width: LABEL_W, color: "#3E5475" }}
                              >
                                {field.label}
                              </label>
                              <div className="flex-1 min-w-0">
                                <FieldInput
                                  fieldDef={field}
                                  value={form[field.key] ?? ""}
                                  onChange={handleChange}
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
            </>
          )}
        </div>
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
      </div>
    </div>
  );
};

export default FeatureCodePage;
