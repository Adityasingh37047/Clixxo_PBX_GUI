import { useEffect, useRef, useState } from "react";
import { postLinuxCmd } from "../../../../api/apiService";
import {
  MODIFICATION_RECORD_COMMANDS,
  MODIFICATION_RECORD_MESSAGES,
  MODIFICATION_RECORD_TOAST_DEFAULT,
  MODIFICATION_RECORD_TOAST_DURATION_MS,
} from "../../../../constants/ModificationRecordConstants";
import {
  toModificationRecordText,
  triggerAuthLogDownload,
} from "../utils/ModificationRecordTransformers";
import { isModificationRecordUnreadable } from "../utils/ModificationRecordValidators";

export function useModificationRecordPage() {
  const outputRef = useRef(null);
  const [record, setRecord] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(MODIFICATION_RECORD_TOAST_DEFAULT);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(
      () => setToast(MODIFICATION_RECORD_TOAST_DEFAULT),
      MODIFICATION_RECORD_TOAST_DURATION_MS,
    );
  };

  useEffect(() => {
    if (!outputRef.current || !record) return;
    outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [record]);

  const handleCheck = async () => {
    try {
      setLoading(true);
      const response = await postLinuxCmd({
        cmd: MODIFICATION_RECORD_COMMANDS.FETCH_LATEST,
      });
      const logData = toModificationRecordText(response?.responseData);

      if (isModificationRecordUnreadable(logData)) {
        setRecord(MODIFICATION_RECORD_MESSAGES.FILE_UNREADABLE_OR_EMPTY);
      } else {
        setRecord(logData);
      }
    } catch (error) {
      console.error("Error fetching auth.log:", error);
      setRecord(MODIFICATION_RECORD_MESSAGES.FETCH_FAILED);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setLoading(true);
      const response = await postLinuxCmd({
        cmd: MODIFICATION_RECORD_COMMANDS.FETCH_ALL,
      });
      const logData = toModificationRecordText(response?.responseData);

      if (String(logData).includes(MODIFICATION_RECORD_MESSAGES.READ_ERROR)) {
        showToast(MODIFICATION_RECORD_MESSAGES.FILE_UNREADABLE, "error");
        return;
      }

      if (!logData) {
        showToast(MODIFICATION_RECORD_MESSAGES.FILE_EMPTY, "error");
        return;
      }

      triggerAuthLogDownload(logData);
    } catch (error) {
      console.error("Error downloading auth.log:", error);
      showToast(MODIFICATION_RECORD_MESSAGES.DOWNLOAD_FAILED, "error");
    } finally {
      setLoading(false);
    }
  };

  return {
    outputRef,
    record,
    loading,
    toast,
    setToast,
    handleCheck,
    handleDownload,
  };
}
