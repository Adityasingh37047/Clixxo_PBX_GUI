import React, { useRef, useState, useLayoutEffect } from "react";
import { CircularProgress, Tabs, Tab } from "@mui/material";
import {
  OUTLINED_BORDER,
  OUTLINED_HOVER,
  OUTLINED_FOCUS,
} from "./outlinedFieldUi";

/** Shared palette — matches E1-PRI Num Manipulate pages */
export const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#9CA3AF",
  labelText: "#3E5475",
  valueText: "#0f172a",
  mutedText: "#94a3b8",
  strongText: "#0f172a",
  accent: "#3E5475",
  amber: "#dc2626",
};

export const CARD_RADIUS = 20;

export const Btn = ({
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
      fontSize: 15,
      textTransform: "none",
      padding: "6px 28px",
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
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.background = baseBg;
      }}
    >
      {children}
    </Component>
  );
};

/** PBX modal Close / Cancel — matches Add Extension */
export const pbxModalCancelBtnStyle = {
  minWidth: 100,
  height: 33,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

export const TH = ({ children, style: extra }) => (
  <th
    style={{
      background: "#F8FAFC",
      color: C.labelText,
      fontWeight: 700,
      fontSize: 11,
      padding: "9px 14px",
      textAlign: "center",
      borderBottom: `1px solid ${C.cardBorder}`,
      borderRight: `1px solid ${C.cardBorder}`,
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.14em",
      position: "sticky",
      top: 0,
      zIndex: 10,
      ...extra,
    }}
  >
    {children}
  </th>
);

export const tdStyle = {
  padding: "7px 14px",
  fontSize: 13,
  color: C.valueText,
  textAlign: "center",
  borderBottom: `1px solid ${C.cardBorder}`,
  borderRight: `1px solid ${C.cardBorder}`,
  whiteSpace: "nowrap",
};

/** MUI checkbox — same on FXS Advanced tables and forms (System Tools kit) */
export const checkboxSx = {
  padding: "4px",
  color: "#64748b",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
  "& .MuiSvgIcon-root": {
    fontSize: 18,
  },
};

export { muiSelectSx } from "./outlinedFieldUi";

export const muiTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#fff",
    "& fieldset": {
      borderColor: C.cardBorder,
      transition: "border-color 0.2s ease",
    },
    "&:hover fieldset": {
      borderColor: "#64748b",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#0284c7",
      borderWidth: 1,
    },
    "&.Mui-focused:hover fieldset": {
      borderColor: "#0284c7",
      borderWidth: 1,
    },
  },
};

export const numManipulateCardStyle = {
  background: "#ffffff",
  borderRadius: CARD_RADIUS,
  overflow: "hidden",
  border: `1.5px solid ${C.cardBorder}`,
  boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
};

export const numManipulateToolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.cardBorder}`,
  background: "#ffffff",
  flexWrap: "wrap",
  gap: 12,
  borderTopLeftRadius: CARD_RADIUS,
  borderTopRightRadius: CARD_RADIUS,
};

export const numManipulatePaginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.cardBorder}`,
  borderBottomLeftRadius: CARD_RADIUS,
  borderBottomRightRadius: CARD_RADIUS,
  overflow: "hidden",
};

/** PBX list/form pages — breadcrumb (matches SIP Register / System Settings) */
export const pbxBreadcrumbStyle = {
  fontSize: 12,
  color: C.mutedText,
  marginBottom: 16,
  fontWeight: 400,
  display: "flex",
  alignItems: "center",
  gap: 4,
  flexWrap: "wrap",
};

export const PbxBreadcrumb = ({ section, current, style }) => (
  <div style={{ ...pbxBreadcrumbStyle, ...style }}>
    <span>PBX</span>
    <span>&gt;</span>
    <span>{section}</span>
    <span>&gt;</span>
    <span style={{ color: C.strongText, fontWeight: 600 }}>{current}</span>
  </div>
);

/** Multi-segment breadcrumb for CDR, Status, and other non-PBX sections */
export const PageBreadcrumb = ({ segments, style }) => (
  <div style={{ ...pbxBreadcrumbStyle, ...style }}>
    {segments.map((label, index) => (
      <React.Fragment key={`${label}-${index}`}>
        {index > 0 ? <span>&gt;</span> : null}
        <span
          style={
            index === segments.length - 1
              ? { color: C.strongText, fontWeight: 600 }
              : undefined
          }
        >
          {label}
        </span>
      </React.Fragment>
    ))}
  </div>
);

export const pbxPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

export const pbxPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

/** PCM PSTN-style table list loading (first load) */
export const TableListLoading = () => (
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

/** PCM PSTN-style empty table list */
export const TableListEmptyState = ({
  message,
  onAddNew,
  buttonLabel = "+ Add New",
  showButton = true,
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 240,
      padding: 24,
      textAlign: "center",
    }}
  >
    <div
      style={{
        color: "#3E5475",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: showButton && onAddNew ? 16 : 0,
      }}
    >
      {message}
    </div>
    {showButton && onAddNew ? (
      <Btn
        variant="cancel"
        onClick={onAddNew}
        style={{ padding: "8px 24px", fontSize: 12, borderRadius: 6 }}
      >
        {buttonLabel}
      </Btn>
    ) : null}
  </div>
);

/** PBX tables — show first N items, then "...." when list exceeds threshold */
export const PBX_LIST_TRUNCATE_THRESHOLD = 10;
export const PBX_LIST_DISPLAY_LIMIT = 6;

export const formatPbxItemListDisplay = (
  items,
  {
    threshold = PBX_LIST_TRUNCATE_THRESHOLD,
    limit = PBX_LIST_DISPLAY_LIMIT,
    mapItem = (x) => String(x),
    separator = ", ",
    ellipsis = "....",
  } = {},
) => {
  if (!items?.length) return "";
  const labels = items.map(mapItem).filter((v) => v !== "" && v != null);
  if (!labels.length) return "";
  if (labels.length <= threshold) {
    return labels.join(separator);
  }
  return `${labels.slice(0, limit).join(separator)}${ellipsis}`;
};

/** PBX Add/Edit modals — tab bar (Extensions, SIP Register, etc.) */
export const PBX_MODAL_TAB_BAR_STYLE = {
  borderBottom: "1px solid #e5e7eb",
  background: "#ffffff",
};

export const PBX_MODAL_TAB_ACTIVE_COLOR = "#3E5475";
export const PBX_MODAL_TAB_INACTIVE_COLOR = "#374151";

/** Modal / card header tabs — inactive 500, active 700 for clear open state */
export const pbxModalTabsSx = {
  minHeight: 45,
  "& .MuiTab-root": {
    color: PBX_MODAL_TAB_INACTIVE_COLOR,
    fontSize: 12,
    fontWeight: 500,
    textTransform: "none",
    minHeight: 45,
  },
  "& .MuiTab-root.Mui-selected": {
    color: PBX_MODAL_TAB_ACTIVE_COLOR,
    fontWeight: 700,
  },
};

export const pbxHeaderTabsSx = {
  minHeight: 44,
  pl: 0,
  "& .MuiTabs-flexContainer": { height: 44, paddingLeft: 0 },
  "& .MuiTab-root": {
    color: PBX_MODAL_TAB_INACTIVE_COLOR,
    fontSize: 12,
    fontWeight: 500,
    textTransform: "none",
    minHeight: 44,
    py: 0,
    px: 1.25,
    minWidth: 0,
  },
  "& .MuiTab-root.Mui-selected": {
    color: PBX_MODAL_TAB_ACTIVE_COLOR,
    fontWeight: 700,
  },
};

/** MUI Tabs — gray ripple on click (original Add Extension behavior) */
export const PbxModalTabs = ({ value, onChange, tabs, fullWidth = true }) => (
  <div style={PBX_MODAL_TAB_BAR_STYLE}>
    <Tabs
      value={value}
      onChange={(_, next) => onChange(next)}
      variant={fullWidth ? "fullWidth" : "standard"}
      TabIndicatorProps={{
        style: { backgroundColor: PBX_MODAL_TAB_ACTIVE_COLOR, height: 2 },
      }}
      sx={pbxModalTabsSx}
    >
      {tabs.map((t) => (
        <Tab key={t.id} label={t.label} value={t.id} />
      ))}
    </Tabs>
  </div>
);

export const PBX_MODAL_SECTION_BG = "#f8fafc";
export const PBX_MODAL_SECTION_HEADING_COLOR = "#30415A";

/** Section headings inside modal tabs — General, VoIP Settings, etc. */
export const PbxModalSectionHeading = ({ title, isFirst = false }) => (
  <div
    style={{
      margin: isFirst ? "0 0 24px 0" : "16px 0 24px 0",
      position: "relative",
      width: "100%",
    }}
  >
    <div style={{ borderTop: `1px solid ${C.cardBorder}` }} />
    <span
      style={{
        position: "absolute",
        top: -10,
        left: 0,
        background: PBX_MODAL_SECTION_BG,
        paddingRight: 8,
        fontSize: 14,
        fontWeight: 600,
        color: PBX_MODAL_SECTION_HEADING_COLOR,
      }}
    >
      {title}
    </span>
  </div>
);

export const PBX_DUAL_LIST_LABEL_COLOR = "#3E5475";

export const pbxDualListLabelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: PBX_DUAL_LIST_LABEL_COLOR,
  textAlign: "center",
  marginBottom: 8,
};

export const pbxDualListSelectStyle = {
  width: "100%",
  height: 160,
  border: `1px solid ${C.cardBorder}`,
  background: "#fff",
  borderRadius: 4,
  padding: "4px 8px",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
  overflowY: "auto",
};

const pbxDualListBtnStyle = {
  height: 36,
  width: "100%",
  border: "1px solid #6b7280",
  backgroundColor: "#d9dde3",
  color: "#111827",
  fontSize: 14,
  fontWeight: 600,
  fontFamily: "inherit",
  lineHeight: 1,
  padding: 0,
  margin: 0,
  cursor: "pointer",
  display: "block",
  boxSizing: "border-box",
  textAlign: "center",
};

const pbxDualListReorderBtnStyle = {
  ...pbxDualListBtnStyle,
  fontWeight: 400,
};

/** Transfer / reorder buttons — Media Parameters CODEC Priority style */
export const PbxDualListBtn = ({ onClick, title, children, reorder = false }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    style={reorder ? pbxDualListReorderBtnStyle : pbxDualListBtnStyle}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = "#c5cbd3";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = "#d9dde3";
    }}
  >
    {children}
  </button>
);

const PBX_TOOLBAR_SEARCH_HEIGHT = 30;
const PBX_TOOLBAR_SEARCH_WIDTH = 168;
const PBX_TOOLBAR_SEARCH_FOCUS_RING = `0 0 0 1px ${OUTLINED_FOCUS}`;
const PBX_TOOLBAR_SEARCH_INPUT_FONT = {
  fontSize: 12,
  fontFamily: "Inter, sans-serif",
  letterSpacing: "normal",
};

/** PBX Status / monitor toolbar search — unified size + outlined hover/focus borders */
export const PbxToolbarSearchBar = ({
  value,
  onChange,
  placeholder = "Search...",
  width = PBX_TOOLBAR_SEARCH_WIDTH,
  fitPlaceholder = false,
}) => {
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const measureRef = useRef(null);
  const [fitWidth, setFitWidth] = useState(null);

  useLayoutEffect(() => {
    if (!fitPlaceholder || !measureRef.current) return;
    measureRef.current.textContent = value || placeholder;
    setFitWidth(measureRef.current.offsetWidth);
  }, [fitPlaceholder, placeholder, value]);

  const setDefault = () => {
    const el = wrapRef.current;
    if (!el) return;
    el.style.borderColor = OUTLINED_BORDER;
    el.style.boxShadow = "none";
  };

  const setHover = () => {
    const el = wrapRef.current;
    if (!el || document.activeElement === inputRef.current) return;
    el.style.borderColor = OUTLINED_HOVER;
    el.style.boxShadow = "none";
  };

  const setFocus = () => {
    const el = wrapRef.current;
    if (!el) return;
    el.style.borderColor = OUTLINED_FOCUS;
    el.style.boxShadow = PBX_TOOLBAR_SEARCH_FOCUS_RING;
  };

  const handleMouseLeave = () => {
    if (document.activeElement === inputRef.current) setFocus();
    else setDefault();
  };

  const inputWidth = fitPlaceholder && fitWidth != null ? fitWidth : null;

  return (
    <div
      ref={wrapRef}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        height: PBX_TOOLBAR_SEARCH_HEIGHT,
        boxSizing: "border-box",
        background: "#ffffff",
        border: `1px solid ${OUTLINED_BORDER}`,
        borderRadius: 10,
        padding: fitPlaceholder ? "0 8px" : "0 10px",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        width: fitPlaceholder ? "fit-content" : width,
        minWidth: fitPlaceholder ? "auto" : width,
        flexShrink: 0,
        position: "relative",
      }}
      onMouseEnter={setHover}
      onMouseLeave={handleMouseLeave}
    >
      {fitPlaceholder ? (
        <span
          ref={measureRef}
          aria-hidden
          style={{
            position: "absolute",
            visibility: "hidden",
            whiteSpace: "pre",
            pointerEvents: "none",
            ...PBX_TOOLBAR_SEARCH_INPUT_FONT,
          }}
        />
      ) : null}
      <span style={{ fontSize: 12, color: C.mutedText, flexShrink: 0 }}>🔍</span>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={onChange}
        onFocus={setFocus}
        onBlur={setDefault}
        placeholder={placeholder}
        style={{
          border: "none",
          background: "transparent",
          outline: "none",
          width: inputWidth ?? "100%",
          minWidth: inputWidth ?? 0,
          maxWidth: inputWidth ?? undefined,
          padding: 0,
          margin: 0,
          ...PBX_TOOLBAR_SEARCH_INPUT_FONT,
          color: C.valueText,
        }}
      />
      {value ? (
        <span
          role="button"
          tabIndex={0}
          onClick={() => onChange({ target: { value: "" } })}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onChange({ target: { value: "" } });
            }
          }}
          style={{
            fontSize: 11,
            color: C.mutedText,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          ✕
        </span>
      ) : null}
    </div>
  );
};
