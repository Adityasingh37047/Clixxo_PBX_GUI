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
  NUM_MANIPULATE_PSTN_CALL_IN_CALLEEID_EMPTY_MESSAGE,
  NUM_MANIPULATE_PSTN_CALL_IN_CALLEEID_MODAL_TITLE_ADD,
  NUM_MANIPULATE_PSTN_CALL_IN_CALLEEID_MODAL_TITLE_EDIT,
  NUM_MANIPULATE_PSTN_CALL_IN_CALLEEID_ADD_NEW_LABEL,
  NUM_MANIPULATE_PSTN_CALL_IN_CALLEEID_ADD_NEW_EMPTY_LABEL,
  NUM_MANIPULATE_PSTN_CALL_IN_CALLEEID_SAVE_LABEL,
  NUM_MANIPULATE_PSTN_CALL_IN_CALLEEID_CLOSE_LABEL,
} from "../../../constants/E1PriPSTNCallInCalleeIDConstants";
import { useE1PriPSTNCallInCalleeIDPage } from "./hooks/useE1PriPSTNCallInCalleeIDPage";
import {
  E1PriPSTNCallInCalleeIDBreadcrumb,
  E1PriPSTNCallInCalleeIDBtn,
  E1PriPSTNCallInCalleeIDTH,
  E1PriPSTNCallInCalleeIDModalFormFields,
  e1PriPSTNCallInCalleeIDCardStyle,
  e1PriPSTNCallInCalleeIDToolbarStyle,
  e1PriPSTNCallInCalleeIDPaginationStyle,
  e1PriPSTNCallInCalleeIDPageBadgeStyle,
  e1PriPSTNCallInCalleeIDCancelBtnStyle,
  e1PriPSTNCallInCalleeIDToolbarBtnStyle,
  e1PriPSTNCallInCalleeIDAddNewModalFooterStyle,
  e1PriPSTNCallInCalleeIDAddNewModalFooterBtnStyle,
  e1PriPSTNCallInCalleeIDAddNewModalFooterCancelBtnStyle,
  e1PriPSTNCallInCalleeIDCheckboxSx,
  e1PriPSTNCallInCalleeIDTdStyle,
  e1PriPSTNCallInCalleeIDC as C,
  e1PriPSTNCallInCalleeIDDialogConfig,
} from "./components/E1PriPSTNCallInCalleeIDFormFields";
import {
  getE1PriPSTNCallInCalleeIDRowBg,
  e1PriPSTNCallInCalleeIDEditIconStyle,
  handleE1PriPSTNCallInCalleeIDEditIconHover,
  e1PriPSTNCallInCalleeIDFixedAlertSx,
  e1PriPSTNCallInCalleeIDPageWrapStyle,
  e1PriPSTNCallInCalleeIDPageInnerStyle,
  e1PriPSTNCallInCalleeIDSelectedBadgeStyle,
  e1PriPSTNCallInCalleeIDLoadingWrapStyle,
  e1PriPSTNCallInCalleeIDEmptyWrapStyle,
  e1PriPSTNCallInCalleeIDEmptyTitleStyle,
  e1PriPSTNCallInCalleeIDTableScrollStyle,
} from "./components/E1PriPSTNCallInCalleeIDTableHelpers";

const PSTNCallInCalleeID = () => {
  const vm = useE1PriPSTNCallInCalleeIDPage();
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

  const { dialogSx, paperSx, modalTitleStyle } = e1PriPSTNCallInCalleeIDDialogConfig;

  return (
    <div style={e1PriPSTNCallInCalleeIDPageWrapStyle}>
      <div style={e1PriPSTNCallInCalleeIDPageInnerStyle}>
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={e1PriPSTNCallInCalleeIDFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <E1PriPSTNCallInCalleeIDBreadcrumb />

        <div style={e1PriPSTNCallInCalleeIDCardStyle}>
          <div style={e1PriPSTNCallInCalleeIDToolbarStyle}>
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
                <span style={e1PriPSTNCallInCalleeIDSelectedBadgeStyle}>
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
              <E1PriPSTNCallInCalleeIDBtn
                variant="cancel"
                onClick={handleInverse}
                disabled={rules.length === 0 || loading.delete || loading.fetch}
                style={e1PriPSTNCallInCalleeIDCancelBtnStyle}
              >
                Inverse
              </E1PriPSTNCallInCalleeIDBtn>
              <E1PriPSTNCallInCalleeIDBtn
                variant="cancel"
                onClick={handleDelete}
                disabled={selected.length === 0 || loading.delete}
                style={e1PriPSTNCallInCalleeIDCancelBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : null}
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </E1PriPSTNCallInCalleeIDBtn>
              <E1PriPSTNCallInCalleeIDBtn
                variant="cancel"
                onClick={handleClearAll}
                disabled={rules.length === 0 || loading.delete}
                style={e1PriPSTNCallInCalleeIDCancelBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : (
                  "Clear All"
                )}
              </E1PriPSTNCallInCalleeIDBtn>
              <E1PriPSTNCallInCalleeIDBtn
                variant="cancel"
                onClick={handleRefresh}
                disabled={loading.fetch}
                style={e1PriPSTNCallInCalleeIDCancelBtnStyle}
              >
                {loading.fetch ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : null}
                Refresh
              </E1PriPSTNCallInCalleeIDBtn>
              <E1PriPSTNCallInCalleeIDBtn
                onClick={() => handleOpenModal()}
                variant="primary"
                disabled={loading.fetch || loading.save}
                style={e1PriPSTNCallInCalleeIDToolbarBtnStyle}
              >
                {NUM_MANIPULATE_PSTN_CALL_IN_CALLEEID_ADD_NEW_LABEL}
              </E1PriPSTNCallInCalleeIDBtn>
            </div>
          </div>

          {loading.fetch ? (
            <div style={e1PriPSTNCallInCalleeIDLoadingWrapStyle}>
              <CircularProgress size={28} style={{ color: C.accent }} />
            </div>
          ) : rules.length === 0 ? (
            <div style={e1PriPSTNCallInCalleeIDEmptyWrapStyle}>
              <div style={e1PriPSTNCallInCalleeIDEmptyTitleStyle}>
                {NUM_MANIPULATE_PSTN_CALL_IN_CALLEEID_EMPTY_MESSAGE}
              </div>
              <E1PriPSTNCallInCalleeIDBtn
                variant="cancel"
                onClick={() => handleOpenModal()}
                style={e1PriPSTNCallInCalleeIDToolbarBtnStyle}
              >
                {NUM_MANIPULATE_PSTN_CALL_IN_CALLEEID_ADD_NEW_EMPTY_LABEL}
              </E1PriPSTNCallInCalleeIDBtn>
            </div>
          ) : (
            <>
              <div style={e1PriPSTNCallInCalleeIDTableScrollStyle}>
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
                      <E1PriPSTNCallInCalleeIDTH
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
                          sx={e1PriPSTNCallInCalleeIDCheckboxSx}
                        />
                      </E1PriPSTNCallInCalleeIDTH>
                      {PSTN_CALL_IN_CALLEEID_TABLE_COLUMNS.map((col) => (
                        <E1PriPSTNCallInCalleeIDTH key={col.key}>
                          {col.label}
                        </E1PriPSTNCallInCalleeIDTH>
                      ))}
                      <E1PriPSTNCallInCalleeIDTH
                        style={{ width: 70, borderRight: "none" }}
                      >
                        Modify
                      </E1PriPSTNCallInCalleeIDTH>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedRules.map((item, idx) => {
                      const realIdx = (page - 1) * itemsPerPage + idx;
                      const isSelected = selected.includes(realIdx);
                      const isLastRow = idx === pagedRules.length - 1;
                      const rowBg = getE1PriPSTNCallInCalleeIDRowBg(
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
                              ...e1PriPSTNCallInCalleeIDTdStyle,
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
                              sx={e1PriPSTNCallInCalleeIDCheckboxSx}
                            />
                          </td>
                          {PSTN_CALL_IN_CALLEEID_TABLE_COLUMNS.map((col) => (
                            <td
                              key={col.key}
                              style={{
                                ...e1PriPSTNCallInCalleeIDTdStyle,
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
                              ...e1PriPSTNCallInCalleeIDTdStyle,
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
                                  ...e1PriPSTNCallInCalleeIDEditIconStyle,
                                  cursor: loading.delete
                                    ? "not-allowed"
                                    : "pointer",
                                  opacity: loading.delete ? 0.4 : 0.7,
                                }}
                                onMouseEnter={(e) => {
                                  if (!loading.delete)
                                    handleE1PriPSTNCallInCalleeIDEditIconHover(
                                      e,
                                      true,
                                    );
                                }}
                                onMouseLeave={(e) => {
                                  if (!loading.delete)
                                    handleE1PriPSTNCallInCalleeIDEditIconHover(
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

              <div style={e1PriPSTNCallInCalleeIDPaginationStyle}>
                <span style={{ fontSize: 11, color: C.mutedText }}>
                  Showing {pagedRules.length} record
                  {pagedRules.length !== 1 ? "s" : ""} on page {page}
                </span>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <E1PriPSTNCallInCalleeIDBtn
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                    variant="outline"
                    style={{ borderRadius: 4 }}
                  >
                    ← Prev
                  </E1PriPSTNCallInCalleeIDBtn>
                  <span style={e1PriPSTNCallInCalleeIDPageBadgeStyle}>
                    Page {page} of {totalPages}
                  </span>
                  <E1PriPSTNCallInCalleeIDBtn
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                    variant="outline"
                    style={{ borderRadius: 4 }}
                  >
                    Next →
                  </E1PriPSTNCallInCalleeIDBtn>
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
            ? NUM_MANIPULATE_PSTN_CALL_IN_CALLEEID_MODAL_TITLE_EDIT
            : NUM_MANIPULATE_PSTN_CALL_IN_CALLEEID_MODAL_TITLE_ADD}
        </DialogTitle>
        <DialogContent
          style={{
            padding: "24px",
            backgroundColor: "#ffffff",
            overflowY: "auto",
            flex: "1 1 auto",
          }}
        >
          <E1PriPSTNCallInCalleeIDModalFormFields
            fields={getUpdatedFields()}
            fieldTooltips={PSTN_CALL_IN_CALLEEID_FIELD_TOOLTIPS}
            formData={formData}
            handleInputChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions
          sx={{ p: 0, m: 0 }}
          style={e1PriPSTNCallInCalleeIDAddNewModalFooterStyle}
        >
          <E1PriPSTNCallInCalleeIDBtn
            variant="primary"
            onClick={handleSave}
            disabled={loading.save}
            style={e1PriPSTNCallInCalleeIDAddNewModalFooterBtnStyle}
          >
            {loading.save ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              NUM_MANIPULATE_PSTN_CALL_IN_CALLEEID_SAVE_LABEL
            )}
          </E1PriPSTNCallInCalleeIDBtn>
          <E1PriPSTNCallInCalleeIDBtn
            variant="cancel"
            onClick={handleCloseModal}
            disabled={loading.save}
            style={e1PriPSTNCallInCalleeIDAddNewModalFooterCancelBtnStyle}
          >
            {NUM_MANIPULATE_PSTN_CALL_IN_CALLEEID_CLOSE_LABEL}
          </E1PriPSTNCallInCalleeIDBtn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PSTNCallInCalleeID;
