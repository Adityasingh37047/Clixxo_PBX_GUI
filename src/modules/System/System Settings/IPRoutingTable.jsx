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
import { fetchSystemInfo, postLinuxCmd } from "../../../api/apiService";

const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#e2e8f0",
  divider: "#f1f5f9",
  cardShadow: "0 4px 20px rgba(15,23,42,0.06)",
  gridHeaderBg: "#f8fafc",
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
  startIcon,
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
    delete: {
      background: "#fee2e2",
      color: "#991b1b",
      border: "1px solid #fecaca",
    },
    edit: {
      background: "#dcfce7",
      color: "#166534",
      border: "1px solid #bbf7d0",
    },
    error: {
      background: C.errorRed,
      color: C.cardBg,
      border: `1px solid ${C.errorRed}`,
    },
  };

  const s = styles[variant] || styles.default;
  const hoverBg = (() => {
    switch (variant) {
      case "primary":
        return "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)";
      case "error":
        return "#b91c1c";
      case "delete":
        return "#fecaca";
      case "edit":
        return "#bbf7d0";
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
        if (!disabled) e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.background = baseBg;
      }}
    >
      {startIcon && (
        <span style={{ display: "flex", alignItems: "center" }}>
          {startIcon}
        </span>
      )}
      {children}
    </button>
  );
};

const MIN_ROWS = 10;

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
        "systemctl daemon-reload 2>/dev/null; systemctl enable " + ROUTES_SYSTEMD_SERVICE + " 2>/dev/null; true"
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
        showToast(err?.message || "Warning: Failed to apply route to Linux kernel", "error");
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
      const res = await fetchSystemInfo();
      // Robust extraction across possible shapes
      const details = res?.details || {};
      let interfaces = [];
      if (Array.isArray(details.LAN_INTERFACES))
        interfaces = details.LAN_INTERFACES;
      else if (
        details.LAN_INTERFACES &&
        typeof details.LAN_INTERFACES === "object"
      ) {
        interfaces = Object.entries(details.LAN_INTERFACES).map(
          ([name, data]) => ({ name, data }),
        );
      } else if (Array.isArray(details.interfaces))
        interfaces = details.interfaces;
      else if (details.network && Array.isArray(details.network.interfaces))
        interfaces = details.network.interfaces;

      // Helper to extract IPv4 from interface record
      const getIp = (iface) => {
        const data = iface?.data || iface || {};
        const ipv4 = data.ipv4 || data.ip || data.address || "";
        if (Array.isArray(ipv4)) return ipv4.find(Boolean) || "";
        let ipStr = String(ipv4 || "");
        // If not directly available, search common keys like 'IPv4 Address'
        if (!ipStr && data && typeof data === "object") {
          for (const [k, v] of Object.entries(data)) {
            if (/ipv4|ip/i.test(k)) {
              const valArr = Array.isArray(v) ? v : [v];
              const hit = valArr.find(
                (x) =>
                  typeof x === "string" && /^(?:\d{1,3}\.){3}\d{1,3}$/.test(x),
              );
              if (hit) {
                ipStr = hit;
                break;
              }
            }
          }
        }
        return ipStr;
      };
      const getMask = (iface) => {
        const data = iface?.data || iface || {};
        let mask = data.netmask || data.mask || data.ipv4_mask || "";
        if (!mask && data && typeof data === "object") {
          for (const [k, v] of Object.entries(data)) {
            if (/mask|netmask/i.test(k)) {
              const valArr = Array.isArray(v) ? v : [v];
              const hit = valArr.find(
                (x) =>
                  typeof x === "string" && /^(?:\d{1,3}\.){3}\d{1,3}$/.test(x),
              );
              if (hit) {
                mask = hit;
                break;
              }
            }
          }
        }
        return String(mask || "");
      };
      const getGateway = (iface) => {
        const data = iface?.data || iface || {};
        let gateway = data.gateway || data.gw || data.defaultGateway || "";
        if (!gateway && data && typeof data === "object") {
          for (const [k, v] of Object.entries(data)) {
            if (/gateway|gw/i.test(k)) {
              const valArr = Array.isArray(v) ? v : [v];
              const hit = valArr.find(
                (x) =>
                  typeof x === "string" && /^(?:\d{1,3}\.){3}\d{1,3}$/.test(x),
              );
              if (hit) {
                gateway = hit;
                break;
              }
            }
          }
        }
        // Also check IP Address array - sometimes gateway is in the third element
        if (
          !gateway &&
          Array.isArray(data["IP Address"]) &&
          data["IP Address"].length >= 3
        ) {
          const possibleGw = data["IP Address"][2];
          if (
            typeof possibleGw === "string" &&
            /^(?:\d{1,3}\.){3}\d{1,3}$/.test(possibleGw)
          ) {
            gateway = possibleGw;
          }
        }
        return String(gateway || "");
      };

      const options = [];

      // LAN 1 / eth0
      const eth0 = interfaces.find(
        (i) =>
          (i.name || "").toLowerCase() === "eth0" ||
          (i.name || "").toLowerCase() === "lan 1",
      );
      if (eth0) {
        const ip = getIp(eth0);
        const m = getMask(eth0);
        const gw = getGateway(eth0);
        if (ip)
          options.push({
            value: `Lan 1:${ip}`,
            label: `Lan 1:${ip}`,
            iface: "eth0",
            ip,
            mask: m,
            gateway: gw,
          });
      }
      // LAN 2 / eth1
      const eth1 = interfaces.find(
        (i) =>
          (i.name || "").toLowerCase() === "eth1" ||
          (i.name || "").toLowerCase() === "lan 2",
      );
      if (eth1) {
        const ip = getIp(eth1);
        const m = getMask(eth1);
        const gw = getGateway(eth1);
        if (ip)
          options.push({
            value: `Lan 2:${ip}`,
            label: `Lan 2:${ip}`,
            iface: "eth1",
            ip,
            mask: m,
            gateway: gw,
          });
      }
      // VPN interfaces - find ALL VPN interfaces (OpenVPN: tun0/tap0, SoftEther: vpn_vpn, etc.)
      const vpnInterfaces = (interfaces || []).filter((i) => {
        const n = (i.name || "").toLowerCase();
        // Match tun*, tap*, or any interface containing 'vpn' (like vpn_vpn for SoftEther)
        return n.startsWith("tun") || n.startsWith("tap") || n.includes("vpn");
      });
      // Add all VPN interfaces found
      vpnInterfaces.forEach((vpnIface) => {
        const ip = getIp(vpnIface);
        const m = getMask(vpnIface);
        const gw = getGateway(vpnIface);
        // Use the actual VPN interface name exactly as it appears (tun0, tap0, vpn_vpn, etc.)
        const actualIface = vpnIface.name || "tun0"; // Use the exact name from system
        if (ip) {
          options.push({
            value: `VPN:${ip}`,
            label: `VPN:${ip} (${actualIface})`,
            iface: actualIface,
            ip,
            mask: m,
            gateway: gw,
          });
        }
      });
      // VLAN if present (eth0.X defined in /etc/network/interfaces.d/vlan.cfg)
      try {
        const vlanIfaceCmd = `grep -E '^auto[[:space:]]+eth0\\.[0-9]+' /etc/network/interfaces.d/vlan.cfg 2>/dev/null | head -1 | awk '{print $2}'`;
        const vlanIfaceRes = await postLinuxCmd({ cmd: vlanIfaceCmd });
        const vlanIfaceName = (vlanIfaceRes?.responseData || "")
          .toString()
          .trim();

        const vlanIpCmd = `grep -E '^[[:space:]]*address[[:space:]]' /etc/network/interfaces.d/vlan.cfg 2>/dev/null | head -1 | awk '{print $2}'`;
        const vlanIpRes = await postLinuxCmd({ cmd: vlanIpCmd });
        const vlanIp = (vlanIpRes?.responseData || "").toString().trim();

        const vlanMaskCmd = `grep -E '^[[:space:]]*netmask[[:space:]]' /etc/network/interfaces.d/vlan.cfg 2>/dev/null | head -1 | awk '{print $2}'`;
        const vlanMaskRes = await postLinuxCmd({ cmd: vlanMaskCmd });
        const vlanMask = (vlanMaskRes?.responseData || "").toString().trim();

        const vlanGwCmd = `grep -E '^[[:space:]]*(#)?[[:space:]]*gateway[[:space:]]' /etc/network/interfaces.d/vlan.cfg 2>/dev/null | head -1 | sed 's/^[[:space:]]*#\\?[[:space:]]*gateway[[:space:]]*//' | awk '{print $1}'`;
        const vlanGwRes = await postLinuxCmd({ cmd: vlanGwCmd });
        const vlanGw = (vlanGwRes?.responseData || "").toString().trim();

        if (vlanIp && /^(?:\d{1,3}\.){3}\d{1,3}$/.test(vlanIp)) {
          const vlanId =
            vlanIfaceName && /^eth0\.[0-9]+$/.test(vlanIfaceName)
              ? vlanIfaceName.split(".")[1]
              : "";
          options.push({
            value: `VLAN:${vlanIp}`,
            label: vlanId ? `VLAN ${vlanId}:${vlanIp}` : `VLAN:${vlanIp}`,
            iface: vlanIfaceName || "eth0",
            ip: vlanIp,
            mask: vlanMask || "",
            gateway: vlanGw || "",
          });
        }
      } catch (e) {
        console.warn(
          "Failed to detect VLAN interface for IP routing options:",
          e,
        );
      }

      // Fallback to existing defaults if nothing extracted
      setNetworkOptions(
        options.length > 0
          ? options
          : IP_ROUTING_TABLE_MODAL_FIELDS.find((f) => f.key === "networkPort")
              ?.options || [],
      );
      // Choose default: prefer Lan 1 if present, otherwise first
      const lan1 = options.find((o) => /^lan\s*1:/i.test(o.label));
      const preferred =
        (lan1 && lan1.value) || (options[0] && options[0].value);
      // Only auto-set when adding a new row (not editing)
      if (!isEditing && options.length > 0) {
        setForm((prev) => ({ ...prev, networkPort: preferred }));
      } else if (
        isEditing &&
        options.length > 0 &&
        !options.some((o) => o.value === form.networkPort)
      ) {
        // If editing but current value is missing, fall back to preferred
        setForm((prev) => ({ ...prev, networkPort: preferred }));
      }
    } catch (e) {
      // Keep defaults on failure
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

  // Fill up to MIN_ROWS for grid look
  const displayRows = [
    ...rows,
    ...Array.from({ length: Math.max(0, MIN_ROWS - rows.length) }).map(
      () => null,
    ),
  ];

  return (
    <div
      className="min-h-[calc(100vh-80px)] p-4 flex flex-col items-center"
      style={{ backgroundColor: C.pageBg }}
    >
      {/* ── Alerts ── */}
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={() => setToast({ msg: "", type: "success" })}
          sx={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            minWidth: 300,
            boxShadow: 3,
          }}
        >
          {toast.msg}
        </Alert>
      )}

      {/* Show spinner only while saving from the modal (add/edit), not on delete/clear */}
      {savingRoute && modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div
            className="bg-white rounded-lg shadow-xl p-4 flex flex-col items-center gap-2 pointer-events-auto"
            style={{ minWidth: "260px" }}
          >
            <div className="animate-spin h-8 w-8 border-4 border-[#0e8fd6] border-t-transparent rounded-full" />
            <div className="text-sm font-medium text-gray-700">
              Applying routing changes...
            </div>
            <div className="text-xs text-gray-500">
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
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: C.cardShadow,
            marginBottom: 24,
            border: `1px solid ${C.cardBorder}`,
          }}
        >
          {/* Header */}
          <div
            style={{
              minHeight: 44,
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              fontWeight: 700,
              fontSize: 13,
              color: C.strongText,
              borderBottom: `1px solid ${C.divider}`,
            }}
          >
            <span>IP Routing Table</span>
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
                style={{ height: 30, minWidth: 110 }}
              >
                + Add New
              </Btn>
            </div>
          </div>

          <div
            className="overflow-x-auto w-full"
            style={{
              height: 400,
              maxHeight: 400,
              overflowY: "auto",
              scrollbarWidth: "auto",
            }}
            ref={tableScrollRef}
            onScroll={handleTableScroll}
          >
            <table className="w-full md:min-w-[700px] border-collapse table-auto">
              <thead
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                  backgroundColor: C.gridHeaderBg,
                }}
              >
                <tr>
                  {IP_ROUTING_TABLE_COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      className="whitespace-nowrap text-center"
                      style={{
                        padding: "8px 12px",
                        fontSize: 13,
                        fontWeight: 600,
                        color: C.strongText,
                        borderBottom: `1px solid ${C.divider}`,
                        borderRight: `1px solid ${C.divider}`,
                      }}
                    >
                      {col.key === "checked" ||
                      col.label === "Check" ||
                      col.label === "" ? (
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
                          sx={{
                            padding: "1px",
                            color: "#64748b",
                            "&.Mui-checked": { color: C.accent },
                            "&.MuiCheckbox-indeterminate": { color: C.accent },
                          }}
                        />
                      ) : (
                        col.label
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayRows.map((row, idx) =>
                  row ? (
                    <tr
                      key={idx}
                      style={{ borderBottom: `1px solid ${C.divider}` }}
                      className="hover:bg-[#f8fafc] transition-colors"
                    >
                      <td
                        className="text-center bg-white"
                        style={{
                          padding: "10px 12px",
                          fontSize: 13,
                          color: C.valueText,
                          borderRight: `1px solid ${C.divider}`,
                        }}
                      >
                        <Checkbox
                          size="small"
                          checked={row.checked || false}
                          onChange={() => handleCheck(idx)}
                          sx={{
                            padding: "1px",
                            color: "#64748b",
                            "&.Mui-checked": { color: C.accent },
                          }}
                        />
                      </td>
                      <td
                        className="text-center bg-white"
                        style={{
                          padding: "10px 12px",
                          fontSize: 13,
                          color: C.valueText,
                          borderRight: `1px solid ${C.divider}`,
                        }}
                      >
                        {row.no}
                      </td>
                      <td
                        className="text-center bg-white"
                        style={{
                          padding: "10px 12px",
                          fontSize: 13,
                          color: C.valueText,
                          borderRight: `1px solid ${C.divider}`,
                        }}
                      >
                        {row.destination}
                      </td>
                      <td
                        className="text-center bg-white"
                        style={{
                          padding: "10px 12px",
                          fontSize: 13,
                          color: C.valueText,
                          borderRight: `1px solid ${C.divider}`,
                        }}
                      >
                        {row.subnetMask}
                      </td>
                      <td
                        className="text-center bg-white"
                        style={{
                          padding: "10px 12px",
                          fontSize: 13,
                          color: C.valueText,
                          borderRight: `1px solid ${C.divider}`,
                        }}
                      >
                        {row.networkPort}
                      </td>
                      <td
                        className="text-center bg-white"
                        style={{
                          padding: "10px 12px",
                          fontSize: 13,
                          color: C.valueText,
                          borderRight: `1px solid ${C.divider}`,
                        }}
                      >
                        <EditDocumentIcon
                          className="cursor-pointer text-blue-600 mx-auto opacity-70 hover:opacity-100 transition-opacity"
                          titleAccess="Edit"
                          onClick={() => openModal(idx)}
                        />
                      </td>
                    </tr>
                  ) : (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: `1px solid ${C.divider}`,
                        background: "#fff",
                      }}
                    >
                      {IP_ROUTING_TABLE_COLUMNS.map((col) => (
                        <td
                          key={col.key}
                          className="text-center bg-white"
                          style={{
                            padding: "10px 12px",
                            fontSize: 13,
                            color: C.valueText,
                            borderRight: `1px solid ${C.divider}`,
                          }}
                        >
                          &nbsp;
                        </td>
                      ))}
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Modal */}
      <Dialog
        open={modalOpen}
        onClose={(event, reason) => {
          if (reason === "backdropClick") return;
          closeModal();
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
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
            backgroundColor: "#f8fafc",
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
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            p: "20px 24px",
            pt: "24px !important",
            backgroundColor: "#f8fafc",
          }}
        >
          {IP_ROUTING_TABLE_MODAL_FIELDS.map((field) => (
            <div
              key={field.key}
              style={{
                display: "flex",
                alignItems: "center",
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: 6,
                padding: "6px 12px",
              }}
            >
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: C.labelText,
                  width: 140,
                  flexShrink: 0,
                  textAlign: "left",
                  marginRight: 10,
                  whiteSpace: "nowrap",
                }}
              >
                {field.label}:
              </label>
              <div style={{ flex: 1, display: "flex" }}>
                {field.type === "text" || field.type === "number" ? (
                  <input
                    name={field.key}
                    type={field.key === "gateway" ? "text" : field.type}
                    value={form[field.key] || ""}
                    onChange={handleFormChange}
                    placeholder={field.placeholder || ""}
                    style={{
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
                      height: 32,
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#0284c7")}
                    onBlur={(e) => (e.target.style.borderColor = "#cbd5e1")}
                    onMouseEnter={(e) => {
                      if (document.activeElement !== e.target)
                        e.target.style.borderColor = "#64748b";
                    }}
                    onMouseLeave={(e) => {
                      if (document.activeElement !== e.target)
                        e.target.style.borderColor = "#cbd5e1";
                    }}
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
                      height: 32,
                      borderRadius: "4px",
                      fontSize: 13,
                      backgroundColor: "#ffffff",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#cbd5e1",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#64748b",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#0284c7 !important",
                        borderWidth: "1px !important",
                      },
                      "& .MuiSelect-select": {
                        padding: "6px 8px !important",
                        display: "flex",
                        alignItems: "center",
                      },
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
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: "center",
            gap: 2,
            p: 3,
            borderTop: `1px solid ${C.divider}`,
            backgroundColor: "#f8fafc",
          }}
        >
          <Btn
            variant="primary"
            onClick={handleSave}
            disabled={savingRoute}
            style={{ minWidth: 100, height: 36, fontSize: 13 }}
          >
            {savingRoute ? "Applying..." : "Save"}
          </Btn>
          <Btn
            variant="cancel"
            onClick={closeModal}
            style={{ minWidth: 100, height: 36, fontSize: 13 }}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default IPRoutingTable;
