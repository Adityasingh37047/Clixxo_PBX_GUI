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
  PSTN_CALL_IN_CALLEEID_TABLE_COLUMNS,
  PSTN_CALL_IN_CALLEEID_FIELD_TOOLTIPS,
  PSTN_CALL_IN_CALLEEID_EMPTY_MESSAGE,
  PSTN_CALL_IN_CALLEEID_MODAL_TITLE_ADD,
  PSTN_CALL_IN_CALLEEID_MODAL_TITLE_EDIT,
} from "../../../constants/FxsPSTNCallInCalleeIDConstants";
import { C } from "../../../theme/pbxTokens";
import { usePSTNCallInCalleeIDPage } from "./hooks/usePSTNCallInCalleeIDPage";
import { renderPSTNCallInCalleeIDCellValue } from "./utils/PSTNCallInCalleeIDTransformers";
import {
  PSTNCallInCalleeIDBreadcrumb,
  PSTNCallInCalleeIDBtn,
  PSTNCallInCalleeIDTH,
  PSTNCallInCalleeIDModalFormFields,
  pSTNCallInCalleeIDCardStyle,
  pSTNCallInCalleeIDToolbarStyle,
  pSTNCallInCalleeIDPaginationStyle,
  pSTNCallInCalleeIDAddNewModalFooterStyle,
  pSTNCallInCalleeIDAddNewModalFooterBtnStyle,
  pSTNCallInCalleeIDAddNewModalFooterCancelBtnStyle,
  pSTNCallInCalleeIDAddNewModalBackdropSlotProps,
  pSTNCallInCalleeIDAddNewModalDialogContentSx,
  pSTNCallInCalleeIDCheckboxSx,
  pSTNCallInCalleeIDTdStyle,
  pSTNCallInCalleeIDDialogConfig,
} from "./components/PSTNCallInCalleeIDFormFields";
import {
  getPSTNCallInCalleeIDRowBg,
  pSTNCallInCalleeIDEditIconStyle,
  handlePSTNCallInCalleeIDEditIconHover,
  pSTNCallInCalleeIDFixedAlertSx,
  pSTNCallInCalleeIDPageWrapStyle,
  pSTNCallInCalleeIDPageInnerStyle,
  pSTNCallInCalleeIDSelectedBadgeStyle,
  pSTNCallInCalleeIDToolbarCancelBtnStyle,
  pSTNCallInCalleeIDToolbarPrimaryBtnStyle,
  pSTNCallInCalleeIDLoadingWrapStyle,
  pSTNCallInCalleeIDEmptyWrapStyle,
  pSTNCallInCalleeIDEmptyTitleStyle,
  pSTNCallInCalleeIDTableScrollStyle,
  PSTNCALLINCALLEEID_CARD_RADIUS,
} from "./components/PSTNCallInCalleeIDTableHelpers";

const PSTNCallInCalleeID = () => {
  const vm = usePSTNCallInCalleeIDPage();
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

  const { dialogSx, paperSx, modalTitleStyle } = pSTNCallInCalleeIDDialogConfig;

  const renderCellValue = (col, item) =>
    renderPSTNCallInCalleeIDCellValue(col, item, pcmTrunkGroups, getPcmGroupIdLabel);

  return (
    <div style={pSTNCallInCalleeIDPageWrapStyle}>
      <div style={pSTNCallInCalleeIDPageInnerStyle}>
        {toast.msg && (
          <Alert
            severity={toast.type}
            onClose={() => setToast({ msg: "", type: "success" })}
            sx={pSTNCallInCalleeIDFixedAlertSx}
          >
            {toast.msg}
          </Alert>
        )}

        <PSTNCallInCalleeIDBreadcrumb />

        <div style={pSTNCallInCalleeIDCardStyle}>
          <div style={pSTNCallInCalleeIDToolbarStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {selected.length > 0 && (
                <span style={pSTNCallInCalleeIDSelectedBadgeStyle(C.accent)}>
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
              <PSTNCallInCalleeIDBtn
                variant="cancel"
                onClick={handleInverse}
                disabled={loading.delete || rules.length === 0}
                style={pSTNCallInCalleeIDToolbarCancelBtnStyle}
              >
                Inverse
              </PSTNCallInCalleeIDBtn>
              <PSTNCallInCalleeIDBtn
                variant="cancel"
                onClick={handleDelete}
                disabled={loading.delete || selected.length === 0}
                style={pSTNCallInCalleeIDToolbarCancelBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={12} color="inherit" />
                ) : (
                  <>
                    <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                    Delete
                  </>
                )}
              </PSTNCallInCalleeIDBtn>
              <PSTNCallInCalleeIDBtn
                variant="cancel"
                onClick={handleClearAll}
                disabled={loading.delete || rules.length === 0}
                style={pSTNCallInCalleeIDToolbarCancelBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={12} color="inherit" />
                ) : (
                  "Clear All"
                )}
              </PSTNCallInCalleeIDBtn>
              <PSTNCallInCalleeIDBtn
                variant="cancel"
                onClick={handleRefresh}
                disabled={loading.fetch}
                style={pSTNCallInCalleeIDToolbarCancelBtnStyle}
              >
                {loading.fetch ? (
                  <CircularProgress size={12} color="inherit" />
                ) : (
                  "Refresh"
                )}
              </PSTNCallInCalleeIDBtn>
              <PSTNCallInCalleeIDBtn
                variant="primary"
                onClick={() => handleOpenModal()}
                disabled={loading.fetch}
                style={pSTNCallInCalleeIDToolbarPrimaryBtnStyle}
              >
                + Add New
              </PSTNCallInCalleeIDBtn>
            </div>
          </div>

          <div style={{ position: "relative" }}>
            {loading.fetch ? (
              <div style={pSTNCallInCalleeIDLoadingWrapStyle}>
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
              <div style={pSTNCallInCalleeIDEmptyWrapStyle}>
                <div style={pSTNCallInCalleeIDEmptyTitleStyle}>
                  {PSTN_CALL_IN_CALLEEID_EMPTY_MESSAGE}
                </div>
                <PSTNCallInCalleeIDBtn
                  variant="cancel"
                  onClick={() => handleOpenModal()}
                  style={pSTNCallInCalleeIDToolbarCancelBtnStyle}
                >
                  + Add New Rule
                </PSTNCallInCalleeIDBtn>
              </div>
            ) : (
              <>
                <div
                  ref={tableScrollRef}
                  onScroll={handleTableScroll}
                  style={pSTNCallInCalleeIDTableScrollStyle}
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
                        <PSTNCallInCalleeIDTH
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
                            sx={pSTNCallInCalleeIDCheckboxSx}
                          />
                        </PSTNCallInCalleeIDTH>
                        <PSTNCallInCalleeIDTH style={{ width: 50 }}>ID</PSTNCallInCalleeIDTH>
                        {PSTN_CALL_IN_CALLEEID_TABLE_COLUMNS.map((col) => (
                          <PSTNCallInCalleeIDTH key={col.key}>{col.label}</PSTNCallInCalleeIDTH>
                        ))}
                        <PSTNCallInCalleeIDTH style={{ width: 60, borderRight: "none" }}>
                          Modify
                        </PSTNCallInCalleeIDTH>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedRules.map((item, idx) => {
                        const realIdx = (page - 1) * vm.itemsPerPage + idx;
                        const isSelected = selected.includes(realIdx);
                        const isLastRow = idx === pagedRules.length - 1;
                        const rowBg = getPSTNCallInCalleeIDRowBg(isSelected, idx);
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
                                ...pSTNCallInCalleeIDTdStyle,
                                background: rowBg,
                                borderLeft: "none",
                                ...lastRowCellStyle,
                                ...(isLastRow
                                  ? { borderBottomLeftRadius: PSTNCALLINCALLEEID_CARD_RADIUS }
                                  : {}),
                              }}
                            >
                              <Checkbox
                                size="small"
                                checked={isSelected}
                                onChange={() => handleSelectRow(idx)}
                                sx={pSTNCallInCalleeIDCheckboxSx}
                              />
                            </td>
                            <td
                              style={{
                                ...pSTNCallInCalleeIDTdStyle,
                                background: rowBg,
                                ...lastRowCellStyle,
                              }}
                            >
                              {realIdx + 1}
                            </td>
                            {PSTN_CALL_IN_CALLEEID_TABLE_COLUMNS.map((col) => (
                              <td
                                key={col.key}
                                style={{
                                  ...pSTNCallInCalleeIDTdStyle,
                                  background: rowBg,
                                  ...lastRowCellStyle,
                                }}
                              >
                                {renderCellValue(col, item)}
                              </td>
                            ))}
                            <td
                              style={{
                                ...pSTNCallInCalleeIDTdStyle,
                                background: rowBg,
                                borderRight: "none",
                                ...lastRowCellStyle,
                                ...(isLastRow
                                  ? { borderBottomRightRadius: PSTNCALLINCALLEEID_CARD_RADIUS }
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
                                  style={pSTNCallInCalleeIDEditIconStyle}
                                  onClick={() => handleOpenModal(item, realIdx)}
                                  onMouseEnter={(e) =>
                                    handlePSTNCallInCalleeIDEditIconHover(e, true)
                                  }
                                  onMouseLeave={(e) =>
                                    handlePSTNCallInCalleeIDEditIconHover(e, false)
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

                <div style={pSTNCallInCalleeIDPaginationStyle}>
                  <span style={{ fontSize: 11, color: C.mutedText }}>
                    Showing {pagedRules.length} record
                    {pagedRules.length !== 1 ? "s" : ""} on page {page}
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <PSTNCallInCalleeIDBtn
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page <= 1}
                      variant="outline"
                      style={{ borderRadius: 4 }}
                    >
                      ← Prev
                    </PSTNCallInCalleeIDBtn>
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
                    <PSTNCallInCalleeIDBtn
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= totalPages}
                      variant="outline"
                      style={{ borderRadius: 4 }}
                    >
                      Next →
                    </PSTNCallInCalleeIDBtn>
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
          slotProps={pSTNCallInCalleeIDAddNewModalBackdropSlotProps}
          sx={dialogSx}
          PaperProps={{ sx: paperSx }}
          disableRestoreFocus
          disableEnforceFocus
        >
          <DialogTitle style={modalTitleStyle}>
            {editIndex !== null
              ? PSTN_CALL_IN_CALLEEID_MODAL_TITLE_EDIT
              : PSTN_CALL_IN_CALLEEID_MODAL_TITLE_ADD}
          </DialogTitle>
          <DialogContent
            style={{
              padding: "24px",
              backgroundColor: "#ffffff",
              flex: "1 1 auto",
            }}
            sx={pSTNCallInCalleeIDAddNewModalDialogContentSx}
          >
            <PSTNCallInCalleeIDModalFormFields
              fields={getUpdatedFields()}
              fieldTooltips={PSTN_CALL_IN_CALLEEID_FIELD_TOOLTIPS}
              formData={formData}
              handleInputChange={handleInputChange}
            />
          </DialogContent>
          <DialogActions sx={{ p: 0, m: 0 }} style={pSTNCallInCalleeIDAddNewModalFooterStyle}>
            <PSTNCallInCalleeIDBtn
              variant="primary"
              onClick={handleSave}
              disabled={loading.save}
              style={pSTNCallInCalleeIDAddNewModalFooterBtnStyle}
            >
              {loading.save
                ? "Saving..."
                : editIndex !== null
                  ? "Update"
                  : "Save"}
            </PSTNCallInCalleeIDBtn>
            <PSTNCallInCalleeIDBtn
              variant="cancel"
              onClick={handleCloseModal}
              disabled={loading.save}
              style={pSTNCallInCalleeIDAddNewModalFooterCancelBtnStyle}
            >
              Close
            </PSTNCallInCalleeIDBtn>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default PSTNCallInCalleeID;
