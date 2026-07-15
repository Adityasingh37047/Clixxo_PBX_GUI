/** Empty Add/Edit command form. */
export const createAccessControlEmptyForm = () => ({
  index: "",
  command: "",
});

/** Next 1-based index string for a new command row. */
export const getNextAccessControlIndex = (commands = []) =>
  (commands.length + 1).toString();

/** Build a command row from form values. */
export const toAccessControlCommandRow = (form) => ({
  index: form.index,
  command: String(form.command || "").trim(),
});

/** Drop selected indices and renumber remaining rows 1..n. */
export const removeAccessControlCommandsByIndices = (
  commands = [],
  selectedIndices = [],
) =>
  commands
    .filter((_, idx) => !selectedIndices.includes(idx))
    .map((cmd, idx) => ({ ...cmd, index: (idx + 1).toString() }));
