import { ExtensionBreadcrumb } from "../../../../components/common";
import {
  OPERATIONS_LOG_BREADCRUMB_CURRENT,
  OPERATIONS_LOG_BREADCRUMB_ROOT,
  OPERATIONS_LOG_BREADCRUMB_SECTION,
} from "../../../../constants/OperationsLogConstants";

export const OperationsLogBreadcrumb = ({ style } = {}) => (
  <ExtensionBreadcrumb
    root={OPERATIONS_LOG_BREADCRUMB_ROOT}
    section={OPERATIONS_LOG_BREADCRUMB_SECTION}
    current={OPERATIONS_LOG_BREADCRUMB_CURRENT}
    style={style}
  />
);
