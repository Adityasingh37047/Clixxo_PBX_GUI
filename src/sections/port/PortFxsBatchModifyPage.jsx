import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  PORT_FXS_BATCH_MODIFY_FIELDS,
  PORT_FXS_BATCH_MODIFY_NOTE,
  PORT_FXS_BATCH_MODIFY_TITLE,
} from './constants/PortFxsPageConstants';
// import { postBatchModifyFxs } from './controller';
import { ROUTE_PATHS } from '../../constants/routeConstatns';

// Initialize batch modify form
const getInitialBatchForm = (initialPorts = null) => {
  const form = {};
  PORT_FXS_BATCH_MODIFY_FIELDS.forEach(field => {
    if (field.type === 'select') {
      form[field.key] = field.options[0] || field.default || '';
    } else if (field.type === 'checkbox') {
      form[field.key] = field.default || false;
    } else {
      form[field.key] = field.default || '';
    }
  });
  
  // Override with initial port values if provided
  if (initialPorts) {
    if (initialPorts.startingPort) {
      form.startingPort = initialPorts.startingPort;
    }
    if (initialPorts.endingPort) {
      form.endingPort = initialPorts.endingPort;
    }
  }
  
  return form;
};

const PortFxsBatchModifyPage = ({ initialPorts: propInitialPorts, onClose, onSaved } = {}) => {
  const navigate = useNavigate();
  const location = useLocation();
 
  // Key handlers to mimic original page restrictions
  const handleRestrictedChars = (e) => {
    // Disallow a set of special characters for general text fields
    const forbidden = /[%&~\|\(\);\\"'=\\\u007C]/;
    if (forbidden.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleDigitsOnly = (e) => {
    if (
      !/^[0-9]$/.test(e.key) &&
      e.key !== 'Backspace' &&
      e.key !== 'ArrowLeft' &&
      e.key !== 'ArrowRight' &&
      e.key !== 'Tab'
    ) {
      e.preventDefault();
    }
  };

  const handleDigitsHyphen = (e) => {
    if (
      !/^[0-9-]$/.test(e.key) &&
      e.key !== 'Backspace' &&
      e.key !== 'ArrowLeft' &&
      e.key !== 'ArrowRight' &&
      e.key !== 'Tab'
    ) {
      e.preventDefault();
    }
  };

  const handleAutoDialKey = (e) => {
    if (
      !/^[0-9abc#*]$/.test(e.key) &&
      e.key !== 'Backspace' &&
      e.key !== 'ArrowLeft' &&
      e.key !== 'ArrowRight' &&
      e.key !== 'Tab'
    ) {
      e.preventDefault();
    }
  };

  const [form, setForm] = useState(() => {
    // Prefer propInitialPorts when provided, else use navigation state
    const initialPorts = propInitialPorts || location.state || null;
    return getInitialBatchForm(initialPorts);
  });

  // Handle form changes
  const handleChange = (key, value) => {
    const fieldDef = PORT_FXS_BATCH_MODIFY_FIELDS.find(f => f.key === key);
    if (fieldDef && fieldDef.validation === 'integer') {
      if (value === '' || /^-?\d+$/.test(value)) {
        setForm(prev => ({ ...prev, [key]: value }));
      }
    } else {
      setForm(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleCheckbox = (key) => {
    setForm(prev => {
      const next = { ...prev, [key]: !prev[key] };
      // make DND and Call Forward mutually exclusive
      if (key === 'dnd' && !prev.dnd) {
        // turning DND on -> turn Call Forward off
        next.callForward = false;
      }
      if (key === 'callForward' && !prev.callForward) {
        // turning Call Forward on -> turn DND off
        next.dnd = false;
      }
      return next;
    });
  };

  // Check if field should be shown based on conditional logic
  const shouldShowField = (field) => {
    // No condition - always show
    if (!field.conditional) return true;
    
    // Check primary condition
    const conditionalValue = form[field.conditional];
    if (!conditionalValue) return false;

    // Handle nested conditions (conditionalParent)
    if (field.conditionalParent) {
      const parentValue = form[field.conditionalParent];
      
      if (field.conditionalParentValue !== undefined) {
        if (Array.isArray(field.conditionalParentValue)) {
          return field.conditionalParentValue.includes(parentValue);
        } else {
          return parentValue === field.conditionalParentValue;
        }
      }
      
      // If conditionalParent exists but no specific value, just check if parent is truthy
      return !!parentValue;
    }

    // Handle step size fields that depend on rule fields
    if (field.conditionalParentValue !== undefined && field.key.includes('StepSize')) {
      const ruleKey = field.key.replace('StepSize', 'Rule').replace('Length', 'Rule');
      const ruleValue = form[ruleKey];
      
      if (Array.isArray(field.conditionalParentValue)) {
        return field.conditionalParentValue.includes(ruleValue);
      }
      // For "All Same" rule, don't show step size
      return ruleValue !== field.conditionalParentValue;
    }

    return true;
  };

  // Handle form submission
  const handleSave = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    
    // Validation
    if (parseInt(form.startingPort) > parseInt(form.endingPort)) {
      alert('The starting port number cannot be larger than the ending port one!');
      return;
    }

    if (form.batchAccount) {
      // Allow empty starting SIP account (user may intentionally clear it).
      // Only validate SIP step size when a starting SIP account is provided.
      if (form.startingSipAccount && !form.sipAccountBatchStepSize) {
        alert('Please enter the batch step size of SIP account!');
        return;
      }
      if (form.displayNameBatchRule !== 'All Same' && !form.displayNameBatchStepSize) {
        alert('Please enter the batch step size of display name!');
        return;
      }
      if (form.registerPort === 'Yes' && form.batchRegister) {
        if (!form.startingAuthPassword) {
          alert('Please enter your password!');
          return;
        }
        if (form.authPasswordBatchRule !== 'All Same' && !form.authPasswordBatchStepSize) {
          alert('Please enter the batch step size of authentication password!');
          return;
        }
      }
    }

    if (form.batchConfigure) {
      if (form.autoDialNumberEnable && !form.autoDialNumber) {
        alert("Please enter 'Auto Dial Number'!");
        return;
      }
      if (form.autoDialNumberEnable && !form.waitTimeBeforeAutoDial) {
        alert("Please enter 'Wait Time before Auto Dial'!");
        return;
      }
      if (!form.inputGain || form.inputGain < -6 || form.inputGain > 6) {
        alert('The value range of Input Gain is -6~6!');
        return;
      }
      if (!form.outputGain || form.outputGain < -6 || form.outputGain > 6) {
        alert('The value range of Output Gain is -6~6!');
        return;
      }
      if (form.callForward && !form.forwardNumber) {
        alert('Please enter an forward number!');
        return;
      }
      if (form.forwardType === 'No Reply' && !form.noAnswerDelayTime) {
        alert("Please enter a time threshold for 'No Reply'!");
        return;
      }
    }

    // Build payload
    const payload = {
      startingPort: parseInt(form.startingPort, 10),
      endingPort: parseInt(form.endingPort, 10),
      batchRegisterEnable: !!form.batchRegister,
      registerPort: form.registerPort,
      batchAccountEnable: !!form.batchAccount,
      startingSipAccount: form.startingSipAccount,
      startingDisplayName: form.startingDisplayName,
      startingAuthenticationPassword: form.startingAuthPassword,
      displayNamePreferred: !!form.displayNamePreferred,
      sipAccountBatchRule: form.sipAccountBatchRule ? String(form.sipAccountBatchRule).toLowerCase() : form.sipAccountBatchRule,
      sipAccountBatchStepSize: Number(form.sipAccountBatchStepSize) || 0,
      displayNameBatchRule: form.displayNameBatchRule ? String(form.displayNameBatchRule).toLowerCase() : form.displayNameBatchRule,
      displayNameBatchStepSize: Number(form.displayNameBatchStepSize) || 0,
      authenticationPasswordBatchRule: form.authPasswordBatchRule ? String(form.authPasswordBatchRule).toLowerCase() : form.authPasswordBatchRule,
      authenticationPasswordBatchStepSize: Number(form.authPasswordBatchStepSize) || 0,
      batchConfigureEnable: !!form.batchConfigure,
      autoDialNumberEnable: !!form.autoDialNumberEnable,
      autoDialNumberValue: form.autoDialNumber,
      waitTimeBeforeAutoDial: Number(form.waitTimeBeforeAutoDial) || 0,
      inputGainDb: Number(form.inputGain) || 0,
      outputGainDb: Number(form.outputGain) || 0,
      cidEnable: !!form.cid,
      echoCanceller: !!form.echoCanceller,
      callWaiting: !!form.callWaiting,
      dndDoNotDisturb: !!form.dnd,
      callForward: !!form.callForward,
      forwardType: form.forwardType,
      forwardNumber: form.forwardNumber,
      advancedConfiguration: !!form.advancedConfiguration,
      ringingParameter: form.ringingParameter,
      feedVoltageParameter: form.feedVoltageParameter,
      impedanceParameter: form.impedanceParameter,
    };

    // Call API
    (async () => {
      try {
        console.debug('Sending batch modify payload:', payload);
        const res = await postBatchModifyFxs(payload);
        console.debug('Batch modify response:', res);
        alert('Batch modify settings saved successfully!');
        if (typeof onSaved === 'function') {
          await onSaved();
        } else if (typeof onClose === 'function') {
          onClose();
        } else {
          navigate(ROUTE_PATHS.PORT_FXS);
        }
      } catch (err) {
        console.error('Batch modify API failed:', err);
        alert(err?.message || 'Failed to save batch modify settings');
      }
    })();
  };

  const handleCancel = () => {
    if (typeof onClose === 'function') {
      onClose();
    } else {
      navigate(ROUTE_PATHS.PORT_FXS);
    }
  };

  return (
    <div
      className="bg-gray-50 min-h-[calc(100vh-128px)] py-1"
      style={{ backgroundColor: '#dde0e4' }}
    >
      <div className="flex justify-center" style={{ padding: '0 20px' }}>
        <div style={{ width: '62%', maxWidth: '1000px', minWidth: '700px' }}>
          {/* Page Title Bar */}
          <div className="w-full h-8 bg-linear-to-b from-[#b3e0ff] via-[#6ec1f7] to-[#3b8fd6] flex items-center justify-center font-semibold text-lg text-gray-700 shadow mb-0">
            <span>{PORT_FXS_BATCH_MODIFY_TITLE}</span>
          </div>

          {/* Main Card */}
          <form onSubmit={handleSave}>
            <div className="bg-[#dde0e4] border-2 border-gray-400 border-t-0 shadow-sm py-2 text-xs">
              <div className="flex justify-center pl-4">
                <table width="100%" cellSpacing="0" cellPadding="0" style={{ tableLayout: 'fixed' }}>
                  <colgroup>
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '3%' }} />
                    <col style={{ width: '37%' }} />
                    <col style={{ width: '50%' }} />
                  </colgroup>
                  <tbody>
                        {PORT_FXS_BATCH_MODIFY_FIELDS.map((field, idx) => {
                          if (!shouldShowField(field)) return null;

                          // Check if we need a spacer row before this field
                          const prevField = idx > 0 ? PORT_FXS_BATCH_MODIFY_FIELDS[idx - 1] : null;
                          const needsSpacer = prevField && shouldShowField(prevField) && (
                            prevField.key === 'endingPort' ||
                            prevField.key === 'registerPort' ||
                            prevField.key === 'displayNamePreferred' ||
                            prevField.key === 'waitTimeBeforeAutoDial' ||
                            prevField.key === 'echoCanceller' ||
                            prevField.key === 'impedanceParameter'
                          );

                          return (
                            <React.Fragment key={field.key}>
                              {/* Spacer row between sections */}
                              {needsSpacer && (
                                <tr>
                                  <td>&nbsp;</td>
                                  <td>&nbsp;</td>
                                  <td>&nbsp;</td>
                                  <td>&nbsp;</td>
                                </tr>
                              )}

                              <tr>
                                <td style={{ height: '22px' }}>&nbsp;</td>
                                {field.type === 'checkbox' ? (
                                  <>
                                    <td colSpan="2" style={{ fontSize: '12px' }}>{field.label}</td>
                                    <td style={{ fontSize: '12px' }}>
                                      <input
                                        type="checkbox"
                                        checked={!!form[field.key]}
                                        onChange={() => handleCheckbox(field.key)}
                                        style={{ marginRight: '4px' }}
                                        disabled={
                                          field.key === 'dnd' ? !!form.callForward
                                          : field.key === 'callForward' ? !!form.dnd
                                          : false
                                        }
                                      />
                                      Enable
                                    </td>
                                  </>
                                ) : (
                                  <>
                                    <td>&nbsp;</td>
                                    <td colSpan="1" style={{ fontSize: '12px' }}>{field.label}</td>
                                    <td>
                                      {/* Text input */}
                                      {field.type === 'text' && (
                                        <input
                                          type="text"
                                          value={form[field.key]}
                                          onChange={e => handleChange(field.key, e.target.value)}
                                          className="border border-gray-400 rounded-sm px-1 bg-white"
                                          style={{ height: '22px', width: '200px', fontSize: '12px' }}
                                          maxLength={field.maxLength || 31}
                                          onKeyDown={
                                            // Attach appropriate key handlers based on validation or key name
                                            field.validation === 'integer'
                                              ? handleDigitsOnly
                                              : field.key === 'inputGain' || field.key === 'outputGain'
                                              ? handleDigitsHyphen
                                              : field.key === 'autoDialNumber'
                                              ? handleAutoDialKey
                                              : handleRestrictedChars
                                          }
                                        />
                                      )}

                                      {/* Password input */}
                                      {field.type === 'password' && (
                                        <input
                                          type="password"
                                          value={form[field.key]}
                                          onChange={e => handleChange(field.key, e.target.value)}
                                          className="border border-gray-400 rounded-sm px-1 bg-white"
                                          style={{ height: '22px', width: '200px', fontSize: '12px' }}
                                          maxLength={field.maxLength || 63}
                                        />
                                      )}

                                      {/* Select dropdown */}
                                      {field.type === 'select' && (
                                        <select
                                          value={form[field.key]}
                                          onChange={e => handleChange(field.key, e.target.value)}
                                          className="border border-gray-400 rounded-sm px-1 bg-white"
                                          style={{ 
                                            height: '22px', 
                                            width: field.key.includes('Parameter') ? '280px' : '200px',
                                            fontSize: '12px'
                                          }}
                                        >
                                          {field.options.map(opt => (
                                            <option key={opt} value={opt}>
                                              {opt}
                                            </option>
                                          ))}
                                        </select>
                                      )}
                                    </td>
                                  </>
                                )}
                              </tr>
                            </React.Fragment>
                          );
                        })}

                        {/* Spacer at the end */}
                        <tr>
                          <td>&nbsp;</td>
                          <td>&nbsp;</td>
                          <td>&nbsp;</td>
                          <td>&nbsp;</td>
                        </tr>
                      </tbody>
                    </table>
              </div>
            </div>

            {/* Note */}
            <div className="text-center mt-4">
              <div className="text-gray-600 text-sm" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                {PORT_FXS_BATCH_MODIFY_NOTE}
              </div>
            </div>

            {/* Buttons - Outside the bordered box */}
            <div className="flex justify-center gap-6 py-6">
              <button
                type="submit"
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
                onClick={handleCancel}
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
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PortFxsBatchModifyPage;

