import React, { useState } from "react";
import {
  PCM_RECEPTION_TIMEOUT_FIELDS,
  PCM_RECEPTION_TIMEOUT_INITIAL_FORM,
} from "../../../constants/PcmReceptionTimeoutConstants";
import { Alert } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import EditDocumentIcon from "@mui/icons-material/EditDocument";

// ── Color palette (same as SIPAccountGenerator) ───────────────────────────────
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
  errorRed: "#dc2626",
};

// ── Button Component (same as SIPAccountGenerator) ────────────────────────────
const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
}) => {
  const styles = {
    default: {
      background: C.cardBg,
      color: C.valueText,
      border: "1px solid #9ca3af",
    },
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
  };

  const s = styles[variant] || styles.default;
  const hoverBg = (() => {
    switch (variant) {
      case "primary":
        return "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)";
      case "cancel":
        return "#b6c2d3";
      default:
        return "#e2e8f0";
    }
  })();

  const baseBg = s.background;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 14px",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "all 0.15s ease",
        height: 36,
        gap: 6,
        whiteSpace: "nowrap",
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.background = baseBg;
      }}
    >
      {children}
    </button>
  );
};

const tableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 20,
  boxShadow: C.cardShadow,
  overflow: "hidden",
  marginBottom: 24,
};

const blueBarStyle = {
  width: "100%",
  height: 44,
  background: C.cardBg,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 20px",
  fontWeight: 700,
  fontSize: 13,
  color: C.strongText,
  borderBottom: `1px solid ${C.divider}`,
};

const thStyle = {
  background: C.pageBg,
  color: C.labelText,
  fontWeight: 700,
  fontSize: 11,
  padding: "10px 16px",
  textAlign: "center",
  borderBottom: `1px solid ${C.cardBorder}`,
  borderRight: `1px solid ${C.divider}`,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "10px 16px",
  fontSize: 13,
  color: C.valueText,
  borderBottom: `1px solid ${C.divider}`,
  borderRight: `1px solid ${C.divider}`,
  textAlign: "center",
};

const PcmReceptionTimeoutPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ ...PCM_RECEPTION_TIMEOUT_INITIAL_FORM });
  const [timeoutData, setTimeoutData] = useState(PCM_RECEPTION_TIMEOUT_INITIAL_FORM);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const handleOpenModal = () => {
    setFormData({ ...timeoutData });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setTimeoutData(formData);
    setIsModalOpen(false);
    showToast("Timeout settings saved successfully", "success");
  };

  return (
    <div
      className="min-h-[calc(100vh-80px)] p-4 flex flex-col items-center"
      style={{ backgroundColor: C.pageBg }}
    >
      {/* ── Toast ── */}
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={() => setToast({ msg: "", type: "success" })}
          sx={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            minWidth: 300,
            boxShadow: 3,
          }}
        >
          {toast.msg}
        </Alert>
      )}

      {/* ── Breadcrumb ── */}
      <div className="w-full">
        <div
          style={{
            fontSize: 12,
            color: C.mutedText,
            marginBottom: 16,
            fontWeight: 400,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span>E1-PRI</span>
          <span>&gt;</span>
          <span>PCM</span>
          <span>&gt;</span>
          <span style={{ color: C.strongText, fontWeight: 600 }}>
            Number-Receiving Timeout Info
          </span>
        </div>

        {/* ── Main Card ── */}
        <div style={tableContainerStyle}>
          <div style={blueBarStyle}>
            <span>Number-Receiving Timeout Info</span>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse" style={{ tableLayout: "auto" }}>
              <thead>
                <tr>
                  <th style={thStyle}>Inter Digit Timeout (s)</th>
                  <th style={thStyle}>Description</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Modify</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  style={{ background: "#ffffff", transition: "background-color 0.15s ease" }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f8fafc"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#ffffff"; }}
                >
                  <td style={tdStyle}>{timeoutData.interDigitTimeout ?? "—"}</td>
                  <td style={tdStyle}>{timeoutData.description ?? "—"}</td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <EditDocumentIcon
                      className="cursor-pointer text-blue-600 opacity-70 hover:opacity-100 transition-opacity"
                      titleAccess="Edit"
                      onClick={handleOpenModal}
                    />
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
        onClose={(event, reason) => {
          if (reason === "backdropClick") return;
          handleCloseModal();
        }}
        maxWidth={false}
        slotProps={{
          backdrop: {
            sx: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
          },
        }}
        PaperProps={{
          sx: {
            width: 500,
            maxWidth: "95vw",
            mx: "auto",
            borderRadius: "8px",
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
            backgroundColor: "#f8fafc",
            backgroundImage: "none",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            fontSize: "16px",
            color: "#ffffff",
            backgroundColor: "#1e2d42",
            borderBottom: `1px solid ${C.cardBorder}`,
            px: 3,
            py: 2,
            textAlign: "center",
            borderTopLeftRadius: "8px",
            borderTopRightRadius: "8px",
          }}
        >
          Number-Receiving Timeout
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            p: "20px 24px",
            pt: "24px !important",
            backgroundColor: "#f8fafc",
          }}
        >
          {PCM_RECEPTION_TIMEOUT_FIELDS.map((field) => (
            <div
              key={field.name}
              style={{
                display: "flex",
                alignItems: "center",
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: 6,
                padding: "6px 12px",
              }}
            >
              <label
                style={{
                  width: 160,
                  fontSize: 12,
                  fontWeight: 600,
                  color: C.labelText,
                  textAlign: "left",
                  marginRight: 10,
                  whiteSpace: "nowrap",
                }}
              >
                {field.label}:
              </label>
              <input
                type={field.type || "text"}
                name={field.name}
                value={formData[field.name] ?? ""}
                onChange={handleInputChange}
                placeholder={field.placeholder || ""}
                style={{
                  flex: 1,
                  fontSize: 13,
                  padding: "6px 8px",
                  borderRadius: 4,
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#1e293b",
                  outline: "none",
                  width: "100%",
                  transition: "border-color 0.2s ease",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#1e2d42")}
                onBlur={(e) => (e.target.style.borderColor = "#cbd5e1")}
                onMouseEnter={(e) => {
                  if (document.activeElement !== e.target)
                    e.target.style.borderColor = "#94a3b8";
                }}
                onMouseLeave={(e) => {
                  if (document.activeElement !== e.target)
                    e.target.style.borderColor = "#cbd5e1";
                }}
              />
            </div>
          ))}
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: "center",
            gap: 2,
            p: 3,
            borderTop: `1px solid ${C.cardBorder}`,
            backgroundColor: "#f8fafc",
          }}
        >
          <Btn
            variant="primary"
            onClick={handleSave}
            style={{ minWidth: 100, height: 36, fontSize: 13 }}
          >
            Save
          </Btn>
          <Btn
            variant="cancel"
            onClick={handleCloseModal}
            style={{ minWidth: 100, height: 36, fontSize: 13 }}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PcmReceptionTimeoutPage;
