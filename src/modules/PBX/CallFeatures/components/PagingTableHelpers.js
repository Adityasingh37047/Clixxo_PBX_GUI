import { C } from "../../../../theme/pbxTokens";

export const pagingEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

export const handlePagingEditIconHover = (e, entering) => {
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

export const formatPagingMembersDisplay = (members, getExtLabel) => {
  const list = members || [];
  const display = list
    .slice(0, 3)
    .map(getExtLabel)
    .join(", ");
  const overflow = list.length > 3 ? ` +${list.length - 3}` : "";
  return `${display}${overflow}`;
};

/** Selected row bg differs from getExtensionRowBg (#eff6ff) — keep page-local. */
export const getPagingRowBg = (isSelected, idx) =>
  isSelected ? "#e0f2fe" : idx % 2 === 1 ? "#f8fafc" : "#ffffff";

export const pagingNumberBadgeStyle = {
  color: C.valueText,
  padding: "4px 11px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.01em",
  whiteSpace: "nowrap",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};
