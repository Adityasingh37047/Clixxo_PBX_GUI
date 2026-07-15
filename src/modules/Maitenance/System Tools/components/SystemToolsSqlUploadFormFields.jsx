import React from "react";
import { CircularProgress } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import {
  SQL_UPLOAD_PAGE_TITLE,
  SQL_UPLOAD_BREADCRUMB,
  SQL_UPLOAD_LABELS,
  SQL_UPLOAD_BUTTON_LABELS,
  SQL_UPLOAD_BUTTON_VARIANTS,
  SQL_UPLOAD_BUTTON_STYLE,
  SQL_UPLOAD_UPLOAD_BUTTON_STYLE,
  SQL_UPLOAD_FILE,
} from "../../../../constants/SqlUploadConstants";
import { C } from "../../../../theme/pbxTokens";
import { Btn, ExtensionBreadcrumb } from "../../../../components/common";
import {
  sqlUploadPageWrapStyle,
  sqlUploadPageInnerStyle,
  sqlUploadTableContainerStyle,
  sqlUploadHeaderStyle,
  sqlUploadFixedAlertSx,
} from "./SystemToolsSqlUploadTableHelpers";

export { sqlUploadFixedAlertSx };

export const SystemToolsSqlUploadPageShell = ({ children }) => (
  <div style={sqlUploadPageWrapStyle} data-native-scroll>
    <div style={sqlUploadPageInnerStyle}>{children}</div>
  </div>
);

export const SystemToolsSqlUploadBreadcrumb = () => (
  <ExtensionBreadcrumb
    root={SQL_UPLOAD_BREADCRUMB[0]}
    section={SQL_UPLOAD_BREADCRUMB[1]}
    current={SQL_UPLOAD_BREADCRUMB[2]}
  />
);

export const SqlUploadCard = ({
  fileName,
  fileInputRef,
  isUploading,
  onFileChange,
  onUpload,
}) => (
  <div style={sqlUploadTableContainerStyle}>
    <div style={sqlUploadHeaderStyle}>{SQL_UPLOAD_PAGE_TITLE}</div>
    <div
      style={{
        padding: "32px 24px",
        maxWidth: 500,
        width: "100%",
        margin: "0 auto",
      }}
    >
      <div className="flex flex-col items-center gap-6">
        <div
          className="flex items-center gap-4 w-full"
          style={{
            background: C.pageBg,
            padding: "16px",
            borderRadius: "12px",
            border: `1px dashed ${C.cardBorder}`,
          }}
        >
          <Btn
            variant={SQL_UPLOAD_BUTTON_VARIANTS.CHOOSE_FILE}
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            style={SQL_UPLOAD_BUTTON_STYLE}
          >
            {SQL_UPLOAD_BUTTON_LABELS.CHOOSE_FILE}
          </Btn>
          <input
            ref={fileInputRef}
            id={SQL_UPLOAD_FILE.inputId}
            type="file"
            accept={SQL_UPLOAD_FILE.accept}
            onChange={onFileChange}
            style={{ display: "none" }}
          />
          <span
            style={{
              color: C.mutedText,
              fontSize: 13,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "200px",
            }}
            title={fileName}
          >
            {fileName}
          </span>
        </div>

        <Btn
          variant={SQL_UPLOAD_BUTTON_VARIANTS.UPLOAD}
          onClick={onUpload}
          disabled={isUploading}
          style={SQL_UPLOAD_UPLOAD_BUTTON_STYLE}
        >
          {isUploading ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            <CloudUploadIcon fontSize="small" />
          )}
          <span style={{ marginLeft: "8px" }}>
            {isUploading
              ? SQL_UPLOAD_BUTTON_LABELS.UPLOADING
              : SQL_UPLOAD_BUTTON_LABELS.UPLOAD}
          </span>
        </Btn>

        <div
          style={{
            fontSize: 12,
            color: C.mutedText,
            textAlign: "center",
          }}
        >
          {SQL_UPLOAD_LABELS.instruction}
        </div>
      </div>
    </div>
  </div>
);
