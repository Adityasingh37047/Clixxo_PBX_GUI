import React, { useState } from "react";
import {
  Alert,
  Checkbox,
  MenuItem,
  Select,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import {
  RADIUS_FIELDS,
  LOCAL_IP_OPTIONS,
  CALL_TYPE_OPTIONS,
  RADIUS_INITIAL_FORM,
  RADIUS_BREADCRUMB,
  RADIUS_CARD_TITLE,
  RADIUS_BUTTON_LABELS,
  RADIUS_BUTTON_VARIANTS,
  RADIUS_TOOLTIPS,
  RADIUS_TOAST_DEFAULT,
  RADIUS_TOAST_DURATION,
  RADIUS_MESSAGES,
  RADIUS_SELECT_LOCAL_IP_PLACEHOLDER,
} from "../../../constants/RadiusConstants";

const RADIUS_COMPACT_MQ = "(max-width: 768px)";
const RADIUS_GRID_TWO_COL_MQ = "(min-width: 900px)";
const RADIUS_FORM_MAX_WIDTH = 960;
const RADIUS_FORM_PAD_X = 28;
const CARD_RADIUS = 10;
const FIELD_RADIUS = 6;

const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  cardShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
  divider: "#e2e6ec",
  labelText: "#3E5475",
  valueText: "#30415A",
  mutedText: "#94a3b8",
  accent: "#3E5475",
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

const inputInteraction = {
  onFocus: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    setFieldFocus(e.target);
  },
  onBlur: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    setFieldDefault(e.target);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldHover(e.target);
    }
  },
  onMouseLeave: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldDefault(e.target);
    }
  },
};

const radiusFieldInputStyle = {
  width: "100%",
  minWidth: 0,
  padding: "0 12px",
  borderRadius: FIELD_RADIUS,
  boxSizing: "border-box",
  background: "#ffffff",
  lineHeight: 1.35,
  minHeight: 36,
  height: 36,
  fontSize: 13,
  border: `1px solid ${OUTLINED_BORDER}`,
  outline: "none",
  color: C.valueText,
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const radiusMuiSelectSx = {
  width: "100%",
  fontSize: 13,
  backgroundColor: "#fff",
  "& .MuiOutlinedInput-root": {
    minHeight: 36,
    backgroundColor: "#fff",
  },
  "& .MuiSelect-select": {
    padding: "7px 32px 7px 10px !important",
    lineHeight: 1.35,
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
};

const radiusCheckboxSx = {
  padding: 0,
  margin: 0,
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
};

const tooltipProps = {
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
      },
    },
    arrow: { sx: { color: "#fff" } },
  },
};

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
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
      background: "#e2e8f0",
      color: "#475569",
      border: "1px solid #e2e8f0",
    },
  };

  const s = styles[variant] || styles.default;
  const hoverBg =
    {
      primary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      cancel: "#d4dce6",
      default: "#f1f5f9",
    }[variant] || "#f1f5f9";
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      cancel: "#c5ced9",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const baseBg = extraStyle?.background ?? s.background;

  return (
    <button
      type={type || "button"}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 14px",
        borderRadius: 10,
        fontSize: 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "background 0.15s ease, transform 0.1s ease",
        height: 30,
        gap: 6,
        whiteSpace: "nowrap",
        userSelect: "none",
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.background = baseBg;
        e.currentTarget.style.transform = "";
      }}
      onMouseDown={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = activeBg;
          e.currentTarget.style.transform = "translateY(1px) scale(0.98)";
        }
      }}
      onMouseUp={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = hoverBg;
          e.currentTarget.style.transform = "";
        }
      }}
    >
      {children}
    </button>
  );
};

const radiusPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const radiusPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const radiusCardStyle = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: CARD_RADIUS,
  boxShadow: C.cardShadow,
  overflow: "hidden",
  boxSizing: "border-box",
};

const radiusHeaderStyle = {
  minHeight: 44,
  display: "flex",
  alignItems: "center",
  padding: `10px ${RADIUS_FORM_PAD_X}px`,
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  borderBottom: `1px solid ${C.divider}`,
};

const radiusFormBodyStyle = {
  width: "100%",
  maxWidth: RADIUS_FORM_MAX_WIDTH,
  margin: "0 auto",
  padding: `20px ${RADIUS_FORM_PAD_X}px`,
  boxSizing: "border-box",
};

const radiusFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  padding: "10px 18px",
  borderTop: `1px solid ${C.divider}`,
  minHeight: 50,
};

const radiusFooterBtnStyle = {
  height: 30,
  minWidth: 100,
  fontSize: 12,
  borderRadius: 10,
};

const radiusFixedAlertSx = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  maxWidth: 500,
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
};

const radiusFormGridStyle = (isGridTwoCol) => ({
  display: "grid",
  gridTemplateColumns: isGridTwoCol ? "1fr 1fr" : "1fr",
  gap: isGridTwoCol ? "18px 32px" : 14,
  width: "100%",
  alignItems: "start",
});

const radiusGridFieldStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  minWidth: 0,
  width: "100%",
};

const radiusGridLabelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: C.labelText,
  lineHeight: 1.4,
  wordBreak: "break-word",
  cursor: "help",
  display: "inline-flex",
  width: "fit-content",
};

const radiusCallTypeGridStyle = (isGridTwoCol) => ({
  display: "grid",
  gridTemplateColumns: isGridTwoCol ? "1fr 1fr" : "1fr",
  gap: isGridTwoCol ? "10px 32px" : 8,
  width: "100%",
});

const radiusFullWidthGridCellStyle = {
  gridColumn: "1 / -1",
};

const radiusEnableRowStyle = (isCompact) => ({
  ...radiusFullWidthGridCellStyle,
  display: "flex",
  flexDirection: isCompact ? "column" : "row",
  alignItems: isCompact ? "stretch" : "center",
  flexWrap: isCompact ? "nowrap" : "wrap",
  gap: isCompact ? 12 : "10px 28px",
  width: "100%",
});

const radiusEnableItemStyle = (isCompact) => ({
  display: "flex",
  alignItems: "center",
  gap: 8,
  minHeight: 36,
  flex: isCompact ? "none" : "1 1 0",
  minWidth: isCompact ? "100%" : 180,
});

const radiusEnableLabelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: C.labelText,
  lineHeight: 1.35,
  whiteSpace: "nowrap",
  flexShrink: 0,
  cursor: "help",
  display: "inline-flex",
  width: "fit-content",
};

const RadiusGridField = ({ label, tooltip, children }) => (
  <div style={radiusGridFieldStyle}>
    <div style={{ width: "fit-content" }}>
      <Tooltip title={tooltip || ""} {...tooltipProps}>
        <span style={radiusGridLabelStyle}>{label}</span>
      </Tooltip>
    </div>
    {children}
  </div>
);

const RadiusBreadcrumb = () => (
  <div
    style={{
      fontSize: 12,
      color: C.mutedText,
      marginBottom: 16,
      display: "flex",
      alignItems: "center",
      gap: 4,
      flexWrap: "wrap",
    }}
  >
    <span>{RADIUS_BREADCRUMB[0]}</span>
    <span>&gt;</span>
    <span>{RADIUS_BREADCRUMB[1]}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>
      {RADIUS_BREADCRUMB[2]}
    </span>
  </div>
);

const EnableCheckbox = ({ checked, onChange, name }) => (
  <Checkbox
    size="small"
    checked={checked}
    onChange={onChange}
    name={name}
    sx={radiusCheckboxSx}
  />
);

const CallTypeRow = ({ checked, value, label, onChange }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 32 }}>
    <Checkbox
      size="small"
      checked={checked}
      onChange={onChange}
      name="callType"
      value={value}
      sx={radiusCheckboxSx}
    />
    <span style={{ fontSize: 13, color: C.valueText }}>{label}</span>
  </div>
);

const ENABLE_FIELDS = RADIUS_FIELDS.filter((f) => f.type === "checkbox");
const INPUT_FIELDS = RADIUS_FIELDS.filter(
  (f) => f.type !== "checkbox" && f.type !== "checkboxGroup",
);
const CALL_TYPE_FIELD = RADIUS_FIELDS.find((f) => f.type === "checkboxGroup");

const Radius = () => {
  const isCompact = useMediaQuery(RADIUS_COMPACT_MQ);
  const isGridTwoCol = useMediaQuery(RADIUS_GRID_TWO_COL_MQ);
  const [form, setForm] = useState(RADIUS_INITIAL_FORM);
  const [toast, setToast] = useState(RADIUS_TOAST_DEFAULT);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(RADIUS_TOAST_DEFAULT), RADIUS_TOAST_DURATION);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCallTypeChange = (e) => {
    const { value, checked } = e.target;
    setForm((prev) => {
      const arr = prev.callType || [];
      if (checked) return { ...prev, callType: [...arr, value] };
      return { ...prev, callType: arr.filter((v) => v !== value) };
    });
  };

  const handleReset = () => {
    setForm(RADIUS_INITIAL_FORM);
    showToast(RADIUS_MESSAGES.resetSuccess, "success");
  };

  const handleSave = (e) => {
    e.preventDefault();
    showToast(RADIUS_MESSAGES.saveSuccess, "success");
  };

  const renderControl = (field) => {
    if (field.type === "select") {
      return (
        <Select
          value={form[field.name] || ""}
          onChange={handleChange}
          name={field.name}
          size="small"
          variant="outlined"
          displayEmpty
          sx={radiusMuiSelectSx}
        >
          <MenuItem value="">
            <em>{RADIUS_SELECT_LOCAL_IP_PLACEHOLDER}</em>
          </MenuItem>
          {LOCAL_IP_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      );
    }

    return (
      <input
        type={field.type === "password" ? "password" : "text"}
        name={field.name}
        value={form[field.name] || ""}
        onChange={handleChange}
        style={radiusFieldInputStyle}
        {...inputInteraction}
      />
    );
  };

  return (
    <div
      style={{
        ...radiusPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
      data-native-scroll
    >
      <div style={radiusPageInnerStyle}>
        {toast.msg && (
          <Alert
            severity={toast.type}
            onClose={() => setToast(RADIUS_TOAST_DEFAULT)}
            sx={{
              ...radiusFixedAlertSx,
              ...(isCompact
                ? { left: 8, right: 8, top: 12, minWidth: 0, maxWidth: "none" }
                : {}),
            }}
          >
            {toast.msg}
          </Alert>
        )}

        <RadiusBreadcrumb />

        <form onSubmit={handleSave} autoComplete="off">
          <div style={radiusCardStyle}>
            <div style={radiusHeaderStyle}>
              <span>{RADIUS_CARD_TITLE}</span>
            </div>

            <div style={radiusFormBodyStyle}>
              <div style={radiusFormGridStyle(isGridTwoCol)}>
                <div style={radiusEnableRowStyle(isCompact)}>
                  {ENABLE_FIELDS.map((field) => (
                    <div
                      key={field.name}
                      style={radiusEnableItemStyle(isCompact)}
                    >
                      <Tooltip
                        title={RADIUS_TOOLTIPS[field.name] || ""}
                        {...tooltipProps}
                      >
                        <span style={radiusEnableLabelStyle}>{field.label}</span>
                      </Tooltip>
                      <EnableCheckbox
                        checked={!!form[field.name]}
                        onChange={handleChange}
                        name={field.name}
                      />
                    </div>
                  ))}
                </div>

                {CALL_TYPE_FIELD ? (
                  <div
                    style={
                      isGridTwoCol ? radiusFullWidthGridCellStyle : undefined
                    }
                  >
                    <RadiusGridField
                      label={CALL_TYPE_FIELD.label}
                      tooltip={RADIUS_TOOLTIPS.callType}
                    >
                      <div style={radiusCallTypeGridStyle(isGridTwoCol)}>
                        {CALL_TYPE_OPTIONS.map((opt) => (
                          <CallTypeRow
                            key={opt.value}
                            value={opt.value}
                            label={opt.label}
                            checked={form.callType.includes(opt.value)}
                            onChange={handleCallTypeChange}
                          />
                        ))}
                      </div>
                    </RadiusGridField>
                  </div>
                ) : null}

                {INPUT_FIELDS.map((field) => (
                  <RadiusGridField
                    key={field.name}
                    label={field.label}
                    tooltip={RADIUS_TOOLTIPS[field.name]}
                  >
                    {renderControl(field)}
                  </RadiusGridField>
                ))}
              </div>
            </div>

            <div style={radiusFooterStyle}>
              <Btn
                type="button"
                variant={RADIUS_BUTTON_VARIANTS.RESET}
                onClick={handleReset}
                style={radiusFooterBtnStyle}
              >
                {RADIUS_BUTTON_LABELS.RESET}
              </Btn>
              <Btn
                type="submit"
                variant={RADIUS_BUTTON_VARIANTS.SAVE}
                style={radiusFooterBtnStyle}
              >
                {RADIUS_BUTTON_LABELS.SAVE}
              </Btn>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Radius;
