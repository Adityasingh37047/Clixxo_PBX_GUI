import React, { useState, useEffect, useRef } from "react";
import Tooltip from "@mui/material/Tooltip";
import { InfoOutlined } from "@mui/icons-material";
import {
  SC_SECTIONS,
  SC_LABELS,
  SC_PCM_OPTIONS,
  SC_TS_OPTIONS,
  SC_BUTTONS,
  SC_NOTE,
  SC_DATA_CAPTURE_PATTERN,
  SC_TS_RECORD_PREFIX,
  SC_E1_RECORD_PREFIX,
  SC_CAPTURE_LOG_PATH,
  SC_DATA_DIR,
} from "../../../constants/SignalingCaptureConstants";
import { Checkbox, Alert } from "@mui/material";
import { fetchSystemInfo, postLinuxCmd } from "../../../api/apiService";
const C = {
  pageBg: "var(--bg-main)",
  cardBg: "var(--bg-surface)",
  cardBorder: "var(--border-strong)",
  divider: "var(--border-subtle)",
  cardShadow: "var(--shadow-soft)",
  labelText: "var(--text-primary)",
  valueText: "var(--text-primary)",
  strongText: "var(--text-primary)",
  mutedText: "var(--text-muted)",
  accent: "#0284c7",
  primary: "#2563eb",
  primaryHover: "#1d4ed8",
  errorRed: "#dc2626",
};

const SYS_TOAST_SX = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  boxShadow: 3,
};
// ── Local field UI (inlined from maitenanceSharedUi) ──
const OUTLINED_BORDER = "var(--border-subtle)";
const OUTLINED_HOVER = "var(--border-strong)";
const OUTLINED_FOCUS = "var(--status-primary)";
const FOCUS_RING_SHADOW = (color) => `0 0 0 1px ${color}`;

const setFieldDefault = (el) => {
  el.style.borderColor = OUTLINED_BORDER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const setFieldHover = (el) => {
  el.style.borderColor = OUTLINED_HOVER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const setFieldFocus = (el) => {
  el.style.borderColor = OUTLINED_FOCUS;
  el.style.borderWidth = "1px";
  el.style.boxShadow = FOCUS_RING_SHADOW(OUTLINED_FOCUS);
};

const nativeFieldInteraction = {
  onFocus: (e) => {
    if (e.target.disabled) return;
    setFieldFocus(e.target);
  },
  onBlur: (e) => {
    setFieldDefault(e.target);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled) return;
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldHover(e.target);
    }
  },
  onMouseLeave: (e) => {
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldDefault(e.target);
    }
  },
};

const inputInteraction = {
  onFocus: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onFocus(e);
  },
  onBlur: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onBlur(e);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onMouseEnter(e);
  },
  onMouseLeave: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onMouseLeave(e);
  },
};

const getSystemToolsInputInteraction = (hasError, errorColor = "#dc2626") => {
  if (!hasError) return inputInteraction;
  const ring = (el, focused) => {
    el.style.borderColor = errorColor;
    el.style.borderWidth = "1px";
    el.style.boxShadow = focused ? `0 0 0 1px ${errorColor}` : "none";
  };
  return {
    onFocus: (e) => ring(e.target, true),
    onBlur: (e) => ring(e.target, false),
    onMouseEnter: (e) => ring(e.target, document.activeElement === e.target),
    onMouseLeave: (e) => ring(e.target, document.activeElement === e.target),
  };
};

const systemToolsFieldInputStyle = {
  padding: "6px 12px",
  borderRadius: 6,
  border: `1px solid ${OUTLINED_BORDER}`,
  fontSize: 14,
  width: "100%",
  backgroundColor: "var(--row-alt)",
  outline: "none",
  color: "var(--text-primary)",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
  boxShadow: "none",
};

const SYSTEM_TOOLS_FILL_BG_EDITABLE = "var(--bg-main)";
const SYSTEM_TOOLS_FILL_BG_READ_ONLY = "var(--bg-muted)";

const systemToolsEditableFieldInputStyle = {
  ...systemToolsFieldInputStyle,
  backgroundColor: SYSTEM_TOOLS_FILL_BG_EDITABLE,
};
const inputStyle = systemToolsEditableFieldInputStyle;

const BTN_BASE =
  "inline-flex items-center justify-center gap-[6px] h-[30px] px-[14px] py-[6px] rounded-[10px] text-[12px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border disabled:cursor-not-allowed disabled:opacity-60";
const BTN_DEFAULT = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:bg-[var(--row-alt)]`;
const BTN_OUTLINE = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-label)] border-[var(--border-strong)] hover:bg-[var(--row-alt)]`;
const BTN_CANCEL = `${BTN_BASE} bg-[var(--border-subtle)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:opacity-90`;
const BTN_PRIMARY = `${BTN_BASE} text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)]`;
const BTN_ERROR = `${BTN_BASE} bg-[#dc2626] text-white border-[#dc2626] hover:bg-[#b91c1c]`;
const BTN_DELETE = `${BTN_BASE} bg-[#fee2e2] text-[#991b1b] border-[#fecaca] hover:bg-[#fecaca]`;
const BTN_EDIT = `${BTN_BASE} bg-[#dcfce7] text-[#166534] border-[#bbf7d0] hover:bg-[#bbf7d0]`;
const btnVariantCls = {
  default: BTN_DEFAULT,
  primary: BTN_PRIMARY,
  cancel: BTN_CANCEL,
  outline: BTN_OUTLINE,
  error: BTN_ERROR,
  delete: BTN_DELETE,
  edit: BTN_EDIT,
  danger: BTN_ERROR,
};

const Btn = ({ children, onClick, disabled, variant = "default", className = "", style, type, title }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    title={title}
    style={style}
    className={`${btnVariantCls[variant] || btnVariantCls.default} ${className}`.trim()}
  >
    {children}
  </button>
);

const tableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 10,
  boxShadow: C.cardShadow,
  overflow: "hidden",
  marginBottom: 24,
};

const blueBarStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: 10,
  borderTopRightRadius: 10,
  marginBottom: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  padding: "7px 14px",
  flexWrap: "wrap",
  gap: 12,
  fontWeight: 700,
  fontSize: 13,
  color: "var(--text-primary)",
  borderBottom: `1px solid ${C.divider}`,
};

const labelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: C.labelText,
  textAlign: "left",
};

/** Standalone action footer — not attached to any table/card */
const signalingCaptureFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "100%",
  marginTop: 24,
  padding: "10px 20px",
  border: `1.5px solid ${C.cardBorder}`,
  borderRadius: 10,
  boxSizing: "border-box",
  background: C.cardBg,
  boxShadow: C.cardShadow,
};

const signalingCaptureFooterBtnStyle = {
  minWidth: 110,
  height: 34,
  fontSize: 13,
  margin: 0,
  padding: "0 28px",
  lineHeight: "34px",
  boxSizing: "border-box",
};

const extractCmdOutput = (res) =>
  String(res?.responseData ?? res?.data ?? "").trim();

const getDateStr = () =>
  new Date().toISOString().split("T")[0].replace(/-/g, "_");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const parsePcmIndex = (pcm) => {
  const n = parseInt(String(pcm).replace(/\D/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
};

const parseTsNumber = (ts) => {
  const n = parseInt(String(ts).replace(/\D/g, ""), 10);
  return Number.isFinite(n) ? n : 16;
};

const dahdiChannelFromPcmTs = (pcm, ts) =>
  parsePcmIndex(pcm) * 32 + parseTsNumber(ts);

const emptySlotSessions = () => ({ ts: [null, null], e1: [null, null] });

const SignalingCapture = () => {
  // Data Capture state
  const [network, setNetwork] = useState("all");
  const [syslogEnabled, setSyslogEnabled] = useState(false);
  const [syslogDest, setSyslogDest] = useState("192.168.0.254");

  // Network interfaces state
  const [networkOptions, setNetworkOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Data capture state
  const [isCapturing, setIsCapturing] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [captureProcessId, setCaptureProcessId] = useState(null);
  const [captureFileName, setCaptureFileName] = useState("");
  const [captureStatus, setCaptureStatus] = useState("");
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const slotSessionRef = useRef(emptySlotSessions());
  const [slotRecording, setSlotRecording] = useState({
    ts: [false, false],
    e1: [false, false],
  });
  const [slotStopping, setSlotStopping] = useState({
    ts: [false, false],
    e1: [false, false],
  });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const isAnySlotRecording = () =>
    slotRecording.ts.some(Boolean) || slotRecording.e1.some(Boolean);

  const setSlotRecordingFlag = (section, row, value) => {
    setSlotRecording((prev) => {
      const next = { ...prev, [section]: [...prev[section]] };
      next[section][row] = value;
      return next;
    });
  };

  const setSlotStoppingFlag = (section, row, value) => {
    setSlotStopping((prev) => {
      const next = { ...prev, [section]: [...prev[section]] };
      next[section][row] = value;
      return next;
    });
  };

  const downloadGzFileFromDevice = async (captureFileName, downloadName) => {
    const gzFile = `${captureFileName}.gz`;

    const checkRes = await postLinuxCmd({
      cmd: `ls -la '${captureFileName}' 2>/dev/null || echo FILE_NOT_FOUND`,
    });
    if (extractCmdOutput(checkRes).includes("FILE_NOT_FOUND")) {
      throw new Error("Capture file not found on server.");
    }

    const sizeCheckRes = await postLinuxCmd({
      cmd: `wc -c < '${captureFileName}' 2>/dev/null || echo 0`,
    });
    const rawSize = parseInt(extractCmdOutput(sizeCheckRes), 10) || 0;
    if (rawSize === 0) {
      throw new Error("Capture file is empty. Generate traffic and try again.");
    }

    const gzRes = await postLinuxCmd({
      cmd: `gzip -c '${captureFileName}' > '${gzFile}' 2>/dev/null && echo OK || echo FAILED`,
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
      const raw = atob(chunkB64);
      const bytes = new Uint8Array(raw.length);
      for (let j = 0; j < raw.length; j++) bytes[j] = raw.charCodeAt(j);
      binaryParts.push(bytes);
    }

    if (binaryParts.length === 0) {
      throw new Error("No data received from device during download.");
    }

    const totalSize = binaryParts.reduce((sum, part) => sum + part.length, 0);
    const byteArray = new Uint8Array(totalSize);
    let offset = 0;
    for (const part of binaryParts) {
      byteArray.set(part, offset);
      offset += part.length;
    }

    const blob = new Blob([byteArray], { type: "application/gzip" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    await postLinuxCmd({
      cmd: `rm -f '${captureFileName}' '${gzFile}' 2>/dev/null || true`,
    });
  };

  const downloadTextFromDevice = async (cmd, downloadName) => {
    const res = await postLinuxCmd({ cmd });
    const text = extractCmdOutput(res);
    if (!text.trim()) {
      throw new Error("No log data found on server.");
    }
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const startSlotRecording = async (section, row, pcm, ts, filePrefix) => {
    if (isCapturing || isStopping || isAnySlotRecording()) return;

    const channel = dahdiChannelFromPcmTs(pcm, ts);
    const dateStr = getDateStr();
    const fileName = `${SC_DATA_DIR}/${filePrefix}_${pcm}_${ts}_${dateStr}.dat`;
    const logPath = `${SC_DATA_DIR}/${filePrefix}.log`;

    try {
      await postLinuxCmd({
        cmd: `pkill -f '${filePrefix}' 2>/dev/null || true`,
      });
      await delay(500);

      const cmd = `sh -c "mkdir -p ${SC_DATA_DIR}; rm -f '${fileName}'; touch '${fileName}'; chmod 666 '${fileName}' || true; dahdi_monitor ${channel} -f '${fileName}' > /dev/null 2> '${logPath}' < /dev/null & echo \\$!"`;
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
      if (!pid || !/^\d+$/.test(pid)) {
        throw new Error(`Failed to start recording. Response: ${pid || "(no output)"}`);
      }

      await delay(400);
      const health = await postLinuxCmd({
        cmd: `ps -p ${pid} >/dev/null 2>&1 && echo RUNNING || echo NOT_RUNNING`,
      });
      if (extractCmdOutput(health) !== "RUNNING") {
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
      } catch (_) {}
    } finally {
      slotSessionRef.current[section][row] = null;
      setSlotRecordingFlag(section, row, false);
      setSlotStoppingFlag(section, row, false);
    }
  };

  // TS Recording state
  const [ts1Pcm, setTs1Pcm] = useState(SC_PCM_OPTIONS[0].value);
  const [ts1Slot, setTs1Slot] = useState(SC_TS_OPTIONS[0].value);
  const [ts2Pcm, setTs2Pcm] = useState(SC_PCM_OPTIONS[0].value);
  const [ts2Slot, setTs2Slot] = useState(SC_TS_OPTIONS[1].value);

  // E1 Two-way Recording state
  const [e1aPcm, setE1aPcm] = useState(SC_PCM_OPTIONS[0].value);
  const [e1aSlot, setE1aSlot] = useState(SC_TS_OPTIONS[2].value);
  const [e1bPcm, setE1bPcm] = useState(SC_PCM_OPTIONS[0].value);
  const [e1bSlot, setE1bSlot] = useState(SC_TS_OPTIONS[3].value);

  // Network interfaces state
  useEffect(() => {
    const fetchNetworkInterfaces = async () => {
      try {
        setLoading(true);
        const data = await fetchSystemInfo();

        if (data.success && data.details) {
          const details = data.details;
          let rawInterfaces = [];

          // Extract interfaces from system info
          if (Array.isArray(details.LAN_INTERFACES)) {
            rawInterfaces = details.LAN_INTERFACES;
          } else if (
            details.LAN_INTERFACES &&
            typeof details.LAN_INTERFACES === "object"
          ) {
            rawInterfaces = Object.entries(details.LAN_INTERFACES).map(
              ([name, data]) => ({ name, data }),
            );
          }

          // Filter and process interfaces
          const filteredInterfaces = (rawInterfaces || [])
            .filter((iface) => {
              const name = iface && iface.name ? String(iface.name) : "";
              const lower = name.toLowerCase();
              if (lower === "lo") return false;
              if (lower.startsWith("tap")) return false;
              if (lower.startsWith("tun")) return false;
              if (lower.includes("vpn")) return false;
              return true;
            })
            .map((iface) => {
              const name = iface.name;
              let displayName = name;
              let ipAddress = "";

              // Get IP address from interface data
              if (iface.data) {
                const data = iface.data;
                if (
                  Array.isArray(data["IP Address"]) &&
                  data["IP Address"][0]
                ) {
                  ipAddress = data["IP Address"][0];
                } else if (
                  Array.isArray(data["Ip Address"]) &&
                  data["Ip Address"][0]
                ) {
                  ipAddress = data["Ip Address"][0];
                } else if (
                  Array.isArray(data["ip_address"]) &&
                  data["ip_address"][0]
                ) {
                  ipAddress = data["ip_address"][0];
                }
              }

              // Normalize names
              if (name === "eth0") {
                displayName = "LAN 1";
              } else if (name === "eth1") {
                displayName = "LAN 2";
              }

              return {
                value: name,
                label: `${displayName}${ipAddress ? `(${ipAddress})` : ""}`,
                ip: ipAddress,
              };
            })
            .sort((a, b) => {
              const order = { eth0: 1, eth1: 2 };
              const aOrder = order[a.value] || 99;
              const bOrder = order[b.value] || 99;
              return aOrder - bOrder;
            });

          // Add "All LAN" option at the beginning
          const options = [
            { value: "all", label: "All LAN", ip: "" },
            ...filteredInterfaces,
          ];

          setNetworkOptions(options);
        }
      } catch (error) {
        console.error("Error fetching network interfaces:", error);
        // Fallback to default options
        setNetworkOptions([
          { value: "all", label: "All LAN", ip: "" },
          { value: "eth0", label: "LAN 1", ip: "" },
          { value: "eth1", label: "LAN 2", ip: "" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchNetworkInterfaces();
  }, []);

  // Handle start data capture
  const handleStartCapture = async () => {
    if (isCapturing || isStopping || isAnySlotRecording()) return;

    try {
      let interfaceName = "";
      if (network === "all") {
        interfaceName = "any";
      } else if (network === "eth0") {
        interfaceName = "eth0";
      } else if (network === "eth1") {
        interfaceName = "eth1";
      } else {
        interfaceName = network;
      }

      const dateStr = getDateStr();
      const fileName = `${SC_DATA_DIR}/${SC_DATA_CAPTURE_PATTERN}_${dateStr}.pcap`;
      setCaptureFileName(fileName);

      const dest = syslogDest.trim();
      const filterExpr =
        syslogEnabled && dest
          ? `host ${dest} and (udp port 514 or tcp port 514)`
          : "";
      const tcpdumpCmd = `tcpdump -U -i ${interfaceName} -s 0 -w '${fileName}' ${filterExpr ? `'${filterExpr}'` : ""}`;

      await postLinuxCmd({
        cmd: `pkill -f 'tcpdump.*${SC_DATA_CAPTURE_PATTERN}' 2>/dev/null || true`,
      });
      await delay(800);

      const cmd = `sh -c "mkdir -p ${SC_DATA_DIR}; rm -f '${fileName}'; touch '${fileName}'; chmod 666 '${fileName}' || true; ${tcpdumpCmd} > /dev/null 2> '${SC_CAPTURE_LOG_PATH}' < /dev/null & echo \\$!"`;
      const response = await postLinuxCmd({ cmd });

      if (response?.response === false) {
        const logTailRes = await postLinuxCmd({
          cmd: `tail -n 5 ${SC_CAPTURE_LOG_PATH} 2>/dev/null || true`,
        });
        const logTail = extractCmdOutput(logTailRes);
        showToast(
          `Failed to start capture: ${response?.message || "Unknown error"}${logTail ? ` — ${logTail}` : ""}`,
          "error",
        );
        return;
      }

      const pid = extractCmdOutput(response);
      if (pid && /^\d+$/.test(pid)) {
        await delay(400);
        const health = await postLinuxCmd({
          cmd: `ps -p ${pid} >/dev/null 2>&1 && echo RUNNING || echo NOT_RUNNING`,
        });
        const status = extractCmdOutput(health);
        const logTailRes = await postLinuxCmd({
          cmd: `tail -n 3 ${SC_CAPTURE_LOG_PATH} 2>/dev/null || true`,
        });
        const logTail = extractCmdOutput(logTailRes);
        if (status !== "RUNNING") {
          showToast(
            `Failed to start capture. tcpdump not running.${logTail ? ` ${logTail}` : ""}`,
            "error",
          );
          return;
        }
        setCaptureProcessId(pid);
        setIsCapturing(true);
        const lanDisplay =
          network === "all"
            ? "All LAN"
            : network === "eth0"
              ? "LAN 1"
              : network === "eth1"
                ? "LAN 2"
                : network;
        showToast(`Data capture started on ${lanDisplay}.`, "success");
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

  // Handle stop data capture
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
        cmd: `${pidTerm}pkill -TERM -f 'tcpdump.*${SC_DATA_CAPTURE_PATTERN}' 2>/dev/null; sleep 2; ${pidKill}pkill -KILL -f 'tcpdump.*${SC_DATA_CAPTURE_PATTERN}' 2>/dev/null; sync`,
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
          cmd: `rm -f '${captureFileName}' '${captureFileName}.gz' '${SC_CAPTURE_LOG_PATH}' 2>/dev/null || true`,
        });
        return;
      }

      await downloadGzFileFromDevice(
        captureFileName,
        `${SC_DATA_CAPTURE_PATTERN}_${getDateStr()}.pcap.gz`,
      );
      await postLinuxCmd({
        cmd: `rm -f '${SC_CAPTURE_LOG_PATH}' 2>/dev/null || true`,
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
          cmd: `pkill -KILL -f 'tcpdump.*${SC_DATA_CAPTURE_PATTERN}' 2>/dev/null || true`,
        });
        await postLinuxCmd({
          cmd: `rm -f '${captureFileName}' '${captureFileName}.gz' '${SC_CAPTURE_LOG_PATH}' 2>/dev/null || true`,
        });
      } catch (_) {}
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
        cmd: `pkill -f 'tcpdump.*${SC_DATA_CAPTURE_PATTERN}' 2>/dev/null; pkill -f '${SC_TS_RECORD_PREFIX}' 2>/dev/null; pkill -f '${SC_E1_RECORD_PREFIX}' 2>/dev/null; pkill -f 'dahdi_monitor' 2>/dev/null; rm -f ${SC_DATA_DIR}/${SC_DATA_CAPTURE_PATTERN}_* ${SC_DATA_DIR}/${SC_TS_RECORD_PREFIX}_* ${SC_DATA_DIR}/${SC_E1_RECORD_PREFIX}_* ${SC_DATA_DIR}/${SC_TS_RECORD_PREFIX}.log ${SC_DATA_DIR}/${SC_E1_RECORD_PREFIX}.log ${SC_CAPTURE_LOG_PATH} 2>/dev/null; sync`,
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
        `sh -c "for f in ${SC_CAPTURE_LOG_PATH} ${SC_DATA_DIR}/${SC_TS_RECORD_PREFIX}.log ${SC_DATA_DIR}/${SC_E1_RECORD_PREFIX}.log; do if [ -f \\\"\\$f\\\" ]; then echo \\\"=== \\$f ===\\\"; cat \\\"\\$f\\\"; echo; fi; done"`,
        `signaling_capture_log_${getDateStr()}.txt`,
      );
      showToast("Log downloaded.", "success");
    } catch (error) {
      console.error("Download log error:", error);
      showToast(error.message || "No log data found to download.", "warning");
    }
  };

  const dataCaptureLocked =
    isCapturing || isStopping || isAnySlotRecording();

  return (
    <div
      className="clixxo-system-settings theme-page-bg min-h-[calc(100vh-80px)] p-4 flex flex-col items-center"
      style={{ backgroundColor: C.pageBg }}
    >
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={() => setToast({ msg: "", type: "success" })}
          sx={SYS_TOAST_SX}
        >
          {toast.msg}
        </Alert>
      )}

      <div className="w-full" style={{ maxWidth: 1000 }}>
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
          <span>Maintenance</span>
          <span>&gt;</span>
          <span>System Tool</span>
          <span>&gt;</span>
          <span style={{ color: C.strongText, fontWeight: 600 }}>
            Signaling Capture
          </span>
        </div>

        <div style={tableContainerStyle}>
          <div style={blueBarStyle}>
            <span>{SC_SECTIONS[0]}</span>
          </div>
          <div className="flex flex-col p-6 gap-6">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                  <FieldLabel
                    tooltipKey="networkInterface"
                    className="sm:w-[280px] whitespace-nowrap"
                    style={labelStyle}
                  >
                    {SC_LABELS.networkInterface}
                  </FieldLabel>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <select
                      style={{ ...inputStyle, width: "100%", minWidth: 220 }}
                      value={network}
                      onChange={(e) => setNetwork(e.target.value)}
                      disabled={loading || dataCaptureLocked}
                      {...inputInteraction}
                    >
                      {loading ? (
                        <option value="">Loading...</option>
                      ) : (
                        networkOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 lg:ml-4">
                  <div className="flex flex-row flex-wrap gap-4 justify-start lg:justify-end">
                    <Btn
                      variant="primary"
                      onClick={handleStartCapture}
                      disabled={dataCaptureLocked}
                      style={{ minWidth: 100, height: 33, fontSize: 13 }}
                    >
                      {SC_BUTTONS.start}
                    </Btn>
                    <Btn
                      variant="cancel"
                      onClick={handleStopCapture}
                      disabled={!isCapturing || isStopping}
                      style={{ minWidth: 100, height: 33, fontSize: 13 }}
                    >
                      {isStopping ? "Please wait…" : SC_BUTTONS.stop}
                    </Btn>
                  </div>
                  {captureStatus && (
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--status-primary)",
                        fontWeight: 600,
                        background: "var(--row-selected)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: 6,
                        padding: "4px 12px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {captureStatus}
                    </div>
                  )}
                  {isCapturing && !isStopping && (
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--status-success)",
                        fontWeight: 600,
                        background: "var(--bg-muted)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: 6,
                        padding: "3px 10px",
                      }}
                    >
                      ● Capturing…
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <FieldLabel
                  tooltipKey="captureSyslog"
                  className="sm:w-[280px] whitespace-nowrap"
                  style={labelStyle}
                >
                  {SC_LABELS.captureSyslog}
                </FieldLabel>
                <div className="flex items-center gap-2">
                  <Checkbox
                    size="small"
                    checked={syslogEnabled}
                    onChange={(e) => setSyslogEnabled(e.target.checked)}
                    id="syslog-enable"
                    disabled={dataCaptureLocked || isAnySlotRecording()}
                    sx={{
                      padding: "4px",
                      color: "var(--text-muted)",
                      "&.Mui-checked": { color: C.accent },
                      cursor:
                        dataCaptureLocked || isAnySlotRecording()
                          ? "not-allowed"
                          : "pointer",
                    }}
                  />
                  <label
                    htmlFor="syslog-enable"
                    style={{
                      fontSize: 14,
                      color: C.valueText,
                      cursor:
                        dataCaptureLocked || isAnySlotRecording()
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    {SC_LABELS.enable}
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <FieldLabel
                  tooltipKey="syslogDest"
                  className="sm:w-[280px] whitespace-nowrap"
                  style={labelStyle}
                >
                  {SC_LABELS.syslogDest}
                </FieldLabel>
                <input
                  type="text"
                  value={syslogDest}
                  onChange={(e) => setSyslogDest(e.target.value)}
                  disabled={!syslogEnabled || dataCaptureLocked || isAnySlotRecording()}
                  style={{
                    ...inputStyle,
                    width: "100%",
                    maxWidth: 220,
                    backgroundColor:
                      !syslogEnabled || dataCaptureLocked || isAnySlotRecording()
                        ? SYSTEM_TOOLS_FILL_BG_READ_ONLY
                        : SYSTEM_TOOLS_FILL_BG_EDITABLE,
                    opacity:
                      !syslogEnabled || dataCaptureLocked || isAnySlotRecording() ? 0.6 : 1,
                    cursor:
                      !syslogEnabled || dataCaptureLocked || isAnySlotRecording()
                        ? "not-allowed"
                        : "text",
                  }}
                  {...inputInteraction}
                />
              </div>

              <p
                style={{
                  margin: "16px 0 0",
                  textAlign: "center",
                  fontSize: 12,
                  color: "#dc2626",
                  width: "100%",
                  whiteSpace: "nowrap",
                  overflowX: "auto",
                  lineHeight: 1.45,
                }}
              >
                {SC_NOTE}
              </p>
            </div>
          </div>
        </div>

        <div style={tableContainerStyle}>
          <div style={blueBarStyle}>
            <span>{SC_SECTIONS[1]}</span>
          </div>
          <div className="p-6 flex flex-col gap-6">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 last:pb-0"
                style={{
                  borderBottom: i === 0 ? `1px solid ${C.divider}` : "none",
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                  <FieldLabel
                    tooltipKey="pcmTs"
                    className="sm:w-[280px] whitespace-nowrap"
                    style={labelStyle}
                  >
                    {SC_LABELS.pcmTs}
                  </FieldLabel>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <select
                      style={{ ...inputStyle, minWidth: 100 }}
                      value={i === 0 ? ts1Pcm : ts2Pcm}
                      onChange={(e) =>
                        i === 0
                          ? setTs1Pcm(e.target.value)
                          : setTs2Pcm(e.target.value)
                      }
                      disabled={
                        dataCaptureLocked ||
                        slotRecording.ts[i] ||
                        slotStopping.ts[i]
                      }
                      {...inputInteraction}
                    >
                      {SC_PCM_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <select
                      style={{ ...inputStyle, minWidth: 180 }}
                      value={i === 0 ? ts1Slot : ts2Slot}
                      onChange={(e) =>
                        i === 0
                          ? setTs1Slot(e.target.value)
                          : setTs2Slot(e.target.value)
                      }
                      disabled={
                        dataCaptureLocked ||
                        slotRecording.ts[i] ||
                        slotStopping.ts[i]
                      }
                      {...inputInteraction}
                    >
                      {SC_TS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex flex-row flex-wrap gap-4 justify-start lg:justify-end mt-2 lg:mt-0">
                  <Btn
                    variant="primary"
                    type="button"
                    onClick={() =>
                      startSlotRecording(
                        "ts",
                        i,
                        i === 0 ? ts1Pcm : ts2Pcm,
                        i === 0 ? ts1Slot : ts2Slot,
                        SC_TS_RECORD_PREFIX,
                      )
                    }
                    disabled={dataCaptureLocked || isAnySlotRecording()}
                    style={{ minWidth: 100, height: 33, fontSize: 13 }}
                  >
                    {SC_BUTTONS.start}
                  </Btn>
                  <Btn
                    variant="cancel"
                    type="button"
                    onClick={() => stopSlotRecording("ts", i)}
                    disabled={!slotRecording.ts[i] || slotStopping.ts[i]}
                    style={{ minWidth: 100, height: 33, fontSize: 13 }}
                  >
                    {slotStopping.ts[i] ? "Please wait…" : SC_BUTTONS.stop}
                  </Btn>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...tableContainerStyle, marginBottom: 0 }}>
          <div style={blueBarStyle}>
            <span>{SC_SECTIONS[2]}</span>
          </div>
          <div className="p-6 flex flex-col gap-6">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 last:pb-0"
                style={{
                  borderBottom: i === 0 ? `1px solid ${C.divider}` : "none",
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                  <FieldLabel
                    tooltipKey="e1PcmTs"
                    className="sm:w-[280px] whitespace-nowrap"
                    style={labelStyle}
                  >
                    {SC_LABELS.pcmTs}
                  </FieldLabel>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <select
                      style={{ ...inputStyle, minWidth: 100 }}
                      value={i === 0 ? e1aPcm : e1bPcm}
                      onChange={(e) =>
                        i === 0
                          ? setE1aPcm(e.target.value)
                          : setE1bPcm(e.target.value)
                      }
                      disabled={
                        dataCaptureLocked ||
                        slotRecording.e1[i] ||
                        slotStopping.e1[i]
                      }
                      {...inputInteraction}
                    >
                      {SC_PCM_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <select
                      style={{ ...inputStyle, minWidth: 180 }}
                      value={i === 0 ? e1aSlot : e1bSlot}
                      onChange={(e) =>
                        i === 0
                          ? setE1aSlot(e.target.value)
                          : setE1bSlot(e.target.value)
                      }
                      disabled={
                        dataCaptureLocked ||
                        slotRecording.e1[i] ||
                        slotStopping.e1[i]
                      }
                      {...inputInteraction}
                    >
                      {SC_TS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex flex-row flex-wrap gap-4 justify-start lg:justify-end mt-2 lg:mt-0">
                  <Btn
                    variant="primary"
                    type="button"
                    onClick={() =>
                      startSlotRecording(
                        "e1",
                        i,
                        i === 0 ? e1aPcm : e1bPcm,
                        i === 0 ? e1aSlot : e1bSlot,
                        SC_E1_RECORD_PREFIX,
                      )
                    }
                    disabled={dataCaptureLocked || isAnySlotRecording()}
                    style={{ minWidth: 100, height: 33, fontSize: 13 }}
                  >
                    {SC_BUTTONS.start}
                  </Btn>
                  <Btn
                    variant="cancel"
                    type="button"
                    onClick={() => stopSlotRecording("e1", i)}
                    disabled={!slotRecording.e1[i] || slotStopping.e1[i]}
                    style={{ minWidth: 100, height: 33, fontSize: 13 }}
                  >
                    {slotStopping.e1[i] ? "Please wait…" : SC_BUTTONS.stop}
                  </Btn>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={signalingCaptureFooterStyle}>
          <Btn
            variant="primary"
            type="button"
            onClick={handleCleanData}
            disabled={isStopping || slotStopping.ts.some(Boolean) || slotStopping.e1.some(Boolean)}
            style={signalingCaptureFooterBtnStyle}
          >
            {SC_BUTTONS.clean}
          </Btn>
          <Btn
            variant="cancel"
            type="button"
            onClick={handleDownloadLog}
            style={signalingCaptureFooterBtnStyle}
          >
            {SC_BUTTONS.download}
          </Btn>
        </div>
      </div>
    </div>
  );
};

export default SignalingCapture;
