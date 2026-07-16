export const enableDisableCellStyle = (value) => ({
  color: value === "Enable" ? "#16a34a" : "#dc2626",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.01em",
  whiteSpace: "nowrap",
});

export const disaEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

export const handleDisaEditIconHover = (e, entering) => {
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

/** Selected row bg differs from getExtensionRowBg (#eff6ff) — keep page-local. */
export const getDisaRowBg = (isSelected, idx) =>
  isSelected ? "#e0f2fe" : idx % 2 === 1 ? "#f8fafc" : "#ffffff";
