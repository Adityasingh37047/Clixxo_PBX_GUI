import { CUE_TONE_FILE_TYPES } from "../../../../constants/CueToneConstants";

export function getCueToneFileTypes() {
  return CUE_TONE_FILE_TYPES;
}

export function transformFileChange(file) {
  if (file) {
    return { fileName: file.name, file };
  }
  return { fileName: "No file chosen", file: null };
}

export function resetCueToneForm(initialForm) {
  return { ...initialForm };
}
