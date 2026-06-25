import React, { useState, useEffect, useRef } from "react";
import {Alert, CircularProgress, useMediaQuery } from "@mui/material";
import { getFeatureCodes, updateFeatureCodes, listIvrDestinations } from "../../../api/apiService";
import {
  FEATURE_CODE_SECTIONS,
  FEATURE_CODE_INITIAL_FORM,
  FORM_TO_API,
  API_TO_FORM,
  NUMERIC_KEYS,
} from "../../../constants/FeatureCodeConstants";

const PBX_COMPACT_MQ = "(max-width: 768px)";

const C = {
  pageBg: "var(--bg-main)",
  cardBg: "var(--bg-surface)",
  cardBorder: "var(--border-strong)",
  labelText: "var(--text-primary)",
  accent: "var(--accent-brand)",
};

const OUTLINED_BORDER = "var(--border-subtle)";
const OUTLINED_HOVER = "var(--border-strong)";
const OUTLINED_FOCUS = "var(--status-primary)";
const FEATURE_CODE_FIELD_HEIGHT = 32;
const FEATURE_CODE_GRID_LABEL_WIDTH = 220;

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
  el.style.boxShadow = `0 0 0 1px ${OUTLINED_FOCUS}`;
};

const FEATURE_CODE_INPUT_INTERACTION = {
  onFocus: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    setFieldFocus(e.target);
  },
  onBlur: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    setFieldDefault(e.target);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    if (document.activeElement === e.target) setFieldFocus(e.target);
    else setFieldHover(e.target);
  },
  onMouseLeave: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    if (document.activeElement === e.target) setFieldFocus(e.target);
    else setFieldDefault(e.target);
  },
};

const FEATURE_CODE_GRID_LABEL_STYLE = {
  fontSize: 13,
  fontWeight: 600,
  color: C.labelText,
  textAlign: "left",
  width: FEATURE_CODE_GRID_LABEL_WIDTH,
  marginRight: 10,
  lineHeight: 1.4,
  flexShrink: 0,
  whiteSpace: "nowrap",
};

const FEATURE_CODE_GRID_INPUT_STYLE = {
  borderRadius: 6,
  border: `1px solid ${OUTLINED_BORDER}`,
  fontSize: 12,
  width: "100%",
  maxWidth: "100%",
  backgroundColor: "var(--bg-surface)",
  outline: "none",
  color: "var(--text-primary)",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
  boxShadow: "none",
  height: FEATURE_CODE_FIELD_HEIGHT,
  minHeight: FEATURE_CODE_FIELD_HEIGHT,
  padding: "0 12px",
  lineHeight: `${FEATURE_CODE_FIELD_HEIGHT - 2}px`,
  textAlign: "left",
};

const BTN_FORM_PRIMARY =
  "inline-flex items-center justify-center box-border m-0 min-w-[110px] h-[34px] gap-[6px] px-[28px] py-0 rounded-[10px] text-[13px] font-semibold leading-[34px] whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)] disabled:cursor-not-allowed disabled:opacity-60";

const FEATURE_CODE_PAGE_WRAP =
  "bg-[var(--bg-main)] min-h-[calc(100vh-80px)] p-[16px] box-border flex flex-col items-center";
const FEATURE_CODE_PAGE_INNER = "w-full max-w-[1000px] mx-auto";
const FEATURE_CODE_FORM_CARD =
  "overflow-hidden rounded-[10px] border-[1.5px] border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-[0_10px_30px_rgba(15,23,42,0.06)]";
const FEATURE_CODE_FORM_HEADER =
  "flex w-full min-h-[44px] items-center border-b border-[var(--border-strong)] bg-[var(--bg-surface)] px-[14px] py-[7px] text-[13px] font-bold text-[var(--text-label)] rounded-t-[10px]";
const FEATURE_CODE_FORM_FOOTER =
  "flex w-full flex-wrap items-center justify-center gap-[12px] border-t border-[var(--border-strong)] box-border px-[20px] py-[10px]";

const PbxBreadcrumb = ({ section, current, className = "" }) => (
  <div
    className={`mb-[16px] flex flex-wrap items-center gap-[4px] text-[12px] font-normal text-[#94a3b8] ${className}`.trim()}
  >
    <span>PBX</span>
    <span>&gt;</span>
    <span>{section}</span>
    <span>&gt;</span>
    <span className="font-semibold text-[#1e293b]">{current}</span>
  </div>
);

const TableListLoading = () => (
  <div className="flex items-center justify-center p-[48px]">
    <CircularProgress size={28} sx={{ color: C.accent }} />
  </div>
);

const FeatureCodeSectionHeading = ({ title, isFirst = false }) => (
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
        color: "var(--text-primary)",
      }}
    >
      {title}
    </span>
  </div>
);

const featureCodeFieldCellStyle = {
  display: "flex",
  alignItems: "center",
  padding: "8px 16px",
  gap: 12,
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

const FeatureCodeFieldCell = ({ field, value, onChange, selectOptions }) => (
  <div style={featureCodeFieldCellStyle}>
    <label style={FEATURE_CODE_GRID_LABEL_STYLE}>{field.label}</label>
    <div style={{ flex: 1, minWidth: 0 }}>
      {field.type === "select" ? (
        <select
          value={value ?? ""}
          onChange={(e) => onChange(field.key, e.target.value)}
          style={{ ...FEATURE_CODE_GRID_INPUT_STYLE, cursor: "pointer" }}
          {...FEATURE_CODE_INPUT_INTERACTION}
        >
          {selectOptions?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={field.type === "number" ? "number" : "text"}
          value={value ?? ""}
          onChange={(e) => onChange(field.key, e.target.value)}
          style={FEATURE_CODE_GRID_INPUT_STYLE}
          {...FEATURE_CODE_INPUT_INTERACTION}
        />
      )}
    </div>
  </div>
);

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

  return (
    <div
      className={`${FEATURE_CODE_PAGE_WRAP} ${isCompact ? "p-[8px]" : ""}`.trim()}
    >
      <div className={FEATURE_CODE_PAGE_INNER}>
        {message.text && (
          <div className="fixed right-[20px] top-[20px] z-[9999] min-w-[300px] max-w-[420px]">
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

        <div className={FEATURE_CODE_FORM_CARD}>
          <div className={FEATURE_CODE_FORM_HEADER}>
            <span>Feature Code</span>
          </div>

          <div className="box-border p-[12px_20px_0]">
            {loading ? (
              <TableListLoading />
            ) : (
              <div style={{ paddingBottom: 16 }}>
                {FEATURE_CODE_SECTIONS.map((section, sectionIdx) => (
                  <div key={section.title}>
                    <FeatureCodeSectionHeading
                      title={section.title}
                      isFirst={sectionIdx === 0}
                    />
                    <div>
                      {section.fields.map((row, rowIdx) => {
                        const gridStyle = {
                          display: "grid",
                          gridTemplateColumns: isCompact ? "1fr" : "1fr 1fr",
                        };
                        if (row.length === 1) {
                          const field = row[0];
                          const isRight = !!field.colRight;
                          return (
                            <div key={rowIdx} style={gridStyle}>
                              {isRight && <div />}
                              <FeatureCodeFieldCell
                                field={field}
                                value={form[field.key]}
                                onChange={handleChange}
                                selectOptions={
                                  field.type === "select"
                                    ? timeoutDestinationOptions
                                    : undefined
                                }
                              />
                              {!isRight && <div />}
                            </div>
                          );
                        }
                        return (
                          <div key={rowIdx} style={gridStyle}>
                            {row.map((field) => (
                              <FeatureCodeFieldCell
                                key={field.key}
                                field={field}
                                value={form[field.key]}
                                onChange={handleChange}
                                selectOptions={
                                  field.type === "select"
                                    ? timeoutDestinationOptions
                                    : undefined
                                }
                              />
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
            <div className={FEATURE_CODE_FORM_FOOTER}>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className={BTN_FORM_PRIMARY}
              >
                {saving ? (
                  <>
                    <CircularProgress size={14} color="inherit" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeatureCodePage;
