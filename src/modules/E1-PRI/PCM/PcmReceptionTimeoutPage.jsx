import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  PCM_RECEPTION_TIMEOUT_FIELDS,
  PCM_RECEPTION_TIMEOUT_INITIAL_FORM,
} from "../../../constants/PcmReceptionTimeoutConstants";
import { Alert } from "@mui/material";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import {
  addHostFormPanelStyle,
  nativeFieldInputStyle,
  nativeFieldInteraction,
} from "../../../sections/advanced/advancedSharedUi";

// ── Color palette (same as SIPAccountGenerator) ───────────────────────────────
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#9CA3AF",
  divider: "#9CA3AF",
  cardShadow: "0 10px 30px rgba(15,23,42,0.06)",
  labelText: "#3E5475",
  valueText: "#0f172a",
  strongText: "#0f172a",
  mutedText: "#94a3b8",
  accent: "#3E5475",
  errorRed: "#dc2626",
};

const CARD_RADIUS = 20;

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
      background:
        "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
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
  border: `1.5px solid ${C.cardBorder}`,
  borderRadius: 10,
  boxShadow: C.cardShadow,
  overflow: "hidden",
  marginBottom: 24,
};

const blueBarStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: CARD_RADIUS,
  borderTopRightRadius: CARD_RADIUS,
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  borderBottom: `1px solid ${C.cardBorder}`,
};

const TH = ({ children, style: extra }) => (
  <th
    style={{
      background: "#F8FAFC",
      color: C.labelText,
      fontWeight: 700,
      fontSize: 11,
      padding: "9px 14px",
      textAlign: "center",
      borderBottom: `1px solid ${C.cardBorder}`,
      borderRight: `1px solid ${C.cardBorder}`,
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.14em",
      ...extra,
    }}
  >
    {children}
  </th>
);

const tdStyle = {
  padding: "7px 14px",
  fontSize: 13,
  color: C.valueText,
  textAlign: "center",
  borderBottom: `1px solid ${C.cardBorder}`,
  borderRight: `1px solid ${C.cardBorder}`,
  whiteSpace: "nowrap",
};

const PcmReceptionTimeoutPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    ...PCM_RECEPTION_TIMEOUT_INITIAL_FORM,
  });
  const [timeoutData, setTimeoutData] = useState(
    PCM_RECEPTION_TIMEOUT_INITIAL_FORM,
  );
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

  useEffect(() => {
    if (!isModalOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setIsModalOpen(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isModalOpen]);

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

          <div style={{ overflowX: "auto", width: "100%" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: 0,
                tableLayout: "auto",
                minWidth: 600,
              }}
            >
              <thead>
                <tr>
                  <TH
                    style={{
                      borderLeft: "none",
                      position: "sticky",
                      top: 0,
                      zIndex: 10,
                    }}
                  >
                    Inter Digit Timeout (s)
                  </TH>
                  <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                    Description
                  </TH>
                  <TH
                    style={{
                      width: 70,
                      borderRight: "none",
                      position: "sticky",
                      top: 0,
                      zIndex: 10,
                    }}
                  >
                    Modify
                  </TH>
                </tr>
              </thead>
              <tbody>
                <tr style={{ background: "#ffffff" }}>
                  <td
                    style={{
                      ...tdStyle,
                      borderLeft: "none",
                      borderBottom: "none",
                      borderBottomLeftRadius: CARD_RADIUS,
                    }}
                  >
                    {timeoutData.interDigitTimeout ?? "—"}
                  </td>
                  <td style={{ ...tdStyle, borderBottom: "none" }}>
                    {timeoutData.description ?? "—"}
                  </td>
                  <td
                    style={{
                      ...tdStyle,
                      borderRight: "none",
                      borderBottom: "none",
                      borderBottomRightRadius: CARD_RADIUS,
                    }}
                  >
                    <EditDocumentIcon
                      className="cursor-pointer text-blue-600 opacity-70 hover:opacity-100 transition-opacity"
                      titleAccess="Edit"
                      onClick={handleOpenModal}
                      style={{ fontSize: 22 }}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Edit Modal (portal + backdrop click — same as Number-Receiving Rule UX) ── */}
      {isModalOpen &&
        createPortal(
          <div
            role="presentation"
            onClick={handleCloseModal}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1400,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
              boxSizing: "border-box",
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="pcm-reception-timeout-dialog-title"
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 500,
                maxWidth: "95vw",
                background: C.cardBg,
                borderRadius: 8,
                overflow: "hidden",
                boxShadow:
                  "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
              }}
            >
              <div
                id="pcm-reception-timeout-dialog-title"
                style={{
                  background: "#1e2d42",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: 16,
                  padding: "16px 24px",
                  textAlign: "center",
                }}
              >
                Number-Receiving Timeout
              </div>
              <div style={{ padding: "24px", backgroundColor: "#ffffff" }}>
                <div style={addHostFormPanelStyle}>
                  {PCM_RECEPTION_TIMEOUT_FIELDS.map((field) => (
                    <div
                      key={field.name}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 12,
                      }}
                    >
                      <label
                        style={{
                          width: 170,
                          fontSize: 13,
                          fontWeight: 600,
                          color: C.labelText,
                          textAlign: "left",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {field.label}:
                      </label>
                      <div style={{ width: "min(100%, 320px)" }}>
                        <input
                          type={field.type || "text"}
                          name={field.name}
                          value={formData[field.name] ?? ""}
                          onChange={handleInputChange}
                          placeholder={field.placeholder || ""}
                          style={{
                            ...nativeFieldInputStyle,
                            height: 32,
                            width: "100%",
                            color: "#1e293b",
                          }}
                          {...nativeFieldInteraction}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 16,
                  padding: "16px 24px",
                  background: "#f8fafc",
                  borderTop: `1px solid ${C.cardBorder}`,
                }}
              >
                <Btn
                  variant="primary"
                  onClick={handleSave}
                  style={{ minWidth: 100, height: 33 }}
                >
                  Save
                </Btn>
                <Btn
                  variant="cancel"
                  onClick={handleCloseModal}
                  style={{ minWidth: 100, height: 33 }}
                >
                  Cancel
                </Btn>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default PcmReceptionTimeoutPage;
