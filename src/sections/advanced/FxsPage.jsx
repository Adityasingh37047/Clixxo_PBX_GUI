import React, { useState } from "react";
import {
  Alert,
  Button,
  FormControl,
  MenuItem,
  Select as MuiSelect,
  Checkbox,
  TextField,
} from "@mui/material";
import { FXS_INITIAL_FORM } from "./constants/FxsConstants"; // Adjust path if needed

// ── Color Palette (CDR / PBX Admin Theme) ───────────────────────────────────
const C = {
  pageBg: "#eef2f7",
  cardBg: "#ffffff",
  cardBorder: "#9ca3af",
  labelText: "#1e293b",
  valueText: "#1e293b",
  mutedText: "#94a3b8",
  accent: "#1e293b",
  successGreen: "#16a34a",
  errorRed: "#dc2626",
  amber: "#d97706",
};

// ── Shared UI Components ──────────────────────────────────────────────────────
const FieldRow = ({ label, children, required, align = "center" }) => (
  <div style={{ display: "flex", alignItems: align, gap: 12, minHeight: 32 }}>
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: 240, // Increased width for longer FXS labels
        flexShrink: 0,
        paddingTop: align === "flex-start" ? 8 : 0,
      }}
    >
      {label} {required && <span style={{ color: C.errorRed }}>*</span>}
    </label>
    <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
  </div>
);

const SectionHeading = ({ title }) => (
  <div style={{ margin: "16px 0 24px 0", position: "relative" }}>
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

const FxsPage = () => {
  // Form state
  const [formData, setFormData] = useState(FXS_INITIAL_FORM);
  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleFieldChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name, checked) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleKeyPress = (e, type) => {
    const key = e.keyCode || e.which;
    // Allow digits (48-57), comma (44), minus (45), backspace (8)
    if (type === "number") {
      if (!((key > 47 && key < 58) || key === 8)) {
        e.preventDefault();
      }
    } else if (type === "number-comma-minus") {
      // For ringMode field
      if (!((key > 47 && key < 58) || key === 44 || key === 45 || key === 8)) {
        e.preventDefault();
      }
    } else if (type === "number-minus") {
      // For fields that allow negative numbers
      if (!((key > 47 && key < 58) || key === 45 || key === 8)) {
        e.preventDefault();
      }
    }
  };

  const validateForm = () => {
    // Validate Ringing Mode if enabled
    if (formData.ringingSchemeEnabled && !formData.ringMode) {
      showMessage("error", "Please input a ringing mode for Scheme!");
      return false;
    }

    if (formData.ringingSchemeEnabled && formData.ringMode) {
      const strArr = formData.ringMode.split(",");
      if (strArr[0] === "1") {
        if (strArr.length !== 3) {
          showMessage(
            "error",
            "Please input a ringing mode in the right format for Scheme!",
          );
          return false;
        }
        const sum = parseInt(strArr[1]) + parseInt(strArr[2]);
        if (sum > 16000) {
          showMessage(
            "error",
            "The sum duration at ON/OFF state for ringing scheme cannot be more than 16000ms！",
          );
          return false;
        }
        if (parseInt(strArr[1]) > 12000 || parseInt(strArr[2]) > 12000) {
          showMessage(
            "error",
            "The duration at ON/OFF state for ringing scheme cannot be more than 12000ms！",
          );
          return false;
        }
        const minKeepTime = 50;
        if (
          parseInt(strArr[1]) < minKeepTime ||
          parseInt(strArr[2]) < minKeepTime
        ) {
          showMessage(
            "error",
            "The duration at ON/OFF state for ringing scheme cannot be less than 50ms!",
          );
          return false;
        }
      } else if (strArr[0] === "2") {
        if (strArr.length !== 5) {
          showMessage(
            "error",
            "Please input a ringing mode in the right format for Scheme!",
          );
          return false;
        }
        const sum =
          parseInt(strArr[1]) +
          parseInt(strArr[2]) +
          parseInt(strArr[3]) +
          parseInt(strArr[4]);
        if (sum > 16000) {
          showMessage(
            "error",
            "The sum duration at ON/OFF state for ringing scheme cannot be more than 16000ms！",
          );
          return false;
        }
        if (
          parseInt(strArr[1]) > 12000 ||
          parseInt(strArr[2]) > 12000 ||
          parseInt(strArr[3]) > 12000 ||
          parseInt(strArr[4]) > 12000
        ) {
          showMessage(
            "error",
            "The duration at ON/OFF state for ringing scheme cannot be more than 12000ms！",
          );
          return false;
        }
        const minKeepTime = 50;
        if (
          parseInt(strArr[1]) < minKeepTime ||
          parseInt(strArr[2]) < minKeepTime ||
          parseInt(strArr[3]) < minKeepTime ||
          parseInt(strArr[4]) < minKeepTime
        ) {
          showMessage(
            "error",
            "The duration at ON/OFF state for ringing scheme cannot be less than 50ms!",
          );
          return false;
        }
      } else {
        showMessage(
          "error",
          "Please input a ringing mode in the right format for Scheme!",
        );
        return false;
      }
    }

    // Validate Tone Energy
    const toneEnergy = parseInt(formData.toneEnergy);
    if (isNaN(toneEnergy) || toneEnergy < -35 || toneEnergy > 15) {
      showMessage("error", "The value range of 'Tone Energy' is -35~15dB!");
      return false;
    }

    // Validate Hook-flash times if enabled
    if (formData.hookFlashDetection) {
      const hookFlashMinTime = parseInt(formData.hookFlashMinTime);
      const hookFlashMaxTime = parseInt(formData.hookFlashMaxTime);

      if (hookFlashMinTime < 80) {
        showMessage(
          "error",
          "The minimum time for Hook-flash detection must be longer than 80ms!",
        );
        return false;
      }
      if (hookFlashMinTime > hookFlashMaxTime) {
        showMessage(
          "error",
          "The minimum time for Hook-flash detection can not exceed the maximum time!",
        );
        return false;
      }
      if (hookFlashMaxTime < 80 || hookFlashMaxTime > 2000) {
        showMessage(
          "error",
          "The value range of 'Flash Signal Detection' is 80~2000ms",
        );
        return false;
      }
    } else {
      // Validate Minimum Time Length of On-hook Detection
      const minHangupTime = parseInt(formData.minHangupTime);
      if (minHangupTime < 64 || minHangupTime > 2000) {
        showMessage(
          "error",
          "The minimum time length of on-hook detection must be in the range of 64ms~2000ms!",
        );
        return false;
      }
    }

    // Validate Off-hook Dither Signal Duration
    const offHookDither = parseInt(formData.offHookDitherSignalDuration);
    if (offHookDither <= 0 || offHookDither % 16 !== 0) {
      showMessage(
        "error",
        "Off-hook Dither Signal Duration must be longer than 0 and the integral times of 16!",
      );
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (validateForm()) {
      showMessage("success", "Settings saved successfully!");
    }
  };

  const handleReset = () => {
    setFormData({ ...FXS_INITIAL_FORM });
  };

  return (
    <div
      style={{
        backgroundColor: C.pageBg,
        minHeight: "calc(100vh - 80px)",
        padding: 16,
      }}
    >
      <div style={{ maxWidth: "100%", margin: "0 auto" }}>
        {/* Error / Success Banner */}
        {message.text && (
          <Alert
            severity={message.type === "error" ? "error" : message.type === "success" ? "success" : "info"}
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
            FXS &rsaquo; Advanced &rsaquo;{" "}
            <span style={{ color: C.valueText, fontWeight: 600 }}>FXS</span>
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
            <SectionHeading title="FXS Settings" />

            {/* 2-Column Grid Layout for Form Fields */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px 40px",
              }}
            >
              {/* ── LEFT COLUMN ── */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <FieldRow label="Tone Energy (dB)">
                  <TextField
                    size="small"
                    fullWidth
                    value={formData.toneEnergy}
                    onChange={(e) =>
                      handleFieldChange("toneEnergy", e.target.value)
                    }
                    onKeyPress={(e) => handleKeyPress(e, "number-minus")}
                    inputProps={{
                      style: { fontSize: 13, padding: "6px 8px" },
                      maxLength: 20,
                    }}
                  />
                </FieldRow>

                <FieldRow label="Ringing Scheme Setting">
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <Checkbox
                      checked={formData.ringingSchemeEnabled}
                      onChange={(e) =>
                        handleCheckboxChange(
                          "ringingSchemeEnabled",
                          e.target.checked,
                        )
                      }
                      size="small"
                      sx={{
                        padding: "2px",
                        color: C.accent,
                        "&.Mui-checked": { color: C.accent },
                      }}
                    />
                    <span
                      style={{
                        fontSize: 13,
                        color: C.valueText,
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        handleCheckboxChange(
                          "ringingSchemeEnabled",
                          !formData.ringingSchemeEnabled,
                        )
                      }
                    >
                      Enable
                    </span>
                  </div>
                </FieldRow>

                {formData.ringingSchemeEnabled && (
                  <FieldRow label="Ringing Mode">
                    <TextField
                      size="small"
                      fullWidth
                      value={formData.ringMode}
                      onChange={(e) =>
                        handleFieldChange("ringMode", e.target.value)
                      }
                      onKeyPress={(e) =>
                        handleKeyPress(e, "number-comma-minus")
                      }
                      inputProps={{
                        style: { fontSize: 13, padding: "6px 8px" },
                        maxLength: 128,
                      }}
                    />
                  </FieldRow>
                )}

                <FieldRow label="Hook-flash Detection">
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <Checkbox
                      checked={formData.hookFlashDetection}
                      onChange={(e) =>
                        handleCheckboxChange(
                          "hookFlashDetection",
                          e.target.checked,
                        )
                      }
                      size="small"
                      sx={{
                        padding: "2px",
                        color: C.accent,
                        "&.Mui-checked": { color: C.accent },
                      }}
                    />
                    <span
                      style={{
                        fontSize: 13,
                        color: C.valueText,
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        handleCheckboxChange(
                          "hookFlashDetection",
                          !formData.hookFlashDetection,
                        )
                      }
                    >
                      Enable
                    </span>
                  </div>
                </FieldRow>

                {!formData.hookFlashDetection && (
                  <FieldRow label="Minimum Time Length of On-hook Detection (ms)">
                    <TextField
                      size="small"
                      fullWidth
                      value={formData.minHangupTime}
                      onChange={(e) =>
                        handleFieldChange("minHangupTime", e.target.value)
                      }
                      onKeyPress={(e) => handleKeyPress(e, "number")}
                      inputProps={{
                        style: { fontSize: 13, padding: "6px 8px" },
                        maxLength: 5,
                      }}
                    />
                  </FieldRow>
                )}

                {formData.hookFlashDetection && (
                  <>
                    <FieldRow label="Minimum Time (ms)">
                      <TextField
                        size="small"
                        fullWidth
                        value={formData.hookFlashMinTime}
                        onChange={(e) =>
                          handleFieldChange("hookFlashMinTime", e.target.value)
                        }
                        onKeyPress={(e) => handleKeyPress(e, "number")}
                        inputProps={{
                          style: { fontSize: 13, padding: "6px 8px" },
                          maxLength: 5,
                        }}
                      />
                    </FieldRow>
                    <FieldRow label="Maximum Time (ms)">
                      <TextField
                        size="small"
                        fullWidth
                        value={formData.hookFlashMaxTime}
                        onChange={(e) =>
                          handleFieldChange("hookFlashMaxTime", e.target.value)
                        }
                        onKeyPress={(e) => handleKeyPress(e, "number")}
                        inputProps={{
                          style: { fontSize: 13, padding: "6px 8px" },
                          maxLength: 5,
                        }}
                      />
                    </FieldRow>
                  </>
                )}

                <FieldRow label="Preferred 18x Response (NO valid P_Early_Media)">
                  <FormControl size="small" fullWidth>
                    <MuiSelect
                      value={formData.preferred18xResponse}
                      onChange={(e) =>
                        handleFieldChange(
                          "preferred18xResponse",
                          e.target.value,
                        )
                      }
                      sx={{ fontSize: 13 }}
                    >
                      <MenuItem value="0" sx={{ fontSize: 13 }}>
                        IMS Ringback
                      </MenuItem>
                      <MenuItem value="1" sx={{ fontSize: 13 }}>
                        Local Ringback
                      </MenuItem>
                    </MuiSelect>
                  </FormControl>
                </FieldRow>
              </div>

              {/* ── RIGHT COLUMN ── */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <FieldRow label="Enable Press-Key Call-Forward">
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <Checkbox
                      checked={formData.pressKeyCallForward}
                      onChange={(e) =>
                        handleCheckboxChange(
                          "pressKeyCallForward",
                          e.target.checked,
                        )
                      }
                      size="small"
                      sx={{
                        padding: "2px",
                        color: C.accent,
                        "&.Mui-checked": { color: C.accent },
                      }}
                    />
                    <span
                      style={{
                        fontSize: 13,
                        color: C.valueText,
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        handleCheckboxChange(
                          "pressKeyCallForward",
                          !formData.pressKeyCallForward,
                        )
                      }
                    >
                      Enable
                    </span>
                  </div>
                </FieldRow>

                {formData.pressKeyCallForward && (
                  <>
                    <FieldRow label="Call-Forward Key">
                      <FormControl size="small" fullWidth>
                        <MuiSelect
                          value={formData.callForwardKey}
                          onChange={(e) =>
                            handleFieldChange("callForwardKey", e.target.value)
                          }
                          sx={{ fontSize: 13 }}
                        >
                          <MenuItem value="35" sx={{ fontSize: 13 }}>
                            #
                          </MenuItem>
                          <MenuItem value="42" sx={{ fontSize: 13 }}>
                            *
                          </MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="Call-Forward Method">
                      <FormControl size="small" fullWidth>
                        <MuiSelect
                          value={formData.callForwardMethod}
                          onChange={(e) =>
                            handleFieldChange(
                              "callForwardMethod",
                              e.target.value,
                            )
                          }
                          sx={{ fontSize: 13 }}
                        >
                          <MenuItem value="0" sx={{ fontSize: 13 }}>
                            Call Forward with Negotiation
                          </MenuItem>
                          <MenuItem value="1" sx={{ fontSize: 13 }}>
                            Blind Transfer
                          </MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                  </>
                )}

                <FieldRow label="CID Transmit Mode">
                  <FormControl size="small" fullWidth>
                    <MuiSelect
                      value={formData.cidTransmitMode}
                      onChange={(e) =>
                        handleFieldChange("cidTransmitMode", e.target.value)
                      }
                      sx={{ fontSize: 13 }}
                    >
                      <MenuItem value="0" sx={{ fontSize: 13 }}>
                        DTMF
                      </MenuItem>
                      <MenuItem value="1" sx={{ fontSize: 13 }}>
                        FSK
                      </MenuItem>
                    </MuiSelect>
                  </FormControl>
                </FieldRow>

                {formData.cidTransmitMode === "1" && (
                  <FieldRow label="Occasion to Send FSK CallerID">
                    <FormControl size="small" fullWidth>
                      <MuiSelect
                        value={formData.occasionToSendFSKCallerID}
                        onChange={(e) =>
                          handleFieldChange(
                            "occasionToSendFSKCallerID",
                            e.target.value,
                          )
                        }
                        sx={{ fontSize: 13 }}
                      >
                        <MenuItem value="0" sx={{ fontSize: 13 }}>
                          Before ring
                        </MenuItem>
                        <MenuItem value="1" sx={{ fontSize: 13 }}>
                          After the first ring
                        </MenuItem>
                      </MuiSelect>
                    </FormControl>
                  </FieldRow>
                )}

                <FieldRow label="Send Polarity Reversal Signal">
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <Checkbox
                      checked={formData.sendPolarityReversal}
                      onChange={(e) =>
                        handleCheckboxChange(
                          "sendPolarityReversal",
                          e.target.checked,
                        )
                      }
                      size="small"
                      sx={{
                        padding: "2px",
                        color: C.accent,
                        "&.Mui-checked": { color: C.accent },
                      }}
                    />
                    <span
                      style={{
                        fontSize: 13,
                        color: C.valueText,
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        handleCheckboxChange(
                          "sendPolarityReversal",
                          !formData.sendPolarityReversal,
                        )
                      }
                    >
                      Enable
                    </span>
                  </div>
                </FieldRow>

                <FieldRow label="Off-hook Dither Signal Duration (ms)">
                  <TextField
                    size="small"
                    fullWidth
                    value={formData.offHookDitherSignalDuration}
                    onChange={(e) =>
                      handleFieldChange(
                        "offHookDitherSignalDuration",
                        e.target.value,
                      )
                    }
                    onKeyPress={(e) => handleKeyPress(e, "number")}
                    inputProps={{
                      style: { fontSize: 13, padding: "6px 8px" },
                      maxLength: 5,
                    }}
                  />
                </FieldRow>

                <FieldRow label="Handling of Call from Internal Station">
                  <FormControl size="small" fullWidth>
                    <MuiSelect
                      value={formData.handlingOfCallFromInternalStation}
                      onChange={(e) =>
                        handleFieldChange(
                          "handlingOfCallFromInternalStation",
                          e.target.value,
                        )
                      }
                      sx={{ fontSize: 13 }}
                    >
                      <MenuItem value="0" sx={{ fontSize: 13 }}>
                        Internal Handling
                      </MenuItem>
                      <MenuItem value="1" sx={{ fontSize: 13 }}>
                        Platform Handling
                      </MenuItem>
                    </MuiSelect>
                  </FormControl>
                </FieldRow>

                <FieldRow label="Light Up Mode for Voice Message">
                  <FormControl size="small" fullWidth>
                    <MuiSelect
                      value={formData.lightUpModeForVoiceMessage}
                      onChange={(e) =>
                        handleFieldChange(
                          "lightUpModeForVoiceMessage",
                          e.target.value,
                        )
                      }
                      sx={{ fontSize: 13 }}
                    >
                      <MenuItem value="0" sx={{ fontSize: 13 }}>
                        Not Light Up
                      </MenuItem>
                      <MenuItem value="1" sx={{ fontSize: 13 }}>
                        FSK Light Up
                      </MenuItem>
                    </MuiSelect>
                  </FormControl>
                </FieldRow>

                <FieldRow label="Open Session In Advance">
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <Checkbox
                      checked={formData.openSessionInAdvance}
                      onChange={(e) =>
                        handleCheckboxChange(
                          "openSessionInAdvance",
                          e.target.checked,
                        )
                      }
                      size="small"
                      sx={{
                        padding: "2px",
                        color: C.accent,
                        "&.Mui-checked": { color: C.accent },
                      }}
                    />
                    <span
                      style={{
                        fontSize: 13,
                        color: C.valueText,
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        handleCheckboxChange(
                          "openSessionInAdvance",
                          !formData.openSessionInAdvance,
                        )
                      }
                    >
                      Enable
                    </span>
                  </div>
                </FieldRow>

                <FieldRow label="Report FXS Status">
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <Checkbox
                      checked={formData.reportFXSStatus}
                      onChange={(e) =>
                        handleCheckboxChange(
                          "reportFXSStatus",
                          e.target.checked,
                        )
                      }
                      size="small"
                      sx={{
                        padding: "2px",
                        color: C.accent,
                        "&.Mui-checked": { color: C.accent },
                      }}
                    />
                    <span
                      style={{
                        fontSize: 13,
                        color: C.valueText,
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        handleCheckboxChange(
                          "reportFXSStatus",
                          !formData.reportFXSStatus,
                        )
                      }
                    >
                      Enable
                    </span>
                  </div>
                </FieldRow>

                <FieldRow label="Enable Send DTMF while receiving 183">
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <Checkbox
                      checked={formData.enableSendDTMFWhileReceiving183}
                      onChange={(e) =>
                        handleCheckboxChange(
                          "enableSendDTMFWhileReceiving183",
                          e.target.checked,
                        )
                      }
                      size="small"
                      sx={{
                        padding: "2px",
                        color: C.accent,
                        "&.Mui-checked": { color: C.accent },
                      }}
                    />
                    <span
                      style={{
                        fontSize: 13,
                        color: C.valueText,
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        handleCheckboxChange(
                          "enableSendDTMFWhileReceiving183",
                          !formData.enableSendDTMFWhileReceiving183,
                        )
                      }
                    >
                      Enable
                    </span>
                  </div>
                </FieldRow>
              </div>
            </div>
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
                background: "#1e2d42",
                color: "#fff",
                fontWeight: 600,
                fontSize: 13,
                textTransform: "none",
                padding: "6px 32px",
                minWidth: 120,
                "&:hover": { background: "#0f172a" },
              }}
            >
              Save Settings
            </Button>
            <Button
              variant="outlined"
              onClick={handleReset}
              sx={{
                color: "#1e293b",
                borderColor: "#9ca3af",
                fontWeight: 600,
                fontSize: 13,
                textTransform: "none",
                padding: "6px 32px",
                minWidth: 100,
                "&:hover": { borderColor: "#1e293b", background: "#f1f5f9" },
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

export default FxsPage;
