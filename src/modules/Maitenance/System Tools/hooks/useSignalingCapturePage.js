import { useEffect, useRef, useState } from "react";
import { fetchSystemInfo, postLinuxCmd } from "../../../../api/apiService";
import {
  SIGNALING_CAPTURE_PCM_OPTIONS,
  SIGNALING_CAPTURE_TS_OPTIONS,
  SIGNALING_CAPTURE_DEFAULTS,
  SIGNALING_CAPTURE_FALLBACK_NETWORK_OPTIONS,
  SIGNALING_CAPTURE_TOAST_DEFAULT,
  SIGNALING_CAPTURE_TOAST_DURATION_MS,
  SIGNALING_CAPTURE_DATA_CAPTURE_PATTERN,
  SIGNALING_CAPTURE_TS_RECORD_PREFIX,
  SIGNALING_CAPTURE_E1_RECORD_PREFIX,
  SIGNALING_CAPTURE_LOG_PATH,
  SIGNALING_CAPTURE_DATA_DIR,
} from "../../../../constants/SignalingCaptureConstants";
import {
  extractCmdOutput,
  getDateStr,
  delay,
  parseTsNumber,
  dahdiChannelFromPcmTs,
  emptySlotSessions,
  buildNetworkOptionsFromSystemInfo,
  resolveCaptureInterfaceName,
  getLanDisplayName,
  buildCaptureFileName,
  buildTcpdumpFilterExpr,
  triggerBlobDownload,
  assembleChunkedBinary,
  decodeBase64Chunk,
  isAnySlotRecording,
  setSlotFlag,
} from "../utils/SignalingCaptureTransformers";
import { isValidPid, isPidRunningStatus } from "../utils/SignalingCaptureValidators";

export function useSignalingCapturePage() {
  const [network, setNetwork] = useState(SIGNALING_CAPTURE_DEFAULTS.NETWORK);
  const [syslogEnabled, setSyslogEnabled] = useState(false);
  const [syslogDest, setSyslogDest] = useState(
    SIGNALING_CAPTURE_DEFAULTS.SYSLOG_DESTINATION,
  );
  const [networkOptions, setNetworkOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [captureProcessId, setCaptureProcessId] = useState(null);
  const [captureFileName, setCaptureFileName] = useState("");
  const [captureStatus, setCaptureStatus] = useState("");
  const [toast, setToast] = useState(SIGNALING_CAPTURE_TOAST_DEFAULT);

  const slotSessionRef = useRef(emptySlotSessions());
  const [slotRecording, setSlotRecording] = useState({
    ts: [false, false],
    e1: [false, false],
  });
  const [slotStopping, setSlotStopping] = useState({
    ts: [false, false],
    e1: [false, false],
  });

  const [ts1Pcm, setTs1Pcm] = useState(SIGNALING_CAPTURE_PCM_OPTIONS[0].value);
  const [ts1Slot, setTs1Slot] = useState(SIGNALING_CAPTURE_TS_OPTIONS[0].value);
  const [ts2Pcm, setTs2Pcm] = useState(SIGNALING_CAPTURE_PCM_OPTIONS[0].value);
  const [ts2Slot, setTs2Slot] = useState(SIGNALING_CAPTURE_TS_OPTIONS[1].value);
  const [e1aPcm, setE1aPcm] = useState(SIGNALING_CAPTURE_PCM_OPTIONS[0].value);
  const [e1aSlot, setE1aSlot] = useState(SIGNALING_CAPTURE_TS_OPTIONS[2].value);
  const [e1bPcm, setE1bPcm] = useState(SIGNALING_CAPTURE_PCM_OPTIONS[0].value);
  const [e1bSlot, setE1bSlot] = useState(SIGNALING_CAPTURE_TS_OPTIONS[3].value);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(
      () => setToast(SIGNALING_CAPTURE_TOAST_DEFAULT),
      SIGNALING_CAPTURE_TOAST_DURATION_MS,
    );
  };

  const anySlotRecording = isAnySlotRecording(slotRecording);
  const dataCaptureLocked = isCapturing || isStopping || anySlotRecording;

  const setSlotRecordingFlag = (section, row, value) => {
    setSlotRecording((prev) => setSlotFlag(prev, section, row, value));
  };

  const setSlotStoppingFlag = (section, row, value) => {
    setSlotStopping((prev) => setSlotFlag(prev, section, row, value));
  };

  const downloadGzFileFromDevice = async (fileName, downloadName) => {
    const gzFile = `${fileName}.gz`;

    const checkRes = await postLinuxCmd({
      cmd: `ls -la '${fileName}' 2>/dev/null || echo FILE_NOT_FOUND`,
    });
    if (extractCmdOutput(checkRes).includes("FILE_NOT_FOUND")) {
      throw new Error("Capture file not found on server.");
    }

    const sizeCheckRes = await postLinuxCmd({
      cmd: `wc -c < '${fileName}' 2>/dev/null || echo 0`,
    });
    const rawSize = parseInt(extractCmdOutput(sizeCheckRes), 10) || 0;
    if (rawSize === 0) {
      throw new Error("Capture file is empty. Generate traffic and try again.");
    }

    const gzRes = await postLinuxCmd({
      cmd: `gzip -c '${fileName}' > '${gzFile}' 2>/dev/null && echo OK || echo FAILED`,
    });
    if (!extractCmdOutput(gzRes).includes("OK")) {
      throw new Error("Failed to compress capture file.");
    }

    const sizeRes = await postLinuxCmd({
      cmd: `wc -c < '${gzFile}' 2>/dev/null || echo 0`,
    });
    const fileSize = parseInt(extractCmdOutput(sizeRes), 10) || 0;
    if (fileSize === 0) {
      throw new Error("Compressed file is empty.");
    }

    const CHUNK_BYTES = 200 * 1024;
    const numChunks = Math.ceil(fileSize / CHUNK_BYTES);
    const binaryParts = [];

    for (let i = 0; i < numChunks; i++) {
      setCaptureStatus(
        `Downloading… ${Math.round(((i + 1) / numChunks) * 100)}%`,
      );
      const chunkRes = await postLinuxCmd({
        cmd: `dd if='${gzFile}' bs=${CHUNK_BYTES} skip=${i} count=1 2>/dev/null | base64`,
      });
      const chunkB64 = extractCmdOutput(chunkRes).replace(/\s+/g, "");
      if (!chunkB64) {
        if (i === numChunks - 1) break;
        throw new Error(
          `Download interrupted at chunk ${i + 1}/${numChunks}.`,
        );
      }
      binaryParts.push(decodeBase64Chunk(chunkB64));
    }

    if (binaryParts.length === 0) {
      throw new Error("No data received from device during download.");
    }

    const byteArray = assembleChunkedBinary(binaryParts);
    triggerBlobDownload(
      new Blob([byteArray], { type: "application/gzip" }),
      downloadName,
    );

    await postLinuxCmd({
      cmd: `rm -f '${fileName}' '${gzFile}' 2>/dev/null || true`,
    });
  };

  const downloadTextFromDevice = async (cmd, downloadName) => {
    const res = await postLinuxCmd({ cmd });
    const text = extractCmdOutput(res);
    if (!text.trim()) {
      throw new Error("No log data found on server.");
    }
    triggerBlobDownload(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
      downloadName,
    );
  };

  const startSlotRecording = async (section, row, pcm, ts, filePrefix) => {
    if (dataCaptureLocked || anySlotRecording) return;

    const channel = dahdiChannelFromPcmTs(pcm, ts);
    const dateStr = getDateStr();
    const fileName = `${SIGNALING_CAPTURE_DATA_DIR}/${filePrefix}_${pcm}_${ts}_${dateStr}.dat`;
    const logPath = `${SIGNALING_CAPTURE_DATA_DIR}/${filePrefix}.log`;

    try {
      await postLinuxCmd({
        cmd: `pkill -f '${filePrefix}' 2>/dev/null || true`,
      });
      await delay(500);

      const cmd = `sh -c "mkdir -p ${SIGNALING_CAPTURE_DATA_DIR}; rm -f '${fileName}'; touch '${fileName}'; chmod 666 '${fileName}' || true; dahdi_monitor ${channel} -f '${fileName}' > /dev/null 2> '${logPath}' < /dev/null & echo \\$!"`;
      const response = await postLinuxCmd({ cmd });

      if (response?.response === false) {
        const logTailRes = await postLinuxCmd({
          cmd: `tail -n 5 '${logPath}' 2>/dev/null || true`,
        });
        const logTail = extractCmdOutput(logTailRes);
        throw new Error(
          `${response?.message || "Failed to start recording."}${logTail ? ` Log: ${logTail}` : ""}`,
        );
      }

      const pid = extractCmdOutput(response);
      if (!isValidPid(pid)) {
        throw new Error(
          `Failed to start recording. Response: ${pid || "(no output)"}`,
        );
      }

      await delay(400);
      const health = await postLinuxCmd({
        cmd: `ps -p ${pid} >/dev/null 2>&1 && echo RUNNING || echo NOT_RUNNING`,
      });
      if (!isPidRunningStatus(extractCmdOutput(health))) {
        const logTailRes = await postLinuxCmd({
          cmd: `tail -n 3 '${logPath}' 2>/dev/null || true`,
        });
        throw new Error(
          `Recording process not running.${extractCmdOutput(logTailRes) ? ` Log: ${extractCmdOutput(logTailRes)}` : ""}`,
        );
      }

      slotSessionRef.current[section][row] = { pid, fileName, filePrefix };
      setSlotRecordingFlag(section, row, true);
      showToast(
        `${section === "ts" ? "TS" : "E1"} recording started (PCM ${pcm}, TS ${parseTsNumber(ts)}).`,
        "success",
      );
    } catch (error) {
      console.error("Start slot recording error:", error);
      showToast(error.message || "Failed to start recording.", "error");
    }
  };

  const stopSlotRecording = async (section, row) => {
    const session = slotSessionRef.current[section][row];
    if (!session || slotStopping[section][row]) return;

    setSlotStoppingFlag(section, row, true);
    const { pid, fileName, filePrefix } = session;

    try {
      setCaptureStatus("Stopping recording…");
      await postLinuxCmd({
        cmd: `kill -TERM ${pid} 2>/dev/null; pkill -TERM -f '${filePrefix}' 2>/dev/null; sleep 2; kill -KILL ${pid} 2>/dev/null; pkill -KILL -f '${filePrefix}' 2>/dev/null; sync`,
      });

      const downloadName = `${filePrefix}_${getDateStr()}.dat.gz`;
      await downloadGzFileFromDevice(fileName, downloadName);
      setCaptureStatus("");
      showToast("Recording downloaded.", "success");
    } catch (error) {
      console.error("Stop slot recording error:", error);
      setCaptureStatus("");
      showToast(error.message || "Failed to stop/download recording.", "error");
      try {
        await postLinuxCmd({
          cmd: `pkill -KILL -f '${filePrefix}' 2>/dev/null || true`,
        });
      } catch (_) {
        // ignore cleanup errors
      }
    } finally {
      slotSessionRef.current[section][row] = null;
      setSlotRecordingFlag(section, row, false);
      setSlotStoppingFlag(section, row, false);
    }
  };

  useEffect(() => {
    const fetchNetworkInterfaces = async () => {
      try {
        setLoading(true);
        const data = await fetchSystemInfo();
        setNetworkOptions(buildNetworkOptionsFromSystemInfo(data));
      } catch (error) {
        console.error("Error fetching network interfaces:", error);
        setNetworkOptions(SIGNALING_CAPTURE_FALLBACK_NETWORK_OPTIONS);
      } finally {
        setLoading(false);
      }
    };

    fetchNetworkInterfaces();
  }, []);

  const handleStartCapture = async () => {
    if (dataCaptureLocked) return;

    try {
      const interfaceName = resolveCaptureInterfaceName(network);
      const dateStr = getDateStr();
      const fileName = buildCaptureFileName(dateStr);
      setCaptureFileName(fileName);

      const filterExpr = buildTcpdumpFilterExpr(syslogEnabled, syslogDest);
      const tcpdumpCmd = `tcpdump -U -i ${interfaceName} -s 0 -w '${fileName}' ${filterExpr ? `'${filterExpr}'` : ""}`;

      await postLinuxCmd({
        cmd: `pkill -f 'tcpdump.*${SIGNALING_CAPTURE_DATA_CAPTURE_PATTERN}' 2>/dev/null || true`,
      });
      await delay(800);

      const cmd = `sh -c "mkdir -p ${SIGNALING_CAPTURE_DATA_DIR}; rm -f '${fileName}'; touch '${fileName}'; chmod 666 '${fileName}' || true; ${tcpdumpCmd} > /dev/null 2> '${SIGNALING_CAPTURE_LOG_PATH}' < /dev/null & echo \\$!"`;
      const response = await postLinuxCmd({ cmd });

      if (response?.response === false) {
        const logTailRes = await postLinuxCmd({
          cmd: `tail -n 5 ${SIGNALING_CAPTURE_LOG_PATH} 2>/dev/null || true`,
        });
        const logTail = extractCmdOutput(logTailRes);
        showToast(
          `Failed to start capture: ${response?.message || "Unknown error"}${logTail ? ` — ${logTail}` : ""}`,
          "error",
        );
        return;
      }

      const pid = extractCmdOutput(response);
      if (isValidPid(pid)) {
        await delay(400);
        const health = await postLinuxCmd({
          cmd: `ps -p ${pid} >/dev/null 2>&1 && echo RUNNING || echo NOT_RUNNING`,
        });
        const status = extractCmdOutput(health);
        const logTailRes = await postLinuxCmd({
          cmd: `tail -n 3 ${SIGNALING_CAPTURE_LOG_PATH} 2>/dev/null || true`,
        });
        const logTail = extractCmdOutput(logTailRes);
        if (!isPidRunningStatus(status)) {
          showToast(
            `Failed to start capture. tcpdump not running.${logTail ? ` ${logTail}` : ""}`,
            "error",
          );
          return;
        }
        setCaptureProcessId(pid);
        setIsCapturing(true);
        showToast(
          `Data capture started on ${getLanDisplayName(network)}.`,
          "success",
        );
      } else {
        showToast(
          `Failed to start data capture. Response: ${pid || "(no output)"}`,
          "error",
        );
      }
    } catch (error) {
      console.error("Error starting data capture:", error);
      showToast("Error starting data capture. Please try again.", "error");
    }
  };

  const handleStopCapture = async () => {
    if (isStopping) return;
    setIsStopping(true);

    try {
      setCaptureStatus("Stopping capture…");
      const pidTerm = captureProcessId
        ? `kill -TERM ${captureProcessId} 2>/dev/null; `
        : "";
      const pidKill = captureProcessId
        ? `kill -KILL ${captureProcessId} 2>/dev/null; `
        : "";
      await postLinuxCmd({
        cmd: `${pidTerm}pkill -TERM -f 'tcpdump.*${SIGNALING_CAPTURE_DATA_CAPTURE_PATTERN}' 2>/dev/null; sleep 2; ${pidKill}pkill -KILL -f 'tcpdump.*${SIGNALING_CAPTURE_DATA_CAPTURE_PATTERN}' 2>/dev/null; sync`,
      });

      const pktRes = await postLinuxCmd({
        cmd: `tcpdump -n -q -r '${captureFileName}' -c 1 2>/dev/null | wc -l`,
      });
      const pktCount = parseInt(extractCmdOutput(pktRes), 10) || 0;
      if (pktCount === 0) {
        showToast(
          "Capture stopped but no packets were recorded. Try All LAN, disable Syslog filter, generate traffic, then capture again.",
          "warning",
        );
        await postLinuxCmd({
          cmd: `rm -f '${captureFileName}' '${captureFileName}.gz' '${SIGNALING_CAPTURE_LOG_PATH}' 2>/dev/null || true`,
        });
        return;
      }

      await downloadGzFileFromDevice(
        captureFileName,
        `${SIGNALING_CAPTURE_DATA_CAPTURE_PATTERN}_${getDateStr()}.pcap.gz`,
      );
      await postLinuxCmd({
        cmd: `rm -f '${SIGNALING_CAPTURE_LOG_PATH}' 2>/dev/null || true`,
      });
      setCaptureStatus("");
      showToast(
        "Download complete. Open the .pcap.gz file in Wireshark.",
        "success",
      );
    } catch (error) {
      console.error("Error stopping data capture:", error);
      setCaptureStatus("");
      try {
        await postLinuxCmd({
          cmd: `pkill -KILL -f 'tcpdump.*${SIGNALING_CAPTURE_DATA_CAPTURE_PATTERN}' 2>/dev/null || true`,
        });
        await postLinuxCmd({
          cmd: `rm -f '${captureFileName}' '${captureFileName}.gz' '${SIGNALING_CAPTURE_LOG_PATH}' 2>/dev/null || true`,
        });
      } catch (_) {
        // ignore cleanup errors
      }
      showToast(
        error.message || "Error during stop/download. Please try again.",
        "error",
      );
    } finally {
      setIsStopping(false);
      setIsCapturing(false);
      setCaptureProcessId(null);
      setCaptureFileName("");
    }
  };

  const handleCleanData = async () => {
    if (
      isStopping ||
      slotStopping.ts.some(Boolean) ||
      slotStopping.e1.some(Boolean)
    ) {
      return;
    }

    try {
      await postLinuxCmd({
        cmd: `pkill -f 'tcpdump.*${SIGNALING_CAPTURE_DATA_CAPTURE_PATTERN}' 2>/dev/null; pkill -f '${SIGNALING_CAPTURE_TS_RECORD_PREFIX}' 2>/dev/null; pkill -f '${SIGNALING_CAPTURE_E1_RECORD_PREFIX}' 2>/dev/null; pkill -f 'dahdi_monitor' 2>/dev/null; rm -f ${SIGNALING_CAPTURE_DATA_DIR}/${SIGNALING_CAPTURE_DATA_CAPTURE_PATTERN}_* ${SIGNALING_CAPTURE_DATA_DIR}/${SIGNALING_CAPTURE_TS_RECORD_PREFIX}_* ${SIGNALING_CAPTURE_DATA_DIR}/${SIGNALING_CAPTURE_E1_RECORD_PREFIX}_* ${SIGNALING_CAPTURE_DATA_DIR}/${SIGNALING_CAPTURE_TS_RECORD_PREFIX}.log ${SIGNALING_CAPTURE_DATA_DIR}/${SIGNALING_CAPTURE_E1_RECORD_PREFIX}.log ${SIGNALING_CAPTURE_LOG_PATH} 2>/dev/null; sync`,
      });
      setIsCapturing(false);
      setCaptureProcessId(null);
      setCaptureFileName("");
      setCaptureStatus("");
      slotSessionRef.current = emptySlotSessions();
      setSlotRecording({ ts: [false, false], e1: [false, false] });
      showToast("Capture data cleaned.", "success");
    } catch (error) {
      console.error("Clean data error:", error);
      showToast(error.message || "Failed to clean capture data.", "error");
    }
  };

  const handleDownloadLog = async () => {
    try {
      await downloadTextFromDevice(
        `sh -c "for f in ${SIGNALING_CAPTURE_LOG_PATH} ${SIGNALING_CAPTURE_DATA_DIR}/${SIGNALING_CAPTURE_TS_RECORD_PREFIX}.log ${SIGNALING_CAPTURE_DATA_DIR}/${SIGNALING_CAPTURE_E1_RECORD_PREFIX}.log; do if [ -f \\\"\\$f\\\" ]; then echo \\\"=== \\$f ===\\\"; cat \\\"\\$f\\\"; echo; fi; done"`,
        `signaling_capture_log_${getDateStr()}.txt`,
      );
      showToast("Log downloaded.", "success");
    } catch (error) {
      console.error("Download log error:", error);
      showToast(error.message || "No log data found to download.", "warning");
    }
  };

  return {
    network,
    setNetwork,
    syslogEnabled,
    setSyslogEnabled,
    syslogDest,
    setSyslogDest,
    networkOptions,
    loading,
    isCapturing,
    isStopping,
    captureStatus,
    toast,
    setToast,
    slotRecording,
    slotStopping,
    ts1Pcm,
    setTs1Pcm,
    ts1Slot,
    setTs1Slot,
    ts2Pcm,
    setTs2Pcm,
    ts2Slot,
    setTs2Slot,
    e1aPcm,
    setE1aPcm,
    e1aSlot,
    setE1aSlot,
    e1bPcm,
    setE1bPcm,
    e1bSlot,
    setE1bSlot,
    dataCaptureLocked,
    anySlotRecording,
    handleStartCapture,
    handleStopCapture,
    handleCleanData,
    handleDownloadLog,
    startSlotRecording,
    stopSlotRecording,
  };
}
