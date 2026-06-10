import React, { useState } from "react";
import { Alert, Checkbox } from "@mui/material";
import {
  NAT_SETTINGS_FIELDS,
  NAT_SETTINGS_NOTE,
} from "../../../sections/voip/constants/NatSettingsConstants";
import {
  C,
  Btn,
  checkboxSx,
  AdvancedPageShell,
  VoipBreadcrumb,
  advancedTableContainerStyle,
  advancedBlueBarStyle,
  nativeFieldInputStyle,
  nativeFieldSelectStyle,
  nativeFieldInteraction,
  advancedFormBtnStyle,
  advancedFormInlineFooterStyle,
} from "../../../shared/fxsSharedUi";

const NAT_SETTINGS_SECTION_HEADING_COLOR = "#30415A";

const NatSettingsSectionHeading = ({ title, isFirst = false }) => (
  <div
    style={{
      margin: isFirst ? "0 0 24px 0" : "16px 0 24px 0",
      position: "relative",
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
        color: NAT_SETTINGS_SECTION_HEADING_COLOR,
      }}
    >
      {title}
    </span>
  </div>
);

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
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const alert = (msg) => {
    const isSuccess = /successfully/i.test(String(msg));
    showToast(msg, isSuccess ? "success" : "error");
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
    alert("Settings saved successfully!");
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

  const fieldInputStyle = {
    ...nativeFieldInputStyle,
    width: 220,
  };

  const fieldSelectStyle = {
    ...nativeFieldSelectStyle,
    width: 220,
  };

  const fieldLabelStyle = {
    width: 220,
    flexShrink: 0,
    fontSize: 13,
    fontWeight: 600,
    color: C.labelText,
    textAlign: "left",
  };

  const fieldControlStyle = {
    width: 220,
    flexShrink: 0,
  };

  const renderFieldRow = (field) => (
    <div
      key={field.key}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      <label style={fieldLabelStyle}>{field.label}</label>
      <div style={fieldControlStyle}>{renderFieldControl(field)}</div>
    </div>
  );

  const renderFieldControl = (field) => {
    if (field.type === "readonly") {
      return (
        <div
          style={{
            ...fieldInputStyle,
            lineHeight: "28px",
            backgroundColor: "#e5e7eb",
          }}
        >
          {form[field.key] || field.default || ""}
        </div>
      );
    }
    if (field.type === "text") {
      return (
        <input
          type="text"
          value={form[field.key]}
          onChange={(e) => handleChange(field.key, e.target.value)}
          style={fieldInputStyle}
          {...nativeFieldInteraction}
        />
      );
    }
    if (field.type === "select") {
      return (
        <select
          value={form[field.key]}
          onChange={(e) => handleChange(field.key, e.target.value)}
          style={fieldSelectStyle}
          {...nativeFieldInteraction}
        >
          {field.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }
    if (field.type === "checkbox") {
      const disabled = field.key === "autoDetectNatIp" && !form.learnNat;
      return (
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: disabled ? "not-allowed" : "pointer",
          }}
        >
          <Checkbox
            size="small"
            checked={!!form[field.key]}
            onChange={() => handleCheckbox(field.key)}
            disabled={disabled}
            sx={{
              ...checkboxSx,
              ...(disabled
                ? { opacity: 0.6, cursor: "not-allowed" }
                : { cursor: "pointer" }),
            }}
          />
          <span
            style={{
              color: C.valueText,
              fontSize: 13,
              opacity: disabled ? 0.6 : 1,
            }}
          >
            Enable
          </span>
        </label>
      );
    }
    return null;
  };

  return (
    <AdvancedPageShell>
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={() => setToast({ msg: "", type: "success" })}
          sx={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            minWidth: 300,
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            fontWeight: 500,
          }}
        >
          {toast.msg}
        </Alert>
      )}
      <VoipBreadcrumb current="NAT Settings" />
      <div style={{ ...advancedTableContainerStyle, marginBottom: 0 }}>
        <div style={advancedBlueBarStyle}>
          <span>NAT Settings</span>
        </div>
        <div style={{ padding: "24px 32px 0" }}>
          <div style={{ marginBottom: 12 }}>
            <div className="flex flex-col gap-4 w-full">
              {Object.entries(groupedFields).map(
                ([sectionName, methods], sectionIdx) => (
                  <div key={sectionName} className="flex flex-col gap-2 w-full">
                    <NatSettingsSectionHeading
                      title={sectionName}
                      isFirst={sectionIdx === 0}
                    />

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        width: "100%",
                      }}
                    >
                      <div
                        className="flex flex-col gap-6"
                        style={{ width: "fit-content", maxWidth: "100%" }}
                      >
                        {Object.entries(methods).map(([methodName, fields]) => (
                          <div
                            key={`${sectionName}-${methodName}`}
                            className="flex flex-col gap-2"
                          >
                            {methodName !== "no-method" && (
                              <div
                                style={{
                                  fontSize: 13,
                                  fontWeight: 600,
                                  color: NAT_SETTINGS_SECTION_HEADING_COLOR,
                                  paddingLeft: methodName.endsWith("-")
                                    ? 0
                                    : 24,
                                }}
                              >
                                {methodName}
                              </div>
                            )}

                            <div
                              className="flex flex-col gap-2"
                              style={{
                                paddingLeft:
                                  methodName !== "no-method" ? 24 : 0,
                              }}
                            >
                              {fields.map((field) => renderFieldRow(field))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ),
              )}

              <div className="flex flex-col gap-0 w-full">
                <NatSettingsSectionHeading title="Note:" />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      width: "max-content",
                      maxWidth: "100%",
                      textAlign: "left",
                    }}
                  >
                    {NAT_SETTINGS_NOTE.split("\n")
                      .filter(Boolean)
                      .map((line, index) => (
                        <p
                          key={index}
                          style={{
                            margin: 0,
                            color: C.mutedText,
                            fontSize: 11,
                            lineHeight: 1.45,
                            whiteSpace: "nowrap",
                            textAlign: "left",
                          }}
                        >
                          {line}
                        </p>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          style={{
            ...advancedFormInlineFooterStyle,
            width: "100%",
            marginLeft: 0,
            marginRight: 0,
          }}
        >
          <Btn
            type="button"
            onClick={handleSave}
            variant="primary"
            style={advancedFormBtnStyle}
          >
            Save
          </Btn>
          <Btn
            type="button"
            onClick={handleReset}
            variant="cancel"
            style={advancedFormBtnStyle}
          >
            Reset
          </Btn>
        </div>
      </div>
    </AdvancedPageShell>
  );
};

export default NatSettingsPage;
