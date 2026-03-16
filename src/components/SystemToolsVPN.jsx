import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { VPN_TYPES, SYSTEM_TOOLS_VPN_INITIAL, VPN_RUNNING_INFO } from '../constants/SystemToolsVPNConstants';
import { 
  Button, 
  Select, 
  MenuItem, 
  TextField, 
  Paper, 
  Typography, 
  Alert, 
  CircularProgress,
  Chip,
  IconButton
} from '@mui/material';
import {
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Upload as UploadIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { 
  uploadOpenVpnFile, startOpenVpn, stopOpenVpn, getOpenVpnStatus, getOpenVpnLogs,
  seCreateVpn, seConnectVpn, seDisconnectVpn, seVpnEnable, seVpnDisable,
  seVpnSetCert, seAutoStartEnable, seAutoStartDisable, seVpnList, seVpnStatus,
  seVpnDelete, seVpnState
} from '../api/apiService';

const blueButtonSx = {
  background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
  color: '#fff',
  fontWeight: 600,
  fontSize: 16,
  borderRadius: 1.5,
  minWidth: 120,
  boxShadow: '0 2px 6px #0002',
  textTransform: 'none',
  px: 3,
  py: 1.5,
  padding: '6px 28px',
  border: '1px solid #0e8fd6',
  '&:hover': {
    background: 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)',
    color: '#fff',
  },
};

const grayButtonSx = {
  background: 'linear-gradient(to bottom, #e0e0e0 0%, #bdbdbd 100%)',
  color: '#222',
  fontSize: 15,
  borderRadius: 3,
  minWidth: 110,
  minHeight: 36,
  boxShadow: 'none',
  border: '1px solid #888',
  fontWeight: 400,
  textTransform: 'none',
  px: 2,
  '&:hover': {
    background: 'linear-gradient(to bottom, #bdbdbd 0%, #e0e0e0 100%)',
    boxShadow: 'none',
    border: '1px solid #888',
  },
};

const SystemToolsVPN = () => {
  const [form, setForm] = useState(SYSTEM_TOOLS_VPN_INITIAL);
  const [showAdvanced, setShowAdvanced] = useState(true); // Hidden when disabled via toggle
  const [runningInfo, setRunningInfo] = useState(VPN_RUNNING_INFO);
  
  // OpenVPN specific states
  const [vpnStatus, setVpnStatus] = useState('Unknown');
  const [vpnLogs, setVpnLogs] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState({
    upload: false,
    start: false,
    stop: false,
    status: false,
    logs: false,
    toggle: false,
    seCreate: false,
    seConnect: false,
    seDisconnect: false,
    seStatus: false,
    seList: false,
    seDelete: false,
    seState: false
  });

  // SoftEther form
  const [seForm, setSeForm] = useState({
    connectionName: '', server: '', hub: '', username: '', password: '', port: '', clientIp: '', netmask: ''
  });
  const [authMethod, setAuthMethod] = useState('password'); // 'password' | 'certificate'
  const [seCertFile, setSeCertFile] = useState(null);
  const [seKeyFile, setSeKeyFile] = useState(null);
  const [seStatus, setSeStatus] = useState('Unknown');
  const [seAccounts, setSeAccounts] = useState([]);
  const [seLogs, setSeLogs] = useState('');
  const [isProfileCreated, setIsProfileCreated] = useState(false); // Track if profile is created

  const appendSeLog = (text) => {
    const ts = new Date().toLocaleString();
    setSeLogs(prev => `${prev}${prev ? '\n' : ''}[${ts}] ${text}`);
  };

  // ---- Persistence helpers for SoftEther single-profile ----
  const saveSeProfile = (profile) => {
    try {
      localStorage.setItem('seProfile', JSON.stringify(profile));
    } catch {}
  };

  const loadSeProfile = () => {
    try {
      const raw = localStorage.getItem('seProfile');
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setForm((prev) => ({ ...prev, vpnType: newType }));
    // Always show advanced options for OpenVPN and SoftEtherVPN
    setShowAdvanced(true);
  };

  const handleCertChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setForm((prev) => ({ ...prev, vpnCertName: e.target.files[0].name }));
    } else {
      setSelectedFile(null);
      setForm((prev) => ({ ...prev, vpnCertName: 'No file chosen' }));
    }
  };

  // ---------------- SoftEther helpers ----------------
  const handleSeChange = (field) => (e) => setSeForm(prev => ({ ...prev, [field]: e.target.value }));
  const handleSeCert = (e) => setSeCertFile(e.target.files?.[0] || null);
  const handleSeKey = (e) => setSeKeyFile(e.target.files?.[0] || null);

  const isCertValid = (file) => !!file && (/\.(cer|crt)$/i).test(file.name || '');
  const isKeyValid = (file) => !!file && (/\.key$/i).test(file.name || '');
  const areSeFieldsFilled = () => {
    const { connectionName, server, hub, username, password, port } = seForm;
    const commonOk = [connectionName, server, hub, username, password, port].every(v => String(v || '').trim().length > 0);
    if (!commonOk) return false;
    if (authMethod === 'certificate') {
      return isCertValid(seCertFile) && isKeyValid(seKeyFile);
    }
    return true; // password auth - all fields already checked above
  };

  const handleSeCreateFlow = async () => {
    // Check if OpenVPN is running
    if (vpnStatus === 'Running') {
      window.alert('OpenVPN is currently running. Please stop OpenVPN first before starting SoftEther VPN.');
      return;
    }
    
    // Front-end validations
    if (!areSeFieldsFilled()) {
      showMessage('error', 'Please fill all fields (Connection Name, Server, Port, HUB, Username, Password).');
      return;
    }
    // Only validate certificate files if using certificate authentication
    if (authMethod === 'certificate') {
      if (!isCertValid(seCertFile)) {
        showMessage('error', 'Please upload a valid certificate file (.cer or .crt).');
        return;
      }
      if (!isKeyValid(seKeyFile)) {
        showMessage('error', 'Please upload a valid key file (.key).');
        return;
      }
    }
    try {
      setLoading(prev=>({ ...prev, seCreate: true }));
      
      // Create new connection
      const resCreate = await seCreateVpn({ ...seForm });
      if (resCreate?.message) appendSeLog(`Create: ${resCreate.message}`);
      
      // If certificate method chosen, set certificate after creation
      if (authMethod === 'certificate') {
        try {
          const r = await seVpnSetCert(seForm.connectionName, seCertFile, seKeyFile);
          if (r?.message) appendSeLog(`SetCert: ${r.message}`);
          if (r?.output) appendSeLog(r.output);
        } catch (certError) {
          appendSeLog(`Certificate upload failed: ${certError.message}`);
          showMessage('error', 'Certificate upload failed. Please check your certificate files.');
          return;
        }
      }
      
      // Connect
      const resConn = await seConnectVpn(seForm.connectionName);
      if (resConn?.message) appendSeLog(`Connect: ${resConn.message}`);
      
      // Enable client on boot and autostart this profile
      const en = await seVpnEnable(); 
      if (en?.message) appendSeLog(`Enable: ${en.message}`);
      
      const ae = await seAutoStartEnable(seForm.connectionName); 
      if (ae?.message) appendSeLog(`Autostart: ${ae.message}`);
      
      showMessage('success', 'Profile created and connected with autostart enabled');
      
      // Mark profile as created and make fields read-only
      setIsProfileCreated(true);
      // Persist profile locally with all details
      const profileToSave = {
        connectionName: seForm.connectionName,
        server: seForm.server,
        hub: seForm.hub,
        username: seForm.username,
        password: seForm.password,
        port: seForm.port,
        authMethod: authMethod,
        clientIp: seForm.clientIp,
        netmask: seForm.netmask
      };
      console.log('Saving profile:', profileToSave);
      saveSeProfile(profileToSave);
      
      // Immediately check status after successful connection
      // Use the connection name directly to avoid state timing issues
      const connectionName = seForm.connectionName;
      setTimeout(async () => {
        try {
          setLoading(prev=>({ ...prev, seStatus: true }));
          const res = await seVpnStatus(connectionName);
          
          if (res?.error) {
            setSeStatus('Stopped');
            appendSeLog(`Status API Error: ${res.error}`);
          } else {
            const rawText = (res?.status || res?.output || res?.responseData || res?.message || '').toString();
            if (rawText) {
              appendSeLog(rawText);
            }
            
            if (rawText || (res && (res.responseData || res.message))) {
              const statusText = (rawText || res.responseData || res.message || 'Unknown').toString();
              const statusLower = statusText.toLowerCase();
              
              if (
                statusLower.includes('running') ||
                statusLower.includes('connected') ||
                statusLower.includes('established') ||
                statusLower.includes('the command completed successfully') ||
                statusLower.includes('session status')
              ) {
                setSeStatus('Running');
              } else if (
                statusLower.includes('stopped') ||
                statusLower.includes('offline') ||
                statusLower.includes('disconnected')
              ) {
                setSeStatus('Stopped');
              } else if (statusLower.includes('connecting') || statusLower.includes('retrying')) {
                setSeStatus('Connecting');
              } else {
                setSeStatus('Unknown');
              }
            } else {
              setSeStatus('Unknown');
            }
          }
        } catch (e) {
          console.error('Error getting SoftEther status after creation:', e);
          if (e.response && e.response.status === 500) {
            setSeStatus('Stopped');
            appendSeLog(`Status API Error: ${e.message}`);
          } else {
            setSeStatus('Unknown');
            appendSeLog(`Status API Error: ${e.message}`);
          }
        } finally {
          setLoading(prev=>({ ...prev, seStatus: false }));
        }
      }, 1000); // Wait 1 second for connection to establish
    } catch (e) {
      console.error('SoftEther create/connect error:', e);
      showMessage('error', e?.message || 'SoftEther create/connect failed');
    } finally {
      setLoading(prev=>({ ...prev, seCreate: false }));
    }
  };

  const handleSeDisconnect = async () => {
    if (!seForm.connectionName.trim()) {
      showMessage('error', 'Please enter Connection Name to disconnect.');
      return;
    }
    try {
      setLoading(prev=>({ ...prev, seDisconnect: true }));
      await seDisconnectVpn(seForm.connectionName.trim());
      
      // Disable VPN client and autostart so it doesn't start automatically after reboot
      try {
        await seVpnDisable();
        appendSeLog(`Disable: VPN client disabled`);
        
        await seAutoStartDisable(seForm.connectionName.trim());
        appendSeLog(`Autostart: Disabled for ${seForm.connectionName}`);
        
        // Update localStorage to reflect autostart is disabled
        try { localStorage.setItem('softetherAutoStart', 'no'); } catch {}
        setEnableSeChoice('no');
        setShowSeAdvanced(false);
      } catch (disableError) {
        console.error('Error disabling SoftEther autostart:', disableError);
        appendSeLog(`Autostart disable warning: ${disableError.message}`);
        // Don't fail the whole operation if autostart disable fails
      }
      
      showMessage('success', 'VPN disconnected and autostart disabled - profile saved');
      setSeStatus('Stopped');
      // Persist current profile so fields remain intact on refresh/navigation
      saveSeProfile({
        connectionName: seForm.connectionName,
        server: seForm.server,
        hub: seForm.hub,
        username: seForm.username,
        password: seForm.password,
        port: seForm.port,
        authMethod: authMethod,
        clientIp: seForm.clientIp,
        netmask: seForm.netmask
      });
      // Keep profile created state and form data - don't clear them
      await handleSeStatus(false);
    } catch (e) {
      showMessage('error', e?.message || 'SoftEther disconnect failed');
    } finally {
      setLoading(prev=>({ ...prev, seDisconnect: false }));
    }
  };

  const handleSeStatus = async (showError = true) => {
    if (!seForm.connectionName.trim()) {
      if (showError) {
        showMessage('error', 'Please enter Connection Name to check status.');
      }
      return;
    }
    try {
      setLoading(prev=>({ ...prev, seStatus: true }));
      const res = await seVpnStatus(seForm.connectionName);

      // Check if response contains an error field (like the 500 error response)
      if (res?.error) {
        setSeStatus('Stopped');
        appendSeLog(`Status API Error: ${res.error}`);
        // Don't show error message for API errors - just log it
        return;
      }

      // Prefer raw status text if provided by backend
      const rawText = (res?.status || res?.output || res?.responseData || res?.message || '').toString();
      if (rawText) {
        appendSeLog(rawText);
      }

      // Check if we got a valid response (like OpenVPN logic)
      if (rawText || (res && (res.responseData || res.message))) {
        // Get status from any available field
        const statusText = (rawText || res.responseData || res.message || 'Unknown').toString();
        const statusLower = statusText.toLowerCase();

        // Map the status to proper display values (like OpenVPN)
        if (
          statusLower.includes('running') ||
          statusLower.includes('connected') ||
          statusLower.includes('established') ||
          statusLower.includes('the command completed successfully') ||
          statusLower.includes('session status')
        ) {
          setSeStatus('Running');
        } else if (
          statusLower.includes('stopped') ||
          statusLower.includes('offline') ||
          statusLower.includes('disconnected')
        ) {
          setSeStatus('Stopped');
        } else if (statusLower.includes('connecting') || statusLower.includes('retrying')) {
          setSeStatus('Connecting');
        } else if (statusLower.includes('unknown') || statusLower.includes('error')) {
          setSeStatus('Unknown');
        } else {
          setSeStatus('Unknown');
        }

        if (res?.message) appendSeLog(`Status: ${res.message}`);
        if (res?.output && res.output !== rawText) appendSeLog(res.output);
      } else {
        // Only show Unknown if we have no response at all (server not connected)
        setSeStatus('Unknown');
        appendSeLog('Status API returned no valid response');
        // Don't show error message for no response - just log it
      }
    } catch (e) {
      console.error('Error getting SoftEther status:', e);
      
      // Check if it's a 500 error - show "Stopped" instead of "Unknown"
      if (e.response && e.response.status === 500) {
        setSeStatus('Stopped');
        appendSeLog(`Status API Error: ${e.message}`);
        // Don't show error message for 500 status - just log it
      } else if (e.response && e.response.status >= 400) {
        // For other 4xx/5xx errors, show "Stopped" and don't show error message
        setSeStatus('Stopped');
        appendSeLog(`Status API Error: ${e.message}`);
      } else {
        // For network errors or other issues, show "Unknown" and error message
        setSeStatus('Unknown');
        appendSeLog(`Status API Error: ${e.message}`);
        showMessage('error', e?.message || 'Failed to get SoftEther status');
      }
    } finally {
      setLoading(prev=>({ ...prev, seStatus: false }));
    }
  };

  const handleSeList = async () => {
    try {
      setLoading(prev=>({ ...prev, seList: true }));
      const res = await seVpnList();
      setSeAccounts(Array.isArray(res?.accounts) ? res.accounts : []);
    } catch (e) {
      console.error('Error fetching VPN list:', e);
      setSeAccounts([]);
      if (e.message && e.message.includes('Cannot GET /api/vpnlist')) {
        showMessage('error', 'VPN list endpoint not implemented on server yet. Please implement GET /api/vpnlist endpoint.');
      } else {
        showMessage('error', 'Failed to fetch VPN list: ' + (e.message || 'Unknown error'));
      }
    } finally {
      setLoading(prev=>({ ...prev, seList: false }));
    }
  };

  const handleSeConnect = async () => {
    if (!seForm.connectionName.trim()) {
      showMessage('error', 'Please enter Connection Name to connect.');
      return;
    }
    try {
      setLoading(prev=>({ ...prev, seConnect: true }));
      await seConnectVpn(seForm.connectionName);
      
      // Enable VPN client and autostart so it starts automatically after reboot
      try {
        const en = await seVpnEnable();
        if (en?.message) appendSeLog(`Enable: ${en.message}`);
        
        const ae = await seAutoStartEnable(seForm.connectionName);
        if (ae?.message) appendSeLog(`Autostart: ${ae.message}`);
        
        // Update localStorage to reflect autostart is enabled
        try { localStorage.setItem('softetherAutoStart', 'yes'); } catch {}
        setEnableSeChoice('yes');
        setShowSeAdvanced(true);
      } catch (enableError) {
        console.error('Error enabling SoftEther autostart:', enableError);
        appendSeLog(`Autostart enable warning: ${enableError.message}`);
        // Don't fail the whole operation if autostart enable fails
      }
      
      showMessage('success', 'VPN connected successfully with autostart enabled');
      // Immediately check status after connection
      const connectionName = seForm.connectionName;
      setTimeout(async () => {
        try {
          setLoading(prev=>({ ...prev, seStatus: true }));
          const res = await seVpnStatus(connectionName);
          
          if (res?.error) {
            setSeStatus('Stopped');
            appendSeLog(`Status API Error: ${res.error}`);
          } else {
            const rawText = (res?.status || res?.output || res?.responseData || res?.message || '').toString();
            if (rawText) {
              appendSeLog(rawText);
            }
            
            if (rawText || (res && (res.responseData || res.message))) {
              const statusText = (rawText || res.responseData || res.message || 'Unknown').toString();
              const statusLower = statusText.toLowerCase();
              
              if (
                statusLower.includes('running') ||
                statusLower.includes('connected') ||
                statusLower.includes('established') ||
                statusLower.includes('the command completed successfully') ||
                statusLower.includes('session status')
              ) {
                setSeStatus('Running');
              } else if (
                statusLower.includes('stopped') ||
                statusLower.includes('offline') ||
                statusLower.includes('disconnected')
              ) {
                setSeStatus('Stopped');
              } else if (statusLower.includes('connecting') || statusLower.includes('retrying')) {
                setSeStatus('Connecting');
              } else {
                setSeStatus('Unknown');
              }
            } else {
              setSeStatus('Unknown');
            }
          }
        } catch (e) {
          console.error('Error getting SoftEther status after connect:', e);
          if (e.response && e.response.status === 500) {
            setSeStatus('Stopped');
            appendSeLog(`Status API Error: ${e.message}`);
          } else {
            setSeStatus('Unknown');
            appendSeLog(`Status API Error: ${e.message}`);
          }
        } finally {
          setLoading(prev=>({ ...prev, seStatus: false }));
        }
      }, 1000);
    } catch (e) {
      showMessage('error', e?.message || 'SoftEther connect failed');
    } finally {
      setLoading(prev=>({ ...prev, seConnect: false }));
    }
  };

  const handleSeDelete = async (connectionName) => {
    if (!connectionName.trim()) {
      showMessage('error', 'Please enter Connection Name to delete.');
      return;
    }
    
    // Show browser confirmation dialog
    const confirmed = window.confirm(`Are you sure you want to delete the VPN connection "${connectionName}"? This will disconnect the VPN and remove the profile.`);
    if (!confirmed) {
      return;
    }
    
    try {
      setLoading(prev=>({ ...prev, seDelete: true }));
      
      // Disconnect VPN first if it's the current connection
      if (seForm.connectionName === connectionName) {
        try {
          await seDisconnectVpn(connectionName);
          appendSeLog(`Disconnected: ${connectionName}`);
        } catch (disconnectError) {
          console.log('Disconnect failed (may not be connected):', disconnectError);
        }
      }
      
      // Delete the VPN account
      await seVpnDelete(connectionName);
      showMessage('success', 'VPN account deleted successfully');
      
      // Clear form if this was the current connection
      if (seForm.connectionName === connectionName) {
        setSeForm({
          connectionName: '', server: '', hub: '', username: '', password: '', port: '', clientIp: '', netmask: ''
        });
        setSeCertFile(null);
        setSeKeyFile(null);
        setSeStatus('Unknown');
        setSeLogs('');
        setIsProfileCreated(false); // Reset profile created state
        // Remove persisted profile
        try { localStorage.removeItem('seProfile'); } catch {}
        appendSeLog(`Form cleared after deleting connection: ${connectionName}`);
      }
      
      await handleSeList();
    } catch (e) {
      console.error('Error deleting VPN account:', e);
      showMessage('error', e?.message || 'Failed to delete VPN account');
    } finally {
      setLoading(prev=>({ ...prev, seDelete: false }));
    }
  };

  const handleSeState = async () => {
    try {
      setLoading(prev=>({ ...prev, seState: true }));
      const res = await seVpnState();
      if (res?.message) appendSeLog(`VPN State: ${res.message}`);
    } catch (e) {
      console.error('Error getting VPN state:', e);
      showMessage('error', e?.message || 'Failed to get VPN state');
    } finally {
      setLoading(prev=>({ ...prev, seState: false }));
    }
  };


  // Remove selected file
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setForm((prev) => ({ ...prev, vpnCertName: 'No file chosen' }));
    // Reset the file input
    const fileInput = document.getElementById('vpn-file-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Message handling
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // OpenVPN API functions
  const handleFileUpload = async () => {
    // Check if SoftEther VPN is running
    if (seStatus === 'Running' || seStatus === 'Connecting') {
      window.alert('SoftEther VPN is currently running. Please stop SoftEther VPN first before starting OpenVPN.');
      return;
    }
    
    if (!selectedFile) {
      showMessage('error', 'Please select a file first');
      return;
    }

    setLoading(prev => ({ ...prev, upload: true }));
    try {
      const response = await uploadOpenVpnFile(selectedFile);
      if (response.response) {
        showMessage('success', 'OpenVPN configuration file uploaded successfully!');
        setSelectedFile(null);
        setForm((prev) => ({ ...prev, vpnCertName: 'No file chosen' }));

        // Auto-start VPN after a successful upload
        try {
          setLoading(prev => ({ ...prev, start: true }));
          const startRes = await startOpenVpn();
          if (startRes.response) {
            // Enable autostart so VPN starts automatically after reboot
            try {
              await axiosInstance.post('/openvpn_op', { type: 'enable' });
              // Update localStorage to reflect autostart is enabled
              localStorage.setItem('openvpnAutoStart', 'true');
              setEnableChoice('yes');
              setShowAdvanced(true);
            } catch (enableError) {
              console.error('Error enabling OpenVPN autostart:', enableError);
              // Don't fail the whole operation if autostart enable fails
            }
            showMessage('success', 'OpenVPN started automatically after upload with autostart enabled.');
          } else {
            showMessage('error', startRes.message || 'Failed to start OpenVPN after upload');
          }
        } catch (e) {
          showMessage('error', e?.message || 'Failed to start OpenVPN after upload');
        } finally {
          setLoading(prev => ({ ...prev, start: false }));
        }

        // Auto-check status after attempting to start
        try {
          await handleCheckStatus();
        } catch { /* handled inside */ }
      } else {
        showMessage('error', response.message || 'Failed to upload OpenVPN configuration file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      if (error.message === 'Network Error') {
        showMessage('error', 'Network error. Please check your connection.');
      } else {
        showMessage('error', error.message || 'Failed to upload OpenVPN configuration file');
      }
    } finally {
      setLoading(prev => ({ ...prev, upload: false }));
    }
  };

  const handleStartVpn = async () => {
    // Check if SoftEther VPN is running
    if (seStatus === 'Running' || seStatus === 'Connecting') {
      window.alert('SoftEther VPN is currently running. Please stop SoftEther VPN first before starting OpenVPN.');
      return;
    }
    
    setLoading(prev => ({ ...prev, start: true }));
    try {
      const response = await startOpenVpn();
      if (response.response) {
        // Enable autostart so VPN starts automatically after reboot
        try {
          await axiosInstance.post('/openvpn_op', { type: 'enable' });
          // Update localStorage to reflect autostart is enabled
          localStorage.setItem('openvpnAutoStart', 'true');
          setEnableChoice('yes');
          setShowAdvanced(true);
        } catch (enableError) {
          console.error('Error enabling OpenVPN autostart:', enableError);
          // Don't fail the whole operation if autostart enable fails
        }
        showMessage('success', 'OpenVPN started successfully and autostart enabled!');
        // Refresh status after starting
        setTimeout(() => handleCheckStatus(), 1000);
      } else {
        showMessage('error', response.message || 'Failed to start OpenVPN');
      }
    } catch (error) {
      console.error('Error starting VPN:', error);
      if (error.message === 'Network Error') {
        showMessage('error', 'Network error. Please check your connection.');
      } else {
        showMessage('error', error.message || 'Failed to start OpenVPN');
      }
    } finally {
      setLoading(prev => ({ ...prev, start: false }));
    }
  };

  const handleStopVpn = async () => {
    setLoading(prev => ({ ...prev, stop: true }));
    try {
      const response = await stopOpenVpn();
      if (response.response) {
        showMessage('success', 'OpenVPN stopped successfully!');
        // Set status to Stopped immediately
        setVpnStatus('Stopped');
        // Refresh status after stopping
        setTimeout(() => handleCheckStatus(), 1000);
      } else {
        showMessage('error', response.message || 'Failed to stop OpenVPN');
      }
    } catch (error) {
      console.error('Error stopping VPN:', error);
      if (error.message === 'Network Error') {
        showMessage('error', 'Network error. Please check your connection.');
      } else {
        showMessage('error', error.message || 'Failed to stop OpenVPN');
      }
    } finally {
      setLoading(prev => ({ ...prev, stop: false }));
    }
  };

  const handleCheckStatus = async () => {
    setLoading(prev => ({ ...prev, status: true }));
    try {
      const response = await getOpenVpnStatus();
      
      // Check if we got a valid response (even if response.response is false)
      if (response && (response.responseData || response.message)) {
        // Get status from responseData or message
        const status = response.responseData || response.message || 'Unknown';
        
        // Map the status to proper display values
        if (status.toLowerCase().includes('running') || status.toLowerCase().includes('started')) {
          setVpnStatus('Running');
        } else if (status.toLowerCase().includes('stopped') || status.toLowerCase().includes('not running')) {
          setVpnStatus('Stopped');
        } else if (status.toLowerCase().includes('unknown') || status.toLowerCase().includes('error')) {
          setVpnStatus('Unknown');
        } else {
          setVpnStatus(status);
        }
      } else {
        // Only show Unknown if we have no response at all (server not connected)
        setVpnStatus('Unknown');
        showMessage('error', 'Failed to get OpenVPN status - server may not be connected');
      }
    } catch (error) {
      console.error('Error getting VPN status:', error);
      // Only show Unknown for network errors or server connection issues
      if (error.message === 'Network Error') {
        setVpnStatus('Unknown');
        showMessage('error', 'Network error. Please check your connection.');
      } else {
        setVpnStatus('Unknown');
        showMessage('error', error.message || 'Failed to get OpenVPN status');
      }
    } finally {
      setLoading(prev => ({ ...prev, status: false }));
    }
  };

  const handleRefreshLogs = async () => {
    setLoading(prev => ({ ...prev, logs: true }));
    try {
      const response = await getOpenVpnLogs();
      if (response.response) {
        setVpnLogs(response.responseData || '');
      } else {
        showMessage('error', response.message || 'Failed to get OpenVPN logs');
      }
    } catch (error) {
      console.error('Error getting VPN logs:', error);
      if (error.message === 'Network Error') {
        showMessage('error', 'Network error. Please check your connection.');
      } else {
        showMessage('error', error.message || 'Failed to get OpenVPN logs');
      }
    } finally {
      setLoading(prev => ({ ...prev, logs: false }));
    }
  };

  // Load initial status when component mounts
  useEffect(() => {
    // Initialize autostart from localStorage and prepare UI
    const saved = localStorage.getItem('openvpnAutoStart');
    const enabled = saved === null ? true : saved === 'true';
    setShowAdvanced(enabled);
    setEnableChoice(enabled ? 'yes' : 'no');
    if (form.vpnType === 'openvpn' && enabled) {
      handleCheckStatus();
      handleRefreshLogs();
    }
  }, [form.vpnType]);

  // Initialize SoftEther form whenever SoftEther tab is active (open or refresh)
  useEffect(() => {
    if (form.vpnType !== 'softethervpn') return;
    
    // Immediate status check when SoftEther VPN tab is selected
    appendSeLog('SoftEther VPN tab opened - checking status...');
    
    const initializeSeProfile = async () => {
      // Clear old logs when (re)opening the SoftEther tab to avoid mixing profiles
      setSeLogs('');
      const stored = loadSeProfile();
      let connectionNameToCheck = null;
      
      if (stored && stored.connectionName) {
        console.log('Restoring stored profile:', stored);
        connectionNameToCheck = stored.connectionName;
        setSeForm({
          connectionName: stored.connectionName || '',
          server: stored.server || '',
          hub: stored.hub || '',
          username: stored.username || '',
          password: stored.password || '',
          port: stored.port || '',
          clientIp: stored.clientIp || '',
          netmask: stored.netmask || ''
        });
        if (stored.authMethod) setAuthMethod(stored.authMethod);
        setIsProfileCreated(true);
      } else {
        // Fallback: try backend list to infer current connection
        try {
          const res = await seVpnList();
          const first = Array.isArray(res?.accounts) ? res.accounts[0] : null;
          if (first && first.name) {
            console.log('Found connection from list:', first);
            connectionNameToCheck = first.name;
            
            // Extract server and port from server field
            let server = '';
            let port = '';
            if (first.server) {
              const serverMatch = first.server.match(/^([^:]+):(\d+)/);
              if (serverMatch) {
                server = serverMatch[1];
                port = serverMatch[2];
              }
            }
            
            setSeForm({
              connectionName: first.name || '',
              server: server,
              hub: first.hub || '',
              username: '', // Not available in list API
              password: '', // Not available in list API
              port: port,
              clientIp: '', // Not available in list API
              netmask: '' // Not available in list API
            });
            setIsProfileCreated(true);
          }
        } catch (e) {
          console.log('List API failed, no profile to restore');
        }
      }
      
      // Immediately check status if we have a connection name
      if (connectionNameToCheck && connectionNameToCheck.trim()) {
        appendSeLog(`Checking VPN status for connection: ${connectionNameToCheck}`);
        // Use a small delay to ensure state is updated, then check status
        setTimeout(async () => {
          try {
            const res = await seVpnStatus(connectionNameToCheck);
            
            // Check if response contains an error field
            if (res?.error) {
              setSeStatus('Stopped');
              appendSeLog(`Status API Error: ${res.error}`);
            } else {
              // Process the status response
              const rawText = (res?.status || res?.output || res?.responseData || res?.message || '').toString();
              if (rawText) {
                appendSeLog(rawText);
              }
              
              if (rawText || (res && (res.responseData || res.message))) {
                const statusText = (rawText || res.responseData || res.message || 'Unknown').toString();
                const statusLower = statusText.toLowerCase();
                
                if (
                  statusLower.includes('running') ||
                  statusLower.includes('connected') ||
                  statusLower.includes('established') ||
                  statusLower.includes('the command completed successfully') ||
                  statusLower.includes('session status')
                ) {
                  setSeStatus('Running');
                } else if (
                  statusLower.includes('stopped') ||
                  statusLower.includes('offline') ||
                  statusLower.includes('disconnected')
                ) {
                  setSeStatus('Stopped');
                } else if (statusLower.includes('connecting') || statusLower.includes('retrying')) {
                  setSeStatus('Connecting');
                } else {
                  setSeStatus('Unknown');
                }
              } else {
                setSeStatus('Unknown');
              }
            }
          } catch (e) {
            console.error('Error getting SoftEther status:', e);
            if (e.response && e.response.status === 500) {
              setSeStatus('Stopped');
              appendSeLog(`Status API Error: ${e.message}`);
            } else {
              setSeStatus('Unknown');
              appendSeLog(`Status API Error: ${e.message}`);
            }
          }
        }, 100); // Small delay to ensure state is set
      } else {
        appendSeLog('No connection name found; skipping status check.');
      }
    };
    
    initializeSeProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.vpnType]);

  // Enable/Disable OpenVPN radio state
  const [enableChoice, setEnableChoice] = useState('yes');
  const [enableSeChoice, setEnableSeChoice] = useState('yes');

  // Track SoftEther advanced visibility similar to OpenVPN
  const [showSeAdvanced, setShowSeAdvanced] = useState(true);

  // Initialize saved SoftEther autostart choice on tab open
  useEffect(() => {
    if (form.vpnType !== 'softethervpn') return;
    try {
      const saved = localStorage.getItem('softetherAutoStart');
      if (saved === 'yes' || saved === 'no') {
        setEnableSeChoice(saved);
        setShowSeAdvanced(saved === 'yes');
      } else {
        // default ON to match previous behavior
        setShowSeAdvanced(true);
      }
    } catch {}
  }, [form.vpnType]);

  const handleSaveEnable = async () => {
    const enable = enableChoice === 'yes';
    const confirmation = window.confirm(`Are you sure you want to ${enable ? 'turn ON' : 'turn OFF'} AutoStart for OpenVPN?${!enable ? ' This will also stop and disconnect the currently running VPN.' : ''}`);
    if (!confirmation) return;

    // Optimistic UI for snappy response
    const prevEnabled = localStorage.getItem('openvpnAutoStart') === 'true';
    localStorage.setItem('openvpnAutoStart', String(enable));
    setShowAdvanced(enable);
    if (!enable) setVpnStatus('Stopped');
    setLoading(prev => ({ ...prev, toggle: true }));

    try {
      // If disabling autostart, also stop the running VPN
      if (!enable) {
        try {
          const stopResponse = await stopOpenVpn();
          if (stopResponse.response) {
            showMessage('success', 'OpenVPN stopped and disconnected successfully!');
            setVpnStatus('Stopped');
            // Refresh status after stopping
            setTimeout(() => handleCheckStatus(), 1000);
          } else {
            showMessage('warning', stopResponse.message || 'VPN may still be running');
          }
        } catch (stopError) {
          console.error('Error stopping VPN:', stopError);
          showMessage('warning', 'Failed to stop VPN: ' + (stopError.message || 'Unknown error'));
        }
      }
      
      // Disable/enable autostart on boot
      await axiosInstance.post('/openvpn_op', { type: enable ? 'enable' : 'disable' });
      
      // Defer heavy calls in background to avoid perceived slowness
      if (enable) {
        setTimeout(() => { handleCheckStatus(); handleRefreshLogs(); }, 50);
      }
      
      window.alert(enable ? 'AutoStart: ON. OpenVPN will start automatically after reboot.' : 'AutoStart: OFF. OpenVPN stopped and will not start automatically after reboot.');
    } catch (e) {
      // Revert UI on failure
      localStorage.setItem('openvpnAutoStart', String(prevEnabled));
      setShowAdvanced(prevEnabled);
      showMessage('error', e?.message || 'Failed to update OpenVPN state');
    } finally {
      setLoading(prev => ({ ...prev, toggle: false }));
    }
  };

  const handleSaveSeEnable = async () => {
    const enable = enableSeChoice === 'yes';
    setLoading(prev=>({ ...prev, toggle: true }));
    try {
      const res = enable ? await seVpnEnable() : await seVpnDisable();
      // Persist selection locally so it sticks on page revisit
      try { localStorage.setItem('softetherAutoStart', enable ? 'yes' : 'no'); } catch {}
      // Normalize server messages like "disables" vs "disabled"
      const msg = (res?.message || '').toLowerCase();
      if (msg.includes('enable')) {
        setEnableSeChoice('yes');
        setShowSeAdvanced(true);
      } else if (msg.includes('disable')) {
        setEnableSeChoice('no');
        setShowSeAdvanced(false);
      } else {
        setShowSeAdvanced(enable);
      }
      window.alert(enable ? 'AutoStart: ON. SoftEther VPN client will start on boot.' : 'AutoStart: OFF. SoftEther VPN client will not start on boot.');
    } catch (e) {
      // Revert UI on failure
      try {
        const saved = localStorage.getItem('softetherAutoStart');
        if (saved === 'yes' || saved === 'no') {
          setEnableSeChoice(saved);
          setShowSeAdvanced(saved === 'yes');
        }
      } catch {}
      showMessage('error', e?.message || 'Failed to update SoftEther autostart');
    } finally {
      setLoading(prev=>({ ...prev, toggle: false }));
    }
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-80px)] flex flex-col items-center">
      <div className="w-full max-w-6xl mx-auto">
        {/* VPN Type dropdown above the blue bar */}
        <div className="w-full flex justify-end items-center" style={{ padding: '10px 4px 6px 4px' }}>
          <Select
            value={form.vpnType}
            onChange={handleTypeChange}
            size="small"
            variant="outlined"
            sx={{ 
              minWidth: 220,
              backgroundColor: '#fff',
              '& .MuiOutlinedInput-root': {
                fontSize: '16px',
                height: '40px',
                borderRadius: '8px'
              }
            }}
          >
            {VPN_TYPES.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </div>
        
        {/* Header */}
        <div style={{
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
        }}>
          VPN Settings
        </div>

        {/* Content */}
        <Paper elevation={3} className="p-6 bg-white rounded-b-lg shadow-lg" style={{ borderTop: 'none' }}>
          
          {/* Alert Messages */}
          {message.text && (
            <Alert 
              severity={message.type} 
              className="mb-4"
              onClose={() => setMessage({ type: '', text: '' })}
            >
              {message.text}
            </Alert>
          )}

          <div className="space-y-6">

            {/* AutoStart OPENVPN toggle directly below blue bar (visible only for OpenVPN) */}
            {form.vpnType === 'openvpn' && (
            <div className="bg-[#e5e8ed] p-6 rounded border border-gray-300">
              <div className="grid grid-cols-1 md:grid-cols-3 items-center">
                <div className="text-[18px] text-gray-700 font-medium md:text-right md:pr-6 mb-2 md:mb-0">AutoStart OPENVPN</div>
                <div className="flex items-center gap-6 justify-start md:justify-start">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="radio" name="enableOpenVpn" checked={enableChoice==='yes'} onChange={()=>setEnableChoice('yes')} />
                    <span className="text-gray-700 text-[18px]">Yes</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="radio" name="enableOpenVpn" checked={enableChoice==='no'} onChange={()=>setEnableChoice('no')} />
                    <span className="text-gray-700 text-[18px]">No</span>
                  </label>
                </div>
                <div className="flex md:justify-end mt-3 md:mt-0">
                  <Button 
                    variant="contained" 
                    onClick={handleSaveEnable}
                    sx={{
                      background: 'linear-gradient(to bottom, #5db6e8 0%, #298fcf 100%)',
                      color: '#fff', fontWeight: 600, fontSize: '18px', borderRadius: 1.5,
                      minWidth: 120, boxShadow: '0 2px 6px #0002', textTransform: 'none', px: 3, py: 1.5,
                      '&:hover': { background: 'linear-gradient(to bottom, #298fcf 0%, #5db6e8 100%)' }
                    }}
                    disabled={loading.toggle}
                  >
                    {loading.toggle ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            </div>
            )}

            {/* AutoStart SoftEtherVPN toggle directly below blue bar (visible only for SoftEtherVPN) */}
            {form.vpnType === 'softethervpn' && (
            <div className="bg-[#e5e8ed] p-6 rounded border border-gray-300">
              <div className="grid grid-cols-1 md:grid-cols-3 items-center">
                <div className="text-[18px] text-gray-700 font-medium md:text-right md:pr-6 mb-2 md:mb-0">AutoStart SoftEtherVPN</div>
                <div className="flex items-center gap-6 justify-start md:justify-start">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="radio" name="enableSeTop" checked={enableSeChoice==='yes'} onChange={()=>setEnableSeChoice('yes')} />
                    <span className="text-gray-700 text-[18px]">Yes</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="radio" name="enableSeTop" checked={enableSeChoice==='no'} onChange={()=>setEnableSeChoice('no')} />
                    <span className="text-gray-700 text-[18px]">No</span>
                  </label>
                </div>
                <div className="flex md:justify-end mt-3 md:mt-0">
                  <Button 
                    variant="contained" 
                    onClick={handleSaveSeEnable}
                    sx={{
                      background: 'linear-gradient(to bottom, #5db6e8 0%, #298fcf 100%)',
                      color: '#fff', fontWeight: 600, fontSize: '18px', borderRadius: 1.5,
                      minWidth: 120, boxShadow: '0 2px 6px #0002', textTransform: 'none', px: 3, py: 1.5,
                      '&:hover': { background: 'linear-gradient(to bottom, #298fcf 0%, #5db6e8 100%)' }
                    }}
                    disabled={loading.toggle}
                  >
                    {loading.toggle ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            </div>
            )}

            {/* OpenVPN Operations Section */}
            {showAdvanced && form.vpnType === 'openvpn' && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                
                {/* File Upload */}
                <div className="mb-4">
                  <Typography variant="subtitle1" className="mb-2 text-gray-700 font-medium">
                    Upload Configuration File
                  </Typography>
                  <div className="flex items-center gap-4">
                    <input
                      id="vpn-file-upload"
                      type="file"
                      accept=".ovpn,.conf"
                      onChange={handleCertChange}
                      style={{ display: 'none' }}
                    />
                    <label
                      htmlFor="vpn-file-upload"
                      className="cursor-pointer select-none"
                      style={{
                        padding: '8px 16px',
                        background: '#f3f4f6',
                        border: '1px solid #c7c9cf',
                        borderRadius: 6,
                        boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.06)',
                        color: '#111827',
                        fontWeight: 600,
                        transition: 'all .15s ease-in-out'
                      }}
                      onMouseOver={(e)=>{ e.currentTarget.style.background='#e5e7eb'; e.currentTarget.style.borderColor='#b6bac3'; }}
                      onMouseOut={(e)=>{ e.currentTarget.style.background='#f3f4f6'; e.currentTarget.style.borderColor='#c7c9cf'; }}
                    >
                      Choose File
                    </label>
                    <span style={{ color: '#374151' }}>{selectedFile ? selectedFile.name : 'No file chosen'}</span>
                    <Button
                      variant="contained"
                      startIcon={loading.upload ? <CircularProgress size={16} /> : <UploadIcon />}
                      onClick={handleFileUpload}
                      disabled={loading.upload || !selectedFile}
                      sx={{
                        background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
                        color: '#fff',
                        fontWeight: 600,
                        textTransform: 'none',
                        minWidth: 160,
                      }}
                    >
                      {loading.upload ? 'Uploading...' : 'Upload File'}
                    </Button>
                  </div>
                </div>

                {/* VPN Controls */}
                <div className="mb-4">
                  <Typography variant="subtitle1" className="mb-2 text-gray-700 font-medium">
                    VPN Controls
                  </Typography>
                  <div className="flex flex-wrap gap-4">
                    <Button
                      variant="contained"
                      startIcon={loading.start ? <CircularProgress size={16} /> : <StartIcon />}
                      onClick={handleStartVpn}
                      disabled={loading.start}
                      sx={blueButtonSx}
                    >
                      {loading.start ? 'Starting...' : 'Start VPN'}
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={loading.stop ? <CircularProgress size={16} /> : <StopIcon />}
                      onClick={handleStopVpn}
                      disabled={loading.stop}
                      sx={blueButtonSx}
                    >
                      {loading.stop ? 'Stopping...' : 'Stop VPN'}
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={loading.status ? <CircularProgress size={16} /> : <CheckCircleIcon />}
                      onClick={handleCheckStatus}
                      disabled={loading.status}
                      sx={blueButtonSx}
                    >
                      {loading.status ? 'Checking...' : 'Check Status'}
                    </Button>
                  </div>
                </div>

                {/* VPN Status */}
                <div className="mb-4">
                  <Typography variant="subtitle1" className="mb-2 text-gray-700 font-medium">
                    Current Status
                  </Typography>
                  <div className="flex items-center gap-2">
                    <Chip
                      label={vpnStatus}
                      variant="filled"
                      sx={{
                        fontSize: 18,
                        height: 40,
                        borderRadius: 9999,
                        px: 2.5,
                        color: '#fff',
                        backgroundColor:
                          vpnStatus === 'Running' ? '#2e7d32' :
                          vpnStatus === 'Stopped' ? '#c62828' : '#ef6c00'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* VPN Logs Section */}
            {showAdvanced && form.vpnType === 'openvpn' && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <Typography variant="h6" className="text-gray-800 font-semibold">
                    VPN Logs
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={loading.logs ? <CircularProgress size={16} /> : <RefreshIcon />}
                    onClick={handleRefreshLogs}
                    disabled={loading.logs}
                    sx={blueButtonSx}
                  >
                    {loading.logs ? 'Refreshing...' : 'Refresh Logs'}
                  </Button>
                </div>
                <TextField
                  multiline
                  rows={8}
                  value={vpnLogs || 'No logs available'}
                  variant="outlined"
                  fullWidth
                  InputProps={{ readOnly: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      backgroundColor: '#f8f9fa'
                    }
                  }}
                />
              </div>
            )}

            {/* SoftEtherVPN Form */}
            {showSeAdvanced && form.vpnType === 'softethervpn' && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <Typography variant="h6" className="mb-3 text-gray-800 font-semibold">
                  SoftEtherVPN Configuration
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField 
                    label="Connection Name" 
                    value={seForm.connectionName} 
                    onChange={handleSeChange('connectionName')} 
                    variant="outlined" 
                    size="small" 
                    disabled={isProfileCreated}
                    sx={{ '& .MuiOutlinedInput-root': { backgroundColor: isProfileCreated ? '#f5f5f5' : '#fff' } }} 
                  />
                  <TextField 
                    label="Server Address" 
                    value={seForm.server} 
                    onChange={handleSeChange('server')} 
                    variant="outlined" 
                    size="small" 
                    disabled={isProfileCreated}
                    sx={{ '& .MuiOutlinedInput-root': { backgroundColor: isProfileCreated ? '#f5f5f5' : '#fff' } }} 
                  />
                  <TextField 
                    label="Port" 
                    value={seForm.port} 
                    onChange={handleSeChange('port')} 
                    variant="outlined" 
                    size="small" 
                    disabled={isProfileCreated}
                    sx={{ '& .MuiOutlinedInput-root': { backgroundColor: isProfileCreated ? '#f5f5f5' : '#fff' } }} 
                  />
                  <TextField 
                    label="HUB Name" 
                    value={seForm.hub} 
                    onChange={handleSeChange('hub')} 
                    variant="outlined" 
                    size="small" 
                    disabled={isProfileCreated}
                    sx={{ '& .MuiOutlinedInput-root': { backgroundColor: isProfileCreated ? '#f5f5f5' : '#fff' } }} 
                  />
                  <TextField 
                    label="Username" 
                    value={seForm.username} 
                    onChange={handleSeChange('username')} 
                    variant="outlined" 
                    size="small" 
                    disabled={isProfileCreated}
                    sx={{ '& .MuiOutlinedInput-root': { backgroundColor: isProfileCreated ? '#f5f5f5' : '#fff' } }} 
                  />
                  <TextField 
                    label="Password" 
                    type="password" 
                    value={seForm.password} 
                    onChange={handleSeChange('password')} 
                    variant="outlined" 
                    size="small" 
                    disabled={isProfileCreated}
                    sx={{ '& .MuiOutlinedInput-root': { backgroundColor: isProfileCreated ? '#f5f5f5' : '#fff' } }} 
                  />
                  <TextField 
                    label="Client IP" 
                    value={seForm.clientIp} 
                    onChange={handleSeChange('clientIp')} 
                    variant="outlined" 
                    size="small" 
                    disabled={isProfileCreated}
                    sx={{ '& .MuiOutlinedInput-root': { backgroundColor: isProfileCreated ? '#f5f5f5' : '#fff' } }} 
                  />
                  <TextField 
                    label="Netmask" 
                    value={seForm.netmask} 
                    onChange={handleSeChange('netmask')} 
                    variant="outlined" 
                    size="small" 
                    disabled={isProfileCreated}
                    sx={{ '& .MuiOutlinedInput-root': { backgroundColor: isProfileCreated ? '#f5f5f5' : '#fff' } }} 
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div className="flex items-center gap-3">
                    <label className="text-gray-700 text-sm md:text-base font-medium">Auth Method</label>
                    <select value={authMethod} onChange={(e)=>setAuthMethod(e.target.value)} className="border rounded px-2 py-1 bg-white">
                      <option value="password">Password</option>
                      <option value="certificate">Certificate</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  {authMethod === 'certificate' && (
                  <div className="flex items-center gap-3">
                    <input id="se-cert" type="file" accept=".cer,.crt" style={{ display: 'none' }} onChange={handleSeCert} />
                    <label htmlFor="se-cert" className="cursor-pointer select-none" style={{ padding:'8px 16px', background:'#f3f4f6', border:'1px solid #c7c9cf', borderRadius:6, boxShadow:'inset 0 -1px 0 rgba(0,0,0,0.06)', color:'#111827', fontWeight:600 }}>Upload Cert (.cer)</label>
                    <span style={{ color:'#374151' }}>{seCertFile ? seCertFile.name : 'No file chosen'}</span>
                  </div>
                  )}
                  {authMethod === 'certificate' && (
                  <div className="flex items-center gap-3">
                    <input id="se-key" type="file" accept=".key" style={{ display: 'none' }} onChange={handleSeKey} />
                    <label htmlFor="se-key" className="cursor-pointer select-none" style={{ padding:'8px 16px', background:'#f3f4f6', border:'1px solid #c7c9cf', borderRadius:6, boxShadow:'inset 0 -1px 0 rgba(0,0,0,0.06)', color:'#111827', fontWeight:600 }}>Upload Key (.key)</label>
                    <span style={{ color:'#374151' }}>{seKeyFile ? seKeyFile.name : 'No file chosen'}</span>
                  </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 mt-4">
                  {!isProfileCreated ? (
                    <Button variant="contained" onClick={handleSeCreateFlow} disabled={loading.seCreate || !areSeFieldsFilled()} sx={blueButtonSx}>
                      {loading.seCreate ? 'Processing...' : 'Create & Connect'}
                    </Button>
                  ) : (
                    <>
                      {seStatus === 'Running' || seStatus === 'Connecting' ? (
                        <Button variant="contained" color="error" onClick={handleSeDisconnect} disabled={loading.seDisconnect || !seForm.connectionName.trim()} sx={blueButtonSx}>
                          {loading.seDisconnect ? 'Disconnecting...' : 'Disconnect'}
                        </Button>
                      ) : (
                        <Button variant="contained" onClick={handleSeConnect} disabled={loading.seConnect || !seForm.connectionName.trim()} sx={blueButtonSx}>
                          {loading.seConnect ? 'Connecting...' : 'Connect'}
                        </Button>
                      )}
                      <Button variant="contained" onClick={() => handleSeStatus(false)} disabled={loading.seStatus} sx={blueButtonSx}>
                        {loading.seStatus ? 'Checking...' : 'Check Status'}
                      </Button>
                      <Button variant="contained" onClick={handleSeState} disabled={loading.seState} sx={blueButtonSx}>
                        {loading.seState ? 'Checking...' : 'VPN State'}
                      </Button>
                      <Button 
                        variant="contained" 
                        color="error" 
                        onClick={() => handleSeDelete(seForm.connectionName)}
                        disabled={loading.seDelete}
                        sx={blueButtonSx}
                      >
                        {loading.seDelete ? 'Deleting...' : 'Delete Profile'}
                      </Button>
                    </>
                  )}
                </div>
                
                <div className="mt-4">
                  <Typography variant="subtitle1" className="mb-1 text-gray-700 font-medium">SoftEther Status</Typography>
                  <Chip 
                    label={seStatus} 
                    variant="filled" 
                    sx={{ 
                      fontSize:16, 
                      height:36, 
                      borderRadius:9999, 
                      px:2, 
                      color:'#fff', 
                      backgroundColor: 
                        seStatus==='Running' ? '#2e7d32' : 
                        seStatus==='Stopped' ? '#c62828' : 
                        seStatus==='Connecting' ? '#1976d2' : 
                        '#ef6c00' 
                    }} 
                  />
                </div>
                
                {/* SoftEther Logs */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <Typography variant="h6" className="text-gray-800 font-semibold">SoftEther Logs</Typography>
                    <Button variant="contained" onClick={()=>setSeLogs('')} sx={blueButtonSx}>Clear Logs</Button>
                  </div>
                  <TextField
                    multiline
                    rows={8}
                    value={seLogs || 'No logs yet'}
                    variant="outlined"
                    fullWidth
                    InputProps={{ readOnly: true }}
                    sx={{ '& .MuiOutlinedInput-root': { fontSize: '12px', fontFamily: 'monospace', backgroundColor: '#f8f9fa' } }}
                  />
                </div>
              </div>
            )}
            
          </div>
        </Paper>
      </div>
    </div>
  );
};

export default SystemToolsVPN; 
