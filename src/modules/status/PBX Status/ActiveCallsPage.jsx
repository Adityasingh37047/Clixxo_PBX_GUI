import React, { useState, useEffect, useCallback, useRef } from "react";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import HeadsetMicIcon from "@mui/icons-material/HeadsetMic";
import CallEndIcon from "@mui/icons-material/CallEnd";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { IconButton, CircularProgress, Tooltip } from "@mui/material";
import { fetchAriChannels, ariHangup } from "../../../api/apiService";

// 1s poll so "Talking" timer starts within ~1s of answer (was ~3s with 3s poll)
const POLL_MS = 1000;
const TICK_MS = 1000;

/** Align with IP→PSTN Routing Rule / PbxMonitor palette */
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#9CA3AF",
  cardBorderSoft: "#f1f5f9",
  labelText: "#3E5475",
  valueText: "#0f172a",
  strongText: "#0f172a",
  mutedText: "#94a3b8",
  accent: "#3E5475",
  errorRed: "#ef4444",
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

/**
 * Phone often shows 1s less than our timer (we mark Up slightly before phone counts,
 * or phone starts on media). Subtract this many seconds from displayed talking time.
 */
const TALKING_DISPLAY_OFFSET_SEC = 1;

/** Hangup on 2nd leg returns ARI 404 after 1st leg already tore down — treat as OK */
function isChannelAlreadyGone(resOrErr) {
  const msg = JSON.stringify(resOrErr?.message ?? resOrErr ?? "");
  return /channel not found/i.test(msg) || /ARI 404/i.test(msg);
}

/** Parse creationtime e.g. "2026-03-12T10:55:20.580+0530" to Date */
function parseCreationTime(iso) {
  if (!iso || typeof iso !== "string") return null;
  // Java-style offset +0530 → +05:30 for ISO parsing
  const normalized = iso.replace(
    /([+-])(\d{2})(\d{2})$/,
    (_, s, h, m) => `${s}${h}:${m}`,
  );
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Stable key per call instance (new call = new channel ids) */
function callInstanceKey(ch) {
  const ids = ch._mergedChannelIds?.length
    ? [...ch._mergedChannelIds]
    : ch.id
      ? [ch.id]
      : [];
  if (!ids.length) return "";
  return [...ids].sort().join(",");
}

/** Persist talking start across route changes (ref is lost on unmount) */
const TALKING_START_STORAGE_KEY = "activeCallsTalkingStarts";

function loadTalkingStartsPersisted() {
  try {
    const raw = sessionStorage.getItem(TALKING_START_STORAGE_KEY);
    if (!raw) return {};
    const o = JSON.parse(raw);
    return o && typeof o === "object" ? o : {};
  } catch {
    return {};
  }
}

function saveTalkingStartsPersisted(obj) {
  try {
    sessionStorage.setItem(TALKING_START_STORAGE_KEY, JSON.stringify(obj));
  } catch {
    /* quota or private mode */
  }
}

/**
 * Format elapsed as H:MM:SS from Date or timestamp ms.
 * offsetSec: subtract from elapsed (e.g. align GUI with phone timer).
 */
function formatDuration(startDateOrMs, offsetSec = 0) {
  if (startDateOrMs == null) return "0:00:00";
  const t =
    typeof startDateOrMs === "number"
      ? startDateOrMs
      : (startDateOrMs.getTime?.() ?? 0);
  if (!t) return "0:00:00";
  const rawSec = Math.floor((Date.now() - t) / 1000);
  const sec = Math.max(0, rawSec - (offsetSec | 0));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Map API state to display label */
function stateLabel(state) {
  if (!state) return "—";
  const u = String(state).toLowerCase();
  if (u === "up") return "Talking";
  if (u === "ring") return "Ringing";
  if (u === "ringing") return "Ringing";
  return state;
}

/**
 * ARI returns one channel per leg (1005→1004 and 1004→1005). Same call → same
 * unordered pair of numbers. Merge into one card and hang up all legs.
 */
function normalizeEndpoint(n) {
  return String(n || "").trim();
}

/** Stable key for two-party call: sorted numbers joined. Single unknown → no merge. */
function callPairKey(ch) {
  const a = normalizeEndpoint(ch.caller?.number);
  const b = normalizeEndpoint(ch.connected?.number);
  if (!a || !b) return null;
  if (a === b) return null; // same both sides, don't merge with others by pair
  return [a, b].sort().join("\u0000");
}

/**
 * Merge channels that share the same two endpoints (reciprocal legs).
 * Uses earliest creationtime across legs so duration starts from first leg, not second.
 */
function mergeCallLegs(list) {
  if (!Array.isArray(list) || list.length <= 1) return list;

  const byKey = new Map();
  const noKey = [];

  for (const ch of list) {
    const key = callPairKey(ch);
    if (!key) {
      noKey.push(ch);
      continue;
    }
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push(ch);
  }

  const merged = [];
  for (const [, group] of byKey) {
    if (group.length === 1) {
      merged.push(group[0]);
      continue;
    }
    // Same pair, multiple legs → one logical call
    const dates = group
      .map((ch) => ({ ch, d: parseCreationTime(ch.creationtime) }))
      .filter((x) => x.d);
    const earliest = dates.length
      ? dates.reduce((min, x) => (x.d < min.d ? x : min), dates[0])
      : null;
    const primary = earliest ? earliest.ch : group[0];
    const channelIds = group.map((c) => c.id).filter(Boolean);
    merged.push({
      ...primary,
      _mergedChannelIds: channelIds,
      _mergedCreationTime: earliest
        ? earliest.d
        : parseCreationTime(primary.creationtime),
    });
  }

  return [...merged, ...noKey];
}

/**
 * Build a display line like external_wan/+number from channel name + caller
 */
function channelDisplayLine(channel) {
  const name = channel?.name || "";
  const callerNum = channel?.caller?.number || "";
  const ctx = channel?.dialplan?.context || "";
  // SS-style first line: external_wan/+number when context + caller present
  if (ctx && callerNum) {
    return `${ctx}/${callerNum}`;
  }
  if (name.startsWith("PJSIP/")) {
    const part = name.split("/")[1] || "";
    const endpoint = part.split("-")[0] || part;
    if (callerNum && callerNum !== endpoint) return `${endpoint}/${callerNum}`;
    return callerNum || name;
  }
  return callerNum || name || "—";
}

const ActiveCallsPage = () => {
  const [channels, setChannels] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);
  const [hangupChannelId, setHangupChannelId] = useState(null);
  const mounted = useRef(true);
  const silentRefreshRef = useRef(false);
  /** When we first saw this call as Up — creationtime is dial start, not answer */
  const talkingStartedAtRef = useRef(new Map());

  const showAlert = (text) => window.alert(text);

  const handleHangup = async (channelIdOrIds) => {
    const ids = Array.isArray(channelIdOrIds)
      ? channelIdOrIds.filter(Boolean)
      : channelIdOrIds
        ? [channelIdOrIds]
        : [];
    if (ids.length === 0) return;
    const key = ids.join(",");
    setHangupChannelId(key);
    try {
      // Hang up each leg; first success often destroys the other leg → next call gets 404
      let hardFailure = null;
      for (const id of ids) {
        try {
          const res = await ariHangup(id);
          if (res?.response !== false) break; // success
          if (isChannelAlreadyGone(res)) continue; // already gone, try next or refresh
          hardFailure = res?.message || "Hangup failed.";
          break;
        } catch (e) {
          if (isChannelAlreadyGone(e)) continue;
          hardFailure = e?.message || String(e) || "Hangup failed.";
          break;
        }
      }
      if (hardFailure) {
        showAlert(hardFailure);
        return;
      }
      await loadChannels(true);
    } catch (e) {
      if (!isChannelAlreadyGone(e)) {
        showAlert(e?.message || String(e) || "Hangup failed.");
      } else {
        await loadChannels(true);
      }
    } finally {
      setHangupChannelId(null);
    }
  };

  const loadChannels = useCallback(async (silent = false) => {
    if (silent) {
      if (silentRefreshRef.current) return;
      silentRefreshRef.current = true;
    } else {
      setIsRefreshing(true);
    }

    try {
      const res = await fetchAriChannels();
      if (!mounted.current) return;
      const list = Array.isArray(res?.message) ? res.message : [];
      const merged = mergeCallLegs(list);
      // Timer from first poll where state is Up; persist in sessionStorage so
      // navigating away and back does not reset (ref is recreated on remount).
      const map = talkingStartedAtRef.current;
      const persisted = loadTalkingStartsPersisted();
      const currentKeys = new Set();
      for (const ch of merged) {
        const key = callInstanceKey(ch);
        if (!key) continue;
        currentKeys.add(key);
        const isUp = String(ch.state || "").toLowerCase() === "up";
        if (isUp && !map.has(key)) {
          const stored = persisted[key];
          if (typeof stored === "number" && stored > 0) {
            map.set(key, stored);
          } else {
            const now = Date.now();
            map.set(key, now);
            persisted[key] = now;
          }
        }
      }
      for (const k of Object.keys(persisted)) {
        if (!currentKeys.has(k)) delete persisted[k];
      }
      for (const k of [...map.keys()]) {
        if (!currentKeys.has(k)) map.delete(k);
      }
      saveTalkingStartsPersisted(persisted);
      setChannels(merged);
      setError(null);
      setHasLoaded(true);
    } catch (e) {
      if (!mounted.current) return;
      if (!silent) {
        setError(e?.message || "Failed to load active calls");
        setChannels([]);
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
    mounted.current = true;
    loadChannels(false);
    const pollId = setInterval(() => loadChannels(true), POLL_MS);
    return () => {
      mounted.current = false;
      clearInterval(pollId);
    };
  }, [loadChannels]);

  // Re-render duration every second
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), TICK_MS);
    return () => clearInterval(id);
  }, []);

  // Always reserve two columns on desktop so one card keeps same size
  const gridClass = "grid-cols-1 md:grid-cols-2";

  return (
    <div
      className="min-h-full w-full flex flex-col justify-start"
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
            Active Calls
          </span>
        </div>

        {/* Main card */}
        <div
          className="w-full max-w-full overflow-hidden"
          style={{
            backgroundColor: C.cardBg,
            border: `1.5px solid ${C.cardBorder}`,
            borderRadius: CARD_RADIUS,
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
              {hasLoaded && channels.length > 0 && (
                <span
                  style={{
                    background: "#eff6ff",
                    color: C.accent,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "5px 12px",
                    borderRadius: 999,
                    border: `1px solid ${C.accent}`,
                  }}
                >
                  {channels.length} active
                </span>
              )}
            </div>
            <Btn
              variant="cancel"
              onClick={() => loadChannels(false)}
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

          {/* Body */}
          <div
            className="min-h-[200px]"
            style={{ padding: "14px 16px 16px" }}
          >
            {error && (
              <div
                style={{
                  textAlign: "center",
                  color: C.errorRed,
                  fontSize: 13,
                  padding: "32px 0",
                }}
              >
                {error}
              </div>
            )}

            {/* Empty state */}
            {!error && hasLoaded && channels.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="text-5xl mb-4">📞</div>
                <div
                  className="text-lg font-semibold"
                  style={{ color: C.valueText }}
                >
                  No Active Calls
                </div>
                <div className="text-sm mt-1" style={{ color: C.mutedText }}>
                  No ongoing calls right now
                </div>
              </div>
            )}

            {/* Initial load */}
            {!error && !hasLoaded && channels.length === 0 && (
              <div className="flex justify-center py-12">
                <CircularProgress size={32} sx={{ color: C.accent }} />
              </div>
            )}

            {/* Active calls */}
            {!error && channels.length > 0 && (
          <div className={`grid gap-4 ${gridClass}`}>
            {channels.map((ch) => {
              const callerNum = ch.caller?.number || "";
              const connectedNum = ch.connected?.number || "";
              const callerName = ch.caller?.name || "";
              const connectedName = ch.connected?.name || "";

              const instanceKey = callInstanceKey(ch);

              const isUp =
                String(ch.state || "").toLowerCase() === "up";

              const talkingStartMs =
                isUp && instanceKey
                  ? talkingStartedAtRef.current.get(instanceKey)
                  : null;

              const duration = isUp
                ? formatDuration(
                    talkingStartMs ??
                      ch._mergedCreationTime ??
                      parseCreationTime(ch.creationtime),
                    TALKING_DISPLAY_OFFSET_SEC
                  )
                : "0:00:00";

              const hangupIds = ch._mergedChannelIds?.length
                ? ch._mergedChannelIds
                : ch.id
                ? [ch.id]
                : [];

              const hangupKey = hangupIds.join(",");

              const status = stateLabel(ch.state);

              const topLine = channelDisplayLine(ch);

              const mainNumber =
                callerNum || callerName || "—";

              const extNumber =
                connectedNum || connectedName || "";

              return (
                <div
                  key={
                    hangupKey ||
                    ch.id ||
                    ch.protocol_id ||
                    Math.random()
                  }
                  className="flex items-stretch min-w-0 overflow-hidden"
                  style={{
                    backgroundColor: C.cardBg,
                    borderRadius: CARD_RADIUS,
                    border: `1px solid ${C.cardBorder}`,
                    boxShadow: "0 2px 10px rgba(15,23,42,0.04)",
                  }}
                >
                  {/* Left Icon */}
                  <div className="flex items-center pl-4 pr-3 py-4 shrink-0">
                    <PersonOutlineIcon
                      sx={{ color: C.mutedText }}
                      style={{ fontSize: 38 }}
                    />
                  </div>

                  {/* Center Content */}
                  <div className="flex-1 min-w-0 py-4 pr-3 flex flex-col justify-center gap-1">
                    <div
                      className="text-sm leading-snug break-all"
                      style={{ color: C.valueText }}
                    >
                      {topLine}
                    </div>

                    <div
                      className="text-sm font-semibold truncate"
                      style={{ color: C.accent }}
                    >
                      {mainNumber}
                    </div>

                    <div className="flex items-center gap-1 mt-1">
                      <KeyboardArrowDownIcon
                        sx={{ color: C.labelText }}
                        className="shrink-0"
                        style={{ fontSize: 18 }}
                      />

                      <span className="text-sm" style={{ color: C.valueText }}>
                        {extNumber || "—"}
                      </span>
                    </div>
                  </div>

                  {/* Right Section */}
                  <div
                    className="flex flex-col items-end justify-between py-4 pl-3 pr-4 min-w-[110px] shrink-0 border-l"
                    style={{ borderColor: C.cardBorderSoft }}
                  >
                    <div
                      className="flex items-center gap-1 text-sm font-semibold"
                      style={{ color: C.accent }}
                    >
                      <span className="text-sm font-semibold">
                        {status}
                      </span>

                      <ArrowForwardIcon
                        style={{ fontSize: 16 }}
                      />
                    </div>

                    <div
                      className="text-sm font-mono my-1"
                      style={{ color: C.valueText }}
                    >
                      {duration}
                    </div>

                    <div className="flex items-center gap-1 mt-auto">
                      <HeadsetMicIcon
                        sx={{ color: C.labelText }}
                        style={{ fontSize: 20 }}
                      />

                      <Tooltip title="Hang up">
                        <span>
                          <IconButton
                            size="small"
                            aria-label="Hang up"
                            disabled={
                              hangupIds.length === 0 ||
                              hangupChannelId === hangupKey
                            }
                            onClick={() =>
                              handleHangup(hangupIds)
                            }
                            sx={{
                              color: C.errorRed,
                              padding: "2px",
                            }}
                          >
                            {hangupChannelId ===
                            hangupKey ? (
                              <CircularProgress
                                size={18}
                                sx={{
                                  color: C.errorRed,
                                }}
                              />
                            ) : (
                              <CallEndIcon
                                style={{ fontSize: 20 }}
                              />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ActiveCallsPage;
