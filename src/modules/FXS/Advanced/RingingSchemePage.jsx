import React, { useState } from "react";
import { RINGING_SCHEME_INITIAL_FORM } from "../../../sections/advanced/constants/RingingSchemeConstants";
import {
  Alert,
  TextField,
  Select as MuiSelect,
  MenuItem,
  FormControl,
} from "@mui/material";
import {
  Btn,
  C,
  muiSelectSx,
  muiTextFieldSx,
  AdvancedPageShell,
  AdvancedFormCard,
  AdvancedBreadcrumb,
  FieldRow,
  advancedFormPanelStyle,
  advancedFormBtnStyle,
} from "../../../shared/fxsSharedUi";

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

  // --- API / FUNCTIONALITY (UNTOUCHED) ---
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

  // ── Render Helpers ─────────────────────────────────────────────────────────
  const renderSchemeContent = (n) => {
    const isCallerId = formData.ringScheme === "0";
    return (
      <div key={n} style={{ marginBottom: 24 }}>
        <RingingSchemeSectionHeading title={`Scheme ${n}`} />
        <div
          style={{
            ...advancedFormPanelStyle,
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
      <AdvancedBreadcrumb current="Ringing Scheme" />
      <AdvancedFormCard
        title="Ringing Scheme"
        fullWidthContent
        footer={
          <>
            <Btn
              variant="primary"
              onClick={handleSave}
              style={advancedFormBtnStyle}
            >
              Save
            </Btn>
            <Btn
              variant="cancel"
              onClick={handleReset}
              style={advancedFormBtnStyle}
            >
              Reset
            </Btn>
          </>
        }
      >
          <div>
            <div
              style={{
                ...advancedFormPanelStyle,
                border: "none",
                boxShadow: "none",
                background: "transparent",
                padding: 0,
                marginBottom: 24,
              }}
            >
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
      </AdvancedFormCard>
    </AdvancedPageShell>
  );
};

export default RingingSchemePage;
