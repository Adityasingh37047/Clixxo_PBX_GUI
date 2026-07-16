/** Selected row bg differs from getExtensionRowBg (#eff6ff) — keep page-local. */
export const getAutoProvisionRowBg = (idx, isSelected) => {
  if (isSelected) return "#e0f2fe";
  return idx % 2 === 1 ? "#f8fafc" : "#ffffff";
};

export const AUTO_PROVISION_ROW_HOVER_BG = "#f1f5f9";

export const handleAutoProvisionRowHover = (e, entering, isSelected, rowBg) => {
  if (!isSelected) {
    e.currentTarget.style.background = entering
      ? AUTO_PROVISION_ROW_HOVER_BG
      : rowBg;
  }
};
