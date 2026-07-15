import React from "react";
import { IP_CALL_IN_CALLEEID_FIELD_TOOLTIPS } from "../../../constants/FxsIPCallInCalleeIDConstants";
import { NUM_MANIPULATE_IP_CALL_IN_CALLEEID_DELETE_LABEL, NUM_MANIPULATE_IP_CALL_IN_CALLEEID_CLEAR_ALL_LABEL, NUM_MANIPULATE_IP_CALL_IN_CALLEEID_ADD_NEW_LABEL, NUM_MANIPULATE_IP_CALL_IN_CALLEEID_EMPTY_MESSAGE, NUM_MANIPULATE_IP_CALL_IN_CALLEEID_ADD_NEW_EMPTY_LABEL, NUM_MANIPULATE_IP_CALL_IN_CALLEEID_MODAL_TITLE_EDIT, NUM_MANIPULATE_IP_CALL_IN_CALLEEID_MODAL_TITLE_ADD, NUM_MANIPULATE_IP_CALL_IN_CALLEEID_SAVE_LABEL, NUM_MANIPULATE_IP_CALL_IN_CALLEEID_CLOSE_LABEL } from "../../../constants/E1PriIPCallInCalleeIDConstants";
import { Alert, Checkbox, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, useMediaQuery } from "@mui/material";
import { C } from "../../../theme/pbxTokens";

import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import { useE1PriIPCallInCalleeIDPage } from "./hooks/useE1PriIPCallInCalleeIDPage";
import {
  E1_PRI_IP_CALL_IN_CALLEEID_DISPLAY_COLUMNS,
  renderE1PriIPCallInCalleeIDCellValue,
} from "./utils/E1PriIPCallInCalleeIDTransformers";
import {
  E1PriIPCallInCalleeIDBreadcrumb,
  E1PriIPCallInCalleeIDBtn,
  E1PriIPCallInCalleeIDTH,
  E1PriIPCallInCalleeIDModalFormFields,
  E1PriIPCallInCalleeIDTableListLoading,
  E1PriIPCallInCalleeIDTableListEmptyState,
  e1PriIPCallInCalleeIDCardStyle,
  e1PriIPCallInCalleeIDToolbarStyle,
  e1PriIPCallInCalleeIDPaginationStyle,
  e1PriIPCallInCalleeIDAddNewModalFooterStyle,
  e1PriIPCallInCalleeIDAddNewModalFooterBtnStyle,
  e1PriIPCallInCalleeIDAddNewModalFooterCancelBtnStyle,
  e1PriIPCallInCalleeIDAddNewModalBackdropSlotProps,
  e1PriIPCallInCalleeIDAddNewModalDialogContentSx,
  e1PriIPCallInCalleeIDCheckboxSx,
  e1PriIPCallInCalleeIDTdStyle,
  e1PriIPCallInCalleeIDPageBadgeStyle,
  e1PriIPCallInCalleeIDDialogConfig,
  E1_PRI_IP_CALL_IN_CALLEEID_COMPACT_MQ,
} from "./components/E1PriIPCallInCalleeIDFormFields";
import {
  getE1PriIPCallInCalleeIDRowBg,
  getE1PriIPCallInCalleeIDEditIconStyle,
  handleE1PriIPCallInCalleeIDEditIconHover,
  e1PriIPCallInCalleeIDFixedAlertSx,
  e1PriIPCallInCalleeIDPageWrapStyle,
  e1PriIPCallInCalleeIDPageInnerStyle,
  e1PriIPCallInCalleeIDSelectedBadgeStyle,
  e1PriIPCallInCalleeIDCancelBtnStyle,
  e1PriIPCallInCalleeIDToolbarBtnStyle,
  e1PriIPCallInCalleeIDTableScrollStyle,
} from "./components/E1PriIPCallInCalleeIDTableHelpers";

const IPCallInCalleeID = () => {
  const isCompact = useMediaQuery(E1_PRI_IP_CALL_IN_CALLEEID_COMPACT_MQ);
  const vm = useE1PriIPCallInCalleeIDPage();
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

  const { dialogSx, paperSx, modalTitleStyle } = e1PriIPCallInCalleeIDDialogConfig;

  return (
    <div
      style={{
        ...e1PriIPCallInCalleeIDPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={e1PriIPCallInCalleeIDPageInnerStyle}>
        {toast.msg && (
          <Alert
            severity={toast.type}
            onClose={() => setToast({ msg: "", type: "success" })}
            sx={e1PriIPCallInCalleeIDFixedAlertSx}
          >
            {toast.msg}
          </Alert>
        )}

        <E1PriIPCallInCalleeIDBreadcrumb />

        <div style={e1PriIPCallInCalleeIDCardStyle}>
          <div
            style={{
              ...e1PriIPCallInCalleeIDToolbarStyle,
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
                flex: 1,
                minWidth: 0,
              }}
            >
              {selected.length > 0 && (
                <span style={e1PriIPCallInCalleeIDSelectedBadgeStyle}>
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
              <E1PriIPCallInCalleeIDBtn
                variant="cancel"
                onClick={handleInverse}
                disabled={loading.fetch || loading.delete || rules.length === 0}
                style={e1PriIPCallInCalleeIDCancelBtnStyle}
              >
                Inverse
              </E1PriIPCallInCalleeIDBtn>
              <E1PriIPCallInCalleeIDBtn
                variant="cancel"
                onClick={handleDelete}
                disabled={loading.delete || selected.length === 0}
                style={e1PriIPCallInCalleeIDCancelBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : null}
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                {NUM_MANIPULATE_IP_CALL_IN_CALLEEID_DELETE_LABEL}
              </E1PriIPCallInCalleeIDBtn>
              <E1PriIPCallInCalleeIDBtn
                variant="cancel"
                onClick={handleClearAll}
                disabled={loading.fetch || loading.delete || rules.length === 0}
                style={e1PriIPCallInCalleeIDCancelBtnStyle}
              >
                {NUM_MANIPULATE_IP_CALL_IN_CALLEEID_CLEAR_ALL_LABEL}
              </E1PriIPCallInCalleeIDBtn>
              <E1PriIPCallInCalleeIDBtn
                variant="cancel"
                onClick={handleRefresh}
                disabled={loading.fetch}
                style={e1PriIPCallInCalleeIDCancelBtnStyle}
              >
                {loading.fetch ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : null}
                Refresh
              </E1PriIPCallInCalleeIDBtn>
              <E1PriIPCallInCalleeIDBtn
                variant="primary"
                onClick={() => handleOpenModal()}
                disabled={loading.fetch || loading.save}
                style={e1PriIPCallInCalleeIDToolbarBtnStyle}
              >
                {NUM_MANIPULATE_IP_CALL_IN_CALLEEID_ADD_NEW_LABEL}
              </E1PriIPCallInCalleeIDBtn>
            </div>
          </div>

          {loading.fetch ? (
            <E1PriIPCallInCalleeIDTableListLoading />
          ) : rules.length === 0 ? (
            <E1PriIPCallInCalleeIDTableListEmptyState
              message={NUM_MANIPULATE_IP_CALL_IN_CALLEEID_EMPTY_MESSAGE}
              onAddNew={() => handleOpenModal()}
              buttonLabel={NUM_MANIPULATE_IP_CALL_IN_CALLEEID_ADD_NEW_EMPTY_LABEL}
            />
          ) : (
            <>
              <div
                ref={tableScrollRef}
                onScroll={handleTableScroll}
                style={e1PriIPCallInCalleeIDTableScrollStyle}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "separate",
                    borderSpacing: 0,
                    tableLayout: "auto",
                    minWidth: isCompact ? 720 : 900,
                  }}
                >
                  <thead>
                    <tr>
                      <E1PriIPCallInCalleeIDTH
                        style={{
                          width: 40,
                          padding: 0,
                          borderLeft: "none",
                        }}
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
                          sx={e1PriIPCallInCalleeIDCheckboxSx}
                        />
                      </E1PriIPCallInCalleeIDTH>
                      <E1PriIPCallInCalleeIDTH style={{ width: 36 }}>
                        ID
                      </E1PriIPCallInCalleeIDTH>
                      {E1_PRI_IP_CALL_IN_CALLEEID_DISPLAY_COLUMNS.map((col) => (
                        <E1PriIPCallInCalleeIDTH key={col.key}>
                          {col.label}
                        </E1PriIPCallInCalleeIDTH>
                      ))}
                      <E1PriIPCallInCalleeIDTH
                        style={{ width: 70, borderRight: "none" }}
                      >
                        Modify
                      </E1PriIPCallInCalleeIDTH>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedRules.map((item, idx) => {
                      const realIdx = (page - 1) * vm.itemsPerPage + idx;
                      const isSelected = selected.includes(realIdx);
                      const isLastRow = idx === pagedRules.length - 1;
                      const rowBg = getE1PriIPCallInCalleeIDRowBg(
                        isSelected,
                        idx,
                      );
                      const lastRowCellStyle = isLastRow
                        ? { borderBottom: "none" }
                        : {};

                      return (
                        <tr
                          key={item.id || realIdx}
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
                              ...e1PriIPCallInCalleeIDTdStyle,
                              background: rowBg,
                              width: 36,
                              borderLeft: "none",
                              ...lastRowCellStyle,
                            }}
                          >
                            <Checkbox
                              size="small"
                              checked={isSelected}
                              onChange={() => handleSelectRow(idx)}
                              disabled={loading.delete}
                              sx={e1PriIPCallInCalleeIDCheckboxSx}
                            />
                          </td>
                          <td
                            style={{
                              ...e1PriIPCallInCalleeIDTdStyle,
                              background: rowBg,
                              fontWeight: 400,
                              ...lastRowCellStyle,
                            }}
                          >
                            {realIdx + 1}
                          </td>
                          {E1_PRI_IP_CALL_IN_CALLEEID_DISPLAY_COLUMNS.map(
                            (col) => (
                              <td
                                key={col.key}
                                style={{
                                  ...e1PriIPCallInCalleeIDTdStyle,
                                  background: rowBg,
                                  fontWeight: 400,
                                  ...lastRowCellStyle,
                                }}
                              >
                                {renderE1PriIPCallInCalleeIDCellValue(
                                  col,
                                  item,
                                )}
                              </td>
                            ),
                          )}
                          <td
                            style={{
                              ...e1PriIPCallInCalleeIDTdStyle,
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
                                style={getE1PriIPCallInCalleeIDEditIconStyle(
                                  loading.delete,
                                )}
                                onClick={() => {
                                  if (!loading.delete)
                                    handleOpenModal(item, realIdx);
                                }}
                                onMouseEnter={(e) =>
                                  handleE1PriIPCallInCalleeIDEditIconHover(
                                    e,
                                    true,
                                    loading.delete,
                                  )
                                }
                                onMouseLeave={(e) =>
                                  handleE1PriIPCallInCalleeIDEditIconHover(
                                    e,
                                    false,
                                    loading.delete,
                                  )
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

              <div style={e1PriIPCallInCalleeIDPaginationStyle}>
                <span style={{ fontSize: 11, color: C.mutedText }}>
                  Showing {pagedRules.length} record
                  {pagedRules.length !== 1 ? "s" : ""} on page {page}
                </span>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <E1PriIPCallInCalleeIDBtn
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                    variant="outline"
                    style={{ borderRadius: 4 }}
                  >
                    ← Prev
                  </E1PriIPCallInCalleeIDBtn>
                  <span style={e1PriIPCallInCalleeIDPageBadgeStyle}>
                    Page {page} of {totalPages}
                  </span>
                  <E1PriIPCallInCalleeIDBtn
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                    variant="outline"
                    style={{ borderRadius: 4 }}
                  >
                    Next →
                  </E1PriIPCallInCalleeIDBtn>
                </div>
              </div>
            </>
          )}
        </div>

        <Dialog
          open={isModalOpen}
          onClose={() => {
            if (loading.save) return;
            handleCloseModal();
          }}
          maxWidth={false}
          slotProps={e1PriIPCallInCalleeIDAddNewModalBackdropSlotProps}
          sx={dialogSx}
          PaperProps={{ sx: paperSx }}
          disableRestoreFocus
          disableEnforceFocus
        >
          <DialogTitle style={modalTitleStyle}>
            {editIndex !== null
              ? NUM_MANIPULATE_IP_CALL_IN_CALLEEID_MODAL_TITLE_EDIT
              : NUM_MANIPULATE_IP_CALL_IN_CALLEEID_MODAL_TITLE_ADD}
          </DialogTitle>
          <DialogContent
            style={{
              padding: "24px",
              backgroundColor: "#ffffff",
              overflowY: "auto",
              flex: "1 1 auto",
            }}
            sx={e1PriIPCallInCalleeIDAddNewModalDialogContentSx}
          >
            <E1PriIPCallInCalleeIDModalFormFields
              fields={getUpdatedFields()}
              fieldTooltips={IP_CALL_IN_CALLEEID_FIELD_TOOLTIPS}
              formData={formData}
              handleInputChange={handleInputChange}
            />
          </DialogContent>
          <DialogActions
            sx={{ p: 0, m: 0 }}
            style={e1PriIPCallInCalleeIDAddNewModalFooterStyle}
          >
            <E1PriIPCallInCalleeIDBtn
              variant="primary"
              onClick={handleSave}
              disabled={loading.save}
              style={e1PriIPCallInCalleeIDAddNewModalFooterBtnStyle}
            >
              {loading.save ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                NUM_MANIPULATE_IP_CALL_IN_CALLEEID_SAVE_LABEL
              )}
            </E1PriIPCallInCalleeIDBtn>
            <E1PriIPCallInCalleeIDBtn
              variant="cancel"
              onClick={handleCloseModal}
              disabled={loading.save}
              style={e1PriIPCallInCalleeIDAddNewModalFooterCancelBtnStyle}
            >
              {NUM_MANIPULATE_IP_CALL_IN_CALLEEID_CLOSE_LABEL}
            </E1PriIPCallInCalleeIDBtn>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default IPCallInCalleeID;
