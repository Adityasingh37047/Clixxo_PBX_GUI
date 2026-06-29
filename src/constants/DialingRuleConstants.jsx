export const DIALING_RULE_PAGE_BREADCRUMB_ROOT = "FXS";
export const DIALING_RULE_PAGE_BREADCRUMB_SECTION = "Advanced";
export const DIALING_RULE_PAGE_TITLE = "Dialing Rule";
export const DIALING_RULE_CARD_TITLE = "Dialing Rule";
export const DIALING_RULE_EMPTY_MESSAGE = "No available dialing rule!";
export const DIALING_RULE_ITEMS_PER_PAGE = 20;
export const DIALING_RULE_MODAL_TITLE_ADD = "Add Dialing Rule";
export const DIALING_RULE_MODAL_TITLE_EDIT = "Edit Dialing Rule";

// Table columns for the main table view
export const DIALING_RULE_TABLE_COLUMNS = [
  { key: 'check', label: 'Check' },
  { key: 'index', label: 'ID' },
  { key: 'dialingRule', label: 'Dialing Rule' },
  { key: 'description', label: 'Description' },
  { key: 'modify', label: 'Modify' },
];

// Form fields for the modal
export const DIALING_RULE_MODAL_FIELDS = [
  { name: 'index', label: 'Index:', type: 'number-select' },
  { name: 'description', label: 'Description:', type: 'text' },
  { name: 'dialingRule', label: 'Dialing Rule:', type: 'text' },
];

// Initial form state for the modal
export const DIALING_RULE_INITIAL_FORM = {
  index: '',
  description: 'default',
  dialingRule: '',
};

// Initial data (20 rows with index 80-99)
export const DIALING_RULE_INITIAL_DATA = [
  // { id: 1, index: 80, dialingRule: 'xxx#', description: 'default' },
  // { id: 2, index: 81, dialingRule: '400xxxxxxx', description: 'default' },
  // { id: 3, index: 82, dialingRule: '40[1-9]xxxxx', description: 'default' },
  // { id: 4, index: 83, dialingRule: '4[1-9]xxxxxx', description: 'default' },
  // { id: 5, index: 84, dialingRule: '800xxxxxxx', description: 'default' },
  // { id: 6, index: 85, dialingRule: '80[1-9]xxxxx', description: 'default' },
  // { id: 7, index: 86, dialingRule: '8[1-9]xxxxxx', description: 'default' },
  // { id: 8, index: 87, dialingRule: '[2-3,5-7]xxxxxxx', description: 'default' },
  // { id: 9, index: 88, dialingRule: '1[3-5,7-8]xxxxxxxxx', description: 'default' },
  // { id: 10, index: 89, dialingRule: '100xx', description: 'default' },
  // { id: 11, index: 90, dialingRule: '95xxx', description: 'default' },
  // { id: 12, index: 91, dialingRule: '123xx', description: 'default' },
  // { id: 13, index: 92, dialingRule: '111xx', description: 'default' },
  // { id: 14, index: 93, dialingRule: '11[0,2-9]', description: 'default' },
  // { id: 15, index: 94, dialingRule: '120', description: 'default' },
  // { id: 16, index: 95, dialingRule: '0[3-9]xxxxxxxxxx', description: 'default' },
  // { id: 17, index: 96, dialingRule: '02xxxxxxxxx', description: 'default' },
  // { id: 18, index: 97, dialingRule: '010xxxxxxxx', description: 'default' },
  // { id: 19, index: 98, dialingRule: '01[3-5,7-8]xxxxxxxxx', description: 'default' },
  // { id: 20, index: 99, dialingRule: '.', description: 'default' },
];

/** Dialing rule modal (DialingRulePage) — local table state */
export const DIALING_RULE_FIELD_TOOLTIPS = {
  index:
    "Rule ID (0–99). Required and must be unique.\nSelect from available indices when adding or editing.",
  description:
    "Short label for this rule. Required.\nCannot contain: % & ~ ! | ( ) ; \" ' = \\",
  dialingRule:
    "Dialing pattern matched against dialed digits. Required.\nAllowed: 0–9, A–Z, a–z, '.', '#', '*', '[', ']', ',', '-'.\nLength: 1–128 characters.",
};

