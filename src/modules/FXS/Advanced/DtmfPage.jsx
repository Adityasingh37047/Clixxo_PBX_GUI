import React, { useState } from "react";
import { DTMF_INITIAL_FORM } from "../../../sections/advanced/constants/DtmfConstants";
import { TextField, Checkbox, Alert } from "@mui/material";
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

const DtmfPage = () => {
  const [formData, setFormData] = useState(DTMF_INITIAL_FORM);
  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field) => {
    setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleKeyPress = (e, allowDecimal = false) => {
    const key = e.keyCode || e.which;
    // Allow: numbers (48-57), minus sign (45), decimal point (46) if allowed, backspace (8)
    if (
      !(
        (key >= 48 && key <= 57) ||
        key === 45 ||
        (allowDecimal && key === 46) ||
        key === 8
      )
    ) {
      e.preventDefault();
    }
  };

  const handleKeyPressInteger = (e) => {
    const key = e.keyCode || e.which;
    // Allow: numbers (48-57), backspace (8)
    if (!((key >= 48 && key <= 57) || key === 8)) {
      e.preventDefault();
    }
  };

  const checkDtmfEnergy = (value) => {
    const parts = value.toString().split(".");
    if ((parts[1] !== undefined && parts[1].length > 1) || parts.length > 2) {
      return true;
    }
    return false;
  };

  const handleSave = () => {
    // Validate DTMF Detector fields
    const positiveTwist = parseFloat(formData.positiveTwist);
    if (isNaN(positiveTwist) || positiveTwist < 0 || positiveTwist > 24) {
      showMessage(
        "error",
        "The range of 'Energy Difference for High-freq minus Low-freq' is 0~24!",
      );
      document.getElementById("positiveTwist")?.focus();
      return;
    }

    const negativeTwist = parseFloat(formData.negativeTwist);
    if (isNaN(negativeTwist) || negativeTwist < 0 || negativeTwist > 24) {
      showMessage(
        "error",
        "The range of 'Energy Difference for Low-freq minus High-freq' is 0~24!",
      );
      document.getElementById("negativeTwist")?.focus();
      return;
    }

    const minDuration = parseFloat(formData.minDuration);
    if (isNaN(minDuration) || minDuration < 10 || minDuration > 2000) {
      showMessage(
        "error",
        "The value range of the minimum duration at ON is 10~2000!",
      );
      document.getElementById("minDuration")?.focus();
      return;
    }

    const minNegativeDuration = parseFloat(formData.minNegativeDuration);
    if (
      isNaN(minNegativeDuration) ||
      minNegativeDuration < 10 ||
      minNegativeDuration > 2000
    ) {
      showMessage(
        "error",
        "The value range of the minimum duration at OFF is 10~2000!",
      );
      document.getElementById("minNegativeDuration")?.focus();
      return;
    }

    const energyRatio = parseFloat(formData.energyRatio);
    if (isNaN(energyRatio) || energyRatio < 1 || energyRatio > 100) {
      showMessage("error", "The ratio range of the DT energy is 1~100!");
      document.getElementById("energyRatio")?.focus();
      return;
    }

    const levelMinIn = parseFloat(formData.levelMinIn);
    if (isNaN(levelMinIn) || levelMinIn < -40 || levelMinIn > -9) {
      showMessage(
        "error",
        "The value range of the lowest energy threshold is -40~-9!",
      );
      document.getElementById("levelMinIn")?.focus();
      return;
    }

    // Validate DTMF Generator fields
    if (formData.dtmfEnergyAdvance) {
      for (let i = 0; i <= 11; i++) {
        const dtmfPlayEnergy = parseFloat(formData[`dtmfPlayEnergy${i}`]);
        const key = i === 10 ? "*" : i === 11 ? "#" : i;

        if (
          isNaN(dtmfPlayEnergy) ||
          dtmfPlayEnergy < -18 ||
          dtmfPlayEnergy > 11
        ) {
          showMessage(
            "error",
            `The value range of DTMF${key} Low Energy is -18.0~11.0dB!`,
          );
          document.getElementById(`dtmfPlayEnergy${i}`)?.focus();
          return;
        }
        if (checkDtmfEnergy(formData[`dtmfPlayEnergy${i}`])) {
          showMessage(
            "error",
            `The value of DTMF${key} Low Energy only have one decimal!`,
          );
          document.getElementById(`dtmfPlayEnergy${i}`)?.focus();
          return;
        }

        const dtmfHighPlayEnergy = parseFloat(
          formData[`dtmfHighPlayEnergy${i}`],
        );
        if (
          isNaN(dtmfHighPlayEnergy) ||
          dtmfHighPlayEnergy < -18 ||
          dtmfHighPlayEnergy > 11
        ) {
          showMessage(
            "error",
            `The value range of DTMF${key} High Energy is -18.0~11.0dB!`,
          );
          document.getElementById(`dtmfHighPlayEnergy${i}`)?.focus();
          return;
        }
        if (checkDtmfEnergy(formData[`dtmfHighPlayEnergy${i}`])) {
          showMessage(
            "error",
            `The value of DTMF${key} High Energy only have one decimal!`,
          );
          document.getElementById(`dtmfHighPlayEnergy${i}`)?.focus();
          return;
        }
      }
    } else {
      const dtmfPlayEnergy = parseFloat(formData.dtmfPlayEnergy);
      if (
        isNaN(dtmfPlayEnergy) ||
        dtmfPlayEnergy < -18 ||
        dtmfPlayEnergy > 11
      ) {
        showMessage("error", "The value range of 'DTMF Energy' is -18~11dB!");
        document.getElementById("dtmfPlayEnergy")?.focus();
        return;
      }
    }

    const dtmfTxHighDuration = parseFloat(formData.dtmfTxHighDuration);
    if (
      isNaN(dtmfTxHighDuration) ||
      dtmfTxHighDuration < 0 ||
      dtmfTxHighDuration > 16383
    ) {
      showMessage("error", "The value range of 'Duration at ON' is 0~16383!");
      document.getElementById("dtmfTxHighDuration")?.focus();
      return;
    }

    const dtmfTxLowDuration = parseFloat(formData.dtmfTxLowDuration);
    if (
      isNaN(dtmfTxLowDuration) ||
      dtmfTxLowDuration < 0 ||
      dtmfTxLowDuration > 16383
    ) {
      showMessage("error", "The value range of 'Duration at OFF' is 0~16383!");
      document.getElementById("dtmfTxLowDuration")?.focus();
      return;
    }

    showMessage("success", "Settings saved successfully!");
  };

  const handleReset = () => {
    setFormData(DTMF_INITIAL_FORM);
  };

  const getDtmfKeyLabel = (i) => (i === 10 ? "*" : i === 11 ? "#" : i);

  return (
    <div style={advancedPageWrapStyle}>
      <div style={advancedPageInnerStyle}>
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

        <AdvancedBreadcrumb current="DTMF" />

        <div style={numManipulateCardStyle}>
          <div style={{ padding: 24 }}>
            <SectionHeading title="DTMF Detector" />
            <div
              style={{
                ...advancedFormPanelStyle,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px 40px",
                marginBottom: 32,
              }}
            >
              {/* Left Column */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <FieldRow label="Energy Difference of High-freq minus Low-freq (dB)">
                  <TextField
                    id="positiveTwist"
                    size="small"
                    fullWidth
                    sx={muiTextFieldSx}
                    value={formData.positiveTwist || ""}
                    onChange={(e) =>
                      handleInputChange("positiveTwist", e.target.value)
                    }
                    onKeyPress={(e) => handleKeyPressInteger(e)}
                    inputProps={{
                      style: { fontSize: 13, padding: "6px 8px" },
                      maxLength: 20,
                    }}
                  />
                </FieldRow>

                <FieldRow label="Minimum Duration at ON (ms)">
                  <TextField
                    id="minDuration"
                    size="small"
                    fullWidth
                    sx={muiTextFieldSx}
                    value={formData.minDuration || ""}
                    onChange={(e) =>
                      handleInputChange("minDuration", e.target.value)
                    }
                    onKeyPress={(e) => handleKeyPressInteger(e)}
                    inputProps={{
                      style: { fontSize: 13, padding: "6px 8px" },
                      maxLength: 20,
                    }}
                  />
                </FieldRow>

                <FieldRow label="Ratio of DT Energy (%)">
                  <TextField
                    id="energyRatio"
                    size="small"
                    fullWidth
                    sx={muiTextFieldSx}
                    value={formData.energyRatio || ""}
                    onChange={(e) =>
                      handleInputChange("energyRatio", e.target.value)
                    }
                    onKeyPress={(e) => handleKeyPress(e, true)} // allow decimal
                    inputProps={{
                      style: { fontSize: 13, padding: "6px 8px" },
                      maxLength: 20,
                    }}
                  />
                </FieldRow>

                <FieldRow label="DTMF Display via Channel Status">
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <Checkbox
                      checked={!!formData.enableDisplayDtmf}
                      onChange={() => handleCheckboxChange("enableDisplayDtmf")}
                      size="small"
                      sx={checkboxSx}
                    />
                    <span
                      style={{
                        fontSize: 13,
                        color: C.valueText,
                        cursor: "pointer",
                      }}
                      onClick={() => handleCheckboxChange("enableDisplayDtmf")}
                    >
                      Enable
                    </span>
                  </div>
                </FieldRow>
              </div>

              {/* Right Column */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <FieldRow label="Energy Difference of Low-freq minus High-freq (dB)">
                  <TextField
                    id="negativeTwist"
                    size="small"
                    fullWidth
                    sx={muiTextFieldSx}
                    value={formData.negativeTwist || ""}
                    onChange={(e) =>
                      handleInputChange("negativeTwist", e.target.value)
                    }
                    onKeyPress={(e) => handleKeyPressInteger(e)}
                    inputProps={{
                      style: { fontSize: 13, padding: "6px 8px" },
                      maxLength: 20,
                    }}
                  />
                </FieldRow>

                <FieldRow label="Minimum Duration at OFF (ms)">
                  <TextField
                    id="minNegativeDuration"
                    size="small"
                    fullWidth
                    sx={muiTextFieldSx}
                    value={formData.minNegativeDuration || ""}
                    onChange={(e) =>
                      handleInputChange("minNegativeDuration", e.target.value)
                    }
                    onKeyPress={(e) => handleKeyPressInteger(e)}
                    inputProps={{
                      style: { fontSize: 13, padding: "6px 8px" },
                      maxLength: 20,
                    }}
                  />
                </FieldRow>

                <FieldRow label="Lowest Energy Threshold (dB)">
                  <TextField
                    id="levelMinIn"
                    size="small"
                    fullWidth
                    sx={muiTextFieldSx}
                    value={formData.levelMinIn || ""}
                    onChange={(e) =>
                      handleInputChange("levelMinIn", e.target.value)
                    }
                    onKeyPress={(e) => handleKeyPressInteger(e)}
                    inputProps={{
                      style: { fontSize: 13, padding: "6px 8px" },
                      maxLength: 20,
                    }}
                  />
                </FieldRow>

                <FieldRow label="ABCD Detection">
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <Checkbox
                      checked={!!formData.enableOmitABCD}
                      onChange={() => handleCheckboxChange("enableOmitABCD")}
                      size="small"
                      sx={checkboxSx}
                    />
                    <span
                      style={{
                        fontSize: 13,
                        color: C.valueText,
                        cursor: "pointer",
                      }}
                      onClick={() => handleCheckboxChange("enableOmitABCD")}
                    >
                      Enable
                    </span>
                  </div>
                </FieldRow>
              </div>
            </div>

            <SectionHeading title="DTMF Generator" />

            <div style={{ ...advancedFormPanelStyle, marginBottom: 16 }}>
              <FieldRow label="DTMF Energy Advance Set" labelWidth={240}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Checkbox
                    checked={!!formData.dtmfEnergyAdvance}
                    onChange={() => handleCheckboxChange("dtmfEnergyAdvance")}
                    size="small"
                    sx={checkboxSx}
                  />
                  <span
                    style={{
                      fontSize: 13,
                      color: C.valueText,
                      cursor: "pointer",
                    }}
                    onClick={() => handleCheckboxChange("dtmfEnergyAdvance")}
                  >
                    Enable
                  </span>
                </div>
              </FieldRow>
            </div>

            <div
              style={{
                ...advancedFormPanelStyle,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px 40px",
              }}
            >
              {/* Left Column Generator */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                {!formData.dtmfEnergyAdvance ? (
                  <FieldRow label="DTMF Energy (dB)">
                    <TextField
                      id="dtmfPlayEnergy"
                      size="small"
                      fullWidth
                      sx={muiTextFieldSx}
                      value={formData.dtmfPlayEnergy || ""}
                      onChange={(e) =>
                        handleInputChange("dtmfPlayEnergy", e.target.value)
                      }
                      onKeyPress={(e) => handleKeyPress(e, false)}
                      inputProps={{
                        style: { fontSize: 13, padding: "6px 8px" },
                        maxLength: 20,
                      }}
                    />
                  </FieldRow>
                ) : (
                  Array.from({ length: 12 }).map((_, i) => (
                    <FieldRow
                      key={`low-${i}`}
                      label={`DTMF${getDtmfKeyLabel(i)} Low Hz Energy (dB)`}
                    >
                      <TextField
                        id={`dtmfPlayEnergy${i}`}
                        size="small"
                        fullWidth
                        sx={muiTextFieldSx}
                        value={formData[`dtmfPlayEnergy${i}`] || ""}
                        onChange={(e) =>
                          handleInputChange(
                            `dtmfPlayEnergy${i}`,
                            e.target.value,
                          )
                        }
                        onKeyPress={(e) => handleKeyPress(e, true)}
                        inputProps={{
                          style: { fontSize: 13, padding: "6px 8px" },
                          maxLength: 20,
                        }}
                      />
                    </FieldRow>
                  ))
                )}

                <FieldRow label="Duration at ON (ms)">
                  <TextField
                    id="dtmfTxHighDuration"
                    size="small"
                    fullWidth
                    sx={muiTextFieldSx}
                    value={formData.dtmfTxHighDuration || ""}
                    onChange={(e) =>
                      handleInputChange("dtmfTxHighDuration", e.target.value)
                    }
                    onKeyPress={(e) => handleKeyPress(e, false)}
                    inputProps={{
                      style: { fontSize: 13, padding: "6px 8px" },
                      maxLength: 20,
                    }}
                  />
                </FieldRow>
              </div>

              {/* Right Column Generator */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                {formData.dtmfEnergyAdvance &&
                  Array.from({ length: 12 }).map((_, i) => (
                    <FieldRow
                      key={`high-${i}`}
                      label={`DTMF${getDtmfKeyLabel(i)} High Hz Energy (dB)`}
                    >
                      <TextField
                        id={`dtmfHighPlayEnergy${i}`}
                        size="small"
                        fullWidth
                        sx={muiTextFieldSx}
                        value={formData[`dtmfHighPlayEnergy${i}`] || ""}
                        onChange={(e) =>
                          handleInputChange(
                            `dtmfHighPlayEnergy${i}`,
                            e.target.value,
                          )
                        }
                        onKeyPress={(e) => handleKeyPress(e, true)}
                        inputProps={{
                          style: { fontSize: 13, padding: "6px 8px" },
                          maxLength: 20,
                        }}
                      />
                    </FieldRow>
                  ))}

                <FieldRow label="Duration at OFF (ms)">
                  <TextField
                    id="dtmfTxLowDuration"
                    size="small"
                    fullWidth
                    sx={muiTextFieldSx}
                    value={formData.dtmfTxLowDuration || ""}
                    onChange={(e) =>
                      handleInputChange("dtmfTxLowDuration", e.target.value)
                    }
                    onKeyPress={(e) => handleKeyPress(e, false)}
                    inputProps={{
                      style: { fontSize: 13, padding: "6px 8px" },
                      maxLength: 20,
                    }}
                  />
                </FieldRow>
              </div>
            </div>

            {/* Note Section */}
            <div
              style={{
                marginTop: 24,
                fontSize: 12,
                color: C.amber,
                lineHeight: 1.6,
                background: "#fef2f2",
                padding: "12px 16px",
                borderRadius: 6,
                border: "1px solid #fecaca",
              }}
            >
              <span style={{ fontWeight: 600 }}>Note:</span> Setting the DTMF
              transmission energy too large may cause the distortion of the
              transmitted DTMF. Please configure it carefully.
            </div>
          </div>

          <div style={advancedFormActionsStyle}>
            <Btn
              variant="primary"
              onClick={handleSave}
              style={{ height: 33, minWidth: 100 }}
            >
              Save Settings
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

export default DtmfPage;
