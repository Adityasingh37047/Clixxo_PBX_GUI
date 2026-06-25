import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
} from "react";
import {
  fetchCallQueueActivity,
  fetchCallQueueAgentStats,
  fetchCallQueueQueueStats,
} from "../../../api/apiService";
import { CircularProgress, Tabs, Tab, useMediaQuery } from "@mui/material";

// ── Color Palette ─────────────────────────────────────────────────────────────
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#9CA3AF",
  labelText: "#3E5475",
  valueText: "#0f172a",
  mutedText: "#94a3b8",
  strongText: "#0f172a",
  accent: "#3E5475",
  amber: "#dc2626",
};

// ── Local page UI (inlined from statusSharedUi) ───────────────────────────────
const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
  form,
  component,
  title,
}) => {
  const styles = {
    default: {
      background: C.cardBg,
      color: C.valueText,
      border: "1px solid #9ca3af",
    },
    primary: {
      background:
        "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
      color: "#fff",
      border: "1px solid #5A6F8F",
      fontWeight: 600,
      fontSize: 15,
      textTransform: "none",
      padding: "6px 28px",
    },
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15,23,42,0.08)",
    },
    danger: {
      background: "#fef2f2",
      color: C.amber,
      border: "0.5px solid #fecaca",
    },
    outline: {
      background: C.cardBg,
      color: C.labelText,
      border: `1px solid ${C.cardBorder}`,
    },
  };
  const s = styles[variant] || styles.default;
  const hoverBg =
    {
      primary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      cancel: "#b6c2d3",
      danger: "#fca5a5",
      outline: "#e2e8f0",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const baseBg = extraStyle?.background ?? s.background;
  const Component = component || "button";
  return (
    <Component
      type={type}
      form={form}
      title={title}
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
    </Component>
  );
};

const PageBreadcrumb = ({ segments, style }) => (
  <div
    style={{
      fontSize: 12,
      color: "#94a3b8",
      marginBottom: 16,
      fontWeight: 400,
      display: "flex",
      alignItems: "center",
      gap: 4,
      flexWrap: "wrap",
      ...style,
    }}
  >
    {segments.map((label, index) => (
      <React.Fragment key={`${label}-${index}`}>
        {index > 0 ? <span>&gt;</span> : null}
        <span
          style={
            index === segments.length - 1
              ? { color: "#1e293b", fontWeight: 600 }
              : undefined
          }
        >
          {label}
        </span>
      </React.Fragment>
    ))}
  </div>
);
const pbxPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const pbxPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const TableListLoading = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: 48,
    }}
  >
    <CircularProgress size={28} style={{ color: C.accent }} />
  </div>
);

const TableListEmptyState = ({
  message,
  onAddNew,
  buttonLabel = "+ Add New",
  showButton = true,
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 240,
      padding: 24,
      textAlign: "center",
    }}
  >
    <div
      style={{
        color: "#3E5475",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: showButton && onAddNew ? 16 : 0,
      }}
    >
      {message}
    </div>
    {showButton && onAddNew ? (
      <Btn
        variant="cancel"
        onClick={onAddNew}
        style={{ padding: "8px 24px", fontSize: 12, borderRadius: 6 }}
      >
        {buttonLabel}
      </Btn>
    ) : null}
  </div>
);

const PBX_MODAL_TAB_ACTIVE_COLOR = "#3E5475";
const PBX_MODAL_TAB_INACTIVE_COLOR = "#374151";

const pbxHeaderTabsSx = {
  minHeight: 44,
  pl: 0,
  "& .MuiTabs-flexContainer": { height: 44, paddingLeft: 0 },
  "& .MuiTab-root": {
    color: PBX_MODAL_TAB_INACTIVE_COLOR,
    fontSize: 12,
    fontWeight: 500,
    textTransform: "none",
    minHeight: 44,
    py: 0,
    px: 1.25,
    minWidth: 0,
  },
  "& .MuiTab-root.Mui-selected": {
    color: PBX_MODAL_TAB_ACTIVE_COLOR,
    fontWeight: 700,
  },
};

const OUTLINED_BORDER = "rgba(0, 0, 0, 0.23)";
const OUTLINED_HOVER = "rgba(0, 0, 0, 0.87)";
const OUTLINED_FOCUS = "#1976d2";
const PBX_TOOLBAR_SEARCH_HEIGHT = 30;
const PBX_TOOLBAR_SEARCH_WIDTH = 168;
const PBX_SEARCH_ICON_SLOT = 18;
const PBX_SEARCH_BAR_PADDING_FIT = 16;
const PBX_SEARCH_BAR_PADDING_DEFAULT = 20;
const PBX_TOOLBAR_SEARCH_FOCUS_RING = `0 0 0 1px ${OUTLINED_FOCUS}`;
const PBX_TOOLBAR_SEARCH_INPUT_FONT = {
  fontSize: 12,
  fontFamily: "Inter, sans-serif",
  letterSpacing: "normal",
  fontWeight: 400,
};

const PbxToolbarSearchBar = ({
  value,
  onChange,
  placeholder = "Search...",
  width = PBX_TOOLBAR_SEARCH_WIDTH,
  fitPlaceholder = false,
}) => {
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const measureRef = useRef(null);
  const [placeholderWidth, setPlaceholderWidth] = useState(null);

  useLayoutEffect(() => {
    if (!fitPlaceholder || !measureRef.current) return;
    measureRef.current.textContent = placeholder;
    setPlaceholderWidth(measureRef.current.offsetWidth);
  }, [fitPlaceholder, placeholder]);

  const resolvedWidth =
    fitPlaceholder && placeholderWidth != null
      ? placeholderWidth + PBX_SEARCH_BAR_PADDING_FIT + PBX_SEARCH_ICON_SLOT
      : width;

  const horizontalPadding = fitPlaceholder
    ? PBX_SEARCH_BAR_PADDING_FIT / 2
    : PBX_SEARCH_BAR_PADDING_DEFAULT / 2;

  const setDefault = () => {
    const el = wrapRef.current;
    if (!el) return;
    el.style.borderColor = OUTLINED_BORDER;
    el.style.boxShadow = "none";
  };

  const setHover = () => {
    const el = wrapRef.current;
    if (!el || document.activeElement === inputRef.current) return;
    el.style.borderColor = OUTLINED_HOVER;
    el.style.boxShadow = "none";
  };

  const setFocus = () => {
    const el = wrapRef.current;
    if (!el) return;
    el.style.borderColor = OUTLINED_FOCUS;
    el.style.boxShadow = PBX_TOOLBAR_SEARCH_FOCUS_RING;
  };

  const handleMouseLeave = () => {
    if (document.activeElement === inputRef.current) setFocus();
    else setDefault();
  };

  return (
    <div
      ref={wrapRef}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        height: PBX_TOOLBAR_SEARCH_HEIGHT,
        boxSizing: "border-box",
        background: "#ffffff",
        border: `1px solid ${OUTLINED_BORDER}`,
        borderRadius: 10,
        padding: `0 ${horizontalPadding}px`,
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        width: resolvedWidth,
        minWidth: resolvedWidth,
        maxWidth: resolvedWidth,
        flexShrink: 0,
        position: "relative",
        fontWeight: 400,
      }}
      onMouseEnter={setHover}
      onMouseLeave={handleMouseLeave}
    >
      {fitPlaceholder ? (
        <span
          ref={measureRef}
          aria-hidden
          style={{
            position: "absolute",
            visibility: "hidden",
            whiteSpace: "pre",
            pointerEvents: "none",
            ...PBX_TOOLBAR_SEARCH_INPUT_FONT,
          }}
        />
      ) : null}
      <span style={{ fontSize: 12, color: C.mutedText, flexShrink: 0 }}>
        🔍
      </span>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={onChange}
        onFocus={setFocus}
        onBlur={setDefault}
        placeholder={placeholder}
        style={{
          border: "none",
          background: "transparent",
          outline: "none",
          flex: 1,
          minWidth: 0,
          width: 0,
          padding: 0,
          paddingRight: value ? 14 : 0,
          margin: 0,
          ...PBX_TOOLBAR_SEARCH_INPUT_FONT,
          color: C.valueText,
        }}
      />
      <span
        role="button"
        tabIndex={value ? 0 : -1}
        aria-hidden={!value}
        onClick={() => {
          if (!value) return;
          onChange({ target: { value: "" } });
        }}
        onKeyDown={(e) => {
          if (!value) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onChange({ target: { value: "" } });
          }
        }}
        style={{
          position: "absolute",
          right: horizontalPadding,
          top: "50%",
          transform: "translateY(-50%)",
          fontSize: 11,
          color: C.mutedText,
          cursor: value ? "pointer" : "default",
          visibility: value ? "visible" : "hidden",
          lineHeight: 1,
        }}
      >
        ✕
      </span>
    </div>
  );
};

const SIP_PCM_TABLE_CARD_RADIUS = 10;
const SIP_PCM_FORM_HEADER_RADIUS = 20;

const sipPcmCardStyle = {
  background: "#ffffff",
  borderRadius: SIP_PCM_TABLE_CARD_RADIUS,
  overflow: "hidden",
  border: `1.5px solid ${C.cardBorder}`,
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
};

const sipPcmFormCardStyle = {
  background: "#ffffff",
  borderRadius: SIP_PCM_TABLE_CARD_RADIUS,
  overflow: "hidden",
  border: `1.5px solid ${C.cardBorder}`,
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
};

const sipPcmFormHeaderStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: SIP_PCM_FORM_HEADER_RADIUS,
  borderTopRightRadius: SIP_PCM_FORM_HEADER_RADIUS,
  display: "flex",
  alignItems: "center",
  padding: "7px 14px",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  borderBottom: `1px solid ${C.cardBorder}`,
};

const sipPcmToolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.cardBorder}`,
  background: "#ffffff",
  flexWrap: "wrap",
  gap: 12,
  borderTopLeftRadius: SIP_PCM_TABLE_CARD_RADIUS,
  borderTopRightRadius: SIP_PCM_TABLE_CARD_RADIUS,
};

const sipPcmCancelBtnStyle = {
  height: 30,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const sipPcmPrimaryBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
};

const sipPcmAuthFormBtnStyle = {
  minWidth: 110,
  height: 34,
  fontSize: 13,
  margin: 0,
  padding: "0 28px",
  lineHeight: "34px",
  boxSizing: "border-box",
};

const statsToolbarBtnStyle = {
  ...sipPcmAuthFormBtnStyle,
  ...sipPcmCancelBtnStyle,
  boxShadow: "none",
};

const POLL_INTERVAL = 5000;

const CARD_RADIUS = 10;
const successGreen = "#16a34a";
const cardHeader = "#1e2d42";
const teal = "#0e7490";

const statsFooterStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.cardBorder}`,
  borderBottomLeftRadius: SIP_PCM_TABLE_CARD_RADIUS,
  borderBottomRightRadius: SIP_PCM_TABLE_CARD_RADIUS,
};

// ── Shared: Answered rate progress bar ───────────────────────────────────────
const AnsweredRateBar = ({ rate }) => (
  <div
    style={{
      width: "100%",
      background: "#e2e8f0",
      borderRadius: 3,
      height: 6,
      overflow: "hidden",
    }}
  >
    <div
      style={{
        width: `${Math.min(Number(rate) || 0, 100)}%`,
        background: successGreen,
        height: "100%",
        borderRadius: 3,
        transition: "width 0.3s ease",
      }}
    />
  </div>
);

// ── Shared: Stat card ─────────────────────────────────────────────────────────
const StatCard = ({ label, value, color }) => (
  <div
    style={{
      background: C.cardBg,
      border: `1px solid ${C.cardBorder}`,
      borderRadius: CARD_RADIUS,
      padding: "14px 16px",
      textAlign: "center",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}
  >
    <div
      style={{
        fontSize: 22,
        fontWeight: 700,
        color: color || C.accent,
        marginBottom: 4,
      }}
    >
      {value ?? 0}
    </div>
    <div style={{ fontSize: 11, color: C.labelText, fontWeight: 500 }}>
      {label}
    </div>
  </div>
);

// ── Shared: TH ───────────────────────────────────────────────────────────────
const TH = ({ children, align = "center", style: extra }) => (
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
      textTransform: "uppercase",
      letterSpacing: "0.14em",
      ...extra,
    }}
  >
    {children}
  </th>
);

const tdStyle = {
  padding: "7px 14px",
  fontSize: 13,
  textAlign: "center",
  borderBottom: `1px solid ${C.cardBorder}`,
  borderRight: `1px solid ${C.cardBorder}`,
  whiteSpace: "nowrap",
};

// ── Shared: TD ───────────────────────────────────────────────────────────────
const TD = ({ children, align = "center", mono, muted, bg, style: extra }) => (
  <td
    style={{
      ...tdStyle,
      color: mono ? C.accent : muted ? C.mutedText : C.valueText,
      textAlign: align,
      fontFamily: mono ? "monospace, monospace" : "inherit",
      fontWeight: mono ? 600 : 400,
      ...(bg != null ? { background: bg } : {}),
      ...extra,
    }}
  >
    {children ?? <span style={{ color: C.mutedText }}>—</span>}
  </td>
);

const tableStyle = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: 0,
};

const statsTableWrapStyle = {
  width: "100%",
  maxWidth: "100%",
  overflowX: "hidden",
};

const statsTableStyle = {
  width: "100%",
  maxWidth: "100%",
  borderCollapse: "separate",
  borderSpacing: 0,
  tableLayout: "fixed",
};

/** Statistics headings: wrap inside column, centered with side spacing */
const statsThStyle = {
  textAlign: "center",
  boxSizing: "border-box",
  verticalAlign: "middle",
  whiteSpace: "normal",
  wordBreak: "break-word",
  overflowWrap: "break-word",
  padding: "8px 5px",
  lineHeight: 1.35,
  letterSpacing: "0.06em",
};

const statsTdWrapStyle = {
  textAlign: "center",
  whiteSpace: "normal",
  wordBreak: "break-word",
  overflow: "hidden",
  boxSizing: "border-box",
  verticalAlign: "middle",
};

const StatsTH = ({ children, style: extra }) => (
  <TH align="center" style={{ ...statsThStyle, ...extra }}>
    {children}
  </TH>
);

const StatsTD = ({ children, bg, mono, muted, style: extra }) => (
  <TD
    align="center"
    bg={bg}
    mono={mono}
    muted={muted}
    style={{ ...statsTdWrapStyle, ...extra }}
  >
    <div style={{ width: "100%", textAlign: "center" }}>
      {children != null && children !== "" ? (
        children
      ) : (
        <span style={{ color: C.mutedText }}>—</span>
      )}
    </div>
  </TD>
);

const AGENT_STATS_COL_WIDTHS = [
  "8%",
  "9%",
  "9%",
  "9%",
  "8%",
  "12%",
  "16%",
  "11%",
  "9%",
  "10%",
];

const QUEUE_STATS_COL_WIDTHS = [
  "8%",
  "11%",
  "9%",
  "8%",
  "12%",
  "11%",
  "11%",
  "12%",
  "12%",
  "15%",
];

const StatsColGroup = ({ widths }) => (
  <colgroup>
    {widths.map((width, index) => (
      <col key={index} style={{ width }} />
    ))}
  </colgroup>
);

// ── Shared: Rate pill ─────────────────────────────────────────────────────────
const RatePill = ({ value }) => (
  <span
    style={{
      background: Number(value) > 0 ? "#dcfce7" : "#f1f5f9",
      color: Number(value) > 0 ? successGreen : C.labelText,
      padding: "2px 9px",
      borderRadius: 10,
      fontSize: 10.5,
      fontWeight: 600,
    }}
  >
    {value ?? "0"}%
  </span>
);

// ── Loading / Empty states ───────────────────────────────────────────────────
const LoadingRow = ({ cols }) => (
  <tr>
    <td
      colSpan={cols}
      style={{
        textAlign: "center",
        padding: 32,
        color: C.mutedText,
        fontSize: 13,
      }}
    >
      <CircularProgress size={20} style={{ color: C.accent }} />
    </td>
  </tr>
);

const EmptyRow = ({ cols, msg = "No data available" }) => (
  <tr>
    <td
      colSpan={cols}
      style={{
        textAlign: "center",
        padding: "32px 0",
        color: C.mutedText,
        fontSize: 13,
      }}
    >
      {msg}
    </td>
  </tr>
);

// ═══════════════════════════════════════════════════════════════════════════
// CALL QUEUE STATISTICS VIEW
// ═══════════════════════════════════════════════════════════════════════════
const STATS_COMPACT_MQ = "(max-width: 768px)";
const STATS_TABLE_MIN_WIDTH = 900;

const CallQueueStatistics = ({ onBack, initialQueue }) => {
  const isCompact = useMediaQuery(STATS_COMPACT_MQ);
  const [activeTab, setActiveTab] = useState("agent");
  const [agentSearch, setAgentSearch] = useState("");
  const [agentData, setAgentData] = useState([]);
  const [queueData, setQueueData] = useState([]);
  const [loadingAgent, setLoadingAgent] = useState(false);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const pollRef = useRef(null);

  const selectedQueue = initialQueue || "";

  const loadAgentStats = useCallback(async () => {
    if (!selectedQueue) return;
    try {
      const data = await fetchCallQueueAgentStats(selectedQueue);
      setAgentData(Array.isArray(data) ? data : []);
      setLastUpdated(new Date());
    } catch {
      /* silently keep last data */
    }
  }, [selectedQueue]);

  const loadQueueStats = useCallback(async () => {
    if (!selectedQueue) return;
    try {
      const data = await fetchCallQueueQueueStats(selectedQueue);
      setQueueData(Array.isArray(data) ? data : []);
      setLastUpdated(new Date());
    } catch {
      /* silently keep last data */
    }
  }, [selectedQueue]);

  // Initial load
  useEffect(() => {
    if (!selectedQueue) return;
    const load = async () => {
      setLoadingAgent(true);
      setLoadingQueue(true);
      try {
        const d = await fetchCallQueueAgentStats(selectedQueue);
        setAgentData(Array.isArray(d) ? d : []);
      } catch {
        /**/
      } finally {
        setLoadingAgent(false);
      }
      try {
        const d = await fetchCallQueueQueueStats(selectedQueue);
        setQueueData(Array.isArray(d) ? d : []);
      } catch {
        /**/
      } finally {
        setLoadingQueue(false);
      }
      setLastUpdated(new Date());
    };
    load();
  }, [selectedQueue]);

  // Poll on active tab
  useEffect(() => {
    clearInterval(pollRef.current);
    if (activeTab === "agent") {
      pollRef.current = setInterval(loadAgentStats, POLL_INTERVAL);
    } else {
      pollRef.current = setInterval(loadQueueStats, POLL_INTERVAL);
    }
    return () => clearInterval(pollRef.current);
  }, [activeTab, loadAgentStats, loadQueueStats]);

  // Reset search on tab change
  useEffect(() => {
    setAgentSearch("");
  }, [activeTab]);

  const filteredAgents = agentSearch.trim()
    ? agentData.filter(
        (r) =>
          String(r.agent_number ?? r.agentNumber ?? "").includes(
            agentSearch.trim(),
          ) ||
          String(r.agent_name ?? r.agentName ?? "")
            .toLowerCase()
            .includes(agentSearch.toLowerCase()),
      )
    : agentData;

  return (
    <div style={{ ...pbxPageWrapStyle, ...(isCompact ? { padding: 8 } : {}) }}>
      <div style={pbxPageInnerStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 16,
            flexWrap: "wrap",
            ...(isCompact
              ? { flexDirection: "column", alignItems: "flex-start", gap: 6 }
              : {}),
          }}
        >
          <PageBreadcrumb
            segments={[
              "Status",
              "PBX Status",
              "Active Call Queue",
              "Call Queue Statistics",
            ]}
            style={{ marginBottom: 0 }}
          />
          {lastUpdated && (
            <span
              style={{
                fontSize: 11,
                color: C.mutedText,
                flexShrink: 0,
                ...(isCompact ? { marginLeft: 0 } : { marginLeft: "auto" }),
              }}
            >
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>

        <div style={sipPcmFormCardStyle}>
          <div
            style={{
              ...sipPcmFormHeaderStyle,
              padding: "0 8px 0 6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
              ...(isCompact
                ? { flexDirection: "column", alignItems: "stretch" }
                : {}),
            }}
          >
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
              sx={{
                flex: 1,
                minWidth: 0,
                width: isCompact ? "100%" : undefined,
                ...pbxHeaderTabsSx,
              }}
            >
              <Tab label="AGENT STATISTICS" value="agent" />
              <Tab label="QUEUE STATISTICS" value="queue" />
            </Tabs>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexShrink: 0,
                flexWrap: "wrap",
                marginLeft: "auto",
                ...(isCompact
                  ? {
                      width: "100%",
                      marginLeft: 0,
                      justifyContent: "flex-end",
                    }
                  : {}),
              }}
            >
              {activeTab === "agent" && (
                <PbxToolbarSearchBar
                  value={agentSearch}
                  onChange={(e) => setAgentSearch(e.target.value)}
                  placeholder="Search agent number, name..."
                  fitPlaceholder
                />
              )}
              <Btn
                variant="cancel"
                onClick={() => {
                  setAgentData([]);
                  setQueueData([]);
                }}
                style={statsToolbarBtnStyle}
              >
                Clear
              </Btn>
              <Btn
                variant="cancel"
                onClick={onBack}
                style={statsToolbarBtnStyle}
              >
                ← Back
              </Btn>
            </div>
          </div>

          {/* ── AGENT STATISTICS TAB ── */}
          {activeTab === "agent" && (
            <>
              {/* Agent table */}
              <div
                style={{
                  ...statsTableWrapStyle,
                  ...(isCompact
                    ? {
                        overflowX: "auto",
                        WebkitOverflowScrolling: "touch",
                      }
                    : {}),
                }}
              >
                <table
                  style={{
                    ...statsTableStyle,
                    ...(isCompact
                      ? {
                          minWidth: STATS_TABLE_MIN_WIDTH,
                          tableLayout: "auto",
                        }
                      : {}),
                  }}
                >
                  <StatsColGroup widths={AGENT_STATS_COL_WIDTHS} />
                  <thead>
                    <tr>
                      <StatsTH>Agent No.</StatsTH>
                      <StatsTH>Agent Name</StatsTH>
                      <StatsTH>Online Time</StatsTH>
                      <StatsTH>Total Calls</StatsTH>
                      <StatsTH>Answered</StatsTH>
                      <StatsTH>Answered Rate</StatsTH>
                      <StatsTH>Caller Hangup (Ring)</StatsTH>
                      <StatsTH>Avg Talk Time</StatsTH>
                      <StatsTH>Idle Time</StatsTH>
                      <StatsTH style={{ borderRight: "none" }}>
                        Avg Idle Time
                      </StatsTH>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingAgent && agentData.length === 0 ? (
                      <LoadingRow cols={10} />
                    ) : filteredAgents.length === 0 ? (
                      <EmptyRow
                        cols={10}
                        msg={
                          agentSearch
                            ? `No results for "${agentSearch}"`
                            : "No agent data available"
                        }
                      />
                    ) : (
                      filteredAgents.map((row, i) => {
                        const rowBg = i % 2 === 1 ? "#f8fafc" : "#ffffff";
                        const isLastRow = i === filteredAgents.length - 1;
                        const lastRowCellStyle = isLastRow
                          ? { borderBottom: "none" }
                          : {};

                        return (
                          <tr
                            key={i}
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
                            <StatsTD bg={rowBg} style={lastRowCellStyle}>
                              <strong style={{ color: C.valueText }}>
                                {row.agent_number ?? row.agentNumber ?? "—"}
                              </strong>
                            </StatsTD>
                            <StatsTD bg={rowBg} style={lastRowCellStyle}>
                              {row.agent_name ?? row.agentName ?? null}
                            </StatsTD>
                            <StatsTD mono bg={rowBg} style={lastRowCellStyle}>
                              {row.online_time ?? row.onlineTime ?? null}
                            </StatsTD>
                            <StatsTD bg={rowBg} style={lastRowCellStyle}>
                              {row.total_calls ?? row.totalCalls ?? 0}
                            </StatsTD>
                            <StatsTD bg={rowBg} style={lastRowCellStyle}>
                              {row.answered_calls ?? row.answeredCalls ?? 0}
                            </StatsTD>
                            <StatsTD bg={rowBg} style={lastRowCellStyle}>
                              <RatePill
                                value={
                                  row.answered_rate ?? row.answeredRate ?? 0
                                }
                              />
                            </StatsTD>
                            <StatsTD bg={rowBg} style={lastRowCellStyle}>
                              {row.caller_hangup_while_agent_ring ??
                                row.callerHangup ??
                                0}
                            </StatsTD>
                            <StatsTD mono bg={rowBg} style={lastRowCellStyle}>
                              {row.avg_talk_time ?? row.averageTalkTime ?? null}
                            </StatsTD>
                            <StatsTD bg={rowBg} style={lastRowCellStyle}>
                              {row.idle_time ?? row.idleTime ?? null}
                            </StatsTD>
                            <StatsTD
                              bg={rowBg}
                              style={{
                                ...lastRowCellStyle,
                                borderRight: "none",
                              }}
                            >
                              {row.avg_idle_time ?? row.averageIdleTime ?? null}
                            </StatsTD>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {agentData.length > 0 && (
                <div style={statsFooterStyle}>
                  <span style={{ fontSize: 11, color: C.mutedText }}>
                    Showing {filteredAgents.length} Agent
                    {filteredAgents.length !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </>
          )}

          {/* ── QUEUE STATISTICS TAB ── */}
          {activeTab === "queue" && (
            <>
              {/* Queue table */}
              <div
                style={{
                  ...statsTableWrapStyle,
                  ...(isCompact
                    ? {
                        overflowX: "auto",
                        WebkitOverflowScrolling: "touch",
                      }
                    : {}),
                }}
              >
                <table
                  style={{
                    ...statsTableStyle,
                    ...(isCompact
                      ? {
                          minWidth: STATS_TABLE_MIN_WIDTH,
                          tableLayout: "auto",
                        }
                      : {}),
                  }}
                >
                  <StatsColGroup widths={QUEUE_STATS_COL_WIDTHS} />
                  <thead>
                    <tr>
                      <StatsTH>Queue No.</StatsTH>
                      <StatsTH>Queue Name</StatsTH>
                      <StatsTH>Total Calls</StatsTH>
                      <StatsTH>Answered</StatsTH>
                      <StatsTH>Answered Rate</StatsTH>
                      <StatsTH>Avg Wait Time</StatsTH>
                      <StatsTH>Avg Talk Time</StatsTH>
                      <StatsTH>Caller Hangup</StatsTH>
                      <StatsTH>Timeout Calls</StatsTH>
                      <StatsTH style={{ borderRight: "none" }}>
                        Callback Calls
                      </StatsTH>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingQueue && queueData.length === 0 ? (
                      <LoadingRow cols={10} />
                    ) : queueData.length === 0 ? (
                      <EmptyRow cols={10} msg="No queue data available" />
                    ) : (
                      queueData.map((row, i) => {
                        const rowBg = i % 2 === 1 ? "#f8fafc" : "#ffffff";
                        const isLastRow = i === queueData.length - 1;
                        const lastRowCellStyle = isLastRow
                          ? { borderBottom: "none" }
                          : {};

                        return (
                          <tr
                            key={i}
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
                            <StatsTD bg={rowBg} style={lastRowCellStyle}>
                              <strong style={{ color: C.valueText }}>
                                {row.queue_number ?? row.queueNumber ?? "—"}
                              </strong>
                            </StatsTD>
                            <StatsTD bg={rowBg} style={lastRowCellStyle}>
                              {row.queue_name ?? row.queueName ?? null}
                            </StatsTD>
                            <StatsTD bg={rowBg} style={lastRowCellStyle}>
                              {row.total_calls ?? row.totalCalls ?? 0}
                            </StatsTD>
                            <StatsTD bg={rowBg} style={lastRowCellStyle}>
                              {row.answered_calls ?? row.answeredCalls ?? 0}
                            </StatsTD>
                            <StatsTD bg={rowBg} style={lastRowCellStyle}>
                              <RatePill
                                value={
                                  row.answered_rate ?? row.answeredRate ?? 0
                                }
                              />
                            </StatsTD>
                            <StatsTD mono bg={rowBg} style={lastRowCellStyle}>
                              {row.average_wait_time ?? row.avgWaitTime ?? null}
                            </StatsTD>
                            <StatsTD mono bg={rowBg} style={lastRowCellStyle}>
                              {row.average_talk_time ?? row.avgTalkTime ?? null}
                            </StatsTD>
                            <StatsTD bg={rowBg} style={lastRowCellStyle}>
                              {row.caller_hangup ?? row.callerHangup ?? 0}
                            </StatsTD>
                            <StatsTD bg={rowBg} style={lastRowCellStyle}>
                              {row.call_queue_timeout_calls ??
                                row.timeoutCalls ??
                                0}
                            </StatsTD>
                            <StatsTD
                              bg={rowBg}
                              style={{
                                ...lastRowCellStyle,
                                borderRight: "none",
                              }}
                            >
                              {row.callback_calls ?? row.callbackCalls ?? 0}
                            </StatsTD>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {queueData.length > 0 && (
                <div style={statsFooterStyle}>
                  <span style={{ fontSize: 11, color: C.mutedText }}>
                    Showing {queueData.length} Queue
                    {queueData.length !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN ACTIVE CALL QUEUE PAGE
// ═══════════════════════════════════════════════════════════════════════════
const ActiveCallQueue = () => {
  const [showStats, setShowStats] = useState(false);
  const [queueList, setQueueList] = useState([]);
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const pollRef = useRef(null);
  const silentRefreshRef = useRef(false);

  const loadActivity = useCallback(async (silent = false) => {
    if (silent) {
      if (silentRefreshRef.current) return;
      silentRefreshRef.current = true;
    } else {
      setIsRefreshing(true);
      setError("");
    }

    try {
      const data = await fetchCallQueueActivity();
      const list = Array.isArray(data) ? data : [];
      setQueueList(list);
      setSelectedQueue((prev) => {
        if (prev) {
          return (
            list.find(
              (q) =>
                (q.queue_number ?? q.number) ===
                (prev.queue_number ?? prev.number),
            ) ||
            list[0] ||
            null
          );
        }
        return list[0] || null;
      });
      setLastUpdated(new Date());
      setHasLoaded(true);
      setError("");
    } catch {
      if (!silent) setError("Failed to load queue data. Retrying...");
    } finally {
      if (silent) {
        silentRefreshRef.current = false;
      } else {
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    loadActivity(false);
    pollRef.current = setInterval(() => loadActivity(true), POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [loadActivity]);

  if (showStats) {
    const qNum = selectedQueue
      ? (selectedQueue.queue_number ?? selectedQueue.number ?? "")
      : "";
    return (
      <CallQueueStatistics
        onBack={() => setShowStats(false)}
        initialQueue={qNum}
      />
    );
  }

  // Normalise queue object
  const norm = (q) => ({
    number: q.queue_number ?? q.number ?? "—",
    name: q.queue_name ?? q.name ?? "—",
    totalCalls: q.total_calls ?? q.totalCalls ?? 0,
    answeredCalls: q.answered_calls ?? q.answeredCalls ?? 0,
    answeredRate: parseFloat(q.answered_rate ?? q.answeredRate ?? 0),
    waitingCalls: q.waiting_calls ?? q.waitingCalls ?? 0,
    abandonedCalls: q.abandoned_calls ?? q.abandonedCalls ?? 0,
    avgWaitTime:
      q.average_waiting_time ?? q.avg_wait_time ?? q.avgWaitTime ?? "0:00:00",
    avgTalkTime:
      q.average_talking_time ?? q.avg_talk_time ?? q.avgTalkTime ?? "0:00:00",
    totalAgents: q.total_agents ?? q.totalAgents ?? 0,
    activeAgents: q.active_agents ?? q.activeAgents ?? 0,
    idleAgents: q.idle_agents ?? q.idleAgents ?? 0,
    onCallAgents: q.on_call_agents ?? q.onCallAgents ?? 0,
    status: q.status ?? "Active",
  });

  const sel = selectedQueue ? norm(selectedQueue) : null;

  return (
    <div style={pbxPageWrapStyle}>
      <div style={pbxPageInnerStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <PageBreadcrumb
            segments={["Status", "PBX Status", "Active Call Queue"]}
            style={{ marginBottom: 0 }}
          />
          {lastUpdated && (
            <span
              style={{
                fontSize: 11,
                color: C.mutedText,
                flexShrink: 0,
                marginLeft: "auto",
              }}
            >
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>

        <div style={sipPcmCardStyle}>
          <div style={sipPcmToolbarStyle}>
            {hasLoaded && queueList.length > 0 && (
              <span style={{ fontSize: 11, color: C.mutedText }}>
                Showing {queueList.length} queue
                {queueList.length !== 1 ? "s" : ""}
              </span>
            )}
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginLeft: "auto",
              }}
            >
              <Btn
                variant="cancel"
                onClick={() => loadActivity(false)}
                disabled={isRefreshing}
                style={sipPcmCancelBtnStyle}
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
              <Btn
                variant="primary"
                onClick={() => setShowStats(true)}
                style={sipPcmPrimaryBtnStyle}
              >
                Call Queue Statistics
              </Btn>
            </div>
          </div>

          <div style={{ padding: "14px 16px 16px" }}>
            {/* Error state */}
            {error && (
              <div
                style={{
                  background: "#fef2f2",
                  borderLeft: `3px solid #f87171`,
                  color: "#b91c1c",
                  padding: "10px 14px",
                  borderRadius: 6,
                  marginBottom: 14,
                  fontSize: 13,
                }}
              >
                {error}
              </div>
            )}

            {/* Initial load */}
            {!hasLoaded && queueList.length === 0 && !error && (
              <TableListLoading />
            )}

            {hasLoaded && !error && queueList.length === 0 && (
              <TableListEmptyState
                message="No active queues found."
                showButton={false}
              />
            )}

            {/* Main content */}
            {queueList.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    alignItems: "flex-start",
                  }}
                >
                  {/* ── LEFT: Queue list ── */}
                  <div style={{ width: 190, flexShrink: 0 }}>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: C.mutedText,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        marginBottom: 8,
                      }}
                    >
                      Call Queues ({queueList.length})
                    </div>
                    {queueList.map((q, i) => {
                      const n = norm(q);
                      const isSelected = sel?.number === n.number;
                      return (
                        <div
                          key={i}
                          onClick={() => setSelectedQueue(q)}
                          style={{
                            background: isSelected ? "#f0f9ff" : C.cardBg,
                            border: `1px solid ${isSelected ? C.accent : C.cardBorder}`,
                            borderLeft: `3px solid ${isSelected ? C.accent : "transparent"}`,
                            borderRadius: CARD_RADIUS,
                            padding: "10px 12px",
                            marginBottom: 8,
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                            boxShadow: isSelected
                              ? `0 0 0 1px ${C.accent}20`
                              : "0 1px 3px rgba(0,0,0,0.04)",
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected)
                              e.currentTarget.style.background = "#f8fafc";
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected)
                              e.currentTarget.style.background = C.cardBg;
                          }}
                        >
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: C.accent,
                              marginBottom: 4,
                            }}
                          >
                            {n.number}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: C.mutedText,
                              marginBottom: 8,
                            }}
                          >
                            {n.name}
                          </div>

                          {/* Active badge */}
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              // background: "#dcfce7",
                              color: successGreen,
                              fontSize: 12,
                              fontWeight: 700,
                              padding: "1px 8px",
                              borderRadius: 10,
                              marginBottom: 8,
                            }}
                          >
                            <span
                              style={{
                                width: 5,
                                height: 5,
                                borderRadius: "50%",
                                background: successGreen,
                              }}
                            />
                            {n.status}
                          </span>

                          <AnsweredRateBar rate={n.answeredRate} />
                          <div
                            style={{
                              fontSize: 10,
                              color: C.mutedText,
                              marginTop: 4,
                            }}
                          >
                            Answered Rate: {n.answeredRate}%
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* ── RIGHT: Detail panel ── */}
                  {sel && (
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                      }}
                    >
                      {/* Queue header card */}
                      <div
                        style={{
                          background: C.cardBg,
                          border: `1px solid ${C.cardBorder}`,
                          borderRadius: CARD_RADIUS,
                          padding: "12px 18px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              marginBottom: 10,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 18,
                                fontWeight: 700,
                                color: C.valueText,
                              }}
                            >
                              {sel.number}
                            </span>
                            <span style={{ fontSize: 13, color: C.labelText }}>
                              ({sel.name})
                            </span>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                // background: "#dcfce7",
                                color: successGreen,
                                fontSize: 12,
                                fontWeight: 700,
                                padding: "2px 10px",
                                borderRadius: 10,
                              }}
                            >
                              <span
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: "50%",
                                  background: successGreen,
                                }}
                              />
                              {sel.status}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <span style={{ fontSize: 11, color: C.labelText }}>
                              Answered Rate
                            </span>
                            <div style={{ width: 160 }}>
                              <AnsweredRateBar rate={sel.answeredRate} />
                            </div>
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: C.valueText,
                              }}
                            >
                              {sel.answeredRate}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Call metrics — 4 cards */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(4,1fr)",
                          gap: 10,
                        }}
                      >
                        <StatCard
                          label="Total Calls"
                          value={sel.totalCalls}
                          color={C.accent}
                        />
                        <StatCard
                          label="Answered Calls"
                          value={sel.answeredCalls}
                          color={C.accent}
                        />
                        <StatCard
                          label="Waiting Calls"
                          value={sel.waitingCalls}
                          color={C.accent}
                        />
                        <StatCard
                          label="Abandoned Calls"
                          value={sel.abandonedCalls}
                          color={C.accent}
                        />
                      </div>

                      {/* Agent metrics — 4 cards */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(4,1fr)",
                          gap: 10,
                        }}
                      >
                        <StatCard
                          label="Total Agents"
                          value={sel.totalAgents}
                          color={C.accent}
                        />
                        <StatCard
                          label="Active Agents"
                          value={sel.activeAgents}
                          color={C.accent}
                        />
                        <StatCard
                          label="Idle Agents"
                          value={sel.idleAgents}
                          color={C.accent}
                        />
                        <StatCard
                          label="On Call Agents"
                          value={sel.onCallAgents}
                          color={C.accent}
                        />
                      </div>

                      {/* Timing — 2 cards */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(2,1fr)",
                          gap: 10,
                        }}
                      >
                        {[
                          {
                            label: "Average Waiting Time",
                            value: sel.avgWaitTime,
                          },
                          {
                            label: "Average Talking Time",
                            value: sel.avgTalkTime,
                          },
                        ].map(({ label, value }) => (
                          <div
                            key={label}
                            style={{
                              background: C.cardBg,
                              border: `1px solid ${C.cardBorder}`,
                              borderRadius: CARD_RADIUS,
                              padding: "12px 18px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                            }}
                          >
                            <span
                              style={{
                                fontSize: 12,
                                color: C.labelText,
                                fontWeight: 500,
                              }}
                            >
                              {label}
                            </span>
                            <span
                              style={{
                                fontSize: 15,
                                fontWeight: 700,
                                color: C.accent,
                                fontFamily: "monospace",
                              }}
                            >
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveCallQueue;
