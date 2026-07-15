import { EXTENSION_TABLE_CARD_RADIUS as E1_PRI_CARD_RADIUS, extensionCancelBtnStyle as e1PriCancelBtnStyle, extensionFixedAlertSx as e1PriFixedAlertSx, extensionPageInnerStyle as e1PriPageInnerStyle, extensionPageWrapStyle as e1PriPageWrapStyle, addNewModalFooterBtnStyle as e1PriToolbarBtnStyle, extensionSelectedBadgeStyle, getExtensionRowBg } from "../../../../components/common";





export const getE1PriNumManipulateRowBg = getExtensionRowBg;



export const e1PriNumManipulateEditIconStyle = {

  cursor: "pointer",

  color: "#2563eb",

  fontSize: 22,

  opacity: 0.7,

  transition: "opacity 0.15s ease",

};



export const getE1PriNumManipulateEditIconStyle = (loadingDelete) => ({

  cursor: loadingDelete ? "not-allowed" : "pointer",

  color: "#2563eb",

  fontSize: 22,

  opacity: loadingDelete ? 0.4 : 0.7,

  transition: "opacity 0.15s ease",

});



export const handleE1PriNumManipulateEditIconHover = (

  e,

  entering,

  loadingDelete = false,

) => {

  if (loadingDelete) return;

  e.currentTarget.style.opacity = entering ? "1" : "0.7";

};



export const e1PriNumManipulateFixedAlertSx = e1PriFixedAlertSx;

export const e1PriNumManipulatePageWrapStyle = e1PriPageWrapStyle;

export const e1PriNumManipulatePageInnerStyle = e1PriPageInnerStyle;



export const e1PriNumManipulateSelectedBadgeStyle = extensionSelectedBadgeStyle;



export const e1PriNumManipulateToolbarBtnStyle = e1PriToolbarBtnStyle;

export const e1PriNumManipulateCancelBtnStyle = e1PriCancelBtnStyle;

export const e1PriNumManipulateToolbarBtnStyleFromHelpers = e1PriToolbarBtnStyle;



export const e1PriNumManipulateLoadingWrapStyle = {

  display: "flex",

  justifyContent: "center",

  alignItems: "center",

  padding: 48,

  borderBottomLeftRadius: E1_PRI_CARD_RADIUS,

  borderBottomRightRadius: E1_PRI_CARD_RADIUS,

};



export const e1PriNumManipulateEmptyWrapStyle = {

  display: "flex",

  flexDirection: "column",

  alignItems: "center",

  justifyContent: "center",

  minHeight: 240,

  padding: 24,

  textAlign: "center",

  borderBottomLeftRadius: E1_PRI_CARD_RADIUS,

  borderBottomRightRadius: E1_PRI_CARD_RADIUS,

};



export const e1PriNumManipulateEmptyTitleStyle = {

  color: "#3E5475",

  fontSize: 13,

  fontWeight: 600,

  marginBottom: 16,

};



export const e1PriNumManipulateTableScrollStyle = {

  overflowX: "auto",

  overflowY: "auto",

  flex: 1,

  maxHeight: 460,

};



export { E1_PRI_CARD_RADIUS as E1_PRI_NUM_MANIPULATE_CARD_RADIUS };

export { E1_PRI_CARD_RADIUS as NUM_MANIPULATE_CARD_RADIUS };


