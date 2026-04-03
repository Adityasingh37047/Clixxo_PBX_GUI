import React, { useState } from 'react';
import { NAT_SETTINGS_FIELDS, NAT_SETTINGS_NOTE } from './constants/NatSettingsConstants';

const getInitialState = () => {
  const state = {};
  NAT_SETTINGS_FIELDS.forEach(f => {
    if (f.type === 'select') {
      state[f.key] = f.default || f.options[0] || '';
    } else if (f.type === 'checkbox') {
      state[f.key] = f.default !== undefined ? f.default : false;
    } else if (f.type === 'readonly') {
      state[f.key] = f.default || '';
    } else {
      state[f.key] = f.default || '';
    }
  });
  return state;
};

const NatSettingsPage = () => {
  const [form, setForm] = useState(getInitialState());

  const handleChange = (key, value) => {
    const fieldDef = NAT_SETTINGS_FIELDS.find(f => f.key === key);
    if (fieldDef && fieldDef.validation === 'integer') {
      if (value === '' || /^\d+$/.test(value)) {
        setForm(prev => ({ ...prev, [key]: value }));
      }
    } else {
      setForm(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleCheckbox = (key) => {
    // Prevent checking/unchecking Auto Detect NAT IP when Learn NAT is unchecked
    if (key === 'autoDetectNatIp' && !form.learnNat) {
      return;
    }
    
    setForm(prev => {
      const newValue = !prev[key];
      const updates = { [key]: newValue };
      
      // When Learn NAT is unchecked, uncheck Auto Detect NAT IP
      if (key === 'learnNat' && !newValue) {
        updates.autoDetectNatIp = false;
      }
      
      return { ...prev, ...updates };
    });
  };

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  const handleReset = () => {
    setForm(getInitialState());
  };

  // Check if field should be shown based on conditional logic
  const shouldShowField = (field) => {
    if (!field.conditional) return true;
    
    const conditionalValue = form[field.conditional];
    
    if (field.conditionalValues) {
      return field.conditionalValues.includes(conditionalValue);
    } else if (field.conditionalValue !== undefined) {
      return conditionalValue === field.conditionalValue;
    } else {
      return !!conditionalValue;
    }
  };

  // Group fields by section and method
  const groupedFields = NAT_SETTINGS_FIELDS.reduce((acc, field) => {
    if (!shouldShowField(field)) return acc;
    
    const sectionKey = field.section;
    if (!acc[sectionKey]) {
      acc[sectionKey] = {};
    }
    
    const methodKey = field.method || 'no-method';
    if (!acc[sectionKey][methodKey]) {
      acc[sectionKey][methodKey] = [];
    }
    
    acc[sectionKey][methodKey].push(field);
    return acc;
  }, {});

  return (
    <div
      className="bg-gray-50 min-h-[calc(100vh-128px)] py-2"
      style={{ backgroundColor: '#dde0e4' }}
    >
      <div className="flex justify-center">
        <div className="w-full" style={{ maxWidth: '1024px' }}>
          {/* Page Title Bar */}
          <div className="w-full h-8 bg-gradient-to-b from-[#b3e0ff] via-[#6ec1f7] to-[#3b8fd6] flex items-center justify-center font-semibold text-lg text-gray-700 shadow mb-0">
            <span>NAT Settings</span>
          </div>
        
          {/* Main Card */}
          <div className="bg-[#dde0e4] border-2 border-gray-400 border-t-0 shadow-sm py-6 text-sm">
            <div className="flex justify-center pl-8">
              <table className="text-sm" style={{ tableLayout: 'fixed', width: '800px' }}>
                <colgroup>
                  <col style={{ width: '50%' }} />
                  <col style={{ width: '50%' }} />
                </colgroup>
                <tbody>
                  {Object.entries(groupedFields).map(([sectionName, methods], sectionIdx) => (
                    <React.Fragment key={sectionName}>
                      {/* Section Header */}
                      <tr>
                        <td colSpan={2} className="text-gray-700 font-semibold text-left pb-2 pt-4" style={{ paddingLeft: '0px' }}>
                          {sectionName}
                        </td>
                      </tr>
                      
                      {Object.entries(methods).map(([methodName, fields], methodIdx) => (
                        <React.Fragment key={`${sectionName}-${methodName}`}>
                          {/* Method Label (if exists) */}
                          {methodName !== 'no-method' && (
                            <tr>
                              <td colSpan={2} className="text-gray-700 text-left pb-1 pt-2" style={{ paddingLeft: '20px' }}>
                                {methodName}
                              </td>
                            </tr>
                          )}
                          
                          {/* Fields under this method */}
                          {fields.map((field, fieldIdx) => (
                            <tr key={field.key}>
                              <td className="align-middle text-gray-700 text-left" style={{ paddingLeft: '40px', paddingRight: '16px' }}>
                                {field.label}
                              </td>
                              <td className="align-middle text-left">
                                <div>
                                  {/* Readonly field */}
                                  {field.type === 'readonly' && (
                                    <div
                                      className="border border-gray-400 rounded px-2 bg-gray-200 text-gray-700"
                                      style={{ height: '28px', lineHeight: '28px', width: '200px', borderRadius: '6px' }}
                                    >
                                      {form[field.key] || field.default || ''}
                                    </div>
                                  )}

                                  {/* Text input */}
                                  {field.type === 'text' && (
                                    <input
                                      type="text"
                                      value={form[field.key]}
                                      onChange={e => handleChange(field.key, e.target.value)}
                                      className="border border-gray-400 rounded-sm px-2 bg-white"
                                      style={{ height: '28px', width: '200px' }}
                                    />
                                  )}

                                  {/* Select dropdown */}
                                  {field.type === 'select' && (
                                    <select
                                      value={form[field.key]}
                                      onChange={e => handleChange(field.key, e.target.value)}
                                      className="border border-gray-400 rounded-sm px-1 bg-white"
                                      style={{ height: '28px', width: '200px' }}
                                    >
                                      {field.options.map(opt => (
                                        <option key={opt} value={opt}>
                                          {opt}
                                        </option>
                                      ))}
                                    </select>
                                  )}

                                  {/* Checkbox */}
                                  {field.type === 'checkbox' && (
                                    <label className={`flex items-center gap-2 ${field.key === 'autoDetectNatIp' && !form.learnNat ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                                      <input
                                        type="checkbox"
                                        checked={!!form[field.key]}
                                        onChange={() => handleCheckbox(field.key)}
                                        disabled={field.key === 'autoDetectNatIp' && !form.learnNat}
                                        className="h-4 w-4 accent-blue-600"
                                        style={field.key === 'autoDetectNatIp' && !form.learnNat ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                                      />
                                      <span className={`text-gray-700 ${field.key === 'autoDetectNatIp' && !form.learnNat ? 'opacity-60' : ''}`}>Enable</span>
                                    </label>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </React.Fragment>
                  ))}

                  {/* Note Section */}
                  <tr>
                    <td colSpan={2} className="text-gray-700 font-semibold text-left pb-2 pt-6" style={{ paddingLeft: '20px' }}>
                      Note:
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="text-gray-700 text-left pb-2" style={{ paddingLeft: '40px', whiteSpace: 'pre-line' }}>
                      {NAT_SETTINGS_NOTE}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        
          {/* Buttons - Outside the bordered box */}
          <div className="flex justify-center gap-6 py-6">
            <button
              type="button"
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
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)';
              }}
            >
              Save
            </button>
            <button
              type="button"
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
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NatSettingsPage;

