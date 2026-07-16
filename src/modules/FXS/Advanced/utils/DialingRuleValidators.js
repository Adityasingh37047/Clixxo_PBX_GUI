export const validateDialingRuleForm = (formData, rules, editIndex) => {
  if (!formData.index || formData.index === "") {
    return "Index is required.";
  }

  const indexNum = parseInt(formData.index, 10);
  if (isNaN(indexNum) || indexNum < 0 || indexNum > 99) {
    return "Index must be between 0 and 99.";
  }

  if (editIndex === null) {
    if (rules.some((r) => r.index === indexNum)) {
      return "Index already exists. Please choose a different index.";
    }
  } else if (rules.some((r, idx) => idx !== editIndex && r.index === indexNum)) {
    return "Index already exists. Please choose a different index.";
  }

  if (!formData.dialingRule || formData.dialingRule.trim() === "") {
    return "Dialing Rule is required.";
  }

  const dialingRuleRegex = /^[0-9A-Za-z.*#\[\]\-,]{1,128}$/;
  if (!dialingRuleRegex.test(formData.dialingRule)) {
    return "The Dialing Rule can consist only of 0~9, A~Z, a-z, '.', '#', '*' and special characters like '[', ']', ',', '-'!";
  }

  if (!formData.description || formData.description.trim() === "") {
    return "Description is required.";
  }

  const descriptionRegex = /^[^\%\&\~\!\|\(\)\;\"\'\=\\]*$/;
  if (!descriptionRegex.test(formData.description)) {
    return "The Description cannot contain special characters like '~', '!', '&', '|' and '='!";
  }

  return null;
};
