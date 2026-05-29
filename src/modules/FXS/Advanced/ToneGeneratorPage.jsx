import React, { useState } from "react";
import { TONE_GENERATOR_INITIAL_FORM } from "../../../sections/advanced/constants/ToneGeneratorConstants";
import { Button, TextField } from "@mui/material";

// ── Color Palette (Matched from Reference) ──────────────────────────────────
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#e2e8f0",

  labelText: "#64748b",
  valueText: "#0f172a",
  mutedText: "#94a3b8",

  accent: "#2e2f31",

  successGreen: "#22c55e",
  errorRed: "#ef4444",

  purple: "#8b5cf6",
};

// ── Shared UI Layout Components (Matched from Reference) ────────────────────
const FieldRow = ({ label, children }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      minHeight: 32,
      marginBottom: 16,
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
      {label}
    </label>
    <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
  </div>
);

const SectionHeading = ({ title }) => (
  <div style={{ margin: "24px 0 16px 0", position: "relative" }}>
    <div style={{ borderTop: `1px solid ${C.cardBorder}` }} />
    <span
      style={{
        position: "absolute",
        top: -10,
        left: 0,
        background: "#fff",
        paddingRight: 8,
        fontSize: 13,
        fontWeight: 600,
        color: C.mutedText,
      }}
    >
      {title}
    </span>
  </div>
);

const ToneGeneratorPage = () => {
  const [formData, setFormData] = useState(TONE_GENERATOR_INITIAL_FORM);

  // ── Functionality (UNTOUCHED) ─────────────────────────────────────────────
  const checkPara = (value) => {
    const numTest = /^[1234567890]*$/;
    const linepara = value.split(",");
    const totallinenum = linepara.length;
    let parapart;
    let paraadd;
    let highvalue = 0;

    for (let i = 0; i < totallinenum; i++) {
      if (linepara[i] === "") return false;
      parapart = linepara[i].split("/");
      if (
        parapart.length !== 2 ||
        parapart[0] === "" ||
        parapart[1] === "" ||
        !numTest.test(parapart[1])
      ) {
        return false;
      }
      if (parapart[0] !== "0") highvalue++;
      if (highvalue > 4) return false;
      paraadd = parapart[0].split("+");
      if (i === 0 && paraadd.length === 1 && paraadd[0] === "0") return false;
      if (paraadd.length === 1) {
        if (
          !numTest.test(paraadd[0]) ||
          (!(parseInt(paraadd[0]) >= 200 && parseInt(paraadd[0]) <= 3500) &&
            paraadd[0] !== "0")
        ) {
          return false;
        }
      }
      if (paraadd.length === 2) {
        for (let j = 0; j < paraadd.length; j++) {
          if (
            !numTest.test(paraadd[j]) ||
            paraadd[j] === "0" ||
            !(parseInt(paraadd[j]) >= 200 && parseInt(paraadd[j]) <= 3500)
          ) {
            return false;
          }
        }
      }
      if (paraadd.length > 2) return false;
    }
    return true;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleKeyPress = (e) => {
    const key = e.keyCode || e.which;
    if (!((key >= 47 && key <= 57) || key === 43 || key === 44 || key === 8)) {
      e.preventDefault();
    }
  };

  const handleSave = () => {
    if (!checkPara(formData.dialTone)) {
      alert("Invalid Parameters of Dial Tone Transmitter!");
      document.getElementById("dialTone").focus();
      return;
    }
    if (!checkPara(formData.ringbackTone)) {
      alert("Invalid Parameters of Ringback Tone Transmitter!");
      document.getElementById("ringbackTone").focus();
      return;
    }
    if (!checkPara(formData.busyTone)) {
      alert("Invalid Parameters of Busy Tone Transmitter!");
      document.getElementById("busyTone").focus();
      return;
    }
    alert("Settings saved successfully!");
  };

  const handleReset = () => {
    setFormData(TONE_GENERATOR_INITIAL_FORM);
  };

  // ── Redesigned UI ─────────────────────────────────────────────────────────
  return (
    <div
      style={{
        backgroundColor: C.pageBg,
        minHeight: "calc(100vh - 80px)",
        padding: 16,
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1024px", margin: "0 auto" }}>
        {/* Breadcrumb style Title */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: C.mutedText }}>
            FXS &rsaquo; Advanced &rsaquo;{" "}
            <span style={{ color: C.valueText, fontWeight: 600 }}>
              Tone Generator
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
          <div style={{ padding: "24px 28px" }}>
            <div
              style={{
                display: "flex",
                gap: "40px",
                flexWrap: "wrap",
              }}
            >
              {/* Left Column: Form Fields */}
              <div style={{ flex: "1 1 400px" }}>
                <SectionHeading title="Tone Generator" />

                <FieldRow label="Dial Tone">
                  <TextField
                    id="dialTone"
                    value={formData.dialTone}
                    onChange={(e) =>
                      handleInputChange("dialTone", e.target.value)
                    }
                    onKeyPress={handleKeyPress}
                    size="small"
                    fullWidth
                    inputProps={{
                      maxLength: 63,
                      style: { fontSize: 13, padding: "6px 8px" },
                    }}
                  />
                </FieldRow>

                <FieldRow label="Ringback Tone">
                  <TextField
                    id="ringbackTone"
                    value={formData.ringbackTone}
                    onChange={(e) =>
                      handleInputChange("ringbackTone", e.target.value)
                    }
                    onKeyPress={handleKeyPress}
                    size="small"
                    fullWidth
                    inputProps={{
                      maxLength: 63,
                      style: { fontSize: 13, padding: "6px 8px" },
                    }}
                  />
                </FieldRow>

                <FieldRow label="Busy Tone">
                  <TextField
                    id="busyTone"
                    value={formData.busyTone}
                    onChange={(e) =>
                      handleInputChange("busyTone", e.target.value)
                    }
                    onKeyPress={handleKeyPress}
                    size="small"
                    fullWidth
                    inputProps={{
                      maxLength: 63,
                      style: { fontSize: 13, padding: "6px 8px" },
                    }}
                  />
                </FieldRow>
              </div>

              {/* Right Column: Documentation/Examples */}
              <div
                style={{
                  flex: "1 1 300px",
                  borderLeft: `1px solid ${C.pageBg}`,
                  paddingLeft: "40px",
                }}
              >
                <SectionHeading title="Parameter Examples" />

                <div style={{ marginBottom: 20 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: C.valueText,
                      marginBottom: 4,
                    }}
                  >
                    350+440/0
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#64748b",
                      lineHeight: "1.5",
                    }}
                  >
                    Continuously play a dual tone which is composed of 350HZ and
                    440HZ.Note: The value range of the frequency is 200~3500HZ.
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: C.valueText,
                      marginBottom: 4,
                    }}
                  >
                    480+620/500,0/500
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#64748b",
                      lineHeight: "1.5",
                    }}
                  >
                    Repeatedly play a dual tone which is composed of 480HZ and
                    620HZ in the method of 500ms play with 500ms pause. Note:
                    0/500 denotes 500ms silence and the tone cannot start with
                    the silence.
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: C.valueText,
                      marginBottom: 4,
                    }}
                  >
                    950/333,1400/333,1800/333,0/1000
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#64748b",
                      lineHeight: "1.5",
                    }}
                  >
                    Repeatedly play tones in turn: first a 333ms 950HZ tone,
                    followed by a 333ms 1400HZ tone, then a 333ms 1800HZ tone
                    and at last a 1s silence.Note: The count of signals at ON
                    state in a period cannot be greater than 4.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions Footer (Matched from Reference) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              padding: "16px 24px",
              borderTop: `1px solid ${C.cardBorder}`,
              background: "#f8fafc",
            }}
          >
           <Button
  variant="contained"
  onClick={handleSave}
  sx={{
    background:
      "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
    color: "#fff",
    border: "1px solid #5A6F8F",
    boxShadow: "0 2px 8px #3E5475",

    fontWeight: 600,
    fontSize: 13,
    textTransform: "none",

    height: 36,
    padding: "0 28px",
    borderRadius: "6px",

    "&:hover": {
      background:
        "linear-gradient(to bottom, #647A9B 0%, #4A6284 60%, #344A67 100%)",
      opacity: 0.85,
    },

    "&:disabled": {
      background: "#94a3b8",
      color: "#e2e8f0",
      border: "1px solid #94a3b8",
    },
  }}
>
  Save
</Button>
        <Button
  variant="outlined"
  onClick={handleReset}
  sx={{
    height: 36,
    padding: "0 18px",
    fontSize: 13,
    textTransform: "none",

    background: "#cbd5e1",
    color: "#374151",
    border: "1px solid #cbd5e1",
    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",

    "&:hover": {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
    },

    "&:disabled": {
      background: "#e2e8f0",
      color: "#94a3b8",
      border: "1px solid #e2e8f0",
    },
  }}
>
  Reset
</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToneGeneratorPage;
