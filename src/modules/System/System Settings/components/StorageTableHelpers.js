import {
  EXTENSION_TABLE_CARD_RADIUS as CARD_RADIUS,
  extensionPageWrapStyle as storagePageWrapStyle,
  extensionPageInnerStyle as storagePageInnerStyle,
  extensionCardStyle as storageCardStyle,
  extensionToolbarStyle as storageToolbarStyle,
  extensionFixedAlertSx as storageFixedAlertSx,
  extensionCancelBtnStyle as storageCancelBtnStyle,
  extensionPrimaryBtnStyle as storagePrimaryBtnStyle,
  addNewModalFooterBtnStyle as storageFormBtnStyle,
} from "../../../../components/common";

export const FIELD_RADIUS = 6;

export const STORAGE_CARD_SHADOW =
  "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)";

export const getStorageDeviceRowBg = (idx) =>
  idx % 2 === 1 ? "#f8fafc" : "#ffffff";

export {
  CARD_RADIUS,
  storagePageWrapStyle,
  storagePageInnerStyle,
  storageCardStyle,
  storageToolbarStyle,
  storageFixedAlertSx,
  storageCancelBtnStyle,
  storagePrimaryBtnStyle,
  storageFormBtnStyle,
};
