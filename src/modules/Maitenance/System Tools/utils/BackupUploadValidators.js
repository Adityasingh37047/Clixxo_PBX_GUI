import {
  BACKUP_UPLOAD_MESSAGES,
  BACKUP_UPLOAD_TAR_FILE_REGEX,
} from "../../../../constants/BackupUploadConstants";

export function validateBackupRestoreFile(selectedFile) {
  if (!selectedFile) {
    return BACKUP_UPLOAD_MESSAGES.SELECT_TAR_FILE;
  }
  if (!BACKUP_UPLOAD_TAR_FILE_REGEX.test(selectedFile.name)) {
    return BACKUP_UPLOAD_MESSAGES.ONLY_TAR_SUPPORTED;
  }
  return "";
}
