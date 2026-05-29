import React, { useEffect, useState, useCallback, useRef } from "react";
import { CircularProgress } from "@mui/material";
import { monitorBoth } from "../../../api/apiService";

const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#9CA3AF",
  labelText: "#3E5475",
  valueText: "#0f172a",
  strongText: "#0f172a",
  mutedText: "#94a3b8",
  accent: "#3E5475",
  successGreen: "#22c55e",
  errorRed: "#ef4444",
  purple: "#8b5cf6",
};

const CARD_RADIUS = 10;

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
}) => {
  const styles = {
    default: {
      background: C.cardBg,
      color: C.valueText,
      border: "1px solid #9ca3af",
    },
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
    },
  };
  const s = styles[variant] || styles.default;
  const hoverBg = variant === "cancel" ? "#b6c2d3" : "#e2e8f0";
  const baseBg = s.background;

  return (
    <button
      type={type || "button"}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 14px",
        borderRadius: 10,
        fontSize: 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "all 0.15s ease",
        height: 30,
        gap: 6,
        whiteSpace: "nowrap",
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.background = baseBg;
      }}
    >
      {children}
    </button>
  );
};

const StatCard = ({ label, value, accent, ready }) => (
  <div
    style={{
      background: "#ffffff",
      borderRadius: 10,
      padding: 20,
      minHeight: 90,
      border: `1px solid ${C.cardBorder}`,
      boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
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

    <span
      style={{
        fontSize: 28,
        fontWeight: 700,
        color: ready ? accent : C.mutedText,
      }}
    >
      {ready ? value : "—"}
    </span>
  </div>
);

const STATUS_BADGE_WIDTH = 118;

const StatusBadge = ({ tone, text }) => {
  const colors = {
    ok: {
      // bg: "#dcfce7",
      color: "#166534",
      dot: "#22c55e",
    },
    bad: {
      // bg: "#fee2e2",
      color: "#991b1b",
      dot: "#ef4444",
    },
    neutral: {
      // bg: "#f1f5f9",
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
        justifyContent: "flex-start",
        gap: 6,
        boxSizing: "border-box",
        width: STATUS_BADGE_WIDTH,
        minWidth: STATUS_BADGE_WIDTH,
        background: s.bg,
        color: s.color,
        padding: "4px 11px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.01em",
        whiteSpace: "nowrap",
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
      // background: "#eff6ff",
      color: C.accent,
      // border: `1px solid ${C.accent}`,
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
  borderCollapse: "separate",
  borderSpacing: 0,
  tableLayout: "auto",
};

const TH = ({ children, width, align = "center", style: extra }) => (
  <th
    style={{
      background: "#F8FAFC",
      color: C.labelText,
      fontWeight: 700,
      fontSize: 11,
      padding: "9px 14px",
      textAlign: align,
      borderBottom: `1px solid ${C.cardBorder}`,
      borderRight: `1px solid ${C.cardBorder}`,
      whiteSpace: "nowrap",
      width: width || "auto",
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      ...extra,
    }}
  >
    {children}
  </th>
);

const tdStyle = {
  padding: "7px 14px",
  fontSize: 13,
  color: C.valueText,
  textAlign: "center",
  borderBottom: `1px solid ${C.cardBorder}`,
  borderRight: `1px solid ${C.cardBorder}`,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const TD = ({ children, align = "center", mono, style: extra, bg }) => (
  <td
    style={{
      ...tdStyle,
      textAlign: align,
      fontFamily: mono ? "monospace" : "inherit",
      fontWeight: 400,
      ...(bg != null ? { background: bg } : {}),
      ...extra,
    }}
  >
    {children || <span style={{ color: C.mutedText }}>—</span>}
  </td>
);

const PbxMonitor = () => {
  const [activeTab, setActiveTab] = useState("extension");
  const [hasLoaded, setHasLoaded] = useState(false);
  const [extensionRows, setExtensionRows] = useState([]);
  const [trunkRows, setTrunkRows] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const silentRefreshRef = useRef(false);

  const normalizeStatus = (v) =>
    (v == null ? "" : String(v)).toLowerCase().trim();

  const loadData = useCallback(async (silent = false) => {
    if (silent) {
      if (silentRefreshRef.current) return;
      silentRefreshRef.current = true;
    } else {
      setIsRefreshing(true);
    }

    try {
      const res = await monitorBoth();

      const msg = res?.message ?? {};

      setExtensionRows(msg?.extensions ?? []);
      setTrunkRows(msg?.trunks ?? []);

      setLastUpdated(new Date());
      setHasLoaded(true);
    } catch {
      if (!silent) {
        setExtensionRows([]);
        setTrunkRows([]);
      }
    } finally {
      if (silent) {
        silentRefreshRef.current = false;
      }
    }
  }, []);

  useEffect(() => {
    loadData(false);

    const interval = setInterval(() => loadData(true), 30000);

    return () => clearInterval(interval);
  }, [loadData]);

  const getStatus = (status) => {
    const s = normalizeStatus(status);

    if (s === "registered") return { text: "Registered", tone: "ok" };

    if (s === "unregistered") return { text: "Unregistered", tone: "bad" };

    return { text: "Unknown", tone: "neutral" };
  };

  const extRegistered = extensionRows.filter(
    (r) => normalizeStatus(r.status) === "registered",
  ).length;

  const extUnregistered = extensionRows.length - extRegistered;

  const trkRegistered = trunkRows.filter(
    (r) => normalizeStatus(r.status) === "registered",
  ).length;

  const filteredExtensions = extensionRows.filter(
    (r) =>
      !searchQuery ||
      String(r.extension).includes(searchQuery) ||
      (r.name || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredTrunks = trunkRows.filter(
    (r) =>
      !searchQuery ||
      (r.trunk_name || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div
      style={{
        background: C.pageBg,
        minHeight: "calc(100vh - 80px)",
        padding: 16,
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: "100%", margin: "0 auto" }}>
        {/* Breadcrumb */}
        <div
          style={{
            fontSize: 12,
            color: C.mutedText,
            marginBottom: 16,
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
          <span style={{ color: C.strongText, fontWeight: 600 }}>
            PBX Monitor
          </span>
        </div>

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
            ready={hasLoaded}
          />

          <StatCard
            label="Registered"
            value={extRegistered}
            accent={C.successGreen}
            ready={hasLoaded}
          />

          <StatCard
            label="Unregistered"
            value={extUnregistered}
            accent={C.errorRed}
            ready={hasLoaded}
          />

          <StatCard
            label="Registered Trunks"
            value={trkRegistered}
            accent={C.purple}
            ready={hasLoaded}
          />
        </div>

        {/* Main Card */}
        <div
          style={{
            background: C.cardBg,
            border: `1.5px solid ${C.cardBorder}`,
            borderRadius: 10,
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
          }}
        >
          {/* Toolbar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              minHeight: 44,
              padding: "7px 14px",
              borderBottom: `1px solid ${C.cardBorder}`,
              background: "#ffffff",
              flexWrap: "wrap",
              gap: 12,
              borderTopLeftRadius: CARD_RADIUS,
              borderTopRightRadius: CARD_RADIUS,
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
                    color: activeTab === tab ? C.accent : C.labelText,
                    background: activeTab === tab ? "#eff6ff" : "#f1f5f9",
                    border:
                      activeTab === tab
                        ? `1px solid ${C.accent}`
                        : `1px solid ${C.cardBorder}`,
                    borderRadius: 999,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    whiteSpace: "nowrap",
                  }}
                >
                  {tab === "extension" ? "Extensions" : "Trunks"}
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
                  gap: 6,
                  height: 30,
                  boxSizing: "border-box",
                  background: "#ffffff",
                  border: `1px solid ${searchFocused ? C.accent : C.cardBorder}`,
                  borderRadius: 10,
                  padding: "0 10px",
                  transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                  boxShadow: searchFocused
                    ? "0 0 0 4px rgba(62, 84, 117, 0.08)"
                    : "none",
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search..."
                  style={{
                    border: "none",
                    background: "transparent",
                    outline: "none",
                    width: 140,
                    minWidth: 100,
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

            <Btn
              variant="cancel"
              onClick={() => loadData(false)}
              disabled={isRefreshing}
              style={{ height: 30 }}
            >
              {isRefreshing ? (
                <>
                  <CircularProgress size={14} sx={{ color: "inherit" }} />
                  Refreshing...
                </>
              ) : (
                "Refresh"
              )}
            </Btn>
            </div>
          </div>

          {/* Table */}
          <div style={tableWrapStyle}>
            {activeTab === "extension" ? (
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <TH>Status</TH>
                    <TH align="center">Extension</TH>
                    <TH align="left">Name</TH>
                    <TH align="center">Type</TH>
                    <TH style={{ borderRight: "none" }}>IP & Port</TH>
                  </tr>
                </thead>

                <tbody>
                  {filteredExtensions.map((row, idx) => {
                    const status = getStatus(row.status);
                    const rowBg = idx % 2 === 1 ? "#f8fafc" : "#ffffff";
                    const isLastRow = idx === filteredExtensions.length - 1;
                    const lastRowCellStyle = isLastRow
                      ? { borderBottom: "none" }
                      : {};

                    return (
                      <tr
                        key={row.extension}
                        style={{
                          background: rowBg,
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#f1f5f9";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = rowBg;
                        }}
                      >
                        <TD align="center" bg={rowBg} style={lastRowCellStyle}>
                          <StatusBadge tone={status.tone} text={status.text} />
                        </TD>

                        <TD align="center" bg={rowBg} style={lastRowCellStyle}>
                          {row.extension}
                        </TD>

                        <TD align="left" bg={rowBg} style={lastRowCellStyle}>
                          {row.name}
                        </TD>

                        <TD align="center" bg={rowBg} style={lastRowCellStyle}>
                          <TypePill text="SIP" />
                        </TD>

                        <TD
                          mono
                          bg={rowBg}
                          style={{ ...lastRowCellStyle, borderRight: "none" }}
                        >
                          {row.ip_port}
                        </TD>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <TH>Status</TH>
                    <TH align="left">Trunk Name</TH>
                    <TH align="center">Type</TH>
                    <TH style={{ borderRight: "none" }}>Host</TH>
                  </tr>
                </thead>

                <tbody>
                  {filteredTrunks.map((row, idx) => {
                    const status = getStatus(row.status);
                    const rowBg = idx % 2 === 1 ? "#f8fafc" : "#ffffff";
                    const isLastRow = idx === filteredTrunks.length - 1;
                    const lastRowCellStyle = isLastRow
                      ? { borderBottom: "none" }
                      : {};

                    return (
                      <tr
                        key={row.id}
                        style={{
                          background: rowBg,
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#f1f5f9";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = rowBg;
                        }}
                      >
                        <TD align="center" bg={rowBg} style={lastRowCellStyle}>
                          <StatusBadge tone={status.tone} text={status.text} />
                        </TD>

                        <TD align="left" bg={rowBg} style={lastRowCellStyle}>
                          {row.trunk_name}
                        </TD>

                        <TD align="center" bg={rowBg} style={lastRowCellStyle}>
                          <TypePill text={row.type || "SIP"} />
                        </TD>

                        <TD
                          mono
                          bg={rowBg}
                          style={{ ...lastRowCellStyle, borderRight: "none" }}
                        >
                          {row.host_ip_port}
                        </TD>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PbxMonitor;
