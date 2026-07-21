import { C } from "../../../../theme/pbxTokens";

export const delayCellStyle = {
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

export const throughCellStyle = (row) => ({
  color: row.throughAuto
    ? "#16a34a"
    : row.throughFromComeIn
      ? C.accent
      : "#475569",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.01em",
  whiteSpace: "nowrap",
});

export const renderThrough = (row) => {
  const labels = [];
  if (row.throughAuto) labels.push("Auto");
  if (row.throughFromComeIn) labels.push("From Come in");
  if (row.throughSelect) labels.push("Select");
  return labels.join(", ") || "Auto";
};

export const callBackEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

export const handleCallBackEditIconHover = (e, entering) => {
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

/** Selected row bg differs from getExtensionRowBg (#eff6ff) — keep page-local. */
export const getCallBackRowBg = (isSelected, idx) =>
  isSelected ? "#e0f2fe" : idx % 2 === 1 ? "#f8fafc" : "#ffffff";
