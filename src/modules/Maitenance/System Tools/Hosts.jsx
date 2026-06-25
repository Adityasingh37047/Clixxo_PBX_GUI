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
  pageBg: "var(--bg-main)",
  cardBg: "var(--bg-surface)",
  cardBorder: "var(--border-strong)",
  divider: "var(--border-subtle)",
  cardShadow: "var(--shadow-soft)",
  labelText: "var(--text-primary)",
  valueText: "var(--text-primary)",
  strongText: "var(--text-primary)",
  mutedText: "var(--text-muted)",
  accent: "#0284c7",
  primary: "#2563eb",
  primaryHover: "#1d4ed8",
  errorRed: "#dc2626",
};

const SYS_TOAST_SX = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  boxShadow: 3,
};
// ── Local field UI (inlined from maitenanceSharedUi) ──
const OUTLINED_BORDER = "var(--border-subtle)";
const OUTLINED_HOVER = "var(--border-strong)";
const OUTLINED_FOCUS = "var(--status-primary)";
const FOCUS_RING_SHADOW = (color) => `0 0 0 1px ${color}`;

const setFieldDefault = (el) => {
  el.style.borderColor = OUTLINED_BORDER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const setFieldHover = (el) => {
  el.style.borderColor = OUTLINED_HOVER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const setFieldFocus = (el) => {
  el.style.borderColor = OUTLINED_FOCUS;
  el.style.borderWidth = "1px";
  el.style.boxShadow = FOCUS_RING_SHADOW(OUTLINED_FOCUS);
};

const nativeFieldInteraction = {
  onFocus: (e) => {
    if (e.target.disabled) return;
    setFieldFocus(e.target);
  },
  onBlur: (e) => {
    setFieldDefault(e.target);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled) return;
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldHover(e.target);
    }
  },
  onMouseLeave: (e) => {
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldDefault(e.target);
    }
  },
};

const inputInteraction = {
  onFocus: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onFocus(e);
  },
  onBlur: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onBlur(e);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onMouseEnter(e);
  },
  onMouseLeave: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onMouseLeave(e);
  },
};

const getSystemToolsInputInteraction = (hasError, errorColor = "#dc2626") => {
  if (!hasError) return inputInteraction;
  const ring = (el, focused) => {
    el.style.borderColor = errorColor;
    el.style.borderWidth = "1px";
    el.style.boxShadow = focused ? `0 0 0 1px ${errorColor}` : "none";
  };
  return {
    onFocus: (e) => ring(e.target, true),
    onBlur: (e) => ring(e.target, false),
    onMouseEnter: (e) => ring(e.target, document.activeElement === e.target),
    onMouseLeave: (e) => ring(e.target, document.activeElement === e.target),
  };
};

const systemToolsFieldInputStyle = {
  padding: "6px 12px",
  borderRadius: 6,
  border: `1px solid ${OUTLINED_BORDER}`,
  fontSize: 14,
  width: "100%",
  backgroundColor: "var(--row-alt)",
  outline: "none",
  color: "var(--text-primary)",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
  boxShadow: "none",
};

const SYSTEM_TOOLS_FILL_BG_EDITABLE = "var(--bg-main)";
const SYSTEM_TOOLS_FILL_BG_READ_ONLY = "var(--bg-muted)";

const systemToolsModalInputStyle = {
  fontSize: 13,
  padding: "0 8px",
  borderRadius: 4,
  border: `1px solid ${OUTLINED_BORDER}`,
  background: "var(--bg-surface)",
  color: "var(--text-primary)",
  outline: "none",
  width: "100%",
  height: 32,
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};
const modalInputStyle = systemToolsModalInputStyle;

// ── Button Component (same as UserManage) ────────────────────────────────────
const BTN_BASE =
  "inline-flex items-center justify-center gap-[6px] h-[30px] px-[14px] py-[6px] rounded-[10px] text-[12px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border disabled:cursor-not-allowed disabled:opacity-60";
const BTN_DEFAULT = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:bg-[var(--row-alt)]`;
const BTN_OUTLINE = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-label)] border-[var(--border-strong)] hover:bg-[var(--row-alt)]`;
const BTN_CANCEL = `${BTN_BASE} bg-[var(--border-subtle)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:opacity-90`;
const BTN_PRIMARY = `${BTN_BASE} text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)]`;
const BTN_ERROR = `${BTN_BASE} bg-[#dc2626] text-white border-[#dc2626] hover:bg-[#b91c1c]`;
const BTN_DELETE = `${BTN_BASE} bg-[#fee2e2] text-[#991b1b] border-[#fecaca] hover:bg-[#fecaca]`;
const BTN_EDIT = `${BTN_BASE} bg-[#dcfce7] text-[#166534] border-[#bbf7d0] hover:bg-[#bbf7d0]`;

const btnVariantCls = {
  default: BTN_DEFAULT,
  primary: BTN_PRIMARY,
  cancel: BTN_CANCEL,
  outline: BTN_OUTLINE,
  error: BTN_ERROR,
  delete: BTN_DELETE,
  edit: BTN_EDIT,
  danger: BTN_ERROR,
};

const Btn = ({ children, onClick, disabled, variant = "default", className = "", style, type, title, startIcon }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    title={title}
    style={style}
    className={`${btnVariantCls[variant] || btnVariantCls.default} ${className}`.trim()}
  >
    {startIcon && <span className="inline-flex items-center">{startIcon}</span>}
    {children}
  </button>
);

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
  background: "var(--bg-surface)",
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
  padding: "24px",
  paddingBottom: "16px",
  display: "flex",
  flexDirection: "column",
  gap: 14,
  backgroundColor: "var(--bg-surface)",
};
const modalRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  marginBottom: 0,
};
const modalLabelStyle = {
  width: 170,
  fontSize: 13,
  fontWeight: 600,
  color: C.labelText,
  textAlign: "left",
  whiteSpace: "nowrap",
};
const getInputInteraction = getSystemToolsInputInteraction;

const modalFooterStyle = {
  display: "flex",
  justifyContent: "center",
  gap: 12,
  padding: "10px 16px",
  borderTop: `1px solid ${C.cardBorder}`,
  background: "var(--row-alt)",
};

const TH = ({ children, style: extra }) => (
  <th
    style={{
      background: "var(--table-header-bg)",
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
  background: "var(--bg-surface)",
  borderBottom: `1px solid ${C.cardBorder}`,
  borderRight: `1px solid ${C.cardBorder}`,
  whiteSpace: "nowrap",
};

const checkboxSx = {
  padding: "1px",
  color: "var(--text-primary)",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const tableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 10,
  boxShadow: C.cardShadow,
  overflow: "hidden",
};

const cardToolbarStyle = {
  minHeight: 44,
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  borderBottom: `1px solid ${C.cardBorder}`,
  background: "var(--bg-surface)",
};

const cardToolbarTitleStyle = {
  fontSize: 13,
  fontWeight: 700,
  color: C.labelText,
  letterSpacing: "0.02em",
};

const cardToolbarActionsStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
};

const cardToolbarButtonStyle = { height: 30 };

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
    let index = 1;

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
        index: (hosts.length + 1).toString(),
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
            index: (hosts.length + 1).toString(),
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
        index: (i + 1).toString(),
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
      className="clixxo-system-settings theme-page-bg min-h-[calc(100vh-80px)] p-4 flex flex-col items-center"
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
            sx={SYS_TOAST_SX}
          >
            {message.text}
          </Alert>
        )}

        <div style={tableContainerStyle}>
          <div style={cardToolbarStyle}>
            <span style={cardToolbarTitleStyle}>Hosts</span>
            <div style={cardToolbarActionsStyle}>
              <Btn
                onClick={handleInverse}
                disabled={loading.delete || loading.fetch}
                variant="cancel"
                style={cardToolbarButtonStyle}
              >
                Inverse
              </Btn>
              <Btn
                onClick={handleClearAll}
                disabled={loading.delete || loading.fetch || hosts.length === 0}
                variant="cancel"
                style={cardToolbarButtonStyle}
              >
                Clear All
              </Btn>
              <Btn
                onClick={handleDelete}
                disabled={
                  loading.delete || loading.fetch || selected.length === 0
                }
                variant="cancel"
                startIcon={
                  <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                }
                style={cardToolbarButtonStyle}
              >
                Delete
              </Btn>
              <Btn
                onClick={() => handleOpenModal()}
                disabled={loading.fetch || loading.save}
                variant="primary"
                style={cardToolbarButtonStyle}
              >
                + Add New
              </Btn>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: 0,
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
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={handleToggleAll}
                      disabled={hosts.length === 0}
                      sx={checkboxSx}
                    />
                  </TH>
                  <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>ID</TH>
                  <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                    Proxy IP
                  </TH>
                  <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                    Domain
                  </TH>
                  <TH
                    style={{
                      width: 70,
                      borderRight: "none",
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
                      colSpan={5}
                      style={{
                        ...tdStyle,
                        padding: "32px 14px",
                        borderLeft: "none",
                        borderRight: "none",
                        borderBottom: "none",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 12,
                          color: C.labelText,
                          fontSize: 13,
                        }}
                      >
                        <CircularProgress size={24} />
                        <span>Loading hosts...</span>
                      </div>
                    </td>
                  </tr>
                ) : hosts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        ...tdStyle,
                        padding: "32px 14px",
                        color: C.labelText,
                        fontWeight: 600,
                        borderLeft: "none",
                        borderRight: "none",
                        borderBottom: "none",
                      }}
                    >
                      No data available
                    </td>
                  </tr>
                ) : (
                  hosts.map((item, idx) => {
                    const isSelected = selected.includes(idx);
                    const isLastRow = idx === hosts.length - 1;
                    const rowBg = isSelected
                      ? "var(--row-selected)"
                      : idx % 2 === 1
                        ? "var(--row-alt)"
                        : "var(--bg-surface)";
                    const lastRowCellStyle = isLastRow
                      ? { borderBottom: "none" }
                      : {};
                    return (
                      <tr
                        key={idx}
                        style={{
                          background: rowBg,
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected)
                            e.currentTarget.style.background = "var(--row-alt)";
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
                            width: 40,
                            ...lastRowCellStyle,
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => handleSelectRow(idx)}
                            disabled={loading.delete}
                            sx={checkboxSx}
                          />
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {item.index ?? idx + 1}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {item.proxyIp || "--"}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {item.domain || "--"}
                        </td>
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
                                cursor: loading.delete
                                  ? "not-allowed"
                                  : "pointer",
                                color: "var(--status-primary)",
                                fontSize: 22,
                                opacity: 0.7,
                                transition: "opacity 0.15s ease",
                              }}
                              onClick={() => {
                                if (!loading.delete) handleOpenModal(item, idx);
                              }}
                              onMouseEnter={(e) => {
                                if (!loading.delete)
                                  e.currentTarget.style.opacity = "1";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.opacity = "0.7";
                              }}
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "7px 14px",
              background: "var(--bg-surface)",
              borderTop: `1px solid ${C.cardBorder}`,
              borderBottomLeftRadius: 10,
              borderBottomRightRadius: 10,
            }}
          >
            <span style={{ fontSize: 11, color: C.mutedText }}>
              Showing {hosts.length} record
              {hosts.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          style={modalOverlayStyle}
          onClick={() => {
            if (!loading.save) handleCloseModal();
          }}
        >
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              {editIndex !== null ? "Edit Host" : "Add Host"}
            </div>
            <div style={modalBodyStyle}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  background: "var(--row-alt)",
                  border: `1px solid ${C.cardBorder}`,
                  borderRadius: 8,
                  padding: 20,
                }}
              >
                <div style={modalRowStyle}>
                  <label style={modalLabelStyle}>Index:</label>
                  <div
                    style={{
                      width: "min(100%, 320px)",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <input
                      type="text"
                      value={form.index}
                      style={{
                        ...modalInputStyle,
                        backgroundColor: "var(--bg-muted)",
                        color: "var(--text-muted)",
                        cursor: "not-allowed",
                      }}
                      disabled
                    />
                  </div>
                </div>
                <div style={modalRowStyle}>
                  <label style={modalLabelStyle}>Proxy IP:</label>
                  <div
                    style={{
                      width: "min(100%, 320px)",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <input
                      type="text"
                      value={form.proxyIp}
                      onChange={(e) => handleChange("proxyIp", e.target.value)}
                      style={{
                        ...modalInputStyle,
                        borderColor: validationErrors.proxyIp
                          ? C.errorRed
                          : undefined,
                      }}
                      placeholder="e.g., 192.168.1.1"
                      {...getInputInteraction(!!validationErrors.proxyIp, C.errorRed)}
                    />
                    {validationErrors.proxyIp && (
                      <span
                        style={{
                          color: C.errorRed,
                          fontSize: 11,
                          marginTop: 4,
                        }}
                      >
                        {validationErrors.proxyIp}
                      </span>
                    )}
                  </div>
                </div>
                <div style={modalRowStyle}>
                  <label style={modalLabelStyle}>Domain:</label>
                  <div
                    style={{
                      width: "min(100%, 320px)",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <input
                      type="text"
                      value={form.domain}
                      onChange={(e) => handleChange("domain", e.target.value)}
                      style={{
                        ...modalInputStyle,
                        borderColor: validationErrors.domain
                          ? C.errorRed
                          : undefined,
                      }}
                      placeholder="e.g., example.com (Optional)"
                      {...getInputInteraction(!!validationErrors.domain, C.errorRed)}
                    />
                    {validationErrors.domain && (
                      <span
                        style={{
                          color: C.errorRed,
                          fontSize: 11,
                          marginTop: 4,
                        }}
                      >
                        {validationErrors.domain}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div style={modalFooterStyle}>
              <Btn
                variant="primary"
                onClick={handleSave}
                disabled={loading.save}
                style={{ minWidth: 100, height: 33 }}
              >
                {loading.save ? "Saving..." : "Save"}
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleCloseModal}
                disabled={loading.save}
                style={{ minWidth: 100, height: 33 }}
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
