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
  TextField,
} from "@mui/material";
import { PICKUP_GROUP_TITLE } from "../../../constants/PickupGroupConstants";
import {
  Btn,
  TH,
  tdStyle,
  ExtensionBreadcrumb as PickupGroupBreadcrumb,
  ExtensionTableListLoading as PickupGroupTableListLoading,
  ExtensionTableListEmptyState as PickupGroupTableListEmptyState,
  ExtensionPagination as PickupGroupPagination,
  ExtensionCodecDualList as PickupGroupCodecDualList,
  extensionTableCheckboxSx as pickupGroupTableCheckboxSx,
  extensionFixedAlertSx as pickupGroupFixedAlertSx,
  extensionPageWrapStyle as pickupGroupPageWrapStyle,
  extensionPageInnerStyle as pickupGroupPageInnerStyle,
  extensionCardStyle as pickupGroupCardStyle,
  extensionToolbarStyle as pickupGroupToolbarStyle,
  extensionSelectedBadgeStyle as pickupGroupSelectedBadgeStyle,
  extensionCancelBtnStyle as pickupGroupCancelBtnStyle,
  extensionPrimaryBtnStyle as pickupGroupPrimaryBtnStyle,
} from "../../../components/common";
import { usePickupGroupPage } from "./hooks/usePickupGroupPage";
import {
  addNewModalFooterBtnStyle,
  addNewModalFooterStyle,
  PickupGroupFieldRow,
  PickupGroupSectionHeading,
  pickupGroupModalCancelBtnStyle,
  pickupGroupModalNameTextFieldSx,
  pickupGroupModalPaperSx,
  pickupGroupModalSectionStyle,
  pickupGroupModalTitleStyle,
  PICKUP_GROUP_MODAL_NAME_LABEL_WIDTH,
} from "./components/PickupGroupFormFields";
import {
  formatPickupGroupMembersDisplay,
  getPickupGroupRowBg,
  handlePickupGroupEditIconHover,
  pickupGroupEditIconStyle,
} from "./components/PickupGroupTableHelpers";

const PickupGroup = () => {
  const vm = usePickupGroupPage();
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
        ...pickupGroupPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={pickupGroupPageInnerStyle}>
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
            sx={pickupGroupFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <PickupGroupBreadcrumb
          section="Call Features"
          current={PICKUP_GROUP_TITLE}
        />

        <div style={pickupGroupCardStyle}>
          <div
            style={{
              ...pickupGroupToolbarStyle,
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
                <span style={pickupGroupSelectedBadgeStyle}>
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
                style={pickupGroupCancelBtnStyle}
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.list}
                variant="primary"
                style={pickupGroupPrimaryBtnStyle}
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
              <PickupGroupTableListLoading />
            ) : rows.length === 0 ? (
              <PickupGroupTableListEmptyState
                message="No pickup groups found."
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
                        sx={pickupGroupTableCheckboxSx}
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
                    const rowBg = getPickupGroupRowBg(isSelected, idx);
                    const lastRowCellStyle = {
                      borderBottom: isLastRow
                        ? "none"
                        : tdStyle.borderBottom,
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
                            sx={pickupGroupTableCheckboxSx}
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
                          {formatPickupGroupMembersDisplay(
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
                              style={pickupGroupEditIconStyle}
                              onMouseEnter={(e) =>
                                handlePickupGroupEditIconHover(e, true)
                              }
                              onMouseLeave={(e) =>
                                handlePickupGroupEditIconHover(e, false)
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
            <PickupGroupPagination
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
            ...pickupGroupModalPaperSx,
            borderRadius:
              editId == null ? "4px" : pickupGroupModalPaperSx.borderRadius,
          },
        }}
      >
        <DialogTitle style={pickupGroupModalTitleStyle}>
          {editId != null
            ? `Edit ${PICKUP_GROUP_TITLE}`
            : `Add ${PICKUP_GROUP_TITLE}`}
        </DialogTitle>

        <DialogContent style={{ padding: "24px", backgroundColor: "#ffffff" }}>
          <div style={pickupGroupModalSectionStyle}>
            <PickupGroupFieldRow
              label="Name"
              tooltipKey="name"
              required
              labelWidth={PICKUP_GROUP_MODAL_NAME_LABEL_WIDTH}
            >
              <TextField
                size="small"
                value={name}
                onChange={(e) => setName(e.target.value)}
                sx={pickupGroupModalNameTextFieldSx}
              />
            </PickupGroupFieldRow>

            <PickupGroupSectionHeading
              title="Member"
              required
              tooltipKey="member"
            />

            <PickupGroupCodecDualList
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
            style={pickupGroupModalCancelBtnStyle}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PickupGroup;
