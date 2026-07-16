import React from "react";
import { Alert } from "@mui/material";
import {
  SIP_ACCOUNT_CARD_TITLE,
  SIP_ACCOUNT_TOAST_DEFAULT,
} from "../../../constants/SIPAccountGeneratorConstants";
import { useSIPAccountGeneratorPage } from "./hooks/useSIPAccountGeneratorPage";
import {
  SIPAccountGeneratorPageShell,
  SIPAccountGeneratorBreadcrumb,
  SIPAccountGeneratorFormPanel,
  SIPAccountUploadPanel,
  SIPAccountDownloadPanel,
  sipGenFixedAlertSx,
  sipGenTableContainerStyle,
  sipGenHeaderStyle,
} from "./components/SIPAccountGeneratorFormFields";

const SIPAccountGenerator = () => {
  const vm = useSIPAccountGeneratorPage();
  const {
    form,
    toast,
    setToast,
    fileName,
    fileInputRef,
    handleInputChange,
    handleFileChange,
    handleSave,
    handleUpload,
    handleDownload,
    handleChooseFile,
  } = vm;

  return (
    <SIPAccountGeneratorPageShell>
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={() => setToast(SIP_ACCOUNT_TOAST_DEFAULT)}
          sx={sipGenFixedAlertSx}
        >
          {toast.msg}
        </Alert>
      )}

      <SIPAccountGeneratorBreadcrumb />

      <form onSubmit={handleSave} autoComplete="off">
        <div style={sipGenTableContainerStyle}>
          <div style={sipGenHeaderStyle}>
            <span>{SIP_ACCOUNT_CARD_TITLE}</span>
          </div>

          <SIPAccountGeneratorFormPanel
            form={form}
            onChange={handleInputChange}
          />
        </div>
      </form>

      <SIPAccountUploadPanel
        fileName={fileName}
        fileInputRef={fileInputRef}
        onFileChange={handleFileChange}
        onChooseFile={handleChooseFile}
        onUpload={handleUpload}
      />

      <SIPAccountDownloadPanel onDownload={handleDownload} />
    </SIPAccountGeneratorPageShell>
  );
};

export default SIPAccountGenerator;
