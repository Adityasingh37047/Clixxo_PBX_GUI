import { C } from "../../../../theme/pbxTokens";

import { EXTENSION_TABLE_CARD_RADIUS as E1_PRI_CARD_RADIUS, extensionCancelBtnStyle as e1PriCancelBtnStyle, extensionFixedAlertSx as e1PriFixedAlertSx, extensionPageInnerStyle as e1PriPageInnerStyle, extensionPageWrapStyle as e1PriPageWrapStyle, addNewModalFooterBtnStyle as e1PriToolbarBtnStyle, extensionSelectedBadgeStyle, getExtensionRowBg } from "../../../../components/common";



export const getPcmSharedRowBg = getExtensionRowBg;

export const pcmSharedEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

export const getPcmSharedEditIconStyle = (loadingDelete = false) => ({
  cursor: loadingDelete ? "not-allowed" : "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: loadingDelete ? 0.4 : 0.7,
  transition: "opacity 0.15s ease",
});

export const handlePcmSharedEditIconHover = (
  e,
  entering,
  loadingDelete = false,
) => {
  if (loadingDelete) return;
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

export const pcmSharedFixedAlertSx = e1PriFixedAlertSx;
export const pcmSharedPageWrapStyle = e1PriPageWrapStyle;
export const pcmSharedPageInnerStyle = e1PriPageInnerStyle;
export const pcmSharedSelectedBadgeStyle = extensionSelectedBadgeStyle;
export const pcmSharedToolbarBtnStyle = e1PriToolbarBtnStyle;
export const pcmSharedCancelBtnStyle = e1PriCancelBtnStyle;

export const pcmSharedTableScrollStyle = {
  overflowX: "auto",
  overflowY: "auto",
  flex: 1,
};

export const pcmSharedModalCancelBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 4,
  minWidth: 100,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

export { E1_PRI_CARD_RADIUS as PCM_SHARED_CARD_RADIUS };
export { C as pcmSharedC };
