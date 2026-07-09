import React, { useState, useEffect } from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tooltip,
} from "@mui/material";
import {
  PORT_GROUP_TOTAL_PORTS,
  PORT_GROUP_TABLE_COLUMNS,
  PORT_GROUP_INDEX_OPTIONS,
  PORT_GROUP_REGISTER_OPTIONS,
  PORT_GROUP_AUTHENTICATION_MODE_OPTIONS,
  PORT_GROUP_SELECT_MODE_OPTIONS,
  PORT_GROUP_MULTI_GROUP_OPTIONS,
  PORT_GROUP_FIELD_TOOLTIPS,
  PORT_GROUP_PAGE_BREADCRUMB_ROOT,
  PORT_GROUP_PAGE_BREADCRUMB_SECTION,
  PORT_GROUP_PAGE_BREADCRUMB_TITLE,
  PORT_GROUP_EMPTY_MESSAGE,
  PORT_GROUP_MODAL_TITLE_ADD,
  PORT_GROUP_MODAL_TITLE_EDIT,
  PORT_GROUP_SAVE_LABEL,
  PORT_GROUP_CLOSE_LABEL,
} from "../../../constants/PortGroupPageConstants";

const PORT_GROUP_ADD_NEW_DIALOG_MARGIN = 24;
const PORT_GROUP_ADD_NEW_DIALOG_LAYOUT_OFFSET = 80;

const PORT_GROUP_ADD_NEW_DIALOG_SX = {
  "& .MuiDialog-container": {
    alignItems: "center",
    justifyContent: "center",
  },
};

const PORT_GROUP_ADD_NEW_DIALOG_PAPER_SX = {
  margin: PORT_GROUP_ADD_NEW_DIALOG_MARGIN,
  maxHeight: `calc(100vh - ${PORT_GROUP_ADD_NEW_DIALOG_LAYOUT_OFFSET}px - ${PORT_GROUP_ADD_NEW_DIALOG_MARGIN * 2}px)`,
  display: "flex",
  flexDirection: "column",
  width: 720,
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

const FxsFieldLabel = ({ tooltipKey, tooltips, children, style = {} }) => {
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

// ── Local page UI (inlined from fxsSharedUi) ──

const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  cardShadow:
    "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
  divider: "#e2e6ec",
  labelText: "#3E5475",
  valueText: "#1f2937",
  mutedText: "#6b7280",
  strongText: "#1f2937",
  accent: "#3E5475",
  amber: "#dc2626",
};

const CARD_RADIUS = 10;

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
  const baseBg = extraStyle?.background ?? s.background;
  const baseShadow = extraStyle?.boxShadow ?? s.boxShadow ?? "none";
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      cancel: "#a3b1c2",
      danger: "#f87171",
      outline: "#d1d9e6",
      default: "#d1d5db",
    }[variant] || "#d1d5db";

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

const nativeFieldInputStyle = {
  height: 32,
  width: 200,
  padding: "0 10px",
  fontSize: 13,
  lineHeight: 1.35,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 4,
  outline: "none",
  backgroundColor: "#fff",
  color: C.valueText,
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const nativeFieldSelectStyle = {
  width: nativeFieldInputStyle.width,
  height: 32,
  minHeight: 32,
  padding: "0 28px 0 10px",
  fontSize: nativeFieldInputStyle.fontSize,
  lineHeight: 1.35,
  border: nativeFieldInputStyle.border,
  borderRadius: nativeFieldInputStyle.borderRadius,
  outline: nativeFieldInputStyle.outline,
  backgroundColor: nativeFieldInputStyle.backgroundColor,
  color: nativeFieldInputStyle.color,
  boxSizing: nativeFieldInputStyle.boxSizing,
  transition: nativeFieldInputStyle.transition,
  appearance: "auto",
};

const fxsNativeFieldInputStyle = nativeFieldInputStyle;
const fxsNativeFieldSelectStyle = nativeFieldSelectStyle;
const fxsNativeFieldInteraction = nativeFieldInteraction;


const checkboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
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

const PCM_TRUNK_GROUP_TH_GAP = { padding: "8px 14px" };
const PCM_TRUNK_GROUP_TD_GAP = { padding: "6px 14px", lineHeight: 1.2 };

const portGroupPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  width: "100%",
  maxWidth: "100%",
  padding: 16,
  boxSizing: "border-box",
};

const portGroupPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const portGroupCardStyle = {
  width: "100%",
  background: C.cardBg,
  borderRadius: CARD_RADIUS,
  overflow: "hidden",
  border: `1px solid ${C.cardBorder}`,
  boxShadow: C.cardShadow,
  display: "flex",
  flexDirection: "column",
};

const portGroupHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.divider}`,
  background: C.cardBg,
  flexWrap: "wrap",
  gap: 12,
  boxSizing: "border-box",
};

const portGroupTableBodyStyle = {
  overflowX: "auto",
  overflowY: "auto",
  width: "100%",
  boxSizing: "border-box",
};

const portGroupPaginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "10px 28px",
  background: C.cardBg,
  borderTop: `1px solid ${C.divider}`,
  overflow: "hidden",
};

const addNewModalFooterStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "100%",
  margin: 0,
  padding: "16px 24px",
  boxSizing: "border-box",
  background: "#f8fafc",
  borderTop: `1px solid ${C.cardBorder}`,
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
};

const addNewModalFooterBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
  minWidth: 100,
};


const addNewModalFooterCancelBtnStyle = {
  ...addNewModalFooterBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const addNewModalBackdropSlotProps = {
  backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.5)" } },
};

const addNewModalDialogContentSx = {
  maxHeight: "calc(100vh - 220px)",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
};

const PortGroupBreadcrumb = () => (
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
    <span>{PORT_GROUP_PAGE_BREADCRUMB_ROOT}</span>
    <span>&gt;</span>
    <span>{PORT_GROUP_PAGE_BREADCRUMB_SECTION}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>
      {PORT_GROUP_PAGE_BREADCRUMB_TITLE}
    </span>
  </div>
);

const numManipulateCardStyle = {
  background: "#ffffff",
  borderRadius: CARD_RADIUS,
  overflow: "hidden",
  border: `1.5px solid ${C.cardBorder}`,
  boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
};

const numManipulateToolbarStyle = {
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
};

const numManipulatePaginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.cardBorder}`,
  borderBottomLeftRadius: CARD_RADIUS,
  borderBottomRightRadius: CARD_RADIUS,
  overflow: "hidden",
};


const getBrowserZoomPercent = () => {
  const scale = window.visualViewport?.scale;
  if (typeof scale === "number" && scale > 0) {
    return Math.round(scale * 100);
  }
  return 100;
};

const routeTableMinWidthForZoom = (widePx) => {
  const scale = window.visualViewport?.scale ?? 1;
  if (scale >= 1.15) return widePx;
  const zoomPct = getBrowserZoomPercent();
  return zoomPct >= 130 ? widePx : "100%";
};

const routeTdStyle = {
  ...tdStyle,
  fontSize: 12,
  padding: "6px 8px",
  lineHeight: 1.2,
};

const routeThExtra = {
  fontSize: 10.5,
  padding: "9px 8px",
  letterSpacing: "0.04em",
};

const FieldRow = ({ label, tooltipKey, children }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    }}
  >
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: 170,
        flexShrink: 0,
        textAlign: "left",
      }}
    >
      <FxsFieldLabel tooltipKey={tooltipKey} tooltips={PORT_GROUP_FIELD_TOOLTIPS}>
        {label}
      </FxsFieldLabel>
    </label>
    <div style={{ width: "min(100%, 320px)" }}>{children}</div>
  </div>
);

const inputStyle = {
  ...fxsNativeFieldInputStyle,
  width: "100%",
};

const selectStyle = {
  ...fxsNativeFieldSelectStyle,
  width: "100%",
};

const inputInteraction = fxsNativeFieldInteraction;

// ── Initial State ─────────────────────────────────────────────────────────────
const initialFormState = () => ({
  index: "1",
  description: "default",
  registerPortGroup: "0",
  sipAccount: "",
  displayName: "",
  password: "",
  authUserName: "",
  registerSelectMode: "0",
  portSelectMode: "0",
  enumRule: "",
  ringExpire: "20",
  robKey: "",
  enablePortMultiGroup: "0",
  ports: Array.from({ length: PORT_GROUP_TOTAL_PORTS }, () => false),
});

const PortGroupPage = () => {
  const [groups, setGroups] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [form, setForm] = useState(initialFormState());
  const [checkedRows, setCheckedRows] = useState({});
  const [tableMinWidth, setTableMinWidth] = useState("100%");
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const alert = (msg) => {
    const isErr =
      /error|failed|required|please|invalid|must|choose|select|no port groups/i.test(
        msg,
      ) && !/successfully/i.test(msg);
    showToast(msg, isErr ? "error" : "success");
  };

  useEffect(() => {
    const updateTableWidthForZoom = () => {
      setTableMinWidth(routeTableMinWidthForZoom(1400));
    };
    updateTableWidthForZoom();
    window.addEventListener("resize", updateTableWidthForZoom);
    const vv = window.visualViewport;
    vv?.addEventListener("resize", updateTableWidthForZoom);
    vv?.addEventListener("scroll", updateTableWidthForZoom);
    return () => {
      window.removeEventListener("resize", updateTableWidthForZoom);
      vv?.removeEventListener("resize", updateTableWidthForZoom);
      vv?.removeEventListener("scroll", updateTableWidthForZoom);
    };
  }, []);

  const handleOpenModal = (group = null) => {
    if (group) {
      setForm({
        ...initialFormState(),
        index: group.index,
      });
      setEditingGroupId(group.id);
    } else {
      setForm(initialFormState());
      setEditingGroupId(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGroupId(null);
    setForm(initialFormState());
  };

  const handleAddNewClick = () => {
    handleOpenModal();
  };

  const handleFormChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePortToggle = (idx) => {
    setForm((prev) => ({
      ...prev,
      ports: prev.ports.map((v, i) => (i === idx ? !v : v)),
    }));
  };

  const checkAnyPortSelected = () => form.ports.some(Boolean);

  const handleCheckAllPorts = () => {
    setForm((prev) => ({
      ...prev,
      ports: prev.ports.map(() => true),
    }));
  };

  const handleInversePorts = () => {
    setForm((prev) => ({
      ...prev,
      ports: prev.ports.map((v) => !v),
    }));
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();

    if (!form.description.trim()) {
      alert("Please enter a description!");
      return;
    }

    if (!checkAnyPortSelected()) {
      alert("Please choose a port!");
      return;
    }

    const selectedPorts = form.ports
      .map((v, i) => (v ? i + 1 : null))
      .filter((n) => n !== null)
      .join(",");

    const newGroup = {
      id: Date.now(),
      index: form.index,
      description: form.description,
      sipAccount: form.registerPortGroup === "1" ? form.sipAccount : "---",
      displayName:
        form.registerPortGroup === "1" && form.displayName
          ? form.displayName
          : "---",
      ports: selectedPorts || "---",
      portSelectMode:
        PORT_GROUP_SELECT_MODE_OPTIONS.find(
          (o) => o.value === form.portSelectMode,
        )?.label || "",
      enumRule: form.portSelectMode === "5" ? form.enumRule || "---" : "---",
      ringExpire:
        form.portSelectMode === "5" ? form.ringExpire || "---" : "---",
      robKey:
        form.portSelectMode !== "4" &&
        form.portSelectMode !== "5" &&
        form.robKey
          ? form.robKey
          : "---",
    };

    setGroups((prev) => [...prev, newGroup]);
    handleCloseModal();
    alert(
      editingGroupId !== null
        ? "Port group updated successfully!"
        : "Port group added successfully!",
    );
  };

  const handleRowCheck = (id) => {
    setCheckedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleTableCheckAll = () => {
    const allChecked =
      groups.length > 0 && groups.every((g) => checkedRows[g.id]);
    if (allChecked) {
      setCheckedRows({});
    } else {
      const next = {};
      groups.forEach((g) => {
        next[g.id] = true;
      });
      setCheckedRows(next);
    }
  };

  const handleTableUncheckAll = () => {
    setCheckedRows({});
  };

  const handleTableInverse = () => {
    const next = {};
    groups.forEach((g) => {
      next[g.id] = !checkedRows[g.id];
    });
    setCheckedRows(next);
  };

  const handleDelete = () => {
    const selectedIds = groups.filter((g) => checkedRows[g.id]);
    if (selectedIds.length === 0) {
      alert("Please select at least one item to delete.");
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedIds.length} selected item(s)?`,
    );
    if (!confirmed) return;
    setGroups((prev) => prev.filter((g) => !checkedRows[g.id]));
    setCheckedRows({});
    alert("Selected port group(s) deleted successfully!");
  };

  const handleClearAll = () => {
    if (groups.length === 0) {
      alert("No port groups to clear.");
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to delete ALL ${groups.length} port group(s)? This action cannot be undone.`,
    );
    if (!confirmed) return;
    setGroups([]);
    setCheckedRows({});
    alert("All port groups cleared successfully!");
  };

  const selectedCount = Object.values(checkedRows).filter(Boolean).length;
  const allChecked =
    groups.length > 0 && groups.every((g) => checkedRows[g.id]);

  const renderEmptyState = () => (
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
        {PORT_GROUP_EMPTY_MESSAGE}
      </div>
      <Btn
        variant="cancel"
        onClick={handleAddNewClick}
        style={{ height: 30, padding: "6px 14px", fontSize: 12, borderRadius: 10 }}
      >
        + Add New
      </Btn>
    </div>
  );

  const renderTableCell = (col, group, isSelected, rowBg, cellExtra = {}) => {
    if (col.key === "modify") {
      return (
        <td
          key={col.key}
          style={{
            ...routeTdStyle,
            background: rowBg,
            borderRight: "none",
            ...cellExtra,
          }}
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            <EditDocumentIcon
              titleAccess="Edit"
              style={{
                cursor: "pointer",
                color: "#2563eb",
                fontSize: 22,
                opacity: 0.7,
                transition: "opacity 0.15s ease",
              }}
              onClick={() => handleOpenModal(group)}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "0.7";
              }}
            />
          </div>
        </td>
      );
    }
    if (col.key === "check") {
      return (
        <td
          key={col.key}
          style={{
            ...routeTdStyle,
            background: rowBg,
            width: 36,
            ...cellExtra,
          }}
        >
          <Checkbox
            size="small"
            checked={isSelected}
            onChange={() => handleRowCheck(group.id)}
            sx={checkboxSx}
          />
        </td>
      );
    }
    return (
      <td
        key={col.key}
        style={{
          ...routeTdStyle,
          background: rowBg,
          wordBreak: col.key === "ports" ? "break-all" : undefined,
          ...cellExtra,
        }}
      >
        {group[col.key]}
      </td>
    );
  };

  const renderTable = () => (
    <div style={portGroupCardStyle}>
      <div style={portGroupHeaderStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {selectedCount > 0 && (
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
              {selectedCount} selected
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
            onClick={handleTableInverse}
            disabled={groups.length === 0}
            style={{ height: 30, padding: "6px 14px", fontSize: 12, borderRadius: 10 }}
          >
            Inverse
          </Btn>
          <Btn
            variant="cancel"
            onClick={handleDelete}
            disabled={selectedCount === 0}
            style={{ height: 30, padding: "6px 14px", fontSize: 12, borderRadius: 10 }}
          >
            <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
            Delete
          </Btn>
          <Btn
            variant="cancel"
            onClick={handleClearAll}
            disabled={groups.length === 0}
            style={{ height: 30, padding: "6px 14px", fontSize: 12, borderRadius: 10 }}
          >
            Clear All
          </Btn>
          <Btn
            variant="primary"
            onClick={handleAddNewClick}
            style={{ height: 30, padding: "6px 14px", fontSize: 12, borderRadius: 10 }}
          >
            + Add New
          </Btn>
        </div>
      </div>

      <div style={portGroupTableBodyStyle}>
        {groups.length === 0 ? (
          renderEmptyState()
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: 0,
              minWidth: tableMinWidth,
            }}
          >
            <thead>
              <tr>
                {PORT_GROUP_TABLE_COLUMNS.map((col) => {
                  if (col.key === "check") {
                    return (
                      <TH
                        key={col.key}
                        style={{
                          width: 40,
                          padding: 0,
                          borderLeft: "none",
                          ...routeThExtra,
                          ...PCM_TRUNK_GROUP_TH_GAP,
                        }}
                      >
                        <Checkbox
                          size="small"
                          checked={allChecked}
                          indeterminate={
                            selectedCount > 0 && !allChecked
                          }
                          onChange={(e) => {
                            if (e.target.checked) handleTableCheckAll();
                            else handleTableUncheckAll();
                          }}
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
                          ...routeThExtra,
                          ...PCM_TRUNK_GROUP_TH_GAP,
                        }}
                      >
                        {col.label}
                      </TH>
                    );
                  }
                    return (
                      <TH key={col.key} style={{ ...routeThExtra, ...PCM_TRUNK_GROUP_TH_GAP }}>
                        {col.label}
                      </TH>
                    );
                })}
              </tr>
            </thead>
            <tbody>
              {groups.map((group, idx) => {
                const isSelected = !!checkedRows[group.id];
                const rowBg = isSelected
                  ? "#f0f9ff"
                  : idx % 2 === 1
                    ? "#f8fafc"
                    : "#ffffff";
                return (
                  <tr
                    key={group.id}
                    style={{
                      background: rowBg,
                      transition: "background 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected)
                        e.currentTarget.style.background = "#f1f5f9";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected)
                        e.currentTarget.style.background = rowBg;
                    }}
                  >
                    {PORT_GROUP_TABLE_COLUMNS.map((col) =>
                      renderTableCell(col, group, isSelected, rowBg, {}),
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {groups.length > 0 && (
        <div style={portGroupPaginationStyle}>
          <span style={{ fontSize: 11, color: C.mutedText }}>
            Showing {groups.length} record{groups.length !== 1 ? "s" : ""} on
            page 1
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn disabled variant="outline">
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
                border: `1px solid ${C.divider}`,
              }}
            >
              Page 1 of 1
            </span>
            <Btn disabled variant="outline">
              Next →
            </Btn>
          </div>
        </div>
      )}
    </div>
  );

  const renderFormFields = () => (
    <>
              <FieldRow label="ID:" tooltipKey="index">
                <select
                  value={form.index}
                  onChange={(e) => handleFormChange("index", e.target.value)}
                  style={selectStyle}
                  {...inputInteraction}
                >
                  {PORT_GROUP_INDEX_OPTIONS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </FieldRow>

              <FieldRow label="Description:" tooltipKey="description">
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) =>
                    handleFormChange("description", e.target.value)
                  }
                  style={inputStyle}
                  {...inputInteraction}
                  maxLength={23}
                />
              </FieldRow>

              <FieldRow label="Register Port Group:" tooltipKey="registerPortGroup">
                <select
                  value={form.registerPortGroup}
                  onChange={(e) =>
                    handleFormChange("registerPortGroup", e.target.value)
                  }
                  style={selectStyle}
                  {...inputInteraction}
                >
                  {PORT_GROUP_REGISTER_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </FieldRow>

              {form.registerPortGroup === "1" && (
                <>
                  <FieldRow label="SIP Account:" tooltipKey="sipAccount">
                    <input
                      type="text"
                      value={form.sipAccount}
                      onChange={(e) =>
                        handleFormChange("sipAccount", e.target.value)
                      }
                      style={inputStyle}
                      {...inputInteraction}
                    />
                  </FieldRow>
                  <FieldRow label="Display Name:" tooltipKey="displayName">
                    <input
                      type="text"
                      value={form.displayName}
                      onChange={(e) =>
                        handleFormChange("displayName", e.target.value)
                      }
                      style={inputStyle}
                      {...inputInteraction}
                    />
                  </FieldRow>
                  <FieldRow label="Password:" tooltipKey="password">
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) =>
                        handleFormChange("password", e.target.value)
                      }
                      style={inputStyle}
                      {...inputInteraction}
                    />
                  </FieldRow>
                </>
              )}

              <FieldRow label="Authentication Mode:" tooltipKey="registerSelectMode">
                <select
                  value={form.registerSelectMode}
                  onChange={(e) =>
                    handleFormChange("registerSelectMode", e.target.value)
                  }
                  style={selectStyle}
                  {...inputInteraction}
                >
                  {PORT_GROUP_AUTHENTICATION_MODE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </FieldRow>

              <FieldRow label="Port Select Mode:" tooltipKey="portSelectMode">
                <select
                  value={form.portSelectMode}
                  onChange={(e) =>
                    handleFormChange("portSelectMode", e.target.value)
                  }
                  style={selectStyle}
                  {...inputInteraction}
                >
                  {PORT_GROUP_SELECT_MODE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </FieldRow>

              {form.portSelectMode === "5" && (
                <>
                  <FieldRow label="Rule for Ringing by Turns:" tooltipKey="enumRule">
                    <input
                      type="text"
                      value={form.enumRule}
                      onChange={(e) =>
                        handleFormChange("enumRule", e.target.value)
                      }
                      style={inputStyle}
                      {...inputInteraction}
                    />
                  </FieldRow>
                  <FieldRow label="Timeout for Ringing by Turns (s):" tooltipKey="ringExpire">
                    <input
                      type="text"
                      value={form.ringExpire}
                      onChange={(e) =>
                        handleFormChange("ringExpire", e.target.value)
                      }
                      style={inputStyle}
                      {...inputInteraction}
                    />
                  </FieldRow>
                </>
              )}

              {form.portSelectMode !== "4" && form.portSelectMode !== "5" && (
                <FieldRow label="Preemptive Answer Keyboard Shortcut:" tooltipKey="robKey">
                  <input
                    type="text"
                    value={form.robKey}
                    onChange={(e) => handleFormChange("robKey", e.target.value)}
                    style={inputStyle}
                    {...inputInteraction}
                  />
                </FieldRow>
              )}

              <FieldRow label="Port Reused by Multiple Groups:" tooltipKey="enablePortMultiGroup">
                <select
                  value={form.enablePortMultiGroup}
                  onChange={(e) =>
                    handleFormChange("enablePortMultiGroup", e.target.value)
                  }
                  style={selectStyle}
                  {...inputInteraction}
                >
                  {PORT_GROUP_MULTI_GROUP_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </FieldRow>
    </>
  );

  const renderPortsSection = () => (
          <div
            style={{
              background: "#f8fafc",

              border: `1px solid ${C.cardBorder}`,
              borderRadius: 8,
              padding: 16,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: C.labelText,
                marginBottom: 14,
                paddingBottom: 10,
                borderBottom: `1px solid ${C.divider}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <FxsFieldLabel
                tooltipKey="ports"
                tooltips={PORT_GROUP_FIELD_TOOLTIPS}
                style={{ fontSize: 13, fontWeight: 700 }}
              >
                Assign Ports
              </FxsFieldLabel>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn
                  onClick={handleCheckAllPorts}
                  variant="cancel"
                  style={{ height: 30, padding: "6px 14px", fontSize: 12, borderRadius: 10 }}
                >
                  Check All
                </Btn>
                <Btn
                  onClick={handleInversePorts}
                  variant="cancel"
                  style={{ height: 30, padding: "6px 14px", fontSize: 12, borderRadius: 10 }}
                >
                  Inverse
                </Btn>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                gap: 12,
              }}
            >
              {form.ports.map((val, idx) => (
                <label
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: 12,
                    color: C.valueText,
                    cursor: "pointer",
                  }}
                >
                  <Checkbox
                    size="small"
                    checked={val}
                    onChange={() => handlePortToggle(idx)}
                    sx={checkboxSx}
                  />
                  Port {idx + 1}(FXS)
                </label>
              ))}
            </div>
          </div>
  );

  return (
    <div style={portGroupPageWrapStyle}>
      <div style={portGroupPageInnerStyle}>
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

        <PortGroupBreadcrumb />

        {renderTable()}

        <Dialog
          open={isModalOpen}
          onClose={handleCloseModal}
          maxWidth={false}
          slotProps={addNewModalBackdropSlotProps}
          sx={PORT_GROUP_ADD_NEW_DIALOG_SX}
          PaperProps={{
            sx: PORT_GROUP_ADD_NEW_DIALOG_PAPER_SX,
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
            {editingGroupId !== null
              ? PORT_GROUP_MODAL_TITLE_EDIT
              : PORT_GROUP_MODAL_TITLE_ADD}
          </DialogTitle>
          <DialogContent
            style={{
              padding: "24px",
              backgroundColor: "#ffffff",
              flex: "1 1 auto",
            }}
            sx={addNewModalDialogContentSx}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  background: "#f8fafc",
                  border: `1px solid ${C.cardBorder}`,
                  borderRadius: 8,
                  padding: 20,
                }}
              >
                {renderFormFields()}
              </div>
              {renderPortsSection()}
            </div>
          </DialogContent>
          <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
            <Btn
              variant="primary"
              onClick={handleSave}
              style={addNewModalFooterBtnStyle}
            >
              {PORT_GROUP_SAVE_LABEL}
            </Btn>
            <Btn
              variant="cancel"
              onClick={handleCloseModal}
              style={addNewModalFooterCancelBtnStyle}
            >
              {PORT_GROUP_CLOSE_LABEL}
            </Btn>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default PortGroupPage;
