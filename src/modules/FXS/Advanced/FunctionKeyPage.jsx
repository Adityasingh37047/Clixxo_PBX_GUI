import React from "react";
import { Alert } from "@mui/material";
import {
  FUNCTION_KEY_CARD_TITLE,
  FUNCTION_KEY_RESET_LABEL,
  FUNCTION_KEY_SAVE_LABEL,
  FUNCTION_KEY_SECTIONS_ORDER,
  FUNCTION_KEY_PAGE_BREADCRUMB_SECTION,
  FUNCTION_KEY_PAGE_TITLE,
} from "../../../constants/FunctionKeyConstants";
import {
  Btn,
  ExtensionBreadcrumb as FunctionKeyBreadcrumb,
  extensionPageWrapStyle as functionKeyPageWrapStyle,
  extensionCardStyle as functionKeyCardStyle,
  extensionFixedAlertSx as functionKeyFixedAlertSx,
} from "../../../components/common";
import { useFunctionKeyPage } from "./hooks/useFunctionKeyPage";
import { FunctionKeySectionTable } from "./components/FunctionKeyFormFields";
import {
  functionKeyCardBodyStyle,
  functionKeyCardTitleBarStyle,
  functionKeyFooterStyle,
  functionKeyFormBtnStyle,
} from "./components/FunctionKeyTableHelpers";

const FunctionKeyPage = () => {
  const vm = useFunctionKeyPage();
  const {
    formData,
    groupedFields,
    toast,
    clearToast,
    handleEnableChange,
    handleModeChange,
    handleFunctionKeyChange,
    handleKeyPress,
    handleSave,
    handleReset,
  } = vm;

  return (
    <div style={functionKeyPageWrapStyle}>
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={clearToast}
          sx={functionKeyFixedAlertSx}
        >
          {toast.msg}
        </Alert>
      )}

      <FunctionKeyBreadcrumb
        root="FXS"
        section={FUNCTION_KEY_PAGE_BREADCRUMB_SECTION}
        current={FUNCTION_KEY_PAGE_TITLE}
      />

      <div style={functionKeyCardStyle}>
        <div style={functionKeyCardTitleBarStyle}>{FUNCTION_KEY_CARD_TITLE}</div>

        <div style={functionKeyCardBodyStyle}>
          {FUNCTION_KEY_SECTIONS_ORDER.map((sectionName) => (
            <FunctionKeySectionTable
              key={sectionName}
              sectionName={sectionName}
              fields={groupedFields[sectionName] || []}
              formData={formData}
              onEnableChange={handleEnableChange}
              onModeChange={handleModeChange}
              onFunctionKeyChange={handleFunctionKeyChange}
              onKeyPress={handleKeyPress}
            />
          ))}
        </div>

        <div style={functionKeyFooterStyle}>
          <Btn
            type="button"
            variant="primary"
            onClick={handleSave}
            style={functionKeyFormBtnStyle}
          >
            {FUNCTION_KEY_SAVE_LABEL}
          </Btn>
          <Btn
            type="button"
            variant="cancel"
            onClick={handleReset}
            style={functionKeyFormBtnStyle}
          >
            {FUNCTION_KEY_RESET_LABEL}
          </Btn>
        </div>
      </div>
    </div>
  );
};

export default FunctionKeyPage;
