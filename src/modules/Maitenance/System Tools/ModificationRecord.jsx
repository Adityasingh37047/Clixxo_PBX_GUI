import React from "react";
import { Alert, useMediaQuery } from "@mui/material";
import { MODIFICATION_RECORD_TOAST_DEFAULT } from "../../../constants/ModificationRecordConstants";
import { useModificationRecordPage } from "./hooks/useModificationRecordPage";
import {
  MODIFICATION_RECORD_COMPACT_MQ,
  ModificationRecordPageShell,
  ModificationRecordBreadcrumb,
  ModificationRecordCard,
  ModificationRecordNote,
  modificationRecordFixedAlertSx,
} from "./components/ModificationRecordFormFields";

const ModificationRecord = () => {
  const vm = useModificationRecordPage();
  const {
    outputRef,
    record,
    loading,
    toast,
    setToast,
    handleCheck,
    handleDownload,
  } = vm;
  const isCompact = useMediaQuery(MODIFICATION_RECORD_COMPACT_MQ);

  return (
    <ModificationRecordPageShell isCompact={isCompact}>
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={() => setToast(MODIFICATION_RECORD_TOAST_DEFAULT)}
          sx={{
            ...modificationRecordFixedAlertSx,
            ...(isCompact
              ? { left: 8, right: 8, top: 12, minWidth: 0, maxWidth: "none" }
              : {}),
          }}
        >
          {toast.msg}
        </Alert>
      )}

      <ModificationRecordBreadcrumb />

      <ModificationRecordCard
        outputRef={outputRef}
        record={record}
        loading={loading}
        onCheck={handleCheck}
        onDownload={handleDownload}
      />

      <ModificationRecordNote />
    </ModificationRecordPageShell>
  );
};

export default ModificationRecord;
