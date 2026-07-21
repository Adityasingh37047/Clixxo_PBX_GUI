import { useCallback, useEffect, useRef, useState } from "react";
import { fetchCallQueueActivity } from "../../../../api/apiService";
import { ACTIVE_CALL_QUEUE_POLL_INTERVAL_MS } from "../../../../constants/ActiveCallQueueConstants";

export const useActiveCallQueuePage = () => {
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
    pollRef.current = setInterval(() => loadActivity(true), ACTIVE_CALL_QUEUE_POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, [loadActivity]);
  return { showStats, setShowStats, queueList, selectedQueue, setSelectedQueue, hasLoaded, isRefreshing, error, setError, lastUpdated, loadActivity };
};
