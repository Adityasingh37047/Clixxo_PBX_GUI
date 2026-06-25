import React, { useMemo, useState } from "react";
import { Alert, Tooltip } from "@mui/material";
import {
  MEDIA_PARAMETERS_NOTE,
  FXS_MEDIA_FIELD_TOOLTIPS,
} from "../../../constants/MediaParametersConstants";

// ── Page-local field label tooltip UI (matches Extensions page pattern) ──
const FIELD_LABEL_COLOR = "#374151";

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
        flex: "1 1 auto",
        minWidth: 0,
        paddingRight: 16,
        textAlign: "left",
        lineHeight: 1.4,
        cursor: tooltip ? "help" : undefined,
        ...labelStyle,
      }}
    >
      {label}
    </label>
  );

  return (
    <div
      className="flex flex-row items-center w-full"
      style={{ minHeight: 36 }}
    >
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
  cardBorder: "#d8dde5",
  cardShadow: "0 2px 10px rgba(15, 23, 42, 0.07)",
  divider: "#e2e6ec",
  labelText: "#374151",
  valueText: "#1f2937",
  mutedText: "#6b7280",
  placeholderText: "#9aa3b2",
  strongText: "#1f2937",
  accent: "#4A5D75",
  accentDark: "#3a4a5e",
  codecBoxBorder: "#c5ccd6",
  codecBoxAvailableBg: "#f8fafc",
  codecBoxSelectedBg: "#ffffff",
  codecStripBg: "#ffffff",
  codecStripBorder: "#ced4de",
  codecStripSelectedBg: "#f1f5f9",
  codecStripSelectedBorder: "#8fa3b8",
  codecBtnBg: "#d9dde3",
  codecBtnBorder: "#c9d0d9",
  amber: "#dc2626",
};

const CARD_RADIUS = 10;
const FIELD_RADIUS = 6;

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
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      cancel: "#a3b1c2",
      danger: "#f87171",
      outline: "#d1d9e6",
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
        padding:
          variant === "primary" || variant === "cancel"
            ? "8px 32px"
            : "6px 14px",
        borderRadius: variant === "primary" || variant === "cancel" ? 8 : 8,
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
    </Component>
  );
};

const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";

const FOCUS_RING_SHADOW = (color) => `0 0 0 2px rgba(62, 84, 117, 0.15)`;

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
  height: 32,
  width: "100%",
  maxWidth: 220,
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

const nativeFieldSelectStyle = {
  width: "100%",
  maxWidth: 220,
  minHeight: 32,
  height: 32,
  padding: "4px 28px 4px 10px",
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
  cursor: "pointer",
};

const advancedPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  height: "calc(100vh - 80px)",
  width: "100%",
  maxWidth: "100%",
  padding: "8px 28px 16px",
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  boxSizing: "border-box",
};

const advancedPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  flex: 1,
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
};

const advancedTableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  flex: 1,
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: CARD_RADIUS,
  boxShadow: C.cardShadow,
  overflow: "hidden",
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

const dashboardGridStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 1px minmax(0, 1fr)",
  width: "100%",
  flex: 1,
  minHeight: 0,
  alignItems: "stretch",
  overflow: "auto",
};

const dashboardColumnStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  minWidth: 0,
  minHeight: "100%",
  padding: "16px 36px 24px",
};

const dashboardColumnLeftStyle = {
  ...dashboardColumnStyle,
  background: C.cardBg,
};

const dashboardColumnRightStyle = {
  ...dashboardColumnStyle,
  background: C.cardBg,
};

const dashboardDividerStyle = {
  background: C.divider,
  width: 1,
  alignSelf: "stretch",
  margin: "14px 0",
};

const dashboardSectionTitleStyle = {
  fontSize: 14,
  fontWeight: 700,
  color: C.strongText,
  marginBottom: 2,
};

const pageTitleStyle = {
  fontSize: 22,
  fontWeight: 700,
  color: C.strongText,
  margin: "0 0 6px 0",
  letterSpacing: "-0.02em",
  flexShrink: 0,
};

const VoipBreadcrumb = ({ current }) => (
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
    <span>FXS</span>
    <span>&gt;</span>
    <span>VoIP</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>{current}</span>
  </div>
);

const AdvancedPageShell = ({ children }) => (
  <div style={advancedPageWrapStyle}>
    <div style={advancedPageInnerStyle}>{children}</div>
  </div>
);

const CODEC_OPTIONS = [
  { id: "6", label: "G711A" },
  { id: "7", label: "G711U" },
  { id: "131", label: "G729" },
  { id: "98", label: "iLBC" },
  { id: "96", label: "AMR" },
  { id: "4", label: "G723" },
];

const DEFAULT_SELECTED_CODECS = ["6", "7", "131", "98", "96", "4"];

const CODEC_LIST_BOX_HEIGHT = 188;
const CODEC_BTN_COL_WIDTH = 40;
const CODEC_BTN_GAP = 6;
const CODEC_BTN_HEIGHT = (CODEC_LIST_BOX_HEIGHT - CODEC_BTN_GAP * 3) / 4;
const CODEC_LIST_LABEL_OFFSET = 28;

const getCodecListBoxStyle = (variant, isEmpty) => ({
  width: "100%",
  minHeight: CODEC_LIST_BOX_HEIGHT,
  height: CODEC_LIST_BOX_HEIGHT,
  border: `1px solid ${C.codecBoxBorder}`,
  background:
    variant === "available" ? C.codecBoxAvailableBg : C.codecBoxSelectedBg,
  borderRadius: 6,
  padding: isEmpty ? 0 : "8px 8px",
  boxSizing: "border-box",
  overflowY: "auto",
  overflowX: "hidden",
  display: "flex",
  flexDirection: "column",
  alignItems: isEmpty ? "center" : "stretch",
  justifyContent: isEmpty ? "center" : "flex-start",
  gap: 4,
});

const codecListEmptyStyle = {
  color: C.placeholderText,
  fontSize: 13,
  fontWeight: 400,
  textAlign: "center",
  userSelect: "none",
  padding: "0 16px",
};

const codecStripStyle = (isSelected) => ({
  display: "block",
  width: "100%",
  padding: "6px 8px",
  borderRadius: 5,
  fontSize: 13,
  fontWeight: 400,
  color: C.valueText,
  textAlign: "center",
  background: isSelected ? C.codecStripSelectedBg : C.codecStripBg,
  border: `1px solid ${isSelected ? C.codecStripSelectedBorder : C.codecStripBorder}`,
  cursor: "pointer",
  userSelect: "none",
  boxSizing: "border-box",
  lineHeight: 1.35,
  flexShrink: 0,
  transition: "background 0.12s ease, border-color 0.12s ease",
});

const codecDualListBtnStyle = {
  width: CODEC_BTN_COL_WIDTH,
  height: CODEC_BTN_HEIGHT,
  borderRadius: 6,
  border: `1px solid ${C.codecBtnBorder}`,
  background: C.codecBtnBg,
  color: "#111827",
  fontSize: 12,
  fontWeight: 600,
  fontFamily: "inherit",
  lineHeight: 1,
  padding: 0,
  margin: 0,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  flexShrink: 0,
  boxShadow: "none",
  transition: "background 0.12s ease",
};

const codecDualListReorderBtnStyle = {
  ...codecDualListBtnStyle,
  fontSize: 11,
  fontWeight: 500,
  color: C.mutedText,
};

const codecBtnColumnStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: CODEC_BTN_GAP,
  height: CODEC_LIST_BOX_HEIGHT,
  width: CODEC_BTN_COL_WIDTH,
};

const CodecDualListBtn = ({ onClick, title, children, reorder }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    style={reorder ? codecDualListReorderBtnStyle : codecDualListBtnStyle}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = "#c5cbd3";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = C.codecBtnBg;
    }}
  >
    {children}
  </button>
);

const CodecListBox = ({
  items,
  selectedIds,
  onToggle,
  emptyText,
  getLabel,
  variant = "available",
}) => {
  const isEmpty = items.length === 0;
  return (
    <div style={getCodecListBoxStyle(variant, isEmpty)}>
      {isEmpty ? (
        <div style={codecListEmptyStyle}>{emptyText}</div>
      ) : (
        items.map((item) => {
          const id = typeof item === "string" ? item : item.id;
          const label = getLabel ? getLabel(id) : item.label || id;
          const isSelected = selectedIds.includes(id);
          return (
            <div
              key={id}
              role="option"
              aria-selected={isSelected}
              onClick={() => onToggle(id)}
              style={codecStripStyle(isSelected)}
            >
              {label}
            </div>
          );
        })
      )}
    </div>
  );
};

const SectionHeading = ({ title, tooltipKey }) => (
  <div style={{ marginBottom: 2 }}>
    {tooltipKey ? (
      <MediaTooltipLabel
        tooltipKey={tooltipKey}
        style={{ fontSize: 14, fontWeight: 700, color: C.strongText }}
      >
        {title}
      </MediaTooltipLabel>
    ) : (
      <span style={{ fontSize: 14, fontWeight: 700, color: C.strongText }}>
        {title}
      </span>
    )}
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

  const toggleAvailableSelect = (id) => {
    setAvailableSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleChosenSelect = (id) => {
    setChosenSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const fieldStyle = {
    ...nativeFieldInputStyle,
    width: "100%",
  };

  const fieldSelectStyle = {
    ...nativeFieldSelectStyle,
    width: "100%",
  };

  const valueColStyle = {
    flex: "1 1 auto",
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  };

  const controlSlotStyle = {
    width: 220,
    maxWidth: "100%",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
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
      label: "Voice Gain Output from IP",
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
      <h1 style={pageTitleStyle}>Media Parameters</h1>
      <VoipBreadcrumb current="Media Parameters" />
      <div style={advancedTableContainerStyle}>
        <div style={dashboardGridStyle}>
          {/* Column 1 — System Settings */}
          <div style={dashboardColumnLeftStyle}>
            <div style={dashboardSectionTitleStyle}>System Settings</div>
            <div className="flex flex-col gap-3" style={{ width: "100%" }}>
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
          </div>

          <div style={dashboardDividerStyle} aria-hidden="true" />

          {/* Column 2 — CODEC Priority */}
          <div style={dashboardColumnRightStyle}>
            <SectionHeading title="CODEC Priority" tooltipKey="codecPriority" />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `1fr ${CODEC_BTN_COL_WIDTH}px 1fr ${CODEC_BTN_COL_WIDTH}px`,
                gap: 10,
                width: "100%",
                alignItems: "start",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: C.labelText,
                    textAlign: "center",
                    marginBottom: 8,
                  }}
                >
                  Available
                </div>
                <CodecListBox
                  variant="available"
                  items={availableCodecList}
                  selectedIds={availableSelected}
                  onToggle={toggleAvailableSelect}
                  emptyText="Available codecs"
                  getLabel={(id) => getCodecLabel(id)}
                />
              </div>
              <div>
                <div
                  style={{ height: CODEC_LIST_LABEL_OFFSET }}
                  aria-hidden="true"
                />
                <div style={codecBtnColumnStyle}>
                  <CodecDualListBtn
                    onClick={addSelectedCodecs}
                    title="Add selected"
                  >
                    &gt;
                  </CodecDualListBtn>
                  <CodecDualListBtn onClick={addAllCodecs} title="Add all">
                    &gt;&gt;
                  </CodecDualListBtn>
                  <CodecDualListBtn
                    onClick={removeSelectedCodecs}
                    title="Remove selected"
                  >
                    &lt;
                  </CodecDualListBtn>
                  <CodecDualListBtn
                    onClick={removeAllCodecs}
                    title="Remove all"
                  >
                    &lt;&lt;
                  </CodecDualListBtn>
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: C.labelText,
                    textAlign: "center",
                    marginBottom: 8,
                  }}
                >
                  Selected
                </div>
                <CodecListBox
                  variant="selected"
                  items={selectedCodecs}
                  selectedIds={chosenSelected}
                  onToggle={toggleChosenSelect}
                  emptyText="No selected codecs"
                  getLabel={(id) => getCodecLabel(id)}
                />
              </div>
              <div>
                <div
                  style={{ height: CODEC_LIST_LABEL_OFFSET }}
                  aria-hidden="true"
                />
                <div style={codecBtnColumnStyle}>
                  <CodecDualListBtn
                    reorder
                    title="Move to top"
                    onClick={moveCodecToTop}
                  >
                    ^^
                  </CodecDualListBtn>
                  <CodecDualListBtn
                    reorder
                    title="Move up"
                    onClick={moveCodecUp}
                  >
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
                    title="Move to bottom"
                    onClick={moveCodecToBottom}
                  >
                    vv
                  </CodecDualListBtn>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: C.strongText,
                  marginBottom: 8,
                }}
              >
                Note:
              </div>
              <div style={{ width: "100%", boxSizing: "border-box" }}>
                {MEDIA_PARAMETERS_NOTE.split("\n")
                  .filter(Boolean)
                  .map((line, index) => (
                    <p
                      key={index}
                      style={{
                        margin: index === 0 ? 0 : "8px 0 0",
                        color: C.mutedText,
                        fontSize: 11,
                        lineHeight: 1.5,
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
        <div style={advancedFormInlineFooterStyle}>
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
