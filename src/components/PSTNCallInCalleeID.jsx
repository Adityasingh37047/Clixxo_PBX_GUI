import React, { useState, useRef, useEffect } from "react";
import {
  PSTN_CALL_IN_CALLEEID_FIELDS,
  PSTN_CALL_IN_CALLEEID_TABLE_COLUMNS,
  PSTN_CALL_IN_CALLEEID_INITIAL_FORM,
} from "../constants/PSTNCallInCalleeIDConstants";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select as MuiSelect,
  MenuItem,
  FormControl,
  CircularProgress,
} from "@mui/material";
import {
  listNumberManipulations,
  createNumberManipulation,
  updateNumberManipulation,
  deleteNumberManipulation,
  listPstnGroups,
} from "../api/apiService";

const LOCAL_STORAGE_KEY = "pstnCallInCalleeIdRules";

const C = {
  pageBg: "#eef2f7",
  cardBg: "#ffffff",
  cardBorder: "#cbd5e1",
  labelText: "#1e293b",
  valueText: "#1e293b",
  mutedText: "#94a3b8",
  accent: "#1e293b",
  successGreen: "#16a34a",
  errorRed: "#dc2626",
  amber: "#d97706",
};

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
        padding: "5px 12px",
        borderRadius: 4,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.1s ease",
        outline: "none",
        boxSizing: "border-box",
        height: 26,
        textTransform: "none",
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = "translateY(-0.5px)";
          e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = "none";
          e.currentTarget.style.boxShadow = "none";
        }
      }}
    >
      {children}
    </button>
  );
};

const TH = ({ children, style: extraStyle }) => (
  <th
    style={{
      borderBottom: `1px solid ${C.cardBorder}`,
      borderRight: `0.5px solid ${C.cardBorder}`,
      padding: "10px 8px",
      fontSize: 11,
      fontWeight: 800,
      color: "#475569",
      textAlign: "center",
      background: "#f3f4f6",
      textTransform: "uppercase",
      letterSpacing: "0.03em",
      userSelect: "none",
      ...extraStyle,
    }}
  >
    {children}
  </th>
);

const PSTNCallInCalleeID = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(PSTN_CALL_IN_CALLEEID_INITIAL_FORM);
  const [rules, setRules] = useState([]);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(rules.length / itemsPerPage));
  const pagedRules = rules.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );
  const [pcmTrunkGroups, setPcmTrunkGroups] = useState([]);
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

  // Fetch PCM Trunk Groups for Call Initiator dropdown
  const fetchPcmTrunkGroups = async () => {
    try {
      const response = await listPstnGroups();
      console.log("PCM Trunk Groups API Response:", response);
      if (response.response && response.message) {
        const pcmGroups = Array.isArray(response.message)
          ? response.message
          : [response.message];
        console.log("PCM Groups data:", pcmGroups);
        setPcmTrunkGroups(pcmGroups);

        // Set default value for new forms if no groups are loaded yet
        if (pcmGroups.length > 0 && formData.call_initiator === "") {
          const firstGroupId =
            pcmGroups[0].group_id || pcmGroups[0].id || pcmGroups[0];
          setFormData((prev) => ({
            ...prev,
            call_initiator: String(firstGroupId),
          }));
        }
      } else {
        console.log("No PCM groups data found");
        setPcmTrunkGroups([]);
      }
    } catch (error) {
      console.error("Error fetching PCM trunk groups:", error);
      if (error.message === "Network Error") {
        alert("Network error. Please check your connection.");
      } else {
        alert(error.message || "Failed to load PCM trunk groups");
      }
      setPcmTrunkGroups([]);
    }
  };

  // Fetch Number Manipulations
  const fetchNumberManipulations = async () => {
    setLoading((prev) => ({ ...prev, fetch: true }));
    try {
      console.log("Fetching number manipulations...");
      const response = await listNumberManipulations("pstn_in_calleeid");
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
      const defaultForm = { ...PSTN_CALL_IN_CALLEEID_INITIAL_FORM };
      if (pcmTrunkGroups.length > 0) {
        const firstGroupId =
          pcmTrunkGroups[0].group_id ||
          pcmTrunkGroups[0].id ||
          pcmTrunkGroups[0];
        defaultForm.call_initiator = String(firstGroupId);
      }
      setFormData(defaultForm);
      setEditIndex(null);
    }
    setIsModalOpen(true);
  };
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSave = async () => {
    // Validation: required fields including With Original CalleeID
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
          prefix_to_add: normalized.prefix_to_add,
          suffix_to_add: normalized.suffix_to_add,
          description: normalized.description,
        };
        console.log("Update request data:", updateData);
        response = await updateNumberManipulation(
          updateData,
          "pstn_in_calleeid",
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
          "pstn_in_calleeid",
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
              manipulation_type: "pstn_in_calleeid",
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

  // Load data on component mount
  useEffect(() => {
    fetchNumberManipulations();
    fetchPcmTrunkGroups();
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

  // Helper: label is PCM Trunk Group [group_id]
  const getPcmGroupIdLabel = (groupId) => {
    const group = pcmTrunkGroups.find(
      (g) => String(g.group_id || g.id || g) === String(groupId),
    );
    const gid = group ? (group.group_id ?? group.id ?? groupId) : groupId;
    return String(gid);
  };

  // Get updated fields with PCM trunk groups
  const getUpdatedFields = () => {
    return PSTN_CALL_IN_CALLEEID_FIELDS.map((field) => {
      if (field.name === "call_initiator") {
        return {
          ...field,
          options: pcmTrunkGroups.map((group) => ({
            value: String(group.group_id ?? group.id ?? group),
            label: `PCM Trunk Group [${String(group.group_id ?? group.id ?? group)}]`,
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
      <div style={{ width: "100%", maxWidth: "100%", margin: "0 auto" }}>
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
              PSTN Call In CalleeID
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
              borderBottom: `1.5px solid ${C.cardBorder}`,
              background: "#DCE6F2",
              flexWrap: "wrap",
              gap: 8,
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
              {selected.length > 0 && (
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
                  {selected.length} selected
                </span>
              )}
            </div>

            {/* Right Section: Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Btn
                variant="outline"
                onClick={handleInverse}
                disabled={loading.delete || rules.length === 0}
              >
                Inverse
              </Btn>
              <Btn
                variant="outline"
                onClick={handleUncheckAll}
                disabled={loading.delete || selected.length === 0}
              >
                Clear Selection
              </Btn>
              <Btn
                variant="danger"
                onClick={handleDelete}
                disabled={loading.delete || selected.length === 0}
              >
                {loading.delete ? "Deleting..." : "🗑 Delete"}
              </Btn>
              <Btn
                variant="danger"
                onClick={handleClearAll}
                disabled={loading.delete || rules.length === 0}
              >
                {loading.delete ? "Clearing..." : "Clear All"}
              </Btn>
              <Btn
                variant="outline"
                onClick={handleRefresh}
                disabled={loading.fetch}
              >
                {loading.fetch ? "Refreshing..." : "Refresh"}
              </Btn>
              <Btn
                variant="accent"
                onClick={() => handleOpenModal()}
                disabled={loading.fetch}
                style={{
                  background: "linear-gradient(135deg, #1e2d42 0%, #111827 100%)",
                  color: "#fff",
                  border: "none",
                  padding: "6px 16px",
                }}
              >
                + Add New
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
                  <CircularProgress size={28} style={{ color: C.accent }} />
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
                  No available number manipulation rule (PSTN Call In CalleeID)!
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
                            checked={rules.length > 0 && selected.length === rules.length}
                            ref={(el) => {
                              if (el)
                                el.indeterminate =
                                  selected.length > 0 && selected.length < rules.length;
                            }}
                            onChange={(e) => {
                              if (e.target.checked) handleCheckAll();
                              else handleUncheckAll();
                            }}
                            style={{ cursor: "pointer", accentColor: "#1e2d42" }}
                          />
                        </TH>
                        <TH style={{ width: 50 }}>#</TH>
                        <TH>Call Initiator</TH>
                        <TH>CallerID Prefix</TH>
                        <TH>CalleeID Prefix</TH>
                        <TH>Stripped Digits from Right</TH>
                        <TH>Reserved Digits from Right</TH>
                        <TH style={{ width: 60 }}>Modify</TH>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedRules.map((item, idx) => {
                        const realIdx = (page - 1) * itemsPerPage + idx;
                        const isSelected = selected.includes(realIdx);
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
                                onChange={() => handleSelectRow(idx)}
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
                              PCM Trunk Group [{getPcmGroupIdLabel(item.call_initiator)}]
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

                {/* Custom scrollbar */}
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
            overflow: "hidden",
            boxShadow:
              "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
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
          {editIndex !== null
            ? "Edit PSTN Call In CalleeID"
            : "Add PSTN Call In CalleeID"}
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
                          "& :hover fieldset": { borderColor: "#94a3b8" },
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

export default PSTNCallInCalleeID;
