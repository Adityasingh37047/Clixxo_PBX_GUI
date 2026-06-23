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
  useMediaQuery,
} from "@mui/material";

const PBX_COMPACT_MQ = "(max-width: 768px)";

const C = {
  cardBorder: "var(--border-strong)",
  labelText: "var(--text-primary)",
  mutedText: "var(--text-muted)",
  accent: "var(--accent-brand)",
  amber: "#dc2626",
};

const OUTLINED_BORDER = "var(--border-subtle)";
const OUTLINED_HOVER = "var(--border-strong)";
const OUTLINED_FOCUS = "var(--status-primary)";
const ORIGINATE_CALL_FIELD_WIDTH = 200;
const ORIGINATE_CALL_FIELD_HEIGHT = 32;

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

const ORIGINATE_CALL_INPUT_INTERACTION = {
  onFocus: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    setFieldFocus(e.target);
  },
  onBlur: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    setFieldDefault(e.target);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    if (document.activeElement === e.target) setFieldFocus(e.target);
    else setFieldHover(e.target);
  },
  onMouseLeave: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    if (document.activeElement === e.target) setFieldFocus(e.target);
    else setFieldDefault(e.target);
  },
};

const ORIGINATE_CALL_INPUT_STYLE = {
  width: ORIGINATE_CALL_FIELD_WIDTH,
  maxWidth: ORIGINATE_CALL_FIELD_WIDTH,
  height: ORIGINATE_CALL_FIELD_HEIGHT,
  minHeight: ORIGINATE_CALL_FIELD_HEIGHT,
  padding: "0 12px",
  lineHeight: `${ORIGINATE_CALL_FIELD_HEIGHT - 2}px`,
  borderRadius: 6,
  border: `1px solid ${OUTLINED_BORDER}`,
  fontSize: 12,
  textAlign: "left",
  backgroundColor: "var(--bg-surface)",
  outline: "none",
  color: "var(--text-primary)",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
  boxShadow: "none",
};

const ORIGINATE_CALL_FIELD_INPUT_STYLE = {
  ...ORIGINATE_CALL_INPUT_STYLE,
  width: "100%",
  maxWidth: "100%",
};

const ORIGINATE_CALL_MUI_SELECT_SX = {
  fontSize: 12,
  width: ORIGINATE_CALL_FIELD_WIDTH,
  maxWidth: ORIGINATE_CALL_FIELD_WIDTH,
  backgroundColor: "var(--bg-surface)",
  borderRadius: "6px",
  "& .MuiOutlinedInput-root": {
    height: ORIGINATE_CALL_FIELD_HEIGHT,
    minHeight: ORIGINATE_CALL_FIELD_HEIGHT,
    backgroundColor: "var(--bg-surface)",
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
    lineHeight: `${ORIGINATE_CALL_FIELD_HEIGHT - 2}px`,
    height: "100%",
    minHeight: "unset !important",
    textAlign: "left",
    display: "flex",
    alignItems: "center",
    boxSizing: "border-box",
  },
};

const ORIGINATE_CALL_FIELD_SELECT_SX = {
  ...ORIGINATE_CALL_MUI_SELECT_SX,
  width: "100%",
  maxWidth: "100%",
};

const BTN_BASE =
  "inline-flex items-center justify-center gap-[6px] h-[30px] px-[14px] py-[6px] rounded-[10px] text-[12px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border disabled:cursor-not-allowed disabled:opacity-60";
const BTN_PRIMARY = `${BTN_BASE} text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)]`;

const ORIGINATE_CALL_PAGE_WRAP =
  "bg-[var(--bg-main)] min-h-[calc(100vh-80px)] p-[16px] box-border";
const ORIGINATE_CALL_PAGE_INNER = "w-full max-w-full mx-auto";
const ORIGINATE_CALL_FORM_CONTENT =
  "w-full max-w-[640px] mx-auto box-border";
const ORIGINATE_CALL_FORM_CARD =
  "overflow-hidden rounded-[10px] border-[1.5px] border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-[0_10px_30px_rgba(15,23,42,0.06)]";
const ORIGINATE_CALL_FORM_HEADER =
  "flex min-h-[44px] w-full items-center border-b border-[var(--border-strong)] bg-[var(--bg-surface)] px-[14px] py-[7px] text-[13px] font-bold text-[var(--text-label)] rounded-t-[10px]";
const ORIGINATE_CALL_FORM_FOOTER =
  "flex w-full flex-wrap items-center justify-center gap-[12px] border-t border-[var(--border-strong)] box-border px-[20px] py-[10px]";
const ORIGINATE_CALL_FORM_BTN =
  "min-w-[110px] h-[34px] m-0 px-[28px] text-[13px] leading-[34px] box-border";

const PbxBreadcrumb = ({ section, current, className = "" }) => (
  <div
    className={`mb-[16px] flex flex-wrap items-center gap-[4px] text-[12px] font-normal text-[#94a3b8] ${className}`.trim()}
  >
    <span>PBX</span>
    <span>&gt;</span>
    <span>{section}</span>
    <span>&gt;</span>
    <span className="font-semibold text-[#1e293b]">{current}</span>
  </div>
);

const radioSx = {
  p: 0.5,
  color: C.accent,
  "&.Mui-checked": { color: C.accent },
};

const checkboxSx = {
  padding: "1px",
  color: "var(--text-primary)",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

// Agar amiOriginate apiService me defined hai to isko uncomment kar lena:
// import { amiOriginate } from "../api/apiService";

const CONTEXT_OPTIONS = [
  "siproute",
  "outbound-mobile",
  "from-internal",
  "default",
];

function buildCallerId(name, number) {
  const n = (number || "").trim();
  const nm = (name || "").trim();
  if (nm && n) return `"${nm}" <${n}>`;
  if (n) return n;
  if (nm) return nm;
  return undefined;
}

const FormFieldRow = ({
  label,
  required = false,
  children,
  align = "center",
  wide = false,
  hideLabel = false,
}) => (
  <div
    className={`flex w-full flex-row ${
      align === "flex-start" ? "items-start" : "items-center"
    }`}
  >
    {hideLabel ? (
      <span
        className="flex-[0_0_48%] max-w-[48%] pr-[24px] text-left text-[13px] font-semibold leading-[1.35] text-[var(--text-label)]"
        aria-hidden="true"
      />
    ) : (
      <label className="flex-[0_0_48%] max-w-[48%] pr-[24px] text-left text-[13px] font-semibold leading-[1.35] text-[var(--text-label)]">
        {label}
        {required ? <span style={{ color: C.amber }}> *</span> : null}
      </label>
    )}
    <div className="flex min-w-0 flex-1 items-center justify-end">
      <div
        className={`flex shrink-0 items-center justify-start ${
          wide ? "w-[280px]" : "w-[220px]"
        }`}
      >
        {children}
      </div>
    </div>
  </div>
);

const OriginateCallPage = () => {
  const isCompact = useMediaQuery(PBX_COMPACT_MQ);
  const [mode, setMode] = useState("simple");

  const [extension, setExtension] = useState("");
  const [name, setName] = useState("");
  const [callerIdName, setCallerIdName] = useState("");
  const [callerIdNumber, setCallerIdNumber] = useState("");

  const [useFixedApp, setUseFixedApp] = useState(true);
  const [application, setApplication] = useState("Wait");
  const [appData, setAppData] = useState("30");

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
      className={`${ORIGINATE_CALL_PAGE_WRAP} ${isCompact ? "p-[8px]" : ""}`.trim()}
    >
      <div className={ORIGINATE_CALL_PAGE_INNER}>
        {message.text && (
          <div className="fixed top-[20px] right-[20px] z-[9999] min-w-[300px] max-w-[420px]">
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

        <div className={ORIGINATE_CALL_FORM_CARD}>
          <div className={ORIGINATE_CALL_FORM_HEADER}>
            <span>
              AMI Originate
              <span className="ml-[8px] text-[12px] font-medium text-[#94a3b8]">
                (POST /api/ami — type: ami_originate)
              </span>
            </span>
          </div>

          <div className="box-border px-[32px] pt-[24px] pb-0">
            <div className={ORIGINATE_CALL_FORM_CONTENT}>
              <div className="flex flex-col gap-[12px] pb-[16px]">
                <FormFieldRow label="Dial Extension" required>
                  <input
                    type="text"
                    value={extension}
                    onChange={(e) => setExtension(e.target.value)}
                    placeholder="e.g. 1004"
                    style={ORIGINATE_CALL_FIELD_INPUT_STYLE}
                    {...ORIGINATE_CALL_INPUT_INTERACTION}
                  />
                </FormFieldRow>

                <FormFieldRow label="Name (label only)">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Optional — not sent to API"
                    style={ORIGINATE_CALL_FIELD_INPUT_STYLE}
                    {...ORIGINATE_CALL_INPUT_INTERACTION}
                  />
                </FormFieldRow>

                <FormFieldRow label="Caller ID Name">
                  <input
                    type="text"
                    value={callerIdName}
                    onChange={(e) => setCallerIdName(e.target.value)}
                    placeholder="e.g. Front Desk"
                    style={ORIGINATE_CALL_FIELD_INPUT_STYLE}
                    {...ORIGINATE_CALL_INPUT_INTERACTION}
                  />
                </FormFieldRow>

                <FormFieldRow label="Caller ID Number">
                  <input
                    type="text"
                    value={callerIdNumber}
                    onChange={(e) => setCallerIdNumber(e.target.value)}
                    placeholder="e.g. 1000"
                    style={ORIGINATE_CALL_FIELD_INPUT_STYLE}
                    {...ORIGINATE_CALL_INPUT_INTERACTION}
                  />
                </FormFieldRow>

                <FormFieldRow label="Mode" required align="flex-start">
                  <RadioGroup
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                  >
                    <FormControlLabel
                      value="simple"
                      control={<Radio size="small" sx={radioSx} />}
                      label={
                        <span className="text-[13px]">
                          Simple (application — no context/exten)
                        </span>
                      }
                      sx={{ m: 0 }}
                    />
                    <FormControlLabel
                      value="twostep"
                      control={<Radio size="small" sx={radioSx} />}
                      label={
                        <span className="text-[13px]">
                          Two-step (context + exten after A answers)
                        </span>
                      }
                      sx={{ m: 0 }}
                    />
                  </RadioGroup>
                </FormFieldRow>

                {mode === "simple" ? (
                  <>
                    <FormFieldRow hideLabel>
                      <div className="flex w-full items-center gap-[8px]">
                        <Checkbox
                          id="fixedApp"
                          checked={useFixedApp}
                          onChange={(e) => setUseFixedApp(e.target.checked)}
                          size="small"
                          sx={checkboxSx}
                        />
                        <label
                          htmlFor="fixedApp"
                          className="cursor-pointer text-[13px] font-medium text-[var(--text-label)]"
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
                          style={ORIGINATE_CALL_FIELD_INPUT_STYLE}
                          {...ORIGINATE_CALL_INPUT_INTERACTION}
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
                        style={ORIGINATE_CALL_FIELD_INPUT_STYLE}
                        {...ORIGINATE_CALL_INPUT_INTERACTION}
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
                          sx={ORIGINATE_CALL_FIELD_SELECT_SX}
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
                        style={ORIGINATE_CALL_FIELD_INPUT_STYLE}
                        {...ORIGINATE_CALL_INPUT_INTERACTION}
                      />
                    </FormFieldRow>

                    <FormFieldRow label="Priority">
                      <input
                        type="number"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        placeholder="1"
                        style={ORIGINATE_CALL_FIELD_INPUT_STYLE}
                        {...ORIGINATE_CALL_INPUT_INTERACTION}
                      />
                    </FormFieldRow>
                  </>
                )}
              </div>

              <p className="mt-[8px] mb-[16px] whitespace-nowrap text-center text-[12px] text-[#94a3b8]">
                Bearer JWT is sent automatically when logged in. Simple mode
                sends application + appData only (no context/exten). Two-step
                sends context, exten, and priority.
              </p>
            </div>
          </div>

          <div className={ORIGINATE_CALL_FORM_FOOTER}>
            <button
              type="button"
              disabled={loading}
              onClick={handleOriginate}
              className={`${BTN_PRIMARY} ${ORIGINATE_CALL_FORM_BTN}`.trim()}
            >
              {loading ? (
                <>
                  <CircularProgress size={14} color="inherit" />
                  Sending…
                </>
              ) : (
                "Originate Call"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OriginateCallPage;
