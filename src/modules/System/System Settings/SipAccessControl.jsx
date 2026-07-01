import React, { useState, useEffect, useMemo } from "react";
import { Tooltip, useMediaQuery } from "@mui/material";
import {
  SIP_ACCESS_CONTROL_COLUMNS,
  SIP_ACCESS_CONTROL_MODAL_FIELDS,
  SIP_ACCESS_CONTROL_INITIAL_ROW,
  SIP_ACCESS_CONTROL_DEFAULT_OPTIONS,
  SIP_ACCESS_CONTROL_PAGE_BREADCRUMB_ROOT,
  SIP_ACCESS_CONTROL_PAGE_BREADCRUMB_SECTION,
  SIP_ACCESS_CONTROL_PAGE_TITLE,
  SIP_ACCESS_CONTROL_BTN_DELETE,
  SIP_ACCESS_CONTROL_BTN_CLEAR_ALL,
  SIP_ACCESS_CONTROL_BTN_ADD_NEW,
  SIP_ACCESS_CONTROL_BTN_SAVE,
  SIP_ACCESS_CONTROL_BTN_SAVING,
  SIP_ACCESS_CONTROL_BTN_CLOSE,
  SIP_ACCESS_CONTROL_MODAL_ADD_TITLE,
  SIP_ACCESS_CONTROL_MODAL_EDIT_TITLE,
  SIP_ACCESS_CONTROL_EMPTY_MESSAGE,
  SIP_ACCESS_CONTROL_RECORD_LABEL,
  SIP_ACCESS_CONTROL_SELECTED_SUFFIX,
  SIP_ACCESS_CONTROL_EDIT_TITLE_ACCESS,
  SIP_ACCESS_CONTROL_PAGINATION_SHOWING,
  SIP_ACCESS_CONTROL_FIELD_TOOLTIPS,
  SIP_ACCESS_CONTROL_FORM_LAYOUT,
  SIP_ACCESS_CONTROL_ERR_NAME_REQUIRED,
  SIP_ACCESS_CONTROL_ERR_DUPLICATE_NAME,
  SIP_ACCESS_CONTROL_MSG_UPDATED,
  SIP_ACCESS_CONTROL_MSG_ADDED,
  SIP_ACCESS_CONTROL_CONFIRM_DELETE,
  SIP_ACCESS_CONTROL_CONFIRM_CLEAR_ALL,
  SIP_ACCESS_CONTROL_MSG_DELETED,
  SIP_ACCESS_CONTROL_MSG_CLEARED,
} from "../../../constants/SipAccessControlConstants";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  Alert,
  Checkbox,
} from "@mui/material";

const LOCAL_STORAGE_KEY = "sipAccessControlRows";

const SIP_ACCESS_CONTROL_COMPACT_MQ = "(max-width: 768px)";
const SIP_ACCESS_CONTROL_SCROLL_CLASS = "sip-access-control-scroll";

const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  divider: "#e2e6ec",
  labelText: "#3E5475",
  valueText: "#0f172a",
  strongText: "#0f172a",
  mutedText: "#6b7280",
  accent: "#3E5475",
  errorRed: "#dc2626",
};

const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";
const FOCUS_RING_SHADOW = "0 0 0 2px rgba(62, 84, 117, 0.15)";

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
  el.style.boxShadow = FOCUS_RING_SHADOW;
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
  borderRadius: 6,
  outline: "none",
  backgroundColor: "#fff",
  color: C.valueText,
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
  minHeight: 36,
  height: 36,
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  "& .MuiOutlinedInput-root": {
    minHeight: 36,
    height: 36,
    backgroundColor: "#fff",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    padding: "7px 32px 7px 10px !important",
    lineHeight: 1.35,
    boxSizing: "border-box",
    fontSize: 13,
    backgroundColor: "#fff",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused": {
    boxShadow: FOCUS_RING_SHADOW,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
};

const SIP_ACCESS_TABLE_CARD_RADIUS = 10;

const sipAccessPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const sipAccessPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const sipAccessCardStyle = {
  background: "#ffffff",
  borderRadius: SIP_ACCESS_TABLE_CARD_RADIUS,
  overflow: "hidden",
  border: `1px solid ${C.cardBorder}`,
  boxShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
};

const sipAccessToolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.divider}`,
  background: "#ffffff",
  flexWrap: "wrap",
  gap: 12,
  borderTopLeftRadius: SIP_ACCESS_TABLE_CARD_RADIUS,
  borderTopRightRadius: SIP_ACCESS_TABLE_CARD_RADIUS,
};

const sipAccessPaginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.divider}`,
  borderBottomLeftRadius: SIP_ACCESS_TABLE_CARD_RADIUS,
  borderBottomRightRadius: SIP_ACCESS_TABLE_CARD_RADIUS,
  overflow: "hidden",
};

const sipAccessSelectedBadgeStyle = {
  background: "#eff6ff",
  color: C.accent,
  fontSize: 11,
  fontWeight: 700,
  padding: "5px 12px",
  borderRadius: 999,
  border: `1px solid ${C.accent}`,
};

const sipAccessCancelBtnStyle = {
  height: 30,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const sipAccessPrimaryBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
};

const sipAccessFixedAlertSx = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  boxShadow: 3,
};

const sipAccessModalCancelBtnStyle = {
  minWidth: 100,
  height: 33,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const tooltipProps = {
  arrow: true,
  placement: "top",
  slotProps: {
    tooltip: {
      sx: {
        backgroundColor: "#fff",
        color: "#333",
        border: "1px solid #d1d5db",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        fontSize: 13,
        maxWidth: 500,
        padding: "12px 16px",
      },
    },
    arrow: {
      sx: {
        color: "#fff",
      },
    },
  },
};

const SipAccessFieldLabel = ({ tooltipKey, children, style = {} }) => {
  const tooltip = tooltipKey
    ? SIP_ACCESS_CONTROL_FIELD_TOOLTIPS[tooltipKey] || ""
    : "";
  const labelNode = (
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: 130,
        flexShrink: 0,
        textAlign: "left",
        whiteSpace: "nowrap",
        cursor: tooltip ? "help" : undefined,
        display: "block",
        ...style,
      }}
    >
      {children}
    </label>
  );
  if (!tooltip) return labelNode;
  return (
    <Tooltip title={tooltip} {...tooltipProps}>
      {labelNode}
    </Tooltip>
  );
};

const SipAccessScrollbarStyles = () => (
  <style>{`
    .${SIP_ACCESS_CONTROL_SCROLL_CLASS} {
      scroll-behavior: smooth;
      scrollbar-gutter: stable;
      scrollbar-width: thin;
      scrollbar-color: rgba(100, 116, 139, 0.45) transparent;
    }
    .${SIP_ACCESS_CONTROL_SCROLL_CLASS}::-webkit-scrollbar {
      width: 8px;
      height: 8px;
      transition: width 0.2s ease, height 0.2s ease;
    }
    .${SIP_ACCESS_CONTROL_SCROLL_CLASS}::-webkit-scrollbar:hover {
      width: 11px;
      height: 11px;
    }
    .${SIP_ACCESS_CONTROL_SCROLL_CLASS}::-webkit-scrollbar-corner {
      background: transparent;
    }
    .${SIP_ACCESS_CONTROL_SCROLL_CLASS}::-webkit-scrollbar-track {
      background: transparent;
    }
    .${SIP_ACCESS_CONTROL_SCROLL_CLASS}::-webkit-scrollbar-thumb {
      background-color: rgba(100, 116, 139, 0.45);
      border-radius: 6px;
      border: 2px solid transparent;
      background-clip: padding-box;
      transition: background-color 0.2s ease;
    }
    .${SIP_ACCESS_CONTROL_SCROLL_CLASS}::-webkit-scrollbar-thumb:hover {
      background-color: rgba(71, 85, 105, 0.65);
    }
  `}</style>
);

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

const sipAccessTableCheckboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const getSipAccessTdStyle = (rowBg, lastRowCellStyle, extra = {}) => ({
  ...tdStyle,
  background: rowBg,
  ...lastRowCellStyle,
  ...extra,
});

const getSipAccessRowBg = (isSelected, idx) =>
  isSelected ? "#eff6ff" : idx % 2 === 1 ? "#f8fafc" : "#ffffff";

const SipAccessBreadcrumb = () => (
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
    <span>{SIP_ACCESS_CONTROL_PAGE_BREADCRUMB_ROOT}</span>
    <span>&gt;</span>
    <span>{SIP_ACCESS_CONTROL_PAGE_BREADCRUMB_SECTION}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>
      {SIP_ACCESS_CONTROL_PAGE_TITLE}
    </span>
  </div>
);

const SipAccessTableEmptyState = ({
  message,
  onAddNew,
  disabled,
  buttonLabel = SIP_ACCESS_CONTROL_BTN_ADD_NEW,
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 240,
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
      {message}
    </div>
    <Btn
      variant="cancel"
      onClick={onAddNew}
      disabled={disabled}
      style={{ padding: "8px 24px", fontSize: 12, borderRadius: 6 }}
    >
      {buttonLabel}
    </Btn>
  </div>
);

const SipAccessEditIcon = ({ onClick }) => (
  <EditDocumentIcon
    titleAccess={SIP_ACCESS_CONTROL_EDIT_TITLE_ACCESS}
    onClick={onClick}
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
  />
);

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
    {
      primary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      cancel: "#b6c2d3",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      cancel: "#a3b1c2",
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
  const isCompact = useMediaQuery(SIP_ACCESS_CONTROL_COMPACT_MQ);
  const [rows, setRows] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState({ ...SIP_ACCESS_CONTROL_INITIAL_ROW });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const modalFieldByKey = useMemo(
    () =>
      SIP_ACCESS_CONTROL_MODAL_FIELDS.reduce((acc, field) => {
        acc[field.key] = field;
        return acc;
      }, {}),
    [],
  );

  const modalFormFields = useMemo(() => {
    const names = SIP_ACCESS_CONTROL_FORM_LAYOUT.flat();
    return names.map((key) => modalFieldByKey[key]).filter(Boolean);
  }, [modalFieldByKey]);

  const selectedCount = rows.filter((r) => r.checked).length;

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
      showToast(SIP_ACCESS_CONTROL_ERR_NAME_REQUIRED, "error");
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
      showToast(SIP_ACCESS_CONTROL_ERR_DUPLICATE_NAME, "error");
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
        ? SIP_ACCESS_CONTROL_MSG_UPDATED
        : SIP_ACCESS_CONTROL_MSG_ADDED,
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
      !window.confirm(SIP_ACCESS_CONTROL_CONFIRM_DELETE(count))
    ) {
      return;
    }
    setRows((prev) => normalizeRows(prev.filter((r) => !r.checked)));
    showToast(SIP_ACCESS_CONTROL_MSG_DELETED(count), "success");
  };

  const handleClearAll = () => {
    if (rows.length === 0 || saving) return;
    if (!window.confirm(SIP_ACCESS_CONTROL_CONFIRM_CLEAR_ALL)) {
      return;
    }
    setRows([]);
    showToast(SIP_ACCESS_CONTROL_MSG_CLEARED, "success");
  };

  return (
    <>
      <SipAccessScrollbarStyles />
      <div
        className={SIP_ACCESS_CONTROL_SCROLL_CLASS}
        style={{
          ...sipAccessPageWrapStyle,
          ...(isCompact ? { padding: 8 } : {}),
        }}
        data-native-scroll
      >
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={() => setToast({ msg: "", type: "success" })}
          sx={sipAccessFixedAlertSx}
        >
          {toast.msg}
        </Alert>
      )}

      <div style={sipAccessPageInnerStyle}>
        <SipAccessBreadcrumb />

        <div style={sipAccessCardStyle}>
          <div
            style={{
              ...sipAccessToolbarStyle,
              ...(isCompact
                ? { flexDirection: "column", alignItems: "stretch", gap: 10 }
                : {}),
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
              {selectedCount > 0 && (
                <span style={sipAccessSelectedBadgeStyle}>
                  {selectedCount} {SIP_ACCESS_CONTROL_SELECTED_SUFFIX}
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
                style={sipAccessCancelBtnStyle}
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                {SIP_ACCESS_CONTROL_BTN_DELETE}
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleClearAll}
                disabled={rows.length === 0 || saving}
                style={sipAccessCancelBtnStyle}
              >
                {SIP_ACCESS_CONTROL_BTN_CLEAR_ALL}
              </Btn>
              <Btn
                variant="primary"
                onClick={() => openModal(null)}
                disabled={saving}
                style={sipAccessPrimaryBtnStyle}
              >
                {SIP_ACCESS_CONTROL_BTN_ADD_NEW}
              </Btn>
            </div>
          </div>

          {rows.length === 0 ? (
            <SipAccessTableEmptyState
              message={SIP_ACCESS_CONTROL_EMPTY_MESSAGE}
              onAddNew={() => openModal(null)}
              disabled={saving}
            />
          ) : (
            <>
              <div
                className={SIP_ACCESS_CONTROL_SCROLL_CLASS}
                style={{
                  overflowX: "auto",
                  overflowY: "auto",
                  flex: 1,
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "separate",
                    borderSpacing: 0,
                    tableLayout: "auto",
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
                                sx={sipAccessTableCheckboxSx}
                              />
                            </TH>
                          );
                        }
                        if (col.key === "modify") {
                          return (
                            <TH
                              key={col.key}
                              style={{ width: 70, borderRight: "none" }}
                            >
                              {col.label}
                            </TH>
                          );
                        }
                        return <TH key={col.key}>{col.label}</TH>;
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => {
                      const isLastRow = idx === rows.length - 1;
                      const isRowChecked = row.checked || false;
                      const rowBg = getSipAccessRowBg(isRowChecked, idx);
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
                              e.currentTarget.style.background = "#f8fafc";
                          }}
                          onMouseLeave={(e) => {
                            if (!isRowChecked)
                              e.currentTarget.style.background = rowBg;
                          }}
                        >
                          <td
                            style={getSipAccessTdStyle(rowBg, lastRowCellStyle, {
                              width: 36,
                              borderLeft: "none",
                            })}
                          >
                            <Checkbox
                              size="small"
                              checked={isRowChecked}
                              onChange={() => handleCheck(idx)}
                              sx={sipAccessTableCheckboxSx}
                            />
                          </td>
                          <td style={getSipAccessTdStyle(rowBg, lastRowCellStyle)}>
                            {row.no}
                          </td>
                          <td style={getSipAccessTdStyle(rowBg, lastRowCellStyle)}>
                            {row.name}
                          </td>
                          <td style={getSipAccessTdStyle(rowBg, lastRowCellStyle)}>
                            {defaultLabel(row.default)}
                          </td>
                          <td
                            style={getSipAccessTdStyle(rowBg, lastRowCellStyle, {
                              maxWidth: 280,
                              whiteSpace: "normal",
                              wordBreak: "break-word",
                            })}
                          >
                            {row.description || "—"}
                          </td>
                          <td
                            style={getSipAccessTdStyle(rowBg, lastRowCellStyle, {
                              borderRight: "none",
                            })}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "center",
                              }}
                            >
                              <SipAccessEditIcon onClick={() => openModal(idx)} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={sipAccessPaginationStyle}>
                <span style={{ fontSize: 11, color: C.mutedText, lineHeight: 1.2 }}>
                  {SIP_ACCESS_CONTROL_PAGINATION_SHOWING(
                    rows.length,
                    SIP_ACCESS_CONTROL_RECORD_LABEL,
                  )}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <Dialog
        open={modalOpen}
        onClose={() => {
          if (!saving) closeModal();
        }}
        maxWidth={false}
        slotProps={{
          backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.5)" } },
        }}
        PaperProps={{
          sx: {
            width: 520,
            maxWidth: "96vw",
            mx: "auto",
            p: 0,
            borderRadius: "8px",
            overflow: "hidden",
          },
        }}
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
          }}
        >
          {editIndex !== null
            ? SIP_ACCESS_CONTROL_MODAL_EDIT_TITLE
            : SIP_ACCESS_CONTROL_MODAL_ADD_TITLE}
        </DialogTitle>
        <DialogContent style={{ padding: "24px", backgroundColor: "#ffffff" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              width: "100%",
              background: "#f8fafc",
              border: `1px solid ${C.cardBorder}`,
              borderRadius: 8,
              padding: 20,
            }}
          >
            {modalFormFields.map((field) => (
              <div
                key={field.key}
                style={{
                  display: "flex",
                  alignItems: field.type === "textarea" ? "flex-start" : "center",
                  gap: 12,
                  width: "100%",
                }}
              >
                <SipAccessFieldLabel
                  tooltipKey={field.key}
                  style={{
                    paddingTop: field.type === "textarea" ? 8 : 0,
                  }}
                >
                  {field.label}:
                </SipAccessFieldLabel>
                <div style={{ flex: 1, minWidth: 0, width: "100%" }}>
                  {field.type === "text" ? (
                    <input
                      name={field.key}
                      type="text"
                      value={form[field.key] || ""}
                      onChange={handleFormChange}
                      style={{ ...systemModalFieldInputStyle, width: "100%" }}
                      {...inputInteraction}
                    />
                  ) : null}
                  {field.type === "select" ? (
                    <Select
                      name={field.key}
                      value={form[field.key] || field.initial}
                      onChange={handleFormChange}
                      fullWidth
                      sx={systemModalSelectSx}
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
                          sx={{ fontSize: 13 }}
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
                      style={{ ...systemModalTextareaStyle, width: "100%" }}
                      {...inputInteraction}
                    />
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
        <DialogActions
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 16,
            padding: "16px 24px",
            background: "#f8fafc",
            borderTop: `1px solid ${C.cardBorder}`,
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
          }}
        >
          <Btn
            variant="primary"
            onClick={handleSave}
            disabled={saving}
            style={{ minWidth: 100, height: 33, fontSize: 13 }}
          >
            {saving ? SIP_ACCESS_CONTROL_BTN_SAVING : SIP_ACCESS_CONTROL_BTN_SAVE}
          </Btn>
          <Btn
            variant="cancel"
            onClick={closeModal}
            style={sipAccessModalCancelBtnStyle}
          >
            {SIP_ACCESS_CONTROL_BTN_CLOSE}
          </Btn>
        </DialogActions>
      </Dialog>
      </div>
    </>
  );
};

export default SipAccessControl;
