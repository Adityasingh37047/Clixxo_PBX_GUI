import React, { useState, useEffect, useRef } from 'react';
import { NETWORK_SETTINGS_FIELDS, NETWORK_SETTINGS_INITIAL_FORM } from '../constants/NetworkConstants';
import { TextField, Button, Select, MenuItem, Alert, CircularProgress } from '@mui/material';
import { fetchNetwork, resetNetworkSettings, saveNetworkSettings, postLinuxCmd, servicePing } from '../api/apiService';
import axiosInstance from '../api/axiosInstance';

const blueButtonSx = {
  background: 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)',
  color: '#fff',
  fontWeight: 600,
  fontSize: 16,
  borderRadius: 1.5,
  minWidth: 120,
  boxShadow: '0 2px 8px #b3e0ff',
  textTransform: 'none',
  px: 3,
  py: 1.5,
  padding: '6px 28px',
  '&:hover': {
    background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
    color: '#fff',
  },
};

const grayButtonSx = {
  background: 'linear-gradient(to bottom, #e3e7ef 0%, #bfc6d1 100%)',
  color: '#444',
  fontWeight: 600,
  fontSize: 15,
  borderRadius: 1.5,
  minWidth: 120,
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  textTransform: 'none',
  px: 3,
  py: 1.5,
  padding: '6px 28px',
  '&:hover': {
    background: 'linear-gradient(to bottom, #bfc6d1 0%, #e3e7ef 100%)',
    color: '#444',
  },
};

// Unified input sizing to keep all fields consistent (32px height)
const inputSx = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#fff',
    height: '32px',
    minHeight: '32px',
    '& fieldset': { borderColor: '#bbb', borderWidth: '1px' },
    '&:hover fieldset': { borderColor: '#999' },
    '&.Mui-focused fieldset': { borderColor: '#666' },
  },
  '& .MuiInputBase-input': {
    fontSize: '14px',
    padding: '6px 8px',
    height: '20px',
    lineHeight: '20px',
  },
};

const select32Sx = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#fff !important',
    height: '32px',
    minHeight: '32px',
    '& fieldset': { borderColor: '#bbb', borderWidth: '1px' },
    '&:hover fieldset': { borderColor: '#999' },
    '&.Mui-focused fieldset': { borderColor: '#666' },
  },
  '& .MuiSelect-select': {
    backgroundColor: '#fff !important',
    fontSize: '14px',
    padding: '6px 8px',
    height: '20px',
    lineHeight: '20px',
    display: 'flex',
    alignItems: 'center',
  },
  '& .MuiSelect-icon': { color: '#666', right: '8px' },
};

const Network = () => {
  const [lanInterfaces, setLanInterfaces] = useState([]);
  const [dnsServers, setDnsServers] = useState(['', '']);
  const [arpMode, setArpMode] = useState('1');
  const [loading, setLoading] = useState(true); // Start with loading true for initial load
  const [error, setError] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  // Error states for each field
  const [ipErrors, setIpErrors] = useState([]);
  const [subnetErrors, setSubnetErrors] = useState([]);
  const [gatewayErrors, setGatewayErrors] = useState([]);
  const [dnsErrors, setDnsErrors] = useState(['', '']);
  const [arpError, setArpError] = useState('');
  // VLAN state
  const [vlanEnabled, setVlanEnabled] = useState(false);
  const [vlanForm, setVlanForm] = useState({
    lan1Ip: '', lan1Mask: '', lan1Gw: '',
    vlan1Id: '', vlan1Ip: '', vlan1Mask: '', vlan1Gw: '',
    vlan2Id: '', vlan2Ip: '', vlan2Mask: '', vlan2Gw: '',
    vlan3Id: '', vlan3Ip: '', vlan3Mask: '', vlan3Gw: '',
  });
  // Removed showConfirm and pendingSave for native confirm
  const [hasChanges, setHasChanges] = useState(false);
  const [networkRestarting, setNetworkRestarting] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const [pendingIps, setPendingIps] = useState([]);

  const [originalLanSnapshot, setOriginalLanSnapshot] = useState([]);
  const [originalDnsSnapshot, setOriginalDnsSnapshot] = useState(['', '']);
  const [originalArp, setOriginalArp] = useState('1');
  const [originalVlanEnabled, setOriginalVlanEnabled] = useState(false);
  const [originalVlanSnapshot, setOriginalVlanSnapshot] = useState({});

  const pingIntervalRef = useRef(null);
  const restartTimeoutRef = useRef(null);

  function isValidIPv4(ip) {
    return /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip);
  }
  function isValidSubnetMask(mask) {
    const masks = [
      "255.0.0.0","255.255.0.0","255.255.255.0","255.255.255.128","255.255.255.192","255.255.255.224","255.255.255.240","255.255.255.248","255.255.255.252","255.255.255.254","255.255.255.255"
    ];
    return masks.includes(mask);
  }
  function isValidArpMode(mode) {
    return mode === '1' || mode === '2';
  }

  const clearRestartPolling = () => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearRestartPolling();
    };
  }, []);

  const loadNetworkData = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await fetchNetwork();

      if (data && data.data) {
        if (Array.isArray(data.data.interfaces)) {
          const allIfaces = data.data.interfaces;
          const filteredInterfaces = allIfaces
            .filter(iface => {
              const interfaceName = iface.interface || '';
              return interfaceName === 'eth0' || interfaceName === 'eth1';
            })
            .map(iface => {
              const withType = { ...iface, ipv4Type: iface.ipv4Type || 'Static' };
              if (withType.interface === 'eth0') {
                return { ...withType, name: 'LAN 1' };
              } else if (withType.interface === 'eth1') {
                return { ...withType, name: 'LAN 2' };
              }
              return withType;
            })
            .sort((a, b) => {
              const order = { 'LAN 1': 1, 'LAN 2': 2 };
              const aOrder = order[a.name] || 99;
              const bOrder = order[b.name] || 99;
              return aOrder - bOrder;
            });

          setLanInterfaces(filteredInterfaces);
          setOriginalLanSnapshot(normalizeLanArray(filteredInterfaces));

        const lan1 = filteredInterfaces.find(l => l.name === 'LAN 1' || l.interface === 'eth0') || {};
        const vlanIface = allIfaces.find(i => typeof i.interface === 'string' && /^eth0\.[0-9]+$/.test(i.interface));
        const hasVlan = Boolean(vlanIface);

        // Try to read VLAN gateway from vlan.cfg if it exists
        let vlanGateway = '';
        if (hasVlan) {
          try {
            const vlanCfgGwCmd = `grep -E '^[[:space:]]*(#)?[[:space:]]*gateway[[:space:]]' /etc/network/interfaces.d/vlan.cfg 2>/dev/null | head -1 | sed 's/^[[:space:]]*#\\?[[:space:]]*gateway[[:space:]]*//' | awk '{print $1}'`;
            const vlanCfgGwRes = await postLinuxCmd({ cmd: vlanCfgGwCmd });
            const vlanCfgGw = (vlanCfgGwRes?.responseData || vlanCfgGwRes?.response || '').toString().trim();
            if (vlanCfgGw && /^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/.test(vlanCfgGw)) {
              vlanGateway = vlanCfgGw;
              console.log('Read VLAN gateway from /etc/network/interfaces.d/vlan.cfg:', vlanGateway);
            }
          } catch (e) {
            console.warn('Failed to read VLAN gateway from vlan.cfg:', e);
          }
        }

        const initialVlan = {
          lan1Ip: lan1.ipAddress || '',
          lan1Mask: lan1.subnetMask || '',
          lan1Gw: lan1.defaultGateway || '',
          vlan1Id: hasVlan ? String(vlanIface.interface.split('.')[1] || '') : '',
          vlan1Ip: hasVlan ? vlanIface.ipAddress || '' : '',
          vlan1Mask: hasVlan ? vlanIface.subnetMask || '' : '',
          vlan1Gw: hasVlan ? (vlanGateway || vlanIface.defaultGateway || '') : '',
            vlan2Id: '',
            vlan2Ip: '',
            vlan2Mask: '',
            vlan2Gw: '',
            vlan3Id: '',
            vlan3Ip: '',
            vlan3Mask: '',
            vlan3Gw: '',
          };

          setVlanEnabled(hasVlan);
          setVlanForm(prev => ({ ...prev, ...initialVlan }));
          setOriginalVlanEnabled(hasVlan);
          setOriginalVlanSnapshot(normalizeVlanSnapshot(initialVlan));
        }
        const dnsSnap = data.data.dnsServers || ['', ''];
        const arpSnap = data.data.defaultArpMode || '1';
        setDnsServers(dnsSnap);
        setArpMode(arpSnap);
        setOriginalDnsSnapshot([...(dnsSnap || ['', ''])]);
        setOriginalArp(arpSnap);
      } else { 
        throw new Error('Invalid data format received from server');
      }
    } catch (err) {
      console.error('Network data fetch error:', err);

      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('Request timeout. Please check your connection and try again.');
      } else if (err.response?.status === 404) {
        setError('Network configuration not found. Please contact administrator.');
      } else if (err.response?.status >= 500) {
        setError('Server error. Please try again later or contact support.');
      } else if (err.message?.includes('Network Error') || err.message?.includes('Failed to fetch')) {
        setError('Network connection failed. Please check your internet connection.');
      } else {
        setError('Failed to load network settings. Please refresh the page and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNetworkData();
  }, []);

  const normalizeLanArray = (interfaces = []) => (
    (interfaces || []).map((lan, idx) => ({
      key: (lan?.interface || lan?.name || `index-${idx}`).toString(),
      ipAddress: lan?.ipAddress || '',
      subnetMask: lan?.subnetMask || '',
      defaultGateway: lan?.defaultGateway || '',
      ipv6Address: lan?.ipv6Address || '',
      ipv6Prefix: lan?.ipv6Prefix || '',
    }))
  );

  const normalizeVlanSnapshot = (form = {}) => ({
    lan1Ip: form.lan1Ip || '',
    lan1Mask: form.lan1Mask || '',
    lan1Gw: form.lan1Gw || '',
    vlan1Id: form.vlan1Id || '',
    vlan1Ip: form.vlan1Ip || '',
    vlan1Mask: form.vlan1Mask || '',
    vlan1Gw: form.vlan1Gw || '',
    vlan2Id: form.vlan2Id || '',
    vlan2Ip: form.vlan2Ip || '',
    vlan2Mask: form.vlan2Mask || '',
    vlan2Gw: form.vlan2Gw || '',
    vlan3Id: form.vlan3Id || '',
    vlan3Ip: form.vlan3Ip || '',
    vlan3Mask: form.vlan3Mask || '',
    vlan3Gw: form.vlan3Gw || '',
  });

  const applyStaticDefaults = (lan) => {
    const next = { ...lan };
    const isLan1 = next.name === 'LAN 1' || next.interface === 'eth0';
    const isLan2 = next.name === 'LAN 2' || next.interface === 'eth1';

    // If we already have an IPv4 address (e.g. coming from DHCP) but no gateway,
    // derive a sensible default gateway from the IP itself (x.y.z.1) and a /24 mask.
    if (next.ipAddress && !next.defaultGateway && isValidIPv4(next.ipAddress)) {
      const parts = next.ipAddress.split('.');
      if (parts.length === 4) {
        next.defaultGateway = `${parts[0]}.${parts[1]}.${parts[2]}.1`;
      }
      if (!next.subnetMask) {
        next.subnetMask = '255.255.255.0';
      }
      return next;
    }

    // If there is no IP at all, fall back to our series defaults.
    if (isLan1) {
      if (!next.ipAddress) next.ipAddress = '192.168.0.101';
      if (!next.subnetMask) next.subnetMask = '255.255.255.0';
      if (!next.defaultGateway) next.defaultGateway = '192.168.0.1';
    } else if (isLan2) {
      if (!next.ipAddress) next.ipAddress = '192.168.1.101';
      if (!next.subnetMask) next.subnetMask = '255.255.255.0';
      if (!next.defaultGateway) next.defaultGateway = '192.168.1.1';
    }

    return next;
  };


  // Update setHasChanges to true on any input change
  const handleLanChange = (index, field, value) => {
    setHasChanges(true);
    setLanInterfaces(prev => {
      const updated = [...prev];
      const current = updated[index] || {};
      let next = { ...current, [field]: value };

      // When switching back to Static, apply sensible defaults if needed,
      // but DO NOT auto-change other interfaces any more.
      if (field === 'ipv4Type' && value === 'Static') {
        next = applyStaticDefaults(next);
      }

      updated[index] = next;
      return updated;
    });
    // Clear error for the changed field
    if (field === 'ipAddress') {
      setIpErrors(prev => {
        const arr = [...prev]; arr[index] = ''; return arr;
      });
    }
    if (field === 'subnetMask') {
      setSubnetErrors(prev => {
        const arr = [...prev]; arr[index] = ''; return arr;
      });
    }
    if (field === 'defaultGateway') {
      setGatewayErrors(prev => {
        const arr = [...prev]; arr[index] = ''; return arr;
      });
    }
    if (field === 'ipv4Type') {
      setIpErrors(prev => {
        const arr = [...prev]; arr[index] = ''; return arr;
      });
      setSubnetErrors(prev => {
        const arr = [...prev]; arr[index] = ''; return arr;
      });
      setGatewayErrors(prev => {
        const arr = [...prev]; arr[index] = ''; return arr;
      });
    }
  };

  const handleDnsChange = (idx, value) => {
    setHasChanges(true);
    setDnsServers(prev => {
      const updated = [...prev];
      updated[idx] = value;
      return updated;
    });
    setDnsErrors(prev => {
      const arr = [...prev]; arr[idx] = ''; return arr;
    });
  };

  const handleVlanChange = (field, value) => {
    setHasChanges(true);
    setVlanForm(prev => ({ ...prev, [field]: value }));
  };

  const handleArpChange = (e) => {
    setHasChanges(true);
    setArpMode(e.target.value);
    setArpError('');
  };

  const handleReset = async () => {
    clearRestartPolling();
    setNetworkRestarting(false);
    setProgressMessage('');
    try {
      setResetting(true);
      setResetSuccess(false);
      setError('');
      
      const resp = await resetNetworkSettings();
      
      if (resp.response) {
        await loadNetworkData();
        setResetSuccess(true);
        setTimeout(() => setResetSuccess(false), 3000);
      } else {
        throw new Error(resp.message || 'Reset operation failed');
      }
    } catch (error) {
      console.error('Network reset error:', error);
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        setError('Reset timeout. Please check your connection and try again.');
      } else if (error.response?.status >= 500) {
        setError('Server error during reset. Please try again later.');
      } else if (error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
        setError('Network connection failed during reset. Please check your connection.');
      } else {
        setError(error.message || 'Failed to reset network settings. Please try again.');
      }
    } finally {
      setResetting(false);
    }
  };

  const pingDevice = async (targetIp) => {
    const protocol = window.location.protocol;
    const port = window.location.port ? `:${window.location.port}` : '';
    const base = targetIp ? `${protocol}//${targetIp}${port}` : window.location.origin;
    const url = `${base}/api/service-ping`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);
    try {
      const res = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        signal: controller.signal,
      });
      if (!res.ok) throw new Error('Ping failed');
      const data = await res.json();
      return data;
    } finally {
      clearTimeout(timeout);
    }
  };

  const checkDeviceOnline = async (targetIp = null) => {
    try {
      const res = targetIp ? await pingDevice(targetIp) : await servicePing();
      if (res?.response) return true;
      return false;
    } catch (err) {
      if (err?.response && (err.response.status === 401 || err.response.status === 403)) {
        return true;
      }
      return false;
    }
  };

  const beginNetworkPolling = (initialMessage = 'Checking device availability...', targetIpList = []) => {
    clearRestartPolling();
    setProgressMessage(initialMessage);
    const sanitizedTargets = (targetIpList && targetIpList.length ? targetIpList : [window.location.hostname])
      .map(ip => (ip || '').trim())
      .filter(Boolean);
    const targets = Array.from(new Set(sanitizedTargets.length ? sanitizedTargets : [window.location.hostname]));

    let attempts = 0;
    pingIntervalRef.current = setInterval(async () => {
      attempts += 1;
      for (const targetIp of targets) {
        const online = await checkDeviceOnline(targetIp);
        if (online) {
          clearRestartPolling();
          setProgressMessage('Device is back online. Redirecting to login...');
          setTimeout(() => {
            const protocol = window.location.protocol;
            const port = window.location.port ? `:${window.location.port}` : '';
            const redirectHost = targetIp || window.location.hostname;
            window.location.href = `${protocol}//${redirectHost}${port}/login`;
          }, 3000);
          return;
        }
      }
      if (attempts >= 60) {
        clearRestartPolling();
        setNetworkRestarting(false);
        setProgressMessage('');
        setError('Network service restart timed out. Please verify device connectivity.');
      }
    }, 5000);
  };

  const triggerNetworkRestart = async (targetsOverride = null) => {
    setNetworkRestarting(true);
    setProgressMessage('Network settings saved. Rebooting device...');
    try {
      const rebootCmd = 'nohup sh -c "sleep 5; reboot" >/dev/null 2>&1 & echo REBOOT_TRIGGERED';
      await postLinuxCmd({ cmd: rebootCmd });
    } catch (err) {
      console.error('Failed to initiate reboot:', err);
      setNetworkRestarting(false);
      setProgressMessage('');
      setError(err?.message || 'Failed to reboot device. Please reboot manually.');
      return;
    }

    const targets = (targetsOverride && targetsOverride.length ? targetsOverride : pendingIps?.length ? pendingIps : null) || [window.location.hostname];

    restartTimeoutRef.current = setTimeout(() => {
      beginNetworkPolling('Device is rebooting. Waiting for it to come back online...', targets);
    }, 8000);
  };

  // Move actual save logic here
  const actuallySave = async () => {
    setLoading(true);
    setError('');

    const subnetMaskToCidr = (mask) => {
      const parts = (mask || '').split('.').map(n => parseInt(n, 10));
      if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) return null;
      const bin = parts.map(p => p.toString(2).padStart(8, '0')).join('');
      if (!/^1*0*$/.test(bin)) return null; // must be contiguous ones
      return bin.indexOf('0') === -1 ? 32 : bin.indexOf('0');
    };

    // Enforce: only one interface can be DHCP at a time
    const dhcpCount = (lanInterfaces || []).reduce((count, lan) => {
      const type = (lan?.ipv4Type || 'Static').toUpperCase();
      return count + (type === 'DHCP' ? 1 : 0);
    }, 0);

    if (dhcpCount > 1) {
      setLoading(false);
      window.alert('Only one interface can be set to DHCP at a time. Please change the others back to Static and try again.');
      return;
    }

    // Validate all fields
    let valid = true;
    const ipErrs = new Array(lanInterfaces.length).fill('');
    const subnetErrs = new Array(lanInterfaces.length).fill('');
    const gatewayErrs = new Array(lanInterfaces.length).fill('');
    const dnsErrs = ['', ''];
    let arpErr = '';
    const candidatePriorities = new Map();
    const baselineMap = new Map((originalLanSnapshot || []).map(item => [item.key, item]));

    lanInterfaces.forEach((lan, idx) => {
      const type = (lan.ipv4Type || 'Static').toUpperCase();

      // For DHCP, skip IPv4-related validation and candidate IP selection
      if (type === 'DHCP') {
        ipErrs[idx] = '';
        subnetErrs[idx] = '';
        gatewayErrs[idx] = '';
        return;
      }

      if (!isValidIPv4(lan.ipAddress)) {
        ipErrs[idx] = 'Please enter a valid IP address.';
        valid = false;
      } else {
        ipErrs[idx] = '';
      }
      if (!isValidSubnetMask(lan.subnetMask)) {
        subnetErrs[idx] = 'Please enter a valid subnet mask.';
        valid = false;
      } else {
        subnetErrs[idx] = '';
      }
      if (!isValidIPv4(lan.defaultGateway)) {
        gatewayErrs[idx] = 'Please enter a valid gateway address.';
        valid = false;
      } else {
        gatewayErrs[idx] = '';
      }

      const key = (lan.interface || lan.name || `index-${idx}`).toString();
      const baseline = baselineMap.get(key);
      const candidateIp = (lan.ipAddress || '').trim();
      const previousIp = (baseline?.ipAddress || '').trim();
      const ifaceName = (lan.interface || '').toLowerCase();
      const displayName = (lan.name || '').toLowerCase();
      const isPrimaryIface = ifaceName === 'eth0' || displayName === 'lan 1';

      const addCandidate = (ip, priority) => {
        if (!ip) return;
        const value = ip.trim();
        if (!value) return;
        const existing = candidatePriorities.get(value);
        if (existing === undefined || priority < existing) {
          candidatePriorities.set(value, priority);
        }
      };

      if (candidateIp && previousIp && candidateIp !== previousIp) {
        addCandidate(candidateIp, isPrimaryIface ? 0 : 1);
        addCandidate(previousIp, isPrimaryIface ? 2 : 3);
      } else if (candidateIp) {
        addCandidate(candidateIp, isPrimaryIface ? 0 : 5);
      }
    });

    if (dnsServers[0] && !isValidIPv4(dnsServers[0])) {
      dnsErrs[0] = 'Please enter a valid IP address.';
      valid = false;
    }
    if (dnsServers[1] && !isValidIPv4(dnsServers[1])) {
      dnsErrs[1] = 'Please enter a valid IP address.';
      valid = false;
    }
    if (!isValidArpMode(arpMode)) {
      arpErr = 'Please select a valid ARP mode.';
      valid = false;
    }
    setIpErrors(ipErrs);
    setSubnetErrors(subnetErrs);
    setGatewayErrors(gatewayErrs);
    setDnsErrors(dnsErrs);
    setArpError(arpErr);

    const currentHost = window.location.hostname;
    if (currentHost) {
      const existing = candidatePriorities.get(currentHost);
      candidatePriorities.set(currentHost, existing === undefined ? 10 : Math.min(existing, 10));
    }

    const pendingList = Array.from(candidatePriorities.entries())
      .sort((a, b) => a[1] - b[1])
      .map(([ip]) => ip);
    setPendingIps(pendingList);

    if (!valid) {
      setLoading(false);
      return;
    }

    try {
      const lanArray = lanInterfaces.map(lan => ({
        name: lan.interface,
        ipv4Type: lan.ipv4Type || 'Static',
        ipAddress: lan.ipAddress,
        subnetMask: lan.subnetMask,
        defaultGateway: lan.defaultGateway,
        ipv6Address: lan.ipv6Address,
        ipv6Prefix: lan.ipv6Prefix,
      }));
      const dnsArray = [
        { preferredDns: dnsServers[0] },
        { standbyDns: dnsServers[1] }
      ];
      const arpArray = [
        { defaultArpMode: arpMode }
      ];
      const payload = {
        vlanEnabled,
        vlan: vlanEnabled ? vlanForm : undefined,
        interfaces: vlanEnabled ? [] : lanArray,
        dnsServers: dnsArray,
        arpMode: arpArray
      };
      console.log(payload);

      const response = await saveNetworkSettings(payload);
      
      if (response.response) {
        // If VLAN is enabled, configure VLAN interface using Linux CLI
        try {
          if (vlanEnabled) {
            const vlanId = String(vlanForm.vlan1Id || '').trim();
            const vlanIp = String(vlanForm.vlan1Ip || '').trim();
            const vlanMask = String(vlanForm.vlan1Mask || '').trim();
            const vlanGw = String(vlanForm.vlan1Gw || '').trim();
            const cidr = subnetMaskToCidr(vlanMask);
            // Parent interface: user confirmed eth0
            const parentIface = 'eth0';
            if (vlanId && vlanIp && cidr !== null) {
              const iface = `${parentIface}.${vlanId}`;
              const yaml = `network:\n  version: 2\n  renderer: networkd\n  ethernets:\n    ${parentIface}:\n      dhcp4: no\n  vlans:\n    ${iface}:\n      id: ${vlanId}\n      link: ${parentIface}\n      addresses: [${vlanIp}/${cidr}]${vlanGw ? `\n      routes:\n        - to: 0.0.0.0/0\n          via: ${vlanGw}` : ''}\n`;
              const interfacesCfg = `auto ${iface}\niface ${iface} inet static\n  address ${vlanIp}\n  netmask ${vlanMask}\n  vlan-raw-device ${parentIface}${vlanGw ? `\n  gateway ${vlanGw}` : ''}\n`;
              // Systemd boot persistence (most reliable across distros)
              // IMPORTANT:
              // - set PATH explicitly so systemd environment can find ip/ifconfig/modprobe on boot
              // - escape '$' later so it is not expanded during printf > file
              const bootScript = `#!/bin/sh\nPATH=/sbin:/bin:/usr/sbin:/usr/bin\nmodprobe 8021q 2>/dev/null || true\nparent=${parentIface}\nid=${vlanId}\niface=${parentIface}.${vlanId}\nip=${vlanIp}\ncidr=${cidr}\ngw=${vlanGw || ''}\n# Recreate idempotently\nip link set dev \"$parent\" up 2>/dev/null || ifconfig \"$parent\" up || true\nip link del dev \"$iface\" 2>/dev/null || vconfig rem \"$iface\" 2>/dev/null || true\nip link add link \"$parent\" name \"$iface\" type vlan id \"$id\" 2>/dev/null || vconfig add \"$parent\" \"$id\"\nip addr flush dev \"$iface\" 2>/dev/null || true\nip addr add \"$ip/$cidr\" dev \"$iface\" 2>/dev/null || ifconfig \"$iface\" \"$ip\" netmask ${vlanMask} up\nip link set dev \"$iface\" up 2>/dev/null || ifconfig \"$iface\" up 2>/dev/null || true\n[ -n \"$gw\" ] && (ip route add default via \"$gw\" dev \"$iface\" metric 200 2>/dev/null || true)\nexit 0\n`;
              // Escape $ and " so shell printf doesn't expand variables while writing the file
              const bootScriptEscaped = bootScript.replace(/\$/g, '\\$').replace(/"/g, '\\"');
              const unitFile = `[Unit]\nDescription=Apply VLAN at boot\nAfter=network-online.target\nWants=network-online.target\n\n[Service]\nType=oneshot\nExecStart=/usr/local/bin/apply-vlan.sh\nRemainAfterExit=yes\n\n[Install] \nWantedBy=multi-user.target\n`;
              const cmd = [
                `modprobe 8021q 2>/dev/null || true`,
                // Write netplan persistence (do not apply now to avoid tearing down runtime VLAN)
                `if command -v netplan >/dev/null 2>&1; then printf '%s' "${yaml.replace(/"/g, '\\"')}" > /etc/netplan/99-vlan.yaml && sync || true; fi`,
                // Fallback to /etc/network/interfaces (+sync to ensure vlan.cfg is flushed)
                `if [ -f /etc/network/interfaces ] && ! command -v netplan >/dev/null 2>&1; then mkdir -p /etc/network/interfaces.d 2>/dev/null || true; printf '%s' "${interfacesCfg.replace(/"/g, '\\"')}" > /etc/network/interfaces.d/vlan.cfg 2>/dev/null && sync || { printf '%s' "${interfacesCfg.replace(/"/g, '\\"')}" >> /etc/network/interfaces && sync || true; }; fi`,
                // Systemd persistence fallback: write boot script and unit (+sync so they survive reboot)
                `mkdir -p /usr/local/bin 2>/dev/null || true && printf '%s' "${bootScriptEscaped}" > /usr/local/bin/apply-vlan.sh && chmod +x /usr/local/bin/apply-vlan.sh && sync || true`,
                `printf '%s' "${unitFile.replace(/"/g, '\\"')}" > /etc/systemd/system/apply-vlan.service && systemctl daemon-reload && systemctl enable apply-vlan.service 2>/dev/null && sync || true`,
                // Execute boot script once now to ensure VLAN is present immediately
                `/usr/local/bin/apply-vlan.sh 2>/dev/null || true`,
                // Bring up immediately (runtime)
                `ip link set dev ${parentIface} up 2>/dev/null || ifconfig ${parentIface} up || true`,
                `ip link del dev ${iface} 2>/dev/null || vconfig rem ${iface} 2>/dev/null || true`,
                `ip link add link ${parentIface} name ${iface} type vlan id ${vlanId} 2>/dev/null || vconfig add ${parentIface} ${vlanId}`,
                `ip addr flush dev ${iface} 2>/dev/null || true`,
                `ip addr add ${vlanIp}/${cidr} dev ${iface} 2>/dev/null || ifconfig ${iface} ${vlanIp} netmask ${vlanMask} up`,
                `ip link set dev ${iface} up 2>/dev/null || ifconfig ${iface} up || true`,
                // Add VLAN gateway as a HIGHER metric route so management path stays intact
                vlanGw ? `ip route add default via ${vlanGw} dev ${iface} metric 200 2>/dev/null || true` : 'true',
                // Final verification
                `ip -o link show ${iface} 2>/dev/null | grep -q '${iface}' && echo "VLAN_CREATED ${iface} ${vlanIp}/${cidr}" || echo "VLAN_CREATE_FAILED ${iface}"`
              ].join(' && ');
              const vlanRes = await postLinuxCmd({ cmd });
              const out = String(vlanRes?.responseData || '').trim();
              if (!/VLAN_CREATED/.test(out)) {
                window.alert(`VLAN create command did not confirm success. Output: \n${out || '(no output)'}`);
              }
            }
          } else {
            // VLAN disabled: remove any ${parentIface}.* VLAN interfaces and persistent configs
            const parentIface = 'eth0';
            const removeCmd = [
              // Runtime removal of VLAN links
              `for i in $(ip -o link | awk -F\": \" '/^\\\d+: ${parentIface}\\\.[0-9]+/ {print $2}'); do ip link set dev \"$i\" down 2>/dev/null || ifconfig \"$i\" down 2>/dev/null || true; ip link del \"$i\" 2>/dev/null || vconfig rem \"$i\" 2>/dev/null || true; done`,
              // Remove default routes via VLANs with high metrics (safety)
              `ip route | awk '/${parentIface}\\.[0-9]+/ && /default/ {print $0}' | while read line; do set -- $line; ip route del default via $3 dev $5 2>/dev/null || true; done`,
              // Remove netplan vlan file if present
              `[ -f /etc/netplan/99-vlan.yaml ] && rm -f /etc/netplan/99-vlan.yaml && (command -v netplan >/dev/null 2>&1 && netplan apply || true) || true`,
              // Remove interfaces.d config and clean legacy interfaces file
              `[ -d /etc/network/interfaces.d ] && rm -f /etc/network/interfaces.d/vlan.cfg || true`,
              `sed -i '/^auto ${parentIface}\\.[0-9]\+$/,/^$/d' /etc/network/interfaces 2>/dev/null || true`,
              // Remove systemd boot persistence
              `systemctl disable --now apply-vlan.service 2>/dev/null || true`,
              `rm -f /etc/systemd/system/apply-vlan.service /usr/local/bin/apply-vlan.sh 2>/dev/null || true`,
              `systemctl daemon-reload 2>/dev/null || true`
            ].join(' && ');
            await postLinuxCmd({ cmd: removeCmd });
          }
        } catch (_) {}

        setHasChanges(false);
        setLoading(false);
        await triggerNetworkRestart(pendingList);
        return;
      } else {
        throw new Error(response.message || 'Save operation failed');
      }
    } catch (error) {
      console.error('Network save error:', error);
      
      let errorMessage = 'Failed to save network settings.';
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = 'Save operation timed out. Please check your connection and try again.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid network configuration. Please check your settings and try again.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error during save. Please try again later or contact support.';
      } else if (error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
        errorMessage = 'Network connection failed during save. Please check your connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      window.alert(errorMessage);
      setError(errorMessage);
    } finally {
      if (!networkRestarting) {
        setLoading(false);
      }
    }
  };

  // Use native browser confirm dialog
  const handleSave = async (e) => {
    e.preventDefault();
    if (hasChanges) {
      const confirmed = window.confirm("Are you sure you want to save changes?");
      if (!confirmed) {
        return; // User cancelled, do nothing
      }
      await actuallySave(); // Proceed with save and redirect
      return;
    }
    // If no changes, do nothing or show a message
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-200px)] flex flex-col items-center box-border" style={{backgroundColor: "#dde0e4"}}>
      {/* Message Display */}
      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError('')}
          sx={{
            position: 'fixed', 
            top: 20, 
            right: 20, 
            zIndex: 9999,
            minWidth: 300,
            boxShadow: 3
          }}
        >
          {error}
        </Alert>
      )}


      <div className="w-full max-w-6xl mx-auto">
        {/* Blue header bar */}
        <div className="rounded-t-lg h-8 flex items-center justify-center font-semibold text-[18px] text-[#444] shadow-sm mt-0"
          style={{background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)', boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)'}}>
          Network Settings
        </div>
        {/* Main content container */}
        <div className="w-full border-2 border-gray-400 border-t-0 shadow-sm flex flex-col" style={{backgroundColor: "#dde0e4"}}>
          {loading ? (
            <div className="flex items-center justify-center min-h-[500px] bg-white">
              <div className="text-center">
                <CircularProgress size={40} sx={{ color: '#0e8fd6' }} />
                <div className="mt-3 text-gray-600">Loading network settings...</div>
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col overflow-hidden">
            <div className="p-4">
              <form onSubmit={handleSave} className="space-y-4">
                {/* Dynamically render LAN sections */}
                {!vlanEnabled && lanInterfaces.map((lan, idx) => (
                  <div key={lan.name || idx} className="space-y-2">
                    <h3 className="text-[12px] text-gray-600 font-medium mb-2" style={{ paddingLeft: '20px' }}>
                      {lan.name || `LAN ${idx + 1}`}
                    </h3>
                    
                    {/* IPV4 Network Type */}
                    <div className="flex items-center justify-center" style={{ minHeight: 32 }}>
                      <div className="flex items-center" style={{width: '560px'}}>
                        <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:220, marginRight:60}}>
                          IPV4 Network Type (M):
                        </label>
                        <div style={{width: 320}}>
                          <Select
                            value={lan.ipv4Type || 'Static'}
                            onChange={e => handleLanChange(idx, 'ipv4Type', e.target.value)}
                            size="small"
                            variant="outlined"
                            fullWidth
                            sx={select32Sx}
                          >
                            <MenuItem value="Static">Static</MenuItem>
                            <MenuItem value="DHCP">DHCP</MenuItem>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {(lan.ipv4Type || 'Static') === 'Static' && (
                      <>
                        {/* IP Address */}
                        <div className="flex items-center justify-center" style={{ minHeight: 32 }}>
                          <div className="flex items-center" style={{width: '560px'}}>
                            <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:220, marginRight:60}}>
                              IP Address (I):
                            </label>
                            <div style={{width: 320}}>
                              <TextField
                                variant="outlined"
                                size="small"
                                fullWidth
                                value={lan.ipAddress || ''}
                                onChange={e => handleLanChange(idx, 'ipAddress', e.target.value)}
                                sx={inputSx}
                              />
                              {ipErrors[idx] && (
                                <div className="text-red-600 text-sm mt-1">{ipErrors[idx]}</div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Subnet Mask */}
                        <div className="flex items-center justify-center" style={{ minHeight: 32 }}>
                          <div className="flex items-center" style={{width: '560px'}}>
                            <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:220, marginRight:60}}>
                              Subnet Mask (U):
                            </label>
                            <div style={{width: 320}}>
                              <TextField
                                variant="outlined"
                                size="small"
                                fullWidth
                                value={lan.subnetMask || ''}
                                onChange={e => handleLanChange(idx, 'subnetMask', e.target.value)}
                                sx={inputSx}
                              />
                              {subnetErrors[idx] && (
                                <div className="text-red-600 text-sm mt-1">{subnetErrors[idx]}</div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Default Gateway */}
                        <div className="flex items-center justify-center" style={{ minHeight: 32 }}>
                          <div className="flex items-center" style={{width: '560px'}}>
                            <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:220, marginRight:60}}>
                              Default Gateway (D):
                            </label>
                            <div style={{width: 320}}>
                              <TextField
                                variant="outlined"
                                size="small"
                                fullWidth
                                value={lan.defaultGateway || ''}
                                onChange={e => handleLanChange(idx, 'defaultGateway', e.target.value)}
                                sx={inputSx}
                              />
                              {gatewayErrors[idx] && (
                                <div className="text-red-600 text-sm mt-1">{gatewayErrors[idx]}</div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* IPV6 Address */}
                        <div className="flex items-center justify-center" style={{ minHeight: 32 }}>
                          <div className="flex items-center" style={{width: '560px'}}>
                            <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:220, marginRight:60}}>
                              IPV6 Address (I):
                            </label>
                            <div style={{width: 320}}>
                              <TextField
                                variant="outlined"
                                size="small"
                                fullWidth
                                value={lan.ipv6Address || ''}
                                onChange={e => handleLanChange(idx, 'ipv6Address', e.target.value)}
                                sx={inputSx}
                              />
                            </div>
                          </div>
                        </div>

                        {/* IPV6 Address Prefix */}
                        <div className="flex items-center justify-center" style={{ minHeight: 32 }}>
                          <div className="flex items-center" style={{width: '560px'}}>
                            <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:220, marginRight:60}}>
                              IPV6 Address Prefix (U):
                            </label>
                            <div style={{width: 320}}>
                              <TextField
                                variant="outlined"
                                size="small"
                                fullWidth
                                value={lan.ipv6Prefix || ''}
                                onChange={e => handleLanChange(idx, 'ipv6Prefix', e.target.value)}
                                sx={inputSx}
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {/* VLAN Enable toggle (between LAN and DNS) */}
                <div className="space-y-2">
                  <h3 className="text-[12px] text-gray-600 font-medium mb-2" style={{ paddingLeft: '20px' }}>
                    VLAN Enable:
                  </h3>
                  <div className="flex items-center justify-center" style={{ minHeight: 32 }}>
                    <div className="flex items-center gap-6" style={{width: '460px'}}>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="vlanEnable" checked={vlanEnabled} onChange={()=>{ 
                          // Prefill VLAN base with current LAN 1 values from fetched network settings
                          try {
                            const lan1 = (lanInterfaces || []).find(l => (l.name === 'LAN 1') || (l.interface === 'eth0')) || {};
                            setVlanForm(prev => ({
                              ...prev,
                              lan1Ip: lan1.ipAddress || prev.lan1Ip || '',
                              lan1Mask: lan1.subnetMask || prev.lan1Mask || '',
                              lan1Gw: lan1.defaultGateway || prev.lan1Gw || '',
                            }));
                          } catch (_) {}
                          setVlanEnabled(true); 
                          setHasChanges(true); 
                        }} />
                        <span className="text-[14px] text-gray-700">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="vlanEnable" checked={!vlanEnabled} onChange={()=>{ setVlanEnabled(false); setHasChanges(true); }} />
                        <span className="text-[14px] text-gray-700">No</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* VLAN fields when enabled (hide LAN1/LAN2) */}
                {vlanEnabled && (
                  <div className="space-y-2">
                    <h3 className="text-[12px] text-gray-600 font-medium mb-2" style={{ paddingLeft: '20px' }}>
                      VLAN Configuration
                    </h3>
                    {/* LAN 1 base */}
                    {[{ label: 'LAN 1 IP Address (I):', key: 'lan1Ip' },
                      { label: 'LAN 1 Subnet Mask (U):', key: 'lan1Mask' },
                      { label: 'LAN 1 Default Gateway (D):', key: 'lan1Gw' }].map((f) => (
                      <div key={f.key} className="flex items-center justify-center" style={{ minHeight: 32 }}>
                        <div className="flex items-center" style={{width: '520px'}}>
                          <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:220, marginRight:60}}>
                            {f.label}
                          </label>
                          <div style={{width: 320}}>
                            <TextField
                              variant="outlined"
                              size="small"
                              fullWidth
                              value={vlanForm[f.key] || ''}
                              onChange={e => handleVlanChange(f.key, e.target.value)}
                              sx={inputSx}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* VLAN 1 */}
                    {[{ l:'Vlan 1 Vlan ID (D):', k:'vlan1Id' }, { l:'Vlan 1 IP Address (I):', k:'vlan1Ip' }, { l:'Vlan 1 Subnet Mask (U):', k:'vlan1Mask' }, { l:'Vlan 1 Default Gateway (D):', k:'vlan1Gw' }].map((f)=> (
                      <div key={f.k} className="flex items-center justify-center" style={{ minHeight: 32 }}>
                        <div className="flex items-center" style={{width: '520px'}}>
                          <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:220, marginRight:60}}>{f.l}</label>
                          <div style={{width: 320}}>
                            <TextField variant="outlined" size="small" fullWidth value={vlanForm[f.k] || ''} onChange={e=>handleVlanChange(f.k, e.target.value)} sx={inputSx} />
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* VLAN 2 */}
                    {[{ l:'Vlan 2 Vlan ID (D):', k:'vlan2Id' }, { l:'Vlan 2 IP Address (I):', k:'vlan2Ip' }, { l:'Vlan 2 Subnet Mask (U):', k:'vlan2Mask' }, { l:'Vlan 2 Default Gateway (D):', k:'vlan2Gw' }].map((f)=> (
                      <div key={f.k} className="flex items-center justify-center" style={{ minHeight: 32 }}>
                        <div className="flex items-center" style={{width: '520px'}}>
                          <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:220, marginRight:60}}>{f.l}</label>
                          <div style={{width: 320}}>
                            <TextField variant="outlined" size="small" fullWidth value={vlanForm[f.k] || ''} onChange={e=>handleVlanChange(f.k, e.target.value)} sx={inputSx} />
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* VLAN 3 */}
                    {[{ l:'Vlan 3 Vlan ID (D):', k:'vlan3Id' }, { l:'Vlan 3 IP Address (I):', k:'vlan3Ip' }, { l:'Vlan 3 Subnet Mask (U):', k:'vlan3Mask' }, { l:'Vlan 3 Default Gateway (D):', k:'vlan3Gw' }].map((f)=> (
                      <div key={f.k} className="flex items-center justify-center" style={{ minHeight: 32 }}>
                        <div className="flex items-center" style={{width: '520px'}}>
                          <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:220, marginRight:60}}>{f.l}</label>
                          <div style={{width: 320}}>
                            <TextField variant="outlined" size="small" fullWidth value={vlanForm[f.k] || ''} onChange={e=>handleVlanChange(f.k, e.target.value)} sx={inputSx} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* DNS Server Set */}
                <div className="space-y-2">
                  <h3 className="text-[12px] text-gray-600 font-medium mb-2" style={{ paddingLeft: '20px' }}>
                    DNS Server Set
                  </h3>
                  
                  {/* Preferred DNS Server */}
                  <div className="flex items-center justify-center" style={{ minHeight: 32 }}>
                    <div className="flex items-center" style={{width: '460px'}}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:160, marginRight:40}}>
                        Preferred DNS Server (P):
                      </label>
                      <div style={{width: 300}}>
                        <TextField
                          variant="outlined"
                          size="small"
                          fullWidth
                          value={dnsServers[0] || ''}
                          onChange={e => handleDnsChange(0, e.target.value)}
                          sx={inputSx}
                        />
                        {dnsErrors[0] && (
                          <div className="text-red-600 text-sm mt-1">{dnsErrors[0]}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Standby DNS Server */}
                  <div className="flex items-center justify-center" style={{ minHeight: 32 }}>
                    <div className="flex items-center" style={{width: '460px'}}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:160, marginRight:40}}>
                        Standby DNS Server (P):
                      </label>
                      <div style={{width: 300}}>
                        <TextField
                          variant="outlined"
                          size="small"
                          fullWidth
                          value={dnsServers[1] || ''}
                          onChange={e => handleDnsChange(1, e.target.value)}
                          sx={inputSx}
                        />
                        {dnsErrors[1] && (
                          <div className="text-red-600 text-sm mt-1">{dnsErrors[1]}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ARP Mode */}
                <div className="space-y-2">
                  <h3 className="text-[12px] text-gray-600 font-medium mb-2" style={{ paddingLeft: '20px' }}>
                    ARP Mode
                  </h3>
                  
                  {/* Default Mode */}
                  <div className="flex items-center justify-center" style={{ minHeight: 32 }}>
                    <div className="flex items-center" style={{width: '560px'}}>
                      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:220, marginRight:60}}>
                        Default Mode:
                      </label>
                      <div style={{width: 320}}>
                        <Select
                          value={arpMode}
                          onChange={handleArpChange}
                          size="small"
                          variant="outlined"
                          fullWidth
                          sx={select32Sx}
                        >
                          <MenuItem value="1">1</MenuItem>
                          <MenuItem value="2">2</MenuItem>
                        </Select>
                        {arpError && (
                          <div className="text-red-600 text-sm mt-1">{arpError}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8 w-full">
          <Button
            type="submit"
            variant="contained"
            sx={blueButtonSx}
            onClick={handleSave}
            className="sm:w-auto"
            disabled={loading || resetting || networkRestarting}
          >
            {loading && !resetting ? "Saving..." : "Save"}
          </Button>
          <Button
            type="button"
            variant="contained"
            onClick={handleReset}
            sx={grayButtonSx}
            className="sm:w-auto"
            disabled={resetting || networkRestarting}
          >
            {resetting ? "Resetting..." : "Reset"}
          </Button>
        </div>
      </div>
      {networkRestarting && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-md shadow-xl px-10 py-6 flex flex-col items-center gap-4 max-w-sm text-center">
            <CircularProgress />
            <div className="text-gray-700 text-sm whitespace-pre-line">
              {progressMessage || 'Restarting network service...'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Network; 
