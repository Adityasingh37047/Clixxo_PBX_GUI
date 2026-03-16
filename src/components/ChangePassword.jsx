import React, { useState, useEffect } from 'react';
import { fetchChangePassword } from '../api/apiService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { IconButton, InputAdornment, TextField, Paper, Typography } from '@mui/material';

import {
  CHANGE_PASSWORD_FIELDS,
  CHANGE_PASSWORD_INITIAL_FORM,
  CHANGE_PASSWORD_BUTTONS,
  CHANGE_PASSWORD_NOTE,
} from '../constants/ChangePasswordConstants';
import Button from '@mui/material/Button';

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

const ChangePassword = () => {
  const [form, setForm] = useState(CHANGE_PASSWORD_INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false
  });
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  // Set current username and password from auth context
  useEffect(() => {
    if (user?.username) {
      setForm(prev => ({
        ...prev,
        currentUsername: user.username,
        currentPassword: user.password || '' // Get stored password if available
      }));
    }
  }, [user]);

  // Validation functions
  const passwordRegex = /^[A-Za-z0-9_]{5,}$/;
  
  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 5) return 'Password must be at least 5 characters';
    if (password.length > 12) return 'Password must be maximum 12 characters';
    if (!passwordRegex.test(password)) {
      return 'Password can only contain letters, numbers, and underscores';
    }
    return '';
  };

  const validateUsername = (username) => {
    if (!username) return 'Username is required';
    if (username.length < 5) return 'Username must be at least 5 characters';
    if (username.length > 12) return 'Username must be maximum 12 characters';
    if (!passwordRegex.test(username)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    return '';
  };

  const validateForm = () => {
    const errors = {};
    
    // Validate current username
    if (!form.currentUsername) {
      errors.currentUsername = 'Current username is required';
    }
    
    // Validate current password
    if (!form.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    // Validate new username
    const usernameError = validateUsername(form.newUsername);
    if (usernameError) {
      errors.newUsername = usernameError;
    }
    
    // Validate new password
    const passwordError = validatePassword(form.newPassword);
    if (passwordError) {
      errors.newPassword = passwordError;
    }
    
    // Validate confirm password
    if (form.newPassword !== form.confirmNewPassword) {
      errors.confirmNewPassword = 'Passwords do not match';
    }
    
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleTogglePasswordVisibility = (fieldName) => {
    setShowPasswords(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please fix the validation errors before saving.');
      return;
    }

    try {
      setLoading(true);
      setError("");
      setFieldErrors({});

      const changePasswordData = {
        currentUsername: form.currentUsername,
        currentPassword: form.currentPassword,
        newUsername: form.newUsername,
        newPassword: form.newPassword,
        confirmNewPassword: form.confirmNewPassword
      };

      console.log('Changing password with data:', changePasswordData);
      const response = await fetchChangePassword(changePasswordData);
      
      if (response.response === true) {
        // Update user data with new username and password
        const updatedUserData = {
          ...user,
          username: form.newUsername,
          password: form.newPassword // Store the new password
        };
        updateUser(updatedUserData);
        
        // Reset form to show new credentials
        setForm({
          currentUsername: form.newUsername, // Update to new username
          currentPassword: form.newPassword, // Update to new password
          newUsername: '',
          newPassword: '',
          confirmNewPassword: ''
        });
        
        alert('Username and password changed successfully! You will be redirected to login page.');
        // Logout and redirect to login
        logout();
        navigate('/login');
      } else {
        setError(response.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setError(error.message || 'Error changing password. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="bg-gray-50 min-h-[calc(100vh-80px)] flex flex-col items-center">
      <div className="w-full max-w-6xl mx-auto">
        {/* Error Message */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '16px',
            padding: '12px 16px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            color: '#dc2626',
            fontSize: '14px',
            maxWidth: '600px',
            width: '100%'
          }}>
            <span style={{ marginRight: '8px' }}>❌</span>
            <span>{error}</span>
          </div>
        )}

        {/* Loading Message */}
        {loading && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '16px',
            padding: '12px 16px',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '6px',
            color: '#1d4ed8',
            fontSize: '14px',
            maxWidth: '600px',
            width: '100%'
          }}>
            <span style={{ marginRight: '8px' }}>⏳</span>
            <span>Changing password...</span>
          </div>
        )}

        {/* Header */}
        <div style={blueBarStyle}>
          Change Password
        </div>

        {/* Content */}
        <Paper elevation={3} className="p-6 bg-white rounded-b-lg shadow-lg" style={{ borderTop: 'none' }}>
          <div className="space-y-6">
            <form onSubmit={handleSave}>
              <div className="space-y-6 max-w-md mx-auto">
                {CHANGE_PASSWORD_FIELDS.map((field) => (
                  <div key={field.name} className="flex items-center">
                    <label className="w-48 text-left pr-6 text-gray-700 font-medium whitespace-nowrap">
                      {field.label}:
                    </label>
                    <div className="flex-1 flex flex-col">
                      {field.type === 'password' ? (
                        <TextField
                          name={field.name}
                          value={form[field.name]}
                          onChange={handleChange}
                          type={showPasswords[field.name] ? 'text' : 'password'}
                          disabled={loading}
                          autoComplete="off"
                          variant="outlined"
                          size="small"
                          sx={{
                            width: '100%',
                            '& .MuiOutlinedInput-root': {
                              height: 36,
                              fontSize: 13,
                              backgroundColor: '#fff',
                              '& fieldset': {
                                borderColor: fieldErrors[field.name] ? '#dc2626' : '#ccc',
                              },
                              '&:hover fieldset': {
                                borderColor: fieldErrors[field.name] ? '#dc2626' : '#888',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: fieldErrors[field.name] ? '#dc2626' : '#888',
                              },
                            },
                            '& .MuiInputBase-input': {
                              fontSize: 15,
                              color: '#000',
                            },
                          }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label="toggle password visibility"
                                  onClick={() => handleTogglePasswordVisibility(field.name)}
                                  edge="end"
                                  size="small"
                                  sx={{
                                    color: '#666',
                                    '&:hover': {
                                      color: '#888',
                                    },
                                  }}
                                >
                                  {showPasswords[field.name] ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      ) : (
                        <TextField
                          name={field.name}
                          value={form[field.name]}
                          onChange={handleChange}
                          type="text"
                          disabled={loading}
                          autoComplete="off"
                          variant="outlined"
                          size="small"
                          sx={{
                            width: '100%',
                            '& .MuiOutlinedInput-root': {
                              height: 36,
                              fontSize: 13,
                              backgroundColor: field.name === 'currentUsername' ? '#f5f5f5' : '#fff',
                              '& fieldset': {
                                borderColor: fieldErrors[field.name] ? '#dc2626' : '#ccc',
                              },
                              '&:hover fieldset': {
                                borderColor: fieldErrors[field.name] ? '#dc2626' : '#888',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: fieldErrors[field.name] ? '#dc2626' : '#888',
                              },
                            },
                            '& .MuiInputBase-input': {
                              fontSize: 15,
                              color: '#000',
                            },
                          }}
                        />
                      )}
                      {fieldErrors[field.name] && (
                        <div style={{
                          color: '#dc2626',
                          fontSize: '12px',
                          marginTop: '4px',
                          marginLeft: '4px'
                        }}>
                          {fieldErrors[field.name]}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-center mt-8">
                <Button 
                  sx={buttonSx} 
                  onClick={handleSave}
                  disabled={loading}
                  size="large"
                >
                  {loading ? 'Changing Password...' : 'Save'}
                </Button>
              </div>
            </form>
          </div>
        </Paper>
      </div>
      
      {/* Red note text in background */}
      <div className="w-full text-center mt-6">
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'red', 
            fontSize: '16px', 
            fontWeight: 500 
          }}
        >
          {CHANGE_PASSWORD_NOTE}
        </Typography>
      </div>
    </div>
  );
};

export default ChangePassword; 