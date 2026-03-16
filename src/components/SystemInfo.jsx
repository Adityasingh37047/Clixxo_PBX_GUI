import React,{use, useEffect, useState}from "react";
import {fetchSystemInfo, postLinuxCmd} from "../api/apiService"
import { Paper, Button, CircularProgress } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
// import {
//   LAN_INTERFACES,
//   SYSTEM_INFO,
//   VERSION_INFO,
// } from "../constants/SystemInfoConstants";



const InfoRow = ({ label, values, isIndented = false }) => (
  <div
    className={`grid grid-cols-1 md:grid-cols-12 gap-4 text-xs ${isIndented ? "pl-4" : ""}`}
    style={{ padding: '1px 0' }}
  >
    <div className="md:col-span-3 font-medium text-gray-700 break-words">{label}</div>
    {Array.isArray(values) ? (
      values.map((value, idx) => (
        <div key={idx} className="md:col-span-3 col-span-1 break-words">{value || ""}</div>
      ))
    ) : (
      <div className="md:col-span-9 col-span-1 break-words">{values}</div>
    )}
  </div>
);

const LanSection = ({ name, data }) => (
  <div className=" last:border-b-0" style={{ backgroundColor: '#dde0e4', borderBottom: '1px solid #222222' }}>
    <h3 className="font-semibold text-black mb-1 text-base">{name}</h3>
    <div className="space-y-0">
      {Object.entries(data).map(([key, value]) => (
        <InfoRow key={key} label={key} values={value} />  
      ))}
    </div>
  </div>
);

const SystemInfo = () => {
  const [LAN_INTERFACES,setLAN_INTERFACES]=useState([]);
  const [SYSTEM_INFO,setSYSTEM_INFO]=useState([]);
  const [VERSION_INFO, setVERSION_INFO ]=useState([]);
  const [error,setErros]=useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [licenseSerialNumber, setLicenseSerialNumber] = useState('');

  // Button styling matching Licence page
  const blueButtonSx = {
    background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
    color: '#fff',
    fontWeight: 500,
    fontSize: 14,
    minWidth: 100,
    boxShadow: '0 2px 6px #0002',
    textTransform: 'none',
    px: 2,
    py: 1.5,
    padding: '6px 16px',
    border: '1px solid #0e8fd6',
    '&:hover': {
      background: 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)',
      color: '#fff',
    },
  };
const setSystemInfo= async()=>{
  try {
    setIsRefreshing(true);
    
    // Fetch system info and serial (via astlicense) in parallel
    const [systemData, versionInfoData, astLicData] = await Promise.allSettled([
      fetchSystemInfo(),
      postLinuxCmd({ cmd: 'cat /home/clixxo/server/config/web_version.json' }),
      postLinuxCmd({ cmd: 'astlicense' })
    ]);
    
    // Handle system info
    if (systemData.status === 'fulfilled' && systemData.value.success) {
      const data = systemData.value;
      console.log(data);
      
      // Extract interfaces robustly from multiple possible response shapes
      const details = data.details || {};
      let rawInterfaces = [];

      if (Array.isArray(details.LAN_INTERFACES)) {
        rawInterfaces = details.LAN_INTERFACES;
      } else if (details.LAN_INTERFACES && typeof details.LAN_INTERFACES === 'object') {
        rawInterfaces = Object.entries(details.LAN_INTERFACES).map(([name, data]) => ({ name, data }));
      } else if (Array.isArray(details.interfaces)) {
        rawInterfaces = details.interfaces;
      } else if (details.network && Array.isArray(details.network.interfaces)) {
        rawInterfaces = details.network.interfaces;
      }

      // Filter out loopback and VPN virtual interfaces (tap*/tun*/vpn*) and normalize names
      const filteredInterfaces = (rawInterfaces || [])
        .filter(iface => {
          const name = (iface && iface.name) ? String(iface.name) : '';
          const lower = name.toLowerCase();
          if (lower === 'lo') return false;
          if (lower.startsWith('tap')) return false; // e.g., tap0
          if (lower.startsWith('tun')) return false; // e.g., tun0
          if (lower.includes('vpn')) return false; // e.g., openvpn
          return true;
        })
        .map(iface => {
          if (iface.name === 'eth0') {
            return { ...iface, name: 'LAN 1' };
          } else if (iface.name === 'eth1') {
            return { ...iface, name: 'LAN 2' };
          }
          return iface;
        })
        // Ensure predictable ordering: LAN 1, LAN 2, then others
        .sort((a, b) => {
          const order = { 'LAN 1': 1, 'LAN 2': 2 };
          const aOrder = order[a.name] || 99;
          const bOrder = order[b.name] || 99;
          return aOrder - bOrder;
        });
      
      setLAN_INTERFACES(filteredInterfaces);
      setSYSTEM_INFO(data.details.SYSTEM_INFO);
      
      // Handle VERSION_INFO with serial number derived from astlicense
      let versionInfo = data.details.VERSION_INFO || [];
      
      const updateVersionEntry = (label, value) => {
        const displayValue = value && value !== '' ? value : 'Unavailable';
        const idx = (versionInfo || []).findIndex(item => item.label === label);
        if (idx >= 0) {
          versionInfo[idx] = { ...versionInfo[idx], value: displayValue };
        } else {
          versionInfo = [...(versionInfo || []), { label, value: displayValue }];
        }
      };

      let parsedSerial = '';
      if (versionInfoData.status === 'fulfilled' && versionInfoData.value?.response) {
        try {
          const parsedJson = JSON.parse(versionInfoData.value.responseData || '{}');
          if (parsedJson) {
            parsedSerial = parsedJson.serial_no || '';
            updateVersionEntry('WEB', parsedJson.web_version);
            updateVersionEntry('Service', parsedJson.service);
            updateVersionEntry('Uboot', parsedJson.uboot);
            updateVersionEntry('Kernel', parsedJson.kernel);
            updateVersionEntry('Firmware', parsedJson.firmware);
          }
        } catch (jsonError) {
          console.error('Failed to parse version info JSON:', jsonError);
        }
      }

      if (!parsedSerial && astLicData.status === 'fulfilled' && astLicData.value?.response) {
        const out = String(astLicData.value.responseData || '');
        const lines = out.split(/\r?\n/);
        const astLicLine = lines.find(l => l.trim().toLowerCase().startsWith('astlic:')) || '';
        if (astLicLine) {
          const afterColon = astLicLine.split(':').slice(1).join(':');
          const fields = afterColon.split(',').map(s => s.trim());
          if (fields.length >= 2 && fields[1]) {
            parsedSerial = fields[1];
          }
        }
      }

      const finalSerial = parsedSerial || 'Unavailable';
      setLicenseSerialNumber(finalSerial === 'Unavailable' ? '' : finalSerial);
      updateVersionEntry('Serial Number', finalSerial);
      
      setVERSION_INFO(versionInfo);
      setErros("");
    } else {
      setErros(systemData.status === 'rejected' ? 'Failed to load system information' : systemData.value?.error || 'Unknown error');
      setLAN_INTERFACES([]);
      setSYSTEM_INFO([]);
      setVERSION_INFO([]);
    }
  } catch (error) {
    // Handle different types of errors with user-friendly messages
    let errorMessage = 'Failed to load system information. Please try again.';
    
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      errorMessage = 'Request timeout. Please check your connection and try again.';
    } else if (error.response?.status === 404) {
      errorMessage = 'System information not found. Please contact administrator.';
    } else if (error.response?.status >= 500) {
      errorMessage = 'Server error. Please try again later or contact support.';
    } else if (error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
      errorMessage = 'Network connection failed. Please check your internet connection.';
    } else if (error.message?.includes('timeout of 10000ms exceeded')) {
      errorMessage = 'Request timeout. The server is taking too long to respond. Please try again.';
    }
    
    setErros(errorMessage);
    setLAN_INTERFACES([]);
    setSYSTEM_INFO([]);
    setVERSION_INFO([]);
    setLicenseSerialNumber('');
  } finally {
    setIsRefreshing(false);
  }
}
  useEffect(()=>{
    setSystemInfo();
    // setInterval(()=>{
    //   setSystemInfo();
    // },5000)

  },[]);
  return (
    <div className="bg-gray-50 min-h-[calc(100vh-80px)] py-0 flex flex-col items-center" style={{backgroundColor: "#dde0e4"}}>
      <div className="w-full max-w-4xl mx-auto">
        {/* Simple error message */}
        {error && (
          <div className="mb-3 p-2 bg-red-50 border-l-2 border-red-400 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="w-full h-8 bg-gradient-to-b from-[#b3e0ff] via-[#6ec1f7] to-[#3b8fd6] flex items-center justify-center font-semibold text-lg text-gray-600 shadow mb-0">
          System Info
        </div>
        
        {/* Content */}
        <div className="border-2 border-gray-400 border-t-0 shadow-sm flex flex-col" style={{backgroundColor: "#dde0e4"}}>
          <div className="flex-1 py-2 px-4">
            <div className="space-y-0">
              {LAN_INTERFACES.map((lan) => (
                <LanSection key={lan.name} name={lan.name} data={lan.data} />
              ))}

              <div className="space-y-0" style={{ backgroundColor: '#dde0e4' }}>
                {SYSTEM_INFO.map((info, idx) => (
                  <div key={idx}>
                    <InfoRow label={info.label} values={info.value} />
                    {info.extra && (
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs mt-0 mb-0 pl-1">
                        <div className="md:col-span-6 col-span-1"></div>
                        <div className="md:col-span-6 col-span-1">
                          {info.extra.map((item, i) => (
                            <div key={i}>{item}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <InfoRow label="Current Version" values="" isIndented={true} />
                {VERSION_INFO.map((version, idx) => (
                  <InfoRow
                    key={`ver-${idx}`}
                    label={version.label}
                    values={version.value}
                    isIndented={true}
                  />
                ))}
              </div>

            </div>
          </div>
        </div>
        
        {/* Refresh Button - Outside border */}
        <div className="flex justify-center pt-4 pb-2">
          <Button
            variant="contained"
            startIcon={isRefreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
            onClick={setSystemInfo}
            disabled={isRefreshing}
            sx={blueButtonSx}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SystemInfo;


