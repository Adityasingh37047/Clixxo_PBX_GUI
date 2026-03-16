import React, { useState, useEffect, useCallback, useRef } from 'react';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import CallEndIcon from '@mui/icons-material/CallEnd';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RefreshIcon from '@mui/icons-material/Refresh';
import { IconButton, CircularProgress, Tooltip } from '@mui/material';
import { fetchAriChannels, ariHangup } from '../api/apiService';

// 1s poll so "Talking" timer starts within ~1s of answer (was ~3s with 3s poll)
const POLL_MS = 1000;
const TICK_MS = 1000;

/**
 * Phone often shows 1s less than our timer (we mark Up slightly before phone counts,
 * or phone starts on media). Subtract this many seconds from displayed talking time.
 */
const TALKING_DISPLAY_OFFSET_SEC = 1;

/** Hangup on 2nd leg returns ARI 404 after 1st leg already tore down — treat as OK */
function isChannelAlreadyGone(resOrErr) {
  const msg = JSON.stringify(resOrErr?.message ?? resOrErr ?? '');
  return /channel not found/i.test(msg) || /ARI 404/i.test(msg);
}

/** Parse creationtime e.g. "2026-03-12T10:55:20.580+0530" to Date */
function parseCreationTime(iso) {
  if (!iso || typeof iso !== 'string') return null;
  // Java-style offset +0530 → +05:30 for ISO parsing
  const normalized = iso.replace(/([+-])(\d{2})(\d{2})$/, (_, s, h, m) => `${s}${h}:${m}`);
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
  if (!ids.length) return '';
  return [...ids].sort().join(',');
}

/** Persist talking start across route changes (ref is lost on unmount) */
const TALKING_START_STORAGE_KEY = 'activeCallsTalkingStarts';

function loadTalkingStartsPersisted() {
  try {
    const raw = sessionStorage.getItem(TALKING_START_STORAGE_KEY);
    if (!raw) return {};
    const o = JSON.parse(raw);
    return o && typeof o === 'object' ? o : {};
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
  if (startDateOrMs == null) return '0:00:00';
  const t =
    typeof startDateOrMs === 'number'
      ? startDateOrMs
      : startDateOrMs.getTime?.() ?? 0;
  if (!t) return '0:00:00';
  const rawSec = Math.floor((Date.now() - t) / 1000);
  const sec = Math.max(0, rawSec - (offsetSec | 0));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Map API state to display label */
function stateLabel(state) {
  if (!state) return '—';
  const u = String(state).toLowerCase();
  if (u === 'up') return 'Talking';
  if (u === 'ring') return 'Ringing';
  if (u === 'ringing') return 'Ringing';
  return state;
}

/**
 * ARI returns one channel per leg (1005→1004 and 1004→1005). Same call → same
 * unordered pair of numbers. Merge into one card and hang up all legs.
 */
function normalizeEndpoint(n) {
  return String(n || '').trim();
}

/** Stable key for two-party call: sorted numbers joined. Single unknown → no merge. */
function callPairKey(ch) {
  const a = normalizeEndpoint(ch.caller?.number);
  const b = normalizeEndpoint(ch.connected?.number);
  if (!a || !b) return null;
  if (a === b) return null; // same both sides, don't merge with others by pair
  return [a, b].sort().join('\u0000');
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
      _mergedCreationTime: earliest ? earliest.d : parseCreationTime(primary.creationtime),
    });
  }

  return [...merged, ...noKey];
}

/**
 * Build a display line like external_wan/+number from channel name + caller
 */
function channelDisplayLine(channel) {
  const name = channel?.name || '';
  const callerNum = channel?.caller?.number || '';
  const ctx = channel?.dialplan?.context || '';
  // SS-style first line: external_wan/+number when context + caller present
  if (ctx && callerNum) {
    return `${ctx}/${callerNum}`;
  }
  if (name.startsWith('PJSIP/')) {
    const part = name.split('/')[1] || '';
    const endpoint = part.split('-')[0] || part;
    if (callerNum && callerNum !== endpoint) return `${endpoint}/${callerNum}`;
    return callerNum || name;
  }
  return callerNum || name || '—';
}

const ActiveCallsPage = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);
  const [hangupChannelId, setHangupChannelId] = useState(null);
  const mounted = useRef(true);
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
    const key = ids.join(',');
    setHangupChannelId(key);
    try {
      // Hang up each leg; first success often destroys the other leg → next call gets 404
      let hardFailure = null;
      for (const id of ids) {
        try {
          const res = await ariHangup(id);
          if (res?.response !== false) break; // success
          if (isChannelAlreadyGone(res)) continue; // already gone, try next or refresh
          hardFailure = res?.message || 'Hangup failed.';
          break;
        } catch (e) {
          if (isChannelAlreadyGone(e)) continue;
          hardFailure = e?.message || String(e) || 'Hangup failed.';
          break;
        }
      }
      if (hardFailure) {
        showAlert(hardFailure);
        return;
      }
      await loadChannels();
    } catch (e) {
      if (!isChannelAlreadyGone(e)) {
        showAlert(e?.message || String(e) || 'Hangup failed.');
      } else {
        await loadChannels();
      }
    } finally {
      setHangupChannelId(null);
    }
  };

  const loadChannels = useCallback(async () => {
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
        const isUp = String(ch.state || '').toLowerCase() === 'up';
        if (isUp && !map.has(key)) {
          const stored = persisted[key];
          if (typeof stored === 'number' && stored > 0) {
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
    } catch (e) {
      if (!mounted.current) return;
      setError(e?.message || 'Failed to load active calls');
      setChannels([]);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    loadChannels();
    const pollId = setInterval(loadChannels, POLL_MS);
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

  const handleRefresh = () => {
    setLoading(true);
    loadChannels();
  };

  const panelBg = '#fff';
  const titleColor = '#c62828';
  // Light green card like SS (slightly warmer green, soft border)
  const cardBg = '#f1f8f4';
  const cardBorder = '#b8d4c0';

  // Always reserve two columns on desktop so one card keeps the same size
  // as a two-call layout: call2 right of call1, call3 below call1, etc.
  const gridClass = 'grid-cols-1 md:grid-cols-2';

  return (
    <div className="min-h-full w-full flex flex-col justify-start px-4 py-4 md:px-6">
      <div
        className="w-full max-w-full rounded-lg shadow border border-gray-200 overflow-hidden"
        style={{ backgroundColor: panelBg }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h1 className="text-xl font-bold m-0" style={{ color: titleColor }}>
            Active Calls
          </h1>
          <Tooltip title="Refresh">
            <span>
              <IconButton size="small" onClick={handleRefresh} disabled={loading} aria-label="Refresh">
                {loading ? <CircularProgress size={20} /> : <RefreshIcon fontSize="small" />}
              </IconButton>
            </span>
          </Tooltip>
        </div>

        <div className="px-5 pb-6 pt-2 min-h-[200px]">
          {error && (
            <div className="text-center text-red-600 text-sm py-8">{error}</div>
          )}

          {!error && !loading && channels.length === 0 && (
            <div className="flex items-center justify-center py-16 text-gray-500 text-sm">
              No Active Calls
            </div>
          )}

          {!error && channels.length > 0 && (
            <div className={`grid gap-3 ${gridClass}`}>
              {channels.map((ch) => {
                const callerNum = ch.caller?.number || '';
                const connectedNum = ch.connected?.number || '';
                const callerName = ch.caller?.name || '';
                const connectedName = ch.connected?.name || '';
                const instanceKey = callInstanceKey(ch);
                const isUp = String(ch.state || '').toLowerCase() === 'up';
                // Talking: elapsed since we first saw Up (avoids 15s+ offset from creationtime)
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
                  : '0:00:00';
                const hangupIds = ch._mergedChannelIds?.length
                  ? ch._mergedChannelIds
                  : ch.id
                    ? [ch.id]
                    : [];
                const hangupKey = hangupIds.join(',');
                const status = stateLabel(ch.state);
                const topLine = channelDisplayLine(ch);

                // SS layout: icon left | external_wan line + number + arrow+ext | Talking→ + duration + icons
                const mainNumber = callerNum || callerName || '—';
                const extNumber = connectedNum || connectedName || '';

                return (
                  <div
                    key={hangupKey || ch.id || ch.protocol_id || Math.random()}
                    className="rounded-lg border flex items-stretch min-w-0 overflow-hidden"
                    style={{
                      backgroundColor: cardBg,
                      borderColor: cardBorder,
                      borderWidth: 1,
                    }}
                  >
                    {/* Person icon – left edge like SS */}
                    <div className="flex items-center pl-3 pr-2 py-3 shrink-0">
                      <PersonOutlineIcon className="text-gray-400" style={{ fontSize: 36 }} />
                    </div>

                    {/* Center: external_wan line, number, arrow + extension */}
                    <div className="flex-1 min-w-0 py-3 pr-2 flex flex-col justify-center gap-0.5">
                      <div className="text-gray-900 text-sm leading-snug break-all">
                        {topLine}
                      </div>
                      <div className="text-blue-600 text-sm font-medium truncate">
                        {mainNumber}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <KeyboardArrowDownIcon className="text-gray-500 shrink-0" style={{ fontSize: 18 }} />
                        <span className="text-gray-900 text-sm">
                          {extNumber || '—'}
                        </span>
                      </div>
                    </div>

                    {/* Right: Talking + arrow (top), duration, headset + hangup (bottom) */}
                    <div className="flex flex-col items-end justify-between py-3 pl-2 pr-3 min-w-[100px] shrink-0 border-l border-gray-300/40">
                      <div className="flex items-center gap-0.5 text-blue-600">
                        <span className="text-sm font-medium">{status}</span>
                        <ArrowForwardIcon style={{ fontSize: 16 }} />
                      </div>
                      <div className="text-gray-800 text-sm font-mono my-1">{duration}</div>
                      <div className="flex items-center gap-1 mt-auto">
                        <HeadsetMicIcon className="text-gray-600" style={{ fontSize: 20 }} />
                        <Tooltip title="Hang up">
                          <span>
                            <IconButton
                              size="small"
                              aria-label="Hang up"
                              disabled={hangupIds.length === 0 || hangupChannelId === hangupKey}
                              onClick={() => handleHangup(hangupIds)}
                              sx={{ color: '#c62828', padding: '2px' }}
                            >
                              {hangupChannelId === hangupKey ? (
                                <CircularProgress size={18} sx={{ color: '#c62828' }} />
                              ) : (
                                <CallEndIcon style={{ fontSize: 20 }} />
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

          {loading && channels.length === 0 && !error && (
            <div className="flex justify-center py-12">
              <CircularProgress size={32} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveCallsPage;
