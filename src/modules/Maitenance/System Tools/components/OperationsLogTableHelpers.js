import { extensionCancelBtnStyle } from "../../../../components/common";

export const OPERATIONS_LOG_TABLE_SCROLL_CLASS = "operations-log-table-scroll";

export const operationsLogToolbarRefreshBtnStyle = {
  ...extensionCancelBtnStyle,
  width: 80,
  boxSizing: "border-box",
};

export const operationsLogToolbarActionBtnStyle = {
  ...extensionCancelBtnStyle,
  minWidth: 96,
  boxSizing: "border-box",
};

export const operationsLogCheckboxCellStyle = {
  width: 40,
  padding: 0,
  textAlign: "center",
  verticalAlign: "middle",
};

export const operationsLogTableScrollStyle = {
  overflowX: "auto",
  overflowY: "auto",
  flex: 1,
  WebkitOverflowScrolling: "touch",
};

export const operationsLogFooterNoteStyle = {
  padding: "10px 14px",
  fontSize: 12,
  color: "#64748b",
  borderTop: "1px solid #e2e6ec",
  background: "#ffffff",
};
