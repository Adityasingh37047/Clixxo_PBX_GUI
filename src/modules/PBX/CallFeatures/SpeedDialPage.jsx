import React from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Alert,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { C } from "../../../theme/pbxTokens";
import {
  SPEED_DIAL_BTN_CLEAR_ALL,
  SPEED_DIAL_TITLE,
} from "../../../constants/SpeedDialConstants";
import {
  Btn,
  TH,
  tdStyle,
  ExtensionBreadcrumb as SpeedDialBreadcrumb,
  ExtensionTableListLoading as SpeedDialTableListLoading,
  ExtensionTableListEmptyState as SpeedDialTableListEmptyState,
  ExtensionPagination as SpeedDialPagination,
  extensionTableCheckboxSx as speedDialTableCheckboxSx,
  extensionFixedAlertSx as speedDialFixedAlertSx,
  extensionPageWrapStyle as speedDialPageWrapStyle,
  extensionPageInnerStyle as speedDialPageInnerStyle,
  extensionCardStyle as speedDialCardStyle,
  extensionToolbarStyle as speedDialToolbarStyle,
  extensionSelectedBadgeStyle as speedDialSelectedBadgeStyle,
  extensionCancelBtnStyle as speedDialCancelBtnStyle,
  extensionPrimaryBtnStyle as speedDialPrimaryBtnStyle,
} from "../../../components/common";
import { useSpeedDialPage } from "./hooks/useSpeedDialPage";
import {
  addNewModalFooterBtnStyle,
  addNewModalFooterStyle,
  SpeedDialFieldRow,
  speedDialImportDropzoneStyle,
  speedDialModalCancelBtnStyle,
  speedDialModalFormStyle,
  speedDialModalPaperSx,
  speedDialModalTextFieldFullSx,
  speedDialModalTitleStyle,
} from "./components/SpeedDialFormFields";
import {
  getSpeedDialRowBg,
  handleSpeedDialEditIconHover,
  speedDialEditIconStyle,
} from "./components/SpeedDialTableHelpers";

const SpeedDialPage = () => {
  const vm = useSpeedDialPage();
  const {
    isCompact,
    rows,
    selected,
    showModal,
    loading,
    message,
    setMessage,
    isInitialLoad,
    itemsPerPage,
    page,
    setPage,
    totalPages,
    pagedRows,
    filteredRows,
    editId,
    name,
    setName,
    speedDialNumber,
    setSpeedDialNumber,
    destination,
    setDestination,
    showImportModal,
    importFile,
    importLoading,
    importResult,
    importFileRef,
    allPageSelected,
    somePageSelected,
    handleToggleRow,
    handleToggleAll,
    handleDelete,
    handleClearAll,
    handleOpenAddModal,
    handleOpenEditModal,
    handleCloseModal,
    handleSave,
    handleExport,
    handleOpenImportModal,
    handleCloseImportModal,
    handleImportFileChange,
    handleImportSubmit,
    handleImportCancel,
  } = vm;

  return (
    <div
      style={{
        ...speedDialPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={speedDialPageInnerStyle}>
        {message.text && (
          <Alert
            severity={
              message.type === "error"
                ? "error"
                : message.type === "success"
                  ? "success"
                  : "info"
            }
            onClose={() => setMessage({ type: "", text: "" })}
            sx={speedDialFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <SpeedDialBreadcrumb
          section="Call Features"
          current={SPEED_DIAL_TITLE}
        />

        <div style={speedDialCardStyle}>
          <div
            style={{
              ...speedDialToolbarStyle,
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
                flexWrap: "wrap",
              }}
            >
              {selected.length > 0 && (
                <span style={speedDialSelectedBadgeStyle}>
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
                onClick={handleClearAll}
                disabled={loading.delete || loading.list || rows.length === 0}
                variant="cancel"
                style={speedDialCancelBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={12} color="inherit" />
                ) : null}
                {SPEED_DIAL_BTN_CLEAR_ALL}
              </Btn>
              <Btn
                onClick={handleDelete}
                disabled={
                  loading.delete || loading.list || selected.length === 0
                }
                variant="cancel"
                style={speedDialCancelBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={12} color="inherit" />
                ) : (
                  <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                )}
                Delete
              </Btn>
              <Btn
                onClick={handleOpenImportModal}
                variant="cancel"
                style={speedDialCancelBtnStyle}
              >
                ⬇ Import
              </Btn>
              <Btn
                onClick={handleExport}
                variant="cancel"
                style={speedDialCancelBtnStyle}
              >
                ⬆ Export
              </Btn>
              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.list}
                variant="primary"
                style={speedDialPrimaryBtnStyle}
              >
                + Add New
              </Btn>
            </div>
          </div>

          <div
            style={{
              overflowX: "hidden",
              overflowY: "auto",
              flex: 1,
              ...(isCompact
                ? { overflowX: "auto", WebkitOverflowScrolling: "touch" }
                : {}),
            }}
          >
            {isInitialLoad ? (
              <SpeedDialTableListLoading />
            ) : rows.length === 0 ? (
              <SpeedDialTableListEmptyState
                message="No speed dials found."
                onAddNew={handleOpenAddModal}
              />
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  tableLayout: "auto",
                }}
              >
                <thead>
                  <tr>
                    <TH
                      style={{
                        width: 40,
                        padding: 0,
                        borderLeft: "none",
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                      }}
                    >
                      <Checkbox
                        size="small"
                        checked={allPageSelected}
                        indeterminate={somePageSelected}
                        onChange={handleToggleAll}
                        sx={speedDialTableCheckboxSx}
                      />
                    </TH>
                    <TH
                      style={{
                        width: 36,
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                      }}
                    >
                      ID
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Name
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Speed Dial Number
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Destination
                    </TH>
                    <TH
                      style={{
                        width: 70,
                        borderRight: "none",
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                      }}
                    >
                      Modify
                    </TH>
                  </tr>
                </thead>
                <tbody>
                  {pagedRows.map((row, idx) => {
                    const realIdx = (page - 1) * itemsPerPage + idx;
                    const isSelected = selected.includes(realIdx);
                    const isLastRow = idx === pagedRows.length - 1;
                    const rowBg = getSpeedDialRowBg(isSelected, idx);
                    const lastRowCellStyle = {
                      borderBottom: isLastRow
                        ? "none"
                        : tdStyle.borderBottom,
                    };

                    return (
                      <tr
                        key={row.id || realIdx}
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
                            ...tdStyle,
                            background: rowBg,
                            borderLeft: "none",
                            ...lastRowCellStyle,
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => handleToggleRow(realIdx)}
                            sx={speedDialTableCheckboxSx}
                          />
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {realIdx + 1}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.name}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.speedDialNumber}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.destination}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
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
                              onClick={() => handleOpenEditModal(row)}
                              style={speedDialEditIconStyle}
                              onMouseEnter={(e) =>
                                handleSpeedDialEditIconHover(e, true)
                              }
                              onMouseLeave={(e) =>
                                handleSpeedDialEditIconHover(e, false)
                              }
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

          {!isInitialLoad && rows.length > 0 && filteredRows.length > 0 && (
            <SpeedDialPagination
              page={page}
              totalPages={totalPages}
              recordCount={pagedRows.length}
              onPageChange={(p) =>
                setPage(Math.min(totalPages, Math.max(1, p)))
              }
            />
          )}
        </div>
      </div>

      <Dialog
        open={showModal}
        onClose={loading.save ? null : handleCloseModal}
        maxWidth={false}
        sx={{
          "& .MuiDialog-container": {
            alignItems: "center",
            justifyContent: "center",
          },
        }}
        PaperProps={{
          sx: {
            ...speedDialModalPaperSx,
            borderRadius:
              editId == null ? "4px" : speedDialModalPaperSx.borderRadius,
          },
        }}
      >
        <DialogTitle style={speedDialModalTitleStyle}>
          {editId != null
            ? `Edit ${SPEED_DIAL_TITLE}`
            : `Add ${SPEED_DIAL_TITLE}`}
        </DialogTitle>

        <DialogContent style={{ padding: "24px", backgroundColor: "#ffffff" }}>
          <div style={speedDialModalFormStyle}>
            <SpeedDialFieldRow label="Name" tooltipKey="name" required>
              <TextField
                size="small"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                sx={speedDialModalTextFieldFullSx}
              />
            </SpeedDialFieldRow>

            <SpeedDialFieldRow
              label="Speed Dial Number"
              tooltipKey="speed_dial_number"
              required
            >
              <TextField
                size="small"
                fullWidth
                value={speedDialNumber}
                onChange={(e) => setSpeedDialNumber(e.target.value)}
                sx={speedDialModalTextFieldFullSx}
              />
            </SpeedDialFieldRow>

            <SpeedDialFieldRow
              label="Destination"
              tooltipKey="destination"
              required
            >
              <TextField
                size="small"
                fullWidth
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                sx={speedDialModalTextFieldFullSx}
              />
            </SpeedDialFieldRow>
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn
            onClick={handleSave}
            disabled={loading.save}
            variant="primary"
            style={addNewModalFooterBtnStyle}
          >
            {loading.save ? (
              <>
                <CircularProgress size={13} sx={{ color: "#fff", mr: 1 }} />
                Saving...
              </>
            ) : editId != null ? (
              "Update Speed Dial"
            ) : (
              "Create Speed Dial"
            )}
          </Btn>
          <Btn
            onClick={handleCloseModal}
            disabled={loading.save}
            variant="cancel"
            style={speedDialModalCancelBtnStyle}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showImportModal}
        onClose={handleCloseImportModal}
        maxWidth={false}
        sx={{
          "& .MuiDialog-container": {
            alignItems: "center",
            justifyContent: "center",
          },
        }}
        PaperProps={{ sx: speedDialModalPaperSx }}
      >
        <DialogTitle style={speedDialModalTitleStyle}>
          Import {SPEED_DIAL_TITLE}
        </DialogTitle>
        <DialogContent style={{ padding: "24px", backgroundColor: "#ffffff" }}>
          <div
            style={speedDialImportDropzoneStyle}
            onClick={() => importFileRef.current?.click()}
          >
            <div
              style={{
                fontSize: 13,
                color: importFile ? C.successGreen : C.mutedText,
                fontWeight: importFile ? 600 : 400,
              }}
            >
              {importFile ? importFile.name : "Click to choose CSV file"}
            </div>
            <input
              ref={importFileRef}
              type="file"
              accept=".csv"
              style={{ display: "none" }}
              onChange={(e) => {
                handleImportFileChange(e.target.files?.[0] || null);
              }}
            />
          </div>

          {importResult && (
            <div
              style={{
                background: importResult.response ? "#f0fdf4" : "#fef2f2",
                border: `1px solid ${importResult.response ? "#86efac" : "#fca5a5"}`,
                borderRadius: 6,
                padding: "10px 14px",
                marginTop: 16,
              }}
            >
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: importResult.response ? C.successGreen : C.errorRed,
                  marginBottom: 4,
                }}
              >
                {importResult.response
                  ? "Import complete"
                  : importResult.error ||
                    "Validation failed — fix errors and retry"}
              </p>
              <div
                style={{
                  fontSize: 12,
                  color: "#374151",
                  display: "flex",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                {importResult.total != null && (
                  <span>
                    Total: <b>{importResult.total}</b>
                  </span>
                )}
                {importResult.created_count != null && (
                  <span>
                    Created:{" "}
                    <b style={{ color: C.successGreen }}>
                      {importResult.created_count}
                    </b>
                  </span>
                )}
                {importResult.invalid_rows != null &&
                  importResult.invalid_rows > 0 && (
                    <span>
                      Invalid rows:{" "}
                      <b style={{ color: "#d97706" }}>
                        {importResult.invalid_rows}
                      </b>
                    </span>
                  )}
                {importResult.would_create != null && (
                  <span>
                    Would create:{" "}
                    <b style={{ color: C.successGreen }}>
                      {importResult.would_create}
                    </b>
                  </span>
                )}
              </div>
              {importResult.validation_errors?.length > 0 && (
                <div
                  style={{ marginTop: 8, maxHeight: 180, overflowY: "auto" }}
                >
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: C.errorRed,
                      marginBottom: 4,
                    }}
                  >
                    Validation Errors (
                    {importResult.invalid_rows ??
                      importResult.validation_errors.length}{" "}
                    row{importResult.validation_errors.length !== 1 ? "s" : ""})
                  </p>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: 11,
                    }}
                  >
                    <thead>
                      <tr style={{ background: "#fee2e2" }}>
                        {["Row", "Speed Number", "Field", "Error"].map((h) => (
                          <th
                            key={h}
                            style={{
                              padding: "3px 6px",
                              textAlign: "left",
                              borderBottom: "1px solid #fca5a5",
                              color: "#7f1d1d",
                              fontWeight: 600,
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {importResult.validation_errors.flatMap((ve, vi) =>
                        (ve.errors || []).map((err, ei) => (
                          <tr
                            key={`${vi}-${ei}`}
                            style={{
                              background: vi % 2 === 0 ? "#fff" : "#fff7f7",
                            }}
                          >
                            <td
                              style={{
                                padding: "2px 6px",
                                borderBottom: "1px solid #fee2e2",
                              }}
                            >
                              {ve.row}
                            </td>
                            <td
                              style={{
                                padding: "2px 6px",
                                borderBottom: "1px solid #fee2e2",
                                fontFamily: "monospace",
                              }}
                            >
                              {ve.speed_number ?? "—"}
                            </td>
                            <td
                              style={{
                                padding: "2px 6px",
                                borderBottom: "1px solid #fee2e2",
                                fontFamily: "monospace",
                              }}
                            >
                              {err.field}
                            </td>
                            <td
                              style={{
                                padding: "2px 6px",
                                borderBottom: "1px solid #fee2e2",
                                color: C.errorRed,
                              }}
                            >
                              {err.error}
                            </td>
                          </tr>
                        )),
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn
            onClick={handleImportSubmit}
            disabled={importLoading || !importFile}
            variant="primary"
            style={addNewModalFooterBtnStyle}
          >
            {importLoading ? (
              <>
                <CircularProgress size={13} sx={{ color: "#fff", mr: 1 }} />
                Importing...
              </>
            ) : (
              "Import"
            )}
          </Btn>
          <Btn
            onClick={handleImportCancel}
            disabled={importLoading}
            variant="cancel"
            style={speedDialModalCancelBtnStyle}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SpeedDialPage;
