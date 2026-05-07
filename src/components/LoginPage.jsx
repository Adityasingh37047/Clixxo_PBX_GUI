import React, { useState } from 'react';
import clixxoLogo from '../assets/Clixxo_Logo.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  let toastBg, toastBorder, toastColor, toastIcon, toastText, toastDismiss;
  let showToast = true;
  if (isLoading) {
    toastBg = '#eff6ff'; toastBorder = '#93c5fd'; toastColor = '#1d4ed8';
    toastIcon = '⏳'; toastText = 'Connecting to server...';
  } else if (lockMessage) {
    toastBg = '#fef2f2'; toastBorder = '#fca5a5'; toastColor = '#b91c1c';
    toastIcon = '🔒'; toastText = lockMessage;
    toastDismiss = () => setLockMessage('');
  } else if (attemptsLeft !== null && attemptsLeft > 0) {
    toastBg = '#fffbeb'; toastBorder = '#fcd34d'; toastColor = '#92400e';
    toastIcon = '⚠️'; toastText = `Invalid credentials — ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} left`;
    toastDismiss = () => { setAttemptsLeft(null); setError(''); };
  } else if (error && error !== 'locked') {
    toastBg = '#fef2f2'; toastBorder = '#fca5a5'; toastColor = '#b91c1c';
    toastIcon = '⊘'; toastText = error;
    toastDismiss = () => setError('');
  } else {
    showToast = false;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#4a6080',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>

      {/* Toast */}
      {showToast && (
        <div style={{
          width: 400,
          marginBottom: 14,
          background: toastBg,
          border: `1px solid ${toastBorder}`,
          borderRadius: 8,
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}>
          <span style={{ fontSize: 15, flexShrink: 0 }}>{toastIcon}</span>
          <span style={{ color: toastColor, fontSize: 13, fontWeight: 600, flex: 1, lineHeight: 1.4 }}>{toastText}</span>
          {toastDismiss && (
            <span style={{ color: toastColor, cursor: 'pointer', fontSize: 19, opacity: 0.7 }} onClick={toastDismiss}>&times;</span>
          )}
        </div>
      )}

      {/* Card */}
      <div style={{
        width: 400,
        background: '#ffffff',
        borderRadius: 8,
        boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
        overflow: 'hidden',
      }}>

        {/* Logo + title inside one unified block */}
        <div style={{
          padding: '32px 36px 24px',
          textAlign: 'center',
          borderBottom: '1px solid #edf0f4',
        }}>
          <img src={clixxoLogo} alt="Clixxo" style={{ height: 42, objectFit: 'contain', display: 'block', margin: '0 auto 8px' }} />
          <p style={{ margin: 0, fontSize: 12, color: '#a0aec0', letterSpacing: '0.07em', fontWeight: 500 }}>
            IP PBX Management System
          </p>
        </div>

        {/* Form section */}
        <div style={{ padding: '24px 36px 30px' }}>

          {/* Server offline notice */}
          {serverStatus === 'offline' && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 6,
              padding: '9px 14px', marginBottom: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
            }}>
              <span style={{ color: '#b91c1c', fontSize: 12, fontWeight: 500 }}>⚠ Server unreachable</span>
              <button
                onClick={() => {
                  setServerStatus('online');
                  if (username.trim() && password.trim()) handleLogin({ preventDefault: () => {} });
                }}
                style={{
                  background: '#b91c1c', color: '#fff', border: 'none',
                  borderRadius: 4, padding: '4px 12px', fontSize: 12,
                  fontWeight: 600, cursor: 'pointer',
                }}
              >
                Retry
              </button>
            </div>
          )}

          <form onSubmit={handleLogin}>
            {/* Username */}
            <div style={{ marginBottom: 14 }}>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Username"
                disabled={isLoading || serverStatus === 'offline'}
                autoFocus
                onKeyDown={e => { if (e.key === 'Enter' && username && password) handleLogin(e); }}
                style={{
                  width: '100%', height: 42, padding: '0 14px',
                  border: '1.5px solid #e2e8f0', borderRadius: 6,
                  fontSize: 14, color: '#1e293b',
                  background: isLoading || serverStatus === 'offline' ? '#f8fafc' : '#fff',
                  outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onFocus={e => { e.target.style.borderColor = '#1a73c8'; e.target.style.boxShadow = '0 0 0 3px rgba(26,115,200,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 22, position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                disabled={isLoading || serverStatus === 'offline'}
                onKeyDown={e => { if (e.key === 'Enter' && username && password) handleLogin(e); }}
                style={{
                  width: '100%', height: 42, padding: '0 44px 0 14px',
                  border: '1.5px solid #e2e8f0', borderRadius: 6,
                  fontSize: 14, color: '#1e293b',
                  background: isLoading || serverStatus === 'offline' ? '#f8fafc' : '#fff',
                  outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onFocus={e => { e.target.style.borderColor = '#1a73c8'; e.target.style.boxShadow = '0 0 0 3px rgba(26,115,200,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                disabled={isLoading || serverStatus === 'offline'}
                style={{
                  position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#94a3b8', padding: 0, display: 'flex', alignItems: 'center',
                }}
              >
                {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
              </button>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="submit"
                disabled={isLoading || serverStatus === 'offline'}
                style={{
                  flex: 1, height: 42,
                  background: isLoading || serverStatus === 'offline'
                    ? '#94a3b8'
                    : 'linear-gradient(to bottom, #1e7fd4, #1560a8)',
                  color: '#fff', border: 'none', borderRadius: 7,
                  fontSize: 13, fontWeight: 700, letterSpacing: '0.1em',
                  cursor: isLoading || serverStatus === 'offline' ? 'not-allowed' : 'pointer',
                  boxShadow: isLoading || serverStatus === 'offline' ? 'none' : '0 2px 8px rgba(21,96,168,0.35)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!isLoading && serverStatus !== 'offline') e.target.style.background = 'linear-gradient(to bottom, #2490e8, #1a6dc4)'; }}
                onMouseLeave={e => { if (!isLoading && serverStatus !== 'offline') e.target.style.background = 'linear-gradient(to bottom, #1e7fd4, #1560a8)'; }}
              >
                {isLoading ? 'Logging in...' : serverStatus === 'offline' ? 'Offline' : 'LOGIN'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                style={{
                  flex: 1, height: 42,
                  background: '#f1f5f9',
                  color: '#475569', border: '1.5px solid #e2e8f0', borderRadius: 7,
                  fontSize: 13, fontWeight: 700, letterSpacing: '0.1em',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!isLoading) { e.target.style.background = '#e2e8f0'; e.target.style.color = '#334155'; } }}
                onMouseLeave={e => { if (!isLoading) { e.target.style.background = '#f1f5f9'; e.target.style.color = '#475569'; } }}
              >
                CANCEL
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 24, fontSize: 12, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.04em' }}>
        © 2026 Clixxo Broadband Pvt. Ltd. &nbsp;·&nbsp; All rights reserved
      </div>
    </div>
  );
};

export default LoginPage;
