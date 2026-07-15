import React, { useLayoutEffect, useRef, useState } from "react";
import { ExtensionBreadcrumb } from "../../../../components/common";
import { PBX_MONITOR_BREADCRUMB_SEGMENTS } from "../../../../constants/PbxMonitorConstants";
import {
  C,
  OUTLINED_BORDER,
  OUTLINED_FOCUS,
  OUTLINED_HOVER,
} from "../../../../theme/pbxTokens";
import {
  CARD_RADIUS,
  PBX_MONITOR_SEARCH_BAR_PADDING_DEFAULT,
  PBX_MONITOR_SEARCH_BAR_PADDING_FIT,
  PBX_MONITOR_STAT_CARD_SHADOW,
  PBX_MONITOR_TOOLBAR_SEARCH_FOCUS_RING,
  PBX_MONITOR_TOOLBAR_SEARCH_HEIGHT,
  PBX_MONITOR_TOOLBAR_SEARCH_INPUT_FONT,
  PBX_MONITOR_TOOLBAR_SEARCH_WIDTH,
  PBX_MONITOR_SEARCH_ICON_SLOT,
  STATUS_BADGE_WIDTH,
  tdStyle,
} from "./PbxMonitorTableHelpers";

export const PbxMonitorBreadcrumb = ({ style } = {}) => (
  <ExtensionBreadcrumb
    root={PBX_MONITOR_BREADCRUMB_SEGMENTS[0]}
    section={PBX_MONITOR_BREADCRUMB_SEGMENTS[1]}
    current={PBX_MONITOR_BREADCRUMB_SEGMENTS[2]}
    style={style}
  />
);

export const PbxMonitorToolbarSearchBar = ({
  value,
  onChange,
  placeholder = "Search...",
  width = PBX_MONITOR_TOOLBAR_SEARCH_WIDTH,
  fitPlaceholder = false,
  fullWidth = false,
}) => {
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const measureRef = useRef(null);
  const [placeholderWidth, setPlaceholderWidth] = useState(null);

  useLayoutEffect(() => {
    if (!fitPlaceholder || !measureRef.current) return;
    measureRef.current.textContent = placeholder;
    setPlaceholderWidth(measureRef.current.offsetWidth);
  }, [fitPlaceholder, placeholder]);

  const resolvedWidth =
    fullWidth
      ? "100%"
      : fitPlaceholder && placeholderWidth != null
        ? placeholderWidth + PBX_MONITOR_SEARCH_BAR_PADDING_FIT + PBX_MONITOR_SEARCH_ICON_SLOT
        : width;

  const horizontalPadding = fitPlaceholder
    ? PBX_MONITOR_SEARCH_BAR_PADDING_FIT / 2
    : PBX_MONITOR_SEARCH_BAR_PADDING_DEFAULT / 2;

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
    el.style.boxShadow = PBX_MONITOR_TOOLBAR_SEARCH_FOCUS_RING;
  };

  const handleMouseLeave = () => {
    if (document.activeElement === inputRef.current) setFocus();
    else setDefault();
  };

  return (
    <div
      ref={wrapRef}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        height: PBX_MONITOR_TOOLBAR_SEARCH_HEIGHT,
        boxSizing: "border-box",
        background: "#f8fafc",
        border: `1px solid ${OUTLINED_BORDER}`,
        borderRadius: 4,
        padding: `0 ${horizontalPadding}px`,
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        width: resolvedWidth,
        minWidth: fullWidth ? 0 : resolvedWidth,
        maxWidth: fullWidth ? "100%" : resolvedWidth,
        flex: fullWidth ? 1 : undefined,
        flexShrink: fullWidth ? 1 : 0,
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
            ...PBX_MONITOR_TOOLBAR_SEARCH_INPUT_FONT,
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
          flex: 1,
          minWidth: 0,
          width: 0,
          padding: 0,
          paddingRight: value ? 14 : 0,
          margin: 0,
          ...PBX_MONITOR_TOOLBAR_SEARCH_INPUT_FONT,
          color: C.valueText,
        }}
      />
      <span
        role="button"
        tabIndex={value ? 0 : -1}
        aria-hidden={!value}
        onClick={() => {
          if (!value) return;
          onChange({ target: { value: "" } });
        }}
        onKeyDown={(e) => {
          if (!value) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onChange({ target: { value: "" } });
          }
        }}
        style={{
          position: "absolute",
          right: horizontalPadding,
          top: "50%",
          transform: "translateY(-50%)",
          fontSize: 11,
          color: C.mutedText,
          cursor: value ? "pointer" : "default",
          visibility: value ? "visible" : "hidden",
          lineHeight: 1,
        }}
      >
        ✕
      </span>
    </div>
  );
};

export const StatCard = ({ label, value, accent, ready }) => (
  <div
    style={{
      background: "#ffffff",
      borderRadius: CARD_RADIUS,
      padding: "8px 12px",
      minHeight: 52,
      border: `1px solid ${C.cardBorder}`,
      borderLeft: `3px solid ${accent}`,
      boxShadow: PBX_MONITOR_STAT_CARD_SHADOW,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      gap: 4,
    }}
  >
    <span
      style={{
        fontSize: 10,
        color: C.labelText,
        fontWeight: 600,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        lineHeight: 1.2,
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontSize: 20,
        fontWeight: 700,
        lineHeight: 1,
        color: ready ? accent : C.mutedText,
      }}
    >
      {ready ? value : "—"}
    </span>
  </div>
);

export const StatusBadge = ({ tone, text }) => {
  const colors = {
    ok: {
      color: C.successGreen,
      dot: C.successGreen,
    },
    bad: {
      color: C.errorRed,
      dot: C.errorRed,
    },
    neutral: {
      // bg: "#f1f5f9",
      color: "#64748b",
      dot: "#94a3b8",
    },
  };

  const s = colors[tone] || colors.neutral;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 6,
        boxSizing: "border-box",
        width: STATUS_BADGE_WIDTH,
        minWidth: STATUS_BADGE_WIDTH,
        background: s.bg,
        color: s.color,
        padding: "4px 11px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.01em",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: s.dot,
        }}
      />
      {text}
    </span>
  );
};

export const TypePill = ({ text }) => (
  <span
    style={{
      // background: "#eff6ff",
      color: C.accent,
      // border: `1px solid ${C.accent}`,
      padding: "4px 11px",
      borderRadius: 999,
      fontWeight: 700,
      fontSize: 11,
      letterSpacing: "0.01em",
      whiteSpace: "nowrap",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: 72,
    }}
  >
    {text}
  </span>
);

export const TD = ({ children, align = "center", mono, style: extra, bg }) => (
  <td
    style={{
      ...tdStyle,
      textAlign: align,
      fontFamily: mono ? "monospace" : "inherit",
      fontWeight: 400,
      ...(bg != null ? { background: bg } : {}),
      ...extra,
    }}
  >
    {children || <span style={{ color: C.mutedText }}>—</span>}
  </td>
);
