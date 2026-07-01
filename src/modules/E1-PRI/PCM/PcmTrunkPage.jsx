import React, { useState, useRef, useEffect } from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import {
  PCM_TRUNK_INDEX_OPTIONS,
  PCM_TRUNK_PCM_NO_OPTIONS,
  PCM_TRUNK_TS_COUNT,
  PCM_TRUNK_INITIAL_FORM,
  PCM_TRUNK_ITEMS_PER_PAGE,
  PCM_TRUNK_FIELD_TOOLTIPS,
  PCM_TRUNK_PAGE_BREADCRUMB_ROOT,
  PCM_TRUNK_PAGE_BREADCRUMB_SECTION,
  PCM_TRUNK_PAGE_TITLE,
  PCM_TRUNK_EMPTY_MESSAGE,
  PCM_TRUNK_MODAL_TITLE,
  PCM_TRUNK_ADD_NEW_LABEL,
  PCM_TRUNK_SAVE_LABEL,
  PCM_TRUNK_CLOSE_LABEL,
} from "../../../constants/PcmTrunkConstants";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Checkbox from "@mui/material/Checkbox";
import Tooltip from "@mui/material/Tooltip";
import useMediaQuery from "@mui/material/useMediaQuery";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
const PCM_TRUNK_COMPACT_MQ = "(max-width: 768px)";

const PCM_TRUNK_ADD_NEW_DIALOG_MARGIN = 24;
const PCM_TRUNK_ADD_NEW_DIALOG_LAYOUT_OFFSET = 80;

const PCM_TRUNK_ADD_NEW_DIALOG_SX = {
  "& .MuiDialog-container": {
    alignItems: "center",
    justifyContent: "center",
  },
};

const PCM_TRUNK_ADD_NEW_DIALOG_PAPER_SX = {
  margin: PCM_TRUNK_ADD_NEW_DIALOG_MARGIN,
  maxHeight: `calc(100vh - ${PCM_TRUNK_ADD_NEW_DIALOG_LAYOUT_OFFSET}px - ${PCM_TRUNK_ADD_NEW_DIALOG_MARGIN * 2}px)`,
  display: "flex",
  flexDirection: "column",
  width: 600,
  maxWidth: "95vw",
  p: 0,
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

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

const PcmTrunkFieldLabel = ({ tooltipKey, tooltips, children, style = {} }) => {
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

const LOCAL_STORAGE_KEY = "pcm_trunks";

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
};

const CARD_RADIUS = 10;

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
      fontWeight: 600,
      fontSize: 15,
      borderRadius: 6,
      textTransform: "none",
      padding: "6px 28px",
    },
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
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
      outline: "#e2e8f0",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
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
        fontSize: 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "all 0.15s ease",
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

const cellStyle = {
  padding: "7px 14px",
  fontSize: 13,
  color: C.valueText,
  textAlign: "center",
  background: "#ffffff",
  borderBottom: `1px solid ${C.cardBorder}`,
  borderRight: `1px solid ${C.cardBorder}`,
  whiteSpace: "nowrap",
};

const checkboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
};
const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const modalStyle = {
  background: "#f8fafd",
  border: "2px solid #222",
  borderRadius: 6,
  width: 400,
  maxWidth: "95vw",
  marginTop: 80,
  boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
  display: "flex",
  flexDirection: "column",
};
const modalHeaderStyle = {
  background: "linear-gradient(to bottom, #23272b 0%, #6e7a8a 100%)",
  color: "#fff",
  fontWeight: 600,
  fontSize: 18,
  padding: "10px 0",
  textAlign: "center",
  borderTopLeftRadius: 4,
  borderTopRightRadius: 4,
};
const modalBodyStyle = {
  padding: "12px 16px 0 16px",
  display: "flex",
  flexDirection: "column",
  gap: 8,
};
const modalRowStyle = {
  display: "flex",
  alignItems: "center",
  marginBottom: 8,
  gap: 10,
};
const modalLabelStyle = {
  width: 110,
  fontSize: 14,
  color: "#222",
  textAlign: "left",
  marginRight: 10,
  whiteSpace: "nowrap",
};
const modalInputStyle = {
  width: 120,
  fontSize: 14,
  padding: "3px 6px",
  borderRadius: 3,
  border: "1px solid #bbb",
  background: "#fff",
};
const modalFooterStyle = {
  display: "flex",
  justifyContent: "center",
  gap: 24,
  padding: "18px 0",
};
const modalButtonStyle = {
  background: "linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)",
  color: "#fff",
  fontSize: 16,
  padding: "6px 32px",
  border: "none",
  borderRadius: 4,
  boxShadow: "0 2px 4px rgba(0,0,0,0.10)",
  cursor: "pointer",
  minWidth: 90,
};
const modalButtonGrayStyle = {
  ...modalButtonStyle,
  background: "linear-gradient(to bottom, #e3e7ef 0%, #bfc6d1 100%)",
  color: "#222",
};
const addNewButtonStyle = {
  ...modalButtonStyle,
  width: 120,
  marginRight: 12,
  fontSize: 16,
  padding: "7px 32px",
};
const batchAddButtonStyle = {
  ...modalButtonGrayStyle,
  width: 120,
  fontSize: 16,
  padding: "7px 32px",
};
const tableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: CARD_RADIUS,
  boxShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
  overflow: "hidden",
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
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  justifyContent: "center",
  padding: "7px 14px",
  borderBottom: `1px solid ${C.cardBorder}`,
};
const thStyle = {
  background: "#F8FAFC",
  color: C.labelText,
  fontWeight: 700,
  fontSize: 11,
  borderBottom: `1px solid ${C.cardBorder}`,
  borderRight: `1px solid ${C.cardBorder}`,
  padding: "9px 14px",
  whiteSpace: "nowrap",
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  textAlign: "center",
};
const tdStyle = {
  borderBottom: `1px solid ${C.cardBorder}`,
  borderRight: `1px solid ${C.cardBorder}`,
  padding: "7px 14px",
  fontSize: 13,
  background: "#fff",
  textAlign: "center",
  whiteSpace: "nowrap",
  color: C.valueText,
};
const tableButtonStyle = {
  background: "linear-gradient(to bottom, #e3e7ef 0%, #bfc6d1 100%)",
  color: "#222",
  fontSize: 15,
  padding: "4px 18px",
  border: "1px solid #bbb",
  borderRadius: 6,
  boxShadow: "0 1px 2px rgba(0,0,0,0.10)",
  cursor: "pointer",
  fontWeight: 500,
};
const addNewTableButtonStyle = {
  ...tableButtonStyle,
  background: "linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)",
  color: "#fff",
  marginLeft: 12,
  minWidth: 120,
};
const paginationButtonStyle = {
  ...tableButtonStyle,
  fontSize: 13,
  padding: "2px 10px",
  minWidth: 0,
  borderRadius: 4,
};
const pcmTrunkModalFormPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 8,
  padding: 20,
};

const pcmTrunkModalCancelBtnStyle = {
  minWidth: 100,
  height: 33,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const PCM_TRUNK_OUTLINED_BORDER = "#d1d5db";
const PCM_TRUNK_OUTLINED_HOVER = "#9ca3af";
const PCM_TRUNK_OUTLINED_FOCUS = "#3E5475";
const PCM_TRUNK_FOCUS_RING_SHADOW = "0 0 0 2px rgba(62, 84, 117, 0.15)";

const pcmTrunkSetFieldDefault = (el) => {
  el.style.borderColor = PCM_TRUNK_OUTLINED_BORDER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};
const pcmTrunkSetFieldHover = (el) => {
  el.style.borderColor = PCM_TRUNK_OUTLINED_HOVER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};
const pcmTrunkSetFieldFocus = (el) => {
  el.style.borderColor = PCM_TRUNK_OUTLINED_FOCUS;
  el.style.borderWidth = "1px";
  el.style.boxShadow = PCM_TRUNK_FOCUS_RING_SHADOW;
};
const pcmTrunkInputInteraction = {
  onFocus: (e) => {
    if (e.target.disabled) return;
    pcmTrunkSetFieldFocus(e.target);
  },
  onBlur: (e) => pcmTrunkSetFieldDefault(e.target),
  onMouseEnter: (e) => {
    if (e.target.disabled) return;
    if (document.activeElement === e.target) pcmTrunkSetFieldFocus(e.target);
    else pcmTrunkSetFieldHover(e.target);
  },
  onMouseLeave: (e) => {
    if (document.activeElement === e.target) pcmTrunkSetFieldFocus(e.target);
    else pcmTrunkSetFieldDefault(e.target);
  },
};
const pcmTrunkSelectStyle = {
  width: "100%",
  height: 32,
  padding: "0 28px 0 10px",
  fontSize: 13,
  border: `1px solid ${PCM_TRUNK_OUTLINED_BORDER}`,
  borderRadius: 4,
  outline: "none",
  backgroundColor: "#fff",
  color: C.valueText,
  boxSizing: "border-box",
  appearance: "auto",
  cursor: "pointer",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const pageSelectStyle = {
  fontSize: 13,
  padding: "2px 6px",
  borderRadius: 3,
  border: "1px solid #bbb",
  background: "#fff",
};

const PcmTrunkPage = () => {
  const isCompact = useMediaQuery(PCM_TRUNK_COMPACT_MQ);
  const [trunks, setTrunks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(PCM_TRUNK_INITIAL_FORM);
  const [checkAll, setCheckAll] = useState(true);
  const [selected, setSelected] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [page, setPage] = useState(1);
  const totalPages = Math.max(
    1,
    Math.ceil(trunks.length / PCM_TRUNK_ITEMS_PER_PAGE),
  );
  const pagedTrunks = trunks.slice(
    (page - 1) * PCM_TRUNK_ITEMS_PER_PAGE,
    page * PCM_TRUNK_ITEMS_PER_PAGE,
  );

  const handleOpenModal = (item = null, idx = -1) => {
    setForm(item ? { ...item } : PCM_TRUNK_INITIAL_FORM);
    setEditIndex(idx);
    setCheckAll(item ? item.ts.every(Boolean) : true);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => setIsModalOpen(false);

  const handleFormChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleTSChange = (idx) => {
    const newTs = [...form.ts];
    newTs[idx] = !newTs[idx];
    setForm((prev) => ({ ...prev, ts: newTs }));
    setCheckAll(newTs.every(Boolean));
  };

  const handleCheckAllTs = () => {
    const newVal = !checkAll;
    setCheckAll(newVal);
    setForm((prev) => ({
      ...prev,
      ts: Array(PCM_TRUNK_TS_COUNT).fill(newVal),
    }));
  };

  const handleSave = () => {
    setTrunks((prev) => {
      let updated;
      if (editIndex > -1) {
        updated = [...prev];
        updated[(page - 1) * PCM_TRUNK_ITEMS_PER_PAGE + editIndex] = form;
      } else {
        updated = [...prev, form];
      }
      return updated;
    });
    setIsModalOpen(false);
    setEditIndex(-1);
  };

  // Table actions
  const handleSelectRow = (idx) => {
    const realIdx = (page - 1) * PCM_TRUNK_ITEMS_PER_PAGE + idx;
    setSelected((sel) =>
      sel.includes(realIdx)
        ? sel.filter((i) => i !== realIdx)
        : [...sel, realIdx],
    );
  };
  const handleCheckAllRows = () => setSelected(trunks.map((_, idx) => idx));
  const handleUncheckAllRows = () => setSelected([]);
  const handleInverse = () =>
    setSelected(
      trunks
        .map((_, idx) => (!selected.includes(idx) ? idx : null))
        .filter((i) => i !== null),
    );
  const handleDelete = () => {
    const newTrunks = trunks.filter((_, idx) => !selected.includes(idx));
    setTrunks(newTrunks);
    setSelected([]);
  };
  const handleClearAll = () => {
    setTrunks([]);
    setSelected([]);
    setPage(1);
  };
  const handlePageChange = (newPage) =>
    setPage(Math.max(1, Math.min(totalPages, newPage)));

  // UI
  return (
    <div
      style={{
        backgroundColor: C.pageBg,
        minHeight: "calc(100vh - 80px)",
        padding: isCompact ? 8 : 16,
        boxSizing: "border-box",
      }}
    >
      <div style={{ width: "100%", maxWidth: "100%", margin: "0 auto" }}>
        {/* Breadcrumb */}
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
          <span>{PCM_TRUNK_PAGE_BREADCRUMB_ROOT}</span>
          <span>&gt;</span>
          <span>{PCM_TRUNK_PAGE_BREADCRUMB_SECTION}</span>
          <span>&gt;</span>
          <span style={{ color: C.strongText, fontWeight: 600 }}>
            {PCM_TRUNK_PAGE_TITLE}
          </span>
        </div>
        {trunks.length === 0 ? (
          <div
            style={{
              background: "#ffffff",
              borderRadius: CARD_RADIUS,
              border: `1px solid ${C.cardBorder}`,
              boxShadow:
                "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 280,
              padding: 24,
              textAlign: "center",
            }}
          >
            <div
              style={{
                color: "#3E5475",
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 16,
              }}
            >
              {PCM_TRUNK_EMPTY_MESSAGE}
            </div>
            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <Btn
                variant="primary"
                onClick={() => handleOpenModal()}
                style={{ height: 36 }}
              >
                + Add New
              </Btn>
              <Btn variant="cancel" style={{ height: 36 }}>
                Batch Add
              </Btn>
            </div>
          </div>
        ) : (
          <div style={tableContainerStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                minHeight: 44,
                padding: "7px 14px",
                borderBottom: `1px solid ${C.cardBorder}`,
                background: "#ffffff",
                flexWrap: "wrap",
                gap: 12,
                borderTopLeftRadius: CARD_RADIUS,
                borderTopRightRadius: CARD_RADIUS,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {selected.length > 0 && (
                  <span
                    style={{
                      background: "#eff6ff",
                      color: C.accent,
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "5px 12px",
                      borderRadius: 999,
                      border: `1px solid ${C.accent}`,
                    }}
                  >
                    {selected.length} selected
                  </span>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <Btn
                  variant="cancel"
                  onClick={handleInverse}
                  disabled={trunks.length === 0}
                  style={{ height: 30 }}
                >
                  Inverse
                </Btn>
                <Btn
                  variant="cancel"
                  onClick={handleDelete}
                  disabled={selected.length === 0}
                  style={{ height: 30 }}
                >
                  <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                  Delete
                </Btn>
                <Btn
                  variant="cancel"
                  onClick={handleClearAll}
                  disabled={trunks.length === 0}
                  style={{ height: 30 }}
                >
                  Clear All
                </Btn>
                <Btn
                  variant="primary"
                  onClick={() => handleOpenModal()}
                  style={{ height: 30, padding: "6px 14px", fontSize: 12 }}
                >
                  + Add New
                </Btn>
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  tableLayout: "auto",
                  minWidth: 900,
                }}
              >
                <thead>
                  <tr>
                    <TH style={{ width: 36, borderLeft: "none" }}>Check</TH>
                    <TH>Index</TH>
                    <TH>PCM NO.</TH>
                    <TH>Including Ts</TH>
                    <TH style={{ borderRight: "none" }}>Modify</TH>
                  </tr>
                </thead>
                <tbody>
                  {pagedTrunks.map((trunk, idx) => {
                    const isLastRow = idx === pagedTrunks.length - 1;
                    const lastRowCellStyle = isLastRow
                      ? { borderBottom: "none" }
                      : {};
                    return (
                      <tr
                        key={idx}
                        style={{
                          background: selected.includes(
                            (page - 1) * PCM_TRUNK_ITEMS_PER_PAGE + idx,
                          )
                            ? "#e0f2fe"
                            : idx % 2 === 1
                              ? "#f8fafc"
                              : "#ffffff",
                          borderBottom: isLastRow
                            ? "none"
                            : `1px solid ${C.cardBorder}`,
                        }}
                      >
                        <td
                          style={{
                            ...cellStyle,
                            borderLeft: "none",
                            ...lastRowCellStyle,
                            ...(isLastRow
                              ? { borderBottomLeftRadius: CARD_RADIUS }
                              : {}),
                          }}
                        >
                          <Checkbox
                            checked={selected.includes(
                              (page - 1) * PCM_TRUNK_ITEMS_PER_PAGE + idx,
                            )}
                            onChange={() => handleSelectRow(idx)}
                            sx={checkboxSx}
                          />
                        </td>
                        <td style={{ ...cellStyle, ...lastRowCellStyle }}>
                          {trunk.index}
                        </td>
                        <td style={{ ...cellStyle, ...lastRowCellStyle }}>
                          {trunk.pcmNo}
                        </td>
                        <td style={{ ...cellStyle, ...lastRowCellStyle }}>
                          {trunk.ts
                            .map((checked, i) => (checked ? i : null))
                            .filter((i) => i !== null)
                            .join(",")}
                        </td>
                        <td
                          style={{
                            ...cellStyle,
                            borderRight: "none",
                            ...lastRowCellStyle,
                            ...(isLastRow
                              ? { borderBottomRightRadius: CARD_RADIUS }
                              : {}),
                          }}
                        >
                          <EditDocumentIcon
                            style={{
                              fontSize: 22,
                              color: "#2563eb",
                              cursor: "pointer",
                              opacity: 0.7,
                            }}
                            onClick={() => handleOpenModal(trunk, idx)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "7px 14px",
                borderTop: `1px solid ${C.cardBorder}`,
                background: "#ffffff",
                borderBottomLeftRadius: CARD_RADIUS,
                borderBottomRightRadius: CARD_RADIUS,
              }}
            >
              <span style={{ fontSize: 11, color: C.mutedText }}>
                Showing {pagedTrunks.length} record
                {pagedTrunks.length !== 1 ? "s" : ""} on page {page}
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  variant="outline"
                >
                  ← Prev
                </Btn>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: C.accent,
                    background: "#e0f2fe",
                    padding: "5px 14px",
                    borderRadius: 6,
                    border: `1px solid ${C.cardBorder}`,
                  }}
                >
                  Page {page} of {totalPages}
                </span>
                <Btn
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  variant="outline"
                >
                  Next →
                </Btn>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Modal Dialog */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth={false}
        sx={PCM_TRUNK_ADD_NEW_DIALOG_SX}
        PaperProps={{
          sx: PCM_TRUNK_ADD_NEW_DIALOG_PAPER_SX,
        }}
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle
          style={{
            background: "#1e2d42",
            color: "#ffffff",
            fontWeight: 600,
            fontSize: 16,
            padding: "16px 24px",
            textAlign: "center",
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            flexShrink: 0,
          }}
        >
          {PCM_TRUNK_MODAL_TITLE}
        </DialogTitle>
        <DialogContent
          style={{
            padding: "24px",
            backgroundColor: "#ffffff",
            overflowY: "auto",
            flex: "1 1 auto",
          }}
        >
          <div style={pcmTrunkModalFormPanelStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <PcmTrunkFieldLabel
                tooltipKey="index"
                tooltips={PCM_TRUNK_FIELD_TOOLTIPS}
                style={{
                  width: 170,
                  flexShrink: 0,
                  fontSize: 13,
                  textAlign: "left",
                  whiteSpace: "nowrap",
                  display: "inline-block",
                }}
              >
                Index:
              </PcmTrunkFieldLabel>
              <div style={{ flex: 1, minWidth: 0, width: "100%" }}>
                <select
                  name="index"
                  value={form.index}
                  onChange={(e) =>
                    handleFormChange("index", Number(e.target.value))
                  }
                  style={pcmTrunkSelectStyle}
                  {...pcmTrunkInputInteraction}
                >
                  {PCM_TRUNK_INDEX_OPTIONS.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <PcmTrunkFieldLabel
                tooltipKey="pcmNo"
                tooltips={PCM_TRUNK_FIELD_TOOLTIPS}
                style={{
                  width: 170,
                  flexShrink: 0,
                  fontSize: 13,
                  textAlign: "left",
                  whiteSpace: "nowrap",
                  display: "inline-block",
                }}
              >
                PCM NO.:
              </PcmTrunkFieldLabel>
              <div style={{ flex: 1, minWidth: 0, width: "100%" }}>
                <select
                  name="pcmNo"
                  value={form.pcmNo}
                  onChange={(e) =>
                    handleFormChange("pcmNo", Number(e.target.value))
                  }
                  style={pcmTrunkSelectStyle}
                  {...pcmTrunkInputInteraction}
                >
                  {PCM_TRUNK_PCM_NO_OPTIONS.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <PcmTrunkFieldLabel
                tooltipKey="ts"
                tooltips={PCM_TRUNK_FIELD_TOOLTIPS}
                style={{
                  width: 170,
                  flexShrink: 0,
                  fontSize: 13,
                  textAlign: "left",
                  whiteSpace: "nowrap",
                  display: "inline-block",
                }}
              >
                Including Ts:
              </PcmTrunkFieldLabel>
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Checkbox
                  checked={checkAll}
                  onChange={handleCheckAllTs}
                  sx={{ p: 0.5 }}
                />
                <span style={{ fontSize: 13, fontWeight: 600 }}>Check All</span>
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: 0,
                border: `1px solid ${C.cardBorder}`,
                borderRadius: 4,
                background: "#fff",
                padding: 8,
                width: "100%",
              }}
            >
              {form.ts.map((checked, idx) => (
                <label
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: 13,
                    fontWeight: 500,
                    padding: "4px 4px",
                    minHeight: 28,
                    borderBottom: "1px solid #f1f5f9",
                    borderRight: "1px solid #f1f5f9",
                  }}
                >
                  <Checkbox
                    checked={checked}
                    onChange={() => handleTSChange(idx)}
                    sx={{ p: 0.5, mr: 0.5 }}
                  />
                  TS[{idx}]
                </label>
              ))}
            </div>
          </div>
        </DialogContent>
        <DialogActions
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 12,
            padding: "16px 24px 24px",
            background: "#ffffff",
          }}
        >
          <Btn variant="primary" onClick={handleSave}>
            {PCM_TRUNK_SAVE_LABEL}
          </Btn>
          <Btn
            variant="cancel"
            onClick={handleCloseModal}
            style={pcmTrunkModalCancelBtnStyle}
          >
            {PCM_TRUNK_CLOSE_LABEL}
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PcmTrunkPage;
