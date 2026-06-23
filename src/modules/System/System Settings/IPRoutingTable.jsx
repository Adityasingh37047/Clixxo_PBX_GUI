import React, { useState, useRef, useEffect } from "react";
import {
  IP_ROUTING_TABLE_COLUMNS,
  IP_ROUTING_TABLE_MODAL_FIELDS,
  IP_ROUTING_TABLE_INITIAL_ROW,
} from "../../../constants/IPRoutingTableConstants";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  Alert,
  Checkbox,
} from "@mui/material";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { fetchNetwork, postLinuxCmd } from "../../../api/apiService";
const C = {
  pageBg: "var(--bg-main)",
  cardBg: "var(--bg-surface)",
  cardBorder: "var(--border-subtle)",
  divider: "var(--border-subtle)",
  cardShadow: "var(--shadow-soft)",
  gridHeaderBg: "var(--table-header-bg)",
  labelText: "var(--text-primary)",
  valueText: "var(--text-primary)",
  strongText: "var(--text-primary)",
  mutedText: "var(--text-muted)",
  accent: "var(--accent-brand)",
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
// ── Local field UI (inlined from systemSharedUi) ──
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

const nativeFieldInputStyle = {
  height: 28,
  width: 200,
  padding: "0 8px",
  fontSize: 13,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 4,
  outline: "none",
  backgroundColor: "var(--bg-main)",
  color: "var(--text-primary)",
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

const systemModalFieldInputStyle = {
  ...nativeFieldBase,
  minHeight: 32,
  height: 32,
  width: "100%",
  padding: "0 10px",
  lineHeight: 1.35,
  color: "var(--text-primary)",
};

const muiTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "var(--bg-surface)",
    "& fieldset": {
      borderColor: OUTLINED_BORDER,
      transition: "border-color 0.2s ease",
    },
    "&:hover fieldset": { borderColor: OUTLINED_HOVER },
    "&.Mui-focused fieldset": {
      borderColor: OUTLINED_FOCUS,
      borderWidth: 2,
    },
    "&.Mui-focused:hover fieldset": {
      borderColor: OUTLINED_FOCUS,
      borderWidth: 2,
    },
  },
};

const muiSelectSx = {
  fontSize: 13,
  backgroundColor: "var(--bg-surface)",
  "& .MuiOutlinedInput-root": {
    minHeight: 36,
    backgroundColor: "var(--bg-surface)",
  },
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    padding: "7px 32px 7px 10px !important",
    lineHeight: 1.35,
    boxSizing: "border-box",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: 2,
  },
};

const modalSelectSx = {
  ...muiSelectSx,
  width: "100%",
  "& .MuiOutlinedInput-root": {
    minHeight: 36,
    height: 36,
    backgroundColor: "var(--bg-surface)",
  },
};

const systemModalSelectSx = {
  ...modalSelectSx,
  height: 36,
  "& .MuiOutlinedInput-root": { height: 36 },
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    padding: "7px 32px 7px 10px !important",
    lineHeight: 1.35,
    boxSizing: "border-box",
  },
};

const CARD_RADIUS = 20;

const TH = ({ children, style: extra }) => (
  <th
    style={{
      background: "var(--table-header-bg)",
      color: C.labelText,
      fontWeight: 700,
      fontSize: 11,
      padding: "9px 14px",
      textAlign: "center",
      borderBottom: `1px solid var(--border-subtle)`,
      borderRight: `1px solid var(--border-subtle)`,
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
  borderBottom: `1px solid var(--border-subtle)`,
  borderRight: `1px solid var(--border-subtle)`,
  whiteSpace: "nowrap",
};

const checkboxSx = {
  padding: "1px",
  color: "var(--text-primary)",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const BTN_BASE =
  "inline-flex items-center justify-center gap-[6px] h-[30px] px-[14px] py-[6px] rounded-[10px] text-[12px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border disabled:cursor-not-allowed disabled:opacity-60";
const BTN_DEFAULT = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:bg-[var(--row-alt)]`;
const BTN_OUTLINE = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-label)] border-[var(--border-strong)] hover:bg-[var(--row-alt)]`;
const BTN_CANCEL = `${BTN_BASE} bg-[var(--border-subtle)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:opacity-90`;
const BTN_PRIMARY = `${BTN_BASE} text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)]`;
const BTN_ERROR = `${BTN_BASE} bg-[#dc2626] text-white border-[#dc2626] hover:bg-[#b91c1c]`;
const BTN_DELETE = `${BTN_BASE} bg-[#fee2e2] text-[#991b1b] border-[#fecaca] hover:bg-[#fecaca]`;
const BTN_EDIT = `${BTN_BASE} bg-[#dcfce7] text-[#166534] border-[#bbf7d0] hover:bg-[#bbf7d0]`;
const BTN_DANGER = `${BTN_BASE} bg-[#fef2f2] text-[#dc2626] border-[0.5px] border-[#fecaca] hover:bg-[#fca5a5]`;

const btnVariantCls = {
  default: BTN_DEFAULT,
  primary: BTN_PRIMARY,
  cancel: BTN_CANCEL,
  outline: BTN_OUTLINE,
  error: BTN_ERROR,
  delete: BTN_DELETE,
  edit: BTN_EDIT,
  danger: BTN_DANGER,
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
    {startIcon && <span className="flex items-center">{startIcon}</span>}
    {children}
  </button>
);

const IPRoutingTable = () => {
  const LOCAL_STORAGE_KEY = "ipRoutingTableRows";
  const [rows, setRows] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState({ ...IP_ROUTING_TABLE_INITIAL_ROW });
  const [networkOptions, setNetworkOptions] = useState(
    IP_ROUTING_TABLE_MODAL_FIELDS.find((f) => f.key === "networkPort")
      ?.options || [],
  );
  const [networkLoading, setNetworkLoading] = useState(false);

  // Custom scrollbar state
  const tableScrollRef = useRef(null);
  const [scrollState, setScrollState] = useState({
    top: 0,
    height: 0,
    scrollHeight: 0,
  });
  const [savingRoute, setSavingRoute] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  // Local storage helpers
  const saveRowsLocal = (data) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch {}
  };
  const loadRowsLocal = () => {
    try {
      const s = localStorage.getItem(LOCAL_STORAGE_KEY);
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  };

  // Normalize row numbers so 'no' is always sequential (0,1,2,...) and not user-controlled
  const normalizeRows = (list) =>
    (list || []).map((row, idx) => ({
      ...row,
      no: idx,
    }));

  // Persistent routes file helpers - save routes to config file for boot persistence
  const ROUTES_CONFIG_FILE = "/etc/network/interfaces.d/ip-routes.cfg";
  const ROUTES_SCRIPT_FILE = "/etc/network/if-up.d/load-ip-routes";
  const ROUTES_LOADER_SCRIPT = "/usr/local/bin/clixxo-load-ip-routes.sh";
  const ROUTES_SYSTEMD_SERVICE = "clixxo-ip-routes.service";

  // Save all routes to persistent config file
  const saveRoutesToFile = async (
    routesList,
    currentNetworkOptions = networkOptions,
  ) => {
    try {
      // Build routes file content - format: ip route add <route> for each route
      const routeCommands = routesList
        .map((route) => {
          const dest = String(route.destination || "").trim();
          const mask = String(route.subnetMask || "").trim();
          const portLabel = String(route.networkPort || "").trim();

          if (!dest || !mask || !portLabel) return null;

          // Get interface name from port label
          const selectedInterface = currentNetworkOptions.find(
            (o) => o.value === portLabel,
          );
          let iface = "eth0";
          if (selectedInterface && selectedInterface.iface) {
            iface = selectedInterface.iface;
          } else {
            const low = portLabel.toLowerCase();
            if (low.startsWith("lan 1")) iface = "eth0";
            else if (low.startsWith("lan 2")) iface = "eth1";
            else if (low.startsWith("vpn")) {
              const match = portLabel.match(/\(([^)]+)\)/);
              iface = match ? match[1] : "tun0";
            } else if (low.startsWith("vlan")) {
              // VLAN is usually eth0.X (from vlan.cfg); fallback eth0.1 for persistence
              const vlanMatch = portLabel.match(/VLAN\s*(\d+)/i);
              iface = vlanMatch ? `eth0.${vlanMatch[1]}` : "eth0.1";
            }
          }

          // Calculate prefix from mask
          const maskToPrefix = (m) => {
            const parts = m.split(".").map((n) => parseInt(n, 10));
            if (
              parts.length !== 4 ||
              parts.some((n) => isNaN(n) || n < 0 || n > 255)
            )
              return null;
            const bits = parts
              .map((n) => n.toString(2).padStart(8, "0"))
              .join("");
            if (!/^1*0*$/.test(bits)) return null;
            return bits.indexOf("0") === -1 ? 32 : bits.indexOf("0");
          };
          const prefix = maskToPrefix(mask);
          if (prefix === null) return null;

          // Calculate network IP
          const ipToNumber = (ip) => {
            const parts = ip.split(".").map((n) => parseInt(n, 10));
            if (
              parts.length !== 4 ||
              parts.some((n) => isNaN(n) || n < 0 || n > 255)
            )
              return null;
            return (
              (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3]
            );
          };
          const destNum = ipToNumber(dest);
          if (destNum === null) return null;
          const networkMask =
            prefix === 32 ? 0xffffffff : (~0 >>> 0) << (32 - prefix);
          const networkNum = (destNum & networkMask) >>> 0;
          const networkIp = [
            (networkNum >>> 24) & 0xff,
            (networkNum >>> 16) & 0xff,
            (networkNum >>> 8) & 0xff,
            networkNum & 0xff,
          ].join(".");

          // Build route command
          // VPN interfaces (including SoftEther vpn_vpn) may need gateway
          const isVpnInterface =
            portLabel.toLowerCase().startsWith("vpn") ||
            (iface &&
              (iface.startsWith("tun") ||
                iface.startsWith("tap") ||
                iface.includes("vpn")));

          // Priority: Use gateway from saved route data, then from interface info
          let gateway = String(route.gateway || "").trim() || null;
          if (!gateway && selectedInterface && selectedInterface.gateway) {
            gateway = selectedInterface.gateway;
          }

          let routeCmd;
          if (isVpnInterface) {
            // VPN routes should use gateway if available (required for SoftEther vpn_vpn)
            if (gateway) {
              routeCmd = `ip route add ${networkIp}/${prefix} via ${gateway} dev ${iface} 2>/dev/null || true`;
            } else {
              routeCmd = `ip route add ${networkIp}/${prefix} dev ${iface} 2>/dev/null || true`;
            }
          } else if (gateway) {
            routeCmd = `ip route add ${networkIp}/${prefix} via ${gateway} dev ${iface} 2>/dev/null || true`;
          } else {
            routeCmd = `ip route add ${networkIp}/${prefix} dev ${iface} 2>/dev/null || true`;
          }

          return routeCmd;
        })
        .filter(Boolean);

      // Create config file content
      const fileContent = `# IP Routes Configuration - Auto-generated by IP Routing Table UI
# This file is automatically updated when routes are added/deleted from the UI
# Routes are loaded on boot via systemd service clixxo-ip-routes.service and /etc/network/if-up.d/load-ip-routes

${routeCommands.join("\n")}
`;

      // Save to file
      const saveCmd = `cat > ${ROUTES_CONFIG_FILE} << 'EOF'\n${fileContent}EOF\nchmod 644 ${ROUTES_CONFIG_FILE}`;
      // Helper: run route commands from config file (used by both if-up.d and systemd loader)
      const runRoutesFromFile = `
run_routes() {
  local f="$1"
  [ ! -f "$f" ] && return 0
  while IFS= read -r line || [ -n "$line" ]; do
    [[ "$line" =~ ^[[:space:]]*# ]] || [[ -z "$line" ]] && continue
    eval "$line" 2>/dev/null || true
  done < "$f"
}`;

      // 1) if-up.d script (for systems using ifupdown)
      const ifUpScriptContent = `#!/bin/bash
# Auto-generated: load IP routes when interfaces come up (ifupdown only)
ROUTES_FILE="${ROUTES_CONFIG_FILE}"
${runRoutesFromFile}
if [ -f "$ROUTES_FILE" ]; then sleep 2; run_routes "$ROUTES_FILE"; fi
`;
      const createIfUpCmd = `cat > ${ROUTES_SCRIPT_FILE} << 'IFUPEOF'\n${ifUpScriptContent}IFUPEOF\nchmod 755 ${ROUTES_SCRIPT_FILE}`;

      // 2) systemd loader script - runs at boot, waits for LAN/VLAN then VPN (tap0, vpn_vpn)
      const loaderScriptContent = `#!/bin/bash
# CLIXXO IP routes loader - runs at boot so routes persist after reboot
# Supports LAN1/LAN2, VLAN (eth0.X), SoftEther (vpn_vpn), OpenVPN (tap0)
ROUTES_FILE="${ROUTES_CONFIG_FILE}"
${runRoutesFromFile}
[ ! -f "$ROUTES_FILE" ] && exit 0
# First pass: LAN/VLAN are usually up
sleep 5
run_routes "$ROUTES_FILE"
# Second pass: VPN interfaces (vpn_vpn, tap0) often come up later
sleep 15
run_routes "$ROUTES_FILE"
exit 0
`;
      const createLoaderCmd = `cat > ${ROUTES_LOADER_SCRIPT} << 'LOADEREOF'\n${loaderScriptContent}LOADEREOF\nchmod 755 ${ROUTES_LOADER_SCRIPT}`;

      // 3) systemd service - runs after network is up so routes apply on every boot
      const systemdContent = `[Unit]
Description=CLIXXO load persistent IP routes (LAN/VLAN/VPN/tap0)
After=network-online.target network.target
Wants=network-online.target

[Service]
Type=oneshot
ExecStart=${ROUTES_LOADER_SCRIPT}
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
`;
      const createSystemdCmd = `cat > /etc/systemd/system/${ROUTES_SYSTEMD_SERVICE} << 'SVCEOF'\n${systemdContent}SVCEOF`;

      // Combine all commands into a single batch execution to drastically reduce network latency
      const batchCmds = [
        saveCmd,
        ...(routeCommands.length > 0 ? [routeCommands.join("\n")] : []),
        createIfUpCmd,
        createLoaderCmd,
        createSystemdCmd,
        "systemctl daemon-reload 2>/dev/null; systemctl enable " +
          ROUTES_SYSTEMD_SERVICE +
          " 2>/dev/null; true",
      ].join("\n");

      await postLinuxCmd({ cmd: batchCmds });

      console.log(
        "Routes saved to persistent config file:",
        ROUTES_CONFIG_FILE,
      );
      return true;
    } catch (error) {
      console.error("Failed to save routes to file:", error);
      return false;
    }
  };

  const handleTableScroll = (e) => {
    setScrollState({
      top: e.target.scrollTop,
      height: e.target.clientHeight,
      scrollHeight: e.target.scrollHeight,
    });
  };

  useEffect(() => {
    if (tableScrollRef.current) {
      setScrollState({
        top: tableScrollRef.current.scrollTop,
        height: tableScrollRef.current.clientHeight,
        scrollHeight: tableScrollRef.current.scrollHeight,
      });
    }
  }, [rows.length]);

  // Load persisted rows on mount
  useEffect(() => {
    const persisted = loadRowsLocal();
    if (Array.isArray(persisted) && persisted.length)
      setRows(normalizeRows(persisted));
  }, []);

  // Persist rows whenever they change
  useEffect(() => {
    saveRowsLocal(rows);
  }, [rows]);

  const openModal = (rowIdx = null) => {
    setEditIndex(rowIdx);
    if (rowIdx !== null) {
      setForm({ ...rows[rowIdx] });
    } else {
      setForm({ ...IP_ROUTING_TABLE_INITIAL_ROW, no: rows.length });
    }
    // Always refresh network options when opening modal (prefer LAN1 when adding new)
    loadNetworkOptions(rowIdx !== null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditIndex(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };

      // When network port changes, auto-fill gateway if available from interface
      if (name === "networkPort" && value) {
        const selectedInterface = networkOptions.find((o) => o.value === value);
        if (selectedInterface && selectedInterface.gateway && !prev.gateway) {
          // Auto-fill gateway if interface has one and form doesn't have a gateway yet
          updated.gateway = selectedInterface.gateway;
        }
      }

      return updated;
    });
  };

  const handleSave = async (e) => {
    e && e.preventDefault && e.preventDefault();
    const dest = String(form.destination || "").trim();
    const mask = String(form.subnetMask || "").trim();
    const portLabel = String(form.networkPort || "").trim();
    if (!dest || !mask || !portLabel) {
      showToast(
        "Please fill Destination, Subnet Mask and Network Port",
        "error",
      );
      return;
    }

    // Convert dotted netmask to CIDR prefix (e.g., 255.255.255.0 -> 24)
    const maskToPrefix = (m) => {
      const parts = m.split(".").map((n) => parseInt(n, 10));
      if (parts.length !== 4 || parts.some((n) => isNaN(n) || n < 0 || n > 255))
        return null;
      const bits = parts.map((n) => n.toString(2).padStart(8, "0")).join("");
      if (!/^1*0*$/.test(bits)) return null; // must be contiguous
      return bits.indexOf("0") === -1 ? 32 : bits.indexOf("0");
    };
    const prefix = maskToPrefix(mask);
    if (prefix == null) {
      showToast("Invalid subnet mask", "error");
      return;
    }

    // Get the selected interface to get the actual interface name
    const selectedInterfaceForIface = networkOptions.find(
      (o) => o.value === portLabel,
    );
    let iface = "eth0"; // default fallback
    if (selectedInterfaceForIface && selectedInterfaceForIface.iface) {
      // Use the actual interface name from the selected option (this will be the real name like tun0, tap0, vpn_vpn, etc.)
      iface = selectedInterfaceForIface.iface;
    } else {
      // Fallback to label-based mapping if interface not found in options
      const low = portLabel.toLowerCase();
      if (low.startsWith("lan 1")) iface = "eth0";
      else if (low.startsWith("lan 2")) iface = "eth1";
      else if (low.startsWith("vpn")) {
        // For VPN, try to extract interface name from label if available, otherwise default to tun0
        // Label format might be "VPN:IP (interface_name)" or just "VPN:IP"
        const match = portLabel.match(/\(([^)]+)\)/);
        iface = match ? match[1] : "tun0";
      } else if (low.startsWith("vlan")) iface = "vlan0";
    }

    // Prevent routing to a segment already directly attached to another interface (unselected WAN/LAN)
    const ipToNumber = (ip) => {
      const parts = ip.split(".").map((n) => parseInt(n, 10));
      if (parts.length !== 4 || parts.some((n) => isNaN(n) || n < 0 || n > 255))
        return null;
      return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
    };
    const getNetworkAddress = (ip, pfx) => {
      const ipNum = ipToNumber(ip);
      if (ipNum === null) return null;
      const mask = pfx === 32 ? 0xffffffff : (~0 >>> 0) << (32 - pfx);
      return (ipNum & mask) >>> 0;
    };
    const isInNetwork = (ip, networkIp, prefix) => {
      // Convert both IPs to their network addresses and compare
      const ipNum = ipToNumber(ip);
      const networkIpNum = ipToNumber(networkIp);
      if (ipNum === null || networkIpNum === null) return false;

      // Calculate network mask
      const mask = prefix === 32 ? 0xffffffff : (~0 >>> 0) << (32 - prefix);

      // Get network addresses by applying mask
      const ipNetwork = (ipNum & mask) >>> 0;
      const networkIpNetwork = (networkIpNum & mask) >>> 0;

      // They're in the same network if their network addresses match
      const result = ipNetwork === networkIpNetwork;
      return result;
    };

    // Check if destination IP falls within any interface's network (selected or unselected)
    // We need to block if destination is in the same network as:
    // 1. The selected interface (can't route to directly connected network through same interface)
    // 2. Any unselected interface (can't route to directly connected network through different interface)
    if (!networkOptions || networkOptions.length === 0) {
      showToast(
        "Network interfaces are still loading. Please wait a moment and try again.",
        "error",
      );
      return;
    }

    const allInterfaces = networkOptions || [];
    let conflict = false;

    for (const o of allInterfaces) {
      if (!o.ip) continue;

      // Get mask - prefer stored mask, fallback to 255.255.255.0
      let maskStr = "255.255.255.0";
      if (o.mask && /^(?:\d{1,3}\.){3}\d{1,3}$/.test(o.mask)) {
        maskStr = o.mask;
      }

      const pfx = maskToPrefix(maskStr);
      if (pfx === null) continue; // Invalid mask, skip

      // Check if destination IP is within this interface's network
      const inNetwork = isInNetwork(dest, o.ip, pfx);

      if (inNetwork) {
        conflict = true;
        break;
      }
    }

    if (conflict) {
      showToast(
        "Destination network segment and the unselected WAN cannot be in the same segment!",
        "error",
      );
      return;
    }

    // Calculate network address from destination IP and prefix
    // If destination is a host IP, convert it to network address
    const destNum = ipToNumber(dest);
    if (destNum === null) {
      showToast("Invalid destination IP address", "error");
      return;
    }
    const networkMask =
      prefix === 32 ? 0xffffffff : (~0 >>> 0) << (32 - prefix);
    const networkNum = (destNum & networkMask) >>> 0;
    const networkIp = [
      (networkNum >>> 24) & 0xff,
      (networkNum >>> 16) & 0xff,
      (networkNum >>> 8) & 0xff,
      networkNum & 0xff,
    ].join(".");

    // Get gateway - prioritize manually entered gateway from form, then from interface info
    // VPN interfaces (including SoftEther vpn_vpn) may need a gateway
    const selectedInterface = networkOptions.find((o) => o.value === portLabel);
    // Detect VPN interface: check if label starts with VPN or iface name is tun*/tap*/vpn* (including vpn_vpn)
    const isVpnInterface =
      portLabel.toLowerCase().startsWith("vpn") ||
      (iface &&
        (iface.startsWith("tun") ||
          iface.startsWith("tap") ||
          iface.includes("vpn"))); // This matches vpn_vpn, vpn_vpn1, etc.

    // Priority 1: Use manually entered gateway from form (user specified)
    let gateway = String(form.gateway || "").trim() || null;

    // Priority 2: If no manual gateway, get from selected interface info
    if (!gateway && selectedInterface && selectedInterface.gateway) {
      gateway = selectedInterface.gateway;
    }

    // Priority 3: For VPN interfaces, if gateway still not found, try to extract from existing routes
    if (isVpnInterface && !gateway && iface) {
      try {
        // Query existing routes for this VPN interface to extract gateway
        // Look for routes with "via" keyword which indicates a gateway
        const routeCmd = `ip route show dev ${iface} | grep " via " | head -1 | awk '{for(i=1;i<=NF;i++){if($i=="via"){print $(i+1); exit}}}'`;
        const routeRes = await postLinuxCmd({ cmd: routeCmd });
        if (routeRes) {
          const extractedGw = (
            routeRes.output ||
            routeRes.responseData ||
            routeRes.message ||
            ""
          )
            .toString()
            .trim();
          if (
            /^(?:\d{1,3}\.){3}\d{1,3}$/.test(extractedGw) &&
            extractedGw !== "0.0.0.0"
          ) {
            gateway = extractedGw;
            console.log(
              `✓ Extracted gateway ${gateway} for VPN interface ${iface} (SoftEther vpn_vpn)`,
            );
          }
        }
      } catch (e) {
        console.log(
          "Could not query gateway from routes for VPN interface:",
          e,
        );
      }
    }

    if (gateway && !/^(?:\d{1,3}\.){3}\d{1,3}$/.test(gateway)) {
      showToast(
        "Invalid gateway IP address format. Please enter a valid IP address (e.g., 172.23.0.1)",
        "error",
      );
      return;
    }

    // Build route command
    // For VPN: use gateway if available (required for SoftEther vpn_vpn), otherwise route directly
    // For others: use gateway if available, otherwise use dev only
    let routeTarget;
    if (isVpnInterface) {
      // VPN routes should use gateway if available (especially for SoftEther vpn_vpn)
      // If gateway is available, use it; otherwise route directly through interface
      if (gateway) {
        routeTarget = `${networkIp}/${prefix} via ${gateway} dev ${iface}`;
      } else {
        routeTarget = `${networkIp}/${prefix} dev ${iface}`;
      }
    } else if (gateway) {
      routeTarget = `${networkIp}/${prefix} via ${gateway} dev ${iface}`;
    } else {
      routeTarget = `${networkIp}/${prefix} dev ${iface}`;
    }

    // Use 'add' command - it will work whether route exists or not
    // If route exists, we'll delete it first, then add the new one
    const deleteCmd = `ip route delete ${routeTarget} 2>/dev/null || true`;
    const addCmd = `ip route add ${routeTarget}`;

    // OPTIMISTIC UI: Immediately update the table and close the modal
    let updatedRows;
    if (editIndex !== null) {
      const newRows = [...rows];
      newRows[editIndex] = {
        ...form,
        checked: false,
        gateway: gateway || form.gateway || "",
      };
      updatedRows = normalizeRows(newRows);
    } else {
      const newRows = [
        ...rows,
        { ...form, checked: false, gateway: gateway || form.gateway || "" },
      ];
      updatedRows = normalizeRows(newRows);
    }
    setRows(updatedRows);
    saveRowsLocal(updatedRows);
    closeModal();
    showToast("Route saved instantly. Applying in background...", "success");

    // Perform backend operations silently in the background
    postLinuxCmd({ cmd: `${deleteCmd}; ${addCmd}` })
      .then(() => {
        // Save routes to persistent config file
        saveRoutesToFile(updatedRows, networkOptions).catch((err) => {
          console.error("Failed to save routes to persistent file:", err);
        });
      })
      .catch((err) => {
        showToast(
          err?.message || "Warning: Failed to apply route to Linux kernel",
          "error",
        );
      });
  };

  const handleCheck = (idx) => {
    setRows((prev) =>
      prev.map((row, i) =>
        i === idx ? { ...row, checked: !row.checked } : row,
      ),
    );
  };

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setRows((prev) => prev.map((row) => ({ ...row, checked })));
  };

  const handleDelete = () => {
    const itemsToDelete = rows
      .map((row, idx) => ({ row, idx }))
      .filter((item) => item.row.checked);
    if (itemsToDelete.length === 0 || savingRoute) return;

    const isConfirmed = window.confirm(
      `Are you sure you want to delete ${itemsToDelete.length} selected route(s)?`,
    );
    if (!isConfirmed) return;

    setSavingRoute(true);

    const maskToPrefix = (m) => {
      const parts = String(m || "")
        .split(".")
        .map((n) => parseInt(n, 10));
      if (parts.length !== 4 || parts.some((n) => isNaN(n) || n < 0 || n > 255))
        return null;
      const bits = parts.map((n) => n.toString(2).padStart(8, "0")).join("");
      if (!/^1*0*$/.test(bits)) return null;
      return bits.indexOf("0") === -1 ? 32 : bits.indexOf("0");
    };
    const ipToNumber = (ip) => {
      const parts = ip.split(".").map((n) => parseInt(n, 10));
      if (parts.length !== 4 || parts.some((n) => isNaN(n) || n < 0 || n > 255))
        return null;
      return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
    };

    const deletePromises = itemsToDelete.map(async ({ row }) => {
      const dest = String(row.destination || "").trim();
      const mask = String(row.subnetMask || "").trim();
      const portLabel = String(row.networkPort || "").trim();

      if (!dest || !mask || !portLabel) return;

      const pfx = maskToPrefix(mask);
      if (pfx === null) return;

      // Calculate network address (same as when adding)
      const destNum = ipToNumber(dest);
      if (destNum === null) return;

      const networkMask = pfx === 32 ? 0xffffffff : (~0 >>> 0) << (32 - pfx);
      const networkNum = (destNum & networkMask) >>> 0;
      const networkIp = [
        (networkNum >>> 24) & 0xff,
        (networkNum >>> 16) & 0xff,
        (networkNum >>> 8) & 0xff,
        networkNum & 0xff,
      ].join(".");

      // Get the actual interface name from network options (same as when adding)
      const selectedInterfaceForIface = networkOptions.find(
        (o) => o.value === portLabel,
      );
      let iface = "eth0"; // default fallback
      if (selectedInterfaceForIface && selectedInterfaceForIface.iface) {
        // Use the actual interface name from the selected option (this will be the real name like tun0, tap0, vpn_vpn, etc.)
        iface = selectedInterfaceForIface.iface;
      } else {
        // Fallback to label-based mapping
        const low = portLabel.toLowerCase();
        if (low.startsWith("lan 1")) iface = "eth0";
        else if (low.startsWith("lan 2")) iface = "eth1";
        else if (low.startsWith("vpn")) {
          // For VPN, try to extract interface name from label if available, otherwise default to tun0
          // Label format might be "VPN:IP (interface_name)" or just "VPN:IP"
          const match = portLabel.match(/\(([^)]+)\)/);
          iface = match ? match[1] : "tun0";
        } else if (low.startsWith("vlan")) iface = "vlan0";
      }

      // Get gateway - prioritize saved gateway from row data, then from interface info
      const selectedInterface = networkOptions.find(
        (o) => o.value === portLabel,
      );
      // Detect VPN interface: check if label starts with VPN or iface name is tun*/tap*/vpn*
      const isVpnInterface =
        portLabel.toLowerCase().startsWith("vpn") ||
        (iface &&
          (iface.startsWith("tun") ||
            iface.startsWith("tap") ||
            iface.includes("vpn")));
      // Priority 1: Use gateway from saved row data (user entered manually)
      let gateway = String(row.gateway || "").trim() || null;

      // Priority 2: If no saved gateway, get from interface info
      if (!gateway && selectedInterface && selectedInterface.gateway) {
        gateway = selectedInterface.gateway;
      }

      // Build delete command matching the exact format used when adding
      let routeTarget;
      if (isVpnInterface) {
        // VPN routes may use gateway (especially for SoftEther vpn_vpn)
        // Try both with and without gateway to ensure deletion
        if (gateway) {
          routeTarget = `${networkIp}/${pfx} via ${gateway} dev ${iface}`;
        } else {
          routeTarget = `${networkIp}/${pfx} dev ${iface}`;
        }
      } else if (gateway) {
        routeTarget = `${networkIp}/${pfx} via ${gateway} dev ${iface}`;
      } else {
        routeTarget = `${networkIp}/${pfx} dev ${iface}`;
      }

      // Try multiple delete formats to ensure route is removed
      // For VPN interfaces, try both with and without gateway since they might have been added either way
      const deleteCmds = [
        `ip route delete ${routeTarget}`,
        `ip route del ${routeTarget}`,
        // Also try without gateway in case it was added differently (or vice versa)
        gateway && isVpnInterface
          ? `ip route delete ${networkIp}/${pfx} dev ${iface}`
          : null,
        gateway && isVpnInterface
          ? `ip route del ${networkIp}/${pfx} dev ${iface}`
          : null,
        !gateway && isVpnInterface && selectedInterface?.gateway
          ? `ip route delete ${networkIp}/${pfx} via ${selectedInterface.gateway} dev ${iface}`
          : null,
        !gateway && isVpnInterface && selectedInterface?.gateway
          ? `ip route del ${networkIp}/${pfx} via ${selectedInterface.gateway} dev ${iface}`
          : null,
      ].filter(Boolean);

      // Try each delete command until one succeeds
      for (const cmd of deleteCmds) {
        try {
          await postLinuxCmd({ cmd: `${cmd} 2>/dev/null || true` });
          // If we get here, the command executed (even if route didn't exist)
          break;
        } catch (e) {
          // Continue to next format
          continue;
        }
      }
    });

    Promise.allSettled(deletePromises)
      .then(async () => {
        const remainingRowsRaw = rows.filter(
          (_, idx) => !itemsToDelete.some((i) => i.idx === idx),
        );
        const remainingRows = normalizeRows(remainingRowsRaw);
        setRows(remainingRows);

        // Update persistent config file with remaining routes
        await saveRoutesToFile(remainingRows, networkOptions);
        showToast(
          `${itemsToDelete.length} route(s) deleted and configuration updated.`,
          "success",
        );
      })
      .finally(() => {
        setSavingRoute(false);
      });
  };

  const handleClearAll = () => {
    if (rows.length === 0 || savingRoute) return;

    const isConfirmed = window.confirm(
      "Are you sure you want to delete all routes? This action cannot be undone.",
    );
    if (!isConfirmed) return;

    setSavingRoute(true);
    const maskToPrefix = (m) => {
      const parts = String(m || "")
        .split(".")
        .map((n) => parseInt(n, 10));
      if (parts.length !== 4 || parts.some((n) => isNaN(n) || n < 0 || n > 255))
        return null;
      const bits = parts.map((n) => n.toString(2).padStart(8, "0")).join("");
      if (!/^1*0*$/.test(bits)) return null;
      return bits.indexOf("0") === -1 ? 32 : bits.indexOf("0");
    };
    const ipToNumber = (ip) => {
      const parts = ip.split(".").map((n) => parseInt(n, 10));
      if (parts.length !== 4 || parts.some((n) => isNaN(n) || n < 0 || n > 255))
        return null;
      return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
    };

    const deletePromises = rows.map(async (r) => {
      const dest = String(r.destination || "").trim();
      const mask = String(r.subnetMask || "").trim();
      const portLabel = String(r.networkPort || "").trim();

      if (!dest || !mask || !portLabel) return;

      const pfx = maskToPrefix(mask);
      if (pfx === null) return;

      // Calculate network address (same as when adding)
      const destNum = ipToNumber(dest);
      if (destNum === null) return;

      const networkMask = pfx === 32 ? 0xffffffff : (~0 >>> 0) << (32 - pfx);
      const networkNum = (destNum & networkMask) >>> 0;
      const networkIp = [
        (networkNum >>> 24) & 0xff,
        (networkNum >>> 16) & 0xff,
        (networkNum >>> 8) & 0xff,
        networkNum & 0xff,
      ].join(".");

      // Get the actual interface name from network options (same as when adding)
      const selectedInterfaceForIface = networkOptions.find(
        (o) => o.value === portLabel,
      );
      let iface = "eth0"; // default fallback
      if (selectedInterfaceForIface && selectedInterfaceForIface.iface) {
        // Use the actual interface name from the selected option (this will be the real name like tun0, tap0, vpn_vpn, etc.)
        iface = selectedInterfaceForIface.iface;
      } else {
        // Fallback to label-based mapping
        const low = portLabel.toLowerCase();
        if (low.startsWith("lan 1")) iface = "eth0";
        else if (low.startsWith("lan 2")) iface = "eth1";
        else if (low.startsWith("vpn")) {
          // For VPN, try to extract interface name from label if available, otherwise default to tun0
          // Label format might be "VPN:IP (interface_name)" or just "VPN:IP"
          const match = portLabel.match(/\(([^)]+)\)/);
          iface = match ? match[1] : "tun0";
        } else if (low.startsWith("vlan")) iface = "vlan0";
      }

      // Get gateway from interface (same logic as when adding)
      const selectedInterface = networkOptions.find(
        (o) => o.value === portLabel,
      );
      // Detect VPN interface: check if label starts with VPN or iface name is tun*/tap*/vpn*
      const isVpnInterface =
        portLabel.toLowerCase().startsWith("vpn") ||
        (iface &&
          (iface.startsWith("tun") ||
            iface.startsWith("tap") ||
            iface.includes("vpn")));
      // Priority 1: Use gateway from saved row data (user entered manually)
      let gateway = String(r.gateway || "").trim() || null;

      // Priority 2: If no saved gateway, get from interface info
      if (!gateway && selectedInterface && selectedInterface.gateway) {
        gateway = selectedInterface.gateway;
      }

      // Build delete command matching the exact format used when adding
      let routeTarget;
      if (isVpnInterface) {
        // VPN routes may use gateway (especially for SoftEther vpn_vpn)
        // Try both with and without gateway to ensure deletion
        if (gateway) {
          routeTarget = `${networkIp}/${pfx} via ${gateway} dev ${iface}`;
        } else {
          routeTarget = `${networkIp}/${pfx} dev ${iface}`;
        }
      } else if (gateway) {
        routeTarget = `${networkIp}/${pfx} via ${gateway} dev ${iface}`;
      } else {
        routeTarget = `${networkIp}/${pfx} dev ${iface}`;
      }

      // Try multiple delete formats to ensure route is removed
      // For VPN interfaces, try both with and without gateway since they might have been added either way
      const deleteCmds = [
        `ip route delete ${routeTarget}`,
        `ip route del ${routeTarget}`,
        // Also try without gateway in case it was added differently (or vice versa)
        gateway && isVpnInterface
          ? `ip route delete ${networkIp}/${pfx} dev ${iface}`
          : null,
        gateway && isVpnInterface
          ? `ip route del ${networkIp}/${pfx} dev ${iface}`
          : null,
        !gateway && isVpnInterface && selectedInterface?.gateway
          ? `ip route delete ${networkIp}/${pfx} via ${selectedInterface.gateway} dev ${iface}`
          : null,
        !gateway && isVpnInterface && selectedInterface?.gateway
          ? `ip route del ${networkIp}/${pfx} via ${selectedInterface.gateway} dev ${iface}`
          : null,
      ].filter(Boolean);

      // Try each delete command until one succeeds
      for (const cmd of deleteCmds) {
        try {
          await postLinuxCmd({ cmd: `${cmd} 2>/dev/null || true` });
          // If we get here, the command executed (even if route didn't exist)
          break;
        } catch (e) {
          // Continue to next format
          continue;
        }
      }
    });

    Promise.allSettled(deletePromises)
      .then(async () => {
        const cleared = normalizeRows([]);
        setRows(cleared);
        // Update persistent config file (empty)
        await saveRoutesToFile(cleared, networkOptions);
        showToast("All routes deleted and configuration cleared.", "success");
      })
      .finally(() => {
        setSavingRoute(false);
      });
  };

  const loadNetworkOptions = async (isEditing = false) => {
    try {
      setNetworkLoading(true);
      const netData = await fetchNetwork();
      const allIfaces = netData?.data?.interfaces || [];

      // Physical LAN interfaces only (eth* or enp*s*)
      const lanIfaces = allIfaces.filter((i) => {
        const name = (i.interface || "").toLowerCase();
        return /^eth\d+$/.test(name) || /^enp\d+s\d+/.test(name);
      });

      const options = lanIfaces
        .map((iface, idx) => ({
          value: `Lan ${idx + 1}:${iface.ipAddress || ""}`,
          label: `Lan ${idx + 1}:${iface.ipAddress || ""}`,
          iface: iface.interface,
          ip: iface.ipAddress || "",
          mask: iface.subnetMask || "",
          gateway: iface.activeGateway || iface.configuredGateway || "",
        }))
        .filter((o) => o.ip);

      // VPN / non-LAN interfaces (tap0, tun0, vpn_vpn, etc.)
      const lanIfaceSet = new Set(lanIfaces.map((i) => i.interface));
      for (const iface of allIfaces) {
        const kn = (iface.interface || "").toLowerCase();
        if (
          iface.ipAddress &&
          !lanIfaceSet.has(iface.interface) &&
          kn !== "lo" &&
          !/^eth\d+\.\d+$/.test(kn)
        ) {
          options.push({
            value: `VPN (${iface.interface}):${iface.ipAddress}`,
            label: `VPN (${iface.interface}):${iface.ipAddress}`,
            iface: iface.interface,
            ip: iface.ipAddress || "",
            mask: iface.subnetMask || "",
            gateway: iface.activeGateway || iface.configuredGateway || "",
          });
        }
      }

      const fallback =
        IP_ROUTING_TABLE_MODAL_FIELDS.find((f) => f.key === "networkPort")
          ?.options || [];

      setNetworkOptions(options.length > 0 ? options : fallback);

      // Auto-select: prefer Lan 1, otherwise first available
      const preferred = (options[0] && options[0].value) || "";
      if (!isEditing && preferred) {
        setForm((prev) => ({ ...prev, networkPort: preferred }));
      } else if (
        isEditing &&
        options.length > 0 &&
        !options.some((o) => o.value === form.networkPort)
      ) {
        setForm((prev) => ({ ...prev, networkPort: preferred }));
      }
    } catch (e) {
      console.warn("Failed to load network interfaces for Network Port:", e);
      setNetworkOptions(
        IP_ROUTING_TABLE_MODAL_FIELDS.find((f) => f.key === "networkPort")
          ?.options || [],
      );
    } finally {
      setNetworkLoading(false);
    }
  };

  // Also attempt to load options on mount so dropdown is ready on first open
  useEffect(() => {
    loadNetworkOptions(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="clixxo-system-settings theme-page-bg min-h-[calc(100vh-80px)] p-4 flex flex-col items-center"
      style={{ backgroundColor: C.pageBg }}
    >
      {/* ── Alerts ── */}
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={() => setToast({ msg: "", type: "success" })}
          sx={SYS_TOAST_SX}
        >
          {toast.msg}
        </Alert>
      )}

      {/* Show spinner only while saving from the modal (add/edit), not on delete/clear */}
      {savingRoute && modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div
            className="bg-[var(--bg-surface)] rounded-lg shadow-xl p-4 flex flex-col items-center gap-2 pointer-events-auto"
            style={{ minWidth: "260px" }}
          >
            <div className="animate-spin h-8 w-8 border-4 border-[#0e8fd6] border-t-transparent rounded-full" />
            <div className="text-sm font-medium text-[var(--text-secondary)]">
              Applying routing changes...
            </div>
            <div className="text-xs text-[var(--text-muted)]">
              Updating kernel routes and persistent config
            </div>
          </div>
        </div>
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
          <span>System</span>
          <span>&gt;</span>
          <span>System Settings</span>
          <span>&gt;</span>
          <span style={{ color: C.strongText, fontWeight: 600 }}>
            IP Route Table
          </span>
        </div>

        {/* ── Main Container ── */}
        <div
          style={{
            background: C.cardBg,
            borderRadius: 10,
            overflow: "hidden",
            boxShadow: C.cardShadow,
            marginBottom: 24,
            border: `1px solid var(--border-subtle)`,
          }}
        >
          {/* Toolbar */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              alignItems: "center",
              justifyContent: "space-between",
              minHeight: 44,
              padding: "7px 14px",
              borderBottom: `1px solid var(--border-subtle)`,
              background: "var(--bg-surface)",
              borderTopLeftRadius: CARD_RADIUS,
              borderTopRightRadius: CARD_RADIUS,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {rows.some((r) => r.checked) && (
                <span
                  style={{
                    background: "var(--row-selected)",
                    color: C.accent,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "5px 12px",
                    borderRadius: 999,
                    border: `1px solid ${C.accent}`,
                  }}
                >
                  {rows.filter((r) => r.checked).length} selected
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
                onClick={handleDelete}
                disabled={!rows.some((r) => r.checked) || savingRoute}
                style={{ height: 30 }}
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                {savingRoute ? "Working..." : "Delete"}
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleClearAll}
                disabled={rows.length === 0 || savingRoute}
                style={{ height: 30 }}
              >
                {savingRoute ? "Working..." : "Clear All"}
              </Btn>
              <Btn
                variant="primary"
                onClick={() => openModal(null)}
                disabled={savingRoute}
                style={{ height: 30 }}
              >
                + Add New
              </Btn>
            </div>
          </div>

          <div
            className="overflow-x-auto w-full"
            style={
              rows.length === 0
                ? {
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 240,
                    padding: 24,
                    textAlign: "center",
                    borderBottomLeftRadius: CARD_RADIUS,
                    borderBottomRightRadius: CARD_RADIUS,
                  }
                : {
                    overflowX: "auto",
                    overflowY: "auto",
                    flex: 1,
                    width: "100%",
                  }
            }
            ref={rows.length > 0 ? tableScrollRef : undefined}
            onScroll={rows.length > 0 ? handleTableScroll : undefined}
          >
            {rows.length === 0 ? (
              <>
                <div
                  style={{
                    color: "var(--text-primary)",
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 16,
                  }}
                >
                  No routes configured!
                </div>
                <Btn
                  onClick={() => openModal(null)}
                  variant="cancel"
                  disabled={savingRoute}
                  style={{ padding: "8px 24px", fontSize: 12, borderRadius: 6 }}
                >
                  + Add New
                </Btn>
              </>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  minWidth: 900,
                }}
              >
                <thead>
                  <tr>
                    {IP_ROUTING_TABLE_COLUMNS.map((col) => {
                      if (col.key === "checked") {
                        return (
                          <TH
                            key={col.key}
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
                              checked={
                                rows.length > 0 && rows.every((r) => r.checked)
                              }
                              indeterminate={
                                rows.some((r) => r.checked) &&
                                !rows.every((r) => r.checked)
                              }
                              onChange={handleSelectAll}
                              sx={checkboxSx}
                            />
                          </TH>
                        );
                      }
                      if (col.key === "modify") {
                        return (
                          <TH
                            key={col.key}
                            style={{
                              width: 70,
                              borderRight: "none",
                              position: "sticky",
                              top: 0,
                              zIndex: 10,
                            }}
                          >
                            {col.label}
                          </TH>
                        );
                      }
                      return (
                        <TH
                          key={col.key}
                          style={{ position: "sticky", top: 0, zIndex: 10 }}
                        >
                          {col.label}
                        </TH>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => {
                    const isLastRow = idx === rows.length - 1;
                    const isRowChecked = row.checked || false;
                    const rowBg = isRowChecked
                      ? "var(--row-selected)"
                      : idx % 2 === 1
                        ? "var(--row-alt)"
                        : "var(--bg-surface)";
                    const lastRowCellStyle = isLastRow
                      ? { borderBottom: "none" }
                      : {};

                    return (
                      <tr
                        key={`row-${row.no ?? idx}`}
                        style={{
                          background: rowBg,
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isRowChecked)
                            e.currentTarget.style.background = "var(--row-alt)";
                        }}
                        onMouseLeave={(e) => {
                          if (!isRowChecked)
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
                            ...(isLastRow
                              ? { borderBottomLeftRadius: CARD_RADIUS }
                              : {}),
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={isRowChecked}
                            onChange={() => handleCheck(idx)}
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
                          {row.no}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.destination}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.subnetMask}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.networkPort}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderRight: "none",
                            ...lastRowCellStyle,
                            ...(isLastRow
                              ? { borderBottomRightRadius: CARD_RADIUS }
                              : {}),
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
                              onClick={() => openModal(idx)}
                              style={{
                                cursor: "pointer",
                                color: "#2563eb",
                                fontSize: 22,
                                opacity: 0.7,
                                transition: "opacity 0.15s ease",
                              }}
                              onMouseEnter={(e) => {
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
                  })}
                </tbody>
              </table>
            )}
          </div>

          {rows.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "7px 14px",
                background: "var(--bg-surface)",
                borderTop: `1px solid var(--border-subtle)`,
                borderBottomLeftRadius: CARD_RADIUS,
                borderBottomRightRadius: CARD_RADIUS,
                overflow: "hidden",
              }}
            >
              <span
                style={{ fontSize: 11, color: C.mutedText, lineHeight: 1.2 }}
              >
                Showing {rows.length} record
                {rows.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </div>
      {/* Modal */}
      <Dialog
        open={modalOpen}
        onClose={() => {
          if (!savingRoute) closeModal();
        }}
        maxWidth={false}
        className="z-50"
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        }}
        PaperProps={{
          sx: {
            width: 500,
            maxWidth: "95vw",
            mx: "auto",
            borderRadius: "8px",
            boxShadow:
              "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
            backgroundColor: "var(--bg-surface)",
            backgroundImage: "none",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            fontSize: "16px",
            color: "#ffffff",
            backgroundColor: "#1e2d42",
            borderBottom: `1px solid ${C.divider}`,
            px: 3,
            py: 2,
            textAlign: "center",
            borderTopLeftRadius: "8px",
            borderTopRightRadius: "8px",
          }}
        >
          IP Routing Table
        </DialogTitle>
        <DialogContent
          sx={{
            p: "24px",
            backgroundColor: "var(--bg-surface)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              background: "var(--row-alt)",
              border: `1px solid var(--border-subtle)`,
              borderRadius: 8,
              padding: 20,
              marginTop: 22,
            }}
          >
            {IP_ROUTING_TABLE_MODAL_FIELDS.map((field) => (
              <div
                key={field.key}
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
                    whiteSpace: "nowrap",
                  }}
                >
                  {field.label}:
                </label>
                <div style={{ width: "min(100%, 320px)", display: "flex" }}>
                  {field.type === "text" || field.type === "number" ? (
                    <input
                      name={field.key}
                      type={field.key === "gateway" ? "text" : field.type}
                      value={form[field.key] || ""}
                      onChange={handleFormChange}
                      placeholder={field.placeholder || ""}
                      style={{ ...systemModalFieldInputStyle, flex: 1 }}
                      {...inputInteraction}
                    />
                  ) : null}
                  {field.type === "select" ? (
                    <Select
                      name={field.key}
                      value={
                        field.key === "networkPort" && form[field.key]
                          ? networkOptions.some(
                              (o) => o.value === form[field.key],
                            )
                            ? form[field.key]
                            : ""
                          : form[field.key] || ""
                      }
                      onChange={handleFormChange}
                      fullWidth
                      sx={{
                        ...systemModalSelectSx,
                        borderRadius: "4px",
                        fontSize: 13,
                      }}
                      MenuProps={{
                        PaperProps: {
                          style: { maxHeight: 200, overflow: "auto" },
                        },
                      }}
                    >
                      {field.key === "networkPort" && networkLoading && (
                        <MenuItem value="" disabled sx={{ fontSize: "14px" }}>
                          Loading network interfaces...
                        </MenuItem>
                      )}
                      {(field.key === "networkPort"
                        ? networkOptions
                        : field.options
                      ).map((opt) => (
                        <MenuItem
                          key={opt.value}
                          value={opt.value}
                          sx={{ fontSize: "14px" }}
                        >
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: "center",
            gap: 2,
            py: "10px",
            px: "16px",
            borderTop: `1px solid ${C.divider}`,
            backgroundColor: "var(--row-alt)",
          }}
        >
          <Btn
            variant="primary"
            onClick={handleSave}
            disabled={savingRoute}
            style={{ minWidth: 100, height: 33, fontSize: 13 }}
          >
            {savingRoute ? "Applying..." : "Save"}
          </Btn>
          <Btn
            variant="cancel"
            onClick={closeModal}
            style={{ minWidth: 100, height: 33, fontSize: 13 }}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default IPRoutingTable;
