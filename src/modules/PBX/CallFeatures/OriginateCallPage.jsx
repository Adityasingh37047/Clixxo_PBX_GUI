import React from "react";
import {
  Alert,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select as MuiSelect,
} from "@mui/material";
import {
  ORIGINATE_CALL_CONTEXT_OPTIONS,
  ORIGINATE_CALL_FORM_NOTE,
  ORIGINATE_CALL_MODE_OPTIONS,
  ORIGINATE_CALL_TITLE,
} from "../../../constants/OriginateCallConstants";
import {
  Btn,
  ExtensionBreadcrumb as OriginateCallBreadcrumb,
  extensionFixedAlertSx as originateCallFixedAlertSx,
  extensionPageWrapStyle as originateCallPageWrapStyle,
  extensionPageInnerStyle as originateCallPageInnerStyle,
  extensionCardStyle as originateCallCardStyle,
} from "../../../components/common";
import { useOriginateCallPage } from "./hooks/useOriginateCallPage";
import {
  OriginateCallFieldRow,
  OriginateCallFixedAppLabel,
  originateCallFieldInputStyle,
  originateCallFormBtnStyle,
  originateCallFormCheckboxSx,
  originateCallFormContentStyle,
  originateCallFormFooterStyle,
  originateCallFormInputInteraction,
  originateCallFormNoteStyle,
  originateCallFormSelectSx,
  originateCallHeaderStyle,
  originateCallRadioSx,
} from "./components/OriginateCallFormFields";
import { originateCallHeaderSubtitleStyle } from "./components/OriginateCallTableHelpers";

const OriginateCallPage = () => {
  const vm = useOriginateCallPage();
  const {
    isCompact,
    mode,
    setMode,
    extension,
    setExtension,
    name,
    setName,
    callerIdName,
    setCallerIdName,
    callerIdNumber,
    setCallerIdNumber,
    useFixedApp,
    setUseFixedApp,
    application,
    setApplication,
    appData,
    setAppData,
    context,
    setContext,
    exten,
    setExten,
    priority,
    setPriority,
    loading,
    message,
    setMessage,
    handleOriginate,
  } = vm;

  return (
    <div
      style={{
        ...originateCallPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={originateCallPageInnerStyle}>
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={originateCallFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <OriginateCallBreadcrumb
          section="Call Features"
          current={ORIGINATE_CALL_TITLE}
        />

        <div style={originateCallCardStyle}>
          <div style={originateCallHeaderStyle}>
            <span>
              AMI Originate
              <span style={originateCallHeaderSubtitleStyle}>
                (POST /api/ami — type: ami_originate)
              </span>
            </span>
          </div>

          <div style={{ padding: "24px 32px 0", boxSizing: "border-box" }}>
            <div style={originateCallFormContentStyle}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  paddingBottom: 16,
                }}
              >
                <OriginateCallFieldRow
                  label="Dial Extension"
                  tooltipKey="extension"
                  required
                >
                  <input
                    type="text"
                    value={extension}
                    onChange={(e) => setExtension(e.target.value)}
                    placeholder="e.g. 1004"
                    style={originateCallFieldInputStyle}
                    {...originateCallFormInputInteraction}
                  />
                </OriginateCallFieldRow>

                <OriginateCallFieldRow label="Name (label only)" tooltipKey="name">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Optional — not sent to API"
                    style={originateCallFieldInputStyle}
                    {...originateCallFormInputInteraction}
                  />
                </OriginateCallFieldRow>

                <OriginateCallFieldRow
                  label="Caller ID Name"
                  tooltipKey="callerIdName"
                >
                  <input
                    type="text"
                    value={callerIdName}
                    onChange={(e) => setCallerIdName(e.target.value)}
                    placeholder="e.g. Front Desk"
                    style={originateCallFieldInputStyle}
                    {...originateCallFormInputInteraction}
                  />
                </OriginateCallFieldRow>

                <OriginateCallFieldRow
                  label="Caller ID Number"
                  tooltipKey="callerIdNumber"
                >
                  <input
                    type="text"
                    value={callerIdNumber}
                    onChange={(e) => setCallerIdNumber(e.target.value)}
                    placeholder="e.g. 1000"
                    style={originateCallFieldInputStyle}
                    {...originateCallFormInputInteraction}
                  />
                </OriginateCallFieldRow>

                <OriginateCallFieldRow
                  label="Mode"
                  tooltipKey="mode"
                  required
                  align="flex-start"
                >
                  <RadioGroup
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                  >
                    {ORIGINATE_CALL_MODE_OPTIONS.map((opt) => (
                      <FormControlLabel
                        key={opt.value}
                        value={opt.value}
                        control={
                          <Radio size="small" sx={originateCallRadioSx} />
                        }
                        label={
                          <span style={{ fontSize: 13 }}>{opt.label}</span>
                        }
                        sx={{ m: 0 }}
                      />
                    ))}
                  </RadioGroup>
                </OriginateCallFieldRow>

                {mode === "simple" ? (
                  <>
                    <OriginateCallFieldRow hideLabel>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          width: "100%",
                        }}
                      >
                        <Checkbox
                          id="fixedApp"
                          checked={useFixedApp}
                          onChange={(e) => setUseFixedApp(e.target.checked)}
                          size="small"
                          sx={originateCallFormCheckboxSx}
                        />
                        <OriginateCallFixedAppLabel htmlFor="fixedApp">
                          Use fixed Application Wait + appData below
                          (recommended)
                        </OriginateCallFixedAppLabel>
                      </div>
                    </OriginateCallFieldRow>

                    {!useFixedApp && (
                      <OriginateCallFieldRow
                        label="Application"
                        tooltipKey="application"
                        required
                      >
                        <input
                          type="text"
                          value={application}
                          onChange={(e) => setApplication(e.target.value)}
                          placeholder="Wait"
                          style={originateCallFieldInputStyle}
                          {...originateCallFormInputInteraction}
                        />
                      </OriginateCallFieldRow>
                    )}

                    <OriginateCallFieldRow
                      label={useFixedApp ? "App Data (s)" : "Application Data"}
                      tooltipKey="appData"
                    >
                      <input
                        type="text"
                        value={appData}
                        onChange={(e) => setAppData(e.target.value)}
                        placeholder={useFixedApp ? "30" : "1"}
                        style={originateCallFieldInputStyle}
                        {...originateCallFormInputInteraction}
                      />
                    </OriginateCallFieldRow>
                  </>
                ) : (
                  <>
                    <OriginateCallFieldRow
                      label="Context"
                      tooltipKey="context"
                      required
                    >
                      <FormControl size="small" fullWidth>
                        <MuiSelect
                          value={context}
                          onChange={(e) => setContext(e.target.value)}
                          variant="outlined"
                          fullWidth
                          sx={originateCallFormSelectSx}
                        >
                          {ORIGINATE_CALL_CONTEXT_OPTIONS.map((ctx) => (
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
                    </OriginateCallFieldRow>

                    <OriginateCallFieldRow
                      label="Exten (B leg)"
                      tooltipKey="exten"
                      required
                    >
                      <input
                        type="text"
                        value={exten}
                        onChange={(e) => setExten(e.target.value)}
                        placeholder="e.g. 1005"
                        style={originateCallFieldInputStyle}
                        {...originateCallFormInputInteraction}
                      />
                    </OriginateCallFieldRow>

                    <OriginateCallFieldRow label="Priority" tooltipKey="priority">
                      <input
                        type="number"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        placeholder="1"
                        style={originateCallFieldInputStyle}
                        {...originateCallFormInputInteraction}
                      />
                    </OriginateCallFieldRow>
                  </>
                )}
              </div>
            </div>

            <p style={originateCallFormNoteStyle}>{ORIGINATE_CALL_FORM_NOTE}</p>
          </div>

          <div style={originateCallFormFooterStyle}>
            <Btn
              variant="primary"
              disabled={loading}
              onClick={handleOriginate}
              style={originateCallFormBtnStyle}
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
