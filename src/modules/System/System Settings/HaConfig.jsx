import React, { useState } from "react";
import {
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  TextField,
  Checkbox,
  Tooltip,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  HA_CONFIG_BTN_CANCEL,
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
  HA_CONFIG_MODAL_TITLE,
  HA_CONFIG_MESSAGES,
} from "../../../constants/HaConfigConstants";
import {
  Btn,
  ExtensionBreadcrumb as HaConfigBreadcrumb,
  extensionPageWrapStyle as haConfigPageWrapStyle,
  extensionPageInnerStyle as haConfigPageInnerStyle,
  extensionFixedAlertSx as haConfigFixedAlertSx,
  extensionTableCheckboxSx as haConfigCheckboxSx,
  addNewModalFooterStyle,
  addNewModalFooterBtnStyle,
  extensionModalCancelBtnStyle as haConfigModalCancelBtnStyle,
} from "../../../components/common";
import { C } from "../../../theme/pbxTokens";
import { useHaConfigPage } from "./hooks/useHaConfigPage";
import { getLocalIpDisplayLabel } from "./utils/localIpOptionsUtils";
import {
  SIP_SETTINGS_COMPACT_MQ as HA_CONFIG_COMPACT_MQ,
  SIP_SETTINGS_TOOLTIP_PROPS as HA_CONFIG_TOOLTIP_PROPS,
  sipSettingsFormOuterStyle as haConfigFormOuterStyle,
  sipSettingsHeaderStyle as haConfigHeaderStyle,
  sipSettingsBindAddressSelectSx as haConfigBindAddressSelectSx,
  sipSettingsTableContainerStyle as haConfigTableContainerStyle,
  sipSettingsTextFieldSx as haConfigTextFieldSx,
} from "./components/SipSettingsFormFields";

const HA_CONFIG_FORM_MAX_WIDTH = 760;
const HA_CONFIG_FORM_HORIZONTAL_PADDING = 24;

const haConfigBtnStyle = {
  borderRadius: 4,
};

const haConfigFormBodyStyle = {
  width: "100%",
  maxWidth: HA_CONFIG_FORM_MAX_WIDTH,
  margin: "0 auto",
  padding: `16px ${HA_CONFIG_FORM_HORIZONTAL_PADDING}px 24px`,
  boxSizing: "border-box",
};

const modalFieldControlStyle = {
  width: 320,
  maxWidth: "100%",
  minWidth: 0,
  flexShrink: 0,
};

const modalFieldRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "100%",
  maxWidth: 502,
  margin: "0 auto",
};

const HaConfigFieldLabel = ({ tooltipKey, children, style = {} }) => {
  const tooltip = tooltipKey ? HA_CONFIG_FIELD_TOOLTIPS[tooltipKey] || "" : "";
  const labelNode = (
    <span
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        cursor: tooltip ? "help" : undefined,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </span>
  );
  if (!tooltip) return labelNode;
  return (
    <Tooltip title={tooltip} {...HA_CONFIG_TOOLTIP_PROPS}>
      {labelNode}
    </Tooltip>
  );
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
    handleSave,
    handleJoin,
    handleGenerateCode,
    handleCancelPairing,
    HA_SCREENS,
    handleRemoveHa,
  } = useHaConfigPage();

  // Screen 1 Join Form Inputs State
  const [joinPeerIp, setJoinPeerIp] = useState("");
  const [joinCode, setJoinCode] = useState("");

  // Modal State
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  const handleOpenConfigModal = (mode = null) => {
    if (mode) {
      handleChange("mode", mode);
    }
    setVirtualIpTouched(false);
    setPeerIpTouched(false);
    setIsConfigModalOpen(true);
  };

  const handleCloseConfigModal = () => {
    if (saving) return;
    setIsConfigModalOpen(false);
    setVirtualIpTouched(false);
    setPeerIpTouched(false);
  };

  const onSaveConfigModal = async () => {
    const success = await handleSave();
    if (success) {
      setIsConfigModalOpen(false);
    }
  };

  const fieldsDisabled = !form.haEnabled;

  const renderScreen1NotConfigured = () => (
    <div style={haConfigFormBodyStyle}>
      <div style={{ textAlign: "center", padding: "16px 0 24px", color: "#304751", fontSize: 15, fontWeight: 600 }}>
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
            alignItems: "stretch",
          }}
        >
          {/* Left Column: Configure HA as Primary */}
          <div
            style={{
              border: `1px solid ${C.cardBorder || "#e2e8f0"}`,
              borderRadius: 4,
              padding: 20,
              background: "#f8fafc",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#304751", marginBottom: 8 }}>
                Set up a new pair:
              </div>
              <div style={{ fontSize: 12, color: C.mutedText, marginBottom: 16 }}>
                Configures this server as the Primary node.
              </div>
            </div>
            <Btn
              type="button"
              variant="primary"
              onClick={() => handleOpenConfigModal("primary")}
              style={{ width: "100%", borderRadius: 4 }}
            >
              Configure HA
            </Btn>
          </div>

          {/* Right Column: Join as Backup */}
          <div
            style={{
              border: `1px solid ${C.cardBorder || "#e2e8f0"}`,
              borderRadius: 4,
              padding: 20,
              background: "#f8fafc",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#304751", marginBottom: 12 }}>
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
                    placeholder="e.g. 192.168.0.100"
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
            </div>

            <Btn
              type="button"
              variant="primary"
              disabled={!joinPeerIp.trim() || !joinCode.trim()}
              onClick={() => handleJoin(joinPeerIp.trim(), joinCode.trim())}
              style={{ width: "100%", borderRadius: 4 }}
            >
              Join
            </Btn>
          </div>
        </div>
      )}
    </div>
  );

  const renderScreen3ConfiguredUnpaired = () => (
    <div style={haConfigFormBodyStyle}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* HA Config Summary Card */}
        <div style={{ border: `1px solid ${C.cardBorder || "#e2e8f0"}`, borderRadius: 4, padding: 16, background: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: C.valueText }}>HA Config</span>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn type="button" variant="cancel" style={{ height: 28, fontSize: 12, padding: "2px 12px", borderRadius: 4 }} onClick={() => handleOpenConfigModal()}>
                Edit
              </Btn>
              <Btn
                type="button"
                variant="cancel"
                style={{ height: 28, fontSize: 12, padding: "2px 12px", borderRadius: 4, background: "#dc2626", color: "#fff", borderColor: "#dc2626" }}
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
        <div style={{ border: `1px solid ${C.cardBorder || "#e2e8f0"}`, borderRadius: 4, padding: 16, background: "#fff" }}>
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
              borderRadius: 4,
              fontSize: 12,
              color: "#b45309",
              marginBottom: 16,
            }}
          >
            ⚠️ Keepalived is running, but file sync, database sync, and certificate sharing need SSH trust with the peer.
          </div>

          <Btn type="button" variant="primary" style={haConfigBtnStyle} onClick={handleGenerateCode}>
            Generate Pairing Code
          </Btn>
        </div>
      </div>
    </div>
  );

  const renderScreen4CodeDisplayed = () => (
    <div style={haConfigFormBodyStyle}>
      <div style={{ border: `1px solid ${C.cardBorder || "#e2e8f0"}`, borderRadius: 4, padding: 24, background: "#fff", textAlign: "center" }}>
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
            color: C.accent || "#304751",
            padding: "16px 24px",
            background: "#f1f5f9",
            borderRadius: 4,
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
          <Btn type="button" variant="cancel" style={haConfigBtnStyle} onClick={handleCancelPairing}>
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
        <div style={{ border: `1px solid ${C.cardBorder || "#e2e8f0"}`, borderRadius: 4, padding: 16, background: "#fff" }}>
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
        <div style={{ border: `1px solid ${C.cardBorder || "#e2e8f0"}`, borderRadius: 4, padding: 16, background: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: C.valueText }}>HA Config</span>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn type="button" variant="cancel" style={{ height: 28, fontSize: 12, padding: "2px 12px", borderRadius: 4 }} onClick={() => handleOpenConfigModal()}>
                Edit
              </Btn>
              <Btn
                type="button"
                variant="cancel"
                style={{ height: 28, fontSize: 12, padding: "2px 12px", borderRadius: 4, background: "#dc2626", color: "#fff", borderColor: "#dc2626" }}
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
        <div style={{ border: `1px solid ${C.cardBorder || "#e2e8f0"}`, borderRadius: 4, padding: 16, background: "#fff" }}>
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
      case HA_SCREENS.CONFIGURED_UNPAIRED:
        return renderScreen3ConfiguredUnpaired();
      case HA_SCREENS.CODE_DISPLAYED:
        return renderScreen4CodeDisplayed();
      case HA_SCREENS.DASHBOARD:
        return renderScreen5Dashboard();
      case HA_SCREENS.CONFIG_FORM:
        return form.haEnabled ? renderScreen3ConfiguredUnpaired() : renderScreen1NotConfigured();
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

      {/* Configure HA Modal Dialog (styled like Add Global SIP modal) */}
      <Dialog
        open={isConfigModalOpen}
        onClose={saving ? null : handleCloseConfigModal}
        maxWidth={false}
        slotProps={{
          backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.5)" } },
        }}
        PaperProps={{
          sx: {
            width: 600,
            maxWidth: "96vw",
            mx: "auto",
            p: 0,
            borderRadius: "4px",
            overflow: "hidden",
          },
        }}
        disableRestoreFocus
        disableEnforceFocus
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
          {HA_CONFIG_MODAL_TITLE}
        </DialogTitle>
        <DialogContent
          style={{
            padding: "24px",
            backgroundColor: "#ffffff",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              background: "#f8fafc",
              border: `1px solid ${C.cardBorder}`,
              borderRadius: 4,
              padding: 20,
              marginTop: 0,
            }}
          >
            {/* HA Enabled */}
            <div style={modalFieldRowStyle}>
              <div style={{ width: 170, flexShrink: 0, textAlign: "left" }}>
                <HaConfigFieldLabel tooltipKey="haEnabled">
                  {HA_CONFIG_LABEL_HA_ENABLED}:
                </HaConfigFieldLabel>
              </div>
              <div style={modalFieldControlStyle}>
                <Checkbox
                  size="small"
                  checked={form.haEnabled}
                  onChange={handleToggleHaEnabled}
                  sx={haConfigCheckboxSx}
                />
              </div>
            </div>

            {/* Virtual IP */}
            <div style={modalFieldRowStyle}>
              <div style={{ width: 170, flexShrink: 0, textAlign: "left" }}>
                <HaConfigFieldLabel tooltipKey="virtualIp">
                  {HA_CONFIG_LABEL_VIRTUAL_IP}:
                </HaConfigFieldLabel>
              </div>
              <div style={modalFieldControlStyle}>
                <TextField
                  size="small"
                  fullWidth
                  value={form.virtualIp}
                  disabled={fieldsDisabled}
                  placeholder="e.g. 192.168.0.100"
                  error={form.haEnabled && virtualIpTouched && !virtualIpValid}
                  helperText={
                    form.haEnabled && virtualIpTouched && !virtualIpValid
                      ? HA_CONFIG_MESSAGES.invalidVirtualIp
                      : ""
                  }
                  onBlur={() => setVirtualIpTouched(true)}
                  onChange={(e) => handleChange("virtualIp", e.target.value)}
                  sx={haConfigTextFieldSx}
                />
              </div>
            </div>

            {/* Interface */}
            <div style={modalFieldRowStyle}>
              <div style={{ width: 170, flexShrink: 0, textAlign: "left" }}>
                <HaConfigFieldLabel tooltipKey="interface">
                  {HA_CONFIG_LABEL_INTERFACE}:
                </HaConfigFieldLabel>
              </div>
              <div style={modalFieldControlStyle}>
                <Select
                  size="small"
                  fullWidth
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
              </div>
            </div>

            {/* Peer Server IP */}
            <div style={modalFieldRowStyle}>
              <div style={{ width: 170, flexShrink: 0, textAlign: "left" }}>
                <HaConfigFieldLabel tooltipKey="peerServerIp">
                  {HA_CONFIG_LABEL_PEER_SERVER_IP}:
                </HaConfigFieldLabel>
              </div>
              <div style={modalFieldControlStyle}>
                <TextField
                  size="small"
                  fullWidth
                  value={form.peerServerIp}
                  disabled={fieldsDisabled}
                  placeholder="e.g. 192.168.0.151"
                  error={form.haEnabled && peerIpTouched && !peerIpValid}
                  helperText={
                    form.haEnabled && peerIpTouched && !peerIpValid
                      ? HA_CONFIG_MESSAGES.invalidPeerIp
                      : ""
                  }
                  onBlur={() => setPeerIpTouched(true)}
                  onChange={(e) => handleChange("peerServerIp", e.target.value)}
                  sx={haConfigTextFieldSx}
                />
              </div>
            </div>

            {/* Auto Failback */}
            <div style={modalFieldRowStyle}>
              <div style={{ width: 170, flexShrink: 0, textAlign: "left" }}>
                <HaConfigFieldLabel tooltipKey="autoFailback">
                  {HA_CONFIG_LABEL_AUTO_FAILBACK}:
                </HaConfigFieldLabel>
              </div>
              <div style={modalFieldControlStyle}>
                <Checkbox
                  size="small"
                  checked={form.autoFailback}
                  disabled={fieldsDisabled}
                  onChange={handleToggleAutoFailback}
                  sx={haConfigCheckboxSx}
                />
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn
            type="button"
            variant="primary"
            disabled={saving}
            onClick={onSaveConfigModal}
            style={addNewModalFooterBtnStyle}
          >
            {saving ? HA_CONFIG_BTN_SAVING : HA_CONFIG_BTN_SAVE}
          </Btn>
          <Btn
            type="button"
            variant="cancel"
            disabled={saving}
            onClick={handleCloseConfigModal}
            style={haConfigModalCancelBtnStyle}
          >
            {HA_CONFIG_BTN_CANCEL}
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default HaConfig;

