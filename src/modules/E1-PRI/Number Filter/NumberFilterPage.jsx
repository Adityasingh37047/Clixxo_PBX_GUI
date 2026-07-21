import React from "react";
import {
  ExtensionBreadcrumb as NumberFilterBreadcrumb,
  extensionPageWrapStyle as numberFilterPageWrapStyle,
  extensionPageInnerStyle as numberFilterPageInnerStyle,
} from "../../../components/common";
import { NUMBER_FILTER_POOL_PAGE_BREADCRUMB_ROOT } from "../../../constants/NumberFilterPoolConstants";

const NumberFilterPage = () => (
  <div style={numberFilterPageWrapStyle}>
    <div style={numberFilterPageInnerStyle}>
      <NumberFilterBreadcrumb
        root={NUMBER_FILTER_POOL_PAGE_BREADCRUMB_ROOT}
        section="Number Filter"
        current="Number Filter"
      />
    </div>
  </div>
);

export default NumberFilterPage;
