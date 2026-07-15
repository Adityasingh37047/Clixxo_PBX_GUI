export {
  E1PriNumManipulateBtn as E1PriCallerIDPoolBtn,
  E1PriNumManipulateTH as E1PriCallerIDPoolTH,
  E1PriNumManipulateFieldLabel as E1PriCallerIDPoolFieldLabel,
  E1PriNumManipulateFieldRow as E1PriCallerIDPoolFieldRow,
  e1PriNumManipulateInputStyle as e1PriCallerIDPoolInputStyle,
  e1PriNumManipulateSelectStyle as e1PriCallerIDPoolSelectStyle,
  e1PriNumManipulateInputInteraction as e1PriCallerIDPoolInputInteraction,
  e1PriNumManipulateFormPanelStyle as e1PriCallerIDPoolFormPanelStyle,
  e1PriNumManipulateAddNewModalFooterStyle as e1PriCallerIDPoolAddNewModalFooterStyle,
  e1PriNumManipulateAddNewModalFooterBtnStyle as e1PriCallerIDPoolAddNewModalFooterBtnStyle,
  e1PriNumManipulateAddNewModalFooterCancelBtnStyle as e1PriCallerIDPoolAddNewModalFooterCancelBtnStyle,
  e1PriNumManipulateCheckboxSx as e1PriCallerIDPoolCheckboxSx,
  e1PriNumManipulateTdStyle as e1PriCallerIDPoolTdStyle,
  e1PriNumManipulateC as e1PriCallerIDPoolC,
  createE1PriNumManipulateDialogConfig,
  createE1PriNumManipulateBreadcrumb,
} from "./E1PriNumManipulateSharedFormFields";

import {
  createE1PriNumManipulateBreadcrumb as createBreadcrumb,
  createE1PriNumManipulateDialogConfig,
} from "./E1PriNumManipulateSharedFormFields";
import {
  NUM_MANIPULATE_CALLERID_POOL_PAGE_BREADCRUMB_SECTION,
  NUM_MANIPULATE_CALLERID_POOL_PAGE_TITLE,
} from "../../../../constants/E1PriCallerIDPoolConstants";

export const E1PriCallerIDPoolBreadcrumb = createBreadcrumb(
  NUM_MANIPULATE_CALLERID_POOL_PAGE_BREADCRUMB_SECTION,
  NUM_MANIPULATE_CALLERID_POOL_PAGE_TITLE,
);

export const e1PriCallerIDPoolDialogConfig =
  createE1PriNumManipulateDialogConfig(500);
