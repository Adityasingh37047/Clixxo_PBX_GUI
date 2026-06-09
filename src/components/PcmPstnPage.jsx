import React, { useState, useEffect, useRef } from "react";
import {
  PCM_PSTN_TABLE_COLUMNS,
  SPAN_FIELDS,
  CHANNELS_FIELDS,
  VOICE_FIELDS,
  PCM_PSTN_INITIAL_FORM,
} from "../constants/PcmPstnConstants";
import { listPstn, createPstn, deletePstn } from "../api/apiService";

import {
  TextField,
  Select,
  MenuItem,
  Button,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
  CircularProgress,
  Alert,
  Checkbox,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";

const C = {
  pageBg: "#eef2f7",
  cardBg: "#ffffff",
  cardBorder: "#9ca3af",
  labelText: "#1e293b",
  valueText: "#1e293b",
  mutedText: "#94a3b8",
  accent: "#1e293b",
  successGreen: "#16a34a",
  errorRed: "#dc2626",
  amber: "#d97706",
};

const SectionHeading = ({ title }) => (
  <div style={{ margin: "16px 0 24px 0", position: "relative" }}>
    <div style={{ borderTop: `1px solid ${C.cardBorder}` }} />
    <span
      style={{
        position: "absolute",
        top: -10,
        left: 0,
        background: "#eef2f7",
        paddingRight: 8,
        fontSize: 13,
        fontWeight: 600,
        color: C.mutedText,
      }}
    >
      {title}
    </span>
  </div>
);

// ── Shared: Action Button ────────────────────────────────────────────────────
const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
}) => {
  const variants = {
    default: {
      background: "#1e293b",
      color: "#fff",
      border: "1px solid #9ca3af",
    },
    outline: {
      background: C.cardBg,
      color: C.labelText,
      border: `0.5px solid ${C.cardBorder}`,
    },
    danger: {
      background: "#fef2f2",
      color: C.errorRed,
      border: `0.5px solid #fecaca`,
    },
    accent: {
      background: C.cardBg,
      color: C.accent,
      border: `0.5px solid ${C.cardBorder}`,
    },
  };
  const s = variants[variant] || variants.default;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...s,
        fontSize: 11,
        fontWeight: 600,
        padding: "5px 14px",
        borderRadius: 6,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        transition: "opacity 0.15s ease",
        whiteSpace: "nowrap",
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.opacity = "0.82";
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.opacity = "1";
      }}
    >
      {children}
    </button>
  );
};

// ── Shared: Table Header ──────────────────────────────────────────────────────
const TH = ({ children, style: extra }) => (
  <th
    style={{
      background: "#f3f4f6",
      color: C.labelText,
      fontWeight: 700,
      fontSize: 10.5,
      padding: "9px 8px",
      textAlign: "center",
      borderBottom: `1px solid ${C.cardBorder}`,
      borderRight: `0.5px solid #9ca3af`,
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      ...extra,
    }}
  >
    {children}
  </th>
);

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
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false,
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const hasInitialLoadRef = useRef(false);
  const pollingRef = useRef(null);
  const lastVisibilityStateRef = useRef(document.visibilityState);

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));
  const pagedData = data.slice((page - 1) * itemsPerPage, page * itemsPerPage);

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
  const handlePageChange = (newPage) =>
    setPage(Math.max(1, Math.min(totalPages, newPage)));

  // Load PSTN data from API
  const loadPstnData = async (isRefresh = false) => {
    // Prevent concurrent calls
    if (loading.fetch) {
      return;
    }

    setLoading((prev) => ({ ...prev, fetch: true }));
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
      setLoading((prev) => ({ ...prev, fetch: false }));
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

  const handleCheckAll = () => {
    const ids = pagedData
      .map((item) => item.span_id || item.span?.id)
      .filter(Boolean);
    setSelectedItems(ids);
  };
  const handleUncheckAll = () => setSelectedItems([]);
  const handleInverse = () => {
    const pagedIds = pagedData
      .map((item) => item.span_id || item.span?.id)
      .filter(Boolean);
    const otherPageSelections = selectedItems.filter(
      (id) => !pagedIds.includes(id),
    );
    const invertedPagedSelections = pagedIds.filter(
      (id) => !selectedItems.includes(id),
    );
    setSelectedItems([...otherPageSelections, ...invertedPagedSelections]);
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
        setPage(1);
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

  const renderTableRow = (row, idx) => {
    const realIndex = (page - 1) * itemsPerPage + idx;
    const spanId = row.span_id || row.span?.id;
    const isSelected = selectedItems.includes(spanId);
    const rowBgColor = isSelected
      ? "#f0f9ff"
      : idx % 2 === 1
        ? "#f8fafc"
        : "#ffffff";

    return (
      <tr
        key={spanId}
        style={{
          background: rowBgColor,
          borderBottom: "0.5px solid #9ca3af",
          transition: "background 0.1s ease",
        }}
        onMouseEnter={(e) => {
          if (!isSelected) e.currentTarget.style.background = "#f0f9ff";
        }}
        onMouseLeave={(e) => {
          if (!isSelected) e.currentTarget.style.background = rowBgColor;
        }}
      >
        <td
          style={{
            textAlign: "center",
            padding: "4px 0",
            borderRight: "0.5px solid #edf2f7",
            borderBottom: "0.5px solid #9ca3af",
          }}
        >
          <Checkbox
            size="small"
            checked={selectedItems.includes(spanId)}
            onChange={() => {
              setSelectedItems((prev) =>
                selectedItems.includes(spanId)
                  ? prev.filter((i) => i !== spanId)
                  : [...prev, spanId],
              );
            }}
            disabled={loading.delete}
            sx={{
              padding: "1px",
              color: C.accent,
              "&.Mui-checked": { color: C.accent },
            }}
          />
        </td>
        {PCM_PSTN_TABLE_COLUMNS.map((col) => {
          if (col.key === "modify") {
            return (
              <td
                key={col.key}
                style={{
                  padding: "4px 8px",
                  fontSize: 12,
                  color: C.valueText,
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  borderBottom: "0.5px solid #9ca3af",
                }}
              >
                <IconButton
                  onClick={() => handleEditItem(row, realIndex)}
                  sx={{
                    p: 0.5,
                    color: "#475569",
                    "&:hover": { color: "#1e293b", background: "#e2e8f0" },
                  }}
                >
                  <EditIcon sx={{ fontSize: 18 }} />
                </IconButton>
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
              return "--";

            if (key === "span_status") {
              const isUp = String(value).includes("Up");
              return (
                <span
                  style={{
                    display: "inline-block",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontSize: "11px",
                    fontWeight: 600,
                    // backgroundColor: isUp ? "#dcfce7" : "#fee2e2",
                    color: isUp ? "#166534" : "#991b1b",
                    // border: `1px solid ${isUp ? "#bbf7d0" : "#fecaca"}`,
                  }}
                >
                  {value}
                </span>
              );
            }

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
              style={{
                padding: "7px 8px",
                fontSize: 12,
                color: C.valueText,
                textAlign: "center",
                whiteSpace: "nowrap",
                borderRight: "0.5px solid #edf2f7",
                borderBottom: "0.5px solid #9ca3af",
              }}
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
        background: "#ffffff",
        border: "1px solid #cbd5e1",
        borderRadius: 6,
        padding: "6px 12px",
        gap: 12,
        minHeight: 40,
      }}
    >
      <label
        style={{
          fontSize: 13,
          color: "#1e293b",
          fontWeight: 600,
          whiteSpace: "nowrap",
          width: 160,
        }}
      >
        {field.label}
        {["spanNo", "context", "signalling", "status"].includes(field.name) && (
          <span style={{ color: "#dc2626", marginLeft: 4 }}>*</span>
        )}
        :
      </label>
      <div className="flex-1" style={{ maxWidth: 280 }}>
        {field.type === "select" ? (
          <FormControl size="small" fullWidth>
            <Select
              value={formData[field.name] || ""}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              size="small"
              fullWidth
              variant="outlined"
              displayEmpty
              renderValue={(selected) => {
                if (selected === "") {
                  return (
                    <span style={{ color: "#9ca3af" }}>Please select</span>
                  );
                }
                return selected;
              }}
              sx={{
                fontSize: 13,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#cbd5e1",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#94a3b8",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#1e2d42",
                },
              }}
            >
              {/* hidden placeholder */}
              <MenuItem value="" disabled hidden />

              {field.options.map((opt) => (
                <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
                control={
                  <Radio
                    size="small"
                    sx={{
                      color: "#cbd5e1",
                      "&.Mui-checked": {
                        color: "#1e2d42",
                      },
                    }}
                  />
                }
                label={opt}
                sx={{
                  "& .MuiFormControlLabel-label": {
                    fontSize: 13,
                    color: "#1e293b",
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
            sx={{
              fontSize: 13,
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#cbd5e1",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#94a3b8",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#1e2d42",
              },
            }}
            inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
          />
        )}
      </div>
    </div>
  );

  const pagedIds = pagedData
    .map((item) => item.span_id || item.span?.id)
    .filter(Boolean);
  const allPageSelected =
    pagedIds.length > 0 && pagedIds.every((id) => selectedItems.includes(id));
  const somePageSelected =
    pagedIds.length > 0 &&
    pagedIds.some((id) => selectedItems.includes(id)) &&
    !allPageSelected;

  const handleToggleAll = () => {
    if (allPageSelected) {
      setSelectedItems((prev) => prev.filter((id) => !pagedIds.includes(id)));
    } else {
      setSelectedItems((prev) => {
        const next = [...prev];
        pagedIds.forEach((id) => {
          if (!next.includes(id)) next.push(id);
        });
        return next;
      });
    }
  };

  return (
    <div
      style={{
        backgroundColor: C.pageBg,
        minHeight: "calc(100vh - 80px)",
        padding: 16,
      }}
    >
      {/* Message Display */}
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

      <div style={{ width: "100%", maxWidth: 1200, margin: "0 auto" }}>
        {/* Breadcrumb */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 11, color: C.mutedText }}>
            E1-PRI &rsaquo; PCM &rsaquo;{" "}
            <span style={{ color: C.valueText, fontWeight: 600 }}>
              PSTN Settings
            </span>
          </div>
        </div>

        {/* Main Card */}
        <div
          style={{
            background: C.cardBg,
            border: `1px solid ${C.cardBorder}`,
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          {/* Toolbar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              borderBottom: `1px solid ${C.cardBorder}`,
              background: "#DCE6F2",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            {/* Left side: Page info badge & selection counts */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  background: "#f1f5f9",
                  border: `0.5px solid ${C.cardBorder}`,
                  color: "#475569",
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "3px 12px",
                  borderRadius: 20,
                }}
              >
                Page {page} · {data.length} records
              </span>
              {selectedItems.length > 0 && (
                <span
                  style={{
                    background: "#e0f2fe",
                    border: "0.5px solid #bae6fd",
                    color: "#0369a1",
                    fontSize: 10.5,
                    fontWeight: 600,
                    padding: "2px 10px",
                    borderRadius: 12,
                  }}
                >
                  {selectedItems.length} selected
                </span>
              )}
            </div>
            {/* Right side: action buttons */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Btn
                onClick={handleInverse}
                disabled={loading.delete}
                variant="outline"
              >
                Inverse
              </Btn>
              <Btn
                onClick={handleClearAll}
                disabled={loading.delete || data.length === 0}
                variant="danger"
              >
                Clear All
              </Btn>
              <Btn
                onClick={handleDelete}
                disabled={loading.delete || selectedItems.length === 0}
                variant="danger"
              >
                🗑 Delete
              </Btn>
              <Btn
                onClick={handleAddNew}
                disabled={loading.save}
                variant="accent"
              >
                + Add New
              </Btn>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto w-full">
            <table
              className="w-full min-w-[1200px] border-collapse whitespace-nowrap"
              style={{
                tableLayout: "auto",
              }}
            >
              <thead>
                <tr>
                  <TH style={{ width: 36 }}>
                    <Checkbox
                      size="small"
                      checked={allPageSelected}
                      indeterminate={somePageSelected}
                      onChange={handleToggleAll}
                      sx={{
                        padding: "1px",
                        color: C.accent,
                        "&.Mui-checked": { color: C.accent },
                        "&.MuiCheckbox-indeterminate": { color: C.accent },
                      }}
                    />
                  </TH>
                  {PCM_PSTN_TABLE_COLUMNS.map((col) => (
                    <TH key={col.key}>{col.label}</TH>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={PCM_PSTN_TABLE_COLUMNS.length + 1}
                      style={{
                        textAlign: "center",
                        padding: "36px 0",
                        color: C.mutedText,
                        fontSize: 12,
                        borderBottom: `0.5px solid ${C.cardBorder}`,
                      }}
                    >
                      No data
                    </td>
                  </tr>
                ) : (
                  pagedData.map(renderTableRow)
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom pagination */}
          {data.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderTop: `0.5px solid ${C.cardBorder}`,
                background: "#f8fafc",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <span style={{ fontSize: 11, color: C.mutedText }}>
                Showing {pagedData.length} record
                {pagedData.length !== 1 ? "s" : ""} on page {page}
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <Btn
                  onClick={() => handlePageChange(1)}
                  disabled={page === 1}
                  variant="outline"
                >
                  First
                </Btn>
                <Btn
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  variant="outline"
                >
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
                    border: `0.5px solid ${C.cardBorder}`,
                  }}
                >
                  Page {page} of {totalPages}
                </span>
                <Btn
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  variant="outline"
                >
                  Next →
                </Btn>
                <Btn
                  onClick={() => handlePageChange(totalPages)}
                  disabled={page === totalPages}
                  variant="outline"
                >
                  Last
                </Btn>
                <span
                  style={{ fontSize: 11, color: C.mutedText, marginLeft: 8 }}
                >
                  Go to Page:
                </span>
                <select
                  value={page}
                  onChange={(e) => handlePageChange(Number(e.target.value))}
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    borderRadius: 6,
                    border: `0.5px solid ${C.cardBorder}`,
                    background: C.cardBg,
                    color: C.labelText,
                    padding: "4px 8px",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        <Dialog
          open={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
          }}
          maxWidth={false}
          className="z-50"
          PaperProps={{
            sx: {
              width: 600,
              maxWidth: "95vw",
              mx: "auto",
              p: 0,
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow:
                "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
            },
          }}
        >
          <DialogTitle
            style={{
              background: "#1e2d42",
              color: "#ffffff",
              fontWeight: 600,
              fontSize: 16,
              textAlign: "center",
              padding: "16px 24px",
            }}
          >
            {editIndex >= 0
              ? "Edit PCM PSTN Settings"
              : "Add PCM PSTN Settings"}
          </DialogTitle>

          <div style={{ borderBottom: "1px solid #e5e7eb" }}>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              variant="fullWidth"
              TabIndicatorProps={{ style: { backgroundColor: "#1e2d42" } }}
            >
              <Tab
                label="Span"
                sx={{
                  color: tab === 0 ? "#1e2d42" : "#475569",
                  fontWeight: 600,
                  textTransform: "none",
                  "&.Mui-selected": { color: "#1e2d42" },
                }}
              />
              <Tab
                label="Channels"
                sx={{
                  color: tab === 1 ? "#1e2d42" : "#475569",
                  fontWeight: 600,
                  textTransform: "none",
                  "&.Mui-selected": { color: "#1e2d42" },
                }}
              />
              <Tab
                label="Voice"
                sx={{
                  color: tab === 2 ? "#1e2d42" : "#475569",
                  fontWeight: 600,
                  textTransform: "none",
                  "&.Mui-selected": { color: "#1e2d42" },
                }}
              />
            </Tabs>
          </div>

          <DialogContent
            style={{
              padding: "20px 24px",
              backgroundColor: "#f8fafc",
            }}
          >
            <div className="flex flex-col gap-2 w-full">
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
              padding: "16px 24px",
              background: "#f1f5f9",
              borderTop: "1px solid #cbd5e1",
              display: "flex",
              justifyContent: "center",
              gap: 16,
            }}
          >
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={loading.save}
              sx={{
                background: "#1e2d42",
                color: "#fff",
                fontWeight: 600,
                fontSize: 13,
                textTransform: "none",
                padding: "6px 32px",
                minWidth: 120,
                "&:hover": { background: "#0f172a" },
                "&:disabled": { background: "#cbd5e1", color: "#64748b" },
              }}
              startIcon={
                loading.save ? (
                  <CircularProgress size={16} color="inherit" />
                ) : null
              }
            >
              {loading.save ? "Saving..." : editIndex >= 0 ? "Update" : "Save"}
            </Button>
            <Button
              variant="outlined"
              onClick={() => setIsModalOpen(false)}
              sx={{
                color: "#1e293b",
                borderColor: "#9ca3af",
                fontWeight: 600,
                fontSize: 13,
                textTransform: "none",
                padding: "6px 32px",
                minWidth: 100,
                "&:hover": { borderColor: "#1e293b", background: "#e2e8f0" },
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default PcmPstnPage;
