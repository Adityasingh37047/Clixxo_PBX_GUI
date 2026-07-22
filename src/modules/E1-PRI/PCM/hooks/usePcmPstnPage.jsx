import React, { useState, useEffect, useRef } from "react";
import { FOCUS_RING_SHADOW } from "../../../../theme/pbxTokens";
import { Checkbox, Tooltip, CircularProgress } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  PCM_PSTN_TABLE_COLUMNS,
  PCM_PSTN_SPAN_FIELDS,
  PCM_PSTN_CHANNELS_FIELDS,
  PCM_PSTN_VOICE_FIELDS,
  PCM_PSTN_INITIAL_FORM,
  PCM_PSTN_FIELD_TOOLTIPS,
  PCM_PSTN_PAGE_BREADCRUMB_ROOT,
  PCM_PSTN_PAGE_BREADCRUMB_SECTION,
  PCM_PSTN_PAGE_TITLE,
  PCM_PSTN_EMPTY_MESSAGE,
  PCM_PSTN_MODAL_TITLE_ADD,
  PCM_PSTN_MODAL_TITLE_EDIT,
  PCM_PSTN_ADD_NEW_LABEL,
  PCM_PSTN_DELETE_LABEL,
  PCM_PSTN_SAVE_LABEL,
  PCM_PSTN_CLOSE_LABEL,
} from "../../../../constants/PcmPstnConstants";
import {
  listPstn, createPstn, deletePstn
} from "../../../../api/apiService";
import { validateFormData } from "../utils/PcmPstnValidators";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Btn,
  TH,
  C,
  tdStyle,
  checkboxSx,
  PcmPstnBreadcrumb,
  PCM_PSTN_COMPACT_MQ,
  pcmPstnAddNewModalFooterStyle as addNewModalFooterStyle,
  pcmPstnAddNewModalFooterBtnStyle as addNewModalFooterBtnStyle,
  pcmPstnAddNewModalFooterCancelBtnStyle,
  pcmPstnCardStyle,
  pcmPstnToolbarStyle,
  pcmPstnPaginationStyle as pcmPstnFooterStyle,
  pcmPstnPrimaryBtnStyle,
  pcmPstnCancelBtnStyle,
  pcmPstnFormPanelStyle as pcmPstnModalFormPanelStyle,
} from "../components/PcmPstnFormFields";
import {
  pcmPstnPageWrapStyle,
  pcmPstnPageInnerStyle,
  pcmPstnSelectedBadgeStyle,
  pcmPstnModalCancelBtnStyle,
} from "../components/PcmPstnTableHelpers";

const pcmPstnTableCheckboxSx = checkboxSx;
const PCM_PSTN_ADD_NEW_DIALOG_LAYOUT_OFFSET = 80;

const PCM_PSTN_ADD_NEW_DIALOG_SX = {
  "& .MuiDialog-container": {
    alignItems: "flex-start",
    justifyContent: "center",
    pt: 8,
  },
};

const PCM_PSTN_ADD_NEW_DIALOG_PAPER_SX = {
  mx: "auto",
  my: 0,
  maxHeight: `calc(100vh - ${PCM_PSTN_ADD_NEW_DIALOG_LAYOUT_OFFSET}px - 48px)`,
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

const PcmPstnFieldLabel = ({ tooltipKey, tooltips, children, style = {} }) => {
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

const PcmPstnFieldRow = ({
  label,
  tooltipKey,
  tooltips,
  children,
  labelWidth = 170,
  required = false,
}) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    <PcmPstnFieldLabel
      tooltipKey={tooltipKey}
      tooltips={tooltips}
      style={{
        width: labelWidth,
        flexShrink: 0,
        textAlign: "left",
        display: "inline-block",
        fontSize: 13,
        whiteSpace: "nowrap",
      }}
    >
      {label}
      {required ? <span style={{ color: C.errorRed, marginLeft: 2 }}>*</span> : null}
    </PcmPstnFieldLabel>
    <div style={{ flex: 1, minWidth: 0, width: "100%" }}>{children}</div>
  </div>
);

// ── PBX modal field UI (native inputs — matches Num Manipulate / Blocked List) ──
const PCM_PSTN_OUTLINED_BORDER = "#d1d5db";
const PCM_PSTN_OUTLINED_HOVER = "#9ca3af";
const PCM_PSTN_OUTLINED_FOCUS = "#3E5475";
const PCM_PSTN_FOCUS_RING_SHADOW = "0 0 0 2px rgba(62, 84, 117, 0.15)";

const pcmPstnSetFieldDefault = (el) => {
  el.style.borderColor = PCM_PSTN_OUTLINED_BORDER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const pcmPstnSetFieldHover = (el) => {
  el.style.borderColor = PCM_PSTN_OUTLINED_HOVER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const pcmPstnSetFieldFocus = (el) => {
  el.style.borderColor = PCM_PSTN_OUTLINED_FOCUS;
  el.style.borderWidth = "1px";
  el.style.boxShadow = PCM_PSTN_FOCUS_RING_SHADOW;
};

const pcmPstnInputInteraction = {
  onFocus: (e) => {
    if (e.target.disabled) return;
    pcmPstnSetFieldFocus(e.target);
  },
  onBlur: (e) => {
    pcmPstnSetFieldDefault(e.target);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled) return;
    if (document.activeElement === e.target) pcmPstnSetFieldFocus(e.target);
    else pcmPstnSetFieldHover(e.target);
  },
  onMouseLeave: (e) => {
    if (document.activeElement === e.target) pcmPstnSetFieldFocus(e.target);
    else pcmPstnSetFieldDefault(e.target);
  },
};

const pcmPstnInputStyle = {
  width: "100%",
  height: 32,
  padding: "0 10px",
  fontSize: 13,
  lineHeight: 1.35,
  border: `1px solid ${PCM_PSTN_OUTLINED_BORDER}`,
  borderRadius: 4,
  outline: "none",
  backgroundColor: "#fff",
  color: C.valueText,
  boxSizing: "border-box",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const pcmPstnSelectStyle = {
  ...pcmPstnInputStyle,
  padding: "0 28px 0 10px",
  appearance: "auto",
  cursor: "pointer",
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
        style={{ height: 30, padding: "6px 14px", fontSize: 12, borderRadius: 4 }}
      >
        {buttonLabel}
      </Btn>
    ) : null}
  </div>
);

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

/** Page layout / modal chrome used by PcmPstnPage.jsx */
export {
  PCM_PSTN_ADD_NEW_DIALOG_SX,
  PCM_PSTN_ADD_NEW_DIALOG_PAPER_SX,
  PCM_PSTN_MODAL_TAB_BAR_STYLE,
  PCM_PSTN_MODAL_TAB_ACTIVE_COLOR,
  pcmPstnModalTabsSx,
  pcmPstnModalFormPanelStyle,
  addNewModalFooterStyle,
  addNewModalFooterBtnStyle,
  pcmPstnModalCancelBtnStyle,
  pcmPstnFooterStyle,
  pcmPstnPrimaryBtnStyle,
  pcmPstnTableCheckboxSx,
};

const PRIMARY_CHANNEL = "1-15,17-31";
const PRIMARY_HDLC = "16";
const SECONDARY_CHANNEL = "32-46,48-62";
const SECONDARY_HDLC = "47";

const normalizeChannelString = (value = "") =>
  String(value || "").replace(/\s+/g, "");

export function usePcmPstnPage() {
const isCompact = useMediaQuery(PCM_PSTN_COMPACT_MQ);
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
    const validationErrors = validateFormData(formData, editIndex, allData);
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

  const renderFormField = (field) => {
    const isRequired = ["id", "context", "signalling", "bchan"].includes(
      field.name,
    );
    const labelText = `${field.label}:`;

    return (
      <PcmPstnFieldRow
        key={field.name}
        label={labelText}
        tooltipKey={field.name}
        tooltips={PCM_PSTN_FIELD_TOOLTIPS}
        required={isRequired}
      >
        {field.type === "select" ? (
          <select
            name={field.name}
            value={formData[field.name] ?? ""}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            style={pcmPstnSelectStyle}
            {...pcmPstnInputInteraction}
          >
            {field.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
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
                    fontSize: 13,
                    color: "#374151",
                  },
                }}
              />
            ))}
          </RadioGroup>
        ) : (
          <input
            type={field.type || "text"}
            name={field.name}
            value={formData[field.name] ?? ""}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            onKeyDown={(e) => {
              if (field.type === "number" && e.key === "e") e.preventDefault();
            }}
            style={pcmPstnInputStyle}
            {...pcmPstnInputInteraction}
          />
        )}
      </PcmPstnFieldRow>
    );
  };

  return {
    allData,
    data,
    selectedItems,
    setSelectedItems,
    isModalOpen,
    setIsModalOpen,
    formData,
    editIndex,
    tab,
    setTab,
    loading,
    message,
    setMessage,
    isInitialLoad,
    isCompact,
    showMessage,
    handleInputChange,
    loadPstnData,
    getNextAvailableSpanId,
    getAvailableSpanNos,
    handleRefresh,
    handleInverse,
    handleDelete,
    handleClearAll,
    handleAddNew,
    handleEditItem,
    handleSave,
    renderTableRow,
    renderFormField,
  };
}
