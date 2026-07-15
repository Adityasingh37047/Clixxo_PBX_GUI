import { extensionCancelBtnStyle as e1PriCancelBtnStyle, extensionFixedAlertSx as e1PriFixedAlertSx, extensionPageInnerStyle as e1PriPageInnerStyle, extensionPageWrapStyle as e1PriPageWrapStyle, addNewModalFooterBtnStyle as e1PriToolbarBtnStyle, extensionSelectedBadgeStyle, getExtensionRowBg } from "../../../../components/common";



export const getRouteSharedRowBg = getExtensionRowBg;

export const getRouteSharedEditIconStyle = (loadingDelete) => ({
  cursor: loadingDelete ? "not-allowed" : "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: loadingDelete ? 0.4 : 0.7,
  transition: "opacity 0.15s ease",
});

export const handleRouteSharedEditIconHover = (
  e,
  entering,
  loadingDelete = false,
) => {
  if (loadingDelete) return;
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

export const routeSharedFixedAlertSx = e1PriFixedAlertSx;
export const routeSharedPageWrapStyle = e1PriPageWrapStyle;
export const routeSharedPageInnerStyle = e1PriPageInnerStyle;
export const routeSharedSelectedBadgeStyle = extensionSelectedBadgeStyle;
export const routeSharedToolbarBtnStyle = e1PriToolbarBtnStyle;
export const routeSharedCancelBtnStyle = e1PriCancelBtnStyle;

export const routeSharedTableScrollStyle = {
  overflowX: "auto",
  overflowY: "auto",
  flex: 1,
};
