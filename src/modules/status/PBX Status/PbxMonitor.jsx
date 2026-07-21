import React from "react";
import { CircularProgress, useMediaQuery } from "@mui/material";
import { C } from "../../../theme/pbxTokens";
import {
  PBX_MONITOR_STAT_LABELS,
  PBX_MONITOR_TAB_LABELS,
  PBX_MONITOR_TAB_VALUES,
} from "../../../constants/PbxMonitorConstants";
import {
  Btn,
  ExtensionTableListEmptyState as PbxMonitorTableListEmptyState,
  ExtensionTableListLoading as PbxMonitorTableListLoading,
  ExtensionToolbarSearchBar as PbxMonitorToolbarSearchBar,
  TH,
  getExtensionRowBg as getPbxMonitorRowBg,
  extensionPageInnerStyle as pbxMonitorPageInnerStyle,
  extensionPageWrapStyle as pbxMonitorPageWrapStyle,
} from "../../../components/common";
import { usePbxMonitorPage } from "./hooks/usePbxMonitorPage";
import {
  PbxMonitorBreadcrumb,
  StatCard,
  StatusBadge,
  TD,
  TypePill,
} from "./components/PbxMonitorFormFields";
import {
  PBX_MONITOR_COMPACT_MQ,
  PBX_MONITOR_EXTENSION_TABLE_MIN_WIDTH,
  PBX_MONITOR_TRUNK_ACCENT,
  PBX_MONITOR_TRUNK_TABLE_MIN_WIDTH,
  pbxMonitorCancelBtnStyle,
  pbxMonitorCardHeaderStyle,
  pbxMonitorCardStyle,
  pbxMonitorFooterStyle,
  pbxMonitorHeaderLeftStyle,
  pbxMonitorHeaderToolbarStyle,
  tableStyle,
  tableWrapStyle,
} from "./components/PbxMonitorTableHelpers";

const PbxMonitor = () => {
  const isCompact = useMediaQuery(PBX_MONITOR_COMPACT_MQ);
  const vm = usePbxMonitorPage();
  const {
    activeTab,
    setActiveTab,
    hasLoaded,
    extensionRows,
    trunkRows,
    lastUpdated,
    searchQuery,
    setSearchQuery,
    isRefreshing,
    loadData,
    extRegistered,
    extUnregistered,
    trkRegistered,
    filteredExtensions,
    filteredTrunks,
    tableRows,
    searchPlaceholder,
    emptyMessage,
    recordLabel,
    getStatus,
  } = vm;

  return (
    <div style={{ ...pbxMonitorPageWrapStyle, ...(isCompact ? { padding: 8 } : {}) }}>
      <div style={pbxMonitorPageInnerStyle}>
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
          <PbxMonitorBreadcrumb style={{ marginBottom: 0 }} />
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

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isCompact
              ? "repeat(2, minmax(0, 1fr))"
              : "repeat(auto-fit, minmax(160px, 1fr))",
            gap: isCompact ? 10 : 16,
            marginBottom: 12,
            width: "100%",
          }}
        >
          <StatCard
            label={PBX_MONITOR_STAT_LABELS.totalExtensions}
            value={extensionRows.length}
            accent={C.accent}
            ready={hasLoaded}
          />
          <StatCard
            label={PBX_MONITOR_STAT_LABELS.registered}
            value={extRegistered}
            accent={C.successGreen}
            ready={hasLoaded}
          />
          <StatCard
            label={PBX_MONITOR_STAT_LABELS.unregistered}
            value={extUnregistered}
            accent={C.errorRed}
            ready={hasLoaded}
          />
          <StatCard
            label={PBX_MONITOR_STAT_LABELS.registeredTrunks}
            value={trkRegistered}
            accent={PBX_MONITOR_TRUNK_ACCENT}
            ready={hasLoaded}
          />
        </div>

        <div style={pbxMonitorCardStyle}>
          <div
            style={{
              ...pbxMonitorCardHeaderStyle,
              ...(isCompact
                ? {
                    flexDirection: "column",
                    alignItems: "stretch",
                    padding: "10px 12px",
                  }
                : {}),
            }}
          >
            <div
              style={{
                ...pbxMonitorHeaderLeftStyle,
                ...(isCompact ? { width: "100%" } : {}),
              }}
            >
              <Btn
                type="button"
                variant={
                  activeTab === PBX_MONITOR_TAB_VALUES.extension
                    ? "tabActive"
                    : "tabInactive"
                }
                onClick={() => setActiveTab(PBX_MONITOR_TAB_VALUES.extension)}
                style={{ height: 30, borderRadius: 4 }}
              >
                {PBX_MONITOR_TAB_LABELS.extension}
              </Btn>
              <Btn
                type="button"
                variant={
                  activeTab === PBX_MONITOR_TAB_VALUES.trunk
                    ? "tabActive"
                    : "tabInactive"
                }
                onClick={() => setActiveTab(PBX_MONITOR_TAB_VALUES.trunk)}
                style={{ height: 30, borderRadius: 4 }}
              >
                {PBX_MONITOR_TAB_LABELS.trunk}
              </Btn>
            </div>

            <div
              style={{
                ...pbxMonitorHeaderToolbarStyle,
                ...(isCompact
                  ? {
                      width: "100%",
                      marginLeft: 0,
                      justifyContent: "stretch",
                    }
                  : {}),
              }}
            >
              <PbxMonitorToolbarSearchBar
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                fitPlaceholder={!isCompact}
                fullWidth={isCompact}
                style={{ borderRadius: 4 }}
              />
              <Btn
                variant="cancel"
                onClick={() => loadData(false)}
                disabled={isRefreshing}
                style={pbxMonitorCancelBtnStyle}
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
          </div>

          {!hasLoaded && isRefreshing ? (
            <PbxMonitorTableListLoading />
          ) : hasLoaded && tableRows.length === 0 ? (
            <PbxMonitorTableListEmptyState message={emptyMessage} showButton={false} />
          ) : (
            <div style={tableWrapStyle}>
              {activeTab === PBX_MONITOR_TAB_VALUES.extension ? (
                <table
                  style={{
                    ...tableStyle,
                    ...(isCompact
                      ? { minWidth: PBX_MONITOR_EXTENSION_TABLE_MIN_WIDTH }
                      : {}),
                  }}
                >
                  <thead>
                    <tr>
                      <TH>Status</TH>
                      <TH>Extension</TH>
                      <TH>Name</TH>
                      <TH>Type</TH>
                      <TH style={{ borderRight: "none" }}>IP & Port</TH>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExtensions.map((row, idx) => {
                      const status = getStatus(row.status);
                      const rowBg = getPbxMonitorRowBg(false, idx);
                      const isLastRow = idx === filteredExtensions.length - 1;
                      const lastRowCellStyle = isLastRow
                        ? { borderBottom: "none" }
                        : {};

                      return (
                        <tr
                          key={row.extension}
                          style={{
                            background: rowBg,
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#f8fafc";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = rowBg;
                          }}
                        >
                          <TD
                            align="center"
                            bg={rowBg}
                            style={lastRowCellStyle}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "center",
                              }}
                            >
                              <StatusBadge
                                tone={status.tone}
                                text={status.text}
                              />
                            </div>
                          </TD>
                          <TD
                            align="center"
                            bg={rowBg}
                            style={lastRowCellStyle}
                          >
                            {row.extension}
                          </TD>
                          <TD
                            align="center"
                            bg={rowBg}
                            style={lastRowCellStyle}
                          >
                            {row.name}
                          </TD>
                          <TD
                            align="center"
                            bg={rowBg}
                            style={lastRowCellStyle}
                          >
                            <TypePill text="SIP" />
                          </TD>
                          <TD
                            mono
                            bg={rowBg}
                            style={{
                              ...lastRowCellStyle,
                              borderRight: "none",
                            }}
                          >
                            {row.ip_port}
                          </TD>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <table
                  style={{
                    ...tableStyle,
                    ...(isCompact
                      ? { minWidth: PBX_MONITOR_TRUNK_TABLE_MIN_WIDTH }
                      : {}),
                  }}
                >
                  <thead>
                    <tr>
                      <TH>Status</TH>
                      <TH>Trunk Name</TH>
                      <TH>Type</TH>
                      <TH style={{ borderRight: "none" }}>Host</TH>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTrunks.map((row, idx) => {
                      const status = getStatus(row.status);
                      const rowBg = getPbxMonitorRowBg(false, idx);
                      const isLastRow = idx === filteredTrunks.length - 1;
                      const lastRowCellStyle = isLastRow
                        ? { borderBottom: "none" }
                        : {};

                      return (
                        <tr
                          key={row.id}
                          style={{
                            background: rowBg,
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#f8fafc";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = rowBg;
                          }}
                        >
                          <TD
                            align="center"
                            bg={rowBg}
                            style={lastRowCellStyle}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "center",
                              }}
                            >
                              <StatusBadge
                                tone={status.tone}
                                text={status.text}
                              />
                            </div>
                          </TD>
                          <TD
                            align="center"
                            bg={rowBg}
                            style={lastRowCellStyle}
                          >
                            {row.trunk_name}
                          </TD>
                          <TD
                            align="center"
                            bg={rowBg}
                            style={lastRowCellStyle}
                          >
                            <TypePill text={row.type || "SIP"} />
                          </TD>
                          <TD
                            mono
                            bg={rowBg}
                            style={{
                              ...lastRowCellStyle,
                              borderRight: "none",
                            }}
                          >
                            {row.host_ip_port}
                          </TD>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {hasLoaded && tableRows.length > 0 && (
            <div style={pbxMonitorFooterStyle}>
              <span style={{ fontSize: 11, color: C.mutedText }}>
                Showing {tableRows.length} {recordLabel}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PbxMonitor;
