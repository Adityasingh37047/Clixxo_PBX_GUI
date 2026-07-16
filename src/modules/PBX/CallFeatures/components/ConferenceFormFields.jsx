import React from "react";
import {
  C,
  FOCUS_RING_SHADOW,
  OUTLINED_BORDER,
  OUTLINED_FOCUS,
  OUTLINED_HOVER,
} from "../../../../theme/pbxTokens";
import { Tooltip, useMediaQuery } from "@mui/material";
import { CONFERENCE_FIELD_TOOLTIPS } from "../../../../constants/ConferenceConstants";


const conferenceOutlinedInputRootSx = {
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

const conferenceModalTextFieldFullSx = {
  width: "100%",
  "& .MuiOutlinedInput-root": {
    ...conferenceOutlinedInputRootSx,
    minHeight: 36,
    height: 36,
    fontSize: 13,
  },
  "& .MuiOutlinedInput-input": {
    padding: "7px 10px",
    fontSize: 13,
    boxSizing: "border-box",
    backgroundColor: "#fff",
  },
};

const conferenceModalSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  width: "100%",
  minHeight: 36,
  height: 36,
  ...conferenceOutlinedInputRootSx,
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

const conferenceModalPaperSx = {
  width: 880,
  maxWidth: "96vw",
  mx: "auto",
  my: 0,
  maxHeight: "calc(100vh - 80px - 48px)",
  display: "flex",
  flexDirection: "column",
  p: 0,
  borderRadius: 2,
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

const conferenceModalTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
  borderTopLeftRadius: 4,
  borderTopRightRadius: 4,
};

const conferenceModalSectionStyle = {
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 4,
  padding: 20,
  marginTop: 24,
};

const conferenceModalDialogContentSx = {
  maxHeight: "calc(100vh - 220px)",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
};

const addNewModalFooterStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "100%",
  margin: 0,
  padding: "16px 24px",
  boxSizing: "border-box",
  background: "#f8fafc",
  borderTop: `1px solid ${C.cardBorder}`,
  borderBottomLeftRadius: 4,
  borderBottomRightRadius: 4,
};

const addNewModalFooterBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 4,
  minWidth: 100,
};

const addNewModalFooterCancelBtnStyle = {
  ...addNewModalFooterBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const conferenceModalCancelBtnStyle = {
  ...addNewModalFooterBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
  borderRadius: 4,
};

const CONFERENCE_TOOLTIP_PROPS = {
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
      },
    },
    arrow: {
      sx: { color: "#fff" },
    },
  },
};

const formatConferenceTooltipTitle = (text) => {
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

const conferenceModalTabBarStyle = {
  
  background: "#ffffff",
};

const conferenceModalTabsSx = {
  minHeight: 45,
  "& .MuiTab-root": {
    color: "#374151",
    fontSize: 12,
    fontWeight: 500,
    textTransform: "none",
    minHeight: 45,
  },
  "& .MuiTab-root.Mui-selected": {
    color: C.accent,
    fontWeight: 700,
  },
};


const CONFERENCE_MODAL_LABEL_WIDTH = 150;

const ConferenceFieldLabel = ({ tooltipKey, children, style = {} }) => {
  const tooltip = CONFERENCE_FIELD_TOOLTIPS[tooltipKey] || "";
  const label = (
    <span
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        cursor: tooltip ? "help" : undefined,
        ...style,
      }}
    >
      {children}
    </span>
  );
  if (!tooltip) return label;
  return (
    <Tooltip
      title={formatConferenceTooltipTitle(tooltip)}
      {...CONFERENCE_TOOLTIP_PROPS}
    >
      {label}
    </Tooltip>
  );
};

const ConferenceFieldRow = ({
  label,
  tooltipKey,
  children,
  required = false,
  alignTop = false,
  labelWidth = CONFERENCE_MODAL_LABEL_WIDTH,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: alignTop ? "flex-start" : "center",
      gap: 12,
      minHeight: alignTop ? undefined : 32,
    }}
  >
    <ConferenceFieldLabel
      tooltipKey={tooltipKey}
      style={{
        width: labelWidth,
        flexShrink: 0,
        marginTop: alignTop ? 4 : 0,
      }}
    >
      {label}
      {required ? <span style={{ color: C.errorRed }}> *</span> : null}
    </ConferenceFieldLabel>
    <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
  </div>
);

const CONFERENCE_MODAL_SECTION_BG = "#f8fafc";

const ConferenceSectionHeading = ({
  title,
  isFirst = false,
  required = false,
}) => {
  const isLaptopNarrow = useMediaQuery("(max-width: 1366px)");
  return (
  <div
    style={{
      margin: isFirst
        ? isLaptopNarrow
          ? "16px 0 24px 0"
          : "0 0 24px 0"
        : "28px 0 24px 0",
      position: "relative",
      width: "100%",
    }}
  >
    <div style={{ borderTop: `1px solid ${C.divider}` }} />
    <span
      style={{
        position: "absolute",
        top: -10,
        left: isLaptopNarrow ? 0 : -6,
        background: CONFERENCE_MODAL_SECTION_BG,
        paddingRight: 8,
        fontSize: 14,
        fontWeight: 600,
        color: "#30415A",
      }}
    >
      {title}
      {required ? <span style={{ color: C.errorRed }}> *</span> : null}
    </span>
  </div>
  );
};

const CONFERENCE_MEMBER_LIST_HEIGHT = 188;

const getConferenceMemberListBoxStyle = (isEmpty) => ({
  border: `1px solid ${C.codecBoxBorder}`,
  background: C.codecBoxAvailableBg,
  borderRadius: 6,
  padding: isEmpty ? 0 : "8px 10px",
  height: CONFERENCE_MEMBER_LIST_HEIGHT,
  overflowY: "auto",
  overflowX: "hidden",
  display: "flex",
  flexDirection: "column",
  alignItems: isEmpty ? "center" : "stretch",
  justifyContent: isEmpty ? "center" : "flex-start",
  gap: 6,
  boxSizing: "border-box",
});

const conferenceMemberListEmptyStyle = {
  color: C.placeholderText,
  fontSize: 13,
  fontWeight: 400,
  textAlign: "center",
  userSelect: "none",
  padding: "0 16px",
};

const conferenceMemberListSubHeadingStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: C.labelText,
  marginBottom: 8,
  textAlign: "center",
};

const ConferenceMemberListBox = ({ items, emptyText, renderItem }) => {
  const isEmpty = items.length === 0;
  return (
    <div style={getConferenceMemberListBoxStyle(isEmpty)}>
      {isEmpty ? (
        <div style={conferenceMemberListEmptyStyle}>{emptyText}</div>
      ) : (
        items.map(renderItem)
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────


export { conferenceOutlinedInputRootSx, conferenceModalTextFieldFullSx, conferenceModalSelectSx, conferenceModalPaperSx, conferenceModalTitleStyle, conferenceModalSectionStyle, conferenceModalDialogContentSx, addNewModalFooterStyle, addNewModalFooterBtnStyle, addNewModalFooterCancelBtnStyle, conferenceModalCancelBtnStyle, CONFERENCE_TOOLTIP_PROPS, formatConferenceTooltipTitle, conferenceModalTabBarStyle, conferenceModalTabsSx, CONFERENCE_MODAL_LABEL_WIDTH, CONFERENCE_MODAL_SECTION_BG, ConferenceFieldLabel, ConferenceFieldRow, ConferenceSectionHeading, CONFERENCE_MEMBER_LIST_HEIGHT, getConferenceMemberListBoxStyle, conferenceMemberListEmptyStyle, conferenceMemberListSubHeadingStyle, ConferenceMemberListBox };
