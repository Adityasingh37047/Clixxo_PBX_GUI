import React from "react";
import {
  ExtensionBreadcrumb,
  FilterModalDate,
  FilterModalField,
  FilterModalSearch,
  FilterModalSelect,
} from "../../../../components/common";
import {
  OPERATIONS_LOG_BREADCRUMB_CURRENT,
  OPERATIONS_LOG_BREADCRUMB_ROOT,
  OPERATIONS_LOG_BREADCRUMB_SECTION,
  OPERATIONS_LOG_FILTER_TOOLTIPS,
} from "../../../../constants/OperationsLogConstants";

export const OperationsLogBreadcrumb = ({ style } = {}) => (
  <ExtensionBreadcrumb
    root={OPERATIONS_LOG_BREADCRUMB_ROOT}
    section={OPERATIONS_LOG_BREADCRUMB_SECTION}
    current={OPERATIONS_LOG_BREADCRUMB_CURRENT}
    style={style}
  />
);

export const FilterField = (props) => (
  <FilterModalField tooltips={OPERATIONS_LOG_FILTER_TOOLTIPS} {...props} />
);

export const FilterSelect = FilterModalSelect;
export const FilterSearch = FilterModalSearch;
export const FilterDate = FilterModalDate;
