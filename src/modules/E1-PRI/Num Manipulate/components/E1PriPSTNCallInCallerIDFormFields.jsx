export {
  E1PriNumManipulateBtn as E1PriPSTNCallInCallerIDBtn,
  E1PriNumManipulateTH as E1PriPSTNCallInCallerIDTH,
  E1PriNumManipulateFieldLabel as E1PriPSTNCallInCallerIDFieldLabel,
  E1PriNumManipulateFieldRow as E1PriPSTNCallInCallerIDFieldRow,
  E1PriNumManipulateModalFormFields as E1PriPSTNCallInCallerIDModalFormFields,
  e1PriNumManipulateCardStyle as e1PriPSTNCallInCallerIDCardStyle,
  e1PriNumManipulateToolbarStyle as e1PriPSTNCallInCallerIDToolbarStyle,
  e1PriNumManipulatePaginationStyle as e1PriPSTNCallInCallerIDPaginationStyle,
  e1PriNumManipulatePageBadgeStyle as e1PriPSTNCallInCallerIDPageBadgeStyle,
  e1PriNumManipulateCancelBtnStyle as e1PriPSTNCallInCallerIDCancelBtnStyle,
  e1PriNumManipulateToolbarBtnStyle as e1PriPSTNCallInCallerIDToolbarBtnStyle,
  e1PriNumManipulateAddNewModalFooterStyle as e1PriPSTNCallInCallerIDAddNewModalFooterStyle,
  e1PriNumManipulateAddNewModalFooterBtnStyle as e1PriPSTNCallInCallerIDAddNewModalFooterBtnStyle,
  e1PriNumManipulateAddNewModalFooterCancelBtnStyle as e1PriPSTNCallInCallerIDAddNewModalFooterCancelBtnStyle,
  e1PriNumManipulateCheckboxSx as e1PriPSTNCallInCallerIDCheckboxSx,
  e1PriNumManipulateTdStyle as e1PriPSTNCallInCallerIDTdStyle,
  e1PriNumManipulateC as e1PriPSTNCallInCallerIDC,
  createE1PriNumManipulateDialogConfig,
  createE1PriNumManipulateBreadcrumb,
} from "./E1PriNumManipulateSharedFormFields";

import {
  createE1PriNumManipulateBreadcrumb as createBreadcrumb,
  createE1PriNumManipulateDialogConfig,
} from "./E1PriNumManipulateSharedFormFields";
import {
  NUM_MANIPULATE_PSTN_CALL_IN_CALLERID_PAGE_BREADCRUMB_SECTION,
  NUM_MANIPULATE_PSTN_CALL_IN_CALLERID_PAGE_TITLE,
} from "../../../../constants/E1PriPSTNCallInCallerIDConstants";

export const E1PriPSTNCallInCallerIDBreadcrumb = createBreadcrumb(
  NUM_MANIPULATE_PSTN_CALL_IN_CALLERID_PAGE_BREADCRUMB_SECTION,
  NUM_MANIPULATE_PSTN_CALL_IN_CALLERID_PAGE_TITLE,
);

export const e1PriPSTNCallInCallerIDDialogConfig =
  createE1PriNumManipulateDialogConfig(600);
