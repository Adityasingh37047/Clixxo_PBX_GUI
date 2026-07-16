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
  IP_CALL_IN_CALLERID_TABLE_COLUMNS,
  IP_CALL_IN_CALLERID_FIELD_TOOLTIPS,
  IP_CALL_IN_CALLERID_EMPTY_MESSAGE,
  IP_CALL_IN_CALLERID_MODAL_TITLE_ADD,
  IP_CALL_IN_CALLERID_MODAL_TITLE_EDIT,
} from "../../../constants/FxsIPCallInCallerIDConstants";
import { C } from "../../../theme/pbxTokens";
import { useIPCallInCallerIDPage } from "./hooks/useIPCallInCallerIDPage";
import { renderIPCallInCallerIDCellValue } from "./utils/IPCallInCallerIDTransformers";
import {
  IPCallInCallerIDBreadcrumb,
  IPCallInCallerIDBtn,
  IPCallInCallerIDTH,
  IPCallInCallerIDModalFormFields,
  iPCallInCallerIDCardStyle,
  iPCallInCallerIDToolbarStyle,
  iPCallInCallerIDPaginationStyle,
  iPCallInCallerIDAddNewModalFooterStyle,
  iPCallInCallerIDAddNewModalFooterBtnStyle,
  iPCallInCallerIDAddNewModalFooterCancelBtnStyle,
  iPCallInCallerIDAddNewModalBackdropSlotProps,
  iPCallInCallerIDAddNewModalDialogContentSx,
  iPCallInCallerIDCheckboxSx,
  iPCallInCallerIDTdStyle,
  iPCallInCallerIDDialogConfig,
} from "./components/IPCallInCallerIDFormFields";
import {
  getIPCallInCallerIDRowBg,
  iPCallInCallerIDEditIconStyle,
  handleIPCallInCallerIDEditIconHover,
  iPCallInCallerIDFixedAlertSx,
  iPCallInCallerIDPageWrapStyle,
  iPCallInCallerIDPageInnerStyle,
  iPCallInCallerIDSelectedBadgeStyle,
  iPCallInCallerIDToolbarCancelBtnStyle,
  iPCallInCallerIDToolbarPrimaryBtnStyle,
  iPCallInCallerIDToolbarBtnStyle,
  iPCallInCallerIDLoadingWrapStyle,
  iPCallInCallerIDEmptyWrapStyle,
  iPCallInCallerIDEmptyTitleStyle,
  iPCallInCallerIDTableScrollStyle,
  IPCALLINCALLERID_CARD_RADIUS,
} from "./components/IPCallInCallerIDTableHelpers";

const IPCallInCallerID = () => {
  const vm = useIPCallInCallerIDPage();
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

  const { dialogSx, paperSx, modalTitleStyle } = iPCallInCallerIDDialogConfig;

  const renderCellValue = (col, item) =>
    renderIPCallInCallerIDCellValue(col, item);

  return (
    <div style={iPCallInCallerIDPageWrapStyle}>
      <div style={iPCallInCallerIDPageInnerStyle}>
        {toast.msg && (
          <Alert
            severity={toast.type}
            onClose={() => setToast({ msg: "", type: "success" })}
            sx={iPCallInCallerIDFixedAlertSx}
          >
            {toast.msg}
          </Alert>
        )}

        <IPCallInCallerIDBreadcrumb />

        <div style={iPCallInCallerIDCardStyle}>
          <div style={iPCallInCallerIDToolbarStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {selected.length > 0 && (
                <span style={iPCallInCallerIDSelectedBadgeStyle(C.accent)}>
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
              <IPCallInCallerIDBtn
                variant="cancel"
                onClick={handleInverse}
                disabled={loading.delete || rules.length === 0}
                style={iPCallInCallerIDToolbarCancelBtnStyle}
              >
                Inverse
              </IPCallInCallerIDBtn>
              <IPCallInCallerIDBtn
                variant="cancel"
                onClick={handleDelete}
                disabled={loading.delete || selected.length === 0}
                style={iPCallInCallerIDToolbarCancelBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={12} color="inherit" />
                ) : (
                  <>
                    <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                    Delete
                  </>
                )}
              </IPCallInCallerIDBtn>
              <IPCallInCallerIDBtn
                variant="cancel"
                onClick={handleClearAll}
                disabled={loading.delete || rules.length === 0}
                style={iPCallInCallerIDToolbarCancelBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={12} color="inherit" />
                ) : (
                  "Clear All"
                )}
              </IPCallInCallerIDBtn>
              <IPCallInCallerIDBtn
                variant="cancel"
                onClick={handleRefresh}
                disabled={loading.fetch}
                style={iPCallInCallerIDToolbarCancelBtnStyle}
              >
                {loading.fetch ? (
                  <CircularProgress size={12} color="inherit" />
                ) : (
                  "Refresh"
                )}
              </IPCallInCallerIDBtn>
              <IPCallInCallerIDBtn
                variant="primary"
                onClick={() => handleOpenModal()}
                disabled={loading.fetch}
                style={iPCallInCallerIDToolbarPrimaryBtnStyle}
              >
                + Add New
              </IPCallInCallerIDBtn>
            </div>
          </div>

          <div style={{ position: "relative" }}>
            {loading.fetch ? (
              <div style={iPCallInCallerIDLoadingWrapStyle}>
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
              <div style={iPCallInCallerIDEmptyWrapStyle}>
                <div style={iPCallInCallerIDEmptyTitleStyle}>
                  {IP_CALL_IN_CALLERID_EMPTY_MESSAGE}
                </div>
                <IPCallInCallerIDBtn
                  variant="cancel"
                  onClick={() => handleOpenModal()}
                  style={iPCallInCallerIDToolbarCancelBtnStyle}
                >
                  + Add New Rule
                </IPCallInCallerIDBtn>
              </div>
            ) : (
              <>
                <div
                  ref={tableScrollRef}
                  onScroll={handleTableScroll}
                  style={iPCallInCallerIDTableScrollStyle}
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
                        <IPCallInCallerIDTH
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
                            sx={iPCallInCallerIDCheckboxSx}
                          />
                        </IPCallInCallerIDTH>
                        <IPCallInCallerIDTH style={{ width: 50 }}>ID</IPCallInCallerIDTH>
                        {IP_CALL_IN_CALLERID_TABLE_COLUMNS.map((col) => (
                          <IPCallInCallerIDTH key={col.key}>{col.label}</IPCallInCallerIDTH>
                        ))}
                        <IPCallInCallerIDTH style={{ width: 60, borderRight: "none" }}>
                          Modify
                        </IPCallInCallerIDTH>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedRules.map((item, idx) => {
                        const realIdx = (page - 1) * vm.itemsPerPage + idx;
                        const isSelected = selected.includes(realIdx);
                        const isLastRow = idx === pagedRules.length - 1;
                        const rowBg = getIPCallInCallerIDRowBg(isSelected, idx);
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
                                ...iPCallInCallerIDTdStyle,
                                background: rowBg,
                                borderLeft: "none",
                                ...lastRowCellStyle,
                                ...(isLastRow
                                  ? { borderBottomLeftRadius: IPCALLINCALLERID_CARD_RADIUS }
                                  : {}),
                              }}
                            >
                              <Checkbox
                                size="small"
                                checked={isSelected}
                                onChange={() => handleSelectRow(idx)}
                                sx={iPCallInCallerIDCheckboxSx}
                              />
                            </td>
                            <td
                              style={{
                                ...iPCallInCallerIDTdStyle,
                                background: rowBg,
                                ...lastRowCellStyle,
                              }}
                            >
                              {realIdx + 1}
                            </td>
                            {IP_CALL_IN_CALLERID_TABLE_COLUMNS.map((col) => (
                              <td
                                key={col.key}
                                style={{
                                  ...iPCallInCallerIDTdStyle,
                                  background: rowBg,
                                  ...lastRowCellStyle,
                                }}
                              >
                                {renderCellValue(col, item)}
                              </td>
                            ))}
                            <td
                              style={{
                                ...iPCallInCallerIDTdStyle,
                                background: rowBg,
                                borderRight: "none",
                                ...lastRowCellStyle,
                                ...(isLastRow
                                  ? { borderBottomRightRadius: IPCALLINCALLERID_CARD_RADIUS }
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
                                  style={iPCallInCallerIDEditIconStyle}
                                  onClick={() => handleOpenModal(item, realIdx)}
                                  onMouseEnter={(e) =>
                                    handleIPCallInCallerIDEditIconHover(e, true)
                                  }
                                  onMouseLeave={(e) =>
                                    handleIPCallInCallerIDEditIconHover(e, false)
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

                <div style={iPCallInCallerIDPaginationStyle}>
                  <span style={{ fontSize: 11, color: C.mutedText }}>
                    Showing {pagedRules.length} record
                    {pagedRules.length !== 1 ? "s" : ""} on page {page}
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <IPCallInCallerIDBtn
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page <= 1}
                      variant="outline"
                      style={{ borderRadius: 4 }}
                    >
                      ← Prev
                    </IPCallInCallerIDBtn>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: C.accent,
                        background: "#e0f2fe",
                        padding: "5px 14px",
                        borderRadius: 4,
                        border: `1px solid ${C.cardBorder}`,
                      }}
                    >
                      Page {page} of {totalPages}
                    </span>
                    <IPCallInCallerIDBtn
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= totalPages}
                      variant="outline"
                      style={{ borderRadius: 4 }}
                    >
                      Next →
                    </IPCallInCallerIDBtn>
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
          slotProps={iPCallInCallerIDAddNewModalBackdropSlotProps}
          sx={dialogSx}
          PaperProps={{ sx: paperSx }}
          disableRestoreFocus
          disableEnforceFocus
        >
          <DialogTitle style={modalTitleStyle}>
            {editIndex !== null
              ? IP_CALL_IN_CALLERID_MODAL_TITLE_EDIT
              : IP_CALL_IN_CALLERID_MODAL_TITLE_ADD}
          </DialogTitle>
          <DialogContent
            style={{
              padding: "24px",
              backgroundColor: "#ffffff",
              flex: "1 1 auto",
            }}
            sx={iPCallInCallerIDAddNewModalDialogContentSx}
          >
            <IPCallInCallerIDModalFormFields
              fields={getUpdatedFields()}
              fieldTooltips={IP_CALL_IN_CALLERID_FIELD_TOOLTIPS}
              formData={formData}
              handleInputChange={handleInputChange}
            />
          </DialogContent>
          <DialogActions sx={{ p: 0, m: 0 }} style={iPCallInCallerIDAddNewModalFooterStyle}>
            <IPCallInCallerIDBtn
              variant="primary"
              onClick={handleSave}
              disabled={loading.save}
              style={iPCallInCallerIDAddNewModalFooterBtnStyle}
            >
              {loading.save
                ? "Saving..."
                : editIndex !== null
                  ? "Update"
                  : "Save"}
            </IPCallInCallerIDBtn>
            <IPCallInCallerIDBtn
              variant="cancel"
              onClick={handleCloseModal}
              disabled={loading.save}
              style={iPCallInCallerIDAddNewModalFooterCancelBtnStyle}
            >
              Close
            </IPCallInCallerIDBtn>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default IPCallInCallerID;
