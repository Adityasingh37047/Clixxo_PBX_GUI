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
import {
  C,
  Btn,
  sipPcmFormPageWrapStyle,
  sipPcmFormPageInnerStyle,
  sipPcmFormCardStyle,
  sipPcmFormHeaderStyle,
  sipPcmAuthFormFooterStyle,
  sipPcmAuthFormBtnStyle,
  sipPcmFormLabelStyle,
  sipPcmAuthInputStyle,
  sipPcmAuthInputInteraction,
  sipPcmAuthMuiSelectSx,
  PbxBreadcrumb,
} from "../../../sections/sip/sipPcmSharedUi";

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

const COL_LABEL_STYLE = {
  ...sipPcmFormLabelStyle,
  width: 140,
};

const RIGHT_COL_LABEL_STYLE = {
  ...sipPcmFormLabelStyle,
  width: 120,
};

const FULL_WIDTH_INPUT_STYLE = {
  ...sipPcmAuthInputStyle,
  width: "100%",
  maxWidth: "100%",
};

const FULL_WIDTH_SELECT_SX = {
  ...sipPcmAuthMuiSelectSx,
  width: "100%",
  maxWidth: "100%",
};

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

          <div style={{ padding: "16px 24px 0", boxSizing: "border-box" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px 48px",
                paddingBottom: 16,
              }}
            >
              {/* ── LEFT COLUMN (Basic Info) ── */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <label style={COL_LABEL_STYLE}>
                    Dial Extension <span style={{ color: C.amber }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={extension}
                    onChange={(e) => setExtension(e.target.value)}
                    placeholder="e.g. 1004"
                    style={FULL_WIDTH_INPUT_STYLE}
                    {...sipPcmAuthInputInteraction}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <label style={COL_LABEL_STYLE}>Name (label only)</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Optional — not sent to API"
                    style={FULL_WIDTH_INPUT_STYLE}
                    {...sipPcmAuthInputInteraction}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <label style={COL_LABEL_STYLE}>Caller ID Name</label>
                  <input
                    type="text"
                    value={callerIdName}
                    onChange={(e) => setCallerIdName(e.target.value)}
                    placeholder="e.g. Front Desk"
                    style={FULL_WIDTH_INPUT_STYLE}
                    {...sipPcmAuthInputInteraction}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <label style={COL_LABEL_STYLE}>Caller ID Number</label>
                  <input
                    type="text"
                    value={callerIdNumber}
                    onChange={(e) => setCallerIdNumber(e.target.value)}
                    placeholder="e.g. 1000"
                    style={FULL_WIDTH_INPUT_STYLE}
                    {...sipPcmAuthInputInteraction}
                  />
                </div>
              </div>

              {/* ── RIGHT COLUMN (Mode & Routing) ── */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div
                  style={{ display: "flex", alignItems: "flex-start", gap: 12 }}
                >
                  <label
                    style={{
                      ...RIGHT_COL_LABEL_STYLE,
                      width: 100,
                      marginTop: 4,
                    }}
                  >
                    Mode <span style={{ color: C.amber }}>*</span>
                  </label>
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
                </div>

                <div
                  style={{
                    borderRadius: 6,
                    padding: 12,
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                  }}
                >
                  {mode === "simple" ? (
                    <>
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

                      {!useFixedApp && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <label style={RIGHT_COL_LABEL_STYLE}>
                            Application{" "}
                            <span style={{ color: C.amber }}>*</span>
                          </label>
                          <input
                            type="text"
                            value={application}
                            onChange={(e) => setApplication(e.target.value)}
                            placeholder="Wait"
                            style={FULL_WIDTH_INPUT_STYLE}
                            {...sipPcmAuthInputInteraction}
                          />
                        </div>
                      )}

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <label style={RIGHT_COL_LABEL_STYLE}>
                          {useFixedApp ? "App Data (s)" : "Application Data"}
                        </label>
                        <input
                          type="text"
                          value={appData}
                          onChange={(e) => setAppData(e.target.value)}
                          placeholder={useFixedApp ? "30" : "1"}
                          style={FULL_WIDTH_INPUT_STYLE}
                          {...sipPcmAuthInputInteraction}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <label style={RIGHT_COL_LABEL_STYLE}>
                          Context <span style={{ color: C.amber }}>*</span>
                        </label>
                        <FormControl size="small" fullWidth>
                          <MuiSelect
                            value={context}
                            onChange={(e) => setContext(e.target.value)}
                            variant="outlined"
                            fullWidth
                            sx={FULL_WIDTH_SELECT_SX}
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
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <label style={RIGHT_COL_LABEL_STYLE}>
                          Exten (B leg){" "}
                          <span style={{ color: C.amber }}>*</span>
                        </label>
                        <input
                          type="text"
                          value={exten}
                          onChange={(e) => setExten(e.target.value)}
                          placeholder="e.g. 1005"
                          style={FULL_WIDTH_INPUT_STYLE}
                          {...sipPcmAuthInputInteraction}
                        />
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <label style={RIGHT_COL_LABEL_STYLE}>Priority</label>
                        <input
                          type="number"
                          value={priority}
                          onChange={(e) => setPriority(e.target.value)}
                          placeholder="1"
                          style={FULL_WIDTH_INPUT_STYLE}
                          {...sipPcmAuthInputInteraction}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <p
              style={{
                fontSize: 12,
                color: C.mutedText,
                marginTop: 8,
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              Bearer JWT is sent automatically when logged in. Simple mode sends
              application + appData only (no context/exten). Two-step sends
              context, exten, and priority.
            </p>
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
