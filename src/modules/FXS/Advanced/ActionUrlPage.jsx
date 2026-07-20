import React from "react";
import { Alert } from "@mui/material";
import {
  ACTION_URL_CARD_TITLE,
  ACTION_URL_LEFT_COLUMN_FIELD_KEYS,
  ACTION_URL_RIGHT_COLUMN_FIELD_KEYS,
  ACTION_URL_PAGE_BREADCRUMB_SECTION,
  ACTION_URL_PAGE_TITLE,
  ACTION_URL_RESET_LABEL,
  ACTION_URL_SAVE_LABEL,
} from "../../../constants/ActionUrlConstants";
import {
  ExtensionBreadcrumb as ActionUrlBreadcrumb,
  extensionPageWrapStyle as actionUrlPageWrapStyle,
  extensionPageInnerStyle as actionUrlPageInnerStyle,
  extensionCardStyle as actionUrlCardStyle,
  extensionFixedAlertSx as actionUrlFixedAlertSx,
  Btn,
} from "../../../components/common";
import { useActionUrlPage } from "./hooks/useActionUrlPage";
import { getFieldByKey } from "./utils/ActionUrlTransformers";
import {
  ActionUrlFieldRow,
  nativeFieldInputStyle,
  nativeFieldInteraction,
} from "./components/ActionUrlFormFields";
import {
  actionUrlCardTitleBarStyle,
  actionUrlDashboardColumnLeftStyle,
  actionUrlDashboardColumnRightStyle,
  actionUrlDashboardDividerCellStyle,
  actionUrlDashboardDividerLineStyle,
  actionUrlDashboardGridStyle,
  actionUrlFieldsColStyle,
  actionUrlFooterStyle,
  actionUrlFormBtnStyle,
} from "./components/ActionUrlTableHelpers";

const ActionUrlPage = () => {
  const vm = useActionUrlPage();
  const {
    formData,
    toast,
    clearToast,
    handleInputChange,
    handleSave,
    handleReset,
  } = vm;

  const renderField = (fieldKey) => {
    const field = getFieldByKey(fieldKey);
    if (!field) return null;

    return (
      <ActionUrlFieldRow
        key={field.key}
        label={field.label}
        tooltipKey={field.key}
      >
        <input
          type="text"
          name={field.key}
          value={formData[field.key] || ""}
          onChange={handleInputChange}
          placeholder={field.placeholder}
          style={nativeFieldInputStyle}
          {...nativeFieldInteraction}
          maxLength={field.maxLength || 256}
        />
      </ActionUrlFieldRow>
    );
  };

  const leftColumnFields = ACTION_URL_LEFT_COLUMN_FIELD_KEYS.map((key) =>
    renderField(key),
  );
  const rightColumnFields = ACTION_URL_RIGHT_COLUMN_FIELD_KEYS.map((key) =>
    renderField(key),
  );

  return (
    <div style={actionUrlPageWrapStyle}>
      <div style={actionUrlPageInnerStyle}>
        {toast.msg && (
          <Alert
            severity={toast.type}
            onClose={clearToast}
            sx={actionUrlFixedAlertSx}
          >
            {toast.msg}
          </Alert>
        )}

        <ActionUrlBreadcrumb
          root="FXS"
          section={ACTION_URL_PAGE_BREADCRUMB_SECTION}
          current={ACTION_URL_PAGE_TITLE}
        />

        <div style={actionUrlCardStyle}>
          <div style={actionUrlCardTitleBarStyle}>
            <span>{ACTION_URL_CARD_TITLE}</span>
          </div>
          <div style={actionUrlDashboardGridStyle}>
            <div style={actionUrlDashboardColumnLeftStyle}>
              <div style={actionUrlFieldsColStyle}>{leftColumnFields}</div>
            </div>

            <div
              style={actionUrlDashboardDividerCellStyle}
              aria-hidden="true"
            >
              <div style={actionUrlDashboardDividerLineStyle} />
            </div>

            <div style={actionUrlDashboardColumnRightStyle}>
              <div style={actionUrlFieldsColStyle}>{rightColumnFields}</div>
            </div>
          </div>

          <div style={actionUrlFooterStyle}>
            <Btn
              type="button"
              variant="primary"
              onClick={handleSave}
              style={actionUrlFormBtnStyle}
            >
              {ACTION_URL_SAVE_LABEL}
            </Btn>
            <Btn
              type="button"
              variant="cancel"
              onClick={handleReset}
              style={actionUrlFormBtnStyle}
            >
              {ACTION_URL_RESET_LABEL}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionUrlPage;
