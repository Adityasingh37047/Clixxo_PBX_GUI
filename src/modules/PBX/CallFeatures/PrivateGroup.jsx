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
  PRIVATE_GROUP_ENABLE_OPTIONS,
  PRIVATE_GROUP_TITLE,
} from "../../../constants/PrivateGroupConstants";
import {
  Btn,
  TH,
  tdStyle,
  ExtensionBreadcrumb as PrivateGroupBreadcrumb,
  ExtensionTableListLoading as PrivateGroupTableListLoading,
  ExtensionTableListEmptyState as PrivateGroupTableListEmptyState,
  ExtensionPagination as PrivateGroupPagination,
  extensionTableCheckboxSx as privateGroupTableCheckboxSx,
  extensionFixedAlertSx as privateGroupFixedAlertSx,
  extensionPageWrapStyle as privateGroupPageWrapStyle,
  extensionPageInnerStyle as privateGroupPageInnerStyle,
  extensionCardStyle as privateGroupCardStyle,
  extensionToolbarStyle as privateGroupToolbarStyle,
  extensionSelectedBadgeStyle as privateGroupSelectedBadgeStyle,
  extensionCancelBtnStyle as privateGroupCancelBtnStyle,
  extensionPrimaryBtnStyle as privateGroupPrimaryBtnStyle,
  ExtensionCodecDualList as PrivateGroupCodecDualList,
} from "../../../components/common";
import { usePrivateGroupPage } from "./hooks/usePrivateGroupPage";
import {
  addNewModalFooterBtnStyle,
  addNewModalFooterStyle,
  PrivateGroupFieldRow,
  PrivateGroupSectionHeading,
  privateGroupModalCancelBtnStyle,
  privateGroupModalPaperSx,
  privateGroupModalSectionStyle,
  privateGroupModalSelectSx,
  privateGroupModalTextFieldFullSx,
  privateGroupModalTitleStyle,
} from "./components/PrivateGroupFormFields";
import {
  getPrivateGroupRowBg,
  handlePrivateGroupEditIconHover,
  privateGroupEditIconStyle,
  privateGroupEnabledCellStyle,
} from "./components/PrivateGroupTableHelpers";
import { formatPrivateGroupMembersCell } from "./utils/PrivateGroupTransformers";

const PrivateGroup = () => {
  const vm = usePrivateGroupPage();
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
    enabled,
    setEnabled,
    memberExtensions,
    setMemberExtensions,
    allPageSelected,
    somePageSelected,
    allExtensionOptions,
    availableMemberEmptyText,
    getExtLabel,
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
        ...privateGroupPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={privateGroupPageInnerStyle}>
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
            sx={privateGroupFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <PrivateGroupBreadcrumb
          section="Call Features"
          current={PRIVATE_GROUP_TITLE}
        />

        <div style={privateGroupCardStyle}>
          <div
            style={{
              ...privateGroupToolbarStyle,
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
                <span style={privateGroupSelectedBadgeStyle}>
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
                style={privateGroupCancelBtnStyle}
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.list}
                variant="primary"
                style={privateGroupPrimaryBtnStyle}
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
              <PrivateGroupTableListLoading />
            ) : rows.length === 0 ? (
              <PrivateGroupTableListEmptyState
                message="No private groups found."
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
                        sx={privateGroupTableCheckboxSx}
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
                      Enabled
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
                    const rowBg = getPrivateGroupRowBg(isSelected, idx);
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
                            sx={privateGroupTableCheckboxSx}
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
                          <span style={privateGroupEnabledCellStyle(row.enabled)}>
                            {row.enabled}
                          </span>
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {formatPrivateGroupMembersCell(
                            row.members,
                            getExtLabel,
                          )}
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
                              style={privateGroupEditIconStyle}
                              onMouseEnter={(e) =>
                                handlePrivateGroupEditIconHover(e, true)
                              }
                              onMouseLeave={(e) =>
                                handlePrivateGroupEditIconHover(e, false)
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
            <PrivateGroupPagination
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
            ...privateGroupModalPaperSx,
            borderRadius:
              editId == null ? "4px" : privateGroupModalPaperSx.borderRadius,
          },
        }}
      >
        <DialogTitle style={privateGroupModalTitleStyle}>
          {editId != null
            ? `Edit ${PRIVATE_GROUP_TITLE}`
            : `Add ${PRIVATE_GROUP_TITLE}`}
        </DialogTitle>

        <DialogContent style={{ padding: "24px", backgroundColor: "#ffffff" }}>
          <div style={privateGroupModalSectionStyle}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isCompact ? "1fr" : "1fr 1fr",
                gap: "16px 32px",
              }}
            >
              <PrivateGroupFieldRow label="Name" tooltipKey="name" required>
                <TextField
                  size="small"
                  fullWidth
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  sx={privateGroupModalTextFieldFullSx}
                />
              </PrivateGroupFieldRow>

              <PrivateGroupFieldRow label="Enable" tooltipKey="enabled" required>
                <FormControl size="small" fullWidth>
                  <MuiSelect
                    value={enabled}
                    onChange={(e) => setEnabled(e.target.value)}
                    sx={privateGroupModalSelectSx}
                  >
                    {PRIVATE_GROUP_ENABLE_OPTIONS.map((opt) => (
                      <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                        {opt}
                      </MenuItem>
                    ))}
                  </MuiSelect>
                </FormControl>
              </PrivateGroupFieldRow>
            </div>

            <PrivateGroupSectionHeading
              title="Member Extensions"
              required
              tooltipKey="member"
            />

            <PrivateGroupCodecDualList
              hideReorder
              allOptions={allExtensionOptions}
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
            style={privateGroupModalCancelBtnStyle}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PrivateGroup;
