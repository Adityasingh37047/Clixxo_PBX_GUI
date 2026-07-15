import React from "react";
import { Alert, CircularProgress } from "@mui/material";
import {
  SIP_SETTINGS_NOTE,
  FXS_VOIP_SIP_CARD_TITLE,
  FXS_VOIP_SIP_LEFT_SECTION_TITLE,
  FXS_VOIP_SIP_RIGHT_SECTION_TITLE,
  FXS_VOIP_SIP_SAVE_LABEL,
  FXS_VOIP_SIP_RESET_LABEL,
  FXS_VOIP_SIP_SAVING_LABEL,
  FXS_VOIP_SIP_LOCAL_MODE_PREFIX,
} from "../../../constants/FxsVoipSipConstants";
import { C } from "../../../theme/pbxTokens";
import { Btn } from "../../../components/common";
import { useFxsVoipSipPage } from "./hooks/useFxsVoipSipPage";
import {
  FxsVoipSipBreadcrumb,
  FxsVoipSipFormGrid,
  FxsVoipSipPageShell,
} from "./components/FxsVoipSipFormFields";
import {
  fxsVoipSipCardTitleBarStyle,
  fxsVoipSipFixedAlertSx,
  fxsVoipSipFormBtnStyle,
  fxsVoipSipFormInlineFooterStyle,
  fxsVoipSipLoadingWrapStyle,
  fxsVoipSipLocalModeBannerStyle,
  fxsVoipSipTableContainerStyle,
} from "./components/FxsVoipSipTableHelpers";

const FxsVoipSipPage = () => {
  const vm = useFxsVoipSipPage();
  const {
    form,
    message,
    setMessage,
    loadingPage,
    saving,
    registrationMode,
    localModeMsg,
    leftColumnFields,
    rightColumnFields,
    handleChange,
    handleCheckbox,
    handleSave,
    handleReset,
  } = vm;

  return (
    <FxsVoipSipPageShell>
      {message.text && (
        <Alert
          severity={
            message.type === "error"
              ? "error"
              : message.type === "success"
                ? "success"
                : "info"
          }
          onClose={() => setMessage({ type: "", text: "" })}
          sx={fxsVoipSipFixedAlertSx}
        >
          {message.text}
        </Alert>
      )}

      <FxsVoipSipBreadcrumb />

      {registrationMode === "local" && localModeMsg && (
        <div style={fxsVoipSipLocalModeBannerStyle}>
          <span style={{ fontWeight: 700 }}>{FXS_VOIP_SIP_LOCAL_MODE_PREFIX}</span>
          <span>{localModeMsg}</span>
        </div>
      )}

      <div style={fxsVoipSipTableContainerStyle}>
        <div style={fxsVoipSipCardTitleBarStyle}>
          <span>{FXS_VOIP_SIP_CARD_TITLE}</span>
        </div>
        {loadingPage ? (
          <div style={fxsVoipSipLoadingWrapStyle}>
            <CircularProgress size={32} sx={{ color: C.accent }} />
          </div>
        ) : (
          <FxsVoipSipFormGrid
            leftSectionTitle={FXS_VOIP_SIP_LEFT_SECTION_TITLE}
            rightSectionTitle={FXS_VOIP_SIP_RIGHT_SECTION_TITLE}
            leftFields={leftColumnFields}
            rightFields={rightColumnFields}
            note={SIP_SETTINGS_NOTE}
            form={form}
            registrationMode={registrationMode}
            saving={saving}
            onChange={handleChange}
            onCheckbox={handleCheckbox}
          />
        )}

        {!loadingPage && (
          <div style={fxsVoipSipFormInlineFooterStyle}>
            <Btn
              type="button"
              onClick={handleSave}
              variant="primary"
              disabled={saving || loadingPage}
              style={fxsVoipSipFormBtnStyle}
            >
              {saving ? (
                <>
                  <CircularProgress size={11} sx={{ color: "inherit" }} />
                  {FXS_VOIP_SIP_SAVING_LABEL}
                </>
              ) : (
                FXS_VOIP_SIP_SAVE_LABEL
              )}
            </Btn>
            <Btn
              type="button"
              onClick={handleReset}
              variant="cancel"
              disabled={saving || loadingPage}
              style={fxsVoipSipFormBtnStyle}
            >
              {FXS_VOIP_SIP_RESET_LABEL}
            </Btn>
          </div>
        )}
      </div>
    </FxsVoipSipPageShell>
  );
};

export default FxsVoipSipPage;
