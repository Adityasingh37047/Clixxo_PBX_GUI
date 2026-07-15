import React from "react";
import { Alert, CircularProgress, useMediaQuery } from "@mui/material";
import {
  AUTH_BTN_REFRESH,
  AUTH_BTN_LOADING,
} from "../../../constants/AuthorizationConstants";
import { Btn } from "../../../components/common";
import { useAuthorizationPage } from "./hooks/useAuthorizationPage";
import {
  AUTH_COMPACT_MQ,
  AUTH_TOOLTIPS,
  AuthorizationPageShell,
  AuthorizationBreadcrumb,
  AuthorizationCard,
  AuthorizationFieldRow,
  AuthorizationLicenseNote,
  authorizationFixedAlertSx,
  authorizationFooterBtnStyle,
} from "./components/AuthorizationFormFields";

const Authorization = () => {
  const vm = useAuthorizationPage();
  const { error, setError, busy, statusColor, rows, refreshAll } = vm;
  const isCompact = useMediaQuery(AUTH_COMPACT_MQ);

  return (
    <AuthorizationPageShell isCompact={isCompact}>
      {error && (
        <Alert
          severity="error"
          onClose={() => setError("")}
          sx={{
            ...authorizationFixedAlertSx,
            ...(isCompact
              ? { left: 8, right: 8, top: 12, minWidth: 0, maxWidth: "none" }
              : {}),
          }}
        >
          {error}
        </Alert>
      )}

      <AuthorizationBreadcrumb />

      <AuthorizationCard
        isCompact={isCompact}
        footer={
          <Btn
            type="button"
            variant="primary"
            onClick={refreshAll}
            disabled={busy}
            style={authorizationFooterBtnStyle}
          >
            {busy ? (
              <>
                <CircularProgress size={14} color="inherit" />
                {AUTH_BTN_LOADING}
              </>
            ) : (
              AUTH_BTN_REFRESH
            )}
          </Btn>
        }
      >
        {rows.map((row) => (
          <AuthorizationFieldRow
            key={row.label}
            label={row.label}
            value={row.value}
            tooltip={AUTH_TOOLTIPS[row.label]}
            loading={row.loading}
            isStatus={row.isStatus}
            statusColor={statusColor}
            isCompact={isCompact}
          />
        ))}
      </AuthorizationCard>

      <AuthorizationLicenseNote isCompact={isCompact} />
    </AuthorizationPageShell>
  );
};

export default Authorization;
