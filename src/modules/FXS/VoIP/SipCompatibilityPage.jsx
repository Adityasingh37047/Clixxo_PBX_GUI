import React from "react";
import { Alert } from "@mui/material";
import {
  FXS_SIP_COMPATIBILITY_CARD_TITLE,
  FXS_SIP_COMPATIBILITY_LEFT_SECTION_TITLE,
  FXS_SIP_COMPATIBILITY_RIGHT_SECTION_TITLE,
  FXS_SIP_COMPATIBILITY_SAVE_LABEL,
  FXS_SIP_COMPATIBILITY_RESET_LABEL,
  FXS_SIP_COMPATIBILITY_BREADCRUMB_SECTION,
  FXS_SIP_COMPATIBILITY_PAGE_TITLE,
} from "../../../constants/SipCompatibilityConstants";
import {
  Btn,
  ExtensionBreadcrumb as SipCompatibilityBreadcrumb,
  extensionPageWrapStyle as sipCompatibilityPageWrapStyle,
  extensionPageInnerStyle as sipCompatibilityPageInnerStyle,
  extensionCardStyle as sipCompatibilityCardStyle,
  extensionFixedAlertSx as sipCompatibilityFixedAlertSx,
} from "../../../components/common";
import { useSipCompatibilityPage } from "./hooks/useSipCompatibilityPage";
import { SipCompatibilityFormGrid } from "./components/SipCompatibilityFormFields";
import {
  fxsSipCompatibilityCardTitleBarStyle,
  fxsSipCompatibilityFormBtnStyle,
  fxsSipCompatibilityFormInlineFooterStyle,
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
    <div style={sipCompatibilityPageWrapStyle} data-native-scroll>
      <div style={sipCompatibilityPageInnerStyle}>
        {toast.msg && (
          <Alert
            severity={toast.type}
            onClose={() => setToast({ msg: "", type: "success" })}
            sx={sipCompatibilityFixedAlertSx}
          >
            {toast.msg}
          </Alert>
        )}

        <SipCompatibilityBreadcrumb
          root="FXS"
          section={FXS_SIP_COMPATIBILITY_BREADCRUMB_SECTION}
          current={FXS_SIP_COMPATIBILITY_PAGE_TITLE}
          style={{ flexShrink: 0 }}
        />

        <div style={sipCompatibilityCardStyle}>
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
      </div>
    </div>
  );
};

export default SipCompatibilityPage;