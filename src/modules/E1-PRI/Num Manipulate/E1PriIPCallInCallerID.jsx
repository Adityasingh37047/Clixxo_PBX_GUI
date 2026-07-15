import React from "react";
import { IP_CALL_IN_CALLERID_FIELD_TOOLTIPS } from "../../../constants/FxsIPCallInCallerIDConstants";
import { NUM_MANIPULATE_IP_CALL_IN_CALLERID_DELETE_LABEL, NUM_MANIPULATE_IP_CALL_IN_CALLERID_CLEAR_ALL_LABEL, NUM_MANIPULATE_IP_CALL_IN_CALLERID_ADD_NEW_LABEL, NUM_MANIPULATE_IP_CALL_IN_CALLERID_EMPTY_MESSAGE, NUM_MANIPULATE_IP_CALL_IN_CALLERID_ADD_NEW_EMPTY_LABEL, NUM_MANIPULATE_IP_CALL_IN_CALLERID_MODAL_TITLE_EDIT, NUM_MANIPULATE_IP_CALL_IN_CALLERID_MODAL_TITLE_ADD, NUM_MANIPULATE_IP_CALL_IN_CALLERID_SAVE_LABEL, NUM_MANIPULATE_IP_CALL_IN_CALLERID_CLOSE_LABEL } from "../../../constants/E1PriIPCallInCallerIDConstants";
import { Alert, Checkbox, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, useMediaQuery } from "@mui/material";
import { C } from "../../../theme/pbxTokens";

import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import { useE1PriIPCallInCallerIDPage } from "./hooks/useE1PriIPCallInCallerIDPage";
import {
  E1_PRI_IP_CALL_IN_CALLERID_DISPLAY_COLUMNS,
  renderE1PriIPCallInCallerIDCellValue,
} from "./utils/E1PriIPCallInCallerIDTransformers";
import {
  E1PriIPCallInCallerIDBreadcrumb,
  E1PriIPCallInCallerIDBtn,
  E1PriIPCallInCallerIDTH,
  E1PriIPCallInCallerIDModalFormFields,
  E1PriIPCallInCallerIDTableListLoading,
  E1PriIPCallInCallerIDTableListEmptyState,
  e1PriIPCallInCallerIDCardStyle,
  e1PriIPCallInCallerIDToolbarStyle,
  e1PriIPCallInCallerIDPaginationStyle,
  e1PriIPCallInCallerIDAddNewModalFooterStyle,
  e1PriIPCallInCallerIDAddNewModalFooterBtnStyle,
  e1PriIPCallInCallerIDAddNewModalFooterCancelBtnStyle,
  e1PriIPCallInCallerIDAddNewModalBackdropSlotProps,
  e1PriIPCallInCallerIDAddNewModalDialogContentSx,
  e1PriIPCallInCallerIDCheckboxSx,
  e1PriIPCallInCallerIDTdStyle,
  e1PriIPCallInCallerIDPageBadgeStyle,
  e1PriIPCallInCallerIDDialogConfig,
  E1_PRI_IP_CALL_IN_CALLERID_COMPACT_MQ,
} from "./components/E1PriIPCallInCallerIDFormFields";
import {
  getE1PriIPCallInCallerIDRowBg,
  getE1PriIPCallInCallerIDEditIconStyle,
  handleE1PriIPCallInCallerIDEditIconHover,
  e1PriIPCallInCallerIDFixedAlertSx,
  e1PriIPCallInCallerIDPageWrapStyle,
  e1PriIPCallInCallerIDPageInnerStyle,
  e1PriIPCallInCallerIDSelectedBadgeStyle,
  e1PriIPCallInCallerIDCancelBtnStyle,
  e1PriIPCallInCallerIDToolbarBtnStyle,
  e1PriIPCallInCallerIDTableScrollStyle,
} from "./components/E1PriIPCallInCallerIDTableHelpers";

const IPCallInCallerID = () => {
  const isCompact = useMediaQuery(E1_PRI_IP_CALL_IN_CALLERID_COMPACT_MQ);
  const vm = useE1PriIPCallInCallerIDPage();
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

  const { dialogSx, paperSx, modalTitleStyle } = e1PriIPCallInCallerIDDialogConfig;

  return (
    <div
      style={{
        ...e1PriIPCallInCallerIDPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={e1PriIPCallInCallerIDPageInnerStyle}>
        {toast.msg && (
          <Alert
            severity={toast.type}
            onClose={() => setToast({ msg: "", type: "success" })}
            sx={e1PriIPCallInCallerIDFixedAlertSx}
          >
            {toast.msg}
          </Alert>
        )}

        <E1PriIPCallInCallerIDBreadcrumb />

        <div style={e1PriIPCallInCallerIDCardStyle}>
          <div
            style={{
              ...e1PriIPCallInCallerIDToolbarStyle,
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
                <span style={e1PriIPCallInCallerIDSelectedBadgeStyle}>
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
              <E1PriIPCallInCallerIDBtn
                variant="cancel"
                onClick={handleInverse}
                disabled={loading.fetch || loading.delete || rules.length === 0}
                style={e1PriIPCallInCallerIDCancelBtnStyle}
              >
                Inverse
              </E1PriIPCallInCallerIDBtn>
              <E1PriIPCallInCallerIDBtn
                variant="cancel"
                onClick={handleDelete}
                disabled={loading.delete || selected.length === 0}
                style={e1PriIPCallInCallerIDCancelBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : null}
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                {NUM_MANIPULATE_IP_CALL_IN_CALLERID_DELETE_LABEL}
              </E1PriIPCallInCallerIDBtn>
              <E1PriIPCallInCallerIDBtn
                variant="cancel"
                onClick={handleClearAll}
                disabled={loading.fetch || loading.delete || rules.length === 0}
                style={e1PriIPCallInCallerIDCancelBtnStyle}
              >
                {NUM_MANIPULATE_IP_CALL_IN_CALLERID_CLEAR_ALL_LABEL}
              </E1PriIPCallInCallerIDBtn>
              <E1PriIPCallInCallerIDBtn
                variant="cancel"
                onClick={handleRefresh}
                disabled={loading.fetch}
                style={e1PriIPCallInCallerIDCancelBtnStyle}
              >
                {loading.fetch ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : null}
                Refresh
              </E1PriIPCallInCallerIDBtn>
              <E1PriIPCallInCallerIDBtn
                variant="primary"
                onClick={() => handleOpenModal()}
                disabled={loading.fetch || loading.save}
                style={e1PriIPCallInCallerIDToolbarBtnStyle}
              >
                {NUM_MANIPULATE_IP_CALL_IN_CALLERID_ADD_NEW_LABEL}
              </E1PriIPCallInCallerIDBtn>
            </div>
          </div>

          {loading.fetch ? (
            <E1PriIPCallInCallerIDTableListLoading />
          ) : rules.length === 0 ? (
            <E1PriIPCallInCallerIDTableListEmptyState
              message={NUM_MANIPULATE_IP_CALL_IN_CALLERID_EMPTY_MESSAGE}
              onAddNew={() => handleOpenModal()}
              buttonLabel={NUM_MANIPULATE_IP_CALL_IN_CALLERID_ADD_NEW_EMPTY_LABEL}
            />
          ) : (
            <>
              <div
                ref={tableScrollRef}
                onScroll={handleTableScroll}
                style={e1PriIPCallInCallerIDTableScrollStyle}
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
                      <E1PriIPCallInCallerIDTH
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
                          sx={e1PriIPCallInCallerIDCheckboxSx}
                        />
                      </E1PriIPCallInCallerIDTH>
                      <E1PriIPCallInCallerIDTH style={{ width: 36 }}>
                        ID
                      </E1PriIPCallInCallerIDTH>
                      {E1_PRI_IP_CALL_IN_CALLERID_DISPLAY_COLUMNS.map((col) => (
                        <E1PriIPCallInCallerIDTH key={col.key}>
                          {col.label}
                        </E1PriIPCallInCallerIDTH>
                      ))}
                      <E1PriIPCallInCallerIDTH
                        style={{ width: 70, borderRight: "none" }}
                      >
                        Modify
                      </E1PriIPCallInCallerIDTH>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedRules.map((item, idx) => {
                      const realIdx = (page - 1) * vm.itemsPerPage + idx;
                      const isSelected = selected.includes(realIdx);
                      const isLastRow = idx === pagedRules.length - 1;
                      const rowBg = getE1PriIPCallInCallerIDRowBg(
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
                              ...e1PriIPCallInCallerIDTdStyle,
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
                              sx={e1PriIPCallInCallerIDCheckboxSx}
                            />
                          </td>
                          <td
                            style={{
                              ...e1PriIPCallInCallerIDTdStyle,
                              background: rowBg,
                              fontWeight: 400,
                              ...lastRowCellStyle,
                            }}
                          >
                            {realIdx + 1}
                          </td>
                          {E1_PRI_IP_CALL_IN_CALLERID_DISPLAY_COLUMNS.map(
                            (col) => (
                              <td
                                key={col.key}
                                style={{
                                  ...e1PriIPCallInCallerIDTdStyle,
                                  background: rowBg,
                                  fontWeight: 400,
                                  ...lastRowCellStyle,
                                }}
                              >
                                {renderE1PriIPCallInCallerIDCellValue(
                                  col,
                                  item,
                                )}
                              </td>
                            ),
                          )}
                          <td
                            style={{
                              ...e1PriIPCallInCallerIDTdStyle,
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
                                style={getE1PriIPCallInCallerIDEditIconStyle(
                                  loading.delete,
                                )}
                                onClick={() => {
                                  if (!loading.delete)
                                    handleOpenModal(item, realIdx);
                                }}
                                onMouseEnter={(e) =>
                                  handleE1PriIPCallInCallerIDEditIconHover(
                                    e,
                                    true,
                                    loading.delete,
                                  )
                                }
                                onMouseLeave={(e) =>
                                  handleE1PriIPCallInCallerIDEditIconHover(
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

              <div style={e1PriIPCallInCallerIDPaginationStyle}>
                <span style={{ fontSize: 11, color: C.mutedText }}>
                  Showing {pagedRules.length} record
                  {pagedRules.length !== 1 ? "s" : ""} on page {page}
                </span>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <E1PriIPCallInCallerIDBtn
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                    variant="outline"
                    style={{ borderRadius: 4 }}
                  >
                    ← Prev
                  </E1PriIPCallInCallerIDBtn>
                  <span style={e1PriIPCallInCallerIDPageBadgeStyle}>
                    Page {page} of {totalPages}
                  </span>
                  <E1PriIPCallInCallerIDBtn
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                    variant="outline"
                    style={{ borderRadius: 4 }}
                  >
                    Next →
                  </E1PriIPCallInCallerIDBtn>
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
          slotProps={e1PriIPCallInCallerIDAddNewModalBackdropSlotProps}
          sx={dialogSx}
          PaperProps={{ sx: paperSx }}
          disableRestoreFocus
          disableEnforceFocus
        >
          <DialogTitle style={modalTitleStyle}>
            {editIndex !== null
              ? NUM_MANIPULATE_IP_CALL_IN_CALLERID_MODAL_TITLE_EDIT
              : NUM_MANIPULATE_IP_CALL_IN_CALLERID_MODAL_TITLE_ADD}
          </DialogTitle>
          <DialogContent
            style={{
              padding: "24px",
              backgroundColor: "#ffffff",
              overflowY: "auto",
              flex: "1 1 auto",
            }}
            sx={e1PriIPCallInCallerIDAddNewModalDialogContentSx}
          >
            <E1PriIPCallInCallerIDModalFormFields
              fields={getUpdatedFields()}
              fieldTooltips={IP_CALL_IN_CALLERID_FIELD_TOOLTIPS}
              formData={formData}
              handleInputChange={handleInputChange}
            />
          </DialogContent>
          <DialogActions
            sx={{ p: 0, m: 0 }}
            style={e1PriIPCallInCallerIDAddNewModalFooterStyle}
          >
            <E1PriIPCallInCallerIDBtn
              variant="primary"
              onClick={handleSave}
              disabled={loading.save}
              style={e1PriIPCallInCallerIDAddNewModalFooterBtnStyle}
            >
              {loading.save ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                NUM_MANIPULATE_IP_CALL_IN_CALLERID_SAVE_LABEL
              )}
            </E1PriIPCallInCallerIDBtn>
            <E1PriIPCallInCallerIDBtn
              variant="cancel"
              onClick={handleCloseModal}
              disabled={loading.save}
              style={e1PriIPCallInCallerIDAddNewModalFooterCancelBtnStyle}
            >
              {NUM_MANIPULATE_IP_CALL_IN_CALLERID_CLOSE_LABEL}
            </E1PriIPCallInCallerIDBtn>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default IPCallInCallerID;
