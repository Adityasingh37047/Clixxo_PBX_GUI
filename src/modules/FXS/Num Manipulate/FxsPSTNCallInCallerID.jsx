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
  PSTN_CALL_IN_CALLERID_TABLE_COLUMNS,
  PSTN_CALL_IN_CALLERID_FIELD_TOOLTIPS,
  PSTN_CALL_IN_CALLERID_EMPTY_MESSAGE,
  PSTN_CALL_IN_CALLERID_MODAL_TITLE_ADD,
  PSTN_CALL_IN_CALLERID_MODAL_TITLE_EDIT,
} from "../../../constants/FxsPSTNCallInCallerIDConstants";
import { C } from "../../../theme/pbxTokens";
import { usePSTNCallInCallerIDPage } from "./hooks/usePSTNCallInCallerIDPage";
import { renderPSTNCallInCallerIDCellValue } from "./utils/PSTNCallInCallerIDTransformers";
import {
  PSTNCallInCallerIDBreadcrumb,
  PSTNCallInCallerIDBtn,
  PSTNCallInCallerIDTH,
  PSTNCallInCallerIDModalFormFields,
  pSTNCallInCallerIDCardStyle,
  pSTNCallInCallerIDToolbarStyle,
  pSTNCallInCallerIDPaginationStyle,
  pSTNCallInCallerIDAddNewModalFooterStyle,
  pSTNCallInCallerIDAddNewModalFooterBtnStyle,
  pSTNCallInCallerIDAddNewModalFooterCancelBtnStyle,
  pSTNCallInCallerIDAddNewModalBackdropSlotProps,
  pSTNCallInCallerIDAddNewModalDialogContentSx,
  pSTNCallInCallerIDCheckboxSx,
  pSTNCallInCallerIDTdStyle,
  pSTNCallInCallerIDDialogConfig,
} from "./components/PSTNCallInCallerIDFormFields";
import {
  getPSTNCallInCallerIDRowBg,
  pSTNCallInCallerIDEditIconStyle,
  handlePSTNCallInCallerIDEditIconHover,
  pSTNCallInCallerIDFixedAlertSx,
  pSTNCallInCallerIDPageWrapStyle,
  pSTNCallInCallerIDPageInnerStyle,
  pSTNCallInCallerIDSelectedBadgeStyle,
  pSTNCallInCallerIDToolbarCancelBtnStyle,
  pSTNCallInCallerIDToolbarPrimaryBtnStyle,
  pSTNCallInCallerIDLoadingWrapStyle,
  pSTNCallInCallerIDEmptyWrapStyle,
  pSTNCallInCallerIDEmptyTitleStyle,
  pSTNCallInCallerIDTableScrollStyle,
  PSTNCALLINCALLERID_CARD_RADIUS,
} from "./components/PSTNCallInCallerIDTableHelpers";

const PSTNCallInCallerID = () => {
  const vm = usePSTNCallInCallerIDPage();
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
    pcmTrunkGroups,
    getPcmGroupIdLabel,
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

  const { dialogSx, paperSx, modalTitleStyle } = pSTNCallInCallerIDDialogConfig;

  const renderCellValue = (col, item) =>
    renderPSTNCallInCallerIDCellValue(col, item, pcmTrunkGroups, getPcmGroupIdLabel);

  return (
    <div style={pSTNCallInCallerIDPageWrapStyle}>
      <div style={pSTNCallInCallerIDPageInnerStyle}>
        {toast.msg && (
          <Alert
            severity={toast.type}
            onClose={() => setToast({ msg: "", type: "success" })}
            sx={pSTNCallInCallerIDFixedAlertSx}
          >
            {toast.msg}
          </Alert>
        )}

        <PSTNCallInCallerIDBreadcrumb />

        <div style={pSTNCallInCallerIDCardStyle}>
          <div style={pSTNCallInCallerIDToolbarStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {selected.length > 0 && (
                <span style={pSTNCallInCallerIDSelectedBadgeStyle(C.accent)}>
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
              <PSTNCallInCallerIDBtn
                variant="cancel"
                onClick={handleInverse}
                disabled={loading.delete || rules.length === 0}
                style={pSTNCallInCallerIDToolbarCancelBtnStyle}
              >
                Inverse
              </PSTNCallInCallerIDBtn>
              <PSTNCallInCallerIDBtn
                variant="cancel"
                onClick={handleDelete}
                disabled={loading.delete || selected.length === 0}
                style={pSTNCallInCallerIDToolbarCancelBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={12} color="inherit" />
                ) : (
                  <>
                    <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                    Delete
                  </>
                )}
              </PSTNCallInCallerIDBtn>
              <PSTNCallInCallerIDBtn
                variant="cancel"
                onClick={handleClearAll}
                disabled={loading.delete || rules.length === 0}
                style={pSTNCallInCallerIDToolbarCancelBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={12} color="inherit" />
                ) : (
                  "Clear All"
                )}
              </PSTNCallInCallerIDBtn>
              <PSTNCallInCallerIDBtn
                variant="cancel"
                onClick={handleRefresh}
                disabled={loading.fetch}
                style={pSTNCallInCallerIDToolbarCancelBtnStyle}
              >
                {loading.fetch ? (
                  <CircularProgress size={12} color="inherit" />
                ) : (
                  "Refresh"
                )}
              </PSTNCallInCallerIDBtn>
              <PSTNCallInCallerIDBtn
                variant="primary"
                onClick={() => handleOpenModal()}
                disabled={loading.fetch}
                style={pSTNCallInCallerIDToolbarPrimaryBtnStyle}
              >
                + Add New
              </PSTNCallInCallerIDBtn>
            </div>
          </div>

          <div style={{ position: "relative" }}>
            {loading.fetch ? (
              <div style={pSTNCallInCallerIDLoadingWrapStyle}>
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
              <div style={pSTNCallInCallerIDEmptyWrapStyle}>
                <div style={pSTNCallInCallerIDEmptyTitleStyle}>
                  {PSTN_CALL_IN_CALLERID_EMPTY_MESSAGE}
                </div>
                <PSTNCallInCallerIDBtn
                  variant="cancel"
                  onClick={() => handleOpenModal()}
                  style={pSTNCallInCallerIDToolbarCancelBtnStyle}
                >
                  + Add New Rule
                </PSTNCallInCallerIDBtn>
              </div>
            ) : (
              <>
                <div
                  ref={tableScrollRef}
                  onScroll={handleTableScroll}
                  style={pSTNCallInCallerIDTableScrollStyle}
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
                        <PSTNCallInCallerIDTH
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
                            sx={pSTNCallInCallerIDCheckboxSx}
                          />
                        </PSTNCallInCallerIDTH>
                        <PSTNCallInCallerIDTH style={{ width: 50 }}>ID</PSTNCallInCallerIDTH>
                        {PSTN_CALL_IN_CALLERID_TABLE_COLUMNS.map((col) => (
                          <PSTNCallInCallerIDTH key={col.key}>{col.label}</PSTNCallInCallerIDTH>
                        ))}
                        <PSTNCallInCallerIDTH style={{ width: 60, borderRight: "none" }}>
                          Modify
                        </PSTNCallInCallerIDTH>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedRules.map((item, idx) => {
                        const realIdx = (page - 1) * vm.itemsPerPage + idx;
                        const isSelected = selected.includes(realIdx);
                        const isLastRow = idx === pagedRules.length - 1;
                        const rowBg = getPSTNCallInCallerIDRowBg(isSelected, idx);
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
                                ...pSTNCallInCallerIDTdStyle,
                                background: rowBg,
                                borderLeft: "none",
                                ...lastRowCellStyle,
                                ...(isLastRow
                                  ? { borderBottomLeftRadius: PSTNCALLINCALLERID_CARD_RADIUS }
                                  : {}),
                              }}
                            >
                              <Checkbox
                                size="small"
                                checked={isSelected}
                                onChange={() => handleSelectRow(idx)}
                                sx={pSTNCallInCallerIDCheckboxSx}
                              />
                            </td>
                            <td
                              style={{
                                ...pSTNCallInCallerIDTdStyle,
                                background: rowBg,
                                ...lastRowCellStyle,
                              }}
                            >
                              {realIdx + 1}
                            </td>
                            {PSTN_CALL_IN_CALLERID_TABLE_COLUMNS.map((col) => (
                              <td
                                key={col.key}
                                style={{
                                  ...pSTNCallInCallerIDTdStyle,
                                  background: rowBg,
                                  ...lastRowCellStyle,
                                }}
                              >
                                {renderCellValue(col, item)}
                              </td>
                            ))}
                            <td
                              style={{
                                ...pSTNCallInCallerIDTdStyle,
                                background: rowBg,
                                borderRight: "none",
                                ...lastRowCellStyle,
                                ...(isLastRow
                                  ? { borderBottomRightRadius: PSTNCALLINCALLERID_CARD_RADIUS }
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
                                  style={pSTNCallInCallerIDEditIconStyle}
                                  onClick={() => handleOpenModal(item, realIdx)}
                                  onMouseEnter={(e) =>
                                    handlePSTNCallInCallerIDEditIconHover(e, true)
                                  }
                                  onMouseLeave={(e) =>
                                    handlePSTNCallInCallerIDEditIconHover(e, false)
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

                <div style={pSTNCallInCallerIDPaginationStyle}>
                  <span style={{ fontSize: 11, color: C.mutedText }}>
                    Showing {pagedRules.length} record
                    {pagedRules.length !== 1 ? "s" : ""} on page {page}
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <PSTNCallInCallerIDBtn
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page <= 1}
                      variant="outline"
                      style={{ borderRadius: 4 }}
                    >
                      ← Prev
                    </PSTNCallInCallerIDBtn>
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
                    <PSTNCallInCallerIDBtn
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= totalPages}
                      variant="outline"
                      style={{ borderRadius: 4 }}
                    >
                      Next →
                    </PSTNCallInCallerIDBtn>
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
          slotProps={pSTNCallInCallerIDAddNewModalBackdropSlotProps}
          sx={dialogSx}
          PaperProps={{ sx: paperSx }}
          disableRestoreFocus
          disableEnforceFocus
        >
          <DialogTitle style={modalTitleStyle}>
            {editIndex !== null
              ? PSTN_CALL_IN_CALLERID_MODAL_TITLE_EDIT
              : PSTN_CALL_IN_CALLERID_MODAL_TITLE_ADD}
          </DialogTitle>
          <DialogContent
            style={{
              padding: "24px",
              backgroundColor: "#ffffff",
              flex: "1 1 auto",
            }}
            sx={pSTNCallInCallerIDAddNewModalDialogContentSx}
          >
            <PSTNCallInCallerIDModalFormFields
              fields={getUpdatedFields()}
              fieldTooltips={PSTN_CALL_IN_CALLERID_FIELD_TOOLTIPS}
              formData={formData}
              handleInputChange={handleInputChange}
            />
          </DialogContent>
          <DialogActions sx={{ p: 0, m: 0 }} style={pSTNCallInCallerIDAddNewModalFooterStyle}>
            <PSTNCallInCallerIDBtn
              variant="primary"
              onClick={handleSave}
              disabled={loading.save}
              style={pSTNCallInCallerIDAddNewModalFooterBtnStyle}
            >
              {loading.save
                ? "Saving..."
                : editIndex !== null
                  ? "Update"
                  : "Save"}
            </PSTNCallInCallerIDBtn>
            <PSTNCallInCallerIDBtn
              variant="cancel"
              onClick={handleCloseModal}
              disabled={loading.save}
              style={pSTNCallInCallerIDAddNewModalFooterCancelBtnStyle}
            >
              Close
            </PSTNCallInCallerIDBtn>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default PSTNCallInCallerID;
