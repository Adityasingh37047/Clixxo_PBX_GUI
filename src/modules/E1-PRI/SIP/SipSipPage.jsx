import React from "react";
import { Alert, CircularProgress, useMediaQuery } from "@mui/material";
import {
  SIP_SIP_CARD_TITLE,
  SIP_SIP_BTN_SAVE,
  SIP_SIP_BTN_SAVING,
  SIP_SIP_BTN_RESET,
  SIP_SIP_LOADING_TEXT,
  SIP_SIP_APPLYING_TEXT,
  SIP_SIP_BREADCRUMB_ROOT,
  SIP_SIP_BREADCRUMB_SECTION,
  SIP_SIP_PAGE_TITLE,
} from "../../../constants/SipSipConstants";
import {
  Btn,
  ExtensionBreadcrumb as SipSipBreadcrumb,
  extensionPageWrapStyle as sipSipPageWrapStyle,
  extensionPageInnerStyle as sipSipPageInnerStyle,
  extensionFixedAlertSx as sipSipFixedAlertSx,
} from "../../../components/common";
import { useSipSipPage } from "./hooks/useSipSipPage";
import {
  SipSipScrollbarStyles,
  SipSipFormBody,
  SIP_SIP_COMPACT_MQ,
} from "./components/SipSipFormFields";
import {
  C,
  CARD_RADIUS,
  SIP_SIP_SCROLL_CLASS,
  advancedCardShellStyle,
  advancedTableContainerStyle,
  advancedFormInlineFooterStyle,
  advancedFormBtnStyle,
  sipHeaderStyle,
} from "./components/SipSipTableHelpers";

const SipSipPage = () => {
  const isCompact = useMediaQuery(SIP_SIP_COMPACT_MQ);
  const vm = useSipSipPage();
  const {
    form,
    loading,
    saving,
    message,
    setMessage,
    handleChange,
    handleCheckbox,
    handleSave,
    handleReset,
    isFieldVisible,
  } = vm;

  return (
    <>
      <SipSipScrollbarStyles />
      <div
        className={SIP_SIP_SCROLL_CLASS}
        style={{
          ...sipSipPageWrapStyle,
          ...(isCompact ? { padding: 8 } : {}),
        }}
        data-native-scroll
      >
        <div style={sipSipPageInnerStyle}>
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
            sx={sipSipFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        {saving && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div
              className="bg-white rounded-lg flex flex-col items-center gap-4 pointer-events-auto"
              style={{
                minWidth: "300px",
                padding: "24px 32px",
                border: `1px solid ${C.cardBorder}`,
                boxShadow: C.cardShadow,
                borderRadius: CARD_RADIUS,
              }}
            >
              <CircularProgress size={50} sx={{ color: C.accent }} />
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: C.strongText,
                }}
              >
                {SIP_SIP_APPLYING_TEXT}
              </div>
            </div>
          </div>
        )}

        <SipSipBreadcrumb
          root={SIP_SIP_BREADCRUMB_ROOT}
          section={SIP_SIP_BREADCRUMB_SECTION}
          current={SIP_SIP_PAGE_TITLE}
          style={{ flexShrink: 0, width: "100%" }}
        />

        <div style={advancedCardShellStyle}>
          <div style={advancedTableContainerStyle}>
            <div style={sipHeaderStyle}>
              <span>{SIP_SIP_CARD_TITLE}</span>
            </div>

            <div
              className={SIP_SIP_SCROLL_CLASS}
              style={{ boxSizing: "border-box" }}
            >
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
                      {SIP_SIP_LOADING_TEXT}
                    </div>
                  </div>
                </div>
              ) : (
                <SipSipFormBody
                  form={form}
                  isCompact={isCompact}
                  handleChange={handleChange}
                  handleCheckbox={handleCheckbox}
                  isFieldVisible={isFieldVisible}
                />
              )}
            </div>

            {!loading && (
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
                      {SIP_SIP_BTN_SAVING}
                    </>
                  ) : (
                    SIP_SIP_BTN_SAVE
                  )}
                </Btn>
                <Btn
                  variant="cancel"
                  onClick={handleReset}
                  style={advancedFormBtnStyle}
                >
                  {SIP_SIP_BTN_RESET}
                </Btn>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </>
  );
};

export default SipSipPage;
