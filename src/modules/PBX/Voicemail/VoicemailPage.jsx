import React, { useState, useEffect, useRef } from "react";
import {
  Alert,
  Checkbox,
  CircularProgress,
  FormControl,
  MenuItem,
  Select as MuiSelect,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import {
  getVoicemailSettings,
  updateVoicemailSettings,
} from "../../../api/apiService";
import {
  VOICEMAIL_BREADCRUMB_SECTION,
  VOICEMAIL_FIELD_TOOLTIPS,
  VOICEMAIL_INITIAL_FORM,
  VOICEMAIL_MAX_MESSAGE_TIME_OPTIONS,
  VOICEMAIL_MAX_MESSAGES_OPTIONS,
  VOICEMAIL_MIN_MESSAGE_TIME_OPTIONS,
  VOICEMAIL_PROMPT_OPTIONS,
  VOICEMAIL_SECTIONS,
  VOICEMAIL_TITLE,
} from "../../../constants/VoicemailConstants";
import { PBX_MAIN_SECTION_HEADING_LEFT } from "../../../constants/pbxSectionHeadingConstants";

const VOICEMAIL_COMPACT_MQ = "(max-width: 768px)";

const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  divider: "#e2e6ec",
  labelText: "#3E5475",
  valueText: "#0f172a",
  accent: "#3E5475",
  sectionHeading: "#30415A",
};

const VOICEMAIL_CARD_RADIUS = 10;
const VOICEMAIL_FORM_HORIZONTAL_PADDING = 24;
const VOICEMAIL_FIELD_LABEL_WIDTH = 260;
const VOICEMAIL_INPUT_WIDTH = 150;
const VOICEMAIL_FIELD_MIDDLE_GAP = 24;

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
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
        : "inset 0 1px 3px rgba(15, 23, 42, 0.12)";
  };

  return (
    <button
      type="button"
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
        userSelect: "none",
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = baseBg;
          clearPressStyle(e.currentTarget);
        }
      }}
      onMouseDown={(e) => {
        if (!disabled) applyPressStyle(e.currentTarget);
      }}
      onMouseUp={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = hoverBg;
          clearPressStyle(e.currentTarget);
        }
      }}
    >
      {children}
    </button>
  );
};

const voicemailPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const voicemailPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const voicemailFormBodyStyle = {
  width: "100%",
  maxWidth: 720,
  margin: "0 auto",
  padding: `0 ${VOICEMAIL_FORM_HORIZONTAL_PADDING}px`,
  boxSizing: "border-box",
};

const voicemailCardStyle = {
  background: "#ffffff",
  borderRadius: VOICEMAIL_CARD_RADIUS,
  overflow: "hidden",
  border: `1px solid ${C.cardBorder}`,
  boxShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
};

const voicemailHeaderStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: VOICEMAIL_CARD_RADIUS,
  borderTopRightRadius: VOICEMAIL_CARD_RADIUS,
  display: "flex",
  alignItems: "center",
  padding: "7px 14px",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  borderBottom: `1px solid ${C.divider}`,
};

const voicemailFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "100%",
  padding: "12px 20px",
  borderTop: `1px solid ${C.divider}`,
  boxSizing: "border-box",
  background: "#ffffff",
  borderBottomLeftRadius: VOICEMAIL_CARD_RADIUS,
  borderBottomRightRadius: VOICEMAIL_CARD_RADIUS,
};

const voicemailFooterBtnStyle = {
  minWidth: 110,
  height: 34,
  fontSize: 13,
  margin: 0,
  padding: "0 28px",
  lineHeight: "34px",
  boxSizing: "border-box",
};

const voicemailFixedAlertSx = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  maxWidth: 420,
  boxShadow: 3,
};

const VoicemailBreadcrumb = ({ section, current }) => (
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
    <span>PBX</span>
    <span>&gt;</span>
    <span>{section}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>{current}</span>
  </div>
);

const TableListLoading = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: 48,
    }}
  >
    <CircularProgress size={28} style={{ color: C.accent }} />
  </div>
);

const VoicemailSectionHeading = ({ title, isFirst = false }) => (
  <div
    style={{
      margin: isFirst ? "0 0 24px 0" : "28px 0 24px 0",
      position: "relative",
      width: "100%",
    }}
  >
    <div style={{ borderTop: `1px solid ${C.divider}` }} />
    <span
      style={{
        position: "absolute",
        top: -10,
        left: PBX_MAIN_SECTION_HEADING_LEFT,
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

const VOICEMAIL_TOOLTIP_PROPS = {
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
      },
    },
    arrow: {
      sx: { color: "#fff" },
    },
  },
};

const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";
const FOCUS_RING_SHADOW = "0 0 0 2px rgba(62, 84, 117, 0.15)";

const voicemailOutlinedInputRootSx = {
  backgroundColor: "#fff",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  "& fieldset": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  "&:hover fieldset": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused": {
    boxShadow: FOCUS_RING_SHADOW,
  },
  "&.Mui-focused fieldset": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
  "&.Mui-focused:hover fieldset": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
};

const voicemailSelectSx = (isCompact) => ({
  fontSize: 13,
  backgroundColor: "#fff",
  width: isCompact ? "100%" : VOICEMAIL_INPUT_WIDTH,
  maxWidth: isCompact ? "100%" : VOICEMAIL_INPUT_WIDTH,
  minHeight: 34,
  height: 34,
  ...voicemailOutlinedInputRootSx,
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused": {
    boxShadow: FOCUS_RING_SHADOW,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
  "&.Mui-focused:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
  "& .MuiSelect-select": {
    padding: "7px 32px 7px 10px !important",
    display: "flex",
    alignItems: "center",
    color: C.valueText,
    cursor: "pointer",
  },
});

const voicemailCheckboxSx = {
  padding: 0,
  margin: 0,
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const VoicemailFieldRow = ({ label, tooltipKey, isCompact, children }) => {
  const stacked = isCompact;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: stacked ? "column" : "row",
        alignItems: stacked ? "stretch" : "center",
        justifyContent: "flex-start",
        padding: "8px 0",
        gap: stacked ? 8 : VOICEMAIL_FIELD_MIDDLE_GAP,
        width: "100%",
      }}
    >
      <Tooltip
        title={VOICEMAIL_FIELD_TOOLTIPS[tooltipKey] || ""}
        {...VOICEMAIL_TOOLTIP_PROPS}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: C.labelText,
            textAlign: "left",
            width: stacked ? "100%" : "auto",
            maxWidth: stacked ? "100%" : VOICEMAIL_FIELD_LABEL_WIDTH,
            flexShrink: 0,
            lineHeight: 1.4,
            cursor: "help",
          }}
        >
          {label}
        </span>
      </Tooltip>
      <div
        style={{
          minWidth: 0,
          flexShrink: 0,
          display: "flex",
          justifyContent: "flex-start",
          width: stacked ? "100%" : VOICEMAIL_INPUT_WIDTH,
          marginLeft: stacked ? 0 : "auto",
        }}
      >
        {children}
      </div>
    </div>
  );
};

const mapApiToForm = (d) => ({
  max_messages: String(d.max_messages ?? VOICEMAIL_INITIAL_FORM.max_messages),
  max_message_time: String(
    d.max_message_time ?? VOICEMAIL_INITIAL_FORM.max_message_time,
  ),
  min_message_time: String(
    d.min_message_time ?? VOICEMAIL_INITIAL_FORM.min_message_time,
  ),
  press5_enabled: d.press5_enabled ?? VOICEMAIL_INITIAL_FORM.press5_enabled,
  busy_prompt: d.busy_prompt ?? VOICEMAIL_INITIAL_FORM.busy_prompt,
  noanswer_prompt: d.noanswer_prompt ?? VOICEMAIL_INITIAL_FORM.noanswer_prompt,
  announce_callerid:
    d.announce_callerid ?? VOICEMAIL_INITIAL_FORM.announce_callerid,
  announce_duration:
    d.announce_duration ?? VOICEMAIL_INITIAL_FORM.announce_duration,
  announce_arrival_time:
    d.announce_arrival_time ?? VOICEMAIL_INITIAL_FORM.announce_arrival_time,
});

const VoicemailPage = () => {
  const isCompact = useMediaQuery(VOICEMAIL_COMPACT_MQ);
  const [form, setForm] = useState({ ...VOICEMAIL_INITIAL_FORM });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const hasLoaded = useRef(false);

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getVoicemailSettings();
      if (res?.response && res?.message && typeof res.message === "object") {
        setForm(mapApiToForm(res.message));
      }
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      loadData();
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        max_messages: Number(form.max_messages),
        max_message_time: Number(form.max_message_time),
        min_message_time: Number(form.min_message_time),
        press5_enabled: form.press5_enabled,
        busy_prompt: form.busy_prompt,
        noanswer_prompt: form.noanswer_prompt,
        announce_callerid: form.announce_callerid,
        announce_duration: form.announce_duration,
        announce_arrival_time: form.announce_arrival_time,
      };
      const res = await updateVoicemailSettings(payload);
      if (res?.response) {
        showMsg("success", "Voicemail settings saved successfully");
      } else {
        showMsg(
          "error",
          typeof res?.message === "string" ? res.message : "Save failed",
        );
      }
    } catch (e) {
      showMsg("error", e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const renderSelect = (fieldKey, options, getLabel) => (
    <FormControl
      size="small"
      sx={{ width: isCompact ? "100%" : VOICEMAIL_INPUT_WIDTH }}
    >
      <MuiSelect
        value={form[fieldKey]}
        onChange={(e) => set(fieldKey, e.target.value)}
        sx={voicemailSelectSx(isCompact)}
      >
        {options.map((opt) => {
          const value = typeof opt === "string" ? opt : opt.value;
          const label = getLabel
            ? getLabel(opt)
            : typeof opt === "string"
              ? opt
              : opt.label;
          return (
            <MenuItem key={value} value={value} sx={{ fontSize: 13 }}>
              {label}
            </MenuItem>
          );
        })}
      </MuiSelect>
    </FormControl>
  );

  return (
    <div
      style={{
        ...voicemailPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={voicemailPageInnerStyle}>
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={voicemailFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <VoicemailBreadcrumb
          section={VOICEMAIL_BREADCRUMB_SECTION}
          current={VOICEMAIL_TITLE}
        />

        <div style={voicemailCardStyle}>
          <div style={voicemailHeaderStyle}>
            <span>{VOICEMAIL_TITLE}</span>
          </div>

          <div style={{ padding: "12px 0 0", boxSizing: "border-box" }}>
            {loading ? (
              <TableListLoading />
            ) : (
              <div style={{ ...voicemailFormBodyStyle, paddingBottom: 16 }}>
                <VoicemailSectionHeading
                  title={VOICEMAIL_SECTIONS.message_options}
                  isFirst
                />

                <VoicemailFieldRow
                  label="Max Messages per extension"
                  tooltipKey="max_messages"
                  isCompact={isCompact}
                >
                  {renderSelect("max_messages", VOICEMAIL_MAX_MESSAGES_OPTIONS)}
                </VoicemailFieldRow>

                <VoicemailFieldRow
                  label="Max Message Time (s)"
                  tooltipKey="max_message_time"
                  isCompact={isCompact}
                >
                  {renderSelect(
                    "max_message_time",
                    VOICEMAIL_MAX_MESSAGE_TIME_OPTIONS,
                  )}
                </VoicemailFieldRow>

                <VoicemailFieldRow
                  label="Min Message Time (s)"
                  tooltipKey="min_message_time"
                  isCompact={isCompact}
                >
                  {renderSelect(
                    "min_message_time",
                    VOICEMAIL_MIN_MESSAGE_TIME_OPTIONS,
                  )}
                </VoicemailFieldRow>

                <VoicemailFieldRow
                  label="Press 5 to leave a message"
                  tooltipKey="press5_enabled"
                  isCompact={isCompact}
                >
                  <Checkbox
                    size="small"
                    checked={!!form.press5_enabled}
                    onChange={(e) => set("press5_enabled", e.target.checked)}
                    sx={voicemailCheckboxSx}
                  />
                </VoicemailFieldRow>

                <VoicemailSectionHeading
                  title={VOICEMAIL_SECTIONS.greeting_options}
                />

                <VoicemailFieldRow
                  label="Busy Prompt"
                  tooltipKey="busy_prompt"
                  isCompact={isCompact}
                >
                  {renderSelect("busy_prompt", VOICEMAIL_PROMPT_OPTIONS)}
                </VoicemailFieldRow>

                <VoicemailFieldRow
                  label="No answer Prompt"
                  tooltipKey="noanswer_prompt"
                  isCompact={isCompact}
                >
                  {renderSelect("noanswer_prompt", VOICEMAIL_PROMPT_OPTIONS)}
                </VoicemailFieldRow>

                <VoicemailSectionHeading
                  title={VOICEMAIL_SECTIONS.playback_options}
                />

                <VoicemailFieldRow
                  label="Announce Message Caller ID"
                  tooltipKey="announce_callerid"
                  isCompact={isCompact}
                >
                  <Checkbox
                    size="small"
                    checked={!!form.announce_callerid}
                    onChange={(e) => set("announce_callerid", e.target.checked)}
                    sx={voicemailCheckboxSx}
                  />
                </VoicemailFieldRow>

                <VoicemailFieldRow
                  label="Announce Message Duration"
                  tooltipKey="announce_duration"
                  isCompact={isCompact}
                >
                  <Checkbox
                    size="small"
                    checked={!!form.announce_duration}
                    onChange={(e) => set("announce_duration", e.target.checked)}
                    sx={voicemailCheckboxSx}
                  />
                </VoicemailFieldRow>

                <VoicemailFieldRow
                  label="Announce Message Arrival Time"
                  tooltipKey="announce_arrival_time"
                  isCompact={isCompact}
                >
                  <Checkbox
                    size="small"
                    checked={!!form.announce_arrival_time}
                    onChange={(e) =>
                      set("announce_arrival_time", e.target.checked)
                    }
                    sx={voicemailCheckboxSx}
                  />
                </VoicemailFieldRow>
              </div>
            )}
          </div>

          {!loading && (
            <div style={voicemailFooterStyle}>
              <Btn
                variant="primary"
                onClick={handleSave}
                disabled={saving}
                style={voicemailFooterBtnStyle}
              >
                {saving ? (
                  <>
                    <CircularProgress size={14} color="inherit" />
                    Saving...
                  </>
                ) : (
                  "SAVE"
                )}
              </Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoicemailPage;
