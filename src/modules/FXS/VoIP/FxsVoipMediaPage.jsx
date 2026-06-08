import React, { useState } from "react";
import { Alert } from "@mui/material";
import { MEDIA_PARAMETERS_NOTE } from "../../../sections/voip/constants/MediaParametersConstants";
import {
  C,
  nativeFieldInteraction,
  nativeFieldInputStyle,
  nativeFieldSelectStyle,
  getFxsNativeFieldInteraction,
} from "../../../sections/advanced/advancedSharedUi";

const ACCENT = "#3B6FE8";
const CARD_BORDER = "#e2e8f0";
const PAGE_BG = "#f8fafc";
const LABEL_COLOR = "#64748b";

const footerBtnBase = {
  height: 36,
  padding: "0 18px",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  lineHeight: 1,
  whiteSpace: "nowrap",
};

const CodecTableCheckbox = ({ checked, onChange }) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={checked}
    className="fxs-voip-media-codec-checkbox"
    onClick={onChange}
    style={{
      width: 18,
      height: 18,
      borderRadius: 4,
      border: `2px solid ${checked ? ACCENT : "#cbd5e1"}`,
      background: checked ? ACCENT : "#ffffff",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 0,
      flexShrink: 0,
      boxSizing: "border-box",
      verticalAlign: "middle",
    }}
  >
    {checked && (
      <svg width="11" height="11" viewBox="0 0 11 11" aria-hidden="true">
        <path
          d="M2 5.5L4.5 8L9 3"
          stroke="#ffffff"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    )}
  </button>
);

const fieldInputStyle = {
  ...nativeFieldInputStyle,
  width: "100%",
  height: 36,
  padding: "0 12px",
  borderRadius: 8,
  border: `1px solid ${CARD_BORDER}`,
  fontSize: 13,
};

const fieldSelectStyle = {
  ...nativeFieldSelectStyle,
  width: "100%",
  minHeight: 36,
  padding: "8px 32px 8px 12px",
  borderRadius: 8,
  border: `1px solid ${CARD_BORDER}`,
  fontSize: 13,
};

const ToggleSwitch = ({ checked, onChange, id }) => (
  <button
    type="button"
    id={id}
    role="switch"
    aria-checked={checked}
    className="fxs-voip-media-toggle"
    onClick={() => onChange(!checked)}
    style={{
      position: "relative",
      width: 44,
      height: 24,
      borderRadius: 12,
      border: "none",
      padding: 0,
      cursor: "pointer",
      flexShrink: 0,
      background: "transparent",
    }}
  >
    <span
      className="fxs-voip-media-toggle-track"
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        borderRadius: 12,
        backgroundColor: checked ? ACCENT : "#cbd5e1",
      }}
    />
    <span
      className="fxs-voip-media-toggle-thumb"
      style={{
        position: "absolute",
        top: 3,
        left: checked ? 23 : 3,
        width: 18,
        height: 18,
        borderRadius: "50%",
        backgroundColor: "#ffffff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }}
    />
  </button>
);

const FieldLabel = ({ children }) => (
  <label
    style={{
      display: "block",
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      color: LABEL_COLOR,
      marginBottom: 6,
    }}
  >
    {children}
  </label>
);

const MediaCard = ({ title, subtitle, children, wide }) => (
  <div
    className="fxs-voip-media-card"
    style={{
      background: "#ffffff",
      border: `1px solid ${CARD_BORDER}`,
      borderRadius: 12,
      padding: "20px 22px",
      boxSizing: "border-box",
      gridColumn: wide ? "1 / -1" : undefined,
    }}
  >
    <div style={{ marginBottom: 18 }}>
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "#1e293b",
          lineHeight: 1.3,
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div style={{ fontSize: 12, color: LABEL_COLOR, marginTop: 2 }}>
          {subtitle}
        </div>
      )}
    </div>
    {children}
  </div>
);

const ToggleRow = ({ label, hint, checked, onChange, id }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      padding: "12px 0",
      borderTop: `1px solid ${CARD_BORDER}`,
    }}
  >
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>
        {label}
      </div>
      {hint && (
        <div style={{ fontSize: 11, color: LABEL_COLOR, marginTop: 2 }}>
          {hint}
        </div>
      )}
    </div>
    <ToggleSwitch id={id} checked={checked} onChange={onChange} />
  </div>
);

const FxsVoipMediaPage = () => {
  const [formData, setFormData] = useState({
    dtmfTransmitMode: "0",
    rfc2833Payload: "101",
    rtpPortRange: "10000,20000",
    silenceSuppression: "0",
    jitterMode: "0",
    jitterBuffer: "100",
    voiceGainOutput: "0",
  });

  const [codecData, setCodecData] = useState([
    { enabled: true, codec: "6", packingTime: "20", bitRate: "0" },
    { enabled: true, codec: "7", packingTime: "20", bitRate: "0" },
    { enabled: true, codec: "131", packingTime: "20", bitRate: "0" },
    { enabled: true, codec: "98", packingTime: "30", bitRate: "0" },
    { enabled: true, codec: "96", packingTime: "20", bitRate: "0" },
    { enabled: true, codec: "4", packingTime: "30", bitRate: "1" },
  ]);

  const [toast, setToast] = useState({ msg: "", type: "success" });

  const rtpPorts = formData.rtpPortRange.split(",");
  const rtpPortStart = rtpPorts[0]?.trim() || "";
  const rtpPortEnd = rtpPorts[1]?.trim() || "";

  const setRtpPorts = (start, end) => {
    setFormData((prev) => ({
      ...prev,
      rtpPortRange: `${start},${end}`,
    }));
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const alert = (msg) => {
    const isSuccess = /successfully/i.test(String(msg));
    showToast(msg, isSuccess ? "success" : "error");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCodecCheckbox = (index) => {
    const newCodecData = [...codecData];
    newCodecData[index].enabled = !newCodecData[index].enabled;
    setCodecData(newCodecData);
  };

  const handleCodecChange = (index, value) => {
    const newCodecData = [...codecData];
    newCodecData[index].codec = value;
    const codec = parseInt(value);
    if (codec === 7 || codec === 6) {
      newCodecData[index].packingTime = "20";
      newCodecData[index].bitRate = "0";
    } else if (codec === 131) {
      newCodecData[index].packingTime = "20";
      newCodecData[index].bitRate = "0";
    } else if (codec === 98) {
      newCodecData[index].packingTime = "30";
      newCodecData[index].bitRate = "0";
    } else if (codec === 96) {
      newCodecData[index].packingTime = "20";
      newCodecData[index].bitRate = "0";
    } else if (codec === 4) {
      newCodecData[index].packingTime = "30";
      newCodecData[index].bitRate = "1";
    }
    setCodecData(newCodecData);
  };

  const handlePackingTimeChange = (index, value) => {
    const newCodecData = [...codecData];
    const codec = parseInt(newCodecData[index].codec);
    if (codec === 49 && value === "30") {
      alert("Please don't set coder=GSM and PktTime=30 at the same time!");
      return;
    }
    if (codec === 4 && value === "20") {
      alert("Please don't set coder=G723 and PktTime=20 at the same time!");
      return;
    }
    newCodecData[index].packingTime = value;
    if (codec === 98) {
      if (value === "20" || value === "40") {
        newCodecData[index].bitRate = "1";
      } else if (value === "30") {
        newCodecData[index].bitRate = "0";
      }
    }
    setCodecData(newCodecData);
  };

  const handleBitRateChange = (index, value) => {
    const newCodecData = [...codecData];
    newCodecData[index].bitRate = value;
    setCodecData(newCodecData);
  };

  const getPackingTimeOptions = (codecValue) => {
    const codec = parseInt(codecValue);
    if (codec === 7 || codec === 6) return ["10", "20", "30", "40", "50", "60"];
    if (codec === 131) return ["10", "20", "30", "40", "50", "60"];
    if (codec === 98) return ["20", "30"];
    if (codec === 96) return ["20"];
    if (codec === 4) return ["30"];
    return [];
  };

  const getBitRateOptions = (codecValue, packingTime) => {
    const codec = parseInt(codecValue);
    if (codec === 7 || codec === 6) return [{ value: "0", label: "64" }];
    if (codec === 131) return [{ value: "0", label: "8" }];
    if (codec === 98) {
      if (packingTime === "30") return [{ value: "0", label: "13.3" }];
      return [{ value: "1", label: "15.2" }];
    }
    if (codec === 96) return [{ value: "0", label: "12.20" }];
    if (codec === 4) return [{ value: "1", label: "6.3" }];
    return [];
  };

  const getCodecLabel = (codecValue) => {
    const map = {
      6: "G711A",
      7: "G711U",
      131: "G729",
      98: "iLBC",
      96: "AMR",
      4: "G723",
    };
    return map[parseInt(codecValue)] || codecValue;
  };

  const validateForm = () => {
    if (!formData.rfc2833Payload) {
      alert("Please enter a RFC2833 load!");
      return false;
    }
    const rfc2833 = parseInt(formData.rfc2833Payload);
    if (rfc2833 < 90 || rfc2833 >= 128) {
      alert("The value range of 'RFC2833 Load' is 90~127!");
      return false;
    }
    if (!formData.rtpPortRange) {
      alert("Please enter a RTP port range!");
      return false;
    }
    const portParts = formData.rtpPortRange.split(",");
    if (portParts.length !== 2) {
      alert("Invalid RTP port range!");
      return false;
    }
    const startPort = parseInt(portParts[0]);
    const endPort = parseInt(portParts[1]);
    if (isNaN(startPort) || isNaN(endPort)) {
      alert("'RTP Port' must be numbers!");
      return false;
    }
    if (startPort < 2000 || endPort > 60000) {
      alert("The value range of 'RTP Port' is 2000~60000!");
      return false;
    }
    if (5060 >= startPort && 5060 <= endPort) {
      alert("The SIP port value 5060 cannot be within the port range!");
      return false;
    }
    if (startPort % 2 !== 0) {
      alert("The starting port number must be an even!");
      return false;
    }
    if (endPort - startPort < 480) {
      alert(
        "The difference between the latter 'RTP Port' and the former should be no less than 480!",
      );
      return false;
    }
    if (formData.jitterMode === "0") {
      if (!formData.jitterBuffer) {
        alert("Please enter a JitterBuffer value!");
        return false;
      }
      const jitterBuffer = parseInt(formData.jitterBuffer);
      if (jitterBuffer < 20 || jitterBuffer > 200) {
        alert("The value range of 'JitterBuffer' is 20~200!");
        return false;
      }
    }
    const voiceGain = parseInt(formData.voiceGainOutput);
    if (isNaN(voiceGain) || voiceGain < -24 || voiceGain > 24) {
      alert("The value range of 'Voice Gain Output from IP' is -24~24!");
      return false;
    }
    if (voiceGain % 3 !== 0) {
      alert(
        "The value of 'Voice Gain Output from IP' must be a multiple of 3!",
      );
      return false;
    }
    const enabledCodecs = codecData.filter((item) => item.enabled);
    if (enabledCodecs.length === 0) {
      alert("Please select a CODEC!");
      return false;
    }
    const codecValues = enabledCodecs.map((item) => item.codec);
    if (new Set(codecValues).size !== codecValues.length) {
      alert("Please choose a different CODEC!");
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (validateForm()) {
      alert("Settings saved successfully!");
    }
  };

  const handleReset = () => {
    setFormData({
      dtmfTransmitMode: "0",
      rfc2833Payload: "101",
      rtpPortRange: "10000,20000",
      silenceSuppression: "0",
      jitterMode: "0",
      jitterBuffer: "100",
      voiceGainOutput: "0",
      srtpEncryption: false,
    });
    setCodecData([
      { enabled: true, codec: "6", packingTime: "20", bitRate: "0" },
      { enabled: true, codec: "7", packingTime: "20", bitRate: "0" },
      { enabled: true, codec: "131", packingTime: "20", bitRate: "0" },
      { enabled: true, codec: "98", packingTime: "30", bitRate: "0" },
      { enabled: true, codec: "96", packingTime: "20", bitRate: "0" },
      { enabled: true, codec: "4", packingTime: "30", bitRate: "1" },
    ]);
  };

  const handleKeyPress = (e, type) => {
    const key = e.keyCode || e.which;
    if (type === "number") {
      if (!((key > 47 && key < 58) || key === 8)) e.preventDefault();
    } else if (type === "number-comma") {
      if (!((key > 47 && key < 58) || key === 44 || key === 8))
        e.preventDefault();
    } else if (type === "number-minus") {
      if (!((key > 47 && key < 58) || key === 45 || key === 8))
        e.preventDefault();
    }
  };

  const getFieldInteraction = (disabled = false) =>
    getFxsNativeFieldInteraction(disabled);

  const codecSelectStyle = (enabled) => ({
    ...fieldSelectStyle,
    width: "100%",
    minHeight: 36,
    height: 36,
    backgroundColor: enabled ? "#ffffff" : "#f8fafc",
    cursor: enabled ? "pointer" : "not-allowed",
    color: enabled ? C.valueText : "#94a3b8",
  });

  const voiceGain = parseInt(formData.voiceGainOutput, 10) || 0;
  const gainPresets = [0, 3, -3, 6];

  return (
    <>
      <style>{`
        /* Page shell background/padding — see index.css .fxs-voip-media-page */
        .fxs-voip-media-page .fxs-voip-media-footer-btn {
          transition: background 0.13s ease, border-color 0.13s ease, color 0.13s ease, transform 0.1s ease, box-shadow 0.13s ease;
        }
        .fxs-voip-media-page .fxs-voip-media-footer-btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }
        .fxs-voip-media-page .fxs-voip-media-footer-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .fxs-voip-media-page .fxs-voip-media-footer-btn--reset:hover:not(:disabled) {
          background: #f8fafc;
          border-color: #cbd5e1;
        }
        .fxs-voip-media-page .fxs-voip-media-footer-btn--save:hover:not(:disabled) {
          background: #2f5fcc;
          border-color: #2f5fcc;
        }
        .fxs-voip-media-page input:not([type="checkbox"]):not([type="radio"]),
        .fxs-voip-media-page select {
          transition: border-color 0.14s ease, box-shadow 0.14s ease;
        }
        .fxs-voip-media-page input:not([type="checkbox"]):not([type="radio"]):hover:not(:focus):not(:disabled),
        .fxs-voip-media-page select:hover:not(:focus):not(:disabled) {
          border-color: rgba(0, 0, 0, 0.55);
        }
        .fxs-voip-media-page .fxs-voip-media-toggle-track {
          transition: background 0.18s ease;
        }
        .fxs-voip-media-page .fxs-voip-media-toggle-thumb {
          transition: transform 0.18s ease, left 0.18s ease;
        }
        .fxs-voip-media-page .fxs-voip-media-codec-table {
          border: 1px solid ${CARD_BORDER};
          border-radius: 8px;
          overflow: hidden;
        }
        .fxs-voip-media-page .fxs-voip-media-codec-table table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }
        .fxs-voip-media-page .fxs-voip-media-codec-table thead th {
          background: #f8fafc;
          text-align: left;
          padding: 11px 14px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #94a3b8;
          border-bottom: 1px solid ${CARD_BORDER};
        }
        .fxs-voip-media-page .fxs-voip-media-codec-checkbox {
          transition: background 0.14s ease, border-color 0.14s ease, transform 0.1s ease;
        }
        .fxs-voip-media-page .fxs-voip-media-codec-checkbox:hover {
          border-color: ${ACCENT};
        }
        .fxs-voip-media-page .fxs-voip-media-codec-checkbox:active {
          transform: scale(0.94);
        }
        .fxs-voip-media-page .fxs-voip-media-codec-table tbody td {
          padding: 10px 14px;
          border-bottom: 1px solid ${CARD_BORDER};
          vertical-align: middle;
        }
        .fxs-voip-media-page .fxs-voip-media-codec-table tbody td:first-child {
          text-align: center;
          width: 72px;
        }
        .fxs-voip-media-page .fxs-voip-media-codec-table tbody tr:last-child td {
          border-bottom: none;
        }
        .fxs-voip-media-page .fxs-voip-media-codec-row {
          transition: background 0.12s ease, box-shadow 0.12s ease;
        }
        .fxs-voip-media-page .fxs-voip-media-codec-row:hover {
          background: #eff6ff;
          box-shadow: inset 4px 0 0 ${ACCENT};
        }
        .fxs-voip-media-page .fxs-voip-media-priority-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 28px;
          height: 26px;
          padding: 0 8px;
          border-radius: 6px;
          background: #eff6ff;
          color: ${ACCENT};
          font-size: 12px;
          font-weight: 700;
        }
        .fxs-voip-media-page .fxs-voip-media-card {
          transition: box-shadow 0.18s ease, border-color 0.18s ease;
        }
        .fxs-voip-media-page .fxs-voip-media-card:hover {
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
          border-color: #cbd5e1;
        }
        .fxs-voip-media-page .fxs-voip-media-gain-btn {
          flex: 1;
          height: 34px;
          border-radius: 8px;
          border: 1px solid ${CARD_BORDER};
          background: #ffffff;
          font-size: 12px;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
        }
        .fxs-voip-media-page .fxs-voip-media-gain-btn.is-active {
          background: #eff6ff;
          border-color: ${ACCENT};
          color: ${ACCENT};
        }
        .fxs-voip-media-toast {
          transition: opacity 0.22s ease, transform 0.22s ease !important;
          transform: translateY(0) scale(1);
          opacity: 1;
        }
        .fxs-voip-media-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        @media (max-width: 900px) {
          .fxs-voip-media-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="fxs-voip-media-page">
        {toast.msg && (
          <Alert
            className="fxs-voip-media-toast"
            severity={toast.type}
            onClose={() => setToast({ msg: "", type: "success" })}
            sx={{
              position: "fixed",
              top: 20,
              right: 20,
              zIndex: 9999,
              minWidth: 300,
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
              fontWeight: 500,
            }}
          >
            {toast.msg}
          </Alert>
        )}

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                color: LABEL_COLOR,
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>FXS</span>
              <span style={{ color: "#cbd5e1" }}>/</span>
              <span>VoIP</span>
              <span style={{ color: "#cbd5e1" }}>/</span>
              <span style={{ color: "#1e293b", fontWeight: 600 }}>
                Media Parameters
              </span>
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: 26,
                fontWeight: 700,
                color: "#0f172a",
                letterSpacing: "-0.02em",
              }}
            >
              Media Parameters
            </h1>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 13,
                color: LABEL_COLOR,
                maxWidth: 520,
              }}
            >
              Audio codec, RTP transport, and signal processing for all VoIP
              sessions.
            </p>
          </div>
        </div>

        {/* Settings cards */}
        <div className="fxs-voip-media-grid">
          <MediaCard title="DTMF Settings" subtitle="Tone signaling mode">
            <div style={{ marginBottom: 14 }}>
              <FieldLabel>Transmit Mode</FieldLabel>
              <select
                name="dtmfTransmitMode"
                value={formData.dtmfTransmitMode}
                onChange={handleInputChange}
                style={fieldSelectStyle}
                {...nativeFieldInteraction}
              >
                <option value="0">RFC2833</option>
                <option value="1">SIP INFO</option>
                <option value="2">In-band</option>
              </select>
            </div>
            <div>
              <FieldLabel>RFC2833 Payload Type</FieldLabel>
              <input
                type="text"
                name="rfc2833Payload"
                value={formData.rfc2833Payload}
                onChange={handleInputChange}
                onKeyPress={(e) => handleKeyPress(e, "number")}
                style={fieldInputStyle}
                {...nativeFieldInteraction}
                maxLength="31"
              />
            </div>
          </MediaCard>

          <MediaCard
            title="RTP Configuration"
            subtitle="Port range & transport"
          >
            <div>
              <FieldLabel>RTP Port Range</FieldLabel>
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  type="text"
                  value={rtpPortStart}
                  onChange={(e) => setRtpPorts(e.target.value, rtpPortEnd)}
                  onKeyPress={(e) => handleKeyPress(e, "number")}
                  style={{ ...fieldInputStyle, flex: 1 }}
                  {...nativeFieldInteraction}
                  maxLength="8"
                />
                <input
                  type="text"
                  value={rtpPortEnd}
                  onChange={(e) => setRtpPorts(rtpPortStart, e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, "number")}
                  style={{ ...fieldInputStyle, flex: 1 }}
                  {...nativeFieldInteraction}
                  maxLength="8"
                />
              </div>
            </div>
          </MediaCard>

          <MediaCard
            title="Audio Processing"
            subtitle="Silence & jitter controls"
          >
            <ToggleRow
              id="silence-toggle"
              label="Silence suppression"
              hint="Reduce bandwidth during silent periods"
              checked={formData.silenceSuppression === "1"}
              onChange={(v) =>
                setFormData((prev) => ({
                  ...prev,
                  silenceSuppression: v ? "1" : "0",
                }))
              }
            />
            <div style={{ marginBottom: 14 }}>
              <FieldLabel>Jitter Mode</FieldLabel>
              <select
                name="jitterMode"
                value={formData.jitterMode}
                onChange={handleInputChange}
                style={fieldSelectStyle}
                {...nativeFieldInteraction}
              >
                <option value="0">Static Mode</option>
              </select>
            </div>
            <div>
              <FieldLabel>Jitter Buffer (ms)</FieldLabel>
              <input
                type="text"
                name="jitterBuffer"
                value={formData.jitterBuffer}
                onChange={handleInputChange}
                onKeyPress={(e) => handleKeyPress(e, "number")}
                style={fieldInputStyle}
                {...nativeFieldInteraction}
                maxLength="31"
              />
            </div>
          </MediaCard>

          <MediaCard title="Voice Processing" subtitle="Output gain from IP">
            <div style={{ marginBottom: 14 }}>
              <FieldLabel>Voice Gain Output from IP (dB)</FieldLabel>
              <input
                type="text"
                name="voiceGainOutput"
                value={formData.voiceGainOutput}
                onChange={handleInputChange}
                onKeyPress={(e) => handleKeyPress(e, "number-minus")}
                style={fieldInputStyle}
                {...nativeFieldInteraction}
                maxLength="31"
              />
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {gainPresets.map((db) => (
                <button
                  key={db}
                  type="button"
                  className={`fxs-voip-media-gain-btn${voiceGain === db ? " is-active" : ""}`}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      voiceGainOutput: String(db),
                    }))
                  }
                >
                  {db > 0 ? `+${db}` : db} dB
                </button>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                color: "#059669",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#10b981",
                  flexShrink: 0,
                }}
              />
              Audio path OK — {voiceGain > 0 ? `+${voiceGain}` : voiceGain} dB
              passthrough active
            </div>
          </MediaCard>

          <MediaCard
            title="Codec Priority"
            subtitle="Higher priority = negotiated first during call setup"
            wide
          >
            <div className="fxs-voip-media-codec-table">
              <table>
                <colgroup>
                  <col style={{ width: "72px" }} />
                  <col style={{ width: "88px" }} />
                  <col style={{ width: "28%" }} />
                  <col style={{ width: "22%" }} />
                  <col style={{ width: "22%" }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>Check</th>
                    <th>Priority</th>
                    <th>CODEC</th>
                    <th>Packing Time</th>
                    <th>Bit Rate (kbs)</th>
                  </tr>
                </thead>
                <tbody>
                  {codecData.map((item, index) => (
                    <tr
                      key={index}
                      className="fxs-voip-media-codec-row"
                      style={{ opacity: item.enabled ? 1 : 0.55 }}
                    >
                      <td>
                        <CodecTableCheckbox
                          checked={item.enabled}
                          onChange={() => handleCodecCheckbox(index)}
                        />
                      </td>
                      <td>
                        <span className="fxs-voip-media-priority-badge">
                          {index + 1}
                        </span>
                      </td>
                      <td>
                        <select
                          value={item.codec}
                          onChange={(e) =>
                            handleCodecChange(index, e.target.value)
                          }
                          disabled={!item.enabled}
                          style={codecSelectStyle(item.enabled)}
                          {...getFieldInteraction(!item.enabled)}
                        >
                          <option value="6">G711A</option>
                          <option value="7">G711U</option>
                          <option value="131">G729</option>
                          <option value="98">iLBC</option>
                          <option value="96">AMR</option>
                          <option value="4">G723</option>
                        </select>
                      </td>
                      <td>
                        <select
                          value={item.packingTime}
                          onChange={(e) =>
                            handlePackingTimeChange(index, e.target.value)
                          }
                          disabled={!item.enabled}
                          style={codecSelectStyle(item.enabled)}
                          {...getFieldInteraction(!item.enabled)}
                        >
                          {getPackingTimeOptions(item.codec).map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          value={item.bitRate}
                          onChange={(e) =>
                            handleBitRateChange(index, e.target.value)
                          }
                          disabled={!item.enabled}
                          style={codecSelectStyle(item.enabled)}
                          {...getFieldInteraction(!item.enabled)}
                        >
                          {getBitRateOptions(item.codec, item.packingTime).map(
                            (opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ),
                          )}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </MediaCard>
        </div>

        {/* Footer */}
        <div
          className="fxs-voip-media-card"
          style={{
            marginTop: 16,
            background: "#ffffff",
            border: `1px solid ${CARD_BORDER}`,
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "12px 20px",
              background: "#fffbeb",
              borderBottom: "1px solid #fde68a",
              fontSize: 12,
              lineHeight: 1.5,
              color: "#92400e",
            }}
          >
            <strong>Note:</strong>{" "}
            {MEDIA_PARAMETERS_NOTE.split("\n").filter(Boolean).join(" ")}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 10,
              padding: "14px 20px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                type="button"
                className="fxs-voip-media-footer-btn fxs-voip-media-footer-btn--reset"
                onClick={handleReset}
                style={{
                  ...footerBtnBase,
                  background: "#ffffff",
                  border: `1px solid ${CARD_BORDER}`,
                  color: "#334155",
                }}
              >
                Reset
              </button>
              <button
                type="button"
                className="fxs-voip-media-footer-btn fxs-voip-media-footer-btn--save"
                onClick={handleSave}
                style={{
                  ...footerBtnBase,
                  background: ACCENT,
                  border: `1px solid ${ACCENT}`,
                  color: "#ffffff",
                }}
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FxsVoipMediaPage;
