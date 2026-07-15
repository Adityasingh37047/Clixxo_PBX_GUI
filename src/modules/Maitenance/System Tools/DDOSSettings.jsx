import React from "react";
import { Alert, useMediaQuery } from "@mui/material";
import {
  DDOS_PAGE_TITLE,
  DDOS_MESSAGE_DEFAULT,
} from "../../../constants/DDOSSettingsConstants";
import { useDDOSSettingsPage } from "./hooks/useDDOSSettingsPage";
import {
  DDOS_COMPACT_MQ,
  DDOS_GRID_TWO_COL_MQ,
  DDOSSettingsPageShell,
  DDOSSettingsBreadcrumb,
  DDOSConfigPanel,
  DDOSInfoLogPanel,
  ddosFixedAlertSx,
  ddosTableContainerStyle,
  ddosHeaderStyle,
  ddosBodyStyle,
} from "./components/DDOSSettingsFormFields";

const DDOSSettings = () => {
  const vm = useDDOSSettingsPage();
  const {
    form,
    log,
    loading,
    message,
    setMessage,
    handleChange,
    handleSave,
    handleReset,
    handleSimulateAttack,
    handleClearLogs,
  } = vm;
  const isCompact = useMediaQuery(DDOS_COMPACT_MQ);
  const isGridTwoCol = useMediaQuery(DDOS_GRID_TWO_COL_MQ);

  return (
    <DDOSSettingsPageShell isCompact={isCompact}>
      {message.text && (
        <Alert
          severity={message.type}
          onClose={() => setMessage(DDOS_MESSAGE_DEFAULT)}
          sx={{
            ...ddosFixedAlertSx,
            ...(isCompact
              ? { left: 8, right: 8, top: 12, minWidth: 0, maxWidth: "none" }
              : {}),
          }}
        >
          {message.text}
        </Alert>
      )}

      <DDOSSettingsBreadcrumb />

      <div style={ddosTableContainerStyle}>
        <div style={ddosHeaderStyle}>
          <span>{DDOS_PAGE_TITLE}</span>
        </div>

        <div style={ddosBodyStyle}>
          <DDOSConfigPanel
            form={form}
            isCompact={isCompact}
            isGridTwoCol={isGridTwoCol}
            loading={loading}
            onChange={handleChange}
            onReset={handleReset}
            onSave={handleSave}
            onSimulate={handleSimulateAttack}
          />

          <DDOSInfoLogPanel
            log={log}
            loading={loading}
            onClearLogs={handleClearLogs}
          />
        </div>
      </div>
    </DDOSSettingsPageShell>
  );
};

export default DDOSSettings;
