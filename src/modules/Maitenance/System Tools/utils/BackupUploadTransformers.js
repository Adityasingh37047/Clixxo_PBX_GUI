import { BACKUP_UPLOAD_LABELS } from "../../../../constants/BackupUploadConstants";

export function resolveBackupSelectedFile(fileList) {
  const f = fileList?.[0] || null;
  return {
    selectedFile: f,
    fileName: f ? f.name : BACKUP_UPLOAD_LABELS.NO_FILE,
  };
}
