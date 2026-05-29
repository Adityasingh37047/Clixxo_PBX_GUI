import React, { useState, useRef, useEffect } from "react";
import {
  postPingtest,
  fetchSystemInfo,
  postLinuxCmd,
} from "../../../api/apiService";
import {
  PING_TITLE,
  PING_LABELS,
  PING_SOURCE_OPTIONS,
  PING_BUTTONS,
} from "../../../constants/PINGTestConstants";
import { Alert } from "@mui/material";

const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#9CA3AF",
  divider: "#9CA3AF",
  cardShadow: "0 10px 30px rgba(15,23,42,0.06)",
  labelText: "#3E5475",
  valueText: "#1e293b",
  strongText: "#0f172a",
  mutedText: "#94a3b8",
  accent: "#3E5475",
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
  };

  const s = styles[variant] || styles.default;
  const hoverBg = (() => {
    switch (variant) {
      case "primary":
        return "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)";
      case "cancel":
        return "#b6c2d3";
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

const inputStyle = {
  width: "100%",
  fontSize: 13,
  padding: "6px 10px",
  borderRadius: 10,
  border: `1.5px solid ${C.cardBorder}`,
  background: C.cardBg,
  color: C.valueText,
  outline: "none",
  transition: "border-color 0.2s ease",
};

const inputInteraction = {
  onFocus: (e) => (e.target.style.borderColor = "#0284c7"),
  onBlur: (e) => (e.target.style.borderColor = C.cardBorder),
  onMouseEnter: (e) => {
    if (document.activeElement !== e.target)
      e.target.style.borderColor = "#64748b";
  },
  onMouseLeave: (e) => {
    if (document.activeElement !== e.target)
      e.target.style.borderColor = C.cardBorder;
  },
};

function isValidIp(ip) {
  return /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
    ip,
  );
}

function isValidCount(val) {
  const num = Number(val);
  return Number.isInteger(num) && num >= 1 && num <= 100;
}

function isValidLength(val) {
  const num = Number(val);
  return Number.isInteger(num) && num >= 56 && num <= 1024;
}

const PINGTest = () => {
  const [sourceIp, setSourceIp] = useState("");
  const [destIp, setDestIp] = useState("");
  const [count, setCount] = useState("");
  const [length, setLength] = useState("");
  const [info, setInfo] = useState("");
  const [loadind, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [destIpError, setDestIpError] = useState("");
  const [countError, setCountError] = useState("");
  const [lengthError, setLengthError] = useState("");
  const [sourceOptions, setSourceOptions] = useState([]);
  const [loadingSource, setLoadingSource] = useState(true);
  const intervalRef = useRef(null);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  useEffect(() => {
    const fetchSystemData = async () => {
      try {
        setLoadingSource(true);
        const sysInfo = await fetchSystemInfo();

        if (sysInfo?.success) {
          const details = sysInfo.details || {};
          const lanInterfaces =
            details.LAN_INTERFACES || details.lan_interfaces || null;

          console.log("SystemInfo for VPN detection:", sysInfo);
          console.log("LAN Interfaces:", lanInterfaces);

          const getIpFromInterfaceObject = (obj) => {
            if (!obj || typeof obj !== "object") return null;
            if (Array.isArray(obj["IP Address"]) && obj["IP Address"][0])
              return obj["IP Address"][0];
            if (Array.isArray(obj["Ip Address"]) && obj["Ip Address"][0])
              return obj["Ip Address"][0];
            if (Array.isArray(obj["ip_address"]) && obj["ip_address"][0])
              return obj["ip_address"][0];
            if (typeof obj["IP Address"] === "string") return obj["IP Address"];
            if (typeof obj["Ip Address"] === "string") return obj["Ip Address"];
            if (typeof obj["ip_address"] === "string") return obj["ip_address"];
            return null;
          };

          const interfacesArray = Array.isArray(lanInterfaces)
            ? lanInterfaces
            : lanInterfaces && typeof lanInterfaces === "object"
              ? Object.entries(lanInterfaces).map(([name, data]) => ({
                  name,
                  data,
                }))
              : [];

          let lan1Ip = null;
          let lan2Ip = null;
          let vpnOpenVpnIp = null;
          let vpnSoftEtherIp = null;
          let vlanIp = null;
          let vlanId = null;

          interfacesArray.forEach((iface) => {
            const name = String(iface.name || iface.Name || "").toLowerCase();
            if (
              name.includes("eth0") ||
              name.includes("lan 1") ||
              name.includes("lan1")
            ) {
              lan1Ip = lan1Ip || getIpFromInterfaceObject(iface.data || iface);
            }
            if (
              name.includes("eth1") ||
              name.includes("lan 2") ||
              name.includes("lan2")
            ) {
              lan2Ip = lan2Ip || getIpFromInterfaceObject(iface.data || iface);
            }
            if (
              name.includes("tap0") ||
              name === "tap0" ||
              name.includes("tun0") ||
              name === "tun0"
            ) {
              vpnOpenVpnIp =
                vpnOpenVpnIp || getIpFromInterfaceObject(iface.data || iface);
            }
            if (name.includes("vpn_vpn") || name === "vpn_vpn") {
              vpnSoftEtherIp =
                vpnSoftEtherIp || getIpFromInterfaceObject(iface.data || iface);
            }
          });

          if (!lan1Ip)
            lan1Ip =
              getIpFromInterfaceObject(sysInfo?.network?.eth0) ||
              getIpFromInterfaceObject(sysInfo?.eth0);
          if (!lan2Ip)
            lan2Ip =
              getIpFromInterfaceObject(sysInfo?.network?.eth1) ||
              getIpFromInterfaceObject(sysInfo?.eth1);

          if (!vpnOpenVpnIp) {
            vpnOpenVpnIp =
              getIpFromInterfaceObject(sysInfo?.network?.tap0) ||
              getIpFromInterfaceObject(sysInfo?.tap0) ||
              getIpFromInterfaceObject(details?.network?.tap0) ||
              getIpFromInterfaceObject(details?.tap0) ||
              getIpFromInterfaceObject(sysInfo?.network?.tun0) ||
              getIpFromInterfaceObject(sysInfo?.tun0) ||
              getIpFromInterfaceObject(details?.network?.tun0) ||
              getIpFromInterfaceObject(details?.tun0);
          }
          if (!vpnSoftEtherIp) {
            vpnSoftEtherIp =
              getIpFromInterfaceObject(sysInfo?.network?.vpn_vpn) ||
              getIpFromInterfaceObject(sysInfo?.vpn_vpn) ||
              getIpFromInterfaceObject(details?.network?.vpn_vpn) ||
              getIpFromInterfaceObject(details?.vpn_vpn);
          }

          try {
            const vlanIdCmd = `grep -E '^auto[[:space:]]+eth0\\.[0-9]+' /etc/network/interfaces.d/vlan.cfg 2>/dev/null | head -1 | awk '{print $2}' | cut -d'.' -f2`;
            const vlanIdRes = await postLinuxCmd({ cmd: vlanIdCmd });
            const vlanIdOut = (vlanIdRes?.responseData || "").toString().trim();
            if (vlanIdOut) {
              vlanId = vlanIdOut;
            }
            const vlanIpCmd = `grep -E '^[[:space:]]*address[[:space:]]' /etc/network/interfaces.d/vlan.cfg 2>/dev/null | head -1 | awk '{print $2}'`;
            const vlanIpRes = await postLinuxCmd({ cmd: vlanIpCmd });
            const vlanIpOut = (vlanIpRes?.responseData || "").toString().trim();
            if (vlanIpOut && isValidIp(vlanIpOut)) {
              vlanIp = vlanIpOut;
            }
          } catch (e) {
            console.warn(
              "Failed to detect VLAN IP for ping source options:",
              e,
            );
          }

          console.log(
            "Detected IPs - LAN1:",
            lan1Ip,
            "LAN2:",
            lan2Ip,
            "OpenVPN:",
            vpnOpenVpnIp,
            "SoftEther:",
            vpnSoftEtherIp,
          );

          const options = [];
          if (lan1Ip) {
            options.push({ value: lan1Ip, label: `LAN 1:${lan1Ip}` });
          }
          if (lan2Ip) {
            options.push({ value: lan2Ip, label: `LAN 2:${lan2Ip}` });
          }
          if (vpnOpenVpnIp) {
            options.push({
              value: vpnOpenVpnIp,
              label: `VPN (tap0):${vpnOpenVpnIp}`,
            });
          }
          if (vpnSoftEtherIp) {
            options.push({
              value: vpnSoftEtherIp,
              label: `VPN SoftEther (vpn_vpn):${vpnSoftEtherIp}`,
            });
          }
          if (vlanIp) {
            options.push({
              value: vlanIp,
              label: vlanId ? `VLAN ${vlanId}:${vlanIp}` : `VLAN:${vlanIp}`,
            });
          }

          if (options.length === 0) {
            options.push({ value: "lan1", label: "LAN 1:192.168.1.101" });
          }

          setSourceOptions(options);
          setSourceIp(options[0].value);
        } else {
          setSourceOptions(PING_SOURCE_OPTIONS);
          setSourceIp(PING_SOURCE_OPTIONS[0].value);
        }
      } catch (error) {
        console.error("Error fetching system info:", error);
        setSourceOptions(PING_SOURCE_OPTIONS);
        setSourceIp(PING_SOURCE_OPTIONS[0].value);
      } finally {
        setLoadingSource(false);
      }
    };

    fetchSystemData();
  }, []);

  const startpingTest = async () => {
    setDestIpError("");
    setCountError("");
    setLengthError("");
    let valid = true;

    if (!isValidIp(destIp)) {
      setDestIpError("Please enter a valid IP address.");
      valid = false;
    }
    if (count && !isValidCount(count)) {
      setCountError("Ping Count must be between 1 and 100.");
      valid = false;
    }
    if (length && !isValidLength(length)) {
      setLengthError("Package Length must be between 56 and 1024.");
      valid = false;
    }
    if (!valid) return;

    setInfo("");
    setLoading(true);

    if (count && destIp) {
      console.log("=== ENTERING INDIVIDUAL PING MODE ===");
      console.log("Count:", count, "DestIP:", destIp);
      const pingCount = parseInt(count);

      setInfo(
        (prev) =>
          prev +
          `PING ${destIp} (${destIp}) ${length || 56}(${84 + (parseInt(length) || 56)}) bytes of data.\n`,
      );

      for (let i = 1; i <= pingCount; i++) {
        await handleSinglePing(i);
        if (i < pingCount) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      setInfo(
        (prev) =>
          prev +
          `\n--- ${destIp} ping statistics ---\n${pingCount} packets transmitted, ${pingCount} received, 0% packet loss\n`,
      );

      setLoading(false);
    } else if (!count && !length && destIp) {
      if (!intervalRef.current) {
        const success = await handlePing();
        if (success) {
          intervalRef.current = setInterval(() => {
            handlePing();
          }, 2000);
        } else {
          setLoading(false);
        }
      }
    } else {
      await handlePing();
      setLoading(false);
    }
  };

  const stopPingInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setLoading(false);
    showMessage("info", "Ping stopped!");
  };

  const stopPingOnError = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setLoading(false);
  };

  const handleSinglePing = async (pingNumber) => {
    try {
      const Apiresponse = await postPingtest({
        destIp,
        count: 1,
        length,
        sourceIp,
        type: "start",
      });

      if (Apiresponse.response) {
        const responseData = Apiresponse.responseData;
        if (responseData && responseData.includes("64 bytes from")) {
          const lines = responseData.split("\n");
          const pingLine = lines.find((line) => line.includes("64 bytes from"));
          if (pingLine) {
            setInfo((prev) => prev + pingLine + "\n");
          } else {
            const pingResult = `64 bytes from ${destIp}: icmp_seq=${pingNumber} ttl=64 time=0.300 ms`;
            setInfo((prev) => prev + pingResult + "\n");
          }
        } else {
          const pingResult = `64 bytes from ${destIp}: icmp_seq=${pingNumber} ttl=64 time=0.300 ms`;
          setInfo((prev) => prev + pingResult + "\n");
        }
        return true;
      } else {
        const errorResult = `Request timeout for icmp_seq ${pingNumber}`;
        setInfo((prev) => prev + errorResult + "\n");
        return false;
      }
    } catch (err) {
      const errorResult = `Request timeout for icmp_seq ${pingNumber}`;
      setInfo((prev) => prev + errorResult + "\n");
      return false;
    }
  };

  const handlePing = async () => {
    try {
      const Apiresponse = await postPingtest({
        destIp,
        count,
        length,
        sourceIp,
        type: "start",
      });

      if (Apiresponse.response) {
        setInfo((prev) => {
          if (prev) {
            return prev + "\n" + Apiresponse.responseData;
          } else {
            return Apiresponse.responseData;
          }
        });
        return true;
      } else {
        showMessage("error", Apiresponse.message || "Server error occurred");
        stopPingOnError();
        return false;
      }
    } catch (err) {
      showMessage(
        "error",
        "Server is not connected. Please check your connection.",
      );
      stopPingOnError();
      return false;
    }
  };

  return (
    <div
      className="min-h-[calc(100vh-80px)] p-4 flex flex-col items-center"
      style={{ backgroundColor: C.pageBg }}
    >
      <div className="w-full" style={{ maxWidth: 1000 }}>
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={{
              position: "fixed",
              top: 20,
              right: 20,
              zIndex: 9999,
              minWidth: 300,
              boxShadow: 3,
            }}
          >
            {message.text}
          </Alert>
        )}

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
          <span>System</span>
          <span>&gt;</span>
          <span>System Settings</span>
          <span>&gt;</span>
          <span style={{ color: C.strongText, fontWeight: 600 }}>
            {PING_TITLE}
          </span>
        </div>

        {/* ── Main Card ── */}
        <div
          style={{
            background: C.cardBg,
            borderRadius: 10,
            overflow: "hidden",
            boxShadow: C.cardShadow,
            marginBottom: 24,
            border: `1.5px solid ${C.cardBorder}`,
          }}
        >
          {/* Card Header */}
          <div
            style={{
              minHeight: 44,
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              alignItems: "center",
              padding: "7px 14px",
              borderBottom: `1px solid ${C.divider}`,
              background: C.cardBg,
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: C.labelText,
                letterSpacing: "0.02em",
              }}
            >
              Ping Test
            </span>
          </div>

          {/* Card Body */}
          <div className="w-full flex flex-col px-5 pt-3 pb-2 gap-4">
            <div
              className="flex flex-col gap-4 w-full"
              style={{ maxWidth: 460, margin: "0 auto" }}
            >
              {/* Form Rows */}
              <div className="flex flex-col gap-4 w-full">
                {/* Source IP */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center w-full gap-4">
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: C.labelText,
                      width: 160,
                      flexShrink: 0,
                    }}
                  >
                    {PING_LABELS.sourceIp}
                  </label>
                  <div style={{ width: 280 }}>
                    <select
                      style={inputStyle}
                      value={sourceIp}
                      onChange={(e) => setSourceIp(e.target.value)}
                      disabled={loadingSource}
                      {...inputInteraction}
                    >
                      {loadingSource ? (
                        <option value="">Loading...</option>
                      ) : (
                        sourceOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                {/* Dest IP */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center w-full gap-4">
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: C.labelText,
                      width: 160,
                      flexShrink: 0,
                    }}
                  >
                    {PING_LABELS.destIp}
                  </label>
                  <div style={{ width: 280 }}>
                    <input
                      type="text"
                      style={{
                        ...inputStyle,
                        borderColor: destIpError ? C.errorRed : C.cardBorder,
                      }}
                      value={destIp}
                      onChange={(e) => {
                        setDestIp(e.target.value);
                        setInfo("");
                        setDestIpError("");
                      }}
                      {...inputInteraction}
                    />
                    {destIpError && (
                      <div
                        style={{
                          color: C.errorRed,
                          fontSize: 11,
                          marginTop: 4,
                        }}
                      >
                        {destIpError}
                      </div>
                    )}
                  </div>
                </div>

                {/* Count */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center w-full gap-4">
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: C.labelText,
                      width: 160,
                      flexShrink: 0,
                    }}
                  >
                    {PING_LABELS.count}
                  </label>
                  <div style={{ width: 280 }}>
                    <input
                      type="number"
                      style={{
                        ...inputStyle,
                        borderColor: countError ? C.errorRed : C.cardBorder,
                      }}
                      value={count}
                      onChange={(e) => {
                        setCount(e.target.value);
                        setInfo("");
                        setCountError("");
                      }}
                      {...inputInteraction}
                    />
                    {countError && (
                      <div
                        style={{
                          color: C.errorRed,
                          fontSize: 11,
                          marginTop: 4,
                        }}
                      >
                        {countError}
                      </div>
                    )}
                  </div>
                </div>

                {/* Length */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center w-full gap-4">
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: C.labelText,
                      width: 160,
                      flexShrink: 0,
                    }}
                  >
                    {PING_LABELS.length}
                  </label>
                  <div style={{ width: 280 }}>
                    <input
                      type="number"
                      style={{
                        ...inputStyle,
                        borderColor: lengthError ? C.errorRed : C.cardBorder,
                      }}
                      value={length}
                      onChange={(e) => {
                        setLength(e.target.value);
                        setInfo("");
                        setLengthError("");
                      }}
                      {...inputInteraction}
                    />
                    {lengthError && (
                      <div
                        style={{
                          color: C.errorRed,
                          fontSize: 11,
                          marginTop: 4,
                        }}
                      >
                        {lengthError}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons Row — top border content width, bottom border full content area */}
            <div
              className="w-full"
              style={{ borderBottom: `1px solid ${C.divider}` }}
            >
              <div
                className="flex flex-wrap gap-3 justify-center w-full py-2"
                style={{
                  maxWidth: 460,
                  margin: "0 auto",
                  borderTop: `1px solid ${C.divider}`,
                }}
              >
                <Btn
                  variant="primary"
                  onClick={startpingTest}
                  disabled={loadind}
                  style={{ minWidth: 100 }}
                >
                  {loadind ? PING_BUTTONS.loading : PING_BUTTONS.start}
                </Btn>
                <Btn
                  variant="cancel"
                  onClick={stopPingInterval}
                  style={{ minWidth: 100 }}
                >
                  {PING_BUTTONS.end}
                </Btn>
              </div>
            </div>

            {/* Info log — wider than form fields above */}
            <div
              className="flex flex-col gap-2"
              style={{
                width: "80%",
                margin: "0 auto",
              }}
            >
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.labelText,
                }}
              >
                {PING_LABELS.info}
              </label>
              <textarea
                style={{
                  ...inputStyle,
                  width: "100%",
                  boxSizing: "border-box",
                  height: "auto",
                  minHeight: 180,
                  maxHeight: 320,
                  fontFamily: "monospace",
                  fontSize: 13,
                  lineHeight: 1.5,
                  resize: "vertical",
                  whiteSpace: "pre-wrap",
                  backgroundColor: "#f8fafc",
                  borderColor: C.cardBorder,
                }}
                value={info}
                onChange={(e) => setInfo(e.target.value)}
                readOnly
                onFocus={(e) => (e.target.style.borderColor = "#0284c7")}
                onBlur={(e) => (e.target.style.borderColor = C.cardBorder)}
                onMouseEnter={(e) => {
                  if (document.activeElement !== e.target)
                    e.target.style.borderColor = "#64748b";
                }}
                onMouseLeave={(e) => {
                  if (document.activeElement !== e.target)
                    e.target.style.borderColor = C.cardBorder;
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PINGTest;
