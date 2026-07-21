import React from "react";
import { Alert, Checkbox } from "@mui/material";
import {
  FXS_LEFT_COLUMN_FIELD_KEYS,
  FXS_RIGHT_COLUMN_FIELD_KEYS,
  FXS_PAGE_CARD_TITLE,
  FXS_PAGE_BREADCRUMB_SECTION,
  FXS_PAGE_TITLE,
  FXS_SAVE_LABEL,
  FXS_RESET_LABEL,
} from "../../../constants/FxsConstants";
import {
  Btn,
  ExtensionBreadcrumb as FxsBreadcrumb,
  extensionPageWrapStyle as fxsPageWrapStyle,
  extensionPageInnerStyle as fxsPageInnerStyle,
  extensionCardStyle as fxsCardStyle,
  extensionFixedAlertSx as fxsFixedAlertSx,
} from "../../../components/common";
import { useFxsPage } from "./hooks/useFxsPage";
import { getFieldByKey } from "./utils/FxsTransformers";
import {
  FxsFieldRow,
  controlSlotStyle,
  fxsPageCheckboxSx,
  nativeFieldInputStyle,
  nativeFieldInteraction,
  nativeFieldSelectStyle,
  valueColStyle,
} from "./components/FxsFormFields";
import {
  advancedCardTitleBarStyle,
  advancedFormBtnStyle,
  advancedFormInlineFooterStyle,
  dashboardColumnLeftStyle,
  dashboardColumnRightStyle,
  dashboardDividerCellStyle,
  dashboardDividerLineStyle,
  dashboardGridStyle,
  fxsPageFieldsColStyle,
} from "./components/FxsTableHelpers";

const FxsPage = () => {
  const vm = useFxsPage();
  const {
    formData,
    toast,
    clearToast,
    handleInputChange,
    handleCheckboxToggle,
    handleKeyPress,
    shouldShowField,
    handleSave,
    handleReset,
  } = vm;

  const renderField = (fieldKey) => {
    const field = getFieldByKey(fieldKey);
    if (!field || !shouldShowField(field)) return null;

    const isLongLabel =
      field.label.length >= 42 ||
      field.key === "minHangupTime" ||
      field.key === "preferred18xResponse";

    return (
      <FxsFieldRow
        key={field.key}
        label={field.label}
        tooltipKey={field.key}
        isLongLabel={isLongLabel}
      >
        <div style={valueColStyle}>
          <div style={controlSlotStyle}>
            {field.type === "text" && (
              <input
                type="text"
                name={field.key}
                value={formData[field.key]}
                onChange={handleInputChange}
                onKeyPress={(e) =>
                  handleKeyPress(e, field.keyPressType || "number")
                }
                style={nativeFieldInputStyle}
                {...nativeFieldInteraction}
                maxLength={field.maxLength || "31"}
              />
            )}
            {field.type === "select" && (
              <select
                name={field.key}
                value={formData[field.key]}
                onChange={handleInputChange}
                style={nativeFieldSelectStyle}
                {...nativeFieldInteraction}
              >
                {field.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
            {field.type === "checkbox" && (
              <Checkbox
                size="small"
                name={field.key}
                checked={!!formData[field.key]}
                onChange={() => handleCheckboxToggle(field.key)}
                sx={fxsPageCheckboxSx}
              />
            )}
          </div>
        </div>
      </FxsFieldRow>
    );
  };

  const leftColumnFields = FXS_LEFT_COLUMN_FIELD_KEYS.map((key) =>
    renderField(key),
  );
  const rightColumnFields = FXS_RIGHT_COLUMN_FIELD_KEYS.map((key) =>
    renderField(key),
  );

  return (
    <div style={fxsPageWrapStyle} data-native-scroll>
      <div style={fxsPageInnerStyle}>
        {toast.msg && (
          <Alert severity={toast.type} onClose={clearToast} sx={fxsFixedAlertSx}>
            {toast.msg}
          </Alert>
        )}

        <FxsBreadcrumb
          root="FXS"
          section={FXS_PAGE_BREADCRUMB_SECTION}
          current={FXS_PAGE_TITLE}
        />

        <div style={fxsCardStyle}>
        <div style={advancedCardTitleBarStyle}>
          <span>{FXS_PAGE_CARD_TITLE}</span>
        </div>
        <div className="settings-dashboard-grid" style={dashboardGridStyle}>
          <div style={dashboardColumnLeftStyle}>
            <div style={fxsPageFieldsColStyle}>{leftColumnFields}</div>
          </div>

          <div
            className="settings-dashboard-divider"
            style={dashboardDividerCellStyle}
            aria-hidden="true"
          >
            <div style={dashboardDividerLineStyle} />
          </div>

          <div style={dashboardColumnRightStyle}>
            <div style={fxsPageFieldsColStyle}>{rightColumnFields}</div>
          </div>
        </div>

        <div style={advancedFormInlineFooterStyle}>
          <Btn
            type="button"
            variant="primary"
            onClick={handleSave}
            style={advancedFormBtnStyle}
          >
            {FXS_SAVE_LABEL}
          </Btn>
          <Btn
            type="button"
            variant="cancel"
            onClick={handleReset}
            style={advancedFormBtnStyle}
          >
            {FXS_RESET_LABEL}
          </Btn>
        </div>
        </div>
      </div>
    </div>
  );
};

export default FxsPage;
