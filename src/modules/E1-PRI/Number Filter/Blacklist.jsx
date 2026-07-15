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
  NUMBER_FILTER_BLACKLIST_FIELD_TOOLTIPS,
  NUMBER_FILTER_BLACKLIST_CALLER_PANEL_TITLE,
  NUMBER_FILTER_BLACKLIST_CALLEE_PANEL_TITLE,
  NUMBER_FILTER_BLACKLIST_MODAL_TITLE_CALLER,
  NUMBER_FILTER_BLACKLIST_MODAL_TITLE_CALLEE,
  NUMBER_FILTER_BLACKLIST_ADD_NEW_LABEL,
  NUMBER_FILTER_BLACKLIST_DELETE_LABEL,
  NUMBER_FILTER_BLACKLIST_CLEAR_ALL_LABEL,
  NUMBER_FILTER_BLACKLIST_SAVE_LABEL,
  NUMBER_FILTER_BLACKLIST_CLOSE_LABEL,
  NUMBER_FILTER_BLACKLIST_LOADING_MESSAGE,
  NUMBER_FILTER_BLACKLIST_NOTE,
} from "../../../constants/NumberFilterBlacklistConstants";
import { useBlacklistPage } from "./hooks/useBlacklistPage";
import {
  BlacklistBreadcrumb,
  BlacklistBtn,
  BlacklistTH,
  BlacklistFieldRow,
  blacklistFormPanelStyle,
  blacklistInputStyle,
  blacklistInputInteraction,
  blacklistModalSelectSx,
  blacklistGroupSelectMenuProps,
  blacklistAddNewModalFooterStyle,
  blacklistAddNewModalFooterBtnStyle,
  blacklistAddNewModalFooterCancelBtnStyle,
  blacklistCheckboxSx,
  blacklistTdStyle,
  blacklistC as C,
  blacklistFixedAlertSx,
  blacklistDialogConfig,
} from "./components/BlacklistFormFields";
import {
  getBlacklistRowBg,
  getBlacklistEditIconStyle,
  handleBlacklistEditIconHover,
  blacklistPageWrapStyle,
  blacklistPageInnerStyle,
  blacklistPanelCardStyle,
  blacklistPanelToolbarStyle,
  blacklistPanelSectionTitleStyle,
  blacklistPanelFooterStyle,
  blacklistPanelNoteStyle,
  blacklistHeaderCheckThStyle,
  blacklistSelectedBadgeStyle,
  blacklistLoadingWrapStyle,
  blacklistTableScrollStyle,
} from "./components/BlacklistTableHelpers";

const Blacklist = () => {
  const vm = useBlacklistPage();
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

  const { dialogSx, paperSx, modalTitleStyle } = blacklistDialogConfig;

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
        <div style={blacklistPanelCardStyle}>
          <div style={blacklistPanelToolbarStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={blacklistPanelSectionTitleStyle}>{title}</span>
              {checkedItems.length > 0 && (
                <span style={blacklistSelectedBadgeStyle}>
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
              <BlacklistBtn
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
                    {NUMBER_FILTER_BLACKLIST_DELETE_LABEL}
                  </>
                )}
              </BlacklistBtn>
              <BlacklistBtn
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
                {NUMBER_FILTER_BLACKLIST_CLEAR_ALL_LABEL}
              </BlacklistBtn>
              <BlacklistBtn
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
                {NUMBER_FILTER_BLACKLIST_ADD_NEW_LABEL}
              </BlacklistBtn>
            </div>
          </div>

          <div className="notepad-scrollbar" style={blacklistTableScrollStyle}>
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
                  <BlacklistTH
                    style={{
                      width: 56,
                      borderLeft: "none",
                      ...blacklistHeaderCheckThStyle,
                    }}
                  >
                    <Checkbox
                      checked={allChecked}
                      indeterminate={someChecked}
                      onChange={() => onCheckAll(!allChecked)}
                      size="small"
                      sx={blacklistCheckboxSx}
                      disabled={rows.length === 0}
                    />
                  </BlacklistTH>
                  <BlacklistTH>Group No.</BlacklistTH>
                  <BlacklistTH>
                    {idKey === "callerId" ? "CallerID" : "CalleeID"}
                  </BlacklistTH>
                  <BlacklistTH style={{ width: 80, borderRight: "none" }}>
                    Modify
                  </BlacklistTH>
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
                    const rowBg = getBlacklistRowBg(isChecked, idx);
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
                            ...blacklistTdStyle,
                            background: rowBg,
                            borderLeft: "none",
                            ...lastRowCellStyle,
                          }}
                        >
                          <Checkbox
                            checked={isChecked}
                            onChange={() => onCheck(idx)}
                            size="small"
                            sx={blacklistCheckboxSx}
                          />
                        </td>
                        <td
                          style={{
                            ...blacklistTdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.groupNo}
                        </td>
                        <td
                          style={{
                            ...blacklistTdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {row[idKey]}
                        </td>
                        <td
                          style={{
                            ...blacklistTdStyle,
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
                              style={getBlacklistEditIconStyle(isDeleting)}
                              onClick={() => {
                                if (!isDeleting) onEdit(row);
                              }}
                              onMouseEnter={(e) =>
                                handleBlacklistEditIconHover(
                                  e,
                                  true,
                                  isDeleting,
                                )
                              }
                              onMouseLeave={(e) =>
                                handleBlacklistEditIconHover(
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
            <div style={blacklistPanelFooterStyle}>
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
    <div style={blacklistPageWrapStyle}>
      <div style={blacklistPageInnerStyle}>
        {toast.msg && (
          <Alert
            severity={toast.type}
            onClose={() => setToast({ msg: "", type: "success" })}
            sx={blacklistFixedAlertSx}
          >
            {toast.msg}
          </Alert>
        )}

        <BlacklistBreadcrumb />

        {isInitialLoading ? (
          <div style={blacklistLoadingWrapStyle}>
            <CircularProgress size={32} style={{ color: C.accent }} />
            <span style={{ fontSize: 13, color: C.mutedText }}>
              {NUMBER_FILTER_BLACKLIST_LOADING_MESSAGE}
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
                title: NUMBER_FILTER_BLACKLIST_CALLER_PANEL_TITLE,
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
                title: NUMBER_FILTER_BLACKLIST_CALLEE_PANEL_TITLE,
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

            <p style={blacklistPanelNoteStyle}>{NUMBER_FILTER_BLACKLIST_NOTE}</p>
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
          <DialogTitle
            style={{
              ...modalTitleStyle,
              padding: "14px 24px",
              letterSpacing: "-0.01em",
            }}
          >
            {modalType === "caller"
              ? NUMBER_FILTER_BLACKLIST_MODAL_TITLE_CALLER
              : NUMBER_FILTER_BLACKLIST_MODAL_TITLE_CALLEE}
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
            <div style={{ ...blacklistFormPanelStyle, gap: 16 }}>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                <BlacklistFieldRow
                  label="Group No.:"
                  tooltipKey="groupNo"
                  tooltips={NUMBER_FILTER_BLACKLIST_FIELD_TOOLTIPS}
                >
                  <FormControl
                    variant="outlined"
                    sx={{ width: "100%", margin: 0 }}
                  >
                    <MuiSelect
                      value={modalData.groupNo}
                      onChange={(e) => handleGroupNoChange(e.target.value)}
                      sx={blacklistModalSelectSx}
                      MenuProps={blacklistGroupSelectMenuProps}
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
                </BlacklistFieldRow>

                <BlacklistFieldRow
                  label={modalType === "caller" ? "CallerID:" : "CalleeID:"}
                  tooltipKey={
                    modalType === "caller" ? "callerId" : "calleeId"
                  }
                  tooltips={NUMBER_FILTER_BLACKLIST_FIELD_TOOLTIPS}
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
                      ...blacklistInputStyle,
                      ...(isEditMode
                        ? {
                            backgroundColor: "#f3f4f6",
                            cursor: "not-allowed",
                          }
                        : {}),
                    }}
                    {...blacklistInputInteraction}
                  />
                </BlacklistFieldRow>
              </div>
            </div>
          </DialogContent>

          <DialogActions
            sx={{ p: 0, m: 0 }}
            style={blacklistAddNewModalFooterStyle}
          >
            <BlacklistBtn
              onClick={handleSave}
              variant="primary"
              style={blacklistAddNewModalFooterBtnStyle}
              disabled={isLoading}
            >
              {isLoading ? (
                <CircularProgress size={16} style={{ color: "#fff" }} />
              ) : (
                NUMBER_FILTER_BLACKLIST_SAVE_LABEL
              )}
            </BlacklistBtn>
            <BlacklistBtn
              onClick={() => setShowModal(false)}
              variant="cancel"
              style={blacklistAddNewModalFooterCancelBtnStyle}
              disabled={isLoading}
            >
              {NUMBER_FILTER_BLACKLIST_CLOSE_LABEL}
            </BlacklistBtn>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default Blacklist;
