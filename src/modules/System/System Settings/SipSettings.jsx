import React from "react";
import {
  Alert,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
  SIP_SETTINGS_BTN_UPLOAD_CONFIRM,
  SIP_SETTINGS_BTN_UPLOADING,
  SIP_SETTINGS_BTN_DOWNLOAD,
  SIP_SETTINGS_BTN_DOWNLOADING,
  SIP_SETTINGS_BTN_CANCEL,
  SIP_SETTINGS_CARD_TITLE,
  SIP_SETTINGS_LABEL_CERTIFICATE,
  SIP_SETTINGS_LABEL_ENABLE,
  SIP_SETTINGS_LABEL_PRIVATE_KEY,
  SIP_SETTINGS_LOADING_TEXT,
  SIP_SETTINGS_MODAL_UPLOAD_TITLE,
  SIP_SETTINGS_PAGE_BREADCRUMB_ROOT,
  SIP_SETTINGS_PAGE_BREADCRUMB_SECTION,
  SIP_SETTINGS_PAGE_TITLE,
  SIP_SETTINGS_SECTION_CERTIFICATE,
  SIP_SETTINGS_SECTION_TLS,
  SIP_SETTINGS_SECTION_WEBRTC,
  SIP_SETTINGS_TLS_VERSION_OPTIONS,
  SIP_SETTINGS_YES_NO_OPTIONS,
} from "../../../constants/SipSettingsConstants";
import { Btn, ExtensionBreadcrumb } from "../../../components/common";
import { C } from "../../../theme/pbxTokens";
import { useSipSettingsPage } from "./hooks/useSipSettingsPage";
import { getLocalIpDisplayLabel } from "./utils/localIpOptionsUtils";
import {
  sipSettingsPageWrapStyle,
  sipSettingsPageInnerStyle,
  sipSettingsCancelBtnStyle,
  sipSettingsFormBtnStyle,
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
  sipSettingsFormOuterStyle,
  SipSettingsFilePicker,
  sipSettingsHeaderStyle,
  SipSettingsSectionHeading,
  SipSettingsSectionEnableRow,
  SipSettingsFieldLabel,
  SipSettingsFieldRow,
  sipSettingsCertUploadActionsStyle,
  sipSettingsFieldControlStyle,
  sipSettingsFieldRowStyle,
  sipSettingsModalFooterStyle,
  sipSettingsValueColStyle,
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
    uploadModalOpen,
    message,
    certFile,
    keyFile,
    setMessage,
    setCertFile,
    setKeyFile,
    openUploadModal,
    closeUploadModal,
    handleChange,
    handleToggle,
    handleReset,
    handleSave,
    handleUploadCertificate,
    handleDownloadCertificate,
  } = useSipSettingsPage();

  const tlsDisabled = !form.enableTls;
  const webrtcDisabled = !form.enableWebrtc;
  const requireClientCertDisabled =
    tlsDisabled || form.verifyClient !== "yes";

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

                      <SipSettingsFieldRow
                        label="Verify Client"
                        tooltipKey="verifyClient"
                        isCompact={isCompact}
                        labelColWidth={labelColWidth}
                      >
                        <Select
                          size="small"
                          value={form.verifyClient}
                          disabled={tlsDisabled}
                          onChange={(e) =>
                            handleChange("verifyClient", e.target.value)
                          }
                          sx={sipSettingsSelectSx}
                        >
                          {SIP_SETTINGS_YES_NO_OPTIONS.map((opt) => (
                            <MenuItem
                              key={opt.value}
                              value={opt.value}
                              sx={{ fontSize: 13, color: C.valueText }}
                            >
                              {opt.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </SipSettingsFieldRow>

                      <SipSettingsFieldRow
                        label="Require Client Cert"
                        tooltipKey="requireClientCert"
                        isCompact={isCompact}
                        labelColWidth={labelColWidth}
                      >
                        <Select
                          size="small"
                          value={form.requireClientCert}
                          disabled={requireClientCertDisabled}
                          onChange={(e) =>
                            handleChange("requireClientCert", e.target.value)
                          }
                          sx={sipSettingsSelectSx}
                        >
                          {SIP_SETTINGS_YES_NO_OPTIONS.map((opt) => (
                            <MenuItem
                              key={opt.value}
                              value={opt.value}
                              sx={{ fontSize: 13, color: C.valueText }}
                            >
                              {opt.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </SipSettingsFieldRow>

                      <SipSettingsFieldRow
                        label="Bind Address"
                        tooltipKey="tlsBindAddress"
                        isCompact={isCompact}
                        labelColWidth={labelColWidth}
                      >
                        <Select
                          size="small"
                          value={form.tlsBindAddress || ""}
                          disabled={tlsDisabled}
                          displayEmpty
                          onChange={(e) =>
                            handleChange("tlsBindAddress", e.target.value)
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
                              key={`tls-${option.value}`}
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

                    <SipSettingsSectionHeading
                      title={SIP_SETTINGS_SECTION_CERTIFICATE}
                    />
                    <div style={sipSettingsFieldGroupStyle}>
                      <div style={sipSettingsFieldRowStyle(isCompact)}>
                        <SipSettingsFieldLabel
                          tooltipKey="certificate"
                          isCompact={isCompact}
                          labelColWidth={labelColWidth}
                        >
                          {SIP_SETTINGS_LABEL_CERTIFICATE}
                        </SipSettingsFieldLabel>
                        <div
                          style={
                            isCompact
                              ? { width: "100%" }
                              : sipSettingsValueColStyle
                          }
                        >
                          <div
                            style={{
                              ...sipSettingsFieldControlStyle,
                              overflow: "visible",
                            }}
                          >
                            <div style={sipSettingsCertUploadActionsStyle}>
                              <Btn
                                variant="primary"
                                onClick={openUploadModal}
                                disabled={uploading || downloading}
                                style={{
                                  ...sipSettingsFormBtnStyle,
                                  flexShrink: 0,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {SIP_SETTINGS_BTN_UPLOAD}
                              </Btn>
                              <Btn
                                variant="primary"
                                onClick={handleDownloadCertificate}
                                disabled={uploading || downloading}
                                style={{
                                  ...sipSettingsFormBtnStyle,
                                  flexShrink: 0,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {downloading
                                  ? SIP_SETTINGS_BTN_DOWNLOADING
                                  : SIP_SETTINGS_BTN_DOWNLOAD}
                              </Btn>
                            </div>
                          </div>
                        </div>
                      </div>
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

      <Dialog
        open={uploadModalOpen}
        onClose={() => {
          if (!uploading) closeUploadModal();
        }}
        maxWidth={false}
        slotProps={{
          backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.5)" } },
        }}
        PaperProps={{
          sx: {
            width: 560,
            maxWidth: "96vw",
            mx: "auto",
            p: 0,
            borderRadius: "4px",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          style={{
            background: "#1e2d42",
            color: "#ffffff",
            fontWeight: 600,
            fontSize: 16,
            padding: "16px 24px",
            textAlign: "center",
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
          }}
        >
          {SIP_SETTINGS_MODAL_UPLOAD_TITLE}
        </DialogTitle>
        <DialogContent style={{ padding: "24px", backgroundColor: "#ffffff" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              width: "100%",
              background: "#f8fafc",
              border: `1px solid ${C.cardBorder}`,
              borderRadius: 4,
              padding: 20,
            }}
          >
            <SipSettingsFilePicker
              label={SIP_SETTINGS_LABEL_CERTIFICATE}
              tooltipKey="certificate"
              accept=".crt,.cer,.pem"
              file={certFile}
              disabled={uploading}
              onChange={setCertFile}
              isCompact={false}
              labelColWidth={140}
            />
            <SipSettingsFilePicker
              label={SIP_SETTINGS_LABEL_PRIVATE_KEY}
              tooltipKey="privateKey"
              accept=".key,.pem"
              file={keyFile}
              disabled={uploading}
              onChange={setKeyFile}
              isCompact={false}
              labelColWidth={140}
            />
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 0, m: 0 }} style={sipSettingsModalFooterStyle}>
          <Btn
            variant="primary"
            onClick={handleUploadCertificate}
            disabled={uploading}
            style={sipSettingsFormBtnStyle}
          >
            {uploading
              ? SIP_SETTINGS_BTN_UPLOADING
              : SIP_SETTINGS_BTN_UPLOAD_CONFIRM}
          </Btn>
          <Btn
            variant="cancel"
            onClick={closeUploadModal}
            disabled={uploading}
            style={{
              ...sipSettingsCancelBtnStyle,
              minWidth: sipSettingsFormBtnStyle.minWidth || 100,
            }}
          >
            {SIP_SETTINGS_BTN_CANCEL}
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SipSettings;
