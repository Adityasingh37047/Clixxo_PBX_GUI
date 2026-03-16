import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchLogin } from '../api/apiService';

// Create the context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [BASE_URL, setBASE_URL] = useState('');
 

  function getBaseURL() {
    // setChangesMade(!changesMade);
    const url = new URL(window.location.origin);
    const ip = url.hostname;
    const port = url.port || (url.protocol === "https:" ? "443" : "80");
    const isLocalhost =
      ip === "localhost" || ip === "127.0.0.1" || ip === "0.0.0.0";
  
    if (isLocalhost) {
    let testIp='192.168.0.93';
      // Local development → backend usually runs on 5000
      return `https://${testIp}:443/api`;
    } else {
      // Production → use whatever URL the site is running on
      console.log('Production → use whatever URL the site is running on', ip, port);
      return `${url.protocol}//${ip}:${port}/api`;
    }
  }


useEffect(() => {
  console.log(getBaseURL(),"in auth context");
  setBASE_URL(getBaseURL());
}, [getBaseURL]);



  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem('isAuthenticated') === 'true';
      const userData = localStorage.getItem('user');
      
      setIsAuthenticated(authStatus);
      setUser(userData ? JSON.parse(userData) : null);
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      const response = await fetchLogin({ username, password });
      console.log('Login response:', response);
      
      if (response.response === true) {
        const userData = { 
          username: response.data?.username || username, 
          password: password, // Store the password
          role: response.data?.role || 'admin',
          id: response.data?.id,
          ...response.data 
        };
        
        // Update state
        setIsAuthenticated(true);
        setUser(userData);
        
        // Save to localStorage
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Save authentication token if provided by the API
        if (response.data?.token) {
          localStorage.setItem('authToken', response.data.token);
        }
        
        return userData;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Invalid credentials');
    }
  };

  // Logout function
  const logout = () => {
    // Update state
    setIsAuthenticated(false);
    setUser(null);
    
    // Clear localStorage
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
  };

  // Auto-logout on inactivity (5 minutes)
  useEffect(() => {
    let timerId = null;
    const TIMEOUT_MS = 30 * 60 * 1000; // 5 minutes

    const resetTimer = () => {
      if (timerId) clearTimeout(timerId);
      timerId = setTimeout(() => {
        // Only logout if currently authenticated
        if (localStorage.getItem('isAuthenticated') === 'true') {
          logout();
        }
      }, TIMEOUT_MS);
    };

    const activityEvents = ['click', 'mousemove', 'keydown', 'touchstart', 'scroll'];
    activityEvents.forEach(evt => window.addEventListener(evt, resetTimer, { passive: true }));

    // Start timer initially
    resetTimer();

    return () => {
      if (timerId) clearTimeout(timerId);
      activityEvents.forEach(evt => window.removeEventListener(evt, resetTimer));
    };
  }, []);

  // Update user function
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    updateUser,
    BASE_URL,
    setBASE_URL,
    getBaseURL,
    
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 