import React from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { PCM_TRUNK_INDEX_OPTIONS, PCM_TRUNK_PCM_NO_OPTIONS, PCM_TRUNK_ITEMS_PER_PAGE, PCM_TRUNK_FIELD_TOOLTIPS, PCM_TRUNK_EMPTY_MESSAGE, PCM_TRUNK_MODAL_TITLE, PCM_TRUNK_SAVE_LABEL, PCM_TRUNK_CLOSE_LABEL } from "../../../constants/PcmTrunkConstants";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Checkbox from "@mui/material/Checkbox";
import { usePcmTrunkPage } from "./hooks/usePcmTrunkPage";
import {
  Btn,
  TH,
  C,
  checkboxSx,
  cellStyle,
  tableContainerStyle,
  CARD_RADIUS,
  PcmTrunkBreadcrumb,
  PcmTrunkFieldLabel,
  PCM_TRUNK_ADD_NEW_DIALOG_SX,
  PCM_TRUNK_ADD_NEW_DIALOG_PAPER_SX,
  pcmTrunkModalFormPanelStyle,
  pcmTrunkSelectStyle,
  pcmTrunkInputInteraction,
  addNewModalFooterStyle,
  addNewModalFooterBtnStyle,
  pcmTrunkModalCancelBtnStyle,
} from "./components/PcmTrunkFormFields";

const PcmTrunkPage = () => {
  const {
    isCompact,
    trunks,
    isModalOpen,
    form,
    checkAll,
    selected,
    page,
    totalPages,
    pagedTrunks,
    handleOpenModal,
    handleCloseModal,
    handleFormChange,
    handleTSChange,
    handleCheckAllTs,
    handleSave,
    handleSelectRow,
    handleInverse,
    handleDelete,
    handleClearAll,
    handlePageChange,
  } = usePcmTrunkPage();

  return (
    <div
      style={{
        backgroundColor: C.pageBg,
        minHeight: "calc(100vh - 80px)",
        padding: isCompact ? 8 : 16,
        boxSizing: "border-box",
      }}
    >
      <div style={{ width: "100%", maxWidth: "100%", margin: "0 auto" }}>
        <PcmTrunkBreadcrumb />
        {trunks.length === 0 ? (
          <div
            style={{
              background: "#ffffff",
              borderRadius: CARD_RADIUS,
              border: `1px solid ${C.cardBorder}`,
              boxShadow:
                "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 280,
              padding: 24,
              textAlign: "center",
            }}
          >
            <div
              style={{
                color: "#3E5475",
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 16,
              }}
            >
              {PCM_TRUNK_EMPTY_MESSAGE}
            </div>
            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <Btn
                variant="primary"
                onClick={() => handleOpenModal()}
                style={{ height: 30, padding: "6px 14px", fontSize: 12, borderRadius: 4 }}
              >
                + Add New
              </Btn>
              <Btn variant="cancel" style={{ height: 30, padding: "6px 14px", fontSize: 12, borderRadius: 4 }}>
                Batch Add
              </Btn>
            </div>
          </div>
        ) : (
          <div style={tableContainerStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                minHeight: 44,
                padding: "7px 14px",
                borderBottom: `1px solid ${C.cardBorder}`,
                background: "#ffffff",
                flexWrap: "wrap",
                gap: 12,
                borderTopLeftRadius: CARD_RADIUS,
                borderTopRightRadius: CARD_RADIUS,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {selected.length > 0 && (
                  <span
                    style={{
                      background: "#eff6ff",
                      color: C.accent,
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "5px 12px",
                      borderRadius: 999,
                      border: `1px solid ${C.accent}`,
                    }}
                  >
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
                  disabled={trunks.length === 0}
                  style={{ height: 30, padding: "6px 14px", fontSize: 12, borderRadius: 4 }}
                >
                  Inverse
                </Btn>
                <Btn
                  variant="cancel"
                  onClick={handleDelete}
                  disabled={selected.length === 0}
                  style={{ height: 30, padding: "6px 14px", fontSize: 12, borderRadius: 4 }}
                >
                  <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                  Delete
                </Btn>
                <Btn
                  variant="cancel"
                  onClick={handleClearAll}
                  disabled={trunks.length === 0}
                  style={{ height: 30, padding: "6px 14px", fontSize: 12, borderRadius: 4 }}
                >
                  Clear All
                </Btn>
                <Btn
                  variant="primary"
                  onClick={() => handleOpenModal()}
                  style={{ height: 30, padding: "6px 14px", fontSize: 12, borderRadius: 4 }}
                >
                  + Add New
                </Btn>
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  tableLayout: "auto",
                  minWidth: 900,
                }}
              >
                <thead>
                  <tr>
                    <TH style={{ width: 36, borderLeft: "none" }}>Check</TH>
                    <TH>Index</TH>
                    <TH>PCM NO.</TH>
                    <TH>Including Ts</TH>
                    <TH style={{ borderRight: "none" }}>Modify</TH>
                  </tr>
                </thead>
                <tbody>
                  {pagedTrunks.map((trunk, idx) => {
                    const isLastRow = idx === pagedTrunks.length - 1;
                    const lastRowCellStyle = isLastRow
                      ? { borderBottom: "none" }
                      : {};
                    return (
                      <tr
                        key={idx}
                        style={{
                          background: selected.includes(
                            (page - 1) * PCM_TRUNK_ITEMS_PER_PAGE + idx,
                          )
                            ? "#e0f2fe"
                            : idx % 2 === 1
                              ? "#f8fafc"
                              : "#ffffff",
                          borderBottom: isLastRow
                            ? "none"
                            : `1px solid ${C.cardBorder}`,
                        }}
                      >
                        <td
                          style={{
                            ...cellStyle,
                            borderLeft: "none",
                            ...lastRowCellStyle,
                            ...(isLastRow
                              ? { borderBottomLeftRadius: CARD_RADIUS }
                              : {}),
                          }}
                        >
                          <Checkbox
                            checked={selected.includes(
                              (page - 1) * PCM_TRUNK_ITEMS_PER_PAGE + idx,
                            )}
                            onChange={() => handleSelectRow(idx)}
                            sx={checkboxSx}
                          />
                        </td>
                        <td style={{ ...cellStyle, ...lastRowCellStyle }}>
                          {trunk.index}
                        </td>
                        <td style={{ ...cellStyle, ...lastRowCellStyle }}>
                          {trunk.pcmNo}
                        </td>
                        <td style={{ ...cellStyle, ...lastRowCellStyle }}>
                          {trunk.ts
                            .map((checked, i) => (checked ? i : null))
                            .filter((i) => i !== null)
                            .join(",")}
                        </td>
                        <td
                          style={{
                            ...cellStyle,
                            borderRight: "none",
                            ...lastRowCellStyle,
                            ...(isLastRow
                              ? { borderBottomRightRadius: CARD_RADIUS }
                              : {}),
                          }}
                        >
                          <EditDocumentIcon
                            style={{
                              fontSize: 22,
                              color: "#2563eb",
                              cursor: "pointer",
                              opacity: 0.7,
                            }}
                            onClick={() => handleOpenModal(trunk, idx)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "7px 14px",
                borderTop: `1px solid ${C.cardBorder}`,
                background: "#ffffff",
                borderBottomLeftRadius: CARD_RADIUS,
                borderBottomRightRadius: CARD_RADIUS,
              }}
            >
              <span style={{ fontSize: 11, color: C.mutedText }}>
                Showing {pagedTrunks.length} record
                {pagedTrunks.length !== 1 ? "s" : ""} on page {page}
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  variant="outline"
                >
                  ← Prev
                </Btn>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: C.accent,
                    background: "#e0f2fe",
                    padding: "5px 14px",
                    borderRadius: 6,
                    border: `1px solid ${C.cardBorder}`,
                  }}
                >
                  Page {page} of {totalPages}
                </span>
                <Btn
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  variant="outline"
                >
                  Next →
                </Btn>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Modal Dialog */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth={false}
        sx={PCM_TRUNK_ADD_NEW_DIALOG_SX}
        PaperProps={{
          sx: PCM_TRUNK_ADD_NEW_DIALOG_PAPER_SX,
        }}
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle
          style={{
            background: "#1e2d42",
            color: "#ffffff",
            fontWeight: 600,
            fontSize: 16,
            padding: "16px 24px",
            textAlign: "center",
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
            flexShrink: 0,
          }}
        >
          {PCM_TRUNK_MODAL_TITLE}
        </DialogTitle>
        <DialogContent
          style={{
            padding: "24px",
            backgroundColor: "#ffffff",
            overflowY: "auto",
            flex: "1 1 auto",
          }}
        >
          <div style={pcmTrunkModalFormPanelStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <PcmTrunkFieldLabel
                tooltipKey="index"
                tooltips={PCM_TRUNK_FIELD_TOOLTIPS}
                style={{
                  width: 170,
                  flexShrink: 0,
                  fontSize: 13,
                  textAlign: "left",
                  whiteSpace: "nowrap",
                  display: "inline-block",
                }}
              >
                Index:
              </PcmTrunkFieldLabel>
              <div style={{ flex: 1, minWidth: 0, width: "100%" }}>
                <select
                  name="index"
                  value={form.index}
                  onChange={(e) =>
                    handleFormChange("index", Number(e.target.value))
                  }
                  style={pcmTrunkSelectStyle}
                  {...pcmTrunkInputInteraction}
                >
                  {PCM_TRUNK_INDEX_OPTIONS.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <PcmTrunkFieldLabel
                tooltipKey="pcmNo"
                tooltips={PCM_TRUNK_FIELD_TOOLTIPS}
                style={{
                  width: 170,
                  flexShrink: 0,
                  fontSize: 13,
                  textAlign: "left",
                  whiteSpace: "nowrap",
                  display: "inline-block",
                }}
              >
                PCM NO.:
              </PcmTrunkFieldLabel>
              <div style={{ flex: 1, minWidth: 0, width: "100%" }}>
                <select
                  name="pcmNo"
                  value={form.pcmNo}
                  onChange={(e) =>
                    handleFormChange("pcmNo", Number(e.target.value))
                  }
                  style={pcmTrunkSelectStyle}
                  {...pcmTrunkInputInteraction}
                >
                  {PCM_TRUNK_PCM_NO_OPTIONS.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <PcmTrunkFieldLabel
                tooltipKey="ts"
                tooltips={PCM_TRUNK_FIELD_TOOLTIPS}
                style={{
                  width: 170,
                  flexShrink: 0,
                  fontSize: 13,
                  textAlign: "left",
                  whiteSpace: "nowrap",
                  display: "inline-block",
                }}
              >
                Including Ts:
              </PcmTrunkFieldLabel>
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Checkbox
                  checked={checkAll}
                  onChange={handleCheckAllTs}
                  sx={{ p: 0.5 }}
                />
                <span style={{ fontSize: 13, fontWeight: 600 }}>Check All</span>
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: 0,
                border: `1px solid ${C.cardBorder}`,
                borderRadius: 4,
                background: "#fff",
                padding: 8,
                width: "100%",
              }}
            >
              {form.ts.map((checked, idx) => (
                <label
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: 13,
                    fontWeight: 500,
                    padding: "4px 4px",
                    minHeight: 28,
                    borderBottom: "1px solid #f1f5f9",
                    borderRight: "1px solid #f1f5f9",
                  }}
                >
                  <Checkbox
                    checked={checked}
                    onChange={() => handleTSChange(idx)}
                    sx={{ p: 0.5, mr: 0.5 }}
                  />
                  TS[{idx}]
                </label>
              ))}
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn variant="primary" onClick={handleSave} style={addNewModalFooterBtnStyle}>
            {PCM_TRUNK_SAVE_LABEL}
          </Btn>
          <Btn
            variant="cancel"
            onClick={handleCloseModal}
            style={{ ...addNewModalFooterBtnStyle, ...pcmTrunkModalCancelBtnStyle }}
          >
            {PCM_TRUNK_CLOSE_LABEL}
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PcmTrunkPage;
