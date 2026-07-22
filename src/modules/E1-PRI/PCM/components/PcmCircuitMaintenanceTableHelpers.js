import { C } from "../../../../theme/pbxTokens";
import {
  EXTENSION_TABLE_CARD_RADIUS as PCM_CIRCUIT_MAINTENANCE_CARD_RADIUS,
  extensionCancelBtnStyle as pcmCircuitMaintenanceCancelBtnStyle,
  extensionFixedAlertSx as pcmCircuitMaintenanceFixedAlertSx,
  extensionPageInnerStyle as pcmCircuitMaintenancePageInnerStyle,
  extensionPageWrapStyle as pcmCircuitMaintenancePageWrapStyle,
  addNewModalFooterBtnStyle as pcmCircuitMaintenanceToolbarBtnStyle,
  extensionSelectedBadgeStyle as pcmCircuitMaintenanceSelectedBadgeStyle,
  getExtensionRowBg as getPcmCircuitMaintenanceRowBg,
} from "../../../../components/common";

export {
  PCM_CIRCUIT_MAINTENANCE_CARD_RADIUS,
  pcmCircuitMaintenanceCancelBtnStyle,
  pcmCircuitMaintenanceFixedAlertSx,
  pcmCircuitMaintenancePageInnerStyle,
  pcmCircuitMaintenancePageWrapStyle,
  pcmCircuitMaintenanceToolbarBtnStyle,
  pcmCircuitMaintenanceSelectedBadgeStyle,
  getPcmCircuitMaintenanceRowBg,
};

export const pcmCircuitMaintenanceEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

export const getPcmCircuitMaintenanceEditIconStyle = (loadingDelete = false) => ({
  cursor: loadingDelete ? "not-allowed" : "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: loadingDelete ? 0.4 : 0.7,
  transition: "opacity 0.15s ease",
});

export const handlePcmCircuitMaintenanceEditIconHover = (
  e,
  entering,
  loadingDelete = false,
) => {
  if (loadingDelete) return;
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

export const pcmCircuitMaintenanceTableScrollStyle = {
  overflowX: "auto",
  overflowY: "auto",
  flex: 1,
};

export const pcmCircuitMaintenanceModalCancelBtnStyle = {
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

export { C as pcmCircuitMaintenanceC };
export { PCM_CIRCUIT_MAINTENANCE_CARD_RADIUS as CARD_RADIUS };
