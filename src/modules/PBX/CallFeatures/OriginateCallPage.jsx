import React, { useState } from "react";
import {
  Button,
  TextField,
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

// ── Color palette (CDR / PBX Admin Theme) ───────────────────────────────────
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#e2e8f0",

  labelText: "#64748b",
  valueText: "#0f172a",
  mutedText: "#94a3b8",

  accent: "#2563eb",

  successGreen: "#22c55e",
  errorRed: "#ef4444",

  purple: "#8b5cf6",
};

// ─────────────────────────────────────────────────────────────────────────────

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
    <div
      style={{
        backgroundColor: C.pageBg,
        minHeight: "calc(100vh - 80px)",
        padding: 16,
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Error / Success Banner */}
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={{
              position: "fixed",
              top: 20,
              right: 20,
              zIndex: 9999,
              minWidth: 300,
              boxShadow: 3,
            }}
          >
            {message.text}
          </Alert>
        )}

        {/* Breadcrumb */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 11, color: C.mutedText }}>
            PBX &rsaquo; Call Features &rsaquo;{" "}
            <span style={{ color: "#01060c", fontWeight: 600 }}>
              Originate Call
            </span>
          </div>
        </div>

        {/* Main Card */}
        <div
          style={{
            background: C.cardBg,
            border: `1px solid ${C.cardBorder}`,
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "12px 16px",
              borderBottom: `1px solid ${C.cardBorder}`,
              background: "#ffffff",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 700,
                color: "#475569",
              }}
            >
              AMI Originate
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#475569",
                  marginLeft: 8,
                }}
              >
                (POST /api/ami — type: ami_originate)
              </span>
            </h2>
          </div>

          {/* Form Content */}
          <div style={{ padding: 24 }}>
            {/* Top-to-Bottom 2-Column Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px 48px",
              }}
            >
              {/* ── LEFT COLUMN (Basic Info) ── */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <label
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: C.labelText,
                      width: 140,
                      flexShrink: 0,
                    }}
                  >
                    Dial Extension <span style={{ color: C.errorRed }}>*</span>
                  </label>
                  <TextField
                    size="small"
                    fullWidth
                    value={extension}
                    onChange={(e) => setExtension(e.target.value)}
                    placeholder="e.g. 1004"
                    inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <label
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: C.labelText,
                      width: 140,
                      flexShrink: 0,
                    }}
                  >
                    Name (label only)
                  </label>
                  <TextField
                    size="small"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Optional — not sent to API"
                    inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <label
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: C.labelText,
                      width: 140,
                      flexShrink: 0,
                    }}
                  >
                    Caller ID Name
                  </label>
                  <TextField
                    size="small"
                    fullWidth
                    value={callerIdName}
                    onChange={(e) => setCallerIdName(e.target.value)}
                    placeholder="e.g. Front Desk"
                    inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <label
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: C.labelText,
                      width: 140,
                      flexShrink: 0,
                    }}
                  >
                    Caller ID Number
                  </label>
                  <TextField
                    size="small"
                    fullWidth
                    value={callerIdNumber}
                    onChange={(e) => setCallerIdNumber(e.target.value)}
                    placeholder="e.g. 1000"
                    inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
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
                      fontSize: 13,
                      fontWeight: 600,
                      color: C.labelText,
                      width: 100,
                      flexShrink: 0,
                      marginTop: 4,
                    }}
                  >
                    Mode <span style={{ color: C.errorRed }}>*</span>
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

                {/* Conditional Fields based on Mode */}
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
                            color: C.accent,
                            "&.Mui-checked": { color: C.accent },
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
                          <label
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: C.labelText,
                              width: 120,
                              flexShrink: 0,
                            }}
                          >
                            Application{" "}
                            <span style={{ color: C.errorRed }}>*</span>
                          </label>
                          <TextField
                            size="small"
                            fullWidth
                            value={application}
                            onChange={(e) => setApplication(e.target.value)}
                            placeholder="Wait"
                            inputProps={{
                              style: { fontSize: 13, padding: "6px 8px" },
                            }}
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
                        <label
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: C.labelText,
                            width: 120,
                            flexShrink: 0,
                          }}
                        >
                          {useFixedApp ? "App Data (s)" : "Application Data"}
                        </label>
                        <TextField
                          size="small"
                          fullWidth
                          value={appData}
                          onChange={(e) => setAppData(e.target.value)}
                          placeholder={useFixedApp ? "30" : "1"}
                          inputProps={{
                            style: { fontSize: 13, padding: "6px 8px" },
                          }}
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
                        <label
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: C.labelText,
                            width: 120,
                            flexShrink: 0,
                          }}
                        >
                          Context <span style={{ color: C.errorRed }}>*</span>
                        </label>
                        <FormControl size="small" fullWidth>
                          <MuiSelect
                            value={context}
                            onChange={(e) => setContext(e.target.value)}
                            sx={{ fontSize: 13, background: "#fff" }}
                          >
                            {CONTEXT_OPTIONS.map((ctx) => (
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
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <label
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: C.labelText,
                            width: 120,
                            flexShrink: 0,
                          }}
                        >
                          Exten (B leg){" "}
                          <span style={{ color: C.errorRed }}>*</span>
                        </label>
                        <TextField
                          size="small"
                          fullWidth
                          value={exten}
                          onChange={(e) => setExten(e.target.value)}
                          placeholder="e.g. 1005"
                          inputProps={{
                            style: {
                              fontSize: 13,
                              padding: "6px 8px",
                              background: "#fff",
                            },
                          }}
                        />
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <label
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: C.labelText,
                            width: 120,
                            flexShrink: 0,
                          }}
                        >
                          Priority
                        </label>
                        <TextField
                          size="small"
                          fullWidth
                          type="number"
                          value={priority}
                          onChange={(e) => setPriority(e.target.value)}
                          placeholder="1"
                          inputProps={{
                            style: {
                              fontSize: 13,
                              padding: "6px 8px",
                              background: "#fff",
                            },
                          }}
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
                marginTop: 24,
                textAlign: "center",
              }}
            >
              Bearer JWT is sent automatically when logged in. Simple mode sends
              application + appData only (no context/exten). Two-step sends
              context, exten, and priority.
            </p>
          </div>

          {/* Footer Action */}
          <div
            style={{
              padding: "16px 24px",
              background: "#f",
              borderTop: `1px solid ${C.cardBorder}`,
              display: "flex",
              justifyContent: "center",
            }}
          >
           <Button
  variant="contained"
  disabled={loading}
  onClick={handleOriginate}
  startIcon={
    loading && <CircularProgress size={16} color="inherit" />
  }
  sx={{
    padding: "8px 28px",
    fontSize: 13,
    background:
      "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
    color: "#fff",
    border: "1px solid #5A6F8F",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    fontWeight: 600,
    textTransform: "none",
    minWidth: 160,
    borderRadius: 1.5,

    "&:hover": {
      background:
        "linear-gradient(to bottom, #647A9B 0%, #4A6284 60%, #344A67 100%)",
    },

    "&:disabled": {
      background: "#cbd5e1",
      color: "#64748b",
      border: "1px solid #cbd5e1",
    },
  }}
>
  {loading ? "Sending…" : "Originate Call"}
</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OriginateCallPage;
