export {
  NumberFilterBtn as BlacklistBtn,
  NumberFilterTH as BlacklistTH,
  NumberFilterFieldLabel as BlacklistFieldLabel,
  NumberFilterFieldRow as BlacklistFieldRow,
  numberFilterFormPanelStyle as blacklistFormPanelStyle,
  numberFilterInputStyle as blacklistInputStyle,
  numberFilterInputInteraction as blacklistInputInteraction,
  numberFilterModalSelectSx as blacklistModalSelectSx,
  numberFilterGroupSelectMenuProps as blacklistGroupSelectMenuProps,
  numberFilterAddNewModalFooterStyle as blacklistAddNewModalFooterStyle,
  numberFilterAddNewModalFooterBtnStyle as blacklistAddNewModalFooterBtnStyle,
  numberFilterAddNewModalFooterCancelBtnStyle as blacklistAddNewModalFooterCancelBtnStyle,
  numberFilterCheckboxSx as blacklistCheckboxSx,
  numberFilterTdStyle as blacklistTdStyle,
  numberFilterC as blacklistC,
  numberFilterFixedAlertSx as blacklistFixedAlertSx,
  createNumberFilterDialogConfig,
  createNumberFilterBreadcrumb,
} from "./NumberFilterSharedFormFields";

import {
  createNumberFilterBreadcrumb as createBreadcrumb,
  createNumberFilterDialogConfig,
} from "./NumberFilterSharedFormFields";
import {
  NUMBER_FILTER_BLACKLIST_PAGE_BREADCRUMB_SECTION,
  NUMBER_FILTER_BLACKLIST_PAGE_TITLE,
} from "../../../../constants/NumberFilterBlacklistConstants";

export const BlacklistBreadcrumb = createBreadcrumb(
  NUMBER_FILTER_BLACKLIST_PAGE_BREADCRUMB_SECTION,
  NUMBER_FILTER_BLACKLIST_PAGE_TITLE,
);

export const blacklistDialogConfig = createNumberFilterDialogConfig(500);
