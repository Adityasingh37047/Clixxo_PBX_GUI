import React from "react";
import {
  Alert,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  useMediaQuery,
} from "@mui/material";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { C, EXTENSION_COMPACT_MQ } from "../../../theme/pbxTokens";
import {
  Btn,
  TH,
  ExtensionBreadcrumb as ExtGroupBreadcrumb,
  ExtensionTableListLoading as ExtGroupTableListLoading,
  ExtensionTableListEmptyState as ExtGroupTableListEmptyState,
  ExtensionPagination as ExtGroupPagination,
  extensionTableCheckboxSx as extGroupTableCheckboxSx,
  extensionPageWrapStyle as extGroupPageWrapStyle,
  extensionPageInnerStyle as extGroupPageInnerStyle,
  extensionCardStyle as extGroupCardStyle,
  extensionToolbarStyle as extGroupToolbarStyle,
  extensionSelectedBadgeStyle as extGroupSelectedBadgeStyle,
  extensionCancelBtnStyle as extGroupCancelBtnStyle,
  extensionPrimaryBtnStyle as extGroupPrimaryBtnStyle,
  extensionFixedAlertSx as extGroupFixedAlertSx,
  ExtensionCodecDualList as ExtGroupCodecDualList,
  ExtensionEditIcon,
  addNewModalFooterStyle,
  addNewModalFooterBtnStyle,
  extensionModalCancelBtnStyle as extGroupModalCancelBtnStyle,
  getExtensionTdStyle as getExtGroupTdStyle,
  getExtensionRowBg as getExtGroupRowBg,
} from "../../../components/common";
import { useExtensionGroupsPage } from "./hooks/useExtensionGroupsPage";
import { ExtGroupSectionHeading } from "./components/ExtensionGroupsFormFields";
import {
  extGroupDialogPaperSx,
  extGroupExtensionsListStyle,
  extGroupModalFormStyle,
  extGroupModalTextFieldSx,
  extGroupModalTitleStyle,
  extGroupTableStyle,
} from "./components/ExtensionGroupsTableHelpers";
import {
  EXT_GROUP_LIST_TRUNCATE_THRESHOLD,
  formatExtGroupItemListDisplay,
} from "./utils/ExtensionGroupsTransformers";

const ExtensionGroupsPage = () => {
  const isCompact = useMediaQuery(EXTENSION_COMPACT_MQ);
  const {
    allExtensionOptions,
    allPageSelected,
    availableExtensions,
    dataEmpty,
    editGroupId,
    getExtensionLabel,
    groupName,
    groups,
    handleCloseModal,
    handleDelete,
    handleOpenAddModal,
    handleOpenEditModal,
    handleSaveGroup,
    handleToggleAll,
    handleToggleRow,
    isInitialLoad,
    limit,
    loading,
    message,
    modalScrollRef,
    page,
    pagedGroups,
    selectedExtensions,
    selectedIds,
    setGroupName,
    setMessage,
    setPage,
    setSelectedExtensions,
    showModal,
    somePageSelected,
    totalPages,
  } = useExtensionGroupsPage();

  return (
    <div style={{ ...extGroupPageWrapStyle, ...(isCompact ? { padding: 8 } : {}) }}>
      <div style={extGroupPageInnerStyle}>
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={extGroupFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}
        <ExtGroupBreadcrumb section="Extensions" current="Extension Group" />
        <div style={extGroupCardStyle}>
          <div
            style={{
              ...extGroupToolbarStyle,
              ...(isCompact
                ? { flexDirection: "column", alignItems: "stretch", gap: 10 }
                : {}),
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {selectedIds.length > 0 && (
                <span style={extGroupSelectedBadgeStyle}>
                  {selectedIds.length} selected
                </span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <Btn
                onClick={handleDelete}
                disabled={loading.delete || loading.fetch || selectedIds.length === 0}
                variant="cancel"
                style={extGroupCancelBtnStyle}
              >
                {loading.delete ? <CircularProgress size={11} style={{ color: "#374151" }} /> : null}
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.fetch}
                variant="primary"
                style={extGroupPrimaryBtnStyle}
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
              <ExtGroupTableListLoading />
            ) : dataEmpty ? (
              <ExtGroupTableListEmptyState
                message="No extension groups found."
                onAddNew={handleOpenAddModal}
              />
            ) : (
              <table style={extGroupTableStyle}>
                <thead>
                  <tr>
                    <TH style={{ width: 40, padding: 0, borderLeft: "none" }}>
                      <Checkbox
                        size="small"
                        checked={allPageSelected}
                        indeterminate={somePageSelected}
                        onChange={handleToggleAll}
                        sx={extGroupTableCheckboxSx}
                      />
                    </TH>
                    <TH style={{ width: 36 }}>ID</TH>
                    <TH>Group Name</TH>
                    <TH>Extensions</TH>
                    <TH style={{ width: 70, borderRight: "none" }}>Modify</TH>
                  </tr>
                </thead>
                <tbody>
                  {pagedGroups.map((row, idx) => {
                    const isSelected = selectedIds.includes(row.id);
                    const isLastRow = idx === pagedGroups.length - 1;
                    const lastRowCellStyle = isLastRow ? { borderBottom: "none" } : {};
                    const rowBg = getExtGroupRowBg(isSelected, idx);
                    const realIndex = (page - 1) * limit + idx + 1;
                    return (
                      <tr
                        key={row.id}
                        style={{ background: rowBg, transition: "background 0.15s ease" }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.background = "#f8fafc";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.background = rowBg;
                        }}
                      >
                        <td style={getExtGroupTdStyle(rowBg, lastRowCellStyle, { width: 36, borderLeft: "none" })}>
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => handleToggleRow(row.id)}
                            disabled={loading.delete}
                            sx={extGroupTableCheckboxSx}
                          />
                        </td>
                        <td style={getExtGroupTdStyle(rowBg, lastRowCellStyle, { width: 36 })}>
                          {realIndex}
                        </td>
                        <td style={getExtGroupTdStyle(rowBg, lastRowCellStyle)}>{row.name}</td>
                        <td style={getExtGroupTdStyle(rowBg, lastRowCellStyle, { overflow: "hidden", textOverflow: "ellipsis" })}>
                          {row.extensions?.length > 0 ? (
                            <span
                              title={row.extensions.length > EXT_GROUP_LIST_TRUNCATE_THRESHOLD
                                ? row.extensions.join(", ")
                                : undefined}
                            >
                              {formatExtGroupItemListDisplay(row.extensions)}
                            </span>
                          ) : (
                            <span style={{ color: C.mutedText }}></span>
                          )}
                        </td>
                        <td style={getExtGroupTdStyle(rowBg, lastRowCellStyle, { borderRight: "none" })}>
                          <div style={{ display: "flex", justifyContent: "center" }}>
                            <ExtensionEditIcon
                              disabled={false}
                              onClick={() => handleOpenEditModal(row)}
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
          {!isInitialLoad && groups.length > 0 && (
            <ExtGroupPagination
              page={page}
              totalPages={totalPages}
              recordCount={pagedGroups.length}
              onPageChange={(p) => setPage(Math.min(totalPages, Math.max(1, p)))}
            />
          )}
        </div>
      </div>

      <Dialog
        open={showModal}
        onClose={loading.save ? null : handleCloseModal}
        maxWidth={false}
        sx={{ "& .MuiDialog-container": { alignItems: "center", justifyContent: "center" } }}
        slotProps={{ backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.5)" } } }}
        PaperProps={{ sx: extGroupDialogPaperSx }}
      >
        <DialogTitle style={extGroupModalTitleStyle}>
          {editGroupId != null ? "Edit Extension Group" : "Add New Extension Group"}
        </DialogTitle>
        <DialogContent
          ref={modalScrollRef}
          className="app-main-scroll"
          style={{ padding: "24px", backgroundColor: "#ffffff" }}
          sx={{
            maxHeight: "calc(100vh - 180px)",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <div style={extGroupModalFormStyle}>
            <div>
              <ExtGroupSectionHeading tooltipKey="group_name" isFirst>
                Group Name
              </ExtGroupSectionHeading>
              <TextField
                fullWidth
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g. Sales, Support"
                size="small"
                variant="outlined"
                sx={extGroupModalTextFieldSx}
              />
            </div>
            <div>
              <ExtGroupSectionHeading tooltipKey="selected_extensions">
                Select Extensions
              </ExtGroupSectionHeading>
              {loading.extensions ? (
                <div style={{ ...extGroupExtensionsListStyle, display: "flex", justifyContent: "center", alignItems: "center", padding: 30, minHeight: 188 }}>
                  <CircularProgress size={20} />
                </div>
              ) : availableExtensions.length === 0 ? (
                <div style={{ ...extGroupExtensionsListStyle, padding: 20, textAlign: "center", fontSize: 12, color: C.mutedText, minHeight: 188, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  No extensions found. Create SIP accounts first.
                </div>
              ) : (
                <ExtGroupCodecDualList
                  allOptions={allExtensionOptions}
                  selected={selectedExtensions}
                  onChange={setSelectedExtensions}
                  getLabel={getExtensionLabel}
                  emptyTextAvailable="No available extensions"
                  emptyTextSelected="No selected extensions"
                />
              )}
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn
            onClick={handleSaveGroup}
            disabled={loading.save}
            variant="primary"
            style={addNewModalFooterBtnStyle}
          >
            {loading.save ? <CircularProgress size={11} style={{ color: "#fff" }} /> : null}
            {loading.save ? "Saving..." : "Save Group"}
          </Btn>
          <Btn
            onClick={handleCloseModal}
            disabled={loading.save}
            variant="cancel"
            style={extGroupModalCancelBtnStyle}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ExtensionGroupsPage;
