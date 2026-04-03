import React, { useState } from 'react';
import {
  DNS_TEST_TITLE,
  DNS_TEST_FIELDS,
  BUTTON_LABELS,
  VALIDATION_MESSAGES,
  PROGRESS_MESSAGE,
} from './constants/DnsTestConstants';

function DnsTest() {
  const [domain, setDomain] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  const handleDomainChange = (e) => {
    setDomain(e.target.value);
  };

  const validateForm = () => {
    if (!domain.trim()) {
      alert(VALIDATION_MESSAGES.DOMAIN_REQUIRED);
      document.getElementById('Domain')?.focus();
      return false;
    }
    return true;
  };

  const handleTest = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsTesting(true);
      // Simulate DNS test - in real implementation, this would call an API
      setTimeout(() => {
        setIsTesting(false);
        alert(`DNS test completed for ${domain}`);
      }, 2000);
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
            <span>{DNS_TEST_TITLE}</span>
          </div>
        
          {/* Main Card */}
          <div className="bg-[#dde0e4] border-2 border-gray-400 border-t-0 shadow-sm py-6" style={{ fontSize: '13px' }}>
            <div className="flex justify-center pl-8">
              <table style={{ tableLayout: 'fixed', width: '100%', maxWidth: '800px', fontSize: '13px' }}>
                <colgroup>
                  <col style={{ width: '15%' }} />
                  <col style={{ width: '45%' }} />
                  <col style={{ width: '40%' }} />
                </colgroup>
                <tbody>
                  <tr>
                    <td width="15%">&nbsp;</td>
                    <td width="45%">&nbsp;</td>
                    <td width="40%">&nbsp;</td>
                  </tr>
                  
                  {/* Domain Input */}
                  <tr>
                    <td>&nbsp;</td>
                    <td className="text-gray-700 text-left" style={{ fontSize: '13px' }}>
                      {DNS_TEST_FIELDS[0].label}
                    </td>
                    <td>
                      <input
                        type="text"
                        id="Domain"
                        name="Domain"
                        maxLength="63"
                        className="text1"
                        value={domain}
                        onChange={handleDomainChange}
                        disabled={isTesting}
                        style={{
                          fontSize: '13px',
                          backgroundColor: '#ffffff',
                          border: '1px solid #999',
                          padding: '3px 6px',
                          width: '220px',
                          height: '28px',
                          imeMode: 'disabled',
                          opacity: isTesting ? 0.6 : 1,
                        }}
                      />
                    </td>
                  </tr>
                  
                  <tr>
                    <td width="15%">&nbsp;</td>
                    <td width="45%">&nbsp;</td>
                    <td width="40%">&nbsp;</td>
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
              value={BUTTON_LABELS.TEST}
              onClick={handleTest}
              disabled={isTesting}
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
                cursor: isTesting ? 'not-allowed' : 'pointer',
                opacity: isTesting ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isTesting) {
                  e.target.style.background = 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isTesting) {
                  e.target.style.background = 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)';
                }
              }}
            />
          </div>
          <div style={{ marginTop: '10px' }}>&nbsp;</div>
          
          {/* Progress Indicator */}
          {isTesting && (
            <div id="progress" style={{ marginBottom: '15px', textAlign: 'center' }}>
              <font size="2px" color="blue">
                <div className="label" style={{ fontSize: '14px', color: '#0066cc' }}>
                  {PROGRESS_MESSAGE}
                </div>
              </font>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DnsTest;

