import React from "react";
import { Alert } from "@mui/material";
import {
  ROUTE_ROUTING_PARAMETER_CARD_TITLE,
  ROUTE_ROUTING_PARAMETER_SAVE_LABEL,
  ROUTE_ROUTING_PARAMETER_RESET_LABEL,
} from "../../../constants/FxsRouteRoutingParameterPageConstants";
import { Btn } from "../../../components/common";
import { useRouteRoutingParameterPage } from "./hooks/useRouteRoutingParameterPage";
import {
  RouteRoutingParameterBreadcrumb,
  routeRoutingParameterCardStyle,
  routeRoutingParameterCardTitleBarStyle,
  routeRoutingParameterFooterBtnStyle,
  routeRoutingParameterFooterStyle,
  routeRoutingParameterPageWrapStyle,
  RouteRoutingParameterFormBody,
} from "./components/RouteRoutingParameterFormFields";
import { routeRoutingParameterFixedAlertSx } from "./components/RouteRoutingParameterTableHelpers";

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

      <RouteRoutingParameterBreadcrumb />

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
