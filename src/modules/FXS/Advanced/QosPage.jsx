import React from "react";
import { Alert, Checkbox } from "@mui/material";
import {
  QOS_CARD_TITLE,
  QOS_RESET_LABEL,
  QOS_SAVE_LABEL,
  QOS_PAGE_BREADCRUMB_SECTION,
  QOS_PAGE_TITLE,
} from "../../../constants/QosConstants";
import {
  Btn,
  ExtensionBreadcrumb as QosBreadcrumb,
  extensionPageWrapStyle as qosPageWrapStyle,
  extensionCardStyle as qosCardStyle,
  extensionFixedAlertSx as qosFixedAlertSx,
} from "../../../components/common";
import { useQosPage } from "./hooks/useQosPage";
import {
  nativeFieldInputStyle,
  nativeFieldInteraction,
  QosFieldRow,
} from "./components/QosFormFields";
import {
  qosCardTitleBarStyle,
  qosCheckboxSx,
  qosFooterStyle,
  qosFormBodyStyle,
  qosFormBtnStyle,
} from "./components/QosTableHelpers";

const QosPage = () => {
  const vm = useQosPage();
  const {
    formData,
    toast,
    clearToast,
    handleSave,
    handleReset,
    handleKeyPressInteger,
    handleToggleQosEnabled,
    handleMediaPremiumQosChange,
    handleControlPremiumQosChange,
  } = vm;

  return (
    <div style={qosPageWrapStyle}>
      {toast.msg && (
        <Alert severity={toast.type} onClose={clearToast} sx={qosFixedAlertSx}>
          {toast.msg}
        </Alert>
      )}

      <QosBreadcrumb
        root="FXS"
        section={QOS_PAGE_BREADCRUMB_SECTION}
        current={QOS_PAGE_TITLE}
      />

      <div style={qosCardStyle}>
        <div style={qosCardTitleBarStyle}>{QOS_CARD_TITLE}</div>

        <div style={qosFormBodyStyle}>
          <QosFieldRow label="QoS" tooltipKey="qosEnabled">
            <Checkbox
              id="qosEnabled"
              name="qosEnabled"
              size="small"
              checked={!!formData.qosEnabled}
              onChange={handleToggleQosEnabled}
              sx={qosCheckboxSx}
            />
          </QosFieldRow>

          {formData.qosEnabled && (
            <>
              <QosFieldRow
                label="Media Premium QoS"
                tooltipKey="mediaPremiumQos"
              >
                <input
                  id="mediaPremiumQos"
                  type="text"
                  value={formData.mediaPremiumQos || ""}
                  onChange={(e) =>
                    handleMediaPremiumQosChange(e.target.value)
                  }
                  onKeyPress={handleKeyPressInteger}
                  maxLength={2}
                  style={nativeFieldInputStyle}
                  {...nativeFieldInteraction}
                />
              </QosFieldRow>

              <QosFieldRow
                label="Control Premium QoS"
                tooltipKey="controlPremiumQos"
              >
                <input
                  id="controlPremiumQos"
                  type="text"
                  value={formData.controlPremiumQos || ""}
                  onChange={(e) =>
                    handleControlPremiumQosChange(e.target.value)
                  }
                  onKeyPress={handleKeyPressInteger}
                  maxLength={2}
                  style={nativeFieldInputStyle}
                  {...nativeFieldInteraction}
                />
              </QosFieldRow>
            </>
          )}
        </div>

        <div style={qosFooterStyle}>
          <Btn
            type="button"
            variant="primary"
            onClick={handleSave}
            style={qosFormBtnStyle}
          >
            {QOS_SAVE_LABEL}
          </Btn>
          <Btn
            type="button"
            variant="cancel"
            onClick={handleReset}
            style={qosFormBtnStyle}
          >
            {QOS_RESET_LABEL}
          </Btn>
        </div>
      </div>
    </div>
  );
};

export default QosPage;
