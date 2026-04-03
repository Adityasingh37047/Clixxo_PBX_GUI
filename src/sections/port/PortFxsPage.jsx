import React, { useState } from 'react';
import {
  PORT_FXS_TABLE_COLUMNS,
  PORT_FXS_ITEMS_PER_PAGE,
  PORT_FXS_TOTAL_PORTS,
  PORT_FXS_INITIAL_DATA,
  PORT_FXS_PAGE_TITLE,
} from './constants/PortFxsPageConstants';
// import { fetchFxsPorts, initializeFxsPorts } from './controller';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import PortFxsBatchModifyPage from './PortFxsBatchModifyPage';
import PortFxsModifyPage from './PortFxsModifyPage';

// Styles
const blueBarStyle = {
  width: '100%',
  height: 32,
  background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)',
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
  marginBottom: 0,
  display: 'flex',
  alignItems: 'center',
  fontWeight: 600,
  fontSize: 16,
  color: '#000',
  justifyContent: 'center',
  boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)',
  position: 'relative',
};

const batchModifyButtonStyle = {
  position: 'absolute',
  left: 8,
  background: 'linear-gradient(to bottom, #e3e7ef 0%, #bfc6d1 100%)',
  color: '#000',
  fontSize: 12,
  padding: '3px 12px',
  border: '1px solid #999',
  borderRadius: 3,
  boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
  cursor: 'pointer',
  fontWeight: 500,
  height: 24,
};

const thStyle = {
  background: '#fff',
  color: '#222',
  fontWeight: 600,
  fontSize: 12,
  border: '1px solid #bbb',
  padding: '3px 4px',
  whiteSpace: 'nowrap',
  textAlign: 'center',
  height: '24px',
  lineHeight: '18px',
};

const tdStyle = {
  border: '1px solid #bbb',
  padding: '3px 4px',
  fontSize: 12,
  background: '#f8fafd',
  textAlign: 'center',
  whiteSpace: 'nowrap',
  height: '24px',
  lineHeight: '18px',
};

const paginationStyle = {
  width: '100%',
  maxWidth: '100%',
  margin: '4px auto 0',
  background: '#e3e7ef',
  borderRadius: 8,
  border: '1px solid #ccc',
  borderTop: 'none',
  padding: '4px 8px',
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 6,
  minHeight: 28,
  fontSize: 12,
  justifyContent: 'flex-start',
};

const paginationButtonStyle = {
  background: 'transparent',
  color: '#222',
  fontSize: 12,
  padding: '2px 4px',
  border: 'none',
  borderRadius: 0,
  cursor: 'pointer',
  fontWeight: 400,
  minWidth: 'auto',
  textDecoration: 'none',
};

const paginationLinkStyle = {
  ...paginationButtonStyle,
  color: '#0066cc',
  textDecoration: 'underline',
};

// Initialize port data
const initializePortData = () => {
  return Array.from({ length: PORT_FXS_TOTAL_PORTS }, (_, i) => ({
    ...PORT_FXS_INITIAL_DATA,
    port: i + 1,
  }));
};

// Initialize batch modify form
const getInitialBatchForm = () => {
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
  return form;
};

const PortFxsPage = () => {
  const [ports, setPorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [batchInitialPorts, setBatchInitialPorts] = useState(null);
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const totalPages = Math.max(1, Math.ceil(ports.length / PORT_FXS_ITEMS_PER_PAGE));
  const pagedPorts = ports.slice(
    (page - 1) * PORT_FXS_ITEMS_PER_PAGE,
    page * PORT_FXS_ITEMS_PER_PAGE
  );

  // Map API port object to UI row object
  const mapApiPortToRow = (item) => {
    return {
      port: item.port_number ?? item.port ?? item.id,
      type: item.type ?? 'FXS',
      sipAccount: item.sip_account || item.starting_authentication_username || '---',
      displayName: item.display_name || item.starting_display_name || '---',
      autoDialNum: item.auto_dial_number_value || item.auto_dial || '---',
      dnd: item.dnd_do_not_disturb ? 'Enable' : 'Disable',
      forward: item.call_forward ? 'Enable' : 'Disable',
      fwdType: item.forward_type || '---',
      fwdNumber: item.forward_number || '---',
      cid: item.cid_enable ? 'Enable' : 'Disable',
      callWaiting: item.call_waiting ? 'Enable' : 'Disable',
      regStatus: item.ing_mode || item.status || '---',
      echoCanceller: item.echo_canceller ? 'Enable' : 'Disable',
      colorRing: item.color_ring ? 'Enable' : 'Disable',
      colorRingIndex: item.color_ring_index ?? item.color_ring_index_status ?? '---',
      inputGain: item.input_gain ?? item.input_gain_db ?? 0,
      outputGain: item.output_gain ?? item.output_gain_db ?? 0,
      raw: item,
    };
  };

  // Fetch ports from API, initialize if empty
  const loadPorts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFxsPorts();
      const data = res && res.data ? res.data : (res || []);
        if (!Array.isArray(data) || data.length === 0) {
        // initialize then refetch
        await initializeFxsPorts();
        const retry = await fetchFxsPorts();
        const retryData = retry && retry.data ? retry.data : (retry || []);
        setPorts(retryData.map(mapApiPortToRow));
        setRefreshKey(Date.now());
      } else {
        setPorts(data.map(mapApiPortToRow));
        setRefreshKey(Date.now());
      }
    } catch (err) {
      console.error('Error loading FXS ports:', err);
      setError(err.message || 'Failed to load ports');
      // fallback to default initialization data
      setPorts(initializePortData());
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadPorts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle page change
  const handlePageChange = (newPage) => {
    setPage(Math.max(1, Math.min(totalPages, newPage)));
  };

  // Local UI state for inline modify panels
  const [showBatchModify, setShowBatchModify] = useState(false);
  const [showSingleModify, setShowSingleModify] = useState(false);
  const [selectedPort, setSelectedPort] = useState(null);

  // Handle batch modify button click - show inline batch modify
  const handleBatchModify = () => {
    // set default starting/ending ports from fetched ports if available
    if (ports && ports.length > 0) {
      setBatchInitialPorts({
        startingPort: String(ports[0].port),
        endingPort: String(ports[ports.length - 1].port),
      });
    } else {
      setBatchInitialPorts({ startingPort: '1', endingPort: String(PORT_FXS_TOTAL_PORTS) });
    }
    setShowBatchModify(true);
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-80px)] flex flex-col items-center box-border" style={{ backgroundColor: '#dde0e4', padding: '8px' }}>
      <div className="w-full max-w-full mx-auto">
        {/* Blue Bar with Title and Batch Modify Button (hide when a modify panel is open) */}
        {!showBatchModify && !showSingleModify && (
          <div style={blueBarStyle}>
            <button
              style={batchModifyButtonStyle}
              onClick={handleBatchModify}
            >
              Batch Modify
            </button>
            <span>{PORT_FXS_PAGE_TITLE}</span>
          </div>
        )}

        {/* Table Container or Inline Modify Panels */}
        {!showBatchModify && !showSingleModify && (
          <div key={refreshKey} className="w-full bg-white border-2 border-gray-400 border-t-0 rounded-b-lg" style={{ overflowX: 'auto', overflowY: 'visible' }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center' }}>Loading ports...</div>
            ) : error ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'red' }}>Error: {error}</div>
            ) : (
              <table className="w-full" style={{ backgroundColor: '#f8fafd', tableLayout: 'auto', borderCollapse: 'collapse', width: '100%', minWidth: '1400px' }}>
                <thead>
                  <tr>
                    {PORT_FXS_TABLE_COLUMNS.map((col) => (
                      <th key={col.key} style={thStyle}>
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedPorts.map((port, idx) => (
                    <tr key={port.port}>
                      <td style={tdStyle}>
                        <button
                          onClick={() => {
                            setSelectedPort(String(port.port));
                            setShowSingleModify(true);
                          }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          <EditDocumentIcon style={{ fontSize: 16, color: '#0e8fd6' }} />
                        </button>
                      </td>
                      <td style={tdStyle}>{port.port}</td>
                      <td style={tdStyle}>{port.type}</td>
                      <td style={tdStyle}>{port.sipAccount}</td>
                      <td style={tdStyle}>{port.displayName}</td>
                      <td style={tdStyle}>{port.autoDialNum}</td>
                      <td style={tdStyle}>{port.dnd}</td>
                      <td style={tdStyle}>{port.forward}</td>
                      <td style={tdStyle}>{port.fwdType}</td>
                      <td style={tdStyle}>{port.fwdNumber}</td>
                      <td style={tdStyle}>{port.cid}</td>
                      <td style={tdStyle}>{port.callWaiting}</td>
                      <td style={tdStyle}>{port.regStatus}</td>
                      <td style={tdStyle}>{port.echoCanceller}</td>
                      <td style={tdStyle}>{port.colorRing}</td>
                      <td style={tdStyle}>{port.colorRingIndex}</td>
                      <td style={tdStyle}>{port.inputGain}</td>
                      <td style={tdStyle}>{port.outputGain}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {showBatchModify && (
          <PortFxsBatchModifyPage
            initialPorts={batchInitialPorts}
            onSaved={async () => {
              await loadPorts();
              setShowBatchModify(false);
            }}
            onClose={() => setShowBatchModify(false)}
          />
        )}

        {showSingleModify && selectedPort && (
          <PortFxsModifyPage
            port={selectedPort}
            onSaved={async () => {
              await loadPorts();
              setShowSingleModify(false);
              setSelectedPort(null);
            }}
            onClose={() => {
              setShowSingleModify(false);
              setSelectedPort(null);
            }}
          />
        )}

        {/* Pagination */}
        <div style={paginationStyle}>
          <span>{ports.length} Items Total&nbsp;&nbsp; {PORT_FXS_ITEMS_PER_PAGE} Items/Page</span>
          <span>&nbsp;&nbsp; {page}/{totalPages}&nbsp;&nbsp;</span>
          {page > 1 ? (
            <button
              style={paginationLinkStyle}
              onClick={() => handlePageChange(1)}
            >
              First
            </button>
          ) : (
            <span>First</span>
          )}
          <span>&nbsp;&nbsp;</span>
          {page > 1 ? (
            <button
              style={paginationLinkStyle}
              onClick={() => handlePageChange(page - 1)}
            >
              Previous
            </button>
          ) : (
            <span>Previous</span>
          )}
          <span>&nbsp;&nbsp;</span>
          {page < totalPages ? (
            <button
              style={paginationLinkStyle}
              onClick={() => handlePageChange(page + 1)}
            >
              Next
            </button>
          ) : (
            <span>Next</span>
          )}
          <span>&nbsp;&nbsp;</span>
          {page < totalPages ? (
            <button
              style={paginationLinkStyle}
              onClick={() => handlePageChange(totalPages)}
            >
              Last
            </button>
          ) : (
            <span>Last</span>
          )}
          <span>&nbsp;&nbsp; Go to Page </span>
          <select
            style={{
              fontSize: 12,
              padding: '1px 4px',
              borderRadius: 2,
              border: '1px solid #bbb',
              background: '#fff',
            }}
            value={page}
            onChange={(e) => handlePageChange(Number(e.target.value))}
          >
            {Array.from({ length: totalPages }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
          <span>&nbsp;&nbsp; {totalPages} Pages Total</span>
        </div>
      </div>
    </div>
  );
};

export default PortFxsPage;

