import React from "react";
import { Alert } from "@mui/material";
import {
  CDR_QUERY_CARD_TITLE,
  CDR_QUERY_BUTTON_LABEL,
  CDR_QUERY_PAGE_BREADCRUMB_SECTION,
  CDR_QUERY_PAGE_TITLE,
} from "../../../constants/CdrQueryConstants";
import {
  ExtensionBreadcrumb as CdrQueryBreadcrumb,
  extensionPageWrapStyle as cdrQueryPageWrapStyle,
  extensionPageInnerStyle as cdrQueryPageInnerStyle,
  extensionCardStyle as cdrQueryCardStyle,
  extensionFixedAlertSx as cdrQueryFixedAlertSx,
  Btn,
} from "../../../components/common";
import { useCdrQueryPage } from "./hooks/useCdrQueryPage";
import {
  CdrQueryFieldsSection,
} from "./components/CdrQueryFormFields";
import {
  cdrQueryCardTitleBarStyle,
  cdrQueryFooterStyle,
  cdrQueryFormBtnStyle,
} from "./components/CdrQueryTableHelpers";

const CdrQueryPage = () => {
  const vm = useCdrQueryPage();
  const {
    formData,
    toast,
    clearToast,
    handleInputChange,
    handleStringKeyPress,
    handleNumberKeyPress,
    handleQuery,
  } = vm;

  return (
    <div style={cdrQueryPageWrapStyle}>
      <div style={cdrQueryPageInnerStyle}>
        {toast.msg && (
          <Alert
            severity={toast.type}
            onClose={clearToast}
            sx={cdrQueryFixedAlertSx}
          >
            {toast.msg}
          </Alert>
        )}

        <CdrQueryBreadcrumb
          root="FXS"
          section={CDR_QUERY_PAGE_BREADCRUMB_SECTION}
          current={CDR_QUERY_PAGE_TITLE}
        />

        <div style={cdrQueryCardStyle}>
          <div style={cdrQueryCardTitleBarStyle}>
            <span>{CDR_QUERY_CARD_TITLE}</span>
          </div>

          <CdrQueryFieldsSection
            formData={formData}
            handleInputChange={handleInputChange}
            handleStringKeyPress={handleStringKeyPress}
            handleNumberKeyPress={handleNumberKeyPress}
          />

          <div style={cdrQueryFooterStyle}>
            <Btn
              type="button"
              variant="primary"
              onClick={handleQuery}
              style={cdrQueryFormBtnStyle}
            >
              {CDR_QUERY_BUTTON_LABEL}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CdrQueryPage;
