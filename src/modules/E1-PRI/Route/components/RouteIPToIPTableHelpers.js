import {
  extensionCancelBtnStyle as routeIPToIPCancelBtnStyle,
  extensionFixedAlertSx as routeIPToIPFixedAlertSx,
  extensionPageInnerStyle as routeIPToIPPageInnerStyle,
  extensionPageWrapStyle as routeIPToIPPageWrapStyle,
  addNewModalFooterBtnStyle as routeIPToIPToolbarBtnStyle,
  extensionSelectedBadgeStyle as routeIPToIPSelectedBadgeStyle,
  getExtensionRowBg as getRouteIPToIPRowBg,
} from "../../../../components/common";

export {
  routeIPToIPCancelBtnStyle,
  routeIPToIPFixedAlertSx,
  routeIPToIPPageInnerStyle,
  routeIPToIPPageWrapStyle,
  routeIPToIPToolbarBtnStyle,
  routeIPToIPSelectedBadgeStyle,
  getRouteIPToIPRowBg,
};

export const getRouteIPToIPEditIconStyle = (loadingDelete) => ({
  cursor: loadingDelete ? "not-allowed" : "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: loadingDelete ? 0.4 : 0.7,
  transition: "opacity 0.15s ease",
});

export const handleRouteIPToIPEditIconHover = (
  e,
  entering,
  loadingDelete = false,
) => {
  if (loadingDelete) return;
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

export const routeIPToIPTableScrollStyle = {
  overflowX: "auto",
  overflowY: "auto",
  flex: 1,
};
