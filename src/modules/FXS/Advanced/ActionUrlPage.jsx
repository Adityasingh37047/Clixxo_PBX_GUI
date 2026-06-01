import React, { useState } from "react";
import { TextField } from "@mui/material";
import { ACTION_URL_INITIAL_FORM } from "../../../sections/advanced/constants/ActionUrlConstants";
import {
  Btn,
  muiTextFieldSx,
  numManipulateCardStyle,
  AdvancedBreadcrumb,
  FieldRow,
  SectionHeading,
  advancedFormPanelStyle,
  advancedFormActionsStyle,
  advancedPageWrapStyle,
  advancedPageInnerStyle,
} from "../../../sections/advanced/advancedSharedUi";

const ActionUrlPage = () => {
  const [formData, setFormData] = useState(ACTION_URL_INITIAL_FORM);
  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    showMessage("success", "Settings saved successfully!");
  };

  const handleReset = () => {
    setFormData(ACTION_URL_INITIAL_FORM);
  };

  return (
    <div style={advancedPageWrapStyle}>
      <div style={advancedPageInnerStyle}>
        {message.text && (
          <div
            style={{
              background:
                message.type === "error"
                  ? "#fef2f2"
                  : message.type === "success"
                    ? "#f0fdf4"
                    : "#eff6ff",
              borderLeft: `3px solid ${message.type === "error" ? "#f87171" : message.type === "success" ? "#4ade80" : "#60a5fa"}`,
              color:
                message.type === "error"
                  ? "#b91c1c"
                  : message.type === "success"
                    ? "#166534"
                    : "#1e40af",
              padding: "10px 14px",
              borderRadius: 6,
              marginBottom: 12,
              fontSize: 13,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>{message.text}</span>
            <span
              onClick={() => setMessage({ type: "", text: "" })}
              style={{ cursor: "pointer", fontSize: 16 }}
            >
              ✕
            </span>
          </div>
        )}

        <AdvancedBreadcrumb current="Action URL" />

        <div style={numManipulateCardStyle}>
          <div style={{ padding: 24 }}>
            <SectionHeading title="Channel State Report Settings" />

            <div style={advancedFormPanelStyle}>
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
          </div>

          <div style={advancedFormActionsStyle}>
            <Btn
              variant="primary"
              onClick={handleSave}
              style={{ height: 33, minWidth: 100 }}
            >
              Save
            </Btn>
            <Btn
              variant="cancel"
              onClick={handleReset}
              style={{ height: 33, minWidth: 100 }}
            >
              Reset
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionUrlPage;
