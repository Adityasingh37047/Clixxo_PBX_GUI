import { useEffect, useState } from "react";
import {
  systemRestart,
  servicePing,
  serviceRestart,
  fetchSystemInfo,
} from "../../../../api/apiService";
import {
  RESTART_CONFIRM,
  RESTART_MESSAGES,
  RESTART_DEFAULT_TOAST,
  RESTART_TOAST_DURATION_MS,
  RESTART_ERROR_HIDE_MS,
  RESTART_TIMINGS,
} from "../../../../constants/RestartConstants";
import {
  extractDeviceIpsFromSystemInfo,
  getPingTargets,
  buildServicePingUrl,
  buildLoginUrl,
  isRestartConnectionError,
  mapServiceRestartError,
} from "../utils/RestartTransformers";
import { shouldConfirmRestart } from "../utils/RestartValidators";

export function useRestartPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(RESTART_DEFAULT_TOAST);
  const [loadingType, setLoadingType] = useState("");
  const [progressMessage, setProgressMessage] = useState("");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(
      () => setToast(RESTART_DEFAULT_TOAST),
      RESTART_TOAST_DURATION_MS,
    );
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), RESTART_ERROR_HIDE_MS);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const getDeviceIPs = async () => {
    try {
      const sysInfo = await fetchSystemInfo();
      return extractDeviceIpsFromSystemInfo(sysInfo);
    } catch (err) {
      console.error("Error getting device IPs:", err);
      return { lan1Ip: null, lan2Ip: null };
    }
  };

  const pingDeviceAt = async (ip) => {
    const url = buildServicePingUrl(ip);
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      RESTART_TIMINGS.pingTimeoutMs,
    );
    try {
      const res = await fetch(url, {
        method: "GET",
        credentials: "include",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) return true;
      if (res.status === 401 || res.status === 403) return true;
      return false;
    } catch {
      clearTimeout(timeoutId);
      return false;
    }
  };

  const pingAllTargets = async (targetIps) => {
    for (const ip of targetIps) {
      const ok = await pingDeviceAt(ip);
      if (ok) return { success: true, respondedIp: ip };
    }
    if (targetIps.length === 0) {
      try {
        const res = await servicePing();
        if (res?.response)
          return { success: true, respondedIp: window.location.hostname };
        return { success: false, respondedIp: null };
      } catch (err) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          return { success: true, respondedIp: window.location.hostname };
        }
        return { success: false, respondedIp: null };
      }
    }
    return { success: false, respondedIp: null };
  };

  const handleRestart = async (sectionKey) => {
    if (sectionKey === "system") {
      const confirmed = window.confirm(RESTART_CONFIRM.system);
      if (!shouldConfirmRestart(sectionKey, confirmed)) return;
    } else if (sectionKey === "service") {
      const confirmed = window.confirm(RESTART_CONFIRM.service);
      if (!shouldConfirmRestart(sectionKey, confirmed)) return;
    }
    setError("");
    if (sectionKey === "system") {
      setLoading(true);
      setLoadingType("system");
      setProgressMessage(RESTART_MESSAGES.systemRestarting);
      let pingTargets = [];
      try {
        const ips = await getDeviceIPs();
        pingTargets = getPingTargets(ips.lan1Ip, ips.lan2Ip);
        try {
          await systemRestart();
        } catch (apiError) {
          const { is500, isConnectionError, status } =
            isRestartConnectionError(apiError);
          if (is500 || isConnectionError) {
            // Assume reboot was initiated
          } else {
            console.error("System restart API error:", apiError);
            let errorMessage = RESTART_MESSAGES.systemRestartFailed;
            if (status === 401 || status === 403)
              errorMessage = RESTART_MESSAGES.permissionDenied;
            else if (status === 404)
              errorMessage = RESTART_MESSAGES.endpointNotFound;
            else if (apiError.message) errorMessage = apiError.message;
            setError(errorMessage);
            setLoading(false);
            setLoadingType("");
            setProgressMessage("");
            return;
          }
        }
        setProgressMessage(RESTART_MESSAGES.waitingOnline);
        setTimeout(async () => {
          let result = { success: false, respondedIp: null };
          for (let i = 0; i < RESTART_TIMINGS.maxPollAttempts; i++) {
            try {
              result = await pingAllTargets(pingTargets);
              if (result.success) break;
            } catch {
              // continue
            }
            await new Promise((res) =>
              setTimeout(res, RESTART_TIMINGS.pollIntervalMs),
            );
          }
          if (result.success) {
            setProgressMessage(RESTART_MESSAGES.backOnline);
            const loginUrl = buildLoginUrl(result.respondedIp);
            setTimeout(() => {
              window.location.href = loginUrl;
            }, RESTART_TIMINGS.redirectDelayMs);
          } else {
            setLoading(false);
            setLoadingType("");
            setProgressMessage("");
            setError(RESTART_MESSAGES.deviceOffline);
          }
        }, RESTART_TIMINGS.pollInitialDelayMs);
      } catch (err) {
        console.error("System restart error:", err);
        setError(RESTART_MESSAGES.deviceInfoFailed);
        setLoading(false);
        setLoadingType("");
        setProgressMessage("");
      }
    } else if (sectionKey === "service") {
      setLoading(true);
      setLoadingType("service");
      setProgressMessage(RESTART_MESSAGES.restartingService);
      try {
        await serviceRestart();
        setLoading(false);
        setLoadingType("");
        setProgressMessage("");
        showToast(RESTART_MESSAGES.serviceRestartSuccess);
      } catch (err) {
        console.error("Service restart error:", err);
        setError(mapServiceRestartError(err));
        setLoading(false);
        setLoadingType("");
        setProgressMessage("");
      }
    }
  };

  return {
    loading,
    error,
    setError,
    toast,
    setToast,
    loadingType,
    progressMessage,
    handleRestart,
  };
}
