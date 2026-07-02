import React, { useState } from "react";
import Tooltip from "@mui/material/Tooltip";
import {
  CENTRALIZED_MANAGE_FIELDS,
  MANAGEMENT_PLATFORM_OPTIONS,
  CENTRALIZED_PROTOCOL_OPTIONS,
  SNMP_VERSION_OPTIONS,
  CENTRALIZED_MANAGE_PAGE_BREADCRUMB_ROOT,
  CENTRALIZED_MANAGE_PAGE_BREADCRUMB_SECTION,
  CENTRALIZED_MANAGE_PAGE_TITLE,
  CENTRALIZED_MANAGE_CARD_TITLE,
  CENTRALIZED_MANAGE_BTN_SAVE,
  CENTRALIZED_MANAGE_BTN_RESET,
  CENTRALIZED_MANAGE_BTN_DOWNLOAD_MIB,
  CENTRALIZED_MANAGE_BTN_SAVING,
  CENTRALIZED_MANAGE_BTN_APPLYING,
  CENTRALIZED_MANAGE_ENABLE_LABEL,
  CENTRALIZED_MANAGE_APPLY_STATUS_CONNECTING,
  CENTRALIZED_MANAGE_INITIAL_FORM,
  CENTRALIZED_MANAGE_FIELD_TOOLTIPS,
} from "../../../constants/CentralizedManageConstants";
import { Alert, CircularProgress, Checkbox } from "@mui/material";
import { postLinuxCmd } from "../../../api/apiService";
import axiosInstance from "../../../api/axiosInstance";

const CENTRALIZED_MANAGE_SCROLL_CLASS = "centralized-manage-scroll";

const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  cardShadow:
  "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
  divider: "#e2e6ec",
  labelText: "#3E5475",
  valueText: "#1f2937",
  mutedText: "#6b7280",
  placeholderText: "#9aa3b2",
  strongText: "#1f2937",
  accent: "#3E5475",
  errorRed: "#dc2626",
};

const CARD_RADIUS = 10;
const FIELD_RADIUS = 6;

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

const nativeFieldInputStyle = {
  height: 32,
  width: 200,
  padding: "0 10px",
  fontSize: 13,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: FIELD_RADIUS,
  outline: "none",
  backgroundColor: "#fff",
  color: C.valueText,
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const inputInteraction = {
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

const { height: _nativeHeight, ...nativeFieldBase } = nativeFieldInputStyle;

const systemFieldInputStyle = {
  ...nativeFieldBase,
  width: "100%",
  padding: "0 10px",
  borderRadius: FIELD_RADIUS,
  background: "#fff",
  lineHeight: 1.35,
  minHeight: 32,
  height: 32,
};

const systemFieldInputStyleNarrow = {
  ...systemFieldInputStyle,
  maxWidth: "280px",
};

const systemFieldSelectStyle = {
  ...systemFieldInputStyle,
  appearance: "auto",
  minHeight: 36,
  height: 36,
  paddingTop: 7,
  paddingBottom: 7,
  lineHeight: 1.35,
  cursor: "pointer",
};

const inputStyle = systemFieldInputStyleNarrow;
const selectStyle = {
  ...systemFieldSelectStyle,
  maxWidth: "280px",
};

const centralizedManagePageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const centralizedManagePageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
};

const centralizedManageTableContainerStyle = {
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

const centralizedManageToolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.divider}`,
  background: C.cardBg,
  flexWrap: "wrap",
  gap: 12,
  borderTopLeftRadius: CARD_RADIUS,
  borderTopRightRadius: CARD_RADIUS,
};

const centralizedManageContentStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  minWidth: 0,
  padding: "16px 36px 24px",
  background: C.cardBg,
};

const centralizedManageFieldsStackStyle = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  gap: 10,
  maxWidth: 550,
  margin: "0 auto 20px", // top horizontal bottom
};
const centralizedManageFieldRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  width: "100%",
};

const centralizedManageFieldControlStyle = {
  flex: 1,
  minWidth: 0,
  width: "100%",
  maxWidth: 280,
};

const centralizedManageFixedAlertSx = {
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

const centralizedManageFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "100%",
  margin: 0,
  padding: "10px 28px",
  borderTop: `1px solid ${C.divider}`,
  background: C.cardBg,
  boxSizing: "border-box",
  flexShrink: 0,
  borderBottomLeftRadius: CARD_RADIUS,
  borderBottomRightRadius: CARD_RADIUS,
};

const centralizedManageFooterBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
  minWidth: 100,
};

const checkboxSx = {
  padding: "4px",
  color: OUTLINED_BORDER,
  "&.Mui-checked": { color: OUTLINED_FOCUS },
  "&.MuiCheckbox-indeterminate": { color: OUTLINED_FOCUS },
  "& .MuiSvgIcon-root": { fontSize: 18 },
};

const tooltipProps = {
  arrow: true,
  placement: "top",
  slotProps: {
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
        textTransform: "none",
        letterSpacing: "normal",
      },
    },
    arrow: { sx: { color: "#fff" } },
  },
};

const FieldLabel = ({ name, style, children }) => {
  const labelStyle = {
    fontSize: 13,
    fontWeight: 600,
    color: C.labelText,
    width: "100%",
    maxWidth: 220,
    flexShrink: 0,
    cursor: CENTRALIZED_MANAGE_FIELD_TOOLTIPS[name] ? "help" : "default",
    ...style,
  };
  const label = <label style={labelStyle}>{children}</label>;

  if (!CENTRALIZED_MANAGE_FIELD_TOOLTIPS[name]) return label;

  return (
    <Tooltip title={CENTRALIZED_MANAGE_FIELD_TOOLTIPS[name]} {...tooltipProps}>
      {label}
    </Tooltip>
  );
};

const CentralizedManageScrollbarStyles = () => (
  <style>{`
    .${CENTRALIZED_MANAGE_SCROLL_CLASS} {
      scroll-behavior: smooth;
      scrollbar-gutter: stable;
      scrollbar-width: thin;
      scrollbar-color: rgba(100, 116, 139, 0.45) transparent;
    }
    .${CENTRALIZED_MANAGE_SCROLL_CLASS}::-webkit-scrollbar {
      width: 8px;
      height: 8px;
      transition: width 0.2s ease, height 0.2s ease;
    }
    .${CENTRALIZED_MANAGE_SCROLL_CLASS}::-webkit-scrollbar:hover {
      width: 11px;
      height: 11px;
    }
    .${CENTRALIZED_MANAGE_SCROLL_CLASS}::-webkit-scrollbar-corner {
      background: transparent;
    }
    .${CENTRALIZED_MANAGE_SCROLL_CLASS}::-webkit-scrollbar-track {
      background: transparent;
    }
    .${CENTRALIZED_MANAGE_SCROLL_CLASS}::-webkit-scrollbar-thumb {
      background-color: rgba(100, 116, 139, 0.45);
      border-radius: 6px;
      border: 2px solid transparent;
      background-clip: padding-box;
      transition: background-color 0.2s ease;
    }
    .${CENTRALIZED_MANAGE_SCROLL_CLASS}::-webkit-scrollbar-thumb:hover {
      background-color: rgba(71, 85, 105, 0.65);
    }
  `}</style>
);

const CentralizedManagePageShell = ({ children }) => (
  <>
    <CentralizedManageScrollbarStyles />
    <div
      className={CENTRALIZED_MANAGE_SCROLL_CLASS}
      style={centralizedManagePageWrapStyle}
      data-native-scroll
    >
      <div style={centralizedManagePageInnerStyle}>{children}</div>
    </div>
  </>
);

const CentralizedManageBreadcrumb = () => (
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
    <span>{CENTRALIZED_MANAGE_PAGE_BREADCRUMB_ROOT}</span>
    <span>&gt;</span>
    <span>{CENTRALIZED_MANAGE_PAGE_BREADCRUMB_SECTION}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>
      {CENTRALIZED_MANAGE_PAGE_TITLE}
    </span>
  </div>
);

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
  form,
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
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15,23,42,0.08)",
    },
  };

  const s = styles[variant] || styles.default;
  const hoverBg =
    {
      primary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      cancel: "#b6c2d3",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      cancel: "#a3b1c2",
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

  return (
    <button
      type={type}
      form={form}
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

const disabledInputStyle = {
  ...inputStyle,
  background: "#f1f5f9",
  color: "#94a3b8",
  cursor: "not-allowed",
  borderColor: "#e2e8f0",
};

const CentralizedManage = () => {
  const [form, setForm] = useState(CENTRALIZED_MANAGE_INITIAL_FORM);
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
          setForm({ ...CENTRALIZED_MANAGE_INITIAL_FORM, ...parsed });
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
    setForm(CENTRALIZED_MANAGE_INITIAL_FORM);
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
      setApplyStatus(CENTRALIZED_MANAGE_APPLY_STATUS_CONNECTING);
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
    <CentralizedManagePageShell>
      {message.text && (
        <Alert
          severity={message.type}
          onClose={() => setMessage({ type: "", text: "" })}
          sx={centralizedManageFixedAlertSx}
        >
          {message.text}
        </Alert>
      )}

      <CentralizedManageBreadcrumb />

      <div >
        <div style={centralizedManageTableContainerStyle}>
          <div style={centralizedManageToolbarStyle}>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: C.labelText,
                letterSpacing: "0.02em",
              }}
            >
              {CENTRALIZED_MANAGE_CARD_TITLE}
            </span>
          </div>

          <div style={centralizedManageContentStyle}>
            <form id="centralized-manage-form" onSubmit={handleSave}>
              <div style={centralizedManageFieldsStackStyle}>
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
                      style={centralizedManageFieldRowStyle}
                    >
                      <FieldLabel
                        name={field.name}
                        style={{
                          opacity:
                            isEditable || field.name === "centralizedManage"
                              ? 1
                              : 0.6,
                        }}
                      >
                        {field.label}
                      </FieldLabel>
                      <div style={centralizedManageFieldControlStyle}>
                        {field.name === "monitoringPort" ? (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <Checkbox
                              size="small"
                              checked={!!form.monitoringPort}
                              onChange={handleChange}
                              name="monitoringPort"
                              disabled={!isEditable}
                              sx={checkboxSx}
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
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              minHeight: 32,
                            }}
                          >
                            <Checkbox
                              size="small"
                              checked={!!form[field.name]}
                              onChange={handleChange}
                              name={field.name}
                              disabled={
                                !form.centralizedManage &&
                                field.name !== "centralizedManage"
                              }
                              sx={checkboxSx}
                            />
                            <span style={{ fontSize: 12, color: C.valueText }}>
                              {CENTRALIZED_MANAGE_ENABLE_LABEL}
                            </span>
                          </div>
                        ) : field.type === "select" ? (
                          <select
                            name={field.name}
                            value={form[field.name]}
                            onChange={handleChange}
                            disabled={!isEditable}
                            style={
                              isEditable
                                ? selectStyle
                                : { ...selectStyle, ...disabledInputStyle }
                            }
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
            </form>

            {isApplying && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 12,
                  marginTop: 12,
                  color: C.valueText,
                }}
              >
                <CircularProgress size={18} sx={{ color: C.accent }} />
                <span style={{ fontSize: 13, fontWeight: 500 }}>
                  {applyStatus || CENTRALIZED_MANAGE_BTN_APPLYING}
                </span>
              </div>
            )}
          </div>

          <div style={centralizedManageFooterStyle}>
            <Btn
              variant="primary"
              type="submit"
              form="centralized-manage-form"
              disabled={isApplying}
              style={centralizedManageFooterBtnStyle}
            >
              {isApplying ? CENTRALIZED_MANAGE_BTN_SAVING : CENTRALIZED_MANAGE_BTN_SAVE}
            </Btn>
            <Btn
              variant="cancel"
              type="button"
              onClick={handleReset}
              disabled={isApplying}
              style={centralizedManageFooterBtnStyle}
            >
              {CENTRALIZED_MANAGE_BTN_RESET}
            </Btn>
            <Btn
              variant="primary"
              type="button"
              onClick={handleDownloadMib}
              disabled={isApplying}
              style={centralizedManageFooterBtnStyle}
            >
              {CENTRALIZED_MANAGE_BTN_DOWNLOAD_MIB}
            </Btn>
          </div>
        </div>
      </div>
    </CentralizedManagePageShell>
  );
};

export default CentralizedManage;
