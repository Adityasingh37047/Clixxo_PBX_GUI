export {
  NumManipulateBtn as IPCallInCalleeIDBtn,
  NumManipulateTH as IPCallInCalleeIDTH,
  NumManipulateFieldLabel as IPCallInCalleeIDFieldLabel,
  NumManipulateModalFormFields as IPCallInCalleeIDModalFormFields,
  numManipulateCardStyle as iPCallInCalleeIDCardStyle,
  numManipulateToolbarStyle as iPCallInCalleeIDToolbarStyle,
  numManipulatePaginationStyle as iPCallInCalleeIDPaginationStyle,
  numManipulateAddNewModalFooterStyle as iPCallInCalleeIDAddNewModalFooterStyle,
  numManipulateAddNewModalFooterBtnStyle as iPCallInCalleeIDAddNewModalFooterBtnStyle,
  numManipulateAddNewModalFooterCancelBtnStyle as iPCallInCalleeIDAddNewModalFooterCancelBtnStyle,
  numManipulateAddNewModalBackdropSlotProps as iPCallInCalleeIDAddNewModalBackdropSlotProps,
  numManipulateAddNewModalDialogContentSx as iPCallInCalleeIDAddNewModalDialogContentSx,
  numManipulateMuiTextFieldSx as iPCallInCalleeIDMuiTextFieldSx,
  numManipulateMuiSelectSx as iPCallInCalleeIDMuiSelectSx,
  numManipulateCheckboxSx as iPCallInCalleeIDCheckboxSx,
  numManipulateTdStyle as iPCallInCalleeIDTdStyle,
  createNumManipulateDialogConfig,
  createNumManipulateBreadcrumb,
} from "./NumManipulateSharedFormFields";

import {
  createNumManipulateBreadcrumb as createBreadcrumb,
  createNumManipulateDialogConfig,
} from "./NumManipulateSharedFormFields";
import {
  IP_CALL_IN_CALLEEID_PAGE_BREADCRUMB_ROOT,
  IP_CALL_IN_CALLEEID_PAGE_BREADCRUMB_SECTION,
  IP_CALL_IN_CALLEEID_PAGE_TITLE,
} from "../../../../constants/FxsIPCallInCalleeIDConstants";

export const IPCallInCalleeIDBreadcrumb = createBreadcrumb(
  IP_CALL_IN_CALLEEID_PAGE_BREADCRUMB_ROOT,
  IP_CALL_IN_CALLEEID_PAGE_BREADCRUMB_SECTION,
  IP_CALL_IN_CALLEEID_PAGE_TITLE,
);

export const iPCallInCalleeIDDialogConfig = createNumManipulateDialogConfig("IPCallInCalleeID");
