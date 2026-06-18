import React, { useState } from "react";
import { RINGING_SCHEME_INITIAL_FORM } from "../../../constants/RingingSchemeConstants";
import {
  Alert,
  TextField,
  Select as MuiSelect,
  MenuItem,
  FormControl,
} from "@mui/material";

// ── Local page UI (inlined from fxsSharedUi) ──
const C = {
  cardBg: "#ffffff",
  cardBorder: "#9CA3AF",
  labelText: "#3E5475",
};

const RINGING_SCHEME_PAGE_WRAP =
  "bg-[#f8fafc] min-h-[calc(100vh-80px)] p-[16px] box-border flex flex-col items-center";
const RINGING_SCHEME_PAGE_INNER = "w-full max-w-[1000px] mx-auto";
const RINGING_SCHEME_TABLE_CONTAINER =
  "w-full max-w-full mx-auto mb-[24px] overflow-hidden rounded-[10px] border-[1.5px] border-[#9CA3AF] bg-white shadow-[0_4px_20px_rgba(15,23,42,0.06)]";
const RINGING_SCHEME_BLUE_BAR =
  "flex w-full min-h-[44px] flex-wrap items-center justify-start gap-[12px] rounded-t-[10px] border-b border-[#9CA3AF] bg-white px-[14px] py-[7px] text-[13px] font-bold text-[#3E5475]";
const RINGING_SCHEME_FORM_BODY = "px-[20px] pt-[12px]";
const RINGING_SCHEME_FORM_FOOTER =
  "flex w-full flex-wrap items-center justify-center gap-[12px] w-[calc(100%+40px)] -mx-[20px] border-t border-[#9CA3AF] box-border px-[20px] py-[10px]";

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

const OUTLINED_BORDER = "rgba(0, 0, 0, 0.23)";
const OUTLINED_HOVER = "rgba(0, 0, 0, 0.87)";
const OUTLINED_FOCUS = "#1976d2";

const muiTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#fff",
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

const muiSelectInnerSx = {
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
};

const muiSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  ...muiSelectInnerSx,
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

const RingingSchemeBreadcrumb = ({ current }) => (
  <div className="mb-[16px] flex flex-wrap items-center gap-[4px] text-[12px] font-normal text-[#94a3b8]">
    <span>FXS</span>
    <span>&gt;</span>
    <span>Advanced</span>
    <span>&gt;</span>
    <span className="font-semibold text-[#1e293b]">{current}</span>
  </div>
);

const RingingSchemePageShell = ({ children, fullWidth = false }) => (
  <div className={RINGING_SCHEME_PAGE_WRAP}>
    <div
      className={
        fullWidth ? "w-full max-w-full mx-auto" : RINGING_SCHEME_PAGE_INNER
      }
    >
      {children}
    </div>
  </div>
);

const FieldRow = ({
  label,
  children,
  required,
  align = "center",
  labelWidth = 170,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: align,
      justifyContent: "center",
      gap: 12,
      minHeight: align === "flex-start" ? undefined : 32,
    }}
  >
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: labelWidth,
        flexShrink: 0,
        textAlign: "left",
        paddingTop: align === "flex-start" ? 8 : 0,
      }}
    >
      {label}
      {required && <span style={{ color: "#dc2626" }}> *</span>}
    </label>
    <div style={{ width: "min(100%, 320px)" }}>{children}</div>
  </div>
);

const RingingSchemeFormCard = ({
  title,
  children,
  footer,
  fullWidthContent = false,
}) => (
  <div className={RINGING_SCHEME_TABLE_CONTAINER}>
    <div className={RINGING_SCHEME_BLUE_BAR}>
      <span>{title}</span>
    </div>
    <div
      className={
        footer
          ? `${RINGING_SCHEME_FORM_BODY} pb-0`
          : `${RINGING_SCHEME_FORM_BODY} pb-[12px]`
      }
    >
      <div
        className={`flex flex-col gap-[14px] ${
          fullWidthContent ? "w-full max-w-full m-0" : "max-w-[560px] mx-auto"
        }`}
      >
        {children}
      </div>
      {footer ? (
        <div className={RINGING_SCHEME_FORM_FOOTER}>{footer}</div>
      ) : null}
    </div>
  </div>
);

const RINGING_SCHEME_SECTION_HEADING_COLOR = "#30415A";

const RingingSchemeSectionHeading = ({ title }) => (
  <div style={{ margin: "16px 0 24px 0", position: "relative" }}>
    <div style={{ borderTop: `1px solid ${C.cardBorder}` }} />
    <span
      style={{
        position: "absolute",
        top: -10,
        left: 0,
        background: C.cardBg,
        paddingRight: 8,
        fontSize: 13,
        fontWeight: 600,
        color: RINGING_SCHEME_SECTION_HEADING_COLOR,
      }}
    >
      {title}
    </span>
  </div>
);

const RingingSchemePage = () => {
  const [formData, setFormData] = useState(RINGING_SCHEME_INITIAL_FORM);
  const [changeTime, setChangeTime] = useState(0);
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

  const handleSchemeChange = (value) => {
    const newData = { ...formData, ringScheme: value };
    if (changeTime > 0) {
      for (let i = 1; i <= 4; i++) {
        const tempMode = newData[`ringMode${i}`];
        newData[`ringMode${i}`] = newData[`ringMode${i}bak`];
        newData[`ringMode${i}bak`] = tempMode;
      }
    } else {
      for (let i = 1; i <= 4; i++) {
        if (value === "0") {
          if (newData[`ringMode${i}`] === "") {
            newData[`ringAlertInfo${i}`] = "";
          } else if (newData[`ringAlertInfo${i}`] === "") {
            newData[`ringMode${i}bak`] = "";
          }
        } else {
          if (newData[`ringMode${i}`] === "") {
            newData[`ringCallerId${i}`] = "";
          } else if (newData[`ringCallerId${i}`] === "") {
            newData[`ringMode${i}bak`] = "";
          }
        }
      }
    }
    setFormData(newData);
    setChangeTime((prev) => prev + 1);
  };

  const handleKeyPress = (e) => {
    const key = e.keyCode || e.which;
    if (!((key >= 48 && key <= 57) || key === 44 || key === 8))
      e.preventDefault();
  };

  const handleKeyPress1 = (e) => {
    const key = e.keyCode || e.which;
    const blocked = [32, 33, 34, 38, 39, 40, 41, 59, 61, 92, 124, 126];
    if (blocked.includes(key) && key !== 8) e.preventDefault();
  };

  const handleSave = () => {
    const minKeepTime = 50;
    const minSendCidLowTime = 1700;
    const CIDstyle = 1;
    const FskPos = 1;

    for (let i = 1; i <= 4; i++) {
      const ringCallerIdObj = formData[`ringCallerId${i}`];
      const ringModeObj = formData[`ringMode${i}`];
      const ringAlertInfoObj = formData[`ringAlertInfo${i}`];
      const ringNumInfo = String(i);

      if (formData.ringScheme === "0") {
        const reg = /^[0-9A-Za-z.*\[\]\-,]{1,128}$/;
        if (ringCallerIdObj !== "") {
          if (!reg.test(ringCallerIdObj)) {
            alert(
              "The CallerID can consist only of 0~9, A~Z, a~z, '.' '[' ']' '-' ',' and '*'!",
            );
            document.getElementById(`ringCallerId${i}`)?.focus();
            return;
          }
          if (ringModeObj === "") {
            alert(`Please input a ringing mode for Scheme ${ringNumInfo}!`);
            document.getElementById(`ringMode${i}`)?.focus();
            return;
          } else {
            const strArr = ringModeObj.split(",");
            if (strArr[0] === "1") {
              if (strArr.length !== 3) {
                alert(
                  `Please input a ringing mode in the right format for Scheme ${ringNumInfo}!`,
                );
                document.getElementById(`ringMode${i}`)?.focus();
                return;
              }
              if (
                parseInt(strArr[1]) < minKeepTime ||
                parseInt(strArr[2]) < minKeepTime ||
                (CIDstyle === 1 &&
                  FskPos === 1 &&
                  parseInt(strArr[2]) < minSendCidLowTime)
              ) {
                if (parseInt(strArr[1]) < minKeepTime) {
                  alert(
                    `The duration at ON/OFF state for ringing scheme ${ringNumInfo} cannot be less than 50ms!`,
                  );
                } else {
                  alert(
                    `The duration at OFF state for the last ringing scheme ${ringNumInfo} cannot be less than 1700ms!`,
                  );
                }
                document.getElementById(`ringMode${i}`)?.focus();
                return;
              }
            } else if (strArr[0] === "2") {
              if (strArr.length !== 5) {
                alert(
                  `Please input a ringing mode in the right format for Scheme ${ringNumInfo}!`,
                );
                document.getElementById(`ringMode${i}`)?.focus();
                return;
              }
              if (
                parseInt(strArr[1]) < minKeepTime ||
                parseInt(strArr[2]) < minKeepTime ||
                parseInt(strArr[3]) < minKeepTime ||
                parseInt(strArr[4]) < minKeepTime ||
                (CIDstyle === 1 &&
                  FskPos === 1 &&
                  parseInt(strArr[4]) < minSendCidLowTime)
              ) {
                if (
                  parseInt(strArr[1]) < minKeepTime ||
                  parseInt(strArr[2]) < minKeepTime ||
                  parseInt(strArr[3]) < minKeepTime
                ) {
                  alert(
                    `The duration at ON/OFF state for ringing scheme ${ringNumInfo} cannot be less than 50ms!`,
                  );
                } else {
                  alert(
                    `The duration at OFF state for the last ringing scheme ${ringNumInfo} cannot be less than 1700ms!`,
                  );
                }
                document.getElementById(`ringMode${i}`)?.focus();
                return;
              }
            } else {
              alert(
                `Please input a ringing mode in the right format for Scheme ${ringNumInfo}!`,
              );
              document.getElementById(`ringMode${i}`)?.focus();
              return;
            }
          }
        } else if (ringModeObj !== "") {
          alert(`Please input the CallerID for Scheme ${ringNumInfo}!`);
          document.getElementById(`ringCallerId${i}`)?.focus();
          return;
        }
      } else {
        if (ringAlertInfoObj !== "") {
          if (ringModeObj === "") {
            alert(`Please input a ringing mode for Scheme ${ringNumInfo}!`);
            document.getElementById(`ringMode${i}`)?.focus();
            return;
          } else {
            const strArr = ringModeObj.split(",");
            if (strArr[0] === "1") {
              if (strArr.length !== 3) {
                alert(
                  `Please input a ringing mode in the right format for Scheme ${ringNumInfo}!`,
                );
                document.getElementById(`ringMode${i}`)?.focus();
                return;
              }
              if (
                parseInt(strArr[1]) < minKeepTime ||
                parseInt(strArr[2]) < minKeepTime ||
                (CIDstyle === 1 &&
                  FskPos === 1 &&
                  parseInt(strArr[2]) < minSendCidLowTime)
              ) {
                if (parseInt(strArr[1]) < minKeepTime) {
                  alert(
                    `The duration at ON/OFF state for ringing scheme ${ringNumInfo} cannot be less than 50ms!`,
                  );
                } else {
                  alert(
                    `The duration at OFF state for the last ringing scheme ${ringNumInfo} cannot be less than 1700ms!`,
                  );
                }
                document.getElementById(`ringMode${i}`)?.focus();
                return;
              }
            } else if (strArr[0] === "2") {
              if (strArr.length !== 5) {
                alert(
                  `Please input a ringing mode in the right format for Scheme ${ringNumInfo}!`,
                );
                document.getElementById(`ringMode${i}`)?.focus();
                return;
              }
              if (
                parseInt(strArr[1]) < minKeepTime ||
                parseInt(strArr[2]) < minKeepTime ||
                parseInt(strArr[3]) < minKeepTime ||
                parseInt(strArr[4]) < minKeepTime ||
                (CIDstyle === 1 &&
                  FskPos === 1 &&
                  parseInt(strArr[4]) < minSendCidLowTime)
              ) {
                if (
                  parseInt(strArr[1]) < minKeepTime ||
                  parseInt(strArr[2]) < minKeepTime ||
                  parseInt(strArr[3]) < minKeepTime
                ) {
                  alert(
                    `The duration at ON/OFF state for ringing scheme ${ringNumInfo} cannot be less than 50ms!`,
                  );
                } else {
                  alert(
                    `The duration at OFF state for the last ringing scheme ${ringNumInfo} cannot be less than 1700ms!`,
                  );
                }
                document.getElementById(`ringMode${i}`)?.focus();
                return;
              }
            } else {
              alert(
                `Please input a ringing mode in the right format for Scheme ${ringNumInfo}!`,
              );
              document.getElementById(`ringMode${i}`)?.focus();
              return;
            }
          }
        } else if (ringModeObj !== "") {
          alert(`Please input the Alert-Info Value for Scheme ${ringNumInfo}!`);
          document.getElementById(`ringAlertInfo${i}`)?.focus();
          return;
        }
      }
    }

    const ringCallerIdArr = [
      formData.ringCallerId1,
      formData.ringCallerId2,
      formData.ringCallerId3,
      formData.ringCallerId4,
    ];
    const ringAlertInfoArr = [
      formData.ringAlertInfo1,
      formData.ringAlertInfo2,
      formData.ringAlertInfo3,
      formData.ringAlertInfo4,
    ];

    for (let i = 0; i < 3; i++) {
      if (formData.ringScheme === "0") {
        if (ringCallerIdArr[i] === "") continue;
        for (let j = i + 1; j < 4; j++) {
          if (ringCallerIdArr[j] === "") continue;
          if (ringCallerIdArr[i] === ringCallerIdArr[j]) {
            alert("The callerID has already existed!");
            document.getElementById(`ringCallerId${j + 1}`)?.focus();
            return;
          }
        }
      } else {
        if (ringAlertInfoArr[i] === "") continue;
        for (let j = i + 1; j < 4; j++) {
          if (ringAlertInfoArr[j] === "") continue;
          if (ringAlertInfoArr[i] === ringAlertInfoArr[j]) {
            alert("The Alter-Info has already existed!");
            document.getElementById(`ringAlertInfo${j + 1}`)?.focus();
            return;
          }
        }
      }
    }
    alert("Settings saved successfully!");
  };

  const handleReset = () => {
    setFormData(RINGING_SCHEME_INITIAL_FORM);
    setChangeTime(0);
  };

  const renderSchemeContent = (n) => {
    const isCallerId = formData.ringScheme === "0";
    return (
      <div key={n} style={{ marginBottom: 24 }}>
        <RingingSchemeSectionHeading title={`Scheme ${n}`} />
        <div
          style={{
            border: "none",
            boxShadow: "none",
            background: "transparent",
            padding: 0,
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "16px 24px",
          }}
        >
          <FieldRow label={isCallerId ? "CallerID" : "Alert-Info Value"}>
            <TextField
              id={isCallerId ? `ringCallerId${n}` : `ringAlertInfo${n}`}
              size="small"
              fullWidth
              value={
                isCallerId
                  ? formData[`ringCallerId${n}`]
                  : formData[`ringAlertInfo${n}`]
              }
              onChange={(e) =>
                handleInputChange(
                  isCallerId ? `ringCallerId${n}` : `ringAlertInfo${n}`,
                  e.target.value,
                )
              }
              onKeyPress={handleKeyPress1}
              sx={muiTextFieldSx}
              inputProps={{
                maxLength: 128,
                style: { fontSize: 13, padding: "6px 8px" },
              }}
            />
          </FieldRow>
          <FieldRow label="Ringing Mode">
            <TextField
              id={`ringMode${n}`}
              size="small"
              fullWidth
              value={formData[`ringMode${n}`]}
              onChange={(e) =>
                handleInputChange(`ringMode${n}`, e.target.value)
              }
              onKeyPress={handleKeyPress}
              sx={muiTextFieldSx}
              inputProps={{
                maxLength: 128,
                style: { fontSize: 13, padding: "6px 8px" },
              }}
            />
          </FieldRow>
        </div>
      </div>
    );
  };

  return (
    <RingingSchemePageShell>
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
      <RingingSchemeBreadcrumb current="Ringing Scheme" />
      <RingingSchemeFormCard
        title="Ringing Scheme"
        fullWidthContent
        footer={
          <>
            <Btn variant="formPrimary" onClick={handleSave}>
              Save
            </Btn>
            <Btn variant="formCancel" onClick={handleReset}>
              Reset
            </Btn>
          </>
        }
      >
        <div>
          <div style={{ marginBottom: 24 }}>
            <FieldRow label="Matching Scheme">
              <FormControl size="small" sx={{ width: "100%" }}>
                <MuiSelect
                  value={formData.ringScheme}
                  onChange={(e) => handleSchemeChange(e.target.value)}
                  sx={muiSelectSx}
                >
                  <MenuItem value="0" sx={{ fontSize: 13 }}>
                    CallerID Matching
                  </MenuItem>
                  <MenuItem value="1" sx={{ fontSize: 13 }}>
                    Alert-Info Matching
                  </MenuItem>
                </MuiSelect>
              </FormControl>
            </FieldRow>
          </div>

          {[1, 2, 3, 4].map((n) => renderSchemeContent(n))}
        </div>
      </RingingSchemeFormCard>
    </RingingSchemePageShell>
  );
};

export default RingingSchemePage;
