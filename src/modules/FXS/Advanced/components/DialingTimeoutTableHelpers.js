import { C } from "../../../../theme/pbxTokens";

import { tdStyle } from "../../../../components/common";

export { extensionPageWrapStyle as dialingTimeoutPageWrapStyle, extensionPageInnerStyle as dialingTimeoutPageInnerStyle, extensionCardStyle as dialingTimeoutCardStyle, extensionToolbarStyle as dialingTimeoutHeaderStyle, extensionFixedAlertSx as dialingTimeoutFixedAlertSx, EXTENSION_TABLE_CARD_RADIUS as DIALING_TIMEOUT_CARD_RADIUS, TH as TH, tdStyle as tdStyle } from "../../../../components/common";





export const dialingTimeoutHeaderTitleStyle = {
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  whiteSpace: "nowrap",
};

export const dialingTimeoutTableBodyStyle = {
  overflowX: "auto",
  width: "100%",
};

export const dialingTimeoutTableStyle = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: 0,
};

export const routeTdStyle = {
  ...tdStyle,
  fontSize: 12,
  padding: "7px 8px",
};

export const routeThExtra = {
  fontSize: 10.5,
  padding: "9px 8px",
  letterSpacing: "0.04em",
};

export const dialingTimeoutEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

export const handleDialingTimeoutEditIconHover = (e, isHover) => {
  e.currentTarget.style.opacity = isHover ? "1" : "0.7";
};
