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
  const [serverStatus, setServerStatus] = useState('online');
  const [showPassword, setShowPassword] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(null);
  const [lockMessage, setLockMessage] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    const parts = [];
    if (h > 0) parts.push(`${h} hr`);
    if (m > 0) parts.push(`${m} min`);
    if (s > 0 || parts.length === 0) parts.push(`${s} sec`);
    return parts.join(' ');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setIsLoading(true);
    setError('');
    setLockMessage('');
    setAttemptsLeft(null);

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);

      if (err.message.includes('Network Error') || err.message.includes('Failed to fetch')) {
        setServerStatus('offline');
      } else if (err.locked) {
        const secs = err.retryAfter || 300;
        setLockMessage(`Too many attempts. Try again after ${formatTime(secs)}`);
      } else {
        if (err.attemptsLeft !== null && err.attemptsLeft !== undefined) {
          setAttemptsLeft(err.attemptsLeft);
        }
        setError(err.message || 'Invalid credentials. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setUsername('');
    setPassword('');
    setError('');
    setLockMessage('');
    setAttemptsLeft(null);
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
        {/* Toast */}
        {(() => {
          let bg, border, color, icon, text, onDismiss;

          if (isLoading) {
            bg = '#eff6ff'; border = '#93c5fd'; color = '#1d4ed8';
            icon = '⏳'; text = 'Connecting to server...';
          } else if (lockMessage) {
            bg = '#fef2f2'; border = '#fca5a5'; color = '#b91c1c';
            icon = '🔒'; text = lockMessage;
            onDismiss = () => setLockMessage('');
          } else if (attemptsLeft !== null && attemptsLeft > 0) {
            bg = '#fffbeb'; border = '#fcd34d'; color = '#92400e';
            icon = '⚠️'; text = `Invalid credentials — ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} left`;
            onDismiss = () => { setAttemptsLeft(null); setError(''); };
          } else if (error && error !== 'locked') {
            bg = '#fef2f2'; border = '#fca5a5'; color = '#b91c1c';
            icon = '⊘'; text = error;
            onDismiss = () => setError('');
          } else {
            return null;
          }

          return (
            <div style={{
              position: 'absolute', top: -48, left: '50%', transform: 'translateX(-50%)',
              width: 310, zIndex: 20, background: bg, border: `1px solid ${border}`,
              borderRadius: 8, padding: '8px 12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontSize: 14, flexShrink: 0 }}>{icon}</span>
              <span style={{ color, fontSize: 12, fontWeight: 600, flex: 1, lineHeight: 1.4 }}>{text}</span>
              {onDismiss && (
                <span style={{ color, cursor: 'pointer', fontSize: 17, lineHeight: 1, flexShrink: 0, opacity: 0.7 }} onClick={onDismiss}>&times;</span>
              )}
            </div>
          );
        })()}
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
              className={`w-30 px-3 py-0.5 text-base font-semibold shadow-md transition-all duration-200 transform
                ${isLoading || serverStatus === 'offline'
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
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