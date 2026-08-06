import { useCallback, useEffect, useRef, useState } from "react";
import axiosInstance from "../../../../api/axiosInstance";
import { monitorBoth } from "../../../../api/apiService";
import {
  HA_CONFIG_INITIAL_FORM,
} from "../../../../constants/HaConfigConstants";
import {
  HA_STATUS_LOAD_FAILED,
  HA_STATUS_REFRESH_INTERVAL_MS,
} from "../../../../constants/HaStatusConstants";
import {
  buildHaStatusFromConfig,
  mapApiHaStatus,
  readHaConfigFromStorage,
} from "../utils/HaStatusTransformers";

const fetchHaStatusApi = async () => {
  const res = await axiosInstance.get("/get-ha-status");
  if (res.data?.response === false) {
    throw new Error(res.data?.message || HA_STATUS_LOAD_FAILED);
  }
  return res.data?.data ?? res.data ?? {};
};

export function useHaStatusPage() {
  const [haEnabled, setHaEnabled] = useState(false);
  const [status, setStatus] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const silentRefreshRef = useRef(false);

  const loadData = useCallback(async (silent = false) => {
    if (silent) {
      if (silentRefreshRef.current) return;
      silentRefreshRef.current = true;
    } else {
      setIsRefreshing(true);
    }

    setError("");
    try {
      const stored = readHaConfigFromStorage();
      const config = {
        ...HA_CONFIG_INITIAL_FORM,
        ...stored,
      };
      if (!config.interface || config.interface === "0.0.0.0") {
        config.interface = "";
      }
      const enabled = Boolean(config.haEnabled);
      setHaEnabled(enabled);

      let monitor = { extensions: [], trunks: [] };
      if (enabled) {
        try {
          const res = await monitorBoth();
          monitor = {
            extensions: res?.message?.extensions ?? [],
            trunks: res?.message?.trunks ?? [],
          };
        } catch {
          /* monitor optional for HA status */
        }
      }

      if (!enabled) {
        setStatus(null);
        setLastUpdated(new Date());
        return;
      }

      try {
        const apiData = await fetchHaStatusApi();
        setStatus(mapApiHaStatus(apiData, config, monitor));
      } catch {
        setStatus(buildHaStatusFromConfig(config, monitor));
      }

      setLastUpdated(new Date());
    } catch (e) {
      if (!silent) {
        setError(e?.message || HA_STATUS_LOAD_FAILED);
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
    const interval = setInterval(
      () => loadData(true),
      HA_STATUS_REFRESH_INTERVAL_MS,
    );
    return () => clearInterval(interval);
  }, [loadData]);

  return {
    haEnabled,
    status,
    lastUpdated,
    isRefreshing,
    error,
    loadData,
  };
}
