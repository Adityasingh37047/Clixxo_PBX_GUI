import React, { useEffect, useState, useRef } from "react";
import { Alert } from "@mui/material";
import { Tooltip } from "@mui/material";
import { postTracerttest, fetchNetwork } from "../../../api/apiService";
import {
  TRACERT_TITLE,
  TRACERT_LABELS,
  TRACERT_SOURCE_OPTIONS,
  TRACERT_BUTTONS,
} from "../../../constants/TRACERTTestConstants";

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
  sourceIp:
    "Select the source IP address from which the traceroute request will be sent.",
  destIp:
    "Enter the destination IP address or hostname to trace the network path.",
  maxJumps:
    "Specify the maximum number of hops the traceroute can traverse before stopping.",
  info:
    "Displays traceroute results, including intermediate hops and response details.",
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

const tracertPageWrapStyle = {
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

const tracertPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
};

const tracertCardShellStyle = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  padding: "6px",
  boxSizing: "border-box",
};

const tracertTableContainerStyle = {
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

const tracertToolbarStyle = {
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

const tracertFieldGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 18,
  width: "100%",
};

const tracertFixedAlertSx = {
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

const TracertPageShell = ({ children }) => (
  <div style={tracertPageWrapStyle} data-native-scroll>
    <div style={tracertPageInnerStyle}>{children}</div>
  </div>
);

const TracertBreadcrumb = () => (
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
    <span style={{ color: "#1e293b", fontWeight: 600 }}>{TRACERT_TITLE}</span>
  </div>
);

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
  const [error, setError] = useState(false);
  const [loadind, setLoading] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const intervalRef = useRef(null);
  const [sourceIpError, setSourceIpError] = useState("");
  const [destIpError, setDestIpError] = useState("");
  const [jumpsError, setJumpsError] = useState("");
  const [sourceOptions, setSourceOptions] = useState([]);
  const [loadingSource, setLoadingSource] = useState(true);

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
          setSourceOptions(TRACERT_SOURCE_OPTIONS);
          setSourceIp(TRACERT_SOURCE_OPTIONS[0]?.value || "");
        }
      } catch (error) {
        console.error("Error fetching network interfaces:", error);
        setSourceOptions(TRACERT_SOURCE_OPTIONS);
        setSourceIp(TRACERT_SOURCE_OPTIONS[0]?.value || "");
      } finally {
        setLoadingSource(false);
      }
    };

    loadSourceOptions();
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
    if (!valid) {
      showToast("Please correct the errors before starting.", "error");
      return;
    }
    setLoading(true);
    if (!maxJumps) {
      // Interval mode: run every 2 seconds
      if (!intervalRef.current) {
        // Call once immediately and check if it succeeds before starting interval
        const success = await handleTracert();
        if (success) {
          intervalRef.current = setInterval(() => {
            handleTracert();
          }, 2000);
          showToast("Continuous tracert started.", "success");
        } else {
          setLoading(false);
        }
      } else {
        showToast("Tracert test is already running.", "warning");
        setLoading(false);
      }
    } else {
      // Single run mode
      showToast("Tracert test started.", "info");
      const success = await handleTracert();
      setLoading(false);
      if (success) {
        showToast("Tracert test completed.", "success");
      }
    }
  };

  const stopTracertInterval = () => {
    const wasRunning = !!intervalRef.current || loadind;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setLoading(false);
    if (wasRunning) {
      showToast("Tracert stopped.", "success");
    } else {
      showToast("No tracert test is running.", "warning");
    }
  };

  const stopTracertOnError = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setLoading(false);
    // Don't show "Tracert stopped!" message for errors
  };

  const handleTracert = async () => {
    setError(false);
    try {
      const Apiresponse = await postTracerttest({
        destIp,
        maxJumps,
        sourceIp,
      });
      console.log("Tracert API Response:", Apiresponse);

      // Check if response is successful
      if (Apiresponse.response) {
        if (maxJumps) {
          // Single run mode: replace info
          setInfo(Apiresponse.responseData);
        } else {
          // Interval mode: append result
          setInfo((prev) =>
            prev
              ? prev + "\n" + Apiresponse.responseData
              : Apiresponse.responseData,
          );
          console.log("Tracert result:", Apiresponse.responseData);
        }
        return true; // Success
      } else {
        setInfo((prev) =>
          prev
            ? prev + "\n" + (Apiresponse.message || "No response data")
            : Apiresponse.message || "No response data",
        );
        showToast(Apiresponse.message || "Server error occurred", "error");
        stopTracertOnError();
        return false; // Failed
      }
    } catch (err) {
      console.error("Tracert API Error:", err);
      showToast(
        "Server is not connected. Please check your connection.",
        "error",
      );
      setError(true);
      stopTracertOnError();
      return false; // Failed
    }
  };

  return (
    <TracertPageShell>
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={() => setToast({ msg: "", type: "success" })}
          sx={tracertFixedAlertSx}
        >
          {toast.msg}
        </Alert>
      )}

      <TracertBreadcrumb />

      <div style={tracertCardShellStyle}>
        <div style={tracertTableContainerStyle}>
          <div style={tracertToolbarStyle}>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: C.labelText,
                letterSpacing: "0.02em",
              }}
            >
              {TRACERT_TITLE}
            </span>
          </div>

          <div style={{ padding: "16px 36px 32px" }}>
            <div
              className="flex flex-col w-full"
              style={{
                ...tracertFieldGroupStyle,
                maxWidth: 640,
                margin: "0 auto",
              }}
            >
              <FieldRow name="sourceIp" label={TRACERT_LABELS.sourceIp}>
                <div>
                  <select
                    style={selectStyle}
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
                  <div style={{ minHeight: 18, marginTop: 2 }}>
                    {sourceIpError && (
                      <span style={{ color: C.errorRed, fontSize: 11 }}>
                        {sourceIpError}
                      </span>
                    )}
                  </div>
                </div>
              </FieldRow>

              <FieldRow name="destIp" label={TRACERT_LABELS.destIp}>
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

              <FieldRow name="maxJumps" label={TRACERT_LABELS.maxJumps}>
                <div>
                  <input
                    type="number"
                    style={inputStyle}
                    value={maxJumps}
                    onChange={(e) => {
                      setMaxJumps(e.target.value);
                      setInfo("");
                      setJumpsError("");
                    }}
                    {...inputInteraction}
                  />
                  <div style={{ minHeight: 18, marginTop: 2 }}>
                    {jumpsError && (
                      <span style={{ color: C.errorRed, fontSize: 11 }}>
                        {jumpsError}
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
              onClick={stopTracertInterval}
              style={advancedFormBtnStyle}
            >
              {TRACERT_BUTTONS.end}
            </Btn>
            <Btn
              variant="primary"
              onClick={startTracert}
              disabled={loadind}
              style={advancedFormBtnStyle}
            >
              {loadind
                ? TRACERT_BUTTONS.loading || "Loading..."
                : TRACERT_BUTTONS.start || "Start"}
            </Btn>
          </div>

          <div style={{ padding: "16px 36px 32px" }}>
            <SectionHeading title={TRACERT_LABELS.info} isFirst />
            <textarea
              style={textareaStyle}
              value={info}
              onChange={(e) => setInfo(e.target.value)}
              {...inputInteraction}
            />
          </div>
        </div>
      </div>
    </TracertPageShell>
  );
};

export default TRACERTTest;
