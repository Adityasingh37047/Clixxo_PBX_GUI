import React, { useState } from 'react';
import { SIP_SETTINGS_FIELDS, SIP_SETTINGS_NOTE } from './constants/SipSipConstants';

const getInitialState = () => {
  const state = {};
  SIP_SETTINGS_FIELDS.forEach(f => {
    if (f.type === 'select') {
      state[f.key] = f.options[0] || f.default || '';
    } else if (f.type === 'checkbox') {
      state[f.key] = f.default || false;
    } else if (f.type === 'readonly') {
      state[f.key] = f.default || '';
    } else {
      state[f.key] = f.default || '';
    }
  });
  return state;
};

const FxsVoipSipPage = () => {
  const [form, setForm] = useState(getInitialState());

  const handleChange = (key, value) => {
    const fieldDef = SIP_SETTINGS_FIELDS.find(f => f.key === key);
    if (fieldDef && fieldDef.validation === 'integer') {
      if (value === '' || /^\d+$/.test(value)) {
        setForm(prev => ({ ...prev, [key]: value }));
      }
    } else {
      setForm(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleCheckbox = (key) => {
    setForm(prev => ({ ...prev, [key]: !prev[key] }));
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
  
  return (
    <div
      className="bg-gray-50 min-h-[calc(100vh-128px)] py-2"
      style={{ backgroundColor: '#dde0e4' }}
    >
      <div className="flex justify-center">
        <div className="w-full" style={{ maxWidth: '1024px' }}>
          {/* Page Title Bar */}
          <div className="w-full h-8 bg-gradient-to-b from-[#b3e0ff] via-[#6ec1f7] to-[#3b8fd6] flex items-center justify-center font-semibold text-lg text-gray-700 shadow mb-0">
            <span>SIP Settings</span>
        </div>
        
          {/* Main Card */}
          <div className="bg-[#dde0e4] border-2 border-gray-400 border-t-0 shadow-sm py-6 text-sm">
            <div className="flex justify-center pl-8">
              <table className="text-sm" style={{ tableLayout: 'fixed', width: '750px' }}>
              <colgroup>
                <col style={{ width: '48%' }} />
                <col style={{ width: '52%' }} />
              </colgroup>
              <tbody>
              {SIP_SETTINGS_FIELDS.map((field, idx) => {
                  if (!shouldShowField(field)) return null;
                
                return (
                    <React.Fragment key={field.key}>
                      {/* Spacer row before each field */}
                      {idx > 0 && <tr className="h-3" />}
                      
                      <tr>
                        <td className="align-middle text-gray-700 pr-12 text-left">
                          {field.label}
                        </td>
                        <td className="align-middle text-left">
                          <div>
                            {/* Readonly field */}
                            {field.type === 'readonly' && (
                              <div
                                className="border border-gray-400 rounded-sm px-2 bg-gray-200 text-gray-700"
                                style={{ height: '28px', lineHeight: '28px', width: '200px' }}
                              >
                                {form[field.key]}
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
                              <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!form[field.key]}
                        onChange={() => handleCheckbox(field.key)}
                                  className="h-4 w-4 accent-blue-600"
                                />
                                <span className="text-gray-700">Enable</span>
                              </label>
                            )}

                            {/* Helper text */}
                            {field.helper && (
                              <div className="text-red-600 text-xs mt-1" style={{ maxWidth: '300px', wordWrap: 'break-word' }}>
                                {field.helper}
                    </div>
                  )}
                </div>
                        </td>
                      </tr>
                    </React.Fragment>
                );
              })}

                {/* Spacer at the end */}
                <tr className="h-4" />
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

export default FxsVoipSipPage;

