export const pickupGroupEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

export const handlePickupGroupEditIconHover = (e, entering) => {
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

export const formatPickupGroupMembersDisplay = (members, getExtLabel) => {
  const list = members || [];
  const display = list
    .slice(0, 4)
    .map(getExtLabel)
    .join(", ");
  const overflow = list.length > 4 ? ` +${list.length - 4}` : "";
  return `${display}${overflow}`;
};

export const getPickupGroupRowBg = (isSelected, idx) =>
  isSelected ? "#e0f2fe" : idx % 2 === 1 ? "#f8fafc" : "#ffffff";
