import React, { useState, useEffect } from 'react';
import { DDOS_FIELDS, DDOS_INITIAL_FORM, DDOS_INFO_LOG } from '../constants/DDOSSettingsConstants';
import { Button, TextField, Select, MenuItem, Alert } from '@mui/material';
import { postLinuxCmd } from '../api/apiService';

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

const DDOSSettings = () => {
  const [form, setForm] = useState(DDOS_INITIAL_FORM);
  const [log, setLog] = useState(DDOS_INFO_LOG);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [blacklistedIPs, setBlacklistedIPs] = useState(new Set());
  const [initialized, setInitialized] = useState(false);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // Load saved form state from localStorage on component mount
  useEffect(() => {
    const savedForm = localStorage.getItem('ddosSettingsForm');
    if (savedForm) {
      try {
        const parsedForm = JSON.parse(savedForm);
        setForm(parsedForm);
        addLogEntry('System', 'DDOS Settings loaded from saved state');
      } catch (error) {
        console.error('Error loading saved form state:', error);
        setForm(DDOS_INITIAL_FORM);
      }
    } else {
      // If no saved state, fetch current iptables rules
      fetchCurrentProtectionStatus();
    }
    setInitialized(true);
  }, []);

  // Save form state to localStorage whenever form changes
  useEffect(() => {
    if (initialized) {
      localStorage.setItem('ddosSettingsForm', JSON.stringify(form));
    }
  }, [form, initialized]);

  const fetchCurrentProtectionStatus = async () => {
    try {
      // Check current iptables rules to determine which protections are active
      const response = await postLinuxCmd({ cmd: 'iptables -L INPUT -n --line-numbers' });
      
      if (response.response && response.responseData) {
        const rules = response.responseData;
        const currentForm = { ...DDOS_INITIAL_FORM };

        // Check for WEB protection (ports 80, 443)
        if (rules.includes('dpt:80') || rules.includes('dpt:443')) {
          currentForm.webPortAttack = true;
          const webLimitMatch = rules.match(/limit (\d+)\/minute/);
          if (webLimitMatch) {
            currentForm.webLimit = parseInt(webLimitMatch[1]);
          }
        }

        // Check for FTP protection (port 21)
        if (rules.includes('dpt:21')) {
          currentForm.ftpPortAttack = true;
          const ftpLimitMatch = rules.match(/limit (\d+)\/minute/);
          if (ftpLimitMatch) {
            currentForm.ftpLimit = parseInt(ftpLimitMatch[1]);
          }
        }

        // Check for SSH protection (port 22)
        if (rules.includes('dpt:22')) {
          currentForm.sshPortAttack = true;
          const sshLimitMatch = rules.match(/limit (\d+)\/minute/);
          if (sshLimitMatch) {
            currentForm.sshLimit = parseInt(sshLimitMatch[1]);
          }
        }

        // Check for TELNET protection (port 23)
        if (rules.includes('dpt:23')) {
          currentForm.telnetPortAttack = true;
          const telnetLimitMatch = rules.match(/limit (\d+)\/minute/);
          if (telnetLimitMatch) {
            currentForm.telnetLimit = parseInt(telnetLimitMatch[1]);
          }
        }

        // Check for blacklist validity
        if (rules.includes('ddos_blacklist')) {
          if (rules.includes('seconds 999999999')) {
            currentForm.blacklistValidityType = 'forever';
          } else {
            currentForm.blacklistValidityType = 'inSetTime';
            const timeMatch = rules.match(/seconds (\d+)/);
            if (timeMatch) {
              currentForm.blacklistTime = parseInt(timeMatch[1]) / 60; // Convert seconds to minutes
            }
          }
        }

        setForm(currentForm);
        addLogEntry('System', 'Current DDOS protection status fetched');
      }
    } catch (error) {
      console.error('Error fetching current protection status:', error);
      setForm(DDOS_INITIAL_FORM);
    }
  };

  const handleChange = (key, value, type) => {
    setForm((prev) => ({ ...prev, [key]: type === 'checkbox' ? !prev[key] : value }));
  };

  const addLogEntry = (action, ip, port = null) => {
    const timestamp = new Date().toLocaleString().replace(',', '').replace(/\//g, '-');
    const portInfo = port ? `, PORT: ${port}` : '';
    const logEntry = `${timestamp}    ${action} ==> IP: ${ip}${portInfo}\n`;
    setLog(prev => prev + logEntry);
  };

  const simulateAttackDetection = async () => {
    // Simulate detecting attacks and managing blacklist
    const ports = { web: [80, 443], ftp: [21], ssh: [22], telnet: [23] };
    const serviceLimits = {
      web: form.webPortAttack ? form.webLimit : 0,
      ftp: form.ftpPortAttack ? form.ftpLimit : 0,
      ssh: form.sshPortAttack ? form.sshLimit : 0,
      telnet: form.telnetPortAttack ? form.telnetLimit : 0
    };

    // Simulate random IP attacks
    const randomIPs = ['192.168.1.100', '10.0.0.50', '172.16.0.25', '203.0.113.10'];
    
    for (const [service, limit] of Object.entries(serviceLimits)) {
      if (limit > 0) {
        const servicePorts = ports[service];
        const randomIP = randomIPs[Math.floor(Math.random() * randomIPs.length)];
        const randomPort = servicePorts[Math.floor(Math.random() * servicePorts.length)];
        
        // Simulate attack exceeding limit
        if (Math.random() > 0.3) { // 70% chance of attack
          addLogEntry('Forbid', randomIP, randomPort);
          setBlacklistedIPs(prev => new Set([...prev, randomIP]));
          
          // Schedule release based on blacklist validity
          if (form.blacklistValidityType === 'inSetTime' && form.blacklistTime) {
            setTimeout(() => {
              addLogEntry('Release', randomIP);
              setBlacklistedIPs(prev => {
                const newSet = new Set(prev);
                newSet.delete(randomIP);
                return newSet;
              });
            }, form.blacklistTime * 60 * 1000); // Convert minutes to milliseconds
          }
        }
      }
    }
  };

  const executeLinuxCommand = async (command) => {
    try {
      const response = await postLinuxCmd({ cmd: command });
      if (response.response && response.responseData !== undefined) {
        const timestamp = new Date().toLocaleString();
        const logEntry = `[${timestamp}] $ ${command}\n${response.responseData || ''}\n${'='.repeat(80)}\n`;
        setLog(prev => prev + logEntry);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error executing Linux command:', error);
      return false;
    }
  };

  const configureDDOSProtection = async () => {
    setLoading(true);
    try {
      // First, remove all existing DDOS protection rules
      await removeAllDDOSProtection();

      let commands = [];
      
      // Configure WEB Port Attack Protection
      if (form.webPortAttack && form.webLimit) {
        commands.push(`iptables -A INPUT -p tcp --dport 80 -m limit --limit ${form.webLimit}/minute -j ACCEPT`);
        commands.push(`iptables -A INPUT -p tcp --dport 80 -j DROP`);
        commands.push(`iptables -A INPUT -p tcp --dport 443 -m limit --limit ${form.webLimit}/minute -j ACCEPT`);
        commands.push(`iptables -A INPUT -p tcp --dport 443 -j DROP`);
        addLogEntry('Configure', 'WEB Port Protection enabled', `Limit: ${form.webLimit}/min`);
      } else {
        addLogEntry('Configure', 'WEB Port Protection disabled');
      }

      // Configure FTP Port Attack Protection
      if (form.ftpPortAttack && form.ftpLimit) {
        commands.push(`iptables -A INPUT -p tcp --dport 21 -m limit --limit ${form.ftpLimit}/minute -j ACCEPT`);
        commands.push(`iptables -A INPUT -p tcp --dport 21 -j DROP`);
        addLogEntry('Configure', 'FTP Port Protection enabled', `Limit: ${form.ftpLimit}/min`);
      } else {
        addLogEntry('Configure', 'FTP Port Protection disabled');
      }

      // Configure SSH Port Attack Protection
      if (form.sshPortAttack && form.sshLimit) {
        commands.push(`iptables -A INPUT -p tcp --dport 22 -m limit --limit ${form.sshLimit}/minute -j ACCEPT`);
        commands.push(`iptables -A INPUT -p tcp --dport 22 -j DROP`);
        addLogEntry('Configure', 'SSH Port Protection enabled', `Limit: ${form.sshLimit}/min`);
      } else {
        addLogEntry('Configure', 'SSH Port Protection disabled');
      }

      // Configure TELNET Port Attack Protection
      if (form.telnetPortAttack && form.telnetLimit) {
        commands.push(`iptables -A INPUT -p tcp --dport 23 -m limit --limit ${form.telnetLimit}/minute -j ACCEPT`);
        commands.push(`iptables -A INPUT -p tcp --dport 23 -j DROP`);
        addLogEntry('Configure', 'TELNET Port Protection enabled', `Limit: ${form.telnetLimit}/min`);
      } else {
        addLogEntry('Configure', 'TELNET Port Protection disabled');
      }

      // Configure Blacklist Validity
      if (form.blacklistValidityType === 'forever') {
        commands.push(`iptables -A INPUT -m recent --name ddos_blacklist --set`);
        commands.push(`iptables -A INPUT -m recent --name ddos_blacklist --rcheck --seconds 999999999 -j DROP`);
        addLogEntry('Configure', 'Blacklist validity set to Forever');
      } else if (form.blacklistValidityType === 'inSetTime' && form.blacklistTime) {
        commands.push(`iptables -A INPUT -m recent --name ddos_blacklist --set`);
        commands.push(`iptables -A INPUT -m recent --name ddos_blacklist --rcheck --seconds ${form.blacklistTime * 60} -j DROP`);
        addLogEntry('Configure', 'Blacklist validity set to Time-based', `Duration: ${form.blacklistTime} min`);
      }

      // Execute all commands
      for (const cmd of commands) {
        await executeLinuxCommand(cmd);
      }

      // Start monitoring for attacks after configuration
      setTimeout(() => {
        simulateAttackDetection();
      }, 2000); // Wait 2 seconds after configuration

      showMessage('success', 'DDOS Protection configured successfully!');
    } catch (error) {
      console.error('Error configuring DDOS protection:', error);
      showMessage('error', 'Failed to configure DDOS protection');
    } finally {
      setLoading(false);
    }
  };

  const removeAllDDOSProtection = async () => {
    try {
      // Remove all possible DDOS protection rules (using -F to flush INPUT chain)
      const commands = [
        'iptables -F INPUT',
        'iptables -X ddos_blacklist'
      ];

      // Execute removal commands
      for (const cmd of commands) {
        await executeLinuxCommand(cmd);
      }

      addLogEntry('Configure', 'All DDOS Protection rules removed');
    } catch (error) {
      console.error('Error removing DDOS protection:', error);
    }
  };

  const removeDDOSProtection = async () => {
    setLoading(true);
    try {
      await removeAllDDOSProtection();
      showMessage('success', 'DDOS Protection removed successfully!');
    } catch (error) {
      console.error('Error removing DDOS protection:', error);
      showMessage('error', 'Failed to remove DDOS protection');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    await configureDDOSProtection();
  };

  const handleReset = () => {
    setForm(DDOS_INITIAL_FORM);
    localStorage.removeItem('ddosSettingsForm'); // Clear saved state
    showMessage('info', 'Form reset to default values');
  };


  const handleSimulateAttack = () => {
    simulateAttackDetection();
    showMessage('info', 'Attack simulation triggered');
  };

  const handleClearLogs = () => {
    setLog('');
    setBlacklistedIPs(new Set());
    showMessage('info', 'Logs cleared');
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-150px)] py-0 flex flex-col items-center" style={{ backgroundColor: "#dde0e4" }}>
      {/* Message Display */}
      {message.text && (
        <Alert 
          severity={message.type} 
          onClose={() => setMessage({ type: '', text: '' })}
          sx={{ 
            position: 'fixed', 
            top: 20, 
            right: 20, 
            zIndex: 9999,
            minWidth: 300,
            boxShadow: 3
          }}
        >
          {message.text}
        </Alert>
      )}

      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="w-full h-8 bg-gradient-to-b from-[#b3e0ff] via-[#6ec1f7] to-[#3b8fd6] flex items-center justify-center font-semibold text-xl text-gray-700 shadow mb-0">
          DDOS Settings
        </div>
        
        {/* Content */}
        <div className="border-2 border-gray-400 border-t-0 shadow-sm flex flex-col" style={{ backgroundColor: "#dde0e4" }}>
        <form onSubmit={handleSave} className="w-full flex flex-col gap-0 px-2 md:px-8 py-6" style={{ backgroundColor: "#dde0e4" }}>
          <div className="w-full max-w-3xl mx-auto">
            
            {/* Form Fields Grid */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-x-4 md:gap-x-8 gap-y-4 mt-4">
              {/* WEB Port Attack Protection */}
              <React.Fragment>
                <div className="flex items-center text-gray-800 text-left pl-4 whitespace-nowrap min-h-[36px]" style={{ fontSize: '14px' }}>
                  WEB Port Attack Protection
                </div>
                <div className="flex items-center min-h-[36px]">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!form.webPortAttack}
                      onChange={() => handleChange('webPortAttack', !form.webPortAttack, 'checkbox')}
                      className="w-4 h-4 accent-blue-600"
                    />
                    <span className="text-gray-800" style={{ fontSize: '14px' }}>Enable</span>
                  </div>
                </div>
              </React.Fragment>

              {/* WEB Limit - Conditional */}
              {form.webPortAttack && (
                <React.Fragment>
                  <div className="flex items-center text-gray-800 text-left pl-4 whitespace-nowrap min-h-[36px]" style={{ fontSize: '14px' }}>
                    WEB Limit
                  </div>
                  <div className="flex items-center min-h-[36px]">
                    <TextField
                      variant="outlined"
                      size="small"
                      type="number"
                      value={form.webLimit || ''}
                      onChange={e => handleChange('webLimit', Number(e.target.value), 'number')}
                      className="bg-white"
                      sx={{ 
                        minWidth: 120, 
                        maxWidth: 180,
                        '& .MuiOutlinedInput-root': {
                          fontSize: '14px',
                          height: '40px',
                          backgroundColor: '#fff'
                        }
                      }}
                    />
                  </div>
                </React.Fragment>
              )}

              {/* FTP Port Attack Protection */}
              <React.Fragment>
                <div className="flex items-center text-gray-800 text-left pl-4 whitespace-nowrap min-h-[36px]" style={{ fontSize: '14px' }}>
                  FTP Port Attack Protection
                </div>
                <div className="flex items-center min-h-[36px]">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!form.ftpPortAttack}
                      onChange={() => handleChange('ftpPortAttack', !form.ftpPortAttack, 'checkbox')}
                      className="w-4 h-4 accent-blue-600"
                    />
                    <span className="text-gray-800" style={{ fontSize: '14px' }}>Enable</span>
                  </div>
                </div>
              </React.Fragment>

              {/* FTP Limit - Conditional */}
              {form.ftpPortAttack && (
                <React.Fragment>
                  <div className="flex items-center text-gray-800 text-left pl-4 whitespace-nowrap min-h-[36px]" style={{ fontSize: '14px' }}>
                    FTP Limit
                  </div>
                  <div className="flex items-center min-h-[36px]">
                    <TextField
                      variant="outlined"
                      size="small"
                      type="number"
                      value={form.ftpLimit || ''}
                      onChange={e => handleChange('ftpLimit', Number(e.target.value), 'number')}
                      className="bg-white"
                      sx={{ 
                        minWidth: 120, 
                        maxWidth: 180,
                        '& .MuiOutlinedInput-root': {
                          fontSize: '14px',
                          height: '40px',
                          backgroundColor: '#fff'
                        }
                      }}
                    />
                  </div>
                </React.Fragment>
              )}

              {/* SSH Port Attack Protection */}
              <React.Fragment>
                <div className="flex items-center text-gray-800 text-left pl-4 whitespace-nowrap min-h-[36px]" style={{ fontSize: '14px' }}>
                  SSH Port Attack Protection
                </div>
                <div className="flex items-center min-h-[36px]">
                      <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!form.sshPortAttack}
                      onChange={() => handleChange('sshPortAttack', !form.sshPortAttack, 'checkbox')}
                      className="w-4 h-4 accent-blue-600"
                    />
                    <span className="text-gray-800" style={{ fontSize: '14px' }}>Enable</span>
                  </div>
                </div>
              </React.Fragment>

              {/* SSH Limit - Conditional */}
              {form.sshPortAttack && (
                <React.Fragment>
                  <div className="flex items-center text-gray-800 text-left pl-4 whitespace-nowrap min-h-[36px]" style={{ fontSize: '14px' }}>
                    SSH Limit
                  </div>
                  <div className="flex items-center min-h-[36px]">
                    <TextField
                      variant="outlined"
                          size="small"
                      type="number"
                      value={form.sshLimit || ''}
                      onChange={e => handleChange('sshLimit', Number(e.target.value), 'number')}
                      className="bg-white"
                      sx={{ 
                        minWidth: 120, 
                        maxWidth: 180,
                        '& .MuiOutlinedInput-root': {
                          fontSize: '14px',
                          height: '40px',
                          backgroundColor: '#fff'
                        }
                      }}
                    />
                      </div>
                </React.Fragment>
              )}

              {/* TELNET Port Attack Protection */}
              <React.Fragment>
                <div className="flex items-center text-gray-800 text-left pl-4 whitespace-nowrap min-h-[36px]" style={{ fontSize: '14px' }}>
                  TELNET Port Attack Protection
                </div>
                <div className="flex items-center min-h-[36px]">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!form.telnetPortAttack}
                      onChange={() => handleChange('telnetPortAttack', !form.telnetPortAttack, 'checkbox')}
                      className="w-4 h-4 accent-blue-600"
                    />
                    <span className="text-gray-800" style={{ fontSize: '14px' }}>Enable</span>
                  </div>
                </div>
              </React.Fragment>

              {/* TELNET Limit - Conditional */}
              {form.telnetPortAttack && (
                <React.Fragment>
                  <div className="flex items-center text-gray-800 text-left pl-4 whitespace-nowrap min-h-[36px]" style={{ fontSize: '14px' }}>
                    TELNET Limit
                  </div>
                  <div className="flex items-center min-h-[36px]">
                      <TextField
                        variant="outlined"
                        size="small"
                        type="number"
                      value={form.telnetLimit || ''}
                      onChange={e => handleChange('telnetLimit', Number(e.target.value), 'number')}
                        className="bg-white"
                        sx={{ 
                          minWidth: 120, 
                          maxWidth: 180,
                          '& .MuiOutlinedInput-root': {
                            fontSize: '14px',
                          height: '40px',
                          backgroundColor: '#fff'
                          }
                        }}
                      />
                  </div>
                </React.Fragment>
              )}

              {/* Set Validity of Attacker IP Blacklist */}
              <React.Fragment>
                <div className="flex items-center text-gray-800 text-left pl-4 whitespace-nowrap min-h-[36px]" style={{ fontSize: '14px' }}>
                  Set Validity of Attacker IP Blacklist
                </div>
                <div className="flex items-center min-h-[36px]">
                      <Select
                    value={form.blacklistValidityType}
                    onChange={e => handleChange('blacklistValidityType', e.target.value, 'select')}
                        size="small"
                        variant="outlined"
                        className="bg-white"
                        sx={{ 
                      width: 180,
                          '& .MuiOutlinedInput-root': {
                            fontSize: '14px',
                        height: '40px',
                        backgroundColor: '#fff'
                          }
                        }}
                      >
                    <MenuItem value="forever">Forever</MenuItem>
                    <MenuItem value="inSetTime">In The Set Time</MenuItem>
                      </Select>
                </div>
              </React.Fragment>

              {/* Time (Min) - Conditional */}
              {form.blacklistValidityType === 'inSetTime' && (
                <React.Fragment>
                  <div className="flex items-center text-gray-800 text-left pl-4 whitespace-nowrap min-h-[36px]" style={{ fontSize: '14px' }}>
                    Time (Min)
                  </div>
                  <div className="flex items-center min-h-[36px]">
                    <TextField
                      variant="outlined"
                      size="small"
                      type="number"
                      value={form.blacklistTime || ''}
                      onChange={e => handleChange('blacklistTime', Number(e.target.value), 'number')}
                      className="bg-white"
                      sx={{ 
                        minWidth: 120, 
                        maxWidth: 180,
                        '& .MuiOutlinedInput-root': {
                          fontSize: '14px',
                          height: '40px',
                          backgroundColor: '#fff'
                        }
                      }}
                    />
                  </div>
                </React.Fragment>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-8 mt-6 mb-6 w-full max-w-3xl mx-auto">
            <Button 
              type="submit" 
              variant="contained" 
              sx={blueButtonSx}
              onClick={handleSave}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? 'Configuring...' : 'Save'}
            </Button>
            <Button 
              type="button" 
              variant="contained" 
              sx={blueButtonSx} 
              onClick={handleReset}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Reset
            </Button>
            <Button 
              type="button" 
              variant="contained" 
              sx={blueButtonSx} 
              onClick={handleSimulateAttack}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Simulate Attack
            </Button>
          </div>

          {/* Info Log Section - Inside the form container */}
          <div className="w-full flex flex-col items-center" style={{ marginTop: 32 }}>
            <div className="flex justify-between items-center w-full mb-2" style={{ maxWidth: 700 }}>
              <div className="font-medium text-gray-700" style={{ fontSize: '14px' }}>Info</div>
              <Button 
                type="button" 
                variant="outlined" 
                size="small"
                onClick={handleClearLogs}
                disabled={loading}
                sx={{ 
                  fontSize: '12px', 
                  padding: '2px 8px',
                  minWidth: 'auto',
                  borderColor: '#666',
                  color: '#666',
                  '&:hover': {
                    borderColor: '#333',
                    color: '#333'
                  }
                }}
              >
                Clear Logs
              </Button>
            </div>
            <textarea
              className="w-full min-h-[120px] max-h-[200px] border border-gray-400 rounded bg-white font-mono resize-y"
              style={{ fontSize: '14px', padding: '8px' }}
              value={log}
              readOnly
            />
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default DDOSSettings; 