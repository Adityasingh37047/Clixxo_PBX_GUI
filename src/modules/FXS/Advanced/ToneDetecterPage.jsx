import React from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import {
  Alert,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { TONE_DETECTER_EMPTY_MESSAGE } from "../../../constants/ToneDetecterConstants";
import { Btn } from "../../../components/common";
import { useToneDetecterPage } from "./hooks/useToneDetecterPage";
import { TONE_DETECTER_DATA_COLUMNS } from "./utils/ToneDetecterTransformers";
import {
  ToneDetecterBreadcrumb,
  ToneDetecterModalFormFields,
  ToneDetecterPageShell,
  getToneDetecterModalTitle,
  toneDetecterAddNewDialogPaperSx,
  toneDetecterAddNewDialogSx,
  toneDetecterModalBackdropSlotProps,
  toneDetecterModalDialogContentSx,
  toneDetecterModalFooterBtnStyle,
  toneDetecterModalFooterCancelBtnStyle,
  toneDetecterModalFooterStyle,
  toneDetecterModalTitleStyle,
} from "./components/ToneDetecterFormFields";
import {
  PCM_TRUNK_GROUP_CHECKBOX_SX,
  PCM_TRUNK_GROUP_TD_GAP,
  PCM_TRUNK_GROUP_TH_GAP,
  TH,
  getToneDetecterLastRowCellStyle,
  getToneDetecterRowBg,
  handleToneDetecterEditIconHover,
  tdStyle,
  toneDetecterCardStyle,
  toneDetecterEditIconStyle,
  toneDetecterEmptyMessageStyle,
  toneDetecterEmptyStateStyle,
  toneDetecterFixedAlertSx,
  toneDetecterHeaderStyle,
  toneDetecterPaginationInfoStyle,
  toneDetecterPaginationNavBtnStyle,
  toneDetecterPaginationPageBadgeStyle,
  toneDetecterPaginationStyle,
  toneDetecterSelectedBadgeStyle,
  toneDetecterTableBodyStyle,
  toneDetecterTableStyle,
  toneDetecterToolbarCancelBtnStyle,
  toneDetecterToolbarPrimaryBtnStyle,
} from "./components/ToneDetecterTableHelpers";

const ToneDetecterPage = () => {
  const vm = useToneDetecterPage();
  const {
    isModalOpen,
    formData,
    rules,
    selected,
    page,
    totalPages,
    pagedRules,
    itemsPerPage,
    loading,
    editIndex,
    toast,
    clearToast,
    pagedSelectedCount,
    allPagedChecked,
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
  } = vm;

  return (
    <ToneDetecterPageShell>
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={clearToast}
          sx={toneDetecterFixedAlertSx}
        >
          {toast.msg}
        </Alert>
      )}

      <ToneDetecterBreadcrumb />

      <div style={toneDetecterCardStyle}>
        <div style={toneDetecterHeaderStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {selected.length > 0 && (
              <span style={toneDetecterSelectedBadgeStyle}>
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
            <Btn
              variant="cancel"
              onClick={handleInverse}
              disabled={loading.delete || rules.length === 0}
              style={toneDetecterToolbarCancelBtnStyle}
            >
              Inverse
            </Btn>
            <Btn
              variant="cancel"
              onClick={handleDelete}
              disabled={loading.delete || selected.length === 0}
              style={toneDetecterToolbarCancelBtnStyle}
            >
              {loading.delete ? "Deleting..." : "Delete"}
            </Btn>
            <Btn
              variant="cancel"
              onClick={handleClearAll}
              disabled={loading.delete || rules.length === 0}
              style={toneDetecterToolbarCancelBtnStyle}
            >
              {loading.delete ? "Clearing..." : "Clear All"}
            </Btn>
            <Btn
              variant="primary"
              onClick={() => handleOpenModal()}
              disabled={loading.save}
              style={toneDetecterToolbarPrimaryBtnStyle}
            >
              {loading.save ? "Saving..." : "+ Add New"}
            </Btn>
          </div>
        </div>

        <div style={toneDetecterTableBodyStyle}>
          {rules.length === 0 ? (
            <div style={toneDetecterEmptyStateStyle}>
              <div style={toneDetecterEmptyMessageStyle}>
                {TONE_DETECTER_EMPTY_MESSAGE}
              </div>
              <Btn
                variant="cancel"
                onClick={() => handleOpenModal()}
                style={toneDetecterToolbarCancelBtnStyle}
              >
                + Add New
              </Btn>
            </div>
          ) : (
            <table style={toneDetecterTableStyle}>
              <thead>
                <tr>
                  <TH
                    style={{
                      width: 40,
                      padding: 0,
                      borderLeft: "none",
                      ...PCM_TRUNK_GROUP_TH_GAP,
                    }}
                  >
                    <Checkbox
                      size="small"
                      checked={allPagedChecked}
                      indeterminate={
                        pagedSelectedCount > 0 && !allPagedChecked
                      }
                      onChange={(e) => {
                        if (e.target.checked) handleCheckAll();
                        else handleUncheckAll();
                      }}
                      sx={PCM_TRUNK_GROUP_CHECKBOX_SX}
                    />
                  </TH>
                  {TONE_DETECTER_DATA_COLUMNS.map((col) => (
                    <TH key={col.key} style={PCM_TRUNK_GROUP_TH_GAP}>
                      {col.label}
                    </TH>
                  ))}
                  <TH
                    style={{
                      width: 70,
                      borderRight: "none",
                      ...PCM_TRUNK_GROUP_TH_GAP,
                    }}
                  >
                    Modify
                  </TH>
                </tr>
              </thead>
              <tbody>
                {pagedRules.map((item, idx) => {
                  const realIdx = (page - 1) * itemsPerPage + idx;
                  const isSelected = selected.includes(realIdx);
                  const isLastRow = idx === pagedRules.length - 1;
                  const rowBg = getToneDetecterRowBg(isSelected, idx);
                  const lastRowCellStyle =
                    getToneDetecterLastRowCellStyle(isLastRow);

                  return (
                    <tr key={realIdx} style={{ background: rowBg }}>
                      <td
                        style={{
                          ...tdStyle,
                          ...PCM_TRUNK_GROUP_TD_GAP,
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
                          sx={PCM_TRUNK_GROUP_CHECKBOX_SX}
                        />
                      </td>
                      {TONE_DETECTER_DATA_COLUMNS.map((col) => (
                        <td
                          key={col.key}
                          style={{
                            ...tdStyle,
                            ...PCM_TRUNK_GROUP_TD_GAP,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {item[col.key]}
                        </td>
                      ))}
                      <td
                        style={{
                          ...tdStyle,
                          ...PCM_TRUNK_GROUP_TD_GAP,
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
                            style={toneDetecterEditIconStyle}
                            onMouseEnter={(e) =>
                              handleToneDetecterEditIconHover(e, true)
                            }
                            onMouseLeave={(e) =>
                              handleToneDetecterEditIconHover(e, false)
                            }
                            onClick={() => handleOpenModal(item, realIdx)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {rules.length > 0 && (
          <div style={toneDetecterPaginationStyle}>
            <span style={toneDetecterPaginationInfoStyle}>
              Showing {pagedRules.length} record
              {pagedRules.length !== 1 ? "s" : ""} on page {page}
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                variant="outline"
                style={toneDetecterPaginationNavBtnStyle}
              >
                ← Prev
              </Btn>
              <span style={toneDetecterPaginationPageBadgeStyle}>
                Page {page} of {totalPages}
              </span>
              <Btn
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                variant="outline"
                style={toneDetecterPaginationNavBtnStyle}
              >
                Next →
              </Btn>
            </div>
          </div>
        )}
      </div>

      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth={false}
        slotProps={toneDetecterModalBackdropSlotProps}
        sx={toneDetecterAddNewDialogSx}
        PaperProps={{ sx: toneDetecterAddNewDialogPaperSx }}
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle style={toneDetecterModalTitleStyle}>
          {getToneDetecterModalTitle(editIndex)}
        </DialogTitle>
        <DialogContent
          style={{
            padding: "24px",
            backgroundColor: "#ffffff",
            flex: "1 1 auto",
          }}
          sx={toneDetecterModalDialogContentSx}
        >
          <ToneDetecterModalFormFields
            formData={formData}
            handleInputChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions sx={{ p: 0, m: 0 }} style={toneDetecterModalFooterStyle}>
          <Btn
            variant="primary"
            onClick={handleSave}
            disabled={loading.save}
            style={toneDetecterModalFooterBtnStyle}
          >
            Save
          </Btn>
          <Btn
            variant="cancel"
            onClick={handleCloseModal}
            style={toneDetecterModalFooterCancelBtnStyle}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>
    </ToneDetecterPageShell>
  );
};

export default ToneDetecterPage;
