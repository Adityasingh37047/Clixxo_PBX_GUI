/**
 * Route pages share the same UI kit as E1-PRI Num Manipulate / Route tables.
 * Re-export to avoid drift between modules.
 */

/** Browser zoom % — same detection as E1-PRI Route pages */
export function getBrowserZoomPercent() {
  const scale = window.visualViewport?.scale;
  if (typeof scale === "number" && scale > 0) {
    return Math.round(scale * 100);
  }
  return 100;
}

/** Horizontal scroll table width at 130%+ zoom (E1 uses scale >= 1.15 ≈ 115%+) */
export function routeTableMinWidthForZoom(widePx) {
  const scale = window.visualViewport?.scale ?? 1;
  if (scale >= 1.15) return widePx;
  const zoomPct = getBrowserZoomPercent();
  return zoomPct >= 130 ? widePx : "100%";
}

export {
  C,
  CARD_RADIUS,
  Btn,
  TH,
  tdStyle,
  checkboxSx,
  numManipulateCardStyle,
  numManipulateToolbarStyle,
  numManipulatePaginationStyle,
} from "../numManipulate/numManipulateSharedUi";

export { muiSelectSx, muiTextFieldSx } from "../shared/outlinedFieldUi";
