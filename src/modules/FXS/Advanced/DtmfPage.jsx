import React, { useState } from "react";
import { DTMF_INITIAL_FORM } from "../../../sections/advanced/constants/DtmfConstants"; // Adjust path if needed
import { TextField, Button, Checkbox } from "@mui/material";

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
        width: 250, // Wider to accommodate long DTMF labels
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
            FXS &rsaquo; Advanced &rsaquo;{" "}
            <span style={{ color: C.valueText, fontWeight: 600 }}>DTMF</span>
          </div>
        </div>

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
          <div style={{ padding: "24px 28px" }}>
            {/* ── DTMF Detector Section ── */}
            <SectionHeading title="DTMF Detector" />
            <div
              style={{
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
                      onClick={() => handleCheckboxChange("enableOmitABCD")}
                    >
                      Enable
                    </span>
                  </div>
                </FieldRow>
              </div>
            </div>

            {/* ── DTMF Generator Section ── */}
            <SectionHeading title="DTMF Generator" />

            <div style={{ marginBottom: 16 }}>
              <FieldRow label="DTMF Energy Advance Set">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Checkbox
                    checked={!!formData.dtmfEnergyAdvance}
                    onChange={() => handleCheckboxChange("dtmfEnergyAdvance")}
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
                    onClick={() => handleCheckboxChange("dtmfEnergyAdvance")}
                  >
                    Enable
                  </span>
                </div>
              </FieldRow>
            </div>

            <div
              style={{
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
                color: C.errorRed,
                lineHeight: 1.6,
                background: "#fef2f2",
                padding: "12px 16px",
                borderRadius: 6,
                border: `1px solid #fecaca`,
              }}
            >
              <span style={{ fontWeight: 600 }}>Note:</span> Setting the DTMF
              transmission energy too large may cause the distortion of the
              transmitted DTMF. Please configure it carefully.
            </div>
          </div>

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
              Save Settings
            </Button>
            <Button
              variant="outlined"
              onClick={handleReset}
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

export default DtmfPage;
