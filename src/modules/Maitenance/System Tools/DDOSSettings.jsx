import React, { useState, useEffect } from "react";
import Tooltip from "@mui/material/Tooltip";
import { InfoOutlined } from "@mui/icons-material";
import {
  DDOS_FIELDS,
  DDOS_INITIAL_FORM,
  DDOS_INFO_LOG,
} from "../../../constants/DDOSSettingsConstants";
import { Alert, Checkbox } from "@mui/material";
import { postLinuxCmd } from "../../../api/apiService";
// ── Color palette (same as AccountManage) ────────────────────────────────────
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#9CA3AF",
  divider: "#9CA3AF",
  cardShadow: "0 4px 20px rgba(15,23,42,0.06)",
  labelText: "#3E5475",
  valueText: "#1e293b",
  strongText: "#3E5475",
  mutedText: "#94a3b8",
  accent: "#0284c7",
  primary: "#2563eb",
  primaryHover: "#1d4ed8",
  errorRed: "#dc2626",
};
// ── Local field UI (inlined from maitenanceSharedUi) ──
const OUTLINED_BORDER = "rgba(0, 0, 0, 0.23)";
const OUTLINED_HOVER = "rgba(0, 0, 0, 0.87)";
const OUTLINED_FOCUS = "#1976d2";
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
  backgroundColor: "#f8fafc",
  outline: "none",
  color: "#3E5475",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
  boxShadow: "none",
};

const SYSTEM_TOOLS_FILL_BG_EDITABLE = "#ffffff";
const SYSTEM_TOOLS_FILL_BG_READ_ONLY = "#f1f5f9";

const systemToolsEditableFieldInputStyle = {
  ...systemToolsFieldInputStyle,
  backgroundColor: SYSTEM_TOOLS_FILL_BG_EDITABLE,
};
const systemToolsEditableFieldSelectStyle = {
  ...systemToolsFieldInputStyle,
  appearance: "auto",
  backgroundColor: SYSTEM_TOOLS_FILL_BG_EDITABLE,
};
const systemToolsReadOnlyFieldTextAreaStyle = {
  fontSize: 13,
  padding: "12px",
  backgroundColor: SYSTEM_TOOLS_FILL_BG_READ_ONLY,
  border: `1px solid ${OUTLINED_BORDER}`,
  color: "#3E5475",
  outline: "none",
  fontFamily: "monospace",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
  boxShadow: "none",
  borderRadius: 6,
  width: "100%",
};
const inputStyle = systemToolsEditableFieldInputStyle;
const selectStyle = systemToolsEditableFieldSelectStyle;
const tooltipProps = {
  arrow: true,
  placement: "top",
  slotProps: {
    tooltip: {
      sx: {
        bgcolor: "#fff",
        color: "#334155",
        border: "1px solid #d1d5db",
        fontSize: 12,
        maxWidth: 500,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      },
    },
    arrow: {
      sx: {
        color: "#fff",
      },
    },
  },
};

const tooltips = {
  webPortAttack:
    "Protects the system from suspicious or excessive access attempts targeting web management ports.",
  ftpPortAttack: "Protects the system from suspicious or excessive access attempts targeting FTP ports.",
  sshPortAttack: "Protects the system from suspicious or excessive access attempts targeting SSH ports.",
  telnetPortAttack: "Protects the system from suspicious or excessive access attempts targeting TELNET ports.",
  blacklistValidity: "Specifies how long a blacklisted IP address remains blocked before being automatically removed from the blacklist.",
  blacklistTime: "Specifies the time duration for which a blacklisted IP address remains blocked.",
  ftpLimit: "Specifies the maximum number of FTP connections allowed per minute.",
  sshLimit: "Specifies the maximum number of SSH connections allowed per minute.",
  telnetLimit: "Specifies the maximum number of TELNET connections allowed per minute.",
  blacklistValidityTooltip: "Specifies how long a blacklisted IP address remains blocked before being automatically removed from the blacklist.",
  blacklistTimeTooltip: "Specifies the time duration for which a blacklisted IP address remains blocked.",
  webLimit: "Specifies the maximum number of WEB connections allowed per minute.",
};


// ── Button Component (same as AccountManage) ─────────────────────────────────
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
  };

  const s = styles[variant] || styles.default;
  const hoverBg = (() => {
    switch (variant) {
      case "primary":
        return "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)";
      case "cancel":
        return "#b6c2d3";
      case "default":
      default:
        return "#e2e8f0";
    }
  })();

  const baseBg = s.background;

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
        fontSize: 13,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "all 0.15s ease",
        height: 36,
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
    </Component>
  );
};

const tableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 10,
  boxShadow: C.cardShadow,
  overflow: "hidden",
  marginBottom: 8,
};

const blueBarStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: 10,
  borderTopRightRadius: 10,
  marginBottom: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  padding: "7px 14px",
  flexWrap: "wrap",
  gap: 12,
  fontWeight: 700,
  fontSize: 13,
  color: "#3E5475",
  borderBottom: `1px solid ${C.divider}`,
};

const labelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: C.labelText,
  textAlign: "left",
};

const checkboxSx = {
  padding: "4px",
  marginRight: "4px",
  color: "#64748b",
  "&.Mui-checked": { color: C.accent },
};

const DDOSSettings = () => {
  const [form, setForm] = useState(DDOS_INITIAL_FORM);
  const [log, setLog] = useState(DDOS_INFO_LOG);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [blacklistedIPs, setBlacklistedIPs] = useState(new Set());
  const [initialized, setInitialized] = useState(false);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  // Load saved form state from localStorage on component mount
  useEffect(() => {
    const savedForm = localStorage.getItem("ddosSettingsForm");
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
      // If no saved state, fetch current iptables rules
      fetchCurrentProtectionStatus();
    }
    setInitialized(true);
  }, []);

  // Save form state to localStorage whenever form changes
  useEffect(() => {
    if (initialized) {
      localStorage.setItem("ddosSettingsForm", JSON.stringify(form));
    }
  }, [form, initialized]);

  const fetchCurrentProtectionStatus = async () => {
    try {
      // Check current iptables rules to determine which protections are active
      const response = await postLinuxCmd({
        cmd: "iptables -L INPUT -n --line-numbers",
      });

      if (response.response && response.responseData) {
        const rules = response.responseData;
        const currentForm = { ...DDOS_INITIAL_FORM };

        // Check for WEB protection (ports 80, 443)
        if (rules.includes("dpt:80") || rules.includes("dpt:443")) {
          currentForm.webPortAttack = true;
          const webLimitMatch = rules.match(/limit (\d+)\/minute/);
          if (webLimitMatch) {
            currentForm.webLimit = parseInt(webLimitMatch[1]);
          }
        }

        // Check for FTP protection (port 21)
        if (rules.includes("dpt:21")) {
          currentForm.ftpPortAttack = true;
          const ftpLimitMatch = rules.match(/limit (\d+)\/minute/);
          if (ftpLimitMatch) {
            currentForm.ftpLimit = parseInt(ftpLimitMatch[1]);
          }
        }

        // Check for SSH protection (port 22)
        if (rules.includes("dpt:22")) {
          currentForm.sshPortAttack = true;
          const sshLimitMatch = rules.match(/limit (\d+)\/minute/);
          if (sshLimitMatch) {
            currentForm.sshLimit = parseInt(sshLimitMatch[1]);
          }
        }

        // Check for TELNET protection (port 23)
        if (rules.includes("dpt:23")) {
          currentForm.telnetPortAttack = true;
          const telnetLimitMatch = rules.match(/limit (\d+)\/minute/);
          if (telnetLimitMatch) {
            currentForm.telnetLimit = parseInt(telnetLimitMatch[1]);
          }
        }

        // Check for blacklist validity
        if (rules.includes("ddos_blacklist")) {
          if (rules.includes("seconds 999999999")) {
            currentForm.blacklistValidityType = "forever";
          } else {
            currentForm.blacklistValidityType = "inSetTime";
            const timeMatch = rules.match(/seconds (\d+)/);
            if (timeMatch) {
              currentForm.blacklistTime = parseInt(timeMatch[1]) / 60; // Convert seconds to minutes
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
    // Simulate detecting attacks and managing blacklist
    const ports = { web: [80, 443], ftp: [21], ssh: [22], telnet: [23] };
    const serviceLimits = {
      web: form.webPortAttack ? form.webLimit : 0,
      ftp: form.ftpPortAttack ? form.ftpLimit : 0,
      ssh: form.sshPortAttack ? form.sshLimit : 0,
      telnet: form.telnetPortAttack ? form.telnetLimit : 0,
    };

    // Simulate random IP attacks
    const randomIPs = [
      "192.168.1.100",
      "10.0.0.50",
      "172.16.0.25",
      "203.0.113.10",
    ];

    for (const [service, limit] of Object.entries(serviceLimits)) {
      if (limit > 0) {
        const servicePorts = ports[service];
        const randomIP =
          randomIPs[Math.floor(Math.random() * randomIPs.length)];
        const randomPort =
          servicePorts[Math.floor(Math.random() * servicePorts.length)];

        // Simulate attack exceeding limit
        if (Math.random() > 0.3) {
          // 70% chance of attack
          addLogEntry("Forbid", randomIP, randomPort);
          setBlacklistedIPs((prev) => new Set([...prev, randomIP]));

          // Schedule release based on blacklist validity
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
            ); // Convert minutes to milliseconds
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
      // First, remove all existing DDOS protection rules
      await removeAllDDOSProtection();

      let commands = [];

      // Configure WEB Port Attack Protection
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

      // Configure FTP Port Attack Protection
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

      // Configure SSH Port Attack Protection
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

      // Configure TELNET Port Attack Protection
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

      // Configure Blacklist Validity
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

      // Execute all commands
      for (const cmd of commands) {
        await executeLinuxCommand(cmd);
      }

      // Start monitoring for attacks after configuration
      setTimeout(() => {
        simulateAttackDetection();
      }, 2000); // Wait 2 seconds after configuration

      showMessage("success", "DDOS Protection configured successfully!");
    } catch (error) {
      console.error("Error configuring DDOS protection:", error);
      showMessage("error", "Failed to configure DDOS protection");
    } finally {
      setLoading(false);
    }
  };

  const removeAllDDOSProtection = async () => {
    try {
      // Remove all possible DDOS protection rules (using -F to flush INPUT chain)
      const commands = ["iptables -F INPUT", "iptables -X ddos_blacklist"];

      // Execute removal commands
      for (const cmd of commands) {
        await executeLinuxCommand(cmd);
      }

      addLogEntry("Configure", "All DDOS Protection rules removed");
    } catch (error) {
      console.error("Error removing DDOS protection:", error);
    }
  };

  const removeDDOSProtection = async () => {
    setLoading(true);
    try {
      await removeAllDDOSProtection();
      showMessage("success", "DDOS Protection removed successfully!");
    } catch (error) {
      console.error("Error removing DDOS protection:", error);
      showMessage("error", "Failed to remove DDOS protection");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    await configureDDOSProtection();
  };

  const handleReset = () => {
    setForm(DDOS_INITIAL_FORM);
    localStorage.removeItem("ddosSettingsForm"); // Clear saved state
    showMessage("info", "Form reset to default values");
  };

  const handleSimulateAttack = () => {
    simulateAttackDetection();
    showMessage("info", "Attack simulation triggered");
  };

  const handleClearLogs = () => {
    setLog("");
    setBlacklistedIPs(new Set());
    showMessage("info", "Logs cleared");
  };

  return (
    <div
      className="min-h-[calc(100vh-80px)] p-4 flex flex-col items-center"
      style={{ backgroundColor: C.pageBg }}
    >
      {/* ── Alerts ── */}
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
          <span style={{ color: C.strongText, fontWeight: 600 }}>
            DDOS Settings
          </span>
        </div>

        <div style={tableContainerStyle}>
          {/* Header */}
          <div style={blueBarStyle}>
            <span>DDOS Settings</span>
          </div>

          <div className="w-full px-5 pt-3 pb-2 flex flex-col items-center">
            <form
              onSubmit={handleSave}
              className="w-full flex flex-col items-center"
            >
              {/* Form Fields Grid — centered like Signaling Call Test */}
              <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 items-center">
                <Tooltip title={tooltips.webPortAttack} {...tooltipProps}>
                  <span style={labelStyle}>WEB Port Attack Protection</span>
                </Tooltip>
                <div className="flex items-center gap-2">
                  <Checkbox
                    size="small"
                    checked={!!form.webPortAttack}
                    onChange={() =>
                      handleChange(
                        "webPortAttack",
                        !form.webPortAttack,
                        "checkbox",
                      )
                    }
                    sx={checkboxSx}
                  />
                  <span style={{ fontSize: 14, color: C.valueText }}>
                    Enable
                  </span>
                </div>

                {form.webPortAttack && (
                  <>
                    <Tooltip title={tooltips.webLimit} {...tooltipProps}>
                      <span style={labelStyle}>WEB Limit</span>
                    </Tooltip>
                    <input
                      type="number"
                      value={form.webLimit || ""}
                      onChange={(e) =>
                        handleChange(
                          "webLimit",
                          Number(e.target.value),
                          "number",
                        )
                      }
                      style={inputStyle}
                      {...inputInteraction}
                    />
                  </>
                )}

                <Tooltip title={tooltips.ftpPortAttack} {...tooltipProps}>
                  <span style={labelStyle}>FTP Port Attack Protection</span>
                </Tooltip>
                <div className="flex items-center gap-2">
                  <Checkbox
                    size="small"
                    checked={!!form.ftpPortAttack}
                    onChange={() =>
                      handleChange(
                        "ftpPortAttack",
                        !form.ftpPortAttack,
                        "checkbox",
                      )
                    }
                    sx={checkboxSx}
                  />
                  <span style={{ fontSize: 14, color: C.valueText }}>
                    Enable
                  </span>
                </div>

                {form.ftpPortAttack && (
                  <>
                    <Tooltip title={tooltips.ftpLimit} {...tooltipProps}>
                      <span style={labelStyle}>FTP Limit</span>
                    </Tooltip>
                    <input
                      type="number"
                      value={form.ftpLimit || ""}
                      onChange={(e) =>
                        handleChange(
                          "ftpLimit",
                          Number(e.target.value),
                          "number",
                        )
                      }
                      style={inputStyle}
                      {...inputInteraction}
                    />
                  </>
                )}

                <Tooltip title={tooltips.sshPortAttack} {...tooltipProps}>
                  <span style={labelStyle}>SSH Port Attack Protection</span>
                </Tooltip>
                <div className="flex items-center gap-2">
                  <Checkbox
                    size="small"
                    checked={!!form.sshPortAttack}
                    onChange={() =>
                      handleChange(
                        "sshPortAttack",
                        !form.sshPortAttack,
                        "checkbox",
                      )
                    }
                    sx={checkboxSx}
                  />
                  <span style={{ fontSize: 14, color: C.valueText }}>
                    Enable
                  </span>
                </div>

                {form.sshPortAttack && (
                  <>
                    <Tooltip title={tooltips.sshLimit} {...tooltipProps}>
                      <span style={labelStyle}>SSH Limit</span>
                    </Tooltip>
                    <input
                      type="number"
                      value={form.sshLimit || ""}
                      onChange={(e) =>
                        handleChange(
                          "sshLimit",
                          Number(e.target.value),
                          "number",
                        )
                      }
                      style={inputStyle}
                      {...inputInteraction}
                    />
                  </>
                )}

                <Tooltip title={tooltips.telnetPortAttack} {...tooltipProps}>
                  <span style={labelStyle}>TELNET Port Attack Protection</span>
                </Tooltip>
                <div className="flex items-center gap-2">
                  <Checkbox
                    size="small"
                    checked={!!form.telnetPortAttack}
                    onChange={() =>
                      handleChange(
                        "telnetPortAttack",
                        !form.telnetPortAttack,
                        "checkbox",
                      )
                    }
                    sx={checkboxSx}
                  />
                  <span style={{ fontSize: 14, color: C.valueText }}>
                    Enable
                  </span>
                </div>

                {form.telnetPortAttack && (
                  <>
                    <Tooltip title={tooltips.telnetLimit} {...tooltipProps}>
                      <span style={labelStyle}>TELNET Limit</span>
                    </Tooltip>
                    <input
                      type="number"
                      value={form.telnetLimit || ""}
                      onChange={(e) =>
                        handleChange(
                          "telnetLimit",
                          Number(e.target.value),
                          "number",
                        )
                      }
                      style={inputStyle}
                      {...inputInteraction}
                    />
                  </>
                )}

                  <Tooltip title={tooltips.blacklistValidity} {...tooltipProps}>
                  <span style={labelStyle}>
                  Set Validity of Attacker IP Blacklist
                </span>
                </Tooltip>
                <select
                  value={form.blacklistValidityType}
                  onChange={(e) =>
                    handleChange(
                      "blacklistValidityType",
                      e.target.value,
                      "select",
                    )
                  }
                  style={selectStyle}
                  {...inputInteraction}
                >
                  <option value="forever">Forever</option>
                  <option value="inSetTime">In The Set Time</option>
                </select>

                {form.blacklistValidityType === "inSetTime" && (
                  <>
                    <Tooltip title={tooltips.blacklistTime} {...tooltipProps}>
                      <span style={labelStyle}>Time (Min)</span>
                    </Tooltip>
                    <input
                      type="number"
                      value={form.blacklistTime || ""}
                      onChange={(e) =>
                        handleChange(
                          "blacklistTime",
                          Number(e.target.value),
                          "number",
                        )
                      }
                      style={inputStyle}
                      {...inputInteraction}
                    />
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="w-full mt-3 flex flex-col items-center">
                <div
                  className="w-full max-w-2xl flex flex-row flex-wrap justify-center gap-3 pt-2 pb-2"
                  style={{ borderTop: `1px solid ${C.divider}` }}
                >
                  <Btn
                    type="button"
                    variant="cancel"
                    onClick={handleReset}
                    disabled={loading}
                    style={{ minWidth: 110, height: 34 }}
                  >
                    Reset
                  </Btn>
                  <Btn
                    type="submit"
                    variant="primary"
                    disabled={loading}
                    style={{ minWidth: 110, height: 34 }}
                  >
                    {loading ? "Configuring..." : "Save"}
                  </Btn>
                  <Btn
                    type="button"
                    variant="cancel"
                    onClick={handleSimulateAttack}
                    disabled={loading}
                    style={{ minWidth: 110, height: 34 }}
                  >
                    Simulate Attack
                  </Btn>
                </div>
                <div
                  style={{
                    width: "calc(100% - 32px)",
                    marginLeft: 16,
                    marginRight: 16,
                    borderBottom: `1px solid ${C.divider}`,
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Info Log Section */}
              <div className="w-full max-w-2xl mt-1 pt-2 pb-0">
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 items-center mb-1">
                  <label style={labelStyle}>Info Log</label>
                  <div className="flex items-center justify-start md:justify-end min-h-[34px]">
                    <Btn
                      type="button"
                      variant="cancel"
                      onClick={handleClearLogs}
                      disabled={loading}
                      style={{ minWidth: 100, height: 28, fontSize: 12 }}
                    >
                      Clear Logs
                    </Btn>
                  </div>
                </div>
                <textarea
                  className="w-full rounded resize-y"
                  style={{
                    ...systemToolsReadOnlyFieldTextAreaStyle,
                    minHeight: 120,
                    maxHeight: 200,
                    color: C.valueText,
                  }}
                  value={log}
                  readOnly
                  {...inputInteraction}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DDOSSettings;
