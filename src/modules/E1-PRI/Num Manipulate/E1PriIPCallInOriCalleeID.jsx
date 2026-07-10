import React, { useState, useRef, useEffect } from "react";
import {
  IP_CALL_IN_ORICALLEEID_FIELDS,
  IP_CALL_IN_ORICALLEEID_TABLE_COLUMNS,
  IP_CALL_IN_ORICALLEEID_INITIAL_FORM,
  IP_CALL_IN_ORICALLEEID_FIELD_TOOLTIPS,
  NUM_MANIPULATE_IP_CALL_IN_ORICALLEEID_PAGE_BREADCRUMB_ROOT,
  NUM_MANIPULATE_IP_CALL_IN_ORICALLEEID_PAGE_BREADCRUMB_SECTION,
  NUM_MANIPULATE_IP_CALL_IN_ORICALLEEID_PAGE_TITLE,
  NUM_MANIPULATE_IP_CALL_IN_ORICALLEEID_EMPTY_MESSAGE,
  NUM_MANIPULATE_IP_CALL_IN_ORICALLEEID_MODAL_TITLE_ADD,
  NUM_MANIPULATE_IP_CALL_IN_ORICALLEEID_MODAL_TITLE_EDIT,
  NUM_MANIPULATE_IP_CALL_IN_ORICALLEEID_ADD_NEW_LABEL,
  NUM_MANIPULATE_IP_CALL_IN_ORICALLEEID_ADD_NEW_EMPTY_LABEL,
  NUM_MANIPULATE_IP_CALL_IN_ORICALLEEID_DELETE_LABEL,
  NUM_MANIPULATE_IP_CALL_IN_ORICALLEEID_CLEAR_ALL_LABEL,
  NUM_MANIPULATE_IP_CALL_IN_ORICALLEEID_SAVE_LABEL,
  NUM_MANIPULATE_IP_CALL_IN_ORICALLEEID_CLOSE_LABEL,
} from "../../../constants/E1PriIPCallInOriCalleeIDConstants";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Checkbox,
  Alert,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import {
  listNumberManipulations,
  createNumberManipulation,
  updateNumberManipulation,
  deleteNumberManipulation,
  listGroups,
} from "../../../api/apiService";

const E1_PRI_IP_CALL_IN_ORI_CALLEE_ID_ADD_NEW_DIALOG_MARGIN = 24;
const E1_PRI_IP_CALL_IN_ORI_CALLEE_ID_ADD_NEW_DIALOG_LAYOUT_OFFSET = 80;

const E1_PRI_IP_CALL_IN_ORI_CALLEE_ID_ADD_NEW_DIALOG_SX = {
  "& .MuiDialog-container": {
    alignItems: "center",
    justifyContent: "center",
  },
};

const E1_PRI_IP_CALL_IN_ORI_CALLEE_ID_ADD_NEW_DIALOG_PAPER_SX = {
  margin: E1_PRI_IP_CALL_IN_ORI_CALLEE_ID_ADD_NEW_DIALOG_MARGIN,
  maxHeight: `calc(100vh - ${E1_PRI_IP_CALL_IN_ORI_CALLEE_ID_ADD_NEW_DIALOG_LAYOUT_OFFSET}px - ${E1_PRI_IP_CALL_IN_ORI_CALLEE_ID_ADD_NEW_DIALOG_MARGIN * 2}px)`,
  display: "flex",
  flexDirection: "column",
  width: 600,
  maxWidth: "95vw",
  p: 0,
  borderRadius: "4px",
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};



const IP_CALL_IN_ORICALLEEID_COMPACT_MQ = "(max-width: 768px)";

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

const E1PriFieldRow = ({
  label,
  tooltipKey,
  tooltips,
  children,
  labelWidth = 170,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    }}
  >
    <E1PriFieldLabel
      tooltipKey={tooltipKey}
      tooltips={tooltips}
      style={{
        width: labelWidth,
        flexShrink: 0,
        textAlign: "left",
        display: "inline-block",
      }}
    >
      {label}
    </E1PriFieldLabel>
    <div style={{ width: "min(100%, 320px)" }}>{children}</div>
  </div>
);

const LOCAL_STORAGE_KEY = "ipCallInOriCalleeIdRules";

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
        borderRadius: 4,
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

const IP_CALL_IN_ORICALLEEID_CARD_RADIUS = 4;

const ipCallInOriCalleeIdPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const ipCallInOriCalleeIdPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const addHostFormPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 4,
  padding: 20,
};

const ipCallInOriCalleeIdCardStyle = {
  background: "#ffffff",
  borderRadius: IP_CALL_IN_ORICALLEEID_CARD_RADIUS,
  overflow: "hidden",
  border: `1px solid ${C.cardBorder}`,
  boxShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
};

const ipCallInOriCalleeIdToolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.divider}`,
  background: "#ffffff",
  flexWrap: "wrap",
  gap: 12,
  borderTopLeftRadius: IP_CALL_IN_ORICALLEEID_CARD_RADIUS,
  borderTopRightRadius: IP_CALL_IN_ORICALLEEID_CARD_RADIUS,
};

const ipCallInOriCalleeIdFooterStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.divider}`,
  borderBottomLeftRadius: IP_CALL_IN_ORICALLEEID_CARD_RADIUS,
  borderBottomRightRadius: IP_CALL_IN_ORICALLEEID_CARD_RADIUS,
  overflow: "hidden",
};

const ipCallInOriCalleeIdSelectedBadgeStyle = {
  background: "#eff6ff",
  color: C.accent,
  fontSize: 11,
  fontWeight: 700,
  padding: "5px 12px",
  borderRadius: 999,
  border: `1px solid ${C.accent}`,
};

const ipCallInOriCalleeIdCancelBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 4,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const ipCallInOriCalleeIdPrimaryBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 4,
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
  borderBottomLeftRadius: 4,
  borderBottomRightRadius: 4,
};

const addNewModalFooterBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 4,   
  minWidth: 100,
};

const ipCallInOriCalleeIdModalCancelBtnStyle = {
  ...addNewModalFooterBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",  
  borderRadius: 4,
};

const ipCallInOriCalleeIdPageBadgeStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: C.accent,
  background: "#e0f2fe",
  padding: "5px 14px",
  borderRadius: 4,  
  border: `1px solid ${C.cardBorder}`,
};

const IPCallInOriCalleeIdBreadcrumb = () => (
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
    <span>{NUM_MANIPULATE_IP_CALL_IN_ORICALLEEID_PAGE_BREADCRUMB_ROOT}</span>
    <span>&gt;</span>
    <span>{NUM_MANIPULATE_IP_CALL_IN_ORICALLEEID_PAGE_BREADCRUMB_SECTION}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>
      {NUM_MANIPULATE_IP_CALL_IN_ORICALLEEID_PAGE_TITLE}
    </span>
  </div>
);

const TableListLoading = () => (
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

const TableListEmptyState = ({
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
        style={{ height: 30, padding: "6px 14px", fontSize: 12, borderRadius: 4 }}
      >
        {buttonLabel}
      </Btn>
    ) : null}
  </div>
);

const IpCallInOriCalleeIdPagination = ({
  page,
  totalPages,
  recordCount,
  onPageChange,
}) => (
  <div style={ipCallInOriCalleeIdFooterStyle}>
    <span style={{ fontSize: 11, color: C.mutedText }}>
      Showing {recordCount} record
      {recordCount !== 1 ? "s" : ""} on page {page}
    </span>
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Btn
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        variant="outline"
        style={{ borderRadius: 4 }}
      >
        ← Prev
      </Btn>
      <span style={ipCallInOriCalleeIdPageBadgeStyle}>
        Page {page} of {totalPages}
      </span>
      <Btn
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        variant="outline"
        style={{ borderRadius: 4 }}
      >
        Next →
      </Btn>
    </div>
  </div>
);

// ── Native modal field UI ──
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

const inputStyle = {
  width: "100%",
  height: 32,
  padding: "0 10px",
  fontSize: 13,
  lineHeight: 1.35,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 4,
  outline: "none",
  backgroundColor: "#fff",
  color: C.valueText,
  boxSizing: "border-box",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const selectStyle = {
  ...inputStyle,
  padding: "0 28px 0 10px",
  appearance: "auto",
  cursor: "pointer",
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

const ipCallInOriCalleeIdTableCheckboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const IPCallInOriCalleeID = () => {
  const isCompact = useMediaQuery(IP_CALL_IN_ORICALLEEID_COMPACT_MQ);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(IP_CALL_IN_ORICALLEEID_INITIAL_FORM);
  const [rules, setRules] = useState([]);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(rules.length / itemsPerPage));
  const pagedRules = rules.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );
  const [sipTrunkGroups, setSipTrunkGroups] = useState([]);
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false,
  });
  const [editIndex, setEditIndex] = useState(null);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  // Replace default alert with toast
  const alert = (msg) => {
    const isErr =
      /error|failed|required|please/i.test(msg) && !/successfully/i.test(msg);
    showToast(msg, isErr ? "error" : "success");
  };

  const tableScrollRef = useRef(null);
  const [scrollState, setScrollState] = useState({
    left: 0,
    width: 0,
    scrollWidth: 0,
  });
  const [showCustomScrollbar, setShowCustomScrollbar] = useState(false);

  // Fetch SIP Trunk Groups for Call Initiator dropdown
  const fetchSipTrunkGroups = async () => {
    try {
      const response = await listGroups();
      console.log("SIP Trunk Groups API Response:", response);
      if (response.response && response.message) {
        const sipGroups = Array.isArray(response.message)
          ? response.message
          : [response.message];
        console.log("SIP Groups data:", sipGroups);
        setSipTrunkGroups(sipGroups);

        // Set default value for new forms if no groups are loaded yet
        if (sipGroups.length > 0 && formData.call_initiator === "") {
          const firstGroupId =
            sipGroups[0].group_id || sipGroups[0].id || sipGroups[0];
          setFormData((prev) => ({ ...prev, call_initiator: firstGroupId }));
        }
      } else {
        console.log("No SIP groups data found");
        setSipTrunkGroups([]);
      }
    } catch (error) {
      console.error("Error fetching SIP trunk groups:", error);
      if (error.message === "Network Error") {
        alert("Network error. Please check your connection.");
      } else {
        alert(error.message || "Failed to load SIP trunk groups");
      }
      setSipTrunkGroups([]);
    }
  };

  // Fetch Number Manipulations
  const fetchNumberManipulations = async () => {
    setLoading((prev) => ({ ...prev, fetch: true }));
    try {
      console.log("Fetching number manipulations...");
      const response = await listNumberManipulations("ip_in_oricalleeid");
      console.log("Fetch response:", response);

      if (response.response && response.message) {
        console.log("Number manipulations data:", response.message);
        setRules(response.message);
      } else {
        console.log("No data in response, setting empty array");
        setRules([]);
      }
    } catch (error) {
      console.error("Error fetching number manipulations:", error);
      if (error.message === "Network Error") {
        alert("Network error. Please check your connection.");
      } else if (error.response?.status === 500) {
        alert(
          "Server error. The number manipulations endpoint may have issues.",
        );
      } else {
        alert(error.message || "Failed to load number manipulations");
      }
      setRules([]);
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
    }
  };

  const handleOpenModal = (item = null, index = -1) => {
    if (item) {
      // Editing existing item
      setFormData({
        ...item,
        with_original_calleeid: item.with_original_calleeid || "No",
        stripped_digits_from_left:
          item.stripped_digits_from_left === "" ||
          item.stripped_digits_from_left == null
            ? "0"
            : String(item.stripped_digits_from_left),
        stripped_digits_from_right:
          item.stripped_digits_from_right === "" ||
          item.stripped_digits_from_right == null
            ? "0"
            : String(item.stripped_digits_from_right),
        reserved_digits_from_right:
          item.reserved_digits_from_right === "" ||
          item.reserved_digits_from_right == null
            ? "0"
            : String(item.reserved_digits_from_right),
      });
      setEditIndex(item.id);
    } else {
      // Adding new item - set default call_initiator if available
      const defaultForm = { ...IP_CALL_IN_ORICALLEEID_INITIAL_FORM };
      if (sipTrunkGroups.length > 0) {
        const firstGroupId =
          sipTrunkGroups[0].group_id ||
          sipTrunkGroups[0].id ||
          sipTrunkGroups[0];
        defaultForm.call_initiator = firstGroupId;
      }
      setFormData(defaultForm);
      setEditIndex(null);
    }
    setIsModalOpen(true);
  };
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSave = async () => {
    // Validation: required only Call Initiator, CallerID Prefix, CalleeID Prefix
    if (!formData.call_initiator) {
      alert("Call Initiator is required.");
      return;
    }
    if (!formData.callerid_prefix) {
      alert("CallerID Prefix is required.");
      return;
    }
    if (!formData.calleeid_prefix) {
      alert("CalleeID Prefix is required.");
      return;
    }

    // Normalize optional numeric fields to '0' when empty
    const normalized = {
      ...formData,
      with_original_calleeid: formData.with_original_calleeid || "No",
      stripped_digits_from_left:
        formData.stripped_digits_from_left === "" ||
        formData.stripped_digits_from_left == null
          ? "0"
          : String(formData.stripped_digits_from_left),
      stripped_digits_from_right:
        formData.stripped_digits_from_right === "" ||
        formData.stripped_digits_from_right == null
          ? "0"
          : String(formData.stripped_digits_from_right),
      reserved_digits_from_right:
        formData.reserved_digits_from_right === "" ||
        formData.reserved_digits_from_right == null
          ? "0"
          : String(formData.reserved_digits_from_right),
    };

    setLoading((prev) => ({ ...prev, save: true }));
    try {
      let response;
      if (editIndex !== null) {
        // Update existing - ensure we have the ID
        const updateData = {
          id: editIndex,
          call_initiator: normalized.call_initiator,
          callerid_prefix: normalized.callerid_prefix,
          calleeid_prefix: normalized.calleeid_prefix,
          with_original_calleeid: normalized.with_original_calleeid,
          stripped_digits_from_left: normalized.stripped_digits_from_left,
          stripped_digits_from_right: normalized.stripped_digits_from_right,
          reserved_digits_from_right: normalized.reserved_digits_from_right,
          prefix_to_add: normalized.prefix_to_add,
          suffix_to_add: normalized.suffix_to_add,
          description: normalized.description,
        };
        console.log("Update request data:", updateData);
        response = await updateNumberManipulation(
          updateData,
          "ip_in_oricalleeid",
        );
        console.log("Update response:", response);
        if (response.response) {
          alert(
            response.message || "Number manipulation updated successfully!",
          );

          // Try to reload data, but don't fail if it doesn't work
          try {
            await new Promise((resolve) => setTimeout(resolve, 500)); // Allow backend to process
            console.log("Attempting to reload after successful update...");
            await fetchNumberManipulations();
            console.log("Reload successful after update");
          } catch (reloadError) {
            console.log("Updating item in local state as fallback");
            // Update the item in local state
            setRules((prev) =>
              prev.map((rule, idx) =>
                rule.id === editIndex ? { ...rule, ...normalized } : rule,
              ),
            );
          }
        } else {
          alert("Failed to update number manipulation");
        }
      } else {
        // Create new
        console.log("Create request data:", normalized);
        response = await createNumberManipulation(
          normalized,
          "ip_in_oricalleeid",
        );
        console.log("Create response:", response);
        if (response.response) {
          alert(
            response.message || "Number manipulation created successfully!",
          );

          // Try to reload data, but don't fail if it doesn't work
          try {
            await new Promise((resolve) => setTimeout(resolve, 500)); // Allow backend to process
            console.log("Attempting to reload after successful creation...");
            await fetchNumberManipulations();
            console.log("Reload successful after creation");
          } catch (reloadError) {
            console.log("Adding item to local state as fallback");
            // Add the new item to local state
            const newItem = {
              ...normalized,
              id: Date.now(), // Temporary ID for local state
              manipulation_type: "ip_in_oricalleeid",
            };
            setRules((prev) => [...prev, newItem]);
          }
        } else {
          alert("Failed to create number manipulation");
        }
      }

      handleCloseModal();
    } catch (error) {
      console.error("Error saving number manipulation:", error);
      if (error.message === "Network Error") {
        alert("Network error. Please check your connection.");
      } else {
        alert(error.message || "Failed to save number manipulation");
      }
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePageChange = (newPage) =>
    setPage(Math.max(1, Math.min(totalPages, newPage)));

  const handleSelectRow = (idx) => {
    const realIdx = (page - 1) * itemsPerPage + idx;
    setSelected((sel) =>
      sel.includes(realIdx)
        ? sel.filter((i) => i !== realIdx)
        : [...sel, realIdx],
    );
  };
  const handleCheckAll = () => setSelected(rules.map((_, idx) => idx));
  const handleUncheckAll = () => setSelected([]);
  const handleInverse = () =>
    setSelected(
      rules
        .map((_, idx) => (!selected.includes(idx) ? idx : null))
        .filter((i) => i !== null),
    );
  const handleDelete = async () => {
    if (selected.length === 0) {
      alert("Please select items to delete");
      return;
    }

    // Show browser confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selected.length} selected item(s)?`,
    );
    if (!confirmed) return;

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      console.log("Deleting selected items:", selected);
      const deletePromises = selected.map(async (idx) => {
        const item = rules[idx];
        if (item && item.id) {
          console.log("Deleting item with ID:", item.id);
          return await deleteNumberManipulation(item.id);
        }
        return null;
      });

      const results = await Promise.allSettled(deletePromises);
      const successCount = results.filter(
        (result) =>
          result.status === "fulfilled" &&
          result.value &&
          result.value.response,
      ).length;
      const failCount = results.length - successCount;

      console.log("Delete results:", results);

      if (successCount > 0) {
        alert(`${successCount} item(s) deleted successfully`);

        // Try to reload data, but don't fail if it doesn't work
        try {
          await fetchNumberManipulations();
        } catch (reloadError) {
          console.warn(
            "Failed to reload after delete, removing from local state:",
            reloadError,
          );
          // Remove deleted items from local state as fallback
          const selectedItems = selected.map((idx) => rules[idx]);
          const selectedIds = selectedItems.map((item) => item.id);
          setRules((prev) =>
            prev.filter((item) => !selectedIds.includes(item.id)),
          );
        }
        setSelected([]); // Clear selection
      }

      if (failCount > 0) {
        alert(`Failed to delete ${failCount} item(s)`);
      }
    } catch (error) {
      console.error("Error deleting selected items:", error);
      if (error.message === "Network Error") {
        alert("Network error. Please check your connection.");
      } else {
        alert(error.message || "Failed to delete selected items");
      }
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleClearAll = async () => {
    if (rules.length === 0) {
      alert("No data to clear");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to delete ALL number manipulations? This action cannot be undone.",
      )
    ) {
      return;
    }

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      console.log(
        "Clearing all number manipulations:",
        rules.map((item) => item.id),
      );
      const deletePromises = rules.map(async (item) => {
        if (item && item.id) {
          console.log("Deleting item:", item.id);
          return await deleteNumberManipulation(item.id);
        }
        return null;
      });

      const results = await Promise.allSettled(deletePromises);
      const successCount = results.filter(
        (result) =>
          result.status === "fulfilled" &&
          result.value &&
          result.value.response,
      ).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        alert(`All ${successCount} item(s) deleted successfully`);

        // Try to reload data, but don't fail if it doesn't work
        try {
          await fetchNumberManipulations();
        } catch (reloadError) {
          console.warn(
            "Failed to reload after clear all, clearing local state:",
            reloadError,
          );
          // Clear all items from local state as fallback
          setRules([]);
        }
        setSelected([]);
        setPage(1);
      }

      if (failCount > 0) {
        alert(`Failed to delete ${failCount} item(s)`);
      }
    } catch (error) {
      console.error("Error clearing all items:", error);
      if (error.message === "Network Error") {
        alert("Network error. Please check your connection.");
      } else {
        alert(error.message || "Failed to clear all items");
      }
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleTableScroll = (e) =>
    setScrollState({
      left: e.target.scrollLeft,
      width: e.target.clientWidth,
      scrollWidth: e.target.scrollWidth,
    });
  const handleScrollbarDrag = (e) => {
    const track = e.target.parentNode;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    if (tableScrollRef.current)
      tableScrollRef.current.scrollLeft =
        (scrollState.scrollWidth - scrollState.width) * percent;
  };
  const handleArrowClick = (dir) => {
    if (tableScrollRef.current)
      tableScrollRef.current.scrollLeft += dir === "left" ? -100 : 100;
  };

  const thumbWidth =
    scrollState.width && scrollState.scrollWidth
      ? Math.max(
          40,
          (scrollState.width / scrollState.scrollWidth) *
            (scrollState.width - 8),
        )
      : 40;
  const thumbLeft =
    scrollState.width &&
    scrollState.scrollWidth &&
    scrollState.scrollWidth > scrollState.width
      ? (scrollState.left / (scrollState.scrollWidth - scrollState.width)) *
        (scrollState.width - thumbWidth - 16)
      : 0;

  // Load data on component mount
  useEffect(() => {
    fetchNumberManipulations();
    fetchSipTrunkGroups();
  }, []);

  // Refresh function
  const handleRefresh = async () => {
    await fetchNumberManipulations();
  };

  useEffect(() => {
    const update = () => {
      if (tableScrollRef.current) {
        const el = tableScrollRef.current;
        setScrollState({
          left: el.scrollLeft,
          width: el.clientWidth,
          scrollWidth: el.scrollWidth,
        });
        setShowCustomScrollbar(el.scrollWidth > el.clientWidth);
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [rules, page]);

  // Get updated fields with SIP trunk groups
  const getUpdatedFields = () => {
    return IP_CALL_IN_ORICALLEEID_FIELDS.map((field) => {
      if (field.name === "call_initiator") {
        return {
          ...field,
          options: sipTrunkGroups.map((group) => ({
            value: group.group_id || group.id || group,
            label: `SIP Trunk Group [${group.group_id || group.id || group}]`,
          })),
        };
      }
      return field;
    });
  };

  return (
    <div
      style={{
        ...ipCallInOriCalleeIdPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={ipCallInOriCalleeIdPageInnerStyle}>
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

        <IPCallInOriCalleeIdBreadcrumb />

        <div style={ipCallInOriCalleeIdCardStyle}>
          <div
            style={{
              ...ipCallInOriCalleeIdToolbarStyle,
              ...(isCompact
                ? { flexDirection: "column", alignItems: "stretch", gap: 10 }
                : {}),
            }}
          >
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
                <span style={ipCallInOriCalleeIdSelectedBadgeStyle}>
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
                disabled={loading.fetch || loading.delete || rules.length === 0}
                style={ipCallInOriCalleeIdCancelBtnStyle}
              >
                Inverse
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleDelete}
                disabled={loading.delete || selected.length === 0}
                style={ipCallInOriCalleeIdCancelBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : null}
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                {NUM_MANIPULATE_IP_CALL_IN_ORICALLEEID_DELETE_LABEL}
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleClearAll}
                disabled={loading.fetch || loading.delete || rules.length === 0}
                style={ipCallInOriCalleeIdCancelBtnStyle}
              >
                {NUM_MANIPULATE_IP_CALL_IN_ORICALLEEID_CLEAR_ALL_LABEL}
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleRefresh}
                disabled={loading.fetch}
                style={ipCallInOriCalleeIdCancelBtnStyle}
              >
                {loading.fetch ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : null}
                Refresh
              </Btn>
              <Btn
                variant="primary"
                onClick={() => handleOpenModal()}
                disabled={loading.fetch || loading.save}
                style={ipCallInOriCalleeIdPrimaryBtnStyle}
              >
                {NUM_MANIPULATE_IP_CALL_IN_ORICALLEEID_ADD_NEW_LABEL}
              </Btn>
            </div>
          </div>

          {loading.fetch ? (
            <TableListLoading />
          ) : rules.length === 0 ? (
            <TableListEmptyState
              message={NUM_MANIPULATE_IP_CALL_IN_ORICALLEEID_EMPTY_MESSAGE}
              onAddNew={() => handleOpenModal()}
              buttonLabel={NUM_MANIPULATE_IP_CALL_IN_ORICALLEEID_ADD_NEW_EMPTY_LABEL}
            />
          ) : (
            <>
              <div
                ref={tableScrollRef}
                onScroll={handleTableScroll}
                style={{
                  overflowX: "auto",
                  overflowY: "auto",
                  flex: 1,
                  maxHeight: 460,
                }}
              >
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
                      <TH
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
                            rules.length > 0 &&
                            selected.length === rules.length
                          }
                          indeterminate={
                            selected.length > 0 &&
                            selected.length < rules.length
                          }
                          onChange={(e) => {
                            if (e.target.checked) handleCheckAll();
                            else handleUncheckAll();
                          }}
                          sx={ipCallInOriCalleeIdTableCheckboxSx}
                        />
                      </TH>
                      <TH
                        style={{
                          width: 36,
                          position: "sticky",
                          top: 0,
                          zIndex: 10,
                        }}
                      >
                        ID
                      </TH>
                      <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                        Call Initiator
                      </TH>
                      <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                        CallerID Prefix
                      </TH>
                      <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                        CalleeID Prefix
                      </TH>
                      <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                        Stripped Digits from Right
                      </TH>
                      <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                        Reserved Digits from Right
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
                    {pagedRules.map((item, idx) => {
                      const realIdx = (page - 1) * itemsPerPage + idx;
                      const isSelected = selected.includes(realIdx);
                      const isLastRow = idx === pagedRules.length - 1;
                      const rowBg = isSelected
                        ? "#eff6ff"
                        : idx % 2 === 1
                          ? "#f8fafc"
                          : "#ffffff";
                      const lastRowCellStyle = isLastRow
                        ? { borderBottom: "none" }
                        : {};

                      return (
                        <tr
                          key={item.id || realIdx}
                          style={{
                            background: rowBg,
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected)
                              e.currentTarget.style.background = "#f8fafc";
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected)
                              e.currentTarget.style.background = rowBg;
                          }}
                        >
                          <td
                            style={{
                              ...tdStyle,
                              background: rowBg,
                              width: 36,
                              borderLeft: "none",
                              ...lastRowCellStyle,
                            }}
                          >
                            <Checkbox
                              size="small"
                              checked={isSelected}
                              onChange={() => handleSelectRow(idx)}
                              disabled={loading.delete}
                              sx={ipCallInOriCalleeIdTableCheckboxSx}
                            />
                          </td>
                          <td
                            style={{
                              ...tdStyle,
                              background: rowBg,
                              fontWeight: 400,
                              ...lastRowCellStyle,
                            }}
                          >
                            {realIdx + 1}
                          </td>
                          <td
                            style={{
                              ...tdStyle,
                              background: rowBg,
                              fontWeight: 400,
                              ...lastRowCellStyle,
                            }}
                          >
                            SIP Trunk Group [{item.call_initiator}]
                          </td>
                          <td
                            style={{
                              ...tdStyle,
                              background: rowBg,
                              fontWeight: 400,
                              ...lastRowCellStyle,
                            }}
                          >
                            {item.callerid_prefix}
                          </td>
                          <td
                            style={{
                              ...tdStyle,
                              background: rowBg,
                              fontWeight: 400,
                              ...lastRowCellStyle,
                            }}
                          >
                            {item.calleeid_prefix}
                          </td>
                          <td
                            style={{
                              ...tdStyle,
                              background: rowBg,
                              fontWeight: 400,
                              ...lastRowCellStyle,
                            }}
                          >
                            {item.stripped_digits_from_right}
                          </td>
                          <td
                            style={{
                              ...tdStyle,
                              background: rowBg,
                              fontWeight: 400,
                              ...lastRowCellStyle,
                            }}
                          >
                            {item.reserved_digits_from_right}
                          </td>
                          <td
                            style={{
                              ...tdStyle,
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
                                  cursor: loading.delete
                                    ? "not-allowed"
                                    : "pointer",
                                  color: "#2563eb",
                                  fontSize: 22,
                                  opacity: loading.delete ? 0.4 : 0.7,
                                  transition: "opacity 0.15s ease",
                                }}
                                onClick={() => {
                                  if (!loading.delete)
                                    handleOpenModal(item, realIdx);
                                }}
                                onMouseEnter={(e) => {
                                  if (!loading.delete)
                                    e.currentTarget.style.opacity = "1";
                                }}
                                onMouseLeave={(e) => {
                                  if (!loading.delete)
                                    e.currentTarget.style.opacity = "0.7";
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <IpCallInOriCalleeIdPagination
                page={page}
                totalPages={totalPages}
                recordCount={pagedRules.length}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>

      <Dialog
        open={isModalOpen}
        onClose={() => {
          if (loading.save) return;
          handleCloseModal();
        }}
        maxWidth={false}
        sx={E1_PRI_IP_CALL_IN_ORI_CALLEE_ID_ADD_NEW_DIALOG_SX}
        PaperProps={{
          sx: E1_PRI_IP_CALL_IN_ORI_CALLEE_ID_ADD_NEW_DIALOG_PAPER_SX,
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
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
            flexShrink: 0,
          }}
        >
          {editIndex !== null
            ? NUM_MANIPULATE_IP_CALL_IN_ORICALLEEID_MODAL_TITLE_EDIT
            : NUM_MANIPULATE_IP_CALL_IN_ORICALLEEID_MODAL_TITLE_ADD}
        </DialogTitle>
        <DialogContent
          style={{
            padding: "24px",
            backgroundColor: "#ffffff",
            overflowY: "auto",
            flex: "1 1 auto",
          }}
        >
          <div style={addHostFormPanelStyle}>
            {getUpdatedFields().map((field) => (
              <E1PriFieldRow
                key={field.name}
                label={field.label}
                tooltipKey={field.name}
                tooltips={IP_CALL_IN_ORICALLEEID_FIELD_TOOLTIPS}
              >
                {field.type === "select" ? (
                  <select
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleInputChange}
                    style={selectStyle}
                    {...inputInteraction}
                  >
                    {field.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type || "text"}
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleInputChange}
                    style={inputStyle}
                    {...inputInteraction}
                  />
                )}
              </E1PriFieldRow>
            ))}
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn
            variant="primary"
            onClick={handleSave}
            disabled={loading.save}
            style={addNewModalFooterBtnStyle}
          >
            {loading.save ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              NUM_MANIPULATE_IP_CALL_IN_ORICALLEEID_SAVE_LABEL
            )}
          </Btn>
          <Btn
            variant="cancel"
            onClick={handleCloseModal}
            disabled={loading.save}
            style={ipCallInOriCalleeIdModalCancelBtnStyle}
          >
            {NUM_MANIPULATE_IP_CALL_IN_ORICALLEEID_CLOSE_LABEL}
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default IPCallInOriCalleeID;
