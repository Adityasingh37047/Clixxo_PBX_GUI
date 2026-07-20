import React from "react";
import { Alert } from "@mui/material";
import {
  TONE_GENERATOR_CARD_TITLE,
  TONE_GENERATOR_RESET_LABEL,
  TONE_GENERATOR_SAVE_LABEL,
  TONE_GENERATOR_PAGE_BREADCRUMB_SECTION,
  TONE_GENERATOR_PAGE_TITLE,
} from "../../../constants/ToneGeneratorConstants";
import {
  Btn,
  ExtensionBreadcrumb as ToneGeneratorBreadcrumb,
  extensionPageWrapStyle as toneGeneratorPageWrapStyle,
  extensionPageInnerStyle as toneGeneratorPageInnerStyle,
  extensionCardStyle as toneGeneratorCardStyle,
  extensionFixedAlertSx as toneGeneratorFixedAlertSx,
} from "../../../components/common";
import { useToneGeneratorPage } from "./hooks/useToneGeneratorPage";
import { TONE_GENERATOR_HELP_BLOCKS } from "./utils/ToneGeneratorTransformers";
import {
  ToneFieldRow,
  ToneGeneratorHelpPanel,
} from "./components/ToneGeneratorFormFields";
import {
  toneGeneratorCardBodyStyle,
  toneGeneratorCardTitleBarStyle,
  toneGeneratorColumnDividerStyle,
  toneGeneratorFooterStyle,
  toneGeneratorFormBtnStyle,
  toneGeneratorFormColumnStyle,
} from "./components/ToneGeneratorTableHelpers";

const ToneGeneratorPage = () => {
  const vm = useToneGeneratorPage();
  const {
    formData,
    toast,
    clearToast,
    handleKeyPress,
    handleFieldChange,
    handleSave,
    handleReset,
  } = vm;

  return (
    <div style={toneGeneratorPageWrapStyle}>
      <div style={toneGeneratorPageInnerStyle}>
        {toast.msg && (
          <Alert
            severity={toast.type}
            onClose={clearToast}
            sx={toneGeneratorFixedAlertSx}
          >
            {toast.msg}
          </Alert>
        )}

        <ToneGeneratorBreadcrumb
          root="FXS"
          section={TONE_GENERATOR_PAGE_BREADCRUMB_SECTION}
          current={TONE_GENERATOR_PAGE_TITLE}
        />

        <div style={toneGeneratorCardStyle}>
        <div style={toneGeneratorCardTitleBarStyle}>
          {TONE_GENERATOR_CARD_TITLE}
        </div>

        <div style={toneGeneratorCardBodyStyle}>
          <div style={toneGeneratorFormColumnStyle}>
            <ToneFieldRow
              label="Dial Tone"
              id="dialTone"
              tooltipKey="dialTone"
              value={formData.dialTone}
              onChange={handleFieldChange("dialTone")}
              onKeyPress={handleKeyPress}
            />
            <ToneFieldRow
              label="Ringback Tone"
              id="ringbackTone"
              tooltipKey="ringbackTone"
              value={formData.ringbackTone}
              onChange={handleFieldChange("ringbackTone")}
              onKeyPress={handleKeyPress}
            />
            <ToneFieldRow
              label="Busy Tone"
              id="busyTone"
              tooltipKey="busyTone"
              value={formData.busyTone}
              onChange={handleFieldChange("busyTone")}
              onKeyPress={handleKeyPress}
            />
          </div>

          <div style={toneGeneratorColumnDividerStyle} aria-hidden />

          <ToneGeneratorHelpPanel blocks={TONE_GENERATOR_HELP_BLOCKS} />
        </div>

        <div style={toneGeneratorFooterStyle}>
          <Btn
            type="button"
            variant="primary"
            onClick={handleSave}
            style={toneGeneratorFormBtnStyle}
          >
            {TONE_GENERATOR_SAVE_LABEL}
          </Btn>
          <Btn
            type="button"
            variant="cancel"
            onClick={handleReset}
            style={toneGeneratorFormBtnStyle}
          >
            {TONE_GENERATOR_RESET_LABEL}
          </Btn>
        </div>
      </div>
    </div>
  );
};

export default ToneGeneratorPage;
