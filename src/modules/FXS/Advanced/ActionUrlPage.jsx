import React, { useState } from "react";
import { Alert, TextField } from "@mui/material";
import { ACTION_URL_INITIAL_FORM } from "../../../sections/advanced/constants/ActionUrlConstants";
import {
  Btn,
  muiTextFieldSx,
  AdvancedBreadcrumb,
  AdvancedPageShell,
  AdvancedFormCard,
  FieldRow,
  advancedFormBtnStyle,
} from "../../../shared/fxsSharedUi";

const ActionUrlPage = () => {
  const [formData, setFormData] = useState(ACTION_URL_INITIAL_FORM);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    showToast("Settings saved successfully!");
  };

  const handleReset = () => {
    setFormData(ACTION_URL_INITIAL_FORM);
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
      <AdvancedBreadcrumb current="Action URL" />
      <AdvancedFormCard
        title="Channel State Report Settings"
        footer={
          <>
            <Btn
              variant="primary"
              onClick={handleSave}
              style={advancedFormBtnStyle}
            >
              Save
            </Btn>
            <Btn
              variant="cancel"
              onClick={handleReset}
              style={advancedFormBtnStyle}
            >
              Reset
            </Btn>
          </>
        }
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            width: "100%",
            maxWidth: 560,
            margin: "0 auto",
            paddingBottom: 16,
          }}
        >
          <FieldRow label="Channel Pick up">
            <TextField
              fullWidth
              size="small"
              value={formData.chPickUpActionUrl || ""}
              onChange={(e) =>
                handleInputChange("chPickUpActionUrl", e.target.value)
              }
              placeholder="Enter URL to report pick up state"
              sx={muiTextFieldSx}
              inputProps={{
                style: { fontSize: 13, padding: "6px 8px" },
                maxLength: 256,
              }}
            />
          </FieldRow>
          <FieldRow label="Channel Hang up">
            <TextField
              fullWidth
              size="small"
              value={formData.chHangUpActionUrl || ""}
              onChange={(e) =>
                handleInputChange("chHangUpActionUrl", e.target.value)
              }
              placeholder="Enter URL to report hang up state"
              sx={muiTextFieldSx}
              inputProps={{
                style: { fontSize: 13, padding: "6px 8px" },
                maxLength: 256,
              }}
            />
          </FieldRow>
        </div>
      </AdvancedFormCard>
    </AdvancedPageShell>
  );
};

export default ActionUrlPage;
