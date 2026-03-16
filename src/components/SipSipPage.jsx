import React, { useEffect, useMemo, useState, useRef } from 'react';
import { SIP_SETTINGS_FIELDS, SIP_SETTINGS_NOTE } from '../constants/SipSipConstants';
import Button from '@mui/material/Button';
import { Select, MenuItem, FormControl } from '@mui/material';
import { listSipSettings, updateSipSettings, fetchSystemInfo, postLinuxCmd, fetchNetwork } from '../api/apiService';
import { Alert, CircularProgress } from '@mui/material';

const getInitialState = () => {
  const state = {};
  SIP_SETTINGS_FIELDS.forEach(f => {
    if (f.type === 'select') {
      // Special case: dynamic WAN options use values '1' and '2'
      if (f.key === 'sipWan') {
        state[f.key] = '1';
      } else {
        state[f.key] = f.options[0]; // Set first option as default for other select fields
      }
    } else if (f.type === 'checkbox') {
      state[f.key] = f.default || false; // Set checkbox default to false if not specified
    } else if (f.type === 'radio') {
      state[f.key] = f.options[0]; // Set first option as default for radio fields
    } else {
      state[f.key] = f.default || ''; // Set text fields default to empty string if not specified
    }
  });
  return state;
};

const SipSipPage = () => {
  const [form, setForm] = useState(getInitialState());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loadSuccess, setLoadSuccess] = useState(false);
  // Seed options from cache for instant render; will refresh after API returns
  const getCachedWanOptions = () => {
    try {
      const cached = JSON.parse(localStorage.getItem('lanIps') || 'null');
      if (cached && cached.lan1 && cached.lan2) {
        return [
          { value: '1', label: `Lan 1:${cached.lan1}` },
          { value: '2', label: `Lan 2:${cached.lan2}` },
        ];
      }
    } catch (_) {}
    return [];
  };
  const [sipWanOptions, setSipWanOptions] = useState(getCachedWanOptions());
  // Track previous sipWan value to detect changes
  const previousSipWanRef = useRef(null);

  // Map UI keys to API keys
  const uiToApiKeyMap = useMemo(() => ({
    sipWan: 'sip_address_of_wan',
    sipPort: 'sip_signaling_port',
    tls: 'tls_enable',
    externalBound: 'match_external_address',
    send180: 'send_180_before_sending_183',
    send183: 'send_183_message',
    calledPrefix: 'called_number_prefix_for_180_reply',
    send100rel: 'send_100rel',
    ipCallRoute: 'ip_call_in_first_route',
    softSwitch: 'soft_switch_connected',
    hideCallerId: 'hide_caller_id',
    obtainCallerId: 'obtain_caller_id_from',
    obtainCalleeId: 'obtain_callee_id_from',
    sendCalleeId: 'send_callee_id_from',
    assertedId: 'asserted_identity_mode',
    prackSend: 'prack_send_mode',
    displayName: 'display_name',
    userName: 'user_name',
    sipAddress: 'sip_address',
    diversionField: 'send_obtain_redirect_ori_callee_id_from_diversion_field',
    natTraversal: 'nat_traversal',
    relMessage: 'set_redirection_param_of_rel_msg_when_recv_refer_msg',
    rtpSelf: 'rtp_self_adaption',
    rport: 'rport',
    filterFake: 'filter_out_fake_calls',
    autoReply: 'auto_reply_of_source_addr',
    audioSelection: 'multiple_audio_selection',
    responseVia: 'send_response_by_former_via',
    registrationSettings: 'registration_related_settings',
    callerOverClock: 'caller_over_clocking_ip_out',
    ethResource: 'eth_resource',
    sipAccountNumbers: 'sip_account_numbers',
    sipAccountInterval: 'sip_account_registration_interval_ms',
    dscp: 'dscp',
    callsFromTrunkOnly: 'calls_from_sip_trunk_address_only',
    matchCallCount: 'match_call_count_to_sip_trunk_based_on_source_address_of_invite',
    switchSignalPort: 'switch_signal_port_if_sip_reg_failed',
    hangupTimeout: 'hangup_upon_call_timeout',
    workingPeriod: 'working_period_24_hour',
    sessionTimer: 'session_timer',
    mediaStream: 'media_stream_processing',
    sipTrunkHeart: 'sip_trunk_heart',
    earlyMedia: 'early_media',
    earlySession: 'early_session',
    support100rel: 'support_100rel',
    notWaitAck: 'not_wait_ack_after_sending_200_ok',
    matchTrunkPort: 'match_sip_trunk_port',
    regMsgPercent: 'the_per_of_reg_msg_sending_cycle_to_period_of_validity',
    maxWaitAnswer: 'max_wait_answer_time',
    maxWaitRtp: 'max_wait_rtp_time',
    maxWaitPstn: 'max_wait_pstn_res_time',
    switchNetPort: 'switch_net_port_by_packet_loss_rate',
    addContactTo: 'add_content_to_field_in_invite_msg',
    userAgent: 'user_agent_field'
  }), []);

  const apiToUiKeyMap = useMemo(() => {
    const reversed = {};
    Object.entries(uiToApiKeyMap).forEach(([ui, api]) => { reversed[api] = ui; });
    return reversed;
  }, [uiToApiKeyMap]);

  // Fetch existing settings on mount; run system info + list in parallel to reduce time
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError('');
        const [sysInfo, listRes, netData] = await Promise.all([
          fetchSystemInfo(),
          listSipSettings(),
          fetchNetwork().catch(() => null),
        ]);
        try {
          const getIpFromInterfaceObject = (obj) => {
            if (!obj || typeof obj !== 'object') return null;
            if (Array.isArray(obj['IP Address']) && obj['IP Address'][0]) return obj['IP Address'][0];
            if (Array.isArray(obj['Ip Address']) && obj['Ip Address'][0]) return obj['Ip Address'][0];
            if (Array.isArray(obj['ip_address']) && obj['ip_address'][0]) return obj['ip_address'][0];
            return null;
          };
          // Prefer details payload like SystemInfo page
          const details = sysInfo?.details || {};
          const lanInterfaces = details.LAN_INTERFACES || details.lan_interfaces || null;
          const interfacesArray = Array.isArray(lanInterfaces)
            ? lanInterfaces
            : (lanInterfaces && typeof lanInterfaces === 'object')
                ? Object.entries(lanInterfaces).map(([name, data]) => ({ name, data }))
                : [];

          let lan1Ip = null;
          let lan2Ip = null;
          interfacesArray.forEach((iface) => {
            const name = String(iface.name || iface.Name || '').toLowerCase();
            if (name.includes('eth0') || name.includes('lan 1') || name.includes('lan1')) {
              lan1Ip = lan1Ip || getIpFromInterfaceObject(iface.data || iface);
            }
            if (name.includes('eth1') || name.includes('lan 2') || name.includes('lan2')) {
              lan2Ip = lan2Ip || getIpFromInterfaceObject(iface.data || iface);
            }
          });
          // Direct known shapes if not found in details
          if (!lan1Ip) lan1Ip = getIpFromInterfaceObject(sysInfo?.network?.eth0) || getIpFromInterfaceObject(sysInfo?.eth0);
          if (!lan2Ip) lan2Ip = getIpFromInterfaceObject(sysInfo?.network?.eth1) || getIpFromInterfaceObject(sysInfo?.eth1);
          // Generic walk that prefers objects labeled eth0/eth1
          const walkFor = (root, iface) => {
            const needle = iface.toLowerCase();
            let out = null;
            const walk = (node, pathKey) => {
              if (!node || typeof node !== 'object' || out) return;
              if (Array.isArray(node)) { node.forEach((n) => walk(n, pathKey)); return; }
              const name = (node.Name || node.name || node.iface || '').toString().toLowerCase();
              const keyHit = (pathKey || '').toLowerCase().includes(needle);
              const nameHit = name.includes(needle);
              if (keyHit || nameHit) {
                const ip = getIpFromInterfaceObject(node);
                if (ip) { out = ip; return; }
              }
              for (const [k,v] of Object.entries(node)) {
                if (k === 'IP Address' && (keyHit || nameHit)) {
                  if (Array.isArray(v) && v[0]) { out = v[0]; return; }
                }
                walk(v, k);
                if (out) return;
              }
            };
            walk(root, '');
            return out;
          };
          if (!lan1Ip) lan1Ip = walkFor(sysInfo, 'eth0') || walkFor(sysInfo, 'lan1');
          if (!lan2Ip) lan2Ip = walkFor(sysInfo, 'eth1') || walkFor(sysInfo, 'lan2');
          // Final fallback using regex over stringified object
          const ipRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
          if (!lan1Ip) {
            const str = JSON.stringify(sysInfo?.network?.eth0 || sysInfo?.eth0 || '');
            lan1Ip = (str.match(ipRegex) || [])[0] || null;
          }
          if (!lan2Ip) {
            const str = JSON.stringify(sysInfo?.network?.eth1 || sysInfo?.eth1 || '');
            lan2Ip = (str.match(ipRegex) || [])[0] || null;
          }
          lan1Ip = lan1Ip || 'Unknown';
          lan2Ip = lan2Ip || 'Unknown';

          const wanOpts = [
            { value: '1', label: `Lan 1:${lan1Ip}` },
            { value: '2', label: `Lan 2:${lan2Ip}` },
          ];

          // Try to detect VLAN interface (e.g., eth0.100) from network data
          try {
            const netIfaces = netData?.data?.interfaces || [];
            const vlanIface = netIfaces.find(i => {
              const ifaceName = (i.interface || i.name || '').toString();
              return /^eth0\.[0-9]+$/.test(ifaceName);
            });
            if (vlanIface && vlanIface.ipAddress) {
              const ifaceName = (vlanIface.interface || vlanIface.name || '').toString();
              const vlanId = ifaceName.split('.')[1] || '';
              wanOpts.push({
                value: '3',
                label: `VLAN ${vlanId}:${vlanIface.ipAddress}`,
              });
            }
          } catch (e) {
            console.error('Failed to detect VLAN interface for SIP WAN options:', e);
          }
          setSipWanOptions(wanOpts);
          try { localStorage.setItem('lanIps', JSON.stringify({ lan1: lan1Ip, lan2: lan2Ip })); } catch (_) {}
        } catch (e) {
          console.error('Failed to fetch System Info for LAN IPs:', e);
        }
        
        // Check current default route to determine which interface is active
        let detectedSipWan = '1'; // Default to LAN1
        try {
          // Get the default route and check which interface it uses
          const routeCmd = `ip route | grep '^default' | head -1`;
          const routeRes = await postLinuxCmd({ cmd: routeCmd });
          const routeOutput = (routeRes?.responseData || '').toString();
          
          // Check if route uses eth1 (LAN2) or a VLAN interface (eth0.X)
          if (routeOutput.includes('dev eth1')) {
            detectedSipWan = '2';
          } else if (/dev eth0\.[0-9]+/.test(routeOutput)) {
            detectedSipWan = '3';
          } else if (routeOutput.includes('dev eth0')) {
            detectedSipWan = '1';
          }
          // If neither is found, try alternative route command
          if (!routeOutput.includes('dev eth')) {
            const altRouteCmd = `route -n | grep '^0.0.0.0' | head -1`;
            const altRouteRes = await postLinuxCmd({ cmd: altRouteCmd });
            const altRouteOutput = (altRouteRes?.responseData || '').toString();
            if (altRouteOutput.includes('eth1')) {
              detectedSipWan = '2';
            } else if (/eth0\.[0-9]+/.test(altRouteOutput)) {
              detectedSipWan = '3';
            } else if (altRouteOutput.includes('eth0')) {
              detectedSipWan = '1';
            }
          }
        } catch (e) {
          console.error('Failed to detect current routing interface:', e);
          // Fallback to default LAN1 if detection fails
        }
        
        const res = listRes;
        // Expect res.message.sip_settings[0]
        const settings = res?.message?.sip_settings?.[0] || {};
        const next = { ...getInitialState() };
        Object.entries(settings).forEach(([apiKey, value]) => {
          const uiKey = apiToUiKeyMap[apiKey];
          if (!uiKey) return;
          // Convert API string/null to UI types
          const fieldDef = SIP_SETTINGS_FIELDS.find(f => f.key === uiKey);
          if (!fieldDef) return;
          if (fieldDef.type === 'checkbox') {
            next[uiKey] = value === '1';
          } else if (fieldDef.type === 'radio' || fieldDef.type === 'select' || fieldDef.type === 'text') {
            next[uiKey] = value ?? next[uiKey];
          }
        });
        // Always use detected routing interface as source of truth
        // This ensures the UI reflects the actual device routing state
        next.sipWan = detectedSipWan;
        setForm(next);
        // Initialize previous sipWan value
        previousSipWanRef.current = next.sipWan || '1';
      } catch (e) {
        console.error('Failed to fetch SIP settings:', e);
        setError('Failed to load SIP settings. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [apiToUiKeyMap]);

  const handleChange = (key, value) => {
    // Apply validation based on field definition
    const fieldDef = SIP_SETTINGS_FIELDS.find(f => f.key === key);
    if (fieldDef && fieldDef.validation === 'integer') {
      // Only allow integer values
      if (value === '' || /^\d+$/.test(value)) {
        setForm(prev => ({ ...prev, [key]: value }));
      }
    } else {
      setForm(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleCheckbox = (key) => {
    setForm(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(''); // Clear any previous errors
      // Build settings payload
      const settingsPayload = { id: 1 };
      Object.entries(uiToApiKeyMap).forEach(([uiKey, apiKey]) => {
        const fieldDef = SIP_SETTINGS_FIELDS.find(f => f.key === uiKey);
        if (!fieldDef) return;
        const uiVal = form[uiKey];
        if (fieldDef.type === 'checkbox') {
          settingsPayload[apiKey] = uiVal ? '1' : null;
        } else {
          settingsPayload[apiKey] = uiVal ?? null;
        }
      });

      const res = await updateSipSettings(settingsPayload);
      
      // Update pjsip.conf with new SIP port if changed
      try {
        const sipPort = form.sipPort || '5060';
        const pjsipConfPath = '/etc/asterisk/pjsip.conf';
        
        // Update UDP port in pjsip.conf (no backup)
        const updatePjsipPortCmd = `CONF="${pjsipConfPath}"
PORT="${sipPort}"

if [ -f "$CONF" ]; then
  # Update UDP transport port (bind=0.0.0.0:PORT)
  sed -i '/^\\[transport-udp\\]/,/^\\[/ {
    s|^\\(bind=0.0.0.0:\\)[0-9]\\+|\\1'"$PORT"'|
  }' "$CONF" 2>/dev/null || true
  
  echo "Updated pjsip.conf: UDP port set to $PORT"
  
  # Verify the change
  grep -A 3 "\\[transport-udp\\]" "$CONF" | grep "bind="
else
  echo "Warning: $CONF not found"
fi`;
        
        const pjsipPortUpdateRes = await postLinuxCmd({ cmd: updatePjsipPortCmd });
        console.log('PJSIP UDP port update result:', pjsipPortUpdateRes?.responseData);
      } catch (pjsipPortError) {
        console.error('Failed to update pjsip.conf UDP port:', pjsipPortError);
        // Don't fail the whole save operation if this fails
      }
      
      // Update pjsip_registrations.conf with inband_progress setting
      try {
        const inbandProgressValue = form.send180 === 'Yes' ? 'yes' : 'no';
        const pjsipConfPath = '/etc/asterisk/pjsip_registrations.conf';
        
        // Update inband_progress in all endpoint sections
        const updatePjsipCmd = `CONF="${pjsipConfPath}"
VALUE="${inbandProgressValue}"

if [ -f "$CONF" ]; then
  # Remove all existing inband_progress lines
  sed -i '/^[[:space:]]*inband_progress[[:space:]]*=/d' "$CONF" 2>/dev/null || true
  
  # Add inband_progress after each "type=endpoint" line
  sed -i '/^[[:space:]]*type[[:space:]]*=[[:space:]]*endpoint[[:space:]]*$/a inband_progress='"$VALUE" "$CONF" 2>/dev/null || true
  
  echo "Updated pjsip_registrations.conf: inband_progress=$VALUE in all endpoint sections"
else
  echo "Warning: $CONF not found"
fi`;
        
        const pjsipUpdateRes = await postLinuxCmd({ cmd: updatePjsipCmd });
        console.log('PJSIP config update result:', pjsipUpdateRes?.responseData);
      } catch (pjsipError) {
        console.error('Failed to update pjsip_registrations.conf:', pjsipError);
        // Don't fail the whole save operation if this fails
      }
      
      // Always execute routing command to ensure proper configuration
      // This handles new devices and ensures metrics are always set correctly
      const currentSipWan = form.sipWan || '1';
      const previousSipWan = previousSipWanRef.current;
      
      // Always run routing update (not just when changed) to ensure metrics are set
      if (true) {
        try {
          // Show progress message
          setError('Configuring routing... Please wait.');
          
          // --- UNIVERSAL CLEAN ROUTING UPDATE LOGIC ---
          // Fetch real gateway info for each interface
          const net = await fetchNetwork();
          const interfaces = net?.data?.interfaces || [];
          
          const eth0 = interfaces.find(i => {
            const name = (i.interface || i.name || '').toString().toLowerCase();
            return name === 'eth0';
          });
          
          const eth1 = interfaces.find(i => {
            const name = (i.interface || i.name || '').toString().toLowerCase();
            return name === 'eth1';
          });

          // Detect VLAN interface (eth0.X) and its gateway from vlan.cfg
          let vlanInterfaceName = null;
          let gatewayVlan = null;
          try {
            // Get VLAN interface name from vlan.cfg (auto eth0.100)
            const vlanIfaceCmd = `grep -E '^auto[[:space:]]+eth0\\.[0-9]+' /etc/network/interfaces.d/vlan.cfg 2>/dev/null | head -1 | awk '{print $2}'`;
            const vlanIfaceRes = await postLinuxCmd({ cmd: vlanIfaceCmd });
            const vlanIfaceOut = (vlanIfaceRes?.responseData || '').toString().trim();
            if (vlanIfaceOut && /^eth0\.[0-9]+$/.test(vlanIfaceOut)) {
              vlanInterfaceName = vlanIfaceOut;
            }
            // Get VLAN gateway from vlan.cfg
            const vlanGwCmd = `grep -E '^[[:space:]]*(#)?[[:space:]]*gateway[[:space:]]' /etc/network/interfaces.d/vlan.cfg 2>/dev/null | head -1 | sed 's/^[[:space:]]*#\\?[[:space:]]*gateway[[:space:]]*//' | awk '{print $1}'`;
            const vlanGwRes = await postLinuxCmd({ cmd: vlanGwCmd });
            const vlanGwOut = (vlanGwRes?.responseData || '').toString().trim();
            if (vlanGwOut && /^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/.test(vlanGwOut)) {
              gatewayVlan = vlanGwOut;
            }
          } catch (e) {
            console.warn('Failed to detect VLAN interface/gateway for SIP routing:', e);
          }

          // Extract gateways dynamically (each device may have different)
          let gatewayEth0 = eth0?.defaultGateway || eth0?.gateway || null;
          let gatewayEth1 = eth1?.defaultGateway || eth1?.gateway || null;

          // Fallback: If gateway not found in API (e.g., because it's commented), read from config file
          // This reads gateway even if it's commented out in the config file
          if (!gatewayEth0) {
            try {
              const gwCmd0 = `grep -E '^[[:space:]]*(#)?[[:space:]]*gateway[[:space:]]' /etc/network/interfaces.d/eth0 2>/dev/null | head -1 | sed 's/^[[:space:]]*#\\?[[:space:]]*gateway[[:space:]]*//' | awk '{print $1}'`;
              const gwRes0 = await postLinuxCmd({ cmd: gwCmd0 });
              const gw0 = (gwRes0?.responseData || '').toString().trim();
              if (gw0 && /^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/.test(gw0)) {
                gatewayEth0 = gw0;
                console.log('Read eth0 gateway from config file:', gatewayEth0);
              }
            } catch (e) {
              console.warn('Failed to read eth0 gateway from config file:', e);
            }
          }

          if (!gatewayEth1) {
            try {
              const gwCmd1 = `grep -E '^[[:space:]]*(#)?[[:space:]]*gateway[[:space:]]' /etc/network/interfaces.d/eth1 2>/dev/null | head -1 | sed 's/^[[:space:]]*#\\?[[:space:]]*gateway[[:space:]]*//' | awk '{print $1}'`;
              const gwRes1 = await postLinuxCmd({ cmd: gwCmd1 });
              const gw1 = (gwRes1?.responseData || '').toString().trim();
              if (gw1 && /^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/.test(gw1)) {
                gatewayEth1 = gw1;
                console.log('Read eth1 gateway from config file:', gatewayEth1);
              }
            } catch (e) {
              console.warn('Failed to read eth1 gateway from config file:', e);
            }
          }

          // Determine user-selected interface
          let interfaceName;
          let selectedGateway;
          let nonSelectedInterface;
          let nonSelectedGateway;

          if (currentSipWan === '3') {
            // VLAN selected
            if (!vlanInterfaceName || !gatewayVlan) {
              alert('Unable to detect VLAN interface or gateway. Routing update skipped.');
              return;
            }
            interfaceName = vlanInterfaceName;
            selectedGateway = gatewayVlan;
            // Use eth0 or eth1 (whichever has a gateway) as backup
            if (gatewayEth0) {
              nonSelectedInterface = 'eth0';
              nonSelectedGateway = gatewayEth0;
            } else if (gatewayEth1) {
              nonSelectedInterface = 'eth1';
              nonSelectedGateway = gatewayEth1;
            } else {
              nonSelectedInterface = '';
              nonSelectedGateway = null;
            }
          } else {
            // LAN1 or LAN2 selected
            interfaceName = currentSipWan === '1' ? 'eth0' : 'eth1';
            selectedGateway = currentSipWan === '1' ? gatewayEth0 : gatewayEth1;

            if (!selectedGateway) {
              alert('Unable to detect gateway for selected interface. Routing update skipped.');
              return;
            }

            nonSelectedInterface = currentSipWan === '1' ? 'eth1' : 'eth0';
            nonSelectedGateway = currentSipWan === '1' ? gatewayEth1 : gatewayEth0;
          }

          // Use metric-based routing with enforcement daemon
          // Selected interface gets metric 100, backup gets 200
          // Daemon ensures routing stays correct even after VPN connects
          const cmd = `
# CLIXXO Routing Configuration with Enforcement
# This ensures selected interface remains primary even when VPN connects

# Step 1: Remove all existing default routes
while ip route del default 2>/dev/null; do :; done

# Step 2: Add primary route for selected interface (metric 100)
ip route add default via ${selectedGateway} dev ${interfaceName} metric 100

# Step 3: Add backup route for non-selected interface (metric 200, only if different gateway)
${nonSelectedGateway ? `ip route add default via ${nonSelectedGateway} dev ${nonSelectedInterface} metric 200` : '# No backup gateway'}

# Step 4: Create routing enforcement daemon
DAEMON="/usr/local/bin/clixxo-routing-enforcer.sh"
cat > "\$DAEMON" <<'ENFORCEREOF'
#!/bin/bash
# CLIXXO Routing Enforcer - Ensures routing stays on selected interface
# Runs every 10 seconds to check and fix routing if VPN or other services change it

PRIMARY_GW="${selectedGateway}"
PRIMARY_IF="${interfaceName}"
PRIMARY_METRIC="100"
BACKUP_GW="${nonSelectedGateway}"
BACKUP_IF="${nonSelectedInterface}"
BACKUP_METRIC="200"

while true; do
  # Check if primary route exists with correct metric
  if ! ip route show | grep -q "default via \$PRIMARY_GW dev \$PRIMARY_IF metric \$PRIMARY_METRIC"; then
    # Route is missing or wrong - fix it
    logger "CLIXXO: Routing changed, re-applying \$PRIMARY_IF as primary"
    
    # Remove all default routes
    while ip route del default 2>/dev/null; do :; done
    
    # Re-add primary route
    ip route add default via \$PRIMARY_GW dev \$PRIMARY_IF metric \$PRIMARY_METRIC
    
    # Re-add backup route if configured
    if [ -n "\$BACKUP_GW" ]; then
      ip route add default via \$BACKUP_GW dev \$BACKUP_IF metric \$BACKUP_METRIC 2>/dev/null || true
    fi
  fi
  
  sleep 10
done
ENFORCEREOF
chmod +x "\$DAEMON"

# Step 5: Create systemd service for the daemon
SERVICE="/etc/systemd/system/clixxo-routing-enforcer.service"
cat > "\$SERVICE" <<'SERVICEEOF'
[Unit]
Description=CLIXXO Routing Enforcer
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/clixxo-routing-enforcer.sh
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SERVICEEOF

# Step 6: Enable and start the daemon
systemctl daemon-reload
systemctl enable clixxo-routing-enforcer.service
systemctl restart clixxo-routing-enforcer.service

# Step 7: Also update rc.local as fallback (in case daemon fails)
RC_LOCAL="/etc/rc.local"
if [ ! -f "\$RC_LOCAL" ]; then
  cat > "\$RC_LOCAL" <<'RCEOF'
#!/bin/bash
exit 0
RCEOF
  chmod +x "\$RC_LOCAL"
fi

# Remove old entries
sed -i '/# CLIXXO SIP Routing/d' "\$RC_LOCAL" 2>/dev/null || true
sed -i '/ip route.*default.*metric/d' "\$RC_LOCAL" 2>/dev/null || true
sed -i '/while ip route del default/d' "\$RC_LOCAL" 2>/dev/null || true

# Add routing setup to rc.local (runs at boot)
sed -i '/^exit 0/i \\# CLIXXO SIP Routing - Auto-configured' "\$RC_LOCAL"
sed -i "/^exit 0/i while ip route del default 2>/dev/null; do :; done" "\$RC_LOCAL"
sed -i "/^exit 0/i ip route add default via ${selectedGateway} dev ${interfaceName} metric 100" "\$RC_LOCAL"
${nonSelectedGateway ? `sed -i "/^exit 0/i ip route add default via ${nonSelectedGateway} dev ${nonSelectedInterface} metric 200" "\$RC_LOCAL"` : ''}

echo "=== Routing Configuration Complete ==="
echo "Primary: ${interfaceName} via ${selectedGateway} (metric 100)"
${nonSelectedGateway ? `echo "Backup: ${nonSelectedInterface} via ${nonSelectedGateway} (metric 200)"` : ''}
echo "Enforcement daemon: Active (checks every 10 seconds)"
echo "Configuration persists across reboots"
`;

          console.log('Routing update cmd:', cmd);
          const linuxCmdRes = await postLinuxCmd({ cmd });

          // Clear the progress message
          setError('');
          
          if (linuxCmdRes?.response && linuxCmdRes?.responseData !== undefined) {
            console.log(`Routing changed to ${interfaceName} via ${selectedGateway}:`, linuxCmdRes.responseData);
            console.log('Routing enforcer daemon started. Changes will persist after reboot.');
          } else if (linuxCmdRes?.response === false || linuxCmdRes?.response === 'false') {
            // Command failed
            console.error('Routing command failed:', linuxCmdRes);
            throw new Error('Routing command execution failed');
          } else {
            // Response format unexpected but might still have succeeded
            console.warn('Linux command response format unexpected:', linuxCmdRes);
            console.log('Routing update may have succeeded.');
          }
          // --- END UNIVERSAL CLEAN ROUTING LOGIC ---
        } catch (cmdError) {
          console.error('Failed to execute routing command:', cmdError);
          // Config files may have been updated even if command failed
          // The changes will still apply on next reboot
          alert('Settings saved. Routing update encountered an issue, but config files were updated. Changes will apply after reboot. If you need immediate routing change, please reboot the device.');
        }

        // Update the previous value after successful command execution
        previousSipWanRef.current = currentSipWan;
      }
      
      alert(res?.message || 'Settings Updated');
    } catch (e) {
      console.error('Failed to save SIP settings:', e);
      alert(e?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm(getInitialState());
  };
  
  return (
    <div className="bg-gray-50 min-h-[calc(100vh-80px)] py-0 flex flex-col items-center" style={{backgroundColor: "#dde0e4"}}>
      <div className="w-full max-w-4xl mx-auto">
        {error && !saving && (
          <Alert severity="error" onClose={() => setError('')} sx={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, minWidth: 300, boxShadow: 3 }}>{error}</Alert>
        )}
        {saving && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-white rounded-lg shadow-xl p-6 flex flex-col items-center gap-4 pointer-events-auto" style={{ minWidth: '300px' }}>
              <CircularProgress size={50} sx={{ color: '#0e8fd6' }} />
              <div className="text-lg font-medium text-gray-700">Applying Settings...</div>
              <div className="text-sm text-gray-500">Configuring routing and services</div>
            </div>
          </div>
        )}
        {loadSuccess && (
          <Alert severity="success" sx={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, minWidth: 300, boxShadow: 3 }}>SIP settings loaded successfully.</Alert>
        )}
        {/* Header */}
        <div className="w-full h-8 bg-gradient-to-b from-[#b3e0ff] via-[#6ec1f7] to-[#3b8fd6] flex items-center justify-center font-semibold text-lg text-gray-600 shadow mb-0">
          SIP Settings
        </div>
        
        {/* Content */}
        <div className="border-2 border-gray-400 border-t-0 shadow-sm flex flex-col" style={{backgroundColor: "#dde0e4"}}>
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px] bg-white">
              <div className="text-center">
                <CircularProgress size={40} sx={{ color: '#0e8fd6' }} />
                <div className="mt-3 text-gray-600">Loading SIP settings...</div>
              </div>
            </div>
          ) : (
          <div className="flex-1 py-4 px-16">
            <div className="space-y-4">
              {SIP_SETTINGS_FIELDS.map((field, idx) => {
                // Skip conditional fields if their condition is not met
                if (field.conditional) {
                  if (field.conditionalValues) {
                    // Check for multiple possible values (e.g., assertedId === 'P-Asserted-Identity' || 'P-Preferred-Identity')
                    if (!field.conditionalValues.includes(form[field.conditional])) {
                      return null;
                    }
                  } else if (field.conditionalValue) {
                    // Check for specific value condition (e.g., softSwitch === 'VOS')
                    if (form[field.conditional] !== field.conditionalValue) {
                      return null;
                    }
                  } else {
                    // Check for boolean condition (e.g., tls === true)
                    if (field.conditionalInverted) {
                      // Inverted condition: show when field is false (e.g., workingPeriod === false)
                      if (form[field.conditional]) {
                        return null;
                      }
                    } else {
                      // Normal condition: show when field is true (e.g., tls === true)
                      // For radio fields, check if value is 'Yes'
                      if (field.type === 'radio') {
                        if (form[field.conditional] !== 'Yes') {
                          return null;
                        }
                      } else {
                        if (!form[field.conditional]) {
                          return null;
                        }
                      }
                    }
                  }
                }
                
                return (
                <div key={field.key} className="flex items-center justify-between">
                  <label className={`text-sm text-gray-600 font-medium text-left ${field.key === 'externalBound' ? '' : 'whitespace-nowrap'}`} style={{ width: field.key === 'externalBound' ? '380px' : '320px', marginRight: '10px', lineHeight: '1.4' }}>
                    {field.key === 'externalBound'
                      ? 'When the externally bound is enabled, only the externally bound address is matched to confirm the SIP trunk'
                      : field.label}
                  </label>
                  
                  {field.type === 'text' && (
                    <input
                      type={field.key === 'calledPrefix' ? 'text' : 'number'}
                      value={form[field.key]}
                      className="border border-gray-400 bg-white"
                      style={{ 
                        width: '200px',
                        height: '28px',
                        padding: '4px 10px',
                        fontSize: '13px',
                        borderRadius: '4px',
                        outline: 'none'
                      }}
                      onChange={e => {
                        const value = e.target.value;
                        if (field.key === 'calledPrefix') {
                          if (/^[0-9:]*$/.test(value) && value.split(':').length <= 6) {
                            handleChange(field.key, value);
                          }
                        } else {
                          if (/^\d*$/.test(value) || value === '') {
                            handleChange(field.key, value);
                          }
                        }
                      }}
                      placeholder={field.key === 'calledPrefix' ? 'e.g., 123:456:789' : ''}
                    />
                  )}
                  
                  {field.type === 'select' && (
                    <FormControl size="small">
                      <Select
                        value={form[field.key]}
                        onChange={e => handleChange(field.key, e.target.value)}
                        variant="outlined"
                        style={{ width: '200px', height: '28px' }}
                        sx={{ 
                          fontSize: 13,
                          height: 28,
                          backgroundColor: '#ffffff',
                          '& .MuiOutlinedInput-root': { 
                            backgroundColor: '#ffffff',
                            height: 28,
                            '& fieldset': {
                              borderColor: '#999999',
                            },
                            '&:hover fieldset': {
                              borderColor: '#999999',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#999999',
                            }
                          },
                          '& .MuiSelect-select': { 
                            backgroundColor: '#ffffff',
                            padding: '4px 10px',
                            height: 'auto',
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '13px'
                          }
                        }}
                      >
                        {(field.key === 'sipWan' && sipWanOptions.length > 0
                          ? sipWanOptions.map(o => (<MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>))
                          : field.options.map(opt => (<MenuItem key={opt} value={opt}>{opt}</MenuItem>))
                        )}
                      </Select>
                    </FormControl>
                  )}
                  
                  {field.type === 'checkbox' && (
                    <div className="flex items-center" style={{ width: '200px', height: '28px' }}>
                      <input
                        type="checkbox"
                        checked={!!form[field.key]}
                        className="w-4 h-4 mr-2 accent-blue-600"
                        onChange={() => handleCheckbox(field.key)}
                      />
                      {field.key === 'workingPeriod' ? (
                                  field.labelAfter && <span className="text-sm text-gray-600">{field.labelAfter}</span>
                      ) : (
                        <>
                          <span className="text-sm text-gray-600">Enable</span>
                          {field.labelAfter && <span className="text-sm ml-2 text-gray-600">{field.labelAfter}</span>}
                        </>
                      )}
                    </div>
                  )}
                  
                  {field.type === 'radio' && (
                    <div className="flex items-center" style={{ width: '200px', height: '28px' }}>
                      <label className="flex items-center text-sm mr-4">
                        <input
                          type="radio"
                          name={field.key}
                          value="Yes"
                          checked={form[field.key] === 'Yes'}
                          onChange={() => handleChange(field.key, 'Yes')}
                          className="mr-1 accent-blue-600"
                        />
                        Yes
                      </label>
                      <label className="flex items-center text-sm">
                        <input
                          type="radio"
                          name={field.key}
                          value="No"
                          checked={form[field.key] === 'No'}
                          onChange={() => handleChange(field.key, 'No')}
                          className="mr-1 accent-blue-600"
                        />
                        No
                      </label>
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          </div>
          )}
        </div>
        
        {/* Buttons */}
        <div className="flex justify-center gap-8 mt-6">
          <Button
            variant="contained"
            disabled={loading || saving}
            sx={{
              background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '16px',
              minWidth: 100,
              minHeight: 42,
              px: 2,
              py: 0.5,
              boxShadow: '0 2px 8px #b3e0ff',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)',
                color: '#fff',
              },
              '&:disabled': {
                background: '#cccccc',
                color: '#666666',
              },
            }}
            onClick={handleSave}
            startIcon={saving && <CircularProgress size={20} color="inherit" />}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
          <Button
            variant="contained"
            sx={{
              background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
                color: '#fff',
              fontWeight: 600,
              fontSize: '16px',
              minWidth: 100,
              minHeight: 42,
              px: 2,
              py: 0.5,
              boxShadow: '0 2px 8px #b3e0ff',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)',
                color: '#fff',
              },
            }}
            onClick={handleReset}
          >Reset</Button>
        </div>
        
        {/* Note */}
        <div className="text-red-600 text-center mt-6 text-sm">
          {SIP_SETTINGS_NOTE}
        </div>
      </div>
    </div>
  );
};

export default SipSipPage;
