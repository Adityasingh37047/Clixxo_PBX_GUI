export const ACCOUNT_MANAGE_TABLE_COLUMNS = [
  { key: "choose", label: "Choose" },
  { key: "id", label: "Id" },
  { key: "username", label: "Username" },
  { key: "authority", label: "Authority" },
  { key: "modify", label: "Modify" },
];

export const ACCOUNT_MANAGE_MODAL_FIELDS = [
  { name: "index", label: "Index", type: "text", disabled: true },
  { name: "userName", label: "User Name", type: "text" },
  { name: "password", label: "Password", type: "password" },
  {
    name: "authority",
    label: "Authority",
    type: "select",
    options: [
      { value: "Read", label: "Read" },
      { value: "Read, Write", label: "Read, Write" },
    ],
  },
];

export const ACCOUNT_MANAGE_INITIAL_FORM = {
  index: "",
  userName: "",
  password: "",
  authority: "Read, Write",
};

export const ACCOUNT_MANAGE_BUTTONS = {
  addNew: "Add New",
  save: "Save",
  close: "Close",
  checkAll: "CheckAll",
  uncheckAll: "UncheckAll",
  inverse: "Inverse",
  delete: "Delete",
  clearAll: "ClearAll",
};
