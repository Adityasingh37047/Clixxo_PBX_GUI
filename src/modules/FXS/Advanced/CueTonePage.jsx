import React from "react";
import { Alert } from "@mui/material";
import {
  CUE_TONE_CARD_TITLE,
  CUE_TONE_NOTE_TEXT,
  CUE_TONE_PAGE_BREADCRUMB_SECTION,
  CUE_TONE_PAGE_TITLE,
} from "../../../constants/CueToneConstants";
import { C } from "../../../theme/pbxTokens";
import {
  Btn,
  ExtensionBreadcrumb as CueToneBreadcrumb,
  extensionPageWrapStyle as cueTonePageWrapStyle,
  extensionPageInnerStyle as cueTonePageInnerStyle,
  extensionCardStyle as cueToneCardStyle,
  extensionFixedAlertSx as cueToneFixedAlertSx,
} from "../../../components/common";
import { useCueTonePage } from "./hooks/useCueTonePage";
import { getCueToneFileTypes } from "./utils/CueToneTransformers";
import {
  CueToneFieldRow,
  nativeFieldInteraction,
  nativeFieldSelectStyle,
} from "./components/CueToneFormFields";
import {
  advancedCardTitleBarStyle,
  cueToneFieldsColStyle,
  cueToneFileBtnStyle,
  cueToneFormBodyStyle,
  cueToneNoteStyle,
} from "./components/CueToneTableHelpers";

const CueTonePage = () => {
  const vm = useCueTonePage();
  const {
    formData,
    fileName,
    fileInputRef,
    toast,
    clearToast,
    handleFileChange,
    handleInputChange,
    handleUpload,
  } = vm;
  const fileTypes = getCueToneFileTypes();

  return (
    <div style={cueTonePageWrapStyle}>
      <div style={cueTonePageInnerStyle}>
        {toast.msg && (
          <Alert
            severity={toast.type}
            onClose={clearToast}
            sx={cueToneFixedAlertSx}
          >
            {toast.msg}
          </Alert>
        )}

        <CueToneBreadcrumb
          root="FXS"
          section={CUE_TONE_PAGE_BREADCRUMB_SECTION}
          current={CUE_TONE_PAGE_TITLE}
        />

        <div style={cueToneCardStyle}>
        <div style={advancedCardTitleBarStyle}>
          <span>{CUE_TONE_CARD_TITLE}</span>
        </div>

        <div style={cueToneFormBodyStyle}>
          <div style={cueToneFieldsColStyle}>
            <CueToneFieldRow
              label="Upload a file of cue tone"
              tooltipKey="fileType"
            >
              <select
                name="fileType"
                value={formData.fileType}
                onChange={handleInputChange}
                style={nativeFieldSelectStyle}
                {...nativeFieldInteraction}
              >
                {fileTypes.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </CueToneFieldRow>

            <CueToneFieldRow
              label="File"
              align="flex-start"
              tooltipKey="file"
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                  width: "100%",
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".wav"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  id="cue-tone-file-input"
                />
                <Btn
                  variant="cancel"
                  onClick={() => fileInputRef.current?.click()}
                  style={cueToneFileBtnStyle}
                >
                  Choose file
                </Btn>
                <span style={{ fontSize: 13, color: C.mutedText }}>
                  {fileName}
                </span>
                <Btn
                  variant="primary"
                  onClick={handleUpload}
                  style={cueToneFileBtnStyle}
                >
                  Upload
                </Btn>
              </div>
            </CueToneFieldRow>

            <p style={cueToneNoteStyle}>{CUE_TONE_NOTE_TEXT}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CueTonePage;
