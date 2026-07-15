import React, { useState } from "react";
import { Alert, Checkbox, Tooltip, useMediaQuery } from "@mui/material";
import {
  SIP_COMPATIBILITY_FIELDS,
  SIP_COMPATIBILITY_FIELD_TOOLTIPS,
  FXS_SIP_COMPATIBILITY_BREADCRUMB_ROOT,
  FXS_SIP_COMPATIBILITY_BREADCRUMB_SECTION,
  FXS_SIP_COMPATIBILITY_PAGE_TITLE,
  FXS_SIP_COMPATIBILITY_CARD_TITLE,
  FXS_SIP_COMPATIBILITY_LEFT_SECTION_TITLE,
  FXS_SIP_COMPATIBILITY_RIGHT_SECTION_TITLE,
  FXS_SIP_COMPATIBILITY_SAVE_LABEL,
  FXS_SIP_COMPATIBILITY_RESET_LABEL,
  FXS_SIP_COMPATIBILITY_SECTION_HEADING_LEFT,
  FXS_SIP_COMPATIBILITY_SECTION_HEADING_COLOR,
} from "../../../constants/SipCompatibilityConstants";

// ── Page-local field label tooltip UI (not shared) ──
const FIELD_LABEL_COLOR = "#3E5475";

const FIELD_TOOLTIP_PROPS = {
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

const formatFieldTooltipTitle = (text) => {
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

const CompatibilityFieldRow = ({ label, tooltipKey, children, nested = false }) => {
  const tooltip = tooltipKey
    ? SIP_COMPATIBILITY_FIELD_TOOLTIPS[tooltipKey] || ""
    : "";
  const isLongLabel = label.length > 48;
  const labelNode = (
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: nested ? "#6b7280" : FIELD_LABEL_COLOR,
        flex: "1 1 auto",
        minWidth: 0,
        paddingRight: 16,
        textAlign: "left",
        lineHeight: 1.45,
        cursor: tooltip ? "help" : undefined,
        whiteSpace: "normal",
        overflowWrap: "break-word",
        wordBreak: "break-word",
      }}
    >
      {label}
    </label>
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
        minHeight: 36,
        alignItems: isLongLabel ? "flex-start" : "center",
        paddingTop: isLongLabel ? 6 : 0,
        paddingBottom: isLongLabel ? 6 : 0,
      }}
    >
      {tooltip ? (
        <Tooltip
          title={formatFieldTooltipTitle(tooltip)}
          {...FIELD_TOOLTIP_PROPS}
        >
          {labelNode}
        </Tooltip>
      ) : (
        labelNode
      )}
      {children}
    </div>
  );
};

// ── Local page UI (matches SIP Settings / Media Parameters) ──
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  cardShadow:
    "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
  divider: "#e2e6ec",
  labelText: "#3E5475",
  valueText: "#1f2937",
  mutedText: "#6b7280",
  strongText: "#1f2937",
  accent: "#3E5475",
  amber: "#dc2626",
  fieldBg: "#ffffff",
  fieldReadonlyBg: "#f1f5f9",
};

const CARD_RADIUS = 4;
const FIELD_RADIUS = 8;

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
  form,
  component,
  title,
}) => {
  const styles = {
    default: {
      background: C.cardBg,
      color: C.valueText,
      border: "1px solid #9ca3af",
    },
    primary: {
      background:
        "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
      color: "#fff",
      border: "1px solid #5A6F8F",
      fontWeight: 600,
    },
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15,23,42,0.08)",
    },
    danger: {
      background: "#fef2f2",
      color: C.amber,
      border: "0.5px solid #fecaca",
    },
    outline: {
      background: C.cardBg,
      color: C.labelText,
      border: `1px solid ${C.cardBorder}`,
    },
  };
  const s = styles[variant] || styles.default;
  const hoverBg =
    {
      primary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      cancel: "#b6c2d3",
      danger: "#fca5a5",
      outline: "#e2e8f0",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const baseBg = extraStyle?.background ?? s.background;
  const baseShadow = extraStyle?.boxShadow ?? s.boxShadow ?? "none";
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      cancel: "#a3b1c2",
      danger: "#f87171",
      outline: "#d1d9e6",
      default: "#d1d5db",
    }[variant] || "#d1d5db";

  const clearPressStyle = (el) => {
    el.style.transform = "";
    el.style.boxShadow = baseShadow;
  };

  const applyPressStyle = (el) => {
    el.style.background = activeBg;
    el.style.transform = "translateY(1px) scale(0.98)";
    el.style.boxShadow =
      variant === "primary"
        ? "inset 0 2px 4px rgba(0, 0, 0, 0.25)"
        : variant === "cancel"
          ? "inset 0 2px 4px rgba(15, 23, 42, 0.15)"
          : "inset 0 1px 3px rgba(15, 23, 42, 0.12)";
  };

  const Component = component || "button";
  return (
    <Component
      type={type}
      form={form}
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding:
          variant === "primary" || variant === "cancel"
            ? "8px 32px"
            : "6px 14px",
        borderRadius: 8,
        fontSize: variant === "primary" || variant === "cancel" ? 14 : 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition:
          "background 0.15s ease, transform 0.1s ease, box-shadow 0.1s ease",
        height: variant === "primary" || variant === "cancel" ? 38 : 30,
        gap: 6,
        whiteSpace: "nowrap",
        userSelect: "none",
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = baseBg;
        clearPressStyle(e.currentTarget);
      }}
      onMouseDown={(e) => {
        if (disabled) return;
        applyPressStyle(e.currentTarget);
      }}
      onMouseUp={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = hoverBg;
        clearPressStyle(e.currentTarget);
      }}
    >
      {children}
    </Component>
  );
};

const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";

const FOCUS_RING_SHADOW = () => `0 0 0 2px rgba(62, 84, 117, 0.15)`;

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
  el.style.boxShadow = FOCUS_RING_SHADOW();
};

const nativeFieldInteraction = {
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
  height: 36,
  width: "100%",
  maxWidth: 220,
  padding: "0 12px",
  fontSize: 13,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: FIELD_RADIUS,
  outline: "none",
  backgroundColor: C.fieldBg,
  color: C.valueText,
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const nativeFieldSelectStyle = {
  width: "100%",
  maxWidth: 220,
  minHeight: 36,
  height: 36,
  padding: "0 28px 0 12px",
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
  cursor: "pointer",
};

const advancedPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  width: "100%",
  maxWidth: "100%",
  padding: 16,
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  boxSizing: "border-box",
};

const advancedPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
};

const advancedTableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: CARD_RADIUS,
  boxShadow: C.cardShadow,
  overflow: "hidden",
};

const pageFooterBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 4,
  minWidth: 100,
};

const advancedFormInlineFooterStyle = {
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

const advancedFormBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 4,
  minWidth: 100,
};

const advancedCardTitleBarStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: CARD_RADIUS,
  borderTopRightRadius: CARD_RADIUS,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  padding: "7px 14px",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  borderBottom: `1px solid ${C.divider}`,
  boxSizing: "border-box",
};

const dashboardGridStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 1px minmax(0, 1fr)",
  width: "100%",
  alignItems: "stretch",
  alignContent: "start",
};

const dashboardColumnStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  minWidth: 0,
  padding: "16px 36px 20px",
  boxSizing: "border-box",
};

const dashboardColumnLeftStyle = {
  ...dashboardColumnStyle,
  background: C.cardBg,
};

const dashboardColumnRightStyle = {
  ...dashboardColumnStyle,
  background: C.cardBg,
};

const dashboardDividerCellStyle = {
  display: "flex",
  flexDirection: "column",
  alignSelf: "stretch",
  padding: "14px 0",
  boxSizing: "border-box",
};

const dashboardDividerLineStyle = {
  flex: 1,
  width: 1,
  background: C.divider,
  margin: "0 auto",
};

const fxsSipCompatibilityFieldsColStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  width: "100%",
};

const fxsSipCompatibilityCheckboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const FxsSipCompatibilitySectionHeading = ({ title, isFirst = false }) => {
  const isLaptopNarrow = useMediaQuery("(max-width: 1366px)");
  return (
  <div
    style={{
      margin: isFirst
        ? isLaptopNarrow
          ? "20px 0 24px 0"
          : "12px 0 24px 0"
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
        left: isLaptopNarrow ? 0 : FXS_SIP_COMPATIBILITY_SECTION_HEADING_LEFT,
        background: C.cardBg,
        paddingRight: 8,
        fontSize: 14,
        fontWeight: 600,
        color: FXS_SIP_COMPATIBILITY_SECTION_HEADING_COLOR,
      }}
    >
      {title}
    </span>
  </div>
  );
};

const FxsSipCompatibilityBreadcrumb = () => (
  <div
    style={{
      fontSize: 12,
      color: "#94a3b8",
      marginBottom: 16,
      fontWeight: 400,
      display: "flex",
      alignItems: "center",
      gap: 4,
      flexWrap: "wrap",
      flexShrink: 0,
    }}
  >
    <span>{FXS_SIP_COMPATIBILITY_BREADCRUMB_ROOT}</span>
    <span>&gt;</span>
    <span>{FXS_SIP_COMPATIBILITY_BREADCRUMB_SECTION}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>
      {FXS_SIP_COMPATIBILITY_PAGE_TITLE}
    </span>
  </div>
);

const FxsSipCompatibilityPageShell = ({ children }) => (
  <div style={advancedPageWrapStyle} data-native-scroll>
    <div style={advancedPageInnerStyle}>{children}</div>
  </div>
);

const LEFT_COLUMN_LAYOUT = [
  {
    type: "fields",
    keys: ["obtainCalleeId", "callerIdPosition", "obtainCallerId"],
  },
  { type: "group", parent: "callTransferMode", children: ["internalHandle"] },
  { type: "group", parent: "callFlashMode", children: ["holdMusicSource"] },
  {
    type: "fields",
    keys: ["maxWaitAnswer", "sipIdentifying", "maxWaitRtp"],
  },
  { type: "group", parent: "manageRefer", children: ["fxoHangupTime"] },
];

const RIGHT_COLUMN_LAYOUT = [
  {
    type: "fields",
    keys: ["useSourceAddress", "useContactAddress", "twoStageDialing"],
  },
  { type: "group", parent: "abnormalHangup", children: ["abnormalHangupCycle"] },
  {
    type: "group",
    parent: "serverStatusDetection",
    children: ["cycle", "sendCueTone"],
  },
  {
    type: "group",
    parent: "sipEncryption",
    children: ["encryptionCriterion", "identifier", "key"],
  },
  { type: "fields", keys: ["rtpEncryption", "invite100rel", "ignoreAck"] },
  {
    type: "group",
    parent: "userDefinedSipCode",
    children: ["noIdlePort", "calledPartyDisconnected", "routeFailed"],
  },
  { type: "fields", keys: ["useIptables"] },
];

const nestedFieldsWrapStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  marginLeft: 12,
  paddingLeft: 14,
  borderLeft: `2px solid ${C.divider}`,
};

const getFieldByKey = (key) =>
  SIP_COMPATIBILITY_FIELDS.find((field) => field.key === key);

const getInitialState = () => {
  const state = {};
  SIP_COMPATIBILITY_FIELDS.forEach((f) => {
    if (f.type === "select") {
      state[f.key] = f.options[0] || f.default || "";
    } else if (f.type === "checkbox") {
      state[f.key] = f.default || false;
    } else {
      state[f.key] = f.default || "";
    }
  });
  return state;
};

const SipCompatibilityPage = () => {
  const [form, setForm] = useState(getInitialState());
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const alert = (msg) => {
    const isSuccess = /successfully/i.test(String(msg));
    showToast(msg, isSuccess ? "success" : "error");
  };

  const handleChange = (key, value) => {
    const fieldDef = SIP_COMPATIBILITY_FIELDS.find((f) => f.key === key);
    if (fieldDef && fieldDef.validation === "integer") {
      if (value === "" || /^\d+$/.test(value)) {
        setForm((prev) => ({ ...prev, [key]: value }));
      }
    } else {
      setForm((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleCheckbox = (key) => {
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    alert("Settings saved successfully!");
  };

  const handleReset = () => {
    setForm(getInitialState());
  };

  // Check if field should be shown based on conditional logic
  const shouldShowField = (field) => {
    if (!field.conditional) return true;

    const conditionalValue = form[field.conditional];

    // Special case for Key field: show when sipEncryption is checked
    // (it will show regardless of encryptionCriterion value)
    if (field.key === "key") {
      return !!form.sipEncryption;
    }

    if (field.conditionalValues) {
      return field.conditionalValues.includes(conditionalValue);
    } else if (field.conditionalValue !== undefined) {
      return conditionalValue === field.conditionalValue;
    } else {
      return !!conditionalValue;
    }
  };

  const fieldInputStyle = {
    ...nativeFieldInputStyle,
    width: "100%",
  };

  const fieldSelectStyle = {
    ...nativeFieldSelectStyle,
    width: "100%",
  };

  const valueColStyle = {
    flex: "1 1 auto",
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  };

  const controlSlotStyle = {
    width: 220,
    maxWidth: "100%",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
  };

  const renderField = (field, nested = false) => {
    if (!field || !shouldShowField(field)) return null;

    return (
      <CompatibilityFieldRow
        key={field.key}
        label={field.label}
        tooltipKey={field.key}
        nested={nested}
      >
        <div style={valueColStyle}>
          {field.type === "text" && (
            <div
              style={{
                ...controlSlotStyle,
                width: field.key === "fxoHangupTime" ? "auto" : 220,
                minWidth: 220,
              }}
            >
              <input
                type="text"
                value={form[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                style={fieldInputStyle}
                {...nativeFieldInteraction}
              />
              {field.key === "fxoHangupTime" && (
                <span
                  style={{
                    color: C.valueText,
                    fontSize: 13,
                    flexShrink: 0,
                    marginLeft: 4,
                  }}
                >
                  s
                </span>
              )}
            </div>
          )}

          {field.type === "select" && (
            <div style={controlSlotStyle}>
              <select
                value={form[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                style={fieldSelectStyle}
                {...nativeFieldInteraction}
              >
                {field.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          )}

          {field.type === "checkbox" && (
            <div style={controlSlotStyle}>
              <Checkbox
                size="small"
                checked={!!form[field.key]}
                onChange={() => handleCheckbox(field.key)}
                sx={fxsSipCompatibilityCheckboxSx}
              />
            </div>
          )}
        </div>
      </CompatibilityFieldRow>
    );
  };

  const renderConditionalGroup = (parentKey, childKeys) => {
    const parentField = getFieldByKey(parentKey);
    if (!parentField) return null;

    const parentRow = renderField(parentField);
    if (!parentRow) return null;

    const visibleChildren = childKeys
      .map((key) => getFieldByKey(key))
      .filter((field) => field && shouldShowField(field));

    return (
      <div
        key={parentKey}
        style={{ display: "flex", flexDirection: "column", gap: 8 }}
      >
        {parentRow}
        {visibleChildren.length > 0 ? (
          <div style={nestedFieldsWrapStyle}>
            {visibleChildren.map((field) => renderField(field, true))}
          </div>
        ) : null}
      </div>
    );
  };

  const renderColumnLayout = (layout) =>
    layout.map((block, index) => {
      if (block.type === "fields") {
        return block.keys.map((key) => renderField(getFieldByKey(key)));
      }

      if (block.type === "group") {
        return (
          <React.Fragment key={block.parent || index}>
            {renderConditionalGroup(block.parent, block.children)}
          </React.Fragment>
        );
      }

      return null;
    });

  return (
    <FxsSipCompatibilityPageShell>
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={() => setToast({ msg: "", type: "success" })}
          sx={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            minWidth: 300,
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            fontWeight: 500,
          }}
        >
          {toast.msg}
        </Alert>
      )}


      <FxsSipCompatibilityBreadcrumb />

      <div style={advancedTableContainerStyle}>
        <div style={advancedCardTitleBarStyle}>
          <span>{FXS_SIP_COMPATIBILITY_CARD_TITLE}</span>
        </div>
        <div className="settings-dashboard-grid" style={dashboardGridStyle}>
          <div style={dashboardColumnLeftStyle}>
            <FxsSipCompatibilitySectionHeading
              title={FXS_SIP_COMPATIBILITY_LEFT_SECTION_TITLE}
              isFirst
            />
            <div style={fxsSipCompatibilityFieldsColStyle}>
              {renderColumnLayout(LEFT_COLUMN_LAYOUT)}
            </div>
          </div>

          <div className="settings-dashboard-divider" style={dashboardDividerCellStyle} aria-hidden="true">
            <div style={dashboardDividerLineStyle} />
          </div>

          <div style={dashboardColumnRightStyle}>
            <FxsSipCompatibilitySectionHeading
              title={FXS_SIP_COMPATIBILITY_RIGHT_SECTION_TITLE}
              isFirst
            />
            <div style={fxsSipCompatibilityFieldsColStyle}>
              {renderColumnLayout(RIGHT_COLUMN_LAYOUT)}
            </div>
          </div>
        </div>

        <div style={advancedFormInlineFooterStyle}>
          <Btn
            type="button"
            onClick={handleSave}
            variant="primary"
            style={advancedFormBtnStyle}
          >
            {FXS_SIP_COMPATIBILITY_SAVE_LABEL}
          </Btn>
          <Btn
            type="button"
            onClick={handleReset}
            variant="cancel"
            style={advancedFormBtnStyle}
          >
            {FXS_SIP_COMPATIBILITY_RESET_LABEL}
          </Btn>
        </div>
      </div>
    </FxsSipCompatibilityPageShell>
  );
};

export default SipCompatibilityPage;