/** Shared card header / toolbar — same button top/bottom gap as Hosts (7px padding + 30px btn in 44px bar) */

export const CARD_TOOLBAR_BORDER = "#9CA3AF";

export const cardToolbarStyle = {
  minHeight: 44,
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  borderBottom: `1px solid ${CARD_TOOLBAR_BORDER}`,
  background: "#ffffff",
};

export const cardToolbarTitleStyle = {
  fontSize: 13,
  fontWeight: 700,
  color: "#3E5475",
  letterSpacing: "0.02em",
};

export const cardToolbarActionsStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
};

/** Use on toolbar Btn / header buttons for consistent height */
export const cardToolbarButtonStyle = {
  height: 30,
};

/** Merge into page `blueBarStyle` for Maintenance → System Tool headers */
export const systemToolBlueBarPadding = {
  minHeight: 44,
  padding: "7px 14px",
  flexWrap: "wrap",
  gap: 12,
};
