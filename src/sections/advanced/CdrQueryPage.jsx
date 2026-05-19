import React, { useState } from "react";
import {
  CDR_QUERY_INITIAL_FORM,
  PORT_OPTIONS,
  CALL_DIRECTION_OPTIONS,
} from "./constants/CdrQueryConstants"; // Adjust path if needed
import {
  TextField,
  Button,
  Select as MuiSelect,
  MenuItem,
  FormControl,
} from "@mui/material";

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
        width: 140, // Optimized for CDR Query labels
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

const CdrQueryPage = () => {
  const [formData, setFormData] = useState(CDR_QUERY_INITIAL_FORM);
  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Date input validation: allows numbers, dash (-), colon (:), space
  const handleDateKeyPress = (e) => {
    const key = e.keyCode || e.which;
    if ((key > 47 && key < 59) || key === 45 || key === 32) {
      // Allow numbers (48-58), dash (45), space (32)
    } else if (key !== 8) {
      // Allow backspace (8)
      e.preventDefault();
    }
  };

  // String input validation: allows numbers, letters, space, dot, underscore
  const handleStringKeyPress = (e) => {
    const key = e.keyCode || e.which;
    if (
      key === 32 || // space
      key === 46 || // dot
      key === 95 || // underscore
      key === 8 || // backspace
      (key >= 48 && key <= 57) || // numbers
      (key >= 65 && key <= 90) || // uppercase letters
      (key >= 97 && key <= 122) // lowercase letters
    ) {
      // Allow
    } else {
      e.preventDefault();
    }
  };

  // Number input validation: allows only numbers
  const handleNumberKeyPress = (e) => {
    const key = e.keyCode || e.which;
    if (key > 47 && key < 58) {
      // Allow numbers
    } else if (key !== 8) {
      // Allow backspace (8)
      e.preventDefault();
    }
  };

  const handleQuery = () => {
    // Validate: ending date should not be earlier than starting date
    if (
      formData.startdate &&
      formData.enddate &&
      formData.startdate > formData.enddate
    ) {
      showMessage(
        "error",
        "The Ending Date should not be earlier than the Starting Date!",
      );
      return;
    }

    // Validate: max talk duration should not be smaller than min talk duration
    const minTalkTime = Number(formData.mintalktime);
    const maxTalkTime = Number(formData.maxtalktime);
    if (
      formData.mintalktime &&
      formData.maxtalktime &&
      minTalkTime > maxTalkTime
    ) {
      showMessage(
        "error",
        "The max talk duration should not be smaller than the min talk duration!",
      );
      return;
    }

    // Here you would typically submit the query
    showMessage("success", "Query submitted successfully!");
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
              CDR Inquire
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
            <SectionHeading title="CDR Query Filters" />

            {/* 2-Column Grid Layout for Form Fields */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px 40px",
              }}
            >
              {/* ── LEFT COLUMN ── */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <FieldRow label="Starting Date">
                  <TextField
                    type="date"
                    size="small"
                    fullWidth
                    value={formData.startdate || ""}
                    onChange={(e) =>
                      handleInputChange("startdate", e.target.value)
                    }
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
                  />
                </FieldRow>

                <FieldRow label="Port">
                  <FormControl size="small" fullWidth>
                    <MuiSelect
                      value={formData.port}
                      onChange={(e) =>
                        handleInputChange("port", e.target.value)
                      }
                      sx={{ fontSize: 13 }}
                    >
                      {PORT_OPTIONS.map((opt) => (
                        <MenuItem
                          key={opt.value}
                          value={opt.value}
                          sx={{ fontSize: 13 }}
                        >
                          {opt.label}
                        </MenuItem>
                      ))}
                    </MuiSelect>
                  </FormControl>
                </FieldRow>

                <FieldRow label="CallerID">
                  <TextField
                    size="small"
                    fullWidth
                    value={formData.callingnum || ""}
                    onChange={(e) =>
                      handleInputChange("callingnum", e.target.value)
                    }
                    onKeyPress={handleStringKeyPress}
                    inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
                  />
                </FieldRow>

                <FieldRow label="Call Duration(s)">
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <TextField
                      size="small"
                      value={formData.mintalktime || ""}
                      onChange={(e) =>
                        handleInputChange("mintalktime", e.target.value)
                      }
                      onKeyPress={handleNumberKeyPress}
                      inputProps={{
                        style: {
                          fontSize: 13,
                          padding: "6px 8px",
                          textAlign: "center",
                        },
                      }}
                      sx={{ flex: 1 }}
                      placeholder="Min"
                    />
                    <span style={{ fontSize: 13, color: C.mutedText }}>—</span>
                    <TextField
                      size="small"
                      value={formData.maxtalktime || ""}
                      onChange={(e) =>
                        handleInputChange("maxtalktime", e.target.value)
                      }
                      onKeyPress={handleNumberKeyPress}
                      inputProps={{
                        style: {
                          fontSize: 13,
                          padding: "6px 8px",
                          textAlign: "center",
                        },
                      }}
                      sx={{ flex: 1 }}
                      placeholder="Max"
                    />
                  </div>
                </FieldRow>
              </div>

              {/* ── RIGHT COLUMN ── */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <FieldRow label="Ending Date">
                  <TextField
                    type="date"
                    size="small"
                    fullWidth
                    value={formData.enddate || ""}
                    onChange={(e) =>
                      handleInputChange("enddate", e.target.value)
                    }
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
                  />
                </FieldRow>

                <FieldRow label="Call Direction">
                  <FormControl size="small" fullWidth>
                    <MuiSelect
                      value={formData.billtype}
                      onChange={(e) =>
                        handleInputChange("billtype", e.target.value)
                      }
                      sx={{ fontSize: 13 }}
                    >
                      {CALL_DIRECTION_OPTIONS.map((opt) => (
                        <MenuItem
                          key={opt.value}
                          value={opt.value}
                          sx={{ fontSize: 13 }}
                        >
                          {opt.label}
                        </MenuItem>
                      ))}
                    </MuiSelect>
                  </FormControl>
                </FieldRow>

                <FieldRow label="CalleeID">
                  <TextField
                    size="small"
                    fullWidth
                    value={formData.callednum || ""}
                    onChange={(e) =>
                      handleInputChange("callednum", e.target.value)
                    }
                    onKeyPress={handleStringKeyPress}
                    inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
                  />
                </FieldRow>

                <FieldRow label="Keyword">
                  <TextField
                    size="small"
                    fullWidth
                    value={formData.keyword || ""}
                    onChange={(e) =>
                      handleInputChange("keyword", e.target.value)
                    }
                    onKeyPress={handleStringKeyPress}
                    inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
                  />
                </FieldRow>
              </div>
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
              onClick={handleQuery}
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
              Query
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CdrQueryPage;
