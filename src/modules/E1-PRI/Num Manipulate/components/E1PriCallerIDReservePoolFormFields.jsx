export {
  E1PriNumManipulateBtn as E1PriCallerIDReservePoolBtn,
  E1PriNumManipulateTH as E1PriCallerIDReservePoolTH,
  E1PriNumManipulateFieldRow as E1PriCallerIDReservePoolFieldRow,
  e1PriNumManipulateInputStyle as e1PriCallerIDReservePoolInputStyle,
  e1PriNumManipulateInputInteraction as e1PriCallerIDReservePoolInputInteraction,
  e1PriNumManipulateFormPanelStyle as e1PriCallerIDReservePoolFormPanelStyle,
  e1PriNumManipulateCardStyle as e1PriCallerIDReservePoolCardStyle,
  e1PriNumManipulateToolbarStyle as e1PriCallerIDReservePoolToolbarStyle,
  e1PriNumManipulateCancelBtnStyle as e1PriCallerIDReservePoolCancelBtnStyle,
  e1PriNumManipulateToolbarBtnStyle as e1PriCallerIDReservePoolToolbarBtnStyle,
  e1PriNumManipulateAddNewModalFooterStyle as e1PriCallerIDReservePoolAddNewModalFooterStyle,
  e1PriNumManipulateAddNewModalFooterBtnStyle as e1PriCallerIDReservePoolAddNewModalFooterBtnStyle,
  e1PriNumManipulateAddNewModalFooterCancelBtnStyle as e1PriCallerIDReservePoolAddNewModalFooterCancelBtnStyle,
  e1PriNumManipulateCheckboxSx as e1PriCallerIDReservePoolCheckboxSx,
  e1PriNumManipulateTdStyle as e1PriCallerIDReservePoolTdStyle,
  e1PriNumManipulateC as e1PriCallerIDReservePoolC,
  createE1PriNumManipulateDialogConfig,
  createE1PriNumManipulateBreadcrumb,
} from "./E1PriNumManipulateSharedFormFields";

import {
  createE1PriNumManipulateBreadcrumb as createBreadcrumb,
  createE1PriNumManipulateDialogConfig,
} from "./E1PriNumManipulateSharedFormFields";
import {
  NUM_MANIPULATE_CALLERID_RESERVE_POOL_PAGE_BREADCRUMB_SECTION,
  NUM_MANIPULATE_CALLERID_RESERVE_POOL_PAGE_TITLE,
} from "../../../../constants/E1PriCallerIDReservePoolConstants";

export const E1PriCallerIDReservePoolBreadcrumb = createBreadcrumb(
  NUM_MANIPULATE_CALLERID_RESERVE_POOL_PAGE_BREADCRUMB_SECTION,
  NUM_MANIPULATE_CALLERID_RESERVE_POOL_PAGE_TITLE,
);

export const e1PriCallerIDReservePoolDialogConfig =
  createE1PriNumManipulateDialogConfig(500);
