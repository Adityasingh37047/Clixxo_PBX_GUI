import React, { useState, useEffect } from "react";
import { Tooltip } from "@mui/material";  
import {
  SIP_ACCESS_CONTROL_COLUMNS,
  SIP_ACCESS_CONTROL_MODAL_FIELDS,
  SIP_ACCESS_CONTROL_INITIAL_ROW,
  SIP_ACCESS_CONTROL_DEFAULT_OPTIONS,
} from "../../../constants/SipAccessControlConstants";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  Alert,
  Checkbox,
} from "@mui/material";

const LOCAL_STORAGE_KEY = "sipAccessControlRows";

const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "var(--border-strong)",
  divider: "#9CA3AF",
  cardShadow: "0 10px 30px rgba(15,23,42,0.06)",
  labelText: "#3E5475",
  valueText: "#1e293b",
  strongText: "#0f172a",
  mutedText: "#94a3b8",
  accent: "#3E5475",
  errorRed: "#dc2626",
};

const OUTLINED_BORDER = "rgba(0, 0, 0, 0.23)";
const OUTLINED_HOVER = "rgba(0, 0, 0, 0.87)";
const OUTLINED_FOCUS = "#1976d2";
const FOCUS_RING_SHADOW = (color) => `0 0 0 1px ${color}`;

const setFieldDefault = (el) => {
  el.style.borderColor = OUTLINED_BORDER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const setFieldHover = (el) => {
  el.style.borderColor = OUTLINED_HOVER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const setFieldFocus = (el) => {
  el.style.borderColor = OUTLINED_FOCUS;
  el.style.borderWidth = "1px";
  el.style.boxShadow = FOCUS_RING_SHADOW(OUTLINED_FOCUS);
};

const inputInteraction = {
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

const systemModalFieldInputStyle = {
  minHeight: 32,
  height: 32,
  width: "100%",
  padding: "0 10px",
  fontSize: 13,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 4,
  outline: "none",
  backgroundColor: "#fff",
  color: "#1e293b",
  boxSizing: "border-box",
  lineHeight: 1.35,
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const systemModalTextareaStyle = {
  ...systemModalFieldInputStyle,
  minHeight: 80,
  height: "auto",
  padding: "8px 10px",
  resize: "vertical",
  fontFamily: "inherit",
};

const systemModalSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  width: "100%",
  "& .MuiOutlinedInput-root": {
    minHeight: 36,
    height: 36,
    backgroundColor: "#fff",
  },
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    padding: "7px 32px 7px 10px !important",
    lineHeight: 1.35,
    boxSizing: "border-box",
  },
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

const CARD_RADIUS = 20;
const tooltipProps = {
  arrow: true,
  placement: "top",
  slotProps: {
    tooltip: {
      sx: {
        bgcolor: "#fff",
        color: "#334155",
        border: "1px solid #d1d5db",
        fontSize: 12,
        maxWidth: 500,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      },
    },
    arrow: {
      sx: {
        color: "#fff",
      },
    },
  },
};

  const tooltips = {
    Name: "Enter a descriptive name for this SIP access control entry.",
    "Default": "Select the default action for this SIP access control entry.",
    "Description": "Enter a description for this SIP access control entry.",
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

const checkboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
  startIcon,
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
  const hoverBg =
    variant === "primary"
      ? "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)"
      : variant === "cancel"
        ? "#b6c2d3"
        : "#e2e8f0";
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
      {startIcon}
      {children}
    </button>
  );
};

const defaultLabel = (value) =>
  SIP_ACCESS_CONTROL_DEFAULT_OPTIONS.find((o) => o.value === value)?.label ||
  value ||
  "—";

const normalizeRows = (list) =>
  (list || []).map((row, idx) => ({
    ...row,
    no: idx + 1,
  }));

const SipAccessControl = () => {
  const [rows, setRows] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState({ ...SIP_ACCESS_CONTROL_INITIAL_ROW });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const saveRowsLocal = (data) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch {}
  };

  const loadRowsLocal = () => {
    try {
      const s = localStorage.getItem(LOCAL_STORAGE_KEY);
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  };

  useEffect(() => {
    const persisted = loadRowsLocal();
    if (Array.isArray(persisted) && persisted.length) {
      setRows(normalizeRows(persisted));
    }
  }, []);

  useEffect(() => {
    saveRowsLocal(rows);
  }, [rows]);

  const openModal = (rowIdx = null) => {
    setEditIndex(rowIdx);
    if (rowIdx !== null) {
      setForm({ ...rows[rowIdx] });
    } else {
      setForm({ ...SIP_ACCESS_CONTROL_INITIAL_ROW, no: rows.length + 1 });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditIndex(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e?.preventDefault?.();
    const name = String(form.name || "").trim();
    if (!name) {
      showToast("Please enter a Name", "error");
      return;
    }

    const duplicate = rows.some(
      (row, idx) =>
        idx !== editIndex &&
        String(row.name || "")
          .trim()
          .toLowerCase() === name.toLowerCase(),
    );
    if (duplicate) {
      showToast("An entry with this Name already exists", "error");
      return;
    }

    setSaving(true);
    const payload = {
      checked: false,
      name,
      default: form.default || "blacklist",
      description: String(form.description || "").trim(),
    };

    setRows((prev) => {
      if (editIndex !== null) {
        const next = prev.map((row, idx) =>
          idx === editIndex ? { ...row, ...payload } : row,
        );
        return normalizeRows(next);
      }
      return normalizeRows([...prev, payload]);
    });

    showToast(
      editIndex !== null
        ? "SIP access control updated."
        : "SIP access control added.",
      "success",
    );
    setSaving(false);
    closeModal();
  };

  const handleCheck = (idx) => {
    setRows((prev) =>
      prev.map((row, i) =>
        i === idx ? { ...row, checked: !row.checked } : row,
      ),
    );
  };

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setRows((prev) => prev.map((row) => ({ ...row, checked })));
  };

  const handleDelete = () => {
    const count = rows.filter((r) => r.checked).length;
    if (count === 0 || saving) return;
    if (
      !window.confirm(
        `Are you sure you want to delete ${count} selected entr${count === 1 ? "y" : "ies"}?`,
      )
    ) {
      return;
    }
    setRows((prev) => normalizeRows(prev.filter((r) => !r.checked)));
    showToast(`${count} entr${count === 1 ? "y" : "ies"} deleted.`, "success");
  };

  const handleClearAll = () => {
    if (rows.length === 0 || saving) return;
    if (
      !window.confirm(
        "Are you sure you want to delete all entries? This action cannot be undone.",
      )
    ) {
      return;
    }
    setRows([]);
    showToast("All entries cleared.", "success");
  };

  return (
    <div
      className="min-h-[calc(100vh-80px)] p-4 flex flex-col items-center"
      style={{ backgroundColor: C.pageBg }}
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

      <div className="w-full" style={{ maxWidth: 1000 }}>
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
          <span>System</span>
          <span>&gt;</span>
          <span>System Settings</span>
          <span>&gt;</span>
          <span style={{ color: C.strongText, fontWeight: 600 }}>
            SIP Access Control
          </span>
        </div>

        <div
          style={{
            background: C.cardBg,
            borderRadius: 10,
            overflow: "hidden",
            boxShadow: C.cardShadow,
            marginBottom: 24,
            border: `1.5px solid ${C.cardBorder}`,
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              alignItems: "center",
              justifyContent: "space-between",
              minHeight: 44,
              padding: "7px 14px",
              borderBottom: `1px solid ${C.cardBorder}`,
              background: "#ffffff",
              borderTopLeftRadius: CARD_RADIUS,
              borderTopRightRadius: CARD_RADIUS,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {rows.some((r) => r.checked) && (
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
                  {rows.filter((r) => r.checked).length} selected
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
                onClick={handleDelete}
                disabled={!rows.some((r) => r.checked) || saving}
                style={{ height: 30 }}
                startIcon={<DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />}
              >
                Delete
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleClearAll}
                disabled={rows.length === 0 || saving}
                style={{ height: 30 }}
              >
                Clear All
              </Btn>
              <Btn
                variant="primary"
                onClick={() => openModal(null)}
                disabled={saving}
                style={{ height: 30 }}
              >
                + Add New
              </Btn>
            </div>
          </div>

          <div
            className="overflow-x-auto w-full"
            style={
              rows.length === 0
                ? {
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 240,
                    padding: 24,
                    textAlign: "center",
                    borderBottomLeftRadius: CARD_RADIUS,
                    borderBottomRightRadius: CARD_RADIUS,
                  }
                : {
                    overflowX: "auto",
                    overflowY: "auto",
                    flex: 1,
                    width: "100%",
                  }
            }
          >
            {rows.length === 0 ? (
              <>
                <div
                  style={{
                    color: "#3E5475",
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 16,
                  }}
                >
                  No SIP access control lists configured!
                </div>
                <Btn
                  onClick={() => openModal(null)}
                  variant="cancel"
                  disabled={saving}
                  style={{ padding: "8px 24px", fontSize: 12, borderRadius: 6 }}
                >
                  + Add New
                </Btn>
              </>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  minWidth: 760,
                }}
              >
                <thead>
                  <tr>
                    {SIP_ACCESS_CONTROL_COLUMNS.map((col) => {
                      if (col.key === "checked") {
                        return (
                          <TH
                            key={col.key}
                            style={{
                              width: 40,
                              padding: 0,
                              borderLeft: "none",
                              position: "sticky",
                              top: 0,
                              zIndex: 10,
                            }}
                          >
                            <Checkbox
                              size="small"
                              checked={
                                rows.length > 0 && rows.every((r) => r.checked)
                              }
                              indeterminate={
                                rows.some((r) => r.checked) &&
                                !rows.every((r) => r.checked)
                              }
                              onChange={handleSelectAll}
                              sx={checkboxSx}
                            />
                          </TH>
                        );
                      }
                      if (col.key === "modify") {
                        return (
                          <TH
                            key={col.key}
                            style={{
                              width: 70,
                              borderRight: "none",
                              position: "sticky",
                              top: 0,
                              zIndex: 10,
                            }}
                          >
                            {col.label}
                          </TH>
                        );
                      }
                      return (
                        <TH
                          key={col.key}
                          style={{ position: "sticky", top: 0, zIndex: 10 }}
                        >
                          {col.label}
                        </TH>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => {
                    const isLastRow = idx === rows.length - 1;
                    const isRowChecked = row.checked || false;
                    const rowBg = isRowChecked
                      ? "#f0f9ff"
                      : idx % 2 === 1
                        ? "#f8fafc"
                        : "#ffffff";
                    const lastRowCellStyle = isLastRow
                      ? { borderBottom: "none" }
                      : {};

                    return (
                      <tr
                        key={`row-${row.no ?? idx}-${row.name}`}
                        style={{
                          background: rowBg,
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isRowChecked)
                            e.currentTarget.style.background = "#f1f5f9";
                        }}
                        onMouseLeave={(e) => {
                          if (!isRowChecked)
                            e.currentTarget.style.background = rowBg;
                        }}
                      >
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderLeft: "none",
                            width: 36,
                            ...lastRowCellStyle,
                            ...(isLastRow
                              ? { borderBottomLeftRadius: CARD_RADIUS }
                              : {}),
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={isRowChecked}
                            onChange={() => handleCheck(idx)}
                            sx={checkboxSx}
                          />
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.no}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.name}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {defaultLabel(row.default)}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            maxWidth: 280,
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.description || "—"}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderRight: "none",
                            ...lastRowCellStyle,
                            ...(isLastRow
                              ? { borderBottomRightRadius: CARD_RADIUS }
                              : {}),
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
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {rows.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "7px 14px",
                background: "#ffffff",
                borderTop: `1px solid ${C.cardBorder}`,
                borderBottomLeftRadius: CARD_RADIUS,
                borderBottomRightRadius: CARD_RADIUS,
                overflow: "hidden",
              }}
            >
              <span
                style={{ fontSize: 11, color: C.mutedText, lineHeight: 1.2 }}
              >
                Showing {rows.length} record
                {rows.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={modalOpen}
        onClose={() => {
          if (!saving) closeModal();
        }}
        maxWidth={false}
        className="z-50"
        slotProps={{
          backdrop: {
            sx: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
          },
        }}
        PaperProps={{
          sx: {
            width: 520,
            maxWidth: "95vw",
            mx: "auto",
            borderRadius: "8px",
            boxShadow:
              "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
            backgroundColor: "#ffffff",
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
            borderBottom: `1px solid ${C.divider}`,
            px: 3,
            py: 2,
            textAlign: "center",
            borderTopLeftRadius: "8px",
            borderTopRightRadius: "8px",
          }}
        >
          SIP Access Control
        </DialogTitle>
        <DialogContent sx={{ p: "24px", backgroundColor: "#ffffff" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              background: "#f8fafc",
              border: `1px solid ${C.cardBorder}`,
              borderRadius: 8,
              padding: 20,
              marginTop: 22,
            }}
          >
            {SIP_ACCESS_CONTROL_MODAL_FIELDS.map((field) => (
              <div
                key={field.key}
                style={{
                  display: "flex",
                  alignItems: field.type === "textarea" ? "flex-start" : "center",
                  justifyContent: "center",
                  gap: 12,
                }}
              >
               <Tooltip
  title={tooltips[field.label] || ""}
  {...tooltipProps}
>
  <span
    style={{
      width: 120,
      flexShrink: 0,
      display: "inline-block",
    }}
  >
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: 120,
        flexShrink: 0,
        textAlign: "left",
        whiteSpace: "nowrap",
        paddingTop: field.type === "textarea" ? 8 : 0,
      }}
    >
      {field.label}:
    </label>
  </span>
</Tooltip>
                <div style={{ width: "min(100%, 320px)", display: "flex" }}>
                  {field.type === "text" ? (
                    <input
                      name={field.key}
                      type="text"
                      value={form[field.key] || ""}
                      onChange={handleFormChange}
                      style={{ ...systemModalFieldInputStyle, flex: 1 }}
                      {...inputInteraction}
                    />
                  ) : null}
                  {field.type === "select" ? (
                    <Select
                      name={field.key}
                      value={form[field.key] || field.initial}
                      onChange={handleFormChange}
                      fullWidth
                      sx={{
                        ...systemModalSelectSx,
                        borderRadius: "4px",
                        fontSize: 13,
                      }}
                      MenuProps={{
                        PaperProps: {
                          style: { maxHeight: 200, overflow: "auto" },
                        },
                      }}
                    >
                      {(field.options || []).map((opt) => (
                        <MenuItem
                          key={opt.value}
                          value={opt.value}
                          sx={{ fontSize: "14px" }}
                        >
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  ) : null}
                  {field.type === "textarea" ? (
                    <textarea
                      name={field.key}
                      value={form[field.key] || ""}
                      onChange={handleFormChange}
                      rows={4}
                      style={{ ...systemModalTextareaStyle, flex: 1 }}
                      {...inputInteraction}
                    />
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: "center",
            gap: 2,
            py: "10px",
            px: "16px",
            borderTop: `1px solid ${C.divider}`,
            backgroundColor: "#f8fafc",
          }}
        >
          <Btn
            variant="primary"
            onClick={handleSave}
            disabled={saving}
            style={{ minWidth: 100, height: 33, fontSize: 13 }}
          >
            {saving ? "Saving..." : "Save"}
          </Btn>
          <Btn
            variant="cancel"
            onClick={closeModal}
            style={{ minWidth: 100, height: 33, fontSize: 13 }}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SipAccessControl;
