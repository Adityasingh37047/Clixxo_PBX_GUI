import React, { useState, useEffect, useRef } from "react";
import {
  Alert,
  CircularProgress,
  FormControl,
  MenuItem,
  Select as MuiSelect,
  TextField,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import {
  getFeatureCodes,
  updateFeatureCodes,
  listIvrDestinations,
} from "../../../api/apiService";
import {
  FEATURE_CODE_BREADCRUMB_SECTION,
  FEATURE_CODE_TOOLTIPS,
  FEATURE_CODE_SECTIONS,
  FEATURE_CODE_INITIAL_FORM,
  FEATURE_CODE_TITLE,
  FORM_TO_API,
  API_TO_FORM,
  NUMERIC_KEYS,
} from "../../../constants/FeatureCodeConstants";

const FEATURE_CODE_COMPACT_MQ = "(max-width: 768px)";
const FEATURE_CODE_PAIR_STACK_MQ = "(max-width: 1280px)";
const FEATURE_CODE_LAPTOP_NARROW_MQ = "(max-width: 1366px)";
const FEATURE_CODE_MAIN_SECTION_HEADING_LEFT = -20;

const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  divider: "#e2e6ec",
  labelText: "#3E5475",
  valueText: "#0f172a",
  mutedText: "#6b7280",
  accent: "#3E5475",
  sectionHeading: "#30415A",
};

const FEATURE_CODE_CARD_RADIUS = 10;

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
      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
    },
    danger: {
      background: "#fef2f2",
      color: "#dc2626",
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
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      cancel: "#a3b1c2",
      danger: "#f87171",
      outline: "#d1d9e6",
      default: "#d1d5db",
    }[variant] || "#d1d5db";
  const baseBg = extraStyle?.background ?? s.background;
  const baseShadow = extraStyle?.boxShadow ?? s.boxShadow ?? "none";
  const Component = component || "button";

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
        padding: "6px 14px",
        borderRadius: 10,
        fontSize: 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "all 0.15s ease",
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
        if (!disabled) {
          e.currentTarget.style.background = baseBg;
          clearPressStyle(e.currentTarget);
        }
      }}
      onMouseDown={(e) => {
        if (!disabled) applyPressStyle(e.currentTarget);
      }}
      onMouseUp={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = hoverBg;
          clearPressStyle(e.currentTarget);
        }
      }}
    >
      {children}
    </Component>
  );
};

const featureCodePageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const featureCodePageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const featureCodeFormBodyStyle = {
  width: "100%",
  maxWidth: 920,
  margin: "0 auto",
  boxSizing: "border-box",
};

const featureCodeCardStyle = {
  background: "#ffffff",
  borderRadius: FEATURE_CODE_CARD_RADIUS,
  overflow: "hidden",
  border: `1px solid ${C.cardBorder}`,
  boxShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
};

const featureCodeHeaderStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: FEATURE_CODE_CARD_RADIUS,
  borderTopRightRadius: FEATURE_CODE_CARD_RADIUS,
  display: "flex",
  alignItems: "center",
  padding: "7px 14px",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  borderBottom: `1px solid ${C.divider}`,
};

const pageFooterBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
  minWidth: 100,
};

const featureCodeFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "100%",
  padding: "10px 28px",
  borderTop: `1px solid ${C.divider}`,
  boxSizing: "border-box",
  background: "#ffffff",
  borderBottomLeftRadius: FEATURE_CODE_CARD_RADIUS,
  borderBottomRightRadius: FEATURE_CODE_CARD_RADIUS,
};

const featureCodeFooterBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
  minWidth: 100,
};

const featureCodeFixedAlertSx = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  maxWidth: 420,
  boxShadow: 3,
};

const FeatureCodeBreadcrumb = ({ section, current }) => (
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
    }}
  >
    <span>PBX</span>
    <span>&gt;</span>
    <span>{section}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>{current}</span>
  </div>
);

const TableListLoading = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: 48,
    }}
  >
    <CircularProgress size={28} style={{ color: C.accent }} />
  </div>
);

const FeatureCodeSectionHeading = ({ title, isFirst = false, isCompact = false }) => {
  const isLaptopNarrow = useMediaQuery(FEATURE_CODE_LAPTOP_NARROW_MQ);
  const tightenSpacing = isLaptopNarrow || isCompact;
  return (
  <div
    style={{
      margin: isFirst
        ? tightenSpacing
          ? "20px 0 24px 0"
          : "0 0 24px 0"
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
        left: tightenSpacing ? 0 : FEATURE_CODE_MAIN_SECTION_HEADING_LEFT,
        background: C.cardBg,
        paddingRight: 8,
        fontSize: 14,
        fontWeight: 600,
        color: C.sectionHeading,
      }}
    >
      {title}
    </span>
  </div>
  );
};

const FEATURE_CODE_TOOLTIP_PROPS = {
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
    arrow: {
      sx: { color: "#fff" },
    },
  },
};

const FEATURE_CODE_FIELD_LABEL_WIDTH = 220;
const FEATURE_CODE_INPUT_WIDTH = 150;
const FEATURE_CODE_GRID_COLUMN_GAP = 56;

const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";
const FOCUS_RING_SHADOW = "0 0 0 2px rgba(62, 84, 117, 0.15)";

const featureCodeOutlinedInputRootSx = {
  backgroundColor: "#fff",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  "& fieldset": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  "&:hover fieldset": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused": {
    boxShadow: FOCUS_RING_SHADOW,
  },
  "&.Mui-focused fieldset": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
  "&.Mui-focused:hover fieldset": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
};

const featureCodeFieldControlSx = (isCompact) => ({
  width: isCompact ? "100%" : FEATURE_CODE_INPUT_WIDTH,
  maxWidth: isCompact ? "100%" : FEATURE_CODE_INPUT_WIDTH,
  "& .MuiOutlinedInput-root": {
    ...featureCodeOutlinedInputRootSx,
    minHeight: 34,
    height: 34,
    fontSize: 13,
  },
  "& .MuiOutlinedInput-input": {
    padding: "7px 10px",
    fontSize: 13,
    boxSizing: "border-box",
    backgroundColor: "#fff",
    color: C.valueText,
    cursor: "text",
  },
});

const featureCodeSelectSx = (isCompact) => ({
  fontSize: 13,
  backgroundColor: "#fff",
  width: isCompact ? "100%" : FEATURE_CODE_INPUT_WIDTH,
  maxWidth: isCompact ? "100%" : FEATURE_CODE_INPUT_WIDTH,
  minHeight: 34,
  height: 34,
  ...featureCodeOutlinedInputRootSx,
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused": {
    boxShadow: FOCUS_RING_SHADOW,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
  "&.Mui-focused:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
  "& .MuiSelect-select": {
    padding: "7px 32px 7px 10px !important",
    display: "flex",
    alignItems: "center",
    color: C.valueText,
    cursor: "pointer",
  },
});

const FeatureCodeFieldRow = ({ field, isCompact, children }) => {
  const stacked = isCompact;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: stacked ? "column" : "row",
        alignItems: stacked ? "stretch" : "center",
        padding: "8px 0",
        gap: stacked ? 6 : 12,
      }}
    >
      <Tooltip
        title={FEATURE_CODE_TOOLTIPS[field.key] || ""}
        {...FEATURE_CODE_TOOLTIP_PROPS}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: C.labelText,
            textAlign: "left",
            width: stacked ? "100%" : FEATURE_CODE_FIELD_LABEL_WIDTH,
            flexShrink: 0,
            lineHeight: 1.4,
            cursor: "help",
          }}
        >
          {field.label}
        </span>
      </Tooltip>
      <div style={{ minWidth: 0, flexShrink: 0, width: stacked ? "100%" : undefined }}>
        {children}
      </div>
    </div>
  );
};

const TIMEOUT_DESTINATION_STATIC_OPTIONS = [
  { value: "hangup", label: "Hangup" },
  { value: "original_extension", label: "Original extension" },
];

const normalizeExtensionOptions = (list) => {
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => {
      if (item == null) return null;
      if (typeof item === "string" || typeof item === "number")
        return { value: String(item), label: String(item) };
      const value = String(
        item.value ?? item.id ?? item.extension ?? "",
      ).trim();
      const label = String(
        item.label ?? item.display_name ?? item.name ?? value,
      ).trim();
      if (!value) return null;
      return { value, label: label || value };
    })
    .filter(Boolean);
};

const apiToForm = (apiData) => {
  const form = { ...FEATURE_CODE_INITIAL_FORM };
  Object.entries(apiData).forEach(([apiKey, val]) => {
    const formKey = API_TO_FORM[apiKey];
    if (formKey !== undefined && val !== null && val !== undefined) {
      form[formKey] = String(val);
    }
  });
  return form;
};

const formToApi = (form) => {
  const data = {};
  Object.entries(FORM_TO_API).forEach(([formKey, apiKey]) => {
    const val = form[formKey];
    if (val === "" || val === null || val === undefined) {
      data[apiKey] = apiKey === "agent_free_busy_ivr" ? null : val;
    } else {
      data[apiKey] = NUMERIC_KEYS.has(formKey) ? Number(val) : val;
    }
  });
  return data;
};

const FeatureCodePage = () => {
  const isCompact = useMediaQuery(FEATURE_CODE_COMPACT_MQ);
  const stackFieldPairs = isCompact || useMediaQuery(FEATURE_CODE_PAIR_STACK_MQ);
  const [form, setForm] = useState({ ...FEATURE_CODE_INITIAL_FORM });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [extensionOptions, setExtensionOptions] = useState([]);
  const hasLoaded = useRef(false);

  const timeoutDestinationOptions = [
    ...TIMEOUT_DESTINATION_STATIC_OPTIONS,
    ...extensionOptions,
  ];

  const loadDestinations = async () => {
    try {
      const destRes = await listIvrDestinations();
      const destMessage = destRes?.message ?? destRes?.data ?? destRes;
      const extensionsRaw =
        destMessage?.Extensions ?? destMessage?.extensions ?? [];
      setExtensionOptions(normalizeExtensionOptions(extensionsRaw));
    } catch (_) {
      setExtensionOptions([]);
    }
  };

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  const handleChange = (key, val) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getFeatureCodes();
      if (res?.response && res?.message && typeof res.message === "object") {
        setForm(apiToForm(res.message));
      }
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      loadData();
      loadDestinations();
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateFeatureCodes(formToApi(form));
      if (res?.response) {
        showMsg("success", "Feature codes saved successfully");
        if (res.message && typeof res.message === "object") {
          setForm(apiToForm(res.message));
        }
      } else {
        showMsg(
          "error",
          typeof res?.message === "string" ? res.message : "Save failed",
        );
      }
    } catch (e) {
      showMsg("error", e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const renderFieldControl = (field) => {
    if (field.type === "select") {
      const options = field.options
        ? field.options
        : field.key === "timeout_destinations"
          ? timeoutDestinationOptions
          : [];
      return (
        <FormControl
          size="small"
          sx={{ width: isCompact ? "100%" : FEATURE_CODE_INPUT_WIDTH }}
        >
          <MuiSelect
            value={form[field.key] ?? ""}
            onChange={(e) => handleChange(field.key, e.target.value)}
            sx={featureCodeSelectSx(isCompact)}
          >
            {options.map((opt) => (
              <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 13 }}>
                {opt.label}
              </MenuItem>
            ))}
          </MuiSelect>
        </FormControl>
      );
    }
    return (
      <TextField
        size="small"
        variant="outlined"
        type={field.type === "number" ? "number" : "text"}
        value={form[field.key] ?? ""}
        onChange={(e) => handleChange(field.key, e.target.value)}
        sx={featureCodeFieldControlSx(isCompact)}
      />
    );
  };

  const renderFieldCell = (field) => (
    <FeatureCodeFieldRow field={field} isCompact={isCompact}>
      {renderFieldControl(field)}
    </FeatureCodeFieldRow>
  );

  return (
    <div
      style={{
        ...featureCodePageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
      data-native-scroll
    >
      <div style={featureCodePageInnerStyle}>
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={{
              ...featureCodeFixedAlertSx,
              ...(isCompact
                ? {
                    left: 8,
                    right: 8,
                    top: 12,
                    minWidth: 0,
                    maxWidth: "none",
                    width: "calc(100% - 16px)",
                  }
                : {}),
            }}
          >
            {message.text}
          </Alert>
        )}

        <FeatureCodeBreadcrumb
          section={FEATURE_CODE_BREADCRUMB_SECTION}
          current={FEATURE_CODE_TITLE}
        />

        <div style={featureCodeCardStyle}>
          <div
            style={{
              ...featureCodeHeaderStyle,
              ...(isCompact ? { padding: "7px 12px" } : {}),
            }}
          >
            <span>{FEATURE_CODE_TITLE}</span>
          </div>

          <div style={{ padding: isCompact ? "12px 12px 0" : "12px 20px 0", boxSizing: "border-box" }}>
            {loading ? (
              <TableListLoading />
            ) : (
              <div style={{ ...featureCodeFormBodyStyle, paddingBottom: 16 }}>
                {FEATURE_CODE_SECTIONS.map((section, sectionIdx) => (
                  <div key={section.title}>
                    <FeatureCodeSectionHeading
                      title={section.title}
                      isFirst={sectionIdx === 0}
                      isCompact={isCompact}
                    />
                    <div>
                      {section.fields.map((row, rowIdx) => {
                        if (row.length === 1) {
                          const field = row[0];
                          const isRight = !!field.colRight;
                          return (
                            <div
                              key={rowIdx}
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: stackFieldPairs ? 0 : `0 ${FEATURE_CODE_GRID_COLUMN_GAP}px`,
                                ...(stackFieldPairs
                                  ? { gridTemplateColumns: "1fr" }
                                  : {}),
                              }}
                            >
                              {isRight && !stackFieldPairs && <div />}
                              <div style={{ padding: "0 0 0 0" }}>
                                {renderFieldCell(field)}
                              </div>
                              {!isRight && !stackFieldPairs && <div />}
                            </div>
                          );
                        }
                        return (
                          <div
                            key={rowIdx}
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              alignItems: stackFieldPairs ? "stretch" : "flex-start",
                              gap: stackFieldPairs
                                ? "0"
                                : `${FEATURE_CODE_GRID_COLUMN_GAP}px`,
                              ...(stackFieldPairs
                                ? { flexDirection: "column" }
                                : {}),
                            }}
                          >
                            {row.map((field) => (
                              <div
                                key={field.key}
                                style={stackFieldPairs ? { width: "100%" } : undefined}
                              >
                                {renderFieldCell(field)}
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!loading && (
            <div
              style={{
                ...featureCodeFooterStyle,
                ...(isCompact ? { padding: "10px 12px" } : {}),
              }}
            >
              <Btn
                variant="primary"
                onClick={handleSave}
                disabled={saving}
                style={featureCodeFooterBtnStyle}
              >
                {saving ? (
                  <>
                    <CircularProgress size={14} color="inherit" />
                    Saving...
                  </>
                ) : (
                  "SAVE"
                )}
              </Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeatureCodePage;
