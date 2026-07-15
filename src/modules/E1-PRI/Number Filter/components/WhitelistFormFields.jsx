export {
  NumberFilterBtn as WhitelistBtn,
  NumberFilterTH as WhitelistTH,
  NumberFilterFieldLabel as WhitelistFieldLabel,
  NumberFilterFieldRow as WhitelistFieldRow,
  numberFilterFormPanelStyle as whitelistFormPanelStyle,
  numberFilterInputStyle as whitelistInputStyle,
  numberFilterInputInteraction as whitelistInputInteraction,
  numberFilterModalSelectSx as whitelistModalSelectSx,
  numberFilterGroupSelectMenuProps as whitelistGroupSelectMenuProps,
  numberFilterAddNewModalFooterStyle as whitelistAddNewModalFooterStyle,
  numberFilterAddNewModalFooterBtnStyle as whitelistAddNewModalFooterBtnStyle,
  numberFilterAddNewModalFooterCancelBtnStyle as whitelistAddNewModalFooterCancelBtnStyle,
  numberFilterCheckboxSx as whitelistCheckboxSx,
  numberFilterTdStyle as whitelistTdStyle,
  numberFilterC as whitelistC,
  numberFilterFixedAlertSx as whitelistFixedAlertSx,
  createNumberFilterDialogConfig,
  createNumberFilterBreadcrumb,
} from "./NumberFilterSharedFormFields";

import {
  createNumberFilterBreadcrumb as createBreadcrumb,
  createNumberFilterDialogConfig,
} from "./NumberFilterSharedFormFields";
import {
  NUMBER_FILTER_WHITELIST_PAGE_BREADCRUMB_SECTION,
  NUMBER_FILTER_WHITELIST_PAGE_TITLE,
} from "../../../../constants/NumberFilterWhitelistConstants";

export const WhitelistBreadcrumb = createBreadcrumb(
  NUMBER_FILTER_WHITELIST_PAGE_BREADCRUMB_SECTION,
  NUMBER_FILTER_WHITELIST_PAGE_TITLE,
);

export const whitelistDialogConfig = createNumberFilterDialogConfig(500);
