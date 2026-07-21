import React from "react";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Alert,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  useMediaQuery,
} from "@mui/material";
import { C } from "../../../theme/pbxTokens";
import {
  OPERATIONS_LOG_COLUMNS,
  OPERATIONS_LOG_COMPACT_MQ,
  OPERATIONS_LOG_EMPTY_MESSAGE,
  OPERATIONS_LOG_FILTER_MODAL_TITLE,
  OPERATIONS_LOG_FILTERED_EMPTY_MESSAGE,
  OPERATIONS_LOG_TABLE_MIN_WIDTH,
} from "../../../constants/OperationsLogConstants";
import {
  Btn,
  TH,
  tdStyle,
  ExtensionTableListLoading as OperationsLogTableListLoading,
  ExtensionTableListEmptyState as OperationsLogTableListEmptyState,
  ExtensionPagination as OperationsLogPagination,
  extensionPageWrapStyle as operationsLogPageWrapStyle,
  extensionPageInnerStyle as operationsLogPageInnerStyle,
  extensionCardStyle as operationsLogCardStyle,
  extensionToolbarStyle as operationsLogToolbarStyle,
  extensionSelectedBadgeStyle as operationsLogSelectedBadgeStyle,
  extensionCancelBtnStyle as operationsLogCancelBtnStyle,
  extensionTableCheckboxSx as operationsLogTableCheckboxSx,
  getExtensionRowBg as getOperationsLogRowBg,
  getExtensionTdStyle as getOperationsLogTdStyle,
} from "../../../components/common";
import { useOperationsLogPage } from "./hooks/useOperationsLogPage";
import {
  FilterDate,
  FilterField,
  FilterSearch,
  FilterSelect,
  OperationsLogBreadcrumb as OperationsLogPageBreadcrumb,
} from "./components/OperationsLogFormFields";
import {
  OPERATIONS_LOG_TABLE_SCROLL_CLASS,
  getOperationsLogCompactAlertSx,
  getOperationsLogCompactToolbarBtnStyle,
  getOperationsLogFilterFieldStyle,
  getOperationsLogFilterModalCancelBtnStyle,
  getOperationsLogFilterModalContentStyle,
  getOperationsLogFilterModalFooterBtnStyle,
  getOperationsLogFilterModalFooterStyle,
  getOperationsLogFilterModalFormStyle,
  getOperationsLogFilterModalPaperSx,
  getOperationsLogFilterTimeRangeStyle,
  getOperationsLogHeaderRowStyle,
  getOperationsLogPaginationStyle,
  getOperationsLogToolbarActionsStyle,
  operationsLogFilterModalGridStyle,
  operationsLogFilterModalTitleStyle,
  operationsLogTableScrollStyle,
  OPERATIONS_LOG_FILTER_TIME_RANGE_MAX_WIDTH,
  operationsLogToolbarFilterBtnStyle,
  operationsLogToolbarRefreshBtnStyle,
} from "./components/OperationsLogTableHelpers";
import {
  buildFilterSelectOptions,
  getOperationsLogCellValue,
} from "./utils/OperationsLogTransformers";

const columns = OPERATIONS_LOG_COLUMNS;

const OperationsLog = () => {
  const isCompact = useMediaQuery(OPERATIONS_LOG_COMPACT_MQ);
  const {
    rows,
    loading,
    isInitialLoad,
    message,
    setMessage,
    page,
    totalPages,
    totalRecords,
    selectedIds,
    lastUpdated,
    allPageSelected,
    somePageSelected,
    dataEmpty,
    hasActiveFilters,
    showFilterModal,
    setShowFilterModal,
    filterDraft,
    setFilterDraft,
    appliedFilters,
    filterOptions,
    loadOperationsLog,
    handleToggleRow,
    handleToggleAll,
    handlePageChange,
    handleDownload,
    handleDelete,
    handleDeleteAll,
    handleFilterOpen,
    handleFilterCancel,
    handleFilterReset,
    handleFilterSearch,
    updateFilterDraftDate,
  } = useOperationsLogPage();

  const moduleOptions = buildFilterSelectOptions(filterOptions.modules);
  const operationOptions = buildFilterSelectOptions(filterOptions.operations);
  const usernameOptions = buildFilterSelectOptions(filterOptions.usernames);
  const statusOptions = buildFilterSelectOptions(filterOptions.statuses);

  const emptyMessage = hasActiveFilters
    ? OPERATIONS_LOG_FILTERED_EMPTY_MESSAGE
    : OPERATIONS_LOG_EMPTY_MESSAGE;

  const filterFieldStyle = getOperationsLogFilterFieldStyle(isCompact);

  return (
    <div
      style={{
        ...operationsLogPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={operationsLogPageInnerStyle}>
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={getOperationsLogCompactAlertSx(isCompact)}
          >
            {message.text}
          </Alert>
        )}

        <div style={getOperationsLogHeaderRowStyle(isCompact)}>
          <OperationsLogPageBreadcrumb style={{ marginBottom: 0 }} />
          {lastUpdated && (
            <span
              style={{
                fontSize: 12,
                color: C.mutedText,
                whiteSpace: isCompact ? "normal" : "nowrap",
              }}
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

            <div style={getOperationsLogToolbarActionsStyle(isCompact)}>
              {!hasActiveFilters ? (
                <Btn
                  onClick={handleFilterOpen}
                  disabled={loading}
                  variant="cancel"
                  style={getOperationsLogCompactToolbarBtnStyle(
                    isCompact,
                    operationsLogToolbarFilterBtnStyle,
                  )}
                >
                  Filter
                </Btn>
              ) : (
                <Btn
                  onClick={handleFilterReset}
                  disabled={loading}
                  variant="cancel"
                  style={getOperationsLogCompactToolbarBtnStyle(
                    isCompact,
                    operationsLogToolbarFilterBtnStyle,
                  )}
                >
                  Reset
                </Btn>
              )}
              <Btn
                onClick={() => loadOperationsLog(page, appliedFilters)}
                disabled={loading}
                variant="cancel"
                style={getOperationsLogCompactToolbarBtnStyle(
                  isCompact,
                  operationsLogToolbarRefreshBtnStyle,
                )}
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
                style={getOperationsLogCompactToolbarBtnStyle(
                  isCompact,
                  operationsLogCancelBtnStyle,
                )}
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn
                onClick={handleDeleteAll}
                disabled={loading || (totalRecords === 0 && rows.length === 0)}
                variant="cancel"
                style={getOperationsLogCompactToolbarBtnStyle(
                  isCompact,
                  operationsLogCancelBtnStyle,
                )}
              >
                Clear All
              </Btn>
              <Btn
                onClick={handleDownload}
                disabled={loading}
                variant="cancel"
                style={getOperationsLogCompactToolbarBtnStyle(
                  isCompact,
                  operationsLogCancelBtnStyle,
                )}
              >
                ⬇ Download Log
              </Btn>
            </div>
          </div>

          {hasActiveFilters && (
            <div
              style={{
                padding: "10px 14px",
                fontSize: 12,
                color: "#64748b",
                borderBottom: "1px solid #e2e6ec",
                background: "#f8fafc",
              }}
            >
              Filters active
              {(appliedFilters.startDate || appliedFilters.endDate) && (
                <span>
                  {" "}
                  · {appliedFilters.startDate || "…"} to{" "}
                  {appliedFilters.endDate || "…"}
                </span>
              )}
            </div>
          )}

          {isInitialLoad ? (
            <OperationsLogTableListLoading />
          ) : dataEmpty && !hasActiveFilters ? (
            <OperationsLogTableListEmptyState
              message={emptyMessage}
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
                  <thead>
                    <tr>
                      <TH
                        style={{
                          width: 40,
                          padding: 0,
                          borderLeft: "none",
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
                    {rows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={columns.length + 1}
                          style={{
                            ...tdStyle,
                            textAlign: "center",
                            color: "#64748b",
                            padding: "24px 12px",
                          }}
                        >
                          {emptyMessage}
                        </td>
                      </tr>
                    ) : (
                      rows.map((row, idx) => {
                        const isSelected = selectedIds.includes(row.id);
                        const rowBg = getOperationsLogRowBg(isSelected, idx);
                        const isLastRow = idx === rows.length - 1;
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
                              if (!isSelected) {
                                e.currentTarget.style.background = "#f8fafc";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.background = rowBg;
                              }
                            }}
                          >
                            <td
                              style={getOperationsLogTdStyle(
                                rowBg,
                                lastRowCellStyle,
                                { width: 36, borderLeft: "none" },
                              )}
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
                                style={getOperationsLogTdStyle(
                                  rowBg,
                                  lastRowCellStyle,
                                  {
                                    maxWidth:
                                      col.key === "detail" ? 420 : undefined,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    ...(colIdx === columns.length - 1
                                      ? { borderRight: "none" }
                                      : {}),
                                  },
                                )}
                              >
                                {getOperationsLogCellValue(row, col.key) || "—"}
                              </td>
                            ))}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {totalRecords > 0 && (
                <OperationsLogPagination
                  page={page}
                  totalPages={totalPages}
                  recordCount={rows.length}
                  recordLabel="record"
                  onPageChange={handlePageChange}
                  style={{
                    ...getOperationsLogPaginationStyle(isCompact),
                    ...(isCompact ? { textAlign: "center" } : {}),
                  }}
                />
              )}
            </>
          )}
        </div>

        <Dialog
          open={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          maxWidth={false}
          fullScreen={isCompact}
          PaperProps={{ sx: getOperationsLogFilterModalPaperSx(isCompact) }}
        >
          <DialogTitle style={operationsLogFilterModalTitleStyle}>
            {OPERATIONS_LOG_FILTER_MODAL_TITLE}
          </DialogTitle>

          <DialogContent style={getOperationsLogFilterModalContentStyle(isCompact)}>
            <div style={getOperationsLogFilterModalFormStyle(isCompact)}>
              <div style={operationsLogFilterModalGridStyle(isCompact)}>
                <FilterField
                  label="Module"
                  tooltipKey="module"
                  fieldStyle={filterFieldStyle}
                >
                  <FilterSelect
                    fill={isCompact}
                    aria-label="Module"
                    value={filterDraft.module}
                    onChange={(e) =>
                      setFilterDraft((prev) => ({
                        ...prev,
                        module: e.target.value,
                      }))
                    }
                    options={moduleOptions}
                  />
                </FilterField>

                <FilterField
                  label="Operation"
                  tooltipKey="operation"
                  fieldStyle={filterFieldStyle}
                >
                  <FilterSelect
                    fill={isCompact}
                    aria-label="Operation"
                    value={filterDraft.operation}
                    onChange={(e) =>
                      setFilterDraft((prev) => ({
                        ...prev,
                        operation: e.target.value,
                      }))
                    }
                    options={operationOptions}
                  />
                </FilterField>

                <FilterField
                  label="Username"
                  tooltipKey="username"
                  fieldStyle={filterFieldStyle}
                >
                  <FilterSelect
                    fill={isCompact}
                    aria-label="Username"
                    value={filterDraft.username}
                    onChange={(e) =>
                      setFilterDraft((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                    options={usernameOptions}
                  />
                </FilterField>

                <FilterField
                  label="Status"
                  tooltipKey="status"
                  fieldStyle={filterFieldStyle}
                >
                  <FilterSelect
                    fill={isCompact}
                    aria-label="Status"
                    value={filterDraft.status}
                    onChange={(e) =>
                      setFilterDraft((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    options={statusOptions}
                  />
                </FilterField>

                <FilterField
                  label="IP Address"
                  tooltipKey="ip"
                  fieldStyle={filterFieldStyle}
                >
                  <FilterSearch
                    placeholder="192.168.0.81"
                    value={filterDraft.ip}
                    onChange={(e) =>
                      setFilterDraft((prev) => ({
                        ...prev,
                        ip: e.target.value,
                      }))
                    }
                  />
                </FilterField>

                <FilterField
                  label="Time Range"
                  tooltipKey="time_range"
                  fieldStyle={filterFieldStyle}
                  style={
                    isCompact
                      ? undefined
                      : { maxWidth: OPERATIONS_LOG_FILTER_TIME_RANGE_MAX_WIDTH }
                  }
                >
                  <div style={getOperationsLogFilterTimeRangeStyle(isCompact)}>
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
            </div>
          </DialogContent>

          <DialogActions style={getOperationsLogFilterModalFooterStyle(isCompact)}>
            <Btn
              onClick={handleFilterSearch}
              disabled={loading}
              variant="primary"
              style={getOperationsLogFilterModalFooterBtnStyle(isCompact)}
            >
              Search
            </Btn>
            <Btn
              onClick={handleFilterCancel}
              variant="cancel"
              style={getOperationsLogFilterModalCancelBtnStyle(isCompact)}
            >
              Cancel
            </Btn>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default OperationsLog;
