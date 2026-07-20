import React from "react";
import Tooltip from "@mui/material/Tooltip";
import { useMediaQuery } from "@mui/material";
import {
  ROUTING_INTERFACE_PAGE_BREADCRUMB_ROOT,
  ROUTING_INTERFACE_PAGE_BREADCRUMB_SECTION,
  ROUTING_INTERFACE_PAGE_TITLE,
  ROUTING_INTERFACE_SECTION_CURRENT_ACTIVE,
  ROUTING_INTERFACE_SECTION_ACTIVE_ROUTES,
  ROUTING_INTERFACE_SECTION_TARGET_CONFIG,
  ROUTING_INTERFACE_TABLE_COL_INTERFACE,
  ROUTING_INTERFACE_TABLE_COL_GATEWAY,
  ROUTING_INTERFACE_TABLE_COL_METRIC,
  ROUTING_INTERFACE_TABLE_COL_STATUS,
  ROUTING_INTERFACE_STATUS_ACTIVE,
  ROUTING_INTERFACE_STATUS_STANDBY,
  ROUTING_INTERFACE_PLACEHOLDER_GATEWAY,
  ROUTING_INTERFACE_PLACEHOLDER_METRIC,
  ROUTING_INTERFACE_LABEL_SELECT_INTERFACE,
  ROUTING_INTERFACE_LABEL_IP_ADDRESS,
  ROUTING_INTERFACE_LABEL_SUBNET_MASK,
  ROUTING_INTERFACE_LABEL_GATEWAY_REQUIRED,
  ROUTING_INTERFACE_LABEL_METRIC,
  ROUTING_INTERFACE_FIELD_TOOLTIPS,
  ROUTING_INTERFACE_CURRENT_FIELDS,
} from "../../../../constants/RoutingInterfaceConstants";
import {
  C,
  OUTLINED_BORDER,
  OUTLINED_HOVER,
  OUTLINED_FOCUS,
  FOCUS_RING_SHADOW,
} from "../../../../theme/pbxTokens";
import {
  CARD_RADIUS,
  FIELD_RADIUS,
  routingPageWrapStyle,
  routingPageInnerStyle,
  routingCardStyle,
  routingToolbarStyle,
  routingFixedAlertSx,
  routingFormBtnStyle,
  getRoutesTdStyle,
  getRoutesRowBg,
} from "./RoutingInterfaceTableHelpers";
import { ExtensionBreadcrumb as RoutingPageBreadcrumb } from "../../../../components/common";

export const ROUTING_LAPTOP_NARROW_MQ = "(max-width: 1366px)";

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
  width: 200,
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

const { height: _nativeHeight, ...nativeFieldBase } = nativeFieldInputStyle;

const systemFieldInputStyle = {
  ...nativeFieldBase,
  width: "100%",
  padding: "6px 10px",
  borderRadius: FIELD_RADIUS,
  background: "#fff",
  lineHeight: 1.4,
  minHeight: 34,
};

const systemFieldInputStyleNarrow = {
  ...systemFieldInputStyle,
  maxWidth: "280px",
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

export const inputStyle = systemFieldInputStyleNarrow;
export const selectStyle = systemFieldSelectStyle;

/** Read-only / disabled — same as Network page */
export const disabledInputStyle = {
  ...inputStyle,
  background: "#f1f5f9",
  color: "#94a3b8",
  cursor: "not-allowed",
  borderColor: "#e2e8f0",
};

/** Select — same box as Network page */
export const nativeSelectStyle = selectStyle;

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

export const advancedFormBtnStyle = routingFormBtnStyle;

export const routingHeaderBtnStyle = {
  height: 30,
  minWidth: 110,
  fontSize: 12,
  padding: "0 16px",
  lineHeight: "30px",
  borderRadius: 4,
  boxSizing: "border-box",
};

export const routingTableContainerStyle = {
  ...routingCardStyle,
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
  boxSizing: "border-box",
};

export { routingToolbarStyle, routingFixedAlertSx };

export const routingFieldGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
  width: "100%",
};

const ROUTES_TABLE_RADIUS = CARD_RADIUS;

export const routesTableShellStyle = {
  border: `1px solid ${C.cardBorder}`,
  borderRadius: ROUTES_TABLE_RADIUS,
  overflow: "hidden",
  background: C.cardBg,
};

export const tooltipProps = {
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

export const RoutingPageShell = ({ children }) => (
  <div style={routingPageWrapStyle} data-native-scroll>
    <div style={routingPageInnerStyle}>{children}</div>
  </div>
);

export const RoutingBreadcrumb = () => (
  <RoutingPageBreadcrumb
    root={ROUTING_INTERFACE_PAGE_BREADCRUMB_ROOT}
    section={ROUTING_INTERFACE_PAGE_BREADCRUMB_SECTION}
    current={ROUTING_INTERFACE_PAGE_TITLE}
  />
);

export const SectionHeading = ({ title, isFirst = false }) => {
  const isLaptopNarrow = useMediaQuery(ROUTING_LAPTOP_NARROW_MQ);
  return (
    <div
      style={{
        margin: isFirst
          ? isLaptopNarrow
            ? "16px 0 24px 0"
            : "0 0 24px 0"
          : "16px 0 24px 0",
        position: "relative",
      }}
    >
      <div style={{ borderTop: `1px solid ${C.divider}` }} />
      <span
        style={{
          position: "absolute",
          top: -10,
          left: 0,
          background: C.cardBg,
          paddingRight: 8,
          fontSize: 13,
          fontWeight: 500,
          color: C.labelText,
          letterSpacing: "0.01em",
        }}
      >
        {title}
      </span>
    </div>
  );
};

export const FieldRow = ({ label, tooltip, children }) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-center w-full gap-2 sm:gap-4">
    <Tooltip title={tooltip || ""} disableHoverListener={!tooltip} {...tooltipProps}>
      <label
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: C.labelText,
          width: "100%",
          maxWidth: 220,
          flexShrink: 0,
          cursor: tooltip ? "help" : "default",
        }}
      >
        {label}
      </label>
    </Tooltip>
    <div className="flex-1 w-full max-w-[280px]">{children}</div>
  </div>
);

const TH = ({ children, isLast = false }) => (
  <th
    style={{
      background: "#F8FAFC",
      color: C.labelText,
      fontWeight: 700,
      fontSize: 11,
      padding: "9px 14px",
      textAlign: "center",
      borderBottom: `1px solid ${C.divider}`,
      borderRight: isLast ? "none" : `1px solid ${C.divider}`,
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.14em",
    }}
  >
    {children}
  </th>
);

const TD = ({
  children,
  highlight,
  isLastCol = false,
  isLastRow = false,
  rowBg,
}) => (
  <td
    style={getRoutesTdStyle(
      rowBg,
      isLastRow ? { borderBottom: "none" } : {},
      {
        borderRight: isLastCol ? "none" : `1px solid ${C.divider}`,
        color: highlight ? C.accent : C.valueText,
        fontWeight: highlight ? 700 : 400,
      },
    )}
  >
    {children}
  </td>
);

export const RoutingCurrentPanel = ({ current }) => (
  <div className="flex flex-col gap-0">
    <SectionHeading title={ROUTING_INTERFACE_SECTION_CURRENT_ACTIVE} isFirst />
    <div
      className="flex flex-col gap-3 w-full"
      style={{ ...routingFieldGroupStyle, maxWidth: 640, margin: "0 auto" }}
    >
      {ROUTING_INTERFACE_CURRENT_FIELDS.map((field) => (
        <FieldRow
          key={field.key}
          label={field.label}
          tooltip={ROUTING_INTERFACE_FIELD_TOOLTIPS[field.tooltipKey]}
        >
          <input
            type="text"
            readOnly
            value={
              field.key === "metric"
                ? String(current[field.key])
                : current[field.key]
            }
            style={disabledInputStyle}
          />
        </FieldRow>
      ))}
    </div>
  </div>
);

export const RoutingActiveRoutesTable = ({ activeRoutes, currentInterface }) => {
  if (!activeRoutes?.length) return null;

  return (
    <div className="flex flex-col gap-0">
      <SectionHeading title={ROUTING_INTERFACE_SECTION_ACTIVE_ROUTES} />
      <div style={{ overflowX: "auto" }}>
        <div style={routesTableShellStyle}>
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: 0,
              tableLayout: "auto",
              fontSize: 13,
            }}
          >
            <thead>
              <tr>
                <TH>{ROUTING_INTERFACE_TABLE_COL_INTERFACE}</TH>
                <TH>{ROUTING_INTERFACE_TABLE_COL_GATEWAY}</TH>
                <TH>{ROUTING_INTERFACE_TABLE_COL_METRIC}</TH>
                <TH isLast>{ROUTING_INTERFACE_TABLE_COL_STATUS}</TH>
              </tr>
            </thead>
            <tbody>
              {activeRoutes.map((route, idx) => {
                const isActive = route.interface === currentInterface;
                const isLastRow = idx === activeRoutes.length - 1;
                const rowBg = getRoutesRowBg(isActive, idx);
                return (
                  <tr
                    key={idx}
                    style={{
                      background: rowBg,
                      transition: "background 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = rowBg;
                    }}
                  >
                    <TD
                      highlight={isActive}
                      isLastRow={isLastRow}
                      rowBg={rowBg}
                    >
                      {route.interface}
                    </TD>
                    <TD isLastRow={isLastRow} rowBg={rowBg}>
                      {route.gateway}
                    </TD>
                    <TD isLastRow={isLastRow} rowBg={rowBg}>
                      {route.metric}
                    </TD>
                    <TD isLastCol isLastRow={isLastRow} rowBg={rowBg}>
                      {isActive ? (
                        <span
                          style={{
                            display: "inline-block",
                            padding: "2px 8px",
                            borderRadius: 6,
                            background: "#dcfce7",
                            color: "#16a34a",
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          {ROUTING_INTERFACE_STATUS_ACTIVE}
                        </span>
                      ) : (
                        <span
                          style={{
                            display: "inline-block",
                            padding: "2px 8px",
                            borderRadius: 6,
                            background: "#f1f5f9",
                            color: "#94a3b8",
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          {ROUTING_INTERFACE_STATUS_STANDBY}
                        </span>
                      )}
                    </TD>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const RoutingSwitchForm = ({
  form,
  formIp,
  formSubnet,
  interfaces,
  errors,
  onIfaceChange,
  onFormChange,
  onSubmit,
}) => (
  <form
    id="routing-switch-form"
    onSubmit={onSubmit}
    className="flex flex-col gap-2"
  >
    <SectionHeading title={ROUTING_INTERFACE_SECTION_TARGET_CONFIG} />
    <div
      className="flex flex-col gap-3 w-full"
      style={{
        ...routingFieldGroupStyle,
        maxWidth: 640,
        margin: "0 auto 12px",
      }}
    >
      <FieldRow
        label={ROUTING_INTERFACE_LABEL_SELECT_INTERFACE}
        tooltip={ROUTING_INTERFACE_FIELD_TOOLTIPS.selectInterface}
      >
        <select
          value={form.interface}
          onChange={(e) => onIfaceChange(e.target.value)}
          style={nativeSelectStyle}
          onFocus={inputInteraction.onFocus}
          onBlur={inputInteraction.onBlur}
          onMouseEnter={inputInteraction.onMouseEnter}
          onMouseLeave={inputInteraction.onMouseLeave}
        >
          {interfaces.map((i) => (
            <option key={i.interface} value={i.interface}>
              {i.interface}
            </option>
          ))}
        </select>
      </FieldRow>

      <FieldRow
        label={ROUTING_INTERFACE_LABEL_IP_ADDRESS}
        tooltip={ROUTING_INTERFACE_FIELD_TOOLTIPS.formIpAddress}
      >
        <input type="text" readOnly value={formIp} style={disabledInputStyle} />
      </FieldRow>

      <FieldRow
        label={ROUTING_INTERFACE_LABEL_SUBNET_MASK}
        tooltip={ROUTING_INTERFACE_FIELD_TOOLTIPS.formSubnetMask}
      >
        <input
          type="text"
          readOnly
          value={formSubnet}
          style={disabledInputStyle}
        />
      </FieldRow>

      <FieldRow
        label={ROUTING_INTERFACE_LABEL_GATEWAY_REQUIRED}
        tooltip={ROUTING_INTERFACE_FIELD_TOOLTIPS.formGateway}
      >
        <input
          type="text"
          value={form.gateway}
          onChange={(e) => onFormChange("gateway", e.target.value)}
          placeholder={ROUTING_INTERFACE_PLACEHOLDER_GATEWAY}
          style={{
            ...inputStyle,
            borderColor: errors.gateway ? C.errorRed : C.cardBorder,
          }}
          onFocus={inputInteraction.onFocus}
          onBlur={inputInteraction.onBlur}
          onMouseEnter={inputInteraction.onMouseEnter}
          onMouseLeave={inputInteraction.onMouseLeave}
        />
        {errors.gateway && (
          <div style={{ color: C.errorRed, fontSize: 11, marginTop: 4 }}>
            {errors.gateway}
          </div>
        )}
      </FieldRow>

      <FieldRow
        label={ROUTING_INTERFACE_LABEL_METRIC}
        tooltip={ROUTING_INTERFACE_FIELD_TOOLTIPS.formMetric}
      >
        <input
          type="text"
          value={form.metric}
          onChange={(e) => onFormChange("metric", e.target.value)}
          placeholder={ROUTING_INTERFACE_PLACEHOLDER_METRIC}
          style={{
            ...inputStyle,
            borderColor: errors.metric ? C.errorRed : C.cardBorder,
          }}
          onFocus={inputInteraction.onFocus}
          onBlur={inputInteraction.onBlur}
          onMouseEnter={inputInteraction.onMouseEnter}
          onMouseLeave={inputInteraction.onMouseLeave}
        />
        {errors.metric && (
          <div style={{ color: C.errorRed, fontSize: 11, marginTop: 4 }}>
            {errors.metric}
          </div>
        )}
      </FieldRow>
    </div>
  </form>
);
