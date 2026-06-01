import React, { useState } from "react";
import { QOS_INITIAL_FORM } from "../../../sections/advanced/constants/QosConstants";
import { TextField, Checkbox } from "@mui/material";
import {
  C,
  Btn,
  checkboxSx,
  muiTextFieldSx,
  numManipulateCardStyle,
  AdvancedBreadcrumb,
  FieldRow,
  SectionHeading,
  advancedFormPanelStyle,
  advancedFormActionsStyle,
  advancedPageWrapStyle,
  advancedPageInnerStyle,
} from "../../../sections/advanced/advancedSharedUi";

const QosPage = () => {
  const [formData, setFormData] = useState(QOS_INITIAL_FORM);
  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleCheckboxChange = () => {
    setFormData((prev) => ({ ...prev, qosEnabled: !prev.qosEnabled }));
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleKeyPressInteger = (e) => {
    const key = e.keyCode || e.which;
    if (!((key >= 48 && key <= 57) || key === 8)) {
      e.preventDefault();
    }
  };

  const handleSave = () => {
    if (formData.qosEnabled) {
      const mediaQos = parseInt(formData.mediaPremiumQos);
      if (isNaN(mediaQos) || mediaQos < 0 || mediaQos > 63) {
        showMessage("error", "The range of 'Media Premium QoS' is 0~63!");
        document.getElementById("mediaPremiumQos")?.focus();
        return;
      }

      const controlQos = parseInt(formData.controlPremiumQos);
      if (isNaN(controlQos) || controlQos < 0 || controlQos > 63) {
        showMessage("error", "The range of 'Control Premium QoS' is 0~63!");
        document.getElementById("controlPremiumQos")?.focus();
        return;
      }
    }

    showMessage("success", "Settings saved successfully!");
  };

  const handleReset = () => {
    setFormData(QOS_INITIAL_FORM);
  };

  return (
    <div style={advancedPageWrapStyle}>
      <div style={advancedPageInnerStyle}>
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

        <AdvancedBreadcrumb current="QoS" />

        <div style={numManipulateCardStyle}>
          <div style={{ padding: 24 }}>
            <SectionHeading title="QoS Configuration" />

            <div style={advancedFormPanelStyle}>
              <FieldRow label="QoS">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Checkbox
                    checked={!!formData.qosEnabled}
                    onChange={handleCheckboxChange}
                    size="small"
                    sx={checkboxSx}
                  />
                  <span
                    style={{
                      fontSize: 13,
                      color: C.valueText,
                      cursor: "pointer",
                    }}
                    onClick={handleCheckboxChange}
                  >
                    Enable
                  </span>
                </div>
              </FieldRow>

              {formData.qosEnabled && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px 40px",
                  }}
                >
                  <FieldRow label="Media Premium QoS">
                    <TextField
                      id="mediaPremiumQos"
                      size="small"
                      fullWidth
                      value={formData.mediaPremiumQos || ""}
                      onChange={(e) =>
                        handleInputChange("mediaPremiumQos", e.target.value)
                      }
                      onKeyPress={handleKeyPressInteger}
                      sx={muiTextFieldSx}
                      inputProps={{
                        style: { fontSize: 13, padding: "6px 8px" },
                      }}
                    />
                  </FieldRow>

                  <FieldRow label="Control Premium QoS">
                    <TextField
                      id="controlPremiumQos"
                      size="small"
                      fullWidth
                      value={formData.controlPremiumQos || ""}
                      onChange={(e) =>
                        handleInputChange("controlPremiumQos", e.target.value)
                      }
                      onKeyPress={handleKeyPressInteger}
                      sx={muiTextFieldSx}
                      inputProps={{
                        style: { fontSize: 13, padding: "6px 8px" },
                      }}
                    />
                  </FieldRow>
                </div>
              )}
            </div>
          </div>

          <div style={advancedFormActionsStyle}>
            <Btn
              variant="primary"
              onClick={handleSave}
              style={{ height: 33, minWidth: 100 }}
            >
              Save
            </Btn>
            <Btn
              variant="cancel"
              onClick={handleReset}
              style={{ height: 33, minWidth: 100 }}
            >
              Reset
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QosPage;
