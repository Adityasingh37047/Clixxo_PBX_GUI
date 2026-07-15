import React from "react";
import { Alert } from "@mui/material";
import {
  FUNCTION_KEY_CARD_TITLE,
  FUNCTION_KEY_RESET_LABEL,
  FUNCTION_KEY_SAVE_LABEL,
  FUNCTION_KEY_SECTIONS_ORDER,
} from "../../../constants/FunctionKeyConstants";
import { Btn } from "../../../components/common";
import { useFunctionKeyPage } from "./hooks/useFunctionKeyPage";
import {
  FunctionKeyBreadcrumb,
  FunctionKeyPageShell,
  FunctionKeySectionTable,
} from "./components/FunctionKeyFormFields";
import {
  functionKeyCardBodyStyle,
  functionKeyCardStyle,
  functionKeyCardTitleBarStyle,
  functionKeyFixedAlertSx,
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
    <FunctionKeyPageShell>
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={clearToast}
          sx={functionKeyFixedAlertSx}
        >
          {toast.msg}
        </Alert>
      )}

      <FunctionKeyBreadcrumb />

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
    </FunctionKeyPageShell>
  );
};

export default FunctionKeyPage;
