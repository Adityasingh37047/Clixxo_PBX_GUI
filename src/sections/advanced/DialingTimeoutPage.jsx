import React, { useState } from "react";
import {
  DIALING_TIMEOUT_TABLE_COLUMNS,
  DIALING_TIMEOUT_INITIAL_FORM,
  DIALING_TIMEOUT_INITIAL_DATA,
} from "./constants/DialingTimeoutConstants"; // Adjust path if needed
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
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
const TH = ({ children, style: extra }) => (
  <th
    style={{
      background: "#f3f4f6",
      color: C.labelText,
      fontWeight: 700,
      fontSize: 10.5,
      padding: "9px 8px",
      textAlign: "center",
      borderBottom: `1px solid ${C.cardBorder}`,
      borderRight: `0.5px solid #9ca3af`,
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      ...extra,
    }}
  >
    {children}
  </th>
);

const FieldRow = ({ label, children, required, align = "center" }) => (
  <div style={{ display: "flex", alignItems: align, gap: 12, minHeight: 32 }}>
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: 240, // Wider for long labels
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

const DialingTimeoutPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(DIALING_TIMEOUT_INITIAL_FORM);
  const [timeoutData, setTimeoutData] = useState(DIALING_TIMEOUT_INITIAL_DATA);
  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleOpenModal = () => {
    // Load current data into form
    setFormData({
      interDigitTimeout: String(timeoutData.interDigitTimeout),
      offHookTimeout: String(timeoutData.offHookTimeout),
      description: timeoutData.description || "example",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(DIALING_TIMEOUT_INITIAL_FORM);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Validation
    if (!formData.description || formData.description.trim() === "") {
      showMessage("error", "Description is required.");
      return;
    }

    if (
      !formData.interDigitTimeout ||
      formData.interDigitTimeout.trim() === ""
    ) {
      showMessage("error", "Inter Digit Timeout is required.");
      return;
    }

    const interDigit = parseInt(formData.interDigitTimeout);
    if (isNaN(interDigit) || interDigit < 0) {
      showMessage(
        "error",
        "Inter Digit Timeout must be a valid positive number.",
      );
      return;
    }

    if (!formData.offHookTimeout || formData.offHookTimeout.trim() === "") {
      showMessage("error", "Off-hook Waiting Keypress Timeout is required.");
      return;
    }

    const offHook = parseInt(formData.offHookTimeout);
    if (isNaN(offHook) || offHook < 0) {
      showMessage(
        "error",
        "Off-hook Waiting Keypress Timeout must be a valid positive number.",
      );
      return;
    }

    // Update the data
    setTimeoutData({
      ...timeoutData,
      interDigitTimeout: interDigit,
      offHookTimeout: offHook,
      description: formData.description.trim(),
    });

    showMessage("success", "Dialing timeout settings saved successfully!");
    handleCloseModal();
  };

  const handleKeyPress = (e) => {
    const key = e.keyCode || e.which;
    // Allow digits (48-57), backspace (8), delete (127)
    if (!((key >= 48 && key <= 57) || key === 8 || key === 127)) {
      e.preventDefault();
    }
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
              Dialing Timeout
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
          <div style={{ overflowX: "auto", padding: "12px" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                tableLayout: "auto",
                minWidth: 600,
              }}
            >
              <thead>
                <tr>
                  {DIALING_TIMEOUT_TABLE_COLUMNS.map((c) => (
                    <TH key={c.key}>{c.label}</TH>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr
                  style={{
                    background: "#ffffff",
                    borderBottom: "0.5px solid #9ca3af",
                  }}
                >
                  <td
                    style={{
                      textAlign: "center",
                      padding: "8px 0",
                      borderRight: "0.5px solid #edf2f7",
                    }}
                  >
                    <EditDocumentIcon
                      style={{
                        cursor: "pointer",
                        color: "#0284c7",
                        fontSize: 18,
                        margin: "0 auto",
                        opacity: 0.8,
                      }}
                      onClick={handleOpenModal}
                    />
                  </td>
                  <td
                    style={{
                      textAlign: "center",
                      padding: "8px 16px",
                      fontSize: 12,
                      color: C.valueText,
                      borderRight: "0.5px solid #edf2f7",
                    }}
                  >
                    {timeoutData.interDigitTimeout}
                  </td>
                  <td
                    style={{
                      textAlign: "center",
                      padding: "8px 16px",
                      fontSize: 12,
                      color: C.valueText,
                      borderRight: "0.5px solid #edf2f7",
                    }}
                  >
                    {timeoutData.offHookTimeout}
                  </td>
                  <td
                    style={{
                      textAlign: "center",
                      padding: "8px 16px",
                      fontSize: 12,
                      color: C.mutedText,
                    }}
                  >
                    {timeoutData.description}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Edit Modal ── */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth={false}
        disableRestoreFocus
        disableEnforceFocus
        PaperProps={{ sx: { width: 550, maxWidth: "95vw", borderRadius: 2 } }}
      >
        <DialogTitle
          style={{
            background: "#1e2d42",
            color: "#fff",
            fontWeight: 700,
            fontSize: 16,
            textAlign: "center",
            padding: "14px 24px",
          }}
        >
          Edit Dialing Timeout
        </DialogTitle>

        <DialogContent
          style={{ padding: "20px 24px", backgroundColor: C.pageBg }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                background: "#fff",
                border: `1px solid ${C.cardBorder}`,
                borderRadius: 6,
                padding: "20px 24px 16px",
              }}
            >
              <SectionHeading title="Timeout Settings" />

              <FieldRow label="Description" required>
                <TextField
                  name="description"
                  value={formData.description || ""}
                  onChange={handleInputChange}
                  fullWidth
                  size="small"
                  inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
                />
              </FieldRow>

              <FieldRow label="Inter Digit Timeout (s)" required>
                <TextField
                  name="interDigitTimeout"
                  value={formData.interDigitTimeout || ""}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  fullWidth
                  size="small"
                  inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
                />
              </FieldRow>

              <FieldRow label="Off-hook waiting digit timeout (s)" required>
                <TextField
                  name="offHookTimeout"
                  value={formData.offHookTimeout || ""}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  fullWidth
                  size="small"
                  inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
                />
              </FieldRow>
            </div>
          </div>
        </DialogContent>

        <DialogActions
          style={{
            padding: "16px 24px",
            background: C.pageBg,
            borderTop: `1px solid ${C.cardBorder}`,
            justifyContent: "center",
            gap: 12,
          }}
        >
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{
              background: "#1e2d42",
              color: "#fff",
              fontWeight: 600,
              fontSize: 13,
              textTransform: "none",
              padding: "6px 24px",
              minWidth: 120,
              "&:hover": { background: "#0f172a" },
            }}
          >
            Save
          </Button>
          <Button
            onClick={handleCloseModal}
            variant="outlined"
            sx={{
              color: "#1e293b",
              borderColor: "#9ca3af",
              fontWeight: 600,
              fontSize: 13,
              textTransform: "none",
              padding: "6px 24px",
              minWidth: 100,
              "&:hover": { borderColor: "#1e293b", background: "#f8fafc" },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DialingTimeoutPage;
