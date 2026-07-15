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
  NUM_MANIPULATE_PSTN_CALL_IN_CALLERID_EMPTY_MESSAGE,
  NUM_MANIPULATE_PSTN_CALL_IN_CALLERID_MODAL_TITLE_ADD,
  NUM_MANIPULATE_PSTN_CALL_IN_CALLERID_MODAL_TITLE_EDIT,
  NUM_MANIPULATE_PSTN_CALL_IN_CALLERID_ADD_NEW_LABEL,
  NUM_MANIPULATE_PSTN_CALL_IN_CALLERID_ADD_NEW_EMPTY_LABEL,
  NUM_MANIPULATE_PSTN_CALL_IN_CALLERID_SAVE_LABEL,
  NUM_MANIPULATE_PSTN_CALL_IN_CALLERID_CLOSE_LABEL,
} from "../../../constants/E1PriPSTNCallInCallerIDConstants";
import { useE1PriPSTNCallInCallerIDPage } from "./hooks/useE1PriPSTNCallInCallerIDPage";
import {
  E1PriPSTNCallInCallerIDBreadcrumb,
  E1PriPSTNCallInCallerIDBtn,
  E1PriPSTNCallInCallerIDTH,
  E1PriPSTNCallInCallerIDModalFormFields,
  e1PriPSTNCallInCallerIDCardStyle,
  e1PriPSTNCallInCallerIDToolbarStyle,
  e1PriPSTNCallInCallerIDPaginationStyle,
  e1PriPSTNCallInCallerIDPageBadgeStyle,
  e1PriPSTNCallInCallerIDCancelBtnStyle,
  e1PriPSTNCallInCallerIDToolbarBtnStyle,
  e1PriPSTNCallInCallerIDAddNewModalFooterStyle,
  e1PriPSTNCallInCallerIDAddNewModalFooterBtnStyle,
  e1PriPSTNCallInCallerIDAddNewModalFooterCancelBtnStyle,
  e1PriPSTNCallInCallerIDCheckboxSx,
  e1PriPSTNCallInCallerIDTdStyle,
  e1PriPSTNCallInCallerIDC as C,
  e1PriPSTNCallInCallerIDDialogConfig,
} from "./components/E1PriPSTNCallInCallerIDFormFields";
import {
  getE1PriPSTNCallInCallerIDRowBg,
  e1PriPSTNCallInCallerIDEditIconStyle,
  handleE1PriPSTNCallInCallerIDEditIconHover,
  e1PriPSTNCallInCallerIDFixedAlertSx,
  e1PriPSTNCallInCallerIDPageWrapStyle,
  e1PriPSTNCallInCallerIDPageInnerStyle,
  e1PriPSTNCallInCallerIDSelectedBadgeStyle,
  e1PriPSTNCallInCallerIDLoadingWrapStyle,
  e1PriPSTNCallInCallerIDEmptyWrapStyle,
  e1PriPSTNCallInCallerIDEmptyTitleStyle,
  e1PriPSTNCallInCallerIDTableScrollStyle,
} from "./components/E1PriPSTNCallInCallerIDTableHelpers";

const PSTNCallInCallerID = () => {
  const vm = useE1PriPSTNCallInCallerIDPage();
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

  const { dialogSx, paperSx, modalTitleStyle } = e1PriPSTNCallInCallerIDDialogConfig;

  return (
    <div style={e1PriPSTNCallInCallerIDPageWrapStyle}>
      <div style={e1PriPSTNCallInCallerIDPageInnerStyle}>
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={e1PriPSTNCallInCallerIDFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <E1PriPSTNCallInCallerIDBreadcrumb />

        <div style={e1PriPSTNCallInCallerIDCardStyle}>
          <div style={e1PriPSTNCallInCallerIDToolbarStyle}>
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
                <span style={e1PriPSTNCallInCallerIDSelectedBadgeStyle}>
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
              <E1PriPSTNCallInCallerIDBtn
                variant="cancel"
                onClick={handleInverse}
                disabled={rules.length === 0 || loading.delete || loading.fetch}
                style={e1PriPSTNCallInCallerIDCancelBtnStyle}
              >
                Inverse
              </E1PriPSTNCallInCallerIDBtn>
              <E1PriPSTNCallInCallerIDBtn
                variant="cancel"
                onClick={handleDelete}
                disabled={selected.length === 0 || loading.delete}
                style={e1PriPSTNCallInCallerIDCancelBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : null}
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </E1PriPSTNCallInCallerIDBtn>
              <E1PriPSTNCallInCallerIDBtn
                variant="cancel"
                onClick={handleClearAll}
                disabled={rules.length === 0 || loading.delete}
                style={e1PriPSTNCallInCallerIDCancelBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : (
                  "Clear All"
                )}
              </E1PriPSTNCallInCallerIDBtn>
              <E1PriPSTNCallInCallerIDBtn
                variant="cancel"
                onClick={handleRefresh}
                disabled={loading.fetch}
                style={e1PriPSTNCallInCallerIDCancelBtnStyle}
              >
                {loading.fetch ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : null}
                Refresh
              </E1PriPSTNCallInCallerIDBtn>
              <E1PriPSTNCallInCallerIDBtn
                onClick={() => handleOpenModal()}
                variant="primary"
                disabled={loading.fetch || loading.save}
                style={e1PriPSTNCallInCallerIDToolbarBtnStyle}
              >
                {NUM_MANIPULATE_PSTN_CALL_IN_CALLERID_ADD_NEW_LABEL}
              </E1PriPSTNCallInCallerIDBtn>
            </div>
          </div>

          {loading.fetch ? (
            <div style={e1PriPSTNCallInCallerIDLoadingWrapStyle}>
              <CircularProgress size={28} style={{ color: C.accent }} />
            </div>
          ) : rules.length === 0 ? (
            <div style={e1PriPSTNCallInCallerIDEmptyWrapStyle}>
              <div style={e1PriPSTNCallInCallerIDEmptyTitleStyle}>
                {NUM_MANIPULATE_PSTN_CALL_IN_CALLERID_EMPTY_MESSAGE}
              </div>
              <E1PriPSTNCallInCallerIDBtn
                variant="cancel"
                onClick={() => handleOpenModal()}
                style={e1PriPSTNCallInCallerIDToolbarBtnStyle}
              >
                {NUM_MANIPULATE_PSTN_CALL_IN_CALLERID_ADD_NEW_EMPTY_LABEL}
              </E1PriPSTNCallInCallerIDBtn>
            </div>
          ) : (
            <>
              <div style={e1PriPSTNCallInCallerIDTableScrollStyle}>
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
                      <E1PriPSTNCallInCallerIDTH
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
                          sx={e1PriPSTNCallInCallerIDCheckboxSx}
                        />
                      </E1PriPSTNCallInCallerIDTH>
                      {PSTN_CALL_IN_CALLERID_TABLE_COLUMNS.map((col) => (
                        <E1PriPSTNCallInCallerIDTH key={col.key}>
                          {col.label}
                        </E1PriPSTNCallInCallerIDTH>
                      ))}
                      <E1PriPSTNCallInCallerIDTH
                        style={{ width: 70, borderRight: "none" }}
                      >
                        Modify
                      </E1PriPSTNCallInCallerIDTH>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedRules.map((item, idx) => {
                      const realIdx = (page - 1) * itemsPerPage + idx;
                      const isSelected = selected.includes(realIdx);
                      const isLastRow = idx === pagedRules.length - 1;
                      const rowBg = getE1PriPSTNCallInCallerIDRowBg(
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
                              ...e1PriPSTNCallInCallerIDTdStyle,
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
                              sx={e1PriPSTNCallInCallerIDCheckboxSx}
                            />
                          </td>
                          {PSTN_CALL_IN_CALLERID_TABLE_COLUMNS.map((col) => (
                            <td
                              key={col.key}
                              style={{
                                ...e1PriPSTNCallInCallerIDTdStyle,
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
                              ...e1PriPSTNCallInCallerIDTdStyle,
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
                                  ...e1PriPSTNCallInCallerIDEditIconStyle,
                                  cursor: loading.delete
                                    ? "not-allowed"
                                    : "pointer",
                                  opacity: loading.delete ? 0.4 : 0.7,
                                }}
                                onMouseEnter={(e) => {
                                  if (!loading.delete)
                                    handleE1PriPSTNCallInCallerIDEditIconHover(
                                      e,
                                      true,
                                    );
                                }}
                                onMouseLeave={(e) => {
                                  if (!loading.delete)
                                    handleE1PriPSTNCallInCallerIDEditIconHover(
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

              <div style={e1PriPSTNCallInCallerIDPaginationStyle}>
                <span style={{ fontSize: 11, color: C.mutedText }}>
                  Showing {pagedRules.length} record
                  {pagedRules.length !== 1 ? "s" : ""} on page {page}
                </span>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <E1PriPSTNCallInCallerIDBtn
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                    variant="outline"
                    style={{ borderRadius: 4 }}
                  >
                    ← Prev
                  </E1PriPSTNCallInCallerIDBtn>
                  <span style={e1PriPSTNCallInCallerIDPageBadgeStyle}>
                    Page {page} of {totalPages}
                  </span>
                  <E1PriPSTNCallInCallerIDBtn
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                    variant="outline"
                    style={{ borderRadius: 4 }}
                  >
                    Next →
                  </E1PriPSTNCallInCallerIDBtn>
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
            ? NUM_MANIPULATE_PSTN_CALL_IN_CALLERID_MODAL_TITLE_EDIT
            : NUM_MANIPULATE_PSTN_CALL_IN_CALLERID_MODAL_TITLE_ADD}
        </DialogTitle>
        <DialogContent
          style={{
            padding: "24px",
            backgroundColor: "#ffffff",
            overflowY: "auto",
            flex: "1 1 auto",
          }}
        >
          <E1PriPSTNCallInCallerIDModalFormFields
            fields={getUpdatedFields()}
            fieldTooltips={PSTN_CALL_IN_CALLERID_FIELD_TOOLTIPS}
            formData={formData}
            handleInputChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions
          sx={{ p: 0, m: 0 }}
          style={e1PriPSTNCallInCallerIDAddNewModalFooterStyle}
        >
          <E1PriPSTNCallInCallerIDBtn
            variant="primary"
            onClick={handleSave}
            disabled={loading.save}
            style={e1PriPSTNCallInCallerIDAddNewModalFooterBtnStyle}
          >
            {loading.save ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              NUM_MANIPULATE_PSTN_CALL_IN_CALLERID_SAVE_LABEL
            )}
          </E1PriPSTNCallInCallerIDBtn>
          <E1PriPSTNCallInCallerIDBtn
            variant="cancel"
            onClick={handleCloseModal}
            disabled={loading.save}
            style={e1PriPSTNCallInCallerIDAddNewModalFooterCancelBtnStyle}
          >
            {NUM_MANIPULATE_PSTN_CALL_IN_CALLERID_CLOSE_LABEL}
          </E1PriPSTNCallInCallerIDBtn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PSTNCallInCallerID;
