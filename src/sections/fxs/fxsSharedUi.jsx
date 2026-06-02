/**
 * FXS UI kit — same as route/num-manipulate kit with Routing Parameters border radii:
 * outer card 10px, toolbar/header top corners 20px.
 */
import {
  C,
  Btn,
  TH,
  tdStyle,
  checkboxSx,
  muiSelectSx,
  muiTextFieldSx,
  numManipulateCardStyle as baseCardStyle,
  numManipulateToolbarStyle as baseToolbarStyle,
  numManipulatePaginationStyle as basePaginationStyle,
} from "../numManipulate/numManipulateSharedUi";

export { C, Btn, TH, tdStyle, checkboxSx, muiSelectSx, muiTextFieldSx };

export const FXS_CARD_RADIUS = 10;
/** System Tools use 10px on card header corners (same as card) */
export const FXS_HEADER_RADIUS = 10;

/** @deprecated Use FXS_CARD_RADIUS — kept for imports that use CARD_RADIUS */
export const CARD_RADIUS = FXS_CARD_RADIUS;
export const HEADER_RADIUS = FXS_HEADER_RADIUS;

export const numManipulateCardStyle = {
  ...baseCardStyle,
  borderRadius: FXS_CARD_RADIUS,
};

export const numManipulateToolbarStyle = {
  ...baseToolbarStyle,
  borderTopLeftRadius: FXS_HEADER_RADIUS,
  borderTopRightRadius: FXS_HEADER_RADIUS,
};

export const numManipulatePaginationStyle = {
  ...basePaginationStyle,
  borderBottomLeftRadius: FXS_CARD_RADIUS,
  borderBottomRightRadius: FXS_CARD_RADIUS,
};

export function getBrowserZoomPercent() {
  const scale = window.visualViewport?.scale;
  if (typeof scale === "number" && scale > 0) {
    return Math.round(scale * 100);
  }
  return 100;
}

export function routeTableMinWidthForZoom(widePx) {
  const scale = window.visualViewport?.scale ?? 1;
  if (scale >= 1.15) return widePx;
  const zoomPct = getBrowserZoomPercent();
  return zoomPct >= 130 ? widePx : "100%";
}
