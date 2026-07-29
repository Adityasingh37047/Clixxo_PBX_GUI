import React from "react";
import {
  Alert,
  CircularProgress,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  SIP_SETTINGS_BTN_RESET,
  SIP_SETTINGS_BTN_SAVE,
  SIP_SETTINGS_BTN_SAVING,
  SIP_SETTINGS_BTN_UPLOAD,
  SIP_SETTINGS_BTN_UPLOADING,
  SIP_SETTINGS_BTN_DOWNLOAD,
  SIP_SETTINGS_BTN_DOWNLOADING,
  SIP_SETTINGS_CARD_TITLE,
  SIP_SETTINGS_LABEL_CERTIFICATE,
  SIP_SETTINGS_LABEL_ENABLE,
  SIP_SETTINGS_LABEL_PRIVATE_KEY,
  SIP_SETTINGS_LOADING_TEXT,
  SIP_SETTINGS_PAGE_BREADCRUMB_ROOT,
  SIP_SETTINGS_PAGE_BREADCRUMB_SECTION,
  SIP_SETTINGS_PAGE_TITLE,
  SIP_SETTINGS_SECTION_CERTIFICATE,
  SIP_SETTINGS_SECTION_TLS,
  SIP_SETTINGS_SECTION_WEBRTC,
  SIP_SETTINGS_TLS_VERSION_OPTIONS,
} from "../../../constants/SipSettingsConstants";
import { Btn, ExtensionBreadcrumb } from "../../../components/common";
import { C } from "../../../theme/pbxTokens";
import { useSipSettingsPage } from "./hooks/useSipSettingsPage";
import { getLocalIpDisplayLabel } from "./utils/localIpOptionsUtils";
import {
  sipSettingsPageWrapStyle,
  sipSettingsPageInnerStyle,
  sipSettingsFixedAlertSx,
} from "./components/SipSettingsTableHelpers";
import {
  SIP_SETTINGS_COMPACT_MQ,
  SIP_SETTINGS_LABEL_WIDTH,
  sipSettingsBindAddressSelectSx,
  sipSettingsDashboardColumnStyle,
  sipSettingsDashboardDividerCellStyle,
  sipSettingsDashboardDividerLineStyle,
  sipSettingsDashboardFieldsStackStyle,
  sipSettingsDashboardGridStyle,
  sipSettingsFieldGroupStyle,
  sipSettingsFooterStyle,
  sipSettingsFormBtnStyle,
  sipSettingsFormOuterStyle,
  SipSettingsFilePicker,
  sipSettingsHeaderStyle,
  SipSettingsSectionHeading,
  SipSettingsSectionEnableRow,
  SipSettingsFieldRow,
  sipSettingsSelectSx,
  sipSettingsTableContainerStyle,
  sipSettingsTextFieldSx,
} from "./components/SipSettingsFormFields";

const SipSettings = () => {
  const isCompact = useMediaQuery(SIP_SETTINGS_COMPACT_MQ);
  const labelColWidth = isCompact ? 160 : SIP_SETTINGS_LABEL_WIDTH;
  const {
    form,
    bindAddressOptions,
    loading,
    saving,
    uploading,
    downloading,
    message,
    certFile,
    keyFile,
    setMessage,
    setCertFile,
    setKeyFile,
    handleChange,
    handleToggle,
    handleReset,
    handleSave,
    handleUploadCertificate,
    handleDownloadCertificate,
  } = useSipSettingsPage();

  const tlsDisabled = !form.enableTls;
  const webrtcDisabled = !form.enableWebrtc;

  return (
    <div
      style={{
        ...sipSettingsPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
      data-native-scroll
    >
      <div style={sipSettingsPageInnerStyle}>
        {message.text && (
          <Alert
            severity={message.type === "error" ? "error" : "success"}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={sipSettingsFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <ExtensionBreadcrumb
          root={SIP_SETTINGS_PAGE_BREADCRUMB_ROOT}
          section={SIP_SETTINGS_PAGE_BREADCRUMB_SECTION}
          current={SIP_SETTINGS_PAGE_TITLE}
        />

        <div style={sipSettingsTableContainerStyle}>
          <div style={sipSettingsHeaderStyle}>
            <span>{SIP_SETTINGS_CARD_TITLE}</span>
          </div>

          <div style={sipSettingsFormOuterStyle}>
            {loading ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  padding: "48px 16px",
                  color: C.mutedText,
                  fontSize: 13,
                }}
              >
                <CircularProgress size={22} sx={{ color: C.accent }} />
                {SIP_SETTINGS_LOADING_TEXT}
              </div>
            ) : (
              <div
                className="settings-dashboard-grid"
                style={sipSettingsDashboardGridStyle(isCompact)}
              >
                <div style={sipSettingsDashboardColumnStyle(isCompact)}>
                  <div style={sipSettingsDashboardFieldsStackStyle}>
                    <SipSettingsSectionHeading
                      title={SIP_SETTINGS_SECTION_TLS}
                      isFirst
                    />
                    <div style={sipSettingsFieldGroupStyle}>
                      <SipSettingsSectionEnableRow
                        label={SIP_SETTINGS_LABEL_ENABLE}
                        tooltipKey="enableTls"
                        checked={form.enableTls}
                        onChange={() => handleToggle("enableTls")}
                        isCompact={isCompact}
                        labelColWidth={labelColWidth}
                      />

                      <SipSettingsFieldRow
                        label="TLS SIP Port"
                        tooltipKey="tlsSipPort"
                        isCompact={isCompact}
                        labelColWidth={labelColWidth}
                      >
                        <TextField
                          size="small"
                          value={form.tlsSipPort}
                          disabled={tlsDisabled}
                          onChange={(e) =>
                            handleChange("tlsSipPort", e.target.value)
                          }
                          sx={sipSettingsTextFieldSx}
                        />
                      </SipSettingsFieldRow>

                      <SipSettingsFieldRow
                        label="TLS Version"
                        tooltipKey="tlsVersion"
                        isCompact={isCompact}
                        labelColWidth={labelColWidth}
                      >
                        <Select
                          size="small"
                          value={form.tlsVersion}
                          disabled={tlsDisabled}
                          onChange={(e) =>
                            handleChange("tlsVersion", e.target.value)
                          }
                          sx={sipSettingsSelectSx}
                        >
                          {SIP_SETTINGS_TLS_VERSION_OPTIONS.map((opt) => (
                            <MenuItem
                              key={opt}
                              value={opt}
                              sx={{ fontSize: 13, color: C.valueText }}
                            >
                              {opt}
                            </MenuItem>
                          ))}
                        </Select>
                      </SipSettingsFieldRow>
                    </div>

                    <SipSettingsSectionHeading
                      title={SIP_SETTINGS_SECTION_CERTIFICATE}
                    />
                    <div style={sipSettingsFieldGroupStyle}>
                      <SipSettingsFilePicker
                        label={SIP_SETTINGS_LABEL_CERTIFICATE}
                        accept=".crt,.cer,.pem"
                        file={certFile}
                        disabled={uploading}
                        onChange={setCertFile}
                        isCompact={isCompact}
                        labelColWidth={labelColWidth}
                      />
                      <SipSettingsFilePicker
                        label={SIP_SETTINGS_LABEL_PRIVATE_KEY}
                        accept=".key,.pem"
                        file={keyFile}
                        disabled={uploading}
                        onChange={setKeyFile}
                        isCompact={isCompact}
                        labelColWidth={labelColWidth}
                      />
                      <SipSettingsFieldRow
                        label=""
                        isCompact={isCompact}
                        labelColWidth={labelColWidth}
                        wideControl
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: 8,
                            width: "max-content",
                            maxWidth: "100%",
                          }}
                        >
                          <Btn
                            variant="primary"
                            onClick={handleUploadCertificate}
                            disabled={uploading || downloading}
                            style={sipSettingsFormBtnStyle}
                          >
                            {uploading
                              ? SIP_SETTINGS_BTN_UPLOADING
                              : SIP_SETTINGS_BTN_UPLOAD}
                          </Btn>
                          <Btn
                            variant="primary"
                            onClick={handleDownloadCertificate}
                            disabled={uploading || downloading}
                            style={sipSettingsFormBtnStyle}
                          >
                            {downloading
                              ? SIP_SETTINGS_BTN_DOWNLOADING
                              : SIP_SETTINGS_BTN_DOWNLOAD}
                          </Btn>
                        </div>
                      </SipSettingsFieldRow>
                    </div>
                  </div>
                </div>

                {!isCompact && (
                  <div
                    className="settings-dashboard-divider"
                    style={sipSettingsDashboardDividerCellStyle}
                    aria-hidden="true"
                  >
                    <div style={sipSettingsDashboardDividerLineStyle} />
                  </div>
                )}

                <div style={sipSettingsDashboardColumnStyle(isCompact)}>
                  <div style={sipSettingsDashboardFieldsStackStyle}>
                    <SipSettingsSectionHeading
                      title={SIP_SETTINGS_SECTION_WEBRTC}
                      isFirst
                    />
                    <div style={sipSettingsFieldGroupStyle}>
                      <SipSettingsSectionEnableRow
                        label={SIP_SETTINGS_LABEL_ENABLE}
                        tooltipKey="enableWebrtc"
                        checked={form.enableWebrtc}
                        onChange={() => handleToggle("enableWebrtc")}
                        isCompact={isCompact}
                        labelColWidth={labelColWidth}
                      />

                      <SipSettingsFieldRow
                        label="WS Port"
                        tooltipKey="wsPort"
                        isCompact={isCompact}
                        labelColWidth={labelColWidth}
                      >
                        <TextField
                          size="small"
                          value={form.wsPort}
                          disabled={webrtcDisabled}
                          onChange={(e) =>
                            handleChange("wsPort", e.target.value)
                          }
                          sx={sipSettingsTextFieldSx}
                        />
                      </SipSettingsFieldRow>

                      <SipSettingsFieldRow
                        label="WSS Port"
                        tooltipKey="wssPort"
                        isCompact={isCompact}
                        labelColWidth={labelColWidth}
                      >
                        <TextField
                          size="small"
                          value={form.wssPort}
                          disabled={webrtcDisabled}
                          onChange={(e) =>
                            handleChange("wssPort", e.target.value)
                          }
                          sx={sipSettingsTextFieldSx}
                        />
                      </SipSettingsFieldRow>

                      <SipSettingsFieldRow
                        label="Bind Address"
                        tooltipKey="bindAddress"
                        isCompact={isCompact}
                        labelColWidth={labelColWidth}
                      >
                        <Select
                          size="small"
                          value={form.bindAddress || ""}
                          disabled={webrtcDisabled}
                          displayEmpty
                          onChange={(e) =>
                            handleChange("bindAddress", e.target.value)
                          }
                          renderValue={(selected) =>
                            getLocalIpDisplayLabel(
                              bindAddressOptions.find(
                                (option) => option.value === selected,
                              ),
                              selected,
                            )
                          }
                          sx={sipSettingsBindAddressSelectSx}
                          MenuProps={{
                            PaperProps: {
                              sx: { maxWidth: 360 },
                            },
                          }}
                        >
                          {bindAddressOptions.map((option) => (
                            <MenuItem
                              key={option.value}
                              value={option.value}
                              disabled={option.disabled}
                              title={option.title || option.label}
                              sx={{
                                fontSize: 13,
                                maxWidth: 360,
                                color: C.valueText,
                              }}
                            >
                              {option.title ? (
                                <div style={{ minWidth: 0, width: "100%" }}>
                                  <div>
                                    {option.shortLabel || option.label}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: 11,
                                      color: C.mutedText,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {option.value}
                                  </div>
                                </div>
                              ) : (
                                option.label
                              )}
                            </MenuItem>
                          ))}
                        </Select>
                      </SipSettingsFieldRow>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {!loading && (
            <div
              style={{
                ...sipSettingsFooterStyle,
                ...(isCompact ? { padding: "10px 12px" } : {}),
              }}
            >
              <Btn
                variant="primary"
                onClick={handleSave}
                disabled={saving}
                style={sipSettingsFormBtnStyle}
              >
                {saving ? SIP_SETTINGS_BTN_SAVING : SIP_SETTINGS_BTN_SAVE}
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleReset}
                disabled={saving}
                style={sipSettingsFormBtnStyle}
              >
                {SIP_SETTINGS_BTN_RESET}
              </Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SipSettings;
