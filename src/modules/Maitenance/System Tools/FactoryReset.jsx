import React from "react";
import { Alert } from "@mui/material";
import { FACTORY_RESET_TOAST_DEFAULT } from "../../../constants/FactoryResetConstants";
import { useFactoryResetPage } from "./hooks/useFactoryResetPage";
import {
  FactoryResetPageShell,
  FactoryResetBreadcrumb,
  FactoryResetCard,
  FactoryResetLoadingOverlay,
  factoryResetFixedAlertSx,
} from "./components/FactoryResetFormFields";

const FactoryReset = () => {
  const vm = useFactoryResetPage();
  const { loading, toast, setToast, handleReset } = vm;

  return (
    <FactoryResetPageShell>
      <FactoryResetBreadcrumb />

      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={() => setToast(FACTORY_RESET_TOAST_DEFAULT)}
          sx={factoryResetFixedAlertSx}
        >
          {toast.msg}
        </Alert>
      )}

      <FactoryResetCard loading={loading} onReset={handleReset} />
      <FactoryResetLoadingOverlay loading={loading} />
    </FactoryResetPageShell>
  );
};

export default FactoryReset;
