import { C } from "../../../../theme/pbxTokens";
import {
  EXTENSION_TABLE_CARD_RADIUS as PCM_TRUNK_CARD_RADIUS,
  extensionCancelBtnStyle as pcmTrunkCancelBtnStyle,
  extensionFixedAlertSx as pcmTrunkFixedAlertSx,
  extensionPageInnerStyle as pcmTrunkPageInnerStyle,
  extensionPageWrapStyle as pcmTrunkPageWrapStyle,
  addNewModalFooterBtnStyle as pcmTrunkToolbarBtnStyle,
  extensionSelectedBadgeStyle as pcmTrunkSelectedBadgeStyle,
  getExtensionRowBg as getPcmTrunkRowBg,
} from "../../../../components/common";

export {
  PCM_TRUNK_CARD_RADIUS,
  pcmTrunkCancelBtnStyle,
  pcmTrunkFixedAlertSx,
  pcmTrunkPageInnerStyle,
  pcmTrunkPageWrapStyle,
  pcmTrunkToolbarBtnStyle,
  pcmTrunkSelectedBadgeStyle,
  getPcmTrunkRowBg,
};

export const pcmTrunkEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

export const getPcmTrunkEditIconStyle = (loadingDelete = false) => ({
  cursor: loadingDelete ? "not-allowed" : "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: loadingDelete ? 0.4 : 0.7,
  transition: "opacity 0.15s ease",
});

export const handlePcmTrunkEditIconHover = (
  e,
  entering,
  loadingDelete = false,
) => {
  if (loadingDelete) return;
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

export const pcmTrunkTableScrollStyle = {
  overflowX: "auto",
  overflowY: "auto",
  flex: 1,
};

export const pcmTrunkModalCancelBtnStyle = {
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

export { C as pcmTrunkC };
export { PCM_TRUNK_CARD_RADIUS as CARD_RADIUS };
