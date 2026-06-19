import React, { useEffect, useState, useRef } from "react";
import { Alert } from "@mui/material";
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
  cardBorder: "#9CA3AF",
  divider: "#9CA3AF",
  cardShadow: "0 10px 30px rgba(15,23,42,0.06)",
  labelText: "#3E5475",
  valueText: "#1e293b",
  strongText: "#0f172a",
  mutedText: "#94a3b8",
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
// ── Local field UI (inlined from systemSharedUi) ──
const OUTLINED_BORDER = "rgba(0, 0, 0, 0.23)";
const OUTLINED_HOVER = "rgba(0, 0, 0, 0.87)";
const OUTLINED_FOCUS = "#1976d2";
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

const nativeFieldInputStyle = {
  height: 28,
  width: 200,
  padding: "0 8px",
  fontSize: 13,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 4,
  outline: "none",
  backgroundColor: "#fff",
  color: "#0f172a",
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

const systemToolFieldInputStyle = {
  ...nativeFieldBase,
  width: "100%",
  padding: "6px 10px",
  borderRadius: 10,
  boxSizing: "border-box",
  background: "#fff",
  lineHeight: 1.4,
  minHeight: 34,
};

const systemToolFieldSelectStyle = {
  ...systemToolFieldInputStyle,
  appearance: "auto",
  minHeight: 36,
  paddingTop: 7,
  paddingBottom: 7,
  lineHeight: 1.35,
};

const inputStyle = systemToolFieldInputStyle;
const selectStyle = systemToolFieldSelectStyle;

const BTN_BASE =
  "inline-flex items-center justify-center gap-[6px] h-[30px] px-[14px] py-[6px] rounded-[10px] text-[12px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border disabled:cursor-not-allowed disabled:opacity-60";
const BTN_DEFAULT = `${BTN_BASE} bg-white text-[#0f172a] border-[#9ca3af] hover:bg-[#e2e8f0]`;
const BTN_OUTLINE = `${BTN_BASE} bg-white text-[#3E5475] border-[#9CA3AF] hover:bg-[#e2e8f0]`;
const BTN_CANCEL = `${BTN_BASE} bg-[#cbd5e1] text-[#374151] border-[#cbd5e1] shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-[#b6c2d3]`;
const BTN_PRIMARY = `${BTN_BASE} text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)]`;
const BTN_ERROR = `${BTN_BASE} bg-[#dc2626] text-white border-[#dc2626] hover:bg-[#b91c1c]`;
const BTN_DELETE = `${BTN_BASE} bg-[#fee2e2] text-[#991b1b] border-[#fecaca] hover:bg-[#fecaca]`;
const BTN_EDIT = `${BTN_BASE} bg-[#dcfce7] text-[#166534] border-[#bbf7d0] hover:bg-[#bbf7d0]`;
const BTN_DANGER = `${BTN_BASE} bg-[#fef2f2] text-[#dc2626] border-[0.5px] border-[#fecaca] hover:bg-[#fca5a5]`;

const btnVariantCls = {
  default: BTN_DEFAULT,
  primary: BTN_PRIMARY,
  cancel: BTN_CANCEL,
  outline: BTN_OUTLINE,
  error: BTN_ERROR,
  delete: BTN_DELETE,
  edit: BTN_EDIT,
  danger: BTN_DANGER,
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
  background: C.cardBg,
  border: `1.5px solid ${C.cardBorder}`,
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
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  padding: "7px 14px",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  borderBottom: `1px solid ${C.divider}`,
};

const labelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: C.labelText,
  width: 160,
  flexShrink: 0,
};

const fieldWrapStyle = { width: 280 };

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
    <div
      className="min-h-[calc(100vh-80px)] p-4 flex flex-col items-center"
      style={{ backgroundColor: C.pageBg }}
    >
      <div className="w-full" style={{ maxWidth: 1000 }}>
        {toast.msg && (
          <Alert
            severity={toast.type}
            onClose={() => setToast({ msg: "", type: "success" })}
            sx={SYS_TOAST_SX}
          >
            {toast.msg}
          </Alert>
        )}

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

        <div style={tableContainerStyle}>
          <div style={blueBarStyle}>
            <span>{TRACERT_TITLE}</span>
          </div>

          <div className="w-full flex flex-col px-5 pt-3 pb-2">
            <div
              className="flex flex-col gap-0 w-full"
              style={{ maxWidth: 460, margin: "0 auto" }}
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                <span style={labelStyle}>{TRACERT_LABELS.sourceIp}</span>
                <div style={fieldWrapStyle}>
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
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                <span style={labelStyle}>{TRACERT_LABELS.destIp}</span>
                <div style={fieldWrapStyle}>
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
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                <span style={labelStyle}>{TRACERT_LABELS.maxJumps}</span>
                <div style={fieldWrapStyle}>
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
              </div>
            </div>

            <div className="w-full mt-1 flex flex-col items-center">
              <div
                className="w-full flex flex-col items-center"
                style={{ maxWidth: 460, margin: "0 auto" }}
              >
                <div
                  className="w-full flex flex-wrap gap-3 justify-center py-2"
                  style={{ borderTop: `1px solid ${C.divider}` }}
                >
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
              </div>
              <div
                style={{
                  width: "100%",
                  borderBottom: `1px solid ${C.divider}`,
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div
              className="flex flex-col gap-2"
              style={{ width: "80%", margin: "8px auto 0", maxWidth: "100%" }}
            >
              <span style={{ ...labelStyle, width: "auto" }}>
                {TRACERT_LABELS.info}
              </span>
              <textarea
                style={{
                  ...inputStyle,
                  minHeight: 180,
                  maxHeight: 320,
                  fontSize: 12,
                  fontFamily: "monospace",
                  lineHeight: 1.5,
                  resize: "vertical",
                  whiteSpace: "pre-wrap",
                  backgroundColor: "#f8fafc",
                }}
                value={info}
                onChange={(e) => setInfo(e.target.value)}
                {...inputInteraction}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TRACERTTest;
