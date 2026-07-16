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

export const portGroupEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

export const handlePortGroupEditIconHover = (e, entering) => {
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

export const getPortGroupRowBg = (isSelected, idx) =>
  isSelected ? "#f0f9ff" : idx % 2 === 1 ? "#f8fafc" : "#ffffff";

export const getBrowserZoomPercent = () => {
  const scale = window.visualViewport?.scale;
  if (typeof scale === "number" && scale > 0) {
    return Math.round(scale * 100);
  }
  return 100;
};

export const routeTableMinWidthForZoom = (widePx) => {
  const scale = window.visualViewport?.scale ?? 1;
  if (scale >= 1.15) return widePx;
  const zoomPct = getBrowserZoomPercent();
  return zoomPct >= 130 ? widePx : "100%";
};
