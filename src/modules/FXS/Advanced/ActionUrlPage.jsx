import React, { useState } from "react";
import { TextField, Button } from "@mui/material";
import { ACTION_URL_INITIAL_FORM } from "../../../sections/advanced/constants/ActionUrlConstants"; // Adjust path if needed

// ── Color Palette (CDR / PBX Admin Theme) ───────────────────────────────────
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#e2e8f0",

  labelText: "#64748b",
  valueText: "#0f172a",
  mutedText: "#94a3b8",

  accent: "#2563eb",

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
        width: 180, // Optimized for Action URL labels
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

const ActionUrlPage = () => {
  const [formData, setFormData] = useState(ACTION_URL_INITIAL_FORM);
  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Form validation/API call can be added here if needed
    showMessage("success", "Settings saved successfully!");
  };

  const handleReset = () => {
    setFormData(ACTION_URL_INITIAL_FORM);
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
            <span style={{ color: C.valueText, fontWeight: 600 }}>
              Action URL
            </span>
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
            <SectionHeading title="Channel State Report Settings" />

            {/* Form Fields Container */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                maxWidth: 800,
              }}
            >
              <FieldRow label="Channel Pick up">
                <TextField
                  fullWidth
                  size="small"
                  value={formData.chPickUpActionUrl || ""}
                  onChange={(e) =>
                    handleInputChange("chPickUpActionUrl", e.target.value)
                  }
                  placeholder="Enter URL to report pick up state"
                  inputProps={{
                    style: { fontSize: 13, padding: "6px 8px" },
                    maxLength: 256,
                  }}
                />
              </FieldRow>

              <FieldRow label="Channel Hang up">
                <TextField
                  fullWidth
                  size="small"
                  value={formData.chHangUpActionUrl || ""}
                  onChange={(e) =>
                    handleInputChange("chHangUpActionUrl", e.target.value)
                  }
                  placeholder="Enter URL to report hang up state"
                  inputProps={{
                    style: { fontSize: 13, padding: "6px 8px" },
                    maxLength: 256,
                  }}
                />
              </FieldRow>
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
</Button>
          <Button
  variant="outlined"
  onClick={handleReset}
  sx={{
    background: "#cbd5e1",
    color: "#374151",
    border: "1px solid #cbd5e1",
    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",

    fontWeight: 600,
    fontSize: 13,
    textTransform: "none",

    padding: "8px 28px",
    borderRadius: "6px",

    "&:hover": {
      background: "#cbd5e1",
      border: "1px solid #cbd5e1",
      opacity: 0.85,
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

export default ActionUrlPage;
