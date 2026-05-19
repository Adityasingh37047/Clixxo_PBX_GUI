import React, { useState, useRef, useEffect } from "react";
import {
  IP_CALL_IN_CALLERID_FIELDS,
  IP_CALL_IN_CALLERID_TABLE_COLUMNS,
  IP_CALL_IN_CALLERID_INITIAL_FORM,
} from "../constants/IPCallInCallerIDConstants";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import {
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select as MuiSelect,
  MenuItem,
  FormControl,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  listNumberManipulations,
  createNumberManipulation,
  updateNumberManipulation,
  deleteNumberManipulation,
  listGroups,
} from "../api/apiService";

// ── Color palette (matches CDR / SipRegisterPage) ──────────────────────────────
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

const LOCAL_STORAGE_KEY = "ipCallInCallerIdRules";

const IPCallInCallerID = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(IP_CALL_IN_CALLERID_INITIAL_FORM);
  const [rules, setRules] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };
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
      // console.log('SIP Trunk Groups API Response:', response);
      if (response.response && response.message) {
        const sipGroups = Array.isArray(response.message)
          ? response.message
          : [response.message];
        // console.log('SIP Groups data:', sipGroups);
        setSipTrunkGroups(sipGroups);

        // Set default value for new forms if no groups are loaded yet
        if (sipGroups.length > 0 && formData.call_initiator === "") {
          const firstGroupId =
            sipGroups[0].group_id || sipGroups[0].id || sipGroups[0];
          setFormData((prev) => ({ ...prev, call_initiator: firstGroupId }));
        }
      } else {
        // console.log('No SIP groups data found');
        setSipTrunkGroups([]);
      }
    } catch (error) {
      console.error("Error fetching SIP trunk groups:", error);
      if (error.message === "Network Error") {
        showMessage("error", "Network error. Please check your connection.");
      } else {
        showMessage(
          "error",
          error.message || "Failed to load SIP trunk groups",
        );
      }
      setSipTrunkGroups([]);
    }
  };

  // Fetch Number Manipulations
  const fetchNumberManipulations = async () => {
    setLoading((prev) => ({ ...prev, fetch: true }));
    try {
      // console.log('Fetching number manipulations...');
      const response = await listNumberManipulations("ip_in_callerid");
      // console.log('Fetch response:', response);

      if (response.response && response.message) {
        // console.log('Number manipulations data:', response.message);
        setRules(response.message);
      } else {
        // console.log('No data in response, setting empty array');
        setRules([]);
      }
    } catch (error) {
      console.error("Error fetching number manipulations:", error);
      if (error.message === "Network Error") {
        showMessage("error", "Network error. Please check your connection.");
      } else if (error.response?.status === 500) {
        showMessage(
          "error",
          "Server error. The number manipulations endpoint may have issues.",
        );
      } else {
        showMessage(
          "error",
          error.message || "Failed to load number manipulations",
        );
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
      const defaultForm = { ...IP_CALL_IN_CALLERID_INITIAL_FORM };
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
    // Validation: only these are mandatory
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
    if (!formData.with_original_calleeid) {
      alert("With Original CalleeID is required.");
      return;
    }

    // Normalize optional numeric fields to '0' when empty
    const normalized = {
      ...formData,
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
          // prefix_to_add: normalized.prefix_to_add,
          // suffix_to_add: normalized.suffix_to_add,
          description: normalized.description,
        };
        // console.log('Update request data:', updateData);
        response = await updateNumberManipulation(updateData, "ip_in_callerid");
        // console.log('Update response:', response);
        if (response.response) {
          alert(
            response.message || "Number manipulation updated successfully!",
          );

          // Try to reload data, but don't fail if it doesn't work
          try {
            await new Promise((resolve) => setTimeout(resolve, 500)); // Allow backend to process
            // console.log('Attempting to reload after successful update...');
            await fetchNumberManipulations();
            // console.log('Reload successful after update');
          } catch (reloadError) {
            // console.log('Updating item in local state as fallback');
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
        // console.log('Create request data:', normalized);
        response = await createNumberManipulation(normalized, "ip_in_callerid");
        // console.log('Create response:', response);
        if (response.response) {
          alert(
            response.message || "Number manipulation created successfully!",
          );

          // Try to reload data, but don't fail if it doesn't work
          try {
            await new Promise((resolve) => setTimeout(resolve, 500)); // Allow backend to process
            // console.log('Attempting to reload after successful creation...');
            await fetchNumberManipulations();
            // console.log('Reload successful after creation');
          } catch (reloadError) {
            // console.log('Adding item to local state as fallback');
            // Add the new item to local state
            const newItem = {
              ...normalized,
              id: Date.now(), // Temporary ID for local state
              manipulation_type: "ip_in_callerid",
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

  const allPageSelected =
    pagedRules.length > 0 &&
    pagedRules.every((r) => selectedIds.includes(r.id));
  const somePageSelected =
    pagedRules.some((r) => selectedIds.includes(r.id)) && !allPageSelected;

  const handleToggleRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleToggleAll = () => {
    const pageIds = pagedRules.map((r) => r.id);
    if (allPageSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleInverse = () => {
    const allIds = rules.map((r) => r.id);
    setSelectedIds(allIds.filter((id) => !selectedIds.includes(id)));
  };

  const handleUncheckAll = () => setSelectedIds([]);
  const handleCheckAll = () => setSelectedIds(rules.map((r) => r.id));

  const handleDelete = async () => {
    if (selectedIds.length === 0) {
      showMessage("error", "Please select items to delete");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedIds.length} selected item(s)?`,
    );
    if (!confirmed) return;

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const deletePromises = selectedIds.map(async (id) => {
        if (id) {
          return await deleteNumberManipulation(id);
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
        showMessage("success", `${successCount} item(s) deleted successfully`);
        try {
          await fetchNumberManipulations();
        } catch (reloadError) {
          setRules((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
        }
        setSelectedIds([]);
      }

      if (failCount > 0) {
        showMessage("error", `Failed to delete ${failCount} item(s)`);
      }
    } catch (error) {
      console.error("Error deleting selected items:", error);
      showMessage("error", error.message || "Failed to delete selected items");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleClearAll = async () => {
    if (rules.length === 0) {
      showMessage("error", "No data to clear");
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
      const deletePromises = rules.map(async (item) => {
        if (item && item.id) {
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
        showMessage("success", `All ${successCount} item(s) deleted successfully`);
        try {
          await fetchNumberManipulations();
        } catch (reloadError) {
          setRules([]);
        }
        setSelectedIds([]);
        setPage(1);
      }

      if (failCount > 0) {
        showMessage("error", `Failed to delete ${failCount} item(s)`);
      }
    } catch (error) {
      console.error("Error clearing all items:", error);
      showMessage("error", error.message || "Failed to clear all items");
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

  const rootStyle = {
    background: "#fff",
    minHeight: "calc(100vh - 128px)",
    padding: "40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: rules.length === 0 ? "center" : "flex-start",
    position: "relative",
    boxSizing: "border-box",
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

  // Add these sx objects for button hover effects and correct sizing
  const grayButtonSx = {
    background: "linear-gradient(to bottom, #e3e7ef 0%, #bfc6d1 100%)",
    color: "#222",
    fontWeight: 600,
    fontSize: 15,
    borderRadius: 1.5,
    minWidth: 110,
    boxShadow: "0 1px 2px rgba(0,0,0,0.10)",
    textTransform: "none",
    px: 2.25,
    py: 1,
    padding: "4px 18px",
    border: "1px solid #bbb",
    "&:hover": {
      background: "linear-gradient(to bottom, #bfc6d1 0%, #e3e7ef 100%)",
      color: "#222",
    },
  };
  const blueButtonSx = {
    background: "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 100%)",
    color: "#fff",
    fontWeight: 600,
    fontSize: 16,
    borderRadius: 1.5,
    minWidth: 120,
    boxShadow: "0 2px 8px rgba(62, 84, 117, 0.4)",
    textTransform: "none",
    px: 3,
    py: 1.5,
    padding: "6px 28px",
    border: "1px solid #5A6F8F",
    "&:hover": {
      background: "linear-gradient(to bottom, #3E5475 0%, #2f405c 100%)",
      color: "#fff",
    },
  };
  const paginationButtonSx = {
    background: "linear-gradient(to bottom, #e3e7ef 0%, #bfc6d1 100%)",
    color: "#222",
    fontWeight: 600,
    fontSize: 13,
    borderRadius: 1.5,
    minWidth: 60,
    boxShadow: "0 1px 2px rgba(0,0,0,0.10)",
    textTransform: "none",
    px: 1.25,
    py: 0.5,
    padding: "2px 10px",
    border: "1px solid #bbb",
    "&:hover": {
      background: "linear-gradient(to bottom, #bfc6d1 0%, #e3e7ef 100%)",
      color: "#222",
    },
  };

  // Get updated fields with SIP trunk groups
  const getUpdatedFields = () => {
    return IP_CALL_IN_CALLERID_FIELDS.map((field) => {
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
        backgroundColor: C.pageBg,
        minHeight: "calc(100vh - 80px)",
        padding: 16,
      }}
    >
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
            E1-PRI &rsaquo; Num Manipulate &rsaquo;{" "}
            <span style={{ color: C.valueText, fontWeight: 600 }}>
              IP Call In CallerID
            </span>
          </div>
        </div>

        {/* Message / Alert Banner */}
        {message.text && (
          <div style={{ marginBottom: 12 }}>
            <Alert
              severity={message.type}
              onClose={() => setMessage({ type: "", text: "" })}
            >
              {message.text}
            </Alert>
          </div>
        )}

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
          {/* Soft Slate-Blue Toolbar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              borderBottom: `1.5px solid ${C.cardBorder}`,
              background: "#DCE6F2",
            }}
          >
            {/* Left Section: Pagination Info pill & selection pill */}
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
                Page {page} · {rules.length} records
              </span>
              {selectedIds.length > 0 && (
                <span
                  style={{
                    background: "#e0f2fe",
                    color: C.accent,
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "3px 10px",
                    borderRadius: 20,
                    border: `0.5px solid ${C.accent}`,
                  }}
                >
                  {selectedIds.length} selected
                </span>
              )}
            </div>

            {/* Right Section: Core Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Btn
                variant="outline"
                onClick={handleInverse}
                disabled={rules.length === 0}
              >
                Inverse
              </Btn>
              <Btn
                variant="outline"
                onClick={handleUncheckAll}
                disabled={selectedIds.length === 0}
              >
                Clear Selection
              </Btn>
              <Btn
                variant="danger"
                onClick={handleDelete}
                disabled={selectedIds.length === 0 || loading.delete}
              >
                {loading.delete ? "Deleting..." : "Delete"}
              </Btn>
              <Btn
                variant="danger"
                onClick={handleClearAll}
                disabled={rules.length === 0 || loading.delete}
              >
                {loading.delete ? "Clearing..." : "Clear All"}
              </Btn>
              <Btn variant="outline" onClick={handleRefresh} disabled={loading.fetch}>
                {loading.fetch ? "Refreshing..." : "Refresh"}
              </Btn>
              <Btn
                variant="default"
                onClick={() => handleOpenModal()}
                style={{
                  background: "linear-gradient(135deg, #1e2d42 0%, #111827 100%)",
                  border: "none",
                  padding: "6px 16px",
                }}
              >
                + Add New Rule
              </Btn>
            </div>
          </div>

          <div style={{ position: "relative" }}>
            {loading.fetch ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 280,
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <CircularProgress size={36} sx={{ color: "#1e2d42" }} />
                  <div
                    style={{
                      marginTop: 12,
                      color: "#64748b",
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    Loading number manipulations...
                  </div>
                </div>
              </div>
            ) : rules.length === 0 ? (
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
                    color: "#64748b",
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 16,
                  }}
                >
                  No available number manipulation rule (IP Call In CallerID)!
                </div>
                <Btn
                  variant="default"
                  onClick={() => handleOpenModal()}
                  style={{
                    background: "linear-gradient(135deg, #1e2d42 0%, #111827 100%)",
                    border: "none",
                    padding: "8px 24px",
                    fontSize: 12,
                  }}
                >
                  + Add New Rule
                </Btn>
              </div>
            ) : (
              <>
                <div
                  ref={tableScrollRef}
                  onScroll={handleTableScroll}
                  className="scrollbar-hide"
                  style={{
                    overflowX: "auto",
                    overflowY: "auto",
                    maxHeight: 460,
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      minWidth: 1400,
                    }}
                  >
                    <thead>
                      <tr>
                        <TH style={{ width: 40 }}>
                          <input
                            type="checkbox"
                            checked={allPageSelected}
                            ref={(el) => {
                              if (el) el.indeterminate = somePageSelected;
                            }}
                            onChange={handleToggleAll}
                            style={{ cursor: "pointer", accentColor: "#1e2d42" }}
                          />
                        </TH>
                        <TH style={{ width: 50 }}>#</TH>
                        {IP_CALL_IN_CALLERID_TABLE_COLUMNS.slice(2).map((c) => (
                          <TH key={c.key}>{c.label}</TH>
                        ))}
                        <TH style={{ width: 70 }}>Action</TH>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedRules.map((item, idx) => {
                        const realIdx = (page - 1) * itemsPerPage + idx;
                        const isSelected = selectedIds.includes(item.id);
                        const rowBg = isSelected
                          ? "#f0f9ff"
                          : idx % 2 === 1
                          ? "#f8fafc"
                          : "#ffffff";

                        return (
                          <tr
                            key={item.id || realIdx}
                            style={{
                              background: rowBg,
                              borderBottom: `0.5px solid #e2e8f0`,
                              transition: "background-color 0.15s ease",
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
                            <td
                              style={{
                                borderRight: "0.5px solid #e2e8f0",
                                padding: "7px 8px",
                                textAlign: "center",
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleRow(item.id)}
                                style={{ cursor: "pointer", accentColor: "#1e2d42" }}
                              />
                            </td>
                            <td
                              style={{
                                borderRight: "0.5px solid #e2e8f0",
                                padding: "7px 8px",
                                fontSize: 12,
                                color: C.valueText,
                                textAlign: "center",
                              }}
                            >
                              {realIdx + 1}
                            </td>
                            <td
                              style={{
                                borderRight: "0.5px solid #e2e8f0",
                                padding: "7px 8px",
                                fontSize: 12,
                                color: C.valueText,
                                textAlign: "center",
                              }}
                            >
                              SIP Trunk Group [{item.call_initiator}]
                            </td>
                            <td
                              style={{
                                borderRight: "0.5px solid #e2e8f0",
                                padding: "7px 8px",
                                fontSize: 12,
                                color: C.valueText,
                                textAlign: "center",
                              }}
                            >
                              {item.callerid_prefix}
                            </td>
                            <td
                              style={{
                                borderRight: "0.5px solid #e2e8f0",
                                padding: "7px 8px",
                                fontSize: 12,
                                color: C.valueText,
                                textAlign: "center",
                              }}
                            >
                              {item.calleeid_prefix}
                            </td>
                            <td
                              style={{
                                borderRight: "0.5px solid #e2e8f0",
                                padding: "7px 8px",
                                fontSize: 12,
                                color: C.valueText,
                                textAlign: "center",
                              }}
                            >
                              {item.stripped_digits_from_right}
                            </td>
                            <td
                              style={{
                                borderRight: "0.5px solid #e2e8f0",
                                padding: "7px 8px",
                                fontSize: 12,
                                color: C.valueText,
                                textAlign: "center",
                              }}
                            >
                              {item.reserved_digits_from_right}
                            </td>
                            <td
                              style={{
                                padding: "7px 8px",
                                textAlign: "center",
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "center" }}>
                                <EditDocumentIcon
                                  style={{
                                    cursor: "pointer",
                                    color: "#1e2d42",
                                    fontSize: 18,
                                    transition: "transform 0.15s ease",
                                  }}
                                  onClick={() => handleOpenModal(item, realIdx)}
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.transform = "scale(1.15)")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.transform = "scale(1)")
                                  }
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Custom scrollbar matching SipRegisterPage */}
                {showCustomScrollbar && (
                  <div
                    style={{
                      width: "100%",
                      background: "#f8fafc",
                      display: "flex",
                      alignItems: "center",
                      height: 24,
                      borderTop: `1px solid ${C.cardBorder}`,
                      padding: "0 12px",
                      boxSizing: "border-box",
                    }}
                  >
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        background: "#fff",
                        border: `1px solid ${C.cardBorder}`,
                        borderRadius: 4,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        color: C.labelText,
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                      onClick={() => handleArrowClick("left")}
                    >
                      &#9664;
                    </div>
                    <div
                      style={{
                        flex: 1,
                        height: 8,
                        background: "#e2e8f0",
                        borderRadius: 4,
                        position: "relative",
                        margin: "0 8px",
                        overflow: "hidden",
                      }}
                      onClick={handleScrollbarDrag}
                    >
                      <div
                        style={{
                          position: "absolute",
                          height: 8,
                          background: C.mutedText,
                          borderRadius: 4,
                          cursor: "pointer",
                          top: 0,
                          width: thumbWidth,
                          left: thumbLeft,
                        }}
                        draggable
                        onDrag={handleScrollbarDrag}
                      />
                    </div>
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        background: "#fff",
                        border: `1px solid ${C.cardBorder}`,
                        borderRadius: 4,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        color: C.labelText,
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                      onClick={() => handleArrowClick("right")}
                    >
                      &#9654;
                    </div>
                  </div>
                )}

                {/* Pagination Footer matching SipRegisterPage */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    background: "#f3f4f6",
                    borderTop: `1px solid ${C.cardBorder}`,
                  }}
                >
                  <span style={{ fontSize: 11, color: C.mutedText }}>
                    Showing {pagedRules.length} record
                    {pagedRules.length !== 1 ? "s" : ""} on page {page}
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page <= 1}
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
                      disabled={page >= totalPages}
                      variant="outline"
                    >
                      Next →
                    </Btn>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth={false}
        className="z-50"
        PaperProps={{
          sx: {
            width: 600,
            maxWidth: "95vw",
            mx: "auto",
            p: 0,
            borderRadius: 2,
            boxShadow:
              "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
            overflow: "hidden",
          },
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
            textAlign: "center",
            padding: "16px 24px",
          }}
        >
          {formData.originalIndex !== undefined
            ? "Edit IP Call In CallerID"
            : "Add IP Call In CallerID"}
        </DialogTitle>
        <DialogContent
          style={{
            padding: "20px 24px",
            backgroundColor: C.pageBg,
          }}
        >
          <div
            style={{
              background: "#fff",
              border: `1px solid ${C.cardBorder}`,
              borderRadius: 6,
              padding: "16px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            {getUpdatedFields().map((field) => (
              <div
                key={field.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  minHeight: 32,
                }}
              >
                <label
                  style={{
                    fontSize: 13,
                    color: C.labelText,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    width: 180,
                  }}
                >
                  {field.label}
                </label>
                <div style={{ flex: 1 }}>
                  {field.type === "select" ? (
                    <FormControl size="small" fullWidth>
                      <MuiSelect
                        value={formData[field.name] || ""}
                        onChange={(e) =>
                          handleInputChange({
                            target: { name: field.name, value: e.target.value },
                          })
                        }
                        variant="outlined"
                        sx={{
                          fontSize: 13,
                          borderRadius: 1,
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
                        {field.options.map((opt) => (
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
                  ) : (
                    <TextField
                      type={field.type || "text"}
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={handleInputChange}
                      size="small"
                      fullWidth
                      variant="outlined"
                      inputProps={{
                        style: { fontSize: 13, padding: "6px 10px" },
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 1,
                          fontSize: 13,
                          "& fieldset": { borderColor: "#cbd5e1" },
                          "& hover fieldset": { borderColor: "#94a3b8" },
                          "&.Mui-focused fieldset": { borderColor: "#1e2d42" },
                        },
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
        <DialogActions
          style={{
            padding: "16px 24px",
            background: "#f1f5f9",
            borderTop: `1px solid ${C.cardBorder}`,
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
          }}
        >
          <Button
            variant="outlined"
            onClick={handleCloseModal}
            sx={{
              color: "#1e293b",
              borderColor: "#9ca3af",
              fontWeight: 600,
              fontSize: 13,
              textTransform: "none",
              padding: "6px 24px",
              borderRadius: 1.5,
              "&:hover": { borderColor: "#1e293b", background: "#e2e8f0" },
            }}
          >
            Close
          </Button>
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
              padding: "6px 24px",
              borderRadius: 1.5,
              "&:hover": { background: "#0f172a" },
              "&:disabled": { background: "#cbd5e1", color: "#64748b" },
            }}
          >
            {loading.save ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default IPCallInCallerID;
