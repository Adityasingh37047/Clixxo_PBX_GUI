import React from "react";
import { Alert } from "@mui/material";
import {
  DTMF_RESET_LABEL,
  DTMF_SAVE_LABEL,
  DTMF_TAB_DETECTOR,
} from "../../../constants/DtmfConstants";
import { Btn } from "../../../components/common";
import { useDtmfPage } from "./hooks/useDtmfPage";
import {
  DtmfBreadcrumb,
  DtmfDetectorSection,
  DtmfGeneratorSection,
  DtmfPageShell,
  DtmfTabBar,
} from "./components/DtmfFormFields";
import {
  dtmfCardStyle,
  dtmfFixedAlertSx,
  dtmfFormBodyStyle,
  dtmfFormBtnStyle,
  dtmfFormFooterStyle,
} from "./components/DtmfTableHelpers";

const DtmfPage = () => {
  const vm = useDtmfPage();
  const {
    formData,
    activeTab,
    setActiveTab,
    toast,
    clearToast,
    handleInputChange,
    handleCheckboxChange,
    handleKeyPress,
    handleKeyPressInteger,
    handleSave,
    handleReset,
  } = vm;

  const sectionProps = {
    formData,
    handleInputChange,
    handleCheckboxChange,
    handleKeyPress,
    handleKeyPressInteger,
  };

  return (
    <DtmfPageShell>
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={clearToast}
          sx={dtmfFixedAlertSx}
        >
          {toast.msg}
        </Alert>
      )}

      <DtmfBreadcrumb />

      <div style={dtmfCardStyle}>
        <DtmfTabBar activeTab={activeTab} onTabChange={setActiveTab} />

        <div style={dtmfFormBodyStyle}>
          {activeTab === DTMF_TAB_DETECTOR ? (
            <DtmfDetectorSection {...sectionProps} />
          ) : (
            <DtmfGeneratorSection {...sectionProps} />
          )}
        </div>

        <div style={dtmfFormFooterStyle}>
          <Btn
            type="button"
            variant="primary"
            onClick={handleSave}
            style={dtmfFormBtnStyle}
          >
            {DTMF_SAVE_LABEL}
          </Btn>
          <Btn
            type="button"
            variant="cancel"
            onClick={handleReset}
            style={dtmfFormBtnStyle}
          >
            {DTMF_RESET_LABEL}
          </Btn>
        </div>
      </div>
    </DtmfPageShell>
  );
};

export default DtmfPage;
