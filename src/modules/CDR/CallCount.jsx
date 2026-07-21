import React from "react";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import PauseOutlinedIcon from "@mui/icons-material/PauseOutlined";
import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert,
  useMediaQuery,
} from "@mui/material";
import { C } from "../../theme/pbxTokens";
import {
  CALL_COUNT_COLUMNS,
  CALL_COUNT_COMPACT_MQ,
  CALL_COUNT_DIRECTION_OPTIONS,
  CALL_COUNT_EMPTY_MESSAGE,
  CALL_COUNT_FILTER_MODAL_TITLE,
  CALL_COUNT_FOOTER_LIMIT_NOTE,
  CALL_COUNT_STATUS_OPTIONS,
  CALL_COUNT_TABLE_MIN_WIDTH,
  CALL_COUNT_TALK_DURATION_OPERATOR_OPTIONS,
} from "../../constants/CallCountConstants";
import {
  Btn,
  TH,
  ExtensionTableListLoading as CallCountTableListLoading,
  ExtensionTableListEmptyState as CallCountTableListEmptyState,
  ExtensionPagination as CallCountPagination,
  extensionFixedAlertSx as callCountFixedAlertSx,
  extensionPageWrapStyle as callCountPageWrapStyle,
  extensionPageInnerStyle as callCountPageInnerStyle,
  extensionCardStyle as callCountCardStyle,
  extensionToolbarStyle as callCountToolbarStyle,
  extensionSelectedBadgeStyle as callCountSelectedBadgeStyle,
  extensionCancelBtnStyle as callCountCancelBtnStyle,
  RecordingActionBtn,
  RecordingPlayerBar,
} from "../../components/common";
import { useCallCountPage } from "./hooks/useCallCountPage";
import {
  CallCountBreadcrumb,
  FilterDate,
  FilterField,
  FilterSearch,
  FilterSelect,
  Pill,
} from "./components/CallCountFormFields";
import {
  CALL_COUNT_FILTER_TIME_RANGE_MAX_WIDTH,
  TRUNK_TABLE_SCROLL_CLASS,
  cardBorderSoft,
  callCountFilterBoxFillStyle,
  callCountFilterModalFooterBtnStyle,
  callCountFilterModalCancelBtnStyle,
  callCountFilterModalFooterStyle,
  callCountFilterModalFormStyle,
  callCountFilterModalGridStyle,
  callCountFilterModalPaperSx,
  callCountFilterModalTitleStyle,
  callCountTableTdStyle,
  callCountTableThStyle,
  callCountToolbarFilterRefreshBtnStyle,
  getCallCountCellPadding,
  getCallCountHeaderPadding,
  getCallCountRowBg,
  callCountNativeFieldInteraction,
} from "./components/CallCountTableHelpers";
import {
  formatDate,
  formatDuration,
  getDirection,
  getRowKey,
  hasRecording,
  statusStyle,
} from "./utils/CallCountTransformers";

const columns = CALL_COUNT_COLUMNS;
const CallCount = () => {
  const isCompact = useMediaQuery(CALL_COUNT_COMPACT_MQ);
  const {
    rows,
    loading,
    isInitialLoad,
    error,
    setError,
    message,
    setMessage,
    page,
    selectedIds,
    setSelectedIds,
    lastUpdated,
    showModifyModal,
    setShowModifyModal,
    modifyDraft,
    setModifyDraft,
    filterDraft,
    setFilterDraft,
    appliedFilters,
    appliedModifyDraft,
    recording,
    audioRef,
    filteredData,
    totalPages,
    hasActiveFilters,
    stopRecording,
    loadCdr,
    handlePageChange,
    handleToggleRow,
    handleToggleAll,
    updateFilterDraftDate,
    handleModifyOpen,
    handleFilterSearch,
    handleFilterCancel,
    handleModifyReset,
    handleDelete,
    handleDownload,
    handlePlayRecording,
    handleDeleteRecording,
  } = useCallCountPage();
  return (
    <div style={{ ...callCountPageWrapStyle, padding: isCompact ? 12 : 16 }}>
      <div style={callCountPageInnerStyle}>
        {error && (
          <Alert
            severity="error"
            onClose={() => setError("")}
            sx={callCountFixedAlertSx}
          >
            {error}
          </Alert>
        )}
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={callCountFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <CallCountBreadcrumb style={{ marginBottom: 0 }} />
          {lastUpdated && (
            <span
              style={{ fontSize: 12, color: C.mutedText, whiteSpace: "nowrap" }}
            >
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>

        <div style={callCountCardStyle}>
          <div
            style={{
              ...callCountToolbarStyle,
              ...(isCompact
                ? { flexDirection: "column", alignItems: "stretch" }
                : {}),
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {selectedIds.length > 0 && (
                <span style={callCountSelectedBadgeStyle}>
                  {selectedIds.length} selected
                </span>
              )}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
                ...(isCompact
                  ? { width: "100%", justifyContent: "flex-end" }
                  : {}),
              }}
            >
              {!hasActiveFilters ? (
                <Btn
                  onClick={handleModifyOpen}
                  disabled={loading}
                  variant="cancel"
                  style={callCountToolbarFilterRefreshBtnStyle}
                >
                  Filter
                </Btn>
              ) : (
                <Btn
                  onClick={handleModifyReset}
                  disabled={loading}
                  variant="cancel"
                  style={callCountToolbarFilterRefreshBtnStyle}
                >
                  Reset
                </Btn>
              )}
              <Btn
                onClick={() => loadCdr(page)}
                disabled={loading}
                variant="cancel"
                style={callCountToolbarFilterRefreshBtnStyle}
              >
                {loading ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : (
                  "Refresh"
                )}
              </Btn>
              <Btn
                onClick={handleDelete}
                disabled={loading || selectedIds.length === 0}
                variant="cancel"
                style={callCountCancelBtnStyle}
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn
                type="button"
                onClick={() => {
                  if (selectedIds.length > 0) {
                    setSelectedIds([]);
                  } else {
                    handleToggleAll();
                  }
                }}
                disabled={filteredData.length === 0}
                variant="cancel"
                style={callCountCancelBtnStyle}
              >
                {selectedIds.length > 0 ? "Deselect All" : "Select All"}
              </Btn>
              <Btn
                onClick={handleDownload}
                disabled={loading}
                variant="cancel"
                style={callCountCancelBtnStyle}
              >
                ⬇ Download CDR
              </Btn>
            </div>
          </div>

          {isInitialLoad ? (
            <CallCountTableListLoading />
          ) : rows.length === 0 && !hasActiveFilters ? (
            <CallCountTableListEmptyState
              message={CALL_COUNT_EMPTY_MESSAGE}
              showButton={false}
            />
          ) : (
            <>
              <div
                className={TRUNK_TABLE_SCROLL_CLASS}
                style={{
                  overflowX: "auto",
                  overflowY: "auto",
                  flex: 1,
                  WebkitOverflowScrolling: "touch",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    minWidth: CALL_COUNT_TABLE_MIN_WIDTH,
                    borderCollapse: "separate",
                    borderSpacing: 0,
                    tableLayout: "auto",
                  }}
                >
                  <colgroup>
                    {columns.map((col) => (
                      <col key={col.key} style={{ width: col.width }} />
                    ))}
                  </colgroup>
                  <thead>
                    <tr>
                      {columns.map((col, colIdx) => (
                        <TH
                          key={col.key}
                          style={{
                            ...callCountTableThStyle,
                            width: col.width,
                            padding: getCallCountHeaderPadding(col.key),
                            position: "sticky",
                            top: 0,
                            zIndex: 10,
                            ...(colIdx === 0 ? { borderLeft: "none" } : {}),
                            ...(colIdx === columns.length - 1
                              ? { borderRight: "none" }
                              : {}),
                          }}
                        >
                          {col.label}
                        </TH>
                      ))}
                    </tr>
                  </thead>
                  <tbody
                    key={`${appliedFilters.callStatus}-${appliedFilters.direction}-${appliedFilters.search}`}
                  >
                    {filteredData.length === 0 ? (
                      <tr>
                        <td
                          colSpan={columns.length}
                          style={{
                            textAlign: "center",
                            padding: "40px 16px",
                            color: C.mutedText,
                            fontSize: 14,
                            borderBottom: "none",
                          }}
                        >
                          {hasActiveFilters
                            ? "No records match the current filters on this page."
                            : "No records found."}
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((row, idx) => {
                        const isLastRow = idx === filteredData.length - 1;
                        const lastRowCellStyle = isLastRow
                          ? { borderBottom: "none" }
                          : {};
                        const isSelected =
                          row.uniqueid &&
                          selectedIds.includes(String(row.uniqueid));
                        const rowBg = getCallCountRowBg(isSelected, idx);

                        return (
                          <tr
                            key={`${getRowKey(row, idx)}-${isSelected ? "1" : "0"}`}
                            onClick={() => {
                              if (row.uniqueid) {
                                handleToggleRow(String(row.uniqueid));
                              }
                            }}
                            style={{
                              background: rowBg,
                              cursor: row.uniqueid ? "pointer" : "default",
                            }}
                          >
                            <td
                              title={formatDate(row.calldate)}
                              style={{
                                ...callCountTableTdStyle,
                                padding: getCallCountCellPadding("calldate"),
                                background: "inherit",
                                borderLeft: "none",
                                ...lastRowCellStyle,
                              }}
                            >
                              {formatDate(row.calldate)}
                            </td>

                            <td
                              title={row.src || ""}
                              style={{
                                ...callCountTableTdStyle,
                                padding: getCallCountCellPadding("src"),
                                background: "inherit",
                                ...lastRowCellStyle,
                              }}
                            >
                              {row.src || (
                                <span style={{ color: C.mutedText }}>—</span>
                              )}
                            </td>

                            <td
                              title={row.src_ip || ""}
                              style={{
                                ...callCountTableTdStyle,
                                padding: getCallCountCellPadding("src_ip"),
                                background: "inherit",
                                ...lastRowCellStyle,
                              }}
                            >
                              {row.src_ip || (
                                <span style={{ color: C.mutedText }}>—</span>
                              )}
                            </td>

                            <td
                              title={row.dst || ""}
                              style={{
                                ...callCountTableTdStyle,
                                padding: getCallCountCellPadding("dst"),
                                background: "inherit",
                                ...lastRowCellStyle,
                              }}
                            >
                              {row.dst || (
                                <span style={{ color: C.mutedText }}>—</span>
                              )}
                            </td>

                            <td
                              title={row.dst_ip || ""}
                              style={{
                                ...callCountTableTdStyle,
                                padding: getCallCountCellPadding("dst_ip"),
                                background: "inherit",
                                ...lastRowCellStyle,
                              }}
                            >
                              {row.dst_ip || (
                                <span style={{ color: C.mutedText }}>—</span>
                              )}
                            </td>

                            <td
                              style={{
                                ...callCountTableTdStyle,
                                padding:
                                  getCallCountCellPadding("call_direction"),
                                background: "inherit",
                                ...lastRowCellStyle,
                              }}
                            >
                              {getDirection(row) || (
                                <span style={{ color: C.mutedText }}>—</span>
                              )}
                            </td>

                            <td
                              style={{
                                ...callCountTableTdStyle,
                                padding: getCallCountCellPadding("disposition"),
                                background: "inherit",
                                ...lastRowCellStyle,
                              }}
                            >
                              {row.disposition ? (
                                (() => {
                                  const s = statusStyle(row.disposition);
                                  return (
                                    <Pill
                                      text={row.disposition}
                                      bg={s.bg}
                                      color={s.color}
                                    />
                                  );
                                })()
                              ) : (
                                <span style={{ color: C.mutedText }}>—</span>
                              )}
                            </td>

                            <td
                              style={{
                                ...callCountTableTdStyle,
                                padding: getCallCountCellPadding("billsec"),
                                background: "inherit",
                                ...lastRowCellStyle,
                              }}
                            >
                              {formatDuration(row.billsec)}
                            </td>

                            <td
                              title={row.dcontext || ""}
                              style={{
                                ...callCountTableTdStyle,
                                padding: getCallCountCellPadding("dcontext"),
                                background: "inherit",
                                ...lastRowCellStyle,
                              }}
                            >
                              {row.dcontext || (
                                <span style={{ color: C.mutedText }}>—</span>
                              )}
                            </td>

                            <td
                              title={row.hangup_cause || ""}
                              style={{
                                ...callCountTableTdStyle,
                                padding:
                                  getCallCountCellPadding("hangup_cause"),
                                background: "inherit",
                                ...lastRowCellStyle,
                              }}
                            >
                              {row.hangup_cause || (
                                <span style={{ color: C.mutedText }}>—</span>
                              )}
                            </td>

                            <td
                              style={{
                                ...callCountTableTdStyle,
                                padding: getCallCountCellPadding("recording"),
                                background: "inherit",
                                borderRight: "none",
                                whiteSpace: "nowrap",
                                overflow: "visible",
                                ...lastRowCellStyle,
                              }}
                            >
                              {hasRecording(row) ? (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  style={{
                                    display: "inline-flex",
                                    gap: 6,
                                    justifyContent: "center",
                                  }}
                                >
                                  <RecordingActionBtn
                                    variant="play"
                                    title={
                                      recording.uniqueid === row.uniqueid &&
                                      recording.url
                                        ? "Stop"
                                        : "Play recording"
                                    }
                                    onClick={() => handlePlayRecording(row)}
                                    disabled={
                                      recording.loading &&
                                      recording.uniqueid === row.uniqueid
                                    }
                                  >
                                    {recording.loading &&
                                    recording.uniqueid === row.uniqueid ? (
                                      <CircularProgress
                                        size={13}
                                        sx={{ color: C.accent }}
                                      />
                                    ) : recording.uniqueid === row.uniqueid &&
                                      recording.url ? (
                                      <PauseOutlinedIcon
                                        sx={{ fontSize: 14 }}
                                      />
                                    ) : (
                                      <PlayArrowOutlinedIcon
                                        sx={{ fontSize: 14 }}
                                      />
                                    )}
                                  </RecordingActionBtn>
                                  <RecordingActionBtn
                                    variant="delete"
                                    title="Delete recording"
                                    onClick={() => handleDeleteRecording(row)}
                                  >
                                    <DeleteOutlineOutlinedIcon
                                      sx={{ fontSize: 14 }}
                                    />
                                  </RecordingActionBtn>
                                </div>
                              ) : (
                                <span style={{ color: C.mutedText }}>—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {filteredData.length > 0 && (
                <CallCountPagination
                  page={page}
                  totalPages={totalPages}
                  recordCount={filteredData.length}
                  recordLabel="record"
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>

        <RecordingPlayerBar
          ref={audioRef}
          open={Boolean(recording.url || recording.loading)}
          loading={recording.loading}
          label="Recording"
          src={recording.url}
          onEnded={stopRecording}
          onClose={stopRecording}
          isCompact={isCompact}
          accentColor={C.accent}
        />

        <Dialog
          open={showModifyModal}
          onClose={() => setShowModifyModal(false)}
          maxWidth={false}
          PaperProps={{ sx: callCountFilterModalPaperSx }}
        >
          <DialogTitle style={callCountFilterModalTitleStyle}>
            {CALL_COUNT_FILTER_MODAL_TITLE}
          </DialogTitle>

          <DialogContent
            style={{ padding: "24px", backgroundColor: "#ffffff" }}
          >
            <div style={callCountFilterModalFormStyle}>
              <div style={callCountFilterModalGridStyle(isCompact)}>
                <FilterField label="Call Status" tooltipKey="call_status">
                  <FilterSelect
                    aria-label="Call Status"
                    value={filterDraft.callStatus}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFilterDraft((f) => ({ ...f, callStatus: value }));
                    }}
                    options={CALL_COUNT_STATUS_OPTIONS}
                  />
                </FilterField>

                <FilterField label="Direction" tooltipKey="direction">
                  <FilterSelect
                    aria-label="Direction"
                    value={filterDraft.direction}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFilterDraft((f) => ({ ...f, direction: value }));
                    }}
                    options={CALL_COUNT_DIRECTION_OPTIONS}
                  />
                </FilterField>

                <FilterField label="Call From" tooltipKey="call_from">
                  <FilterSearch
                    placeholder="Call From"
                    value={filterDraft.callFrom}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFilterDraft((f) => ({ ...f, callFrom: value }));
                    }}
                  />
                </FilterField>

                <FilterField label="Call To" tooltipKey="call_to">
                  <FilterSearch
                    placeholder="Call To"
                    value={filterDraft.callTo}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFilterDraft((f) => ({ ...f, callTo: value }));
                    }}
                  />
                </FilterField>

                <FilterField label="Trunk Name" tooltipKey="trunk_name">
                  <FilterSearch
                    placeholder="Trunk Name"
                    value={filterDraft.trunkName}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFilterDraft((f) => ({ ...f, trunkName: value }));
                    }}
                  />
                </FilterField>

                <FilterField label="Talk Duration" tooltipKey="talk_duration">
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "72px 1fr",
                      gap: 8,
                      width: "100%",
                    }}
                  >
                    <FilterSelect
                      aria-label="Talk Duration Operator"
                      fill
                      value={modifyDraft.talkDurationOperator}
                      onChange={(e) =>
                        setModifyDraft((prev) => ({
                          ...prev,
                          talkDurationOperator: e.target.value,
                        }))
                      }
                      options={CALL_COUNT_TALK_DURATION_OPERATOR_OPTIONS}
                    />
                    <input
                      type="number"
                      min="0"
                      value={modifyDraft.talkDurationSeconds}
                      onChange={(e) =>
                        setModifyDraft((prev) => ({
                          ...prev,
                          talkDurationSeconds: e.target.value,
                        }))
                      }
                      placeholder="Seconds"
                      style={callCountFilterBoxFillStyle}
                      {...callCountNativeFieldInteraction}
                    />
                  </div>
                </FilterField>

                <FilterField
                  label="Time Range"
                  tooltipKey="time_range"
                  style={{ maxWidth: CALL_COUNT_FILTER_TIME_RANGE_MAX_WIDTH }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 8,
                      width: "100%",
                    }}
                  >
                    <FilterDate
                      fill
                      aria-label="Start Date"
                      value={filterDraft.startDate}
                      onChange={(e) =>
                        updateFilterDraftDate("startDate", e.target.value)
                      }
                    />
                    <FilterDate
                      fill
                      aria-label="End Date"
                      value={filterDraft.endDate}
                      onChange={(e) =>
                        updateFilterDraftDate("endDate", e.target.value)
                      }
                    />
                  </div>
                </FilterField>
              </div>

              {hasActiveFilters && (
                <div
                  style={{
                    marginTop: 14,
                    paddingTop: 7,
                    borderTop: `1px solid ${cardBorderSoft}`,
                    fontSize: 12,
                    color: C.mutedText,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                    width: "100%",
                  }}
                >
                  <span
                    style={{
                      background: "#eff6ff",
                      color: C.accent,
                      fontWeight: 600,
                      padding: "4px 10px",
                      textAlign: "center",
                      borderRadius: 999,
                      fontSize: 11,
                    }}
                  >
                    Filters active
                  </span>
                  <span>
                    Showing {filteredData.length} of {rows.length} records on
                    this page
                    {(appliedFilters.startDate || appliedFilters.endDate) && (
                      <>
                        {" "}
                        · {appliedFilters.startDate || "…"} to{" "}
                        {appliedFilters.endDate || "…"}
                      </>
                    )}
                  </span>
                </div>
              )}
            </div>
          </DialogContent>

          <DialogActions
            sx={{ p: 0, m: 0 }}
            style={callCountFilterModalFooterStyle}
          >
            <Btn
              onClick={handleFilterSearch}
              variant="primary"
              style={callCountFilterModalFooterBtnStyle}
            >
              Search
            </Btn>
            <Btn
              onClick={handleFilterCancel}
              variant="cancel"
              style={callCountFilterModalCancelBtnStyle}
            >
              Cancel
            </Btn>
          </DialogActions>
        </Dialog>

        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            marginTop: isCompact ? 14 : 20,
            padding: isCompact ? "0 4px" : 0,
            fontSize: isCompact ? 12 : 13,
            fontWeight: 700,
            color: "#DC2626",
            textAlign: "center",
          }}
        >
          <span>{CALL_COUNT_FOOTER_LIMIT_NOTE}</span>
        </div>
      </div>
    </div>
  );
};

export default CallCount;
