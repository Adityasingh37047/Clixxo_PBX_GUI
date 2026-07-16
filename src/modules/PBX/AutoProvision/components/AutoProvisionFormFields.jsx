import React from "react";
import {
  C,
  FOCUS_RING_SHADOW,
  OUTLINED_BORDER,
  OUTLINED_FOCUS,
} from "../../../../theme/pbxTokens";

export const AUTO_PROVISION_TOOLBAR_SEARCH_WIDTH = 160;

export const AutoProvisionToolbarSearchBar = ({
  value,
  onChange,
  onFocus,
  onBlur,
  onClear,
  placeholder,
  searchFocused,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 6,
      background: "#f8fafc",
      border: `1px solid ${searchFocused ? OUTLINED_FOCUS : OUTLINED_BORDER}`,
      borderRadius: 4,
      padding: "5px 10px",
      boxShadow: searchFocused ? FOCUS_RING_SHADOW : "none",
      transition: "border-color 0.15s ease, box-shadow 0.15s ease",
    }}
  >
    <span
      style={{
        fontSize: 12,
        color: searchFocused ? OUTLINED_FOCUS : C.mutedText,
      }}
    >
      🔍
    </span>
    <input
      type="text"
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      style={{
        border: "none",
        background: "transparent",
        fontSize: 11,
        color: C.valueText,
        outline: "none",
        width: AUTO_PROVISION_TOOLBAR_SEARCH_WIDTH,
      }}
    />
    {value ? (
      <span
        onClick={onClear}
        style={{
          fontSize: 11,
          color: C.mutedText,
          cursor: "pointer",
        }}
      >
        ✕
      </span>
    ) : null}
  </div>
);
