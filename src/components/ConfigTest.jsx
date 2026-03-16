import React, { useState, useEffect } from 'react';
import { Button, Alert, Box, Typography } from '@mui/material';

const ConfigTest = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadConfig = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      // First try to load from localStorage (dynamic config)
      const dynamicConfig = localStorage.getItem('dynamicEnvConfig');
      if (dynamicConfig) {
        const configObj = JSON.parse(dynamicConfig);
        setConfig(configObj);
        setMessage('Dynamic configuration loaded from URL detection!');
        setLoading(false);
        return;
      }
      
      // Fallback to env.txt file
      const response = await fetch("/env.txt");
      const text = await response.text();
      
      const configObj = {};
      text.split("\n").forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const [key, value] = trimmedLine.split("=");
          if (key && value) {
            configObj[key.trim()] = value.trim();
          }
        }
      });
      
      setConfig(configObj);
      setMessage('Configuration loaded from env.txt file!');
    } catch (error) {
      setMessage(`Error loading configuration: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testApiConnection = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      // Test the current axios instance baseURL
      const response = await fetch("/api/system-info");
      if (response.ok) {
        setMessage('API connection successful!');
      } else {
        setMessage(`API connection failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setMessage(`API connection error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  return (
    <Box sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h5" gutterBottom>
        Dynamic Configuration Test
      </Typography>
      
      {message && (
        <Alert severity={message.includes('Error') || message.includes('failed') ? 'error' : 'success'} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}
      
      <Box sx={{ mb: 2 }}>
        <Button 
          variant="contained" 
          onClick={loadConfig} 
          disabled={loading}
          sx={{ mr: 1 }}
        >
          Reload Config
        </Button>
        <Button 
          variant="outlined" 
          onClick={testApiConnection} 
          disabled={loading}
        >
          Test API
        </Button>
      </Box>
      
      {config && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Current Configuration:
          </Typography>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '10px', 
            borderRadius: '4px',
            fontSize: '14px',
            overflow: 'auto'
          }}>
            {JSON.stringify(config, null, 2)}
          </pre>
        </Box>
      )}
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          To change the server IP, edit the <code>BASE_URL</code> in <code>/public/env.txt</code> and refresh the page.
        </Typography>
      </Box>
    </Box>
  );
};

export default ConfigTest;
