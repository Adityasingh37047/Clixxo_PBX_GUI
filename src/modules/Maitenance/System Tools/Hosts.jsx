import React, { useState, useEffect, useRef } from "react";
import { Alert, CircularProgress, Checkbox } from "@mui/material";
import { fetchHostsFile, updateHostsFile } from "../../../api/apiService";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  HOSTS_CARD_TITLE,
  HOSTS_BREADCRUMB,
  HOSTS_BUTTON_LABELS,
  HOSTS_BUTTON_VARIANTS,
  HOSTS_CANCEL_BTN_STYLE,
  HOSTS_PRIMARY_BTN_STYLE,
  HOSTS_MODAL_BTN_STYLE,
  HOSTS_TABLE_HEADERS,
  HOSTS_TABLE_STATUS,
  HOSTS_MODAL_TITLES,
  HOSTS_MODAL_LABELS,
  HOSTS_MODAL_PLACEHOLDERS,
  HOSTS_MESSAGE_DEFAULT,
  HOSTS_MESSAGE_TIMEOUT_MS,
  HOSTS_NETWORK_ERROR,
  HOSTS_MESSAGES,
  HOSTS_FILE_HEADER,
} from "../../../constants/HostsConstants";

const HOSTS_FORM_PAD_X = 28;

const CARD_RADIUS = 10;
const FIELD_RADIUS = 6;

const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  cardShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
  divider: "#e2e6ec",
  labelText: "#3E5475",
  valueText: "#30415A",
  mutedText: "#94a3b8",
  errorRed: "#dc2626",
  gridHeaderBg: "#F8FAFC",
};

// ── Local field UI (matches Network.jsx design language) ──
const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";
const FOCUS_RING_SHADOW = () => `0 0 0 2px rgba(62, 84, 117, 0.15)`;  


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
  backgroundColor: "#f8fafc",
  outline: "none",
  color: "#3E5475",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
  boxShadow: "none",
};

const SYSTEM_TOOLS_FILL_BG_EDITABLE = "#ffffff";
const SYSTEM_TOOLS_FILL_BG_READ_ONLY = "#f1f5f9";

const systemToolsModalInputStyle = {
  fontSize: 13,
  padding: "0 8px",
  borderRadius: 4,
  border: `1px solid ${OUTLINED_BORDER}`,
  background: "#ffffff",
  color: "#1e293b",
  outline: "none",
  width: "100%",
  height: 32,
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};
const modalInputStyle = systemToolsModalInputStyle;


// ── Button Component (same as UserManage) ────────────────────────────────────
const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
  startIcon,
  component,
  
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
  const hoverBg =
    {
      primary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      cancel: "#b6c2d3",
      danger: "#fca5a5",
      outline: "#e2e8f0",
      error: "#b91c1c",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      cancel: "#a3b1c2",
      danger: "#f87171",
      outline: "#d1d9e6",
      error: "#991b1b",
      default: "#d1d5db",
    }[variant] || "#d1d5db";
  const baseBg = extraStyle?.background ?? s.background;
  const baseShadow = extraStyle?.boxShadow ?? s.boxShadow ?? "none";

  const clearPressStyle = (el) => {
    el.style.transform = "";
    el.style.boxShadow = baseShadow;
  };

  const applyPressStyle = (el) => {
    el.style.background = activeBg;
    el.style.transform = "translateY(1px) scale(0.98)";
    el.style.boxShadow =
      variant === "primary"
        ? "inset 0 2px 4px rgba(0, 0, 0, 0.25)"
        : variant === "cancel"
          ? "inset 0 2px 4px rgba(15, 23, 42, 0.15)"
          : "inset 0 1px 3px rgba(15, 23, 42, 0.12)";
  };

  const Component = component || "button";
  return (
    <Component
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
        transition:
          "background 0.15s ease, transform 0.1s ease, box-shadow 0.1s ease",
        height: 30,
        gap: 6,
        whiteSpace: "nowrap",
        userSelect: "none",
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = baseBg;
        clearPressStyle(e.currentTarget);
      }}
      onMouseDown={(e) => {
        if (disabled) return;
        applyPressStyle(e.currentTarget);
      }}
      onMouseUp={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = hoverBg;
        clearPressStyle(e.currentTarget);
      }}
    >
      {startIcon && (
        <span style={{ display: "inline-flex" }}>
          {startIcon}
        </span>
      )}
      {children}
    </Component>
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
  background: "#ffffff",
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
  backgroundColor: "#ffffff",
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
  background: "#f8fafc",
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

const checkboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const hostsPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const hostsPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const hostsCardStyle = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: CARD_RADIUS,
  boxShadow: C.cardShadow,
  overflow: "hidden",
  boxSizing: "border-box",
};

const hostsHeaderStyle = {
  width: "100%",
  minHeight: 44,
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  borderBottom: `1px solid ${C.divider}`,
  background: C.cardBg,
  borderTopLeftRadius: CARD_RADIUS,
  borderTopRightRadius: CARD_RADIUS,
  boxSizing: "border-box",
};

const hostsHeaderTitleStyle = {
  fontSize: 13,
  fontWeight: 700,
  color: C.labelText,
  lineHeight: 1.35,
};

const hostsHeaderActionsStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
  marginLeft: "auto",
};

const hostsFooterStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: `7px ${HOSTS_FORM_PAD_X}px`,
  background: C.cardBg,
  borderTop: `1px solid ${C.divider}`,
  borderBottomLeftRadius: CARD_RADIUS,
  borderBottomRightRadius: CARD_RADIUS,
};

const hostsFixedAlertSx = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  maxWidth: 500,
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
  fontWeight: 500,
};

const HostsBreadcrumb = () => (
  <div
    style={{
      fontSize: 12,
      color: C.mutedText,
      marginBottom: 16,
      display: "flex",
      alignItems: "center",
      gap: 4,
      flexWrap: "wrap",
    }}
  >
    <span>{HOSTS_BREADCRUMB[0]}</span>
    <span>&gt;</span>
    <span>{HOSTS_BREADCRUMB[1]}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>
      {HOSTS_BREADCRUMB[2]}
    </span>
  </div>
);

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
  const [message, setMessage] = useState(HOSTS_MESSAGE_DEFAULT);

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
    setTimeout(() => setMessage(HOSTS_MESSAGE_DEFAULT), HOSTS_MESSAGE_TIMEOUT_MS);
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
    let content = HOSTS_FILE_HEADER;

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
        showMessage("error", HOSTS_MESSAGES.LOAD_FAILED);
      }
    } catch (error) {
      console.error("Error loading hosts:", error);
      if (error.message === HOSTS_NETWORK_ERROR) {
        showMessage("error", HOSTS_MESSAGES.NETWORK_ERROR);
      } else {
        showMessage("error", error.message || HOSTS_MESSAGES.LOAD_FAILED);
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
      return HOSTS_MESSAGES.PROXY_IP_REQUIRED;
    }
    const ipRegex =
      /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(ip)) {
      return HOSTS_MESSAGES.PROXY_IP_INVALID;
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
            ? HOSTS_MESSAGES.UPDATE_SUCCESS
            : HOSTS_MESSAGES.ADD_SUCCESS,
        );
        setShowModal(false);
        setEditIndex(null);
        await new Promise((resolve) => setTimeout(resolve, 300));
        await loadHosts();
      } else {
        showMessage("error", HOSTS_MESSAGES.SAVE_FAILED);
      }
    } catch (error) {
      console.error("Error saving host:", error);
      if (error.message === HOSTS_NETWORK_ERROR) {
        showMessage("error", HOSTS_MESSAGES.NETWORK_ERROR);
      } else {
        showMessage("error", error.message || HOSTS_MESSAGES.SAVE_FAILED);
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
      showMessage("error", HOSTS_MESSAGES.DELETE_NONE_SELECTED);
      return;
    }
    const confirmed = window.confirm(
      HOSTS_MESSAGES.DELETE_CONFIRM,
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
          HOSTS_MESSAGES.DELETE_SUCCESS(selected.length),
        );
      } else {
        showMessage("error", HOSTS_MESSAGES.DELETE_FAILED);
      }
    } catch (error) {
      console.error("Error deleting hosts:", error);
      if (error.message === HOSTS_NETWORK_ERROR) {
        showMessage("error", HOSTS_MESSAGES.NETWORK_ERROR);
      } else {
        showMessage("error", error.message || HOSTS_MESSAGES.DELETE_FAILED);
      }
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  // Clear all hosts
  const handleClearAll = async () => {
    if (hosts.length === 0) {
      showMessage("info", HOSTS_MESSAGES.CLEAR_NONE);
      return;
    }
    const confirmed = window.confirm(
      HOSTS_MESSAGES.CLEAR_CONFIRM,
    );
    if (!confirmed) return;
    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const fileContent = HOSTS_FILE_HEADER;
      const response = await updateHostsFile(fileContent);

      if (response.message) {
        setHosts([]);
        setSelected([]);
        showMessage("success", HOSTS_MESSAGES.CLEAR_SUCCESS);
      } else {
        showMessage("error", HOSTS_MESSAGES.CLEAR_FAILED);
      }
    } catch (error) {
      console.error("Error clearing all hosts:", error);
      if (error.message === HOSTS_NETWORK_ERROR) {
        showMessage("error", HOSTS_MESSAGES.NETWORK_ERROR);
      } else {
        showMessage("error", error.message || HOSTS_MESSAGES.CLEAR_FAILED);
      }
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  return (
    <div style={hostsPageWrapStyle} data-native-scroll>
      <div style={hostsPageInnerStyle}>
        <HostsBreadcrumb />

        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage(HOSTS_MESSAGE_DEFAULT)}
            sx={hostsFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <div style={hostsCardStyle}>
          <div style={hostsHeaderStyle}>
            <span style={hostsHeaderTitleStyle}>{HOSTS_CARD_TITLE}</span>
            <div style={hostsHeaderActionsStyle}>
              <Btn
                onClick={handleInverse}
                disabled={loading.delete || loading.fetch}
                variant={HOSTS_BUTTON_VARIANTS.CANCEL}
                style={HOSTS_CANCEL_BTN_STYLE}
              >
                {HOSTS_BUTTON_LABELS.INVERSE}
              </Btn>
              <Btn
                onClick={handleClearAll}
                disabled={loading.delete || loading.fetch || hosts.length === 0}
                variant={HOSTS_BUTTON_VARIANTS.CANCEL}
                style={HOSTS_CANCEL_BTN_STYLE}
              >
                {HOSTS_BUTTON_LABELS.CLEAR_ALL}
              </Btn>
              <Btn
                onClick={handleDelete}
                disabled={
                  loading.delete || loading.fetch || selected.length === 0
                }
                variant={HOSTS_BUTTON_VARIANTS.CANCEL}
                startIcon={
                  <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                }
                style={HOSTS_CANCEL_BTN_STYLE}
              >
                {HOSTS_BUTTON_LABELS.DELETE}
              </Btn>
              <Btn
                onClick={() => handleOpenModal()}
                disabled={loading.fetch || loading.save}
                variant={HOSTS_BUTTON_VARIANTS.PRIMARY}
                style={HOSTS_PRIMARY_BTN_STYLE}
              >
                {HOSTS_BUTTON_LABELS.ADD_NEW}
              </Btn>
            </div>
          </div>

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
                  <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                    {HOSTS_TABLE_HEADERS.ID}
                  </TH>
                  <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                    {HOSTS_TABLE_HEADERS.PROXY_IP}
                  </TH>
                  <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                    {HOSTS_TABLE_HEADERS.DOMAIN}
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
                    {HOSTS_TABLE_HEADERS.MODIFY}
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
                        <span>{HOSTS_TABLE_STATUS.LOADING}</span>
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
                      {HOSTS_TABLE_STATUS.NO_DATA}
                    </td>
                  </tr>
                ) : (
                  hosts.map((item, idx) => {
                    const isSelected = selected.includes(idx);
                    const isLastRow = idx === hosts.length - 1;
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
                        key={idx}
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
                                color: "#2563eb",
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

          {hosts.length > 0 && (
            <div style={hostsFooterStyle}>
              <span style={{ fontSize: 11, color: C.mutedText }}>
                {HOSTS_TABLE_STATUS.SHOWING(hosts.length)}
              </span>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div
          style={modalOverlayStyle}
          onClick={() => {
            if (!loading.save) handleCloseModal();
          }}
        >
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              {editIndex !== null
                ? HOSTS_MODAL_TITLES.EDIT
                : HOSTS_MODAL_TITLES.ADD}
            </div>
            <div style={modalBodyStyle}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  background: "#f8fafc",
                  border: `1px solid ${C.cardBorder}`,
                  borderRadius: 8,
                  padding: 20,
                }}
              >
                <div style={modalRowStyle}>
                  <label style={modalLabelStyle}>
                    {HOSTS_MODAL_LABELS.INDEX}
                  </label>
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
                        backgroundColor: "#f1f5f9",
                        color: "#94a3b8",
                        cursor: "not-allowed",
                      }}
                      disabled
                    />
                  </div>
                </div>
                <div style={modalRowStyle}>
                  <label style={modalLabelStyle}>
                    {HOSTS_MODAL_LABELS.PROXY_IP}
                  </label>
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
                      placeholder={HOSTS_MODAL_PLACEHOLDERS.PROXY_IP}
                      {...getInputInteraction(
                        !!validationErrors.proxyIp,
                        C.errorRed,
                      )}
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
                  <label style={modalLabelStyle}>
                    {HOSTS_MODAL_LABELS.DOMAIN}
                  </label>
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
                      placeholder={HOSTS_MODAL_PLACEHOLDERS.DOMAIN}
                      {...getInputInteraction(
                        !!validationErrors.domain,
                        C.errorRed,
                      )}
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
                variant={HOSTS_BUTTON_VARIANTS.PRIMARY}
                onClick={handleSave}
                disabled={loading.save}
                style={HOSTS_MODAL_BTN_STYLE}
              >
                {loading.save
                  ? HOSTS_BUTTON_LABELS.SAVING
                  : HOSTS_BUTTON_LABELS.SAVE}
              </Btn>
              <Btn
                variant={HOSTS_BUTTON_VARIANTS.CANCEL}
                onClick={handleCloseModal}
                disabled={loading.save}
                style={HOSTS_MODAL_BTN_STYLE}
              >
                {HOSTS_BUTTON_LABELS.CLOSE}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hosts;
