import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Checkbox,
} from "@mui/material";
import { fetchHostsFile, updateHostsFile } from "../../../api/apiService";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

// ── Color palette (same as UserManage) ────────────────────────────────────────
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#9CA3AF",
  divider: "#9CA3AF",
  cardShadow: "0 4px 20px rgba(15,23,42,0.06)",
  labelText: "#64748b",
  valueText: "#1e293b",
  strongText: "#0f172a",
  mutedText: "#94a3b8",
  accent: "#0284c7",
  primary: "#2563eb",
  primaryHover: "#1d4ed8",
  errorRed: "#dc2626",
};

// ── Button Component (same as UserManage) ────────────────────────────────────
const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
  startIcon,
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
    },
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
    },
    edit: {
      background: "#dcfce7",
      color: "#166534",
      border: "1px solid #bbf7d0",
    },
    delete: {
      background: "#fee2e2",
      color: "#991b1b",
      border: "1px solid #fecaca",
    },
    danger: {
      background: C.errorRed,
      color: C.cardBg,
      border: `0.5px solid ${C.errorRed}`,
    },
  };

  const s = styles[variant] || styles.default;
  const hoverBg = (() => {
    switch (variant) {
      case "primary":
        return "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)";
      case "cancel":
        return "#b6c2d3";
      case "edit":
        return "#bbf7d0";
      case "delete":
        return "#fecaca";
      case "danger":
        return "#b91c1c";
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
      {startIcon && <span style={{ display: "inline-flex" }}>{startIcon}</span>}
      {children}
    </button>
  );
};

const modalOverlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.5)",
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const modalStyle = {
  background: "#f8fafc",
  border: `none`,
  borderRadius: 8,
  width: 500,
  maxWidth: "95vw",
  maxHeight: "calc(100vh - 120px)",
  overflowY: "auto",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
  display: "flex",
  flexDirection: "column",
};
const modalHeaderStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
  borderBottom: `1px solid ${C.divider}`,
};
const modalBodyStyle = {
  padding: "20px 24px",
  display: "flex",
  flexDirection: "column",
  gap: 12,
  backgroundColor: "#f8fafc",
};
const modalRowStyle = {
  display: "flex",
  alignItems: "center",
  background: "#ffffff",
  border: `1px solid #cbd5e1`,
  borderRadius: 6,
  padding: "6px 12px",
  marginBottom: 0,
};
const modalLabelStyle = {
  width: 110,
  fontSize: 12,
  fontWeight: 600,
  color: C.labelText,
  textAlign: "left",
  marginRight: 10,
  whiteSpace: "nowrap",
};
const modalInputStyle = {
  flex: 1,
  fontSize: 13,
  padding: "6px 8px",
  borderRadius: 4,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#1e293b",
  outline: "none",
  width: "100%",
  transition: "border-color 0.2s ease",
};

const getInputInteraction = (hasError) => ({
  onFocus: (e) =>
    (e.target.style.borderColor = hasError ? C.errorRed : "#0284c7"),
  onBlur: (e) =>
    (e.target.style.borderColor = hasError ? C.errorRed : "#cbd5e1"),
  onMouseEnter: (e) => {
    if (document.activeElement !== e.target)
      e.target.style.borderColor = hasError ? C.errorRed : "#64748b";
  },
  onMouseLeave: (e) => {
    if (document.activeElement !== e.target)
      e.target.style.borderColor = hasError ? C.errorRed : "#cbd5e1";
  },
});
const modalFooterStyle = {
  display: "flex",
  justifyContent: "center",
  gap: 24,
  padding: "16px 0 18px",
};

const thStyle = {
  background: C.pageBg,
  color: C.labelText,
  fontWeight: 700,
  fontSize: 11,
  padding: "14px 18px",
  textAlign: "center",
  borderBottom: `1px solid ${C.divider}`,
  borderRight: `1px solid ${C.divider}`,
  whiteSpace: "nowrap",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const tdStyle = {
  borderBottom: `1px solid ${C.divider}`,
  borderRight: `1px solid ${C.divider}`,
  padding: "8px 18px",
  fontSize: 13,
  fontWeight: 500,
  background: C.cardBg,
  color: C.valueText,
  textAlign: "center",
  whiteSpace: "nowrap",
};

const tableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 20,
  boxShadow: C.cardShadow,
  overflow: "hidden",
};

const blueBarStyle = {
  width: "100%",
  height: 44,
  background: C.cardBg,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  marginBottom: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  padding: "0 20px",
  fontWeight: 700,
  fontSize: 13,
  color: "#3E5475",
  borderBottom: `1px solid ${C.divider}`,
};

const Hosts = () => {
  const [hosts, setHosts] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false,
  });
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const hasInitialLoadRef = useRef(false);
  const [validationErrors, setValidationErrors] = useState({});

  const [form, setForm] = useState({
    index: "",
    proxyIp: "",
    domain: "",
  });

  // Show message helper
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  // Parse hosts file content into table rows
  const parseHostsFile = (content) => {
    const lines = content.split("\n");
    const parsedHosts = [];
    let index = 0;

    lines.forEach((line) => {
      const trimmedLine = line.trim();
      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith("#")) {
        return;
      }

      // Split by whitespace
      const parts = trimmedLine.split(/\s+/);
      if (parts.length >= 1 && parts[0]) {
        parsedHosts.push({
          index: index.toString(),
          proxyIp: parts[0],
          domain: parts.length >= 2 ? parts.slice(1).join(" ") : "",
        });
        index++;
      }
    });

    return parsedHosts;
  };

  // Convert table rows back to hosts file format
  const generateHostsFileContent = (hostsList) => {
    let content = "# Hosts file - Managed by Clixxo UI\n";
    content += "# Format: <Proxy IP>  <Domain>\n\n";

    hostsList.forEach((host) => {
      if (host.proxyIp) {
        const domainPart = host.domain ? `  ${host.domain}` : "";
        content += `${host.proxyIp}${domainPart}\n`;
      }
    });

    return content;
  };

  // Load hosts file from API
  const loadHosts = async () => {
    if (loading.fetch) {
      return;
    }

    setLoading((prev) => ({ ...prev, fetch: true }));
    try {
      const response = await fetchHostsFile();

      if (response.response && response.responseData) {
        const parsedHosts = parseHostsFile(response.responseData);
        setHosts(parsedHosts);
      } else {
        showMessage("error", "Failed to load hosts file");
      }
    } catch (error) {
      console.error("Error loading hosts:", error);
      if (error.message === "Network Error") {
        showMessage("error", "Network error. Please check your connection.");
      } else {
        showMessage("error", error.message || "Failed to load hosts file");
      }
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
    }
  };

  // Load hosts on component mount
  useEffect(() => {
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadHosts();
    }
  }, []);

  // Validation functions
  const validateProxyIp = (ip) => {
    if (!ip || ip.trim() === "") {
      return "Proxy IP is required";
    }
    const ipRegex =
      /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(ip)) {
      return "Please enter a valid IP address";
    }
    return null;
  };

  const validateDomain = (domain) => {
    return null;
  };

  const validateForm = () => {
    const errors = {};

    const ipError = validateProxyIp(form.proxyIp);
    if (ipError) errors.proxyIp = ipError;

    const domainError = validateDomain(form.domain);
    if (domainError) errors.domain = domainError;

    return errors;
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));

    if (validationErrors[key]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }

    let error = null;
    switch (key) {
      case "proxyIp":
        error = validateProxyIp(value);
        break;
      case "domain":
        error = validateDomain(value);
        break;
      default:
        break;
    }

    if (error) {
      setValidationErrors((prev) => ({ ...prev, [key]: error }));
    }
  };

  // Modal logic
  const handleOpenModal = (row = null, idx = null) => {
    if (row && idx !== null) {
      setForm({ ...row });
      setEditIndex(idx);
    } else {
      setForm({
        index: hosts.length.toString(),
        proxyIp: "",
        domain: "",
      });
      setEditIndex(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditIndex(null);
    setValidationErrors({});
  };

  // Save or update host entry
  const handleSave = async () => {
    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      showMessage("error", firstError);
      setValidationErrors(errors);
      return;
    }

    setLoading((prev) => ({ ...prev, save: true }));
    try {
      let updatedHosts;

      if (editIndex !== null) {
        updatedHosts = [...hosts];
        updatedHosts[editIndex] = {
          index: form.index,
          proxyIp: form.proxyIp,
          domain: form.domain,
        };
      } else {
        updatedHosts = [
          ...hosts,
          {
            index: hosts.length.toString(),
            proxyIp: form.proxyIp,
            domain: form.domain,
          },
        ];
      }

      const fileContent = generateHostsFileContent(updatedHosts);
      const response = await updateHostsFile(fileContent);

      if (response.message) {
        setHosts(updatedHosts);
        showMessage(
          "success",
          editIndex !== null
            ? "Host updated successfully"
            : "Host added successfully",
        );
        setShowModal(false);
        setEditIndex(null);
        await new Promise((resolve) => setTimeout(resolve, 300));
        await loadHosts();
      } else {
        showMessage("error", "Failed to save host");
      }
    } catch (error) {
      console.error("Error saving host:", error);
      if (error.message === "Network Error") {
        showMessage("error", "Network error. Please check your connection.");
      } else {
        showMessage("error", error.message || "Failed to save host");
      }
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  // Table selection logic
  const handleSelectRow = (idx) => {
    setSelected((sel) =>
      sel.includes(idx) ? sel.filter((i) => i !== idx) : [...sel, idx],
    );
  };

  const allSelected = hosts.length > 0 && selected.length === hosts.length;
  const someSelected = selected.length > 0 && selected.length < hosts.length;

  const handleToggleAll = () => {
    if (allSelected) {
      setSelected([]);
    } else {
      setSelected(hosts.map((_, idx) => idx));
    }
  };

  const handleInverse = () =>
    setSelected(
      hosts
        .map((_, idx) => (selected.includes(idx) ? null : idx))
        .filter((i) => i !== null),
    );

  // Delete selected hosts
  const handleDelete = async () => {
    if (selected.length === 0) {
      showMessage("error", "Please select hosts to delete");
      return;
    }
    const confirmed = window.confirm(
      "Are you sure you want to delete the selected host(s)?",
    );
    if (!confirmed) return;
    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const updatedHosts = hosts.filter((_, idx) => !selected.includes(idx));

      const reindexedHosts = updatedHosts.map((host, i) => ({
        ...host,
        index: i.toString(),
      }));

      const fileContent = generateHostsFileContent(reindexedHosts);
      const response = await updateHostsFile(fileContent);

      if (response.message) {
        setHosts(reindexedHosts);
        setSelected([]);
        showMessage(
          "success",
          `${selected.length} host(s) deleted successfully`,
        );
      } else {
        showMessage("error", "Failed to delete hosts");
      }
    } catch (error) {
      console.error("Error deleting hosts:", error);
      if (error.message === "Network Error") {
        showMessage("error", "Network error. Please check your connection.");
      } else {
        showMessage("error", error.message || "Failed to delete hosts");
      }
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  // Clear all hosts
  const handleClearAll = async () => {
    if (hosts.length === 0) {
      showMessage("info", "No hosts to clear");
      return;
    }
    const confirmed = window.confirm(
      "Are you sure you want to delete ALL hosts? This action cannot be undone.",
    );
    if (!confirmed) return;
    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const fileContent =
        "# Hosts file - Managed by Clixxo UI\n# Format: <Proxy IP>  <Domain>\n\n";
      const response = await updateHostsFile(fileContent);

      if (response.message) {
        setHosts([]);
        setSelected([]);
        showMessage("success", "All hosts deleted successfully");
      } else {
        showMessage("error", "Failed to clear all hosts");
      }
    } catch (error) {
      console.error("Error clearing all hosts:", error);
      if (error.message === "Network Error") {
        showMessage("error", "Network error. Please check your connection.");
      } else {
        showMessage("error", error.message || "Failed to clear all hosts");
      }
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  return (
    <div
      className="min-h-[calc(100vh-80px)] p-4 flex flex-col items-center"
      style={{ backgroundColor: C.pageBg }}
    >
      {/* ── Breadcrumb ── */}
      <div className="w-full" style={{ maxWidth: 1000 }}>
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
          <span>Maintenance</span>
          <span>&gt;</span>
          <span>System Tool</span>
          <span>&gt;</span>
          <span style={{ color: C.strongText, fontWeight: 600 }}>Hosts</span>
        </div>

        {/* Alerts */}
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

        <div style={tableContainerStyle}>
          <div style={{ ...blueBarStyle, justifyContent: "space-between" }}>
            <span>Hosts</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Btn
                onClick={handleInverse}
                disabled={loading.delete || loading.fetch}
                variant="cancel"
                style={{ height: 30 }}
              >
                Inverse
              </Btn>
              <Btn
                onClick={handleClearAll}
                disabled={loading.delete || loading.fetch || hosts.length === 0}
                variant="cancel"
                style={{ height: 30 }}
              >
                Clear All
              </Btn>
              <Btn
                onClick={handleDelete}
                disabled={
                  loading.delete || loading.fetch || selected.length === 0
                }
                variant="cancel"
                startIcon={<DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />}
                style={{ height: 30 }}
              >
                Delete
              </Btn>
              <Btn
                onClick={() => handleOpenModal()}
                disabled={loading.fetch || loading.save}
                variant="primary"
                style={{ height: 30, minWidth: 110 }}
              >
                + Add New
              </Btn>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table
              className="w-full text-left"
              style={{ borderCollapse: "separate", borderSpacing: 0 }}
            >
              <thead>
                <tr>
                  <th style={{ ...thStyle, borderLeft: "none" }}>
                    <Checkbox
                      size="small"
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={handleToggleAll}
                      disabled={hosts.length === 0}
                      sx={{
                        padding: "1px",
                        color: "#64748b",
                        "&.Mui-checked": { color: C.accent },
                        "&.MuiCheckbox-indeterminate": { color: C.accent },
                      }}
                    />
                  </th>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Proxy IP</th>
                  <th style={thStyle}>Domain</th>
                  <th style={{ ...thStyle, borderRight: "none" }}>Modify</th>
                </tr>
              </thead>
              <tbody>
                {loading.fetch ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="py-8 text-center text-sm text-gray-500"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <CircularProgress
                          size={24}
                          style={{ color: C.primary }}
                        />
                        <span>Loading hosts...</span>
                      </div>
                    </td>
                  </tr>
                ) : hosts.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="py-8 text-center text-sm text-gray-500"
                      style={{ borderBottom: `1px solid ${C.divider}` }}
                    >
                      No data available
                    </td>
                  </tr>
                ) : (
                  hosts.map((item, idx) => {
                    const isLastRow = idx === hosts.length - 1;
                    const rowBottomStyle = isLastRow
                      ? { borderBottom: "none" }
                      : {};
                    return (
                      <tr
                        key={idx}
                        style={{
                          transition: "background-color 0.2s",
                        }}
                        className="hover:bg-gray-50"
                      >
                        <td
                          style={{
                            ...tdStyle,
                            borderLeft: "none",
                            ...rowBottomStyle,
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={selected.includes(idx)}
                            onChange={() => handleSelectRow(idx)}
                            disabled={loading.delete}
                            sx={{
                              padding: "1px",
                              color: "#64748b",
                              "&.Mui-checked": { color: C.accent },
                            }}
                          />
                        </td>
                        <td style={{ ...tdStyle, ...rowBottomStyle }}>{idx}</td>
                        <td style={{ ...tdStyle, ...rowBottomStyle }}>
                          {item.proxyIp || "--"}
                        </td>
                        <td style={{ ...tdStyle, ...rowBottomStyle }}>
                          {item.domain || "--"}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            borderRight: "none",
                            ...rowBottomStyle,
                          }}
                        >
                          <EditDocumentIcon
                            className="cursor-pointer text-blue-600 mx-auto opacity-70 hover:opacity-100 transition-opacity"
                            titleAccess="Edit"
                            onClick={() => {
                              if (!loading.delete) handleOpenModal(item, idx);
                            }}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <div style={modalHeaderStyle}>
              {editIndex !== null ? "Edit Host" : "Add Host"}
            </div>
            <div style={modalBodyStyle}>
              <div style={modalRowStyle}>
                <label style={modalLabelStyle}>Index:</label>
                <div
                  style={{ flex: 1, display: "flex", flexDirection: "column" }}
                >
                  <input
                    type="text"
                    value={form.index}
                    style={{
                      ...modalInputStyle,
                      backgroundColor: "#f1f5f9",
                      color: "#94a3b8",
                      cursor: "not-allowed",
                    }}
                    disabled
                  />
                </div>
              </div>
              <div style={modalRowStyle}>
                <label style={modalLabelStyle}>Proxy IP:</label>
                <div
                  style={{ flex: 1, display: "flex", flexDirection: "column" }}
                >
                  <input
                    type="text"
                    value={form.proxyIp}
                    onChange={(e) => handleChange("proxyIp", e.target.value)}
                    style={{
                      ...modalInputStyle,
                      borderColor: validationErrors.proxyIp
                        ? C.errorRed
                        : "#cbd5e1",
                    }}
                    placeholder="e.g., 192.168.1.1"
                    {...getInputInteraction(!!validationErrors.proxyIp)}
                  />
                  {validationErrors.proxyIp && (
                    <span
                      style={{ color: C.errorRed, fontSize: 11, marginTop: 4 }}
                    >
                      {validationErrors.proxyIp}
                    </span>
                  )}
                </div>
              </div>
              <div style={modalRowStyle}>
                <label style={modalLabelStyle}>Domain:</label>
                <div
                  style={{ flex: 1, display: "flex", flexDirection: "column" }}
                >
                  <input
                    type="text"
                    value={form.domain}
                    onChange={(e) => handleChange("domain", e.target.value)}
                    style={{
                      ...modalInputStyle,
                      borderColor: validationErrors.domain
                        ? C.errorRed
                        : "#cbd5e1",
                    }}
                    placeholder="e.g., example.com (Optional)"
                    {...getInputInteraction(!!validationErrors.domain)}
                  />
                  {validationErrors.domain && (
                    <span
                      style={{ color: C.errorRed, fontSize: 11, marginTop: 4 }}
                    >
                      {validationErrors.domain}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div style={modalFooterStyle}>
              <Btn
                variant="primary"
                onClick={handleSave}
                disabled={loading.save}
                style={{ minWidth: 110, height: 34 }}
              >
                {loading.save ? "Saving..." : "Save"}
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleCloseModal}
                disabled={loading.save}
                style={{ minWidth: 110, height: 34 }}
              >
                Close
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hosts;
