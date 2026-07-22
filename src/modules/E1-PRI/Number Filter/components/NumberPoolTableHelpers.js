import {
  EXTENSION_TABLE_CARD_RADIUS as NUMBER_POOL_CARD_RADIUS,
  extensionPageInnerStyle as numberPoolPageInnerStyle,
  extensionPageWrapStyle as numberPoolPageWrapStyle,
  extensionPaginationStyle as numberPoolFooterStyle,
  extensionSelectedBadgeStyle as numberPoolSelectedBadgeStyle,
  getExtensionRowBg as getNumberPoolRowBg,
} from "../../../../components/common";

export {
  NUMBER_POOL_CARD_RADIUS,
  numberPoolPageInnerStyle,
  numberPoolPageWrapStyle,
  numberPoolFooterStyle,
  numberPoolSelectedBadgeStyle,
  getNumberPoolRowBg,
};

export const getNumberPoolEditIconStyle = (isDeleting) => ({
  cursor: isDeleting ? "not-allowed" : "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: isDeleting ? 0.4 : 0.7,
  transition: "opacity 0.15s ease",
});

export const handleNumberPoolEditIconHover = (
  e,
  entering,
  isDeleting = false,
) => {
  if (isDeleting) return;
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

export const numberPoolTableScrollStyle = {
  overflowX: "auto",
  overflowY: "auto",
  flex: 1,
};
