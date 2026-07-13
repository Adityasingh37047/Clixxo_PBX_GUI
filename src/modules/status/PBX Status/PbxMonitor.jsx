import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";
import { CircularProgress, useMediaQuery } from "@mui/material";
import { monitorBoth } from "../../../api/apiService";
import {
  PBX_MONITOR_BREADCRUMB_SEGMENTS,
  PBX_MONITOR_EMPTY_MESSAGES,
  PBX_MONITOR_REFRESH_INTERVAL_MS,
  PBX_MONITOR_SEARCH_PLACEHOLDERS,
  PBX_MONITOR_STAT_LABELS,
  PBX_MONITOR_TAB_LABELS,
  PBX_MONITOR_TAB_VALUES,
} from "../../../constants/PbxMonitorConstants";

// ── Color Palette ─────────────────────────────────────────────────────────────
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  divider: "#e2e6ec",
  labelText: "#3E5475",
  valueText: "#0f172a",
  mutedText: "#6b7280",
  strongText: "#0f172a",
  accent: "#3E5475",
  amber: "#dc2626",
  successGreen: "#16a34a",
  errorRed: "#dc2626",
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
    tabActive: {
      background:
        "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
      color: "#fff",
      border: "1px solid #5A6F8F",
      fontWeight: 600,
    },
    tabInactive: {
      background: C.cardBg,
      color: C.labelText,
      border: `1px solid ${C.cardBorder}`,
      fontWeight: 600,
    },
  };
  const s = styles[variant] || styles.default;
  const hoverBg =
    {
      primary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      cancel: "#b6c2d3",
      danger: "#fca5a5",
      outline: "#e2e8f0",
      tabActive: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      tabInactive: "#e2e8f0",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const baseBg = extraStyle?.background ?? s.background;
  const baseShadow = extraStyle?.boxShadow ?? s.boxShadow ?? "none";
  const Component = component || "button";

  const clearPressStyle = (el) => {
    el.style.transform = "";
    el.style.boxShadow = baseShadow;
  };

  const applyPressStyle = (el) => {
    el.style.background =
      {
        primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
        cancel: "#a3b1c2",
        danger: "#f87171",
        outline: "#d1d9e6",
        tabActive: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
        tabInactive: "#d1d9e6",
        default: "#d1d5db",
      }[variant] || "#d1d5db";
    el.style.transform = "translateY(1px) scale(0.98)";
    el.style.boxShadow =
      variant === "primary"
        ? "inset 0 2px 4px rgba(0, 0, 0, 0.25)"
        : variant === "cancel"
          ? "inset 0 2px 4px rgba(15, 23, 42, 0.15)"
          : "inset 0 1px 3px rgba(15, 23, 42, 0.12)";
  };

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
        borderRadius: 4,
        fontSize: 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "all 0.15s ease",
        height: 30,
        gap: 6,
        whiteSpace: "nowrap",
        userSelect: "none",
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = baseBg;
          clearPressStyle(e.currentTarget);
        }
      }}
      onMouseDown={(e) => {
        if (!disabled) applyPressStyle(e.currentTarget);
      }}
      onMouseUp={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = hoverBg;
          clearPressStyle(e.currentTarget);
        }
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
        style={{ padding: "8px 24px", fontSize: 12, borderRadius: 4 }}
      >
        {buttonLabel}
      </Btn>
    ) : null}
  </div>
);

const PBX_MONITOR_COMPACT_MQ = "(max-width: 768px)";
const PBX_MONITOR_EXTENSION_TABLE_MIN_WIDTH = 640;
const PBX_MONITOR_TRUNK_TABLE_MIN_WIDTH = 520;
const CARD_RADIUS = 4;
const PBX_MONITOR_TABLE_CARD_RADIUS = CARD_RADIUS;
const PBX_MONITOR_FORM_HEADER_RADIUS = CARD_RADIUS;

const pbxMonitorCardHeaderStyle = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "10px 28px 10px 14px",
  borderBottom: `1px solid ${C.divider}`,
  background: C.cardBg,
  borderTopLeftRadius: PBX_MONITOR_FORM_HEADER_RADIUS,
  borderTopRightRadius: PBX_MONITOR_FORM_HEADER_RADIUS,
  flexWrap: "wrap",
  gap: 12,
  boxSizing: "border-box",
  flexShrink: 0,
};

const pbxMonitorHeaderLeftStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
  minWidth: 0,
};

const pbxMonitorHeaderToolbarStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
  marginLeft: "auto",
};

const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";
const PBX_MONITOR_TOOLBAR_SEARCH_HEIGHT = 30;
const PBX_MONITOR_TOOLBAR_SEARCH_WIDTH = 168;
const PBX_MONITOR_SEARCH_ICON_SLOT = 18;
const PBX_MONITOR_SEARCH_BAR_PADDING_FIT = 16;
const PBX_MONITOR_SEARCH_BAR_PADDING_DEFAULT = 20;
const PBX_MONITOR_TOOLBAR_SEARCH_FOCUS_RING =
  "0 0 0 2px rgba(62, 84, 117, 0.15)";
const PBX_MONITOR_TOOLBAR_SEARCH_INPUT_FONT = {
  fontSize: 12,
  fontFamily: "Inter, sans-serif",
  letterSpacing: "normal",
};

const PbxMonitorToolbarSearchBar = ({
  value,
  onChange,
  placeholder = "Search...",
  width = PBX_MONITOR_TOOLBAR_SEARCH_WIDTH,
  fitPlaceholder = false,
  fullWidth = false,
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
    fullWidth
      ? "100%"
      : fitPlaceholder && placeholderWidth != null
        ? placeholderWidth + PBX_MONITOR_SEARCH_BAR_PADDING_FIT + PBX_MONITOR_SEARCH_ICON_SLOT
        : width;

  const horizontalPadding = fitPlaceholder
    ? PBX_MONITOR_SEARCH_BAR_PADDING_FIT / 2
    : PBX_MONITOR_SEARCH_BAR_PADDING_DEFAULT / 2;

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
    el.style.boxShadow = PBX_MONITOR_TOOLBAR_SEARCH_FOCUS_RING;
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
        height: PBX_MONITOR_TOOLBAR_SEARCH_HEIGHT,
        boxSizing: "border-box",
        background: "#f8fafc",
        border: `1px solid ${OUTLINED_BORDER}`,
        borderRadius: 4,
        padding: `0 ${horizontalPadding}px`,
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        width: resolvedWidth,
        minWidth: fullWidth ? 0 : resolvedWidth,
        maxWidth: fullWidth ? "100%" : resolvedWidth,
        flex: fullWidth ? 1 : undefined,
        flexShrink: fullWidth ? 1 : 0,
        position: "relative",
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
            ...PBX_MONITOR_TOOLBAR_SEARCH_INPUT_FONT,
          }}
        />
      ) : null}
      <span style={{ fontSize: 12, color: C.mutedText, flexShrink: 0 }}>🔍</span>
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
          ...PBX_MONITOR_TOOLBAR_SEARCH_INPUT_FONT,
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

const PBX_MONITOR_CARD_SHADOW =
  "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)";

const PBX_MONITOR_STAT_CARD_SHADOW =
  "0 1px 3px rgba(15, 23, 42, 0.06), 0 2px 8px rgba(15, 23, 42, 0.05)";

const pbxMonitorCardStyle = {
  background: "#ffffff",
  borderRadius: PBX_MONITOR_TABLE_CARD_RADIUS,
  overflow: "hidden",
  border: `1px solid ${C.cardBorder}`,
  boxShadow: PBX_MONITOR_CARD_SHADOW,
};

const pbxMonitorCancelBtnStyle = {
  height: 30,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
  borderRadius: 4,
};

const pbxMonitorFooterStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.divider}`,
  borderBottomLeftRadius: PBX_MONITOR_TABLE_CARD_RADIUS,
  borderBottomRightRadius: PBX_MONITOR_TABLE_CARD_RADIUS,
};

const PBX_MONITOR_TRUNK_ACCENT = "#8b5cf6";

const StatCard = ({ label, value, accent, ready }) => (
  <div
    style={{
      background: "#ffffff",
      borderRadius: CARD_RADIUS,
      padding: "8px 12px",
      minHeight: 52,
      border: `1px solid ${C.cardBorder}`,
      borderLeft: `3px solid ${accent}`,
      boxShadow: PBX_MONITOR_STAT_CARD_SHADOW,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      gap: 4,
    }}
  >
    <span
      style={{
        fontSize: 10,
        color: C.labelText,
        fontWeight: 600,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        lineHeight: 1.2,
      }}
    >
      {label}
    </span>

    <span
      style={{
        fontSize: 20,
        fontWeight: 700,
        lineHeight: 1,
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
      color: C.successGreen,
      dot: C.successGreen,
    },
    bad: {
      color: C.errorRed,
      dot: C.errorRed,
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
  width: "100%",
  overflowX: "auto",
  WebkitOverflowScrolling: "touch",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: 0,
  tableLayout: "fixed",
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
      borderBottom: `1px solid ${C.divider}`,
      borderRight: `1px solid ${C.divider}`,
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
  borderBottom: `1px solid ${C.divider}`,
  borderRight: `1px solid ${C.divider}`,
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
  const isCompact = useMediaQuery(PBX_MONITOR_COMPACT_MQ);
  const [activeTab, setActiveTab] = useState(PBX_MONITOR_TAB_VALUES.extension);
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

    const interval = setInterval(() => loadData(true), PBX_MONITOR_REFRESH_INTERVAL_MS);

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

  const filteredExtensions = extensionRows.filter((r) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    const status = getStatus(r.status).text.toLowerCase();
    return (
      String(r.extension ?? "").toLowerCase().includes(q) ||
      (r.name || "").toLowerCase().includes(q) ||
      status.includes(q) ||
      (r.ip_port || "").toLowerCase().includes(q)
    );
  });

  const filteredTrunks = trunkRows.filter((r) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    const status = getStatus(r.status).text.toLowerCase();
    return (
      (r.trunk_name || "").toLowerCase().includes(q) ||
      (r.type || "sip").toLowerCase().includes(q) ||
      status.includes(q) ||
      (r.host_ip_port || "").toLowerCase().includes(q)
    );
  });

  const tableRows =
    activeTab === PBX_MONITOR_TAB_VALUES.extension
      ? filteredExtensions
      : filteredTrunks;
  const searchPlaceholder =
    activeTab === PBX_MONITOR_TAB_VALUES.extension
      ? PBX_MONITOR_SEARCH_PLACEHOLDERS.extension
      : PBX_MONITOR_SEARCH_PLACEHOLDERS.trunk;
  const emptyMessage =
    activeTab === PBX_MONITOR_TAB_VALUES.extension
      ? PBX_MONITOR_EMPTY_MESSAGES.extension
      : PBX_MONITOR_EMPTY_MESSAGES.trunk;
  const recordLabel =
    activeTab === PBX_MONITOR_TAB_VALUES.extension
      ? `extension${tableRows.length !== 1 ? "s" : ""}`
      : `trunk${tableRows.length !== 1 ? "s" : ""}`;

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
            segments={PBX_MONITOR_BREADCRUMB_SEGMENTS}
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

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isCompact
              ? "repeat(2, minmax(0, 1fr))"
              : "repeat(auto-fit, minmax(160px, 1fr))",
            gap: isCompact ? 10 : 16,
            marginBottom: 12,
            width: "100%",
          }}
        >
          <StatCard
            label={PBX_MONITOR_STAT_LABELS.totalExtensions}
            value={extensionRows.length}
            accent={C.accent}
            ready={hasLoaded}
          />

          <StatCard
            label={PBX_MONITOR_STAT_LABELS.registered}
            value={extRegistered}
            accent={C.successGreen}
            ready={hasLoaded}
          />

          <StatCard
            label={PBX_MONITOR_STAT_LABELS.unregistered}
            value={extUnregistered}
            accent={C.errorRed}
            ready={hasLoaded}
          />

          <StatCard
            label={PBX_MONITOR_STAT_LABELS.registeredTrunks}
            value={trkRegistered}
            accent={PBX_MONITOR_TRUNK_ACCENT}
            ready={hasLoaded}
          />
        </div>

        <div style={pbxMonitorCardStyle}>
          <div
            style={{
              ...pbxMonitorCardHeaderStyle,
              ...(isCompact
                ? {
                    flexDirection: "column",
                    alignItems: "stretch",
                    padding: "10px 12px",
                  }
                : {}),
            }}
          >
            <div
              style={{
                ...pbxMonitorHeaderLeftStyle,
                ...(isCompact ? { width: "100%" } : {}),
              }}
            >
              <Btn
                type="button"
                variant={
                  activeTab === PBX_MONITOR_TAB_VALUES.extension
                    ? "tabActive"
                    : "tabInactive"
                }
                onClick={() => setActiveTab(PBX_MONITOR_TAB_VALUES.extension)}
                style={{ height: 30 }}
              >
                {PBX_MONITOR_TAB_LABELS.extension}
              </Btn>
              <Btn
                type="button"
                variant={
                  activeTab === PBX_MONITOR_TAB_VALUES.trunk
                    ? "tabActive"
                    : "tabInactive"
                }
                onClick={() => setActiveTab(PBX_MONITOR_TAB_VALUES.trunk)}
                style={{ height: 30 }}
              >
                {PBX_MONITOR_TAB_LABELS.trunk}
              </Btn>
            </div>

            <div
              style={{
                ...pbxMonitorHeaderToolbarStyle,
                ...(isCompact
                  ? {
                      width: "100%",
                      marginLeft: 0,
                      justifyContent: "stretch",
                    }
                  : {}),
              }}
            >
              <PbxMonitorToolbarSearchBar
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                fitPlaceholder={!isCompact}
                fullWidth={isCompact}
              />

              <Btn
                variant="cancel"
                onClick={() => loadData(false)}
                disabled={isRefreshing}
                style={pbxMonitorCancelBtnStyle}
              >
                {isRefreshing ? (
                  <>
                    <CircularProgress size={11} style={{ color: "#374151" }} />
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
            {activeTab === PBX_MONITOR_TAB_VALUES.extension ? (
              <table
                style={{
                  ...tableStyle,
                  ...(isCompact
                    ? { minWidth: PBX_MONITOR_EXTENSION_TABLE_MIN_WIDTH }
                    : {}),
                }}
              >
                <thead>
                  <tr>
                    <TH>Status</TH>
                    <TH>Extension</TH>
                    <TH>Name</TH>
                    <TH>Type</TH>
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
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            <StatusBadge tone={status.tone} text={status.text} />
                          </div>
                        </TD>

                        <TD align="center" bg={rowBg} style={lastRowCellStyle}>
                          {row.extension}
                        </TD>

                        <TD align="center" bg={rowBg} style={lastRowCellStyle}>
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
              <table
                style={{
                  ...tableStyle,
                  ...(isCompact
                    ? { minWidth: PBX_MONITOR_TRUNK_TABLE_MIN_WIDTH }
                    : {}),
                }}
              >
                <thead>
                  <tr>
                    <TH>Status</TH>
                    <TH>Trunk Name</TH>
                    <TH>Type</TH>
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
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            <StatusBadge tone={status.tone} text={status.text} />
                          </div>
                        </TD>

                        <TD align="center" bg={rowBg} style={lastRowCellStyle}>
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

          {hasLoaded && tableRows.length > 0 && (
            <div style={pbxMonitorFooterStyle}>
              <span style={{ fontSize: 11, color: C.mutedText }}>
                Showing {tableRows.length} {recordLabel}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PbxMonitor;
