import React, { useState, useRef, useEffect } from 'react';
import {
  CONFIG_FILE_TITLE,
  CONFIG_FILE_OPTIONS,
  CONFIG_FILE_EDIT_BUTTON,
  CONFIG_FILE_SAVE_BUTTON,
  CONFIG_FILE_CONTENT_MAP
} from '../constants/ConfigFileConstants';
import { fetchHostsFile, updateHostsFile } from '../api/apiService';
import { Button, Alert, CircularProgress } from '@mui/material';

// Standard blue bar styling used across the application
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
  fontSize: 18,
  color: '#444',
  justifyContent: 'center',
  boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)',
};

// Standard button styling used across the application
const buttonSx = {
  background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
  color: '#fff',
  fontWeight: 600,
  fontSize: '16px',
  borderRadius: 1.5,
  minWidth: 120,
  px: 2,
  py: 0.5,
  boxShadow: '0 2px 8px #b3e0ff',
  textTransform: 'none',
  '&:hover': {
    background: 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)',
    color: '#fff',
  },
};

const ConfigFile = () => {
  const [selectedFile, setSelectedFile] = useState(CONFIG_FILE_OPTIONS[0].value);
  const [content, setContent] = useState(CONFIG_FILE_CONTENT_MAP[CONFIG_FILE_OPTIONS[0].value]);
  const [isEditing, setIsEditing] = useState(true);
  const [loading, setLoading] = useState({
    fetch: false,
    save: false
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const textareaRef = useRef(null);
  const hasInitialLoadRef = useRef(false);

  // Message handling
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // Load hosts file from API
  const loadHostsFile = async () => {
    if (loading.fetch) {
      return;
    }
    
    setLoading(prev => ({ ...prev, fetch: true }));
    try {
      console.log('Attempting to load hosts file...');
      const response = await fetchHostsFile();
      console.log('Hosts file response:', response);
      if (response.response && response.responseData) {
        setContent(response.responseData);
        showMessage('success', 'Hosts file loaded successfully');
      } else {
        console.log('Invalid response format:', response);
        showMessage('error', 'Failed to load hosts file');
      }
    } catch (error) {
      console.error('Error loading hosts file:', error);
      if (error.message === 'Network Error') {
        showMessage('error', 'Network error. Please check your connection.');
      } else {
        showMessage('error', error.message || 'Failed to load hosts file');
      }
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };

  // Save hosts file to API
  const saveHostsFile = async () => {
    if (loading.save) {
      return;
    }
    
    setLoading(prev => ({ ...prev, save: true }));
    try {
      console.log('Attempting to save hosts file...');
      const response = await updateHostsFile(content);
      console.log('Save hosts file response:', response);
      if (response.message) {
        showMessage('success', response.message || 'Hosts file saved successfully');
        setIsEditing(true);
      } else {
        showMessage('error', 'Failed to save hosts file');
      }
    } catch (error) {
      console.error('Error saving hosts file:', error);
      if (error.message === 'Network Error') {
        showMessage('error', 'Network error. Please check your connection.');
      } else {
        showMessage('error', error.message || 'Failed to save hosts file');
      }
    } finally {
      setLoading(prev => ({ ...prev, save: false }));
    }
  };

  // Load hosts file on component mount when hosts is selected
  useEffect(() => {
    if (selectedFile === 'hosts' && !hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadHostsFile();
    }
  }, [selectedFile]);

  const handleFileChange = (e) => {
    const value = e.target.value;
    setSelectedFile(value);
    
    // If hosts file is selected, load from API, otherwise use static content
    if (value === 'hosts') {
      loadHostsFile();
    } else {
      setContent(CONFIG_FILE_CONTENT_MAP[value] || '');
    }
    setIsEditing(true);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const len = textareaRef.current.value.length;
        textareaRef.current.setSelectionRange(len, len);
      }
    }, 0);
  };

  // Auto-enable editing when textarea is clicked
  const handleTextareaClick = () => {
    if (!isEditing && !loading.fetch) {
      setIsEditing(true);
    }
  };
  const handleSave = () => {
    // If hosts file is selected, save to API, otherwise just keep editing enabled
    if (selectedFile === 'hosts') {
      saveHostsFile();
    } else {
      setIsEditing(true);
    }
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-200px)] py-0.5 flex flex-col items-center" style={{backgroundColor: "#dde0e4"}}>
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
      
      <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        {/* File selector above the blue bar */}
        <div className="w-full flex justify-end mb-2">
          <select
            className="px-3 py-1 border border-gray-400 rounded text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={selectedFile}
            onChange={handleFileChange}
            disabled={loading.fetch}
            style={{ minWidth: '150px' }}
          >
            {CONFIG_FILE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        
        {/* Standard blue bar */}
        <div style={blueBarStyle}>{CONFIG_FILE_TITLE}</div>
        
        {/* Main content container with standard border */}
        <div style={{ border: '1px solid #444444', borderTop: 'none', backgroundColor: '#dde0e4' }}>
          <div className="relative">
            {loading.fetch && selectedFile === 'hosts' && (
              <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
                <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-lg shadow-lg">
                  <CircularProgress size={24} />
                  <span className="text-gray-700 font-medium">Loading hosts file...</span>
                </div>
              </div>
            )}
            <textarea
              ref={textareaRef}
              className="w-full min-h-[400px] h-[400px] resize-vertical text-base bg-white p-3 box-border outline-none cursor-text"
              value={content}
              onChange={e => setContent(e.target.value)}
              onClick={handleTextareaClick}
              readOnly={loading.fetch}
              spellCheck={false}
              style={{ 
                border: 'none',
                margin: '0',
                fontFamily: 'monospace'
              }}
              placeholder="Click to edit configuration content..."
            />
          </div>
        </div>
        
        {/* Action buttons with DHCP page styling */}
        <div className="flex justify-center gap-4 pt-6">
          <Button
            type="submit"
            variant="contained"
            onClick={handleSave}
            sx={{
              background: 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '16px',
              minWidth: 120,
              minHeight: 40,
              px: 2,
              py: 0.5,
              boxShadow: '0 2px 8px #b3e0ff',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
                color: '#fff',
              },
              '&:disabled': {
                background: '#f5f5f5',
                color: '#666',
              },
            }}
            disabled={loading.fetch || loading.save}
            startIcon={loading.save && <CircularProgress size={20} color="inherit" />}
          >
            {loading.save ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            type="button"
            variant="contained"
            onClick={() => {
              if (selectedFile === 'hosts') {
                loadHostsFile();
              } else {
                setContent(CONFIG_FILE_CONTENT_MAP[selectedFile] || '');
              }
            }}
            sx={{
              background: 'linear-gradient(to bottom, #e5e7eb 0%, #d1d5db 100%)',
              color: '#374151',
              fontWeight: 600,
              fontSize: '16px',
              minWidth: 120,
              minHeight: 40,
              px: 2,
              py: 0.5,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(to bottom, #e5e7eb 0%, #d1d5db 100%)',
                color: '#374151',
              },
              '&:disabled': {
                background: '#f5f5f5',
                color: '#666',
              },
            }}
            disabled={loading.fetch || loading.save}
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfigFile; 