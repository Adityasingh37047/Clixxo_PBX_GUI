import React, { useState } from "react";
import {
  Alert,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select as MuiSelect,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import {
  ORIGINATE_CALL_CONTEXT_OPTIONS,
  ORIGINATE_CALL_DEFAULT_APP_DATA,
  ORIGINATE_CALL_DEFAULT_APPLICATION,
  ORIGINATE_CALL_DEFAULT_CONTEXT,
  ORIGINATE_CALL_DEFAULT_MODE,
  ORIGINATE_CALL_DEFAULT_PRIORITY,
  ORIGINATE_CALL_FIELD_TOOLTIPS,
  ORIGINATE_CALL_FORM_NOTE,
  ORIGINATE_CALL_MODE_OPTIONS,
  ORIGINATE_CALL_TITLE,
} from "../../../constants/OriginateCallConstants";
import {
  Btn,
  ExtensionBreadcrumb as OriginateCallBreadcrumb,
  extensionFixedAlertSx as originateCallFixedAlertSx,
  extensionPageWrapStyle as originateCallPageWrapStyle,
  extensionPageInnerStyle as originateCallPageInnerStyle,
  extensionCardStyle as originateCallCardStyle,
} from "../../../components/common";

const ORIGINATE_CALL_COMPACT_MQ = "(max-width: 768px)";

// Agar amiOriginate apiService me defined hai to isko uncomment kar lena:
// import { amiOriginate } from "../api/apiService";

// ── Color Palette ─────────────────────────────────────────────────────────────
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  divider: "#e2e6ec",
  labelText: "#3E5475",
  valueText: "#0f172a",
  mutedText: "#6b7280",
  strongText: "#0f172a",
  accent: "#3E5475",
  amber: "#dc2626",
  errorRed: "#dc2626",
  successGreen: "#16a34a",
  placeholderText: "#94a3b8",
};

const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";
const FOCUS_RING_SHADOW = "0 0 0 2px rgba(62, 84, 117, 0.15)";

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
    if (document.activeElement === e.target) setFieldFocus(e.target);
    else setFieldHover(e.target);
  },
  onMouseLeave: (e) => {
    if (document.activeElement === e.target) setFieldFocus(e.target);
    else setFieldDefault(e.target);
  },
};

// ── Local page UI ──

const ORIGINATE_CALL_CARD_RADIUS = 10;

const originateCallFormContentStyle = {
  width: "100%",
  maxWidth: 640,
  margin: "0 auto",
  boxSizing: "border-box",
};

const originateCallFormRowStyle = {
  display: "flex",
  flexDirection: "row",
  alignItems: "flex-start",
  width: "100%",
};

const originateCallLabelColStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: C.labelText,
  flex: "0 0 48%",
  maxWidth: "48%",
  paddingRight: 24,
  textAlign: "left",
  lineHeight: 1.35,
};

const originateCallValueColStyle = {
  flex: "1 1 52%",
  minWidth: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
};

const originateCallControlSlotStyle = {
  width: 220,
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
};

const originateCallControlSlotWideStyle = {
  ...originateCallControlSlotStyle,
  width: 280,
};

const originateCallHeaderStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: ORIGINATE_CALL_CARD_RADIUS,
  borderTopRightRadius: ORIGINATE_CALL_CARD_RADIUS,
  display: "flex",
  alignItems: "center",
  padding: "7px 14px",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  borderBottom: `1px solid ${C.divider}`,
};

const ORIGINATE_CALL_FIELD_HEIGHT = 36;

const originateCallFormInputStyle = {
  padding: "7px 10px",
  borderRadius: 6,
  border: `1px solid ${OUTLINED_BORDER}`,
  fontSize: 13,
  width: "100%",
  backgroundColor: "#ffffff",
  outline: "none",
  color: C.valueText,
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
  boxShadow: "none",
  height: ORIGINATE_CALL_FIELD_HEIGHT,
  minHeight: ORIGINATE_CALL_FIELD_HEIGHT,
  lineHeight: 1.35,
};

const originateCallFormInputInteraction = {
  onFocus: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onFocus(e);
  },
  onBlur: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onBlur(e);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onMouseEnter(e);
  },
  onMouseLeave: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onMouseLeave(e);
  },
};

const originateCallOutlinedInputRootSx = {
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

const originateCallFormSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  width: "100%",
  minHeight: ORIGINATE_CALL_FIELD_HEIGHT,
  height: ORIGINATE_CALL_FIELD_HEIGHT,
  ...originateCallOutlinedInputRootSx,
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    padding: "7px 32px 7px 10px !important",
    lineHeight: 1.35,
    boxSizing: "border-box",
    fontSize: 13,
    backgroundColor: "#fff",
  },
};

const originateCallFormNoteStyle = {
  fontSize: 12,
  color: C.mutedText,
  margin: "0 auto 16px",
  padding: "0 32px",
  textAlign: "center",
  width: "100%",
  maxWidth: "100%",
  lineHeight: 1.5,
  boxSizing: "border-box",
};

const pageFooterBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
  minWidth: 100,
};

const originateCallFormFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "100%",
  padding: "10px 28px",
  borderTop: `1px solid ${C.divider}`,
  background: "#f8fafc",
  boxSizing: "border-box",
  borderBottomLeftRadius: ORIGINATE_CALL_CARD_RADIUS,
  borderBottomRightRadius: ORIGINATE_CALL_CARD_RADIUS,
};

const originateCallFormBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 4,
  minWidth: 100,
};

const originateCallFormCheckboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const originateCallRadioSx = {
  p: 0.5,
  color: C.labelText,
  "&.Mui-checked": { color: C.accent },
};

const ORIGINATE_CALL_TOOLTIP_PROPS = {
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

const originateCallFieldInputStyle = {
  ...originateCallFormInputStyle,
  width: "100%",
  maxWidth: "100%",
};

/** Builds callerid string for AMI: "Name" <number> or number only */
function buildCallerId(name, number) {
  const n = (number || "").trim();
  const nm = (name || "").trim();
  if (nm && n) return `"${nm}" <${n}>`;
  if (n) return n;
  if (nm) return nm;
  return undefined;
}

const OriginateCallFieldRow = ({
  label,
  tooltipKey,
  required = false,
  children,
  align = "center",
  wide = false,
  hideLabel = false,
}) => (
  <div
    style={{
      ...originateCallFormRowStyle,
      alignItems: align === "flex-start" ? "flex-start" : "center",
    }}
  >
    {hideLabel ? (
      <span style={originateCallLabelColStyle} aria-hidden="true" />
    ) : (
      <Tooltip
        title={ORIGINATE_CALL_FIELD_TOOLTIPS[tooltipKey] || ""}
        {...ORIGINATE_CALL_TOOLTIP_PROPS}
      >
        <label
          style={{
            ...originateCallLabelColStyle,
            cursor: tooltipKey ? "help" : "default",
          }}
        >
          {label}
          {required ? <span style={{ color: C.amber }}> *</span> : null}
        </label>
      </Tooltip>
    )}
    <div style={originateCallValueColStyle}>
      <div
        style={
          wide
            ? originateCallControlSlotWideStyle
            : originateCallControlSlotStyle
        }
      >
        {children}
      </div>
    </div>
  </div>
);

const OriginateCallPage = () => {
  const isCompact = useMediaQuery(ORIGINATE_CALL_COMPACT_MQ);
  const [mode, setMode] = useState(ORIGINATE_CALL_DEFAULT_MODE);

  const [extension, setExtension] = useState("");
  const [name, setName] = useState("");
  const [callerIdName, setCallerIdName] = useState("");
  const [callerIdNumber, setCallerIdNumber] = useState("");

  const [useFixedApp, setUseFixedApp] = useState(true);
  const [application, setApplication] = useState(
    ORIGINATE_CALL_DEFAULT_APPLICATION,
  );
  const [appData, setAppData] = useState(ORIGINATE_CALL_DEFAULT_APP_DATA);

  const [context, setContext] = useState(ORIGINATE_CALL_DEFAULT_CONTEXT);
  const [exten, setExten] = useState("");
  const [priority, setPriority] = useState(ORIGINATE_CALL_DEFAULT_PRIORITY);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleOriginate = async () => {
    const ext = extension.trim();
    if (!ext) {
      showMessage("error", "Call / Dial this extension is required.");
      return;
    }

    const callerid = buildCallerId(callerIdName, callerIdNumber);
    let data = { extension: ext };
    if (callerid) data.callerid = callerid;

    if (mode === "simple") {
      if (useFixedApp) {
        data.application = "Wait";
        data.appData = appData.trim() || "30";
      } else {
        const app = application.trim();
        if (!app) {
          showMessage(
            "error",
            "Application is required for Simple mode when not using fixed Wait.",
          );
          return;
        }
        data.application = app;
        if (appData.trim()) data.appData = appData.trim();
      }
    } else {
      const ctx = context.trim();
      const ex = exten.trim();
      if (!ctx || !ex) {
        showMessage(
          "error",
          "Context and Extension/Exten are required for two-step mode.",
        );
        return;
      }
      data.context = ctx;
      data.exten = ex;
      const pri = parseInt(priority, 10);
      data.priority = Number.isFinite(pri) && pri >= 0 ? pri : 1;
    }

    setLoading(true);
    try {
      if (typeof amiOriginate === "undefined") {
        throw new Error(
          "amiOriginate function is not imported or defined. Please check apiService.",
        );
      }

      // eslint-disable-next-line no-undef
      const res = await amiOriginate(data);
      if (res?.response === false) {
        showMessage("error", res?.message || "Originate failed.");
      } else {
        showMessage("success", res?.message || "Originate sent successfully.");
      }
    } catch (err) {
      showMessage("error", err?.message || String(err) || "Originate failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        ...originateCallPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={originateCallPageInnerStyle}>
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={originateCallFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <OriginateCallBreadcrumb
          section="Call Features"
          current={ORIGINATE_CALL_TITLE}
        />

        <div style={originateCallCardStyle}>
          <div style={originateCallHeaderStyle}>
            <span>
              AMI Originate
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: C.mutedText,
                  marginLeft: 8,
                }}
              >
                (POST /api/ami — type: ami_originate)
              </span>
            </span>
          </div>

          <div style={{ padding: "24px 32px 0", boxSizing: "border-box" }}>
            <div style={originateCallFormContentStyle}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  paddingBottom: 16,
                }}
              >
                <OriginateCallFieldRow
                  label="Dial Extension"
                  tooltipKey="extension"
                  required
                >
                  <input
                    type="text"
                    value={extension}
                    onChange={(e) => setExtension(e.target.value)}
                    placeholder="e.g. 1004"
                    style={originateCallFieldInputStyle}
                    {...originateCallFormInputInteraction}
                  />
                </OriginateCallFieldRow>

                <OriginateCallFieldRow label="Name (label only)" tooltipKey="name">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Optional — not sent to API"
                    style={originateCallFieldInputStyle}
                    {...originateCallFormInputInteraction}
                  />
                </OriginateCallFieldRow>

                <OriginateCallFieldRow
                  label="Caller ID Name"
                  tooltipKey="callerIdName"
                >
                  <input
                    type="text"
                    value={callerIdName}
                    onChange={(e) => setCallerIdName(e.target.value)}
                    placeholder="e.g. Front Desk"
                    style={originateCallFieldInputStyle}
                    {...originateCallFormInputInteraction}
                  />
                </OriginateCallFieldRow>

                <OriginateCallFieldRow
                  label="Caller ID Number"
                  tooltipKey="callerIdNumber"
                >
                  <input
                    type="text"
                    value={callerIdNumber}
                    onChange={(e) => setCallerIdNumber(e.target.value)}
                    placeholder="e.g. 1000"
                    style={originateCallFieldInputStyle}
                    {...originateCallFormInputInteraction}
                  />
                </OriginateCallFieldRow>

                <OriginateCallFieldRow
                  label="Mode"
                  tooltipKey="mode"
                  required
                  align="flex-start"
                >
                  <RadioGroup
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                  >
                    {ORIGINATE_CALL_MODE_OPTIONS.map((opt) => (
                      <FormControlLabel
                        key={opt.value}
                        value={opt.value}
                        control={
                          <Radio size="small" sx={originateCallRadioSx} />
                        }
                        label={
                          <span style={{ fontSize: 13 }}>{opt.label}</span>
                        }
                        sx={{ m: 0 }}
                      />
                    ))}
                  </RadioGroup>
                </OriginateCallFieldRow>

                {mode === "simple" ? (
                  <>
                    <OriginateCallFieldRow hideLabel>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          width: "100%",
                        }}
                      >
                        <Checkbox
                          id="fixedApp"
                          checked={useFixedApp}
                          onChange={(e) => setUseFixedApp(e.target.checked)}
                          size="small"
                          sx={originateCallFormCheckboxSx}
                        />
                        <Tooltip
                          title={
                            ORIGINATE_CALL_FIELD_TOOLTIPS.useFixedApp || ""
                          }
                          {...ORIGINATE_CALL_TOOLTIP_PROPS}
                        >
                          <label
                            htmlFor="fixedApp"
                            style={{
                              fontSize: 13,
                              color: C.labelText,
                              cursor: "help",
                              fontWeight: 500,
                            }}
                          >
                            Use fixed Application Wait + appData below
                            (recommended)
                          </label>
                        </Tooltip>
                      </div>
                    </OriginateCallFieldRow>

                    {!useFixedApp && (
                      <OriginateCallFieldRow
                        label="Application"
                        tooltipKey="application"
                        required
                      >
                        <input
                          type="text"
                          value={application}
                          onChange={(e) => setApplication(e.target.value)}
                          placeholder="Wait"
                          style={originateCallFieldInputStyle}
                          {...originateCallFormInputInteraction}
                        />
                      </OriginateCallFieldRow>
                    )}

                    <OriginateCallFieldRow
                      label={useFixedApp ? "App Data (s)" : "Application Data"}
                      tooltipKey="appData"
                    >
                      <input
                        type="text"
                        value={appData}
                        onChange={(e) => setAppData(e.target.value)}
                        placeholder={useFixedApp ? "30" : "1"}
                        style={originateCallFieldInputStyle}
                        {...originateCallFormInputInteraction}
                      />
                    </OriginateCallFieldRow>
                  </>
                ) : (
                  <>
                    <OriginateCallFieldRow
                      label="Context"
                      tooltipKey="context"
                      required
                    >
                      <FormControl size="small" fullWidth>
                        <MuiSelect
                          value={context}
                          onChange={(e) => setContext(e.target.value)}
                          variant="outlined"
                          fullWidth
                          sx={originateCallFormSelectSx}
                        >
                          {ORIGINATE_CALL_CONTEXT_OPTIONS.map((ctx) => (
                            <MenuItem
                              key={ctx}
                              value={ctx}
                              sx={{ fontSize: 13 }}
                            >
                              {ctx}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </OriginateCallFieldRow>

                    <OriginateCallFieldRow
                      label="Exten (B leg)"
                      tooltipKey="exten"
                      required
                    >
                      <input
                        type="text"
                        value={exten}
                        onChange={(e) => setExten(e.target.value)}
                        placeholder="e.g. 1005"
                        style={originateCallFieldInputStyle}
                        {...originateCallFormInputInteraction}
                      />
                    </OriginateCallFieldRow>

                    <OriginateCallFieldRow label="Priority" tooltipKey="priority">
                      <input
                        type="number"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        placeholder="1"
                        style={originateCallFieldInputStyle}
                        {...originateCallFormInputInteraction}
                      />
                    </OriginateCallFieldRow>
                  </>
                )}
              </div>
            </div>

            <p style={originateCallFormNoteStyle}>{ORIGINATE_CALL_FORM_NOTE}</p>
          </div>

          <div style={originateCallFormFooterStyle}>
            <Btn
              variant="primary"
              disabled={loading}
              onClick={handleOriginate}
              style={originateCallFormBtnStyle}
            >
              {loading ? (
                <>
                  <CircularProgress size={14} color="inherit" />
                  Sending…
                </>
              ) : (
                "Originate Call"
              )}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OriginateCallPage;
