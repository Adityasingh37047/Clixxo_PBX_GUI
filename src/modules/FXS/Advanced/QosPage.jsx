import React, { useState } from "react";
import { QOS_INITIAL_FORM } from "../../../sections/advanced/constants/QosConstants"; // Adjust path if needed
import { TextField, Button, Checkbox } from "@mui/material";

// ── Color Palette (CDR / PBX Admin Theme) ───────────────────────────────────
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#e2e8f0",

  labelText: "#64748b",
  valueText: "#0f172a",
  mutedText: "#94a3b8",

  accent: "#2e2f31",

  successGreen: "#22c55e",
  errorRed: "#ef4444",

  purple: "#8b5cf6",
};

// ── Shared UI Components ──────────────────────────────────────────────────────
const FieldRow = ({ label, children, required, align = "center" }) => (
  <div style={{ display: "flex", alignItems: align, gap: 12, minHeight: 32 }}>
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: 180, // Optimized for QoS labels
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
    // Allow: numbers (48-57), backspace (8)
    if (!((key >= 48 && key <= 57) || key === 8)) {
      e.preventDefault();
    }
  };

  const handleSave = () => {
    if (formData.qosEnabled) {
      // Validate Media Premium QoS
      const mediaQos = parseInt(formData.mediaPremiumQos);
      if (isNaN(mediaQos) || mediaQos < 0 || mediaQos > 63) {
        showMessage("error", "The range of 'Media Premium QoS' is 0~63!");
        document.getElementById("mediaPremiumQos")?.focus();
        return;
      }

      // Validate Control Premium QoS
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
            <span style={{ color: C.valueText, fontWeight: 600 }}>QoS</span>
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
            <SectionHeading title="QoS Configuration" />

            {/* Form Fields Container */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <FieldRow label="QoS">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Checkbox
  checked={!!formData.qosEnabled}
  onChange={handleCheckboxChange}
  size="small"
  sx={{
    padding: "1px",
    color: "#64748b",

    "&.Mui-checked": {
      color: "#0284c7",
    },

    "&.MuiCheckbox-indeterminate": {
      color: "#0284c7",
    },
  }}
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
                    marginTop: 8,
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
                      inputProps={{
                        style: { fontSize: 13, padding: "6px 8px" },
                      }}
                    />
                  </FieldRow>
                </div>
              )}
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
    background:
      "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
    color: "#fff",
    border: "1px solid #5A6F8F",
    boxShadow: "0 2px 8px #3E5475",

    fontWeight: 600,
    fontSize: 13,
    textTransform: "none",

    padding: "8px 28px",
    borderRadius: "6px",

    "&:hover": {
      background:
        "linear-gradient(to bottom, #647A9B 0%, #4A6284 60%, #344A67 100%)",
      opacity: 0.85,
    },

    "&:disabled": {
      background: "#94a3b8",
      color: "#e2e8f0",
      border: "1px solid #94a3b8",
    },
  }}
>
  Save
</Button><Button
  variant="outlined"
  onClick={handleReset}
  sx={{
    background: "#fff",
    color: "#475569",
    border: "1px solid #cbd5e1",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",

    fontWeight: 600,
    fontSize: 13,
    textTransform: "none",

    padding: "8px 24px",
    borderRadius: "6px",

    "&:hover": {
      background: "#f8fafc",
      border: "1px solid #94a3b8",
      color: "#1e293b",
    },

    "&:disabled": {
      background: "#f8fafc",
      color: "#94a3b8",
      border: "1px solid #e2e8f0",
    },
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

export default QosPage;
