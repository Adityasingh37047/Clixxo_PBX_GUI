import {
  SQL_UPLOAD_LABELS,
  SQL_UPLOAD_MESSAGES,
} from "../../../../constants/SqlUploadConstants";

export function resolveSqlUploadFile(fileList) {
  const f = fileList?.[0] || null;
  return {
    file: f,
    fileName: f ? f.name : SQL_UPLOAD_LABELS.noFile,
  };
}

export function getSqlUploadError(file) {
  if (!file) return SQL_UPLOAD_MESSAGES.chooseFileRequired;
  if (!file.name.toLowerCase().endsWith(".sql")) {
    return SQL_UPLOAD_MESSAGES.sqlOnly;
  }
  return "";
}
