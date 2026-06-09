import React, { useState, useEffect } from "react";
import {
  SC_SECTIONS,
  SC_LABELS,
  SC_PCM_OPTIONS,
  SC_TS_OPTIONS,
  SC_BUTTONS,
  SC_NOTE,
} from "../../../constants/SignalingCaptureConstants";
import { Checkbox } from "@mui/material";
import { fetchSystemInfo, postLinuxCmd } from "../../../api/apiService";
import {
  systemToolsEditableFieldInputStyle as inputStyle,
  SYSTEM_TOOLS_FILL_BG_EDITABLE,
  SYSTEM_TOOLS_FILL_BG_READ_ONLY,
  inputInteraction,
} from "../../../sections/systemTools/systemToolsSharedUi";

const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#9CA3AF",
  divider: "#9CA3AF",
  cardShadow: "0 4px 20px rgba(15,23,42,0.06)",
  labelText: "#3E5475",
  valueText: "#1e293b",
  strongText: "#0f172a",
  mutedText: "#94a3b8",
  accent: "#0284c7",
  primary: "#2563eb",
  primaryHover: "#1d4ed8",
  errorRed: "#dc2626",
};

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
    primary: {
      background:
        "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
      color: "#fff",
      border: "1px solid #5A6F8F",
    },
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
    },
    edit: {
      background: "#dcfce7",
      color: "#166534",
      border: "1px solid #bbf7d0",
    },
    delete: {
      background: "#fee2e2",
      color: "#991b1b",
      border: "1px solid #fecaca",
    },
    danger: {
      background: C.errorRed,
      color: C.cardBg,
      border: `0.5px solid ${C.errorRed}`,
    },
  };

  const s = styles[variant] || styles.default;
  const hoverBg = (() => {
    switch (variant) {
      case "primary":
        return "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)";
      case "cancel":
        return "#b6c2d3";
      case "edit":
        return "#bbf7d0";
      case "delete":
        return "#fecaca";
      case "danger":
        return "#b91c1c";
      case "default":
      default:
        return "#e2e8f0";
    }
  })();

  const baseBg = s.background;

  return (
    <button
      type={type}
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
  color: "#3E5475",
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
    try {
      // Determine interface for tcpdump
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

      // Create capture file with readable date
      const now = new Date();
      const dateStr = now.toISOString().split("T")[0].replace(/-/g, "_"); // YYYY_MM_DD format
      const fileName = `/mnt/data/signaling_capture_${dateStr}.pcap`;
      setCaptureFileName(fileName);

      // Build tcpdump command
      // -U: packet-buffered (flushes packets to file quickly to reduce truncation risk)
      // Important: BPF filter (if any) must be passed as a single trailing argument, without a leading 'and'
      const dest = syslogDest.trim();
      const filterExpr =
        syslogEnabled && dest
          ? `host ${dest} and (udp port 514 or tcp port 514)`
          : "";
      const tcpdumpCmd = `tcpdump -U -i ${interfaceName} -s 0 -w '${fileName}' ${filterExpr ? `'${filterExpr}'` : ""}`;

      const logPath = "/mnt/data/tcpdump_capture.log";

      // Step 1: kill any existing capture (separate call so backend doesn't see "sleep")
      await postLinuxCmd({
        cmd: `pkill -f 'tcpdump.*signaling_capture' 2>/dev/null || true`,
      });
      await new Promise((r) => setTimeout(r, 800));

      // Step 2: start new capture
      const cmd = `sh -c "mkdir -p /mnt/data; rm -f '${fileName}'; touch '${fileName}'; chmod 666 '${fileName}' || true; ${tcpdumpCmd} > /dev/null 2> '${logPath}' < /dev/null & echo \\$!"`;

      const response = await postLinuxCmd({ cmd });

      if (response?.response === false) {
        const logTailRes = await postLinuxCmd({
          cmd: `tail -n 5 ${logPath} 2>/dev/null || true`,
        });
        const logTail = String(logTailRes?.responseData || "").trim();
        window.alert(
          `Failed to start capture: ${response?.message || "Unknown error"}${logTail ? `\n\nLog:\n${logTail}` : ""}`,
        );
        return;
      }

      const pid = String(response?.responseData || "").trim();

      if (pid && /^\d+$/.test(pid)) {
        // Quick health check: ensure process exists and no immediate tcpdump error in log
        await new Promise((r) => setTimeout(r, 400));
        const health = await postLinuxCmd({
          cmd: `ps -p ${pid} >/dev/null 2>&1 && echo RUNNING || echo NOT_RUNNING`,
        });
        const status = String(health?.responseData || "").trim();
        const logTailRes = await postLinuxCmd({
          cmd: `tail -n 3 ${logPath} 2>/dev/null || true`,
        });
        const logTail = String(logTailRes?.responseData || "").trim();
        if (status !== "RUNNING") {
          window.alert(
            `Failed to start capture. tcpdump not running.\n${logTail ? `\nLog:\n${logTail}` : ""}`,
          );
          return;
        }
        setCaptureProcessId(pid);
        setIsCapturing(true);

        // Show success alert
        const lanDisplay =
          network === "all"
            ? "All LAN"
            : network === "eth0"
              ? "LAN 1"
              : network === "eth1"
                ? "LAN 2"
                : network;
        window.alert(`Start data capture on ${lanDisplay}!`);
      } else {
        window.alert(
          `Failed to start data capture. Response: ${pid || "(no output)"}`,
        );
      }
    } catch (error) {
      console.error("Error starting data capture:", error);
      window.alert("Error starting data capture. Please try again.");
    }
  };

  // Handle stop data capture
  const handleStopCapture = async () => {
    if (isStopping) return;
    setIsStopping(true);
    const gzFile = captureFileName ? `${captureFileName}.gz` : "";

    const cleanup = async () => {
      try {
        await postLinuxCmd({
          cmd: `rm -f '${captureFileName}' '${gzFile}' /mnt/data/tcpdump_capture.log 2>/dev/null || true`,
        });
      } catch (_) {}
    };

    try {
      // ── Step 1: Kill tcpdump in ONE server-side command ─────────────────────
      // TERM → 2 s grace → KILL → sync. One API call, no polling loop.
      setCaptureStatus("Stopping capture…");
      const pidTerm = captureProcessId
        ? `kill -TERM ${captureProcessId} 2>/dev/null; `
        : "";
      const pidKill = captureProcessId
        ? `kill -KILL ${captureProcessId} 2>/dev/null; `
        : "";
      await postLinuxCmd({
        cmd: `${pidTerm}pkill -TERM -f 'tcpdump.*signaling_capture' 2>/dev/null; sleep 2; ${pidKill}pkill -KILL -f 'tcpdump.*signaling_capture' 2>/dev/null; sync`,
      });

      // ── Step 2: verify file exists and has packets ──────────────────────────
      const checkRes = await postLinuxCmd({
        cmd: `ls -la '${captureFileName}' 2>/dev/null || echo FILE_NOT_FOUND`,
      });
      if (String(checkRes?.responseData || "").includes("FILE_NOT_FOUND")) {
        window.alert("Capture file not found on server.");
        return;
      }

      const pktRes = await postLinuxCmd({
        cmd: `tcpdump -n -q -r '${captureFileName}' -c 1 2>/dev/null | wc -l`,
      });
      const pktCount =
        parseInt(String(pktRes?.responseData || "0").trim(), 10) || 0;
      if (pktCount === 0) {
        window.alert(
          "Capture stopped but no packets were recorded.\nTry: All LAN, disable Syslog filter, generate traffic, then capture again.",
        );
        await cleanup();
        return;
      }

      // ── Step 3: compress — check success explicitly ─────────────────────────
      setCaptureStatus("Compressing capture file…");
      const gzRes = await postLinuxCmd({
        cmd: `gzip -c '${captureFileName}' > '${gzFile}' 2>/dev/null && echo OK || echo FAILED`,
      });
      if (!String(gzRes?.responseData || "").includes("OK")) {
        window.alert("Failed to compress capture file. Please try again.");
        await cleanup();
        return;
      }

      const sizeRes = await postLinuxCmd({
        cmd: `wc -c < '${gzFile}' 2>/dev/null || echo 0`,
      });
      const fileSize =
        parseInt(String(sizeRes?.responseData || "0").trim(), 10) || 0;
      if (fileSize === 0) {
        window.alert("Compressed file is empty. Please try again.");
        await cleanup();
        return;
      }

      // ── Step 4: chunked base64 transfer (200 KB chunks) ────────────────────
      // Decode each chunk to binary immediately — base64-joining padded chunks
      // produces invalid base64. Iterate exactly numChunks (derived from file
      // size) so an empty API response is treated as an error, not silent EOF.
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
        const chunkB64 = String(chunkRes?.responseData || "").replace(
          /\s+/g,
          "",
        );
        if (!chunkB64) {
          // Only acceptable on the very last chunk when file size is an exact multiple
          if (i === numChunks - 1) break;
          throw new Error(
            `Download interrupted at chunk ${i + 1}/${numChunks}. Please try again.`,
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

      // ── Step 5: merge and trigger browser download ──────────────────────────
      setCaptureStatus("Saving file…");
      const totalSize = binaryParts.reduce((sum, p) => sum + p.length, 0);
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
      const dateStr = new Date().toISOString().split("T")[0].replace(/-/g, "_");
      link.download = `signaling_capture_${dateStr}.pcap.gz`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // ── Step 6: clean up files from device ─────────────────────────────────
      await cleanup();
      setCaptureStatus("");
      window.alert(
        "Download complete! Open the .pcap.gz file directly in Wireshark.",
      );
    } catch (error) {
      console.error("Error stopping data capture:", error);
      setCaptureStatus("");
      try {
        await postLinuxCmd({
          cmd: `pkill -KILL -f 'tcpdump.*signaling_capture' 2>/dev/null || true`,
        });
        await cleanup();
      } catch (_) {}
      window.alert(
        `Error during stop/download: ${error.message || "Please try again."}`,
      );
    } finally {
      setIsStopping(false);
      setIsCapturing(false);
      setCaptureProcessId(null);
      setCaptureFileName("");
    }
  };

  return (
    <div
      className="min-h-[calc(100vh-80px)] p-4 flex flex-col items-center"
      style={{ backgroundColor: C.pageBg }}
    >
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
                  <label
                    className="sm:w-[280px] whitespace-nowrap"
                    style={labelStyle}
                  >
                    {SC_LABELS.networkInterface}
                  </label>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <select
                      style={{ ...inputStyle, width: "100%", minWidth: 220 }}
                      value={network}
                      onChange={(e) => setNetwork(e.target.value)}
                      disabled={loading || isCapturing || isStopping}
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
                      disabled={isCapturing || isStopping}
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
                        color: "#1d4ed8",
                        fontWeight: 600,
                        background: "#eff6ff",
                        border: "1px solid #bfdbfe",
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
                        color: "#15803d",
                        fontWeight: 600,
                        background: "#f0fdf4",
                        border: "1px solid #bbf7d0",
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
                <label
                  className="sm:w-[280px] whitespace-nowrap"
                  style={labelStyle}
                >
                  {SC_LABELS.captureSyslog}
                </label>
                <div className="flex items-center gap-2">
                  <Checkbox
                    size="small"
                    checked={syslogEnabled}
                    onChange={(e) => setSyslogEnabled(e.target.checked)}
                    id="syslog-enable"
                    disabled={isCapturing || isStopping}
                    sx={{
                      padding: "4px",
                      color: "#64748b",
                      "&.Mui-checked": { color: C.accent },
                      cursor:
                        isCapturing || isStopping ? "not-allowed" : "pointer",
                    }}
                  />
                  <label
                    htmlFor="syslog-enable"
                    style={{
                      fontSize: 14,
                      color: C.valueText,
                      cursor:
                        isCapturing || isStopping ? "not-allowed" : "pointer",
                    }}
                  >
                    {SC_LABELS.enable}
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <label
                  className="sm:w-[280px] whitespace-nowrap"
                  style={labelStyle}
                >
                  {SC_LABELS.syslogDest}
                </label>
                <input
                  type="text"
                  value={syslogDest}
                  onChange={(e) => setSyslogDest(e.target.value)}
                  disabled={!syslogEnabled || isCapturing || isStopping}
                  style={{
                    ...inputStyle,
                    width: "100%",
                    maxWidth: 220,
                    backgroundColor:
                      !syslogEnabled || isCapturing || isStopping
                        ? SYSTEM_TOOLS_FILL_BG_READ_ONLY
                        : SYSTEM_TOOLS_FILL_BG_EDITABLE,
                    opacity:
                      !syslogEnabled || isCapturing || isStopping ? 0.6 : 1,
                    cursor:
                      !syslogEnabled || isCapturing || isStopping
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
                  <label
                    className="sm:w-[280px] whitespace-nowrap"
                    style={labelStyle}
                  >
                    {SC_LABELS.pcmTs}
                  </label>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <select
                      style={{ ...inputStyle, minWidth: 100 }}
                      value={i === 0 ? ts1Pcm : ts2Pcm}
                      onChange={(e) =>
                        i === 0
                          ? setTs1Pcm(e.target.value)
                          : setTs2Pcm(e.target.value)
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
                    style={{ minWidth: 100, height: 33, fontSize: 13 }}
                  >
                    {SC_BUTTONS.start}
                  </Btn>
                  <Btn
                    variant="cancel"
                    style={{ minWidth: 100, height: 33, fontSize: 13 }}
                  >
                    {SC_BUTTONS.stop}
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
                  <label
                    className="sm:w-[280px] whitespace-nowrap"
                    style={labelStyle}
                  >
                    {SC_LABELS.pcmTs}
                  </label>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <select
                      style={{ ...inputStyle, minWidth: 100 }}
                      value={i === 0 ? e1aPcm : e1bPcm}
                      onChange={(e) =>
                        i === 0
                          ? setE1aPcm(e.target.value)
                          : setE1bPcm(e.target.value)
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
                    style={{ minWidth: 100, height: 33, fontSize: 13 }}
                  >
                    {SC_BUTTONS.start}
                  </Btn>
                  <Btn
                    variant="cancel"
                    style={{ minWidth: 100, height: 33, fontSize: 13 }}
                  >
                    {SC_BUTTONS.stop}
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
            style={signalingCaptureFooterBtnStyle}
          >
            {SC_BUTTONS.clean}
          </Btn>
          <Btn
            variant="cancel"
            type="button"
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
