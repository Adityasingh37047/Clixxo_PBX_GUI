import React from "react";
import { Alert, useMediaQuery } from "@mui/material";
import {
  IDS_PAGE_TITLE,
  IDS_TOAST_DEFAULT,
} from "../../../constants/IDSSettingsConstants";
import { useIDSSettingsPage } from "./hooks/useIDSSettingsPage";
import {
  IDS_COMPACT_MQ,
  IDSSettingsPageShell,
  IDSSettingsBreadcrumb,
  IDSConfigPanel,
  IDSWarningLogPanel,
  IDSLogNote,
  idsFixedAlertSx,
  idsTableContainerStyle,
  idsHeaderStyle,
  idsBodyStyle,
} from "./components/IDSSettingsFormFields";

const IDSSettings = () => {
  const vm = useIDSSettingsPage();
  const {
    form,
    log,
    toast,
    setToast,
    handleCheckbox,
    handleEnable,
    handleWarningThreshold,
    handleBlacklistThreshold,
    handleValidity,
    handleSave,
    handleReset,
    handleDownload,
  } = vm;
  const isCompact = useMediaQuery(IDS_COMPACT_MQ);

  return (
    <IDSSettingsPageShell isCompact={isCompact}>
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={() => setToast(IDS_TOAST_DEFAULT)}
          sx={{
            ...idsFixedAlertSx,
            ...(isCompact
              ? { left: 8, right: 8, top: 12, minWidth: 0, maxWidth: "none" }
              : {}),
          }}
        >
          {toast.msg}
        </Alert>
      )}

      <IDSSettingsBreadcrumb />

      <div style={idsTableContainerStyle}>
        <div style={idsHeaderStyle}>
          <span>{IDS_PAGE_TITLE}</span>
        </div>

        <div style={idsBodyStyle}>
          <IDSConfigPanel
            form={form}
            isCompact={isCompact}
            onEnable={handleEnable}
            onCheckbox={handleCheckbox}
            onWarningThreshold={handleWarningThreshold}
            onBlacklistThreshold={handleBlacklistThreshold}
            onValidity={handleValidity}
            onReset={handleReset}
            onSave={handleSave}
          />

          <IDSWarningLogPanel log={log} onDownload={handleDownload} />
        </div>
      </div>

      <IDSLogNote isCompact={isCompact} />
    </IDSSettingsPageShell>
  );
};

export default IDSSettings;
