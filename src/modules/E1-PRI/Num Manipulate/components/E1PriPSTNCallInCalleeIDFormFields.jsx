export {
  E1PriNumManipulateBtn as E1PriPSTNCallInCalleeIDBtn,
  E1PriNumManipulateTH as E1PriPSTNCallInCalleeIDTH,
  E1PriNumManipulateFieldLabel as E1PriPSTNCallInCalleeIDFieldLabel,
  E1PriNumManipulateFieldRow as E1PriPSTNCallInCalleeIDFieldRow,
  E1PriNumManipulateModalFormFields as E1PriPSTNCallInCalleeIDModalFormFields,
  e1PriNumManipulateCardStyle as e1PriPSTNCallInCalleeIDCardStyle,
  e1PriNumManipulateToolbarStyle as e1PriPSTNCallInCalleeIDToolbarStyle,
  e1PriNumManipulatePaginationStyle as e1PriPSTNCallInCalleeIDPaginationStyle,
  e1PriNumManipulatePageBadgeStyle as e1PriPSTNCallInCalleeIDPageBadgeStyle,
  e1PriNumManipulateCancelBtnStyle as e1PriPSTNCallInCalleeIDCancelBtnStyle,
  e1PriNumManipulateToolbarBtnStyle as e1PriPSTNCallInCalleeIDToolbarBtnStyle,
  e1PriNumManipulateAddNewModalFooterStyle as e1PriPSTNCallInCalleeIDAddNewModalFooterStyle,
  e1PriNumManipulateAddNewModalFooterBtnStyle as e1PriPSTNCallInCalleeIDAddNewModalFooterBtnStyle,
  e1PriNumManipulateAddNewModalFooterCancelBtnStyle as e1PriPSTNCallInCalleeIDAddNewModalFooterCancelBtnStyle,
  e1PriNumManipulateCheckboxSx as e1PriPSTNCallInCalleeIDCheckboxSx,
  e1PriNumManipulateTdStyle as e1PriPSTNCallInCalleeIDTdStyle,
  e1PriNumManipulateC as e1PriPSTNCallInCalleeIDC,
  createE1PriNumManipulateDialogConfig,
  createE1PriNumManipulateBreadcrumb,
} from "./E1PriNumManipulateSharedFormFields";

import {
  createE1PriNumManipulateBreadcrumb as createBreadcrumb,
  createE1PriNumManipulateDialogConfig,
} from "./E1PriNumManipulateSharedFormFields";
import {
  NUM_MANIPULATE_PSTN_CALL_IN_CALLEEID_PAGE_BREADCRUMB_SECTION,
  NUM_MANIPULATE_PSTN_CALL_IN_CALLEEID_PAGE_TITLE,
} from "../../../../constants/E1PriPSTNCallInCalleeIDConstants";

export const E1PriPSTNCallInCalleeIDBreadcrumb = createBreadcrumb(
  NUM_MANIPULATE_PSTN_CALL_IN_CALLEEID_PAGE_BREADCRUMB_SECTION,
  NUM_MANIPULATE_PSTN_CALL_IN_CALLEEID_PAGE_TITLE,
);

export const e1PriPSTNCallInCalleeIDDialogConfig =
  createE1PriNumManipulateDialogConfig(600);
