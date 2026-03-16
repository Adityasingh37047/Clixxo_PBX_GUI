import React, { useEffect, useState, useRef } from 'react';
import { postTracerttest, fetchSystemInfo, postLinuxCmd } from '../api/apiService';
import {
  TRACERT_TITLE,
  TRACERT_LABELS,
  TRACERT_SOURCE_OPTIONS,
  TRACERT_BUTTONS,
} from '../constants/TRACERTTestConstants';
import Button from '@mui/material/Button';

const blueBar = (title) => (
  <div className=" h-8 flex items-center justify-center font-semibold text-[18px] text-[#444] shadow-sm mt-0"
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
  return /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip);
}
function isValidJumps(val) {
  const num = Number(val);
  return Number.isInteger(num) && num >= 1 && num <= 255;
}

const TRACERTTest = () => {
  const [sourceIp, setSourceIp] = useState('');
  const [destIp, setDestIp] = useState('');
  const [maxJumps, setMaxJumps] = useState('');
  const [info, setInfo] = useState('');
  const [error, setError] = useState(false);
  const [loadind, setLoading]= useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const intervalRef = useRef(null);
  const [sourceIpError, setSourceIpError] = useState('');
  const [destIpError, setDestIpError] = useState('');
  const [jumpsError, setJumpsError] = useState('');
  const [sourceOptions, setSourceOptions] = useState([]);
  const [loadingSource, setLoadingSource] = useState(true);

  useEffect(()=>{
    if (alertMsg){
      const timer = setTimeout(()=>setAlertMsg(''),2000);
      return ()=> clearTimeout(timer);
    }
  },[alertMsg]);

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
            console.warn('Failed to detect VLAN IP for tracert source options:', e);
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
          setSourceOptions(TRACERT_SOURCE_OPTIONS);
          setSourceIp(TRACERT_SOURCE_OPTIONS[0].value);
        }
      } catch (error) {
        console.error('Error fetching system info:', error);
        // Fallback to default options
        setSourceOptions(TRACERT_SOURCE_OPTIONS);
        setSourceIp(TRACERT_SOURCE_OPTIONS[0].value);
      } finally {
        setLoadingSource(false);
      }
    };

    fetchSystemData();
  }, []);

  const startTracert = async () => {
    setSourceIpError('');
    setDestIpError('');
    setJumpsError('');
    let valid = true;
    if (!isValidIp(sourceIp)) {
      setSourceIpError('Please enter a valid IP address.');
      valid = false;
    }
    if (!isValidIp(destIp)) {
      setDestIpError('Please enter a valid IP address.');
      valid = false;
    }
    if (maxJumps && !isValidJumps(maxJumps)) {
      setJumpsError('Maximum Jumps must be between 1 and 255.');
      valid = false;
    }
    if (!valid) return;
    setLoading(true);
    if (!maxJumps) {
      // Interval mode: run every 2 seconds
      if (!intervalRef.current) {
        // Call once immediately and check if it succeeds before starting interval
        const success = await handleTracert();
        if (success) {
          intervalRef.current = setInterval(() => {
            handleTracert();
          }, 2000);
        } else {
          setLoading(false);
        }
      }
    } else {
      // Single run mode
      await handleTracert();
      setLoading(false);
    }
  };

  const stopTracertInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setLoading(false);
    setAlertMsg('Tracert stopped!');
  };

  const stopTracertOnError = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setLoading(false);
    // Don't show "Tracert stopped!" message for errors
  };

  const handleTracert = async () => {
    setError(false);
    try {
      const Apiresponse = await postTracerttest({
        destIp,
        maxJumps,
        sourceIp,
      });
      console.log('Tracert API Response:', Apiresponse);
      
      // Check if response is successful
      if (Apiresponse.response) {
        if (maxJumps) {
          // Single run mode: replace info
          setInfo(Apiresponse.responseData);
        } else {
          // Interval mode: append result
          setInfo(prev => prev ? prev + '\n' + Apiresponse.responseData : Apiresponse.responseData);
          console.log('Tracert result:', Apiresponse.responseData);
        }
        return true; // Success
      } else {
        setInfo(prev => prev ? prev + '\n' + (Apiresponse.message || 'No response data') : (Apiresponse.message || 'No response data'));
        alert(Apiresponse.message || 'Server error occurred');
        stopTracertOnError();
        return false; // Failed
      }
    } catch (err) {
      console.error('Tracert API Error:', err);
      alert('Server is not connected. Please check your connection.');
      setError(true);
      stopTracertOnError();
      return false; // Failed
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-200px)] bg-gray-50 flex flex-col items-center py-0 px-2" style={{backgroundColor: '#dde0e4'}}>
      <div className="w-full max-w-4xl">
        {blueBar(TRACERT_TITLE)}
        <div className="w-full border-2 border-gray-400 border-t-0 shadow-sm flex flex-col" style={{backgroundColor: "#dde0e4"}}>
          <div className="w-full flex flex-col overflow-hidden">
            <div className="p-6 flex flex-col items-center">
          {/* Form Row */}
          <form className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 items-center mb-6">
            <label className="text-[14px] text-gray-700 text-left">{TRACERT_LABELS.sourceIp}</label>
            <select
              className="border border-gray-400 rounded px-3 py-2 text-[14px] text-gray-800 bg-white min-w-[220px] max-w-[220px] h-10"
              value={sourceIp}
              onChange={e => {
                setSourceIp(e.target.value);
                setInfo('');
                setSourceIpError('');
              }}
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

            <label className="text-[14px] text-gray-700 text-left">{TRACERT_LABELS.destIp}</label>
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

            <label className="text-[14px] text-gray-700 text-left">{TRACERT_LABELS.maxJumps}</label>
            <div className="flex flex-col w-full">
              <input
                type="number"
                className="border border-gray-400 rounded px-3 py-2 text-[14px] text-gray-800 bg-white min-w-[220px] max-w-[220px] h-10"
                value={maxJumps}
                onChange={e => {
                  setMaxJumps(e.target.value);
                  setInfo('');
                  setJumpsError('');
                }}
              />
              <div className="min-h-[20px]">
                {jumpsError && (
                  <span className="text-red-600 text-sm">{jumpsError}</span>
                )}
              </div>
            </div>
          </form>
          {/* Buttons Row */}
          <div className="w-full flex flex-row justify-center gap-8 mb-6">
            <Button variant="contained" sx={buttonSx} onClick={startTracert} disabled={loadind}>
              {loadind ? (TRACERT_BUTTONS.loading || 'Loading...') : (TRACERT_BUTTONS.start || 'Start')}
            </Button>
            <Button variant="contained" sx={buttonSx} onClick={stopTracertInterval}>{TRACERT_BUTTONS.end}</Button>
          </div>
          {/* Info Section */}
          <div className="w-full flex flex-col md:flex-row md:items-start gap-4">
            <label className="text-[14px] text-gray-700 min-w-[80px] md:pt-2">{TRACERT_LABELS.info}</label>
            <textarea
              className="w-full min-h-[180px] max-h-[320px] border border-gray-400 rounded bg-white text-[12px] p-3 font-mono resize-y"
              value={info}
              onChange={e => setInfo(e.target.value)}
              placeholder=""
              style={{ fontSize: '12px' }}
            />
          </div>
            </div>
          </div>
        </div>
      </div>
      {/* Bottom Alert Message (add fade-in animation to your CSS) */}
      {alertMsg && (
        <div className="fixed bottom-35 left-1/2 transform -translate-x-1/2 z-50">
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

export default TRACERTTest; 