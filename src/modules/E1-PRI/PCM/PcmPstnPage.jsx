import React, { useState, useEffect, useRef } from "react";
import {
  PCM_PSTN_TABLE_COLUMNS,
  SPAN_FIELDS,
  CHANNELS_FIELDS,
  VOICE_FIELDS,
  PCM_PSTN_INITIAL_FORM,
  PCM_PSTN_FIELD_TOOLTIPS,
} from "../../../constants/PcmPstnConstants";
import { listPstn, createPstn, deletePstn } from "../../../api/apiService";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  TextField,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Alert,
  Checkbox,
  Tooltip,
} from "@mui/material";

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

// ── Color palette (matches Extensions) ────────────────────────────────────────
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

// ── Local modal field UI (inlined from e1PriSharedUi) ──
const OUTLINED_BORDER = "rgba(0, 0, 0, 0.23)";
const OUTLINED_HOVER = "rgba(0, 0, 0, 0.87)";
const OUTLINED_FOCUS = "#1976d2";

const muiTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#fff",
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

const muiSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  "& .MuiOutlinedInput-root": {
    minHeight: 36,
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

const modalTextFieldSx = {
  ...muiTextFieldSx,
  "& .MuiOutlinedInput-root": {
    ...muiTextFieldSx["& .MuiOutlinedInput-root"],
    height: 32,
  },
  "& .MuiOutlinedInput-input": {
    backgroundColor: "#fff",
  },
};

const modalSelectSx = {
  ...muiSelectSx,
  width: "100%",
  "& .MuiOutlinedInput-root": {
    minHeight: 36,
    height: 36,
    backgroundColor: "#fff",
  },
};

const addHostFormPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 8,
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

const pcmPstnModalCancelBtnStyle = {
  minWidth: 100,
  height: 33,
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

const pcmPstnTableCheckboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const pcmPstnPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const pcmPstnPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

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
        style={{ padding: "8px 24px", fontSize: 12, borderRadius: 6 }}
      >
        {buttonLabel}
      </Btn>
    ) : null}
  </div>
);

const PCM_PSTN_TABLE_CARD_RADIUS = 10;

const pcmPstnCardStyle = {
  background: "#ffffff",
  borderRadius: PCM_PSTN_TABLE_CARD_RADIUS,
  overflow: "hidden",
  border: `1px solid ${C.cardBorder}`,
  boxShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
};

const pcmPstnToolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.divider}`,
  background: "#ffffff",
  flexWrap: "wrap",
  gap: 12,
  borderTopLeftRadius: PCM_PSTN_TABLE_CARD_RADIUS,
  borderTopRightRadius: PCM_PSTN_TABLE_CARD_RADIUS,
};

const pcmPstnFooterStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.divider}`,
  borderBottomLeftRadius: PCM_PSTN_TABLE_CARD_RADIUS,
  borderBottomRightRadius: PCM_PSTN_TABLE_CARD_RADIUS,
  overflow: "hidden",
};

const pcmPstnSelectedBadgeStyle = {
  background: "#eff6ff",
  color: C.accent,
  fontSize: 11,
  fontWeight: 700,
  padding: "5px 12px",
  borderRadius: 999,
  border: `1px solid ${C.accent}`,
};

const pcmPstnCancelBtnStyle = {
  height: 30,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const pcmPstnPrimaryBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
};

const PCM_PSTN_MODAL_TAB_BAR_STYLE = {
  borderBottom: "1px solid #e5e7eb",
  background: "#ffffff",
};

const PCM_PSTN_MODAL_TAB_ACTIVE_COLOR = "#3E5475";
const PCM_PSTN_MODAL_TAB_INACTIVE_COLOR = "#374151";

const pcmPstnModalTabsSx = {
  minHeight: 45,
  "& .MuiTab-root": {
    color: PCM_PSTN_MODAL_TAB_INACTIVE_COLOR,
    fontSize: 12,
    fontWeight: 500,
    textTransform: "none",
    minHeight: 45,
  },
  "& .MuiTab-root.Mui-selected": {
    color: PCM_PSTN_MODAL_TAB_ACTIVE_COLOR,
    fontWeight: 700,
  },
};

const PRIMARY_CHANNEL = "1-15,17-31";
const PRIMARY_HDLC = "16";
const SECONDARY_CHANNEL = "32-46,48-62";
const SECONDARY_HDLC = "47";

const normalizeChannelString = (value = "") =>
  String(value || "").replace(/\s+/g, "");

const PcmPstnPage = () => {
  const [allData, setAllData] = useState([]);
  const [data, setData] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(PCM_PSTN_INITIAL_FORM);
  const [editIndex, setEditIndex] = useState(-1);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false,
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const hasInitialLoadRef = useRef(false);
  const pollingRef = useRef(null);
  const silentRefreshRef = useRef(false);
  const lastVisibilityStateRef = useRef(document.visibilityState);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Load data on component mount
  useEffect(() => {
    // Prevent duplicate calls during React StrictMode or development double-rendering
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadPstnData();
    }

    // Start background polling to auto-refresh status
    // Poll faster when the tab is visible, slower when hidden
    const startPolling = () => {
      if (pollingRef.current) return; // already running
      const getIntervalMs = () =>
        document.visibilityState === "visible" ? 5000 : 15000;
      let intervalMs = getIntervalMs();
      pollingRef.current = setInterval(() => {
        loadPstnData(true).catch(() => {});
        // If visibility changed since last tick, adjust interval
        const current = getIntervalMs();
        if (current !== intervalMs) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
          intervalMs = current;
          startPolling();
        }
      }, intervalMs);
    };

    // Visibility/focus handlers: immediate refresh on return to tab or window focus
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        lastVisibilityStateRef.current !== "visible"
      ) {
        loadPstnData(true).catch(() => {});
      }
      lastVisibilityStateRef.current = document.visibilityState;
      // Restart polling to update cadence
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      startPolling();
    };
    const handleWindowFocus = () => {
      loadPstnData(true).catch(() => {});
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);
    startPolling();

    // Cleanup
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, []);

  // Message handling
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  // Handlers
  const handleInputChange = (name, value) =>
    setFormData((prev) => ({ ...prev, [name]: value }));

  // Load PSTN data from API
  const loadPstnData = async (isRefresh = false) => {
    if (isRefresh) {
      if (silentRefreshRef.current) return;
      silentRefreshRef.current = true;
    } else {
      if (loading.fetch) return;
      setLoading((prev) => ({ ...prev, fetch: true }));
    }

    try {
      console.log("Attempting to load PSTN data...");
      const response = await listPstn();
      console.log("PSTN response:", response);

      if (response && response.success && Array.isArray(response.output)) {
        setAllData(response.output);
        setData(response.output);
        console.log(
          "PSTN data loaded successfully:",
          response.output.length,
          "items",
        );
        console.log("Sample data structure:", response.output[0]); // Debug: show first item structure
      } else {
        console.log("Invalid response format:", response);
        showMessage("error", "Failed to load PSTN data");
      }
    } catch (error) {
      console.error("Error loading PSTN data:", error);
      if (!isRefresh) {
        // Only show error on initial load, not on refresh after operations
        if (error.message === "Network Error") {
          showMessage("error", "Network error. Please check your connection.");
        } else if (error.response?.status === 500) {
          showMessage(
            "error",
            "Server error. The PSTN endpoint may have issues.",
          );
        } else if (error.response?.status === 404) {
          showMessage(
            "error",
            "PSTN API endpoint not found. The server does not have the /pstn endpoint implemented yet.",
          );
        } else {
          showMessage("error", error.message || "Failed to load PSTN data");
        }
      } else {
        // For refresh errors, just log them - don't disturb the user
        console.warn("Refresh failed, keeping existing data:", error.message);
      }
      // Only set empty array on initial load failure, not on refresh
      if (!isRefresh) {
        setAllData([]);
        setData([]);
      }
    } finally {
      if (isRefresh) {
        silentRefreshRef.current = false;
      } else {
        setLoading((prev) => ({ ...prev, fetch: false }));
        setIsInitialLoad(false);
      }
    }
  };

  const getNextAvailableSpanId = () => {
    if (allData.length === 0) {
      return 1;
    }

    // Get all existing span_id values as numbers
    const existingSpanIds = allData
      .map((item) => Number(item.span_id || item.span?.id))
      .sort((a, b) => a - b);

    // Find the first gap in the sequence
    for (let i = 1; i <= Math.max(...existingSpanIds) + 1; i++) {
      if (!existingSpanIds.includes(i)) {
        return i;
      }
    }

    // If no gaps, return the next number after the highest
    return Math.max(...existingSpanIds) + 1;
  };

  const getAvailableSpanNos = () => {
    if (allData.length === 0) {
      return [1, 2, 3, 4, 5]; // Show first 5 available numbers
    }

    // Get all existing SpanNo values as numbers
    const existingSpanNos = allData.map((item) => Number(item.spanNo));
    const maxSpanNo = Math.max(...existingSpanNos);

    // Find available numbers (gaps and next numbers)
    const availableSpanNos = [];
    for (let i = 1; i <= maxSpanNo + 5; i++) {
      if (!existingSpanNos.includes(i)) {
        availableSpanNos.push(i);
        if (availableSpanNos.length >= 5) break; // Show max 5 available numbers
      }
    }

    return availableSpanNos;
  };

  const validateFormData = (data) => {
    const errors = [];

    // Required field validation
    if (!data.id || data.id.toString().trim() === "") {
      errors.push("Span ID is required");
    }
    if (!data.context || data.context.trim() === "") {
      errors.push("Context is required");
    }
    if (!data.signalling || data.signalling.trim() === "") {
      errors.push("Signalling is required");
    }
    if (!data.bchan || data.bchan.trim() === "") {
      errors.push("Channel is required");
    }

    // Numeric validation
    if (data.id && isNaN(Number(data.id))) {
      errors.push("Span ID must be a valid number");
    }
    if (data.group && isNaN(Number(data.group))) {
      errors.push("Group must be a valid number");
    }
    if (data.pickupgroup && isNaN(Number(data.pickupgroup))) {
      errors.push("Pickup Group must be a valid number");
    }
    if (data.callgroup && isNaN(Number(data.callgroup))) {
      errors.push("Call Group must be a valid number");
    }
    if (data.rxgain && isNaN(Number(data.rxgain))) {
      errors.push("Rx Gain must be a valid number");
    }
    if (data.txgain && isNaN(Number(data.txgain))) {
      errors.push("Tx Gain must be a valid number");
    }

    // Duplicate Span ID validation (only for new items, not for editing)
    if (editIndex === -1 && data.id) {
      const spanIdExists = allData.some(
        (item) =>
          (item.span_id || item.span?.id)?.toString() === data.id.toString(),
      );
      if (spanIdExists) {
        errors.push(
          `Span ID ${data.id} already exists. Please use a different number.`,
        );
      }
    }

    return errors;
  };

  const handleRefresh = async () => {
    await loadPstnData(true);
  };

  const handleInverse = () => {
    const ids = data.map((item) => item.span_id || item.span?.id);
    setSelectedItems(ids.filter((id) => !selectedItems.includes(id)));
  };
  const handleDelete = async () => {
    if (selectedItems.length === 0) {
      showMessage("error", "Please select items to delete");
      return;
    }

    // Show browser confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedItems.length} selected item(s)?`,
    );
    if (!confirmed) {
      return;
    }

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      console.log("Deleting selected items:", selectedItems);
      const deletePromises = selectedItems.map(async (spanId) => {
        console.log("Deleting item:", spanId);
        return await deletePstn(spanId);
      });

      const results = await Promise.allSettled(deletePromises);
      const successCount = results.filter(
        (result) => result.status === "fulfilled" && result.value.success,
      ).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        showMessage("success", `${successCount} item(s) deleted successfully`);

        // Try to reload data, but don't fail if it doesn't work
        try {
          await loadPstnData(true);
        } catch (reloadError) {
          console.warn(
            "Failed to reload after delete, removing from local state:",
            reloadError,
          );
          // Remove deleted items from local state as fallback
          setAllData((prev) =>
            prev.filter(
              (item) => !selectedItems.includes(item.span_id || item.span?.id),
            ),
          );
          setData((prev) =>
            prev.filter(
              (item) => !selectedItems.includes(item.span_id || item.span?.id),
            ),
          );
        }
        setSelectedItems([]); // Clear selection
      }

      if (failCount > 0) {
        showMessage("error", `Failed to delete ${failCount} item(s)`);
      }
    } catch (error) {
      console.error("Error deleting PSTN settings:", error);
      if (error.message === "Network Error") {
        showMessage("error", "Network error. Please check your connection.");
      } else {
        showMessage("error", error.message || "Failed to delete PSTN settings");
      }
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };
  const handleClearAll = async () => {
    if (allData.length === 0) {
      showMessage("info", "No data to clear");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to delete ALL PSTN settings? This action cannot be undone.",
      )
    ) {
      return;
    }

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      console.log(
        "Clearing all PSTN settings:",
        allData.map((item) => item.span_id || item.span?.id),
      );
      const deletePromises = allData.map(async (item) => {
        const spanId = item.span_id || item.span?.id;
        console.log("Deleting item:", spanId);
        return await deletePstn(spanId);
      });

      const results = await Promise.allSettled(deletePromises);
      const successCount = results.filter(
        (result) => result.status === "fulfilled" && result.value.success,
      ).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        showMessage(
          "success",
          `All ${successCount} item(s) deleted successfully`,
        );

        // Try to reload data, but don't fail if it doesn't work
        try {
          await loadPstnData(true);
        } catch (reloadError) {
          console.warn(
            "Failed to reload after clear all, clearing local state:",
            reloadError,
          );
          // Clear all items from local state as fallback
          setAllData([]);
          setData([]);
        }
        setSelectedItems([]);
      }

      if (failCount > 0) {
        showMessage("error", `Failed to delete ${failCount} item(s)`);
      }
    } catch (error) {
      console.error("Error clearing all PSTN settings:", error);
      if (error.message === "Network Error") {
        showMessage("error", "Network error. Please check your connection.");
      } else {
        showMessage(
          "error",
          error.message || "Failed to clear all PSTN settings",
        );
      }
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleAddNew = () => {
    const nextSpanId = getNextAvailableSpanId();
    const normalizedPrimary = normalizeChannelString(PRIMARY_CHANNEL);
    const existingChannels = allData.map((item) =>
      normalizeChannelString(item.span?.bchan || item.bchan),
    );
    const hasPrimary = existingChannels.includes(normalizedPrimary);

    const newFormData = {
      ...PCM_PSTN_INITIAL_FORM,
      id: nextSpanId,
      bchan: hasPrimary ? SECONDARY_CHANNEL : PRIMARY_CHANNEL,
      hardhdlc: hasPrimary ? SECONDARY_HDLC : PRIMARY_HDLC,
    };
    setFormData(newFormData);
    setEditIndex(-1);
    setTab(0);
    setIsModalOpen(true);
  };

  const handleEditItem = (item, index) => {
    // Map the new API response structure to form data
    const formData = {
      // Span fields
      id: item.span?.id || item.span_id || "",
      timing: String(item.span?.timing || 0),
      lbo: String(item.span?.lbo || 0),
      framing: item.span?.framing || "",
      coding: item.span?.coding || "",
      flags:
        item.span?.flags === false ||
        item.span?.flags === undefined ||
        item.span?.flags === null
          ? "Disabled"
          : item.span?.flags === true
            ? "crc4"
            : String(item.span?.flags || "crc4"),
      bchan: item.span?.bchan || "",
      hardhdlc: item.span?.hardhdlc || "",

      // Channels fields
      signalling: item.channels?.signalling || "",
      context: item.channels?.context || "",
      switchtype: item.channels?.switchtype || "",
      group: item.channels?.group || 1,
      accountcode: item.channels?.accountcode || "",
      pickupgroup: item.channels?.pickupgroup || 1,
      callgroup: item.channels?.callgroup || 1,
      pridialplan: item.channels?.pridialplan || "",
      prilocaldialplan: item.channels?.prilocaldialplan || "",
      facilityenable: item.channels?.facilityenable || "yes",
      usecallerid: item.channels?.usecallerid || "yes",
      hidecallerid: item.channels?.hidecallerid || "no",
      usecallingpres: item.channels?.usecallingpres || "yes",
      immediate: item.channels?.immediate || "no",
      overlapdial: item.channels?.overlapdial || "yes",
      faxdetect: item.channels?.faxdetect || "no",

      // Voice fields
      rxgain: String(item.channels?.rxgain || 0.0),
      txgain: String(item.channels?.txgain || 0.0),
      echocancel: item.channels?.echocancel || "yes",
      echocancelwhenbridged: item.channels?.echocancelwhenbridged || "yes",
    };

    setFormData(formData);
    setEditIndex(index);
    setTab(0);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    // Validate form data
    const validationErrors = validateFormData(formData);
    if (validationErrors.length > 0) {
      const errorMessage = validationErrors.join(", ");
      showMessage("error", errorMessage);
      return;
    }

    setLoading((prev) => ({ ...prev, save: true }));
    try {
      // Prepare data for new API structure
      // Build span object with the exact tokens expected by DAHDI (no booleans)
      const spanPayload = {
        id: parseInt(formData.id),
        timing: parseInt(formData.timing) || 0,
        lbo: parseInt(formData.lbo) || 0,
        framing: formData.framing,
        coding: formData.coding,
        bchan: formData.bchan,
        hardhdlc: formData.hardhdlc,
        zones: {
          loadzone: "in",
          defaultzone: "in",
        },
      };
      // Only include flags when enabled; send string token like 'crc4', not boolean
      if (formData.flags && formData.flags !== "Disabled") {
        spanPayload.flags = formData.flags; // e.g., 'crc4', 'yellow', 'nt', 'te', 'term'
      }

      const apiData = {
        span_id: parseInt(formData.id),
        span: spanPayload,
        channels: {
          channel: formData.bchan, // Use same value as bchan
          signalling: formData.signalling,
          context: formData.context,
          switchtype: formData.switchtype,
          group: parseInt(formData.group) || 1,
          language: "en", // Hardcoded
          accountcode: formData.accountcode,
          pickupgroup: parseInt(formData.pickupgroup) || 1,
          callgroup: parseInt(formData.callgroup) || 1,
          pridialplan: formData.pridialplan,
          prilocaldialplan: formData.prilocaldialplan,
          facilityenable: formData.facilityenable,
          usecallerid: formData.usecallerid,
          hidecallerid: formData.hidecallerid,
          usecallingpres: formData.usecallingpres,
          echocancel: formData.echocancel,
          echocancelwhenbridged: formData.echocancelwhenbridged,
          immediate: formData.immediate,
          overlapdial: formData.overlapdial,
          faxdetect: formData.faxdetect,
          rxgain: parseFloat(formData.rxgain) || 0.0,
          txgain: parseFloat(formData.txgain) || 0.0,
        },
      };

      console.log("Creating PSTN with data:", apiData);
      const response = await createPstn(apiData);
      console.log("Create response:", response);

      if (response && response.success) {
        // Close modal to prevent further edits while processing
        setIsModalOpen(false);
        setEditIndex(-1);
        setLoading((prev) => ({ ...prev, fetch: true }));

        // Reload data immediately and then show success message
        try {
          await loadPstnData(true);
          showMessage(
            "success",
            response.message || "PSTN settings saved successfully!",
          );
        } catch (reloadError) {
          console.warn(
            "Failed to reload PSTN data after creation:",
            reloadError,
          );
          showMessage(
            "success",
            response.message || "PSTN settings saved successfully!",
          );
        }
      } else {
        const apiMessage = response?.message || response?.error;
        showMessage(
          "error",
          apiMessage ||
            "Failed to save PSTN settings. Please verify your inputs and try again.",
        );
      }
    } catch (error) {
      console.error("Error saving PSTN settings:", error);
      let friendlyMessage =
        "Failed to save PSTN settings. Please verify your inputs and try again.";
      if (error.response?.status === 400) {
        friendlyMessage =
          error.response?.data?.message ||
          "Invalid PSTN data. Please check the fields and try again.";
      } else if (error.response?.status === 409) {
        friendlyMessage =
          error.response?.data?.message ||
          "A PSTN span with this ID already exists.";
      } else if (error.response?.status === 500) {
        friendlyMessage =
          "Server error while saving PSTN settings. The span configuration may be invalid or already in use.";
      } else if (error.message === "Network Error") {
        friendlyMessage =
          "Network error. Please check your connection and try again.";
      } else if (error.message) {
        friendlyMessage = error.message;
      }
      showMessage("error", friendlyMessage);
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  // Render helpers

  const renderTableRow = (row, idx, isLastRow = false) => {
    const realIndex = idx;
    const spanId = row.span_id || row.span?.id;
    const isRowChecked = selectedItems.includes(spanId);
    const rowBg = isRowChecked
      ? "#eff6ff"
      : idx % 2 === 1
        ? "#f8fafc"
        : "#ffffff";
    const lastRowCellStyle = isLastRow ? { borderBottom: "none" } : {};

    return (
      <tr
        key={spanId}
        style={{
          background: rowBg,
          transition: "background 0.15s ease",
        }}
        onMouseEnter={(e) => {
          if (!isRowChecked) e.currentTarget.style.background = "#f8fafc";
        }}
        onMouseLeave={(e) => {
          if (!isRowChecked) e.currentTarget.style.background = rowBg;
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
            checked={isRowChecked}
            onChange={() => {
              setSelectedItems((prev) =>
                selectedItems.includes(spanId)
                  ? prev.filter((i) => i !== spanId)
                  : [...prev, spanId],
              );
            }}
            disabled={loading.delete}
            sx={pcmPstnTableCheckboxSx}
          />
        </td>
        {PCM_PSTN_TABLE_COLUMNS.map((col) => {
          if (col.key === "modify") {
            return (
              <td
                key={col.key}
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
                    onClick={() => handleEditItem(row, realIndex)}
                    style={{
                      cursor: loading.delete ? "not-allowed" : "pointer",
                      color: "#2563eb",
                      fontSize: 22,
                      opacity: loading.delete ? 0.4 : 0.7,
                      transition: "opacity 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!loading.delete) e.currentTarget.style.opacity = "1";
                    }}
                    onMouseLeave={(e) => {
                      if (!loading.delete) e.currentTarget.style.opacity = "0.7";
                    }}
                  />
                </div>
              </td>
            );
          }
          if (col.key === "span_status") {
            const isUp = row.span_status?.includes("Up");
            return (
              <td
                key={col.key}
                style={{ ...tdStyle, background: rowBg, ...lastRowCellStyle }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: isUp ? C.successGreen : C.errorRed,
                  }}
                >
                  {row.span_status || "—"}
                </span>
              </td>
            );
          }
          // Get value from appropriate section (span, channels, or root)
          const getValue = (key) => {
            if (row.span && row.span[key] !== undefined) return row.span[key];
            if (row.channels && row.channels[key] !== undefined)
              return row.channels[key];
            return row[key];
          };

          // Special handling for specific fields
          const displayValue = (key, value) => {
            if (value === undefined || value === null || value === "")
              return "—";

            // Handle timing field specifically
            if (key === "timing") {
              return value === 0 ? "0" : value === 1 ? "1" : String(value);
            }

            // Handle lbo field specifically
            if (key === "lbo") {
              return value === 0 ? "0" : value === 1 ? "1" : String(value);
            }

            // Handle flags field specifically
            if (key === "flags") {
              if (value === false || value === undefined || value === null) {
                return "Disabled";
              }
              if (value === true) {
                return "crc4";
              }
              return String(value);
            }

            return String(value);
          };

          return (
            <td
              key={col.key}
              style={{ ...tdStyle, background: rowBg, ...lastRowCellStyle }}
            >
              {displayValue(col.key, getValue(col.key))}
            </td>
          );
        })}
      </tr>
    );
  };

  const renderFormField = (field) => (
    <div
      key={field.name}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
      }}
    >
      <E1PriFieldLabel
        tooltipKey={field.name}
        tooltips={PCM_PSTN_FIELD_TOOLTIPS}
        style={{
          fontSize: 13,
          whiteSpace: "nowrap",
          textAlign: "left",
          width: 170,
          display: "inline-block",
        }}
      >
        {field.label}
        {["spanNo", "context", "signalling", "status"].includes(field.name) && (
          <span style={{ color: C.errorRed, marginLeft: 4 }}>*</span>
        )}
        :
      </E1PriFieldLabel>
      <div style={{ width: "min(100%, 320px)" }}>
        {field.type === "select" ? (
          <Select
            value={formData[field.name] || ""}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            size="small"
            fullWidth
            variant="outlined"
            displayEmpty
            renderValue={(selected) => {
              if (selected === "") {
                return <span style={{ color: "#9ca3af" }}>Please select</span>;
              }
              return selected;
            }}
            sx={modalSelectSx}
          >
            {/* hidden placeholder */}
            <MenuItem value="" disabled hidden />

            {field.options.map((opt) => (
              <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                {opt}
              </MenuItem>
            ))}
          </Select>
        ) : field.type === "radio" ? (
          <RadioGroup
            row
            value={formData[field.name] || ""}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
          >
            {field.options.map((opt) => (
              <FormControlLabel
                key={opt}
                value={opt}
                control={<Radio size="small" />}
                label={opt}
                sx={{
                  "& .MuiFormControlLabel-label": {
                    fontSize: 14,
                    color: "#374151",
                  },
                }}
              />
            ))}
          </RadioGroup>
        ) : (
          <TextField
            type={field.type}
            value={formData[field.name] || ""}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            onKeyDown={(e) => {
              if (field.type === "number" && e.key === "e") {
                e.preventDefault();
              }
            }}
            size="small"
            fullWidth
            variant="outlined"
            inputProps={{
              style: {
                fontSize: 13,
                height: 32,
                padding: "0 8px",
                boxSizing: "border-box",
              },
            }}
            sx={modalTextFieldSx}
          />
        )}
      </div>
    </div>
  );

  return (
    <div style={pcmPstnPageWrapStyle}>
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

      <div style={pcmPstnPageInnerStyle}>
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
          <span>E1-PRI</span>
          <span>&gt;</span>
          <span>PCM</span>
          <span>&gt;</span>
          <span style={{ color: "#1e293b", fontWeight: 600 }}>
            PSTN Settings
          </span>
        </div>

        <div style={pcmPstnCardStyle}>
          <div style={pcmPstnToolbarStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flex: 1,
                minWidth: 0,
              }}
            >
              {selectedItems.length > 0 && (
                <span style={pcmPstnSelectedBadgeStyle}>
                  {selectedItems.length} selected
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
                disabled={loading.delete || isInitialLoad}
                style={pcmPstnCancelBtnStyle}
              >
                Inverse
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleDelete}
                disabled={
                  loading.delete || isInitialLoad || selectedItems.length === 0
                }
                style={pcmPstnCancelBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : (
                  <>
                    <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                    Delete
                  </>
                )}
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleClearAll}
                disabled={loading.delete || isInitialLoad || data.length === 0}
                style={pcmPstnCancelBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : (
                  "Clear All"
                )}
              </Btn>
              <Btn
                variant="primary"
                onClick={handleAddNew}
                disabled={loading.save || isInitialLoad}
                style={pcmPstnPrimaryBtnStyle}
              >
                + Add New
              </Btn>
            </div>
          </div>

          {isInitialLoad ? (
            <TableListLoading />
          ) : data.length === 0 ? (
            <TableListEmptyState
              message="No PSTN settings found."
              onAddNew={handleAddNew}
            />
          ) : (
            <>
              <div
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
                          position: "sticky",
                          top: 0,
                          zIndex: 10,
                        }}
                      >
                        <Checkbox
                          size="small"
                          checked={
                            data.length > 0 &&
                            data.every((row) =>
                              selectedItems.includes(
                                row.span_id || row.span?.id,
                              ),
                            )
                          }
                          indeterminate={
                            data.some((row) =>
                              selectedItems.includes(
                                row.span_id || row.span?.id,
                              ),
                            ) &&
                            !data.every((row) =>
                              selectedItems.includes(
                                row.span_id || row.span?.id,
                              ),
                            )
                          }
                          onChange={() => {
                            const allSelected = data.every((row) =>
                              selectedItems.includes(
                                row.span_id || row.span?.id,
                              ),
                            );
                            if (allSelected) {
                              const rowIds = data.map(
                                (r) => r.span_id || r.span?.id,
                              );
                              setSelectedItems((prev) =>
                                prev.filter((id) => !rowIds.includes(id)),
                              );
                            } else {
                              setSelectedItems((prev) => {
                                const newSelections = [...prev];
                                data.forEach((row) => {
                                  const id = row.span_id || row.span?.id;
                                  if (!newSelections.includes(id)) {
                                    newSelections.push(id);
                                  }
                                });
                                return newSelections;
                              });
                            }
                          }}
                          sx={pcmPstnTableCheckboxSx}
                        />
                      </TH>
                      {PCM_PSTN_TABLE_COLUMNS.map((col) => (
                        <TH
                          key={col.key}
                          style={{
                            position: "sticky",
                            top: 0,
                            zIndex: 10,
                            ...(col.key === "modify"
                              ? { width: 70, borderRight: "none" }
                              : {}),
                          }}
                        >
                          {col.label}
                        </TH>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, idx) =>
                      renderTableRow(row, idx, idx === data.length - 1),
                    )}
                  </tbody>
                </table>
              </div>

              <div style={pcmPstnFooterStyle}>
                <span style={{ fontSize: 11, color: C.mutedText }}>
                  Showing {data.length} record
                  {data.length !== 1 ? "s" : ""}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth={false}
        slotProps={{
          backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.5)" } },
        }}
        sx={{
          "& .MuiDialog-container": {
            alignItems: "flex-start",
            pt: 8,
          },
        }}
        PaperProps={{
          sx: {
            width: 600,
            maxWidth: "95vw",
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
          {editIndex >= 0 ? "Edit PCM PSTN Settings" : "Add PCM PSTN Settings"}
        </DialogTitle>

        <div style={PCM_PSTN_MODAL_TAB_BAR_STYLE}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="fullWidth"
            TabIndicatorProps={{
              style: {
                backgroundColor: PCM_PSTN_MODAL_TAB_ACTIVE_COLOR,
                height: 2,
              },
            }}
            sx={pcmPstnModalTabsSx}
          >
            <Tab label="Span" />
            <Tab label="Channels" />
            <Tab label="Voice" />
          </Tabs>
        </div>

        <DialogContent
          style={{
            padding: "24px",
            backgroundColor: "#ffffff",
          }}
        >
          <div style={{ ...addHostFormPanelStyle, width: "100%" }}>
            {(tab === 0
              ? SPAN_FIELDS
              : tab === 1
                ? CHANNELS_FIELDS
                : VOICE_FIELDS
            ).map(renderFormField)}
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
            disabled={loading.save}
            style={{ minWidth: 100, height: 33, fontSize: 13 }}
          >
            {loading.save ? "Saving..." : editIndex >= 0 ? "Update" : "Save"}
          </Btn>
          <Btn
            variant="cancel"
            onClick={() => setIsModalOpen(false)}
            disabled={loading.save}
            style={pcmPstnModalCancelBtnStyle}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PcmPstnPage;
