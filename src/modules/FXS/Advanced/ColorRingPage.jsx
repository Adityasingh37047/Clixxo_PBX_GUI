import React, { useState, useRef } from "react";
import {
  COLOR_RING_TABLE_COLUMNS,
  COLOR_RING_INDEX_OPTIONS,
  COLOR_RING_INITIAL_FORM,
} from "../../../constants/ColorRingConstants";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import {
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select as MuiSelect,
  MenuItem,
  FormControl,
  Alert,
} from "@mui/material";

const C = {
  pageBg: "var(--bg-main)",
  cardBg: "var(--bg-surface)",
  cardBorder: "var(--border-strong)",
  labelText: "var(--text-primary)",
  valueText: "var(--text-primary)",
  mutedText: "var(--text-muted)",
  accent: "var(--accent-brand)",
  amber: "#dc2626",
};

const BTN_BASE =
  "inline-flex items-center justify-center gap-[6px] h-[30px] px-[14px] py-[6px] rounded-[10px] text-[12px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border disabled:cursor-not-allowed disabled:opacity-60";
const BTN_OUTLINE = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:bg-[var(--row-alt)]`;
const BTN_CANCEL = `${BTN_BASE} bg-[#cbd5e1] text-[#374151] border-[#cbd5e1] shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-[#b6c2d3]`;
const BTN_PRIMARY = `${BTN_BASE} text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)]`;
const BTN_FORM_PRIMARY =
  "inline-flex items-center justify-center gap-[6px] min-w-[100px] h-[34px] px-[14px] py-[6px] rounded-[10px] text-[13px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)] disabled:cursor-not-allowed disabled:opacity-60";
const BTN_FORM_CANCEL =
  "inline-flex items-center justify-center gap-[6px] min-w-[100px] h-[34px] px-[14px] py-[6px] rounded-[10px] text-[13px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border bg-[#cbd5e1] text-[#374151] border-[#cbd5e1] shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-[#b6c2d3] disabled:cursor-not-allowed disabled:opacity-60";

const btnVariantCls = {
  default: BTN_OUTLINE,
  primary: BTN_PRIMARY,
  cancel: BTN_CANCEL,
  outline: BTN_OUTLINE,
  formPrimary: BTN_FORM_PRIMARY,
  formCancel: BTN_FORM_CANCEL,
  danger: `${BTN_BASE} bg-[#fef2f2] text-[#dc2626] border-[0.5px] border-[#fecaca] hover:bg-[#fca5a5]`,
};

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  className = "",
  style,
  type,
  title,
}) => (
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

const OUTLINED_BORDER = "var(--border-subtle)";
const OUTLINED_HOVER = "var(--border-strong)";
const OUTLINED_FOCUS = "var(--status-primary)";

const muiTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "var(--bg-surface)",
    "& fieldset": {
      borderColor: OUTLINED_BORDER,
      transition: "border-color 0.2s ease",
    },
    "&:hover fieldset": {
      borderColor: OUTLINED_HOVER,
    },
    "&.Mui-focused fieldset": {
      borderColor: OUTLINED_FOCUS,
      borderWidth: 2,
    },
    "&.Mui-focused:hover fieldset": {
      borderColor: OUTLINED_FOCUS,
      borderWidth: 2,
    },
  },
};

const muiSelectInnerSx = {
  "& .MuiOutlinedInput-root": {
    minHeight: 36,
    backgroundColor: "var(--bg-surface)",
  },
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    padding: "7px 32px 7px 10px !important",
    lineHeight: 1.35,
    boxSizing: "border-box",
  },
};

const muiSelectSx = {
  fontSize: 13,
  backgroundColor: "var(--bg-surface)",
  ...muiSelectInnerSx,
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: 2,
  },
};

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
  borderBottom: `1px solid ${C.cardBorder}`,
  borderRight: `1px solid ${C.cardBorder}`,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const COLOR_RING_PAGE_WRAP =
  "bg-[var(--bg-main)] min-h-[calc(100vh-80px)] p-[16px] box-border flex flex-col items-center";
const COLOR_RING_PAGE_INNER = "w-full max-w-[1000px] mx-auto";
const COLOR_RING_CARD =
  "overflow-hidden rounded-[10px] border-[1.5px] border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-[0_10px_30px_rgba(15,23,42,0.06)]";
const COLOR_RING_TOOLBAR =
  "flex min-h-[44px] flex-wrap items-center justify-between gap-[12px] border-b border-[var(--border-strong)] bg-[var(--bg-surface)] px-[14px] py-[7px] rounded-t-[10px]";
const COLOR_RING_TOOLBAR_LEFT = "flex items-center gap-[8px]";
const COLOR_RING_TOOLBAR_ACTIONS =
  "flex flex-wrap items-center gap-[8px]";
const COLOR_RING_SELECTED_BADGE =
  "rounded-full border border-[#3E5475] bg-[#eff6ff] px-[12px] py-[5px] text-[11px] font-bold text-[var(--text-label)]";
const COLOR_RING_PAGE_BADGE =
  "rounded-[6px] border border-[var(--border-strong)] bg-[#e0f2fe] px-[14px] py-[5px] text-[11px] font-semibold text-[var(--text-label)]";
const COLOR_RING_PAGINATION =
  "flex items-center justify-between overflow-hidden border-t border-[var(--border-strong)] bg-[var(--bg-surface)] px-[14px] py-[7px] rounded-b-[10px]";

const FxsAdvancedBreadcrumb = ({ current, className = "" }) => (
  <div
    className={`mb-[16px] flex flex-wrap items-center gap-[4px] text-[12px] font-normal text-[#94a3b8] ${className}`.trim()}
  >
    <span>FXS</span>
    <span>&gt;</span>
    <span>Advanced</span>
    <span>&gt;</span>
    <span className="font-semibold text-[#1e293b]">{current}</span>
  </div>
);

const wavFileNoteStyle = {
  fontSize: 12,
  color: C.mutedText,
  margin: 0,
  lineHeight: 1.45,
  whiteSpace: "normal",
  overflowWrap: "break-word",
  textAlign: "center",
  width: "100%",
};

const FieldRow = ({
  label,
  children,
  required,
  align = "center",
  labelWidth = 170,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: align,
      justifyContent: "center",
      gap: 12,
      minHeight: align === "flex-start" ? undefined : 32,
    }}
  >
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: labelWidth,
        flexShrink: 0,
        textAlign: "left",
        paddingTop: align === "flex-start" ? 8 : 0,
      }}
    >
      {label}
      {required && <span style={{ color: "#dc2626" }}> *</span>}
    </label>
    <div style={{ width: "min(100%, 320px)" }}>{children}</div>
  </div>
);

const colorRingModalPaperSx = {
  width: 500,
  maxWidth: "95vw",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

const colorRingModalTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
};

const colorRingModalContentStyle = {
  padding: "20px 24px",
  paddingBottom: "16px",
  backgroundColor: "var(--bg-surface)",
};

const colorRingModalFormPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "var(--row-alt)",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 8,
  padding: 20,
};

const colorRingModalFooterStyle = {
  display: "flex",
  justifyContent: "center",
  gap: 12,
  padding: "10px 16px",
  borderTop: `1px solid ${C.cardBorder}`,
  background: "var(--row-alt)",
};

const DATA_COLUMNS = COLOR_RING_TABLE_COLUMNS.filter(
  (c) => c.key !== "check" && c.key !== "modify",
);

const COLOR_RING_TH_GAP = { padding: "8px 14px" };
const COLOR_RING_TD_GAP = { padding: "6px 14px", lineHeight: 1.2 };
const COLOR_RING_CHECKBOX_SX = {
  padding: "1px",
  color: "var(--text-primary)",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const ColorRingPagination = ({
  page,
  totalPages,
  recordCount,
  onPrev,
  onNext,
}) => (
  <div className={COLOR_RING_PAGINATION}>
    <span className="text-[11px] text-[#94a3b8]">
      Showing {recordCount} record{recordCount !== 1 ? "s" : ""} on page {page}
    </span>
    <div className="flex items-center gap-[8px]">
      <Btn onClick={onPrev} disabled={page <= 1} variant="outline">
        ΓåÉ Prev
      </Btn>
      <span className={COLOR_RING_PAGE_BADGE}>
        Page {page} of {totalPages}
      </span>
      <Btn onClick={onNext} disabled={page >= totalPages} variant="outline">
        Next ΓåÆ
      </Btn>
    </div>
  </div>
);

const ColorRingPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(COLOR_RING_INITIAL_FORM);
  const [rules, setRules] = useState([]);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [fileName, setFileName] = useState("No file chosen");
  const [editIndex, setEditIndex] = useState(null);
  const fileInputRef = useRef(null);
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const itemsPerPage = 20;
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const totalPages = Math.max(1, Math.ceil(rules.length / itemsPerPage));
  const pagedRules = rules.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const handleOpenModal = (item = null, idx = -1) => {
    if (item) {
      setFormData({
        index: String(item.index),
        description: item.description || "default",
        file: null,
      });
      setFileName(item.fileName || "No file chosen");
      setEditIndex(idx);
    } else {
      setFormData(COLOR_RING_INITIAL_FORM);
      setFileName("No file chosen");
      setEditIndex(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(COLOR_RING_INITIAL_FORM);
    setFileName("No file chosen");
  };

  const handleReturn = () => {
    handleCloseModal();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setFormData((prev) => ({ ...prev, file }));
    } else {
      setFileName("No file chosen");
      setFormData((prev) => ({ ...prev, file: null }));
    }
  };

  const checkFileExt = (ext) => {
    if (!ext.match(/.wav/i)) {
      return false;
    }
    return true;
  };

  const handleUpload = () => {
    if (!formData.description || formData.description.trim() === "") {
      showToast("Please enter a description!", "error");
      return;
    }

    const descriptionRegex = /^[^\%\&\~\!\|\(\)\;\"\'\=\\]*$/;
    if (!descriptionRegex.test(formData.description)) {
      showToast(
        "The description cannot contain special characters like '~', '!', '&', '|' and '='!",
        "error",
      );
      return;
    }

    if (!formData.file) {
      showToast("Please select a file to upload!", "error");
      return;
    }

    const fileExt = formData.file.name
      .substring(formData.file.name.lastIndexOf("."))
      .toLowerCase();
    if (!checkFileExt(fileExt)) {
      showToast("Only wav files can be uploaded!", "error");
      return;
    }

    if (formData.file.size > 200 * 1024) {
      showToast("The size of the file must be less than 200KB!", "error");
      return;
    }

    const newItem = {
      id: editIndex !== null ? rules[editIndex].id : Date.now(),
      index: parseInt(formData.index),
      description: formData.description.trim(),
      fileName: formData.file.name,
      file: formData.file,
    };

    try {
      if (editIndex !== null) {
        setRules((prev) =>
          prev.map((rule, idx) => (idx === editIndex ? newItem : rule)),
        );
        showToast("Color ring updated successfully!");
      } else {
        setRules((prev) => [...prev, newItem]);
        showToast("Color ring uploaded successfully!");
      }

      handleCloseModal();
    } catch (error) {
      console.error("Error saving color ring:", error);
      showToast(error.message || "Failed to save color ring", "error");
    }
  };

  const handleSelectRow = (idx) => {
    const realIdx = (page - 1) * itemsPerPage + idx;
    setSelected((prev) =>
      prev.includes(realIdx)
        ? prev.filter((i) => i !== realIdx)
        : [...prev, realIdx],
    );
  };

  const handleCheckAll = () => {
    const allIndices = pagedRules.map(
      (_, idx) => (page - 1) * itemsPerPage + idx,
    );
    setSelected(allIndices);
  };

  const handleInverse = () => {
    const allIndices = pagedRules.map(
      (_, idx) => (page - 1) * itemsPerPage + idx,
    );
    setSelected((prev) => allIndices.filter((idx) => !prev.includes(idx)));
  };

  const handleDelete = () => {
    if (selected.length === 0) {
      showToast("Please select at least one item to delete.", "error");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selected.length} selected item(s)?`,
    );
    if (!confirmed) return;

    try {
      setRules((prev) => prev.filter((_, idx) => !selected.includes(idx)));
      setSelected([]);
      if (page > Math.ceil((rules.length - selected.length) / itemsPerPage)) {
        setPage(
          Math.max(
            1,
            Math.ceil((rules.length - selected.length) / itemsPerPage),
          ),
        );
      }
      showToast(`${selected.length} item(s) deleted successfully`);
    } catch (error) {
      console.error("Error deleting selected items:", error);
      showToast(error.message || "Failed to delete selected items", "error");
    }
  };

  const handleClearAll = () => {
    if (rules.length === 0) {
      showToast("No data to clear", "error");
      return;
    }

    if (!window.confirm("Are you sure to clear all color rings?")) {
      return;
    }

    try {
      setRules([]);
      setSelected([]);
      setPage(1);
      showToast(`All color rings cleared successfully`);
    } catch (error) {
      console.error("Error clearing all items:", error);
      showToast(error.message || "Failed to clear all items", "error");
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      setSelected([]);
    }
  };

  const pagedSelectedCount = pagedRules.filter((_, idx) =>
    selected.includes((page - 1) * itemsPerPage + idx),
  ).length;
  const allPagedChecked =
    pagedRules.length > 0 && pagedSelectedCount === pagedRules.length;

  return (
    <div className={COLOR_RING_PAGE_WRAP}>
      <div className={COLOR_RING_PAGE_INNER}>
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
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
              fontWeight: 500,
            }}
          >
            {toast.msg}
          </Alert>
        )}
        <FxsAdvancedBreadcrumb current="Color Ring" />

        <div className={COLOR_RING_CARD}>
          <div className={COLOR_RING_TOOLBAR}>
            <div className={COLOR_RING_TOOLBAR_LEFT}>
              {selected.length > 0 && (
                <span className={COLOR_RING_SELECTED_BADGE}>
                  {selected.length} selected
                </span>
              )}
            </div>
            <div className={COLOR_RING_TOOLBAR_ACTIONS}>
              <Btn
                variant="cancel"
                onClick={handleInverse}
                disabled={rules.length === 0}
              >
                Inverse
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleDelete}
                disabled={selected.length === 0}
              >
                Delete
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleClearAll}
                disabled={rules.length === 0}
              >
                Clear All
              </Btn>
              <Btn variant="primary" onClick={() => handleOpenModal()}>
                + Add New
              </Btn>
            </div>
          </div>

          <div style={{ overflowX: "auto", overflowY: "auto", flex: 1 }}>
            {rules.length === 0 ? (
              <div className="flex min-h-[240px] flex-col items-center justify-center p-[24px] text-center">
                <div className="mb-[16px] text-[13px] font-semibold text-[var(--text-label)]">
                  No available color ring!
                </div>
                <Btn
                  variant="cancel"
                  onClick={() => handleOpenModal()}
                  style={{ padding: "8px 24px", fontSize: 12, borderRadius: 6 }}
                >
                  + Add New
                </Btn>
              </div>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                }}
              >
                <thead>
                  <tr>
                    <TH
                      style={{
                        width: 40,
                        padding: 0,
                        borderLeft: "none",
                        ...COLOR_RING_TH_GAP,
                      }}
                    >
                      <Checkbox
                        size="small"
                        checked={allPagedChecked}
                        indeterminate={
                          pagedSelectedCount > 0 && !allPagedChecked
                        }
                        onChange={(e) => {
                          if (e.target.checked) handleCheckAll();
                          else setSelected([]);
                        }}
                        sx={COLOR_RING_CHECKBOX_SX}
                      />
                    </TH>
                    {DATA_COLUMNS.map((col) => (
                      <TH key={col.key} style={COLOR_RING_TH_GAP}>
                        {col.label}
                      </TH>
                    ))}
                    <TH
                      style={{
                        width: 70,
                        borderRight: "none",
                        ...COLOR_RING_TH_GAP,
                      }}
                    >
                      Modify
                    </TH>
                  </tr>
                </thead>
                <tbody>
                  {pagedRules.map((item, idx) => {
                    const realIdx = (page - 1) * itemsPerPage + idx;
                    const isSelected = selected.includes(realIdx);
                    const isLastRow = idx === pagedRules.length - 1;
                    const rowBg = isSelected
                      ? "#f0f9ff"
                      : idx % 2 === 1
                        ? "#f8fafc"
                        : "#ffffff";
                    const lastRowCellStyle = isLastRow
                      ? { borderBottom: "none" }
                      : {};

                    return (
                      <tr
                        key={realIdx}
                        style={{
                          background: rowBg,
                          transition: "background 0.15s ease",
                        }}
                      >
                        <td
                          style={{
                            ...tdStyle,
                            ...COLOR_RING_TD_GAP,
                            background: rowBg,
                            borderLeft: "none",
                            width: 36,
                            ...lastRowCellStyle,
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => handleSelectRow(idx)}
                            sx={COLOR_RING_CHECKBOX_SX}
                          />
                        </td>
                        {DATA_COLUMNS.map((col) => (
                          <td
                            key={col.key}
                            style={{
                              ...tdStyle,
                              ...COLOR_RING_TD_GAP,
                              background: rowBg,
                              ...lastRowCellStyle,
                            }}
                          >
                            {item[col.key]}
                          </td>
                        ))}
                        <td
                          style={{
                            ...tdStyle,
                            ...COLOR_RING_TD_GAP,
                            background: rowBg,
                            borderRight: "none",
                            ...lastRowCellStyle,
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
                              onMouseEnter={(e) => {
                                e.currentTarget.style.opacity = "1";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.opacity = "0.7";
                              }}
                              onClick={() => handleOpenModal(item, realIdx)}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {rules.length > 0 && (
            <ColorRingPagination
              page={page}
              totalPages={totalPages}
              recordCount={pagedRules.length}
              onPrev={() => handlePageChange(page - 1)}
              onNext={() => handlePageChange(page + 1)}
            />
          )}
        </div>

        <Dialog
          open={isModalOpen}
          onClose={handleCloseModal}
          maxWidth={false}
          PaperProps={{ sx: colorRingModalPaperSx }}
          disableRestoreFocus
          disableEnforceFocus
        >
          <DialogTitle style={colorRingModalTitleStyle}>
            Color Ring-Upload
          </DialogTitle>
          <DialogContent style={colorRingModalContentStyle}>
            <div style={colorRingModalFormPanelStyle}>
              <FieldRow label="Index">
                <FormControl size="small" fullWidth>
                  <MuiSelect
                    value={formData.index}
                    onChange={(e) =>
                      handleInputChange({
                        target: { name: "index", value: e.target.value },
                      })
                    }
                    sx={muiSelectSx}
                  >
                    {COLOR_RING_INDEX_OPTIONS.map((opt) => (
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
              <FieldRow label="Description">
                <TextField
                  name="description"
                  value={formData.description || ""}
                  onChange={handleInputChange}
                  size="small"
                  fullWidth
                  variant="outlined"
                  sx={muiTextFieldSx}
                  inputProps={{
                    maxLength: 23,
                    style: { fontSize: 13, padding: "6px 8px" },
                  }}
                />
              </FieldRow>
              <FieldRow label="Color Ring" align="flex-start">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                    width: "100%",
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".wav"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                  <Btn
                    variant="cancel"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose file
                  </Btn>
                  <span style={{ fontSize: 13, color: C.mutedText }}>
                    {fileName}
                  </span>
                </div>
              </FieldRow>
              <p style={{ ...wavFileNoteStyle, color: "#dc2626" }}>
                Note: The file should be a wav file with 8000Hz sampling rate,
                16-bit mono, A-law formatted, and less than 200KB in size.
              </p>
            </div>
          </DialogContent>
          <DialogActions style={colorRingModalFooterStyle}>
            <Btn variant="formPrimary" onClick={handleUpload}>
              Upload
            </Btn>
            <Btn variant="formCancel" onClick={handleReturn}>
              Return
            </Btn>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default ColorRingPage;
