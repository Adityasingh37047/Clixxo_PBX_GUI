export function validateCueToneUpload(file) {
  if (!file) {
    return "Please select a file to upload!";
  }
  const fileExt = file.name
    .substring(file.name.lastIndexOf("."))
    .toLowerCase();
  if (!fileExt.match(/\.wav/i)) {
    return "Only wav files can be uploaded!";
  }
  if (file.size > 200 * 1024) {
    return "File size must be less than 200KB!";
  }
  return null;
}
