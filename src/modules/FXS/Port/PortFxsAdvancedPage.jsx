import React from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import {
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  PORT_FXS_ADVANCED_TABLE_COLUMNS,
  PORT_FXS_ADVANCED_BATCH_MODIFY_TITLE,
  PORT_FXS_ADVANCED_BATCH_MODIFY_LABEL,
} from "../../../constants/PortFxsAdvancedPageConstants";
import {
  Btn,
  TH,
  ExtensionPagination as PortFxsAdvancedPagination,
} from "../../../components/common";
import { usePortFxsAdvancedPage } from "./hooks/usePortFxsAdvancedPage";
import {
  PortFxsAdvancedBreadcrumb,
  PortFxsAdvancedBatchModifyForm,
  PORT_FXS_ADVANCED_ADD_NEW_DIALOG_PAPER_SX,
  PORT_FXS_ADVANCED_ADD_NEW_DIALOG_SX,
  addNewModalBackdropSlotProps,
  addNewModalDialogContentSx,
  addNewModalFooterBtnStyle,
  addNewModalFooterCancelBtnStyle,
  addNewModalFooterStyle,
  fxsToolbarPrimaryBtnStyle,
  advancedFormPanelStyle,
  portFxsAdvancedCardStyle,
  portFxsAdvancedHeaderStyle,
  portFxsAdvancedPageInnerStyle,
  portFxsAdvancedPageWrapStyle,
  portFxsAdvancedPaginationStyle,
  portFxsAdvancedTableBodyStyle,
} from "./components/PortFxsAdvancedFormFields";
import {
  PCM_TRUNK_GROUP_TH_GAP,
  getPortFxsAdvancedRowBg,
  handlePortFxsAdvancedEditIconHover,
  portFxsAdvancedEditIconStyle,
  routeTdStyle,
  routeThExtra,
} from "./components/PortFxsAdvancedTableHelpers";

const PortFxsAdvancedPage = () => {
  const vm = usePortFxsAdvancedPage();
  const {
    ports,
    page,
    isModalOpen,
    batchForm,
    prohibitLimitCount,
    message,
    setMessage,
    totalPages,
    pagedPorts,
    handlePageChange,
    handleOpenModal,
    handleCloseModal,
    handleBatchModify,
    handleFormChange,
    handleCheckbox,
    handlePeriodCountChange,
    shouldShowField,
    handleSave,
    handleReset,
  } = vm;

  return (
    <div style={portFxsAdvancedPageWrapStyle}>
      <div style={portFxsAdvancedPageInnerStyle}>
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
            sx={{
              position: "fixed",
              top: 20,
              right: 20,
              zIndex: 9999,
              minWidth: 300,
              boxShadow: 3,
            }}
          >
            {message.text}
          </Alert>
        )}

        <PortFxsAdvancedBreadcrumb />

        <div style={portFxsAdvancedCardStyle}>
          <div style={portFxsAdvancedHeaderStyle}>
            <Btn
              onClick={handleBatchModify}
              variant="primary"
              style={fxsToolbarPrimaryBtnStyle}
            >
              {PORT_FXS_ADVANCED_BATCH_MODIFY_LABEL}
            </Btn>
          </div>

          <div style={portFxsAdvancedTableBodyStyle}>
            <table
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: 0,
                minWidth: 600,
              }}
            >
              <thead>
                <tr>
                  {PORT_FXS_ADVANCED_TABLE_COLUMNS.map((col) => (
                    <TH
                      key={col.key}
                      style={{
                        ...(col.key === "modify"
                          ? { width: 70, borderRight: "none" }
                          : {}),
                        ...routeThExtra,
                        ...PCM_TRUNK_GROUP_TH_GAP,
                      }}
                    >
                      {col.label}
                    </TH>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedPorts.map((port, idx) => {
                  const rowBg = getPortFxsAdvancedRowBg(idx);
                  const isLastRow = idx === pagedPorts.length - 1;
                  const lastRowCellStyle = isLastRow
                    ? { borderBottom: "none" }
                    : {};
                  return (
                    <tr
                      key={port.port}
                      style={{
                        background: rowBg,
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#f1f5f9";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = rowBg;
                      }}
                    >
                      {PORT_FXS_ADVANCED_TABLE_COLUMNS.map((col) => {
                        if (col.key === "modify") {
                          return (
                            <td
                              key={col.key}
                              style={{
                                ...routeTdStyle,
                                background: rowBg,
                                borderRight: "none",
                                ...lastRowCellStyle,
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "center" }}>
                                <EditDocumentIcon
                                  titleAccess="Edit"
                                  style={portFxsAdvancedEditIconStyle}
                                  onClick={() => handleOpenModal(port)}
                                  onMouseEnter={(e) =>
                                    handlePortFxsAdvancedEditIconHover(e, true)
                                  }
                                  onMouseLeave={(e) =>
                                    handlePortFxsAdvancedEditIconHover(e, false)
                                  }
                                />
                              </div>
                            </td>
                          );
                        }
                        return (
                          <td
                            key={col.key}
                            style={{
                              ...routeTdStyle,
                              background: rowBg,
                              ...lastRowCellStyle,
                            }}
                          >
                            {port[col.key]}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {ports.length > 0 && (
            <PortFxsAdvancedPagination
              page={page}
              totalPages={totalPages}
              recordCount={pagedPorts.length}
              onPageChange={handlePageChange}
              style={portFxsAdvancedPaginationStyle}
            />
          )}
        </div>

        <Dialog
          open={isModalOpen}
          onClose={handleCloseModal}
          maxWidth={false}
          slotProps={addNewModalBackdropSlotProps}
          sx={PORT_FXS_ADVANCED_ADD_NEW_DIALOG_SX}
          PaperProps={{
            sx: PORT_FXS_ADVANCED_ADD_NEW_DIALOG_PAPER_SX,
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
            {PORT_FXS_ADVANCED_BATCH_MODIFY_TITLE}
          </DialogTitle>
          <DialogContent
            style={{
              padding: "24px",
              backgroundColor: "#ffffff",
              flex: "1 1 auto",
            }}
            sx={addNewModalDialogContentSx}
          >
            <div style={advancedFormPanelStyle}>
              <PortFxsAdvancedBatchModifyForm
                batchForm={batchForm}
                prohibitLimitCount={prohibitLimitCount}
                handleFormChange={handleFormChange}
                handleCheckbox={handleCheckbox}
                handlePeriodCountChange={handlePeriodCountChange}
                handleSave={handleSave}
                shouldShowField={shouldShowField}
              />
            </div>
          </DialogContent>
          <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
            <Btn
              variant="primary"
              onClick={handleSave}
              style={addNewModalFooterBtnStyle}
            >
              Modify
            </Btn>
            <Btn
              variant="cancel"
              onClick={handleReset}
              style={addNewModalFooterCancelBtnStyle}
            >
              Reset
            </Btn>
            <Btn
              variant="cancel"
              onClick={handleCloseModal}
              style={addNewModalFooterCancelBtnStyle}
            >
              Close
            </Btn>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default PortFxsAdvancedPage;
