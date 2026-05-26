import React, { useState, useEffect } from "react";
import {
  DDOS_FIELDS,
  DDOS_INITIAL_FORM,
  DDOS_INFO_LOG,
} from "../../../constants/DDOSSettingsConstants";
import { Select, MenuItem, Alert } from "@mui/material";
import { postLinuxCmd } from "../../../api/apiService";

// ── Color palette (same as AccountManage) ────────────────────────────────────
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#e2e8f0",
  divider: "#f1f5f9",
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
      background: "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
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
  borderRadius: 20,
  boxShadow: C.cardShadow,
  overflow: "hidden",
  marginBottom: 24,
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
  color: C.strongText,
  borderBottom: `1px solid ${C.divider}`,
};

const inputInteraction = {
  onFocus: (e) => (e.target.style.borderColor = C.accent),
  onBlur: (e) => (e.target.style.borderColor = C.cardBorder),
  onMouseEnter: (e) => {
    if (document.activeElement !== e.target)
      e.target.style.borderColor = "#94a3b8";
  },
  onMouseLeave: (e) => {
    if (document.activeElement !== e.target)
      e.target.style.borderColor = C.cardBorder;
  },
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

          <div className="p-6">
            <div className="w-full max-w-4xl mx-auto">
              <form
                onSubmit={handleSave}
                className="w-full flex flex-col gap-0"
              >
                {/* Form Fields Grid */}
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  {/* WEB Port Attack Protection */}
                  <React.Fragment>
                    <div className="flex items-center text-[13px] font-semibold text-slate-500 text-left pl-2 sm:pl-4 whitespace-nowrap min-h-[34px]">
                      <span style={{ color: C.labelText }}>
                        WEB Port Attack Protection
                      </span>
                    </div>
                    <div className="flex items-center min-h-[34px]">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!!form.webPortAttack}
                          onChange={() =>
                            handleChange(
                              "webPortAttack",
                              !form.webPortAttack,
                              "checkbox",
                            )
                          }
                          style={{
                            accentColor: C.accent,
                            width: 16,
                            height: 16,
                          }}
                        />
                        <span style={{ fontSize: 14, color: C.valueText }}>
                          Enable
                        </span>
                      </div>
                    </div>
                  </React.Fragment>

                  {/* WEB Limit - Conditional */}
                  {form.webPortAttack && (
                    <React.Fragment>
                      <div className="flex items-center text-[13px] font-semibold text-slate-500 text-left pl-2 sm:pl-4 whitespace-nowrap min-h-[34px]">
                        <span style={{ color: C.labelText }}>WEB Limit</span>
                      </div>
                      <div className="flex items-center min-h-[34px]">
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
                          style={{
                            padding: "6px 12px",
                            borderRadius: 6,
                            border: `1px solid ${C.cardBorder}`,
                            fontSize: 14,
                            width: "100%",
                            maxWidth: 180,
                            backgroundColor: "#f8fafc",
                            outline: "none",
                            color: C.valueText,
                            transition: "border-color 0.2s ease",
                          }}
                          {...inputInteraction}
                        />
                      </div>
                    </React.Fragment>
                  )}

                  {/* FTP Port Attack Protection */}
                  <React.Fragment>
                    <div className="flex items-center text-[13px] font-semibold text-slate-500 text-left pl-2 sm:pl-4 whitespace-nowrap min-h-[34px]">
                      <span style={{ color: C.labelText }}>
                        FTP Port Attack Protection
                      </span>
                    </div>
                    <div className="flex items-center min-h-[34px]">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!!form.ftpPortAttack}
                          onChange={() =>
                            handleChange(
                              "ftpPortAttack",
                              !form.ftpPortAttack,
                              "checkbox",
                            )
                          }
                          style={{
                            accentColor: C.accent,
                            width: 16,
                            height: 16,
                          }}
                        />
                        <span style={{ fontSize: 14, color: C.valueText }}>
                          Enable
                        </span>
                      </div>
                    </div>
                  </React.Fragment>

                  {/* FTP Limit - Conditional */}
                  {form.ftpPortAttack && (
                    <React.Fragment>
                      <div className="flex items-center text-[13px] font-semibold text-slate-500 text-left pl-2 sm:pl-4 whitespace-nowrap min-h-[34px]">
                        <span style={{ color: C.labelText }}>FTP Limit</span>
                      </div>
                      <div className="flex items-center min-h-[34px]">
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
                          style={{
                            padding: "6px 12px",
                            borderRadius: 6,
                            border: `1px solid ${C.cardBorder}`,
                            fontSize: 14,
                            width: "100%",
                            maxWidth: 180,
                            backgroundColor: "#f8fafc",
                            outline: "none",
                            color: C.valueText,
                            transition: "border-color 0.2s ease",
                          }}
                          {...inputInteraction}
                        />
                      </div>
                    </React.Fragment>
                  )}

                  {/* SSH Port Attack Protection */}
                  <React.Fragment>
                    <div className="flex items-center text-[13px] font-semibold text-slate-500 text-left pl-2 sm:pl-4 whitespace-nowrap min-h-[34px]">
                      <span style={{ color: C.labelText }}>
                        SSH Port Attack Protection
                      </span>
                    </div>
                    <div className="flex items-center min-h-[34px]">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!!form.sshPortAttack}
                          onChange={() =>
                            handleChange(
                              "sshPortAttack",
                              !form.sshPortAttack,
                              "checkbox",
                            )
                          }
                          style={{
                            accentColor: C.accent,
                            width: 16,
                            height: 16,
                          }}
                        />
                        <span style={{ fontSize: 14, color: C.valueText }}>
                          Enable
                        </span>
                      </div>
                    </div>
                  </React.Fragment>

                  {/* SSH Limit - Conditional */}
                  {form.sshPortAttack && (
                    <React.Fragment>
                      <div className="flex items-center text-[13px] font-semibold text-slate-500 text-left pl-2 sm:pl-4 whitespace-nowrap min-h-[34px]">
                        <span style={{ color: C.labelText }}>SSH Limit</span>
                      </div>
                      <div className="flex items-center min-h-[34px]">
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
                          style={{
                            padding: "6px 12px",
                            borderRadius: 6,
                            border: `1px solid ${C.cardBorder}`,
                            fontSize: 14,
                            width: "100%",
                            maxWidth: 180,
                            backgroundColor: "#f8fafc",
                            outline: "none",
                            color: C.valueText,
                            transition: "border-color 0.2s ease",
                          }}
                          {...inputInteraction}
                        />
                      </div>
                    </React.Fragment>
                  )}

                  {/* TELNET Port Attack Protection */}
                  <React.Fragment>
                    <div className="flex items-center text-[13px] font-semibold text-slate-500 text-left pl-2 sm:pl-4 whitespace-nowrap min-h-[34px]">
                      <span style={{ color: C.labelText }}>
                        TELNET Port Attack Protection
                      </span>
                    </div>
                    <div className="flex items-center min-h-[34px]">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!!form.telnetPortAttack}
                          onChange={() =>
                            handleChange(
                              "telnetPortAttack",
                              !form.telnetPortAttack,
                              "checkbox",
                            )
                          }
                          style={{
                            accentColor: C.accent,
                            width: 16,
                            height: 16,
                          }}
                        />
                        <span style={{ fontSize: 14, color: C.valueText }}>
                          Enable
                        </span>
                      </div>
                    </div>
                  </React.Fragment>

                  {/* TELNET Limit - Conditional */}
                  {form.telnetPortAttack && (
                    <React.Fragment>
                      <div className="flex items-center text-[13px] font-semibold text-slate-500 text-left pl-2 sm:pl-4 whitespace-nowrap min-h-[34px]">
                        <span style={{ color: C.labelText }}>TELNET Limit</span>
                      </div>
                      <div className="flex items-center min-h-[34px]">
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
                          style={{
                            padding: "6px 12px",
                            borderRadius: 6,
                            border: `1px solid ${C.cardBorder}`,
                            fontSize: 14,
                            width: "100%",
                            maxWidth: 180,
                            backgroundColor: "#f8fafc",
                            outline: "none",
                            color: C.valueText,
                            transition: "border-color 0.2s ease",
                          }}
                          {...inputInteraction}
                        />
                      </div>
                    </React.Fragment>
                  )}

                  {/* Set Validity of Attacker IP Blacklist */}
                  <React.Fragment>
                    <div className="flex items-center text-[13px] font-semibold text-slate-500 text-left pl-2 sm:pl-4 whitespace-nowrap min-h-[34px]">
                      <span style={{ color: C.labelText }}>
                        Set Validity of Attacker IP Blacklist
                      </span>
                    </div>
                    <div className="flex items-center min-h-[34px]">
                      <Select
                        value={form.blacklistValidityType}
                        onChange={(e) =>
                          handleChange(
                            "blacklistValidityType",
                            e.target.value,
                            "select",
                          )
                        }
                        size="small"
                        variant="outlined"
                        displayEmpty
                        sx={{
                          width: "100%",
                          maxWidth: 180,
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "#f8fafc",
                            borderRadius: 2,
                            fontSize: 14,
                            height: "36px",
                          },
                        }}
                      >
                        <MenuItem value="forever">Forever</MenuItem>
                        <MenuItem value="inSetTime">In The Set Time</MenuItem>
                      </Select>
                    </div>
                  </React.Fragment>

                  {/* Time (Min) - Conditional */}
                  {form.blacklistValidityType === "inSetTime" && (
                    <React.Fragment>
                      <div className="flex items-center text-[13px] font-semibold text-slate-500 text-left pl-2 sm:pl-4 whitespace-nowrap min-h-[34px]">
                        <span style={{ color: C.labelText }}>Time (Min)</span>
                      </div>
                      <div className="flex items-center min-h-[34px]">
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
                          style={{
                            padding: "6px 12px",
                            borderRadius: 6,
                            border: `1px solid ${C.cardBorder}`,
                            fontSize: 14,
                            width: "100%",
                            maxWidth: 180,
                            backgroundColor: "#f8fafc",
                            outline: "none",
                            color: C.valueText,
                            transition: "border-color 0.2s ease",
                          }}
                          {...inputInteraction}
                        />
                      </div>
                    </React.Fragment>
                  )}
                </div>

                {/* Action Buttons */}
                <div
                  className="flex flex-col sm:flex-row justify-center gap-6 mt-6 pt-4"
                  style={{ borderTop: `1px solid ${C.divider}` }}
                >
                  <Btn
                    type="button"
                    variant="cancel"
                    onClick={handleReset}
                    disabled={loading}
                    style={{ minWidth: 120, height: 34 }}
                  >
                    Reset
                  </Btn>
                  <Btn
                    type="submit"
                    variant="primary"
                    disabled={loading}
                    style={{ minWidth: 120, height: 34 }}
                  >
                    {loading ? "Configuring..." : "Save"}
                  </Btn>
                  <Btn
                    type="button"
                    variant="cancel"
                    onClick={handleSimulateAttack}
                    disabled={loading}
                    style={{ minWidth: 120, height: 34 }}
                  >
                    Simulate Attack
                  </Btn>
                </div>

                {/* Info Log Section */}
                <div
                  className="w-full flex flex-col items-center mt-8 pt-6"
                  style={{ borderTop: `1px solid ${C.divider}` }}
                >
                  <div
                    className="flex justify-between items-center w-full mb-2"
                    style={{ maxWidth: 700 }}
                  >
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: C.strongText,
                      }}
                    >
                      Info Log
                    </div>
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
                  <textarea
                    className="w-full min-h-[120px] max-h-[200px] rounded resize-y"
                    style={{
                      fontSize: 13,
                      padding: "8px 12px",
                      backgroundColor: "#f8fafc",
                      border: `1px solid ${C.cardBorder}`,
                      color: C.valueText,
                      fontFamily: "monospace",
                      outline: "none",
                    }}
                    value={log}
                    readOnly
                    onFocus={(e) => (e.target.style.borderColor = C.accent)}
                    onBlur={(e) => (e.target.style.borderColor = C.cardBorder)}
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DDOSSettings;
