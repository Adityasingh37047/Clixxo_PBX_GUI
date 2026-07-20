import React from "react";
import { Tooltip, CircularProgress } from "@mui/material";
import {
  SIP_TRUNK_GROUP_PAGE_BREADCRUMB_ROOT, SIP_TRUNK_GROUP_PAGE_BREADCRUMB_SECTION, SIP_TRUNK_GROUP_PAGE_TITLE, SIP_TRUNK_GROUP_BTN_PREV, SIP_TRUNK_GROUP_BTN_NEXT, SIP_TRUNK_GROUP_EMPTY_MESSAGE, SIP_TRUNK_GROUP_BTN_ADD_NEW, SIP_TRUNK_GROUP_RECORD_LABEL, SIP_TRUNK_GROUP_PAGINATION_SHOWING, SIP_TRUNK_GROUP_PAGINATION_PAGE_OF } from "../../../../constants/SipTrunkGroupConstants";
import {
  C,
  OUTLINED_BORDER,
  OUTLINED_HOVER,
  OUTLINED_FOCUS,
  FOCUS_RING_SHADOW,
} from "../../../../theme/pbxTokens";
import {
  Btn,
  TH,
  tdStyle,
  ExtensionBreadcrumb,
  extensionPageWrapStyle as sipTrunkGroupPageWrapStyle,
  extensionPageInnerStyle as sipTrunkGroupPageInnerStyle,
  extensionCardStyle as sipTrunkGroupCardStyleBase,
  extensionToolbarStyle as sipTrunkGroupToolbarBaseStyle,
  extensionFixedAlertSx as sipTrunkGroupFixedAlertSx,
  extensionSelectedBadgeStyle as sipTrunkGroupSelectedBadgeStyle,
  extensionCancelBtnStyle as sipTrunkGroupCancelBtnStyle,
  extensionPrimaryBtnStyle as sipTrunkGroupPrimaryBtnStyle,
  extensionTableCheckboxSx as sipTrunkGroupTableCheckboxSx,
  addNewModalFooterStyle,
  addNewModalFooterBtnStyle,
  addNewModalFooterCancelBtnStyle as sipTrunkGroupModalCancelBtnStyle,
  EXTENSION_TABLE_CARD_RADIUS as SIP_TRUNK_GROUP_TABLE_CARD_RADIUS,
} from "../../../../components/common";

export { Btn, TH, tdStyle, C, sipTrunkGroupPageWrapStyle, sipTrunkGroupPageInnerStyle, sipTrunkGroupFixedAlertSx, sipTrunkGroupSelectedBadgeStyle, sipTrunkGroupCancelBtnStyle, sipTrunkGroupPrimaryBtnStyle, sipTrunkGroupTableCheckboxSx, addNewModalFooterStyle, addNewModalFooterBtnStyle, sipTrunkGroupModalCancelBtnStyle, SIP_TRUNK_GROUP_TABLE_CARD_RADIUS };

// ── Page-local field label tooltip UI (not shared) ──
export const FIELD_LABEL_COLOR = "#3E5475";

export const SIP_TRUNK_GROUP_SCROLL_CLASS = "sip-trunk-group-scroll";

export const SIP_TRUNK_GROUP_TOOLTIP_PROPS = {
  arrow: true,
  placement: "top",
  slotProps: {
    tooltip: {
      sx: {
        backgroundColor: "#fff",
        color: "#333",
        border: "1px solid #d1d5db",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        fontSize: 12,
        lineHeight: 1.45,
        maxWidth: 500,
        padding: "10px 12px",
        textTransform: "none",
        letterSpacing: "normal",
      },
    },
    arrow: { sx: { color: "#fff" } },
  },
};

export const formatFieldTooltipTitle = (text) => {
  if (!text) return "";
  const normalized = text.replace(/<br\s*\/?>/gi, "\n").replace(/&quot;/g, '"');
  if (normalized.includes("\n")) {
    return (
      <span style={{ whiteSpace: "pre-line", display: "block" }}>
        {normalized}
      </span>
    );
  }
  return normalized;
};

export const SipTrunkGroupFieldLabel = ({ tooltipKey, tooltips, children, style = {} }) => {
  const tooltip = tooltipKey ? tooltips[tooltipKey] || "" : "";
  const labelNode = (
    <span
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: FIELD_LABEL_COLOR,
        cursor: tooltip ? "help" : undefined,
        ...style,
      }}
    >
      {children}
    </span>
  );
  if (!tooltip) return labelNode;
  return (
    <Tooltip title={formatFieldTooltipTitle(tooltip)} {...SIP_TRUNK_GROUP_TOOLTIP_PROPS}>
      {labelNode}
    </Tooltip>
  );
};

export const SIP_TRUNK_GROUP_ADD_NEW_DIALOG_MARGIN = 24;
export const SIP_TRUNK_GROUP_ADD_NEW_DIALOG_LAYOUT_OFFSET = 80;

export const SIP_TRUNK_GROUP_ADD_NEW_DIALOG_SX = {
  "& .MuiDialog-container": {
    alignItems: "center",
    justifyContent: "center",
  },
};

export const SIP_TRUNK_GROUP_ADD_NEW_DIALOG_PAPER_SX = {
  margin: SIP_TRUNK_GROUP_ADD_NEW_DIALOG_MARGIN,
  maxHeight: `calc(100vh - ${SIP_TRUNK_GROUP_ADD_NEW_DIALOG_LAYOUT_OFFSET}px - ${SIP_TRUNK_GROUP_ADD_NEW_DIALOG_MARGIN * 2}px)`,
  display: "flex",
  flexDirection: "column",
  width: 520,
  maxWidth: "96vw",
  p: 0,
  borderRadius: "4px",
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

export const addNewModalDialogContentSx = {
  maxHeight: "calc(100vh - 220px)",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
};

export const getSipTrunkGroupTdStyle = (rowBg, lastRowCellStyle, extra = {}) => ({
  ...tdStyle,
  background: rowBg,
  ...lastRowCellStyle,
  ...extra,
});

export const getSipTrunkGroupRowBg = (isSelected, idx) =>
  isSelected ? "#eff6ff" : idx % 2 === 1 ? "#f8fafc" : "#ffffff";

export const sipTrunkGroupOutlinedInputRootSx = {
  backgroundColor: "#fff",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  "& fieldset": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  "&:hover fieldset": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused": {
    boxShadow: FOCUS_RING_SHADOW,
  },
  "&.Mui-focused fieldset": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
  "&.Mui-focused:hover fieldset": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
};

export const sipTrunkGroupModalTextFieldSx = {
  "& .MuiOutlinedInput-root": sipTrunkGroupOutlinedInputRootSx,
  "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_HOVER,
  },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
  "& .MuiOutlinedInput-input": {
    backgroundColor: "#fff",
    fontSize: 13,
    padding: "8px 12px",
  },
};

export const sipTrunkGroupModalSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  width: "100%",
  minHeight: 36,
  height: 36,
  ...sipTrunkGroupOutlinedInputRootSx,
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    padding: "7px 32px 7px 10px !important",
    lineHeight: 1.35,
    boxSizing: "border-box",
    fontSize: 13,
    backgroundColor: "#fff",
  },
};

export const SipTrunkGroupBreadcrumb = ({ style }) => (
  <ExtensionBreadcrumb
    root={SIP_TRUNK_GROUP_PAGE_BREADCRUMB_ROOT}
    section={SIP_TRUNK_GROUP_PAGE_BREADCRUMB_SECTION}
    current={SIP_TRUNK_GROUP_PAGE_TITLE}
    style={style}
  />
);


export const SipTrunkGroupScrollbarStyles = () => (
  <style>{`
    .${SIP_TRUNK_GROUP_SCROLL_CLASS} {
      scroll-behavior: smooth;
      scrollbar-gutter: stable;
      scrollbar-width: thin;
      scrollbar-color: rgba(100, 116, 139, 0.45) transparent;
    }
    .${SIP_TRUNK_GROUP_SCROLL_CLASS}::-webkit-scrollbar {
      width: 8px;
      height: 8px;
      transition: width 0.2s ease, height 0.2s ease;
    }
    .${SIP_TRUNK_GROUP_SCROLL_CLASS}::-webkit-scrollbar:hover {
      width: 11px;
      height: 11px;
    }
    .${SIP_TRUNK_GROUP_SCROLL_CLASS}::-webkit-scrollbar-corner {
      background: transparent;
    }
    .${SIP_TRUNK_GROUP_SCROLL_CLASS}::-webkit-scrollbar-track {
      background: transparent;
    }
    .${SIP_TRUNK_GROUP_SCROLL_CLASS}::-webkit-scrollbar-thumb {
      background-color: rgba(100, 116, 139, 0.45);
      border-radius: 6px;
      border: 2px solid transparent;
      background-clip: padding-box;
      transition: background-color 0.2s ease;
    }
    .${SIP_TRUNK_GROUP_SCROLL_CLASS}::-webkit-scrollbar-thumb:hover {
      background-color: rgba(71, 85, 105, 0.65);
    }
  `}</style>
);

export const SipTrunkGroupTableListLoading = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: 48,
    }}
  >
    <CircularProgress size={28} style={{ color: C.accent }} />
  </div>
);

export const SipTrunkGroupTableListEmptyState = ({
  message,
  onAddNew,
  buttonLabel = "+ Add New",
  showButton = true,
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 240,
      padding: 24,
      textAlign: "center",
    }}
  >
    <div
      style={{
        color: "#3E5475",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: showButton && onAddNew ? 16 : 0,
      }}
    >
      {message}
    </div>
    {showButton && onAddNew ? (
      <Btn
        variant="cancel"
        onClick={onAddNew}
        style={{ height: 30, padding: "6px 14px", fontSize: 12, borderRadius: 4 }}
      >
        {buttonLabel}
      </Btn>
    ) : null}
  </div>
);

export const sipTrunkGroupCardStyle = {
  ...sipTrunkGroupCardStyleBase,
};
export const sipTrunkGroupToolbarStyle = {
  ...sipTrunkGroupToolbarBaseStyle,
};


export const sipTrunkGroupPaginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.divider}`,
  borderBottomLeftRadius: SIP_TRUNK_GROUP_TABLE_CARD_RADIUS,
  borderBottomRightRadius: SIP_TRUNK_GROUP_TABLE_CARD_RADIUS,
  overflow: "hidden",
};


export const sipTrunkGroupPageBadgeStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: C.accent,
  background: "#e0f2fe",
  padding: "5px 14px",
  borderRadius: 4,
  border: `1px solid ${C.cardBorder}`,
};

export const SipTrunkGroupPagination = ({
  page,
  totalPages,
  recordCount,
  onPageChange,
  recordLabel = SIP_TRUNK_GROUP_RECORD_LABEL,
  style,
}) => (
  <div style={{ ...sipTrunkGroupPaginationStyle, ...style }}>
    <span style={{ fontSize: 11, color: C.mutedText }}>
      {SIP_TRUNK_GROUP_PAGINATION_SHOWING(recordCount, recordLabel, page)}
    </span>
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Btn
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        variant="outline"
      >
        {SIP_TRUNK_GROUP_BTN_PREV}
      </Btn>
      <span style={sipTrunkGroupPageBadgeStyle}>
        {SIP_TRUNK_GROUP_PAGINATION_PAGE_OF(page, totalPages)}
      </span>
      <Btn
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        variant="outline"
      >
        {SIP_TRUNK_GROUP_BTN_NEXT}
      </Btn>
    </div>
  </div>
);


