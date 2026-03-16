import React, { useState, useEffect } from 'react';
import { MANAGEMENT_SECTIONS, MANAGEMENT_INITIAL_FORM } from '../constants/ManagementConstants';
import { fetchManagementParameters, saveManagementParameters, resetManagementParameters, fetchSystemInfo, postLinuxCmd } from '../api/apiService';
import { Button, Select, MenuItem, TextField, Alert, CircularProgress } from '@mui/material';

const blueBarStyle = {
  width: '100%',
  height: 32,
  background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)',
  marginBottom: 0,
  display: 'flex',
  alignItems: 'center',
  fontWeight: 600,
  fontSize: 18,
  color: '#444',
  justifyContent: 'center',
  boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)',
};

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

const Management = () => {
  const [form, setForm] = useState(MANAGEMENT_INITIAL_FORM);
  const [formKey, setFormKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [lanIps, setLanIps] = useState({ lan1: '', lan2: '' });

  // Function to detect if NTP is configured in the system
  const detectNtpStatus = async () => {
    try {
      console.log('🔍 Checking if NTP is configured...');
      
      // Check if there's a server line in chrony.conf (means NTP is configured)
      const checkNtpCmd = `grep "^server" /etc/chrony/chrony.conf 2>/dev/null || grep "^server" /etc/chrony.conf 2>/dev/null || echo "not_configured"`;
      
      const response = await postLinuxCmd({ cmd: checkNtpCmd });
      
      if (response.response && response.responseData) {
        const output = response.responseData.trim();
        
        // If we found a server line, NTP is configured
        if (output && output !== 'not_configured' && output.startsWith('server')) {
          console.log('✅ NTP is ENABLED (server configured in chrony.conf)');
          return 'Yes';
        } else {
          console.log('❌ NTP is DISABLED (no server in chrony.conf)');
          return 'No';
        }
      }
      
      return 'No'; // Default to No if detection fails
    } catch (error) {
      console.error('Error detecting NTP status:', error);
      return 'No'; // Default to No on error
    }
  };

  const fetchManagementData = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Create a timeout wrapper for the fetch operation
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout after 20 seconds')), 20000);
      });
      
      const fetchPromise = fetchManagementParameters();
      
      const data = await Promise.race([fetchPromise, timeoutPromise]);
      console.log('Management data:', data);
      
      if (data.response === true) {
        // Map the response data to form structure
        const responseData = data.responseData;
        
        // Detect actual NTP status from system
        const actualNtpStatus = await detectNtpStatus();
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔵 NTP Status Detection:');
        console.log(`   System detected: NTP is ${actualNtpStatus === 'Yes' ? 'ENABLED ✓' : 'DISABLED ✗'}`);
        console.log(`   Will show radio button: ${actualNtpStatus === 'Yes' ? 'YES ☑' : 'NO ☑'}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // If NTP is enabled, also detect the server address and cycle from system
        let detectedServer = responseData.ntpServerAddress || '127.0.0.1';
        let detectedCycle = responseData.synchronizingCycle || '3600';
        
        if (actualNtpStatus === 'Yes') {
          try {
            // Get NTP server from chrony config
            const getNtpServerCmd = `cat /etc/chrony/chrony.conf 2>/dev/null | grep "^server" | head -1 | awk '{print $2}' || cat /etc/chrony.conf 2>/dev/null | grep "^server" | head -1 | awk '{print $2}' || echo ""`;
            const serverResponse = await postLinuxCmd({ cmd: getNtpServerCmd });
            
            if (serverResponse.response && serverResponse.responseData) {
              const serverFromSystem = serverResponse.responseData.trim();
              if (serverFromSystem) {
                detectedServer = serverFromSystem;
                console.log(`📡 Detected NTP server from system: ${serverFromSystem}`);
              }
            }
            
            // Get synchronizing cycle from cron
            const getCronCycleCmd = `cat /etc/cron.d/chrony-sync 2>/dev/null | grep "chronyc makestep" | awk -F'/' '{print $2}' | awk '{print $1}' || echo ""`;
            const cronResponse = await postLinuxCmd({ cmd: getCronCycleCmd });
            
            if (cronResponse.response && cronResponse.responseData) {
              const minutes = cronResponse.responseData.trim();
              if (minutes && !isNaN(minutes)) {
                detectedCycle = (parseInt(minutes) * 60).toString();
                console.log(`⏱️ Detected sync cycle from system: ${detectedCycle} seconds`);
              }
            }
          } catch (err) {
            console.log('⚠️ Could not detect NTP config details, using backend values');
          }
        }
        
        const mappedData = {
          // Web Management
          webPort: responseData.webConfig?.webPort || '',
          webAccess: responseData.webConfig?.webAccess || 'all',
          webIpAddress: responseData.webConfig?.webIpAddress || '',
          webTimeout: responseData.webConfig?.webTimeout || '',
          webWhitelist: responseData.webConfig?.webWhitelist || '',
          
          // SSH Management
          sshEnable: responseData.sshEnable || 'No',
          sshPort: responseData.sshPort || '',
          sshWhitelist: responseData.sshWhitelist || '',
          
          // Remote Data Capture
          remoteDataCapture: responseData.remoteDataCapture || 'No',
          captureRtp: responseData.captureRtp ?? true,
          captureRtpInterface: responseData.captureRtpInterface || 'lan1',
          
          // FTP Config
          ftpEnable: responseData.ftpEnable || 'No',
          ftpWhitelist: responseData.ftpWhitelist || '',
          
          // Telnet Config
          telnetEnable: responseData.telnetEnable || 'No',
          telnetWhitelist: responseData.telnetWhitelist || '',
          
          // Watchdog Setting
          watchdogEnable: responseData.watchdogEnable || 'No',
          
          // SYSLOG Parameters
          syslogEnable: responseData.syslogEnable || 'No',
          syslogServerAddress: responseData.syslogServerAddress || '127.0.0.1',
          syslogLevel: responseData.syslogLevel || 'ERROR',
          
          // CDR Parameters
          cdrEnable: responseData.cdrEnable || 'No',
          cdrServerAddress: responseData.cdrServerAddress || '',
          cdrServerPort: responseData.cdrServerPort || '',
          cdrSendFailed: responseData.cdrSendFailed || false,
          cdrContent: responseData.cdrContent || 'Basic Information',
          cdrHangup: responseData.cdrHangup || false,
          cdrAddLanIp: responseData.cdrAddLanIp || false,
          cdrKeepRouting: responseData.cdrKeepRouting || false,
          cdrSendNumberClass: responseData.cdrSendNumberClass || false,
          cdrServerIp: responseData.cdrServerIp || '127.0.0.1',
          cdrServerPortClass: responseData.cdrServerPortClass || '4',
          cdrDebugPhp: responseData.cdrDebugPhp || 'No',
          cdrAllowDeny: responseData.cdrAllowDeny || 'Allow',
          
          // Access to the interface
          accessDebugPhp: responseData.accessDebugPhp || 'No',
          
          // Time Parameters - Use system-detected values
          ntpEnable: actualNtpStatus, // Detected from system
          ntpServerAddress: detectedServer, // Detected from chrony.conf
          synchronizingCycle: detectedCycle, // Detected from cron job
          dailyRestart: responseData.dailyRestart || 'No',
          restartHour: responseData.restartHour || '0',
          restartMinute: responseData.restartMinute || '0',
          systemTime: responseData.systemTime || '',
          modifyTime: responseData.modifyTime || false,
          timeZone: responseData.timeZone || 'GMT+5:30'
        };
        
        // Update form with mapped data
        setForm(prevForm => ({
          ...prevForm,
          ...mappedData
        }));
      } else {
        throw new Error(data.message || 'Failed to fetch management parameters');
      }
    } catch (error) {
      console.error('Error fetching management parameters:', error);
      
      // Handle different types of errors
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        setError('Request timeout (20 seconds exceeded). Please check your connection and try again.');
      } else if (error.response?.status === 404) {
        setError('Management configuration not found. Please contact administrator.');
      } else if (error.response?.status >= 500) {
        setError('Server error. Please try again later or contact support.');
      } else if (error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
        setError('Network connection failed. Please check your internet connection.');
      } else {
        setError(error.message || 'Failed to load management parameters. Please refresh the page and try again.');
      }
      
      setForm(MANAGEMENT_INITIAL_FORM);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchManagementData();
  }, []);

  // Fetch system info to populate LAN IPs for Capture RTP interface labels
  useEffect(() => {
    const loadLanIps = async () => {
      try {
        const si = await fetchSystemInfo();
        // Prefer shape used by SystemInfo page: { success, details: { LAN_INTERFACES: [...] } }
        const details = si?.details || si?.responseData || {};
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

        const toIp = (dataObj) => {
          if (!dataObj || typeof dataObj !== 'object') return '';
          // Look for first IPv4-looking value anywhere in values
          for (const val of Object.values(dataObj)) {
            if (typeof val === 'string' && /^(\d{1,3}\.){3}\d{1,3}$/.test(val)) return val;
            if (Array.isArray(val)) {
              for (const inner of val) {
                if (typeof inner === 'string' && /^(\d{1,3}\.){3}\d{1,3}$/.test(inner)) return inner;
              }
            }
          }
          return '';
        };

        // Normalize interface names and pick IPs
        let lan1Ip = '';
        let lan2Ip = '';
        (rawInterfaces || []).forEach((iface) => {
          const name = (iface && iface.name) ? String(iface.name) : '';
          const data = iface?.data || iface;
          if (name === 'eth0' || name === 'LAN 1') lan1Ip = toIp(data) || lan1Ip;
          if (name === 'eth1' || name === 'LAN 2') lan2Ip = toIp(data) || lan2Ip;
        });
        setLanIps({ lan1: lan1Ip, lan2: lan2Ip });
      } catch (e) {
        // Non-blocking; fallback labels used
        console.log('Could not fetch system info for LAN IPs');
      }
    };
    loadLanIps();
  }, []);

  // Validation functions
  const validatePort = (value) => {
    if (!value) return '';
    const port = parseInt(value);
    if (isNaN(port) || port < 1 || port > 65535) {
      return 'Port must be a number between 1 and 65535';
    }
    return '';
  };

  const validateIPAddress = (value) => {
    if (!value) return '';
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(value)) {
      return 'Please enter a valid IP address (e.g., 192.168.1.1)';
    }
    const parts = value.split('.');
    for (let part of parts) {
      const num = parseInt(part);
      if (num < 0 || num > 255) {
        return 'IP address parts must be between 0 and 255';
      }
    }
    return '';
  };

  const validateTimeout = (value) => {
    if (!value) return '';
    const timeout = parseInt(value);
    if (isNaN(timeout) || timeout < 1 || timeout > 3600) {
      return 'Timeout must be a number between 1 and 3600 seconds';
    }
    return '';
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'webPort':
      case 'sshPort':
        return validatePort(value);
      case 'webTimeout':
        return validateTimeout(value);
      case 'webWhitelist':
      case 'sshWhitelist':
      case 'ftpWhitelist':
      case 'telnetWhitelist':
      case 'webIpAddress':
        if (value && value.trim()) {
          return validateIPAddress(value);
        }
        return '';
      default:
        return '';
    }
  };

  // Function to detect current NTP configuration from system
  const detectNtpConfiguration = async () => {
    try {
      console.log('🔍 Detecting current NTP configuration from system...');
      
      // Try to get NTP server from chrony config (remove 'iburst' if present)
      const getNtpServerCmd = `cat /etc/chrony/chrony.conf 2>/dev/null | grep "^server" | head -1 | awk '{print $2}' || cat /etc/chrony.conf 2>/dev/null | grep "^server" | head -1 | awk '{print $2}' || echo ""`;
      
      // Try to get synchronizing cycle from cron
      const getCronCycleCmd = `cat /etc/cron.d/chrony-sync 2>/dev/null | grep "chronyc makestep" | awk -F'/' '{print $2}' | awk '{print $1}' || echo ""`;
      
      const [serverResponse, cronResponse] = await Promise.all([
        postLinuxCmd({ cmd: getNtpServerCmd }),
        postLinuxCmd({ cmd: getCronCycleCmd })
      ]);
      
      let detectedServer = '';
      let detectedCycle = '';
      
      if (serverResponse.response && serverResponse.responseData) {
        detectedServer = serverResponse.responseData.trim();
      }
      
      if (cronResponse.response && cronResponse.responseData) {
        const minutes = cronResponse.responseData.trim();
        if (minutes && !isNaN(minutes)) {
          // Convert minutes to seconds
          detectedCycle = (parseInt(minutes) * 60).toString();
        }
      }
      
      if (detectedServer || detectedCycle) {
        console.log('✅ Detected NTP Configuration:', { 
          server: detectedServer || '(not found)', 
          cycle: detectedCycle ? `${detectedCycle}s` : '(not found)' 
        });
        
        const updates = {};
        if (detectedServer) updates.ntpServerAddress = detectedServer;
        if (detectedCycle) updates.synchronizingCycle = detectedCycle;
        
        // Update form with detected values
        setForm(prev => ({
          ...prev,
          ...updates
        }));
        
        // Log detection details (no alert popup)
        if (detectedServer) console.log(`📡 NTP Server detected: ${detectedServer}`);
        if (detectedCycle) console.log(`⏱️ Synchronizing Cycle detected: ${detectedCycle} seconds (${parseInt(detectedCycle)/60} minutes)`);
      } else {
        console.log('⚠️ No NTP configuration found - using default values');
      }
    } catch (error) {
      console.error('Error detecting NTP configuration:', error);
      console.warn('⚠️ Could not detect NTP configuration, using current form values');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;
    
    // Handle number input validation
    if (type === 'number') {
      // Only allow positive integers
      const numValue = parseInt(value);
      if (value === '' || (numValue >= 0 && Number.isInteger(numValue))) {
        newValue = value === '' ? '' : numValue.toString();
      } else {
        // Don't update if invalid number
        return;
      }
    }
    
    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Validate field on change
    const error = validateField(name, newValue);
    setFieldErrors(prev => ({
      ...prev,
      [name]: error
    }));
    
    // Auto-detect NTP configuration when NTP is enabled
    if (name === 'ntpEnable' && newValue === 'Yes') {
      console.log('📡 NTP enabled - detecting current configuration...');
      detectNtpConfiguration();
    }
  };

  // Helper function to execute Linux commands for SSH and Telnet
  const executeSSHTelnetCommands = async () => {
    const commands = [];
    
    // SSH Configuration
    if (form.sshEnable === 'Yes') {
      // Configure SSH port in sshd_config
      if (form.sshPort) {
        commands.push(`sed -i 's/^#*Port.*/Port ${form.sshPort}/' /etc/ssh/sshd_config`);
      }
      
      // Enable and start SSH service
      commands.push(`systemctl enable sshd 2>/dev/null || systemctl enable ssh 2>/dev/null || true`);
      commands.push(`systemctl restart sshd 2>/dev/null || systemctl restart ssh 2>/dev/null || true`);
      
      // Configure firewall for SSH
      if (form.sshPort) {
        commands.push(`firewall-cmd --permanent --add-port=${form.sshPort}/tcp 2>/dev/null || iptables -A INPUT -p tcp --dport ${form.sshPort} -j ACCEPT 2>/dev/null || true`);
        commands.push(`firewall-cmd --reload 2>/dev/null || iptables-save 2>/dev/null || true`);
      }
      
      // If whitelist IPs provided, configure firewall rules
      if (form.sshWhitelist && form.sshWhitelist.trim()) {
        const whitelistIPs = form.sshWhitelist.split('.').filter(ip => ip.trim());
        whitelistIPs.forEach(ip => {
          commands.push(`firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="${ip.trim()}" port port="${form.sshPort || 22}" protocol="tcp" accept' 2>/dev/null || iptables -A INPUT -p tcp -s ${ip.trim()} --dport ${form.sshPort || 22} -j ACCEPT 2>/dev/null || true`);
        });
        commands.push(`firewall-cmd --reload 2>/dev/null || true`);
      }
    } else {
      // Disable SSH
      commands.push(`systemctl stop sshd 2>/dev/null || systemctl stop ssh 2>/dev/null || true`);
      commands.push(`systemctl disable sshd 2>/dev/null || systemctl disable ssh 2>/dev/null || true`);
      
      // Block SSH port in firewall
      commands.push(`firewall-cmd --permanent --remove-port=22/tcp 2>/dev/null || iptables -D INPUT -p tcp --dport 22 -j ACCEPT 2>/dev/null || true`);
      commands.push(`firewall-cmd --reload 2>/dev/null || true`);
    }
    
    // Telnet Configuration
    if (form.telnetEnable === 'Yes') {
      // Enable and start Telnet service
      commands.push(`systemctl enable telnet.socket 2>/dev/null || systemctl enable xinetd 2>/dev/null || true`);
      commands.push(`systemctl start telnet.socket 2>/dev/null || systemctl start xinetd 2>/dev/null || true`);
      
      // Configure firewall for Telnet (port 23)
      commands.push(`firewall-cmd --permanent --add-port=23/tcp 2>/dev/null || iptables -A INPUT -p tcp --dport 23 -j ACCEPT 2>/dev/null || true`);
      commands.push(`firewall-cmd --reload 2>/dev/null || true`);
      
      // If whitelist IPs provided, configure firewall rules
      if (form.telnetWhitelist && form.telnetWhitelist.trim()) {
        const whitelistIPs = form.telnetWhitelist.split('.').filter(ip => ip.trim());
        whitelistIPs.forEach(ip => {
          commands.push(`firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="${ip.trim()}" port port="23" protocol="tcp" accept' 2>/dev/null || iptables -A INPUT -p tcp -s ${ip.trim()} --dport 23 -j ACCEPT 2>/dev/null || true`);
        });
        commands.push(`firewall-cmd --reload 2>/dev/null || true`);
      }
    } else {
      // Disable Telnet
      commands.push(`systemctl stop telnet.socket 2>/dev/null || systemctl stop xinetd 2>/dev/null || true`);
      commands.push(`systemctl disable telnet.socket 2>/dev/null || systemctl disable xinetd 2>/dev/null || true`);
      
      // Block Telnet port in firewall
      commands.push(`firewall-cmd --permanent --remove-port=23/tcp 2>/dev/null || iptables -D INPUT -p tcp --dport 23 -j ACCEPT 2>/dev/null || true`);
      commands.push(`firewall-cmd --reload 2>/dev/null || true`);
    }
    
    // Execute all commands
    const results = [];
    for (const cmd of commands) {
      try {
        console.log('Executing SSH/Telnet command:', cmd);
        const response = await postLinuxCmd({ cmd: cmd.trim() });
        
        const isSuccess = response.response === true;
        console.log(`Command result - Success: ${isSuccess}, Output: "${response.responseData || '(no output)'}"`);
        
        results.push({ 
          cmd, 
          success: isSuccess, 
          output: response.responseData || '(no output)',
          rawResponse: response
        });
      } catch (err) {
        console.error('Error executing command:', cmd, err);
        
        const isTimeout = err.message?.includes('timeout') || err.code === 'ECONNABORTED';
        const hasFailsafe = cmd.includes('|| true');
        
        if (isTimeout && hasFailsafe) {
          console.warn(`Command timed out but has failsafe (|| true): ${cmd}`);
          results.push({ 
            cmd, 
            success: true,
            output: '(command timed out, but failsafe present)',
            warning: 'timeout',
            error: err.message 
          });
        } else {
          results.push({ cmd, success: false, error: err.message });
        }
      }
    }
    
    console.log('SSH/Telnet command results:', results);
    return results;
  };

  // Helper function to execute Linux commands for Time Parameters
  const executeTimeParametersCommands = async () => {
    const commands = [];
    
    // NTP Configuration using Chrony
    if (form.ntpEnable === 'Yes') {
      // Configure Chrony NTP server
      // First, backup existing config (try both common paths)
      commands.push(`cp /etc/chrony/chrony.conf /etc/chrony/chrony.conf.bak 2>/dev/null || cp /etc/chrony.conf /etc/chrony.conf.bak 2>/dev/null || true`);
      
      // Remove any existing server lines and add new NTP server
      commands.push(`sed -i '/^server /d' /etc/chrony/chrony.conf 2>/dev/null || sed -i '/^server /d' /etc/chrony.conf 2>/dev/null || true`);
      commands.push(`echo "server ${form.ntpServerAddress} iburst" >> /etc/chrony/chrony.conf 2>/dev/null || echo "server ${form.ntpServerAddress} iburst" >> /etc/chrony.conf`);
      
      // Enable chronyd service (with timeout protection using 'timeout' command)
      commands.push(`timeout 5 systemctl enable chronyd 2>/dev/null || timeout 5 systemctl enable chrony 2>/dev/null || true`);
      
      // Restart chronyd service to apply new configuration
      commands.push(`systemctl restart chronyd 2>/dev/null || systemctl restart chrony 2>/dev/null || true`);
      
      // Force immediate synchronization
      commands.push(`chronyc makestep 2>/dev/null || true`);
      
      // Set synchronizing cycle (in seconds) - chrony syncs automatically but we can force periodic sync
      if (form.synchronizingCycle) {
        const minutes = Math.floor(parseInt(form.synchronizingCycle) / 60);
        if (minutes > 0) {
          commands.push(`echo "*/${minutes} * * * * /usr/bin/chronyc makestep" > /etc/cron.d/chrony-sync`);
          commands.push(`chmod 644 /etc/cron.d/chrony-sync`);
        }
      }
    } else {
      // Disable NTP - Remove server lines from chrony config
      commands.push(`sed -i '/^server /d' /etc/chrony/chrony.conf 2>/dev/null || sed -i '/^server /d' /etc/chrony.conf 2>/dev/null || true`);
      
      // Stop chronyd service
      commands.push(`systemctl stop chronyd 2>/dev/null || systemctl stop chrony 2>/dev/null || true`);
      commands.push(`timeout 5 systemctl disable chronyd 2>/dev/null || timeout 5 systemctl disable chrony 2>/dev/null || true`);
      
      // Remove chrony sync cron job
      commands.push(`rm -f /etc/cron.d/chrony-sync`);
    }
    
    // Daily Restart Configuration
    if (form.dailyRestart === 'Yes') {
      // Create cron job for daily restart at specified time
      const restartCmd = `${form.restartMinute} ${form.restartHour} * * * /sbin/reboot`;
      commands.push(`echo "${restartCmd}" > /etc/cron.d/daily-restart`);
      commands.push(`chmod 644 /etc/cron.d/daily-restart`);
    } else {
      // Remove daily restart cron job
      commands.push(`rm -f /etc/cron.d/daily-restart`);
    }
    
    // System Time Modification
    if (form.modifyTime && form.systemTime) {
      // Format: YYYY-MM-DDTHH:mm:ss to "YYYY-MM-DD HH:mm:ss"
      // If no seconds, add :00
      let dateTimeStr = form.systemTime.replace('T', ' ');
      if (!dateTimeStr.includes(':') || dateTimeStr.split(':').length === 2) {
        dateTimeStr += ':00';
      }
      commands.push(`date -s "${dateTimeStr}"`);
      commands.push(`hwclock --systohc`);
    }
    
    // Time Zone Configuration
    if (form.timeZone) {
      // Map GMT+5:30 to Asia/Kolkata (adjust based on your system)
      const tzMap = {
        'GMT+5:30': 'Asia/Kolkata',
        // Add more timezone mappings as needed
      };
      const timezone = tzMap[form.timeZone] || 'Asia/Kolkata';
      commands.push(`timedatectl set-timezone ${timezone}`);
    }
    
    // Execute all commands
    const results = [];
    for (const cmd of commands) {
      try {
        console.log('Executing Linux command:', cmd);
        const response = await postLinuxCmd({ cmd: cmd.trim() });
        
        // Check if response indicates success
        // Note: response.response === true means command executed successfully
        // Empty responseData is normal for many Linux commands
        const isSuccess = response.response === true;
        
        console.log(`Command result - Success: ${isSuccess}, Output: "${response.responseData || '(no output)'}"`);
        
        results.push({ 
          cmd, 
          success: isSuccess, 
          output: response.responseData || '(no output)',
          rawResponse: response
        });
      } catch (err) {
        console.error('Error executing command:', cmd, err);
        
        // Check if it's a timeout error - these are often not critical if command has || true
        const isTimeout = err.message?.includes('timeout') || err.code === 'ECONNABORTED';
        const hasFailsafe = cmd.includes('|| true');
        
        // If command has failsafe (|| true), treat timeout as non-critical
        if (isTimeout && hasFailsafe) {
          console.warn(`Command timed out but has failsafe (|| true): ${cmd}`);
          results.push({ 
            cmd, 
            success: true, // Treat as success since it has failsafe
            output: '(command timed out, but failsafe present)',
            warning: 'timeout',
            error: err.message 
          });
        } else {
          results.push({ cmd, success: false, error: err.message });
        }
      }
    }
    
    console.log('All command results:', results);
    return results;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Validate all fields before saving
    const errors = {};
    Object.keys(form).forEach(fieldName => {
      const error = validateField(fieldName, form[fieldName]);
      if (error) {
        errors[fieldName] = error;
      }
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please fix the validation errors before saving.');
      return;
    }
    
    // Warn about system time modification
    if (form.modifyTime && form.systemTime) {
      const selectedDate = new Date(form.systemTime);
      const currentDate = new Date();
      
      // Check if setting time to future
      if (selectedDate > currentDate) {
        const timeDiff = Math.abs(selectedDate - currentDate);
        const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
        
        const confirmMsg = `⚠️ WARNING: Changing System Time to Future\n\n` +
          `You are setting the system time ${hoursDiff} hour(s) ahead.\n\n` +
          `This may cause issues with:\n` +
          `• Your login session (you may be logged out)\n` +
          `• Authentication tokens\n` +
          `• Scheduled tasks\n\n` +
          `Do you want to continue?`;
        
        if (!window.confirm(confirmMsg)) {
          console.log('❌ System time change cancelled by user');
          return;
        }
      }
      
      // Check if setting time to far past
      if (currentDate - selectedDate > 24 * 60 * 60 * 1000) { // More than 1 day in past
        const confirmMsg = `⚠️ WARNING: Changing System Time to Past\n\n` +
          `You are setting the system time to the past.\n\n` +
          `This may cause issues with:\n` +
          `• SSL/TLS certificates\n` +
          `• Authentication\n` +
          `• System logs\n\n` +
          `Do you want to continue?`;
        
        if (!window.confirm(confirmMsg)) {
          console.log('❌ System time change cancelled by user');
          return;
        }
      }
    }

    try {
      setLoading(true);
      setError("");
      setFieldErrors({});
      
      // Execute Linux CLI commands for SSH and Telnet
      console.log('🔧 Executing SSH/Telnet commands via Linux CLI...');
      const sshTelnetResults = await executeSSHTelnetCommands();
      
      // Execute Linux CLI commands for Time Parameters
      console.log('🔧 Executing Time Parameters via Linux CLI...');
      const timeResults = await executeTimeParametersCommands();
      
      // Combine all results
      const cmdResults = [...sshTelnetResults, ...timeResults];
      
      // Check if any command failed
      const failedCommands = cmdResults.filter(r => !r.success);
      const warningCommands = cmdResults.filter(r => r.warning === 'timeout');
      
      if (failedCommands.length > 0) {
        console.error('Failed commands:', failedCommands);
        const failedDetails = failedCommands.map(f => `${f.cmd}: ${f.error || 'Unknown error'}`).join('\n');
        console.error('Failed command details:', failedDetails);
        setError(`Some commands failed (${failedCommands.length}/${cmdResults.length}). Check console for details.`);
      } else if (warningCommands.length > 0) {
        console.warn(`⚠️ ${warningCommands.length} command(s) timed out but have failsafes`);
        console.log(`✅ All ${cmdResults.length} commands completed (${warningCommands.length} with timeouts but failsafes)`);
      } else {
        console.log(`✅ All ${cmdResults.length} commands executed successfully`);
      }
      
      // Format the data according to the expected API structure
      const saveData = {
        webConfig: {
          webPort: form.webPort,
          webAccess: form.webAccess,
          webIpAddress: form.webIpAddress,
          webTimeout: form.webTimeout,
          webWhitelist: form.webWhitelist
        },
        sshEnable: form.sshEnable,
        sshPort: form.sshPort,
        sshWhitelist: form.sshWhitelist,
        remoteDataCapture: form.remoteDataCapture,
        captureRtp: form.captureRtp,
        captureRtpInterface: form.captureRtpInterface,
        ftpEnable: form.ftpEnable,
        ftpWhitelist: form.ftpWhitelist,
        telnetEnable: form.telnetEnable,
        telnetWhitelist: form.telnetWhitelist,
        watchdogEnable: form.watchdogEnable,
        syslogEnable: form.syslogEnable,
        syslogServerAddress: form.syslogServerAddress,
        syslogLevel: form.syslogLevel,
        cdrEnable: form.cdrEnable,
        cdrServerAddress: form.cdrServerAddress,
        cdrServerPort: form.cdrServerPort,
        cdrSendFailed: form.cdrSendFailed,
        cdrContent: form.cdrContent,
        cdrHangup: form.cdrHangup,
        cdrAddLanIp: form.cdrAddLanIp,
        cdrKeepRouting: form.cdrKeepRouting,
        cdrSendNumberClass: form.cdrSendNumberClass,
        cdrDebugPhp: form.cdrDebugPhp,
        cdrAllowDeny: form.cdrAllowDeny,
        cdrServerIp: form.cdrServerIp,
        cdrServerPortClass: form.cdrServerPortClass,
        accessDebugPhp: form.accessDebugPhp,
        ntpEnable: form.ntpEnable,
        ntpServerAddress: form.ntpServerAddress,
        synchronizingCycle: form.synchronizingCycle,
        dailyRestart: form.dailyRestart,
        restartHour: form.restartHour,
        restartMinute: form.restartMinute,
        systemTime: form.systemTime,
        modifyTime: form.modifyTime,
        timeZone: form.timeZone
      };
      
      // Log what we're saving
      console.log(`💾 Saving: NTP ${saveData.ntpEnable === 'Yes' ? 'ENABLED ✓' : 'DISABLED ✗'}`);
      
      const response = await saveManagementParameters(saveData);
      
      if (response.response === true) {
        // Determine what was updated based on form values
        const updatedItems = [];
        if (form.sshEnable === 'Yes') updatedItems.push('SSH configuration');
        if (form.telnetEnable === 'Yes') updatedItems.push('Telnet configuration');
        if (form.ntpEnable === 'Yes') updatedItems.push('NTP configuration');
        if (form.dailyRestart === 'Yes') updatedItems.push('Daily restart schedule');
        if (form.modifyTime) updatedItems.push('System time');
        
        // Build user-friendly message
        let message = '✅ Settings saved successfully!\n\n';
        
        if (updatedItems.length > 0) {
          message += 'Updated:\n';
          updatedItems.forEach(item => {
            message += `• ${item}\n`;
          });
        } else {
          message += 'Management parameters updated.';
        }
        
        if (failedCommands.length > 0) {
          message = `⚠️ Settings saved to database, but some configurations failed.\n\nCheck console for details.`;
        } else if (warningCommands.length > 0) {
          message += `\nNote: Some commands timed out but were skipped safely.`;
        }
        
        // Add warning if system time was changed
        const systemTimeChanged = form.modifyTime && form.systemTime;
        if (systemTimeChanged) {
          const selectedDate = new Date(form.systemTime);
          const currentDate = new Date();
          if (selectedDate > currentDate) {
            message += `\n\n⚠️ Note: If you are logged out, please log back in.\nSystem time changes can affect authentication.`;
          }
        }
        
        alert(message);
        
        // If system time was changed, reload page to update navbar immediately
        if (systemTimeChanged) {
          console.log('🔄 System time changed - reloading page to update navbar...');
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          // Refresh data after save
          await fetchManagementData();
        }
      } else {
        throw new Error(response.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving management parameters:', error);
      
      let errorMessage = 'Failed to save management settings.';
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = 'Save operation timed out. Please check your connection and try again.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid configuration. Please check your settings and try again.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error during save. Please try again later or contact support.';
      } else if (error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
        errorMessage = 'Network connection failed during save. Please check your connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      setLoading(true);
      setError("");
      setFieldErrors({});
      
      console.log('Resetting management parameters...');
      const resetResponse = await resetManagementParameters();
      
      if (resetResponse.response === true) {
        console.log('Reset successful, fetching default values...');
        // After successful reset, fetch the default values
        await fetchManagementData();
      } else {
        throw new Error(resetResponse.message || 'Reset operation failed');
      }
    } catch (error) {
      console.error('Error resetting management parameters:', error);
      
      let errorMessage = 'Failed to reset management settings.';
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = 'Reset operation timed out. Please check your connection and try again.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error during reset. Please try again later or contact support.';
      } else if (error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
        errorMessage = 'Network connection failed during reset. Please check your connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
      // Fallback to initial form values
      setForm(MANAGEMENT_INITIAL_FORM);
      setFormKey(k => k + 1);
    } finally {
      setLoading(false);
    }
  };



  
  // Helper to render System Time row with Modify checkbox and date/time input inline
  const renderSystemTimeInline = (field, nextField) => (
    <div className="flex items-center justify-center" style={{ minHeight: 32 }}>
      <div className="flex items-center" style={{width: '560px'}}>
        <label className="text-[12px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:220, marginRight:60}}>
          {field.label}
        </label>
        <div style={{width: 320}}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full">
            <div className="flex flex-row items-center gap-2">
              <input
                type="checkbox"
                name={nextField.name}
                checked={!!form[nextField.name]}
                onChange={handleChange}
                className="w-4 h-4 mr-2 accent-blue-600"
                style={{ backgroundColor: '#ffffff' }}
              />
              <span className="text-gray-800 mr-2" style={{ fontSize: '12px' }}>{nextField.label}</span>
            </div>
            <TextField
              variant="outlined"
              size="small"
              name={field.name}
              type="datetime-local"
              value={form[field.name] ? form[field.name].replace(' ', 'T') : ''}
              onChange={handleChange}
              className="w-full sm:w-auto"
              sx={{ 
                minWidth: 0, 
                maxWidth: 200, 
                flex: 1,
                backgroundColor: '#ffffff',
                '& .MuiOutlinedInput-root': {
                  fontSize: '12px',
                  height: '32px',
                  backgroundColor: '#ffffff'
                }
              }}
              InputProps={{ readOnly: !form[nextField.name] }}
              inputProps={{ step: 1 }}
              error={!!fieldErrors[field.name]}
              helperText=""
            />
          </div>
        </div>
      </div>
    </div>
  );



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
          {typeof error === 'string' ? error : JSON.stringify(error)}
        </Alert>
      )}


      <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        
        {/* Blue bar header OUTSIDE the border */}
        <div style={blueBarStyle}>Management Parameters</div>
        
        {/* Main bordered box (no blue bar inside) */}
        <div className="border-2 border-gray-400" style={{backgroundColor: "#dde0e4"}}>
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px] bg-white">
              <div className="text-center">
                <CircularProgress size={40} sx={{ color: '#0e8fd6' }} />
                <div className="mt-3 text-gray-600">Loading management parameters...</div>
              </div>
            </div>
          ) : (
            <form key={formKey} onSubmit={handleSave} className="w-full flex flex-col gap-0 px-2 md:px-8 py-6" style={{backgroundColor: "#dde0e4"}}>
          <div className="w-full max-w-3xl mx-auto">
            {MANAGEMENT_SECTIONS.map((section, idx) => (
              <div key={section.section} className="w-full mb-4">
                <div className="text-gray-800 mb-1 mt-1 ml-2 font-medium" style={{ fontSize: '14px' }}>{section.section}</div>
                <div className="space-y-2">
                  {section.fields.map((field, fieldIdx) => {
                    // Check if field should be conditionally hidden (single condition)
                    if (field.conditional && form[field.conditional] !== field.conditionalValue) {
                      // Handle array conditional values (e.g., ['whitelist', 'blacklist'])
                      if (Array.isArray(field.conditionalValue) && !field.conditionalValue.includes(form[field.conditional])) {
                        return null;
                      }
                      // Handle single conditional value
                      if (!Array.isArray(field.conditionalValue)) {
                        return null;
                      }
                    }
                    // Support multiple conditions via conditionalAll: [{ name, value }]
                    if (Array.isArray(field.conditionalAll)) {
                      const allOk = field.conditionalAll.every(c => form[c.name] === c.value);
                      if (!allOk) return null;
                    }
                    
                    // Special case: System Time + Modify inline in the same row
                    if (
                      field.name === 'systemTime' &&
                      section.fields[fieldIdx + 1] &&
                      section.fields[fieldIdx + 1].name === 'modifyTime'
                    ) {
                      return renderSystemTimeInline(
                        field,
                        section.fields[fieldIdx + 1]
                      );
                    }
                    // Skip rendering the modifyTime row (handled above)
                    if (field.name === 'modifyTime' && section.fields[fieldIdx - 1] && section.fields[fieldIdx - 1].name === 'systemTime') {
                      return null;
                    }
                    // Default rendering
                    return (
                      <div key={section.section + field.name} className="flex items-center justify-center" style={{ minHeight: 32 }}>
                        <div className="flex items-center" style={{width: '560px'}}>
                          <label className="text-[12px] text-gray-700 font-medium whitespace-nowrap text-left" style={{width:220, marginRight:60}}>
                            {field.label}
                          </label>
                          <div style={{width: 320}}>
                              {field.type === 'text' && (
                                <TextField
                                  variant="outlined"
                                  size="small"
                                  name={field.name}
                                  value={form[field.name]}
                                  onChange={handleChange}
                                  sx={{ 
                                    backgroundColor: '#ffffff',
                                    '& .MuiOutlinedInput-root': {
                                      fontSize: '12px',
                                      height: '32px',
                                      backgroundColor: '#ffffff'
                                    }
                                  }}
                                  fullWidth
                                  error={!!fieldErrors[field.name]}
                                  helperText={(field.name === 'webIpAddress' || field.name === 'syslogServerAddress' || field.name === 'cdrServerAddress' || field.name === 'cdrServerIp' || field.name === 'ntpServerAddress') ? '' : (fieldErrors[field.name] || '')}
                                  // Add number input type for specific fields
                                  type={
                                    field.name === 'webPort' || 
                                    field.name === 'webTimeout' || 
                                    field.name === 'sshPort' ||
                                    field.name === 'synchronizingCycle'
                                      ? 'number' 
                                      : 'text'
                                  }
                                  // Add input props for number fields
                                  inputProps={
                                    (field.name === 'webPort' || 
                                     field.name === 'webTimeout' || 
                                     field.name === 'sshPort' ||
                                     field.name === 'synchronizingCycle') 
                                      ? {
                                          min: 1,
                                          max: field.name === 'webTimeout' ? 3600 : field.name === 'synchronizingCycle' ? 86400 : 65535,
                                          step: 1
                                        }
                                      : {}
                                  }
                                />
                              )}
                              {/* Add helper text for IP address fields */}
                              {(field.name === 'webWhitelist' || field.name === 'sshWhitelist' || field.name === 'ftpWhitelist' || field.name === 'telnetWhitelist') && (
                                <span className="text-xs text-gray-600 mt-1 ml-1">IP addresses are separated by '.'</span>
                              )}
                              {field.name === 'webIpAddress' && (
                                <span className="text-xs text-gray-600 mt-1 ml-1">IP addresses are separated by ','</span>
                              )}
                              {field.unit && (
                                <span className="text-xs text-gray-600 mt-1 ml-1">{field.unit}</span>
                              )}
                              {fieldErrors[field.name] && (
                                <div className="text-red-600 text-xs mt-1 ml-1">
                                  {fieldErrors[field.name]}
                                </div>
                              )}
                              {field.type === 'textarea' && (
                                <TextField
                                  variant="outlined"
                                  size="small"
                                  name={field.name}
                                  value={form[field.name]}
                                  onChange={handleChange}
                                  sx={{ 
                                    backgroundColor: '#ffffff',
                                    '& .MuiOutlinedInput-root': {
                                      fontSize: '12px',
                                      backgroundColor: '#ffffff'
                                    }
                                  }}
                                  fullWidth
                                  multiline
                                  minRows={2}
                                  error={!!fieldErrors[field.name]}
                                  helperText={(field.name === 'webIpAddress' || field.name === 'webWhitelist' || field.name === 'sshWhitelist' || field.name === 'ftpWhitelist' || field.name === 'telnetWhitelist') ? '' : (fieldErrors[field.name] || '')}
                                />
                              )}
                              {field.type === 'select' && (
                                <Select
                                  value={form[field.name]}
                                  name={field.name}
                                  onChange={handleChange}
                                  size="small"
                                  variant="outlined"
                                  sx={{ 
                                    backgroundColor: '#ffffff',
                                    '& .MuiOutlinedInput-root': {
                                      fontSize: '12px',
                                      height: '30px',
                                      backgroundColor: '#ffffff'
                                    }
                                  }}
                                  fullWidth
                                  error={!!fieldErrors[field.name]}
                                >
                                  {(() => {
                                    const options = field.name === 'captureRtpInterface'
                                      ? [
                                          { value: 'lan1', label: lanIps.lan1 ? `LAN1: ${lanIps.lan1}` : 'LAN 1' },
                                          { value: 'lan2', label: lanIps.lan2 ? `LAN2: ${lanIps.lan2}` : 'LAN 2' },
                                        ]
                                      : field.options;
                                    return options.map(opt => (
                                      <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '12px' }}>{opt.label}</MenuItem>
                                    ));
                                  })()}
                                </Select>
                              )}
                              {field.type === 'radio' && (
                                <div className="flex items-center gap-4">
                                  {field.options.map(opt => (
                                    <label key={opt} className="flex items-center gap-1">
                                      <input
                                        type="radio"
                                        name={field.name}
                                        value={opt}
                                        checked={form[field.name] === opt}
                                        onChange={handleChange}
                                        className="w-4 h-4 accent-blue-600"
                                        style={{ backgroundColor: '#ffffff' }}
                                      />
                                      <span style={{ fontSize: '12px', color: '#374151' }}>{opt}</span>
                                    </label>
                                  ))}
                                </div>
                              )}
                              {field.type === 'checkbox' && (
                                <input
                                  type="checkbox"
                                  name={field.name}
                                  checked={!!form[field.name]}
                                  onChange={handleChange}
                                  className="w-4 h-4 mr-2 accent-blue-600"
                                  style={{ backgroundColor: '#ffffff' }}
                                />
                              )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          </form>
          )}
        </div>
        
        {/* Buttons OUTSIDE the border */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8 w-full">
          <Button
            type="submit"
            variant="contained"
            sx={blueButtonSx}
            onClick={handleSave}
            disabled={loading}
            className="sm:w-auto"
          >
            Save
          </Button>
          <Button
            type="button"
            variant="contained"
            onClick={handleReset}
            sx={grayButtonSx}
            disabled={loading}
            className="sm:w-auto"
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Management; 