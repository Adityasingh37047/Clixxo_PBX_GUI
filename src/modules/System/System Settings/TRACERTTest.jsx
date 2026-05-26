import React, { useEffect, useState, useRef } from "react";
import {
  postTracerttest,
  fetchSystemInfo,
  postLinuxCmd,
} from "../../../api/apiService";
import {
  TRACERT_TITLE,
  TRACERT_LABELS,
  TRACERT_SOURCE_OPTIONS,
  TRACERT_BUTTONS,
} from "../../../constants/TRACERTTestConstants";
import { Alert } from "@mui/material";

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
  border: `1px solid ${C.cardBorder}`,
  background: C.cardBg,
  color: C.valueText,
  outline: "none",
  transition: "border-color 0.2s ease",
};

const inputInteraction = {
  onFocus: (e) => (e.target.style.borderColor = C.accent),
  onBlur: (e) => (e.target.style.borderColor = C.cardBorder),
  onMouseEnter: (e) => {
    if (document.activeElement !== e.target)
      e.target.style.borderColor = "#94a3b8";
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

function isValidJumps(val) {
  const num = Number(val);
  return Number.isInteger(num) && num >= 1 && num <= 255;
}

const TRACERTTest = () => {
  const [sourceIp, setSourceIp] = useState("");
  const [destIp, setDestIp] = useState("");
  const [maxJumps, setMaxJumps] = useState("");
  const [info, setInfo] = useState("");
  const [loadind, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const intervalRef = useRef(null);
  const [sourceIpError, setSourceIpError] = useState("");
  const [destIpError, setDestIpError] = useState("");
  const [jumpsError, setJumpsError] = useState("");
  const [sourceOptions, setSourceOptions] = useState([]);
  const [loadingSource, setLoadingSource] = useState(true);

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
              "Failed to detect VLAN IP for tracert source options:",
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
          setSourceOptions(TRACERT_SOURCE_OPTIONS);
          setSourceIp(TRACERT_SOURCE_OPTIONS[0].value);
        }
      } catch (error) {
        console.error("Error fetching system info:", error);
        setSourceOptions(TRACERT_SOURCE_OPTIONS);
        setSourceIp(TRACERT_SOURCE_OPTIONS[0].value);
      } finally {
        setLoadingSource(false);
      }
    };

    fetchSystemData();
  }, []);

  const startTracert = async () => {
    setSourceIpError("");
    setDestIpError("");
    setJumpsError("");
    let valid = true;
    if (!isValidIp(sourceIp)) {
      setSourceIpError("Please enter a valid IP address.");
      valid = false;
    }
    if (!isValidIp(destIp)) {
      setDestIpError("Please enter a valid IP address.");
      valid = false;
    }
    if (maxJumps && !isValidJumps(maxJumps)) {
      setJumpsError("Maximum Jumps must be between 1 and 255.");
      valid = false;
    }
    if (!valid) return;
    setLoading(true);
    if (!maxJumps) {
      if (!intervalRef.current) {
        const success = await handleTracert();
        if (success) {
          intervalRef.current = setInterval(() => {
            handleTracert();
          }, 2000);
        } else {
          setLoading(false);
        }
      }
    } else {
      await handleTracert();
      setLoading(false);
    }
  };

  const stopTracertInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setLoading(false);
    showMessage("info", "Tracert stopped!");
  };

  const stopTracertOnError = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setLoading(false);
  };

  const handleTracert = async () => {
    try {
      const Apiresponse = await postTracerttest({
        destIp,
        maxJumps,
        sourceIp,
      });
      console.log("Tracert API Response:", Apiresponse);

      if (Apiresponse.response) {
        if (maxJumps) {
          setInfo(Apiresponse.responseData);
        } else {
          setInfo((prev) =>
            prev
              ? prev + "\n" + Apiresponse.responseData
              : Apiresponse.responseData,
          );
          console.log("Tracert result:", Apiresponse.responseData);
        }
        return true;
      } else {
        setInfo((prev) =>
          prev
            ? prev + "\n" + (Apiresponse.message || "No response data")
            : Apiresponse.message || "No response data",
        );
        showMessage("error", Apiresponse.message || "Server error occurred");
        stopTracertOnError();
        return false;
      }
    } catch (err) {
      console.error("Tracert API Error:", err);
      showMessage(
        "error",
        "Server is not connected. Please check your connection.",
      );
      stopTracertOnError();
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
            {TRACERT_TITLE}
          </span>
        </div>

        {/* ── Main Card ── */}
        <div
          style={{
            background: C.cardBg,
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: C.cardShadow,
            marginBottom: 24,
            border: `1px solid ${C.cardBorder}`,
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
              padding: "10px 14px",
              borderBottom: `1px solid ${C.divider}`,
              background: C.cardBg,
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: C.strongText,
                letterSpacing: "0.02em",
              }}
            >
              Tracert Test
            </span>
          </div>

          {/* Card Body */}
          <div style={{ padding: "24px 32px" }}>
            <div className="flex flex-col gap-6">
              {/* Form Rows */}
              {/* Form Rows */}
              <div className="flex flex-col gap-4 w-full" style={{ maxWidth: 460, margin: "0 auto" }}>
                
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
                    {TRACERT_LABELS.sourceIp}
                  </label>
                  <div style={{ width: 280 }}>
                    <select
                      style={inputStyle}
                      value={sourceIp}
                      onChange={(e) => {
                        setSourceIp(e.target.value);
                        setInfo("");
                        setSourceIpError("");
                      }}
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
                    {sourceIpError && (
                      <div style={{ color: C.errorRed, fontSize: 11, marginTop: 4 }}>
                        {sourceIpError}
                      </div>
                    )}
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
                    {TRACERT_LABELS.destIp}
                  </label>
                  <div style={{ width: 280 }}>
                    <input
                      type="text"
                      style={{
                        ...inputStyle,
                        borderColor: destIpError ? C.errorRed : C.cardBorder
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
                      <div style={{ color: C.errorRed, fontSize: 11, marginTop: 4 }}>
                        {destIpError}
                      </div>
                    )}
                  </div>
                </div>

                {/* Max Jumps */}
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
                    {TRACERT_LABELS.maxJumps}
                  </label>
                  <div style={{ width: 280 }}>
                    <input
                      type="number"
                      style={{
                        ...inputStyle,
                        borderColor: jumpsError ? C.errorRed : C.cardBorder
                      }}
                      value={maxJumps}
                      onChange={(e) => {
                        setMaxJumps(e.target.value);
                        setInfo("");
                        setJumpsError("");
                      }}
                      {...inputInteraction}
                    />
                    {jumpsError && (
                      <div style={{ color: C.errorRed, fontSize: 11, marginTop: 4 }}>
                        {jumpsError}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Buttons Row */}
              <div className="flex flex-wrap gap-4 mt-2 mb-2 justify-start sm:justify-center">
                <Btn
                  variant="primary"
                  onClick={startTracert}
                  disabled={loadind}
                  style={{ minWidth: 100 }}
                >
                  {loadind
                    ? TRACERT_BUTTONS.loading || "Loading..."
                    : TRACERT_BUTTONS.start || "Start"}
                </Btn>
                <Btn
                  variant="cancel"
                  onClick={stopTracertInterval}
                  style={{ minWidth: 100 }}
                >
                  {TRACERT_BUTTONS.end}
                </Btn>
              </div>

              {/* Logs Row */}
              <div className="flex flex-col gap-2">
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: C.labelText,
                  }}
                >
                  {TRACERT_LABELS.info}
                </label>
                <textarea
                  style={{
                    ...inputStyle,
                    height: "auto",
                    minHeight: 180,
                    maxHeight: 320,
                    fontFamily: "monospace",
                    fontSize: 12,
                    lineHeight: 1.5,
                    resize: "vertical",
                    whiteSpace: "pre-wrap",
                    backgroundColor: "#f8fafc",
                    borderColor: C.cardBorder,
                  }}
                  value={info}
                  onChange={(e) => setInfo(e.target.value)}
                  readOnly
                  onFocus={(e) => (e.target.style.borderColor = C.accent)}
                  onBlur={(e) => (e.target.style.borderColor = C.cardBorder)}
                  onMouseEnter={(e) => {
                    if (document.activeElement !== e.target)
                      e.target.style.borderColor = "#94a3b8";
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
    </div>
  );
};

export default TRACERTTest;
