import { C } from "../../../../theme/pbxTokens";

export const yesNoCellStyle = (value) => ({
  color: value === "Yes" ? "#16a34a" : "#475569",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.01em",
  whiteSpace: "nowrap",
});

export const matchModeCellStyle = {
  color: C.valueText,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.01em",
  whiteSpace: "nowrap",
};

export const directionCellStyle = (direction) => ({
  color:
    direction === "Inbound"
      ? "#16a34a"
      : direction === "Outbound"
        ? C.accent
        : "#475569",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.01em",
  whiteSpace: "nowrap",
});

export const blockedListEditIconStyle = (disabled) => ({
  cursor: disabled ? "not-allowed" : "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: disabled ? 0.4 : 0.7,
  transition: "opacity 0.15s ease",
});

export const handleBlockedListEditIconHover = (e, entering, disabled) => {
  if (!disabled) e.currentTarget.style.opacity = entering ? "1" : "0.7";
};
