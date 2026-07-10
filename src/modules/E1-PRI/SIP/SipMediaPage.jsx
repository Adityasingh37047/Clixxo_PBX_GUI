import React, { useEffect, useMemo, useState } from "react";
import {
  SIP_MEDIA_FIELDS,
  SIP_MEDIA_CODEC_FIELD,
  SIP_MEDIA_INITIAL_FORM,
  SIP_MEDIA_FIELD_TOOLTIPS,
  SIP_MEDIA_PAGE_BREADCRUMB_ROOT,
  SIP_MEDIA_PAGE_BREADCRUMB_SECTION,
  SIP_MEDIA_PAGE_TITLE,
  SIP_MEDIA_CARD_TITLE,
  SIP_MEDIA_SECTION_RTP_DTMF,
  SIP_MEDIA_SECTION_JITTER_CODEC,
  SIP_MEDIA_SECTION_HEADING_LEFT,
  SIP_MEDIA_SECTION_HEADING_COLOR,
  SIP_MEDIA_BTN_SAVE,
  SIP_MEDIA_BTN_SAVING,
  SIP_MEDIA_BTN_RESET,
  SIP_MEDIA_LOADING_TEXT,
  SIP_MEDIA_MSG_SETTINGS_UPDATED,
  SIP_MEDIA_MSG_SAVE_FAILED,
  SIP_MEDIA_MSG_LOAD_FAILED,
  SIP_MEDIA_MSG_NETWORK_SAVE_FAILED,
  SIP_MEDIA_MSG_RESET,
} from "../../../constants/SipMediaConstants";
import { CircularProgress, Alert, Tooltip, useMediaQuery } from "@mui/material";
import {
  listMediaSettings,
  updateMediaSettings,
} from "../../../api/apiService";

const SIP_MEDIA_COMPACT_MQ = "(max-width: 768px)";
const SIP_MEDIA_SCROLL_CLASS = "sip-media-scroll";

const SIP_MEDIA_TOOLTIP_PROPS = {
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

const formatFieldTooltipTitle = (text) => {
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

const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  cardShadow:
    "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
  divider: "#e2e6ec",
  labelText: "#3E5475",
  valueText: "#1f2937",
  mutedText: "#6b7280",
  placeholderText: "#9aa3b2",
  strongText: "#1f2937",
  accent: "#4A5D75",
  accentDark: "#3a4a5e",
  amber: "#dc2626",
  sectionHeading: SIP_MEDIA_SECTION_HEADING_COLOR,
};

const CARD_RADIUS = 4;
const FIELD_RADIUS = 6;

const sipFormTextStyle = {
  fontSize: 13,
  color: C.labelText,
};

const SIP_MEDIA_LABEL_COL_WIDTH = 200;
const SIP_MEDIA_CONTROL_COL_WIDTH = 220;
const SIP_MEDIA_FIELD_COL_GAP = 8;
const SIP_MEDIA_FORM_PAD_X = 28;

const SipFieldRow = ({
  label,
  tooltipKey,
  children,
  labelStyle = {},
  labelColWidth = SIP_MEDIA_LABEL_COL_WIDTH,
}) => {
  const tooltip = tooltipKey ? SIP_MEDIA_FIELD_TOOLTIPS[tooltipKey] || "" : "";
  const labelNode = (
    <label
      style={{
        ...sipFormTextStyle,
        fontWeight: 600,
        flex: "0 0 auto",
        width: "100%",
        maxWidth: "100%",
        textAlign: "left",
        lineHeight: 1.4,
        whiteSpace: "normal",
        overflowWrap: "break-word",
        wordBreak: "break-word",
        cursor: tooltip ? "help" : undefined,
        ...labelStyle,
      }}
    >
      {label}
    </label>
  );

  const labelWrapStyle = {
    flex: `0 0 ${labelColWidth}px`,
    width: labelColWidth,
    maxWidth: labelColWidth,
    minWidth: labelColWidth,
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        width: "100%",
        minHeight: 36,
        gap: SIP_MEDIA_FIELD_COL_GAP,
      }}
    >
      <div style={labelWrapStyle}>
        {tooltip ? (
          <Tooltip
            title={formatFieldTooltipTitle(tooltip)}
            {...SIP_MEDIA_TOOLTIP_PROPS}
          >
            {labelNode}
          </Tooltip>
        ) : (
          labelNode
        )}
      </div>
      {children}
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
        borderRadius: 4,
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

const nativeFieldInputStyle = {
  height: 32,
  width: SIP_MEDIA_CONTROL_COL_WIDTH,
  minWidth: SIP_MEDIA_CONTROL_COL_WIDTH,
  maxWidth: SIP_MEDIA_CONTROL_COL_WIDTH,
  padding: "0 10px",
  fontSize: 13,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: FIELD_RADIUS,
  outline: "none",
  backgroundColor: "#fff",
  color: C.labelText,
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const nativeFieldSelectStyle = {
  width: SIP_MEDIA_CONTROL_COL_WIDTH,
  minWidth: SIP_MEDIA_CONTROL_COL_WIDTH,
  maxWidth: SIP_MEDIA_CONTROL_COL_WIDTH,
  minHeight: 32,
  height: 32,
  padding: "4px 28px 4px 10px",
  fontSize: 13,
  lineHeight: 1.35,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: FIELD_RADIUS,
  outline: "none",
  backgroundColor: "#fff",
  color: C.labelText,
  boxSizing: "border-box",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  appearance: "auto",
  cursor: "pointer",
};

const MEDIA_COLUMN_SPLIT_INDEX = Math.ceil(SIP_MEDIA_FIELDS.length / 2);
const MEDIA_LEFT_COLUMN_FIELDS = SIP_MEDIA_FIELDS.slice(
  0,
  MEDIA_COLUMN_SPLIT_INDEX,
);
const MEDIA_RIGHT_COLUMN_FIELDS = SIP_MEDIA_FIELDS.slice(
  MEDIA_COLUMN_SPLIT_INDEX,
);

const advancedPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  width: "100%",
  maxWidth: "100%",
  padding: 16,
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  boxSizing: "border-box",
};

const advancedPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
};

const advancedCardShellStyle = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  padding: 0,
  boxSizing: "border-box",
};

const advancedTableContainerStyle = {
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

const advancedFormInlineFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
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
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 4,
  minWidth: 100,
};

const SIP_MEDIA_LAPTOP_NARROW_MQ = "(max-width: 1366px)";

const sipMediaDashboardGridStyle = (isCompact) => ({
  display: "grid",
  gridTemplateColumns: isCompact
    ? "1fr"
    : "minmax(0, 1fr) 1px minmax(0, 1fr)",
  width: "100%",
  alignItems: "stretch",
  alignContent: "start",
});

const sipMediaColumnStyle = (isCompact) => ({
  display: "flex",
  flexDirection: "column",
  gap: 12,
  minWidth: 0,
  padding: isCompact
    ? `16px ${SIP_MEDIA_FORM_PAD_X}px 20px`
    : "16px 36px 20px",
  boxSizing: "border-box",
  background: C.cardBg,
});

const sipMediaDividerCellStyle = {
  display: "flex",
  flexDirection: "column",
  alignSelf: "stretch",
  padding: "14px 0",
  boxSizing: "border-box",
};

const sipMediaDividerLineStyle = {
  flex: 1,
  width: 1,
  background: C.divider,
  margin: "0 auto",
};

const sipHeaderStyle = {
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
  color: C.labelText,
  borderBottom: `1px solid ${C.divider}`,
  boxSizing: "border-box",
};

const dashboardFieldsStackStyle = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  gap: 12,
};

const SipMediaSectionHeading = ({ title, isFirst = false }) => {
  const isLaptopNarrow = useMediaQuery(SIP_MEDIA_LAPTOP_NARROW_MQ);
  return (
  <div
    style={{
      margin: isFirst
        ? isLaptopNarrow
          ? "20px 0 24px 0"
          : "12px 0 24px 0"
        : "28px 0 24px 0",
      position: "relative",
      width: "100%",
    }}
  >
    <div style={{ borderTop: `1px solid ${C.divider}` }} />
    <span
      style={{
        position: "absolute",
        top: -10,
        left: isLaptopNarrow ? 0 : SIP_MEDIA_SECTION_HEADING_LEFT,
        background: C.cardBg,
        paddingRight: 8,
        fontSize: 14,
        fontWeight: 600,
        color: C.sectionHeading,
      }}
    >
      {title}
    </span>
  </div>
  );
};

const sipMediaFixedAlertSx = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  boxShadow: 3,
};

const SipMediaScrollbarStyles = () => (
  <style>{`
    .${SIP_MEDIA_SCROLL_CLASS} {
      scroll-behavior: smooth;
      scrollbar-gutter: stable;
      scrollbar-width: thin;
      scrollbar-color: rgba(100, 116, 139, 0.45) transparent;
    }
    .${SIP_MEDIA_SCROLL_CLASS}::-webkit-scrollbar {
      width: 8px;
      height: 8px;
      transition: width 0.2s ease, height 0.2s ease;
    }
    .${SIP_MEDIA_SCROLL_CLASS}::-webkit-scrollbar:hover {
      width: 11px;
      height: 11px;
    }
    .${SIP_MEDIA_SCROLL_CLASS}::-webkit-scrollbar-corner {
      background: transparent;
    }
    .${SIP_MEDIA_SCROLL_CLASS}::-webkit-scrollbar-track {
      background: transparent;
    }
    .${SIP_MEDIA_SCROLL_CLASS}::-webkit-scrollbar-thumb {
      background-color: rgba(100, 116, 139, 0.45);
      border-radius: 6px;
      border: 2px solid transparent;
      background-clip: padding-box;
      transition: background-color 0.2s ease;
    }
    .${SIP_MEDIA_SCROLL_CLASS}::-webkit-scrollbar-thumb:hover {
      background-color: rgba(71, 85, 105, 0.65);
    }
  `}</style>
);

const SipMediaBreadcrumb = () => (
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
      flexShrink: 0,
      width: "100%",
    }}
  >
    <span>{SIP_MEDIA_PAGE_BREADCRUMB_ROOT}</span>
    <span>&gt;</span>
    <span>{SIP_MEDIA_PAGE_BREADCRUMB_SECTION}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>
      {SIP_MEDIA_PAGE_TITLE}
    </span>
  </div>
);

const AdvancedPageShell = ({ children, isCompact }) => (
  <div
    className={SIP_MEDIA_SCROLL_CLASS}
    style={{
      ...advancedPageWrapStyle,
      ...(isCompact ? { padding: 8 } : {}),
    }}
    data-native-scroll
  >
    <div style={advancedPageInnerStyle}>{children}</div>
  </div>
);

const valueColStyle = {
  flex: "1 1 auto",
  minWidth: SIP_MEDIA_CONTROL_COL_WIDTH,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  paddingTop: 2,
};

const controlSlotStyle = {
  width: SIP_MEDIA_CONTROL_COL_WIDTH,
  minWidth: SIP_MEDIA_CONTROL_COL_WIDTH,
  maxWidth: SIP_MEDIA_CONTROL_COL_WIDTH,
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
};

const fieldInputStyle = { ...nativeFieldInputStyle };
const fieldSelectStyle = { ...nativeFieldSelectStyle };

const SipMediaPage = () => {
  const isCompact = useMediaQuery(SIP_MEDIA_COMPACT_MQ);
  const [formData, setFormData] = useState(SIP_MEDIA_INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const uiToApi = useMemo(
    () => ({
      dtmfTransmitMode: "dtmf_transmit_mode",
      rfc2833Payload: "rfc2833_payload",
      rtpPortRange: "rtp_port_range",
      silenceSuppression: "slience_suppression",
      noiseReduction: "noise_reduction",
      comfortNoise: "comfort_noise_generation",
      jitterMode: "jitter_mode",
      jitterBuffer: "jitter_buffer_ms",
      jitterUnderrunLead: "jitter_under_run_lead_ms",
      jitterOverrunLead: "jitter_over_run_lead_ms",
      ipOutputLevelControl: "ip_side_output_level_control_mode",
      voiceGainOutput: "voice_gain_output_from_ip_db",
      packTimeDefault: "pack_time_when_nego_fail_default_value",
      codecSetting: "codec_seq_setting",
    }),
    [],
  );

  const apiToUi = useMemo(() => {
    const r = {};
    Object.entries(uiToApi).forEach(([u, a]) => {
      r[a] = u;
    });
    return r;
  }, [uiToApi]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await listMediaSettings();
        const settings = res?.message?.sip_settings?.[0] || {};
        const next = { ...SIP_MEDIA_INITIAL_FORM };
        Object.entries(settings).forEach(([k, v]) => {
          const uiKey = apiToUi[k];
          if (!uiKey) return;
          next[uiKey] = v ?? next[uiKey];
        });
        setFormData(next);
      } catch (e) {
        console.error("Failed to fetch media settings:", e);
        showMessage("error", SIP_MEDIA_MSG_LOAD_FAILED);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [apiToUi]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = { id: 1 };
      Object.entries(uiToApi).forEach(([u, a]) => {
        payload[a] = formData[u] ?? null;
      });
      const res = await updateMediaSettings(payload);
      if (res?.response) {
        showMessage("success", res?.message || SIP_MEDIA_MSG_SETTINGS_UPDATED);
      } else {
        showMessage("error", res?.message || SIP_MEDIA_MSG_SAVE_FAILED);
      }
    } catch (e) {
      console.error("Failed to save media settings:", e);
      showMessage("error", e?.message || SIP_MEDIA_MSG_NETWORK_SAVE_FAILED);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormData(SIP_MEDIA_INITIAL_FORM);
    showMessage("info", SIP_MEDIA_MSG_RESET);
  };

  const isFieldVisible = (field) => {
    if (!field.conditional) return true;
    const condVal = formData[field.conditional];
    if (field.conditionalValues) {
      return field.conditionalValues.includes(condVal);
    }
    if (field.conditionalValue) {
      return condVal === field.conditionalValue;
    }
    return true;
  };

  const labelColWidth = isCompact ? 160 : SIP_MEDIA_LABEL_COL_WIDTH;

  const renderFormField = (field) => {
    if (!isFieldVisible(field)) return null;

    return (
      <SipFieldRow
        key={field.name}
        label={field.label}
        tooltipKey={field.name}
        labelColWidth={labelColWidth}
        labelStyle={
          field.name === SIP_MEDIA_CODEC_FIELD.name
            ? { whiteSpace: "normal" }
            : {}
        }
      >
        <div style={valueColStyle}>
          <div style={controlSlotStyle}>
            {field.type === "select" ? (
              <select
                name={field.name}
                value={formData[field.name]}
                onChange={handleInputChange}
                style={fieldSelectStyle}
                {...nativeFieldInteraction}
              >
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                name={field.name}
                value={formData[field.name]}
                onChange={handleInputChange}
                style={fieldInputStyle}
                {...nativeFieldInteraction}
              />
            )}
          </div>
        </div>
      </SipFieldRow>
    );
  };

  return (
    <>
      <SipMediaScrollbarStyles />
      <AdvancedPageShell isCompact={isCompact}>
        {message.text && !saving && (
          <Alert
            severity={
              message.type === "error"
                ? "error"
                : message.type === "success"
                  ? "success"
                  : "info"
            }
            onClose={() => setMessage({ type: "", text: "" })}
            sx={sipMediaFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <SipMediaBreadcrumb />

        <div style={advancedCardShellStyle}>
          <div style={advancedTableContainerStyle}>
            <div style={sipHeaderStyle}>
              <span>{SIP_MEDIA_CARD_TITLE}</span>
            </div>

            {loading ? (
              <div
                className="flex items-center justify-center w-full"
                style={{ minHeight: 400, padding: "48px 32px" }}
              >
                <div className="text-center">
                  <CircularProgress size={40} sx={{ color: C.accent }} />
                  <div
                    style={{
                      marginTop: 12,
                      fontSize: 13,
                      color: C.mutedText,
                      fontWeight: 500,
                    }}
                  >
                    {SIP_MEDIA_LOADING_TEXT}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div
                  className={SIP_MEDIA_SCROLL_CLASS}
                  style={{ boxSizing: "border-box" }}
                >
                  <div className="settings-dashboard-grid" style={sipMediaDashboardGridStyle(isCompact)}>
                    <div style={sipMediaColumnStyle(isCompact)}>
                      <SipMediaSectionHeading
                        title={SIP_MEDIA_SECTION_RTP_DTMF}
                        isFirst
                      />
                      <div style={dashboardFieldsStackStyle}>
                        {MEDIA_LEFT_COLUMN_FIELDS.map((field) =>
                          renderFormField(field),
                        )}
                      </div>
                    </div>

                    {!isCompact && (
                      <div className="settings-dashboard-divider" style={sipMediaDividerCellStyle} aria-hidden="true">
                        <div style={sipMediaDividerLineStyle} />
                      </div>
                    )}

                    <div style={sipMediaColumnStyle(isCompact)}>
                      <SipMediaSectionHeading
                        title={SIP_MEDIA_SECTION_JITTER_CODEC}
                        isFirst
                      />
                      <div style={dashboardFieldsStackStyle}>
                        {MEDIA_RIGHT_COLUMN_FIELDS.map((field) =>
                          renderFormField(field),
                        )}
                        {renderFormField(SIP_MEDIA_CODEC_FIELD)}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={advancedFormInlineFooterStyle}>
                  <Btn
                    variant="primary"
                    onClick={handleSave}
                    disabled={loading || saving}
                    style={advancedFormBtnStyle}
                  >
                    {saving ? (
                      <>
                        <CircularProgress size={14} color="inherit" />
                        {SIP_MEDIA_BTN_SAVING}
                      </>
                    ) : (
                      SIP_MEDIA_BTN_SAVE
                    )}
                  </Btn>
                  <Btn
                    variant="cancel"
                    onClick={handleReset}
                    style={advancedFormBtnStyle}
                  >
                    {SIP_MEDIA_BTN_RESET}
                  </Btn>
                </div>
              </>
            )}
          </div>
        </div>
      </AdvancedPageShell>
    </>
  );
};

export default SipMediaPage;
