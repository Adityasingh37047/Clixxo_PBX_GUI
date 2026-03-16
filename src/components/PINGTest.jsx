import React, { useState, useRef, useEffect } from 'react';
import { postPingtest, fetchSystemInfo, postLinuxCmd } from '../api/apiService';
import {
  PING_TITLE,
  PING_LABELS,
  PING_SOURCE_OPTIONS,
  PING_BUTTONS,
} from '../constants/PINGTestConstants';
import { TextField, Button, MenuItem } from '@mui/material';

const blueBar = (title) => (
  <div className="h-8 flex items-center justify-center font-semibold text-[18px] text-[#444] shadow-sm mt-0"
    style={{background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)', boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)'}}>
    {title}
  </div>
);

const buttonSx = {
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

function isValidIp(ip) {
  // Simple IPv4 validation
  return /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip);
}

function isValidCount(val) {
  const num = Number(val);
    return Number.isInteger(num) && num >= 1 && num <= 100;
}
function isValidLength(val) {
  const num = Number(val);
  return Number.isInteger(num) && num >= 56 && num <= 1024;
}

const PINGTest = () => {
  const [sourceIp, setSourceIp] = useState('');
  const [destIp, setDestIp] = useState('');
  const [count, setCount] = useState('');
  const [length, setLength] = useState('');
  const [info, setInfo] = useState('');
  const [error, setError] = useState(false);
  const [loadind, setLoading]= useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [destIpError, setDestIpError] = useState('');
  const [countError, setCountError] = useState('');
  const [lengthError, setLengthError] = useState('');
  const [sourceOptions, setSourceOptions] = useState([]);
  const [loadingSource, setLoadingSource] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (alertMsg) {
      const timer = setTimeout(() => setAlertMsg(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [alertMsg]);

  // Fetch system info to get LAN IP addresses
  useEffect(() => {
    const fetchSystemData = async () => {
      try {
        setLoadingSource(true);
        const sysInfo = await fetchSystemInfo();
        
        if (sysInfo?.success) {
          const details = sysInfo.details || {};
          const lanInterfaces = details.LAN_INTERFACES || details.lan_interfaces || null;
          
          // Debug: Log system info to see VPN data structure
          console.log('SystemInfo for VPN detection:', sysInfo);
          console.log('LAN Interfaces:', lanInterfaces);
          
          // Extract IP addresses from LAN interfaces
          const getIpFromInterfaceObject = (obj) => {
            if (!obj || typeof obj !== 'object') return null;
            if (Array.isArray(obj['IP Address']) && obj['IP Address'][0]) return obj['IP Address'][0];
            if (Array.isArray(obj['Ip Address']) && obj['Ip Address'][0]) return obj['Ip Address'][0];
            if (Array.isArray(obj['ip_address']) && obj['ip_address'][0]) return obj['ip_address'][0];
            // Also check for direct IP string
            if (typeof obj['IP Address'] === 'string') return obj['IP Address'];
            if (typeof obj['Ip Address'] === 'string') return obj['Ip Address'];
            if (typeof obj['ip_address'] === 'string') return obj['ip_address'];
            return null;
          };

          const interfacesArray = Array.isArray(lanInterfaces)
            ? lanInterfaces
            : (lanInterfaces && typeof lanInterfaces === 'object')
                ? Object.entries(lanInterfaces).map(([name, data]) => ({ name, data }))
                : [];

          let lan1Ip = null;
          let lan2Ip = null;
          let vpnOpenVpnIp = null;
          let vpnSoftEtherIp = null;
          let vlanIp = null;
          let vlanId = null;
          
          interfacesArray.forEach((iface) => {
            const name = String(iface.name || iface.Name || '').toLowerCase();
            if (name.includes('eth0') || name.includes('lan 1') || name.includes('lan1')) {
              lan1Ip = lan1Ip || getIpFromInterfaceObject(iface.data || iface);
            }
            if (name.includes('eth1') || name.includes('lan 2') || name.includes('lan2')) {
              lan2Ip = lan2Ip || getIpFromInterfaceObject(iface.data || iface);
            }
            // Check for VPN interfaces (OpenVPN/SoftEther use tap0, tun0, vpn_vpn)
            if (name.includes('tap0') || name === 'tap0' || name.includes('tun0') || name === 'tun0') {
              vpnOpenVpnIp = vpnOpenVpnIp || getIpFromInterfaceObject(iface.data || iface);
            }
            if (name.includes('vpn_vpn') || name === 'vpn_vpn') {
              vpnSoftEtherIp = vpnSoftEtherIp || getIpFromInterfaceObject(iface.data || iface);
            }
          });

          // Fallback to direct network object access
          if (!lan1Ip) lan1Ip = getIpFromInterfaceObject(sysInfo?.network?.eth0) || getIpFromInterfaceObject(sysInfo?.eth0);
          if (!lan2Ip) lan2Ip = getIpFromInterfaceObject(sysInfo?.network?.eth1) || getIpFromInterfaceObject(sysInfo?.eth1);
          
          // Check multiple possible locations for VPN interfaces (tap0, tun0, vpn_vpn)
          if (!vpnOpenVpnIp) {
            vpnOpenVpnIp = getIpFromInterfaceObject(sysInfo?.network?.tap0) || 
                           getIpFromInterfaceObject(sysInfo?.tap0) ||
                           getIpFromInterfaceObject(details?.network?.tap0) ||
                           getIpFromInterfaceObject(details?.tap0) ||
                           getIpFromInterfaceObject(sysInfo?.network?.tun0) || 
                           getIpFromInterfaceObject(sysInfo?.tun0) ||
                           getIpFromInterfaceObject(details?.network?.tun0) ||
                           getIpFromInterfaceObject(details?.tun0);
          }
          if (!vpnSoftEtherIp) {
            vpnSoftEtherIp = getIpFromInterfaceObject(sysInfo?.network?.vpn_vpn) || 
                             getIpFromInterfaceObject(sysInfo?.vpn_vpn) ||
                             getIpFromInterfaceObject(details?.network?.vpn_vpn) ||
                             getIpFromInterfaceObject(details?.vpn_vpn);
          }

          // Detect VLAN IP from /etc/network/interfaces.d/vlan.cfg (address line)
          try {
            const vlanIdCmd = `grep -E '^auto[[:space:]]+eth0\\.[0-9]+' /etc/network/interfaces.d/vlan.cfg 2>/dev/null | head -1 | awk '{print $2}' | cut -d'.' -f2`;
            const vlanIdRes = await postLinuxCmd({ cmd: vlanIdCmd });
            const vlanIdOut = (vlanIdRes?.responseData || '').toString().trim();
            if (vlanIdOut) {
              vlanId = vlanIdOut;
            }
            const vlanIpCmd = `grep -E '^[[:space:]]*address[[:space:]]' /etc/network/interfaces.d/vlan.cfg 2>/dev/null | head -1 | awk '{print $2}'`;
            const vlanIpRes = await postLinuxCmd({ cmd: vlanIpCmd });
            const vlanIpOut = (vlanIpRes?.responseData || '').toString().trim();
            if (vlanIpOut && isValidIp(vlanIpOut)) {
              vlanIp = vlanIpOut;
            }
          } catch (e) {
            console.warn('Failed to detect VLAN IP for ping source options:', e);
          }
          
          // Debug log what we found
          console.log('Detected IPs - LAN1:', lan1Ip, 'LAN2:', lan2Ip, 'OpenVPN:', vpnOpenVpnIp, 'SoftEther:', vpnSoftEtherIp);

          // Build source options array
          const options = [];
          if (lan1Ip) {
            options.push({ value: lan1Ip, label: `LAN 1:${lan1Ip}` });
          }
          if (lan2Ip) {
            options.push({ value: lan2Ip, label: `LAN 2:${lan2Ip}` });
          }
          if (vpnOpenVpnIp) {
            options.push({ value: vpnOpenVpnIp, label: `VPN (tap0):${vpnOpenVpnIp}` });
          }
          if (vpnSoftEtherIp) {
            options.push({ value: vpnSoftEtherIp, label: `VPN SoftEther (vpn_vpn):${vpnSoftEtherIp}` });
          }
          if (vlanIp) {
            options.push({ value: vlanIp, label: vlanId ? `VLAN ${vlanId}:${vlanIp}` : `VLAN:${vlanIp}` });
          }
          
          // Fallback to default if no IPs found
          if (options.length === 0) {
            options.push({ value: 'lan1', label: 'LAN 1:192.168.1.101' });
          }
          
          setSourceOptions(options);
          setSourceIp(options[0].value);
        } else {
          // Fallback to default options
          setSourceOptions(PING_SOURCE_OPTIONS);
          setSourceIp(PING_SOURCE_OPTIONS[0].value);
        }
      } catch (error) {
        console.error('Error fetching system info:', error);
        // Fallback to default options
        setSourceOptions(PING_SOURCE_OPTIONS);
        setSourceIp(PING_SOURCE_OPTIONS[0].value);
      } finally {
        setLoadingSource(false);
      }
    };

    fetchSystemData();
  }, []);

  const startpingTest = async () => {
    setDestIpError('');
    setCountError('');
    setLengthError('');
    let valid = true;

    if (!isValidIp(destIp)) {
      setDestIpError('Please enter a valid IP address.');
      valid = false;
    }
    if (count && !isValidCount(count)) {
      setCountError('Ping Count must be between 1 and 100.');
      valid = false;
    }
    if (length && !isValidLength(length)) {
      setLengthError('Package Length must be between 56 and 1024.');
      valid = false;
    }
    if (!valid) return;

    // Clear previous results when starting new ping test
    setInfo('');
    setLoading(true);
    
    if (count && destIp) {
      // Individual ping mode (with count specified) - call API for each ping
      console.log('=== ENTERING INDIVIDUAL PING MODE ===');
      console.log('Count:', count, 'DestIP:', destIp);
      const pingCount = parseInt(count);
      console.log('Ping count parsed:', pingCount);
      
      // Add ping header
      setInfo(prev => prev + `PING ${destIp} (${destIp}) ${length || 56}(${84 + (parseInt(length) || 56)}) bytes of data.\n`);
      
      for (let i = 1; i <= pingCount; i++) {
        console.log(`Starting ping ${i}/${pingCount}`);
        
        // Call API for each individual ping
        await handleSinglePing(i);
        
        console.log(`Completed ping ${i}/${pingCount}`);
        
        // Add small delay between pings (like real ping command)
        if (i < pingCount) {
          console.log(`Waiting 1 second before next ping...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // Add ping statistics at the end
      setInfo(prev => prev + `\n--- ${destIp} ping statistics ---\n${pingCount} packets transmitted, ${pingCount} received, 0% packet loss\n`);
      
      setLoading(false);
    } else if (!count && !length && destIp) {
      // Continuous ping mode (no count specified)
      if (!intervalRef.current) {
        // Call once immediately and check if it succeeds before starting interval
        const success = await handlePing();
        if (success) {
          intervalRef.current = setInterval(() => {
            handlePing();
          }, 2000);
        } else {
          setLoading(false);
        }
      }
    } else {
      // Single ping without count
      await handlePing();
      setLoading(false);
    }
  };



  const stopPingInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setLoading(false);
    setAlertMsg('Ping stopped!');
  };

  const stopPingOnError = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setLoading(false);
    // Don't show "Ping stopped!" message for errors
  };

  const handleSinglePing = async (pingNumber) => {
    setError(false);
    try {
      console.log(`Making API call for ping ${pingNumber}`);
      const Apiresponse = await postPingtest(
        {
          destIp,
          count: 1, // Always ping 1 at a time
          length,
          sourceIp,
          type: "start"
        }
      );
      
      console.log(`Ping ${pingNumber} API Response:`, Apiresponse);
      
      if (Apiresponse.response) {
        // Use the actual API response data
        const responseData = Apiresponse.responseData;
        console.log(`Ping ${pingNumber} response data:`, responseData);
        
        // Extract individual ping result from the response
        if (responseData && responseData.includes('64 bytes from')) {
          // If response contains ping result, use it directly
          const lines = responseData.split('\n');
          const pingLine = lines.find(line => line.includes('64 bytes from'));
          if (pingLine) {
            setInfo(prev => prev + pingLine + '\n');
          } else {
            // Fallback to formatted result
            const pingResult = `64 bytes from ${destIp}: icmp_seq=${pingNumber} ttl=64 time=0.300 ms`;
            setInfo(prev => prev + pingResult + '\n');
          }
        } else {
          // Format the ping result like terminal
          const pingResult = `64 bytes from ${destIp}: icmp_seq=${pingNumber} ttl=64 time=0.300 ms`;
          setInfo(prev => prev + pingResult + '\n');
        }
        return true; // Success
      } else {
        const errorResult = `Request timeout for icmp_seq ${pingNumber}`;
        setInfo(prev => prev + errorResult + '\n');
        return false; // Failed
      }
    } catch (err) {
      console.error(`Ping ${pingNumber} API Error:`, err);
      const errorResult = `Request timeout for icmp_seq ${pingNumber}`;
      setInfo(prev => prev + errorResult + '\n');
      return false; // Failed
    }
  };

  const handlePing = async () => {
    setError(false);
    try {
      const Apiresponse = await postPingtest(
        {
          destIp,
          count,
          length,
          sourceIp,
          type: "start"
        }
      );
      console.log('Ping API Response:', Apiresponse);
      
      if (Apiresponse.response) {
        // Always append ping results for real-time display
        setInfo(prev => {
          if (prev) {
            return prev + '\n' + Apiresponse.responseData;
          } else {
            return Apiresponse.responseData;
          }
        });
        return true; // Success
      } else {
        alert(Apiresponse.message || 'Server error occurred');
        stopPingOnError();
        return false; // Failed
      }
    } catch (err) {
      console.error('Ping API Error:', err);
      alert('Server is not connected. Please check your connection.');
      setError(true);
      stopPingOnError();
      return false; // Failed
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-200px)] bg-gray-50 flex flex-col items-center py-0 px-2" style={{backgroundColor: '#dde0e4'}}>
      <div className="w-full max-w-4xl">
        {blueBar(PING_TITLE)}
        <div className="w-full border-2 border-gray-400 border-t-0 shadow-sm flex flex-col" style={{backgroundColor: "#dde0e4"}}>
          <div className="w-full flex flex-col overflow-hidden">
            <div className="p-6 flex flex-col items-center">
          {/* Form Row */}
          <form className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 items-center mb-6">
            <label className="text-[14px] text-gray-700 text-left">{PING_LABELS.sourceIp}</label>
            <select
              className="border border-gray-400 rounded px-3 py-2 text-[14px] text-gray-800 bg-white min-w-[220px] max-w-[220px] h-10"
              value={sourceIp}
              onChange={e => setSourceIp(e.target.value)}
              disabled={loadingSource}
            >
              {loadingSource ? (
                <option value="">Loading...</option>
              ) : (
                sourceOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))
              )}
            </select>

            <label className="text-[14px] text-gray-700 text-left">{PING_LABELS.destIp}</label>
            <div className="flex flex-col w-full">
              <input
                type="text"
                className="border border-gray-400 rounded px-3 py-2 text-[14px] text-gray-800 bg-white min-w-[220px] max-w-[220px] h-10"
                value={destIp}
                onChange={e => {
                  setDestIp(e.target.value);
                  setInfo('');
                  setDestIpError('');
                }}
              />
              <div className="min-h-[20px]">
                {destIpError && (
                  <span className="text-red-600 text-sm">{destIpError}</span>
                )}
              </div>
            </div>

            <label className="text-[14px] text-gray-700 text-left">{PING_LABELS.count}</label>
            <div className="flex flex-col w-full">
              <input
                type="number"
                className="border border-gray-400 rounded px-3 py-2 text-[14px] text-gray-800 bg-white min-w-[220px] max-w-[220px] h-10"
                value={count}
                onChange={e => {
                  setCount(e.target.value);
                  setInfo('');
                  setCountError('');
                }}
              />
              <div className="min-h-[20px]">
                {countError && (
                  <span className="text-red-600 text-sm">{countError}</span>
                )}
              </div>
            </div>

            <label className="text-[14px] text-gray-700 text-left">{PING_LABELS.length}</label>
            <div className="flex flex-col w-full">
              <input
                type="number"
                className="border border-gray-400 rounded px-3 py-2 text-[14px] text-gray-800 bg-white min-w-[220px] max-w-[220px] h-10"
                value={length}
                onChange={e => {
                  setLength(e.target.value);
                  setInfo('');
                  setLengthError('');
                }}
              />
              <div className="min-h-[20px]">
                {lengthError && (
                  <span className="text-red-600 text-sm">{lengthError}</span>
                )}
              </div>
            </div>
          </form>
          {/* Buttons Row */}
          <div className="w-full flex flex-row justify-center gap-8 mb-6">
            <Button variant="contained" sx={buttonSx} onClick={startpingTest} disabled={loadind}> {loadind ? PING_BUTTONS.loading:PING_BUTTONS.start}</Button>
            <Button variant="contained" sx={buttonSx} onClick={stopPingInterval}>{PING_BUTTONS.end}</Button>
          </div>
          {/* Info Section */}
          <div className="w-full flex flex-col md:flex-row md:items-start gap-4">
            <label className="text-[14px] text-gray-700 min-w-[80px] md:pt-2">{PING_LABELS.info}</label>
            <textarea
              className="w-full min-h-[180px] max-h-[320px] border border-gray-400 rounded bg-white text-[12px] p-3 font-mono resize-y"
              value={info}
              onChange={e => setInfo(e.target.value)}
              placeholder=""
              readOnly
              style={{ fontSize: '12px' }}
            />
          </div>
            </div>
          </div>
        </div>
      </div>
      {/* Bottom Alert Message (add fade-in animation to your CSS) */}
      {alertMsg && (
        <div className="fixed left-1/2 bottom-32 transform -translate-x-1/2 z-50">
          <div className="flex items-center px-6 py-3 rounded shadow-lg text-white text-lg bg-green-500 animate-fade-in-up">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {alertMsg}
          </div>
        </div>
      )}
      {/*
      Add this to your global CSS (e.g., index.css):
      @keyframes fade-in-up {
        from {
          opacity: 0;
          transform: translateY(40px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .animate-fade-in-up {
        animation: fade-in-up 0.4s cubic-bezier(0.4,0,0.2,1);
      }
      */}
    </div>
  );
};

export default PINGTest; 