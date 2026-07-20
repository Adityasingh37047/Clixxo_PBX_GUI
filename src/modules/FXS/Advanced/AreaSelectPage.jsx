import React from "react";
import { Alert } from "@mui/material";
import {
  AREA_SELECT_CARD_TITLE,
  AREA_SELECT_PAGE_BREADCRUMB_SECTION,
  AREA_SELECT_PAGE_TITLE,
  AREA_SELECT_SAVE_LABEL,
} from "../../../constants/AreaSelectConstants";
import {
  ExtensionBreadcrumb as AreaSelectBreadcrumb,
  extensionPageWrapStyle as areaSelectPageWrapStyle,
  extensionPageInnerStyle as areaSelectPageInnerStyle,
  extensionCardStyle as areaSelectCardStyle,
  extensionFixedAlertSx as areaSelectFixedAlertSx,
  Btn,
} from "../../../components/common";
import { useAreaSelectPage } from "./hooks/useAreaSelectPage";
import { getAreaSelectField } from "./utils/AreaSelectTransformers";
import {
  AreaSelectFieldRow,
  nativeFieldInteraction,
  nativeFieldSelectStyle,
} from "./components/AreaSelectFormFields";
import {
  areaSelectCardTitleBarStyle,
  areaSelectFooterStyle,
  areaSelectFormBodyStyle,
  areaSelectFormBtnStyle,
} from "./components/AreaSelectTableHelpers";

const AreaSelectPage = () => {
  const vm = useAreaSelectPage();
  const { formData, toast, clearToast, handleInputChange, handleSave } = vm;
  const field = getAreaSelectField();

  return (
    <div style={areaSelectPageWrapStyle}>
      <div style={areaSelectPageInnerStyle}>
        {toast.msg && (
          <Alert
            severity={toast.type}
            onClose={clearToast}
            sx={areaSelectFixedAlertSx}
          >
            {toast.msg}
          </Alert>
        )}

        <AreaSelectBreadcrumb
          root="FXS"
          section={AREA_SELECT_PAGE_BREADCRUMB_SECTION}
          current={AREA_SELECT_PAGE_TITLE}
        />

        <div style={areaSelectCardStyle}>
          <div style={areaSelectCardTitleBarStyle}>
            <span>{AREA_SELECT_CARD_TITLE}</span>
          </div>

          <div style={areaSelectFormBodyStyle}>
            <AreaSelectFieldRow label={field.label} tooltipKey={field.key}>
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
            </AreaSelectFieldRow>
          </div>

          <div style={areaSelectFooterStyle}>
            <Btn
              type="button"
              variant="primary"
              onClick={handleSave}
              style={areaSelectFormBtnStyle}
            >
              {AREA_SELECT_SAVE_LABEL}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AreaSelectPage;
