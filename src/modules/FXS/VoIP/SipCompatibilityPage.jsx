import React, { useState } from "react";
import { SIP_COMPATIBILITY_FIELDS } from "../../../sections/voip/constants/SipCompatibilityConstants";
import {
  C,
  Btn,
  FormEnableCheckbox,
  AdvancedPageShell,
  AdvancedBreadcrumb,
  advancedTableContainerStyle,
  advancedBlueBarStyle,
  nativeFieldInteraction,
} from "../../../sections/advanced/advancedSharedUi";

const getInitialState = () => {
  const state = {};
  SIP_COMPATIBILITY_FIELDS.forEach((f) => {
    if (f.type === "select") {
      state[f.key] = f.options[0] || f.default || "";
    } else if (f.type === "checkbox") {
      state[f.key] = f.default || false;
    } else {
      state[f.key] = f.default || "";
    }
  });
  return state;
};

const SipCompatibilityPage = () => {
  const [form, setForm] = useState(getInitialState());

  const handleChange = (key, value) => {
    const fieldDef = SIP_COMPATIBILITY_FIELDS.find((f) => f.key === key);
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
    alert("Settings saved successfully!");
  };

  const handleReset = () => {
    setForm(getInitialState());
  };

  // Check if field should be shown based on conditional logic
  const shouldShowField = (field) => {
    if (!field.conditional) return true;

    const conditionalValue = form[field.conditional];

    // Special case for Key field: show when sipEncryption is checked
    // (it will show regardless of encryptionCriterion value)
    if (field.key === "key") {
      return !!form.sipEncryption;
    }

    if (field.conditionalValues) {
      return field.conditionalValues.includes(conditionalValue);
    } else if (field.conditionalValue !== undefined) {
      return conditionalValue === field.conditionalValue;
    } else {
      return !!conditionalValue;
    }
  };

  const fieldInputStyle = {
    height: 28,
    width: 220,
    padding: "0 8px",
    fontSize: 13,
    border: `1px solid ${C.cardBorder}`,
    borderRadius: 4,
    outline: "none",
    backgroundColor: "#fff",
    color: C.valueText,
    boxSizing: "border-box",
  };

  const labelColStyle = {
    fontSize: 13,
    fontWeight: 600,
    color: C.labelText,
    flex: "0 0 48%",
    maxWidth: "48%",
    paddingRight: 24,
    textAlign: "left",
    lineHeight: 1.35,
  };

  const valueColStyle = {
    flex: "1 1 52%",
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  };

  /** Same width as inputs; checkboxes align at the left edge of fill boxes */
  const controlSlotStyle = {
    width: 220,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
  };

  return (
    <AdvancedPageShell>
      <AdvancedBreadcrumb current="SIP Compatibility" />
      <div style={{ ...advancedTableContainerStyle, marginBottom: 0 }}>
        <div style={advancedBlueBarStyle}>
          <span>SIP Compatibility</span>
        </div>
        <div style={{ padding: "24px 32px 10px" }}>
          <div
            className="flex flex-col gap-3"
            style={{
              width: "100%",
              maxWidth: 640,
              margin: "0 auto",
            }}
          >
            {SIP_COMPATIBILITY_FIELDS.map((field) => {
              if (!shouldShowField(field)) return null;

              return (
                <div
                  key={field.key}
                  className="flex flex-row items-start w-full"
                  style={{ gap: 0 }}
                >
                  <label style={labelColStyle}>{field.label}</label>
                  <div style={valueColStyle}>
                    {field.type === "text" && (
                      <div
                        style={{
                          ...controlSlotStyle,
                          width: field.key === "fxoHangupTime" ? "auto" : 220,
                          minWidth: 220,
                        }}
                      >
                        <input
                          type="text"
                          value={form[field.key]}
                          onChange={(e) =>
                            handleChange(field.key, e.target.value)
                          }
                          style={fieldInputStyle}
                          {...nativeFieldInteraction}
                        />
                        {field.key === "fxoHangupTime" && (
                          <span
                            style={{
                              color: C.valueText,
                              fontSize: 13,
                              flexShrink: 0,
                              marginLeft: 4,
                            }}
                          >
                            s
                          </span>
                        )}
                      </div>
                    )}

                    {field.type === "select" && (
                      <div style={controlSlotStyle}>
                        <select
                          value={form[field.key]}
                          onChange={(e) =>
                            handleChange(field.key, e.target.value)
                          }
                          style={fieldInputStyle}
                          {...nativeFieldInteraction}
                        >
                          {field.options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {field.type === "checkbox" && (
                      <div style={controlSlotStyle}>
                        <FormEnableCheckbox
                          checked={!!form[field.key]}
                          onChange={() => handleCheckbox(field.key)}
                          name={field.key}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, padding: "12px 0 18px", borderTop: `1px solid ${C.cardBorder}` }}>
          <Btn type="button" onClick={handleSave} variant="primary" style={{ minWidth: 110, height: 34, fontSize: 13 }}>
            Save
          </Btn>
          <Btn type="button" onClick={handleReset} variant="cancel" style={{ minWidth: 110, height: 34, fontSize: 13 }}>
            Reset
          </Btn>
          </div>
      </div>
    </AdvancedPageShell>
  );
};

export default SipCompatibilityPage;
