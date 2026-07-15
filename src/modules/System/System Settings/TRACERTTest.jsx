import React, { useState, useRef, useEffect } from "react";
import { Alert, CircularProgress } from "@mui/material";
import { Tooltip } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { postTracerttest, fetchNetwork } from "../../../api/apiService";
import {
  TRACERT_LABELS,
  TRACERT_SOURCE_OPTIONS,
  TRACERT_BUTTONS,
  TRACERT_TEST_PAGE_BREADCRUMB_ROOT,
  TRACERT_TEST_PAGE_BREADCRUMB_SECTION,
  TRACERT_TEST_PAGE_TITLE,
  TRACERT_TEST_CARD_TITLE,
  TRACERT_TEST_SECTION_HEADING_COLOR,
  TRACERT_TEST_SECTION_CONFIG,
  TRACERT_TEST_SECTION_OUTPUT,
  TRACERT_TEST_OUTPUT_PLACEHOLDER,
  TRACERT_TEST_BTN_CLEAR,
  TRACERT_TEST_SOURCE_LOADING,
  TRACERT_TEST_FIELD_TOOLTIPS,
  TRACERT_TEST_ERR_INVALID_SOURCE_IP,
  TRACERT_TEST_ERR_INVALID_DEST_IP,
  TRACERT_TEST_ERR_INVALID_JUMPS,
  TRACERT_TEST_ERR_FIX_BEFORE_START,
  TRACERT_TEST_TOAST_STARTED,
  TRACERT_TEST_TOAST_COMPLETED,
  TRACERT_TEST_TOAST_CONTINUOUS_STARTED,
  TRACERT_TEST_TOAST_ALREADY_RUNNING,
  TRACERT_TEST_TOAST_STOPPED,
  TRACERT_TEST_TOAST_NOT_RUNNING,
  TRACERT_TEST_TOAST_SERVER_ERROR,
  TRACERT_TEST_TOAST_CONNECTION_ERROR,
} from "../../../constants/TRACERTTestConstants";
import {
  C,
  OUTLINED_BORDER,
  OUTLINED_HOVER,
  OUTLINED_FOCUS,
  FOCUS_RING_SHADOW,
} from "../../../theme/pbxTokens";
import {
  Btn,
  ExtensionBreadcrumb,
  EXTENSION_TABLE_CARD_RADIUS as CARD_RADIUS,
  extensionPageWrapStyle as tracertPageWrapStyle,
  extensionPageInnerStyle as tracertPageInnerStyleBase,
  extensionFixedAlertSx as tracertFixedAlertSx,
} from "../../../components/common";

const TRACERT_CARD_SHADOW =
  "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)";

const TRACERT_TEST_SCROLL_CLASS = "tracert-test-scroll";
const TRACERT_TEST_COMPACT_MQ = "(max-width: 768px)";
const TRACERT_TEST_LABEL_COL_WIDTH = 188;
const TRACERT_TEST_FIELD_COL_GAP = 16;
const TRACERT_TEST_FORM_PAD_X = 28;


const FIELD_RADIUS = 6;


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
  el.style.boxShadow = FOCUS_RING_SHADOW;
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
  minWidth: 0,
  maxWidth: "100%",
  padding: "0 12px",
  borderRadius: FIELD_RADIUS,
  boxSizing: "border-box",
  background: "#fff",
  lineHeight: 1.35,
  minHeight: 36,
  height: 36,
};

const systemFieldSelectStyle = {
  ...systemFieldInputStyle,
  appearance: "auto",
  paddingTop: 7,
  paddingBottom: 7,
  cursor: "pointer",
};

const inputStyle = systemFieldInputStyle;
const selectStyle = systemFieldSelectStyle;

const tracertFieldErrorStyle = {
  fontSize: 11,
  color: C.errorRed,
  marginTop: 6,
  lineHeight: 1.35,
};

const tracertFieldRowStyle = {
  display: "flex",
  flexDirection: "row",
  alignItems: "flex-start",
  width: "100%",
  gap: TRACERT_TEST_FIELD_COL_GAP,
};

const tracertFieldLabelWrapStyle = {
  flex: `0 0 ${TRACERT_TEST_LABEL_COL_WIDTH}px`,
  width: TRACERT_TEST_LABEL_COL_WIDTH,
  minWidth: TRACERT_TEST_LABEL_COL_WIDTH,
  maxWidth: TRACERT_TEST_LABEL_COL_WIDTH,
  paddingTop: 9,
};

const tracertFieldControlWrapStyle = {
  flex: "1 1 auto",
  minWidth: 0,
  width: "100%",
};

const tracertFooterBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 4,
  minWidth: 100,
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
        fontSize: 12,
        lineHeight: 1.45,
        maxWidth: 500,
        padding: "10px 12px",
        textTransform: "none",
        letterSpacing: "normal",
      },
    },
    arrow: { sx: { color: "#fff" } },
  },
};

const FieldRow = ({ name, label, children }) => {
  const tooltip = TRACERT_TEST_FIELD_TOOLTIPS[name];
  const labelNode = (
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: "100%",
        lineHeight: 1.4,
        wordBreak: "break-word",
        cursor: tooltip ? "help" : "default",
      }}
    >
      {label}
    </label>
  );

  return (
    <div style={tracertFieldRowStyle}>
      <div style={tracertFieldLabelWrapStyle}>
        {tooltip ? (
          <Tooltip title={tooltip} {...tooltipProps}>
            {labelNode}
          </Tooltip>
        ) : (
          labelNode
        )}
      </div>
      <div style={tracertFieldControlWrapStyle}>{children}</div>
    </div>
  );
};


const PanelTitle = ({ title, subtitle }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
    <span
      style={{
        fontSize: 14,
        fontWeight: 600,
        color: TRACERT_TEST_SECTION_HEADING_COLOR,
        letterSpacing: "0.01em",
      }}
    >
      {title}
    </span>
    {subtitle ? (
      <span style={{ fontSize: 12, color: C.mutedText, lineHeight: 1.4 }}>
        {subtitle}
      </span>
    ) : null}
  </div>
);

const tracertBodyStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 20,
  padding: `20px ${TRACERT_TEST_FORM_PAD_X}px 24px`,
  background: C.cardBg,
  boxSizing: "border-box",
};

const tracertConfigPanelStyle = {
  background: "#ffffff",
  border: `1px solid ${C.divider}`,
  borderRadius: 8,
  overflow: "hidden",
};

const tracertConfigHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  flexWrap: "wrap",
  padding: "14px 18px",
  borderBottom: `1px solid ${C.divider}`,
  background: "#ffffff",
};

const tracertConfigActionsStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
};

const tracertConfigBodyStyle = {
  padding: "18px 18px 20px",
};

const tracertFieldsGridStyle = (isCompact) => ({
  display: "grid",
  gridTemplateColumns: isCompact ? "1fr" : "1fr 1fr",
  gap: isCompact ? 16 : 24,
  width: "100%",
  alignItems: "start",
});

const tracertFieldsColumnStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
  minWidth: 0,
};

const tracertOutputPanelStyle = {
  border: `1px solid ${C.divider}`,
  borderRadius: 8,
  overflow: "hidden",
  background: C.cardBg,
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.02)",
};

const tracertOutputHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  padding: "12px 16px",
  borderBottom: `1px solid ${C.divider}`,
  background: "#ffffff",
};

const TRACERT_OUTPUT_BODY_BG = "#f1f5f9";

const tracertOutputBodyStyle = {
  backgroundColor: TRACERT_OUTPUT_BODY_BG,
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
  overflow: "hidden",
};

const tracertOutputTextareaStyle = {
  display: "block",
  width: "100%",
  minHeight: 220,
  maxHeight: 320,
  margin: 0,
  padding: "12px 16px 16px",
  border: "none",
  borderRadius: 0,
  outline: "none",
  resize: "vertical",
  boxSizing: "border-box",
  fontSize: 13,
  lineHeight: 1.6,
  fontFamily: "monospace",
  color: C.labelText,
  backgroundColor: "transparent",
  whiteSpace: "pre-wrap",
  cursor: "default",
};

const tracertPageInnerStyle = {
  ...tracertPageInnerStyleBase,
  display: "flex",
  flexDirection: "column",
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
  boxShadow: TRACERT_CARD_SHADOW,
  overflow: "hidden",
  boxSizing: "border-box",
};

const tracertHeaderStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: CARD_RADIUS,
  borderTopRightRadius: CARD_RADIUS,
  display: "flex",
  alignItems: "center",
  padding: "7px 14px",
  fontWeight: 700,
  fontSize: 13,
  color: "#3E5475",
  borderBottom: `1px solid ${C.divider}`,
  boxSizing: "border-box",
};

const tracertClearBtnStyle = tracertFooterBtnStyle;


const TracertScrollbarStyles = () => (
  <style>{`
    .${TRACERT_TEST_SCROLL_CLASS} {
      scroll-behavior: smooth;
      scrollbar-gutter: stable;
      scrollbar-width: thin;
      scrollbar-color: rgba(100, 116, 139, 0.45) transparent;
    }
    .${TRACERT_TEST_SCROLL_CLASS}::-webkit-scrollbar {
      width: 8px;
      height: 8px;
      transition: width 0.2s ease, height 0.2s ease;
    }
    .${TRACERT_TEST_SCROLL_CLASS}::-webkit-scrollbar:hover {
      width: 11px;
      height: 11px;
    }
    .${TRACERT_TEST_SCROLL_CLASS}::-webkit-scrollbar-corner {
      background: transparent;
    }
    .${TRACERT_TEST_SCROLL_CLASS}::-webkit-scrollbar-track {
      background: transparent;
    }
    .${TRACERT_TEST_SCROLL_CLASS}::-webkit-scrollbar-thumb {
      background-color: rgba(100, 116, 139, 0.45);
      border-radius: 6px;
      border: 2px solid transparent;
      background-clip: padding-box;
      transition: background-color 0.2s ease;
    }
    .${TRACERT_TEST_SCROLL_CLASS}::-webkit-scrollbar-thumb:hover {
      background-color: rgba(71, 85, 105, 0.65);
    }
  `}</style>
);

const TracertPageShell = ({ children }) => (
  <>
    <TracertScrollbarStyles />
    <div
      className={TRACERT_TEST_SCROLL_CLASS}
      style={tracertPageWrapStyle}
      data-native-scroll
    >
      <div style={tracertPageInnerStyle}>{children}</div>
    </div>
  </>
);

const TracertBreadcrumb = () => (
  <ExtensionBreadcrumb
    root={TRACERT_TEST_PAGE_BREADCRUMB_ROOT}
    section={TRACERT_TEST_PAGE_BREADCRUMB_SECTION}
    current={TRACERT_TEST_PAGE_TITLE}
  />
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
  const isCompact = useMediaQuery(TRACERT_TEST_COMPACT_MQ);
  const outputRef = useRef(null);
  const [sourceIp, setSourceIp] = useState("");
  const [destIp, setDestIp] = useState("");
  const [maxJumps, setMaxJumps] = useState("");
  const [info, setInfo] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const intervalRef = useRef(null);
  const [sourceIpError, setSourceIpError] = useState("");
  const [destIpError, setDestIpError] = useState("");
  const [jumpsError, setJumpsError] = useState("");
  const [sourceOptions, setSourceOptions] = useState([]);
  const [loadingSource, setLoadingSource] = useState(true);

  useEffect(() => {
    if (!outputRef.current || !info) return;
    outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [info]);

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

        const lanIfaces = allIfaces.filter((i) => {
          const kn = (i.interface || "").toLowerCase();
          return /^eth\d+$/.test(kn) || /^enp\d+s\d+/.test(kn);
        });

        const options = lanIfaces
          .filter((i) => i.ipAddress)
          .map((iface, idx) => ({
            value: iface.ipAddress,
            label: `LAN ${idx + 1}:${iface.ipAddress}`,
          }));

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
      } catch (err) {
        console.error("Error fetching network interfaces:", err);
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
      setSourceIpError(TRACERT_TEST_ERR_INVALID_SOURCE_IP);
      valid = false;
    }
    if (!isValidIp(destIp)) {
      setDestIpError(TRACERT_TEST_ERR_INVALID_DEST_IP);
      valid = false;
    }
    if (maxJumps && !isValidJumps(maxJumps)) {
      setJumpsError(TRACERT_TEST_ERR_INVALID_JUMPS);
      valid = false;
    }
    if (!valid) {
      showToast(TRACERT_TEST_ERR_FIX_BEFORE_START, "error");
      return;
    }
    setLoading(true);
    if (!maxJumps) {
      if (!intervalRef.current) {
        const success = await handleTracert();
        if (success) {
          intervalRef.current = setInterval(() => {
            handleTracert();
          }, 2000);
          showToast(TRACERT_TEST_TOAST_CONTINUOUS_STARTED, "success");
        } else {
          setLoading(false);
        }
      } else {
        showToast(TRACERT_TEST_TOAST_ALREADY_RUNNING, "warning");
        setLoading(false);
      }
    } else {
      showToast(TRACERT_TEST_TOAST_STARTED, "info");
      const success = await handleTracert();
      setLoading(false);
      if (success) {
        showToast(TRACERT_TEST_TOAST_COMPLETED, "success");
      }
    }
  };

  const stopTracertInterval = () => {
    const wasRunning = !!intervalRef.current || loading;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setLoading(false);
    if (wasRunning) {
      showToast(TRACERT_TEST_TOAST_STOPPED, "success");
    } else {
      showToast(TRACERT_TEST_TOAST_NOT_RUNNING, "warning");
    }
  };

  const stopTracertOnError = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setLoading(false);
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

      if (Apiresponse.response) {
        if (maxJumps) {
          setInfo(Apiresponse.responseData);
        } else {
          setInfo((prev) =>
            prev
              ? prev + "\n" + Apiresponse.responseData
              : Apiresponse.responseData,
          );
        }
        return true;
      }

      setInfo((prev) =>
        prev
          ? prev + "\n" + (Apiresponse.message || TRACERT_TEST_TOAST_SERVER_ERROR)
          : Apiresponse.message || TRACERT_TEST_TOAST_SERVER_ERROR,
      );
      showToast(Apiresponse.message || TRACERT_TEST_TOAST_SERVER_ERROR, "error");
      stopTracertOnError();
      return false;
    } catch (err) {
      console.error("Tracert API Error:", err);
      showToast(TRACERT_TEST_TOAST_CONNECTION_ERROR, "error");
      setError(true);
      stopTracertOnError();
      return false;
    }
  };

  const clearOutput = () => {
    setInfo("");
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

      <div>
        <div style={tracertTableContainerStyle}>
          <div style={tracertHeaderStyle}>
            <span>{TRACERT_TEST_CARD_TITLE}</span>
          </div>

          <div style={tracertBodyStyle}>
            <div style={tracertConfigPanelStyle}>
              <div style={tracertConfigHeaderStyle}>
                <PanelTitle title={TRACERT_TEST_SECTION_CONFIG} />
                <div style={tracertConfigActionsStyle}>
                  <Btn
                    variant="cancel"
                    onClick={stopTracertInterval}
                    disabled={!loading}
                    style={tracertFooterBtnStyle}
                  >
                    {TRACERT_BUTTONS.end}
                  </Btn>
                  <Btn
                    variant="primary"
                    onClick={startTracert}
                    disabled={loading || !destIp.trim()}
                    style={tracertFooterBtnStyle}
                  >
                    {loading ? (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <CircularProgress size={12} color="inherit" />
                        {TRACERT_BUTTONS.loading}
                      </span>
                    ) : (
                      TRACERT_BUTTONS.start
                    )}
                  </Btn>
                </div>
              </div>

              <div style={tracertConfigBodyStyle}>
                <div style={tracertFieldsGridStyle(isCompact)}>
                  <div style={tracertFieldsColumnStyle}>
                    <FieldRow name="sourceIp" label={TRACERT_LABELS.sourceIp}>
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
                          <option value="">{TRACERT_TEST_SOURCE_LOADING}</option>
                        ) : (
                          sourceOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))
                        )}
                      </select>
                      {sourceIpError ? (
                        <div style={tracertFieldErrorStyle}>{sourceIpError}</div>
                      ) : null}
                    </FieldRow>

                    <FieldRow name="destIp" label={TRACERT_LABELS.destIp}>
                      <input
                        type="text"
                        style={inputStyle}
                        value={destIp}
                        onChange={(e) => {
                          setDestIp(e.target.value);
                          setInfo("");
                          setDestIpError("");
                        }}
                        placeholder="e.g. 8.8.8.8"
                        {...inputInteraction}
                      />
                      {destIpError ? (
                        <div style={tracertFieldErrorStyle}>{destIpError}</div>
                      ) : null}
                    </FieldRow>
                  </div>

                  <div style={tracertFieldsColumnStyle}>
                    <FieldRow name="maxJumps" label={TRACERT_LABELS.maxJumps}>
                      <input
                        type="number"
                        style={inputStyle}
                        value={maxJumps}
                        onChange={(e) => {
                          setMaxJumps(e.target.value);
                          setInfo("");
                          setJumpsError("");
                        }}
                        placeholder="30"
                        {...inputInteraction}
                      />
                      {jumpsError ? (
                        <div style={tracertFieldErrorStyle}>{jumpsError}</div>
                      ) : null}
                    </FieldRow>
                  </div>
                </div>
              </div>
            </div>

            <div style={tracertOutputPanelStyle}>
              <div style={tracertOutputHeaderStyle}>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: TRACERT_TEST_SECTION_HEADING_COLOR,
                  }}
                >
                  {TRACERT_TEST_SECTION_OUTPUT}
                </span>
                <Btn
                  variant="cancel"
                  onClick={clearOutput}
                  disabled={!info || loading}
                  style={tracertClearBtnStyle}
                >
                  {TRACERT_TEST_BTN_CLEAR}
                </Btn>
              </div>
              <div style={tracertOutputBodyStyle}>
                <textarea
                  ref={outputRef}
                  className={TRACERT_TEST_SCROLL_CLASS}
                  style={tracertOutputTextareaStyle}
                  value={info}
                  readOnly
                  tabIndex={-1}
                  placeholder={TRACERT_TEST_OUTPUT_PLACEHOLDER}
                  onFocus={(e) => e.target.blur()}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </TracertPageShell>
  );
};

export default TRACERTTest;
