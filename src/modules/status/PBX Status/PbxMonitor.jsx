import React, { useEffect, useState, useCallback, useRef } from "react";
import { CircularProgress, Tabs, Tab } from "@mui/material";
import { monitorBoth } from "../../../api/apiService";
import {
  C,
  Btn,
  PageBreadcrumb,
  pbxPageWrapStyle,
  pbxPageInnerStyle,
  TableListLoading,
  TableListEmptyState,
  PBX_MODAL_TAB_ACTIVE_COLOR,
  pbxHeaderTabsSx,
  PbxToolbarSearchBar,
} from "../../../shared/statusSharedUi";
import {
  sipPcmFormCardStyle,
  sipPcmFormHeaderStyle,
  sipPcmToolbarStyle,
  sipPcmCancelBtnStyle,
  sipPcmAuthFormBtnStyle,
} from "../../../shared/statusSharedUi";

const successGreen = "#16A34A";
const errorRed = "#DC2626";
const purple = "#8b5cf6";

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
      color: successGreen,
      dot: successGreen,
    },
    bad: {
      // bg: "#fee2e2",
      color: errorRed,
      dot: errorRed,
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
      } else {
        setIsRefreshing(false);
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

  const tableRows =
    activeTab === "extension" ? filteredExtensions : filteredTrunks;
  const emptyMessage =
    activeTab === "extension"
      ? "No extensions found."
      : "No trunks found.";

  return (
    <div style={pbxPageWrapStyle}>
      <div style={pbxPageInnerStyle}>
        <PageBreadcrumb segments={["Status", "PBX Status", "PBX Monitor"]} />

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
            accent={successGreen}
            ready={hasLoaded}
          />

          <StatCard
            label="Unregistered"
            value={extUnregistered}
            accent={errorRed}
            ready={hasLoaded}
          />

          <StatCard
            label="Registered Trunks"
            value={trkRegistered}
            accent={purple}
            ready={hasLoaded}
          />
        </div>

        <div style={sipPcmFormCardStyle}>
          <div style={{ ...sipPcmFormHeaderStyle, padding: "0 8px 0 6px" }}>
            <Tabs
              value={activeTab}
              onChange={(_, tab) => setActiveTab(tab)}
              variant="standard"
              TabIndicatorProps={{
                style: {
                  backgroundColor: PBX_MODAL_TAB_ACTIVE_COLOR,
                  height: 2,
                },
              }}
              sx={pbxHeaderTabsSx}
            >
              <Tab label="EXTENSIONS" value="extension" />
              <Tab label="TRUNKS" value="trunk" />
            </Tabs>
          </div>

          <div
            style={{
              ...sipPcmToolbarStyle,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              justifyContent: "flex-end",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <PbxToolbarSearchBar
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
              />

            <Btn
              variant="cancel"
              onClick={() => loadData(false)}
              disabled={isRefreshing}
              style={{ ...sipPcmAuthFormBtnStyle, ...sipPcmCancelBtnStyle, boxShadow: "none" }}
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

          {!hasLoaded && isRefreshing ? (
            <TableListLoading />
          ) : hasLoaded && tableRows.length === 0 ? (
            <TableListEmptyState message={emptyMessage} showButton={false} />
          ) : (
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
                          e.currentTarget.style.background = "#f8fafc";
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
                          e.currentTarget.style.background = "#f8fafc";
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
          )}
        </div>
      </div>
    </div>
  );
};

export default PbxMonitor;
