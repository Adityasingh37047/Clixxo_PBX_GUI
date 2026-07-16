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
import {
  PAGING_TITLE,
  PAGING_TYPE_OPTIONS,
} from "../../../constants/PagingConstants";
import {
  Btn,
  TH,
  tdStyle,
  ExtensionBreadcrumb as PagingBreadcrumb,
  ExtensionTableListLoading as PagingTableListLoading,
  ExtensionTableListEmptyState as PagingTableListEmptyState,
  ExtensionPagination as PagingPagination,
  ExtensionCodecDualList as PagingCodecDualList,
  extensionTableCheckboxSx as pagingTableCheckboxSx,
  extensionFixedAlertSx as pagingFixedAlertSx,
  extensionPageWrapStyle as pagingPageWrapStyle,
  extensionPageInnerStyle as pagingPageInnerStyle,
  extensionCardStyle as pagingCardStyle,
  extensionToolbarStyle as pagingToolbarStyle,
  extensionSelectedBadgeStyle as pagingSelectedBadgeStyle,
  extensionCancelBtnStyle as pagingCancelBtnStyle,
  extensionPrimaryBtnStyle as pagingPrimaryBtnStyle,
} from "../../../components/common";
import { usePagingPage } from "./hooks/usePagingPage";
import {
  addNewModalFooterBtnStyle,
  addNewModalFooterStyle,
  PagingFieldRow,
  PagingSectionHeading,
  pagingModalCancelBtnStyle,
  pagingModalPaperSx,
  pagingModalSectionStyle,
  pagingModalSelectSx,
  pagingModalTextFieldFullSx,
  pagingModalTitleStyle,
} from "./components/PagingFormFields";
import {
  formatPagingMembersDisplay,
  getPagingRowBg,
  handlePagingEditIconHover,
  pagingEditIconStyle,
  pagingNumberBadgeStyle,
} from "./components/PagingTableHelpers";

const Paging = () => {
  const vm = usePagingPage();
  const {
    isCompact,
    rows,
    selected,
    showModal,
    loading,
    message,
    setMessage,
    isInitialLoad,
    itemsPerPage,
    page,
    setPage,
    totalPages,
    pagedRows,
    filteredRows,
    editId,
    name,
    setName,
    number,
    setNumber,
    pagingType,
    setPagingType,
    callerIdNamePrefix,
    setCallerIdNamePrefix,
    memberExtensions,
    setMemberExtensions,
    allExtensionOptions,
    getExtLabel,
    availableMemberEmptyText,
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
        ...pagingPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={pagingPageInnerStyle}>
        {message.text && (
          <Alert
            severity={
              message.type === "error"
                ? "error"
                : message.type === "success"
                  ? "success"
                  : "info"
            }
            onClose={() => setMessage({ type: "", text: "" })}
            sx={pagingFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <PagingBreadcrumb
          section="Call Features"
          current={PAGING_TITLE}
        />

        <div style={pagingCardStyle}>
          <div
            style={{
              ...pagingToolbarStyle,
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
                <span style={pagingSelectedBadgeStyle}>
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
                  loading.delete || loading.list || selected.length === 0
                }
                variant="cancel"
                style={pagingCancelBtnStyle}
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.list}
                variant="primary"
                style={pagingPrimaryBtnStyle}
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
              <PagingTableListLoading />
            ) : rows.length === 0 ? (
              <PagingTableListEmptyState
                message="No paging groups found."
                onAddNew={handleOpenAddModal}
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
                        sx={pagingTableCheckboxSx}
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
                      Number
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Type
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      CallerID Name Prefix
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Members
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
                    const rowBg = getPagingRowBg(isSelected, idx);
                    const lastRowCellStyle = {
                      borderBottom: isLastRow ? "none" : tdStyle.borderBottom,
                    };

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
                            sx={pagingTableCheckboxSx}
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
                          <span style={pagingNumberBadgeStyle}>
                            {row.number}
                          </span>
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.type}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.callerIdNamePrefix || "—"}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {formatPagingMembersDisplay(row.members, getExtLabel)}
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
                              style={pagingEditIconStyle}
                              onMouseEnter={(e) =>
                                handlePagingEditIconHover(e, true)
                              }
                              onMouseLeave={(e) =>
                                handlePagingEditIconHover(e, false)
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
            <PagingPagination
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
            ...pagingModalPaperSx,
            borderRadius:
              editId == null ? "4px" : pagingModalPaperSx.borderRadius,
          },
        }}
      >
        <DialogTitle style={pagingModalTitleStyle}>
          {editId != null ? `Edit ${PAGING_TITLE}` : `Add ${PAGING_TITLE}`}
        </DialogTitle>

        <DialogContent style={{ padding: "24px", backgroundColor: "#ffffff" }}>
          <div style={pagingModalSectionStyle}>
            <PagingSectionHeading title="General Settings" isFirst />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isCompact ? "1fr" : "1fr 1fr",
                gap: "16px 32px",
              }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <PagingFieldRow label="Name" tooltipKey="name" required>
                  <TextField
                    size="small"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    sx={pagingModalTextFieldFullSx}
                  />
                </PagingFieldRow>

                <PagingFieldRow label="Number" tooltipKey="number" required>
                  <TextField
                    size="small"
                    fullWidth
                    type="number"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    sx={pagingModalTextFieldFullSx}
                  />
                </PagingFieldRow>
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <PagingFieldRow label="Type" tooltipKey="type" required>
                  <FormControl size="small" fullWidth>
                    <MuiSelect
                      value={pagingType}
                      onChange={(e) => setPagingType(e.target.value)}
                      sx={pagingModalSelectSx}
                    >
                      {PAGING_TYPE_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                          {opt}
                        </MenuItem>
                      ))}
                    </MuiSelect>
                  </FormControl>
                </PagingFieldRow>

                <PagingFieldRow
                  label="CallerID Name Prefix"
                  tooltipKey="caller_id_name_prefix"
                >
                  <TextField
                    size="small"
                    fullWidth
                    value={callerIdNamePrefix}
                    onChange={(e) => setCallerIdNamePrefix(e.target.value)}
                    sx={pagingModalTextFieldFullSx}
                  />
                </PagingFieldRow>
              </div>
            </div>

            <PagingSectionHeading
              title="Member Extensions"
              required
              tooltipKey="member"
            />

            <PagingCodecDualList
              allOptions={loading.extensions ? [] : allExtensionOptions}
              selected={memberExtensions}
              onChange={setMemberExtensions}
              getLabel={getExtLabel}
              emptyTextAvailable={availableMemberEmptyText}
              emptyTextSelected="No selected member"
            />
          </div>
        </DialogContent>

        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn
            variant="primary"
            onClick={handleSave}
            disabled={loading.save}
            style={addNewModalFooterBtnStyle}
          >
            {loading.save ? (
              <>
                <CircularProgress size={13} sx={{ color: "#fff", mr: 1 }} />
                Saving...
              </>
            ) : editId != null ? (
              "Update Group"
            ) : (
              "Create Group"
            )}
          </Btn>
          <Btn
            onClick={handleCloseModal}
            disabled={loading.save}
            variant="cancel"
            style={pagingModalCancelBtnStyle}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Paging;
