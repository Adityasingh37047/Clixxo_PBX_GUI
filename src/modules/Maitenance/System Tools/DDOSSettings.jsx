import React, { useState, useEffect } from "react";
import {
  Alert,
  Checkbox,
  CircularProgress,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import {
  DDOS_INITIAL_FORM,
  DDOS_INFO_LOG,
  DDOS_BREADCRUMB_ROOT,
  DDOS_BREADCRUMB_SECTION,
  DDOS_PAGE_TITLE,
  DDOS_LOCAL_STORAGE_KEY,
  DDOS_SERVICE_PORTS,
  DDOS_SIMULATION_IPS,
  DDOS_TOOLTIPS,
  DDOS_BUTTON_LABELS,
  DDOS_MESSAGE_DEFAULT,
  DDOS_MESSAGE_TIMEOUT_MS,
  DDOS_MESSAGES,
  DDOS_LABEL_ENABLE,
  DDOS_LABEL_WEB_PORT,
  DDOS_LABEL_WEB_LIMIT,
  DDOS_LABEL_FTP_PORT,
  DDOS_LABEL_FTP_LIMIT,
  DDOS_LABEL_SSH_PORT,
  DDOS_LABEL_SSH_LIMIT,
  DDOS_LABEL_TELNET_PORT,
  DDOS_LABEL_TELNET_LIMIT,
  DDOS_LABEL_BLACKLIST_VALIDITY,
  DDOS_LABEL_BLACKLIST_TIME,
  DDOS_CARD_TITLE_INFO_LOG,
  DDOS_BLACKLIST_OPTION_FOREVER,
  DDOS_BLACKLIST_OPTION_IN_SET_TIME,
} from "../../../constants/DDOSSettingsConstants";
import { postLinuxCmd } from "../../../api/apiService";

const DDOS_COMPACT_MQ = "(max-width: 768px)";
const DDOS_GRID_TWO_COL_MQ = "(min-width: 1100px)";
const DDOS_LABEL_COL_WIDTH = 188;
const DDOS_FIELD_COL_GAP = 16;
const DDOS_FORM_PAD_X = 28;
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
  accent: "#3E5475",
  sectionHeading: "#30415A",
};

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
  el.style.boxShadow = FOCUS_RING_SHADOW();
};

const inputInteraction = {
  onFocus: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    setFieldFocus(e.target);
  },
  onBlur: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    setFieldDefault(e.target);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldHover(e.target);
    }
  },
  onMouseLeave: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldDefault(e.target);
    }
  },
};

const DDOS_FIELD_BG_EDITABLE = "#ffffff";
const DDOS_FIELD_BG_READONLY = "#f1f5f9";

const systemFieldInputStyle = {
  width: "100%",
  minWidth: 0,
  maxWidth: "100%",
  padding: "0 12px",
  borderRadius: FIELD_RADIUS,
  boxSizing: "border-box",
  backgroundColor: DDOS_FIELD_BG_EDITABLE,
  lineHeight: 1.35,
  minHeight: 36,
  height: 36,
  fontSize: 13,
  border: `1px solid ${OUTLINED_BORDER}`,
  outline: "none",
  color: C.labelText,
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const ddosNumberInputStyle = {
  ...systemFieldInputStyle,
  maxWidth: 200,
};

const ddosSelectStyle = {
  ...ddosNumberInputStyle,
  appearance: "auto",
  paddingTop: 7,
  paddingBottom: 7,
  cursor: "pointer",
  backgroundColor: DDOS_FIELD_BG_EDITABLE,
};

const ddosFieldRowStyle = (isCompact) => ({
  display: "flex",
  flexDirection: isCompact ? "column" : "row",
  alignItems: isCompact ? "stretch" : "flex-start",
  width: "100%",
  gap: isCompact ? 8 : DDOS_FIELD_COL_GAP,
});

const ddosFieldLabelWrapStyle = (isCompact) =>
  isCompact
    ? { width: "100%", minWidth: 0 }
    : {
        flex: `0 0 ${DDOS_LABEL_COL_WIDTH}px`,
        width: DDOS_LABEL_COL_WIDTH,
        minWidth: DDOS_LABEL_COL_WIDTH,
        maxWidth: DDOS_LABEL_COL_WIDTH,
        paddingTop: 9,
      };

const ddosFieldControlWrapStyle = {
  flex: "1 1 auto",
  minWidth: 0,
  width: "100%",
};

const ddosFooterBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
  minWidth: 100,
};

const ddosCheckboxSx = {
  padding: 0,
  margin: 0,
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
};

const tooltipProps = {
  arrow: true,
  placement: "top",
  slotProps: {
    popper: {
      modifiers: [
        { name: "offset", options: { offset: [0, 8] } },
        { name: "preventOverflow", options: { padding: 8 } },
      ],
    },
    tooltip: {
      sx: {
        backgroundColor: "#fff",
        color: "#333",
        border: "1px solid #d1d5db",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        fontSize: 12,
        lineHeight: 1.45,
        maxWidth: 500,
        padding: "10px 12px",
      },
    },
    arrow: { sx: { color: "#fff" } },
  },
};

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
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
    },
    cancel: {
      background: "#e2e8f0",
      color: "#475569",
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
    },
  };

  const s = styles[variant] || styles.default;
  const hoverBg =
    {
      primary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      cancel: "#d4dce6",
      default: "#f1f5f9",
    }[variant] || "#f1f5f9";
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      cancel: "#c5ced9",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
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

  return (
    <button
      type={type || "button"}
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
      {children}
    </button>
  );
};

const DDOSFieldRow = ({
  label,
  tooltip,
  children,
  alignCenter = false,
  isCompact,
}) => {
  const labelNode = (
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: "100%",
        lineHeight: 1.4,
        wordBreak: "break-word",
        cursor: tooltip ? "help" : "default",
      }}
    >
      {label}
    </label>
  );

  return (
    <div
      style={{
        ...ddosFieldRowStyle(isCompact),
        alignItems: isCompact
          ? "stretch"
          : alignCenter
            ? "center"
            : "flex-start",
      }}
    >
      <div
        style={{
          ...ddosFieldLabelWrapStyle(isCompact),
          paddingTop: isCompact || alignCenter ? 0 : 9,
        }}
      >
        {tooltip ? (
          <Tooltip title={tooltip} {...tooltipProps}>
            {labelNode}
          </Tooltip>
        ) : (
          labelNode
        )}
      </div>
      <div style={ddosFieldControlWrapStyle}>{children}</div>
    </div>
  );
};

const ddosPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const ddosPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
};

const ddosTableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: CARD_RADIUS,
  boxShadow: C.cardShadow,
  overflow: "hidden",
  boxSizing: "border-box",
};

const ddosHeaderStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: CARD_RADIUS,
  borderTopRightRadius: CARD_RADIUS,
  display: "flex",
  alignItems: "center",
  padding: "7px 14px",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  borderBottom: `1px solid ${C.divider}`,
  boxSizing: "border-box",
};

const ddosBodyStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 20,
  padding: `20px ${DDOS_FORM_PAD_X}px 24px`,
  background: C.cardBg,
  boxSizing: "border-box",
};

const ddosConfigPanelStyle = {
  background: C.cardBg,
  border: `1px solid ${C.divider}`,
  borderRadius: 8,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  minHeight: 372,
};

const ddosConfigBodyStyle = {
  flex: "1 1 auto",
  padding: "18px 18px 20px",
  display: "flex",
  flexDirection: "column",
  gap: 16,
  minHeight: 0,
};

const ddosConfigFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  padding: "10px 18px",
  borderTop: `1px solid ${C.divider}`,
  background: C.cardBg,
  boxSizing: "border-box",
  flexShrink: 0,
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
  minHeight: 50,
};

const ddosConfigGridStyle = (isGridTwoCol) => ({
  display: "grid",
  gridTemplateColumns: isGridTwoCol ? "1fr 1fr" : "1fr",
  gap: isGridTwoCol ? 24 : 16,
  width: "100%",
  minWidth: 0,
  alignItems: "start",
});

const ddosConfigColumnStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
  minWidth: 0,
};

const ddosConfigFullWidthStyle = {
  gridColumn: "1 / -1",
  borderTop: `1px solid ${C.divider}`,
  paddingTop: 16,
};

const ddosOutputPanelStyle = {
  border: `1px solid ${C.divider}`,
  borderRadius: 8,
  overflow: "hidden",
  backgroundColor: C.cardBg,
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.02)",
};

const ddosOutputHeaderStyle = {
  width: "100%",
  minHeight: 44,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  padding: `10px 18px`,
  borderBottom: `1px solid ${C.divider}`,
  backgroundColor: C.cardBg,
  boxSizing: "border-box",
};

const ddosOutputHeaderTitleStyle = {
  fontSize: 13,
  fontWeight: 700,
  color: C.labelText,
  lineHeight: 1.35,
};

const ddosOutputBodyStyle = {
  backgroundColor: DDOS_FIELD_BG_READONLY,
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
  overflow: "hidden",
};

const ddosOutputTextareaStyle = {
  display: "block",
  width: "100%",
  minHeight: 160,
  maxHeight: 280,
  margin: 0,
  padding: "12px 16px 16px",
  border: "none",
  borderRadius: 0,
  outline: "none",
  resize: "vertical",
  boxSizing: "border-box",
  fontSize: 13,
  lineHeight: 1.6,
  fontFamily: "monospace",
  color: C.labelText,
  backgroundColor: "transparent",
  whiteSpace: "pre-wrap",
  cursor: "default",
};

const ddosFixedAlertSx = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  maxWidth: 500,
  wordBreak: "break-word",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
  fontWeight: 500,
};

const enableControlStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  minHeight: 36,
};

const DDOSBreadcrumb = () => (
  <div
    style={{
      fontSize: 12,
      color: "#94a3b8",
      marginBottom: 16,
      fontWeight: 400,
      display: "flex",
      alignItems: "center",
      gap: 4,
      flexWrap: "wrap",
      flexShrink: 0,
    }}
  >
    <span>{DDOS_BREADCRUMB_ROOT}</span>
    <span>&gt;</span>
    <span>{DDOS_BREADCRUMB_SECTION}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>{DDOS_PAGE_TITLE}</span>
  </div>
);

const DDOSSettings = () => {
  const isCompact = useMediaQuery(DDOS_COMPACT_MQ);
  const isGridTwoCol = useMediaQuery(DDOS_GRID_TWO_COL_MQ);
  const [form, setForm] = useState(DDOS_INITIAL_FORM);
  const [log, setLog] = useState(DDOS_INFO_LOG);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(DDOS_MESSAGE_DEFAULT);
  const [blacklistedIPs, setBlacklistedIPs] = useState(new Set());
  const [initialized, setInitialized] = useState(false);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(DDOS_MESSAGE_DEFAULT), DDOS_MESSAGE_TIMEOUT_MS);
  };

  useEffect(() => {
    const savedForm = localStorage.getItem(DDOS_LOCAL_STORAGE_KEY);
    if (savedForm) {
      try {
        const parsedForm = JSON.parse(savedForm);
        setForm(parsedForm);
        addLogEntry("System", "DDOS Settings loaded from saved state");
      } catch (error) {
        console.error("Error loading saved form state:", error);
        setForm(DDOS_INITIAL_FORM);
      }
    } else {
      fetchCurrentProtectionStatus();
    }
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (initialized) {
      localStorage.setItem(DDOS_LOCAL_STORAGE_KEY, JSON.stringify(form));
    }
  }, [form, initialized]);

  const fetchCurrentProtectionStatus = async () => {
    try {
      const response = await postLinuxCmd({
        cmd: "iptables -L INPUT -n --line-numbers",
      });

      if (response.response && response.responseData) {
        const rules = response.responseData;
        const currentForm = { ...DDOS_INITIAL_FORM };

        if (rules.includes("dpt:80") || rules.includes("dpt:443")) {
          currentForm.webPortAttack = true;
          const webLimitMatch = rules.match(/limit (\d+)\/minute/);
          if (webLimitMatch) {
            currentForm.webLimit = parseInt(webLimitMatch[1]);
          }
        }

        if (rules.includes("dpt:21")) {
          currentForm.ftpPortAttack = true;
          const ftpLimitMatch = rules.match(/limit (\d+)\/minute/);
          if (ftpLimitMatch) {
            currentForm.ftpLimit = parseInt(ftpLimitMatch[1]);
          }
        }

        if (rules.includes("dpt:22")) {
          currentForm.sshPortAttack = true;
          const sshLimitMatch = rules.match(/limit (\d+)\/minute/);
          if (sshLimitMatch) {
            currentForm.sshLimit = parseInt(sshLimitMatch[1]);
          }
        }

        if (rules.includes("dpt:23")) {
          currentForm.telnetPortAttack = true;
          const telnetLimitMatch = rules.match(/limit (\d+)\/minute/);
          if (telnetLimitMatch) {
            currentForm.telnetLimit = parseInt(telnetLimitMatch[1]);
          }
        }

        if (rules.includes("ddos_blacklist")) {
          if (rules.includes("seconds 999999999")) {
            currentForm.blacklistValidityType = "forever";
          } else {
            currentForm.blacklistValidityType = "inSetTime";
            const timeMatch = rules.match(/seconds (\d+)/);
            if (timeMatch) {
              currentForm.blacklistTime = parseInt(timeMatch[1]) / 60;
            }
          }
        }

        setForm(currentForm);
        addLogEntry("System", "Current DDOS protection status fetched");
      }
    } catch (error) {
      console.error("Error fetching current protection status:", error);
      setForm(DDOS_INITIAL_FORM);
    }
  };

  const handleChange = (key, value, type) => {
    setForm((prev) => ({
      ...prev,
      [key]: type === "checkbox" ? !prev[key] : value,
    }));
  };

  const addLogEntry = (action, ip, port = null) => {
    const timestamp = new Date()
      .toLocaleString()
      .replace(",", "")
      .replace(/\//g, "-");
    const portInfo = port ? `, PORT: ${port}` : "";
    const logEntry = `${timestamp}    ${action} ==> IP: ${ip}${portInfo}\n`;
    setLog((prev) => prev + logEntry);
  };

  const simulateAttackDetection = async () => {
    const serviceLimits = {
      web: form.webPortAttack ? form.webLimit : 0,
      ftp: form.ftpPortAttack ? form.ftpLimit : 0,
      ssh: form.sshPortAttack ? form.sshLimit : 0,
      telnet: form.telnetPortAttack ? form.telnetLimit : 0,
    };

    for (const [service, limit] of Object.entries(serviceLimits)) {
      if (limit > 0) {
        const servicePorts = DDOS_SERVICE_PORTS[service];
        const randomIP =
          DDOS_SIMULATION_IPS[
            Math.floor(Math.random() * DDOS_SIMULATION_IPS.length)
          ];
        const randomPort =
          servicePorts[Math.floor(Math.random() * servicePorts.length)];

        if (Math.random() > 0.3) {
          addLogEntry("Forbid", randomIP, randomPort);
          setBlacklistedIPs((prev) => new Set([...prev, randomIP]));

          if (
            form.blacklistValidityType === "inSetTime" &&
            form.blacklistTime
          ) {
            setTimeout(
              () => {
                addLogEntry("Release", randomIP);
                setBlacklistedIPs((prev) => {
                  const newSet = new Set(prev);
                  newSet.delete(randomIP);
                  return newSet;
                });
              },
              form.blacklistTime * 60 * 1000,
            );
          }
        }
      }
    }
  };

  const executeLinuxCommand = async (command) => {
    try {
      const response = await postLinuxCmd({ cmd: command });
      if (response.response && response.responseData !== undefined) {
        const timestamp = new Date().toLocaleString();
        const logEntry = `[${timestamp}] $ ${command}\n${response.responseData || ""}\n${"=".repeat(80)}\n`;
        setLog((prev) => prev + logEntry);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error executing Linux command:", error);
      return false;
    }
  };

  const configureDDOSProtection = async () => {
    setLoading(true);
    try {
      await removeAllDDOSProtection();

      const commands = [];

      if (form.webPortAttack && form.webLimit) {
        commands.push(
          `iptables -A INPUT -p tcp --dport 80 -m limit --limit ${form.webLimit}/minute -j ACCEPT`,
        );
        commands.push(`iptables -A INPUT -p tcp --dport 80 -j DROP`);
        commands.push(
          `iptables -A INPUT -p tcp --dport 443 -m limit --limit ${form.webLimit}/minute -j ACCEPT`,
        );
        commands.push(`iptables -A INPUT -p tcp --dport 443 -j DROP`);
        addLogEntry(
          "Configure",
          "WEB Port Protection enabled",
          `Limit: ${form.webLimit}/min`,
        );
      } else {
        addLogEntry("Configure", "WEB Port Protection disabled");
      }

      if (form.ftpPortAttack && form.ftpLimit) {
        commands.push(
          `iptables -A INPUT -p tcp --dport 21 -m limit --limit ${form.ftpLimit}/minute -j ACCEPT`,
        );
        commands.push(`iptables -A INPUT -p tcp --dport 21 -j DROP`);
        addLogEntry(
          "Configure",
          "FTP Port Protection enabled",
          `Limit: ${form.ftpLimit}/min`,
        );
      } else {
        addLogEntry("Configure", "FTP Port Protection disabled");
      }

      if (form.sshPortAttack && form.sshLimit) {
        commands.push(
          `iptables -A INPUT -p tcp --dport 22 -m limit --limit ${form.sshLimit}/minute -j ACCEPT`,
        );
        commands.push(`iptables -A INPUT -p tcp --dport 22 -j DROP`);
        addLogEntry(
          "Configure",
          "SSH Port Protection enabled",
          `Limit: ${form.sshLimit}/min`,
        );
      } else {
        addLogEntry("Configure", "SSH Port Protection disabled");
      }

      if (form.telnetPortAttack && form.telnetLimit) {
        commands.push(
          `iptables -A INPUT -p tcp --dport 23 -m limit --limit ${form.telnetLimit}/minute -j ACCEPT`,
        );
        commands.push(`iptables -A INPUT -p tcp --dport 23 -j DROP`);
        addLogEntry(
          "Configure",
          "TELNET Port Protection enabled",
          `Limit: ${form.telnetLimit}/min`,
        );
      } else {
        addLogEntry("Configure", "TELNET Port Protection disabled");
      }

      if (form.blacklistValidityType === "forever") {
        commands.push(
          `iptables -A INPUT -m recent --name ddos_blacklist --set`,
        );
        commands.push(
          `iptables -A INPUT -m recent --name ddos_blacklist --rcheck --seconds 999999999 -j DROP`,
        );
        addLogEntry("Configure", "Blacklist validity set to Forever");
      } else if (
        form.blacklistValidityType === "inSetTime" &&
        form.blacklistTime
      ) {
        commands.push(
          `iptables -A INPUT -m recent --name ddos_blacklist --set`,
        );
        commands.push(
          `iptables -A INPUT -m recent --name ddos_blacklist --rcheck --seconds ${form.blacklistTime * 60} -j DROP`,
        );
        addLogEntry(
          "Configure",
          "Blacklist validity set to Time-based",
          `Duration: ${form.blacklistTime} min`,
        );
      }

      for (const cmd of commands) {
        await executeLinuxCommand(cmd);
      }

      setTimeout(() => {
        simulateAttackDetection();
      }, 2000);

      showMessage("success", DDOS_MESSAGES.configureSuccess);
    } catch (error) {
      console.error("Error configuring DDOS protection:", error);
      showMessage("error", DDOS_MESSAGES.configureFailed);
    } finally {
      setLoading(false);
    }
  };

  const removeAllDDOSProtection = async () => {
    try {
      const commands = ["iptables -F INPUT", "iptables -X ddos_blacklist"];

      for (const cmd of commands) {
        await executeLinuxCommand(cmd);
      }

      addLogEntry("Configure", "All DDOS Protection rules removed");
    } catch (error) {
      console.error("Error removing DDOS protection:", error);
    }
  };

  const handleSave = async (e) => {
    e?.preventDefault?.();
    await configureDDOSProtection();
  };

  const handleReset = () => {
    setForm(DDOS_INITIAL_FORM);
    localStorage.removeItem(DDOS_LOCAL_STORAGE_KEY);
    showMessage("info", DDOS_MESSAGES.resetSuccess);
  };

  const handleSimulateAttack = () => {
    simulateAttackDetection();
    showMessage("info", DDOS_MESSAGES.simulateTriggered);
  };

  const handleClearLogs = () => {
    setLog("");
    setBlacklistedIPs(new Set());
    showMessage("info", DDOS_MESSAGES.logsCleared);
  };

  const renderEnableRow = (label, tooltipKey, fieldKey) => (
    <DDOSFieldRow
      label={label}
      tooltip={DDOS_TOOLTIPS[tooltipKey]}
      alignCenter
      isCompact={isCompact}
    >
      <div style={enableControlStyle}>
        <Checkbox
          size="small"
          checked={!!form[fieldKey]}
          onChange={() => handleChange(fieldKey, !form[fieldKey], "checkbox")}
          sx={ddosCheckboxSx}
        />
        <span style={{ fontSize: 13, color: C.valueText }}>
          {DDOS_LABEL_ENABLE}
        </span>
      </div>
    </DDOSFieldRow>
  );

  const renderLimitRow = (label, tooltipKey, fieldKey) => (
    <DDOSFieldRow
      label={label}
      tooltip={DDOS_TOOLTIPS[tooltipKey]}
      isCompact={isCompact}
    >
      <input
        type="number"
        value={form[fieldKey] || ""}
        onChange={(e) =>
          handleChange(fieldKey, Number(e.target.value), "number")
        }
        style={ddosNumberInputStyle}
        {...inputInteraction}
      />
    </DDOSFieldRow>
  );

  return (
    <div
      style={{
        ...ddosPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
      data-native-scroll
    >
      <div style={ddosPageInnerStyle}>
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage(DDOS_MESSAGE_DEFAULT)}
            sx={{
              ...ddosFixedAlertSx,
              ...(isCompact
                ? { left: 8, right: 8, top: 12, minWidth: 0, maxWidth: "none" }
                : {}),
            }}
          >
            {message.text}
          </Alert>
        )}

        <DDOSBreadcrumb />

        <div style={ddosTableContainerStyle}>
          <div style={ddosHeaderStyle}>
            <span>{DDOS_PAGE_TITLE}</span>
          </div>

          <div style={ddosBodyStyle}>
            <div style={ddosConfigPanelStyle}>
              <div style={ddosConfigBodyStyle}>
                <div style={ddosConfigGridStyle(isGridTwoCol)}>
                  <div style={ddosConfigColumnStyle}>
                    {renderEnableRow(
                      DDOS_LABEL_WEB_PORT,
                      "webPortAttack",
                      "webPortAttack",
                    )}
                    {form.webPortAttack &&
                      renderLimitRow(
                        DDOS_LABEL_WEB_LIMIT,
                        "webLimit",
                        "webLimit",
                      )}

                    {renderEnableRow(
                      DDOS_LABEL_FTP_PORT,
                      "ftpPortAttack",
                      "ftpPortAttack",
                    )}
                    {form.ftpPortAttack &&
                      renderLimitRow(
                        DDOS_LABEL_FTP_LIMIT,
                        "ftpLimit",
                        "ftpLimit",
                      )}
                  </div>

                  <div style={ddosConfigColumnStyle}>
                    {renderEnableRow(
                      DDOS_LABEL_SSH_PORT,
                      "sshPortAttack",
                      "sshPortAttack",
                    )}
                    {form.sshPortAttack &&
                      renderLimitRow(
                        DDOS_LABEL_SSH_LIMIT,
                        "sshLimit",
                        "sshLimit",
                      )}

                    {renderEnableRow(
                      DDOS_LABEL_TELNET_PORT,
                      "telnetPortAttack",
                      "telnetPortAttack",
                    )}
                    {form.telnetPortAttack &&
                      renderLimitRow(
                        DDOS_LABEL_TELNET_LIMIT,
                        "telnetLimit",
                        "telnetLimit",
                      )}
                  </div>

                  <div style={ddosConfigFullWidthStyle}>
                    <DDOSFieldRow
                      label={DDOS_LABEL_BLACKLIST_VALIDITY}
                      tooltip={DDOS_TOOLTIPS.blacklistValidity}
                      isCompact={isCompact}
                    >
                      <select
                        value={form.blacklistValidityType}
                        onChange={(e) =>
                          handleChange(
                            "blacklistValidityType",
                            e.target.value,
                            "select",
                          )
                        }
                        style={ddosSelectStyle}
                        {...inputInteraction}
                      >
                        <option value="forever">
                          {DDOS_BLACKLIST_OPTION_FOREVER}
                        </option>
                        <option value="inSetTime">
                          {DDOS_BLACKLIST_OPTION_IN_SET_TIME}
                        </option>
                      </select>
                    </DDOSFieldRow>

                    {form.blacklistValidityType === "inSetTime" &&
                      renderLimitRow(
                        DDOS_LABEL_BLACKLIST_TIME,
                        "blacklistTime",
                        "blacklistTime",
                      )}
                  </div>
                </div>
              </div>

              <div style={ddosConfigFooterStyle}>
                <Btn
                  type="button"
                  variant="cancel"
                  onClick={handleReset}
                  disabled={loading}
                  style={ddosFooterBtnStyle}
                >
                  {DDOS_BUTTON_LABELS.RESET}
                </Btn>
                <Btn
                  type="button"
                  variant="primary"
                  onClick={handleSave}
                  disabled={loading}
                  style={ddosFooterBtnStyle}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={14} color="inherit" />
                      {DDOS_BUTTON_LABELS.CONFIGURING}
                    </>
                  ) : (
                    DDOS_BUTTON_LABELS.SAVE
                  )}
                </Btn>
                <Btn
                  type="button"
                  variant="cancel"
                  onClick={handleSimulateAttack}
                  disabled={loading}
                  style={ddosFooterBtnStyle}
                >
                  {DDOS_BUTTON_LABELS.SIMULATE_ATTACK}
                </Btn>
              </div>
            </div>

            <div style={ddosOutputPanelStyle}>
              <div style={ddosOutputHeaderStyle}>
                <span style={ddosOutputHeaderTitleStyle}>
                  {DDOS_CARD_TITLE_INFO_LOG}
                </span>
                <Btn
                  variant="cancel"
                  onClick={handleClearLogs}
                  disabled={loading}
                  style={ddosFooterBtnStyle}
                >
                  {DDOS_BUTTON_LABELS.CLEAR_LOGS}
                </Btn>
              </div>
              <div style={ddosOutputBodyStyle}>
                <textarea
                  style={ddosOutputTextareaStyle}
                  value={log}
                  readOnly
                  tabIndex={-1}
                  onFocus={(e) => e.target.blur()}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DDOSSettings;
