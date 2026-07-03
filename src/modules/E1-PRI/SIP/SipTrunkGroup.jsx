import React, { useState, useEffect } from "react";
import {
  SIP_TRUNK_GROUP_INITIAL_FORM,
  SIP_TRUNK_GROUP_TABLE_COLUMNS,
  SIP_TRUNK_GROUP_FIELD_TOOLTIPS,
  SIP_TRUNK_GROUP_PAGE_BREADCRUMB_ROOT,
  SIP_TRUNK_GROUP_PAGE_BREADCRUMB_SECTION,
  SIP_TRUNK_GROUP_PAGE_TITLE,
  SIP_TRUNK_GROUP_BTN_INVERSE,
  SIP_TRUNK_GROUP_BTN_DELETE,
  SIP_TRUNK_GROUP_BTN_CLEAR_ALL,
  SIP_TRUNK_GROUP_BTN_ADD_NEW,
  SIP_TRUNK_GROUP_BTN_PREV,
  SIP_TRUNK_GROUP_BTN_NEXT,
  SIP_TRUNK_GROUP_BTN_SAVE,
  SIP_TRUNK_GROUP_BTN_SAVING,
  SIP_TRUNK_GROUP_BTN_CLOSE,
  SIP_TRUNK_GROUP_MODAL_ADD_TITLE,
  SIP_TRUNK_GROUP_MODAL_EDIT_TITLE,
  SIP_TRUNK_GROUP_LABEL_SIP_TRUNK_ID,
  SIP_TRUNK_GROUP_LABEL_GROUP_ID,
  SIP_TRUNK_GROUP_PLACEHOLDER_SELECT_TRUNK,
  SIP_TRUNK_GROUP_PLACEHOLDER_NO_OPTIONS,
  SIP_TRUNK_GROUP_PLACEHOLDER_GROUP_ID,
  SIP_TRUNK_GROUP_EMPTY_MESSAGE,
  SIP_TRUNK_GROUP_RECORD_LABEL,
  SIP_TRUNK_GROUP_SELECTED_SUFFIX,
  SIP_TRUNK_GROUP_ERR_REQUIRED_FIELDS,
  SIP_TRUNK_GROUP_ERR_GROUP_ID_REQUIRED,
  SIP_TRUNK_GROUP_ERR_DUPLICATE_GROUP_ID,
  SIP_TRUNK_GROUP_ERR_SAVE_FAILED,
  SIP_TRUNK_GROUP_ERR_NETWORK,
  SIP_TRUNK_GROUP_ERR_SELECT_TO_DELETE,
  SIP_TRUNK_GROUP_ERR_DELETE_FAILED,
  SIP_TRUNK_GROUP_ERR_IN_USE,
  SIP_TRUNK_GROUP_MSG_UPDATED,
  SIP_TRUNK_GROUP_MSG_SAVED,
  SIP_TRUNK_GROUP_MSG_DELETED_ONE,
  SIP_TRUNK_GROUP_MSG_DELETED_MANY,
  SIP_TRUNK_GROUP_MSG_DELETED_ALL,
  SIP_TRUNK_GROUP_CONFIRM_DELETE_SELECTED,
  SIP_TRUNK_GROUP_CONFIRM_CLEAR_ALL,
  SIP_TRUNK_GROUP_CONFIRM_DELETE_ONE,
  SIP_TRUNK_GROUP_PAGINATION_SHOWING,
  SIP_TRUNK_GROUP_PAGINATION_PAGE_OF,
} from "../../../constants/SipTrunkGroupConstants";
import {
  addGroup,
  listGroups,
  deleteGroup,
  listSipRegistrations,
  fetchSipIpTrunkAccounts,
  listIpPstnRoutes,
  listNumberManipulations,
} from "../../../api/apiService";
import {
  Checkbox,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from "@mui/material";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
// ── Local page UI (inlined from e1PriSharedUi)
// ── Page-local field label tooltip UI (not shared) ──
const FIELD_LABEL_COLOR = "#3E5475";

const SIP_TRUNK_GROUP_SCROLL_CLASS = "sip-trunk-group-scroll";

const SIP_TRUNK_GROUP_TOOLTIP_PROPS = {
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

const SipTrunkGroupFieldLabel = ({ tooltipKey, tooltips, children, style = {} }) => {
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
    <Tooltip title={formatFieldTooltipTitle(tooltip)} {...SIP_TRUNK_GROUP_TOOLTIP_PROPS}>
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
  mutedText: "#6b7280",
  strongText: "#0f172a",
  accent: "#3E5475",
  amber: "#dc2626",
  errorRed: "#dc2626",
};

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

const SIP_TRUNK_GROUP_ADD_NEW_DIALOG_MARGIN = 24;
const SIP_TRUNK_GROUP_ADD_NEW_DIALOG_LAYOUT_OFFSET = 80;

const SIP_TRUNK_GROUP_ADD_NEW_DIALOG_SX = {
  "& .MuiDialog-container": {
    alignItems: "center",
    justifyContent: "center",
  },
};

const SIP_TRUNK_GROUP_ADD_NEW_DIALOG_PAPER_SX = {
  margin: SIP_TRUNK_GROUP_ADD_NEW_DIALOG_MARGIN,
  maxHeight: `calc(100vh - ${SIP_TRUNK_GROUP_ADD_NEW_DIALOG_LAYOUT_OFFSET}px - ${SIP_TRUNK_GROUP_ADD_NEW_DIALOG_MARGIN * 2}px)`,
  display: "flex",
  flexDirection: "column",
  width: 520,
  maxWidth: "96vw",
  p: 0,
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

const addNewModalDialogContentSx = {
  maxHeight: "calc(100vh - 220px)",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
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

const sipTrunkGroupModalCancelBtnStyle = {
  ...addNewModalFooterBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
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

const sipTrunkGroupFixedAlertSx = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  boxShadow: 3,
};

const getSipTrunkGroupTdStyle = (rowBg, lastRowCellStyle, extra = {}) => ({
  ...tdStyle,
  background: rowBg,
  ...lastRowCellStyle,
  ...extra,
});

const getSipTrunkGroupRowBg = (isSelected, idx) =>
  isSelected ? "#eff6ff" : idx % 2 === 1 ? "#f8fafc" : "#ffffff";

const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";
const FOCUS_RING_SHADOW = "0 0 0 2px rgba(62, 84, 117, 0.15)";

const sipTrunkGroupOutlinedInputRootSx = {
  backgroundColor: "#fff",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  "& fieldset": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  "&:hover fieldset": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused": {
    boxShadow: FOCUS_RING_SHADOW,
  },
  "&.Mui-focused fieldset": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
  "&.Mui-focused:hover fieldset": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
};

const sipTrunkGroupModalTextFieldSx = {
  "& .MuiOutlinedInput-root": sipTrunkGroupOutlinedInputRootSx,
  "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_HOVER,
  },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
  "& .MuiOutlinedInput-input": {
    backgroundColor: "#fff",
    fontSize: 13,
    padding: "8px 12px",
  },
};

const sipTrunkGroupModalSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  width: "100%",
  minHeight: 36,
  height: 36,
  ...sipTrunkGroupOutlinedInputRootSx,
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
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
};

const sipTrunkGroupPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const sipTrunkGroupPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const SipTrunkGroupBreadcrumb = ({ style }) => (
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
      ...style,
    }}
  >
    <span>{SIP_TRUNK_GROUP_PAGE_BREADCRUMB_ROOT}</span>
    <span>&gt;</span>
    <span>{SIP_TRUNK_GROUP_PAGE_BREADCRUMB_SECTION}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>
      {SIP_TRUNK_GROUP_PAGE_TITLE}
    </span>
  </div>
);

const SipTrunkGroupScrollbarStyles = () => (
  <style>{`
    .${SIP_TRUNK_GROUP_SCROLL_CLASS} {
      scroll-behavior: smooth;
      scrollbar-gutter: stable;
      scrollbar-width: thin;
      scrollbar-color: rgba(100, 116, 139, 0.45) transparent;
    }
    .${SIP_TRUNK_GROUP_SCROLL_CLASS}::-webkit-scrollbar {
      width: 8px;
      height: 8px;
      transition: width 0.2s ease, height 0.2s ease;
    }
    .${SIP_TRUNK_GROUP_SCROLL_CLASS}::-webkit-scrollbar:hover {
      width: 11px;
      height: 11px;
    }
    .${SIP_TRUNK_GROUP_SCROLL_CLASS}::-webkit-scrollbar-corner {
      background: transparent;
    }
    .${SIP_TRUNK_GROUP_SCROLL_CLASS}::-webkit-scrollbar-track {
      background: transparent;
    }
    .${SIP_TRUNK_GROUP_SCROLL_CLASS}::-webkit-scrollbar-thumb {
      background-color: rgba(100, 116, 139, 0.45);
      border-radius: 6px;
      border: 2px solid transparent;
      background-clip: padding-box;
      transition: background-color 0.2s ease;
    }
    .${SIP_TRUNK_GROUP_SCROLL_CLASS}::-webkit-scrollbar-thumb:hover {
      background-color: rgba(71, 85, 105, 0.65);
    }
  `}</style>
);

const SipTrunkGroupTableListLoading = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: 48,
    }}
  >
    <CircularProgress size={28} style={{ color: C.accent }} />
  </div>
);

const SipTrunkGroupTableListEmptyState = ({
  message,
  onAddNew,
  buttonLabel = "+ Add New",
  showButton = true,
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
        marginBottom: showButton && onAddNew ? 16 : 0,
      }}
    >
      {message}
    </div>
    {showButton && onAddNew ? (
      <Btn
        variant="cancel"
        onClick={onAddNew}
        style={{ padding: "8px 24px", fontSize: 12, borderRadius: 6 }}
      >
        {buttonLabel}
      </Btn>
    ) : null}
  </div>
);

const SIP_TRUNK_GROUP_TABLE_CARD_RADIUS = 10;

const sipTrunkGroupCardStyle = {
  background: "#ffffff",
  borderRadius: SIP_TRUNK_GROUP_TABLE_CARD_RADIUS,
  overflow: "hidden",
  border: `1px solid ${C.cardBorder}`,
  boxShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
};

const sipTrunkGroupToolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.divider}`,
  background: "#ffffff",
  flexWrap: "wrap",
  gap: 12,
  borderTopLeftRadius: SIP_TRUNK_GROUP_TABLE_CARD_RADIUS,
  borderTopRightRadius: SIP_TRUNK_GROUP_TABLE_CARD_RADIUS,
};

const sipTrunkGroupPaginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.divider}`,
  borderBottomLeftRadius: SIP_TRUNK_GROUP_TABLE_CARD_RADIUS,
  borderBottomRightRadius: SIP_TRUNK_GROUP_TABLE_CARD_RADIUS,
  overflow: "hidden",
};

const sipTrunkGroupSelectedBadgeStyle = {
  background: "#eff6ff",
  color: C.accent,
  fontSize: 11,
  fontWeight: 700,
  padding: "5px 12px",
  borderRadius: 999,
  border: `1px solid ${C.accent}`,
};

const sipTrunkGroupCancelBtnStyle = {
  height: 30,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const sipTrunkGroupPrimaryBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
};

const sipTrunkGroupPageBadgeStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: C.accent,
  background: "#e0f2fe",
  padding: "5px 14px",
  borderRadius: 6,
  border: `1px solid ${C.cardBorder}`,
};

const SipTrunkGroupPagination = ({
  page,
  totalPages,
  recordCount,
  onPageChange,
  recordLabel = SIP_TRUNK_GROUP_RECORD_LABEL,
  style,
}) => (
  <div style={{ ...sipTrunkGroupPaginationStyle, ...style }}>
    <span style={{ fontSize: 11, color: C.mutedText }}>
      {SIP_TRUNK_GROUP_PAGINATION_SHOWING(recordCount, recordLabel, page)}
    </span>
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Btn
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        variant="outline"
      >
        {SIP_TRUNK_GROUP_BTN_PREV}
      </Btn>
      <span style={sipTrunkGroupPageBadgeStyle}>
        {SIP_TRUNK_GROUP_PAGINATION_PAGE_OF(page, totalPages)}
      </span>
      <Btn
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        variant="outline"
      >
        {SIP_TRUNK_GROUP_BTN_NEXT}
      </Btn>
    </div>
  </div>
);

const sipTrunkGroupTableCheckboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const getGroupIdValue = (group) =>
  String(group?.group_id ?? group?.groupId ?? "").trim();

const resolveGroupIdValue = (group) => {
  const explicit = getGroupIdValue(group);
  if (explicit) return explicit;
  const recordId = group?.id;
  return recordId !== undefined && recordId !== null
    ? String(recordId).trim()
    : "";
};

const IGNORED_GROUP_REF_VALUES = new Set([
  "",
  "any",
  "Any",
  "undefined",
  "null",
]);

const SIP_ROUTE_REF_FIELDS = [
  "call_source",
  "callSource",
  "source_group",
  "source_group_id",
  "sip_trunk_group",
  "sip_trunk_group_id",
];

const SIP_MANIP_REF_FIELDS = [
  "call_initiator",
  "callInitiator",
  "callInitiatorId",
  "call_initiator_id",
  "sip_trunk_group",
  "sip_trunk_group_id",
];

const SIP_MANIPULATION_TYPES = [
  "ip_in_callerid",
  "ip_in_calleeid",
  "ip_in_oricalleeid",
];

const normalizeGroupRefValue = (value) => String(value ?? "").trim();

const matchesGroupReference = (value, groupKey) => {
  const normalized = normalizeGroupRefValue(value);
  if (IGNORED_GROUP_REF_VALUES.has(normalized)) return false;
  return normalized === groupKey;
};

const itemReferencesGroup = (item, fields, groupKey) =>
  fields.some((field) => matchesGroupReference(item?.[field], groupKey));

const getRouteList = (response) =>
  Array.isArray(response?.message)
    ? response.message
    : Array.isArray(response?.data)
      ? response.data
      : [];

const countGroupsWithSameKey = (allGroups, groupKey) =>
  allGroups.filter((g) => resolveGroupIdValue(g) === groupKey).length;

const normalizeGroupIdForApi = (value) => {
  const trimmed = String(value ?? "").trim();
  if (/^\d+$/.test(trimmed)) {
    return parseInt(trimmed, 10);
  }
  return trimmed;
};


const SipTrunkGroup = () => {
  const [formData, setFormData] = useState(SIP_TRUNK_GROUP_INITIAL_FORM);
  const [groups, setGroups] = useState([]);
  const [trunkIds, setTrunkIds] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false,
  });
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const itemsPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(groups.length / itemsPerPage));
  const pagedGroups = groups.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );
  const pageIndices = pagedGroups.map(
    (_, idx) => (page - 1) * itemsPerPage + idx,
  );
  const allPageSelected =
    pageIndices.length > 0 && pageIndices.every((i) => selected.includes(i));
  const somePageSelected =
    pageIndices.some((i) => selected.includes(i)) && !allPageSelected;

  const handleTogglePageSelection = () => {
    if (allPageSelected) {
      setSelected((sel) => sel.filter((i) => !pageIndices.includes(i)));
    } else {
      setSelected((sel) => Array.from(new Set([...sel, ...pageIndices])));
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Validation for group_id: only alphanumeric characters, no spaces
    if (name === "group_id") {
      const alphanumericValue = value.replace(/[^a-zA-Z0-9]/g, "");
      setFormData((prev) => ({ ...prev, [name]: alphanumericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Fetch SIP Trunk IDs from SIP Registration and extension numbers from SIP-to-SIP account, then build combined options
  const fetchTrunkIds = async () => {
    try {
      const [regRes, ipTrunkRes] = await Promise.all([
        listSipRegistrations(),
        fetchSipIpTrunkAccounts(),
      ]);

      // Collect trunk IDs
      const trunkIdList = Array.isArray(regRes?.message || regRes?.data)
        ? (regRes.message || regRes.data)
            .map((it) => it?.trunkId || it?.trunk_id || it?.id)
            .filter((v) => v !== undefined && v !== null)
            .map((v) => String(v))
        : [];

      // Unique trunk IDs
      const uniqueTrunkIds = Array.from(new Set(trunkIdList));

      // Collect SIP-to-SIP extensions
      const extList = Array.isArray(ipTrunkRes?.message || ipTrunkRes?.data)
        ? (ipTrunkRes.message || ipTrunkRes.data)
            .map((it) => it?.extension || it?.id)
            .filter((v) => v !== undefined && v !== null)
            .map((v) => String(v))
        : [];

      const uniqueExts = Array.from(new Set(extList));

      // Build combined options: trunkId/extension. Avoid duplicates.
      const combinedOptions = [];
      uniqueTrunkIds.forEach((tid) => {
        if (uniqueExts.length > 0) {
          uniqueExts.forEach((ext) => {
            combinedOptions.push({
              value: `${tid}/${ext}`,
              label: `${tid}/${ext}`,
            });
          });
        } else {
          // If no extensions exist yet, show plain trunkId option (only once)
          combinedOptions.push({ value: `${tid}`, label: `${tid}` });
        }
      });

      // Also include plain trunkId options for backward compatibility (so editing older rows works),
      // but ensure we don't add duplicates.
      uniqueTrunkIds.forEach((tid) => {
        combinedOptions.push({ value: `${tid}`, label: `${tid}` });
      });

      // Deduplicate by value (preserve first occurrence)
      const uniqueByValue = Array.from(
        new Map(combinedOptions.map((o) => [o.value, o])).values(),
      );
      setTrunkIds(uniqueByValue);
    } catch (error) {
      console.error("Error fetching SIP trunk/extension IDs:", error);
      // Leave dropdown empty rather than failing the page
      setTrunkIds([]);
    }
  };

  // Fetch groups from API
  const fetchGroups = async () => {
    setLoading((prev) => ({ ...prev, fetch: true }));
    try {
      const response = await listGroups();
      if (response.response && response.message) {
        // Sort groups by ID to ensure proper order
        const sortedGroups = response.message.sort((a, b) => a.id - b.id);
        setGroups(sortedGroups);
      } else {
        // If response is successful but no data, ensure groups is empty
        setGroups([]);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      showMessage("error", SIP_TRUNK_GROUP_ERR_NETWORK);
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
      setIsInitialLoad(false);
    }
  };

  const handleSave = async () => {
    if (!formData.sip_trunk_id || !formData.group_id) {
      showMessage("error", SIP_TRUNK_GROUP_ERR_REQUIRED_FIELDS);
      return;
    }
    const desiredGroupId = String(formData.group_id ?? "").trim();
    if (desiredGroupId === "") {
      showMessage("error", SIP_TRUNK_GROUP_ERR_GROUP_ID_REQUIRED);
      return;
    }

    const editingRecord =
      editingRecordId != null
        ? groups.find((group) => String(group.id) === String(editingRecordId))
        : editIndex !== -1
          ? groups[editIndex]
          : null;
    const originalGroupId = editingRecord
      ? resolveGroupIdValue(editingRecord)
      : "";
    const groupIdUnchanged =
      editingRecord != null && desiredGroupId === originalGroupId;

    if (!groupIdUnchanged) {
      const isDuplicate = groups.some((group) => {
        if (
          editingRecordId != null &&
          String(group.id) === String(editingRecordId)
        ) {
          return false;
        }
        return resolveGroupIdValue(group) === desiredGroupId;
      });
      if (isDuplicate) {
        showMessage(
          "error",
          SIP_TRUNK_GROUP_ERR_DUPLICATE_GROUP_ID(desiredGroupId),
        );
        return;
      }
    }
    setLoading((prev) => ({ ...prev, save: true }));
    try {
      const payload = {
        sip_trunk_id: String(formData.sip_trunk_id ?? "").trim(),
        group_id: normalizeGroupIdForApi(desiredGroupId),
      };
      const response =
        editingRecordId != null
          ? await addGroup({
              id: String(editingRecordId),
              ...payload,
            })
          : await addGroup(payload);
      if (response.response) {
        showMessage(
          "success",
          response.message ||
            (editingRecordId != null
              ? SIP_TRUNK_GROUP_MSG_UPDATED
              : SIP_TRUNK_GROUP_MSG_SAVED),
        );
        setShowModal(false);
        setFormData(SIP_TRUNK_GROUP_INITIAL_FORM);
        setEditIndex(-1);
        setEditingRecordId(null);
        await fetchGroups();
      } else {
        showMessage("error", response.message || SIP_TRUNK_GROUP_ERR_SAVE_FAILED);
      }
    } catch (error) {
      console.error("Error saving group:", error);
      const apiMessage =
        error?.response?.data?.message ||
        error?.message ||
        SIP_TRUNK_GROUP_ERR_NETWORK;
      showMessage("error", apiMessage);
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  const handleAddNew = () => {
    setFormData(SIP_TRUNK_GROUP_INITIAL_FORM);
    setEditIndex(-1);
    setEditingRecordId(null);
    setShowModal(true);
  };

  // Table selection logic
  const handleSelectRow = (idx) => {
    setSelected((sel) =>
      sel.includes(idx) ? sel.filter((i) => i !== idx) : [...sel, idx],
    );
  };
  const handleInverse = () =>
    setSelected(
      pagedGroups
        .map((_, idx) => {
          const realIdx = (page - 1) * itemsPerPage + idx;
          return selected.includes(realIdx) ? null : realIdx;
        })
        .filter((i) => i !== null),
    );
  const handleDelete = async () => {
    if (selected.length === 0) {
      showMessage("error", SIP_TRUNK_GROUP_ERR_SELECT_TO_DELETE);
      return;
    }
    if (!window.confirm(SIP_TRUNK_GROUP_CONFIRM_DELETE_SELECTED))
      return;
    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const groupsToDelete = selected
        .map((idx) => groups[idx])
        .filter(Boolean);
      let remainingGroups = [...groups];
      let deletedCount = 0;

      for (const group of groupsToDelete) {
        const reference = await isGroupReferenced(group, remainingGroups);
        if (reference.inUse) {
          showMessage(
            "error",
            SIP_TRUNK_GROUP_ERR_IN_USE(
              resolveGroupIdValue(group),
              reference.reason,
            ),
          );
          continue;
        }
        const response = await deleteGroup(group.id);
        if (response?.response === false) {
          showMessage("error", response.message || SIP_TRUNK_GROUP_ERR_DELETE_FAILED);
          continue;
        }
        deletedCount += 1;
        remainingGroups = remainingGroups.filter((g) => g.id !== group.id);
      }
      await fetchGroups();
      setSelected([]);
      if (deletedCount > 0) {
        showMessage(
          "success",
          deletedCount === 1
            ? SIP_TRUNK_GROUP_MSG_DELETED_ONE
            : SIP_TRUNK_GROUP_MSG_DELETED_MANY(deletedCount),
        );
      }
    } catch (error) {
      console.error("Error deleting groups:", error);
      showMessage("error", SIP_TRUNK_GROUP_ERR_NETWORK);
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm(SIP_TRUNK_GROUP_CONFIRM_CLEAR_ALL)) return;
    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      let remainingGroups = [...groups];
      let deletedCount = 0;

      for (const group of groups) {
        const reference = await isGroupReferenced(group, remainingGroups);
        if (reference.inUse) {
          showMessage(
            "error",
            SIP_TRUNK_GROUP_ERR_IN_USE(
              resolveGroupIdValue(group),
              reference.reason,
            ),
          );
          continue;
        }
        const response = await deleteGroup(group.id);
        if (response?.response === false) {
          showMessage("error", response.message || SIP_TRUNK_GROUP_ERR_DELETE_FAILED);
          continue;
        }
        deletedCount += 1;
        remainingGroups = remainingGroups.filter((g) => g.id !== group.id);
      }
      await fetchGroups();
      setSelected([]);
      setPage(1);
      if (deletedCount > 0) {
        showMessage(
          "success",
          deletedCount === groups.length
            ? SIP_TRUNK_GROUP_MSG_DELETED_ALL
            : SIP_TRUNK_GROUP_MSG_DELETED_MANY(deletedCount),
        );
      }
    } catch (error) {
      console.error("Error clearing all groups:", error);
      showMessage("error", SIP_TRUNK_GROUP_ERR_NETWORK);
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handlePageChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 1 && val <= totalPages) setPage(val);
  };

  const handleSingleDelete = async (idx) => {
    const group = groups[idx];
    if (
      !window.confirm(
        SIP_TRUNK_GROUP_CONFIRM_DELETE_ONE(group.group_id),
      )
    )
      return;
    try {
      const reference = await isGroupReferenced(group, groups);
      if (reference.inUse) {
        showMessage(
          "error",
          SIP_TRUNK_GROUP_ERR_IN_USE(
            resolveGroupIdValue(group),
            reference.reason,
          ),
        );
        return;
      }
      await deleteGroup(group.id);
      await fetchGroups();
      if (editIndex === idx) handleAddNew();
    } catch (error) {
      console.error("Error deleting group:", error);
      showMessage("error", SIP_TRUNK_GROUP_ERR_NETWORK);
    }
  };

  useEffect(() => {
    // Fetch trunk IDs and groups on component mount
    fetchTrunkIds();
    fetchGroups();
  }, []);

  // Block delete only when this is the last row for a Group ID still used in routes.
  const isGroupReferenced = async (group, allGroups = groups) => {
    const gid = resolveGroupIdValue(group);
    if (!gid) return { inUse: false };

    if (countGroupsWithSameKey(allGroups, gid) > 1) {
      return { inUse: false };
    }

    try {
      const ipToPstnRes = await listIpPstnRoutes("ip_to_pstn");
      const ipToPstnHit = getRouteList(ipToPstnRes).find((item) =>
        itemReferencesGroup(item, SIP_ROUTE_REF_FIELDS, gid),
      );
      if (ipToPstnHit) {
        return {
          inUse: true,
          reason: `IP→PSTN route${ipToPstnHit.id != null ? ` #${ipToPstnHit.id}` : ""}`,
        };
      }

      const ipToIpRes = await listIpPstnRoutes("ip_to_ip");
      const ipToIpHit = getRouteList(ipToIpRes).find((item) =>
        itemReferencesGroup(item, SIP_ROUTE_REF_FIELDS, gid),
      );
      if (ipToIpHit) {
        return {
          inUse: true,
          reason: `IP→IP route${ipToIpHit.id != null ? ` #${ipToIpHit.id}` : ""}`,
        };
      }

      for (const manipulationType of SIP_MANIPULATION_TYPES) {
        try {
          const manipRes = await listNumberManipulations(manipulationType);
          const manipHit = getRouteList(manipRes).find((item) =>
            itemReferencesGroup(item, SIP_MANIP_REF_FIELDS, gid),
          );
          if (manipHit) {
            return {
              inUse: true,
              reason: `number manipulation rule (${manipulationType.replaceAll("_", " ")})${manipHit.id != null ? ` #${manipHit.id}` : ""}`,
            };
          }
        } catch (e) {
          console.warn(
            `Number manipulation reference check failed for ${manipulationType}:`,
            e?.message,
          );
        }
      }

      return { inUse: false };
    } catch (e) {
      console.warn("Reference check failed:", e?.message);
      return { inUse: false };
    }
  };

  return (
    <>
      <SipTrunkGroupScrollbarStyles />
      <div
        className={SIP_TRUNK_GROUP_SCROLL_CLASS}
        style={sipTrunkGroupPageWrapStyle}
        data-native-scroll
      >
      {message.text && (
        <Alert
          severity={
            message.type === "error"
              ? "error"
              : message.type === "success"
                ? "success"
                : "info"
          }
          onClose={() => setMessage({ type: "", text: "" })}
          sx={sipTrunkGroupFixedAlertSx}
        >
          {message.text}
        </Alert>
      )}

      <div style={sipTrunkGroupPageInnerStyle}>
        <SipTrunkGroupBreadcrumb />

        <div style={sipTrunkGroupCardStyle}>
          <div style={sipTrunkGroupToolbarStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flex: 1,
                minWidth: 0,
              }}
            >
              {selected.length > 0 && (
                <span style={sipTrunkGroupSelectedBadgeStyle}>
                  {selected.length} {SIP_TRUNK_GROUP_SELECTED_SUFFIX}
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
                onClick={handleInverse}
                disabled={loading.delete || groups.length === 0}
                variant="cancel"
                style={sipTrunkGroupCancelBtnStyle}
              >
                {SIP_TRUNK_GROUP_BTN_INVERSE}
              </Btn>
              <Btn
                onClick={handleDelete}
                disabled={loading.delete || selected.length === 0}
                variant="cancel"
                style={sipTrunkGroupCancelBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : null}
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                {SIP_TRUNK_GROUP_BTN_DELETE}
              </Btn>
              <Btn
                onClick={handleClearAll}
                disabled={loading.delete || groups.length === 0}
                variant="cancel"
                style={sipTrunkGroupCancelBtnStyle}
              >
                {SIP_TRUNK_GROUP_BTN_CLEAR_ALL}
              </Btn>
              <Btn
                onClick={handleAddNew}
                disabled={loading.fetch}
                variant="primary"
                style={sipTrunkGroupPrimaryBtnStyle}
              >
                {SIP_TRUNK_GROUP_BTN_ADD_NEW}
              </Btn>
            </div>
          </div>

          {isInitialLoad ? (
            <SipTrunkGroupTableListLoading />
          ) : groups.length === 0 ? (
            <SipTrunkGroupTableListEmptyState
              message={SIP_TRUNK_GROUP_EMPTY_MESSAGE}
              onAddNew={handleAddNew}
              buttonLabel={SIP_TRUNK_GROUP_BTN_ADD_NEW}
            />
          ) : (
            <>
              <div
                className={SIP_TRUNK_GROUP_SCROLL_CLASS}
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
                    minWidth: 900,
                  }}
                >
                  <thead>
                    <tr>
                      <TH
                        style={{
                          width: 40,
                          padding: 0,
                          borderLeft: "none",
                        }}
                      >
                        <Checkbox
                          size="small"
                          checked={allPageSelected}
                          indeterminate={somePageSelected}
                          onChange={handleTogglePageSelection}
                          disabled={loading.delete}
                          sx={sipTrunkGroupTableCheckboxSx}
                        />
                      </TH>
                      {SIP_TRUNK_GROUP_TABLE_COLUMNS.filter(
                        (c) => c.key !== "check",
                      ).map((col, colIdx, cols) => (
                        <TH
                          key={col.key}
                          style={
                            colIdx === cols.length - 1
                              ? { borderRight: "none" }
                              : undefined
                          }
                        >
                          {col.label}
                        </TH>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pagedGroups.map((item, idx) => {
                      const realIdx = (page - 1) * itemsPerPage + idx;
                      const isSel = selected.includes(realIdx);
                      const rowBg = getSipTrunkGroupRowBg(isSel, idx);
                      const isLastRow = idx === pagedGroups.length - 1;
                      const lastRowCellStyle = isLastRow
                        ? { borderBottom: "none" }
                        : {};
                      const dataCellStyle = { fontWeight: 400 };

                      return (
                        <tr
                          key={realIdx}
                          style={{
                            background: rowBg,
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (!isSel)
                              e.currentTarget.style.background = "#f8fafc";
                          }}
                          onMouseLeave={(e) => {
                            if (!isSel)
                              e.currentTarget.style.background = rowBg;
                          }}
                        >
                          <td
                            style={getSipTrunkGroupTdStyle(rowBg, lastRowCellStyle, {
                              width: 40,
                              borderLeft: "none",
                            })}
                          >
                            <Checkbox
                              size="small"
                              checked={isSel}
                              onChange={() => handleSelectRow(realIdx)}
                              disabled={loading.delete}
                              sx={sipTrunkGroupTableCheckboxSx}
                            />
                          </td>
                          {SIP_TRUNK_GROUP_TABLE_COLUMNS.filter(
                            (c) => c.key !== "check",
                          ).map((col, colIdx, cols) => {
                            let value = item[col.key];
                            if (col.key === "index") value = realIdx + 1;
                            const isLastCol = colIdx === cols.length - 1;
                            return (
                              <td
                                key={col.key}
                                style={getSipTrunkGroupTdStyle(
                                  rowBg,
                                  lastRowCellStyle,
                                  {
                                    ...dataCellStyle,
                                    ...(isLastCol
                                      ? { borderRight: "none" }
                                      : {}),
                                  },
                                )}
                              >
                                {value !== undefined &&
                                value !== null &&
                                value !== "" ? (
                                  value
                                ) : (
                                  <span style={{ color: C.mutedText }}>—</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <SipTrunkGroupPagination
                page={page}
                totalPages={totalPages}
                recordCount={pagedGroups.length}
                recordLabel={SIP_TRUNK_GROUP_RECORD_LABEL}
                onPageChange={(nextPage) =>
                  setPage(Math.min(totalPages, Math.max(1, nextPage)))
                }
              />
            </>
          )}
        </div>
      </div>

      <Dialog
        open={showModal}
        onClose={() => !loading.save && setShowModal(false)}
        maxWidth={false}
        slotProps={{
          backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.5)" } },
        }}
        sx={SIP_TRUNK_GROUP_ADD_NEW_DIALOG_SX}
        PaperProps={{
          sx: SIP_TRUNK_GROUP_ADD_NEW_DIALOG_PAPER_SX,
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
          {editingRecordId != null
            ? SIP_TRUNK_GROUP_MODAL_EDIT_TITLE
            : SIP_TRUNK_GROUP_MODAL_ADD_TITLE}
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
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <SipTrunkGroupFieldLabel
                  tooltipKey="sip_trunk_id"
                  tooltips={SIP_TRUNK_GROUP_FIELD_TOOLTIPS}
                  style={{
                    fontSize: 13,
                    width: 120,
                    flexShrink: 0,
                    display: "inline-block",
                  }}
                >
                  {SIP_TRUNK_GROUP_LABEL_SIP_TRUNK_ID}
                </SipTrunkGroupFieldLabel>

                <div style={{ flex: 1 }}>
                  <Select
                    name="sip_trunk_id"
                    value={formData.sip_trunk_id}
                    onChange={handleInputChange}
                    size="small"
                    fullWidth
                    displayEmpty
                    variant="outlined"
                    sx={sipTrunkGroupModalSelectSx}
                  >
                    <MenuItem value="" disabled sx={{ fontSize: 13 }}>
                      {SIP_TRUNK_GROUP_PLACEHOLDER_SELECT_TRUNK}
                    </MenuItem>

                    {trunkIds.length === 0 ? (
                      <MenuItem value="" disabled sx={{ fontSize: 13 }}>
                        {SIP_TRUNK_GROUP_PLACEHOLDER_NO_OPTIONS}
                      </MenuItem>
                    ) : (
                      trunkIds.map((opt) => (
                        <MenuItem
                          key={opt.value}
                          value={opt.value}
                          sx={{ fontSize: 13 }}
                        >
                          {opt.label}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <SipTrunkGroupFieldLabel
                  tooltipKey="group_id"
                  tooltips={SIP_TRUNK_GROUP_FIELD_TOOLTIPS}
                  style={{
                    fontSize: 13,
                    width: 120,
                    flexShrink: 0,
                    display: "inline-block",
                  }}
                >
                  {SIP_TRUNK_GROUP_LABEL_GROUP_ID}
                </SipTrunkGroupFieldLabel>

                <div style={{ flex: 1 }}>
                  <TextField
                    type="text"
                    name="group_id"
                    value={formData.group_id}
                    onChange={handleInputChange}
                    size="small"
                    fullWidth
                    variant="outlined"
                    placeholder={SIP_TRUNK_GROUP_PLACEHOLDER_GROUP_ID}
                    sx={sipTrunkGroupModalTextFieldSx}
                  />
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn
            onClick={handleSave}
            variant="primary"
            disabled={loading.save}
            style={addNewModalFooterBtnStyle}
          >
            {loading.save ? (
              <CircularProgress
                size={14}
                style={{ color: "#fff", marginRight: 8 }}
              />
            ) : null}
            {loading.save ? SIP_TRUNK_GROUP_BTN_SAVING : SIP_TRUNK_GROUP_BTN_SAVE}
          </Btn>
          <Btn
            onClick={() => setShowModal(false)}
            variant="cancel"
            disabled={loading.save}
            style={sipTrunkGroupModalCancelBtnStyle}
          >
            {SIP_TRUNK_GROUP_BTN_CLOSE}
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
    </>
  );
};

export default SipTrunkGroup;
