import { MODIFICATION_RECORD_MESSAGES } from "../../../../constants/ModificationRecordConstants";

export function isModificationRecordUnreadable(logData) {
  return (
    !logData ||
    String(logData).includes(MODIFICATION_RECORD_MESSAGES.READ_ERROR)
  );
}
