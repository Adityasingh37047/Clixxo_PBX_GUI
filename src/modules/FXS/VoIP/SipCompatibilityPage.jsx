import React from "react";
import { Alert } from "@mui/material";
import {
  FXS_SIP_COMPATIBILITY_CARD_TITLE,
  FXS_SIP_COMPATIBILITY_LEFT_SECTION_TITLE,
  FXS_SIP_COMPATIBILITY_RIGHT_SECTION_TITLE,
  FXS_SIP_COMPATIBILITY_SAVE_LABEL,
  FXS_SIP_COMPATIBILITY_RESET_LABEL,
} from "../../../constants/SipCompatibilityConstants";
import { Btn } from "../../../components/common";
import { useSipCompatibilityPage } from "./hooks/useSipCompatibilityPage";
import {
  SipCompatibilityBreadcrumb,
  SipCompatibilityFormGrid,
  SipCompatibilityPageShell,
} from "./components/SipCompatibilityFormFields";
import {
  fxsSipCompatibilityCardTitleBarStyle,
  fxsSipCompatibilityFixedAlertSx,
  fxsSipCompatibilityFormBtnStyle,
  fxsSipCompatibilityFormInlineFooterStyle,
  fxsSipCompatibilityTableContainerStyle,
} from "./components/SipCompatibilityTableHelpers";

const SipCompatibilityPage = () => {
  const vm = useSipCompatibilityPage();
  const {
    form,
    toast,
    setToast,
    leftLayout,
    rightLayout,
    handleChange,
    handleCheckbox,
    handleSave,
    handleReset,
  } = vm;

  return (
    <SipCompatibilityPageShell>
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={() => setToast({ msg: "", type: "success" })}
          sx={fxsSipCompatibilityFixedAlertSx}
        >
          {toast.msg}
        </Alert>
      )}

      <SipCompatibilityBreadcrumb />

      <div style={fxsSipCompatibilityTableContainerStyle}>
        <div style={fxsSipCompatibilityCardTitleBarStyle}>
          <span>{FXS_SIP_COMPATIBILITY_CARD_TITLE}</span>
        </div>
        <SipCompatibilityFormGrid
          leftSectionTitle={FXS_SIP_COMPATIBILITY_LEFT_SECTION_TITLE}
          rightSectionTitle={FXS_SIP_COMPATIBILITY_RIGHT_SECTION_TITLE}
          leftLayout={leftLayout}
          rightLayout={rightLayout}
          form={form}
          onChange={handleChange}
          onCheckbox={handleCheckbox}
        />

        <div style={fxsSipCompatibilityFormInlineFooterStyle}>
          <Btn
            type="button"
            onClick={handleSave}
            variant="primary"
            style={fxsSipCompatibilityFormBtnStyle}
          >
            {FXS_SIP_COMPATIBILITY_SAVE_LABEL}
          </Btn>
          <Btn
            type="button"
            onClick={handleReset}
            variant="cancel"
            style={fxsSipCompatibilityFormBtnStyle}
          >
            {FXS_SIP_COMPATIBILITY_RESET_LABEL}
          </Btn>
        </div>
      </div>
    </SipCompatibilityPageShell>
  );
};

export default SipCompatibilityPage;
