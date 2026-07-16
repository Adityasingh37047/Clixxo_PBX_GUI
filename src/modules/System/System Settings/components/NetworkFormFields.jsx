import React from "react";
import Tooltip from "@mui/material/Tooltip";
import { useMediaQuery } from "@mui/material";
import {
  NETWORK_PAGE_BREADCRUMB_ROOT,
  NETWORK_PAGE_BREADCRUMB_SECTION,
  NETWORK_PAGE_TITLE,
  NETWORK_SECTION_HEADING_LEFT,
  NETWORK_SECTION_DNS,
  NETWORK_SECTION_ARP,
  NETWORK_LABEL_IPV4_TYPE,
  NETWORK_LABEL_IP_ADDRESS,
  NETWORK_LABEL_SUBNET_MASK,
  NETWORK_LABEL_DEFAULT_GATEWAY,
  NETWORK_LABEL_IPV6_ADDRESS,
  NETWORK_LABEL_IPV6_PREFIX,
  NETWORK_LABEL_VLAN_ENABLE,
  NETWORK_LABEL_PREFERRED_DNS,
  NETWORK_LABEL_STANDBY_DNS,
  NETWORK_LABEL_DEFAULT_MODE,
  NETWORK_RADIO_YES,
  NETWORK_RADIO_NO,
  NETWORK_OPTION_STATIC,
  NETWORK_OPTION_DHCP,
  NETWORK_VLAN_LAN1_FIELDS,
  NETWORK_VLAN1_FIELDS,
  NETWORK_VLAN2_FIELDS,
  NETWORK_VLAN3_FIELDS,
  NETWORK_FIELD_TOOLTIPS,
} from "../../../../constants/NetworkConstants";
import {
  C,
  OUTLINED_BORDER,
  OUTLINED_FOCUS,
  OUTLINED_HOVER,
  FOCUS_RING_SHADOW,
} from "../../../../theme/pbxTokens";
import {
  CARD_RADIUS,
  FIELD_RADIUS,
  networkPageWrapStyle,
  networkPageInnerStyle,
  networkCardStyle,
  networkToolbarStyle,
  networkFixedAlertSx,
  networkFormBtnStyle,
} from "./NetworkTableHelpers";
import { ExtensionBreadcrumb } from "../../../../components/common";

export const NETWORK_COMPACT_MQ = "(max-width: 768px)";
export const NETWORK_LAPTOP_NARROW_MQ = "(max-width: 1366px)";
export const NETWORK_SCROLL_CLASS = "network-scroll";
export const NETWORK_LABEL_COL_WIDTH = 200;
export const NETWORK_CONTROL_COL_WIDTH = 220;
const NETWORK_FIELD_COL_GAP = 8;
export const NETWORK_FORM_PAD_X = 28;

export const NETWORK_TOOLTIP_PROPS = {
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

const setFieldDefault = (el) => {
  el.style.borderColor = OUTLINED_BORDER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const setFieldHover = (el) => {
  el.style.borderColor = OUTLINED_HOVER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const setFieldFocus = (el) => {
  el.style.borderColor = OUTLINED_FOCUS;
  el.style.borderWidth = "1px";
  el.style.boxShadow = FOCUS_RING_SHADOW;
};

const nativeFieldInputStyle = {
  height: 32,
  width: NETWORK_CONTROL_COL_WIDTH,
  minWidth: NETWORK_CONTROL_COL_WIDTH,
  maxWidth: NETWORK_CONTROL_COL_WIDTH,
  padding: "0 10px",
  fontSize: 13,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: FIELD_RADIUS,
  outline: "none",
  backgroundColor: "#fff",
  color: C.valueText,
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

export const inputInteraction = {
  onFocus: (e) => {
    if (e.target.disabled) return;
    setFieldFocus(e.target);
  },
  onBlur: (e) => {
    setFieldDefault(e.target);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled) return;
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldHover(e.target);
    }
  },
  onMouseLeave: (e) => {
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldDefault(e.target);
    }
  },
};

const systemFieldInputStyle = {
  ...nativeFieldInputStyle,
};

const systemFieldSelectStyle = {
  ...systemFieldInputStyle,
  appearance: "auto",
  minHeight: 36,
  height: 36,
  paddingTop: 7,
  paddingBottom: 7,
  lineHeight: 1.35,
  cursor: "pointer",
};

export const inputStyle = systemFieldInputStyle;
export const selectStyle = systemFieldSelectStyle;

const networkValueColStyle = {
  flex: "1 1 auto",
  minWidth: NETWORK_CONTROL_COL_WIDTH,
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  justifyContent: "flex-start",
  paddingTop: 2,
};

const networkControlSlotStyle = {
  width: NETWORK_CONTROL_COL_WIDTH,
  minWidth: NETWORK_CONTROL_COL_WIDTH,
  maxWidth: NETWORK_CONTROL_COL_WIDTH,
  flexShrink: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "flex-start",
};

export const networkFieldErrorStyle = {
  fontSize: 11,
  color: C.errorRed,
  marginTop: 4,
  width: "100%",
};

export const NetworkFieldRow = ({
  label,
  tooltipKey,
  children,
  labelColWidth = NETWORK_LABEL_COL_WIDTH,
}) => {
  const tooltip = tooltipKey ? NETWORK_FIELD_TOOLTIPS[tooltipKey] || "" : "";
  const labelNode = (
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: "100%",
        lineHeight: 1.4,
        whiteSpace: "normal",
        overflowWrap: "break-word",
        wordBreak: "break-word",
        cursor: tooltip ? "help" : undefined,
      }}
    >
      {label}
    </label>
  );

  const labelWrapStyle = {
    flex: `0 0 ${labelColWidth}px`,
    width: labelColWidth,
    maxWidth: labelColWidth,
    minWidth: labelColWidth,
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        width: "100%",
        minHeight: 36,
        gap: NETWORK_FIELD_COL_GAP,
      }}
    >
      <div style={labelWrapStyle}>
        {tooltip ? (
          <Tooltip title={tooltip} {...NETWORK_TOOLTIP_PROPS}>
            {labelNode}
          </Tooltip>
        ) : (
          labelNode
        )}
      </div>
      <div style={networkValueColStyle}>
        <div style={networkControlSlotStyle}>{children}</div>
      </div>
    </div>
  );
};

export const advancedFormInlineFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "100%",
  margin: 0,
  padding: "10px 28px",
  borderTop: `1px solid ${C.divider}`,
  background: C.cardBg,
  boxSizing: "border-box",
  flexShrink: 0,
  borderBottomLeftRadius: CARD_RADIUS,
  borderBottomRightRadius: CARD_RADIUS,
};

export const advancedFormBtnStyle = networkFormBtnStyle;

const SETTINGS_SECTION_HEADING_FIRST_MARGIN = "12px 0 24px 0";
const SETTINGS_SECTION_HEADING_NEXT_MARGIN = "28px 0 24px 0";
const SETTINGS_FIELDS_STACK_GAP = 12;
const SETTINGS_COLUMN_GAP = 12;
const SETTINGS_COLUMN_PADDING_DESKTOP = "16px 36px 20px";
const SECTION_HEADING_COLOR = "#30415A";

export const SectionHeading = ({ title, isFirst = false }) => {
  const isLaptopNarrow = useMediaQuery(NETWORK_LAPTOP_NARROW_MQ);
  return (
    <div
      style={{
        margin: isFirst
          ? isLaptopNarrow
            ? "20px 0 24px 0"
            : SETTINGS_SECTION_HEADING_FIRST_MARGIN
          : SETTINGS_SECTION_HEADING_NEXT_MARGIN,
        position: "relative",
        width: "100%",
      }}
    >
      <div style={{ borderTop: `1px solid ${C.divider}` }} />
      <span
        style={{
          position: "absolute",
          top: -10,
          left: isLaptopNarrow ? 0 : NETWORK_SECTION_HEADING_LEFT,
          background: C.cardBg,
          paddingRight: 8,
          fontSize: 14,
          fontWeight: 600,
          color: SECTION_HEADING_COLOR,
        }}
      >
        {title}
      </span>
    </div>
  );
};

export const networkTableContainerStyle = {
  ...networkCardStyle,
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
  boxSizing: "border-box",
};

export const networkHeaderStyle = {
  ...networkToolbarStyle,
  width: "100%",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  boxSizing: "border-box",
};

export const networkDashboardGridStyle = (isCompact) => ({
  display: "grid",
  gridTemplateColumns: isCompact
    ? "1fr"
    : "minmax(0, 1fr) 1px minmax(0, 1fr)",
  width: "100%",
  alignItems: "stretch",
  alignContent: "start",
  minHeight: "100%",
});

export const networkDashboardColumnStyle = (isCompact) => ({
  display: "flex",
  flexDirection: "column",
  gap: SETTINGS_COLUMN_GAP,
  minWidth: 0,
  padding: isCompact
    ? `16px ${NETWORK_FORM_PAD_X}px 20px`
    : SETTINGS_COLUMN_PADDING_DESKTOP,
  background: C.cardBg,
  boxSizing: "border-box",
});

export const networkDashboardDividerCellStyle = {
  display: "flex",
  flexDirection: "column",
  alignSelf: "stretch",
  padding: "14px 0",
  boxSizing: "border-box",
};

export const networkDashboardDividerLineStyle = {
  flex: 1,
  width: 1,
  background: C.divider,
  margin: "0 auto",
};

export const networkDashboardFieldsStackStyle = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  gap: 0,
};

export const networkFieldGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: SETTINGS_FIELDS_STACK_GAP,
  width: "100%",
};

export { networkFixedAlertSx };

export const NetworkScrollbarStyles = () => (
  <style>{`
    .${NETWORK_SCROLL_CLASS} {
      scroll-behavior: smooth;
      scrollbar-gutter: stable;
      scrollbar-width: thin;
      scrollbar-color: rgba(100, 116, 139, 0.45) transparent;
    }
    .${NETWORK_SCROLL_CLASS}::-webkit-scrollbar {
      width: 8px;
      height: 8px;
      transition: width 0.2s ease, height 0.2s ease;
    }
    .${NETWORK_SCROLL_CLASS}::-webkit-scrollbar:hover {
      width: 11px;
      height: 11px;
    }
    .${NETWORK_SCROLL_CLASS}::-webkit-scrollbar-corner {
      background: transparent;
    }
    .${NETWORK_SCROLL_CLASS}::-webkit-scrollbar-track {
      background: transparent;
    }
    .${NETWORK_SCROLL_CLASS}::-webkit-scrollbar-thumb {
      background-color: rgba(100, 116, 139, 0.45);
      border-radius: 6px;
      border: 2px solid transparent;
      background-clip: padding-box;
      transition: background-color 0.2s ease;
    }
    .${NETWORK_SCROLL_CLASS}::-webkit-scrollbar-thumb:hover {
      background-color: rgba(71, 85, 105, 0.65);
    }
  `}</style>
);

export const NetworkPageShell = ({ children, isCompact }) => (
  <div
    className={NETWORK_SCROLL_CLASS}
    style={{
      ...networkPageWrapStyle,
      ...(isCompact ? { padding: 8 } : {}),
    }}
    data-native-scroll
  >
    <div style={networkPageInnerStyle}>{children}</div>
  </div>
);

export const NetworkBreadcrumb = () => (
  <ExtensionBreadcrumb
    root={NETWORK_PAGE_BREADCRUMB_ROOT}
    section={NETWORK_PAGE_BREADCRUMB_SECTION}
    current={NETWORK_PAGE_TITLE}
  />
);

/** Presentational LAN field group for one interface. */
export const LanFields = ({
  lan,
  idx,
  labelColWidth,
  ipErrors,
  subnetErrors,
  gatewayErrors,
  onLanChange,
}) => (
  <>
    <NetworkFieldRow
      label={NETWORK_LABEL_IPV4_TYPE}
      tooltipKey="ipv4NetworkType"
      labelColWidth={labelColWidth}
    >
      <select
        value={lan.ipv4Type || NETWORK_OPTION_STATIC}
        onChange={(e) => onLanChange(idx, "ipv4Type", e.target.value)}
        style={selectStyle}
        {...inputInteraction}
      >
        <option value={NETWORK_OPTION_STATIC}>{NETWORK_OPTION_STATIC}</option>
        <option value={NETWORK_OPTION_DHCP}>{NETWORK_OPTION_DHCP}</option>
      </select>
    </NetworkFieldRow>

    {(lan.ipv4Type || NETWORK_OPTION_STATIC) === NETWORK_OPTION_STATIC && (
      <>
        <NetworkFieldRow
          label={NETWORK_LABEL_IP_ADDRESS}
          tooltipKey="ipAddress"
          labelColWidth={labelColWidth}
        >
          <input
            type="text"
            value={lan.ipAddress || ""}
            onChange={(e) => onLanChange(idx, "ipAddress", e.target.value)}
            style={{
              ...inputStyle,
              borderColor: ipErrors[idx] ? C.errorRed : OUTLINED_BORDER,
            }}
            {...inputInteraction}
          />
          {ipErrors[idx] && (
            <div style={networkFieldErrorStyle}>{ipErrors[idx]}</div>
          )}
        </NetworkFieldRow>

        <NetworkFieldRow
          label={NETWORK_LABEL_SUBNET_MASK}
          tooltipKey="subnetMask"
          labelColWidth={labelColWidth}
        >
          <input
            type="text"
            value={lan.subnetMask || ""}
            onChange={(e) => onLanChange(idx, "subnetMask", e.target.value)}
            style={{
              ...inputStyle,
              borderColor: subnetErrors[idx] ? C.errorRed : OUTLINED_BORDER,
            }}
            {...inputInteraction}
          />
          {subnetErrors[idx] && (
            <div style={networkFieldErrorStyle}>{subnetErrors[idx]}</div>
          )}
        </NetworkFieldRow>

        <NetworkFieldRow
          label={NETWORK_LABEL_DEFAULT_GATEWAY}
          tooltipKey="defaultGateway"
          labelColWidth={labelColWidth}
        >
          <input
            type="text"
            value={lan.defaultGateway || ""}
            onChange={(e) =>
              onLanChange(idx, "defaultGateway", e.target.value)
            }
            style={{
              ...inputStyle,
              borderColor: gatewayErrors[idx] ? C.errorRed : OUTLINED_BORDER,
            }}
            {...inputInteraction}
          />
          {gatewayErrors[idx] && (
            <div style={networkFieldErrorStyle}>{gatewayErrors[idx]}</div>
          )}
        </NetworkFieldRow>

        <NetworkFieldRow
          label={NETWORK_LABEL_IPV6_ADDRESS}
          tooltipKey="ipv6Address"
          labelColWidth={labelColWidth}
        >
          <input
            type="text"
            value={lan.ipv6Address || ""}
            onChange={(e) => onLanChange(idx, "ipv6Address", e.target.value)}
            style={inputStyle}
            {...inputInteraction}
          />
        </NetworkFieldRow>

        <NetworkFieldRow
          label={NETWORK_LABEL_IPV6_PREFIX}
          tooltipKey="ipv6Prefix"
          labelColWidth={labelColWidth}
        >
          <input
            type="text"
            value={lan.ipv6Prefix || ""}
            onChange={(e) => onLanChange(idx, "ipv6Prefix", e.target.value)}
            style={inputStyle}
            {...inputInteraction}
          />
        </NetworkFieldRow>
      </>
    )}
  </>
);

export const VlanInputField = ({
  fieldDef,
  vlanForm,
  labelColWidth,
  onVlanChange,
}) => (
  <NetworkFieldRow
    key={fieldDef.key}
    label={fieldDef.label}
    tooltipKey={fieldDef.key}
    labelColWidth={labelColWidth}
  >
    {fieldDef.type === "select" ? (
      <select
        value={vlanForm[fieldDef.key] || fieldDef.options?.[0]?.value || ""}
        onChange={(e) => onVlanChange(fieldDef.key, e.target.value)}
        style={selectStyle}
        {...inputInteraction}
      >
        {(fieldDef.options || []).map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    ) : (
      <input
        type="text"
        value={vlanForm[fieldDef.key] || ""}
        onChange={(e) => onVlanChange(fieldDef.key, e.target.value)}
        style={inputStyle}
        {...inputInteraction}
      />
    )}
  </NetworkFieldRow>
);

/** Left column: LAN interfaces + VLAN enable/fields. */
export const NetworkLanVlanColumn = ({
  isCompact,
  labelColWidth,
  vlanEnabled,
  lanInterfaces,
  vlanForm,
  ipErrors,
  subnetErrors,
  gatewayErrors,
  onLanChange,
  onVlanChange,
  onEnableVlan,
  onDisableVlan,
}) => (
  <div style={networkDashboardColumnStyle(isCompact)}>
    <div style={networkDashboardFieldsStackStyle}>
      {!vlanEnabled &&
        lanInterfaces.map((lan, idx) => (
          <div key={lan.name || idx}>
            <SectionHeading
              title={lan.name || `LAN ${idx + 1}`}
              isFirst={idx === 0}
            />
            <div style={networkFieldGroupStyle}>
              <LanFields
                lan={lan}
                idx={idx}
                labelColWidth={labelColWidth}
                ipErrors={ipErrors}
                subnetErrors={subnetErrors}
                gatewayErrors={gatewayErrors}
                onLanChange={onLanChange}
              />
            </div>
          </div>
        ))}

      <div
        style={{
          ...networkFieldGroupStyle,
          marginTop: !vlanEnabled && lanInterfaces.length > 0 ? 28 : 12,
        }}
      >
        <NetworkFieldRow
          label={NETWORK_LABEL_VLAN_ENABLE}
          tooltipKey="vlanEnable"
          labelColWidth={labelColWidth}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              minHeight: 32,
              gap: 16,
              width: "100%",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="vlanEnable"
                checked={vlanEnabled}
                onChange={onEnableVlan}
                style={{ accentColor: OUTLINED_FOCUS }}
              />
              <span style={{ fontSize: 13, color: C.labelText }}>
                {NETWORK_RADIO_YES}
              </span>
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="vlanEnable"
                checked={!vlanEnabled}
                onChange={onDisableVlan}
                style={{ accentColor: OUTLINED_FOCUS }}
              />
              <span style={{ fontSize: 13, color: C.labelText }}>
                {NETWORK_RADIO_NO}
              </span>
            </label>
          </div>
        </NetworkFieldRow>

        {vlanEnabled &&
          NETWORK_VLAN_LAN1_FIELDS.map((f) => (
            <VlanInputField
              key={f.key}
              fieldDef={f}
              vlanForm={vlanForm}
              labelColWidth={labelColWidth}
              onVlanChange={onVlanChange}
            />
          ))}
        {vlanEnabled &&
          NETWORK_VLAN1_FIELDS.map((f) => (
            <VlanInputField
              key={f.key}
              fieldDef={f}
              vlanForm={vlanForm}
              labelColWidth={labelColWidth}
              onVlanChange={onVlanChange}
            />
          ))}
        {vlanEnabled &&
          NETWORK_VLAN2_FIELDS.map((f) => (
            <VlanInputField
              key={f.key}
              fieldDef={f}
              vlanForm={vlanForm}
              labelColWidth={labelColWidth}
              onVlanChange={onVlanChange}
            />
          ))}
        {vlanEnabled &&
          NETWORK_VLAN3_FIELDS.map((f) => (
            <VlanInputField
              key={f.key}
              fieldDef={f}
              vlanForm={vlanForm}
              labelColWidth={labelColWidth}
              onVlanChange={onVlanChange}
            />
          ))}
      </div>
    </div>
  </div>
);

/** Right column: DNS + ARP. */
export const NetworkDnsArpColumn = ({
  isCompact,
  labelColWidth,
  dnsServers,
  dnsErrors,
  arpMode,
  arpError,
  onDnsChange,
  onArpChange,
}) => (
  <div style={networkDashboardColumnStyle(isCompact)}>
    <div style={networkDashboardFieldsStackStyle}>
      <SectionHeading title={NETWORK_SECTION_DNS} isFirst />
      <div style={networkFieldGroupStyle}>
        <NetworkFieldRow
          label={NETWORK_LABEL_PREFERRED_DNS}
          tooltipKey="preferredDnsServer"
          labelColWidth={labelColWidth}
        >
          <input
            type="text"
            value={dnsServers[0] || ""}
            onChange={(e) => onDnsChange(0, e.target.value)}
            style={{
              ...inputStyle,
              borderColor: dnsErrors[0] ? C.errorRed : OUTLINED_BORDER,
            }}
            {...inputInteraction}
          />
          {dnsErrors[0] && (
            <div style={networkFieldErrorStyle}>{dnsErrors[0]}</div>
          )}
        </NetworkFieldRow>

        <NetworkFieldRow
          label={NETWORK_LABEL_STANDBY_DNS}
          tooltipKey="standbyDnsServer"
          labelColWidth={labelColWidth}
        >
          <input
            type="text"
            value={dnsServers[1] || ""}
            onChange={(e) => onDnsChange(1, e.target.value)}
            style={{
              ...inputStyle,
              borderColor: dnsErrors[1] ? C.errorRed : OUTLINED_BORDER,
            }}
            {...inputInteraction}
          />
          {dnsErrors[1] && (
            <div style={networkFieldErrorStyle}>{dnsErrors[1]}</div>
          )}
        </NetworkFieldRow>
      </div>

      <SectionHeading title={NETWORK_SECTION_ARP} />
      <div style={networkFieldGroupStyle}>
        <NetworkFieldRow
          label={NETWORK_LABEL_DEFAULT_MODE}
          tooltipKey="defaultMode"
          labelColWidth={labelColWidth}
        >
          <select
            value={arpMode}
            onChange={onArpChange}
            style={{
              ...selectStyle,
              borderColor: arpError ? C.errorRed : OUTLINED_BORDER,
            }}
            {...inputInteraction}
          >
            <option value="1">1</option>
            <option value="2">2</option>
          </select>
          {arpError && (
            <div style={networkFieldErrorStyle}>{arpError}</div>
          )}
        </NetworkFieldRow>
      </div>
    </div>
  </div>
);
