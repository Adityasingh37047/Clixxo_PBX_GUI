import React, { useState, useEffect } from "react";
import {
  SC_SECTIONS,
  SC_LABELS,
  SC_PCM_OPTIONS,
  SC_TS_OPTIONS,
  SC_BUTTONS,
  SC_NOTE,
} from "../../../constants/SignalingCaptureConstants";
import { Alert, CircularProgress } from "@mui/material";
import { fetchSystemInfo, postLinuxCmd } from "../../../api/apiService";

// ── Color palette (same as UserManage) ────────────────────────────────────────
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#e2e8f0",
  divider: "#f1f5f9",
  cardShadow: "0 4px 20px rgba(15,23,42,0.06)",
  labelText: "#64748b",
  valueText: "#1e293b",
  strongText: "#0f172a",
  mutedText: "#94a3b8",
  accent: "#0284c7",
  primary: "#2563eb",
  primaryHover: "#1d4ed8",
  errorRed: "#dc2626",
};

// ── Button Component (same as UserManage) ────────────────────────────────────
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
      background: "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
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
  borderRadius: 20,
  boxShadow: C.cardShadow,
  overflow: "hidden",
  marginBottom: 24,
};

const blueBarStyle = {
  width: "100%",
  height: 44,
  background: C.cardBg,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  marginBottom: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start", // Left alignment as requested
  padding: "0 20px",
  fontWeight: 700,
  fontSize: 13,
  color: C.strongText,
  borderBottom: `1px solid ${C.divider}`,
};

const inputStyle = {
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 8,
  padding: "6px 12px",
  fontSize: 14,
  color: C.valueText,
  background: C.cardBg,
  outline: "none",
  transition: "border-color 0.15s ease",
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
  const [captureProcessId, setCaptureProcessId] = useState(null);
  const [captureFileName, setCaptureFileName] = useState("");

  // Toast alert
  const [toast, setToast] = useState({ msg: "", type: "success" });

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

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 5000);
  };

  const handleFocus = (e) => {
    if (!e.target.disabled) e.target.style.borderColor = C.primary;
  };
  const handleBlur = (e) => {
    if (!e.target.disabled) e.target.style.borderColor = C.cardBorder;
  };

  // Fetch system info and populate network options
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

      const now = new Date();
      const dateStr = now.toISOString().split("T")[0].replace(/-/g, "_");
      const fileName = `/mnt/data/signaling_capture_${dateStr}.pcap`;
      setCaptureFileName(fileName);

      const dest = syslogDest.trim();
      const filterExpr =
        syslogEnabled && dest
          ? `host ${dest} and (udp port 514 or tcp port 514)`
          : "";
      const tcpdumpCmd = `tcpdump -U -i ${interfaceName} -s 0 -w '${fileName}' ${filterExpr ? `'${filterExpr}'` : ""}`;
      const logPath = "/mnt/data/tcpdump_capture.log";

      await postLinuxCmd({
        cmd: `pkill -f 'tcpdump.*signaling_capture' 2>/dev/null || true`,
      });
      await new Promise((r) => setTimeout(r, 800));

      const cmd = `sh -c "mkdir -p /mnt/data; rm -f '${fileName}'; touch '${fileName}'; chmod 666 '${fileName}' || true; ${tcpdumpCmd} > /dev/null 2> '${logPath}' < /dev/null & echo \\$!"`;
      const response = await postLinuxCmd({ cmd });

      if (response?.response === false) {
        const logTailRes = await postLinuxCmd({
          cmd: `tail -n 5 ${logPath} 2>/dev/null || true`,
        });
        const logTail = String(logTailRes?.responseData || "").trim();
        showToast(
          `Failed to start capture: ${response?.message || "Unknown error"}${logTail ? `\n\nLog:\n${logTail}` : ""}`,
          "error",
        );
        return;
      }

      const pid = String(response?.responseData || "").trim();

      if (pid && /^\d+$/.test(pid)) {
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
          showToast(
            `Failed to start capture. tcpdump not running.\n${logTail ? `\nLog:\n${logTail}` : ""}`,
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
        showToast(`Started data capture on ${lanDisplay}!`, "success");
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
    try {
      if (captureProcessId) {
        await postLinuxCmd({
          cmd: `kill ${captureProcessId} 2>/dev/null || true`,
        });
      }
      await postLinuxCmd({
        cmd: `pkill -f 'tcpdump.*signaling_capture' 2>/dev/null || true`,
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));
      await postLinuxCmd({ cmd: "sync" });

      const checkFileCmd = `ls -la ${captureFileName} 2>/dev/null || echo "FILE_NOT_FOUND"`;
      const fileResponse = await postLinuxCmd({ cmd: checkFileCmd });
      const fileInfo = String(fileResponse?.responseData || "").trim();

      if (fileInfo.includes("FILE_NOT_FOUND")) {
        showToast("Capture file not found on server.", "error");
      } else {
        const pktCountCmd = `tcpdump -n -q -r ${captureFileName} -c 1 2>/dev/null | wc -l`;
        const pktRes = await postLinuxCmd({ cmd: pktCountCmd });
        const pktCount =
          parseInt(String(pktRes?.responseData || "0").trim(), 10) || 0;
        if (pktCount === 0) {
          showToast(
            "Data capture stopped but no packets were recorded.",
            "warning",
          );
        } else {
          showToast("Data capture stopped! Downloading...", "success");

          try {
            const downloadCmd = `base64 ${captureFileName}`;
            const downloadResponse = await postLinuxCmd({ cmd: downloadCmd });

            if (downloadResponse?.responseData) {
              const b64 = downloadResponse.responseData.replace(/\s+/g, "");
              const byteCharacters = atob(b64);
              const byteNumbers = new Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i += 1) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers);
              const blob = new Blob([byteArray], {
                type: "application/vnd.tcpdump.pcap",
              });

              const url = window.URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              const downloadDate = new Date()
                .toISOString()
                .split("T")[0]
                .replace(/-/g, "_");
              link.download = `signaling_capture_${downloadDate}.pcap`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
              await postLinuxCmd({
                cmd: `rm -f '${captureFileName}' /mnt/data/tcpdump_capture.log 2>/dev/null || true`,
              });
            } else {
              showToast("Failed to download capture file.", "error");
            }
          } catch (downloadError) {
            console.error("Error downloading file:", downloadError);
            showToast(
              "Error downloading capture file. Please try again.",
              "error",
            );
          }
        }
      }

      setIsCapturing(false);
      setCaptureProcessId(null);
      setCaptureFileName("");
    } catch (error) {
      console.error("Error stopping data capture:", error);
      showToast("Error stopping data capture. Please try again.", "error");
    }
  };

  return (
    <div
      className="min-h-[calc(100vh-80px)] p-4 flex flex-col items-center"
      style={{ backgroundColor: C.pageBg }}
    >
      <div className="w-full" style={{ maxWidth: 1000 }}>
        {/* ── Breadcrumb ── */}
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

        {/* Alerts */}
        {toast.msg && (
          <Alert
            severity={toast.type}
            onClose={() => setToast({ msg: "", type: "success" })}
            sx={{
              position: "fixed",
              top: 20,
              right: 20,
              zIndex: 9999,
              minWidth: 300,
              boxShadow: 3,
            }}
          >
            {toast.msg}
          </Alert>
        )}

        {/* Data Capture Section */}
        <div style={tableContainerStyle}>
          <div style={blueBarStyle}>
            <span>{SC_SECTIONS[0]}</span>
          </div>
          <div className="flex flex-col p-6 gap-6">
            <div className="flex flex-col gap-6">
              {/* Network Interface Row exactly like TS Recording rows */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                  <label className="text-[14px] font-semibold text-gray-700 sm:w-[280px] whitespace-nowrap">
                    {SC_LABELS.networkInterface}
                  </label>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <select
                      style={{ ...inputStyle, width: "100%", minWidth: 220 }}
                      value={network}
                      onChange={(e) => setNetwork(e.target.value)}
                      disabled={loading || isCapturing}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
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
                <div className="flex flex-row flex-wrap gap-4 justify-start lg:justify-end mt-2 lg:mt-0">
                  <Btn
                    variant="primary"
                    onClick={handleStartCapture}
                    disabled={isCapturing}
                    style={{ minWidth: 100, height: 36, fontSize: 13 }}
                  >
                    {SC_BUTTONS.start}
                  </Btn>
                  <Btn
                    variant="cancel"
                    onClick={handleStopCapture}
                    disabled={!isCapturing}
                    style={{ minWidth: 100, height: 36, fontSize: 13 }}
                  >
                    {SC_BUTTONS.stop}
                  </Btn>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <label className="text-[14px] font-semibold text-gray-700 sm:w-[280px] whitespace-nowrap">
                  {SC_LABELS.captureSyslog}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={syslogEnabled}
                    onChange={(e) => setSyslogEnabled(e.target.checked)}
                    id="syslog-enable"
                    disabled={isCapturing}
                    style={{
                      width: 16,
                      height: 16,
                      cursor: isCapturing ? "not-allowed" : "pointer",
                      accentColor: C.primary,
                    }}
                  />
                  <label
                    htmlFor="syslog-enable"
                    style={{
                      fontSize: 14,
                      color: C.valueText,
                      cursor: isCapturing ? "not-allowed" : "pointer",
                    }}
                  >
                    {SC_LABELS.enable}
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <label className="text-[14px] font-semibold text-gray-700 sm:w-[280px] whitespace-nowrap">
                  {SC_LABELS.syslogDest}
                </label>
                <input
                  type="text"
                  value={syslogDest}
                  onChange={(e) => setSyslogDest(e.target.value)}
                  disabled={!syslogEnabled || isCapturing}
                  style={{
                    ...inputStyle,
                    width: "100%",
                    maxWidth: 220,
                    opacity: !syslogEnabled || isCapturing ? 0.6 : 1,
                    cursor:
                      !syslogEnabled || isCapturing ? "not-allowed" : "text",
                  }}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>

              <div className="mt-2 text-center">
                <span
                  style={{
                    fontSize: 13,
                    color: C.errorRed,
                    fontWeight: 500,
                  }}
                >
                  {SC_NOTE}
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* TS Recording Section */}
        <div style={tableContainerStyle}>
          <div style={blueBarStyle}>
            <span>{SC_SECTIONS[1]}</span>
          </div>
          <div className="p-6 flex flex-col gap-6">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-gray-100 last:border-b-0 last:pb-0"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                  <label className="text-[14px] font-semibold text-gray-700 sm:w-[280px] whitespace-nowrap">
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
                      onFocus={handleFocus}
                      onBlur={handleBlur}
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
                      onFocus={handleFocus}
                      onBlur={handleBlur}
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
                    style={{ minWidth: 100, height: 34, fontSize: 13 }}
                  >
                    {SC_BUTTONS.start}
                  </Btn>
                  <Btn
                    variant="cancel"
                    style={{ minWidth: 100, height: 34, fontSize: 13 }}
                  >
                    {SC_BUTTONS.stop}
                  </Btn>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* E1 Two-way Recording Section */}
        <div style={tableContainerStyle}>
          <div style={blueBarStyle}>
            <span>{SC_SECTIONS[2]}</span>
          </div>
          <div className="p-6 flex flex-col gap-6">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-gray-100 last:border-b-0 last:pb-0"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                  <label className="text-[14px] font-semibold text-gray-700 sm:w-[280px] whitespace-nowrap">
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
                      onFocus={handleFocus}
                      onBlur={handleBlur}
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
                      onFocus={handleFocus}
                      onBlur={handleBlur}
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
                    style={{ minWidth: 100, height: 34, fontSize: 13 }}
                  >
                    {SC_BUTTONS.start}
                  </Btn>
                  <Btn
                    variant="cancel"
                    style={{ minWidth: 100, height: 34, fontSize: 13 }}
                  >
                    {SC_BUTTONS.stop}
                  </Btn>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className="flex justify-center items-center gap-6 mt-4 mb-12 flex-wrap">
          <Btn
            variant="primary"
            style={{ minWidth: 120, height: 38, fontSize: 13 }}
          >
            {SC_BUTTONS.clean}
          </Btn>
          <Btn
            variant="cancel"
            style={{ minWidth: 120, height: 38, fontSize: 13 }}
          >
            {SC_BUTTONS.download}
          </Btn>
        </div>
      </div>
    </div>
  );
};

export default SignalingCapture;
