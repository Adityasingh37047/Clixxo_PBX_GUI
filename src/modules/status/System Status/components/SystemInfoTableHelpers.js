import {
  extensionPageWrapStyle as systemInfoPageWrapStyle,
  extensionPageInnerStyle as systemInfoPageInnerStyle,
} from "../../../../components/common";

export const SYSTEM_INFO_CARD_HEADER = "#1e2d42";
export const SYSTEM_INFO_WARNING_AMBER = "#d97706";

export const SYSTEM_INFO_CARD_RADIUS = 4;

export const SYSTEM_INFO_CARD_SHADOW =
  "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)";

/** Lighter shadow for top metric tiles — subtle, not same as section cards */
export const SYSTEM_INFO_STAT_CARD_SHADOW =
  "0 1px 3px rgba(15, 23, 42, 0.06), 0 2px 8px rgba(15, 23, 42, 0.05)";

export const infoCardStretchStyle = {
  height: "100%",
  display: "flex",
  flexDirection: "column",
};

export { systemInfoPageWrapStyle, systemInfoPageInnerStyle };
