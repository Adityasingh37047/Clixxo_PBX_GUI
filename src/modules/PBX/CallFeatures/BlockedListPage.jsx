import React from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Alert,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Select as MuiSelect,
  TextField,
} from "@mui/material";
import { C } from "../../../theme/pbxTokens";
import {
  BLOCKED_LIST_DIRECTION_OPTIONS,
  BLOCKED_LIST_ENABLE_OPTIONS,
  BLOCKED_LIST_MATCH_MODE_OPTIONS,
} from "../../../constants/BlockedListConstants";
import {
  Btn,
  TH,
  tdStyle,
  ExtensionBreadcrumb as BlockedListBreadcrumb,
  ExtensionTableListLoading as BlockedListTableListLoading,
  ExtensionTableListEmptyState as BlockedListTableListEmptyState,
  ExtensionPagination as BlockedListPagination,
  extensionTableCheckboxSx as blockedListTableCheckboxSx,
  extensionFixedAlertSx as blockedListFixedAlertSx,
  extensionPageWrapStyle as blockedListPageWrapStyle,
  extensionPageInnerStyle as blockedListPageInnerStyle,
  extensionCardStyle as blockedListCardStyle,
  extensionToolbarStyle as blockedListToolbarStyle,
  extensionSelectedBadgeStyle as blockedListSelectedBadgeStyle,
  extensionCancelBtnStyle as blockedListCancelBtnStyle,
  extensionPrimaryBtnStyle as blockedListPrimaryBtnStyle,
  getExtensionRowBg as getBlockedListRowBg,
} from "../../../components/common";
import { useBlockedListPage } from "./hooks/useBlockedListPage";
import {
  addNewModalFooterBtnStyle,
  addNewModalFooterStyle,
  BlockedListFieldRow,
  blockedListModalCancelBtnStyle,
  blockedListModalFormStyle,
  blockedListModalPaperSx,
  blockedListModalSelectSx,
  blockedListModalTextFieldFullSx,
  blockedListModalTitleStyle,
} from "./components/BlockedListFormFields";
import {
  blockedListEditIconStyle,
  directionCellStyle,
  handleBlockedListEditIconHover,
  matchModeCellStyle,
  yesNoCellStyle,
} from "./components/BlockedListTableHelpers";

const BlockedListPage = () => {
  const vm = useBlockedListPage();
  const {
    isCompact,
    rows,
    selected,
    showModal,
    loading,
    error,
    setError,
    isInitialLoad,
    itemsPerPage,
    page,
    setPage,
    searchQuery,
    totalPages,
    pagedRows,
    filteredRows,
    editId,
    name,
    setName,
    matchMode,
    setMatchMode,
    blockedNumber,
    setBlockedNumber,
    selectedExtension,
    setSelectedExtension,
    direction,
    setDirection,
    enabled,
    setEnabled,
    availableExtensions,
    allPageSelected,
    somePageSelected,
    handleToggleRow,
    handleToggleAll,
    handleDelete,
    handleOpenAddModal,
    handleOpenEditModal,
    handleCloseModal,
    handleSave,
  } = vm;

  return (
    <div
      style={{
        ...blockedListPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={blockedListPageInnerStyle}>
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
            sx={blockedListFixedAlertSx}
          >
            {error.text}
          </Alert>
        )}

        <BlockedListBreadcrumb section="Call Features" current="Blocked List" />

        <div style={blockedListCardStyle}>
          <div
            style={{
              ...blockedListToolbarStyle,
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
                <span style={blockedListSelectedBadgeStyle}>
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
              <Btn
                onClick={handleDelete}
                disabled={
                  loading.delete || loading.fetch || selected.length === 0
                }
                variant="cancel"
                style={blockedListCancelBtnStyle}
              >
                {loading.delete && (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                )}
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.fetch}
                variant="primary"
                style={blockedListPrimaryBtnStyle}
              >
                + Add New
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
              <BlockedListTableListLoading />
            ) : rows.length === 0 ? (
              <BlockedListTableListEmptyState
                message="No blocked entries found."
                onAddNew={handleOpenAddModal}
              />
            ) : searchQuery && filteredRows.length === 0 ? (
              <BlockedListTableListEmptyState
                message={`No results for "${searchQuery}"`}
                showButton={false}
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
                    <TH
                      style={{
                        width: 40,
                        padding: 0,
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
                        sx={blockedListTableCheckboxSx}
                      />
                    </TH>
                    <TH
                      style={{
                        width: 36,
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                      }}
                    >
                      ID
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Name
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Match Mode
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Blocked List Number
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Direction
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Enable
                    </TH>
                    <TH
                      style={{
                        width: 70,
                        borderRight: "none",
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                      }}
                    >
                      Modify
                    </TH>
                  </tr>
                </thead>
                <tbody>
                  {pagedRows.map((row, idx) => {
                    const realIdx = (page - 1) * itemsPerPage + idx;
                    const isSelected = selected.includes(realIdx);
                    const isLastRow = idx === pagedRows.length - 1;
                    const lastRowCellStyle = isLastRow
                      ? { borderBottom: "none" }
                      : {};
                    const rowBg = getBlockedListRowBg(isSelected, idx);

                    return (
                      <tr
                        key={row.id || realIdx}
                        style={{
                          background: rowBg,
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected)
                            e.currentTarget.style.background = "#f8fafc";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected)
                            e.currentTarget.style.background = rowBg;
                        }}
                      >
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderLeft: "none",
                            ...lastRowCellStyle,
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => handleToggleRow(realIdx)}
                            sx={blockedListTableCheckboxSx}
                          />
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {realIdx + 1}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.name}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          <span style={matchModeCellStyle}>{row.matchMode}</span>
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.blockedNumber}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          <span style={directionCellStyle(row.direction)}>
                            {row.direction}
                          </span>
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          <span style={yesNoCellStyle(row.enabled)}>
                            {row.enabled}
                          </span>
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderRight: "none",
                            ...lastRowCellStyle,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            <EditDocumentIcon
                              titleAccess="Edit"
                              onClick={() => handleOpenEditModal(row)}
                              style={blockedListEditIconStyle(loading.delete)}
                              onMouseEnter={(e) =>
                                handleBlockedListEditIconHover(
                                  e,
                                  true,
                                  loading.delete,
                                )
                              }
                              onMouseLeave={(e) =>
                                handleBlockedListEditIconHover(
                                  e,
                                  false,
                                  loading.delete,
                                )
                              }
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {!isInitialLoad && rows.length > 0 && filteredRows.length > 0 && (
            <BlockedListPagination
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

      <Dialog
        open={showModal}
        onClose={loading.save ? null : handleCloseModal}
        maxWidth={false}
        sx={{
          "& .MuiDialog-container": {
            alignItems: "center",
            justifyContent: "center",
          },
        }}
        PaperProps={{
          sx: {
            ...blockedListModalPaperSx,
            borderRadius:
              editId == null ? "4px" : blockedListModalPaperSx.borderRadius,
          },
        }}
      >
        <DialogTitle style={blockedListModalTitleStyle}>
          {editId != null ? "Edit Blocked Entry" : "Add Blocked Entry"}
        </DialogTitle>

        <DialogContent style={{ padding: "24px", backgroundColor: "#ffffff" }}>
          <div style={blockedListModalFormStyle}>
            <div
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              <BlockedListFieldRow label="Name" tooltipKey="name" required>
                <TextField
                  size="small"
                  fullWidth
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  sx={blockedListModalTextFieldFullSx}
                />
              </BlockedListFieldRow>

              <BlockedListFieldRow
                label="Match Mode"
                tooltipKey="match_mode"
                required
              >
                <FormControl size="small" fullWidth>
                  <MuiSelect
                    value={matchMode}
                    onChange={(e) => {
                      const val = e.target.value;
                      setMatchMode(val);
                      if (val === "Extension") setBlockedNumber("");
                      else setSelectedExtension("");
                    }}
                    sx={blockedListModalSelectSx}
                  >
                    {BLOCKED_LIST_MATCH_MODE_OPTIONS.map((opt) => (
                      <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                        {opt}
                      </MenuItem>
                    ))}
                  </MuiSelect>
                </FormControl>
              </BlockedListFieldRow>

              {matchMode === "Extension" ? (
                <BlockedListFieldRow label="Extension" required>
                  <FormControl size="small" fullWidth>
                    <MuiSelect
                      value={selectedExtension}
                      onChange={(e) => setSelectedExtension(e.target.value)}
                      displayEmpty
                      sx={blockedListModalSelectSx}
                    >
                      <MenuItem value="" disabled sx={{ fontSize: 13 }}>
                        <span style={{ color: C.mutedText }}>
                          Select Extension
                        </span>
                      </MenuItem>
                      {availableExtensions.map((ext) => (
                        <MenuItem
                          key={ext.value}
                          value={ext.value}
                          sx={{ fontSize: 13 }}
                        >
                          {ext.label}
                        </MenuItem>
                      ))}
                    </MuiSelect>
                  </FormControl>
                </BlockedListFieldRow>
              ) : (
                <BlockedListFieldRow
                  label="Blocked List Number"
                  tooltipKey="blocked_list_number"
                  required
                >
                  <TextField
                    fullWidth
                    size="small"
                    value={blockedNumber}
                    onChange={(e) => setBlockedNumber(e.target.value)}
                    sx={blockedListModalTextFieldFullSx}
                  />
                </BlockedListFieldRow>
              )}

              <BlockedListFieldRow
                label="Blocked List Direction"
                tooltipKey="direction"
                required
              >
                <FormControl size="small" fullWidth>
                  <MuiSelect
                    value={direction}
                    onChange={(e) => setDirection(e.target.value)}
                    sx={blockedListModalSelectSx}
                  >
                    {BLOCKED_LIST_DIRECTION_OPTIONS.map((opt) => (
                      <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                        {opt}
                      </MenuItem>
                    ))}
                  </MuiSelect>
                </FormControl>
              </BlockedListFieldRow>

              <BlockedListFieldRow label="Enable" tooltipKey="enabled" required>
                <FormControl size="small" fullWidth>
                  <MuiSelect
                    value={enabled}
                    onChange={(e) => setEnabled(e.target.value)}
                    sx={blockedListModalSelectSx}
                  >
                    {BLOCKED_LIST_ENABLE_OPTIONS.map((opt) => (
                      <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                        {opt}
                      </MenuItem>
                    ))}
                  </MuiSelect>
                </FormControl>
              </BlockedListFieldRow>
            </div>
          </div>
        </DialogContent>

        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn
            onClick={handleSave}
            disabled={loading.save}
            variant="primary"
            style={addNewModalFooterBtnStyle}
          >
            {loading.save ? (
              <>
                <CircularProgress size={14} style={{ color: "#fff" }} />
                Saving...
              </>
            ) : editId != null ? (
              "Update Entry"
            ) : (
              "Create"
            )}
          </Btn>
          <Btn
            onClick={handleCloseModal}
            disabled={loading.save}
            variant="cancel"
            style={blockedListModalCancelBtnStyle}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default BlockedListPage;
