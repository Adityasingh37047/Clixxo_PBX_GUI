import React from "react";
import { C } from "../../../../theme/pbxTokens";
import { ExtensionBreadcrumb as SystemInfoPageBreadcrumb } from "../../../../components/common";
import { SYSTEM_INFO_BREADCRUMB_SEGMENTS } from "../../../../constants/SystemInfoConstants";
import {
  SYSTEM_INFO_CARD_RADIUS,
  SYSTEM_INFO_CARD_SHADOW,
  SYSTEM_INFO_STAT_CARD_SHADOW,
  SYSTEM_INFO_CARD_HEADER,
  SYSTEM_INFO_WARNING_AMBER,
} from "./SystemInfoTableHelpers";

export const SystemInfoBreadcrumb = ({ style } = {}) => (
  <SystemInfoPageBreadcrumb
    root={SYSTEM_INFO_BREADCRUMB_SEGMENTS[0]}
    section={SYSTEM_INFO_BREADCRUMB_SEGMENTS[1]}
    current={SYSTEM_INFO_BREADCRUMB_SEGMENTS[2]}
    style={style}
  />
);

const renderPktsValue = (val) => {
  const str = Array.isArray(val) ? val.join("  ") : String(val ?? "");
  const parts = str.split(/(\bErr:\s*\d+|\bDrop:\s*\d+)/g);
  return (
    <>
      {parts.map((part, i) => {
        const t = part.trim();
        if (/^Err:\s*0$/.test(t))
          return (
            <span key={i} style={{ color: C.successGreen, marginLeft: 2 }}>
              {part}
            </span>
          );
        if (/^Err:/.test(t))
          return (
            <span key={i} style={{ color: SYSTEM_INFO_WARNING_AMBER, marginLeft: 2 }}>
              {part}
            </span>
          );
        if (/^Drop:\s*0$/.test(t))
          return (
            <span key={i} style={{ color: C.mutedText, marginLeft: 2 }}>
              {part}
            </span>
          );
        if (/^Drop:/.test(t))
          return (
            <span key={i} style={{ color: SYSTEM_INFO_WARNING_AMBER, marginLeft: 2 }}>
              {part}
            </span>
          );
        return <span key={i}>{part}</span>;
      })}
    </>
  );
};

/** Rounded status chip — shared by DCMS rows and Memory Health in Storage Details. */
export const SystemInfoStatusBadge = ({ children, color, background }) => (
  <span
    style={{
      background: background ?? "#dcfce7",
      color: color ?? C.successGreen,
      padding: "1px 8px",
      borderRadius: SYSTEM_INFO_CARD_RADIUS,
      fontSize: 11,
      fontWeight: 700,
    }}
  >
    {children}
  </span>
);

export const renderCellValue = (key, val) => {
  if (val === null || val === undefined || val === "")
    return <span style={{ color: C.mutedText }}>—</span>;
  const lk = (key || "").toLowerCase();
  const isPkts = lk.includes("pkts") || lk.includes("packet");
  if (isPkts) return renderPktsValue(val);
  let str = Array.isArray(val) ? val.join(", ") : String(val);
  // For IP Address field, strip IPv6 addresses (entries containing ':')
  if (lk === "ip address") {
    const parts = str
      .split(",")
      .map((s) => s.trim())
      .filter((s) => !s.includes(":"));
    str = parts.length > 0 ? parts.join(", ") : str;
  }
  if ((lk.includes("dcms") || lk.includes("status")) && str) {
    const running = str.toLowerCase() === "running";
    return (
      <SystemInfoStatusBadge
        background={running ? "#dcfce7" : "#fee2e2"}
        color={running ? C.successGreen : C.errorRed}
      >
        {str}
      </SystemInfoStatusBadge>
    );
  }
  return str;
};

export const Card = ({ title, children, style }) => (
  <div
    style={{
      background: C.cardBg,
      border: `1px solid ${C.cardBorder}`,
      borderRadius: SYSTEM_INFO_CARD_RADIUS,
      overflow: "hidden",
      boxShadow: SYSTEM_INFO_CARD_SHADOW,
      ...style,
    }}
  >
    <div
      style={{
        background: SYSTEM_INFO_CARD_HEADER,
        padding: "8px 14px",
        color: "#fff",
        fontWeight: 700,
        fontSize: 13,
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: C.accent,
          display: "inline-block",
        }}
      />
      {title}
    </div>
    {children}
  </div>
);

export const InfoTableRow = ({ label, value, keyName, even, valueBadge }) => (
  <div
    style={{
      display: "flex",
      borderBottom: `1px solid ${C.divider}`,
      padding: "5px 14px",
      minHeight: 28,
      alignItems: "center",
      background: even ? "#f8fafc" : "#ffffff",
    }}
  >
    <span
      style={{
        color: C.labelText,
        fontSize: 12,
        width: "42%",
        flexShrink: 0,
        fontWeight: 600,
      }}
    >
      {label}
    </span>
    <span
      style={{ color: C.valueText, fontSize: 12, flex: 1, fontWeight: 600 }}
    >
      {valueBadge != null &&
      value !== null &&
      value !== undefined &&
      value !== "" ? (
        <SystemInfoStatusBadge
          color={valueBadge.color}
          background={valueBadge.background}
        >
          {value}
        </SystemInfoStatusBadge>
      ) : (
        renderCellValue(keyName || label, value)
      )}
    </span>
  </div>
);

/** Optional flex fill for paired equal-height cards; off for natural-height columns. */
export const InfoCardBody = ({ rowCount, children, stretch = true }) => {
  const fillBg =
    rowCount > 0 && (rowCount - 1) % 2 === 1 ? "#f8fafc" : "#ffffff";

  return (
    <div
      style={{
        flex: stretch ? 1 : undefined,
        display: "flex",
        flexDirection: "column",
        minHeight: stretch ? 0 : undefined,
      }}
    >
      {children}
      {stretch && rowCount > 0 ? (
        <div
          aria-hidden
          style={{ flex: 1, background: fillBg, minHeight: 0 }}
        />
      ) : null}
    </div>
  );
};

export const StatCard = ({ label, value, type, accentColor }) => {
  const accent = accentColor || C.accent;
  let content;
  if (type === "status") {
    const running = String(value ?? "").toLowerCase() === "running";
    content = value ? (
      <div style={{ alignSelf: "flex-start", display: "inline-block" }}>
        <span
          style={{
            background: running ? "#dcfce7" : "#fee2e2",
            color: running ? C.successGreen : C.errorRed,
            padding: "3px 12px",
            borderRadius: SYSTEM_INFO_CARD_RADIUS,
            fontSize: 13,
            fontWeight: 700,
            display: "inline-block",
          }}
        >
          {value}
        </span>
      </div>
    ) : (
      <span style={{ color: C.mutedText, fontSize: 18, fontWeight: 700 }}>
        —
      </span>
    );
  } else if (type === "cpu") {
    const pct = parseFloat(value) || 0;
    content = (
      <span
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: pct > 80 ? SYSTEM_INFO_WARNING_AMBER : C.successGreen,
        }}
      >
        {value || "0.00%"}
      </span>
    );
  } else {
    content = (
      <span style={{ fontSize: 20, fontWeight: 700, color: C.valueText }}>
        {value || "0.00%"}
      </span>
    );
  }
  return (
    <div
      style={{
        background: C.cardBg,
        border: `1px solid ${C.cardBorder}`,
        borderLeft: `3px solid ${accent}`,
        borderRadius: SYSTEM_INFO_CARD_RADIUS,
        padding: "16px 18px",
        minHeight: 80,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: SYSTEM_INFO_STAT_CARD_SHADOW,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: C.mutedText,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      {content}
    </div>
  );
};
