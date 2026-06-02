import React, { useState } from "react";
import { Alert, TextField } from "@mui/material";
import { QOS_INITIAL_FORM } from "../../../sections/advanced/constants/QosConstants";
import {
  Btn,
  muiTextFieldSx,
  AdvancedBreadcrumb,
  AdvancedPageShell,
  AdvancedFormCard,
  FieldRow,
  AdvancedCheckboxRow,
  advancedFormBtnStyle,
} from "../../../sections/advanced/advancedSharedUi";

const QosPage = () => {
  const [formData, setFormData] = useState(QOS_INITIAL_FORM);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const alert = (msg) => {
    const isSuccess = /successfully/i.test(String(msg));
    showToast(msg, isSuccess ? "success" : "error");
  };

  const handleSave = () => {
    if (formData.qosEnabled) {
      const mediaQos = parseInt(formData.mediaPremiumQos, 10);
      if (Number.isNaN(mediaQos) || mediaQos < 0 || mediaQos > 63) {
        alert("The range of 'Media Premium QoS' is 0~63!");
        return;
      }
      const controlQos = parseInt(formData.controlPremiumQos, 10);
      if (Number.isNaN(controlQos) || controlQos < 0 || controlQos > 63) {
        alert("The range of 'Control Premium QoS' is 0~63!");
        return;
      }
    }
    alert("Settings saved successfully!");
  };

  const handleReset = () => {
    setFormData(QOS_INITIAL_FORM);
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
      <AdvancedBreadcrumb current="QoS" />
      <AdvancedFormCard
        title="QoS"
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
        <AdvancedCheckboxRow
          id="qosEnabled"
          label="QoS"
          checked={formData.qosEnabled}
          onChange={() =>
            setFormData((prev) => ({
              ...prev,
              qosEnabled: !prev.qosEnabled,
            }))
          }
        />
        {formData.qosEnabled && (
          <>
            <FieldRow label="Media Premium QoS">
              <TextField
                id="mediaPremiumQos"
                fullWidth
                size="small"
                value={formData.mediaPremiumQos || ""}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "");
                  setFormData((prev) => ({ ...prev, mediaPremiumQos: v }));
                }}
                sx={muiTextFieldSx}
                inputProps={{
                  style: { fontSize: 13, padding: "6px 8px" },
                  maxLength: 2,
                }}
              />
            </FieldRow>
            <FieldRow label="Control Premium QoS">
              <TextField
                id="controlPremiumQos"
                fullWidth
                size="small"
                value={formData.controlPremiumQos || ""}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "");
                  setFormData((prev) => ({ ...prev, controlPremiumQos: v }));
                }}
                sx={muiTextFieldSx}
                inputProps={{
                  style: { fontSize: 13, padding: "6px 8px" },
                  maxLength: 2,
                }}
              />
            </FieldRow>
          </>
        )}
      </AdvancedFormCard>
    </AdvancedPageShell>
  );
};

export default QosPage;
