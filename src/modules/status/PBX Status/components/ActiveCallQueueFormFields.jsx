import React from "react";
import { CircularProgress, Alert, useMediaQuery } from "@mui/material";
import {
  Btn,
  ExtensionBreadcrumb,
  TH,
  extensionFixedAlertSx as activeCallQueueFixedAlertSx,
} from "../../../../components/common";
import { C } from "../../../../theme/pbxTokens";
import { ACTIVE_CALL_QUEUE_AGENT_SEARCH_PLACEHOLDER, ACTIVE_CALL_QUEUE_BREADCRUMB_SEGMENTS, ACTIVE_CALL_QUEUE_COMPACT_MQ, ACTIVE_CALL_QUEUE_EMPTY_MESSAGE, ACTIVE_CALL_QUEUE_LIST_HEADING, ACTIVE_CALL_QUEUE_STATS_BREADCRUMB_SEGMENTS, ACTIVE_CALL_QUEUE_STATS_BTN_LABEL, ACTIVE_CALL_QUEUE_STATS_TABLE_MIN_WIDTH, ACTIVE_CALL_QUEUE_TAB_LABELS, ACTIVE_CALL_QUEUE_TAB_VALUES } from "../../../../constants/ActiveCallQueueConstants";
import { useActiveCallQueueStatsPage } from "../hooks/useActiveCallQueueStatsPage";
import { normalizeActiveCallQueue } from "../utils/ActiveCallQueueTransformers";
import {
  ACTIVE_CALL_QUEUE_STAT_CARD_SHADOW,
  ACTIVE_CALL_QUEUE_TABLE_CARD_RADIUS,
  ActiveCallQueueToolbarSearchBar,
  ActiveCallQueueTableListEmptyState,
  ActiveCallQueueTableListLoading,
  activeCallQueueCancelBtnStyle,
  activeCallQueueCardStyle,
  activeCallQueuePageInnerStyle,
  activeCallQueuePageWrapStyle,
  activeCallQueuePrimaryBtnStyle,
  activeCallQueueStatsCardStyle,
  activeCallQueueStatsFooterStyle,
  activeCallQueueStatsHeaderLeftStyle,
  activeCallQueueStatsHeaderStyle,
  activeCallQueueStatsHeaderToolbarStyle,
  activeCallQueueStatsToolbarBtnStyle,
  activeCallQueueTdStyle,
  activeCallQueueToolbarStyle,
  getActiveCallQueueRowBg,
} from "./ActiveCallQueueTableHelpers";

export const ActiveCallQueueBreadcrumb = ({ style } = {}) => (
  <ExtensionBreadcrumb
    root={ACTIVE_CALL_QUEUE_BREADCRUMB_SEGMENTS[0]}
    section={ACTIVE_CALL_QUEUE_BREADCRUMB_SEGMENTS[1]}
    current={ACTIVE_CALL_QUEUE_BREADCRUMB_SEGMENTS[2]}
    style={style}
  />
);

/** 4-segment stats crumb — ExtensionBreadcrumb is 3-level; append leaf as current. */
export const ActiveCallQueueStatsBreadcrumb = ({ style } = {}) => {
  const s = ACTIVE_CALL_QUEUE_STATS_BREADCRUMB_SEGMENTS;
  return (
    <div
      style={{
        fontSize: 12,
        color: "#94a3b8",
        marginBottom: 16,
        fontWeight: 400,
        display: "flex",
        alignItems: "center",
        gap: 4,
        flexWrap: "wrap",
        ...style,
      }}
    >
      <span>{s[0]}</span>
      <span>&gt;</span>
      <span>{s[1]}</span>
      <span>&gt;</span>
      <span>{s[2]}</span>
      <span>&gt;</span>
      <span style={{ color: "#1e293b", fontWeight: 600 }}>{s[3]}</span>
    </div>
  );
};

// ── Shared: Answered rate progress bar ───────────────────────────────────────
const AnsweredRateBar = ({ rate }) => (
  <div
    style={{
      width: "100%",
      background: "#e2e8f0",
      borderRadius: 3,
      height: 6,
      overflow: "hidden",
    }}
  >
    <div
      style={{
        width: `${Math.min(Number(rate) || 0, 100)}%`,
        background: C.successGreen,
        height: "100%",
        borderRadius: 3,
        transition: "width 0.3s ease",
      }}
    />
  </div>
);

// ── Shared: Stat card ─────────────────────────────────────────────────────────
const StatCard = ({ label, value, color }) => (
  <div
    style={{
      background: C.cardBg,
      border: `1px solid ${C.cardBorder}`,
      borderRadius: ACTIVE_CALL_QUEUE_TABLE_CARD_RADIUS,
      padding: "14px 16px",
      textAlign: "center",
      boxShadow: ACTIVE_CALL_QUEUE_STAT_CARD_SHADOW,
    }}
  >
    <div
      style={{
        fontSize: 22,
        fontWeight: 700,
        color: color || C.accent,
        marginBottom: 4,
      }}
    >
      {value ?? 0}
    </div>
    <div style={{ fontSize: 11, color: C.labelText, fontWeight: 500 }}>
      {label}
    </div>
  </div>
);

const TD = ({ children, align = "center", mono, muted, bg, style: extra }) => (
  <td
    style={{
      ...activeCallQueueTdStyle,
      color: mono ? C.accent : muted ? C.mutedText : C.valueText,
      textAlign: align,
      fontFamily: mono ? "monospace, monospace" : "inherit",
      fontWeight: mono ? 600 : 400,
      ...(bg != null ? { background: bg } : {}),
      ...extra,
    }}
  >
    {children ?? <span style={{ color: C.mutedText }}>—</span>}
  </td>
);

const tableStyle = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: 0,
};

const statsTableWrapStyle = {
  width: "100%",
  maxWidth: "100%",
  overflowX: "hidden",
};

const statsTableStyle = {
  width: "100%",
  maxWidth: "100%",
  borderCollapse: "separate",
  borderSpacing: 0,
  tableLayout: "fixed",
};

/** Statistics headings: wrap inside column, centered with side spacing */
const statsThStyle = {
  textAlign: "center",
  boxSizing: "border-box",
  verticalAlign: "middle",
  whiteSpace: "normal",
  wordBreak: "break-word",
  overflowWrap: "break-word",
  padding: "8px 5px",
  lineHeight: 1.35,
  letterSpacing: "0.06em",
};

const statsTdWrapStyle = {
  textAlign: "center",
  whiteSpace: "normal",
  wordBreak: "break-word",
  overflow: "hidden",
  boxSizing: "border-box",
  verticalAlign: "middle",
};

const StatsTH = ({ children, style: extra }) => (
  <TH style={{ textAlign: "center", ...statsThStyle, ...extra }}>
    {children}
  </TH>
);

const StatsTD = ({ children, bg, mono, muted, style: extra }) => (
  <TD
    align="center"
    bg={bg}
    mono={mono}
    muted={muted}
    style={{ ...statsTdWrapStyle, ...extra }}
  >
    <div style={{ width: "100%", textAlign: "center" }}>
      {children != null && children !== "" ? (
        children
      ) : (
        <span style={{ color: C.mutedText }}>—</span>
      )}
    </div>
  </TD>
);

const AGENT_STATS_COL_WIDTHS = [
  "8%",
  "9%",
  "9%",
  "9%",
  "8%",
  "12%",
  "16%",
  "11%",
  "9%",
  "10%",
];

const QUEUE_STATS_COL_WIDTHS = [
  "8%",
  "11%",
  "9%",
  "8%",
  "12%",
  "11%",
  "11%",
  "12%",
  "12%",
  "15%",
];

const StatsColGroup = ({ widths }) => (
  <colgroup>
    {widths.map((width, index) => (
      <col key={index} style={{ width }} />
    ))}
  </colgroup>
);

// ── Shared: Rate pill ─────────────────────────────────────────────────────────
const RatePill = ({ value }) => (
  <span
    style={{
      background: Number(value) > 0 ? "#dcfce7" : "#f1f5f9",
      color: Number(value) > 0 ? C.successGreen : C.labelText,
      padding: "2px 9px",
      borderRadius: 10,
      fontSize: 10.5,
      fontWeight: 600,
    }}
  >
    {value ?? "0"}%
  </span>
);

// ═══════════════════════════════════════════════════════════════════════════════
// CALL QUEUE STATISTICS VIEW
// ═══════════════════════════════════════════════════════════════════════════════

export const CallQueueStatistics = ({ onBack, initialQueue }) => {
  const { activeTab, setActiveTab, agentSearch, setAgentSearch, agentData, setAgentData, queueData, setQueueData, loadingAgent, loadingQueue, lastUpdated, filteredAgents } = useActiveCallQueueStatsPage(initialQueue);
  const isCompact = useMediaQuery(ACTIVE_CALL_QUEUE_COMPACT_MQ);
  return (
    <div style={{ ...activeCallQueuePageWrapStyle, ...(isCompact ? { padding: 8 } : {}) }}>
      <div style={activeCallQueuePageInnerStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 16,
            flexWrap: "wrap",
            ...(isCompact
              ? { flexDirection: "column", alignItems: "flex-start", gap: 6 }
              : {}),
          }}
        >
          <ActiveCallQueueStatsBreadcrumb style={{ marginBottom: 0 }} />
          {lastUpdated && (
            <span
              style={{
                fontSize: 11,
                color: C.mutedText,
                flexShrink: 0,
                ...(isCompact ? { marginLeft: 0 } : { marginLeft: "auto" }),
              }}
            >
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>

        <div style={activeCallQueueStatsCardStyle}>
          <div
            style={{
              ...activeCallQueueStatsHeaderStyle,
              ...(isCompact
                ? { flexDirection: "column", alignItems: "stretch" }
                : {}),
            }}
          >
            <div
              style={{
                ...activeCallQueueStatsHeaderLeftStyle,
                ...(isCompact ? { width: "100%" } : {}),
              }}
            >
              <Btn
                type="button"
                variant={
                  activeTab === ACTIVE_CALL_QUEUE_TAB_VALUES.agent
                    ? "tabActive"
                    : "tabInactive"
                }
                onClick={() => setActiveTab(ACTIVE_CALL_QUEUE_TAB_VALUES.agent)}
                style={{ height: 30, borderRadius: 4 }}
              >
                {ACTIVE_CALL_QUEUE_TAB_LABELS.agent}
              </Btn>
              <Btn
                type="button"
                variant={
                  activeTab === ACTIVE_CALL_QUEUE_TAB_VALUES.queue
                    ? "tabActive"
                    : "tabInactive"
                }
                onClick={() => setActiveTab(ACTIVE_CALL_QUEUE_TAB_VALUES.queue)}
                style={{ height: 30, borderRadius: 4 }}
              >
                {ACTIVE_CALL_QUEUE_TAB_LABELS.queue}
              </Btn>
            </div>

            <div
              style={{
                ...activeCallQueueStatsHeaderToolbarStyle,
                ...(isCompact
                  ? {
                      width: "100%",
                      marginLeft: 0,
                      justifyContent: "flex-end",
                    }
                  : {}),
              }}
            >
              {activeTab === ACTIVE_CALL_QUEUE_TAB_VALUES.agent && (
                <ActiveCallQueueToolbarSearchBar
                  value={agentSearch}
                  onChange={(e) => setAgentSearch(e.target.value)}
                  placeholder={ACTIVE_CALL_QUEUE_AGENT_SEARCH_PLACEHOLDER}
                  fitPlaceholder
                  style={{ borderRadius: 4 }}
                />
              )}
              <Btn
                variant="cancel"
                onClick={() => {
                  setAgentData([]);
                  setQueueData([]);
                }}
                style={activeCallQueueStatsToolbarBtnStyle}
              >
                Clear
              </Btn>
              <Btn
                variant="cancel"
                onClick={onBack}
                style={activeCallQueueStatsToolbarBtnStyle}
              >
                ← Back
              </Btn>
            </div>
          </div>

          {/* ── AGENT STATISTICS TAB ── */}
          {activeTab === ACTIVE_CALL_QUEUE_TAB_VALUES.agent && (
            <>
              {loadingAgent && agentData.length === 0 ? (
                <div style={{ padding: "14px 16px 16px" }}>
                  <ActiveCallQueueTableListLoading />
                </div>
              ) : filteredAgents.length === 0 ? (
                <div style={{ padding: "14px 16px 16px" }}>
                  <ActiveCallQueueTableListEmptyState
                    message={
                      agentSearch
                        ? `No results for "${agentSearch}"`
                        : "No agent data available"
                    }
                    showButton={false}
                  />
                </div>
              ) : (
                <>
                  <div
                    style={{
                      ...statsTableWrapStyle,
                      ...(isCompact
                        ? {
                            overflowX: "auto",
                            WebkitOverflowScrolling: "touch",
                          }
                        : {}),
                    }}
                  >
                    <table
                      style={{
                        ...statsTableStyle,
                        ...(isCompact
                          ? {
                              minWidth: ACTIVE_CALL_QUEUE_STATS_TABLE_MIN_WIDTH,
                              tableLayout: "auto",
                            }
                          : {}),
                      }}
                    >
                      <StatsColGroup widths={AGENT_STATS_COL_WIDTHS} />
                      <thead>
                        <tr>
                          <StatsTH>Agent No.</StatsTH>
                          <StatsTH>Agent Name</StatsTH>
                          <StatsTH>Online Time</StatsTH>
                          <StatsTH>Total Calls</StatsTH>
                          <StatsTH>Answered</StatsTH>
                          <StatsTH>Answered Rate</StatsTH>
                          <StatsTH>Caller Hangup (Ring)</StatsTH>
                          <StatsTH>Avg Talk Time</StatsTH>
                          <StatsTH>Idle Time</StatsTH>
                          <StatsTH style={{ borderRight: "none" }}>
                            Avg Idle Time
                          </StatsTH>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAgents.map((row, i) => {
                          const rowBg = getActiveCallQueueRowBg(false, i);
                          const isLastRow = i === filteredAgents.length - 1;
                          const lastRowCellStyle = isLastRow
                            ? { borderBottom: "none" }
                            : {};

                          return (
                            <tr
                              key={i}
                              style={{
                                background: rowBg,
                                transition: "background 0.15s ease",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#f1f5f9";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = rowBg;
                              }}
                            >
                              <StatsTD bg={rowBg} style={lastRowCellStyle}>
                                <strong style={{ color: C.valueText }}>
                                  {row.agent_number ?? row.agentNumber ?? "—"}
                                </strong>
                              </StatsTD>
                              <StatsTD bg={rowBg} style={lastRowCellStyle}>
                                {row.agent_name ?? row.agentName ?? null}
                              </StatsTD>
                              <StatsTD mono bg={rowBg} style={lastRowCellStyle}>
                                {row.online_time ?? row.onlineTime ?? null}
                              </StatsTD>
                              <StatsTD bg={rowBg} style={lastRowCellStyle}>
                                {row.total_calls ?? row.totalCalls ?? 0}
                              </StatsTD>
                              <StatsTD bg={rowBg} style={lastRowCellStyle}>
                                {row.answered_calls ?? row.answeredCalls ?? 0}
                              </StatsTD>
                              <StatsTD bg={rowBg} style={lastRowCellStyle}>
                                <RatePill
                                  value={
                                    row.answered_rate ?? row.answeredRate ?? 0
                                  }
                                />
                              </StatsTD>
                              <StatsTD bg={rowBg} style={lastRowCellStyle}>
                                {row.caller_hangup_while_agent_ring ??
                                  row.callerHangup ??
                                  0}
                              </StatsTD>
                              <StatsTD mono bg={rowBg} style={lastRowCellStyle}>
                                {row.avg_talk_time ??
                                  row.averageTalkTime ??
                                  null}
                              </StatsTD>
                              <StatsTD bg={rowBg} style={lastRowCellStyle}>
                                {row.idle_time ?? row.idleTime ?? null}
                              </StatsTD>
                              <StatsTD
                                bg={rowBg}
                                style={{
                                  ...lastRowCellStyle,
                                  borderRight: "none",
                                }}
                              >
                                {row.avg_idle_time ??
                                  row.averageIdleTime ??
                                  null}
                              </StatsTD>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div style={activeCallQueueStatsFooterStyle}>
                    <span style={{ fontSize: 11, color: C.mutedText }}>
                      Showing {filteredAgents.length} Agent
                      {filteredAgents.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </>
              )}
            </>
          )}

          {/* ── QUEUE STATISTICS TAB ── */}
          {activeTab === ACTIVE_CALL_QUEUE_TAB_VALUES.queue && (
            <>
              {loadingQueue && queueData.length === 0 ? (
                <div style={{ padding: "14px 16px 16px" }}>
                  <ActiveCallQueueTableListLoading />
                </div>
              ) : queueData.length === 0 ? (
                <div style={{ padding: "14px 16px 16px" }}>
                  <ActiveCallQueueTableListEmptyState
                    message="No queue data available"
                    showButton={false}
                  />
                </div>
              ) : (
                <>
                  <div
                    style={{
                      ...statsTableWrapStyle,
                      ...(isCompact
                        ? {
                            overflowX: "auto",
                            WebkitOverflowScrolling: "touch",
                          }
                        : {}),
                    }}
                  >
                    <table
                      style={{
                        ...statsTableStyle,
                        ...(isCompact
                          ? {
                              minWidth: ACTIVE_CALL_QUEUE_STATS_TABLE_MIN_WIDTH,
                              tableLayout: "auto",
                            }
                          : {}),
                      }}
                    >
                      <StatsColGroup widths={QUEUE_STATS_COL_WIDTHS} />
                      <thead>
                        <tr>
                          <StatsTH>Queue No.</StatsTH>
                          <StatsTH>Queue Name</StatsTH>
                          <StatsTH>Total Calls</StatsTH>
                          <StatsTH>Answered</StatsTH>
                          <StatsTH>Answered Rate</StatsTH>
                          <StatsTH>Avg Wait Time</StatsTH>
                          <StatsTH>Avg Talk Time</StatsTH>
                          <StatsTH>Caller Hangup</StatsTH>
                          <StatsTH>Timeout Calls</StatsTH>
                          <StatsTH style={{ borderRight: "none" }}>
                            Callback Calls
                          </StatsTH>
                        </tr>
                      </thead>
                      <tbody>
                        {queueData.map((row, i) => {
                          const rowBg = getActiveCallQueueRowBg(false, i);
                          const isLastRow = i === queueData.length - 1;
                          const lastRowCellStyle = isLastRow
                            ? { borderBottom: "none" }
                            : {};

                          return (
                            <tr
                              key={i}
                              style={{
                                background: rowBg,
                                transition: "background 0.15s ease",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#f1f5f9";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = rowBg;
                              }}
                            >
                              <StatsTD bg={rowBg} style={lastRowCellStyle}>
                                <strong style={{ color: C.valueText }}>
                                  {row.queue_number ?? row.queueNumber ?? "—"}
                                </strong>
                              </StatsTD>
                              <StatsTD bg={rowBg} style={lastRowCellStyle}>
                                {row.queue_name ?? row.queueName ?? null}
                              </StatsTD>
                              <StatsTD bg={rowBg} style={lastRowCellStyle}>
                                {row.total_calls ?? row.totalCalls ?? 0}
                              </StatsTD>
                              <StatsTD bg={rowBg} style={lastRowCellStyle}>
                                {row.answered_calls ?? row.answeredCalls ?? 0}
                              </StatsTD>
                              <StatsTD bg={rowBg} style={lastRowCellStyle}>
                                <RatePill
                                  value={
                                    row.answered_rate ?? row.answeredRate ?? 0
                                  }
                                />
                              </StatsTD>
                              <StatsTD mono bg={rowBg} style={lastRowCellStyle}>
                                {row.average_wait_time ??
                                  row.avgWaitTime ??
                                  null}
                              </StatsTD>
                              <StatsTD mono bg={rowBg} style={lastRowCellStyle}>
                                {row.average_talk_time ??
                                  row.avgTalkTime ??
                                  null}
                              </StatsTD>
                              <StatsTD bg={rowBg} style={lastRowCellStyle}>
                                {row.caller_hangup ?? row.callerHangup ?? 0}
                              </StatsTD>
                              <StatsTD bg={rowBg} style={lastRowCellStyle}>
                                {row.call_queue_timeout_calls ??
                                  row.timeoutCalls ??
                                  0}
                              </StatsTD>
                              <StatsTD
                                bg={rowBg}
                                style={{
                                  ...lastRowCellStyle,
                                  borderRight: "none",
                                }}
                              >
                                {row.callback_calls ?? row.callbackCalls ?? 0}
                              </StatsTD>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div style={activeCallQueueStatsFooterStyle}>
                    <span style={{ fontSize: 11, color: C.mutedText }}>
                      Showing {queueData.length} Queue
                      {queueData.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const ActiveCallQueuePageContent = (props) => {
  const { queueList, selectedQueue, setSelectedQueue, hasLoaded, isRefreshing, error, setError, lastUpdated, loadActivity, onShowStats } = props;
  const norm = normalizeActiveCallQueue;
  const sel = selectedQueue ? norm(selectedQueue) : null;
  return (
    <div style={activeCallQueuePageWrapStyle}>
      <div style={activeCallQueuePageInnerStyle}>
        {error && (
          <Alert
            severity="error"
            onClose={() => setError?.("")}
            sx={activeCallQueueFixedAlertSx}
          >
            {error}
          </Alert>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <ActiveCallQueueBreadcrumb style={{ marginBottom: 0 }} />
          {lastUpdated && (
            <span
              style={{
                fontSize: 11,
                color: C.mutedText,
                flexShrink: 0,
                marginLeft: "auto",
              }}
            >
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>

        <div style={activeCallQueueCardStyle}>
          <div style={activeCallQueueToolbarStyle}>
            {hasLoaded && queueList.length > 0 && (
              <span style={{ fontSize: 11, color: C.mutedText }}>
                Showing {queueList.length} queue
                {queueList.length !== 1 ? "s" : ""}
              </span>
            )}
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginLeft: "auto",
              }}
            >
              <Btn
                variant="cancel"
                onClick={() => loadActivity(false)}
                disabled={isRefreshing}
                style={activeCallQueueCancelBtnStyle}
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
              <Btn
                variant="primary"
                onClick={onShowStats}
                style={activeCallQueuePrimaryBtnStyle}
              >
                {ACTIVE_CALL_QUEUE_STATS_BTN_LABEL}
              </Btn>
            </div>
          </div>

          <div style={{ padding: "14px 16px 16px" }}>
            {/* Initial load */}
            {!hasLoaded && queueList.length === 0 && !error && (
              <ActiveCallQueueTableListLoading />
            )}

            {hasLoaded && !error && queueList.length === 0 && (
              <ActiveCallQueueTableListEmptyState
                message={ACTIVE_CALL_QUEUE_EMPTY_MESSAGE}
                showButton={false}
              />
            )}

            {/* Main content */}
            {queueList.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    alignItems: "flex-start",
                  }}
                >
                  {/* ── LEFT: Queue list ── */}
                  <div style={{ width: 190, flexShrink: 0 }}>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: C.mutedText,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        marginBottom: 8,
                      }}
                    >
                      {ACTIVE_CALL_QUEUE_LIST_HEADING} ({queueList.length})
                    </div>
                    {queueList.map((q, i) => {
                      const n = norm(q);
                      const isSelected = sel?.number === n.number;
                      return (
                        <div
                          key={i}
                          onClick={() => setSelectedQueue(q)}
                          style={{
                            background: isSelected ? "#eff6ff" : C.cardBg,
                            border: `1px solid ${isSelected ? C.accent : C.cardBorder}`,
                            borderLeft: `3px solid ${isSelected ? C.accent : "transparent"}`,
                            borderRadius: ACTIVE_CALL_QUEUE_TABLE_CARD_RADIUS,
                            padding: "10px 12px",
                            marginBottom: 8,
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                            boxShadow: isSelected
                              ? `0 0 0 1px ${C.accent}20`
                              : "0 1px 3px rgba(0,0,0,0.04)",
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected)
                              e.currentTarget.style.background = "#f8fafc";
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected)
                              e.currentTarget.style.background = C.cardBg;
                          }}
                        >
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: C.accent,
                              marginBottom: 4,
                            }}
                          >
                            {n.number}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: C.mutedText,
                              marginBottom: 8,
                            }}
                          >
                            {n.name}
                          </div>

                          {/* Active badge */}
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              // background: "#dcfce7",
                              color: C.successGreen,
                              fontSize: 12,
                              fontWeight: 700,
                              padding: "1px 8px",
                              borderRadius: 10,
                              marginBottom: 8,
                            }}
                          >
                            <span
                              style={{
                                width: 5,
                                height: 5,
                                borderRadius: "50%",
                                background: C.successGreen,
                              }}
                            />
                            {n.status}
                          </span>

                          <AnsweredRateBar rate={n.answeredRate} />
                          <div
                            style={{
                              fontSize: 10,
                              color: C.mutedText,
                              marginTop: 4,
                            }}
                          >
                            Answered Rate: {n.answeredRate}%
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* ── RIGHT: Detail panel ── */}
                  {sel && (
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                      }}
                    >
                      {/* Queue header card */}
                      <div
                        style={{
                          background: C.cardBg,
                          border: `1px solid ${C.cardBorder}`,
                          borderRadius: ACTIVE_CALL_QUEUE_TABLE_CARD_RADIUS,
                          padding: "12px 18px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          boxShadow: ACTIVE_CALL_QUEUE_STAT_CARD_SHADOW,
                        }}
                      >
                        <div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              marginBottom: 10,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 18,
                                fontWeight: 700,
                                color: C.valueText,
                              }}
                            >
                              {sel.number}
                            </span>
                            <span style={{ fontSize: 13, color: C.labelText }}>
                              ({sel.name})
                            </span>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                // background: "#dcfce7",
                                color: C.successGreen,
                                fontSize: 12,
                                fontWeight: 700,
                                padding: "2px 10px",
                                borderRadius: 10,
                              }}
                            >
                              <span
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: "50%",
                                  background: C.successGreen,
                                }}
                              />
                              {sel.status}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <span style={{ fontSize: 11, color: C.labelText }}>
                              Answered Rate
                            </span>
                            <div style={{ width: 160 }}>
                              <AnsweredRateBar rate={sel.answeredRate} />
                            </div>
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: C.valueText,
                              }}
                            >
                              {sel.answeredRate}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Call metrics — 4 cards */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(4,1fr)",
                          gap: 10,
                        }}
                      >
                        <StatCard
                          label="Total Calls"
                          value={sel.totalCalls}
                          color={C.accent}
                        />
                        <StatCard
                          label="Answered Calls"
                          value={sel.answeredCalls}
                          color={C.accent}
                        />
                        <StatCard
                          label="Waiting Calls"
                          value={sel.waitingCalls}
                          color={C.accent}
                        />
                        <StatCard
                          label="Abandoned Calls"
                          value={sel.abandonedCalls}
                          color={C.accent}
                        />
                      </div>

                      {/* Agent metrics — 4 cards */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(4,1fr)",
                          gap: 10,
                        }}
                      >
                        <StatCard
                          label="Total Agents"
                          value={sel.totalAgents}
                          color={C.accent}
                        />
                        <StatCard
                          label="Active Agents"
                          value={sel.activeAgents}
                          color={C.accent}
                        />
                        <StatCard
                          label="Idle Agents"
                          value={sel.idleAgents}
                          color={C.accent}
                        />
                        <StatCard
                          label="On Call Agents"
                          value={sel.onCallAgents}
                          color={C.accent}
                        />
                      </div>

                      {/* Timing — 2 cards */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(2,1fr)",
                          gap: 10,
                        }}
                      >
                        {[
                          {
                            label: "Average Waiting Time",
                            value: sel.avgWaitTime,
                          },
                          {
                            label: "Average Talking Time",
                            value: sel.avgTalkTime,
                          },
                        ].map(({ label, value }) => (
                          <div
                            key={label}
                            style={{
                              background: C.cardBg,
                              border: `1px solid ${C.cardBorder}`,
                              borderRadius: ACTIVE_CALL_QUEUE_TABLE_CARD_RADIUS,
                              padding: "12px 18px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              boxShadow: ACTIVE_CALL_QUEUE_STAT_CARD_SHADOW,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 12,
                                color: C.labelText,
                                fontWeight: 500,
                              }}
                            >
                              {label}
                            </span>
                            <span
                              style={{
                                fontSize: 15,
                                fontWeight: 700,
                                color: C.accent,
                                fontFamily: "monospace",
                              }}
                            >
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
