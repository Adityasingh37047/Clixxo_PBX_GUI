import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  PCM_PCM_TABLE_HEADERS,
  PCM_PCM_SIGNALING_PROTOCOL_OPTIONS,
  PCM_PCM_CLOCK_OPTIONS,
  PCM_PCM_CONNECTION_LINE_OPTIONS,
  PCM_PCM_FIELD_TOOLTIPS,
  PCM_PCM_PAGE_BREADCRUMB_ROOT,
  PCM_PCM_PAGE_BREADCRUMB_SECTION,
  PCM_PCM_PAGE_TITLE,
  PCM_PCM_MODAL_TITLE_EDIT,
  PCM_PCM_SAVE_LABEL,
  PCM_PCM_CLOSE_LABEL,
} from "../../../constants/PcmPcmConstants";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import {
  Checkbox,
  Tooltip,
  useMediaQuery,
} from "@mui/material";

const initialPcmData = [
  {
    pcmNo: 0,
    signalingProtocol: "ISDN User Side",
    clock: "Line-synchronization",
    controlMode: "--",
    signalingTimeSlot: 16,
    signalingLinkType: "--",
    connectionLine: "Twisted Pair Cable",
    crc4: true,
    sipTrunkNo: -1,
    applyToAllPcMs: false,
  },
];

const PCM_PCM_COMPACT_MQ = "(max-width: 768px)";

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

const PcmPcmFieldLabel = ({ tooltipKey, tooltips, children, style = {} }) => {
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

const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  divider: "#e2e6ec",
  labelText: "#3E5475",
  valueText: "#0f172a",
  mutedText: "#94a3b8",
  accent: "#3E5475",
};

const PCM_PCM_CARD_RADIUS = 10;

const pcmPcmPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const pcmPcmPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const pcmPcmCardStyle = {
  background: "#ffffff",
  borderRadius: PCM_PCM_CARD_RADIUS,
  overflow: "hidden",
  border: `1px solid ${C.cardBorder}`,
  boxShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
};

const pcmPcmToolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.divider}`,
  background: "#ffffff",
  flexWrap: "wrap",
  gap: 12,
  borderTopLeftRadius: PCM_PCM_CARD_RADIUS,
  borderTopRightRadius: PCM_PCM_CARD_RADIUS,
  fontWeight: 600,
  fontSize: 13,
  color: C.labelText,
};

const pcmPcmModalFormPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 8,
  padding: 20,
};

const pcmPcmModalCancelBtnStyle = {
  minWidth: 100,
  height: 33,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const PCM_PCM_OUTLINED_BORDER = "#d1d5db";
const PCM_PCM_OUTLINED_HOVER = "#9ca3af";
const PCM_PCM_OUTLINED_FOCUS = "#3E5475";
const PCM_PCM_FOCUS_RING_SHADOW = "0 0 0 2px rgba(62, 84, 117, 0.15)";

const pcmPcmSetFieldDefault = (el) => {
  el.style.borderColor = PCM_PCM_OUTLINED_BORDER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};
const pcmPcmSetFieldHover = (el) => {
  el.style.borderColor = PCM_PCM_OUTLINED_HOVER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};
const pcmPcmSetFieldFocus = (el) => {
  el.style.borderColor = PCM_PCM_OUTLINED_FOCUS;
  el.style.borderWidth = "1px";
  el.style.boxShadow = PCM_PCM_FOCUS_RING_SHADOW;
};
const pcmPcmInputInteraction = {
  onFocus: (e) => {
    if (e.target.disabled) return;
    pcmPcmSetFieldFocus(e.target);
  },
  onBlur: (e) => pcmPcmSetFieldDefault(e.target),
  onMouseEnter: (e) => {
    if (e.target.disabled) return;
    if (document.activeElement === e.target) pcmPcmSetFieldFocus(e.target);
    else pcmPcmSetFieldHover(e.target);
  },
  onMouseLeave: (e) => {
    if (document.activeElement === e.target) pcmPcmSetFieldFocus(e.target);
    else pcmPcmSetFieldDefault(e.target);
  },
};
const pcmPcmInputStyle = {
  width: "100%",
  height: 32,
  padding: "0 10px",
  fontSize: 13,
  lineHeight: 1.35,
  border: `1px solid ${PCM_PCM_OUTLINED_BORDER}`,
  borderRadius: 4,
  outline: "none",
  backgroundColor: "#fff",
  color: C.valueText,
  boxSizing: "border-box",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};
const pcmPcmSelectStyle = {
  ...pcmPcmInputStyle,
  padding: "0 28px 0 10px",
  appearance: "auto",
  cursor: "pointer",
};

const PcmPcmFieldRow = ({ label, tooltipKey, children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    <PcmPcmFieldLabel
      tooltipKey={tooltipKey}
      tooltips={PCM_PCM_FIELD_TOOLTIPS}
      style={{
        width: 170,
        flexShrink: 0,
        textAlign: "left",
        whiteSpace: "nowrap",
        fontSize: 13,
      }}
    >
      {label}
    </PcmPcmFieldLabel>
    <div style={{ flex: 1, minWidth: 0, width: "100%" }}>{children}</div>
  </div>
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
      ...extra,
    }}
  >
    {children}
  </th>
);

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
}) => {
  const styles = {
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
      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
    },
  };
  const s = styles[variant] || styles.cancel;
  const hoverBg =
    variant === "primary"
      ? "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)"
      : "#b6c2d3";
  const baseBg = extraStyle?.background ?? s.background;
  return (
    <button
      type="button"
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
        height: 30,
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

const PcmPcmBreadcrumb = () => (
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
    <span>{PCM_PCM_PAGE_BREADCRUMB_ROOT}</span>
    <span>&gt;</span>
    <span>{PCM_PCM_PAGE_BREADCRUMB_SECTION}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>
      {PCM_PCM_PAGE_TITLE}
    </span>
  </div>
);

const PcmPcmPage = () => {
  const isCompact = useMediaQuery(PCM_PCM_COMPACT_MQ);
  const [pcmData, setPcmData] = useState(initialPcmData);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [modalForm, setModalForm] = useState({});

  const openModal = (idx) => {
    setEditIndex(idx);
    setModalForm({ ...pcmData[idx] });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditIndex(null);
  };

  const handleModalChange = (field, value) => {
    setModalForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleModalCheckbox = (field) => {
    setModalForm((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = () => {
    setPcmData((prev) =>
      prev.map((row, i) => (i === editIndex ? { ...modalForm } : row)),
    );
    closeModal();
  };

  const renderCell = (row, header, colIndex) => {
    const keys = [
      "pcmNo",
      "signalingProtocol",
      "clock",
      "controlMode",
      "signalingTimeSlot",
      "signalingLinkType",
      "connectionLine",
      "crc4",
      "sipTrunkNo",
    ];
    const key = keys[colIndex];
    if (key === "crc4") return row.crc4 ? "Enable" : "Disable";
    return row[key] ?? "—";
  };

  return (
    <div
      style={{
        ...pcmPcmPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={pcmPcmPageInnerStyle}>
        <PcmPcmBreadcrumb />

        <div style={pcmPcmCardStyle}>
          <div style={pcmPcmToolbarStyle}>
            <span>{PCM_PCM_PAGE_TITLE}</span>
          </div>

          <div style={{ overflowX: "auto", width: "100%" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: 0,
                tableLayout: "auto",
                minWidth: 900,
                ...(isCompact ? { minWidth: 720 } : {}),
              }}
            >
              <thead>
                <tr>
                  {PCM_PCM_TABLE_HEADERS.map((h, i) => (
                    <TH
                      key={h}
                      style={{
                        borderLeft: i === 0 ? "none" : undefined,
                        borderRight:
                          i === PCM_PCM_TABLE_HEADERS.length - 1
                            ? "none"
                            : undefined,
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                      }}
                    >
                      {h}
                    </TH>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pcmData.map((row, idx) => (
                  <tr
                    key={idx}
                    style={{
                      background: idx % 2 === 1 ? "#f8fafc" : "#ffffff",
                      transition: "background 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        idx % 2 === 1 ? "#f8fafc" : "#ffffff";
                    }}
                  >
                    {PCM_PCM_TABLE_HEADERS.slice(0, -1).map((h, colIndex) => (
                      <td
                        key={`${idx}-${h}`}
                        style={{
                          ...tdStyle,
                          borderLeft: colIndex === 0 ? "none" : undefined,
                          fontWeight: 400,
                        }}
                      >
                        {renderCell(row, h, colIndex)}
                      </td>
                    ))}
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
                          onClick={() => openModal(idx)}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalOpen &&
        createPortal(
          <div
            role="presentation"
            onClick={closeModal}
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
              aria-labelledby="pcm-pcm-dialog-title"
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 560,
                maxWidth: "95vw",
                maxHeight: "calc(100vh - 128px)",
                background: C.cardBg,
                borderRadius: 8,
                overflow: "hidden",
                boxShadow:
                  "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                id="pcm-pcm-dialog-title"
                style={{
                  background: "#1e2d42",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: 16,
                  padding: "16px 24px",
                  textAlign: "center",
                  flexShrink: 0,
                }}
              >
                {PCM_PCM_MODAL_TITLE_EDIT}
              </div>
              <div
                style={{
                  padding: "24px",
                  backgroundColor: "#ffffff",
                  overflowY: "auto",
                  flex: "1 1 auto",
                }}
              >
                <div style={pcmPcmModalFormPanelStyle}>
                  <PcmPcmFieldRow label="PCM No.:" tooltipKey="pcmNo">
                    <input
                      type="text"
                      value={modalForm.pcmNo ?? ""}
                      onChange={(e) =>
                        handleModalChange("pcmNo", e.target.value)
                      }
                      style={pcmPcmInputStyle}
                      {...pcmPcmInputInteraction}
                    />
                  </PcmPcmFieldRow>
                  <PcmPcmFieldRow
                    label="Signaling Protocol:"
                    tooltipKey="signalingProtocol"
                  >
                    <select
                      value={modalForm.signalingProtocol ?? ""}
                      onChange={(e) =>
                        handleModalChange("signalingProtocol", e.target.value)
                      }
                      style={pcmPcmSelectStyle}
                      {...pcmPcmInputInteraction}
                    >
                      {PCM_PCM_SIGNALING_PROTOCOL_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </PcmPcmFieldRow>
                  <PcmPcmFieldRow
                    label="Signaling Time Slot:"
                    tooltipKey="signalingTimeSlot"
                  >
                    <input
                      type="text"
                      value={modalForm.signalingTimeSlot ?? ""}
                      onChange={(e) =>
                        handleModalChange("signalingTimeSlot", e.target.value)
                      }
                      style={pcmPcmInputStyle}
                      {...pcmPcmInputInteraction}
                    />
                  </PcmPcmFieldRow>
                  <PcmPcmFieldRow label="Clock:" tooltipKey="clock">
                    <select
                      value={modalForm.clock ?? ""}
                      onChange={(e) =>
                        handleModalChange("clock", e.target.value)
                      }
                      style={pcmPcmSelectStyle}
                      {...pcmPcmInputInteraction}
                    >
                      {PCM_PCM_CLOCK_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </PcmPcmFieldRow>
                  <PcmPcmFieldRow
                    label="Connection Line:"
                    tooltipKey="connectionLine"
                  >
                    <select
                      value={modalForm.connectionLine ?? ""}
                      onChange={(e) =>
                        handleModalChange("connectionLine", e.target.value)
                      }
                      style={pcmPcmSelectStyle}
                      {...pcmPcmInputInteraction}
                    >
                      {PCM_PCM_CONNECTION_LINE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </PcmPcmFieldRow>
                  <PcmPcmFieldRow
                    label="Option Sip Trunk ID:"
                    tooltipKey="sipTrunkNo"
                  >
                    <input
                      type="text"
                      value={modalForm.sipTrunkNo ?? ""}
                      onChange={(e) =>
                        handleModalChange("sipTrunkNo", e.target.value)
                      }
                      style={pcmPcmInputStyle}
                      {...pcmPcmInputInteraction}
                    />
                  </PcmPcmFieldRow>
                  <PcmPcmFieldRow label="Enable CRC-4" tooltipKey="crc4">
                    <Checkbox
                      checked={!!modalForm.crc4}
                      onChange={() => handleModalCheckbox("crc4")}
                      sx={{
                        color: "#6b7280",
                        "&.Mui-checked": { color: "#3E5475" },
                        padding: 0,
                      }}
                    />
                  </PcmPcmFieldRow>
                  <PcmPcmFieldRow
                    label="Apply to All PCMs"
                    tooltipKey="applyToAllPcMs"
                  >
                    <Checkbox
                      checked={!!modalForm.applyToAllPcMs}
                      onChange={() => handleModalCheckbox("applyToAllPcMs")}
                      sx={{
                        color: "#6b7280",
                        "&.Mui-checked": { color: "#3E5475" },
                        padding: 0,
                      }}
                    />
                  </PcmPcmFieldRow>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 12,
                  padding: "16px 24px 24px",
                  background: "#ffffff",
                  flexShrink: 0,
                }}
              >
                <Btn variant="primary" onClick={handleSave}>
                  {PCM_PCM_SAVE_LABEL}
                </Btn>
                <Btn
                  variant="cancel"
                  onClick={closeModal}
                  style={pcmPcmModalCancelBtnStyle}
                >
                  {PCM_PCM_CLOSE_LABEL}
                </Btn>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default PcmPcmPage;
