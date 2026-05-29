import React, { useState, useEffect } from "react";
import {
  ROUTE_IP_IP_FIELDS,
  ROUTE_IP_IP_INITIAL_FORM,
  ROUTE_IP_IP_TABLE_COLUMNS,
} from "../../../constants/RouteIPIPConstants";
import {
  Button,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select as MuiSelect,
  MenuItem,
  FormControl,
  Alert,
  CircularProgress,
} from "@mui/material";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  listIpPstnRoutes,
  createIpPstnRoute,
  updateIpPstnRoute,
  deleteIpPstnRoute,
  listGroups,
} from "../../../api/apiService";

// ── Color palette (matches Number-Receiving Rule) ─────────────────────────────
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#9CA3AF",
  labelText: "#3E5475",
  valueText: "#0f172a",
  mutedText: "#94a3b8",
  strongText: "#0f172a",
  accent: "#3E5475",
  amber: "#dc2626",
};

const CARD_RADIUS = 20;

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
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
      fontSize: 15,
      borderRadius: 6,
      textTransform: "none",
      padding: "6px 28px",
    },
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
    },
    outline: {
      background: C.cardBg,
      color: C.labelText,
      border: `1px solid ${C.cardBorder}`,
    },
    danger: {
      background: "#fef2f2",
      color: C.amber,
      border: `0.5px solid #fecaca`,
    },
  };

  const s = styles[variant] || styles.default;
  const hoverBg = (() => {
    switch (variant) {
      case "primary":
        return "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)";
      case "cancel":
        return "#b6c2d3";
      case "danger":
        return "#fee2e2";
      case "outline":
      case "default":
      default:
        return "#e2e8f0";
    }
  })();

  const baseBg = s.background;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
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
        transition: "all 0.15s ease",
        height: 30,
        gap: 6,
        whiteSpace: "nowrap",
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.background = baseBg;
      }}
    >
      {children}
    </button>
  );
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
      borderBottom: `1px solid ${C.cardBorder}`,
      borderRight: `1px solid ${C.cardBorder}`,
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.14em",
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
  background: "#ffffff",
  borderBottom: `1px solid ${C.cardBorder}`,
  borderRight: `1px solid ${C.cardBorder}`,
  whiteSpace: "nowrap",
};

const FieldRow = ({ label, children }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    }}
  >
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: 170,
        flexShrink: 0,
        textAlign: "left",
      }}
    >
      {label}
    </label>
    <div style={{ width: "min(100%, 320px)" }}>{children}</div>
  </div>
);

const checkboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
};

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

  const [sipTrunkGroups, setSipTrunkGroups] = useState([]);
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false,
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [validationMessage, setValidationMessage] = useState("");
  const [tableMinWidth, setTableMinWidth] = useState("100%");

  // Message handling
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  // Fetch SIP Trunk Groups
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
    } catch (error) {
      console.error("Error fetching SIP trunk groups:", error);
      setSipTrunkGroups([]);
    }
  };

  // Fetch IP->IP Rules
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
    } catch (error) {
      console.error("Failed to load IP->IP routes", error);
      showMessage("error", error.message || "Failed to load IP->IP routes");
      setRules([]);
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
    }
  };

  useEffect(() => {
    fetchSipGroups();
    fetchRules();
  }, []);

  useEffect(() => {
    const updateTableWidthForZoom = () => {
      const scale = window.visualViewport?.scale || 1;
      setTableMinWidth(scale >= 1.15 ? 1200 : "100%");
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
    setValidationMessage("");
    if (item) {
      setFormData({ ...item, originalIndex: index });
    } else {
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
    setValidationMessage("");
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
      case "callSource":
        return `SIP Trunk Group [${value}]`;
      case "callDestination":
        return `SIP Trunk Group [${value}]`;
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
      const idsToDelete = rules
        .filter((_, idx) => selected.includes(idx))
        .map((r) => r.id);
      for (const id of idsToDelete) {
        await deleteIpPstnRoute(id, "ip_to_ip");
      }
      await fetchRules();
      setSelected([]);
      showMessage("success", "Selected routes deleted successfully!");
    } catch (error) {
      console.error("Delete failed:", error);
      showMessage("error", error.message || "Failed to delete routes");
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
      `Are you sure you want to delete ALL ${rules.length} routes?`,
    );
    if (!confirmed) return;

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      for (const r of rules) {
        await deleteIpPstnRoute(r.id, "ip_to_ip");
      }
      await fetchRules();
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
            fontSize: 12,
            color: C.mutedText,
            marginBottom: 16,
            fontWeight: 400,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span>E1-PRI</span>
          <span>&gt;</span>
          <span>Route</span>
          <span>&gt;</span>
          <span style={{ color: C.strongText, fontWeight: 600 }}>
            IP-&gt;IP Routing Rule
          </span>
        </div>

        {/* Main Card */}
        <div
          style={{
            background: C.cardBg,
            border: `1.5px solid ${C.cardBorder}`,
            borderRadius: 10,
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
          }}
        >
          {/* Toolbar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              minHeight: 44,
              padding: "7px 14px",
              borderBottom: `1px solid ${C.cardBorder}`,
              background: "#ffffff",
              flexWrap: "wrap",
              gap: 12,
              borderTopLeftRadius: CARD_RADIUS,
              borderTopRightRadius: CARD_RADIUS,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

              {selected.length > 0 && (
                <span
                  style={{
                    background: "#eff6ff",
                    color: C.accent,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "5px 12px",
                    borderRadius: 999,
                    border: `1px solid ${C.accent}`,
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
                variant="cancel"
                onClick={handleInverse}
                disabled={loading.delete || loading.fetch}
                style={{ height: 30 }}
              >
                Inverse
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleDelete}
                disabled={selected.length === 0 || loading.delete}
                style={{ height: 30 }}
              >
                {loading.delete ? (
                  <CircularProgress size={12} color="inherit" />
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
                disabled={rules.length === 0 || loading.delete}
                style={{ height: 30 }}
              >
                {loading.delete ? (
                  <CircularProgress size={12} color="inherit" />
                ) : (
                  "Clear All"
                )}
              </Btn>
              <Btn
                onClick={() => handleOpenModal()}
                variant="primary"
                style={{
                  height: 30,
                  padding: "6px 14px",
                  fontSize: 12,
                  borderRadius: 10,
                }}
              >
                + Add New
              </Btn>
            </div>
          </div>

          {/* Table Area */}
          <div style={{ overflowX: "auto", overflowY: "auto", flex: 1 }}>
            {loading.fetch ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: 240,
                }}
              >
                <CircularProgress size={24} />
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
                    color: "#3E5475",
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 16,
                  }}
                >
                  No rules configured!
                </div>
                <Btn
                  onClick={() => handleOpenModal()}
                  variant="cancel"
                  style={{ padding: "8px 24px", fontSize: 12, borderRadius: 6 }}
                >
                  + Add New Rule
                </Btn>
              </div>
            ) : (
              <>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "separate",
                    borderSpacing: 0,
                    minWidth: tableMinWidth,
                  }}
                >
                  <thead>
                    <tr>
                      <TH style={{ width: 40, padding: 0, borderLeft: "none" }}>
                        <Checkbox
                          size="small"
                          checked={rules.length > 0 && selected.length === rules.length}
                          indeterminate={selected.length > 0 && selected.length < rules.length}
                          onChange={(e) => {
                            if (e.target.checked) handleCheckAll();
                            else handleUncheckAll();
                          }}
                          sx={checkboxSx}
                        />
                      </TH>
                      {ROUTE_IP_IP_TABLE_COLUMNS.map((col) => (
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
                        ? "#f0f9ff"
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
                              e.currentTarget.style.background = "#f1f5f9";
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
                              sx={checkboxSx}
                            />
                          </td>
                          {ROUTE_IP_IP_TABLE_COLUMNS.map((col) => (
                            <td
                              key={col.key}
                              style={{ ...tdStyle, background: rowBg, ...lastRowCellStyle }}
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
                              style={{
                                cursor: "pointer",
                                color: "#2563eb",
                                fontSize: 22,
                                opacity: 0.7,
                                transition: "opacity 0.15s ease",
                              }}
                              onClick={() => handleOpenModal(item, realIdx)}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.opacity = "1")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.opacity = "0.7")
                              }
                            />
                          </div>
                        </td>
                      </tr>
                    );
                    })}
              </tbody>
            </table>
            </>
          )}
          </div>

          {/* Pagination Footer */}
          {!loading.fetch && rules.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "7px 14px",
                background: "#ffffff",
                borderTop: `1px solid ${C.cardBorder}`,
                borderBottomLeftRadius: CARD_RADIUS,
                borderBottomRightRadius: CARD_RADIUS,
                overflow: "hidden",
              }}
            >
              <span style={{ fontSize: 11, color: C.mutedText }}>
                Showing {pagedRules.length} record{pagedRules.length !== 1 ? "s" : ""} on page {page}
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn onClick={() => handlePageChange(page - 1)} disabled={page <= 1} variant="outline">← Prev</Btn>
                <span style={{ fontSize: 11, fontWeight: 600, color: C.accent, background: "#e0f2fe", padding: "5px 14px", borderRadius: 6, border: `1px solid ${C.cardBorder}` }}>
                  Page {page} of {totalPages}
                </span>
                <Btn onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages} variant="outline">Next →</Btn>
              </div>
            </div>
          )}
        </div>

        {/* Note Message */}
        <div
          style={{
            color: "#dc2626",
            fontSize: "13px",
            marginTop: "16px",
            textAlign: "center",
            fontWeight: 500,
          }}
        >
          Note: The IP-&gt;IP route takes effect after authorization!
        </div>
      </div>

      {/* Configuration Modal */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth={false}
        PaperProps={{
          sx: {
            width: 600,
            maxWidth: "95vw",
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
            padding: "16px 24px",
            textAlign: "center",
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          }}
        >
          {formData.originalIndex !== undefined && formData.originalIndex > -1
            ? "Edit IP->IP Routing Rule"
            : "Add IP->IP Routing Rule"}
        </DialogTitle>
        <DialogContent
          style={{ padding: "24px", backgroundColor: "#ffffff" }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {validationMessage && (
              <Alert severity="warning" sx={{ fontSize: 13, mb: 1 }}>
                {validationMessage}
              </Alert>
            )}
            <div
              style={{
                background: "#f8fafc",
                border: `1px solid ${C.cardBorder}`,
                borderRadius: 8,
                padding: 20,
              }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {ROUTE_IP_IP_FIELDS.map((field) => (
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
                              transition: "border-color 0.2s ease",
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#64748b",
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#0284c7",
                              borderWidth: 1,
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
                                const id = g.group_id ?? g.id ?? g;
                                const isDisabled =
                                  (field.key === "callSource" &&
                                    id === formData.callDestination &&
                                    id !== "") ||
                                  (field.key === "callDestination" &&
                                    id === formData.callSource &&
                                    id !== "");
                                return (
                                  <MenuItem
                                    key={String(id) || "any"}
                                    value={String(id)}
                                    disabled={isDisabled}
                                    sx={{ fontSize: 13 }}
                                  >
                                    SIP Trunk Group [{String(id) || "Any"}]
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
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "#fff",
                            "& fieldset": {
                              borderColor: C.cardBorder,
                              transition: "border-color 0.2s ease",
                            },
                            "&:hover fieldset": {
                              borderColor: "#64748b",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#0284c7",
                              borderWidth: 1,
                            },
                          },
                          "& .MuiOutlinedInput-input": {
                            backgroundColor: "#fff",
                          },
                        }}
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
            background: "#f8fafc",
            borderTop: "1px solid #e5e7eb",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <Btn
            variant="primary"
            onClick={handleSave}
            disabled={loading.save}
            style={{ minWidth: 110, height: 34 }}
          >
            {loading.save ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Save"
            )}
          </Btn>
          <Btn
            variant="cancel"
            onClick={handleCloseModal}
            disabled={loading.save}
            style={{ minWidth: 110, height: 34, borderRadius: 6 }}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RouteIPIPPage;
