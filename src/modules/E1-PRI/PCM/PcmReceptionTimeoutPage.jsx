import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  PCM_RECEPTION_TIMEOUT_FIELDS,
  PCM_RECEPTION_TIMEOUT_INITIAL_FORM,
  PCM_RECEPTION_TIMEOUT_FIELD_TOOLTIPS,
  PCM_RECEPTION_TIMEOUT_PAGE_BREADCRUMB_ROOT,
  PCM_RECEPTION_TIMEOUT_PAGE_BREADCRUMB_SECTION,
  PCM_RECEPTION_TIMEOUT_PAGE_TITLE,
  PCM_RECEPTION_TIMEOUT_MODAL_TITLE_EDIT,
  PCM_RECEPTION_TIMEOUT_SAVE_LABEL,
  PCM_RECEPTION_TIMEOUT_CLOSE_LABEL,
} from "../../../constants/PcmReceptionTimeoutConstants";
import { Alert, Tooltip, useMediaQuery } from "@mui/material";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
// ── Page-local field label tooltip UI (not shared) ──
const FIELD_LABEL_COLOR = "#3E5475";

const FIELD_TOOLTIP_PROPS = {
  arrow: true,
  placement: "top",
  slotProps: {
    tooltip: {
      sx: {
        backgroundColor: "#fff",
        color: "#333",
        border: "1px solid #d1d5db",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        fontSize: 12,
        lineHeight: 1.45,
        maxWidth: 500,
        padding: "10px 12px",
        textTransform: "none",
        letterSpacing: "normal",
      },
    },
    arrow: { sx: { color: "#fff" } },
  },
};

const formatFieldTooltipTitle = (text) => {
  if (!text) return "";
  const normalized = text.replace(/<br\s*\/?>/gi, "\n").replace(/&quot;/g, '"');
  if (normalized.includes("\n")) {
    return (
      <span style={{ whiteSpace: "pre-line", display: "block" }}>
        {normalized}
      </span>
    );
  }
  return normalized;
};

const PcmReceptionTimeoutFieldLabel = ({ tooltipKey, tooltips, children, style = {} }) => {
  const tooltip = tooltipKey ? tooltips[tooltipKey] || "" : "";
  const labelNode = (
    <span
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: FIELD_LABEL_COLOR,
        cursor: tooltip ? "help" : undefined,
        ...style,
      }}
    >
      {children}
    </span>
  );
  if (!tooltip) return labelNode;
  return (
    <Tooltip title={formatFieldTooltipTitle(tooltip)} {...FIELD_TOOLTIP_PROPS}>
      {labelNode}
    </Tooltip>
  );
};

const PCM_RECEPTION_TIMEOUT_COMPACT_MQ = "(max-width: 768px)";

const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  divider: "#e2e6ec",
  labelText: "#3E5475",
  valueText: "#0f172a",
  mutedText: "#94a3b8",
  strongText: "#0f172a",
  accent: "#3E5475",
  amber: "#dc2626",
  errorRed: "#dc2626",
  successGreen: "#16a34a",
};

const PCM_RECEPTION_TIMEOUT_CARD_RADIUS = 10;

const pcmReceptionTimeoutPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const pcmReceptionTimeoutPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const pcmReceptionTimeoutCardStyle = {
  width: "100%",
  maxWidth: "100%",
  background: "#ffffff",
  borderRadius: PCM_RECEPTION_TIMEOUT_CARD_RADIUS,
  overflow: "hidden",
  border: `1px solid ${C.cardBorder}`,
  boxShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
};

const pcmReceptionTimeoutToolbarStyle = {
  width: "100%",
  minHeight: 44,
  background: "#ffffff",
  borderTopLeftRadius: PCM_RECEPTION_TIMEOUT_CARD_RADIUS,
  borderTopRightRadius: PCM_RECEPTION_TIMEOUT_CARD_RADIUS,
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  fontWeight: 600,
  fontSize: 13,
  color: C.labelText,
  borderBottom: `1px solid ${C.divider}`,
};

const pcmReceptionTimeoutFormPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 8,
  padding: 20,
};

const pcmReceptionTimeoutModalCancelBtnStyle = {
  minWidth: 100,
  height: 33,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const PcmReceptionTimeoutBreadcrumb = () => (
  <div
    style={{
      fontSize: 12,
      color: "#94a3b8",
      marginBottom: 16,
      fontWeight: 400,
      display: "flex",
      alignItems: "center",
      gap: 4,
      flexWrap: "wrap",
    }}
  >
    <span>{PCM_RECEPTION_TIMEOUT_PAGE_BREADCRUMB_ROOT}</span>
    <span>&gt;</span>
    <span>{PCM_RECEPTION_TIMEOUT_PAGE_BREADCRUMB_SECTION}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>
      {PCM_RECEPTION_TIMEOUT_PAGE_TITLE}
    </span>
  </div>
);

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
  form,
  component,
  title,
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
      fontWeight: 600,
    },
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15,23,42,0.08)",
    },
    danger: {
      background: "#fef2f2",
      color: C.amber,
      border: "0.5px solid #fecaca",
    },
    outline: {
      background: C.cardBg,
      color: C.labelText,
      border: `1px solid ${C.cardBorder}`,
    },
  };
  const s = styles[variant] || styles.default;
  const hoverBg =
    {
      primary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      cancel: "#b6c2d3",
      danger: "#fca5a5",
      outline: "#e2e8f0",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      cancel: "#a3b1c2",
      danger: "#f87171",
      outline: "#d1d9e6",
      default: "#d1d5db",
    }[variant] || "#d1d5db";
  const baseBg = extraStyle?.background ?? s.background;
  const baseShadow = extraStyle?.boxShadow ?? s.boxShadow ?? "none";

  const clearPressStyle = (el) => {
    el.style.transform = "";
    el.style.boxShadow = baseShadow;
  };

  const applyPressStyle = (el) => {
    el.style.background = activeBg;
    el.style.transform = "translateY(1px) scale(0.98)";
    el.style.boxShadow =
      variant === "primary"
        ? "inset 0 2px 4px rgba(0, 0, 0, 0.25)"
        : variant === "cancel"
          ? "inset 0 2px 4px rgba(15, 23, 42, 0.15)"
          : "inset 0 1px 3px rgba(15, 23, 42, 0.12)";
  };

  const Component = component || "button";
  return (
    <Component
      type={type}
      form={form}
      title={title}
      onClick={onClick}
      disabled={disabled}
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
        transition:
          "background 0.15s ease, transform 0.1s ease, box-shadow 0.1s ease",
        height: 30,
        gap: 6,
        whiteSpace: "nowrap",
        userSelect: "none",
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = baseBg;
        clearPressStyle(e.currentTarget);
      }}
      onMouseDown={(e) => {
        if (disabled) return;
        applyPressStyle(e.currentTarget);
      }}
      onMouseUp={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = hoverBg;
        clearPressStyle(e.currentTarget);
      }}
    >
      {children}
    </Component>
  );
};

// ── PBX modal field UI (native inputs) ──
const PCM_RECEPTION_TIMEOUT_OUTLINED_BORDER = "#d1d5db";
const PCM_RECEPTION_TIMEOUT_OUTLINED_HOVER = "#9ca3af";
const PCM_RECEPTION_TIMEOUT_OUTLINED_FOCUS = "#3E5475";
const PCM_RECEPTION_TIMEOUT_FOCUS_RING_SHADOW =
  "0 0 0 2px rgba(62, 84, 117, 0.15)";

const setFieldDefault = (el) => {
  el.style.borderColor = PCM_RECEPTION_TIMEOUT_OUTLINED_BORDER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const setFieldHover = (el) => {
  el.style.borderColor = PCM_RECEPTION_TIMEOUT_OUTLINED_HOVER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const setFieldFocus = (el) => {
  el.style.borderColor = PCM_RECEPTION_TIMEOUT_OUTLINED_FOCUS;
  el.style.borderWidth = "1px";
  el.style.boxShadow = PCM_RECEPTION_TIMEOUT_FOCUS_RING_SHADOW;
};

const nativeFieldInputStyle = {
  width: "100%",
  height: 32,
  padding: "0 10px",
  fontSize: 13,
  lineHeight: 1.35,
  border: `1px solid ${PCM_RECEPTION_TIMEOUT_OUTLINED_BORDER}`,
  borderRadius: 4,
  outline: "none",
  backgroundColor: "#fff",
  color: "#0f172a",
  boxSizing: "border-box",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const nativeFieldInteraction = {
  onFocus: (e) => {
    if (e.target.disabled) return;
    setFieldFocus(e.target);
  },
  onBlur: (e) => {
    setFieldDefault(e.target);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled) return;
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldHover(e.target);
    }
  },
  onMouseLeave: (e) => {
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldDefault(e.target);
    }
  },
};

const pcmReceptionTimeoutModalFormPanelStyle = pcmReceptionTimeoutFormPanelStyle;

const TH = ({ children, style: extra }) => (
  <th
    style={{
      background: "#F8FAFC",
      color: C.labelText,
      fontWeight: 700,
      fontSize: 11,
      padding: "9px 14px",
      textAlign: "center",
      borderBottom: `1px solid ${C.divider}`,
      borderRight: `1px solid ${C.divider}`,
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.14em",
      position: "sticky",
      top: 0,
      zIndex: 10,
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
  borderBottom: `1px solid ${C.divider}`,
  borderRight: `1px solid ${C.divider}`,
  whiteSpace: "nowrap",
};

const PcmReceptionTimeoutPage = () => {
  const isCompact = useMediaQuery(PCM_RECEPTION_TIMEOUT_COMPACT_MQ);
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
      style={{
        ...pcmReceptionTimeoutPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
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

      <div style={pcmReceptionTimeoutPageInnerStyle}>
        <PcmReceptionTimeoutBreadcrumb />

        <div style={pcmReceptionTimeoutCardStyle}>
          <div style={pcmReceptionTimeoutToolbarStyle}>
            <span>{PCM_RECEPTION_TIMEOUT_PAGE_TITLE}</span>
          </div>

          <div style={{ overflowX: "auto", width: "100%" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: 0,
                tableLayout: "auto",
                minWidth: 600,
                ...(isCompact ? { minWidth: 480 } : {}),
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
                <tr
                  style={{
                    background: "#ffffff",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f8fafc";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#ffffff";
                  }}
                >
                  <td
                    style={{
                      ...tdStyle,
                      borderLeft: "none",
                      borderBottom: "none",
                      fontWeight: 400,
                    }}
                  >
                    {timeoutData.interDigitTimeout ?? "—"}
                  </td>
                  <td
                    style={{
                      ...tdStyle,
                      borderBottom: "none",
                      fontWeight: 400,
                    }}
                  >
                    {timeoutData.description ?? "—"}
                  </td>
                  <td
                    style={{
                      ...tdStyle,
                      borderRight: "none",
                      borderBottom: "none",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <EditDocumentIcon
                        titleAccess="Edit"
                        style={{
                          cursor: "pointer",
                          color: "#2563eb",
                          fontSize: 22,
                          opacity: 0.7,
                          transition: "opacity 0.15s ease",
                        }}
                        onClick={handleOpenModal}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = "1";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = "0.7";
                        }}
                      />
                    </div>
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
                {PCM_RECEPTION_TIMEOUT_MODAL_TITLE_EDIT}
              </div>
              <div style={{ padding: "24px", backgroundColor: "#ffffff" }}>
                <div style={pcmReceptionTimeoutModalFormPanelStyle}>
                  {PCM_RECEPTION_TIMEOUT_FIELDS.map((field) => (
                    <div
                      key={field.name}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <PcmReceptionTimeoutFieldLabel
                        tooltipKey={field.name}
                        tooltips={PCM_RECEPTION_TIMEOUT_FIELD_TOOLTIPS}
                        style={{
                          width: 170,
                          flexShrink: 0,
                          fontSize: 13,
                          textAlign: "left",
                          whiteSpace: "nowrap",
                          display: "inline-block",
                        }}
                      >
                        {field.label}:
                      </PcmReceptionTimeoutFieldLabel>
                      <div style={{ flex: 1, minWidth: 0, width: "100%" }}>
                        <input
                          type={field.type || "text"}
                          name={field.name}
                          value={formData[field.name] ?? ""}
                          onChange={handleInputChange}
                          placeholder={field.placeholder || ""}
                          style={nativeFieldInputStyle}
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
                  style={{ minWidth: 100, height: 33, fontSize: 13 }}
                >
                  Save
                </Btn>
                <Btn
                  variant="cancel"
                  onClick={handleCloseModal}
                  style={pcmReceptionTimeoutModalCancelBtnStyle}
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
