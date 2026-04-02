import React, { useEffect, useState } from 'react';
import { CircularProgress } from '@mui/material';
import { Tabs, Tab } from '@mui/material';
import { monitorBoth } from '../api/apiService';

const PbxMonitor = () => {
  const [activeTab, setActiveTab] = useState('extension'); // 'extension' | 'trunk'
  const [loading, setLoading] = useState({ extension: false, trunk: false });
  const [extensionRows, setExtensionRows] = useState([]);
  const [trunkRows, setTrunkRows] = useState([]);

  const normalizeString = (v) => (v == null ? '' : String(v));

  const normalizeStatus = (v) => normalizeString(v).toLowerCase().trim();

  const getExtensionStatusLabel = (row) => {
    const status = normalizeStatus(row?.status || row?.registration_status || row?.register_status);
    if (status === 'registered') return { text: 'Registered', tone: 'ok' };
    if (status === 'unregistered') return { text: 'Unregistered', tone: 'bad' };
    if (status === 'rejected') return { text: 'Rejected', tone: 'bad' };
    return { text: row?.status || row?.registration_status || 'Unknown', tone: 'neutral' };
  };

  const getTrunkStatusLabel = (row) => {
    const status = normalizeStatus(row?.trunk_status || row?.status || row?.registration_status || row?.register_status);
    if (status === 'registered') return { text: 'Registered', tone: 'ok' };
    if (status === 'unregistered') return { text: 'Unregistered', tone: 'bad' };
    if (status === 'rejected') return { text: 'Rejected', tone: 'bad' };
    return { text: row?.trunk_status || row?.status || 'Unknown', tone: 'neutral' };
  };

  const getBadgeClass = (tone) => {
    if (tone === 'ok') return 'bg-green-100 text-green-800';
    if (tone === 'warn') return 'bg-yellow-100 text-yellow-800';
    if (tone === 'bad') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-600';
  };

  const getExtensionType = (row) => {
    const t = normalizeString(row?.type).toLowerCase();
    if (t.includes('fxs')) return 'FXS';
    return 'SIP';
  };

  const formatIpPort = (row) => {
    const ip =
      row?.ip_port_host ||
      row?.ip_host ||
      row?.host ||
      row?.contact_host ||
      row?.proxy_ip ||
      row?.remote_ip ||
      row?.ip ||
      '';
    const port = row?.ip_port_port ?? row?.port ?? row?.contact_port ?? row?.proxy_port ?? '';
    if (ip && port) return `${ip}:${port}`;
    if (ip) return String(ip);
    return '-';
  };

  const formatHostnameIpPort = (row) => {
    const host =
      row?.hostname ||
      row?.host ||
      row?.domain ||
      row?.proxy_ip ||
      row?.ip ||
      row?.server_host ||
      '';
    const port = row?.proxy_port ?? row?.port ?? row?.server_port ?? '';
    if (host && port) return `${host}:${port}`;
    if (host) return String(host);
    return '-';
  };

  const transformExtensionApi = (apiList) => {
    const list = Array.isArray(apiList) ? apiList : [];
    return list.map((item, idx) => ({
      id: item?.extension ?? item?.id ?? idx,
      status: item?.status ?? '',
      extension: item?.extension ?? '',
      name: item?.name ?? '',
      type: item?.type ?? '',
      ipPort: item?.ip_port ?? '',
    }));
  };

  const transformTrunkApi = (apiList) => {
    const list = Array.isArray(apiList) ? apiList : [];
    return list.map((item, idx) => ({
      id: item?.trunk_id ?? item?.id ?? idx,
      trunkName: item?.trunk_name ?? '',
      type: item?.type ?? '',
      trunk_status: item?.status ?? '',
      status: item?.status ?? '',
      host: item?.host_ip_port ?? '',
    }));
  };

  const loadMonitorData = async () => {
    setLoading({ extension: true, trunk: true });
    try {
      const res = await monitorBoth();
      const message = res?.message ?? {};
      setExtensionRows(transformExtensionApi(message?.extensions ?? []));
      setTrunkRows(transformTrunkApi(message?.trunks ?? []));
    } catch (e) {
      setExtensionRows([]);
      setTrunkRows([]);
    } finally {
      setLoading({ extension: false, trunk: false });
    }
  };

  useEffect(() => {
    loadMonitorData();
  }, []);

  const currentRows = activeTab === 'extension' ? extensionRows : trunkRows;

  return (
    <div className="w-full min-h-[calc(100vh-200px)] flex flex-col items-center box-border" style={{ backgroundColor: '#dde0e4' }}>
      <div
        className="w-full max-w-[1320px] mx-auto mt-0"
        style={{
          background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)',
          boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)',
        }}
      >
        <div className="rounded-t-lg h-8 flex items-center justify-center font-semibold text-[16px] text-[#444] shadow-sm">
          PBX Monitor
        </div>
      </div>

      <div className="w-full max-w-[1320px] mx-auto p-0">
        <div className="bg-[#f8fafd] border border-gray-300 border-t-0 rounded-none p-0">
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            variant="fullWidth"
            textColor="inherit"
            TabIndicatorProps={{ style: { backgroundColor: '#0e8fd6', height: 3 } }}
            sx={{
              '& .MuiTab-root': { minHeight: 28, paddingTop: 0, paddingBottom: 0 },
            }}
          >
            <Tab label="EXTENSION" value="extension" sx={{ fontSize: 12, fontWeight: 700, minHeight: 28 }} />
            <Tab label="TRUNK" value="trunk" sx={{ fontSize: 12, fontWeight: 700, minHeight: 28 }} />
          </Tabs>
        </div>

        {/* Total */}
        <div className="flex items-center bg-[#f8fafd] border border-gray-300 border-t-0 border-b-0 px-3 py-0.5 rounded-none">
          <div className="text-[11px] text-gray-700 whitespace-nowrap">
            Total: {currentRows.length} {activeTab === 'extension' ? '(Extension)' : '(Trunk)'}
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-[#f8fafd] border border-gray-300 border-t-0 rounded-b-lg shadow-sm overflow-x-auto">
          {activeTab === 'extension' ? (
            <table className="w-full table-fixed min-w-[1200px] bg-[#f8fafd] border border-gray-300">
              <thead>
                <tr>
                  <th className="bg-white text-gray-800 font-semibold text-[11px] border border-gray-300 px-2 py-1 whitespace-nowrap w-[120px]">Status</th>
                  <th className="bg-white text-gray-800 font-semibold text-[11px] border border-gray-300 px-2 py-1 whitespace-nowrap w-[120px]">Extension</th>
                  <th className="bg-white text-gray-800 font-semibold text-[11px] border border-gray-300 px-2 py-1 whitespace-nowrap w-[260px]">Name</th>
                  <th className="bg-white text-gray-800 font-semibold text-[11px] border border-gray-300 px-2 py-1 whitespace-nowrap w-[90px]">Type</th>
                  <th className="bg-white text-gray-800 font-semibold text-[11px] border border-gray-300 px-2 py-1 whitespace-nowrap w-[300px]">IP and Port</th>
                </tr>
              </thead>
              <tbody>
                {loading.extension ? (
                  <tr>
                    <td colSpan={5} className="px-2 py-6 text-center">
                      <CircularProgress size={20} />
                    </td>
                  </tr>
                ) : extensionRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="border border-gray-300 px-2 py-4 text-center text-gray-500">
                      No extension data
                    </td>
                  </tr>
                ) : (
                  extensionRows.map((row) => {
                    const status = getExtensionStatusLabel(row);
                    return (
                      <tr key={row.id}>
                        <td className={`border border-gray-300 px-2 py-1 text-center`}>
                          <span className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${getBadgeClass(status.tone)}`}>{status.text}</span>
                        </td>
                        <td className="border border-gray-300 px-2 py-1 text-center whitespace-nowrap">{row.extension || '-'}</td>
                        <td className="border border-gray-300 px-2 py-1 text-center whitespace-nowrap overflow-hidden text-ellipsis">{row.name || '-'}</td>
                        <td className="border border-gray-300 px-2 py-1 text-center whitespace-nowrap">{getExtensionType(row)}</td>
                        <td className="border border-gray-300 px-2 py-1 text-center whitespace-nowrap overflow-hidden text-ellipsis">{row.ipPort || '-'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full table-fixed min-w-[1200px] bg-[#f8fafd] border border-gray-300">
              <thead>
                <tr>
                  <th className="bg-white text-gray-800 font-semibold text-[11px] border border-gray-300 px-2 py-1 whitespace-nowrap w-[160px]">Trunk Status</th>
                  <th className="bg-white text-gray-800 font-semibold text-[11px] border border-gray-300 px-2 py-1 whitespace-nowrap w-[280px]">Trunk Name</th>
                  <th className="bg-white text-gray-800 font-semibold text-[11px] border border-gray-300 px-2 py-1 whitespace-nowrap w-[90px]">Type</th>
                  <th className="bg-white text-gray-800 font-semibold text-[11px] border border-gray-300 px-2 py-1 whitespace-nowrap w-[280px]">Hostname/Ip-port</th>
                </tr>
              </thead>
              <tbody>
                {loading.trunk ? (
                  <tr>
                    <td colSpan={4} className="px-2 py-6 text-center">
                      <CircularProgress size={20} />
                    </td>
                  </tr>
                ) : trunkRows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="border border-gray-300 px-2 py-4 text-center text-gray-500">
                      No trunk data
                    </td>
                  </tr>
                ) : (
                  trunkRows.map((row) => {
                    const status = getTrunkStatusLabel(row);
                    return (
                      <tr key={row.id}>
                        <td className={`border border-gray-300 px-2 py-1 text-center`}>
                          <span className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${getBadgeClass(status.tone)}`}>{status.text}</span>
                        </td>
                        <td className="border border-gray-300 px-2 py-1 text-center whitespace-nowrap overflow-hidden text-ellipsis">{row.trunkName || '-'}</td>
                        <td className="border border-gray-300 px-2 py-1 text-center whitespace-nowrap">{row.type || '-'}</td>
                        <td className="border border-gray-300 px-2 py-1 text-center whitespace-nowrap overflow-hidden text-ellipsis">{row.host || '-'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default PbxMonitor;