import React, { useState } from 'react';
import { Button, TextField, CircularProgress, FormControl, Select, MenuItem } from '@mui/material';

/** Dialplan contexts for two-step originate (add more as needed on device) */
const CONTEXT_OPTIONS = [
  'siproute',
  'outbound-mobile',
  'from-internal',
  'default',
];
import { amiOriginate } from '../api/apiService';

/**
 * Builds callerid string for AMI: "Name" <number> or number only
 */
function buildCallerId(name, number) {
  const n = (number || '').trim();
  const nm = (name || '').trim();
  if (nm && n) return `"${nm}" <${n}>`;
  if (n) return n;
  if (nm) return nm;
  return undefined;
}

const OriginateCallPage = () => {
  const [mode, setMode] = useState('simple'); // 'simple' | 'twostep'
  const [name, setName] = useState('');
  const [extension, setExtension] = useState('');
  const [callerIdName, setCallerIdName] = useState('');
  const [callerIdNumber, setCallerIdNumber] = useState('');
  // Mode 1 – Simple
  const [useFixedApp, setUseFixedApp] = useState(true);
  const [application, setApplication] = useState('Wait');
  const [appData, setAppData] = useState('30');
  // Mode 2 – Two-step
  const [context, setContext] = useState('siproute');
  const [exten, setExten] = useState('');
  const [priority, setPriority] = useState('1');
  const [loading, setLoading] = useState(false);

  const showAlert = (text) => window.alert(text);

  const handleOriginate = async () => {
    const ext = extension.trim();
    if (!ext) {
      showAlert('Call / Dial this extension (extension) is required.');
      return;
    }
    const callerid = buildCallerId(callerIdName, callerIdNumber);
    let data = { extension: ext };
    if (callerid) data.callerid = callerid;

    if (mode === 'simple') {
      if (useFixedApp) {
        data.application = 'Wait';
        data.appData = appData.trim() || '30';
      } else {
        const app = application.trim();
        if (!app) {
          showAlert('Application is required for Simple mode when not using fixed Wait.');
          return;
        }
        data.application = app;
        if (appData.trim()) data.appData = appData.trim();
      }
    } else {
      const ctx = context.trim();
      const ex = exten.trim();
      if (!ctx || !ex) {
        showAlert('Context and Extension/Exten are required for two-step mode.');
        return;
      }
      data.context = ctx;
      data.exten = ex;
      const pri = parseInt(priority, 10);
      data.priority = Number.isFinite(pri) && pri >= 0 ? pri : 1;
    }

    setLoading(true);
    try {
      const res = await amiOriginate(data);
      if (res?.response === false) {
        showAlert(res?.message || 'Originate failed.');
      } else {
        showAlert(res?.message || 'Originate sent.');
      }
    } catch (err) {
      showAlert(err?.message || String(err) || 'Originate failed.');
    } finally {
      setLoading(false);
    }
  };

  const row = (label, children) => (
    <div className="flex items-center gap-2" style={{ minHeight: 36 }}>
      <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left" style={{ width: 220, marginRight: 10 }}>
        {label}
      </label>
      <div className="flex-1">{children}</div>
    </div>
  );

  const textField = (value, onChange, placeholder = '') => (
    <TextField
      fullWidth
      size="small"
      variant="outlined"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      sx={{ '& .MuiOutlinedInput-input': { padding: '8px 12px', fontSize: 14 } }}
    />
  );

  return (
    <div className="w-full max-w-full mx-auto p-2">
      <div className="w-full mx-auto max-w-3xl">
        <div
          className="rounded-t-lg h-8 flex items-center justify-center font-semibold text-[18px] text-[#444] shadow-sm"
          style={{ background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)', boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)' }}
        >
          Originate Call
        </div>
        <div
          className="border-2 border-t-0 border-gray-400 rounded-b-lg p-4"
          style={{ backgroundColor: '#dde0e4' }}
        >
          <div className="bg-white border border-gray-300 rounded-md overflow-hidden">
            <div className="px-3 py-1.5 border-b border-gray-300 text-[13px] font-semibold text-gray-700 bg-[#f5f7fa]">
              AMI Originate (POST /api/ami — type: ami_originate)
            </div>
            <div className="p-3 flex flex-col gap-3">
              {row('Name (label only)', textField(name, setName, 'Optional — not sent to API'))}

              <div className="flex items-center gap-4 text-[14px] text-gray-700">
                <span className="font-medium">Mode:</span>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="originateMode"
                    checked={mode === 'simple'}
                    onChange={() => setMode('simple')}
                  />
                  <span>Simple (application — no context/exten)</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="originateMode"
                    checked={mode === 'twostep'}
                    onChange={() => setMode('twostep')}
                  />
                  <span>Two-step (context + exten after A answers)</span>
                </label>
              </div>

              {row('Call / Dial this extension *', textField(extension, setExtension, 'e.g. 1004'))}
              {row('Caller ID name', textField(callerIdName, setCallerIdName, 'e.g. Front Desk'))}
              {row('Caller ID number', textField(callerIdNumber, setCallerIdNumber, 'e.g. 1000'))}

              {mode === 'simple' && (
                <>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="fixedApp"
                      checked={useFixedApp}
                      onChange={e => setUseFixedApp(e.target.checked)}
                    />
                    <label htmlFor="fixedApp" className="text-[14px] text-gray-700 cursor-pointer">
                      Use fixed Application Wait + appData below (recommended)
                    </label>
                  </div>
                  {useFixedApp ? (
                    row('Application data (seconds)', textField(appData, setAppData, '30'))
                  ) : (
                    <>
                      {row('Application *', textField(application, setApplication, 'Wait'))}
                      {row('Application data', textField(appData, setAppData, '1'))}
                    </>
                  )}
                </>
              )}

              {mode === 'twostep' && (
                <>
                  {row(
                    'Context *',
                    <FormControl size="small" fullWidth>
                      <Select
                        value={context}
                        onChange={e => setContext(e.target.value)}
                        sx={{ '& .MuiSelect-select': { padding: '8px 12px', fontSize: 14 } }}
                      >
                        {CONTEXT_OPTIONS.map((ctx) => (
                          <MenuItem key={ctx} value={ctx}>
                            {ctx}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                  {row('Extension / Exten (B leg) *', textField(exten, setExten, 'e.g. 1005'))}
                  {row('Priority', textField(priority, setPriority, '1'))}
                </>
              )}

              <div className="flex justify-center pt-2">
                <Button
                  variant="contained"
                  disabled={loading}
                  onClick={handleOriginate}
                  startIcon={loading && <CircularProgress size={18} color="inherit" />}
                  sx={{
                    background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
                    color: '#fff',
                    fontWeight: 600,
                    textTransform: 'none',
                    minWidth: 160,
                    '&:hover': { background: 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)' },
                  }}
                >
                  {loading ? 'Sending…' : 'Originate'}
                </Button>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                Bearer JWT is sent automatically when logged in. Simple mode sends application + appData only (no context/exten).
                Two-step sends context, exten, priority.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OriginateCallPage;
