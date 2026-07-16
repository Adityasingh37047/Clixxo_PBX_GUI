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
  PSTN_CALL_IN_ORICALLEEID_TABLE_COLUMNS,
  PSTN_CALL_IN_ORICALLEEID_FIELD_TOOLTIPS,
  NUM_MANIPULATE_PSTN_CALL_IN_ORICALLEEID_EMPTY_MESSAGE,
  NUM_MANIPULATE_PSTN_CALL_IN_ORICALLEEID_MODAL_TITLE_ADD,
  NUM_MANIPULATE_PSTN_CALL_IN_ORICALLEEID_MODAL_TITLE_EDIT,
  NUM_MANIPULATE_PSTN_CALL_IN_ORICALLEEID_ADD_NEW_LABEL,
  NUM_MANIPULATE_PSTN_CALL_IN_ORICALLEEID_ADD_NEW_EMPTY_LABEL,
  NUM_MANIPULATE_PSTN_CALL_IN_ORICALLEEID_SAVE_LABEL,
  NUM_MANIPULATE_PSTN_CALL_IN_ORICALLEEID_CLOSE_LABEL,
} from "../../../constants/E1PriPSTNCallInOriCalleeIDConstants";
import { useE1PriPSTNCallInOriCalleeIDPage } from "./hooks/useE1PriPSTNCallInOriCalleeIDPage";
import {
  E1PriPSTNCallInOriCalleeIDBreadcrumb,
  E1PriPSTNCallInOriCalleeIDBtn,
  E1PriPSTNCallInOriCalleeIDTH,
  E1PriPSTNCallInOriCalleeIDModalFormFields,
  e1PriPSTNCallInOriCalleeIDCardStyle,
  e1PriPSTNCallInOriCalleeIDToolbarStyle,
  e1PriPSTNCallInOriCalleeIDPaginationStyle,
  e1PriPSTNCallInOriCalleeIDPageBadgeStyle,
  e1PriPSTNCallInOriCalleeIDCancelBtnStyle,
  e1PriPSTNCallInOriCalleeIDToolbarBtnStyle,
  e1PriPSTNCallInOriCalleeIDAddNewModalFooterStyle,
  e1PriPSTNCallInOriCalleeIDAddNewModalFooterBtnStyle,
  e1PriPSTNCallInOriCalleeIDAddNewModalFooterCancelBtnStyle,
  e1PriPSTNCallInOriCalleeIDCheckboxSx,
  e1PriPSTNCallInOriCalleeIDTdStyle,
  e1PriPSTNCallInOriCalleeIDC as C,
  e1PriPSTNCallInOriCalleeIDDialogConfig,
} from "./components/E1PriPSTNCallInOriCalleeIDFormFields";
import {
  getE1PriPSTNCallInOriCalleeIDRowBg,
  e1PriPSTNCallInOriCalleeIDEditIconStyle,
  handleE1PriPSTNCallInOriCalleeIDEditIconHover,
  e1PriPSTNCallInOriCalleeIDFixedAlertSx,
  e1PriPSTNCallInOriCalleeIDPageWrapStyle,
  e1PriPSTNCallInOriCalleeIDPageInnerStyle,
  e1PriPSTNCallInOriCalleeIDSelectedBadgeStyle,
  e1PriPSTNCallInOriCalleeIDLoadingWrapStyle,
  e1PriPSTNCallInOriCalleeIDEmptyWrapStyle,
  e1PriPSTNCallInOriCalleeIDEmptyTitleStyle,
  e1PriPSTNCallInOriCalleeIDTableScrollStyle,
} from "./components/E1PriPSTNCallInOriCalleeIDTableHelpers";

const PSTNCallInOriCalleeID = () => {
  const vm = useE1PriPSTNCallInOriCalleeIDPage();
  const {
    isModalOpen,
    formData,
    rules,
    selected,
    page,
    loading,
    editIndex,
    message,
    setMessage,
    tableMinWidth,
    itemsPerPage,
    totalPages,
    pagedRules,
    getUpdatedFields,
    formatDisplayValue,
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
    handleRefresh,
  } = vm;

  const { dialogSx, paperSx, modalTitleStyle } = e1PriPSTNCallInOriCalleeIDDialogConfig;

  return (
    <div style={e1PriPSTNCallInOriCalleeIDPageWrapStyle}>
      <div style={e1PriPSTNCallInOriCalleeIDPageInnerStyle}>
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={e1PriPSTNCallInOriCalleeIDFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <E1PriPSTNCallInOriCalleeIDBreadcrumb />

        <div style={e1PriPSTNCallInOriCalleeIDCardStyle}>
          <div style={e1PriPSTNCallInOriCalleeIDToolbarStyle}>
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
                <span style={e1PriPSTNCallInOriCalleeIDSelectedBadgeStyle}>
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
              <E1PriPSTNCallInOriCalleeIDBtn
                variant="cancel"
                onClick={handleInverse}
                disabled={rules.length === 0 || loading.delete || loading.fetch}
                style={e1PriPSTNCallInOriCalleeIDCancelBtnStyle}
              >
                Inverse
              </E1PriPSTNCallInOriCalleeIDBtn>
              <E1PriPSTNCallInOriCalleeIDBtn
                variant="cancel"
                onClick={handleDelete}
                disabled={selected.length === 0 || loading.delete}
                style={e1PriPSTNCallInOriCalleeIDCancelBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : null}
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </E1PriPSTNCallInOriCalleeIDBtn>
              <E1PriPSTNCallInOriCalleeIDBtn
                variant="cancel"
                onClick={handleClearAll}
                disabled={rules.length === 0 || loading.delete}
                style={e1PriPSTNCallInOriCalleeIDCancelBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : (
                  "Clear All"
                )}
              </E1PriPSTNCallInOriCalleeIDBtn>
              <E1PriPSTNCallInOriCalleeIDBtn
                variant="cancel"
                onClick={handleRefresh}
                disabled={loading.fetch}
                style={e1PriPSTNCallInOriCalleeIDCancelBtnStyle}
              >
                {loading.fetch ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : null}
                Refresh
              </E1PriPSTNCallInOriCalleeIDBtn>
              <E1PriPSTNCallInOriCalleeIDBtn
                onClick={() => handleOpenModal()}
                variant="primary"
                disabled={loading.fetch || loading.save}
                style={e1PriPSTNCallInOriCalleeIDToolbarBtnStyle}
              >
                {NUM_MANIPULATE_PSTN_CALL_IN_ORICALLEEID_ADD_NEW_LABEL}
              </E1PriPSTNCallInOriCalleeIDBtn>
            </div>
          </div>

          {loading.fetch ? (
            <div style={e1PriPSTNCallInOriCalleeIDLoadingWrapStyle}>
              <CircularProgress size={28} style={{ color: C.accent }} />
            </div>
          ) : rules.length === 0 ? (
            <div style={e1PriPSTNCallInOriCalleeIDEmptyWrapStyle}>
              <div style={e1PriPSTNCallInOriCalleeIDEmptyTitleStyle}>
                {NUM_MANIPULATE_PSTN_CALL_IN_ORICALLEEID_EMPTY_MESSAGE}
              </div>
              <E1PriPSTNCallInOriCalleeIDBtn
                variant="cancel"
                onClick={() => handleOpenModal()}
                style={e1PriPSTNCallInOriCalleeIDToolbarBtnStyle}
              >
                {NUM_MANIPULATE_PSTN_CALL_IN_ORICALLEEID_ADD_NEW_EMPTY_LABEL}
              </E1PriPSTNCallInOriCalleeIDBtn>
            </div>
          ) : (
            <>
              <div style={e1PriPSTNCallInOriCalleeIDTableScrollStyle}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "separate",
                    borderSpacing: 0,
                    tableLayout: "auto",
                    minWidth: tableMinWidth,
                  }}
                >
                  <thead>
                    <tr>
                      <E1PriPSTNCallInOriCalleeIDTH
                        style={{ width: 40, padding: 0, borderLeft: "none" }}
                      >
                        <Checkbox
                          size="small"
                          checked={
                            rules.length > 0 && selected.length === rules.length
                          }
                          indeterminate={
                            selected.length > 0 &&
                            selected.length < rules.length
                          }
                          onChange={(e) => {
                            if (e.target.checked) handleCheckAll();
                            else handleUncheckAll();
                          }}
                          sx={e1PriPSTNCallInOriCalleeIDCheckboxSx}
                        />
                      </E1PriPSTNCallInOriCalleeIDTH>
                      {PSTN_CALL_IN_ORICALLEEID_TABLE_COLUMNS.map((col) => (
                        <E1PriPSTNCallInOriCalleeIDTH key={col.key}>
                          {col.label}
                        </E1PriPSTNCallInOriCalleeIDTH>
                      ))}
                      <E1PriPSTNCallInOriCalleeIDTH
                        style={{ width: 70, borderRight: "none" }}
                      >
                        Modify
                      </E1PriPSTNCallInOriCalleeIDTH>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedRules.map((item, idx) => {
                      const realIdx = (page - 1) * itemsPerPage + idx;
                      const isSelected = selected.includes(realIdx);
                      const isLastRow = idx === pagedRules.length - 1;
                      const rowBg = getE1PriPSTNCallInOriCalleeIDRowBg(
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
                              ...e1PriPSTNCallInOriCalleeIDTdStyle,
                              background: rowBg,
                              borderLeft: "none",
                              width: 36,
                              ...lastRowCellStyle,
                            }}
                          >
                            <Checkbox
                              size="small"
                              checked={isSelected}
                              onChange={() => handleSelectRow(idx)}
                              disabled={loading.delete}
                              sx={e1PriPSTNCallInOriCalleeIDCheckboxSx}
                            />
                          </td>
                          {PSTN_CALL_IN_ORICALLEEID_TABLE_COLUMNS.map((col) => (
                            <td
                              key={col.key}
                              style={{
                                ...e1PriPSTNCallInOriCalleeIDTdStyle,
                                background: rowBg,
                                fontWeight: 400,
                                ...lastRowCellStyle,
                              }}
                            >
                              {formatDisplayValue(col.key, item[col.key], idx)}
                            </td>
                          ))}
                          <td
                            style={{
                              ...e1PriPSTNCallInOriCalleeIDTdStyle,
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
                                onClick={() => {
                                  if (!loading.delete) handleOpenModal(item);
                                }}
                                style={{
                                  ...e1PriPSTNCallInOriCalleeIDEditIconStyle,
                                  cursor: loading.delete
                                    ? "not-allowed"
                                    : "pointer",
                                  opacity: loading.delete ? 0.4 : 0.7,
                                }}
                                onMouseEnter={(e) => {
                                  if (!loading.delete)
                                    handleE1PriPSTNCallInOriCalleeIDEditIconHover(
                                      e,
                                      true,
                                    );
                                }}
                                onMouseLeave={(e) => {
                                  if (!loading.delete)
                                    handleE1PriPSTNCallInOriCalleeIDEditIconHover(
                                      e,
                                      false,
                                    );
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={e1PriPSTNCallInOriCalleeIDPaginationStyle}>
                <span style={{ fontSize: 11, color: C.mutedText }}>
                  Showing {pagedRules.length} record
                  {pagedRules.length !== 1 ? "s" : ""} on page {page}
                </span>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <E1PriPSTNCallInOriCalleeIDBtn
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                    variant="outline"
                    style={{ borderRadius: 4 }}
                  >
                    ← Prev
                  </E1PriPSTNCallInOriCalleeIDBtn>
                  <span style={e1PriPSTNCallInOriCalleeIDPageBadgeStyle}>
                    Page {page} of {totalPages}
                  </span>
                  <E1PriPSTNCallInOriCalleeIDBtn
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                    variant="outline"
                    style={{ borderRadius: 4 }}
                  >
                    Next →
                  </E1PriPSTNCallInOriCalleeIDBtn>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Dialog
        open={isModalOpen}
        onClose={() => {
          if (loading.save) return;
          handleCloseModal();
        }}
        maxWidth={false}
        sx={dialogSx}
        PaperProps={{ sx: paperSx }}
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle style={modalTitleStyle}>
          {editIndex !== null
            ? NUM_MANIPULATE_PSTN_CALL_IN_ORICALLEEID_MODAL_TITLE_EDIT
            : NUM_MANIPULATE_PSTN_CALL_IN_ORICALLEEID_MODAL_TITLE_ADD}
        </DialogTitle>
        <DialogContent
          style={{
            padding: "24px",
            backgroundColor: "#ffffff",
            overflowY: "auto",
            flex: "1 1 auto",
          }}
        >
          <E1PriPSTNCallInOriCalleeIDModalFormFields
            fields={getUpdatedFields()}
            fieldTooltips={PSTN_CALL_IN_ORICALLEEID_FIELD_TOOLTIPS}
            formData={formData}
            handleInputChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions
          sx={{ p: 0, m: 0 }}
          style={e1PriPSTNCallInOriCalleeIDAddNewModalFooterStyle}
        >
          <E1PriPSTNCallInOriCalleeIDBtn
            variant="primary"
            onClick={handleSave}
            disabled={loading.save}
            style={e1PriPSTNCallInOriCalleeIDAddNewModalFooterBtnStyle}
          >
            {loading.save ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              NUM_MANIPULATE_PSTN_CALL_IN_ORICALLEEID_SAVE_LABEL
            )}
          </E1PriPSTNCallInOriCalleeIDBtn>
          <E1PriPSTNCallInOriCalleeIDBtn
            variant="cancel"
            onClick={handleCloseModal}
            disabled={loading.save}
            style={e1PriPSTNCallInOriCalleeIDAddNewModalFooterCancelBtnStyle}
          >
            {NUM_MANIPULATE_PSTN_CALL_IN_ORICALLEEID_CLOSE_LABEL}
          </E1PriPSTNCallInOriCalleeIDBtn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PSTNCallInOriCalleeID;
