import React, { useState } from "react";
import { TextField, Button } from "@mui/material";
import { ACTION_URL_INITIAL_FORM } from "../../../sections/advanced/constants/ActionUrlConstants"; // Adjust path if needed

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
              Save
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

export default ActionUrlPage;
