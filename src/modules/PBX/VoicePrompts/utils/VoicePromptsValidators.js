export const validateMohUpload = ({ mohCategoryName, mohFile }) => {
  const trimmedCategory = mohCategoryName.trim();
  if (!trimmedCategory) return "Category is required.";
  if (!mohFile) return "Please select a hold music file.";
  return null;
};

export const validateCustomUpload = ({ customFile }) => {
  if (!customFile) return "Please select a custom prompt file.";
  return null;
};

export const validateRecordPrompt = ({ recordFileName, recordExtension }) => {
  const trimmed = recordFileName.trim();
  if (!trimmed) return "File Name is required.";
  if (!recordExtension) return "Please select an extension.";
  return null;
};
