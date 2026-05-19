import React, { useState, useRef, useEffect } from "react";
import {
  ROUTE_IP_IP_FIELDS,
  ROUTE_IP_IP_INITIAL_FORM,
  ROUTE_IP_IP_TABLE_COLUMNS,
} from "../constants/RouteIPIPConstants";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select as MuiSelect,
  MenuItem,
  Alert,
  CircularProgress,
  FormControl,
} from "@mui/material";
import {
  listIpPstnRoutes,
  createIpPstnRoute,
  updateIpPstnRoute,
  deleteIpPstnRoute,
  listGroups,
} from "../api/apiService";

// ── Color Palette (From RouteIpPstnPage) ──────────────────────────────────────
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

// ── Shared UI Components ──────────────────────────────────────────────────────
const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  title,
}) => {
  const variants = {
    default: {
      background: "#1e2d42",
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

const FieldRow = ({ label, children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: 170,
        flexShrink: 0,
      }}
    >
      {label}
    </label>
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);

const RouteIPIPPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(ROUTE_IP_IP_INITIAL_FORM);
  const [rules, setRules] = useState([]);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(rules.length / itemsPerPage));
  const pagedRules = rules.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );
  const tableScrollRef = useRef(null);
  const [scrollState, setScrollState] = useState({
    left: 0,
    width: 0,
    scrollWidth: 0,
  });
  const [sipTrunkGroups, setSipTrunkGroups] = useState([]);
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false,
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [validationMessage, setValidationMessage] = useState("");

  // Message handling
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  // Modal logic
  const handleOpenModal = (item = null, index = -1) => {
    setValidationMessage(""); // Clear any existing validation message
    if (item) {
      setFormData({ ...item, originalIndex: index });
    } else {
      // Set empty values for call source and destination to show "Please select" placeholder
      setFormData({
        ...ROUTE_IP_IP_INITIAL_FORM,
        callSource: "",
        callDestination: "",
        originalIndex: -1,
      });
    }
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setValidationMessage(""); // Clear validation message when closing modal
    setIsModalOpen(false);
  };
  const validatePrefix = (prefix) => /^[\d*]+$/.test(prefix || "");

  const handleSave = async () => {
    const { originalIndex, ...dataToSave } = formData;
    if (!validatePrefix(dataToSave.callerIdPrefix)) {
      showMessage(
        "error",
        "Invalid CallerID Prefix! Only numbers (0-9) and asterisks (*) are allowed.",
      );
      return;
    }
    if (!validatePrefix(dataToSave.calleeIdPrefix)) {
      showMessage(
        "error",
        "Invalid CalleeID Prefix! Only numbers (0-9) and asterisks (*) are allowed.",
      );
      return;
    }

    const apiData = {
      call_source: dataToSave.callSource,
      caller_id_prefix: dataToSave.callerIdPrefix,
      callee_id_prefix: dataToSave.calleeIdPrefix,
      call_destination: dataToSave.callDestination,
      number_filter: dataToSave.numberFilter,
      description: dataToSave.description,
    };

    try {
      setLoading((prev) => ({ ...prev, save: true }));
      if (originalIndex !== undefined && originalIndex > -1) {
        const response = await updateIpPstnRoute(
          rules[originalIndex].id,
          apiData,
          "ip_to_ip",
        );
        if (response?.response) {
          showMessage("success", "Route updated successfully!");
          handleCloseModal();
          await fetchRules();
        } else {
          showMessage("error", response?.message || "Failed to update route");
        }
      } else {
        const response = await createIpPstnRoute(apiData, "ip_to_ip");
        if (response?.response) {
          showMessage("success", "Route created successfully!");
          handleCloseModal();
          await fetchRules();
        } else {
          showMessage("error", response?.message || "Failed to create route");
        }
      }
    } catch (e) {
      console.error("Error saving IP->IP rule:", e);
      showMessage("error", e.message || "Failed to save IP->IP rule");
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };
  const handleInputChange = (key, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [key]: value };

      // Validation: Prevent same SIP trunk group ID in call source and call destination
      if (
        key === "callSource" &&
        value === prev.callDestination &&
        value !== ""
      ) {
        newData.callDestination = "";
        setValidationMessage(
          "Call source and call destination cannot be the same. Call destination has been cleared.",
        );
        setTimeout(() => setValidationMessage(""), 3000);
      } else if (
        key === "callDestination" &&
        value === prev.callSource &&
        value !== ""
      ) {
        newData.callSource = "";
        setValidationMessage(
          "Call source and call destination cannot be the same. Call source has been cleared.",
        );
        setTimeout(() => setValidationMessage(""), 3000);
      } else {
        setValidationMessage("");
      }

      return newData;
    });
  };
  // Table selection logic
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
      showMessage("warning", "Please select items to delete");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selected.length} selected item(s)?`,
    );
    if (!confirmed) return;

    try {
      setLoading((prev) => ({ ...prev, delete: true }));
      const idsToDelete = rules
        .filter((_, idx) => selected.includes(idx))
        .map((r) => r.id);
      for (const id of idsToDelete) {
        await deleteIpPstnRoute(id, "ip_to_ip");
      }
      await fetchRules();
      setSelected([]);
      showMessage("success", "Selected routes deleted successfully!");
    } catch (e) {
      console.error("Delete failed:", e);
      showMessage("error", e.message || "Failed to delete routes");
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

    try {
      setLoading((prev) => ({ ...prev, delete: true }));
      for (const r of rules) {
        await deleteIpPstnRoute(r.id, "ip_to_ip");
      }
      await fetchRules();
      setSelected([]);
      setPage(1);
      showMessage("success", "All routes deleted successfully!");
    } catch (e) {
      console.error("Clear all failed:", e);
      showMessage("error", e.message || "Failed to clear all routes");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };
  const handlePageChange = (newPage) =>
    setPage(Math.max(1, Math.min(totalPages, newPage)));

  const handleTableScroll = (e) =>
    setScrollState({
      left: e.target.scrollLeft,
      width: e.target.clientWidth,
      scrollWidth: e.target.scrollWidth,
    });

  // Update scroll state when data or page changes
  useEffect(() => {
    const update = () => {
      if (tableScrollRef.current) {
        const el = tableScrollRef.current;
        setScrollState({
          left: el.scrollLeft,
          width: el.clientWidth,
          scrollWidth: el.scrollWidth,
        });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [rules, page]);

  // Helper function to format display values for table
  const formatDisplayValue = (key, value, rowIndex = 0) => {
    if (key === "index") {
      return (page - 1) * itemsPerPage + rowIndex + 1;
    }

    if (value === undefined || value === null || value === "") return "--";

    switch (key) {
      case "callSource":
        return `SIP Trunk Group [${value}]`;
      case "callDestination":
        return `SIP Trunk Group [${value}]`;
      default:
        return value;
    }
  };

  // Load SIP groups and rules
  const fetchSipGroups = async () => {
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
    } catch (e) {
      console.error("Failed to load SIP groups", e);
      setSipTrunkGroups([]);
    }
  };

  const fetchRules = async () => {
    try {
      setLoading((prev) => ({ ...prev, fetch: true }));
      const response = await listIpPstnRoutes("ip_to_ip");
      if (response.response && Array.isArray(response.message)) {
        const mapped = response.message.map((rule) => ({
          id: rule.id,
          callSource: rule.call_source,
          callerIdPrefix: rule.caller_id_prefix,
          calleeIdPrefix: rule.callee_id_prefix,
          callDestination: rule.call_destination,
          numberFilter: rule.number_filter,
          description: rule.description,
        }));
        setRules(mapped);
      } else {
        setRules([]);
      }
    } catch (e) {
      console.error("Failed to load IP->IP routes", e);
      showMessage("error", e.message || "Failed to load IP->IP routes");
      setRules([]);
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
    }
  };

  useEffect(() => {
    fetchSipGroups();
    fetchRules();
  }, []);

  return (
    <div
      style={{
        backgroundColor: C.pageBg,
        minHeight: "calc(100vh - 80px)",
        padding: 16,
      }}
    >
      <div style={{ width: "100%", maxWidth: "100%", margin: "0 auto" }}>
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
            E1-PRI &rsaquo; Route &rsaquo;{" "}
            <span style={{ color: C.valueText, fontWeight: 600 }}>
              IP-&gt;IP Routing Rule
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
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Btn onClick={handleCheckAll} variant="outline">
                Check All
              </Btn>
              <Btn onClick={handleUncheckAll} variant="outline">
                Uncheck All
              </Btn>
              <Btn onClick={handleInverse} variant="outline">
                Inverse
              </Btn>
              <Btn
                onClick={handleDelete}
                disabled={selected.length === 0 || loading.delete}
                variant="danger"
              >
                {loading.delete ? (
                  <CircularProgress size={12} color="inherit" />
                ) : (
                  "🗑 Delete"
                )}
              </Btn>
              <Btn
                onClick={handleClearAll}
                disabled={rules.length === 0 || loading.delete}
                variant="danger"
              >
                Clear All
              </Btn>
              <Btn onClick={() => handleOpenModal()} variant="accent">
                + Add New
              </Btn>
            </div>
          </div>

          {/* Table Area */}
          <div
            style={{ width: "100%", display: "flex", flexDirection: "column" }}
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
                  minWidth: 1200,
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
                    {ROUTE_IP_IP_TABLE_COLUMNS.map((col) => (
                      <TH
                        key={col.key}
                        style={{ position: "sticky", top: 0, zIndex: 10 }}
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
                  {loading.fetch ? (
                    <tr>
                      <td
                        colSpan={ROUTE_IP_IP_TABLE_COLUMNS.length + 2}
                        style={{ textAlign: "center", padding: "36px 0" }}
                      >
                        <CircularProgress size={24} />
                      </td>
                    </tr>
                  ) : rules.length === 0 ? (
                    <tr>
                      <td
                        colSpan={ROUTE_IP_IP_TABLE_COLUMNS.length + 2}
                        style={{
                          textAlign: "center",
                          padding: "36px 0",
                          color: C.mutedText,
                          fontSize: 13,
                        }}
                      >
                        No data. Click '+ Add New' to create one.
                      </td>
                    </tr>
                  ) : (
                    pagedRules.map((item, idx) => {
                      const realIdx = (page - 1) * itemsPerPage + idx;
                      const isSelected = selected.includes(realIdx);
                      return (
                        <tr
                          key={realIdx}
                          style={{
                            background: isSelected
                              ? "#f0f9ff"
                              : idx % 2 === 1
                                ? "#f8fafc"
                                : "#ffffff",
                            borderBottom: "0.5px solid #9ca3af",
                            transition: "background 0.1s ease",
                          }}
                        >
                          <td
                            style={{
                              textAlign: "center",
                              padding: "4px 8px",
                              borderRight: "0.5px solid #edf2f7",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectRow(idx)}
                              style={{ cursor: "pointer" }}
                            />
                          </td>
                          {ROUTE_IP_IP_TABLE_COLUMNS.map((col) => (
                            <td
                              key={col.key}
                              style={{
                                textAlign: "center",
                                fontSize: 12,
                                padding: "7px 8px",
                                color: C.valueText,
                                borderRight: "0.5px solid #edf2f7",
                              }}
                            >
                              {formatDisplayValue(col.key, item[col.key], idx)}
                            </td>
                          ))}
                          <td
                            style={{
                              textAlign: "center",
                              padding: "4px 8px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "center",
                              }}
                            >
                              <EditDocumentIcon
                                className="cursor-pointer text-blue-600"
                                onClick={() => handleOpenModal(item, realIdx)}
                                style={{ fontSize: 20 }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Footer */}
          {!loading.fetch && rules.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderTop: `0.5px solid ${C.cardBorder}`,
                background: "#f8fafc",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 11, color: C.mutedText }}>
                Showing {pagedRules.length} records on page {page}
              </span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
                  &larr; Prev
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
                  Next &rarr;
                </Btn>
                <Btn
                  onClick={() => handlePageChange(totalPages)}
                  disabled={page === totalPages}
                  variant="outline"
                >
                  Last
                </Btn>
              </div>
            </div>
          )}
        </div>

        {/* Note Message */}
        <div
          style={{
            color: "#dc2626",
            fontSize: "14px",
            marginTop: "16px",
            textAlign: "center",
            fontWeight: 500,
          }}
        >
          Note: The IP-&gt;IP route takes effect after authorization!
        </div>
      </div>

      {/* Modal */}
      <Dialog
        open={isModalOpen}
        onClose={loading.save ? null : handleCloseModal}
        maxWidth={false}
        PaperProps={{ sx: { width: 550, maxWidth: "95vw", borderRadius: 2 } }}
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
          {formData.originalIndex !== undefined && formData.originalIndex > -1
            ? "Edit IP->IP Routing Rule"
            : "Add IP->IP Routing Rule"}
        </DialogTitle>
        <DialogContent
          style={{ padding: "20px 24px", backgroundColor: C.pageBg }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {validationMessage && (
              <Alert severity="warning" sx={{ fontSize: 13 }}>
                {validationMessage}
              </Alert>
            )}
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
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {ROUTE_IP_IP_FIELDS.filter((f) => f.key !== "index").map(
                  (field) => (
                    <FieldRow key={field.key} label={`${field.label}:`}>
                      {field.type === "select" ? (
                        <FormControl size="small" fullWidth>
                          <MuiSelect
                            value={formData[field.key] || ""}
                            onChange={(e) =>
                              handleInputChange(field.key, e.target.value)
                            }
                            displayEmpty
                            sx={{
                              fontSize: 13,
                              height: 32,
                              backgroundColor: "#fff",
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: C.cardBorder,
                              },
                            }}
                          >
                            <MenuItem value="" disabled sx={{ fontSize: 13 }}>
                              Please select
                            </MenuItem>
                            {field.key === "callSource" ||
                            field.key === "callDestination" ? (
                              sipTrunkGroups.length > 0 ? (
                                sipTrunkGroups.map((g) => {
                                  const id = g.group_id || g.id || "";
                                  const isDisabled =
                                    (field.key === "callSource" &&
                                      id === formData.callDestination &&
                                      id !== "") ||
                                    (field.key === "callDestination" &&
                                      id === formData.callSource &&
                                      id !== "");
                                  return (
                                    <MenuItem
                                      key={id || "any"}
                                      value={id}
                                      disabled={isDisabled}
                                      sx={{ fontSize: 13 }}
                                    >
                                      SIP Trunk Group [{id || "Any"}]
                                    </MenuItem>
                                  );
                                })
                              ) : (
                                <MenuItem value="any" sx={{ fontSize: 13 }}>
                                  SIP Trunk Group [Any]
                                </MenuItem>
                              )
                            ) : (
                              field.options?.map((opt) => (
                                <MenuItem
                                  key={opt}
                                  value={opt}
                                  sx={{ fontSize: 13 }}
                                >
                                  {opt}
                                </MenuItem>
                              ))
                            )}
                          </MuiSelect>
                        </FormControl>
                      ) : (
                        <TextField
                          value={formData[field.key] || ""}
                          onChange={(e) =>
                            handleInputChange(field.key, e.target.value)
                          }
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
                          sx={{
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: C.cardBorder,
                            },
                          }}
                        />
                      )}
                    </FieldRow>
                  ),
                )}
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
            {loading.save ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              "Save"
            )}
          </Btn>
          <Btn
            onClick={handleCloseModal}
            variant="outline"
            style={{ padding: "8px 36px", fontSize: 13 }}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RouteIPIPPage;
