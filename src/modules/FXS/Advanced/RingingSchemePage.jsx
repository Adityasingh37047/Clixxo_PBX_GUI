import React, { useState } from "react";
import { RINGING_SCHEME_INITIAL_FORM } from "../../../sections/advanced/constants/RingingSchemeConstants";
import {
  TextField,
  Button,
  Select as MuiSelect,
  MenuItem,
  FormControl,
} from "@mui/material";

// ── Color Palette (Standard Admin Theme) ───────────────────────────────────
const C = {
  pageBg: "#eef2f7",
  cardBg: "#ffffff",
  cardBorder: "#9ca3af",
  labelText: "#1e293b",
  valueText: "#1e293b",
  mutedText: "#94a3b8",
  accent: "#1e293b",
  errorRed: "#dc2626",
};

// ── Shared UI Layout Components ─────────────────────────────────────────────
const FieldRow = ({ label, children }) => (
  <div
    style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 32 }}
  >
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: 140,
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

// ─────────────────────────────────────────────────────────────────────────────

const RingingSchemePage = () => {
  const [formData, setFormData] = useState(RINGING_SCHEME_INITIAL_FORM);
  const [changeTime, setChangeTime] = useState(0);

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
        <SectionHeading title={`Scheme ${n}`} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px 40px",
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
    <div
      style={{
        backgroundColor: C.pageBg,
        minHeight: "calc(100vh - 80px)",
        padding: 16,
      }}
    >
      <div style={{ maxWidth: "1024px", margin: "0 auto" }}>
        {/* Breadcrumb / Title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 11, color: C.mutedText }}>
            FXS &rsaquo; Advanced &rsaquo;{" "}
            <span style={{ color: C.valueText, fontWeight: 600 }}>
              Ringing Scheme
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
            <SectionHeading title="General Configuration" />
            <FieldRow label="Matching Scheme">
              <FormControl size="small" sx={{ width: 260 }}>
                <MuiSelect
                  value={formData.ringScheme}
                  onChange={(e) => handleSchemeChange(e.target.value)}
                  sx={{ fontSize: 13, height: 32 }}
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

            {[1, 2, 3, 4].map((n) => renderSchemeContent(n))}
          </div>

          {/* Bottom Actions Footer */}
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
                  "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 100%)",
                color: "#fff",
                fontWeight: 600,
                fontSize: 13,
                textTransform: "none",
                padding: "6px 32px",
                minWidth: 120,
                "&:hover": { background: "#1e2d42" },
              }}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              onClick={handleReset}
              sx={{
                color: C.accent,
                borderColor: C.cardBorder,
                background:
                  "linear-gradient(to bottom, #eef2f7 0%, #d6dde6 100%)",
                fontWeight: 600,
                fontSize: 13,
                textTransform: "none",
                padding: "6px 32px",
                minWidth: 100,
                "&:hover": { borderColor: C.accent, background: "#f1f5f9" },
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

export default RingingSchemePage;
