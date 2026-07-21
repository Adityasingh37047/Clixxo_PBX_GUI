import {
  addNewModalFooterBtnStyle,
  addNewModalFooterCancelBtnStyle,
  addNewModalFooterStyle,
  extensionCancelBtnStyle,
  extensionFixedAlertSx,
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
  overflowY: "visible",
  WebkitOverflowScrolling: "touch",
};

export const getOperationsLogCompactAlertSx = (isCompact) => ({
  ...extensionFixedAlertSx,
  ...(isCompact
    ? {
        top: 12,
        left: 8,
        right: 8,
        minWidth: 0,
        maxWidth: "none",
      }
    : {}),
});

export const getOperationsLogHeaderRowStyle = (isCompact) => ({
  display: "flex",
  alignItems: isCompact ? "flex-start" : "center",
  justifyContent: "space-between",
  flexDirection: isCompact ? "column" : "row",
  flexWrap: "wrap",
  gap: isCompact ? 8 : 12,
  marginBottom: isCompact ? 12 : 16,
});

export const getOperationsLogToolbarActionsStyle = (isCompact) => ({
  display: "flex",
  alignItems: "center",
  gap: isCompact ? 8 : 10,
  flexWrap: "wrap",
  ...(isCompact
    ? {
        width: "100%",
        justifyContent: "flex-start",
      }
    : {}),
});

export const getOperationsLogCompactToolbarBtnStyle = (isCompact, baseStyle) =>
  isCompact
    ? {
        ...baseStyle,
        flex: "1 1 calc(50% - 4px)",
        minWidth: 0,
        justifyContent: "center",
      }
    : baseStyle;

export const getOperationsLogPaginationStyle = (isCompact) =>
  isCompact
    ? {
        flexDirection: "column",
        alignItems: "stretch",
        gap: 10,
        padding: "10px 12px",
      }
    : undefined;

export const getOperationsLogPaginationControlsStyle = (isCompact) =>
  isCompact
    ? {
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        justifyContent: "center",
        width: "100%",
      }
    : { display: "flex", gap: 8, alignItems: "center" };

export const getOperationsLogFilterModalPaperSx = (isCompact) => ({
  ...filterModalPaperSx,
  width: isCompact ? "100%" : filterModalPaperSx.width,
  maxWidth: isCompact ? "100%" : "96vw",
  margin: isCompact ? 0 : "32px auto",
});

export const getOperationsLogFilterModalContentStyle = (isCompact) => ({
  padding: isCompact ? "16px 12px" : "24px",
  backgroundColor: "#ffffff",
});

export const getOperationsLogFilterModalFormStyle = (isCompact) => ({
  ...filterModalFormStyle,
  padding: isCompact ? 12 : 20,
});

export const operationsLogFilterModalGridStyle = (isCompact) =>
  isCompact
    ? {
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
        rowGap: 8,
        width: "100%",
      }
    : filterModalGridStyle(false);

export const getOperationsLogFilterFieldStyle = (isCompact) =>
  isCompact
    ? { width: "100%", minWidth: 0, maxWidth: "100%" }
    : filterModalFieldStyle;

export const getOperationsLogFilterTimeRangeStyle = (isCompact) => ({
  display: "grid",
  gridTemplateColumns: isCompact ? "minmax(0, 1fr)" : "1fr 1fr",
  gap: 8,
  width: "100%",
});

export const getOperationsLogFilterModalFooterStyle = (isCompact) => ({
  ...addNewModalFooterStyle,
  ...(isCompact
    ? {
        flexWrap: "wrap",
        padding: "12px 16px",
        gap: 8,
      }
    : {}),
});

export const getOperationsLogFilterModalFooterBtnStyle = (isCompact) =>
  isCompact
    ? { ...addNewModalFooterBtnStyle, flex: "1 1 calc(50% - 4px)", minWidth: 0 }
    : addNewModalFooterBtnStyle;

export const getOperationsLogFilterModalCancelBtnStyle = (isCompact) =>
  isCompact
    ? {
        ...addNewModalFooterCancelBtnStyle,
        flex: "1 1 calc(50% - 4px)",
        minWidth: 0,
      }
    : addNewModalFooterCancelBtnStyle;

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
export const operationsLogFilterFieldStyle = filterModalFieldStyle;
export const operationsLogFilterModalFooterStyle = addNewModalFooterStyle;
export const operationsLogFilterModalFooterBtnStyle = addNewModalFooterBtnStyle;
export const operationsLogFilterModalCancelBtnStyle = addNewModalFooterCancelBtnStyle;
