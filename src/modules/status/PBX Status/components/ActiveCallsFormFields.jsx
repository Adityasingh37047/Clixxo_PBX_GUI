import React from "react";
import { ExtensionBreadcrumb } from "../../../../components/common";
import { ACTIVE_CALLS_BREADCRUMB_SEGMENTS } from "../../../../constants/ActiveCallsConstants";

export const ActiveCallsBreadcrumb = ({ style } = {}) => (
  <ExtensionBreadcrumb
    root={ACTIVE_CALLS_BREADCRUMB_SEGMENTS[0]}
    section={ACTIVE_CALLS_BREADCRUMB_SEGMENTS[1]}
    current={ACTIVE_CALLS_BREADCRUMB_SEGMENTS[2]}
    style={style}
  />
);
