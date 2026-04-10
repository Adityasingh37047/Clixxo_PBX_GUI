import React, { useState, useCallback, useEffect } from 'react';
import { Button, TextField, CircularProgress, Alert, Box } from '@mui/material';
import { DEFAULT_SERIAL, DEFAULT_STATUS, AUTH_STATUS } from '../constants/AuthorizationConstants';
import { getLicenseInfo, fetchSystemInfo, postLinuxCmd } from '../api/apiService';

const blueBarStyle = {
  width: '100%',
  minHeight: 48,
  padding: '12px 16px',
  boxSizing: 'border-box',
  background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)',
  marginBottom: 0,
  display: 'flex',
  alignItems: 'center',
  fontWeight: 600,
  fontSize: '1.25rem',
  letterSpacing: '0.02em',
  color: '#1e3a5f',
  justifyContent: 'center',
  boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)',
};

const blueButtonSx = {
  background: 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)',
  color: '#fff',
  fontWeight: 600,
  fontSize: 16,
  borderRadius: 1.5,
  minWidth: 120,
  boxShadow: '0 2px 8px #b3e0ff',
  textTransform: 'none',
  px: 3,
  py: 1.5,
  padding: '6px 28px',
  '&:hover': {
    background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
    color: '#fff',
  },
};

const cellLabelSx = { fontSize: '14px', fontWeight: 500, color: '#374151' };

/** Read-only fields: centered text; compact vertical rhythm */
const readOnlyFieldSx = {
  '& .MuiOutlinedInput-root': {
    fontSize: '14px',
    fontWeight: 400,
    backgroundColor: '#f9fafb',
    minHeight: 38,
    borderRadius: '6px',
    '& .MuiOutlinedInput-input': {
      padding: '8px 12px',
      textAlign: 'center',
    },
    '& fieldset': {
      borderColor: '#d1d5db',
    },
  },
};

const DEFAULT_DEVICE_TYPE = 'IPPBX';
const DEFAULT_EXPIRY_DATE = '2027-04-10';
const DEFAULT_MAX_E1_PRI = '2';

function strOrEmpty(v) {
  return v === '' || v === undefined || v === null ? '' : String(v);
}

function parseLicensePayload(responseData) {
  if (responseData == null || responseData === '') {
    return {
      serial: '',
      deviceType: '',
      expireDate: '',
      sipExtensions: '',
      fxsPorts: '',
      maxFxoChannels: '',
      maxSipTrunkChannels: '',
      maxE1: '',
    };
  }
  let parsed = responseData;
  if (typeof responseData === 'string') {
    try {
      parsed = JSON.parse(responseData);
    } catch {
      return {
        serial: String(responseData).trim(),
        deviceType: '',
        expireDate: '',
        sipExtensions: '',
        fxsPorts: '',
        maxFxoChannels: '',
        maxSipTrunkChannels: '',
        maxE1: '',
      };
    }
  }
  if (typeof parsed !== 'object' || parsed === null) {
    return {
      serial: '',
      deviceType: '',
      expireDate: '',
      sipExtensions: '',
      fxsPorts: '',
      maxFxoChannels: '',
      maxSipTrunkChannels: '',
      maxE1: '',
    };
  }

  const sipExt =
    parsed.max_sip_extensions ??
    parsed.sip_extensions ??
    parsed.total_extensions ??
    parsed.max_extensions ??
    parsed.extension_count ??
    parsed.extensions ??
    parsed.num_extensions ??
    '';

  const fxs =
    parsed.max_fxs_ports ??
    parsed.fxs_ports ??
    parsed.number_of_fxs_ports ??
    parsed.fxs_port_count ??
    parsed.num_fxs ??
    '';

  const fxoCh =
    parsed.max_fxo_channels ??
    parsed.max_fxo ??
    parsed.fxo_channels ??
    parsed.number_of_fxo_channels ??
    parsed.num_fxo_channels ??
    parsed.fxo_channel_count ??
    '';

  const tr =
    parsed.max_trunks ??
    parsed.number_of_trunks ??
    parsed.trunks ??
    parsed.trunk_count ??
    parsed.num_trunks ??
    '';

  const sipTrunkCh =
    parsed.max_sip_trunk_channels ??
    parsed.sip_trunk_channels ??
    parsed.max_trunk_channels ??
    parsed.trunk_sip_channels ??
    parsed.sip_trunk_channel_count ??
    parsed.channels_sip_trunks ??
    '';

  /** Single SIP trunk capacity field: prefer channel count; else legacy trunk count from API */
  const sipTrunkDisplay = strOrEmpty(sipTrunkCh) || strOrEmpty(tr);

  const e1 =
    parsed.max_e1 ??
    parsed.max_e1_channels ??
    parsed.e1_channels ??
    parsed.number_of_e1 ??
    parsed.num_e1 ??
    parsed.e1 ??
    '';

  return {
    serial:
      parsed.license_key ||
      parsed.Serial_Number ||
      parsed.serial_number ||
      parsed.serial ||
      '',
    deviceType:
      parsed.device_type ||
      parsed.deviceType ||
      parsed.product_type ||
      parsed.model ||
      parsed.product ||
      '',
    expireDate:
      parsed.expire_date ||
      parsed.expiry_date ||
      parsed.expireDate ||
      parsed.expiration_date ||
      '',
    sipExtensions: strOrEmpty(sipExt),
    fxsPorts: strOrEmpty(fxs),
    maxFxoChannels: strOrEmpty(fxoCh),
    maxSipTrunkChannels: sipTrunkDisplay,
    maxE1: strOrEmpty(e1),
  };
}

const Authorization = () => {
  const [serial, setSerial] = useState(DEFAULT_SERIAL);
  const [deviceType, setDeviceType] = useState('');
  const [expireDate, setExpireDate] = useState('');
  const [sipExtensions, setSipExtensions] = useState('');
  const [fxsPorts, setFxsPorts] = useState('');
  const [maxFxoChannels, setMaxFxoChannels] = useState('');
  const [maxSipTrunkChannels, setMaxSipTrunkChannels] = useState('');
  const [maxE1, setMaxE1] = useState('');
  const [authStatus, setAuthStatus] = useState(DEFAULT_STATUS);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [error, setError] = useState('');

  const applyParsedInfo = useCallback((parsed) => {
    setSerial(parsed.serial || '');
    setDeviceType(parsed.deviceType || DEFAULT_DEVICE_TYPE);
    setExpireDate(parsed.expireDate || DEFAULT_EXPIRY_DATE);
    setSipExtensions(parsed.sipExtensions || '');
    setFxsPorts(parsed.fxsPorts || '');
    setMaxFxoChannels(parsed.maxFxoChannels || '');
    setMaxSipTrunkChannels(parsed.maxSipTrunkChannels || '');
    setMaxE1(parsed.maxE1 || DEFAULT_MAX_E1_PRI);
  }, []);

  const fetchLicenseInfo = useCallback(async () => {
    setLoadingInfo(true);
    setError('');
    try {
      const response = await getLicenseInfo();
      if (response?.response && response.responseData != null) {
        const parsed = parseLicensePayload(response.responseData);
        applyParsedInfo(parsed);
      }
    } catch (err) {
      console.error('Failed to load license info:', err);
      setError(err?.message || 'Failed to load license information.');
    } finally {
      setLoadingInfo(false);
    }
  }, [applyParsedInfo]);

  const fetchSystemSerial = useCallback(async () => {
    try {
      const data = await fetchSystemInfo();
      if (data?.success && data?.details) {
        const versionInfo = Array.isArray(data.details.VERSION_INFO) ? data.details.VERSION_INFO : [];
        const serialEntry = versionInfo.find((item) => {
          const label = String(item?.label || '').trim().toLowerCase();
          return label === 'serial number' || label === 'serial' || label === 'serial no';
        });
        const serialValue = String(serialEntry?.value || '').trim();
        if (serialValue && serialValue.toLowerCase() !== 'unavailable') return serialValue;
      }

      // Fallback mirrors System Info page behavior (astlicense output).
      const astLic = await postLinuxCmd({ cmd: 'astlicense' });
      if (astLic?.response) {
        const out = String(astLic.responseData || '');
        const lines = out.split(/\r?\n/);
        const astLicLine = lines.find((l) => l.trim().toLowerCase().startsWith('astlic:')) || '';
        if (astLicLine) {
          const afterColon = astLicLine.split(':').slice(1).join(':');
          const fields = afterColon.split(',').map((s) => s.trim());
          if (fields.length >= 2 && fields[1]) return fields[1];
        }
      }
      return '';
    } catch (err) {
      console.error('Failed to fetch serial from system info:', err);
      return '';
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setError('');
    await fetchLicenseInfo();
    const sysSerial = await fetchSystemSerial();

    setSerial((prev) => {
      const nextSerial = sysSerial || prev || '';
      // Requested behavior: if serial exists, show Authorized.
      setAuthStatus(nextSerial ? AUTH_STATUS.AUTHORIZED : AUTH_STATUS.UNAUTHORIZED);
      return nextSerial;
    });

    setDeviceType((prev) => prev || DEFAULT_DEVICE_TYPE);
    setExpireDate((prev) => prev || DEFAULT_EXPIRY_DATE);
    setMaxE1((prev) => prev || DEFAULT_MAX_E1_PRI);
  }, [fetchLicenseInfo, fetchSystemSerial]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const formatDisplayDate = (v) => {
    if (!v) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(v).trim())) return String(v).trim();
    try {
      const d = new Date(v);
      if (!Number.isNaN(d.getTime())) return d.toLocaleDateString();
    } catch (_) {}
    return String(v);
  };

  const busy = loadingInfo;

  const statusStyle =
    authStatus === AUTH_STATUS.AUTHORIZED
      ? { color: '#166534', fontWeight: 600, fontSize: '14px' }
      : { color: '#991b1b', fontWeight: 600, fontSize: '14px' };

  const rows = [
    { label: 'Serial Number:', value: serial, loading: loadingInfo },
    { label: 'Authorization Status:', value: authStatus, loading: loadingInfo, isStatus: true },
    { label: 'Device Type:', value: deviceType },
    { label: 'Expiry Date:', value: formatDisplayDate(expireDate) },
    { label: 'Maximum Number of SIP Extensions:', value: sipExtensions },
    { label: 'Maximum Number of FXS Channels:', value: fxsPorts },
    { label: 'Maximum Number of FXO Channels:', value: maxFxoChannels },
    { label: 'Maximum Number of SIP Trunk Channels:', value: maxSipTrunkChannels },
    { label: 'Maximum Number of E1-PRI:', value: maxE1 },
  ];

  return (
    <div
      className="bg-gray-50 min-h-[calc(100vh-200px)] py-0.5 flex flex-col items-center"
      style={{ backgroundColor: '#dde0e4' }}
    >
      <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 relative">
        {error && (
          <Alert
            severity="error"
            onClose={() => setError('')}
            sx={{ position: 'absolute', top: -60, left: 0, right: 0 }}
          >
            {error}
          </Alert>
        )}
        <div style={blueBarStyle}>Authorization Information</div>

        <div className="bg-white border-2 border-gray-400 border-t-0">
          <div className="w-full bg-white flex flex-col gap-0 px-4 py-3">
            <div className="w-full">
              <table
                className="w-full border border-gray-400 bg-white"
                style={{ borderCollapse: 'collapse' }}
              >
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.label}>
                      <td
                        className="border border-gray-400 py-1.5 px-3 text-left align-middle"
                        style={{ width: '38%', ...cellLabelSx }}
                      >
                        {row.label}
                      </td>
                      <td
                        className="border border-gray-400 py-1.5 px-3 align-middle text-center"
                        style={{ width: '62%' }}
                      >
                        {row.isStatus ? (
                          <Box className="flex items-center justify-center gap-2 w-full min-h-[38px]">
                            <span style={statusStyle}>{row.value}</span>
                            {row.loading && <CircularProgress size={18} />}
                          </Box>
                        ) : (
                          <div className="flex items-center justify-center gap-2 w-full">
                            <div className="w-full max-w-lg mx-auto">
                              <TextField
                                type="text"
                                value={row.value}
                                size="medium"
                                fullWidth
                                variant="outlined"
                                sx={readOnlyFieldSx}
                                disabled={!!row.loading}
                                InputProps={{ readOnly: true }}
                              />
                            </div>
                            {row.loading && <CircularProgress size={16} sx={{ flexShrink: 0 }} />}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8 w-full">
          <Button
            type="button"
            variant="contained"
            sx={blueButtonSx}
            onClick={refreshAll}
            disabled={busy}
            className="sm:w-auto"
            startIcon={busy ? <CircularProgress size={18} color="inherit" /> : null}
          >
            {busy ? 'Loading…' : 'Refresh'}
          </Button>
        </div>
        <div className="text-red-600 text-center text-sm mt-4 mb-0">
          Note - The information above is a summary of your license. For any change, contact your
          vendor or authorized supplier.
        </div>
      </div>
    </div>
  );
};

export default Authorization;
