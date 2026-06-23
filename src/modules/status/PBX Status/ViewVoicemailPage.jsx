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

const PBX_COMPACT_MQ = "(max-width: 768px)";

const C = {
  pageBg: "var(--bg-main)",
  cardBg: "var(--bg-surface)",
  cardBorder: "var(--border-strong)",
  labelText: "var(--text-primary)",
  valueText: "var(--text-primary)",
  mutedText: "var(--text-muted)",
  accent: "var(--accent-brand)",
  amber: "#dc2626",
  errorRed: "#dc2626",
  successGreen: "#16a34a",
};

const CARD_RADIUS = 10;
const OUTLINED_BORDER = "var(--border-subtle)";
const OUTLINED_HOVER = "var(--border-strong)";
const OUTLINED_FOCUS = "var(--status-primary)";

// ── Interaction handlers for native inputs ────────────────────────────────────
const nativeFieldInteraction = {
  onFocus: (e) => {
    e.target.style.borderColor = OUTLINED_FOCUS;
    e.target.style.boxShadow = `0 0 0 1px ${OUTLINED_FOCUS}`;
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
  style: extra,
}) => {
  const styles = {
    default: {
      background: C.cardBg,
      color: C.valueText,
      border: "1px solid var(--border-subtle)",
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
      color: "var(--text-secondary)",
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
  const baseBg = extra?.background ?? s.background;
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
        ...s,
        ...extra,
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

const TH = ({ children, align = "center", style: extra }) => (
  <th
    style={{
      background: "var(--table-header-bg)",
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
  borderBottom: `1px solid ${C.cardBorder}`,
  borderRight: `1px solid ${C.cardBorder}`,
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
    <div style={{ color: "var(--text-primary)", fontSize: 13, fontWeight: 600 }}>
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

const viewVoicemailPaginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "var(--bg-surface)",
  borderTop: `1px solid ${C.cardBorder}`,
  borderBottomLeftRadius: CARD_RADIUS,
  borderBottomRightRadius: CARD_RADIUS,
  overflow: "hidden",
};

const viewVoicemailPageBadgeStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: C.accent,
  background: "#e0f2fe",
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
      color: "#16a34a",
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
      background: "var(--bg-muted)",
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
  const isCompact = useMediaQuery(PBX_COMPACT_MQ);

  const [extensionInput, setExtensionInput] = useState("");
  const [folderFilter, setFolderFilter] = useState("all");
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
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
        backgroundColor: C.pageBg,
        minHeight: "calc(100vh - 80px)",
        padding: isCompact ? 8 : 16,
        boxSizing: "border-box",
      }}
    >
      <div style={{ width: "100%", maxWidth: "100%", margin: "0 auto" }}>
        {/* Breadcrumb */}
        <div
          style={{
            fontSize: 12,
            color: "var(--text-muted)",
            marginBottom: 16,
            fontWeight: 400,
            display: "flex",
            alignItems: "center",
            gap: 4,
            flexWrap: "wrap",
          }}
        >
          <span>Status</span>
          <span>&gt;</span>
          <span>PBX Status</span>
          <span>&gt;</span>
          <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            View Voicemail
          </span>
        </div>

        {/* Error banner */}
        {error && (
          <div
            style={{
              background: "#fef2f2",
              borderLeft: `3px solid ${C.amber}`,
              color: "#DC2626",
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

        {/* Filter bar */}
        <div
          style={{
            background: "var(--bg-surface)",
            border: `1.5px solid ${C.cardBorder}`,
            borderRadius: CARD_RADIUS,
            boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
            padding: isCompact ? 12 : "10px 14px",
            marginBottom: 16,
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
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: C.labelText,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                  display: "block",
                }}
              >
                Extension (optional)
              </span>
              <input
                type="text"
                value={extensionInput}
                onChange={(e) => setExtensionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") loadMessages(1);
                }}
                placeholder="All mailboxes"
                style={{
                  height: 30,
                  fontSize: 12,
                  color: C.valueText,
                  background: "var(--bg-surface)",
                  border: `1px solid ${OUTLINED_BORDER}`,
                  borderRadius: 10,
                  padding: "0 12px",
                  outline: "none",
                  fontFamily: "Inter, sans-serif",
                  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                  width: isCompact ? "100%" : 180,
                  boxSizing: "border-box",
                }}
                {...nativeFieldInteraction}
              />
            </div>
            <div style={{ flex: isCompact ? "1 1 100%" : "0 0 auto" }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: C.labelText,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                  display: "block",
                }}
              >
                Folder
              </span>
              <select
                value={folderFilter}
                onChange={(e) => {
                  const v = e.target.value;
                  setFolderFilter(v);
                  loadMessages(1, extensionInput, v);
                }}
                style={{
                  height: 30,
                  fontSize: 12,
                  color: C.valueText,
                  background: "var(--bg-surface)",
                  border: `1px solid ${OUTLINED_BORDER}`,
                  borderRadius: 10,
                  padding: "0 32px 0 12px",
                  outline: "none",
                  fontFamily: "Inter, sans-serif",
                  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                  width: isCompact ? "100%" : 170,
                  boxSizing: "border-box",
                  cursor: "pointer",
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 12px center",
                }}
                {...nativeFieldInteraction}
              >
                <option value="all">All Folders</option>
                <option value="INBOX">New (INBOX)</option>
                <option value="Old">Read (Old)</option>
              </select>
            </div>
            <Btn
              variant="primary"
              onClick={() => loadMessages(1)}
              disabled={loading}
              style={{
                height: 30,
                padding: "6px 14px",
                fontSize: 12,
                borderRadius: 10,
              }}
            >
              {loading ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                "Search"
              )}
            </Btn>
            <Btn
              variant="cancel"
              onClick={() => loadMessages(page)}
              disabled={loading}
              style={{ height: 30, padding: "6px 14px", fontSize: 12 }}
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
                style={{ height: 30, padding: "6px 14px", fontSize: 12 }}
              >
                Reset
              </Btn>
            )}
          </div>
        </div>

        {/* Table card */}
        <div
          style={{
            background: "var(--bg-surface)",
            borderRadius: CARD_RADIUS,
            overflow: "hidden",
            border: `1.5px solid ${C.cardBorder}`,
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
              background: "var(--bg-surface)",
              flexWrap: "wrap",
              gap: 8,
              borderTopLeftRadius: CARD_RADIUS,
              borderTopRightRadius: CARD_RADIUS,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: C.labelText }}>
              Voicemail Messages
            </span>
            {hasLoaded && (
              <span style={{ fontSize: 11, color: C.mutedText }}>
                {total} message{total !== 1 ? "s" : ""} total
              </span>
            )}
          </div>

          {loading ? (
            <TableListLoading />
          ) : rows.length === 0 ? (
            <TableListEmptyState message="No voicemail messages found." />
          ) : (
            <>
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
                    minWidth: 860,
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
                      const rowBg = idx % 2 === 1 ? "var(--row-alt)" : "var(--bg-surface)";
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
                            e.currentTarget.style.background = "var(--row-alt)";
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
                                    style={{ color: "#16a34a" }}
                                  />
                                ) : isPlaying ? (
                                  <StopRoundedIcon
                                    sx={{ fontSize: 16, color: C.errorRed }}
                                  />
                                ) : (
                                  <PlayArrowRoundedIcon
                                    sx={{ fontSize: 16, color: "#16a34a" }}
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

              {/* Pagination */}
              <div
                style={{
                  ...viewVoicemailPaginationStyle,
                  ...(isCompact
                    ? {
                        flexDirection: "column",
                        alignItems: "stretch",
                        gap: 10,
                      }
                    : {}),
                }}
              >
                <span style={{ fontSize: 11, color: C.mutedText }}>
                  Showing {rows.length} message{rows.length !== 1 ? "s" : ""} on
                  page {page}
                </span>
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
              </div>
            </>
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
              background: "var(--bg-surface)",
              border: `1.5px solid ${C.cardBorder}`,
              borderRadius: CARD_RADIUS,
              padding: "10px 16px",
              boxShadow: "0 4px 12px rgba(15,23,42,0.06)",
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#16a34a",
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
