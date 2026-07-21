import { useCallback, useEffect, useRef, useState } from "react";
import { ariHangup, fetchAriChannels } from "../../../../api/apiService";
import {
  ACTIVE_CALLS_POLL_MS,
  ACTIVE_CALLS_TICK_MS,
} from "../../../../constants/ActiveCallsConstants";
import {
  callInstanceKey,
  isChannelAlreadyGone,
  loadTalkingStartsPersisted,
  mergeCallLegs,
  saveTalkingStartsPersisted,
} from "../utils/ActiveCallsTransformers";

export function useActiveCallsPage() {
  const [channels, setChannels] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [, setTick] = useState(0);
  const [hangupChannelId, setHangupChannelId] = useState(null);
  const mounted = useRef(true);
  const silentRefreshRef = useRef(false);
  /** When we first saw this call as Up — creationtime is dial start, not answer */
  const talkingStartedAtRef = useRef(new Map());

  const showAlert = (text) => window.alert(text);

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
      } else if (mounted.current) {
        setIsRefreshing(false);
      }
    }
  }, []);

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

  useEffect(() => {
    mounted.current = true;
    loadChannels(false);
    const pollId = setInterval(() => loadChannels(true), ACTIVE_CALLS_POLL_MS);
    return () => {
      mounted.current = false;
      clearInterval(pollId);
    };
  }, [loadChannels]);

  // Re-render duration every second
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), ACTIVE_CALLS_TICK_MS);
    return () => clearInterval(id);
  }, []);

  return {
    channels,
    hasLoaded,
    isRefreshing,
    error,
    setError: (value) => setError(value),
    hangupChannelId,
    talkingStartedAtRef,
    loadChannels,
    handleHangup,
  };
}
