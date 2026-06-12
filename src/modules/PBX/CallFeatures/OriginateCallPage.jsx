import React, { useState } from "react";
import {
  CircularProgress,
  FormControl,
  Select as MuiSelect,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Alert,
} from "@mui/material";
// ── Local page UI (pilot: inlined from pbxSharedUi / sipPcmSharedUi) ──
const OUTLINED_BORDER = "rgba(0, 0, 0, 0.23)";
const OUTLINED_HOVER = "rgba(0, 0, 0, 0.87)";
const OUTLINED_FOCUS = "#1976d2";

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
  el.style.boxShadow = `0 0 0 1px ${OUTLINED_FOCUS}`;
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

const muiSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  "& .MuiOutlinedInput-root": {
    minHeight: 36,
    backgroundColor: "#fff",
  },
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    padding: "7px 32px 7px 10px !important",
    lineHeight: 1.35,
    boxSizing: "border-box",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: 2,
  },
};

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

const CARD_RADIUS = 20;

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
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

const pbxPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const pbxPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const PbxBreadcrumb = ({ section, current, style }) => (
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
      ...style,
    }}
  >
    <span>PBX</span>
    <span>&gt;</span>
    <span>{section}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>{current}</span>
  </div>
);
const sipPcmFormPageWrapStyle = {
  ...pbxPageWrapStyle,
};

const sipPcmFormPageInnerStyle = {
  ...pbxPageInnerStyle,
};

const sipPcmFormContentStyle = {
  width: "100%",
  maxWidth: 640,
  margin: "0 auto",
  boxSizing: "border-box",
};

const originateFormRowStyle = {
  display: "flex",
  flexDirection: "row",
  alignItems: "flex-start",
  width: "100%",
};

const originateLabelColStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: C.labelText,
  flex: "0 0 48%",
  maxWidth: "48%",
  paddingRight: 24,
  textAlign: "left",
  lineHeight: 1.35,
};

const originateValueColStyle = {
  flex: "1 1 52%",
  minWidth: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
};

const originateControlSlotStyle = {
  width: 220,
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
};

const originateControlSlotWideStyle = {
  ...originateControlSlotStyle,
  width: 280,
};

const sipPcmFormCardStyle = {
  background: "#ffffff",
  borderRadius: 10,
  overflow: "hidden",
  border: `1.5px solid ${C.cardBorder}`,
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
};

const sipPcmFormHeaderStyle = {
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
  borderBottom: `1px solid ${C.cardBorder}`,
};

const SIP_PCM_AUTH_FIELD_WIDTH = 200;
const SIP_PCM_FORM_FIELD_HEIGHT = 32;

const sipPcmFormLabelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: C.labelText,
  textAlign: "left",
  width: 320,
  marginRight: 10,
  lineHeight: 1.4,
  flexShrink: 0,
  whiteSpace: "nowrap",
};

const systemToolsFieldInputStyleSmall = {
  padding: "6px 12px",
  borderRadius: 6,
  border: `1px solid ${OUTLINED_BORDER}`,
  fontSize: 12,
  width: "100%",
  backgroundColor: "#f8fafc",
  outline: "none",
  color: "#3E5475",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
  boxShadow: "none",
};

const sipPcmAuthInputStyle = {
  ...systemToolsFieldInputStyleSmall,
  width: SIP_PCM_AUTH_FIELD_WIDTH,
  maxWidth: SIP_PCM_AUTH_FIELD_WIDTH,
  height: SIP_PCM_FORM_FIELD_HEIGHT,
  minHeight: SIP_PCM_FORM_FIELD_HEIGHT,
  padding: "0 12px",
  lineHeight: `${SIP_PCM_FORM_FIELD_HEIGHT - 2}px`,
  textAlign: "left",
  backgroundColor: "#ffffff",
};

const sipPcmAuthInputInteraction = {
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

const sipPcmAuthMuiSelectSx = {
  ...muiSelectSx,
  fontSize: 12,
  width: SIP_PCM_AUTH_FIELD_WIDTH,
  maxWidth: SIP_PCM_AUTH_FIELD_WIDTH,
  backgroundColor: "#ffffff",
  borderRadius: "6px",
  "& .MuiOutlinedInput-root": {
    height: SIP_PCM_FORM_FIELD_HEIGHT,
    minHeight: SIP_PCM_FORM_FIELD_HEIGHT,
    backgroundColor: "#ffffff",
    transition: "border-color 0.2s ease",
    "& fieldset": {
      borderColor: OUTLINED_BORDER,
      transition: "border-color 0.2s ease",
    },
    "&:hover fieldset": { borderColor: OUTLINED_HOVER },
    "&.Mui-focused fieldset": {
      borderColor: OUTLINED_FOCUS,
      borderWidth: 2,
    },
    "&.Mui-focused:hover fieldset": {
      borderColor: OUTLINED_FOCUS,
      borderWidth: 2,
    },
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: 2,
  },
  "& .MuiSelect-select": {
    padding: "0 32px 0 12px !important",
    fontSize: 12,
    lineHeight: `${SIP_PCM_FORM_FIELD_HEIGHT - 2}px`,
    height: "100%",
    minHeight: "unset !important",
    textAlign: "left",
    display: "flex",
    alignItems: "center",
    boxSizing: "border-box",
  },
};

const sipPcmAuthFormFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "100%",
  padding: "10px 20px",
  borderTop: `1px solid ${C.cardBorder}`,
  boxSizing: "border-box",
};

const sipPcmAuthFormBtnStyle = {
  minWidth: 110,
  height: 34,
  fontSize: 13,
  margin: 0,
  padding: "0 28px",
  lineHeight: "34px",
  boxSizing: "border-box",
};

// Agar amiOriginate apiService me defined hai to isko uncomment kar lena:
// import { amiOriginate } from "../api/apiService";

/** Dialplan contexts for two-step originate */
const CONTEXT_OPTIONS = [
  "siproute",
  "outbound-mobile",
  "from-internal",
  "default",
];

/** Builds callerid string for AMI: "Name" <number> or number only */
function buildCallerId(name, number) {
  const n = (number || "").trim();
  const nm = (name || "").trim();
  if (nm && n) return `"${nm}" <${n}>`;
  if (n) return n;
  if (nm) return nm;
  return undefined;
}

const FIELD_INPUT_STYLE = {
  ...sipPcmAuthInputStyle,
  width: "100%",
  maxWidth: "100%",
};

const FIELD_SELECT_SX = {
  ...sipPcmAuthMuiSelectSx,
  width: "100%",
  maxWidth: "100%",
};

const FormFieldRow = ({
  label,
  required = false,
  children,
  align = "center",
  wide = false,
  hideLabel = false,
}) => (
  <div
    style={{
      ...originateFormRowStyle,
      alignItems: align === "flex-start" ? "flex-start" : "center",
    }}
  >
    {hideLabel ? (
      <span style={originateLabelColStyle} aria-hidden="true" />
    ) : (
      <label style={originateLabelColStyle}>
        {label}
        {required ? <span style={{ color: C.amber }}> *</span> : null}
      </label>
    )}
    <div style={originateValueColStyle}>
      <div
        style={wide ? originateControlSlotWideStyle : originateControlSlotStyle}
      >
        {children}
      </div>
    </div>
  </div>
);

const OriginateCallPage = () => {
  const [mode, setMode] = useState("simple"); // 'simple' | 'twostep'

  // Left Column States
  const [extension, setExtension] = useState("");
  const [name, setName] = useState("");
  const [callerIdName, setCallerIdName] = useState("");
  const [callerIdNumber, setCallerIdNumber] = useState("");

  // Right Column States (Simple Mode)
  const [useFixedApp, setUseFixedApp] = useState(true);
  const [application, setApplication] = useState("Wait");
  const [appData, setAppData] = useState("30");

  // Right Column States (Two-step Mode)
  const [context, setContext] = useState("siproute");
  const [exten, setExten] = useState("");
  const [priority, setPriority] = useState("1");

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
      // Dummy check if amiOriginate is not imported
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
    <div style={sipPcmFormPageWrapStyle}>
      <div style={sipPcmFormPageInnerStyle}>
        {message.text && (
          <div
            style={{
              position: "fixed",
              top: 20,
              right: 20,
              zIndex: 9999,
              minWidth: 300,
              maxWidth: 420,
            }}
          >
            <Alert
              severity={message.type}
              onClose={() => setMessage({ type: "", text: "" })}
              sx={{ boxShadow: 3 }}
            >
              {message.text}
            </Alert>
          </div>
        )}

        <PbxBreadcrumb section="Call Features" current="Originate Call" />

        <div style={sipPcmFormCardStyle}>
          <div style={sipPcmFormHeaderStyle}>
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
            <div style={sipPcmFormContentStyle}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  paddingBottom: 16,
                }}
              >
                <FormFieldRow label="Dial Extension" required>
                  <input
                    type="text"
                    value={extension}
                    onChange={(e) => setExtension(e.target.value)}
                    placeholder="e.g. 1004"
                    style={FIELD_INPUT_STYLE}
                    {...sipPcmAuthInputInteraction}
                  />
                </FormFieldRow>

                <FormFieldRow label="Name (label only)">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Optional — not sent to API"
                    style={FIELD_INPUT_STYLE}
                    {...sipPcmAuthInputInteraction}
                  />
                </FormFieldRow>

                <FormFieldRow label="Caller ID Name">
                  <input
                    type="text"
                    value={callerIdName}
                    onChange={(e) => setCallerIdName(e.target.value)}
                    placeholder="e.g. Front Desk"
                    style={FIELD_INPUT_STYLE}
                    {...sipPcmAuthInputInteraction}
                  />
                </FormFieldRow>

                <FormFieldRow label="Caller ID Number">
                  <input
                    type="text"
                    value={callerIdNumber}
                    onChange={(e) => setCallerIdNumber(e.target.value)}
                    placeholder="e.g. 1000"
                    style={FIELD_INPUT_STYLE}
                    {...sipPcmAuthInputInteraction}
                  />
                </FormFieldRow>

                <FormFieldRow label="Mode" required align="flex-start" wide>
                  <RadioGroup
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                  >
                    <FormControlLabel
                      value="simple"
                      control={
                        <Radio
                          size="small"
                          sx={{
                            p: 0.5,
                            color: C.accent,
                            "&.Mui-checked": { color: C.accent },
                          }}
                        />
                      }
                      label={
                        <span style={{ fontSize: 13 }}>
                          Simple (application — no context/exten)
                        </span>
                      }
                      sx={{ m: 0 }}
                    />
                    <FormControlLabel
                      value="twostep"
                      control={
                        <Radio
                          size="small"
                          sx={{
                            p: 0.5,
                            color: C.accent,
                            "&.Mui-checked": { color: C.accent },
                          }}
                        />
                      }
                      label={
                        <span style={{ fontSize: 13 }}>
                          Two-step (context + exten after A answers)
                        </span>
                      }
                      sx={{ m: 0 }}
                    />
                  </RadioGroup>
                </FormFieldRow>

                {mode === "simple" ? (
                  <>
                    <FormFieldRow hideLabel wide>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <Checkbox
                          id="fixedApp"
                          checked={useFixedApp}
                          onChange={(e) => setUseFixedApp(e.target.checked)}
                          size="small"
                          sx={{
                            p: 0,
                            color: "#64748b",
                            "&.Mui-checked": { color: "#0284c7" },
                            "&.MuiCheckbox-indeterminate": {
                              color: "#0284c7",
                            },
                          }}
                        />
                        <label
                          htmlFor="fixedApp"
                          style={{
                            fontSize: 13,
                            color: C.labelText,
                            cursor: "pointer",
                            fontWeight: 500,
                          }}
                        >
                          Use fixed Application Wait + appData below
                          (recommended)
                        </label>
                      </div>
                    </FormFieldRow>

                    {!useFixedApp && (
                      <FormFieldRow label="Application" required>
                        <input
                          type="text"
                          value={application}
                          onChange={(e) => setApplication(e.target.value)}
                          placeholder="Wait"
                          style={FIELD_INPUT_STYLE}
                          {...sipPcmAuthInputInteraction}
                        />
                      </FormFieldRow>
                    )}

                    <FormFieldRow
                      label={useFixedApp ? "App Data (s)" : "Application Data"}
                    >
                      <input
                        type="text"
                        value={appData}
                        onChange={(e) => setAppData(e.target.value)}
                        placeholder={useFixedApp ? "30" : "1"}
                        style={FIELD_INPUT_STYLE}
                        {...sipPcmAuthInputInteraction}
                      />
                    </FormFieldRow>
                  </>
                ) : (
                  <>
                    <FormFieldRow label="Context" required>
                      <FormControl size="small" fullWidth>
                        <MuiSelect
                          value={context}
                          onChange={(e) => setContext(e.target.value)}
                          variant="outlined"
                          fullWidth
                          sx={FIELD_SELECT_SX}
                        >
                          {CONTEXT_OPTIONS.map((ctx) => (
                            <MenuItem
                              key={ctx}
                              value={ctx}
                              sx={{ fontSize: 12 }}
                            >
                              {ctx}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FormFieldRow>

                    <FormFieldRow label="Exten (B leg)" required>
                      <input
                        type="text"
                        value={exten}
                        onChange={(e) => setExten(e.target.value)}
                        placeholder="e.g. 1005"
                        style={FIELD_INPUT_STYLE}
                        {...sipPcmAuthInputInteraction}
                      />
                    </FormFieldRow>

                    <FormFieldRow label="Priority">
                      <input
                        type="number"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        placeholder="1"
                        style={FIELD_INPUT_STYLE}
                        {...sipPcmAuthInputInteraction}
                      />
                    </FormFieldRow>
                  </>
                )}
              </div>

              <p
                style={{
                  fontSize: 12,
                  color: C.mutedText,
                  marginTop: 8,
                  marginBottom: 16,
                  textAlign: "center",
                  whiteSpace: "nowrap",
                }}
              >
                Bearer JWT is sent automatically when logged in. Simple mode
                sends application + appData only (no context/exten). Two-step
                sends context, exten, and priority.
              </p>
            </div>
          </div>

          <div style={sipPcmAuthFormFooterStyle}>
            <Btn
              variant="primary"
              disabled={loading}
              onClick={handleOriginate}
              style={sipPcmAuthFormBtnStyle}
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
