export function checkFileExt(ext) {
  if (!ext.match(/.wav/i)) {
    return false;
  }
  return true;
}

export function validateColorRingUpload(formData) {
  if (!formData.description || formData.description.trim() === "") {
    return "Please enter a description!";
  }

  const descriptionRegex = /^[^\%\&\~\!\|\(\)\;\"\'\=\\]*$/;
  if (!descriptionRegex.test(formData.description)) {
    return "The description cannot contain special characters like '~', '!', '&', '|' and '='!";
  }

  if (!formData.file) {
    return "Please select a file to upload!";
  }

  const fileExt = formData.file.name
    .substring(formData.file.name.lastIndexOf("."))
    .toLowerCase();
  if (!checkFileExt(fileExt)) {
    return "Only wav files can be uploaded!";
  }

  if (formData.file.size > 200 * 1024) {
    return "The size of the file must be less than 200KB!";
  }

  return null;
}
