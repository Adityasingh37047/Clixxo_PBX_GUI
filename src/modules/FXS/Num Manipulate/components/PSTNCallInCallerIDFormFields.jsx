export {
  NumManipulateBtn as PSTNCallInCallerIDBtn,
  NumManipulateTH as PSTNCallInCallerIDTH,
  NumManipulateFieldLabel as PSTNCallInCallerIDFieldLabel,
  NumManipulateModalFormFields as PSTNCallInCallerIDModalFormFields,
  numManipulateCardStyle as pSTNCallInCallerIDCardStyle,
  numManipulateToolbarStyle as pSTNCallInCallerIDToolbarStyle,
  numManipulatePaginationStyle as pSTNCallInCallerIDPaginationStyle,
  numManipulateAddNewModalFooterStyle as pSTNCallInCallerIDAddNewModalFooterStyle,
  numManipulateAddNewModalFooterBtnStyle as pSTNCallInCallerIDAddNewModalFooterBtnStyle,
  numManipulateAddNewModalFooterCancelBtnStyle as pSTNCallInCallerIDAddNewModalFooterCancelBtnStyle,
  numManipulateAddNewModalBackdropSlotProps as pSTNCallInCallerIDAddNewModalBackdropSlotProps,
  numManipulateAddNewModalDialogContentSx as pSTNCallInCallerIDAddNewModalDialogContentSx,
  numManipulateMuiTextFieldSx as pSTNCallInCallerIDMuiTextFieldSx,
  numManipulateMuiSelectSx as pSTNCallInCallerIDMuiSelectSx,
  numManipulateCheckboxSx as pSTNCallInCallerIDCheckboxSx,
  numManipulateTdStyle as pSTNCallInCallerIDTdStyle,
  createNumManipulateDialogConfig,
  createNumManipulateBreadcrumb,
} from "./NumManipulateSharedFormFields";

import {
  createNumManipulateBreadcrumb as createBreadcrumb,
  createNumManipulateDialogConfig,
} from "./NumManipulateSharedFormFields";
import {
  PSTN_CALL_IN_CALLERID_PAGE_BREADCRUMB_ROOT,
  PSTN_CALL_IN_CALLERID_PAGE_BREADCRUMB_SECTION,
  PSTN_CALL_IN_CALLERID_PAGE_TITLE,
} from "../../../../constants/FxsPSTNCallInCallerIDConstants";

export const PSTNCallInCallerIDBreadcrumb = createBreadcrumb(
  PSTN_CALL_IN_CALLERID_PAGE_BREADCRUMB_ROOT,
  PSTN_CALL_IN_CALLERID_PAGE_BREADCRUMB_SECTION,
  PSTN_CALL_IN_CALLERID_PAGE_TITLE,
);

export const pSTNCallInCallerIDDialogConfig = createNumManipulateDialogConfig("PSTNCallInCallerID");
