import {
  addNewModalFooterBtnStyle,
  addNewModalFooterCancelBtnStyle,
  addNewModalFooterStyle,
  extensionCancelBtnStyle as callCountCancelBtnStyle,
  filterModalBoxFillStyle,
  filterModalBoxStyle,
  filterModalFieldStyle,
  filterModalFormStyle,
  filterModalGridStyle,
  filterModalNativeFieldInteraction as callCountNativeFieldInteraction,
  filterModalPaperSx,
  filterModalTitleStyle,
  FILTER_MODAL_FIELD_MAX_WIDTH,
  FILTER_MODAL_TIME_RANGE_MAX_WIDTH,
  getExtensionRowBg as getCallCountRowBg,
} from "../../../components/common";
import { C } from "../../../theme/pbxTokens";
import { CALL_COUNT_COLUMNS } from "../../../constants/CallCountConstants";

export const CARD_RADIUS = 4;
export const callCountToolbarFilterRefreshBtnStyle = {
  ...callCountCancelBtnStyle,
  width: 70,
  boxSizing: "border-box",
};
export const TRUNK_TABLE_SCROLL_CLASS = "trunk-table-scroll";

export {
  callCountNativeFieldInteraction,
  getCallCountRowBg,
};

const callCountCellPadding = "7px 6px";
const callCountHeaderPadding = "9px 6px";
const callCountCompactCellPadding = "7px 3px";
const callCountCompactHeaderPadding = "9px 3px";
export const callCountTableTdStyle = {
  fontSize: 13,
  color: C.valueText,
  textAlign: "center",
  background: "#ffffff",
  borderBottom: `1px solid ${C.divider}`,
  borderRight: `1px solid ${C.divider}`,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  boxSizing: "border-box",
};
export const callCountTableThStyle = { letterSpacing: "0.08em", boxSizing: "border-box" };
const columns = CALL_COUNT_COLUMNS;
export const getCallCountCellPadding = (key) => {
  const col = columns.find((c) => c.key === key);
  return col?.compact ? callCountCompactCellPadding : callCountCellPadding;
};
export const getCallCountHeaderPadding = (key) => {
  const col = columns.find((c) => c.key === key);
  return col?.compact ? callCountCompactHeaderPadding : callCountHeaderPadding;
};
export const cardBorderSoft = C.divider;

export const callCountFilterModalPaperSx = filterModalPaperSx;
export const callCountFilterModalTitleStyle = filterModalTitleStyle;
export const callCountFilterModalFormStyle = filterModalFormStyle;
export const callCountFilterModalFooterStyle = addNewModalFooterStyle;
export const callCountFilterModalFooterBtnStyle = addNewModalFooterBtnStyle;
export const callCountFilterModalCancelBtnStyle = addNewModalFooterCancelBtnStyle;
export const callCountFilterBoxStyle = filterModalBoxStyle;
export const callCountFilterBoxFillStyle = filterModalBoxFillStyle;
export const CALL_COUNT_FILTER_FIELD_MAX_WIDTH = FILTER_MODAL_FIELD_MAX_WIDTH;
export const CALL_COUNT_FILTER_TIME_RANGE_MAX_WIDTH = FILTER_MODAL_TIME_RANGE_MAX_WIDTH;
export const callCountFilterModalGridStyle = filterModalGridStyle;
export const callCountFilterFieldStyle = filterModalFieldStyle;
