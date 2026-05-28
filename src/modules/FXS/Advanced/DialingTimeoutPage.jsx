import React, { useState } from "react";
import {
  DIALING_TIMEOUT_TABLE_COLUMNS,
  DIALING_TIMEOUT_INITIAL_FORM,
  DIALING_TIMEOUT_INITIAL_DATA,
} from "../../../sections/advanced/constants/DialingTimeoutConstants"; // Adjust path if needed
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
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#e2e8f0",
  divider: "#f1f5f9",
  cardShadow: "0 4px 20px rgba(15,23,42,0.06)",
  labelText: "#64748b",
  valueText: "#1e293b",
  strongText: "#0f172a",
  mutedText: "#94a3b8",
  accent: "#0284c7",
  primary: "#2563eb",
  errorRed: "#dc2626",
};

// ── Shared UI Components ──────────────────────────────────────────────────────
const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type = "button",
}) => {
  const styles = {
    default: { background: C.cardBg, color: C.valueText, border: "1px solid #9ca3af" },
    primary: {
      background: "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
      color: "#fff",
      border: "1px solid #5A6F8F",
    },
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
    },
    outline: { background: C.cardBg, color: C.labelText, border: `0.5px solid ${C.cardBorder}` },
  };

  const s = styles[variant] || styles.default;
  const hoverBg = variant === "primary" ? "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)" : variant === "cancel" ? "#b6c2d3" : "#e2e8f0";

  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 14px",
        borderRadius: 10,
        fontSize: 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "all 0.15s ease",
        height: 30,
        gap: 5,
        whiteSpace: "nowrap",
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = hoverBg; }}
      onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.background = s.background; }}
    >
      {children}
    </button>
  );
};

const TH = ({ children, style: extra }) => (
  <th
    style={{
      background: "#f8fafc",
      color: C.labelText,
      fontWeight: 700,
      fontSize: 11,
      padding: "12px 14px",
      textAlign: "center",
      borderBottom: `1px solid ${C.cardBorder}`,
      borderRight: "1px solid #f1f5f9",
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.14em",
      ...extra,
    }}
  >
    {children}
  </th>
);

const FieldRow = ({ label, children, style }) => (
  <div style={{ 
    display: "flex", 
    alignItems: "center", 
    background: "#ffffff",
    border: `1px solid #cbd5e1`,
    borderRadius: 6,
    padding: "6px 12px",
    gap: 12, 
    minHeight: 40,
    ...style 
  }}>
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: "#1e293b",
        width: 160,
        flexShrink: 0,
      }}
    >
      {label}:
    </label>
    <div className="flex-1" style={{ maxWidth: 280 }}>{children}</div>
  </div>
);

const SectionHeading = ({ title }) => (
  <div
    style={{
      fontSize: 13,
      fontWeight: 700,
      color: C.strongText,
      marginBottom: 14,
      borderBottom: `1px solid ${C.cardBorder}`,
      paddingBottom: 6,
    }}
  >
    {title}
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
          <div style={{ fontSize: 12, color: C.mutedText, display: "flex", gap: 4 }}>
            <span>FXS</span>
            <span>&gt;</span>
            <span>Advanced</span>
            <span>&gt;</span>
            <span style={{ color: C.strongText, fontWeight: 600 }}>
              Dialing Timeout
            </span>
          </div>
        </div>

        {/* Main Card */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: 22,
            overflow: "hidden",
            border: `1px solid ${C.cardBorder}`,
            boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 800,
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
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <td
                    style={{
                      textAlign: "center",
                      padding: "4px 8px",
                      borderRight: "0.5px solid #edf2f7",
                    }}
                  >
                    <EditDocumentIcon
  className="cursor-pointer text-blue-600 mx-auto opacity-70 hover:opacity-100 transition-opacity"
  titleAccess="Edit"
  onClick={handleOpenModal}
  style={{ fontSize: 18 }}
/>
                  </td>
                  <td
                    style={{
                      textAlign: "center",
                      padding: "7px 16px",
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
                      padding: "7px 16px",
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
                      padding: "7px 16px",
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
        PaperProps={{ sx: { width: 550, maxWidth: "95vw", borderRadius: "12px", overflow: "hidden" } }}
      >
        <DialogTitle
          style={{
            background: "#1e2d42",
            color: "#fff",
            fontWeight: 600,
            fontSize: 16,
            textAlign: "center",
            padding: "16px 24px",
          }}
        >
          Edit Dialing Timeout
        </DialogTitle>

        <DialogContent
          style={{ padding: "20px 24px", backgroundColor: "#f8fafc" }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                background: "#fff",
                border: `1px solid ${C.cardBorder}`,
                borderRadius: 6,
                padding: 16,
              }}
            >
              <SectionHeading title="Configuration" />
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <FieldRow label="Description">
                <TextField
                  name="description"
                  value={formData.description || ""}
                  onChange={handleInputChange}
                  fullWidth
                  size="small"
                  inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
                />
              </FieldRow>

                <FieldRow label="Inter Digit Timeout (s)">
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

                <FieldRow label="Off-hook wait timeout (s)">
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
          </div>
        </DialogContent>

        <DialogActions
          style={{
            padding: "16px 24px",
            background: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <Btn
            onClick={handleSave}
            variant="primary"
            style={{ minWidth: 120, height: 36, fontSize: 14 }}
          >
            Save
          </Btn>
          <Btn
            onClick={handleCloseModal}
            variant="cancel"
            style={{ minWidth: 120, height: 36, fontSize: 14 }}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DialingTimeoutPage;
