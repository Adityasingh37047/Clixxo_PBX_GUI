import React from "react";
import { Alert, CircularProgress, useMediaQuery } from "@mui/material";
import {
  NETWORK_CARD_TITLE,
  NETWORK_BTN_SAVE,
  NETWORK_BTN_SAVING,
  NETWORK_BTN_RESET,
  NETWORK_BTN_RESETTING,
  NETWORK_LOADING_TEXT,
  NETWORK_PROGRESS_RESTART_DEFAULT,
} from "../../../constants/NetworkConstants";
import { C } from "../../../theme/pbxTokens";
import { Btn } from "../../../components/common";
import { useNetworkPage } from "./hooks/useNetworkPage";
import { CARD_RADIUS, NETWORK_CARD_SHADOW } from "./components/NetworkTableHelpers";
import {
  NETWORK_COMPACT_MQ,
  NETWORK_SCROLL_CLASS,
  NETWORK_LABEL_COL_WIDTH,
  NetworkScrollbarStyles,
  NetworkPageShell,
  NetworkBreadcrumb,
  NetworkLanVlanColumn,
  NetworkDnsArpColumn,
  networkFixedAlertSx,
  networkTableContainerStyle,
  networkHeaderStyle,
  networkDashboardGridStyle,
  networkDashboardDividerCellStyle,
  networkDashboardDividerLineStyle,
  advancedFormInlineFooterStyle,
  advancedFormBtnStyle,
} from "./components/NetworkFormFields";

const Network = () => {
  const vm = useNetworkPage();
  const {
    lanInterfaces,
    dnsServers,
    arpMode,
    loading,
    error,
    setError,
    toast,
    setToast,
    resetting,
    ipErrors,
    subnetErrors,
    gatewayErrors,
    dnsErrors,
    arpError,
    vlanEnabled,
    vlanForm,
    networkRestarting,
    progressMessage,
    handleLanChange,
    handleDnsChange,
    handleVlanChange,
    handleArpChange,
    handleEnableVlan,
    handleDisableVlan,
    handleReset,
    handleSave,
  } = vm;

  const isCompact = useMediaQuery(NETWORK_COMPACT_MQ);
  const labelColWidth = isCompact ? 160 : NETWORK_LABEL_COL_WIDTH;

  return (
    <>
      <NetworkScrollbarStyles />
      <NetworkPageShell isCompact={isCompact}>
        {error && (
          <Alert
            severity="error"
            onClose={() => setError("")}
            sx={networkFixedAlertSx}
          >
            {error}
          </Alert>
        )}

        {toast.msg && (
          <Alert
            severity={toast.type}
            onClose={() => setToast({ msg: "", type: "success" })}
            sx={{
              ...networkFixedAlertSx,
              top: error ? 88 : 20,
              whiteSpace: "pre-line",
            }}
          >
            {toast.msg}
          </Alert>
        )}

        {networkRestarting && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div
              className="bg-white rounded-lg flex flex-col items-center gap-4 pointer-events-auto"
              style={{
                minWidth: "300px",
                padding: "24px 32px",
                border: `1px solid ${C.cardBorder}`,
                boxShadow: NETWORK_CARD_SHADOW,
                borderRadius: CARD_RADIUS,
              }}
            >
              <CircularProgress size={50} sx={{ color: C.accent }} />
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: C.strongText,
                  whiteSpace: "pre-line",
                  textAlign: "center",
                }}
              >
                {progressMessage || NETWORK_PROGRESS_RESTART_DEFAULT}
              </div>
            </div>
          </div>
        )}

        <NetworkBreadcrumb />

        <div style={networkTableContainerStyle}>
          <div style={networkHeaderStyle}>
            <span>{NETWORK_CARD_TITLE}</span>
          </div>

          <div style={{ padding: 0, boxSizing: "border-box" }}>
            {loading ? (
              <div
                className="flex items-center justify-center w-full"
                style={{ minHeight: 400, padding: "48px 32px" }}
              >
                <div className="text-center">
                  <CircularProgress size={40} sx={{ color: C.accent }} />
                  <div
                    style={{
                      marginTop: 12,
                      fontSize: 13,
                      color: C.mutedText,
                      fontWeight: 500,
                    }}
                  >
                    {NETWORK_LOADING_TEXT}
                  </div>
                </div>
              </div>
            ) : (
              <form
                id="network-settings-form"
                onSubmit={handleSave}
                className="flex flex-col gap-2"
              >
                <div
                  className={NETWORK_SCROLL_CLASS}
                  style={{ boxSizing: "border-box" }}
                >
                  <div
                    className="settings-dashboard-grid"
                    style={networkDashboardGridStyle(isCompact)}
                  >
                    <NetworkLanVlanColumn
                      isCompact={isCompact}
                      labelColWidth={labelColWidth}
                      vlanEnabled={vlanEnabled}
                      lanInterfaces={lanInterfaces}
                      vlanForm={vlanForm}
                      ipErrors={ipErrors}
                      subnetErrors={subnetErrors}
                      gatewayErrors={gatewayErrors}
                      onLanChange={handleLanChange}
                      onVlanChange={handleVlanChange}
                      onEnableVlan={handleEnableVlan}
                      onDisableVlan={handleDisableVlan}
                    />

                    {!isCompact && (
                      <div
                        className="settings-dashboard-divider"
                        style={networkDashboardDividerCellStyle}
                        aria-hidden="true"
                      >
                        <div style={networkDashboardDividerLineStyle} />
                      </div>
                    )}

                    <NetworkDnsArpColumn
                      isCompact={isCompact}
                      labelColWidth={labelColWidth}
                      dnsServers={dnsServers}
                      dnsErrors={dnsErrors}
                      arpMode={arpMode}
                      arpError={arpError}
                      onDnsChange={handleDnsChange}
                      onArpChange={handleArpChange}
                    />
                  </div>
                </div>
              </form>
            )}
          </div>

          {!loading && (
            <div style={advancedFormInlineFooterStyle}>
              <Btn
                variant="primary"
                type="submit"
                form="network-settings-form"
                disabled={loading || resetting || networkRestarting}
                style={advancedFormBtnStyle}
              >
                {loading && !resetting ? NETWORK_BTN_SAVING : NETWORK_BTN_SAVE}
              </Btn>
              <Btn
                variant="cancel"
                type="button"
                onClick={handleReset}
                disabled={resetting || networkRestarting}
                style={advancedFormBtnStyle}
              >
                {resetting ? NETWORK_BTN_RESETTING : NETWORK_BTN_RESET}
              </Btn>
            </div>
          )}
        </div>
      </NetworkPageShell>
    </>
  );
};

export default Network;
