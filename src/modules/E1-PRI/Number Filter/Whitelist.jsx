import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  FormControl,
  Select as MuiSelect,
  MenuItem,
  Checkbox,
} from "@mui/material";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  NUMBER_FILTER_WHITELIST_FIELD_TOOLTIPS,
  NUMBER_FILTER_WHITELIST_CALLER_PANEL_TITLE,
  NUMBER_FILTER_WHITELIST_CALLEE_PANEL_TITLE,
  NUMBER_FILTER_WHITELIST_MODAL_TITLE_CALLER,
  NUMBER_FILTER_WHITELIST_MODAL_TITLE_CALLEE,
  NUMBER_FILTER_WHITELIST_ADD_NEW_LABEL,
  NUMBER_FILTER_WHITELIST_DELETE_LABEL,
  NUMBER_FILTER_WHITELIST_CLEAR_ALL_LABEL,
  NUMBER_FILTER_WHITELIST_SAVE_LABEL,
  NUMBER_FILTER_WHITELIST_CLOSE_LABEL,
  NUMBER_FILTER_WHITELIST_LOADING_MESSAGE,
  NUMBER_FILTER_WHITELIST_NOTE,
} from "../../../constants/NumberFilterWhitelistConstants";
import { useWhitelistPage } from "./hooks/useWhitelistPage";
import {
  WhitelistBreadcrumb,
  WhitelistBtn,
  WhitelistTH,
  WhitelistFieldRow,
  whitelistFormPanelStyle,
  whitelistInputStyle,
  whitelistInputInteraction,
  whitelistModalSelectSx,
  whitelistGroupSelectMenuProps,
  whitelistAddNewModalFooterStyle,
  whitelistAddNewModalFooterBtnStyle,
  whitelistAddNewModalFooterCancelBtnStyle,
  whitelistCheckboxSx,
  whitelistTdStyle,
  whitelistC as C,
  whitelistFixedAlertSx,
  whitelistDialogConfig,
} from "./components/WhitelistFormFields";
import {
  getWhitelistRowBg,
  getWhitelistEditIconStyle,
  handleWhitelistEditIconHover,
  whitelistPageWrapStyle,
  whitelistPageInnerStyle,
  whitelistPanelCardStyle,
  whitelistPanelToolbarStyle,
  whitelistPanelSectionTitleStyle,
  whitelistPanelFooterStyle,
  whitelistPanelNoteStyle,
  whitelistHeaderCheckThStyle,
  whitelistSelectedBadgeStyle,
  whitelistLoadingWrapStyle,
  whitelistTableScrollStyle,
} from "./components/WhitelistTableHelpers";

const Whitelist = () => {
  const vm = useWhitelistPage();
  const {
    callerRows,
    calleeRows,
    showModal,
    setShowModal,
    modalType,
    modalData,
    setModalData,
    isEditMode,
    callerChecked,
    calleeChecked,
    isLoading,
    isInitialLoading,
    isDeleting,
    toast,
    setToast,
    handleAddNew,
    handleEdit,
    handleGroupNoChange,
    handleSave,
    handleCallerCheck,
    handleCalleeCheck,
    handleCallerCheckAll,
    handleCalleeCheckAll,
    handleCallerDelete,
    handleCallerClear,
    handleCalleeDelete,
    handleCalleeClear,
  } = vm;

  const { dialogSx, paperSx, modalTitleStyle } = whitelistDialogConfig;

  const renderTablePanel = ({
    title,
    rows,
    checkedItems,
    onCheck,
    onCheckAll,
    onDelete,
    onClear,
    onAddNew,
    onEdit,
    idKey,
  }) => {
    const allChecked = rows.length > 0 && checkedItems.length === rows.length;
    const someChecked = checkedItems.length > 0 && !allChecked;

    return (
      <div style={{ flex: 1, minWidth: 280 }}>
        <div style={whitelistPanelCardStyle}>
          <div style={whitelistPanelToolbarStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={whitelistPanelSectionTitleStyle}>{title}</span>
              {checkedItems.length > 0 && (
                <span style={whitelistSelectedBadgeStyle}>
                  {checkedItems.length} selected
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
              <WhitelistBtn
                variant="cancel"
                onClick={onDelete}
                disabled={checkedItems.length === 0 || isDeleting}
                style={{
                  height: 30,
                  padding: "6px 14px",
                  fontSize: 12,
                  borderRadius: 4,
                }}
              >
                {isDeleting ? (
                  <CircularProgress size={12} color="inherit" />
                ) : (
                  <>
                    <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                    {NUMBER_FILTER_WHITELIST_DELETE_LABEL}
                  </>
                )}
              </WhitelistBtn>
              <WhitelistBtn
                variant="cancel"
                onClick={onClear}
                disabled={rows.length === 0 || isDeleting}
                style={{
                  height: 30,
                  padding: "6px 14px",
                  fontSize: 12,
                  borderRadius: 4,
                }}
              >
                {NUMBER_FILTER_WHITELIST_CLEAR_ALL_LABEL}
              </WhitelistBtn>
              <WhitelistBtn
                variant="primary"
                onClick={onAddNew}
                disabled={isDeleting}
                style={{
                  height: 30,
                  padding: "6px 14px",
                  fontSize: 12,
                  borderRadius: 4,
                }}
              >
                {NUMBER_FILTER_WHITELIST_ADD_NEW_LABEL}
              </WhitelistBtn>
            </div>
          </div>

          <div className="notepad-scrollbar" style={whitelistTableScrollStyle}>
            <table
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: 0,
                minWidth: 460,
              }}
            >
              <thead>
                <tr>
                  <WhitelistTH
                    style={{
                      width: 56,
                      borderLeft: "none",
                      ...whitelistHeaderCheckThStyle,
                    }}
                  >
                    <Checkbox
                      checked={allChecked}
                      indeterminate={someChecked}
                      onChange={() => onCheckAll(!allChecked)}
                      size="small"
                      sx={whitelistCheckboxSx}
                      disabled={rows.length === 0}
                    />
                  </WhitelistTH>
                  <WhitelistTH>Group No.</WhitelistTH>
                  <WhitelistTH>
                    {idKey === "callerId" ? "CallerID" : "CalleeID"}
                  </WhitelistTH>
                  <WhitelistTH style={{ width: 80, borderRight: "none" }}>
                    Modify
                  </WhitelistTH>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        textAlign: "center",
                        padding: "36px 0",
                        color: C.mutedText,
                        fontSize: 13,
                        fontWeight: 600,
                        borderBottom: "none",
                      }}
                    >
                      No entries found.
                    </td>
                  </tr>
                ) : (
                  rows.map((row, idx) => {
                    const isChecked = checkedItems.includes(idx);
                    const isLastRow = idx === rows.length - 1;
                    const rowBg = getWhitelistRowBg(isChecked, idx);
                    const lastRowCellStyle = isLastRow
                      ? { borderBottom: "none" }
                      : {};
                    return (
                      <tr
                        key={row.id || idx}
                        style={{
                          background: rowBg,
                          transition: "background 0.1s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isChecked)
                            e.currentTarget.style.background = "#f1f5f9";
                        }}
                        onMouseLeave={(e) => {
                          if (!isChecked)
                            e.currentTarget.style.background = rowBg;
                        }}
                      >
                        <td
                          style={{
                            ...whitelistTdStyle,
                            background: rowBg,
                            borderLeft: "none",
                            ...lastRowCellStyle,
                          }}
                        >
                          <Checkbox
                            checked={isChecked}
                            onChange={() => onCheck(idx)}
                            size="small"
                            sx={whitelistCheckboxSx}
                          />
                        </td>
                        <td
                          style={{
                            ...whitelistTdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.groupNo}
                        </td>
                        <td
                          style={{
                            ...whitelistTdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {row[idKey]}
                        </td>
                        <td
                          style={{
                            ...whitelistTdStyle,
                            background: rowBg,
                            borderRight: "none",
                            ...lastRowCellStyle,
                          }}
                        >
                          <div
                            style={{ display: "flex", justifyContent: "center" }}
                          >
                            <EditDocumentIcon
                              titleAccess="Edit"
                              style={getWhitelistEditIconStyle(isDeleting)}
                              onClick={() => {
                                if (!isDeleting) onEdit(row);
                              }}
                              onMouseEnter={(e) =>
                                handleWhitelistEditIconHover(e, true, isDeleting)
                              }
                              onMouseLeave={(e) =>
                                handleWhitelistEditIconHover(
                                  e,
                                  false,
                                  isDeleting,
                                )
                              }
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {rows.length > 0 && (
            <div style={whitelistPanelFooterStyle}>
              <span style={{ fontSize: 11, color: C.mutedText }}>
                Showing {rows.length} record
                {rows.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={whitelistPageWrapStyle}>
      <div style={whitelistPageInnerStyle}>
        {toast.msg && (
          <Alert
            severity={toast.type}
            onClose={() => setToast({ msg: "", type: "success" })}
            sx={whitelistFixedAlertSx}
          >
            {toast.msg}
          </Alert>
        )}

        <WhitelistBreadcrumb />

        {isInitialLoading ? (
          <div style={whitelistLoadingWrapStyle}>
            <CircularProgress size={32} style={{ color: C.accent }} />
            <span style={{ fontSize: 13, color: C.mutedText }}>
              {NUMBER_FILTER_WHITELIST_LOADING_MESSAGE}
            </span>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                gap: 20,
                flexWrap: "wrap",
                width: "100%",
                alignItems: "flex-start",
                marginBottom: 16,
              }}
            >
              {renderTablePanel({
                title: NUMBER_FILTER_WHITELIST_CALLER_PANEL_TITLE,
                rows: callerRows,
                checkedItems: callerChecked,
                onCheck: handleCallerCheck,
                onCheckAll: handleCallerCheckAll,
                onDelete: handleCallerDelete,
                onClear: handleCallerClear,
                onAddNew: () => handleAddNew("caller"),
                onEdit: (row) => handleEdit("caller", row),
                idKey: "callerId",
              })}
              {renderTablePanel({
                title: NUMBER_FILTER_WHITELIST_CALLEE_PANEL_TITLE,
                rows: calleeRows,
                checkedItems: calleeChecked,
                onCheck: handleCalleeCheck,
                onCheckAll: handleCalleeCheckAll,
                onDelete: handleCalleeDelete,
                onClear: handleCalleeClear,
                onAddNew: () => handleAddNew("callee"),
                onEdit: (row) => handleEdit("callee", row),
                idKey: "calleeId",
              })}
            </div>

            <p style={whitelistPanelNoteStyle}>{NUMBER_FILTER_WHITELIST_NOTE}</p>
          </>
        )}

        <Dialog
          open={showModal}
          onClose={() => setShowModal(false)}
          maxWidth={false}
          sx={dialogSx}
          PaperProps={{ sx: paperSx }}
          disableRestoreFocus
          disableEnforceFocus
        >
          <DialogTitle style={modalTitleStyle}>
            {modalType === "caller"
              ? NUMBER_FILTER_WHITELIST_MODAL_TITLE_CALLER
              : NUMBER_FILTER_WHITELIST_MODAL_TITLE_CALLEE}
          </DialogTitle>

          <DialogContent
            className="notepad-scrollbar"
            style={{
              padding: "24px",
              backgroundColor: "#ffffff",
              overflowY: "auto",
              flex: "1 1 auto",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={whitelistFormPanelStyle}>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  <WhitelistFieldRow
                    label="Group No.:"
                    tooltipKey="groupNo"
                    tooltips={NUMBER_FILTER_WHITELIST_FIELD_TOOLTIPS}
                  >
                    <FormControl
                      variant="outlined"
                      sx={{ width: "100%", margin: 0 }}
                    >
                      <MuiSelect
                        value={modalData.groupNo}
                        onChange={(e) => handleGroupNoChange(e.target.value)}
                        sx={whitelistModalSelectSx}
                        MenuProps={whitelistGroupSelectMenuProps}
                      >
                        {[...Array(200).keys()].map((i) => (
                          <MenuItem
                            key={i}
                            value={String(i)}
                            sx={{ fontSize: 13 }}
                          >
                            {i}
                          </MenuItem>
                        ))}
                      </MuiSelect>
                    </FormControl>
                  </WhitelistFieldRow>

                  <WhitelistFieldRow
                    label={
                      modalType === "caller" ? "CallerID:" : "CalleeID:"
                    }
                    tooltipKey={
                      modalType === "caller" ? "callerId" : "calleeId"
                    }
                    tooltips={NUMBER_FILTER_WHITELIST_FIELD_TOOLTIPS}
                  >
                    <input
                      type="text"
                      value={modalData.idValue}
                      onChange={(e) =>
                        setModalData({
                          ...modalData,
                          idValue: e.target.value,
                        })
                      }
                      disabled={isEditMode}
                      style={{
                        ...whitelistInputStyle,
                        ...(isEditMode
                          ? {
                              backgroundColor: "#f1f5f9",
                              cursor: "not-allowed",
                            }
                          : {}),
                      }}
                      {...whitelistInputInteraction}
                    />
                  </WhitelistFieldRow>
                </div>
              </div>
            </div>
          </DialogContent>

          <DialogActions
            sx={{ p: 0, m: 0 }}
            style={whitelistAddNewModalFooterStyle}
          >
            <WhitelistBtn
              onClick={handleSave}
              variant="primary"
              style={whitelistAddNewModalFooterBtnStyle}
              disabled={isLoading}
            >
              {isLoading ? (
                <CircularProgress size={20} style={{ color: "#fff" }} />
              ) : (
                NUMBER_FILTER_WHITELIST_SAVE_LABEL
              )}
            </WhitelistBtn>
            <WhitelistBtn
              onClick={() => setShowModal(false)}
              variant="cancel"
              style={whitelistAddNewModalFooterCancelBtnStyle}
              disabled={isLoading}
            >
              {NUMBER_FILTER_WHITELIST_CLOSE_LABEL}
            </WhitelistBtn>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default Whitelist;
