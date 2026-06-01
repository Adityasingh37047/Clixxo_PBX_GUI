import React, { useState } from "react";
import {
  AREA_OPTIONS,
  AREA_SELECT_INITIAL_FORM,
} from "../../../sections/advanced/constants/AreaSelectConstants";
import { Select as MuiSelect, MenuItem, FormControl } from "@mui/material";
import {
  Btn,
  muiSelectSx,
  numManipulateCardStyle,
  AdvancedBreadcrumb,
  FieldRow,
  SectionHeading,
  advancedFormPanelStyle,
  advancedFormActionsStyle,
  advancedPageWrapStyle,
  advancedPageInnerStyle,
} from "../../../sections/advanced/advancedSharedUi";

const AreaSelectPage = () => {
  const [formData, setFormData] = useState(AREA_SELECT_INITIAL_FORM);
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

        <AdvancedBreadcrumb current="Area Select" />

        <div style={numManipulateCardStyle}>
          <div style={{ padding: 24 }}>
            <SectionHeading title="Select Area for Parameters" />

            <div style={advancedFormPanelStyle}>
              <FieldRow label="Area Parameters">
                <FormControl size="small" sx={{ width: "100%" }}>
                  <MuiSelect
                    value={formData.areaSelect}
                    onChange={(e) =>
                      handleInputChange("areaSelect", e.target.value)
                    }
                    sx={muiSelectSx}
                  >
                    {AREA_OPTIONS.map((opt) => (
                      <MenuItem
                        key={opt.value}
                        value={opt.value}
                        sx={{ fontSize: 13 }}
                      >
                        {opt.label}
                      </MenuItem>
                    ))}
                  </MuiSelect>
                </FormControl>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default AreaSelectPage;
