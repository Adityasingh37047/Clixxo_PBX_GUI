import React, { useState, useEffect } from 'react';
import {
  SC_SECTIONS,
  SC_LABELS,
  SC_PCM_OPTIONS,
  SC_TS_OPTIONS,
  SC_BUTTONS,
  SC_NOTE,
} from '../constants/SignalingCaptureConstants';
import { Button } from '@mui/material';
import { fetchSystemInfo, postLinuxCmd } from '../api/apiService';

const blueBar = (title) => (
  <div className="rounded-t-lg h-8 flex items-center justify-center font-semibold text-[18px] text-[#444] shadow-sm mt-0"
    style={{background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)', boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)'}}>
    {title}
  </div>
);

const blueButtonSx = {
  background: 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)',
  color: '#fff',
  fontWeight: 600,
  fontSize: 14,
  borderRadius: 1,
  minWidth: 80,
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  textTransform: 'none',
  px: 2,
  py: 1,
  padding: '4px 16px',
  '&:hover': {
    background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
    color: '#fff',
  },
};

const SignalingCapture = () => {
  // Data Capture state
  const [network, setNetwork] = useState('all');
  const [syslogEnabled, setSyslogEnabled] = useState(false);
  const [syslogDest, setSyslogDest] = useState('192.168.0.254');
  
  // Network interfaces state
  const [networkOptions, setNetworkOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Data capture state
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureProcessId, setCaptureProcessId] = useState(null);
  const [captureFileName, setCaptureFileName] = useState('');

  // TS Recording state
  const [ts1Pcm, setTs1Pcm] = useState(SC_PCM_OPTIONS[0].value);
  const [ts1Slot, setTs1Slot] = useState(SC_TS_OPTIONS[0].value);
  const [ts2Pcm, setTs2Pcm] = useState(SC_PCM_OPTIONS[0].value);
  const [ts2Slot, setTs2Slot] = useState(SC_TS_OPTIONS[1].value);

  // E1 Two-way Recording state
  const [e1aPcm, setE1aPcm] = useState(SC_PCM_OPTIONS[0].value);
  const [e1aSlot, setE1aSlot] = useState(SC_TS_OPTIONS[2].value);
  const [e1bPcm, setE1bPcm] = useState(SC_PCM_OPTIONS[0].value);
  const [e1bSlot, setE1bSlot] = useState(SC_TS_OPTIONS[3].value);

  // Fetch system info and populate network options
  useEffect(() => {
    const fetchNetworkInterfaces = async () => {
      try {
        setLoading(true);
        const data = await fetchSystemInfo();
        
        if (data.success && data.details) {
          const details = data.details;
          let rawInterfaces = [];

          // Extract interfaces from system info
          if (Array.isArray(details.LAN_INTERFACES)) {
            rawInterfaces = details.LAN_INTERFACES;
          } else if (details.LAN_INTERFACES && typeof details.LAN_INTERFACES === 'object') {
            rawInterfaces = Object.entries(details.LAN_INTERFACES).map(([name, data]) => ({ name, data }));
          }

          // Filter and process interfaces
          const filteredInterfaces = (rawInterfaces || [])
            .filter(iface => {
              const name = (iface && iface.name) ? String(iface.name) : '';
              const lower = name.toLowerCase();
              if (lower === 'lo') return false;
              if (lower.startsWith('tap')) return false;
              if (lower.startsWith('tun')) return false;
              if (lower.includes('vpn')) return false;
              return true;
            })
            .map(iface => {
              const name = iface.name;
              let displayName = name;
              let ipAddress = '';

              // Get IP address from interface data
              if (iface.data) {
                const data = iface.data;
                if (Array.isArray(data['IP Address']) && data['IP Address'][0]) {
                  ipAddress = data['IP Address'][0];
                } else if (Array.isArray(data['Ip Address']) && data['Ip Address'][0]) {
                  ipAddress = data['Ip Address'][0];
                } else if (Array.isArray(data['ip_address']) && data['ip_address'][0]) {
                  ipAddress = data['ip_address'][0];
                }
              }

              // Normalize names
              if (name === 'eth0') {
                displayName = 'LAN 1';
              } else if (name === 'eth1') {
                displayName = 'LAN 2';
              }

              return {
                value: name,
                label: `${displayName}${ipAddress ? `(${ipAddress})` : ''}`,
                ip: ipAddress
              };
            })
            .sort((a, b) => {
              const order = { 'eth0': 1, 'eth1': 2 };
              const aOrder = order[a.value] || 99;
              const bOrder = order[b.value] || 99;
              return aOrder - bOrder;
            });

          // Add "All LAN" option at the beginning
          const options = [
            { value: 'all', label: 'All LAN', ip: '' },
            ...filteredInterfaces
          ];

          setNetworkOptions(options);
        }
      } catch (error) {
        console.error('Error fetching network interfaces:', error);
        // Fallback to default options
        setNetworkOptions([
          { value: 'all', label: 'All LAN', ip: '' },
          { value: 'eth0', label: 'LAN 1', ip: '' },
          { value: 'eth1', label: 'LAN 2', ip: '' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchNetworkInterfaces();
  }, []);

  // Handle start data capture
  const handleStartCapture = async () => {
    try {
      // Determine interface for tcpdump
      let interfaceName = '';
      if (network === 'all') {
        interfaceName = 'any';
      } else if (network === 'eth0') {
        interfaceName = 'eth0';
      } else if (network === 'eth1') {
        interfaceName = 'eth1';
      } else {
        interfaceName = network;
      }

      // Create capture file with readable date
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0].replace(/-/g, '_'); // YYYY_MM_DD format
      const fileName = `/var/tmp/signaling_capture_${dateStr}.pcap`;
      setCaptureFileName(fileName);

      // Build tcpdump command
      // -U: packet-buffered (flushes packets to file quickly to reduce truncation risk)
      // Important: BPF filter (if any) must be passed as a single trailing argument, without a leading 'and'
      const dest = syslogDest.trim();
      const filterExpr = (syslogEnabled && dest)
        ? `host ${dest} and (udp port 514 or tcp port 514)`
        : '';
      const tcpdumpCmd = `tcpdump -U -i ${interfaceName} -s 0 -w '${fileName}' ${filterExpr ? `'${filterExpr}'` : ''}`;

      // Run tcpdump in background and capture PID; keep stderr in a log so we can debug permission/interface errors
      const logPath = '/var/tmp/tcpdump_capture.log';
      const cmd = `sh -c "set -e; mkdir -p /var/tmp; chmod 1777 /var/tmp || true; rm -f '${fileName}'; touch '${fileName}'; chmod 666 '${fileName}' || true; (command -v sudo >/dev/null 2>&1 && sudo -n ${tcpdumpCmd} || ${tcpdumpCmd}) > /dev/null 2> '${logPath}' < /dev/null & echo \\$!"`;

      const response = await postLinuxCmd({ cmd });
      const pid = String(response?.responseData || '').trim();
      
      if (pid && /^\d+$/.test(pid)) {
        // Quick health check: ensure process exists and no immediate tcpdump error in log
        await new Promise(r => setTimeout(r, 400));
        const health = await postLinuxCmd({ cmd: `ps -p ${pid} >/dev/null 2>&1 && echo RUNNING || echo NOT_RUNNING` });
        const status = String(health?.responseData || '').trim();
        const logTailRes = await postLinuxCmd({ cmd: `tail -n 3 ${logPath} 2>/dev/null || true` });
        const logTail = String(logTailRes?.responseData || '').trim();
        if (status !== 'RUNNING') {
          window.alert(`Failed to start capture. tcpdump not running.\n${logTail ? `\nLog:\n${logTail}` : ''}`);
          return;
        }
        setCaptureProcessId(pid);
        setIsCapturing(true);
        
        // Show success alert
        const lanDisplay = network === 'all' ? 'All LAN' : 
                          network === 'eth0' ? 'LAN 1' : 
                          network === 'eth1' ? 'LAN 2' : network;
        window.alert(`Start data capture on ${lanDisplay}!`);
      } else {
        window.alert(`Failed to start data capture. Response: ${pid || '(no output)'}`);
      }
    } catch (error) {
      console.error('Error starting data capture:', error);
      window.alert('Error starting data capture. Please try again.');
    }
  };

  // Handle stop data capture
  const handleStopCapture = async () => {
    try {
      if (!captureProcessId) {
        window.alert('No capture process is running.');
        return;
      }

      // Kill the tcpdump process
      const killCmd = `kill ${captureProcessId}`;
      await postLinuxCmd({ cmd: killCmd });

      // Wait a moment for the process to stop and file to be finalized, then sync
      await new Promise(resolve => setTimeout(resolve, 1000));
      await postLinuxCmd({ cmd: 'sync' });

      // Check if file exists and get its size
      const checkFileCmd = `ls -la ${captureFileName} 2>/dev/null || echo "FILE_NOT_FOUND"`;
      const fileResponse = await postLinuxCmd({ cmd: checkFileCmd });
      const fileInfo = String(fileResponse?.responseData || '').trim();

      if (fileInfo.includes('FILE_NOT_FOUND')) {
        window.alert('Capture file not found on server.');
      } else {
        // Sanity check: does the pcap contain at least one packet?
        const pktCountCmd = `tcpdump -n -q -r ${captureFileName} -c 1 2>/dev/null | wc -l`;
        const pktRes = await postLinuxCmd({ cmd: pktCountCmd });
        const pktCount = parseInt(String(pktRes?.responseData || '0').trim(), 10) || 0;
        if (pktCount === 0) {
          // No packets in the pcap – nothing useful to download
          window.alert('Data capture stopped but no packets were recorded. Try selecting All LAN, disable Syslog filter, and let it run 10–20 seconds while generating traffic.');
        } else {
          window.alert('Data capture stopped!');

          // Download the file (transfer as base64 to preserve binary integrity)
          try {
            const downloadCmd = `base64 ${captureFileName}`;
            const downloadResponse = await postLinuxCmd({ cmd: downloadCmd });
            
            if (downloadResponse?.responseData) {
              const b64 = downloadResponse.responseData.replace(/\s+/g, '');
              const byteCharacters = atob(b64);
              const byteNumbers = new Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i += 1) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers);
              const blob = new Blob([byteArray], { type: 'application/vnd.tcpdump.pcap' });
              
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              const downloadDate = new Date().toISOString().split('T')[0].replace(/-/g, '_');
              link.download = `signaling_capture_${downloadDate}.pcap`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
            } else {
              window.alert('Failed to download capture file.');
            }
          } catch (downloadError) {
            console.error('Error downloading file:', downloadError);
            window.alert('Error downloading capture file. Please try again.');
          }
        }
      }

      // Reset capture state
      setIsCapturing(false);
      setCaptureProcessId(null);
      setCaptureFileName('');
    } catch (error) {
      console.error('Error stopping data capture:', error);
      window.alert('Error stopping data capture. Please try again.');
    }
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-200px)] flex flex-col items-center box-border" style={{backgroundColor: "#dde0e4"}}>
      {/* Data Capture Section */}
      <div className="w-full max-w-7xl mx-auto mb-12">
        {blueBar(SC_SECTIONS[0])}
        <div className="w-full border-2 border-gray-400 border-t-0 shadow-sm flex flex-col" style={{backgroundColor: "#dde0e4"}}>
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <label className="text-sm text-gray-800 w-full sm:w-80 text-left">{SC_LABELS.networkInterface}</label>
                  <select
                    className={`border border-gray-300 rounded px-3 py-1 text-sm w-full sm:w-48 ${
                      isCapturing 
                        ? 'text-gray-500 bg-gray-100 cursor-not-allowed' 
                        : 'text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200'
                    }`}
                    value={network}
                    onChange={e => setNetwork(e.target.value)}
                    disabled={loading || isCapturing}
                  >
                    {loading ? (
                      <option value="">Loading...</option>
                    ) : (
                      networkOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))
                    )}
                  </select>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <label className="text-sm text-gray-800 w-full sm:w-80 text-left">{SC_LABELS.captureSyslog}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={syslogEnabled}
                      onChange={e => setSyslogEnabled(e.target.checked)}
                      className={`w-4 h-4 accent-blue-500 ${isCapturing ? 'cursor-not-allowed' : ''}`}
                      id="syslog-enable"
                      disabled={isCapturing}
                    />
                    <label htmlFor="syslog-enable" className="text-sm text-gray-800 select-none">{SC_LABELS.enable}</label>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <label className="text-sm text-gray-800 w-full sm:w-80 text-left">{SC_LABELS.syslogDest}</label>
                  <input
                    type="text"
                    value={syslogDest}
                    onChange={e => setSyslogDest(e.target.value)}
                    disabled={!syslogEnabled || isCapturing}
                    className={`border border-gray-300 rounded px-3 py-1 text-sm w-full sm:w-48 ${
                      !syslogEnabled || isCapturing
                        ? 'text-gray-500 bg-gray-100 cursor-not-allowed' 
                        : 'text-gray-800 bg-white cursor-text'
                    }`}
                  />
                </div>
                <div className="mt-2">
                  <span className="text-sm text-red-600 font-medium">{SC_NOTE}</span>
                </div>
              </div>
              <div className="flex gap-3 justify-center lg:justify-start lg:ml-4">
                <Button 
                  variant="contained" 
                  sx={blueButtonSx}
                  onClick={handleStartCapture}
                  disabled={isCapturing}
                >
                  {SC_BUTTONS.start}
                </Button>
                <Button 
                  variant="contained" 
                  sx={blueButtonSx}
                  onClick={handleStopCapture}
                  disabled={!isCapturing}
                >
                  {SC_BUTTONS.stop}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TS Recording Section */}
      <div className="w-full max-w-7xl mx-auto mb-12">
        {blueBar(SC_SECTIONS[1])}
        <div className="w-full border-2 border-gray-400 border-t-0 shadow-sm flex flex-col" style={{backgroundColor: "#dde0e4"}}>
          <div className="p-6">
            <div className="space-y-4">
              {[0, 1].map(i => (
                <div key={i} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                    <label className="text-sm text-gray-800 w-full sm:w-80 text-left">{SC_LABELS.pcmTs}</label>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                      <select
                        className="border border-gray-300 rounded px-3 py-1 text-sm text-gray-800 bg-white w-full sm:w-24"
                        value={i === 0 ? ts1Pcm : ts2Pcm}
                        onChange={e => (i === 0 ? setTs1Pcm(e.target.value) : setTs2Pcm(e.target.value))}
                      >
                        {SC_PCM_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <select
                        className="border border-gray-300 rounded px-3 py-1 text-sm text-gray-800 bg-white w-full sm:w-48"
                        value={i === 0 ? ts1Slot : ts2Slot}
                        onChange={e => (i === 0 ? setTs1Slot(e.target.value) : setTs2Slot(e.target.value))}
                      >
                        {SC_TS_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end lg:justify-start">
                    <Button variant="contained" sx={blueButtonSx}>{SC_BUTTONS.start}</Button>
                    <Button variant="contained" sx={blueButtonSx}>{SC_BUTTONS.stop}</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* E1 Two-way Recording Section */}
      <div className="w-full max-w-7xl mx-auto mb-12">
        {blueBar(SC_SECTIONS[2])}
        <div className="w-full border-2 border-gray-400 border-t-0 shadow-sm flex flex-col" style={{backgroundColor: "#dde0e4"}}>
          <div className="p-6">
            <div className="space-y-4">
              {[0, 1].map(i => (
                <div key={i} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                    <label className="text-sm text-gray-800 w-full sm:w-80 text-left">{SC_LABELS.pcmTs}</label>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                      <select
                        className="border border-gray-300 rounded px-3 py-1 text-sm text-gray-800 bg-white w-full sm:w-24"
                        value={i === 0 ? e1aPcm : e1bPcm}
                        onChange={e => (i === 0 ? setE1aPcm(e.target.value) : setE1bPcm(e.target.value))}
                      >
                        {SC_PCM_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <select
                        className="border border-gray-300 rounded px-3 py-1 text-sm text-gray-800 bg-white w-full sm:w-48"
                        value={i === 0 ? e1aSlot : e1bSlot}
                        onChange={e => (i === 0 ? setE1aSlot(e.target.value) : setE1bSlot(e.target.value))}
                      >
                        {SC_TS_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end lg:justify-start">
                    <Button variant="contained" sx={blueButtonSx}>{SC_BUTTONS.start}</Button>
                    <Button variant="contained" sx={blueButtonSx}>{SC_BUTTONS.stop}</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="w-full max-w-7xl flex justify-center items-center gap-6 mt-8 mb-8">
        <Button variant="contained" sx={blueButtonSx}>{SC_BUTTONS.clean}</Button>
        <Button variant="contained" sx={blueButtonSx}>{SC_BUTTONS.download}</Button>
      </div>
    </div>
  );
};

export default SignalingCapture; 