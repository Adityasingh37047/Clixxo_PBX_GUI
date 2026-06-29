export const AREA_SELECT_PAGE_BREADCRUMB_ROOT = "FXS";
export const AREA_SELECT_PAGE_BREADCRUMB_SECTION = "Advanced";
export const AREA_SELECT_PAGE_TITLE = "Area Select";
export const AREA_SELECT_CARD_TITLE = "Select Area for Parameters";

export const AREA_SELECT_SAVE_LABEL = "Save";

export const AREA_OPTIONS = [
  { value: "0", label: "Default" },
  { value: "1", label: "Australia" },
];

export const AREA_SELECT_FIELDS = [
  {
    label: "Area Parameters",
    key: "areaSelect",
    type: "select",
    options: AREA_OPTIONS,
    default: "0",
  },
];

export const AREA_SELECT_INITIAL_FORM = AREA_SELECT_FIELDS.reduce((acc, field) => {
  acc[field.key] = field.default;
  return acc;
}, {});

/** Area Select page */
export const AREA_SELECT_FIELD_TOOLTIPS = {
  areaSelect:
    "Regional parameter profile applied to FXS advanced settings.\n" +
    "State key: areaSelect. Dropdown options: 0 Default, 1 Australia.\n" +
    "Default on load: 0 (Default). Saved when Save is clicked.",
};
