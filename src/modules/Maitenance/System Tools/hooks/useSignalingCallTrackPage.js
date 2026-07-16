import { useEffect, useRef, useState, useCallback } from "react";
import { postAsteriskCLI, postLinuxCmd } from "../../../../api/apiService";
import {
  SIGNALING_CALL_TRACK_POLL_MS,
  SIGNALING_CALL_TRACK_MESSAGES,
  SIGNALING_CALL_TRACK_ASTERISK_COMMANDS,
  SIGNALING_CALL_TRACK_LINUX_COMMANDS,
  SIGNALING_CALL_TRACK_TOAST_DEFAULT,
  SIGNALING_CALL_TRACK_TOAST_DURATION_MS,
} from "../../../../constants/SignalingCallTrackConstants";
import {
  extractCmdOutput,
  applyTrackFilter,
  resolveAsteriskLogPath,
  appendRawMessage,
  getTrackDownloadFilename,
  triggerTextFileDownload,
  canApplyTrackFilter,
} from "../utils/SignalingCallTrackTransformers";
import {
  canStartCallTrack,
  canStopCallTrack,
  hasTrackData,
} from "../utils/SignalingCallTrackValidators";

export function useSignalingCallTrackPage() {
  const outputRef = useRef(null);
  const [filterType, setFilterType] = useState("caller");
  const [filterValue, setFilterValue] = useState("0");
  const [trackMessage, setTrackMessage] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(SIGNALING_CALL_TRACK_TOAST_DEFAULT);

  const rawMessageRef = useRef("");
  const logPathRef = useRef("");
  const lineCountRef = useRef(0);
  const pollRef = useRef(null);
  const appliedFilterRef = useRef({ type: "none", value: "" });
  const isTrackingRef = useRef(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(
      () => setToast(SIGNALING_CALL_TRACK_TOAST_DEFAULT),
      SIGNALING_CALL_TRACK_TOAST_DURATION_MS,
    );
  };

  useEffect(() => {
    isTrackingRef.current = isTracking;
  }, [isTracking]);

  useEffect(() => {
    if (!outputRef.current || !trackMessage) return;
    outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [trackMessage]);

  const refreshDisplay = useCallback(() => {
    const { type, value } = appliedFilterRef.current;
    setTrackMessage(applyTrackFilter(rawMessageRef.current, type, value));
  }, []);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const pollLogChunk = useCallback(async () => {
    const logPath = logPathRef.current;
    if (!logPath) return;

    try {
      const wcRes = await postLinuxCmd({
        cmd: SIGNALING_CALL_TRACK_LINUX_COMMANDS.GET_LINE_COUNT(logPath),
      });
      const lineCount = parseInt(extractCmdOutput(wcRes), 10) || 0;
      if (lineCount <= lineCountRef.current) return;

      const newLines = lineCount - lineCountRef.current;
      const tailRes = await postLinuxCmd({
        cmd: SIGNALING_CALL_TRACK_LINUX_COMMANDS.TAIL_LINES(newLines, logPath),
      });
      const chunk = extractCmdOutput(tailRes);
      lineCountRef.current = lineCount;

      if (chunk) {
        rawMessageRef.current = appendRawMessage(rawMessageRef.current, chunk);
        refreshDisplay();
      }
    } catch (error) {
      console.error("Call track poll error:", error);
    }
  }, [refreshDisplay]);

  const runAsteriskCmd = async (command) => {
    const res = await postAsteriskCLI({ command });
    if (!res?.response) {
      throw new Error(res?.message || `Failed: ${command}`);
    }
    return extractCmdOutput(res);
  };

  const handleStart = async () => {
    if (!canStartCallTrack(busy, isTracking)) return;
    setBusy(true);
    try {
      const logPath = await resolveAsteriskLogPath(postLinuxCmd);
      logPathRef.current = logPath;

      const wcRes = await postLinuxCmd({
        cmd: SIGNALING_CALL_TRACK_LINUX_COMMANDS.GET_LINE_COUNT(logPath),
      });
      lineCountRef.current = parseInt(extractCmdOutput(wcRes), 10) || 0;

      await runAsteriskCmd(SIGNALING_CALL_TRACK_ASTERISK_COMMANDS.LOGGER_ON);

      stopPolling();
      pollRef.current = setInterval(() => {
        pollLogChunk();
      }, SIGNALING_CALL_TRACK_POLL_MS);

      await pollLogChunk();
      setIsTracking(true);
      showToast(SIGNALING_CALL_TRACK_MESSAGES.START_SUCCESS, "success");
    } catch (error) {
      console.error("Start call track error:", error);
      stopPolling();
      setIsTracking(false);
      showToast(
        error.message || SIGNALING_CALL_TRACK_MESSAGES.START_FAILED,
        "error",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleStop = async () => {
    if (busy) return;
    setBusy(true);
    try {
      stopPolling();
      try {
        await runAsteriskCmd(
          SIGNALING_CALL_TRACK_ASTERISK_COMMANDS.LOGGER_OFF,
        );
      } catch (error) {
        console.warn("pjsip set logger off:", error);
      }
      setIsTracking(false);
      showToast(SIGNALING_CALL_TRACK_MESSAGES.STOP_SUCCESS, "success");
    } catch (error) {
      console.error("Stop call track error:", error);
      showToast(
        error.message || SIGNALING_CALL_TRACK_MESSAGES.STOP_FAILED,
        "error",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleFilter = () => {
    appliedFilterRef.current = {
      type: filterType,
      value: filterValue.trim(),
    };
    refreshDisplay();
    if (filterType === "none" || !filterValue.trim()) {
      showToast(SIGNALING_CALL_TRACK_MESSAGES.FILTER_CLEARED, "info");
    } else {
      showToast(
        SIGNALING_CALL_TRACK_MESSAGES.FILTER_APPLIED(
          filterType,
          filterValue.trim(),
        ),
        "success",
      );
    }
  };

  const handleClear = () => {
    rawMessageRef.current = "";
    setTrackMessage("");
    if (isTracking) {
      postLinuxCmd({
        cmd: SIGNALING_CALL_TRACK_LINUX_COMMANDS.GET_LINE_COUNT(
          logPathRef.current,
        ),
      })
        .then((res) => {
          lineCountRef.current = parseInt(extractCmdOutput(res), 10) || 0;
        })
        .catch(() => {});
    }
    showToast(SIGNALING_CALL_TRACK_MESSAGES.CLEAR_SUCCESS, "info");
  };

  const handleDownload = () => {
    const content = trackMessage || rawMessageRef.current;
    if (!content.trim()) {
      showToast(SIGNALING_CALL_TRACK_MESSAGES.DOWNLOAD_EMPTY, "warning");
      return;
    }
    triggerTextFileDownload(content, getTrackDownloadFilename());
    showToast(SIGNALING_CALL_TRACK_MESSAGES.DOWNLOAD_SUCCESS, "success");
  };

  useEffect(() => {
    return () => {
      stopPolling();
      if (isTrackingRef.current) {
        postAsteriskCLI({
          command: SIGNALING_CALL_TRACK_ASTERISK_COMMANDS.LOGGER_OFF,
        }).catch(() => {});
      }
    };
  }, [stopPolling]);

  const hasTrackDataValue = hasTrackData(trackMessage);
  const canFilter = canApplyTrackFilter(filterType, filterValue);

  return {
    outputRef,
    filterType,
    setFilterType,
    filterValue,
    setFilterValue,
    trackMessage,
    isTracking,
    busy,
    toast,
    setToast,
    handleStart,
    handleStop,
    handleFilter,
    handleClear,
    handleDownload,
    hasTrackData: hasTrackDataValue,
    canFilter,
    canStart: canStartCallTrack(busy, isTracking),
    canStop: canStopCallTrack(busy, isTracking),
  };
}
