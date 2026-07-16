import React from "react";
import { Tooltip, useMediaQuery } from "@mui/material";
import { EXT_GROUP_FIELD_TOOLTIPS } from "../../../../constants/ExtensionGroupConstants";
import { C } from "../../../../theme/pbxTokens";
import {
  EXTENSION_MODAL_SECTION_BG,
  EXTENSION_MODAL_SECTION_HEADING_COLOR,
} from "../../../../components/common";
import { formatExtGroupTooltipTitle } from "../utils/ExtensionGroupsTransformers";

export const EXT_GROUP_FIELD_TOOLTIP_PROPS = {
  arrow: true,
  placement: "top",
  slotProps: {
    tooltip: {
      sx: {
        backgroundColor: "#fff",
        color: "#333",
        border: "1px solid #d1d5db",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        fontSize: 13,
        maxWidth: 500,
        padding: "12px 16px",
      },
    },
    arrow: { sx: { color: "#fff" } },
  },
};

export const ExtGroupFieldLabel = ({ tooltipKey, children, style = {} }) => {
  const tooltip = EXT_GROUP_FIELD_TOOLTIPS[tooltipKey] || "";
  const normalizedTooltip = formatExtGroupTooltipTitle(tooltip);
  const title = normalizedTooltip.includes("\n") ? (
    <span style={{ whiteSpace: "pre-line", display: "block" }}>
      {normalizedTooltip}
    </span>
  ) : normalizedTooltip;
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
  return <Tooltip title={title} {...EXT_GROUP_FIELD_TOOLTIP_PROPS}>{label}</Tooltip>;
};

export const ExtGroupSectionHeading = ({
  tooltipKey,
  children,
  isFirst = false,
}) => {
  const isLaptopNarrow = useMediaQuery("(max-width: 1366px)");
  return (
    <div
      style={{
        margin: isFirst
          ? isLaptopNarrow
            ? "16px 0 24px 0"
            : "0 0 24px 0"
          : "16px 0 24px 0",
        position: "relative",
        width: "100%",
      }}
    >
      <div style={{ borderTop: `1px solid ${C.cardBorder}` }} />
      <span
        style={{
          position: "absolute",
          top: -10,
          left: isLaptopNarrow ? 0 : -6,
          background: EXTENSION_MODAL_SECTION_BG,
          paddingRight: 8,
          fontSize: 14,
          fontWeight: 600,
          color: EXTENSION_MODAL_SECTION_HEADING_COLOR,
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        <ExtGroupFieldLabel
          tooltipKey={tooltipKey}
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: EXTENSION_MODAL_SECTION_HEADING_COLOR,
          }}
        >
          {children}
        </ExtGroupFieldLabel>
      </span>
    </div>
  );
};
