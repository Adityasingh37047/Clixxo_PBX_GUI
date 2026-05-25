import React, { useState } from "react";
import {
  CENTRALIZED_MANAGE_FIELDS,
  MANAGEMENT_PLATFORM_OPTIONS,
  CENTRALIZED_MANAGE_BUTTONS,
  CENTRALIZED_PROTOCOL_OPTIONS,
  SNMP_VERSION_OPTIONS,
} from "../../../constants/CentralizedManageConstants";
import { Alert, CircularProgress } from "@mui/material";
import { postLinuxCmd } from "../../../api/apiService";
import axiosInstance from "../../../api/axiosInstance";

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
      background: C.primary,
      color: C.cardBg,
      border: `1px solid ${C.primary}`,
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
        return C.primaryHover;
      case "cancel":
        return "#b6c2d3";
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
        if (!disabled) e.currentTarget.style.backgroundColor = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.backgroundColor = baseBg;
      }}
    >
      {children}
    </button>
  );
};

const inputStyle = {
  width: "100%",
  fontSize: 13,
  padding: "6px 10px",
  borderRadius: 10,
  border: `1px solid ${C.cardBorder}`,
  background: C.cardBg,
  color: C.valueText,
  outline: "none",
  transition: "border-color 0.2s ease",
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

const disabledInputStyle = {
  ...inputStyle,
  background: "#f1f5f9",
  color: "#94a3b8",
  cursor: "not-allowed",
  borderColor: "#e2e8f0",
};

const initialForm = {
  centralizedManage: false,
  notificationSetting: false,
  trapServerPort: "162",
  cpuUsage: "90",
  memoryUsage: "90",
  highCps: "90",
  lowConnRate: "20",
  autoChangeGateway: false,
  managementPlatform: "DCMS",
  centralizedProtocol: "SNMP",
  snmpVersion: "V2",
  snmpServerAddress: "127.0.0.1",
  monitoringPort: false,
  monitoringPortValue: "161",
  communityString: "public",
  companyName: "",
  gatewayDesc: "",
  snmpServer: "127.0.0.1",
  authCode: "",
  workingStatus: "Requesting authentication",
};

const CentralizedManage = () => {
  const [form, setForm] = useState(initialForm);
  const [isApplying, setIsApplying] = useState(false);
  const [applyStatus, setApplyStatus] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const STORAGE_KEY = "centralizedManageFormV1";

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          setForm({ ...initialForm, ...parsed });
        }
      }
    } catch {}
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => {
      const newForm = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      if (name === "centralizedManage" && !checked) {
        newForm.notificationSetting = false;
      }

      if (name === "notificationSetting" && !checked) {
        newForm.trapServerPort = "162";
        newForm.cpuUsage = "90";
        newForm.memoryUsage = "90";
        newForm.highCps = "90";
        newForm.lowConnRate = "20";
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newForm));
      } catch {}

      return newForm;
    });
  };

  const handleReset = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setForm(initialForm);
  };

  const buildSnmpCommand = () => {
    const version = (form.snmpVersion || "V2").toUpperCase();
    if (version === "V3") {
      return `echo 'SNMPv3 requires user credentials; configure via UI first'`;
    }

    const proto = version === "V1" ? "v1" : "v2c";
    const community = form.communityString || "public";
    const allow = (form.snmpServerAddress || "").trim();
    const listenPort =
      form.monitoringPort && form.monitoringPortValue
        ? String(form.monitoringPortValue)
        : "161";
    const trapServer = (form.snmpServerAddress || "127.0.0.1").trim();

    const allowAllCheck = ["all", "*", "0.0.0.0/0"].includes(
      allow.toLowerCase(),
    );

    const safeCommunity = community.replace(/[^A-Za-z0-9_.-]/g, "");
    const safeTrapServer = trapServer.replace(/[^A-Za-z0-9_.:/-]/g, "");
    const safeAllow = allowAllCheck
      ? "default"
      : allow.replace(/[^A-Za-z0-9_.:/-]/g, "") || "default";

    return `#!/bin/bash
CONF="/etc/snmp/snmpd.conf"
SCRIPT="/usr/local/bin/clixxo-device-info.sh"

echo "Starting SNMP configuration..."

mkdir -p /etc/snmp 2>/dev/null || true

if [ -f "$CONF" ]; then
    cp "$CONF" "$CONF.bak.$(date +%s)" 2>/dev/null || true
fi

SRC="${safeAllow}"
if [ "$SRC" = "default" ] || [ -z "$SRC" ]; then
  SRC="default"
else
  if [ "$SRC" = "127.0.0.1" ] || [ "$SRC" = "::1" ]; then
    SRC="default"
  else
    DEVICE_IPS=$(ip -4 addr show 2>/dev/null | grep "inet " | awk '{print $2}' | cut -d/ -f1 || ifconfig 2>/dev/null | grep "inet " | awk '{print $2}' | cut -d: -f2 || echo "")
    if echo "$DEVICE_IPS" | grep -qFx "$SRC" 2>/dev/null; then
      SRC="default"
    fi
  fi
fi

echo "Writing SNMP configuration..."
cat > "$CONF" <<CONFEOF
agentAddress udp:${listenPort}
master agentx
sysLocation CLIXXO
sysContact admin@clixxo

view all included .1

com2sec readonly $SRC ${safeCommunity}
com2sec readwrite $SRC private

group MyROGroup ${proto} readonly
group MyRWGroup ${proto} readwrite

access MyROGroup "" any noauth exact all none none
access MyRWGroup "" any noauth exact all all all

rocommunity ${safeCommunity} $SRC -V all
rwcommunity private $SRC -V all

pass .1.3.6.1.4.1.39871.3 /usr/local/bin/snmp_remote_management.sh
pass_persist .1.3.6.1.4.1.39871 $SCRIPT
CONFEOF

echo "SNMP configuration written to $CONF"

echo "Updating monitoring scripts..."

if [ -f /usr/local/bin/clixxo-alarm-monitor.sh ]; then
    sed -i 's|^TRAP_HOST=.*|TRAP_HOST=\\"${safeTrapServer}\\"|' /usr/local/bin/clixxo-alarm-monitor.sh
    sed -i 's|^COMMUNITY=.*|COMMUNITY=\\"${safeCommunity}\\"|' /usr/local/bin/clixxo-alarm-monitor.sh
fi

if [ -f /usr/local/bin/snmp_remote_management.sh ]; then
    sed -i 's|^TRAP_HOST=.*|TRAP_HOST=\\"${safeTrapServer}\\"|' /usr/local/bin/snmp_remote_management.sh
    sed -i 's|^COMMUNITY=.*|COMMUNITY=\\"${safeCommunity}\\"|' /usr/local/bin/snmp_remote_management.sh
fi

if [ -f /usr/local/bin/clixxo-realtime-monitor.sh ]; then
    sed -i 's|^TRAP_HOST=.*|TRAP_HOST=\\"${safeTrapServer}\\"|' /usr/local/bin/clixxo-realtime-monitor.sh
    sed -i 's|^COMMUNITY=.*|COMMUNITY=\\"${safeCommunity}\\"|' /usr/local/bin/clixxo-realtime-monitor.sh
fi

echo "Restarting SNMP service..."
if systemctl restart snmpd 2>/dev/null; then
    echo "SNMP service restarted via systemctl"
elif service snmpd restart 2>/dev/null; then
    echo "SNMP service restarted via service command"
elif /etc/init.d/snmpd restart 2>/dev/null; then
    echo "SNMP service restarted via init.d"
else
    echo "Warning: Could not restart SNMP service"
fi

echo "Configuration complete!"
exit 0`;
  };

  const buildDcmsCommand = () => {
    const company = (form.companyName || "").replace(/[^A-Za-z0-9 _.-]/g, "");
    const desc = (form.gatewayDesc || "").replace(/[^A-Za-z0-9 _.-]/g, "");
    const snmpServer = (form.snmpServer || "").replace(
      /[^A-Za-z0-9_.:/-]/g,
      "",
    );
    const auth = (form.authCode || "").replace(/[^A-Za-z0-9_.-]/g, "");

    return `set -e
CONF="/etc/clixxo/dcms.conf"
mkdir -p /etc/clixxo
cat > "$CONF" <<EOF
COMPANY_NAME="${company}"
GATEWAY_DESC="${desc}"
SNMP_SERVER="${snmpServer}"
AUTH_CODE="${auth}"
EOF
echo "DCMS configuration saved"`;
  };

  const validateIPAddress = (ip) => {
    if (["all", "*", "0.0.0.0/0"].includes(ip.toLowerCase())) {
      return true;
    }
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = ip.match(ipv4Regex);

    if (!match) {
      return false;
    }

    for (let i = 1; i <= 4; i++) {
      const octet = parseInt(match[i], 10);
      if (octet < 0 || octet > 255) {
        return false;
      }
    }

    return true;
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();

    try {
      setIsApplying(true);
      setApplyStatus("Connecting SNMP...");
      const commands = [];

      if (form.managementPlatform === "DCMS") {
        if (
          !form.companyName ||
          !form.gatewayDesc ||
          !form.snmpServer ||
          !form.authCode
        ) {
          showMessage(
            "error",
            "Please fill Company Name, Gateway Description, SNMP Server Address and Authorization Code.",
          );
          setIsApplying(false);
          return;
        }

        if (!validateIPAddress(form.snmpServer)) {
          showMessage(
            "error",
            "Please enter a valid IP address for SNMP Server.",
          );
          setIsApplying(false);
          return;
        }

        commands.push(buildDcmsCommand());

        const snmpBackup = form.snmpServerAddress;
        const snmpAddr = form.snmpServer;
        form.snmpServerAddress = snmpAddr;
        commands.push(buildSnmpCommand());
        form.snmpServerAddress = snmpBackup;
      } else if (
        form.managementPlatform === "Custom1" ||
        form.managementPlatform === "Others"
      ) {
        if (!form.snmpServerAddress) {
          showMessage("error", "Please provide SNMP Server Address.");
          setIsApplying(false);
          return;
        }

        if (!validateIPAddress(form.snmpServerAddress)) {
          showMessage("error", "Please enter a valid IP address.");
          setIsApplying(false);
          return;
        }

        commands.push(buildSnmpCommand());
      } else {
        showMessage("error", "Unsupported Management Platform selection.");
        setIsApplying(false);
        return;
      }

      for (const cmd of commands) {
        let res;
        if (cmd.includes("snmpd")) {
          try {
            const response = await axiosInstance.post(
              "/linuxcmd",
              { cmd },
              { timeout: 60000 },
            );
            res = response.data;
          } catch (error) {
            console.error("SNMP command error:", error);
            throw new Error(error?.message || "SNMP command failed");
          }
        } else {
          res = await postLinuxCmd({ cmd });
        }
        if (!(res && res.response)) {
          throw new Error(res?.message || "Command failed");
        }
      }

      showMessage(
        "success",
        "Settings saved and commands executed successfully.",
      );
      setApplyStatus("");
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
      } catch {}
    } catch (err) {
      console.error(err);
      showMessage("error", `Failed to apply settings: ${err.message || err}`);
      setApplyStatus("");
    } finally {
      setIsApplying(false);
    }
  };

  const handleDownloadMib = async () => {
    try {
      const cmd = `set -e
OUT="/tmp/vendor-mibs.mib"
rm -f "$OUT" 2>/dev/null || true

FOUND=0

for p in \
  /usr/share/snmp/mibs/ASTERISK-MIB \
  /usr/share/snmp/mibs/DIGIUM-MIB \
  /usr/share/snmp/mibs/CLIXXO-GW-MIB \
  /usr/share/snmp/mibs/RFC1213-MIB \
  /usr/share/snmp/mibs/CLIXXO-GENERATED-MIB\
  /usr/local/share/snmp/mibs/ASTERISK-MIB \
  /usr/local/share/snmp/mibs/DIGIUM-MIB \
  /usr/local/share/snmp/mibs/CLIXXO-GW-MIB \
  /usr/local/share/snmp/mibs/RFC1213-MIB \
  /usr/local/share/snmp/mibs/CLIXXO-GENERATED-MIB\
  /etc/snmp/mibs/ASTERISK-MIB \
  /etc/snmp/mibs/DIGIUM-MIB \
  /etc/snmp/mibs/CLIXXO-GW-MIB\
  /etc/snmp/mibs/RFC1213-MIB \
  /etc/snmp/mibs/CLIXXO-GENERATED-MIB\
do
  if [ -f "$p" ]; then
    echo "-- BEGIN $(basename \"$p\") --" >> "$OUT"; cat "$p" >> "$OUT"; echo "\\n-- END $(basename \"$p\") --\\n" >> "$OUT"; FOUND=1
  elif [ -d "$p" ]; then
    for f in "$p"/*; do [ -f "$f" ] && { echo "-- BEGIN $(basename \"$f\") --" >> "$OUT"; cat "$f" >> "$OUT"; echo "\\n-- END $(basename \"$f\") --\\n" >> "$OUT"; FOUND=1; }; done
  fi
done

if [ $FOUND -eq 0 ]; then
  for d in /usr/share/snmp/mibs /usr/local/share/snmp/mibs /etc/snmp/mibs /var/lib/snmp/mibs /etc/clixxo/mibs /opt; do
    [ -d "$d" ] || continue
    for name in ASTERISK-MIB DIGIUM-MIB CLIXXO-GW-MIB RFC1213-MIB CLIXXO-GENERATED-MIB; do
      if [ -f "$d/$name" ]; then
        echo "-- BEGIN $name --" >> "$OUT"; cat "$d/$name" >> "$OUT"; echo "\\n-- END $name --\\n" >> "$OUT"; FOUND=1
      else
        for f in "$d"/\${name}*; do
          [ -f "$f" ] || continue
          echo "-- BEGIN $(basename \"$f\") --" >> "$OUT"; cat "$f" >> "$OUT"; echo "\\n-- END $(basename \"$f\") --\\n" >> "$OUT"; FOUND=1
        done
      fi
    done
  done
fi

cat >> "$OUT" <<'MIBEOF'

-- BEGIN CLIXXO-DEVICE-INFO-MIB --
CLIXXO-DEVICE-INFO-MIB DEFINITIONS ::= BEGIN

IMPORTS
    enterprises
        FROM RFC1155-SMI;

clixxoDeviceInfo OBJECT IDENTIFIER ::= { enterprises 39871 }

clixxoDeviceInfoTable OBJECT IDENTIFIER ::= { clixxoDeviceInfo 1 }

clixxoSerialNumber OBJECT-TYPE
    SYNTAX      DisplayString
    MAX-ACCESS   read-only
    STATUS       current
    DESCRIPTION "Device serial number from web_version.json"
    ::= { clixxoDeviceInfoTable 1 }

clixxoWebVersion OBJECT-TYPE
    SYNTAX      DisplayString
    MAX-ACCESS   read-only
    STATUS       current
    DESCRIPTION "Web version from web_version.json"
    ::= { clixxoDeviceInfoTable 2 }

clixxoService OBJECT-TYPE
    SYNTAX      DisplayString
    MAX-ACCESS   read-only
    STATUS       current
    DESCRIPTION "Service version/timestamp from web_version.json"
    ::= { clixxoDeviceInfoTable 3 }

clixxoUboot OBJECT-TYPE
    SYNTAX      DisplayString
    MAX-ACCESS   read-only
    STATUS       current
    DESCRIPTION "Uboot version from web_version.json"
    ::= { clixxoDeviceInfoTable 4 }

clixxoKernel OBJECT-TYPE
    SYNTAX      DisplayString
    MAX-ACCESS   read-only
    STATUS       current
    DESCRIPTION "Kernel version from web_version.json"
    ::= { clixxoDeviceInfoTable 5 }

clixxoFirmware OBJECT-TYPE
    SYNTAX      DisplayString
    MAX-ACCESS   read-only
    STATUS       current
    DESCRIPTION "Firmware version from web_version.json"
    ::= { clixxoDeviceInfoTable 6 }

clixxoSipRegStatus OBJECT-TYPE
    SYNTAX      DisplayString
    MAX-ACCESS   read-only
    STATUS       current
    DESCRIPTION "SIP registration status (Registered/Unregistered/Rejected)"
    ::= { clixxoDeviceInfoTable 7 }

clixxoPriStatus OBJECT-TYPE
    SYNTAX      DisplayString
    MAX-ACCESS   read-only
    STATUS       current
    DESCRIPTION "PRI/E1 port status (pri show spans)"
    ::= { clixxoDeviceInfoTable 8 }

END
-- END CLIXXO-DEVICE-INFO-MIB --
MIBEOF
FOUND=1

if [ $FOUND -eq 1 ] && [ -s "$OUT" ]; then
  cat "$OUT"
else
  echo "ERROR=NOT_FOUND"
fi`;

      const response = await axiosInstance.post(
        "/linuxcmd",
        { cmd },
        { timeout: 20000 },
      );
      const out = String(response?.data?.responseData || "").trim();
      if (out.includes("ERROR=NOT_FOUND") || out.length === 0) {
        showMessage(
          "error",
          "No CLIXXO/ASTERISK/DIGIUM MIBs found. Ensure CLIXXO-GW-MIB, ASTERISK-MIB, DIGIUM-MIB, RFC1213-MIB or CLIXXO-GENERATED-MIB exist under /usr/share/snmp/mibs.",
        );
        return;
      }

      const blob = new Blob([out], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "vendor-mibs.mib";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      const fallback = "# Failed to retrieve MIB file. Please try again.";
      const blob = new Blob([fallback], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "vendor-mibs.mib";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div
      className="min-h-[calc(100vh-80px)] p-4 flex flex-col items-center"
      style={{ backgroundColor: C.pageBg }}
    >
      <div className="w-full" style={{ maxWidth: 1000 }}>
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
              maxWidth: 500, // Added to prevent long errors from going off-screen
              wordBreak: "break-word", // Ensures long text wraps to the next line
              boxShadow: 3,
            }}
          >
            {message.text}
          </Alert>
        )}

        {/* ── Breadcrumb ── */}
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
          <span>System</span>
          <span>&gt;</span>
          <span>System Settings</span>
          <span>&gt;</span>
          <span style={{ color: C.strongText, fontWeight: 600 }}>
            Centralized Manage
          </span>
        </div>

        {/* ── Main Card ── */}
        <div
          style={{
            background: C.cardBg,
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: C.cardShadow,
            marginBottom: 24,
            border: `1px solid ${C.cardBorder}`,
          }}
        >
          {/* Card Header */}
          <div
            style={{
              minHeight: 44,
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              alignItems: "center",
              padding: "10px 14px",
              borderBottom: `1px solid ${C.divider}`,
              background: C.cardBg,
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: C.strongText,
                letterSpacing: "0.02em",
              }}
            >
              Info
            </span>
          </div>

          {/* Card Body */}
          <div style={{ padding: "24px 32px" }}>
            <form onSubmit={handleSave} className="flex flex-col gap-6">
              <div className="flex flex-col gap-4 items-center w-full">
                {CENTRALIZED_MANAGE_FIELDS.map((field) => {
                  if (field.name === "monitoringPortValue") return null;
                  if (field.name === "workingStatus") return null;
                  if (
                    !form.notificationSetting &&
                    [
                      "trapServerPort",
                      "cpuUsage",
                      "memoryUsage",
                      "highCps",
                      "lowConnRate",
                    ].includes(field.name)
                  )
                    return null;
                  if (field.conditional && form.managementPlatform === "DCMS")
                    return null;
                  if (field.dcmsOnly && form.managementPlatform !== "DCMS")
                    return null;

                  const isEditable =
                    form.centralizedManage || field.name === "authCode";

                  return (
                    <div
                      key={field.name}
                      className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full justify-center"
                    >
                      <label
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: C.labelText,
                          width: 220, // slightly wider for longer labels
                          flexShrink: 0,
                          opacity:
                            isEditable || field.name === "centralizedManage"
                              ? 1
                              : 0.6,
                        }}
                      >
                        {field.label}
                      </label>
                      <div className="flex flex-col w-full max-w-[280px]">
                        {field.name === "monitoringPort" ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={!!form.monitoringPort}
                              onChange={handleChange}
                              name="monitoringPort"
                              disabled={!isEditable}
                              style={{
                                width: 16,
                                height: 16,
                                cursor: "pointer",
                                accentColor: C.primary,
                              }}
                            />
                            <input
                              type="text"
                              name="monitoringPortValue"
                              value={form.monitoringPortValue || "161"}
                              onChange={handleChange}
                              disabled={!isEditable || !form.monitoringPort}
                              style={
                                isEditable && form.monitoringPort
                                  ? inputStyle
                                  : disabledInputStyle
                              }
                              onFocus={
                                isEditable && form.monitoringPort
                                  ? inputInteraction.onFocus
                                  : undefined
                              }
                              onBlur={
                                isEditable && form.monitoringPort
                                  ? inputInteraction.onBlur
                                  : undefined
                              }
                              onMouseEnter={
                                isEditable && form.monitoringPort
                                  ? inputInteraction.onMouseEnter
                                  : undefined
                              }
                              onMouseLeave={
                                isEditable && form.monitoringPort
                                  ? inputInteraction.onMouseLeave
                                  : undefined
                              }
                            />
                          </div>
                        ) : field.type === "checkbox" ? (
                          <div className="flex items-center gap-2 h-[32px]">
                            <input
                              type="checkbox"
                              checked={!!form[field.name]}
                              onChange={handleChange}
                              name={field.name}
                              disabled={
                                !form.centralizedManage &&
                                field.name !== "centralizedManage"
                              }
                              style={{
                                width: 16,
                                height: 16,
                                cursor: "pointer",
                                accentColor: C.primary,
                              }}
                            />
                            <span style={{ fontSize: 12, color: C.valueText }}>
                              Enable
                            </span>
                          </div>
                        ) : field.type === "select" ? (
                          <select
                            name={field.name}
                            value={form[field.name]}
                            onChange={handleChange}
                            disabled={!isEditable}
                            style={isEditable ? inputStyle : disabledInputStyle}
                            onFocus={
                              isEditable ? inputInteraction.onFocus : undefined
                            }
                            onBlur={
                              isEditable ? inputInteraction.onBlur : undefined
                            }
                            onMouseEnter={
                              isEditable
                                ? inputInteraction.onMouseEnter
                                : undefined
                            }
                            onMouseLeave={
                              isEditable
                                ? inputInteraction.onMouseLeave
                                : undefined
                            }
                          >
                            {(field.name === "centralizedProtocol"
                              ? CENTRALIZED_PROTOCOL_OPTIONS
                              : field.name === "snmpVersion"
                                ? SNMP_VERSION_OPTIONS
                                : MANAGEMENT_PLATFORM_OPTIONS
                            ).map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            name={field.name}
                            value={form[field.name] || ""}
                            onChange={handleChange}
                            disabled={!isEditable}
                            style={isEditable ? inputStyle : disabledInputStyle}
                            onFocus={
                              isEditable ? inputInteraction.onFocus : undefined
                            }
                            onBlur={
                              isEditable ? inputInteraction.onBlur : undefined
                            }
                            onMouseEnter={
                              isEditable
                                ? inputInteraction.onMouseEnter
                                : undefined
                            }
                            onMouseLeave={
                              isEditable
                                ? inputInteraction.onMouseLeave
                                : undefined
                            }
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap gap-4 mt-6 justify-start sm:justify-center">
                <Btn
                  variant="primary"
                  type="submit"
                  disabled={isApplying}
                  style={{ minWidth: 100 }}
                >
                  {isApplying ? "Connecting…" : "Save"}
                </Btn>
                <Btn
                  variant="cancel"
                  type="button"
                  onClick={handleReset}
                  disabled={isApplying}
                  style={{ minWidth: 100 }}
                >
                  Reset
                </Btn>
                <Btn
                  variant="primary"
                  type="button"
                  onClick={handleDownloadMib}
                  disabled={isApplying}
                  style={{ minWidth: 100 }}
                >
                  {CENTRALIZED_MANAGE_BUTTONS[2].label}
                </Btn>
              </div>

              {isApplying && (
                <div className="flex justify-center items-center gap-3 mt-4 text-gray-700">
                  <CircularProgress size={18} />
                  <span style={{ fontSize: 14 }}>
                    {applyStatus || "Applying…"}
                  </span>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CentralizedManage;
