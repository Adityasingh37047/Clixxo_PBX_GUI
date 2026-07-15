import React from "react";
import { Alert, CircularProgress } from "@mui/material";
import {
  FEATURE_CODE_BREADCRUMB_SECTION,
  FEATURE_CODE_TITLE,
} from "../../../constants/FeatureCodeConstants";
import {
  Btn,
  ExtensionBreadcrumb as FeatureCodeBreadcrumb,
  ExtensionTableListLoading as FeatureCodeTableListLoading,
  extensionFixedAlertSx as featureCodeFixedAlertSx,
  extensionPageWrapStyle as featureCodePageWrapStyle,
  extensionPageInnerStyle as featureCodePageInnerStyle,
  extensionCardStyle as featureCodeCardStyle,
} from "../../../components/common";
import { useFeatureCodePage } from "./hooks/useFeatureCodePage";
import { FeatureCodeFormSections } from "./components/FeatureCodeFormFields";
import {
  featureCodeFooterBtnStyle,
  featureCodeFooterStyle,
  featureCodeFormBodyStyle,
  featureCodeHeaderStyle,
} from "./components/FeatureCodeTableHelpers";

const FeatureCodePage = () => {
  const vm = useFeatureCodePage();
  const {
    isCompact,
    stackFieldPairs,
    form,
    message,
    setMessage,
    loading,
    saving,
    timeoutDestinationOptions,
    handleChange,
    handleSave,
  } = vm;

  return (
    <div
      style={{
        ...featureCodePageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
      data-native-scroll
    >
      <div style={featureCodePageInnerStyle}>
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={{
              ...featureCodeFixedAlertSx,
              ...(isCompact
                ? {
                    left: 8,
                    right: 8,
                    top: 12,
                    minWidth: 0,
                    maxWidth: "none",
                    width: "calc(100% - 16px)",
                  }
                : {}),
            }}
          >
            {message.text}
          </Alert>
        )}

        <FeatureCodeBreadcrumb
          section={FEATURE_CODE_BREADCRUMB_SECTION}
          current={FEATURE_CODE_TITLE}
        />

        <div style={featureCodeCardStyle}>
          <div
            style={{
              ...featureCodeHeaderStyle,
              ...(isCompact ? { padding: "7px 12px" } : {}),
            }}
          >
            <span>{FEATURE_CODE_TITLE}</span>
          </div>

          <div
            style={{
              padding: isCompact ? "12px 12px 0" : "12px 20px 0",
              boxSizing: "border-box",
            }}
          >
            {loading ? (
              <FeatureCodeTableListLoading />
            ) : (
              <div style={{ ...featureCodeFormBodyStyle, paddingBottom: 16 }}>
                <FeatureCodeFormSections
                  form={form}
                  isCompact={isCompact}
                  stackFieldPairs={stackFieldPairs}
                  timeoutDestinationOptions={timeoutDestinationOptions}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>

          {!loading && (
            <div
              style={{
                ...featureCodeFooterStyle,
                ...(isCompact ? { padding: "10px 12px" } : {}),
              }}
            >
              <Btn
                variant="primary"
                onClick={handleSave}
                disabled={saving}
                style={featureCodeFooterBtnStyle}
              >
                {saving ? (
                  <>
                    <CircularProgress size={14} color="inherit" />
                    Saving...
                  </>
                ) : (
                  "SAVE"
                )}
              </Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeatureCodePage;
