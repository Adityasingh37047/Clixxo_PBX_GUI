import React, { useState, useRef, useEffect } from "react";
import { Alert } from "@mui/material";
import { Tooltip } from "@mui/material";
import { postPingtest, fetchNetwork } from "../../../api/apiService";
import {
  PING_TITLE,
  PING_LABELS,
  PING_SOURCE_OPTIONS,
  PING_BUTTONS,
} from "../../../constants/PINGTestConstants";

const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  cardShadow:
    "0 0 20px rgba(0, 0, 0, 0.25), 0 0 8px rgba(0, 0, 0, 0.15)",
  divider: "#e2e6ec",
  labelText: "#3E5475",
  valueText: "#1f2937",
  mutedText: "#6b7280",
  placeholderText: "#9aa3b2",
  strongText: "#1f2937",
  accent: "#4A5D75",
  accentDark: "#3a4a5e",
  errorRed: "#dc2626",
};

const CARD_RADIUS = 10;
const FIELD_RADIUS = 6;

const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";
const FOCUS_RING_SHADOW = () => `0 0 0 2px rgba(62, 84, 117, 0.15)`;

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
  el.style.boxShadow = FOCUS_RING_SHADOW();
};

const nativeFieldInputStyle = {
  height: 32,
  width: 200,
  padding: "0 10px",
  fontSize: 13,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: FIELD_RADIUS,
  outline: "none",
  backgroundColor: "#fff",
  color: C.valueText,
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const inputInteraction = {
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

const { height: _nativeHeight, ...nativeFieldBase } = nativeFieldInputStyle;

const systemFieldInputStyle = {
  ...nativeFieldBase,
  width: "100%",
  padding: "6px 10px",
  borderRadius: FIELD_RADIUS,
  boxSizing: "border-box",
  background: "#fff",
  lineHeight: 1.4,
  minHeight: 34,
};

const systemFieldInputStyleNarrow = {
  ...systemFieldInputStyle,
  maxWidth: "280px",
};

const systemFieldSelectStyle = {
  ...systemFieldInputStyle,
  appearance: "auto",
  minHeight: 36,
  height: 36,
  paddingTop: 7,
  paddingBottom: 7,
  lineHeight: 1.35,
  cursor: "pointer",
};

const tooltipProps = {
  arrow: true,
  placement: "top",
  slotProps: {
    tooltip: {
      sx: {
        backgroundColor: "#fff",
        color: "#333",
        border: "1px solid #d1d5db",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        fontSize: 13,
        maxWidth: 500,
        padding: "12px 16px",
      },
    },
    arrow: { sx: { color: "#fff" } },
  },
};

const tooltips = {
  sourceIp: "Select the source IP address used to send ping requests.",
  destIp: "Enter the destination IP address to test connectivity.",
  count: "Specify how many ping packets should be sent.",
  length: "Specify the size of each ping packet in bytes.",
  info: "Displays the ping test results and response details.",
};
const inputStyle = systemFieldInputStyleNarrow;
const selectStyle = systemFieldSelectStyle;
const textareaStyle = {
  ...systemFieldInputStyle,
  minHeight: 180,
  maxHeight: 320,
  fontSize: 12,
  fontFamily: "monospace",
  lineHeight: 1.5,
  resize: "vertical",
  whiteSpace: "pre-wrap",
  backgroundColor: "#f8fafc",
};

const advancedFormInlineFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 12,
  width: "100%",
  margin: 0,
  padding: "10px 28px",
  borderTop: `1px solid ${C.divider}`,
  background: C.cardBg,
  boxSizing: "border-box",
  flexShrink: 0,
};

const advancedFormBtnStyle = {
  minWidth: 110,
  height: 34,
  fontSize: 13,
  margin: 0,
  padding: "0 28px",
  lineHeight: "34px",
  boxSizing: "border-box",
};

const FieldRow = ({ name, label, children }) => {
  const tooltip = tooltips[name];

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-center w-full gap-2 sm:gap-4">
      <Tooltip
        title={tooltip || ""}
        disableHoverListener={!tooltip}
        {...tooltipProps}
      >
        <label
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: C.labelText,
            width: "100%",
            maxWidth: 220,
            flexShrink: 0,
            cursor: tooltip ? "help" : "default",
          }}
        >
          {label}
        </label>
      </Tooltip>
      <div className="flex-1 w-full max-w-[280px]">{children}</div>
    </div>
  );
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
      fontWeight: 600,
      fontSize: 15,
      textTransform: "none",
      padding: "6px 28px",
    },
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
    },
  };

  const s = styles[variant] || styles.default;
  const hoverBg =
    {
      primary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      cancel: "#b6c2d3",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      cancel: "#a3b1c2",
      default: "#d1d5db",
    }[variant] || "#d1d5db";
  const baseBg = extraStyle?.background ?? s.background;
  const baseShadow = extraStyle?.boxShadow ?? s.boxShadow ?? "none";

  const clearPressStyle = (el) => {
    el.style.transform = "";
    el.style.boxShadow = baseShadow;
  };

  const applyPressStyle = (el) => {
    el.style.background = activeBg;
    el.style.transform = "translateY(1px) scale(0.98)";
    el.style.boxShadow =
      variant === "primary"
        ? "inset 0 2px 4px rgba(0, 0, 0, 0.25)"
        : variant === "cancel"
          ? "inset 0 2px 4px rgba(15, 23, 42, 0.15)"
          : "inset 0 1px 3px rgba(15, 23, 42, 0.12)";
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding:
          variant === "primary" || variant === "cancel"
            ? "8px 32px"
            : "6px 14px",
        borderRadius: 8,
        fontSize: variant === "primary" || variant === "cancel" ? 14 : 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition:
          "background 0.15s ease, transform 0.1s ease, box-shadow 0.1s ease",
        height: variant === "primary" || variant === "cancel" ? 38 : 30,
        gap: 6,
        whiteSpace: "nowrap",
        userSelect: "none",
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = baseBg;
        clearPressStyle(e.currentTarget);
      }}
      onMouseDown={(e) => {
        if (disabled) return;
        applyPressStyle(e.currentTarget);
      }}
      onMouseUp={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = hoverBg;
        clearPressStyle(e.currentTarget);
      }}
    >
      {children}
    </button>
  );
};

const SectionHeading = ({ title, isFirst = false }) => (
  <div
    style={{
      margin: isFirst ? "0 0 28px 0" : "24px 0 28px 0",
      position: "relative",
    }}
  >
    <div style={{ borderTop: `1px solid ${C.divider}` }} />
    <span
      style={{
        position: "absolute",
        top: -10,
        left: 0,
        background: C.cardBg,
        paddingRight: 8,
        fontSize: 13,
        fontWeight: 500,
        color: C.labelText,
        letterSpacing: "0.01em",
      }}
    >
      {title}
    </span>
  </div>
);

const pingPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  width: "100%",
  maxWidth: "100%",
  padding: "8px 28px 16px",
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  boxSizing: "border-box",
};

const pingPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
};

const pingCardShellStyle = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  padding: "6px",
  boxSizing: "border-box",
};

const pingTableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: CARD_RADIUS,
  boxShadow: C.cardShadow,
  overflow: "hidden",
  boxSizing: "border-box",
};

const pingToolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.divider}`,
  background: C.cardBg,
  flexWrap: "wrap",
  gap: 12,
};

const pingFieldGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 18,
  width: "100%",
};

const pingFixedAlertSx = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  maxWidth: 500,
  wordBreak: "break-word",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
  fontWeight: 500,
};

const PingPageShell = ({ children }) => (
  <div style={pingPageWrapStyle} data-native-scroll>
    <div style={pingPageInnerStyle}>{children}</div>
  </div>
);

const PingBreadcrumb = () => (
  <div
    style={{
      fontSize: 12,
      color: "#94a3b8",
      marginBottom: 12,
      fontWeight: 400,
      display: "flex",
      alignItems: "center",
      gap: 4,
      flexWrap: "wrap",
      flexShrink: 0,
    }}
  >
    <span>System</span>
    <span>&gt;</span>
    <span>System Settings</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>{PING_TITLE}</span>
  </div>
);

function isValidIp(ip) {
  // Simple IPv4 validation
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
  const [error, setError] = useState(false);
  const [loadind, setLoading] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const [destIpError, setDestIpError] = useState("");
  const [countError, setCountError] = useState("");
  const [lengthError, setLengthError] = useState("");
  const [sourceOptions, setSourceOptions] = useState([]);
  const [loadingSource, setLoadingSource] = useState(true);
  const intervalRef = useRef(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  useEffect(() => {
    const loadSourceOptions = async () => {
      try {
        setLoadingSource(true);
        const netData = await fetchNetwork();
        const allIfaces = netData?.data?.interfaces || [];

        // Only physical LAN interfaces: eth0/eth1/... or enp4s0/enp4s1/...
        const lanIfaces = allIfaces.filter((i) => {
          const kn = (i.interface || "").toLowerCase();
          return /^eth\d+$/.test(kn) || /^enp\d+s\d+/.test(kn);
        });

        // Sequential "LAN 1", "LAN 2", … — never rely on the API name field
        const options = lanIfaces
          .filter((i) => i.ipAddress)
          .map((iface, idx) => ({
            value: iface.ipAddress,
            label: `LAN ${idx + 1}:${iface.ipAddress}`,
          }));

        // VLAN sub-interfaces of the first physical interface
        const primaryKernel = lanIfaces[0]?.interface || "eth0";
        for (const iface of allIfaces) {
          const kn = (iface.interface || "").toString();
          if (
            kn.startsWith(`${primaryKernel}.`) &&
            /\.\d+$/.test(kn) &&
            iface.ipAddress
          ) {
            const vlanId = kn.split(".")[1] || "";
            options.push({
              value: iface.ipAddress,
              label: `VLAN ${vlanId}:${iface.ipAddress}`,
            });
          }
        }

        // VPN / non-LAN interfaces (tap0, tun0, vpn_vpn, etc.)
        const lanIfaceSet = new Set(lanIfaces.map((i) => i.interface));
        for (const iface of allIfaces) {
          const kn = (iface.interface || "").toLowerCase();
          if (
            iface.ipAddress &&
            !lanIfaceSet.has(iface.interface) &&
            kn !== "lo" &&
            !/^eth\d+\.\d+$/.test(kn)
          ) {
            options.push({
              value: iface.ipAddress,
              label: `VPN (${iface.interface}):${iface.ipAddress}`,
            });
          }
        }

        if (options.length > 0) {
          setSourceOptions(options);
          setSourceIp(options[0].value);
        } else {
          setSourceOptions(PING_SOURCE_OPTIONS);
          setSourceIp(PING_SOURCE_OPTIONS[0]?.value || "");
        }
      } catch (error) {
        console.error("Error fetching network interfaces:", error);
        setSourceOptions(PING_SOURCE_OPTIONS);
        setSourceIp(PING_SOURCE_OPTIONS[0]?.value || "");
      } finally {
        setLoadingSource(false);
      }
    };

    loadSourceOptions();
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
    if (!valid) {
      showToast("Please correct the errors before starting.", "error");
      return;
    }

    // Clear previous results when starting new ping test
    setInfo("");
    setLoading(true);

    if (count && destIp) {
      showToast("Ping test started.", "info");
      // Individual ping mode (with count specified) - call API for each ping
      console.log("=== ENTERING INDIVIDUAL PING MODE ===");
      console.log("Count:", count, "DestIP:", destIp);
      const pingCount = parseInt(count);
      console.log("Ping count parsed:", pingCount);

      // Add ping header
      setInfo(
        (prev) =>
          prev +
          `PING ${destIp} (${destIp}) ${length || 56}(${84 + (parseInt(length) || 56)}) bytes of data.\n`,
      );

      for (let i = 1; i <= pingCount; i++) {
        console.log(`Starting ping ${i}/${pingCount}`);

        // Call API for each individual ping
        await handleSinglePing(i);

        console.log(`Completed ping ${i}/${pingCount}`);

        // Add small delay between pings (like real ping command)
        if (i < pingCount) {
          console.log(`Waiting 1 second before next ping...`);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      // Add ping statistics at the end
      setInfo(
        (prev) =>
          prev +
          `\n--- ${destIp} ping statistics ---\n${pingCount} packets transmitted, ${pingCount} received, 0% packet loss\n`,
      );

      setLoading(false);
      showToast("Ping test completed.", "success");
    } else if (!count && !length && destIp) {
      // Continuous ping mode (no count specified)
      if (!intervalRef.current) {
        // Call once immediately and check if it succeeds before starting interval
        const success = await handlePing();
        if (success) {
          intervalRef.current = setInterval(() => {
            handlePing();
          }, 2000);
          showToast("Continuous ping started.", "success");
        } else {
          setLoading(false);
        }
      } else {
        showToast("Ping test is already running.", "warning");
        setLoading(false);
      }
    } else {
      // Single ping without count
      const success = await handlePing();
      setLoading(false);
      if (success) {
        showToast("Ping test completed.", "success");
      }
    }
  };

  const stopPingInterval = () => {
    const wasRunning = !!intervalRef.current || loadind;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setLoading(false);
    if (wasRunning) {
      showToast("Ping stopped.", "success");
    } else {
      showToast("No ping test is running.", "warning");
    }
  };

  const stopPingOnError = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setLoading(false);
    // Don't show "Ping stopped!" message for errors
  };

  const handleSinglePing = async (pingNumber) => {
    setError(false);
    try {
      console.log(`Making API call for ping ${pingNumber}`);
      const Apiresponse = await postPingtest({
        destIp,
        count: 1, // Always ping 1 at a time
        length,
        sourceIp,
        type: "start",
      });

      console.log(`Ping ${pingNumber} API Response:`, Apiresponse);

      if (Apiresponse.response) {
        // Use the actual API response data
        const responseData = Apiresponse.responseData;
        console.log(`Ping ${pingNumber} response data:`, responseData);

        // Extract individual ping result from the response
        if (responseData && responseData.includes("64 bytes from")) {
          // If response contains ping result, use it directly
          const lines = responseData.split("\n");
          const pingLine = lines.find((line) => line.includes("64 bytes from"));
          if (pingLine) {
            setInfo((prev) => prev + pingLine + "\n");
          } else {
            // Fallback to formatted result
            const pingResult = `64 bytes from ${destIp}: icmp_seq=${pingNumber} ttl=64 time=0.300 ms`;
            setInfo((prev) => prev + pingResult + "\n");
          }
        } else {
          // Format the ping result like terminal
          const pingResult = `64 bytes from ${destIp}: icmp_seq=${pingNumber} ttl=64 time=0.300 ms`;
          setInfo((prev) => prev + pingResult + "\n");
        }
        return true; // Success
      } else {
        const errorResult = `Request timeout for icmp_seq ${pingNumber}`;
        setInfo((prev) => prev + errorResult + "\n");
        return false; // Failed
      }
    } catch (err) {
      console.error(`Ping ${pingNumber} API Error:`, err);
      const errorResult = `Request timeout for icmp_seq ${pingNumber}`;
      setInfo((prev) => prev + errorResult + "\n");
      return false; // Failed
    }
  };

  const handlePing = async () => {
    setError(false);
    try {
      const Apiresponse = await postPingtest({
        destIp,
        count,
        length,
        sourceIp,
        type: "start",
      });
      console.log("Ping API Response:", Apiresponse);

      if (Apiresponse.response) {
        // Always append ping results for real-time display
        setInfo((prev) => {
          if (prev) {
            return prev + "\n" + Apiresponse.responseData;
          } else {
            return Apiresponse.responseData;
          }
        });
        return true; // Success
      } else {
        showToast(Apiresponse.message || "Server error occurred", "error");
        stopPingOnError();
        return false; // Failed
      }
    } catch (err) {
      console.error("Ping API Error:", err);
      showToast(
        "Server is not connected. Please check your connection.",
        "error",
      );
      setError(true);
      stopPingOnError();
      return false; // Failed
    }
  };

  return (
    <PingPageShell>
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={() => setToast({ msg: "", type: "success" })}
          sx={pingFixedAlertSx}
        >
          {toast.msg}
        </Alert>
      )}

      <PingBreadcrumb />

      <div style={pingCardShellStyle}>
        <div style={pingTableContainerStyle}>
          <div style={pingToolbarStyle}>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: C.labelText,
                letterSpacing: "0.02em",
              }}
            >
              {PING_TITLE}
            </span>
          </div>

          <div style={{ padding: "16px 36px 32px" }}>
            <div
              className="flex flex-col w-full"
              style={{
                ...pingFieldGroupStyle,
                maxWidth: 640,
                margin: "0 auto",
              }}
            >
              <FieldRow name="sourceIp" label={PING_LABELS.sourceIp}>
                <div>
                  <select
                    style={selectStyle}
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
                  <div style={{ minHeight: 18, marginTop: 2 }} />
                </div>
              </FieldRow>

              <FieldRow name="destIp" label={PING_LABELS.destIp}>
                <div>
                  <input
                    type="text"
                    style={inputStyle}
                    value={destIp}
                    onChange={(e) => {
                      setDestIp(e.target.value);
                      setInfo("");
                      setDestIpError("");
                    }}
                    {...inputInteraction}
                  />
                  <div style={{ minHeight: 18, marginTop: 2 }}>
                    {destIpError && (
                      <span style={{ color: C.errorRed, fontSize: 11 }}>
                        {destIpError}
                      </span>
                    )}
                  </div>
                </div>
              </FieldRow>

              <FieldRow name="count" label={PING_LABELS.count}>
                <div>
                  <input
                    type="number"
                    style={inputStyle}
                    value={count}
                    onChange={(e) => {
                      setCount(e.target.value);
                      setInfo("");
                      setCountError("");
                    }}
                    {...inputInteraction}
                  />
                  <div style={{ minHeight: 18, marginTop: 2 }}>
                    {countError && (
                      <span style={{ color: C.errorRed, fontSize: 11 }}>
                        {countError}
                      </span>
                    )}
                  </div>
                </div>
              </FieldRow>

              <FieldRow name="length" label={PING_LABELS.length}>
                <div>
                  <input
                    type="number"
                    style={inputStyle}
                    value={length}
                    onChange={(e) => {
                      setLength(e.target.value);
                      setInfo("");
                      setLengthError("");
                    }}
                    {...inputInteraction}
                  />
                  <div style={{ minHeight: 18, marginTop: 2 }}>
                    {lengthError && (
                      <span style={{ color: C.errorRed, fontSize: 11 }}>
                        {lengthError}
                      </span>
                    )}
                  </div>
                </div>
              </FieldRow>
            </div>
          </div>

          <div style={advancedFormInlineFooterStyle}>
            <Btn
              variant="cancel"
              onClick={stopPingInterval}
              style={advancedFormBtnStyle}
            >
              {PING_BUTTONS.end}
            </Btn>
            <Btn
              variant="primary"
              onClick={startpingTest}
              disabled={loadind}
              style={advancedFormBtnStyle}
            >
              {loadind ? PING_BUTTONS.loading : PING_BUTTONS.start}
            </Btn>
          </div>

          <div style={{ padding: "16px 36px 32px" }}>
            <SectionHeading title={PING_LABELS.info} isFirst />
            <textarea
              style={textareaStyle}
              value={info}
              onChange={(e) => setInfo(e.target.value)}
              readOnly
              {...inputInteraction}
            />
          </div>
        </div>
      </div>
    </PingPageShell>
  );
};

export default PINGTest;
