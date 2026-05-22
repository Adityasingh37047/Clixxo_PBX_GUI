import React, { useEffect, useState, useCallback } from "react";
import { CircularProgress } from "@mui/material";
import { monitorBoth } from "../../../api/apiService";

const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#e2e8f0",

  labelText: "#64748b",
  valueText: "#0f172a",
  mutedText: "#94a3b8",

  accent: "#2563eb",

  successGreen: "#22c55e",
  errorRed: "#ef4444",

  purple: "#8b5cf6",
};

const StatCard = ({ label, value, accent, loading }) => (
  <div
    style={{
      background: "#ffffff",
      borderRadius: 16,
      padding: 20,
      minHeight: 90,
      border: "1px solid #f1f5f9",
      boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    }}
  >
    <span
      style={{
        fontSize: 11,
        color: C.labelText,
        fontWeight: 600,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
      }}
    >
      {label}
    </span>

    {loading ? (
      <CircularProgress size={18} style={{ color: accent }} />
    ) : (
      <span
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: accent,
        }}
      >
        {value}
      </span>
    )}
  </div>
);

const StatusBadge = ({ tone, text }) => {
  const colors = {
    ok: {
      
      color: "#166534",
      dot: "#22c55e",
    },

    bad: {
      
      color: "#991b1b",
      dot: "#ef4444",
    },

    neutral: {
      
      color: "#64748b",
      dot: "#94a3b8",
    },
  };

  const s = colors[tone] || colors.neutral;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        background: s.bg,
        color: s.color,
        padding: "4px 11px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.01em",
        whiteSpace: "nowrap",
        minWidth: 72,
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: s.dot,
        }}
      />

      {text}
    </span>
  );
};

const TypePill = ({ text }) => (
  <span
    style={{
     
      color: "#2563eb",
      padding: "4px 11px",
      borderRadius: 999,
      fontWeight: 700,
      fontSize: 11,
      letterSpacing: "0.01em",
      whiteSpace: "nowrap",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: 72,
    }}
  >
    {text}
  </span>
);

const tableWrapStyle = {
  overflowX: "auto",
};

const tableStyle = {
  width: "100%",
  minWidth: 900,
  borderCollapse: "collapse",
  tableLayout: "auto",
};

const TH = ({ children, width, align = "left" }) => (
  <th
    style={{
      background: "#f8fafc",
      color: C.labelText,
      fontWeight: 700,
      fontSize: 11,
      padding: "12px 14px",
      textAlign: align,
      borderBottom: `1px solid ${C.cardBorder}`,
      borderRight: "1px solid #f1f5f9",
      whiteSpace: "nowrap",
      width: width || "auto",
      letterSpacing: "0.14em",
      textTransform: "uppercase",
    }}
  >
    {children}
  </th>
);

const TD = ({ children, align = "left", mono }) => (
  <td
    style={{
      padding: "10px 14px",
      fontSize: 13,
      color: C.valueText,
      textAlign: align,
      fontFamily: mono ? "monospace" : "Inter, sans-serif",
      fontWeight: 500,
      borderRight: "1px solid #f1f5f9",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    }}
  >
    {children || <span style={{ color: C.mutedText }}>—</span>}
  </td>
);

const PbxMonitor = () => {
  const [activeTab, setActiveTab] = useState("extension");
  const [loading, setLoading] = useState(true);
  const [extensionRows, setExtensionRows] = useState([]);
  const [trunkRows, setTrunkRows] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const normalizeStatus = (v) =>
    (v == null ? "" : String(v)).toLowerCase().trim();

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const res = await monitorBoth();

      const msg = res?.message ?? {};

      setExtensionRows(msg?.extensions ?? []);
      setTrunkRows(msg?.trunks ?? []);

      setLastUpdated(new Date());
    } catch {
      setExtensionRows([]);
      setTrunkRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    const interval = setInterval(loadData, 30000);

    return () => clearInterval(interval);
  }, [loadData]);

  const getStatus = (status) => {
    const s = normalizeStatus(status);

    if (s === "registered")
      return { text: "Registered", tone: "ok" };

    if (s === "unregistered")
      return { text: "Unregistered", tone: "bad" };

    return { text: "Unknown", tone: "neutral" };
  };

  const extRegistered = extensionRows.filter(
    (r) => normalizeStatus(r.status) === "registered"
  ).length;

  const extUnregistered =
    extensionRows.length - extRegistered;

  const trkRegistered = trunkRows.filter(
    (r) => normalizeStatus(r.status) === "registered"
  ).length;

  const filteredExtensions = extensionRows.filter(
    (r) =>
      !searchQuery ||
      String(r.extension).includes(searchQuery) ||
      (r.name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const filteredTrunks = trunkRows.filter(
    (r) =>
      !searchQuery ||
      (r.trunk_name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  return (
    <div
      style={{
        background: C.pageBg,
        minHeight: "100vh",
        padding: 24,
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Header */}
<div
  style={{
    marginBottom: 24,
  }}
>
  
    {/* Breadcrumb */}
<div
  style={{
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 14,
    fontWeight: 400,
    display: "flex",
    alignItems: "center",
    gap: 4,
  }}
>
  <span>Status</span>
  <span>&gt;</span>

  <span>PBX Status</span>
  <span>&gt;</span>

  <span
    style={{
      color: "#0f172a",
      fontWeight: 600,
    }}
  >
    PBX Monitor
  </span>
</div>

</div>


  

{/* Stats */}

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <StatCard
          label="Total Extensions"
          value={extensionRows.length}
          accent={C.accent}
          loading={loading}
        />

        <StatCard
          label="Registered"
          value={extRegistered}
          accent={C.successGreen}
          loading={loading}
        />

        <StatCard
          label="Unregistered"
          value={extUnregistered}
          accent={C.errorRed}
          loading={loading}
        />

        <StatCard
          label="Registered Trunks"
          value={trkRegistered}
          accent={C.purple}
          loading={loading}
        />
      </div>

      {/* Main Card */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: 22,
          overflow: "hidden",
          border: `1px solid ${C.cardBorder}`,
          boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
        }}
      >
        {/* Tabs */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 18px",
            borderBottom: "1px solid #e2e8f0",
            background: "#ffffff",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {["extension", "trunk"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "5px 14px",
                  fontSize: 11,
                  fontWeight: 700,
                  color:
                    activeTab === tab
                      ? C.accent
                      : C.labelText,
                  background:
                    activeTab === tab
                      ? "#eff6ff"
                      : "#f1f5f9",
                  border:
                    activeTab === tab
                      ? `1px solid ${C.accent}`
                      : "1px solid #e2e8f0",
                  borderRadius: 999,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap",
                }}
              >
                {tab === "extension"
                  ? "Extensions"
                  : "Trunks"}
              </button>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            {/* Search */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "#ffffff",
                border: `1px solid ${searchFocused ? C.accent : C.cardBorder}`,
                borderRadius: 999,
                padding: "7px 14px",
                transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                boxShadow: searchFocused ? "0 0 0 4px rgba(37,99,235,0.08)" : "none",
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: searchFocused ? C.accent : C.mutedText,
                }}
              >
                🔍
              </span>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search..."
                style={{
                  border: "none",
                  background: "transparent",
                  outline: "none",
                  width: 240,
                  minWidth: 180,
                  fontSize: 12,
                  color: C.valueText,
                }}
              />
              {searchQuery && (
                <span
                  onClick={() => setSearchQuery("")}
                  style={{
                    fontSize: 11,
                    color: C.mutedText,
                    cursor: "pointer",
                  }}
                >
                  ✕
                </span>
              )}
            </div>

            {/* Refresh */}
            <button
              onClick={loadData}
              style={{
                background: C.cardBg,
                color: C.accent,
                border: `0.5px solid ${C.cardBorder}`,
                borderRadius: 6,
                padding: "5px 14px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 11,
                display: "flex",
                alignItems: "center",
                gap: 5,
                transition: "opacity 0.15s ease",
                whiteSpace: "nowrap",
              }}
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={tableWrapStyle}>
          {loading ? (
            <div
              style={{
                padding: 50,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <CircularProgress />
            </div>
          ) : activeTab === "extension" ? (
            <table
              style={tableStyle}
            >
              <thead>
                <tr>
                  <TH>Status</TH>
                  <TH align="center">Extension</TH>
                  <TH>Name</TH>
                  <TH align="center">Type</TH>
                  <TH>IP & Port</TH>
                </tr>
              </thead>

              <tbody>
                {filteredExtensions.map((row, idx) => {
                  const status = getStatus(row.status);
                  const rowBg = idx % 2 === 1 ? "#f8fafc" : "#ffffff";

                  return (
                    <tr
                      key={row.extension}
                      style={{
                        background: rowBg,
                        borderBottom: "1px solid #f1f5f9",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "#f8fafc";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          rowBg;
                      }}
                    >
                      <TD align="center">
                        <StatusBadge
                          tone={status.tone}
                          text={status.text}
                        />
                      </TD>

                      <TD align="center">
                        {row.extension}
                      </TD>

                      <TD>{row.name}</TD>

                      <TD align="center">
                        <TypePill text="SIP" />
                      </TD>

                      <TD mono>{row.ip_port}</TD>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table
              style={tableStyle}
            >
              <thead>
                <tr>
                  <TH>Status</TH>
                  <TH>Trunk Name</TH>
                  <TH align="center">Type</TH>
                  <TH>Host</TH>
                </tr>
              </thead>

              <tbody>
                {filteredTrunks.map((row, idx) => {
                  const status = getStatus(row.status);
                  const rowBg = idx % 2 === 1 ? "#f8fafc" : "#ffffff";

                  return (
                    <tr
                      key={row.id}
                      style={{
                        background: rowBg,
                        borderBottom: "1px solid #f1f5f9",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "#f8fafc";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          rowBg;
                      }}
                    >
                      <TD align="center">
                        <StatusBadge
                          tone={status.tone}
                          text={status.text}
                        />
                      </TD>

                      <TD>{row.trunk_name}</TD>

                      <TD align="center">
                        <TypePill
                          text={row.type || "SIP"}
                        />
                      </TD>

                      <TD mono>{row.host_ip_port}</TD>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default PbxMonitor;
