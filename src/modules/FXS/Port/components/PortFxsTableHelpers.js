import { tdStyle, extensionPaginationStyle as fxsPaginationStyle } from "../../../../components/common";
import { C } from "../../../../theme/pbxTokens";



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

export const tableSectionBorder = `1px solid ${C.divider}`;

export const portFxsPaginationStyle = fxsPaginationStyle;

export const portFxsEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

export const handlePortFxsEditIconHover = (e, entering) => {
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

export const getPortFxsRowBg = (idx) => (idx % 2 === 1 ? "#f8fafc" : "#ffffff");

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

export const getPortFxsRegStatusBadgeStyle = (regStatus) => {
  const s = String(regStatus || "").toLowerCase();
  const registered = s === "registered";
  return {
    display: "inline-block",
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: "nowrap",
    ...(registered
      ? { color: "#16a34a", background: "none", border: "none" }
      : {
          padding: "2px 10px",
          borderRadius: 999,
          background: "#f3f4f6",
          color: "#6b7280",
          border: "1px solid #d1d5db",
        }),
  };
};

export const formatPortFxsRegStatusLabel = (regStatus) => regStatus || "—";
