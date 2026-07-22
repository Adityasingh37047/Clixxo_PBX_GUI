import React from "react";
import {
  PORT_GROUP_PAGE_BREADCRUMB_SECTION, PORT_GROUP_PAGE_BREADCRUMB_TITLE, PORT_GROUP_FIELD_TOOLTIPS, PORT_GROUP_INDEX_OPTIONS, PORT_GROUP_REGISTER_OPTIONS, PORT_GROUP_AUTHENTICATION_MODE_OPTIONS, PORT_GROUP_SELECT_MODE_OPTIONS, PORT_GROUP_MULTI_GROUP_OPTIONS } from "../../../../constants/PortGroupPageConstants";
import { Checkbox, Tooltip } from "@mui/material";

import { OUTLINED_BORDER, OUTLINED_FOCUS, OUTLINED_HOVER, C, FOCUS_RING_SHADOW } from "../../../../theme/pbxTokens";
import { Btn, TH, ExtensionBreadcrumb as FxsBreadcrumb, extensionCardStyle as fxsCardStyle, extensionToolbarStyle as fxsToolbarStyle, addNewModalFooterBtnStyle as fxsToolbarBtnStyle, addNewModalFooterStyle as fxsAddNewModalFooterStyle, addNewModalFooterBtnStyle as fxsAddNewModalFooterBtnStyle, addNewModalFooterCancelBtnStyle as fxsAddNewModalFooterCancelBtnStyle, extensionPageWrapStyle as fxsPageWrapStyle, extensionPageInnerStyle as fxsPageInnerStyle, extensionPaginationStyle as fxsPaginationStyle, extensionCancelBtnStyle as fxsToolbarCancelBtnStyle, extensionPrimaryBtnStyle as fxsToolbarPrimaryBtnStyle,
  extensionTableCheckboxSx as portGroupCheckboxSx,
} from "../../../../components/common";

export { portGroupCheckboxSx };

export const fxsModalBackdropSlotProps = {
  backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.5)" } },
};

export const fxsModalDialogContentSx = {
  maxHeight: "calc(100vh - 220px)",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
};

export const fxsDialogSx = {
  "& .MuiDialog-container": {
    alignItems: "center",
    justifyContent: "center",
  },
};

const FXS_DIALOG_MARGIN = 24;
const FXS_DIALOG_LAYOUT_OFFSET = 80;

export const createFxsDialogPaperSx = (width = 500) => ({
  margin: FXS_DIALOG_MARGIN,
  maxHeight: `calc(100vh - ${FXS_DIALOG_LAYOUT_OFFSET}px - ${FXS_DIALOG_MARGIN * 2}px)`,
  display: "flex",
  flexDirection: "column",
  width,
  maxWidth: "95vw",
  p: 0,
  borderRadius: "4px",
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
});


const FIELD_LABEL_COLOR = "#3E5475";

export const FIELD_TOOLTIP_PROPS = {
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

export const PortGroupFieldLabel = ({ tooltipKey, tooltips, children, style = {} }) => {
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
    <Tooltip title={formatFieldTooltipTitle(tooltip)} {...FIELD_TOOLTIP_PROPS}>
      {labelNode}
    </Tooltip>
  );
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

export const portGroupNativeFieldInteraction = {
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

const nativeFieldInputStyle = {
  height: 32,
  width: 200,
  padding: "0 10px",
  fontSize: 13,
  lineHeight: 1.35,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 4,
  outline: "none",
  backgroundColor: "#fff",
  color: C.valueText,
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const nativeFieldSelectStyle = {
  width: nativeFieldInputStyle.width,
  height: 32,
  minHeight: 32,
  padding: "0 28px 0 10px",
  fontSize: nativeFieldInputStyle.fontSize,
  lineHeight: 1.35,
  border: nativeFieldInputStyle.border,
  borderRadius: nativeFieldInputStyle.borderRadius,
  outline: nativeFieldInputStyle.outline,
  backgroundColor: nativeFieldInputStyle.backgroundColor,
  color: nativeFieldInputStyle.color,
  boxSizing: nativeFieldInputStyle.boxSizing,
  transition: nativeFieldInputStyle.transition,
  appearance: "auto",
};

export const portGroupInputStyle = {
  ...nativeFieldInputStyle,
  width: "100%",
};

export const portGroupSelectStyle = {
  ...nativeFieldSelectStyle,
  width: "100%",
};



export const portGroupPageWrapStyle = fxsPageWrapStyle;
export const portGroupPageInnerStyle = fxsPageInnerStyle;
export const portGroupCardStyle = fxsCardStyle;
export const portGroupHeaderStyle = fxsToolbarStyle;
export { fxsToolbarBtnStyle, fxsToolbarCancelBtnStyle, fxsToolbarPrimaryBtnStyle };

export const portGroupTableBodyStyle = {
  overflowX: "auto",
  overflowY: "auto",
  width: "100%",
  boxSizing: "border-box",
};

export const portGroupPaginationStyle = fxsPaginationStyle;
export const addNewModalFooterStyle = fxsAddNewModalFooterStyle;
export const addNewModalFooterBtnStyle = fxsAddNewModalFooterBtnStyle;
export const addNewModalFooterCancelBtnStyle = fxsAddNewModalFooterCancelBtnStyle;
export const addNewModalBackdropSlotProps = fxsModalBackdropSlotProps;
export const addNewModalDialogContentSx = fxsModalDialogContentSx;

export const PORT_GROUP_ADD_NEW_DIALOG_SX = fxsDialogSx;
export const PORT_GROUP_ADD_NEW_DIALOG_PAPER_SX = createFxsDialogPaperSx(720);

export const PortGroupBreadcrumb = () => (
  <FxsBreadcrumb
    section={PORT_GROUP_PAGE_BREADCRUMB_SECTION}
    current={PORT_GROUP_PAGE_BREADCRUMB_TITLE}
  />
);

export const PortGroupFieldRow = ({ label, tooltipKey, children }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    }}
  >
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: 170,
        flexShrink: 0,
        textAlign: "left",
      }}
    >
      <PortGroupFieldLabel tooltipKey={tooltipKey} tooltips={PORT_GROUP_FIELD_TOOLTIPS}>
        {label}
      </PortGroupFieldLabel>
    </label>
    <div style={{ width: "min(100%, 320px)" }}>{children}</div>
  </div>
);

export const PortGroupFormFields = ({ form, handleFormChange }) => (
  <>
    <PortGroupFieldRow label="ID:" tooltipKey="index">
      <select
        value={form.index}
        onChange={(e) => handleFormChange("index", e.target.value)}
        style={portGroupSelectStyle}
        {...portGroupNativeFieldInteraction}
      >
        {PORT_GROUP_INDEX_OPTIONS.map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </select>
    </PortGroupFieldRow>

    <PortGroupFieldRow label="Description:" tooltipKey="description">
      <input
        type="text"
        value={form.description}
        onChange={(e) => handleFormChange("description", e.target.value)}
        style={portGroupInputStyle}
        {...portGroupNativeFieldInteraction}
        maxLength={23}
      />
    </PortGroupFieldRow>

    <PortGroupFieldRow label="Register Port Group:" tooltipKey="registerPortGroup">
      <select
        value={form.registerPortGroup}
        onChange={(e) => handleFormChange("registerPortGroup", e.target.value)}
        style={portGroupSelectStyle}
        {...portGroupNativeFieldInteraction}
      >
        {PORT_GROUP_REGISTER_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </PortGroupFieldRow>

    {form.registerPortGroup === "1" && (
      <>
        <PortGroupFieldRow label="SIP Account:" tooltipKey="sipAccount">
          <input
            type="text"
            value={form.sipAccount}
            onChange={(e) => handleFormChange("sipAccount", e.target.value)}
            style={portGroupInputStyle}
            {...portGroupNativeFieldInteraction}
          />
        </PortGroupFieldRow>
        <PortGroupFieldRow label="Display Name:" tooltipKey="displayName">
          <input
            type="text"
            value={form.displayName}
            onChange={(e) => handleFormChange("displayName", e.target.value)}
            style={portGroupInputStyle}
            {...portGroupNativeFieldInteraction}
          />
        </PortGroupFieldRow>
        <PortGroupFieldRow label="Password:" tooltipKey="password">
          <input
            type="password"
            value={form.password}
            onChange={(e) => handleFormChange("password", e.target.value)}
            style={portGroupInputStyle}
            {...portGroupNativeFieldInteraction}
          />
        </PortGroupFieldRow>
      </>
    )}

    <PortGroupFieldRow label="Authentication Mode:" tooltipKey="registerSelectMode">
      <select
        value={form.registerSelectMode}
        onChange={(e) => handleFormChange("registerSelectMode", e.target.value)}
        style={portGroupSelectStyle}
        {...portGroupNativeFieldInteraction}
      >
        {PORT_GROUP_AUTHENTICATION_MODE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </PortGroupFieldRow>

    <PortGroupFieldRow label="Port Select Mode:" tooltipKey="portSelectMode">
      <select
        value={form.portSelectMode}
        onChange={(e) => handleFormChange("portSelectMode", e.target.value)}
        style={portGroupSelectStyle}
        {...portGroupNativeFieldInteraction}
      >
        {PORT_GROUP_SELECT_MODE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </PortGroupFieldRow>

    {form.portSelectMode === "5" && (
      <>
        <PortGroupFieldRow label="Rule for Ringing by Turns:" tooltipKey="enumRule">
          <input
            type="text"
            value={form.enumRule}
            onChange={(e) => handleFormChange("enumRule", e.target.value)}
            style={portGroupInputStyle}
            {...portGroupNativeFieldInteraction}
          />
        </PortGroupFieldRow>
        <PortGroupFieldRow label="Timeout for Ringing by Turns (s):" tooltipKey="ringExpire">
          <input
            type="text"
            value={form.ringExpire}
            onChange={(e) => handleFormChange("ringExpire", e.target.value)}
            style={portGroupInputStyle}
            {...portGroupNativeFieldInteraction}
          />
        </PortGroupFieldRow>
      </>
    )}

    {form.portSelectMode !== "4" && form.portSelectMode !== "5" && (
      <PortGroupFieldRow label="Preemptive Answer Keyboard Shortcut:" tooltipKey="robKey">
        <input
          type="text"
          value={form.robKey}
          onChange={(e) => handleFormChange("robKey", e.target.value)}
          style={portGroupInputStyle}
          {...portGroupNativeFieldInteraction}
        />
      </PortGroupFieldRow>
    )}

    <PortGroupFieldRow label="Port Reused by Multiple Groups:" tooltipKey="enablePortMultiGroup">
      <select
        value={form.enablePortMultiGroup}
        onChange={(e) => handleFormChange("enablePortMultiGroup", e.target.value)}
        style={portGroupSelectStyle}
        {...portGroupNativeFieldInteraction}
      >
        {PORT_GROUP_MULTI_GROUP_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </PortGroupFieldRow>
  </>
);

export const PortGroupPortsSection = ({
  form,
  handlePortToggle,
  handleCheckAllPorts,
  handleInversePorts,
}) => (
  <div
    style={{
      background: "#f8fafc",
      border: `1px solid ${C.cardBorder}`,
      borderRadius: 4,
      padding: 16,
    }}
  >
    <div
      style={{
        fontSize: 13,
        fontWeight: 700,
        color: C.labelText,
        marginBottom: 14,
        paddingBottom: 10,
        borderBottom: `1px solid ${C.divider}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <PortGroupFieldLabel
        tooltipKey="ports"
        tooltips={PORT_GROUP_FIELD_TOOLTIPS}
        style={{ fontSize: 13, fontWeight: 700 }}
      >
        Assign Ports
      </PortGroupFieldLabel>
      <div style={{ display: "flex", gap: 8 }}>
        <Btn
          onClick={handleCheckAllPorts}
          variant="cancel"
          style={fxsToolbarCancelBtnStyle}
        >
          Check All
        </Btn>
        <Btn
          onClick={handleInversePorts}
          variant="cancel"
          style={fxsToolbarCancelBtnStyle}
        >
          Inverse
        </Btn>
      </div>
    </div>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
        gap: 12,
      }}
    >
      {form.ports.map((val, idx) => (
        <label
          key={idx}
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 12,
            color: C.valueText,
            cursor: "pointer",
          }}
        >
          <Checkbox
            size="small"
            checked={val}
            onChange={() => handlePortToggle(idx)}
            sx={portGroupCheckboxSx}
          />
          Port {idx + 1}(FXS)
        </label>
      ))}
    </div>
  </div>
);
