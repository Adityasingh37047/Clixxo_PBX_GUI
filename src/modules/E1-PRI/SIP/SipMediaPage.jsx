import React from "react";
import { CircularProgress, Alert, useMediaQuery } from "@mui/material";
import {
  SIP_MEDIA_CARD_TITLE,
  SIP_MEDIA_BTN_SAVE,
  SIP_MEDIA_BTN_SAVING,
  SIP_MEDIA_BTN_RESET,
  SIP_MEDIA_LOADING_TEXT,
  SIP_MEDIA_PAGE_BREADCRUMB_ROOT,
  SIP_MEDIA_PAGE_BREADCRUMB_SECTION,
  SIP_MEDIA_PAGE_TITLE,
} from "../../../constants/SipMediaConstants";
import {
  Btn,
  ExtensionBreadcrumb as SipMediaBreadcrumb,
  extensionPageWrapStyle as sipMediaPageWrapStyle,
  extensionPageInnerStyle as sipMediaPageInnerStyle,
  extensionFixedAlertSx as sipMediaFixedAlertSx,
} from "../../../components/common";
import { useSipMediaPage } from "./hooks/useSipMediaPage";
import {
  SipMediaScrollbarStyles,
  SipMediaFormBody,
  SIP_MEDIA_COMPACT_MQ,
} from "./components/SipMediaFormFields";
import {
  C,
  SIP_MEDIA_SCROLL_CLASS,
  advancedCardShellStyle,
  advancedTableContainerStyle,
  advancedFormInlineFooterStyle,
  advancedFormBtnStyle,
  sipHeaderStyle,
} from "./components/SipMediaTableHelpers";

const SipMediaPage = () => {
  const isCompact = useMediaQuery(SIP_MEDIA_COMPACT_MQ);
  const vm = useSipMediaPage();
  const {
    formData,
    loading,
    saving,
    message,
    setMessage,
    handleInputChange,
    handleSave,
    handleReset,
    isFieldVisible,
  } = vm;

  return (
    <>
      <SipMediaScrollbarStyles />
      <div
        className={SIP_MEDIA_SCROLL_CLASS}
        style={{
          ...sipMediaPageWrapStyle,
          ...(isCompact ? { padding: 8 } : {}),
        }}
        data-native-scroll
      >
        <div style={sipMediaPageInnerStyle}>
        {message.text && !saving && (
          <Alert
            severity={
              message.type === "error"
                ? "error"
                : message.type === "success"
                  ? "success"
                  : "info"
            }
            onClose={() => setMessage({ type: "", text: "" })}
            sx={sipMediaFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <SipMediaBreadcrumb
          root={SIP_MEDIA_PAGE_BREADCRUMB_ROOT}
          section={SIP_MEDIA_PAGE_BREADCRUMB_SECTION}
          current={SIP_MEDIA_PAGE_TITLE}
        />

        <div style={advancedCardShellStyle}>
          <div style={advancedTableContainerStyle}>
            <div style={sipHeaderStyle}>
              <span>{SIP_MEDIA_CARD_TITLE}</span>
            </div>

            {loading ? (
              <div
                className="flex items-center justify-center w-full"
                style={{ minHeight: 400, padding: "48px 32px" }}
              >
                <div className="text-center">
                  <CircularProgress size={40} sx={{ color: C.accent }} />
                  <div
                    style={{
                      marginTop: 12,
                      fontSize: 13,
                      color: C.mutedText,
                      fontWeight: 500,
                    }}
                  >
                    {SIP_MEDIA_LOADING_TEXT}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div
                  className={SIP_MEDIA_SCROLL_CLASS}
                  style={{ boxSizing: "border-box" }}
                >
                  <SipMediaFormBody
                    formData={formData}
                    isCompact={isCompact}
                    handleInputChange={handleInputChange}
                    isFieldVisible={isFieldVisible}
                  />
                </div>

                <div style={advancedFormInlineFooterStyle}>
                  <Btn
                    variant="primary"
                    onClick={handleSave}
                    disabled={loading || saving}
                    style={advancedFormBtnStyle}
                  >
                    {saving ? (
                      <>
                        <CircularProgress size={14} color="inherit" />
                        {SIP_MEDIA_BTN_SAVING}
                      </>
                    ) : (
                      SIP_MEDIA_BTN_SAVE
                    )}
                  </Btn>
                  <Btn
                    variant="cancel"
                    onClick={handleReset}
                    style={advancedFormBtnStyle}
                  >
                    {SIP_MEDIA_BTN_RESET}
                  </Btn>
                </div>
              </>
            )}
          </div>
        </div>
        </div>
      </div>
    </>
  );
};

export default SipMediaPage;
