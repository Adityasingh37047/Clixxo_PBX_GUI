import React from "react";
import RefreshIcon from "@mui/icons-material/Refresh";
import { CircularProgress } from "@mui/material";
import { C } from "../../../../theme/pbxTokens";
import {
  SYSTEM_INFO_CARD_TITLES,
  SYSTEM_INFO_RESOURCE_LABELS,
  SYSTEM_INFO_RESOURCE_COLORS,
  SYSTEM_INFO_USAGE_GAUGE_THRESHOLDS,
} from "../../../../constants/SystemInfoConstants";
import {
  SYSTEM_INFO_CARD_HEADER,
  SYSTEM_INFO_CARD_RADIUS,
  SYSTEM_INFO_CARD_SHADOW,
} from "./SystemInfoTableHelpers";
import { InfoCardBody, InfoTableRow } from "./SystemInfoFormFields";

const {
  gaugeUsed,
  gaugeTrack,
  diskUsed,
  diskAvailable,
  bodyText,
  valueText,
} = SYSTEM_INFO_RESOURCE_COLORS;

const L = SYSTEM_INFO_RESOURCE_LABELS;

const appletCardStyle = {
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: SYSTEM_INFO_CARD_RADIUS,
  overflow: "hidden",
  boxShadow: SYSTEM_INFO_CARD_SHADOW,
  display: "flex",
  flexDirection: "column",
  height: "100%",
};

const AppletCard = ({ title, onRefresh, refreshing, children }) => (
  <div style={appletCardStyle}>
    <div
      style={{
        background: SYSTEM_INFO_CARD_HEADER,
        padding: "8px 14px",
        color: "#fff",
        fontWeight: 700,
        fontSize: 13,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 6,
      }}
    >
      <span
        style={{
          display: "inline-flex",
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
      </span>
      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        title="Refresh"
        aria-label={`Refresh ${title}`}
        style={{
          border: "none",
          background: "transparent",
          padding: 2,
          margin: 0,
          cursor: refreshing ? "not-allowed" : "pointer",
          display: "inline-flex",
          alignItems: "center",
          color: "#fff",
          opacity: refreshing ? 0.6 : 1,
        }}
      >
        {refreshing ? (
          <CircularProgress size={14} style={{ color: "#fff" }} />
        ) : (
          <RefreshIcon sx={{ fontSize: 18, color: "#fff" }} />
        )}
      </button>
    </div>
    {children}
  </div>
);

const sectionDividerStyle = {
  border: "none",
  borderTop: `1px solid ${C.divider}`,
  margin: 0,
};

const parsePercentNumeric = (value) => {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") {
    return Number.isNaN(value) ? 0 : Math.min(100, Math.max(0, value));
  }
  const n = parseFloat(String(value).replace("%", "").trim());
  return Number.isNaN(n) ? 0 : Math.min(100, Math.max(0, n));
};

/** Preserve API percentage text (e.g. "0.70%", 17.43 → "17.43%"). */
const formatPercentDisplay = (value) => {
  if (value === null || value === undefined || value === "") return "0%";
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.endsWith("%") ? trimmed : `${trimmed}%`;
  }
  return `${value}%`;
};

const getGaugeFontSizes = (valueText, { size, isDisk = false }) => {
  const len = valueText.length;
  if (isDisk) {
    if (len >= 7) return { main: 16, suffix: 10 };
    if (len >= 5) return { main: 20, suffix: 11 };
    if (len >= 4) return { main: 24, suffix: 12 };
    return { main: 28, suffix: 14 };
  }
  if (len >= 7) return { main: 12, suffix: 8 };
  if (len >= 5) return { main: 16, suffix: 9 };
  if (len >= 4) return { main: 18, suffix: 10 };
  return { main: size > 110 ? 28 : 22, suffix: size > 110 ? 14 : 12 };
};

const GaugePercentText = ({ value, size, isDisk = false }) => {
  const display = formatPercentDisplay(value);
  const valuePart = display.endsWith("%") ? display.slice(0, -1) : display;
  const { main, suffix } = getGaugeFontSizes(valuePart, { size, isDisk });

  return (
    <div
      style={{
        fontWeight: 700,
        fontSize: main,
        color: valueText,
        lineHeight: 1.1,
        textAlign: "center",
        padding: "0 2px",
        maxWidth: "100%",
        wordBreak: "break-all",
      }}
    >
      {valuePart}
      <span style={{ fontSize: suffix, fontWeight: 700 }}>%</span>
    </div>
  );
};

const getUsageGaugeColor = (metricType, percent) => {
  const thresholds = SYSTEM_INFO_USAGE_GAUGE_THRESHOLDS[metricType];
  if (!thresholds) return gaugeUsed;

  const pct = parsePercentNumeric(percent);
  const band = thresholds.find((t) => pct <= t.max);
  const colorKey = band?.color ?? "gaugeRed";
  return SYSTEM_INFO_RESOURCE_COLORS[colorKey] ?? gaugeUsed;
};

/** Circular usage gauge (CPU / RAM / SWAP). */
export const UsageDonut = ({
  percent = 0,
  label,
  metricType,
  size = 96,
  thickness = 12,
  color = gaugeUsed,
  trackColor = gaugeTrack,
}) => {
  const arc = parsePercentNumeric(percent);
  const progressColor = metricType
    ? getUsageGaugeColor(metricType, percent)
    : color;
  const inner = size - thickness * 2;

  return (
    <div style={{ textAlign: "center", flex: 1, minWidth: 0 }}>
      {label ? (
        <div
          style={{
            fontWeight: 700,
            fontSize: 13,
            color: bodyText,
            marginBottom: 10,
          }}
        >
          {label}
        </div>
      ) : null}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          margin: "0 auto",
          background: `conic-gradient(${progressColor} ${arc * 3.6}deg, ${trackColor} 0deg)`,
          display: "grid",
          placeItems: "center",
        }}
      >
        <div
          style={{
            width: inner,
            height: inner,
            borderRadius: "50%",
            background: "#fff",
            display: "grid",
            placeItems: "center",
            padding: 2,
          }}
        >
          <GaugePercentText value={percent} size={size} />
        </div>
      </div>
    </div>
  );
};

/** Dual-color disk donut (used / available). */
export const DiskDonut = ({
  usedPercent = 0,
  size = 130,
  thickness = 18,
}) => {
  const arc = parsePercentNumeric(usedPercent);
  const inner = size - thickness * 2;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        background: `conic-gradient(${diskUsed} 0deg ${arc * 3.6}deg, ${diskAvailable} ${arc * 3.6}deg 360deg)`,
        display: "grid",
        placeItems: "center",
      }}
    >
      <div
        style={{
          width: inner,
          height: inner,
          borderRadius: "50%",
          background: "#fff",
          display: "grid",
          placeItems: "center",
          padding: 2,
        }}
      >
        <GaugePercentText value={usedPercent} size={size} isDisk />
      </div>
    </div>
  );
};

const ResourceInfoRow = ({ label, value, isLast }) => (
  <div
    style={{
      display: "flex",
      gap: 12,
      padding: "6px 0",
      borderBottom: isLast ? "none" : `1px solid ${C.divider}`,
      fontSize: 12,
      lineHeight: 1.45,
    }}
  >
    <span style={{ fontWeight: 700, color: valueText, whiteSpace: "nowrap" }}>
      {label}:
    </span>
    <span style={{ color: bodyText, wordBreak: "break-word" }}>
      {value || "—"}
    </span>
  </div>
);

export const SystemResourcesCard = ({
  data,
  onRefresh,
  refreshing = false,
}) => {
  const d = data || {};
  return (
    <AppletCard
      title={SYSTEM_INFO_CARD_TITLES.systemResources}
      onRefresh={onRefresh}
      refreshing={refreshing}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "flex-start",
          gap: 8,
          padding: "18px 12px 16px",
        }}
      >
        <UsageDonut percent={d.cpuPercent} label={L.cpu} metricType="cpu" />
        <UsageDonut percent={d.ramPercent} label={L.ram} metricType="ram" />
        <UsageDonut percent={d.swapPercent} label={L.swap} metricType="swap" />
      </div>
      <hr style={sectionDividerStyle} />
      <InfoCardBody rowCount={4} stretch={false}>
        <InfoTableRow
          label={L.cpuInfo}
          value={d.cpuInfo}
          keyName={L.cpuInfo}
          even={false}
        />
        <InfoTableRow
          label={L.uptime}
          value={d.uptime}
          keyName={L.uptime}
          even
        />
        <InfoTableRow
          label={L.cpuSpeed}
          value={d.cpuSpeed}
          keyName={L.cpuSpeed}
          even={false}
        />
        <InfoTableRow
          label={L.memoryUsage}
          value={d.memoryUsage}
          keyName={L.memoryUsage}
          even
        />
      </InfoCardBody>
    </AppletCard>
  );
};

const LegendSwatch = ({ color, children }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      marginRight: 14,
      fontSize: 12,
      color: bodyText,
      fontWeight: 600,
    }}
  >
    <span
      style={{
        width: 10,
        height: 10,
        background: color,
        display: "inline-block",
        flexShrink: 0,
      }}
    />
    {children}
  </span>
);

export const HardDrivesCard = ({
  data,
  onRefresh,
  refreshing = false,
}) => {
  const d = data || {};
  const used = Math.round(Number(d.usedPercent) || 0);
  const availRaw = d.availablePercent;
  const avail = Math.round(
    availRaw != null && !Number.isNaN(Number(availRaw))
      ? Number(availRaw)
      : Math.max(0, 100 - used),
  );

  return (
    <AppletCard
      title={SYSTEM_INFO_CARD_TITLES.hardDrives}
      onRefresh={onRefresh}
      refreshing={refreshing}
    >
      <div
        style={{
          display: "flex",
          gap: 16,
          padding: "18px 16px 16px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <DiskDonut usedPercent={d.usedPercent} />
        <div
          style={{
            flex: 1,
            minWidth: 180,
            background: "#f3f4f6",
            border: `1px solid ${C.cardBorder}`,
            borderRadius: 6,
            padding: "12px 14px",
          }}
        >
          <div style={{ marginBottom: 10 }}>
            <LegendSwatch color={diskUsed}>
              {used}% {L.used}
            </LegendSwatch>
            <LegendSwatch color={diskAvailable}>
              {avail}% {L.available}
            </LegendSwatch>
          </div>
          <hr style={{ ...sectionDividerStyle, marginBottom: 8 }} />
          <ResourceInfoRow label={L.hardDiskCapacity} value={d.capacity} />
          <ResourceInfoRow label={L.mountPoint} value={d.mountPoint} />
          <ResourceInfoRow label={L.availableSpace} value={d.availableSpace} isLast />
        </div>
      </div>
    </AppletCard>
  );
};
