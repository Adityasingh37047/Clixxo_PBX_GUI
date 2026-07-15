export {
  NumManipulateBtn as IPCallInCallerIDBtn,
  NumManipulateTH as IPCallInCallerIDTH,
  NumManipulateFieldLabel as IPCallInCallerIDFieldLabel,
  NumManipulateModalFormFields as IPCallInCallerIDModalFormFields,
  numManipulateCardStyle as iPCallInCallerIDCardStyle,
  numManipulateToolbarStyle as iPCallInCallerIDToolbarStyle,
  numManipulatePaginationStyle as iPCallInCallerIDPaginationStyle,
  numManipulateAddNewModalFooterStyle as iPCallInCallerIDAddNewModalFooterStyle,
  numManipulateAddNewModalFooterBtnStyle as iPCallInCallerIDAddNewModalFooterBtnStyle,
  numManipulateAddNewModalFooterCancelBtnStyle as iPCallInCallerIDAddNewModalFooterCancelBtnStyle,
  numManipulateAddNewModalBackdropSlotProps as iPCallInCallerIDAddNewModalBackdropSlotProps,
  numManipulateAddNewModalDialogContentSx as iPCallInCallerIDAddNewModalDialogContentSx,
  numManipulateMuiTextFieldSx as iPCallInCallerIDMuiTextFieldSx,
  numManipulateMuiSelectSx as iPCallInCallerIDMuiSelectSx,
  numManipulateCheckboxSx as iPCallInCallerIDCheckboxSx,
  numManipulateTdStyle as iPCallInCallerIDTdStyle,
  createNumManipulateDialogConfig,
  createNumManipulateBreadcrumb,
} from "./NumManipulateSharedFormFields";

import {
  createNumManipulateBreadcrumb as createBreadcrumb,
  createNumManipulateDialogConfig,
} from "./NumManipulateSharedFormFields";
import {
  IP_CALL_IN_CALLERID_PAGE_BREADCRUMB_ROOT,
  IP_CALL_IN_CALLERID_PAGE_BREADCRUMB_SECTION,
  IP_CALL_IN_CALLERID_PAGE_TITLE,
} from "../../../../constants/FxsIPCallInCallerIDConstants";

export const IPCallInCallerIDBreadcrumb = createBreadcrumb(
  IP_CALL_IN_CALLERID_PAGE_BREADCRUMB_ROOT,
  IP_CALL_IN_CALLERID_PAGE_BREADCRUMB_SECTION,
  IP_CALL_IN_CALLERID_PAGE_TITLE,
);

export const iPCallInCallerIDDialogConfig = createNumManipulateDialogConfig("IPCallInCallerID");
