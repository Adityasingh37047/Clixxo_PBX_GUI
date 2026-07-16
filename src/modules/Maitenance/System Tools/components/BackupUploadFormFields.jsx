import React from "react";
import { CircularProgress } from "@mui/material";
import {
  BACKUP_UPLOAD_TITLES,
  BACKUP_UPLOAD_LABELS,
  BACKUP_UPLOAD_BUTTON_LABELS,
  BACKUP_UPLOAD_BUTTON_VARIANTS,
  BACKUP_UPLOAD_BUTTON_STYLE,
  BACKUP_UPLOAD_CHOOSE_FILE_BUTTON_STYLE,
  BACKUP_UPLOAD_BREADCRUMB,
  BACKUP_UPLOAD_STATUS,
  BACKUP_UPLOAD_FILE,
} from "../../../../constants/BackupUploadConstants";
import { C } from "../../../../theme/pbxTokens";
import { Btn, ExtensionBreadcrumb } from "../../../../components/common";
import {
  backupUploadPageWrapStyle,
  backupUploadPageInnerStyle,
  backupUploadTableContainerStyle,
  backupUploadHeaderStyle,
  backupUploadFixedAlertSx,
} from "./BackupUploadTableHelpers";

export { backupUploadFixedAlertSx };

export const BackupUploadPageShell = ({ children }) => (
  <div style={backupUploadPageWrapStyle} data-native-scroll>
    <div style={backupUploadPageInnerStyle}>{children}</div>
  </div>
);

export const BackupUploadBreadcrumb = () => (
  <ExtensionBreadcrumb
    root={BACKUP_UPLOAD_BREADCRUMB[0]}
    section={BACKUP_UPLOAD_BREADCRUMB[1]}
    current={BACKUP_UPLOAD_BREADCRUMB[2]}
  />
);

export const BackupSection = ({ loadingBackup, loadingRestore, onDownload }) => (
  <div style={backupUploadTableContainerStyle}>
    <div style={backupUploadHeaderStyle}>
      <span>{BACKUP_UPLOAD_TITLES.BACKUP}</span>
    </div>
    <div
      className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      style={{ padding: "24px 20px" }}
    >
      <span
        style={{
          fontSize: 14,
          color: C.valueText,
          fontWeight: 500,
          flex: 1,
        }}
      >
        {BACKUP_UPLOAD_LABELS.BACKUP_INSTRUCTION}
      </span>
      <div style={{ flexShrink: 0 }}>
        <Btn
          variant={BACKUP_UPLOAD_BUTTON_VARIANTS.BACKUP}
          onClick={onDownload}
          disabled={loadingBackup || loadingRestore}
          style={BACKUP_UPLOAD_BUTTON_STYLE}
        >
          {loadingBackup ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CircularProgress size={16} sx={{ color: "inherit" }} />
              {BACKUP_UPLOAD_STATUS.BACKING_UP}
            </div>
          ) : (
            BACKUP_UPLOAD_BUTTON_LABELS.BACKUP
          )}
        </Btn>
      </div>
    </div>
  </div>
);

export const RestoreSection = ({
  fileName,
  fileInputRef,
  loadingBackup,
  loadingRestore,
  onFileChange,
  onRestore,
}) => (
  <div style={{ ...backupUploadTableContainerStyle, marginTop: 20 }}>
    <div style={backupUploadHeaderStyle}>
      <span>{BACKUP_UPLOAD_TITLES.UPLOAD}</span>
    </div>
    <div
      className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4"
      style={{ padding: "24px 20px" }}
    >
      <span
        style={{
          fontSize: 14,
          color: C.valueText,
          fontWeight: 500,
          flex: 1,
        }}
      >
        {BACKUP_UPLOAD_LABELS.UPLOAD_INSTRUCTION}
      </span>
      <div
        className="flex flex-col sm:flex-row sm:items-center gap-4"
        style={{ flexShrink: 0 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={BACKUP_UPLOAD_FILE.ACCEPT_EXTENSION}
          onChange={onFileChange}
          className="hidden"
          id={BACKUP_UPLOAD_FILE.INPUT_ID}
          disabled={loadingBackup || loadingRestore}
        />
        <Btn
          variant={BACKUP_UPLOAD_BUTTON_VARIANTS.CHOOSE_FILE}
          onClick={() => fileInputRef.current?.click()}
          disabled={loadingBackup || loadingRestore}
          style={BACKUP_UPLOAD_CHOOSE_FILE_BUTTON_STYLE}
        >
          {BACKUP_UPLOAD_BUTTON_LABELS.CHOOSE_FILE}
        </Btn>
        <span
          style={{
            fontSize: 13,
            color:
              fileName === BACKUP_UPLOAD_LABELS.NO_FILE
                ? C.mutedText
                : C.valueText,
            minWidth: 150,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: 200,
          }}
        >
          {fileName}
        </span>
        <Btn
          variant={BACKUP_UPLOAD_BUTTON_VARIANTS.RESTORE}
          onClick={onRestore}
          disabled={loadingBackup || loadingRestore}
          style={BACKUP_UPLOAD_BUTTON_STYLE}
        >
          {loadingRestore ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CircularProgress size={16} sx={{ color: "inherit" }} />
              {BACKUP_UPLOAD_STATUS.RESTORING}
            </div>
          ) : (
            BACKUP_UPLOAD_BUTTON_LABELS.RESTORE
          )}
        </Btn>
      </div>
    </div>
  </div>
);
