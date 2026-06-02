import React, { useState } from "react";
import {
  DIALING_TIMEOUT_TABLE_COLUMNS,
  DIALING_TIMEOUT_INITIAL_FORM,
  DIALING_TIMEOUT_INITIAL_DATA,
} from "../../../sections/advanced/constants/DialingTimeoutConstants";
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
  Btn,
  TH,
  muiTextFieldSx,
  numManipulateCardStyle,
  routeTdStyle,
  routeThExtra,
  AdvancedBreadcrumb,
  AdvancedPageShell,
  FieldRow,
  advancedModalPaperSx,
  advancedModalTitleStyle,
  advancedModalContentStyle,
  advancedModalFooterStyle,
  advancedFormPanelStyle,
} from "../../../sections/advanced/advancedSharedUi";

const DialingTimeoutPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(DIALING_TIMEOUT_INITIAL_FORM);
  const [timeoutData, setTimeoutData] = useState(DIALING_TIMEOUT_INITIAL_DATA);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const alert = (msg) => {
    const isSuccess = /successfully/i.test(String(msg));
    showToast(msg, isSuccess ? "success" : "error");
  };

  const handleOpenModal = () => {
    setFormData({
      interDigitTimeout: String(timeoutData.interDigitTimeout),
      offHookTimeout: String(timeoutData.offHookTimeout),
      description: timeoutData.description || "example",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(DIALING_TIMEOUT_INITIAL_FORM);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!formData.description || formData.description.trim() === "") {
      alert("Description is required.");
      return;
    }

    if (
      !formData.interDigitTimeout ||
      formData.interDigitTimeout.trim() === ""
    ) {
      alert("Inter Digit Timeout is required.");
      return;
    }

    const interDigit = parseInt(formData.interDigitTimeout);
    if (isNaN(interDigit) || interDigit < 0) {
      alert("Inter Digit Timeout must be a valid positive number.");
      return;
    }

    if (!formData.offHookTimeout || formData.offHookTimeout.trim() === "") {
      alert("Off-hook Waiting Keypress Timeout is required.");
      return;
    }

    const offHook = parseInt(formData.offHookTimeout);
    if (isNaN(offHook) || offHook < 0) {
      alert(
        "Off-hook Waiting Keypress Timeout must be a valid positive number.",
      );
      return;
    }

    setTimeoutData({
      ...timeoutData,
      interDigitTimeout: interDigit,
      offHookTimeout: offHook,
      description: formData.description.trim(),
    });

    alert("Dialing timeout settings saved successfully!");
    handleCloseModal();
  };

  const handleKeyPress = (e) => {
    const key = e.keyCode || e.which;
    if (!((key >= 48 && key <= 57) || key === 8 || key === 127)) {
      e.preventDefault();
    }
  };

  return (
    <AdvancedPageShell>
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={() => setToast({ msg: "", type: "success" })}
          sx={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            minWidth: 300,
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            fontWeight: 500,
          }}
        >
          {toast.msg}
        </Alert>
      )}
      <AdvancedBreadcrumb current="Dialing Timeout" />
      <div style={numManipulateCardStyle}>
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: 0,
            }}
          >
            <thead>
              <tr>
                <TH style={{ width: 70, ...routeThExtra }}>Modify</TH>
                {DIALING_TIMEOUT_TABLE_COLUMNS.filter(
                  (c) => c.key !== "modify",
                ).map((col) => (
                  <TH
                    key={col.key}
                    style={{
                      ...routeThExtra,
                      ...(col.key === "description"
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
                <td
                  style={{
                    ...routeTdStyle,
                    borderLeft: "none",
                    borderBottom: "none",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <EditDocumentIcon
                      titleAccess="Edit"
                      style={{
                        cursor: "pointer",
                        color: "#2563eb",
                        fontSize: 22,
                        opacity: 0.7,
                        transition: "opacity 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = "1";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = "0.7";
                      }}
                      onClick={handleOpenModal}
                    />
                  </div>
                </td>
                <td
                  style={{
                    ...routeTdStyle,
                    borderBottom: "none",
                  }}
                >
                  {timeoutData.interDigitTimeout}
                </td>
                <td
                  style={{
                    ...routeTdStyle,
                    borderBottom: "none",
                  }}
                >
                  {timeoutData.offHookTimeout}
                </td>
                <td
                  style={{
                    ...routeTdStyle,
                    borderRight: "none",
                    borderBottom: "none",
                  }}
                >
                  {timeoutData.description}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth={false}
        PaperProps={{ sx: advancedModalPaperSx }}
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle style={advancedModalTitleStyle}>
          Dialing Timeout
        </DialogTitle>
        <DialogContent style={advancedModalContentStyle}>
          <div style={advancedFormPanelStyle}>
            <FieldRow label="Description:">
              <TextField
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                size="small"
                fullWidth
                variant="outlined"
                sx={muiTextFieldSx}
                inputProps={{
                  style: { fontSize: 13, padding: "6px 8px" },
                }}
              />
            </FieldRow>
            <FieldRow label="Inter Digit Timeout (s):">
              <TextField
                name="interDigitTimeout"
                value={formData.interDigitTimeout || ""}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                size="small"
                fullWidth
                variant="outlined"
                sx={muiTextFieldSx}
                inputProps={{
                  style: { fontSize: 13, padding: "6px 8px" },
                }}
              />
            </FieldRow>
            <FieldRow label="Off-hook waiting digit timeout(s):" labelWidth={220}>
              <TextField
                name="offHookTimeout"
                value={formData.offHookTimeout || ""}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                size="small"
                fullWidth
                variant="outlined"
                sx={muiTextFieldSx}
                inputProps={{
                  style: { fontSize: 13, padding: "6px 8px" },
                }}
              />
            </FieldRow>
          </div>
        </DialogContent>
        <DialogActions style={advancedModalFooterStyle}>
          <Btn
            variant="primary"
            onClick={handleSave}
            style={{ minWidth: 100, height: 34, fontSize: 13 }}
          >
            Save
          </Btn>
          <Btn
            variant="cancel"
            onClick={handleCloseModal}
            style={{ minWidth: 100, height: 34 }}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>
    </AdvancedPageShell>
  );
};

export default DialingTimeoutPage;
