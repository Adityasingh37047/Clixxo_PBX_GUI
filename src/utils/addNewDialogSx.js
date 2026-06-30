/**
 * Centered Add New / Edit modal — equal viewport margins, fits below navbar.
 * Use on MUI `<Dialog>` for list-page add/edit forms.
 */

export const ADD_NEW_DIALOG_MARGIN = 24;
/** Navbar + layout chrome; matches `minHeight: calc(100vh - 80px)` on list pages. */
export const ADD_NEW_DIALOG_LAYOUT_OFFSET = 80;

/** Pass to `<Dialog sx={addNewDialogSx}>`. */
export const addNewDialogSx = {
  "& .MuiDialog-container": {
    alignItems: "center",
    justifyContent: "center",
  },
};

/**
 * Wrap modal paper styles so tall forms stay inside the viewport with equal margins.
 * `PaperProps={{ sx: mergeAddNewDialogPaperSx({ width: 560, ... }) }}`
 */
export const mergeAddNewDialogPaperSx = (paperSx = {}) => ({
  margin: ADD_NEW_DIALOG_MARGIN,
  maxHeight: `calc(100vh - ${ADD_NEW_DIALOG_LAYOUT_OFFSET}px - ${ADD_NEW_DIALOG_MARGIN * 2}px)`,
  display: "flex",
  flexDirection: "column",
  ...paperSx,
});
