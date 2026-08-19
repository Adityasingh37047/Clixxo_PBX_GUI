import React, { useState } from "react";
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
  HA_CONFIG_LABEL_PEER_SERVER_IP,
  HA_CONFIG_LABEL_VIRTUAL_IP,
  HA_CONFIG_LOADING_TEXT,
  HA_CONFIG_PAGE_BREADCRUMB_ROOT,
  HA_CONFIG_PAGE_BREADCRUMB_SECTION,
  HA_CONFIG_PAGE_TITLE,
  HA_CONFIG_FIELD_TOOLTIPS,
  HA_CONFIG_SECTION_CONFIG,
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
import { getLocalIpDisplayLabel } from "./utils/localIpOptionsUtils";
import {
  SIP_SETTINGS_COMPACT_MQ as HA_CONFIG_COMPACT_MQ,
  SIP_SETTINGS_LABEL_WIDTH as HA_CONFIG_LABEL_WIDTH,
  sipSettingsFormOuterStyle as haConfigFormOuterStyle,
  sipSettingsHeaderStyle as haConfigHeaderStyle,
  sipSettingsDashboardFieldsStackStyle as haConfigDashboardFieldsStackStyle,
  sipSettingsFieldGroupStyle as haConfigFieldGroupStyle,
  SipSettingsFieldRow as HaConfigFieldRow,
  SipSettingsSectionHeading as HaConfigSectionHeading,
  sipSettingsBindAddressSelectSx as haConfigBindAddressSelectSx,
  sipSettingsTableContainerStyle as haConfigTableContainerStyle,
  sipSettingsTextFieldSx as haConfigTextFieldSx,
  sipSettingsFooterStyle as haConfigFooterStyle,
  sipSettingsFormBtnStyle as haConfigFormBtnStyle,
} from "./components/SipSettingsFormFields";

const HA_CONFIG_FORM_MAX_WIDTH = 760;
const HA_CONFIG_FORM_HORIZONTAL_PADDING = 24;

const haConfigFormBodyStyle = {
  width: "100%",
  maxWidth: HA_CONFIG_FORM_MAX_WIDTH,
  margin: "0 auto",
  padding: `16px ${HA_CONFIG_FORM_HORIZONTAL_PADDING}px 24px`,
  boxSizing: "border-box",
};

const formatSeconds = (totalSeconds) => {
  const secs = Math.max(0, totalSeconds);
  const mins = Math.floor(secs / 60);
  const remainder = secs % 60;
  return `${mins}:${remainder < 10 ? "0" : ""}${remainder}`;
};

const formatPairingCodeDisplay = (codeStr = "") => {
  if (!codeStr) return "";
  const cleaned = String(codeStr).toUpperCase();
  return cleaned.split("").join(" ");
};

const HaConfig = () => {
  const isCompact = useMediaQuery(HA_CONFIG_COMPACT_MQ);
  const labelColWidth = isCompact ? 160 : HA_CONFIG_LABEL_WIDTH;

  const {
    form,
    interfaceOptions,
    loading,
    saving,
    joining,
    message,
    virtualIpTouched,
    peerIpTouched,
    virtualIpValid,
    peerIpValid,
    currentScreen,
    pairingCodeInfo,
    countdown,
    haStatus,
    setMessage,
    setVirtualIpTouched,
    setPeerIpTouched,
    handleToggleHaEnabled,
    handleChange,
    handleToggleAutoFailback,
    handleReset,
    handleSave,
    handleJoin,
    handleGenerateCode,
    handleCancelPairing,
    navigateToConfigForm,
    HA_SCREENS,
    handleRemoveHa,
  } = useHaConfigPage();

  // Screen 1 Join Form Inputs State
  const [joinPeerIp, setJoinPeerIp] = useState("");
  const [joinCode, setJoinCode] = useState("");

  const fieldsDisabled = !form.haEnabled;

  const renderScreen1NotConfigured = () => (
    <div style={haConfigFormBodyStyle}>
      <div style={{ textAlign: "center", padding: "16px 0 24px", color: C.mutedText, fontSize: 15, fontWeight: 600 }}>
        High Availability is not configured
      </div>

      {joining ? (
        <div style={{ textAlign: "center", padding: "32px 16px", color: C.accent, fontWeight: 600, fontSize: 14 }}>
          <CircularProgress size={24} sx={{ color: C.accent, marginBottom: 2 }} />
          <div>Joining... contacting {joinPeerIp || "peer server"}</div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isCompact ? "1fr" : "1fr 1fr",
            gap: 24,
            alignItems: "start",
          }}
        >
          {/* Left Column: Configure HA as Primary */}
          <div
            style={{
              border: `1px solid ${C.cardBorder || "#e2e8f0"}`,
              borderRadius: 8,
              padding: 20,
              background: "#f8fafc",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 14, color: C.valueText, marginBottom: 8 }}>
              Set up a new pair:
            </div>
            <div style={{ fontSize: 12, color: C.mutedText, marginBottom: 16 }}>
              Configures this server as the Primary node.
            </div>
            <Btn
              type="button"
              variant="primary"
              onClick={() => {
                handleChange("mode", "primary");
                navigateToConfigForm();
              }}
              style={{ width: "100%" }}
            >
              Configure HA
            </Btn>
          </div>

          {/* Right Column: Join as Backup */}
          <div
            style={{
              border: `1px solid ${C.cardBorder || "#e2e8f0"}`,
              borderRadius: 8,
              padding: 20,
              background: "#f8fafc",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 14, color: C.valueText, marginBottom: 12 }}>
              Join an existing pair:
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.labelText, display: "block", marginBottom: 4 }}>
                  Peer IP
                </label>
                <TextField
                  size="small"
                  fullWidth
                  value={joinPeerIp}
                  onChange={(e) => setJoinPeerIp(e.target.value)}
                  placeholder="e.g. 192.168.0.157"
                  sx={haConfigTextFieldSx}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.labelText, display: "block", marginBottom: 4 }}>
                  Code
                </label>
                <TextField
                  size="small"
                  fullWidth
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="e.g. MPFZ-8MSD"
                  sx={haConfigTextFieldSx}
                />
              </div>
            </div>

            <Btn
              type="button"
              variant="primary"
              disabled={!joinPeerIp.trim() || !joinCode.trim()}
              onClick={() => handleJoin(joinPeerIp.trim(), joinCode.trim())}
              style={{ width: "100%" }}
            >
              Join
            </Btn>
          </div>
        </div>
      )}
    </div>
  );

  const renderScreen2ConfigForm = () => (
    <>
      <div style={haConfigFormBodyStyle}>
        <div style={haConfigDashboardFieldsStackStyle}>
          <HaConfigSectionHeading title={HA_CONFIG_SECTION_CONFIG} isFirst />

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
                placeholder="e.g. 192.168.0.100"
                error={form.haEnabled && virtualIpTouched && !virtualIpValid}
                onBlur={() => setVirtualIpTouched(true)}
                onChange={(e) => handleChange("virtualIp", e.target.value)}
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
                onChange={(e) => handleChange("interface", e.target.value)}
                renderValue={(selected) => {
                  if (!selected) {
                    return (
                      <span style={{ color: C.mutedText }}>
                        {HA_CONFIG_INTERFACE_PLACEHOLDER}
                      </span>
                    );
                  }
                  return getLocalIpDisplayLabel(
                    interfaceOptions.find((option) => option.value === selected),
                    selected,
                  );
                }}
                sx={haConfigBindAddressSelectSx}
                MenuProps={{
                  PaperProps: { sx: { maxWidth: 360 } },
                }}
              >
                <MenuItem value="" sx={{ fontSize: 13, color: C.mutedText }}>
                  {HA_CONFIG_INTERFACE_PLACEHOLDER}
                </MenuItem>
                {interfaceOptions.map((option) => (
                  <MenuItem
                    key={`ha-if-${option.value}`}
                    value={option.value}
                    disabled={option.disabled}
                    title={option.title || option.label}
                    sx={{ fontSize: 13, maxWidth: 360, color: C.valueText }}
                  >
                    {option.label}
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
                placeholder="e.g. 192.168.0.151"
                error={form.haEnabled && peerIpTouched && !peerIpValid}
                onBlur={() => setPeerIpTouched(true)}
                onChange={(e) => handleChange("peerServerIp", e.target.value)}
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

      <div style={{ ...haConfigFooterStyle, ...(isCompact ? { padding: "10px 12px" } : {}) }}>
        <Btn
          type="button"
          variant="primary"
          style={haConfigFormBtnStyle}
          disabled={saving}
          onClick={handleSave}
        >
          {saving ? HA_CONFIG_BTN_SAVING : HA_CONFIG_BTN_SAVE}
        </Btn>
        <Btn
          type="button"
          variant="cancel"
          style={haConfigFormBtnStyle}
          disabled={saving}
          onClick={handleReset}
        >
          {HA_CONFIG_BTN_RESET}
        </Btn>
      </div>
    </>
  );

  const renderScreen3ConfiguredUnpaired = () => (
    <div style={haConfigFormBodyStyle}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* HA Config Summary Card */}
        <div style={{ border: `1px solid ${C.cardBorder || "#e2e8f0"}`, borderRadius: 8, padding: 16, background: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: C.valueText }}>HA Config</span>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn type="button" variant="cancel" style={{ height: 28, fontSize: 12, padding: "2px 12px" }} onClick={navigateToConfigForm}>
                Edit
              </Btn>
              <Btn
                type="button"
                variant="cancel"
                style={{ height: 28, fontSize: 12, padding: "2px 12px", background: "#dc2626", color: "#fff", borderColor: "#dc2626" }}
                onClick={handleRemoveHa}
              >
                Remove HA
              </Btn>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isCompact ? "1fr" : "1fr 1fr", gap: 8, fontSize: 13 }}>
            <div><strong>HA Enabled:</strong> {form.haEnabled ? "✓ Yes" : "No"}</div>
            <div><strong>Virtual IP:</strong> {form.virtualIp || "—"}</div>
            <div><strong>Mode:</strong> {form.mode ? (form.mode.charAt(0).toUpperCase() + form.mode.slice(1)) : "Primary"}</div>
            <div><strong>Peer IP:</strong> {form.peerServerIp || "—"}</div>
            <div><strong>Interface:</strong> {form.interface || "—"}</div>
          </div>
        </div>

        {/* SSH Trust Card */}
        <div style={{ border: `1px solid ${C.cardBorder || "#e2e8f0"}`, borderRadius: 8, padding: 16, background: "#fff" }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.valueText, marginBottom: 8 }}>
            SSH Trust
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#d97706", marginBottom: 12 }}>
            Status: ● Not Paired
          </div>

          <div
            style={{
              padding: "10px 14px",
              background: "#fffbeb",
              border: "1px solid #fef3c7",
              borderRadius: 6,
              fontSize: 12,
              color: "#b45309",
              marginBottom: 16,
            }}
          >
            ⚠️ Keepalived is running, but file sync, database sync, and certificate sharing need SSH trust with the peer.
          </div>

          <Btn type="button" variant="primary" onClick={handleGenerateCode}>
            Generate Pairing Code
          </Btn>
        </div>
      </div>
    </div>
  );

  const renderScreen4CodeDisplayed = () => (
    <div style={haConfigFormBodyStyle}>
      <div style={{ border: `1px solid ${C.cardBorder || "#e2e8f0"}`, borderRadius: 8, padding: 24, background: "#fff", textAlign: "center" }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: C.valueText, marginBottom: 4 }}>
          SSH Trust
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#2563eb", marginBottom: 20 }}>
          Status: ● Waiting for peer
        </div>

        <div style={{ fontSize: 13, color: C.mutedText, marginBottom: 12 }}>
          Your pairing code:
        </div>

        <div
          style={{
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: 6,
            fontFamily: "monospace",
            color: C.accent || "#0f172a",
            padding: "16px 24px",
            background: "#f1f5f9",
            borderRadius: 8,
            display: "inline-block",
            marginBottom: 20,
          }}
        >
          {formatPairingCodeDisplay(pairingCodeInfo?.code || "")}
        </div>

        <div style={{ fontSize: 13, color: C.valueText, marginBottom: 20 }}>
          Enter this on the peer server within <strong>{formatSeconds(countdown)}</strong>
        </div>

        <div>
          <Btn type="button" variant="cancel" onClick={handleCancelPairing}>
            Cancel
          </Btn>
        </div>
      </div>
    </div>
  );

  const renderScreen5Dashboard = () => (
    <div style={haConfigFormBodyStyle}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Status Card */}
        <div style={{ border: `1px solid ${C.cardBorder || "#e2e8f0"}`, borderRadius: 8, padding: 16, background: "#fff" }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: C.valueText, marginBottom: 12 }}>
            Status
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
            <div style={{ fontWeight: 700, color: "#16a34a", fontSize: 14 }}>
              ● {haStatus?.role ? haStatus.role.toUpperCase() : "ACTIVE"} <span style={{ fontWeight: 400, color: C.mutedText }}>holding {form.virtualIp}</span>
            </div>
            <div>
              Peer {form.peerServerIp || "peer"} <span style={{ color: "#16a34a", fontWeight: 600 }}>● reachable</span>
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 4 }}>
              <span>Replication <strong style={{ color: "#16a34a" }}>● OK</strong></span>
              <span>VPN <strong style={{ color: "#16a34a" }}>● up</strong></span>
              <span>Certificate <strong style={{ color: "#16a34a" }}>● covers VIP</strong></span>
            </div>
          </div>
        </div>

        {/* HA Config Summary Card */}
        <div style={{ border: `1px solid ${C.cardBorder || "#e2e8f0"}`, borderRadius: 8, padding: 16, background: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: C.valueText }}>HA Config</span>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn type="button" variant="cancel" style={{ height: 28, fontSize: 12, padding: "2px 12px" }} onClick={navigateToConfigForm}>
                Edit
              </Btn>
              <Btn
                type="button"
                variant="cancel"
                style={{ height: 28, fontSize: 12, padding: "2px 12px", background: "#dc2626", color: "#fff", borderColor: "#dc2626" }}
                onClick={handleRemoveHa}
              >
                Remove HA
              </Btn>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isCompact ? "1fr" : "1fr 1fr", gap: 8, fontSize: 13 }}>
            <div><strong>Mode:</strong> {form.mode ? (form.mode.charAt(0).toUpperCase() + form.mode.slice(1)) : "Primary"}</div>
            <div><strong>Virtual IP:</strong> {form.virtualIp || "—"}</div>
            <div><strong>Peer IP:</strong> {form.peerServerIp || "—"}</div>
            <div><strong>Interface:</strong> {form.interface || "—"}</div>
          </div>
        </div>

        {/* SSH Trust Card */}
        <div style={{ border: `1px solid ${C.cardBorder || "#e2e8f0"}`, borderRadius: 8, padding: 16, background: "#fff" }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.valueText, marginBottom: 8 }}>
            SSH Trust
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#16a34a" }}>
            ● Paired with {form.peerServerIp || "peer"}
          </div>
        </div>
      </div>
    </div>
  );

  const renderActiveScreen = () => {
    switch (currentScreen) {
      case HA_SCREENS.NOT_CONFIGURED:
        return renderScreen1NotConfigured();
      case HA_SCREENS.CONFIG_FORM:
        return renderScreen2ConfigForm();
      case HA_SCREENS.CONFIGURED_UNPAIRED:
        return renderScreen3ConfiguredUnpaired();
      case HA_SCREENS.CODE_DISPLAYED:
        return renderScreen4CodeDisplayed();
      case HA_SCREENS.DASHBOARD:
        return renderScreen5Dashboard();
      default:
        return renderScreen1NotConfigured();
    }
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
            severity={message.type === "error" ? "error" : message.type === "warning" ? "warning" : "success"}
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
              renderActiveScreen()
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HaConfig;

