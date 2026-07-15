import React from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import {
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import {
  DIALING_TIMEOUT_TABLE_COLUMNS,
  DIALING_TIMEOUT_CARD_TITLE,
  DIALING_TIMEOUT_MODAL_TITLE,
} from "../../../constants/DialingTimeoutConstants";
import { Btn } from "../../../components/common";
import { useDialingTimeoutPage } from "./hooks/useDialingTimeoutPage";
import {
  DialingTimeoutBreadcrumb,
  DialingTimeoutFieldRow,
  DialingTimeoutPageShell,
  DIALING_TIMEOUT_ADD_NEW_DIALOG_PAPER_SX,
  DIALING_TIMEOUT_ADD_NEW_DIALOG_SX,
  DIALING_TIMEOUT_FIELD_LABEL_WIDTH,
  dialingTimeoutAddHostFormPanelStyle,
  dialingTimeoutAddNewModalBackdropSlotProps,
  dialingTimeoutAddNewModalDialogContentSx,
  dialingTimeoutAddNewModalFooterBtnStyle,
  dialingTimeoutAddNewModalFooterCancelBtnStyle,
  dialingTimeoutAddNewModalFooterStyle,
  dialingTimeoutAdvancedModalTitleStyle,
  dialingTimeoutInputProps,
  dialingTimeoutModalDialogContentStyle,
  dialingTimeoutTextFieldSx,
} from "./components/DialingTimeoutFormFields";
import {
  TH,
  dialingTimeoutCardStyle,
  dialingTimeoutFixedAlertSx,
  dialingTimeoutHeaderStyle,
  dialingTimeoutHeaderTitleStyle,
  dialingTimeoutTableBodyStyle,
  dialingTimeoutTableStyle,
  dialingTimeoutEditIconStyle,
  handleDialingTimeoutEditIconHover,
  routeTdStyle,
  routeThExtra,
} from "./components/DialingTimeoutTableHelpers";

const DialingTimeoutPage = () => {
  const vm = useDialingTimeoutPage();
  const {
    isModalOpen,
    formData,
    timeoutData,
    toast,
    clearToast,
    handleOpenModal,
    handleCloseModal,
    handleInputChange,
    handleSave,
    handleKeyPress,
  } = vm;

  return (
    <DialingTimeoutPageShell>
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={clearToast}
          sx={dialingTimeoutFixedAlertSx}
        >
          {toast.msg}
        </Alert>
      )}

      <DialingTimeoutBreadcrumb />

      <div style={dialingTimeoutCardStyle}>
        <div style={dialingTimeoutHeaderStyle}>
          <span style={dialingTimeoutHeaderTitleStyle}>
            {DIALING_TIMEOUT_CARD_TITLE}
          </span>
        </div>

        <div style={dialingTimeoutTableBodyStyle}>
          <table style={dialingTimeoutTableStyle}>
            <thead>
              <tr>
                {DIALING_TIMEOUT_TABLE_COLUMNS.map((col, colIdx) => (
                  <TH
                    key={col.key}
                    style={{
                      ...routeThExtra,
                      ...(col.key === "modify" ? { width: 70 } : {}),
                      ...(colIdx === 0 ? { borderLeft: "none" } : {}),
                      ...(colIdx === DIALING_TIMEOUT_TABLE_COLUMNS.length - 1
                        ? { borderRight: "none" }
                        : {}),
                    }}
                  >
                    {col.label}
                  </TH>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {DIALING_TIMEOUT_TABLE_COLUMNS.map((col, colIdx) => (
                  <td
                    key={col.key}
                    style={{
                      ...routeTdStyle,
                      borderBottom: "none",
                      ...(colIdx === 0 ? { borderLeft: "none" } : {}),
                      ...(colIdx === DIALING_TIMEOUT_TABLE_COLUMNS.length - 1
                        ? { borderRight: "none" }
                        : {}),
                    }}
                  >
                    {col.key === "modify" ? (
                      <div
                        style={{ display: "flex", justifyContent: "center" }}
                      >
                        <EditDocumentIcon
                          titleAccess="Edit"
                          style={dialingTimeoutEditIconStyle}
                          onMouseEnter={(e) =>
                            handleDialingTimeoutEditIconHover(e, true)
                          }
                          onMouseLeave={(e) =>
                            handleDialingTimeoutEditIconHover(e, false)
                          }
                          onClick={handleOpenModal}
                        />
                      </div>
                    ) : (
                      timeoutData[col.key]
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth={false}
        slotProps={dialingTimeoutAddNewModalBackdropSlotProps}
        sx={DIALING_TIMEOUT_ADD_NEW_DIALOG_SX}
        PaperProps={{ sx: DIALING_TIMEOUT_ADD_NEW_DIALOG_PAPER_SX }}
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle style={dialingTimeoutAdvancedModalTitleStyle}>
          {DIALING_TIMEOUT_MODAL_TITLE}
        </DialogTitle>
        <DialogContent
          style={dialingTimeoutModalDialogContentStyle}
          sx={dialingTimeoutAddNewModalDialogContentSx}
        >
          <div style={dialingTimeoutAddHostFormPanelStyle}>
            <DialingTimeoutFieldRow
              label="Description:"
              labelWidth={DIALING_TIMEOUT_FIELD_LABEL_WIDTH}
              tooltipKey="description"
            >
              <TextField
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                size="small"
                fullWidth
                variant="outlined"
                sx={dialingTimeoutTextFieldSx}
                inputProps={dialingTimeoutInputProps}
              />
            </DialingTimeoutFieldRow>
            <DialingTimeoutFieldRow
              label="Inter Digit Timeout (s):"
              labelWidth={DIALING_TIMEOUT_FIELD_LABEL_WIDTH}
              tooltipKey="interDigitTimeout"
            >
              <TextField
                name="interDigitTimeout"
                value={formData.interDigitTimeout || ""}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                size="small"
                fullWidth
                variant="outlined"
                sx={dialingTimeoutTextFieldSx}
                inputProps={dialingTimeoutInputProps}
              />
            </DialingTimeoutFieldRow>
            <DialingTimeoutFieldRow
              label="Off-hook waiting digit timeout(s):"
              labelWidth={DIALING_TIMEOUT_FIELD_LABEL_WIDTH}
              tooltipKey="offHookTimeout"
            >
              <TextField
                name="offHookTimeout"
                value={formData.offHookTimeout || ""}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                size="small"
                fullWidth
                variant="outlined"
                sx={dialingTimeoutTextFieldSx}
                inputProps={dialingTimeoutInputProps}
              />
            </DialingTimeoutFieldRow>
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 0, m: 0 }} style={dialingTimeoutAddNewModalFooterStyle}>
          <Btn
            variant="primary"
            onClick={handleSave}
            style={dialingTimeoutAddNewModalFooterBtnStyle}
          >
            Save
          </Btn>
          <Btn
            variant="cancel"
            onClick={handleCloseModal}
            style={dialingTimeoutAddNewModalFooterCancelBtnStyle}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>
    </DialingTimeoutPageShell>
  );
};

export default DialingTimeoutPage;
