import React from 'react';
import { useAuth } from '../context/AuthContext';

const UserProfile = () => {
  const { user, updateUser } = useAuth();

  const handleUpdateProfile = () => {
    // Example of updating user data
    const updatedUser = {
      ...user,
      lastLogin: new Date().toISOString(),
      preferences: {
        theme: 'light',
        language: 'en'
      }
    };
    updateUser(updatedUser);
  };

  return (
    <div style={{
      padding: '20px',
      background: '#gray-50',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      maxWidth: '400px',
      margin: '20px auto'
    }}>
      <h2 style={{ color: '#333', marginBottom: '20px' }}>User Profile</h2>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>Username:</strong> {user?.username || 'N/A'}
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>Role:</strong> {user?.role || 'N/A'}
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>Last Login:</strong> {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <strong>Preferences:</strong>
        <div style={{ marginLeft: '20px', fontSize: '14px', color: '#666' }}>
          Theme: {user?.preferences?.theme || 'default'}<br />
          Language: {user?.preferences?.language || 'en'}
        </div>
      </div>
      
      <button
        onClick={handleUpdateProfile}
        style={{
          background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
          color: '#fff',
          padding: '8px 16px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        Update Profile
      </button>
    </div>
  );
};

export default UserProfile; 