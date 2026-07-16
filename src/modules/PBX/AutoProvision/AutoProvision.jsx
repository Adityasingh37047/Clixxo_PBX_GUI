import React from "react";
import { Alert, CircularProgress } from "@mui/material";
import {
  AUTO_PROVISION_BREADCRUMB_SECTION,
  AUTO_PROVISION_COLUMNS,
  AUTO_PROVISION_SEARCH_PLACEHOLDER,
  AUTO_PROVISION_TITLE,
} from "../../../constants/AutoProvisionConstants";
import {
  Btn,
  TH,
  tdStyle,
  ExtensionBreadcrumb as AutoProvisionBreadcrumb,
  ExtensionTableListLoading as AutoProvisionTableListLoading,
  ExtensionTableListEmptyState as AutoProvisionTableListEmptyState,
  ExtensionPagination as AutoProvisionPagination,
  extensionFixedAlertSx as autoProvisionFixedAlertSx,
  extensionPageWrapStyle as autoProvisionPageWrapStyle,
  extensionPageInnerStyle as autoProvisionPageInnerStyle,
  extensionCardStyle as autoProvisionCardStyle,
  extensionToolbarStyle as autoProvisionToolbarStyle,
  extensionSelectedBadgeStyle as autoProvisionSelectedBadgeStyle,
  extensionCancelBtnStyle as autoProvisionCancelBtnStyle,
} from "../../../components/common";
import { useAutoProvisionPage } from "./hooks/useAutoProvisionPage";
import { AutoProvisionToolbarSearchBar } from "./components/AutoProvisionFormFields";
import {
  getAutoProvisionRowBg,
  handleAutoProvisionRowHover,
} from "./components/AutoProvisionTableHelpers";

const AutoProvision = () => {
  const vm = useAutoProvisionPage();
  const {
    isCompact,
    rows,
    selected,
    loading,
    error,
    setError,
    isInitialLoad,
    itemsPerPage,
    page,
    setPage,
    searchQuery,
    searchFocused,
    setSearchFocused,
    totalPages,
    pagedRows,
    filteredRows,
    loadRows,
    handleSearchChange,
    handleClearSearch,
    emptyMessage,
  } = vm;

  return (
    <div
      style={{
        ...autoProvisionPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={autoProvisionPageInnerStyle}>
        {error.text && (
          <Alert
            severity={
              error.type === "error"
                ? "error"
                : error.type === "success"
                  ? "success"
                  : "info"
            }
            onClose={() => setError({ type: "", text: "" })}
            sx={autoProvisionFixedAlertSx}
          >
            {error.text}
          </Alert>
        )}

        <AutoProvisionBreadcrumb
          section={AUTO_PROVISION_BREADCRUMB_SECTION}
          current={AUTO_PROVISION_TITLE}
        />

        <div style={autoProvisionCardStyle}>
          <div
            style={{
              ...autoProvisionToolbarStyle,
              ...(isCompact
                ? { flexDirection: "column", alignItems: "stretch", gap: 10 }
                : {}),
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {selected.length > 0 && (
                <span style={autoProvisionSelectedBadgeStyle}>
                  {selected.length} selected
                </span>
              )}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <AutoProvisionToolbarSearchBar
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                onClear={handleClearSearch}
                placeholder={AUTO_PROVISION_SEARCH_PLACEHOLDER}
                searchFocused={searchFocused}
              />

              <Btn
                onClick={loadRows}
                disabled={loading.fetch}
                variant="cancel"
                style={autoProvisionCancelBtnStyle}
              >
                {loading.fetch ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : (
                  "Refresh"
                )}
              </Btn>
            </div>
          </div>

          <div
            style={{
              overflowX: "hidden",
              overflowY: "auto",
              flex: 1,
              ...(isCompact
                ? { overflowX: "auto", WebkitOverflowScrolling: "touch" }
                : {}),
            }}
          >
            {isInitialLoad ? (
              <AutoProvisionTableListLoading />
            ) : rows.length === 0 ? (
              <AutoProvisionTableListEmptyState message={emptyMessage} />
            ) : searchQuery && filteredRows.length === 0 ? (
              <AutoProvisionTableListEmptyState
                message={`No results for "${searchQuery}"`}
              />
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  tableLayout: "auto",
                }}
              >
                <thead>
                  <tr>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      {AUTO_PROVISION_COLUMNS.macAddress}
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      {AUTO_PROVISION_COLUMNS.extension}
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      {AUTO_PROVISION_COLUMNS.manufacturerModel}
                    </TH>
                    <TH
                      style={{
                        borderRight: "none",
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                      }}
                    >
                      {AUTO_PROVISION_COLUMNS.ip}
                    </TH>
                  </tr>
                </thead>
                <tbody>
                  {pagedRows.map((row, idx) => {
                    const realIdx = (page - 1) * itemsPerPage + idx;
                    const isSelected = selected.includes(realIdx);
                    const isLastRow = idx === pagedRows.length - 1;
                    const rowBg = getAutoProvisionRowBg(idx, isSelected);
                    const lastRowCellStyle = isLastRow
                      ? { borderBottom: "none" }
                      : {};
                    const cellStyle = {
                      ...tdStyle,
                      background: rowBg,
                      ...lastRowCellStyle,
                    };
                    const lastCellStyle = {
                      ...cellStyle,
                      borderRight: "none",
                    };

                    return (
                      <tr
                        key={row.id || realIdx}
                        style={{
                          background: rowBg,
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) =>
                          handleAutoProvisionRowHover(e, true, isSelected, rowBg)
                        }
                        onMouseLeave={(e) =>
                          handleAutoProvisionRowHover(
                            e,
                            false,
                            isSelected,
                            rowBg,
                          )
                        }
                      >
                        <td style={cellStyle}>{row.macAddress || "—"}</td>
                        <td style={cellStyle}>{row.extension || "—"}</td>
                        <td style={cellStyle}>
                          {row.manufacturerModel || "—"}
                        </td>
                        <td style={lastCellStyle}>{row.ip || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {!isInitialLoad && rows.length > 0 && filteredRows.length > 0 && (
            <AutoProvisionPagination
              page={page}
              totalPages={totalPages}
              recordCount={pagedRows.length}
              onPageChange={(p) =>
                setPage(Math.min(totalPages, Math.max(1, p)))
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AutoProvision;
