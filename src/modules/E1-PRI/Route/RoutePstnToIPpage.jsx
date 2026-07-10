import React, { useState, useEffect } from "react";
import {
  ROUTE_PSTN_IP_FIELDS,
  ROUTE_PSTN_IP_INITIAL_FORM,
  ROUTE_PSTN_IP_TABLE_COLUMNS,
  ROUTE_PSTN_IP_FIELD_TOOLTIPS,
  ROUTE_PSTN_IP_PAGE_BREADCRUMB_ROOT,
  ROUTE_PSTN_IP_PAGE_BREADCRUMB_SECTION,
  ROUTE_PSTN_IP_PAGE_TITLE,
  ROUTE_PSTN_IP_EMPTY_MESSAGE,
  ROUTE_PSTN_IP_MODAL_TITLE_ADD,
  ROUTE_PSTN_IP_MODAL_TITLE_EDIT,
  ROUTE_PSTN_IP_ADD_NEW_LABEL,
  ROUTE_PSTN_IP_ADD_NEW_EMPTY_LABEL,
  ROUTE_PSTN_IP_SAVE_LABEL,
  ROUTE_PSTN_IP_CLOSE_LABEL,
} from "../../../constants/RoutePstnToIPConstants";
import {
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  listIpPstnRoutes,
  createIpPstnRoute,
  updateIpPstnRoute,
  deleteIpPstnRoute,
  listGroups,
  listPstnGroups,
} from "../../../api/apiService";

const ROUTE_PSTN_TO_IP_ADD_NEW_DIALOG_MARGIN = 24;
const ROUTE_PSTN_TO_IP_ADD_NEW_DIALOG_LAYOUT_OFFSET = 80;

const ROUTE_PSTN_TO_IP_ADD_NEW_DIALOG_SX = {
  "& .MuiDialog-container": {
    alignItems: "center",
    justifyContent: "center",
  },
};

const ROUTE_PSTN_TO_IP_ADD_NEW_DIALOG_PAPER_SX = {
  margin: ROUTE_PSTN_TO_IP_ADD_NEW_DIALOG_MARGIN,
  maxHeight: `calc(100vh - ${ROUTE_PSTN_TO_IP_ADD_NEW_DIALOG_LAYOUT_OFFSET}px - ${ROUTE_PSTN_TO_IP_ADD_NEW_DIALOG_MARGIN * 2}px)`,
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

// ── Local page UI (inlined from pbxSharedUi) ──
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


const ROUTE_PSTN_TO_IP_CARD_RADIUS = 4;

const routePstnToIpPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const routePstnToIpPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

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

const addHostFormPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 4,
  padding: 20,
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

const routePstnToIpCardStyle = {
  background: "#ffffff",
  borderRadius: ROUTE_PSTN_TO_IP_CARD_RADIUS,
  overflow: "hidden",
  border: `1px solid ${C.cardBorder}`,
  boxShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
};

const routePstnToIpToolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.divider}`,
  background: "#ffffff",
  flexWrap: "wrap",
  gap: 12,
  borderTopLeftRadius: ROUTE_PSTN_TO_IP_CARD_RADIUS,
  borderTopRightRadius: ROUTE_PSTN_TO_IP_CARD_RADIUS,
};

const routePstnToIpPaginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.divider}`,
  borderBottomLeftRadius: ROUTE_PSTN_TO_IP_CARD_RADIUS,
  borderBottomRightRadius: ROUTE_PSTN_TO_IP_CARD_RADIUS,
  overflow: "hidden",
};

const routePstnToIpSelectedBadgeStyle = {
  background: "#eff6ff",
  color: C.accent,
  fontSize: 11,
  fontWeight: 700,
  padding: "5px 12px",
  borderRadius: 999,
  border: `1px solid ${C.accent}`,
};

const routePstnToIpCancelBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 4,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const routePstnToIpPrimaryBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 4,
};

const routePstnToIpPageBadgeStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: C.accent,
  background: "#e0f2fe",
  padding: "5px 14px",
  borderRadius: 4,
  border: `1px solid ${C.cardBorder}`,
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

const routePstnToIpModalCancelBtnStyle = {
  ...addNewModalFooterBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const RoutePstnToIpBreadcrumb = () => (
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
    <span>{ROUTE_PSTN_IP_PAGE_BREADCRUMB_ROOT}</span>
    <span>&gt;</span>
    <span>{ROUTE_PSTN_IP_PAGE_BREADCRUMB_SECTION}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>
      {ROUTE_PSTN_IP_PAGE_TITLE}
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
  buttonLabel = "+ Add New Rule",
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
        style={{ height: 30, padding: "6px 14px", fontSize: 12, borderRadius: 4 }}
    >
      {buttonLabel}
    </Btn>
  </div>
);

const RoutePstnToIpPagination = ({
  page,
  totalPages,
  recordCount,
  onPageChange,
}) => (
  <div style={routePstnToIpPaginationStyle}>
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
      <span style={routePstnToIpPageBadgeStyle}>
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

const routePstnToIpTableCheckboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const RoutePstnToIPPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(ROUTE_PSTN_IP_INITIAL_FORM);
  const [rules, setRules] = useState([]);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [sipTrunkGroups, setSipTrunkGroups] = useState([]);
  const [pcmTrunkGroups, setPcmTrunkGroups] = useState([]);
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false,
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [tableMinWidth, setTableMinWidth] = useState("100%");
  const itemsPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(rules.length / itemsPerPage));
  const pagedRules = rules.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  // Message handling
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  // Fetch SIP Trunk Groups for Call Destination dropdown
  const fetchSipTrunkGroups = async () => {
    try {
      const response = await listGroups();
      if (response.response && response.message) {
        const sipGroups = Array.isArray(response.message)
          ? response.message
          : [response.message];
        setSipTrunkGroups(sipGroups);
      } else {
        setSipTrunkGroups([]);
      }
    } catch (error) {
      console.error("Error fetching SIP trunk groups:", error);
      setSipTrunkGroups([]);
    }
  };

  // Fetch PCM Trunk Groups for Call Initiator dropdown
  const fetchPcmTrunkGroups = async () => {
    try {
      const response = await listPstnGroups();
      if (response.response && response.message) {
        const pcmGroups = Array.isArray(response.message)
          ? response.message
          : [response.message];
        setPcmTrunkGroups(pcmGroups);
      } else {
        setPcmTrunkGroups([]);
      }
    } catch (error) {
      console.error("Error fetching PCM trunk groups:", error);
      setPcmTrunkGroups([]);
    }
  };

  // Fetch PSTN IP Routes
  const fetchPstnIpRoutes = async () => {
    setLoading((prev) => ({ ...prev, fetch: true }));
    try {
      const response = await listIpPstnRoutes("pstn_to_ip");
      if (response.response && response.message) {
        const mappedRules = response.message.map((rule) => ({
          ...rule,
          callInitiator: rule.call_source,
          callerIdPrefix: rule.caller_id_prefix,
          calleeIdPrefix: rule.callee_id_prefix,
          callDestination: rule.call_destination,
          numberFilter: rule.number_filter,
        }));
        setRules(mappedRules);
      } else {
        setRules([]);
      }
    } catch (error) {
      console.error("Error fetching PSTN IP routes:", error);
      showMessage("error", error.message || "Failed to load PSTN IP routes");
      setRules([]);
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadAllData = async () => {
      await Promise.allSettled([
        fetchPstnIpRoutes(),
        fetchSipTrunkGroups(),
        fetchPcmTrunkGroups(),
      ]);
    };
    loadAllData();
  }, []);

  useEffect(() => {
    const updateTableWidthForZoom = () => {
      const scale = window.visualViewport?.scale || 1;
      setTableMinWidth(scale >= 1.15 ? 1600 : "100%");
    };

    updateTableWidthForZoom();
    window.addEventListener("resize", updateTableWidthForZoom);
    window.visualViewport?.addEventListener("resize", updateTableWidthForZoom);

    return () => {
      window.removeEventListener("resize", updateTableWidthForZoom);
      window.visualViewport?.removeEventListener(
        "resize",
        updateTableWidthForZoom,
      );
    };
  }, []);

  const handleOpenModal = (item = null, index = -1) => {
    if (item) {
      const formData = {
        callInitiator: item.call_source,
        callerIdPrefix: item.caller_id_prefix,
        calleeIdPrefix: item.callee_id_prefix,
        callDestination: String(item.call_destination),
        numberFilter: item.number_filter,
        description: item.description,
        originalIndex: index,
      };
      setFormData(formData);
    } else {
      const defaultFormData = { ...ROUTE_PSTN_IP_INITIAL_FORM };
      if (pcmTrunkGroups && pcmTrunkGroups.length > 0) {
        const firstPcmGroup = pcmTrunkGroups[0];
        defaultFormData.callInitiator = String(
          firstPcmGroup.group_id || firstPcmGroup.id || firstPcmGroup,
        );
      }
      if (sipTrunkGroups && sipTrunkGroups.length > 0) {
        const firstSipGroup = sipTrunkGroups[0];
        defaultFormData.callDestination = String(
          firstSipGroup.group_id || firstSipGroup.id || "",
        );
      }
      setFormData(defaultFormData);
    }
    setIsModalOpen(true);
  };
  const handleCloseModal = () => setIsModalOpen(false);

  const validatePrefix = (prefix) => {
    const validPrefixPattern = /^[\d*]+$/;
    return validPrefixPattern.test(prefix);
  };

  const handleSave = async () => {
    if (!validatePrefix(formData.callerIdPrefix)) {
      alert(
        "Invalid CallerID Prefix! Only numbers (0-9) and asterisks (*) are allowed.",
      );
      return;
    }
    if (!validatePrefix(formData.calleeIdPrefix)) {
      alert(
        "Invalid CalleeID Prefix! Only numbers (0-9) and asterisks (*) are allowed.",
      );
      return;
    }

    setLoading((prev) => ({ ...prev, save: true }));
    try {
      const { originalIndex, ...formDataToSave } = formData;
      const apiData = {
        call_source: formDataToSave.callInitiator,
        caller_id_prefix: formDataToSave.callerIdPrefix,
        callee_id_prefix: formDataToSave.calleeIdPrefix,
        call_destination: formDataToSave.callDestination,
        number_filter: formDataToSave.numberFilter,
        description: formDataToSave.description,
      };

      if (originalIndex !== undefined && originalIndex > -1) {
        const response = await updateIpPstnRoute(
          rules[originalIndex].id,
          apiData,
          "pstn_to_ip",
        );
        if (response?.response) {
          showMessage("success", "Route updated successfully!");
          handleCloseModal();
          await fetchPstnIpRoutes();
        } else {
          showMessage("error", response?.message || "Failed to update route");
        }
      } else {
        const response = await createIpPstnRoute(apiData, "pstn_to_ip");
        if (response?.response) {
          showMessage("success", "Route created successfully!");
          handleCloseModal();
          await fetchPstnIpRoutes();
        } else {
          showMessage("error", response?.message || "Failed to create route");
        }
      }
    } catch (error) {
      console.error("Error saving route:", error);
      showMessage("error", error.message || "Failed to save route");
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
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

  const formatDisplayValue = (key, value, rowIndex = 0) => {
    if (key === "index") {
      return (page - 1) * itemsPerPage + rowIndex + 1;
    }
    if (value === undefined || value === null || value === "") return "--";

    switch (key) {
      case "callInitiator":
    
        return `PCM Trunk Group [${String(value)}]`;
      case "callDestination":
        return `SIP Trunk Group [${String(value)}]`;
      default:
        return String(value);
    }
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
      showMessage("warning", "Please select items to delete");
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selected.length} selected item(s)?`,
    );
    if (!confirmed) return;

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      for (const idx of selected) {
        const rule = rules[idx];
        if (rule && rule.id) await deleteIpPstnRoute(rule.id, "pstn_to_ip");
      }
      await fetchPstnIpRoutes();
      setSelected([]);
      showMessage("success", "Selected routes deleted successfully!");
    } catch (error) {
      showMessage("error", "Failed to delete routes");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };
  const handleClearAll = async () => {
    if (rules.length === 0) {
      showMessage("warning", "No routes to clear");
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to delete ALL ${rules.length} routes? This action cannot be undone.`,
    );
    if (!confirmed) return;

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      for (const rule of rules) {
        if (rule && rule.id) await deleteIpPstnRoute(rule.id, "pstn_to_ip");
      }
      await fetchPstnIpRoutes();
      setSelected([]);
      setPage(1);
      showMessage("success", "All routes deleted successfully!");
    } catch (error) {
      showMessage("error", "Failed to clear all routes");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  return (
    <div style={routePstnToIpPageWrapStyle}>
      <div style={routePstnToIpPageInnerStyle}>
        {/* Toast Alert */}
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={{
              position: "fixed",
              top: 20,
              right: 20,
              zIndex: 9999,
              minWidth: 300,
              boxShadow: 3,
            }}
          >
            {message.text}
          </Alert>
        )}

        <RoutePstnToIpBreadcrumb />

        {/* Main Card */}
        <div style={routePstnToIpCardStyle}>
          {/* Toolbar */}
          <div style={routePstnToIpToolbarStyle}>
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
                <span style={routePstnToIpSelectedBadgeStyle}>
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
                disabled={rules.length === 0 || loading.delete || loading.fetch}
                style={routePstnToIpCancelBtnStyle}
              >
                Inverse
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleDelete}
                disabled={selected.length === 0 || loading.delete}
                style={routePstnToIpCancelBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : null}
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleClearAll}
                disabled={rules.length === 0 || loading.delete}
                style={routePstnToIpCancelBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : (
                  "Clear All"
                )}
              </Btn>
              <Btn
                onClick={() => handleOpenModal()}
                variant="primary"
                disabled={loading.fetch || loading.save}
                style={routePstnToIpPrimaryBtnStyle}
              >
                {ROUTE_PSTN_IP_ADD_NEW_LABEL}
              </Btn>
            </div>
          </div>

          {loading.fetch ? (
            <TableListLoading />
          ) : rules.length === 0 ? (
            <TableListEmptyState
              message={ROUTE_PSTN_IP_EMPTY_MESSAGE}
              onAddNew={() => handleOpenModal()}
              buttonLabel={ROUTE_PSTN_IP_ADD_NEW_EMPTY_LABEL}
            />
          ) : (
            <>
              <div style={{ overflowX: "auto", overflowY: "auto", flex: 1 }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "separate",
                    borderSpacing: 0,
                    tableLayout: "auto",
                    minWidth: tableMinWidth,
                  }}
                >
                  <thead>
                    <tr>
                      <TH style={{ width: 40, padding: 0, borderLeft: "none" }}>
                        <Checkbox
                          size="small"
                          checked={
                            rules.length > 0 && selected.length === rules.length
                          }
                          indeterminate={
                            selected.length > 0 &&
                            selected.length < rules.length
                          }
                          onChange={(e) => {
                            if (e.target.checked) handleCheckAll();
                            else handleUncheckAll();
                          }}
                          sx={routePstnToIpTableCheckboxSx}
                        />
                      </TH>
                      {ROUTE_PSTN_IP_TABLE_COLUMNS.map((col) => (
                        <TH key={col.key}>{col.label}</TH>
                      ))}
                      <TH style={{ width: 70, borderRight: "none" }}>Modify</TH>
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
                          key={realIdx}
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
                              borderLeft: "none",
                              width: 36,
                              ...lastRowCellStyle,
                            }}
                          >
                            <Checkbox
                              size="small"
                              checked={isSelected}
                              onChange={() => handleSelectRow(idx)}
                              disabled={loading.delete}
                              sx={routePstnToIpTableCheckboxSx}
                            />
                          </td>
                          {ROUTE_PSTN_IP_TABLE_COLUMNS.map((col) => (
                            <td
                              key={col.key}
                              style={{
                                ...tdStyle,
                                background: rowBg,
                                fontWeight: 400,
                                ...lastRowCellStyle,
                              }}
                            >
                              {formatDisplayValue(col.key, item[col.key], idx)}
                            </td>
                          ))}
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
                                onClick={() => {
                                  if (!loading.delete)
                                    handleOpenModal(item, realIdx);
                                }}
                                style={{
                                  cursor: loading.delete
                                    ? "not-allowed"
                                    : "pointer",
                                  color: "#2563eb",
                                  fontSize: 22,
                                  opacity: loading.delete ? 0.4 : 0.7,
                                  transition: "opacity 0.15s ease",
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

              <RoutePstnToIpPagination
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
        sx={ROUTE_PSTN_TO_IP_ADD_NEW_DIALOG_SX}
        PaperProps={{
          sx: ROUTE_PSTN_TO_IP_ADD_NEW_DIALOG_PAPER_SX,
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
          {formData.originalIndex !== undefined && formData.originalIndex > -1
            ? ROUTE_PSTN_IP_MODAL_TITLE_EDIT
            : ROUTE_PSTN_IP_MODAL_TITLE_ADD}
        </DialogTitle>
        <DialogContent
          style={{
            padding: "24px",
            backgroundColor: "#ffffff",
            overflowY: "auto",
            flex: "1 1 auto",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={addHostFormPanelStyle}>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {ROUTE_PSTN_IP_FIELDS.map((field) => (
                  <E1PriFieldRow
                    key={field.key}
                    label={`${field.label}:`}
                    tooltipKey={field.key}
                    tooltips={ROUTE_PSTN_IP_FIELD_TOOLTIPS}
                  >
                    {field.type === "select" ? (
                      <select
                        value={formData[field.key] || ""}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            [field.key]: e.target.value,
                          }))
                        }
                        style={selectStyle}
                        {...inputInteraction}
                      >
                        <option value="" disabled>
                          Please select
                        </option>
                        {field.key === "callInitiator" ? (
                          pcmTrunkGroups.length > 0 ? (
                            pcmTrunkGroups.map((g) => {
                              const id = g.group_id ?? g.id ?? g;
                              return (
                                <option key={String(id)} value={String(id)}>
                                  PCM Trunk Group [{String(id)}]
                                </option>
                              );
                            })
                          ) : (
                            <option value="any">PCM Trunk Group [Any]</option>
                          )
                        ) : field.key === "callDestination" ? (
                          sipTrunkGroups.length > 0 ? (
                            sipTrunkGroups.map((g) => {
                              const id = g.group_id ?? g.id ?? g;
                              return (
                                <option key={String(id)} value={String(id)}>
                                  SIP Trunk Group [{String(id)}]
                                </option>
                              );
                            })
                          ) : (
                            <option value="any">SIP Trunk Group [Any]</option>
                          )
                        ) : (
                          field.options?.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))
                        )}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={formData[field.key] || ""}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            [field.key]: e.target.value,
                          }))
                        }
                        style={inputStyle}
                        {...inputInteraction}
                      />
                    )}
                  </E1PriFieldRow>
                ))}
              </div>
            </div>
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
              ROUTE_PSTN_IP_SAVE_LABEL
            )}
          </Btn>
          <Btn
            variant="cancel"
            onClick={handleCloseModal}
            disabled={loading.save}
            style={routePstnToIpModalCancelBtnStyle}
          >
            {ROUTE_PSTN_IP_CLOSE_LABEL}
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RoutePstnToIPPage;
