export {
  NumberFilterBtn as FilteringRuleBtn,
  NumberFilterTH as FilteringRuleTH,
  NumberFilterFieldRow as FilteringRuleFieldRow,
  NumberFilterTableListLoading as FilteringRuleTableListLoading,
  NumberFilterTableListEmptyState as FilteringRuleTableListEmptyState,
  numberFilterFormPanelStyle as filteringRuleFormPanelStyle,
  numberFilterSelectStyle as filteringRuleSelectStyle,
  numberFilterDisabledInputStyle as filteringRuleDisabledInputStyle,
  numberFilterInputInteraction as filteringRuleInputInteraction,
  numberFilterAddNewModalFooterStyle as filteringRuleAddNewModalFooterStyle,
  numberFilterAddNewModalFooterBtnStyle as filteringRuleAddNewModalFooterBtnStyle,
  numberFilterAddNewModalFooterCancelBtnStyle as filteringRuleAddNewModalFooterCancelBtnStyle,
  numberFilterCheckboxSx as filteringRuleCheckboxSx,
  numberFilterTdStyle as filteringRuleTdStyle,
  numberFilterC as filteringRuleC,
  numberFilterFixedAlertSx as filteringRuleFixedAlertSx,
  numberFilterCardStyle as filteringRuleCardStyle,
  numberFilterToolbarStyle as filteringRuleToolbarStyle,
  numberFilterCancelBtnStyle as filteringRuleCancelBtnStyle,
  numberFilterToolbarBtnStyle as filteringRuleToolbarBtnStyle,
  NUMBER_FILTER_COMPACT_MQ as FILTERING_RULE_COMPACT_MQ,
  createNumberFilterBreadcrumb,
  e1PriModalTitleStyle,
} from "./NumberFilterSharedFormFields";

import {
  createNumberFilterBreadcrumb as createBreadcrumb,
  e1PriModalTitleStyle,
} from "./NumberFilterSharedFormFields";
import {
  NUMBER_FILTER_RULE_PAGE_BREADCRUMB_SECTION,
  NUMBER_FILTER_RULE_PAGE_TITLE,
} from "../../../../constants/NumberFilterRuleConstants";

export const FilteringRuleBreadcrumb = createBreadcrumb(
  NUMBER_FILTER_RULE_PAGE_BREADCRUMB_SECTION,
  NUMBER_FILTER_RULE_PAGE_TITLE,
);

const FILTERING_RULE_ADD_NEW_DIALOG_LAYOUT_OFFSET = 80;

export const filteringRuleDialogConfig = {
  dialogSx: {
    "& .MuiDialog-container": {
      alignItems: "flex-start",
      justifyContent: "center",
      pt: 8,
    },
  },
  paperSx: {
    mx: "auto",
    my: 0,
    maxHeight: `calc(100vh - ${FILTERING_RULE_ADD_NEW_DIALOG_LAYOUT_OFFSET}px - 48px)`,
    display: "flex",
    flexDirection: "column",
    width: 600,
    maxWidth: "95vw",
    p: 0,
    borderRadius: "4px",
    overflow: "hidden",
    boxShadow:
      "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
  },
  modalTitleStyle: e1PriModalTitleStyle,
};
