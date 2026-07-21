import React from "react";
import {
  ExtensionBreadcrumb,
  FilterModalDate,
  FilterModalField,
  FilterModalSearch,
  FilterModalSelect,
} from "../../../components/common";
import {
  CALL_COUNT_BREADCRUMB_SEGMENTS,
  CALL_COUNT_FILTER_TOOLTIPS,
} from "../../../constants/CallCountConstants";

export const CallCountBreadcrumb = ({ style } = {}) => (
  <ExtensionBreadcrumb
    root={CALL_COUNT_BREADCRUMB_SEGMENTS[0]}
    section={CALL_COUNT_BREADCRUMB_SEGMENTS[1]}
    current={CALL_COUNT_BREADCRUMB_SEGMENTS[2]}
    style={style}
  />
);

export const Pill = ({ text, bg, color }) => (
  <span
    style={{
      background: bg,
      color,
      padding: "2px 8px",
      borderRadius: 999,
      fontSize: 10,
      fontWeight: 500,
      whiteSpace: "nowrap",
      display: "inline-block",
    }}
  >
    {text}
  </span>
);

export const FilterField = (props) => (
  <FilterModalField tooltips={CALL_COUNT_FILTER_TOOLTIPS} {...props} />
);

export const FilterSelect = FilterModalSelect;
export const FilterSearch = FilterModalSearch;
export const FilterDate = FilterModalDate;
