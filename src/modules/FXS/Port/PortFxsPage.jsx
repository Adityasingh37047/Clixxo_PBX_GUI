import React, { useState } from "react";
import {
  PORT_FXS_TABLE_COLUMNS,
  PORT_FXS_ITEMS_PER_PAGE,
  PORT_FXS_TOTAL_PORTS,
  PORT_FXS_PAGE_TITLE,
} from "../../../sections/port/constants/PortFxsPageConstants";
import { fetchFxsPorts } from "../../../api/apiService";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import PortFxsBatchModifyPage from "./PortFxsBatchModifyPage";
import PortFxsModifyPage from "./PortFxsModifyPage";

// Styles
const blueBarStyle = {
  width: "100%",
  height: 32,
  background: "linear-gradient(#3E5475 100%)",
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
  marginBottom: 0,
  display: "flex",
  alignItems: "center",
  fontWeight: 600,
  fontSize: 18,
  color: "#ffffff",
  justifyContent: "center",
  boxShadow: "0 2px 8px 0 rgba(80,160,255,0.10)",
  position: "relative",
};

const batchModifyButtonStyle = {
  position: "absolute",
  left: 8,
  background: "linear-gradient(to bottom, #e3e7ef 0%, #bfc6d1 100%)",
  color: "#000",
  fontSize: 12,
  padding: "3px 12px",
  border: "1px solid #999",
  borderRadius: 3,
  boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
  cursor: "pointer",
  fontWeight: 500,
  height: 24,
};

const thStyle = {
  background: "#fff",
  color: "#222",
  fontWeight: 600,
  fontSize: 12,
  border: "1px solid #bbb",
  padding: "3px 4px",
  whiteSpace: "nowrap",
  textAlign: "center",
  height: "24px",
  lineHeight: "18px",
};

const tdStyle = {
  border: "1px solid #bbb",
  padding: "3px 4px",
  fontSize: 12,
  background: "#f8fafd",
  textAlign: "center",
  whiteSpace: "nowrap",
  height: "24px",
  lineHeight: "18px",
};

const paginationStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "4px auto 0",
  background: "#e3e7ef",
  borderRadius: 8,
  border: "1px solid #ccc",
  borderTop: "none",
  padding: "4px 8px",
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: 6,
  minHeight: 28,
  fontSize: 12,
  justifyContent: "flex-start",
};

const paginationButtonStyle = {
  background: "transparent",
  color: "#222",
  fontSize: 12,
  padding: "2px 4px",
  border: "none",
  borderRadius: 0,
  cursor: "pointer",
  fontWeight: 400,
  minWidth: "auto",
  textDecoration: "none",
};

const paginationLinkStyle = {
  ...paginationButtonStyle,
  color: "#0066cc",
  textDecoration: "underline",
};

const FWD_TYPE_TO_UI = {
  no_reply: "No Reply",
  unconditional: "Unconditional",
  busy: "Busy",
};

const PortFxsPage = () => {
  const [ports, setPorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [batchInitialPorts, setBatchInitialPorts] = useState(null);
  const [maxPorts, setMaxPorts] = useState(PORT_FXS_TOTAL_PORTS);
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const totalPages = Math.max(
    1,
    Math.ceil(ports.length / PORT_FXS_ITEMS_PER_PAGE),
  );
  const pagedPorts = ports.slice(
    (page - 1) * PORT_FXS_ITEMS_PER_PAGE,
    page * PORT_FXS_ITEMS_PER_PAGE,
  );

  // Map API port object to UI row object
  const mapApiPortToRow = (item) => ({
    port: item.port ?? item.id,
    type: "FXS",
    sipAccount: item.sipAccount || "---",
    displayName: item.displayName || "---",
    autoDialNum: item.autoDialNumber || "---",
    dnd: item.dnd ? "Enable" : "Disable",
    forward: item.callForwardEnabled ? "Enable" : "Disable",
    fwdType: FWD_TYPE_TO_UI[item.forwardType] || item.forwardType || "---",
    fwdNumber: item.forwardNumber || "---",
    cid: item.cidEnabled ? "Enable" : "Disable",
    callWaiting: item.callWaiting ? "Enable" : "Disable",
    regStatus: item.enabled ? "Registered" : "Unregistered",
    echoCanceller: item.echoCanceller ? "Enable" : "Disable",
    colorRing: "---",
    colorRingIndex: "---",
    inputGain: item.inputGain ?? 0,
    outputGain: item.outputGain ?? 0,
    raw: item,
  });

  // Fetch ports — backend auto-seeds if DB is empty
  const loadPorts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFxsPorts();
      const data = Array.isArray(res?.data) ? res.data : [];
      // Use maxPorts from API response; fall back to actual data length, then constant
      const apiMaxPorts = res?.maxPorts || data.length || PORT_FXS_TOTAL_PORTS;
      setMaxPorts(apiMaxPorts);
      setPorts(data.map(mapApiPortToRow));
      setRefreshKey(Date.now());
    } catch (err) {
      console.error("Error loading FXS ports:", err);
      setError(err.message || "Failed to load ports");
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
      setBatchInitialPorts({
        startingPort: "1",
        endingPort: String(PORT_FXS_TOTAL_PORTS),
      });
    }
    setShowBatchModify(true);
  };

  return (
    <div
      className="bg-gray-50 min-h-[calc(100vh-80px)] flex flex-col items-center box-border"
      style={{ backgroundColor: "#dde0e4", padding: "8px" }}
    >
      <div className="w-full max-w-full mx-auto">
        {/* Blue Bar with Title and Batch Modify Button (hide when a modify panel is open) */}
        {!showBatchModify && !showSingleModify && (
          <div style={blueBarStyle}>
            <button style={batchModifyButtonStyle} onClick={handleBatchModify}>
              Batch Modify
            </button>
            <span>{PORT_FXS_PAGE_TITLE}</span>
          </div>
        )}

        {/* Table Container or Inline Modify Panels */}
        {!showBatchModify && !showSingleModify && (
          <div
            key={refreshKey}
            className="w-full bg-white border-2 border-gray-400 border-t-0 rounded-b-lg"
            style={{ overflowX: "auto", overflowY: "visible" }}
          >
            {loading ? (
              <div style={{ padding: 40, textAlign: "center" }}>
                Loading ports...
              </div>
            ) : error ? (
              <div style={{ padding: 40, textAlign: "center", color: "red" }}>
                Error: {error}
              </div>
            ) : (
              <table
                className="w-full"
                style={{
                  backgroundColor: "#f8fafd",
                  tableLayout: "auto",
                  borderCollapse: "collapse",
                  width: "100%",
                  minWidth: "1400px",
                }}
              >
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
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                          }}
                        >
                          <EditDocumentIcon
                            style={{ fontSize: 16, color: "#0e8fd6" }}
                          />
                        </button>
                      </td>
                      <td style={tdStyle}>{port.port}</td>
                      <td style={tdStyle}>{port.type}</td>
                      <td style={tdStyle}>{port.sipAccount}</td>
                      <td style={tdStyle}>{port.displayName}</td>
                      <td style={tdStyle}>{port.dnd}</td>
                      <td style={tdStyle}>{port.forward}</td>
                      <td style={tdStyle}>{port.callWaiting}</td>
                      <td style={tdStyle}>
                        {(() => {
                          const s = String(port.regStatus || "").toLowerCase();
                          const registered = s === "registered";
                          const unregistered =
                            s === "unregistered" ||
                            s === "rejected" ||
                            s === "";
                          return (
                            <span
                              style={{
                                display: "inline-block",
                                padding: "1px 10px",
                                borderRadius: 10,
                                fontSize: 11,
                                fontWeight: 600,
                                background: registered ? "#dcfce7" : "#f3f4f6",
                                color: registered ? "#15803d" : "#6b7280",
                                border: `1px solid ${registered ? "#86efac" : "#d1d5db"}`,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {port.regStatus || "—"}
                            </span>
                          );
                        })()}
                      </td>
                      <td style={tdStyle}>{port.echoCanceller}</td>
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
            maxPorts={maxPorts}
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
          <span>
            {ports.length} Items Total&nbsp;&nbsp; {PORT_FXS_ITEMS_PER_PAGE}{" "}
            Items/Page
          </span>
          <span>
            &nbsp;&nbsp; {page}/{totalPages}&nbsp;&nbsp;
          </span>
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
              padding: "1px 4px",
              borderRadius: 2,
              border: "1px solid #bbb",
              background: "#fff",
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
