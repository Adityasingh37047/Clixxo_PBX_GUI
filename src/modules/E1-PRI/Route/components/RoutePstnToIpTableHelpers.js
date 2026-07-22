import {
  extensionCancelBtnStyle as routePstnToIpCancelBtnStyle,
  extensionFixedAlertSx as routePstnToIpFixedAlertSx,
  extensionPageInnerStyle as routePstnToIpPageInnerStyle,
  extensionPageWrapStyle as routePstnToIpPageWrapStyle,
  addNewModalFooterBtnStyle as routePstnToIpToolbarBtnStyle,
  extensionSelectedBadgeStyle as routePstnToIpSelectedBadgeStyle,
  getExtensionRowBg as getRoutePstnToIpRowBg,
} from "../../../../components/common";

export {
  routePstnToIpCancelBtnStyle,
  routePstnToIpFixedAlertSx,
  routePstnToIpPageInnerStyle,
  routePstnToIpPageWrapStyle,
  routePstnToIpToolbarBtnStyle,
  routePstnToIpSelectedBadgeStyle,
  getRoutePstnToIpRowBg,
};

export const getRoutePstnToIpEditIconStyle = (loadingDelete) => ({
  cursor: loadingDelete ? "not-allowed" : "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: loadingDelete ? 0.4 : 0.7,
  transition: "opacity 0.15s ease",
});

export const handleRoutePstnToIpEditIconHover = (
  e,
  entering,
  loadingDelete = false,
) => {
  if (loadingDelete) return;
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

export const routePstnToIpTableScrollStyle = {
  overflowX: "auto",
  overflowY: "auto",
  flex: 1,
};
