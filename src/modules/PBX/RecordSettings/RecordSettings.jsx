import React from "react";
import { Alert } from "@mui/material";
import { RECORD_SETTINGS_TITLE } from "../../../constants/RecordSettingsConstants";
import {
  Btn,
  ExtensionBreadcrumb as RecordSettingsBreadcrumb,
  extensionFixedAlertSx as recordSettingsFixedAlertSx,
  extensionPageWrapStyle as recordSettingsPageWrapStyle,
  extensionPageInnerStyle as recordSettingsPageInnerStyle,
  extensionCardStyle as recordSettingsCardStyle,
} from "../../../components/common";
import { useRecordSettingsPage } from "./hooks/useRecordSettingsPage";
import {
  RecordSettingsFormBody,
  recordSettingsFooterBtnStyle,
  recordSettingsFooterStyle,
  recordSettingsHeaderStyle,
} from "./components/RecordSettingsFormFields";

const RecordSettings = () => {
  const vm = useRecordSettingsPage();
  const {
    isCompact,
    form,
    loading,
    saving,
    message,
    setMessage,
    dualListConfig,
    handleChange,
    handleSave,
    handleReset,
  } = vm;

  return (
    <div
      style={{
        ...recordSettingsPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={recordSettingsPageInnerStyle}>
        {message.text && (
          <Alert
            severity={message.type || "info"}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={{
              ...recordSettingsFixedAlertSx,
              ...(isCompact
                ? {
                    left: 8,
                    right: 8,
                    top: 12,
                    minWidth: 0,
                    maxWidth: "none",
                    width: "calc(100% - 16px)",
                  }
                : {}),
            }}
          >
            {message.text}
          </Alert>
        )}

        <RecordSettingsBreadcrumb
          section={RECORD_SETTINGS_TITLE}
          current={RECORD_SETTINGS_TITLE}
        />

        <div style={recordSettingsCardStyle}>
          <div style={recordSettingsHeaderStyle}>
            <span>{RECORD_SETTINGS_TITLE}</span>
          </div>

          <div style={{ padding: "20px 20px 0", boxSizing: "border-box" }}>
            <RecordSettingsFormBody
              form={form}
              handleChange={handleChange}
              isCompact={isCompact}
              dualListConfig={dualListConfig}
            />
          </div>

          <div style={recordSettingsFooterStyle}>
            <Btn
              variant="primary"
              style={recordSettingsFooterBtnStyle}
              onClick={handleSave}
              disabled={loading || saving}
            >
              {saving ? "Saving..." : "Save"}
            </Btn>
            <Btn
              variant="cancel"
              style={recordSettingsFooterBtnStyle}
              onClick={handleReset}
              disabled={loading || saving}
            >
              Reset Defaults
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordSettings;
