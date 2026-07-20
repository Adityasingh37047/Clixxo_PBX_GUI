import React from "react";
import { CircularProgress, Alert } from "@mui/material";
import {
  ROUTE_ROUTING_PARAMETER_CARD_TITLE,
  ROUTE_ROUTING_PARAMETER_SAVE_LABEL,
  ROUTE_ROUTING_PARAMETER_PAGE_BREADCRUMB_ROOT,
  ROUTE_ROUTING_PARAMETER_PAGE_BREADCRUMB_SECTION,
  ROUTE_ROUTING_PARAMETER_PAGE_TITLE,
} from "../../../constants/RouteRoutingParameterPageConstants";
import {
  ExtensionBreadcrumb as RouteRoutingParameterBreadcrumb,
  extensionPageWrapStyle as routeRoutingParameterPageWrapStyle,
  extensionPageInnerStyle as routeRoutingParameterPageInnerStyle,
  extensionCardStyle as routeRoutingParameterCardStyle,
  extensionToolbarStyle as routeRoutingParameterCardTitleBarStyle,
  extensionFixedAlertSx as routeRoutingParameterFixedAlertSx,
  Btn as RouteRoutingParameterBtn,
} from "../../../components/common";
import { useRouteRoutingParameterPage } from "./hooks/useRouteRoutingParameterPage";
import {
  RouteRoutingParameterFormBody,
  routeRoutingParameterFooterBtnStyle,
  routeRoutingParameterFooterStyle,
} from "./components/RouteRoutingParameterFormFields";

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
