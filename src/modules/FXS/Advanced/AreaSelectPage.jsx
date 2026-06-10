import React, { useState } from "react";
import { Alert, Select as MuiSelect, MenuItem, FormControl } from "@mui/material";
import {
  AREA_OPTIONS,
  AREA_SELECT_INITIAL_FORM,
} from "../../../sections/advanced/constants/AreaSelectConstants";
import {
  Btn,
  muiSelectSx,
  AdvancedBreadcrumb,
  AdvancedPageShell,
  AdvancedFormCard,
  FieldRow,
  advancedFormBtnStyle,
} from "../../../shared/fxsSharedUi";

const AreaSelectPage = () => {
  const [formData, setFormData] = useState(AREA_SELECT_INITIAL_FORM);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const handleSave = () => {
    showToast("Settings saved successfully!");
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
      <AdvancedBreadcrumb current="Area Select" />
      <AdvancedFormCard
        title="Select Area for Parameters"
        footer={
          <Btn
            variant="primary"
            onClick={handleSave}
            style={advancedFormBtnStyle}
          >
            Save
          </Btn>
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
          <FieldRow label="Area Parameters">
            <FormControl size="small" fullWidth>
              <MuiSelect
                value={formData.areaSelect}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    areaSelect: e.target.value,
                  }))
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
      </AdvancedFormCard>
    </AdvancedPageShell>
  );
};

export default AreaSelectPage;
