import React, { useState, useEffect } from 'react';
import clixxoLogo from '../assets/LoginPageLogo2.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchLogin } from '../api/apiService';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState('online'); // Default to online, will be checked during login
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, IP, PORT, METHOD } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!username.trim() || !password.trim()) {
      
      setError('Please enter both username and password');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setServerStatus('online'); // Reset server status
    
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      
      // Check if it's a network/server error
      if (err.message.includes('Network Error') || err.message.includes('Failed to fetch')) {
        setServerStatus('offline');
        // Don't set error state for network issues - the server status message will handle it
      } else {
        setError(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setUsername('');
    setPassword('');
    setError('');
    setServerStatus('online');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };


  
  return (
    <div className="min-h-screen bg-[#e3e7ef] flex flex-col items-center justify-start">
      {/* Top Bar */}
      <div className="w-screen h-[170px] bg-[#23272b] relative overflow-hidden">
        {/* Server Status in Top Bar */}
        {serverStatus === 'offline' && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="bg-[#f8d7da] text-[#721c24] px-6 py-4 rounded-lg text-lg font-medium border border-[#f5c6cb] shadow-lg flex flex-col items-center">
              <div className="flex items-center mb-6">
                <span className="mr-3 text-xl">⚠️</span>
                Server is offline. Please check your connection.
              </div>
              <button
                onClick={() => {
                  setServerStatus('online');
                  if (username.trim() && password.trim()) {
                    handleLogin({ preventDefault: () => {} });
                  }
                }}
                className="bg-[#721c24] text-white px-4 py-2 rounded-md hover:bg-[#5a1a1a] transition-colors"
              >
                Retry Connection
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Login Card */}
      <div className="px-6 py-10 flex flex-col items-center relative mt-0.5 w-[95vw] max-w-[400px]">
        {/* Error Message */}
        {error && (
          <div className="bg-[#f8d7da] text-[#a94442] px-5 py-3 rounded-md text-base font-medium mb-6 w-full max-w-xs absolute -top-16 left-1/2 -translate-x-1/2 border border-[#f5c6cb] flex items-center justify-between z-10 shadow">
            <span className="flex items-center">
              
              {error}
            </span>
            <span
              className="cursor-pointer text-2xl ml-4 leading-none"
              onClick={() => setError('')}
            >
              &times;
            </span>
          </div>
        )}
        
        {/* Loading Message */}
        {isLoading && (
          <div className="bg-[#d1ecf1] text-[#0c5460] px-5 py-3 rounded-md text-base font-medium mb-6 w-full max-w-xs absolute -top-16 left-1/2 -translate-x-1/2 border border-[#bee5eb] flex items-center justify-center z-10 shadow">
            <span className="mr-2">⏳</span>
            Connecting to server...
          </div>
        )}
        {/* Logo */}
        <div className="mb-6 flex justify-center items-center w-full">
          <img src={clixxoLogo} alt="Clixxo Logo" className="w-36 max-w-full -ml-18" />
        </div>
        {/* Login Form */}
        <form onSubmit={handleLogin} className="w-full max-w-xs mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <label className="text-base text-gray-700 font-medium whitespace-nowrap w-20" htmlFor="username">Username:</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="text-base px-2 py-0.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white disabled:bg-gray-100 w-40"
              // placeholder="Enter username"
              autoFocus
              disabled={isLoading}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && password) {
                  handleLogin(e);
                }
              }}
            />
          </div>
          <div className="flex items-center gap-2 mb-6">
            <label className="text-base text-gray-700 font-medium whitespace-nowrap w-20" htmlFor="password">Password :</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="text-base px-2 py-0.5 pr-8 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white disabled:bg-gray-100 w-40"
                // placeholder="Enter password"
                disabled={isLoading}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && username && password) {
                    handleLogin(e);
                  }
                }}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none disabled:opacity-50"
                disabled={isLoading}
              >
                {showPassword ? <VisibilityOff style={{ fontSize: 16 }} /> : <Visibility style={{ fontSize: 16 }} />}
              </button>
            </div>
          </div>
          <div className="flex gap-2 w-full max-w-xs">
            <button
              type="submit"
              disabled={isLoading || serverStatus === 'offline'}
              className={` w-30 px-3 py-0.5 text-base font-semibold shadow-md transition-all duration-200 transform
                ${isLoading || serverStatus === 'offline'
                  ? 'bg-gray-300 text-white cursor-not-allowed'
                  : 'bg-gradient-to-b from-[#3bb6f5] to-[#0e8fd6] text-gray-700 hover:from-[#249be8] hover:to-[#0a6fae] hover:shadow-lg hover:scale-105 hover:-translate-y-0.5 active:scale-95 cursor-pointer'}
              `}
            >
              {isLoading ? 'Logging in...' : serverStatus === 'offline' ? 'Server Offline' : 'Login'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className={`w-30 px-3 py-0.5 text-base font-semibold shadow-md transition-all duration-200 transform
                ${isLoading
                  ? 'bg-gray-300 text-white cursor-not-allowed'
                  : 'bg-gradient-to-b from-[#e5e7eb] to-[#9ca3af] text-gray-700 hover:from-[#f3f4f6] hover:to-[#6b7280] hover:shadow-lg hover:scale-105 hover:-translate-y-0.5 active:scale-95 cursor-pointer'}
              `}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage; 