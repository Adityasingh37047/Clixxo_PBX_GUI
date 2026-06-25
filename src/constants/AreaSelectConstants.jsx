// Area options for Area Select page
export const AREA_OPTIONS = [
  { value: '0', label: 'Default' },
  { value: '1', label: 'Australia' },
];

// Initial form data
export const AREA_SELECT_INITIAL_FORM = {
  areaSelect: '0', // Default
};

/** Area Select page */
export const AREA_SELECT_FIELD_TOOLTIPS = {
  areaSelect:
    "Regional parameter profile applied to FXS advanced settings.\n" +
    "State key: areaSelect. Dropdown options: 0 Default, 1 Australia.\n" +
    "Default on load: 0 (Default). Saved when Save is clicked.",
};
