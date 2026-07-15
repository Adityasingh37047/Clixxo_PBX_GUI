export {
  NumManipulateBtn as PSTNCallInCalleeIDBtn,
  NumManipulateTH as PSTNCallInCalleeIDTH,
  NumManipulateFieldLabel as PSTNCallInCalleeIDFieldLabel,
  NumManipulateModalFormFields as PSTNCallInCalleeIDModalFormFields,
  numManipulateCardStyle as pSTNCallInCalleeIDCardStyle,
  numManipulateToolbarStyle as pSTNCallInCalleeIDToolbarStyle,
  numManipulatePaginationStyle as pSTNCallInCalleeIDPaginationStyle,
  numManipulateAddNewModalFooterStyle as pSTNCallInCalleeIDAddNewModalFooterStyle,
  numManipulateAddNewModalFooterBtnStyle as pSTNCallInCalleeIDAddNewModalFooterBtnStyle,
  numManipulateAddNewModalFooterCancelBtnStyle as pSTNCallInCalleeIDAddNewModalFooterCancelBtnStyle,
  numManipulateAddNewModalBackdropSlotProps as pSTNCallInCalleeIDAddNewModalBackdropSlotProps,
  numManipulateAddNewModalDialogContentSx as pSTNCallInCalleeIDAddNewModalDialogContentSx,
  numManipulateMuiTextFieldSx as pSTNCallInCalleeIDMuiTextFieldSx,
  numManipulateMuiSelectSx as pSTNCallInCalleeIDMuiSelectSx,
  numManipulateCheckboxSx as pSTNCallInCalleeIDCheckboxSx,
  numManipulateTdStyle as pSTNCallInCalleeIDTdStyle,
  createNumManipulateDialogConfig,
  createNumManipulateBreadcrumb,
} from "./NumManipulateSharedFormFields";

import {
  createNumManipulateBreadcrumb as createBreadcrumb,
  createNumManipulateDialogConfig,
} from "./NumManipulateSharedFormFields";
import {
  PSTN_CALL_IN_CALLEEID_PAGE_BREADCRUMB_ROOT,
  PSTN_CALL_IN_CALLEEID_PAGE_BREADCRUMB_SECTION,
  PSTN_CALL_IN_CALLEEID_PAGE_TITLE,
} from "../../../../constants/FxsPSTNCallInCalleeIDConstants";

export const PSTNCallInCalleeIDBreadcrumb = createBreadcrumb(
  PSTN_CALL_IN_CALLEEID_PAGE_BREADCRUMB_ROOT,
  PSTN_CALL_IN_CALLEEID_PAGE_BREADCRUMB_SECTION,
  PSTN_CALL_IN_CALLEEID_PAGE_TITLE,
);

export const pSTNCallInCalleeIDDialogConfig = createNumManipulateDialogConfig("PSTNCallInCalleeID");
