import React from "react";
import { Alert, CircularProgress } from "@mui/material";
import {
  ROUTING_INTERFACE_CARD_TITLE,
  ROUTING_INTERFACE_BTN_SWITCH,
  ROUTING_INTERFACE_BTN_CANCEL,
  ROUTING_INTERFACE_BTN_APPLY,
  ROUTING_INTERFACE_BTN_APPLYING,
  ROUTING_INTERFACE_LOADING_TEXT,
} from "../../../constants/RoutingInterfaceConstants";
import { C } from "../../../theme/pbxTokens";
import { Btn } from "../../../components/common";
import { useRoutingInterfacePage } from "./hooks/useRoutingInterfacePage";
import {
  RoutingPageShell,
  RoutingBreadcrumb,
  RoutingCurrentPanel,
  RoutingActiveRoutesTable,
  RoutingSwitchForm,
  routingFixedAlertSx,
  routingTableContainerStyle,
  routingToolbarStyle,
  routingHeaderBtnStyle,
  advancedFormInlineFooterStyle,
  advancedFormBtnStyle,
} from "./components/RoutingInterfaceFormFields";

const RoutingInterface = () => {
  const vm = useRoutingInterfacePage();
  const {
    loading,
    saving,
    errorMsg,
    setErrorMsg,
    successMsg,
    setSuccessMsg,
    current,
    activeRoutes,
    interfaces,
    showForm,
    form,
    formIp,
    formSubnet,
    errors,
    handleOpenForm,
    handleIfaceChange,
    handleFormChange,
    handleSave,
    handleCancel,
  } = vm;

  return (
    <RoutingPageShell>
      {errorMsg && (
        <Alert
          severity="error"
          onClose={() => setErrorMsg("")}
          sx={routingFixedAlertSx}
        >
          {errorMsg}
        </Alert>
      )}
      {successMsg && (
        <Alert
          severity="success"
          onClose={() => setSuccessMsg("")}
          sx={{
            ...routingFixedAlertSx,
            top: errorMsg ? 88 : 20,
          }}
        >
          {successMsg}
        </Alert>
      )}

      <RoutingBreadcrumb />

      <div style={routingTableContainerStyle}>
        <div style={routingToolbarStyle}>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: C.labelText,
              letterSpacing: "0.02em",
            }}
          >
            {ROUTING_INTERFACE_CARD_TITLE}
          </span>
          {!loading && !showForm && (
            <Btn
              variant="primary"
              onClick={handleOpenForm}
              style={routingHeaderBtnStyle}
            >
              {ROUTING_INTERFACE_BTN_SWITCH}
            </Btn>
          )}
        </div>

        <div
          style={{
            padding: showForm && !loading ? "24px 36px 0" : "24px 36px 24px",
          }}
        >
          {loading ? (
            <div
              className="flex items-center justify-center w-full"
              style={{ minHeight: 400, padding: "48px 32px" }}
            >
              <div className="text-center">
                <CircularProgress size={40} sx={{ color: C.accent }} />
                <div
                  style={{
                    marginTop: 12,
                    fontSize: 13,
                    color: C.mutedText,
                    fontWeight: 500,
                  }}
                >
                  {ROUTING_INTERFACE_LOADING_TEXT}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <RoutingCurrentPanel current={current} />
              <RoutingActiveRoutesTable
                activeRoutes={activeRoutes}
                currentInterface={current.interface}
              />
              {showForm && (
                <RoutingSwitchForm
                  form={form}
                  formIp={formIp}
                  formSubnet={formSubnet}
                  interfaces={interfaces}
                  errors={errors}
                  onIfaceChange={handleIfaceChange}
                  onFormChange={handleFormChange}
                  onSubmit={handleSave}
                />
              )}
            </div>
          )}
        </div>

        {showForm && !loading && (
          <div style={advancedFormInlineFooterStyle}>
            <Btn
              variant="primary"
              type="submit"
              form="routing-switch-form"
              disabled={saving}
              style={advancedFormBtnStyle}
            >
              {saving
                ? ROUTING_INTERFACE_BTN_APPLYING
                : ROUTING_INTERFACE_BTN_APPLY}
            </Btn>
            <Btn
              variant="cancel"
              type="button"
              onClick={handleCancel}
              disabled={saving}
              style={advancedFormBtnStyle}
            >
              {ROUTING_INTERFACE_BTN_CANCEL}
            </Btn>
          </div>
        )}
      </div>
    </RoutingPageShell>
  );
};

export default RoutingInterface;
