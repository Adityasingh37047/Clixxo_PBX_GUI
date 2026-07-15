export const speedDialEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

export const handleSpeedDialEditIconHover = (e, entering) => {
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

export const getSpeedDialRowBg = (isSelected, idx) =>
  isSelected ? "#e0f2fe" : idx % 2 === 1 ? "#f8fafc" : "#ffffff";
