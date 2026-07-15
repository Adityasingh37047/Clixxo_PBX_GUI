import { tdStyle } from "../../../../components/common";

export const PCM_TRUNK_GROUP_TH_GAP = { padding: "8px 14px" };

export const routeTdStyle = {
  ...tdStyle,
  fontSize: 12,
  padding: "6px 8px",
  lineHeight: 1.2,
};

export const routeThExtra = {
  fontSize: 10.5,
  padding: "9px 8px",
  letterSpacing: "0.04em",
};

export const portFxsAdvancedEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

export const handlePortFxsAdvancedEditIconHover = (e, entering) => {
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

export const getPortFxsAdvancedRowBg = (idx) =>
  idx % 2 === 1 ? "#f8fafc" : "#ffffff";
