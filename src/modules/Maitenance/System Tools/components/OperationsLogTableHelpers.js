import {
  addNewModalFooterBtnStyle,
  addNewModalFooterCancelBtnStyle,
  addNewModalFooterStyle,
  extensionCancelBtnStyle,
  filterModalBoxFillStyle,
  filterModalBoxStyle,
  filterModalFieldStyle,
  filterModalFormStyle,
  filterModalGridStyle,
  filterModalNativeFieldInteraction,
  filterModalPaperSx,
  filterModalTitleStyle,
  FILTER_MODAL_FIELD_MAX_WIDTH,
  FILTER_MODAL_TIME_RANGE_MAX_WIDTH,
} from "../../../../components/common";

export const OPERATIONS_LOG_TABLE_SCROLL_CLASS = "operations-log-table-scroll";

export const CARD_RADIUS = 4;

export const operationsLogToolbarRefreshBtnStyle = {
  ...extensionCancelBtnStyle,
  width: 80,
  boxSizing: "border-box",
};

export const operationsLogToolbarFilterBtnStyle = {
  ...extensionCancelBtnStyle,
  width: 70,
  boxSizing: "border-box",
};

export const operationsLogToolbarActionBtnStyle = {
  ...extensionCancelBtnStyle,
  minWidth: 96,
  boxSizing: "border-box",
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

export const nativeFieldInteraction = filterModalNativeFieldInteraction;
export const operationsLogFilterBoxStyle = filterModalBoxStyle;
export const operationsLogFilterBoxFillStyle = filterModalBoxFillStyle;
export const OPERATIONS_LOG_FILTER_FIELD_MAX_WIDTH = FILTER_MODAL_FIELD_MAX_WIDTH;
export const OPERATIONS_LOG_FILTER_TIME_RANGE_MAX_WIDTH = FILTER_MODAL_TIME_RANGE_MAX_WIDTH;
export const operationsLogFilterModalPaperSx = filterModalPaperSx;
export const operationsLogFilterModalTitleStyle = filterModalTitleStyle;
export const operationsLogFilterModalFormStyle = filterModalFormStyle;
export const operationsLogFilterModalGridStyle = filterModalGridStyle;
export const operationsLogFilterFieldStyle = filterModalFieldStyle;
export const operationsLogFilterModalFooterStyle = addNewModalFooterStyle;
export const operationsLogFilterModalFooterBtnStyle = addNewModalFooterBtnStyle;
export const operationsLogFilterModalCancelBtnStyle = addNewModalFooterCancelBtnStyle;
