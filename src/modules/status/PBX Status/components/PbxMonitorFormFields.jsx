import React from "react";
import { ExtensionBreadcrumb } from "../../../../components/common";
import { PBX_MONITOR_BREADCRUMB_SEGMENTS } from "../../../../constants/PbxMonitorConstants";
import { C } from "../../../../theme/pbxTokens";
import {
  CARD_RADIUS,
  PBX_MONITOR_STAT_CARD_SHADOW,
  STATUS_BADGE_WIDTH,
  tdStyle,
} from "./PbxMonitorTableHelpers";

export const PbxMonitorBreadcrumb = ({ style } = {}) => (
  <ExtensionBreadcrumb
    root={PBX_MONITOR_BREADCRUMB_SEGMENTS[0]}
    section={PBX_MONITOR_BREADCRUMB_SEGMENTS[1]}
    current={PBX_MONITOR_BREADCRUMB_SEGMENTS[2]}
    style={style}
  />
);

export const StatCard = ({ label, value, accent, ready }) => (
  <div
    style={{
      background: "#ffffff",
      borderRadius: CARD_RADIUS,
      padding: "8px 12px",
      minHeight: 52,
      border: `1px solid ${C.cardBorder}`,
      borderLeft: `3px solid ${accent}`,
      boxShadow: PBX_MONITOR_STAT_CARD_SHADOW,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      gap: 4,
    }}
  >
    <span
      style={{
        fontSize: 10,
        color: C.labelText,
        fontWeight: 600,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        lineHeight: 1.2,
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontSize: 20,
        fontWeight: 700,
        lineHeight: 1,
        color: ready ? accent : C.mutedText,
      }}
    >
      {ready ? value : "—"}
    </span>
  </div>
);

export const StatusBadge = ({ tone, text }) => {
  const colors = {
    ok: {
      color: C.successGreen,
      dot: C.successGreen,
    },
    bad: {
      color: C.errorRed,
      dot: C.errorRed,
    },
    neutral: {
      // bg: "#f1f5f9",
      color: "#64748b",
      dot: "#94a3b8",
    },
  };

  const s = colors[tone] || colors.neutral;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 6,
        boxSizing: "border-box",
        width: STATUS_BADGE_WIDTH,
        minWidth: STATUS_BADGE_WIDTH,
        background: s.bg,
        color: s.color,
        padding: "4px 11px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.01em",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: s.dot,
        }}
      />
      {text}
    </span>
  );
};

export const TypePill = ({ text }) => (
  <span
    style={{
      // background: "#eff6ff",
      color: C.accent,
      // border: `1px solid ${C.accent}`,
      padding: "4px 11px",
      borderRadius: 999,
      fontWeight: 700,
      fontSize: 11,
      letterSpacing: "0.01em",
      whiteSpace: "nowrap",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: 72,
    }}
  >
    {text}
  </span>
);

export const TD = ({ children, align = "center", mono, style: extra, bg }) => (
  <td
    style={{
      ...tdStyle,
      textAlign: align,
      fontFamily: mono ? "monospace" : "inherit",
      fontWeight: 400,
      ...(bg != null ? { background: bg } : {}),
      ...extra,
    }}
  >
    {children || <span style={{ color: C.mutedText }}>—</span>}
  </td>
);
