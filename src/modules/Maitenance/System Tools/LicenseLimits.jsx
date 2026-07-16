import React from "react";
import { Alert } from "@mui/material";
import { LICENSE_LIMITS_MESSAGE_DEFAULT } from "../../../constants/LicenseLimitsConstants";
import { useLicenseLimitsPage } from "./hooks/useLicenseLimitsPage";
import {
  LicenseLimitsPageShell,
  LicenseLimitsBreadcrumb,
  LicenseLimitsCard,
  LicenseLimitsNote,
  licenseLimitsFixedAlertSx,
} from "./components/LicenseLimitsFormFields";

const LicenseLimits = () => {
  const vm = useLicenseLimitsPage();
  const { form, loading, message, setMessage, handleChange, handleSave } = vm;

  return (
    <LicenseLimitsPageShell>
      {message.text && (
        <Alert
          severity={message.type}
          onClose={() => setMessage(LICENSE_LIMITS_MESSAGE_DEFAULT)}
          sx={{ ...licenseLimitsFixedAlertSx, top: 16, right: 16 }}
        >
          {message.text}
        </Alert>
      )}

      <LicenseLimitsBreadcrumb />

      <LicenseLimitsCard
        form={form}
        loading={loading}
        onChange={handleChange}
        onSave={handleSave}
      />

      <LicenseLimitsNote />
    </LicenseLimitsPageShell>
  );
};

export default LicenseLimits;
