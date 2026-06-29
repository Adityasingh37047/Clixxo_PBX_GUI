import React, { useEffect, useRef, useState } from "react";
import {
  CircularProgress,
  IconButton,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import {
  listVoicemails,
  playVoicemail,
  deleteVoicemail,
} from "../../../api/apiService";
import {
  VIEW_VOICEMAIL_BREADCRUMB_SEGMENTS,
  VIEW_VOICEMAIL_COMPACT_MQ,
  VIEW_VOICEMAIL_EMPTY_MESSAGE,
  VIEW_VOICEMAIL_EXTENSION_PLACEHOLDER,
  VIEW_VOICEMAIL_FILTER_LABELS,
  VIEW_VOICEMAIL_FOLDER_OPTIONS,
  VIEW_VOICEMAIL_PAGE_LIMIT,
  VIEW_VOICEMAIL_RECORD_LABEL,
  VIEW_VOICEMAIL_TABLE_HEADING,
  VIEW_VOICEMAIL_TABLE_MIN_WIDTH,
} from "../../../constants/ViewVoicemailConstants";

const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  divider: "#e2e6ec",
  labelText: "#3E5475",
  valueText: "#0f172a",
  mutedText: "#6b7280",
  accent: "#3E5475",
  errorRed: "#dc2626",
  successGreen: "#16a34a",
};

const VIEW_VOICEMAIL_TABLE_CARD_RADIUS = 10;

const VIEW_VOICEMAIL_CARD_SHADOW =
  "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)";

const VIEW_VOICEMAIL_SECONDARY_CARD_SHADOW =
  "0 1px 3px rgba(15, 23, 42, 0.06), 0 2px 8px rgba(15, 23, 42, 0.05)";

const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = C.accent;

// ── Interaction handlers for native inputs ────────────────────────────────────
const nativeFieldInteraction = {
  onFocus: (e) => {
    e.target.style.borderColor = OUTLINED_FOCUS;
    e.target.style.boxShadow = "0 0 0 2px rgba(62, 84, 117, 0.15)";
  },
  onBlur: (e) => {
    e.target.style.borderColor = OUTLINED_BORDER;
    e.target.style.boxShadow = "none";
  },
  onMouseEnter: (e) => {
    if (document.activeElement !== e.target)
      e.target.style.borderColor = OUTLINED_HOVER;
  },
  onMouseLeave: (e) => {
    if (document.activeElement !== e.target) {
      e.target.style.borderColor = OUTLINED_BORDER;
      e.target.style.boxShadow = "none";
    }
  },
};

// ── Shared components ─────────────────────────────────────────────────────────
const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
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
    },
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15,23,42,0.08)",
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
      outline: "#e2e8f0",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const baseBg = extraStyle?.background ?? s.background;
  const baseShadow = extraStyle?.boxShadow ?? s.boxShadow ?? "none";

  const clearPressStyle = (el) => {
    el.style.transform = "";
    el.style.boxShadow = baseShadow;
  };

  const applyPressStyle = (el) => {
    el.style.background =
      {
        primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
        cancel: "#a3b1c2",
        outline: "#d1d9e6",
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
    <button
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
    </button>
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

const viewVoicemailPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const viewVoicemailPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const viewVoicemailFilterCardStyle = {
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: VIEW_VOICEMAIL_TABLE_CARD_RADIUS,
  boxShadow: VIEW_VOICEMAIL_CARD_SHADOW,
  padding: "10px 14px",
  marginBottom: 16,
};

const viewVoicemailCardStyle = {
  background: C.cardBg,
  borderRadius: VIEW_VOICEMAIL_TABLE_CARD_RADIUS,
  overflow: "hidden",
  border: `1px solid ${C.cardBorder}`,
  boxShadow: VIEW_VOICEMAIL_CARD_SHADOW,
};

const viewVoicemailToolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.divider}`,
  background: C.cardBg,
  flexWrap: "wrap",
  gap: 8,
  borderTopLeftRadius: VIEW_VOICEMAIL_TABLE_CARD_RADIUS,
  borderTopRightRadius: VIEW_VOICEMAIL_TABLE_CARD_RADIUS,
};

const viewVoicemailFilterFieldStyle = {
  height: 30,
  fontSize: 12,
  color: C.valueText,
  background: "#f8fafc",
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 10,
  outline: "none",
  fontFamily: "Inter, sans-serif",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
};

const viewVoicemailFilterLabelStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: C.labelText,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  marginBottom: 6,
  display: "block",
};

const viewVoicemailToolbarBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
};

const viewVoicemailRefreshBtnStyle = {
  height: 30,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const TH = ({ children, align = "center", style: extra }) => (
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
      textTransform: "uppercase",
      letterSpacing: "0.14em",
      position: "sticky",
      top: 0,
      zIndex: 10,
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

const TD = ({ children, align = "center", mono, muted, bg, style: extra }) => (
  <td
    style={{
      ...tdStyle,
      textAlign: align,
      color: mono ? C.accent : muted ? C.mutedText : C.valueText,
      fontFamily: mono ? "monospace, monospace" : "inherit",
      fontWeight: mono ? 600 : 400,
      ...(bg != null ? { background: bg } : {}),
      ...extra,
    }}
  >
    {children ?? <span style={{ color: C.mutedText }}>—</span>}
  </td>
);

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

const TableListEmptyState = ({ message }) => (
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
    <div style={{ color: "#3E5475", fontSize: 13, fontWeight: 600 }}>
      {message}
    </div>
  </div>
);

const toolIconBtnSx = {
  width: 26,
  height: 26,
  border: "1px solid #c2c8d0",
  borderRadius: 1,
  backgroundColor: "#f5f7fa",
  p: 0,
  "&:hover": { backgroundColor: "#e8edf3" },
};

const viewVoicemailFooterStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: C.cardBg,
  borderTop: `1px solid ${C.divider}`,
  borderBottomLeftRadius: VIEW_VOICEMAIL_TABLE_CARD_RADIUS,
  borderBottomRightRadius: VIEW_VOICEMAIL_TABLE_CARD_RADIUS,
  overflow: "hidden",
  flexWrap: "wrap",
  gap: 10,
};

const viewVoicemailPageBadgeStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: C.accent,
  background: "#eff6ff",
  padding: "5px 14px",
  borderRadius: 6,
  border: `0.5px solid ${C.cardBorder}`,
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const parseCallerId = (raw) => {
  if (!raw) return "—";
  // strip `"name" <number>` → number; or `<number>` → number; fallback to raw
  const match = raw.match(/<([^>]+)>/) || raw.match(/^"?([^"<]+)"?$/);
  return match ? match[1].trim() : raw.trim();
};

const fmtDuration = (secs) => {
  const s = Number(secs) || 0;
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
};

const fmtDate = (iso) => {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
  } catch {
    return iso;
  }
};

const NewBadge = () => (
  <span
    style={{
      background: "#dcfce7",
      color: C.successGreen,
      padding: "2px 7px",
      borderRadius: 999,
      fontSize: 10,
      fontWeight: 700,
      whiteSpace: "nowrap",
    }}
  >
    New
  </span>
);
const ReadBadge = () => (
  <span
    style={{
      background: "#f1f5f9",
      color: "#64748b",
      padding: "2px 7px",
      borderRadius: 999,
      fontSize: 10,
      fontWeight: 700,
      whiteSpace: "nowrap",
    }}
  >
    Read
  </span>
);

// ── Page ──────────────────────────────────────────────────────────────────────
const ViewVoicemailPage = () => {
  const isCompact = useMediaQuery(VIEW_VOICEMAIL_COMPACT_MQ);

  const [extensionInput, setExtensionInput] = useState("");
  const [folderFilter, setFolderFilter] = useState("all");
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(VIEW_VOICEMAIL_PAGE_LIMIT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);

  const [audioUrl, setAudioUrl] = useState("");
  const [playingId, setPlayingId] = useState(null);
  const [playLoading, setPlayLoading] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const audioRef = useRef(null);
  const hasInitialLoadRef = useRef(false);

  const stopPlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl("");
    setPlayingId(null);
  };

  const loadMessages = async (
    pg = 1,
    ext = extensionInput,
    folder = folderFilter,
  ) => {
    const trimmed = ext.trim();
    setLoading(true);
    setError("");
    try {
      const res = await listVoicemails({
        extension: trimmed || undefined,
        folder: folder && folder !== "all" ? folder : undefined,
        page: pg,
        limit,
      });
      if (res?.response) {
        setRows(Array.isArray(res.data) ? res.data : []);
        setTotal(Number(res.total) || 0);
        setPage(pg);
        setHasLoaded(true);
        stopPlayer();
      } else {
        setError(
          typeof res?.message === "string"
            ? res.message
            : "Failed to load voicemails.",
        );
        setRows([]);
      }
    } catch (e) {
      setError(e.message || "Failed to load voicemails.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-load all mailboxes on open
  useEffect(() => {
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadMessages(1, "", "all");
    }
  }, []);

  const handlePlay = async (row) => {
    if (playingId === row.id) {
      stopPlayer();
      return;
    }
    stopPlayer();
    setPlayLoading(row.id);
    try {
      const blob = await playVoicemail(row.id);
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setPlayingId(row.id);
      setTimeout(() => audioRef.current?.play?.(), 0);
    } catch (e) {
      setError(e.message || "Failed to play message.");
    } finally {
      setPlayLoading(null);
    }
  };

  const handleDelete = async (row) => {
    if (
      !window.confirm(
        `Delete voicemail from ${parseCallerId(row.callerid)} received at ${fmtDate(row.received_at)}?`,
      )
    )
      return;
    if (playingId === row.id) stopPlayer();
    setDeleteLoading(row.id);
    try {
      const res = await deleteVoicemail(row.id);
      if (res?.response) {
        await loadMessages(page);
      } else {
        setError(
          typeof res?.message === "string"
            ? res.message
            : "Failed to delete message.",
        );
      }
    } catch (e) {
      setError(e.message || "Failed to delete message.");
    } finally {
      setDeleteLoading(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div
      style={{
        ...viewVoicemailPageWrapStyle,
        padding: isCompact ? 8 : 16,
      }}
    >
      <div style={viewVoicemailPageInnerStyle}>
        <PageBreadcrumb
          segments={VIEW_VOICEMAIL_BREADCRUMB_SEGMENTS}
          style={{ marginBottom: 16 }}
        />

        {error && (
          <div
            style={{
              background: "#fef2f2",
              borderLeft: `3px solid ${C.errorRed}`,
              color: C.errorRed,
              padding: "10px 14px",
              borderRadius: 8,
              marginBottom: 16,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>{error}</span>
            <span
              onClick={() => setError("")}
              style={{ cursor: "pointer", fontSize: 16 }}
            >
              ✕
            </span>
          </div>
        )}

        <div
          style={{
            ...viewVoicemailFilterCardStyle,
            padding: isCompact ? 12 : "10px 14px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "flex-end",
              gap: 12,
            }}
          >
            <div style={{ flex: isCompact ? "1 1 100%" : "0 0 auto" }}>
              <span style={viewVoicemailFilterLabelStyle}>
                {VIEW_VOICEMAIL_FILTER_LABELS.extension}
              </span>
              <input
                type="text"
                value={extensionInput}
                onChange={(e) => setExtensionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") loadMessages(1);
                }}
                placeholder={VIEW_VOICEMAIL_EXTENSION_PLACEHOLDER}
                style={{
                  ...viewVoicemailFilterFieldStyle,
                  padding: "0 12px",
                  width: isCompact ? "100%" : 180,
                }}
                {...nativeFieldInteraction}
              />
            </div>
            <div style={{ flex: isCompact ? "1 1 100%" : "0 0 auto" }}>
              <span style={viewVoicemailFilterLabelStyle}>
                {VIEW_VOICEMAIL_FILTER_LABELS.folder}
              </span>
              <select
                value={folderFilter}
                onChange={(e) => {
                  const v = e.target.value;
                  setFolderFilter(v);
                  loadMessages(1, extensionInput, v);
                }}
                style={{
                  ...viewVoicemailFilterFieldStyle,
                  padding: "0 32px 0 12px",
                  width: isCompact ? "100%" : 170,
                  cursor: "pointer",
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 12px center",
                }}
                {...nativeFieldInteraction}
              >
                {VIEW_VOICEMAIL_FOLDER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <Btn
              variant="primary"
              onClick={() => loadMessages(1)}
              disabled={loading}
              style={viewVoicemailToolbarBtnStyle}
            >
              {loading ? (
                <CircularProgress size={11} style={{ color: "#fff" }} />
              ) : (
                "Search"
              )}
            </Btn>
            <Btn
              variant="cancel"
              onClick={() => loadMessages(page)}
              disabled={loading}
              style={viewVoicemailRefreshBtnStyle}
            >
              Refresh
            </Btn>
            {(extensionInput.trim() || folderFilter !== "all") && (
              <Btn
                variant="outline"
                onClick={() => {
                  setExtensionInput("");
                  setFolderFilter("all");
                  loadMessages(1, "", "all");
                }}
                disabled={loading}
                style={viewVoicemailToolbarBtnStyle}
              >
                Reset
              </Btn>
            )}
          </div>
        </div>

        <div style={viewVoicemailCardStyle}>
          <div style={viewVoicemailToolbarStyle}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.labelText }}>
              {VIEW_VOICEMAIL_TABLE_HEADING}
            </span>
          </div>

          {loading ? (
            <TableListLoading />
          ) : rows.length === 0 ? (
            <TableListEmptyState message={VIEW_VOICEMAIL_EMPTY_MESSAGE} />
          ) : (
            <div
              className="trunk-table-scroll"
              style={{
                overflowX: "auto",
                overflowY: "auto",
                WebkitOverflowScrolling: "touch",
              }}
            >
              <table
                  style={{
                    width: "100%",
                    minWidth: VIEW_VOICEMAIL_TABLE_MIN_WIDTH,
                    borderCollapse: "separate",
                    borderSpacing: 0,
                    tableLayout: "fixed",
                  }}
                >
                  <colgroup>
                    <col style={{ width: "4%" }} />
                    <col style={{ width: "16%" }} />
                    <col style={{ width: "8%" }} />
                    <col style={{ width: "20%" }} />
                    <col style={{ width: "10%" }} />
                    <col style={{ width: "14%" }} />
                    <col style={{ width: "8%" }} />
                    <col style={{ width: "10%" }} />
                    <col style={{ width: "10%" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <TH>ID</TH>
                      <TH>UNIQUE ID</TH>
                      <TH>Mailbox</TH>
                      <TH>Received At</TH>
                      <TH>Folder</TH>
                      <TH>Caller ID</TH>
                      <TH>Duration</TH>
                      <TH>Play</TH>
                      <TH style={{ borderRight: "none" }}>Delete</TH>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => {
                      const isLast = idx === rows.length - 1;
                      const rowBg = idx % 2 === 1 ? "#f8fafc" : "#ffffff";
                      const isPlaying = playingId === row.id;
                      const lastRowCellStyle = isLast
                        ? { borderBottom: "none" }
                        : {};

                      return (
                        <tr
                          key={row.id || idx}
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
                          <TD bg={rowBg} style={lastRowCellStyle}>
                            {(page - 1) * limit + idx + 1}
                          </TD>
                          <TD
                            mono
                            bg={rowBg}
                            title={row.id}
                            style={lastRowCellStyle}
                          >
                            {row.id}
                          </TD>
                          <TD bg={rowBg} style={lastRowCellStyle}>
                            {row.extension || "—"}
                          </TD>
                          <TD bg={rowBg} style={lastRowCellStyle}>
                            {fmtDate(row.received_at)}
                          </TD>
                          <TD bg={rowBg} style={lastRowCellStyle}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 5,
                              }}
                            >
                              <span
                                style={{ fontSize: 11, color: C.mutedText }}
                              >
                                {row.folder || "—"}
                              </span>
                              {row.is_new ? <NewBadge /> : <ReadBadge />}
                            </div>
                          </TD>
                          <TD
                            bg={rowBg}
                            title={row.callerid}
                            style={lastRowCellStyle}
                          >
                            {parseCallerId(row.callerid)}
                          </TD>
                          <TD bg={rowBg} style={lastRowCellStyle}>
                            {fmtDuration(row.duration)}
                          </TD>
                          <TD bg={rowBg} style={lastRowCellStyle}>
                            <Tooltip title={isPlaying ? "Stop" : "Play"}>
                              <IconButton
                                size="small"
                                sx={toolIconBtnSx}
                                disabled={
                                  !!playLoading && playLoading !== row.id
                                }
                                onClick={() => handlePlay(row)}
                              >
                                {playLoading === row.id ? (
                                  <CircularProgress
                                    size={13}
                                    style={{ color: C.successGreen }}
                                  />
                                ) : isPlaying ? (
                                  <StopRoundedIcon
                                    sx={{ fontSize: 16, color: C.errorRed }}
                                  />
                                ) : (
                                  <PlayArrowRoundedIcon
                                    sx={{ fontSize: 16, color: C.successGreen }}
                                  />
                                )}
                              </IconButton>
                            </Tooltip>
                          </TD>
                          <TD
                            bg={rowBg}
                            style={{
                              borderRight: "none",
                              ...lastRowCellStyle,
                            }}
                          >
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                sx={toolIconBtnSx}
                                disabled={!!deleteLoading}
                                onClick={() => handleDelete(row)}
                              >
                                {deleteLoading === row.id ? (
                                  <CircularProgress
                                    size={13}
                                    style={{ color: C.errorRed }}
                                  />
                                ) : (
                                  <DeleteOutlineRoundedIcon
                                    sx={{ fontSize: 16, color: C.errorRed }}
                                  />
                                )}
                              </IconButton>
                            </Tooltip>
                          </TD>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
          )}

          {hasLoaded && rows.length > 0 && (
            <div
              style={{
                ...viewVoicemailFooterStyle,
                ...(isCompact
                  ? {
                      flexDirection: "column",
                      alignItems: "stretch",
                    }
                  : {}),
              }}
            >
              <span style={{ fontSize: 11, color: C.mutedText }}>
                Showing {total} {VIEW_VOICEMAIL_RECORD_LABEL}
              </span>
              {totalPages > 1 && (
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    ...(isCompact
                      ? { justifyContent: "center", flexWrap: "wrap" }
                      : {}),
                  }}
                >
                  <Btn
                    onClick={() => loadMessages(page - 1)}
                    disabled={page <= 1 || loading}
                    variant="outline"
                  >
                    ← Prev
                  </Btn>
                  <span style={viewVoicemailPageBadgeStyle}>
                    Page {page} of {totalPages}
                  </span>
                  <Btn
                    onClick={() => loadMessages(page + 1)}
                    disabled={page >= totalPages || loading}
                    variant="outline"
                  >
                    Next →
                  </Btn>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Audio player */}
        {audioUrl && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 16,
              background: C.cardBg,
              border: `1px solid ${C.cardBorder}`,
              borderRadius: VIEW_VOICEMAIL_TABLE_CARD_RADIUS,
              padding: "10px 16px",
              boxShadow: VIEW_VOICEMAIL_SECONDARY_CARD_SHADOW,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: C.successGreen,
                whiteSpace: "nowrap",
              }}
            >
              Now Playing:
            </span>
            <audio
              ref={audioRef}
              controls
              src={audioUrl}
              style={{ height: 30, flex: 1 }}
              onEnded={stopPlayer}
            />
            <IconButton size="small" onClick={stopPlayer} sx={toolIconBtnSx}>
              <StopRoundedIcon sx={{ fontSize: 16, color: C.errorRed }} />
            </IconButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewVoicemailPage;
