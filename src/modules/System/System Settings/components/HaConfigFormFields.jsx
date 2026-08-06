import React from "react";
import {
  HA_STATUS_BTN_CONFIGURE,
  HA_STATUS_CARD_TITLE,
  HA_STATUS_NOT_ENABLED_HEADING,
  HA_STATUS_NOT_ENABLED_LINES,
  HA_STATUS_REPLICATION_LAG_WARN_SEC,
  HA_STATUS_ROW_LABELS,
} from "../../../../constants/HaStatusConstants";
import { getLocalIpDisplayLabel } from "../utils/localIpOptionsUtils";
import { C } from "../../../../theme/pbxTokens";
import {
  CARD_RADIUS,
  HA_STATUS_AMBER,
  HA_STATUS_BLUE,
  HA_STATUS_CARD_SHADOW,
  HA_STATUS_GREY,
  haStatusBadgeStyle,
  haStatusNotEnabledBoxStyle,
  haStatusTableStyle,
} from "./HaConfigTableHelpers";
import {
  SIP_SETTINGS_LABEL_WIDTH,
  SIP_SETTINGS_CONTROL_WIDTH,
  sipSettingsFieldGroupStyle,
  sipSettingsLabelWrapStyle,
  sipSettingsLabelStyle,
} from "./SipSettingsFormFields";

const StatusBadge = ({ children, color, background }) => (
  <span style={haStatusBadgeStyle(color, background)}>{children}</span>
);

const MutedDash = () => (
  <span style={{ color: C.mutedText, fontSize: 13 }}>—</span>
);

const formatInterfaceLabel = (ifaceValue, interfaceOptions = []) => {
  if (!ifaceValue) return "";
  const opt = interfaceOptions.find((o) => o.value === ifaceValue);
  return getLocalIpDisplayLabel(opt, ifaceValue);
};

export const HaStatusNotEnabledPanel = ({ onConfigure, embedded = false }) => (
  <div
    style={
      embedded
        ? {
            padding: "8px 0 4px",
            boxSizing: "border-box",
          }
        : haStatusNotEnabledBoxStyle
    }
  >
    {!embedded && (
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: C.labelText,
          marginBottom: 20,
        }}
      >
        {HA_STATUS_CARD_TITLE}
      </div>
    )}
    <p
      style={{
        fontSize: 15,
        fontWeight: 600,
        color: C.valueText,
        margin: "0 0 16px",
        textAlign: embedded ? "left" : "center",
      }}
    >
      {HA_STATUS_NOT_ENABLED_HEADING}
    </p>
    {HA_STATUS_NOT_ENABLED_LINES.map((line) => (
      <p
        key={line}
        style={{
          fontSize: 13,
          color: C.mutedText,
          lineHeight: 1.55,
          margin: "0 0 10px",
          textAlign: embedded ? "left" : "center",
          maxWidth: embedded ? "none" : 420,
          marginLeft: embedded ? 0 : "auto",
          marginRight: embedded ? 0 : "auto",
        }}
      >
        {line}
      </p>
    ))}
    {typeof onConfigure === "function" && (
      <div
        style={{
          marginTop: 28,
          display: "flex",
          justifyContent: embedded ? "flex-start" : "center",
        }}
      >
        <button
          type="button"
          onClick={onConfigure}
          style={{
            height: 32,
            padding: "0 18px",
            fontSize: 12,
            fontWeight: 600,
            borderRadius: 4,
            border: `1px solid ${C.accent}`,
            background: C.accent,
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {HA_STATUS_BTN_CONFIGURE}
        </button>
      </div>
    )}
  </div>
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
          : sipSettingsLabelWrapStyle(labelColWidth)
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

export function HaStatusValueCells({
  status,
  interfaceOptions = [],
  isCompact = false,
  labelColWidth = SIP_SETTINGS_LABEL_WIDTH,
}) {
  if (!status) return null;

  const rowProps = { isCompact, labelColWidth };

  const ifaceLabel = formatInterfaceLabel(
    status.virtualIpInterface,
    interfaceOptions,
  );

  const renderRole = () => {
    const role = (status.role || "").toUpperCase();
    if (role === "ACTIVE") {
      return (
        <StatusBadge color="#fff" background={C.successGreen}>
          Active
        </StatusBadge>
      );
    }
    if (role === "STANDBY") {
      return (
        <StatusBadge color="#fff" background={HA_STATUS_BLUE}>
          Standby
        </StatusBadge>
      );
    }
    if (role === "DISABLED") {
      return (
        <StatusBadge color="#fff" background={HA_STATUS_GREY}>
          Disabled
        </StatusBadge>
      );
    }
    return <MutedDash />;
  };

  const renderMaintenance = () => {
    if (status.maintenance === true) {
      return (
        <StatusBadge color="#78350f" background={HA_STATUS_AMBER}>
          on
        </StatusBadge>
      );
    }
    if (status.maintenance === false) {
      return (
        <span style={{ fontSize: 13, color: C.valueText }}>off</span>
      );
    }
    return <MutedDash />;
  };

  const renderVirtualIp = () => {
    const vip = (status.virtualIp || "").trim();
    if (!vip && !ifaceLabel) return <MutedDash />;
    const parts = [vip, ifaceLabel].filter(Boolean);
    return (
      <span style={{ fontSize: 13, color: C.valueText }}>
        {parts.join(" · ")}
      </span>
    );
  };

  const renderPeer = () => {
    const ip = (status.peerIp || "").trim();
    if (!ip) return <MutedDash />;
    if (status.peerReachable === true) {
      return (
        <span style={{ fontSize: 13 }}>
          <span style={{ color: C.valueText }}>{ip}</span>
          {" · "}
          <span style={{ color: C.successGreen, fontWeight: 600 }}>
            reachable
          </span>
        </span>
      );
    }
    if (status.peerReachable === false) {
      return (
        <span style={{ fontSize: 13 }}>
          <span style={{ color: C.valueText }}>{ip}</span>
          {" · "}
          <span style={{ color: C.errorRed, fontWeight: 600 }}>
            unreachable
          </span>
        </span>
      );
    }
    return <span style={{ fontSize: 13, color: C.valueText }}>{ip}</span>;
  };

  const renderRunStop = (value) => {
    const v = (value || "").toLowerCase();
    if (v === "running") {
      return (
        <StatusBadge color="#fff" background={C.successGreen}>
          running
        </StatusBadge>
      );
    }
    if (v === "stopped") {
      return (
        <StatusBadge color="#fff" background={C.errorRed}>
          stopped
        </StatusBadge>
      );
    }
    return <MutedDash />;
  };

  const renderHealth = () => {
    const v = (status.healthCheck || "").toUpperCase();
    if (v === "OK") {
      return (
        <StatusBadge color="#fff" background={C.successGreen}>
          OK
        </StatusBadge>
      );
    }
    if (v === "FAILING") {
      return (
        <StatusBadge color="#fff" background={C.errorRed}>
          Failing
        </StatusBadge>
      );
    }
    return <MutedDash />;
  };

  const renderReplication = () => {
    const v = (status.replication || "").toLowerCase();
    if (v === "ok") {
      return (
        <StatusBadge color="#fff" background={C.successGreen}>
          OK
        </StatusBadge>
      );
    }
    if (v === "broken") {
      return (
        <StatusBadge color="#fff" background={C.errorRed}>
          Broken
        </StatusBadge>
      );
    }
    if (v === "n-a" || v === "na" || v === "n/a") {
      return (
        <span style={{ fontSize: 13, color: HA_STATUS_GREY, fontWeight: 600 }}>
          n-a
        </span>
      );
    }
    return <MutedDash />;
  };

  const renderReplicationLag = () => {
    const sec = status.replicationLagSec;
    if (sec === null || sec === undefined || sec === "") return <MutedDash />;
    const n = Number(sec);
    if (Number.isNaN(n)) return <MutedDash />;
    const warn = n > HA_STATUS_REPLICATION_LAG_WARN_SEC;
    return (
      <span
        style={{
          fontSize: 13,
          fontWeight: warn ? 700 : 400,
          color: warn ? HA_STATUS_AMBER : C.valueText,
        }}
      >
        {n} s behind
      </span>
    );
  };

  const renderVpn = () => {
    const v = (status.vpnTunnel || "").toLowerCase();
    if (v === "up") {
      return (
        <StatusBadge color="#fff" background={C.successGreen}>
          up
        </StatusBadge>
      );
    }
    if (v === "down") {
      return (
        <StatusBadge color="#78350f" background={HA_STATUS_AMBER}>
          down
        </StatusBadge>
      );
    }
    return <MutedDash />;
  };

  const renderCertificate = () => {
    const c = (status.certificate || "").toLowerCase();
    if (c.includes("cover") || c === "covers_vip" || c === "ok") {
      return (
        <StatusBadge color="#fff" background={C.successGreen}>
          covers VIP
        </StatusBadge>
      );
    }
    if (c.includes("missing") || c === "missing_vip") {
      return (
        <StatusBadge color="#fff" background={C.errorRed}>
          missing VIP
        </StatusBadge>
      );
    }
    return <MutedDash />;
  };

  const renderTimestamp = () => {
    const ts = status.lastRoleChange;
    if (!ts) return <MutedDash />;
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) {
      return (
        <span style={{ fontSize: 13, color: C.valueText }}>{String(ts)}</span>
      );
    }
    return (
      <span style={{ fontSize: 13, color: C.valueText }}>
        {d.toLocaleString()}
      </span>
    );
  };

  return (
    <>
      <HaStatusRow label={HA_STATUS_ROW_LABELS.role} {...rowProps}>
        {renderRole()}
      </HaStatusRow>
      <HaStatusRow label={HA_STATUS_ROW_LABELS.maintenance} {...rowProps}>
        {renderMaintenance()}
      </HaStatusRow>
      <HaStatusRow label={HA_STATUS_ROW_LABELS.virtualIp} {...rowProps}>
        {renderVirtualIp()}
      </HaStatusRow>
      <HaStatusRow label={HA_STATUS_ROW_LABELS.peer} {...rowProps}>
        {renderPeer()}
      </HaStatusRow>
      <HaStatusRow label={HA_STATUS_ROW_LABELS.keepalived} {...rowProps}>
        {renderRunStop(status.keepalived)}
      </HaStatusRow>
      <HaStatusRow label={HA_STATUS_ROW_LABELS.asterisk} {...rowProps}>
        {renderRunStop(status.asterisk)}
      </HaStatusRow>
      <HaStatusRow label={HA_STATUS_ROW_LABELS.healthCheck} {...rowProps}>
        {renderHealth()}
      </HaStatusRow>
      <HaStatusRow label={HA_STATUS_ROW_LABELS.replication} {...rowProps}>
        {renderReplication()}
      </HaStatusRow>
      <HaStatusRow label={HA_STATUS_ROW_LABELS.replicationLag} {...rowProps}>
        {renderReplicationLag()}
      </HaStatusRow>
      <HaStatusRow label={HA_STATUS_ROW_LABELS.vpnTunnel} {...rowProps}>
        {renderVpn()}
      </HaStatusRow>
      <HaStatusRow label={HA_STATUS_ROW_LABELS.trunks} {...rowProps}>
        <span style={{ fontSize: 13, color: C.valueText }}>
          {status.trunksRegistered ?? 0} registered
        </span>
      </HaStatusRow>
      <HaStatusRow label={HA_STATUS_ROW_LABELS.phones} {...rowProps}>
        <span style={{ fontSize: 13, color: C.valueText }}>
          {status.phonesContacts ?? 0} contacts
        </span>
      </HaStatusRow>
      <HaStatusRow label={HA_STATUS_ROW_LABELS.certificate} {...rowProps}>
        {renderCertificate()}
      </HaStatusRow>
      <HaStatusRow label={HA_STATUS_ROW_LABELS.lastRoleChange} {...rowProps}>
        {renderTimestamp()}
      </HaStatusRow>
    </>
  );
}

export const HaStatusEnabledPanel = ({
  status,
  interfaceOptions,
  embedded = false,
  isCompact = false,
  labelColWidth = SIP_SETTINGS_LABEL_WIDTH,
}) => {
  const cells = (
    <HaStatusValueCells
      status={status}
      interfaceOptions={interfaceOptions}
      isCompact={isCompact}
      labelColWidth={labelColWidth}
    />
  );

  if (embedded) {
    return <div style={haStatusFieldGroupStyle}>{cells}</div>;
  }

  return (
    <div
      style={{
        background: C.cardBg,
        border: `1px solid ${C.cardBorder}`,
        borderRadius: CARD_RADIUS,
        boxShadow: HA_STATUS_CARD_SHADOW,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "10px 16px",
          borderBottom: `1px solid ${C.divider}`,
          fontSize: 13,
          fontWeight: 700,
          color: C.labelText,
        }}
      >
        {HA_STATUS_CARD_TITLE}
      </div>
      <div style={{ ...haStatusTableStyle, ...haStatusFieldGroupStyle }}>
        {cells}
      </div>
    </div>
  );
};
