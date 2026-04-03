import React, { useState } from 'react';
import {
  SYSTEM_MONITOR_TITLE,
  SYSTEM_MONITOR_FIELDS,
  BUTTON_LABELS,
  VALIDATION_MESSAGES,
} from './constants/SystemMonitorConstants';

const getInitialState = () => {
  const state = {};
  SYSTEM_MONITOR_FIELDS.forEach(field => {
    if (field.type === 'checkbox') {
      state[field.key] = field.defaultValue || false;
    } else {
      state[field.key] = field.defaultValue || '';
    }
  });
  return state;
};

function SystemMonitor() {
  const [form, setForm] = useState(getInitialState());

  const handleCheckboxChange = (key) => {
    setForm(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleInputChange = (key, value) => {
    // Only allow numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setForm(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleKeyPress = (e) => {
    const key = e.keyCode || e.which;
    // Allow: backspace (8), delete (127), numbers (48-57), decimal point (46)
    if (!(key === 8 || key === 127 || (key >= 48 && key <= 57) || key === 46)) {
      e.preventDefault();
    }
  };

  const validateForm = () => {
    if (form.watchdog) {
      const watchdogTime = parseFloat(form.watchdogTime);
      if (!watchdogTime || watchdogTime < 1 || watchdogTime > 15) {
        alert(VALIDATION_MESSAGES.WATCHDOG_TIME_RANGE);
        document.getElementById('WatchDogTime')?.focus();
        return false;
      }
    }
    if (form.autoRestart) {
      const threshold = parseFloat(form.lostConnectThreshold);
      if (!threshold || threshold < 20 || threshold > 120) {
        alert(VALIDATION_MESSAGES.HEARTBEAT_THRESHOLD_RANGE);
        document.getElementById('LostConnectThreshold')?.focus();
        return false;
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

  return (
    <div
      className="bg-gray-50 min-h-[calc(100vh-128px)] py-2"
      style={{ backgroundColor: '#dde0e4' }}
    >
      <div className="flex justify-center">
        <div className="w-full" style={{ maxWidth: '1024px' }}>
          {/* Page Title Bar */}
          <div className="w-full h-8 bg-gradient-to-b from-[#b3e0ff] via-[#6ec1f7] to-[#3b8fd6] flex items-center justify-center font-semibold text-lg text-gray-700 shadow mb-0">
            <span>{SYSTEM_MONITOR_TITLE}</span>
          </div>
        
          {/* Main Card */}
          <div className="bg-[#dde0e4] border-2 border-gray-400 border-t-0 shadow-sm py-6" style={{ fontSize: '13px' }}>
            <div className="flex justify-center pl-8">
              <table style={{ tableLayout: 'fixed', width: '100%', maxWidth: '800px', fontSize: '13px' }}>
                <colgroup>
                  <col style={{ width: '15%' }} />
                  <col style={{ width: '50%' }} />
                  <col style={{ width: '35%' }} />
                </colgroup>
                <tbody>
                  <tr>
                    <td width="15%">&nbsp;</td>
                    <td width="50%">&nbsp;</td>
                    <td width="35%">&nbsp;</td>
                  </tr>
                  {/* Watchdog Section */}
                  <tr>
                    <td>&nbsp;</td>
                    <td className="text-gray-700 text-left" style={{ fontSize: '13px' }}>
                      {SYSTEM_MONITOR_FIELDS[0].label}
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      <input
                        type="checkbox"
                        name="WatchDog"
                        id="WatchDog"
                        checked={form.watchdog}
                        onChange={() => handleCheckboxChange('watchdog')}
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
                  <tr>
                    <td>&nbsp;</td>
                  </tr>
                  
                  {/* Dog Feeding Interval - shown when watchdog is enabled */}
                  {form.watchdog && (
                    <>
                      <tr id="IdWatchDogTime" style={{ display: 'table-row' }}>
                        <td>&nbsp;</td>
                        <td className="text-gray-700 text-left" style={{ fontSize: '13px' }}>
                          {SYSTEM_MONITOR_FIELDS[1].label}
                        </td>
                        <td>
                          <input
                            className="text"
                            type="text"
                            id="WatchDogTime"
                            name="WatchDogTime"
                            size="10"
                            maxLength="2"
                            value={form.watchdogTime}
                            onChange={(e) => handleInputChange('watchdogTime', e.target.value)}
                            onKeyPress={handleKeyPress}
                            style={{
                              fontSize: '13px',
                              padding: '2px 4px',
                              width: '80px',
                              height: '24px',
                              backgroundColor: '#ffffff',
                              border: '1px solid #999',
                              imeMode: 'disabled',
                            }}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>&nbsp;</td>
                      </tr>
                    </>
                  )}

                  {/* Auto Restart Section */}
                  <tr>
                    <td>&nbsp;</td>
                    <td className="text-gray-700 text-left" style={{ fontSize: '13px' }}>
                      {SYSTEM_MONITOR_FIELDS[2].label}
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      <input
                        type="checkbox"
                        name="AutoExec"
                        id="AutoExec"
                        checked={form.autoRestart}
                        onChange={() => handleCheckboxChange('autoRestart')}
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
                  <tr>
                    <td>&nbsp;</td>
                  </tr>
                  
                  {/* Threshold - shown when auto restart is enabled */}
                  {form.autoRestart && (
                    <>
                      <tr id="IdLostConnectThreshold" style={{ display: 'table-row' }}>
                        <td>&nbsp;</td>
                        <td className="text-gray-700 text-left" style={{ fontSize: '13px' }}>
                          {SYSTEM_MONITOR_FIELDS[3].label}
                        </td>
                        <td>
                          <input
                            className="text"
                            type="text"
                            id="LostConnectThreshold"
                            name="LostConnectThreshold"
                            size="10"
                            maxLength="3"
                            value={form.lostConnectThreshold}
                            onChange={(e) => handleInputChange('lostConnectThreshold', e.target.value)}
                            onKeyPress={handleKeyPress}
                            style={{
                              fontSize: '13px',
                              padding: '2px 4px',
                              width: '80px',
                              height: '24px',
                              backgroundColor: '#ffffff',
                              border: '1px solid #999',
                              imeMode: 'disabled',
                            }}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>&nbsp;</td>
                      </tr>
                    </>
                  )}
                  
                  <tr>
                    <td>&nbsp;</td>
                  </tr>
                  <tr>
                    <td>&nbsp;</td>
                  </tr>
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

export default SystemMonitor;

