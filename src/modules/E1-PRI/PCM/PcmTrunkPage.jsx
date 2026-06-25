import React, { useState, useRef, useEffect } from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import {
  PCM_TRUNK_INDEX_OPTIONS,
  PCM_TRUNK_PCM_NO_OPTIONS,
  PCM_TRUNK_TS_COUNT,
  PCM_TRUNK_INITIAL_FORM,
  PCM_TRUNK_ITEMS_PER_PAGE,
  PCM_TRUNK_FIELD_TOOLTIPS,
} from "../../../constants/PcmTrunkConstants";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Checkbox from "@mui/material/Checkbox";
import Tooltip from "@mui/material/Tooltip";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

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

const E1PriFieldLabel = ({ tooltipKey, tooltips, children, style = {} }) => {
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
  pageBg: "var(--bg-main)",
  cardBg: "var(--bg-surface)",
  cardBorder: "var(--border-strong)",
  labelText: "var(--text-primary)",
  valueText: "var(--text-primary)",
  mutedText: "var(--text-muted)",
  strongText: "var(--text-primary)",
  accent: "var(--accent-brand)",
};

const CARD_RADIUS = 20;

const BTN_BASE =
  "inline-flex items-center justify-center gap-[6px] h-[30px] px-[14px] py-[6px] rounded-[10px] text-[12px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border disabled:cursor-not-allowed disabled:opacity-60";
const BTN_DEFAULT = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:bg-[var(--row-alt)]`;
const BTN_OUTLINE = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-label)] border-[var(--border-strong)] hover:bg-[var(--row-alt)]`;
const BTN_CANCEL = `${BTN_BASE} bg-[#cbd5e1] text-[#374151] border-[#cbd5e1] shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-[#b6c2d3]`;
const BTN_PRIMARY = `${BTN_BASE} text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)]`;

const btnVariantCls = {
  default: BTN_DEFAULT,
  primary: BTN_PRIMARY,
  cancel: BTN_CANCEL,
  outline: BTN_OUTLINE,
  danger: `${BTN_BASE} bg-[#fef2f2] text-[#dc2626] border-[0.5px] border-[#fecaca] hover:bg-[#fca5a5]`,
};

const Btn = ({ children, onClick, disabled, variant = "default", className = "", style, type, title }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    title={title}
    style={style}
    className={`${btnVariantCls[variant] || btnVariantCls.default} ${className}`.trim()}
  >
    {children}
  </button>
);

const TH = ({ children, style: extra }) => (
  <th
    style={{
      background: "var(--table-header-bg)",
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
  background: "var(--bg-surface)",
  borderBottom: `1px solid ${C.cardBorder}`,
  borderRight: `1px solid ${C.cardBorder}`,
  whiteSpace: "nowrap",
};

const E1_PAGE = "bg-[var(--bg-main)] min-h-[calc(100vh-80px)] p-[16px]";
const E1_INNER = "w-full max-w-full mx-auto";
const E1_CARD =
  "overflow-hidden rounded-[10px] border-[1.5px] border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-[0_10px_30px_rgba(15,23,42,0.06)]";
const E1_TOOLBAR =
  "flex min-h-[44px] flex-wrap items-center justify-between gap-[12px] border-b border-[var(--border-strong)] bg-[var(--bg-surface)] px-[14px] py-[7px] rounded-t-[20px]";
const E1_TOOLBAR_LEFT = "flex flex-wrap items-center gap-[8px]";
const E1_TOOLBAR_ACTIONS = "flex flex-wrap items-center gap-[8px]";
const E1_SELECTED_BADGE =
  "rounded-full border border-[#3E5475] bg-[#eff6ff] px-[12px] py-[5px] text-[11px] font-bold text-[var(--text-label)]";
const E1_PAGINATION =
  "flex items-center justify-between overflow-hidden border-t border-[var(--border-strong)] bg-[var(--bg-surface)] px-[14px] py-[7px] rounded-b-[20px]";
const E1_PAGE_BADGE =
  "rounded-[6px] border border-[var(--border-strong)] bg-[#e0f2fe] px-[14px] py-[5px] text-[11px] font-semibold text-[var(--text-label)]";
const E1_TOAST_SX = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  boxShadow: 3,
};

const modalInputProps = {
  style: { fontSize: 13, height: 32, padding: "0 8px", boxSizing: "border-box" },
};

const e1DialogTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
};

const e1DialogContentStyle = { padding: "24px", backgroundColor: "var(--bg-surface)" };

const e1DialogFormStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "var(--row-alt)",
  border: "1px solid var(--border-subtle)",
  borderRadius: 8,
  padding: 20,
};

const e1DialogFieldRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
};

const e1DialogFieldLabelStyle = {
  fontSize: 13,
  color: "var(--text-primary)",
  fontWeight: 600,
  whiteSpace: "nowrap",
  width: 170,
  lineHeight: 1.2,
  textAlign: "left",
};

const e1DialogFieldControlStyle = { width: "min(100%, 320px)" };

const e1DialogActionsStyle = {
  display: "flex",
  justifyContent: "center",
  gap: 16,
  padding: "16px 24px",
  background: "var(--row-alt)",
  borderTop: "1px solid #9CA3AF",
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
};

const e1DialogPaperSx = {
  width: 600,
  maxWidth: "95vw",
  mx: "auto",
  p: 0,
  borderRadius: 2,
  overflow: "hidden",
  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

const E1Breadcrumb = ({ section, current }) => (
  <div className="mb-[16px] flex flex-wrap items-center gap-[4px] text-[12px] font-normal text-[#94a3b8]">
    <span>E1-PRI</span>
    <span>&gt;</span>
    <span>{section}</span>
    <span>&gt;</span>
    <span className="font-semibold text-[#1e293b]">{current}</span>
  </div>
);

const checkboxSx = {
  padding: "1px",
  color: "var(--text-primary)",
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
  background: "var(--bg-main)",
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
  border: `1.5px solid ${C.cardBorder}`,
  borderRadius: 10,
  boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
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
  background: "var(--table-header-bg)",
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
  background: "var(--bg-main)",
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
const pageSelectStyle = {
  fontSize: 13,
  padding: "2px 6px",
  borderRadius: 3,
  border: "1px solid #bbb",
  background: "var(--bg-main)",
};

const PcmTrunkPage = () => {
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
    <div className={E1_PAGE}>
      <div className={E1_INNER}>
        <E1Breadcrumb section="PCM" current="PCM Trunk" />
        {trunks.length === 0 ? (
          <div
            style={{
              background: "var(--bg-surface)",
              borderRadius: 10,
              border: `1.5px solid ${C.cardBorder}`,
              boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
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
                color: "var(--text-primary)",
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 16,
              }}
            >
              No available PCM trunk!
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
            <div className={E1_TOOLBAR}>
              <div className={E1_TOOLBAR_LEFT}>
                {selected.length > 0 && (
                  <span className={E1_SELECTED_BADGE}>
                    {selected.length} selected
                  </span>
                )}
              </div>
              <div className={E1_TOOLBAR_ACTIONS}>
                <Btn
                  variant="cancel"
                  onClick={handleInverse}
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
                background: "var(--bg-surface)",
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
                <span className={E1_PAGE_BADGE}>
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
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { width: 600, maxWidth: "95vw", p: 0 } }}
      >
        <DialogTitle
          className="text-white text-center font-semibold text-lg"
          style={{
            background:
              "linear-gradient(to bottom, #4a5568 0%, #2d3748 50%, #1a202c 100%)",
            borderBottom: "1px solid #444444",
          }}
        >
          PCM Trunk
        </DialogTitle>
        <DialogContent
          className="flex flex-col gap-2 py-4"
          style={{
            backgroundColor: "var(--bg-muted)",
            border: "1px solid #444444",
            borderTop: "none",
          }}
        >
          {/* Index Block */}
          <div className="flex flex-col sm:flex-row items-center border border-gray-200 rounded px-2 py-1 gap-2 w-full bg-white mb-2">
            <E1PriFieldLabel
              tooltipKey="index"
              tooltips={PCM_TRUNK_FIELD_TOOLTIPS}
              style={{
                fontSize: 15,
                minWidth: 80,
                marginRight: 8,
                textAlign: "left",
                whiteSpace: "nowrap",
                display: "inline-block",
              }}
            >              Index:
            </E1PriFieldLabel>
            <Select
              value={form.index}
              onChange={(e) =>
                handleFormChange("index", Number(e.target.value))
              }
              size="small"
              fullWidth
              variant="outlined"
              className="bg-[var(--bg-surface)]"
              sx={{ maxWidth: 120, minWidth: 0 }}
            >
              {PCM_TRUNK_INDEX_OPTIONS.map((i) => (
                <MenuItem key={i} value={i}>
                  {i}
                </MenuItem>
              ))}
            </Select>
          </div>
          {/* PCM NO. Block */}
          <div className="flex flex-col sm:flex-row items-center border border-gray-200 rounded px-2 py-1 gap-2 w-full bg-white mb-2">
            <E1PriFieldLabel
              tooltipKey="pcmNo"
              tooltips={PCM_TRUNK_FIELD_TOOLTIPS}
              style={{
                fontSize: 15,
                minWidth: 80,
                marginRight: 8,
                textAlign: "left",
                whiteSpace: "nowrap",
                display: "inline-block",
              }}
            >              PCM NO.:
            </E1PriFieldLabel>
            <Select
              value={form.pcmNo}
              onChange={(e) =>
                handleFormChange("pcmNo", Number(e.target.value))
              }
              size="small"
              fullWidth
              variant="outlined"
              className="bg-[var(--bg-surface)]"
              sx={{ maxWidth: 120, minWidth: 0 }}
            >
              {PCM_TRUNK_PCM_NO_OPTIONS.map((i) => (
                <MenuItem key={i} value={i}>
                  {i}
                </MenuItem>
              ))}
            </Select>
          </div>
          {/* Including Ts Block */}
          <div className="flex flex-col sm:flex-row items-center border border-gray-200 rounded px-2 py-1 gap-2 w-full bg-white mb-2">
            <E1PriFieldLabel
              tooltipKey="ts"
              tooltips={PCM_TRUNK_FIELD_TOOLTIPS}
              style={{
                fontSize: 15,
                minWidth: 80,
                marginRight: 8,
                textAlign: "left",
                whiteSpace: "nowrap",
                display: "inline-block",
              }}
            >              Including Ts:
            </E1PriFieldLabel>
            <Checkbox
              checked={checkAll}
              onChange={handleCheckAllTs}
              sx={{ mr: 1 }}
            />
            <span className="font-medium">Check All</span>
          </div>
          {/* TS Checkboxes Block */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border border-gray-200 rounded bg-[var(--bg-surface)] p-2 mb-2 w-full">
            {form.ts.map((checked, idx) => (
              <label
                key={idx}
                className="flex items-center text-[14px] font-medium mb-0 py-1 min-h-[28px] border-b border-r border-gray-100 last:border-b-0 last:border-r-0 pl-1"
              >
                <Checkbox
                  checked={checked}
                  onChange={() => handleTSChange(idx)}
                  sx={{ p: 0.5, mr: 1 }}
                />
                TS[{idx}]
              </label>
            ))}
          </div>
        </DialogContent>
        <DialogActions className="flex justify-center gap-6 pb-4">
          <Button
            variant="contained"
            sx={{
              background:
                "linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)",
              color: "#fff",
              fontWeight: 600,
              fontSize: "16px",
              borderRadius: 1,
              minWidth: 100,
              boxShadow: "0 2px 8px #b3e0ff",
              textTransform: "none",
              "&:hover": {
                background:
                  "linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)",
                color: "#fff",
              },
            }}
            onClick={handleSave}
          >
            Save
          </Button>
          <Button
            variant="contained"
            sx={{
              background:
                "linear-gradient(to bottom, #e5e7eb 0%, #d1d5db 100%)",
              color: "var(--text-secondary)",
              fontWeight: 600,
              fontSize: "16px",
              borderRadius: 1,
              minWidth: 100,
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              textTransform: "none",
              "&:hover": {
                background:
                  "linear-gradient(to bottom, #d1d5db 0%, #e5e7eb 100%)",
                color: "var(--text-secondary)",
              },
            }}
            onClick={handleCloseModal}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PcmTrunkPage;

<style>{`
  .edit-icon-btn:hover svg {
    color: #1976d2 !important;
    transform: scale(1.18);
  }
`}</style>;
