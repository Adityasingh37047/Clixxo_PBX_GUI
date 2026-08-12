import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  HA_STATUS_BREADCRUMB_SEGMENTS,
  HA_STATUS_BTN_CHECK,
  HA_STATUS_BTN_CLEAR,
  HA_STATUS_BTN_PHONE_CHECK,
  HA_STATUS_BTN_REFRESH,
  HA_STATUS_BTN_RUNNING,
  HA_STATUS_BTN_SYNC_DB,
  HA_STATUS_CARD_TITLE,
  HA_STATUS_LOAD_FAILED,
  HA_STATUS_LOADING_TEXT,
  HA_STATUS_OUTPUT_PLACEHOLDER,
  HA_STATUS_SECTION_LOCAL,
  HA_STATUS_SECTION_PEER,
  HA_STATUS_SYNC_DB_MODAL_TEXT,
  HA_STATUS_SYNC_DB_MODAL_TITLE,
} from "../../../constants/HaStatusConstants";
import { ROUTE_PATHS } from "../../../constants/routeConstants";
import { C } from "../../../theme/pbxTokens";
import {
  Btn,
  ExtensionBreadcrumb as HaStatusBreadcrumb,
  extensionCancelBtnStyle as haStatusRefreshBtnStyle,
  extensionCardStyle as haStatusCardStyle,
  extensionFixedAlertSx as haStatusFixedAlertSx,
  extensionPageInnerStyle as haStatusPageInnerStyle,
  extensionPageWrapStyle as haStatusPageWrapStyle,
  extensionToolbarStyle as haStatusToolbarStyle,
} from "../../../components/common";
import {
  SIP_SETTINGS_COMPACT_MQ as HA_STATUS_COMPACT_MQ,
  SIP_SETTINGS_LABEL_WIDTH as HA_STATUS_LABEL_WIDTH,
  SipSettingsSectionHeading as HaStatusSectionHeading,
  sipSettingsDashboardColumnStyle as haStatusDashboardColumnStyle,
  sipSettingsDashboardDividerCellStyle as haStatusDashboardDividerCellStyle,
  sipSettingsDashboardDividerLineStyle as haStatusDashboardDividerLineStyle,
  sipSettingsDashboardFieldsStackStyle as haStatusDashboardFieldsStackStyle,
  sipSettingsDashboardGridStyle as haStatusDashboardGridStyle,
} from "../../System/System Settings/components/SipSettingsFormFields";
import { HaStatusNotEnabledPanel } from "../../System/System Settings/components/HaConfigFormFields";
import {
  HaStatusNodeRows,
  HaStatusPeerSectionHeading,
} from "./components/HaStatusFormFields";
import { useHaStatusPage } from "./hooks/useHaStatusPage";

const haStatusOutputCardStyle = {
  ...haStatusCardStyle,
  marginTop: 16,
};

const haStatusOutputHeaderStyle = {
  display: "grid",
  gridTemplateColumns: "1fr auto 1fr",
  alignItems: "center",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.divider}`,
  background: C.cardBg,
  boxSizing: "border-box",
};

const haStatusOutputActionsStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexWrap: "wrap",
  gap: 8,
};

const haStatusOutputClearWrapStyle = {
  display: "flex",
  justifyContent: "flex-end",
};

const haStatusOutputStyle = {
  display: "block",
  width: "100%",
  minHeight: 220,
  maxHeight: 420,
  margin: 0,
  padding: "12px 14px",
  border: "none",
  outline: "none",
  resize: "vertical",
  background: "#f8fafc",
  color: C.valueText,
  fontFamily:
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace",
  fontSize: 12,
  lineHeight: 1.5,
  whiteSpace: "pre-wrap",
  boxSizing: "border-box",
};

const haStatusLoadingStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  padding: "48px 16px",
  color: C.mutedText,
  fontSize: 13,
};

const HaStatusPage = () => {
  const navigate = useNavigate();
  const isCompact = useMediaQuery(HA_STATUS_COMPACT_MQ);
  const labelColWidth = isCompact ? 160 : HA_STATUS_LABEL_WIDTH;
  const outputRef = useRef(null);

  const {
    localStatus,
    peerStatus,
    haEnabled,
    loading,
    isRefreshing,
    actionBusy,
    syncDbOpen,
    banner,
    output,
    setBanner,
    setOutput,
    loadStatus,
    handlePhoneCheck,
    handleCheck,
    handleSyncDb,
  } = useHaStatusPage();

  useEffect(() => {
    if (!outputRef.current || !output) return;
    outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [output]);

  const onConfigure = () => {
    navigate(ROUTE_PATHS.SYSTEM_SETTINGS_HA_CONFIG);
  };

  const buttonsBusy = Boolean(actionBusy) || isRefreshing;
  const peerNode = peerStatus.status;
  const peerTitle = peerStatus.peer
    ? `Peer ${peerStatus.peer}`
    : HA_STATUS_SECTION_PEER;
  const showSyncDbButton =
    String(localStatus?.mode || "").toLowerCase() === "backup";

  return (
    <div style={haStatusPageWrapStyle} data-native-scroll>
      <div style={haStatusPageInnerStyle}>
        {banner.text && (
          <Alert
            severity={
              banner.type === "success"
                ? "success"
                : banner.type === "warning"
                  ? "warning"
                  : "error"
            }
            onClose={() => setBanner({ type: "", text: "" })}
            sx={haStatusFixedAlertSx}
          >
            {banner.text}
          </Alert>
        )}

        <HaStatusBreadcrumb
          root={HA_STATUS_BREADCRUMB_SEGMENTS[0]}
          section={HA_STATUS_BREADCRUMB_SEGMENTS[1]}
          current={HA_STATUS_BREADCRUMB_SEGMENTS[2]}
        />

        <div style={haStatusCardStyle}>
          <div style={haStatusToolbarStyle}>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: C.labelText,
              }}
            >
              {HA_STATUS_CARD_TITLE}
            </span>
            <Btn
              variant="cancel"
              disabled={buttonsBusy}
              style={haStatusRefreshBtnStyle}
              onClick={() => loadStatus({ silent: false })}
            >
              {HA_STATUS_BTN_REFRESH}
            </Btn>
          </div>

          <div style={{ padding: 0, boxSizing: "border-box" }}>
            {loading ? (
              <div style={haStatusLoadingStyle}>
                <CircularProgress size={22} sx={{ color: C.accent }} />
                {HA_STATUS_LOADING_TEXT}
              </div>
            ) : !localStatus ? (
              <div
                style={{
                  padding: "24px 20px",
                  color: C.mutedText,
                  fontSize: 13,
                }}
              >
                {banner.text || HA_STATUS_LOAD_FAILED}
              </div>
            ) : !haEnabled ? (
              <div style={{ padding: "16px 20px 20px" }}>
                <HaStatusNotEnabledPanel onConfigure={onConfigure} />
              </div>
            ) : (
              <div
                className="settings-dashboard-grid"
                style={haStatusDashboardGridStyle(isCompact)}
              >
                <div style={haStatusDashboardColumnStyle(isCompact)}>
                  <div style={haStatusDashboardFieldsStackStyle}>
                    <HaStatusSectionHeading
                      title={HA_STATUS_SECTION_LOCAL}
                      isFirst
                    />
                    <HaStatusNodeRows
                      node={localStatus}
                      isCompact={isCompact}
                      labelColWidth={labelColWidth}
                      labelOffsetLeft={isCompact ? 0 : 60}
                    />
                  </div>
                </div>

                {!isCompact && (
                  <div
                    className="settings-dashboard-divider"
                    style={haStatusDashboardDividerCellStyle}
                    aria-hidden="true"
                  >
                    <div style={haStatusDashboardDividerLineStyle} />
                  </div>
                )}

                <div style={haStatusDashboardColumnStyle(isCompact)}>
                  <div style={haStatusDashboardFieldsStackStyle}>
                    <HaStatusPeerSectionHeading
                      title={peerTitle}
                      reachable={peerStatus.reachable}
                      isFirst
                    />
                    {peerStatus.error ? (
                      <div
                        style={{
                          color: C.errorRed,
                          fontSize: 12,
                          lineHeight: 1.45,
                          whiteSpace: "pre-wrap",
                          marginBottom: 8,
                        }}
                      >
                        {peerStatus.error}
                      </div>
                    ) : null}
                    <HaStatusNodeRows
                      node={peerNode}
                      isCompact={isCompact}
                      labelColWidth={labelColWidth}
                      labelOffsetLeft={isCompact ? 0 : 60}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={haStatusOutputCardStyle}>
          <div style={haStatusOutputHeaderStyle}>
            <div />
            <div style={haStatusOutputActionsStyle}>
              <Btn
                variant="cancel"
                style={haStatusRefreshBtnStyle}
                disabled={buttonsBusy}
                onClick={handlePhoneCheck}
              >
                {actionBusy === HA_STATUS_BTN_PHONE_CHECK
                  ? HA_STATUS_BTN_RUNNING
                  : HA_STATUS_BTN_PHONE_CHECK}
              </Btn>
              <Btn
                variant="cancel"
                style={haStatusRefreshBtnStyle}
                disabled={buttonsBusy}
                onClick={handleCheck}
              >
                {actionBusy === HA_STATUS_BTN_CHECK
                  ? HA_STATUS_BTN_RUNNING
                  : HA_STATUS_BTN_CHECK}
              </Btn>
              {showSyncDbButton ? (
                <Btn
                  variant="cancel"
                  style={haStatusRefreshBtnStyle}
                  disabled={buttonsBusy}
                  onClick={handleSyncDb}
                >
                  {actionBusy === HA_STATUS_BTN_SYNC_DB
                    ? HA_STATUS_BTN_RUNNING
                    : HA_STATUS_BTN_SYNC_DB}
                </Btn>
              ) : null}
            </div>
            <div style={haStatusOutputClearWrapStyle}>
              <Btn
                variant="cancel"
                style={haStatusRefreshBtnStyle}
                onClick={() => setOutput("")}
              >
                {HA_STATUS_BTN_CLEAR}
              </Btn>
            </div>
          </div>
          <textarea
            ref={outputRef}
            readOnly
            spellCheck={false}
            style={haStatusOutputStyle}
            value={output}
            placeholder={HA_STATUS_OUTPUT_PLACEHOLDER}
          />
        </div>
      </div>

      <Dialog
        open={syncDbOpen}
        disableEscapeKeyDown
        onClose={() => {}}
        slotProps={{
          backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.5)" } },
        }}
        PaperProps={{
          sx: {
            width: 480,
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
          }}
        >
          {HA_STATUS_SYNC_DB_MODAL_TITLE}
        </DialogTitle>
        <DialogContent style={{ padding: "28px 24px", backgroundColor: "#fff" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
              textAlign: "center",
              color: C.labelText,
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            <CircularProgress size={28} sx={{ color: C.accent }} />
            {HA_STATUS_SYNC_DB_MODAL_TEXT}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HaStatusPage;
