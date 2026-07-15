import React from "react";
import { Alert, useMediaQuery } from "@mui/material";
import { CONFIG_FILE_MESSAGE_DEFAULT } from "../../../constants/ConfigFileConstants";
import { useConfigFilePage } from "./hooks/useConfigFilePage";
import {
  CONFIG_FILE_COMPACT_MQ,
  ConfigFilePageShell,
  ConfigFileBreadcrumb,
  ConfigFileEditorCard,
  configFileFixedAlertSx,
} from "./components/ConfigFileFormFields";

const ConfigFile = () => {
  const vm = useConfigFilePage();
  const {
    selectedFile,
    content,
    setContent,
    loading,
    message,
    setMessage,
    textareaRef,
    handleFileChange,
    handleTextareaClick,
    handleSave,
    handleReset,
  } = vm;
  const isCompact = useMediaQuery(CONFIG_FILE_COMPACT_MQ);

  return (
    <ConfigFilePageShell isCompact={isCompact}>
      {message.text && (
        <Alert
          severity={message.type}
          onClose={() => setMessage(CONFIG_FILE_MESSAGE_DEFAULT)}
          sx={{
            ...configFileFixedAlertSx,
            ...(isCompact
              ? { left: 8, right: 8, top: 12, minWidth: 0, maxWidth: "none" }
              : {}),
          }}
        >
          {message.text}
        </Alert>
      )}

      <ConfigFileBreadcrumb />

      <ConfigFileEditorCard
        selectedFile={selectedFile}
        content={content}
        loading={loading}
        textareaRef={textareaRef}
        onFileChange={handleFileChange}
        onContentChange={(e) => setContent(e.target.value)}
        onTextareaClick={handleTextareaClick}
        onSave={handleSave}
        onReset={handleReset}
      />
    </ConfigFilePageShell>
  );
};

export default ConfigFile;
