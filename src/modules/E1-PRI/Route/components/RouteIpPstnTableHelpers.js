import {
  extensionCancelBtnStyle as routeIpPstnCancelBtnStyle,
  extensionFixedAlertSx as routeIpPstnFixedAlertSx,
  extensionPageInnerStyle as routeIpPstnPageInnerStyle,
  extensionPageWrapStyle as routeIpPstnPageWrapStyle,
  addNewModalFooterBtnStyle as routeIpPstnToolbarBtnStyle,
  extensionSelectedBadgeStyle as routeIpPstnSelectedBadgeStyle,
  getExtensionRowBg as getRouteIpPstnRowBg,
} from "../../../../components/common";

export {
  routeIpPstnCancelBtnStyle,
  routeIpPstnFixedAlertSx,
  routeIpPstnPageInnerStyle,
  routeIpPstnPageWrapStyle,
  routeIpPstnToolbarBtnStyle,
  routeIpPstnSelectedBadgeStyle,
  getRouteIpPstnRowBg,
};

export const getRouteIpPstnEditIconStyle = (loadingDelete) => ({
  cursor: loadingDelete ? "not-allowed" : "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: loadingDelete ? 0.4 : 0.7,
  transition: "opacity 0.15s ease",
});

export const handleRouteIpPstnEditIconHover = (
  e,
  entering,
  loadingDelete = false,
) => {
  if (loadingDelete) return;
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

export const routeIpPstnTableScrollStyle = {
  overflowX: "auto",
  overflowY: "auto",
  flex: 1,
};
