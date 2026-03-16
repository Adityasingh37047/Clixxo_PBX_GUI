import React, { useState, useRef, useEffect } from 'react';
import { IP_ROUTING_TABLE_COLUMNS, IP_ROUTING_TABLE_MODAL_FIELDS, IP_ROUTING_TABLE_INITIAL_ROW } from '../constants/IPRoutingTableConstants';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem } from '@mui/material';
import { fetchSystemInfo, postLinuxCmd } from '../api/apiService';

const MIN_ROWS = 10;

const IPRoutingTable = () => {
  const LOCAL_STORAGE_KEY = 'ipRoutingTableRows';
  const [rows, setRows] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState({ ...IP_ROUTING_TABLE_INITIAL_ROW });
  const [networkOptions, setNetworkOptions] = useState(IP_ROUTING_TABLE_MODAL_FIELDS.find(f => f.key === 'networkPort')?.options || []);
  const [networkLoading, setNetworkLoading] = useState(false);

  // Custom scrollbar state
  const tableScrollRef = useRef(null);
  const [scrollState, setScrollState] = useState({ top: 0, height: 0, scrollHeight: 0 });
  const [savingRoute, setSavingRoute] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Local storage helpers
  const saveRowsLocal = (data) => {
    try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data)); } catch {}
  };
  const loadRowsLocal = () => {
    try { const s = localStorage.getItem(LOCAL_STORAGE_KEY); return s ? JSON.parse(s) : []; } catch { return []; }
  };

  // Normalize row numbers so 'no' is always sequential (0,1,2,...) and not user-controlled
  const normalizeRows = (list) => (list || []).map((row, idx) => ({
    ...row,
    no: idx,
  }));

  // Persistent routes file helpers - save routes to config file for boot persistence
  const ROUTES_CONFIG_FILE = '/etc/network/interfaces.d/ip-routes.cfg';
  const ROUTES_SCRIPT_FILE = '/etc/network/if-up.d/load-ip-routes';
  const ROUTES_LOADER_SCRIPT = '/usr/local/bin/clixxo-load-ip-routes.sh';
  const ROUTES_SYSTEMD_SERVICE = 'clixxo-ip-routes.service';

  // Save all routes to persistent config file
  const saveRoutesToFile = async (routesList, currentNetworkOptions = networkOptions) => {
    try {
      // Build routes file content - format: ip route add <route> for each route
      const routeCommands = routesList.map(route => {
        const dest = String(route.destination || '').trim();
        const mask = String(route.subnetMask || '').trim();
        const portLabel = String(route.networkPort || '').trim();
        
        if (!dest || !mask || !portLabel) return null;
        
        // Get interface name from port label
        const selectedInterface = currentNetworkOptions.find(o => o.value === portLabel);
        let iface = 'eth0';
        if (selectedInterface && selectedInterface.iface) {
          iface = selectedInterface.iface;
        } else {
          const low = portLabel.toLowerCase();
          if (low.startsWith('lan 1')) iface = 'eth0';
          else if (low.startsWith('lan 2')) iface = 'eth1';
          else if (low.startsWith('vpn')) {
            const match = portLabel.match(/\(([^)]+)\)/);
            iface = match ? match[1] : 'tun0';
          } else if (low.startsWith('vlan')) {
            // VLAN is usually eth0.X (from vlan.cfg); fallback eth0.1 for persistence
            const vlanMatch = portLabel.match(/VLAN\s*(\d+)/i);
            iface = vlanMatch ? `eth0.${vlanMatch[1]}` : 'eth0.1';
          }
        }

        // Calculate prefix from mask
        const maskToPrefix = (m) => {
          const parts = m.split('.').map(n => parseInt(n, 10));
          if (parts.length !== 4 || parts.some(n => isNaN(n) || n < 0 || n > 255)) return null;
          const bits = parts.map(n => n.toString(2).padStart(8, '0')).join('');
          if (!/^1*0*$/.test(bits)) return null;
          return bits.indexOf('0') === -1 ? 32 : bits.indexOf('0');
        };
        const prefix = maskToPrefix(mask);
        if (prefix === null) return null;
        
        // Calculate network IP
        const ipToNumber = (ip) => {
          const parts = ip.split('.').map(n => parseInt(n, 10));
          if (parts.length !== 4 || parts.some(n => isNaN(n) || n < 0 || n > 255)) return null;
          return (parts[0]<<24) + (parts[1]<<16) + (parts[2]<<8) + parts[3];
        };
        const destNum = ipToNumber(dest);
        if (destNum === null) return null;
        const networkMask = (prefix === 32) ? 0xFFFFFFFF : (~0 >>> 0) << (32 - prefix);
        const networkNum = (destNum & networkMask) >>> 0;
        const networkIp = [
          (networkNum >>> 24) & 0xFF,
          (networkNum >>> 16) & 0xFF,
          (networkNum >>> 8) & 0xFF,
          networkNum & 0xFF
        ].join('.');
        
        // Build route command
        // VPN interfaces (including SoftEther vpn_vpn) may need gateway
        const isVpnInterface = portLabel.toLowerCase().startsWith('vpn') || 
                              (iface && (iface.startsWith('tun') || iface.startsWith('tap') || iface.includes('vpn')));
        
        // Priority: Use gateway from saved route data, then from interface info
        let gateway = String(route.gateway || '').trim() || null;
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
      }).filter(Boolean);
      
      // Create config file content
      const fileContent = `# IP Routes Configuration - Auto-generated by IP Routing Table UI
# This file is automatically updated when routes are added/deleted from the UI
# Routes are loaded on boot via systemd service clixxo-ip-routes.service and /etc/network/if-up.d/load-ip-routes

${routeCommands.join('\n')}
`;
      
      // Save to file
      const saveCmd = `cat > ${ROUTES_CONFIG_FILE} << 'EOF'\n${fileContent}EOF\nchmod 644 ${ROUTES_CONFIG_FILE}`;
      await postLinuxCmd({ cmd: saveCmd });

      // Immediately (re)apply all current routes so kernel table always matches UI table
      if (routeCommands.length > 0) {
        const applyCmd = routeCommands.join('\n');
        await postLinuxCmd({ cmd: applyCmd });
      }

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
      await postLinuxCmd({ cmd: createIfUpCmd });

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
      await postLinuxCmd({ cmd: createLoaderCmd });

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
      await postLinuxCmd({ cmd: createSystemdCmd });
      await postLinuxCmd({ cmd: 'systemctl daemon-reload 2>/dev/null; systemctl enable ' + ROUTES_SYSTEMD_SERVICE + ' 2>/dev/null; true' });

      console.log('Routes saved to persistent config file:', ROUTES_CONFIG_FILE);
      return true;
    } catch (error) {
      console.error('Failed to save routes to file:', error);
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
    if (Array.isArray(persisted) && persisted.length) setRows(normalizeRows(persisted));
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
      if (name === 'networkPort' && value) {
        const selectedInterface = networkOptions.find(o => o.value === value);
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
    const dest = String(form.destination || '').trim();
    const mask = String(form.subnetMask || '').trim();
    const portLabel = String(form.networkPort || '').trim();
    if (!dest || !mask || !portLabel) { alert('Please fill Destination, Subnet Mask and Network Port'); return; }

    // Convert dotted netmask to CIDR prefix (e.g., 255.255.255.0 -> 24)
    const maskToPrefix = (m) => {
      const parts = m.split('.').map(n => parseInt(n, 10));
      if (parts.length !== 4 || parts.some(n => isNaN(n) || n < 0 || n > 255)) return null;
      const bits = parts.map(n => n.toString(2).padStart(8, '0')).join('');
      if (!/^1*0*$/.test(bits)) return null; // must be contiguous
      return bits.indexOf('0') === -1 ? 32 : bits.indexOf('0');
    };
    const prefix = maskToPrefix(mask);
    if (prefix == null) { alert('Invalid subnet mask'); return; }

    // Get the selected interface to get the actual interface name
    const selectedInterfaceForIface = networkOptions.find(o => o.value === portLabel);
    let iface = 'eth0'; // default fallback
    if (selectedInterfaceForIface && selectedInterfaceForIface.iface) {
      // Use the actual interface name from the selected option (this will be the real name like tun0, tap0, vpn_vpn, etc.)
      iface = selectedInterfaceForIface.iface;
    } else {
      // Fallback to label-based mapping if interface not found in options
      const low = portLabel.toLowerCase();
      if (low.startsWith('lan 1')) iface = 'eth0';
      else if (low.startsWith('lan 2')) iface = 'eth1';
      else if (low.startsWith('vpn')) {
        // For VPN, try to extract interface name from label if available, otherwise default to tun0
        // Label format might be "VPN:IP (interface_name)" or just "VPN:IP"
        const match = portLabel.match(/\(([^)]+)\)/);
        iface = match ? match[1] : 'tun0';
      } else if (low.startsWith('vlan')) iface = 'vlan0';
    }

    // Prevent routing to a segment already directly attached to another interface (unselected WAN/LAN)
    const ipToNumber = (ip) => {
      const parts = ip.split('.').map(n => parseInt(n, 10));
      if (parts.length !== 4 || parts.some(n => isNaN(n) || n < 0 || n > 255)) return null;
      return (parts[0]<<24) + (parts[1]<<16) + (parts[2]<<8) + parts[3];
    };
    const getNetworkAddress = (ip, pfx) => {
      const ipNum = ipToNumber(ip);
      if (ipNum === null) return null;
      const mask = (pfx === 32) ? 0xFFFFFFFF : (~0 >>> 0) << (32 - pfx);
      return (ipNum & mask) >>> 0;
    };
    const isInNetwork = (ip, networkIp, prefix) => {
      // Convert both IPs to their network addresses and compare
      const ipNum = ipToNumber(ip);
      const networkIpNum = ipToNumber(networkIp);
      if (ipNum === null || networkIpNum === null) return false;
      
      // Calculate network mask
      const mask = (prefix === 32) ? 0xFFFFFFFF : (~0 >>> 0) << (32 - prefix);
      
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
      // If network options aren't loaded yet, try to load them first
      alert('Network interfaces are still loading. Please wait a moment and try again.');
      return;
    }

    const allInterfaces = networkOptions || [];
    let conflict = false;
    
    for (const o of allInterfaces) {
      if (!o.ip) continue;
      
      // Get mask - prefer stored mask, fallback to 255.255.255.0
      let maskStr = '255.255.255.0';
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
      alert(
        [
          'Destination network segment and the unselected WAN cannot be in the same segment!',
          
        ].join('\n')
      );
      return;
    }

    // Calculate network address from destination IP and prefix
    // If destination is a host IP, convert it to network address
    const destNum = ipToNumber(dest);
    if (destNum === null) {
      alert('Invalid destination IP address');
      return;
    }
    const networkMask = (prefix === 32) ? 0xFFFFFFFF : (~0 >>> 0) << (32 - prefix);
    const networkNum = (destNum & networkMask) >>> 0;
    const networkIp = [
      (networkNum >>> 24) & 0xFF,
      (networkNum >>> 16) & 0xFF,
      (networkNum >>> 8) & 0xFF,
      networkNum & 0xFF
    ].join('.');

    // Get gateway - prioritize manually entered gateway from form, then from interface info
    // VPN interfaces (including SoftEther vpn_vpn) may need a gateway
    const selectedInterface = networkOptions.find(o => o.value === portLabel);
    // Detect VPN interface: check if label starts with VPN or iface name is tun*/tap*/vpn* (including vpn_vpn)
    const isVpnInterface = portLabel.toLowerCase().startsWith('vpn') || 
                          (iface && (
                            iface.startsWith('tun') || 
                            iface.startsWith('tap') || 
                            iface.includes('vpn')  // This matches vpn_vpn, vpn_vpn1, etc.
                          ));
    
    // Priority 1: Use manually entered gateway from form (user specified)
    let gateway = String(form.gateway || '').trim() || null;
    
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
          const extractedGw = (routeRes.output || routeRes.responseData || routeRes.message || '').toString().trim();
          if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(extractedGw) && extractedGw !== '0.0.0.0') {
            gateway = extractedGw;
            console.log(`✓ Extracted gateway ${gateway} for VPN interface ${iface} (SoftEther vpn_vpn)`);
          }
        }
      } catch (e) {
        console.log('Could not query gateway from routes for VPN interface:', e);
      }
    }
    
    // Validate gateway format if provided manually
    if (gateway && !/^(?:\d{1,3}\.){3}\d{1,3}$/.test(gateway)) {
      alert('Invalid gateway IP address format. Please enter a valid IP address (e.g., 172.23.0.1)');
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
    
    setSavingRoute(true);
    // First try to delete existing route (ignore errors), then add new one
    postLinuxCmd({ cmd: deleteCmd })
      .then(() => postLinuxCmd({ cmd: addCmd }))
      .then(() => {
        // Persist to UI table (include gateway in saved row) and normalize numbering
        let updatedRows;
        if (editIndex !== null) {
          const newRows = [...rows];
          newRows[editIndex] = { ...form, checked: false, gateway: gateway || form.gateway || '' };
          updatedRows = normalizeRows(newRows);
        } else {
          const newRows = [...rows, { ...form, checked: false, gateway: gateway || form.gateway || '' }];
          updatedRows = normalizeRows(newRows);
        }
        setRows(updatedRows);
        
        // Save routes to persistent config file
        saveRoutesToFile(updatedRows, networkOptions).then(saved => {
          if (saved) {
            setSaveMessage('Route added and saved to persistent configuration.');
            setTimeout(() => setSaveMessage(''), 3000);
          } else {
            setSaveMessage('Route added but failed to save to persistent configuration. It may be lost on reboot.');
            setTimeout(() => setSaveMessage(''), 4000);
          }
        });
        
        closeModal();
      })
      .catch((err) => {
        alert(err?.message || 'Failed to apply route');
      })
      .finally(() => setSavingRoute(false));
  };

  const handleCheck = (idx) => {
    setRows((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, checked: !row.checked } : row))
    );
  };

  const handleDelete = () => {
    const itemsToDelete = rows
      .map((row, idx) => ({ row, idx }))
      .filter(item => item.row.checked);
    if (itemsToDelete.length === 0 || savingRoute) return;
    setSavingRoute(true);

    const maskToPrefix = (m) => {
      const parts = String(m||'').split('.').map(n=>parseInt(n,10));
      if (parts.length!==4||parts.some(n=>isNaN(n)||n<0||n>255)) return null;
      const bits = parts.map(n=>n.toString(2).padStart(8,'0')).join('');
      if (!/^1*0*$/.test(bits)) return null; return bits.indexOf('0')===-1?32:bits.indexOf('0');
    };
    const ipToNumber = (ip) => {
      const parts = ip.split('.').map(n => parseInt(n, 10));
      if (parts.length !== 4 || parts.some(n => isNaN(n) || n < 0 || n > 255)) return null;
      return (parts[0]<<24) + (parts[1]<<16) + (parts[2]<<8) + parts[3];
    };

    const deletePromises = itemsToDelete.map(async ({row}) => {
      const dest = String(row.destination || '').trim();
      const mask = String(row.subnetMask || '').trim();
      const portLabel = String(row.networkPort || '').trim();
      
      if (!dest || !mask || !portLabel) return;
      
      const pfx = maskToPrefix(mask);
      if (pfx === null) return;
      
      // Calculate network address (same as when adding)
      const destNum = ipToNumber(dest);
      if (destNum === null) return;
      
      const networkMask = (pfx === 32) ? 0xFFFFFFFF : (~0 >>> 0) << (32 - pfx);
      const networkNum = (destNum & networkMask) >>> 0;
      const networkIp = [
        (networkNum >>> 24) & 0xFF,
        (networkNum >>> 16) & 0xFF,
        (networkNum >>> 8) & 0xFF,
        networkNum & 0xFF
      ].join('.');

      // Get the actual interface name from network options (same as when adding)
      const selectedInterfaceForIface = networkOptions.find(o => o.value === portLabel);
      let iface = 'eth0'; // default fallback
      if (selectedInterfaceForIface && selectedInterfaceForIface.iface) {
        // Use the actual interface name from the selected option (this will be the real name like tun0, tap0, vpn_vpn, etc.)
        iface = selectedInterfaceForIface.iface;
      } else {
        // Fallback to label-based mapping
        const low = portLabel.toLowerCase();
        if (low.startsWith('lan 1')) iface = 'eth0';
        else if (low.startsWith('lan 2')) iface = 'eth1';
        else if (low.startsWith('vpn')) {
          // For VPN, try to extract interface name from label if available, otherwise default to tun0
          // Label format might be "VPN:IP (interface_name)" or just "VPN:IP"
          const match = portLabel.match(/\(([^)]+)\)/);
          iface = match ? match[1] : 'tun0';
        } else if (low.startsWith('vlan')) iface = 'vlan0';
      }
      
      // Get gateway - prioritize saved gateway from row data, then from interface info
      const selectedInterface = networkOptions.find(o => o.value === portLabel);
      // Detect VPN interface: check if label starts with VPN or iface name is tun*/tap*/vpn*
      const isVpnInterface = portLabel.toLowerCase().startsWith('vpn') || 
                            (iface && (
                              iface.startsWith('tun') || 
                              iface.startsWith('tap') || 
                              iface.includes('vpn')
                            ));
      // Priority 1: Use gateway from saved row data (user entered manually)
      let gateway = String(row.gateway || '').trim() || null;
      
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
        gateway && isVpnInterface ? `ip route delete ${networkIp}/${pfx} dev ${iface}` : null,
        gateway && isVpnInterface ? `ip route del ${networkIp}/${pfx} dev ${iface}` : null,
        !gateway && isVpnInterface && selectedInterface?.gateway ? `ip route delete ${networkIp}/${pfx} via ${selectedInterface.gateway} dev ${iface}` : null,
        !gateway && isVpnInterface && selectedInterface?.gateway ? `ip route del ${networkIp}/${pfx} via ${selectedInterface.gateway} dev ${iface}` : null,
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

    Promise.allSettled(deletePromises).then(async () => {
      const remainingRowsRaw = rows.filter((_, idx) => !itemsToDelete.some(i => i.idx === idx));
      const remainingRows = normalizeRows(remainingRowsRaw);
      setRows(remainingRows);
      
      // Update persistent config file with remaining routes
      await saveRoutesToFile(remainingRows, networkOptions);
      setSaveMessage(`${itemsToDelete.length} route(s) deleted and configuration updated.`);
      setTimeout(() => setSaveMessage(''), 3000);
    }).finally(() => {
      setSavingRoute(false);
    });
  };

  const handleClearAll = () => {
    if (rows.length === 0 || savingRoute) return;
    setSavingRoute(true);
    const maskToPrefix = (m) => {
      const parts = String(m||'').split('.').map(n=>parseInt(n,10));
      if (parts.length!==4||parts.some(n=>isNaN(n)||n<0||n>255)) return null;
      const bits = parts.map(n=>n.toString(2).padStart(8,'0')).join('');
      if (!/^1*0*$/.test(bits)) return null; return bits.indexOf('0')===-1?32:bits.indexOf('0');
    };
    const ipToNumber = (ip) => {
      const parts = ip.split('.').map(n => parseInt(n, 10));
      if (parts.length !== 4 || parts.some(n => isNaN(n) || n < 0 || n > 255)) return null;
      return (parts[0]<<24) + (parts[1]<<16) + (parts[2]<<8) + parts[3];
    };

    const deletePromises = rows.map(async (r) => {
      const dest = String(r.destination || '').trim();
      const mask = String(r.subnetMask || '').trim();
      const portLabel = String(r.networkPort || '').trim();
      
      if (!dest || !mask || !portLabel) return;
      
      const pfx = maskToPrefix(mask);
      if (pfx === null) return;
      
      // Calculate network address (same as when adding)
      const destNum = ipToNumber(dest);
      if (destNum === null) return;
      
      const networkMask = (pfx === 32) ? 0xFFFFFFFF : (~0 >>> 0) << (32 - pfx);
      const networkNum = (destNum & networkMask) >>> 0;
      const networkIp = [
        (networkNum >>> 24) & 0xFF,
        (networkNum >>> 16) & 0xFF,
        (networkNum >>> 8) & 0xFF,
        networkNum & 0xFF
      ].join('.');

      // Get the actual interface name from network options (same as when adding)
      const selectedInterfaceForIface = networkOptions.find(o => o.value === portLabel);
      let iface = 'eth0'; // default fallback
      if (selectedInterfaceForIface && selectedInterfaceForIface.iface) {
        // Use the actual interface name from the selected option (this will be the real name like tun0, tap0, vpn_vpn, etc.)
        iface = selectedInterfaceForIface.iface;
      } else {
        // Fallback to label-based mapping
        const low = portLabel.toLowerCase();
        if (low.startsWith('lan 1')) iface = 'eth0';
        else if (low.startsWith('lan 2')) iface = 'eth1';
        else if (low.startsWith('vpn')) {
          // For VPN, try to extract interface name from label if available, otherwise default to tun0
          // Label format might be "VPN:IP (interface_name)" or just "VPN:IP"
          const match = portLabel.match(/\(([^)]+)\)/);
          iface = match ? match[1] : 'tun0';
        } else if (low.startsWith('vlan')) iface = 'vlan0';
      }
      
      // Get gateway from interface (same logic as when adding)
      const selectedInterface = networkOptions.find(o => o.value === portLabel);
      // Detect VPN interface: check if label starts with VPN or iface name is tun*/tap*/vpn*
      const isVpnInterface = portLabel.toLowerCase().startsWith('vpn') || 
                            (iface && (
                              iface.startsWith('tun') || 
                              iface.startsWith('tap') || 
                              iface.includes('vpn')
                            ));
      // Priority 1: Use gateway from saved row data (user entered manually)
      let gateway = String(r.gateway || '').trim() || null;
      
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
        gateway && isVpnInterface ? `ip route delete ${networkIp}/${pfx} dev ${iface}` : null,
        gateway && isVpnInterface ? `ip route del ${networkIp}/${pfx} dev ${iface}` : null,
        !gateway && isVpnInterface && selectedInterface?.gateway ? `ip route delete ${networkIp}/${pfx} via ${selectedInterface.gateway} dev ${iface}` : null,
        !gateway && isVpnInterface && selectedInterface?.gateway ? `ip route del ${networkIp}/${pfx} via ${selectedInterface.gateway} dev ${iface}` : null,
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

    Promise.allSettled(deletePromises).then(async () => {
      const cleared = normalizeRows([]);
      setRows(cleared);
      // Update persistent config file (empty)
      await saveRoutesToFile(cleared, networkOptions);
      setSaveMessage('All routes deleted and configuration cleared.');
      setTimeout(() => setSaveMessage(''), 3000);
    }).finally(() => {
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
      if (Array.isArray(details.LAN_INTERFACES)) interfaces = details.LAN_INTERFACES;
      else if (details.LAN_INTERFACES && typeof details.LAN_INTERFACES === 'object') {
        interfaces = Object.entries(details.LAN_INTERFACES).map(([name, data]) => ({ name, data }));
      } else if (Array.isArray(details.interfaces)) interfaces = details.interfaces;
      else if (details.network && Array.isArray(details.network.interfaces)) interfaces = details.network.interfaces;

      // Helper to extract IPv4 from interface record
      const getIp = (iface) => {
        const data = iface?.data || iface || {};
        const ipv4 = data.ipv4 || data.ip || data.address || '';
        if (Array.isArray(ipv4)) return ipv4.find(Boolean) || '';
        let ipStr = String(ipv4 || '');
        // If not directly available, search common keys like 'IPv4 Address'
        if (!ipStr && data && typeof data === 'object') {
          for (const [k, v] of Object.entries(data)) {
            if (/ipv4|ip/i.test(k)) {
              const valArr = Array.isArray(v) ? v : [v];
              const hit = valArr.find(x => typeof x === 'string' && /^(?:\d{1,3}\.){3}\d{1,3}$/.test(x));
              if (hit) { ipStr = hit; break; }
            }
          }
        }
        return ipStr;
      };
      const getMask = (iface) => {
        const data = iface?.data || iface || {};
        let mask = data.netmask || data.mask || data.ipv4_mask || '';
        if (!mask && data && typeof data === 'object') {
          for (const [k, v] of Object.entries(data)) {
            if (/mask|netmask/i.test(k)) {
              const valArr = Array.isArray(v) ? v : [v];
              const hit = valArr.find(x => typeof x === 'string' && /^(?:\d{1,3}\.){3}\d{1,3}$/.test(x));
              if (hit) { mask = hit; break; }
            }
          }
        }
        return String(mask || '');
      };
      const getGateway = (iface) => {
        const data = iface?.data || iface || {};
        let gateway = data.gateway || data.gw || data.defaultGateway || '';
        if (!gateway && data && typeof data === 'object') {
          for (const [k, v] of Object.entries(data)) {
            if (/gateway|gw/i.test(k)) {
              const valArr = Array.isArray(v) ? v : [v];
              const hit = valArr.find(x => typeof x === 'string' && /^(?:\d{1,3}\.){3}\d{1,3}$/.test(x));
              if (hit) { gateway = hit; break; }
            }
          }
        }
        // Also check IP Address array - sometimes gateway is in the third element
        if (!gateway && Array.isArray(data['IP Address']) && data['IP Address'].length >= 3) {
          const possibleGw = data['IP Address'][2];
          if (typeof possibleGw === 'string' && /^(?:\d{1,3}\.){3}\d{1,3}$/.test(possibleGw)) {
            gateway = possibleGw;
          }
        }
        return String(gateway || '');
      };

      const options = [];

      // LAN 1 / eth0
      const eth0 = interfaces.find(i => (i.name || '').toLowerCase() === 'eth0' || (i.name || '').toLowerCase() === 'lan 1');
      if (eth0) {
        const ip = getIp(eth0); const m = getMask(eth0); const gw = getGateway(eth0);
        if (ip) options.push({ value: `Lan 1:${ip}`, label: `Lan 1:${ip}`, iface: 'eth0', ip, mask: m, gateway: gw });
      }
      // LAN 2 / eth1
      const eth1 = interfaces.find(i => (i.name || '').toLowerCase() === 'eth1' || (i.name || '').toLowerCase() === 'lan 2');
      if (eth1) {
        const ip = getIp(eth1); const m = getMask(eth1); const gw = getGateway(eth1);
        if (ip) options.push({ value: `Lan 2:${ip}`, label: `Lan 2:${ip}`, iface: 'eth1', ip, mask: m, gateway: gw });
      }
      // VPN interfaces - find ALL VPN interfaces (OpenVPN: tun0/tap0, SoftEther: vpn_vpn, etc.)
      const vpnInterfaces = (interfaces || []).filter(i => {
        const n = (i.name || '').toLowerCase();
        // Match tun*, tap*, or any interface containing 'vpn' (like vpn_vpn for SoftEther)
        return n.startsWith('tun') || n.startsWith('tap') || n.includes('vpn');
      });
      // Add all VPN interfaces found
      vpnInterfaces.forEach(vpnIface => {
        const ip = getIp(vpnIface); const m = getMask(vpnIface); const gw = getGateway(vpnIface);
        // Use the actual VPN interface name exactly as it appears (tun0, tap0, vpn_vpn, etc.)
        const actualIface = vpnIface.name || 'tun0'; // Use the exact name from system
        if (ip) {
          options.push({ 
            value: `VPN:${ip}`, 
            label: `VPN:${ip} (${actualIface})`, 
            iface: actualIface, 
            ip, 
            mask: m, 
            gateway: gw 
          });
        }
      });
      // VLAN if present (eth0.X defined in /etc/network/interfaces.d/vlan.cfg)
      try {
        const vlanIfaceCmd = `grep -E '^auto[[:space:]]+eth0\\.[0-9]+' /etc/network/interfaces.d/vlan.cfg 2>/dev/null | head -1 | awk '{print $2}'`;
        const vlanIfaceRes = await postLinuxCmd({ cmd: vlanIfaceCmd });
        const vlanIfaceName = (vlanIfaceRes?.responseData || '').toString().trim();

        const vlanIpCmd = `grep -E '^[[:space:]]*address[[:space:]]' /etc/network/interfaces.d/vlan.cfg 2>/dev/null | head -1 | awk '{print $2}'`;
        const vlanIpRes = await postLinuxCmd({ cmd: vlanIpCmd });
        const vlanIp = (vlanIpRes?.responseData || '').toString().trim();

        const vlanMaskCmd = `grep -E '^[[:space:]]*netmask[[:space:]]' /etc/network/interfaces.d/vlan.cfg 2>/dev/null | head -1 | awk '{print $2}'`;
        const vlanMaskRes = await postLinuxCmd({ cmd: vlanMaskCmd });
        const vlanMask = (vlanMaskRes?.responseData || '').toString().trim();

        const vlanGwCmd = `grep -E '^[[:space:]]*(#)?[[:space:]]*gateway[[:space:]]' /etc/network/interfaces.d/vlan.cfg 2>/dev/null | head -1 | sed 's/^[[:space:]]*#\\?[[:space:]]*gateway[[:space:]]*//' | awk '{print $1}'`;
        const vlanGwRes = await postLinuxCmd({ cmd: vlanGwCmd });
        const vlanGw = (vlanGwRes?.responseData || '').toString().trim();

        if (vlanIp && /^(?:\d{1,3}\.){3}\d{1,3}$/.test(vlanIp)) {
          const vlanId = vlanIfaceName && /^eth0\.[0-9]+$/.test(vlanIfaceName) ? vlanIfaceName.split('.')[1] : '';
          options.push({
            value: `VLAN:${vlanIp}`,
            label: vlanId ? `VLAN ${vlanId}:${vlanIp}` : `VLAN:${vlanIp}`,
            iface: vlanIfaceName || 'eth0',
            ip: vlanIp,
            mask: vlanMask || '',
            gateway: vlanGw || '',
          });
        }
      } catch (e) {
        console.warn('Failed to detect VLAN interface for IP routing options:', e);
      }

      // Fallback to existing defaults if nothing extracted
      setNetworkOptions(options.length > 0 ? options : (IP_ROUTING_TABLE_MODAL_FIELDS.find(f => f.key === 'networkPort')?.options || []));
      // Choose default: prefer Lan 1 if present, otherwise first
      const lan1 = options.find(o => /^lan\s*1:/i.test(o.label));
      const preferred = (lan1 && lan1.value) || (options[0] && options[0].value);
      // Only auto-set when adding a new row (not editing)
      if (!isEditing && options.length > 0) {
        setForm(prev => ({ ...prev, networkPort: preferred }));
      } else if (isEditing && options.length > 0 && !options.some(o => o.value === form.networkPort)) {
        // If editing but current value is missing, fall back to preferred
        setForm(prev => ({ ...prev, networkPort: preferred }));
      }
    } catch (e) {
      // Keep defaults on failure
      setNetworkOptions(IP_ROUTING_TABLE_MODAL_FIELDS.find(f => f.key === 'networkPort')?.options || []);
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
    ...Array.from({ length: Math.max(0, MIN_ROWS - rows.length) }).map(() => null),
  ];

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-200px)] p-2 md:p-0">
      <div className="w-full max-w-7xl mx-auto">
        {/* Show spinner only while saving from the modal (add/edit), not on delete/clear */}
        {savingRoute && modalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-white rounded-lg shadow-xl p-4 flex flex-col items-center gap-2 pointer-events-auto" style={{ minWidth: '260px' }}>
              <div className="animate-spin h-8 w-8 border-4 border-[#0e8fd6] border-t-transparent rounded-full" />
              <div className="text-sm font-medium text-gray-700">Applying routing changes...</div>
              <div className="text-xs text-gray-500">Updating kernel routes and persistent config</div>
            </div>
          </div>
        )}
        {saveMessage && !savingRoute && (
          <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-800 px-3 py-2 rounded shadow z-50 text-sm">
            {saveMessage}
          </div>
        )}
        <div className="bg-gray-200 w-full min-h-[400px] flex flex-col">
          <div className="w-full bg-gradient-to-b from-[#b3e0ff] to-[#3d92d0] text-[#222] font-semibold text-lg text-center py-1">IP Routing Table</div>
          <div className="overflow-x-auto w-full border-l-2 border-r-2 border-b-2 border-gray-400" style={{ height: 400, maxHeight: 400, overflowY: 'auto', scrollbarWidth: 'auto' }} ref={tableScrollRef} onScroll={handleTableScroll}>
            <table className="w-full md:min-w-[700px] border-collapse table-auto">
              <thead>
                <tr>
                  {IP_ROUTING_TABLE_COLUMNS.map((col) => (
                    <th key={col.key} className="bg-white text-gray-800 font-semibold text-xs border border-gray-400 whitespace-nowrap text-center" style={{ padding: '6px 8px', height: 32 }}>{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayRows.map((row, idx) =>
                  row ? (
                    <tr key={idx} style={{ borderBottom: '1px solid #bbb', height: 32 }}>
                      <td className="border border-gray-400 text-center bg-white" style={{ padding: '6px 8px', height: 32 }}><input type="checkbox" checked={row.checked || false} onChange={() => handleCheck(idx)} /></td>
                      <td className="border border-gray-400 text-center bg-white text-xs" style={{ padding: '6px 8px', height: 32 }}>{row.no}</td>
                      <td className="border border-gray-400 text-center bg-white text-xs" style={{ padding: '6px 8px', height: 32 }}>{row.destination}</td>
                      <td className="border border-gray-400 text-center bg-white text-xs" style={{ padding: '6px 8px', height: 32 }}>{row.subnetMask}</td>
                      <td className="border border-gray-400 text-center bg-white text-xs" style={{ padding: '6px 8px', height: 32 }}>{row.networkPort}</td>
                      <td className="border border-gray-400 text-center bg-white" style={{ padding: '6px 8px', height: 32 }}>
                        <EditDocumentIcon style={{ color: '#0e8fd6', cursor: 'pointer', margin: '0 auto' }} onClick={() => openModal(idx)} />
                      </td>
                    </tr>
                  ) : (
                    <tr key={idx} style={{ borderBottom: '1px solid #bbb', background: '#fff', height: 32 }}>
                      {IP_ROUTING_TABLE_COLUMNS.map((col) => (
                        <td key={col.key} className="border border-gray-400 text-center bg-white" style={{ color: '#aaa', padding: '6px 8px', height: 32 }}>&nbsp;</td>
                      ))}
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex justify-between items-center bg-gray-300 rounded-b-lg px-1 py-0.5 mt-1 border-l-2 border-r-2 border-b-2 border-gray-400">
          <div className="flex gap-1">
            {(() => { const hasSelection = rows.some(r => r.checked); return (
              <button
                className="bg-gray-400 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[70px] shadow hover:bg-gray-500 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                onClick={handleDelete}
                disabled={!hasSelection || savingRoute}
              >
                {savingRoute ? 'Working...' : 'Delete'}
              </button>
            ); })()}
            <button
              className="bg-gray-400 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[70px] shadow hover:bg-gray-500 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
              onClick={handleClearAll}
              disabled={rows.length === 0 || savingRoute}
            >
              {savingRoute ? 'Working...' : 'Clear All'}
            </button>
          </div>
          <button
            className="bg-gray-400 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[70px] shadow hover:bg-gray-500 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
            onClick={() => openModal(null)}
            disabled={savingRoute}
          >
            Add New
          </button>
        </div>
      </div>
      {/* Modal */}
      <Dialog open={modalOpen} onClose={closeModal} maxWidth={false} PaperProps={{ sx: { maxWidth: '95vw', width: 380, background: '#f4f6fa', borderRadius: 2, border: '1.5px solid #888' } }}>
        <DialogTitle className="bg-gray-600 text-white text-center font-semibold text-lg">IP Routing Table</DialogTitle>
        <DialogContent className="bg-gray-200 flex flex-col gap-3 py-4">
          {IP_ROUTING_TABLE_MODAL_FIELDS.map((field) => (
            <div key={field.key} className="flex flex-row items-center border border-gray-400 rounded px-2 py-1 gap-2 w-full bg-white mb-1">
              <label className="text-xs text-gray-700 font-medium whitespace-nowrap text-left min-w-[120px] mr-2">{field.label}:</label>
              <div className="flex-1 min-w-0">
                {field.type === 'text' || field.type === 'number' ? (
                  <TextField
                    name={field.key}
                    type={field.key === 'gateway' ? 'text' : field.type}
                    value={form[field.key] || ''}
                    onChange={handleFormChange}
                    size="small"
                    fullWidth
                    placeholder={field.placeholder || ''}
                    helperText={field.key === 'gateway' && form.networkPort?.toLowerCase().startsWith('vpn') 
                      ? 'Gateway is recommended for VPN routes' 
                      : field.key === 'gateway' 
                        ? 'Leave empty to use interface default' 
                        : ''}
                    FormHelperTextProps={{ sx: { fontSize: '10px', marginTop: '2px' } }}
                    sx={{ '& .MuiInputBase-input': { fontSize: '12px' } }}
                  />
                ) : null}
                {field.type === 'select' ? (
                  <Select
                    name={field.key}
                    value={form[field.key] || ''}
                    onChange={handleFormChange}
                    size="small"
                    fullWidth
                    sx={{ fontSize: '14px', '& .MuiSelect-select': { fontSize: 14, padding: '6px 8px' } }}
                    disabled={field.key === 'networkPort' ? networkLoading : false}
                    MenuProps={{
                      PaperProps: {
                        style: { maxHeight: 200, overflow: 'auto' }
                      }
                    }}
                  >
                    {field.key === 'networkPort' && networkLoading && (
                      <MenuItem value="" disabled sx={{ fontSize: '14px' }}>Loading network interfaces...</MenuItem>
                    )}
                    {(field.key === 'networkPort' ? networkOptions : field.options).map((opt) => (
                      <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '14px' }}>{opt.label}</MenuItem>
                    ))}
                  </Select>
                ) : null}
              </div>
            </div>
          ))}
        </DialogContent>
        <DialogActions className="flex justify-center gap-6 pb-4">
          <button className="bg-gradient-to-b from-[#9ca3af] to-[#6b7280] text-white font-semibold text-xs rounded px-3 py-1 min-w-[100px] shadow hover:from-[#6b7280] hover:to-[#9ca3af] disabled:opacity-60" onClick={handleSave} disabled={savingRoute}>{savingRoute ? 'Applying...' : 'Save'}</button>
          <button className="bg-gradient-to-b from-[#d1d5db] to-[#9ca3af] text-[#111827] font-semibold text-xs rounded px-3 py-1 min-w-[100px] shadow hover:from-[#9ca3af] hover:to-[#d1d5db]" onClick={closeModal}>Close</button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default IPRoutingTable;
