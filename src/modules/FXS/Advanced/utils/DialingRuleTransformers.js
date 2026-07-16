export const getAvailableIndices = (rules, currentEditIndex = null) => {
  const currentIndex =
    currentEditIndex !== null && rules[currentEditIndex]
      ? rules[currentEditIndex].index
      : null;
  const usedIndices = rules
    .map((rule, idx) =>
      currentEditIndex !== null && idx === currentEditIndex ? null : rule.index,
    )
    .filter((idx) => idx !== null && idx !== undefined);
  return Array.from({ length: 100 }, (_, i) => i)
    .filter((idx) => !usedIndices.includes(idx) || idx === currentIndex)
    .map((idx) => ({ value: String(idx), label: String(idx) }));
};

export const buildDialingRuleItem = (formData, editIndex, rules) => ({
  ...formData,
  index: parseInt(formData.index, 10),
  id: editIndex !== null ? rules[editIndex].id : Date.now(),
});

export const normalizeDialingRuleForm = (item) => ({
  index: String(item.index),
  description: item.description || "default",
  dialingRule: item.dialingRule || "",
});

export const getFirstAvailableIndex = (rules) => {
  const available = getAvailableIndices(rules);
  return available.length > 0 ? available[0].value : "0";
};
