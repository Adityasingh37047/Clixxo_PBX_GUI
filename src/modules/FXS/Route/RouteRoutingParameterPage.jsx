import React from "react";
import { Alert } from "@mui/material";
import {
  ROUTE_ROUTING_PARAMETER_CARD_TITLE,
  ROUTE_ROUTING_PARAMETER_SAVE_LABEL,
  ROUTE_ROUTING_PARAMETER_RESET_LABEL,
  ROUTE_ROUTING_PARAMETER_PAGE_BREADCRUMB_ROOT,
  ROUTE_ROUTING_PARAMETER_PAGE_BREADCRUMB_SECTION,
  ROUTE_ROUTING_PARAMETER_PAGE_TITLE,
} from "../../../constants/FxsRouteRoutingParameterPageConstants";
import {
  Btn,
  ExtensionBreadcrumb as RouteRoutingParameterBreadcrumb,
  extensionPageWrapStyle as routeRoutingParameterPageWrapStyle,
  extensionCardStyle as routeRoutingParameterCardStyle,
  extensionFixedAlertSx as routeRoutingParameterFixedAlertSx,
} from "../../../components/common";
import { useRouteRoutingParameterPage } from "./hooks/useRouteRoutingParameterPage";
import {
  routeRoutingParameterCardTitleBarStyle,
  routeRoutingParameterFooterBtnStyle,
  routeRoutingParameterFooterStyle,
  RouteRoutingParameterFormBody,
} from "./components/RouteRoutingParameterFormFields";

const RouteRoutingParameterPage = () => {
  const vm = useRouteRoutingParameterPage();
  const {
    formData,
    loading,
    toast,
    setToast,
    handleInputChange,
    handleNumberKeyPress,
    handleSave,
    handleReset,
  } = vm;

  return (
    <div style={routeRoutingParameterPageWrapStyle}>
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={() => setToast({ msg: "", type: "success" })}
          sx={routeRoutingParameterFixedAlertSx}
        >
          {toast.msg}
        </Alert>
      )}

      <RouteRoutingParameterBreadcrumb
        root={ROUTE_ROUTING_PARAMETER_PAGE_BREADCRUMB_ROOT}
        section={ROUTE_ROUTING_PARAMETER_PAGE_BREADCRUMB_SECTION}
        current={ROUTE_ROUTING_PARAMETER_PAGE_TITLE}
      />

      <div style={routeRoutingParameterCardStyle}>
        <div style={routeRoutingParameterCardTitleBarStyle}>
          {ROUTE_ROUTING_PARAMETER_CARD_TITLE}
        </div>

        <RouteRoutingParameterFormBody
          formData={formData}
          handleInputChange={handleInputChange}
          handleNumberKeyPress={handleNumberKeyPress}
        />

        <div style={routeRoutingParameterFooterStyle}>
          <Btn
            type="button"
            variant="primary"
            onClick={handleSave}
            disabled={loading}
            style={routeRoutingParameterFooterBtnStyle}
          >
            {loading ? "Saving..." : ROUTE_ROUTING_PARAMETER_SAVE_LABEL}
          </Btn>
          <Btn
            type="button"
            variant="cancel"
            onClick={handleReset}
            style={routeRoutingParameterFooterBtnStyle}
          >
            {ROUTE_ROUTING_PARAMETER_RESET_LABEL}
          </Btn>
        </div>
      </div>
    </div>
  );
};

export default RouteRoutingParameterPage;
