import React, { useState, useEffect } from "react";
import Tooltip from "@mui/material/Tooltip";
import {
  buildDhcpLanSections,
  DHCP_SERVER_SETTINGS_INITIAL_FORM,
  DHCP_SERVER_PAGE_BREADCRUMB_ROOT,
  DHCP_SERVER_PAGE_BREADCRUMB_SECTION,
  DHCP_SERVER_PAGE_TITLE,
  DHCP_SERVER_CARD_TITLE,
  DHCP_SERVER_SECTION_HEADING_LEFT,
  DHCP_SERVER_SECTION_HEADING_COLOR,
  DHCP_SERVER_BTN_SAVE,
  DHCP_SERVER_BTN_RESET,
  DHCP_SERVER_BTN_SAVING,
  DHCP_SERVER_BTN_RESETTING,
  DHCP_SERVER_ENABLE_LABEL,
  DHCP_SERVER_LOADING_TEXT,
  DHCP_SERVER_EMPTY_MESSAGE,
  DHCP_SERVER_SUCCESS_SAVE,
  DHCP_SERVER_SUCCESS_RESET,
  DHCP_SERVER_FIELD_TOOLTIPS,
} from "../../../constants/DhcpServerSettingsConstants";
import {
  fetchDhcpSettings,
  fetchSaveDhcpSettings,
  fetchResetDhcpSettings,
} from "../../../api/apiService";
import { Alert, Checkbox, CircularProgress } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";

const DHCP_SERVER_SCROLL_CLASS = "dhcp-server-scroll";
const DHCP_SERVER_COMPACT_MQ = "(max-width: 768px)";
const DHCP_SERVER_LAPTOP_NARROW_MQ = "(max-width: 1366px)";
const DHCP_SERVER_LABEL_COL_WIDTH = 200;
const DHCP_SERVER_CONTROL_COL_WIDTH = 220;
const DHCP_SERVER_FIELD_COL_GAP = 8;
const DHCP_SERVER_FORM_PAD_X = 28;
const DHCP_SETTINGS_SECTION_HEADING_FIRST_MARGIN = "12px 0 24px 0";
const DHCP_SETTINGS_SECTION_HEADING_NEXT_MARGIN = "28px 0 24px 0";
const DHCP_SETTINGS_COLUMN_GAP = 12;
const DHCP_SETTINGS_COLUMN_PADDING_DESKTOP = "16px 36px 20px";

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
  placeholderText: "#9aa3b2",
  strongText: "#1f2937",
  accent: "#3E5475",
  errorRed: "#dc2626",
  sectionHeading: DHCP_SERVER_SECTION_HEADING_COLOR,
};

const CARD_RADIUS = 10;
const FIELD_RADIUS = 6;

// ── Local field UI (matches RoutingInterface.jsx design language) ──
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

const nativeFieldInputStyle = {
  height: 32,
  width: DHCP_SERVER_CONTROL_COL_WIDTH,
  minWidth: DHCP_SERVER_CONTROL_COL_WIDTH,
  maxWidth: DHCP_SERVER_CONTROL_COL_WIDTH,
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

const inputInteraction = {
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
  width: DHCP_SERVER_CONTROL_COL_WIDTH,
  minWidth: DHCP_SERVER_CONTROL_COL_WIDTH,
  maxWidth: DHCP_SERVER_CONTROL_COL_WIDTH,
  padding: "0 10px",
  borderRadius: FIELD_RADIUS,
  background: "#fff",
  lineHeight: 1.35,
  minHeight: 32,
  height: 32,
};

const inputStyle = systemFieldInputStyle;

const dhcpValueColStyle = {
  flex: "1 1 auto",
  minWidth: DHCP_SERVER_CONTROL_COL_WIDTH,
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  justifyContent: "flex-start",
  paddingTop: 2,
};

const dhcpControlSlotStyle = {
  width: DHCP_SERVER_CONTROL_COL_WIDTH,
  minWidth: DHCP_SERVER_CONTROL_COL_WIDTH,
  maxWidth: DHCP_SERVER_CONTROL_COL_WIDTH,
  flexShrink: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "flex-start",
};

const dhcpFieldRowStyle = {
  display: "flex",
  flexDirection: "row",
  alignItems: "flex-start",
  width: "100%",
  minHeight: 36,
  gap: DHCP_SERVER_FIELD_COL_GAP,
};

const dhcpFooterStyle = {
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

const dhcpFooterBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
  minWidth: 100,
};

const checkboxSx = {
  padding: "4px",
  color: OUTLINED_BORDER,
  "&.Mui-checked": { color: OUTLINED_FOCUS },
  "&.MuiCheckbox-indeterminate": { color: OUTLINED_FOCUS },
  "& .MuiSvgIcon-root": { fontSize: 18 },
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
        textTransform: "none",
        letterSpacing: "normal",
      },
    },
    arrow: { sx: { color: "#fff" } },
  },
};

const getTooltipKey = (name) => name.replace(/\d+$/, "");

const FieldRow = ({ name, label, labelStyle, children, labelColWidth }) => {
  const tooltipKey = getTooltipKey(name);
  const tooltip = DHCP_SERVER_FIELD_TOOLTIPS[tooltipKey];
  const resolvedLabelWidth = labelColWidth ?? DHCP_SERVER_LABEL_COL_WIDTH;
  const labelWrapStyle = {
    flex: `0 0 ${resolvedLabelWidth}px`,
    width: resolvedLabelWidth,
    maxWidth: resolvedLabelWidth,
    minWidth: resolvedLabelWidth,
  };
  const labelNode = (
    <label
      style={{
        fontSize: 12,
        color: C.labelText,
        fontWeight: 600,
        width: "100%",
        minWidth: 0,
        lineHeight: 1.35,
        wordBreak: "break-word",
        cursor: tooltip ? "help" : "default",
        ...labelStyle,
      }}
    >
      {label}
    </label>
  );

  return (
    <div style={dhcpFieldRowStyle}>
      <div style={labelWrapStyle}>
        {tooltip ? (
          <Tooltip title={tooltip} disableHoverListener={!tooltip} {...tooltipProps}>
            {labelNode}
          </Tooltip>
        ) : (
          labelNode
        )}
      </div>
      <div style={dhcpValueColStyle}>
        <div style={dhcpControlSlotStyle}>{children}</div>
      </div>
    </div>
  );
};

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
  form,
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
  };
  const s = styles[variant] || styles.default;
  const hoverBg =
    {
      primary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      cancel: "#b6c2d3",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      cancel: "#a3b1c2",
      default: "#d1d5db",
    }[variant] || "#d1d5db";
  const baseBg = extraStyle?.background ?? s.background;
  const baseShadow = extraStyle?.boxShadow ?? s.boxShadow ?? "none";

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
    <button
      type={type}
      form={form}
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
        transition:
          "background 0.15s ease, transform 0.1s ease, box-shadow 0.1s ease",
        height: 30,
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
    </button>
  );
};

const disabledInputStyle = {
  ...inputStyle,
  background: "#f1f5f9",
  color: "#94a3b8",
  cursor: "not-allowed",
  borderColor: "#e2e8f0",
};

const SectionHeading = ({ title, isFirst = false }) => {
  const isLaptopNarrow = useMediaQuery(DHCP_SERVER_LAPTOP_NARROW_MQ);
  return (
  <div
    style={{
      margin: isFirst
        ? isLaptopNarrow
          ? "20px 0 24px 0"
          : DHCP_SETTINGS_SECTION_HEADING_FIRST_MARGIN
        : DHCP_SETTINGS_SECTION_HEADING_NEXT_MARGIN,
      position: "relative",
      width: "100%",
    }}
  >
    <div style={{ borderTop: `1px solid ${C.divider}` }} />
    <span
      style={{
        position: "absolute",
        top: -10,
        left: isLaptopNarrow ? 0 : DHCP_SERVER_SECTION_HEADING_LEFT,
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

const dhcpPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const dhcpPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
};

const dhcpContentStyle = {
  padding: 0,
  boxSizing: "border-box",
  background: C.cardBg,
};

const dhcpTableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: CARD_RADIUS,
  boxShadow: C.cardShadow,
  overflow: "hidden",
  boxSizing: "border-box",
};

const dhcpHeaderStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: CARD_RADIUS,
  borderTopRightRadius: CARD_RADIUS,
  display: "flex",
  alignItems: "center",
  padding: `10px ${DHCP_SERVER_FORM_PAD_X}px`,
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  borderBottom: `1px solid ${C.divider}`,
  boxSizing: "border-box",
};

const dhcpFieldGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: DHCP_SETTINGS_COLUMN_GAP,
  width: "100%",
};

const dhcpLanGridStyle = (isCompact, sectionCount) => ({
  display: "grid",
  gridTemplateColumns:
    isCompact || sectionCount <= 1
      ? "minmax(0, 1fr)"
      : "minmax(0, 1fr) 1px minmax(0, 1fr)",
  width: "100%",
  alignItems: "stretch",
  alignContent: "start",
  minHeight: "100%",
});

const dhcpLanColumnStyle = (isCompact) => ({
  display: "flex",
  flexDirection: "column",
  gap: DHCP_SETTINGS_COLUMN_GAP,
  minWidth: 0,
  padding: isCompact
    ? `16px ${DHCP_SERVER_FORM_PAD_X}px 20px`
    : DHCP_SETTINGS_COLUMN_PADDING_DESKTOP,
  background: C.cardBg,
  boxSizing: "border-box",
});

const dhcpLanDividerCellStyle = {
  display: "flex",
  flexDirection: "column",
  alignSelf: "stretch",
  padding: "14px 0",
  boxSizing: "border-box",
};

const dhcpLanDividerLineStyle = {
  flex: 1,
  width: 1,
  background: C.divider,
  margin: "0 auto",
};

const dhcpLanGridResponsiveCss = `
  @media (max-width: 768px) {
    .dhcp-lan-grid {
      grid-template-columns: minmax(0, 1fr) !important;
    }
    .dhcp-lan-divider {
      display: none !important;
    }
  }
`;

const dhcpFixedAlertSx = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  maxWidth: 500,
  wordBreak: "break-word",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
  fontWeight: 500,
};

const DhcpScrollbarStyles = () => (
  <style>{`
    ${dhcpLanGridResponsiveCss}
    .${DHCP_SERVER_SCROLL_CLASS} {
      scroll-behavior: smooth;
      scrollbar-gutter: stable;
      scrollbar-width: thin;
      scrollbar-color: rgba(100, 116, 139, 0.45) transparent;
    }
    .${DHCP_SERVER_SCROLL_CLASS}::-webkit-scrollbar {
      width: 8px;
      height: 8px;
      transition: width 0.2s ease, height 0.2s ease;
    }
    .${DHCP_SERVER_SCROLL_CLASS}::-webkit-scrollbar:hover {
      width: 11px;
      height: 11px;
    }
    .${DHCP_SERVER_SCROLL_CLASS}::-webkit-scrollbar-corner {
      background: transparent;
    }
    .${DHCP_SERVER_SCROLL_CLASS}::-webkit-scrollbar-track {
      background: transparent;
    }
    .${DHCP_SERVER_SCROLL_CLASS}::-webkit-scrollbar-thumb {
      background-color: rgba(100, 116, 139, 0.45);
      border-radius: 6px;
      border: 2px solid transparent;
      background-clip: padding-box;
      transition: background-color 0.2s ease;
    }
    .${DHCP_SERVER_SCROLL_CLASS}::-webkit-scrollbar-thumb:hover {
      background-color: rgba(71, 85, 105, 0.65);
    }
  `}</style>
);

const DhcpPageShell = ({ children }) => (
  <>
    <DhcpScrollbarStyles />
    <div
      className={DHCP_SERVER_SCROLL_CLASS}
      style={dhcpPageWrapStyle}
      data-native-scroll
    >
      <div style={dhcpPageInnerStyle}>{children}</div>
    </div>
  </>
);

const DhcpBreadcrumb = () => (
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
    <span>{DHCP_SERVER_PAGE_BREADCRUMB_ROOT}</span>
    <span>&gt;</span>
    <span>{DHCP_SERVER_PAGE_BREADCRUMB_SECTION}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>
      {DHCP_SERVER_PAGE_TITLE}
    </span>
  </div>
);

const buildSavePayload = (formData, sections) => {
  const payload = {};
  sections.forEach((section) => {
    section.fields.forEach((field) => {
      payload[field.name] = formData[field.name];
    });
  });
  return payload;
};

const DhcpServerSettings = () => {
  const isCompact = useMediaQuery(DHCP_SERVER_COMPACT_MQ);
  const [form, setForm] = useState(DHCP_SERVER_SETTINGS_INITIAL_FORM);
  const [lanSections, setLanSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchDhcpData();
  }, []);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const fetchDhcpData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchDhcpSettings();

      if (
        response &&
        response.success &&
        response.data &&
        Array.isArray(response.data)
      ) {
        const lanPorts = response.data;
        const mappedData = {};

        lanPorts.forEach((lanData, index) => {
          const lanNumber = index + 1;
          mappedData[`enabled${lanNumber}`] = lanData.enabled || false;
          mappedData[`ipRange${lanNumber}`] = lanData.ipRange || "";
          mappedData[`subnetMask${lanNumber}`] = lanData.subnetMask || "";
          mappedData[`defaultGateway${lanNumber}`] =
            lanData.defaultGateway || "";
          mappedData[`dnsServer${lanNumber}`] = lanData.dnsServer || "";
        });

        setLanSections(buildDhcpLanSections(lanPorts));
        setForm((prevForm) => ({
          ...prevForm,
          ...mappedData,
        }));
      } else {
        throw new Error(response?.message || "Failed to load DHCP settings");
      }
    } catch (error) {
      console.error("Error fetching DHCP settings:", error);
      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        setError(
          "Request timeout. Please check your connection and try again.",
        );
      } else if (error.response?.status === 404) {
        setError("DHCP configuration not found. Please contact administrator.");
      } else if (error.response?.status >= 500) {
        setError("Server error. Please try again later or contact support.");
      } else if (
        error.message?.includes("Network Error") ||
        error.message?.includes("Failed to fetch")
      ) {
        setError(
          "Network connection failed. Please check your internet connection.",
        );
      } else {
        setError(
          error.message ||
            "Failed to load DHCP settings. Please refresh the page and try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleReset = async () => {
    try {
      setError(null);
      setSuccess(null);
      setLoading(true);

      const response = await fetchResetDhcpSettings();

      if (response && response.success) {
        setSuccess(DHCP_SERVER_SUCCESS_RESET);
        await fetchDhcpData();
      } else {
        throw new Error(response?.message || "Failed to reset DHCP settings");
      }
    } catch (error) {
      console.error("Error resetting DHCP settings:", error);
      let errorMessage = "Failed to reset DHCP settings.";
      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        errorMessage =
          "Reset operation timed out. Please check your connection and try again.";
      } else if (error.response?.status >= 500) {
        errorMessage =
          "Server error during reset. Please try again later or contact support.";
      } else if (
        error.message?.includes("Network Error") ||
        error.message?.includes("Failed to fetch")
      ) {
        errorMessage =
          "Network connection failed during reset. Please check your connection.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccess(null);
      setLoading(true);

      const response = await fetchSaveDhcpSettings(
        buildSavePayload(form, lanSections),
      );

      if (response && response.success) {
        setSuccess(DHCP_SERVER_SUCCESS_SAVE);
      } else {
        throw new Error(response?.message || "Failed to save DHCP settings");
      }
    } catch (error) {
      console.error("Error saving DHCP settings:", error);
      let errorMessage = "Failed to save DHCP settings.";
      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        errorMessage =
          "Save operation timed out. Please check your connection and try again.";
      } else if (error.response?.status === 400) {
        errorMessage =
          "Invalid DHCP configuration. Please check your settings and try again.";
      } else if (error.response?.status >= 500) {
        errorMessage =
          "Server error during save. Please try again later or contact support.";
      } else if (
        error.message?.includes("Network Error") ||
        error.message?.includes("Failed to fetch")
      ) {
        errorMessage =
          "Network connection failed during save. Please check your connection.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const labelColWidth = isCompact ? 160 : DHCP_SERVER_LABEL_COL_WIDTH;

  const renderLanSection = (lanGroup, isFirst) => {
    const isEnabled = form[lanGroup.fields[0].name];

    return (
      <>
        <SectionHeading title={lanGroup.lan} isFirst={isFirst} />

        <div style={dhcpFieldGroupStyle}>
          <FieldRow
            name={lanGroup.fields[0].name}
            label={lanGroup.fields[0].label}
            labelColWidth={labelColWidth}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                minHeight: 32,
              }}
            >
              <Checkbox
                size="small"
                name={lanGroup.fields[0].name}
                checked={isEnabled || false}
                onChange={handleChange}
                sx={checkboxSx}
              />
              <span style={{ fontSize: 12, color: C.valueText }}>
                {DHCP_SERVER_ENABLE_LABEL}
              </span>
            </div>
          </FieldRow>

          {lanGroup.fields.slice(1).map((field) => (
            <FieldRow
              key={field.name}
              name={field.name}
              label={field.label}
              labelColWidth={labelColWidth}
              labelStyle={{
                opacity: isEnabled ? 1 : 0.6,
              }}
            >
              <input
                type="text"
                name={field.name}
                value={form[field.name] || ""}
                onChange={handleChange}
                disabled={!isEnabled}
                style={isEnabled ? inputStyle : disabledInputStyle}
                onFocus={isEnabled ? inputInteraction.onFocus : undefined}
                onBlur={isEnabled ? inputInteraction.onBlur : undefined}
                onMouseEnter={
                  isEnabled ? inputInteraction.onMouseEnter : undefined
                }
                onMouseLeave={
                  isEnabled ? inputInteraction.onMouseLeave : undefined
                }
              />
            </FieldRow>
          ))}
        </div>
      </>
    );
  };

  const renderLanGrid = () => {
    if (isCompact || lanSections.length <= 1) {
      return lanSections.map((lanGroup, idx) => (
        <div key={lanGroup.lan} style={dhcpLanColumnStyle(isCompact)}>
          {renderLanSection(lanGroup, idx === 0)}
        </div>
      ));
    }

    return (
      <>
        <div style={dhcpLanColumnStyle(isCompact)}>
          {renderLanSection(lanSections[0], true)}
        </div>
        <div
          className="dhcp-lan-divider"
          style={dhcpLanDividerCellStyle}
          aria-hidden="true"
        >
          <div style={dhcpLanDividerLineStyle} />
        </div>
        <div style={dhcpLanColumnStyle(isCompact)}>
          {renderLanSection(lanSections[1], true)}
        </div>
      </>
    );
  };

  return (
    <DhcpPageShell>
      {error && (
        <Alert
          severity="error"
          onClose={() => setError(null)}
          sx={dhcpFixedAlertSx}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          onClose={() => setSuccess(null)}
          sx={{
            ...dhcpFixedAlertSx,
            top: error ? 88 : 20,
          }}
        >
          {success}
        </Alert>
      )}

      <DhcpBreadcrumb />

      <div>
        <div style={dhcpTableContainerStyle}>
          <div style={dhcpHeaderStyle}>
            <span>{DHCP_SERVER_CARD_TITLE}</span>
          </div>

          <div style={dhcpContentStyle}>
            {loading && lanSections.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  minHeight: 400,
                  padding: "48px 32px",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <CircularProgress size={40} sx={{ color: C.accent }} />
                  <div
                    style={{
                      marginTop: 12,
                      fontSize: 13,
                      color: C.mutedText,
                      fontWeight: 500,
                    }}
                  >
                    {DHCP_SERVER_LOADING_TEXT}
                  </div>
                </div>
              </div>
            ) : (
              <form
                id="dhcp-settings-form"
                onSubmit={handleSave}
                style={{ display: "flex", flexDirection: "column", gap: 24 }}
              >
                {lanSections.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: 13,
                      color: C.mutedText,
                      padding: "24px 0",
                    }}
                  >
                    {DHCP_SERVER_EMPTY_MESSAGE}
                  </div>
                ) : (
                  <div
                    className="dhcp-lan-grid"
                    style={dhcpLanGridStyle(isCompact, lanSections.length)}
                  >
                    {renderLanGrid()}
                  </div>
                )}
              </form>
            )}
          </div>

          {(!loading || lanSections.length > 0) && (
            <div style={dhcpFooterStyle}>
              <Btn
                variant="cancel"
                type="button"
                onClick={handleReset}
                disabled={loading || lanSections.length === 0}
                style={dhcpFooterBtnStyle}
              >
                {loading ? DHCP_SERVER_BTN_RESETTING : DHCP_SERVER_BTN_RESET}
              </Btn>
              <Btn
                variant="primary"
                type="submit"
                form="dhcp-settings-form"
                disabled={loading || lanSections.length === 0}
                style={dhcpFooterBtnStyle}
              >
                {loading ? DHCP_SERVER_BTN_SAVING : DHCP_SERVER_BTN_SAVE}
              </Btn>
            </div>
          )}
        </div>
      </div>
    </DhcpPageShell>
  );
};

export default DhcpServerSettings;
