import React, { useMemo, useState } from "react";
import { Alert, Tooltip } from "@mui/material";
import {
  MEDIA_PARAMETERS_NOTE,
  FXS_MEDIA_FIELD_TOOLTIPS,
} from "../../../constants/MediaParametersConstants";

// ── Page-local field label tooltip UI (matches Extensions page pattern) ──
const FIELD_LABEL_COLOR = "#3E5475";

const MEDIA_FIELD_TOOLTIP_PROPS = {
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

const formatMediaTooltipTitle = (text) => {
  if (!text) return "";
  const normalized = text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
  if (normalized.includes("\n")) {
    return (
      <span style={{ whiteSpace: "pre-line", display: "block" }}>
        {normalized}
      </span>
    );
  }
  return normalized;
};

const MediaTooltipLabel = ({ tooltipKey, children, style = {} }) => {
  const tooltip = tooltipKey ? FXS_MEDIA_FIELD_TOOLTIPS[tooltipKey] || "" : "";
  const labelNode = (
    <span
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: FIELD_LABEL_COLOR,
        cursor: tooltip ? "help" : undefined,
        ...style,
      }}
    >
      {children}
    </span>
  );
  if (!tooltip) return labelNode;
  return (
    <Tooltip
      title={formatMediaTooltipTitle(tooltip)}
      {...MEDIA_FIELD_TOOLTIP_PROPS}
    >
      {labelNode}
    </Tooltip>
  );
};

const MediaFieldRow = ({ label, tooltipKey, children, labelStyle = {} }) => {
  const tooltip = tooltipKey ? FXS_MEDIA_FIELD_TOOLTIPS[tooltipKey] || "" : "";
  const labelNode = (
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: FIELD_LABEL_COLOR,
        flex: "0 0 48%",
        maxWidth: "48%",
        paddingRight: 24,
        textAlign: "left",
        lineHeight: 1.35,
        cursor: tooltip ? "help" : undefined,
        ...labelStyle,
      }}
    >
      {label}
    </label>
  );

  return (
    <div className="flex flex-row items-start w-full">
      {tooltip ? (
        <Tooltip
          title={formatMediaTooltipTitle(tooltip)}
          {...MEDIA_FIELD_TOOLTIP_PROPS}
        >
          {labelNode}
        </Tooltip>
      ) : (
        labelNode
      )}
      {children}
    </div>
  );
};

// ── Local page UI (inlined from fxsSharedUi) ──
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#9CA3AF",
  labelText: "#3E5475",
  valueText: "#0f172a",
  mutedText: "#94a3b8",
  strongText: "#0f172a",
  accent: "#3E5475",
  amber: "#dc2626",
};

const CARD_RADIUS = 10;

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
  form,
  component,
  title,
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
      boxShadow: "0 1px 2px rgba(15,23,42,0.08)",
    },
    danger: {
      background: "#fef2f2",
      color: C.amber,
      border: "0.5px solid #fecaca",
    },
    outline: {
      background: C.cardBg,
      color: C.labelText,
      border: `1px solid ${C.cardBorder}`,
    },
  };
  const s = styles[variant] || styles.default;
  const hoverBg =
    {
      primary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      cancel: "#b6c2d3",
      danger: "#fca5a5",
      outline: "#e2e8f0",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const baseBg = extraStyle?.background ?? s.background;
  const Component = component || "button";
  return (
    <Component
      type={type}
      form={form}
      title={title}
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
    </Component>
  );
};

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

const getFxsNativeFieldInteraction = (disabled) =>
  disabled ? {} : nativeFieldInteraction;

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

const nativeFieldSelectStyle = {
  width: nativeFieldInputStyle.width,
  minHeight: 32,
  padding: "6px 28px 6px 8px",
  fontSize: nativeFieldInputStyle.fontSize,
  lineHeight: 1.35,
  border: nativeFieldInputStyle.border,
  borderRadius: nativeFieldInputStyle.borderRadius,
  outline: nativeFieldInputStyle.outline,
  backgroundColor: nativeFieldInputStyle.backgroundColor,
  color: nativeFieldInputStyle.color,
  boxSizing: nativeFieldInputStyle.boxSizing,
  transition: nativeFieldInputStyle.transition,
  appearance: "auto",
};

const advancedPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  boxSizing: "border-box",
};

const advancedPageInnerStyle = {
  width: "100%",
  maxWidth: 1000,
  margin: "0 auto",
};

const advancedTableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
  background: C.cardBg,
  border: `1.5px solid ${C.cardBorder}`,
  borderRadius: CARD_RADIUS,
  boxShadow: "0 4px 20px rgba(15,23,42,0.06)",
  overflow: "hidden",
  marginBottom: 24,
};

const advancedBlueBarStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: CARD_RADIUS,
  borderTopRightRadius: CARD_RADIUS,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  padding: "7px 14px",
  flexWrap: "wrap",
  gap: 12,
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  borderBottom: `1px solid ${C.cardBorder}`,
};

const advancedFormInlineFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "calc(100% + 40px)",
  marginLeft: -20,
  marginRight: -20,
  marginTop: 0,
  marginBottom: 0,
  padding: "10px 20px 10px",
  borderTop: `1px solid ${C.cardBorder}`,
  boxSizing: "border-box",
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

const VoipBreadcrumb = ({ current }) => (
  <div
    style={{
      fontSize: 12,
      color: "#94a3b8",
      marginBottom: 16,
      fontWeight: 400,
      display: "flex",
      alignItems: "center",
      gap: 4,
      flexWrap: "wrap",
    }}
  >
    <span>FXS</span>
    <span>&gt;</span>
    <span>VoIP</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>{current}</span>
  </div>
);

const AdvancedPageShell = ({ children, fullWidth = false }) => (
  <div style={advancedPageWrapStyle}>
    <div
      style={{
        ...advancedPageInnerStyle,
        maxWidth: fullWidth ? "100%" : advancedPageInnerStyle.maxWidth,
      }}
    >
      {children}
    </div>
  </div>
);

const CODEC_PRIORITY_HEADING_COLOR = "#30415A";

const CODEC_OPTIONS = [
  { id: "6", label: "G711A" },
  { id: "7", label: "G711U" },
  { id: "131", label: "G729" },
  { id: "98", label: "iLBC" },
  { id: "96", label: "AMR" },
  { id: "4", label: "G723" },
];

const DEFAULT_SELECTED_CODECS = ["6", "7", "131", "98", "96", "4"];

const codecDualListSelectStyle = {
  width: "100%",
  height: 160,
  border: `1px solid ${C.cardBorder}`,
  background: "#fff",
  borderRadius: 4,
  padding: "4px 8px",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
  overflowY: "auto",
};

const codecDualListBtnStyle = {
  height: 36,
  width: "100%",
  border: "1px solid #6b7280",
  backgroundColor: "#d9dde3",
  color: "#111827",
  fontSize: 14,
  fontWeight: 600,
  fontFamily: "inherit",
  lineHeight: 1,
  padding: 0,
  margin: 0,
  cursor: "pointer",
  display: "block",
  boxSizing: "border-box",
  textAlign: "center",
};

const codecDualListReorderBtnStyle = {
  ...codecDualListBtnStyle,
  fontWeight: 400,
};

const CodecDualListBtn = ({ onClick, title, children, reorder }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    style={reorder ? codecDualListReorderBtnStyle : codecDualListBtnStyle}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = "#c5cbd3";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = "#d9dde3";
    }}
  >
    {children}
  </button>
);

const CodecPrioritySectionHeading = ({ title, tooltipKey }) => (
  <div style={{ margin: "16px 0 24px 0", position: "relative" }}>
    <div style={{ borderTop: `1px solid ${C.cardBorder}` }} />
    <span
      style={{
        position: "absolute",
        top: -10,
        left: 0,
        background: C.cardBg,
        paddingRight: 8,
        fontSize: 13,
        fontWeight: 600,
        color: CODEC_PRIORITY_HEADING_COLOR,
      }}
    >
      {tooltipKey ? (
        <MediaTooltipLabel tooltipKey={tooltipKey}>
          {title}
        </MediaTooltipLabel>
      ) : (
        title
      )}
    </span>
  </div>
);

const FxsVoipMediaPage = () => {
  // Media Parameters state
  const [formData, setFormData] = useState({
    dtmfTransmitMode: "0", // 0=RFC2833, 1=SIP INFO, 2=In-band
    rfc2833Payload: "101",
    rtpPortRange: "10000,20000",
    silenceSuppression: "0", // 0=Disable, 1=Enable
    jitterMode: "0", // 0=Static Mode, 1=Adaptive Mode
    jitterBuffer: "100",
    voiceGainOutput: "0",
  });

  const [selectedCodecs, setSelectedCodecs] = useState(DEFAULT_SELECTED_CODECS);
  const [availableSelected, setAvailableSelected] = useState([]);
  const [chosenSelected, setChosenSelected] = useState([]);

  const codecLabelMap = useMemo(() => {
    const map = new Map();
    CODEC_OPTIONS.forEach((c) => map.set(c.id, c.label));
    return map;
  }, []);

  const getCodecLabel = (id) => codecLabelMap.get(id) || id;

  const availableCodecList = useMemo(
    () => CODEC_OPTIONS.filter((c) => !selectedCodecs.includes(c.id)),
    [selectedCodecs],
  );

  const [toast, setToast] = useState({ msg: "", type: "success" });

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

  const addSelectedCodecs = () => {
    if (!availableSelected.length) return;
    setSelectedCodecs((prev) => [
      ...prev,
      ...availableSelected.filter((id) => !prev.includes(id)),
    ]);
    setAvailableSelected([]);
  };

  const addAllCodecs = () => {
    setSelectedCodecs(CODEC_OPTIONS.map((c) => c.id));
    setAvailableSelected([]);
  };

  const removeSelectedCodecs = () => {
    if (!chosenSelected.length) return;
    setSelectedCodecs((prev) =>
      prev.filter((id) => !chosenSelected.includes(id)),
    );
    setChosenSelected([]);
  };

  const removeAllCodecs = () => {
    setSelectedCodecs([]);
    setChosenSelected([]);
  };

  const moveCodecToBottom = () => {
    if (!chosenSelected.length) return;
    setSelectedCodecs((prev) => {
      const rest = prev.filter((id) => !chosenSelected.includes(id));
      const chosen = prev.filter((id) => chosenSelected.includes(id));
      return [...rest, ...chosen];
    });
  };

  const moveCodecUp = () => {
    if (!chosenSelected.length) return;
    setSelectedCodecs((prev) => {
      const arr = [...prev];
      for (let i = 1; i < arr.length; i++) {
        if (
          chosenSelected.includes(arr[i]) &&
          !chosenSelected.includes(arr[i - 1])
        ) {
          [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
        }
      }
      return arr;
    });
  };

  const moveCodecDown = () => {
    if (!chosenSelected.length) return;
    setSelectedCodecs((prev) => {
      const arr = [...prev];
      for (let i = arr.length - 2; i >= 0; i--) {
        if (
          chosenSelected.includes(arr[i]) &&
          !chosenSelected.includes(arr[i + 1])
        ) {
          [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        }
      }
      return arr;
    });
  };

  const moveCodecToTop = () => {
    if (!chosenSelected.length) return;
    setSelectedCodecs((prev) => {
      const chosen = prev.filter((id) => chosenSelected.includes(id));
      const rest = prev.filter((id) => !chosenSelected.includes(id));
      return [...chosen, ...rest];
    });
  };

  const validateForm = () => {
    // Validate RFC2833 Payload
    if (!formData.rfc2833Payload) {
      alert("Please enter a RFC2833 load!");
      return false;
    }
    const rfc2833 = parseInt(formData.rfc2833Payload);
    if (rfc2833 < 90 || rfc2833 >= 128) {
      alert("The value range of 'RFC2833 Load' is 90~127!");
      return false;
    }

    // Validate RTP Port Range
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

    // Validate JitterBuffer
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

    // Validate Voice Gain Output
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

    if (selectedCodecs.length === 0) {
      alert("Please select a CODEC!");
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
    });
    setSelectedCodecs([...DEFAULT_SELECTED_CODECS]);
    setAvailableSelected([]);
    setChosenSelected([]);
  };

  const handleKeyPress = (e, type) => {
    const key = e.keyCode || e.which;
    // Allow digits (48-57), comma (44), minus (45), backspace (8)
    if (type === "number") {
      if (!((key > 47 && key < 58) || key === 8)) {
        e.preventDefault();
      }
    } else if (type === "number-comma") {
      if (!((key > 47 && key < 58) || key === 44 || key === 8)) {
        e.preventDefault();
      }
    } else if (type === "number-minus") {
      if (!((key > 47 && key < 58) || key === 45 || key === 8)) {
        e.preventDefault();
      }
    }
  };

  const fieldStyle = {
    ...nativeFieldInputStyle,
    width: 220,
  };

  const fieldSelectStyle = {
    ...nativeFieldSelectStyle,
    width: 220,
  };

  const getFieldInteraction = (disabled = false) =>
    getFxsNativeFieldInteraction(disabled);

  const valueColStyle = {
    flex: "1 1 52%",
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  };

  const controlSlotStyle = {
    width: 220,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
  };

  const mediaParameterRows = [
    {
      label: "DTMF Transmit Mode",
      type: "select",
      name: "dtmfTransmitMode",
      options: [
        { value: "0", label: "RFC2833" },
        { value: "1", label: "SIP INFO" },
        { value: "2", label: "In-band" },
      ],
    },
    {
      label: "RFC2833 Payload",
      type: "text",
      name: "rfc2833Payload",
      keyPress: "number",
    },
    {
      label: "RTP Port Range",
      type: "text",
      name: "rtpPortRange",
      keyPress: "number-comma",
    },
    {
      label: "Silence Suppression",
      type: "select",
      name: "silenceSuppression",
      options: [
        { value: "0", label: "Disable" },
        { value: "1", label: "Enable" },
      ],
    },
    {
      label: "JitterMode",
      type: "select",
      name: "jitterMode",
      options: [{ value: "0", label: "Static Mode" }],
    },
    {
      label: "JitterBuffer(ms)",
      type: "text",
      name: "jitterBuffer",
      keyPress: "number",
    },
    {
      label: "Voice Gain Output from IP (dB)",
      type: "text",
      name: "voiceGainOutput",
      keyPress: "number-minus",
    },
  ];

  return (
    <AdvancedPageShell>
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
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            fontWeight: 500,
          }}
        >
          {toast.msg}
        </Alert>
      )}
      <VoipBreadcrumb current="Media Parameters" />
      <div style={{ ...advancedTableContainerStyle, marginBottom: 0 }}>
        <div style={advancedBlueBarStyle}>
          <span>Media Parameters</span>
        </div>
        <div style={{ padding: "24px 32px 0" }}>
          <div style={{ marginBottom: 12 }}>
            <div
              className="flex flex-col gap-3"
              style={{
                width: "100%",
                maxWidth: 640,
                margin: "0 auto",
              }}
            >
              {mediaParameterRows.map((row) => (
                <MediaFieldRow
                  key={row.name}
                  label={row.label}
                  tooltipKey={row.name}
                >
                  <div style={valueColStyle}>
                    <div style={controlSlotStyle}>
                      {row.type === "select" ? (
                        <select
                          name={row.name}
                          value={formData[row.name]}
                          onChange={handleInputChange}
                          style={fieldSelectStyle}
                          {...nativeFieldInteraction}
                        >
                          {row.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          name={row.name}
                          value={formData[row.name]}
                          onChange={handleInputChange}
                          onKeyPress={(e) =>
                            handleKeyPress(e, row.keyPress || "number")
                          }
                          style={fieldStyle}
                          {...nativeFieldInteraction}
                          maxLength="31"
                        />
                      )}
                    </div>
                  </div>
                </MediaFieldRow>
              ))}
            </div>

            {/* CODEC Priority — Available / Selected (Inbound Member Trunks style) */}
            <div style={{ width: "100%", marginTop: 16 }}>
              <CodecPrioritySectionHeading title="CODEC Priority" tooltipKey="codecPriority" />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 48px 1fr 48px",
                  gap: 12,
                }}
              >
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#3E5475",
                        textAlign: "center",
                        marginBottom: 8,
                      }}
                    >
                      Available
                    </div>
                    <select
                      multiple
                      size={6}
                      value={availableSelected}
                      onChange={(e) =>
                        setAvailableSelected(
                          Array.from(
                            e.target.selectedOptions,
                            (opt) => opt.value,
                          ),
                        )
                      }
                      style={codecDualListSelectStyle}
                    >
                      {availableCodecList.length === 0 ? (
                        <option disabled value="">
                          No codecs
                        </option>
                      ) : (
                        availableCodecList.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      paddingTop: 28,
                    }}
                  >
                    <CodecDualListBtn onClick={addSelectedCodecs}>
                      &gt;
                    </CodecDualListBtn>
                    <CodecDualListBtn onClick={addAllCodecs}>
                      &gt;&gt;
                    </CodecDualListBtn>
                    <CodecDualListBtn onClick={removeSelectedCodecs}>
                      &lt;
                    </CodecDualListBtn>
                    <CodecDualListBtn onClick={removeAllCodecs}>
                      &lt;&lt;
                    </CodecDualListBtn>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#3E5475",
                        textAlign: "center",
                        marginBottom: 8,
                      }}
                    >
                      Selected
                    </div>
                    <select
                      multiple
                      size={6}
                      value={chosenSelected}
                      onChange={(e) =>
                        setChosenSelected(
                          Array.from(
                            e.target.selectedOptions,
                            (opt) => opt.value,
                          ),
                        )
                      }
                      style={codecDualListSelectStyle}
                    >
                      {selectedCodecs.length === 0 ? (
                        <option disabled value="">
                          No selected codecs
                        </option>
                      ) : (
                        selectedCodecs.map((id) => (
                          <option key={id} value={id}>
                            {getCodecLabel(id)}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      paddingTop: 28,
                    }}
                  >
                    <CodecDualListBtn
                      reorder
                      title="Move to bottom"
                      onClick={moveCodecToBottom}
                    >
                      vv
                    </CodecDualListBtn>
                    <CodecDualListBtn reorder title="Move up" onClick={moveCodecUp}>
                      ^
                    </CodecDualListBtn>
                    <CodecDualListBtn
                      reorder
                      title="Move down"
                      onClick={moveCodecDown}
                    >
                      v
                    </CodecDualListBtn>
                    <CodecDualListBtn
                      reorder
                      title="Move to top"
                      onClick={moveCodecToTop}
                    >
                      ^^
                    </CodecDualListBtn>
                  </div>
                </div>
            </div>

            <div className="flex flex-col gap-0 w-full">
              <CodecPrioritySectionHeading title="Note:" />
              <div
                style={{
                  width: "100%",
                  maxWidth: 860,
                  margin: "0 auto",
                  padding: "0 8px",
                  boxSizing: "border-box",
                }}
              >
                {MEDIA_PARAMETERS_NOTE.split("\n")
                  .filter(Boolean)
                  .map((line, index) => (
                    <p
                      key={index}
                      style={{
                        margin: 0,
                        color: C.mutedText,
                        fontSize: 11,
                        lineHeight: 1.45,
                        whiteSpace: "normal",
                        overflowWrap: "break-word",
                        wordBreak: "break-word",
                        textAlign: "left",
                      }}
                    >
                      {line}
                    </p>
                  ))}
              </div>
            </div>
          </div>
        </div>
        <div
          style={{
            ...advancedFormInlineFooterStyle,
            width: "100%",
            marginLeft: 0,
            marginRight: 0,
          }}
        >
          <Btn
            type="button"
            onClick={handleSave}
            variant="primary"
            style={advancedFormBtnStyle}
          >
            Save
          </Btn>
          <Btn
            type="button"
            onClick={handleReset}
            variant="cancel"
            style={advancedFormBtnStyle}
          >
            Reset
          </Btn>
        </div>
      </div>
    </AdvancedPageShell>
  );
};

export default FxsVoipMediaPage;
