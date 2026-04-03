import React, { useState, useEffect } from 'react';
import {
  TR069_CONFIG_TITLE,
  TR069_CONFIG_FIELDS,
  BUTTON_LABELS,
  VALIDATION_MESSAGES,
} from './constants/TR069ConfigConstants';

const getInitialState = () => {
  const state = {};
  TR069_CONFIG_FIELDS.forEach(field => {
    if (field.type === 'checkbox') {
      state[field.key] = field.defaultValue || false;
    } else {
      state[field.key] = field.defaultValue || '';
    }
  });
  return state;
};

function TR069Config() {
  const [form, setForm] = useState(getInitialState());

  // Note: Field enabling/disabling is handled by isFieldDisabled function
  // We don't need to modify form state when TR069 is toggled

  // Handle auth mode change
  useEffect(() => {
    if (form.authmode === '0') {
      setForm(prev => ({
        ...prev,
        username: '',
        password: '',
      }));
    }
  }, [form.authmode]);

  const handleCheckboxChange = (key) => {
    setForm(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleInputChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSelectChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleKeyPress = (e, type) => {
    const key = e.keyCode || e.which;
    if (type === 'number') {
      // Only allow numbers and backspace
      if (!(key === 8 || key === 127 || (key >= 48 && key <= 57))) {
        e.preventDefault();
      }
    } else if (type === 'text') {
      // Block special characters: space, !, ", &, `, (, ), ;, =, \, |, ~
      if (key === 32 || key === 33 || key === 34 || key === 38 || key === 39 || 
          key === 40 || key === 41 || key === 59 || key === 61 || key === 92 || 
          key === 124 || key === 126) {
        if (key !== 8) {
          e.preventDefault();
        }
      }
    }
  };

  const validateForm = () => {
    if (form.enable_tr069) {
      if (!form.acs_url.trim()) {
        alert(VALIDATION_MESSAGES.ACS_URL_REQUIRED);
        document.getElementById('acs_url')?.focus();
        return false;
      }

      if (!form.informInterval.trim()) {
        alert(VALIDATION_MESSAGES.INFORM_INTERVAL_REQUIRED);
        document.getElementById('informInterval')?.focus();
        return false;
      }

      const interval = parseInt(form.informInterval);
      if (isNaN(interval) || interval < 30 || interval > 604800) {
        alert(VALIDATION_MESSAGES.INFORM_INTERVAL_RANGE);
        document.getElementById('informInterval')?.focus();
        return false;
      }

      if (form.authmode !== '0') {
        if (!form.username.trim()) {
          alert(VALIDATION_MESSAGES.USERNAME_REQUIRED);
          document.getElementById('username')?.focus();
          return false;
        }

        if (form.username.length > 128) {
          alert(VALIDATION_MESSAGES.USERNAME_LENGTH);
          document.getElementById('username')?.focus();
          return false;
        }

        if (!form.password.trim()) {
          alert(VALIDATION_MESSAGES.PASSWORD_REQUIRED);
          document.getElementById('password')?.focus();
          return false;
        }

        if (form.password.length > 128) {
          alert(VALIDATION_MESSAGES.PASSWORD_LENGTH);
          document.getElementById('password')?.focus();
          return false;
        }
      }
    }
    return true;
  };

  const handleSave = () => {
    if (validateForm()) {
      alert('Settings saved successfully!');
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings?')) {
      setForm(getInitialState());
    }
  };

  const isFieldDisabled = (field) => {
    // All fields depend on TR069 being enabled
    if (!form.enable_tr069) {
      return true;
    }
    
    // STUN fields depend on STUN being enabled
    if (field.dependsOn === 'enable_stun') {
      return !form.enable_stun;
    }
    
    // Username and password depend on auth mode not being NONE
    if (field.dependsOn === 'authmode') {
      return form.authmode === '0';
    }
    
    return false;
  };

  return (
    <div
      className="bg-gray-50 min-h-[calc(100vh-128px)] py-2"
      style={{ backgroundColor: '#dde0e4' }}
    >
      <div className="flex justify-center">
        <div className="w-full" style={{ maxWidth: '1024px' }}>
          {/* Page Title Bar */}
          <div className="w-full h-8 bg-gradient-to-b from-[#b3e0ff] via-[#6ec1f7] to-[#3b8fd6] flex items-center justify-center font-semibold text-lg text-gray-700 shadow mb-0">
            <span>{TR069_CONFIG_TITLE}</span>
          </div>
        
          {/* Main Card */}
          <div className="bg-[#dde0e4] border-2 border-gray-400 border-t-0 shadow-sm py-6" style={{ fontSize: '13px' }}>
            <div className="flex justify-center pl-8">
              <table style={{ tableLayout: 'fixed', width: '100%', maxWidth: '800px', fontSize: '13px' }}>
                <colgroup>
                  <col style={{ width: '15%' }} />
                  <col style={{ width: '40%' }} />
                  <col style={{ width: '45%' }} />
                </colgroup>
                <tbody>
                  <tr>
                    <td width="15%">&nbsp;</td>
                    <td width="40%">&nbsp;</td>
                    <td width="45%">&nbsp;</td>
                  </tr>
                  
                  {/* TR069 Checkbox */}
                  <tr>
                    <td>&nbsp;</td>
                    <td className="text-gray-700 text-left" style={{ fontSize: '13px' }}>
                      {TR069_CONFIG_FIELDS[0].label}
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      <input
                        type="checkbox"
                        name="enable_tr069"
                        id="enable_tr069"
                        checked={form.enable_tr069}
                        onChange={() => handleCheckboxChange('enable_tr069')}
                        className="mr5"
                        style={{ 
                          backgroundColor: '#ffffff', 
                          border: '1px solid #999',
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer',
                          marginRight: '5px',
                          verticalAlign: 'middle',
                        }}
                      />
                      <span className="text-gray-700" style={{ fontSize: '13px' }}>
                        {BUTTON_LABELS.ENABLE}
                      </span>
                    </td>
                  </tr>
                  <tr><td>&nbsp;</td></tr>
                  
                  {/* CPE to ACS URL */}
                  <tr>
                    <td>&nbsp;</td>
                    <td className="text-gray-700 text-left" style={{ fontSize: '13px' }}>
                      {TR069_CONFIG_FIELDS[1].label}
                    </td>
                    <td>
                      <input
                        type="text"
                        id="acs_url"
                        name="acs_url"
                        className="text1"
                        size="24"
                        maxLength="128"
                        value={form.acs_url}
                        onChange={(e) => handleInputChange('acs_url', e.target.value)}
                        disabled={isFieldDisabled(TR069_CONFIG_FIELDS[1])}
                        style={{
                          fontSize: '13px',
                          backgroundColor: '#ffffff',
                          border: '1px solid #999',
                          padding: '3px 6px',
                          width: '200px',
                          height: '28px',
                          imeMode: 'disabled',
                          opacity: isFieldDisabled(TR069_CONFIG_FIELDS[1]) ? 0.6 : 1,
                        }}
                      />
                    </td>
                  </tr>
                  <tr><td>&nbsp;</td></tr>
                  
                  {/* ACS Authentication Mode */}
                  <tr>
                    <td>&nbsp;</td>
                    <td className="text-gray-700 text-left" style={{ fontSize: '13px' }}>
                      {TR069_CONFIG_FIELDS[2].label}
                    </td>
                    <td>
                      <select
                        className="select"
                        name="authmode"
                        id="authmode"
                        value={form.authmode}
                        onChange={(e) => handleSelectChange('authmode', e.target.value)}
                        disabled={isFieldDisabled(TR069_CONFIG_FIELDS[2])}
                        style={{
                          fontSize: '13px',
                          backgroundColor: '#ffffff',
                          border: '1px solid #999',
                          padding: '3px 6px',
                          width: '155px',
                          height: '28px',
                          opacity: isFieldDisabled(TR069_CONFIG_FIELDS[2]) ? 0.6 : 1,
                        }}
                      >
                        {TR069_CONFIG_FIELDS[2].options.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                  <tr><td>&nbsp;</td></tr>
                  
                  {/* ACS Username */}
                  <tr>
                    <td>&nbsp;</td>
                    <td className="text-gray-700 text-left" style={{ fontSize: '13px' }}>
                      {TR069_CONFIG_FIELDS[3].label}
                    </td>
                    <td>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        className="text1"
                        size="24"
                        maxLength="128"
                        value={form.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        disabled={isFieldDisabled(TR069_CONFIG_FIELDS[3])}
                        style={{
                          fontSize: '13px',
                          backgroundColor: '#ffffff',
                          border: '1px solid #999',
                          padding: '3px 6px',
                          width: '200px',
                          height: '28px',
                          opacity: isFieldDisabled(TR069_CONFIG_FIELDS[3]) ? 0.6 : 1,
                        }}
                      />
                    </td>
                  </tr>
                  <tr><td>&nbsp;</td></tr>
                  
                  {/* ACS Password */}
                  <tr>
                    <td>&nbsp;</td>
                    <td className="text-gray-700 text-left" style={{ fontSize: '13px' }}>
                      {TR069_CONFIG_FIELDS[4].label}
                    </td>
                    <td>
                      <input
                        type="text"
                        id="password"
                        name="password"
                        className="text1"
                        size="24"
                        maxLength="128"
                        value={form.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        disabled={isFieldDisabled(TR069_CONFIG_FIELDS[4])}
                        style={{
                          fontSize: '13px',
                          backgroundColor: '#ffffff',
                          border: '1px solid #999',
                          padding: '3px 6px',
                          width: '200px',
                          height: '28px',
                          opacity: isFieldDisabled(TR069_CONFIG_FIELDS[4]) ? 0.6 : 1,
                        }}
                      />
                    </td>
                  </tr>
                  <tr><td>&nbsp;</td></tr>
                  
                  {/* CPE Inform Interval */}
                  <tr>
                    <td>&nbsp;</td>
                    <td className="text-gray-700 text-left" style={{ fontSize: '13px' }}>
                      {TR069_CONFIG_FIELDS[5].label}
                    </td>
                    <td>
                      <input
                        type="text"
                        id="informInterval"
                        name="informInterval"
                        className="text1"
                        size="24"
                        value={form.informInterval}
                        onChange={(e) => handleInputChange('informInterval', e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, 'number')}
                        disabled={isFieldDisabled(TR069_CONFIG_FIELDS[5])}
                        style={{
                          fontSize: '13px',
                          backgroundColor: '#ffffff',
                          border: '1px solid #999',
                          padding: '3px 6px',
                          width: '200px',
                          height: '28px',
                          imeMode: 'disabled',
                          opacity: isFieldDisabled(TR069_CONFIG_FIELDS[5]) ? 0.6 : 1,
                        }}
                      />
                    </td>
                  </tr>
                  <tr><td>&nbsp;</td></tr>
                  
                  {/* STUN ENABLE */}
                  <tr>
                    <td>&nbsp;</td>
                    <td className="text-gray-700 text-left" style={{ fontSize: '13px' }}>
                      {TR069_CONFIG_FIELDS[6].label}
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      <input
                        type="checkbox"
                        name="enable_stun"
                        id="enable_stun"
                        checked={form.enable_stun}
                        onChange={() => handleCheckboxChange('enable_stun')}
                        disabled={!form.enable_tr069}
                        className="mr5"
                        style={{ 
                          backgroundColor: '#ffffff', 
                          border: '1px solid #999',
                          width: '16px',
                          height: '16px',
                          cursor: form.enable_tr069 ? 'pointer' : 'not-allowed',
                          marginRight: '5px',
                          verticalAlign: 'middle',
                          opacity: form.enable_tr069 ? 1 : 0.6,
                        }}
                      />
                      <span className="text-gray-700" style={{ fontSize: '13px' }}>
                        {BUTTON_LABELS.ENABLE}
                      </span>
                    </td>
                  </tr>
                  <tr><td>&nbsp;</td></tr>
                  
                  {/* STUN Server IP */}
                  <tr>
                    <td>&nbsp;</td>
                    <td className="text-gray-700 text-left" style={{ fontSize: '13px' }}>
                      {TR069_CONFIG_FIELDS[7].label}
                    </td>
                    <td>
                      <input
                        type="text"
                        id="stun_server"
                        name="stun_server"
                        className="text1"
                        size="24"
                        maxLength="128"
                        value={form.stun_server}
                        onChange={(e) => handleInputChange('stun_server', e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, 'text')}
                        disabled={isFieldDisabled(TR069_CONFIG_FIELDS[7])}
                        style={{
                          fontSize: '13px',
                          backgroundColor: '#ffffff',
                          border: '1px solid #999',
                          padding: '3px 6px',
                          width: '200px',
                          height: '28px',
                          opacity: isFieldDisabled(TR069_CONFIG_FIELDS[7]) ? 0.6 : 1,
                        }}
                      />
                    </td>
                  </tr>
                  <tr><td>&nbsp;</td></tr>
                  
                  {/* STUN Server Port */}
                  <tr>
                    <td>&nbsp;</td>
                    <td className="text-gray-700 text-left" style={{ fontSize: '13px' }}>
                      {TR069_CONFIG_FIELDS[8].label}
                    </td>
                    <td>
                      <input
                        type="text"
                        id="stun_serverPort"
                        name="stun_serverPort"
                        className="text1"
                        size="24"
                        maxLength="128"
                        value={form.stun_serverPort}
                        onChange={(e) => handleInputChange('stun_serverPort', e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, 'text')}
                        disabled={isFieldDisabled(TR069_CONFIG_FIELDS[8])}
                        style={{
                          fontSize: '13px',
                          backgroundColor: '#ffffff',
                          border: '1px solid #999',
                          padding: '3px 6px',
                          width: '200px',
                          height: '28px',
                          opacity: isFieldDisabled(TR069_CONFIG_FIELDS[8]) ? 0.6 : 1,
                        }}
                      />
                    </td>
                  </tr>
                  <tr><td>&nbsp;</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Buttons - Outside the bordered box */}
          <div style={{ marginTop: '10px', marginBottom: '10px' }}>&nbsp;</div>
          <div align="center" className="buttonbox" style={{ textAlign: 'center' }}>
            <input
              name="save"
              id="save"
              type="button"
              className="btn blue-btn mr20"
              value={BUTTON_LABELS.SAVE}
              onClick={handleSave}
              style={{
                background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '16px',
                borderRadius: '6px',
                minWidth: '100px',
                height: '42px',
                textTransform: 'none',
                padding: '6px 24px',
                boxShadow: '0 2px 8px #b3e0ff',
                border: '1px solid #0e8fd6',
                cursor: 'pointer',
                marginRight: '20px',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)';
              }}
            />
            &nbsp;&nbsp;&nbsp;&nbsp;
            <input
              name="reset"
              type="button"
              id="reset"
              className="btn blue-btn mr20"
              value={BUTTON_LABELS.RESET}
              onClick={handleReset}
              style={{
                background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '16px',
                borderRadius: '6px',
                minWidth: '100px',
                height: '42px',
                textTransform: 'none',
                padding: '6px 24px',
                boxShadow: '0 2px 8px #b3e0ff',
                border: '1px solid #0e8fd6',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)';
              }}
            />
          </div>
          <div style={{ marginTop: '10px' }}>&nbsp;</div>
        </div>
      </div>
    </div>
  );
}

export default TR069Config;

