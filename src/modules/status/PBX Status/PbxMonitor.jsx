import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";
import { CircularProgress, Tabs, Tab } from "@mui/material";
import { monitorBoth } from "../../../api/apiService";

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
const PBX_TOOLBAR_SEARCH_FOCUS_RING = `0 0 0 1px ${OUTLINED_FOCUS}`;
const PBX_TOOLBAR_SEARCH_INPUT_FONT = {
  fontSize: 12,
  fontFamily: "Inter, sans-serif",
  letterSpacing: "normal",
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
  const [fitWidth, setFitWidth] = useState(null);

  useLayoutEffect(() => {
    if (!fitPlaceholder || !measureRef.current) return;
    measureRef.current.textContent = value || placeholder;
    setFitWidth(measureRef.current.offsetWidth);
  }, [fitPlaceholder, placeholder, value]);

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

  const inputWidth = fitPlaceholder && fitWidth != null ? fitWidth : null;

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
        padding: fitPlaceholder ? "0 8px" : "0 10px",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        width: fitPlaceholder ? "fit-content" : width,
        minWidth: fitPlaceholder ? "auto" : width,
        flexShrink: 0,
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
            ...PBX_TOOLBAR_SEARCH_INPUT_FONT,
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
          width: inputWidth ?? "100%",
          minWidth: inputWidth ?? 0,
          maxWidth: inputWidth ?? undefined,
          padding: 0,
          margin: 0,
          ...PBX_TOOLBAR_SEARCH_INPUT_FONT,
          color: C.valueText,
        }}
      />
      {value ? (
        <span
          role="button"
          tabIndex={0}
          onClick={() => onChange({ target: { value: "" } })}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onChange({ target: { value: "" } });
            }
          }}
          style={{
            fontSize: 11,
            color: C.mutedText,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          ✕
        </span>
      ) : null}
    </div>
  );
};

const SIP_PCM_TABLE_CARD_RADIUS = 10;
const SIP_PCM_FORM_HEADER_RADIUS = 20;

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

const sipPcmAuthFormBtnStyle = {
  minWidth: 110,
  height: 34,
  fontSize: 13,
  margin: 0,
  padding: "0 28px",
  lineHeight: "34px",
  boxSizing: "border-box",
};

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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              minHeight: 44,
              padding: "0 8px 0 6px",
              background: C.cardBg,
              borderBottom: `1px solid ${C.cardBorder}`,
              borderTopLeftRadius: SIP_PCM_FORM_HEADER_RADIUS,
              borderTopRightRadius: SIP_PCM_FORM_HEADER_RADIUS,
              flexWrap: "wrap",
              gap: 8,
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
              sx={pbxHeaderTabsSx}
            >
              <Tab label="EXTENSIONS" value="extension" />
              <Tab label="TRUNKS" value="trunk" />
            </Tabs>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
                marginLeft: "auto",
                padding: "7px 6px 7px 0",
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
                style={{
                  ...sipPcmAuthFormBtnStyle,
                  ...sipPcmCancelBtnStyle,
                  boxShadow: "none",
                }}
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
