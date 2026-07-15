import React from "react";
import { Alert, useMediaQuery } from "@mui/material";
import {
  CERTIFICATE_CARD_TITLE,
  CERTIFICATE_TOAST_DEFAULT,
} from "../../../constants/CertificateManageConstants";
import { useCertificateManagePage } from "./hooks/useCertificateManagePage";
import {
  CERTIFICATE_COMPACT_MQ,
  CertificateManagePageShell,
  CertificateManageBreadcrumb,
  CertificateFormPanel,
  CertificateActionFooter,
  CertificateNote,
  certificateFixedAlertSx,
  certificateTableContainerStyle,
  certificateHeaderStyle,
} from "./components/CertificateManageFormFields";

const CertificateManage = () => {
  const vm = useCertificateManagePage();
  const { form, toast, setToast, handleChange, handleAction } = vm;
  const isCompact = useMediaQuery(CERTIFICATE_COMPACT_MQ);

  return (
    <CertificateManagePageShell isCompact={isCompact}>
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={() => setToast(CERTIFICATE_TOAST_DEFAULT)}
          sx={{
            ...certificateFixedAlertSx,
            ...(isCompact
              ? { left: 8, right: 8, top: 12, minWidth: 0, maxWidth: "none" }
              : {}),
          }}
        >
          {toast.msg}
        </Alert>
      )}

      <CertificateManageBreadcrumb />

      <div style={certificateTableContainerStyle}>
        <div style={certificateHeaderStyle}>
          <span>{CERTIFICATE_CARD_TITLE}</span>
        </div>

        <CertificateFormPanel form={form} onChange={handleChange} />

        <CertificateActionFooter onAction={handleAction} />
      </div>

      <CertificateNote />
    </CertificateManagePageShell>
  );
};

export default CertificateManage;
