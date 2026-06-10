import React, { useState } from "react";
import { Alert, TextField } from "@mui/material";
import { TONE_GENERATOR_INITIAL_FORM } from "../../../sections/advanced/constants/ToneGeneratorConstants";
import {
  Btn,
  C,
  muiTextFieldSx,
  AdvancedBreadcrumb,
  AdvancedPageShell,
  advancedTableContainerStyle,
  advancedBlueBarStyle,
  advancedFormInlineFooterStyle,
  advancedFormBtnStyle,
} from "../../../shared/fxsSharedUi";

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
    <AdvancedPageShell>
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
      <AdvancedBreadcrumb current="Tone Generator" />

      <div style={advancedTableContainerStyle}>
        <div style={advancedBlueBarStyle}>
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

        <div style={advancedFormInlineFooterStyle}>
          <Btn
            variant="primary"
            onClick={handleSave}
            style={advancedFormBtnStyle}
          >
            Save
          </Btn>
          <Btn
            variant="cancel"
            onClick={() => setFormData(TONE_GENERATOR_INITIAL_FORM)}
            style={advancedFormBtnStyle}
          >
            Reset
          </Btn>
        </div>
      </div>
    </AdvancedPageShell>
  );
};

export default ToneGeneratorPage;
