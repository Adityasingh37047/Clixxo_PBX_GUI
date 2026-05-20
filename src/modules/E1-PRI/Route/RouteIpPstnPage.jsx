import React, { useState, useRef, useEffect } from "react";
import {
  ROUTE_IP_PSTN_FIELDS,
  ROUTE_IP_PSTN_INITIAL_FORM,
  ROUTE_IP_PSTN_TABLE_COLUMNS,
} from "../../../constants/RouteIPtoPstnConstants";
import { FaPencilAlt } from "react-icons/fa";
import {
  Button,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Alert,
  CircularProgress,
} from "@mui/material";

import EditDocumentIcon from "@mui/icons-material/EditDocument";
import {
  listIpPstnRoutes,
  createIpPstnRoute,
  updateIpPstnRoute,
  deleteIpPstnRoute,
  listGroups,
  listPstnGroups,
} from "../../../api/apiService";

const LOCAL_STORAGE_KEY = "routeIpPstnRules";

// ── Design System (From CCRoutePage) ─────────────────────────────────────────
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

const RouteIpPstnPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(ROUTE_IP_PSTN_INITIAL_FORM);
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

  // Fetch SIP Trunk Groups for Call Source dropdown
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

  // Fetch PCM Trunk Groups for Call Destination dropdown
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

  // Fetch IP PSTN Routes
  const fetchIpPstnRoutes = async () => {
    setLoading((prev) => ({ ...prev, fetch: true }));
    try {
      const response = await listIpPstnRoutes("ip_to_pstn");
      if (response.response && response.message) {
        const mappedRules = response.message.map((rule) => ({
          ...rule,
          callSource: rule.call_source,
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
      console.error("Error fetching IP PSTN routes:", error);
      showMessage("error", error.message || "Failed to load IP PSTN routes");
      setRules([]);
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadAllData = async () => {
      await Promise.allSettled([
        fetchIpPstnRoutes(),
        fetchSipTrunkGroups(),
        fetchPcmTrunkGroups(),
      ]);
    };
    loadAllData();
  }, []);

  const handleOpenModal = (item = null, index = -1) => {
    if (item) {
      const formData = {
        callSource: item.call_source,
        callerIdPrefix: item.caller_id_prefix,
        calleeIdPrefix: item.callee_id_prefix,
        callDestination: String(item.call_destination),
        numberFilter: item.number_filter,
        description: item.description,
        originalIndex: index,
      };
      setFormData(formData);
    } else {
      const defaultFormData = { ...ROUTE_IP_PSTN_INITIAL_FORM };
      if (sipTrunkGroups && sipTrunkGroups.length > 0) {
        const firstSipGroup = sipTrunkGroups[0];
        defaultFormData.callSource = String(
          firstSipGroup.group_id || firstSipGroup.id || "",
        );
      }
      if (pcmTrunkGroups && pcmTrunkGroups.length > 0) {
        const firstPcmGroup = pcmTrunkGroups[0];
        defaultFormData.callDestination = String(
          firstPcmGroup.group_id || firstPcmGroup.id || firstPcmGroup,
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
      showMessage(
        "error",
        "Invalid CallerID Prefix! Only numbers (0-9) and asterisks (*) are allowed.",
      );
      return;
    }
    if (!validatePrefix(formData.calleeIdPrefix)) {
      showMessage(
        "error",
        "Invalid CalleeID Prefix! Only numbers (0-9) and asterisks (*) are allowed.",
      );
      return;
    }
    setLoading((prev) => ({ ...prev, save: true }));
    try {
      const { originalIndex, ...formDataToSave } = formData;
      const apiData = {
        call_source: formDataToSave.callSource,
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
          "ip_to_pstn",
        );
        if (response.response) {
          showMessage("success", "Route updated successfully!");
          handleCloseModal();
          await fetchIpPstnRoutes();
        } else {
          showMessage("error", "Failed to update route");
        }
      } else {
        const response = await createIpPstnRoute(apiData, "ip_to_pstn");
        if (response.response) {
          showMessage("success", "Route created successfully!");
          handleCloseModal();
          await fetchIpPstnRoutes();
        } else {
          showMessage("error", "Failed to create route");
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

  // Helper function to format display values for table
  const formatDisplayValue = (key, value, rowIndex = 0) => {
    if (key === "index") {
      // Calculate index based on current page and row position
      return (page - 1) * itemsPerPage + rowIndex + 1;
    }

    if (value === undefined || value === null || value === "") return "--";

    switch (key) {
      case "callSource":
        return `SIP Trunk Group [${String(value)}]`;
      case "callDestination":
        const pcmGroup = pcmTrunkGroups.find(
          (group) =>
            String(group.group_id || group.id || group) === String(value),
        );
        if (pcmGroup) {
          const gid = pcmGroup.group_id ?? pcmGroup.id ?? value;
          return `PCM Trunk Group [${String(gid)}]`;
        }
        return `PCM Trunk Group [${String(value)}]`;
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
      alert("Please select at least one item to delete.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selected.length} selected item(s)?`,
    );
    if (!confirmed) return;

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const deletePromises = selected.map(async (idx) => {
        const rule = rules[idx];
        if (rule && rule.id) {
          return await deleteIpPstnRoute(rule.id, "ip_to_pstn");
        }
      });

      const results = await Promise.all(deletePromises);
      const allSuccessful = results.every(
        (result) => result && result.response,
      );

      if (allSuccessful) {
        await fetchIpPstnRoutes(); // Refresh data
        setSelected([]);
        alert("Selected routes deleted successfully!");
      } else {
        alert("Some routes could not be deleted. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting routes:", error);
      if (error.message === "Network Error") {
        showMessage("error", "Network error. Please check your connection.");
      } else {
        showMessage("error", error.message || "Failed to delete routes");
      }
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };
  const handleClearAll = async () => {
    if (rules.length === 0) {
      alert("No routes to clear.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ALL ${rules.length} routes? This action cannot be undone.`,
    );
    if (!confirmed) return;

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      // Delete all routes one by one
      const deletePromises = rules.map(async (rule) => {
        if (rule && rule.id) {
          return await deleteIpPstnRoute(rule.id, "ip_to_pstn");
        }
      });

      const results = await Promise.all(deletePromises);
      const allSuccessful = results.every(
        (result) => result && result.response,
      );

      if (allSuccessful) {
        await fetchIpPstnRoutes(); // Refresh data from server
        setSelected([]);
        setPage(1);
        alert("All routes deleted successfully!");
      } else {
        alert("Some routes could not be deleted. Please try again.");
      }
    } catch (error) {
      console.error("Error clearing all routes:", error);
      if (error.message === "Network Error") {
        showMessage("error", "Network error. Please check your connection.");
      } else {
        showMessage("error", error.message || "Failed to clear all routes");
      }
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
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
              IP-&gt;PSTN Routing Rule
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

          {/* Table */}
          <div style={{ overflowX: "auto", maxHeight: 400 }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 1200,
              }}
            >
              <thead>
                <tr>
                  <TH style={{ width: 40 }}>Check</TH>
                  {ROUTE_IP_PSTN_TABLE_COLUMNS.map((col) => (
                    <TH key={col.key}>{col.label}</TH>
                  ))}
                  <TH style={{ width: 70 }}>Modify</TH>
                </tr>
              </thead>
              <tbody>
                {loading.fetch ? (
                  <tr>
                    <td
                      colSpan={ROUTE_IP_PSTN_TABLE_COLUMNS.length + 2}
                      style={{ textAlign: "center", padding: 36 }}
                    >
                      <CircularProgress size={24} />
                    </td>
                  </tr>
                ) : rules.length === 0 ? (
                  <tr>
                    <td
                      colSpan={ROUTE_IP_PSTN_TABLE_COLUMNS.length + 2}
                      style={{
                        textAlign: "center",
                        padding: 36,
                        color: C.mutedText,
                      }}
                    >
                      No data found.
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
                              : "#fff",
                          borderBottom: "0.5px solid #9ca3af",
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
                        {ROUTE_IP_PSTN_TABLE_COLUMNS.map((col) => (
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
                        <td style={{ textAlign: "center", padding: "4px 8px" }}>
                          <Btn
                            onClick={() => handleOpenModal(item, realIdx)}
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
                  })
                )}
              </tbody>
            </table>
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
      </div>

      {/* Modal */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        PaperProps={{ sx: { width: 550, borderRadius: 2 } }}
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
          {formData.originalIndex !== undefined ? "Edit" : "Add"} IP-&gt;PSTN
          Routing Rule
        </DialogTitle>
        <DialogContent
          style={{ padding: "20px 24px", backgroundColor: C.pageBg }}
        >
          <div
            style={{
              background: "#fff",
              border: `1px solid ${C.cardBorder}`,
              borderRadius: 6,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {ROUTE_IP_PSTN_FIELDS.map((field) => (
              <FieldRow key={field.key} label={`${field.label}:`}>
                {field.type === "select" ? (
                  <FormControl size="small" fullWidth>
                    <Select
                      value={formData[field.key] || ""}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          [field.key]: e.target.value,
                        }))
                      }
                      sx={{
                        fontSize: 13,
                        height: 32,
                        backgroundColor: "#fff",
                      }}
                    >
                      {field.key === "callSource" ? (
                        sipTrunkGroups.length > 0 ? (
                          sipTrunkGroups.map((g) => (
                            <MenuItem
                              key={g.group_id || g.id}
                              value={String(g.group_id || g.id)}
                              sx={{ fontSize: 13 }}
                            >
                              SIP Trunk Group [{g.group_id || g.id}]
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem value="any" sx={{ fontSize: 13 }}>
                            SIP Trunk Group [Any]
                          </MenuItem>
                        )
                      ) : field.key === "callDestination" ? (
                        pcmTrunkGroups.length > 0 ? (
                          pcmTrunkGroups.map((g) => (
                            <MenuItem
                              key={g.group_id || g.id}
                              value={String(g.group_id || g.id)}
                              sx={{ fontSize: 13 }}
                            >
                              PCM Trunk Group [{g.group_id || g.id}]
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem value="any" sx={{ fontSize: 13 }}>
                            PCM Trunk Group [Any]
                          </MenuItem>
                        )
                      ) : (
                        field.options?.map((opt) => (
                          <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                            {opt}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                ) : (
                  <TextField
                    value={formData[field.key] || ""}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        [field.key]: e.target.value,
                      }))
                    }
                    size="small"
                    fullWidth
                    variant="outlined"
                    InputProps={{
                      style: {
                        fontSize: 13,
                        height: 32,
                        padding: "0 8px",
                        boxSizing: "border-box",
                        backgroundColor: "#fff",
                      },
                    }}
                  />
                )}
              </FieldRow>
            ))}
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
              "Save Changes"
            )}
          </Btn>
          <Btn
            onClick={handleCloseModal}
            variant="outline"
            style={{ padding: "8px 36px", fontSize: 13 }}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RouteIpPstnPage;
