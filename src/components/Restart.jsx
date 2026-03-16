import React, { useState } from 'react';
import Button from '@mui/material/Button';
import { RESTART_SECTIONS, RESTART_BUTTON_LABEL } from '../constants/RestartConstants';
import { systemRestart, servicePing, serviceRestart, fetchSystemInfo } from '../api/apiService';

const blueBarStyle = {
  width: '100%',
  height: 36,
  background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)',
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
  marginBottom: 0,
  display: 'flex',
  alignItems: 'center',
  fontWeight: 600,
  fontSize: 22,
  color: '#444',
  justifyContent: 'center',
  boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)',
};
const sectionContainerStyle = {
  width: '100%',
  maxWidth: 1400,
  background: '#fff',
  border: '1px solid #888',
  borderRadius: 8,
  margin: '32px auto',
  padding: 0,
  boxSizing: 'border-box',
  overflow: 'hidden',
};
const contentRowStyle = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '48px 48px',
  gap: 24,
};
const instructionStyle = {
  fontSize: 20,
  color: '#666',
  textAlign: 'center',
  flex: 1,
};
const buttonSx = {
  background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
  color: '#fff',
  fontWeight: 600,
  fontSize: '18px',
  borderRadius: 2,
  minWidth: 140,
  minHeight: 48,
  px: 2,
  py: 0.5,
  boxShadow: '0 2px 8px #b3e0ff',
  textTransform: 'none',
  '&:hover': {
    background: 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)',
    color: '#fff',
  },
};

const Restart = () => {
  const [loading, setLoading] = useState(false);
  const [serviceSuccess, setServiceSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [loadingType, setLoadingType] = useState(''); // 'system' or 'service'
  const [progressMessage, setProgressMessage] = useState('');

  // Helper function to extract IP addresses from system info
  const getDeviceIPs = async () => {
    try {
      const sysInfo = await fetchSystemInfo();
      const getIpFromInterfaceObject = (obj) => {
        if (!obj || typeof obj !== 'object') return null;
        if (Array.isArray(obj['IP Address']) && obj['IP Address'][0]) return obj['IP Address'][0];
        if (Array.isArray(obj['Ip Address']) && obj['Ip Address'][0]) return obj['Ip Address'][0];
        if (Array.isArray(obj['ip_address']) && obj['ip_address'][0]) return obj['ip_address'][0];
        return null;
      };

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

      // Fallback to direct network object access
      if (!lan1Ip) lan1Ip = getIpFromInterfaceObject(sysInfo?.network?.eth0) || getIpFromInterfaceObject(sysInfo?.eth0);
      if (!lan2Ip) lan2Ip = getIpFromInterfaceObject(sysInfo?.network?.eth1) || getIpFromInterfaceObject(sysInfo?.eth1);

      return { lan1Ip, lan2Ip };
    } catch (error) {
      console.error('Error getting device IPs:', error);
      return { lan1Ip: null, lan2Ip: null };
    }
  };

  // Build list of all IPs to ping: lan1, lan2, and current host (so we always try the IP user is connected to).
  const getPingTargets = (lan1Ip, lan2Ip) => {
    const currentHost = (window.location.hostname || '').trim();
    const set = new Set([lan1Ip, lan2Ip, currentHost].filter(Boolean));
    return Array.from(set);
  };

  // Ping device at given IP (service-ping API). Returns true if device responds.
  // Treat 200 OK and also 401/403 as success (after reboot, device may return 401 until re-login).
  // When pinging a different host (device IP), use default port 80/443; same host uses current port.
  const pingDeviceAt = async (ip) => {
    const protocol = window.location.protocol;
    const isSameHost = (ip || '').trim() === window.location.hostname;
    const port = isSameHost
      ? (window.location.port ? `:${window.location.port}` : (protocol === 'https:' ? ':443' : ':80'))
      : (protocol === 'https:' ? ':443' : ':80');
    const url = `${protocol}//${ip}${port}/api/service-ping`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);
    try {
      const res = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) return true;
      if (res.status === 401 || res.status === 403) return true; // device is back, needs login
      return false;
    } catch (err) {
      clearTimeout(timeoutId);
      return false;
    }
  };

  // Ping all target IPs (lan1, lan2, current host); returns { success, respondedIp } for redirect
  const pingAllTargets = async (targetIps) => {
    for (const ip of targetIps) {
      const ok = await pingDeviceAt(ip);
      if (ok) return { success: true, respondedIp: ip };
    }
    if (targetIps.length === 0) {
      try {
        const res = await servicePing();
        if (res?.response) return { success: true, respondedIp: window.location.hostname };
        return { success: false, respondedIp: null };
      } catch (err) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          return { success: true, respondedIp: window.location.hostname };
        }
        return { success: false, respondedIp: null };
      }
    }
    return { success: false, respondedIp: null };
  };

  const handleRestart = async (sectionKey) => {
    setError('');
    if (sectionKey === 'system') {
      setLoading(true);
      setLoadingType('system');
      setProgressMessage('System is restarting...');
      let pingTargets = [];
      try {
        const ips = await getDeviceIPs();
        pingTargets = getPingTargets(ips.lan1Ip, ips.lan2Ip);
        try {
          await systemRestart();
        } catch (apiError) {
          const status = apiError.response?.status;
          const code = apiError.code;
          const msg = apiError.message || '';
          const is500 = status >= 500;
          const isConnectionError = code === 'ECONNRESET' || code === 'ETIMEDOUT' || code === 'ECONNABORTED' ||
            msg.includes('Network Error') || msg.includes('Failed to fetch') || msg.includes('timeout');
          if (is500 || isConnectionError) {
            // Server often returns 500 or drops connection when reboot runs; assume reboot was initiated
          } else {
            console.error('System restart API error:', apiError);
            let errorMessage = 'Failed to initiate system restart.';
            if (status === 401 || status === 403) errorMessage = 'Permission denied.';
            else if (status === 404) errorMessage = 'Restart endpoint not found.';
            else if (apiError.message) errorMessage = apiError.message;
            alert(errorMessage);
            setLoading(false);
            setLoadingType('');
            setProgressMessage('');
            return;
          }
        }
        setProgressMessage('Waiting for device to come back online...');
        setTimeout(async () => {
          let result = { success: false, respondedIp: null };
          for (let i = 0; i < 48; i++) {
            try {
              result = await pingAllTargets(pingTargets);
              if (result.success) break;
            } catch (e) {
              // continue
            }
            await new Promise(res => setTimeout(res, 5000));
          }
          if (result.success) {
            setProgressMessage('Device is back online. Redirecting to login...');
            const protocol = window.location.protocol;
            const isSameHost = (result.respondedIp || '') === window.location.hostname;
            const portPart = isSameHost
              ? (window.location.port ? `:${window.location.port}` : '')
              : (protocol === 'https:' ? ':443' : ':80');
            const loginUrl = `${protocol}//${result.respondedIp}${portPart}/login`;
            setTimeout(() => {
              window.location.href = loginUrl;
            }, 3000);
          } else {
            setLoading(false);
            setLoadingType('');
            setProgressMessage('');
            alert('Device did not come back online. Please check your network or try again later.');
          }
        }, 5000);
      } catch (error) {
        console.error('System restart error:', error);
        alert('Failed to get device info or start restart. Please try again.');
        setLoading(false);
        setLoadingType('');
        setProgressMessage('');
      }
    } else if (sectionKey === 'service') {
      setLoading(true);
      setLoadingType('service');
      setProgressMessage('Restarting service...');
      try {
        await serviceRestart();
        setLoading(false);
        setLoadingType('');
        setProgressMessage('');
        setServiceSuccess(true);
        setShowServiceModal(true);
      } catch (error) {
        console.error('Service restart error:', error);
        let errorMessage = 'Failed to restart service.';
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
          errorMessage = 'Service restart timed out. Please try again.';
        } else if (error.response?.status >= 500) {
          errorMessage = 'Server error during service restart. Please try again later.';
        } else if (error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
          errorMessage = 'Server is not connected. Please check your connection.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        alert(errorMessage);
        setLoading(false);
        setLoadingType('');
        setProgressMessage('');
      }
    }
  };

  return (
    <div style={{ width: '100%', minHeight: 'calc(100vh - 80px)', background: 'gray-50', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
      {RESTART_SECTIONS.map((section) => (
        <div key={section.key} style={sectionContainerStyle}>
          <div style={blueBarStyle}>{section.title}</div>
          <div style={{ ...contentRowStyle, flexDirection: 'row', padding: '48px 48px' }}>
            <div style={instructionStyle}>{section.instruction}</div>
            <Button
              sx={buttonSx}
              onClick={() => handleRestart(section.key)}
              disabled={loading && loadingType === section.key}
            >
              {RESTART_BUTTON_LABEL}
            </Button>
          </div>
        </div>
      ))}
      {error && (
        <div style={{ color: 'red', fontWeight: 600, fontSize: 18, marginTop: 24 }}>{error}</div>
      )}
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(255,255,255,0.85)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{ fontSize: 22, fontWeight: 600, color: '#0e8fd6', marginBottom: 16, textAlign: 'center', maxWidth: 360 }}>
            {progressMessage || (loadingType === 'system' ? 'System is restarting...' : 'Service is restarting...')}
          </div>
          <div className="loader" style={{ width: 48, height: 48, border: '6px solid #b3e0ff', borderTop: '6px solid #0e8fd6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
        </div>
      )}
      {showServiceModal && serviceSuccess && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.3)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 40, minWidth: 320, textAlign: 'center', boxShadow: '0 2px 16px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, color: '#0e8fd6' }}>Service restart successful</div>
            <div style={{ fontSize: 18, marginBottom: 32 }}>The service has been restarted successfully.</div>
            <Button
              variant="contained"
              sx={{ ...buttonSx, minWidth: 100, fontSize: 18 }}
              onClick={() => {
                setShowServiceModal(false);
                setServiceSuccess(false);
              }}
            >
              OK
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Restart; 