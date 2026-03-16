import React, { useState } from 'react';
import { postLinuxCmd } from '../api/apiService';
import { Button, Alert } from '@mui/material';
import { LINUX_CLI_TITLE, LINUX_CLI_LABELS, LINUX_CLI_BUTTONS, LINUX_CLI_PLACEHOLDERS } from '../constants/LinuxCLIConstants';

const blueBar = (title) => (
  <div className="w-full bg-gradient-to-b from-[#b3e0ff] via-[#7ecbfa] to-[#3b8fd6] h-12 rounded-t-lg flex items-center justify-center text-[22px] font-semibold text-gray-800 shadow mb-0 border-b border-[#b3e0ff]">
    {title}
  </div>
);

const buttonSx = {
  background: 'linear-gradient(to bottom, #5dc6f8 0%, #299fd6 100%)',
  color: '#fff',
  fontWeight: 600,
  fontSize: '16px',
  borderRadius: 0,
  minWidth: 90,
  px: 2,
  py: 0.5,
  boxShadow: '0 2px 8px #b3e0ff',
  textTransform: 'none',
  '&:hover': {
    background: 'linear-gradient(to bottom, #299fd6 0%, #5dc6f8 100%)',
  },
};

const LinuxCLI = () => {
  const [command, setCommand] = useState('');
  const [logs, setLogs] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [commandError, setCommandError] = useState('');

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const validateCommand = (cmd) => {
    if (!cmd || cmd.trim() === '') return 'Please enter a command.';
    if (cmd.trim().length < 2) return 'Command must be at least 2 characters long.';
    return '';
  };

  const executeCommand = async () => {
    setCommandError('');
    const validationError = validateCommand(command);
    if (validationError) { setCommandError(validationError); return; }
    setLoading(true);
    try {
      const apiResponse = await postLinuxCmd({ cmd: command.trim() });
      if (apiResponse.response && (apiResponse.responseData !== undefined)) {
        const timestamp = new Date().toLocaleString();
        const logEntry = `[${timestamp}] $ ${command.trim()}\n${apiResponse.responseData || ''}\n${'='.repeat(80)}\n`;
        setLogs(prev => prev + logEntry);
        showMessage('success', 'Command executed successfully!');
      } else {
        const timestamp = new Date().toLocaleString();
        const cmdName = command.trim().split(/\s+/)[0] || command.trim();
        const logEntry = `[${timestamp}] $ ${command.trim()}\n-bash: ${cmdName}: command not found\n${'='.repeat(80)}\n`;
        setLogs(prev => prev + logEntry);
        showMessage('error', 'Invalid or wrong command.');
      }
    } catch (error) {
      if (error.message === 'Network Error') {
        showMessage('error', 'Network error. Please check your connection.');
      } else if (error.response?.status === 500) {
        showMessage('error', 'Server error. The Linux command endpoint may have issues.');
      } else {
        showMessage('error', error.message || 'Failed to execute command');
      }
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs('');
    setCommand('');
    setCommandError('');
    showMessage('info', 'Logs cleared!');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      executeCommand();
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-gray-50 flex flex-col items-center py-6 px-2">
      {message.text && (
        <Alert 
          severity={message.type} 
          onClose={() => setMessage({ type: '', text: '' })}
          sx={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, minWidth: 300, boxShadow: 3 }}
        >
          {message.text}
        </Alert>
      )}

      <div className="w-full max-w-4xl">
        {blueBar(LINUX_CLI_TITLE)}
        <div className="border border-gray-400 rounded-b-lg bg-white p-8 flex flex-col items-center">
          <div className="w-full max-w-2xl mb-8">
            <div className="flex flex-col gap-4">
              <label className="text-[17px] text-gray-700 text-left">{LINUX_CLI_LABELS.command}</label>
              <div className="flex flex-col w-full">
                <input
                  type="text"
                  className="border border-gray-400 rounded px-3 py-2 text-base text-gray-800 bg-white w-full h-12"
                  value={command}
                  onChange={(e) => { setCommand(e.target.value); setCommandError(''); }}
                  onKeyPress={handleKeyPress}
                  placeholder={LINUX_CLI_PLACEHOLDERS.command}
                  disabled={loading}
                />
                <div className="min-h-[20px]">
                  {commandError && <span className="text-red-600 text-sm">{commandError}</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full flex flex-row justify-center gap-12 mb-8">
            <Button variant="contained" sx={buttonSx} onClick={executeCommand} disabled={loading || !command.trim()}>
              {loading ? LINUX_CLI_BUTTONS.loading : LINUX_CLI_BUTTONS.submit}
            </Button>
            <Button variant="contained" sx={buttonSx} onClick={clearLogs} disabled={loading}>
              {LINUX_CLI_BUTTONS.clear}
            </Button>
          </div>

          <div className="w-full flex flex-col md:flex-row md:items-start gap-4">
            <label className="text-[17px] text-gray-700 min-w-[80px] md:pt-2">{LINUX_CLI_LABELS.logs}</label>
            <textarea
              className="w-full min-h-[300px] max-h-[500px] border border-gray-400 rounded bg-white text-[14px] p-3 font-mono resize-y"
              value={logs}
              onChange={(e) => setLogs(e.target.value)}
              placeholder={LINUX_CLI_PLACEHOLDERS.logs}
              readOnly
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinuxCLI;


