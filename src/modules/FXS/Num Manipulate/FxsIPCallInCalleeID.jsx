import React from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  IP_CALL_IN_CALLEEID_TABLE_COLUMNS,
  IP_CALL_IN_CALLEEID_FIELD_TOOLTIPS,
  IP_CALL_IN_CALLEEID_EMPTY_MESSAGE,
  IP_CALL_IN_CALLEEID_MODAL_TITLE_ADD,
  IP_CALL_IN_CALLEEID_MODAL_TITLE_EDIT,
} from "../../../constants/FxsIPCallInCalleeIDConstants";
import { C } from "../../../theme/pbxTokens";
import { useIPCallInCalleeIDPage } from "./hooks/useIPCallInCalleeIDPage";
import { renderIPCallInCalleeIDCellValue } from "./utils/IPCallInCalleeIDTransformers";
import {
  IPCallInCalleeIDBreadcrumb,
  IPCallInCalleeIDBtn,
  IPCallInCalleeIDTH,
  IPCallInCalleeIDModalFormFields,
  iPCallInCalleeIDCardStyle,
  iPCallInCalleeIDToolbarStyle,
  iPCallInCalleeIDPaginationStyle,
  iPCallInCalleeIDAddNewModalFooterStyle,
  iPCallInCalleeIDAddNewModalFooterBtnStyle,
  iPCallInCalleeIDAddNewModalFooterCancelBtnStyle,
  iPCallInCalleeIDAddNewModalBackdropSlotProps,
  iPCallInCalleeIDAddNewModalDialogContentSx,
  iPCallInCalleeIDCheckboxSx,
  iPCallInCalleeIDTdStyle,
  iPCallInCalleeIDDialogConfig,
} from "./components/IPCallInCalleeIDFormFields";
import {
  getIPCallInCalleeIDRowBg,
  iPCallInCalleeIDEditIconStyle,
  handleIPCallInCalleeIDEditIconHover,
  iPCallInCalleeIDFixedAlertSx,
  iPCallInCalleeIDPageWrapStyle,
  iPCallInCalleeIDPageInnerStyle,
  iPCallInCalleeIDSelectedBadgeStyle,
  iPCallInCalleeIDToolbarCancelBtnStyle,
  iPCallInCalleeIDToolbarPrimaryBtnStyle,
  iPCallInCalleeIDLoadingWrapStyle,
  iPCallInCalleeIDEmptyWrapStyle,
  iPCallInCalleeIDEmptyTitleStyle,
  iPCallInCalleeIDTableScrollStyle,
  iPCallInCalleeIDPageBadgeStyle,
  IPCALLINCALLEEID_CARD_RADIUS,
} from "./components/IPCallInCalleeIDTableHelpers";

const IPCallInCalleeID = () => {
  const vm = useIPCallInCalleeIDPage();
  const {
    isModalOpen,
    formData,
    rules,
    selected,
    page,
    loading,
    editIndex,
    toast,
    setToast,
    tableScrollRef,
    totalPages,
    pagedRules,
    getUpdatedFields,
    handleOpenModal,
    handleCloseModal,
    handleSave,
    handleInputChange,
    handlePageChange,
    handleSelectRow,
    handleCheckAll,
    handleUncheckAll,
    handleInverse,
    handleDelete,
    handleClearAll,
    handleTableScroll,
    handleRefresh,
  } = vm;

  const { dialogSx, paperSx, modalTitleStyle } = iPCallInCalleeIDDialogConfig;

  const renderCellValue = (col, item) =>
    renderIPCallInCalleeIDCellValue(col, item);

  return (
    <div style={iPCallInCalleeIDPageWrapStyle}>
      <div style={iPCallInCalleeIDPageInnerStyle}>
        {toast.msg && (
          <Alert
            severity={toast.type}
            onClose={() => setToast({ msg: "", type: "success" })}
            sx={iPCallInCalleeIDFixedAlertSx}
          >
            {toast.msg}
          </Alert>
        )}

        <IPCallInCalleeIDBreadcrumb />

        <div style={iPCallInCalleeIDCardStyle}>
          <div style={iPCallInCalleeIDToolbarStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {selected.length > 0 && (
                <span style={iPCallInCalleeIDSelectedBadgeStyle(C.accent)}>
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
              <IPCallInCalleeIDBtn
                variant="cancel"
                onClick={handleInverse}
                disabled={loading.delete || rules.length === 0}
                style={iPCallInCalleeIDToolbarCancelBtnStyle}
              >
                Inverse
              </IPCallInCalleeIDBtn>
              <IPCallInCalleeIDBtn
                variant="cancel"
                onClick={handleDelete}
                disabled={loading.delete || selected.length === 0}
                style={iPCallInCalleeIDToolbarCancelBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={12} color="inherit" />
                ) : (
                  <>
                    <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                    Delete
                  </>
                )}
              </IPCallInCalleeIDBtn>
              <IPCallInCalleeIDBtn
                variant="cancel"
                onClick={handleClearAll}
                disabled={loading.delete || rules.length === 0}
                style={iPCallInCalleeIDToolbarCancelBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={12} color="inherit" />
                ) : (
                  "Clear All"
                )}
              </IPCallInCalleeIDBtn>
              <IPCallInCalleeIDBtn
                variant="cancel"
                onClick={handleRefresh}
                disabled={loading.fetch}
                style={iPCallInCalleeIDToolbarCancelBtnStyle}
              >
                {loading.fetch ? (
                  <CircularProgress size={12} color="inherit" />
                ) : (
                  "Refresh"
                )}
              </IPCallInCalleeIDBtn>
              <IPCallInCalleeIDBtn
                variant="primary"
                onClick={() => handleOpenModal()}
                disabled={loading.fetch}
                style={iPCallInCalleeIDToolbarPrimaryBtnStyle}
              >
                + Add New
              </IPCallInCalleeIDBtn>
            </div>
          </div>

          <div style={{ position: "relative" }}>
            {loading.fetch ? (
              <div style={iPCallInCalleeIDLoadingWrapStyle}>
                <div style={{ textAlign: "center" }}>
                  <CircularProgress size={28} style={{ color: C.accent }} />
                  <div
                    style={{
                      marginTop: 12,
                      color: "#3E5475",
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    Loading number manipulations...
                  </div>
                </div>
              </div>
            ) : rules.length === 0 ? (
              <div style={iPCallInCalleeIDEmptyWrapStyle}>
                <div style={iPCallInCalleeIDEmptyTitleStyle}>
                  {IP_CALL_IN_CALLEEID_EMPTY_MESSAGE}
                </div>
                <IPCallInCalleeIDBtn
                  variant="cancel"
                  onClick={() => handleOpenModal()}
                  style={iPCallInCalleeIDToolbarCancelBtnStyle}
                >
                  + Add New Rule
                </IPCallInCalleeIDBtn>
              </div>
            ) : (
              <>
                <div
                  ref={tableScrollRef}
                  onScroll={handleTableScroll}
                  style={iPCallInCalleeIDTableScrollStyle}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "separate",
                      borderSpacing: 0,
                    }}
                  >
                    <thead>
                      <tr>
                        <IPCallInCalleeIDTH
                          style={{ width: 40, padding: 0, borderLeft: "none" }}
                        >
                          <Checkbox
                            size="small"
                            checked={
                              rules.length > 0 &&
                              selected.length === rules.length
                            }
                            indeterminate={
                              selected.length > 0 &&
                              selected.length < rules.length
                            }
                            onChange={(e) => {
                              if (e.target.checked) handleCheckAll();
                              else handleUncheckAll();
                            }}
                            sx={iPCallInCalleeIDCheckboxSx}
                          />
                        </IPCallInCalleeIDTH>
                        <IPCallInCalleeIDTH style={{ width: 50 }}>ID</IPCallInCalleeIDTH>
                        {IP_CALL_IN_CALLEEID_TABLE_COLUMNS.map((col) => (
                          <IPCallInCalleeIDTH key={col.key}>{col.label}</IPCallInCalleeIDTH>
                        ))}
                        <IPCallInCalleeIDTH style={{ width: 60, borderRight: "none" }}>
                          Modify
                        </IPCallInCalleeIDTH>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedRules.map((item, idx) => {
                        const realIdx = (page - 1) * vm.itemsPerPage + idx;
                        const isSelected = selected.includes(realIdx);
                        const isLastRow = idx === pagedRules.length - 1;
                        const rowBg = getIPCallInCalleeIDRowBg(isSelected, idx);
                        const lastRowCellStyle = isLastRow
                          ? { borderBottom: "none" }
                          : {};

                        return (
                          <tr
                            key={item.id || realIdx}
                            style={{
                              background: rowBg,
                              borderBottom: isLastRow
                                ? "none"
                                : `1px solid ${C.cardBorder}`,
                              transition: "background-color 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected)
                                e.currentTarget.style.background = "#f1f5f9";
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected)
                                e.currentTarget.style.background = rowBg;
                            }}
                          >
                            <td
                              style={{
                                ...iPCallInCalleeIDTdStyle,
                                background: rowBg,
                                borderLeft: "none",
                                ...lastRowCellStyle,
                                ...(isLastRow
                                  ? { borderBottomLeftRadius: IPCALLINCALLEEID_CARD_RADIUS }
                                  : {}),
                              }}
                            >
                              <Checkbox
                                size="small"
                                checked={isSelected}
                                onChange={() => handleSelectRow(idx)}
                                sx={iPCallInCalleeIDCheckboxSx}
                              />
                            </td>
                            <td
                              style={{
                                ...iPCallInCalleeIDTdStyle,
                                background: rowBg,
                                ...lastRowCellStyle,
                              }}
                            >
                              {realIdx + 1}
                            </td>
                            {IP_CALL_IN_CALLEEID_TABLE_COLUMNS.map((col) => (
                              <td
                                key={col.key}
                                style={{
                                  ...iPCallInCalleeIDTdStyle,
                                  background: rowBg,
                                  ...lastRowCellStyle,
                                }}
                              >
                                {renderCellValue(col, item)}
                              </td>
                            ))}
                            <td
                              style={{
                                ...iPCallInCalleeIDTdStyle,
                                background: rowBg,
                                borderRight: "none",
                                ...lastRowCellStyle,
                                ...(isLastRow
                                  ? { borderBottomRightRadius: IPCALLINCALLEEID_CARD_RADIUS }
                                  : {}),
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
                                  style={iPCallInCalleeIDEditIconStyle}
                                  onClick={() => handleOpenModal(item, realIdx)}
                                  onMouseEnter={(e) =>
                                    handleIPCallInCalleeIDEditIconHover(e, true)
                                  }
                                  onMouseLeave={(e) =>
                                    handleIPCallInCalleeIDEditIconHover(e, false)
                                  }
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div style={iPCallInCalleeIDPaginationStyle}>
                  <span style={{ fontSize: 11, color: C.mutedText }}>
                    Showing {pagedRules.length} record
                    {pagedRules.length !== 1 ? "s" : ""} on page {page}
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <IPCallInCalleeIDBtn
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page <= 1}
                      variant="outline"
                      style={{ borderRadius: 4 }}
                    >
                      ← Prev
                    </IPCallInCalleeIDBtn>
                    <span style={iPCallInCalleeIDPageBadgeStyle}>
                      Page {page} of {totalPages}
                    </span>
                    <IPCallInCalleeIDBtn
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= totalPages}
                      variant="outline"
                      style={{ borderRadius: 4 }}
                    >
                      Next →
                    </IPCallInCalleeIDBtn>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <Dialog
          open={isModalOpen}
          onClose={handleCloseModal}
          maxWidth={false}
          slotProps={iPCallInCalleeIDAddNewModalBackdropSlotProps}
          sx={dialogSx}
          PaperProps={{ sx: paperSx }}
          disableRestoreFocus
          disableEnforceFocus
        >
          <DialogTitle style={modalTitleStyle}>
            {editIndex !== null
              ? IP_CALL_IN_CALLEEID_MODAL_TITLE_EDIT
              : IP_CALL_IN_CALLEEID_MODAL_TITLE_ADD}
          </DialogTitle>
          <DialogContent
            style={{
              padding: "24px",
              backgroundColor: "#ffffff",
              flex: "1 1 auto",
            }}
            sx={iPCallInCalleeIDAddNewModalDialogContentSx}
          >
            <IPCallInCalleeIDModalFormFields
              fields={getUpdatedFields()}
              fieldTooltips={IP_CALL_IN_CALLEEID_FIELD_TOOLTIPS}
              formData={formData}
              handleInputChange={handleInputChange}
            />
          </DialogContent>
          <DialogActions sx={{ p: 0, m: 0 }} style={iPCallInCalleeIDAddNewModalFooterStyle}>
            <IPCallInCalleeIDBtn
              variant="primary"
              onClick={handleSave}
              disabled={loading.save}
              style={iPCallInCalleeIDAddNewModalFooterBtnStyle}
            >
              {loading.save
                ? "Saving..."
                : editIndex !== null
                  ? "Update"
                  : "Save"}
            </IPCallInCalleeIDBtn>
            <IPCallInCalleeIDBtn
              variant="cancel"
              onClick={handleCloseModal}
              disabled={loading.save}
              style={iPCallInCalleeIDAddNewModalFooterCancelBtnStyle}
            >
              Close
            </IPCallInCalleeIDBtn>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default IPCallInCalleeID;
