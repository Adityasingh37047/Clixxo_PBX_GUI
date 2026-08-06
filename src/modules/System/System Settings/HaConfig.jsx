import React, { useEffect } from "react";
import {
  Alert,
  CircularProgress,
  MenuItem,
  Select,
  TextField,
  Checkbox,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  HA_CONFIG_BTN_RESET,
  HA_CONFIG_BTN_SAVE,
  HA_CONFIG_BTN_SAVING,
  HA_CONFIG_CARD_TITLE,
  HA_CONFIG_INTERFACE_PLACEHOLDER,
  HA_CONFIG_LABEL_AUTO_FAILBACK,
  HA_CONFIG_LABEL_HA_ENABLED,
  HA_CONFIG_LABEL_INTERFACE,
  HA_CONFIG_LABEL_MODE,
  HA_CONFIG_LABEL_PEER_SERVER_IP,
  HA_CONFIG_LABEL_VIRTUAL_IP,
  HA_CONFIG_LOADING_TEXT,
  HA_CONFIG_MODE_OPTIONS,
  HA_CONFIG_PAGE_BREADCRUMB_ROOT,
  HA_CONFIG_PAGE_BREADCRUMB_SECTION,
  HA_CONFIG_PAGE_TITLE,
  HA_CONFIG_FIELD_TOOLTIPS,
  HA_CONFIG_SECTION_CONFIG,
  HA_CONFIG_SECTION_STATUS,
} from "../../../constants/HaConfigConstants";
import {
  Btn,
  ExtensionBreadcrumb as HaConfigBreadcrumb,
  extensionPageWrapStyle as haConfigPageWrapStyle,
  extensionPageInnerStyle as haConfigPageInnerStyle,
  extensionFixedAlertSx as haConfigFixedAlertSx,
  extensionTableCheckboxSx as haConfigCheckboxSx,
} from "../../../components/common";
import { C } from "../../../theme/pbxTokens";
import { useHaConfigPage } from "./hooks/useHaConfigPage";
import { useHaStatusPage } from "./hooks/useHaStatusPage";
import { getLocalIpDisplayLabel } from "./utils/localIpOptionsUtils";
import {
  SIP_SETTINGS_COMPACT_MQ as HA_CONFIG_COMPACT_MQ,
  SIP_SETTINGS_LABEL_WIDTH as HA_CONFIG_LABEL_WIDTH,
  sipSettingsFormOuterStyle as haConfigFormOuterStyle,
  sipSettingsHeaderStyle as haConfigHeaderStyle,
  sipSettingsDashboardColumnStyle as haConfigDashboardColumnStyle,
  sipSettingsDashboardDividerCellStyle as haConfigDashboardDividerCellStyle,
  sipSettingsDashboardDividerLineStyle as haConfigDashboardDividerLineStyle,
  sipSettingsDashboardFieldsStackStyle as haConfigDashboardFieldsStackStyle,
  sipSettingsDashboardGridStyle as haConfigDashboardGridStyle,
  sipSettingsFieldGroupStyle as haConfigFieldGroupStyle,
  SipSettingsFieldRow as HaConfigFieldRow,
  SipSettingsSectionHeading as HaConfigSectionHeading,
  sipSettingsBindAddressSelectSx as haConfigBindAddressSelectSx,
  sipSettingsSelectSx as haConfigSelectSx,
  sipSettingsTableContainerStyle as haConfigTableContainerStyle,
  sipSettingsTextFieldSx as haConfigTextFieldSx,
  sipSettingsFooterStyle as haConfigFooterStyle,
  sipSettingsFormBtnStyle as haConfigFormBtnStyle,
} from "./components/SipSettingsFormFields";
import {
  HaStatusEnabledPanel,
  HaStatusNotEnabledPanel,
} from "./components/HaConfigFormFields";

const HaConfig = () => {
  const isCompact = useMediaQuery(HA_CONFIG_COMPACT_MQ);
  const labelColWidth = isCompact ? 160 : HA_CONFIG_LABEL_WIDTH;

  const {
    form,
    interfaceOptions,
    loading,
    saving,
    message,
    virtualIpTouched,
    peerIpTouched,
    virtualIpValid,
    peerIpValid,
    setMessage,
    setVirtualIpTouched,
    setPeerIpTouched,
    handleToggleHaEnabled,
    handleChange,
    handleToggleAutoFailback,
    handleReset,
    handleSave,
  } = useHaConfigPage();

  const {
    haEnabled: statusHaEnabled,
    status,
    isRefreshing: statusRefreshing,
    error: statusError,
    loadData: loadHaStatus,
  } = useHaStatusPage();

  useEffect(() => {
    loadHaStatus(true);
  }, [form.haEnabled, form.virtualIp, form.interface, form.mode, form.peerServerIp, loadHaStatus]);

  const fieldsDisabled = !form.haEnabled;
  const showStatusEnabled = form.haEnabled || statusHaEnabled;

  const onSave = () => {
    handleSave();
    setTimeout(() => loadHaStatus(false), 0);
  };

  const onReset = () => {
    handleReset();
    setTimeout(() => loadHaStatus(false), 0);
  };

  return (
    <div
      style={{
        ...haConfigPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
      data-native-scroll
    >
      <div style={haConfigPageInnerStyle}>
        {message.text && (
          <Alert
            severity={message.type === "error" ? "error" : "success"}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={haConfigFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <HaConfigBreadcrumb
          root={HA_CONFIG_PAGE_BREADCRUMB_ROOT}
          section={HA_CONFIG_PAGE_BREADCRUMB_SECTION}
          current={HA_CONFIG_PAGE_TITLE}
        />

        <div style={haConfigTableContainerStyle}>
          <div style={haConfigHeaderStyle}>
            <span>{HA_CONFIG_CARD_TITLE}</span>
          </div>

          <div style={haConfigFormOuterStyle}>
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
                {HA_CONFIG_LOADING_TEXT}
              </div>
            ) : (
              <div
                className="settings-dashboard-grid"
                style={haConfigDashboardGridStyle(isCompact)}
              >
                <div style={haConfigDashboardColumnStyle(isCompact)}>
                  <div style={haConfigDashboardFieldsStackStyle}>
                    <HaConfigSectionHeading
                      title={HA_CONFIG_SECTION_CONFIG}
                      isFirst
                    />
                    <div style={haConfigFieldGroupStyle}>
                      <HaConfigFieldRow
                        label={HA_CONFIG_LABEL_HA_ENABLED}
                        tooltipKey="haEnabled"
                        fieldTooltips={HA_CONFIG_FIELD_TOOLTIPS}
                        isCompact={isCompact}
                        labelColWidth={labelColWidth}
                      >
                        <Checkbox
                          size="small"
                          checked={form.haEnabled}
                          onChange={handleToggleHaEnabled}
                          sx={haConfigCheckboxSx}
                        />
                      </HaConfigFieldRow>

                      <HaConfigFieldRow
                        label={HA_CONFIG_LABEL_VIRTUAL_IP}
                        tooltipKey="virtualIp"
                        fieldTooltips={HA_CONFIG_FIELD_TOOLTIPS}
                        isCompact={isCompact}
                        labelColWidth={labelColWidth}
                      >
                        <TextField
                          size="small"
                          value={form.virtualIp}
                          disabled={fieldsDisabled}
                          placeholder="e.g. 192.168.1.100"
                          error={
                            form.haEnabled &&
                            virtualIpTouched &&
                            !virtualIpValid
                          }
                          onBlur={() => setVirtualIpTouched(true)}
                          onChange={(e) =>
                            handleChange("virtualIp", e.target.value)
                          }
                          sx={haConfigTextFieldSx}
                        />
                      </HaConfigFieldRow>

                      <HaConfigFieldRow
                        label={HA_CONFIG_LABEL_INTERFACE}
                        tooltipKey="interface"
                        fieldTooltips={HA_CONFIG_FIELD_TOOLTIPS}
                        isCompact={isCompact}
                        labelColWidth={labelColWidth}
                      >
                        <Select
                          size="small"
                          value={form.interface || ""}
                          disabled={fieldsDisabled}
                          displayEmpty
                          onChange={(e) =>
                            handleChange("interface", e.target.value)
                          }
                          renderValue={(selected) => {
                            if (!selected) {
                              return (
                                <span style={{ color: C.mutedText }}>
                                  {HA_CONFIG_INTERFACE_PLACEHOLDER}
                                </span>
                              );
                            }
                            return getLocalIpDisplayLabel(
                              interfaceOptions.find(
                                (option) => option.value === selected,
                              ),
                              selected,
                            );
                          }}
                          sx={haConfigBindAddressSelectSx}
                          MenuProps={{
                            PaperProps: {
                              sx: { maxWidth: 360 },
                            },
                          }}
                        >
                          {interfaceOptions.map((option) => (
                            <MenuItem
                              key={`ha-if-${option.value}`}
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
                      </HaConfigFieldRow>

                      <HaConfigFieldRow
                        label={HA_CONFIG_LABEL_MODE}
                        tooltipKey="mode"
                        fieldTooltips={HA_CONFIG_FIELD_TOOLTIPS}
                        isCompact={isCompact}
                        labelColWidth={labelColWidth}
                      >
                        <Select
                          size="small"
                          value={form.mode}
                          disabled={fieldsDisabled}
                          onChange={(e) =>
                            handleChange("mode", e.target.value)
                          }
                          sx={haConfigSelectSx}
                        >
                          {HA_CONFIG_MODE_OPTIONS.map((opt) => (
                            <MenuItem
                              key={opt.value}
                              value={opt.value}
                              sx={{ fontSize: 13, color: C.valueText }}
                            >
                              {opt.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </HaConfigFieldRow>

                      <HaConfigFieldRow
                        label={HA_CONFIG_LABEL_PEER_SERVER_IP}
                        tooltipKey="peerServerIp"
                        fieldTooltips={HA_CONFIG_FIELD_TOOLTIPS}
                        isCompact={isCompact}
                        labelColWidth={labelColWidth}
                      >
                        <TextField
                          size="small"
                          value={form.peerServerIp}
                          disabled={fieldsDisabled}
                          placeholder="e.g. 192.168.1.102"
                          error={
                            form.haEnabled &&
                            peerIpTouched &&
                            !peerIpValid
                          }
                          onBlur={() => setPeerIpTouched(true)}
                          onChange={(e) =>
                            handleChange("peerServerIp", e.target.value)
                          }
                          sx={haConfigTextFieldSx}
                        />
                      </HaConfigFieldRow>

                      <HaConfigFieldRow
                        label={HA_CONFIG_LABEL_AUTO_FAILBACK}
                        tooltipKey="autoFailback"
                        fieldTooltips={HA_CONFIG_FIELD_TOOLTIPS}
                        isCompact={isCompact}
                        labelColWidth={labelColWidth}
                      >
                        <Checkbox
                          size="small"
                          checked={form.autoFailback}
                          disabled={fieldsDisabled}
                          onChange={handleToggleAutoFailback}
                          sx={haConfigCheckboxSx}
                        />
                      </HaConfigFieldRow>
                    </div>
                  </div>
                </div>

                {!isCompact && (
                  <div
                    className="settings-dashboard-divider"
                    style={haConfigDashboardDividerCellStyle}
                    aria-hidden="true"
                  >
                    <div style={haConfigDashboardDividerLineStyle} />
                  </div>
                )}

                <div style={haConfigDashboardColumnStyle(isCompact)}>
                  <div style={haConfigDashboardFieldsStackStyle}>
                    <HaConfigSectionHeading
                      title={HA_CONFIG_SECTION_STATUS}
                      isFirst
                    />
                    <div style={haConfigFieldGroupStyle}>
                      {statusError ? (
                        <Alert severity="error" sx={{ fontSize: 12 }}>
                          {statusError}
                        </Alert>
                      ) : null}
                      {statusRefreshing && !status && showStatusEnabled ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "24px 0",
                            color: C.mutedText,
                            fontSize: 13,
                          }}
                        >
                          <CircularProgress
                            size={18}
                            sx={{ color: C.accent }}
                          />
                          Loading status…
                        </div>
                      ) : !showStatusEnabled ? (
                        <HaStatusNotEnabledPanel embedded />
                      ) : (
                        <HaStatusEnabledPanel
                          status={status}
                          interfaceOptions={interfaceOptions}
                          embedded
                          isCompact={isCompact}
                          labelColWidth={labelColWidth}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {!loading && (
            <div
              style={{
                ...haConfigFooterStyle,
                ...(isCompact ? { padding: "10px 12px" } : {}),
              }}
            >
              <Btn
                type="button"
                variant="primary"
                style={haConfigFormBtnStyle}
                disabled={saving}
                onClick={onSave}
              >
                {saving ? HA_CONFIG_BTN_SAVING : HA_CONFIG_BTN_SAVE}
              </Btn>
              <Btn
                type="button"
                variant="cancel"
                style={haConfigFormBtnStyle}
                disabled={saving}
                onClick={onReset}
              >
                {HA_CONFIG_BTN_RESET}
              </Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HaConfig;
