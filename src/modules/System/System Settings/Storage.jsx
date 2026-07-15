import React from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  STORAGE_BTN_SAVE,
  STORAGE_BTN_REFRESH,
  STORAGE_TABS,
  STORAGE_TAB_STATUS_ID,
  STORAGE_TAB_AUTO_CLEANUP_ID,
  STORAGE_TAB_BACKUPS_ID,
} from "../../../constants/StorageConstants";
import { Btn } from "../../../components/common";
import { useStoragePage } from "./hooks/useStoragePage";
import {
  STORAGE_COMPACT_MQ,
  STORAGE_LABEL_COL_WIDTH,
  STORAGE_BACKUP_LABEL_COL_WIDTH,
  STORAGE_BACKUP_CONTROL_COL_WIDTH,
  STORAGE_BACKUP_FIELD_COL_GAP,
  StoragePageShell,
  StorageBreadcrumb,
  StorageStatusPanel,
  StorageAutoCleanupPanel,
  StorageBackupsPanel,
  storageTableContainerStyle,
  storageHeaderStyle,
  storageTabButtonsStyle,
  storageHeaderBtnStyle,
  storageHeaderTabBtnStyle,
  advancedFormInlineFooterStyle,
  storageFormBtnStyle,
} from "./components/StorageFormFields";

const Storage = () => {
  const vm = useStoragePage();
  const {
    storageStatus,
    activeTab,
    setActiveTab,
    autoCleanupForm,
    backupsForm,
    errors,
    handleRefresh,
    handleSaveStorageSettings,
    handleAutoCleanupChange,
    handleBackupsChange,
  } = vm;

  const isCompact = useMediaQuery(STORAGE_COMPACT_MQ);
  const labelColWidth = isCompact ? 160 : STORAGE_LABEL_COL_WIDTH;

  const backupFieldRowOptions = {
    labelColWidth: isCompact ? 180 : STORAGE_BACKUP_LABEL_COL_WIDTH,
    controlColWidth: isCompact ? 240 : STORAGE_BACKUP_CONTROL_COL_WIDTH,
    fieldColGap: STORAGE_BACKUP_FIELD_COL_GAP,
  };

  return (
    <StoragePageShell>
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
          <Btn
            variant="cancel"
            type="button"
            style={storageHeaderBtnStyle}
            onClick={handleRefresh}
          >
            {STORAGE_BTN_REFRESH}
          </Btn>
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
                labelColWidth={labelColWidth}
                storageStatus={storageStatus}
              />
            )}

            {activeTab === STORAGE_TAB_AUTO_CLEANUP_ID && (
              <StorageAutoCleanupPanel
                isCompact={isCompact}
                labelColWidth={labelColWidth}
                autoCleanupForm={autoCleanupForm}
                errors={errors}
                onChange={handleAutoCleanupChange}
              />
            )}

            {activeTab === STORAGE_TAB_BACKUPS_ID && (
              <StorageBackupsPanel
                isCompact={isCompact}
                backupsForm={backupsForm}
                onChange={handleBackupsChange}
                backupFieldRowOptions={backupFieldRowOptions}
              />
            )}
          </form>
        </div>

        {activeTab !== STORAGE_TAB_STATUS_ID && (
          <div style={advancedFormInlineFooterStyle}>
            <Btn
              variant="primary"
              type="submit"
              form="storage-settings-form"
              onClick={handleSaveStorageSettings}
              style={storageFormBtnStyle}
            >
              {STORAGE_BTN_SAVE}
            </Btn>
          </div>
        )}
      </div>
    </StoragePageShell>
  );
};

export default Storage;
