import React from "react";
import { Alert } from "@mui/material";
import {
  AREA_SELECT_CARD_TITLE,
  AREA_SELECT_SAVE_LABEL,
} from "../../../constants/AreaSelectConstants";
import { Btn } from "../../../components/common";
import { useAreaSelectPage } from "./hooks/useAreaSelectPage";
import { getAreaSelectField } from "./utils/AreaSelectTransformers";
import {
  AreaSelectBreadcrumb,
  AreaSelectFieldRow,
  AreaSelectPageShell,
  nativeFieldInteraction,
  nativeFieldSelectStyle,
} from "./components/AreaSelectFormFields";
import {
  areaSelectCardTitleBarStyle,
  areaSelectFixedAlertSx,
  areaSelectFooterStyle,
  areaSelectFormBodyStyle,
  areaSelectFormBtnStyle,
  areaSelectTableContainerStyle,
} from "./components/AreaSelectTableHelpers";

const AreaSelectPage = () => {
  const vm = useAreaSelectPage();
  const { formData, toast, clearToast, handleInputChange, handleSave } = vm;
  const field = getAreaSelectField();

  return (
    <AreaSelectPageShell>
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={clearToast}
          sx={areaSelectFixedAlertSx}
        >
          {toast.msg}
        </Alert>
      )}

      <AreaSelectBreadcrumb />

      <div style={areaSelectTableContainerStyle}>
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
    </AreaSelectPageShell>
  );
};

export default AreaSelectPage;
