import { C } from "../../../../theme/pbxTokens";
import {
  EXTENSION_TABLE_CARD_RADIUS as PCM_PSTN_CARD_RADIUS,
  extensionCancelBtnStyle as pcmPstnCancelBtnStyle,
  extensionFixedAlertSx as pcmPstnFixedAlertSx,
  extensionPageInnerStyle as pcmPstnPageInnerStyle,
  extensionPageWrapStyle as pcmPstnPageWrapStyle,
  addNewModalFooterBtnStyle as pcmPstnToolbarBtnStyle,
  extensionSelectedBadgeStyle as pcmPstnSelectedBadgeStyle,
  getExtensionRowBg as getPcmPstnRowBg,
} from "../../../../components/common";

export {
  PCM_PSTN_CARD_RADIUS,
  pcmPstnCancelBtnStyle,
  pcmPstnFixedAlertSx,
  pcmPstnPageInnerStyle,
  pcmPstnPageWrapStyle,
  pcmPstnToolbarBtnStyle,
  pcmPstnSelectedBadgeStyle,
  getPcmPstnRowBg,
};

export const pcmPstnEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

export const getPcmPstnEditIconStyle = (loadingDelete = false) => ({
  cursor: loadingDelete ? "not-allowed" : "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: loadingDelete ? 0.4 : 0.7,
  transition: "opacity 0.15s ease",
});

export const handlePcmPstnEditIconHover = (
  e,
  entering,
  loadingDelete = false,
) => {
  if (loadingDelete) return;
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

export const pcmPstnTableScrollStyle = {
  overflowX: "auto",
  overflowY: "auto",
  flex: 1,
};

export const pcmPstnModalCancelBtnStyle = {
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

export { C as pcmPstnC };
export { PCM_PSTN_CARD_RADIUS as CARD_RADIUS };
