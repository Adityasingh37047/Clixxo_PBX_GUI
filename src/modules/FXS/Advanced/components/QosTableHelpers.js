import {
  C } from "../../../../theme/pbxTokens";

import { extensionToolbarStyle as fxsToolbarStyle,
  extensionTableCheckboxSx as qosCheckboxSx,
} from "../../../../components/common";

export { qosCheckboxSx };


export const fxsFormInlineFooterStyle = {
  display: "flex",
  justifyContent: "center",
  gap: 12,
  padding: "10px 28px",
  borderTop: `1px solid ${C.divider}`,
  background: C.cardBg,
  boxSizing: "border-box",
};

export { EXTENSION_TABLE_CARD_RADIUS as QOS_CARD_RADIUS, extensionPageWrapStyle as qosPageWrapStyle, extensionCardStyle as qosCardStyle, addNewModalFooterBtnStyle as qosFormBtnStyle, extensionFixedAlertSx as qosFixedAlertSx } from "../../../../components/common";

export { fxsFormInlineFooterStyle as qosFooterStyle };





export const qosFieldBg = "#ffffff";

export const qosCardTitleBarStyle = {
  ...fxsToolbarStyle,
  justifyContent: "flex-start",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
};

export const qosFormBodyStyle = {
  padding: "20px 28px 8px",
  display: "flex",
  flexDirection: "column",
  maxWidth: 720,
  width: "100%",
  margin: "0 auto",
  boxSizing: "border-box",
};


