import React from "react";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { Alert, Checkbox, CircularProgress, useMediaQuery } from "@mui/material";
import { C } from "../../../theme/pbxTokens";
import {
  OPERATIONS_LOG_COLUMNS,
  OPERATIONS_LOG_COMPACT_MQ,
  OPERATIONS_LOG_EMPTY_MESSAGE,
  OPERATIONS_LOG_FOOTER_LIMIT_NOTE,
  OPERATIONS_LOG_TABLE_MIN_WIDTH,
} from "../../../constants/OperationsLogConstants";
import {
  Btn,
  TH,
  tdStyle,
  ExtensionTableListLoading as OperationsLogTableListLoading,
  ExtensionTableListEmptyState as OperationsLogTableListEmptyState,
  ExtensionPagination as OperationsLogPagination,
  extensionFixedAlertSx as operationsLogFixedAlertSx,
  extensionPageWrapStyle as operationsLogPageWrapStyle,
  extensionPageInnerStyle as operationsLogPageInnerStyle,
  extensionCardStyle as operationsLogCardStyle,
  extensionToolbarStyle as operationsLogToolbarStyle,
  extensionSelectedBadgeStyle as operationsLogSelectedBadgeStyle,
  extensionCancelBtnStyle as operationsLogCancelBtnStyle,
  extensionTableCheckboxSx as operationsLogTableCheckboxSx,
  getExtensionRowBg as getOperationsLogRowBg,
} from "../../../components/common";
import { useOperationsLogPage } from "./hooks/useOperationsLogPage";
import { OperationsLogBreadcrumb as OperationsLogPageBreadcrumb } from "./components/OperationsLogFormFields";
import {
  OPERATIONS_LOG_TABLE_SCROLL_CLASS,
  operationsLogCheckboxCellStyle,
  operationsLogFooterNoteStyle,
  operationsLogTableScrollStyle,
  operationsLogToolbarActionBtnStyle,
  operationsLogToolbarRefreshBtnStyle,
} from "./components/OperationsLogTableHelpers";
import { getOperationsLogCellValue } from "./utils/OperationsLogTransformers";

const columns = OPERATIONS_LOG_COLUMNS;

const OperationsLog = () => {
  const isCompact = useMediaQuery(OPERATIONS_LOG_COMPACT_MQ);
  const {
    rows,
    pagedRows,
    loading,
    isInitialLoad,
    message,
    setMessage,
    page,
    totalPages,
    selectedIds,
    lastUpdated,
    allPageSelected,
    somePageSelected,
    dataEmpty,
    loadOperationsLog,
    handleToggleRow,
    handleToggleAll,
    handlePageChange,
    handleDownload,
    handleDelete,
  } = useOperationsLogPage();

  return (
    <div
      style={{
        ...operationsLogPageWrapStyle,
        ...(isCompact ? { padding: 12 } : {}),
      }}
    >
      <div style={operationsLogPageInnerStyle}>
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={operationsLogFixedAlertSx}
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
          <OperationsLogPageBreadcrumb style={{ marginBottom: 0 }} />
          {lastUpdated && (
            <span
              style={{ fontSize: 12, color: C.mutedText, whiteSpace: "nowrap" }}
            >
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>

        <div style={operationsLogCardStyle}>
          <div
            style={{
              ...operationsLogToolbarStyle,
              ...(isCompact
                ? { flexDirection: "column", alignItems: "stretch" }
                : {}),
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {selectedIds.length > 0 && (
                <span style={operationsLogSelectedBadgeStyle}>
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
              <Btn
                onClick={() => loadOperationsLog()}
                disabled={loading}
                variant="cancel"
                style={operationsLogToolbarRefreshBtnStyle}
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
                style={operationsLogCancelBtnStyle}
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn
                onClick={handleDownload}
                disabled={loading}
                variant="cancel"
                style={operationsLogToolbarActionBtnStyle}
              >
                Download
              </Btn>
            </div>
          </div>

          {isInitialLoad ? (
            <OperationsLogTableListLoading />
          ) : dataEmpty ? (
            <OperationsLogTableListEmptyState
              message={OPERATIONS_LOG_EMPTY_MESSAGE}
              showButton={false}
            />
          ) : (
            <>
              <div
                className={OPERATIONS_LOG_TABLE_SCROLL_CLASS}
                style={operationsLogTableScrollStyle}
              >
                <table
                  style={{
                    width: "100%",
                    minWidth: OPERATIONS_LOG_TABLE_MIN_WIDTH,
                    borderCollapse: "separate",
                    borderSpacing: 0,
                    tableLayout: "auto",
                  }}
                >
                  <colgroup>
                    <col style={{ width: 40 }} />
                    {columns.map((col) => (
                      <col key={col.key} style={{ width: col.width }} />
                    ))}
                  </colgroup>
                  <thead>
                    <tr>
                      <TH
                        style={{
                          ...operationsLogCheckboxCellStyle,
                          borderLeft: "none",
                          position: "sticky",
                          top: 0,
                          zIndex: 10,
                        }}
                      >
                        <Checkbox
                          size="small"
                          checked={allPageSelected}
                          indeterminate={somePageSelected}
                          onChange={handleToggleAll}
                          sx={operationsLogTableCheckboxSx}
                        />
                      </TH>
                      {columns.map((col, colIdx) => (
                        <TH
                          key={col.key}
                          style={{
                            position: "sticky",
                            top: 0,
                            zIndex: 10,
                            ...(colIdx === 0 ? {} : {}),
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
                  <tbody>
                    {pagedRows.map((row, idx) => {
                      const isSelected = selectedIds.includes(row.id);
                      const rowBg = getOperationsLogRowBg(isSelected, idx);
                      const isLastRow = idx === pagedRows.length - 1;
                      const lastRowCellStyle = isLastRow
                        ? { borderBottom: "none" }
                        : {};

                      return (
                        <tr
                          key={row.id}
                          onClick={() => handleToggleRow(row.id)}
                          style={{
                            background: rowBg,
                            cursor: "pointer",
                          }}
                        >
                          <td
                            style={{
                              ...tdStyle,
                              ...operationsLogCheckboxCellStyle,
                              background: rowBg,
                              borderLeft: "none",
                              ...lastRowCellStyle,
                            }}
                            onClick={(event) => event.stopPropagation()}
                          >
                            <Checkbox
                              size="small"
                              checked={isSelected}
                              onChange={() => handleToggleRow(row.id)}
                              sx={operationsLogTableCheckboxSx}
                            />
                          </td>
                          {columns.map((col, colIdx) => (
                            <td
                              key={`${row.id}-${col.key}`}
                              title={getOperationsLogCellValue(row, col.key)}
                              style={{
                                ...tdStyle,
                                background: rowBg,
                                textAlign: col.key === "detail" ? "left" : "center",
                                maxWidth: col.key === "detail" ? 420 : undefined,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                ...(colIdx === columns.length - 1
                                  ? { borderRight: "none" }
                                  : {}),
                                ...lastRowCellStyle,
                              }}
                            >
                              {getOperationsLogCellValue(row, col.key) || "—"}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={operationsLogFooterNoteStyle}>
                {OPERATIONS_LOG_FOOTER_LIMIT_NOTE}
              </div>

              {rows.length > 0 && (
                <OperationsLogPagination
                  page={page}
                  totalPages={totalPages}
                  recordCount={pagedRows.length}
                  recordLabel="entry"
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OperationsLog;
