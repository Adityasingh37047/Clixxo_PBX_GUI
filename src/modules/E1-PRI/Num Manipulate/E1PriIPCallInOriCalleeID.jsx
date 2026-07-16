import React from "react";
import { NUM_MANIPULATE_IP_CALL_IN_ORICALLEEID_DELETE_LABEL, NUM_MANIPULATE_IP_CALL_IN_ORICALLEEID_CLEAR_ALL_LABEL, NUM_MANIPULATE_IP_CALL_IN_ORICALLEEID_ADD_NEW_LABEL, NUM_MANIPULATE_IP_CALL_IN_ORICALLEEID_EMPTY_MESSAGE, NUM_MANIPULATE_IP_CALL_IN_ORICALLEEID_ADD_NEW_EMPTY_LABEL, NUM_MANIPULATE_IP_CALL_IN_ORICALLEEID_MODAL_TITLE_EDIT, NUM_MANIPULATE_IP_CALL_IN_ORICALLEEID_MODAL_TITLE_ADD, IP_CALL_IN_ORICALLEEID_FIELD_TOOLTIPS, NUM_MANIPULATE_IP_CALL_IN_ORICALLEEID_SAVE_LABEL, NUM_MANIPULATE_IP_CALL_IN_ORICALLEEID_CLOSE_LABEL } from "../../../constants/E1PriIPCallInOriCalleeIDConstants";
import { Alert, Checkbox, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, useMediaQuery } from "@mui/material";
import { C } from "../../../theme/pbxTokens";

import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import { useE1PriIPCallInOriCalleeIDPage } from "./hooks/useE1PriIPCallInOriCalleeIDPage";
import {
  E1_PRI_IP_CALL_IN_ORICALLEEID_DISPLAY_COLUMNS,
  renderE1PriIPCallInOriCalleeIDCellValue,
} from "./utils/E1PriIPCallInOriCalleeIDTransformers";
import {
  E1PriIPCallInOriCalleeIDBreadcrumb,
  E1PriIPCallInOriCalleeIDBtn,
  E1PriIPCallInOriCalleeIDTH,
  E1PriIPCallInOriCalleeIDModalFormFields,
  E1PriIPCallInOriCalleeIDTableListLoading,
  E1PriIPCallInOriCalleeIDTableListEmptyState,
  e1PriIPCallInOriCalleeIDCardStyle,
  e1PriIPCallInOriCalleeIDToolbarStyle,
  e1PriIPCallInOriCalleeIDPaginationStyle,
  e1PriIPCallInOriCalleeIDAddNewModalFooterStyle,
  e1PriIPCallInOriCalleeIDAddNewModalFooterBtnStyle,
  e1PriIPCallInOriCalleeIDAddNewModalFooterCancelBtnStyle,
  e1PriIPCallInOriCalleeIDAddNewModalBackdropSlotProps,
  e1PriIPCallInOriCalleeIDAddNewModalDialogContentSx,
  e1PriIPCallInOriCalleeIDCheckboxSx,
  e1PriIPCallInOriCalleeIDTdStyle,
  e1PriIPCallInOriCalleeIDPageBadgeStyle,
  e1PriIPCallInOriCalleeIDDialogConfig,
  E1_PRI_IP_CALL_IN_ORICALLEEID_COMPACT_MQ,
} from "./components/E1PriIPCallInOriCalleeIDFormFields";
import {
  getE1PriIPCallInOriCalleeIDRowBg,
  getE1PriIPCallInOriCalleeIDEditIconStyle,
  handleE1PriIPCallInOriCalleeIDEditIconHover,
  e1PriIPCallInOriCalleeIDFixedAlertSx,
  e1PriIPCallInOriCalleeIDPageWrapStyle,
  e1PriIPCallInOriCalleeIDPageInnerStyle,
  e1PriIPCallInOriCalleeIDSelectedBadgeStyle,
  e1PriIPCallInOriCalleeIDCancelBtnStyle,
  e1PriIPCallInOriCalleeIDToolbarBtnStyle,
  e1PriIPCallInOriCalleeIDTableScrollStyle,
} from "./components/E1PriIPCallInOriCalleeIDTableHelpers";

const IPCallInOriCalleeID = () => {
  const isCompact = useMediaQuery(E1_PRI_IP_CALL_IN_ORICALLEEID_COMPACT_MQ);
  const vm = useE1PriIPCallInOriCalleeIDPage();
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

  const { dialogSx, paperSx, modalTitleStyle } =
    e1PriIPCallInOriCalleeIDDialogConfig;

  return (
    <div
      style={{
        ...e1PriIPCallInOriCalleeIDPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={e1PriIPCallInOriCalleeIDPageInnerStyle}>
        {toast.msg && (
          <Alert
            severity={toast.type}
            onClose={() => setToast({ msg: "", type: "success" })}
            sx={e1PriIPCallInOriCalleeIDFixedAlertSx}
          >
            {toast.msg}
          </Alert>
        )}

        <E1PriIPCallInOriCalleeIDBreadcrumb />

        <div style={e1PriIPCallInOriCalleeIDCardStyle}>
          <div
            style={{
              ...e1PriIPCallInOriCalleeIDToolbarStyle,
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
                <span style={e1PriIPCallInOriCalleeIDSelectedBadgeStyle}>
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
              <E1PriIPCallInOriCalleeIDBtn
                variant="cancel"
                onClick={handleInverse}
                disabled={loading.fetch || loading.delete || rules.length === 0}
                style={e1PriIPCallInOriCalleeIDCancelBtnStyle}
              >
                Inverse
              </E1PriIPCallInOriCalleeIDBtn>
              <E1PriIPCallInOriCalleeIDBtn
                variant="cancel"
                onClick={handleDelete}
                disabled={loading.delete || selected.length === 0}
                style={e1PriIPCallInOriCalleeIDCancelBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : null}
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                {NUM_MANIPULATE_IP_CALL_IN_ORICALLEEID_DELETE_LABEL}
              </E1PriIPCallInOriCalleeIDBtn>
              <E1PriIPCallInOriCalleeIDBtn
                variant="cancel"
                onClick={handleClearAll}
                disabled={loading.fetch || loading.delete || rules.length === 0}
                style={e1PriIPCallInOriCalleeIDCancelBtnStyle}
              >
                {NUM_MANIPULATE_IP_CALL_IN_ORICALLEEID_CLEAR_ALL_LABEL}
              </E1PriIPCallInOriCalleeIDBtn>
              <E1PriIPCallInOriCalleeIDBtn
                variant="cancel"
                onClick={handleRefresh}
                disabled={loading.fetch}
                style={e1PriIPCallInOriCalleeIDCancelBtnStyle}
              >
                {loading.fetch ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : null}
                Refresh
              </E1PriIPCallInOriCalleeIDBtn>
              <E1PriIPCallInOriCalleeIDBtn
                variant="primary"
                onClick={() => handleOpenModal()}
                disabled={loading.fetch || loading.save}
                style={e1PriIPCallInOriCalleeIDToolbarBtnStyle}
              >
                {NUM_MANIPULATE_IP_CALL_IN_ORICALLEEID_ADD_NEW_LABEL}
              </E1PriIPCallInOriCalleeIDBtn>
            </div>
          </div>

          {loading.fetch ? (
            <E1PriIPCallInOriCalleeIDTableListLoading />
          ) : rules.length === 0 ? (
            <E1PriIPCallInOriCalleeIDTableListEmptyState
              message={NUM_MANIPULATE_IP_CALL_IN_ORICALLEEID_EMPTY_MESSAGE}
              onAddNew={() => handleOpenModal()}
              buttonLabel={
                NUM_MANIPULATE_IP_CALL_IN_ORICALLEEID_ADD_NEW_EMPTY_LABEL
              }
            />
          ) : (
            <>
              <div
                ref={tableScrollRef}
                onScroll={handleTableScroll}
                style={e1PriIPCallInOriCalleeIDTableScrollStyle}
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
                      <E1PriIPCallInOriCalleeIDTH
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
                          sx={e1PriIPCallInOriCalleeIDCheckboxSx}
                        />
                      </E1PriIPCallInOriCalleeIDTH>
                      <E1PriIPCallInOriCalleeIDTH style={{ width: 36 }}>
                        ID
                      </E1PriIPCallInOriCalleeIDTH>
                      {E1_PRI_IP_CALL_IN_ORICALLEEID_DISPLAY_COLUMNS.map(
                        (col) => (
                          <E1PriIPCallInOriCalleeIDTH key={col.key}>
                            {col.label}
                          </E1PriIPCallInOriCalleeIDTH>
                        ),
                      )}
                      <E1PriIPCallInOriCalleeIDTH
                        style={{ width: 70, borderRight: "none" }}
                      >
                        Modify
                      </E1PriIPCallInOriCalleeIDTH>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedRules.map((item, idx) => {
                      const realIdx = (page - 1) * vm.itemsPerPage + idx;
                      const isSelected = selected.includes(realIdx);
                      const isLastRow = idx === pagedRules.length - 1;
                      const rowBg = getE1PriIPCallInOriCalleeIDRowBg(
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
                              ...e1PriIPCallInOriCalleeIDTdStyle,
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
                              sx={e1PriIPCallInOriCalleeIDCheckboxSx}
                            />
                          </td>
                          <td
                            style={{
                              ...e1PriIPCallInOriCalleeIDTdStyle,
                              background: rowBg,
                              fontWeight: 400,
                              ...lastRowCellStyle,
                            }}
                          >
                            {realIdx + 1}
                          </td>
                          {E1_PRI_IP_CALL_IN_ORICALLEEID_DISPLAY_COLUMNS.map(
                            (col) => (
                              <td
                                key={col.key}
                                style={{
                                  ...e1PriIPCallInOriCalleeIDTdStyle,
                                  background: rowBg,
                                  fontWeight: 400,
                                  ...lastRowCellStyle,
                                }}
                              >
                                {renderE1PriIPCallInOriCalleeIDCellValue(
                                  col,
                                  item,
                                )}
                              </td>
                            ),
                          )}
                          <td
                            style={{
                              ...e1PriIPCallInOriCalleeIDTdStyle,
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
                                style={getE1PriIPCallInOriCalleeIDEditIconStyle(
                                  loading.delete,
                                )}
                                onClick={() => {
                                  if (!loading.delete)
                                    handleOpenModal(item, realIdx);
                                }}
                                onMouseEnter={(e) =>
                                  handleE1PriIPCallInOriCalleeIDEditIconHover(
                                    e,
                                    true,
                                    loading.delete,
                                  )
                                }
                                onMouseLeave={(e) =>
                                  handleE1PriIPCallInOriCalleeIDEditIconHover(
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

              <div style={e1PriIPCallInOriCalleeIDPaginationStyle}>
                <span style={{ fontSize: 11, color: C.mutedText }}>
                  Showing {pagedRules.length} record
                  {pagedRules.length !== 1 ? "s" : ""} on page {page}
                </span>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <E1PriIPCallInOriCalleeIDBtn
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                    variant="outline"
                    style={{ borderRadius: 4 }}
                  >
                    ← Prev
                  </E1PriIPCallInOriCalleeIDBtn>
                  <span style={e1PriIPCallInOriCalleeIDPageBadgeStyle}>
                    Page {page} of {totalPages}
                  </span>
                  <E1PriIPCallInOriCalleeIDBtn
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                    variant="outline"
                    style={{ borderRadius: 4 }}
                  >
                    Next →
                  </E1PriIPCallInOriCalleeIDBtn>
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
          slotProps={e1PriIPCallInOriCalleeIDAddNewModalBackdropSlotProps}
          sx={dialogSx}
          PaperProps={{ sx: paperSx }}
          disableRestoreFocus
          disableEnforceFocus
        >
          <DialogTitle style={modalTitleStyle}>
            {editIndex !== null
              ? NUM_MANIPULATE_IP_CALL_IN_ORICALLEEID_MODAL_TITLE_EDIT
              : NUM_MANIPULATE_IP_CALL_IN_ORICALLEEID_MODAL_TITLE_ADD}
          </DialogTitle>
          <DialogContent
            style={{
              padding: "24px",
              backgroundColor: "#ffffff",
              overflowY: "auto",
              flex: "1 1 auto",
            }}
            sx={e1PriIPCallInOriCalleeIDAddNewModalDialogContentSx}
          >
            <E1PriIPCallInOriCalleeIDModalFormFields
              fields={getUpdatedFields()}
              fieldTooltips={IP_CALL_IN_ORICALLEEID_FIELD_TOOLTIPS}
              formData={formData}
              handleInputChange={handleInputChange}
            />
          </DialogContent>
          <DialogActions
            sx={{ p: 0, m: 0 }}
            style={e1PriIPCallInOriCalleeIDAddNewModalFooterStyle}
          >
            <E1PriIPCallInOriCalleeIDBtn
              variant="primary"
              onClick={handleSave}
              disabled={loading.save}
              style={e1PriIPCallInOriCalleeIDAddNewModalFooterBtnStyle}
            >
              {loading.save ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                NUM_MANIPULATE_IP_CALL_IN_ORICALLEEID_SAVE_LABEL
              )}
            </E1PriIPCallInOriCalleeIDBtn>
            <E1PriIPCallInOriCalleeIDBtn
              variant="cancel"
              onClick={handleCloseModal}
              disabled={loading.save}
              style={e1PriIPCallInOriCalleeIDAddNewModalFooterCancelBtnStyle}
            >
              {NUM_MANIPULATE_IP_CALL_IN_ORICALLEEID_CLOSE_LABEL}
            </E1PriIPCallInOriCalleeIDBtn>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default IPCallInOriCalleeID;
