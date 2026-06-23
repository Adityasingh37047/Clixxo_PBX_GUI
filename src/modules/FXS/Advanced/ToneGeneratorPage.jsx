import React, { useState } from "react";
import { Alert, TextField } from "@mui/material";
import { TONE_GENERATOR_INITIAL_FORM } from "../../../constants/ToneGeneratorConstants";

// ── Local page UI (inlined from fxsSharedUi) ──
const C = {
  cardBg: "var(--bg-surface)",
  labelText: "var(--text-primary)",
  strongText: "var(--text-primary)",
};

const TONE_GENERATOR_PAGE_WRAP =
  "bg-[var(--bg-main)] min-h-[calc(100vh-80px)] p-[16px] box-border flex flex-col items-center";
const TONE_GENERATOR_PAGE_INNER = "w-full max-w-[1000px] mx-auto";
const TONE_GENERATOR_TABLE_CONTAINER =
  "w-full max-w-full mx-auto overflow-hidden rounded-[10px] border-[1.5px] border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-[0_4px_20px_rgba(15,23,42,0.06)] mb-[24px]";
const TONE_GENERATOR_BLUE_BAR =
  "flex w-full min-h-[44px] flex-wrap items-center justify-start gap-[12px] rounded-t-[10px] border-b border-[var(--border-strong)] bg-[var(--bg-surface)] px-[14px] py-[7px] text-[13px] font-bold text-[var(--text-label)]";
const TONE_GENERATOR_FORM_FOOTER =
  "flex flex-wrap items-center justify-center gap-[12px] w-[calc(100%+40px)] -ml-[20px] -mr-[20px] mt-0 mb-0 border-t border-[var(--border-strong)] box-border px-[20px] py-[10px]";

const BTN_FORM_PRIMARY =
  "inline-flex items-center justify-center box-border m-0 min-w-[110px] h-[34px] gap-[6px] px-[28px] py-0 rounded-[10px] text-[13px] font-semibold leading-[34px] whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)] disabled:cursor-not-allowed disabled:opacity-60";

const BTN_FORM_CANCEL =
  "inline-flex items-center justify-center box-border m-0 min-w-[110px] h-[34px] gap-[6px] px-[28px] py-0 rounded-[10px] text-[13px] font-semibold leading-[34px] whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border bg-[#cbd5e1] text-[#374151] border-[#cbd5e1] shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-[#b6c2d3] disabled:cursor-not-allowed disabled:opacity-60";

const Btn = ({ children, onClick, disabled, variant = "formPrimary", type }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={variant === "formCancel" ? BTN_FORM_CANCEL : BTN_FORM_PRIMARY}
  >
    {children}
  </button>
);

const OUTLINED_BORDER = "var(--border-subtle)";
const OUTLINED_HOVER = "var(--border-strong)";
const OUTLINED_FOCUS = "var(--status-primary)";

const muiTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "var(--bg-surface)",
    "& fieldset": {
      borderColor: OUTLINED_BORDER,
      transition: "border-color 0.2s ease",
    },
    "&:hover fieldset": {
      borderColor: OUTLINED_HOVER,
    },
    "&.Mui-focused fieldset": {
      borderColor: OUTLINED_FOCUS,
      borderWidth: 2,
    },
    "&.Mui-focused:hover fieldset": {
      borderColor: OUTLINED_FOCUS,
      borderWidth: 2,
    },
  },
};

const ToneGeneratorBreadcrumb = ({ current }) => (
  <div className="mb-[16px] flex flex-wrap items-center gap-[4px] text-[12px] font-normal text-[#94a3b8]">
    <span>FXS</span>
    <span>&gt;</span>
    <span>Advanced</span>
    <span>&gt;</span>
    <span className="font-semibold text-[#1e293b]">{current}</span>
  </div>
);

const ToneGeneratorPageShell = ({ children, fullWidth = false }) => (
  <div className={TONE_GENERATOR_PAGE_WRAP}>
    <div
      className={fullWidth ? "w-full max-w-full mx-auto" : TONE_GENERATOR_PAGE_INNER}
    >
      {children}
    </div>
  </div>
);

const checkPara = (value) => {
  const numTest = /^[1234567890]*$/;
  const linepara = value.split(",");
  let highvalue = 0;

  for (let i = 0; i < linepara.length; i++) {
    if (linepara[i] === "") return false;
    const parapart = linepara[i].split("/");
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

    const paraadd = parapart[0].split("+");
    if (i === 0 && paraadd.length === 1 && paraadd[0] === "0") return false;

    if (paraadd.length === 1) {
      if (
        !numTest.test(paraadd[0]) ||
        (!(parseInt(paraadd[0], 10) >= 200 && parseInt(paraadd[0], 10) <= 3500) &&
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
          !(parseInt(paraadd[j], 10) >= 200 && parseInt(paraadd[j], 10) <= 3500)
        ) {
          return false;
        }
      }
    }
    if (paraadd.length > 2) return false;
  }
  return true;
};

const helpBlocks = [
  {
    title: "350+440/0",
    text: "Continuously play a dual tone which is composed of 350HZ and 440HZ.Note: The value range of the frequency is 200~3500HZ.",
  },
  {
    title: "480+620/500,0/500",
    text: "Repeatedly play a dual tone which is composed of 480HZ and 620HZ in the method of 500ms play with 500ms pause. Note: 0/500 denotes 500ms silence and the tone cannot start with the silence.",
  },
  {
    title: "950/333,1400/333,1800/333,0/1000",
    text: "Repeatedly play tones in turn: first a 333ms 950HZ tone, followed by a 333ms 1400HZ tone, then a 333ms 1800HZ tone and at last a 1s silence.Note: The count of signals at ON state in a period cannot be greater than 4.",
  },
];

const labelStyle = {
  fontSize: 14,
  fontWeight: 600,
  color: C.labelText,
  width: 110,
  marginRight: 12,
  flexShrink: 0,
  whiteSpace: "nowrap",
};

const ToneFieldRow = ({ label, id, value, onChange, onKeyPress }) => (
  <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
    <label htmlFor={id} style={labelStyle}>
      {label}
    </label>
    <TextField
      id={id}
      fullWidth
      size="small"
      value={value}
      onChange={onChange}
      onKeyPress={onKeyPress}
      variant="outlined"
      sx={{
        ...muiTextFieldSx,
        flex: 1,
        "& .MuiOutlinedInput-root": {
          ...muiTextFieldSx["& .MuiOutlinedInput-root"],
          borderRadius: "6px",
        },
      }}
      inputProps={{
        maxLength: 63,
        style: { fontSize: 14, padding: "6px 10px" },
      }}
    />
  </div>
);

const ToneGeneratorPage = () => {
  const [formData, setFormData] = useState(TONE_GENERATOR_INITIAL_FORM);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const alert = (msg) => {
    const isSuccess = /successfully/i.test(String(msg));
    showToast(msg, isSuccess ? "success" : "error");
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
      document.getElementById("dialTone")?.focus();
      return;
    }
    if (!checkPara(formData.ringbackTone)) {
      alert("Invalid Parameters of Ringback Tone Transmitter!");
      document.getElementById("ringbackTone")?.focus();
      return;
    }
    if (!checkPara(formData.busyTone)) {
      alert("Invalid Parameters of Busy Tone Transmitter!");
      document.getElementById("busyTone")?.focus();
      return;
    }
    alert("Settings saved successfully!");
  };

  return (
    <ToneGeneratorPageShell>
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
      <ToneGeneratorBreadcrumb current="Tone Generator" />

      <div className={TONE_GENERATOR_TABLE_CONTAINER}>
        <div className={TONE_GENERATOR_BLUE_BAR}>
          <span>Tone Generator</span>
        </div>

        <div style={{ padding: "16px 20px 0", background: C.cardBg }}>
          <div
            style={{
              display: "flex",
              alignItems: "stretch",
              minHeight: 400,
              width: "100%",
            }}
          >
            {/* Left — tone parameters */}
            <div style={{ width: "45%", paddingTop: 16, paddingRight: 8 }}>
              <div style={{ height: 24 }} />
              <ToneFieldRow
                label="Dial Tone"
                id="dialTone"
                value={formData.dialTone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, dialTone: e.target.value }))
                }
                onKeyPress={handleKeyPress}
              />
              <div style={{ height: 24 }} />
              <ToneFieldRow
                label="Ringback Tone"
                id="ringbackTone"
                value={formData.ringbackTone}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    ringbackTone: e.target.value,
                  }))
                }
                onKeyPress={handleKeyPress}
              />
              <div style={{ height: 24 }} />
              <ToneFieldRow
                label="Busy Tone"
                id="busyTone"
                value={formData.busyTone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, busyTone: e.target.value }))
                }
                onKeyPress={handleKeyPress}
              />
            </div>

            {/* Center divider */}
            <div
              style={{
                width: 6,
                flexShrink: 0,
                backgroundColor: "#d1d5db",
                borderRadius: 2,
                margin: "8px 12px",
              }}
              aria-hidden
            />

            {/* Right — format help */}
            <div style={{ width: "54%", paddingTop: 16, paddingLeft: 4 }}>
              <div style={{ marginLeft: "2%", width: "96%" }}>
                {helpBlocks.map((block, idx) => (
                  <div key={block.title}>
                    {idx > 0 && <div style={{ height: 16 }} />}
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: C.strongText,
                        margin: "0 0 8px",
                      }}
                    >
                      {block.title}
                    </p>
                    <p
                      style={{
                        fontSize: 13,
                        color: "#64748b",
                        lineHeight: 1.6,
                        margin: "0 0 16px",
                      }}
                    >
                      {block.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={TONE_GENERATOR_FORM_FOOTER}>
          <Btn type="button" onClick={handleSave} variant="formPrimary">
            Save
          </Btn>
          <Btn
            type="button"
            onClick={() => setFormData(TONE_GENERATOR_INITIAL_FORM)}
            variant="formCancel"
          >
            Reset
          </Btn>
        </div>
      </div>
    </ToneGeneratorPageShell>
  );
};

export default ToneGeneratorPage;
