import { useRef, useState, useLayoutEffect } from "react";
import {
  C,
  OUTLINED_BORDER,
  OUTLINED_HOVER,
  OUTLINED_FOCUS,
  FOCUS_RING_SHADOW,
} from "../../theme/pbxTokens";

const EXTENSION_TOOLBAR_SEARCH_HEIGHT = 30;
const EXTENSION_TOOLBAR_SEARCH_WIDTH = 168;
const EXTENSION_SEARCH_ICON_SLOT = 18;
const EXTENSION_SEARCH_BAR_PADDING_FIT = 16;
const EXTENSION_SEARCH_BAR_PADDING_DEFAULT = 20;
const EXTENSION_TOOLBAR_SEARCH_FOCUS_RING = FOCUS_RING_SHADOW;
const EXTENSION_TOOLBAR_SEARCH_INPUT_FONT = {
  fontSize: 12,
  fontFamily: "Inter, sans-serif",
  letterSpacing: "normal",
};

const ExtensionToolbarSearchBar = ({
  value,
  onChange,
  style = {},
  placeholder = "Search...",
  width = EXTENSION_TOOLBAR_SEARCH_WIDTH,
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

  const resolvedWidth = fullWidth
    ? "100%"
    : fitPlaceholder && placeholderWidth != null
      ? placeholderWidth + EXTENSION_SEARCH_BAR_PADDING_FIT + EXTENSION_SEARCH_ICON_SLOT
      : width;

  const horizontalPadding = fitPlaceholder
    ? EXTENSION_SEARCH_BAR_PADDING_FIT / 2
    : EXTENSION_SEARCH_BAR_PADDING_DEFAULT / 2;

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
    el.style.boxShadow = EXTENSION_TOOLBAR_SEARCH_FOCUS_RING;
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
        height: EXTENSION_TOOLBAR_SEARCH_HEIGHT,
        boxSizing: "border-box",
        background: "#f8fafc",
        border: `1px solid ${OUTLINED_BORDER}`,
        borderRadius: 10,
        padding: `0 ${horizontalPadding}px`,
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        width: resolvedWidth,
        minWidth: fullWidth ? 0 : resolvedWidth,
        maxWidth: fullWidth ? "100%" : resolvedWidth,
        flex: fullWidth ? 1 : undefined,
        flexShrink: fullWidth ? 1 : 0,
        position: "relative",
        ...style,
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
            ...EXTENSION_TOOLBAR_SEARCH_INPUT_FONT,
          }}
        />
      ) : null}
      <span style={{ fontSize: 12, color: C.mutedText, flexShrink: 0 }}>
        🔍
      </span>
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
          ...EXTENSION_TOOLBAR_SEARCH_INPUT_FONT,
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

export { ExtensionToolbarSearchBar };
