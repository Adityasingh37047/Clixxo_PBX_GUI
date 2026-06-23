import React, { useState } from "react";
import { DTMF_INITIAL_FORM } from "../../../constants/DtmfConstants";
import { Alert, Checkbox, TextField } from "@mui/material";

// ── Local page UI (inlined from fxsSharedUi) ──
const C = {
  cardBorder: "var(--border-strong)",
  labelText: "var(--text-primary)",
  valueText: "var(--text-primary)",
  amber: "#dc2626",
};

const DTMF_PAGE_WRAP =
  "bg-[var(--bg-main)] min-h-[calc(100vh-80px)] p-[16px] box-border flex flex-col items-center";
const DTMF_PAGE_INNER = "w-full max-w-[1000px] mx-auto";
const DTMF_TABLE_CONTAINER =
  "w-full max-w-full mx-auto mb-[24px] overflow-hidden rounded-[10px] border-[1.5px] border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-[0_4px_20px_rgba(15,23,42,0.06)]";
const DTMF_BLUE_BAR =
  "flex w-full min-h-[44px] flex-wrap items-center justify-start gap-[12px] rounded-t-[10px] border-b border-[var(--border-strong)] bg-[var(--bg-surface)] px-[14px] py-[7px] text-[13px] font-bold text-[var(--text-label)]";
const DTMF_FORM_BODY = "px-[20px] pt-[12px]";
const DTMF_FORM_FOOTER =
  "flex w-full flex-wrap items-center justify-center gap-[12px] w-[calc(100%+40px)] -mx-[20px] border-t border-[var(--border-strong)] box-border px-[20px] py-[10px]";

const BTN_FORM_PRIMARY =
  "inline-flex items-center justify-center box-border m-0 min-w-[110px] h-[34px] gap-[6px] px-[28px] py-0 rounded-[10px] text-[13px] font-semibold leading-[34px] whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)] disabled:cursor-not-allowed disabled:opacity-60";
const BTN_FORM_CANCEL =
  "inline-flex items-center justify-center box-border m-0 min-w-[110px] h-[34px] gap-[6px] px-[28px] py-0 rounded-[10px] text-[13px] font-semibold leading-[34px] whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border bg-[#cbd5e1] text-[#374151] border-[#cbd5e1] shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-[#b6c2d3] disabled:cursor-not-allowed disabled:opacity-60";

const btnVariantCls = {
  formPrimary: BTN_FORM_PRIMARY,
  formCancel: BTN_FORM_CANCEL,
};

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "formPrimary",
  type,
  className = "",
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`${btnVariantCls[variant] || BTN_FORM_PRIMARY} ${className}`.trim()}
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

const checkboxSx = {
  padding: "4px",
  color: "#64748b",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
  "& .MuiSvgIcon-root": { fontSize: 18 },
};

const FormEnableCheckbox = ({
  checked,
  onChange,
  name,
  label = "Enable",
  id,
}) => (
  <label
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      cursor: "pointer",
    }}
  >
    <Checkbox
      id={id || name}
      name={name}
      size="small"
      checked={!!checked}
      onChange={onChange}
      sx={checkboxSx}
    />
    <span style={{ fontSize: 13, color: C.valueText }}>{label}</span>
  </label>
);

const DtmfBreadcrumb = ({ current }) => (
  <div className="mb-[16px] flex flex-wrap items-center gap-[4px] text-[12px] font-normal text-[#94a3b8]">
    <span>FXS</span>
    <span>&gt;</span>
    <span>Advanced</span>
    <span>&gt;</span>
    <span className="font-semibold text-[#1e293b]">{current}</span>
  </div>
);

const DtmfPageShell = ({ children, fullWidth = false }) => (
  <div className={DTMF_PAGE_WRAP}>
    <div className={fullWidth ? "w-full max-w-full mx-auto" : DTMF_PAGE_INNER}>
      {children}
    </div>
  </div>
);

const DtmfFormCard = ({
  title,
  children,
  footer,
  fullWidthContent = false,
}) => (
  <div className={DTMF_TABLE_CONTAINER}>
    <div className={DTMF_BLUE_BAR}>
      <span>{title}</span>
    </div>
    <div
      className={
        footer ? `${DTMF_FORM_BODY} pb-0` : `${DTMF_FORM_BODY} pb-[12px]`
      }
    >
      <div
        className={`flex flex-col gap-[14px] ${
          fullWidthContent ? "w-full max-w-full m-0" : "max-w-[560px] mx-auto"
        }`}
      >
        {children}
      </div>
      {footer ? <div className={DTMF_FORM_FOOTER}>{footer}</div> : null}
    </div>
  </div>
);

const DtmfPage = () => {
  const [formData, setFormData] = useState(DTMF_INITIAL_FORM);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const alert = (msg) => {
    const isSuccess = /successfully/i.test(String(msg));
    showToast(msg, isSuccess ? "success" : "error");
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field) => {
    setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleKeyPress = (e, allowDecimal = false) => {
    const key = e.keyCode || e.which;
    if (
      !(
        (key >= 48 && key <= 57) ||
        key === 45 ||
        (allowDecimal && key === 46) ||
        key === 8
      )
    ) {
      e.preventDefault();
    }
  };

  const handleKeyPressInteger = (e) => {
    const key = e.keyCode || e.which;
    if (!((key >= 48 && key <= 57) || key === 8)) {
      e.preventDefault();
    }
  };

  const checkDtmfEnergy = (value) => {
    const parts = value.toString().split(".");
    if ((parts[1] !== undefined && parts[1].length > 1) || parts.length > 2) {
      return true;
    }
    return false;
  };

  const handleSave = () => {
    const positiveTwist = parseFloat(formData.positiveTwist);
    if (isNaN(positiveTwist) || positiveTwist < 0 || positiveTwist > 24) {
      alert(
        "The range of 'Energy Difference for High-freq minus Low-freq' is 0~24!",
      );
      document.getElementById("positiveTwist")?.focus();
      return;
    }

    const negativeTwist = parseFloat(formData.negativeTwist);
    if (isNaN(negativeTwist) || negativeTwist < 0 || negativeTwist > 24) {
      alert(
        "The range of 'Energy Difference for Low-freq minus High-freq' is 0~24!",
      );
      document.getElementById("negativeTwist")?.focus();
      return;
    }

    const minDuration = parseFloat(formData.minDuration);
    if (isNaN(minDuration) || minDuration < 10 || minDuration > 2000) {
      alert("The value range of the minimum duration at ON is 10~2000!");
      document.getElementById("minDuration")?.focus();
      return;
    }

    const minNegativeDuration = parseFloat(formData.minNegativeDuration);
    if (
      isNaN(minNegativeDuration) ||
      minNegativeDuration < 10 ||
      minNegativeDuration > 2000
    ) {
      alert("The value range of the minimum duration at OFF is 10~2000!");
      document.getElementById("minNegativeDuration")?.focus();
      return;
    }

    const energyRatio = parseFloat(formData.energyRatio);
    if (isNaN(energyRatio) || energyRatio < 1 || energyRatio > 100) {
      alert("The ratio range of the DT energy is 1~100!");
      document.getElementById("energyRatio")?.focus();
      return;
    }

    const levelMinIn = parseFloat(formData.levelMinIn);
    if (isNaN(levelMinIn) || levelMinIn < -40 || levelMinIn > -9) {
      alert("The value range of the lowest energy threshold is -40~-9!");
      document.getElementById("levelMinIn")?.focus();
      return;
    }

    if (formData.dtmfEnergyAdvance) {
      for (let i = 0; i <= 11; i++) {
        const dtmfPlayEnergy = parseFloat(formData[`dtmfPlayEnergy${i}`]);
        if (
          isNaN(dtmfPlayEnergy) ||
          dtmfPlayEnergy < -18 ||
          dtmfPlayEnergy > 11
        ) {
          const key = i === 10 ? "*" : i === 11 ? "#" : i;
          alert(`The value range of DTMF${key} Low Energy is -18.0~11.0dB!`);
          document.getElementById(`dtmfPlayEnergy${i}`)?.focus();
          return;
        }
        if (checkDtmfEnergy(formData[`dtmfPlayEnergy${i}`])) {
          const key = i === 10 ? "*" : i === 11 ? "#" : i;
          alert(`The value of DTMF${key} Low Energy only have one decimal!`);
          document.getElementById(`dtmfPlayEnergy${i}`)?.focus();
          return;
        }

        const dtmfHighPlayEnergy = parseFloat(
          formData[`dtmfHighPlayEnergy${i}`],
        );
        if (
          isNaN(dtmfHighPlayEnergy) ||
          dtmfHighPlayEnergy < -18 ||
          dtmfHighPlayEnergy > 11
        ) {
          const key = i === 10 ? "*" : i === 11 ? "#" : i;
          alert(`The value range of DTMF${key} High Energy is -18.0~11.0dB!`);
          document.getElementById(`dtmfHighPlayEnergy${i}`)?.focus();
          return;
        }
        if (checkDtmfEnergy(formData[`dtmfHighPlayEnergy${i}`])) {
          const key = i === 10 ? "*" : i === 11 ? "#" : i;
          alert(`The value of DTMF${key} High Energy only have one decimal!`);
          document.getElementById(`dtmfHighPlayEnergy${i}`)?.focus();
          return;
        }
      }
    } else {
      const dtmfPlayEnergy = parseFloat(formData.dtmfPlayEnergy);
      if (
        isNaN(dtmfPlayEnergy) ||
        dtmfPlayEnergy < -18 ||
        dtmfPlayEnergy > 11
      ) {
        alert("The value range of 'DTMF Energy' is -18~11dB!");
        document.getElementById("dtmfPlayEnergy")?.focus();
        return;
      }
    }

    const dtmfTxHighDuration = parseFloat(formData.dtmfTxHighDuration);
    if (
      isNaN(dtmfTxHighDuration) ||
      dtmfTxHighDuration < 0 ||
      dtmfTxHighDuration > 16383
    ) {
      alert("The value range of 'Duration at ON' is 0~16383!");
      document.getElementById("dtmfTxHighDuration")?.focus();
      return;
    }

    const dtmfTxLowDuration = parseFloat(formData.dtmfTxLowDuration);
    if (
      isNaN(dtmfTxLowDuration) ||
      dtmfTxLowDuration < 0 ||
      dtmfTxLowDuration > 16383
    ) {
      alert("The value range of 'Duration at OFF' is 0~16383!");
      document.getElementById("dtmfTxLowDuration")?.focus();
      return;
    }

    alert("Settings saved successfully!");
  };

  const handleReset = () => {
    setFormData(DTMF_INITIAL_FORM);
  };

  const labelCellStyle = {
    fontSize: 13,
    fontWeight: 600,
    color: C.labelText,
    paddingRight: 24,
    textAlign: "left",
    verticalAlign: "middle",
  };
  const inputCellStyle = {
    width: "35%",
    padding: 0,
    verticalAlign: "middle",
  };

  const renderField = (
    label,
    fieldName,
    type = "text",
    allowDecimal = false,
    width = "200px",
  ) => {
    return (
      <>
        <tr style={{ height: "22px" }}>
          <td style={labelCellStyle}>{label}</td>
          <td style={inputCellStyle}>
            {type === "checkbox" ? (
              <FormEnableCheckbox
                checked={!!formData[fieldName]}
                onChange={() => handleCheckboxChange(fieldName)}
              />
            ) : (
              <TextField
                id={fieldName}
                value={formData[fieldName]}
                onChange={(e) => handleInputChange(fieldName, e.target.value)}
                onKeyPress={(e) =>
                  allowDecimal
                    ? handleKeyPress(e, true)
                    : handleKeyPressInteger(e)
                }
                inputProps={{
                  maxLength: 20,
                  style: { fontSize: 14, padding: "4px 8px" },
                }}
                sx={{
                  width: width,
                  ...muiTextFieldSx,
                  "& .MuiOutlinedInput-root": {
                    ...muiTextFieldSx["& .MuiOutlinedInput-root"],
                    height: "28px",
                  },
                }}
                variant="outlined"
                size="small"
              />
            )}
          </td>
        </tr>
        <tr>
          <td colSpan={2} style={{ height: "8px" }}></td>
        </tr>
      </>
    );
  };

  const renderAdvancedEnergyField = (label, lowField, highField) => {
    const highLabel = label.replace("Low Hz", "High Hz");
    return (
      <>
        {renderField(label, lowField, "text", true)}
        {renderField(highLabel, highField, "text", true)}
      </>
    );
  };

  return (
    <DtmfPageShell>
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
      <DtmfBreadcrumb current="DTMF" />
      <DtmfFormCard title="DTMF Detector">
        <table style={{ width: "100%", tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "65%" }} />
            <col style={{ width: "35%" }} />
          </colgroup>
          <tbody>
            {renderField(
              "Energy Difference of High-freq minus Low-freq (dB)",
              "positiveTwist",
              "text",
              false,
            )}
            {renderField(
              "Energy Difference of Low-freq minus High-freq (dB)",
              "negativeTwist",
              "text",
              false,
            )}
            {renderField(
              "Minimum Duration at ON (ms)",
              "minDuration",
              "text",
              false,
            )}
            {renderField(
              "Minimum Duration at OFF (ms)",
              "minNegativeDuration",
              "text",
              false,
            )}
            {renderField("Ratio of DT Energy(%)", "energyRatio", "text", true)}
            {renderField(
              "Lowest Energy Threshold (dB)",
              "levelMinIn",
              "text",
              false,
            )}
            {renderField(
              "DTMF Display via Channel Status",
              "enableDisplayDtmf",
              "checkbox",
            )}
            {renderField("ABCD Detection", "enableOmitABCD", "checkbox")}
          </tbody>
        </table>
      </DtmfFormCard>

      <DtmfFormCard title="DTMF Generator">
        <table style={{ width: "100%", tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "65%" }} />
            <col style={{ width: "35%" }} />
          </colgroup>
          <tbody>
            <tr style={{ height: "22px" }}>
              <td style={labelCellStyle}>DTMF Energy Advance Set</td>
              <td style={inputCellStyle}>
                <FormEnableCheckbox
                  checked={!!formData.dtmfEnergyAdvance}
                  onChange={() => handleCheckboxChange("dtmfEnergyAdvance")}
                />
              </td>
            </tr>
            <tr>
              <td colSpan={2} style={{ height: "8px" }}></td>
            </tr>

            {!formData.dtmfEnergyAdvance &&
              renderField("DTMF Energy (dB)", "dtmfPlayEnergy", "text", false)}

            {formData.dtmfEnergyAdvance && (
              <>
                {renderAdvancedEnergyField(
                  "DTMF0 Low Hz Energy (dB)",
                  "dtmfPlayEnergy0",
                  "dtmfHighPlayEnergy0",
                )}
                {renderAdvancedEnergyField(
                  "DTMF1 Low Hz Energy (dB)",
                  "dtmfPlayEnergy1",
                  "dtmfHighPlayEnergy1",
                )}
                {renderAdvancedEnergyField(
                  "DTMF2 Low Hz Energy (dB)",
                  "dtmfPlayEnergy2",
                  "dtmfHighPlayEnergy2",
                )}
                {renderAdvancedEnergyField(
                  "DTMF3 Low Hz Energy (dB)",
                  "dtmfPlayEnergy3",
                  "dtmfHighPlayEnergy3",
                )}
                {renderAdvancedEnergyField(
                  "DTMF4 Low Hz Energy (dB)",
                  "dtmfPlayEnergy4",
                  "dtmfHighPlayEnergy4",
                )}
                {renderAdvancedEnergyField(
                  "DTMF5 Low Hz Energy (dB)",
                  "dtmfPlayEnergy5",
                  "dtmfHighPlayEnergy5",
                )}
                {renderAdvancedEnergyField(
                  "DTMF6 Low Hz Energy (dB)",
                  "dtmfPlayEnergy6",
                  "dtmfHighPlayEnergy6",
                )}
                {renderAdvancedEnergyField(
                  "DTMF7 Low Hz Energy (dB)",
                  "dtmfPlayEnergy7",
                  "dtmfHighPlayEnergy7",
                )}
                {renderAdvancedEnergyField(
                  "DTMF8 Low Hz Energy (dB)",
                  "dtmfPlayEnergy8",
                  "dtmfHighPlayEnergy8",
                )}
                {renderAdvancedEnergyField(
                  "DTMF9 Low Hz Energy (dB)",
                  "dtmfPlayEnergy9",
                  "dtmfHighPlayEnergy9",
                )}
                {renderAdvancedEnergyField(
                  "DTMF* Low Hz Energy (dB)",
                  "dtmfPlayEnergy10",
                  "dtmfHighPlayEnergy10",
                )}
                {renderAdvancedEnergyField(
                  "DTMF# Low Hz Energy (dB)",
                  "dtmfPlayEnergy11",
                  "dtmfHighPlayEnergy11",
                )}
              </>
            )}

            {renderField(
              "Duration at ON (ms)",
              "dtmfTxHighDuration",
              "text",
              false,
            )}
            {renderField(
              "Duration at OFF (ms)",
              "dtmfTxLowDuration",
              "text",
              false,
            )}
          </tbody>
        </table>

        <div
          style={{
            marginTop: "16px",
            marginLeft: "auto",
            marginRight: "auto",
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <p
            style={{
              color: "#dc2626",
              fontSize: "13px",
              margin: 0,
              whiteSpace: "nowrap",
              textAlign: "center",
            }}
          >
            Note: Setting the DTMF transmission energy too large may cause the
            distortion of the transmitted DTMF. Please configure it carefully.
          </p>
        </div>
      </DtmfFormCard>

      <div className="mt-[16px] flex w-full justify-center gap-[12px]">
        <Btn variant="formPrimary" onClick={handleSave}>
          Save
        </Btn>
        <Btn variant="formCancel" onClick={handleReset}>
          Reset
        </Btn>
      </div>
    </DtmfPageShell>
  );
};

export default DtmfPage;
