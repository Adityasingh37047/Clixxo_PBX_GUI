import React from "react";
import { Alert } from "@mui/material";
import {
  CDR_QUERY_CARD_TITLE,
  CDR_QUERY_BUTTON_LABEL,
} from "../../../constants/CdrQueryConstants";
import { Btn } from "../../../components/common";
import { useCdrQueryPage } from "./hooks/useCdrQueryPage";
import {
  CdrQueryBreadcrumb,
  CdrQueryFieldsSection,
  CdrQueryPageShell,
} from "./components/CdrQueryFormFields";
import {
  cdrQueryCardTitleBarStyle,
  cdrQueryFixedAlertSx,
  cdrQueryFooterStyle,
  cdrQueryFormBtnStyle,
  cdrQueryTableContainerStyle,
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
    <CdrQueryPageShell>
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={clearToast}
          sx={cdrQueryFixedAlertSx}
        >
          {toast.msg}
        </Alert>
      )}

      <CdrQueryBreadcrumb />

      <div style={cdrQueryTableContainerStyle}>
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
    </CdrQueryPageShell>
  );
};

export default CdrQueryPage;
