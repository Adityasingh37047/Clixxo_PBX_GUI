export const privateGroupEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

export const handlePrivateGroupEditIconHover = (e, entering) => {
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

export const privateGroupEnabledCellStyle = (enabled) => ({
  color: enabled === "Yes" ? "#16a34a" : "#475569",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.01em",
  whiteSpace: "nowrap",
});

/** Selected row bg differs from getExtensionRowBg (#eff6ff) — keep page-local. */
export const getPrivateGroupRowBg = (isSelected, idx) =>
  isSelected ? "#e0f2fe" : idx % 2 === 1 ? "#f8fafc" : "#ffffff";
