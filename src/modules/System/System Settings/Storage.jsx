import React from "react";
import { Alert, CircularProgress } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  Btn,
  extensionFixedAlertSx as storageFixedAlertSx,
} from "../../../components/common";
import {
  STORAGE_TABS,
  STORAGE_TAB_STATUS_ID,
  STORAGE_TAB_AUTO_CLEANUP_ID,
  STORAGE_TAB_BACKUPS_ID,
  STORAGE_BTN_SAVE,
  STORAGE_BTN_SAVING,
  STORAGE_BTN_REFRESH,
  STORAGE_BTN_RESET,
  STORAGE_BTN_FTP_TEST,
  STORAGE_BTN_TESTING,
  STORAGE_BTN_BACKUP_NOW,
  STORAGE_BTN_RUNNING_BACKUP,
} from "../../../constants/StorageConstants";
import { useStoragePage } from "./hooks/useStoragePage";
import {
  STORAGE_COMPACT_MQ,
  STORAGE_LABEL_COL_WIDTH,
  STORAGE_CONTROL_COL_WIDTH,
  STORAGE_FIELD_COL_GAP,
  StoragePageShell,
  StorageBreadcrumb,
  storageTableContainerStyle,
  storageHeaderStyle,
  storageTabButtonsStyle,
  storageHeaderBtnStyle,
  storageHeaderTabBtnStyle,
  StorageStatusPanel,
  StorageAutoCleanupPanel,
  StorageBackupsPanel,
  advancedFormInlineFooterStyle,
  storageFormBtnStyle,
} from "./components/StorageFormFields";

const Storage = () => {
  const isCompact = useMediaQuery(STORAGE_COMPACT_MQ);

  const fieldRowOptions = {
    isCompact,
    labelColWidth: STORAGE_LABEL_COL_WIDTH,
    controlColWidth: STORAGE_CONTROL_COL_WIDTH,
    fieldColGap: STORAGE_FIELD_COL_GAP,
  };

  const backupFieldRowOptions = {
    ...fieldRowOptions,
  };

  const {
    storageStatus,
    activeTab,
    setActiveTab,
    autoCleanupForm,
    backupsForm,
    errors,
    sftpLoading,
    sftpSaving,
    sftpTesting,
    sftpRunningBackup,
    sftpResetting,
    toastMessage,
    setToastMessage,
    handleRefresh,
    handleSaveStorageSettings,
    handleResetStorageSettings,
    handleSaveSftpSettings,
    handleTestSftp,
    handleBackupNow,
    handleResetSftpSettings,
    handleSaveActiveTab,
    handleAutoCleanupChange,
    handleBackupsChange,
  } = useStoragePage();

  return (
    <StoragePageShell>
      {toastMessage.text && (
        <Alert
          severity={
            toastMessage.type === "error"
              ? "error"
              : toastMessage.type === "warning"
              ? "warning"
              : "success"
          }
          onClose={() => setToastMessage({ type: "", text: "" })}
          sx={storageFixedAlertSx}
        >
          {toastMessage.text}
        </Alert>
      )}

      <StorageBreadcrumb />

      <div style={storageTableContainerStyle}>
        <div style={storageHeaderStyle}>
          <div style={storageTabButtonsStyle}>
            {STORAGE_TABS.map((tabItem) => (
              <Btn
                key={tabItem.id}
                type="button"
                variant={
                  activeTab === tabItem.id ? "tabActive" : "tabInactive"
                }
                onClick={() => setActiveTab(tabItem.id)}
                style={storageHeaderTabBtnStyle}
              >
                {tabItem.label}
              </Btn>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
            }}
          >
            {activeTab === STORAGE_TAB_STATUS_ID && (
              <Btn
                variant="cancel"
                type="button"
                style={storageHeaderBtnStyle}
                onClick={handleRefresh}
              >
                {STORAGE_BTN_REFRESH}
              </Btn>
            )}

            {activeTab === STORAGE_TAB_AUTO_CLEANUP_ID && (
              <>
                <Btn
                  variant="cancel"
                  type="button"
                  style={storageHeaderBtnStyle}
                  onClick={handleRefresh}
                >
                  {STORAGE_BTN_REFRESH}
                </Btn>
                <Btn
                  variant="cancel"
                  type="button"
                  style={storageHeaderBtnStyle}
                  onClick={handleResetStorageSettings}
                >
                  {STORAGE_BTN_RESET}
                </Btn>
              </>
            )}

            {activeTab === STORAGE_TAB_BACKUPS_ID && (
              <>
                <Btn
                  variant="cancel"
                  type="button"
                  style={storageHeaderBtnStyle}
                  disabled={sftpLoading || sftpResetting}
                  onClick={handleRefresh}
                >
                  {STORAGE_BTN_REFRESH}
                </Btn>
                <Btn
                  variant="cancel"
                  type="button"
                  style={storageHeaderBtnStyle}
                  disabled={sftpLoading || sftpResetting || sftpRunningBackup}
                  onClick={handleResetSftpSettings}
                >
                  {STORAGE_BTN_RESET}
                </Btn>
              </>
            )}
          </div>
        </div>

        <div style={{ padding: 0, boxSizing: "border-box" }}>
          <form
            id="storage-settings-form"
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col"
            style={{ width: "100%" }}
          >
            {activeTab === STORAGE_TAB_STATUS_ID && (
              <StorageStatusPanel
                isCompact={isCompact}
                storageStatus={storageStatus}
              />
            )}

            {activeTab === STORAGE_TAB_AUTO_CLEANUP_ID && (
              <StorageAutoCleanupPanel
                isCompact={isCompact}
                autoCleanupForm={autoCleanupForm}
                errors={errors}
                onChange={handleAutoCleanupChange}
                fieldRowOptions={fieldRowOptions}
              />
            )}

            {activeTab === STORAGE_TAB_BACKUPS_ID && (
              <StorageBackupsPanel
                isCompact={isCompact}
                backupsForm={backupsForm}
                onChange={handleBackupsChange}
                backupFieldRowOptions={backupFieldRowOptions}
                sftpLoading={sftpLoading}
              />
            )}
          </form>
        </div>

        {activeTab !== STORAGE_TAB_STATUS_ID && (
          <div style={advancedFormInlineFooterStyle}>
            <Btn
              variant="primary"
              type="button"
              disabled={sftpSaving || sftpTesting || sftpRunningBackup || sftpResetting}
              onClick={handleSaveActiveTab}
              style={storageFormBtnStyle}
            >
              {activeTab === STORAGE_TAB_BACKUPS_ID && sftpSaving
                ? STORAGE_BTN_SAVING
                : STORAGE_BTN_SAVE}
            </Btn>

            {activeTab === STORAGE_TAB_BACKUPS_ID && (
              <>
                <Btn
                  variant="cancel"
                  type="button"
                  disabled={sftpSaving || sftpTesting || sftpRunningBackup || sftpResetting}
                  onClick={handleTestSftp}
                  style={storageFormBtnStyle}
                >
                  {sftpTesting ? (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <CircularProgress size={12} color="inherit" />
                      {STORAGE_BTN_TESTING}
                    </span>
                  ) : (
                    STORAGE_BTN_FTP_TEST
                  )}
                </Btn>

                <Btn
                  variant="cancel"
                  type="button"
                  disabled={sftpSaving || sftpTesting || sftpRunningBackup || sftpResetting}
                  onClick={handleBackupNow}
                  style={storageFormBtnStyle}
                >
                  {sftpRunningBackup ? (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <CircularProgress size={12} color="inherit" />
                      {STORAGE_BTN_RUNNING_BACKUP}
                    </span>
                  ) : (
                    STORAGE_BTN_BACKUP_NOW
                  )}
                </Btn>
              </>
            )}
          </div>
        )}
      </div>
    </StoragePageShell>
  );
};

export default Storage;
