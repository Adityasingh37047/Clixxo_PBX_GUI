import React, { useState, useEffect, useRef } from "react";
import { Alert, Checkbox, CircularProgress, useMediaQuery } from "@mui/material";
import { getVoicemailSettings, updateVoicemailSettings } from "../../../api/apiService";
import Tooltip from "@mui/material/Tooltip";    
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const PBX_COMPACT_MQ = "(max-width: 768px)";

const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#9CA3AF",
  labelText: "#3E5475",
  valueText: "#0f172a",
  accent: "#3E5475",
};

const CARD_RADIUS = 10;

const Btn = ({ children, onClick, disabled, variant = "default", style: extraStyle }) => {
  const styles = {
    default: { background: C.cardBg, color: C.valueText, border: "1px solid #9ca3af" },
    primary: {
      background: "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
      color: "#fff",
      border: "1px solid #5A6F8F",
      fontWeight: 600,
    },
  };
  const s = styles[variant] || styles.default;
  const hoverBg = variant === "primary"
    ? "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)"
    : "#e2e8f0";
  const baseBg = extraStyle?.background ?? s.background;
  return (
    <button
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
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = hoverBg; }}
      onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.background = baseBg; }}
    >
      {children}
    </button>
  );
};

const PbxBreadcrumb = ({ section, current }) => (
  <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16, fontWeight: 400, display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
    <span>PBX</span><span>&gt;</span>
    <span>{section}</span><span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>{current}</span>
  </div>
);
const tooltipProps = {
  arrow: true,
  placement: "top",
  slotProps: {
    tooltip: {
      sx: {
        bgcolor: "#fff",
        color: "#000",
        border: "1px solid #d1d5db",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        fontSize: 12,
        maxWidth: 500,
      },
    },
    arrow: {
      sx: {
        color: "#fff",
      },
    },
  },
};



const TableListLoading = () => (
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 48 }}>
    <CircularProgress size={28} style={{ color: C.accent }} />
  </div>
);

const SectionHeading = ({ title, isFirst = false }) => (
  <div style={{ margin: isFirst ? "0 0 24px 0" : "16px 0 24px 0", position: "relative", width: "100%" }}>
    <div style={{ borderTop: `1px solid ${C.cardBorder}` }} />
    <span style={{ position: "absolute", top: -10, left: 0, background: C.cardBg, paddingRight: 8, fontSize: 13, fontWeight: 600, color: "#30415A" }}>
      {title}
    </span>
  </div>
);

const OUTLINED_BORDER = "rgba(0,0,0,0.23)";
const OUTLINED_FOCUS = "#1976d2";

const LABEL_W = 220;

const labelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: C.labelText,
  textAlign: "left",
  width: LABEL_W,
  marginRight: 10,
  lineHeight: 1.4,
  flexShrink: 0,
  whiteSpace: "nowrap",
};

const inputStyle = {
  borderRadius: 6,
  border: `1px solid ${OUTLINED_BORDER}`,
  fontSize: 12,
  width: "100%",
  backgroundColor: "#ffffff",
  outline: "none",
  color: "#3E5475",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
  height: 32,
  padding: "0 8px",
};

const fieldInteraction = {
  onFocus: (e) => { e.target.style.borderColor = OUTLINED_FOCUS; e.target.style.boxShadow = `0 0 0 1px ${OUTLINED_FOCUS}`; },
  onBlur: (e) => { e.target.style.borderColor = OUTLINED_BORDER; e.target.style.boxShadow = "none"; },
  onMouseEnter: (e) => { if (document.activeElement !== e.target) e.target.style.borderColor = "rgba(0,0,0,0.87)"; },
  onMouseLeave: (e) => { if (document.activeElement !== e.target) { e.target.style.borderColor = OUTLINED_BORDER; e.target.style.boxShadow = "none"; } },
};

const GridRow = ({ children }) => (
  <div style={{ display: "flex", justifyContent: "center", padding: "4px 16px" }}>
    <div style={{ display: "flex", alignItems: "center", width: "70%", maxWidth: 660, gap: 12 }}>
      {children}
    </div>
  </div>
);

const checkboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const CheckboxRow = ({
  checked,
  onChange,
  label,
  tooltip,
}) => (
  <GridRow>
    <div style={{ width: LABEL_W, marginRight: 10, flexShrink: 0 }} />
    <Tooltip title={tooltip || ""} {...tooltipProps}>
  <label
    style={{
      display: "flex",
      alignItems: "center",
      gap: 4,
      cursor: "pointer",
      flex: 1,
      minWidth: 0,
    }}
  >
    <Checkbox
      size="small"
      checked={!!checked}
      onChange={(e) => onChange(e.target.checked)}
      sx={checkboxSx}
    />
    <span
      style={{
        fontSize: 13,
        fontWeight: 500,
        color: C.labelText,
      }}
    >
      {label}
    </span>
  </label>
</Tooltip>
  </GridRow>
);

const INITIAL_FORM = {
  max_messages: "100",
  max_message_time: "300",
  min_message_time: "3",
  press5_enabled: true,
  busy_prompt: "default",
  noanswer_prompt: "default",
  announce_callerid: true,
  announce_duration: true,
  announce_arrival_time: true,
};

const VoicemailPage = () => {
  const isCompact = useMediaQuery(PBX_COMPACT_MQ);
  const [form, setForm] = useState({ ...INITIAL_FORM });
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
        const d = res.message;
        setForm({
          max_messages: String(d.max_messages ?? INITIAL_FORM.max_messages),
          max_message_time: String(d.max_message_time ?? INITIAL_FORM.max_message_time),
          min_message_time: String(d.min_message_time ?? INITIAL_FORM.min_message_time),
          press5_enabled: d.press5_enabled ?? INITIAL_FORM.press5_enabled,
          busy_prompt: d.busy_prompt ?? INITIAL_FORM.busy_prompt,
          noanswer_prompt: d.noanswer_prompt ?? INITIAL_FORM.noanswer_prompt,
          announce_callerid: d.announce_callerid ?? INITIAL_FORM.announce_callerid,
          announce_duration: d.announce_duration ?? INITIAL_FORM.announce_duration,
          announce_arrival_time: d.announce_arrival_time ?? INITIAL_FORM.announce_arrival_time,
        });
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
        showMsg("error", typeof res?.message === "string" ? res.message : "Save failed");
      }
    } catch (e) {
      showMsg("error", e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ backgroundColor: C.pageBg, minHeight: "calc(100vh - 80px)", padding: isCompact ? 8 : 16, boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: "100%", maxWidth: 1000 }}>

        {message.text && (
          <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, minWidth: 300, maxWidth: 420 }}>
            <Alert severity={message.type} onClose={() => setMessage({ type: "", text: "" })} sx={{ boxShadow: 3 }}>
              {message.text}
            </Alert>
          </div>
        )}

        <PbxBreadcrumb section="Voicemail" current="Voicemail" />

        <div style={{ background: "#ffffff", borderRadius: CARD_RADIUS, overflow: "hidden", border: `1.5px solid ${C.cardBorder}`, boxShadow: "0 10px 30px rgba(15,23,42,0.06)" }}>
          <div style={{ width: "100%", minHeight: 44, background: C.cardBg, borderTopLeftRadius: CARD_RADIUS, borderTopRightRadius: CARD_RADIUS, display: "flex", alignItems: "center", padding: "7px 14px", fontWeight: 700, fontSize: 13, color: C.labelText, borderBottom: `1px solid ${C.cardBorder}` }}>
            <span>Voicemail</span>
          </div>

          <div style={{ padding: "12px 20px 0", boxSizing: "border-box" }}>
            {loading ? (
              <TableListLoading />
            ) : (
              <div style={{ paddingBottom: 16 }}>

                {/* ── Message Options ── */}
                <SectionHeading title="Message Options" isFirst />

                <GridRow>
                <Tooltip
  title="This option sets the maximum number of messages per extension. The default is 100."
  {...tooltipProps}
>
  <label style={{ ...labelStyle, cursor: "help" }}>
    Max Messages per extension
  </label>
</Tooltip>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <select value={form.max_messages} onChange={(e) => set("max_messages", e.target.value)} style={inputStyle} {...fieldInteraction}>
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="100">100</option>
                      <option value="250">250</option>
                    </select>
                  </div>
                </GridRow>

                <GridRow>
                <Tooltip
  title="This option sets the maximum lengthof a single voicemail message (in seconds)."
  {...tooltipProps}
>
  <label style={{ ...labelStyle, cursor: "help" }}>Max Message Time (s)</label>
</Tooltip>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <select value={form.max_message_time} onChange={(e) => set("max_message_time", e.target.value)} style={inputStyle} {...fieldInteraction}>
                      <option value="60">60</option>
                      <option value="120">120</option>
                      <option value="300">300</option>
                      <option value="600">600</option>
                    </select>
                  </div>
                </GridRow>

                <GridRow>
                <Tooltip
  title="This option sets the minimum length of a single voicemail message (in seconds). Messages below this threshold will be automatically deleted."
  {...tooltipProps}
>
  <label style={{ ...labelStyle, cursor: "help" }}>Min Message Time (s)</label>
</Tooltip>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <select value={form.min_message_time} onChange={(e) => set("min_message_time", e.target.value)} style={inputStyle} {...fieldInteraction}>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
                  </div>
                </GridRow>

                <CheckboxRow
                  checked={form.press5_enabled}
                  onChange={(val) => set("press5_enabled", val)}
                  label="press 5 to leave a message"
                  tooltip="If this option is ticke, you will hear the prompt: The phone you dial is unavailable now. Please press 5 to leave your message: if it is unticket, you will hear the prompt: The phone you dial is unavailable noew. By default it is ticked."
                />

                {/* ── Greeting Options ── */}
                <SectionHeading title="Greeting Options" />

                <GridRow>
                <Tooltip
  title="Select the greeting that will be played when the extension is busy. The default setting is Default."
  {...tooltipProps}
>
  <label style={{ ...labelStyle, cursor: "help" }}>
    Busy Prompt
  </label>
</Tooltip>  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <select value={form.busy_prompt} onChange={(e) => set("busy_prompt", e.target.value)} style={inputStyle} {...fieldInteraction}>
                      <option value="default">Default</option>
                    </select>
                  </div>
                </GridRow>

                <GridRow>
                <Tooltip
  title="Select the greeting that will be played when the extension is unavailable. The default setting is Default."
  {...tooltipProps}
>
  <label style={{ ...labelStyle, cursor: "help" }}>
    No answer Prompt
  </label>
</Tooltip>  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <select value={form.noanswer_prompt} onChange={(e) => set("noanswer_prompt", e.target.value)} style={inputStyle} {...fieldInteraction}>
                      <option value="default">Default</option>
                    </select>
                  </div>
                </GridRow>

                {/* ── PlayBack Options ── */}
                <SectionHeading title="PlayBack Options" />

                <CheckboxRow
                  checked={form.announce_callerid}
                  onChange={(val) => set("announce_callerid", val)}
                  label="Announce Message Caller ID"
                  tooltip="If this option is ticked, the extension number of the caller who left the message will be announced before the content of this message. By default it is unticket."
                />

                <CheckboxRow
                  checked={form.announce_duration}
                  onChange={(val) => set("announce_duration", val)}
                  label="Announce Message Duration"
                  tooltip="If this option is ticked, you will hear the duration of the message when the message is played back."
                />

                <CheckboxRow
                  checked={form.announce_arrival_time}
                  onChange={(val) => set("announce_arrival_time", val)}
                  label="Announce Message Arrival Time"
                  tooltip="If this option is ticked, you will hear the arrival time of the message when the message is played back."
                />

              </div>
            )}
          </div>

          {!loading && (
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 12, width: "100%", padding: "10px 20px", borderTop: `1px solid ${C.cardBorder}`, boxSizing: "border-box" }}>
              <Btn
                variant="primary"
                onClick={handleSave}
                disabled={saving}
                style={{ minWidth: 110, height: 34, fontSize: 13, padding: "0 28px" }}
              >
                {saving ? (
                  <><CircularProgress size={14} color="inherit" /> Saving...</>
                ) : "Save"}
              </Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoicemailPage;
