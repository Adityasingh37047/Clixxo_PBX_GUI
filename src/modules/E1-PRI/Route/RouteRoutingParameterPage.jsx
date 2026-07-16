import React from "react";
import { CircularProgress, Alert } from "@mui/material";
import {
  ROUTE_ROUTING_PARAMETER_CARD_TITLE,
  ROUTE_ROUTING_PARAMETER_SAVE_LABEL,
} from "../../../constants/RouteRoutingParameterPageConstants";
import { useRouteRoutingParameterPage } from "./hooks/useRouteRoutingParameterPage";
import {
  RouteRoutingParameterBreadcrumb,
  RouteRoutingParameterBtn,
  RouteRoutingParameterFormBody,
  routeRoutingParameterCardStyle,
  routeRoutingParameterCardTitleBarStyle,
  routeRoutingParameterFooterBtnStyle,
  routeRoutingParameterFooterStyle,
  routeRoutingParameterPageInnerStyle,
  routeRoutingParameterPageWrapStyle,
} from "./components/RouteRoutingParameterFormFields";
import { routeRoutingParameterFixedAlertSx } from "./components/RouteRoutingParameterTableHelpers";

const RouteRoutingParameterPage = () => {
  const vm = useRouteRoutingParameterPage();
  const { settings, loading, toast, setToast, handleSave, handleChange } = vm;

  return (
    <div style={routeRoutingParameterPageWrapStyle}>
      <div style={routeRoutingParameterPageInnerStyle}>
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
            settings={settings}
            loading={loading}
            handleChange={handleChange}
          />

          <div style={routeRoutingParameterFooterStyle}>
            <RouteRoutingParameterBtn
              variant="primary"
              onClick={handleSave}
              disabled={loading}
              style={routeRoutingParameterFooterBtnStyle}
            >
              {loading ? (
                <>
                  <CircularProgress size={16} style={{ color: "#fff" }} />
                  Saving...
                </>
              ) : (
                ROUTE_ROUTING_PARAMETER_SAVE_LABEL
              )}
            </RouteRoutingParameterBtn>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteRoutingParameterPage;
