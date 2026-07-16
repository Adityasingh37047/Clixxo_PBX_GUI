import React from "react";
import { Alert } from "@mui/material";
import {
  FXS_VOIP_MEDIA_CARD_TITLE,
  FXS_VOIP_MEDIA_LEFT_SECTION_TITLE,
  FXS_VOIP_MEDIA_RIGHT_SECTION_TITLE,
  FXS_VOIP_MEDIA_SAVE_LABEL,
  FXS_VOIP_MEDIA_RESET_LABEL,
} from "../../../constants/MediaParametersConstants";
import { Btn } from "../../../components/common";
import { useFxsVoipMediaPage } from "./hooks/useFxsVoipMediaPage";
import {
  FxsVoipMediaBreadcrumb,
  FxsVoipMediaFormGrid,
  FxsVoipMediaPageShell,
} from "./components/FxsVoipMediaFormFields";
import {
  fxsVoipMediaCardTitleBarStyle,
  fxsVoipMediaFixedAlertSx,
  fxsVoipMediaFormBtnStyle,
  fxsVoipMediaFormInlineFooterStyle,
  fxsVoipMediaTableContainerStyle,
} from "./components/FxsVoipMediaTableHelpers";

const FxsVoipMediaPage = () => {
  const vm = useFxsVoipMediaPage();
  const {
    formData,
    selectedCodecs,
    setSelectedCodecs,
    toast,
    setToast,
    allCodecOptions,
    getCodecLabel,
    mediaParameterRows,
    handleInputChange,
    handleSave,
    handleReset,
  } = vm;

  return (
    <FxsVoipMediaPageShell>
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={() => setToast({ msg: "", type: "success" })}
          sx={fxsVoipMediaFixedAlertSx}
        >
          {toast.msg}
        </Alert>
      )}

      <FxsVoipMediaBreadcrumb />
      <div style={fxsVoipMediaTableContainerStyle}>
        <div style={fxsVoipMediaCardTitleBarStyle}>
          <span>{FXS_VOIP_MEDIA_CARD_TITLE}</span>
        </div>
        <FxsVoipMediaFormGrid
          leftSectionTitle={FXS_VOIP_MEDIA_LEFT_SECTION_TITLE}
          rightSectionTitle={FXS_VOIP_MEDIA_RIGHT_SECTION_TITLE}
          mediaParameterRows={mediaParameterRows}
          formData={formData}
          onInputChange={handleInputChange}
          allCodecOptions={allCodecOptions}
          selectedCodecs={selectedCodecs}
          onCodecChange={setSelectedCodecs}
          getCodecLabel={getCodecLabel}
        />
        <div style={fxsVoipMediaFormInlineFooterStyle}>
          <Btn
            type="button"
            onClick={handleSave}
            variant="primary"
            style={fxsVoipMediaFormBtnStyle}
          >
            {FXS_VOIP_MEDIA_SAVE_LABEL}
          </Btn>
          <Btn
            type="button"
            onClick={handleReset}
            variant="cancel"
            style={fxsVoipMediaFormBtnStyle}
          >
            {FXS_VOIP_MEDIA_RESET_LABEL}
          </Btn>
        </div>
      </div>
    </FxsVoipMediaPageShell>
  );
};

export default FxsVoipMediaPage;
