import React from "react";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import PauseOutlinedIcon from "@mui/icons-material/PauseOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { Checkbox, CircularProgress, useMediaQuery } from "@mui/material";
import {
  VIEW_VOICEMAIL_COMPACT_MQ,
  VIEW_VOICEMAIL_EMPTY_MESSAGE,
  VIEW_VOICEMAIL_EXTENSION_PLACEHOLDER,
  VIEW_VOICEMAIL_FILTER_LABELS,
  VIEW_VOICEMAIL_FOLDER_OPTIONS,
  VIEW_VOICEMAIL_RECORD_LABEL,
  VIEW_VOICEMAIL_TABLE_HEADING,
  VIEW_VOICEMAIL_TABLE_MIN_WIDTH,
} from "../../../constants/ViewVoicemailConstants";
import { C } from "../../../theme/pbxTokens";
import {
  Btn,
  RecordingActionBtn,
  RecordingPlayerBar,
  TH,
} from "../../../components/common";
import { useViewVoicemailPage } from "./hooks/useViewVoicemailPage";
import {
  NewBadge,
  ReadBadge,
  TableListEmptyState,
  TableListLoading,
  TD,
  ViewVoicemailBreadcrumb,
} from "./components/ViewVoicemailFormFields";
import {
  getViewVoicemailRowBg,
  nativeFieldInteraction,
  viewVoicemailCardStyle,
  viewVoicemailFilterCardStyle,
  viewVoicemailFilterFieldStyle,
  viewVoicemailFilterLabelStyle,
  viewVoicemailFooterStyle,
  viewVoicemailPageBadgeStyle,
  viewVoicemailPageInnerStyle,
  viewVoicemailPageWrapStyle,
  viewVoicemailRefreshBtnStyle,
  viewVoicemailTableCheckboxSx,
  viewVoicemailToolbarBtnStyle,
  viewVoicemailToolbarStyle,
} from "./components/ViewVoicemailTableHelpers";
import { fmtDate, fmtDuration, parseCallerId } from "./utils/ViewVoicemailTransformers";

const ViewVoicemailPage = () => {
  const isCompact = useMediaQuery(VIEW_VOICEMAIL_COMPACT_MQ);
  const {
    audioRef, audioUrl, allPageSelected, bulkDeleting, deleteLoading, error,
    extensionInput, folderFilter, handleBulkDelete, handleDelete, handlePlay,
    handleToggleAll, handleToggleRow, hasLoaded, limit, loadMessages, loading,
    page, playLoading, playingId, rows, selected, setError, setExtensionInput,
    setFolderFilter, somePageSelected, stopPlayer, total, totalPages,
  } = useViewVoicemailPage();

  return (
    <div style={{ ...viewVoicemailPageWrapStyle, padding: isCompact ? 8 : 16 }}>
      <div style={viewVoicemailPageInnerStyle}>
        <ViewVoicemailBreadcrumb style={{ marginBottom: 16 }} />

        {error && (
          <div style={{
            background: "#fef2f2", borderLeft: `3px solid ${C.errorRed}`,
            color: C.errorRed, padding: "10px 14px", borderRadius: 8,
            marginBottom: 16, fontSize: 13, display: "flex",
            alignItems: "center", justifyContent: "space-between",
          }}>
            <span>{error}</span>
            <span
              onClick={() => setError("")}
              style={{ cursor: "pointer", fontSize: 16 }}
            >
              ✕
            </span>
          </div>
        )}

        <div style={{
          ...viewVoicemailFilterCardStyle,
          padding: isCompact ? 12 : "10px 14px",
        }}>
          <div style={{
            display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 12,
          }}>
            <div style={{ flex: isCompact ? "1 1 100%" : "0 0 auto" }}>
              <span style={viewVoicemailFilterLabelStyle}>
                {VIEW_VOICEMAIL_FILTER_LABELS.extension}
              </span>
              <input
                type="text"
                value={extensionInput}
                onChange={(e) => setExtensionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") loadMessages(1);
                }}
                placeholder={VIEW_VOICEMAIL_EXTENSION_PLACEHOLDER}
                style={{
                  ...viewVoicemailFilterFieldStyle,
                  padding: "0 12px",
                  width: isCompact ? "100%" : 180,
                }}
                {...nativeFieldInteraction}
              />
            </div>
            <div style={{ flex: isCompact ? "1 1 100%" : "0 0 auto" }}>
              <span style={viewVoicemailFilterLabelStyle}>
                {VIEW_VOICEMAIL_FILTER_LABELS.folder}
              </span>
              <select
                value={folderFilter}
                onChange={(e) => {
                  const v = e.target.value;
                  setFolderFilter(v);
                  loadMessages(1, extensionInput, v);
                }}
                style={{
                  ...viewVoicemailFilterFieldStyle,
                  padding: "0 32px 0 12px",
                  width: isCompact ? "100%" : 170,
                  cursor: "pointer",
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 12px center",
                }}
                {...nativeFieldInteraction}
              >
                {VIEW_VOICEMAIL_FOLDER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <Btn
              variant="primary"
              onClick={() => loadMessages(1)}
              disabled={loading}
              style={viewVoicemailToolbarBtnStyle}
            >
              {loading ? <CircularProgress size={11} style={{ color: "#fff" }} /> : "Search"}
            </Btn>
            <Btn
              variant="cancel"
              onClick={() => loadMessages(page)}
              disabled={loading}
              style={viewVoicemailRefreshBtnStyle}
            >
              Refresh
            </Btn>
            <Btn
              onClick={handleBulkDelete}
              disabled={bulkDeleting || !selected.length}
              variant="cancel"
              style={{ ...viewVoicemailRefreshBtnStyle, width: "auto" }}
            >
              {bulkDeleting ? <CircularProgress size={11} style={{ color: "#374151" }} /> : null}
              <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
              Delete
            </Btn>
            {(extensionInput.trim() || folderFilter !== "all") && (
              <Btn
                variant="outline"
                onClick={() => {
                  setExtensionInput("");
                  setFolderFilter("all");
                  loadMessages(1, "", "all");
                }}
                disabled={loading}
                style={viewVoicemailToolbarBtnStyle}
              >
                Reset
              </Btn>
            )}
          </div>
        </div>

        <div style={viewVoicemailCardStyle}>
          <div style={viewVoicemailToolbarStyle}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.labelText }}>
              {VIEW_VOICEMAIL_TABLE_HEADING}
            </span>
          </div>

          {loading ? (
            <TableListLoading />
          ) : rows.length === 0 ? (
            <TableListEmptyState message={VIEW_VOICEMAIL_EMPTY_MESSAGE} />
          ) : (
            <div className="trunk-table-scroll" style={{
              overflowX: "auto", overflowY: "auto", WebkitOverflowScrolling: "touch",
            }}>
              <table style={{
                width: "100%", minWidth: VIEW_VOICEMAIL_TABLE_MIN_WIDTH,
                borderCollapse: "separate", borderSpacing: 0, tableLayout: "fixed",
              }}>
                <colgroup>
                  <col style={{ width: "3%" }} /><col style={{ width: "4%" }} />
                  <col style={{ width: "15%" }} /><col style={{ width: "8%" }} />
                  <col style={{ width: "19%" }} /><col style={{ width: "10%" }} />
                  <col style={{ width: "14%" }} /><col style={{ width: "8%" }} />
                  <col style={{ width: "9%" }} /><col style={{ width: "10%" }} />
                </colgroup>
                <thead>
                  <tr>
                    <TH style={{ width: 40, padding: 0 }}>
                      <Checkbox
                        size="small"
                        checked={allPageSelected}
                        indeterminate={somePageSelected}
                        onChange={handleToggleAll}
                        sx={viewVoicemailTableCheckboxSx}
                      />
                    </TH>
                    <TH>ID</TH><TH>UNIQUE ID</TH><TH>Mailbox</TH><TH>Received At</TH>
                    <TH>Folder</TH><TH>Caller ID</TH><TH>Duration</TH><TH>Play</TH>
                    <TH style={{ borderRight: "none" }}>Delete</TH>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => {
                    const isLast = idx === rows.length - 1;
                    const isSelected = selected.includes(String(row.id));
                    const rowBg = getViewVoicemailRowBg(isSelected, idx);
                    const isPlaying = playingId === row.id && Boolean(audioUrl);
                    const lastRowCellStyle = isLast ? { borderBottom: "none" } : {};

                    return (
                      <tr
                        key={row.id || idx}
                        style={{ background: rowBg, transition: "background 0.15s ease" }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.background = "#f8fafc";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.background = rowBg;
                        }}
                      >
                        <TD bg={rowBg} style={{ ...lastRowCellStyle, width: 36, padding: 0 }}>
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => handleToggleRow(row.id)}
                            disabled={!!deleteLoading || bulkDeleting}
                            sx={viewVoicemailTableCheckboxSx}
                          />
                        </TD>
                        <TD bg={rowBg} style={lastRowCellStyle}>
                          {(page - 1) * limit + idx + 1}
                        </TD>
                        <TD mono bg={rowBg} title={row.id} style={lastRowCellStyle}>
                          {row.id}
                        </TD>
                        <TD bg={rowBg} style={lastRowCellStyle}>{row.extension || "—"}</TD>
                        <TD bg={rowBg} style={lastRowCellStyle}>{fmtDate(row.received_at)}</TD>
                        <TD bg={rowBg} style={lastRowCellStyle}>
                          <div style={{
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                          }}>
                            <span style={{ fontSize: 11, color: C.mutedText }}>
                              {row.folder || "—"}
                            </span>
                            {row.is_new ? <NewBadge /> : <ReadBadge />}
                          </div>
                        </TD>
                        <TD bg={rowBg} title={row.callerid} style={lastRowCellStyle}>
                          {parseCallerId(row.callerid)}
                        </TD>
                        <TD bg={rowBg} style={lastRowCellStyle}>{fmtDuration(row.duration)}</TD>
                        <TD bg={rowBg} style={lastRowCellStyle}>
                          <RecordingActionBtn
                            variant="play"
                            title={isPlaying ? "Stop" : "Play voicemail"}
                            disabled={!!playLoading && playLoading !== row.id}
                            onClick={() => handlePlay(row)}
                          >
                            {playLoading === row.id ? (
                              <CircularProgress size={13} sx={{ color: C.accent }} />
                            ) : isPlaying ? (
                              <PauseOutlinedIcon sx={{ fontSize: 14 }} />
                            ) : (
                              <PlayArrowOutlinedIcon sx={{ fontSize: 14 }} />
                            )}
                          </RecordingActionBtn>
                        </TD>
                        <TD bg={rowBg} style={{ borderRight: "none", ...lastRowCellStyle }}>
                          <RecordingActionBtn
                            variant="delete"
                            title="Delete"
                            disabled={!!deleteLoading || bulkDeleting}
                            onClick={() => handleDelete(row)}
                          >
                            {deleteLoading === row.id ? (
                              <CircularProgress size={13} sx={{ color: "#dc2626" }} />
                            ) : (
                              <DeleteOutlineOutlinedIcon sx={{ fontSize: 14 }} />
                            )}
                          </RecordingActionBtn>
                        </TD>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {hasLoaded && rows.length > 0 && (
            <div style={{
              ...viewVoicemailFooterStyle,
              ...(isCompact ? { flexDirection: "column", alignItems: "stretch" } : {}),
            }}>
              <span style={{ fontSize: 11, color: C.mutedText }}>
                Showing {total} {VIEW_VOICEMAIL_RECORD_LABEL}
              </span>
              {totalPages > 1 && (
                <div style={{
                  display: "flex", gap: 8, alignItems: "center",
                  ...(isCompact ? { justifyContent: "center", flexWrap: "wrap" } : {}),
                }}>
                  <Btn
                    onClick={() => loadMessages(page - 1)}
                    disabled={page <= 1 || loading}
                    variant="outline"
                  >
                    ← Prev
                  </Btn>
                  <span style={viewVoicemailPageBadgeStyle}>
                    Page {page} of {totalPages}
                  </span>
                  <Btn
                    onClick={() => loadMessages(page + 1)}
                    disabled={page >= totalPages || loading}
                    variant="outline"
                  >
                    Next →
                  </Btn>
                </div>
              )}
            </div>
          )}
        </div>

        <RecordingPlayerBar
          ref={audioRef}
          open={Boolean(audioUrl || playLoading)}
          loading={Boolean(playLoading)}
          label="Voicemail"
          src={audioUrl}
          onEnded={stopPlayer}
          onClose={stopPlayer}
          isCompact={isCompact}
          accentColor={C.accent}
        />
      </div>
    </div>
  );
};

export default ViewVoicemailPage;
