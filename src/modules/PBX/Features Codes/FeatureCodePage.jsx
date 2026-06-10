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
} from "../../../shared/pbxSharedUi";

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
      </div>
    </div>
  );
};

export default FeatureCodePage;
