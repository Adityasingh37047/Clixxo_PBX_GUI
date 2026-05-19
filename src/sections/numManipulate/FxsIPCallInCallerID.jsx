import React, { useState, useRef, useEffect } from "react";
import {
  IP_CALL_IN_CALLERID_FIELDS,
  IP_CALL_IN_CALLERID_TABLE_COLUMNS,
  IP_CALL_IN_CALLERID_INITIAL_FORM,
} from "./constants/IPCallInCallerIDConstants";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import {
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select as MuiSelect,
  MenuItem,
  FormControl,
  CircularProgress,
} from "@mui/material";

// Stub functions when API imports are commented out
const listNumberManipulations = async () => ({ response: true, message: [] });
const createNumberManipulation = async () => ({
  response: true,
  message: "Created successfully",
});
const updateNumberManipulation = async () => ({
  response: true,
  message: "Updated successfully",
});
const deleteNumberManipulation = async () => ({
  response: true,
  message: "Deleted successfully",
});
const listGroups = async () => ({ response: true, message: [] });

// ── Color Palette (From Source) ───────────────────────────────────────────────
const C = {
  pageBg: "#eef2f7",
  cardBg: "#ffffff",
  cardBorder: "#9ca3af",
  labelText: "#1e293b",
  valueText: "#1e293b",
  mutedText: "#94a3b8",
  accent: "#1e293b",
  errorRed: "#dc2626",
};

// ── Shared UI Components (From Source) ────────────────────────────────────────
const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  title,
  type = "button",
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
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
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

const FieldRow = ({ label, children, style }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, ...style }}>
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: 180,
        flexShrink: 0,
      }}
    >
      {label}
    </label>
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);

const inputStyle = {
  height: 32,
  padding: "0 8px",
  fontSize: 13,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 4,
  outline: "none",
  backgroundColor: "#fff",
  color: C.valueText,
  boxSizing: "border-box",
  width: "100%",
};

// ── Main Component ────────────────────────────────────────────────────────────
const IPCallInCallerID = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(IP_CALL_IN_CALLERID_INITIAL_FORM);
  const [rules, setRules] = useState([]);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(rules.length / itemsPerPage));
  const pagedRules = rules.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );
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

  // Fetch Number Manipulations
  const fetchNumberManipulations = async () => {
    setLoading((prev) => ({ ...prev, fetch: true }));
    try {
      const response = await listNumberManipulations("ip_in_callerid");
      if (response.response && response.message) {
        setRules(response.message);
      } else {
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
      // Adding new item
      setFormData({ ...IP_CALL_IN_CALLERID_INITIAL_FORM });
      setEditIndex(null);
    }
    setIsModalOpen(true);
  };
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSave = async () => {
    // Validation
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
        const updateData = {
          id: editIndex,
          call_initiator: normalized.call_initiator,
          callerid_prefix: normalized.callerid_prefix,
          calleeid_prefix: normalized.calleeid_prefix,
          with_original_calleeid: normalized.with_original_calleeid || "No",
          stripped_digits_from_left: normalized.stripped_digits_from_left,
          stripped_digits_from_right: normalized.stripped_digits_from_right,
          reserved_digits_from_right: normalized.reserved_digits_from_right,
          prefix_to_add: normalized.prefix_to_add,
          suffix_to_add: normalized.suffix_to_add,
          description: normalized.description,
        };
        response = await updateNumberManipulation(updateData, "ip_in_callerid");
        if (response.response) {
          alert(
            response.message || "Number manipulation updated successfully!",
          );
          try {
            await new Promise((resolve) => setTimeout(resolve, 500));
            await fetchNumberManipulations();
          } catch (reloadError) {
            setRules((prev) =>
              prev.map((rule) =>
                rule.id === editIndex ? { ...rule, ...normalized } : rule,
              ),
            );
          }
        } else {
          alert("Failed to update number manipulation");
        }
      } else {
        response = await createNumberManipulation(normalized, "ip_in_callerid");
        if (response.response) {
          alert(
            response.message || "Number manipulation created successfully!",
          );
          try {
            await new Promise((resolve) => setTimeout(resolve, 500));
            await fetchNumberManipulations();
          } catch (reloadError) {
            const newItem = {
              ...normalized,
              id: Date.now(),
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

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selected.length} selected item(s)?`,
    );
    if (!confirmed) return;

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const deletePromises = selected.map(async (idx) => {
        const item = rules[idx];
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
        alert(`${successCount} item(s) deleted successfully`);
        try {
          await fetchNumberManipulations();
        } catch (reloadError) {
          const selectedItems = selected.map((idx) => rules[idx]);
          const selectedIds = selectedItems.map((item) => item.id);
          setRules((prev) =>
            prev.filter((item) => !selectedIds.includes(item.id)),
          );
        }
        setSelected([]);
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
        alert(`All ${successCount} item(s) deleted successfully`);
        try {
          await fetchNumberManipulations();
        } catch (reloadError) {
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

  useEffect(() => {
    fetchNumberManipulations();
  }, []);

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
            FXS &rsaquo; Num Manipulate &rsaquo;{" "}
            <span style={{ color: C.valueText, fontWeight: 600 }}>
              IP Call In CallerID
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
          <div style={{}}>
            {/* <SectionHeading title="IP Call In CallerID" /> */}
            {loading.fetch ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <CircularProgress size={40} sx={{ color: "#1e2d42" }} />
                  <div className="mt-3 text-gray-600 font-medium">
                    Loading number manipulations...
                  </div>
                </div>
              </div>
            ) : rules.length === 0 ? (
              <div
                className="w-full h-full flex flex-col items-center justify-center"
                style={{ minHeight: "200px" }}
              >
                <div className="text-gray-600 text-sm font-semibold mb-4 text-center">
                  No available number manipulation rule!{" "}
                </div>

                <Btn
                  onClick={() => handleOpenModal()}
                  style={{
                    fontSize: 13,
                    padding: "6px 20px",
                  }}
                >
                  + Add New
                </Btn>
              </div>
            ) : (
              <div style={{ maxWidth: "100%", margin: "0 auto" }}>
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
                    FXS &rsaquo; Num Manipulate &rsaquo;{" "}
                    <span style={{ color: C.valueText, fontWeight: 600 }}>
                      IP Call In CallerID
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
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
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
                        IP Call In CallerID · {rules.length} records
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
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <Btn
                        onClick={handleCheckAll}
                        disabled={loading.delete}
                        variant="outline"
                      >
                        Check All
                      </Btn>
                      <Btn
                        onClick={handleUncheckAll}
                        disabled={loading.delete}
                        variant="outline"
                      >
                        Uncheck All
                      </Btn>
                      <Btn
                        onClick={handleInverse}
                        disabled={loading.delete}
                        variant="outline"
                      >
                        Inverse
                      </Btn>
                      <Btn
                        onClick={handleDelete}
                        disabled={loading.delete || selected.length === 0}
                        variant="danger"
                      >
                        {loading.delete ? "Deleting..." : "🗑 Delete"}
                      </Btn>
                      <Btn
                        onClick={handleClearAll}
                        disabled={loading.delete || rules.length === 0}
                        variant="danger"
                      >
                        {loading.delete ? "Clearing..." : "Clear All"}
                      </Btn>
                      <Btn
                        onClick={handleRefresh}
                        disabled={loading.fetch}
                        variant="outline"
                      >
                        {loading.fetch ? "Refreshing..." : "Refresh"}
                      </Btn>
                      <Btn
                        onClick={() => handleOpenModal()}
                        disabled={loading.save}
                        variant="accent"
                      >
                        + Add New
                      </Btn>
                    </div>
                  </div>

                  {/* Table Container with Custom Scrollbar preserved */}
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div
                      ref={tableScrollRef}
                      onScroll={handleTableScroll}
                      style={{
                        overflowX: "auto",
                        overflowY: "auto",
                        maxHeight: 400,
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
                            <TH
                              style={{
                                width: 40,
                                position: "sticky",
                                top: 0,
                                zIndex: 10,
                              }}
                            >
                              Check
                            </TH>
                            <TH
                              style={{
                                width: 40,
                                position: "sticky",
                                top: 0,
                                zIndex: 10,
                              }}
                            >
                              #
                            </TH>
                            {IP_CALL_IN_CALLERID_TABLE_COLUMNS.map((col) => (
                              <TH
                                key={col.key}
                                style={{
                                  position: "sticky",
                                  top: 0,
                                  zIndex: 10,
                                }}
                              >
                                {col.label}
                              </TH>
                            ))}
                            <TH
                              style={{
                                width: 70,
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
                            const rowBg = isSelected
                              ? "#f0f9ff"
                              : idx % 2 === 1
                                ? "#f8fafc"
                                : "#ffffff";
                            return (
                              <tr
                                key={realIdx}
                                style={{
                                  background: rowBg,
                                  borderBottom: "0.5px solid #9ca3af",
                                  transition: "background 0.1s ease",
                                }}
                                onMouseEnter={(e) => {
                                  if (!isSelected)
                                    e.currentTarget.style.background =
                                      "#f0f9ff";
                                }}
                                onMouseLeave={(e) => {
                                  if (!isSelected)
                                    e.currentTarget.style.background = rowBg;
                                }}
                              >
                                <td
                                  style={{
                                    textAlign: "center",
                                    padding: "4px 8px",
                                    borderRight: "0.5px solid #edf2f7",
                                  }}
                                >
                                  <Checkbox
                                    size="small"
                                    checked={isSelected}
                                    onChange={() => handleSelectRow(idx)}
                                    sx={{
                                      padding: "1px",
                                      color: C.accent,
                                      "&.Mui-checked": { color: C.accent },
                                    }}
                                  />
                                </td>
                                <td
                                  style={{
                                    textAlign: "center",
                                    fontSize: 11,
                                    color: C.mutedText,
                                    padding: "7px 8px",
                                    borderRight: "0.5px solid #edf2f7",
                                  }}
                                >
                                  {realIdx + 1}
                                </td>
                                {IP_CALL_IN_CALLERID_TABLE_COLUMNS.map(
                                  (col) => (
                                    <td
                                      key={col.key}
                                      style={{
                                        textAlign: "center",
                                        fontSize: 12,
                                        padding: "7px 8px",
                                        color: C.valueText,
                                        borderRight: "0.5px solid #edf2f7",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {item[col.key] !== undefined &&
                                      item[col.key] !== null &&
                                      item[col.key] !== ""
                                        ? String(item[col.key])
                                        : "--"}
                                    </td>
                                  ),
                                )}
                                <td
                                  style={{
                                    textAlign: "center",
                                    padding: "4px 8px",
                                    borderRight: "0.5px solid #edf2f7",
                                  }}
                                >
                                  <Btn
                                    onClick={() =>
                                      handleOpenModal(item, item.id)
                                    }
                                    variant="outline"
                                    style={{
                                      fontSize: 10,
                                      padding: "3px 10px",
                                      margin: "0 auto",
                                    }}
                                  >
                                    <EditDocumentIcon
                                      style={{ fontSize: 12, marginRight: 2 }}
                                    />{" "}
                                    Edit
                                  </Btn>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Custom Scrollbar Retained but styled for the new theme */}
                    {(() => {
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
                          ? (scrollState.left /
                              (scrollState.scrollWidth - scrollState.width)) *
                            (scrollState.width - thumbWidth - 16)
                          : 0;
                      return (
                        showCustomScrollbar && (
                          <div
                            style={{
                              width: "100%",
                              margin: "0 auto",
                              background: "#f4f6fa",
                              display: "flex",
                              alignItems: "center",
                              height: 24,
                              borderBottom: `1px solid ${C.cardBorder}`,
                              padding: "0 4px",
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
                                fontSize: 10,
                                color: C.mutedText,
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
                                height: 12,
                                background: "#eef2f7",
                                borderRadius: 8,
                                position: "relative",
                                margin: "0 4px",
                                overflow: "hidden",
                              }}
                              onClick={handleScrollbarDrag}
                            >
                              <div
                                style={{
                                  position: "absolute",
                                  height: 12,
                                  background: C.cardBorder,
                                  borderRadius: 8,
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
                                fontSize: 10,
                                color: C.mutedText,
                                cursor: "pointer",
                                userSelect: "none",
                              }}
                              onClick={() => handleArrowClick("right")}
                            >
                              &#9654;
                            </div>
                          </div>
                        )
                      );
                    })()}
                  </div>

                  {/* Footer Pagination */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      background: "#f8fafc",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <span style={{ fontSize: 11, color: C.mutedText }}>
                      Showing {pagedRules.length} records of {rules.length}{" "}
                      Total ({itemsPerPage} / Page)
                    </span>
                    <div
                      style={{ display: "flex", gap: 8, alignItems: "center" }}
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
                        style={{
                          fontSize: 11,
                          color: C.mutedText,
                          marginLeft: 8,
                        }}
                      >
                        Go to Page:
                      </span>
                      <select
                        style={{
                          fontSize: 11,
                          padding: "2px 6px",
                          borderRadius: 4,
                          border: `1px solid ${C.cardBorder}`,
                          background: "#fff",
                          color: C.valueText,
                          outline: "none",
                        }}
                        value={page}
                        onChange={(e) =>
                          handlePageChange(Number(e.target.value))
                        }
                      >
                        {Array.from({ length: totalPages }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Add/Edit Modal ── */}
            <Dialog
              open={isModalOpen}
              onClose={handleCloseModal}
              maxWidth={false}
              PaperProps={{
                sx: { width: 550, maxWidth: "95vw", borderRadius: 2 },
              }}
              disableRestoreFocus
              disableEnforceFocus
            >
              <DialogTitle
                style={{
                  background: "#1e2d42",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 16,
                  textAlign: "center",
                  padding: "14px 24px",
                }}
              >
                {editIndex !== null
                  ? "Edit IP Call In CallerID"
                  : "Add IP Call In CallerID"}
              </DialogTitle>
              <DialogContent
                style={{ padding: "20px 24px", backgroundColor: C.pageBg }}
              >
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  <div
                    style={{
                      background: "#fff",
                      border: `1px solid ${C.cardBorder}`,
                      borderRadius: 6,
                      padding: 16,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: C.labelText,
                        marginBottom: 14,
                        borderBottom: `1px solid ${C.cardBorder}`,
                        paddingBottom: 6,
                      }}
                    >
                      Configuration
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 14,
                      }}
                    >
                      {IP_CALL_IN_CALLERID_FIELDS.map((field) => (
                        <FieldRow key={field.name} label={`${field.label}:`}>
                          {field.type === "select" ? (
                            <FormControl size="small" fullWidth>
                              <MuiSelect
                                value={formData[field.name] || ""}
                                onChange={(e) =>
                                  handleInputChange({
                                    target: {
                                      name: field.name,
                                      value: e.target.value,
                                    },
                                  })
                                }
                                sx={{
                                  fontSize: 13,
                                  height: 32,
                                  backgroundColor: "#fff",
                                  "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: C.cardBorder,
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
                            <input
                              type={field.type || "text"}
                              name={field.name}
                              value={formData[field.name] || ""}
                              onChange={handleInputChange}
                              style={inputStyle}
                            />
                          )}
                        </FieldRow>
                      ))}
                    </div>
                  </div>
                </div>
              </DialogContent>
              <DialogActions
                style={{
                  padding: "16px 24px",
                  background: C.pageBg,
                  borderTop: `1px solid ${C.cardBorder}`,
                  justifyContent: "center",
                  gap: 12,
                }}
              >
                <Btn
                  onClick={handleSave}
                  disabled={loading.save}
                  style={{ padding: "8px 36px", fontSize: 13 }}
                >
                  {loading.save ? "Saving..." : "Save"}
                </Btn>
                <Btn
                  onClick={handleCloseModal}
                  disabled={loading.save}
                  variant="outline"
                  style={{ padding: "8px 36px", fontSize: 13 }}
                >
                  Cancel
                </Btn>
              </DialogActions>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IPCallInCallerID;
