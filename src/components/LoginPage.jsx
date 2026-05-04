import React, { useState, useEffect } from 'react';
import clixxoLogo from '../assets/Clixxo_Logo.png';
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
    <div className="min-h-screen flex flex-col items-center justify-start bg-[#2C3E5a] bg-no-repeat bg-cover bg-center">

      {/* Top Bar */}
      <div className="w-screen h-[170px] relative overflow-hidden bg-cover bg-center">
        {serverStatus === 'offline' && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="bg-[#f8d7da] text-[#721c24] px-2 py-3 rounded-lg text-lg font-medium border border-[#f5c6cb] shadow-lg flex flex-col items-center">
              <div className="flex items-center mb-3">
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
      <div className="flex items-start justify-center bg-white px-2 py-0 mt-0 border border-gray-400 rounded-lg w-[95%] max-w-[350px]">

        <div className="px-5 py-10 flex flex-col items-center relative mt-0.5 w-[95vw] max-w-[350px]">

          {/* Toast (kept from original) */}
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
            <img src={clixxoLogo} alt="Clixxo Logo" className="w-38 max-w-full ml-0" />
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="w-full items-center">
            <div className="flex items-center gap-2 mb-6">
              <input
                id="username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Username"
                disabled={isLoading || serverStatus === 'offline'}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && username && password) handleLogin(e);
                }}
                className="w-full px-4 py-1.5 pr-12 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
            <div className="flex items-center gap-2 mb-6">
              <div className="relative w-full">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  disabled={isLoading || serverStatus === 'offline'}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && username && password) handleLogin(e);
                  }}
                  className="w-full px-4 py-1.5 pr-12 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  disabled={isLoading || serverStatus === 'offline'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors"
                >
                  {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </button>
              </div>
            </div>
            <div className="flex gap-2 w-full">
              <button
                type="submit"
                disabled={isLoading || serverStatus === 'offline'}
                className={`w-full py-2 px-2 text-sm font-bold text-white rounded-lg transition-all duration-200 transform shadow-md ${
                  isLoading || serverStatus === 'offline'
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#2d3436] hover:bg-[#1a1a1a] hover:shadow-lg active:scale-95'
                }`}
              >
                {isLoading ? 'LOGGING IN...' : serverStatus === 'offline' ? 'SERVER OFFLINE' : 'LOGIN'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className={`w-full py-2 px-2 text-sm font-bold rounded-lg transition-all duration-200 transform shadow-md ${
                  isLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#636e72] text-white hover:bg-[#4a5568] hover:shadow-lg active:scale-95'
                }`}
              >
                CANCEL
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 