import React from "react";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import HeadsetMicIcon from "@mui/icons-material/HeadsetMic";
import CallEndIcon from "@mui/icons-material/CallEnd";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { IconButton, Alert, CircularProgress, Tooltip } from "@mui/material";
import {
  ACTIVE_CALLS_BREADCRUMB_SEGMENTS,
  ACTIVE_CALLS_EMPTY_SUBTITLE,
  ACTIVE_CALLS_EMPTY_TITLE,
} from "../../../constants/ActiveCallsConstants";
import { C } from "../../../theme/pbxTokens";
import {
  Btn,
  ExtensionBreadcrumb as ActiveCallsBreadcrumb,
  extensionPageWrapStyle as activeCallsPageWrapStyle,
  extensionPageInnerStyle as activeCallsPageInnerStyle,
  extensionFixedAlertSx as activeCallsFixedAlertSx,
} from "../../../components/common";
import { useActiveCallsPage } from "./hooks/useActiveCallsPage";
import {
  ACTIVE_CALLS_CARD_RADIUS,
  ACTIVE_CALLS_CARD_SHADOW,
  ACTIVE_CALLS_ITEM_CARD_SHADOW,
  activeCallsRefreshBtnStyle,
} from "./components/ActiveCallsTableHelpers";
import {
  callInstanceKey,
  channelDisplayLine,
  formatDuration,
  parseCreationTime,
  resolveCallerCallee,
  stateLabel,
  TALKING_DISPLAY_OFFSET_SEC,
} from "./utils/ActiveCallsTransformers";

const ActiveCallsPage = () => {
  const {
    channels,
    hasLoaded,
    isRefreshing,
    error,
    setError,
    hangupChannelId,
    talkingStartedAtRef,
    loadChannels,
    handleHangup,
  } = useActiveCallsPage();

  // Always reserve two columns on desktop so one card keeps same size
  const gridClass = "grid-cols-1 md:grid-cols-2";

  return (
    <div style={activeCallsPageWrapStyle}>
      <div style={activeCallsPageInnerStyle}>
        {error && (
          <Alert
            severity="error"
            onClose={() => setError(null)}
            sx={activeCallsFixedAlertSx}
          >
            {error}
          </Alert>
        )}

        <ActiveCallsBreadcrumb
          root={ACTIVE_CALLS_BREADCRUMB_SEGMENTS[0]}
          section={ACTIVE_CALLS_BREADCRUMB_SEGMENTS[1]}
          current={ACTIVE_CALLS_BREADCRUMB_SEGMENTS[2]}
        />

        {/* Main card */}
        <div
          className="w-full max-w-full overflow-hidden"
          style={{
            backgroundColor: C.cardBg,
            border: `1px solid ${C.cardBorder}`,
            borderRadius: ACTIVE_CALLS_CARD_RADIUS,
            boxShadow: ACTIVE_CALLS_CARD_SHADOW,
          }}
        >
          {/* Toolbar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              minHeight: 44,
              padding: "7px 14px",
              borderBottom: `1px solid ${C.divider}`,
              background: "#ffffff",
              flexWrap: "wrap",
              gap: 12,
              borderTopLeftRadius: ACTIVE_CALLS_CARD_RADIUS,
              borderTopRightRadius: ACTIVE_CALLS_CARD_RADIUS,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {hasLoaded && channels.length > 0 && (
                <span
                  style={{
                    background: "#eff6ff",
                    color: C.accent,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "5px 12px",
                    borderRadius: 999,
                    border: `1px solid ${C.accent}`,
                  }}
                >
                  {channels.length} {ACTIVE_CALLS_ACTIVE_BADGE_SUFFIX}
                </span>
              )}
            </div>
            <Btn
              variant="cancel"
              onClick={() => loadChannels(false)}
              disabled={isRefreshing}
              style={activeCallsRefreshBtnStyle}
            >
              {isRefreshing ? (
                <>
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                  Refreshing...
                </>
              ) : (
                "Refresh"
              )}
            </Btn>
          </div>

          {/* Body */}
          <div
            className="min-h-[200px]"
            style={{ padding: "14px 16px 16px" }}
          >
            {!error && hasLoaded && channels.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="text-5xl mb-4">📞</div>
                <div
                  className="text-lg font-semibold"
                  style={{ color: C.valueText }}
                >
                  {ACTIVE_CALLS_EMPTY_TITLE}
                </div>
                <div className="text-sm mt-1" style={{ color: C.mutedText }}>
                  {ACTIVE_CALLS_EMPTY_SUBTITLE}
                </div>
              </div>
            )}

            {!error && !hasLoaded && channels.length === 0 && (
              <div className="flex justify-center py-12">
                <CircularProgress size={32} sx={{ color: C.accent }} />
              </div>
            )}

            {!error && channels.length > 0 && (
              <div className={`grid gap-4 ${gridClass}`}>
                {channels.map((ch) => {
                  const { caller: callerNum, callee: connectedNum } =
                    resolveCallerCallee(ch);
                  const instanceKey = callInstanceKey(ch);
                  const isUp = String(ch.state || "").toLowerCase() === "up";
                  const talkingStartMs =
                    isUp && instanceKey
                      ? talkingStartedAtRef.current.get(instanceKey)
                      : null;
                  const duration = isUp
                    ? formatDuration(
                        talkingStartMs ??
                          ch._mergedCreationTime ??
                          parseCreationTime(ch.creationtime),
                        TALKING_DISPLAY_OFFSET_SEC,
                      )
                    : "0:00:00";
                  const hangupIds = ch._mergedChannelIds?.length
                    ? ch._mergedChannelIds
                    : ch.id
                      ? [ch.id]
                      : [];
                  const hangupKey = hangupIds.join(",");
                  const status = stateLabel(ch.state);
                  const topLine = channelDisplayLine(ch);
                  const mainNumber = callerNum;
                  const extNumber = connectedNum;

                  return (
                    <div
                      key={
                        hangupKey || ch.id || ch.protocol_id || Math.random()
                      }
                      className="flex items-stretch min-w-0 overflow-hidden"
                      style={{
                        backgroundColor: C.cardBg,
                        borderRadius: ACTIVE_CALLS_CARD_RADIUS,
                        border: `1px solid ${C.cardBorder}`,
                        boxShadow: ACTIVE_CALLS_ITEM_CARD_SHADOW,
                      }}
                    >
                      <div className="flex items-center pl-4 pr-3 py-4 shrink-0">
                        <PersonOutlineIcon
                          sx={{ color: C.mutedText }}
                          style={{ fontSize: 38 }}
                        />
                      </div>

                      <div className="flex-1 min-w-0 py-4 pr-3 flex flex-col justify-center gap-1">
                        <div
                          className="text-sm leading-snug break-all"
                          style={{ color: C.valueText }}
                        >
                          {topLine}
                        </div>
                        <div
                          className="text-sm font-semibold truncate"
                          style={{ color: C.accent }}
                        >
                          {mainNumber}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <KeyboardArrowDownIcon
                            sx={{ color: C.labelText }}
                            className="shrink-0"
                            style={{ fontSize: 18 }}
                          />
                          <span
                            className="text-sm"
                            style={{ color: C.valueText }}
                          >
                            {extNumber || "—"}
                          </span>
                        </div>
                      </div>

                      <div
                        className="flex flex-col items-end justify-between py-4 pl-3 pr-4 min-w-[110px] shrink-0 border-l"
                        style={{ borderColor: C.divider }}
                      >
                        <div
                          className="flex items-center gap-1 text-sm font-semibold"
                          style={{ color: C.accent }}
                        >
                          <span>{status}</span>
                          <ArrowForwardIcon style={{ fontSize: 16 }} />
                        </div>
                        <div
                          className="text-sm font-mono my-1"
                          style={{ color: C.valueText }}
                        >
                          {duration}
                        </div>
                        <div className="flex items-center gap-1 mt-auto">
                          <HeadsetMicIcon
                            sx={{ color: C.labelText }}
                            style={{ fontSize: 20 }}
                          />
                          <Tooltip title="Hang up">
                            <span>
                              <IconButton
                                size="small"
                                aria-label="Hang up"
                                disabled={
                                  hangupIds.length === 0 ||
                                  hangupChannelId === hangupKey
                                }
                                onClick={() => handleHangup(hangupIds)}
                                sx={{
                                  color: C.errorRed,
                                  padding: "2px",
                                  borderRadius: 4,
                                }}
                              >
                                {hangupChannelId === hangupKey ? (
                                  <CircularProgress
                                    size={18}
                                    sx={{ color: C.errorRed }}
                                  />
                                ) : (
                                  <CallEndIcon style={{ fontSize: 20 }} />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveCallsPage;
