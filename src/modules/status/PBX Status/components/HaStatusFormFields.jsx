import React from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  HA_STATUS_NODE_KEYS,
  HA_STATUS_REPLICATION_LAG_WARN_SEC,
  HA_STATUS_ROW_LABELS,
} from "../../../../constants/HaStatusConstants";
import { SIP_SETTINGS_SECTION_HEADING_LEFT } from "../../../../constants/SipSettingsConstants";
import { C } from "../../../../theme/pbxTokens";
import { HA_STATUS_GREY } from "../../../System/System Settings/components/HaConfigTableHelpers";
import {
  SIP_SETTINGS_CONTROL_WIDTH,
  SIP_SETTINGS_LABEL_WIDTH,
  SIP_SETTINGS_LAPTOP_NARROW_MQ,
  sipSettingsFieldGroupStyle,
  sipSettingsLabelStyle,
  sipSettingsLabelWrapStyle,
} from "../../../System/System Settings/components/SipSettingsFormFields";

const HA_STATUS_SECTION_HEADING_COLOR = "#30415A";
const HA_STATUS_SECTION_HEADING_FIRST_MARGIN = "12px 0 24px 0";

const GREEN = C.successGreen;
const AMBER = "#b45309";
const RED = C.errorRed;
const GREY = HA_STATUS_GREY;

const MutedDash = () => (
  <span style={{ color: C.mutedText, fontSize: 13 }}>—</span>
);

const TextValue = ({ children, color = C.valueText, bold = false }) => (
  <span
    style={{
      fontSize: 13,
      color,
      fontWeight: bold ? 600 : 500,
    }}
  >
    {children}
  </span>
);

const formatLabel = (value) => {
  const text = String(value ?? "")
    .trim()
    .replaceAll("_", " ");
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

const StatusText = ({ children, color = C.valueText, bold = false }) => (
  <TextValue color={color} bold={bold}>
    {children}
  </TextValue>
);

export const haStatusFieldGroupStyle = {
  ...sipSettingsFieldGroupStyle,
  gap: 4,
};

const HaStatusRow = ({
  label,
  children,
  isCompact = false,
  labelColWidth = SIP_SETTINGS_LABEL_WIDTH,
  labelOffsetLeft = 0,
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: isCompact ? "column" : "row",
      alignItems: isCompact ? "stretch" : "center",
      width: "100%",
      minHeight: 28,
      gap: 8,
    }}
  >
    <div
      style={
        isCompact
          ? { width: "100%" }
          : {
              ...sipSettingsLabelWrapStyle(labelColWidth),
              paddingLeft: labelOffsetLeft,
              boxSizing: "border-box",
            }
      }
    >
      <span style={sipSettingsLabelStyle}>{label}</span>
    </div>
    <div
      style={
        isCompact
          ? { width: "100%" }
          : {
              flex: "1 1 auto",
              minWidth: SIP_SETTINGS_CONTROL_WIDTH,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
            }
      }
    >
      <div
        style={{
          width: isCompact ? "100%" : SIP_SETTINGS_CONTROL_WIDTH,
          minWidth: isCompact ? 0 : SIP_SETTINGS_CONTROL_WIDTH,
          display: "flex",
          alignItems: "center",
        }}
      >
        {children}
      </div>
    </div>
  </div>
);

const renderYesNo = (value) => {
  const v = String(value ?? "").toLowerCase();
  if (v === "yes" || v === "true") {
    return <StatusText color={GREEN}>{formatLabel(v)}</StatusText>;
  }
  if (v === "no" || v === "false") {
    return <StatusText color={GREY}>{formatLabel(v)}</StatusText>;
  }
  return <MutedDash />;
};

const renderRole = (value) => {
  const role = String(value || "").toLowerCase();
  if (role === "active") {
    return <StatusText color={GREEN}>{formatLabel(role)}</StatusText>;
  }
  if (role === "standby") {
    return <StatusText color={AMBER}>{formatLabel(role)}</StatusText>;
  }
  if (role === "disabled" || role === "unconfigured") {
    return <StatusText color={GREY}>{formatLabel(role)}</StatusText>;
  }
  return value ? <TextValue>{formatLabel(value)}</TextValue> : <MutedDash />;
};

const renderPeerStatus = (value) => {
  const v = String(value || "").toLowerCase();
  if (v === "up") {
    return <StatusText color={GREEN}>{formatLabel(v)}</StatusText>;
  }
  if (v === "down") {
    return <StatusText color={RED}>{formatLabel(v)}</StatusText>;
  }
  return value ? <TextValue>{formatLabel(value)}</TextValue> : <MutedDash />;
};

const renderVpn = (value) => {
  const v = String(value || "").toLowerCase();
  if (v === "up") {
    return <StatusText color={GREEN}>{formatLabel(v)}</StatusText>;
  }
  if (v === "down") {
    return <StatusText color={AMBER}>{formatLabel(v)}</StatusText>;
  }
  return value ? <TextValue>{formatLabel(value)}</TextValue> : <MutedDash />;
};

const renderOk = (value) => {
  const v = String(value || "").toLowerCase();
  if (v === "ok") {
    return <StatusText color={GREEN}>{formatLabel(v)}</StatusText>;
  }
  if (v === "not_configured" || v === "none") {
    return <StatusText color={AMBER}>{formatLabel(value)}</StatusText>;
  }
  if (v === "failing" || v === "broken" || v === "missing_vip") {
    return <StatusText color={RED}>{formatLabel(value)}</StatusText>;
  }
  return value ? <TextValue>{formatLabel(value)}</TextValue> : <MutedDash />;
};

const renderKeepalived = (value) => {
  const v = String(value || "").toLowerCase();
  if (!v) return <MutedDash />;
  if (v === "active") {
    return <StatusText color={GREEN}>{formatLabel(v)}</StatusText>;
  }
  return <StatusText color={RED}>{formatLabel(value)}</StatusText>;
};

const renderAsterisk = (value) => {
  const v = String(value || "").toLowerCase();
  if (!v) return <MutedDash />;
  if (v === "running") {
    return <StatusText color={GREEN}>{formatLabel(v)}</StatusText>;
  }
  return <StatusText color={RED}>{formatLabel(value)}</StatusText>;
};

const renderLag = (value) => {
  if (value === null || value === undefined || value === "") return <MutedDash />;
  const n = Number(value);
  if (Number.isNaN(n)) return <MutedDash />;
  const warn = n > HA_STATUS_REPLICATION_LAG_WARN_SEC;
  const color = n === 0 ? GREEN : warn ? AMBER : GREEN;
  return (
    <TextValue color={color} bold={warn}>
      {n} s
    </TextValue>
  );
};

const renderMaintenance = (value) => {
  if (value === true) {
    return <StatusText color={AMBER}>On</StatusText>;
  }
  if (value === false) {
    return <StatusText color={GREEN}>Off</StatusText>;
  }
  return <MutedDash />;
};

const renderReachable = (value) => {
  if (value === true) {
    return <StatusText color={GREEN}>Reachable</StatusText>;
  }
  if (value === false) {
    return <StatusText color={RED}>Unreachable</StatusText>;
  }
  return <MutedDash />;
};

export const HaStatusReachableValue = ({ reachable }) =>
  renderReachable(reachable);

const renderField = (key, node) => {
  const value = node?.[key];
  switch (key) {
    case "enabled":
      return renderYesNo(value);
    case "role":
      return renderRole(value);
    case "peerStatus":
      return renderPeerStatus(value);
    case "vpn":
      return renderVpn(value);
    case "keepalived":
      return renderKeepalived(value);
    case "asterisk":
      return renderAsterisk(value);
    case "health":
    case "replication":
    case "certificate":
      return renderOk(value);
    case "replicationLag":
      return renderLag(value);
    case "maintenance":
      return renderMaintenance(value);
    case "reachable":
      return renderReachable(value);
    case "mode":
      return value === "" || value === null || value === undefined ? (
        <MutedDash />
      ) : (
        <TextValue>{formatLabel(value)}</TextValue>
      );
    case "contacts": {
      if (value === "" || value === null || value === undefined) {
        return <MutedDash />;
      }
      const warnStandby =
        String(node.role || "").toLowerCase() === "standby" &&
        Number(value) > 0;
      return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <TextValue>{value}</TextValue>
          {warnStandby ? (
            <span style={{ color: AMBER, fontWeight: 700 }}>⚠</span>
          ) : null}
        </span>
      );
    }
    case "trunks":
      return value === "" || value === null || value === undefined ? (
        <MutedDash />
      ) : (
        <TextValue>{value}</TextValue>
      );
    default:
      return value === "" || value === null || value === undefined ? (
        <MutedDash />
      ) : (
        <TextValue>{String(value)}</TextValue>
      );
  }
};

export const HaStatusNodeRows = ({
  node,
  extraRows = [],
  isCompact = false,
  labelColWidth = SIP_SETTINGS_LABEL_WIDTH,
  labelOffsetLeft = 0,
}) => {
  const rowProps = { isCompact, labelColWidth, labelOffsetLeft };
  const keys = [...extraRows, ...HA_STATUS_NODE_KEYS];

  return (
    <div style={haStatusFieldGroupStyle}>
      {keys.map((key) => (
        <HaStatusRow
          key={key}
          label={HA_STATUS_ROW_LABELS[key] || key}
          {...rowProps}
        >
          {renderField(key, node)}
        </HaStatusRow>
      ))}
    </div>
  );
};

export const HaStatusPeerSectionHeading = ({
  title,
  reachable,
  isFirst = true,
}) => {
  const isLaptopNarrow = useMediaQuery(SIP_SETTINGS_LAPTOP_NARROW_MQ);
  const titleLeft = isLaptopNarrow ? 0 : SIP_SETTINGS_SECTION_HEADING_LEFT;

  return (
    <div
      style={{
        margin: isFirst
          ? isLaptopNarrow
            ? "20px 0 24px 0"
            : HA_STATUS_SECTION_HEADING_FIRST_MARGIN
          : "28px 0 24px 0",
        position: "relative",
        width: "100%",
      }}
    >
      <div style={{ borderTop: `1px solid ${C.divider}` }} />
      <div
        style={{
          position: "absolute",
          top: -10,
          left: titleLeft,
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          background: C.cardBg,
          paddingRight: 8,
          lineHeight: 1.4,
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: HA_STATUS_SECTION_HEADING_COLOR,
          }}
        >
          {title}
        </span>
        <HaStatusReachableValue reachable={reachable} />
      </div>
    </div>
  );
};
