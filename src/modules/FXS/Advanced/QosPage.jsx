import React, { useState } from "react";
import { Alert, TextField } from "@mui/material";
import { QOS_INITIAL_FORM } from "../../../sections/advanced/constants/QosConstants";
import {
  Btn,
  C,
  muiTextFieldSx,
  AdvancedBreadcrumb,
  AdvancedPageShell,
  AdvancedFormCard,
  FormEnableCheckbox,
  advancedFormBtnStyle,
} from "../../../sections/advanced/advancedSharedUi";

const FIELD_LABEL_WIDTH = 170;
const FIELD_GAP = 12;
const QOS_INPUT_WIDTH = 160; // half of 320px control column

const qosInputFieldSx = {
  ...muiTextFieldSx,
  width: QOS_INPUT_WIDTH,
  maxWidth: "50%",
};

const qosLabelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: C.labelText,
  width: FIELD_LABEL_WIDTH,
  flexShrink: 0,
  textAlign: "left",
};

const qosControlColBase = {
  width: "min(100%, 320px)",
  flexShrink: 0,
  boxSizing: "border-box",
};

/** Checkbox column — Enable control starts here */
const qosCheckboxColStyle = {
  ...qosControlColBase,
  paddingLeft: 6,
};

/** Input column — left edge lines up with checkbox icon (6px col + 4px MUI checkbox padding) */
const qosInputColStyle = {
  ...qosControlColBase,
  paddingLeft: 10,
};

const QosFieldRow = ({ label, labelFor, children, inputAlign = false }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      gap: FIELD_GAP,
      minHeight: 32,
    }}
  >
    <label htmlFor={labelFor} style={qosLabelStyle}>
      {label}
    </label>
    <div style={inputAlign ? qosInputColStyle : qosCheckboxColStyle}>
      {children}
    </div>
  </div>
);

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
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            paddingBottom: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              width: "fit-content",
              maxWidth: "100%",
            }}
          >
            <QosFieldRow label="QoS" labelFor="qosEnabled">
              <FormEnableCheckbox
                id="qosEnabled"
                checked={formData.qosEnabled}
                onChange={() =>
                  setFormData((prev) => ({
                    ...prev,
                    qosEnabled: !prev.qosEnabled,
                  }))
                }
              />
            </QosFieldRow>
            {formData.qosEnabled && (
              <>
                <QosFieldRow
                  label="Media Premium QoS"
                  labelFor="mediaPremiumQos"
                  inputAlign
                >
                  <TextField
                    id="mediaPremiumQos"
                    size="small"
                    value={formData.mediaPremiumQos || ""}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "");
                      setFormData((prev) => ({
                        ...prev,
                        mediaPremiumQos: v,
                      }));
                    }}
                    sx={qosInputFieldSx}
                    inputProps={{
                      style: { fontSize: 13, padding: "6px 8px" },
                      maxLength: 2,
                    }}
                  />
                </QosFieldRow>
                <QosFieldRow
                  label="Control Premium QoS"
                  labelFor="controlPremiumQos"
                  inputAlign
                >
                  <TextField
                    id="controlPremiumQos"
                    size="small"
                    value={formData.controlPremiumQos || ""}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "");
                      setFormData((prev) => ({
                        ...prev,
                        controlPremiumQos: v,
                      }));
                    }}
                    sx={qosInputFieldSx}
                    inputProps={{
                      style: { fontSize: 13, padding: "6px 8px" },
                      maxLength: 2,
                    }}
                  />
                </QosFieldRow>
              </>
            )}
          </div>
        </div>
      </AdvancedFormCard>
    </AdvancedPageShell>
  );
};

export default QosPage;
